'use strict';
/**
 * The Quran widget's brain: decides what the current slot should show, gets it
 * verified, remembers what has been shown, and keeps a warm cache so the
 * widget still works with no connection.
 */

const crypto = require('crypto');
const { Store } = require('../core/store');
const paths = require('../core/paths');
const fetcher = require('./fetcher');
const selector = require('./selector');
const S = require('./sources');
const { THEMES } = require('./corpus');

const state = new Store(paths.quranState, {
  salt: null,
  slotId: null,
  current: null,      // { key, themes, rationale, context, pinned }
  history: [],        // newest first: { key, themes, at }
  lastPrefetch: 0,
});

if (!state.data.salt) {
  // A per-install salt so two people running this do not see the same
  // sequence, while each install stays stable for itself.
  state.set('salt', crypto.randomBytes(8).toString('hex'));
}

const MAX_HISTORY = 900;

function intervalHours(settings) {
  const h = Number(settings && settings.quranIntervalHours);
  return Number.isFinite(h) && h >= 1 && h <= 24 ? h : 6;
}

/**
 * Resolve the ayah for a slot, skipping any candidate that cannot be
 * displayed with confidence. `offline` restricts choices to what is cached.
 */
async function resolveForContext(ctx, { offline = false, avoid = [] } = {}) {
  const history = state.data.history;
  const avoidSet = new Set(avoid);

  const isUsable = (key) => {
    if (avoidSet.has(key)) return false;
    if (offline) return fetcher.hasCachedAyah(key);
    return true;
  };

  const ranked = selector.rank(ctx, history, { salt: state.data.salt });
  const problems = [];

  // Walk the ranked list; the first candidate that both resolves and verifies
  // wins. An ayah that fails verification is never shown.
  for (const cand of ranked) {
    if (!isUsable(cand.entry.key)) continue;
    try {
      const ayah = await fetcher.getAyah(cand.entry.key, { requireVerification: true });
      const themeLabels = cand.entry.themes.map((t) => ({ id: t, ...THEMES[t] }));
      return {
        ayah,
        fromCache: Boolean(ayah.fromCache),
        pick: {
          key: cand.entry.key,
          themes: cand.entry.themes,
          themeLabels,
          rationale: selectorRationale(ctx, themeLabels, cand.reasons),
          rationaleEn: selectorRationaleEn(ctx, themeLabels, cand.reasons),
          context: {
            part: ctx.part,
            partLabel: ctx.partLabel,
            isFriday: ctx.isFriday,
            occasions: ctx.occasions,
            hijri: ctx.hijri,
            slotId: ctx.slot.id,
          },
        },
        problems,
      };
    } catch (err) {
      problems.push({ key: cand.entry.key, code: err.code || 'ERR', message: err.message });
      if (problems.length >= 6) break;   // network is clearly down; stop hammering
    }
  }

  const err = new Error('no verifiable ayah available');
  err.code = 'NO_CANDIDATE';
  err.problems = problems;
  throw err;
}

function selectorRationale(ctx, themeLabels, reasons) {
  const bits = [];
  const names = themeLabels.map((t) => t.ar).filter(Boolean);
  if (names.length) bits.push(`الموضوع: ${names.join(' · ')}`);
  if (reasons.includes('time') && ctx.partLabel) bits.push(`مناسبة للوقت: ${ctx.partLabel.ar}`);
  if (ctx.occasions.includes('jumua')) bits.push('اليوم: الجمعة');
  if (ctx.occasions.includes('laylat-al-qadr')) bits.push('العشر الأواخر من رمضان');
  else if (ctx.occasions.includes('ramadan')) bits.push('شهر رمضان');
  return bits;
}

/** The same signals in English, for the English interface. */
function selectorRationaleEn(ctx, themeLabels, reasons) {
  const bits = [];
  const names = themeLabels.map((t) => t.en).filter(Boolean);
  if (names.length) bits.push(`Theme: ${names.join(' · ')}`);
  if (reasons.includes('time') && ctx.partLabel && ctx.partLabel.en) bits.push(`Suits the time of day: ${ctx.partLabel.en}`);
  if (ctx.occasions.includes('jumua')) bits.push('Today is Friday');
  if (ctx.occasions.includes('laylat-al-qadr')) bits.push('The last ten nights of Ramadan');
  else if (ctx.occasions.includes('ramadan')) bits.push('The month of Ramadan');
  return bits;
}

function remember(pick) {
  const history = state.data.history;
  history.unshift({ key: pick.key, themes: pick.themes, at: Date.now() });
  state.data.history = history.slice(0, MAX_HISTORY);
  state.save();
}

/**
 * The ayah for right now.
 *   force: true  -> move to a new ayah immediately, even inside the same slot
 *   settings     -> reads quranIntervalHours
 */
