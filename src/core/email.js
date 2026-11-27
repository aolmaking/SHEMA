'use strict';
/**
 * Standalone IMAP & SMTP Email Engine for Mirqat Widgets.
 *
 * Implements a full-featured IMAP & SMTP client using Node's built-in tls/net
 * with zero external dependencies. Supports:
 *   - Gmail, Outlook/Hotmail, Yahoo, iCloud, and custom IMAP/SMTP servers
 *   - Real-time IMAP IDLE push notifications for immediate message arrival
 *   - Full RFC 2047 decoding (Arabic, UTF-8, Windows-1256, Base64, Quoted-Printable)
 *   - Full MIME multipart parser extracting HTML, plain text, and attachments (PDF, images, etc.)
 *   - Full RFC 2822 SMTP message composition & sending with file attachments
 *   - Offline caching of recent emails in emails.json
 *   - Native Windows notification triggers for new arrivals
 *   - Server-side read/unread flag synchronization and deletion
 */

const tls = require('tls');
const net = require('net');
const EventEmitter = require('events');
const { Store } = require('./store');
const paths = require('./paths');

/** Pre-configured settings for common email providers */
const PROVIDERS = {
  gmail: {
    name: 'Gmail',
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 465,
    smtpSecure: true,
  },
  outlook: {
    name: 'Outlook / Hotmail',
    host: 'outlook.office365.com',
    port: 993,
    secure: true,
    smtpHost: 'smtp.office365.com',
    smtpPort: 587,
    smtpSecure: false,
  },
  yahoo: {
    name: 'Yahoo Mail',
    host: 'imap.mail.yahoo.com',
    port: 993,
    secure: true,
    smtpHost: 'smtp.mail.yahoo.com',
    smtpPort: 465,
    smtpSecure: true,
  },
  icloud: {
    name: 'iCloud',
    host: 'imap.mail.me.com',
    port: 993,
    secure: true,
    smtpHost: 'smtp.mail.me.com',
    smtpPort: 587,
    smtpSecure: false,
  },
  custom: {
    name: 'Custom IMAP',
    host: '',
    port: 993,
    secure: true,
    smtpHost: '',
    smtpPort: 465,
    smtpSecure: true,
  },
};

/** Decode RFC 2047 encoded-word strings (e.g. =?UTF-8?B?...?= or =?UTF-8?Q?...?=) */
function decodeRfc2047(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const cleaned = raw.replace(/\r?\n\s*/g, ' ').trim();
  if (!cleaned.includes('=?')) return cleaned;

  const regex = /=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g;
  return cleaned.replace(regex, (match, charset, encoding, text) => {
    try {
      const enc = encoding.toUpperCase();
      const cs = charset.toLowerCase();
      if (enc === 'B') {
        const buf = Buffer.from(text, 'base64');
        return new TextDecoder(cs).decode(buf);
      } else if (enc === 'Q') {
        const unescaped = text.replace(/_/g, ' ').replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => {
          return String.fromCharCode(parseInt(hex, 16));
        });
        const bytes = new Uint8Array(unescaped.length);
        for (let i = 0; i < unescaped.length; i++) bytes[i] = unescaped.charCodeAt(i);
        return new TextDecoder(cs).decode(bytes);
      }
    } catch {
      return match;
    }
    return match;
  });
}

