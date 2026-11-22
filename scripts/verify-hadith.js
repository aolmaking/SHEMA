'use strict';
/**
 * Verifies every hadith in the candidate pool and reports how many pass, by
 * collection, and why the others were left out. The verified ones are cached
 * and ship with the installed app for offline use.
 *
 *   npm run verify:hadith
 */

const fetcher = require('../src/hadith/fetcher');

(async () => {
  const pool = await fetcher.getPool({ refresh: process.argv.includes('--refresh') });
  console.log(`pool: ${pool.length} hadith from the selected HadeethEnc categories`);
  const byBook = {};
  const reasons = {};
  let ok = 0;
  let done = 0;
  const queue = [...pool];
  async function worker() {
    while (queue.length) {
      const item = queue.shift();
      try {
        const rec = await fetcher.getHadith(item.id);
        ok++;
        byBook[rec.verification.book] = (byBook[rec.verification.book] || 0) + 1;
      } catch (err) {
        const why = err.code === 'UNVERIFIED' ? err.message.split(': ').pop() : err.code;
        reasons[why] = (reasons[why] || 0) + 1;
      }
      if (++done % 50 === 0) { console.log(`  ...${done}/${pool.length}`); fetcher.flush(); }
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()]);
  fetcher.flush();
  console.log(`\nverified: ${ok}/${pool.length}`);
  console.log('by collection:', JSON.stringify(byBook));
  console.log('left out:', JSON.stringify(reasons));
})().catch((err) => { console.error(err); process.exit(1); });
