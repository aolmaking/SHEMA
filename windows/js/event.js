'use strict';
/**
 * Controller for Dedicated External Calendar Event Window
 * Supports full bilingual switching, multi-timing WhatsApp reminders,
 * tag chips, live dispatch testing, and recurrence.
 */

const { $, el, icon, boot, closeWindow, t, strings, lang } = window.UI;

strings({
  ar: {
    'event.titleNew': 'إضافة مناسبة جديدة',
    'event.titleEdit': 'تعديل المناسبة',
    'event.category': 'نوع وتصنيف المناسبة',
    'event.titleLabel': 'عنوان المناسبة',
    'event.titlePh': 'مثال: عيد ميلاد محمد، مؤتمر الذكاء الاصطناعي، تسليم مشروع...',
    'event.date': 'التاريخ',
    'event.time': 'التوقيت',
    'event.recurrence': 'التكرار الدوري',
    'event.recNone': 'لا يتكرر (مرة واحدة)',
    'event.recYearly': 'سنوياً (في نفس التاريخ من كل عام)',
    'event.recMonthly': 'شهرياً (في نفس اليوم من كل شهر)',
    'event.recWeekly': 'أسبوعياً (في نفس اليوم من كل أسبوع)',
    'event.notes': 'ملاحظات أو تفاصيل إضافية',
    'event.notesPh': 'المكان، رابط الاجتماع، أو أي تفاصيل تود تذكرها...',
    'event.waCardTitle': 'تنبيهات WhatsApp المتقدمة',
    'event.waTimingsTitle': 'مواعيد إرسال التنبيهات (يمكنك اختيار أكثر من موعد):',
    'event.timing3d': '📅 قبل المناسبة بـ 3 أيام (9:00 ص)',
    'event.timing1d': '📅 قبل المناسبة بيوم واحد (9:00 ص)',
    'event.timingMorning': '☀️ صباح يوم المناسبة (9:00 ص)',
    'event.timing3h': '⏳ قبل موعد المناسبة بـ 3 ساعات',
    'event.timing1h': '⏰ قبل موعد المناسبة بساعة واحدة',
    'event.timingAt': '🎯 في توقيت المناسبة تماماً',
    'event.waRecipientLabel': 'المستلم المخصص (اختياري):',
    'event.waRecipientPh': 'اتركه فارغاً للإرسال للمجموعة/الرقم المسجل بالإعدادات',
    'event.waRecipientHint': 'اتركه فارغاً للإرسال التلقائي للرقم أو المجموعة المحددة في الإعدادات.',
    'event.waMessageLabel': 'نص رسالة WhatsApp (أو اتركه للقالب التلقائي):',
    'event.waMessagePh': 'القالب التلقائي المناسب لنوع وتفاصيل المناسبة...',
    'event.testWaBtn': 'إرسال تجربة الآن على WhatsApp',
    'event.saveBtn': '💾 حفظ المناسبة',
    'event.deleteBtn': '🗑️ حذف المناسبة',
    'event.confirmDelete': 'هل أنت متأكد من حذف هذه المناسبة؟',
    'event.sendingWa': 'جاري الإرسال عبر WhatsApp... ⏳',
    'event.testWaOk': '✅ تم إرسال رسالة التنبيه عبر WhatsApp بنجاح!',
    'event.testWaErr': '❌ تعذر الإرسال: ',
    'event.checkServer': 'يرجى مراجعة تشغيل خادم WhatsApp أو الإعدادات',
  },
  en: {
    'event.titleNew': 'Add New Event',
    'event.titleEdit': 'Edit Event',
    'event.category': 'Event Category & Type',
    'event.titleLabel': 'Event Title',
    'event.titlePh': 'e.g. Mohammed Birthday, AI Conference, Project Deadline...',
    'event.date': 'Date',
    'event.time': 'Time',
    'event.recurrence': 'Recurrence',
    'event.recNone': 'Does not repeat (One-time)',
    'event.recYearly': 'Yearly (Same date every year)',
    'event.recMonthly': 'Monthly (Same day every month)',
    'event.recWeekly': 'Weekly (Same day every week)',
    'event.notes': 'Notes & Additional Details',
    'event.notesPh': 'Location, video link, agenda, or anything you want to remember...',
    'event.waCardTitle': 'Advanced WhatsApp Notifications',
    'event.waTimingsTitle': 'Alert Schedule Milestones (Select multiple):',
    'event.timing3d': '📅 3 Days Before (9:00 AM)',
    'event.timing1d': '📅 1 Day Before (9:00 AM)',
    'event.timingMorning': '☀️ Morning of Event (9:00 AM)',
    'event.timing3h': '⏳ 3 Hours Before Event',
    'event.timing1h': '⏰ 1 Hour Before Event',
    'event.timingAt': '🎯 At Exact Event Time',
    'event.waRecipientLabel': 'Custom Recipient (Optional):',
    'event.waRecipientPh': 'Leave blank to use default phone/group from Settings',
    'event.waRecipientHint': 'Leave blank to automatically deliver to the phone or group in Settings.',
    'event.waMessageLabel': 'WhatsApp Message Body (or leave for smart template):',
    'event.waMessagePh': 'Smart template customized for this event type...',
    'event.testWaBtn': 'Send Live Test WhatsApp',
    'event.saveBtn': '💾 Save Event',
    'event.deleteBtn': '🗑️ Delete Event',
    'event.confirmDelete': 'Are you sure you want to delete this event?',
    'event.sendingWa': 'Sending WhatsApp message... ⏳',
    'event.testWaOk': '✅ WhatsApp reminder test delivered successfully!',
    'event.testWaErr': '❌ Failed to send: ',
    'event.checkServer': 'Please check WhatsApp connection or settings',
  },
});

