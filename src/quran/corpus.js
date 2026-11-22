'use strict';
/**
 * Curated corpus of ayah REFERENCES.
 *
 * This file deliberately contains no Quranic text and no tafsir text - only
 * pointers (surah:ayah) plus machine-readable tags. Every word that is ever
 * shown to the user is fetched at runtime from the published sources listed
 * in sources.js and rendered verbatim, byte for byte.
 *
 * `themes`  drive the context-aware weighting in selector.js.
 * `weight`  nudges how often an ayah may come up (1 = normal, 2 = favoured).
 *
 * Every reference here is checked against BOTH sources by
 * `npm run verify:corpus`, which fails on any key that does not resolve.
 */

const THEMES = {
  tawhid:   { ar: 'توحيد وعظمة الله',  en: 'Oneness & Majesty' },
  rahma:    { ar: 'رحمة ومغفرة',       en: 'Mercy & Forgiveness' },
  sabr:     { ar: 'صبر وابتلاء',        en: 'Patience & Trial' },
  tawakkul: { ar: 'توكل ويقين',         en: 'Trust in God' },
  rizq:     { ar: 'رزق وسعة',           en: 'Provision' },
  dhikr:    { ar: 'ذكر وطمأنينة',       en: 'Remembrance & Calm' },
  dua:      { ar: 'دعاء',               en: 'Supplication' },
  ilm:      { ar: 'علم وتدبر',          en: 'Knowledge & Reflection' },
  akhlaq:   { ar: 'أخلاق ومعاملة',      en: 'Character & Conduct' },
  taqwa:    { ar: 'تقوى واستقامة',      en: 'God-consciousness' },
  shukr:    { ar: 'شكر ونعم',           en: 'Gratitude' },
  amal:     { ar: 'عمل وإتقان',         en: 'Work & Excellence' },
  akhirah:  { ar: 'آخرة ومآل',          en: 'The Hereafter' },
  ukhuwa:   { ar: 'أخوة وإصلاح',        en: 'Brotherhood' },
  salah:    { ar: 'صلاة وخشوع',         en: 'Prayer & Humility' },
  kawn:     { ar: 'آيات كونية',         en: 'Signs in Creation' },
  hikma:    { ar: 'حكمة وموعظة',        en: 'Wisdom' },
  walidayn: { ar: 'بر الوالدين',         en: 'Parents' },
  jumua:    { ar: 'الجمعة',             en: 'Friday' },
  ramadan:  { ar: 'رمضان والصيام',      en: 'Ramadan & Fasting' },
};

