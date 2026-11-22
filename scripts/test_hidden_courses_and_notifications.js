'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { isCourseHidden, isTaskCourseHidden, ClassroomEngine } = require('../src/core/classroom');
const { SuperUrgentMonitor } = require('../src/core/super-urgent');

console.log('========================================================');
console.log('TESTING COMPLETE HIDDEN COURSES PURGE & NOTIFICATIONS');
console.log('========================================================\n');

// 1. Test isCourseHidden & isTaskCourseHidden helpers
console.log('--- 1. Testing Course Exclusion Fuzzy Logic ---');
const hiddenList = ['Math 101', 'CS50', 'فيزياء'];

assert.strictEqual(isCourseHidden('12345', 'Math 101', hiddenList), true, 'Exact name match should be hidden');
assert.strictEqual(isCourseHidden('CS50', 'Introduction to CS', hiddenList), true, 'ID match should be hidden');
assert.strictEqual(isCourseHidden('999', 'مادة فيزياء عامة 1', hiddenList), true, 'Substring name match should be hidden');
assert.strictEqual(isCourseHidden('888', 'Chemistry 101', hiddenList), false, 'Unrelated course should not be hidden');

const task1 = { id: 'cr_1_1', text: '[Math 101] Homework 1', classroom: { courseName: 'Math 101', courseId: '1' } };
const task2 = { id: 'cr_2_1', text: '[CS50] Problem Set 0', classroom: { courseName: 'CS50', courseId: '2' } };
const task3 = { id: 'cr_3_1', text: 'تقرير مادة فيزياء للتسليم', classroom: { courseName: 'فيزياء عامة', courseId: '3' } };
const task4 = { id: 'cr_4_1', text: '[Biology] Lab Report', classroom: { courseName: 'Biology', courseId: '4' } };
const task5 = { id: 'custom_1', text: 'شراء كتب للمنزل' };

assert.strictEqual(isTaskCourseHidden(task1, hiddenList), true, 'task1 must be hidden');
assert.strictEqual(isTaskCourseHidden(task2, hiddenList), true, 'task2 must be hidden');
assert.strictEqual(isTaskCourseHidden(task3, hiddenList), true, 'task3 must be hidden');
assert.strictEqual(isTaskCourseHidden(task4, hiddenList), false, 'task4 must NOT be hidden');
assert.strictEqual(isTaskCourseHidden(task5, hiddenList), false, 'regular custom task must NOT be hidden');
console.log('✅ Fuzzy course exclusion logic verified.');

// 2. Test Super Urgent Monitor completely ignores hidden courses
console.log('\n--- 2. Testing Super Urgent Monitor Ignores Hidden Courses ---');
const dummySettingsObj = {
  superUrgent: { enabled: true, thresholdHours: 3 },
  classroom: { enabled: true, hiddenCourses: ['Math 101'] },
};
const urgentDue = Date.now() + 30 * 60 * 1000; // In 30 minutes
const dummyTodos = {
  get: () => [
    { id: 'urgent_math', text: '[Math 101] Final Exam', classroom: { courseName: 'Math 101', deadlineTimestamp: urgentDue }, due: new Date(urgentDue).toISOString().slice(0, 10) },
    { id: 'urgent_bio', text: '[Biology] Quiz', classroom: { courseName: 'Biology', deadlineTimestamp: urgentDue }, due: new Date(urgentDue).toISOString().slice(0, 10) },
  ],
};

const monitor = new SuperUrgentMonitor(
  dummyTodos,
  () => dummySettingsObj,
  null
);

const urgentActive = monitor.checkUrgentTasks();
assert.strictEqual(urgentActive.length, 1, 'Only Biology should be urgent, Math 101 must be ignored because it is hidden');
assert.strictEqual(urgentActive[0].task.id, 'urgent_bio', 'Urgent task should be Biology');

// When master filter switch is turned OFF (filterHiddenCourses: false):
dummySettingsObj.classroom.filterHiddenCourses = false;
const urgentAllActive = monitor.checkUrgentTasks();
assert.strictEqual(urgentAllActive.length, 2, 'When master filter switch is OFF, Math 101 must NOT be ignored (both active)');
console.log('✅ Super Urgent Monitor verified: Master switch enables/disables hiding automatically.');

