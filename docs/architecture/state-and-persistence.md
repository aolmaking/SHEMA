# State & Persistence Architecture

## 1. Storage Tiers

1. **Transient State**:
   * Active gesture tracking (`gestures` Map in main process).
   * Hover timers, drop targets, proxy ghost coordinates.
   * Managed in memory; discarded immediately when gesture ends or cancels.

2. **Durable Configuration & State**:
   * Stored in `%APPDATA%\MirqatWidgets\settings.json`.
   * Managed by `Store` ([src/core/store.js](file:///e:/shamela4/mirqat-widgets/src/core/store.js)).
   * Write strategy: Atomic writes with safe replacement to avoid corruption during unexpected system power loss.

3. **Domain Stores**:
   * Habits data: `userData/habits.json`
   * Calendar events & Day notes: `userData/calendar-events.json`
   * Todos: `userData/todos.json`
   * Offline Seed Cache: `seed/cache/` (read-only fallbacks, never overwritten).

---

## 2. Invariants

* Never write to disk inside a `mousemove` / `pointermove` loop.
* Settings changes emit `settings:changed` IPC event only when values actually change.
