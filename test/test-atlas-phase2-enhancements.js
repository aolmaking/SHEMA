'use strict';

/**
 * Automated Verification Suite for Living Atlas Phase 2 Enhancements:
 * 1. Miro Wisdom Archive & Consultation History
 * 2. Miro Daily Micro-Quest Generation & Fulfillment
 * 3. Living Materials Full Counters in Mini Bar
 * 4. Dynamic Haven Visual Progression Backdrops
 * 5. Particle FX & Radiant Glow Animations
 * 6. Strict Linguistic Integrity (Zero "الأثير")
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const { AtlasEngine } = require('../src/core/atlas/atlas-engine');
const { AtlasStore } = require('../src/core/atlas/atlas-store');

console.log('========================================================');
console.log('🧪 TESTING LIVING ATLAS — PHASE 2 ENHANCEMENTS SUITE');
console.log('========================================================\n');

(async () => {
  const tmpStore = path.join(os.tmpdir(), `test_atlas_enhancements_${Date.now()}.json`);
  let mockSettings = { atlas: { aiEnabled: false, apiKey: '' } };
  const engine = new AtlasEngine({ storePath: tmpStore, getSettings: () => mockSettings });

  // 1. Test Miro Wisdom Archive
  console.log('--- 1. Testing Miro Wisdom Archive & History Logging ---');
  assert.strictEqual(engine.getMiroConsultationHistory().length, 0, 'History should start empty');

  // Perform 3 consultations
  engine.consultMiro('reflection', 'ar', 'كيف أبدأ عادة القراءة اليوم؟');
  engine.consultMiro('wisdom', 'ar', 'ما أهمية التدرج؟');
  engine.consultMiro('habit_science', 'ar', 'ما هي قاعدة الدقيقتين؟');

  const history = engine.getMiroConsultationHistory();
  assert.strictEqual(history.length, 3, 'Must have recorded 3 consultations in history');
  assert.strictEqual(history[0].userQuestion, 'ما هي قاعدة الدقيقتين؟', 'Most recent must be first');
  assert.ok(history[0].dialogue, 'Must have dialogue');
  assert.ok(history[0].timestamp, 'Must have timestamp');

  // Verify history limit of 10
  for (let i = 0; i < 15; i++) {
    engine.consultMiro('calm', 'ar', `سؤال تجريبي ${i}`);
  }
  const limitedHistory = engine.getMiroConsultationHistory();
  assert.strictEqual(limitedHistory.length, 10, 'History must cap at maximum 10 entries');
  console.log('✅ Miro Wisdom Archive verified: chronological order, question capture, max 10 entries.');

  // 2. Test Miro Daily Micro-Quest
  console.log('\n--- 2. Testing Miro Daily Micro-Quest Generation & Completion ---');
  const quest = await engine.generateDailyQuest('ar');
  assert.ok(quest, 'Must generate daily quest');
  assert.ok(quest.titleAr.includes('مسار اليوم'), 'Title must be in Arabic');
  assert.strictEqual(quest.completed, false, 'Quest must start uncompleted');
  assert.strictEqual(quest.rewardGold, 15, 'Must offer 15 Haven Gold reward');
  assert.strictEqual(quest.rewardShards, 5, 'Must offer 5 Energy Shards reward');

  const goldBefore = engine.store.data.wayfinder.havenGold || 0;
  const shardsBefore = engine.store.data.wayfinder.livingMaterials?.aetherShards || 0;

  const completeRes = engine.completeDailyQuest();
  assert.strictEqual(completeRes.ok, true, 'Quest completion must succeed');
  assert.strictEqual(completeRes.quest.completed, true, 'Quest must be marked completed');

  const goldAfter = engine.store.data.wayfinder.havenGold;
  const shardsAfter = engine.store.data.wayfinder.livingMaterials.aetherShards;
  assert.strictEqual(goldAfter, goldBefore + 15, 'Must award 15 Haven Gold');
  assert.strictEqual(shardsAfter, shardsBefore + 5, 'Must award 5 Energy Shards');

  // Chronicle entry check
  const latestChronicle = engine.store.data.chronicleEntries[engine.store.data.chronicleEntries.length - 1];
  assert.strictEqual(latestChronicle.category, 'daily_quest', 'Chronicle entry must be daily_quest');
  assert(!latestChronicle.text.includes('الأثير'), 'Chronicle text must not contain "الأثير"');
  console.log('✅ Daily Micro-Quest verified: creation, non-punitive flow, reward distribution, chronicle logging.');

  // 3. Test Mini Bar Markup & JS Integration
  console.log('\n--- 3. Testing Habits Widget Mini Bar Living Materials Markup ---');
  const habitsHtml = fs.readFileSync(path.join(ROOT, 'windows', 'habits.html'), 'utf8');
  assert(habitsHtml.includes('id="habitsMiniGoldPill"'), 'habits.html must include gold pill');
  assert(habitsHtml.includes('id="habitsMiniShardsPill"'), 'habits.html must include shards pill');
  assert(habitsHtml.includes('id="habitsMiniScrapsPill"'), 'habits.html must include scraps pill');
  assert(habitsHtml.includes('id="habitsMiniSeedsPill"'), 'habits.html must include seeds pill');

  const habitsCss = fs.readFileSync(path.join(ROOT, 'windows', 'css', 'habits.css'), 'utf8');
  assert(habitsCss.includes('.atlas-mini-shards-pill'), 'habits.css must style shards pill');
  assert(habitsCss.includes('.atlas-mini-scraps-pill'), 'habits.css must style scraps pill');

  const habitsJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'habits.js'), 'utf8');
  assert(habitsJs.includes('habitsMiniShardsVal'), 'habits.js must update shards val');
  assert(habitsJs.includes('habitsMiniScrapsVal'), 'habits.js must update scraps val');
  console.log('✅ Mini Bar Living Materials verified: Gold, Energy Shards, Scraps, Seeds.');

  // 4. Test Dynamic Haven Visual Progression & Particle FX
  console.log('\n--- 4. Testing Dynamic Haven Visual Progression & Particle FX ---');
  const dashHtml = fs.readFileSync(path.join(ROOT, 'windows', 'habits-dashboard.html'), 'utf8');
  assert(dashHtml.includes('id="atlasMiroDailyQuestBtn"'), 'Must have #atlasMiroDailyQuestBtn');
  assert(dashHtml.includes('id="atlasMiroHistoryBtn"'), 'Must have #atlasMiroHistoryBtn');
  assert(dashHtml.includes('id="atlasMiroDailyQuestCard"'), 'Must have #atlasMiroDailyQuestCard');
  assert(dashHtml.includes('id="atlasMiroHistoryDrawer"'), 'Must have #atlasMiroHistoryDrawer');

  const dashCss = fs.readFileSync(path.join(ROOT, 'windows', 'css', 'habits-dashboard.css'), 'utf8');
  assert(dashCss.includes('.atlas-haven-hero.haven-lanterns-lit'), 'Must define haven-lanterns-lit style');
  assert(dashCss.includes('.atlas-haven-hero.haven-observatory-active'), 'Must define haven-observatory-active style');
  assert(dashCss.includes('.atlas-haven-hero.haven-garden-blooming'), 'Must define haven-garden-blooming style');
  assert(dashCss.includes('.atlas-haven-hero.haven-forge-ignited'), 'Must define haven-forge-ignited style');
  assert(dashCss.includes('@keyframes radiantGlowPulse'), 'Must define radiantGlowPulse keyframes');
  assert(dashCss.includes('.card-action-success-fx'), 'Must define card-action-success-fx class');

  const dashJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'habits-dashboard.js'), 'utf8');
  assert(dashJs.includes('haven-lanterns-lit'), 'habits-dashboard.js must toggle haven-lanterns-lit');
  assert(dashJs.includes('atlasMiroDailyQuestBtn'), 'habits-dashboard.js must wire daily quest btn');
  assert(dashJs.includes('atlasMiroHistoryBtn'), 'habits-dashboard.js must wire history btn');
  console.log('✅ Dynamic Haven Visuals and Particle FX verified.');

  // 5. IPC Handlers Verification
  console.log('\n--- 5. Testing IPC Handlers in main.js & preload.js ---');
  const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8');
  assert(mainJs.includes("'atlas:get-miro-history'"), 'main.js must handle atlas:get-miro-history');
  assert(mainJs.includes("'atlas:generate-daily-quest'"), 'main.js must handle atlas:generate-daily-quest');
  assert(mainJs.includes("'atlas:complete-daily-quest'"), 'main.js must handle atlas:complete-daily-quest');

  const preloadJs = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8');
  assert(preloadJs.includes('getMiroHistory:'), 'preload.js must expose getMiroHistory');
  assert(preloadJs.includes('generateDailyQuest:'), 'preload.js must expose generateDailyQuest');
  assert(preloadJs.includes('completeDailyQuest:'), 'preload.js must expose completeDailyQuest');
  console.log('✅ IPC Handlers bridge verified.');

  // Cleanup
  if (fs.existsSync(tmpStore)) fs.unlinkSync(tmpStore);

  console.log('\n========================================================');
  console.log('🎉 ALL ATLAS PHASE 2 ENHANCEMENTS TESTS PASSED 100%!');
  console.log('========================================================');
})();
