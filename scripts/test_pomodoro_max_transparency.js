/**
 * Test: Pomodoro Maximum Transparency (الشفافية القصوى لمؤقت التركيز)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('TESTING POMODORO MAXIMUM TRANSPARENCY OPTION');
console.log('========================================================\n');

// 1. pomodoro.html DOM elements
console.log('--- 1. Testing pomodoro.html Elements ---');
const pomoHtml = fs.readFileSync(path.join(__dirname, '../windows/pomodoro.html'), 'utf8');
assert.ok(pomoHtml.includes('id="transparencyBtn"'), 'pomodoro.html must contain #transparencyBtn');
assert.ok(pomoHtml.includes('id="fUltraTransparent"'), 'pomodoro.html must contain #fUltraTransparent');
console.log('✅ pomodoro.html DOM elements verified.');

// 2. pomodoro.css styling rules
console.log('--- 2. Testing pomodoro.css Styling Rules ---');
const pomoCss = fs.readFileSync(path.join(__dirname, '../windows/css/pomodoro.css'), 'utf8');
assert.ok(pomoCss.includes(".plate[data-transparency='max']"), 'pomodoro.css must style .plate[data-transparency="max"]');
assert.ok(pomoCss.includes("background: transparent !important"), 'pomodoro.css must set background to transparent !important');
assert.ok(pomoCss.includes("#transparencyBtn.active"), 'pomodoro.css must style active transparency button');
console.log('✅ pomodoro.css styling verified.');

// 3. pomodoro.js logic
console.log('--- 3. Testing pomodoro.js Functions & Wiring ---');
const pomoJs = fs.readFileSync(path.join(__dirname, '../windows/js/pomodoro.js'), 'utf8');
assert.ok(pomoJs.includes('function setTransparency(val)'), 'pomodoro.js must define setTransparency');
assert.ok(pomoJs.includes('function toggleTransparency()'), 'pomodoro.js must define toggleTransparency');
assert.ok(pomoJs.includes('transparencyBtn'), 'pomodoro.js must wire transparencyBtn');
assert.ok(pomoJs.includes('fUltraTransparent'), 'pomodoro.js must wire fUltraTransparent');
console.log('✅ pomodoro.js functions verified.');

// 4. settings.html and settings.js integration
console.log('--- 4. Testing Settings Window Integration ---');
const setHtml = fs.readFileSync(path.join(__dirname, '../windows/settings.html'), 'utf8');
assert.ok(setHtml.includes('id="pUltraTransparent"'), 'settings.html must contain #pUltraTransparent');
assert.ok(setHtml.includes('id="scopePomodoroPureTransparent"'), 'settings.html must contain #scopePomodoroPureTransparent');

const setJs = fs.readFileSync(path.join(__dirname, '../windows/js/settings.js'), 'utf8');
assert.ok(setJs.includes("'#pUltraTransparent'"), 'settings.js must wire #pUltraTransparent');
assert.ok(setJs.includes("'#scopePomodoroPureTransparent'"), 'settings.js must wire #scopePomodoroPureTransparent');
console.log('✅ Settings integration verified.');

// 5. normalizeConfig in core
console.log('--- 5. Testing normalizeConfig in pomodoro.js ---');
const { normalizeConfig } = require('../src/core/pomodoro');
const confTrue = normalizeConfig({ ultraTransparent: true });
assert.strictEqual(confTrue.ultraTransparent, true, 'normalizeConfig must preserve ultraTransparent: true');
const confFalse = normalizeConfig({ ultraTransparent: false });
assert.strictEqual(confFalse.ultraTransparent, false, 'normalizeConfig must preserve ultraTransparent: false');
console.log('✅ normalizeConfig verified.');

console.log('\n========================================================');
console.log('🎉 ALL POMODORO MAXIMUM TRANSPARENCY TESTS PASSED (100%)!');
console.log('========================================================\n');
