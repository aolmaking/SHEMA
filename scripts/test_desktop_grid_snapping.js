'use strict';
const assert = require('assert');
const geo = require('../src/core/geometry');

console.log('================================================================');
console.log('TESTING DESKTOP GRID SNAPPING & MINI WIDGET AUTO-ALIGNMENT');
console.log('================================================================');

// 1. Desktop Grid Metrics
console.log('[1/4] Testing Desktop Grid Metrics...');
const metrics = geo.getDesktopGridMetrics();
assert(metrics && typeof metrics.cellW === 'number', 'metrics must return cellW');
assert(metrics.cellW >= 60 && metrics.cellW <= 150, `cellW should be reasonable (${metrics.cellW})`);
assert(metrics.cellH >= 60 && metrics.cellH <= 150, `cellH should be reasonable (${metrics.cellH})`);
assert.strictEqual(metrics.iconW, 48, 'iconW must be 48');
assert.strictEqual(metrics.iconH, 48, 'iconH must be 48');
console.log(`✅ Grid metrics verified: ${metrics.cellW}x${metrics.cellH}px (48x48px icons)`);

// 2. Snap to Desktop Grid
console.log('[2/4] Testing Snap to Desktop Grid...');
const area = { x: 0, y: 0, width: 1280, height: 720 };
const cellW = 75;
const cellH = 75;
const marginX = 15;
const marginY = 15;

// Test snapping near slot (col 11, row 0) => x: 840, y: 15
const snapped1 = geo.snapToDesktopGrid({ x: 847, y: 19, width: 48, height: 48 }, area, [], { cellW, cellH, marginX, marginY });
assert.strictEqual(snapped1.x, 840, `Expected x: 840, got ${snapped1.x}`);
assert.strictEqual(snapped1.y, 15, `Expected y: 15, got ${snapped1.y}`);
assert.strictEqual(snapped1.width, 48, 'width must remain 48');
assert.strictEqual(snapped1.height, 48, 'height must remain 48');

// Test snapping near slot (col 12, row 1) => x: 915, y: 90
const snapped2 = geo.snapToDesktopGrid({ x: 910, y: 94, width: 48, height: 48 }, area, [], { cellW, cellH, marginX, marginY });
assert.strictEqual(snapped2.x, 915, `Expected x: 915, got ${snapped2.x}`);
assert.strictEqual(snapped2.y, 90, `Expected y: 90, got ${snapped2.y}`);
assert.strictEqual(snapped2.width, 48, 'width must be 48');
assert.strictEqual(snapped2.height, 48, 'height must be 48');

// Test collision avoidance
const others = [{ x: 840, y: 15, width: 48, height: 48 }];
const avoided = geo.snapToDesktopGrid({ x: 842, y: 14, width: 48, height: 48 }, area, others, { cellW, cellH, marginX, marginY, avoidCollisions: true });
assert(avoided.x !== 840 || avoided.y !== 15, 'Collision resolution must relocate away from occupied slot');
assert(Math.abs(avoided.x - 840) % cellW === 0 || Math.abs(avoided.y - 15) % cellH === 0, 'Relocated slot must still align to grid');
console.log('✅ Snap to desktop grid & collision resolution verified.');

// 3. Pack Mini Grid
console.log('[3/4] Testing packMiniGrid Auto-Arrangement...');
const rawItems = [
  { id: 'clock', x: 867, y: 16 },
  { id: 'calendar', x: 930, y: 26 },
  { id: 'habits', x: 1058, y: 18 },
  { id: 'notes', x: 867, y: 88 },
  { id: 'pomodoro', x: 1004, y: 94 },
];

const packed = geo.packMiniGrid(rawItems, area, { cellW, cellH, marginX, marginY });
assert.strictEqual(Object.keys(packed).length, 5, 'All 5 items must be packed');

// Row 0 items must share the EXACT same Y
const r0 = [packed.clock, packed.calendar, packed.habits];
assert(r0[0].y === r0[1].y && r0[1].y === r0[2].y, 'All row 0 items must have identical Y');

// Row 1 items must share the EXACT same Y
const r1 = [packed.notes, packed.pomodoro];
assert(r1[0].y === r1[1].y, 'All row 1 items must have identical Y');

// Spacing between row 0 and row 1 must be exactly cellH
assert.strictEqual(r1[0].y - r0[0].y, cellH, `Row spacing must be exactly ${cellH}px`);

// Notes must align directly under Clock (identical X)
assert.strictEqual(packed.notes.x, packed.clock.x, 'Notes must be directly below Clock');
// Pomodoro must align directly under Calendar (identical X)
assert.strictEqual(packed.pomodoro.x, packed.calendar.x, 'Pomodoro must be directly below Calendar');

// Distance between columns must be exactly cellW
assert.strictEqual(packed.calendar.x - packed.clock.x, cellW, `Column spacing must be exactly ${cellW}px`);
assert.strictEqual(packed.habits.x - packed.calendar.x, cellW, `Column spacing must be exactly ${cellW}px`);
console.log('✅ packMiniGrid produces mathematically perfect grid rows and columns.');

// 4. Main & Preload contracts
console.log('[4/4] Testing Main & Preload Contracts...');
const fs = require('fs');
const path = require('path');
const mainJs = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');
const preloadJs = fs.readFileSync(path.join(__dirname, '../preload.js'), 'utf8');

assert(mainJs.includes('arrangeMiniWidgets'), 'main.js must define arrangeMiniWidgets');
assert(mainJs.includes("ipcMain.handle('widgets:arrangeMini'"), 'main.js must register widgets:arrangeMini handler');
assert(mainJs.includes("geo.snapToDesktopGrid"), 'main.js must call geo.snapToDesktopGrid');
assert(preloadJs.includes("arrangeMini: () => ipcRenderer.invoke('widgets:arrangeMini')"), 'preload.js must expose arrangeMini');
console.log('✅ Main and Preload contracts verified.');

console.log('\n================================================================');
console.log('🎉🎉 ALL DESKTOP GRID SNAPPING TESTS PASSED 100%! 🎉🎉');
console.log('================================================================');
