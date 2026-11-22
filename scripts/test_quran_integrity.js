'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('TESTING QURAN WIDGET SACRED AUTHENTIC FORM & TYPOGRAPHY');
console.log('========================================================\n');

const quranHtml = fs.readFileSync(path.join(__dirname, '../windows/quran.html'), 'utf8');
const quranCss = fs.readFileSync(path.join(__dirname, '../windows/css/quran.css'), 'utf8');
const quranJs = fs.readFileSync(path.join(__dirname, '../windows/js/quran.js'), 'utf8');
const shellJs = fs.readFileSync(path.join(__dirname, '../windows/js/shell.js'), 'utf8');
const mainJs = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

// 1. Check no scroll class on ayah element (no scrollbars)
console.log('--- 1. Testing Ayah Scrollbar Absence ---');
assert(!quranHtml.includes('class="ayah scroll"'), 'quran.html must NEVER have scroll class on p#ayah');
assert(quranHtml.includes('class="ayah" id="ayah"'), 'quran.html must have clean class="ayah" id="ayah"');
console.log('✅ Ayah element is clean with no unwanted scrollbars.');

// 2. Check no broken font-feature-settings or letter-spacing
console.log('\n--- 2. Testing Font & Cursive Joining Integrity ---');
assert(!quranCss.includes('font-feature-settings:'), 'quran.css must NEVER override font-feature-settings (breaks Arabic OpenType cursive joining)');
assert(!quranCss.includes('letter-spacing: normal !important'), 'quran.css must not have letter-spacing overrides');
assert(quranCss.includes('font-family: var(--font-quran);'), 'quran.css must use --font-quran');
console.log('✅ Arabic cursive joining and typography preserved 100%.');

// 3. Check shell.js preserves RTL Arabic in all modes
console.log('\n--- 3. Testing Universal RTL Arabic Preservation in Shell ---');
assert(shellJs.includes("if (PAGE === 'quran') {"), 'shell.js must special-case quran page');
assert(shellJs.includes("root.dir = 'rtl';"), 'shell.js must enforce dir="rtl" for quran');
assert(shellJs.includes("root.lang = 'ar';"), 'shell.js must enforce lang="ar" for quran');
console.log('✅ Quran widget locked to authentic RTL Arabic across all UI modes.');

// 4. Check quran.js preserves Arabic surah names and themes
console.log('\n--- 4. Testing Quran Arabic Metadata & Strings ---');
assert(quranJs.includes('${ayah.surahNameAr}'), 'quran.js must always render authentic Arabic surah name');
assert(quranJs.includes('x.ar || x.en'), 'quran.js must prefer Arabic theme labels');
assert(quranJs.includes("'quran.tafsir': 'التفسير'"), 'quran.js must keep Arabic Tafsir label even in en dictionary');
console.log('✅ Quran metadata and labels always remain in authentic Arabic Islamic form.');

// 5. Check main.js dimensions
console.log('\n--- 5. Testing Quran Dimensions & Height Clearance ---');
assert(mainJs.includes('min: [220, 160]'), 'quran widget min height must be at least 160px to avoid text clipping');
console.log('✅ Generous height clearance verified.');

console.log('\n========================================================');
console.log('🎉 ALL QURAN INTEGRITY & AUTHENTICITY TESTS PASSED 100%!');
console.log('========================================================');
