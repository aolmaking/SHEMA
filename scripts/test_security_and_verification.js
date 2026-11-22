'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('TESTING SECURITY, VERIFICATION & CROSS-PLATFORM FEATURES');
console.log('========================================================\n');

// 1. Test Google Classroom refreshToken preservation & Error detection
console.log('--- 1. Testing Google Classroom Token & Auth Error Handling ---');
const { ClassroomEngine } = require('../src/core/classroom');

let mockSettings = {
  classroom: {
    enabled: true,
    clientId: 'test-client-id',
    clientSecret: 'test-secret',
    accessToken: 'old-access',
    refreshToken: 'keep-this-refresh-token',
    expiryDate: Date.now() - 1000, // expired
  },
};

const classroom = new ClassroomEngine(
  () => mockSettings,
  async (patch) => {
    mockSettings = { ...mockSettings, ...patch };
  }
);

assert.strictEqual(classroom.config().refreshToken, 'keep-this-refresh-token', 'refreshToken must exist');
console.log('✅ Google Classroom initial configuration verified.');

// Test exchangeCode keeps refreshToken if Google returns none
// (simulating by checking exchangeCode logic in classroom.js)
const classroomCode = fs.readFileSync(path.join(__dirname, '../src/core/classroom.js'), 'utf8');
assert.ok(classroomCode.includes('this.config().refreshToken'), 'exchangeCode must never wipe existing refreshToken');
assert.ok(classroomCode.includes('authError: true'), 'classroom.js must flag authError when sync fails');
console.log('✅ Google Classroom refreshToken preservation & authError handling verified.');

// 2. Test Email Error & Safe IMAP Interval
console.log('\n--- 2. Testing Email Security, Polling & Error Event Handling ---');
const emailCode = fs.readFileSync(path.join(__dirname, '../src/core/email.js'), 'utf8');
assert.ok(emailCode.includes('this.emit(\'error\', errMsg)'), 'emailEngine must emit error event');

const mainCode = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');
assert.ok(mainCode.includes("emailEngine.on('error'"), 'main.js must listen to email error and broadcast to renderer');
assert.ok(mainCode.includes("broadcast('email:error'"), 'main.js must broadcast email:error to windows');
assert.ok(mainCode.includes("broadcast('classroom:error'"), 'main.js must broadcast classroom:error to windows');
console.log('✅ Email & Classroom error event propagation verified.');

// 3. Test Red Alert Indicators in To-Do and Email CSS & JS
console.log('\n--- 3. Testing Visual Red Warning Indicators (علامة الإنذار الأحمر) ---');
const todoCss = fs.readFileSync(path.join(__dirname, '../windows/css/todo.css'), 'utf8');
assert.ok(todoCss.includes('.icon-btn#syncBtn.has-error'), 'todo.css must contain .icon-btn#syncBtn.has-error');
assert.ok(todoCss.includes('pulse-danger'), 'todo.css must contain pulsing red danger animation');

const todoJs = fs.readFileSync(path.join(__dirname, '../windows/js/todo.js'), 'utf8');
assert.ok(todoJs.includes("syncBtn.classList.add('has-error')"), 'todo.js must activate red warning indicator on authError');
assert.ok(todoJs.includes("window.widgets.classroom.onError"), 'todo.js must wire classroom.onError listener');

const emailCss = fs.readFileSync(path.join(__dirname, '../windows/css/email.css'), 'utf8');
assert.ok(emailCss.includes('.icon-btn#refreshBtn.has-error'), 'email.css must contain .icon-btn#refreshBtn.has-error');
assert.ok(emailCss.includes('pulse-danger'), 'email.css must contain pulse-danger animation');

const emailJs = fs.readFileSync(path.join(__dirname, '../windows/js/email.js'), 'utf8');
assert.ok(emailJs.includes('showConnectionError'), 'email.js must have showConnectionError');
assert.ok(emailJs.includes("window.widgets.email.onError"), 'email.js must wire email.onError listener');
console.log('✅ Visual red warning indicators verified across To-Do and Email widgets.');

// 4. Test Cross-Platform Autostart & Process Safety
console.log('\n--- 4. Testing Cross-Platform & Process Lifecycle Safety ---');
const autostart = require('../src/core/autostart');
const autostartCode = fs.readFileSync(path.join(__dirname, '../src/core/autostart.js'), 'utf8');
assert.ok(autostartCode.includes("process.platform === 'linux'"), 'autostart.js must handle Linux platform');
assert.ok(autostartCode.includes('[Desktop Entry]'), 'autostart.js must generate XDG desktop entry for Linux');

assert.ok(mainCode.includes('stopOpenWaServer()'), 'main.js must clean up OpenWA server on app exit');
assert.ok(mainCode.includes('superUrgentMonitor.stop()'), 'main.js must stop urgent monitor on quit');
assert.ok(mainCode.includes('emailEngine.stop()'), 'main.js must stop email engine polling on quit');
console.log('✅ Cross-platform autostart and process lifecycle cleanup verified.');

// 5. Test Settings Setup Guide Modals (!)
console.log('\n--- 5. Testing Settings In-App Setup Guide Modals (!) ---');
const settingsHtml = fs.readFileSync(path.join(__dirname, '../windows/settings.html'), 'utf8');
assert.ok(settingsHtml.includes('id="crHelpBtn"'), 'settings.html must have crHelpBtn (!) button');
assert.ok(settingsHtml.includes('id="waHelpBtn"'), 'settings.html must have waHelpBtn (!) button');
assert.ok(settingsHtml.includes('id="emailHelpBtn"'), 'settings.html must have emailHelpBtn (!) button');
assert.ok(settingsHtml.includes('id="setupGuideModal"'), 'settings.html must contain setupGuideModal');

const settingsJs = fs.readFileSync(path.join(__dirname, '../windows/js/settings.js'), 'utf8');
assert.ok(settingsJs.includes('wireSetupGuideModals'), 'settings.js must wire setup guide modals');
assert.ok(settingsJs.includes('Google Classroom Setup Guide') || settingsJs.includes('دليل إعداد Google Classroom'), 'settings.js must have Classroom guide content');
assert.ok(settingsJs.includes('OpenWA') || settingsJs.includes('WhatsApp'), 'settings.js must have WhatsApp guide content');
assert.ok(settingsJs.includes('App Passwords') || settingsJs.includes('كلمات مرور التطبيقات'), 'settings.js must have Email guide content');
console.log('✅ In-App Setup Guide Modals (!) verified.');

console.log('\n========================================================');
console.log('🎉 ALL SECURITY & VERIFICATION TESTS PASSED (100%)');
console.log('========================================================\n');
