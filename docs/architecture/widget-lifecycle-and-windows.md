# Widget Lifecycle & Window Management Architecture

## 1. Overview

Mirqat Widgets uses Electron `BrowserWindow` instances for each widget. Each window is independent, frameless, and isolated via contextBridge (`preload.js`).

---

## 2. Window Modes & States

1. **Standard Widget Mode**:
   * Normal floating window with plate glass background.
   * Can be moved and resized within desktop work area boundaries.
   * Minimum bounds: enforced per widget type (e.g., `[120, 120]`).

2. **Mini App Icon Mode (`data-app-icon="1"`)**:
   * Compact 48px desktop icon matching native Windows desktop icon scale.
   * Background plate becomes transparent; icon artwork is presented cleanly.
   * Free placement or snapped to 75x75px desktop grid.
   * Cannot be resized from corners (resize grip is hidden).

3. **Dormant Mode (`data-dormant="1"`)**:
   * Activated when widget is hidden, minimized, or during lock screen (`sleepOnLock`).
   * Background polling and DOM timers are suspended to conserve battery and GPU cycles.

---

## 3. Window Destruction & Re-creation Safeguards

* Windows are registered in the `windows` Map in [main.js](file:///e:/shamela4/mirqat-widgets/main.js).
* Always check `win && !win.isDestroyed()` before sending IPC or reading bounds.
* Closing a widget hides it by default unless permanently deleted; position and preferences survive restarts.
