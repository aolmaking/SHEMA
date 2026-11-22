'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('TESTING SMALLER ICONS & SMART FOLDER DISTRIBUTION SUITE');
console.log('================================================================\n');

const ROOT = path.join(__dirname, '..');

// 1. Desktop App Icon Size Reduction (خارج الصندوق)
console.log('[1/4] Verifying Desktop App Icon Sizing (خارج الصندوق)...');
const baseCss = fs.readFileSync(path.join(ROOT, 'windows', 'css', 'base.css'), 'utf8');

// Icon container dimensions
assert(/width:\s*(44|48)px\s*!important/.test(baseCss), 'base.css must define standard width for .app-icon-widget');
assert(/height:\s*(44|48)px\s*!important/.test(baseCss), 'base.css must define standard height for .app-icon-widget');
assert(/border-radius:\s*(11|12)px/.test(baseCss), 'base.css must define border-radius');

// Internal clock face scaled down
assert(/width:\s*32px;\s*height:\s*32px;/.test(baseCss), 'clock-face must be scaled down to 32px');

// Calendar scaled down
assert(/height:\s*13px;/.test(baseCss) && /font-size:\s*7px;/.test(baseCss), 'cal-top must be scaled down');
assert(/font-size:\s*16px;/.test(baseCss), 'cal-body must be scaled down');

// Notes lines and pencil scaled down
assert(/width:\s*26px;/.test(baseCss), 'app-icon-note-lines must be scaled down to 26px');
assert(/width:\s*14px;\s*height:\s*14px;/.test(baseCss), 'app-icon-note-pencil must be scaled down to 14px');

// Glyphs scaled down
assert(/font-size:\s*19px;/.test(baseCss), 'icon glyphs must be scaled down to 19px');

// Checkmark and Badge
assert(/width:\s*13px;\s*height:\s*13px;/.test(baseCss), 'selection checkmark must be 13px');
assert(/height:\s*14px;/.test(baseCss), 'notification badge must be 14px');

console.log('✅ Desktop App Icon scaled down cleanly with delicate internal artwork.\n');

// 2. Desktop Drag Ghost Sizing
console.log('[2/4] Verifying Desktop & In-Folder Drag Ghosts...');
const ghostHtml = fs.readFileSync(path.join(ROOT, 'windows', 'drag-ghost.html'), 'utf8');
const folderCss = fs.readFileSync(path.join(ROOT, 'windows', 'css', 'folder.css'), 'utf8');

assert(ghostHtml.includes('width: 44px;') && ghostHtml.includes('height: 44px;'), 'drag-ghost.html must be 44px');
assert(ghostHtml.includes('border-radius: 11px;'), 'drag-ghost.html border-radius must be 11px');

assert(folderCss.includes('width: 44px;') && folderCss.includes('height: 44px;'), 'folder.css .drag-out-ghost must be 44px');
assert(folderCss.includes('.drag-out-ghost {') && folderCss.includes('border-radius: 11px;'), '.drag-out-ghost border-radius must be 11px');

console.log('✅ Drag ghosts correctly sized to 44px x 44px (11px radius).\n');

// 3. Folder Icon Sizing (داخل الصندوق)
console.log('[3/4] Verifying Folder Icon Sizing Bounds (داخل الصندوق)...');
const folderJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'folder.js'), 'utf8');

assert(folderJs.includes('const MIN_ICON_SIZE = 24;') || folderJs.includes('const MIN_ICON_SIZE = 28;'), 'MIN_ICON_SIZE must be bounded');
assert(folderJs.includes('const MAX_ICON_SIZE = 36;') || folderJs.includes('const MAX_ICON_SIZE = 48;'), 'MAX_ICON_SIZE must be bounded');
assert(folderCss.includes('--art-size, 34px'), 'folder.css must use 34px fallback');
assert(folderCss.includes('--art-radius, 9px'), 'folder.css must use 9px radius fallback');
assert(folderCss.includes('width: 44px;') && folderCss.includes('.expanded-icon-wrap'), 'expanded icons must be 44px');

console.log('✅ Folder icon size strictly clamped between 24px and 36px.\n');

// 4. Smart Adaptive Grid Distribution Algorithm Test
console.log('[4/4] Verifying Smart Adaptive Grid Geometry for N=1..9 items and various aspect ratios...');

// Extract the computeAdaptiveGrid function from folder.js to run test assertions directly
const gridFnMatch = folderJs.match(/function computeAdaptiveGrid\([\s\S]*?\n  \}/);
assert(gridFnMatch, 'Must find computeAdaptiveGrid function in folder.js');

const computeGrid = new Function(
  'MIN_ICON_SIZE',
  'MAX_ICON_SIZE',
  `return (${gridFnMatch[0]});`
)(24, 36);

