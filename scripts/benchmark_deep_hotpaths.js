/**
 * Benchmark Deep Hot Paths
 * Measures execution time (µs/op) and memory allocations for critical hot paths.
 */

const { performance } = require('perf_hooks');
const geo = require('../src/core/geometry');
const AdaptiveLayoutEngine = require('../src/core/adaptive-layout-engine');
const { getTaskDeadline } = require('../src/core/super-urgent');

function runBenchmark() {
  const results = {};

  // 1. Benchmark: avoidCollisions
  {
    const area = { x: 0, y: 0, width: 1920, height: 1080 };
    const obstacles = [
      { x: 100, y: 100, width: 300, height: 200 },
      { x: 450, y: 150, width: 250, height: 250 },
      { x: 200, y: 350, width: 400, height: 180 },
      { x: 700, y: 50, width: 200, height: 400 },
      { x: 300, y: 600, width: 350, height: 220 },
    ];
    const b = { x: 250, y: 200, width: 200, height: 200 };

    // Warmup
    for (let i = 0; i < 500; i++) geo.avoidCollisions(b, area, obstacles, 4);

    const iters = 5000;
    const t0 = performance.now();
    for (let i = 0; i < iters; i++) {
      geo.avoidCollisions(b, area, obstacles, 4);
    }
    const t1 = performance.now();
    const totalMs = t1 - t0;
    results.avoidCollisions = {
      iterations: iters,
      totalMs,
      perOpUs: (totalMs * 1000) / iters,
    };
  }

  // 2. Benchmark: Pure Geometry resizeFrom
  {
    const area = { x: 0, y: 0, width: 1920, height: 1080 };
    const start = { x: 500, y: 400, width: 300, height: 200 };
    const min = [100, 100];
    const max = [800, 600];

    // Warmup
    for (let i = 0; i < 1000; i++) geo.resizeFrom(start, 'br', 15, 20, area, min, max);

    const iters = 20000;
    const t0 = performance.now();
    for (let i = 0; i < iters; i++) {
      geo.resizeFrom(start, 'br', (i % 50) - 25, (i % 40) - 20, area, min, max);
    }
    const t1 = performance.now();
    const totalMs = t1 - t0;
    results.resizeFrom = {
      iterations: iters,
      totalMs,
      perOpUs: (totalMs * 1000) / iters,
    };
  }

  // 3. Benchmark: Adaptive Layout Engine
  {
    const items = [
      { id: 'clock', priority: 1 },
      { id: 'todo', priority: 2 },
      { id: 'quran', priority: 1 },
      { id: 'pomodoro', priority: 1 },
      { id: 'habits', priority: 2 },
    ];
    const container = { width: 340, height: 260 };

    // Warmup
    for (let i = 0; i < 200; i++) AdaptiveLayoutEngine.calculateAdaptiveLayout(items, container);

    const iters = 2000;
    const t0 = performance.now();
    for (let i = 0; i < iters; i++) {
      AdaptiveLayoutEngine.calculateAdaptiveLayout(items, container);
    }
    const t1 = performance.now();
    const totalMs = t1 - t0;
    results.adaptiveLayoutEngine = {
      iterations: iters,
      totalMs,
      perOpUs: (totalMs * 1000) / iters,
    };
  }

  // 4. Benchmark: getTaskDeadline
  {
    const sampleTasks = [
      { id: '1', text: 'Important assignment due: 2026-11-25 14:00' },
      { id: '2', text: 'Task due tomorrow', deadline: '2026-11-22T10:00:00.000Z' },
      { id: '3', text: 'Regular meeting at 5pm' },
      { id: '4', text: 'Project delivery [due: 2026-12-01]' },
      { id: '5', text: 'Study session' },
    ];

    // Warmup
    for (let i = 0; i < 500; i++) {
      for (const t of sampleTasks) getTaskDeadline(t);
    }

    const iters = 10000;
    const t0 = performance.now();
    for (let i = 0; i < iters; i++) {
      for (const t of sampleTasks) getTaskDeadline(t);
    }
    const t1 = performance.now();
    const totalMs = t1 - t0;
    results.getTaskDeadline = {
      iterations: iters * sampleTasks.length,
      totalMs,
      perOpUs: (totalMs * 1000) / (iters * sampleTasks.length),
    };
  }

  return results;
}

const res = runBenchmark();
console.log(JSON.stringify(res, null, 2));