const AYAT = [
  // -- Oneness & Majesty ------------------------------------------------
  { key: '2:255',  themes: ['tawhid', 'dhikr'], weight: 2 },
  { key: '112:1',  themes: ['tawhid'] },
  { key: '59:22',  themes: ['tawhid'] },
  { key: '59:23',  themes: ['tawhid'] },
  { key: '59:24',  themes: ['tawhid'] },
  { key: '24:35',  themes: ['tawhid', 'kawn'] },
  { key: '57:3',   themes: ['tawhid'] },
  { key: '6:59',   themes: ['tawhid', 'ilm'] },
  { key: '67:1',   themes: ['tawhid'] },
  { key: '42:11',  themes: ['tawhid'] },
  { key: '20:8',   themes: ['tawhid', 'dua'] },
  { key: '3:26',   themes: ['tawhid', 'dua'] },
  { key: '28:88',  themes: ['tawhid', 'akhirah'] },
  { key: '55:26',  themes: ['tawhid', 'akhirah'] },

  // -- Mercy, Forgiveness, Repentance -----------------------------------
  { key: '39:53',  themes: ['rahma'], weight: 2 },
  { key: '7:156',  themes: ['rahma'] },
  { key: '6:54',   themes: ['rahma'] },
  { key: '4:110',  themes: ['rahma'] },
  { key: '42:25',  themes: ['rahma'] },
  { key: '71:10',  themes: ['rahma', 'rizq'] },
  { key: '2:222',  themes: ['rahma'] },
  { key: '3:135',  themes: ['rahma', 'taqwa'] },
  { key: '66:8',   themes: ['rahma'] },
  { key: '20:82',  themes: ['rahma'] },
  { key: '39:54',  themes: ['rahma'] },

  // -- Patience & Trial --------------------------------------------------
  { key: '2:153',  themes: ['sabr', 'salah'], weight: 2 },
  { key: '2:155',  themes: ['sabr'] },
  { key: '2:156',  themes: ['sabr'] },
  { key: '2:286',  themes: ['sabr', 'dua'], weight: 2 },
  { key: '94:5',   themes: ['sabr'], weight: 2 },
  { key: '94:6',   themes: ['sabr'] },
  { key: '39:10',  themes: ['sabr'] },
  { key: '3:200',  themes: ['sabr', 'taqwa'] },
  { key: '12:87',  themes: ['sabr', 'tawakkul'] },
  { key: '21:87',  themes: ['sabr', 'dua'] },
  { key: '8:46',   themes: ['sabr', 'ukhuwa'] },
  { key: '16:127', themes: ['sabr'] },
  { key: '29:2',   themes: ['sabr'] },
  { key: '2:214',  themes: ['sabr'] },
  { key: '3:186',  themes: ['sabr'] },
  { key: '2:216',  themes: ['sabr', 'hikma'] },
  { key: '12:18',  themes: ['sabr'] },

  // -- Trust in God ------------------------------------------------------
  { key: '3:159',  themes: ['tawakkul', 'akhlaq'], weight: 2 },
  { key: '65:3',   themes: ['tawakkul', 'rizq'], weight: 2 },
  { key: '9:51',   themes: ['tawakkul'] },
  { key: '11:88',  themes: ['tawakkul', 'amal'] },
  { key: '3:173',  themes: ['tawakkul'] },
  { key: '14:12',  themes: ['tawakkul', 'sabr'] },
  { key: '9:40',   themes: ['tawakkul'] },
  { key: '8:62',   themes: ['tawakkul'] },
  { key: '33:3',   themes: ['tawakkul'] },
  { key: '40:44',  themes: ['tawakkul', 'hikma'] },
  { key: '65:2',   themes: ['taqwa', 'tawakkul'], weight: 2 },

  // -- Provision ---------------------------------------------------------
  { key: '51:22',  themes: ['rizq', 'kawn'] },
  { key: '29:60',  themes: ['rizq', 'tawakkul'] },
  { key: '11:6',   themes: ['rizq'] },
  { key: '62:10',  themes: ['rizq', 'amal'] },
  { key: '67:15',  themes: ['rizq', 'amal'] },
  { key: '2:172',  themes: ['rizq', 'shukr'] },
  { key: '42:19',  themes: ['rizq', 'rahma'] },

  // -- Remembrance & Calm ------------------------------------------------
  { key: '13:28',  themes: ['dhikr'], weight: 2 },
  { key: '2:152',  themes: ['dhikr', 'shukr'], weight: 2 },
  { key: '33:41',  themes: ['dhikr'] },
  { key: '63:9',   themes: ['dhikr', 'akhirah'] },
  { key: '3:191',  themes: ['dhikr', 'kawn'] },
  { key: '7:205',  themes: ['dhikr'] },
  { key: '29:45',  themes: ['dhikr', 'salah'] },
  { key: '18:24',  themes: ['dhikr'] },

  // -- Supplication ------------------------------------------------------
  { key: '2:186',  themes: ['dua', 'rahma'], weight: 2 },
  { key: '40:60',  themes: ['dua'] },
  { key: '7:55',   themes: ['dua'] },
  { key: '3:8',    themes: ['dua'] },
  { key: '25:74',  themes: ['dua'] },
  { key: '14:40',  themes: ['dua', 'salah'] },
  { key: '20:114', themes: ['dua', 'ilm'], weight: 2 },
  { key: '17:80',  themes: ['dua'] },
  { key: '2:201',  themes: ['dua'] },
  { key: '3:147',  themes: ['dua', 'sabr'] },
  { key: '28:24',  themes: ['dua', 'rizq'] },
  { key: '23:118', themes: ['dua', 'rahma'] },
  { key: '46:15',  themes: ['dua', 'walidayn', 'shukr'] },
  { key: '27:19',  themes: ['dua', 'shukr'] },
  { key: '20:25',  themes: ['dua'] },
  { key: '18:10',  themes: ['dua', 'sabr'] },

  // -- Knowledge & Reflection --------------------------------------------
  { key: '39:9',   themes: ['ilm'] },
  { key: '58:11',  themes: ['ilm'] },
  { key: '35:28',  themes: ['ilm', 'taqwa'] },
  { key: '47:24',  themes: ['ilm'] },
  { key: '38:29',  themes: ['ilm'] },
  { key: '17:36',  themes: ['ilm', 'akhlaq'] },
  { key: '16:43',  themes: ['ilm'] },
  { key: '2:269',  themes: ['ilm', 'hikma'] },

  // -- Character & Conduct -----------------------------------------------
  { key: '16:90',  themes: ['akhlaq'], weight: 2 },
  { key: '41:34',  themes: ['akhlaq'], weight: 2 },
  { key: '3:134',  themes: ['akhlaq'] },
  { key: '49:12',  themes: ['akhlaq'] },
  { key: '49:11',  themes: ['akhlaq'] },
  { key: '49:13',  themes: ['akhlaq', 'taqwa'] },
  { key: '17:53',  themes: ['akhlaq'] },
  { key: '31:18',  themes: ['akhlaq'] },
  { key: '31:19',  themes: ['akhlaq'] },
  { key: '25:63',  themes: ['akhlaq'] },
  { key: '24:22',  themes: ['akhlaq', 'rahma'] },
  { key: '42:43',  themes: ['akhlaq', 'sabr'] },
  { key: '4:58',   themes: ['akhlaq', 'amal'] },
  { key: '2:263',  themes: ['akhlaq'] },
  { key: '33:70',  themes: ['akhlaq'] },
  { key: '2:83',   themes: ['akhlaq', 'walidayn'] },

  // -- God-consciousness -------------------------------------------------
  { key: '3:102',  themes: ['taqwa'] },
  { key: '64:16',  themes: ['taqwa'] },
  { key: '2:197',  themes: ['taqwa'] },
  { key: '7:26',   themes: ['taqwa'] },
  { key: '8:29',   themes: ['taqwa'] },
  { key: '41:30',  themes: ['taqwa', 'tawakkul'] },

  // -- Gratitude ---------------------------------------------------------
  { key: '14:7',   themes: ['shukr'], weight: 2 },
  { key: '16:18',  themes: ['shukr'] },
  { key: '31:12',  themes: ['shukr', 'hikma'] },
  { key: '27:40',  themes: ['shukr'] },
  { key: '55:13',  themes: ['shukr', 'kawn'] },

  // -- Work & Excellence -------------------------------------------------
  { key: '9:105',  themes: ['amal'], weight: 2 },
  { key: '18:30',  themes: ['amal'] },
  { key: '67:2',   themes: ['amal', 'akhirah'] },
  { key: '99:7',   themes: ['amal', 'akhirah'] },
  { key: '53:39',  themes: ['amal'] },
  { key: '16:97',  themes: ['amal'], weight: 2 },
  { key: '28:77',  themes: ['amal', 'akhirah'] },

  // -- The Hereafter -----------------------------------------------------
  { key: '3:185',  themes: ['akhirah'] },
  { key: '57:20',  themes: ['akhirah'] },
  { key: '18:46',  themes: ['akhirah'] },
  { key: '29:64',  themes: ['akhirah'] },
  { key: '87:16',  themes: ['akhirah'] },
  { key: '102:1',  themes: ['akhirah'] },
  { key: '23:115', themes: ['akhirah'] },
  { key: '21:35',  themes: ['akhirah', 'sabr'] },
  { key: '31:33',  themes: ['akhirah'] },

  // -- Parents -----------------------------------------------------------
  { key: '17:23',  themes: ['walidayn'], weight: 2 },
  { key: '17:24',  themes: ['walidayn'] },
  { key: '31:14',  themes: ['walidayn', 'shukr'] },

  // -- Brotherhood -------------------------------------------------------
  { key: '49:10',  themes: ['ukhuwa'] },
  { key: '3:103',  themes: ['ukhuwa'] },
  { key: '5:2',    themes: ['ukhuwa', 'taqwa'] },
  { key: '59:9',   themes: ['ukhuwa'] },
  { key: '48:29',  themes: ['ukhuwa'] },

  // -- Prayer & Humility -------------------------------------------------
  { key: '23:1',   themes: ['salah'] },
  { key: '2:45',   themes: ['salah', 'sabr'] },
  { key: '20:14',  themes: ['salah', 'dhikr'] },
  { key: '17:79',  themes: ['salah'] },
  { key: '51:17',  themes: ['salah'] },
  { key: '32:16',  themes: ['salah'] },
  { key: '87:14',  themes: ['salah', 'taqwa'] },

  // -- Signs in Creation -------------------------------------------------
  { key: '3:190',  themes: ['kawn', 'ilm'], weight: 2 },
  { key: '2:164',  themes: ['kawn', 'ilm'] },
  { key: '51:20',  themes: ['kawn'] },
  { key: '51:21',  themes: ['kawn', 'ilm'] },
  { key: '30:22',  themes: ['kawn'] },
  { key: '30:21',  themes: ['kawn', 'rahma'] },
  { key: '41:53',  themes: ['kawn', 'ilm'] },
  { key: '21:30',  themes: ['kawn'] },
  { key: '67:3',   themes: ['kawn'] },
  { key: '88:17',  themes: ['kawn'] },
  { key: '13:2',   themes: ['kawn', 'tawhid'] },

  // -- Wisdom ------------------------------------------------------------
  { key: '4:19',   themes: ['hikma', 'sabr'] },
  { key: '24:11',  themes: ['hikma', 'sabr'] },
  { key: '93:3',   themes: ['hikma', 'rahma'] },
  { key: '94:1',   themes: ['hikma'] },
  { key: '93:5',   themes: ['hikma', 'rahma'] },

  // -- Friday ------------------------------------------------------------
  { key: '62:9',   themes: ['jumua', 'salah'] },
  { key: '33:56',  themes: ['jumua', 'dhikr'] },
  { key: '18:1',   themes: ['jumua'] },
  { key: '18:107', themes: ['jumua', 'akhirah'] },

  // -- Ramadan & Fasting -------------------------------------------------
  { key: '2:183',  themes: ['ramadan', 'taqwa'] },
  { key: '2:185',  themes: ['ramadan'] },
  { key: '97:1',   themes: ['ramadan'] },
  { key: '97:3',   themes: ['ramadan'] },
];

// The extended set lives in its own file. Merge it in, folding any reference
// that appears in both into one entry with the themes of each.
const { EXTENDED } = require('./corpus-extended');
const byKey = new Map(AYAT.map((a) => [a.key, a]));
for (const e of EXTENDED) {
  const have = byKey.get(e.key);
  if (have) have.themes = [...new Set([...have.themes, ...e.themes])];
  else { const entry = { ...e }; AYAT.push(entry); byKey.set(e.key, entry); }
}

module.exports = { THEMES, AYAT };
