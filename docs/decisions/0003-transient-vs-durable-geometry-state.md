# ADR 0003: Strict Separation of Transient and Durable Geometry State

## Context
Writing window positions to disk or broadcasting global state updates during continuous dragging/resizing causes severe main-thread I/O stalls, dropped frames, and input latency.

## Decision
Strictly separate transient geometry updates from durable persistence:
* **Transient**: Live pointer position and temporary window bounds are held in memory during the gesture.
* **Durable**: Positions and sizes are snapped and committed to disk storage ONLY when `win:gestureEnd` fires.

## Consequences
* **Positive**: Maintains 60fps/120fps hardware interaction speed with zero disk I/O during mouse drag.
* **Trade-off**: If the entire computer loses power mid-drag, the in-flight gesture is lost (falling back to the last committed position), which matches native operating system desktop behavior.
