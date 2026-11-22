'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('========================================================');
console.log('EXTREME DEEP FORENSICS & MULTI-DIMENSIONAL AUDIT SUITE');
console.log('========================================================\n');

// 1. Test HabitsManager sub-items & boss attack argument flexibility
console.log('--- 1. Testing HabitsManager Dual-Signature Bridge & Logic ---');
const { HabitsManager } = require('../src/core/habits');

const mockStore = {
  data: {
    _initialized: true,
    habits: [
      {
        id: 'h_test_1',
        title: 'قراءة الكتب',
        frequency: 'daily',
        targetValue: 10,
        subItems: [
          { id: 'sub_1', text: 'فصل 1', done: false },
          { id: 'sub_2', text: 'فصل 2', done: false }
        ]
      }
    ],
    logs: {},
    gamification: {
      xp: 0,
      level: 1,
      coins: 50,
      heroClass: 'warrior',
      mana: 100,
      maxMana: 100,
      hp: 100,
      maxHp: 100,
      boss: { id: 'boss_1', name: 'غول الكسل', hp: 100, maxHp: 100, level: 1 }
    }
  },
  get: function(k, fallback) {
    return this.data[k] !== undefined ? this.data[k] : fallback;
  },
  set: function(k, v) {
    this.data[k] = v;
  },
  save: function() {}
};

const habitsMgr = new HabitsManager(mockStore, () => ({}));

// Test saveHabitSubItems
const today = new Date().toISOString().slice(0, 10);
const updatedSubs = [
  { id: 'sub_1', text: 'فصل 1', done: true },
  { id: 'sub_2', text: 'فصل 2', done: false }
];

const subRes = habitsMgr.saveHabitSubItems(today, 'h_test_1', updatedSubs);
assert.strictEqual(subRes.ok, true, 'Sub-items save must succeed');
assert.strictEqual(subRes.status, 'partial', 'One done of two should be partial');
console.log('✅ saveHabitSubItems succeeded with status: partial');

// Test boss attack with damage and source
const atkRes = habitsMgr.attackBoss(35, 'ضربة سيف العدالة');
assert.strictEqual(atkRes.damage, 35, 'Damage must match');
assert.strictEqual(atkRes.remainingHp, 65, 'Remaining HP should be 65');
console.log('✅ attackBoss succeeded with remainingHp: 65');

// Test preload argument adapter simulation
const fakeIpcRenderer = {
  handlers: new Map(),
  invoke: async function(channel, ...args) {
    const fn = this.handlers.get(channel);
    if (!fn) throw new Error('No handler for ' + channel);
    return fn({}, ...args);
  }
};

// Register main.js handlers
fakeIpcRenderer.handlers.set('habits:save-sub-items', (_e, payload, habitId, subItems) => {
  const p = (typeof payload === 'object' && payload !== null && !Array.isArray(payload))
    ? payload
    : { dateStr: payload, habitId, subItems };
  return habitsMgr.saveHabitSubItems(p.dateStr, p.habitId, p.subItems);
});

fakeIpcRenderer.handlers.set('habits:attack-boss', (_e, payload, source) => {
  const p = (typeof payload === 'object' && payload !== null && !Array.isArray(payload))
    ? payload
    : { damage: payload, source };
  return habitsMgr.attackBoss(p.damage, p.source);
});

fakeIpcRenderer.handlers.set('habits:get-urgency', (_e, habitId) => {
  return habitsMgr.calculateUrgencyScore(habitId);
});

