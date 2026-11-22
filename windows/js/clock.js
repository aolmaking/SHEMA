'use strict';
/*
 * Clock, Alarm & Timer widget.
 *
 * Reads the system clock and the system's time-zone database (Intl), so it is
 * exactly as right as Windows is. The tick is re-aligned to the start of
 * every second rather than relying on a drifting setInterval.
 *
 * Includes:
 * - Clock view (Ring, Analog, Digital face + World Clocks)
 * - Ultra-transparency (الشفافية القصوى) toggle and glassmorphism styling
 * - Alarms system (Repetition, sound chime, snooze, dismiss, task integration)
 * - Countdown timer (Presets, circular visual progress, custom inputs, sound chime)
 */

const { $, el, icon, boot, closeWindow, digits, t, strings, locale, confirmDelete } = window.UI;

strings({
  ar: {
    'clock.title': 'الساعة والمنبه والمؤقت',
    'clock.settings': 'إعدادات الساعة',
    'clock.am': 'ص',
    'clock.pm': 'م',
    'clock.same': 'نفس التوقيت',
    'clock.h': '{n} س',
    'clock.tomorrow': 'غدًا',
    'clock.yesterday': 'أمس',
    'clock.transparency': 'الشفافية القصوى',
    'clock.tabClock': 'الساعة',
    'clock.tabAlarm': 'المنبه',
    'clock.tabTimer': 'التايمر',
    'alarm.add': 'إضافة منبه',
    'alarm.new': 'منبه جديد',
    'alarm.edit': 'تعديل المنبه',
    'alarm.save': 'حفظ المنبه',
    'alarm.cancel': 'إلغاء',
    'alarm.delete': 'حذف المنبه',
    'alarm.label': 'تسمية المنبه',
    'alarm.task': 'ربط بمهمة من قائمة المهام',
    'alarm.noTask': 'بدون ربط بمهمة',
    'alarm.repeat': 'التكرار',
    'alarm.everyday': 'يومياً',
    'alarm.workdays': 'أيام العمل',
    'alarm.once': 'مرة واحدة',
    'alarm.testSound': '🔔 تجربة الصوت',
    'alarm.snooze': 'غفوة (5 د)',
    'alarm.dismiss': 'إيقاف المنبه',
    'alarm.empty': 'لا توجد منبهات مضافة',
    'alarm.count': '{n} منبهات',
    'timer.ready': 'جاهز',
    'timer.running': 'قيد العد',
    'timer.paused': 'متوقف مؤقتاً',
    'timer.finished': 'انتهى الوقت!',
    'timer.start': 'بدء',
    'timer.pause': 'إيقاف مؤقت',
    'timer.resume': 'استئناف',
    'timer.reset': 'إعادة ضبط',
    'clock.hourUp': '+1 ساعة',
    'clock.hourDown': '-1 ساعة',
    'clock.minUp': '+1 دقيقة',
    'clock.minDown': '-1 دقيقة',
    'alarm.labelPh': 'اسم المنبه (مثال: الاستيقاظ، موعد، درس)...',
    'alarm.optional': 'اختياري',
    'timer.customTime': 'تخصيص الوقت',
    'timer.hours': 'ساعات (0-23)',
    'timer.minutes': 'دقائق (0-59)',
    'timer.seconds': 'ثواني (0-59)',
    'timer.hUnit': 'س',
    'timer.mUnit': 'د',
    'timer.sUnit': 'ث',
    'timer.addMin': 'إضافة دقيقة',
    'timer.addMinShort': '+1 د',
    'alarm.openTask': 'فتح المهمة',
    'alarm.completeTask': '✓ تم إنجاز المهمة',
    'alarm.ringing': 'منبه!',
    'alarm.defaultLabel': 'منبه',
    'alarm.snoozed': 'غفوة',
    'alarm.daySat': 'السبت',
    'alarm.daySun': 'الأحد',
    'alarm.dayMon': 'الاثنين',
    'alarm.dayTue': 'الثلاثاء',
    'alarm.dayWed': 'الأربعاء',
    'alarm.dayThu': 'الخميس',
    'alarm.dayFri': 'الجمعة',
    'alarm.daySatShort': 'س',
    'alarm.daySunShort': 'ح',
    'alarm.dayMonShort': 'ن',
    'alarm.dayTueShort': 'ث',
    'alarm.dayWedShort': 'ر',
    'alarm.dayThuShort': 'خ',
    'alarm.dayFriShort': 'ج',
    'common.close': 'إغلاق',
    'common.apply': 'تطبيق',
    'timer.finishedDesc': 'انتهى العد التنازلي للمؤقت.',
    'alarm.confirmDelete': 'هل أنت متأكد من الحذف؟',
    'alarm.deleteDesc': 'منبه الساعة {time}',
    'alarm.taskDoneNotification': 'تم إنجاز المهمة',
    'alarm.dueNotification': 'حان موعد التنبيه: {time}',
  },
  en: {
    'clock.title': 'Clock, Alarm & Timer',
    'clock.settings': 'Clock settings',
    'clock.am': 'AM',
    'clock.pm': 'PM',
    'clock.same': 'Same time',
    'clock.h': '{n} h',
    'clock.tomorrow': 'tomorrow',
    'clock.yesterday': 'yesterday',
    'clock.transparency': 'Max Transparency',
    'clock.tabClock': 'Clock',
    'clock.tabAlarm': 'Alarm',
    'clock.tabTimer': 'Timer',
    'alarm.add': 'Add Alarm',
    'alarm.new': 'New Alarm',
    'alarm.edit': 'Edit Alarm',
    'alarm.save': 'Save Alarm',
    'alarm.cancel': 'Cancel',
    'alarm.delete': 'Delete Alarm',
    'alarm.label': 'Alarm label',
    'alarm.task': 'Link to To-Do task',
    'alarm.noTask': 'No task linked',
    'alarm.repeat': 'Repeat',
    'alarm.everyday': 'Everyday',
    'alarm.workdays': 'Workdays',
    'alarm.once': 'Once',
    'alarm.testSound': '🔔 Test sound',
    'alarm.snooze': 'Snooze (5m)',
    'alarm.dismiss': 'Dismiss',
    'alarm.empty': 'No alarms added yet',
    'alarm.count': '{n} alarms',
    'timer.ready': 'Ready',
    'timer.running': 'Running',
    'timer.paused': 'Paused',
    'timer.finished': 'Time is up!',
    'timer.start': 'Start',
    'timer.pause': 'Pause',
    'timer.resume': 'Resume',
    'timer.reset': 'Reset',
    'clock.hourUp': '+1 hour',
    'clock.hourDown': '-1 hour',
    'clock.minUp': '+1 min',
    'clock.minDown': '-1 min',
    'alarm.labelPh': 'Alarm label (e.g. Wake up, Meeting, Class)...',
    'alarm.optional': 'Optional',
    'timer.customTime': 'Custom time',
    'timer.hours': 'Hours (0-23)',
    'timer.minutes': 'Minutes (0-59)',
    'timer.seconds': 'Seconds (0-59)',
    'timer.hUnit': 'h',
    'timer.mUnit': 'm',
    'timer.sUnit': 's',
    'timer.addMin': 'Add 1 minute',
    'timer.addMinShort': '+1m',
    'alarm.openTask': 'Open task',
    'alarm.completeTask': '✓ Complete task',
    'alarm.ringing': 'Alarm!',
    'alarm.defaultLabel': 'Alarm',
    'alarm.snoozed': 'Snooze',
    'alarm.daySat': 'Saturday',
    'alarm.daySun': 'Sunday',
    'alarm.dayMon': 'Monday',
    'alarm.dayTue': 'Tuesday',
    'alarm.dayWed': 'Wednesday',
    'alarm.dayThu': 'Thursday',
    'alarm.dayFri': 'Friday',
    'alarm.daySatShort': 'Sa',
    'alarm.daySunShort': 'Su',
    'alarm.dayMonShort': 'Mo',
    'alarm.dayTueShort': 'Tu',
    'alarm.dayWedShort': 'We',
    'alarm.dayThuShort': 'Th',
    'alarm.dayFriShort': 'Fr',
    'common.close': 'Close',
    'common.apply': 'Apply',
    'timer.finishedDesc': 'Timer countdown has finished.',
    'alarm.confirmDelete': 'Are you sure you want to delete?',
    'alarm.deleteDesc': 'Alarm at {time}',
    'alarm.taskDoneNotification': 'Task completed',
    'alarm.dueNotification': 'Alarm due: {time}',
  },
});

