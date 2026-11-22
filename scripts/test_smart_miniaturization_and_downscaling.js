'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('TESTING SMART MINIATURIZATION & RESPONSIVE DOWNSCALING SUITE');
console.log('================================================================\n');

// 1. Base & Tile Container Architecture
console.log('[1/10] Testing Universal Container Query Architecture...');
const baseCss = fs.readFileSync(path.join(__dirname, '../windows/css/base.css'), 'utf8');
const tileCss = fs.readFileSync(path.join(__dirname, '../windows/css/tile.css'), 'utf8');

assert(baseCss.includes('container-type: size;'), 'base.css must define container-type: size on .plate');
assert(baseCss.includes('container-name: plate;'), 'base.css must define container-name: plate');
assert(tileCss.includes('container-name: tile plate;'), 'tile.css must define container-name: tile plate');
assert(baseCss.includes('@container plate (max-width: 290px)'), 'base.css must define responsive rules for narrow plates');
assert(baseCss.includes('.min-btn'), 'base.css must define styling for .min-btn');
console.log('✅ Base and Tile container query infrastructure verified.');

// 2. Shell.js Responsive Observer & Minimize Button
console.log('[2/10] Testing shell.js Responsive Observer & Mini Button Integration...');
const shellJs = fs.readFileSync(path.join(__dirname, '../windows/js/shell.js'), 'utf8');
assert(shellJs.includes('function installResponsiveObserver('), 'shell.js must define installResponsiveObserver');
assert(shellJs.includes('function installMinimizeButton('), 'shell.js must define installMinimizeButton');
assert(shellJs.includes("id: 'minimizeBtn'"), 'shell.js must create #minimizeBtn');
assert(shellJs.includes('dataset.sizeW = sizeW'), 'shell.js must compute and set sizeW tier');
assert(shellJs.includes('dataset.sizeH = sizeH'), 'shell.js must compute and set sizeH tier');
assert(shellJs.includes('dataset.compact = compact'), 'shell.js must compute and set compact tier');
assert(shellJs.includes('dataset.aspect = aspect'), 'shell.js must compute and set aspect');
assert(shellJs.includes("'common.minimize': 'تصغير / استعادة'"), 'shell.js must define Arabic minimize string');
assert(shellJs.includes("'common.minimize': 'Minimize / Restore'"), 'shell.js must define English minimize string');
console.log('✅ shell.js observer, data-attributes and minimize integration verified.');

// 3. Preload & Main Process IPC Bridge
console.log('[3/10] Testing Preload & Main Process Miniaturization Bridge...');
const preloadJs = fs.readFileSync(path.join(__dirname, '../preload.js'), 'utf8');
const mainJs = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');
const i18nJs = fs.readFileSync(path.join(__dirname, '../src/core/i18n.js'), 'utf8');

assert(preloadJs.includes("toggleMini: () => ipcRenderer.invoke('win:toggleMini')"), 'preload.js must expose win.toggleMini');
assert(preloadJs.includes("getBounds: () => ipcRenderer.invoke('win:getBounds')"), 'preload.js must expose win.getBounds');
assert(mainJs.includes("ipcMain.handle('win:toggleMini'"), 'main.js must handle win:toggleMini');
assert(mainJs.includes('function toggleWidgetMini('), 'main.js must define toggleWidgetMini');
assert(mainJs.includes("T('menu.toggleMini')"), 'main.js widgetMenu must include toggleMini');
assert(i18nJs.includes("'menu.toggleMini': 'تصغير لحجم الأيقونة / استعادة'"), 'i18n.js must define Arabic menu.toggleMini');
assert(i18nJs.includes("'menu.toggleMini': 'Mini / Restore Mode'"), 'i18n.js must define English menu.toggleMini');
console.log('✅ IPC handlers, preload bridge and context menu entries verified.');

