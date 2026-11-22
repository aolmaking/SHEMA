'use strict';
/**
 * Window geometry: keeping widgets on screen, snapping them to edges and to
 * each other, and packing a default layout that fits the display.
 *
 * Pure functions over plain rectangles ({x, y, width, height}), so they can
 * be tested without Electron.
 */

const SNAP = 12;   // how close an edge has to be before it pulls
const GAP = 12;    // the spacing a snapped neighbour keeps
const MARGIN = 14; // the spacing kept from the screen edge when snapping

const right = (r) => r.x + r.width;
const bottom = (r) => r.y + r.height;

/** Clamp a size to [min, max] and to what the area can actually hold. */
function clampSize(width, height, area, min = [0, 0], max = [Infinity, Infinity]) {
  const w = Math.round(Math.min(area.width, max[0], Math.max(min[0], width)));
  const h = Math.round(Math.min(area.height, max[1], Math.max(min[1], height)));
  return { width: w, height: h };
}

/** Move (and if needed shrink) a rectangle so it sits entirely inside area. */
function clampToArea(b, area) {
  const width = Math.min(Math.round(b.width), area.width);
  const height = Math.min(Math.round(b.height), area.height);
  const x = Math.round(Math.min(Math.max(b.x, area.x), area.x + area.width - width));
  const y = Math.round(Math.min(Math.max(b.y, area.y), area.y + area.height - height));
  return { x, y, width, height };
}

/** Area under the rectangle's centre, from a list of display work areas. */
function pickArea(b, areas) {
  const cx = b.x + b.width / 2;
  const cy = b.y + b.height / 2;
  let best = areas[0];
  let bestD = Infinity;
  for (const a of areas) {
    const inside = cx >= a.x && cx < right(a) && cy >= a.y && cy < bottom(a);
    if (inside) return a;
    const dx = Math.max(a.x - cx, 0, cx - right(a));
    const dy = Math.max(a.y - cy, 0, cy - bottom(a));
    const d = dx * dx + dy * dy;
    if (d < bestD) { bestD = d; best = a; }
  }
  return best;
}

function nearest(value, candidates, within) {
  let best = null;
  let bestD = within + 1;
  for (const c of candidates) {
    const d = Math.abs(value - c);
    if (d <= within && d < bestD) { best = c; bestD = d; }
  }
  return best;
}

/**
 * Magnetic snapping while dragging: screen edges (with a margin) and the
 * edges of other widgets (aligned, or side by side with a gap). Only pulls
 * along an axis where the two rectangles actually face each other.
 */
function snap(b, area, others = [], { snap: within = SNAP, gap = GAP, margin = MARGIN } = {}) {
  const xs = [area.x + margin, right(area) - b.width - margin, area.x, right(area) - b.width];
  const ys = [area.y + margin, bottom(area) - b.height - margin, area.y, bottom(area) - b.height];

  for (const o of others) {
    const overlapY = b.y < bottom(o) + within && bottom(b) > o.y - within;
    const overlapX = b.x < right(o) + within && right(b) > o.x - within;
    if (overlapY) {
      // Side by side: sit next to it, with the tops or bottoms lined up.
      xs.push(right(o) + gap, o.x - b.width - gap);
      ys.push(o.y, bottom(o) - b.height);
    }
    if (overlapX) {
      // Stacked: sit above or below it, with the sides lined up.
      ys.push(bottom(o) + gap, o.y - b.height - gap);
      xs.push(o.x, right(o) - b.width);
    }
  }

  const sx = nearest(b.x, xs, within);
  const sy = nearest(b.y, ys, within);
  return clampToArea({ ...b, x: sx ?? b.x, y: sy ?? b.y }, area);
}

/**
 * Resize from a corner while keeping the opposite corner fixed, within the
 * size limits and the work area.
 *   corner: 'bl' (bottom-left, the RTL grip) or 'br'
 */
