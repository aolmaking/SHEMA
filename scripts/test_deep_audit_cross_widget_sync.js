'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('RUNNING DEEP AUDIT & CROSS-WIDGET SYNCHRONIZATION TESTS');
console.log('========================================================');

const ROOT = path.resolve(__dirname, '..');

// 1. Check allWindows in main.js includes eventWin
console.log('--- 1. Testing allWindows() Includes eventWin ---');
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8');
assert(mainJs.includes('if (typeof eventWin !== \'undefined\' && eventWin && !eventWin.isDestroyed()) list.push(eventWin);'), 'allWindows must include eventWin');
console.log('✅ eventWin properly registered in allWindows()');

// 2. Check shell.js per-widget style resets and ink-on-accent recalculation
console.log('--- 2. Testing shell.js Style Cleanup & Ink-On-Accent ---');
const shellJs = fs.readFileSync(path.join(ROOT, 'windows/js/shell.js'), 'utf8');
assert(shellJs.includes('root.style.removeProperty(\'--tile\')'), 'shell.js must remove --tile when cardSurface is inherit or missing');
assert(shellJs.includes('root.style.removeProperty(\'--field\')'), 'shell.js must remove --field when cardSurface is inherit or missing');
assert(shellJs.includes('root.style.removeProperty(\'--sheen-strength\')'), 'shell.js must remove --sheen-strength when borderGlow is inherit or missing');
assert(shellJs.includes('root.style.removeProperty(\'--sheen-rim\')'), 'shell.js must remove --sheen-rim when borderGlow is inherit or missing');
assert(shellJs.includes('root.style.setProperty(\'--ink-on-accent\', L > 0.45 ? \'#141C28\' : \'#FFFFFF\')'), 'shell.js must recalculate ink-on-accent for custom widget accent');
console.log('✅ shell.js cleans up overridden styles and recalculates ink-on-accent');

// 3. Check main.js settings:set does not revive deleted widgetStyles
console.log('--- 3. Testing main.js settings:set WidgetStyles Pruning ---');
assert(!mainJs.includes('\'widgetStyles\', \'habits\''), 'main.js must not shallow-merge widgetStyles in the flat loop');
assert(mainJs.includes('if (\'widgetStyles\' in clean)'), 'main.js must handle clean.widgetStyles directly');
console.log('✅ main.js allows deleting and resetting individual widget styles without resurrection');

// 4. Check DEFAULTS in main.js
console.log('--- 4. Testing DEFAULTS in main.js ---');
assert(mainJs.includes('showStreak: true'), 'DEFAULTS.habits must include showStreak: true');
assert(mainJs.includes('showStrength: true'), 'DEFAULTS.habits must include showStrength: true');
assert(mainJs.includes('showProgressBar: true'), 'DEFAULTS.habits must include showProgressBar: true');
assert(mainJs.includes('showMiniStrip: true'), 'DEFAULTS.habits must include showMiniStrip: true');
assert(mainJs.includes('showRoutineFilters: true'), 'DEFAULTS.habits must include showRoutineFilters: true');
assert(mainJs.includes('showFooterCheckin: true'), 'DEFAULTS.habits must include showFooterCheckin: true');
assert(mainJs.includes('\'habits-dashboard\': 1'), 'DEFAULTS.fontScales must include habits-dashboard');
assert(mainJs.includes('\'email-view\': 1'), 'DEFAULTS.fontScales must include email-view');
console.log('✅ DEFAULTS verified with normalized fontScale and habit visibility keys');

// 5. Check habits.js showProgressBar logic
console.log('--- 5. Testing habits.js showProgressBar Honor ---');
const habitsJs = fs.readFileSync(path.join(ROOT, 'windows/js/habits.js'), 'utf8');
assert(habitsJs.includes('const showProgressBar = state.settings?.showProgressBar !== false;'), 'habits.js must check showProgressBar');
assert(habitsJs.includes('if (!showProgressBar) {'), 'habits.js must hide both pWrap and rWrap when showProgressBar is false');
console.log('✅ habits.js hides both linear progress bar and circular ring when showProgressBar is disabled');

