'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const EventEmitter = require('events');

const {
  AtlasEngine,
  AtlasStore,
  AtlasEconomyEngine,
  AtlasEventBus,
  createAtlasEvent,
  ATLAS_EVENT_TYPES,
  calculateLevelRequirement,
  WAYFINDER_LEVELS,
  XP_BASE_MAP,
  GOLD_BASE_MAP,
} = require('../src/core/atlas');

console.log('========================================================');
console.log('🧪 TESTING THE LIVING ATLAS — PHASE 1 FOUNDATION & CORE');
console.log('========================================================\n');

const tmpDir = path.join(os.tmpdir(), `atlas-test-${Date.now()}`);
fs.mkdirSync(tmpDir, { recursive: true });
const testStoreFile = path.join(tmpDir, 'test-atlas.json');

try {
  // --- TEST 1: Constants & Level Curve Mathematics ---
  console.log('--- 1. Testing Mathematical Constants & Level Curve ---');
  assert.strictEqual(calculateLevelRequirement(1), 300, 'Level 1 req should be 300 XP');
  assert.strictEqual(calculateLevelRequirement(2), 708, 'Level 2 req should be 708 XP');
  assert.strictEqual(calculateLevelRequirement(3), 1179, 'Level 3 req should be 1179 XP');
  assert.strictEqual(calculateLevelRequirement(4), 1699, 'Level 4 req should be 1699 XP');
  assert.strictEqual(calculateLevelRequirement(5), 2259, 'Level 5 req should be 2259 XP');

  // Verify pre-computed table matches formula
  for (const row of WAYFINDER_LEVELS) {
    const calculated = calculateLevelRequirement(row.level);
    assert.strictEqual(
      row.xpRequired,
      calculated,
      `WAYFINDER_LEVELS level ${row.level} (${row.xpRequired}) must match formula (${calculated})`
    );
  }
  console.log('✅ Level curve formulas verified against pre-computed tables.');

  // --- TEST 2: Canonical Event Model & Bus Idempotency ---
  console.log('\n--- 2. Testing Canonical Event Model & Bus Idempotency ---');
  const event = createAtlasEvent({
    eventType: ATLAS_EVENT_TYPES.HABIT_COMPLETED,
    source: 'user_input',
    entityId: 'habit-read-01',
    payload: { difficulty: 'medium' },
  });

  assert.ok(event.eventId, 'Event must have a unique eventId');
  assert.strictEqual(event.eventType, ATLAS_EVENT_TYPES.HABIT_COMPLETED);
  assert.strictEqual(event.userConfirmed, true);

  const bus = new AtlasEventBus();
  assert.strictEqual(bus.isProcessed(event.eventId), false);
  bus.markProcessed(event.eventId);
  assert.strictEqual(bus.isProcessed(event.eventId), true);

  let busEventReceived = false;
  bus.on('atlas:event', (e) => {
    busEventReceived = true;
    assert.strictEqual(e.eventId, 'evt-bus-test');
  });

  bus.dispatch(createAtlasEvent({
    eventId: 'evt-bus-test',
    eventType: ATLAS_EVENT_TYPES.HABIT_MICRO_STEP,
  }));
  assert.strictEqual(busEventReceived, true, 'Bus should dispatch and emit event');
  console.log('✅ Canonical Event Bus and Idempotency verified.');

  // --- TEST 3: Economy Engine XP & Gold Formulas (Zero Streak Multiplier) ---
  console.log('\n--- 3. Testing Economy Engine (Pure XP & Zero Streak Multiplier) ---');
  // Full execution: 100% XP
  assert.strictEqual(AtlasEconomyEngine.calculateXp('trivial', false), 10);
  assert.strictEqual(AtlasEconomyEngine.calculateXp('easy', false), 20);
  assert.strictEqual(AtlasEconomyEngine.calculateXp('medium', false), 35);
  assert.strictEqual(AtlasEconomyEngine.calculateXp('hard', false), 50);
  assert.strictEqual(AtlasEconomyEngine.calculateXp('epic', false), 75);

  // Micro-step execution: 40% XP
  assert.strictEqual(AtlasEconomyEngine.calculateXp('trivial', true), 4);
  assert.strictEqual(AtlasEconomyEngine.calculateXp('easy', true), 8);
  assert.strictEqual(AtlasEconomyEngine.calculateXp('medium', true), 14);
  assert.strictEqual(AtlasEconomyEngine.calculateXp('hard', true), 20);
  assert.strictEqual(AtlasEconomyEngine.calculateXp('epic', true), 30);

  // Haven Gold calculation
  assert.strictEqual(AtlasEconomyEngine.calculateGold('medium', false), 10);
  assert.strictEqual(AtlasEconomyEngine.calculateGold('medium', true), 4);

  // Level evaluation from cumulative XP
  const lvl1 = AtlasEconomyEngine.evaluateLevel(150);
  assert.strictEqual(lvl1.level, 1);
  assert.strictEqual(lvl1.xpInCurrentLevel, 150);
  assert.strictEqual(lvl1.progressPercent, 50);

  const lvl2 = AtlasEconomyEngine.evaluateLevel(400); // 300 (Lv1) + 100 into Lv2
  assert.strictEqual(lvl2.level, 2);
  assert.strictEqual(lvl2.xpInCurrentLevel, 100);
  assert.strictEqual(lvl2.titleAr, 'ماسح التضاريس');

  // Descriptive 30-day completion rate
  const rate1 = AtlasEconomyEngine.calculateCompletionRate30d(24, 30);
  assert.strictEqual(rate1, 80);
  console.log('✅ Economy Engine, Level Evaluation, and Micro-Step math verified.');

  // --- TEST 4: Atlas Store & Data Sovereignty (Selective Purge) ---
  console.log('\n--- 4. Testing Atlas Store & Granular Purge (Data Sovereignty) ---');
  const store = new AtlasStore(testStoreFile);
  assert.strictEqual(store.data.wayfinder.level, 1);
  assert.strictEqual(store.data.wayfinder.xp, 0);

  store.addXpAndGold(120, 30);
  assert.strictEqual(store.data.wayfinder.xp, 120);
  assert.strictEqual(store.data.wayfinder.havenGold, 30);

  store.addAffinityPoints('VIT', 2);
  assert.strictEqual(store.data.wayfinder.affinities.VIT, 2);
  assert.strictEqual(store.data.worldTrails.illuminatedAffinities.VIT, true);

  // Add dummy habit obstacle and purge
  store.data.obstacles.push({ id: 'obs-01', linkedHabitId: 'hbt-delete-me' });
  store.data.chronicleEntries.push({ id: 'c-01', sourceEventIds: ['evt-hbt-delete-me-1'] });
  store.save();

  store.selectivePurgeHabit('hbt-delete-me');
  assert.strictEqual(store.data.obstacles.length, 0, 'Obstacle linked to habit must be purged');
  assert.strictEqual(store.data.chronicleEntries.length, 0, 'Chronicle linked to habit must be purged');
  console.log('✅ Atlas Store persistence and Granular Purge verified.');

  // --- TEST 5: Atlas Engine & HabitsManager Event Bridge ---
  console.log('\n--- 5. Testing Atlas Engine & HabitsManager Integration Bridge ---');
  const engine = new AtlasEngine({ storePath: path.join(tmpDir, 'engine-atlas.json') });

  let levelUpEmitted = false;
  engine.on('atlas:level-up', (payload) => {
    levelUpEmitted = true;
    assert.strictEqual(payload.newLevel, 2);
  });

  let rewardEarned = null;
  engine.on('atlas:reward-earned', (payload) => {
    rewardEarned = payload;
  });

  // Create mock HabitsManager
  const mockHabitsMgr = new EventEmitter();
  mockHabitsMgr.getHabit = (id) => ({
    id,
    difficulty: 'epic', // 75 XP
    category: 'learning', // maps to 'WIS'
  });

  engine.bridgeHabitsManager(mockHabitsMgr);

  // Trigger habit completion events
  mockHabitsMgr.emit('log-changed', {
    dateStr: '2026-11-22',
    habitId: 'hbt-test-01',
    status: 'done',
    isMicroStep: false,
  });

  assert.ok(rewardEarned, 'Reward event must be emitted');
  assert.strictEqual(rewardEarned.xpEarned, 75);
  assert.strictEqual(rewardEarned.goldEarned, 25);
  assert.strictEqual(rewardEarned.affinity, 'WIS');

  // Push enough XP to trigger level-up (Level 1 threshold = 300 XP)
  for (let i = 0; i < 4; i++) {
    mockHabitsMgr.emit('log-changed', {
      dateStr: '2026-11-22',
      habitId: `hbt-lvl-${i}`,
      status: 'done',
      isMicroStep: false,
    });
  }

  assert.strictEqual(levelUpEmitted, true, 'Level-up event must be emitted when passing 300 XP');

  const dashState = engine.getDashboardState();
  assert.strictEqual(dashState.wayfinder.level, 2);
  assert.strictEqual(dashState.wayfinder.titleAr, 'ماسح التضاريس');
  assert.strictEqual(dashState.worldTrails.illuminatedAffinities.WIS, true);
  console.log('✅ Atlas Engine, Event Bridge, and Level-Up lifecycle verified.');

  console.log('\n========================================================');
  console.log('🎉 ALL ATLAS PHASE 1 TESTS PASSED WITH 100% SUCCESS!');
  console.log('========================================================\n');
} finally {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch { /* best effort cleanup */ }
}