const SVG = 'http://www.w3.org/2000/svg';

let cfg = {};
let timer = null;
let built = null;          // the face style currently in the DOM
let lastSecondDeg = -1;
let lastArc = -1;

function svg(tag, attrs = {}, ...children) {
  const n = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  for (const c of children) n.append(c);
  return n;
}

/* ---------- time in a zone ---------- */

const formatters = new Map();
function formatter(zone) {
  if (!formatters.has(zone)) {
    formatters.set(zone, new Intl.DateTimeFormat('en-US', {
      timeZone: zone, hourCycle: 'h23',
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
    }));
  }
  return formatters.get(zone);
}

/** Wall-clock fields for a zone, or for the local machine when zone is null. */
function partsIn(date, zone) {
  if (!zone) {
    return {
      y: date.getFullYear(), mo: date.getMonth() + 1, d: date.getDate(),
      h: date.getHours(), mi: date.getMinutes(), s: date.getSeconds(),
    };
  }
  const p = {};
  for (const part of formatter(zone).formatToParts(date)) p[part.type] = part.value;
  return { y: +p.year, mo: +p.month, d: +p.day, h: (+p.hour) % 24, mi: +p.minute, s: +p.second };
}

const pad = (n) => String(n).padStart(2, '0');

function clockText(p, { seconds = false } = {}) {
  const h = cfg.hour12 ? (p.h % 12 || 12) : pad(p.h);
  const main = `${h}:${pad(p.mi)}${seconds ? `:${pad(p.s)}` : ''}`;
  return { main: digits(main), period: cfg.hour12 ? t(p.h < 12 ? 'clock.am' : 'clock.pm') : '' };
}

/* ---------- faces ---------- */

function buildRing(dial) {
  dial.replaceChildren(
    svg('circle', { class: 'track', cx: 50, cy: 50, r: 45 }),
    svg('circle', {
      class: 'arc', id: 'arc', cx: 50, cy: 50, r: 45,
      pathLength: 60, 'stroke-dasharray': 60, 'stroke-dashoffset': 60,
      transform: 'rotate(-90 50 50)',
    }),
  );
}

function buildAnalog(dial) {
  const ticks = [];
  for (let i = 0; i < 12; i++) {
    const major = i % 3 === 0;
    ticks.push(svg('line', {
      class: major ? 'tick major' : 'tick',
      x1: 50, y1: major ? 6.5 : 7.5, x2: 50, y2: major ? 13 : 11.5,
      transform: `rotate(${i * 30} 50 50)`,
    }));
  }
  dial.replaceChildren(
    svg('circle', { class: 'disc', cx: 50, cy: 50, r: 48 }),
    ...ticks,
    svg('g', { class: 'hand hour', id: 'hHour' }, svg('line', { x1: 50, y1: 53, x2: 50, y2: 28 })),
    svg('g', { class: 'hand minute', id: 'hMin' }, svg('line', { x1: 50, y1: 54, x2: 50, y2: 15 })),
    svg('g', { class: 'hand second', id: 'hSec' }, svg('line', { x1: 50, y1: 60, x2: 50, y2: 11 })),
    svg('circle', { class: 'pin', cx: 50, cy: 50, r: 2.8 }),
    svg('circle', { class: 'pin-hole', cx: 50, cy: 50, r: 1.1 }),
  );
}

function build() {
  const style = ['ring', 'analog', 'digital'].includes(cfg.style) ? cfg.style : 'ring';
  if (built === style) return;
  built = style;
  lastSecondDeg = -1;
  lastArc = -1;
  const root = $('#clock');
  if (root) root.dataset.style = style;
  const dial = $('#dial');
  if (dial) {
    if (style === 'ring') buildRing(dial);
    else if (style === 'analog') buildAnalog(dial);
    else dial.replaceChildren();
  }
}

function rotate(id, deg, { snap = false } = {}) {
  const node = document.getElementById(id);
  if (!node) return;
  if (snap) node.classList.add('instant');
  node.style.transform = `rotate(${deg}deg)`;
  if (snap) { void node.getBoundingClientRect(); node.classList.remove('instant'); }
}

function renderFace(p) {
  if (built === 'analog') {
    const secOfDay = p.h * 3600 + p.mi * 60 + p.s;
    const secDeg = secOfDay * 6;
    const wrapped = secDeg < lastSecondDeg;
    rotate('hSec', secDeg, { snap: wrapped || lastSecondDeg < 0 });
    rotate('hMin', (p.h * 60 + p.mi) * 6 + p.s * 0.1, { snap: wrapped || lastSecondDeg < 0 });
    rotate('hHour', (p.h % 24) * 30 + p.mi * 0.5, { snap: wrapped || lastSecondDeg < 0 });
    lastSecondDeg = secDeg;
    const hSec = document.getElementById('hSec');
    if (hSec) hSec.style.display = cfg.seconds ? '' : 'none';
  } else if (built === 'ring') {
    const arc = document.getElementById('arc');
    if (!arc) return;
    const target = cfg.seconds ? p.s + 1 : p.mi + (p.s + 1) / 60;
    const restart = target < lastArc || lastArc < 0;
    if (restart) {
      arc.classList.add('instant');
      arc.setAttribute('stroke-dashoffset', String(60 - (cfg.seconds ? p.s : p.mi + p.s / 60)));
      void arc.getBoundingClientRect();
      arc.classList.remove('instant');
    }
    arc.setAttribute('stroke-dashoffset', String(60 - Math.min(60, target)));
    lastArc = target;
  }
}

