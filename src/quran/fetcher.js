'use strict';
/**
 * Fetches ayah text and tafsir from the published sources, verifies the ayah
 * against a second independent source, and caches the result.
 *
 * Rules this module enforces:
 *   1. Display text is whatever the source returned, unchanged.
 *   2. An ayah is only marked verified when a second source agrees.
 *   3. If verification fails, the ayah is not shown - the caller is told to
 *      pick another one rather than risk displaying a wrong text.
 *   4. Tafsir HTML is made safe to render, and the render is rejected if
 *      sanitising would have changed any visible character.
 */

const { Store } = require('../core/store');
const paths = require('../core/paths');
const S = require('./sources');
const N = require('./normalize');

const UA = 'MirqatWidgets/1.0 (personal desktop widget)';
const TIMEOUT_MS = 15000;

const ayahCache = new Store(paths.ayahCache, { v: 2, items: {} });
const tafsirCache = new Store(paths.tafsirCache, { v: 2, items: {} });
const chaptersCache = new Store(paths.chaptersCache, { v: 1, list: null, at: 0 });

class FetchError extends Error {
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
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { 'User-Agent': UA, Accept: 'application/json' },
      });
      if (!res.ok) throw new FetchError(`HTTP ${res.status} for ${url}`, 'HTTP_' + res.status);
      const json = await res.json();
      noteReachable(true);
      return json;
    } catch (err) {
      lastErr = err;
      if (err.name === 'AbortError' || err.name === 'TypeError' || err.code === 'NETWORK') {
        noteReachable(false);
      }
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1) ** 2));
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr instanceof FetchError ? lastErr : new FetchError(String(lastErr && lastErr.message), 'NETWORK');
}

/* ---------------------------------------------------------------- *
 * Surah names
 * ---------------------------------------------------------------- */

const CHAPTERS_TTL = 1000 * 60 * 60 * 24 * 30; // names never change; refresh monthly anyway

async function getChapters() {
  const cached = chaptersCache.data;
  if (cached.list && Date.now() - cached.at < CHAPTERS_TTL) return cached.list;
  try {
    const d = await getJson(`${S.TEXT_PRIMARY.api}/chapters?language=ar`);
    const list = {};
    for (const c of d.chapters) {
      list[c.id] = {
        id: c.id,
        nameAr: c.name_arabic,
        nameEn: c.name_simple,
        meaningEn: (c.translated_name && c.translated_name.name) || c.name_simple,
        verses: c.verses_count,
        revelation: c.revelation_place,
      };
    }
    chaptersCache.merge({ list, at: Date.now() });
    chaptersCache.flush();
    return list;
  } catch (err) {
    if (cached.list) return cached.list; // stale is fine, names are stable
    throw err;
  }
}

/* ---------------------------------------------------------------- *
 * Ayah
 * ---------------------------------------------------------------- */

function parseKey(key) {
  const m = /^(\d{1,3}):(\d{1,3})$/.exec(String(key).trim());
  if (!m) throw new FetchError(`bad ayah key: ${key}`, 'BAD_KEY');
  const surah = Number(m[1]);
  const ayah = Number(m[2]);
  if (surah < 1 || surah > 114 || ayah < 1) throw new FetchError(`out of range: ${key}`, 'BAD_KEY');
  return { surah, ayah };
}

async function fetchPrimaryText(key) {
  const d = await getJson(`${S.TEXT_PRIMARY.api}/quran/verses/uthmani?verse_key=${encodeURIComponent(key)}`);
  const v = d.verses && d.verses[0];
  if (!v || !v.text_uthmani) throw new FetchError(`no text for ${key} from primary`, 'NO_TEXT');
  // The feed pads some ayat with a leading space. Trimming the outer
  // whitespace touches no character of the ayah itself; the assertion below
  // makes that guarantee explicit rather than assumed.
  const text = v.text_uthmani.trim();
  if (N.skeleton(text) !== N.skeleton(v.text_uthmani)) {
    throw new FetchError(`trim altered ${key} - refusing`, 'TEXT_ALTERED');
  }
  return text;
}

