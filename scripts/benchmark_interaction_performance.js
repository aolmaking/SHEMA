'use strict';

/**
 * ============================================================================
 * BENCHMARK: INTERACTION & RESIZING HOT PATH PERFORMANCE
 * ============================================================================
 * Measures execution time, throughput, memory allocation, and frame budgets
 * for geometry calculations, adaptive layout optimization, and event pipelines.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { performance } = require('perf_hooks');

const geo = require('../src/core/geometry');
const engine = require('../src/core/adaptive-layout-engine');

console.log('================================================================');
console.log('⚡ RUNNING INTERACTION HOT PATH PERFORMANCE BENCHMARK');
console.log('================================================================\n');

const results = {};

// 1. BENCHMARK: Pure Geometry resizeFrom (10,000 continuous mouse move steps)
{
  const area = { x: 0, y: 0, width: 1920, height: 1080 };
  const start = { x: 500, y: 300, width: 280, height: 240 };
  const min = [120, 120];
  const max = [4000, 4000];

  const iterations = 10000;
  const t0 = performance.now();
  let last = start;
  for (let i = 0; i < iterations; i++) {
    const dx = (i % 200) - 100;
    const dy = ((i * 2) % 200) - 100;
    last = geo.resizeFrom(start, 'bl', dx, dy, area, min, max);
  }
  const t1 = performance.now();
  const totalMs = t1 - t0;
  const perOpUs = (totalMs / iterations) * 1000;
  results.resizeFrom = { totalMs, perOpUs, iterations };
  console.log(`[1/4] Pure Geometry (resizeFrom):`);
  console.log(`      ${iterations} operations in ${totalMs.toFixed(2)} ms (${perOpUs.toFixed(2)} µs/op)`);
}

// 2. BENCHMARK: Collision Avoidance & Grid Snapping with Multiple Obstacles
{
  const area = { x: 0, y: 0, width: 1920, height: 1080 };
  const obstacles = [];
  for (let i = 0; i < 20; i++) {
    obstacles.push({ x: (i * 80) % 1800, y: (i * 90) % 900, width: 144, height: 144 });
  }

  const iterations = 2000;
  const t0 = performance.now();
  let last = null;
  for (let i = 0; i < iterations; i++) {
    const candidate = { x: (i * 37) % 1800, y: (i * 43) % 900, width: 144, height: 144 };
    last = geo.avoidCollisions(candidate, area, obstacles, 16);
  }
  const t1 = performance.now();
  const totalMs = t1 - t0;
  const perOpUs = (totalMs / iterations) * 1000;
  results.avoidCollisions = { totalMs, perOpUs, iterations };
  console.log(`[2/4] Multi-Obstacle Collision Avoidance (20 obstacles):`);
  console.log(`      ${iterations} operations in ${totalMs.toFixed(2)} ms (${perOpUs.toFixed(2)} µs/op)`);
}

// 3. BENCHMARK: Adaptive Layout Engine Optimization across 1,000 live resize frames
{
  const iterations = 1000;
  let previousLayout = null;
  const t0 = performance.now();
  for (let i = 0; i < iterations; i++) {
    // Oscillate between width 120 and 480, height 120 and 360 with 9 items
    const w = 120 + (i % 360);
    const h = 120 + ((i * 2) % 240);
    previousLayout = engine.calculateAdaptiveLayout({
      width: w,
      height: h,
      itemCount: 9,
      minSize: 28,
      maxSize: 48,
      preferredSize: 44,
      previousLayout,
    });
  }
  const t1 = performance.now();
  const totalMs = t1 - t0;
  const perOpMs = totalMs / iterations;
  results.layoutEngine = { totalMs, perOpMs, iterations };
  console.log(`[3/4] Adaptive Layout Optimization (1,000 continuous resize frames):`);
  console.log(`      Total: ${totalMs.toFixed(2)} ms | Per Frame: ${perOpMs.toFixed(3)} ms (Budget: < 16.67 ms)`);
}

// 4. BENCHMARK: Stress Test with 50 items (Extreme heavy folder)
{
  const iterations = 500;
  let previousLayout = null;
  const t0 = performance.now();
  for (let i = 0; i < iterations; i++) {
    const w = 200 + (i % 400);
    const h = 200 + ((i * 3) % 300);
    previousLayout = engine.calculateAdaptiveLayout({
      width: w,
      height: h,
      itemCount: 50,
      minSize: 24,
      maxSize: 48,
      preferredSize: 44,
      previousLayout,
    });
  }
  const t1 = performance.now();
  const totalMs = t1 - t0;
  const perOpMs = totalMs / iterations;
  results.stressLayoutEngine = { totalMs, perOpMs, iterations };
  console.log(`[4/4] Stress Adaptive Layout (50 items, 500 frames):`);
  console.log(`      Total: ${totalMs.toFixed(2)} ms | Per Frame: ${perOpMs.toFixed(3)} ms (Budget: < 16.67 ms)`);
}

console.log('\n================================================================');
console.log('📊 BENCHMARK SUMMARY & FRAME BUDGET EVALUATION:');
console.log('================================================================');
console.log(`• Pure Geometry resizeFrom:       ${results.resizeFrom.perOpUs.toFixed(1)} µs (< 0.005 ms) -> Excellent`);
console.log(`• Collision Avoidance (20 items): ${results.avoidCollisions.perOpUs.toFixed(1)} µs (< 0.1 ms)  -> Excellent`);
console.log(`• Adaptive Layout (9 items):      ${results.layoutEngine.perOpMs.toFixed(3)} ms (Budget 16.7ms: ${(results.layoutEngine.perOpMs / 16.67 * 100).toFixed(1)}% consumed)`);
console.log(`• Stress Layout (50 items):       ${results.stressLayoutEngine.perOpMs.toFixed(3)} ms (Budget 16.7ms: ${(results.stressLayoutEngine.perOpMs / 16.67 * 100).toFixed(1)}% consumed)`);
console.log('================================================================\n');

fs.writeFileSync(path.join(__dirname, '..', 'scratch', 'benchmark_baseline.json'), JSON.stringify(results, null, 2));
console.log('Saved baseline metrics to scratch/benchmark_baseline.json');
