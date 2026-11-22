'use strict';

/**
 * Reliable Dispatcher & Persistent Journal
 * 
 * Guarantees that WhatsApp alerts and notifications for To-Do deadlines and
 * Calendar events are:
 * 1. Pre-planned ahead of time (pre-computed scheduled alert commands).
 * 2. Persisted to disk in dispatch-queue.json (survives app restarts, OS sleep, crashes).
 * 3. Verified for successful delivery with automatic retries on network/OpenWA failure.
 * 4. Automatically caught up on startup or system wake (even if the app or PC was off
 *    when the alert was due, within a 48-hour catch-up window).
 * 5. Completely decoupled from widget visibility (runs 24/7 in background).
 */

const { EventEmitter } = require('events');
const { getTaskDeadline } = require('./super-urgent');
const { isTaskCourseHidden } = require('./classroom');
const { buildSuperUrgentMessage, sendOpenWaMessage, sendCallMeBotMessage, parsePhoneNumbers } = require('./whatsapp');
const { buildEventWhatsAppMessage, formatEventDateTime, getEventTimings, calculateNotifyTime } = require('./calendar-events');

const MAX_CATCHUP_WINDOW_MS = 48 * 3600 * 1000; // 48 hours back
const MAX_RETRIES = 10;
const INITIAL_RETRY_DELAY_MS = 30 * 1000; // 30 seconds

class ReliableDispatcher extends EventEmitter {
  /**
   * @param {import('./store').Store} queueStore - Persistent store pointing to dispatch-queue.json
   * @param {Function} getSettings - Function returning current public settings
   * @param {Object} [openwaController] - Controller to check online status or start OpenWA
   */
  constructor(queueStore, getSettings, openwaController = null) {
    super();
    this.store = queueStore;
    this.getSettings = getSettings || (() => ({}));
    this.openwa = openwaController;
    this.timer = null;
    this._isProcessing = false;

    // Ensure store has default structures
    if (!this.store.data.dispatched) this.store.data.dispatched = {};
    if (!this.store.data.planned) this.store.data.planned = {};
    if (!Array.isArray(this.store.data.retryQueue)) this.store.data.retryQueue = [];
  }

  get dispatched() {
    if (!this.store.data.dispatched) this.store.data.dispatched = {};
    return this.store.data.dispatched;
  }

  get planned() {
    if (!this.store.data.planned) this.store.data.planned = {};
    return this.store.data.planned;
  }

  get retryQueue() {
    if (!Array.isArray(this.store.data.retryQueue)) this.store.data.retryQueue = [];
    return this.store.data.retryQueue;
  }

  save() {
    try {
      this.store.save();
      this.store.flush();
    } catch (e) {
      console.error('[ReliableDispatcher] Failed saving queue state:', e);
    }
  }

  /**
   * Check if a specific alert key was already successfully sent
   * @param {string} alertKey
   * @returns {boolean}
   */
  isDispatched(alertKey) {
    const record = this.dispatched[alertKey];
    return Boolean(record && record.status === 'SENT');
  }

  /**
   * Mark an alert key as successfully dispatched and flush to disk
   */
  markDispatched(alertKey, details = {}) {
    this.dispatched[alertKey] = {
      alertKey,
      status: 'SENT',
      dispatchedAt: Date.now(),
      attempts: (this.dispatched[alertKey]?.attempts || 0) + 1,
      ...details,
    };
    // Clean from retry queue if present
    this.store.data.retryQueue = this.retryQueue.filter((q) => q.alertKey !== alertKey);
    this.save();
  }

  /**
   * Mark an alert as failed and enqueue for retry
   */
  markFailed(alertKey, errorMsg, itemData, currentTs = Date.now()) {
    const existing = this.dispatched[alertKey] || {};
    const attempts = (existing.attempts || 0) + 1;

    this.dispatched[alertKey] = {
      ...existing,
      alertKey,
      status: 'FAILED_RETRYING',
      lastAttemptAt: currentTs,
      attempts,
      lastError: errorMsg,
    };

    if (attempts < MAX_RETRIES) {
      const delay = Math.min(INITIAL_RETRY_DELAY_MS * Math.pow(1.5, attempts - 1), 15 * 60 * 1000);
      const nextRetryTs = currentTs + delay;

      const idx = this.retryQueue.findIndex((q) => q.alertKey === alertKey);
      const entry = {
        alertKey,
        itemData,
        attempts,
        lastAttemptAt: currentTs,
        nextRetryTs,
        lastError: errorMsg,
      };

      if (idx >= 0) {
        this.retryQueue[idx] = entry;
      } else {
        this.retryQueue.push(entry);
      }
    } else {
      this.dispatched[alertKey].status = 'FAILED_MAX_RETRIES';
      this.store.data.retryQueue = this.retryQueue.filter((q) => q.alertKey !== alertKey);
    }
    this.save();
  }

