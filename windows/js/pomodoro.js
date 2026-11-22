'use strict';
/*
 * Pomodoro widget.
 *
 * The timer itself runs in the main process (see src/core/pomodoro.js), so it
 * keeps counting when this window is hidden. This page only draws the state
 * it is sent, counts down to the second locally between updates, and plays
 * the end-of-session chime.
 */

const { $, $$, icon, boot, closeWindow, digits, debounce, t, strings, lang } = window.UI;

strings({
  ar: {
    'pomo.title': 'مؤقت التركيز',
    'pomo.settings': 'إعدادات المؤقت',
    'pomo.reset': 'إعادة ضبط',
    'pomo.skip': 'المرحلة التالية',
    'pomo.start': 'ابدأ',
    'pomo.pause': 'إيقاف مؤقت',
    'pomo.resume': 'استئناف',
    'pomo.short': 'قصيرة',
    'pomo.long': 'طويلة',
    'pomo.shortFull': 'استراحة قصيرة',
    'pomo.longFull': 'استراحة طويلة',
    'pomo.sessions': 'جلسات اليوم',
    'pomo.minutes': 'دقيقة تركيز',
    'pomo.next': 'التالي: {name} · {n} د',
    'pomo.dots': '{done} من {every} قبل الاستراحة الطويلة',
    'pomo.done': 'تم',
    'pomo.min': 'د',
    'pomo.f.label': 'اسم الجلسة',
    'pomo.f.focus': 'التركيز',
    'pomo.f.every': 'جلسات للطويلة',
    'pomo.f.autoBreaks': 'استراحة تلقائية',
    'pomo.f.autoFocus': 'تركيز تلقائي',
    'pomo.f.sound': 'صوت التنبيه',
    'pomo.f.notify': 'إشعار',
    'pomo.f.volume': 'مستوى الصوت',
    'pomo.f.test': 'تجربة الصوت',
    'pomo.defaultLabel': 'مذاكرة',
    'pomo.transparency': 'الشفافية القصوى',
    's.pomodoroPureTransparent': 'الشفافية القصوى',
  },
  en: {
    'pomo.title': 'Focus timer',
    'pomo.settings': 'Timer settings',
    'pomo.reset': 'Reset',
    'pomo.skip': 'Next phase',
    'pomo.start': 'Start',
    'pomo.pause': 'Pause',
    'pomo.resume': 'Resume',
    'pomo.short': 'Short',
    'pomo.long': 'Long',
    'pomo.shortFull': 'Short break',
    'pomo.longFull': 'Long break',
    'pomo.sessions': 'sessions today',
    'pomo.minutes': 'focus minutes',
    'pomo.next': 'Next: {name} · {n} min',
    'pomo.dots': '{done} of {every} before the long break',
    'pomo.done': 'Done',
    'pomo.min': 'min',
    'pomo.f.label': 'Session name',
    'pomo.f.focus': 'Focus',
    'pomo.f.every': 'Sessions per set',
    'pomo.f.autoBreaks': 'Auto-start breaks',
    'pomo.f.autoFocus': 'Auto-start focus',
    'pomo.f.sound': 'Chime',
    'pomo.f.notify': 'Notification',
    'pomo.f.volume': 'Volume',
    'pomo.f.test': 'Test the chime',
    'pomo.defaultLabel': 'Study',
    'pomo.transparency': 'Max Transparency',
    's.pomodoroPureTransparent': 'Max Transparency',
  },
});

/** The default session name follows the interface language. */
function labelOf(config) {
  const label = (config && config.label) || '';
  return !label || label === 'مذاكرة' ? t('pomo.defaultLabel') : label;
}

let snap = null;
let cfg = {};
let tick = null;

const LIMITS = { focus: [1, 180], short: [1, 60], long: [1, 90], every: [2, 12] };
const modeLabel = (m) => t(m === 'short' ? 'pomo.shortFull' : 'pomo.longFull');

/* ---------- time ---------- */

function remainingNow() {
  if (!snap) return 0;
  if (snap.status === 'running') return Math.max(0, snap.endsAt - Date.now());
  return snap.remaining;
}

function mmss(ms) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return digits(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
}

/* ---------- drawing ---------- */

function drawClock() {
  const left = remainingNow();
  $('#remaining').textContent = mmss(left);
  const done = snap.duration ? 1 - left / snap.duration : 0;
  $('#bar').style.width = `${Math.max(0, Math.min(100, done * 100))}%`;
}

