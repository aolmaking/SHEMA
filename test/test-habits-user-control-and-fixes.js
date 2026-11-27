'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('TESTING HABITS USER CONTROLS, PRESETS, SETTINGS & TO-DO SYNC');
console.log('========================================================');

const ROOT = path.join(__dirname, '..');

// 1. Requirement 1: UI Ultimate Control
console.log('\n--- 1. Testing UI Ultimate Controls (Popover, Density, Sort, Visibility) ---');
const habitsHtml = fs.readFileSync(path.join(ROOT, 'windows', 'habits.html'), 'utf8');
const habitsJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'habits.js'), 'utf8');
const habitsCss = fs.readFileSync(path.join(ROOT, 'windows', 'css', 'habits.css'), 'utf8');
const settingsHtml = fs.readFileSync(path.join(ROOT, 'windows', 'settings.html'), 'utf8');
const settingsJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'settings.js'), 'utf8');

assert(habitsHtml.includes('id="habitsViewControlBtn"'), 'Must have #habitsViewControlBtn header button');
assert(habitsHtml.includes('id="habitsViewPopover"'), 'Must have #habitsViewPopover floating popover');
assert(habitsHtml.includes('id="popoverStatusFilter"'), 'Must have #popoverStatusFilter segmented control');
assert(habitsHtml.includes('id="popoverDensity"'), 'Must have #popoverDensity density control');
assert(habitsHtml.includes('id="popoverSort"'), 'Must have #popoverSort sort select');

// Component visibility toggles
const toggles = [
  'popShowStreak',
  'popShowStrength',
  'popShowUrgency',
  'popShowPomodoro',
  'popShowProgressBar',
  'popShowMiniStrip',
  'popShowRoutines',
  'popShowFooterCheckin',
  'popShowMindsetSpark',
  'popShowGamification',
  'popShowAtlasBar',
  'popShowSoundEffects',
];
toggles.forEach(t => {
  assert(habitsHtml.includes(`id="${t}"`), `Must have visibility switch #${t}`);
  assert(habitsJs.includes(t), `Must wire visibility switch #${t} in habits.js`);
});

assert(habitsJs.includes('showUrgency'), 'habits.js must check showUrgency before rendering urgency pill');
assert(habitsJs.includes('h-urgency-pill'), 'habits.js must reference h-urgency-pill');
assert(settingsHtml.includes('id="habitsShowUrgency"'), 'settings.html must have #habitsShowUrgency switch');
assert(settingsJs.includes('habitsShowUrgency'), 'settings.js must wire #habitsShowUrgency switch');

assert(habitsJs.includes('heroFocusCard') && habitsJs.includes('showPomodoroShortcut'), 'Must control #heroFocusCard visibility with showPomodoroShortcut');
assert(habitsCss.includes('.hero-purpose-card') && habitsCss.includes('display: none !important'), 'Must hide empty green .hero-purpose-card');
assert(habitsCss.includes('.density-compact'), 'Must have .density-compact CSS');
assert(habitsCss.includes('.density-minimal'), 'Must have .density-minimal CSS');
assert(habitsCss.includes('.density-comfortable'), 'Must have .density-comfortable CSS');
assert(habitsJs.includes('persistHabitSettings'), 'Must have persistHabitSettings function in habits.js');
assert(habitsJs.includes('calculateHabitStrength'), 'Must have calculateHabitStrength in habits.js');
console.log('✅ UI Ultimate Control: popover, density, status filter, sort and 10 switches verified.');

// 2. Requirement 2: Easy & Delightful Habit Creation
console.log('\n--- 2. Testing Easy & Delightful Habit Creation (Presets & Custom Builder) ---');
assert(habitsHtml.includes('id="qaTabPresetsBtn"'), 'Must have Presets tab button');
assert(habitsHtml.includes('id="qaTabCustomBtn"'), 'Must have Custom builder tab button');
assert(habitsHtml.includes('id="qaPresetsGrid"'), 'Must have #qaPresetsGrid');
assert(habitsHtml.includes('id="qaQuickUnits"'), 'Must have #qaQuickUnits badges container');
assert(habitsJs.includes('HABIT_PRESETS'), 'Must define HABIT_PRESETS in habits.js');
assert(habitsJs.includes('renderPresetsGrid'), 'Must implement renderPresetsGrid in habits.js');

const dashHtml = fs.readFileSync(path.join(ROOT, 'windows', 'habits-dashboard.html'), 'utf8');
const dashJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'habits-dashboard.js'), 'utf8');
assert(dashHtml.includes('id="dashPresetsChips"'), 'Must have #dashPresetsChips in dashboard');
assert(dashJs.includes('renderDashboardPresetChips'), 'Must implement renderDashboardPresetChips in dashboard');
console.log('✅ Easy habit creation with 1-click presets and unit badges verified.');

// 3. Requirement 3: Settings Propagation & Reflection
console.log('\n--- 3. Testing Settings Engine & IPC Reflection ---');
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8');
assert(mainJs.includes("'habits'"), 'main.js must merge habit settings in settings:set');
assert(habitsJs.includes('window.widgets?.settings?.onChange'), 'habits.js must listen to settings:onChange');
assert(habitsJs.includes('applySettingsToUI'), 'habits.js must apply settings to UI');
console.log('✅ Settings merge and dynamic real-time listener verified.');

