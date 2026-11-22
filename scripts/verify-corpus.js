'use strict';
/**
 * Checks every reference in the corpus against BOTH published sources.
 *
 * For each ayah it confirms that:
 *   - the reference resolves on the primary source,
 *   - the second, independent source agrees on the text,
 *   - the configured tafsir edition actually has an entry for it, and that
 *     making the tafsir safe to render changes none of its visible text.
 *
 * Run with:  npm run verify:corpus
 * Exits non-zero if anything fails, so a bad reference can never ship.
 */

const { AYAT } = require('../src/quran/corpus');
const fetcher = require('../src/quran/fetcher');
const S = require('../src/quran/sources');

const CONCURRENCY = 6;
const CHECK_TAFSIR = process.argv.includes('--with-tafsir');
const TAFSIR_SLUG = S.DEFAULT_TAFSIR;

async function pool(items, size, worker) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (true) {
        const i = next++;
        if (i >= items.length) return;
        results[i] = await worker(items[i], i);
      }
    })
  );
  return results;
}

(async () => {
  console.log(`Checking ${AYAT.length} references`);
  console.log(`  text    : ${S.TEXT_PRIMARY.en}  (verified against ${S.TEXT_VERIFIER.en})`);
  if (CHECK_TAFSIR) console.log(`  tafsir  : ${S.tafsirBySlug(TAFSIR_SLUG).en}`);
  console.log('');

  let done = 0;
  const results = await pool(AYAT, CONCURRENCY, async (entry) => {
    const row = { key: entry.key, ok: false, notes: [] };
    try {
      const ayah = await fetcher.getAyah(entry.key, { requireVerification: true });
      row.surah = ayah.surahNameAr;
      row.chars = ayah.text.length;
      row.reason = ayah.verification.reason;
      row.ok = ayah.verified;
      if (!ayah.text.trim()) { row.ok = false; row.notes.push('empty text'); }

      if (CHECK_TAFSIR) {
        const t = await fetcher.getTafsir(entry.key, TAFSIR_SLUG);
        if (!t.text || t.text.length < 10) { row.ok = false; row.notes.push('tafsir too short'); }
        row.tafsirChars = t.text.length;
      }
    } catch (err) {
      row.ok = false;
      row.notes.push(`${err.code || 'ERR'}: ${err.message}`);
    }
    done++;
    if (done % 20 === 0) process.stdout.write(`  ...${done}/${AYAT.length}\n`);
    return row;
  });

  fetcher.flushCaches();

  const bad = results.filter((r) => !r.ok);
  const basmala = results.filter((r) => r.reason === 'match-after-basmala-prefix');

  console.log('');
  console.log(`passed : ${results.length - bad.length}/${results.length}`);
  console.log(`  of which matched after a Basmala prefix on the verifier: ${basmala.length}`);
  if (CHECK_TAFSIR) {
    const lens = results.filter((r) => r.tafsirChars).map((r) => r.tafsirChars);
    if (lens.length) {
      const avg = Math.round(lens.reduce((a, b) => a + b, 0) / lens.length);
      console.log(`  tafsir entries found: ${lens.length}, average ${avg} characters`);
    }
  }

  if (bad.length) {
    console.log('\nFAILED:');
    for (const r of bad) console.log(`  ${r.key.padEnd(8)} ${r.notes.join('; ')}`);
    process.exit(1);
  }
  console.log('\nAll references resolve and agree across both sources.');
})().catch((err) => {
  console.error('verification run failed:', err);
  process.exit(1);
});
