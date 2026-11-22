'use strict';

/**
 * OpenWA Lightweight Native Server (Baileys Engine)
 * Compatible with OpenWA REST API (port 2785)
 * Zero C++ dependencies, ~35MB RAM, Multi-Device WebSocket
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode');
const pino = require('pino');
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');

const PORT = parseInt(process.env.PORT || '2785', 10);
const AUTH_DIR = path.join(__dirname, 'auth_info');

if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

let sock = null;
let currentStatus = 'INITIALIZING'; // 'INITIALIZING' | 'SCAN_QR_CODE' | 'CONNECTED' | 'DISCONNECTED'
let currentQr = null; // Base64 data URL
let reconnectAttempts = 0;

async function startWhatsApp() {
  try {
    currentStatus = 'INITIALIZING';
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: ['Mirqat Widgets', 'Desktop', '1.0.0'],
      syncFullHistory: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          currentQr = await qrcode.toDataURL(qr);
          currentStatus = 'SCAN_QR_CODE';
          console.log('[OpenWA] New QR code generated.');
        } catch (err) {
          console.error('[OpenWA] Failed generating QR data URL:', err);
        }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        currentStatus = 'DISCONNECTED';
        currentQr = null;
        console.log('[OpenWA] Connection closed. Reason:', statusCode, 'Should reconnect:', shouldReconnect);

        if (shouldReconnect) {
          reconnectAttempts++;
          const delay = Math.min(reconnectAttempts * 3000, 15000);
          console.log(`[OpenWA] Reconnecting in ${delay / 1000}s...`);
          setTimeout(startWhatsApp, delay);
        } else {
          console.log('[OpenWA] Logged out. Cleaning auth directory...');
          try {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
          } catch { }
          setTimeout(startWhatsApp, 3000);
        }
      } else if (connection === 'open') {
        currentStatus = 'CONNECTED';
        currentQr = null;
        reconnectAttempts = 0;
        console.log('[OpenWA] WhatsApp Connected Successfully! 🎉');
      }
    });
  } catch (err) {
    console.error('[OpenWA] Error initializing WhatsApp socket:', err);
    currentStatus = 'DISCONNECTED';
    setTimeout(startWhatsApp, 5000);
  }
}

// Format phone / chatId for Baileys
function toJid(chatId) {
  if (!chatId) return '';
  let cleaned = String(chatId).trim().replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
  if (cleaned.startsWith('00')) cleaned = cleaned.slice(2);
  if (/^01[0125]\d{8}$/.test(cleaned)) cleaned = '2' + cleaned;
  return cleaned + '@s.whatsapp.net';
}

// REST HTTP Server
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // Health
  if (pathname === '/health' || pathname === '/api/health/ready' || pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, status: currentStatus, connected: currentStatus === 'CONNECTED' }));
  }

  // Status: GET /api/sessions/:sessionId/status
  if (pathname.includes('/status')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: currentStatus,
      connected: currentStatus === 'CONNECTED',
      needsQr: currentStatus === 'SCAN_QR_CODE',
    }));
  }

  // Visual QR Page: GET /scan or GET /qr-code
  if (pathname === '/scan' || pathname === '/qr-code') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>ربط واتساب بخادم OpenWA</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 24px; text-align: center; max-width: 360px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
    h2 { margin: 0 0 12px; font-size: 18px; color: #38bdf8; }
    p { margin: 0 0 16px; font-size: 13px; color: #94a3b8; line-height: 1.5; }
    img { width: 220px; height: 220px; background: #fff; padding: 10px; border-radius: 12px; }
    .status { margin-top: 14px; font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 20px; display: inline-block; background: #334155; }
    .status.connected { background: rgba(16,185,129,0.2); color: #34d399; }
    .status.scan { background: rgba(245,158,11,0.2); color: #fbbf24; }
  </style>
  <script>
    setInterval(async () => {
      try {
        const res = await fetch('/api/sessions/default/qr');
        const data = await res.json();
        if (data.connected) {
          location.reload();
        } else if (data.qr) {
          const img = document.getElementById('qrImg');
          if (img && img.src !== data.qr) {
            img.src = data.qr;
          }
        }
      } catch {}
    }, 2000);
  </script>
</head>
<body>
  <div class="card">
    <h2>📱 ربط واتساب (OpenWA Local)</h2>
    <p>افتح واتساب في هاتفك > <b>الأجهزة المرتبطة</b> > <b>ربط جهاز</b> وامسح الرمز أدناه:</p>
    ${currentStatus === 'CONNECTED'
        ? '<div style="font-size:48px; margin:20px 0;">✅</div><p style="color:#34d399; font-weight:600;">تم الربط بنجاح! الخادم متصل وجاهز لإرسال التنبيهات.</p>'
        : (currentQr
          ? '<img id="qrImg" src="' + currentQr + '" alt="QR">'
          : '<p id="loadingMsg">جاري توليد رمز الـ QR...</p>')}
    <div>
      <span class="status ${currentStatus === 'CONNECTED' ? 'connected' : 'scan'}">
        ${currentStatus === 'CONNECTED' ? '🟢 متصل بواتساب' : '🟡 بانتظار المسح'}
      </span>
    </div>
  </div>
</body>
</html>`;
    return res.end(html);
  }

  // QR: GET /api/sessions/:sessionId/qr
  if (pathname.includes('/qr')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: currentStatus,
      qr: currentQr,
      connected: currentStatus === 'CONNECTED',
    }));
  }

  // Send Message: POST /api/sessions/:sessionId/messages/send-text
  if (req.method === 'POST' && pathname.includes('/messages/send-text')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        if (currentStatus !== 'CONNECTED' || !sock) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            ok: false,
            error: 'خادم واتساب غير متصل حالياً. يرجى مسح رمز QR أولاً في نافذة الإعدادات.',
            status: currentStatus,
          }));
        }

        const data = JSON.parse(body || '{}');
        const rawChatId = data.chatId || data.phone;
        const text = data.text;

        if (!rawChatId || !text) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ ok: false, error: 'chatId and text are required' }));
        }

        const jid = toJid(rawChatId);
        console.log(`[OpenWA] Sending message to ${jid}...`);
        await sock.sendMessage(jid, { text });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          ok: true,
          data: {
            status: 'SENT',
            chatId: jid,
            timestamp: Date.now(),
          },
        }));
      } catch (err) {
        console.error('[OpenWA] Send error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[OpenWA] Server listening on http://127.0.0.1:${PORT}`);
  startWhatsApp();
});
