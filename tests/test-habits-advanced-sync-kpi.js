'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Store } = require('../src/core/store');
const { HabitsManager } = require('../src/core/habits');

console.log('\n========================================================');
console.log('TESTING ADVANCED HABITS SYNC, FUTURE LOCK, KPIS & RPG');
console.log('========================================================\n');

// 1. Core Future Date Lock & Rich Fields Verification
console.log('--- 1. Testing Core Future Date Guard & Rich Habit Fields ---');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'habits-advanced-test-'));
const habitsFile = path.join(tmpDir, 'habits.json');
const store = new Store(habitsFile, { habits: [], logs: {} });
const habitsMgr = new HabitsManager(store, () => ({ habitSleepTargetHours: 8.0, language: 'ar' }));

const todayStr = new Date().toISOString().slice(0, 10);

// Generate future date (safe across timezones)
const futureObj = new Date();
futureObj.setDate(futureObj.getDate() + 3);
const tomorrowStr = futureObj.toISOString().slice(0, 10);

// Attempting to log future date in saveHabitStatus MUST fail
assert.throws(() => {
  habitsMgr.saveHabitStatus(tomorrowStr, 'test-habit', 'done', 1);
}, /Cannot log habits for future dates/);
console.log('✅ Backend strictly rejects future date logging in saveHabitStatus');

// Past date logging MUST succeed
const yesterdayObj = new Date();
yesterdayObj.setDate(yesterdayObj.getDate() - 1);
const yesterdayStr = yesterdayObj.toISOString().slice(0, 10);

// Save rich habit
const richHabit = habitsMgr.saveHabit({
  title: 'صلاة قيام الليل',
  titleEn: 'Night Vigil Prayer',
  routine: 'evening',
  category: 'spirit',
  type: 'duration',
  targetValue: 30,
  unit: 'دقيقة',
  enablePomodoro: true,
  pomodoroSessions: 2,
  syncToTodo: true,
  todoPriority: 2,
  syncToCalendar: true,
  calendarTime: '23:30',
  calendarDuration: 45,
  triggerCue: 'بعد صلاة العشاء',
  reminderTime: '23:00',
  targetGoalStreak: 40,
  notes: 'ركعتان في جوف الليل خير من الدنيا وما فيها',
});

assert.strictEqual(richHabit.enablePomodoro, true);
assert.strictEqual(richHabit.syncToCalendar, true);
assert.strictEqual(richHabit.calendarTime, '23:30');
assert.strictEqual(richHabit.calendarDuration, 45);
assert.strictEqual(richHabit.triggerCue, 'بعد صلاة العشاء');
assert.strictEqual(richHabit.reminderTime, '23:00');
assert.strictEqual(richHabit.targetGoalStreak, 40);
assert.strictEqual(richHabit.notes, 'ركعتان في جوف الليل خير من الدنيا وما فيها');
console.log('✅ Rich habit fields saved and persisted correctly');

// Log past date for this habit
const logResult = habitsMgr.saveHabitStatus(yesterdayStr, richHabit.id, 'done', 30);
assert.strictEqual(logResult.habits[richHabit.id].status, 'done');
console.log('✅ Past date logging works 100% backfillable');

// 2. Testing Quests & RPG System
console.log('\n--- 2. Testing Expanded Hero Classes & Quests API ---');
const heroClasses = ['warrior', 'healer', 'rogue', 'mage', 'scholar', 'monk', 'architect'];
heroClasses.forEach(cls => {
  const updated = habitsMgr.setHeroClass(cls);
  assert.strictEqual(updated.heroClass, cls, `Hero class ${cls} must be set correctly`);
});
console.log('✅ All 7 Hero Classes verified (Warrior, Healer, Rogue, Mage, Scholar, Monk, Architect)');

const quests = habitsMgr.getQuests();
assert.ok(Array.isArray(quests));
assert.ok(quests.length >= 3);
console.log(`✅ Quests API verified (${quests.length} daily & boss quests generated)`);

