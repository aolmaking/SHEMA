'use strict';

/**
 * ============================================================================
 * ADAPTIVE WIDGET LAYOUT ENGINE (محرك التخطيط التكيفي الذكي)
 * ============================================================================
 *
 * A pure, deterministic mathematical layout optimization engine for dynamic
 * icon and widget containers.
 *
 * Responsibilities:
 * 1. Measure and normalize container geometry (width, height, paddings).
 * 2. Enumerate geometrically feasible candidate layouts (varying column/row counts,
 *    aspect ratios, gaps, and strip configurations).
 * 3. Evaluate each candidate using a normalized multi-objective penalty function:
 *    J(L) = w_s*E_size + w_a*E_aspect + w_w*E_waste + w_o*E_overflow +
 *           w_d*E_density + w_c*E_change + w_p*E_priority
 * 4. Choose the optimal layout with deterministic tie-breaking and hysteresis
 *    to prevent layout flicker / oscillation during continuous resizing.
 * 5. Compute exact item coordinate mappings, cell sizes, and row-centering offsets.
 * 6. Completely decoupled from UI frameworks (runs in Node.js and browser).
 */

(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AdaptiveLayoutEngine = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {

  // Default tuning weights for multi-objective optimization
  const DEFAULT_WEIGHTS = Object.freeze({
    size: 1.2,      // w_s: Penalizes icons smaller than preferred size
    aspect: 0.8,    // w_a: Penalizes mismatch between container and grid proportions
    waste: 0.5,     // w_w: Penalizes excessive empty space
    overflow: 80.0, // w_o: Very heavy penalty for clipping or container overflow
    density: 0.6,   // w_d: Penalizes lone straggler items on incomplete rows
    change: 0.22,   // w_c: Hysteresis stability penalty to prevent boundary oscillation
    priority: 0.5,  // w_p: Penalizes downsizing high-priority items
  });

  const DEFAULT_CONFIG = Object.freeze({
    minIconSize: 26,
    maxIconSize: 48,
    preferredIconSize: 44,
    minGap: 4,
    maxGap: 10,
    aspectRatio: 1.0,
    showTitles: false,
    maxColumns: 12,
  });

  /**
   * Normalize padding input into { top, right, bottom, left }
   */
  function normalizePadding(padding, containerW = 0, containerH = 0) {
    if (typeof padding === 'number' && Number.isFinite(padding)) {
      return { top: padding, right: padding, bottom: padding, left: padding };
    }
    if (padding && typeof padding === 'object') {
      const p = {
        top: Number(padding.top ?? padding.y ?? 0),
        right: Number(padding.right ?? padding.x ?? 0),
        bottom: Number(padding.bottom ?? padding.y ?? 0),
        left: Number(padding.left ?? padding.x ?? 0),
      };
      return {
        top: Math.max(0, p.top),
        right: Math.max(0, p.right),
        bottom: Math.max(0, p.bottom),
        left: Math.max(0, p.left),
      };
    }
    // Dynamic responsive fallback padding (approx 5-6% of container dimension)
    const px = Math.max(8, Math.min(18, Math.round(containerW * 0.055)));
    const py = Math.max(8, Math.min(18, Math.round(containerH * 0.055)));
    return { top: py, right: px, bottom: py, left: px };
  }

  /**
   * Score an enumerated layout candidate using normalized error terms.
   *
   * @param {Object} candidate - Candidate grid parameters
   * @param {Object} input - Layout calculation inputs
   * @returns {Object} Score breakdown and total score J(L)
   */
  function scoreCandidate(candidate, input) {
    const { Aw, Ah, preferredIconSize, previousLayout, weights } = input;
    const { cols, rows, iconSize, gap, W_occ, H_occ, N, N_last, hasOverflow, rawCellSize } = candidate;

    // 1. E_size: Size Penalty
    // Normalizes difference between preferred icon size and candidate icon size
    let E_size = 0;
    if (iconSize < preferredIconSize) {
      E_size = Math.pow((preferredIconSize - iconSize) / preferredIconSize, 2);
    }

    // 2. E_aspect: Aspect Ratio Mismatch
    // Compares container aspect (Aw/Ah) with occupied grid aspect (W_occ/H_occ)
    const contAspect = Math.max(0.1, Aw / Math.max(1, Ah));
    const occAspect = Math.max(0.1, W_occ / Math.max(1, H_occ));
    const aspectDiff = Math.abs(Math.log2(occAspect / contAspect));
    const E_aspect = Math.min(2.5, aspectDiff);

    // 3. E_waste: Wasted Space
    // Proportion of usable area left unoccupied by items
    const usableArea = Math.max(1, Aw * Ah);
    const occupiedArea = N * Math.pow(iconSize, 2);
    const E_waste = Math.max(0, Math.min(1.0, (usableArea - occupiedArea) / usableArea));

    // 4. E_overflow: Hard Feasibility Violation
    let E_overflow = 0;
    if (hasOverflow || W_occ > Aw || H_occ > Ah) {
      const overW = Math.max(0, (W_occ - Aw) / Math.max(1, Aw));
      const overH = Math.max(0, (H_occ - Ah) / Math.max(1, Ah));
      E_overflow = 1.0 + (overW + overH) * 5.0;
    }
    if (rawCellSize < input.minIconSize) {
      E_overflow += (input.minIconSize - rawCellSize) / input.minIconSize * 2.0;
    }

    // 5. E_density: Row Balance / Incomplete Final Row Straggler Penalty
    let E_density = 0;
    if (rows > 1 && N_last < cols) {
      const missingInLastRow = cols - N_last;
      // Lone straggler (1 item alone on wide row) is especially penalized
      const loneStragglerFactor = (N_last === 1 && cols >= 3) ? 1.6 : 0.8;
      E_density = (missingInLastRow / cols) * loneStragglerFactor;
    }

    // 6. E_change: Hysteresis / Stability Penalty
    // Discourages changing column count unless new layout offers meaningful improvement
    let E_change = 0;
    if (previousLayout && previousLayout.cols && previousLayout.cols !== cols) {
      E_change = 1.0;
    }

    // 7. E_priority: Priority Handling
    let E_priority = 0;
    if (input.items && Array.isArray(input.items)) {
      const highPriorityCount = input.items.filter(it => (it && it.priority && it.priority > 3)).length;
      if (highPriorityCount > 0 && iconSize < preferredIconSize) {
        E_priority = (highPriorityCount / N) * ((preferredIconSize - iconSize) / preferredIconSize);
      }
    }

    // Calculate total weighted cost J(L)
    const totalScore =
      weights.size * E_size +
      weights.aspect * E_aspect +
      weights.waste * E_waste +
      weights.overflow * E_overflow +
      weights.density * E_density +
      weights.change * E_change +
      weights.priority * E_priority;

    return {
      totalScore,
      errors: { E_size, E_aspect, E_waste, E_overflow, E_density, E_change, E_priority }
    };
  }

  /**
   * Pure layout calculation function.
   * Given container measurements and item parameters, computes the optimal layout.
   *
   * @param {Object} input - Configuration and measurements
   * @returns {Object} Optimized layout specification
   */
  function calculateAdaptiveLayout(input = {}) {
    const W = Math.max(0, Number(input.containerWidth || input.width || 0));
    const H = Math.max(0, Number(input.containerHeight || input.height || 0));
    const rawItems = Array.isArray(input.items) ? input.items : [];
    const N = Number.isInteger(input.itemCount) ? Math.max(0, input.itemCount) : rawItems.length;

    const minIconSize = Math.max(16, Number(input.minIconSize || input.minSize || DEFAULT_CONFIG.minIconSize));
    const maxIconSize = Math.max(minIconSize, Number(input.maxIconSize || input.maxSize || DEFAULT_CONFIG.maxIconSize));
    const preferredIconSize = Math.max(minIconSize, Math.min(maxIconSize, Number(input.preferredIconSize || input.preferredSize || DEFAULT_CONFIG.preferredIconSize)));
    const minGap = Math.max(2, Number(input.minGap || DEFAULT_CONFIG.minGap));
    const maxGap = Math.max(minGap, Number(input.maxGap || DEFAULT_CONFIG.maxGap));
    const aspectRatio = Math.max(0.2, Number(input.aspectRatio || DEFAULT_CONFIG.aspectRatio));
    const maxColumns = Math.max(1, Number(input.maxColumns || DEFAULT_CONFIG.maxColumns));
    const showTitles = Boolean(input.showTitles);
    const previousLayout = input.previousLayout || null;
    const weights = Object.assign({}, DEFAULT_WEIGHTS, input.weights || {});

    const padding = normalizePadding(input.padding, W, H);
    const Aw = Math.max(0, W - padding.left - padding.right);
    const Ah = Math.max(0, H - padding.top - padding.bottom);

    // Edge Case: 0 items or zero-sized container
    if (N === 0 || W <= 0 || H <= 0) {
      return {
        feasible: true,
        cols: 0,
        rows: 0,
        capacity: 0,
        cellSize: minIconSize,
        iconSize: minIconSize,
        artSize: minIconSize,
        slotRadius: 8,
        titleFontSize: 9,
        gap: minGap,
        gapX: minGap,
        gapY: minGap,
        gridWidth: 0,
        gridHeight: 0,
        padding,
        availableWidth: Aw,
        availableHeight: Ah,
        positions: [],
        items: [],
        visibleCount: 0,
        overflowCount: 0,
        lastRowCentered: false,
        centerLastRow: false,
        score: 0,
        allCandidates: [],
      };
    }

    // Dynamic responsive gap: scales smoothly with available container space
    let gap = Math.max(minGap, Math.min(maxGap, Math.round(Math.min(Aw, Ah) * 0.035)));
    if (Aw >= Ah * 1.8 && maxGap > minGap) {
      gap = Math.max(minGap, Math.min(maxGap, Math.round(Aw * 0.025)));
    } else if (Ah >= Aw * 1.8 && maxGap > minGap) {
      gap = Math.max(minGap, Math.min(maxGap, Math.round(Ah * 0.025)));
    }

    // Context object passed to evaluation
    const evalContext = {
      W, H, Aw, Ah, N,
      minIconSize, maxIconSize, preferredIconSize,
      minGap, maxGap, gap,
      aspectRatio, showTitles,
      previousLayout, weights, items: rawItems
    };

    // Enumerate candidate column counts c from 1 up to min(N, maxColumns)
    const upperColLimit = Math.min(N, maxColumns, Math.max(1, Math.floor((Aw + gap) / (minIconSize + gap)) || 1));
    const candidates = [];

    for (let c = 1; c <= upperColLimit; c++) {
      const r = Math.ceil(N / c);

      // Available space per cell
      const availCellW = (Aw - (c - 1) * gap) / c;
      const availCellH = (Ah - (r - 1) * gap) / r;

      const rawCellSize = Math.min(availCellW, availCellH / aspectRatio);
      const hasOverflow = availCellW <= 0 || availCellH <= 0 || rawCellSize < minIconSize;

      // Clamped visual icon size
      const iconSize = Math.max(minIconSize, Math.min(maxIconSize, Math.floor(rawCellSize)));

      // Occupied dimensions
      const W_occ = c * iconSize + (c - 1) * gap;
      const H_occ = r * Math.round(iconSize * aspectRatio) + (r - 1) * gap;
      const N_last = N - (r - 1) * c;

      const cand = {
        cols: c,
        rows: r,
        capacity: c * r,
        gap,
        rawCellSize,
        iconSize,
        W_occ,
        H_occ,
        N,
        N_last,
        hasOverflow,
        feasible: !hasOverflow,
      };

      const { totalScore, errors } = scoreCandidate(cand, evalContext);
      cand.score = totalScore;
      cand.errors = errors;
      candidates.push(cand);
    }

    // Separate feasible candidates from overflow candidates
    const feasibleCandidates = candidates.filter(c => !c.hasOverflow && c.W_occ <= Aw + 1 && c.H_occ <= Ah + 1);

    let best = null;
    if (feasibleCandidates.length > 0) {
      // Sort feasible candidates: lowest score first (deterministic tie-breaking)
      feasibleCandidates.sort((a, b) => {
        const diff = a.score - b.score;
        if (Math.abs(diff) > 1e-5) return diff;
        if (b.iconSize !== a.iconSize) return b.iconSize - a.iconSize;
        return a.cols - b.cols;
      });
      best = feasibleCandidates[0];
    } else {
      // Container cannot fit all N items at minIconSize:
      // Construct optimal bounded layout showing maximum items that fit without clipping
      const maxFitCols = Math.max(1, Math.min(N, maxColumns, Math.floor((Aw + gap) / (minIconSize + gap))));
      const maxFitRows = Math.max(1, Math.floor((Ah + gap) / (minIconSize * aspectRatio + gap)));
      const fallbackCandidates = [];

      for (let c = 1; c <= maxFitCols; c++) {
        for (let r = 1; r <= maxFitRows; r++) {
          const availCellW = (Aw - (c - 1) * gap) / c;
          const availCellH = (Ah - (r - 1) * gap) / r;
          const rawCellSize = Math.min(availCellW, availCellH / aspectRatio);
          if (rawCellSize < minIconSize) continue;

          const iconSize = Math.max(minIconSize, Math.min(maxIconSize, Math.floor(rawCellSize)));
          const W_occ = c * iconSize + (c - 1) * gap;
          const H_occ = r * Math.round(iconSize * aspectRatio) + (r - 1) * gap;
          if (W_occ > Aw + 1 || H_occ > Ah + 1) continue;

          const capacity = c * r;
          const visibleCount = Math.min(N, capacity);
          const cand = {
            cols: c,
            rows: r,
            capacity,
            gap,
            rawCellSize,
            iconSize,
            W_occ,
            H_occ,
            N: visibleCount,
            N_last: visibleCount - (r - 1) * c,
            hasOverflow: true,
            feasible: false, // indicates not all N items fit
          };
          const { totalScore, errors } = scoreCandidate(cand, evalContext);
          cand.score = totalScore + (N - visibleCount) * 0.05;
          cand.errors = errors;
          fallbackCandidates.push(cand);
        }
      }

      if (fallbackCandidates.length > 0) {
        fallbackCandidates.sort((a, b) => {
          // In overflow mode, prefer showing more items, then larger icons, then lowest score
          if (b.capacity !== a.capacity) return b.capacity - a.capacity;
          if (b.iconSize !== a.iconSize) return b.iconSize - a.iconSize;
          return a.score - b.score;
        });
        best = fallbackCandidates[0];
      } else {
        // Extreme constraint: scale cell to fit inside container
        const fitSize = Math.max(12, Math.min(maxIconSize, Math.floor(Math.min(Aw, Ah / aspectRatio))));
        best = {
          cols: 1,
          rows: 1,
          capacity: 1,
          gap,
          rawCellSize: fitSize,
          iconSize: fitSize,
          W_occ: fitSize,
          H_occ: fitSize,
          N: 1,
          N_last: 1,
          hasOverflow: true,
          feasible: false,
          score: 999,
        };
      }
    }

    // Compute slot and border radii proportionally
    const slotRadius = Math.max(6, Math.min(14, Math.round(best.iconSize * 0.25)));
    const titleFontSize = Math.max(8.5, Math.min(11, Math.round(best.iconSize * 0.22)));

    // Incomplete final row centering check
    const isLastRowIncomplete = best.rows > 1 && best.N_last < best.cols;
    const lastRowCentered = isLastRowIncomplete;

    // Relative Cartesian positioning for every item within the container
    const cellW = best.iconSize;
    const cellH = Math.round(best.iconSize * aspectRatio);

    // Compute grid origin to center the occupied block inside container
    const startX = padding.left + Math.max(0, Math.floor((Aw - best.W_occ) / 2));
    const startY = padding.top + Math.max(0, Math.floor((Ah - best.H_occ) / 2));

    // Width of the last incomplete row (if centered)
    const lastRowWidth = best.N_last * cellW + (best.N_last - 1) * gap;
    const lastRowStartX = padding.left + Math.max(0, Math.floor((Aw - lastRowWidth) / 2));

    const positions = [];
    const visibleCount = Math.min(N, best.capacity);
    const overflowCount = Math.max(0, N - visibleCount);

    for (let idx = 0; idx < visibleCount; idx++) {
      const col = idx % best.cols;
      const row = Math.floor(idx / best.cols);
      const isLastRow = row === (best.rows - 1);

      let itemX;
      if (isLastRow && lastRowCentered) {
        itemX = lastRowStartX + col * (cellW + gap);
      } else {
        itemX = startX + col * (cellW + gap);
      }
      const itemY = startY + row * (cellH + gap);

      const itemRef = rawItems[idx];
      const id = (itemRef && (itemRef.id || itemRef.key)) ? (itemRef.id || itemRef.key) : `slot_${idx}`;

      positions.push({
        id,
        index: idx,
        col,
        row,
        x: Math.round(itemX),
        y: Math.round(itemY),
        width: cellW,
        height: cellH,
        isLastRow,
        isLastRowCentered: isLastRow && lastRowCentered,
      });
    }

    return {
      feasible: best.feasible !== false,
      cols: best.cols,
      rows: best.rows,
      capacity: best.capacity,
      cellSize: best.iconSize,
      iconSize: best.iconSize,
      artSize: best.iconSize,
      slotRadius,
      titleFontSize,
      gap: best.gap,
      gapX: best.gap,
      gapY: best.gap,
      gridWidth: best.W_occ,
      gridHeight: best.H_occ,
      padding,
      availableWidth: Aw,
      availableHeight: Ah,
      positions,
      items: positions,
      visibleCount,
      overflowCount,
      lastRowCentered,
      centerLastRow: lastRowCentered,
      score: best.score,
      allCandidates: candidates.map(c => ({ cols: c.cols, rows: c.rows, iconSize: c.iconSize, score: Math.round(c.score * 100) / 100 })),
    };
  }

  return {
    calculateAdaptiveLayout,
    scoreCandidate,
    evaluateLayoutCandidate: scoreCandidate,
    normalizePadding,
    DEFAULT_CONFIG,
    DEFAULT_WEIGHTS,
  };
});
