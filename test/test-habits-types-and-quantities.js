'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('========================================================');
console.log('🧪 TESTING HABIT TYPES, QUANTITIES, SANITIZATION & LOGGING');
console.log('========================================================');

const ROOT = path.join(__dirname, '..');
const { HabitsManager } = require(path.join(ROOT, 'src', 'core', 'habits.js'));

// Mock store for HabitsManager
class MockStore {
  constructor(initialData = {}) {
    this.data = JSON.parse(JSON.stringify(initialData));
  }
  get(key, defaultVal) {
    return this.data[key] !== undefined ? this.data[key] : defaultVal;
  }
  set(key, val) {
    this.data[key] = JSON.parse(JSON.stringify(val));
  }
}

// 1. Test Habit Creation & Sanitization across all 5 types
console.log('\n--- 1. Testing Core Habit Sanitization & Invariants ---');
const store = new MockStore({
  habits: [],
  logs: {},
  gamification: { stats: { str: 10, int: 10, con: 10, per: 10 }, mana: 50, xp: 0, level: 1, coins: 0 },
});
const manager = new HabitsManager(store);

// a) Percentage habit with custom target 88% and messy/empty unit
const hPct = manager.saveHabit({
  title: 'إنجاز المذاكرة بالنسبة',
  type: 'percentage',
  targetValue: 88,
  unit: 'cups, pages...', // Should be forced to %
});
assert.strictEqual(hPct.type, 'percentage');
assert.strictEqual(hPct.targetValue, 88, 'Percentage habit must preserve custom target (e.g. 88%)');
assert.strictEqual(hPct.unit, '%', 'Percentage habit unit must always be strictly locked to "%"');
assert.strictEqual(hPct.unitEn, '%');

// b) Boolean habit with unintended targetValue or unit passed
const hBool = manager.saveHabit({
  title: 'صلاة الوتر',
  type: 'boolean',
  targetValue: 50,
  unit: 'صفحة',
});
assert.strictEqual(hBool.type, 'boolean');
assert.strictEqual(hBool.targetValue, 1, 'Boolean habit targetValue must always be 1');
assert.strictEqual(hBool.unit, '', 'Boolean habit unit must be empty string');

// c) Duration habit with empty unit
const hDur = manager.saveHabit({
  title: 'قراءة الكتب',
  type: 'duration',
  targetValue: 45,
  unit: '', // Should default to دقيقة / min
});
assert.strictEqual(hDur.type, 'duration');
assert.strictEqual(hDur.targetValue, 45);
assert.strictEqual(hDur.unit, 'دقيقة', 'Duration habit with empty unit must default to دقيقة');
assert.strictEqual(hDur.unitEn, 'min');

// d) Number habit with custom unit
const hNum = manager.saveHabit({
  title: 'شرب الماء',
  type: 'number',
  targetValue: 8,
  unit: 'أكواب',
});
assert.strictEqual(hNum.type, 'number');
assert.strictEqual(hNum.targetValue, 8);
assert.strictEqual(hNum.unit, 'أكواب');

// e) Rating habit
const hRate = manager.saveHabit({
  title: 'مستوى الطاقة اليومي',
  type: 'rating',
  targetValue: 99,
  unit: 'anything',
});
assert.strictEqual(hRate.type, 'rating');
assert.strictEqual(hRate.targetValue, 5, 'Rating habit targetValue must be 5');
assert.strictEqual(hRate.unit, '⭐');
console.log('✅ Core habit creation & sanitization for all 5 types verified 100%.');

// 2. Test Logging and Value Integrity
console.log('\n--- 2. Testing Log Value Integrity & Done Upgrading ---');
const today = new Date().toISOString().slice(0, 10);

// Log percentage habit marked done with null or hardcoded 1
const dayLogPct = manager.saveHabitStatus(today, hPct.id, 'done', 1);
assert.strictEqual(dayLogPct.habits[hPct.id].status, 'done');
assert.strictEqual(dayLogPct.habits[hPct.id].value, 88, 'Marking percentage habit done must store full target 88, not 1');

// Log number habit marked done without specifying value
const dayLogNum = manager.saveHabitStatus(today, hNum.id, 'done', null);
assert.strictEqual(dayLogNum.habits[hNum.id].status, 'done');
assert.strictEqual(dayLogNum.habits[hNum.id].value, 8, 'Marking number habit done with null value must store full target 8');

// Log number habit partial
const dayLogNumPartial = manager.saveHabitStatus(today, hNum.id, 'partial', null);
assert.strictEqual(dayLogNumPartial.habits[hNum.id].status, 'partial');
assert.strictEqual(dayLogNumPartial.habits[hNum.id].value, 4, 'Partial status with null value must store half target 4');

// Log duration habit marked done with 1
const dayLogDur = manager.saveHabitStatus(today, hDur.id, 'done', 1);
assert.strictEqual(dayLogDur.habits[hDur.id].value, 45, 'Marking duration habit done must store full target 45 minutes');
console.log('✅ Log value integrity, partial calculation, and full-target upgrade verified 100%.');

