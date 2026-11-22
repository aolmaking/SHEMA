'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('Testing Widget Opening Placement, Zero Overlap & Sensitivity Distance (4px)...\n');

const geo = require('../src/core/geometry');
const area = { x: 0, y: 0, width: 1920, height: 1080 };

// 1. Verify default sensitivity gap in geometry.js is 4px
console.log('[1/4] Verifying default collision gap in geometry.js...');
const widgetA = { x: 400, y: 300, width: 300, height: 250 };
const newWidgetDrop = { x: 400, y: 300, width: 300, height: 250 }; // exact overlap

const resolved = geo.avoidCollisions(newWidgetDrop, area, [widgetA]);
// Should avoid with gap = 4
assert(!geo.intersectsWithGap(resolved, widgetA, 4), 'New widget must not overlap Widget A with 4px gap');
const distanceX = Math.abs(resolved.x - widgetA.x);
const distanceY = Math.abs(resolved.y - widgetA.y);
// One of the axes should be offset by dimension + 4px
assert(distanceX === 304 || distanceY === 254, `Gap must be tightly 4px, got dx=${distanceX}, dy=${distanceY}`);
console.log(`✅ Default gap verified at 4px: resolved placement (${resolved.x}, ${resolved.y})`);

// 2. Verify stationary existing widgets requirement
console.log('\n[2/4] Verifying already-open widgets remain stationary...');
const existingOpenWidgets = [
  { id: 'notes', bounds: { x: 200, y: 200, width: 320, height: 260 }, isOpen: true },
  { id: 'todo', bounds: { x: 550, y: 200, width: 280, height: 220 }, isOpen: true },
];

// New widget opening at (250, 220) - right on top of 'notes'
const openingWidgetBounds = { x: 250, y: 220, width: 300, height: 240 };
const obstacles = existingOpenWidgets.map(e => e.bounds);
const finalOpeningBounds = geo.avoidCollisions(openingWidgetBounds, area, obstacles, 4);

assert(!geo.intersectsWithGap(finalOpeningBounds, existingOpenWidgets[0].bounds, 4), 'Must not collide with notes');
assert(!geo.intersectsWithGap(finalOpeningBounds, existingOpenWidgets[1].bounds, 4), 'Must not collide with todo');

// Existing widgets did not move at all
assert.strictEqual(existingOpenWidgets[0].bounds.x, 200);
assert.strictEqual(existingOpenWidgets[0].bounds.y, 200);
assert.strictEqual(existingOpenWidgets[1].bounds.x, 550);
assert.strictEqual(existingOpenWidgets[1].bounds.y, 200);
console.log(`✅ Existing widgets stayed 100% stationary; new widget shifted from (250, 220) to (${finalOpeningBounds.x}, ${finalOpeningBounds.y})`);

// 3. Verify main.js applyDesktopCollisionDisplacement protects open widgets & sets gap 4
console.log('\n[3/4] Verifying main.js applyDesktopCollisionDisplacement wiring...');
const mainSrc = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');

assert(mainSrc.includes("preventOpenWidgetsOverlap: true"), 'preventOpenWidgetsOverlap must be true by default');
assert(mainSrc.includes("geo.avoidCollisions(targetBounds, area, obstacles, 4)"),
  'applyDesktopCollisionDisplacement must use gap 4 and avoidCollisions to shift opening element');
assert(mainSrc.includes("bounds = geo.avoidCollisions(bounds, area, others, 4)"),
  'createWidget must use gap 4 to prevent overlapping existing widgets');
console.log('✅ main.js wiring and default settings verified.');

// 4. Verify no collision when placed in open area
console.log('\n[4/4] Verifying widget opens at exact saved location when area is free...');
const freeSpot = { x: 900, y: 500, width: 280, height: 200 };
const freeResolved = geo.avoidCollisions(freeSpot, area, obstacles, 4);
assert.deepStrictEqual(freeResolved, freeSpot, 'Widget must open at its exact saved coordinates when free');
console.log('✅ Clean opening at exact target coordinates confirmed.');

console.log('\n🎉 ALL WIDGET OPENING & SENSITIVITY TESTS PASSED (100%)!');