  /**
   * Pre-plan advance scheduled commands for a To-Do task
   * @param {Object} task
   */
  planTaskAlerts(task) {
    if (!task || task.done) return;
    const deadline = getTaskDeadline(task);
    if (!deadline) return;

    // Define standard milestone triggers
    const stages = [
      { id: '24h', msBefore: 24 * 3600 * 1000, label: 'تنبيه 24 ساعة متبقية' },
      { id: '6h', msBefore: 6 * 3600 * 1000, label: 'تنبيه 6 ساعات (اقتراب الموعد)' },
      { id: '3h', msBefore: 3 * 3600 * 1000, label: 'تنبيه الوضع فائق الأهمية (Super Urgent)' },
      { id: '1h', msBefore: 1 * 3600 * 1000, label: 'تنبيه الساعة الأخيرة الحاسم' },
      { id: 'imminent', msBefore: 15 * 60 * 1000, label: 'تنبيه 15 دقيقة قبل إغلاق التسليم' },
    ];

    for (const st of stages) {
      const triggerTs = deadline - st.msBefore;
      const planKey = `todo_${task.id}_${deadline}_${st.id}`;
      if (!this.planned[planKey]) {
        this.planned[planKey] = {
          planKey,
          type: 'todo_urgent',
          taskId: task.id,
          taskTitle: task.text,
          stage: st.id,
          label: st.label,
          triggerTs,
          deadline,
          plannedAt: Date.now(),
        };
      }
    }
    this.save();
  }

  /**
   * Pre-plan advance scheduled commands for a Calendar Event
   * @param {Object} event
   */
  planCalendarEventAlerts(event) {
    if (!event || !event.date) return;
    const wa = event.whatsapp || {};
    if (wa.enabled === false) return;

    const [ey, em, ed] = event.date.split('-').map(Number);
    const now = new Date();
    let targetYear = ey;
    if (event.recurrence === 'yearly') targetYear = now.getFullYear();

    const eventDate = new Date(targetYear, em - 1, ed);
    let eventHour = 9;
    let eventMinute = 0;
    if (event.time && /^\d{1,2}:\d{2}$/.test(event.time)) {
      const [th, tm] = event.time.split(':').map(Number);
      eventHour = th;
      eventMinute = tm;
    }
    const timings = getEventTimings(event);

    for (const timing of timings) {
      const notifyTime = calculateNotifyTime(eventDate, timing, wa);
      const triggerTs = notifyTime.getTime();
      const planKey = `cal_${event.id}_${targetYear}_${em}_${ed}_${timing}`;

      if (!this.planned[planKey]) {
        this.planned[planKey] = {
          planKey,
          type: 'calendar_event',
          eventId: event.id,
          eventTitle: event.title,
          triggerTs,
          eventDateTs: eventDate.getTime(),
          timing,
          plannedAt: Date.now(),
        };
        this.save();
      }
    }
  }

  /**
   * Helper to ensure recipients are determined accurately
   */
  getRecipients(waCfg, overrideRecipient = '') {
    if (overrideRecipient && overrideRecipient.trim()) return [overrideRecipient.trim()];
    const recipients = parsePhoneNumbers(waCfg.phoneNumbers || waCfg.phone);
    if (waCfg.sendToGroup && waCfg.groupId && waCfg.groupId.trim()) {
      recipients.push(waCfg.groupId.trim());
    }
    return recipients;
  }

