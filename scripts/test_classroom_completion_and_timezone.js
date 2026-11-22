'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  ClassroomEngine,
  parseClassroomDeadline,
  toLocalDateString,
  parseIcsFeed,
} = require('../src/core/classroom');

console.log('========================================================');
console.log('TESTING GOOGLE CLASSROOM COMPLETION & TIMEZONE FIXES');
console.log('========================================================\n');

// -----------------------------------------------------------------------------
// 1. Timezone & Due Date Accuracy
// -----------------------------------------------------------------------------
console.log('--- 1. Testing Due Date & Timezone Accuracy ---');

// Test 1.1: Exact UTC time parsing
const deadlineWithTime = parseClassroomDeadline({ year: 2026, month: 10, day: 26 }, { hours: 18, minutes: 30 });
assert.strictEqual(deadlineWithTime, Date.UTC(2026, 9, 26, 18, 30, 0), 'Should parse exact UTC timestamp');

// Test 1.2: End of day default
const deadlineDefault = parseClassroomDeadline({ year: 2026, month: 10, day: 26 });
assert.strictEqual(deadlineDefault, Date.UTC(2026, 9, 26, 23, 59, 0), 'Should default to 23:59 UTC');

// Test 1.3: ICS Feed Parsing for UTC, Local, and Date-only
const icsPayload = `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:utc_event
SUMMARY:Assignment UTC
DTEND:20261026T183000Z
URL:https://classroom.google.com/c/1/a/1
END:VEVENT
BEGIN:VEVENT
UID:local_event
SUMMARY:Assignment Local
DTEND:20261026T200000
URL:https://classroom.google.com/c/1/a/2
END:VEVENT
BEGIN:VEVENT
UID:date_only_event
SUMMARY:Assignment Date Only
DTEND:20261026
URL:https://classroom.google.com/c/1/a/3
END:VEVENT
END:VCALENDAR`;

const icsEvents = parseIcsFeed(icsPayload);
assert.strictEqual(icsEvents.length, 3, 'Should parse all 3 ICS events');
assert.strictEqual(icsEvents[0].dtend, Date.UTC(2026, 9, 26, 18, 30, 0), 'UTC date parsed correctly');
const localExpected = new Date(2026, 9, 26, 20, 0, 0).getTime();
assert.strictEqual(icsEvents[1].dtend, localExpected, 'Local date parsed as local time without shifting');
const dateOnlyExpected = new Date(2026, 9, 26, 23, 59, 59).getTime();
assert.strictEqual(icsEvents[2].dtend, dateOnlyExpected, 'Date-only parsed to end of local day');
console.log('✓ Timezone and ICS date formats verified successfully.');

// -----------------------------------------------------------------------------
// 2. Submission Guard & canMarkDone
// -----------------------------------------------------------------------------
console.log('\n--- 2. Testing canMarkDone Guard Rules ---');
const engine = new ClassroomEngine();

// Non-classroom task: always allowed
assert.strictEqual(engine.canMarkDone({ id: 't1', text: 'Normal task' }).allowed, true);

// Classroom unsubmitted task without manual completion: rejected
const unsubmitted = {
  id: 'cr_1_1',
  classroom: { courseName: 'Math', state: 'NEW', alternateLink: 'https://classroom.google.com' },
};
assert.strictEqual(engine.canMarkDone(unsubmitted).allowed, false);

// Classroom task marked manually by user: allowed!
const manuallyDone = {
  id: 'cr_1_2',
  done: true,
  doneManually: true,
  classroom: { courseName: 'Math', state: 'NEW' },
};
assert.strictEqual(engine.canMarkDone(manuallyDone).allowed, true, 'User manual completion must be allowed');

// Classroom task with TURNED_IN or RETURNED: allowed
assert.strictEqual(engine.canMarkDone({ classroom: { state: 'TURNED_IN' } }).allowed, true);
assert.strictEqual(engine.canMarkDone({ classroom: { state: 'RETURNED' } }).allowed, true);

// Classroom task graded (assignedGrade or draftGrade): allowed
assert.strictEqual(engine.canMarkDone({ classroom: { state: 'NEW', assignedGrade: 100 } }).allowed, true);
assert.strictEqual(engine.canMarkDone({ classroom: { state: 'NEW', draftGrade: 95 } }).allowed, true);
console.log('✓ canMarkDone guard rules verified.');

// -----------------------------------------------------------------------------
// 3. Sync Persistence & Non-Reversion
// -----------------------------------------------------------------------------
console.log('\n--- 3. Testing Sync State Synchronization & Non-Reversion ---');

// Mock engine with dummy coursework and submission
class MockClassroomEngine extends ClassroomEngine {
  constructor(workList, submissionMap) {
    super();
    this.workList = workList;
    this.submissionMap = submissionMap;
  }
  config() {
    return { enabled: true, accessToken: 'dummy_token' };
  }
  async getCourses() {
    return [{ id: 'course_101', name: 'Operating Systems' }];
  }
  async getCourseWork(courseId) {
    return this.workList;
  }
  async getSubmission(courseId, workId) {
    return this.submissionMap[workId] || null;
  }
}

