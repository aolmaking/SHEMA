'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('🧪 TESTING THE LIVING ATLAS — PHASE 4 UI INTEGRATION');
console.log('========================================================\n');

try {
  // 1. Verify habits-dashboard.html DOM Markup & Tag Balancing
  console.log('--- 1. Testing Dashboard HTML Structure & Tag Balancing ---');
  const dashHtml = fs.readFileSync(path.join(__dirname, '../windows/habits-dashboard.html'), 'utf8');

  assert.ok(dashHtml.includes('data-tab="atlas"'), 'Atlas nav tab button must exist');
  assert.ok(dashHtml.includes('id="pane-atlas"'), '#pane-atlas container must exist');
  assert.ok(dashHtml.includes('id="atlasWayfinderName"'), '#atlasWayfinderName badge must exist');
  assert.ok(dashHtml.includes('id="atlasInductionModal"'), '#atlasInductionModal must exist');
  assert.ok(dashHtml.includes('id="atlasInductionNameInput"'), '#atlasInductionNameInput must exist');
  assert.ok(dashHtml.includes('id="atlasWayfinderLevel"'), '#atlasWayfinderLevel must exist');
  assert.ok(dashHtml.includes('id="atlasWayfinderTitle"'), '#atlasWayfinderTitle must exist');
  assert.ok(dashHtml.includes('id="atlasHavenGold"'), '#atlasHavenGold must exist');
  assert.ok(dashHtml.includes('id="atlasXpFill"'), '#atlasXpFill must exist');
  assert.ok(dashHtml.includes('id="atlasMiroAvatarBox"'), '#atlasMiroAvatarBox must exist');
  assert.ok(dashHtml.includes('id="atlasMiroSpeech"'), '#atlasMiroSpeech must exist');
  assert.ok(dashHtml.includes('id="atlasMiroInteractBtn"'), '#atlasMiroInteractBtn must exist');
  assert.ok(dashHtml.includes('id="atlasFacilitiesList"'), '#atlasFacilitiesList must exist');
  assert.ok(dashHtml.includes('id="atlasCluesGrid"'), '#atlasCluesGrid must exist');
  assert.ok(dashHtml.includes('id="atlasForeshadowingBanner"'), '#atlasForeshadowingBanner must exist');

  // Verify Tag Balancing of habits-dashboard.html across entire HTML
  const dashStack = [];
  const tagRegex = /<\/?([a-zA-Z0-9\-]+)(?:\s+[^>]*)?>/g;
  let match;
  while ((match = tagRegex.exec(dashHtml)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    if (['input', 'img', 'br', 'hr', 'meta', 'link'].includes(tagName)) continue;
    if (fullTag.endsWith('/>')) continue;

    if (fullTag.startsWith('</')) {
      const last = dashStack.pop();
      assert.strictEqual(
        last && last.tag,
        tagName,
        `Tag mismatch in habits-dashboard.html: found </${tagName}> but expected </${last ? last.tag : 'NONE'}>`
      );
    } else {
      dashStack.push({ tag: tagName, raw: fullTag });
    }
  }
  assert.strictEqual(dashStack.length, 0, `Unclosed tags in habits-dashboard.html: ${dashStack.map(s => s.tag).join(', ')}`);
  console.log('✅ Dashboard HTML and tag balancing verified 100%.');

  // 2. Verify habits.html (Mini Desktop Tile Widget) Markup & Tag Balancing
  console.log('\n--- 2. Testing Mini Widget HTML Markup & Tag Balancing ---');
  const habitsHtml = fs.readFileSync(path.join(__dirname, '../windows/habits.html'), 'utf8');

  assert.ok(habitsHtml.includes('id="atlasMiniMiroMote"'), '#atlasMiniMiroMote must exist in mini widget header');
  assert.ok(habitsHtml.includes('id="habitsAtlasMiniBar"'), '#habitsAtlasMiniBar must exist in habits.html');
  assert.ok(habitsHtml.includes('id="habitsMiniWayfinderName"'), '#habitsMiniWayfinderName must exist in habits.html');
  assert.ok(habitsHtml.includes('id="habitsMiniMiroAvatar"'), '#habitsMiniMiroAvatar must exist in habits.html');
  assert.ok(habitsHtml.includes('id="habitsMiniLevelBadge"'), '#habitsMiniLevelBadge must exist in habits.html');
  assert.ok(habitsHtml.includes('id="habitsMiniGoldVal"'), '#habitsMiniGoldVal must exist in habits.html');
  assert.ok(habitsHtml.includes('id="habitsMiniSeedsVal"'), '#habitsMiniSeedsVal must exist in habits.html');
  assert.ok(habitsHtml.includes('id="habitsMiniXpFill"'), '#habitsMiniXpFill must exist in habits.html');
  assert.ok(habitsHtml.includes('id="habitsMiniQuickStepBtn"'), '#habitsMiniQuickStepBtn must exist in habits.html');
  assert.ok(habitsHtml.includes('id="habitsMiniMiroBubble"'), '#habitsMiniMiroBubble must exist in habits.html');
  assert.ok(habitsHtml.includes('id="popShowAtlasBar"'), '#popShowAtlasBar switch must exist in habits.html');

  // Verify Tag Balancing of habits.html across entire HTML
  const widgetStack = [];
  tagRegex.lastIndex = 0;
  while ((match = tagRegex.exec(habitsHtml)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    if (['input', 'img', 'br', 'hr', 'meta', 'link'].includes(tagName)) continue;
    if (fullTag.endsWith('/>')) continue;

    if (fullTag.startsWith('</')) {
      const last = widgetStack.pop();
      assert.strictEqual(
        last && last.tag,
        tagName,
        `Tag mismatch in habits.html: found </${tagName}> but expected </${last ? last.tag : 'NONE'}>`
      );
    } else {
      widgetStack.push({ tag: tagName, raw: fullTag });
    }
  }
  assert.strictEqual(widgetStack.length, 0, `Unclosed tags in habits.html: ${widgetStack.map(s => s.tag).join(', ')}`);
  console.log('✅ Mini widget markup and strict tag balancing verified 100%.');

  // 3. Verify CSS Styles for Mini Widget & Responsive Downscaling
  console.log('\n--- 3. Testing CSS Styles & Responsive Rules ---');
  const habitsCss = fs.readFileSync(path.join(__dirname, '../windows/css/habits.css'), 'utf8');

  assert.ok(habitsCss.includes('.habits-atlas-mini-bar'), 'CSS must define .habits-atlas-mini-bar');
  assert.ok(habitsCss.includes('.atlas-mini-avatar'), 'CSS must define .atlas-mini-avatar');
  assert.ok(habitsCss.includes('13_miro_starlight_spirit_official.jpg'), 'CSS must use official Miro brand image');
  assert.ok(habitsCss.includes('.atlas-mini-quick-step-btn'), 'CSS must define .atlas-mini-quick-step-btn');
  assert.ok(habitsCss.includes('.habits-mini-miro-bubble'), 'CSS must define .habits-mini-miro-bubble');
  assert.ok(habitsCss.includes('.h-micro-step-btn'), 'CSS must define .h-micro-step-btn');
  assert.ok(habitsCss.includes('.h-micro-step-badge'), 'CSS must define .h-micro-step-badge');
  assert.ok(habitsCss.includes('.habit-card.is-micro-step'), 'CSS must define .habit-card.is-micro-step');
  assert.ok(habitsCss.includes('#habitsAtlasMiniBar'), 'CSS must include #habitsAtlasMiniBar in container query downscaling');
  console.log('✅ CSS rules, official brand image references, and downscaling verified 100%.');

  // 4. Verify JavaScript Logic & Wire Handlers
  console.log('\n--- 4. Testing JavaScript Wire Handlers ---');
  const dashJs = fs.readFileSync(path.join(__dirname, '../windows/js/habits-dashboard.js'), 'utf8');
  assert.ok(dashJs.includes("case 'atlas':"), 'dashJs must handle switchTab for atlas');
  assert.ok(dashJs.includes('renderAtlasPane'), 'dashJs must define renderAtlasPane()');
  assert.ok(dashJs.includes('atlasMiroInteractBtn'), 'dashJs must wire atlasMiroInteractBtn');
  assert.ok(dashJs.includes('facility-upgrade-btn'), 'dashJs must wire facility upgrade buttons');

  const habitsJs = fs.readFileSync(path.join(__dirname, '../windows/js/habits.js'), 'utf8');
  assert.ok(habitsJs.includes('#atlasMiniMiroMote'), 'habitsJs must wire click listener for atlasMiniMiroMote');
  assert.ok(habitsJs.includes('renderAtlasMiniBar'), 'habitsJs must define renderAtlasMiniBar()');
  assert.ok(habitsJs.includes('triggerFirstPendingMicroStep'), 'habitsJs must define triggerFirstPendingMicroStep()');
  assert.ok(habitsJs.includes('h-micro-step-btn'), 'habitsJs must add micro-step button on habit cards');
  assert.ok(habitsJs.includes('habitsMiniQuickStepBtn'), 'habitsJs must wire habitsMiniQuickStepBtn');
  assert.ok(habitsJs.includes('habitsMiniMiroAvatarWrap'), 'habitsJs must wire habitsMiniMiroAvatarWrap');
  assert.ok(habitsJs.includes('popShowAtlasBar'), 'habitsJs must wire popShowAtlasBar');
  assert.ok(habitsJs.includes('window.widgets?.atlas?.onUpdated'), 'habitsJs must listen to atlas:updated');
  console.log('✅ JavaScript logic and wire handlers verified.');

  // 5. Verify Core Habits Engine & Micro-Step Architecture
  console.log('\n--- 5. Testing Core Habits Engine & IPC Bridge ---');
  const coreHabitsJs = fs.readFileSync(path.join(__dirname, '../src/core/habits.js'), 'utf8');
  assert.ok(coreHabitsJs.includes('isMicroStep = false'), 'saveHabitStatus must support isMicroStep parameter');
  assert.ok(coreHabitsJs.includes('isMicroStep: Boolean(isMicroStep)'), 'saveHabitStatus must store and emit isMicroStep');

  const preloadJs = fs.readFileSync(path.join(__dirname, '../preload.js'), 'utf8');
  assert.ok(preloadJs.includes('atlas:get-state'), 'preload.js must expose atlas:get-state');
  assert.ok(preloadJs.includes('atlas:upgrade-facility'), 'preload.js must expose atlas:upgrade-facility');
  assert.ok(preloadJs.includes('atlas:resolve-obstacle'), 'preload.js must expose atlas:resolve-obstacle');
  assert.ok(preloadJs.includes('atlas:get-miro-dialogue'), 'preload.js must expose atlas:get-miro-dialogue');
  assert.ok(preloadJs.includes('atlas:set-wayfinder-name'), 'preload.js must expose atlas:set-wayfinder-name');

  const mainJs = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');
  assert.ok(mainJs.includes('AtlasEngine'), 'main.js must import AtlasEngine');
  assert.ok(mainJs.includes('atlasEngine.bridgeHabitsManager'), 'main.js must bridge habitsManager with atlasEngine');
  assert.ok(mainJs.includes("ipcMain.handle('atlas:get-state'"), 'main.js must register atlas:get-state handler');
  assert.ok(mainJs.includes("ipcMain.handle('atlas:upgrade-facility'"), 'main.js must register atlas:upgrade-facility handler');
  assert.ok(mainJs.includes("ipcMain.handle('atlas:set-wayfinder-name'"), 'main.js must register atlas:set-wayfinder-name handler');
  assert.ok(mainJs.includes('isMicroStep'), 'main.js must forward isMicroStep in habits:save-status');
  console.log('✅ Core habits engine and IPC bridge verified.');

  // 6. Functional Verification of Wayfinder Name & Miro Personalization
  console.log('\n--- 6. Testing Wayfinder Name Induction & Miro Dialogue Personalization ---');
  const { AtlasStore } = require('../src/core/atlas/atlas-store');
  const { AtlasEngine } = require('../src/core/atlas/atlas-engine');
  const { MiroCompanion, MIRO_STATES } = require('../src/core/atlas/atlas-miro');

  const tmpStorePath = path.join(__dirname, 'fixtures/atlas-test-name.json');
  if (fs.existsSync(tmpStorePath)) fs.unlinkSync(tmpStorePath);

  const testStore = new AtlasStore(tmpStorePath);
  assert.strictEqual(testStore.data.wayfinder.name, 'مستكشف الدرب', 'Default name should be مستكشف الدرب');
  assert.strictEqual(testStore.data.wayfinder.isNamed, false, 'Default isNamed should be false');

  testStore.setWayfinderName('طارق');
  assert.strictEqual(testStore.data.wayfinder.name, 'طارق', 'Name should update to طارق');
  assert.strictEqual(testStore.data.wayfinder.isNamed, true, 'isNamed should become true');

  const testEngine = new AtlasEngine({ storePath: tmpStorePath });
  const dashState = testEngine.getDashboardState('ar');
  assert.strictEqual(dashState.wayfinder.name, 'طارق', 'Dashboard state should return Wayfinder name');
  assert.strictEqual(dashState.wayfinder.isNamed, true, 'Dashboard state should return isNamed true');

  const miroComp = new MiroCompanion();
  const arSpeech = miroComp.getDialogueForState(MIRO_STATES.WELCOMING, { lang: 'ar', name: 'طارق' });
  assert.ok(arSpeech.includes('طارق'), `Miro Arabic dialogue should be personalized with name: ${arSpeech}`);

  const enSpeech = miroComp.getDialogueForState(MIRO_STATES.CELEBRATING, { lang: 'en', name: 'Tariq' });
  assert.ok(enSpeech.includes('Tariq'), `Miro English dialogue should be personalized with name: ${enSpeech}`);

  if (fs.existsSync(tmpStorePath)) fs.unlinkSync(tmpStorePath);
  console.log('✅ Wayfinder Name induction and Miro dialogue personalization verified 100%.');

  console.log('\n========================================================');
  console.log('🎉 ALL ATLAS PHASE 4 UI TESTS PASSED (100%)');
  console.log('========================================================');
} catch (err) {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
}