  /**
   * Directly dispatch a WhatsApp message with provider auto-detection
   */
  async executeSendWhatsApp(text, waCfg, overrideRecipient = '') {
    const recipients = this.getRecipients(waCfg, overrideRecipient);
    if (!recipients.length) {
      return { ok: false, error: 'لا يوجد رقم هاتف أو معرّف مجموعة محدد في إعدادات الواتساب' };
    }

    const provider = (waCfg.provider || 'openwa').toLowerCase();
    const results = [];

    for (const recipient of recipients) {
      if (provider === 'openwa') {
        const res = await sendOpenWaMessage({
          gatewayUrl: waCfg.gatewayUrl || 'http://localhost:2785',
          apiKey: waCfg.apiKey || '',
          sessionId: waCfg.sessionId || 'default',
          phone: recipient,
          text,
        });
        results.push(res);
      } else {
        const res = await sendCallMeBotMessage({
          phone: recipient,
          apiKey: waCfg.apiKey || '',
          text,
        });
        results.push(res);
      }
    }

    const anyOk = results.some((r) => r.ok);
    const err = results.find((r) => !r.ok)?.error;
    return {
      ok: anyOk,
      recipients,
      results,
      error: anyOk ? undefined : (err || 'فشل إرسال الرسالة لكافة المستلمين'),
    };
  }

