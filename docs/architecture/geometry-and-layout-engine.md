# Geometry & Layout Engine Architecture

## 1. Pure Geometry Functions ([src/core/geometry.js](file:///e:/shamela4/mirqat-widgets/src/core/geometry.js))

All geometric functions in `geometry.js` are pure mathematical routines without DOM dependencies:

* `resizeFrom(start, corner, dx, dy, area, min, max)`:
  Calculates new rectangle bounds anchored to the opposite corner.
* `resizeEdges(start, edges, dx, dy, area, min, max)`:
  Handles resizing from any of the 8 directional grips (`n`, `s`, `e`, `w`, `ne`, `nw`, `se`, `sw`).
* `clampSize(w, h, area, min, max)`:
  Ensures dimensions respect both minimum/maximum constraints and the desktop work area.
* `avoidCollisions(candidate, area, obstacles, gap)`:
  Finds the closest non-overlapping position using multi-directional geometric raycasting.
* `snapToDesktopGrid(bounds, area, obstacles, options)`:
  Aligns widgets to standard 75x75px desktop icon grid lines while preventing obstacle collisions.

---

## 2. Adaptive Layout Optimization Engine ([src/core/adaptive-layout-engine.js](file:///e:/shamela4/mirqat-widgets/src/core/adaptive-layout-engine.js))

* Calculates optimal column and row partitions for any container width $W$ and height $H$.
* Evaluates normalized multi-objective penalty score $J(L)$.
* Automatically detects and balances incomplete final rows (`centerLastRow: true`).
* Applies hysteresis against `previousLayout` to prevent visual oscillation near breakpoints.
