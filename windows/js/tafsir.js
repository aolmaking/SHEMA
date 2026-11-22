'use strict';
/*
 * Tafsir window.
 *
 * The ayah goes in with textContent. The tafsir arrives as HTML that the main
 * process has already stripped to a safe tag allowlist and checked character
 * for character against the original, so it is inserted as markup to keep the
 * publisher's paragraph structure - but not one word of it is changed here.
 */

const { $, el, icon, boot, closeWindow, t, strings, lang, digits } = window.UI;

// Labels around the text. The ayah and the tafsir are always shown in
// Arabic exactly as published, whatever the interface language.
strings({
  ar: {
    'tf.title': 'التفسير',
    'tf.copy': 'نسخ الآية والتفسير',
    'tf.copied': 'تم النسخ',
    'tf.verified': 'نص مُطابَق من مصدرين',
    'tf.why': 'لماذا ظهرت هذه الآية الآن',
    'tf.whyNote': 'هذا وصف آليّ لطريقة اختيار التطبيق للآية، وليس جزءًا من التفسير.',
    'tf.pick': 'اختر التفسير',
    'tf.loading': 'جارٍ جلب التفسير…',
    'tf.retry': 'إعادة المحاولة',
    'tf.kText': 'نص الآية',
    'tf.kVerify': 'التحقق',
    'tf.kTafsir': 'التفسير',
    'tf.note': 'يُعرض نص الآية والتفسير كما نشرهما المصدر، دون أي تعديل أو اختصار.',
    'tf.place': '{surah} · الآية {n}',
    'tf.makki': 'مكية',
    'tf.madani': 'مدنية',
    'tf.via': '{edition} — عبر {provider}',
    'tf.matched': 'طوبق مع {verifier} ({how})',
    'tf.notMatched': 'لم تتم المطابقة',
    'tf.exact': 'تطابق تام',
    'tf.basmala': 'تطابق بعد البسملة',
    'tf.linkAyah': 'الآية على المصدر',
    'tf.linkTafsir': 'التفسير على المصدر',
    'tf.failed': 'تعذّر جلب التفسير من المصدر.',
    'tf.noText': 'لا يوجد نص لهذه الآية في هذا التفسير. جرّب تفسيرًا آخر.',
    'tf.noAyah': 'تعذّر جلب الآية. تأكد من الاتصال بالإنترنت.',
  },
  en: {
    'tf.title': 'Tafsir',
    'tf.copy': 'Copy ayah and tafsir',
    'tf.copied': 'Copied',
    'tf.verified': 'Text matched across two sources',
    'tf.why': 'Why this ayah now',
    'tf.whyNote': "This describes how the app chose the ayah. It is not part of the tafsir.",
    'tf.pick': 'Choose a tafsir',
    'tf.loading': 'Fetching the tafsir…',
    'tf.retry': 'Try again',
    'tf.kText': 'Ayah text',
    'tf.kVerify': 'Verified',
    'tf.kTafsir': 'Tafsir',
    'tf.note': 'The ayah and the tafsir are shown exactly as the source published them, unedited and unabridged.',
    'tf.place': '{surah} · Ayah {n}',
    'tf.makki': 'Makki',
    'tf.madani': 'Madani',
    'tf.via': '{edition} — via {provider}',
    'tf.matched': 'Matched with {verifier} ({how})',
    'tf.notMatched': 'Not matched',
    'tf.exact': 'exact match',
    'tf.basmala': 'match after the Basmala',
    'tf.linkAyah': 'Ayah at the source',
    'tf.linkTafsir': 'Tafsir at the source',
    'tf.failed': 'Could not fetch the tafsir from the source.',
    'tf.noText': 'This tafsir has no text for this ayah. Try another one.',
    'tf.noAyah': 'Could not fetch the ayah. Check your internet connection.',
  },
});

const en = () => lang() === 'en';

let key = new URLSearchParams(location.search).get('key');
let data = null;
let settings = {};
let editionSlug = null;

/* ---------- rendering ---------- */

function sizeAyah(node, text) {
  node.classList.remove('long', 'xlong');
  if (text.length > 320) node.classList.add('xlong');
  else if (text.length > 170) node.classList.add('long');
}

function renderAyah(ayah) {
  const node = $('#ayah');
  node.textContent = ayah.text;          // verbatim
  sizeAyah(node, ayah.text);
  node.classList.add('fresh');

  $('#place').textContent = t('tf.place', { surah: en() ? (ayah.surahNameEn || ayah.surahNameAr) : ayah.surahNameAr, n: digits(ayah.ayah) });
  $('#sub').textContent = [
    en() ? ayah.surahNameAr : ayah.surahNameEn,
    ayah.revelation === 'makkah' ? t('tf.makki') : ayah.revelation === 'madinah' ? t('tf.madani') : '',
  ].filter(Boolean).join(' · ');

  $('#verified').hidden = !ayah.verified;
  $('#ayahSource').textContent = ayah.source.scriptAr || '';
}

function renderWhy(pick) {
  const reasons = (pick && (en() ? pick.rationaleEn || pick.rationale : pick.rationale)) || [];
  $('#whyBlock').hidden = reasons.length === 0;
  if (!reasons.length) return;
  $('#whyList').replaceChildren(...reasons.map((r) => el('li', { text: r })));
}