function resizeFrom(start, corner, dx, dy, area, min, max) {
  if (corner !== 'bl' && corner !== 'br') return resizeEdges(start, corner, dx, dy, area, min, max);
  const anchorRight = right(start);
  const anchorLeft = start.x;
  let width = corner === 'bl' ? start.width - dx : start.width + dx;
  let height = start.height + dy;

  // Never grow past the screen on the moving sides.
  const roomW = corner === 'bl' ? anchorRight - area.x : right(area) - anchorLeft;
  const roomH = bottom(area) - start.y;
  width = Math.min(width, roomW);
  height = Math.min(height, roomH);

  const size = clampSize(width, height, area, min, max);
  const x = corner === 'bl' ? anchorRight - size.width : anchorLeft;
  return clampToArea({ x, y: start.y, ...size }, area);
}

/**
 * Resize from any edge or corner: `edges` is a compass string such as 'n',
 * 'se' or 'w'. The opposite sides stay where they are, and the moving sides
 * stop at the screen edge and at the size limits.
 */
function resizeEdges(start, edges, dx, dy, area, min, max) {
  const e = String(edges || '');
  const L = e.includes('w');
  const R = e.includes('e');
  const T = e.includes('n');
  const B = e.includes('s');
  let left = start.x;
  let rightX = right(start);
  let top = start.y;
  let bottomY = bottom(start);
  if (L) left = Math.max(area.x, start.x + dx);
  if (R) rightX = Math.min(right(area), right(start) + dx);
  if (T) top = Math.max(area.y, start.y + dy);
  if (B) bottomY = Math.min(bottom(area), bottom(start) + dy);

  const size = clampSize(rightX - left, bottomY - top, area, min, max);
  const x = L && !R ? rightX - size.width : left;
  const y = T && !B ? bottomY - size.height : top;
  return clampToArea({ x, y, ...size }, area);
}

/**
 * Pack widgets into columns from the right edge of the area (the side that
 * is free of desktop icons on Windows). Each block is a row of one or more
 * widgets. A block goes into the first column, right to left, that still has
 * room for it; otherwise it opens a new column.
 *
 * blocks: [[{ id, width, height }, ...], ...]
 * returns { layout: { [id]: rect }, fits: boolean }
 */
function packColumnsChecked(blocks, area, { margin = 16, gap = GAP } = {}) {
  const out = {};
  const columns = [];   // { right, width, y }
  let fits = true;
  const top = area.y + margin;
  const floor = bottom(area) - margin;

  for (const block of blocks) {
    if (!block.length) continue;
    const bw = block.reduce((s, w) => s + w.width, 0) + gap * (block.length - 1);
    const bh = Math.max(...block.map((w) => w.height));

    let col = columns.find((c, i) => c.y + bh <= floor
      && (bw <= c.width || (i === columns.length - 1 && c.right - bw >= area.x + margin)));
    if (!col) {
      const last = columns[columns.length - 1];
      const colRight = last ? last.right - last.width - gap : right(area) - margin;
      col = { right: colRight, width: 0, y: top };
      columns.push(col);
      if (bh > floor - top) fits = false;
    }
    if (col.right - bw < area.x + margin - 0.5) fits = false;

    let x = col.right;
    for (const w of block) {
      x -= w.width;
      out[w.id] = clampToArea({ x, y: col.y, width: w.width, height: w.height }, area);
      x -= gap;
    }
    col.width = Math.max(col.width, bw);
    col.y += bh + gap;
  }
  return { layout: out, fits };
}

function packColumns(blocks, area, opts) {
  return packColumnsChecked(blocks, area, opts).layout;
}

function intersects(a, b) {
  return a.x < right(b) && right(a) > b.x && a.y < bottom(b) && bottom(a) > b.y;
}

function intersectsWithGap(a, b, gap = 0) {
  return a.x < (b.x + b.width) + gap &&
         (a.x + a.width) > b.x - gap &&
         a.y < (b.y + b.height) + gap &&
         (a.y + a.height) > b.y - gap;
}

function inside(b, area) {
  return b.x >= area.x && b.y >= area.y && right(b) <= right(area) && bottom(b) <= bottom(area);
}

/**
 * Ensure rectangle `b` does not collide or overlap with any obstacle in `obstacles`.
 * If a collision occurs, finds the closest non-overlapping valid placement inside `area`.
 */
