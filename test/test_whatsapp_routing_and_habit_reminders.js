'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('TESTING WHATSAPP MULTI-CHANNEL ROUTING & HABIT REMINDERS');
console.log('========================================================\n');

// 1. Core Habits Manager & Per-Habit Reminder Message
console.log('--- 1. Testing Habits Reminder Message Construction ---');
const { HabitsManager } = require('../src/core/habits');

let storedData = { habits: [], days: {} };
const mockStore = {
  get: (k, def) => (k === 'habits_data' ? storedData : def),
  set: (k, v) => { if (k === 'habits_data') storedData = v; },
};
const mgr = new HabitsManager(mockStore, () => ({ language: 'ar', whatsapp: {} }));

const sampleHabitAr = {
  id: 'h_fajr',
  name: 'صلاة الفجر في المسجد',
  icon: '🕌',
  category: 'spiritual',
  reminderTime: '04:45',
  reminderRecipient: '201012345678',
  reminderCustomText: 'لا تنسَ سنة الفجر، ركعتا الفجر خير من الدنيا وما فيها!',
  cue: 'سماع الأذان',
};

const msgAr = mgr.buildHabitReminderMessage(sampleHabitAr, 7, 'ar');
assert(msgAr.includes('صلاة الفجر في المسجد'), 'Message must contain habit name');
assert(msgAr.includes('7'), 'Message must contain streak');
assert(msgAr.includes('سماع الأذان'), 'Message must contain trigger cue');
assert(msgAr.includes('لا تنسَ سنة الفجر'), 'Message must contain custom encouragement text');
console.log('✅ Arabic habit reminder message generated successfully.');

const sampleHabitEn = {
  id: 'h_read',
  name: 'Read 20 pages',
  icon: '📚',
  category: 'mind',
  reminderTime: '21:00',
  reminderCustomText: 'Keep up the evening reading habit!',
  cue: 'After dinner',
};

const msgEn = mgr.buildHabitReminderMessage(sampleHabitEn, 14, 'en');
assert(msgEn.includes('Read 20 pages'), 'En message must contain habit name');
assert(msgEn.includes('14 days'), 'En message must contain streak');
assert(msgEn.includes('Keep up the evening reading habit!'), 'En message must contain custom text');
assert(msgEn.includes('After dinner'), 'En message must contain cue');
console.log('✅ English habit reminder message generated successfully.');

// 1.1 Custom Smart Template with Dynamic Tokens
console.log('--- 1.1 Testing Custom Smart Template Token Substitution ---');
const sampleHabitTemplate = {
  id: 'h_pray',
  name: 'الصلوات الخمس',
  icon: '🕌',
  targetValue: 5,
  unit: 'صلوات',
  reminderTime: '12:00',
  triggerCue: 'الأذان',
  notes: 'في المسجد جماعة',
  reminderTemplate: '🔔 {habit} | الهدف: {target} | السلسلة: {streak} يوم\n⏰ {time} - {cue}\n📝 {note}',
};
const msgTemplate = mgr.buildHabitReminderMessage(sampleHabitTemplate, 12, 'ar');
assert(msgTemplate.includes('🕌 *الصلوات الخمس*'), 'Template must substitute {habit}');
assert(msgTemplate.includes('الهدف: 5 صلوات'), 'Template must substitute {target}');
assert(msgTemplate.includes('السلسلة: 12 يوم'), 'Template must substitute {streak}');
assert(msgTemplate.includes('12:00 - الأذان'), 'Template must substitute {time} and {cue}');
assert(msgTemplate.includes('في المسجد جماعة'), 'Template must substitute {note}');
console.log('✅ Custom reminderTemplate dynamic tokens substituted successfully.');

// 2. Testing Habit Data Storage & Retrieval
console.log('\n--- 2. Testing Habit Data Storage for Reminders ---');
const saved = mgr.saveHabit({
  name: 'قراءة الورد القرآني',
  category: 'spiritual',
  icon: '📖',
  reminderEnabled: true,
  reminderTime: '17:30',
  reminderRecipient: '201099887766',
  reminderCustomText: 'ورد القرآن نور لقلبك ويومك',
});

