'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { Store } = require('../src/core/store');
const { ClassroomEngine, parseClassroomDeadline, toLocalDateString } = require('../src/core/classroom');
const { WhatsAppDispatcher, formatPhoneNumber, buildSuperUrgentMessage } = require('../src/core/whatsapp');
const { SuperUrgentMonitor } = require('../src/core/super-urgent');

console.log('========================================================');
console.log('LEVEL 2: INTEGRATED TESTING (Cross-Module Verification)');
console.log('========================================================\n');

// 1. Setup isolated test store in temp path
const testDataDir = path.join(__dirname, '..', 'scratch', 'test_data');
if (!fs.existsSync(testDataDir)) fs.mkdirSync(testDataDir, { recursive: true });
const testTodosPath = path.join(testDataDir, 'todos_integration.json');
if (fs.existsSync(testTodosPath)) fs.unlinkSync(testTodosPath);

const testTodos = new Store(testTodosPath, { items: [] });
let testSettings = {
  classroom: {
    enabled: true,
    preventDoneIfNotTurnedIn: true,
  },
  superUrgent: {
    enabled: true,
    thresholdHours: 3,
    desktopIntervalMinutes: 15,
  },
  whatsapp: {
    enabled: true,
    phone: '01012345678',
    gatewayUrl: 'http://localhost:2785',
    frequencyMinutes: 15,
  },
};

const classroomEngine = new ClassroomEngine(() => testSettings, async (patch) => {
  Object.assign(testSettings.classroom, patch.classroom || {});
});

const whatsappDispatcher = new WhatsAppDispatcher();
const superUrgentMonitor = new SuperUrgentMonitor(testTodos, () => testSettings, whatsappDispatcher);

// 2. Integration Test: Classroom Coursework Import
console.log('[Step 1] Simulating Classroom CourseWork & Submissions Sync...');
const now = Date.now();
const deadlineUrgent = now + 2 * 3600000; // 2 hours from now
const deadlineFuture = now + 5 * 86400000; // 5 days from now

const mockClassroomItems = [
  {
    id: 'cr_cs101_sheet1',
    text: '[CS101 Operating Systems] Sheet 1: CPU Scheduling',
    notes: 'Please submit your PDF solution.\n\n🔗 https://classroom.google.com/c/cs101/a/sheet1',
    done: false,
    doneAt: null,
    createdAt: now,
    priority: 2,
    due: toLocalDateString(deadlineUrgent),
    classroom: {
      courseId: 'cs101',
      courseName: 'Operating Systems',
      courseWorkId: 'sheet1',
      alternateLink: 'https://classroom.google.com/c/cs101/a/sheet1',
      state: 'NEW', // Not submitted!
      deadlineTimestamp: deadlineUrgent,
    },
    reminders: [
      { id: 'r1', at: deadlineUrgent - 3600000, fired: false },
    ],
  },
  {
    id: 'cr_cs101_sheet2',
    text: '[CS101 Operating Systems] Sheet 2: Memory Management',
    notes: 'Submitted on Classroom.\n\n🔗 https://classroom.google.com/c/cs101/a/sheet2',
    done: true,
    doneAt: now - 3600000,
    createdAt: now - 86400000,
    priority: 2,
    due: toLocalDateString(deadlineFuture),
    classroom: {
      courseId: 'cs101',
      courseName: 'Operating Systems',
      courseWorkId: 'sheet2',
      alternateLink: 'https://classroom.google.com/c/cs101/a/sheet2',
      state: 'TURNED_IN', // Already submitted!
      deadlineTimestamp: deadlineFuture,
    },
    reminders: [],
  },
];

testTodos.set('items', mockClassroomItems);
assert.strictEqual(testTodos.get('items').length, 2, 'Two tasks should be stored');
console.log('✓ Step 1 Passed: Tasks stored with rich Classroom metadata');

// 3. Integration Test: Strict Guard on Done Toggle
console.log('[Step 2] Testing Submission Guard on Done Checkbox...');
const unsubmittedTask = testTodos.get('items').find((t) => t.id === 'cr_cs101_sheet1');
assert.ok(unsubmittedTask);

// Simulate user attempting to mark task done
const guardCheck = classroomEngine.canMarkDone(unsubmittedTask);
assert.strictEqual(guardCheck.allowed, false, 'Should reject completion for unsubmitted task');
assert.ok(guardCheck.reason.includes('لم يتم تسليم التكليف'), 'Rejection message must be present');
assert.strictEqual(guardCheck.alternateLink, 'https://classroom.google.com/c/cs101/a/sheet1');
console.log('✓ Step 2 Passed: Strict guard correctly blocked unsubmitted task completion');

// 4. Integration Test: Super Urgent Monitor Threshold Detection
console.log('[Step 3] Testing Super Urgent Monitor Detection (< 3 Hours)...');
const urgentList = superUrgentMonitor.checkUrgentTasks(now);
assert.strictEqual(urgentList.length, 1, 'Only Sheet 1 (2 hours left) should be super urgent');
assert.strictEqual(urgentList[0].task.id, 'cr_cs101_sheet1');
assert.ok(urgentList[0].msRemaining <= 3 * 3600000);
console.log('✓ Step 3 Passed: Super Urgent task detected within 3-hour window');

// 5. Integration Test: WhatsApp Message Generation & Throttling
console.log('[Step 4] Testing WhatsApp Dispatcher Payload & Throttling...');
const waMsg = buildSuperUrgentMessage(unsubmittedTask, deadlineUrgent);
assert.ok(waMsg.includes('Operating Systems'));
assert.ok(waMsg.includes('CPU Scheduling'));
assert.ok(waMsg.includes('https://classroom.google.com/c/cs101/a/sheet1'));

const targetPhone = formatPhoneNumber(testSettings.whatsapp.phone);
assert.strictEqual(targetPhone, '201012345678@c.us', 'Phone number formatted for OpenWA');

assert.strictEqual(whatsappDispatcher.shouldSend(unsubmittedTask.id, 15), true);
whatsappDispatcher.recordSent(unsubmittedTask.id);
assert.strictEqual(whatsappDispatcher.shouldSend(unsubmittedTask.id, 15), false, 'Should throttle subsequent send within 15 mins');
console.log('✓ Step 4 Passed: WhatsApp payload generated and rate-limited successfully');

// 6. Integration Test: Task Submitted on Classroom -> Auto Cleared from Urgency
console.log('[Step 5] Simulating Student Submitting on Classroom & State Refresh...');
// Student submits on Classroom
unsubmittedTask.classroom.state = 'TURNED_IN';
unsubmittedTask.done = true;
unsubmittedTask.doneAt = Date.now();
testTodos.set('items', [unsubmittedTask, mockClassroomItems[1]]);

// Now check if guard allows it
assert.strictEqual(classroomEngine.canMarkDone(unsubmittedTask).allowed, true, 'Guard allows completed task');

// Super urgent monitor evaluation
const postSubmitUrgent = superUrgentMonitor.checkUrgentTasks(now);
assert.strictEqual(postSubmitUrgent.length, 0, 'No tasks should remain super urgent once submitted');
console.log('✓ Step 5 Passed: Submitted task cleared from urgency cleanly');

console.log('\n========================================================');
console.log('LEVEL 2 INTEGRATED TESTS COMPLETED 100% SUCCESSFULLY! 🎉');
console.log('========================================================\n');
