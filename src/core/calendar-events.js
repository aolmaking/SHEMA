'use strict';

/**
 * Calendar Events & WhatsApp Reminder Engine
 * - Manages custom occasions, birthdays, conferences, meetings, exams, etc.
 * - Supports one-time and recurring events (yearly, monthly, weekly)
 * - Flexible WhatsApp reminder scheduling (morning of event, 1 day before, 1 hour before, at event time)
 * - Custom message templates with placeholder variables
 * - Direct integration with OpenWA & CallMeBot WhatsApp dispatchers
 */

const { EventEmitter } = require('events');

const CATEGORIES = {
  birthday: {
    id: 'birthday',
    nameAr: 'عيد ميلاد',
    nameEn: 'Birthday',
    icon: '🎂',
    color: '#ec4899',
    defaultTemplate: '🎂 *تذكير مناسبة سعيدة: {title}* 🎂\n\n📅 التاريخ: {date}\n⏰ الوقت: {time}\n{notes}\n🎉 نتمنى لكم يوماً سعيداً ومباركاً وعاماً حافلاً بالتوفيق والنجاح!',
  },
  conference: {
    id: 'conference',
    nameAr: 'مؤتمر / ندوة',
    nameEn: 'Conference / Seminar',
    icon: '🎙️',
    color: '#8b5cf6',
    defaultTemplate: '🎙️ *تذكير هام بمؤتمر / ندوة: {title}* 🎙️\n\n📅 التاريخ: {date}\n⏰ التوقيت: {time}\n{notes}\n📌 لا تنسَ الحضور والمشاركة في الموعد المحدد.',
  },
  meeting: {
    id: 'meeting',
    nameAr: 'اجتماع عمل',
    nameEn: 'Business Meeting',
    icon: '💼',
    color: '#3b82f6',
    defaultTemplate: '💼 *تذكير باجتماع عمل: {title}* 💼\n\n📅 التاريخ: {date}\n⏰ الموعد: {time}\n{notes}\n📍 يرجى الحضور في الموعد المحدد والتحضير للاجتماع.',
  },
  anniversary: {
    id: 'anniversary',
    nameAr: 'ذكرى سنوية / مناسبة خاصة',
    nameEn: 'Anniversary',
    icon: '💍',
    color: '#f59e0b',
    defaultTemplate: '💍 *تذكير بمناسبة خاصة: {title}* 💍\n\n📅 التاريخ: {date}\n{notes}\n✨ أطيب التهاني والأمنيات بدوام السعادة والتوفيق الدائم!',
  },
  exam: {
    id: 'exam',
    nameAr: 'امتحان / اختبار',
    nameEn: 'Exam / Quiz',
    icon: '📝',
    color: '#ef4444',
    defaultTemplate: '📝 *تذكير باختبار / امتحان: {title}* 📝\n\n📅 التاريخ: {date}\n⏰ وقت الامتحان: {time}\n{notes}\n📚 بالتوفيق والنجاح والتركيز التام إن شاء الله!',
  },
  appointment: {
    id: 'appointment',
    nameAr: 'موعد هام / شخصي',
    nameEn: 'Important Appointment',
    icon: '🩺',
    color: '#10b981',
    defaultTemplate: '🩺 *تذكير بموعد هام: {title}* 🩺\n\n📅 الموعد: {date}\n⏰ الساعة: {time}\n{notes}\n🔔 تذكير لتنظيم جدولك والوصول في الوقت المحدد.',
  },
  deadline: {
    id: 'deadline',
    nameAr: 'موعد تسليم نهائي',
    nameEn: 'Delivery Deadline',
    icon: '⏳',
    color: '#f97316',
    defaultTemplate: '⏳ *تنبيه موعد تسليم نهائي: {title}* ⏳\n\n📅 آخر موعد: {date}\n⏰ التوقيت: {time}\n{notes}\n⚠️ يرجى الانتهاء من العمل وتسليمه قبل إغلاق موعد التسليم!',
  },
  general: {
    id: 'general',
    nameAr: 'مناسبة عامة',
    nameEn: 'General Occasion',
    icon: '📌',
    color: '#06b6d4',
    defaultTemplate: '📌 *تذكير بمناسبة: {title}* 📌\n\n📅 التاريخ: {date}\n⏰ الوقت: {time}\n{notes}\n🔔 تذكير مُرسل من ودجت سطح المكتب (Mirqat Widgets).',
  },
};

