'use strict';
/**
 * Checks that a hadith is what its references say it is.
 *
 * Narrations of one hadith differ slightly in wording ("متفق عليه" quotes
 * often combine both), so the check is not an exact string match. It asks
 * whether the Prophet's words, as quoted by HadeethEnc, are found in the
 * cited collection at the cited number: most of the words, in a text that
 * also contains its full chain of narration. Nothing here edits the text
 * that is shown; it only decides whether it may be shown.
 */

const { skeleton } = require('../quran/normalize');
const { BOOKS } = require('./sources');

const MIN_COVERAGE = 0.75;

/** The quoted words of the Prophet (between « »), or the text after the intro. */
function matnOf(rec) {
  const text = rec.hadeeth || rec.text || '';
  const quoted = [...text.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
  if (quoted.length) return quoted.join(' ');
  const intro = rec.hadeeth_intro || rec.intro || '';
  return intro && text.startsWith(intro) ? text.slice(intro.length) : text;
}

function words(text) {
  return skeleton(text).split(' ').filter((w) => w.length > 1);
}

/** Share of the matn's words found in the source text (with repeats counted). */
function coverage(matn, source) {
  const want = words(matn);
  if (!want.length) return { ratio: 0, hit: 0, total: 0 };
  const pool = new Map();
  for (const w of words(source)) pool.set(w, (pool.get(w) || 0) + 1);
  let hit = 0;
  for (const w of want) {
    const n = pool.get(w) || 0;
    if (n > 0) { hit++; pool.set(w, n - 1); }
  }
  return { ratio: hit / want.length, hit, total: want.length };
}

function passes(c) {
  if (c.total < 4) return c.ratio === 1;
  return c.ratio >= MIN_COVERAGE && c.hit >= 4;
}

/** Every "book (number)" cited in a HadeethEnc reference block. */
function parseRefs(reference) {
  const out = [];
  // One line can cite several works, separated by Arabic commas.
  for (const line of String(reference || '').split(/\n+|،|؛/)) {
    for (const book of BOOKS) {
      if (!book.match.test(line)) continue;
      const nums = [...line.matchAll(/\((\d+)\)/g)].map((m) => Number(m[1]));
      if (nums.length) out.push({ book: book.id, n: nums[nums.length - 1] });
      break;
    }
  }
  const seen = new Set();
  return out.filter((r) => { const k = `${r.book}:${r.n}`; if (seen.has(k)) return false; seen.add(k); return true; });
}

/** HadeethEnc's own grade must be sound. */
function gradeOk(grade) {
  const g = String(grade || '');
  return /صحيح|حسن/.test(g) && !/ضعيف|موضوع|منكر/.test(g);
}

/**
 * For the Sunan, the collection's own scholars must agree. Al-Albani's grade
 * decides when he is listed; otherwise no grader may call it weak.
 */
function collectionGradeOk(grades) {
  const list = Array.isArray(grades) ? grades : [];
  if (!list.length) return false;
  const sound = (g) => /sahih|hasan/i.test(g) && !/da.?if|maudu|munkar|shadh/i.test(g);
  const albani = list.find((g) => /albani/i.test(g.name || ''));
  if (albani) return sound(albani.grade || '');
  return list.some((g) => sound(g.grade || '')) && !list.some((g) => /da.?if|maudu/i.test(g.grade || ''));
}

function collectionGradeText(grades) {
  const list = Array.isArray(grades) ? grades : [];
  const albani = list.find((g) => /albani/i.test(g.name || ''));
  const g = albani || list[0];
  return g ? `${g.grade} — ${g.name}` : '';
}

module.exports = { matnOf, words, coverage, passes, parseRefs, gradeOk, collectionGradeOk, collectionGradeText, MIN_COVERAGE };