// 3. Test Reminder Message Target Formatting
console.log('\n--- 3. Testing Reminder Message Target Formatting ---');
const remPct = manager.buildHabitReminderMessage(hPct, 3, 'ar');
assert(remPct.includes('(88%)'), `Percentage reminder must display (88%), got: ${remPct}`);

const remNum = manager.buildHabitReminderMessage(hNum, 5, 'ar');
assert(remNum.includes('(8 أكواب)'), `Number reminder must display (8 أكواب), got: ${remNum}`);
console.log('✅ Reminder message target formatting verified 100%.');

// 4. Test Frontend Code Consistency
console.log('\n--- 4. Testing Frontend Habits Code Invariants ---');
const habitsJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'habits.js'), 'utf8');
const dashJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'habits-dashboard.js'), 'utf8');
const habitsHtml = fs.readFileSync(path.join(ROOT, 'windows', 'habits.html'), 'utf8');
const dashHtml = fs.readFileSync(path.join(ROOT, 'windows', 'habits-dashboard.html'), 'utf8');
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8');

// Dashboard visual pills and quick units
assert(dashHtml.includes('data-type="percentage"'), 'Dashboard must have percentage visual pill');
assert(dashHtml.includes('data-type="rating"'), 'Dashboard must have rating visual pill');
assert(dashHtml.includes('id="dashQuickUnits"'), 'Dashboard must have #dashQuickUnits container');
assert(dashJs.includes('updateTargetVisibility'), 'Dashboard JS must define updateTargetVisibility');
assert(dashJs.includes('computeNextHabitLog'), 'Dashboard JS must define computeNextHabitLog');

// Habits widget quick-add
assert(habitsHtml.includes('id="qaTargetLabel"'), 'habits.html must have #qaTargetLabel');
assert(habitsHtml.includes('id="qaUnitLabel"'), 'habits.html must have #qaUnitLabel');
assert(habitsJs.includes("qaSelectedType === 'percentage'"), 'habits.js updateQaTypeUI must handle percentage');
assert(habitsJs.includes("qaSelectedType === 'duration'"), 'habits.js updateQaTypeUI must handle duration');

// Percentage habit interaction in widget
assert(habitsJs.includes('h.type === \'percentage\''), 'habits.js must handle percentage habit cards');
assert(habitsJs.includes('Math.min(100, Math.round((curVal / target) * 100))'), 'habits.js must calculate percentage fill proportional to target');

// To-Do sync passing full target
assert(mainJs.includes('fullVal = h ? (Number(h.targetValue) || (h.type === \'percentage\' ? 100 : 1)) : 1'), 'main.js must pass full target to saveHabitStatus when checking off todo');

console.log('✅ Frontend and IPC consistency verified 100%.');

// 5. Test Percentage Stepping, Automatic Distribution & Multi-Click Progression (e.g. 5 Prayers)
console.log('\n--- 5. Testing Percentage Stepping, Auto-Distribution & 5-Step Prayer Progression ---');

// a) Create habit "كل الصلوات الخمس" with 5 parts
const hPrayers = manager.saveHabit({
  title: 'كل الصلوات الخمس',
  titleEn: 'Five Daily Prayers',
  type: 'percentage',
  targetValue: 100,
  partsCount: 5,
});

assert.strictEqual(hPrayers.type, 'percentage');
assert.strictEqual(hPrayers.targetValue, 100);
assert.strictEqual(hPrayers.partsCount, 5, 'Parts count must be exactly 5 for 5 prayers');
assert.strictEqual(hPrayers.stepValue, 20, 'Auto-distributed step percentage must be 100 / 5 = 20%');

// Simulate 5 successive clicks from the widget / dashboard:
let simVal = 0;
const step = hPrayers.stepValue; // 20

// Click 1: Fajr -> 20%
simVal += step;
let log1 = manager.saveHabitStatus(today, hPrayers.id, simVal >= hPrayers.targetValue ? 'done' : 'partial', simVal);
assert.strictEqual(log1.habits[hPrayers.id].status, 'partial', 'Click 1 (20%) must be partial');
assert.strictEqual(log1.habits[hPrayers.id].value, 20, 'Click 1 must advance value to 20%');

// Click 2: Dhuhr -> 40%
simVal += step;
let log2 = manager.saveHabitStatus(today, hPrayers.id, simVal >= hPrayers.targetValue ? 'done' : 'partial', simVal);
assert.strictEqual(log2.habits[hPrayers.id].status, 'partial', 'Click 2 (40%) must be partial');
assert.strictEqual(log2.habits[hPrayers.id].value, 40, 'Click 2 must advance value to 40%');

// Click 3: Asr -> 60%
simVal += step;
let log3 = manager.saveHabitStatus(today, hPrayers.id, simVal >= hPrayers.targetValue ? 'done' : 'partial', simVal);
assert.strictEqual(log3.habits[hPrayers.id].status, 'partial', 'Click 3 (60%) must be partial');
assert.strictEqual(log3.habits[hPrayers.id].value, 60, 'Click 3 must advance value to 60%');

