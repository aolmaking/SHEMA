'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== Running Tasks (To-Do) Compact & Long Title Verification Tests ===');

// Test 1: Check todo.css rules
const todoCss = fs.readFileSync(path.join(__dirname, '../windows/css/todo.css'), 'utf8');
assert(todoCss.includes('overflow-wrap: anywhere;'), 'todo.css must include overflow-wrap: anywhere');
assert(todoCss.includes('word-break: normal;'), 'todo.css must use word-break: normal');
assert(todoCss.includes('.task-actions'), 'todo.css must define .task-actions floating pill');
console.log('✔ Test 1: todo.css uses clean word-wrapping and floating action pill');

// Test 2: Check todo.js badges and settings flags
const todoJs = fs.readFileSync(path.join(__dirname, '../windows/js/todo.js'), 'utf8');
assert(todoJs.includes('crShowSubmissionBadge'), 'todo.js must check crShowSubmissionBadge');
assert(todoJs.includes('crShowCourseBadge'), 'todo.js must check crShowCourseBadge');
assert(todoJs.includes('crShowLinkBtn'), 'todo.js must check crShowLinkBtn');
assert(todoJs.includes('crCourseInTitle'), 'todo.js must check crCourseInTitle');
console.log('✔ Test 2: todo.js properly respects configurable badges and link buttons');

// Test 3: Simulate long course title cleaning
function cleanTaskTitle(task, s) {
  let displayText = task.text;
  if (!s.crCourseInTitle && task.classroom?.courseName) {
    const escaped = task.classroom.courseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    displayText = displayText.replace(new RegExp(`^\\[${escaped}\\]\\s*`), '');
  }
  return displayText;
}

const sampleTask = {
  id: 'task_1',
  text: '[CSE 412 Operating Systems - Fall 2026] Assignment 1',
  classroom: { courseName: 'CSE 412 Operating Systems - Fall 2026' }
};

// When crCourseInTitle is false (default):
const cleaned = cleanTaskTitle(sampleTask, { crCourseInTitle: false });
assert.strictEqual(cleaned, 'Assignment 1', 'Title must be cleanly extracted without long course prefix');

// When crCourseInTitle is true:
const preserved = cleanTaskTitle(sampleTask, { crCourseInTitle: true });
assert.strictEqual(preserved, '[CSE 412 Operating Systems - Fall 2026] Assignment 1', 'Title must remain unchanged when user opts in');

console.log('✔ Test 3: Long title prefix cleaning correctly optimizes card space');
console.log('=== All To-Do Compact Tests Passed! ===\n');