/* ---------- world clocks ---------- */

function offsetLabel(local, there) {
  const a = Date.UTC(local.y, local.mo - 1, local.d, local.h, local.mi);
  const b = Date.UTC(there.y, there.mo - 1, there.d, there.h, there.mi);
  const mins = Math.round((b - a) / 60000);
  const bits = [];
  if (mins === 0) bits.push(t('clock.same'));
  else {
    const sign = mins > 0 ? '+' : '−';
    const h = Math.floor(Math.abs(mins) / 60);
    const m = Math.abs(mins) % 60;
    bits.push(t('clock.h', { n: `${sign}${digits(h)}${m ? `:${digits(pad(m))}` : ''}` }));
  }
  const dayA = Date.UTC(local.y, local.mo - 1, local.d);
  const dayB = Date.UTC(there.y, there.mo - 1, there.d);
  if (dayB > dayA) bits.push(t('clock.tomorrow'));
  if (dayB < dayA) bits.push(t('clock.yesterday'));
  return bits.join(' · ');
}

function miniFace() {
  return svg('svg', { class: 'zf', viewBox: '0 0 100 100', 'aria-hidden': 'true' },
    svg('circle', { class: 'zf-disc', cx: 50, cy: 50, r: 47 }),
    svg('line', { class: 'zf-h', x1: 50, y1: 50, x2: 50, y2: 26 }),
    svg('line', { class: 'zf-m', x1: 50, y1: 50, x2: 50, y2: 13 }),
    svg('circle', { class: 'zf-pin', cx: 50, cy: 50, r: 5 }),
  );
}

function buildZones() {
  const container = $('#zones');
  if (container) container.replaceChildren();
}

function renderZones() { }

/* ---------- render loop ---------- */

const dateFormats = new Map();
function dateLine(now) {
  const key = locale();
  if (!dateFormats.has(key)) {
    dateFormats.set(key, new Intl.DateTimeFormat(key, { weekday: 'long', day: 'numeric', month: 'long' }));
  }
  return dateFormats.get(key).format(now);
}

let lastFit = '';
function fitTime(text) {
  const len = Math.max(3, text.length);
  const fs = Number(getComputedStyle(document.documentElement).getPropertyValue('--fs')) || 1;
  const isMaxTransp = document.querySelector('.plate')?.dataset?.transparency === 'max';
  const isFullWidth = built === 'digital' || isMaxTransp;
  // Comfortable room with symmetric margins so digits never clip or shift right
  const room = isFullWidth ? 76 : 66;
  const charFactor = isFullWidth ? 0.54 : 0.56;
  const max = (room / (len * charFactor)) * Math.max(1, fs);
  const base = (isFullWidth ? 27 : 24) * fs;
  const size = Math.min(base, max);
  const key = `${size.toFixed(2)}_${fs}_${built}_${isMaxTransp ? 1 : 0}`;
  if (key === lastFit) return;
  lastFit = key;
  const timeEl = $('#time');
  if (timeEl) timeEl.style.fontSize = `${size}cqi`;
}

function renderRollingDigits(container, text) {
  if (!container) return;
  const chars = Array.from(text);
  const existingSlots = Array.from(container.children);

  const needsRebuild = existingSlots.length !== chars.length ||
    existingSlots.some((slot, i) => (slot.classList.contains('digit-sep') !== (chars[i] === ':')));

  if (needsRebuild) {
    container.replaceChildren();
    chars.forEach((c) => {
      if (c === ':') {
        const sep = document.createElement('span');
        sep.className = 'digit-sep';
        sep.textContent = ':';
        container.appendChild(sep);
      } else {
        const slot = document.createElement('span');
        slot.className = 'digit-slot';
        slot.dataset.digit = c;
        const val = document.createElement('span');
        val.className = 'digit-val';
        val.textContent = c;
        slot.appendChild(val);
        container.appendChild(slot);
      }
    });
    return;
  }

  existingSlots.forEach((slot, i) => {
    const c = chars[i];
    if (c === ':') return;
    if (slot.dataset.digit !== c) {
      slot.dataset.digit = c;
      const val = document.createElement('span');
      val.className = 'digit-val rolling-in';
      val.textContent = c;
      slot.replaceChildren(val);
    }
  });
}

function render() {
  const now = new Date();
  const local = partsIn(now, null);
  const showSecondsInText = built === 'digital' && cfg.seconds;
  const txt = clockText(local, { seconds: showSecondsInText });
  renderRollingDigits($('#time'), txt.main);
  const subEl = $('#sub');
  if (subEl) subEl.textContent = txt.period;
  fitTime(txt.main);
  const dl = $('#dateline');
  if (dl) dl.textContent = dateLine(now);
  const fc = $('#face');
  if (fc) fc.title = now.toLocaleTimeString(locale());
  renderFace(local);
  renderZones(now, local);

  // Check active alarms every second
  checkAlarms(now);
}

function schedule() {
  clearTimeout(timer);
  if (window.UI?.isDormant?.()) return;

  const showSeconds = cfg.seconds || built === 'analog';
  if (!showSeconds) {
    const now = new Date();
    const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 20;
    timer = setTimeout(() => { render(); schedule(); }, Math.max(500, delay));
    return;
  }
  timer = setTimeout(() => { render(); schedule(); }, 1000 - (Date.now() % 1000) + 8);
}

/* ==========================================================================
   الشفافية القصوى (Maximum Transparency)
   ========================================================================== */

let isUltraTransparent = true;

function setTransparency(val) {
  isUltraTransparent = Boolean(val);
  const plate = $('.plate');
  const btn = $('#transparencyBtn');
  if (plate) {
    if (isUltraTransparent) {
      plate.dataset.transparency = 'max';
    } else {
      delete plate.dataset.transparency;
    }
  }
  if (btn) {
    btn.classList.toggle('active', isUltraTransparent);
    btn.title = isUltraTransparent ? 'الشفافية القصوى: مفعّلة' : 'الشفافية القصوى: معطلة';
  }
}

function toggleTransparency() {
  const next = !isUltraTransparent;
  setTransparency(next);
  try {
    localStorage.setItem('clock_ultra_transparent', next ? '1' : '0');
    window.widgets?.settings?.set?.({ clock: { ultraTransparent: next } });
  } catch { }
}

/* ==========================================================================
   Navigation Tabs (Clock / Alarm / Timer)
   ========================================================================== */