// Click 4: Maghrib -> 80%
simVal += step;
let log4 = manager.saveHabitStatus(today, hPrayers.id, simVal >= hPrayers.targetValue ? 'done' : 'partial', simVal);
assert.strictEqual(log4.habits[hPrayers.id].status, 'partial', 'Click 4 (80%) must be partial');
assert.strictEqual(log4.habits[hPrayers.id].value, 80, 'Click 4 must advance value to 80%');

// Click 5: Isha -> 100% -> DONE!
simVal += step;
let log5 = manager.saveHabitStatus(today, hPrayers.id, simVal >= hPrayers.targetValue ? 'done' : 'partial', simVal);
assert.strictEqual(log5.habits[hPrayers.id].status, 'done', 'Click 5 (100%) must achieve full completion (done)');
assert.strictEqual(log5.habits[hPrayers.id].value, 100, 'Click 5 must reach exactly 100%');

// Click 6: Reset cycle -> 0%
simVal = 0;
let log6 = manager.saveHabitStatus(today, hPrayers.id, 'none', 0);
assert(!log6.habits[hPrayers.id] || log6.habits[hPrayers.id].status === 'none', 'Reset click must revert to none / empty');

// b) Verify 4-quarter habit distribution (4 steps = 25% each)
const hQuarters = manager.saveHabit({
  title: 'إنجاز ورد الحفظ (4 أرباع)',
  type: 'percentage',
  targetValue: 100,
  partsCount: 4,
});
assert.strictEqual(hQuarters.partsCount, 4);
assert.strictEqual(hQuarters.stepValue, 25, '100% with 4 parts must distribute to 25% per click');

// c) Verify HTML and JS elements for percentage steps
assert(dashHtml.includes('id="percentageStepGroup"'), 'Dashboard HTML must have #percentageStepGroup');
assert(dashHtml.includes('id="habitInputParts"'), 'Dashboard HTML must have #habitInputParts');
assert(dashHtml.includes('id="habitInputStepPct"'), 'Dashboard HTML must have #habitInputStepPct');
assert(habitsHtml.includes('id="qaPercentageStepGroup"'), 'Widget habits HTML must have #qaPercentageStepGroup');
assert(habitsHtml.includes('id="qaPartsCount"'), 'Widget habits HTML must have #qaPartsCount');
assert(habitsHtml.includes('id="qaStepPct"'), 'Widget habits HTML must have #qaStepPct');

// Check frontend JS percentage logic
assert(habitsJs.includes('h.partsCount'), 'habits.js must inspect h.partsCount');
assert(habitsJs.includes('h.stepValue'), 'habits.js must inspect h.stepValue');
assert(dashJs.includes('h.partsCount'), 'habits-dashboard.js must inspect h.partsCount');
assert(dashJs.includes('h.stepValue'), 'habits-dashboard.js must inspect h.stepValue');

console.log('✅ 5-part prayer progression, auto-distribution, and UI controls verified 100%.');

// 6. Test Duration Step Progression (e.g. 10 min per click to 60 min target)
console.log('\n--- 6. Testing Duration Stepping & Single-Click Progression ---');
const hReading = manager.saveHabit({
  title: 'جلسة قراءة وتركيز',
  type: 'duration',
  targetValue: 60,
  stepValue: 10,
});
assert.strictEqual(hReading.type, 'duration');
assert.strictEqual(hReading.targetValue, 60);
assert.strictEqual(hReading.stepValue, 10, 'Duration habit stepValue must be preserved as 10 minutes');

// Simulate 6 clicks: +10 min each
let durSimVal = 0;
for (let c = 1; c <= 6; c++) {
  durSimVal += 10;
  let log = manager.saveHabitStatus(today, hReading.id, durSimVal >= 60 ? 'done' : 'partial', durSimVal);
  if (c < 6) {
    assert.strictEqual(log.habits[hReading.id].status, 'partial', `Click ${c} (${durSimVal}m) must be partial`);
  } else {
    assert.strictEqual(log.habits[hReading.id].status, 'done', 'Click 6 (60m) must achieve done status');
  }
  assert.strictEqual(log.habits[hReading.id].value, durSimVal);
}

// Check markup and JS for duration steps
assert(dashHtml.includes('id="durationStepGroup"'), 'Dashboard HTML must have #durationStepGroup');
assert(dashHtml.includes('id="habitInputDurationStep"'), 'Dashboard HTML must have #habitInputDurationStep');
assert(habitsHtml.includes('id="qaDurationStepGroup"'), 'habits.html must have #qaDurationStepGroup');
assert(habitsHtml.includes('id="qaDurationStepInput"'), 'habits.html must have #qaDurationStepInput');
assert(habitsJs.includes('h-duration-btn'), 'habits.js must define h-duration-btn');

console.log('✅ Duration 10-min progression, customizable stepValue, and UI markup verified 100%.');

console.log('\n========================================================');
console.log('🎉 ALL HABIT TYPES, QUANTITIES & LOGGING TESTS PASSED (100%)');
console.log('========================================================\n');
