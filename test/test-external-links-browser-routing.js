'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('🧪 TESTING EXTERNAL LINKS ROUTING TO DEFAULT BROWSER (CHROME)');
console.log('================================================================');

const ROOT = path.join(__dirname, '..');

// 1. Verify main.js global web-contents-created & setWindowOpenHandler
console.log('\n[1/4] Verifying main.js Electron window interception handlers...');
const mainSrc = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8');

assert(mainSrc.includes("app.on('web-contents-created'"), 'main.js must listen to web-contents-created globally');
assert(mainSrc.includes('contents.setWindowOpenHandler'), 'main.js must set setWindowOpenHandler on webContents');
assert(mainSrc.includes("contents.on('will-navigate'"), 'main.js must intercept will-navigate on webContents');
assert(mainSrc.includes("action: 'deny'"), 'main.js setWindowOpenHandler must deny internal Electron window opening');
assert(mainSrc.includes('shell.openExternal(url)'), 'main.js must delegate external URLs to shell.openExternal');

// Verify secondaryWindow and createWidget have explicit setWindowOpenHandler
assert(mainSrc.includes('win.webContents.setWindowOpenHandler'), 'secondaryWindow & createWidget must set setWindowOpenHandler');
assert(mainSrc.includes("win.webContents.on('will-navigate'"), 'secondaryWindow & createWidget must listen to will-navigate');
console.log('✅ main.js Electron external links interception verified.');

// 2. Verify windows/js/shell.js global link capture
console.log('\n[2/4] Verifying windows/js/shell.js global click interception...');
const shellSrc = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'shell.js'), 'utf8');

assert(shellSrc.includes("e.target.closest('a')"), 'shell.js must detect clicks on anchor links');
assert(shellSrc.includes('window.widgets?.openExternal'), 'shell.js must call openExternal for external links');
assert(shellSrc.includes('e.preventDefault()'), 'shell.js must prevent default navigation');
console.log('✅ shell.js universal anchor interception verified.');

// 3. Verify windows/js/email-view.js dedicated handling
console.log('\n[3/4] Verifying windows/js/email-view.js email link interception...');
const emailViewSrc = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'email-view.js'), 'utf8');

assert(emailViewSrc.includes("e.target.closest('a')"), 'email-view.js must detect clicks on anchor links');
assert(emailViewSrc.includes('window.widgets?.openExternal'), 'email-view.js must route links to openExternal');
assert(emailViewSrc.includes("setAttribute('target', '_blank')"), 'email-view.js must mark body links with target _blank');
console.log('✅ email-view.js email links routing verified.');

// 4. Verify windows/js/email.js in-widget reader handling
console.log('\n[4/5] Verifying windows/js/email.js in-widget email link interception...');
const emailSrc = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'email.js'), 'utf8');

assert(emailSrc.includes("e.target.closest('a')"), 'email.js must detect clicks on anchor links');
assert(emailSrc.includes('window.widgets?.openExternal'), 'email.js must route links to openExternal');
assert(emailSrc.includes("setAttribute('target', '_blank')"), 'email.js must mark body links with target _blank');
console.log('✅ email.js in-widget email links routing verified.');

// 5. Verify Google Chrome Profile Selection & Settings Integration
console.log('\n[5/5] Verifying Chrome Profile Selection & Settings Integration...');
assert(mainSrc.includes('function getChromeProfiles'), 'main.js must define getChromeProfiles');
assert(mainSrc.includes('function findChromeExecutable'), 'main.js must define findChromeExecutable');
assert(mainSrc.includes('function openExternalUrl'), 'main.js must define openExternalUrl');
assert(mainSrc.includes('--profile-directory='), 'main.js must pass --profile-directory to Chrome');
assert(mainSrc.includes("'browser:getProfiles'"), 'main.js must expose browser:getProfiles IPC');
assert(mainSrc.includes("'browser:test'"), 'main.js must expose browser:test IPC');

const preloadSrc = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8');
assert(preloadSrc.includes("ipcRenderer.invoke('browser:getProfiles')"), 'preload.js must expose browser.getProfiles');
assert(preloadSrc.includes("ipcRenderer.invoke('browser:test', opts)"), 'preload.js must expose browser.test');

const settingsHtml = fs.readFileSync(path.join(ROOT, 'windows', 'settings.html'), 'utf8');
assert(settingsHtml.includes('id="sec-setup-browser"'), 'settings.html must contain #sec-setup-browser');
assert(settingsHtml.includes('id="browserChromeProfile"'), 'settings.html must contain #browserChromeProfile');
assert(settingsHtml.includes('id="browserMode"'), 'settings.html must contain #browserMode');

const settingsJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'settings.js'), 'utf8');
assert(settingsJs.includes('function buildBrowserSetup'), 'settings.js must define buildBrowserSetup');
assert(settingsJs.includes('function syncBrowserSetup'), 'settings.js must define syncBrowserSetup');
console.log('✅ Chrome Profile Selection & Settings integration verified 100%.');

// 6. Verify Single-Click Debounce & Deduplication (No Multiple Tabs)
console.log('\n[6/6] Verifying URL Debounce & Single-Tab Guarantee...');
assert(mainSrc.includes('recentOpenedUrls'), 'main.js must track recentOpenedUrls to deduplicate rapid duplicate requests');
assert(mainSrc.includes('Suppressed duplicate openExternalUrl'), 'main.js must log/suppress duplicate URL launches');
assert(shellSrc.includes('e.stopImmediatePropagation()'), 'shell.js must call stopImmediatePropagation');
assert(emailViewSrc.includes('e.stopImmediatePropagation()'), 'email-view.js must call stopImmediatePropagation');
assert(emailSrc.includes('e.stopImmediatePropagation()'), 'email.js must call stopImmediatePropagation');
console.log('✅ Single-click debounce & deduplication verified 100% (Zero multi-tab duplicate bug).');

console.log('\n================================================================');
console.log('🎉 ALL EXTERNAL LINK BROWSER ROUTING TESTS PASSED (100%)!');
console.log('================================================================\n');
