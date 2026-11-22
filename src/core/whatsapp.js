'use strict';

/**
 * OpenWA WhatsApp API Client & Notification Dispatcher
 * Compatible with https://github.com/rmyndharis/OpenWA
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

/**
 * Format phone number into WhatsApp chatId (e.g., 201012345678@c.us)
 * @param {string} phone
 * @returns {string}
 */
function formatPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return '';
  const trimmed = phone.trim();
  if (trimmed.endsWith('@g.us') || trimmed.endsWith('@c.us') || trimmed.endsWith('@s.whatsapp.net')) {
    return trimmed;
  }
  let cleaned = trimmed.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
  if (cleaned.startsWith('00')) cleaned = cleaned.slice(2);

  // Auto-detect Egyptian local mobile numbers (010, 011, 012, 015)
  if (/^01[0125]\d{8}$/.test(cleaned)) {
    cleaned = '2' + cleaned;
  }

  return `${cleaned}@c.us`;
}

/**
 * Send text message using OpenWA REST API
 * POST /api/sessions/{sessionId}/messages/send-text
 *
 * @param {Object} opts
 * @param {string} opts.gatewayUrl - e.g. http://localhost:2785
 * @param {string} [opts.apiKey] - X-API-Key header
 * @param {string} [opts.sessionId] - Session ID (default: 'default')
 * @param {string} opts.phone - Target phone number
 * @param {string} opts.text - Message content
 * @param {number} [opts.timeoutMs] - Request timeout (default: 10000)
 * @returns {Promise<{ ok: boolean, data?: any, error?: string }>}
 */
function sendOpenWaMessage({ gatewayUrl, apiKey, sessionId, phone, text, timeoutMs = 10000 }) {
  return new Promise((resolve) => {
    try {
      const chatId = formatPhoneNumber(phone);
      if (!chatId || !chatId.includes('@')) {
        return resolve({ ok: false, error: 'رقم الهاتف غير صالح أو فارغ' });
      }

      const rawUrl = (gatewayUrl || 'http://localhost:2785').replace(/\/+$/, '');
      const sess = encodeURIComponent(sessionId || 'default');
      const targetUrl = `${rawUrl}/api/sessions/${sess}/messages/send-text`;

      const parsedUrl = new URL(targetUrl);
      const isHttps = parsedUrl.protocol === 'https:';
      const transport = isHttps ? https : http;

      const payload = JSON.stringify({
        chatId,
        text,
      });

      const headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      };
      if (apiKey && apiKey.trim()) {
        headers['X-API-Key'] = apiKey.trim();
      }

      const req = transport.request(parsedUrl, {
        method: 'POST',
        headers,
        timeout: timeoutMs,
      }, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            const data = body ? JSON.parse(body) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ ok: true, data });
            } else {
              resolve({
                ok: false,
                error: data.message || data.error || `HTTP ${res.statusCode}: ${body.slice(0, 200)}`,
                statusCode: res.statusCode,
              });
            }
          } catch {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ ok: true, data: body });
            } else {
              resolve({ ok: false, error: `HTTP ${res.statusCode}: ${body.slice(0, 200)}`, statusCode: res.statusCode });
            }
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, error: 'انتهت مهلة الاتصال بخادم OpenWA (Timeout)' });
      });

      req.on('error', (err) => {
        resolve({
          ok: false,
          error: `تعذر الاتصال بخادم OpenWA (${err.code || err.message}). تأكد من تشغيل OpenWA على ${rawUrl}`,
        });
      });

      req.write(payload);
      req.end();
    } catch (e) {
      resolve({ ok: false, error: e.message });
    }
  });
}

/**
 * Format phone number for CallMeBot (+2010... international with leading +)
 * @param {string} phone
 * @returns {string}
 */
function formatCallMeBotPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  let cleaned = phone.trim().replace(/[^\d+]/g, '');
  if (cleaned.startsWith('00')) cleaned = '+' + cleaned.slice(2);
  if (!cleaned.startsWith('+')) {
    // Auto-detect Egyptian local mobile numbers (010, 011, 012, 015)
    if (/^01[0125]\d{8}$/.test(cleaned)) {
      cleaned = '+2' + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
  }
  return cleaned;
}

/**
 * Send WhatsApp text message via CallMeBot Cloud API (100% Free)
 * https://www.callmebot.com/uncategorized/free-api-whatsapp-messages/
 *
 * @param {Object} opts
 * @param {string} opts.phone - Target phone number with country code
 * @param {string} opts.apiKey - CallMeBot API key
 * @param {string} opts.text - Message content
 * @param {number} [opts.timeoutMs] - Request timeout (default: 15000)
 * @returns {Promise<{ ok: boolean, data?: string, error?: string }>}
 */
