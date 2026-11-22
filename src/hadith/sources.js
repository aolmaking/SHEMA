'use strict';
/**
 * Where hadith come from, and how they are cross-checked.
 *
 * Text, grade, explanation and references come from HadeethEnc, the
 * Encyclopedia of Translated Prophetic Hadiths, a reviewed scholarly project.
 * Each hadith is then checked against an independent copy of the collection
 * it cites (Bukhari, Muslim and the four Sunan, from the open Hadith-API
 * dataset), at the hadith number HadeethEnc gives.
 */

const ENCYCLOPEDIA = {
  id: 'hadeethenc',
  ar: 'موسوعة الأحاديث النبوية المترجمة (HadeethEnc)',
  en: 'Encyclopedia of Translated Prophetic Hadiths (HadeethEnc)',
  api: 'https://hadeethenc.com/api/v1',
  home: 'https://hadeethenc.com',
  page: (id, lang = 'ar') => `https://hadeethenc.com/${lang}/browse/hadith/${id}`,
};

const COLLECTIONS = {
  id: 'hadith-api',
  ar: 'نسخة مستقلة من كتب السنة (Hadith API)',
  en: 'Independent copy of the hadith collections (Hadith API)',
  api: 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions',
};

/**
 * Collections a hadith can be verified against. `match` finds the book in a
 * HadeethEnc reference line; `byArabicNumber` marks books whose standard
 * number differs from the dataset's own running number (Muslim).
 */
const BOOKS = [
  { id: 'bukhari', edition: 'ara-bukhari', ar: 'صحيح البخاري', en: 'Sahih al-Bukhari', sahih: true, match: /صحيح البخاري/ },
  { id: 'muslim', edition: 'ara-muslim', ar: 'صحيح مسلم', en: 'Sahih Muslim', sahih: true, match: /صحيح مسلم/, byArabicNumber: true },
  { id: 'abudawud', edition: 'ara-abudawud', ar: 'سنن أبي داود', en: 'Sunan Abi Dawud', match: /سنن أبي داود/ },
  { id: 'tirmidhi', edition: 'ara-tirmidhi', ar: 'جامع الترمذي', en: "Jami' at-Tirmidhi", match: /(?:سنن|جامع) الترمذي/ },
  { id: 'nasai', edition: 'ara-nasai', ar: 'سنن النسائي', en: "Sunan an-Nasa'i", match: /سنن النسائي(?!\s*الكبرى)/ },
  { id: 'ibnmajah', edition: 'ara-ibnmajah', ar: 'سنن ابن ماجه', en: 'Sunan Ibn Majah', match: /سنن ابن ماجه/ },
];

/** sunnah.com uses the same standard numbers, so each check can be opened there too. */
const sunnahLink = (book, n) => `https://sunnah.com/${book}:${n}`;

/**
 * HadeethEnc categories suited to a daily reminder, with the theme each feeds.
 * Detailed rulings (purification, transactions, ...) are left out on purpose.
 */