const CATEGORIES = {
  birthday: { id: 'birthday', nameAr: 'عيد ميلاد', nameEn: 'Birthday', icon: '🎂', color: '#ec4899', defaultTemplate: '🎂 *تذكير مناسبة سعيدة: {title}* 🎂\n\n📅 التاريخ: {date}\n⏰ الوقت: {time}\n{notes}\n🎉 نتمنى لكم يوماً سعيداً ومباركاً وعاماً حافلاً بالتوفيق والنجاح!' },
  conference: { id: 'conference', nameAr: 'مؤتمر / ندوة', nameEn: 'Conference / Seminar', icon: '🎙️', color: '#8b5cf6', defaultTemplate: '🎙️ *تذكير هام بمؤتمر / ندوة: {title}* 🎙️\n\n📅 التاريخ: {date}\n⏰ التوقيت: {time}\n{notes}\n📌 لا تنسَ الحضور والمشاركة في الموعد المحدد.' },
  meeting: { id: 'meeting', nameAr: 'اجتماع عمل', nameEn: 'Business Meeting', icon: '💼', color: '#3b82f6', defaultTemplate: '💼 *تذكير باجتماع عمل: {title}* 💼\n\n📅 التاريخ: {date}\n⏰ الموعد: {time}\n{notes}\n📍 يرجى الحضور في الموعد المحدد والتحضير للاجتماع.' },
  anniversary: { id: 'anniversary', nameAr: 'ذكرى سنوية', nameEn: 'Anniversary', icon: '💍', color: '#f59e0b', defaultTemplate: '💍 *تذكير بمناسبة خاصة: {title}* 💍\n\n📅 التاريخ: {date}\n{notes}\n✨ أطيب التهاني والأمنيات بدوام السعادة والتوفيق الدائم!' },
  exam: { id: 'exam', nameAr: 'امتحان / اختبار', nameEn: 'Exam / Quiz', icon: '📝', color: '#ef4444', defaultTemplate: '📝 *تذكير باختبار / امتحان: {title}* 📝\n\n📅 التاريخ: {date}\n⏰ وقت الامتحان: {time}\n{notes}\n📚 بالتوفيق والنجاح والتركيز التام إن شاء الله!' },
  appointment: { id: 'appointment', nameAr: 'موعد هام', nameEn: 'Important Appointment', icon: '🩺', color: '#10b981', defaultTemplate: '🩺 *تذكير بموعد هام: {title}* 🩺\n\n📅 الموعد: {date}\n⏰ الساعة: {time}\n{notes}\n🔔 تذكير لتنظيم جدولك والوصول في الوقت المحدد.' },
  deadline: { id: 'deadline', nameAr: 'موعد تسليم', nameEn: 'Delivery Deadline', icon: '⏳', color: '#f97316', defaultTemplate: '⏳ *تنبيه موعد تسليم نهائي: {title}* ⏳\n\n📅 آخر موعد: {date}\n⏰ التوقيت: {time}\n{notes}\n⚠️ يرجى الانتهاء من العمل وتسليمه قبل إغلاق موعد التسليم!' },
  general: { id: 'general', nameAr: 'مناسبة عامة', nameEn: 'General Occasion', icon: '📌', color: '#06b6d4', defaultTemplate: '📌 *تذكير بمناسبة: {title}* 📌\n\n📅 التاريخ: {date}\n⏰ الوقت: {time}\n{notes}\n🔔 تذكير مُرسل من ودجت سطح المكتب (Mirqat Widgets).' },
};

