'use strict';
/**
 * Pomodoro timer engine.
 *
 * Lives in the main process so the countdown keeps going when the widget is
 * hidden or closed. Time is tracked as an absolute end timestamp rather than
 * a decrementing counter, so a sleeping laptop or a busy event loop can never
 * make the timer drift: whatever happens, the remaining time is endsAt - now.
 */

const { EventEmitter } = require('events');
const { Store } = require('./store');

const MODES = ['focus', 'short', 'long'];

const CONFIG_DEFAULTS = {
  label: 'مذاكرة',
  focus: 25,
  short: 5,
  long: 15,
  every: 4,          // focus sessions before a long break
  autoBreaks: true,
  autoFocus: false,
  sound: true,
  notify: true,
  volume: 0.6,
};

const LIMITS = {
  focus: [1, 180],
  short: [1, 60],
  long: [1, 90],
  every: [2, 12],
  volume: [0, 1],
};

function clampNum(v, [lo, hi], fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(hi, Math.max(lo, n));
}

function normalizeConfig(raw = {}) {
  const c = { ...CONFIG_DEFAULTS, ...(raw || {}) };
  for (const k of ['focus', 'short', 'long', 'every']) {
    c[k] = Math.round(clampNum(c[k], LIMITS[k], CONFIG_DEFAULTS[k]));
  }
  c.volume = clampNum(c.volume, LIMITS.volume, CONFIG_DEFAULTS.volume);
  c.label = String(c.label || CONFIG_DEFAULTS.label).trim().slice(0, 24) || CONFIG_DEFAULTS.label;
  for (const k of ['autoBreaks', 'autoFocus', 'sound', 'notify', 'ultraTransparent']) c[k] = Boolean(c[k]);
  return c;
}

function dayKey(ts = Date.now()) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

class Pomodoro extends EventEmitter {
  /**
   * @param {string} file          where the timer state is kept
   * @param {() => object} config  returns the current user configuration
   */
  constructor(file, config) {
    super();
    this.readConfig = config;
    this.store = new Store(file, {
      mode: 'focus',
      status: 'idle',      // idle | running | paused
      endsAt: null,        // set while running
      remaining: null,     // ms, set while idle or paused
      duration: null,      // ms, length of the current phase
      cycle: 0,            // focus sessions completed in this set
      days: {},            // 'YYYY-MM-DD' -> { sessions, focusMs }
    });
    this.timer = null;
  }

  get config() {
    return normalizeConfig(this.readConfig());
  }

  phaseMs(mode = this.store.data.mode) {
    return this.config[mode] * 60_000;
  }

  /** Bring a stored state up to date, e.g. after a restart or a sleep. */
  restore() {
    const s = this.store.data;
    if (!MODES.includes(s.mode)) s.mode = 'focus';
    if (s.status === 'running' && typeof s.endsAt === 'number') {
      if (s.endsAt <= Date.now()) this.complete({ quiet: true });
      else this.arm();
    } else if (s.status !== 'paused') {
      s.status = 'idle';
      s.endsAt = null;
      s.duration = this.phaseMs();
      s.remaining = s.duration;
    }
    this.store.save();
    return this.snapshot();
  }

  snapshot() {
    const s = this.store.data;
    const now = Date.now();
    const duration = s.duration || this.phaseMs();
    const remaining = s.status === 'running'
      ? Math.max(0, s.endsAt - now)
      : Math.max(0, s.remaining ?? duration);
    const today = s.days[dayKey()] || { sessions: 0, focusMs: 0 };
    return {
      mode: s.mode,
      status: s.status,
      endsAt: s.status === 'running' ? s.endsAt : null,
      remaining,
      duration,
      cycle: s.cycle,
      every: this.config.every,
      today: { ...today },
      config: this.config,
      now,
    };
  }

  arm() {
    clearTimeout(this.timer);
    const s = this.store.data;
    if (s.status !== 'running') return;
    // setTimeout caps at ~24.8 days; phases are far shorter, but re-arming in
    // slices also means a sleep never leaves us waiting on a stale timer.
    const delay = Math.min(Math.max(0, s.endsAt - Date.now()), 60_000);
    this.timer = setTimeout(() => {
      if (this.store.data.status !== 'running') return;
      if (Date.now() >= this.store.data.endsAt - 20) this.complete();
      else this.arm();
    }, delay);
  }

