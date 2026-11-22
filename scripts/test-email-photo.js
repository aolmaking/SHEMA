'use strict';
/**
 * Test script for new Email & Photo widgets.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

console.log('Testing Email & Photo widgets implementation...\n');

// 1. Test Email Engine & RFC 2047 decoding
console.log('1. Testing src/core/email.js');
const { EmailEngine, decodeRfc2047, parseAddress, PROVIDERS } = require('../src/core/email');

assert.strictEqual(typeof EmailEngine, 'function', 'EmailEngine should be a constructor');
assert(PROVIDERS.gmail && PROVIDERS.outlook && PROVIDERS.yahoo && PROVIDERS.icloud && PROVIDERS.custom, 'All standard providers configured');

// Decode tests
const encodedArabic = '=?UTF-8?B?2KfZhNiz2YTYp9mF?=';
assert.strictEqual(decodeRfc2047(encodedArabic), 'السلام', 'Should decode Arabic base64 RFC 2047');

const encodedQP = '=?UTF-8?Q?Hello_World!?=';
assert.strictEqual(decodeRfc2047(encodedQP), 'Hello World!', 'Should decode Quoted-Printable RFC 2047');

// Address parsing
const parsed1 = parseAddress('"Ahmed Ali" <ahmed@example.com>');
assert.strictEqual(parsed1.name, 'Ahmed Ali');
assert.strictEqual(parsed1.address, 'ahmed@example.com');

const parsed2 = parseAddress('=?UTF-8?B?2KfZhNiz2YTYp9mF?= <test@domain.com>');
assert.strictEqual(parsed2.name, 'السلام');
assert.strictEqual(parsed2.address, 'test@domain.com');

console.log('  ok  RFC 2047 header decoder & address parser');

// 2. Test File existence
console.log('\n2. Testing file existence and structure');
const requiredFiles = [
  'windows/email.html',
  'windows/css/email.css',
  'windows/js/email.js',
  'windows/photo.html',
  'windows/css/photo.css',
  'windows/js/photo.js',
  'src/core/email.js',
];

for (const f of requiredFiles) {
  const full = path.join(ROOT, f);
  assert(fs.existsSync(full), `File ${f} must exist`);
  const content = fs.readFileSync(full, 'utf8');
  assert(content.length > 50, `File ${f} must have non-trivial content`);
  console.log(`  ok  ${f} (${content.length} bytes)`);
}

// 3. Verify HTML and CSP
console.log('\n3. Verifying Content Security Policy and Script imports');
for (const page of ['windows/email.html', 'windows/photo.html']) {
  const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
  assert(html.includes('Content-Security-Policy'), `${page} must contain CSP header`);
  assert(html.includes('css/base.css'), `${page} must link css/base.css`);
  assert(html.includes('js/shell.js'), `${page} must load js/shell.js`);
  assert(html.includes('data-drag'), `${page} plate must have data-drag`);
  assert(html.includes('class="grip"'), `${page} must have resize grip`);
  console.log(`  ok  ${page} passes structural checks`);
}

// 4. Verify settings.html contains both sections
console.log('\n4. Verifying windows/settings.html sections');
const settingsHtml = fs.readFileSync(path.join(ROOT, 'windows/settings.html'), 'utf8');
assert(settingsHtml.includes('id="sec-email"'), 'settings.html must contain #sec-email');
assert(settingsHtml.includes('id="sec-photo"'), 'settings.html must contain #sec-photo');
assert(settingsHtml.includes('id="emailProvider"'), 'settings.html must have emailProvider picker');
assert(settingsHtml.includes('id="emailUser"'), 'settings.html must have emailUser input');
assert(settingsHtml.includes('id="emailPass"'), 'settings.html must have emailPass input');
assert(settingsHtml.includes('id="emailTestBtn"'), 'settings.html must have emailTestBtn');
assert(settingsHtml.includes('id="photoPickFileBtn"'), 'settings.html must have photoPickFileBtn');
assert(settingsHtml.includes('id="photoFit"'), 'settings.html must have photoFit picker');
console.log('  ok  settings.html contains complete UI controls for email and photo');

// 5. Verify preload.js bridge
console.log('\n5. Verifying preload.js exposed APIs');
const preloadJs = fs.readFileSync(path.join(ROOT, 'preload.js'), 'utf8');
assert(preloadJs.includes('email: {'), 'preload.js must expose email namespace');
assert(preloadJs.includes('photo: {'), 'preload.js must expose photo namespace');
assert(preloadJs.includes("'email:get'"), 'preload.js must invoke email:get');
assert(preloadJs.includes("'photo:pick'"), 'preload.js must invoke photo:pick');
console.log('  ok  preload.js correctly exposes email & photo APIs');

// 6. Verify main.js registration
console.log('\n6. Verifying main.js widget registration and IPC');
const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8');
assert(mainJs.includes("email: {"), 'main.js must define email in WIDGETS');
assert(mainJs.includes("photo: {"), 'main.js must define photo in WIDGETS');
assert(mainJs.includes("const { EmailEngine }"), 'main.js must import EmailEngine');
assert(mainJs.includes("ipcMain.handle('email:get'"), 'main.js must handle email:get');
assert(mainJs.includes("ipcMain.handle('email:test'"), 'main.js must handle email:test');
assert(mainJs.includes("ipcMain.handle('photo:pick'"), 'main.js must handle photo:pick');
assert(mainJs.includes("ipcMain.handle('photo:get'"), 'main.js must handle photo:get');
console.log('  ok  main.js has email & photo widgets, layout, defaults, and IPC handlers');

// 7. Verify settings.js
console.log('\n7. Verifying windows/js/settings.js logic and translations');
const settingsJs = fs.readFileSync(path.join(ROOT, 'windows/js/settings.js'), 'utf8');
assert(settingsJs.includes("'email'"), 'settings.js must have email in WIDGET_ORDER');
assert(settingsJs.includes("'photo'"), 'settings.js must have photo in WIDGET_ORDER');
assert(settingsJs.includes('buildEmail()'), 'settings.js must define and call buildEmail');
assert(settingsJs.includes('buildPhoto()'), 'settings.js must define and call buildPhoto');
assert(settingsJs.includes("'s.email'"), 'settings.js must have s.email translation key');
assert(settingsJs.includes("'s.photo'"), 'settings.js must have s.photo translation key');
console.log('  ok  settings.js correctly manages email & photo configuration');

console.log('\nALL CHECKS PASSED SUCCESSFULLY! ✓\n');