let activeTab = 'clock';
let hasSwitchedTabManually = false;

function switchTab(tabId, isManual = false) {
  activeTab = tabId;
  if (isManual) hasSwitchedTabManually = true;
  const tabs = document.querySelectorAll('.clock-tab-btn');
  tabs.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  const views = {
    clock: $('#viewClock'),
    alarm: $('#viewAlarm'),
    timer: $('#viewTimer'),
  };

  Object.entries(views).forEach(([k, viewEl]) => {
    if (viewEl) viewEl.classList.toggle('active', k === tabId);
  });

  if (tabId === 'alarm') {
    populateTaskSelect();
    renderAlarmsList();
  }
}

/* ==========================================================================
   Audio Synthesizer (Web Audio API - No external assets)
   ========================================================================== */

let alarmAudioCtx = null;
let alarmAudioLoop = null;

function playAlarmChime() {
  if (cfg.alarmSound === false) return;
  stopAlarmChime();
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    alarmAudioCtx = new AudioCtx();
    const playRound = () => {
      if (!alarmAudioCtx) return;
      const now = alarmAudioCtx.currentTime + 0.03;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = alarmAudioCtx.createOscillator();
        const gain = alarmAudioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);
        gain.gain.setValueAtTime(0.0001, now + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.35, now + idx * 0.14 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 0.48);
        osc.connect(gain);
        gain.connect(alarmAudioCtx.destination);
        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.5);
      });
    };
    playRound();
    alarmAudioLoop = setInterval(playRound, 1600);
  } catch (err) {
    console.warn('AudioContext error:', err);
  }
}

function stopAlarmChime() {
  if (alarmAudioLoop) {
    clearInterval(alarmAudioLoop);
    alarmAudioLoop = null;
  }
  if (alarmAudioCtx) {
    try { alarmAudioCtx.close(); } catch { }
    alarmAudioCtx = null;
  }
}

function playTimerChime() {
  if (cfg.timerSound === false) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime + 0.02;
    const chords = [880, 1174.66, 1760]; // A5, D6, A6
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);
      gain.gain.setValueAtTime(0.0001, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.4, now + idx * 0.15 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.75);
    });
    setTimeout(() => { try { ctx.close(); } catch { } }, 1800);
  } catch { }
}

function sendDesktopNotification(title, body) {
  if (cfg.desktopNotify === false) return;
  try {
    if (typeof Notification !== 'undefined') {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, silent: true });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') new Notification(title, { body, silent: true });
        });
      }
    }
  } catch { }
}

/* ==========================================================================
   Alarms System
   ========================================================================== */

let alarms = [];
let editingAlarmId = null;
let currentRingingAlarm = null;

function loadAlarms() {
  try {
    if (Array.isArray(cfg.alarms) && cfg.alarms.length > 0) {
      alarms = [...cfg.alarms];
      try { localStorage.setItem('mirqat_clock_alarms', JSON.stringify(alarms)); } catch {}
      return;
    }
    const raw = localStorage.getItem('mirqat_clock_alarms');
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        alarms = parsed;
        window.widgets?.settings?.set?.({ clock: { alarms } });
        return;
      }
    }
    // Initial seed on very first run
    alarms = [
      {
        id: 'alarm_default_1',
        time: '07:00',
        label: 'الاستيقاظ',
        days: [0, 1, 2, 3, 4, 6],
        repeat: 'workdays',
        enabled: true,
        taskId: null,
        taskTitle: '',
        lastTriggeredDate: null,
      },
    ];
    localStorage.setItem('mirqat_clock_alarms', JSON.stringify(alarms));
    window.widgets?.settings?.set?.({ clock: { alarms } });
  } catch {
    alarms = [];
  }
}

function saveAlarms() {
  try {
    localStorage.setItem('mirqat_clock_alarms', JSON.stringify(alarms));
    window.widgets?.settings?.set?.({ clock: { alarms } });
  } catch { }
  updateAlarmBadges();
}

function deleteAlarm(alarmId) {
  if (!alarmId) return;
  alarms = alarms.filter((a) => a.id !== alarmId);
  saveAlarms();
  if (editingAlarmId === alarmId) {
    closeAlarmEditor();
  }
  renderAlarmsList();
}

function updateAlarmBadges() {
  const activeCount = alarms.filter((a) => a.enabled).length;
  const tabBadge = $('#alarmBadge');
  if (tabBadge) {
    tabBadge.hidden = activeCount === 0;
    tabBadge.textContent = String(activeCount);
  }
  const countBadge = $('#alarmCountBadge');
  if (countBadge) {
    countBadge.textContent = t('alarm.count', { n: digits(activeCount) });
  }
}

function formatAlarmTime(time24) {
  const [h24, m] = time24.split(':').map(Number);
  const isPm = h24 >= 12;
  const h12 = h24 % 12 || 12;
  return {
    time: digits(`${h12}:${pad(m)}`),
    ampm: t(isPm ? 'clock.pm' : 'clock.am'),
  };
}

function getDaysSummary(days, repeat) {
  if (repeat === 'once') return t('alarm.once');
  if (repeat === 'everyday' || (Array.isArray(days) && days.length === 7)) return t('alarm.everyday');
  if (repeat === 'workdays') return t('alarm.workdays');
  const isEn = !locale().startsWith('ar');
  const dayNames = isEn ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] : ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
  return (days || []).map((d) => dayNames[d]).join(' · ');
}