/** Decode Quoted-Printable strings */
function decodeQuotedPrintable(str, charset = 'utf-8') {
  if (!str) return '';
  const clean = str.replace(/=(?:\r\n|\n|\r)/g, '');
  const bytes = [];
  for (let i = 0; i < clean.length; i++) {
    if (clean[i] === '=' && i + 2 < clean.length && /^[0-9A-Fa-f]{2}$/.test(clean.slice(i + 1, i + 3))) {
      bytes.push(parseInt(clean.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(clean.charCodeAt(i));
    }
  }
  try {
    return new TextDecoder(charset).decode(new Uint8Array(bytes));
  } catch {
    return Buffer.from(bytes).toString('utf8');
  }
}

/** Decode Base64 text */
function decodeBase64Text(str, charset = 'utf-8') {
  if (!str) return '';
  const buf = Buffer.from(str.replace(/\s+/g, ''), 'base64');
  try {
    return new TextDecoder(charset).decode(buf);
  } catch {
    return buf.toString('utf8');
  }
}

/** Parse "Sender Name <email@domain.com>" or "email@domain.com" */
function parseAddress(raw) {
  if (!raw) return { name: '', address: '' };
  const decoded = decodeRfc2047(raw.trim());
  const angleMatch = decoded.match(/^(.*?)\s*<([^>]+)>$/);
  if (angleMatch) {
    let name = angleMatch[1].trim().replace(/^["']|["']$/g, '');
    let address = angleMatch[2].trim();
    return { name: name || address.split('@')[0], address };
  }
  return { name: decoded.split('@')[0], address: decoded };
}

/** Clean up email preview snippets */
function cleanSnippet(raw) {
  if (!raw) return '';
  return raw
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220);
}

/** Parse headers block into key/value map */
function parseHeaderLines(block) {
  const headers = {};
  if (!block) return headers;
  const lines = block.split(/\r?\n/);
  let currentKey = '';
  for (const line of lines) {
    if (/^\s+/.test(line) && currentKey) {
      headers[currentKey] += ' ' + line.trim();
    } else {
      const colon = line.indexOf(':');
      if (colon !== -1) {
        currentKey = line.slice(0, colon).trim().toLowerCase();
        headers[currentKey] = line.slice(colon + 1).trim();
      }
    }
  }
  return headers;
}

/** Split multipart MIME message body by boundary delimiter */
function splitMultipart(body, boundary) {
  const parts = [];
  if (!body || !boundary) return parts;
  const delimiter = `--${boundary}`;
  const rawParts = body.split(delimiter);
  for (let i = 1; i < rawParts.length; i++) {
    const part = rawParts[i];
    if (part.startsWith('--')) break; // End boundary reached
    const splitIdx = part.indexOf('\r\n\r\n');
    let hBlock = '';
    let bBlock = '';
    if (splitIdx !== -1) {
      hBlock = part.slice(0, splitIdx).replace(/^\r?\n/, '');
      bBlock = part.slice(splitIdx + 4).replace(/\r?\n$/, '');
    } else {
      const alt = part.indexOf('\n\n');
      if (alt !== -1) {
        hBlock = part.slice(0, alt).replace(/^\n/, '');
        bBlock = part.slice(alt + 2).replace(/\n$/, '');
      }
    }
    if (hBlock || bBlock) {
      parts.push({ headers: parseHeaderLines(hBlock), body: bBlock });
    }
  }
  return parts;
}

/** Parse complete RFC 822 MIME message into structured HTML, text, and attachments */
function parseMime(raw) {
  if (!raw) return { text: '', html: '', attachments: [] };

  const splitIdx = raw.indexOf('\r\n\r\n');
  const splitLen = 4;
  let headerBlock = '';
  let bodyBlock = '';
  if (splitIdx !== -1) {
    headerBlock = raw.slice(0, splitIdx);
    bodyBlock = raw.slice(splitIdx + splitLen);
  } else {
    const altIdx = raw.indexOf('\n\n');
    if (altIdx !== -1) {
      headerBlock = raw.slice(0, altIdx);
      bodyBlock = raw.slice(altIdx + 2);
    } else {
      bodyBlock = raw;
    }
  }

  const rootHeaders = parseHeaderLines(headerBlock);
  const rootContentType = rootHeaders['content-type'] || 'text/plain';

  const attachments = [];
  let html = '';
  let text = '';

  function parsePart(headers, body) {
    const cType = headers['content-type'] || 'text/plain';
    const cDisp = headers['content-disposition'] || '';
    const encoding = (headers['content-transfer-encoding'] || '7bit').toLowerCase().trim();

    // Check for attachment filename
    let filename = '';
    const fnMatch = cDisp.match(/filename\*?=(?:"([^"]+)"|([^;\s]+))/i) || cType.match(/name\*?=(?:"([^"]+)"|([^;\s]+))/i);
    if (fnMatch) filename = decodeRfc2047(fnMatch[1] || fnMatch[2] || '');

    const isAttachment = Boolean(filename) || cDisp.toLowerCase().startsWith('attachment');

    if (isAttachment) {
      let b64 = '';
      if (encoding === 'base64') {
        b64 = body.replace(/\s+/g, '');
      } else {
        b64 = Buffer.from(body).toString('base64');
      }
      const size = Math.round(b64.length * 0.75);
      attachments.push({
        filename: filename || 'attachment.dat',
        contentType: cType.split(';')[0].trim().toLowerCase(),
        size,
        base64: b64,
      });
      return;
    }

    if (cType.toLowerCase().includes('multipart/')) {
      const bMatch = cType.match(/boundary=(?:"([^"]+)"|([^;\s]+))/i);
      if (bMatch) {
        const boundary = bMatch[1] || bMatch[2];
        const parts = splitMultipart(body, boundary);
        for (const p of parts) {
          parsePart(p.headers, p.body);
        }
        return;
      }
    }

    let decoded = '';
    const csMatch = cType.match(/charset=(?:"([^"]+)"|([^;\s]+))/i);
    const charset = (csMatch ? csMatch[1] || csMatch[2] : 'utf-8').toLowerCase();

    if (encoding === 'base64') {
      decoded = decodeBase64Text(body, charset);
    } else if (encoding === 'quoted-printable') {
      decoded = decodeQuotedPrintable(body, charset);
    } else {
      decoded = body;
    }

    if (cType.toLowerCase().includes('text/html')) {
      if (!html || decoded.length > html.length) html = decoded;
    } else if (cType.toLowerCase().includes('text/plain')) {
      if (!text || decoded.length > text.length) text = decoded;
    }
  }

  if (rootContentType.toLowerCase().includes('multipart/')) {
    const bMatch = rootContentType.match(/boundary=(?:"([^"]+)"|([^;\s]+))/i);
    if (bMatch) {
      const boundary = bMatch[1] || bMatch[2];
      const parts = splitMultipart(bodyBlock, boundary);
      for (const p of parts) {
        parsePart(p.headers, p.body);
      }
    }
  } else {
    parsePart(rootHeaders, bodyBlock);
  }

  const rawSubject = rootHeaders['subject'] || '';
  const subject = decodeRfc2047(rawSubject).trim();

  const rawFrom = rootHeaders['from'] || '';
  const parsedFrom = parseAddress(rawFrom);

  const rawTo = rootHeaders['to'] || '';
  const parsedTo = parseAddress(rawTo);

  let date = Date.now();
  if (rootHeaders['date']) {
    const d = new Date(rootHeaders['date']);
    if (!isNaN(d.getTime())) date = d.getTime();
  }

  return {
    subject,
    from: parsedFrom.name || parsedFrom.address || '',
    fromEmail: parsedFrom.address || '',
    to: parsedTo.address || parsedTo.name || '',
    date,
    html: html || '',
    text: text || cleanSnippet(html),
    attachments,
  };
}

/* ==================================================================== *
 * Lightweight IMAP Client
 * ==================================================================== */

class ImapClient {
  constructor(config) {
    this.config = config;
    this.socket = null;
    this.tagIndex = 0;
    this.buffer = '';
    this.connected = false;
    this.authenticated = false;
    this.idling = false;
  }

  nextTag() {
    this.tagIndex += 1;
    return `A${String(this.tagIndex).padStart(4, '0')}`;
  }

  connect(timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this.destroy();
          reject(new Error('انتهت مهلة الاتصال بالخادم.'));
        }
      }, timeoutMs);

      const opts = {
        host: this.config.host,
        port: Number(this.config.port) || (this.config.secure ? 993 : 143),
        rejectUnauthorized: false,
      };

      const onConnect = () => {
        this.connected = true;
      };

      if (this.config.secure !== false) {
        this.socket = tls.connect(opts, onConnect);
      } else {
        this.socket = net.connect(opts, onConnect);
      }

      this.socket.setEncoding('utf8');

      const onInitialData = (chunk) => {
        this.buffer += chunk;
        if (this.buffer.includes('\n')) {
          this.socket.removeListener('data', onInitialData);
          clearTimeout(timer);
          resolved = true;
          const line = this.buffer.slice(0, this.buffer.indexOf('\n'));
          this.buffer = this.buffer.slice(this.buffer.indexOf('\n') + 1);
          if (line.toUpperCase().includes('OK')) {
            resolve();
          } else {
            reject(new Error(`فشل بدء الاتصال مع الخادم: ${line.trim()}`));
          }
        }
      };

      this.socket.on('data', onInitialData);
      this.socket.on('error', (err) => {
        clearTimeout(timer);
        if (!resolved) {
          resolved = true;
          reject(err);
        }
      });
      this.socket.on('close', () => {
        this.connected = false;
      });
    });
  }

  exec(cmd, timeoutMs = 25000) {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.destroyed) {
        return reject(new Error('انقطع الاتصال بالخادم'));
      }

      const tag = this.nextTag();
      const fullCmd = `${tag} ${cmd}\r\n`;
      let lines = [];
      let currentBuffer = this.buffer;
      this.buffer = '';

      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`انتهت مهلة الأمر ${cmd.split(' ')[0]}`));
      }, timeoutMs);

      const onData = (chunk) => {
        currentBuffer += chunk;
        while (true) {
          const newlineIdx = currentBuffer.indexOf('\n');
          if (newlineIdx === -1) break;

          const rawLine = currentBuffer.slice(0, newlineIdx).replace(/\r$/, '');
          currentBuffer = currentBuffer.slice(newlineIdx + 1);

          lines.push(rawLine);

          if (rawLine.startsWith(`${tag} `)) {
            cleanup();
            const status = rawLine.slice(tag.length + 1).trim();
            if (status.toUpperCase().startsWith('OK')) {
              resolve({ lines, tag, status });
            } else {
              reject(new Error(`IMAP error: ${status}`));
            }
            return;
          }
        }
      };

      const onError = (err) => {
        cleanup();
        reject(err);
      };

      const cleanup = () => {
        clearTimeout(timer);
        this.buffer = currentBuffer;
        if (this.socket) {
          this.socket.removeListener('data', onData);
          this.socket.removeListener('error', onError);
        }
      };

      this.socket.on('data', onData);
      this.socket.on('error', onError);
      this.socket.write(fullCmd);
    });
  }

  /** Read full RFC 822 email literal body by UID */
  fetchMessageRaw(uid, timeoutMs = 35000) {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.destroyed) {
        return reject(new Error('انقطع الاتصال بالخادم'));
      }

      const tag = this.nextTag();
      const fullCmd = `${tag} UID FETCH ${uid} (UID FLAGS BODY.PEEK[])\r\n`;

      let buffer = Buffer.alloc(0);
      let literalRemaining = 0;
      let literalData = Buffer.alloc(0);
      let inLiteral = false;
      let lines = [];
      let resolved = false;

      const done = (err, val) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          if (this.socket) {
            this.socket.removeListener('data', onData);
            this.socket.removeListener('error', onError);
          }
          if (err) reject(err); else resolve(val);
        }
      };

      const timer = setTimeout(() => done(new Error('انتهت مهلة جلب محتوى الرسالة')), timeoutMs);

      const onData = (chunk) => {
        const chunkBuf = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
        buffer = Buffer.concat([buffer, chunkBuf]);

        while (buffer.length > 0) {
          if (inLiteral) {
            if (buffer.length >= literalRemaining) {
              const part = buffer.subarray(0, literalRemaining);
              literalData = Buffer.concat([literalData, part]);
              buffer = buffer.subarray(literalRemaining);
              inLiteral = false;
              literalRemaining = 0;
            } else {
              literalData = Buffer.concat([literalData, buffer]);
              literalRemaining -= buffer.length;
              buffer = Buffer.alloc(0);
              break;
            }
          } else {
            const nlIdx = buffer.indexOf(10); // \n
            if (nlIdx === -1) break;

            const line = buffer.subarray(0, nlIdx).toString('utf8').replace(/\r$/, '');
            buffer = buffer.subarray(nlIdx + 1);
            lines.push(line);

            // Literal declared: {size}
            const litMatch = line.match(/\{(\d+)\}\s*$/);
            if (litMatch) {
              literalRemaining = parseInt(litMatch[1], 10);
              inLiteral = true;
              continue;
            }

            if (line.startsWith(`${tag} `)) {
              const status = line.slice(tag.length + 1).trim();
              if (status.toUpperCase().startsWith('OK')) {
                done(null, { raw: literalData.toString('utf8'), rawBuffer: literalData, lines });
              } else {
                done(new Error(`IMAP error: ${status}`));
              }
              return;
            }
          }
        }
      };

      const onError = (err) => done(err);

      this.socket.on('data', onData);
      this.socket.on('error', onError);
      this.socket.write(fullCmd);
    });
  }

  async login(user, pass) {
    const escape = (s) => `"${String(s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    const res = await this.exec(`LOGIN ${escape(user)} ${escape(pass)}`);
    this.authenticated = true;
    return res;
  }

  async select(mailbox = 'INBOX') {
    const res = await this.exec(`SELECT "${mailbox}"`);
    let count = 0;
    let unseen = 0;
    for (const line of res.lines) {
      const match = line.match(/^\*\s+(\d+)\s+EXISTS/i);
      if (match) count = parseInt(match[1], 10);
      const unseenMatch = line.match(/UNSEEN\s+(\d+)/i);
      if (unseenMatch) unseen = parseInt(unseenMatch[1], 10);
    }
    return { count, unseen, lines: res.lines };
  }

  async fetchHeaders(sequenceSet) {
    if (!sequenceSet) return [];
    const cmd = `FETCH ${sequenceSet} (UID FLAGS BODY.PEEK[HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID)])`;
    const res = await this.exec(cmd);
    const messages = [];
    let currentMsg = null;
    let inHeader = false;

    for (const line of res.lines) {
      const fetchStart = line.match(/^\*\s+(\d+)\s+FETCH\s+\((.*)/i);
      if (fetchStart) {
        currentMsg = {
          seq: parseInt(fetchStart[1], 10),
          uid: null,
          flags: [],
          from: '',
          to: '',
          subject: '',
          date: '',
          id: '',
          unread: true,
        };
        const rest = fetchStart[2];
        const uidMatch = rest.match(/UID\s+(\d+)/i);
        if (uidMatch) currentMsg.uid = uidMatch[1];
        const flagsMatch = rest.match(/FLAGS\s+\(([^)]*)\)/i);
        if (flagsMatch) {
          currentMsg.flags = flagsMatch[1].split(/\s+/).filter(Boolean);
          currentMsg.unread = !currentMsg.flags.some((f) => f.toUpperCase() === '\\SEEN');
        }
        if (line.includes('HEADER.FIELDS')) inHeader = true;
        continue;
      }

      if (inHeader && currentMsg) {
        if (line === ')' || line.endsWith(')')) {
          inHeader = false;
          messages.push(currentMsg);
          currentMsg = null;
          continue;
        }

        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          const headerName = line.slice(0, colonIdx).trim().toLowerCase();
          const headerVal = line.slice(colonIdx + 1).trim();
          if (headerName === 'subject') currentMsg.subject = decodeRfc2047(headerVal);
          else if (headerName === 'from') currentMsg.from = decodeRfc2047(headerVal);
          else if (headerName === 'to') currentMsg.to = decodeRfc2047(headerVal);
          else if (headerName === 'date') currentMsg.date = headerVal;
          else if (headerName === 'message-id') currentMsg.id = headerVal.replace(/[<>]/g, '');
        }
      }
    }

    if (currentMsg) messages.push(currentMsg);
    return messages;
  }

  async markSeen(uid, seen = true) {
    const flag = '\\Seen';
    const op = seen ? '+FLAGS' : '-FLAGS';
    return this.exec(`UID STORE ${uid} ${op} (${flag})`);
  }

  async deleteMsg(uid) {
    await this.exec(`UID STORE ${uid} +FLAGS (\\Deleted)`);
    try { await this.exec('EXPUNGE'); } catch { /* ignore */ }
    return true;
  }

  destroy() {
    if (this.socket) {
      try { this.socket.destroy(); } catch { /* ignore */ }
      this.socket = null;
    }
    this.connected = false;
    this.authenticated = false;
    this.idling = false;
  }
}

/* ==================================================================== *
 * Lightweight SMTP Client (Compose & Send)
 * ==================================================================== */

class SmtpClient {
  constructor(config) {
    this.config = config;
    this.socket = null;
  }

  async sendMail({ to, cc, bcc, subject, text, html, attachments = [] }) {
    const prov = PROVIDERS[this.config.provider] || {};
    const host = this.config.smtpHost || prov.smtpHost || 'smtp.gmail.com';
    const port = Number(this.config.smtpPort) || prov.smtpPort || 465;
    const user = this.config.user;
    const pass = this.config.pass;

    if (!user || !pass) {
      throw new Error('بيانات البريد الإلكتروني أو كلمة المرور غير محددة');
    }

    return new Promise((resolve, reject) => {
      let resolved = false;
      const done = (err, val) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          if (this.socket) { try { this.socket.destroy(); } catch {} }
          if (err) reject(err); else resolve(val);
        }
      };

      const timer = setTimeout(() => done(new Error('انتهت مهلة إرسال البريد الإلكتروني')), 30000);

      this.socket = tls.connect({ host, port, rejectUnauthorized: false }, () => {});
      this.socket.setEncoding('utf8');

      let step = 'greeting';
      let buffer = '';

      const send = (line) => {
        if (this.socket && !this.socket.destroyed) {
          this.socket.write(line + '\r\n');
        }
      };

      const recipients = [
        ...to.split(',').map((s) => s.trim()).filter(Boolean),
        ...(cc ? cc.split(',').map((s) => s.trim()).filter(Boolean) : []),
        ...(bcc ? bcc.split(',').map((s) => s.trim()).filter(Boolean) : []),
      ];

      if (recipients.length === 0) {
        return done(new Error('يرجى تحديد عنوان المستلم (To)'));
      }

      let rcptIndex = 0;

      this.socket.on('data', (chunk) => {
        buffer += chunk;
        while (buffer.includes('\n')) {
          const lineIdx = buffer.indexOf('\n');
          const line = buffer.slice(0, lineIdx).trim();
          buffer = buffer.slice(lineIdx + 1);

          if (/^\d{3}-/.test(line)) continue; // Multiline SMTP code

          const code = parseInt(line.slice(0, 3), 10);

          if (step === 'greeting') {
            if (code !== 220) return done(new Error(`فشل بدء اتصال SMTP: ${line}`));
            step = 'ehlo';
            send('EHLO localhost');
          } else if (step === 'ehlo') {
            if (code !== 250) return done(new Error(`EHLO failed: ${line}`));
            step = 'auth';
            send('AUTH LOGIN');
          } else if (step === 'auth') {
            if (code !== 334) return done(new Error(`AUTH LOGIN failed: ${line}`));
            step = 'user';
            send(Buffer.from(user).toString('base64'));
          } else if (step === 'user') {
            if (code !== 334) return done(new Error(`Username failed: ${line}`));
            step = 'pass';
            send(Buffer.from(pass).toString('base64'));
          } else if (step === 'pass') {
            if (code !== 235) return done(new Error(`فشل المصادقة: تأكد من كلمة مرور التطبيق (App Password).`));
            step = 'mail_from';
            send(`MAIL FROM:<${user}>`);
          } else if (step === 'mail_from') {
            if (code !== 250) return done(new Error(`MAIL FROM failed: ${line}`));
            step = 'rcpt_to';
            send(`RCPT TO:<${recipients[0]}>`);
            rcptIndex = 1;
          } else if (step === 'rcpt_to') {
            if (code !== 250) return done(new Error(`فشل المستلم ${recipients[rcptIndex - 1]}: ${line}`));
            if (rcptIndex < recipients.length) {
              send(`RCPT TO:<${recipients[rcptIndex]}>`);
              rcptIndex++;
            } else {
              step = 'data';
              send('DATA');
            }
          } else if (step === 'data') {
            if (code !== 354) return done(new Error(`DATA command failed: ${line}`));
            step = 'sending_data';

            const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`;
            const subEncoded = `=?UTF-8?B?${Buffer.from(subject || '').toString('base64')}?=`;

            let mime = [
              `From: <${user}>`,
              `To: ${recipients.join(', ')}`,
              ...(cc ? [`Cc: ${cc}`] : []),
              `Subject: ${subEncoded}`,
              `Date: ${new Date().toUTCString()}`,
              `MIME-Version: 1.0`,
            ];

            if (attachments.length > 0) {
              mime.push(`Content-Type: multipart/mixed; boundary="${boundary}"`, '', `--${boundary}`);
              mime.push(
                `Content-Type: text/html; charset="UTF-8"`,
                `Content-Transfer-Encoding: 8bit`,
                '',
                html || `<div style="font-family: sans-serif; white-space: pre-wrap;">${text || ''}</div>`,
                ''
              );

              for (const att of attachments) {
                const b64 = att.base64 || (att.data ? Buffer.from(att.data).toString('base64') : '');
                const attName = `=?UTF-8?B?${Buffer.from(att.filename || 'file').toString('base64')}?=`;
                mime.push(
                  `--${boundary}`,
                  `Content-Type: ${att.contentType || 'application/octet-stream'}; name="${attName}"`,
                  `Content-Disposition: attachment; filename="${attName}"`,
                  `Content-Transfer-Encoding: base64`,
                  '',
                  b64,
                  ''
                );
              }
              mime.push(`--${boundary}--`);
            } else {
              mime.push(
                `Content-Type: text/html; charset="UTF-8"`,
                `Content-Transfer-Encoding: 8bit`,
                '',
                html || `<div style="font-family: sans-serif; white-space: pre-wrap;">${text || ''}</div>`
              );
            }

            const payload = mime.join('\r\n') + '\r\n.\r\n';
            this.socket.write(payload);
          } else if (step === 'sending_data') {
            if (code !== 250) return done(new Error(`فشل إرسال محتوى الرسالة: ${line}`));
            step = 'quit';
            send('QUIT');
            done(null, { ok: true });
          }
        }
      });

      this.socket.on('error', (err) => done(err));
    });
  }
}

