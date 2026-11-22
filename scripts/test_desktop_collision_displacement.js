'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('Testing Universal Desktop Collision Displacement & Zero-Overlap Guarantee...\n');

const geo = require('../src/core/geometry');
const area = { x: 0, y: 0, width: 1920, height: 1080 };

// Test 1: mini icon dropped on a large open widget
console.log('[1/7] Testing Mini Icon dropped on Open Widget...');
const openWidget = { id: 'quran', bounds: { x: 400, y: 200, width: 320, height: 240 }, isMini: false };
const miniDrop = { x: 450, y: 250, width: 72, height: 72 }; // dropped inside open widget!

const res1 = geo.displaceDesktopCollisions('photo', miniDrop, area, [openWidget], { gap: 14 });
assert(!geo.intersectsWithGap(res1.placedBounds, res1.displacedBounds.quran || openWidget.bounds, 14),
  'Mini icon and Open Widget must NOT collide');
console.log(`✅ Displaced: Placed photo at (${res1.placedBounds.x}, ${res1.placedBounds.y}), quran moved to (${res1.displacedBounds.quran.x}, ${res1.displacedBounds.quran.y})`);

// Test 2: folder dropped on an open widget
console.log('\n[2/7] Testing Folder dropped on Open Widget...');
const clockWidget = { id: 'clock', bounds: { x: 500, y: 150, width: 280, height: 200 }, isMini: false };
const folderDrop = { x: 520, y: 170, width: 144, height: 144 };

const res2 = geo.displaceDesktopCollisions('folder_1', folderDrop, area, [clockWidget], { gap: 14 });
const finalClock = res2.displacedBounds.clock || clockWidget.bounds;
assert(!geo.intersectsWithGap(res2.placedBounds, finalClock, 14),
  'Folder and Clock Widget must NOT collide');
console.log(`✅ Displaced: Placed folder at (${res2.placedBounds.x}, ${res2.placedBounds.y}), clock moved to (${finalClock.x}, ${finalClock.y})`);

// Test 3: open widget dropped on another open widget
console.log('\n[3/7] Testing Open Widget dropped on Open Widget...');
const prayerWidget = { id: 'prayer', bounds: { x: 600, y: 300, width: 340, height: 220 }, isMini: false };
const todoDrop = { x: 620, y: 320, width: 300, height: 260 };

const res3 = geo.displaceDesktopCollisions('todo', todoDrop, area, [prayerWidget], { gap: 14 });
const finalPrayer = res3.displacedBounds.prayer || prayerWidget.bounds;
assert(!geo.intersectsWithGap(res3.placedBounds, finalPrayer, 14),
  'Todo and Prayer widgets must NOT collide');
console.log(`✅ Displaced: Placed todo at (${res3.placedBounds.x}, ${res3.placedBounds.y}), prayer moved to (${finalPrayer.x}, ${finalPrayer.y})`);

// Test 4: folder dropped on another folder
console.log('\n[4/7] Testing Folder dropped on another Folder...');
const existingFolder = { id: 'folder_1', bounds: { x: 300, y: 200, width: 144, height: 144 }, isFolder: true };
const newFolderDrop = { x: 300, y: 200, width: 144, height: 144 }; // exact overlap

const res4 = geo.displaceDesktopCollisions('folder_2', newFolderDrop, area, [existingFolder], { gap: 14 });
const finalFolder1 = res4.displacedBounds.folder_1 || existingFolder.bounds;
assert(!geo.intersectsWithGap(res4.placedBounds, finalFolder1, 14),
  'Folder 2 and Folder 1 must NOT collide');
console.log(`✅ Displaced: Placed folder_2 at (${res4.placedBounds.x}, ${res4.placedBounds.y}), folder_1 moved to (${finalFolder1.x}, ${finalFolder1.y})`);

// Test 5: Cascade displacement (A pushes B, B pushes C)
console.log('\n[5/7] Testing Cascading Displacement (A -> B -> C)...');
const itemB = { id: 'b', bounds: { x: 500, y: 300, width: 144, height: 144 } };
const itemC = { id: 'c', bounds: { x: 660, y: 300, width: 144, height: 144 } }; // right next to B
const dropA = { x: 500, y: 300, width: 144, height: 144 }; // drops directly on B

const res5 = geo.displaceDesktopCollisions('a', dropA, area, [itemB, itemC], { gap: 14 });
const finalA = res5.placedBounds;
const finalB = res5.displacedBounds.b || itemB.bounds;
const finalC = res5.displacedBounds.c || itemC.bounds;

assert(!geo.intersectsWithGap(finalA, finalB, 14), 'A must not collide with B');
assert(!geo.intersectsWithGap(finalA, finalC, 14), 'A must not collide with C');
assert(!geo.intersectsWithGap(finalB, finalC, 14), 'B must not collide with C');
console.log(`✅ Cascade Success: A(${finalA.x}, ${finalA.y}), B(${finalB.x}, ${finalB.y}), C(${finalC.x}, ${finalC.y}) - ALL COLLISION FREE!`);

// Test 6: snapToDesktopGrid respecting large open widgets & folders
console.log('\n[6/7] Testing snapToDesktopGrid avoiding large widgets & folders...');
const bigObstacle = { x: 300, y: 200, width: 400, height: 300 };
const grid = { cellW: 75, cellH: 75, marginX: 15, marginY: 15, iconW: 48, iconH: 48 };
const testDropInside = { x: 450, y: 320, width: 48, height: 48 };

const snapped = geo.snapToDesktopGrid(testDropInside, area, [bigObstacle], { ...grid, avoidCollisions: true });
assert(!geo.intersectsWithGap(snapped, bigObstacle, 4),
  'snapped icon must not overlap inside big obstacle');
console.log(`✅ snapToDesktopGrid avoided big obstacle: dropped at (450, 320) -> snapped cleanly to (${snapped.x}, ${snapped.y})`);

// Test 7: Verify main.js integration
console.log('\n[7/7] Verifying main.js integration...');
const mainSrc = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');

assert(mainSrc.includes("function applyDesktopCollisionDisplacement("),
  'main.js must define applyDesktopCollisionDisplacement');
assert(mainSrc.includes("b = applyDesktopCollisionDisplacement(id, b, win);"),
  'main.js gestureEnd must call applyDesktopCollisionDisplacement');
assert(mainSrc.includes("next = applyDesktopCollisionDisplacement(id, next, win);"),
  'main.js toggleWidgetMini and setWidgetSize must call applyDesktopCollisionDisplacement');
assert(mainSrc.includes("preventOpenWidgetsOverlap"),
  'main.js must support preventOpenWidgetsOverlap setting');

const settingsHtml = fs.readFileSync(path.join(__dirname, '..', 'windows', 'settings.html'), 'utf8');
assert(settingsHtml.includes('id="preventOpenWidgetsOverlap"'),
  'settings.html must have preventOpenWidgetsOverlap switch');

const settingsJs = fs.readFileSync(path.join(__dirname, '..', 'windows', 'js', 'settings.js'), 'utf8');
assert(settingsJs.includes('preventOpenWidgetsOverlap'),
  'settings.js must handle preventOpenWidgetsOverlap');

console.log('✅ main.js, settings.html, and settings.js integration verified.\n');
console.log('🎉 ALL DESKTOP COLLISION DISPLACEMENT CHECKS PASSED (100%)!\n');

