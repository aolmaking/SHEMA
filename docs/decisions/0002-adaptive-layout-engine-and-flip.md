# ADR 0002: Pure Layout Optimization Engine and FLIP Motion System

## Context
Fixed CSS grid templates fail when containers change dynamically between extreme aspect ratios (wide docks, square boxes, tall pillars) and varying item counts (1 to 50+ items). Ad-hoc branch conditions in UI components lead to code fragility, layout thrashing, and jarring animations.

## Decision
1. Implement a pure mathematical optimization engine (`src/core/adaptive-layout-engine.js`) evaluating all feasible column partitions $c \in [1, N]$ with multi-objective error scoring $J(L)$ and hysteresis.
2. Implement a high-performance FLIP (First, Last, Invert, Play) transition controller (`windows/js/flip-motion.js`) utilizing composite-only CSS transforms (`translate3d`, `scale`) with automatic cancellation during active manual resize (`body.resizing`).

## Consequences
* **Positive**: Predictable, geometrically bounded layouts across arbitrary dimensions; buttery-smooth 220ms transitions without repaints; zero jitter during mouse dragging.
* **Trade-off**: Requires maintaining DOM item identity via `data-id`.