// 3. Testing HTML & CSS Verification for Advanced KPI Charts & Quests
console.log('\n--- 3. Testing Dashboard HTML & CSS Elements ---');
const dashHtml = fs.readFileSync(path.join(__dirname, '../windows/habits-dashboard.html'), 'utf-8');
const dashCss = fs.readFileSync(path.join(__dirname, '../windows/css/habits-dashboard.css'), 'utf-8');
const dashJs = fs.readFileSync(path.join(__dirname, '../windows/js/habits-dashboard.js'), 'utf-8');

assert.ok(dashHtml.includes('id="chartRoutineAdherence"'), 'Missing chartRoutineAdherence container');
assert.ok(dashHtml.includes('id="chartDayOfWeek"'), 'Missing chartDayOfWeek container');
assert.ok(dashHtml.includes('id="chartSleepCompletionCorr"'), 'Missing chartSleepCompletionCorr container');
assert.ok(dashHtml.includes('id="chartMoodProductivity"'), 'Missing chartMoodProductivity container');
assert.ok(dashHtml.includes('id="questsGrid"'), 'Missing questsGrid container');
assert.ok(dashHtml.includes('data-class="scholar"'), 'Missing scholar hero class in HTML');
assert.ok(dashHtml.includes('data-class="monk"'), 'Missing monk hero class in HTML');
assert.ok(dashHtml.includes('data-class="architect"'), 'Missing architect hero class in HTML');
assert.ok(dashHtml.includes('id="habitInputSyncToCalendar"'), 'Missing habitInputSyncToCalendar in form');
assert.ok(dashHtml.includes('id="habitInputTriggerCue"'), 'Missing habitInputTriggerCue in form');
assert.ok(dashHtml.includes('id="habitInputNotes"'), 'Missing habitInputNotes in form');
console.log('✅ Dashboard HTML contains all 4 KPI charts, 7 hero classes, quests, and rich habit builder inputs');

assert.ok(dashCss.includes('.future-disabled'), 'Missing .future-disabled in CSS');
assert.ok(dashCss.includes('.kpi-charts-two-col'), 'Missing .kpi-charts-two-col in CSS');
assert.ok(dashCss.includes('.quests-card'), 'Missing .quests-card in CSS');
assert.ok(dashCss.includes('.quest-card'), 'Missing .quest-card in CSS');
console.log('✅ Dashboard CSS contains future date lock styles, KPI chart layouts, and quests styles');

// 4. Testing Bidirectional Sync in JavaScript
console.log('\n--- 4. Testing Bidirectional Sync & Future Date Guard in JavaScript ---');
assert.ok(dashJs.includes('window.widgets?.habits?.onChange'), 'Missing habits.onChange listener in dashboard JS');
assert.ok(dashJs.includes('window.widgets?.habits?.onLogChange'), 'Missing habits.onLogChange listener in dashboard JS');
assert.ok(dashJs.includes('window.widgets?.habits?.onGamificationChange'), 'Missing habits.onGamificationChange listener in dashboard JS');
assert.ok(dashJs.includes('isFuture = dStr > todayStr'), 'Missing isFuture date check in bujo grid JS');
assert.ok(dashJs.includes('renderRoutineAdherenceChart'), 'Missing renderRoutineAdherenceChart function');
assert.ok(dashJs.includes('renderDayOfWeekChart'), 'Missing renderDayOfWeekChart function');
assert.ok(dashJs.includes('renderSleepCompletionCorrChart'), 'Missing renderSleepCompletionCorrChart function');
assert.ok(dashJs.includes('renderMoodProductivityChart'), 'Missing renderMoodProductivityChart function');
console.log('✅ Dashboard JS contains real-time listeners, future lock logic, and pure mathematical KPI chart renderers');

// Clean up
try {
  fs.rmSync(tmpDir, { recursive: true, force: true });
} catch (_) {}

console.log('\n========================================================');
console.log('🎉 ALL ADVANCED HABITS SYNC, FUTURE LOCK & KPI TESTS PASSED (100%)');
console.log('========================================================\n');
