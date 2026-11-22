'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('TESTING TO-DO MOVE COMPLETED TASKS TO BOTTOM OPTION');
console.log('========================================================\n');

// 1. Verify main.js DEFAULTS
console.log('--- 1. Testing main.js Defaults ---');
const mainJs = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');
assert(mainJs.includes('todoMoveDoneToBottom: true'), 'DEFAULTS must have todoMoveDoneToBottom: true');
console.log('✅ main.js DEFAULTS contains todoMoveDoneToBottom: true');

// 2. Verify settings.html Structure
console.log('\n--- 2. Testing settings.html Elements ---');
const settingsHtml = fs.readFileSync(path.join(__dirname, '../windows/settings.html'), 'utf8');
assert(settingsHtml.includes('id="todoMoveDoneToBottom"'), 'settings.html must have #todoMoveDoneToBottom');
assert(settingsHtml.includes('role="switch"'), 'button must have role="switch"');
assert(settingsHtml.includes('data-i18n="s.todoMoveDoneToBottom"'), 'settings.html must have i18n label');
assert(settingsHtml.includes('data-i18n="s.todoMoveDoneToBottomHint"'), 'settings.html must have i18n hint');
console.log('✅ settings.html switch button, label, and hint verified.');

// 3. Verify settings.js Translations and Wiring
console.log('\n--- 3. Testing settings.js Strings & Wiring ---');
const settingsJs = fs.readFileSync(path.join(__dirname, '../windows/js/settings.js'), 'utf8');
assert(settingsJs.includes("'s.todoMoveDoneToBottom':"), 'settings.js must have Arabic translation');
assert(settingsJs.includes("'s.todoMoveDoneToBottomHint':"), 'settings.js must have Arabic hint translation');
assert(settingsJs.includes("switchEl('#todoMoveDoneToBottom'"), 'settings.js buildTodo must wire switchEl for #todoMoveDoneToBottom');
console.log('✅ settings.js strings and switchEl wiring verified.');

// 4. Verify todo.js visible() Logic Simulation
console.log('\n--- 4. Testing todo.js Partitioning Logic ---');
const todoJs = fs.readFileSync(path.join(__dirname, '../windows/js/todo.js'), 'utf8');
assert(todoJs.includes('s?.todoMoveDoneToBottom !== false'), 'todo.js must check todoMoveDoneToBottom');

// Test functional partition function identical to todo.js visible() logic
function simulateVisible(items, s, filter = 'all') {
  let list = [];
  if (filter === 'active') list = items.filter((x) => !x.done);
  else if (filter === 'done') list = items.filter((x) => x.done);
  else list = [...items];

  const sortBy = s?.todoSortBy || 'free';
  let sorted = [...list];

  if (sortBy === 'deadline') {
    sorted.sort((a, b) => {
      const timeA = a.classroom?.deadlineTimestamp || (a.due ? new Date(`${a.due}T23:59:59`).getTime() : Infinity);
      const timeB = b.classroom?.deadlineTimestamp || (b.due ? new Date(`${b.due}T23:59:59`).getTime() : Infinity);
      return timeA - timeB;
    });
  } else if (sortBy === 'priority') {
    sorted.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  } else if (sortBy === 'title') {
    sorted.sort((a, b) => (a.text || '').localeCompare(b.text || '', 'ar'));
  } else if (sortBy === 'created') {
    sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  if (s?.todoMoveDoneToBottom !== false && filter === 'all') {
    const active = [];
    const done = [];
    for (const item of sorted) {
      if (item.done) done.push(item);
      else active.push(item);
    }
    sorted = [...active, ...done];
  }

  return sorted;
}

const mockTasks = [
  { id: '1', text: 'Task 1 (Done)', done: true, due: '2026-10-20' },
  { id: '2', text: 'Task 2 (Active)', done: false, due: '2026-10-25' },
  { id: '3', text: 'Task 3 (Active)', done: false, due: '2026-10-18' },
  { id: '4', text: 'Task 4 (Done)', done: true, due: '2026-10-15' },
];

// Test Free sorting with todoMoveDoneToBottom: true (default)
const resEnabled = simulateVisible(mockTasks, { todoSortBy: 'free', todoMoveDoneToBottom: true });
assert.strictEqual(resEnabled[0].id, '2', 'First item should be active Task 2');
assert.strictEqual(resEnabled[1].id, '3', 'Second item should be active Task 3');
assert.strictEqual(resEnabled[2].id, '1', 'Third item should be done Task 1');
assert.strictEqual(resEnabled[3].id, '4', 'Fourth item should be done Task 4');
console.log('✅ When todoMoveDoneToBottom is ON: Completed tasks correctly moved to the bottom.');

// Test Free sorting with todoMoveDoneToBottom: false (disabled)
const resDisabled = simulateVisible(mockTasks, { todoSortBy: 'free', todoMoveDoneToBottom: false });
assert.strictEqual(resDisabled[0].id, '1', 'First item should remain Task 1 in original order');
assert.strictEqual(resDisabled[1].id, '2', 'Second item should remain Task 2 in original order');
assert.strictEqual(resDisabled[2].id, '3', 'Third item should remain Task 3 in original order');
assert.strictEqual(resDisabled[3].id, '4', 'Fourth item should remain Task 4 in original order');
console.log('✅ When todoMoveDoneToBottom is OFF: Tasks maintain exact original order.');

// Test Deadline sorting with todoMoveDoneToBottom: true
const resDeadlines = simulateVisible(mockTasks, { todoSortBy: 'deadline', todoMoveDoneToBottom: true });
assert.strictEqual(resDeadlines[0].id, '3', 'Active task with earliest deadline (Oct 18) must come first');
assert.strictEqual(resDeadlines[1].id, '2', 'Active task with later deadline (Oct 25) must come second');
assert.strictEqual(resDeadlines[2].id, '4', 'Completed task (Oct 15) must be at bottom');
assert.strictEqual(resDeadlines[3].id, '1', 'Completed task (Oct 20) must be at bottom');
console.log('✅ When deadline sorting + todoMoveDoneToBottom is ON: Active tasks sorted by deadline first, done tasks sorted at bottom.');

// Test Toggling a task from active to done dynamically
mockTasks[1].done = true; // Task 2 marked as done
const resAfterToggle = simulateVisible(mockTasks, { todoSortBy: 'free', todoMoveDoneToBottom: true });
assert.strictEqual(resAfterToggle[0].id, '3', 'Only Task 3 remains active at top');
assert(resAfterToggle.slice(1).map(x => x.id).includes('2'), 'Newly completed Task 2 is at bottom');
console.log('✅ Marking task as done moves it immediately to bottom.');

console.log('\n========================================================');
console.log('🎉 ALL TO-DO MOVE COMPLETED TO BOTTOM TESTS PASSED (100%)');
console.log('========================================================\n');
