'use strict';
/**
 * The published sources the app is allowed to read from.
 *
 * Nothing in this app writes, edits, shortens or paraphrases Quranic text or
 * tafsir. Each record below names who published the text, so the UI can always
 * show the user exactly where a word came from.
 */

// Primary text source. Quran.com serves the Uthmani text of the
// King Fahd Glorious Quran Printing Complex / Tanzil project, one ayah per
// record with no Basmala prefixing, which is what we render verbatim.
const TEXT_PRIMARY = {
  id: 'quran.com',
  ar: 'موقع القرآن الكريم Quran.com',
  en: 'Quran.com',
  scriptAr: 'الرسم العثماني (مجمع الملك فهد / مشروع تنزيل)',
  scriptEn: 'Uthmani script (King Fahd Complex / Tanzil)',
  home: 'https://quran.com',
  api: 'https://api.quran.com/api/v4',
};

// Independent second opinion, used only to verify - never to display.
// AlQuran Cloud serves the Tanzil Uthmani text.
const TEXT_VERIFIER = {
  id: 'alquran.cloud',
  ar: 'AlQuran Cloud (نص تنزيل العثماني)',
  en: 'AlQuran Cloud (Tanzil Uthmani)',
  home: 'https://alquran.cloud',
  api: 'https://api.alquran.cloud/v1',
};

/**
 * Tafsir editions. `id` is the Quran.com resource id; `cloudId` is the
 * AlQuran Cloud edition identifier for the same work where one exists, which
 * lets the app fall back without changing which book the user is reading.
 */
const TAFSIR_EDITIONS = [
  {
    id: 16,
    cloudId: 'ar.muyassar',
    slug: 'muyassar',
    ar: 'التفسير الميسر',
    en: 'Tafsir al-Muyassar',
    authorAr: 'نخبة من العلماء - مجمع الملك فهد لطباعة المصحف الشريف',
    authorEn: 'King Fahd Glorious Quran Printing Complex',
    noteAr: 'تفسير مختصر وواضح، وهو الخيار الافتراضي.',
    default: true,
  },
  {
    id: 14,
    cloudId: null,
    slug: 'ibn-kathir',
    ar: 'تفسير ابن كثير',
    en: 'Tafsir Ibn Kathir',
    authorAr: 'الحافظ ابن كثير الدمشقي (ت 774 هـ)',
    authorEn: 'Ibn Kathir (d. 774 AH)',
    noteAr: 'تفسير بالمأثور، مطوَّل.',
  },
  {
    id: 91,
    cloudId: null,
    slug: 'saadi',
    ar: 'تيسير الكريم الرحمن (السعدي)',
    en: "Tafsir al-Sa'di",
    authorAr: 'الشيخ عبد الرحمن بن ناصر السعدي (ت 1376 هـ)',
    authorEn: "Abd al-Rahman al-Sa'di (d. 1376 AH)",
    noteAr: 'تفسير معاصر سلس يركز على المعاني والهدايات.',
  },
  {
    id: 15,
    cloudId: null,
    slug: 'tabari',
    ar: 'تفسير الطبري (جامع البيان)',
    en: 'Tafsir al-Tabari',
    authorAr: 'الإمام محمد بن جرير الطبري (ت 310 هـ)',
    authorEn: 'Ibn Jarir al-Tabari (d. 310 AH)',
    noteAr: 'أقدم التفاسير الجامعة بالمأثور.',
  },
  {
    id: 90,
    cloudId: 'ar.qurtubi',
    slug: 'qurtubi',
    ar: 'تفسير القرطبي (الجامع لأحكام القرآن)',
    en: 'Tafsir al-Qurtubi',
    authorAr: 'الإمام أبو عبد الله القرطبي (ت 671 هـ)',
    authorEn: 'Al-Qurtubi (d. 671 AH)',
    noteAr: 'يعنى بالأحكام الفقهية واللغة.',
  },
  {
    id: 94,
    cloudId: 'ar.baghawi',
    slug: 'baghawi',
    ar: 'تفسير البغوي (معالم التنزيل)',
    en: 'Tafsir al-Baghawi',
    authorAr: 'الإمام الحسين بن مسعود البغوي (ت 516 هـ)',
    authorEn: 'Al-Baghawi (d. 516 AH)',
    noteAr: 'مختصر من تفاسير السلف.',
  },
  {
    id: 93,
    cloudId: 'ar.waseet',
    slug: 'waseet',
    ar: 'التفسير الوسيط',
    en: 'Al-Tafsir al-Wasit',
    authorAr: 'الدكتور محمد سيد طنطاوي',
    authorEn: 'Muhammad Sayyid Tantawi',
    noteAr: 'تفسير معاصر متوسط الطول.',
  },
  {
    id: null,
    cloudId: 'ar.jalalayn',
    slug: 'jalalayn',
    ar: 'تفسير الجلالين',
    en: 'Tafsir al-Jalalayn',
    authorAr: 'جلال الدين المحلي وجلال الدين السيوطي',
    authorEn: 'Al-Mahalli & Al-Suyuti',
    noteAr: 'تفسير وجيز جدًا، كلمة بكلمة.',
  },
];

/** Optional English meaning, shown only if the user turns it on. */
const TRANSLATIONS = [
  { id: 20, slug: 'sahih', ar: 'صحيح انترناشونال (إنجليزي)', en: 'Saheeh International' },
  { id: 131, slug: 'clear-quran', ar: 'د. مصطفى خطاب (إنجليزي)', en: 'Dr. Mustafa Khattab' },
];

const DEFAULT_TAFSIR = 'muyassar';

function tafsirBySlug(slug) {
  return TAFSIR_EDITIONS.find((t) => t.slug === slug) || TAFSIR_EDITIONS.find((t) => t.default);
}

function translationBySlug(slug) {
  return TRANSLATIONS.find((t) => t.slug === slug) || TRANSLATIONS[0];
}

module.exports = {
  TEXT_PRIMARY,
  TEXT_VERIFIER,
  TAFSIR_EDITIONS,
  TRANSLATIONS,
  DEFAULT_TAFSIR,
  tafsirBySlug,
  translationBySlug,
};
