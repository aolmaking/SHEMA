'use strict';
/**
 * Chooses which ayah to show for the current rotation slot.
 *
 * The goal is that the ayah on screen feels chosen rather than shuffled, so
 * the score combines:
 *   - the time of day (quiet themes at night, provision and work in the
 *     morning, patience through the afternoon),
 *   - the day of the week (Friday leans to its own themes),
 *   - the Hijri month (Ramadan brings fasting and Laylat al-Qadr forward),
 *   - how recently each ayah and each theme was shown, so the rotation keeps
 *     moving instead of circling a handful of favourites.
 *
 * The result is deterministic per slot: restarting the app inside the same
 * six-hour window shows the same ayah, and only the slot rolling over changes
 * it. The corpus holds references only - no Quranic text lives in this file.
 */

const { THEMES, AYAT } = require('./corpus');

/** Theme affinity by part of day. Anything unlisted scores a neutral 1. */
const TIME_AFFINITY = {
  dawn:      { dhikr: 3.0, tawhid: 2.6, salah: 2.6, rizq: 1.8, rahma: 1.6, kawn: 1.5 },
  morning:   { rizq: 2.8, amal: 2.6, tawakkul: 2.2, ilm: 2.0, shukr: 1.6 },
  afternoon: { sabr: 2.6, akhlaq: 2.4, amal: 2.0, ukhuwa: 2.0, hikma: 1.6 },
  evening:   { shukr: 2.6, rahma: 2.4, hikma: 2.0, walidayn: 1.8, taqwa: 1.7, dua: 1.6 },
  night:     { akhirah: 2.8, dua: 2.6, dhikr: 2.4, salah: 2.2, rahma: 2.0, tawhid: 1.8 },
};

function partOfDay(hour) {
  if (hour >= 4 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 16) return 'afternoon';
  if (hour >= 16 && hour < 20) return 'evening';
  return 'night';
}

/**
 * Theme affinities for a whole slot, blended over the hours it covers.
 *
 * A six-hour slot starting at 06:00 spans one hour of dawn and five of
 * morning, so it should lean mostly - but not only - to morning themes.
 * Reading the affinity from a single instant instead would make whole parts
 * of the day unreachable, which is why this averages across the span.
 *
 * Returns { affinity, dominant }.
 */
function blendAffinity(slotStart, hours) {
  const totals = Object.create(null);
  const partWeight = Object.create(null);
  const span = Math.max(1, Math.round(hours));
  for (let i = 0; i < span; i++) {
    const h = (slotStart.getHours() + i) % 24;
    const part = partOfDay(h);
    partWeight[part] = (partWeight[part] || 0) + 1;
    const table = TIME_AFFINITY[part] || {};
    for (const [theme, value] of Object.entries(table)) {
      totals[theme] = (totals[theme] || 0) + value;
    }
  }
  const affinity = Object.create(null);
  for (const [theme, sum] of Object.entries(totals)) affinity[theme] = sum / span;
  const dominant = Object.entries(partWeight).sort((a, b) => b[1] - a[1])[0][0];
  return { affinity, dominant };
}

const PART_LABELS = {
  dawn:      { ar: 'وقت الفجر', en: 'Dawn' },
  morning:   { ar: 'الصباح', en: 'Morning' },
  afternoon: { ar: 'بعد الظهر', en: 'Afternoon' },
  evening:   { ar: 'المساء', en: 'Evening' },
  night:     { ar: 'الليل', en: 'Night' },
};

/** Hijri date via the platform calendar; returns null if unavailable. */
function hijriDate(date) {
  try {
    const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC',
    });
    const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
    const month = Number(parts.month);
    const day = Number(parts.day);
    const year = Number(String(parts.year).replace(/\D/g, ''));
    if (!month || !day) return null;
    return { day, month, year };
  } catch {
    return null;
  }
}

const HIJRI_MONTHS_AR = [
  'مُحَرَّم', 'صَفَر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
  'رَجَب', 'شَعْبان', 'رَمَضان', 'شَوَّال', 'ذو القَعدة', 'ذو الحِجَّة',
];

/**
 * Index of the current rotation slot.
 * When the interval divides the day evenly the slots line up with the clock
 * (00:00, 06:00, 12:00, 18:00 for the default six hours); otherwise they run
 * continuously from the epoch.
 */
function slotInfo(date, intervalHours) {
  const h = Math.max(1, Math.min(24, Number(intervalHours) || 6));
  if (24 % h === 0) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const idx = Math.floor((date - startOfDay) / (h * 3600e3));
    const slotStart = new Date(startOfDay.getTime() + idx * h * 3600e3);
    const slotEnd = new Date(slotStart.getTime() + h * 3600e3);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return { id: `${y}-${m}-${d}#${idx}`, index: idx, start: slotStart, end: slotEnd, hours: h };
  }
  const idx = Math.floor(date.getTime() / (h * 3600e3));
  const slotStart = new Date(idx * h * 3600e3);
  return {
    id: `epoch#${idx}`, index: idx, start: slotStart,
    end: new Date(slotStart.getTime() + h * 3600e3), hours: h,
  };
}