const mockWorks = [
  {
    id: 'w1',
    title: 'Sheet 1',
    description: 'CPU Scheduling Assignment',
    dueDate: { year: 2026, month: 10, day: 26 },
    dueTime: { hours: 23, minutes: 59 }, // Classroom default end of day
  },
  {
    id: 'w2',
    title: 'Sheet 2',
    description: 'Paging Assignment',
    dueDate: { year: 2026, month: 10, day: 27 },
    dueTime: { hours: 14, minutes: 0 },
  },
];

// w1 submission state is NEW on classroom, but user already checked it done in Mirqat!
const mockSubmissions = {
  w1: { id: 's1', state: 'NEW' },
  w2: { id: 's2', state: 'TURNED_IN' },
};

const mockEngine = new MockClassroomEngine(mockWorks, mockSubmissions);

// Initial state: user has w1 already marked done manually
const initialItems = [
  {
    id: 'cr_course_101_w1',
    text: '[Operating Systems] Sheet 1',
    done: true,
    doneManually: true,
    doneAt: Date.now() - 5000,
    due: '2026-10-26',
    classroom: {
      courseId: 'course_101',
      courseWorkId: 'w1',
      state: 'NEW',
    },
  },
];

(async () => {
  const syncRes = await mockEngine.sync(initialItems);
  assert.strictEqual(syncRes.ok, true, 'Sync should succeed');

  const syncedW1 = syncRes.items.find((t) => t.id === 'cr_course_101_w1');
  assert.ok(syncedW1, 'w1 should be present in items');
  // CRITICAL ASSERTION: Sync must NEVER revert w1.done to false!
  assert.strictEqual(syncedW1.done, true, 'w1 must STAY done even if Classroom API submission state is NEW!');
  assert.strictEqual(syncedW1.due, '2026-10-26', 'w1 due date must be preserved as 2026-10-26 without shifting');

  const syncedW2 = syncRes.items.find((t) => t.id === 'cr_course_101_w2');
  assert.ok(syncedW2, 'w2 should be added');
  assert.strictEqual(syncedW2.done, true, 'w2 should be done because state was TURNED_IN');
  console.log('✓ Sync non-reversion and date preservation verified.');

  // -----------------------------------------------------------------------------
  // 4. Verification of HTML Modal & Buttons
  // -----------------------------------------------------------------------------
  console.log('\n--- 4. Testing todo.html Modal UI Elements ---');
  const todoHtml = fs.readFileSync(path.join(__dirname, '../windows/todo.html'), 'utf8');
  assert.ok(todoHtml.includes('id="crModalMarkDone"'), 'todo.html must contain #crModalMarkDone button');
  assert.ok(todoHtml.includes('id="crModalSync"'), 'todo.html must contain #crModalSync button');
  assert.ok(todoHtml.includes('id="crModalOpen"'), 'todo.html must contain #crModalOpen button');
  assert.ok(todoHtml.includes('id="crModalClose"'), 'todo.html must contain #crModalClose button');
  console.log('✓ todo.html modal actions verified.');

  // -----------------------------------------------------------------------------
  // 5. Verification of task.html crDeadline Display
  // -----------------------------------------------------------------------------
  console.log('\n--- 5. Testing task.html & task.js Deadline Display ---');
  const taskHtml = fs.readFileSync(path.join(__dirname, '../windows/task.html'), 'utf8');
  assert.ok(taskHtml.includes('id="crDeadline"'), 'task.html must contain #crDeadline');

  const taskJs = fs.readFileSync(path.join(__dirname, '../windows/js/task.js'), 'utf8');
  assert.ok(taskJs.includes('deadlineEl.textContent = `📅 موعد التسليم: ${whenLabel(dt.getTime())}`'), 'task.js must render deadline label with time');
  console.log('✓ task.html & task.js deadline display verified.');

  // -----------------------------------------------------------------------------
  // 6. Verification of todo.js Unified Due Badge & Reminder Prefix
  // -----------------------------------------------------------------------------
  console.log('\n--- 6. Testing todo.js Unified Badges & Reminders ---');
  const todoJs = fs.readFileSync(path.join(__dirname, '../windows/js/todo.js'), 'utf8');
  assert.ok(todoJs.includes('dueLabel(task.due || task.classroom?.deadlineTimestamp, task.done)'), 'todo.js must evaluate dueLabel for classroom tasks');
  assert.ok(todoJs.includes('const remLabel = `${t(\'todo.reminder\')}: ${whenLabel(next)}`'), 'todo.js must prefix reminders with "تذكير:"');
  assert.ok(todoJs.includes('pendingModalTask.doneManually = true'), 'todo.js must set doneManually when user completes via modal');
  console.log('✓ todo.js unified badges and reminder prefix verified.');

  console.log('\n========================================================');
  console.log('🎉 ALL CLASSROOM COMPLETION & TIMEZONE TESTS PASSED 100%!');
  console.log('========================================================\n');
})();