let currentEventId = null;
let currentSelectedCat = 'birthday';

function pad2(n) { return String(n).padStart(2, '0'); }

function renderCategoryPills() {
  const container = $('#evCatGrid');
  if (!container) return;
  const isEn = lang() === 'en';

  container.replaceChildren(...Object.values(CATEGORIES).map((cat) => {
    const btn = el('button', {
      type: 'button',
      class: `ev-cat-btn${cat.id === currentSelectedCat ? ' active' : ''}`,
      onclick: () => selectCategory(cat.id),
    },
      el('span', { class: 'ev-cat-icon', text: cat.icon }),
      el('span', { class: 'ev-cat-name', text: isEn ? cat.nameEn : cat.nameAr })
    );
    btn.style.setProperty('--cat-color', cat.color);
    return btn;
  }));
}

function selectCategory(catId) {
  currentSelectedCat = catId;
  const cat = CATEGORIES[catId] || CATEGORIES.general;
  $('#headIcon').textContent = cat.icon;
  renderCategoryPills();
}

function getSelectedTimings() {
  const boxes = document.querySelectorAll('input[name="waTiming"]:checked');
  const timings = [];
  boxes.forEach((b) => timings.push(b.value));
  return timings.length ? timings : ['morning_of'];
}

function setSelectedTimings(timings = []) {
  const list = Array.isArray(timings) ? timings : [timings];
  const boxes = document.querySelectorAll('input[name="waTiming"]');
  boxes.forEach((b) => {
    b.checked = list.includes(b.value);
  });
}

function getFormData() {
  return {
    id: currentEventId || undefined,
    category: currentSelectedCat,
    title: ($('#evTitle').value || '').trim(),
    date: $('#evDate').value,
    time: $('#evTime').value || '09:00',
    recurring: $('#evRecurring').value || 'none',
    notes: ($('#evNotes').value || '').trim(),
    whatsapp: {
      enabled: $('#evWaEnabled').checked,
      timings: getSelectedTimings(),
      sendTiming: getSelectedTimings()[0] || 'morning_of',
      recipient: ($('#evWaRecipient').value || '').trim(),
      customMessage: ($('#evWaMessage').value || '').trim(),
    },
  };
}

function populateForm(ev) {
  if (!ev) return;
  currentEventId = ev.id || null;
  selectCategory(ev.category || 'birthday');
  $('#evTitle').value = ev.title || '';
  $('#evDate').value = ev.date || '';
  $('#evTime').value = ev.time || '09:00';
  $('#evRecurring').value = ev.recurring || 'none';
  $('#evNotes').value = ev.notes || '';

  const wa = ev.whatsapp || {};
  $('#evWaEnabled').checked = wa.enabled !== false;
  $('#evWaBody').hidden = wa.enabled === false;

  const timings = wa.timings || (wa.sendTiming ? [wa.sendTiming] : ['1d_before', 'morning_of']);
  setSelectedTimings(timings);

  $('#evWaRecipient').value = wa.recipient || '';
  $('#evWaMessage').value = wa.customMessage || '';

  const isEn = lang() === 'en';
  if (currentEventId) {
    $('#eventWinTitle').textContent = t('event.titleEdit') || (isEn ? 'Edit Event' : 'تعديل المناسبة');
    $('#eventWinSub').textContent = ev.title || '—';
    $('#evDeleteBtn').hidden = false;
  } else {
    $('#eventWinTitle').textContent = t('event.titleNew') || (isEn ? 'Add New Event' : 'إضافة مناسبة جديدة');
    $('#eventWinSub').textContent = ev.date || '—';
    $('#evDeleteBtn').hidden = true;
  }
}

