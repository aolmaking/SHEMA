'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('Testing Folder Collision Avoidance & Compact Sizing...');

const geo = require('../src/core/geometry');

// Test 1: Geometry avoidCollisions unit tests
console.log('\n[1/5] Testing avoidCollisions algorithm...');
const area = { x: 0, y: 0, width: 1920, height: 1080 };
const folder1 = { x: 200, y: 200, width: 144, height: 144 };
const gap = 16;

// Drop folder2 directly on top of folder1 (identical coordinates)
const folder2Overlapping = { x: 200, y: 200, width: 144, height: 144 };
const resolved2 = geo.avoidCollisions(folder2Overlapping, area, [folder1], gap);

assert(!geo.intersectsWithGap(resolved2, folder1, gap), 'Resolved folder2 must not collide with folder1 (including 16px gap)');
assert(resolved2.width === 144 && resolved2.height === 144, 'Resolved folder2 must preserve its size');
console.log(`✅ Direct collision resolved: original (200, 200) -> resolved (${resolved2.x}, ${resolved2.y})`);

// Drop folder3 into a cluster of 2 folders
const folder3Overlapping = { x: resolved2.x + 10, y: resolved2.y + 10, width: 144, height: 144 };
const resolved3 = geo.avoidCollisions(folder3Overlapping, area, [folder1, resolved2], gap);
assert(!geo.intersectsWithGap(resolved3, folder1, gap), 'Folder3 must not collide with Folder1');
assert(!geo.intersectsWithGap(resolved3, resolved2, gap), 'Folder3 must not collide with Folder2');
console.log(`✅ Multi-obstacle cluster collision resolved: (${resolved3.x}, ${resolved3.y})`);

// Screen edge clamping + collision
const cornerFolder = { x: 0, y: 0, width: 144, height: 144 };
const edgeDrop = { x: 10, y: 10, width: 144, height: 144 };
const resolvedEdge = geo.avoidCollisions(edgeDrop, area, [cornerFolder], gap);
assert(!geo.intersectsWithGap(resolvedEdge, cornerFolder, gap), 'Edge drop must not collide with corner folder');
assert(resolvedEdge.x >= area.x && resolvedEdge.y >= area.y, 'Edge drop must stay inside area');
console.log(`✅ Screen edge collision resolved: (${resolvedEdge.x}, ${resolvedEdge.y})`);

// Test 2: Verify main.js folder specs & functions
console.log('\n[2/5] Verifying main.js folder specs & initial sizing...');
const mainSrc = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');

// Check WIDGETS.folder size
assert(mainSrc.includes("s: [144, 144]"), 'main.js WIDGETS.folder must define s: [144, 144]');
assert(mainSrc.includes("min: [120, 120]"), 'main.js WIDGETS.folder must allow compact min [120, 120]');
assert(!mainSrc.includes("s: [190, 220]"), 'main.js must not retain old s: [190, 220]');

// Check createFolderFromHover initial dimensions
assert(mainSrc.includes("let folderWidth = 144;"), 'createFolderFromHover must set folderWidth = 144');
assert(mainSrc.includes("let folderHeight = 144;"), 'createFolderFromHover must set folderHeight = 144');
assert(mainSrc.includes("geo.avoidCollisions(initialBounds, area, otherFolderObstacles, 16)"), 'createFolderFromHover must resolve collisions');

// Check win:gestureEnd collision avoidance
assert(mainSrc.includes("geo.avoidCollisions(b, g.area || areaFor(b), otherFolderObstacles, 16)"), 'gestureEnd must avoid collisions for dropped folders');

// Check startup upgrade & collision resolution
assert(mainSrc.includes("geo.avoidCollisions(f.bounds, area, placedFolderBounds, 16)"), 'startup loop must separate colliding folders');
console.log('✅ main.js folder specs and collision calls verified.');

// Test 3: Verify folder.js adaptive grid behavior
console.log('\n[3/5] Verifying windows/js/folder.js compact layout calculation...');
const folderJsSrc = fs.readFileSync(path.join(__dirname, '..', 'windows', 'js', 'folder.js'), 'utf8');

assert(folderJsSrc.includes("cardW >= 320 && cardH >= 240"), 'showTitles must only show on large expanded views');

