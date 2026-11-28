'use strict';

/**
 * Automated Verification Suite for Living Atlas Phase 3 Evolution:
 * 1. Major Trials (Boss Replacement) Luminous UI & Claim Monument Handler
 * 2. 3-Tier Obstacles Dynamic Visual Stepper & Relic Transformation
 * 3. Haven Sanctuary: Erected Monuments & Dormant Relics Vault
 * 4. Real-World Rewards Bazaar Gold Integration & Custom Deletion
 * 5. Official Living Atlas Brand Artwork Sub-View Theming
 * 6. Linguistic Integrity (Zero "الأثير", Pure Grounded Arabic)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const { AtlasEngine } = require('../src/core/atlas/atlas-engine');
const { MAJOR_TRIALS_CATALOG } = require('../src/core/atlas/atlas-trials');
const { PRESET_REWARD_TEMPLATES } = require('../src/core/atlas/atlas-rewards');

console.log('========================================================');
console.log('🧪 TESTING LIVING ATLAS — PHASE 3 EVOLUTION SUITE');
console.log('========================================================\n');

(async () => {
  const tmpStore = path.join(os.tmpdir(), `test_atlas_phase3_evo_${Date.now()}.json`);
  const engine = new AtlasEngine({ storePath: tmpStore });

  // 1. Major Trials Engine & State
  console.log('--- 1. Testing Major Trials State & Monument Erecting ---');
  assert.strictEqual(MAJOR_TRIALS_CATALOG.length, 3);
  const stateInitial = engine.getDashboardState('ar');
  assert.strictEqual(stateInitial.trials.length, 3);

  // Complete a trial and verify monument erected in store
  const compRes = engine.completeTrial('TRIAL_GRANITE_PASS');
  assert.strictEqual(compRes.ok, true);
  const stateAfterTrial = engine.getDashboardState('ar');
  const trialInState = stateAfterTrial.trials.find(t => t.id === 'TRIAL_GRANITE_PASS');
  assert.strictEqual(trialInState.isCompleted, true);
  assert.ok(stateAfterTrial.havenFacilities.monuments.some(m => m.id === 'granite_arches'), 'Monument must be in havenFacilities');
  console.log('✅ Major Trials & Monument progression verified.');

  // 2. 3-Tier Obstacles Progression to Relic
  console.log('\n--- 2. Testing 3-Tier Obstacles Progression to Dormant Relic ---');
  const adv1 = engine.advanceObstacleTier('FOG_OF_UNCERTAINTY', 'micro_step');
  assert.strictEqual(adv1.res.newTier, 1);
  const adv2 = engine.advanceObstacleTier('FOG_OF_UNCERTAINTY', 'micro_step');
  assert.strictEqual(adv2.res.newTier, 2);
  const adv3 = engine.advanceObstacleTier('FOG_OF_UNCERTAINTY', 'micro_step');
  assert.strictEqual(adv3.res.newTier, 3);
  assert.strictEqual(adv3.res.isDormantRelic, true);

  const stateAfterObs = engine.getDashboardState('ar');
  assert.ok(stateAfterObs.obstaclesState.dormantRelics.includes('FOG_OF_UNCERTAINTY'), 'Must be in dormantRelics array');
  console.log('✅ 3-Tier Obstacles progression and Dormant Relic storage verified.');

  // 3. Rewards Bazaar Engine
  console.log('\n--- 3. Testing Rewards Bazaar Engine & Intrinsic Redemption ---');
  assert.strictEqual(PRESET_REWARD_TEMPLATES.length, 4);
  const goldBefore = engine.store.data.wayfinder.havenGold || 0;
  engine.store.addXpAndGold(0, 100);
  const redeemRes = engine.redeemReward('PRESET_COFFEE');
  assert.strictEqual(redeemRes.ok, true);
  assert.strictEqual(redeemRes.remainingGold, goldBefore + 100 - 30);

  // Add and delete custom reward
  const custom = engine.addCustomReward({ title: 'نزهة جبلية', cost: 60, icon: '🏔️' });
  assert.strictEqual(custom.ok, true);
  assert.strictEqual(engine.store.data.customRewards.length, 1);
  const delRes = engine.deleteCustomReward(custom.reward.id);
  assert.strictEqual(delRes.ok, true);
  assert.strictEqual(engine.store.data.customRewards.length, 0);
  console.log('✅ Rewards Bazaar verified: redemption, custom creation & deletion.');

  // 4. HTML Structure & Sanctuary Markup
  console.log('\n--- 4. Testing Dashboard Markup for Phase 3 Evolution ---');
  const dashHtml = fs.readFileSync(path.join(ROOT, 'windows', 'habits-dashboard.html'), 'utf8');
  assert(dashHtml.includes('id="atlasSanctuaryCard"'), 'Must contain #atlasSanctuaryCard');
  assert(dashHtml.includes('id="atlasSanctuaryMonumentsGrid"'), 'Must contain #atlasSanctuaryMonumentsGrid');
  assert(dashHtml.includes('id="atlasSanctuaryRelicsGrid"'), 'Must contain #atlasSanctuaryRelicsGrid');
  assert(dashHtml.includes('id="atlasTrialsGrid"'), 'Must contain #atlasTrialsGrid');
  assert(dashHtml.includes('id="atlasObstaclesGrid"'), 'Must contain #atlasObstaclesGrid');
  assert(dashHtml.includes('id="atlasBazaarGrid"'), 'Must contain #atlasBazaarGrid');
  assert(dashHtml.includes('id="addRewardModal"'), 'Must contain #addRewardModal');
  console.log('✅ Dashboard HTML Sanctuary and Phase 3 grids verified.');

  // 5. CSS Theming & Artwork Integrity
  console.log('\n--- 5. Testing CSS Brand Artwork Background Theming ---');
  const dashCss = fs.readFileSync(path.join(ROOT, 'windows', 'css', 'habits-dashboard.css'), 'utf8');
  assert(dashCss.includes('04_storybook_map_forest_runes.jpg'), 'Must theme trials card with storybook map');
  assert(dashCss.includes('10_shadow_confrontation_ink_wash.jpg'), 'Must theme obstacles card with shadow confrontation');
  assert(dashCss.includes('05_verdant_ruins_mossy_path.jpg'), 'Must theme sanctuary card with verdant ruins');
  assert(dashCss.includes('08_world_tree_radiant_city.jpg'), 'Must theme bazaar card with world tree radiant city');
  assert(dashCss.includes('06_the_wayfinder_pilgrim_journey.jpg'), 'Must theme chronicles card with pilgrim journey');
  assert(dashCss.includes('.obstacle-stepper'), 'Must define .obstacle-stepper');
  assert(dashCss.includes('.trial-progress-bar'), 'Must define .trial-progress-bar');
  assert(dashCss.includes('.monument-display-card'), 'Must define .monument-display-card');
  assert(dashCss.includes('.relic-display-card'), 'Must define .relic-display-card');
  console.log('✅ CSS Brand Art Theming and Phase 3 component styling verified.');

  // 6. JS Wire Handlers
  console.log('\n--- 6. Testing JS Wire Handlers for Phase 3 ---');
  const dashJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'habits-dashboard.js'), 'utf8');
  assert(dashJs.includes('atlasSanctuaryMonumentsGrid'), 'habits-dashboard.js must render monuments');
  assert(dashJs.includes('atlasSanctuaryRelicsGrid'), 'habits-dashboard.js must render relics');
  assert(dashJs.includes('obstacle-stepper'), 'habits-dashboard.js must render 3-tier stepper');
  assert(dashJs.includes('deleteReward'), 'habits-dashboard.js must support custom reward deletion');
  assert(dashJs.includes('addReward'), 'habits-dashboard.js must support reward modal saving to atlas');
  console.log('✅ JS Wire Handlers verified.');

  // 7. Linguistic Purity Check
  console.log('\n--- 7. Testing Strict Linguistic Purity across Phase 3 ---');
  MAJOR_TRIALS_CATALOG.forEach(t => {
    assert(!t.titleAr.includes('أثير'), `Trial ${t.id} titleAr must not contain "أثير"`);
    assert(!t.descriptionAr.includes('أثير'), `Trial ${t.id} descriptionAr must not contain "أثير"`);
    assert(!t.completionChronicleAr.includes('أثير'), `Trial ${t.id} completionChronicleAr must not contain "أثير"`);
  });
  PRESET_REWARD_TEMPLATES.forEach(r => {
    assert(!r.titleAr.includes('أثير'), `Reward ${r.id} titleAr must not contain "أثير"`);
    assert(!r.descriptionAr.includes('أثير'), `Reward ${r.id} descriptionAr must not contain "أثير"`);
  });
  console.log('✅ 100% Arabic purity verified (zero "الأثير").');

  // Cleanup
  if (fs.existsSync(tmpStore)) fs.unlinkSync(tmpStore);

  console.log('\n========================================================');
  console.log('🎉 ALL ATLAS PHASE 3 EVOLUTION TESTS PASSED 100%!');
  console.log('========================================================');
})();
