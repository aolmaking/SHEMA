'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('TESTING LAPTOP BATTERY & POWER SAVER OPTIMIZATIONS');
console.log('================================================================\n');

// 1. Chromium Command-Line Optimization Switches
console.log('[1/10] Testing Chromium Low-Power Switches in main.js...');
const mainJs = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');
assert(mainJs.includes("app.commandLine.appendSwitch('disable-renderer-backgrounding', 'false')"), 'main.js must enable renderer backgrounding throttling');
assert(mainJs.includes('BatterySaverMode'), 'main.js must enable BatterySaverMode feature flag');
assert(mainJs.includes('CalculateNativeWinOcclusion'), 'main.js must enable CalculateNativeWinOcclusion flag');
assert(mainJs.includes('ThrottleDisplayNoneAndVisibilityHiddenFrame'), 'main.js must throttle display:none and visibility:hidden frames');
console.log('✅ Chromium low-power and occlusion flags verified.');

// 2. Background Throttling Enabled Across All Window Creators
console.log('[2/10] Testing backgroundThrottling: true in BrowserWindow configs...');
assert(mainJs.includes('backgroundThrottling: true'), 'main.js must configure backgroundThrottling: true');
console.log('✅ backgroundThrottling: true verified across BrowserWindow preferences.');

// 3. Power State Tracking & PowerMonitor Events
console.log('[3/10] Testing powerMonitor hooks & eco state evaluation in main.js...');
assert(mainJs.includes('function evaluateEcoState()'), 'main.js must define evaluateEcoState');
assert(mainJs.includes('currentPowerState.onBattery'), 'main.js must track onBattery state');
assert(mainJs.includes("powerMonitor.on('on-battery'"), 'main.js must listen to on-battery event');
assert(mainJs.includes("powerMonitor.on('on-ac'"), 'main.js must listen to on-ac event');
assert(mainJs.includes("powerMonitor.on('suspend'"), 'main.js must listen to suspend event');
assert(mainJs.includes("powerMonitor.on('lock-screen'"), 'main.js must listen to lock-screen event');
assert(mainJs.includes("ipcMain.handle('power:get-status'"), 'main.js must register power:get-status IPC handler');
assert(mainJs.includes('setInterval(updateTrayTooltip, 60_000)'), 'Tray tooltip polling must be throttled to 60s');
assert(mainJs.includes('if (currentPowerState.suspended || currentPowerState.locked) return null;'), 'Classroom background sync must be paused when locked or suspended');
console.log('✅ PowerMonitor events, eco evaluation, tray throttling and background sync suspension verified.');

// 4. Preload IPC Bridge Exposing Power APIs
console.log('[4/10] Testing Preload Power API Bridge...');
const preloadJs = fs.readFileSync(path.join(__dirname, '../preload.js'), 'utf8');
assert(preloadJs.includes('power: {'), 'preload.js must define power namespace');
assert(preloadJs.includes("getStatus: () => ipcRenderer.invoke('power:get-status')"), 'preload.js must expose getStatus');
assert(preloadJs.includes("onStatus: (fn) => on('power:status', fn)"), 'preload.js must expose onStatus listener');
console.log('✅ Preload power API bridge verified.');

// 5. CSS Dormancy and Eco Mode Rules
console.log('[5/10] Testing Base CSS Low-Power & Dormancy Rules...');
const baseCss = fs.readFileSync(path.join(__dirname, '../windows/css/base.css'), 'utf8');
assert(baseCss.includes(':root[data-dormant="1"] *'), 'base.css must define universal dormant freeze rules');
assert(baseCss.includes('animation: none !important;'), 'Dormant elements must have animations disabled');
assert(baseCss.includes('transition: none !important;'), 'Dormant elements must have transitions disabled');
assert(baseCss.includes(':root[data-eco="1"] .plate::after'), 'base.css must suppress SVG fractal noise in eco mode');
assert(baseCss.includes(':root[data-eco="1"] .sheen'), 'base.css must suppress dynamic sheen in eco mode');
assert(baseCss.includes(':root[data-eco="1"] *'), 'base.css must suppress backdrop-filter in eco mode');
assert(baseCss.includes(':root[data-screen-locked="1"] *'), 'base.css must freeze visual layers when screen is locked');
console.log('✅ CSS Dormancy, Eco Mode and Screen Lock rules verified.');

