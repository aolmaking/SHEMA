'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const geo = require('../src/core/geometry');

console.log('================================================================');
console.log('🛡️ TESTING SMART FOLDER MIN/MAX CONSTRAINT SYSTEM ACROSS MODES');
console.log('================================================================\n');

// [1/5] Testing getFolderSmartLimits pure export and mathematical invariants
console.log('[1/5] Testing getFolderSmartLimits across item counts & modes...');
const testCounts = [1, 2, 3, 4, 5, 6, 7, 8, 9];

for (const n of testCounts) {
  // 1. Horizontal dock
  const dockLimits = geo.getFolderSmartLimits(n, 450, 70);
  assert.strictEqual(dockLimits.mode, 'dock-h', `N=${n} should identify as dock-h`);
  assert(dockLimits.min[0] <= dockLimits.max[0], `N=${n} dock minWidth (${dockLimits.min[0]}) must be <= maxWidth (${dockLimits.max[0]})`);
  assert(dockLimits.min[1] <= dockLimits.max[1], `N=${n} dock minHeight must be <= maxHeight`);
  assert.strictEqual(dockLimits.min[1], 58, `N=${n} dock minHeight must be 58px`);
  assert.strictEqual(dockLimits.max[1], 82, `N=${n} dock maxHeight must be 82px`);

  // Max width in dock mode for 6 items must be bounded (cannot stretch to 1000px wasteland)
  if (n === 6) {
    assert(dockLimits.max[0] <= 450, `N=6 dock maxWidth (${dockLimits.max[0]}) must be strictly bounded under 450px`);
    assert(dockLimits.min[0] >= 250, `N=6 dock minWidth (${dockLimits.min[0]}) must be at least 250px`);
  }

  // 2. Vertical pillar
  const pillarLimits = geo.getFolderSmartLimits(n, 70, 450);
  assert.strictEqual(pillarLimits.mode, 'dock-v', `N=${n} should identify as dock-v`);
  assert(pillarLimits.min[0] <= pillarLimits.max[0], `N=${n} pillar minWidth must be <= maxWidth`);
  assert(pillarLimits.min[1] <= pillarLimits.max[1], `N=${n} pillar minHeight must be <= maxHeight`);
  assert.strictEqual(pillarLimits.min[0], 58, `N=${n} pillar minWidth must be 58px`);
  assert.strictEqual(pillarLimits.max[0], 82, `N=${n} pillar maxWidth must be 82px`);

  // 3. Balanced Square / Grid
  const gridLimits = geo.getFolderSmartLimits(n, 160, 160);
  assert.strictEqual(gridLimits.mode, 'grid', `N=${n} should identify as grid`);
  assert(gridLimits.min[0] <= gridLimits.max[0], `N=${n} grid minWidth must be <= maxWidth`);
  assert(gridLimits.min[1] <= gridLimits.max[1], `N=${n} grid minHeight must be <= maxHeight`);
}
console.log('✅ All pure mathematical invariants and mode bounds verified.');

// [2/5] Testing Expanded Mode Limits
console.log('\n[2/5] Testing Expanded Modal Mode smart limits...');
const expLimits = geo.getFolderSmartLimits(6, 400, 400, true);
assert.strictEqual(expLimits.mode, 'expanded');
assert.deepStrictEqual(expLimits.min, [320, 320]);
assert.deepStrictEqual(expLimits.max, [580, 520]);
console.log('✅ Expanded modal mode limits verified.');

// [3/5] Testing Live Resize Clamping Simulation
console.log('\n[3/5] Simulating live user drag resizing from right edge...');
const area = { x: 0, y: 0, width: 1920, height: 1080 };
const startBounds = { x: 400, y: 50, width: 340, height: 72 }; // Active dock

// Simulate user attempting to drag width to 1200px (extreme over-expansion like screenshot)
const hugeDx = 860; // 340 + 860 = 1200
const limits1 = geo.getFolderSmartLimits(6, startBounds.width + hugeDx, startBounds.height, false, 'dock-h');
const clampedExpanded = geo.resizeFrom(startBounds, 'se', hugeDx, 0, area, limits1.min, limits1.max);

assert(clampedExpanded.width <= limits1.max[0], `Width (${clampedExpanded.width}) must be clamped by maxWidth (${limits1.max[0]})`);
assert(clampedExpanded.width <= 420, `Width (${clampedExpanded.width}) must NEVER exceed 420px for 6 items in dock mode`);
console.log(`✅ Extreme enlargement clamped: attempted 1200px -> successfully constrained to ${clampedExpanded.width}px!`);

// Simulate user attempting to shrink dock width to 50px (crushing icons)
const shrinkDx = -300; // 340 - 300 = 40
const limits2 = geo.getFolderSmartLimits(6, startBounds.width + shrinkDx, startBounds.height, false, 'dock-h');
const clampedShrunk = geo.resizeFrom(startBounds, 'se', shrinkDx, 0, area, limits2.min, limits2.max);

assert(clampedShrunk.width >= limits2.min[0], `Width (${clampedShrunk.width}) must be clamped by minWidth (${limits2.min[0]})`);
assert(clampedShrunk.width >= 260, `Width (${clampedShrunk.width}) must be at least 260px to preserve icon integrity`);
console.log(`✅ Extreme shrink clamped: attempted 40px -> successfully constrained to ${clampedShrunk.width}px!`);

// [4/5] Verifying main.js integration
console.log('\n[4/5] Verifying main.js resizeStart, resizeMove, and gestureEnd wireup...');
const mainContent = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');
assert(mainContent.includes('geo.getFolderSmartLimits'), 'main.js must call geo.getFolderSmartLimits');
assert(mainContent.includes('dynamicLimits = geo.getFolderSmartLimits'), 'main.js must calculate dynamicLimits in resizeMove');
assert(mainContent.includes('maxWidth: 640'), 'main.js must set maxWidth on folder BrowserWindow');
console.log('✅ main.js integration confirmed.');

// [5/5] Verifying folder.js and folder.css dock resilience
console.log('\n[5/5] Verifying folder.js and folder.css dock resilience...');
const folderJs = fs.readFileSync(path.join(__dirname, '..', 'windows', 'js', 'folder.js'), 'utf8');
assert(folderJs.includes('const isWideDock = (cardW / Math.max(1, cardH) >= 1.35)'), 'folder.js must detect isWideDock');
assert(!folderJs.includes('cardH < 50'), 'folder.js must NOT have buggy cardH < 50 threshold');

const folderCss = fs.readFileSync(path.join(__dirname, '..', 'windows', 'css', 'folder.css'), 'utf8');
assert(folderCss.includes('grid-template-rows: 1fr !important'), 'folder.css must enforce single row in is-dock-h');
assert(folderCss.includes('grid-template-columns: 1fr !important'), 'folder.css must enforce single column in is-dock-v');
console.log('✅ folder.js and folder.css rules verified.');

console.log('\n================================================================');
console.log('🎉 ALL SMART FOLDER MIN/MAX CONSTRAINT TESTS PASSED (100%)!');
console.log('================================================================\n');