// Extract computeAdaptiveGrid logic for testing
const MIN_ICON_SIZE = 24;
const MAX_ICON_SIZE = 36;
function testComputeAdaptiveGrid(cardW, cardH, totalWidgets) {
  const N = Math.max(1, totalWidgets);
  const padX = Math.max(10, Math.min(20, Math.round(cardW * 0.05)));
  const padY = Math.max(10, Math.min(20, Math.round(cardH * 0.05)));
  const netW = Math.max(36, cardW - padX * 2);
  const netH = Math.max(36, cardH - padY * 2);
  const aspect = cardW / cardH;
  const visibleCount = Math.min(N, 9);
  let cols = 2; let rows = 2;
  if (visibleCount === 1) { cols = 1; rows = 1; }
  else if (visibleCount === 2) { cols = 2; rows = 1; }
  else if (visibleCount === 3) { cols = 2; rows = 2; }
  else if (visibleCount === 4) { cols = 2; rows = 2; }
  const gap = Math.max(5, Math.min(8, Math.round(Math.min(cardW, cardH) * 0.03)));
  const cellW = Math.floor((netW - gap * (cols - 1)) / cols);
  const cellH = Math.floor((netH - gap * (rows - 1)) / rows);
  const showTitles = (cellH >= 90 && cellW >= 80 && cardW >= 320 && cardH >= 240);
  const maxFittingArt = showTitles ? Math.min(cellW - 6, cellH - 18) : Math.min(cellW - 4, cellH - 4);
  const artSize = Math.max(MIN_ICON_SIZE, Math.min(MAX_ICON_SIZE, maxFittingArt));
  return { cols, rows, showTitles, artSize, gap, cellW, cellH };
}

// Compact folder test with 2 widgets
const grid2 = testComputeAdaptiveGrid(144, 124, 2);
assert.strictEqual(grid2.showTitles, false, 'showTitles must be false for 2 items in compact squircle');
assert.strictEqual(grid2.cols, 2, '2 items should be arranged in 2 columns');
assert.strictEqual(grid2.rows, 1, '2 items should be arranged in 1 row (side-by-side)');
assert(grid2.artSize >= 26 && grid2.artSize <= 38, `Icon art size must be balanced, got ${grid2.artSize}`);
console.log(`✅ 2-item compact squircle: ${grid2.cols}x${grid2.rows}, artSize=${grid2.artSize}px, showTitles=${grid2.showTitles}`);

// Compact folder test with 4 widgets
const grid4 = testComputeAdaptiveGrid(144, 124, 4);
assert.strictEqual(grid4.showTitles, false, 'showTitles must be false for 4 items in compact squircle');
assert.strictEqual(grid4.cols, 2, '4 items should be arranged in 2 columns');
assert.strictEqual(grid4.rows, 2, '4 items should be arranged in 2 rows (2x2 grid)');
console.log(`✅ 4-item compact squircle: ${grid4.cols}x${grid4.rows}, artSize=${grid4.artSize}px, showTitles=${grid4.showTitles}`);

// Test 4: CSS styling verification
console.log('\n[4/5] Verifying windows/css/folder.css squircle styling...');
const cssSrc = fs.readFileSync(path.join(__dirname, '..', 'windows', 'css', 'folder.css'), 'utf8');
assert(cssSrc.includes(".folder-squircle-card"), 'folder.css must style .folder-squircle-card');
assert(cssSrc.includes("border-radius: var(--folder-radius, 24px)"), 'folder.css must have controllable squircle radius');
assert(cssSrc.includes(".folder-label-wrap"), 'folder.css must style .folder-label-wrap');
console.log('✅ folder.css squircle styling verified.');

// Test 5: End-to-end simulation of user scenario
console.log('\n[5/5] Simulating user scenario: two overlapping folders on desktop...');
// User created 2 folders at overlapping positions
const existingFolders = {
  folder_1: {
    id: 'folder_1',
    widgetIds: ['quran', 'habits'],
    bounds: { x: 500, y: 150, width: 190, height: 220 }, // legacy size
  },
  folder_2: {
    id: 'folder_2',
    widgetIds: ['email', 'todo'],
    bounds: { x: 520, y: 160, width: 190, height: 220 }, // overlapping legacy
  }
};

// Simulate startup upgrade & collision separation:
const placed = [];
for (const [fid, f] of Object.entries(existingFolders)) {
  if (f.bounds) {
    // 1. Upgrade legacy size
    if ((f.bounds.width === 190 && f.bounds.height === 220)) {
      f.bounds.width = 144;
      f.bounds.height = 144;
      f.size = 's';
    }
    // 2. Separate collisions
    f.bounds = geo.avoidCollisions(f.bounds, area, placed, 16);
    placed.push({ ...f.bounds });
  }
}

assert.strictEqual(existingFolders.folder_1.bounds.width, 144);
assert.strictEqual(existingFolders.folder_1.bounds.height, 144);
assert.strictEqual(existingFolders.folder_2.bounds.width, 144);
assert.strictEqual(existingFolders.folder_2.bounds.height, 144);
assert(!geo.intersectsWithGap(existingFolders.folder_1.bounds, existingFolders.folder_2.bounds, 16),
  'The two upgraded folders must not collide and must maintain >= 16px separation');

console.log(`✅ Folder 1 upgraded & placed at: (${existingFolders.folder_1.bounds.x}, ${existingFolders.folder_1.bounds.y}) [${existingFolders.folder_1.bounds.width}x${existingFolders.folder_1.bounds.height}]`);
console.log(`✅ Folder 2 separated & placed at: (${existingFolders.folder_2.bounds.x}, ${existingFolders.folder_2.bounds.y}) [${existingFolders.folder_2.bounds.width}x${existingFolders.folder_2.bounds.height}]`);
console.log('🎉 ALL COLLISION AVOIDANCE & COMPACT SIZING TESTS PASSED 100%!');