async function fetchVerifierText(key) {
  const d = await getJson(`${S.TEXT_VERIFIER.api}/ayah/${encodeURIComponent(key)}/quran-uthmani`);
  const t = d && d.data && d.data.text;
  if (!t) throw new FetchError(`no text for ${key} from verifier`, 'NO_TEXT');
  return t;
}

/**
 * Returns a fully-formed, verified ayah record, or throws.
 * Cached records are trusted only if they were verified when stored.
 */
async function getAyah(key, { allowCache = true, requireVerification = true } = {}) {
  const { surah, ayah } = parseKey(key);

  if (allowCache) {
    const hit = ayahCache.data.items[key];
    if (hit && hit.verified) return { ...hit, fromCache: true };
  }

  const text = await fetchPrimaryText(key);

  let verified = false;
  let verification = { ok: false, reason: 'not-checked', verifier: S.TEXT_VERIFIER.id };
  try {
    const other = await fetchVerifierText(key);
    const r = N.verifyAgainst(text, other, surah, ayah);
    verified = r.ok;
    verification = { ok: r.ok, reason: r.reason, verifier: S.TEXT_VERIFIER.id, at: Date.now() };
  } catch (err) {
    verification = { ok: false, reason: `verifier-unreachable:${err.code || 'ERR'}`, verifier: S.TEXT_VERIFIER.id };
  }

  if (requireVerification && !verified) {
    // Never show text we could not corroborate.
    const cached = ayahCache.data.items[key];
    if (cached && cached.verified) return cached;
    const err = new FetchError(`could not verify ${key}: ${verification.reason}`, 'UNVERIFIED');
    err.verification = verification;
    throw err;
  }

  const chapters = await getChapters().catch(() => ({}));
  const ch = chapters[surah] || {};

  const record = {
    key,
    surah,
    ayah,
    text,                         // exactly as published, never edited
    surahNameAr: ch.nameAr || '',
    surahNameEn: ch.nameEn || '',
    surahMeaningEn: ch.meaningEn || '',
    revelation: ch.revelation || '',
    verified,
    verification,
    source: {
      id: S.TEXT_PRIMARY.id,
      ar: S.TEXT_PRIMARY.ar,
      en: S.TEXT_PRIMARY.en,
      scriptAr: S.TEXT_PRIMARY.scriptAr,
      url: `${S.TEXT_PRIMARY.home}/${surah}/${ayah}`,
    },
    fetchedAt: Date.now(),
  };

  ayahCache.data.items[key] = record;
  ayahCache.save();
  return record;
}

/* ---------------------------------------------------------------- *
 * Tafsir
 * ---------------------------------------------------------------- */

async function fetchTafsirFromPrimary(key, edition) {
  if (!edition.id) return null;
  const d = await getJson(`${S.TEXT_PRIMARY.api}/tafsirs/${edition.id}/by_ayah/${encodeURIComponent(key)}`);
  const raw = d && d.tafsir && d.tafsir.text;
  if (!raw || !N.htmlToText(raw)) return null;
  return {
    raw,
    providerAr: S.TEXT_PRIMARY.ar,
    providerEn: S.TEXT_PRIMARY.en,
    url: `${S.TEXT_PRIMARY.home}/${key.replace(':', '/')}/tafsirs/${edition.slug}`,
  };
}

async function fetchTafsirFromFallback(key, edition) {
  if (!edition.cloudId) return null;
  const d = await getJson(`${S.TEXT_VERIFIER.api}/ayah/${encodeURIComponent(key)}/${edition.cloudId}`);
  const raw = d && d.data && d.data.text;
  if (!raw || !N.htmlToText(raw)) return null;
  return {
    raw,
    providerAr: S.TEXT_VERIFIER.ar,
    providerEn: S.TEXT_VERIFIER.en,
    url: `${S.TEXT_VERIFIER.home}`,
  };
}

