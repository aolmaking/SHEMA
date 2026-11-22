'use strict';
/**
 * Test Suite: Clock Widget UI Evolution, Maximum Transparency, Alarms & Timer
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('TESTING CLOCK WIDGET EVOLUTION: UI, MAX TRANSPARENCY, ALARM & TIMER');
console.log('================================================================\n');

// 1. Verify clock.html DOM structure
console.log('[1/7] Testing clock.html DOM structure & components...');
const htmlPath = path.join(__dirname, '../windows/clock.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

assert(htmlContent.includes('id="transparencyBtn"'), 'Must have transparency toggle button in actions');
assert(htmlContent.includes('data-transparency="max"'), 'Must have max transparency applied by default');
assert(htmlContent.includes('id="clockNav"'), 'Must have clock navigation tablist');
assert(htmlContent.includes('data-tab="clock"'), 'Must have clock tab');
assert(htmlContent.includes('data-tab="alarm"'), 'Must have alarm tab');
assert(htmlContent.includes('data-tab="timer"'), 'Must have timer tab');
assert(htmlContent.includes('id="viewClock"'), 'Must have clock view container');
assert(htmlContent.includes('id="viewAlarm"'), 'Must have alarm view container');
assert(htmlContent.includes('id="viewTimer"'), 'Must have timer view container');
assert(htmlContent.includes('id="ringingOverlay"'), 'Must have alarm ringing overlay');
assert(htmlContent.includes('id="alarmTaskSelect"'), 'Must have task linking selector for future/present task integration');
assert(htmlContent.includes('id="timerSvg"'), 'Must have timer circular SVG progress');
assert(htmlContent.includes('id="deleteAlarmBtn"'), 'Must have dedicated delete button in alarm drawer');
assert(htmlContent.includes('id="btnHourUp"'), 'Must have stepper buttons for hours');
assert(htmlContent.includes('class="alarm-hero-time-card"'), 'Must have organized hero time picker card');
console.log('✅ clock.html DOM structure and views verified.');

// 2. Verify clock.css Ultra-Transparency & Responsive styling
console.log('\n[2/7] Testing clock.css Maximum Transparency & Responsive Rules...');
const cssPath = path.join(__dirname, '../windows/css/clock.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

assert(cssContent.includes('.plate[data-transparency=\'max\']') || cssContent.includes('.plate[data-transparency="max"]'), 'Must style max transparency on plate');
assert(cssContent.includes('background: transparent !important;'), 'Must have 100% pure transparent background');
assert(cssContent.includes('.clock-nav'), 'Must style navigation pill bar');
assert(cssContent.includes('.plate:hover .clock-nav'), 'clock-nav must appear on hover only across all sizes');
assert(cssContent.includes('.alarm-card'), 'Must style alarm cards');
assert(cssContent.includes('.timer-svg'), 'Must style timer dial svg');
assert(cssContent.includes('.ringing-overlay'), 'Must style alarm ringing overlay');
assert(cssContent.includes('max-height: 200px'), 'Must preserve compact container rules');
assert(cssContent.includes('@container tile (max-height: 135px) and (min-width: 170px)'), 'Must preserve short/wide morphing layout');
assert(cssContent.includes(':root[data-compact="ultra"] .clock'), 'Must preserve ultra-compact nano rules');
console.log('✅ clock.css styling rules and responsive layouts verified.');

// 3. Verify clock.js Logic & Integrations
console.log('\n[3/7] Testing clock.js Logic, Alarms & Timer Engine...');
const jsPath = path.join(__dirname, '../windows/js/clock.js');
const jsContent = fs.readFileSync(jsPath, 'utf8');

assert(jsContent.includes('function setTransparency('), 'Must have setTransparency logic');
assert(jsContent.includes('function toggleTransparency('), 'Must have toggleTransparency handler');
assert(jsContent.includes('function switchTab('), 'Must have switchTab handler');
assert(jsContent.includes('function playAlarmChime('), 'Must have playAlarmChime audio synthesis');
assert(jsContent.includes('function playTimerChime('), 'Must have playTimerChime audio synthesis');
assert(jsContent.includes('function checkAlarms('), 'Must have active alarms tick checker');
assert(jsContent.includes('function triggerAlarm('), 'Must have triggerAlarm handler');
assert(jsContent.includes('function snoozeRingingAlarm('), 'Must have snooze handler');
assert(jsContent.includes('function dismissRingingAlarm('), 'Must have dismiss handler');
assert(jsContent.includes('function populateTaskSelect('), 'Must have task integration loader');
assert(jsContent.includes('window.widgets?.win?.openTask?.('), 'Must have openTask integration for linked tasks');
assert(jsContent.includes('function startTimer('), 'Must have startTimer logic');
assert(jsContent.includes('function pauseTimer('), 'Must have pauseTimer logic');
assert(jsContent.includes('function resetTimer('), 'Must have resetTimer logic');
assert(jsContent.includes('function deleteAlarm('), 'Must have reliable deleteAlarm logic');
assert(jsContent.includes('function stepHour('), 'Must have stepHour logic for time picker');
console.log('✅ clock.js logic and methods verified.');

// 4. Verify Task Linking Support
console.log('\n[4/7] Testing To-Do Tasks Linking with Alarms...');
assert(jsContent.includes('window.widgets?.todos?.get?.()'), 'Must query active todos for linking');
assert(jsContent.includes('alarm.taskId'), 'Must store and evaluate linked taskId');
assert(htmlContent.includes('id="alarmTaskSelect"'), 'Must expose task selection in editor');
console.log('✅ Task linking architecture verified.');

// 5. Verify Settings Window Integration
console.log('\n[5/7] Testing Settings HTML & JS Integration for Max Transparency...');
const settingsHtmlPath = path.join(__dirname, '../windows/settings.html');
const settingsHtml = fs.readFileSync(settingsHtmlPath, 'utf8');
assert(settingsHtml.includes('id="clockUltraTransparent"'), 'settings.html must have clockUltraTransparent switch');
assert(settingsHtml.includes('id="scopeClockPureTransparentRow"'), 'settings.html must have scopeClockPureTransparentRow in Appearance');
assert(settingsHtml.includes('id="clockDefaultTab"'), 'settings.html must have clockDefaultTab setting');
assert(settingsHtml.includes('id="clockAlarmSound"'), 'settings.html must have clockAlarmSound setting');
assert(settingsHtml.includes('id="clockSnoozeDuration"'), 'settings.html must have clockSnoozeDuration setting');
assert(settingsHtml.includes('id="clockTimerSound"'), 'settings.html must have clockTimerSound setting');
assert(settingsHtml.includes('id="clockTimerDefaultSec"'), 'settings.html must have clockTimerDefaultSec setting');
assert(settingsHtml.includes('id="clockDesktopNotify"'), 'settings.html must have clockDesktopNotify setting');

const settingsJsPath = path.join(__dirname, '../windows/js/settings.js');
const settingsJs = fs.readFileSync(settingsJsPath, 'utf8');
assert(settingsJs.includes('switchEl(\'#clockUltraTransparent\','), 'settings.js must bind clockUltraTransparent switch');
assert(settingsJs.includes('\'s.clockPureTransparent\':'), 'settings.js must have localization for clockPureTransparent');
assert(settingsJs.includes('scopeClockPureTransparent'), 'settings.js must handle clock-specific pure transparency in Appearance');
assert(settingsJs.includes('#clockDefaultTab'), 'settings.js must bind clockDefaultTab');
assert(settingsJs.includes('#clockSnoozeDuration'), 'settings.js must bind clockSnoozeDuration');
assert(settingsJs.includes('#clockTimerDefaultSec'), 'settings.js must bind clockTimerDefaultSec');
console.log('✅ Settings window integration verified.');

// 6. Verify main.js Defaults
console.log('\n[6/7] Testing main.js Defaults for Clock...');
const mainPath = path.join(__dirname, '../main.js');
const mainContent = fs.readFileSync(mainPath, 'utf8');
assert(mainContent.includes('ultraTransparent: true'), 'main.js must have ultraTransparent in clock defaults');
console.log('✅ main.js defaults verified.');

// 7. Verify Web Audio Sound Synthesis Safety (No external files needed)
console.log('\n[7/7] Testing Sound Chime Self-Containment...');
assert(!jsContent.includes('new Audio('), 'Must not rely on external audio files');
assert(jsContent.includes('AudioContext'), 'Must use Web Audio API synthesis for zero latency & reliability');
console.log('✅ Self-contained Web Audio synthesis verified.');

console.log('\n================================================================');
console.log('🎉 ALL CLOCK EVOLUTION TESTS PASSED WITH 100% SUCCESS! 🎉');
console.log('================================================================');
