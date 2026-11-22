'use strict';
/*
 * Hadith window.
 *
 * Every word from the source - the hadith, its grade, the explanation, the
 * lessons, the word meanings and the references - is inserted with
 * textContent, exactly as HadeethEnc published it. Only the labels around
 * them are the app's own, and they are translated with the interface.
 */

const { $, el, icon, boot, closeWindow, t, strings, lang, digits } = window.UI;

strings({
  ar: {
    'hd.title': 'حديث وشرح',
    'hd.copy': 'نسخ الحديث وشرحه',
    'hd.copied': 'تم النسخ',
    'hd.loading': 'جارٍ جلب الحديث…',
    'hd.retry': 'إعادة المحاولة',
    'hd.failed': 'تعذّر جلب الحديث. تأكد من الاتصال بالإنترنت.',
    'hd.place': 'حديث شريف · {attr}',
    'hd.grade': 'الدرجة: {grade}',
    'hd.verified': 'طوبق مع {book} ({n})',
    'hd.why': 'لماذا ظهر هذا الحديث الآن',
    'hd.whyNote': 'هذا وصف آليّ لطريقة اختيار التطبيق للحديث، وليس جزءًا من الشرح.',
    'hd.sharh': 'الشرح',
    'hd.sharhBy': 'من موسوعة الأحاديث النبوية المترجمة (HadeethEnc)',
    'hd.hints': 'من فوائد الحديث',
    'hd.words': 'معاني الكلمات',
    'hd.enHead': 'Translation',
    'hd.enExplanation': 'Explanation',
    'hd.kSource': 'المصدر',
    'hd.kVerify': 'التحقق',
    'hd.kRefs': 'المراجع',
    'hd.verifyText': 'وُجد نصّه في {book} برقم {n} في نسخة مستقلة من كتب السنة{grade}',
    'hd.gradeBy': '، وحكم عليه: {grade}',
    'hd.linkSource': 'الحديث في الموسوعة',
    'hd.linkBook': 'في {book} على Sunnah.com',
    'hd.note': 'يُعرض الحديث وشرحه ومراجعه كما نشرتها الموسوعة، دون أي تعديل أو اختصار.',
  },
  en: {
    'hd.title': 'Hadith & explanation',
    'hd.copy': 'Copy the hadith and its explanation',
    'hd.copied': 'Copied',
    'hd.loading': 'Fetching the hadith…',
    'hd.retry': 'Try again',
    'hd.failed': 'Could not fetch the hadith. Check your internet connection.',
    'hd.place': 'Hadith · {attr}',
    'hd.grade': 'Grade: {grade}',
    'hd.verified': 'Matched in {book} ({n})',
    'hd.why': 'Why this hadith now',
    'hd.whyNote': 'This describes how the app chose the hadith. It is not part of the explanation.',
    'hd.sharh': 'Explanation (Arabic)',
    'hd.sharhBy': 'From the Encyclopedia of Translated Prophetic Hadiths (HadeethEnc)',
    'hd.hints': 'Lessons from the hadith (Arabic)',
    'hd.words': 'Word meanings (Arabic)',
    'hd.enHead': 'English translation — as published by HadeethEnc',
    'hd.enExplanation': 'Explanation — as published by HadeethEnc',
    'hd.kSource': 'Source',
    'hd.kVerify': 'Verified',
    'hd.kRefs': 'References',
    'hd.verifyText': 'Its wording was found in {book}, number {n}, in an independent copy of the hadith collections{grade}',
    'hd.gradeBy': '; graded: {grade}',
    'hd.linkSource': 'Hadith on HadeethEnc',
    'hd.linkBook': 'In {book} on Sunnah.com',
    'hd.note': 'The hadith, its explanation and references are shown exactly as the encyclopedia published them, unedited and unabridged.',
  },
});

const BOOKS = {
  bukhari: { ar: 'صحيح البخاري', en: 'Sahih al-Bukhari' },
  muslim: { ar: 'صحيح مسلم', en: 'Sahih Muslim' },
  abudawud: { ar: 'سنن أبي داود', en: 'Sunan Abi Dawud' },
  tirmidhi: { ar: 'جامع الترمذي', en: 'Jami at-Tirmidhi' },
  nasai: { ar: 'سنن النسائي', en: 'Sunan an-Nasai' },
  ibnmajah: { ar: 'سنن ابن ماجه', en: 'Sunan Ibn Majah' },
};