  /**
   * Run the full Catch-Up & Verification Engine
   * Evaluates all tasks, calendar events, planned alerts, and retry queues
   * @param {Object} context
   * @param {Array} context.todos
   * @param {Array} context.calendarEvents
   * @param {number} [context.now]
   */
  async catchup({ todos = [], calendarEvents = [], now = Date.now() }) {
    if (this._isProcessing) return;
    this._isProcessing = true;

    try {
      const s = this.getSettings() || {};
      const waCfg = s.whatsapp || {};
      if (!waCfg.enabled) return;

      const isEn = s.language === 'en';
      const filterEnabled = s.classroom?.filterHiddenCourses !== false;
      const hiddenCourses = filterEnabled ? (s.classroom?.hiddenCourses || []) : [];

      // If OpenWA provider is used and controller provided, ensure it's online
      if ((waCfg.provider || 'openwa') === 'openwa' && this.openwa) {
        try {
          const status = await this.openwa.checkOnline?.();
          if (!status?.online && this.openwa.start) {
            await this.openwa.start();
          }
        } catch {}
      }

      // Snapshot due retries before starting the cycle
      const dueRetries = [...this.retryQueue.filter((q) => q.nextRetryTs <= now)];

      // ====================================================================
      // 1. Process To-Do Tasks (Super Urgent & Overdue Catch-up)
      // ====================================================================
      for (const task of todos) {
        if (task.done) continue;
        if (isTaskCourseHidden(task, hiddenCourses)) continue;
        const deadline = getTaskDeadline(task);
        if (!deadline) continue;

        // Plan forward commands
        this.planTaskAlerts(task);

        const msRemaining = deadline - now;
        // Check if task is within urgent window (<= 3h) or overdue up to 48h
        const isUrgentNow = msRemaining <= (3 * 3600 * 1000) && msRemaining > -MAX_CATCHUP_WINDOW_MS;
        if (!isUrgentNow) continue;

        // Determine current urgency stage
        let stage = '3h_urgent';
        let isLateCatchup = false;
        if (msRemaining <= 0) {
          stage = 'overdue_catchup';
          isLateCatchup = true;
        } else if (msRemaining <= 15 * 60 * 1000) {
          stage = '15m_imminent';
        } else if (msRemaining <= 3600 * 1000) {
          stage = '1h_critical';
        }

        const alertKey = `todo_${task.id}_${deadline}_${stage}`;

        // If not already delivered for this stage:
        if (!this.isDispatched(alertKey)) {
          let msg = buildSuperUrgentMessage(task, deadline, s);
          if (isLateCatchup) {
            const prefix = isEn
              ? '⚠️ *[OVERDUE CATCH-UP ALERT]* The following assignment passed its deadline while the system was offline:\n\n'
              : '⚠️ *[تنبيه استدراك - مهمة متأخرة]* فات موعد تسليم هذه المهمة أثناء إغلاق النظام، يرجى المسارعة بالرفع:\n\n';
            msg = prefix + msg;
          }

          const suRecipient = (waCfg.routes?.superUrgent?.useCustom && waCfg.routes?.superUrgent?.recipient)
            ? waCfg.routes.superUrgent.recipient.trim()
            : '';
          const sendRes = await this.executeSendWhatsApp(msg, waCfg, suRecipient);
          if (sendRes.ok) {
            this.markDispatched(alertKey, {
              type: 'todo_urgent',
              id: task.id,
              title: task.text,
              deadline,
              stage,
              isLateCatchup,
              recipients: sendRes.recipients,
            });
            this.emit('task-alert-sent', { task, deadline, stage, isLateCatchup });
          } else {
            this.markFailed(alertKey, sendRes.error, { type: 'todo_urgent', task, deadline, stage, msg }, now);
          }
        }
      }

      // ====================================================================
      // 2. Process Calendar Events (Scheduled & Missed Catch-up)
      // ====================================================================
      for (const ev of calendarEvents) {
        if (!ev || !ev.date) continue;
        const evWa = ev.whatsapp || {};
        if (evWa.enabled === false) continue;

        // Plan forward commands
        this.planCalendarEventAlerts(ev);

        const [ey, em, ed] = ev.date.split('-').map(Number);
        const currentYear = new Date(now).getFullYear();
        let targetYear = ey;
        if (ev.recurrence === 'yearly') targetYear = currentYear;

        const eventDate = new Date(targetYear, em - 1, ed);
        let eventHour = 9;
        let eventMinute = 0;
        if (ev.time && /^\d{1,2}:\d{2}$/.test(ev.time)) {
          const [th, tm] = ev.time.split(':').map(Number);
          eventHour = th;
          eventMinute = tm;
        }
        eventDate.setHours(eventHour, eventMinute, 0, 0);

        const timings = getEventTimings(ev);

        for (const timing of timings) {
          const notifyTime = calculateNotifyTime(eventDate, timing, evWa);
          const notifyTs = notifyTime.getTime();
          const diffMs = now - notifyTs;

          // If the scheduled trigger has passed and is within the 48-hour catch-up window
          if (diffMs >= 0 && diffMs < MAX_CATCHUP_WINDOW_MS) {
            const alertKey = `cal_${ev.id}_${targetYear}_${em}_${ed}_${timing}`;

            if (!this.isDispatched(alertKey)) {
              const isLate = diffMs > 30 * 60 * 1000; // Passed by >30 mins
              let msg = buildEventWhatsAppMessage(ev, s, isEn ? 'en' : 'ar');
              if (isLate) {
                const prefix = isEn
                  ? '📅 *[EVENT CATCH-UP REMINDER]* (Delivered upon system wake/start):\n\n'
                  : '📅 *[تنبيه استدراك لمناسبة سابقة]* (تم الإرسال فور تشغيل أو استيقاظ النظام):\n\n';
                msg = prefix + msg;
              }

              const calRecipient = evWa.recipient ||
                ((waCfg.routes?.calendarEvents?.useCustom && waCfg.routes?.calendarEvents?.recipient)
                  ? waCfg.routes.calendarEvents.recipient.trim()
                  : '');
              const sendRes = await this.executeSendWhatsApp(msg, waCfg, calRecipient);
              if (sendRes.ok) {
                this.markDispatched(alertKey, {
                  type: 'calendar_event',
                  id: ev.id,
                  title: ev.title,
                  eventDate: ev.date,
                  timing,
                  isLate,
                  recipients: sendRes.recipients,
                });
                this.emit('calendar-alert-sent', { event: ev, timing, isLate });
              } else {
                this.markFailed(alertKey, sendRes.error, { type: 'calendar_event', event: ev, msg, recipient: evWa.recipient }, now);
              }
            }
          }
        }
      }

      // ====================================================================
      // 3. Process Pending Retry Queue (captured at start of cycle)
      // ====================================================================
      for (const item of dueRetries) {
        if (!item.itemData || !item.itemData.msg) continue;
        const res = await this.executeSendWhatsApp(item.itemData.msg, waCfg, item.itemData.recipient);
        if (res.ok) {
          this.markDispatched(item.alertKey, {
            type: item.itemData.type,
            title: item.itemData.title || item.itemData.task?.text || item.itemData.event?.title,
            retried: true,
            recipients: res.recipients,
          });
        } else {
          this.markFailed(item.alertKey, res.error, item.itemData, now);
        }
      }
    } catch (err) {
      console.error('[ReliableDispatcher] Catchup error:', err);
    } finally {
      this._isProcessing = false;
    }
  }

  /**
   * Start polling loop
   */
  start(intervalMs = 30000, contextGetter = null) {
    this.stop();
    const run = () => {
      if (contextGetter) {
        const ctx = contextGetter();
        this.catchup(ctx);
      }
    };
    run();
    this.timer = setInterval(run, intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

module.exports = {
  ReliableDispatcher,
  MAX_CATCHUP_WINDOW_MS,
  MAX_RETRIES,
};