/* ==================================================================== *
 * Email Engine (Orchestrator)
 * ==================================================================== */

class EmailEngine extends EventEmitter {
  constructor(storePath, getSettings) {
    super();
    this.storePath = storePath;
    this.getSettings = getSettings;
    this.store = new Store(storePath, {
      items: [],
      unreadCount: 0,
      lastCheck: null,
      lastError: null,
    });
    this.pollTimer = null;
    this.idleClient = null;
    this.idleReconnectTimer = null;
    this.running = false;
    this.isChecking = false;
    this.seenUids = new Set(this.store.get('items', []).map((m) => String(m.uid)));
    this.detailCache = new Map(); // uid -> full parsed message detail
  }

  get config() {
    const s = this.getSettings() || {};
    const em = s.email || {};
    const hasCreds = Boolean(em.user && em.pass);
    const enabled = Boolean(em.enabled || hasCreds);
    return { ...em, enabled };
  }

  start() {
    this.stop();
    this.running = true;
    if (!this.config.enabled) return;

    // Immediate initial check on startup
    this.check();

    // Setup periodic polling interval
    const intervalMinutes = Math.max(1, Number(this.config.interval) || 1);
    this.pollTimer = setInterval(() => {
      if (this.running) this.check();
    }, intervalMinutes * 60 * 1000);
    if (this.pollTimer.unref) this.pollTimer.unref();

    // Start background IDLE for instantaneous notifications
    this.startIdle();
  }