function sendCallMeBotMessage({ phone, apiKey, text, timeoutMs = 15000 }) {
  return new Promise((resolve) => {
    try {
      if (!apiKey || !apiKey.trim()) {
        return resolve({ ok: false, error: 'يرجى إدخال مفتاح API الخاص بـ CallMeBot أولاً' });
      }

      const formattedPhone = formatCallMeBotPhone(phone);
      if (!formattedPhone || formattedPhone.length < 8) {
        return resolve({ ok: false, error: 'رقم الهاتف غير صالح. أدخل الرقم بكود الدولة (مثلاً 010... أو +2010...)' });
      }

      const cleanKey = apiKey.trim();
      const apiUrl = new URL('https://api.callmebot.com/whatsapp.php');
      apiUrl.searchParams.set('phone', formattedPhone);
      apiUrl.searchParams.set('text', text);
      apiUrl.searchParams.set('apikey', cleanKey);

      const req = https.get(apiUrl.toString(), { timeout: timeoutMs }, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          const cleanText = body.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
          const isSuccess = (res.statusCode === 200 || res.statusCode === 201) && !/invalid|error|not registered/i.test(cleanText);

          if (isSuccess || /queued|status:\s*ok|message sent/i.test(cleanText)) {
            resolve({ ok: true, data: cleanText });
          } else {
            let errorMsg = cleanText || `HTTP ${res.statusCode}`;
            if (/apikey is invalid/i.test(cleanText)) {
              errorMsg = 'مفتاح الـ API غير صالح. تأكد من نسخه بدقة من رسالة تفعيل CallMeBot على واتساب.';
            } else if (/not registered|not authorized/i.test(cleanText)) {
              errorMsg = 'رقم الهاتف غير مسجل أو غير مفعل. أرسل: "I allow callmebot to send me messages" إلى البوت على واتساب أولاً.';
            }
            resolve({ ok: false, error: errorMsg, statusCode: res.statusCode });
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, error: 'انتهت مهلة الاتصال بخدمة CallMeBot السحابية (Timeout)' });
      });

      req.on('error', (err) => {
        resolve({ ok: false, error: `تعذر الاتصال بخدمة CallMeBot (${err.message})` });
      });
    } catch (e) {
      resolve({ ok: false, error: e.message });
    }
  });
}

/**
 * Format remaining time nicely in Arabic
 * @param {number} ms
 * @returns {string}
 */
function formatTimeLeft(ms, isEn = false) {
  if (ms <= 0) return isEn ? 'Deadline reached now!' : 'انتهى الموعد الآن!';
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (isEn) {
    if (hours > 0 && minutes > 0) return `${hours} hr and ${minutes} min`;
    if (hours > 0) return `${hours} hr`;
    return `${minutes} min`;
  }
  if (hours > 0 && minutes > 0) return `${hours} ساعة و ${minutes} دقيقة`;
  if (hours > 0) return `${hours} ساعة`;
  return `${minutes} دقيقة`;
}

/**
 * Parse one or multiple phone numbers from comma, semicolon, or newline separated string
 * @param {string} phoneInput
 * @returns {string[]}
 */
function parsePhoneNumbers(phoneInput) {
  if (!phoneInput) return [];
  if (Array.isArray(phoneInput)) {
    return phoneInput.map((p) => String(p).trim()).filter((p) => p.length >= 7 || p.endsWith('@g.us'));
  }
  if (typeof phoneInput !== 'string') return [];
  return phoneInput
    .split(/[,;\n]+/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 7 || p.endsWith('@g.us'));
}

/**
 * Build rich urgent template for WhatsApp
 */