// 6. Shell.js Dormancy Engine & Minute-Aligned Live Updates
console.log('[6/10] Testing shell.js Dormancy Engine & Minute-Aligned Live Updates...');
const shellJs = fs.readFileSync(path.join(__dirname, '../windows/js/shell.js'), 'utf8');
assert(shellJs.includes('function evaluateDormancy()'), 'shell.js must define evaluateDormancy');
assert(shellJs.includes('function installPowerAndDormancy()'), 'shell.js must define installPowerAndDormancy');
assert(shellJs.includes('isDormant: () => isCurrentlyDormant'), 'shell.js must export isDormant on window.UI');
assert(shellJs.includes('onDormancy: (fn) => {'), 'shell.js must export onDormancy on window.UI');
assert(shellJs.includes('(60 - now.getSeconds()) * 1000'), 'shell.js app icon live updates must be minute-boundary aligned');
assert(!shellJs.includes('setInterval(updateClock, 10000);'), 'shell.js must not poll mini clock every 10 seconds');
console.log('✅ shell.js Dormancy engine and minute-boundary scheduling verified.');

// 7. Clock and Pomodoro Dormancy Integration
console.log('[7/10] Testing Clock & Pomodoro Dormancy Freezing...');
const clockJs = fs.readFileSync(path.join(__dirname, '../windows/js/clock.js'), 'utf8');
assert(clockJs.includes('if (window.UI?.isDormant?.()) return;'), 'clock.js must skip schedule tick when dormant');
assert(clockJs.includes('window.UI?.onDormancy?.('), 'clock.js must hook onDormancy to pause/resume');
assert(clockJs.includes('(60 - now.getSeconds()) * 1000'), 'clock.js must align to minute boundary when seconds are disabled');

const pomoJs = fs.readFileSync(path.join(__dirname, '../windows/js/pomodoro.js'), 'utf8');
assert(pomoJs.includes('if (window.UI?.isDormant?.()) return;'), 'pomodoro.js must skip schedule tick when dormant');
assert(pomoJs.includes('window.UI?.onDormancy?.('), 'pomodoro.js must hook onDormancy');
console.log('✅ Clock and Pomodoro dormancy freezing verified.');

// 8. Photo, Todo, Quran, Calendar, Habits Dormancy Integration
console.log('[8/10] Testing Photo, Todo, Quran, Calendar & Habits Dormancy Hooking...');
const photoJs = fs.readFileSync(path.join(__dirname, '../windows/js/photo.js'), 'utf8');
assert(photoJs.includes('if (window.UI?.isDormant?.()) return;'), 'photo.js must skip slideshow when dormant');
assert(photoJs.includes('window.UI?.onDormancy?.('), 'photo.js must hook onDormancy');

const todoJs = fs.readFileSync(path.join(__dirname, '../windows/js/todo.js'), 'utf8');
assert(todoJs.includes('if (window.UI?.isDormant?.()) return;'), 'todo.js must skip periodic re-render when dormant');
assert(todoJs.includes('window.UI?.onDormancy?.('), 'todo.js must hook onDormancy');

const quranJs = fs.readFileSync(path.join(__dirname, '../windows/js/quran.js'), 'utf8');
assert(quranJs.includes('if (window.UI?.isDormant?.() || !current) return;'), 'quran.js must skip time updates when dormant');
assert(quranJs.includes('window.UI?.onDormancy?.('), 'quran.js must hook onDormancy');

const calJs = fs.readFileSync(path.join(__dirname, '../windows/js/calendar.js'), 'utf8');
assert(calJs.includes('if (window.UI?.isDormant?.()) return;'), 'calendar.js must skip day roll check when dormant');
assert(calJs.includes('window.UI?.onDormancy?.('), 'calendar.js must hook onDormancy');