const DEFAULT_DEMO_EVENTS = [
  {
    id: 'ev_trip_jeddah',
    title: 'رحلة إلى جدة',
    titleEn: 'Trip to Jeddah',
    date: '2026-10-09',
    endDate: '2026-10-11',
    category: 'anniversary',
    color: '#f43f5e',
    isMultiDay: true,
    time: '08:00',
    notes: 'إجازة ورحلة عائلية إلى جدة',
  },
  {
    id: 'ev_team_meeting',
    title: 'اجتماع فريق التطوير',
    titleEn: 'Dev Team Sync',
    date: '2026-10-08',
    category: 'meeting',
    color: '#3b82f6',
    time: '15:00',
    notes: 'مناقشة خطة الإطلاق ومراجعة الميزات الجديدة',
  },
  {
    id: 'ev_email_reply',
    title: 'الرد على الإيميلات المهمة',
    titleEn: 'Reply to Important Emails',
    date: '2026-10-09',
    category: 'deadline',
    color: '#f59e0b',
    time: '08:45',
    notes: 'مراجعة صندوق الوارد والرد على طلبات العملاء',
  },
  {
    id: 'ev_shipment',
    title: 'استلام الشحنة',
    titleEn: 'Pickup Shipment',
    date: '2026-10-09',
    category: 'appointment',
    color: '#10b981',
    time: '16:00',
    notes: 'استلام الطرد من فرع سمسا / أرامكس',
  },
  {
    id: 'ev_flight',
    title: 'اللحاق بالطائرة',
    titleEn: 'Catch the Flight',
    date: '2026-10-09',
    category: 'appointment',
    color: '#ef4444',
    time: '18:00',
    notes: 'المطار الدولي - صالة المغادرة رقم 2',
  },
  {
    id: 'ev_week_plan',
    title: 'تخطيط الأسبوع القادم',
    titleEn: 'Next Week Planning',
    date: '2026-10-10',
    category: 'general',
    color: '#8b5cf6',
    time: '20:00',
    notes: 'تحديد الأولويات ومراجعة جدول المواعيد',
  },
  {
    id: 'ev_bday_anas',
    title: 'عيد ميلاد أنس',
    titleEn: "Anas's Birthday",
    date: '2026-10-18',
    category: 'birthday',
    color: '#ec4899',
    time: '19:00',
    recurring: 'yearly',
  },
  {
    id: 'ev_friend_wedding',
    title: 'زواج صديقي',
    titleEn: "Friend's Wedding",
    date: '2026-10-24',
    category: 'anniversary',
    color: '#ec4899',
    time: '20:30',
  },
];

/**
 * Format a calendar date and time for display
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} [timeStr] - HH:MM
 * @param {string} [lang] - 'ar' | 'en'
 */
function formatEventDateTime(dateStr, timeStr = '', lang = 'ar') {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dateFormatted = dateObj.toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  if (!timeStr) return dateFormatted;
  return `${dateFormatted} (${timeStr})`;
}

/**
 * Build rich WhatsApp message for a calendar event
 * @param {Object} event
 * @param {Object} [settings]
 * @param {string} [lang]
 * @returns {string}
 */