function draw() {
  if (!snap) return;
  const root = $('#front');
  root.dataset.mode = snap.mode;
  root.dataset.status = snap.status;

  $('#label').textContent = snap.mode === 'focus' ? labelOf(snap.config) : modeLabel(snap.mode);

  // Session dots: filled for each focus session done in this set.
  const dots = [];
  for (let i = 0; i < snap.every; i++) {
    const cls = ['dot'];
    if (i < snap.cycle) cls.push('done');
    if (i === snap.cycle && snap.mode === 'focus' && snap.status === 'running') cls.push('live');
    dots.push(`<i class="${cls.join(' ')}"></i>`);
  }
  $('#dots').innerHTML = dots.join('');
  $('#dots').title = t('pomo.dots', { done: digits(snap.cycle), every: digits(snap.every) });

  const main = $('#mainBtn');
  const running = snap.status === 'running';
  main.classList.toggle('on', running);
  $('#mainIcon').replaceChildren(icon(running ? 'pause' : 'play'));
  $('#mainText').textContent = t(running ? 'pomo.pause' : snap.status === 'paused' ? 'pomo.resume' : 'pomo.start');

  for (const b of $$('.mode')) b.classList.toggle('on', b.dataset.mode === snap.mode);
  $('#modeFocus').textContent = labelOf(snap.config);

  $('#statSessions').textContent = digits(snap.today.sessions);
  $('#statMinutes').textContent = digits(Math.round(snap.today.focusMs / 60000));

  const nextMode = snap.mode === 'focus'
    ? ((snap.cycle + 1) % snap.every === 0 ? 'long' : 'short')
    : 'focus';
  const nextName = nextMode === 'focus' ? labelOf(snap.config) : modeLabel(nextMode);
  $('#next').textContent = t('pomo.next', { name: nextName, n: digits(snap.config[nextMode]) });

  $('#bar').classList.toggle('instant', !running);
  drawClock();
  schedule();
}

function schedule() {
  clearTimeout(tick);
  if (window.UI?.isDormant?.()) return;
  if (!snap || snap.status !== 'running') return;
  const left = remainingNow();
  // Wake exactly when the displayed second changes.
  const delay = (left % 1000) || 1000;
  tick = setTimeout(() => { drawClock(); schedule(); }, delay + 4);
}

function setState(next) {
  snap = next;
  cfg = next.config;
  draw();
}

/* ---------- chime ---------- */

/** A soft three-note bell, synthesised so no audio file is needed. */
function chime(volume = cfg.volume ?? 0.6) {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime + 0.02;
    const master = ctx.createGain();
    master.gain.value = Math.max(0, Math.min(1, volume)) * 0.9;
    master.connect(ctx.destination);
    const notes = [[880, 0], [1318.5, 0.2], [1760, 0.4]];
    for (const [f, t] of notes) {
      for (const [mult, amp] of [[1, 0.5], [2.01, 0.14], [3.02, 0.05]]) {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = f * mult;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, now + t);
        g.gain.exponentialRampToValueAtTime(amp, now + t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, now + t + 1.8);
        o.connect(g).connect(master);
        o.start(now + t);
        o.stop(now + t + 1.9);
      }
    }
    setTimeout(() => ctx.close(), 2800);
  } catch { /* no audio device */ }
}

function celebrate() {
  const plate = $('.plate');
  plate.classList.remove('celebrate');
  void plate.offsetWidth;
  plate.classList.add('celebrate');
  setTimeout(() => plate.classList.remove('celebrate'), 1600);
}

/* ---------- quick settings (back of the tile) ---------- */

const saveConfig = debounce((patch) => window.widgets.settings.set({ pomodoro: patch }), 250);

function setConfig(patch) {
  Object.assign(cfg, patch);
  saveConfig({ ...cfg });
}

function stepper(row) {
  const key = row.dataset.key;
  const [lo, hi] = LIMITS[key];
  const box = row.querySelector('.stepper');
  const minus = document.createElement('button');
  const plus = document.createElement('button');
  const value = document.createElement('span');
  minus.className = 'step'; plus.className = 'step';
  minus.append(icon('minus')); plus.append(icon('plus'));
  value.className = 'step-val numerals';
  box.replaceChildren(minus, value, plus);
  const show = () => { value.textContent = digits(cfg[key]); };
  const bump = (d) => {
    const next = Math.min(hi, Math.max(lo, (cfg[key] || lo) + d));
    if (next === cfg[key]) { box.classList.remove('bounce'); void box.offsetWidth; box.classList.add('bounce'); return; }
    setConfig({ [key]: next });
    show();
  };
  minus.addEventListener('click', () => bump(-1));
  plus.addEventListener('click', () => bump(1));
  row.refresh = show;
  show();
}

function switchFor(id, key) {
  const b = $(id);
  const show = () => b.setAttribute('aria-checked', cfg[key] ? 'true' : 'false');
  b.addEventListener('click', () => { setConfig({ [key]: !cfg[key] }); show(); });
  b.refresh = show;
  show();
}

let isUltraTransparent = false;

function setTransparency(val) {
  isUltraTransparent = Boolean(val);
  const plate = $('.plate');
  const btn = $('#transparencyBtn');
  const sw = $('#fUltraTransparent');
  if (plate) {
    if (isUltraTransparent) {
      plate.dataset.transparency = 'max';
    } else {
      delete plate.dataset.transparency;
    }
  }
  if (btn) {
    btn.classList.toggle('active', isUltraTransparent);
    btn.title = isUltraTransparent ? (t('pomo.transparency') + ': ' + (lang === 'ar' ? 'مفعّلة' : 'Enabled')) : (t('pomo.transparency') + ': ' + (lang === 'ar' ? 'معطلة' : 'Disabled'));
  }
  if (sw) {
    sw.setAttribute('aria-checked', isUltraTransparent ? 'true' : 'false');
  }
}