  stop() {
    this.running = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.idleReconnectTimer) {
      clearTimeout(this.idleReconnectTimer);
      this.idleReconnectTimer = null;
    }
    if (this.idleClient) {
      try { this.idleClient.destroy(); } catch {}
      this.idleClient = null;
    }
  }

  /** Background IMAP IDLE connection for real-time instant alerts */
  async startIdle() {
    const cfg = this.config;
    if (!this.running || !cfg.enabled || !cfg.user || !cfg.pass) return;

    try {
      if (this.idleClient) {
        try { this.idleClient.destroy(); } catch {}
      }
      const client = new ImapClient(cfg);
      this.idleClient = client;

      await client.connect(15000);
      if (!this.running) {
        try { client.destroy(); } catch {}
        return;
      }
      await client.login(cfg.user, cfg.pass);
      if (!this.running) {
        try { client.destroy(); } catch {}
        return;
      }
      await client.select('INBOX');
      if (!this.running) {
        try { client.destroy(); } catch {}
        return;
      }

      const tag = client.nextTag();
      client.socket.write(`${tag} IDLE\r\n`);
      client.idling = true;

      let idleBuffer = '';
      client.socket.on('data', (chunk) => {
        if (!this.running) return;
        idleBuffer += chunk;
        if (idleBuffer.toUpperCase().includes('EXISTS') || idleBuffer.toUpperCase().includes('RECENT')) {
          idleBuffer = '';
          // New email arrived! Check immediately
          this.check();
        }
      });

      client.socket.on('close', () => {
        if (this.running && this.config.enabled) {
          if (this.idleReconnectTimer) clearTimeout(this.idleReconnectTimer);
          this.idleReconnectTimer = setTimeout(() => {
            if (this.running) this.startIdle();
          }, 15000);
        }
      });
    } catch {
      // IDLE unsupported or failed; fallback cleanly to timer polling
    }
  }

  /** Humanize and translate raw IMAP errors into clear actionable Arabic descriptions */
  humanizeError(err) {
    const code = (err && err.code) || '';
    const msg = (err && (err.message || String(err))) || '';

    if (code === 'ENOTFOUND' || code === 'EAI_AGAIN' || msg.includes('ENOTFOUND') || msg.includes('getaddrinfo')) {
      return {
        type: 'network',
        title: 'انقطع الاتصال بالإنترنت',
        detail: 'تعذر الوصول إلى خوادم البريد (imap.gmail.com). تأكد من اتصال جهازك بالإنترنت أو شبكة Wi-Fi.',
        raw: msg,
        userFriendly: 'انقطع الاتصال بالإنترنت (تعذر الوصول إلى خادم البريد)',
      };
    }
    if (msg.includes('Application-specific password required') || msg.includes('Application-specific') || msg.includes('185833')) {
      return {
        type: 'auth_app_pass',
        title: 'مطلوب كلمة مرور تطبيقات',
        detail: 'يتطلب Google استخدام كلمة مرور تطبيقات (App Password) مكونة من 16 حرفاً بدلاً من كلمة المرور العادية.',
        raw: msg,
        userFriendly: 'يتطلب Google كلمة مرور تطبيقات (App Password) مكونة من 16 حرفاً.',
      };
    }
    if (msg.includes('AUTHENTICATIONFAILED') || msg.includes('Invalid credentials') || msg.includes('credentials') || msg.includes('NO [ALERT]')) {
      return {
        type: 'auth',
        title: 'خطأ في بيانات الحساب',
        detail: 'فشل تسجيل الدخول. تحقق من صحة البريد واستخدم كلمة مرور التطبيقات (App Password).',
        raw: msg,
        userFriendly: 'فشل تسجيل الدخول: تحقق من صحة البريد واستخدم كلمة مرور التطبيقات.',
      };
    }
    if (code === 'ETIMEDOUT' || msg.includes('ETIMEDOUT') || msg.includes('timed out')) {
      return {
        type: 'timeout',
        title: 'انتهت مهلة الاتصال بالخادم',
        detail: 'استغرق الخادم وقتاً أطول من المتوقع للاستجابة. تحقق من سرعة الشبكة أو جدار الحماية.',
        raw: msg,
        userFriendly: 'انتهت مهلة الاتصال بالخادم. تحقق من اسم الخادم والمنفذ.',
      };
    }
    if (code === 'ECONNREFUSED' || msg.includes('ECONNREFUSED')) {
      return {
        type: 'refused',
        title: 'تم رفض الاتصال بالخادم',
        detail: 'تأكد من صحة رقم المنفذ (993) وتفعيل بروتوكول SSL/TLS في إعدادات البريد.',
        raw: msg,
        userFriendly: 'رفض الخادم الاتصال. تأكد من صحة المنفذ وتفعيل التشفير.',
      };
    }
    return {
      type: 'unknown',
      title: 'تعذر الاتصال بخادم البريد',
      detail: msg,
      raw: msg,
      userFriendly: msg || 'فشل الاتصال بخادم البريد',
    };
  }

  async testConnection(customConfig = null) {
    const cfg = customConfig ? { ...this.config, ...customConfig } : this.config;
    if (!cfg.user || !cfg.pass) {
      return { ok: false, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' };
    }
    const client = new ImapClient(cfg);
    try {
      await client.connect(12000);
      await client.login(cfg.user, cfg.pass);
      const { count, unseen } = await client.select('INBOX');
      client.destroy();
      return { ok: true, count, unseen };
    } catch (err) {
      client.destroy();
      const parsed = this.humanizeError(err);
      return { ok: false, error: parsed.userFriendly, errorObj: parsed };
    }
  }

  async check() {
    if (this.isChecking) return;
    const cfg = this.config;
    if (!cfg.enabled || !cfg.user || !cfg.pass) return;

    this.isChecking = true;
    const client = new ImapClient(cfg);

    try {
      await client.connect(15000);
      await client.login(cfg.user, cfg.pass);
      const mailbox = await client.select('INBOX');
      const total = mailbox.count;

      let messages = [];
      if (total > 0) {
        const maxItems = Math.max(5, Number(cfg.maxItems) || 20);
        const start = Math.max(1, total - (maxItems - 1));
        const rawMsgs = await client.fetchHeaders(`${start}:${total}`);

        rawMsgs.sort((a, b) => b.seq - a.seq);

        for (const m of rawMsgs) {
          const fromParsed = parseAddress(m.from);
          const dateObj = m.date ? new Date(m.date) : new Date();
          const timestamp = isNaN(dateObj.getTime()) ? Date.now() : dateObj.getTime();

          messages.push({
            id: m.id || `msg-${m.uid || m.seq}`,
            uid: m.uid || String(m.seq),
            subject: m.subject || '(بدون عنوان)',
            from: fromParsed.name || fromParsed.address,
            fromEmail: fromParsed.address,
            date: timestamp,
            dateRaw: m.date,
            unread: m.unread,
            snippet: m.subject,
            hasAttachments: false, // will update on detail fetch
          });
        }
      }

      client.destroy();

      const newArrivals = [];
      for (const msg of messages) {
        const uidStr = String(msg.uid);
        if (msg.unread && !this.seenUids.has(uidStr)) {
          newArrivals.push(msg);
        }
        this.seenUids.add(uidStr);
      }

      const unreadCount = messages.filter((m) => m.unread).length;

      this.store.set('items', messages);
      this.store.set('unreadCount', unreadCount);
      this.store.set('lastCheck', Date.now());
      this.store.set('lastError', null);
      this.store.save();

      this.emit('update', { items: messages, unreadCount });

      if (newArrivals.length > 0) {
        for (const fresh of newArrivals) {
          this.emit('new-email', fresh);
        }
      }
    } catch (err) {
      client.destroy();
      const parsed = this.humanizeError(err);
      let errMsg = parsed.userFriendly;
      this.store.set('lastError', errMsg);
      this.store.set('lastErrorDetail', parsed.detail);
      this.store.set('lastErrorRaw', parsed.raw);
      this.store.set('lastErrorType', parsed.type);
      this.store.save();
      this.emit('error', errMsg);
    } finally {
      this.isChecking = false;
    }
  }

  /** Fetch full message body, HTML, and attachments for an email */
  async getFullMessage(uid) {
    if (this.detailCache.has(uid)) {
      return this.detailCache.get(uid);
    }

    const cfg = this.config;
    if (!cfg.enabled || !cfg.user || !cfg.pass) {
      throw new Error('إعدادات البريد غير مفعلة');
    }

    const client = new ImapClient(cfg);
    try {
      await client.connect(15000);
      await client.login(cfg.user, cfg.pass);
      await client.select('INBOX');

      const rawResult = await client.fetchMessageRaw(uid);
      client.destroy();

      const parsed = parseMime(rawResult.raw);
      const items = this.store.get('items', []);
      const item = items.find((m) => String(m.uid) === String(uid)) || {};

      const detail = {
        uid,
        subject: parsed.subject || item.subject || '',
        from: parsed.from || item.from || item.fromEmail || '',
        fromEmail: parsed.fromEmail || item.fromEmail || '',
        date: parsed.date || item.date || Date.now(),
        to: parsed.to || item.to || '',
        html: parsed.html,
        text: parsed.text,
        attachments: parsed.attachments || [],
        unread: Boolean(item.unread),
      };

      this.detailCache.set(uid, detail);

      // Also update hasAttachments flag on the list item
      if (item && item.uid && parsed.attachments && parsed.attachments.length > 0 && !item.hasAttachments) {
        item.hasAttachments = true;
        this.store.set('items', items);
        this.store.save();
        this.emit('update', { items, unreadCount: this.store.get('unreadCount', 0) });
      }

      return detail;
    } catch (err) {
      client.destroy();
      throw err;
    }
  }

  async markRead(uid, isRead = true) {
    const items = this.store.get('items', []);
    const found = items.find((m) => String(m.uid) === String(uid));
    if (found) {
      found.unread = !isRead;
      const unreadCount = items.filter((m) => m.unread).length;
      this.store.set('items', items);
      this.store.set('unreadCount', unreadCount);
      this.store.save();
      this.emit('update', { items, unreadCount });
    }

    // Sync to IMAP server asynchronously
    const cfg = this.config;
    if (cfg.enabled && cfg.user && cfg.pass) {
      const client = new ImapClient(cfg);
      client.connect(10000)
        .then(() => client.login(cfg.user, cfg.pass))
        .then(() => client.select('INBOX'))
        .then(() => client.markSeen(uid, isRead))
        .then(() => client.destroy())
        .catch(() => client.destroy());
    }
  }

  async deleteMessage(uid) {
    const items = this.store.get('items', []);
    const nextItems = items.filter((m) => String(m.uid) !== String(uid));
    const unreadCount = nextItems.filter((m) => m.unread).length;
    this.store.set('items', nextItems);
    this.store.set('unreadCount', unreadCount);
    this.store.save();
    this.detailCache.delete(uid);
    this.emit('update', { items: nextItems, unreadCount });

    // Sync deletion to IMAP server
    const cfg = this.config;
    if (cfg.enabled && cfg.user && cfg.pass) {
      const client = new ImapClient(cfg);
      client.connect(10000)
        .then(() => client.login(cfg.user, cfg.pass))
        .then(() => client.select('INBOX'))
        .then(() => client.deleteMsg(uid))
        .then(() => client.destroy())
        .catch(() => client.destroy());
    }
    return true;
  }

  async sendMail(opts) {
    const client = new SmtpClient(this.config);
    return client.sendMail(opts);
  }

  getItems() {
    return this.store.get('items', []);
  }

  getUnreadCount() {
    return this.store.get('unreadCount', 0);
  }
}

module.exports = {
  EmailEngine,
  PROVIDERS,
  decodeRfc2047,
  parseAddress,
  parseMime,
  SmtpClient,
};