async function getTafsir(key, slug, { allowCache = true } = {}) {
  parseKey(key);
  const edition = S.tafsirBySlug(slug);
  const cacheKey = `${key}|${edition.slug}`;

  if (allowCache) {
    const hit = tafsirCache.data.items[cacheKey];
    if (hit) return hit;
  }

  let got = null;
  let errors = [];
  for (const attempt of [fetchTafsirFromPrimary, fetchTafsirFromFallback]) {
    try {
      got = await attempt(key, edition);
      if (got) break;
    } catch (err) {
      errors.push(err.code || String(err.message));
    }
  }

  if (!got) {
    const hit = tafsirCache.data.items[cacheKey];
    if (hit) return hit;
    throw new FetchError(
      `no tafsir for ${key} in ${edition.slug}${errors.length ? ' (' + errors.join(', ') + ')' : ''}`,
      'NO_TAFSIR'
    );
  }

  // Make it safe to render, then prove nothing visible changed.
  const html = N.sanitizeTafsirHtml(got.raw);
  N.assertTextPreserved(got.raw, html);

  const record = {
    key,
    edition: {
      slug: edition.slug,
      ar: edition.ar,
      en: edition.en,
      authorAr: edition.authorAr,
      authorEn: edition.authorEn,
      noteAr: edition.noteAr,
    },
    html,
    text: N.htmlToText(html),
    provider: { ar: got.providerAr, en: got.providerEn, url: got.url },
    fetchedAt: Date.now(),
  };

  tafsirCache.data.items[cacheKey] = record;
  tafsirCache.save();
  return record;
}

/* ---------------------------------------------------------------- *
 * Optional English meaning
 * ---------------------------------------------------------------- */

async function getTranslation(key, slug) {
  const tr = S.translationBySlug(slug);
  const cacheKey = `${key}|tr:${tr.slug}`;
  const hit = tafsirCache.data.items[cacheKey];
  if (hit) return hit;
  const d = await getJson(`${S.TEXT_PRIMARY.api}/quran/translations/${tr.id}?verse_key=${encodeURIComponent(key)}`);
  const t = d && d.translations && d.translations[0] && d.translations[0].text;
  if (!t) throw new FetchError(`no translation for ${key}`, 'NO_TRANSLATION');
  const html = N.sanitizeTafsirHtml(t);
  N.assertTextPreserved(t, html);
  const record = { key, slug: tr.slug, nameAr: tr.ar, nameEn: tr.en, html, text: N.htmlToText(html), fetchedAt: Date.now() };
  tafsirCache.data.items[cacheKey] = record;
  tafsirCache.save();
  return record;
}

let reachability = { at: 0, ok: true };
const REACHABILITY_TTL = 20_000;

/** Record what a real request just observed about the network. */
function noteReachable(ok) {
  reachability = { at: Date.now(), ok };
}

/**
 * Whether the primary source answered just now.
 *
 * A cached ayah never touches the network, so without this the widget could
 * sit on cached text for hours while quietly claiming it was live. One cheap
 * call per minute at most, and the answer is remembered in between.
 */
async function isReachable({ maxAge = REACHABILITY_TTL } = {}) {
  if (maxAge > 0 && Date.now() - reachability.at < maxAge) return reachability.ok;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  let ok = false;
  try {
    const res = await fetch(`${S.TEXT_PRIMARY.api}/chapters/1?language=ar`, {
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, Accept: 'application/json' },
    });
    ok = res.ok;
  } catch {
    ok = false;
  } finally {
    clearTimeout(timer);
  }
  reachability = { at: Date.now(), ok };
  return ok;
}

function cacheStats() {
  return {
    ayat: Object.keys(ayahCache.data.items).length,
    tafsir: Object.keys(tafsirCache.data.items).length,
  };
}

function hasCachedAyah(key) {
  const hit = ayahCache.data.items[key];
  return Boolean(hit && hit.verified);
}

function flushCaches() {
  ayahCache.flush();
  tafsirCache.flush();
  chaptersCache.flush();
}

module.exports = {
  getAyah,
  isReachable,
  getTafsir,
  getTranslation,
  getChapters,
  hasCachedAyah,
  cacheStats,
  flushCaches,
  parseKey,
  FetchError,
};