assert(saved.reminderEnabled === true, 'reminderEnabled must be true');
assert(saved.reminderTime === '17:30', 'reminderTime must be 17:30');
assert(saved.reminderRecipient === '201099887766', 'reminderRecipient must match');
assert(saved.reminderCustomText === 'ورد القرآن نور لقلبك ويومك', 'reminderCustomText must match');
console.log('✅ Habit WhatsApp reminder properties saved correctly.');

// 3. Testing Settings HTML Structure
console.log('\n--- 3. Testing Settings Window HTML Markup ---');
const settingsHtml = fs.readFileSync(path.join(__dirname, '../windows/settings.html'), 'utf8');

assert(settingsHtml.includes('id="waRoutingHub"'), '#waRoutingHub container must exist in settings.html');
assert(settingsHtml.includes('id="waChanSuperUrgent"'), '#waChanSuperUrgent card must exist');
assert(settingsHtml.includes('id="waChanHabitsReports"'), '#waChanHabitsReports card must exist');
assert(settingsHtml.includes('id="waChanHabitReminders"'), '#waChanHabitReminders card must exist');
assert(settingsHtml.includes('id="waChanCalendar"'), '#waChanCalendar card must exist');

assert(settingsHtml.includes('id="waChanSuperUrgentMode"'), '#waChanSuperUrgentMode select must exist');
assert(settingsHtml.includes('id="waChanSuperUrgentRecipient"'), '#waChanSuperUrgentRecipient input must exist');
assert(settingsHtml.includes('id="waChanHabitsReportsMode"'), '#waChanHabitsReportsMode select must exist');
assert(settingsHtml.includes('id="waChanHabitsReportsRecipient"'), '#waChanHabitsReportsRecipient input must exist');
assert(settingsHtml.includes('id="waChanHabitRemindersMode"'), '#waChanHabitRemindersMode select must exist');
assert(settingsHtml.includes('id="waChanHabitRemindersRecipient"'), '#waChanHabitRemindersRecipient input must exist');
assert(settingsHtml.includes('id="waChanCalendarMode"'), '#waChanCalendarMode select must exist');
assert(settingsHtml.includes('id="waChanCalendarRecipient"'), '#waChanCalendarRecipient input must exist');

// Channel 3 Scope Switcher & Specific Habit Live List Markup
assert(settingsHtml.includes('id="waHabitReminderScopeSegmented"'), '#waHabitReminderScopeSegmented must exist');
assert(settingsHtml.includes('id="waHabitScopeAllBtn"'), '#waHabitScopeAllBtn must exist');
assert(settingsHtml.includes('id="waHabitScopeSpecificBtn"'), '#waHabitScopeSpecificBtn must exist');
assert(settingsHtml.includes('id="waHabitAllWrap"'), '#waHabitAllWrap must exist');
assert(settingsHtml.includes('id="waHabitSpecificWrap"'), '#waHabitSpecificWrap must exist');
assert(settingsHtml.includes('id="waHabitPickerSelect"'), '#waHabitPickerSelect must exist');
assert(settingsHtml.includes('id="waHabitSelectedCard"'), '#waHabitSelectedCard must exist');
assert(settingsHtml.includes('id="waHabitsScrollList"'), '#waHabitsScrollList must exist');

assert(settingsHtml.includes('id="habitsOpenManagerForRemindersBtn"'), '#habitsOpenManagerForRemindersBtn must exist');
assert(settingsHtml.includes('id="habitsActiveRemindersCount"'), '#habitsActiveRemindersCount badge must exist');

// Quick Habit Selector and Message Formulator Modal Markup
assert(settingsHtml.includes('id="waQuickHabitSelect"'), '#waQuickHabitSelect must exist');
assert(settingsHtml.includes('id="btnOpenHabitMsgModalAll"'), '#btnOpenHabitMsgModalAll must exist');
assert(settingsHtml.includes('id="btnOpenHabitMsgModalSpecific"'), '#btnOpenHabitMsgModalSpecific must exist');
assert(settingsHtml.includes('id="waHabitMsgModal"'), '#waHabitMsgModal must exist');
assert(settingsHtml.includes('id="waHabitModalTemplate"'), '#waHabitModalTemplate must exist');
assert(settingsHtml.includes('id="waHabitModalPreviewBubble"'), '#waHabitModalPreviewBubble must exist');
assert(settingsHtml.includes('id="waHabitModalSaveBtn"'), '#waHabitModalSaveBtn must exist');
console.log('✅ Settings HTML markup verified.');

