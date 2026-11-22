'use strict';

const assert = require('assert');
const {
  HABIT_LIFECYCLE_STATES,
  AUTOMATICITY_CONFIG,
  WORLD_OBSTACLE_TYPES,
  OVERCOMING_STRATEGIES,
  AtlasObstaclesEngine,
  MYSTERY_GRAPH_NODES,
  AtlasNarrativeEngine,
  MIRO_STATES,
  MIRO_DIALOGUE_PRESETS,
  MiroCompanion,
} = require('../src/core/atlas');

console.log('========================================================');
console.log('🧪 TESTING THE LIVING ATLAS — PHASE 2 & 3 ENGINES');
console.log('========================================================\n');

try {
  // --- TEST 1: Habit Lifecycle & Automaticity Evaluation ---
  console.log('--- 1. Testing Habit Lifecycle & White-Hat Dormancy ---');
  
  // Breakthrough (new habit)
  const newHabit = { id: 'h1', totalExecutions: 5, lastExecutedDate: new Date().toISOString() };
  const st1 = AtlasObstaclesEngine.evaluateHabitState(newHabit);
  assert.strictEqual(st1.state, HABIT_LIFECYCLE_STATES.BREAKTHROUGH);
  assert.strictEqual(st1.isMastered, false);

  // Stabilization (15 to 41 reps)
  const stableHabit = { id: 'h2', totalExecutions: 20, lastExecutedDate: new Date().toISOString() };
  const st2 = AtlasObstaclesEngine.evaluateHabitState(stableHabit);
  assert.strictEqual(st2.state, HABIT_LIFECYCLE_STATES.STABILIZATION);

  // Mastery (42+ reps)
  const masterHabit = { id: 'h3', totalExecutions: 50, lastExecutedDate: new Date().toISOString() };
  const st3 = AtlasObstaclesEngine.evaluateHabitState(masterHabit);
  assert.strictEqual(st3.state, HABIT_LIFECYCLE_STATES.MASTERY);
  assert.strictEqual(st3.isMastered, true);

  // Dormancy: 20 days inactive (Strict White-Hat Invariant: Never reset reps or erase mastery!)
  const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();
  const dormantHabit = { id: 'h4', totalExecutions: 50, lastExecutedDate: twentyDaysAgo };
  const st4 = AtlasObstaclesEngine.evaluateHabitState(dormantHabit);
  assert.strictEqual(st4.state, HABIT_LIFECYCLE_STATES.DORMANT);
  assert.strictEqual(st4.isMastered, true, 'Mastery must be preserved during dormancy');
  assert.strictEqual(st4.totalReps, 50, 'Total reps must be preserved during dormancy');
  assert.strictEqual(st4.needsWelcomingReawakening, true);

  // Contextual Reawakening offer
  const reawakening = AtlasObstaclesEngine.generateReawakeningOffer({ id: 'h4', title: 'صلاة الفجر' }, 'ar');
  assert.ok(reawakening.welcomeTitle.includes('صلاة الفجر'));
  assert.strictEqual(reawakening.recommendedVariant, 'micro_step');
  console.log('✅ Habit Lifecycle and White-Hat Dormancy invariants verified.');

  // --- TEST 2: Environmental Obstacles & Overcoming Strategies ---
  console.log('\n--- 2. Testing Obstacles & Overcoming Strategies ---');
  assert.ok(WORLD_OBSTACLE_TYPES.FOG_OF_UNCERTAINTY);
  assert.ok(WORLD_OBSTACLE_TYPES.PERMAFROST_OF_INERTIA);
  assert.ok(WORLD_OBSTACLE_TYPES.TORRENT_OF_EXHAUSTION);
  assert.ok(WORLD_OBSTACLE_TYPES.SHIFTING_DUNES);

  // Optimal match
  const resOptimal = AtlasObstaclesEngine.resolveObstacle('FOG_OF_UNCERTAINTY', 'micro_step');
  assert.strictEqual(resOptimal.isOptimalMatch, true);
  assert.strictEqual(resOptimal.affinityGranted, 'WIS');
  assert.strictEqual(resOptimal.affinityAmount, 2);
  assert.strictEqual(resOptimal.goldAwarded, 15);

  // Sub-optimal but valid alternative strategy
  const resAlt = AtlasObstaclesEngine.resolveObstacle('PERMAFROST_OF_INERTIA', 'micro_step');
  assert.strictEqual(resAlt.isOptimalMatch, false);
  assert.strictEqual(resAlt.affinityGranted, 'DIS');
  assert.strictEqual(resAlt.affinityAmount, 1);
  assert.ok(resAlt.goldAwarded < 20);
  console.log('✅ Obstacles, Strategies, and Affinity rewards verified.');

  // --- TEST 3: Narrative Mystery Graph & Milestone Progressive Revelation ---
  console.log('\n--- 3. Testing Narrative Mystery Graph & Clue Revelation ---');
  assert.strictEqual(MYSTERY_GRAPH_NODES.length >= 6, true);

  // Milestone 0: No clues
  const p0 = AtlasNarrativeEngine.evaluateProgress({ totalActions: 0 }, []);
  assert.strictEqual(p0.newlyUnlocked.length, 0);

  // Milestone 1: First Action unlocks CLUE_UNMAPPING_01
  const p1 = AtlasNarrativeEngine.evaluateProgress({ totalActions: 1 }, []);
  assert.strictEqual(p1.newlyUnlocked.length, 1);
  assert.strictEqual(p1.newlyUnlocked[0].id, 'CLUE_UNMAPPING_01');

  // Milestone 5: With CLUE_UNMAPPING_01 already unlocked, unlocks CLUE_MIRO_STARMOTE
  const p2 = AtlasNarrativeEngine.evaluateProgress({ totalActions: 5 }, ['CLUE_UNMAPPING_01']);
  assert.strictEqual(p2.newlyUnlocked.length, 1);
  assert.strictEqual(p2.newlyUnlocked[0].id, 'CLUE_MIRO_STARMOTE');

  // Foreshadowing: At 4 actions (80% of 5 required for CLUE_MIRO_STARMOTE), hint must fire
  const hint = AtlasNarrativeEngine.getForeshadowingHint({ totalActions: 4 }, ['CLUE_UNMAPPING_01'], 'ar');
  assert.ok(hint, 'Foreshadowing hint should trigger at 80% progress');
  assert.strictEqual(hint.clueId, 'CLUE_MIRO_STARMOTE');
  assert.ok(hint.hint.length > 10);

  // Chronicle Generator
  const chronicleClue = AtlasNarrativeEngine.generateChronicleEntry('clue_unlocked', { clueId: 'CLUE_UNMAPPING_01' }, 'ar');
  assert.strictEqual(chronicleClue.category, 'narrative_discovery');
  assert.ok(chronicleClue.title.includes('الشظية الأولى'));
  assert.ok(chronicleClue.text.includes('النسيج'));
  console.log('✅ Mystery Graph, Foreshadowing, and Chronicle generation verified.');

  // --- TEST 4: Miro Companion FSM & Vector Sprite Generation ---
  console.log('\n--- 4. Testing Miro Companion FSM & Sprite Generation ---');
  const miro = new MiroCompanion();
  assert.strictEqual(miro.state, MIRO_STATES.RESTING);
  assert.strictEqual(miro.glowIntensity, 0.4);

  // Celebrating transition
  const cRes = miro.setState(MIRO_STATES.CELEBRATING, { isMicroStep: false, lang: 'ar' });
  assert.strictEqual(miro.state, MIRO_STATES.CELEBRATING);
  assert.strictEqual(miro.glowIntensity, 1.0);
  assert.ok(cRes.dialogue.length > 5);

  // Welcoming transition
  const wRes = miro.setState(MIRO_STATES.WELCOMING, { lang: 'en' });
  assert.strictEqual(miro.state, MIRO_STATES.WELCOMING);
  assert.strictEqual(miro.glowIntensity, 0.85);
  assert.ok(wRes.dialogue && wRes.dialogue.length > 10, 'Welcome dialogue must be present');

  // SVG Sprite Generation
  const svg = MiroCompanion.renderSvgSprite({ size: 64, glow: 0.9, wink: false });
  assert.ok(svg.startsWith('<svg class="miro-sprite"'), 'Sprite must be valid SVG');
  assert.ok(svg.includes('url(#miroFlame)'), 'Sprite must contain starlight-ink flame crest');
  assert.ok(svg.includes('circle cx="50"'), 'Sprite must contain aura');
  assert.ok(svg.length < 3000, `Sprite SVG size (${svg.length} bytes) must be < 3KB for ultra-fast rendering`);
  console.log('✅ Miro Companion FSM and Vector Sprite generation verified.');

  console.log('\n========================================================');
  console.log('🎉 ALL ATLAS PHASE 2 & 3 TESTS PASSED (100%)');
  console.log('========================================================');
} catch (err) {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
}
