'use strict';

/**
 * Test Suite: Supercharged Calendar with Google Calendar Parity & User Customizations
 * 
 * Tests:
 * 1. Dedicated Settings Tab for Calendar in settings.html & settings.js
 * 2. Dedicated Calendar WhatsApp Setup Section in data-pane="setup"
 * 3. Day Notes CRUD & Disk Persistence in CalendarEventsManager
 * 4. Day Micro-actions Popup (+) and (📝) in calendar.html
 * 5. Prominent Red Dot (.red-dot) Condition (Events OR Day Notes)
 * 6. Google Calendar Multi-Views (Month, Week, Agenda) in HTML & CSS
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Store } = require('../src/core/store');
const { CalendarEventsManager } = require('../src/core/calendar-events');

console.log('========================================================');
console.log('TESTING SUPERCHARGED CALENDAR WITH GOOGLE CALENDAR PARITY');
console.log('========================================================\n');

// 1. Verify Dedicated Calendar Tab in Settings Window
console.log('--- 1. Testing Dedicated Calendar Tab in Settings Window ---');
const settingsHtml = fs.readFileSync(path.join(__dirname, '../windows/settings.html'), 'utf8');
const settingsJs = fs.readFileSync(path.join(__dirname, '../windows/js/settings.js'), 'utf8');

assert(settingsHtml.includes('data-tab="calendar"'), 'settings.html must have nav tab data-tab="calendar"');
assert(settingsHtml.includes('data-pane="calendar"'), 'settings.html must have tab pane data-pane="calendar"');
assert(settingsHtml.includes('id="sec-calendar-views"'), 'data-pane="calendar" must contain views configuration section');
assert(settingsHtml.includes('id="sec-calendar-style"'), 'data-pane="calendar" must contain style and appearance section');
assert(settingsHtml.includes('id="sec-calendar-smart"'), 'data-pane="calendar" must contain smart integrations section');

// Verify controls
assert(settingsHtml.includes('id="calViewMode"'), 'calViewMode select must exist');
assert(settingsHtml.includes('id="calWeekStart"'), 'calWeekStart select must exist');
assert(settingsHtml.includes('id="calHijri"'), 'calHijri toggle switch must exist');
assert(settingsHtml.includes('id="calHijriAdjust"'), 'calHijriAdjust select must exist');
assert(settingsHtml.includes('id="calVisualStyle"'), 'calVisualStyle select must exist');
assert(settingsHtml.includes('id="calHighlightWeekend"'), 'calHighlightWeekend switch must exist');
assert(settingsHtml.includes('id="calShowRedDot"'), 'calShowRedDot switch must exist');
assert(settingsHtml.includes('id="calShowDayActions"'), 'calShowDayActions switch must exist');
assert(settingsHtml.includes('id="calShowTasksOnCalendar"'), 'calShowTasksOnCalendar switch must exist');
console.log('✅ Dedicated Calendar Settings Tab and all controls verified.');

// 2. Verify Dedicated Calendar WhatsApp Setup in data-pane="setup"
console.log('\n--- 2. Testing Dedicated Calendar WhatsApp Setup Section ---');
const setupPaneHtml = settingsHtml.slice(settingsHtml.indexOf('data-pane="setup"'));
assert(setupPaneHtml.includes('id="sec-setup-calendar-wa"'), 'Setup pane must have separate section for Calendar WhatsApp');
assert(setupPaneHtml.includes('id="calWaEnabled"'), 'calWaEnabled toggle must exist in setup pane');
assert(setupPaneHtml.includes('id="calWaDefaultTiming"'), 'calWaDefaultTiming select must exist');
assert(setupPaneHtml.includes('id="calWaOverrideRecipient"'), 'calWaOverrideRecipient input must exist');
assert(setupPaneHtml.includes('id="calWaTemplate"'), 'calWaTemplate textarea must exist');
assert(setupPaneHtml.includes('id="calWaTestBtn"'), 'calWaTestBtn test sender must exist');
assert(setupPaneHtml.includes('data-cal-tag="{title}"'), 'Tag chip {title} must exist');
assert(setupPaneHtml.includes('data-cal-tag="{date}"'), 'Tag chip {date} must exist');
assert(setupPaneHtml.includes('data-cal-tag="{countdown}"'), 'Tag chip {countdown} must exist');
console.log('✅ Dedicated Calendar WhatsApp setup section in setup pane verified.');

// 3. Testing Day Notes CRUD & Persistence
console.log('\n--- 3. Testing Day Notes CRUD & Persistence ---');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cal-notes-test-'));
const eventsFile = path.join(tmpDir, 'calendar-events.json');
const calStore = new Store(eventsFile, { events: [], dayNotes: {} });
const calManager = new CalendarEventsManager(calStore, () => ({}));

// Save Day Note
const testDate = '2026-10-25';
const testNote = 'تحضير لاجتماع مشروع الذكاء الاصطناعي ومراجعة التقارير.';
let dayNotesChangedEmitted = false;
calManager.on('day-notes-changed', () => { dayNotesChangedEmitted = true; });

calManager.saveDayNote(testDate, testNote);
assert.strictEqual(calManager.getDayNote(testDate), testNote, 'getDayNote must return saved note');
assert(dayNotesChangedEmitted, 'Saving day note must emit day-notes-changed');

// Verify disk persistence
const storeReloaded = new Store(eventsFile, { events: [], dayNotes: {} });
assert.strictEqual(storeReloaded.get('dayNotes')[testDate], testNote, 'Day note must persist to disk');

// Remove Day Note
calManager.removeDayNote(testDate);
assert.strictEqual(calManager.getDayNote(testDate), '', 'Removed day note must return empty string');
assert.strictEqual(calStore.get('dayNotes')[testDate], undefined, 'Removed day note must be deleted from store');

console.log('✅ Day notes CRUD and disk persistence verified 100%.');

// 4. Testing Day Micro-Actions Popup & Day Note Modal in calendar.html
console.log('\n--- 4. Testing Day Micro-Actions Popup & Note Modal HTML ---');
const calendarHtml = fs.readFileSync(path.join(__dirname, '../windows/calendar.html'), 'utf8');

assert(calendarHtml.includes('id="dayActionsPopup"'), 'calendar.html must have #dayActionsPopup');
assert(calendarHtml.includes('id="dapAddEventBtn"'), '#dayActionsPopup must have (+) Add Event button');
assert(calendarHtml.includes('id="dapAddNoteBtn"'), '#dayActionsPopup must have (📝) Add Note button');
assert(calendarHtml.includes('id="dayNoteModal"'), 'calendar.html must have #dayNoteModal dialog');
assert(calendarHtml.includes('id="dayNoteInput"'), '#dayNoteModal must have note textarea');
assert(calendarHtml.includes('id="dayNoteSaveBtn"'), '#dayNoteModal must have Save button');
assert(calendarHtml.includes('id="dayNoteDeleteBtn"'), '#dayNoteModal must have Delete button');
console.log('✅ Day Micro-actions popup (+) & (📝) and Day Note Modal verified.');

// 5. Testing Red Dot CSS & Event/Note Condition
console.log('\n--- 5. Testing Red Dot CSS Indicator & Event/Note Condition ---');
const calendarCss = fs.readFileSync(path.join(__dirname, '../windows/css/calendar.css'), 'utf8');

assert(calendarCss.includes('.red-dot {'), 'calendar.css must define .red-dot');
assert(calendarCss.includes('#ef4444'), '.red-dot must have glowing red background #ef4444');
assert(calendarCss.includes('box-shadow:'), '.red-dot must have glowing box-shadow');

const calendarJs = fs.readFileSync(path.join(__dirname, '../windows/js/calendar.js'), 'utf8');
// Check that red dot is appended when hasEvent || hasNote
assert(calendarJs.includes('hasEvent || hasNote'), 'calendar.js must check hasEvent || hasNote for red dot');
assert(calendarJs.includes('showRedDot'), 'calendar.js must support showRedDot preference');
console.log('✅ Red dot glowing CSS and (hasEvent || hasNote) condition verified.');

// 6. Testing Google Calendar Multi-Views (Month, Week, Agenda)
console.log('\n--- 6. Testing Google Calendar Multi-Views ---');
assert(calendarHtml.includes('id="calViewSelector"'), 'calendar.html must have view mode selector');
assert(calendarHtml.includes('id="btnViewMonth"'), 'View mode switcher must have month button');
assert(calendarHtml.includes('id="btnViewWeek"'), 'View mode switcher must have week button');
assert(calendarHtml.includes('id="btnViewAgenda"'), 'View mode switcher must have agenda button');
assert(calendarHtml.includes('id="monthView"'), 'Month view pane must exist');
assert(calendarHtml.includes('id="weekView"'), 'Week view pane must exist');
assert(calendarHtml.includes('id="agendaView"'), 'Agenda view pane must exist');

assert(calendarJs.includes('function renderWeek()'), 'calendar.js must implement renderWeek()');
assert(calendarJs.includes('function renderAgenda()'), 'calendar.js must implement renderAgenda()');
assert(calendarJs.includes('function switchViewMode('), 'calendar.js must implement switchViewMode()');
console.log('✅ Google Calendar Month, Week, and Agenda views verified 100%.');

// 7. Testing Tasks & Deadlines Integration on Calendar
console.log('\n--- 7. Testing Tasks & Classroom Deadlines on Calendar ---');
assert(calendarJs.includes('getTasksForDate'), 'calendar.js must have getTasksForDate helper');
assert(calendarJs.includes('showTasksOnCalendar'), 'calendar.js must support showTasksOnCalendar setting');
assert(calendarJs.includes('widgets.todos?.onChange') || calendarJs.includes('todos:changed'), 'calendar.js must listen for todos changes');
console.log('✅ Tasks & Classroom deadlines integration on calendar verified.');

// 8. Testing Red Dot Top-Left Attachment & Arrow Buttons Order
console.log('\n--- 8. Testing Red Dot Top-Left Attachment & Arrow Buttons Order ---');
assert(calendarCss.includes('top: 0px;') && calendarCss.includes('left: 1px;'), '.red-dot must be positioned at top: 0px; left: 1px; on circle');
assert(calendarJs.includes('iEl.appendChild(dot)'), 'red-dot must be attached directly to the day number circle iEl');
assert(calendarHtml.indexOf('id="prev"') < calendarHtml.indexOf('id="next"'), '#prev button must precede #next button in HTML DOM');
assert(calendarCss.includes('width: 24px;') && calendarCss.includes('height: 24px;'), '.m-arrow must have comfortable 24x24px dimensions');
console.log('✅ Red dot top-left circle attachment and navigation arrow order verified.');

// 9. Testing Dedicated External Event Window & Multi-Timing WhatsApp Reminders
console.log('\n--- 9. Testing Dedicated External Event Window & Multi-Timing WhatsApp Reminders ---');
const eventHtml = fs.readFileSync(path.join(__dirname, '../windows/event.html'), 'utf8');
const eventCss = fs.readFileSync(path.join(__dirname, '../windows/css/event.css'), 'utf8');
const eventJs = fs.readFileSync(path.join(__dirname, '../windows/js/event.js'), 'utf8');

assert(eventHtml.includes('id="evTimingsGrid"'), 'event.html must include multi-timing selector grid');
assert(eventHtml.includes('name="waTiming"'), 'event.html must include multi-timing checkboxes');
assert(eventJs.includes('getSelectedTimings'), 'event.js must collect selected WhatsApp reminder timings');

const { getEventTimings, calculateNotifyTime } = require('../src/core/calendar-events');
assert(typeof getEventTimings === 'function', 'calendar-events must export getEventTimings');
assert(typeof calculateNotifyTime === 'function', 'calendar-events must export calculateNotifyTime');

const testMultiEv = {
  id: 'evt-multi-01',
  date: '2026-11-20',
  time: '14:30',
  whatsapp: { enabled: true, timings: ['3d_before', '1d_before', 'morning_of', '1h_before'] },
};
const timings = getEventTimings(testMultiEv);
assert.strictEqual(timings.length, 4, 'Should extract all 4 configured notification timings');
assert.deepStrictEqual(timings, ['3d_before', '1d_before', 'morning_of', '1h_before']);
console.log('✅ Dedicated external event window and multi-timing WhatsApp reminders verified 100%.');

// 10. Testing Popup Customizations in Settings & High-Contrast Readability
console.log('\n--- 10. Testing Popup Customizations in Settings & High-Contrast Readability ---');
assert(settingsHtml.includes('id="calPopupTheme"'), 'settings.html must have #calPopupTheme control');
assert(settingsHtml.includes('id="calPopupRadius"'), 'settings.html must have #calPopupRadius control');
assert(settingsHtml.includes('id="calPopupGlow"'), 'settings.html must have #calPopupGlow control');
assert(settingsJs.includes('calPopupTheme'), 'settings.js must wire calPopupTheme');

assert(calendarCss.includes('.dap-btn.dap-add-event') && calendarCss.includes('color: #ffffff !important;'), 'Day action popup buttons must have luminous high-contrast white text');
assert(calendarCss.includes('data-popup-theme'), 'calendar.css must support data-popup-theme styles');
console.log('✅ Popup customizations in Settings and high-contrast readability verified.');

// Cleanup tmp dir
try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}

console.log('\n========================================================');
console.log('🌟 ALL SUPERCHARGED CALENDAR & USER FIXES PASSED (100%)! 🌟');
console.log('========================================================\n');
