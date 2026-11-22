'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('Testing newly added user features...');

// 1. Quran Corpus Expansion
const { AYAT } = require('../src/quran/corpus');
console.log(`✓ Total Ayat in corpus: ${AYAT.length}`);
assert(AYAT.length >= 900, `Expected at least 900 ayat, found ${AYAT.length}`);

// Check that quran.html has prev and next buttons
const quranHtml = fs.readFileSync(path.join(__dirname, '../windows/quran.html'), 'utf8');
assert(quranHtml.includes('id="prevAyahBtn"'), 'Missing prevAyahBtn in quran.html');
assert(quranHtml.includes('id="nextAyahBtn"'), 'Missing nextAyahBtn in quran.html');
console.log('✓ Quran browsing buttons verified in quran.html');

// 2. Sheen Radius control
const settingsHtml = fs.readFileSync(path.join(__dirname, '../windows/settings.html'), 'utf8');
assert(settingsHtml.includes('id="sheenRadius"'), 'Missing sheenRadius in settings.html');
assert(settingsHtml.includes('id="sheenRadiusOut"'), 'Missing sheenRadiusOut in settings.html');

const settingsJs = fs.readFileSync(path.join(__dirname, '../windows/js/settings.js'), 'utf8');
assert(settingsJs.includes('sheenRadius: 240'), 'Missing sheenRadius default in settings.js');
assert(settingsJs.includes("'#sheenRadius'"), 'Missing sheenRadius wiring in settings.js');
assert(settingsJs.includes("'s.sheenRadius'"), 'Missing s.sheenRadius i18n key in settings.js');

const shellJs = fs.readFileSync(path.join(__dirname, '../windows/js/shell.js'), 'utf8');
assert(shellJs.includes('--sheen-radius'), 'Missing --sheen-radius in shell.js');

const baseCss = fs.readFileSync(path.join(__dirname, '../windows/css/base.css'), 'utf8');
assert(baseCss.includes('var(--sheen-radius, 240px)'), 'Missing var(--sheen-radius) in base.css');
console.log('✓ Sheen / halo radius controls verified across CSS, shell.js and settings');

// 3. Photo adjustments
assert(settingsHtml.includes('id="photoZoom"'), 'Missing photoZoom in settings.html');
assert(settingsHtml.includes('id="photoPosX"'), 'Missing photoPosX in settings.html');
assert(settingsHtml.includes('id="photoPosY"'), 'Missing photoPosY in settings.html');
assert(settingsHtml.includes('id="photoRotate"'), 'Missing photoRotate in settings.html');
assert(settingsHtml.includes('id="photoBrightness"'), 'Missing photoBrightness in settings.html');
assert(settingsHtml.includes('id="photoContrast"'), 'Missing photoContrast in settings.html');
assert(settingsHtml.includes('id="photoGrayscale"'), 'Missing photoGrayscale in settings.html');
assert(settingsHtml.includes('id="photoShape"'), 'Missing photoShape in settings.html');
assert(settingsHtml.includes('id="photoResetAdjustBtn"'), 'Missing photoResetAdjustBtn in settings.html');

const photoHtml = fs.readFileSync(path.join(__dirname, '../windows/photo.html'), 'utf8');
assert(photoHtml.includes('id="adjustBtn"'), 'Missing adjustBtn in photo.html');
assert(photoHtml.includes('id="adjustBar"'), 'Missing adjustBar in photo.html');

const photoJs = fs.readFileSync(path.join(__dirname, '../windows/js/photo.js'), 'utf8');
assert(photoJs.includes('applyAdjustments'), 'Missing applyAdjustments in photo.js');
assert(photoJs.includes('isDraggingPan'), 'Missing pan dragging logic in photo.js');
assert(photoJs.includes('wheel'), 'Missing mouse wheel zoom in photo.js');

const photoCss = fs.readFileSync(path.join(__dirname, '../windows/css/photo.css'), 'utf8');
assert(photoCss.includes('--photo-zoom'), 'Missing --photo-zoom in photo.css');
assert(photoCss.includes('photo-adjust-bar'), 'Missing photo-adjust-bar styles in photo.css');
console.log('✓ Photo fine-grained controls, wheel zoom, and drag-pan verified');

console.log('\n🎉 ALL NEW FEATURES TESTED & PASSING 100%! 🎉');
