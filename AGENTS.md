# AGENTS.md — Engineering Rules and Repository Intelligence for AI Coding Agents

> **Project**: Mirqat Widgets (ORVIX Desktop Widget Ecosystem)  
> **Runtime**: Electron (Main Process + Isolated BrowserWindows via `preload.js`)  
> **Platform**: Windows 10/11 (win32)  
> **Core Architecture**: Native glassmorphism frameless widgets with pure geometry calculation, adaptive layout optimization, and IPC-driven hardware gesture tracking.

---

## 1. Core Operating Principles (Non-Negotiable)

1. **Inspect Before Modifying**: Never assume a file is irrelevant or assume how an API works. Always inspect imports, exports, event listeners, and styles.
2. **Never Break Working Invariants**:
   - Never lose widget identity: All items must have stable keys (`data-id`).
   - Frameless windows use `frame: false, transparent: true, skipTaskbar: true`.
   - Native `-webkit-app-region: drag` is deliberately avoided on widget plates; gestures are driven by pointer events (`pointerdown`, `pointermove`, `pointerup`) with IPC `win:dragStart`, `win:dragMove`, `win:resizeStart`, `win:resizeMove`, `win:gestureEnd`.
   - Never perform synchronous disk I/O in the hot path of dragging or resizing.
   - Atomic persistence: Configuration and window positions are committed on `gestureEnd`, debounced, or batched.
3. **No Unnecessary Dependencies**: Do not introduce heavy UI frameworks (React, Vue, Tailwind) into this vanilla JS/CSS architecture unless explicitly requested. Preserve the ultra-lean, instant-load vanilla stack.
4. **Respect User Motion & Accessibility**: Always honor `@media (prefers-reduced-motion: reduce)` and provide keyboard/focus accessibility.
5. **Durable Knowledge First**: Consult `ARCHITECTURE.md` and `docs/architecture/` before attempting structural modifications.

---

## 2. Essential File Navigation Map

| Domain / Subsystem | Authoritative Source Files |
| :--- | :--- |
| **Electron Main Process** | [main.js](file:///e:/shamela4/mirqat-widgets/main.js) (Window creation, IPC hub, gestures, power state, menu, tray) |
| **IPC Bridge & Sandbox** | [preload.js](file:///e:/shamela4/mirqat-widgets/preload.js) (ContextBridge exposing `window.widgets`) |
| **Pure Geometry Engine** | [src/core/geometry.js](file:///e:/shamela4/mirqat-widgets/src/core/geometry.js) (Pure collision avoidance, clamping, resizing math, grid snapping) |
| **Adaptive Layout Optimizer** | [src/core/adaptive-layout-engine.js](file:///e:/shamela4/mirqat-widgets/src/core/adaptive-layout-engine.js) & [windows/js/adaptive-layout-engine.js](file:///e:/shamela4/mirqat-widgets/windows/js/adaptive-layout-engine.js) |
| **FLIP Motion Transitions** | [windows/js/flip-motion.js](file:///e:/shamela4/mirqat-widgets/windows/js/flip-motion.js) |
| **Common Shell & Gestures** | [windows/js/shell.js](file:///e:/shamela4/mirqat-widgets/windows/js/shell.js) (Pointer capture, rAF gesture queue, auto-sizing, sheen, dormancy) |
| **Core Base Styles & Glass** | [windows/css/base.css](file:///e:/shamela4/mirqat-widgets/windows/css/base.css) (Themes, glass plates, drag/resize performance states) |
| **Widget View & Logic** | [windows/folder.html](file:///e:/shamela4/mirqat-widgets/windows/folder.html), [windows/js/folder.js](file:///e:/shamela4/mirqat-widgets/windows/js/folder.js), [windows/css/folder.css](file:///e:/shamela4/mirqat-widgets/windows/css/folder.css) |
| **Settings Hub** | [windows/settings.html](file:///e:/shamela4/mirqat-widgets/windows/settings.html), [windows/js/settings.js](file:///e:/shamela4/mirqat-widgets/windows/js/settings.js), [windows/css/settings.css](file:///e:/shamela4/mirqat-widgets/windows/css/settings.css) |
| **Data Stores & Services** | [src/core/store.js](file:///e:/shamela4/mirqat-widgets/src/core/store.js), [src/core/paths.js](file:///e:/shamela4/mirqat-widgets/src/core/paths.js), [src/core/habits.js](file:///e:/shamela4/mirqat-widgets/src/core/habits.js), [src/core/email.js](file:///e:/shamela4/mirqat-widgets/src/core/email.js) |

---

## 3. High-Frequency Interaction Rules (Hot Path)

1. **Pointer Move Throttling**:
   - Pointer events in [windows/js/shell.js](file:///e:/shamela4/mirqat-widgets/windows/js/shell.js) queue updates via `requestAnimationFrame`. Never send IPC messages faster than display refresh rate.
2. **`body.resizing` & `body.dragging`**:
   - When active dragging or resizing begins, `body.classList.add('resizing')` is set.
   - Transitions, animations, pointer events on children, and heavy hover glows (`.sheen`, `.plate::after`) MUST be paused during resizing.
   - FLIP transitions are bypassed during active mouse dragging to guarantee 1:1 hardware synchronization without animation jitter.
3. **No Layout Thrashing**:
   - In renderers, do not alternate between reading geometry (`clientWidth`, `getBoundingClientRect()`) and writing styles in loops. Batch all reads first, then apply CSS custom properties.

---

## 4. Verification & Testing Commands

```powershell
# 1. Run Pure Smart Adaptive Layout Engine & Motion Test
node scripts/test_smart_adaptive_icon_container.js

# 2. Run Desktop Snapping & Geometry Tests
node scripts/test_snap_to_grid_toggle_and_regular_partitioning.js
node scripts/test_folder_collision_and_compact_size.js

# 3. Run Drag Out & Detachment Tests
node scripts/test_detach_and_drag_out_not_disappearing.js

# 4. Deploy updated code to installed Windows application
npm run install-app
```

---

## 5. Architectural Reference Links

- High-Level Architecture Overview: [ARCHITECTURE.md](file:///e:/shamela4/mirqat-widgets/ARCHITECTURE.md)
- Interaction Hot Paths & Resizing: [docs/architecture/interaction-hot-paths-and-resizing.md](file:///e:/shamela4/mirqat-widgets/docs/architecture/interaction-hot-paths-and-resizing.md)
- Widget Lifecycle & Window Management: [docs/architecture/widget-lifecycle-and-windows.md](file:///e:/shamela4/mirqat-widgets/docs/architecture/widget-lifecycle-and-windows.md)
- Geometry & Layout Engine: [docs/architecture/geometry-and-layout-engine.md](file:///e:/shamela4/mirqat-widgets/docs/architecture/geometry-and-layout-engine.md)
- Architectural Decision Records: [docs/decisions/](file:///e:/shamela4/mirqat-widgets/docs/decisions/)
