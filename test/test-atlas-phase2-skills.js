'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  ASTROLABE_BRANCHES,
  ASTROLABE_SKILLS,
  AtlasSkillsEngine,
  LIVING_MATERIALS_META,
  HAVEN_CRAFTING_PROJECTS,
  AtlasMaterialsEngine,
  MAP_COORDINATES_NODES,
  MAP_CONNECTING_TRAILS,
  AtlasMapEngine,
  MIRO_CONSULTATION_MODES,
  MiroCompanion,
  AtlasEngine,
  createAtlasEvent,
  ATLAS_EVENT_TYPES,
} = require('../src/core/atlas');

console.log('========================================================');
console.log('🧪 TESTING THE LIVING ATLAS — PHASE 2 COMPLETE SYSTEM');
console.log('========================================================\n');

const tmpStorePath = path.join(__dirname, 'temp-atlas-phase2-test.json');
if (fs.existsSync(tmpStorePath)) fs.unlinkSync(tmpStorePath);

try {
  // --- 1. Testing Astrolabe Branches & Skills Engine ---
  console.log('--- 1. Testing Astrolabe Branches & Behavioral Skills ---');
  assert.strictEqual(Object.keys(ASTROLABE_BRANCHES).length, 5, 'Must have 5 behavioral branches');
  assert.ok(ASTROLABE_BRANCHES.PERCEPTION);
  assert.ok(ASTROLABE_BRANCHES.PREPARATION);
  assert.ok(ASTROLABE_BRANCHES.RESILIENCE);
  assert.ok(ASTROLABE_BRANCHES.ADAPTABILITY);
  assert.ok(ASTROLABE_BRANCHES.MAINTENANCE);

  assert.strictEqual(ASTROLABE_SKILLS.length, 5, 'Must define 5 initial skills');

  // Initial evaluation with zero habits
  const eval1 = AtlasSkillsEngine.evaluateSkills({ totalActions: 0 }, [], []);
  assert.strictEqual(eval1.newlyUnlocked.length, 0, 'No skills unlocked at start');
  assert.strictEqual(eval1.allUnlockedIds.length, 0);

  // Test SKL-PERC-01 unlock condition: 3 habits with cues
  const habitsWithCues = [
    { id: 'h1', triggerCue: 'بعد صلاة الفجر' },
    { id: 'h2', triggerCue: 'عند الجلوس على المكتب' },
    { id: 'h3', triggerCue: 'قبل النوم بـ 30 دقيقة' },
  ];
  const eval2 = AtlasSkillsEngine.evaluateSkills({ totalActions: 3 }, habitsWithCues, []);
  assert.ok(eval2.newlyUnlocked.some(s => s.id === 'SKL-PERC-01'), 'SKL-PERC-01 must unlock when 3 cues are set');

  // Test SKL-MAIN-01 unlock condition: 1 habit with 42+ executions
  const habitsWithMastery = [
    { id: 'h4', totalExecutions: 45 },
  ];
  const eval3 = AtlasSkillsEngine.evaluateSkills({ totalActions: 45 }, habitsWithMastery, []);
  assert.ok(eval3.newlyUnlocked.some(s => s.id === 'SKL-MAIN-01'), 'SKL-MAIN-01 must unlock when habit reaches 42 reps');
  console.log('✅ Astrolabe Branches and Behavioral Skills evaluation verified.');

  // --- 2. Testing Living Materials Faucet & Crafting ---
  console.log('\n--- 2. Testing Living Materials Faucets & Haven Crafting ---');
  assert.ok(LIVING_MATERIALS_META.aetherShards);
  assert.ok(LIVING_MATERIALS_META.manuscriptScraps);
  assert.ok(LIVING_MATERIALS_META.seedsOfLight);

  // Category faucets
  const learnMat = AtlasMaterialsEngine.calculateMaterialsFromExecution({ category: 'learning', difficulty: 'medium' });
  assert.strictEqual(learnMat.manuscriptScraps, 2, 'Learning habits must award Manuscript Scraps');
  assert.strictEqual(learnMat.aetherShards, 0);

  const spiritMat = AtlasMaterialsEngine.calculateMaterialsFromExecution({ category: 'spirit', difficulty: 'hard' });
  assert.strictEqual(spiritMat.seedsOfLight, 4, 'Spiritual/serenity habits with hard difficulty must award 4 Seeds of Light');

  const prodMat = AtlasMaterialsEngine.calculateMaterialsFromExecution({ category: 'productivity', difficulty: 'easy' });
  assert.strictEqual(prodMat.aetherShards, 2, 'Productivity habits must award Aether Shards');

  // Crafting Projects validation
  assert.strictEqual(HAVEN_CRAFTING_PROJECTS.length, 4, 'Must define 4 Haven Crafting Projects');
  const bridgeProj = HAVEN_CRAFTING_PROJECTS.find(p => p.id === 'REBUILD_VERDANT_BRIDGE');
  assert.ok(bridgeProj);

  // Insufficient materials test
  const poorMat = { aetherShards: 10, manuscriptScraps: 5, seedsOfLight: 0 };
  const failCraft = AtlasMaterialsEngine.craftProject('REBUILD_VERDANT_BRIDGE', poorMat, []);
  assert.strictEqual(failCraft.ok, false);
  assert.strictEqual(failCraft.error, 'insufficient_materials');

  // Successful crafting test
  const richMat = { aetherShards: 60, manuscriptScraps: 30, seedsOfLight: 10 };
  const succCraft = AtlasMaterialsEngine.craftProject('REBUILD_VERDANT_BRIDGE', richMat, []);
  assert.strictEqual(succCraft.ok, true);
  assert.strictEqual(succCraft.remainingMaterials.aetherShards, 10);
  assert.strictEqual(succCraft.remainingMaterials.manuscriptScraps, 5);
  assert.strictEqual(succCraft.remainingMaterials.seedsOfLight, 10);

  // Duplicate crafting prevention
  const dupCraft = AtlasMaterialsEngine.craftProject('REBUILD_VERDANT_BRIDGE', richMat, ['REBUILD_VERDANT_BRIDGE']);
  assert.strictEqual(dupCraft.ok, false);
  assert.strictEqual(dupCraft.error, 'already_completed');
  console.log('✅ Living Materials faucets and Crafting rules verified.');

  // --- 3. Testing Living Map Coordinate Engine & SVG ---
  console.log('\n--- 3. Testing Living Map Coordinate Engine & Vector SVG ---');
  assert.strictEqual(MAP_COORDINATES_NODES.length, 6, 'Must define 6 coordinate landmark nodes');
  assert.strictEqual(MAP_CONNECTING_TRAILS.length, 5, 'Must define 5 connecting trails');

  const nodesAtZero = AtlasMapEngine.evaluateMapNodes({ totalActions: 0 }, 'ar');
  const havenNode = nodesAtZero.find(n => n.id === 'FIRST_HAVEN');
  assert.ok(havenNode.isUnlocked, 'First Haven must be unlocked by default');
  const peaksNode = nodesAtZero.find(n => n.id === 'IRONFROST_PEAKS');
  assert.strictEqual(peaksNode.isUnlocked, false, 'Ironfrost Peaks requires 50 actions');

  // Verify SVG generation
  const svgMap = AtlasMapEngine.renderSvgMap(nodesAtZero, { DIS: true, WIS: false });
  assert.ok(svgMap.includes('<svg class="living-parchment-svg"'), 'Must generate valid SVG element');
  assert.ok(svgMap.includes('viewBox="0 0 1000 1000"'), 'Must have 1000x1000 precision');
  assert.ok(svgMap.includes('FIRST_HAVEN'), 'Must contain landmark nodes');
  assert.ok(svgMap.includes('trail_crossroads_peaks'), 'Must render connecting trails');
  console.log('✅ Living Map Coordinate Engine and Declarative SVG verified.');

  // --- 4. Testing Miro Alcove Multi-Modal Consultation ---
  console.log('\n--- 4. Testing Miro Alcove Multi-Modal Consultation ---');
  const miro = new MiroCompanion();
  const modes = ['reflection', 'wisdom', 'habit_science', 'calm'];
  for (const m of modes) {
    const consultAr = miro.consult(m, 'ar');
    assert.strictEqual(consultAr.mode, m);
    assert.ok(consultAr.dialogue && consultAr.dialogue.length > 10, `Arabic dialogue for ${m} must be non-empty`);

    const consultEn = miro.consult(m, 'en');
    assert.ok(consultEn.dialogue && consultEn.dialogue.length > 10, `English dialogue for ${m} must be non-empty`);
  }
  console.log('✅ Miro Multi-Modal Alcove Consultation verified.');

  // --- 5. Testing Full AtlasEngine End-to-End Integration ---
  console.log('\n--- 5. Testing AtlasEngine Phase 2 End-to-End Integration ---');
  const engine = new AtlasEngine({ storePath: tmpStorePath });

  // Mock habitsManager bridge
  const mockHabits = [
    { id: 'hab1', title: 'تلاوة ورد القرآن', category: 'spirit', difficulty: 'medium', triggerCue: 'بعد الفجر' },
    { id: 'hab2', title: 'قراءة في كتاب التاريخ', category: 'learning', difficulty: 'medium', triggerCue: 'العصر' },
    { id: 'hab3', title: 'برمجة عميقة', category: 'productivity', difficulty: 'hard', triggerCue: 'الصباح' },
  ];
  const mockHabitsManager = {
    getHabits: () => mockHabits,
    getHabit: (id) => mockHabits.find(h => h.id === id),
    on: () => {},
  };
  engine.bridgeHabitsManager(mockHabitsManager);

  // Dispatch events
  engine.dispatchAction(ATLAS_EVENT_TYPES.HABIT_COMPLETED, {
    habitId: 'hab1',
    category: 'spirit',
    difficulty: 'medium',
  });
  engine.dispatchAction(ATLAS_EVENT_TYPES.HABIT_COMPLETED, {
    habitId: 'hab2',
    category: 'learning',
    difficulty: 'medium',
  });

  const state1 = engine.getDashboardState('ar');
  assert.strictEqual(state1.wayfinder.livingMaterials.seedsOfLight, 2, 'Must have accumulated 2 seeds');
  // 2 from learning habit execution + 20 reward from SKL-PERC-01 unlock = 22
  assert.strictEqual(state1.wayfinder.livingMaterials.manuscriptScraps, 22, 'Must have accumulated 22 manuscripts (2 habit + 20 skill unlock reward)');
  assert.ok(state1.astrolabe.skills.length > 0, 'Astrolabe skills must be included in dashboard state');
  assert.ok(state1.map.svg.length > 100, 'Map SVG must be present');

  // Add materials directly to test crafting
  engine.store.addLivingMaterials({ aetherShards: 100, manuscriptScraps: 100, seedsOfLight: 100 });
  const craftRes = engine.craftProject('REKINDLE_HAVEN_LANTERNS');
  assert.strictEqual(craftRes.ok, true, 'Crafting must succeed with sufficient materials');
  assert.ok(engine.store.data.havenFacilities.completedProjects.includes('REKINDLE_HAVEN_LANTERNS'));

  // Test Miro consultation via engine
  const cRes = engine.consultMiro('habit_science', 'ar');
  assert.ok(cRes.dialogue.includes('العادات') || cRes.dialogue.includes('ثانية') || cRes.dialogue.includes('الهوية') || cRes.dialogue.length > 10);

  console.log('✅ Full AtlasEngine End-to-End Integration verified.');

  console.log('\n========================================================');
  console.log('🎉 ALL ATLAS PHASE 2 TESTS PASSED WITH 100% SUCCESS!');
  console.log('========================================================\n');
} finally {
  if (fs.existsSync(tmpStorePath)) {
    try { fs.unlinkSync(tmpStorePath); } catch {}
  }
}