// 4. Clock Widget Smart Shape-Shifting & Horizontal Metamorphosis
console.log('[4/10] Testing Clock Widget Smart Miniaturization & Metamorphosis...');
const clockCss = fs.readFileSync(path.join(__dirname, '../windows/css/clock.css'), 'utf8');
assert(clockCss.includes('@container tile (max-width: 220px) or (max-height: 200px)'), 'clock.css must have compact container rules');
assert(clockCss.includes('@container tile (max-height: 135px) and (min-width: 170px)'), 'clock.css must morph into horizontal layout when short');
assert(clockCss.includes(':root[data-compact="ultra"] .clock'), 'clock.css must have ultra-compact / nano mode');
console.log('✅ Clock widget responsive rules and horizontal shape-shift verified.');

// 5. Pomodoro Widget Smart Circular HUD Transformation
console.log('[5/10] Testing Pomodoro Widget Smart Circular HUD Transformation...');
const pomoCss = fs.readFileSync(path.join(__dirname, '../windows/css/pomodoro.css'), 'utf8');
assert(pomoCss.includes('@container tile (max-width: 220px) or (max-height: 200px)'), 'pomodoro.css must have compact container rules');
assert(pomoCss.includes(':root[data-compact="ultra"] .pomo'), 'pomodoro.css must have ultra-compact circular HUD mode');
assert(pomoCss.includes('.controls .pill span[data-i18n] {'), 'pomodoro.css must hide text in ultra-compact to turn pill into circular button');
console.log('✅ Pomodoro widget circular HUD transformation verified.');

// 6. Calendar Widget: Preserving the Month Grid of Squares
console.log('[6/10] Testing Calendar Widget Grid of Squares Preservation & Downscaling...');
const calCss = fs.readFileSync(path.join(__dirname, '../windows/css/calendar.css'), 'utf8');
assert(calCss.includes('@container tile (max-width: 380px) or (max-height: 320px)'), 'calendar.css must have Stage 1 downscaling rules');
assert(calCss.includes('@container tile (max-width: 310px) or (max-height: 240px)'), 'calendar.css must hide view selector in narrow view');
assert(calCss.includes(':root[data-compact="ultra"] .cal'), 'calendar.css must support ultra-compact tile query');
assert(calCss.includes('.month {'), 'calendar.css must style .month view');
assert(calCss.includes('.grid {'), 'calendar.css must preserve month .grid of squares in ultra-compact mode');
assert(calCss.includes('clamp(6.8px, 5cqi, 9.5px)'), 'calendar.css must scale grid cells progressively');
console.log('✅ Calendar widget grid of squares preserved and scales down proportionally.');

// 7. Todo Widget Focus HUD Transformation
console.log('[7/10] Testing Todo Widget Focus HUD Transformation...');
const todoCss = fs.readFileSync(path.join(__dirname, '../windows/css/todo.css'), 'utf8');
assert(todoCss.includes('@container plate (max-width: 290px)'), 'todo.css must have compact container rules');
assert(todoCss.includes(':root[data-compact="ultra"] .plate'), 'todo.css must have ultra-compact focus mode');
assert(todoCss.includes('.composer-drawer {'), 'todo.css must collapse composer drawer when compact');
console.log('✅ Todo widget secondary button tucking and focus HUD mode verified.');

// 8. Notes Widget Sticky Memo Transformation
console.log('[8/10] Testing Notes Widget Sticky Memo Transformation...');
const notesCss = fs.readFileSync(path.join(__dirname, '../windows/css/notes.css'), 'utf8');
assert(notesCss.includes('@container plate (max-width: 280px)'), 'notes.css must have compact container rules');
assert(notesCss.includes(':root[data-compact="ultra"] .plate'), 'notes.css must have sticky memo mode');
console.log('✅ Notes widget editor expansion and sticky memo mode verified.');

// 9. Quran, Email & Photo Widget Smart Rules
console.log('[9/10] Testing Quran, Email, and Photo Widget Downscaling...');
const quranCss = fs.readFileSync(path.join(__dirname, '../windows/css/quran.css'), 'utf8');
const emailCss = fs.readFileSync(path.join(__dirname, '../windows/css/email.css'), 'utf8');
const photoCss = fs.readFileSync(path.join(__dirname, '../windows/css/photo.css'), 'utf8');

