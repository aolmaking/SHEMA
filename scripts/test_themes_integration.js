'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('Testing Themes Integration & CSS Architecture...');

const habitsHtml = fs.readFileSync(path.join(__dirname, '../windows/habits.html'), 'utf8');
const settingsHtml = fs.readFileSync(path.join(__dirname, '../windows/settings.html'), 'utf8');
const habitsCss = fs.readFileSync(path.join(__dirname, '../windows/css/habits.css'), 'utf8');
const habitsJs = fs.readFileSync(path.join(__dirname, '../windows/js/habits.js'), 'utf8');

const THEMES = [
  // Pencil & Sketchbook styles
  'dotgrid',
  'graphpaper',
  'sketch',
  'notebook',
  'craft',
  // Modern & Standard styles
  'dark-modern',
  'oled',
  'minimal-light',
  'emerald',
  'ocean',
  'amber',
];

// 1. Verify all themes exist in settings.html
for (const th of THEMES) {
  assert(settingsHtml.includes(`value="${th}"`), `settings.html must contain theme option: ${th}`);
}
console.log(`✅ All ${THEMES.length} themes present in settings.html.`);

// 2. Verify all themes exist in habits.html
for (const th of THEMES) {
  assert(habitsHtml.includes(`value="${th}"`) || habitsHtml.includes(`data-theme="${th}"`), `habits.html must contain theme: ${th}`);
}
console.log(`✅ All ${THEMES.length} themes present in habits.html.`);

// 3. Verify CSS classes exist for all custom themes
const CSS_THEME_CLASSES = [
  'theme-dotgrid',
  'theme-graphpaper',
  'theme-sketch',
  'theme-notebook',
  'theme-craft',
  'theme-oled',
  'theme-minimal-light',
  'theme-emerald',
  'theme-ocean',
  'theme-amber',
];

for (const cls of CSS_THEME_CLASSES) {
  assert(habitsCss.includes(`body.${cls}`), `habits.css must define styles for body.${cls}`);
}
console.log(`✅ All ${CSS_THEME_CLASSES.length} theme CSS classes defined in habits.css.`);

// 4. Verify JS wires theme dropdown and segmented buttons
assert(habitsJs.includes('#popoverThemeSelect'), 'habits.js must wire #popoverThemeSelect');
assert(habitsJs.includes('theme-dotgrid'), 'habits.js must clear theme-dotgrid');
assert(habitsJs.includes('theme-graphpaper'), 'habits.js must clear theme-graphpaper');
assert(habitsJs.includes('theme-sketch'), 'habits.js must clear theme-sketch');

console.log('🎉 ALL THEME VALIDATION CHECKS PASSED (100%)!');