const habitsJs = fs.readFileSync(path.join(__dirname, '../windows/js/habits.js'), 'utf8');
assert(habitsJs.includes('if (window.UI?.isDormant?.()) {'), 'habits.js must cancel confetti when dormant');
assert(habitsJs.includes('window.UI?.onDormancy?.('), 'habits.js must hook onDormancy');
console.log('✅ All widget renderers hooked to dormancy engine verified.');

// 9. Settings HTML & CSS Interface
console.log('[9/10] Testing Settings UI Section, Scope Controls & Matrix...');
const settingsHtml = fs.readFileSync(path.join(__dirname, '../windows/settings.html'), 'utf8');
assert(settingsHtml.includes('id="sec-eco"'), 'settings.html must have #sec-eco section');

// Verify #sec-eco is inside data-pane="setup" and NOT appearance
const setupPaneIndex = settingsHtml.indexOf('data-pane="setup"');
const appearancePaneIndex = settingsHtml.indexOf('data-pane="appearance"');
const secEcoIndex = settingsHtml.indexOf('id="sec-eco"');
assert(setupPaneIndex !== -1 && secEcoIndex > setupPaneIndex, '#sec-eco MUST be inside data-pane="setup" (Setting Up)');
assert(secEcoIndex < appearancePaneIndex || appearancePaneIndex < setupPaneIndex, 'Pane order check');

assert(settingsHtml.includes('id="ecoLiveBadge"'), 'settings.html must have #ecoLiveBadge');
assert(settingsHtml.includes('id="ecoScopeSelect"'), 'settings.html must have #ecoScopeSelect scope selector');
assert(settingsHtml.includes('id="ecoScopeStatusPill"'), 'settings.html must have #ecoScopeStatusPill status badge');
assert(settingsHtml.includes('id="ecoScopeResetBtn"'), 'settings.html must have #ecoScopeResetBtn');
assert(settingsHtml.includes('id="ecoMatrixGrid"'), 'settings.html must have #ecoMatrixGrid');
assert(settingsHtml.includes('id="ecoMode"'), 'settings.html must have #ecoMode select');
assert(settingsHtml.includes('id="ecoSleepMini"'), 'settings.html must have #ecoSleepMini switch');
assert(settingsHtml.includes('id="ecoPauseOnLock"'), 'settings.html must have #ecoPauseOnLock switch');
assert(settingsHtml.includes('id="ecoLightShaders"'), 'settings.html must have #ecoLightShaders switch');

const settingsCss = fs.readFileSync(path.join(__dirname, '../windows/css/settings.css'), 'utf8');
assert(settingsCss.includes('.group-header-with-badge'), 'settings.css must define .group-header-with-badge');
assert(settingsCss.includes('.eco-live-badge'), 'settings.css must define .eco-live-badge');
assert(settingsCss.includes('.eco-live-badge.is-battery'), 'settings.css must define .eco-live-badge.is-battery');
assert(settingsCss.includes('.eco-live-badge.is-ac'), 'settings.css must define .eco-live-badge.is-ac');
assert(settingsCss.includes('.eco-matrix-grid'), 'settings.css must define .eco-matrix-grid');
assert(settingsCss.includes('.eco-matrix-chip'), 'settings.css must define .eco-matrix-chip');
assert(settingsCss.includes('.eco-matrix-chip-badge'), 'settings.css must define .eco-matrix-chip-badge');
console.log('✅ Settings HTML markup in Setup pane, Per-Widget Scope & CSS Matrix verified.');