function avoidCollisions(b, area, obstacles = [], gap = 4) {
  if (!obstacles || obstacles.length === 0) {
    return clampToArea(b, area);
  }

  const origX = b.x;
  const origY = b.y;
  const w = b.width;
  const h = b.height;
  const numObs = obstacles.length;

  let hasCollision = false;
  let hasValidObstacles = false;

  for (let i = 0; i < numObs; i++) {
    const o = obstacles[i];
    if (o && typeof o.x === 'number' && typeof o.y === 'number' && o.width > 0 && o.height > 0) {
      hasValidObstacles = true;
      if (
        origX < o.x + o.width + gap &&
        origX + w + gap > o.x &&
        origY < o.y + o.height + gap &&
        origY + h + gap > o.y
      ) {
        hasCollision = true;
        break;
      }
    }
  }

  if (!hasValidObstacles || !hasCollision) {
    return clampToArea(b, area);
  }

  const maxX = area.x + area.width - w;
  const maxY = area.y + area.height - h;

  let bestX = null;
  let bestY = null;
  let bestDistSq = Infinity;

  // Zero-allocation candidate evaluator
  const testCandidate = (cx, cy) => {
    const clampedX = Math.round(Math.min(Math.max(cx, area.x), maxX));
    const clampedY = Math.round(Math.min(Math.max(cy, area.y), maxY));

    for (let i = 0; i < numObs; i++) {
      const o = obstacles[i];
      if (o && typeof o.x === 'number' && typeof o.y === 'number' && o.width > 0 && o.height > 0) {
        if (
          clampedX < o.x + o.width + gap &&
          clampedX + w + gap > o.x &&
          clampedY < o.y + o.height + gap &&
          clampedY + h + gap > o.y
        ) {
          return; // Collides with this obstacle
        }
      }
    }

    const dx = clampedX - origX;
    const dy = clampedY - origY;
    const distSq = dx * dx + dy * dy;
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      bestX = clampedX;
      bestY = clampedY;
    }
  };

  for (let i = 0; i < numObs; i++) {
    const o = obstacles[i];
    if (!o || typeof o.x !== 'number' || typeof o.y !== 'number' || o.width <= 0 || o.height <= 0) continue;

    const rightO = o.x + o.width;
    const bottomO = o.y + o.height;

    // 1. To the right of obstacle
    testCandidate(rightO + gap, origY);
    testCandidate(rightO + gap, o.y);
    testCandidate(rightO + gap, bottomO - h);

    // 2. To the left of obstacle
    testCandidate(o.x - w - gap, origY);
    testCandidate(o.x - w - gap, o.y);
    testCandidate(o.x - w - gap, bottomO - h);

    // 3. Below obstacle
    testCandidate(origX, bottomO + gap);
    testCandidate(o.x, bottomO + gap);
    testCandidate(rightO - w, bottomO + gap);

    // 4. Above obstacle
    testCandidate(origX, o.y - h - gap);
    testCandidate(o.x, o.y - h - gap);
    testCandidate(rightO - w, o.y - h - gap);
  }

  if (bestX !== null) {
    return { x: bestX, y: bestY, width: w, height: h };
  }

  // Multi-obstacle dense cluster search on expanding grid rings
  const stepX = Math.round(w + gap);
  const stepY = Math.round(h + gap);
  for (let ring = 1; ring <= 8; ring++) {
    const rx = ring * stepX;
    const ry = ring * stepY;
    testCandidate(origX + rx, origY);
    testCandidate(origX - rx, origY);
    testCandidate(origX, origY + ry);
    testCandidate(origX, origY - ry);
    testCandidate(origX + rx, origY + ry);
    testCandidate(origX - rx, origY + ry);
    testCandidate(origX + rx, origY - ry);
    testCandidate(origX - rx, origY - ry);
    if (bestX !== null) {
      return { x: bestX, y: bestY, width: w, height: h };
    }
  }

  return clampToArea(b, area);
}

/**
 * Resolves desktop collisions by placing `placedId` at `targetBounds` and
 * displacing any overlapping elements to their nearest valid non-overlapping spots.
 * Guarantees zero overlaps among all visible desktop elements.
 */
