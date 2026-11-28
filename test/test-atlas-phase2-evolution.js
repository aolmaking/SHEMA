'use strict';

/**
 * Automated Verification Suite for Living Atlas Phase 2:
 * - Astrolabe Behavioral Skill Tree & Zero "الأثير" Integrity
 * - Haven Workshop Crafting Engine & Living Materials
 * - Miro Alcove Direct AI Consultation & Deterministic Fallback
 * - Brand Art Background Themes & Sub-view Wiring
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const { AtlasEngine } = require('../src/core/atlas/atlas-engine');
const { ASTROLABE_SKILLS, ASTROLABE_BRANCHES } = require('../src/core/atlas/atlas-skills');
const { LIVING_MATERIALS_META, HAVEN_CRAFTING_PROJECTS } = require('../src/core/atlas/atlas-materials');

console.log('========================================================');
console.log('🧪 TESTING THE LIVING ATLAS — PHASE 2 EVOLUTION SUITE');
console.log('========================================================\n');

(async () => {
  // 1. Astrolabe Skills & Linguistic Purity
  console.log('--- 1. Testing Astrolabe Behavioral Skills & Linguistic Purity ---');
  assert.strictEqual(Object.keys(ASTROLABE_BRANCHES).length, 5, 'Must have 5 behavioral branches');
  assert.strictEqual(ASTROLABE_SKILLS.length, 5, 'Must have 5 core behavioral skills');

  // Verify zero "أثير" in Arabic text
  ASTROLABE_SKILLS.forEach(skill => {
    assert(!skill.mechanicalEffectAr.includes('أثير'), `Skill ${skill.id} mechanicalEffectAr must not contain "أثير"`);
    assert(!skill.descriptionAr.includes('أثير'), `Skill ${skill.id} descriptionAr must not contain "أثير"`);
  });
  assert(ASTROLABE_SKILLS.some(s => s.mechanicalEffectAr.includes('بلورة طاقة')), 'Must use "بلورة طاقة" in mechanical effects');
  console.log('✅ Astrolabe Skills verified: 5 branches, pure natural Arabic, zero "أثير".');

  // 2. Haven Workshop & Living Materials
  console.log('\n--- 2. Testing Haven Workshop Projects & Materials Faucets ---');
  assert.strictEqual(LIVING_MATERIALS_META.aetherShards.nameAr, 'بلورات الطاقة', 'nameAr must be "بلورات الطاقة"');
  assert.strictEqual(HAVEN_CRAFTING_PROJECTS.length, 4, 'Must have 4 Haven crafting projects');
  HAVEN_CRAFTING_PROJECTS.forEach(proj => {
    assert(proj.cost, `Project ${proj.id} must define cost`);
    assert(proj.titleAr, `Project ${proj.id} must have titleAr`);
  });
  console.log('✅ Haven Workshop Projects verified.');

  // 3. Miro Alcove Interactive AI Consultation & Fallback
  console.log('\n--- 3. Testing Miro Alcove Interactive Consultation ---');
  const tmpStore = path.join(os.tmpdir(), `test_atlas_phase2_${Date.now()}.json`);
  let mockSettings = { atlas: { aiEnabled: false, apiKey: '' } };
  const engine = new AtlasEngine({ storePath: tmpStore, getSettings: () => mockSettings });

  // Deterministic fallback test
  const fallbackConsultation = await engine.consultMiro('reflection', 'ar', 'كيف أبدأ عادتي اليوم؟');
  assert.ok(fallbackConsultation, 'Consultation must return an object');
  assert.ok(fallbackConsultation.titleAr, 'Must have titleAr');
  assert.ok(fallbackConsultation.dialogue, 'Must have dialogue text');
  assert.strictEqual(fallbackConsultation.isAiGenerated, undefined, 'Deterministic fallback should not be AI generated');

  // AI-enabled test (graceful error handling if key is dummy)
  mockSettings = { atlas: { aiEnabled: true, apiKey: 'dummy_test_key_123', model: 'gemini-1.5-flash' } };
  const aiAttempt = await engine.consultMiro('wisdom', 'ar', 'ما هي حكمة السالكين الأوائل؟');
  assert.ok(aiAttempt, 'Must return a consultation object even if AI network call fails');
  assert.ok(aiAttempt.dialogue, 'Must contain fallback dialogue text upon API failure');
  console.log('✅ Miro Alcove Consultation & graceful fallback verified.');

  // 4. HTML & CSS Integration in Habits Dashboard
  console.log('\n--- 4. Testing Dashboard Markup & Brand Art Styling ---');
  const dashHtml = fs.readFileSync(path.join(ROOT, 'windows', 'habits-dashboard.html'), 'utf8');
  assert(dashHtml.includes('id="atlasMiroAskAiRow"'), 'Must contain #atlasMiroAskAiRow');
  assert(dashHtml.includes('id="atlasMiroAskInput"'), 'Must contain #atlasMiroAskInput');
  assert(dashHtml.includes('id="atlasMiroAskBtn"'), 'Must contain #atlasMiroAskBtn');
  assert(dashHtml.includes('id="atlasSubViewSkills"'), 'Must contain Astrolabe skills subview');
  assert(dashHtml.includes('id="atlasSubViewWorkshop"'), 'Must contain Haven workshop subview');
  assert(dashHtml.includes('id="atlasSubViewMiro"'), 'Must contain Miro alcove subview');

  const dashCss = fs.readFileSync(path.join(ROOT, 'windows', 'css', 'habits-dashboard.css'), 'utf8');
  assert(dashCss.includes('09_astrolabe_skill_tree_medallion.jpg'), 'Must reference astrolabe medallion asset');
  assert(dashCss.includes('07_cartographer_study_haven_library.jpg'), 'Must reference library asset');
  assert(dashCss.includes('03_the_crossroads_stone_bridges.jpg'), 'Must reference crossroads asset');
  assert(dashCss.includes('.miro-ask-ai-input'), 'Must style interactive ask input');
  assert(dashCss.includes('.miro-ask-ai-btn'), 'Must style interactive ask button');

  const dashJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'habits-dashboard.js'), 'utf8');
  assert(dashJs.includes('atlasMiroAskBtn'), 'habits-dashboard.js must wire #atlasMiroAskBtn');
  console.log('✅ Markup, styles, and interactive JS wiring verified.');

  // Cleanup
  if (fs.existsSync(tmpStore)) fs.unlinkSync(tmpStore);

  console.log('\n========================================================');
  console.log('🎉 ALL ATLAS PHASE 2 EVOLUTION TESTS PASSED 100%!');
  console.log('========================================================');
})();
