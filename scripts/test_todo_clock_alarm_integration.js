'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('TESTING CROSS-WIDGET INTEGRATION: TO-DO <-> CLOCK ALARM SYSTEM');
console.log('================================================================\n');

// 1. Verify preload.js clock bridge
console.log('[1/5] Testing preload.js clock bridge...');
const preloadSource = fs.readFileSync(path.join(__dirname, '../preload.js'), 'utf8');
assert(preloadSource.includes('clock: {'), 'preload.js should expose clock object');
assert(preloadSource.includes('getAlarms:'), 'preload.js should have getAlarms');
assert(preloadSource.includes('setAlarmForTask:'), 'preload.js should have setAlarmForTask');
assert(preloadSource.includes('removeAlarmForTask:'), 'preload.js should have removeAlarmForTask');
assert(preloadSource.includes('onAlarmsChange:'), 'preload.js should have onAlarmsChange');
console.log('✅ preload.js clock bridge verified.');

// 2. Verify task.html & task.js native reminders integration
console.log('\n[2/5] Testing task.html & task.js native alarm in reminders section...');
const taskHtml = fs.readFileSync(path.join(__dirname, '../windows/task.html'), 'utf8');
assert(taskHtml.includes('id="setClockAlarm"'), 'task.html must contain #setClockAlarm checkbox');
assert(taskHtml.includes('data-i18n="task.setClockAlarm"'), 'task.html must have data-i18n for setClockAlarm');

const taskJs = fs.readFileSync(path.join(__dirname, '../windows/js/task.js'), 'utf8');
assert(taskJs.includes('setClockAlarm'), 'task.js must check setClockAlarm checkbox');
assert(taskJs.includes('toggleAlarmForReminder'), 'task.js must implement toggleAlarmForReminder');
assert(taskJs.includes('window.widgets.clock?.setAlarmForTask'), 'task.js must call setAlarmForTask');

const todoHtml = fs.readFileSync(path.join(__dirname, '../windows/todo.html'), 'utf8');
assert(!todoHtml.includes('id="taskAlarmModal"'), 'todo.html must NOT contain ugly modal #taskAlarmModal');
console.log('✅ task.html & task.js clean reminders integration verified (and modal cleanly removed from todo.html).');

// 3. Verify task.css styling rules
console.log('\n[3/5] Testing task.css styling for alarms in reminders...');
const taskCss = fs.readFileSync(path.join(__dirname, '../windows/css/task.css'), 'utf8');
assert(taskCss.includes('.alarm-check-row'), 'task.css must style .alarm-check-row');
assert(taskCss.includes('.alarm-check-label'), 'task.css must style .alarm-check-label');
assert(taskCss.includes('.chip.alarm-toggle-chip'), 'task.css must style .alarm-toggle-chip');
console.log('✅ task.css styling verified.');

// 4. Verify clock.html & clock.js ringing integration
console.log('\n[4/5] Testing clock.html & clock.js ringing task completion...');
const clockHtml = fs.readFileSync(path.join(__dirname, '../windows/clock.html'), 'utf8');
assert(clockHtml.includes('id="ringingCompleteTaskBtn"'), 'clock.html must have #ringingCompleteTaskBtn');
const clockJs = fs.readFileSync(path.join(__dirname, '../windows/js/clock.js'), 'utf8');
assert(clockJs.includes('ringingCompleteTaskBtn'), 'clock.js must wire ringingCompleteTaskBtn');
assert(clockJs.includes('window.widgets?.todos?.patch?.(alarm.taskId'), 'clock.js must patch task on completion');
assert(clockJs.includes('cfg.alarms') && clockJs.includes('loadAlarms'), 'clock.js must load cfg.alarms');
console.log('✅ clock.html & clock.js ringing task completion verified.');

// 5. Test setAlarmForTask and removeAlarmForTask logic simulation
console.log('\n[5/5] Testing alarm simulation logic...');
let mockSettings = { clock: { alarms: [] } };
function mockSetAlarmForTask(task, timeStr, days = [0, 1, 2, 3, 4, 5, 6], repeat = 'once') {
  const curAlarms = [...(mockSettings.clock.alarms || [])];
  const existingIdx = curAlarms.findIndex((a) => a.taskId === task.id || a.id === `alarm_task_${task.id}`);
  const newAlarm = {
    id: existingIdx >= 0 ? curAlarms[existingIdx].id : `alarm_task_${task.id}`,
    time: timeStr,
    label: task.text ? task.text.slice(0, 48) : 'منبه مهمة',
    days: days && days.length ? days : [0, 1, 2, 3, 4, 5, 6],
    repeat: repeat || 'once',
    enabled: true,
    taskId: task.id,
    taskTitle: task.text || '',
    lastTriggeredDate: null,
  };
  if (existingIdx >= 0) {
    curAlarms[existingIdx] = newAlarm;
  } else {
    curAlarms.unshift(newAlarm);
  }
  mockSettings.clock.alarms = curAlarms;
  return newAlarm;
}

function mockRemoveAlarmForTask(taskId) {
  mockSettings.clock.alarms = mockSettings.clock.alarms.filter((a) => a.taskId !== taskId && a.id !== `alarm_task_${taskId}`);
}

const sampleTask = { id: 'task_101', text: 'تسليم بحث النظم' };
mockSetAlarmForTask(sampleTask, '08:30', [0, 1, 2, 3, 4], 'workdays');
assert.strictEqual(mockSettings.clock.alarms.length, 1, 'Should have 1 alarm');
assert.strictEqual(mockSettings.clock.alarms[0].time, '08:30');
assert.strictEqual(mockSettings.clock.alarms[0].taskId, 'task_101');
assert.strictEqual(mockSettings.clock.alarms[0].taskTitle, 'تسليم بحث النظم');
assert.strictEqual(mockSettings.clock.alarms[0].enabled, true);

// Update time for the same task
mockSetAlarmForTask(sampleTask, '09:00', [0, 1, 2, 3, 4, 5, 6], 'once');
assert.strictEqual(mockSettings.clock.alarms.length, 1, 'Should still be 1 alarm (updated, not duplicated)');
assert.strictEqual(mockSettings.clock.alarms[0].time, '09:00');

// Remove alarm
mockRemoveAlarmForTask('task_101');
assert.strictEqual(mockSettings.clock.alarms.length, 0, 'Should be 0 alarms after removal');
console.log('✅ Alarm simulation logic verified.');

console.log('\n================================================================');
console.log('🎉 ALL CROSS-WIDGET TO-DO <-> CLOCK ALARM TESTS PASSED (100%) 🎉');
console.log('================================================================');
