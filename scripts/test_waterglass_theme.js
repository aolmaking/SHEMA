'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== Running Water Glass Theme & Rich Palette Verification Tests ===');

// Test 1: base.css defines waterglass theme
const baseCss = fs.readFileSync(path.join(__dirname, '../windows/css/base.css'), 'utf8');
assert(baseCss.includes(":root[data-theme='waterglass']"), 'base.css must define data-theme="waterglass"');
assert(baseCss.includes('radial-gradient'), 'waterglass theme must include liquid caustics specular highlights');
console.log('✔ Test 1: base.css defines waterglass liquid glass theme with caustics lighting');

// Test 2: settings.css defines sw-waterglass
const settingsCss = fs.readFileSync(path.join(__dirname, '../windows/css/settings.css'), 'utf8');
assert(settingsCss.includes('.sw-waterglass'), 'settings.css must define .sw-waterglass preview swatch');
console.log('✔ Test 2: settings.css defines .sw-waterglass preview swatch');

// Test 3: settings.js includes waterglass in THEMES and expanded ACCENTS
const settingsJs = fs.readFileSync(path.join(__dirname, '../windows/js/settings.js'), 'utf8');
assert(settingsJs.includes("'waterglass'"), 'settings.js must include waterglass in THEMES list');
assert(settingsJs.includes("'s.th.waterglass'"), 'settings.js must have i18n label for waterglass');
assert(settingsJs.includes('#2563EB') && settingsJs.includes('#0284C7'), 'settings.js must include expanded rich accent colors');
console.log('✔ Test 3: settings.js includes waterglass theme option and expanded rich accent colors');

console.log('=== All Water Glass Theme Tests Passed! ===\n');