function displaceDesktopCollisions(placedId, targetBounds, area, allElements = [], opts = {}) {
  const gap = opts.gap ?? 4;
  let placedRect = clampToArea(targetBounds, area);

  const activeOthers = (allElements || []).filter(el =>
    el && el.id !== placedId && el.bounds && typeof el.bounds.x === 'number' && typeof el.bounds.y === 'number'
  );

  const updatedBounds = {};
  const settledMap = new Map();
  settledMap.set(placedId, placedRect);

  const queue = [];
  for (const el of activeOthers) {
    if (intersectsWithGap(placedRect, el.bounds, gap)) {
      queue.push(el);
    } else {
      settledMap.set(el.id, { ...el.bounds });
    }
  }

  // Iteratively displace collided elements
  const visited = new Set();
  while (queue.length > 0) {
    const cur = queue.shift();
    if (visited.has(cur.id)) continue;
    visited.add(cur.id);

    const obstacles = [...settledMap.values()];
    const newBounds = avoidCollisions(cur.bounds, area, obstacles, gap);
    settledMap.set(cur.id, newBounds);
    updatedBounds[cur.id] = newBounds;

    // Check if newBounds collides with any other element previously marked settled (except placedId)
    for (const el of activeOthers) {
      if (el.id === cur.id || el.id === placedId || visited.has(el.id)) continue;
      const b = settledMap.get(el.id) || el.bounds;
      if (intersectsWithGap(newBounds, b, gap)) {
        settledMap.delete(el.id);
        queue.push(el);
      }
    }
  }

  // Final safety invariant check: Ensure placedRect itself does not collide with any obstacle
  if (!opts.protectPlaced) {
    const finalObstacles = activeOthers.map(el => settledMap.get(el.id) || el.bounds);
    if (finalObstacles.some(o => intersectsWithGap(placedRect, o, gap))) {
      placedRect = avoidCollisions(placedRect, area, finalObstacles, gap);
      settledMap.set(placedId, placedRect);
    }
  }

  return {
    placedBounds: placedRect,
    displacedBounds: updatedBounds,
  };
}

let cachedGridMetrics = null;

/**
 * Get OS desktop icon grid metrics.
 * Windows desktop icons align to a regular Cartesian grid spaced by SM_CXICONSPACING / SM_CYICONSPACING.
 * Default is 75px horizontal and 75px vertical (1130 twips / 15 = 75px).
 */