// 4. Testing Habits Dashboard Editor Markup
console.log('\n--- 4. Testing Habits Dashboard Editor Markup ---');
const dashboardHtml = fs.readFileSync(path.join(__dirname, '../windows/habits-dashboard.html'), 'utf8');

assert(dashboardHtml.includes('id="habitInputWaReminderEnabled"'), '#habitInputWaReminderEnabled must exist');
assert(dashboardHtml.includes('id="habitInputWaReminderTime"'), '#habitInputWaReminderTime must exist');
assert(dashboardHtml.includes('id="habitInputWaRecipientMode"'), '#habitInputWaRecipientMode must exist');
assert(dashboardHtml.includes('id="habitInputWaRecipientCustom"'), '#habitInputWaRecipientCustom must exist');
assert(dashboardHtml.includes('id="habitInputWaCustomPrompt"'), '#habitInputWaCustomPrompt must exist');
assert(dashboardHtml.includes('id="btnTestHabitWaReminder"'), '#btnTestHabitWaReminder must exist');
assert(dashboardHtml.includes('id="habitWaTestStatus"'), '#habitWaTestStatus must exist');
console.log('✅ Habits Dashboard HTML markup verified.');

// 5. Testing Settings.js Wiring & Routing Invariants
console.log('\n--- 5. Testing Settings.js Wiring & Routing Hub ---');
const settingsJs = fs.readFileSync(path.join(__dirname, '../windows/js/settings.js'), 'utf8');

assert(settingsJs.includes('waRoutes'), 'settings.js must process waRoutes');
assert(settingsJs.includes('waChanSuperUrgentMode'), 'settings.js must wire waChanSuperUrgentMode');
assert(settingsJs.includes('waChanHabitsReportsMode'), 'settings.js must wire waChanHabitsReportsMode');
assert(settingsJs.includes('waChanHabitRemindersMode'), 'settings.js must wire waChanHabitRemindersMode');
assert(settingsJs.includes('waChanCalendarMode'), 'settings.js must wire waChanCalendarMode');
assert(settingsJs.includes('habitsOpenManagerForRemindersBtn'), 'settings.js must wire habitsOpenManagerForRemindersBtn');
assert(settingsJs.includes('habitsActiveRemindersCount'), 'settings.js must wire habitsActiveRemindersCount');
assert(settingsJs.includes('setupHabitRemindersCustomizer'), 'settings.js must wire setupHabitRemindersCustomizer');
assert(settingsJs.includes('waHabitPickerSelect'), 'settings.js must reference waHabitPickerSelect');
assert(settingsJs.includes('waHabitsScrollList'), 'settings.js must reference waHabitsScrollList');
assert(settingsJs.includes('openHabitMsgModal'), 'settings.js must define openHabitMsgModal');
assert(settingsJs.includes('updateHabitModalLivePreview'), 'settings.js must define updateHabitModalLivePreview');
assert(settingsJs.includes('quickHabitSelect'), 'settings.js must wire quickHabitSelect');
console.log('✅ Settings.js wiring verified.');

// 6. Testing Main Process Defaults & IPC
console.log('\n--- 6. Testing main.js Defaults & IPC Handlers ---');
const mainJs = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

assert(mainJs.includes('habits:test-habit-reminder'), 'main.js must register habits:test-habit-reminder IPC handler');
assert(mainJs.includes('wa-habit-reminder-sent'), 'main.js must handle wa-habit-reminder-sent event');
assert(mainJs.includes('routes:'), 'main.js DEFAULTS.whatsapp must include routes');
console.log('✅ main.js defaults and IPC handlers verified.');

// 7. Testing Preload.js API Expositions
console.log('\n--- 7. Testing preload.js API Expositions ---');
const preloadJs = fs.readFileSync(path.join(__dirname, '../preload.js'), 'utf8');

assert(preloadJs.includes('testHabitReminder:'), 'preload.js must expose testHabitReminder');
console.log('✅ preload.js verified.');

console.log('\n========================================================');
console.log('🎉 ALL WHATSAPP ROUTING & HABIT REMINDER TESTS PASSED!');
console.log('========================================================');
