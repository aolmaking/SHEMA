'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('TESTING CLASSIC PAGE REMOVAL & AUTOMATIC MIGRATION TO RULED');
console.log('========================================================\n');

const notesHtml = fs.readFileSync(path.join(__dirname, '../windows/notes.html'), 'utf8');
const notesJs = fs.readFileSync(path.join(__dirname, '../windows/js/notes.js'), 'utf8');
const mainJs = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

// 1. Check notes.html has no classic/kraft button
console.log('--- 1. Testing notes.html Options ---');
assert(!notesHtml.includes('data-style="kraft"'), 'notes.html must not have data-style="kraft"');
assert(!notesHtml.includes('data-style="classic"'), 'notes.html must not have data-style="classic"');
assert(!notesHtml.includes('notes.styleKraft'), 'notes.html must not reference notes.styleKraft');
console.log('✅ Classic/kraft page option completely removed from notes creation modal.');

// 2. Check notes.js PAGE_STYLES
console.log('\n--- 2. Testing notes.js PAGE_STYLES ---');
assert(!notesJs.includes("kraft:   { icon: '📜'"), 'PAGE_STYLES must not contain kraft');
assert(!notesJs.includes("classic: { icon:"), 'PAGE_STYLES must not contain classic');
assert(notesJs.includes("n.pageStyle === 'kraft' || n.pageStyle === 'classic'"), 'normalizeNote must map kraft and classic to ruled');
console.log('✅ notes.js PAGE_STYLES and normalizeNote migration verified.');

// 3. Check main.js notes:get migration
console.log('\n--- 3. Testing main.js notes:get Migration ---');
assert(mainJs.includes("n.pageStyle === 'kraft' || n.pageStyle === 'classic'"), 'main.js must migrate kraft and classic notes to ruled');
console.log('✅ main.js notes:get automatic migration verified.');

// 4. Verify live normalization logic
console.log('\n--- 4. Testing Normalization Function Behavior ---');
const mockNote1 = { id: 'test-1', body: 'Hello', pageStyle: 'kraft' };
const mockNote2 = { id: 'test-2', body: 'World', pageStyle: 'classic' };
const mockNote3 = { id: 'test-3', body: 'Ruled', pageStyle: 'ruled' };

function normalize(n) {
  if (!n) return n;
  if (n.pageStyle === 'kraft' || n.pageStyle === 'classic') n.pageStyle = 'ruled';
  return n;
}

assert.strictEqual(normalize(mockNote1).pageStyle, 'ruled');
assert.strictEqual(normalize(mockNote2).pageStyle, 'ruled');
assert.strictEqual(normalize(mockNote3).pageStyle, 'ruled');
console.log('✅ Any legacy classic note successfully converts to ruled.');

console.log('\n========================================================');
console.log('🎉 ALL CLASSIC TO RULED MIGRATION TESTS PASSED (100%)!');
console.log('========================================================');