function buildEventWhatsAppMessage(event, settings = {}, lang = 'ar') {
  const cat = CATEGORIES[event.category] || CATEGORIES.general;
  const isEn = lang === 'en';
  const cfg = settings?.whatsapp || {};
  const senderName = (cfg.senderName || '').trim();

  const title = event.title || (isEn ? 'Upcoming Event' : 'مناسبة قادمة');
  const dateStr = formatEventDateTime(event.date, '', lang);
  const timeStr = event.time || (isEn ? 'All Day' : 'طوال اليوم');
  const notesText = event.notes && event.notes.trim() ? `\n📝 *ملاحظات:* ${event.notes.trim()}` : '';

  let template = event.whatsapp?.customMessage && event.whatsapp.customMessage.trim()
    ? event.whatsapp.customMessage.trim()
    : cat.defaultTemplate;

  let msg = template
    .replace(/\{title\}/g, title)
    .replace(/\{category\}/g, isEn ? cat.nameEn : cat.nameAr)
    .replace(/\{date\}/g, dateStr)
    .replace(/\{time\}/g, timeStr)
    .replace(/\{notes\}/g, notesText)
    .replace(/\{senderName\}/g, senderName || (isEn ? 'Calendar Assistant' : 'مساعد التقويم'));

  // Clean trailing blank notes tags
  msg = msg.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

  if (senderName && !msg.includes(senderName)) {
    msg = (isEn ? `🤖 *[From: ${senderName}]*\n\n` : `🤖 *[الراسل: ${senderName}]*\n\n`) + msg;
  }

  return msg;
}

/**
 * Extract active reminder timings for an event
 * Supports array of timings or legacy single sendTiming
 * @param {Object} ev
 * @returns {string[]}
 */
function getEventTimings(ev) {
  const wa = ev?.whatsapp || {};
  if (Array.isArray(wa.timings) && wa.timings.length > 0) {
    return wa.timings;
  }
  if (wa.sendTiming) {
    return [wa.sendTiming];
  }
  return ['morning_of'];
}

/**
 * Calculate the trigger time for a specific timing milestone
 * @param {Date} eventDate
 * @param {string} timing
 * @param {Object} [waSetting]
 * @returns {Date}
 */
function calculateNotifyTime(eventDate, timing, waSetting = {}) {
  let notifyTime = new Date(eventDate.getTime());
  if (timing === 'morning_of') {
    notifyTime.setHours(9, 0, 0, 0);
  } else if (timing === '1d_before') {
    notifyTime.setDate(notifyTime.getDate() - 1);
    notifyTime.setHours(9, 0, 0, 0);
  } else if (timing === '3d_before') {
    notifyTime.setDate(notifyTime.getDate() - 3);
    notifyTime.setHours(9, 0, 0, 0);
  } else if (timing === '1h_before') {
    notifyTime = new Date(eventDate.getTime() - 3600000);
  } else if (timing === '2h_before') {
    notifyTime = new Date(eventDate.getTime() - 2 * 3600000);
  } else if (timing === '3h_before') {
    notifyTime = new Date(eventDate.getTime() - 3 * 3600000);
  } else if (timing === 'at_event') {
    notifyTime = new Date(eventDate.getTime());
  } else if (timing === 'custom' && Number(waSetting.customDaysBefore) > 0) {
    notifyTime.setDate(notifyTime.getDate() - Number(waSetting.customDaysBefore));
    if (waSetting.customTime && /^\d{1,2}:\d{2}$/.test(waSetting.customTime)) {
      const [ch, cm] = waSetting.customTime.split(':').map(Number);
      notifyTime.setHours(ch, cm, 0, 0);
    } else {
      notifyTime.setHours(9, 0, 0, 0);
    }
  }
  return notifyTime;
}

// High-performance zero-allocation date/time parsers
function parseDateParts(str) {
  if (!str || str.length < 10) return null;
  const y = (str.charCodeAt(0) - 48) * 1000 + (str.charCodeAt(1) - 48) * 100 + (str.charCodeAt(2) - 48) * 10 + (str.charCodeAt(3) - 48);
  const m = (str.charCodeAt(5) - 48) * 10 + (str.charCodeAt(6) - 48);
  const d = (str.charCodeAt(8) - 48) * 10 + (str.charCodeAt(9) - 48);
  return { y, m, d };
}

function parseTimeParts(str) {
  if (!str) return { h: 9, m: 0 };
  const idx = str.indexOf(':');
  if (idx === -1) return { h: 9, m: 0 };
  const h = parseInt(str.slice(0, idx), 10) || 9;
  const m = parseInt(str.slice(idx + 1), 10) || 0;
  return { h, m };
}

