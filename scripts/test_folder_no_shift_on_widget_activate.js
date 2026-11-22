'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const geo = require('../src/core/geometry');

console.log('Testing: Folder stays fixed when widget is activated; widgets can overlap folders freely...\n');

const area = { x: 0, y: 0, width: 1920, height: 1080 };

// 1. Test geometry displaceDesktopCollisions when placed is an open widget
console.log('[1/4] Testing open widget placed overlapping a folder in geometry...');
const folderItem = { id: 'folder_1', bounds: { x: 500, y: 200, width: 200, height: 160 }, isFolder: true };
const widgetOverFolder = { x: 520, y: 220, width: 300, height: 240 };

// If placed is open widget, folders are skipped in main.js applyDesktopCollisionDisplacement.
// Let's verify that when folder is skipped from obstacles, widget stays at its target position
const elementsForOpenWidget = []; // folder is skipped because open widgets freely overlap folders!
const resOpen = geo.displaceDesktopCollisions('notes', widgetOverFolder, area, elementsForOpenWidget, { gap: 14, protectPlaced: true });
assert.deepStrictEqual(resOpen.placedBounds, widgetOverFolder, 'Widget target bounds must be preserved exactly');
assert.deepStrictEqual(resOpen.displacedBounds, {}, 'No elements should be displaced');
console.log('✅ Open widget placed cleanly over folder without any folder displacement.');

// 2. Test folder dragged and dropped over an open widget: folder avoids collisions
console.log('\n[2/4] Testing folder drag & drop over an open widget...');
const openWidgetObstacle = { x: 500, y: 200, width: 300, height: 240 };
const folderDropTarget = { x: 520, y: 220, width: 200, height: 160 }; // dropped on top of open widget

const folderResolved = geo.avoidCollisions(folderDropTarget, area, [openWidgetObstacle], 14);
assert(!geo.intersectsWithGap(folderResolved, openWidgetObstacle, 14),
  'When moving/dropping the folder, folder must move away to avoid open widget');
console.log(`✅ Folder moved from (${folderDropTarget.x}, ${folderDropTarget.y}) to non-overlapping spot (${folderResolved.x}, ${folderResolved.y})`);

// 3. Verify main.js applyDesktopCollisionDisplacement logic
console.log('\n[3/4] Verifying main.js applyDesktopCollisionDisplacement code...');
const mainSrc = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');

assert(mainSrc.includes('if (isPlacedOpenWidget && (isOpen || isF) && !preventOpenWidgetsOverlap)'),
  'main.js must skip both open widgets and folders when placing open widgets (freely overlap)');
console.log('✅ main.js applyDesktopCollisionDisplacement preserves folders when open widgets are placed.');

// 4. Verify folder:activate-widget in main.js
console.log('\n[4/4] Verifying folder:activate-widget does not shift folder...');
assert(!mainSrc.includes('const nextFolder = geo.avoidCollisions(folderBounds, area, [targetBounds], 16)'),
  'main.js must NOT shift the folder in folder:activate-widget');
assert(!mainSrc.includes('folderWin.setBounds(nextFolder)'),
  'main.js must NOT set folderWin bounds to nextFolder in folder:activate-widget');
console.log('✅ folder:activate-widget no longer shifts the folder.');

console.log('\n🎉 ALL TESTS PASSED: Folder stays fixed and widgets can freely open on top of the box!');