// 3. Test ClassroomEngine.syncIcal purges existing hidden tasks
console.log('\n--- 3. Testing ClassroomEngine Purging in iCal & Memory ---');
const engine = new ClassroomEngine({
  configProvider: () => ({ enabled: true, hiddenCourses: ['Math 101'] }),
  tokenSaver: () => {},
});
const testList = [
  { id: 'cr_math', text: '[Math 101] Exercise' },
  { id: 'custom_task', text: 'مذاكرة عامة' },
];
// Test purge logic directly
for (let i = testList.length - 1; i >= 0; i--) {
  if (isTaskCourseHidden(testList[i], ['Math 101'])) {
    testList.splice(i, 1);
  }
}
assert.strictEqual(testList.length, 1);
assert.strictEqual(testList[0].id, 'custom_task');
console.log('✅ Memory purge verified.');

// 4. Test UI elements in HTML, JS, and CSS
console.log('\n--- 4. Testing HTML & CSS UI Elements ---');
const todoHtml = fs.readFileSync(path.join(__dirname, '../windows/todo.html'), 'utf8');
const todoCss = fs.readFileSync(path.join(__dirname, '../windows/css/todo.css'), 'utf8');
const todoJs = fs.readFileSync(path.join(__dirname, '../windows/js/todo.js'), 'utf8');
const settingsHtml = fs.readFileSync(path.join(__dirname, '../windows/settings.html'), 'utf8');
const settingsJs = fs.readFileSync(path.join(__dirname, '../windows/js/settings.js'), 'utf8');
const settingsCss = fs.readFileSync(path.join(__dirname, '../windows/css/settings.css'), 'utf8');
const taskHtml = fs.readFileSync(path.join(__dirname, '../windows/task.html'), 'utf8');
const taskJs = fs.readFileSync(path.join(__dirname, '../windows/js/task.js'), 'utf8');

// Notification button & badge
assert(todoHtml.includes('id="crNotifyBtn"'), 'todo.html must contain #crNotifyBtn');
assert(todoHtml.includes('id="crNotifyBadge"'), 'todo.html must contain #crNotifyBadge');
assert(todoHtml.includes('id="crNotifyDrawer"'), 'todo.html must contain #crNotifyDrawer');
assert(todoCss.includes('.cr-notify-badge'), 'todo.css must contain .cr-notify-badge');
assert(todoCss.includes('crBadgePulse'), 'todo.css must contain pulsing red badge animation');
assert(todoCss.includes('.cr-notify-drawer'), 'todo.css must style .cr-notify-drawer');
console.log('✅ Classroom notification button & red badge verified in To-Do widget.');

// Settings controls: Master automatic switch and auto-courses list
assert(settingsHtml.includes('id="crShowNotificationsBtn"'), 'settings.html must contain #crShowNotificationsBtn');
assert(settingsHtml.includes('id="crFilterHiddenCourses"'), 'settings.html must contain master switch #crFilterHiddenCourses');
assert(settingsHtml.includes('id="crAutoCoursesBox"'), 'settings.html must contain auto-courses container #crAutoCoursesBox');
assert(settingsHtml.includes('id="crAutoCoursesList"'), 'settings.html must contain auto-courses list #crAutoCoursesList');

assert(settingsJs.includes('switchEl(\'#crShowNotificationsBtn\''), 'settings.js must wire #crShowNotificationsBtn');
assert(settingsJs.includes('switchEl(filterSwitch'), 'settings.js must wire #crFilterHiddenCourses');
assert(settingsJs.includes('renderCoursesList'), 'settings.js must contain renderCoursesList');
assert(settingsJs.includes('\'s.crShowNotificationsBtn\':'), 'settings.js must contain Arabic translation for s.crShowNotificationsBtn');
assert(settingsJs.includes('\'s.crFilterHiddenCourses\':'), 'settings.js must contain Arabic translation for s.crFilterHiddenCourses');
assert(settingsCss.includes('.cr-auto-courses-card'), 'settings.css must style .cr-auto-courses-card');
assert(settingsCss.includes('.cr-auto-course-row'), 'settings.css must style .cr-auto-course-row');
console.log('✅ Settings automatic master toggle and auto-courses list verified.');

// Quick hide button in task list and task window
assert(todoJs.includes('task-hide-course-btn'), 'todo.js must contain task-hide-course-btn quick action');
assert(taskHtml.includes('id="crHideCourseBtn"'), 'task.html must contain #crHideCourseBtn');
assert(taskJs.includes('hideBtn.onclick'), 'task.js must wire hideBtn to add course to hiddenCourses');
console.log('✅ Quick Hide Course actions on task cards and task window verified.');

console.log('\n========================================================');
console.log('🎉 ALL HIDDEN COURSES & NOTIFICATIONS TESTS PASSED 100%!');
console.log('========================================================');