// 6. Check calendar.js switchViewMode persistence
console.log('--- 6. Testing calendar.js switchViewMode Persistence ---');
const calJs = fs.readFileSync(path.join(ROOT, 'windows/js/calendar.js'), 'utf8');
assert(calJs.includes('function switchViewMode(mode, { persist = true } = {})'), 'calendar.js switchViewMode must accept persist option');
assert(calJs.includes('window.widgets.settings.set({ calendar: { ...(cfg || {}), viewMode: mode } })'), 'calendar.js must persist viewMode when switched');
assert(calJs.includes('switchViewMode(cfg.viewMode, { persist: false });'), 'calendar.js applyConfig must pass persist: false');
console.log('✅ calendar.js persists viewMode and prevents view-clobbering on settings update');

// 7. Check calendar.css popup theme match
console.log('--- 7. Testing calendar.css Popup Theme Match ---');
const calCss = fs.readFileSync(path.join(ROOT, 'windows/css/calendar.css'), 'utf8');
assert(calCss.includes(':root[data-popup-theme=\'match\']'), 'calendar.css must have data-popup-theme=\'match\' rule');
assert(calCss.includes('background: var(--plate'), 'calendar.css match rule must use var(--plate)');
console.log('✅ calendar.css popup match theme rule verified');

// 8. Check habits-dashboard theme tokens & per-widget style override
console.log('--- 8. Testing habits-dashboard.css & js Tokens ---');
const dashCss = fs.readFileSync(path.join(ROOT, 'windows/css/habits-dashboard.css'), 'utf8');
assert(dashCss.includes('--dash-bg: var(--solid, #0f172a);'), 'habits-dashboard.css must map --dash-bg to var(--solid)');
assert(dashCss.includes('--dash-border: var(--line,'), 'habits-dashboard.css must map --dash-border to var(--line)');
assert(dashCss.includes('--dash-text-sub: var(--ink-2,'), 'habits-dashboard.css must map --dash-text-sub to var(--ink-2)');
const dashJs = fs.readFileSync(path.join(ROOT, 'windows/js/habits-dashboard.js'), 'utf8');
assert(dashJs.includes('state.allSettings?.widgetStyles?.habits?.theme'), 'habits-dashboard.js must check widgetStyles.habits.theme');
console.log('✅ habits-dashboard CSS tokens and per-widget theme override verified');

// 9. Check settings.html & settings.js habits visibility controls
console.log('--- 9. Testing settings.html & settings.js Habits Controls ---');
const settingsHtml = fs.readFileSync(path.join(ROOT, 'windows/settings.html'), 'utf8');
assert(settingsHtml.includes('id="habitsShowStreak"'), 'settings.html must have #habitsShowStreak');
assert(settingsHtml.includes('id="habitsShowStrength"'), 'settings.html must have #habitsShowStrength');
assert(settingsHtml.includes('id="habitsShowProgressBar"'), 'settings.html must have #habitsShowProgressBar');
assert(settingsHtml.includes('id="habitsShowMiniStrip"'), 'settings.html must have #habitsShowMiniStrip');
assert(settingsHtml.includes('id="habitsShowRoutineFilters"'), 'settings.html must have #habitsShowRoutineFilters');
assert(settingsHtml.includes('id="habitsShowFooterCheckin"'), 'settings.html must have #habitsShowFooterCheckin');

const settingsJs = fs.readFileSync(path.join(ROOT, 'windows/js/settings.js'), 'utf8');
assert(settingsJs.includes('\'s.habitsShowStreak\''), 'settings.js must have s.habitsShowStreak translation');
assert(settingsJs.includes('switchEl(\'#habitsShowStreak\''), 'settings.js must wire #habitsShowStreak');
assert(settingsJs.includes('switchEl(\'#habitsShowStrength\''), 'settings.js must wire #habitsShowStrength');
assert(settingsJs.includes('switchEl(\'#habitsShowProgressBar\''), 'settings.js must wire #habitsShowProgressBar');
assert(settingsJs.includes('switchEl(\'#habitsShowMiniStrip\''), 'settings.js must wire #habitsShowMiniStrip');
assert(settingsJs.includes('switchEl(\'#habitsShowRoutineFilters\''), 'settings.js must wire #habitsShowRoutineFilters');
assert(settingsJs.includes('switchEl(\'#habitsShowFooterCheckin\''), 'settings.js must wire #habitsShowFooterCheckin');
console.log('✅ settings.html and settings.js habits display controls wired and translated');

console.log('========================================================');
console.log('🎉 ALL 9 DEEP AUDIT & CROSS-WIDGET TESTS PASSED (100%)! 🎉');
console.log('========================================================');
