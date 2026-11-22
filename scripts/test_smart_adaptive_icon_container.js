'use strict';

/**
 * ============================================================================
 * TEST SUITE: SMART ADAPTIVE ICON CONTAINER
 * (محرك التخطيط التكيفي الذكي وشبكة الأيقونات المتقدمة)
 * ============================================================================
 * Validates:
 * 1. Pure Layout Optimization Engine (src/core/adaptive-layout-engine.js)
 * 2. Re-export in src/core/geometry.js
 * 3. Matrix test over item counts: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 16, 24, 32, 50, 100]
 * 4. Container geometries: Square, Wide Dock, Tall Column, Breakpoints, Stress Case
 * 5. Geometric Invariants: No NaN, no collisions, bounding box containment, deterministic ordering
 * 6. Multi-objective error scoring J(L) & Hysteresis stability
 * 7. FLIP Motion Controller (windows/js/flip-motion.js)
 * 8. CSS & HTML file integration
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('================================================================');
console.log('🚀 TESTING SMART ADAPTIVE ICON CONTAINER & MOTION SYSTEM');
console.log('================================================================\n');

// 1. MODULE EXPORTS & ENGINE LOADING
console.log('[1/7] Testing module loading and pure exports...');
const engine = require('../src/core/adaptive-layout-engine');
const geo = require('../src/core/geometry');

assert(typeof engine.calculateAdaptiveLayout === 'function', 'Engine must export calculateAdaptiveLayout');
assert(typeof engine.evaluateLayoutCandidate === 'function', 'Engine must export evaluateLayoutCandidate');
assert(typeof geo.calculateAdaptiveLayout === 'function', 'geometry.js must re-export calculateAdaptiveLayout');
console.log('✅ Core layout engine and geometry re-exports verified.');

// 2. TEST MATRIX: ITEM COUNTS & CONTAINER GEOMETRIES
console.log('\n[2/7] Running test matrix across item counts & aspect ratios...');

const ITEM_MATRIX = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 16, 24, 32, 50, 100];
const GEOMETRIES = [
  { name: 'Standard Squircle', width: 144, height: 144 },
  { name: 'Compact Squircle', width: 120, height: 120 },
  { name: 'Tiny Minimal', width: 80, height: 80 },
  { name: 'Large Square Card', width: 320, height: 320 },
  { name: 'Wide Horizontal Dock', width: 480, height: 120 },
  { name: 'Ultra-wide Strip', width: 640, height: 80 },
  { name: 'Tall Vertical Pillar', width: 120, height: 480 },
  { name: 'Ultra-tall Pillar', width: 80, height: 600 },
  { name: 'Desktop Workspace (4K Stress)', width: 1920, height: 1080 },
];

let totalCasesRun = 0;

for (const geoCase of GEOMETRIES) {
  for (const count of ITEM_MATRIX) {
    totalCasesRun++;
    const res = engine.calculateAdaptiveLayout({
      width: geoCase.width,
      height: geoCase.height,
      itemCount: count,
      minSize: 24,
      maxSize: 48,
      preferredSize: 44,
      minGap: 4,
      maxGap: 8,
      padding: { top: 10, bottom: 10, left: 10, right: 10 },
    });

    // Invariant: Non-null result
    assert(res && typeof res === 'object', `Result must be valid object for N=${count} in ${geoCase.name}`);
    if (count === 0) {
      assert.strictEqual(res.cols, 0, 'Cols must be 0 for N=0');
      assert.strictEqual(res.rows, 0, 'Rows must be 0 for N=0');
      assert.strictEqual(res.items.length, 0, 'Items must be empty for N=0');
    } else {
      assert(typeof res.cols === 'number' && !isNaN(res.cols) && res.cols >= 1, `Cols must be valid integer >= 1`);
      assert(typeof res.rows === 'number' && !isNaN(res.rows) && res.rows >= 1, `Rows must be valid integer >= 1`);
    }
    assert(typeof res.cellSize === 'number' && !isNaN(res.cellSize), `CellSize must not be NaN`);
    assert(typeof res.artSize === 'number' && !isNaN(res.artSize), `ArtSize must not be NaN`);
    assert(Array.isArray(res.items), `Items must be an array`);

    if (count > 0 && res.feasible) {
      assert(res.items.length === count, `Must produce item layouts for all ${count} items`);

      // Invariant: Container Bounds Containment
      for (const item of res.items) {
        assert(!isNaN(item.x) && !isNaN(item.y), `Item coordinates must be valid numbers`);
        assert(!isNaN(item.width) && !isNaN(item.height), `Item dimensions must be valid numbers`);
        assert(item.x >= 0, `Item X (${item.x}) must not be negative`);
        assert(item.y >= 0, `Item Y (${item.y}) must not be negative`);
        assert(item.x + item.width <= geoCase.width + 1,
          `Item right edge (${item.x + item.width}) must not exceed container width (${geoCase.width})`);
        assert(item.y + item.height <= geoCase.height + 1,
          `Item bottom edge (${item.y + item.height}) must not exceed container height (${geoCase.height})`);
      }

      // Invariant: No Cell Overlaps (Geometric collision free)
      for (let i = 0; i < res.items.length; i++) {
        for (let j = i + 1; j < res.items.length; j++) {
          const a = res.items[i];
          const b = res.items[j];
          const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
          const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
          assert(overlapX <= 0.01 || overlapY <= 0.01,
            `Items ${i} and ${j} must not overlap! Overlap (${overlapX.toFixed(2)}, ${overlapY.toFixed(2)}) in ${geoCase.name} with N=${count}`);
        }
      }
    }
  }
}
console.log(`✅ Tested ${totalCasesRun} layout combinations across all counts & dimensions. All invariants held!`);

// 3. ADAPTIVE BEHAVIOR VALIDATION (WIDE DOCK VS TALL PILLAR)
console.log('\n[3/7] Testing layout adaptability between wide docks, squares, and tall pillars...');

// 4 items in wide horizontal dock (width 400, height 120) should prefer 1 row (4 columns)
const wide4 = engine.calculateAdaptiveLayout({
  width: 400, height: 120, itemCount: 4, minSize: 28, maxSize: 48, preferredSize: 44
});
assert.strictEqual(wide4.cols, 4, `Wide dock with 4 items must choose 4 columns, got ${wide4.cols}`);
assert.strictEqual(wide4.rows, 1, `Wide dock with 4 items must choose 1 row, got ${wide4.rows}`);
console.log(`✅ Wide dock (400x120, 4 items): correctly selected 4x1 horizontal bar (cols=${wide4.cols}, rows=${wide4.rows})`);

// 4 items in tall vertical pillar (width 120, height 400) should prefer 1 column (4 rows)
const tall4 = engine.calculateAdaptiveLayout({
  width: 120, height: 400, itemCount: 4, minSize: 28, maxSize: 48, preferredSize: 44
});
assert.strictEqual(tall4.cols, 1, `Tall pillar with 4 items must choose 1 column, got ${tall4.cols}`);
assert.strictEqual(tall4.rows, 4, `Tall pillar with 4 items must choose 4 rows, got ${tall4.rows}`);
console.log(`✅ Tall pillar (120x400, 4 items): correctly selected 1x4 vertical column (cols=${tall4.cols}, rows=${tall4.rows})`);

// 4 items in standard square (144x144) should prefer 2x2 grid
const square4 = engine.calculateAdaptiveLayout({
  width: 144, height: 144, itemCount: 4, minSize: 28, maxSize: 48, preferredSize: 44
});
assert.strictEqual(square4.cols, 2, `Square with 4 items must choose 2 columns, got ${square4.cols}`);
assert.strictEqual(square4.rows, 2, `Square with 4 items must choose 2 rows, got ${square4.rows}`);
console.log(`✅ Square squircle (144x144, 4 items): correctly selected 2x2 grid (cols=${square4.cols}, rows=${square4.rows})`);

// 4. OBJECTIVE SCORING & HYSTERESIS STABILITY
console.log('\n[4/7] Testing multi-objective scoring function J(L) & Hysteresis...');

// Deterministic idempotency: identical inputs must yield identical output
const runA = engine.calculateAdaptiveLayout({ width: 200, height: 200, itemCount: 7 });
const runB = engine.calculateAdaptiveLayout({ width: 200, height: 200, itemCount: 7 });
assert.strictEqual(runA.cols, runB.cols, 'Cols must be deterministic');
assert.strictEqual(runA.rows, runB.rows, 'Rows must be deterministic');
assert.strictEqual(runA.score, runB.score, 'Score must be deterministic');

// Hysteresis test: small 1px fluctuation near a breakpoint should not cause oscillation
const baseline = engine.calculateAdaptiveLayout({ width: 200, height: 200, itemCount: 5 });
const nudged = engine.calculateAdaptiveLayout({
  width: 201, height: 200, itemCount: 5, previousLayout: baseline
});
assert.strictEqual(nudged.cols, baseline.cols, 'Hysteresis must prevent oscillation on 1px minor container change');
console.log(`✅ Determinism and hysteresis stability confirmed (cols=${nudged.cols}, rows=${nudged.rows})`);

// 5. INCOMPLETE LAST ROW CENTERING
console.log('\n[5/7] Testing incomplete last row balancing (7 items in 3 columns)...');
const layout7 = engine.calculateAdaptiveLayout({
  width: 240, height: 240, itemCount: 7, minSize: 28, maxSize: 48, preferredSize: 44
});
assert.strictEqual(layout7.cols, 3, '7 items in square container should arrange in 3 columns');
assert.strictEqual(layout7.rows, 3, '7 items in 3 columns requires 3 rows');
assert.strictEqual(layout7.centerLastRow, true, 'Incomplete last row (1 item in row 3) must be marked for centering');
const lastItem = layout7.items[6];
assert(lastItem.isLastRow, 'Item 7 must be marked as isLastRow');
console.log(`✅ Row balancing: 7 items arranged as 3+3+1 with centerLastRow=true, item 7 X=${lastItem.x.toFixed(1)}`);

// 6. MOTION CONTROLLER & FLIP VALIDATION
console.log('\n[6/7] Testing FLIP motion transition engine (windows/js/flip-motion.js)...');
const FlipMotion = require('../windows/js/flip-motion');

assert(FlipMotion && FlipMotion.FlipManager, 'FlipMotion must export FlipManager class');
assert(FlipMotion.DEFAULT_OPTIONS.duration === 220, 'Default duration must be 220ms');
assert(FlipMotion.DEFAULT_OPTIONS.easing.includes('cubic-bezier(0.22, 1, 0.36, 1)'), 'Easing must be standard smooth cubic-bezier');

// Mock container for FLIP testing in Node environment
const mockItems = new Map();
const mockContainer = {
  classList: { contains: () => false },
  querySelectorAll: (selector) => {
    return [
      {
        getAttribute: (attr) => (attr === 'data-id' ? 'slot-1' : null),
        dataset: { id: 'slot-1' },
        style: {},
        getBoundingClientRect: () => mockItems.get('slot-1') || { left: 10, top: 10, width: 44, height: 44 }
      },
      {
        getAttribute: (attr) => (attr === 'data-id' ? 'slot-2' : null),
        dataset: { id: 'slot-2' },
        style: {},
        getBoundingClientRect: () => mockItems.get('slot-2') || { left: 60, top: 10, width: 44, height: 44 }
      }
    ];
  },
  offsetHeight: 100
};

const flip = new FlipMotion.FlipManager(mockContainer);
flip.snapshot();
assert.strictEqual(flip.firstRects.size, 2, 'Snapshot must record 2 items');
assert.strictEqual(flip.firstRects.get('slot-1').left, 10, 'slot-1 left position must be recorded');

// Emulate position change
mockItems.set('slot-1', { left: 10, top: 60, width: 44, height: 44 });
flip.play();
console.log('✅ FLIP Motion snapshot, measurement, and transition lifecycle passed.');

// 7. FILE INTEGRATION & REGRESSION CHECKS
console.log('\n[7/7] Verifying HTML, CSS, and JS integration in windows/...');
const htmlSrc = fs.readFileSync(path.join(__dirname, '..', 'windows', 'folder.html'), 'utf8');
const cssSrc = fs.readFileSync(path.join(__dirname, '..', 'windows', 'css', 'folder.css'), 'utf8');
const jsSrc = fs.readFileSync(path.join(__dirname, '..', 'windows', 'js', 'folder.js'), 'utf8');

assert(htmlSrc.includes('js/adaptive-layout-engine.js'), 'folder.html must include adaptive-layout-engine.js');
assert(htmlSrc.includes('js/flip-motion.js'), 'folder.html must include flip-motion.js');

assert(cssSrc.includes('container-type: size;'), 'folder.css must define container-type: size');
assert(cssSrc.includes('container-name: folderCard;'), 'folder.css must define container-name: folderCard');
assert(cssSrc.includes('display: grid;'), 'folder.css must use CSS Grid');
assert(cssSrc.includes('grid-template-columns: repeat(var(--folder-cols, 2), minmax(0, 1fr));'),
  'folder.css must use responsive CSS Grid variables');
assert(cssSrc.includes('@media (prefers-reduced-motion: reduce)'), 'folder.css must support reduced-motion');

assert(jsSrc.includes('AdaptiveLayoutEngine.calculateAdaptiveLayout'), 'folder.js must invoke calculateAdaptiveLayout');
assert(jsSrc.includes('FlipMotion.FlipManager'), 'folder.js must use FlipManager');
assert(jsSrc.includes('cardW >= 320 && cardH >= 240'), 'folder.js must preserve slot title condition');
console.log('✅ HTML, CSS, and JS integration files verified.');

console.log('\n================================================================');
console.log('🎉 ALL SMART ADAPTIVE ICON CONTAINER TESTS PASSED (100%)!');
console.log('================================================================');