const CATEGORIES = [
  { id: 282, theme: 'akhlaq' },   // الأخلاق الحميدة
  { id: 283, theme: 'akhlaq' },   // الأخلاق الذميمة
  { id: 287, theme: 'speech' },   // آداب الكلام والصمت
  { id: 286, theme: 'adab' },     // آداب السلام والاستئذان
  { id: 278, theme: 'dhikr' },    // فضائل الذكر
  { id: 300, theme: 'dhikr' },    // فوائد ذكر الله
  { id: 302, theme: 'dhikr' },    // الأذكار المطلقة
  { id: 301, theme: 'adhkar' },   // أذكار الصباح والمساء
  { id: 313, theme: 'dua' },      // الأدعية المأثورة
  { id: 311, theme: 'dua' },      // آداب الدعاء
  { id: 312, theme: 'dua' },      // أسباب إجابة الدعاء
  { id: 314, theme: 'heart' },    // أعمال القلوب
  { id: 280, theme: 'heart' },    // فضائل أعمال القلوب
  { id: 322, theme: 'heart' },    // تزكية النفوس
  { id: 316, theme: 'zuhd' },     // الزهد والورع
  { id: 319, theme: 'zuhd' },     // ذم حب الدنيا
  { id: 321, theme: 'tawba' },    // التوبة
  { id: 277, theme: 'deeds' },    // فضائل الأعمال الصالحة
  { id: 281, theme: 'deeds' },    // فضائل أعمال الجوارح
  { id: 273, theme: 'parents' },  // بر الوالدين
  { id: 270, theme: 'knowledge' },// فضل العلم
  { id: 272, theme: 'quran' },    // فضائل القرآن
  { id: 271, theme: 'tawhid' },   // فضائل التوحيد
  { id: 85, theme: 'akhira' },    // الحياة الآخرة
  { id: 324, theme: 'akhira' },   // صفات الجنة والنار
  { id: 86, theme: 'qadar' },     // مراتب القضاء والقدر
  { id: 457, theme: 'salah' },    // فضل الصلاة
  { id: 293, theme: 'sleep' },    // آداب النوم والاستيقاظ
  { id: 477, theme: 'jumua' },    // فضل يوم الجمعة
  { id: 513, theme: 'siyam' },    // فضل الصيام
  { id: 526, theme: 'ramadan' },  // العشر الأواخر من رمضان
];

const THEMES = {
  akhlaq: { ar: 'حسن الخلق', en: 'Good character' },
  speech: { ar: 'آداب الكلام', en: 'Guarding the tongue' },
  adab: { ar: 'آداب', en: 'Etiquette' },
  dhikr: { ar: 'ذكر الله', en: 'Remembrance' },
  adhkar: { ar: 'أذكار الصباح والمساء', en: 'Morning & evening remembrance' },
  dua: { ar: 'الدعاء', en: 'Supplication' },
  heart: { ar: 'أعمال القلوب', en: 'Deeds of the heart' },
  zuhd: { ar: 'الزهد', en: 'Detachment from the world' },
  tawba: { ar: 'التوبة', en: 'Repentance' },
  deeds: { ar: 'فضائل الأعمال', en: 'Virtuous deeds' },
  parents: { ar: 'بر الوالدين', en: 'Honouring parents' },
  knowledge: { ar: 'فضل العلم', en: 'Knowledge' },
  quran: { ar: 'فضائل القرآن', en: 'The Quran' },
  tawhid: { ar: 'التوحيد', en: 'Oneness of God' },
  akhira: { ar: 'الآخرة', en: 'The hereafter' },
  qadar: { ar: 'القضاء والقدر', en: 'Divine decree' },
  salah: { ar: 'فضل الصلاة', en: 'Prayer' },
  sleep: { ar: 'آداب النوم', en: 'Before sleep' },
  jumua: { ar: 'يوم الجمعة', en: 'Friday' },
  siyam: { ar: 'الصيام', en: 'Fasting' },
  ramadan: { ar: 'العشر الأواخر', en: 'The last ten nights' },
};

/** How strongly each part of the day favours a theme (1 = neutral). */
const PART_WEIGHTS = {
  dawn: { adhkar: 3, salah: 2.6, dhikr: 2.2, tawhid: 2, dua: 1.6, quran: 1.6 },
  morning: { adhkar: 2.4, knowledge: 2.2, deeds: 1.9, akhlaq: 1.6, parents: 1.5, dua: 1.3 },
  afternoon: { akhlaq: 2.4, speech: 2.2, adab: 1.8, qadar: 1.7, parents: 1.5, deeds: 1.4 },
  evening: { adhkar: 2.4, dua: 2, tawba: 1.9, heart: 1.7, dhikr: 1.7, zuhd: 1.3 },
  night: { akhira: 2.4, heart: 2, zuhd: 2, tawba: 2, sleep: 2.6, dua: 1.7 },
};

module.exports = { ENCYCLOPEDIA, COLLECTIONS, BOOKS, CATEGORIES, THEMES, PART_WEIGHTS, sunnahLink };