/* Deterministic hash + PRNG so a slot always resolves to the same ayah. */
function hash32(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rnd() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Everything the scorer knows about "now". */
function buildContext(date, opts = {}) {
  const intervalHours = opts.intervalHours || 6;
  const slot = slotInfo(date, intervalHours);

  // Every signal is read from the START of the slot, not from the current
  // instant. Otherwise the part of day would flip partway through a slot and
  // the ayah on screen would change on its own before the slot was over.
  const ref = slot.start;
  const hour = ref.getHours();
  const { affinity, dominant: part } = blendAffinity(ref, slot.hours);
  const weekday = ref.getDay();           // 0 Sun .. 5 Fri .. 6 Sat
  const hijri = hijriDate(ref);
  const occasions = [];

  if (weekday === 5) occasions.push('jumua');
  if (hijri && hijri.month === 9) {
    occasions.push('ramadan');
    if (hijri.day >= 21 && hijri.day % 2 === 1) occasions.push('laylat-al-qadr');
  }

  return {
    at: date.getTime(),
    slot,
    hour,
    part,
    affinity,
    partLabel: PART_LABELS[part],
    weekday,
    isFriday: weekday === 5,
    hijri: hijri ? { ...hijri, monthNameAr: HIJRI_MONTHS_AR[hijri.month - 1] || '' } : null,
    occasions,
  };
}

/**
 * Score every candidate and return the ranked list.
 * `history` is newest-first: [{ key, themes, at }, ...].
 */
function rank(ctx, history = [], opts = {}) {
  const affinity = ctx.affinity || TIME_AFFINITY[ctx.part] || {};
  const salt = opts.salt || 'mirqat';
  const rnd = mulberry32(hash32(`${salt}|${ctx.slot.id}`));

  const recentKeys = new Map();
  history.forEach((h, i) => { if (!recentKeys.has(h.key)) recentKeys.set(h.key, i); });

  // How warm each theme is from recent picks, so we drift across topics.
  const themeHeat = new Map();
  history.slice(0, 8).forEach((h, i) => {
    const decay = 1 / (i + 1);
    (h.themes || []).forEach((t) => themeHeat.set(t, (themeHeat.get(t) || 0) + decay));
  });

  // Avoid repeating an ayah until most of the corpus has been seen.
  // Scales with the corpus: with ~680 ayat this is about four months of slots.
  const coolDown = Math.min(Math.floor(AYAT.length * 0.7), 480);

  const scored = AYAT.map((entry) => {
    let score = entry.weight || 1;
    const reasons = [];

    let timeBoost = 0;
    for (const t of entry.themes) timeBoost = Math.max(timeBoost, affinity[t] || 0);
    if (timeBoost > 0) {
      score *= timeBoost;
      reasons.push('time');
    }

    for (const occ of ctx.occasions) {
      const tag = occ === 'laylat-al-qadr' ? 'ramadan' : occ;
      if (entry.themes.includes(tag)) {
        score *= occ === 'laylat-al-qadr' ? 6 : 4.5;
        reasons.push(occ);
      }
    }
    // Outside their season, occasion-specific ayat step back.
    if (entry.themes.includes('ramadan') && !ctx.occasions.includes('ramadan')) score *= 0.12;
    if (entry.themes.includes('jumua') && !ctx.isFriday) score *= 0.15;

    const seenAt = recentKeys.get(entry.key);
    if (seenAt !== undefined) {
      if (seenAt < coolDown) {
        score *= 0.0015 + (seenAt / coolDown) * 0.06;
        reasons.push('recent');
      } else {
        score *= 0.75;
      }
    } else {
      score *= 1.2;   // not shown yet: a gentle nudge so the whole corpus comes round
    }

    let heat = 0;
    for (const t of entry.themes) heat = Math.max(heat, themeHeat.get(t) || 0);
    if (heat > 0) score *= 1 / (1 + heat * 1.1);

    score *= 0.75 + rnd() * 0.5;   // gentle deterministic jitter
    return { entry, score, reasons };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

/**
 * Pick the best ayah for `ctx`.
 * `isUsable(key)` lets the caller veto candidates it cannot display - for
 * example when offline and only part of the corpus is cached.
 */
function select(ctx, history = [], opts = {}) {
  const ranked = rank(ctx, history, opts);
  const isUsable = opts.isUsable || (() => true);
  const chosen = ranked.find((c) => isUsable(c.entry.key)) || ranked[0];
  if (!chosen) return null;

  const themeList = chosen.entry.themes.map((t) => ({ id: t, ...THEMES[t] }));
  return {
    key: chosen.entry.key,
    themes: chosen.entry.themes,
    themeLabels: themeList,
    score: Number(chosen.score.toFixed(4)),
    rationale: buildRationale(ctx, themeList, chosen.reasons),
    context: {
      part: ctx.part,
      partLabel: ctx.partLabel,
      isFriday: ctx.isFriday,
      occasions: ctx.occasions,
      hijri: ctx.hijri,
      slotId: ctx.slot.id,
    },
  };
}

/**
 * A plain description of the signals that produced this pick.
 *
 * This is the app describing its own filtering - it is never presented as
 * commentary on the ayah, and it is kept visually separate from the tafsir
 * in the UI for exactly that reason.
 */
function buildRationale(ctx, themeList, reasons) {
  const bits = [];
  const themeNames = themeList.map((t) => t.ar).filter(Boolean);
  if (themeNames.length) bits.push(`الموضوع: ${themeNames.join(' · ')}`);
  if (reasons.includes('time') && ctx.partLabel) bits.push(`مناسبة للوقت: ${ctx.partLabel.ar}`);
  if (ctx.occasions.includes('jumua')) bits.push('اليوم: الجمعة');
  if (ctx.occasions.includes('laylat-al-qadr')) bits.push('العشر الأواخر من رمضان');
  else if (ctx.occasions.includes('ramadan')) bits.push('شهر رمضان');
  if (reasons.includes('recent')) bits.push('أُعيدت بعد دورة كاملة');
  return bits;
}

module.exports = {
  buildContext,
  select,
  rank,
  slotInfo,
  partOfDay,
  hijriDate,
  PART_LABELS,
  TIME_AFFINITY,
  HIJRI_MONTHS_AR,
};
