'use strict';
/*
 * Reflection widget: an ayah with its tafsir, or a hadith with its
 * explanation, depending on the setting (or alternating between them).
 *
 * The ayah and the hadith are inserted with textContent, never innerHTML, so
 * what the source published is what is rendered - nothing in this file
 * transforms either text in any way.
 */

const { $, icon, boot, closeWindow, until, t, strings, lang, digits } = window.UI;

// Interface labels: The Quran widget always preserves its sacred Arabic form in all modes.
strings({
  ar: {
    'quran.title': 'آية',
    'quran.another': 'آية أخرى',
    'quran.prev': 'السابق',
    'quran.nextNav': 'التالي',
    'quran.tafsir': 'التفسير',
    'quran.retry': 'إعادة المحاولة',
    'quran.next': 'الآية التالية بعد {left}',
    'quran.open': 'اضغط لقراءة التفسير',
    'quran.openCached': 'نسخة محفوظة — اضغط لقراءة التفسير',
    'quran.loading': 'جارٍ الجلب…',
    'quran.failed': 'تعذّر الجلب. تأكد من الاتصال بالإنترنت.',
    'quran.failedShort': 'تعذّر الجلب.',
    'quran.sharh': 'الشرح',
    'quran.hadithPlace': 'حديث شريف · {attr}',
    'quran.nextHadith': 'الحديث التالي بعد {left}',
    'quran.openHadith': 'اضغط لقراءة الشرح',
    'quran.anotherHadith': 'حديث آخر',
  },
  en: {
    'quran.title': 'آية',
    'quran.another': 'آية أخرى',
    'quran.prev': 'السابق',
    'quran.nextNav': 'التالي',
    'quran.tafsir': 'التفسير',
    'quran.retry': 'إعادة المحاولة',
    'quran.next': 'الآية التالية بعد {left}',
    'quran.open': 'اضغط لقراءة التفسير',
    'quran.openCached': 'نسخة محفوظة — اضغط لقراءة التفسير',
    'quran.loading': 'جارٍ الجلب…',
    'quran.failed': 'تعذّر الجلب. تأكد من الاتصال بالإنترنت.',
    'quran.failedShort': 'تعذّر الجلب.',
    'quran.sharh': 'الشرح',
    'quran.hadithPlace': 'حديث شريف · {attr}',
    'quran.nextHadith': 'الحديث التالي بعد {left}',
    'quran.openHadith': 'اضغط لقراءة الشرح',
    'quran.anotherHadith': 'حديث آخر',
  },
});

let current = null;     // { kind: 'quran' | 'hadith', payload }
let tick = null;
let history = [];
let historyIndex = -1;

const BOOK_NAMES = {
  bukhari: { ar: 'صحيح البخاري', en: 'Sahih al-Bukhari' },
  muslim: { ar: 'صحيح مسلم', en: 'Sahih Muslim' },
  abudawud: { ar: 'سنن أبي داود', en: 'Sunan Abi Dawud' },
  tirmidhi: { ar: 'جامع الترمذي', en: 'Jami at-Tirmidhi' },
  nasai: { ar: 'سنن النسائي', en: 'Sunan an-Nasai' },
  ibnmajah: { ar: 'سنن ابن ماجه', en: 'Sunan Ibn Majah' },
};

/* ---------- rendering ---------- */

function animateIn(node) {
  node.classList.remove('fresh');
  void node.offsetWidth;                 // restart the animation
  node.classList.add('fresh');
}