let id = new URLSearchParams(location.search).get('id');
let data = null;

const en = () => lang() === 'en';
const bookName = (b) => (BOOKS[b] ? (en() ? BOOKS[b].en : BOOKS[b].ar) : b);

function linkBtn(label, url) {
  return el('button', { class: 'link-btn', title: url, onclick: () => window.widgets.openExternal(url) }, icon('link'), label);
}

function render() {
  const h = data.hadith;
  const v = h.verification || {};
  $('#loading').hidden = true;
  $('#failed').hidden = true;
  $('#content').hidden = false;

  const attr = en() ? bookName(v.book) : (h.attribution || bookName(v.book));
  $('#place').textContent = t('hd.place', { attr });
  $('#sub').textContent = h.title || '';

  // The hadith itself, verbatim.
  const text = $('#text');
  text.textContent = h.text;
  text.classList.remove('fresh');
  void text.offsetWidth;
  text.classList.add('fresh');

  $('#grade').textContent = t('hd.grade', { grade: h.grade });
  $('#verified').hidden = !h.verified;
  $('#verifiedText').textContent = t('hd.verified', { book: bookName(v.book), n: digits(v.n) });

  const reasons = (data.pick && (en() ? data.pick.rationaleEn : data.pick.rationale)) || [];
  $('#whyBlock').hidden = reasons.length === 0;
  $('#whyList').replaceChildren(...reasons.map((r) => el('li', { text: r })));

  $('#explanation').textContent = h.explanation || '';

  $('#hintsBlock').hidden = !(h.hints && h.hints.length);
  $('#hints').replaceChildren(...(h.hints || []).map((x) => el('li', { text: x })));

  const words = (h.words || []).filter((w) => w && (w.word || w.meaning));
  $('#wordsBlock').hidden = words.length === 0;
  $('#words').replaceChildren(...words.flatMap((w) => [el('dt', { text: w.word || '' }), el('dd', { text: w.meaning || '' })]));

  const english = data.english;
  $('#enBlock').hidden = !(en() && english && english.text);
  if (english) {
    $('#enText').textContent = english.text || '';
    $('#enExplanation').textContent = english.explanation || '';
  }

  $('#srcText').textContent = en() ? h.source.en : h.source.ar;
  const grade = v.collectionGrade ? t('hd.gradeBy', { grade: v.collectionGrade }) : '';
  $('#srcVerify').textContent = t('hd.verifyText', { book: bookName(v.book), n: digits(v.n), grade });
  $('#srcRefs').textContent = h.reference || '—';

  const links = [linkBtn(t('hd.linkSource'), en() && english ? english.url : h.source.url)];
  if (v.book && v.n) links.push(linkBtn(t('hd.linkBook', { book: bookName(v.book) }), `https://sunnah.com/${v.book}:${v.n}`));
  $('#links').replaceChildren(...links);
}

async function load(nextId) {
  if (nextId) id = nextId;
  if (!id) return;
  $('#loading').hidden = false;
  $('#failed').hidden = true;
  $('#content').hidden = true;
  try {
    data = await window.widgets.hadith.detail(id);
    render();
    $('#scroll').scrollTop = 0;
  } catch {
    $('#loading').hidden = true;
    $('#failed').hidden = false;
    $('#failedText').textContent = t('hd.failed');
  }
}

async function copyAll() {
  if (!data) return;
  const h = data.hadith;
  const lines = [h.text, `[${h.attribution} — ${h.grade}]`, '', h.explanation, '', `${h.source.ar}: ${h.source.url}`];
  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    const b = $('#copyBtn');
    b.classList.add('copied');
    b.title = t('hd.copied');
    setTimeout(() => { b.classList.remove('copied'); b.title = t('hd.copy'); }, 1400);
  } catch { /* clipboard unavailable */ }
}

boot(async () => {
  $('#headIcon').append(icon('note'));
  $('#copyBtn').append(icon('copy'));
  $('#closeBtn').append(icon('close'));
  $('#verifiedIcon').append(icon('shield'));
  $('#whyIcon').append(icon('info'));
  $('#closeBtn').addEventListener('click', () => closeWindow({ hideOnly: true }));
  $('#copyBtn').addEventListener('click', copyAll);
  $('#retryBtn').addEventListener('click', () => load());
  window.widgets.hadith.onLoad((next) => load(next));
  await load();
});
