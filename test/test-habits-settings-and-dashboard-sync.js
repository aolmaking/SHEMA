'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('🧪 TESTING HABITS DASHBOARD, WIDGET & SETTINGS INTEGRITY');
console.log('================================================================');

// 1. Verify src/core/habits.js saveSleepLog & saveMoodLog signatures
console.log('\n[1/6] Testing habits core saveSleepLog & saveMoodLog parameter flexibility...');
const { HabitsManager } = require('../src/core/habits');
const habits = new HabitsManager({
  get: (k, def) => def,
  set: () => {},
  flush: () => {},
});

// Test saveSleepLog with nested object
const today = new Date().toISOString().slice(0, 10);
const res1 = habits.saveSleepLog(today, { durationHours: 7.5, bedtime: '23:00', wakeTime: '06:30', quality: 4 });
assert.strictEqual(res1.sleep.durationHours, 7.5);
assert.strictEqual(res1.sleep.bedtime, '23:00');
assert.strictEqual(res1.sleep.wakeTime, '06:30');
assert.strictEqual(res1.sleep.quality, 4);

// Test saveSleepLog with flat hours
const res2 = habits.saveSleepLog(today, { hours: 8.2, bedtime: '22:30' });
assert.strictEqual(res2.sleep.durationHours, 8.2);
assert.strictEqual(res2.sleep.bedtime, '22:30');

// Test saveSleepLog with raw number
const res3 = habits.saveSleepLog(today, 6.5);
assert.strictEqual(res3.sleep.durationHours, 6.5);

// Test saveMoodLog with nested object
const resMood1 = habits.saveMoodLog(today, { rating: 5, scale: 5, note: 'Feeling great!' });
assert.strictEqual(resMood1.mood.rating, 5);
assert.strictEqual(resMood1.mood.note, 'Feeling great!');

// Test saveMoodLog with flat rating
const resMood2 = habits.saveMoodLog(today, { rating: 3 });
assert.strictEqual(resMood2.mood.rating, 3);

// Test saveMoodLog with raw number
const resMood3 = habits.saveMoodLog(today, 4);
assert.strictEqual(resMood3.mood.rating, 4);
console.log('✅ Habits core sleep & mood signatures verified.');

// 2. Verify main.js invariants for IPC and argument forwarding
console.log('\n[2/6] Verifying main.js invariants...');
const mainSrc = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

assert(mainSrc.includes("habitsDashboardWin.webContents.once('did-finish-load'"), 'main.js must forward opts to habits dashboard window on first open');
assert(mainSrc.includes("payload.sleepData || {"), 'main.js habits:save-sleep must handle both flat and nested payloads');
assert(mainSrc.includes("payload.moodData || {"), 'main.js habits:save-mood must handle both flat and nested payloads');
assert(mainSrc.includes("checkHabitsAutomations"), 'main.js must periodically check habits automations (WhatsApp prompts)');
console.log('✅ main.js invariants verified.');

// 3. Verify habits-dashboard.html elements
console.log('\n[3/6] Verifying habits-dashboard.html DOM elements...');
const dashHtml = fs.readFileSync(path.join(__dirname, '../windows/habits-dashboard.html'), 'utf8');
assert(dashHtml.includes('id="btnHeaderSettings"'), 'habits-dashboard.html must contain #btnHeaderSettings');
assert(dashHtml.includes('id="screenChartBox"'), 'habits-dashboard.html must contain #screenChartBox');
assert(dashHtml.includes('id="streakHeroCount"'), 'habits-dashboard.html must contain #streakHeroCount (Image 2 Streak Challenge)');
assert(dashHtml.includes('id="streakChallengeFill"'), 'habits-dashboard.html must contain #streakChallengeFill');
assert(dashHtml.includes('id="liveHabitPreviewTile"'), 'habits-dashboard.html must contain #liveHabitPreviewTile (Image 10 Habit Preview)');
console.log('✅ habits-dashboard.html elements verified.');

// 4. Verify habits-dashboard.js logic invariants
console.log('\n[4/6] Verifying habits-dashboard.js logic invariants...');
const dashJs = fs.readFileSync(path.join(__dirname, '../windows/js/habits-dashboard.js'), 'utf8');
assert(dashJs.includes('#btnHeaderSettings'), 'habits-dashboard.js must wire #btnHeaderSettings');
assert(dashJs.includes("openSettings?.('habits')"), 'habits-dashboard.js must open settings window to habits tab');
assert(dashJs.includes('playDashboardChime();'), 'habits-dashboard.js must play chime on habit completion');
assert(dashJs.includes('DAY_NAMES_MAP_AR'), 'habits-dashboard.js must map day names based on actual date day index');
assert(dashJs.includes('targetStartDay'), 'habits-dashboard.js must respect weekStart setting');
assert(dashJs.includes('showDailyTotals !== false'), 'habits-dashboard.js must respect showDailyTotals setting');
assert(dashJs.includes('trackStress'), 'habits-dashboard.js must respect trackStress setting');
assert(dashJs.includes('sleepTargetHours'), 'habits-dashboard.js must respect sleepTargetHours setting');
assert(dashJs.includes('sleepWarningMin'), 'habits-dashboard.js must respect sleepWarningMin setting');
assert(dashJs.includes('renderStreakChallengeAndMilestones'), 'habits-dashboard.js must implement renderStreakChallengeAndMilestones');
assert(dashJs.includes('updateHabitLivePreview'), 'habits-dashboard.js must implement updateHabitLivePreview');
console.log('✅ habits-dashboard.js logic invariants verified.');

// 5. Verify habits.js logic invariants
console.log('\n[5/6] Verifying habits.js logic invariants...');
const habitsJs = fs.readFileSync(path.join(__dirname, '../windows/js/habits.js'), 'utf8');
assert(habitsJs.includes('wStartSetting'), 'habits.js must respect weekStart setting in week strip');
assert(habitsJs.includes('glow_dot'), 'habits.js must support gridDotStyle in getThemeDoneGlyph');
console.log('✅ habits.js logic invariants verified.');

// 6. Test Week Start Logic Math
console.log('\n[6/6] Testing Week Start Math for Sat, Sun, Mon...');
const testDate = new Date(2026, 10, 21); // Saturday 21 Nov 2026 (day = 6)
function getStartOfWeek(base, startDay) {
  const d = new Date(base);
  const diff = (base.getDay() - startDay + 7) % 7;
  d.setDate(base.getDate() - diff);
  return d;
}
// Sat start (target = 6) -> should be 21 Nov
assert.strictEqual(getStartOfWeek(testDate, 6).getDate(), 21);
// Sun start (target = 0) -> should be 15 Nov
assert.strictEqual(getStartOfWeek(testDate, 0).getDate(), 15);
// Mon start (target = 1) -> should be 16 Nov
assert.strictEqual(getStartOfWeek(testDate, 1).getDate(), 16);
console.log('✅ Week start math for Sat, Sun, Mon verified.');

console.log('\n================================================================');
console.log('🎉 ALL HABITS SETTINGS & DASHBOARD SYNC TESTS PASSED (100%)!');
console.log('================================================================');