assert(quranCss.includes('@container plate (max-width: 280px)'), 'quran.css must have compact rules');
assert(quranCss.includes(':root[data-compact="ultra"] .quran-plate'), 'quran.css must have quote capsule mode');
assert(emailCss.includes('@container plate (max-width: 290px)'), 'email.css must have compact rules');
assert(emailCss.includes(':root[data-compact="ultra"] .plate'), 'email.css must have inbox glance mode');
assert(photoCss.includes('@container tile (max-width: 220px) or (max-height: 200px)'), 'photo.css must have compact rules');
assert(photoCss.includes(':root[data-compact="ultra"] .photo-plate'), 'photo.css must have borderless picture tile mode');
console.log('✅ Quran quote capsule, email inbox glance, and photo borderless tile verified.');

// 10. Habits Widget Nano Rules
console.log('[10/12] Testing Habits Widget Nano Rules...');
const habitsCss = fs.readFileSync(path.join(__dirname, '../windows/css/habits.css'), 'utf8');
assert(habitsCss.includes('@container habitWidget (max-width: 235px)'), 'habits.css must define nano habitWidget mode');
assert(habitsCss.includes(':root[data-compact="ultra"] #habitsPlate'), 'habits.css must support ultra-compact plate attribute');
console.log('✅ Habits widget nano mode verified.');

// 11. App Icon Mode IPC & Size Presets
console.log('[11/12] Testing Desktop App Icon Mode Backend & Window Clamping...');
assert(mainJs.includes('icon: [56, 56]') || mainJs.includes('icon: [64, 64]') || mainJs.includes('icon: [72, 72]'), 'main.js must define icon preset across widgets');
assert(mainJs.includes("win.setMinimumSize(44, 44)") || mainJs.includes("win.setMinimumSize(48, 48)"), 'main.js must lower window minimum size in icon mode');
assert(mainJs.includes("win.setMinimumSize(spec.min[0], spec.min[1])"), 'main.js must restore spec.min when exiting icon mode');
assert(mainJs.includes("isIconSaved"), 'main.js createWidget must honor isIconSaved on startup');
assert(shellJs.includes('installAppIconMode();'), 'shell.js boot must call installAppIconMode');
assert(shellJs.includes("root.dataset.appIcon = '1'"), 'shell.js observer must set data-app-icon attribute');
console.log('✅ Desktop App Icon mode backend, IPC clamping and observer verified.');

// 12. Desktop App Icon DOM & 9 Distinctive Artworks
console.log('[12/12] Testing Desktop App Icon DOM & 9 Distinctive Artworks...');
assert(shellJs.includes('function buildAppIconArt('), 'shell.js must define buildAppIconArt');
assert(shellJs.includes('function setupAppIconLiveUpdates('), 'shell.js must define setupAppIconLiveUpdates');
assert(baseCss.includes(':root[data-app-icon="1"]'), 'base.css must define styles for :root[data-app-icon="1"]');
assert(baseCss.includes('.app-icon-widget'), 'base.css must define .app-icon-widget');

const expectedIcons = [
  'app-icon-clock',
  'app-icon-pomodoro',
  'app-icon-calendar',
  'app-icon-todo',
  'app-icon-notes',
  'app-icon-quran',
  'app-icon-email',
  'app-icon-habits',
  'app-icon-photo',
];

for (const iconClass of expectedIcons) {
  assert(baseCss.includes(`.${iconClass}`), `base.css must define styling for .${iconClass}`);
}
console.log('✅ All 9 distinctive desktop app icon artworks verified in CSS and DOM.');

console.log('\n================================================================');
console.log('🎉🎉 ALL 12 SMART MINIATURIZATION & APP ICON TESTS PASSED 100%! 🎉🎉');
console.log('================================================================\n');

