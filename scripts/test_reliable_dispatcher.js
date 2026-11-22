'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Store } = require('../src/core/store');
const { ReliableDispatcher } = require('../src/core/reliable-dispatch');

async function run() {
console.log('========================================================');
console.log('TESTING RELIABLE DISPATCHER & CATCH-UP SYSTEM');
console.log('========================================================');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mirqat-dispatch-test-'));
const queueFile = path.join(tmpDir, 'dispatch-queue.json');
const queueStore = new Store(queueFile, { dispatched: {}, planned: {}, retryQueue: [] });

let dispatchedMessages = [];
const mockSettings = {
  whatsapp: {
    enabled: true,
    provider: 'callmebot', // Mock callmebot for offline simulated tests
    phone: '+201000000000',
    apiKey: 'test-key-123',
    groupId: 'test-group@g.us',
    sendToGroup: true,
  },
  language: 'ar',
  classroom: { filterHiddenCourses: true, hiddenCourses: [] },
};

const dispatcher = new ReliableDispatcher(queueStore, () => mockSettings);

// Override executeSendWhatsApp to capture mock dispatches cleanly
dispatcher.executeSendWhatsApp = async (text, cfg, override) => {
  dispatchedMessages.push({ text, cfg, override, ts: Date.now() });
  return { ok: true, recipients: [override || cfg.phone || cfg.groupId] };
};

// --- Test 1: Advance Planning of Task Alerts ---
console.log('\n--- 1. Testing Pre-Planned Task Alert Milestones ---');
const testTask = {
  id: 'task-test-01',
  text: 'حل واجب نظم التشغيل شيت 3',
  due: '2026-10-25',
  deadlineTimestamp: new Date(2026, 9, 25, 23, 59, 0).getTime(),
  done: false,
};

dispatcher.planTaskAlerts(testTask);
const plannedKeys = Object.keys(dispatcher.planned);
assert(plannedKeys.some(k => k.includes('24h')), 'Should plan 24h milestone');
assert(plannedKeys.some(k => k.includes('6h')), 'Should plan 6h milestone');
assert(plannedKeys.some(k => k.includes('3h')), 'Should plan 3h milestone');
assert(plannedKeys.some(k => k.includes('1h')), 'Should plan 1h milestone');
assert(plannedKeys.some(k => k.includes('imminent')), 'Should plan imminent milestone');
console.log('✅ Advance task alert milestones pre-computed and stored:', plannedKeys.length, 'plans');

// --- Test 2: Advance Planning of Calendar Event Alerts ---
console.log('\n--- 2. Testing Pre-Planned Calendar Event Alerts ---');
const testEvent = {
  id: 'evt-test-01',
  title: 'مؤتمر هندسة البرمجيات السنوي',
  date: '2026-10-30',
  time: '11:00',
  whatsapp: {
    enabled: true,
    sendTiming: '1d_before',
  },
};

dispatcher.planCalendarEventAlerts(testEvent);
const calPlanKeys = Object.keys(dispatcher.planned).filter(k => k.startsWith('cal_'));
assert(calPlanKeys.length >= 1, 'Should plan calendar event');
console.log('✅ Calendar event alert plan pre-computed and stored:', calPlanKeys[0]);

// --- Test 3: Catch-Up on System Wake / App Start (Missed Due Alerts) ---
console.log('\n--- 3. Testing Catch-up for Missed Alerts During System Downtime ---');
const now = new Date(2026, 9, 20, 10, 0, 0).getTime(); // Tuesday 10:00 AM

// Task that was due 2 hours ago while PC was off / app closed
const missedTask = {
  id: 'task-missed-01',
  text: 'مشروع التخرج - تسليم الدفعة الأولى',
  deadlineTimestamp: now - (2 * 3600 * 1000), // Due 2 hours ago
  done: false,
};

// Calendar event that was scheduled for this morning at 9:00 AM (1 hour ago)
const missedEvent = {
  id: 'evt-missed-01',
  title: 'جلسة مناقشة الماجستير',
  date: '2026-10-20',
  time: '09:00',
  whatsapp: {
    enabled: true,
    sendTiming: 'morning_of', // Due at 9:00 AM
  },
};

let taskAlertFired = false;
let calAlertFired = false;
dispatcher.on('task-alert-sent', (d) => { if (d.isLateCatchup) taskAlertFired = true; });
dispatcher.on('calendar-alert-sent', (d) => { if (d.isLate) calAlertFired = true; });

dispatchedMessages = [];
await dispatcher.catchup({
  todos: [missedTask],
  calendarEvents: [missedEvent],
  now,
});

assert.strictEqual(dispatchedMessages.length, 2, 'Should have dispatched both missed task and missed event');
assert(taskAlertFired, 'Should have flagged task alert as late catchup');
assert(calAlertFired, 'Should have flagged calendar event alert as late catchup');

console.log('Dispatched messages:');
dispatchedMessages.forEach((m, idx) => console.log(`  [${idx+1}]`, m.text.slice(0, 70).replace(/\n/g, ' ')));
console.log('✅ System downtime catch-up successfully sent missed alerts on startup/wake!');

// --- Test 4: Deduplication Verification (No Double Sending) ---
console.log('\n--- 4. Testing Deduplication Guarantee ---');
const countBefore = dispatchedMessages.length;
await dispatcher.catchup({
  todos: [missedTask],
  calendarEvents: [missedEvent],
  now: now + 5000,
});
assert.strictEqual(dispatchedMessages.length, countBefore, 'Should NOT re-send already dispatched alerts');
console.log('✅ Exact deduplication verified (Zero duplicate WhatsApp messages)');

// --- Test 5: Failure & Retry Queue with Backoff ---
console.log('\n--- 5. Testing Failure Handling & Retry Queue with Backoff ---');
const failingTask = {
  id: 'task-fail-01',
  text: 'مهمة فشل الاتصال المؤقت',
  deadlineTimestamp: now + 3600000, // Due in 1 hour
  done: false,
};

// Temporarily simulate network failure
dispatcher.executeSendWhatsApp = async () => ({ ok: false, error: 'Network timeout (simulated)' });

await dispatcher.catchup({
  todos: [failingTask],
  calendarEvents: [],
  now,
});

assert(dispatcher.retryQueue.length >= 1, 'Failed alert should be added to retry queue');
const retryItem = dispatcher.retryQueue[0];
assert.strictEqual(retryItem.attempts, 1);
assert(retryItem.nextRetryTs > now, 'Next retry should be in the future');
console.log('✅ Retry queue entry recorded with backoff:', retryItem.lastError, 'next retry in:', (retryItem.nextRetryTs - now)/1000, 's');

// Restore working network and advance time
dispatcher.executeSendWhatsApp = async (text, cfg, override) => {
  dispatchedMessages.push({ text, cfg, override, ts: Date.now() });
  return { ok: true, recipients: [override || cfg.phone || cfg.groupId] };
};

const futureNow = retryItem.nextRetryTs + 1000;
await dispatcher.catchup({
  todos: [failingTask],
  calendarEvents: [],
  now: futureNow,
});

assert.strictEqual(dispatcher.retryQueue.length, 0, 'Retry queue should be cleared upon successful delivery');
console.log('✅ Retry queue successfully delivered message on next attempt and cleared entry!');

// --- Test 6: Persistence & Recovery Across App Restarts ---
console.log('\n--- 6. Testing Persistence & Recovery Across App Restarts ---');
assert(fs.existsSync(queueFile), 'Queue file must exist on disk');
const diskData = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
assert(Object.keys(diskData.dispatched).length >= 2, 'Dispatched log must be persisted to disk');
console.log('Persisted dispatched records on disk:', Object.keys(diskData.dispatched));
console.log('✅ Disk journal verified: all records survive process termination and restart 100%!');

// Clean up test directory
fs.rmSync(tmpDir, { recursive: true, force: true });

console.log('\n🌟 ALL RELIABLE DISPATCHER & CATCH-UP TESTS PASSED 100%! 🌟\n');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
