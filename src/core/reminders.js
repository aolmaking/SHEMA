'use strict';
/**
 * Task reminders.
 *
 * Each task can carry any number of reminders ({ id, at, fired }). This
 * watches them from the main process, so they go off whether or not the
 * to-do widget is open. Timers are re-armed in slices of at most a minute,
 * so a reminder that fell due while the laptop slept fires on wake.
 */

const { EventEmitter } = require('events');

const SLICE = 60_000;

class Reminders extends EventEmitter {
  /** @param {import('./store').Store} todos */
  constructor(todos) {
    super();
    this.todos = todos;
    this.timer = null;
  }

  items() {
    return this.todos.get('items', []) || [];
  }

  /** The earliest reminder still waiting, or Infinity. */
  next() {
    let next = Infinity;
    for (const t of this.items()) {
      for (const r of t.reminders || []) {
        if (!r.fired && typeof r.at === 'number' && r.at < next) next = r.at;
      }
    }
    return next;
  }

  schedule() {
    clearTimeout(this.timer);
    const next = this.next();
    if (next === Infinity) return;
    const delay = Math.max(0, Math.min(next - Date.now(), SLICE));
    this.timer = setTimeout(() => this.check(), delay);
  }

  stop() {
    clearTimeout(this.timer);
    this.timer = null;
  }

  /** Fire everything that is due; finished tasks are marked but stay quiet. */
  check(now = Date.now()) {
    const due = [];
    for (const t of this.items()) {
      for (const r of t.reminders || []) {
        if (r.fired || typeof r.at !== 'number' || r.at > now + 250) continue;
        r.fired = true;
        r.firedAt = now;
        if (!t.done) due.push({ task: t, reminder: r, late: now - r.at > 2 * 60_000 });
      }
    }
    if (due.length || this.items().some((t) => (t.reminders || []).some((r) => r.firedAt === now))) {
      this.todos.save();
      this.emit('changed');
    }
    if (due.length) this.emit('due', due);
    this.schedule();
    return due;
  }

  dispose() {
    clearTimeout(this.timer);
  }
}

module.exports = { Reminders };