function fitAyah() {
  const node = $('#ayah');
  const card = $('#card');
  if (!node || !card || card.hidden) return;

  // Reset previously applied auto-fit styling to take clean measurements
  node.style.removeProperty('--ayah-size');
  node.style.removeProperty('--ayah-lh');
  node.style.alignContent = '';
  card.classList.remove('fit-compact');

  let clientH = node.clientHeight;
  let scrollH = node.scrollHeight;

  // If text already comfortably fits in card, default styles are optimal
  if (scrollH <= clientH) {
    node.style.alignContent = 'safe center';
    return;
  }

  // Stage 1: Try compact card padding to give extra vertical clearance
  card.classList.add('fit-compact');
  clientH = node.clientHeight;
  scrollH = node.scrollHeight;
  if (scrollH <= clientH) {
    node.style.alignContent = 'safe center';
    return;
  }

  // Stage 2: Autoscaling font size & line height smoothly down to safe bounds
  const isHadith = node.classList.contains('hadith');
  const cs = window.getComputedStyle(node);
  let size = parseFloat(cs.fontSize) || (isHadith ? 14 : 17);
  let lh = isHadith ? 1.65 : 1.85;
  const minSize = isHadith ? 9.5 : 10.5;
  const minLh = isHadith ? 1.35 : 1.45;

  let steps = 0;
  while (node.scrollHeight > node.clientHeight && size > minSize && steps < 30) {
    steps++;
    size = Math.max(minSize, size - 0.4);
    lh = Math.max(minLh, lh - 0.03);
    node.style.setProperty('--ayah-size', `${size.toFixed(1)}px`);
    node.style.setProperty('--ayah-lh', lh.toFixed(2));
  }

  // If text fits after scaling, center safely; otherwise align to start for clean reading without overlapping footer
  if (node.scrollHeight <= node.clientHeight) {
    node.style.alignContent = 'safe center';
  } else {
    node.style.alignContent = 'start';
  }
}

function setHint(key) {
  const label = $('#hintLabel');
  label.dataset.i18n = key;
  label.textContent = t(key);
}

function themesOf(pick) {
  return (pick && pick.themeLabels || []).map((x) => x.ar || x.en).filter(Boolean);
}

function showAyah(payload, animate) {
  const { ayah, pick } = payload;
  const node = $('#ayah');
  node.classList.remove('hadith');
  // textContent, deliberately: the ayah is placed as plain text exactly as
  // the source returned it.
  node.textContent = ayah.text;
  node.classList.remove('long', 'xlong');
  if (ayah.text.length > 180) node.classList.add('xlong');
  else if (ayah.text.length > 70) node.classList.add('long');
  if (animate) animateIn(node);
  requestAnimationFrame(fitAyah);
  document.fonts?.ready?.then(() => requestAnimationFrame(fitAyah));

  $('#place').textContent = `${ayah.surahNameAr} · ${digits(ayah.ayah)}`;
  const themes = themesOf(pick);
  $('#theme').textContent = themes.join(' · ');
  $('#theme').hidden = themes.length === 0;
  $('#card').title = payload.offline ? t('quran.openCached') : t('quran.open');
  setHint('quran.tafsir');
  $('#refreshBtn').title = t('quran.another');
}

function showHadith(payload, animate) {
  const { hadith, pick } = payload;
  const node = $('#ayah');
  node.classList.add('hadith');
  // The hadith as HadeethEnc published it, as plain text, unaltered.
  node.textContent = hadith.text;
  node.classList.remove('long', 'xlong');
  if (hadith.text.length > 360) node.classList.add('xlong');
  else if (hadith.text.length > 160) node.classList.add('long');
  if (animate) animateIn(node);
  requestAnimationFrame(fitAyah);
  document.fonts?.ready?.then(() => requestAnimationFrame(fitAyah));

  const book = BOOK_NAMES[hadith.verification && hadith.verification.book];
  const attr = hadith.attribution || (book ? book.ar : '');
  $('#place').textContent = t('quran.hadithPlace', { attr });
  const themes = themesOf(pick);
  $('#theme').textContent = themes.join(' · ');
  $('#theme').hidden = themes.length === 0;
  $('#card').title = t('quran.openHadith');
  setHint('quran.sharh');
  $('#refreshBtn').title = t('quran.anotherHadith');
}

function updateNavButtons() {
  const prevBtn = $('#prevAyahBtn');
  const nextBtn = $('#nextAyahBtn');
  if (prevBtn) prevBtn.hidden = historyIndex <= 0;
  if (nextBtn) nextBtn.hidden = historyIndex >= history.length - 1;
}

