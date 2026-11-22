'use strict';
/**
 * The hadith side of the widget: decides which hadith the current slot
 * shows, makes sure it is verified, remembers what has been shown, and keeps
 * enough verified hadith cached to work offline.
 *
 * The choice is deliberate, not a shuffle: candidates come from scholar-
 * curated HadeethEnc categories, weighted by the part of the day and by
 * occasions (Friday, Ramadan), never repeated soon, and stable within a slot.
 */

const crypto = require('crypto');
const { Store } = require('../core/store');
const paths = require('../core/paths');
const fetcher = require('./fetcher');
const S = require('./sources');
const selector = require('../quran/selector');

const state = new Store(paths.hadithState, {
  salt: null,
  slotId: null,
  current: null,        // { id, themes, rationale, rationaleEn }
  history: [],          // newest first: { id, at }
  lastPrefetch: 0,
});
if (!state.data.salt) state.set('salt', crypto.randomBytes(8).toString('hex'));

const MAX_HISTORY = 600;
const MAX_WIDGET_CHARS = 700;   // longer ones read badly in a small tile

function intervalHours(settings) {
  const h = Number(settings && settings.quranIntervalHours);
  return Number.isFinite(h) && h >= 1 && h <= 24 ? h : 6;
}

function hash32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** How welcome a theme is right now. */
function themeWeight(theme, ctx) {
  let w = (S.PART_WEIGHTS[ctx.part] || {})[theme] || 1;
  const friday = ctx.occasions.includes('jumua');
  const ramadan = ctx.occasions.includes('ramadan');
  const qadr = ctx.occasions.includes('laylat-al-qadr');
  if (theme === 'jumua') w *= friday ? 4 : 0.12;
  if (theme === 'siyam') w *= ramadan ? 3 : 0.6;
  if (theme === 'ramadan') w *= qadr ? 6 : ramadan ? 2 : 0.08;
  return w;
}

/** Candidates for a slot, best first. */
function rank(ctx, pool, history) {
  const recent = new Map(history.map((h, i) => [String(h.id), i]));
  const scored = [];
  for (const item of pool) {
    const seenAt = recent.get(item.id);
    if (seenAt !== undefined && seenAt < 300) continue;          // shown too recently
    if (fetcher.isRejected(item.id)) continue;
    let score = Math.max(...item.themes.map((t) => themeWeight(t, ctx)));
    if (seenAt !== undefined) score *= 0.35;
    // A stable, per-install variation so equal candidates take turns.
    score *= 0.65 + (hash32(`${state.data.salt}|${ctx.slot.id}|${item.id}`) % 1000) / 1000 * 0.7;
    scored.push({ item, score });
  }
  return scored.sort((a, b) => b.score - a.score);
}

function rationale(ctx, themes) {
  const names = themes.map((t) => S.THEMES[t]).filter(Boolean);
  const ar = [];
  const en = [];
  if (names.length) { ar.push(`الموضوع: ${names.map((n) => n.ar).join(' · ')}`); en.push(`Theme: ${names.map((n) => n.en).join(' · ')}`); }
  const best = themes.reduce((a, t) => Math.max(a, (S.PART_WEIGHTS[ctx.part] || {})[t] || 1), 1);
  if (best > 1 && ctx.partLabel) { ar.push(`مناسب للوقت: ${ctx.partLabel.ar}`); en.push(`Suits the time of day: ${ctx.partLabel.en}`); }
  if (ctx.occasions.includes('jumua') && themes.includes('jumua')) { ar.push('اليوم: الجمعة'); en.push('Today is Friday'); }
  if (ctx.occasions.includes('ramadan') && (themes.includes('siyam') || themes.includes('ramadan'))) { ar.push('شهر رمضان'); en.push('The month of Ramadan'); }
  return { ar, en };
}

function usable(rec) {
  return rec && rec.verified && rec.text && rec.text.length <= MAX_WIDGET_CHARS;
}

