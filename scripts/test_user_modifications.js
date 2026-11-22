'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { ClassroomEngine, parseClassroomDeadline, toLocalDateString } = require('../src/core/classroom');

console.log('========================================================');
console.log('TESTING NEW USER MODIFICATIONS & ENHANCEMENTS');
console.log('========================================================\n');

// ------------------------------------------------------------------
// 1. Test Font Rendering & Crispness Rules
// ------------------------------------------------------------------
console.log('--- 1. Testing Font Crispness & Subpixel Smoothing ---');
const baseCss = fs.readFileSync(path.join(__dirname, '../windows/css/base.css'), 'utf8');

// Ensure --engrave is none and no blurry text-shadow on .plate
assert.ok(!baseCss.includes('--engrave: 0 1px 0'), 'Should remove blurry 1px engrave text-shadow definitions');
assert.ok(baseCss.includes('--engrave: none;'), 'Should define --engrave: none;');
assert.ok(baseCss.includes('text-shadow: none;'), 'Plate should have text-shadow: none;');
assert.ok(baseCss.includes('-webkit-font-smoothing: antialiased;'), 'Should enable clean antialiasing to prevent blurry fringing on transparent windows');
assert.ok(baseCss.includes('text-rendering: optimizeLegibility;'), 'Should optimize text rendering for legibility');
assert.ok(baseCss.includes("data-theme='waterglass'"), 'Should include waterglass theme');
assert.ok(baseCss.includes('rgba(56, 189, 248'), 'Should include optical liquid water caustics in waterglass');

console.log('✅ Font crispness and waterglass optical caustics verified.\n');

// ------------------------------------------------------------------
// 2. Test Classroom Sync Postponed / Edited / Cancelled Detection
// ------------------------------------------------------------------
console.log('--- 2. Testing Classroom Sync: Postponements, Edits & Cancellations ---');

const engine = new ClassroomEngine(
  () => ({
    classroom: {
      enabled: true,
      accessToken: 'dummy-token',
    },
  }),
  () => {}
);

// Mock getCourses, getCourseWork, getSubmission
engine.getCourses = async () => [
  { id: 'course_101', name: 'Computer Networks' },
];

let mockCourseWork = [
  {
    id: 'work_1',
    title: 'Lab 1',
    description: 'Initial instructions',
    dueDate: { year: 2026, month: 10, day: 15 },
    dueTime: { hours: 18, minutes: 0 },
    alternateLink: 'https://classroom.google.com/work/1',
  },
  {
    id: 'work_2',
    title: 'Lab 2',
    description: 'Second lab',
    dueDate: { year: 2026, month: 10, day: 20 },
    dueTime: { hours: 23, minutes: 59 },
    alternateLink: 'https://classroom.google.com/work/2',
  },
];

engine.getCourseWork = async () => mockCourseWork;
engine.getSubmission = async () => ({ state: 'NEW' });

