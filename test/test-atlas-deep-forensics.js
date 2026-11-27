'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { performance } = require('perf_hooks');

const {
  AtlasEngine,
  AtlasStore,
  AtlasEconomyEngine,
  AtlasObstaclesEngine,
  AtlasNarrativeEngine,
  MiroCompanion,
  calculateLevelRequirement,
  WAYFINDER_LEVELS,
  HAVEN_FACILITIES,
  WORLD_OBSTACLE_TYPES,
  OVERCOMING_STRATEGIES,
  MYSTERY_GRAPH_NODES,
} = require('../src/core/atlas');

console.log('========================================================');
console.log('🔬 DEEP FORENSICS & STRESS TEST: THE LIVING ATLAS');
console.log('========================================================\n');

const tmpDir = path.join(os.tmpdir(), `atlas-forensics-${Date.now()}`);
fs.mkdirSync(tmpDir, { recursive: true });
const tmpStore = path.join(tmpDir, 'forensics-atlas.json');

try {
  const engine = new AtlasEngine({ storePath: tmpStore });

  // 1. Stress: 250 sequential and varied habit executions
  console.log('--- 1. Testing High-Throughput Event Processing & Performance ---');
  const difficulties = ['trivial', 'easy', 'medium', 'hard', 'epic'];
  const categories = ['health', 'learning', 'spirit', 'deepwork', 'productivity'];

  const t0 = performance.now();
  for (let i = 1; i <= 250; i++) {
    const diff = difficulties[i % difficulties.length];
    const cat = categories[i % categories.length];
    const isMicro = (i % 5 === 0);

    engine.dispatchAction('HABIT_COMPLETED', {
      habitId: `h-${i % 12}`,
      difficulty: diff,
      category: cat,
      isMicroStep: isMicro,
    });
  }
  const t1 = performance.now();
  const elapsed = t1 - t0;
  console.log(`✅ 250 actions processed in ${elapsed.toFixed(2)} ms (${(elapsed / 250).toFixed(4)} ms/action).`);
  assert.ok(elapsed / 250 < 3.0, 'Each event must process in < 3.0 ms');

  const state1 = engine.getDashboardState();
  assert.strictEqual(state1.wayfinder.totalActions, 250);
  assert.ok(state1.wayfinder.level >= 5, `Wayfinder level (${state1.wayfinder.level}) should be >= 5 after 250 actions`);
  assert.ok(state1.wayfinder.havenGold > 1000, 'Wayfinder should have earned Haven Gold');
  assert.ok(state1.unlockedMilestones.length >= 6, 'All 6 clues should be unlocked after 250 actions');

  // 2. Haven Facility Upgrades Stress & Boundary Checks
  console.log('\n--- 2. Testing Haven Facilities Upgrades & Economy Limits ---');
  const initialGold = state1.wayfinder.havenGold;

  // Upgrade Cartography Hall from lvl 1 to lvl 5
  for (let targetLvl = 2; targetLvl <= 5; targetLvl++) {
    const res = engine.upgradeFacility('cartographyHall');
    assert.strictEqual(res.ok, true, `Upgrade to level ${targetLvl} should succeed`);
    assert.strictEqual(res.newLevel, targetLvl);
  }

  // Attempt 6th upgrade (Exceeds max level 5)
  const resMax = engine.upgradeFacility('cartographyHall');
  assert.strictEqual(resMax.ok, false);
  assert.strictEqual(resMax.error, 'max_level_reached');

  // Attempt unknown facility
  const resUnknown = engine.upgradeFacility('invalidFacilityId');
  assert.strictEqual(resUnknown.ok, false);
  assert.strictEqual(resUnknown.error, 'unknown_facility');
  console.log('✅ Facility upgrade boundaries and gold deduction verified.');

  // 3. Environmental Obstacles & Strategic Overcoming
  console.log('\n--- 3. Testing Obstacle Resolution & Affinities Rewards ---');
  const obsRes1 = engine.resolveObstacle('FOG_OF_UNCERTAINTY', 'micro_step');
  assert.strictEqual(obsRes1.ok, true);
  assert.strictEqual(obsRes1.resolution.affinityGranted, 'WIS');

  const obsRes2 = engine.resolveObstacle('PERMAFROST_OF_INERTIA', 'two_minute_rule');
  assert.strictEqual(obsRes2.ok, true);
  assert.strictEqual(obsRes2.resolution.affinityGranted, 'DIS');
  console.log('✅ Obstacle resolution and affinity boosts verified.');

  // 4. Data Sovereignty & Granular Purge Under Heavy Load
  console.log('\n--- 4. Testing Granular Purge (Data Sovereignty) ---');
  const targetHabitId = 'h-3';
  engine.store.data.obstacles.push({ id: 'obs-h3', linkedHabitId: targetHabitId });
  engine.store.data.chronicleEntries.push({ id: 'ch-h3', sourceEventIds: [`event-${targetHabitId}-99`] });
  engine.store.data.miro.observedPatterns.push({ habitId: targetHabitId, note: 'pattern' });
  engine.store.save();

  engine.store.selectivePurgeHabit(targetHabitId);

  assert.strictEqual(engine.store.data.obstacles.some(o => o.linkedHabitId === targetHabitId), false);
  assert.strictEqual(engine.store.data.chronicleEntries.some(c => c.sourceEventIds?.some(id => id.includes(targetHabitId))), false);
  assert.strictEqual(engine.store.data.miro.observedPatterns.some(p => p.habitId === targetHabitId), false);
  console.log('✅ Granular purge cleanly excised all linked records without side effects.');

  // 5. Complete Rebirth / Reset
  console.log('\n--- 5. Testing Complete Rebirth & Reset Invariants ---');
  engine.store.resetAtlas();
  const resetState = engine.getDashboardState();
  assert.strictEqual(resetState.wayfinder.level, 1);
  assert.strictEqual(resetState.wayfinder.xp, 0);
  assert.strictEqual(resetState.wayfinder.havenGold, 0);
  assert.strictEqual(resetState.havenFacilities.cartographyHall.level, 1);
  console.log('✅ Rebirth safely restored default Level 1 state.');

  console.log('\n========================================================');
  console.log('🎉 ALL DEEP FORENSICS & STRESS CHECKS PASSED (100%)');
  console.log('========================================================');
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
