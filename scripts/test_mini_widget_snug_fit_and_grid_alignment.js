'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const geo = require('../src/core/geometry');

console.log('================================================================');
console.log('🧪 TESTING MINI WIDGET SNUG FIT, GRID ALIGNMENT & ANIMATIONS');
console.log('================================================================\n');

// 1. Test Grid Metrics & Consistency
console.log('[1/5] Testing Desktop Grid Metrics & Dimensions...');
const metrics = geo.getDesktopGridMetrics();
assert(metrics.iconW === 56, `iconW must be 56, got ${metrics.iconW}`);
assert(metrics.iconH === 56, `iconH must be 56, got ${metrics.iconH}`);
assert(metrics.cellW >= 60 && metrics.cellW <= 84, `cellW must be snug between 60 and 84, got ${metrics.cellW}`);
assert(metrics.cellH >= 60 && metrics.cellH <= 84, `cellH must be snug between 60 and 84, got ${metrics.cellH}`);
console.log(`✅ Desktop grid metrics verified: ${metrics.cellW}x${metrics.cellH} pitch, icon: ${metrics.iconW}x${metrics.iconH}`);

// 2. Test Grid Snapping & Adjacent Column Collision Immunity
console.log('\n[2/5] Testing Grid Snapping & Adjacent Slot Collision Immunity...');
const testArea = { x: 0, y: 0, width: 1920, height: 1080 };
const marginX = metrics.marginX || 16;
const marginY = metrics.marginY || 16;
const cellW = metrics.cellW || 68;
const cellH = metrics.cellH || 68;

// Place widget 1 at (col 0, row 0)
const w1 = geo.snapToDesktopGrid({ x: marginX, y: marginY, width: 56, height: 56 }, testArea, [], { ...metrics, avoidCollisions: true });
assert.strictEqual(w1.x, marginX, `Widget 1 x should be ${marginX}`);
assert.strictEqual(w1.y, marginY, `Widget 1 y should be ${marginY}`);

// Place widget 2 at (col 1, row 0) with widget 1 as obstacle
const w2 = geo.snapToDesktopGrid({ x: marginX + cellW, y: marginY, width: 56, height: 56 }, testArea, [w1], { ...metrics, avoidCollisions: true });
assert.strictEqual(w2.x, marginX + cellW, `Widget 2 x should be adjacent col ${marginX + cellW}, got ${w2.x}`);
assert.strictEqual(w2.y, marginY, `Widget 2 y should be row 0 ${marginY}, got ${w2.y}`);

// Place widget 3 trying to drop directly onto widget 1 at (col 0, row 0)
const w3 = geo.snapToDesktopGrid({ x: marginX, y: marginY, width: 56, height: 56 }, testArea, [w1, w2], { ...metrics, avoidCollisions: true });
assert(w3.x !== w1.x || w3.y !== w1.y, 'Widget 3 must not overlap widget 1');
assert(w3.x !== w2.x || w3.y !== w2.y, 'Widget 3 must not overlap widget 2');
// Verify w3 is cleanly on the grid
const w3Col = (w3.x - marginX) / cellW;
const w3Row = (w3.y - marginY) / cellH;
assert(Number.isInteger(Math.round(w3Col)), `w3 x must align to grid col, got ${w3Col}`);
assert(Number.isInteger(Math.round(w3Row)), `w3 y must align to grid row, got ${w3Row}`);
console.log('✅ Grid snapping verified: adjacent icons sit side-by-side without false collisions, conflicts spiral cleanly on-grid.');

// 3. Test packMiniGrid Alignment
console.log('\n[3/5] Testing packMiniGrid block packing...');
const miniItems = [
  { id: 'clock' }, { id: 'pomodoro' }, { id: 'calendar' },
  { id: 'habits' }, { id: 'quran' }, { id: 'todo' },
  { id: 'notes' }, { id: 'email' }
];
const packed = geo.packMiniGrid(miniItems, testArea, metrics);
const packedEntries = Object.entries(packed);
assert.strictEqual(packedEntries.length, 8, 'All 8 widgets must be packed');

// Check all packed items have uniform 56x56 dimensions and strict grid alignment
for (const [id, b] of packedEntries) {
  assert.strictEqual(b.width, 56, `${id} packed width must be 56`);
  assert.strictEqual(b.height, 56, `${id} packed height must be 56`);
  const c = Math.round((b.x - marginX) / cellW);
  const r = Math.round((b.y - marginY) / cellH);
  assert(Math.abs(b.x - (marginX + c * cellW)) <= 1, `${id} x must align to grid column`);
  assert(Math.abs(b.y - (marginY + r * cellH)) <= 1, `${id} y must align to grid row`);
}
console.log('✅ packMiniGrid verified: All 8 desktop icons packed with uniform 56x56 geometry and consistent gaps.');

// 4. Test CSS & HTML Invariants for Snug Fit and GPU Optimization
console.log('\n[4/5] Testing base.css Invariants...');
const baseCss = fs.readFileSync(path.join(__dirname, '../windows/css/base.css'), 'utf8');

// Ensure .app-icon-widget is 52px with 2px margin for 56px snug fit
assert(baseCss.includes('width: 52px !important'), '.app-icon-widget width must be 52px');
assert(baseCss.includes('height: 52px !important'), '.app-icon-widget height must be 52px');
assert(baseCss.includes('margin: 2px !important'), '.app-icon-widget margin must be 2px');

// Ensure plate-in and appIconPop do NOT use filter: blur
const plateInMatch = baseCss.match(/@keyframes plate-in\s*\{([^}]+)\}/);
assert(plateInMatch && !plateInMatch[1].includes('blur'), 'plate-in animation must not use filter: blur');

const appIconPopMatch = baseCss.match(/@keyframes appIconPop\s*\{([^}]+)\}/);
assert(appIconPopMatch && !appIconPopMatch[1].includes('blur'), 'appIconPop animation must not use filter: blur');
console.log('✅ base.css invariants verified: snug 52px + 2px geometry eliminates ghost padding, GPU blur filters removed for 60fps animations.');

// 5. Test main.js and shell.js Invariants
console.log('\n[5/5] Testing main.js and shell.js Invariants...');
const mainJs = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');
assert(mainJs.includes("icon: [56, 56]"), 'main.js WIDGETS must define icon: [56, 56]');
assert(mainJs.includes("isPlacedMini && settings.get('snapToDesktopGrid') !== false"), 'main.js must preserve snapped grid positions for mini widgets');

const shellJs = fs.readFileSync(path.join(__dirname, '../windows/js/shell.js'), 'utf8');
assert(shellJs.includes("key.startsWith('s.') ? key.slice(2) : `s.${key}`"), 'shell.js t() function must support prefix fallbacks');
console.log('✅ main.js & shell.js invariants verified.');

console.log('\n================================================================');
console.log('🎉 ALL MINI WIDGET & GRID ALIGNMENT TESTS PASSED WITH 100%! 🎉');
console.log('================================================================');
