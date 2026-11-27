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

console.log('\n========================================================');
console.log('🎉 ALL HABIT TYPES, QUANTITIES & LOGGING TESTS PASSED (100%)');
console.log('========================================================\n');