function renderAlarmsList() {
  const list = $('#alarmsList');
  if (!list) return;

  if (alarms.length === 0) {
    list.innerHTML = `
      <div class="alarm-empty-state">
        <div class="alarm-empty-icon">🔔</div>
        <div class="alarm-empty-text">${t('alarm.empty')}</div>
      </div>
    `;
    updateAlarmBadges();
    return;
  }

  list.replaceChildren(...alarms.map((alarm) => {
    const ft = formatAlarmTime(alarm.time);
    const card = el('div', { class: `alarm-card ${alarm.enabled ? '' : 'disabled'}`, dataset: { id: alarm.id } });

    const main = el('div', { class: 'alarm-card-main' });
    const timeBox = el('div', { class: 'alarm-card-time' },
      el('span', { class: 'numerals' }, ft.time),
      el('span', { class: 'alarm-card-ampm' }, ft.ampm),
    );

    const meta = el('div', { class: 'alarm-card-meta' },
      el('span', { class: 'alarm-card-label' }, alarm.label || 'منبه'),
      el('span', { class: 'alarm-days-tag' }, getDaysSummary(alarm.days, alarm.repeat)),
    );

    if (alarm.taskId && alarm.taskTitle) {
      const taskTag = el('span', { class: 'alarm-task-tag', title: alarm.taskTitle },
        el('span', {}, '📋'),
        el('span', {}, alarm.taskTitle),
      );
      taskTag.addEventListener('click', (e) => {
        e.stopPropagation();
        window.widgets?.win?.openTask?.(alarm.taskId);
      });
      meta.appendChild(taskTag);
    }

    main.append(timeBox, meta);

    const controls = el('div', { class: 'alarm-card-controls' });

    // Switch
    const sw = el('button', { class: `switch ${alarm.enabled ? 'on' : ''}`, role: 'switch' });
    sw.addEventListener('click', (e) => {
      e.stopPropagation();
      alarm.enabled = !alarm.enabled;
      sw.classList.toggle('on', alarm.enabled);
      card.classList.toggle('disabled', !alarm.enabled);
      saveAlarms();
    });

    // Delete button (dedicated SVG icon and robust click handling)
    const delBtn = el('button', {
      type: 'button',
      class: 'alarm-del-btn',
      title: t('alarm.delete') || 'حذف المنبه',
      'aria-label': 'حذف المنبه',
    });
    delBtn.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      confirmDelete({
        title: 'هل أنت متأكد من الحذف؟',
        desc: `منبه الساعة ${digits(alarm.time || '')}`,
        confirmText: 'حذف',
        cancelText: 'إلغاء',
        onConfirm: () => deleteAlarm(alarm.id),
      });
    });

    controls.append(sw, delBtn);
    card.append(main, controls);

    // Click card to edit
    card.addEventListener('click', () => openAlarmEditor(alarm.id));
    return card;
  }));

  updateAlarmBadges();
}

async function populateTaskSelect() {
  const sel = $('#alarmTaskSelect');
  if (!sel) return;
  sel.innerHTML = `<option value="">${t('alarm.noTask')}</option>`;
  try {
    const tasks = (await window.widgets?.todos?.get?.()) || [];
    const activeTasks = tasks.filter((t) => !t.done);
    activeTasks.forEach((task) => {
      const opt = document.createElement('option');
      opt.value = task.id;
      opt.textContent = `📋 ${task.text.slice(0, 36)}`;
      sel.appendChild(opt);
    });
  } catch { }
}

function stepHour(delta) {
  const input = $('#alarmHour');
  if (!input) return;
  let val = (Number(input.value) || 12) + delta;
  if (val > 12) val = 1;
  if (val < 1) val = 12;
  input.value = String(val);
}

function stepMinute(delta) {
  const input = $('#alarmMinute');
  if (!input) return;
  let val = (Number(input.value) || 0) + delta;
  if (val > 59) val = 0;
  if (val < 0) val = 59;
  input.value = String(val);
}

function openAlarmEditor(alarmId = null) {
  editingAlarmId = alarmId;
  const drawer = $('#alarmDrawer');
  const title = $('#drawerTitle');
  const deleteBtn = $('#deleteAlarmBtn');
  if (!drawer) return;

  populateTaskSelect();

  if (alarmId) {
    const alarm = alarms.find((a) => a.id === alarmId);
    if (!alarm) return;
    if (title) title.textContent = t('alarm.edit');
    if (deleteBtn) deleteBtn.hidden = false;
    const [h24, m] = alarm.time.split(':').map(Number);
    const isPm = h24 >= 12;
    const h12 = h24 % 12 || 12;

    $('#alarmHour').value = String(h12);
    $('#alarmMinute').value = String(m);
    setAmPm(isPm ? 'PM' : 'AM');
    $('#alarmLabelInput').value = alarm.label || '';
    if ($('#alarmTaskSelect')) $('#alarmTaskSelect').value = alarm.taskId || '';

    // Day chips
    document.querySelectorAll('.day-chip').forEach((chip) => {
      const day = Number(chip.dataset.day);
      chip.classList.toggle('active', Array.isArray(alarm.days) && alarm.days.includes(day));
    });
  } else {
    if (title) title.textContent = t('alarm.new');
    if (deleteBtn) deleteBtn.hidden = true;
    $('#alarmHour').value = '7';
    $('#alarmMinute').value = '0';
    setAmPm('AM');
    $('#alarmLabelInput').value = '';
    if ($('#alarmTaskSelect')) $('#alarmTaskSelect').value = '';
    document.querySelectorAll('.day-chip').forEach((chip) => {
      chip.classList.add('active');
    });
  }

  drawer.hidden = false;
}

function closeAlarmEditor() {
  const drawer = $('#alarmDrawer');
  if (drawer) drawer.hidden = true;
  editingAlarmId = null;
  stopAlarmChime();
}

function setAmPm(val) {
  document.querySelectorAll('.ampm-option').forEach((opt) => {
    opt.classList.toggle('active', opt.dataset.val === val);
  });
}

function saveAlarmFromEditor() {
  let h = Math.max(1, Math.min(12, Number($('#alarmHour').value) || 12));
  const m = Math.max(0, Math.min(59, Number($('#alarmMinute').value) || 0));
  const isPm = document.querySelector('.ampm-option.active')?.dataset?.val === 'PM';

  if (isPm && h < 12) h += 12;
  if (!isPm && h === 12) h = 0;
  const time24 = `${pad(h)}:${pad(m)}`;

  const label = $('#alarmLabelInput').value.trim() || 'منبه';
  const taskSelect = $('#alarmTaskSelect');
  const taskId = taskSelect?.value || null;
  const taskTitle = taskId && taskSelect?.selectedOptions?.[0] ? taskSelect.selectedOptions[0].textContent.replace('📋 ', '') : '';

  const activeDays = [];
  document.querySelectorAll('.day-chip.active').forEach((chip) => {
    activeDays.push(Number(chip.dataset.day));
  });

  let repeat = 'custom';
  if (activeDays.length === 7) repeat = 'everyday';
  else if (activeDays.length === 0) repeat = 'once';
  else if (activeDays.length === 5 && [0, 1, 2, 3, 4, 6].every((d) => activeDays.includes(d) || activeDays.length === 5)) repeat = 'workdays';

  if (editingAlarmId) {
    const idx = alarms.findIndex((a) => a.id === editingAlarmId);
    if (idx !== -1) {
      alarms[idx] = {
        ...alarms[idx],
        time: time24,
        label,
        days: activeDays,
        repeat,
        taskId,
        taskTitle,
        enabled: true,
      };
    }
  } else {
    alarms.push({
      id: 'alarm_' + Date.now(),
      time: time24,
      label,
      days: activeDays,
      repeat,
      taskId,
      taskTitle,
      enabled: true,
      lastTriggeredDate: null,
    });
  }

  saveAlarms();
  renderAlarmsList();
  closeAlarmEditor();
}

