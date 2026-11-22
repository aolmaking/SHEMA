'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== Running Corner Radius Artifact Verification Tests ===');

const mainJs = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

// Ensure roundedCorners: false in both widget and secondary window creation
const matches = [...mainJs.matchAll(/roundedCorners:\s*(false|true)/g)];
assert(matches.length >= 2, 'Should find at least 2 roundedCorners settings in main.js');
for (const match of matches) {
  assert.strictEqual(match[1], 'false', 'All BrowserWindow instances must have roundedCorners: false');
}
console.log('✔ Test 1: All BrowserWindow instances have roundedCorners: false (eliminates Windows DWM corner box clipping)');

// Check base.css
const baseCss = fs.readFileSync(path.join(__dirname, '../windows/css/base.css'), 'utf8');
const plateSection = baseCss.slice(baseCss.indexOf('.plate {'), baseCss.indexOf('.sheen {'));
assert(!plateSection.includes('box-shadow: var(--shadow)'), 'Plate must not have outer box-shadow: var(--shadow) which spills into corner regions');
assert(plateSection.includes('box-shadow: inset'), 'Plate must use inner highlights instead');
console.log('✔ Test 2: base.css .plate uses clean inset highlights and has zero outer shadow bleed into rounded corners');

console.log('=== Corner Artifact Tests Passed! ===\n');
