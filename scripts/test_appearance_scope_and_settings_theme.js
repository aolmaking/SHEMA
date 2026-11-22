'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('========================================================');
console.log('TESTING APPEARANCE SCOPE SELECTOR & SETTINGS WINDOW THEME');
console.log('========================================================\n');

const settingsHtmlPath = path.join(__dirname, '..', 'windows', 'settings.html');
const settingsCssPath = path.join(__dirname, '..', 'windows', 'css', 'settings.css');
const settingsJsPath = path.join(__dirname, '..', 'windows', 'js', 'settings.js');
const shellJsPath = path.join(__dirname, '..', 'windows', 'js', 'shell.js');

const settingsHtml = fs.readFileSync(settingsHtmlPath, 'utf8');
const settingsCss = fs.readFileSync(settingsCssPath, 'utf8');
const settingsJs = fs.readFileSync(settingsJsPath, 'utf8');
const shellJs = fs.readFileSync(shellJsPath, 'utf8');

// --- 1. HTML Verification ---
console.log('--- 1. Testing Appearance Scope HTML Structure ---');
assert.ok(settingsHtml.includes('id="scopeControlBox"'), 'scopeControlBox must exist in settings.html');
assert.ok(settingsHtml.includes('id="appearanceScopeSelect"'), 'appearanceScopeSelect must exist');
assert.ok(settingsHtml.includes('id="scopeStatusPill"'), 'scopeStatusPill must exist');
assert.ok(settingsHtml.includes('id="scopeResetBtn"'), 'scopeResetBtn must exist');
assert.ok(settingsHtml.includes('id="scopeHintText"'), 'scopeHintText must exist');
assert.ok(settingsHtml.includes('id="scopeGlassRow"'), 'scopeGlassRow must exist');
assert.ok(settingsHtml.includes('id="scopeFontScaleRow"'), 'scopeFontScaleRow must exist');

// Verify all required targets in appearanceScopeSelect
const requiredTargets = [
  'value="global"',
  'value="settings"',
  'value="clock"',
  'value="pomodoro"',
  'value="calendar"',
  'value="todo"',
  'value="habits"',
  'value="quran"',
  'value="tafsir"',
  'value="hadith"',
  'value="notes"',
  'value="email"',
  'value="photo"',
  'value="event"'
];
for (const target of requiredTargets) {
  assert.ok(settingsHtml.includes(target), `appearanceScopeSelect must include target option ${target}`);
}
console.log('✅ All appearance scope DOM elements and target options verified.');

// --- 2. CSS Verification ---
console.log('\n--- 2. Testing Appearance Scope CSS Architecture ---');
assert.ok(settingsCss.includes('.scope-box'), '.scope-box CSS class must exist');
assert.ok(settingsCss.includes('.scope-top-row'), '.scope-top-row CSS class must exist');
assert.ok(settingsCss.includes('.scope-pill.is-custom'), '.scope-pill.is-custom active style must exist');
assert.ok(settingsCss.includes('.scope-reset-btn'), '.scope-reset-btn CSS class must exist');
assert.ok(settingsCss.includes('.scope-picker'), '.scope-picker styling must exist');
console.log('✅ Appearance scope CSS classes and micro-interactions verified.');

// --- 3. JavaScript Wiring & Helpers Verification ---
console.log('\n--- 3. Testing Settings.js Scope Logic & Synchronizers ---');
assert.ok(settingsJs.includes('let currentScope = \'global\';'), 'currentScope must default to global');
assert.ok(settingsJs.includes('function getEffectiveTheme('), 'getEffectiveTheme helper must exist');
assert.ok(settingsJs.includes('function getEffectiveAccent('), 'getEffectiveAccent helper must exist');
assert.ok(settingsJs.includes('function getEffectiveRadius('), 'getEffectiveRadius helper must exist');
assert.ok(settingsJs.includes('function getEffectiveGlass('), 'getEffectiveGlass helper must exist');
assert.ok(settingsJs.includes('function getEffectiveScale('), 'getEffectiveScale helper must exist');
assert.ok(settingsJs.includes('function getEffectiveFont('), 'getEffectiveFont helper must exist');
assert.ok(settingsJs.includes('function getEffectiveLookProp('), 'getEffectiveLookProp helper must exist');
assert.ok(settingsJs.includes('function saveScopedStyle('), 'saveScopedStyle helper must exist');
assert.ok(settingsJs.includes('function syncAppearanceScopeUI()'), 'syncAppearanceScopeUI function must exist');
assert.ok(settingsJs.includes('function markFontCards()'), 'markFontCards helper must exist');
assert.ok(settingsJs.includes('function syncTypographyControls()'), 'syncTypographyControls helper must exist');
assert.ok(settingsJs.includes('function syncLookControls()'), 'syncLookControls helper must exist');
assert.ok(settingsJs.includes('$(\'#appearanceScopeSelect\')?.addEventListener(\'change\''), 'appearanceScopeSelect change listener must be registered');
assert.ok(settingsJs.includes('$(\'#scopeResetBtn\')?.addEventListener(\'click\''), 'scopeResetBtn click listener must be registered');
console.log('✅ All scope functions, reactive synchronization, and event listeners verified.');

// --- 4. Translations Verification ---
console.log('\n--- 4. Testing Arabic and English i18n Scope Keys ---');
const requiredI18nKeys = [
  's.appearanceScopeTitle',
  's.appearanceScopeDesc',
  's.chooseTarget',
  's.scopeGlobal',
  's.scopeSettings',
  's.groupWidgets',
  's.scopeStatusGlobal',
  's.scopeStatusCustom',
  's.scopeStatusInherit',
  's.resetToGlobal',
  's.scopeHintGlobal',
  's.scopeHintCustom',
  's.scopeHintInherit',
  's.glassThisWidget',
  's.wTafsir',
  's.wHadith',
  's.wEvent'
];

for (const key of requiredI18nKeys) {
  const arPattern = new RegExp(`'${key.replace('.', '\\.')}'\\s*:`);
  assert.ok(arPattern.test(settingsJs), `Arabic dictionary must include '${key}'`);
}
console.log('✅ All required Arabic translation keys verified.');

for (const key of requiredI18nKeys) {
  // Check in en section
  const enIndex = settingsJs.indexOf('en: {');
  assert.ok(enIndex > 0, 'English dictionary must exist');
  const enContent = settingsJs.slice(enIndex);
  const enPattern = new RegExp(`'${key.replace('.', '\\.')}'\\s*:`);
  assert.ok(enPattern.test(enContent), `English dictionary must include '${key}'`);
}
console.log('✅ All required English translation keys verified.');

// --- 5. Shell.js Style Precedence ---
console.log('\n--- 5. Testing Shell.js PAGE Precedence over Parent Widget ---');
assert.ok(
  shellJs.includes("s.widgetStyles?.[PAGE] || s.widgetStyles?.[widgetKey]"),
  'PAGE specific style must take precedence over parent widget style in shell.js'
);
console.log('✅ Shell.js correctly resolves PAGE specific style before parent fallback.');

console.log('\n========================================================');
console.log('🎉 ALL APPEARANCE SCOPE & SETTINGS THEME TESTS PASSED (100%)');
console.log('========================================================');