function toggleTransparency() {
  const next = !isUltraTransparent;
  setTransparency(next);
  try {
    localStorage.setItem('pomodoro_ultra_transparent', next ? '1' : '0');
    window.widgets?.settings?.set?.({ pomodoro: { ultraTransparent: next } });
  } catch {}
}

function fillForm() {
  $('#fLabel').value = labelOf(cfg);
  $('#fVolume').value = String(Math.round((cfg.volume ?? 0.6) * 100));
  for (const row of $$('.f-row[data-key]')) row.refresh?.();
  for (const id of ['#fAutoBreaks', '#fAutoFocus', '#fSound', '#fNotify']) $(id).refresh?.();
  const sw = $('#fUltraTransparent');
  if (sw) sw.setAttribute('aria-checked', isUltraTransparent ? 'true' : 'false');
}

function buildForm() {
  for (const row of $$('.f-row[data-key]')) stepper(row);
  switchFor('#fAutoBreaks', 'autoBreaks');
  switchFor('#fAutoFocus', 'autoFocus');
  switchFor('#fSound', 'sound');
  switchFor('#fNotify', 'notify');
  const sw = $('#fUltraTransparent');
  if (sw) sw.addEventListener('click', toggleTransparency);
  $('#fLabel').addEventListener('input', (e) => {
    const v = e.target.value.trim();
    if (v) setConfig({ label: v });
  });
  $('#fVolume').addEventListener('input', (e) => setConfig({ volume: Number(e.target.value) / 100 }));
  $('#fVolume').addEventListener('change', () => chime(cfg.volume));
  $('#testSound').addEventListener('click', () => chime(cfg.volume));
  fillForm();
}

function flip(on) {
  $('#flipper').classList.toggle('flipped', on);
  if (on) fillForm();
}

/* ---------- wiring ---------- */

boot(async () => {
  const crystalIconSvg = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9l4-6z"/><path d="M2 9h20M12 21 8.5 9 12 3l3.5 6L12 21z"/></svg>';
  const transpBtn = $('#transparencyBtn');
  if (transpBtn) {
    transpBtn.innerHTML = crystalIconSvg;
    transpBtn.addEventListener('click', toggleTransparency);
  }

  $('#settingsBtn').append(icon('gear'));
  $('#closeBtn').append(icon('close'));
  $('#resetBtn').append(icon('reset'));
  $('#skipBtn').append(icon('skip'));
  $('#doneBtn').append(icon('check'));

  $('#settingsBtn').addEventListener('click', () => flip(!$('#flipper').classList.contains('flipped')));
  $('#doneBtn').addEventListener('click', () => flip(false));
  $('#closeBtn').addEventListener('click', () => closeWindow());

  const act = async (action, mode) => setState(await window.widgets.pomodoro.act(action, mode));
  $('#mainBtn').addEventListener('click', () => act('toggle'));
  $('#resetBtn').addEventListener('click', () => act('reset'));
  $('#skipBtn').addEventListener('click', () => act('skip'));
  for (const b of $$('.mode')) b.addEventListener('click', () => act('mode', b.dataset.mode));

  // Space toggles the timer, R resets: handy when the tile has focus.
  window.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;
    if (e.code === 'Space') { e.preventDefault(); act('toggle'); }
    if (e.key === 'r' || e.key === 'R') act('reset');
  });

  setState(await window.widgets.pomodoro.get());
  const initialTransp = Boolean(cfg.ultraTransparent || localStorage.getItem('pomodoro_ultra_transparent') === '1');
  setTransparency(initialTransp);
  buildForm();

  window.widgets.pomodoro.onState(setState);
  window.widgets.pomodoro.onDone((d) => {
    celebrate();
    if (d.chime) chime();
  });
  let lastPomoCfgHash = null;
  window.widgets.settings.onChange(async (s) => {
    const relevant = JSON.stringify({
      pomo: s?.pomodoro,
      eco: s?.eco,
      wStyle: s?.widgetStyles?.pomodoro,
    });
    if (relevant === lastPomoCfgHash) return;
    lastPomoCfgHash = relevant;
    setState(await window.widgets.pomodoro.get());
    if (typeof cfg.ultraTransparent === 'boolean') {
      setTransparency(cfg.ultraTransparent);
    }
    if (!$('#flipper').classList.contains('flipped')) fillForm();
  });
  window.UI?.onDormancy?.((isDormant) => {
    if (isDormant) {
      clearTimeout(tick);
    } else {
      draw();
    }
  });

  window.widgets.onWake(async () => setState(await window.widgets.pomodoro.get()));
  window.addEventListener('beforeunload', () => { clearTimeout(tick); saveConfig.flush(); });
});