function renderTafsir(tf) {
  $('#loading').hidden = true;
  $('#failed').hidden = true;
  const box = $('#tafsir');
  box.hidden = false;
  // Already sanitised and verified unchanged in the main process.
  box.innerHTML = tf.html;
  box.classList.remove('fresh');
  void box.offsetWidth;
  box.classList.add('fresh');

  $('#tafsirName').textContent = en() ? `${tf.edition.en} · ${tf.edition.ar}` : tf.edition.ar;
  $('#tafsirAuthor').textContent = (en() ? tf.edition.authorEn : tf.edition.authorAr) || tf.edition.authorAr || tf.edition.en || '';
  $('#srcTafsir').textContent = t('tf.via', { edition: en() ? tf.edition.en : tf.edition.ar, provider: en() ? tf.provider.en : tf.provider.ar });
}

function renderTafsirFailure(message) {
  $('#loading').hidden = true;
  $('#tafsir').hidden = true;
  $('#failed').hidden = false;
  $('#failedText').textContent = message || t('tf.failed');
}

function renderTranslation(tr) {
  const block = $('#trBlock');
  if (!tr) { block.hidden = true; return; }
  block.hidden = false;
  $('#trName').textContent = (en() ? tr.nameEn : tr.nameAr) || tr.nameEn;
  $('#trText').innerHTML = tr.html;
}

function renderAttribution(ayah) {
  $('#srcText').textContent = `${en() ? ayah.source.en : ayah.source.ar} — ${ayah.source.scriptAr}`;
  $('#srcVerify').textContent = ayah.verified
    ? t('tf.matched', { verifier: ayah.verification.verifier, how: reasonText(ayah.verification.reason) })
    : t('tf.notMatched');

  const links = [];
  if (ayah.source.url) {
    links.push(linkBtn(t('tf.linkAyah'), ayah.source.url));
  }
  if (data && data.tafsir && data.tafsir.provider && data.tafsir.provider.url) {
    links.push(linkBtn(t('tf.linkTafsir'), data.tafsir.provider.url));
  }
  $('#links').replaceChildren(...links);
}

function reasonText(reason) {
  if (reason === 'exact-skeleton-match') return t('tf.exact');
  if (reason === 'match-after-basmala-prefix') return t('tf.basmala');
  return reason;
}

function linkBtn(label, url) {
  const b = el('button', {
    class: 'link-btn',
    onclick: () => window.widgets.openExternal(url),
    title: url,
  }, icon('link'), label);
  return b;
}

function renderPicker(editions) {
  const sel = $('#picker');
  sel.replaceChildren(...editions.map((e) =>
    el('option', { value: e.slug, selected: e.slug === editionSlug }, en() ? `${e.en} · ${e.ar}` : e.ar)
  ));
}

/* ---------- loading ---------- */

async function load(nextKey, slug) {
  key = nextKey || key;
  if (!key) return;

  $('#loading').hidden = false;
  $('#failed').hidden = true;
  $('#tafsir').hidden = true;

  try {
    data = slug
      ? await window.widgets.quran.detailWith({
          key,
          tafsir: slug,
          showTranslation: settings.showTranslation,
          translation: settings.translation,
        })
      : await window.widgets.quran.detail(key);

    editionSlug = (data.tafsir && data.tafsir.edition.slug) || slug || settings.tafsir;

    renderAyah(data.ayah);
    renderWhy(data.pick);
    renderPicker(data.editions || []);

    if (data.tafsir) renderTafsir(data.tafsir);
    else {
      const e = (data.errors || []).find((x) => x.part === 'tafsir');
      renderTafsirFailure(
        e && e.code === 'NO_TAFSIR' ? t('tf.noText') : t('tf.failed')
      );
    }

    renderTranslation(data.translation);
    renderAttribution(data.ayah);
  } catch (err) {
    renderTafsirFailure(t('tf.noAyah'));
  }
}

/* ---------- copy ---------- */

async function copyAll() {
  if (!data) return;
  const a = data.ayah;
  const lines = [
    a.text,
    `[${a.surahNameAr}: ${a.ayah}]`,
    `المصدر: ${a.source.ar} — ${a.source.scriptAr}`,
  ];
  if (data.tafsir) {
    lines.push('', `${data.tafsir.edition.ar} (${data.tafsir.edition.authorAr || ''}):`,
      data.tafsir.text, `عبر: ${data.tafsir.provider.ar}`);
  }
  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    const b = $('#copyBtn');
    b.classList.add('copied');
    b.title = t('tf.copied');
    setTimeout(() => { b.classList.remove('copied'); b.title = t('tf.copy'); }, 1400);
  } catch { /* clipboard unavailable */ }
}

/* ---------- wiring ---------- */

function wire() {
  $('#headIcon').append(icon('book'));
  $('#copyBtn').append(icon('copy'));
  $('#closeBtn').append(icon('close'));
  $('#verifiedIcon').append(icon('shield'));
  $('#whyIcon').append(icon('info'));

  $('#closeBtn').addEventListener('click', () => closeWindow({ hideOnly: true }));
  $('#copyBtn').addEventListener('click', copyAll);
  $('#retryBtn').addEventListener('click', () => load(key, editionSlug));
  $('#picker').addEventListener('change', (e) => load(key, e.target.value));

  window.widgets.quran.onLoadKey((k) => load(k, null));

}

boot(async (s) => {
  settings = s;
  editionSlug = s.tafsir;
  wire();
  await load(key, null);
});