async function current(settings = {}, { force = false } = {}) {
  const now = new Date();
  const hours = intervalHours(settings);
  const ctx = selector.buildContext(now, { intervalHours: hours });
  const saved = state.data.current;

  const sameSlot = saved && state.data.slotId === ctx.slot.id;
  if (sameSlot && !force) {
    try {
      const ayah = await fetcher.getAyah(saved.key, { requireVerification: true });
      // Served without touching the network: check whether that was a choice
      // or because the sources are unreachable, so the widget can say so.
      const stale = ayah.fromCache ? !(await fetcher.isReachable()) : false;
      return shape(ayah, saved, ctx, hours, stale);
    } catch {
      // fall through and re-pick
    }
  }

  const avoid = force && saved ? [saved.key] : [];
  let resolved;
  try {
    resolved = await resolveForContext(ctx, { offline: false, avoid });
  } catch (err) {
    // Offline or the sources are unhappy: fall back to what we already hold.
    resolved = await resolveForContext(ctx, { offline: true, avoid }).catch(() => null);
    if (!resolved) {
      const e = new Error('لا يمكن جلب الآية الآن، وليست هناك نسخة محفوظة.');
      e.code = 'OFFLINE_EMPTY';
      e.problems = err.problems || [];
      throw e;
    }
    resolved.offline = true;
  }

  if (!resolved.offline && resolved.fromCache) {
    // This branch runs at most once per slot, plus whenever the user asks for
    // a new ayah, so it can afford to check the connection for real rather
    // than trusting a reading from before the network may have dropped.
    resolved.offline = !(await fetcher.isReachable({ maxAge: 0 }));
  }

  state.data.slotId = ctx.slot.id;
  state.data.current = resolved.pick;
  state.save();
  remember(resolved.pick);

  return shape(resolved.ayah, resolved.pick, ctx, hours, resolved.offline);
}

function shape(ayah, pick, ctx, hours, offline = false) {
  return {
    ayah,
    pick,
    slot: {
      id: ctx.slot.id,
      startsAt: ctx.slot.start.getTime(),
      endsAt: ctx.slot.end.getTime(),
      hours,
    },
    offline: Boolean(offline),
    generatedAt: Date.now(),
  };
}

/** Full detail for the tafsir window. */
async function detail(key, settings = {}) {
  const tafsirSlug = (settings && settings.tafsir) || S.DEFAULT_TAFSIR;
  const ayah = await fetcher.getAyah(key, { requireVerification: true });
  const out = { ayah, tafsir: null, translation: null, errors: [] };

  try {
    out.tafsir = await fetcher.getTafsir(key, tafsirSlug);
  } catch (err) {
    out.errors.push({ part: 'tafsir', code: err.code || 'ERR', message: err.message });
  }

  if (settings && settings.showTranslation) {
    try {
      out.translation = await fetcher.getTranslation(key, settings.translation || 'sahih');
    } catch (err) {
      out.errors.push({ part: 'translation', code: err.code || 'ERR', message: err.message });
    }
  }

  const saved = state.data.current;
  if (saved && saved.key === key) out.pick = saved;
  out.editions = S.TAFSIR_EDITIONS.map((e) => ({
    slug: e.slug, ar: e.ar, en: e.en, authorAr: e.authorAr, noteAr: e.noteAr,
  }));
  return out;
}

/**
 * Warm the cache for the candidates most likely to come up next, so a slot
 * rollover while offline still has something verified to show.
 */
async function prefetch(settings = {}, { count = 8 } = {}) {
  const hours = intervalHours(settings);
  const now = Date.now();
  const wanted = new Set();

  for (let i = 1; i <= 6; i++) {
    const future = new Date(now + i * hours * 3600e3);
    const ctx = selector.buildContext(future, { intervalHours: hours });
    selector
      .rank(ctx, state.data.history, { salt: state.data.salt })
      .slice(0, 3)
      .forEach((c) => wanted.add(c.entry.key));
  }

  let fetched = 0;
  let failed = 0;
  for (const key of wanted) {
    if (fetched >= count) break;
    if (fetcher.hasCachedAyah(key)) continue;
    try {
      await fetcher.getAyah(key, { requireVerification: true });
      fetched++;
    } catch {
      failed++;
      if (failed >= 3) break;
    }
  }

  state.set('lastPrefetch', Date.now());
  fetcher.flushCaches();
  return { fetched, considered: wanted.size, cache: fetcher.cacheStats() };
}

function historyView(limit = 40) {
  return state.data.history.slice(0, limit).map((h) => ({
    key: h.key,
    at: h.at,
    themes: (h.themes || []).map((t) => (THEMES[t] ? THEMES[t].ar : t)),
  }));
}

function stats() {
  return {
    history: state.data.history.length,
    cache: fetcher.cacheStats(),
    lastPrefetch: state.data.lastPrefetch,
    slotId: state.data.slotId,
  };
}

function flush() {
  state.flush();
  fetcher.flushCaches();
}

module.exports = { current, detail, prefetch, historyView, stats, flush, intervalHours };
