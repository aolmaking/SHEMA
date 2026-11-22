'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  MAJOR_TRIALS_CATALOG,
  AtlasTrialsEngine,
  AtlasRewardsEngine,
  PRESET_REWARD_TEMPLATES,
  AtlasObstaclesEngine,
  OBSTACLE_VICTORY_TIERS,
  WORLD_OBSTACLE_TYPES,
  AtlasEngine,
  createAtlasEvent,
  ATLAS_EVENT_TYPES,
} = require('../src/core/atlas');

console.log('========================================================');
console.log('🧪 TESTING THE LIVING ATLAS — PHASE 3 COMPLETE SYSTEM');
console.log('========================================================\n');

const tmpStorePath = path.join(__dirname, 'temp-atlas-phase3-test.json');
if (fs.existsSync(tmpStorePath)) fs.unlinkSync(tmpStorePath);

try {
  // --- 1. Testing Major Trials (Boss Replacement) Engine ---
  console.log('--- 1. Testing Major Trials (White-Hat Boss Replacement) ---');
  assert.strictEqual(MAJOR_TRIALS_CATALOG.length, 3, 'Must define 3 canonical Major Trials');
  const graniteTrial = MAJOR_TRIALS_CATALOG.find(t => t.id === 'TRIAL_GRANITE_PASS');
  assert.ok(graniteTrial);
  assert.strictEqual(graniteTrial.affinityRequired, 'DIS');
  assert.strictEqual(graniteTrial.requiredSteps, 12);
  assert.ok(graniteTrial.monumentId);

  // Test Trial Step Progression without HP bars
  const stepRes1 = AtlasTrialsEngine.processHabitStepForTrials('productivity', {}, []);
  assert.strictEqual(stepRes1.updatedProgress['TRIAL_GRANITE_PASS'], 1);
  assert.strictEqual(stepRes1.newlyCompletedTrials.length, 0);

  // Complete a trial by reaching 12 steps
  const stepRes12 = AtlasTrialsEngine.processHabitStepForTrials('productivity', { TRIAL_GRANITE_PASS: 11 }, []);
  assert.strictEqual(stepRes12.updatedProgress['TRIAL_GRANITE_PASS'], 12);
  assert.strictEqual(stepRes12.newlyCompletedTrials.length, 1);
  assert.strictEqual(stepRes12.newlyCompletedTrials[0].id, 'TRIAL_GRANITE_PASS');

  // Complete trial payout
  const compRes = AtlasTrialsEngine.completeTrial('TRIAL_GRANITE_PASS', []);
  assert.strictEqual(compRes.ok, true);
  assert.strictEqual(compRes.rewards.havenGold, 60);
  assert.strictEqual(compRes.rewards.aetherShards, 50);
  assert.strictEqual(compRes.monument.id, 'granite_arches');

  // Duplicate completion prevention
  const dupTrial = AtlasTrialsEngine.completeTrial('TRIAL_GRANITE_PASS', ['TRIAL_GRANITE_PASS']);
  assert.strictEqual(dupTrial.ok, false);
  assert.strictEqual(dupTrial.error, 'already_completed');
  console.log('✅ Major Trials progression, cumulative steps, and rewards verified.');

  // --- 2. Testing 3-Tier Obstacles Victory & Dormant Relics ---
  console.log('\n--- 2. Testing 3-Tier Obstacles Victory & Dormant Relics ---');
  assert.strictEqual(Object.keys(OBSTACLE_VICTORY_TIERS).length, 3);
  
  // Tier 1: Breakthrough
  const t1 = AtlasObstaclesEngine.advanceObstacleTier('FOG_OF_UNCERTAINTY', 'micro_step', 0);
  assert.strictEqual(t1.newTier, 1);
  assert.strictEqual(t1.isMastered, false);
  assert.strictEqual(t1.isDormantRelic, false);
  assert.strictEqual(t1.aetherShardsAwarded, 5);

  // Tier 2: Stabilization
  const t2 = AtlasObstaclesEngine.advanceObstacleTier('FOG_OF_UNCERTAINTY', 'micro_step', 1);
  assert.strictEqual(t2.newTier, 2);
  assert.strictEqual(t2.isMastered, false);
  assert.strictEqual(t2.aetherShardsAwarded, 10);

  // Tier 3: Mastery & Dormant Relic
  const t3 = AtlasObstaclesEngine.advanceObstacleTier('FOG_OF_UNCERTAINTY', 'micro_step', 2);
  assert.strictEqual(t3.newTier, 3);
  assert.strictEqual(t3.isMastered, true);
  assert.strictEqual(t3.isDormantRelic, true);
  assert.strictEqual(t3.aetherShardsAwarded, 25);
  assert.ok(t3.chronicleAr.includes('أثر تاريخي خامل'));
  console.log('✅ 3-Tier Obstacles Victory and Dormant Relics verified.');

  // --- 3. Testing Custom Real-World Rewards Bazaar ---
  console.log('\n--- 3. Testing Real-World Rewards Bazaar ---');
  assert.strictEqual(PRESET_REWARD_TEMPLATES.length, 4, 'Must have 4 default preset reward templates');
  
  // Test affordability check
  const allRewards1 = AtlasRewardsEngine.getAllRewards([], 20);
  const coffee = allRewards1.find(r => r.id === 'PRESET_COFFEE');
  assert.strictEqual(coffee.canAfford, false, 'Coffee costs 30 gold; 20 is insufficient');

  // Test redemption failure on insufficient gold
  const failRedeem = AtlasRewardsEngine.redeemReward('PRESET_COFFEE', [], 20);
  assert.strictEqual(failRedeem.ok, false);
  assert.strictEqual(failRedeem.error, 'insufficient_gold');

  // Test redemption success
  const succRedeem = AtlasRewardsEngine.redeemReward('PRESET_COFFEE', [], 50);
  assert.strictEqual(succRedeem.ok, true);
  assert.strictEqual(succRedeem.remainingGold, 20);
  assert.ok(succRedeem.chronicleAr.includes('قهوة الصباح'));

  // Test adding user custom reward
  const addRes = AtlasRewardsEngine.addReward({ title: 'جلسة قراءة بالحديقة', cost: 45, icon: '📖' }, []);
  assert.strictEqual(addRes.ok, true);
  assert.strictEqual(addRes.reward.titleAr, 'جلسة قراءة بالحديقة');
  assert.strictEqual(addRes.reward.cost, 45);

  // Test deleting user custom reward
  const delRes = AtlasRewardsEngine.deleteReward(addRes.reward.id, addRes.updatedRewards);
  assert.strictEqual(delRes.ok, true);
  assert.strictEqual(delRes.updatedRewards.length, 0);
  console.log('✅ Real-World Rewards Bazaar catalog, redemption, and creation verified.');

  // --- 4. Testing Full AtlasEngine Phase 3 Integration ---
  console.log('\n--- 4. Testing Full AtlasEngine Phase 3 Integration ---');
  const engine = new AtlasEngine({ storePath: tmpStorePath });

  // Mock habits manager
  const mockHabits = [
    { id: 'hab_prod', title: 'برمجة مكثفة', category: 'productivity', difficulty: 'hard' },
    { id: 'hab_read', title: 'قراءة في التفسير', category: 'learning', difficulty: 'medium' },
  ];
  engine.bridgeHabitsManager({
    getHabits: () => mockHabits,
    getHabit: (id) => mockHabits.find(h => h.id === id),
    on: () => {},
  });

  // Execute habit -> advances Granite Pass trial
  engine.dispatchAction(ATLAS_EVENT_TYPES.HABIT_COMPLETED, {
    habitId: 'hab_prod',
    category: 'productivity',
    difficulty: 'hard',
  });

  const state1 = engine.getDashboardState('ar');
  const graniteInState = state1.trials.find(t => t.id === 'TRIAL_GRANITE_PASS');
  assert.strictEqual(graniteInState.currentSteps, 1);
  assert.strictEqual(graniteInState.isCompleted, false);

  // Advance obstacle through engine
  const advRes = engine.advanceObstacleTier('PERMAFROST_OF_INERTIA', 'two_minute_rule');
  assert.strictEqual(advRes.ok, true);
  assert.strictEqual(advRes.res.newTier, 1);
  assert.strictEqual(engine.store.data.obstaclesState.tiers['PERMAFROST_OF_INERTIA'], 1);

  // Complete a trial through engine
  const trialCompRes = engine.completeTrial('TRIAL_SUNKEN_LIBRARY');
  assert.strictEqual(trialCompRes.ok, true);
  assert.ok(engine.store.data.trials.completed.includes('TRIAL_SUNKEN_LIBRARY'));
  assert.ok(engine.store.data.havenFacilities.monuments.some(m => m.id === 'domes_of_folios'));

  // Test Custom Rewards Bazaar through engine
  engine.store.addXpAndGold(0, 100);
  const redeemRes = engine.redeemReward('PRESET_COFFEE');
  assert.strictEqual(redeemRes.ok, true);
  assert.ok(engine.store.data.chronicleEntries.some(e => e.category === 'reward_redemption'));

  // Test Miro Sovereign Privacy & Memory Controls
  const noteRes = engine.addMiroNote('أفضل إنجاز المهام قبل الساعة العاشرة صباحاً');
  assert.strictEqual(noteRes.ok, true);
  assert.strictEqual(engine.store.data.miro.userApprovedNotes.length, 1);

  engine.setMiroPresenceMode('quiet');
  assert.strictEqual(engine.store.data.miro.presenceMode, 'quiet');

  engine.deleteMiroNote(noteRes.note.id);
  assert.strictEqual(engine.store.data.miro.userApprovedNotes.length, 0);

  engine.resetMiroMemory();
  assert.strictEqual(engine.store.data.miro.knowledge, 1);

  // Final Dashboard State check
  const finalState = engine.getDashboardState('ar');
  assert.ok(Array.isArray(finalState.trials));
  assert.ok(Array.isArray(finalState.obstacles));
  assert.ok(Array.isArray(finalState.rewards));
  assert.ok(Array.isArray(finalState.chronicles));
  assert.ok(finalState.miroMemory);

  console.log('✅ Full AtlasEngine Phase 3 Integration verified.');

  console.log('\n========================================================');
  console.log('🎉 ALL ATLAS PHASE 3 TESTS PASSED WITH 100% SUCCESS!');
  console.log('========================================================\n');
} finally {
  if (fs.existsSync(tmpStorePath)) {
    try { fs.unlinkSync(tmpStorePath); } catch {}
  }
}
