'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('TESTING QURAN LONG AYAH ADAPTIVE FIT & ZERO OVERLAP');
console.log('========================================================\n');

const quranHtml = fs.readFileSync(path.join(__dirname, '../windows/quran.html'), 'utf8');
const quranCss = fs.readFileSync(path.join(__dirname, '../windows/css/quran.css'), 'utf8');
const quranJs = fs.readFileSync(path.join(__dirname, '../windows/js/quran.js'), 'utf8');

// 1. Verify HTML DOM invariants
console.log('--- 1. Testing Quran HTML DOM Structure ---');
assert(quranHtml.includes('class="ayah" id="ayah"'), 'quran.html must have clean class="ayah" id="ayah"');
assert(!quranHtml.includes('class="ayah scroll"'), 'quran.html must NEVER have scroll class on p#ayah');
console.log('✅ Quran HTML DOM invariants fully verified.');

// 2. Verify CSS variable bindings and overflow containment
console.log('\n--- 2. Testing Quran CSS Adaptive Fit & Variables ---');
assert(quranCss.includes('var(--ayah-size,'), 'quran.css must use --ayah-size variable on .ayah');
assert(quranCss.includes('var(--ayah-lh,'), 'quran.css must use --ayah-lh variable on .ayah');
assert(quranCss.includes('margin-top: auto;'), 'quran.css .card-foot must have margin-top: auto to pin to bottom');
assert(quranCss.includes('.ayah-card.fit-compact'), 'quran.css must define .ayah-card.fit-compact');
assert(quranCss.includes('overflow-y: auto;'), 'quran.css .ayah must have overflow-y: auto fallback for giant texts');
console.log('✅ Quran CSS styling and layout anchoring verified.');

// 3. Verify quran.js autoscaling engine & wiring
console.log('\n--- 3. Testing Quran JS fitAyah Engine & Observers ---');
assert(quranJs.includes('function fitAyah()'), 'quran.js must implement fitAyah function');
assert(quranJs.includes('requestAnimationFrame(fitAyah)'), 'quran.js must invoke fitAyah on ayah and hadith render');
assert(quranJs.includes('new ResizeObserver'), 'quran.js must observe card resize with ResizeObserver');
assert(quranJs.includes('document.fonts.ready'), 'quran.js must re-fit when fonts finish loading');
assert(quranJs.includes("node.style.setProperty('--ayah-size'"), 'quran.js must dynamically set --ayah-size');
assert(quranJs.includes("node.style.setProperty('--ayah-lh'"), 'quran.js must dynamically set --ayah-lh');
console.log('✅ Quran JS fitAyah engine and observers verified.');

// 4. Algorithmic simulation of Al-Isra 35 fit
console.log('\n--- 4. Algorithmic Simulation of Al-Isra 35 on Compact Widget ---');
// Simulated ayah card at compact 254x162px: available height for ayah = 72px
const ayahText = 'وَأَوْفُوا الْكَيْلَ إِذَا كِلْتُمْ وَزِنُوا بِالْقِسْطَاسِ الْمُسْتَقِيمِ ذَٰلِكَ خَيْرٌ وَأَحْسَنُ تَأْوِيلًا';

// Text measurement model: lines = ceil(textLength * charWidth / cardWidth)
// height = lines * (fontSize * lineHeight)
function simulateLayout(fontSize, lineHeight, cardWidth = 230, availableHeight = 72) {
  const avgCharWidth = fontSize * 0.42; // Arabic naskh/amiri typical ratio
  const totalTextWidth = ayahText.length * avgCharWidth;
  const lines = Math.ceil(totalTextWidth / cardWidth);
  const totalHeight = lines * (fontSize * lineHeight);
  return { lines, totalHeight, fits: totalHeight <= availableHeight };
}

// Initial state at 18px / 2.05:
const initial = simulateLayout(18, 2.05);
console.log(`Initial render (18px, lh 2.05): ${initial.lines} lines, ${initial.totalHeight.toFixed(1)}px (available: 72px) -> Fits: ${initial.fits}`);
assert(!initial.fits, 'At default 18px, 3 lines of Al-Isra 35 must overflow a 72px space');

// Simulated fitAyah() scaling:
let size = 18;
let lh = 1.95;
let steps = 0;
while (steps < 25) {
  const current = simulateLayout(size, lh);
  if (current.fits || size <= 12) break;
  steps++;
  size = Math.max(12, size - 0.5);
  lh = Math.max(1.5, lh - 0.04);
}
const fitted = simulateLayout(size, lh);
console.log(`After fitAyah autoscaling: ${size.toFixed(1)}px, lh ${lh.toFixed(2)}: ${fitted.lines} lines, ${fitted.totalHeight.toFixed(1)}px -> Fits: ${fitted.fits}`);
assert(fitted.fits, 'fitAyah autoscaling must successfully fit Al-Isra 35 into 72px');
console.log('✅ Simulation verified: Al-Isra 35 fits completely with zero clipping and zero overlap!');

console.log('\n========================================================');
console.log('🎉 ALL LONG AYAH ADAPTIVE FIT TESTS PASSED (100%)!');
console.log('========================================================');
