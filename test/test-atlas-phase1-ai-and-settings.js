'use strict';

/**
 * Automated Verification Suite for Living Atlas Phase 1:
 * - Atlas AI & Miro Storyteller Integration
 * - Settings Window Setup Card & IPC
 * - Grounded Arabic Phrasing (Anti-"الأثير" Verification)
 * - Haven Gold i18n & Mini Status Bar Assets
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

console.log('========================================================');
console.log('🧪 TESTING THE LIVING ATLAS — PHASE 1 AI & SETTINGS SUITE');
console.log('========================================================\n');

// 1. Verify atlas-ai.js and Prompt Guardrails
console.log('--- 1. Testing Atlas AI Engine & Prompt Guardrails ---');
const atlasAi = require('../src/core/atlas/atlas-ai');
assert(typeof atlasAi.testGeminiConnection === 'function', 'testGeminiConnection should be exported');
assert(typeof atlasAi.callGeminiApi === 'function', 'callGeminiApi should be exported');
assert(typeof atlasAi.ATLAS_AI_SYSTEM_PROMPT === 'string', 'ATLAS_AI_SYSTEM_PROMPT should be exported');

// Ensure "الأثير" is explicitly forbidden in the prompt and replaced by natural terms
assert(atlasAi.ATLAS_AI_SYSTEM_PROMPT.includes('بلورات الطاقة') || atlasAi.ATLAS_AI_SYSTEM_PROMPT.includes('أحجار النور'), 'Prompt must use natural crystal terms');
assert(atlasAi.ATLAS_AI_SYSTEM_PROMPT.includes('يُحظر تماماً استخدام ألفاظ الفانتازيا المبتذلة أو المصطلحات الغريبة والمملة مثل كلمة "الأثير"'), 'Prompt must explicitly forbid "الأثير"');
assert(atlasAi.ATLAS_AI_SYSTEM_PROMPT.includes('ذهب الملاذ'), 'Prompt must include Haven Gold');
assert(atlasAi.ATLAS_AI_SYSTEM_PROMPT.includes('بذور النور'), 'Prompt must include Seeds of Light');
assert(atlasAi.ATLAS_AI_SYSTEM_PROMPT.includes('Pure White-Hat'), 'Prompt must mandate white-hat non-punitive gamification');
console.log('✅ Atlas AI Engine & System Prompt guardrails verified.');

// 2. Test Gemini connection error handling with invalid/empty key
console.log('\n--- 2. Testing Gemini Connection Error Handling ---');
(async () => {
  const emptyRes = await atlasAi.testGeminiConnection({ apiKey: '' });
  assert.strictEqual(emptyRes.ok, false, 'Empty API key must fail gracefully');
  assert(emptyRes.error.includes('مفتاح Google Gemini API غير متوفر') || emptyRes.error.includes('مفتاح API غير متوفر'), 'Should return friendly Arabic error message');

  const invalidRes = await atlasAi.testGeminiConnection({ apiKey: 'invalid_dummy_key_12345' });
  assert.strictEqual(invalidRes.ok, false, 'Invalid API key must fail gracefully');
  assert(typeof invalidRes.error === 'string' && invalidRes.error.length > 5, 'Should return informative error');
  console.log('✅ Local-first Gemini error handling verified.');

  // 3. Test Materials Meta - Zero "أحجار الأثير"
  console.log('\n--- 3. Testing Living Materials Natural Arabic Terminology ---');
  const { LIVING_MATERIALS_META } = require('../src/core/atlas/atlas-materials');
  assert.strictEqual(LIVING_MATERIALS_META.aetherShards.nameAr, 'بلورات الطاقة', 'nameAr must be "بلورات الطاقة"');
  assert(!JSON.stringify(LIVING_MATERIALS_META).includes('أحجار الأثير'), 'No occurrences of "أحجار الأثير" allowed');
  console.log('✅ Living Materials Arabic names verified as natural and grounded.');

  // 4. Test main.js & preload.js IPC bindings
  console.log('\n--- 4. Testing main.js and preload.js Setup ---');
  const mainContent = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8');
  assert(mainContent.includes('atlas:test-ai'), 'main.js must handle "atlas:test-ai"');
  assert(mainContent.includes("aiEnabled: false"), 'main.js DEFAULTS must include atlas.aiEnabled');

  const preloadContent = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8');
  assert(preloadContent.includes("testAi: (opts) => ipcRenderer.invoke('atlas:test-ai', opts)"), 'preload.js must expose testAi');
  console.log('✅ IPC handlers for Atlas AI verified in main.js & preload.js.');

  // 5. Test windows/settings.html & windows/js/settings.js Setup Card
  console.log('\n--- 5. Testing Settings Setup Card & Modal Guide ---');
  const settingsHtml = fs.readFileSync(path.join(ROOT, 'windows', 'settings.html'), 'utf8');
  assert(settingsHtml.includes('id="sec-setup-atlas"'), 'settings.html must contain #sec-setup-atlas');
  assert(settingsHtml.includes('id="atlasAiEnabled"'), 'settings.html must contain #atlasAiEnabled');
  assert(settingsHtml.includes('id="atlasApiKey"'), 'settings.html must contain #atlasApiKey');
  assert(settingsHtml.includes('id="atlasAiModel"'), 'settings.html must contain #atlasAiModel');
  assert(settingsHtml.includes('id="atlasAiTestBtn"'), 'settings.html must contain #atlasAiTestBtn');
  assert(settingsHtml.includes('data-guide="atlas"'), 'settings.html must link data-guide="atlas"');

  const settingsJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'settings.js'), 'utf8');
  assert(settingsJs.includes('syncAtlasAiSetup'), 'settings.js must define syncAtlasAiSetup');
  assert(settingsJs.includes('wireAtlasAiSetup'), 'settings.js must define wireAtlasAiSetup');
  assert(settingsJs.includes("type === 'atlas'"), 'settings.js guide modal must handle atlas');
  console.log('✅ Settings setup card, guide modal, and event wiring verified.');

  // 6. Test havenGold i18n & Mini Bar
  console.log('\n--- 6. Testing Haven Gold i18n & Mini Bar Upgrades ---');
  const shellJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'shell.js'), 'utf8');
  assert(shellJs.includes("'atlas.havenGold': 'ذهب الملاذ'"), 'shell.js must contain atlas.havenGold in Arabic');
  assert(shellJs.includes("'atlas.havenGold': 'Haven Gold'"), 'shell.js must contain atlas.havenGold in English');

  const habitsJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'habits.js'), 'utf8');
  assert(habitsJs.includes("'atlas.havenGold': 'ذهب الملاذ'"), 'habits.js must contain atlas.havenGold');

  const habitsCss = fs.readFileSync(path.join(ROOT, 'windows', 'css', 'habits.css'), 'utf8');
  assert(habitsCss.includes('.atlas-mini-gold-pill'), 'habits.css must style mini gold pill');
  assert(habitsCss.includes('.atlas-mini-quick-step-btn'), 'habits.css must style micro-step button');

  const habitsDashCss = fs.readFileSync(path.join(ROOT, 'windows', 'css', 'habits-dashboard.css'), 'utf8');
  assert(habitsDashCss.includes('01_world_panorama_floating_islands.jpg'), 'habits-dashboard.css must use the panorama brand asset');

  const skillMd = fs.readFileSync(path.join(ROOT, 'assets', 'skills', 'atlas-storyteller', 'SKILL.md'), 'utf8');
  assert(skillMd.includes('atlas-storyteller'), 'SKILL.md must define the storyteller skill');
  assert(skillMd.includes('Pure White-Hat Gamification'), 'SKILL.md must specify white-hat rules');
  console.log('✅ Visual assets, mini bar, and SKILL.md verified.');

  console.log('\n========================================================');
  console.log('🎉 ALL ATLAS PHASE 1 AI & SETTINGS TESTS PASSED 100%!');
  console.log('========================================================');
})();