function show(result, { animate = true, pushHistory = true } = {}) {
  current = result;
  if (pushHistory && result) {
    if (historyIndex >= 0 && historyIndex < history.length - 1) {
      history = history.slice(0, historyIndex + 1);
    }
    history.push(result);
    historyIndex = history.length - 1;
  }
  updateNavButtons();
  $('#state').hidden = true;
  $('#card').hidden = false;
  $('#headIcon').replaceChildren(icon(result.kind === 'hadith' ? 'note' : 'book'));
  if (result.kind === 'hadith') showHadith(result.payload, animate);
  else showAyah(result.payload, animate);
  updateWhen();
  clearInterval(tick);
  tick = setInterval(updateWhen, 30_000);
}

function updateWhen() {
  if (window.UI?.isDormant?.() || !current) return;
  const left = until(current.payload.slot.endsAt);
  const offline = current.payload.offline ? '<span class="offline-dot"></span>' : '';
  $('#when').innerHTML = `${offline}${t(current.kind === 'hadith' ? 'quran.nextHadith' : 'quran.next', { left })}`;
}

function showState(text, { retry = false, spinner = true } = {}) {
  $('#card').hidden = true;
  $('#state').hidden = false;
  $('#stateText').textContent = text;
  $('#spinner').hidden = !spinner;
  $('#retryBtn').hidden = !retry;
}

/* ---------- actions ---------- */

async function load({ force = false, animate = true } = {}) {
  const btn = $('#refreshBtn');
  if (force) {
    btn.classList.add('spinning');
    setTimeout(() => btn.classList.remove('spinning'), 700);
  }
  if (!current) showState(t('quran.loading'));
  try {
    show(await window.widgets.inspire.current({ force }), { animate });
  } catch (err) {
    if (current) return;                   // keep what is on screen
    showState(t('quran.failed'), { retry: true, spinner: false });
  }
}

function openDetail() {
  if (!current) return;
  const sel = window.getSelection();
  if (sel && sel.toString().trim().length > 0) return;
  if (current.kind === 'hadith') window.widgets.win.openHadith(current.payload.hadith.id);
  else window.widgets.win.openTafsir(current.payload.ayah.key);
}

/* ---------- wiring ---------- */

function wire() {
  $('#headIcon').append(icon('book'));
  $('#prevAyahBtn').append(icon('chevronLeft') || icon('chevron'));
  $('#nextAyahBtn').append(icon('chevron'));
  $('#refreshBtn').append(icon('refresh'));
  $('#settingsBtn').append(icon('gear'));
  $('#closeBtn').append(icon('close'));
  $('#hint').prepend(icon('chevron'));

  $('#prevAyahBtn').addEventListener('click', () => {
    if (historyIndex > 0) {
      historyIndex--;
      show(history[historyIndex], { animate: true, pushHistory: false });
    }
  });

  $('#nextAyahBtn').addEventListener('click', () => {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      show(history[historyIndex], { animate: true, pushHistory: false });
    }
  });

  $('#card').addEventListener('click', openDetail);

  if (typeof ResizeObserver !== 'undefined') {
    const cardEl = $('#card');
    if (cardEl) {
      const ro = new ResizeObserver(() => fitAyah());
      ro.observe(cardEl);
    }
  } else {
    window.addEventListener('resize', fitAyah);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => fitAyah()).catch(() => {});
  }

  $('#refreshBtn').addEventListener('click', () => load({ force: true }));
  $('#retryBtn').addEventListener('click', () => load({ force: false }));
  $('#settingsBtn').addEventListener('click', () => window.widgets.win.openSettings('quran'));
  $('#closeBtn').addEventListener('click', () => closeWindow());

  // The main process drives the rotation; the widget just listens.
  window.widgets.inspire.onUpdate((next) => show(next));
  window.widgets.quran.onError(() => {
    if (!current) showState(t('quran.failedShort'), { retry: true, spinner: false });
  });

  window.UI?.onDormancy?.((isDormant) => {
    if (!isDormant) updateWhen();
  });

  window.addEventListener('beforeunload', () => clearInterval(tick));
}

boot(async () => {
  wire();
  await load({ animate: false });
});
