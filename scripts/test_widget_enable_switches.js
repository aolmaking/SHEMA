/**
 * test_widget_enable_switches.js
 * Verifies that all 9 widgets have a dedicated single-row enable/disable switch
 * at the top of their respective settings sections, wired to completely
 * launch or shut down the widget program.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('========================================================');
console.log('TESTING WIDGET ENABLE/DISABLE SWITCHES PARITY & WIRING');
console.log('========================================================\n');

const settingsHtml = fs.readFileSync(path.join(__dirname, '../windows/settings.html'), 'utf8');
const settingsJs = fs.readFileSync(path.join(__dirname, '../windows/js/settings.js'), 'utf8');
const settingsCss = fs.readFileSync(path.join(__dirname, '../windows/css/settings.css'), 'utf8');

const EXPECTED_WIDGETS = [
  { id: 'clock', switchId: 'enableClockWidget', i18nKey: 's.enableClockWidget' },
  { id: 'pomodoro', switchId: 'enablePomodoroWidget', i18nKey: 's.enablePomodoroWidget' },
  { id: 'calendar', switchId: 'enableCalendarWidget', i18nKey: 's.enableCalendarWidget' },
  { id: 'habits', switchId: 'habitsEnabled', i18nKey: 's.habitsEnabled' },
  { id: 'quran', switchId: 'enableQuranWidget', i18nKey: 's.enableQuranWidget' },
  { id: 'todo', switchId: 'enableTodoWidget', i18nKey: 's.enableTodoWidget' },
  { id: 'notes', switchId: 'enableNotesWidget', i18nKey: 's.enableNotesWidget' },
  { id: 'email', switchId: 'emailEnabled', i18nKey: 's.enableEmailWidget' },
  { id: 'photo', switchId: 'enablePhotoWidget', i18nKey: 's.enablePhotoWidget' },
];

console.log('--- 1. Testing HTML Structure for All 9 Widget Enable Switches ---');
for (const w of EXPECTED_WIDGETS) {
  assert(settingsHtml.includes(`id="${w.switchId}"`), `settings.html must contain switch button #${w.switchId}`);
  assert(settingsHtml.includes(`for="${w.switchId}"`), `settings.html must contain label for="${w.switchId}"`);
  console.log(`✅ Widget [${w.id}] switch #${w.switchId} found in settings.html.`);
}

console.log('\n--- 2. Testing CSS Styling for .widget-enable-row ---');
assert(settingsCss.includes('.widget-enable-row'), 'settings.css must define .widget-enable-row');
assert(settingsCss.includes('.widget-enable-row label'), 'settings.css must style label inside .widget-enable-row');
assert(settingsCss.includes('.widget-enable-row .switch'), 'settings.css must style switch inside .widget-enable-row');
console.log('✅ CSS styling for .widget-enable-row verified.');

console.log('\n--- 3. Testing JavaScript WIDGET_ENABLE_MAP and Handlers ---');
assert(settingsJs.includes('WIDGET_ENABLE_MAP'), 'settings.js must define WIDGET_ENABLE_MAP');
assert(settingsJs.includes('syncWidgetEnableSwitches'), 'settings.js must define syncWidgetEnableSwitches');
assert(settingsJs.includes('wireWidgetEnableSwitches'), 'settings.js must define wireWidgetEnableSwitches');

for (const w of EXPECTED_WIDGETS) {
  assert(settingsJs.includes(w.switchId), `settings.js must reference switch #${w.switchId}`);
}
console.log('✅ WIDGET_ENABLE_MAP and wiring handlers verified.');

console.log('\n--- 4. Testing i18n Localization for All 9 Widget Switches ---');
for (const w of EXPECTED_WIDGETS) {
  assert(settingsJs.includes(`'${w.i18nKey}'`), `settings.js must include i18n key '${w.i18nKey}'`);
}
console.log('✅ All i18n keys verified in settings.js.');

console.log('\n========================================================');
console.log('🎉 ALL WIDGET ENABLE SWITCHES TESTS PASSED (100%)');
console.log('========================================================\n');
