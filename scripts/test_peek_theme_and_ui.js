'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Testing Peek Window Theme & Modern UI Overhaul...');

const peekHtmlPath = path.join(__dirname, '..', 'windows', 'peek.html');
const peekHtml = fs.readFileSync(peekHtmlPath, 'utf8');

const mainJsPath = path.join(__dirname, '..', 'main.js');
const mainJs = fs.readFileSync(mainJsPath, 'utf8');

// 1. Check base.css link
assert(peekHtml.includes('<link rel="stylesheet" href="css/base.css">'), 'peek.html must link css/base.css');

// 2. Check dynamic theme and accent handling in JS
assert(peekHtml.includes("root.setAttribute('data-theme', theme)"), 'peek.html must dynamically set data-theme');
assert(peekHtml.includes("root.style.setProperty('--accent', accent)"), 'peek.html must dynamically set --accent');

// 3. Check modern UI elements in peek.html
assert(peekHtml.includes('pomo-ring-svg'), 'peek.html must include Pomodoro SVG ring');
assert(peekHtml.includes('cal-peek-date-badge'), 'peek.html must include Calendar date badge');
assert(peekHtml.includes('peek-progress-track'), 'peek.html must include universal progress track');
assert(peekHtml.includes('peek-live-dot'), 'peek.html must include pulsing live dot');
assert(peekHtml.includes('⤢ انقر للاستعادة'), 'peek.html must include sleek restore hint');

// 4. Check main.js win:showPeek enriched data payload
assert(mainJs.includes("currentTheme = settings.get('theme')"), 'main.js must read current theme');
assert(mainJs.includes("currentAccent = settings.get('accent')"), 'main.js must read current accent');
assert(mainJs.includes("theme: currentTheme"), 'main.js must send theme in peek:load');
assert(mainJs.includes("accent: currentAccent"), 'main.js must send accent in peek:load');
assert(mainJs.includes("pomodoro.snapshot()"), 'main.js must read live pomodoro snapshot');

console.log('🎉 ALL PEEK WINDOW THEME & MODERN UI TESTS PASSED 100%!');