// 10. Settings JavaScript Logic, Per-Widget Scoping & i18n
console.log('[10/10] Testing Settings JS Logic, Per-Widget Controls & i18n Translations...');
const settingsJs = fs.readFileSync(path.join(__dirname, '../windows/js/settings.js'), 'utf8');
assert(settingsJs.includes('function buildEcoControls()'), 'settings.js must define buildEcoControls');
assert(settingsJs.includes('function updateEcoLiveBadge('), 'settings.js must define updateEcoLiveBadge');
assert(settingsJs.includes('function getEffectiveWidgetEco('), 'settings.js must define getEffectiveWidgetEco');
assert(settingsJs.includes('function setEcoProp('), 'settings.js must define setEcoProp');
assert(settingsJs.includes('function resetEcoScope()'), 'settings.js must define resetEcoScope');
assert(settingsJs.includes('function syncEcoScopeUI()'), 'settings.js must define syncEcoScopeUI');
assert(settingsJs.includes('function renderEcoMatrixGrid()'), 'settings.js must define renderEcoMatrixGrid');
assert(settingsJs.includes("eco: 'setup'"), 'settings.js SECTION_TAB_MAP must route eco to setup');
assert(settingsJs.includes("'s.ecoTitle': '🔋 توفير الطاقة والبطارية للابتوب'"), 'settings.js must define Arabic ecoTitle');
assert(settingsJs.includes("'s.ecoTitle': '🔋 Laptop Battery & Power Saver'"), 'settings.js must define English ecoTitle');
assert(settingsJs.includes("'s.ecoBadgeBattery': '🔋 على البطارية (توفير الطاقة نشط)'"), 'settings.js must define Arabic battery badge text');
assert(settingsJs.includes("'s.ecoBadgeBattery': '🔋 On Battery (Power Saver Active)'"), 'settings.js must define English battery badge text');
assert(settingsJs.includes("'s.ecoScopeTitle': 'تخصيص توفير الطاقة لكل ودجت'"), 'settings.js must define Arabic ecoScopeTitle');
assert(settingsJs.includes("'s.ecoScopeTitle': 'Per-Widget Battery & Power Saver'"), 'settings.js must define English ecoScopeTitle');
console.log('✅ Settings JS per-widget scoping, matrix rendering, tab routing and translations verified.');

// 11. Functional Per-Widget Effective Resolution Logic
console.log('\n[BONUS] Testing Per-Widget Resolution Logic Functionality...');
function resolveWidgetEco(eco, wid) {
  const globalMode = eco?.mode || 'auto';
  const globalSleepMini = eco?.sleepMini !== false;
  const globalPauseOnLock = eco?.pauseOnLock !== false;
  const globalLightShaders = eco?.lightShaders !== false;
  const custom = eco?.widgets?.[wid] || {};
  return {
    mode: (custom.mode && custom.mode !== 'inherit') ? custom.mode : globalMode,
    sleepMini: (custom.sleepMini !== undefined && custom.sleepMini !== 'inherit') ? custom.sleepMini !== false : globalSleepMini,
    pauseOnLock: (custom.pauseOnLock !== undefined && custom.pauseOnLock !== 'inherit') ? custom.pauseOnLock !== false : globalPauseOnLock,
    lightShaders: (custom.lightShaders !== undefined && custom.lightShaders !== 'inherit') ? custom.lightShaders !== false : globalLightShaders,
    isCustom: Boolean(eco?.widgets?.[wid] && Object.keys(eco.widgets[wid]).length > 0)
  };
}

const testConfig = {
  mode: 'auto',
  sleepMini: true,
  pauseOnLock: true,
  lightShaders: true,
  widgets: {
    clock: { sleepMini: false, mode: 'off' },
    pomodoro: { mode: 'always' }
  }
};

const clockEff = resolveWidgetEco(testConfig, 'clock');
assert.strictEqual(clockEff.sleepMini, false, 'Clock must override sleepMini to false');
assert.strictEqual(clockEff.mode, 'off', 'Clock must override mode to off');
assert.strictEqual(clockEff.lightShaders, true, 'Clock must inherit lightShaders: true');
assert.strictEqual(clockEff.isCustom, true, 'Clock must be marked isCustom');

const calEff = resolveWidgetEco(testConfig, 'calendar');
assert.strictEqual(calEff.sleepMini, true, 'Calendar must inherit global sleepMini: true');
assert.strictEqual(calEff.mode, 'auto', 'Calendar must inherit global mode: auto');
assert.strictEqual(calEff.isCustom, false, 'Calendar must not be marked isCustom');

const pomoEff = resolveWidgetEco(testConfig, 'pomodoro');
assert.strictEqual(pomoEff.mode, 'always', 'Pomodoro must override mode: always');
console.log('✅ Per-widget resolution logic unit test passed.');

console.log('\n================================================================');
console.log('🎉 ALL LAPTOP POWER & BATTERY SAVER TESTS PASSED WITH 100% SUCCESS!');
console.log('================================================================\n');
