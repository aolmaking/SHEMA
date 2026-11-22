'use strict';

/**
 * Super Urgent Monitor & Dispatcher
 * - Watches uncompleted tasks with approaching deadlines (< 3 hours)
 * - Fires recurring desktop notifications (every 15 min)
 * - Dispatches WhatsApp alerts via OpenWA
 * - Broadcasts super-urgent state to all widgets
 */

const { EventEmitter } = require('events');
const { isTaskCourseHidden } = require('./classroom');

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function getTaskDeadline(task) {
  if (!task) return null;
  if (task.classroom?.deadlineTimestamp) {
    const ts = Number(task.classroom.deadlineTimestamp);
    if (!isNaN(ts) && ts > 0) return ts;
  }
  if (task.deadlineTimestamp) {
    const ts = Number(task.deadlineTimestamp);
    if (!isNaN(ts) && ts > 0) return ts;
  }
  if (task.due) {
    if (typeof task.due === 'number' && !isNaN(task.due) && task.due > 0) return task.due;
    if (typeof task.due === 'string') {
      const trimmed = task.due.trim();
      const m = DATE_RE.exec(trimmed);
      if (m) {
        const y = Number(m[1]);
        const mo = Number(m[2]);
        const d = Number(m[3]);
        return new Date(y, mo - 1, d, 23, 59, 59).getTime();
      }
      const parsed = Date.parse(trimmed);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  if (Array.isArray(task.reminders) && task.reminders.length) {
    let minTs = Infinity;
    for (let i = 0; i < task.reminders.length; i++) {
      const r = task.reminders[i];
      if (r && r.at && !r.fired && r.at < minTs) {
        minTs = r.at;
      }
    }
    if (minTs !== Infinity) return minTs;
  }
  return null;
}

class SuperUrgentMonitor extends EventEmitter {
  /**
   * @param {import('./store').Store} todosStore
   * @param {Function} getSettings
   * @param {import('./whatsapp').WhatsAppDispatcher} whatsappDispatcher
   */
  constructor(todosStore, getSettings, whatsappDispatcher) {
    super();
    this.todos = todosStore;
    this.getSettings = getSettings || (() => ({}));
    this.whatsapp = whatsappDispatcher;
    this.timer = null;
    /** @type {Map<string, number>} taskId -> lastDesktopNotifyTs */
    this.lastDesktopNotify = new Map();
  }

  items() {
    return this.todos.get('items', []) || [];
  }

  config() {
    const s = this.getSettings() || {};
    return {
      enabled: s.superUrgent?.enabled !== false,
      thresholdHours: Number(s.superUrgent?.thresholdHours) || 3,
      desktopIntervalMinutes: Number(s.superUrgent?.desktopIntervalMinutes) || 15,
      whatsapp: s.whatsapp || {},
    };
  }

  /**
   * Check which tasks are currently super urgent
   * @param {number} [now]
   * @returns {Array<{ task: any, deadline: number, msRemaining: number }>}
   */
  checkUrgentTasks(now = Date.now()) {
    const cfg = this.config();
    if (!cfg.enabled) return [];

    const thresholdMs = cfg.thresholdHours * 3600 * 1000;
    const urgent = [];
    const s = this.getSettings() || {};
    const filterEnabled = s.classroom?.filterHiddenCourses !== false;
    const hiddenCourses = filterEnabled ? (s.classroom?.hiddenCourses || []) : [];

    for (const task of this.items()) {
      if (task.done) continue;
      if (isTaskCourseHidden(task, hiddenCourses)) continue;
      const deadline = getTaskDeadline(task);
      if (!deadline) continue;

      const msRemaining = deadline - now;
      // Is within threshold (e.g. <= 6 hours) and stays urgent if overdue up to 24 hours
      if (msRemaining > -86400000 && msRemaining <= thresholdMs) {
        urgent.push({ task, deadline, msRemaining });
      }
    }

    return urgent;
  }

  /**
   * Run evaluation cycle
   */
  async evaluate(now = Date.now()) {
    const cfg = this.config();
    const urgentList = this.checkUrgentTasks(now);

    const desktopIntervalMs = cfg.desktopIntervalMinutes * 60 * 1000;
    const desktopAlerts = [];

    for (const { task, deadline, msRemaining } of urgentList) {
      // 1. Check desktop notification frequency
      const lastNotify = this.lastDesktopNotify.get(task.id) || 0;
      if (now - lastNotify >= desktopIntervalMs) {
        this.lastDesktopNotify.set(task.id, now);
        desktopAlerts.push({ task, deadline, msRemaining });
      }

      // 2. WhatsApp notification
      if (cfg.whatsapp?.enabled && this.whatsapp) {
        try {
          await this.whatsapp.notifySuperUrgent(task, deadline, this.getSettings());
        } catch {
          // WhatsApp network failure does not disrupt the app
        }
      }
    }

    if (desktopAlerts.length > 0) {
      this.emit('desktop-alerts', desktopAlerts);
    }

    this.emit('state', {
      activeUrgentIds: urgentList.map((u) => u.task.id),
      urgentList,
    });

    return urgentList;
  }

  start(intervalMs = 30000) {
    this.stop();
    this.evaluate();
    this.timer = setInterval(() => this.evaluate(), intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

module.exports = {
  SuperUrgentMonitor,
  getTaskDeadline,
};