function checkAlarms(now = new Date()) {
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();
  const dayOfWeek = now.getDay();
  const todayDateStr = now.toISOString().slice(0, 10);

  for (const alarm of alarms) {
    if (!alarm.enabled) continue;
    const [h, m] = alarm.time.split(':').map(Number);
    if (h === currentHour && m === currentMinute) {
      if (alarm.lastTriggeredDate === todayDateStr && currentSecond > 2) {
        continue;
      }

      let shouldTrigger = false;
      if (alarm.repeat === 'everyday' || (Array.isArray(alarm.days) && alarm.days.length === 7)) {
        shouldTrigger = true;
      } else if (alarm.repeat === 'once') {
        shouldTrigger = true;
        alarm.enabled = false;
      } else if (Array.isArray(alarm.days)) {
        shouldTrigger = alarm.days.includes(dayOfWeek);
      } else {
        shouldTrigger = true;
      }

      if (shouldTrigger && alarm.lastTriggeredDate !== todayDateStr) {
        alarm.lastTriggeredDate = todayDateStr;
        triggerAlarm(alarm);
        saveAlarms();
      }
    }
  }
}

function triggerAlarm(alarm) {
  currentRingingAlarm = alarm;
  const overlay = $('#ringingOverlay');
  if (!overlay) return;

  const ft = formatAlarmTime(alarm.time);
  $('#ringingTimeLarge').textContent = `${ft.time} ${ft.ampm}`;
  $('#ringingLabelText').textContent = alarm.label || t('alarm.ringing');

  const taskPill = $('#ringingTaskPill');
  const taskName = $('#ringingTaskName');
  if (taskPill && taskName) {
    if (alarm.taskId && alarm.taskTitle) {
      taskPill.hidden = false;
      taskName.textContent = alarm.taskTitle;
      const openBtn = $('#ringingOpenTaskBtn');
      if (openBtn) {
        openBtn.onclick = () => window.widgets?.win?.openTask?.(alarm.taskId);
      }
    } else {
      taskPill.hidden = true;
    }
  }

  const completeBtn = $('#ringingCompleteTaskBtn');
  if (completeBtn) {
    if (alarm.taskId) {
      completeBtn.hidden = false;
      completeBtn.onclick = async () => {
        try {
          await window.widgets?.todos?.patch?.(alarm.taskId, { done: true, doneAt: Date.now(), doneManually: true });
          sendDesktopNotification('✅ ' + t('alarm.taskDoneNotification'), alarm.taskTitle || alarm.label);
        } catch { }
        dismissRingingAlarm();
      };
    } else {
      completeBtn.hidden = true;
    }
  }

  const snoozeMins = Number(cfg.snoozeDuration) || 5;
  const snoozeBtn = $('#ringingSnoozeBtn');
  if (snoozeBtn) {
    snoozeBtn.textContent = locale().startsWith('ar') ? `غفوة (${snoozeMins} د)` : `Snooze (${snoozeMins}m)`;
  }

  overlay.hidden = false;
  playAlarmChime();
  sendDesktopNotification(`🔔 ${alarm.label || t('alarm.defaultLabel')}`, t('alarm.dueNotification', { time: `${ft.time} ${ft.ampm}` }));
}

function dismissRingingAlarm() {
  stopAlarmChime();
  const overlay = $('#ringingOverlay');
  if (overlay) overlay.hidden = true;
  if (currentRingingAlarm && currentRingingAlarm.isSnooze) {
    alarms = alarms.filter((a) => a.id !== currentRingingAlarm.id);
    saveAlarms();
    renderAlarmsList();
  }
  currentRingingAlarm = null;
}

function snoozeRingingAlarm() {
  stopAlarmChime();
  const overlay = $('#ringingOverlay');
  if (overlay) overlay.hidden = true;

  if (currentRingingAlarm) {
    const snoozeMins = Number(cfg.snoozeDuration) || 5;
    const snoozeDate = new Date(Date.now() + snoozeMins * 60 * 1000);
    const snoozeTime24 = `${pad(snoozeDate.getHours())}:${pad(snoozeDate.getMinutes())}`;
    alarms.push({
      ...currentRingingAlarm,
      id: 'snooze_' + Date.now(),
      time: snoozeTime24,
      label: `${currentRingingAlarm.label || 'منبه'} (غفوة)`,
      repeat: 'once',
      enabled: true,
      lastTriggeredDate: null,
      isSnooze: true,
    });
    saveAlarms();
    renderAlarmsList();
  }
  currentRingingAlarm = null;
}

/* ==========================================================================
   Countdown Timer System
   ========================================================================== */

let timerDuration = 300; // 5 min in seconds
let timerRemaining = 300;
let timerStatus = 'ready'; // 'ready' | 'running' | 'paused' | 'finished'
let timerInterval = null;
let timerEndsAt = null;

function updateTimerUI() {
  const digitsEl = $('#timerClockDigits');
  const stateBadge = $('#timerStateBadge');
  const progressArc = $('#timerProgress');
  const mainIcon = $('#timerMainIcon');
  const mainText = $('#timerMainText');
  const dot = $('#timerDot');

  const totalSec = Math.max(0, timerRemaining);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  const text = h > 0 ? `${digits(pad(h))}:${digits(pad(m))}:${digits(pad(s))}` : `${digits(pad(m))}:${digits(pad(s))}`;
  if (digitsEl) {
    digitsEl.textContent = text;
    digitsEl.dataset.hasHours = h > 0 ? '1' : '0';
  }

  if (stateBadge) {
    const labels = {
      ready: t('timer.ready'),
      running: t('timer.running'),
      paused: t('timer.paused'),
      finished: t('timer.finished'),
    };
    stateBadge.textContent = labels[timerStatus] || t('timer.ready');
    stateBadge.dataset.status = timerStatus;
  }

  if (progressArc) {
    const fraction = timerDuration > 0 ? Math.max(0, Math.min(1, timerRemaining / timerDuration)) : 0;
    progressArc.style.strokeDashoffset = String(100 - fraction * 100);
  }

  if (mainIcon && mainText) {
    if (timerStatus === 'running') {
      mainIcon.textContent = '❚❚';
      mainText.textContent = t('timer.pause');
    } else if (timerStatus === 'paused') {
      mainIcon.textContent = '▶';
      mainText.textContent = t('timer.resume');
    } else {
      mainIcon.textContent = '▶';
      mainText.textContent = t('timer.start');
    }
  }

  if (dot) {
    dot.hidden = timerStatus !== 'running';
  }
}

function startTimer() {
  if (timerStatus === 'running') return;
  if (timerRemaining <= 0) timerRemaining = timerDuration;
  timerEndsAt = Date.now() + timerRemaining * 1000;
  timerStatus = 'running';
  updateTimerUI();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const now = Date.now();
    timerRemaining = Math.max(0, Math.ceil((timerEndsAt - now) / 1000));
    updateTimerUI();
    if (timerRemaining <= 0) {
      finishTimer();
    }
  }, 250);
}

function pauseTimer() {
  if (timerStatus !== 'running') return;
  clearInterval(timerInterval);
  timerStatus = 'paused';
  updateTimerUI();
}

