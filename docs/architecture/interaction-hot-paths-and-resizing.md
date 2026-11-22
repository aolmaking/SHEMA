# Interaction Hot Paths & Resizing Architecture

## 1. The Interaction Problem & Challenge

Desktop widgets in Mirqat Widgets are frameless transparent windows with multi-layered glassmorphism (`backdrop-filter: blur`, saturated borders, diffuse ambient shadows).
During interactive dragging and resizing, naive architectures suffer from:
1. **Style recalculation storms** caused by universal selectors (`* { transition: none }`).
2. **Backdrop-filter re-rasterization** overhead on every subpixel window bounds change.
3. **IPC message flooding** if high-polling gaming mice (1000Hz) send pointer events faster than the display monitor refresh rate (60Hz/120Hz).
4. **Layout thrashing** if script reads DOM geometry immediately after modifying styles.

---

## 2. Engineered Hot Path Pipeline

```
[Raw Pointer Event]
       │
       ▼
[shell.js queue()] ───> Throttled via single requestAnimationFrame
       │
       ▼ (at most once per frame)
[IPC win:resizeMove / win:dragMove]
       │
       ▼
[main.js geo.resizeFrom / geo.clampToArea] ───> Pure Integer Geometry Clamping
       │
       ▼
[win.setBounds(next, false)] ───> Hardware direct positioning (animate: false)
       │
       ▼
[Renderer Resize Event] ───> CSS Container Queries handle children without JS
```

---

## 3. Critical Rules for the Hot Path

1. **Transient vs. Durable Separation**:
   * Continuous mouse movements MUST NEVER trigger `fs.writeFileSync` or broad `settings:changed` IPC broadcasts.
   * `win.setBounds` updates only the native window geometry.
   * Settings persistence occurs exclusively on `win:gestureEnd`.

2. **Zero-Lag Visual Mode (`body.resizing`)**:
   * When `.grip` or `.rz` is clicked, `body.classList.add('resizing')` is immediately engaged.
   * Children pointer events are disabled (`pointer-events: none`).
   * Heavy dynamic light overlays (`.sheen`, `.plate::after`) are hidden.
   * FLIP animations are suppressed to prevent conflicting transform overrides.

3. **Pointer Capture**:
   * Always call `setPointerCapture(e.pointerId)` on the active grip so rapid mouse gestures never lose focus even if the pointer momentarily drifts outside the window boundary.
   * Release pointer capture on `pointerup` and clean up `body.resizing`.