(async () => {
  // Initial sync: both assignments added
  const initialRes = await engine.sync([]);
  assert.strictEqual(initialRes.added, 2, 'Should add 2 initial assignments');
  assert.strictEqual(initialRes.items.length, 2);

  const lab1 = initialRes.items.find((t) => t.id === 'cr_course_101_work_1');
  assert.ok(lab1);
  assert.strictEqual(lab1.due, '2026-10-15');
  assert.strictEqual(lab1.text, '[Computer Networks] Lab 1');

  // Scenario A: Deadline Postponed & Title Edited by teacher
  mockCourseWork[0].dueDate = { year: 2026, month: 10, day: 25 };
  mockCourseWork[0].title = 'Lab 1 (Postponed & Extended)';
  mockCourseWork[0].description = 'Updated instructions with new deadline';

  const updateRes = await engine.sync(initialRes.items);
  assert.ok(updateRes.updated >= 1, 'Should detect and count updated assignment');

  const updatedLab1 = updateRes.items.find((t) => t.id === 'cr_course_101_work_1');
  assert.strictEqual(updatedLab1.due, '2026-10-25', 'Due date should update to postponed date');
  assert.strictEqual(updatedLab1.text, '[Computer Networks] Lab 1 (Postponed & Extended)', 'Title should update');
  assert.ok(updatedLab1.notes.includes('Updated instructions'), 'Notes should update');

  // Scenario B: Lab 2 is CANCELLED / DELETED by teacher on Classroom
  mockCourseWork = [mockCourseWork[0]]; // Lab 2 removed from Classroom API

  const cancelRes = await engine.sync(updateRes.items);
  assert.strictEqual(cancelRes.deleted, 1, 'Should detect and count cancelled/deleted assignment');
  assert.strictEqual(cancelRes.items.length, 1, 'Cancelled assignment must be purged from items list');
  assert.strictEqual(cancelRes.items.some((t) => t.id === 'cr_course_101_work_2'), false, 'Lab 2 must not be present');

  console.log('✅ Classroom postponements, edits, and cancellations correctly synchronized.\n');

  // ------------------------------------------------------------------
  // 3. Test 30-Minute Polling in main.js
  // ------------------------------------------------------------------
  console.log('--- 3. Testing 30-Minute Auto Sync in main.js ---');
  const mainJs = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

  assert.ok(mainJs.includes('CLASSROOM_SYNC_INTERVAL_MS = 30 * 60 * 1000'), 'Should define 30 minute interval');
  assert.ok(mainJs.includes('runClassroomBackgroundSync'), 'Should have runClassroomBackgroundSync function');
  assert.ok(mainJs.includes('startClassroomSyncTimer'), 'Should have startClassroomSyncTimer function');
  assert.ok(mainJs.includes('startClassroomSyncTimer()'), 'Should start poller during startup');

  console.log('✅ 30-Minute Auto Sync poller verified in main.js.\n');

  // ------------------------------------------------------------------
  // 4. Test Settings UI: Top Tabs, Per-Widget Styles, and Isolated Setup
  // ------------------------------------------------------------------
  console.log('--- 4. Testing Settings UI Layout & Per-Widget Customization ---');
  const settingsHtml = fs.readFileSync(path.join(__dirname, '../windows/settings.html'), 'utf8');
  const settingsCss = fs.readFileSync(path.join(__dirname, '../windows/css/settings.css'), 'utf8');
  const settingsJs = fs.readFileSync(path.join(__dirname, '../windows/js/settings.js'), 'utf8');
  const shellJs = fs.readFileSync(path.join(__dirname, '../windows/js/shell.js'), 'utf8');

  // Check top tabs
  assert.ok(settingsHtml.includes('id="settingsNav"'), 'Should contain top navigation bar');
  assert.ok(settingsHtml.includes('data-tab="appearance"'), 'Should contain appearance tab');
  assert.ok(settingsHtml.includes('data-tab="widgets"'), 'Should contain widgets tab');
  assert.ok(settingsHtml.includes('data-tab="todo"'), 'Should contain todo tab');
  assert.ok(settingsHtml.includes('data-tab="setup"'), 'Should contain setup tab');

  // Check Per-Widget Styling
  assert.ok(settingsHtml.includes('id="sec-widget-styles"'), 'Should contain per-widget style section');
  assert.ok(settingsHtml.includes('id="wStyleSelect"'), 'Should contain widget select picker');
  assert.ok(settingsHtml.includes('id="wStyleFontUi"'), 'Should contain custom UI font picker');
  assert.ok(settingsHtml.includes('id="wStyleGlass"'), 'Should contain custom widget glass opacity');

  // Check Dedicated Setting Up Workspace
  assert.ok(settingsHtml.includes('data-pane="setup"'), 'Should contain dedicated setup tab pane');
  assert.ok(settingsHtml.includes('id="setupBackBtn"'), 'Should contain back button in setup workspace');
  assert.ok(settingsHtml.includes('id="sec-setup-classroom"'), 'Should have dedicated classroom setup card');
  assert.ok(settingsHtml.includes('id="sec-setup-whatsapp"'), 'Should have dedicated whatsapp setup card');
  assert.ok(settingsHtml.includes('id="sec-setup-email"'), 'Should have dedicated email setup card');

  // Check Isolated Setting Up Workspace & Navigation
  assert.ok(settingsHtml.includes('data-tab="setup"'), 'Should have dedicated setup nav tab');
  assert.ok(settingsHtml.includes('class="tab-pane" data-pane="setup"'), 'Should isolate setup in dedicated pane');

  // Check shell.js handles per-widget styles
  assert.ok(shellJs.includes('s.widgetStyles?.[PAGE]'), 'shell.js should check per-widget styles for the active page');

  // Check CSS styles
  assert.ok(settingsCss.includes('.settings-nav'), 'settings.css should style navigation bar');
  assert.ok(settingsCss.includes('.tab-pane'), 'settings.css should style tab panes');
  assert.ok(settingsCss.includes('.setup-launch-card'), 'settings.css should style setup launch cards');

  // Check JS logic
  assert.ok(settingsJs.includes('switchTab'), 'settings.js should define switchTab function');
  assert.ok(settingsJs.includes('buildPerWidgetStyles'), 'settings.js should define buildPerWidgetStyles');
  assert.ok(settingsJs.includes('updateSummaryStatuses'), 'settings.js should define updateSummaryStatuses');

  console.log('✅ Settings layout, Per-Widget styling, and isolated Setting Up verified.\n');

  console.log('========================================================');
  console.log('🎉 ALL USER MODIFICATIONS TESTS PASSED (100%)');
  console.log('========================================================');
})();