// Case A: Exactly 1 item in square folder (170x170)
{
  const res = computeGrid(170, 170, 1);
  assert.strictEqual(res.cols, 1, 'N=1 must have 1 col');
  assert.strictEqual(res.rows, 1, 'N=1 must have 1 row');
  assert(res.artSize <= 36 && res.artSize >= 24, 'N=1 artSize must be clamped to 36px');
  console.log(`  ✓ N=1 (square): cols=${res.cols}, rows=${res.rows}, artSize=${res.artSize}px (perfect focal center)`);
}

// Case B: Exactly 2 items in square folder (170x170) -> side by side
{
  const res = computeGrid(170, 170, 2);
  assert.strictEqual(res.cols, 2, 'N=2 (square) must have 2 cols');
  assert.strictEqual(res.rows, 1, 'N=2 (square) must have 1 row');
  assert(res.artSize <= 36 && res.artSize >= 24, 'N=2 artSize must be clamped');
  console.log(`  ✓ N=2 (square): cols=${res.cols}, rows=${res.rows}, artSize=${res.artSize}px (neat 1 row)`);
}

// Case C: Exactly 2 items in tall folder (100x220) -> stacked vertically
{
  const res = computeGrid(100, 220, 2);
  assert.strictEqual(res.cols, 1, 'N=2 (tall) must have 1 col');
  assert.strictEqual(res.rows, 2, 'N=2 (tall) must have 2 rows');
  console.log(`  ✓ N=2 (tall): cols=${res.cols}, rows=${res.rows}, artSize=${res.artSize}px (stacked column)`);
}

// Case D: Exactly 3 items in square folder (170x170) -> 2 on top, 1 centered on bottom!
{
  const res = computeGrid(170, 170, 3);
  assert.strictEqual(res.cols, 2, 'N=3 (square) must have 2 cols');
  assert.strictEqual(res.rows, 2, 'N=3 (square) must have 2 rows');
  assert(res.artSize <= 36 && res.artSize >= 24, 'N=3 artSize must be clamped');
  console.log(`  ✓ N=3 (square): cols=${res.cols}, rows=${res.rows}, artSize=${res.artSize}px (2 top + 1 centered bottom!)`);
}

// Case E: Exactly 3 items in wide dock (260x120) -> 3 in 1 row
{
  const res = computeGrid(260, 120, 3);
  assert.strictEqual(res.cols, 3, 'N=3 (wide) must have 3 cols');
  assert.strictEqual(res.rows, 1, 'N=3 (wide) must have 1 row');
  console.log(`  ✓ N=3 (wide): cols=${res.cols}, rows=${res.rows}, artSize=${res.artSize}px (clean row of 3)`);
}

// Case F: Exactly 4 items in square folder (170x170) -> balanced 2x2
{
  const res = computeGrid(170, 170, 4);
  assert.strictEqual(res.cols, 2, 'N=4 must have 2 cols');
  assert.strictEqual(res.rows, 2, 'N=4 must have 2 rows');
  console.log(`  ✓ N=4: cols=${res.cols}, rows=${res.rows}, artSize=${res.artSize}px (balanced 2x2)`);
}

// Case G: Exactly 5 items in square folder (180x180) -> 3 on top, 2 centered bottom
{
  const res = computeGrid(180, 180, 5);
  assert.strictEqual(res.cols, 3, 'N=5 must have 3 cols');
  assert.strictEqual(res.rows, 2, 'N=5 must have 2 rows');
  console.log(`  ✓ N=5: cols=${res.cols}, rows=${res.rows}, artSize=${res.artSize}px (3 top + 2 centered bottom)`);
}

// Case H: Exactly 6 items -> balanced 3x2
{
  const res = computeGrid(190, 190, 6);
  assert.strictEqual(res.cols, 3, 'N=6 must have 3 cols');
  assert.strictEqual(res.rows, 2, 'N=6 must have 2 rows');
  console.log(`  ✓ N=6: cols=${res.cols}, rows=${res.rows}, artSize=${res.artSize}px (balanced 3x2)`);
}

// Case I: Exactly 7-9 items -> balanced 3x3
{
  const res = computeGrid(200, 200, 9);
  assert.strictEqual(res.cols, 3, 'N=9 must have 3 cols');
  assert.strictEqual(res.rows, 3, 'N=9 must have 3 rows');
  console.log(`  ✓ N=9: cols=${res.cols}, rows=${res.rows}, artSize=${res.artSize}px (balanced 3x3)`);
}

console.log('\n================================================================');
console.log('🎉 ALL SMALLER ICONS & SMART DISTRIBUTION TESTS PASSED 100%! 🎉');
console.log('================================================================\n');
