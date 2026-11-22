'use strict';

const assert = require('assert');
const { SuperUrgentMonitor, getTaskDeadline } = require('../src/core/super-urgent');

console.log('Testing Super Urgent Module (Unit Tests)...');

// 1. getTaskDeadline tests
const tWithClassroom = {
  id: 't1',
  classroom: { deadlineTimestamp: 1792000000000 },
};
assert.strictEqual(getTaskDeadline(tWithClassroom), 1792000000000);

const tWithDue = {
  id: 't2',
  due: '2026-10-15',
};
const dueDeadline = getTaskDeadline(tWithDue);
assert.ok(dueDeadline > 0);
assert.strictEqual(new Date(dueDeadline).getFullYear(), 2026);
assert.strictEqual(new Date(dueDeadline).getMonth(), 9);
assert.strictEqual(new Date(dueDeadline).getDate(), 15);
console.log('✓ getTaskDeadline passed all assertions');

// 2. checkUrgentTasks threshold tests
const mockStore = {
  items: [],
  get: () => mockStore.items,
};

const mockSettings = {
  superUrgent: {
    enabled: true,
    thresholdHours: 3,
    desktopIntervalMinutes: 15,
  },
};

const monitor = new SuperUrgentMonitor(mockStore, () => mockSettings);

const now = Date.now();
// Task 1: deadline in 2 hours -> SHOULD be urgent!
const urgentTask = {
  id: 'u1',
  text: 'عاجل جداً',
  done: false,
  classroom: { deadlineTimestamp: now + 2 * 3600000 },
};

// Task 2: deadline in 5 hours -> NOT urgent
const nonUrgentTask = {
  id: 'u2',
  text: 'غير عاجل',
  done: false,
  classroom: { deadlineTimestamp: now + 5 * 3600000 },
};

// Task 3: deadline already done
const doneTask = {
  id: 'u3',
  text: 'منجز',
  done: true,
  classroom: { deadlineTimestamp: now + 1 * 3600000 },
};

mockStore.items = [urgentTask, nonUrgentTask, doneTask];

const results = monitor.checkUrgentTasks(now);
assert.strictEqual(results.length, 1, 'Only Task 1 should be urgent');
assert.strictEqual(results[0].task.id, 'u1');
console.log('✓ checkUrgentTasks 3-hour threshold passed all assertions');

console.log('ALL SUPER URGENT UNIT TESTS PASSED SUCCESSFULLY! 🎉');
