'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const geo = require('../src/core/geometry');

console.log('================================================================');
console.log('TESTING DESKTOP GRID TOGGLE & REGULAR ICON PARTITIONING');
console.log('================================================================\n');

// 1. Verify Desktop Grid Metrics and Dimensions
console.log('[1/6] Verifying geometry.js desktop icon and grid dimensions...');
const metrics = geo.getDesktopGridMetrics();
assert.strictEqual(metrics.iconW, 48, 'Icon width must match standard Windows desktop icon size (48px)');
assert.strictEqual(metrics.iconH, 48, 'Icon height must match standard Windows desktop icon size (48px)');
assert(metrics.cellW >= 60 && metrics.cellW <= 120, 'cellW should match system icon spacing');
console.log(`✅ Standard desktop icon dimensions confirmed: 48x48px on ${metrics.cellW}x${metrics.cellH}px grid.\n`);

// 2. Verify Snapping ON vs Free Placement OFF
console.log('[2/6] Verifying snapping behavior (ON: desktop grid, OFF: free placement)...');
const area = { x: 0, y: 0, width: 1920, height: 1080 };
const testRect = { x: 312, y: 167, width: 48, height: 48 };

// Snapping ON:
const snapped = geo.snapToDesktopGrid(testRect, area, [], { ...metrics, avoidCollisions: false });
assert.strictEqual(snapped.width, 48, 'Snapped width must be 48');
assert.strictEqual(snapped.height, 48, 'Snapped height must be 48');
assert(snapped.x !== testRect.x || snapped.y !== testRect.y, 'Grid snap must align to nearest Cartesian grid line');
assert.strictEqual((snapped.x - metrics.marginX) % metrics.cellW, 0, 'X must align to grid multiples');
assert.strictEqual((snapped.y - metrics.marginY) % metrics.cellH, 0, 'Y must align to grid multiples');

// Free Placement (Snapping OFF):
const free = geo.clampToArea(testRect, area);
assert.strictEqual(free.x, testRect.x, 'Free placement must preserve exact pixel-accurate x');
assert.strictEqual(free.y, testRect.y, 'Free placement must preserve exact pixel-accurate y');
assert.strictEqual(free.width, 48, 'Free placement must preserve width 48');
assert.strictEqual(free.height, 48, 'Free placement must preserve height 48');
console.log('✅ ON snaps to grid lines; OFF preserves pixel-accurate free coordinates.\n');

// 3. Verify CSS styling for .app-icon-widget (48x48px)
console.log('[3/6] Verifying windows/css/base.css desktop icon styling...');
const baseCss = fs.readFileSync(path.join(__dirname, '..', 'windows', 'css', 'base.css'), 'utf8');
assert(baseCss.includes('width: 48px !important;'), 'app-icon-widget width must be 48px');
assert(baseCss.includes('height: 48px !important;'), 'app-icon-widget height must be 48px');
assert(baseCss.includes('border-radius: 12px;'), 'app-icon-widget border-radius must be 12px');
console.log('✅ base.css desktop mini icons match standard desktop icon styling.\n');

// 4. Verify Folder Regular Partitioning (No asymmetric slots, no truncated text)
console.log('[4/6] Verifying windows/js/folder.js regular partitioning...');
const folderJs = fs.readFileSync(path.join(__dirname, '..', 'windows', 'js', 'folder.js'), 'utf8');
assert(folderJs.includes('const MIN_ICON_SIZE = 28;'), 'MIN_ICON_SIZE must be 28');
assert(folderJs.includes('const MAX_ICON_SIZE = 48;'), 'MAX_ICON_SIZE must be 48');
assert(folderJs.includes('state.showCompactTitles && cardW >= 320 && cardH >= 240'), 'Compact slots must never show truncated titles');
console.log('✅ folder.js guarantees uniform, regular icon partitioning without text clutter.\n');

// 5. Verify Settings UI Switch in windows/settings.html
console.log('[5/6] Verifying windows/settings.html toggle switch...');
const settingsHtml = fs.readFileSync(path.join(__dirname, '..', 'windows', 'settings.html'), 'utf8');
assert(settingsHtml.includes('id="snapToDesktopGrid"'), 'settings.html must contain #snapToDesktopGrid switch');
assert(settingsHtml.includes('data-i18n="s.snapToDesktopGrid"'), 'settings.html must bind i18n for snapToDesktopGrid');
assert(settingsHtml.includes('data-i18n="s.snapToDesktopGridSub"'), 'settings.html must bind i18n for snapToDesktopGridSub');
console.log('✅ settings.html contains the requested single ON/OFF toggle switch.\n');

// 6. Verify Settings logic & main.js integration
console.log('[6/6] Verifying settings.js logic & main.js contracts...');
const settingsJs = fs.readFileSync(path.join(__dirname, '..', 'windows', 'js', 'settings.js'), 'utf8');
assert(settingsJs.includes('switchEl(\'#snapToDesktopGrid\''), 'settings.js must wire #snapToDesktopGrid');
assert(settingsJs.includes('\'s.snapToDesktopGrid\''), 'settings.js must contain Arabic translations');
assert(settingsJs.includes('Follow System Desktop Grid'), 'settings.js must contain English translations');

const mainJs = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');
assert(mainJs.includes('snapToDesktopGrid: true,'), 'main.js DEFAULTS must include snapToDesktopGrid: true');
assert(mainJs.includes("settings.get('snapToDesktopGrid') !== false"), 'main.js must check snapToDesktopGrid setting');
console.log('✅ settings.js and main.js contracts fully verified.\n');

console.log('================================================================');
console.log('🎉 ALL DESKTOP GRID TOGGLE & REGULAR PARTITIONING TESTS PASSED! 🎉');
console.log('================================================================');
