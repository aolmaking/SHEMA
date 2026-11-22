'use strict';

/**
 * Test Suite: Habits, Life Intelligence, and Wellness System
 * 
 * Tests:
 * 1. HabitsManager Core Instantiation & Schema Integrity
 * 2. Multi-Input Types (Boolean, Numeric, Duration, Percentage, Rating)
 * 3. Flexible Frequency (Daily, Weekly Targets, Specific Days of Week)
 * 4. Skip Logic (Exemptions preserve streak & habit strength score)
 * 5. Daily Wellness Index (DWI) 0-100 Composite Formula
 * 6. Sleep & Mood Lab Log Persistence (Bedtime, Wake time, Mood, Stress)
 * 7. Real Mathematical KPI & Pearson Correlation (r) Engine
 * 8. Data Export & Backup (JSON & CSV) & Safe Restore/Merge
 * 9. WhatsApp Executive Infographic Report Generator (Unicode progress bars)
 * 10. Architectural Separation: Desktop Tile Widget vs Dedicated Dashboard Window
 * 11. Settings Window 22 Habits Controls & Bilingual i18n
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Store } = require('../src/core/store');
const { HabitsManager, DEFAULT_HABITS } = require('../src/core/habits');

console.log('========================================================');
console.log('TESTING HABITS, LIFE INTELLIGENCE & WELLNESS SYSTEM');
console.log('========================================================\n');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'habits-test-'));
const habitsFile = path.join(tmpDir, 'habits.json');
const store = new Store(habitsFile, { habits: [], logs: {} });
const manager = new HabitsManager(store, () => ({ habitSleepTargetHours: 8.0, language: 'ar' }));

// 1. Core Instantiation & Schema Integrity
console.log('--- 1. Testing HabitsManager Core Instantiation & Defaults ---');
const initialHabits = manager.getHabits();
assert(Array.isArray(initialHabits) && initialHabits.length >= 5, 'Must seed initial default habits');
assert(initialHabits.some(h => h.id === 'hbt-read-01'), 'Must include reading habit');
assert(initialHabits.some(h => h.id === 'hbt-workout-02'), 'Must include workout habit');
console.log('✅ Core instantiation and defaults verified.');

// 2. Custom Habit Creation with Multi-Input Types
console.log('\n--- 2. Testing Custom Habit Creation with Multi-Input Types ---');
const customHabit = manager.saveHabit({
  title: 'حل مسائل خوارزميات',
  titleEn: 'LeetCode Algorithms',
  category: 'learning',
  routine: 'morning',
  type: 'number',
  targetValue: 3,
  unit: 'مسائل',
  unitEn: 'problems',
  frequency: { type: 'daily' },
  color: '#8b5cf6',
  icon: '💻',
});
assert.strictEqual(customHabit.title, 'حل مسائل خوارزميات');
assert.strictEqual(customHabit.type, 'number');
assert.strictEqual(customHabit.targetValue, 3);
assert.strictEqual(manager.getHabit(customHabit.id).unit, 'مسائل');
console.log('✅ Custom multi-input habit creation verified.');

// 3. Flexible Frequency Testing (Weekly Target & Specific Days)
console.log('\n--- 3. Testing Flexible Frequency Logic ---');
const weeklyHabit = manager.saveHabit({
  title: 'السباحة الرياضية',
  titleEn: 'Swimming',
  type: 'boolean',
  frequency: { type: 'weekly_target', targetDaysPerWeek: 3 },
});
const specificDaysHabit = manager.saveHabit({
  title: 'مراجعة الميزانية المالية',
  titleEn: 'Budget Review',
  type: 'boolean',
  frequency: { type: 'specific_days', daysOfWeek: [5] }, // Friday only (5)
});

const fridayDate = new Date(2026, 9, 23); // Friday
const mondayDate = new Date(2026, 9, 19); // Monday
assert.strictEqual(manager.isHabitScheduledForDate(specificDaysHabit, fridayDate), true, 'Should be scheduled on Friday');
assert.strictEqual(manager.isHabitScheduledForDate(specificDaysHabit, mondayDate), false, 'Should NOT be scheduled on Monday');
console.log('✅ Flexible frequency (weekly target & specific days) verified.');

// 4. Skip Logic & Streak Preservation
console.log('\n--- 4. Testing Skip Logic & Streak Preservation ---');
const streakHabit = manager.saveHabit({
  title: 'أذكار واستغفار',
  type: 'boolean',
  frequency: { type: 'daily' },
});

// Simulate 3 days of completion leading up to today
const dStr = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

manager.saveHabitStatus(dStr(4), streakHabit.id, 'done', 1);
manager.saveHabitStatus(dStr(3), streakHabit.id, 'done', 1);
manager.saveHabitStatus(dStr(2), streakHabit.id, 'done', 1);

// Day 4: SKIPPED (travel/rest day)
manager.saveHabitStatus(dStr(1), streakHabit.id, 'skip', 0, 'سفر في القطار');

// Day 5: DONE
manager.saveHabitStatus(dStr(0), streakHabit.id, 'done', 1);

const streakInfo = manager.calculateStreak(streakHabit.id);
assert(streakInfo.current >= 4, `Streak should be preserved across skip days (expected >= 4, got ${streakInfo.current})`);

const scoreWithoutDecay = manager.calculateHabitStrength(streakHabit.id, 14);
assert(scoreWithoutDecay > 20, 'Habit strength score should be preserved without harsh drop');
console.log('✅ Skip logic & streak preservation verified 100%.');

// 5. Daily Wellness Index (DWI) Composite Score
console.log('\n--- 5. Testing Daily Wellness Index (DWI) 0-100 Score ---');
const testDay = '2026-10-15';
for (const h of manager.getHabits(false)) {
  manager.saveHabitStatus(testDay, h.id, 'done', h.targetValue || 1);
}
manager.saveSleepLog(testDay, { durationHours: 8.0, quality: 5 }); // Perfect sleep
manager.saveMoodLog(testDay, { rating: 5, scale: 5 }); // Great mood

const dwiScore = manager.calculateDailyWellnessIndex(testDay);
assert(typeof dwiScore === 'number' && dwiScore >= 80 && dwiScore <= 100, `DWI score must be high on perfect day (got ${dwiScore})`);
console.log(`✅ Daily Wellness Index calculated successfully: ${dwiScore}%`);

// 6. Sleep & Mood Lab Log Persistence
console.log('\n--- 6. Testing Sleep & Mood Lab Log Persistence ---');
manager.saveStressLog(testDay, 2, 3.5); // Stress 2/10, Screen 3.5h
const dayRecord = manager.getLog(testDay);
assert.strictEqual(dayRecord.sleep.durationHours, 8.0);
assert.strictEqual(dayRecord.mood.rating, 5);
assert.strictEqual(dayRecord.stress.level, 2);
assert.strictEqual(dayRecord.screenTime.hours, 3.5);

// Check disk persistence
manager.store.flush();
const reloadedStore = new Store(habitsFile, { habits: [], logs: {} });
assert.strictEqual(reloadedStore.get('logs')[testDay].sleep.durationHours, 8.0);
console.log('✅ Sleep & Mood Lab log persistence verified on disk.');

// 7. Real Mathematical KPI & Pearson Correlation Engine
console.log('\n--- 7. Testing Mathematical KPI & Pearson Correlation (r) ---');
// Test pure Pearson calculation with known positive correlation
const xValues = [5, 6, 7, 8, 9];
const yValues = [2, 3, 4, 4, 5];
const rVal = HabitsManager.pearsonCorrelation(xValues, yValues);
assert(rVal > 0.85, `Pearson r must detect strong positive correlation (got ${rVal})`);

// Feed 5 days of data into manager for month 2026-10
for (let i = 1; i <= 5; i++) {
  const dStr = `2026-10-0${i}`;
  manager.saveHabitStatus(dStr, customHabit.id, 'done', 3);
  manager.saveSleepLog(dStr, { durationHours: 7.0 + (i * 0.2) });
  manager.saveMoodLog(dStr, { rating: 3 + Math.min(2, i) });
}
const analytics = manager.computeAnalytics('2026-10');
assert.strictEqual(analytics.month, '2026-10');
assert(analytics.totalTrackedDays >= 5, 'Must track at least 5 days in month');
assert(analytics.habitStats.length >= 1, 'Must include habit strength stats');
console.log('✅ Mathematical KPI and Pearson Correlation engine verified.');

// 8. Data Export (JSON / CSV) & Backup Restore
console.log('\n--- 8. Testing Backup & Data Export (JSON / CSV) ---');
const jsonExport = manager.exportData('json');
assert(jsonExport.includes('"habits"') && jsonExport.includes('"logs"'), 'JSON export must contain habits and logs');

const csvExport = manager.exportData('csv');
assert(csvExport.includes('Date,HabitId,HabitTitle,Status,Value'), 'CSV export must contain proper headers');
assert(csvExport.includes('2026-10-15'), 'CSV must contain logged dates');

// Test import & merge
const importPayload = {
  habits: [{
    id: 'hbt-imported-99',
    title: 'عادة مسترجعة من نسخة سابقة',
    type: 'boolean',
  }],
  logs: {
    '2026-09-01': { habits: { 'hbt-imported-99': { status: 'done', value: 1 } } },
  },
};
const importRes = manager.importData(importPayload, true);
assert.strictEqual(importRes.success, true);
assert(manager.getHabits(true).some(h => h.id === 'hbt-imported-99'), 'Imported habit must exist');
console.log('✅ Data backup export and restore verified 100%.');

// 9. WhatsApp Executive Infographic Report Generator
console.log('\n--- 9. Testing WhatsApp Executive Infographic Report Generator ---');
const waReportAr = manager.generateWhatsAppReport('monthly', '2026-10');
assert(waReportAr.includes('التقرير الشهري'), 'Arabic report must have header');
assert(waReportAr.includes('█') || waReportAr.includes('░'), 'Report must feature Unicode progress bars');
assert(waReportAr.includes('مؤشر'), 'Report must mention key metrics');

const waReportEn = manager.generateWhatsAppReport('weekly', '2026-10');
assert(waReportEn.length > 50, 'English report must generate properly');
console.log('✅ WhatsApp Executive Infographic Report generation verified.');

// 10. Architectural Separation & Window Files Integrity
console.log('\n--- 10. Testing Architectural Separation & Window Files ---');
const tileHtml = fs.readFileSync(path.join(__dirname, '../windows/habits.html'), 'utf8');
const tileCss = fs.readFileSync(path.join(__dirname, '../windows/css/habits.css'), 'utf8');
const tileJs = fs.readFileSync(path.join(__dirname, '../windows/js/habits.js'), 'utf8');

assert(tileHtml.includes('id="dwiBadge"'), 'Tile must include Daily Wellness Index badge');
assert(tileHtml.includes('id="routineFilterBar"'), 'Tile must include Routine stacking filter');
assert(tileHtml.includes('id="miniStrip"'), 'Tile must include Mini 7-Day matrix strip');
assert(tileCss.includes('.dwi-badge'), 'CSS must define .dwi-badge');
assert(tileJs.includes('calculateTodayDWI'), 'JS must implement calculateTodayDWI()');

const dashHtml = fs.readFileSync(path.join(__dirname, '../windows/habits-dashboard.html'), 'utf8');
const dashCss = fs.readFileSync(path.join(__dirname, '../windows/css/habits-dashboard.css'), 'utf8');
const dashJs = fs.readFileSync(path.join(__dirname, '../windows/js/habits-dashboard.js'), 'utf8');

assert(dashHtml.includes('id="bujoTable"'), 'Dashboard must include Bullet Journal matrix table');
assert(dashHtml.includes('id="chartMoodContainer"'), 'Dashboard must include Sleep & Mood Lab');
assert(dashHtml.includes('id="strengthTable"'), 'Dashboard must include Habit Strength table');
assert(dashHtml.includes('id="btnSendWaNow"'), 'Dashboard must include WhatsApp Report dispatcher');
assert(dashCss.includes('.bujo-table'), 'Dashboard CSS must style .bujo-table');
assert(dashJs.includes('renderBujoGrid'), 'Dashboard JS must implement renderBujoGrid()');
console.log('✅ Architectural separation between lightweight desktop tile and heavy dashboard verified.');

// 11. Settings Window 27 Controls & Bilingual Wiring
console.log('\n--- 11. Testing Settings Window 27 Habits Controls ---');
const settingsHtml = fs.readFileSync(path.join(__dirname, '../windows/settings.html'), 'utf8');
const settingsJs = fs.readFileSync(path.join(__dirname, '../windows/js/settings.js'), 'utf8');

assert(settingsHtml.includes('data-tab="habits"'), 'settings.html must have nav tab data-tab="habits"');
assert(settingsHtml.includes('data-pane="habits"'), 'settings.html must have tab pane data-pane="habits"');

// Verify all 27 controls (including 5 psychology & micro-interaction controls)
const controls = [
  'habitsEnabled', 'habitsTheme', 'habitsDefaultView', 'habitsWeekStart', 'habitsGridDotStyle',
  'habitsShowDailyTotals', 'habitsSoundEffects', 'habitsConfettiCelebration', 'habitsProgressRingStyle',
  'habitsSmartRoutineAnchor', 'habitsDailyMotivationalQuote', 'habitsForgivingStreak', 'habitsGraceDays',
  'habitsSleepTargetHours', 'habitsSleepWarningMin', 'habitsTargetBedtime', 'habitsTargetWakeTime',
  'habitsMoodScaleType', 'habitsTrackStress', 'habitsTrackScreenTime', 'habitsSyncToTodo',
  'habitsSyncToCalendar', 'habitsWaEveningPrompt', 'habitsWaEveningTime', 'habitsWaWeeklyDigest',
  'habitsWaMonthlyReport', 'habitsWaRecipientOverride'
];

for (const c of controls) {
  assert(settingsHtml.includes(`id="${c}"`), `settings.html must contain control #${c}`);
  assert(settingsJs.includes(c), `settings.js must wire control #${c}`);
}
console.log(`✅ All ${controls.length} controls verified in Settings HTML and JavaScript.`);

// 12. Micro-Interactions & Behavioral Psychology Engine
console.log('\n--- 12. Testing Behavioral Psychology & Micro-Interactions Hooks ---');
assert(tileHtml.includes('id="habitsConfettiCanvas"'), 'habits.html must have celebration confetti canvas');
assert(tileHtml.includes('id="habitsRingWrap"'), 'habits.html must have Bento circular progress ring');
assert(tileHtml.includes('id="mindsetSparkBanner"'), 'habits.html must have daily mindset spark banner');
assert(tileJs.includes('triggerConfetti'), 'habits.js must implement triggerConfetti()');
assert(tileJs.includes('playChime'), 'habits.js must implement playChime()');
assert(tileJs.includes('applySmartRoutineAnchor'), 'habits.js must implement applySmartRoutineAnchor()');
assert(tileJs.includes('renderMindsetSpark'), 'habits.js must implement renderMindsetSpark()');
assert(tileCss.includes('.streak-flame.mythic'), 'habits.css must define .streak-flame.mythic heat level');
console.log('✅ Micro-interactions and behavioral psychology engine verified.');

// 13. Habitica, HabitFlow, uhabits, and OpenHabitTracker Innovations
console.log('\n--- 13. Testing Habitica, HabitFlow, uhabits, and OpenHabitTracker Mechanics ---');

// A. Habitica RPG Gamification
const beforeGame = manager.getGamification();
assert(beforeGame.level >= 1, 'Initial level must be >= 1');

// Save a hard habit and mark done -> awards 80 XP and 16 Coins
const todayDateStr = new Date().toISOString().slice(0, 10);
const hardHabit = manager.saveHabit({
  title: 'تمرين كاليستنكس مكثف',
  difficulty: 'hard',
  direction: 'positive'
});
manager.saveHabitStatus(todayDateStr, hardHabit.id, 'done');
let updatedGame = manager.getGamification();
assert(updatedGame.xp > beforeGame.xp || updatedGame.level > beforeGame.level, 'XP/Level must increase after completing hard habit');
assert(updatedGame.coins >= beforeGame.coins + 16, 'Hard habit must award at least 16 Coins');

// Negative Habit Breaker -> awards bonus XP and resilience coin
const prevCoins = updatedGame.coins;
const breakerHabit = manager.saveHabit({
  title: 'الإقلاع عن السكريات',
  direction: 'negative',
  difficulty: 'medium'
});
manager.saveHabitStatus(todayDateStr, breakerHabit.id, 'done');
updatedGame = manager.getGamification();
// Medium gives 40 XP + 5 resilience = 45 XP, and 8 + 1 = 9 coins
assert(updatedGame.coins >= prevCoins + 9, 'Breaker habit must award coins + resilience bonus');

// Custom Reward Shop & Claiming
const customReward = manager.saveReward({ title: 'ساعة قراءة حرة', cost: 10, icon: '📚' });
assert.strictEqual(customReward.title, 'ساعة قراءة حرة');
const coinsBeforeClaim = manager.getGamification().coins;
const claimRes = manager.claimReward(customReward.id);
assert.strictEqual(claimRes.success, true, 'Should successfully claim reward with sufficient coins');
assert.strictEqual(manager.getGamification().coins, coinsBeforeClaim - 10, 'Coins must be deducted');

// B. HabitFlow 90-Day Contribution Heatmap Matrix
const heatmap = manager.getActivityHeatmap(90);
assert(Array.isArray(heatmap) && heatmap.length === 90, 'Heatmap must contain 90 days');
const todayCell = heatmap[heatmap.length - 1];
assert(todayCell.completed >= 2, 'Today should record the 2 completed habits');
assert(todayCell.level >= 1, 'Intensity level must be > 0');

// C. uhabits Flexible Frequency (every_x_days)
const intervalHabit = manager.saveHabit({
  title: 'تنظيف عميق للمكتب',
  frequency: { type: 'every_x_days', interval: 3 }
});
assert.strictEqual(intervalHabit.frequency.type, 'every_x_days');
assert.strictEqual(intervalHabit.frequency.interval, 3);
assert(manager.isHabitScheduledForDate(intervalHabit, new Date()), 'Should be scheduled on start day');

// D. OpenHabitTracker Daily Reflection Micro-Notes
manager.saveDayNote('2026-10-16', 'يوم إنتاجي رائع وتركيز عالي');
const fetchedNote = manager.getDayNote('2026-10-16');
assert.strictEqual(fetchedNote, 'يوم إنتاجي رائع وتركيز عالي');

console.log('✅ Habitica, HabitFlow, uhabits, and OpenHabitTracker mechanics verified 100%!');

// Clean up
try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}

console.log('\n========================================================');
console.log('🌟 ALL HABITS & LIFE INTELLIGENCE SYSTEM TESTS PASSED 100%! 🌟');
console.log('========================================================\n');
