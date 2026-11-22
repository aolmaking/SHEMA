'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== Running Email Reader Viewport Optimization Tests ===');

// Test 1: Check email.html
const emailHtml = fs.readFileSync(path.join(__dirname, '../windows/email.html'), 'utf8');
assert(emailHtml.includes('reader-top-bar'), 'email.html must contain reader-top-bar');
assert(emailHtml.includes('reader-body-wrapper'), 'email.html must contain reader-body-wrapper');
assert(emailHtml.includes('readerCloseWinBtn'), 'email.html must contain readerCloseWinBtn in reader top bar');
console.log('✔ Test 1: email.html contains streamlined reader bar and maximized body wrapper');

// Test 2: Check email.css
const emailCss = fs.readFileSync(path.join(__dirname, '../windows/css/email.css'), 'utf8');
assert(emailCss.includes('.plate.reader-active .head'), 'email.css must hide .head when reader is active');
assert(emailCss.includes('display: none !important'), 'email.css must set display: none !important on header');
assert(emailCss.includes('.reader-body-wrapper'), 'email.css must style .reader-body-wrapper');
console.log('✔ Test 2: email.css suppresses widget header and maximizes internal body area');

// Test 3: Check email.js
const emailJs = fs.readFileSync(path.join(__dirname, '../windows/js/email.js'), 'utf8');
assert(emailJs.includes("classList.add('reader-active')"), 'email.js must add reader-active on openReader');
assert(emailJs.includes("classList.remove('reader-active')"), 'email.js must remove reader-active on closeReader');
assert(emailJs.includes('readerCloseWinBtn'), 'email.js must bind close button on reader top bar');
console.log('✔ Test 3: email.js toggles reader-active class seamlessly');

console.log('=== All Email Reader Viewport Tests Passed! ===\n');