function resetTimer() {
  clearInterval(timerInterval);
  timerStatus = 'ready';
  timerRemaining = timerDuration;
  updateTimerUI();
}

function toggleTimer() {
  if (timerStatus === 'running') {
    pauseTimer();
  } else {
    startTimer();
  }
}

function addTimerMinute(mins = 1) {
  timerRemaining += mins * 60;
  if (timerStatus === 'running') {
    timerEndsAt += mins * 60 * 1000;
  } else {
    timerDuration = timerRemaining;
  }
  updateTimerUI();
}

function setTimerPreset(seconds) {
  clearInterval(timerInterval);
  timerDuration = seconds;
  timerRemaining = seconds;
  timerStatus = 'ready';
  document.querySelectorAll('.preset-chip').forEach((chip) => {
    chip.classList.toggle('active', Number(chip.dataset.sec) === seconds);
  });
  updateTimerUI();
}

function finishTimer() {
  clearInterval(timerInterval);
  timerStatus = 'finished';
  updateTimerUI();
  playTimerChime();
  sendDesktopNotification('⏱️ ' + t('timer.finished'), t('timer.finishedDesc'));
}

/* ==========================================================================
   Configuration & Bootstrapping
   ========================================================================== */

function localizeTimerUI() {
  const isAr = locale().startsWith('ar');
  const presets = [
    { sec: 60, ar: '1 د', en: '1m' },
    { sec: 300, ar: '5 د', en: '5m' },
    { sec: 900, ar: '15 د', en: '15m' },
    { sec: 1500, ar: '25 د', en: '25m' },
  ];
  document.querySelectorAll('.preset-chip[data-sec]').forEach((chip) => {
    const sec = Number(chip.dataset.sec);
    const p = presets.find((x) => x.sec === sec);
    if (p) chip.textContent = isAr ? p.ar : p.en;
  });
  const uH = $('#lblUnitH');
  if (uH) uH.textContent = isAr ? 'س' : 'h';
  const uM = $('#lblUnitM');
  if (uM) uM.textContent = isAr ? 'د' : 'm';
  const uS = $('#lblUnitS');
  if (uS) uS.textContent = isAr ? 'ث' : 's';
  const addBtn = $('#timerAddMinBtn');
  if (addBtn) addBtn.textContent = isAr ? '+1 د' : '+1m';
}

let hasSetCustomTimer = false;

function applyConfig(s) {
  cfg = {
    style: 'ring',
    hour12: true,
    seconds: true,
    zones: [],
    ultraTransparent: true,
    defaultTab: 'clock',
    alarmSound: true,
    snoozeDuration: 5,
    timerSound: true,
    timerDefaultSec: 300,
    desktopNotify: true,
    ...(s.clock || {}),
  };
  dateFormats.clear();
  built = null;
  lastFit = '';
  build();
  buildZones();
  render();

  if (Array.isArray(s?.clock?.alarms)) {
    cfg.alarms = s.clock.alarms;
    alarms = [...s.clock.alarms];
    try { localStorage.setItem('mirqat_clock_alarms', JSON.stringify(alarms)); } catch { }
  }

  loadAlarms();
  renderAlarmsList();
  localizeTimerUI();

  if (cfg.defaultTab && !hasSwitchedTabManually && activeTab !== cfg.defaultTab) {
    switchTab(cfg.defaultTab);
  }

  if (timerStatus === 'ready' && !hasSetCustomTimer && cfg.timerDefaultSec) {
    setTimerPreset(Number(cfg.timerDefaultSec) || 300);
  }

  const isMax = cfg.ultraTransparent !== false && localStorage.getItem('clock_ultra_transparent') !== '0';
  setTransparency(isMax);
}