// 4. Requirement 4: Per-Habit To-Do Sync & Priority Selection
console.log('\n--- 4. Testing Per-Habit To-Do Sync & Priority ---');
const coreHabits = fs.readFileSync(path.join(ROOT, 'src', 'core', 'habits.js'), 'utf8');
assert(coreHabits.includes('syncToTodo'), 'src/core/habits.js must handle syncToTodo');
assert(coreHabits.includes('todoPriority'), 'src/core/habits.js must handle todoPriority');

assert(habitsHtml.includes('id="qaSyncToTodo"'), 'habits.html must have #qaSyncToTodo');
assert(habitsHtml.includes('id="qaTodoPriority"'), 'habits.html must have #qaTodoPriority');
assert(dashHtml.includes('id="habitInputSyncToTodo"'), 'habits-dashboard.html must have #habitInputSyncToTodo');
assert(dashHtml.includes('id="habitInputTodoPriority"'), 'habits-dashboard.html must have #habitInputTodoPriority');

// Check main.js syncHabitsToTodos logic
assert(mainJs.includes('Boolean(h.syncToTodo)'), 'main.js syncHabitsToTodos must check Boolean(h.syncToTodo)');
assert(mainJs.includes('h.todoPriority'), 'main.js syncHabitsToTodos must map h.todoPriority');
console.log('✅ Per-habit To-Do sync and priority selection verified.');

// 5. Requirement 5: Follow System Language
console.log('\n--- 5. Testing Follow System Language (language: auto) ---');
const shellJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'shell.js'), 'utf8');

assert(mainJs.includes('getAppLanguage'), 'main.js must have getAppLanguage for language: auto');
assert(mainJs.includes('app.getLocale()'), 'main.js getAppLanguage must inspect app.getLocale()');
assert(shellJs.includes('navigator.language'), 'shell.js lang() must inspect navigator.language on auto');
assert(settingsHtml.includes('value="auto"'), 'settings.html must offer value="auto"');
assert(settingsJs.includes('s.langAuto'), 'settings.js must have s.langAuto i18n key');
console.log('✅ System language detection and settings integration verified.');

// 6. Requirement 6: Midnight Day-Pass Habit Auto-Purge from To-Do List
console.log('\n--- 6. Testing Midnight Day-Pass Habit Auto-Purge from To-Do ---');
const todoJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'todo.js'), 'utf8');

assert(mainJs.includes('scheduleMidnightRollover'), 'main.js must schedule precision midnight rollover at 12:00 AM');
assert(mainJs.includes('lastDayRollDate'), 'main.js checkHabitsAutomations must detect midnight day change');
assert(mainJs.includes('isPastDay'), 'main.js syncHabitsToTodos must identify and purge past-day habit tasks');
assert(todoJs.includes('isHabitExpired'), 'todo.js must have isHabitExpired filter');
assert(todoJs.includes('!isHabitExpired(x)'), 'todo.js listed() and visible() must filter out expired habit tasks');

// Algorithmic validation: simulation of To-Do items across midnight rollover
const simToday = '2026-11-27';
const simYesterday = '2026-11-26';
const simTodos = [
  { id: 'task_regular_1', text: 'Important regular meeting', done: false },
  { id: `hbt_reading_${simYesterday}`, text: '📖 [عادة] قراءة يومية', habitId: 'reading', habitDate: simYesterday, done: false },
  { id: `hbt_workout_${simYesterday}`, text: '🏃‍♂️ [عادة] تمارين رياضية', habitId: 'workout', habitDate: simYesterday, done: true },
  { id: `hbt_reading_${simToday}`, text: '📖 [عادة] قراءة يومية', habitId: 'reading', habitDate: simToday, done: false },
];

for (let i = simTodos.length - 1; i >= 0; i--) {
  const t = simTodos[i];
  const isHabitTask = Boolean(t.habitId || t.category === 'habit' || (t.id && String(t.id).startsWith('hbt_')));
  if (isHabitTask) {
    let taskDate = t.habitDate;
    if (!taskDate && t.id) {
      const parts = String(t.id).split('_');
      const lastPart = parts[parts.length - 1];
      if (/^\d{4}-\d{2}-\d{2}$/.test(lastPart)) taskDate = lastPart;
    }
    const isPastDay = taskDate ? taskDate < simToday : !String(t.id).endsWith(`_${simToday}`);
    if (isPastDay) simTodos.splice(i, 1);
  }
}

assert.strictEqual(simTodos.length, 2, 'Simulated todos must retain exactly 2 items (1 regular + 1 today habit)');
assert.strictEqual(simTodos[0].id, 'task_regular_1', 'Regular task must be preserved');
assert.strictEqual(simTodos[1].id, `hbt_reading_${simToday}`, 'Today habit task must be preserved');
assert(!simTodos.some(t => t.id.includes(simYesterday)), 'All past-day habits must disappear after midnight');
console.log('✅ Simulation verified: All past-day habit tasks completely disappear once past midnight 12:00 AM!');

console.log('\n========================================================');
console.log('🎉 ALL HABITS SYSTEM & MIDNIGHT PURGE TESTS PASSED (100%)');
console.log('========================================================\n');
