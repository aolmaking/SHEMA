'use strict';
/**
 * Dedicated Email Client Window (Reading & Full Composing)
 */

const { $, el, icon, boot, closeWindow, t, strings } = window.UI;

strings({
  ar: {
    'emailView.title': 'البريد الإلكتروني',
    'emailView.readTitle': 'قراءة البريد',
    'emailView.composeTitle': 'رسالة جديدة',
    'emailView.replyTitle': 'الرد على الرسالة',
    'emailView.forwardTitle': 'إعادة توجيه',
    'emailView.loading': 'جارٍ جلب نص ومرفقات الرسالة…',
    'emailView.copy': 'نسخ محتوى الرسالة',
    'emailView.copied': 'تم النسخ!',
    'emailView.toggleRead': 'تبديل حالة القراءة',
    'emailView.delete': 'حذف الرسالة',
    'emailView.reply': 'رد على الرسالة',
    'emailView.forward': 'إعادة توجيه',
    'emailView.newMsg': 'رسالة جديدة',
    'emailView.backToRead': 'العودة للرسالة',
    'emailView.send': 'إرسال الرسالة',
    'emailView.sending': 'جارٍ إرسال الرسالة…',
    'emailView.sentSuccess': 'تم إرسال الرسالة بنجاح!',
    'emailView.sendFailed': 'فشل إرسال الرسالة',
    'emailView.discard': 'إلغاء / مسح',
    'emailView.confirmDelete': 'هل أنت متأكد من حذف هذه الرسالة نهائياً؟',
    'emailView.noSubject': '(بدون عنوان)',
    'emailView.noSender': 'غير معروف',
    'emailView.toPrefix': 'إلى:',
    'emailView.to': 'إلى:',
    'emailView.cc': 'نسخة:',
    'emailView.bcc': 'مخفية:',
    'emailView.subj': 'الموضوع:',
    'emailView.addAtt': 'إرفاق ملفات…',
    'emailView.attOpen': 'فتح',
    'emailView.attSave': 'حفظ باسم',
    'emailView.failed': 'تعذر جلب تفاصيل الرسالة من الخادم.',
    'emailView.noContent': 'هذه الرسالة لا تحتوي على نص أو محتوى قابل للعرض.',
    'emailView.requireTo': 'يرجى كتابة عنوان البريد الإلكتروني للمستلم.',
    'emailView.copyAddress': 'نسخ عنوان البريد',
    'emailView.attachments': 'المرفقات',
    'emailView.quickReplyPrompt': 'الرد السريع على هذه الرسالة…',
    'emailView.replyBtn': 'رد على الرسالة',
    'emailView.shortcutHint': 'Ctrl + Enter للإرسال السريع',
    'emailView.addCc': '+ نسخة (Cc)',
    'emailView.addBcc': '+ مخفية (Bcc)',
    'emailView.subjectPh': 'عنوان موضوع الرسالة…',
    'emailView.bodyPh': 'اكتب نص الرسالة هنا…',
    'common.close': 'إغلاق',
  },
  en: {
    'emailView.title': 'Email',
    'emailView.readTitle': 'Read Email',
    'emailView.composeTitle': 'New Message',
    'emailView.replyTitle': 'Reply to Message',
    'emailView.forwardTitle': 'Forward Email',
    'emailView.loading': 'Fetching message content and attachments…',
    'emailView.copy': 'Copy message text',
    'emailView.copied': 'Copied!',
    'emailView.toggleRead': 'Toggle read/unread',
    'emailView.delete': 'Delete message',
    'emailView.reply': 'Reply to email',
    'emailView.forward': 'Forward',
    'emailView.newMsg': 'New Message',
    'emailView.backToRead': 'Back to Message',
    'emailView.send': 'Send Message',
    'emailView.sending': 'Sending message…',
    'emailView.sentSuccess': 'Message sent successfully!',
    'emailView.sendFailed': 'Failed to send message',
    'emailView.discard': 'Discard',
    'emailView.confirmDelete': 'Are you sure you want to delete this email permanently?',
    'emailView.noSubject': '(No Subject)',
    'emailView.noSender': 'Unknown Sender',
    'emailView.toPrefix': 'To:',
    'emailView.to': 'To:',
    'emailView.cc': 'Cc:',
    'emailView.bcc': 'Bcc:',
    'emailView.subj': 'Subject:',
    'emailView.addAtt': 'Attach files…',
    'emailView.attOpen': 'Open',
    'emailView.attSave': 'Save As',
    'emailView.failed': 'Could not fetch message from server.',
    'emailView.noContent': 'This message contains no text content.',
    'emailView.requireTo': 'Please enter a recipient email address.',
    'emailView.copyAddress': 'Copy email address',
    'emailView.attachments': 'Attachments',
    'emailView.quickReplyPrompt': 'Quick reply to this message…',
    'emailView.replyBtn': 'Reply',
    'emailView.shortcutHint': 'Ctrl + Enter to send',
    'emailView.addCc': '+ Cc',
    'emailView.addBcc': '+ Bcc',
    'emailView.subjectPh': 'Message subject…',
    'emailView.bodyPh': 'Write your message here…',
    'common.close': 'Close',
  },
});