  changed() {
    this.store.save();
    const snap = this.snapshot();
    this.emit('change', snap);
    return snap;
  }

  start() {
    const s = this.store.data;
    if (s.status === 'running') return this.snapshot();
    const remaining = s.status === 'paused' ? s.remaining : (s.remaining ?? this.phaseMs());
    if (!s.duration) s.duration = this.phaseMs();
    s.status = 'running';
    s.endsAt = Date.now() + Math.max(1000, remaining);
    s.remaining = null;
    this.arm();
    return this.changed();
  }

  pause() {
    const s = this.store.data;
    if (s.status !== 'running') return this.snapshot();
    clearTimeout(this.timer);
    s.remaining = Math.max(0, s.endsAt - Date.now());
    s.endsAt = null;
    s.status = 'paused';
    return this.changed();
  }

  toggle() {
    return this.store.data.status === 'running' ? this.pause() : this.start();
  }

  /** Back to the full length of the current phase, stopped. */
  reset() {
    clearTimeout(this.timer);
    const s = this.store.data;
    s.status = 'idle';
    s.endsAt = null;
    s.duration = this.phaseMs();
    s.remaining = s.duration;
    return this.changed();
  }

  /** Switch phase by hand. */
  setMode(mode) {
    if (!MODES.includes(mode)) return this.snapshot();
    clearTimeout(this.timer);
    const s = this.store.data;
    s.mode = mode;
    s.status = 'idle';
    s.endsAt = null;
    s.duration = this.phaseMs(mode);
    s.remaining = s.duration;
    return this.changed();
  }

  /** Move to the next phase. A skipped session is not counted as done. */
  skip() {
    return this.setMode(this.store.data.mode === 'focus' ? 'short' : 'focus');
  }

  nextBreak(completedInSet) {
    return completedInSet % this.config.every === 0 ? 'long' : 'short';
  }

  /** The current phase ran out. */
  complete({ quiet = false } = {}) {
    clearTimeout(this.timer);
    const s = this.store.data;
    const finished = s.mode;
    const cfg = this.config;

    if (finished === 'focus') {
      const key = dayKey();
      const day = s.days[key] || { sessions: 0, focusMs: 0 };
      day.sessions += 1;
      day.focusMs += s.duration || this.phaseMs('focus');
      s.days[key] = day;
      // Keep two months of history; that is plenty for "today" and streaks.
      const keys = Object.keys(s.days).sort();
      for (const k of keys.slice(0, Math.max(0, keys.length - 62))) delete s.days[k];
      s.cycle = (s.cycle + 1) % cfg.every;
    }

    const next = finished === 'focus' ? this.nextBreak(s.cycle === 0 ? cfg.every : s.cycle) : 'focus';
    const auto = next === 'focus' ? cfg.autoFocus : cfg.autoBreaks;

    s.mode = next;
    s.duration = this.phaseMs(next);
    if (auto && !quiet) {
      s.status = 'running';
      s.endsAt = Date.now() + s.duration;
      s.remaining = null;
      this.arm();
    } else {
      s.status = 'idle';
      s.endsAt = null;
      s.remaining = s.duration;
    }

    const snap = this.changed();
    if (!quiet) this.emit('done', { finished, next, autoStarted: auto, snapshot: snap });
    return snap;
  }

  /** Configuration changed: an idle timer picks up the new length at once. */
  reconfigure() {
    const s = this.store.data;
    if (s.status === 'idle') {
      s.duration = this.phaseMs();
      s.remaining = s.duration;
    }
    return this.changed();
  }

  /** Called after the machine wakes up. */
  wake() {
    const s = this.store.data;
    if (s.status === 'running' && Date.now() >= s.endsAt) this.complete();
    else if (s.status === 'running') this.arm();
    return this.snapshot();
  }

  flush() {
    this.store.flush();
  }

  dispose() {
    clearTimeout(this.timer);
    this.flush();
  }
}

module.exports = { Pomodoro, normalizeConfig, CONFIG_DEFAULTS, MODES, dayKey };