async function loadInitialData() {
  renderCategoryPills();

  const urlParams = new URLSearchParams(window.location.search);
  const idFromUrl = urlParams.get('id');
  const dateFromUrl = urlParams.get('date');
  const titleFromUrl = urlParams.get('title');

  const now = new Date();
  const defaultDateStr = dateFromUrl || `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;

  if (idFromUrl) {
    try {
      const allEvents = (await window.widgets.calendar.getEvents()) || [];
      const ev = allEvents.find((e) => e.id === idFromUrl);
      if (ev) {
        populateForm(ev);
        return;
      }
    } catch (err) {
      console.error('Error fetching event:', err);
    }
  }

  // New event
  const isEn = lang() === 'en';
  $('#eventWinTitle').textContent = t('event.titleNew') || (isEn ? 'Add New Event' : 'إضافة مناسبة جديدة');
  $('#eventWinSub').textContent = defaultDateStr;
  $('#evDate').value = defaultDateStr;
  if (titleFromUrl) $('#evTitle').value = titleFromUrl;
  $('#evDeleteBtn').hidden = true;
  setSelectedTimings(['1d_before', 'morning_of']);
}

boot(async (s) => {
  $('#closeBtn').append(icon('close'));
  $('#closeBtn').addEventListener('click', () => closeWindow());
  $('#evCancelBtn').addEventListener('click', () => closeWindow());

  // Toggle WhatsApp body
  $('#evWaEnabled').addEventListener('change', (e) => {
    $('#evWaBody').hidden = !e.target.checked;
  });

  // Template tags pills click: insert into textarea
  $('#evTemplateTags').addEventListener('click', (e) => {
    const pill = e.target.closest('.tag-pill');
    if (!pill) return;
    const tag = pill.dataset.tag;
    const ta = $('#evWaMessage');
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    ta.value = text.substring(0, start) + tag + text.substring(end);
    ta.focus();
    ta.selectionStart = ta.selectionEnd = start + tag.length;
  });

  // Live Test Button
  $('#evTestWaBtn').addEventListener('click', async () => {
    const statusEl = $('#evTestStatus');
    statusEl.hidden = false;
    statusEl.className = 'ev-test-status';
    statusEl.textContent = t('event.sendingWa');

    try {
      const data = getFormData();
      const res = await window.widgets.calendar.testEventWhatsApp({ event: data });
      if (res && res.ok) {
        statusEl.className = 'ev-test-status ok';
        statusEl.textContent = t('event.testWaOk');
      } else {
        statusEl.className = 'ev-test-status err';
        statusEl.textContent = `${t('event.testWaErr')}${res?.error || t('event.checkServer')}`;
      }
    } catch (err) {
      statusEl.className = 'ev-test-status err';
      statusEl.textContent = `${t('event.testWaErr')}${err.message}`;
    }
  });

  // Save Event
  $('#evSaveBtn').addEventListener('click', async () => {
    const title = ($('#evTitle').value || '').trim();
    const date = $('#evDate').value;
    if (!title) {
      $('#evTitle').focus();
      return;
    }
    if (!date) {
      $('#evDate').focus();
      return;
    }

    const payload = getFormData();
    await window.widgets.calendar.saveEvent(payload);
    closeWindow();
  });

  // Delete Event
  $('#evDeleteBtn').addEventListener('click', async () => {
    if (!currentEventId) return;
    if (confirm(t('event.confirmDelete'))) {
      await window.widgets.calendar.removeEvent(currentEventId);
      closeWindow();
    }
  });

  // IPC listener if reloaded with a new event
  window.widgets.calendar?.onLoadEvent?.((opts) => {
    if (typeof opts === 'string') {
      window.widgets.calendar.getEvents().then((evs) => {
        const found = evs.find((e) => e.id === opts);
        if (found) populateForm(found);
      });
    } else if (typeof opts === 'object' && opts !== null) {
      if (opts.id || opts.eventId) {
        window.widgets.calendar.getEvents().then((evs) => {
          const found = evs.find((e) => e.id === (opts.id || opts.eventId));
          if (found) populateForm(found);
        });
      } else {
        populateForm({
          date: opts.date || opts.defaultDate,
          title: opts.title || opts.defaultTitle,
        });
      }
    }
  });

  await loadInitialData();
});