let currentMode = 'read'; // 'read' | 'compose'
let currentMsg = null;
let currentUid = null;
let composeAttachments = [];

function getInitials(name = '') {
  const clean = String(name || '').trim().replace(/^["']|["']$/g, '');
  if (!clean || clean === '—' || clean === '-') return '✉';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (clean.slice(0, 2) || '✉').toUpperCase();
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileIcon(filename = '') {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  if (['pdf'].includes(ext)) return '📄';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(ext)) return '🖼️';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦';
  if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) return '📝';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
  if (['ppt', 'pptx'].includes(ext)) return '📑';
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return '🎵';
  if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return '🎬';
  return '📎';
}

function sanitizeHtml(rawHtml) {
  if (!rawHtml) return '';
  return rawHtml
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

/* ==================================================================== *
 * Mode Switching
 * ==================================================================== */

function setMode(mode, options = {}) {
  currentMode = mode;
  const isCompose = mode === 'compose';

  $('#readingView').hidden = isCompose;
  $('#composeView').hidden = !isCompose;

  // Header buttons visibility
  $('#newMsgBtn').hidden = isCompose;
  $('#replyBtn').hidden = isCompose || !currentUid;
  $('#forwardBtn').hidden = isCompose || !currentUid;
  $('#copyBtn').hidden = isCompose;
  $('#toggleReadBtn').hidden = isCompose || !currentUid;
  $('#deleteBtn').hidden = isCompose || !currentUid;
  $('#backToReadBtn').hidden = !isCompose || !currentUid;

  if (isCompose) {
    const subType = options.subType || 'new'; // 'new' | 'reply' | 'forward'
    if (subType === 'reply') {
      $('#headTitle').textContent = t('emailView.replyTitle');
      $('#composeModeBadge').textContent = t('emailView.replyTitle');
      $('#headSub').textContent = currentMsg ? (currentMsg.subject || currentMsg.from) : '—';
    } else if (subType === 'forward') {
      $('#headTitle').textContent = t('emailView.forwardTitle');
      $('#composeModeBadge').textContent = t('emailView.forwardTitle');
      $('#headSub').textContent = currentMsg ? (currentMsg.subject || '') : '—';
    } else {
      $('#headTitle').textContent = t('emailView.composeTitle');
      $('#composeModeBadge').textContent = t('emailView.composeTitle');
      $('#headSub').textContent = '—';
    }
  } else {
    $('#headTitle').textContent = currentMsg?.subject || t('emailView.readTitle');
    $('#headSub').textContent = currentMsg?.from || currentMsg?.fromEmail || '—';
  }
}

/* ==================================================================== *
 * Reading Mode Logic
 * ==================================================================== */

async function loadEmail(uid) {
  if (!uid) return;
  currentUid = uid;
  $('#loading').hidden = false;
  $('#errorBanner').hidden = true;

  try {
    const full = await window.widgets.email.getFull(uid);
    if (!full) {
      $('#loading').hidden = true;
      $('#errorBanner').hidden = false;
      $('#errorBanner').textContent = t('emailView.failed');
      return;
    }
    currentMsg = full;
    renderMessage(full);
  } catch (err) {
    $('#loading').hidden = true;
    $('#errorBanner').hidden = false;
    $('#errorBanner').textContent = err.message || t('emailView.failed');
  }
}

function renderMessage(msg) {
  if (!msg) return;
  $('#loading').hidden = true;
  $('#errorBanner').hidden = true;

  const subj = msg.subject || t('emailView.noSubject');
  $('#headTitle').textContent = subj;
  $('#subjectText').textContent = subj;
  document.title = `${subj} — ${t('emailView.title')}`;

  const senderDisplay = msg.from || msg.fromEmail || t('emailView.noSender');
  $('#headSub').textContent = senderDisplay;

  // Sender Card
  $('#avatar').textContent = getInitials(senderDisplay);
  $('#fromName').textContent = senderDisplay;
  $('#fromAddress').textContent = msg.fromEmail && msg.from !== msg.fromEmail ? `<${msg.fromEmail}>` : (msg.fromEmail ? `<${msg.fromEmail}>` : '');

  if (msg.date) {
    const d = new Date(msg.date);
    $('#date').textContent = isNaN(d.getTime()) ? '—' : d.toLocaleString(window.UI?.lang() === 'en' ? 'en-US' : 'ar-EG');
  } else {
    $('#date').textContent = '—';
  }

  $('#toInfo').textContent = msg.to ? `${t('emailView.toPrefix')} ${msg.to}` : '';

  // Attachments
  const atts = msg.attachments || [];
  if (atts.length > 0) {
    $('#attachmentsBox').hidden = false;
    $('#attCount').textContent = String(atts.length);
    const list = $('#attachmentsList');
    list.replaceChildren();

    for (const att of atts) {
      const chip = el('div', { class: 'att-chip' },
        el('span', { class: 'att-chip-icon', text: getFileIcon(att.filename) }),
        el('span', { class: 'att-chip-name', text: att.filename, title: att.filename }),
        el('span', { class: 'att-chip-size', text: formatBytes(att.size) }),
        el('div', { class: 'att-actions' },
          el('button', {
            class: 'att-btn',
            text: t('emailView.attOpen'),
            onclick: () => window.widgets.email.openAttachment(att),
          }),
          el('button', {
            class: 'att-btn',
            text: t('emailView.attSave'),
            onclick: () => window.widgets.email.saveAttachment(att),
          })
        )
      );
      list.append(chip);
    }
  } else {
    $('#attachmentsBox').hidden = true;
  }

  // Body content
  const bodyEl = $('#emailBody');
  if (msg.html && msg.html.trim()) {
    bodyEl.className = 'email-body-content html-view';
    bodyEl.innerHTML = sanitizeHtml(msg.html);
    bodyEl.querySelectorAll('a').forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  } else if (msg.text && msg.text.trim()) {
    bodyEl.className = 'email-body-content';
    bodyEl.textContent = msg.text;
  } else if (!msg.html && !msg.text) {
    // Still fetching body or empty
  } else {
    bodyEl.className = 'email-body-content';
    bodyEl.textContent = t('emailView.noContent');
  }

  // Update quick reply bar prompt
  $('#quickReplyText').textContent = `الرد على ${senderDisplay}…`;

  // Enable/disable header actions
  $('#replyBtn').hidden = false;
  $('#forwardBtn').hidden = false;
  $('#toggleReadBtn').hidden = false;
  $('#deleteBtn').hidden = false;
}

/* ==================================================================== *
 * Compose Mode Logic
 * ==================================================================== */

function openComposeFresh() {
  composeAttachments = [];
  renderComposeAttachments();
  $('#composeTo').value = '';
  $('#composeCc').value = '';
  $('#composeBcc').value = '';
  $('#composeSubject').value = '';
  $('#composeBody').value = '';
  $('#ccRow').hidden = true;
  $('#bccRow').hidden = true;
  $('#composeStatus').hidden = true;

  setMode('compose', { subType: 'new' });
  $('#composeTo').focus();
}

function openReply() {
  composeAttachments = [];
  renderComposeAttachments();
  const senderTarget = currentMsg?.fromEmail || currentMsg?.from || $('#fromAddress')?.textContent?.replace(/[<>]/g, '') || $('#fromName')?.textContent || '';
  const currentSubj = currentMsg?.subject || $('#subjectText')?.textContent || '';
  
  $('#composeTo').value = senderTarget;
  $('#composeCc').value = '';
  $('#composeBcc').value = '';
  $('#composeSubject').value = currentSubj ? (currentSubj.toLowerCase().startsWith('re:') ? currentSubj : `Re: ${currentSubj}`) : 'Re: ';
  
  const dateStr = currentMsg?.date ? new Date(currentMsg.date).toLocaleString() : '';
  const senderName = currentMsg?.from || currentMsg?.fromEmail || $('#fromName')?.textContent || '';
  $('#composeBody').value = `\n\n--- ${dateStr ? `في ${dateStr}، ` : ''}كتب ${senderName}: ---\n${currentMsg?.text || ''}\n`;
  $('#ccRow').hidden = true;
  $('#bccRow').hidden = true;
  $('#composeStatus').hidden = true;

  setMode('compose', { subType: 'reply' });
  $('#composeBody').focus();
  $('#composeBody').setSelectionRange(0, 0);
}

function openForward() {
  composeAttachments = currentMsg?.attachments ? [...currentMsg.attachments] : [];
  renderComposeAttachments();
  const currentSubj = currentMsg?.subject || $('#subjectText')?.textContent || '';
  
  $('#composeTo').value = '';
  $('#composeCc').value = '';
  $('#composeBcc').value = '';
  $('#composeSubject').value = currentSubj ? (currentSubj.toLowerCase().startsWith('fwd:') ? currentSubj : `Fwd: ${currentSubj}`) : 'Fwd: ';
  
  const dateStr = currentMsg?.date ? new Date(currentMsg.date).toLocaleString() : '';
  const senderName = currentMsg?.from || currentMsg?.fromEmail || $('#fromName')?.textContent || '';
  $('#composeBody').value = `\n\n---------- رسالة محولة ----------\nمن: ${senderName} <${currentMsg?.fromEmail || ''}>\nالتاريخ: ${dateStr}\nالموضوع: ${currentSubj}\n\n${currentMsg?.text || ''}\n`;
  $('#ccRow').hidden = true;
  $('#bccRow').hidden = true;
  $('#composeStatus').hidden = true;

  setMode('compose', { subType: 'forward' });
  $('#composeTo').focus();
}

function renderComposeAttachments() {
  const container = $('#composeAttChips');
  container.replaceChildren();

  composeAttachments.forEach((att, idx) => {
    const item = el('div', { class: 'compose-att-item' },
      el('span', { text: getFileIcon(att.filename) }),
      el('span', { text: att.filename }),
      el('span', { style: 'color: var(--ink-3); font-size: 10px;', text: formatBytes(att.size) }),
      el('button', {
        class: 'compose-att-remove',
        text: '✕',
        title: 'إزالة',
        onclick: () => {
          composeAttachments.splice(idx, 1);
          renderComposeAttachments();
        },
      })
    );
    container.append(item);
  });
}

async function handleSendEmail() {
  const to = $('#composeTo').value.trim();
  const cc = $('#composeCc').value.trim();
  const bcc = $('#composeBcc').value.trim();
  const subject = $('#composeSubject').value.trim();
  const text = $('#composeBody').value.trim();
  const status = $('#composeStatus');
  const btn = $('#composeSendBtn');

  if (!to) {
    status.hidden = false;
    status.className = 'compose-status-pill error';
    status.textContent = t('emailView.requireTo');
    $('#composeTo').focus();
    return;
  }

  btn.disabled = true;
  status.hidden = false;
  status.className = 'compose-status-pill sending';
  status.textContent = t('emailView.sending');

  try {
    await window.widgets.email.send({
      to,
      cc,
      bcc,
      subject,
      text,
      attachments: composeAttachments,
    });

    status.className = 'compose-status-pill success';
    status.textContent = t('emailView.sentSuccess');

    setTimeout(() => {
      btn.disabled = false;
      if (currentUid && currentMsg) {
        setMode('read');
      } else {
        closeWindow();
      }
    }, 1200);
  } catch (err) {
    btn.disabled = false;
    status.className = 'compose-status-pill error';
    status.textContent = err.message || t('emailView.sendFailed');
  }
}

/* ==================================================================== *
 * Wiring & Initialization
 * ==================================================================== */

function wire() {
  // Icons
  $('#headIcon').append(icon('mail') || el('span', { text: '✉' }));
  $('#newMsgBtn').append(icon('plus') || el('span', { text: '+' }));
  $('#replyBtn').append(icon('reply') || el('span', { text: '↩' }));
  $('#forwardBtn').append(icon('chevronLeft') || el('span', { text: '➔' }));
  $('#copyBtn').append(icon('copy') || el('span', { text: '📋' }));
  $('#toggleReadBtn').append(icon('check') || el('span', { text: '✓' }));
  $('#deleteBtn').append(icon('trash') || el('span', { text: '🗑' }));
  $('#backToReadBtn').append(icon('chevronLeft') || el('span', { text: '↩' }));
  $('#closeBtn').append(icon('close') || el('span', { text: '✕' }));

  // Header actions
  $('#newMsgBtn').addEventListener('click', () => openComposeFresh());
  $('#replyBtn').addEventListener('click', () => openReply());
  $('#forwardBtn').addEventListener('click', () => openForward());
  $('#backToReadBtn').addEventListener('click', () => setMode('read'));

  // Close window action - always responsive
  $('#closeBtn').addEventListener('click', () => closeWindow());

  // Intercept any link clicks inside the email view to open in the user's default browser (e.g. Chrome)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a) {
      const href = a.getAttribute('href') || a.href;
      if (typeof href === 'string' && (/^https?:\/\//i.test(href) || /^mailto:/i.test(href))) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (e.__externalHandled) return;
        e.__externalHandled = true;
        if (window.widgets?.openExternal) {
          window.widgets.openExternal(href);
        }
      }
    }
  }, true);

  // Copy address
  $('#copyAddressBtn')?.addEventListener('click', async () => {
    const addr = currentMsg?.fromEmail || $('#fromAddress')?.textContent?.replace(/[<>]/g, '') || '';
    if (addr) {
      await navigator.clipboard.writeText(addr);
      const btn = $('#copyAddressBtn');
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = '📋'; }, 1500);
    }
  });

  // Copy message body
  $('#copyBtn').addEventListener('click', async () => {
    const textToCopy = currentMsg?.text || $('#emailBody')?.innerText || '';
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      const orig = $('#copyBtn').title;
      $('#copyBtn').title = t('emailView.copied');
      setTimeout(() => { $('#copyBtn').title = orig; }, 1500);
    }
  });

  // Toggle read
  $('#toggleReadBtn').addEventListener('click', async () => {
    if (!currentUid) return;
    if (currentMsg?.unread) {
      await window.widgets.email.markRead(currentUid);
      if (currentMsg) currentMsg.unread = false;
    } else {
      await window.widgets.email.markUnread(currentUid);
      if (currentMsg) currentMsg.unread = true;
    }
  });

  // Delete message
  $('#deleteBtn').addEventListener('click', async () => {
    if (!currentUid) return;
    if (!confirm(t('emailView.confirmDelete'))) return;
    await window.widgets.email.delete(currentUid);
    closeWindow();
  });

  // Quick reply prompt
  $('#quickReplyBar')?.addEventListener('click', () => openReply());
  $('#openFullReplyBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openReply();
  });

  // Compose field toggles
  $('#toggleCcBtn')?.addEventListener('click', () => {
    $('#ccRow').hidden = !$('#ccRow').hidden;
    if (!$('#ccRow').hidden) $('#composeCc').focus();
  });
  $('#toggleBccBtn')?.addEventListener('click', () => {
    $('#bccRow').hidden = !$('#bccRow').hidden;
    if (!$('#bccRow').hidden) $('#composeBcc').focus();
  });

  // Attachments in compose
  $('#composeAttachBtn')?.addEventListener('click', async () => {
    const picked = await window.widgets.email.pickAttachments();
    if (picked && picked.length) {
      composeAttachments.push(...picked);
      renderComposeAttachments();
    }
  });

  // Send & Discard
  $('#composeSendBtn')?.addEventListener('click', () => handleSendEmail());
  $('#composeDiscardBtn')?.addEventListener('click', () => {
    if (currentUid && currentMsg) {
      setMode('read');
    } else {
      closeWindow();
    }
  });

  // Keyboard shortcut: Ctrl + Enter to send email
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (currentMode === 'compose') {
        e.preventDefault();
        handleSendEmail();
      }
    }
  });

  // Main process listener
  if (window.widgets.email?.onViewLoad) {
    window.widgets.email.onViewLoad((data) => {
      if (!data) return;
      if (typeof data === 'object') {
        if (data.mode === 'compose') {
          openComposeFresh();
          return;
        }
        if (data.subject || data.from) {
          renderMessage(data);
        }
        if (data.uid) {
          loadEmail(data.uid).then(() => {
            if (data.mode === 'reply' || data.reply) openReply();
            else if (data.mode === 'forward') openForward();
            else setMode('read');
          });
        }
      } else {
        loadEmail(data);
      }
    });
  }
}

boot(async () => {
  wire();
  const p = new URLSearchParams(window.location.search);
  const uid = p.get('uid');
  const subject = p.get('subject');
  const from = p.get('from');
  const fromEmail = p.get('fromEmail');
  const date = p.get('date');
  const modeParam = p.get('mode');
  const shouldReply = p.get('reply') === '1' || p.get('reply') === 'true' || modeParam === 'reply';

  if (modeParam === 'compose') {
    openComposeFresh();
    return;
  }

  if (subject || from || fromEmail) {
    renderMessage({
      uid,
      subject,
      from,
      fromEmail,
      date: date ? (Number(date) || date) : null,
      html: '',
      text: '',
      attachments: [],
    });
  }

  if (uid) {
    await loadEmail(uid);
    if (shouldReply) {
      openReply();
    } else if (modeParam === 'forward') {
      openForward();
    } else {
      setMode('read');
    }
  } else if (!subject && !from) {
    // No email specified, default to compose
    openComposeFresh();
  }
});
