'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Testing Radical Holistic Themes & Fluid Widget Resizing...');

// 1. Check habits.css for container queries and responsive sizing
const habitsCss = fs.readFileSync(path.join(__dirname, '../windows/css/habits.css'), 'utf8');
assert(habitsCss.includes('container-type: inline-size;'), 'habits.css must declare container-type: inline-size');
assert(habitsCss.includes('container-name: habitWidget;'), 'habits.css must declare container-name: habitWidget');
assert(habitsCss.includes('@container habitWidget (max-width: 340px)'), 'habits.css must have container query for max-width: 340px');
assert(habitsCss.includes('@container habitWidget (max-width: 280px)'), 'habits.css must have container query for max-width: 280px');
assert(habitsCss.includes('@container habitWidget (min-width: 400px)'), 'habits.css must have container query for min-width: 400px');
assert(habitsCss.includes('@media (max-height: 440px)'), 'habits.css must have height adaptability for small heights');
console.log('✅ Widget container queries & responsive rules verified.');

// 2. Check authentic pencil "✕" checkmark in habits.css for dotgrid, graphpaper & sketch
assert(habitsCss.includes("content: '✕';"), 'habits.css must use authentic pencil ✕ checkmarks');
assert(habitsCss.includes('body.theme-dotgrid .h-check-btn.checked::after'), 'habits.css must define dotgrid checkmark');
assert(habitsCss.includes('body.theme-graphpaper .h-check-btn.checked::after'), 'habits.css must define graphpaper checkmark');
assert(habitsCss.includes('body.theme-sketch .h-check-btn.checked::after'), 'habits.css must define sketch checkmark');
console.log('✅ Authentic checkmark glyphs (✕) verified in habits.css.');

// 3. Check habits-dashboard.html for theme selector
const dashHtml = fs.readFileSync(path.join(__dirname, '../windows/habits-dashboard.html'), 'utf8');
assert(dashHtml.includes('id="dashThemeSelect"'), 'habits-dashboard.html must have #dashThemeSelect dropdown');
assert(dashHtml.includes('value="dotgrid"'), 'habits-dashboard.html must have dotgrid option');
assert(dashHtml.includes('value="graphpaper"'), 'habits-dashboard.html must have graphpaper option');
assert(dashHtml.includes('value="sketch"'), 'habits-dashboard.html must have sketch option');
console.log('✅ Theme picker selector verified in dashboard HTML.');

// 4. Check habits-dashboard.css for comprehensive theme definitions
const dashCss = fs.readFileSync(path.join(__dirname, '../windows/css/habits-dashboard.css'), 'utf8');
const themes = [
  'theme-dotgrid', 'theme-graphpaper', 'theme-sketch', 'theme-notebook',
  'theme-craft', 'theme-oled', 'theme-minimal-light', 'theme-emerald',
  'theme-ocean', 'theme-amber'
];
themes.forEach(t => {
  assert(dashCss.includes(`body.${t}`), `habits-dashboard.css must define styling for body.${t}`);
});
assert(dashCss.includes('.dash-theme-select'), 'habits-dashboard.css must style .dash-theme-select');
console.log('✅ All 10 holistic theme definitions verified in dashboard CSS.');

// 5. Check habits-dashboard.js for applyDashboardTheme, getThemeChartPalette, and getThemeDoneGlyph
const dashJs = fs.readFileSync(path.join(__dirname, '../windows/js/habits-dashboard.js'), 'utf8');
assert(dashJs.includes('function applyDashboardTheme('), 'habits-dashboard.js must define applyDashboardTheme');
assert(dashJs.includes('function getThemeChartPalette('), 'habits-dashboard.js must define getThemeChartPalette');
assert(dashJs.includes('function getThemeDoneGlyph('), 'habits-dashboard.js must define getThemeDoneGlyph');
assert(dashJs.includes('#dashThemeSelect'), 'habits-dashboard.js must listen to #dashThemeSelect');
console.log('✅ Dynamic theme palettes & glyph resolution verified in dashboard JS.');

// 6. Check habits.js for getThemeDoneGlyph
const habitsJs = fs.readFileSync(path.join(__dirname, '../windows/js/habits.js'), 'utf8');
assert(habitsJs.includes('function getThemeDoneGlyph('), 'habits.js must define getThemeDoneGlyph');
console.log('✅ getThemeDoneGlyph verified in widget JS.');

console.log('🎉 ALL RADICAL THEME & RESIZING TESTS PASSED 100%!');
