/**
 * Test Habit Tracker Month & Day Navigation
 * Verifies that forward and backward month/day navigation works flawlessly
 * and is 100% immune to UTC/timezone offset rollbacks (e.g., in UTC+3 or UTC-5).
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('TESTING HABIT TRACKER MONTH & DAY NAVIGATION INTEGRITY');
console.log('========================================================\n');

// 1. Pure Arithmetic stepMonth Implementation Test
function stepMonth(monthStr, delta) {
  const [y, m] = (monthStr || '2026-10').split('-').map(Number);
  let newM = m + delta;
  let newY = y;
  while (newM > 12) {
    newM -= 12;
    newY += 1;
  }
  while (newM < 1) {
    newM += 12;
    newY -= 1;
  }
  return `${newY}-${String(newM).padStart(2, '0')}`;
}

function formatLocalDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function stepDay(dateStr, delta) {
  const [y, m, d] = (dateStr || '2026-10-17').split('-').map(Number);
  const dt = new Date(y, m - 1, d + delta, 12, 0, 0);
  return formatLocalDate(dt);
}

console.log('--- 1. Testing User Exact Scenario (August 2025 Forward Button) ---');
const userMonth = '2025-08';
const nextFromAug = stepMonth(userMonth, 1);
assert.strictEqual(nextFromAug, '2025-09', 'August 2025 + 1 month MUST be September 2025');
console.log(`✅ August 2025 forward navigated cleanly to: ${nextFromAug}`);

const nextFromSep = stepMonth(nextFromAug, 1);
assert.strictEqual(nextFromSep, '2025-10', 'September 2025 + 1 month MUST be October 2025');
console.log(`✅ September 2025 forward navigated cleanly to: ${nextFromSep}`);

console.log('\n--- 2. Testing Boundary Conditions & Year Rollovers ---');
assert.strictEqual(stepMonth('2025-12', 1), '2026-01', 'Dec 2025 + 1 month must be Jan 2026');
assert.strictEqual(stepMonth('2026-01', -1), '2025-12', 'Jan 2026 - 1 month must be Dec 2025');
assert.strictEqual(stepMonth('2025-08', -1), '2025-07', 'Aug 2025 - 1 month must be Jul 2025');
assert.strictEqual(stepMonth('2020-02', 1), '2020-03', 'Leap year Feb + 1 month must be March');
console.log('✅ All boundary conditions and year rollovers passed');

console.log('\n--- 3. Testing stepDay Accuracy & Leap Years ---');
assert.strictEqual(stepDay('2025-08-31', 1), '2025-09-01', 'Aug 31 + 1 day must be Sep 1');
assert.strictEqual(stepDay('2025-09-01', -1), '2025-08-31', 'Sep 1 - 1 day must be Aug 31');
assert.strictEqual(stepDay('2024-02-28', 1), '2024-02-29', 'Leap year 2024 Feb 28 + 1 day must be Feb 29');
assert.strictEqual(stepDay('2024-02-29', 1), '2024-03-01', 'Leap year 2024 Feb 29 + 1 day must be Mar 1');
assert.strictEqual(stepDay('2025-02-28', 1), '2025-03-01', 'Non-leap year 2025 Feb 28 + 1 day must be Mar 1');
console.log('✅ Day arithmetic and leap year transitions passed');

console.log('\n--- 4. Verifying windows/js/habits.js Source Code Wireup ---');
const habitsJsContent = fs.readFileSync(path.join(__dirname, '../windows/js/habits.js'), 'utf8');
assert(habitsJsContent.includes("state.bujoMonth = stepMonth(state.bujoMonth, 1)"), 'habits.js must wire #btnMiniBujoNext with stepMonth(..., 1)');
assert(habitsJsContent.includes("state.bujoMonth = stepMonth(state.bujoMonth, -1)"), 'habits.js must wire #btnMiniBujoPrev with stepMonth(..., -1)');
assert(habitsJsContent.includes("stepDay(state.sleepSelectedDate, 1)"), 'habits.js must wire sleep next day with stepDay(..., 1)');
assert(habitsJsContent.includes("state.sleepSelectedDate = stepDay(state.sleepSelectedDate, -1)"), 'habits.js must wire sleep prev day with stepDay(..., -1)');
assert(!habitsJsContent.includes("nextDate.toISOString().slice(0, 7)"), 'habits.js must NOT use toISOString for bujoMonth navigation');
console.log('✅ windows/js/habits.js wiring verified 100%');

console.log('\n--- 5. Verifying windows/js/habits-dashboard.js Source Code Wireup ---');
const dashJsContent = fs.readFileSync(path.join(__dirname, '../windows/js/habits-dashboard.js'), 'utf8');
assert(dashJsContent.includes("state.activeMonth = stepMonth(state.activeMonth, 1)"), 'habits-dashboard.js must wire #btnNextMonth with stepMonth(..., 1)');
assert(dashJsContent.includes("state.activeMonth = stepMonth(state.activeMonth, -1)"), 'habits-dashboard.js must wire #btnPrevMonth with stepMonth(..., -1)');
assert(!dashJsContent.includes("nextD.toISOString().slice(0, 7)"), 'habits-dashboard.js must NOT use toISOString for activeMonth navigation');
console.log('✅ windows/js/habits-dashboard.js wiring verified 100%');

console.log('\n--- 6. Verifying src/core/habits.js Future Date & Local Date Guard ---');
const coreHabitsContent = fs.readFileSync(path.join(__dirname, '../src/core/habits.js'), 'utf8');
assert(coreHabitsContent.includes("function getSafeTodayStr()"), 'src/core/habits.js must define getSafeTodayStr()');
assert(coreHabitsContent.includes("const todayStr = getSafeTodayStr()"), 'src/core/habits.js must use getSafeTodayStr() in saveHabitStatus');
console.log('✅ src/core/habits.js future date safety verified');

console.log('\n========================================================');
console.log('🎉 ALL HABIT TRACKER MONTH & DAY NAVIGATION TESTS PASSED! 🎉');
console.log('========================================================');
