# ADR 0001: Pointer Gesture Driven Window Bounds vs Native Drag Regions

## Context
Electron applications traditionally use `-webkit-app-region: drag` for frameless window dragging. However, native OS dragging swallows pointer events, prevents hover inspection and drop targeting, and allows Windows DWM to push widgets completely offscreen.

## Decision
Drive window movement and resizing exclusively through pointer capture in renderers (`shell.js`), sending throttled IPC coordinates (`win:dragMove`, `win:resizeMove`) to the main process, which enforces pure geometric screen clamping before calling `win.setBounds(next, false)`.

## Consequences
* **Positive**: Full control over collision avoidance, screen bounds clamping, magnetic grid snapping, and hover targeting (e.g. dragging onto folders).
* **Trade-off**: Requires careful rAF throttling in `shell.js` to avoid IPC message flooding on high-polling mice.