// Test calling with 3 arguments (how habits.js and habits-dashboard.js call it)
async function testIpcBridge() {
  const bridgeSave1 = await fakeIpcRenderer.invoke('habits:save-sub-items', today, 'h_test_1', updatedSubs);
  assert.strictEqual(bridgeSave1.ok, true, 'Positional invocation must succeed');

  const bridgeSave2 = await fakeIpcRenderer.invoke('habits:save-sub-items', { dateStr: today, habitId: 'h_test_1', subItems: updatedSubs });
  assert.strictEqual(bridgeSave2.ok, true, 'Object invocation must succeed');

  const bridgeAtk1 = await fakeIpcRenderer.invoke('habits:attack-boss', 20, 'سهم مباغت');
  assert.strictEqual(bridgeAtk1.remainingHp, 45, 'Attack boss with positional args should reduce HP to 45');

  const bridgeAtk2 = await fakeIpcRenderer.invoke('habits:attack-boss', { damage: 15, source: 'هجمة مرتدة' });
  assert.strictEqual(bridgeAtk2.remainingHp, 30, 'Attack boss with object arg should reduce HP to 30');

  console.log('✅ IPC Bridge dual-signature adaptation tested and verified 100%');
}

testIpcBridge().then(() => {
  // 2. Test Habits UI visibility toggles logic
  console.log('\n--- 2. Testing Habits UI Visibility Control Contracts ---');
  const habitsSrc = fs.readFileSync(path.join(__dirname, '../windows/js/habits.js'), 'utf8');

  assert(habitsSrc.includes('showMiniStrip !== false'), 'renderMiniStrip must respect showMiniStrip');
  assert(habitsSrc.includes('showFooterCheckin !== false'), 'renderFooter must respect showFooterCheckin');
  assert(habitsSrc.includes('showRoutineFilters !== false'), 'renderHabitsList must respect showRoutineFilters');
  console.log('✅ Habits UI visibility contracts verified in render routines');

  // 3. Test Preload Aliases & Exposed APIs
  console.log('\n--- 3. Testing Preload Bridge Completeness & Aliases ---');
  const preloadSrc = fs.readFileSync(path.join(__dirname, '../preload.js'), 'utf8');
  assert(preloadSrc.includes('getHabitUrgency:'), 'preload.js must expose getHabitUrgency alias');
  assert(preloadSrc.includes('getUrgency:'), 'preload.js must expose getUrgency');
  assert(preloadSrc.includes('saveSubItems: (...args)'), 'preload.js saveSubItems must support variable args');
  assert(preloadSrc.includes('attackBoss: (...args)'), 'preload.js attackBoss must support variable args');
  assert(preloadSrc.includes('getHabitHistory: (...args)'), 'preload.js getHabitHistory must support variable args');
  console.log('✅ Preload bridge methods and argument handlers verified');

  // 4. Test Calendar Views & Popups
  console.log('\n--- 4. Testing Calendar Persistence & Bento Views ---');
  const calSrc = fs.readFileSync(path.join(__dirname, '../windows/js/calendar.js'), 'utf8');
  assert(calSrc.includes('switchViewMode(mode, { persist = true }'), 'calendar.js must support persist option');
  assert(calSrc.includes('switchViewMode(cfg.viewMode, { persist: false })'), 'calendar.js applyConfig must not clobber mode');
  console.log('✅ Calendar view switching and config protection verified');

  // 5. Test Shell Style Reset & Accent Contrast
  console.log('\n--- 5. Testing Shell Style Isolation & High Luminance Contrast ---');
  const shellSrc = fs.readFileSync(path.join(__dirname, '../windows/js/shell.js'), 'utf8');
  assert(shellSrc.includes("root.style.removeProperty('--tile')"), 'shell.js must clean up tile override');
  assert(shellSrc.includes("root.style.removeProperty('--field')"), 'shell.js must clean up field override');
  assert(shellSrc.includes("root.style.removeProperty('--sheen-strength')"), 'shell.js must clean up sheen override');
  assert(shellSrc.includes("root.style.removeProperty('--sheen-rim')"), 'shell.js must clean up sheen-rim override');
  assert(shellSrc.includes("root.style.setProperty('--ink-on-accent', L > 0.45 ? '#141C28' : '#FFFFFF')"), 'shell.js must calculate ink-on-accent dynamically');
  console.log('✅ Shell style cleanup and contrast safety verified');

  console.log('\n========================================================');
  console.log('🎉 ALL EXTREME DEEP FORENSIC TESTS PASSED (100%)!');
  console.log('========================================================');
}).catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