function buildSuperUrgentMessage(task, deadlineTimestamp, settings) {
  const cfg = settings?.whatsapp || {};
  const isEn = settings?.language === 'en';
  const timeLeftStr = formatTimeLeft(deadlineTimestamp - Date.now(), isEn);
  const deadlineStr = new Date(deadlineTimestamp).toLocaleString(isEn ? 'en-US' : 'ar-EG', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
  const taskTitle = task.text || '';
  const courseName = task.classroom?.courseName || 'Classroom';
  const link = task.classroom?.alternateLink || '';
  const senderName = (cfg.senderName || '').trim();
  const priorityStr = isEn ? 'Urgent 🚨' : 'عاجلة جداً 🚨';

  // If user specified custom template, fill variables
  if (cfg.template && cfg.template.trim()) {
    let msg = cfg.template
      .replace(/\{taskTitle\}/g, taskTitle)
      .replace(/\{courseName\}/g, courseName)
      .replace(/\{deadline\}/g, deadlineStr)
      .replace(/\{timeLeft\}/g, timeLeftStr)
      .replace(/\{priority\}/g, priorityStr)
      .replace(/\{link\}/g, link)
      .replace(/\{senderName\}/g, senderName || (isEn ? 'Assignment Assistant' : 'مساعد المهام'));
    if (senderName && !msg.includes(senderName)) {
      msg = (isEn ? `🤖 *[From: ${senderName}]*\n\n` : `🤖 *[الراسل: ${senderName}]*\n\n`) + msg;
    }
    return msg;
  }

  const lines = [];
  if (senderName) {
    lines.push(isEn ? `🤖 *[From: ${senderName}]*` : `🤖 *[الراسل: ${senderName}]*`);
    lines.push('');
  }
  lines.push(isEn ? '🚨 *Super Urgent Assignment Alert (Google Classroom)* 🚨' : '🚨 *تنبيه تسليم عاجل جداً (Google Classroom)* 🚨');
  lines.push('');
  lines.push(isEn ? `📌 *Task:* ${taskTitle}` : `📌 *المهمة:* ${taskTitle}`);

  if (task.classroom?.courseName) {
    lines.push(isEn ? `📚 *Course:* ${courseName}` : `📚 *المادة:* ${courseName}`);
  }

  lines.push(isEn ? `⏳ *Time Left:* ${timeLeftStr}` : `⏳ *الوقت المتبقي:* ${timeLeftStr}`);
  lines.push(isEn ? `📅 *Deadline:* ${deadlineStr}` : `📅 *موعد التسليم النهائي:* ${deadlineStr}`);

  if (link) {
    lines.push(isEn ? `🔗 *Submission Link:* ${link}` : `🔗 *رابط التسليم المباشر:* ${link}`);
  }

  lines.push('');
  lines.push(isEn
    ? '⚠️ *Important Notice:* The submission deadline is approaching fast! Please turn in your assignment on Google Classroom now.'
    : '⚠️ *تنبيه هام:* اقترب موعد إغلاق التسليم! يرجى الإسراع في رفع الواجب على Google Classroom الآن.');

  return lines.join('\n');
}

class WhatsAppDispatcher {
  constructor() {
    /** @type {Map<string, { lastSent: number, count: number }>} */
    this.sentHistory = new Map();
  }

  /**
   * Determine if we should send an alert based on frequency settings
   * @param {string} taskId
   * @param {number} frequencyMinutes - e.g. 15, 30, 60 or 0 (0 = once)
   * @returns {boolean}
   */
  shouldSend(taskId, frequencyMinutes = 15) {
    const record = this.sentHistory.get(taskId);
    if (!record) return true;
    if (frequencyMinutes <= 0) return false; // Once only
    const diffMs = Date.now() - record.lastSent;
    return diffMs >= frequencyMinutes * 60000;
  }

  /**
   * Record that a message was sent
   * @param {string} taskId
   */
  recordSent(taskId) {
    const existing = this.sentHistory.get(taskId) || { count: 0, lastSent: 0 };
    this.sentHistory.set(taskId, {
      count: existing.count + 1,
      lastSent: Date.now(),
    });
  }

  /**
   * Clear task from history (e.g. when completed or deleted)
   * @param {string} taskId
   */
  clear(taskId) {
    this.sentHistory.delete(taskId);
  }

  /**
   * Send WhatsApp notification for a super urgent task (supports multiple recipients)
   */
  async notifySuperUrgent(task, deadlineTimestamp, settings) {
    const cfg = settings?.whatsapp || {};
    if (!cfg.enabled) return { skipped: true, reason: 'disabled' };

    let numbers = [];
    if (cfg.routes?.superUrgent?.useCustom && cfg.routes?.superUrgent?.recipient && cfg.routes.superUrgent.recipient.trim()) {
      numbers = [cfg.routes.superUrgent.recipient.trim()];
    } else {
      numbers = parsePhoneNumbers(cfg.phoneNumbers || cfg.phone);
      if (cfg.sendToGroup && cfg.groupId && cfg.groupId.trim()) {
        numbers.push(cfg.groupId.trim());
      }
    }
    if (!numbers.length) return { skipped: true, reason: 'no_valid_phone' };

    const freq = Number(cfg.frequencyMinutes) || 15;
    if (!this.shouldSend(task.id, freq)) {
      return { skipped: true, reason: 'throttled' };
    }

    const provider = (cfg.provider || (cfg.gatewayUrl && !cfg.gatewayUrl.includes('callmebot') ? 'openwa' : 'callmebot')).toLowerCase();
    const message = buildSuperUrgentMessage(task, deadlineTimestamp, settings);

    const results = [];
    for (const phone of numbers) {
      if (provider === 'openwa') {
        results.push(await sendOpenWaMessage({
          gatewayUrl: cfg.gatewayUrl || 'http://localhost:2785',
          apiKey: cfg.apiKey || '',
          sessionId: cfg.sessionId || 'default',
          phone,
          text: message,
        }));
      } else {
        results.push(await sendCallMeBotMessage({
          phone,
          apiKey: cfg.apiKey || '',
          text: message,
        }));
      }
    }

    const anyOk = results.some((r) => r.ok);
    if (anyOk) {
      this.recordSent(task.id);
    }
    return { ok: anyOk, results, count: numbers.length };
  }

  /**
   * Test WhatsApp connection to all configured phone numbers
   */
  async sendTest(cfg) {
    let numbers = parsePhoneNumbers(cfg?.phoneNumbers || cfg?.phone);
    if (cfg?.sendToGroup && cfg?.groupId && cfg?.groupId.trim()) {
      numbers.push(cfg.groupId.trim());
    }
    if (!numbers.length) return { ok: false, error: 'يرجى إدخال رقم هاتف واحد على الأقل أو معرّف مجموعة' };

    const provider = (cfg?.provider || (cfg?.gatewayUrl && !cfg?.gatewayUrl.includes('callmebot') && cfg?.gatewayUrl !== 'http://localhost:2785' ? 'openwa' : 'callmebot')).toLowerCase();
    const isCallMeBot = provider !== 'openwa';
    const senderName = (cfg?.senderName || '').trim();

    let text = (senderName ? `🤖 *[الراسل: ${senderName}]*\n\n` : '') +
      '🔔 *تجربة تنبيهات WhatsApp من ودجت سطح المكتب (Mirqat Widgets)*\n\n' +
      (isCallMeBot
        ? '✅ تم التحقق من الاتصال بنجاح مع خدمة CallMeBot السحابية مجاناً!\n'
        : '✅ تم التحقق من الاتصال بنجاح مع بوابة OpenWA!\n') +
      'ستصلك تنبيهات المهام العاجلة وتكليفات Google Classroom على هذا الرقم فور اقتراب موعد التسليم.';

    const results = [];
    for (const phone of numbers) {
      if (isCallMeBot) {
        results.push(await sendCallMeBotMessage({
          phone,
          apiKey: cfg?.apiKey || '',
          text,
        }));
      } else {
        results.push(await sendOpenWaMessage({
          gatewayUrl: cfg?.gatewayUrl || 'http://localhost:2785',
          apiKey: cfg?.apiKey || '',
          sessionId: cfg?.sessionId || 'default',
          phone,
          text,
        }));
      }
    }

    const anyOk = results.some((r) => r.ok);
    const firstErr = results.find((r) => !r.ok)?.error;
    return {
      ok: anyOk,
      sentTo: numbers.length,
      results,
      error: anyOk ? undefined : firstErr,
    };
  }

  /**
   * Generic send method for any notification, report or alert
   * Static and instance compatible.
   * @param {Object} settings
   * @param {Object} payload
   * @param {string} payload.text
   * @param {string} [payload.recipient]
   */
  static async send(settings, { text, recipient = '' } = {}) {
    if (!text || !text.trim()) {
      return { ok: false, error: 'نص الرسالة فارغ' };
    }
    const s = settings || {};
    const waCfg = s.whatsapp || (s.enabled !== undefined ? s : {});

    let recipients = [];
    if (recipient && String(recipient).trim()) {
      recipients = [String(recipient).trim()];
    } else {
      recipients = parsePhoneNumbers(waCfg.phoneNumbers || waCfg.phone);
      if (waCfg.sendToGroup && waCfg.groupId && waCfg.groupId.trim()) {
        recipients.push(waCfg.groupId.trim());
      }
    }

    if (!recipients.length) {
      return { ok: false, error: 'لا يوجد رقم هاتف أو معرّف مجموعة محدد في إعدادات الواتساب' };
    }

    const provider = (waCfg.provider || 'openwa').toLowerCase();
    const results = [];

    for (const phone of recipients) {
      if (provider === 'openwa') {
        const res = await sendOpenWaMessage({
          gatewayUrl: waCfg.gatewayUrl || 'http://localhost:2785',
          apiKey: waCfg.apiKey || '',
          sessionId: waCfg.sessionId || 'default',
          phone,
          text,
        });
        results.push(res);
      } else {
        const res = await sendCallMeBotMessage({
          phone,
          apiKey: waCfg.apiKey || '',
          text,
        });
        results.push(res);
      }
    }

    const anyOk = results.some((r) => r.ok);
    const firstErr = results.find((r) => !r.ok)?.error;
    return {
      ok: anyOk,
      recipients,
      results,
      error: anyOk ? undefined : firstErr,
    };
  }

  async send(settings, payload) {
    return WhatsAppDispatcher.send(settings, payload);
  }
}

module.exports = {
  formatPhoneNumber,
  formatCallMeBotPhone,
  sendOpenWaMessage,
  sendCallMeBotMessage,
  formatTimeLeft,
  parsePhoneNumbers,
  buildSuperUrgentMessage,
  WhatsAppDispatcher,
};
