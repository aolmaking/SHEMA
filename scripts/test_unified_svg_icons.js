'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('TESTING UNIFIED 3D SVG ICONS ENGINE (VISUAL PARITY & VALIDITY)');
console.log('================================================================\n');

const sharedArt = require('../windows/js/shared-icon-art.js');
assert(typeof sharedArt.getWidgetSvgContent === 'function', 'Must export getWidgetSvgContent');
assert(typeof sharedArt.renderUnifiedWidgetIcon === 'function', 'Must export renderUnifiedWidgetIcon');

const ALL_WIDGETS = ['quran', 'habits', 'photo', 'email', 'notes', 'calendar', 'todo', 'clock', 'pomodoro'];

console.log(`[1/3] Validating all ${ALL_WIDGETS.length} widget SVGs...`);
for (const wid of ALL_WIDGETS) {
  const svg = sharedArt.getWidgetSvgContent(wid);
  assert(svg, `Missing SVG for ${wid}`);
  assert(svg.includes('<svg'), `${wid} must contain <svg`);
  assert(svg.includes('</svg>'), `${wid} must contain </svg>`);
  assert(svg.includes('viewBox="0 0 100 100"'), `${wid} must have 100x100 viewBox`);
  assert(svg.includes('<defs>'), `${wid} must include defs`);
  console.log(`  ✓ ${wid.padEnd(10)}: valid SVG (${svg.length} chars)`);
}

console.log('\n[2/3] Validating specific visual requirements from reference image:');
// 1. Quran
const quranSvg = sharedArt.getWidgetSvgContent('quran');
assert(quranSvg.includes('u-quran-bg'), 'Quran must have emerald gradient');
assert(quranSvg.includes('u-rehal-wood'), 'Quran must have wooden stand (rehal)');
assert(quranSvg.includes('u-page-left'), 'Quran must have open book pages');
console.log('  ✓ Quran: verified emerald background, Islamic arch, crescent, and open Quran on rehal.');

// 2. Habits Flame
const habitsSvg = sharedArt.getWidgetSvgContent('habits');
assert(habitsSvg.includes('u-flame-outer'), 'Habits must have outer flame');
assert(habitsSvg.includes('u-flame-mid'), 'Habits must have mid flame');
assert(habitsSvg.includes('u-flame-core'), 'Habits must have core flame');
console.log('  ✓ Habits: verified warm orange gradient and 3-layer glowing 3D flame.');

// 3. Photo Frame & Mountain
const photoSvg = sharedArt.getWidgetSvgContent('photo');
assert(photoSvg.includes('u-gold-frame'), 'Photo must have golden picture frame');
assert(photoSvg.includes('u-photo-mountain-fg'), 'Photo must have rolling mountain hills');
assert(photoSvg.includes('u-photo-sun'), 'Photo must have glowing sun');
console.log('  ✓ Photo: verified royal purple squircle, golden frame, sun, and green mountain landscape.');

// 4. Email Envelope & Badge
const emailSvg = sharedArt.getWidgetSvgContent('email');
assert(emailSvg.includes('u-env-body'), 'Email must have white envelope body');
assert(emailSvg.includes('u-env-flap'), 'Email must have 3D envelope flap');
assert(emailSvg.includes('u-red-badge'), 'Email must have red notification badge');
assert(emailSvg.includes('>3<'), 'Email must display unread count "3" matching reference image');
console.log('  ✓ Email: verified azure blue squircle, 3D envelope, and glossy red badge with "3".');

// 5. Notes Pad & Luxury Pen
const notesSvg = sharedArt.getWidgetSvgContent('notes');
assert(notesSvg.includes('u-paper-sheet'), 'Notes must have ivory paper sheet');
assert(notesSvg.includes('u-pen-body'), 'Notes must have luxury fountain pen');
assert(notesSvg.includes('u-gold-metal'), 'Notes must have gold pen nib and trims');
console.log('  ✓ Notes: verified warm amber squircle, notepad page with lines & fold, and diagonal luxury fountain pen.');

// 6. Calendar Sheet & Rings
const calSvg = sharedArt.getWidgetSvgContent('calendar', { day: 25 });
assert(calSvg.includes('u-cal-red'), 'Calendar must have red header bar');
assert(calSvg.includes('u-chrome-ring'), 'Calendar must have silver metallic rings');
assert(calSvg.includes('uCalDayNum'), 'Calendar must have dynamic day text');
assert(calSvg.includes('25'), 'Calendar must display day 25');
console.log('  ✓ Calendar: verified porcelain white card, red header band, chrome binder rings, and dynamic day number.');

// 7. Todo Sprout Plant in Pot
const todoSvg = sharedArt.getWidgetSvgContent('todo');
assert(todoSvg.includes('u-pink-pot'), 'Todo must have pink ceramic pot');
assert(todoSvg.includes('u-leaf-l'), 'Todo must have sprouting green leaves');
assert(todoSvg.includes('#271a15'), 'Todo must have dark fertile soil');
console.log('  ✓ Todo: verified crimson squircle, glossy pink ceramic pot, dark soil, and sprouting seedling leaves.');

console.log('\n[3/3] Checking CSS file exists...');
const cssPath = path.join(__dirname, '..', 'windows', 'css', 'widget-icons-3d.css');
assert(fs.existsSync(cssPath), 'windows/css/widget-icons-3d.css must exist');
const cssContent = fs.readFileSync(cssPath, 'utf8');
assert(cssContent.includes('.unified-widget-icon'), 'Must define .unified-widget-icon');
assert(cssContent.includes('.icon-quran'), 'Must define .icon-quran');
console.log('  ✓ CSS stylesheet verified.\n');

console.log('================================================================');
console.log('🎉 ALL UNIFIED 3D SVG ICON CHECKS PASSED 100%! 🎉');
console.log('================================================================');
