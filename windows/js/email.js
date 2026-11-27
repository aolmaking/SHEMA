'use strict';
/**
 * Advanced Email Widget for Mirqat Widgets.
 *
 * Provides:
 *   - Real-time instant inbox updates & unread badge
 *   - Quick filter tabs (All, Unread, Read) & read email behavior (keep, hide, dim)
 *   - Full Email Reader with HTML & plain text rendering
 *   - Attachments viewing, direct opening, and downloading (PDF, images, docs)
 *   - Full Email Compose & Send with attachments via SMTP
 *   - Server-synchronized Mark Read/Unread and Delete
 */

const { $, el, icon, boot, closeWindow, digits, t, strings } = window.UI;

strings({
  ar: {
    'email.title': 'البريد الإلكتروني',
    'email.refresh': 'تحديث الآن',
    'email.compose': 'رسالة جديدة',
    'email.setupTitle': 'تهيئة حساب البريد',
    'email.setupSub': 'أدخل بيانات بريدك في الإعدادات لتلقي الرسائل فور وصولها.',
    'email.setupBtn': 'فتح الإعدادات',
    'email.noEmails': 'لا توجد رسائل',
    'email.noEmailsSub': 'صندوق الوارد نظيف ومحدّث.',
    'email.noUnreadEmails': 'لا توجد رسائل غير مقروءة',
    'email.noUnreadSub': 'تمت قراءة جميع الرسائل في صندوق الوارد.',
    'email.back': 'رجوع للقائمة',
    'email.unreadCount': '{n} غير مقروءة',
    'email.allRead': 'الكل مقروء',
    'email.lastSync': 'آخر فحص: {time}',
    'email.syncing': 'جارٍ التحديث…',
    'email.tabAll': 'الكل',
    'email.tabUnread': 'غير مقروء',
    'email.tabRead': 'المقروء',
    'email.reply': 'رد',
    'email.newMsg': 'رسالة جديدة',
    'email.to': 'إلى:',
    'email.cc': 'نسخة:',
    'email.subj': 'الموضوع:',
    'email.send': 'إرسال',
    'email.sending': 'جارٍ الإرسال…',
    'email.sentSuccess': 'تم إرسال الرسالة بنجاح!',
    'email.addAtt': 'إرفاق ملفات…',
    'email.loadingBody': 'جارٍ تحميل المحتوى والمرفقات…',
    'email.openAtt': 'فتح',
    'email.saveAtt': 'حفظ',
    'email.attSaved': 'تم الحفظ في: {p}',
    'email.markRead': 'تحديد كمقروء',
    'email.markUnread': 'تحديد كغير مقروء',
    'email.delete': 'حذف',
    'email.confirmDelete': 'هل أنت متأكد من حذف هذه الرسالة نهائياً؟',
    'email.attHeader': 'المرفقات ({n})',
    'email.subjectPh': 'عنوان الرسالة…',
    'email.bodyPh': 'اكتب رسالتك هنا…',
    'email.addCc': '+ نسخة',
    'common.cancel': 'إلغاء',
    'common.close': 'إغلاق',
    'common.back': 'رجوع',
  },
  en: {
    'email.title': 'Email',
    'email.refresh': 'Refresh now',
    'email.compose': 'New Message',
    'email.setupTitle': 'Set Up Email Account',
    'email.setupSub': 'Enter your email settings to receive emails directly when they arrive.',
    'email.setupBtn': 'Open Settings',
    'email.noEmails': 'No Emails',
    'email.noEmailsSub': 'Your inbox is clear and up to date.',
    'email.noUnreadEmails': 'No Unread Emails',
    'email.noUnreadSub': 'All messages in your inbox have been read.',
    'email.back': 'Back to list',
    'email.unreadCount': '{n} unread',
    'email.allRead': 'All read',
    'email.lastSync': 'Checked: {time}',
    'email.syncing': 'Checking mail…',
    'email.tabAll': 'All',
    'email.tabUnread': 'Unread',
    'email.tabRead': 'Read',
    'email.reply': 'Reply',
    'email.newMsg': 'New Message',
    'email.to': 'To:',
    'email.cc': 'Cc:',
    'email.subj': 'Subject:',
    'email.send': 'Send',
    'email.sending': 'Sending…',
    'email.sentSuccess': 'Message sent successfully!',
    'email.addAtt': 'Attach files…',
    'email.loadingBody': 'Loading message & attachments…',
    'email.openAtt': 'Open',
    'email.saveAtt': 'Save',
    'email.attSaved': 'Saved to: {p}',
    'email.markRead': 'Mark as read',
    'email.markUnread': 'Mark as unread',
    'email.delete': 'Delete',
    'email.confirmDelete': 'Are you sure you want to delete this email permanently?',
    'email.attHeader': 'Attachments ({n})',
    'email.subjectPh': 'Message subject…',
    'email.bodyPh': 'Write your message here…',
    'email.addCc': '+ Cc',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.back': 'Back',
  },
});

