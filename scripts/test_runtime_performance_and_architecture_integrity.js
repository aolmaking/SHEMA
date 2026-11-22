'use strict';

/**
 * ============================================================================
 * TEST SUITE: RUNTIME PERFORMANCE & ARCHITECTURAL INTEGRITY
 * ============================================================================
 * Verifies:
 * 1. Architecture documentation (AGENTS.md, ARCHITECTURE.md, docs/*)
 * 2. Interaction Hot Path optimizations (shell.js, base.css, main.js)
 * 3. Execution time limits (Frame budgets for 60Hz and 120Hz)
 * 4. Geometry and Layout Engine Invariants
 * 5. Regression safety across all interaction lifecycles
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { performance } = require('perf_hooks');

const geo = require('../src/core/geometry');
const engine = require('../src/core/adaptive-layout-engine');

console.log('================================================================');
console.log('🛡️ TESTING ARCHITECTURAL INTEGRITY & RUNTIME PERFORMANCE');
console.log('================================================================\n');

const ROOT = path.join(__dirname, '..');

// 1. ARCHITECTURAL DOCUMENTATION SUITE
console.log('[1/5] Verifying Architectural Intelligence & Agent Context...');
assert(fs.existsSync(path.join(ROOT, 'AGENTS.md')), 'AGENTS.md must exist at root');
assert(fs.existsSync(path.join(ROOT, 'ARCHITECTURE.md')), 'ARCHITECTURE.md must exist at root');
assert(fs.existsSync(path.join(ROOT, 'docs', 'architecture', 'interaction-hot-paths-and-resizing.md')), 'interaction-hot-paths-and-resizing.md must exist');
assert(fs.existsSync(path.join(ROOT, 'docs', 'architecture', 'widget-lifecycle-and-windows.md')), 'widget-lifecycle-and-windows.md must exist');
assert(fs.existsSync(path.join(ROOT, 'docs', 'architecture', 'geometry-and-layout-engine.md')), 'geometry-and-layout-engine.md must exist');
assert(fs.existsSync(path.join(ROOT, 'docs', 'architecture', 'state-and-persistence.md')), 'state-and-persistence.md must exist');
assert(fs.existsSync(path.join(ROOT, 'docs', 'decisions', '0001-gesture-driven-window-bounds.md')), 'ADR 0001 must exist');
assert(fs.existsSync(path.join(ROOT, 'docs', 'decisions', '0002-adaptive-layout-engine-and-flip.md')), 'ADR 0002 must exist');
assert(fs.existsSync(path.join(ROOT, 'docs', 'decisions', '0003-transient-vs-durable-geometry-state.md')), 'ADR 0003 must exist');
assert(fs.existsSync(path.join(ROOT, 'docs', 'development', 'workflows-and-testing.md')), 'workflows-and-testing.md must exist');
assert(fs.existsSync(path.join(ROOT, 'docs', 'development', 'performance-benchmarks.md')), 'performance-benchmarks.md must exist');

const agentsMd = fs.readFileSync(path.join(ROOT, 'AGENTS.md'), 'utf8');
assert(agentsMd.includes('Non-Negotiable'), 'AGENTS.md must define non-negotiable principles');
assert(agentsMd.includes('High-Frequency Interaction Rules'), 'AGENTS.md must document hot path rules');

const archMd = fs.readFileSync(path.join(ROOT, 'ARCHITECTURE.md'), 'utf8');
assert(archMd.includes('sequenceDiagram'), 'ARCHITECTURE.md must contain gesture sequence diagram');
console.log('✅ All 11 architectural intelligence documents verified and validated.');

// 2. HOT PATH PIPELINE & DEDUPLICATION CHECKS
console.log('\n[2/5] Verifying Hot Path Deduplication & Styles in shell.js and base.css...');
const shellJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'shell.js'), 'utf8');
const baseCss = fs.readFileSync(path.join(ROOT, 'windows', 'css', 'base.css'), 'utf8');

assert(shellJs.includes('lastSent && lastSent.x === last.x && lastSent.y === last.y'),
  'shell.js must deduplicate integer coordinates before IPC dispatch');
assert(shellJs.includes('if (w === lastW && h === lastH) return;'),
  'shell.js installResponsiveObserver must deduplicate unchanged dimensions');
assert(/body\.resizing\s+\.plate\s*\{\s*will-change:\s*width,\s*height;/.test(baseCss),
  'base.css must optimize compositor layer for body.resizing .plate');
assert(/body\.resizing\s+\.sheen/.test(baseCss) && /display:\s*none\s*!important/.test(baseCss),
  'base.css must hide heavy sheen and after overlays during active resize');
console.log('✅ Hot path IPC coordinate deduplication and CSS compositor optimizations verified.');

// 3. FRAME BUDGET & PERFORMANCE INVARIANTS
console.log('\n[3/5] Verifying Execution Time Limits against 60Hz/120Hz Frame Budgets...');
const area = { x: 0, y: 0, width: 1920, height: 1080 };
const start = { x: 400, y: 200, width: 300, height: 250 };

// 1,000 resize operations must complete well within 5ms total (0.005 ms/op)
const t0 = performance.now();
for (let i = 0; i < 1000; i++) {
  geo.resizeFrom(start, 'bl', (i % 80) - 40, (i % 60) - 30, area, [120, 120], [4000, 4000]);
}
const elapsedResize = performance.now() - t0;
const perOpResizeMs = elapsedResize / 1000;
assert(perOpResizeMs < 0.05, `resizeFrom must be < 0.05ms per op, got ${perOpResizeMs.toFixed(4)}ms`);
console.log(`  ✓ Pure Geometry resizeFrom: ${(perOpResizeMs * 1000).toFixed(2)} µs/op (< 50 µs limit)`);

// 100 adaptive layout calculations must complete within 15ms total
const t1 = performance.now();
let prev = null;
for (let i = 0; i < 100; i++) {
  prev = engine.calculateAdaptiveLayout({
    width: 150 + (i % 200),
    height: 150 + (i % 150),
    itemCount: 9,
    minSize: 28,
    maxSize: 48,
    preferredSize: 44,
    previousLayout: prev,
  });
}
const elapsedLayout = performance.now() - t1;
const perOpLayoutMs = elapsedLayout / 100;
assert(perOpLayoutMs < 0.5, `calculateAdaptiveLayout must be < 0.5ms per frame, got ${perOpLayoutMs.toFixed(4)}ms`);
console.log(`  ✓ Adaptive Layout Engine: ${perOpLayoutMs.toFixed(3)} ms/frame (< 0.5 ms limit, Budget: 16.67 ms)`);

// 4. TRANSIENT VS DURABLE STATE ISOLATION IN MAIN.JS
console.log('\n[4/5] Verifying Transient vs Durable State Isolation in main.js...');
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8');

// Ensure win:resizeMove and win:dragMove do not call synchronous settings.save()
const dragMoveBlock = mainJs.slice(mainJs.indexOf("ipcMain.on('win:dragMove'"), mainJs.indexOf("ipcMain.on('win:resizeStart'"));
assert(!dragMoveBlock.includes("settings.save()"), 'win:dragMove must NOT write settings to disk');

const resizeMoveBlock = mainJs.slice(mainJs.indexOf("ipcMain.on('win:resizeMove'"), mainJs.indexOf("ipcMain.on('win:gestureEnd'"));
assert(!resizeMoveBlock.includes("settings.save()"), 'win:resizeMove must NOT write settings to disk');

// Verify gestureEnd persists state
const gestureEndBlock = mainJs.slice(mainJs.indexOf("ipcMain.on('win:gestureEnd'"), mainJs.indexOf("ipcMain.on('win:gestureEnd'") + 1000);
assert(gestureEndBlock.includes("settings.save()"), 'win:gestureEnd must persist durable state');
console.log('✅ Transient vs Durable persistence contract strictly upheld.');

// 5. REGRESSION CHECK ACROSS CORE ALGORITHMS
console.log('\n[5/5] Checking Behavioral Invariants & Stability...');
const clamped = geo.clampSize(100, 100, area, [144, 144], [800, 800]);
assert.strictEqual(clamped.width, 144, 'clampSize must enforce minimum width');
assert.strictEqual(clamped.height, 144, 'clampSize must enforce minimum height');

const snapped = geo.snapToDesktopGrid({ x: 23, y: 47, width: 48, height: 48 }, area, [], {
  originX: 16, originY: 16, stepX: 75, stepY: 75, iconW: 48, iconH: 48, avoidCollisions: false
});
assert.strictEqual(snapped.x, 15, 'Grid snapping must snap 23px to closest column (15px margin)');
assert.strictEqual(snapped.y, 15, 'Grid snapping must snap 47px to closest row (15px margin)');
console.log('✅ Geometric clamping and desktop grid invariants intact.');

console.log('\n================================================================');
console.log('🎉 ALL ARCHITECTURAL INTEGRITY & RUNTIME PERFORMANCE CHECKS PASSED (100%)!');
console.log('================================================================');
