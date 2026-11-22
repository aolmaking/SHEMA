'use strict';
/**
 * Fetches hadith from HadeethEnc, verifies them against the collection they
 * cite, and caches the result.
 *
 * Rules this module enforces, the same as for the Quran:
 *   1. What is displayed is the source's text, unchanged.
 *   2. A hadith is marked verified only when HadeethEnc grades it sound AND
 *      its words are found at the cited number in an independent copy of the
 *      collection (and, for the Sunan, that collection's graders agree).
 *   3. Anything that cannot be verified is never shown.
 */

const { Store } = require('../core/store');
const paths = require('../core/paths');
const S = require('./sources');
const V = require('./verify');

const UA = 'MirqatWidgets/1.0 (personal desktop widget)';
const TIMEOUT_MS = 20000;
const POOL_TTL = 1000 * 60 * 60 * 24 * 30;

const cache = new Store(paths.hadithCache, { v: 1, items: {}, en: {} });
const poolStore = new Store(paths.hadithPool, { at: 0, items: [] });
const indexStore = new Store(paths.hadithIndex, { muslim: null });

class HadithError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code || 'FETCH_FAILED';
  }
}

async function getJson(url, { retries = 2 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': UA, Accept: 'application/json' } });
      if (res.status === 404) throw new HadithError(`not found: ${url}`, 'NOT_FOUND');
      if (!res.ok) throw new HadithError(`HTTP ${res.status} for ${url}`, `HTTP_${res.status}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      if (err.code === 'NOT_FOUND') break;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 500 * (attempt + 1) ** 2));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr instanceof HadithError ? lastErr : new HadithError(String(lastErr && lastErr.message), 'NETWORK');
}

/* ---------------------------------------------------------------- *
 * The candidate pool: ids from the chosen HadeethEnc categories
 * ---------------------------------------------------------------- */

async function getPool({ refresh = false } = {}) {
  const have = poolStore.data;
  if (!refresh && have.items.length && Date.now() - have.at < POOL_TTL) return have.items;
  const byId = new Map();
  try {
    for (const cat of S.CATEGORIES) {
      for (let page = 1; page <= 6; page++) {
        const d = await getJson(`${S.ENCYCLOPEDIA.api}/hadeeths/list/?language=ar&category_id=${cat.id}&page=${page}&per_page=100`);
        for (const h of d.data || []) {
          const item = byId.get(h.id) || { id: String(h.id), themes: [] };
          if (!item.themes.includes(cat.theme)) item.themes.push(cat.theme);
          byId.set(h.id, item);
        }
        if (!d.meta || Number(d.meta.current_page) >= Number(d.meta.last_page)) break;
      }
    }
  } catch (err) {
    if (have.items.length) return have.items;   // stale is fine; ids never change
    throw err;
  }
  const items = [...byId.values()];
  poolStore.merge({ at: Date.now(), items });
  poolStore.flush();
  return items;
}

/* ---------------------------------------------------------------- *
 * Independent copy of the collections
 * ---------------------------------------------------------------- */

/** Sahih Muslim is cited by its standard number, which maps to several entries. */
async function muslimEntries(n) {
  let index = indexStore.data.muslim;
  if (!index) {
    const d = await getJson(`${S.COLLECTIONS.api}/ara-muslim.min.json`);
    index = {};
    for (const h of d.hadiths) {
      const k = Math.floor(Number(h.arabicnumber));
      if (!Number.isFinite(k) || k <= 0) continue;
      (index[k] = index[k] || []).push(h.hadithnumber);
    }
    indexStore.merge({ muslim: index });
    indexStore.flush();
  }
  return index[n] || [];
}

async function collectionTexts(ref) {
  const book = S.BOOKS.find((b) => b.id === ref.book);
  const numbers = book.byArabicNumber ? await muslimEntries(ref.n) : [ref.n];
  const out = [];
  for (const num of numbers.slice(0, 8)) {
    try {
      const d = await getJson(`${S.COLLECTIONS.api}/${book.edition}/${num}.json`, { retries: 1 });
      const h = d.hadiths && d.hadiths[0];
      if (h && h.text) out.push({ text: h.text, grades: h.grades || [] });
    } catch (err) {
      if (err.code !== 'NOT_FOUND') throw err;
    }
  }
  return out;
}

/** Check one HadeethEnc record against every collection it cites. */
async function verifyRecord(raw) {
  if (!V.gradeOk(raw.grade)) return { ok: false, reason: 'grade' };
  const refs = V.parseRefs(raw.reference);
  if (!refs.length) return { ok: false, reason: 'no-checkable-reference' };
  const matn = V.matnOf(raw);
  let best = null;
  // The two Sahih collections first: they need no further grading.
  refs.sort((a, b) => Number(!S.BOOKS.find((x) => x.id === a.book).sahih) - Number(!S.BOOKS.find((x) => x.id === b.book).sahih));
  for (const ref of refs) {
    const book = S.BOOKS.find((b) => b.id === ref.book);
    const texts = await collectionTexts(ref);
    for (const t of texts) {
      const c = V.coverage(matn, t.text);
      if (!V.passes(c)) { if (!best || c.ratio > best.coverage) best = { ...ref, coverage: c.ratio, ok: false }; continue; }
      if (!book.sahih && !V.collectionGradeOk(t.grades)) {
        best = { ...ref, coverage: c.ratio, ok: false, reason: 'collection-grade' };
        continue;
      }
      return {
        ok: true,
        book: ref.book,
        n: ref.n,
        coverage: Math.round(c.ratio * 100) / 100,
        collectionGrade: book.sahih ? null : V.collectionGradeText(t.grades),
        at: Date.now(),
      };
    }
  }
  return { ok: false, reason: best && best.reason ? best.reason : 'no-match', best };
}

/* ---------------------------------------------------------------- *
 * Records
 * ---------------------------------------------------------------- */

function shape(raw, verification) {
  return {
    id: String(raw.id),
    title: raw.title || '',
    text: raw.hadeeth || '',            // exactly as published, never edited
    intro: raw.hadeeth_intro || '',
    attribution: raw.attribution || '',
    grade: raw.grade || '',
    explanation: raw.explanation || '',
    hints: Array.isArray(raw.hints) ? raw.hints : [],
    words: Array.isArray(raw.words_meanings) ? raw.words_meanings : [],
    reference: raw.reference || '',
    verified: Boolean(verification && verification.ok),
    verification,
    source: { id: S.ENCYCLOPEDIA.id, ar: S.ENCYCLOPEDIA.ar, en: S.ENCYCLOPEDIA.en, url: S.ENCYCLOPEDIA.page(raw.id) },
    fetchedAt: Date.now(),
  };
}

/** A verified record, from cache or freshly checked. Throws if unusable. */
async function getHadith(id, { allowCache = true } = {}) {
  const key = String(id);
  if (allowCache) {
    const hit = cache.data.items[key];
    if (hit && hit.verified) return { ...hit, fromCache: true };
    if (hit && hit.rejected) throw new HadithError(`not verifiable: ${key}`, 'UNVERIFIED');
  }
  const raw = await getJson(`${S.ENCYCLOPEDIA.api}/hadeeths/one/?language=ar&id=${encodeURIComponent(key)}`);
  if (!raw || !raw.hadeeth) throw new HadithError(`no text for ${key}`, 'NO_TEXT');
  const verification = await verifyRecord(raw);
  if (!verification.ok) {
    // Remember the rejection (only the reason), so it is not fetched again.
    cache.data.items[key] = { id: key, rejected: true, reason: verification.reason, at: Date.now() };
    cache.save();
    throw new HadithError(`could not verify ${key}: ${verification.reason}`, 'UNVERIFIED');
  }
  const record = shape(raw, verification);
  cache.data.items[key] = record;
  cache.save();
  return record;
}

/** HadeethEnc's own published English translation and explanation. */
async function getEnglish(id) {
  const key = String(id);
  const hit = cache.data.en[key];
  if (hit) return hit;
  const raw = await getJson(`${S.ENCYCLOPEDIA.api}/hadeeths/one/?language=en&id=${encodeURIComponent(key)}`);
  const record = {
    id: key,
    title: raw.title || '',
    text: raw.hadeeth || '',
    attribution: raw.attribution || '',
    grade: raw.grade || '',
    explanation: raw.explanation || '',
    hints: Array.isArray(raw.hints) ? raw.hints : [],
    url: S.ENCYCLOPEDIA.page(key, 'en'),
  };
  cache.data.en[key] = record;
  cache.save();
  return record;
}

function hasVerified(id) {
  const hit = cache.data.items[String(id)];
  return Boolean(hit && hit.verified);
}

function isRejected(id) {
  const hit = cache.data.items[String(id)];
  return Boolean(hit && hit.rejected);
}

function cacheStats() {
  const items = Object.values(cache.data.items);
  return { verified: items.filter((x) => x.verified).length, rejected: items.filter((x) => x.rejected).length };
}

function flush() {
  cache.flush();
  poolStore.flush();
  indexStore.flush();
}

module.exports = { getPool, getHadith, getEnglish, verifyRecord, hasVerified, isRejected, cacheStats, flush, HadithError };
