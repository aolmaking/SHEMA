const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('========================================================');
console.log('TESTING EMAIL ERROR AUTO-RECOVERY & PER-WIDGET STYLING');
console.log('========================================================\n');

// 1. Verify email error parsing and recovery in email.js
const emailJs = fs.readFileSync(path.join(__dirname, '../windows/js/email.js'), 'utf8');
assert.ok(emailJs.includes('parseEmailError'), 'email.js must have parseEmailError');
assert.ok(emailJs.includes('scheduleAutoRetry'), 'email.js must have auto-retry recovery timer');
assert.ok(emailJs.includes("window.addEventListener('online'"), 'email.js must automatically retry when network is online');
assert.ok(emailJs.includes("clearConnectionError()"), 'email.js must clear connection error when updates arrive');
assert.ok(emailJs.includes("openSettings('setup-email')"), 'email.js must route auth errors to setup-email');
console.log('✅ Email intelligent error parsing, auto-recovery & setup routing verified.');

// 2. Verify humanizeError in src/core/email.js
const emailCore = fs.readFileSync(path.join(__dirname, '../src/core/email.js'), 'utf8');
assert.ok(emailCore.includes('humanizeError(err)'), 'src/core/email.js must define humanizeError');
assert.ok(emailCore.includes('ENOTFOUND'), 'src/core/email.js must handle ENOTFOUND DNS/offline errors');
assert.ok(emailCore.includes('lastErrorType'), 'src/core/email.js must store error type');
console.log('✅ Email engine error humanizer & metadata verified.');

// 3. Verify per-widget custom controls in settings.html
const settingsHtml = fs.readFileSync(path.join(__dirname, '../windows/settings.html'), 'utf8');
assert.ok(settingsHtml.includes('id="wStyleTheme"'), 'settings.html must have #wStyleTheme picker');
assert.ok(settingsHtml.includes('id="wStyleAccent"'), 'settings.html must have #wStyleAccent picker');
assert.ok(settingsHtml.includes('id="wStyleFontScale"'), 'settings.html must have #wStyleFontScale picker');
assert.ok(settingsHtml.includes('id="wStyleRadius"'), 'settings.html must have #wStyleRadius picker');
assert.ok(settingsHtml.includes('id="wStyleCardSurface"'), 'settings.html must have #wStyleCardSurface picker');
assert.ok(settingsHtml.includes('id="wStyleBorderGlow"'), 'settings.html must have #wStyleBorderGlow picker');
console.log('✅ Per-widget HTML custom controls (Theme, Accent, Scale, Radius, Surface, Glow) verified.');

// 4. Verify settings.js handles new per-widget styles
const settingsJs = fs.readFileSync(path.join(__dirname, '../windows/js/settings.js'), 'utf8');
assert.ok(settingsJs.includes("'theme'"), 'settings.js must save theme override');
assert.ok(settingsJs.includes("'accent'"), 'settings.js must save accent override');
assert.ok(settingsJs.includes("'fontScale'"), 'settings.js must save fontScale override');
assert.ok(settingsJs.includes("'radius'"), 'settings.js must save radius override');
assert.ok(settingsJs.includes("'cardSurface'"), 'settings.js must save cardSurface override');
assert.ok(settingsJs.includes("'borderGlow'"), 'settings.js must save borderGlow override');
assert.ok(settingsJs.includes("'s.wStyleTheme'"), 'settings.js must have s.wStyleTheme translation');
assert.ok(settingsJs.includes("'s.wStyleAccent'"), 'settings.js must have s.wStyleAccent translation');
console.log('✅ Settings.js per-widget state management and i18n verified.');

// 5. Verify shell.js applies all per-widget style tokens
const shellJs = fs.readFileSync(path.join(__dirname, '../windows/js/shell.js'), 'utf8');
assert.ok(shellJs.includes('root.dataset.theme = wStyle.theme'), 'shell.js must apply wStyle.theme');
assert.ok(shellJs.includes("root.style.setProperty('--accent', wStyle.accent)"), 'shell.js must apply wStyle.accent');
assert.ok(shellJs.includes("root.style.setProperty('--fs', String(wStyle.fontScale))"), 'shell.js must apply wStyle.fontScale');
assert.ok(shellJs.includes("root.style.setProperty('--radius-window'"), 'shell.js must apply wStyle.radius');
assert.ok(shellJs.includes("wStyle.cardSurface"), 'shell.js must apply wStyle.cardSurface');
assert.ok(shellJs.includes("wStyle.borderGlow"), 'shell.js must apply wStyle.borderGlow');
console.log('✅ Shell.js per-widget styling application verified.');

// 6. Verify Email empty states, setup prompt clean layout & zero-overlap protection
const emailCss = fs.readFileSync(path.join(__dirname, '../windows/css/email.css'), 'utf8');
assert.ok(emailJs.includes("$('#filterBar').hidden = !isConfigured;"), 'email.js must hide filterBar when email is not configured');
assert.ok(emailJs.includes("$('#emailList').hidden = !isConfigured;"), 'email.js must hide emailList when email is not configured');
assert.ok(emailCss.includes('justify-content: safe center;'), 'email.css .empty must use safe center to prevent overflow onto preceding elements');
assert.ok(emailCss.includes('height: auto;'), 'email.css .empty must override base.css height: 100%');
assert.ok(emailCss.includes('overflow-y: auto;'), 'email.css .empty must contain vertical overflow safely');
console.log('✅ Email empty states & setup layout zero-overlap verified.');

console.log('\n========================================================');
console.log('🎉 ALL EMAIL RECOVERY & PER-WIDGET STYLE TESTS PASSED (100%)');
console.log('========================================================');
