'use strict';
/**
 * Text integrity helpers.
 *
 * Read this file as the app's promise about Quranic text: nothing here ever
 * rewrites what a source published. `skeleton()` produces a throwaway
 * comparison key used ONLY to check two independent sources against each
 * other; the string that reaches the screen is always the untouched original.
 */

// Arabic combining marks, Quranic annotation signs, tatweel, bidi controls.
const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـࣰ-ࣿ​-‏﻿]/g;

// Ayah-end markers and the Quranic stop signs that renderers insert.
const AYAH_MARKS = /[۝۞۩ۖ-ۜ]/g;

/**
 * Collapse an ayah to its consonantal skeleton so two encodings of the same
 * text compare equal. Uthmani text is published with several legitimate
 * Unicode spellings of the same word (for example ٱلْءَاخِرِ vs ٱلْـَٔاخِرِ), so a
 * byte comparison would raise false alarms while a skeleton comparison still
 * catches any genuinely different word.
 *
 * The result is used for comparison only and is never displayed.
 */
function skeleton(input) {
  if (typeof input !== 'string') return '';
  let s = input.normalize('NFC');
  s = s.replace(MARKS, '');
  s = s.replace(AYAH_MARKS, '');
  s = s.replace(/[آأإٱٲٳٵ]/g, 'ا'); // alef forms
  s = s.replace(/ء/g, '');                                            // lone hamza
  s = s.replace(/ؤ/g, 'و').replace(/ئ/g, 'ي');         // hamza on waw/ya
  s = s.replace(/ى/g, 'ي');                                      // alef maqsura
  s = s.replace(/ة/g, 'ه');                                      // ta marbuta
  s = s.replace(/[^؀-ۿ\s]/g, '');
  return s.replace(/\s+/g, ' ').trim();
}

/** Skeleton of the Basmala, used to tolerate sources that prefix it to ayah 1. */
const BASMALA_SKELETON = skeleton('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ');

/**
 * Compare the display text against an independent source.
 *
 * Some sources prepend the Basmala to the first ayah of a surah. That is a
 * packaging difference in the verifier's feed, not a difference in the ayah,
 * so it is tolerated for ayah 1 of every surah except Al-Fatiha (where the
 * Basmala is ayah 1) and At-Tawba (which has none).
 *
 * Returns { ok, reason }.
 */
function verifyAgainst(displayText, verifierText, surah, ayah) {
  const a = skeleton(displayText);
  let b = skeleton(verifierText);
  if (!a || !b) return { ok: false, reason: 'empty-text' };
  if (a === b) return { ok: true, reason: 'exact-skeleton-match' };

  const opensSurah = ayah === 1 && surah !== 1 && surah !== 9;
  if (opensSurah && b.startsWith(BASMALA_SKELETON)) {
    b = b.slice(BASMALA_SKELETON.length).trim();
    if (a === b) return { ok: true, reason: 'match-after-basmala-prefix' };
  }
  return { ok: false, reason: 'skeleton-mismatch' };
}

/* ------------------------------------------------------------------ *
 * Tafsir rendering safety
 *
 * Tafsir arrives as HTML. We must render it without executing anything, but
 * we must not alter a single word of the scholar's text. The sanitiser below
 * therefore drops only non-textual elements and all attributes, and
 * `assertTextPreserved` then proves that the visible text of the result is
 * identical to the visible text of the original.
 * ------------------------------------------------------------------ */

const ALLOWED_TAGS = new Set([
  'p', 'br', 'b', 'strong', 'i', 'em', 'u', 'span', 'div',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'sup', 'sub', 'hr', 'small',
]);

/** Elements whose *contents* are code, not prose, and must go entirely. */
const VOID_CONTENT = /<(script|style|iframe|object|embed|noscript)\b[\s\S]*?<\/\1\s*>/gi;

function sanitizeTafsirHtml(html) {
  if (typeof html !== 'string') return '';
  let out = html.replace(VOID_CONTENT, '');
  out = out.replace(/<!--[\s\S]*?-->/g, '');
  // Keep allowed tags but strip every attribute; drop any other tag entirely
  // (its text content stays, because only the angle-bracket markup is removed).
  out = out.replace(/<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (m, slash, tag) => {
    const t = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(t)) return '';
    return `<${slash}${t}>`;
  });
  return out.trim();
}

/** Visible text of an HTML fragment, for the preservation check. */
function htmlToText(html) {
  if (typeof html !== 'string') return '';
  return html
    .replace(VOID_CONTENT, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Throws if sanitising changed any visible character. Callers treat a throw as
 * "refuse to display" rather than "display something approximate".
 */
function assertTextPreserved(original, sanitized) {
  const a = htmlToText(original);
  const b = htmlToText(sanitized);
  if (a !== b) {
    const err = new Error('tafsir text changed during sanitisation - refusing to display');
    err.code = 'TEXT_ALTERED';
    throw err;
  }
  return true;
}

module.exports = {
  skeleton,
  verifyAgainst,
  sanitizeTafsirHtml,
  htmlToText,
  assertTextPreserved,
  BASMALA_SKELETON,
};
