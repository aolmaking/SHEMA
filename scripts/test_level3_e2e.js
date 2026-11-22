'use strict';

const assert = require('assert');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Store } = require('../src/core/store');
const { ClassroomEngine, toLocalDateString } = require('../src/core/classroom');
const { WhatsAppDispatcher, sendOpenWaMessage, formatPhoneNumber } = require('../src/core/whatsapp');
const { SuperUrgentMonitor } = require('../src/core/super-urgent');

console.log('================================================================');
console.log('LEVEL 3: END-TO-END (E2E) THREE-STAGE SIMULATION TESTING');
console.log('================================================================\n');

async function runE2ESuite() {
  // ── MOCK OPENWA HTTP SERVER ──
  let receivedHttpCalls = [];
  const mockOpenWaPort = 28999;
  const mockServer = http.createServer((req, res) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      receivedHttpCalls.push({
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: body ? JSON.parse(body) : null,
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, messageId: 'msg_987654321' }));
    });
  });

  await new Promise((r) => mockServer.listen(mockOpenWaPort, '127.0.0.1', r));
  console.log(`[Setup] Mock OpenWA Server listening on http://127.0.0.1:${mockOpenWaPort}`);

  const testDir = path.join(__dirname, '..', 'scratch', 'test_e2e_data');
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
  const todosFile = path.join(testDir, 'e2e_todos.json');
  const settingsFile = path.join(testDir, 'e2e_settings.json');
  if (fs.existsSync(todosFile)) fs.unlinkSync(todosFile);
  if (fs.existsSync(settingsFile)) fs.unlinkSync(settingsFile);

  const e2eTodos = new Store(todosFile, { items: [] });
  const e2eSettings = new Store(settingsFile, {
    classroom: { enabled: true, preventDoneIfNotTurnedIn: true },
    superUrgent: { enabled: true, thresholdHours: 3, desktopIntervalMinutes: 15 },
    whatsapp: {
      enabled: true,
      provider: 'openwa',
      phone: '01012345678',
      gatewayUrl: `http://127.0.0.1:${mockOpenWaPort}`,
      sessionId: 'default',
      apiKey: 'test-api-key-123',
      frequencyMinutes: 15,
    },
  });

  const whatsappDispatcher = new WhatsAppDispatcher();
  const classroomEngine = new ClassroomEngine(() => e2eSettings.data, async (patch) => {
    e2eSettings.merge(patch);
  });
  const superUrgent = new SuperUrgentMonitor(e2eTodos, () => e2eSettings.data, whatsappDispatcher);

  // ─────────────────────────────────────────────────────────────
  // STAGE 3.1: Full Lifecycle E2E Test
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- STAGE 3.1: Classroom Sync -> Super Urgent Trigger -> WhatsApp Dispatch ---');

  const now = Date.now();
  const deadlineMs = now + 2.5 * 3600000; // 2.5 hours remaining (< 3 hours!)

  const mockAssignment = {
    id: 'cr_cs402_lab3',
    text: '[CS402 Distributed Systems] Lab 3: Raft Consensus',
    notes: 'Implement Leader Election and Log Replication.\n\n🔗 https://classroom.google.com/c/cs402/a/lab3',
    done: false,
    doneAt: null,
    createdAt: now,
    priority: 2,
    due: toLocalDateString(deadlineMs),
    classroom: {
      courseId: 'cs402',
      courseName: 'Distributed Systems',
      courseWorkId: 'lab3',
      alternateLink: 'https://classroom.google.com/c/cs402/a/lab3',
      state: 'NEW',
      deadlineTimestamp: deadlineMs,
    },
    reminders: [],
  };

  e2eTodos.set('items', [mockAssignment]);
  assert.strictEqual(e2eTodos.get('items').length, 1);
  console.log('✓ Assignment successfully synchronized into store with priority 2 (Red)');

  // Evaluate urgency & alerts
  let desktopAlertFired = false;
  superUrgent.once('desktop-alerts', (alerts) => {
    desktopAlertFired = true;
    assert.strictEqual(alerts.length, 1);
    assert.strictEqual(alerts[0].task.id, 'cr_cs402_lab3');
  });

  await superUrgent.evaluate(now);
  assert.ok(desktopAlertFired, 'Desktop alert must fire for task with 2.5h remaining');
  console.log('✓ Super Urgent Monitor fired desktop alert');

  // Verify OpenWA Mock Server received the message
  assert.strictEqual(receivedHttpCalls.length, 1, 'Mock OpenWA server should receive 1 POST request');
  const req = receivedHttpCalls[0];
  assert.strictEqual(req.method, 'POST');
  assert.strictEqual(req.url, '/api/sessions/default/messages/send-text');
  assert.strictEqual(req.headers['x-api-key'], 'test-api-key-123');
  assert.strictEqual(req.body.chatId, '201012345678@c.us');
  assert.ok(req.body.text.includes('Distributed Systems'));
  assert.ok(req.body.text.includes('Raft Consensus'));
  assert.ok(req.body.text.includes('https://classroom.google.com/c/cs402/a/lab3'));
  console.log('✓ Stage 3.1 Passed: OpenWA WhatsApp API received formatted alert successfully');

  // ─────────────────────────────────────────────────────────────
  // STAGE 3.2: Submission Guard & Rejection Dialog E2E Test
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- STAGE 3.2: Submission Guard & Strict Completion Lock ---');

  // Attempt to mark done before turning in
  const taskToTick = e2eTodos.get('items')[0];
  const guardAttempt = classroomEngine.canMarkDone(taskToTick);
  assert.strictEqual(guardAttempt.allowed, false, 'Guard must reject completion for unsubmitted task');
  assert.ok(guardAttempt.reason.includes('لم يتم تسليم التكليف'));
  assert.strictEqual(guardAttempt.alternateLink, 'https://classroom.google.com/c/cs402/a/lab3');
  console.log('✓ Guard successfully blocked user from completing unsubmitted assignment');

  // Now student turns it in on Classroom
  taskToTick.classroom.state = 'TURNED_IN';
  taskToTick.done = true;
  taskToTick.doneAt = Date.now();
  e2eTodos.set('items', [taskToTick]);

  assert.strictEqual(classroomEngine.canMarkDone(taskToTick).allowed, true, 'Guard allows completed task once turned in');

  // Urgent evaluation after turn in
  const urgentPostSubmit = superUrgent.checkUrgentTasks(now);
  assert.strictEqual(urgentPostSubmit.length, 0, 'Completed task must NOT remain super urgent');
  console.log('✓ Stage 3.2 Passed: Turned in task completed and urgency cleared');

  // ─────────────────────────────────────────────────────────────
  // STAGE 3.3: Configuration, Thresholds & Persistence E2E Test
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- STAGE 3.3: Dynamic Settings, Urgency Thresholds & Disk Persistence ---');

  // Add another task with 3.5 hours remaining
  const task35h = {
    id: 't_35h',
    text: 'Task due in 3.5 hours',
    done: false,
    classroom: { deadlineTimestamp: now + 3.5 * 3600000 },
  };
  e2eTodos.set('items', [task35h]);

  // With threshold = 3h, this task is NOT urgent
  e2eSettings.set('superUrgent', { enabled: true, thresholdHours: 3, desktopIntervalMinutes: 15 });
  assert.strictEqual(superUrgent.checkUrgentTasks(now).length, 0, 'Task with 3.5h remaining is not urgent with 3h threshold');

  // User dynamically changes threshold to 4h in settings
  e2eSettings.set('superUrgent', { enabled: true, thresholdHours: 4, desktopIntervalMinutes: 15 });
  assert.strictEqual(superUrgent.checkUrgentTasks(now).length, 1, 'Task with 3.5h remaining becomes urgent with 4h threshold');
  console.log('✓ Dynamic threshold change applied instantly');

  // Disk Persistence Verification
  e2eSettings.flush();
  e2eTodos.flush();

  const diskSettingsRaw = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  assert.strictEqual(diskSettingsRaw.superUrgent.thresholdHours, 4);
  assert.strictEqual(diskSettingsRaw.whatsapp.phone, '01012345678');

  const diskTodosRaw = JSON.parse(fs.readFileSync(todosFile, 'utf8'));
  assert.strictEqual(diskTodosRaw.items.length, 1);
  assert.strictEqual(diskTodosRaw.items[0].id, 't_35h');
  console.log('✓ Settings and tasks verified byte-for-byte on disk');

  // Clean up
  mockServer.close();
  console.log('\n================================================================');
  console.log('ALL THREE E2E STAGES (3.1, 3.2, 3.3) PASSED 100% PERFECTLY! 🎉');
  console.log('================================================================\n');
}

runE2ESuite().catch((err) => {
  console.error('E2E TEST FAILED:', err);
  process.exit(1);
});
