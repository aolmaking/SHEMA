const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('TESTING HABITS DASHBOARD HEADER CLEANUP & WINDOW RADIUS');
console.log('========================================================\n');

const htmlPath = path.join(__dirname, '../windows/habits-dashboard.html');
const cssPath = path.join(__dirname, '../windows/css/habits-dashboard.css');
const jsPath = path.join(__dirname, '../windows/js/habits-dashboard.js');

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');

// 1. Verify Window Plate & Border-Radius
console.log('--- 1. Testing Window Plate & Border Radius Integration ---');
assert.ok(html.includes('class="dash-window plate window-plate"'), 'HTML must have plate window-plate classes on dash-window');
assert.ok(css.includes('background: transparent !important;'), 'CSS body must be transparent to allow rounded window borders');
assert.ok(css.includes('--radius-window'), 'CSS .dash-window must link to --radius-window');
assert.ok(css.includes('overflow: hidden;'), 'CSS .dash-window must have overflow hidden to clip contents to border radius');
console.log('✅ Window plate and border-radius rules verified 100%');

// 2. Verify Header Streamlining
console.log('--- 2. Testing Header Architecture & Streamlined Controls ---');
assert.ok(html.includes('id="btnPrevMonth"'), 'Prev month button exists');
assert.ok(html.includes('id="btnNextMonth"'), 'Next month button exists');
assert.ok(html.includes('id="btnTodayMonth"'), 'Today month button exists');
assert.ok(html.includes('id="dashThemeSelect"'), 'Theme select exists');
assert.ok(html.includes('id="btnHeaderLang"'), 'Language button exists');
assert.ok(html.includes('id="btnHeaderNewHabit"'), 'New habit button exists');
assert.ok(html.includes('id="btnDashClose"'), 'Close button exists');
assert.ok(!html.includes('id="btnHeaderWaReport"'), 'Redundant WhatsApp report button removed from header');
console.log('✅ Streamlined header controls verified 100%');

// 3. Verify Removal of Cartoonish / Cursive Styles
console.log('--- 3. Testing Removal of Hand-Drawn Wacky Radius & Segoe Print ---');
assert.ok(!css.includes('255px 15px 225px 15px'), 'Hand-drawn squiggly border-radius must be removed');
assert.ok(!css.includes("'Segoe Print'"), 'Cursive Segoe Print overrides must be removed');
console.log('✅ Elimination of cartoonish styles verified 100%');

// 4. Verify Translations & Language Label
console.log('--- 4. Testing Translations and Compact Labels ---');
assert.ok(js.includes("'habits.dashTitle': 'لوحة تحليلات العادات والبوليت جورنال'"), 'Arabic title defined');
assert.ok(js.includes("'habits.dashTitle': 'Habits & Life Intelligence'"), 'English concise title defined');
assert.ok(js.includes("lang() === 'en' ? 'عربي' : 'EN'"), 'Compact EN/عربي label defined');
console.log('✅ Translations and language labels verified 100%');

// 5. Verify Heatmap Visibility and Cell Contrast
console.log('--- 5. Testing Heatmap Cell Contrast & Theme Variables ---');
assert.ok(css.includes('--hm-cell-bg-0'), 'Heatmap must define level 0 background token');
assert.ok(css.includes('--hm-cell-border-0'), 'Heatmap must define level 0 border token');
assert.ok(css.includes('border: 1px solid var(--hm-cell-border-0)'), 'Heatmap cells must have explicit border for high contrast');
assert.ok(css.includes('body.theme-notebook'), 'Theme notebook overrides defined');
assert.ok(css.includes('--hm-cell-bg-0: #ede7d8;'), 'Theme notebook must define visible cream background for empty cells');

const baseCss = fs.readFileSync(path.join(__dirname, '../windows/css/base.css'), 'utf8');
assert.ok(!baseCss.includes('255px 15px 225px 15px'), 'base.css must not have wacky squiggly border radius on notebook plate');
assert.ok(!baseCss.includes("font-ui: 'Segoe Print'"), 'base.css must not use Segoe Print for font-ui');
console.log('✅ Heatmap visibility and contrast verified 100%');

// 6. Verify Select Dropdowns Theming & Contrast
console.log('--- 6. Testing Select Dropdown Theming & Option Styles ---');
assert.ok(css.includes('body.theme-notebook .dash-select'), 'Theme notebook must style .dash-select');
assert.ok(css.includes('body.theme-notebook .dash-select option'), 'Theme notebook must style .dash-select option with white background');
assert.ok(css.includes('background-image: url("data:image/svg+xml'), 'Custom SVG chevron configured for .dash-select');
console.log('✅ Select dropdown theming verified 100%');

console.log('\n========================================================');
console.log('🎉 ALL HABITS DASHBOARD HEADER & RADIUS TESTS PASSED! 🎉');
console.log('========================================================');