async function resolve(ctx, { offline = false, avoid = [] } = {}) {
  let pool;
  try { pool = await fetcher.getPool(); } catch { pool = []; }
  if (!pool.length) throw Object.assign(new Error('no hadith list available'), { code: 'NO_POOL' });
  const avoidSet = new Set(avoid.map(String));
  const ranked = rank(ctx, pool, state.data.history);
  let failures = 0;
  for (const { item } of ranked) {
    if (avoidSet.has(item.id)) continue;
    if (offline && !fetcher.hasVerified(item.id)) continue;
    try {
      const rec = await fetcher.getHadith(item.id);
      if (!usable(rec)) continue;
      const why = rationale(ctx, item.themes);
      return {
        hadith: rec,
        fromCache: Boolean(rec.fromCache),
        pick: {
          id: item.id,
          themes: item.themes,
          themeLabels: item.themes.map((t) => ({ id: t, ...S.THEMES[t] })),
          rationale: why.ar,
          rationaleEn: why.en,
          context: { part: ctx.part, partLabel: ctx.partLabel, occasions: ctx.occasions, slotId: ctx.slot.id },
        },
      };
    } catch (err) {
      if (err.code === 'UNVERIFIED' || err.code === 'NOT_FOUND' || err.code === 'NO_TEXT') continue;
      if (++failures >= 4) break;     // the network is down; stop trying
    }
  }
  throw Object.assign(new Error('no verified hadith available'), { code: 'NO_CANDIDATE' });
}

function shape(hadith, pick, ctx, hours, offline) {
  return {
    hadith,
    pick,
    slot: { id: ctx.slot.id, startsAt: ctx.slot.start.getTime(), endsAt: ctx.slot.end.getTime(), hours },
    offline: Boolean(offline),
    generatedAt: Date.now(),
  };
}

async function current(settings = {}, { force = false } = {}) {
  const hours = intervalHours(settings);
  const ctx = selector.buildContext(new Date(), { intervalHours: hours });
  const saved = state.data.current;

  if (saved && state.data.slotId === ctx.slot.id && !force) {
    try {
      const rec = await fetcher.getHadith(saved.id);
      return shape(rec, saved, ctx, hours, false);
    } catch { /* fall through and pick again */ }
  }

  const avoid = force && saved ? [saved.id] : [];
  let resolved;
  let offline = false;
  try {
    resolved = await resolve(ctx, { avoid });
  } catch (err) {
    resolved = await resolve(ctx, { offline: true, avoid }).catch(() => null);
    if (!resolved) {
      const e = new Error('لا يمكن جلب الحديث الآن، وليست هناك نسخة محفوظة.');
      e.code = 'OFFLINE_EMPTY';
      throw e;
    }
    offline = true;
  }

  state.data.slotId = ctx.slot.id;
  state.data.current = resolved.pick;
  state.data.history.unshift({ id: resolved.pick.id, at: Date.now() });
  state.data.history = state.data.history.slice(0, MAX_HISTORY);
  state.save();
  return shape(resolved.hadith, resolved.pick, ctx, hours, offline);
}

/** Everything for the detail window; the English is HadeethEnc's own translation. */
async function detail(id, { language = 'ar' } = {}) {
  const hadith = await fetcher.getHadith(id);
  const out = { hadith, english: null, errors: [] };
  if (language === 'en') {
    try { out.english = await fetcher.getEnglish(id); } catch (err) { out.errors.push({ part: 'english', code: err.code || 'ERR' }); }
  }
  const saved = state.data.current;
  if (saved && saved.id === String(id)) out.pick = saved;
  return out;
}

/**
 * Verify hadith ahead of time, so a slot change while offline still has
 * something checked to show. `count` is how many new ones to add.
 */
async function prefetch(settings = {}, { count = 12 } = {}) {
  const hours = intervalHours(settings);
  let pool;
  try { pool = await fetcher.getPool(); } catch { return { added: 0, cache: fetcher.cacheStats() }; }
  const wanted = [];
  for (let i = 1; i <= 8; i++) {
    const ctx = selector.buildContext(new Date(Date.now() + i * hours * 3600e3), { intervalHours: hours });
    for (const { item } of rank(ctx, pool, state.data.history).slice(0, 4)) wanted.push(item.id);
  }
  let added = 0;
  let failures = 0;
  for (const id of new Set(wanted)) {
    if (added >= count) break;
    if (fetcher.hasVerified(id) || fetcher.isRejected(id)) continue;
    try { await fetcher.getHadith(id); added++; } catch (err) {
      if (err.code !== 'UNVERIFIED' && ++failures >= 3) break;
    }
  }
  state.set('lastPrefetch', Date.now());
  fetcher.flush();
  return { added, cache: fetcher.cacheStats() };
}

function flush() {
  state.flush();
  fetcher.flush();
}

module.exports = { current, detail, prefetch, flush, intervalHours, rank, themeWeight };