let currentItems = [];
let currentConfig = {};
let isRefreshing = false;
let currentFilter = 'unread'; // 'unread' (default primary) | 'all' | 'read'
let activeReadingItem = null;
let composeAttachments = [];

function formatEmailTime(timestamp) {
  if (!timestamp) return '';
  const now = Date.now();
  const diffMin = Math.round((now - timestamp) / 60000);
  if (diffMin < 1) return t('common.now');
  if (diffMin < 60) return digits(t('ago.min', { n: diffMin }));
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return digits(t('ago.hour', { n: diffHour }));
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 7) return digits(t('ago.day', { n: diffDay }));
  const d = new Date(timestamp);
  return digits(`${d.getMonth() + 1}/${d.getDate()}`);
}

function formatFileSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getInitials(name) {
  if (!name) return '✉';
  const clean = name.trim().replace(/^["']|["']$/g, '');
  const parts = clean.split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function getFileIcon(filename = '') {
  const ext = filename.split('.').pop().toLowerCase();
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

/** Sanitize and safely format email HTML content */
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
 * Reader Pane
 * ==================================================================== */

async function openReader(item) {
  if (currentConfig.email?.openInWindow) {
    window.widgets.win.openEmailView({
      uid: item.uid,
      subject: item.subject,
      from: item.from,
      fromEmail: item.fromEmail,
      date: item.date,
    });
    if (item.unread) {
      item.unread = false;
      window.widgets.email.markRead(item.uid);
      renderEmailCounts();
    }
    return;
  }

  activeReadingItem = item;
  $('.plate')?.classList.add('reader-active');

  $('#readerSender').textContent = item.from || item.fromEmail || '';
  if ($('#readerAddress')) $('#readerAddress').textContent = item.fromEmail ? `<${item.fromEmail}>` : '';
  $('#readerDate').textContent = formatEmailTime(item.date);
  $('#readerSubject').textContent = item.subject || '(بدون عنوان)';
  if ($('#readerAvatar')) $('#readerAvatar').textContent = getInitials(item.from);

  // Update read toggle icon
  updateReaderToggleIcon(item.unread);

  // Switch panes
  $('#listPane').hidden = true;
  $('#composePane').hidden = true;
  $('#readerPane').hidden = false;

  // Show loading while detail is fetched
  $('#readerLoading').hidden = false;
  $('#readerBody').replaceChildren();
  $('#readerAttachmentsBox').hidden = true;

  // Mark as read in list & server
  if (item.unread) {
    item.unread = false;
    window.widgets.email.markRead(item.uid);
    renderEmailCounts();
  }

  try {
    const detail = await window.widgets.email.getFull(item.uid);
    $('#readerLoading').hidden = true;

    if (detail) {
      // Body content
      if (detail.html && detail.html.trim()) {
        const clean = sanitizeHtml(detail.html);
        $('#readerBody').innerHTML = clean;
        $('#readerBody').querySelectorAll('a').forEach(link => {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        });
      } else {
        $('#readerBody').textContent = detail.text || item.snippet || item.subject || '';
      }

      // Attachments list
      const atts = detail.attachments || [];
      if (atts.length > 0) {
        renderAttachments(atts);
      }
    }
  } catch (err) {
    $('#readerLoading').hidden = true;
    $('#readerBody').textContent = item.snippet || item.subject || 'تعذر جلب المحتوى بالكامل.';
  }
}

function updateReaderToggleIcon(unread) {
  const btn = $('#readerToggleReadBtn');
  btn.title = unread ? t('email.markRead') : t('email.markUnread');
  const iconSpan = $('#readToggleIcon');
  iconSpan.replaceChildren(icon(unread ? 'check' : 'mail') || icon('check'));
}

function renderAttachments(atts) {
  const box = $('#readerAttachmentsBox');
  const list = $('#readerAttachmentsList');
  list.replaceChildren();

  box.hidden = false;
  $('#attHeaderTitle').textContent = t('email.attHeader', { n: digits(atts.length) });

  for (const att of atts) {
    const card = el('div', { class: 'att-card' },
      el('span', { class: 'att-card-icon', text: getFileIcon(att.filename) }),
      el('span', { class: 'att-card-name', text: att.filename, title: att.filename }),
      el('span', { class: 'att-card-size', text: digits(formatFileSize(att.size)) }),
      el('button', {
        class: 'att-card-btn',
        text: t('email.openAtt'),
        title: 'فتح المرفق فوراً',
        onclick: (e) => {
          e.stopPropagation();
          window.widgets.email.openAttachment(att);
        },
      }),
      el('button', {
        class: 'att-card-btn',
        text: t('email.saveAtt'),
        title: 'حفظ المرفق في مجلد…',
        onclick: (e) => {
          e.stopPropagation();
          window.widgets.email.saveAttachment(att);
        },
      })
    );
    list.append(card);
  }
}

function closeReader() {
  activeReadingItem = null;
  $('.plate')?.classList.remove('reader-active');
  $('#readerPane').hidden = true;
  $('#listPane').hidden = false;
}

/* ==================================================================== *
 * Compose Pane
 * ==================================================================== */

function openCompose(prefill = {}) {
  $('#composeTo').value = prefill.to || '';
  $('#composeCc').value = prefill.cc || '';
  $('#composeSubject').value = prefill.subject || '';
  $('#composeBody').value = prefill.body || '';
  composeAttachments = prefill.attachments || [];
  renderComposeAttachments();

  $('#ccRow').hidden = !prefill.cc;
  $('#composeStatus').hidden = true;

  $('#listPane').hidden = true;
  $('#readerPane').hidden = true;
  $('#composePane').hidden = false;
}

function closeCompose() {
  $('#composePane').hidden = true;
  $('#listPane').hidden = false;
}

function renderComposeAttachments() {
  const container = $('#composeAttChips');
  container.replaceChildren();

  for (let i = 0; i < composeAttachments.length; i++) {
    const att = composeAttachments[i];
    const chip = el('div', { class: 'att-chip' },
      el('span', { text: getFileIcon(att.filename) }),
      el('span', { text: att.filename }),
      el('span', { class: 'att-chip-del', text: '×', onclick: () => {
        composeAttachments.splice(i, 1);
        renderComposeAttachments();
      }}),
    );
    container.append(chip);
  }
}

async function handleSend() {
  const to = $('#composeTo').value.trim();
  const cc = $('#composeCc').value.trim();
  const subject = $('#composeSubject').value.trim();
  const body = $('#composeBody').value.trim();
  const statusEl = $('#composeStatus');

  if (!to) {
    statusEl.hidden = false;
    statusEl.className = 'compose-status error';
    statusEl.textContent = 'يرجى إدخال عنوان المستلم (To)';
    return;
  }

  const sendBtn = $('#sendBtn');
  sendBtn.disabled = true;
  statusEl.hidden = false;
  statusEl.className = 'compose-status';
  statusEl.textContent = t('email.sending');

  try {
    await window.widgets.email.send({
      to,
      cc,
      subject,
      text: body,
      attachments: composeAttachments,
    });

    statusEl.className = 'compose-status success';
    statusEl.textContent = t('email.sentSuccess');
    setTimeout(() => {
      closeCompose();
      sendBtn.disabled = false;
    }, 1200);
  } catch (err) {
    sendBtn.disabled = false;
    statusEl.className = 'compose-status error';
    statusEl.textContent = err.message || 'فشل إرسال الرسالة';
  }
}

/* ==================================================================== *
 * Email List Rendering & Filtering
 * ==================================================================== */

function renderEmailCounts() {
  const unreadCount = currentItems.filter((m) => m.unread).length;
  if (unreadCount > 0) {
    $('#unreadPill').hidden = false;
    $('#unreadPill').textContent = digits(unreadCount);
    $('#sub').textContent = t('email.unreadCount', { n: digits(unreadCount) });
  } else {
    $('#unreadPill').hidden = true;
    $('#sub').textContent = currentItems.length > 0 ? t('email.allRead') : '—';
  }
}

function renderEmails(items = []) {
  currentItems = items;
  renderEmailCounts();

  const isConfigured = Boolean(currentConfig.email && currentConfig.email.user && (currentConfig.email.pass || currentConfig.email.enabled));
  $('#setupPrompt').hidden = isConfigured;
  if ($('#filterBar')) $('#filterBar').hidden = !isConfigured;
  if ($('#emailList')) $('#emailList').hidden = !isConfigured;

  if (!isConfigured) {
    $('#emptyInbox').hidden = true;
    $('#emailList').replaceChildren();
    return;
  }

  // Filter items based on current tab
  const readAction = (currentConfig.email && currentConfig.email.readAction) || 'keep';
  let filtered = [...items];

  if (currentFilter === 'unread') {
    filtered = filtered.filter((m) => m.unread);
  } else if (currentFilter === 'read') {
    filtered = filtered.filter((m) => !m.unread);
  } else if (readAction === 'hide') {
    // If setting says hide read emails from main view
    filtered = filtered.filter((m) => m.unread);
  }

  const list = $('#emailList');
  list.replaceChildren();

  if (filtered.length === 0) {
    $('#emptyInbox').hidden = false;
    if ($('#emailList')) $('#emailList').hidden = true;
    const titleEl = $('#emptyInboxTitle') || $('#emptyInbox .empty-title');
    const subEl = $('#emptyInboxSub') || $('#emptyInbox .empty-sub');
    if (currentFilter === 'unread' && items.length > 0) {
      if (titleEl) titleEl.textContent = t('email.noUnreadEmails');
      if (subEl) subEl.textContent = t('email.noUnreadSub');
    } else {
      if (titleEl) titleEl.textContent = t('email.noEmails');
      if (subEl) subEl.textContent = t('email.noEmailsSub');
    }
    return;
  }
  $('#emptyInbox').hidden = true;
  if ($('#emailList')) $('#emailList').hidden = false;

  for (const item of filtered) {
    const isDimmed = !item.unread && readAction === 'dim';

    const li = el('li', {
      class: `email-item${item.unread ? ' unread' : ''}${isDimmed ? ' dimmed' : ''}`,
      onclick: () => openReader(item),
    },
      el('div', { class: 'avatar', text: getInitials(item.from) }),
      el('div', { class: 'email-main' },
        el('div', { class: 'email-row-top' },
          el('span', { class: 'sender-name', text: item.from || item.fromEmail }),
          el('div', { class: 'email-meta-right' },
            item.hasAttachments ? el('span', { class: 'att-icon', title: 'تحتوي على مرفقات' }, icon('clip') || el('span', { text: '📎' })) : null,
            el('span', { class: 'email-time', text: formatEmailTime(item.date) })
          )
        ),
        el('div', { class: 'email-subject', text: item.subject }),
        el('div', { class: 'email-snippet', text: item.snippet || item.subject })
      ),
      // Quick hover action buttons
      el('div', { class: 'email-quick-actions' },
        el('button', {
          class: 'quick-btn',
          title: item.unread ? t('email.markRead') : t('email.markUnread'),
          onclick: (e) => {
            e.stopPropagation();
            if (item.unread) {
              window.widgets.email.markRead(item.uid);
            } else {
              window.widgets.email.markUnread(item.uid);
            }
          },
        }, icon(item.unread ? 'check' : 'mail') || icon('check')),
        el('button', {
          class: 'quick-btn danger',
          title: t('email.delete'),
          onclick: (e) => {
            e.stopPropagation();
            if (!confirm(t('email.confirmDelete'))) return;
            window.widgets.email.delete(item.uid);
          },
        }, icon('trash'))
      )
    );
    list.append(li);
  }
}

let autoRetryTimer = null;
let hasActiveError = false;

function parseEmailError(rawMsg) {
  const str = String(rawMsg || '');
  if (str.includes('ENOTFOUND') || str.includes('getaddrinfo') || str.includes('EAI_AGAIN') || str.includes('انقطع الاتصال بالإنترنت') || !navigator.onLine) {
    return {
      type: 'network',
      title: 'انقطع الاتصال بالإنترنت',
      detail: 'تعذر الوصول إلى خوادم البريد الإلكتروني. يرجى التأكد من اتصال الجهاز بشبكة Wi-Fi أو الراوتر.',
      actionLabel: 'إعادة المحاولة',
      canAutoRetry: true,
    };
  }
  if (str.includes('Application-specific') || str.includes('185833') || str.includes('كلمة مرور تطبيقات')) {
    return {
      type: 'auth_app_pass',
      title: 'مطلوب كلمة مرور تطبيقات Google',
      detail: 'يتطلب Gmail استخدام «كلمة مرور التطبيقات» (App Password) المكونة من 16 حرفاً بدلاً من كلمة المرور العادية.',
      actionLabel: 'إعداد الحساب',
      canAutoRetry: false,
    };
  }
  if (str.includes('AUTHENTICATIONFAILED') || str.includes('Invalid credentials') || str.includes('فشل تسجيل الدخول') || str.includes('credentials')) {
    return {
      type: 'auth',
      title: 'خطأ في بيانات الحساب',
      detail: 'فشل التحقق من البريد أو كلمة المرور. يرجى مراجعة إعدادات البريد والتأكد من صحة بيانات الدخول.',
      actionLabel: 'إعداد الحساب',
      canAutoRetry: false,
    };
  }
  if (str.includes('ETIMEDOUT') || str.includes('timed out') || str.includes('مهلة الاتصال')) {
    return {
      type: 'timeout',
      title: 'انتهت مهلة الاتصال بالخادم',
      detail: 'الاستجابة بطيئة أو جدار الحماية يمنع المنفذ. اضغط إعادة المحاولة.',
      actionLabel: 'إعادة المحاولة',
      canAutoRetry: true,
    };
  }
  return {
    type: 'unknown',
    title: 'تعذر الاتصال بالبريد',
    detail: str || 'حدث خطأ أثناء محاولة الوصول لخادم البريد.',
    actionLabel: 'إصلاح',
    canAutoRetry: true,
  };
}

function showConnectionError(errorMsg) {
  hasActiveError = true;
  const banner = $('#statusBanner');
  const refreshBtn = $('#refreshBtn');
  const parsed = parseEmailError(errorMsg);

  if (refreshBtn) {
    refreshBtn.classList.add('has-error');
    refreshBtn.title = `⚠️ ${parsed.title}: ${parsed.detail}`;
  }

  if (banner) {
    banner.hidden = false;
    banner.className = 'status-banner error';
    banner.innerHTML = `
      <span style="font-size: 14px; flex: none;">⚠️</span>
      <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
        <span style="font-weight: 600; font-size: calc(11px * var(--fs)); line-height: 1.3;">${parsed.title}</span>
        <span style="font-size: calc(9.5px * var(--fs)); opacity: 0.85; line-height: 1.35;">${parsed.detail}</span>
      </div>
      <div style="display: flex; gap: 4px; align-items: center; flex: none;">
        <button class="btn small primary" id="bannerFixBtn" style="padding: 3px 9px; font-size: calc(10px * var(--fs)); font-weight: 600;">${parsed.actionLabel}</button>
      </div>
    `;

    $('#bannerFixBtn')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (parsed.type === 'auth' || parsed.type === 'auth_app_pass') {
        window.widgets.win.openSettings('setup-email');
      } else {
        // Network or timeout: active immediate test and reconnect
        const btn = $('#bannerFixBtn');
        if (btn) {
          btn.disabled = true;
          btn.textContent = 'جارٍ المحاولة…';
        }
        await doRefresh(true);
      }
    });
  }

  // Schedule auto-recovery if network might recover
  if (parsed.canAutoRetry) {
    scheduleAutoRetry();
  }
}

function clearConnectionError() {
  hasActiveError = false;
  if (autoRetryTimer) {
    clearTimeout(autoRetryTimer);
    autoRetryTimer = null;
  }
  const banner = $('#statusBanner');
  const refreshBtn = $('#refreshBtn');
  if (refreshBtn) {
    refreshBtn.classList.remove('has-error');
    refreshBtn.title = t('email.refresh');
  }
  if (banner && banner.classList.contains('error')) {
    banner.hidden = true;
    banner.innerHTML = '';
  }
}

function scheduleAutoRetry() {
  if (autoRetryTimer) clearTimeout(autoRetryTimer);
  autoRetryTimer = setTimeout(() => {
    if (hasActiveError) {
      doRefresh(false);
    }
  }, 25000); // Automatically retry every 25 seconds
}

async function doRefresh(forceUserFeedback = false) {
  if (isRefreshing) return;
  const btn = $('#refreshBtn');
  isRefreshing = true;
  btn?.classList.add('refreshing');
  if (forceUserFeedback) {
    $('#sub').textContent = t('email.syncing');
  }

  try {
    const res = await window.widgets.email.refresh();
    if (res && res.items) {
      renderEmails(res.items);
      clearConnectionError();
      if (forceUserFeedback) {
        showTemporaryNotice('✅ تم استعادة الاتصال وجلب الرسائل بنجاح');
      }
    }
  } catch (err) {
    console.error('Email refresh error:', err);
    showConnectionError(err.message || 'فشل الاتصال بخادم البريد');
  } finally {
    isRefreshing = false;
    btn?.classList.remove('refreshing');
  }
}

function showTemporaryNotice(text) {
  const banner = $('#statusBanner');
  if (!banner) return;
  banner.hidden = false;
  banner.className = 'status-banner';
  banner.style.background = 'rgba(16, 185, 129, 0.15)';
  banner.style.color = '#10B981';
  banner.textContent = text;
  setTimeout(() => {
    if (!hasActiveError && banner.textContent === text) {
      banner.hidden = true;
      banner.style.background = '';
      banner.style.color = '';
    }
  }, 3500);
}

/* ==================================================================== *
 * Boot & Event Wiring
 * ==================================================================== */

boot(async (settings) => {
  currentConfig = settings || {};

  // Attach header icons
  $('#headIcon').append(icon('mail') || icon('note'));
  $('#composeBtn').append(icon('plus') || icon('mail'));
  $('#refreshBtn').append(icon('refresh'));
  $('#settingsBtn').append(icon('gear'));
  $('#closeBtn').append(icon('close'));
  $('#setupIcon').append(icon('mail') || icon('gear'));
  $('#inboxIcon').append(icon('check'));

  // Reader icons
  $('#popoutIcon')?.append(icon('external') || el('span', { text: '↗' }));
  $('#backIcon').append(icon('chevron') || icon('chevronLeft'));
  $('#replyIcon').append(icon('chevronLeft') || icon('mail'));
  $('#readToggleIcon').append(icon('check'));
  $('#deleteIcon').append(icon('trash'));
  if ($('#readerCloseIcon')) $('#readerCloseIcon').append(icon('close'));
  $('#attHeaderIcon').append(icon('clip') || el('span', { text: '📎' }));

  // Compose icons
  $('#composeCloseIcon').append(icon('close'));
  $('#sendIcon').append(icon('play') || icon('check'));
  $('#clipIcon').append(icon('plus') || el('span', { text: '📎' }));

  // Filter bar tabs (Unread is primary default)
  const tabs = [$('#tabUnread'), $('#tabAll'), $('#tabRead')];
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderEmails(currentItems);
    });
  });

  // Action listeners
  $('#refreshBtn').addEventListener('click', () => doRefresh());
  $('#composeBtn').addEventListener('click', () => {
    window.widgets.win.openEmailView({ mode: 'compose' });
  });
  $('#settingsBtn').addEventListener('click', () => window.widgets.win.openSettings('email'));
  $('#setupBtn').addEventListener('click', () => window.widgets.win.openSettings('email'));
  $('#closeBtn').addEventListener('click', () => closeWindow());

  // Reader listeners
  $('#readerPopoutBtn')?.addEventListener('click', () => {
    if (activeReadingItem) {
      window.widgets.win.openEmailView({
        uid: activeReadingItem.uid,
        subject: activeReadingItem.subject,
        from: activeReadingItem.from,
        fromEmail: activeReadingItem.fromEmail,
        date: activeReadingItem.date,
      });
    }
  });
  $('#readerBackBtn').addEventListener('click', () => closeReader());
  if ($('#readerCloseWinBtn')) $('#readerCloseWinBtn').addEventListener('click', () => closeWindow());
  $('#readerReplyBtn').addEventListener('click', () => {
    if (!activeReadingItem) return;
    window.widgets.win.openEmailView({
      uid: activeReadingItem.uid,
      subject: activeReadingItem.subject,
      from: activeReadingItem.from,
      fromEmail: activeReadingItem.fromEmail,
      date: activeReadingItem.date,
      reply: true,
    });
  });
  $('#readerToggleReadBtn').addEventListener('click', () => {
    if (!activeReadingItem) return;
    const nextUnread = !activeReadingItem.unread;
    activeReadingItem.unread = nextUnread;
    if (nextUnread) {
      window.widgets.email.markUnread(activeReadingItem.uid);
    } else {
      window.widgets.email.markRead(activeReadingItem.uid);
    }
    updateReaderToggleIcon(nextUnread);
    renderEmailCounts();
  });
  $('#readerDeleteBtn').addEventListener('click', () => {
    if (!activeReadingItem) return;
    if (!confirm(t('email.confirmDelete'))) return;
    window.widgets.email.delete(activeReadingItem.uid);
    closeReader();
  });

  // Intercept any link clicks inside the email reader pane to open in the user's default browser (e.g. Chrome)
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

  // Compose listeners
  $('#composeCloseBtn').addEventListener('click', () => closeCompose());
  $('#sendBtn').addEventListener('click', () => handleSend());
  $('#toggleCcBtn').addEventListener('click', () => {
    $('#ccRow').hidden = !$('#ccRow').hidden;
  });
  $('#composeAddAttBtn').addEventListener('click', async () => {
    const picked = await window.widgets.email.pickAttachments();
    if (picked && picked.length) {
      composeAttachments.push(...picked);
      renderComposeAttachments();
    }
  });

  // Initial load
  try {
    const data = await window.widgets.email.get();
    renderEmails(data.items || []);
  } catch {
    renderEmails([]);
  }

  // Live updates
  window.widgets.email.onUpdate((payload) => {
    if (payload && payload.items) {
      renderEmails(payload.items);
      clearConnectionError();
    }
  });

  window.widgets.email.onError?.((payload) => {
    showConnectionError(payload?.error || 'فشل الاتصال بخادم البريد');
  });

  // Automatic recovery when internet connection returns
  window.addEventListener('online', () => {
    console.log('[Email] Internet reconnected, auto-retrying...');
    if (hasActiveError) {
      doRefresh(true);
    }
  });

  window.widgets.settings.onChange((next) => {
    currentConfig = next || {};
    window.widgets.email.get().then((data) => {
      renderEmails(data.items || []);
    });
  });
});