class CalendarEventsManager extends EventEmitter {
  /**
   * @param {import('./store').Store} eventsStore
   * @param {Function} getSettings
   * @param {import('./whatsapp').WhatsAppDispatcher} whatsappDispatcher
   */
  constructor(eventsStore, getSettings, whatsappDispatcher) {
    super();
    this.store = eventsStore;
    this.getSettings = getSettings || (() => ({}));
    this.whatsapp = whatsappDispatcher;
    this.timer = null;
    /** @type {Set<string>} Set of dispatch keys (e.g. `${eventId}_${dateKey}_${timing}`) to avoid double-sending */
    this.sentKeys = new Set();
  }

  all() {
    return this.store.get('events', []) || [];
  }

  saveEvents(events) {
    this.store.set('events', Array.isArray(events) ? events : []);
    if (this.store.flush) this.store.flush();
    this.emit('changed', this.all());
    this.evaluate();
    return this.all();
  }

  addOrUpdate(event) {
    const list = this.all();
    if (!event.id) {
      event.id = 'ev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
      event.createdAt = Date.now();
      list.push(event);
    } else {
      const idx = list.findIndex((e) => e.id === event.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...event, updatedAt: Date.now() };
      } else {
        list.push(event);
      }
    }
    this.saveEvents(list);
    return event;
  }

  remove(id) {
    const list = this.all().filter((e) => e.id !== id);
    this.saveEvents(list);
    return true;
  }

  dayNotes() {
    return this.store.get('dayNotes', {}) || {};
  }

  getDayNote(dateStr) {
    if (!dateStr) return '';
    const notes = this.dayNotes();
    return notes[dateStr] || '';
  }

  saveDayNote(dateStr, text) {
    if (!dateStr) return false;
    const notes = { ...this.dayNotes() };
    const cleanText = (text || '').trim();
    if (cleanText) {
      notes[dateStr] = cleanText;
    } else {
      delete notes[dateStr];
    }
    this.store.set('dayNotes', notes);
    if (this.store.flush) this.store.flush();
    this.emit('day-notes-changed', notes);
    return notes;
  }

  removeDayNote(dateStr) {
    return this.saveDayNote(dateStr, '');
  }

  /**
   * Check if event matches today's date (considering recurrence and multi-day span)
   * @param {Object} event
   * @param {Date} targetDate
   * @returns {boolean}
   */
  matchesDate(event, targetDate = new Date()) {
    if (!event || !event.date) return false;
    const ty = targetDate.getFullYear();
    const tm = targetDate.getMonth() + 1;
    const td = targetDate.getDate();
    const targetStr = `${ty}-${String(tm).padStart(2, '0')}-${String(td).padStart(2, '0')}`;

    if (event.endDate && event.endDate >= event.date) {
      if (targetStr >= event.date && targetStr <= event.endDate) {
        return true;
      }
    }

    const parts = parseDateParts(event.date);
    if (!parts) return false;
    const { y: ey, m: em, d: ed } = parts;

    if (event.recurring === 'yearly') {
      return em === tm && ed === td;
    }
    if (event.recurring === 'monthly') {
      return ed === td;
    }
    if (event.recurring === 'weekly') {
      const origDayOfWeek = new Date(ey, em - 1, ed).getDay();
      return targetDate.getDay() === origDayOfWeek;
    }
    return ey === ty && em === tm && ed === td;
  }

  /**
   * Evaluate upcoming events and dispatch due WhatsApp and desktop alerts
   * @param {number} [nowTs]
   */
  async evaluate(nowTs = Date.now()) {
    const now = new Date(nowTs);
    const s = this.getSettings() || {};
    const waCfg = s.whatsapp || {};
    const events = this.all();
    const alertsToFire = [];

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (const ev of events) {
      if (!ev.date) continue;
      const waSetting = ev.whatsapp || {};
      if (waSetting.enabled === false) continue;

      const parts = parseDateParts(ev.date);
      if (!parts) continue;
      const { y: ey, m: em, d: ed } = parts;
      let targetYear = ey;
      if (ev.recurring === 'yearly') {
        targetYear = currentYear;
      }

      const eventDate = new Date(targetYear, em - 1, ed);
      const { h: eventHour, m: eventMinute } = parseTimeParts(ev.time);
      eventDate.setHours(eventHour, eventMinute, 0, 0);

      const timings = getEventTimings(ev);

      for (const timing of timings) {
        const notifyTime = calculateNotifyTime(eventDate, timing, waSetting);
        const notifyTs = notifyTime.getTime();
        const diffMs = nowTs - notifyTs;

        // Eligible to fire if we are within a 3-hour window after the scheduled notification time
        if (diffMs >= 0 && diffMs < 3 * 3600000) {
          const sendKey = `${ev.id}_${targetYear}_${em}_${ed}_${timing}`;
          if (!this.sentKeys.has(sendKey)) {
            this.sentKeys.add(sendKey);
            alertsToFire.push({ event: ev, targetDate: eventDate, timing });
          }
        }
      }
    }

    // Fire notifications and send WhatsApp messages
    for (const { event, targetDate } of alertsToFire) {
      this.emit('alert', { event, targetDate });

      if (waCfg.enabled && this.whatsapp) {
        try {
          await this.sendEventWhatsApp(event, s);
        } catch (err) {
          console.error('[CalendarEvents] WhatsApp send error:', err);
        }
      }
    }

    return alertsToFire;
  }

  /**
   * Send WhatsApp notification for an event (Instance method)
   */
  async sendEventWhatsApp(event, settings = null, overrideRecipient = '') {
    return CalendarEventsManager.sendEventWhatsApp(event, settings || this.getSettings() || {}, overrideRecipient);
  }

  /**
   * Send WhatsApp notification for an event (Static method)
   * @param {Object} event
   * @param {Object} [settings]
   * @param {string} [overrideRecipient]
   */
  static async sendEventWhatsApp(event, settings = {}, overrideRecipient = '') {
    const s = settings || {};
    const waCfg = s.whatsapp || (s.enabled !== undefined ? s : {});
    const lang = s.language || 'ar';
    const message = buildEventWhatsAppMessage(event, s, lang);

    let recipients = [];
    if (overrideRecipient && overrideRecipient.trim()) {
      recipients.push(overrideRecipient.trim());
    } else if (event.whatsapp?.recipient && event.whatsapp.recipient.trim()) {
      recipients.push(event.whatsapp.recipient.trim());
    } else {
      // Use configured WhatsApp targets
      const { parsePhoneNumbers } = require('./whatsapp');
      recipients = parsePhoneNumbers(waCfg.phoneNumbers || waCfg.phone);
      if (waCfg.sendToGroup && waCfg.groupId && waCfg.groupId.trim()) {
        recipients.push(waCfg.groupId.trim());
      }
    }

    if (!recipients.length) {
      return { ok: false, error: 'لا يوجد رقم هاتف أو معرّف مجموعة صالح للإرسال' };
    }

    const { sendOpenWaMessage, sendCallMeBotMessage } = require('./whatsapp');
    const provider = (waCfg.provider || 'openwa').toLowerCase();
    const results = [];

    for (const phone of recipients) {
      if (provider === 'openwa') {
        const res = await sendOpenWaMessage({
          gatewayUrl: waCfg.gatewayUrl || 'http://localhost:2785',
          apiKey: waCfg.apiKey || '',
          sessionId: waCfg.sessionId || 'default',
          phone,
          text: message,
        });
        results.push(res);
      } else {
        const res = await sendCallMeBotMessage({
          phone,
          apiKey: waCfg.apiKey || '',
          text: message,
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
      error: anyOk ? undefined : err,
    };
  }

  start(intervalMs = 60000) {
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
  CATEGORIES,
  formatEventDateTime,
  buildEventWhatsAppMessage,
  getEventTimings,
  calculateNotifyTime,
  CalendarEventsManager,
};