boot(async (s) => {
  // Action icons
  const crystalIconSvg = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9l4-6z"/><path d="M2 9h20M12 21 8.5 9 12 3l3.5 6L12 21z"/></svg>';
  const transpBtn = $('#transparencyBtn');
  if (transpBtn) {
    transpBtn.innerHTML = crystalIconSvg;
    transpBtn.addEventListener('click', toggleTransparency);
  }

  const setBtn = $('#settingsBtn');
  if (setBtn) {
    setBtn.append(icon('gear'));
    setBtn.addEventListener('click', () => window.widgets?.win?.openSettings?.('clock'));
  }

  const clsBtn = $('#closeBtn');
  if (clsBtn) {
    clsBtn.append(icon('close'));
    clsBtn.addEventListener('click', () => closeWindow());
  }

  // Tab switcher
  document.querySelectorAll('.clock-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab, true));
  });

  // Alarm drawer triggers
  const addAlarmBtn = $('#addAlarmBtn');
  if (addAlarmBtn) addAlarmBtn.addEventListener('click', () => openAlarmEditor());
  const closeDrawerBtn = $('#closeDrawerBtn');
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeAlarmEditor);
  const cancelAlarmBtn = $('#cancelAlarmBtn');
  if (cancelAlarmBtn) cancelAlarmBtn.addEventListener('click', closeAlarmEditor);
  const saveAlarmBtn = $('#saveAlarmBtn');
  if (saveAlarmBtn) saveAlarmBtn.addEventListener('click', saveAlarmFromEditor);
  const deleteAlarmBtn = $('#deleteAlarmBtn');
  if (deleteAlarmBtn) {
    deleteAlarmBtn.addEventListener('click', () => {
      if (editingAlarmId) {
        confirmDelete({
          title: 'هل أنت متأكد من الحذف؟',
          confirmText: 'حذف',
          cancelText: 'إلغاء',
          onConfirm: () => deleteAlarm(editingAlarmId),
        });
      }
    });
  }

  // Steppers & Wheel for time picker
  $('#btnHourUp')?.addEventListener('click', () => stepHour(1));
  $('#btnHourDown')?.addEventListener('click', () => stepHour(-1));
  $('#btnMinUp')?.addEventListener('click', () => stepMinute(1));
  $('#btnMinDown')?.addEventListener('click', () => stepMinute(-1));

  $('#alarmHour')?.addEventListener('wheel', (e) => {
    e.preventDefault();
    stepHour(e.deltaY < 0 ? 1 : -1);
  }, { passive: false });

  $('#alarmMinute')?.addEventListener('wheel', (e) => {
    e.preventDefault();
    stepMinute(e.deltaY < 0 ? 1 : -1);
  }, { passive: false });

  $('#alarmHour')?.addEventListener('blur', (e) => {
    const val = Math.max(1, Math.min(12, Number(e.target.value) || 12));
    e.target.value = String(val);
  });

  $('#alarmMinute')?.addEventListener('blur', (e) => {
    const val = Math.max(0, Math.min(59, Number(e.target.value) || 0));
    e.target.value = String(val);
  });

  // AM/PM buttons
  document.querySelectorAll('.ampm-option').forEach((opt) => {
    opt.addEventListener('click', () => setAmPm(opt.dataset.val));
  });

  // Day chips
  document.querySelectorAll('.day-chip').forEach((chip) => {
    chip.addEventListener('click', () => chip.classList.toggle('active'));
  });

  // Day shortcuts
  const btnEveryday = $('#btnEveryday');
  if (btnEveryday) {
    btnEveryday.addEventListener('click', () => {
      document.querySelectorAll('.day-chip').forEach((c) => c.classList.add('active'));
    });
  }
  const btnWorkdays = $('#btnWorkdays');
  if (btnWorkdays) {
    btnWorkdays.addEventListener('click', () => {
      document.querySelectorAll('.day-chip').forEach((c) => {
        c.classList.toggle('active', [0, 1, 2, 3, 4, 6].includes(Number(c.dataset.day)));
      });
    });
  }
  const btnOnce = $('#btnOnce');
  if (btnOnce) {
    btnOnce.addEventListener('click', () => {
      document.querySelectorAll('.day-chip').forEach((c) => c.classList.remove('active'));
    });
  }

  // Sound test
  const testSoundBtn = $('#alarmSoundTestBtn');
  if (testSoundBtn) {
    testSoundBtn.addEventListener('click', () => {
      playAlarmChime();
      setTimeout(stopAlarmChime, 1800);
    });
  }

  // Alarm ringing overlay buttons
  const dismissBtn = $('#ringingDismissBtn');
  if (dismissBtn) dismissBtn.addEventListener('click', dismissRingingAlarm);
  const snoozeBtn = $('#ringingSnoozeBtn');
  if (snoozeBtn) snoozeBtn.addEventListener('click', snoozeRingingAlarm);

  // Timer controls
  const timerMainBtn = $('#timerMainBtn');
  if (timerMainBtn) timerMainBtn.addEventListener('click', toggleTimer);
  const timerResetBtn = $('#timerResetBtn');
  if (timerResetBtn) timerResetBtn.addEventListener('click', resetTimer);
  const timerAddMinBtn = $('#timerAddMinBtn');
  if (timerAddMinBtn) timerAddMinBtn.addEventListener('click', () => addTimerMinute(1));

  // Timer preset chips & custom inputs
  const customInputs = $('#timerCustomInputs');
  const presetChips = $('#timerPresetChips');
  const btnCustomTimer = $('#btnCustomTimer');
  const btnCancelCustom = $('#btnCancelCustomTimer');
  const btnApplyCustom = $('#btnApplyCustomTimer');

  const inpH = $('#timerInputH');
  const inpM = $('#timerInputM');
  const inpS = $('#timerInputS');

  const setupTimerInput = (input, max, nextInput, prevInput) => {
    if (!input) return;
    input.addEventListener('focus', () => input.select());
    input.addEventListener('input', () => {
      let val = input.value;
      if (val.length > 2) input.value = val.slice(-2);
      const num = parseInt(input.value, 10);
      if (!isNaN(num) && num > max) input.value = String(max);
    });
    input.addEventListener('wheel', (e) => {
      e.preventDefault();
      let val = parseInt(input.value, 10) || 0;
      val += (e.deltaY < 0 ? 1 : -1);
      if (val < 0) val = max;
      if (val > max) val = 0;
      input.value = String(val);
    }, { passive: false });
    input.addEventListener('blur', () => {
      let val = parseInt(input.value, 10);
      if (isNaN(val) || val < 0) val = 0;
      if (val > max) val = max;
      input.value = String(val);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnApplyCustom?.click();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        btnCancelCustom?.click();
      } else if (e.key === ':' || (e.key === 'ArrowRight' && input.selectionEnd === input.value.length)) {
        if (nextInput) {
          e.preventDefault();
          nextInput.focus();
          nextInput.select();
        }
      } else if (e.key === 'ArrowLeft' && input.selectionStart === 0) {
        if (prevInput) {
          e.preventDefault();
          prevInput.focus();
          prevInput.select();
        }
      }
    });
  };

  setupTimerInput(inpH, 23, inpM, null);
  setupTimerInput(inpM, 59, inpS, inpH);
  setupTimerInput(inpS, 59, null, inpM);

  document.querySelectorAll('.preset-chip[data-sec]').forEach((chip) => {
    chip.addEventListener('click', () => {
      setTimerPreset(Number(chip.dataset.sec));
      if (customInputs) customInputs.hidden = true;
      if (presetChips) presetChips.hidden = false;
      if (btnCustomTimer) btnCustomTimer.classList.remove('active');
    });
  });

  if (btnCustomTimer && customInputs && presetChips) {
    btnCustomTimer.addEventListener('click', () => {
      const total = timerRemaining > 0 ? timerRemaining : (timerDuration || 300);
      const curH = Math.floor(total / 3600);
      const curM = Math.floor((total % 3600) / 60);
      const curS = total % 60;
      if (inpH) inpH.value = String(curH);
      if (inpM) inpM.value = String(curM);
      if (inpS) inpS.value = String(curS);
      presetChips.hidden = true;
      customInputs.hidden = false;
      inpM?.focus();
      inpM?.select();
    });
  }

  if (btnCancelCustom && customInputs && presetChips) {
    btnCancelCustom.addEventListener('click', () => {
      customInputs.hidden = true;
      presetChips.hidden = false;
    });
  }

  if (btnApplyCustom && customInputs && presetChips) {
    btnApplyCustom.addEventListener('click', () => {
      const h = Math.max(0, Math.min(23, parseInt(inpH?.value, 10) || 0));
      const m = Math.max(0, Math.min(59, parseInt(inpM?.value, 10) || 0));
      const sec = Math.max(0, Math.min(59, parseInt(inpS?.value, 10) || 0));
      const total = h * 3600 + m * 60 + sec;
      if (total > 0) {
        hasSetCustomTimer = true;
        document.querySelectorAll('.preset-chip[data-sec]').forEach((c) => c.classList.remove('active'));
        if (btnCustomTimer) btnCustomTimer.classList.add('active');
        setTimerPreset(total);
      }
      customInputs.hidden = true;
      presetChips.hidden = false;
    });
  }

  // Init UI & config
  applyConfig(s);
  updateTimerUI();
  schedule();

  window.UI?.onDormancy?.((isDormant) => {
    if (isDormant) {
      clearTimeout(timer);
    } else {
      render();
      schedule();
    }
  });

  window.widgets?.settings?.onChange?.((next) => applyConfig(next));
  window.widgets?.onWake?.(() => { render(); schedule(); });
  window.addEventListener('resize', () => {
    lastFit = '';
    render();
  });
  window.addEventListener('beforeunload', () => {
    clearTimeout(timer);
    stopAlarmChime();
  });
});