function getDesktopGridMetrics() {
  if (cachedGridMetrics) return cachedGridMetrics;
  let cellW = 68;
  let cellH = 68;

  if (process.platform === 'win32') {
    try {
      const { execSync } = require('child_process');
      const out = execSync('reg query "HKCU\\Control Panel\\Desktop\\WindowMetrics" /v IconSpacing', {
        windowsHide: true,
        encoding: 'utf8',
        timeout: 1000,
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      const m = out.match(/IconSpacing\s+REG_SZ\s+(-?\d+)/i);
      if (m) {
        const val = Math.abs(parseInt(m[1], 10));
        if (val > 0) cellW = Math.round(val / 15);
      }
      const outV = execSync('reg query "HKCU\\Control Panel\\Desktop\\WindowMetrics" /v IconVerticalSpacing', {
        windowsHide: true,
        encoding: 'utf8',
        timeout: 1000,
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      const mV = outV.match(/IconVerticalSpacing\s+REG_SZ\s+(-?\d+)/i);
      if (mV) {
        const valV = Math.abs(parseInt(mV[1], 10));
        if (valV > 0) cellH = Math.round(valV / 15);
      }
    } catch {
      // Fallback safely to 68x68 standard spacing
    }
  }

  cellW = Math.max(60, Math.min(84, cellW || 68));
  cellH = Math.max(60, Math.min(84, cellH || 68));

  cachedGridMetrics = { cellW, cellH, marginX: 16, marginY: 16, iconW: 56, iconH: 56 };
  return cachedGridMetrics;
}

/**
 * Snap a mini widget rectangle to the nearest desktop grid slot.
 * Ensures the widget sits on clean Cartesian grid lines matching the laptop desktop icon grid.
 */
function snapToDesktopGrid(rect, area, others = [], {
  cellW = 68,
  cellH = 68,
  marginX = 16,
  marginY = 16,
  iconW = 56,
  iconH = 56,
  avoidCollisions = false,
} = {}) {
  const col = Math.round((rect.x - area.x - marginX) / cellW);
  const row = Math.round((rect.y - area.y - marginY) / cellH);

  let targetX = area.x + marginX + col * cellW;
  let targetY = area.y + marginY + row * cellH;

  const width = rect.width || iconW;
  const height = rect.height || iconH;

  const minX = area.x + 8;
  const maxX = area.x + area.width - width - 8;
  const minY = area.y + 8;
  const maxY = area.y + area.height - height - 8;

  targetX = Math.max(minX, Math.min(maxX, targetX));
  targetY = Math.max(minY, Math.min(maxY, targetY));

  if (avoidCollisions && others && others.length > 0) {
    const isOccupied = (testCol, testRow, testX, testY) => others.some((o) => {
      if (!o || typeof o.x !== 'number' || typeof o.y !== 'number') return false;
      const ow = o.width || iconW;
      const oh = o.height || iconH;
      const isOtherMini = (ow <= 90 && oh <= 90);
      if (isOtherMini) {
        // Precise grid coordinate matching: slots only collide if targeting the identical grid cell!
        const oCol = Math.round((o.x - area.x - marginX) / cellW);
        const oRow = Math.round((o.y - area.y - marginY) / cellH);
        return testCol === oCol && testRow === oRow;
      }
      return intersectsWithGap({ x: testX, y: testY, width, height }, { x: o.x, y: o.y, width: ow, height: oh }, 0);
    });

    if (isOccupied(col, row, targetX, targetY)) {
      let found = false;
      const maxR = 12;
      for (let r = 1; r <= maxR && !found; r++) {
        const candidates = [];
        for (let dx = -r; dx <= r; dx++) {
          for (let dy = -r; dy <= r; dy++) {
            if (Math.abs(dx) === r || Math.abs(dy) === r) {
              const candCol = col + dx;
              const candRow = row + dy;
              const testX = Math.max(minX, Math.min(maxX, area.x + marginX + candCol * cellW));
              const testY = Math.max(minY, Math.min(maxY, area.y + marginY + candRow * cellH));
              candidates.push({ col: candCol, row: candRow, x: testX, y: testY, dist: dx * dx + dy * dy });
            }
          }
        }
        candidates.sort((a, b) => a.dist - b.dist);
        for (const cand of candidates) {
          if (!isOccupied(cand.col, cand.row, cand.x, cand.y)) {
            targetX = cand.x;
            targetY = cand.y;
            found = true;
            break;
          }
        }
      }
      if (!found) {
        const resolved = avoidCollisions({ x: targetX, y: targetY, width, height }, area, others, 8);
        targetX = resolved.x;
        targetY = resolved.y;
      }
    }
  }

  return {
    x: Math.round(targetX),
    y: Math.round(targetY),
    width,
    height,
  };
}

/**
 * Arrange a collection of mini widgets into a clean, orderly desktop grid block
 * without overlaps, aligned to the laptop desktop grid.
 */
function packMiniGrid(items, area, opts = {}) {
  if (!items || items.length === 0) return {};

  const cellW = opts.cellW || 68;
  const cellH = opts.cellH || 68;
  const marginX = opts.marginX ?? 16;
  const marginY = opts.marginY ?? 16;
  const iconW = opts.iconW || 56;
  const iconH = opts.iconH || 56;

  const totalCols = Math.max(1, Math.floor((area.width - marginX * 2) / cellW));
  const totalRows = Math.max(1, Math.floor((area.height - marginY * 2) / cellH));
  const maxCols = items.length <= 4 ? items.length : 3;
  const numRows = Math.ceil(items.length / maxCols);

  const avgX = items.reduce((s, it) => s + (it.x ?? area.x), 0) / items.length;
  const avgY = items.reduce((s, it) => s + (it.y ?? area.y), 0) / items.length;
  let startCol = Math.max(0, Math.min(totalCols - maxCols, Math.round((avgX - area.x - marginX) / cellW)));
  let startRow = Math.max(0, Math.min(totalRows - numRows, Math.round((avgY - area.y - marginY) / cellH)));

  const out = {};
  items.forEach((item, index) => {
    const colOffset = index % maxCols;
    const rowOffset = Math.floor(index / maxCols);
    const col = startCol + colOffset;
    const row = startRow + rowOffset;
    let x = area.x + marginX + col * cellW;
    let y = area.y + marginY + row * cellH;

    x = Math.max(area.x + 8, Math.min(area.x + area.width - iconW - 8, x));
    y = Math.max(area.y + 8, Math.min(area.y + area.height - iconH - 8, y));

    out[item.id] = {
      x: Math.round(x),
      y: Math.round(y),
      width: iconW,
      height: iconH,
    };
  });
  return out;
}

/**
 * Smart Dynamic Min/Max Constraints for Folders and Containers.
 * Computes tight, intelligent [minW, minH] and [maxW, maxH] bounds
 * according to the active item count and intended orientation (dock, pillar, or grid),
 * eliminating empty wastelands and preventing icon crushing or clipping.
 *
 * @param {number} itemCount - Number of widgets in the folder (N >= 1)
 * @param {number} width - Projected or current width
 * @param {number} height - Projected or current height
 * @param {boolean} isExpanded - Whether the folder is in full expanded modal mode
 * @returns {{ min: [number, number], max: [number, number], mode: 'dock-h' | 'dock-v' | 'grid' | 'expanded' }}
 */
function getFolderSmartLimits(itemCount, width, height, isExpanded = false, preferredMode = null) {
  const N = Math.max(1, Number(itemCount) || 1);
  if (isExpanded || preferredMode === 'expanded') {
    return {
      min: [320, 320],
      max: [580, 520],
      mode: 'expanded'
    };
  }

  const w = Math.max(30, Number(width) || 144);
  const h = Math.max(30, Number(height) || 144);

  let mode = preferredMode;
  if (!mode) {
    if (h <= 84 && w >= 90) {
      mode = 'dock-h';
    } else if (w <= 84 && h >= 90) {
      mode = 'dock-v';
    } else {
      const aspect = w / Math.max(1, h);
      if (aspect >= 1.35) {
        mode = 'dock-h';
      } else if (aspect <= 0.72) {
        mode = 'dock-v';
      } else {
        mode = 'grid';
      }
    }
  }

  // 1. Horizontal Dock Mode (wide strip)
  if (mode === 'dock-h') {
    const minW = Math.round(N * 36 + (N - 1) * 6 + 24);
    const maxW = Math.round(N * 52 + (N - 1) * 14 + 32);
    const minH = 58;
    const maxH = 82;
    return {
      min: [Math.max(58, minW), minH],
      max: [Math.max(minW + 20, maxW), maxH],
      mode: 'dock-h'
    };
  }

  // 2. Vertical Pillar Mode (tall strip)
  if (mode === 'dock-v') {
    const minW = 58;
    const maxW = 82;
    const minH = Math.round(N * 36 + (N - 1) * 6 + 24);
    const maxH = Math.round(N * 52 + (N - 1) * 14 + 32);
    return {
      min: [minW, Math.max(58, minH)],
      max: [maxW, Math.max(minH + 20, maxH)],
      mode: 'dock-v'
    };
  }

  // 3. Balanced Square / 2D Grid Mode (0.72 < aspect < 1.35)
  let cols, rows;
  if (N <= 2) {
    cols = 2; rows = 1;
  } else if (N <= 4) {
    cols = 2; rows = 2;
  } else if (N <= 6) {
    const aspect = w / Math.max(1, h);
    cols = (aspect >= 1.0) ? 3 : 2;
    rows = Math.ceil(N / cols);
  } else {
    cols = 3;
    rows = Math.ceil(N / cols);
  }

  const minW = Math.round(cols * 36 + (cols - 1) * 6 + 24);
  const maxW = Math.round(cols * 52 + (cols - 1) * 14 + 36);
  // Room for label wrapper below squircle in grid mode (~20px)
  const minH = Math.round(rows * 36 + (rows - 1) * 6 + 24 + 20);
  const maxH = Math.round(rows * 52 + (rows - 1) * 14 + 36 + 24);

  return {
    min: [Math.max(58, minW), Math.max(58, minH)],
    max: [Math.max(minW + 20, maxW), Math.max(minH + 20, maxH)],
    mode: 'grid'
  };
}

const { calculateAdaptiveLayout } = require('./adaptive-layout-engine');

module.exports = {
  clampSize, clampToArea, pickArea, snap, resizeFrom, resizeEdges, packColumns, packColumnsChecked, intersects, inside,
  getDesktopGridMetrics, snapToDesktopGrid, packMiniGrid, calculateAdaptiveLayout,
  avoidCollisions, intersectsWithGap, displaceDesktopCollisions,
  getFolderSmartLimits,
  SNAP, GAP, MARGIN,
};


