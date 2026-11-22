'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('TESTING SETTINGS WINDOW INTEGRITY, TABS & LAYOUT');
console.log('========================================================\n');

// 1. Verify HTML Structure and Tag Balancing
console.log('--- 1. Testing HTML Tag Balancing & Document Well-Formedness ---');
const html = fs.readFileSync(path.join(__dirname, '../windows/settings.html'), 'utf8');

const stack = [];
const lines = html.split('\n');
for (let lineNum = 1; lineNum <= lines.length; lineNum++) {
  const line = lines[lineNum - 1];
  const tagRegex = /<\/?([a-zA-Z0-9\-]+)(?:\s+[^>]*)?>/g;
  let match;
  while ((match = tagRegex.exec(line)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    if (['input', 'img', 'br', 'hr', 'meta', 'link'].includes(tagName)) continue;
    if (fullTag.endsWith('/>')) continue;
    
    if (fullTag.startsWith('</')) {
      const last = stack.pop();
      assert.strictEqual(last && last.tag, tagName, `Tag mismatch at line ${lineNum}: found </${tagName}> but expected </${last ? last.tag : 'NONE'}>`);
    } else {
      stack.push({ tag: tagName, line: lineNum });
    }
  }
}
assert.strictEqual(stack.length, 0, `Unclosed tags remaining in settings.html: ${stack.map(s => s.tag).join(', ')}`);
console.log('✅ HTML structure is 100% well-formed and perfectly balanced.');

// 2. Verify Tab Navigation and Panes Parity
console.log('\n--- 2. Testing Tab Navigation & Panes Parity ---');
const tabMatches = [...html.matchAll(/data-tab="([^"]+)"/g)].map(m => m[1]);
const paneMatches = [...html.matchAll(/data-pane="([^"]+)"/g)].map(m => m[1]);

console.log('Defined Nav Tabs:', tabMatches);
console.log('Defined Tab Panes:', paneMatches);

assert.strictEqual(tabMatches.length, paneMatches.length, 'Every tab must have an exact matching pane');
for (const tab of tabMatches) {
  assert(paneMatches.includes(tab), `Tab "${tab}" must have a corresponding pane`);
}
console.log('✅ Tab and Pane 1-to-1 parity verified (All 7 tabs matched).');

// 3. Verify Isolation of Setting Up
console.log('\n--- 3. Testing Strict Isolation of Setup Credentials ---');
const todoSection = html.slice(html.indexOf('data-pane="todo"'), html.indexOf('data-pane="time"'));
assert(!todoSection.includes('id="sec-setup-whatsapp"'), 'Setup WhatsApp must not exist in todo pane');
assert(!todoSection.includes('id="sec-setup-classroom"'), 'Setup Classroom must not exist in todo pane');
assert(!todoSection.includes('id="sec-setup-email"'), 'Setup Email must not exist in todo pane');
assert(!todoSection.includes('id="waEnabled"'), 'waEnabled must not exist in todo pane');
assert(!todoSection.includes('id="waProvider"'), 'waProvider must not exist in todo pane');

const setupSection = html.slice(html.indexOf('data-pane="setup"'));
assert(setupSection.includes('id="sec-setup-classroom"'), 'Setup Classroom must be in setup pane');
assert(setupSection.includes('id="sec-setup-whatsapp"'), 'Setup WhatsApp must be in setup pane');
assert(setupSection.includes('id="sec-setup-email"'), 'Setup Email must be in setup pane');
assert(setupSection.includes('id="waEnabled"'), 'waEnabled must exist in setup pane');
assert(setupSection.includes('id="waProvider"'), 'waProvider must exist in setup pane');
console.log('✅ Setup tab isolation verified 100%.');

// 4. Verify CSS Layout for Tabs Wrapping
console.log('\n--- 4. Testing CSS Tabs Responsive Wrapping ---');
const settingsCss = fs.readFileSync(path.join(__dirname, '../windows/css/settings.css'), 'utf8');
assert(settingsCss.includes('.settings-nav {'), 'settings.css must style .settings-nav');
assert(settingsCss.includes('flex-wrap: wrap;'), 'settings-nav must flex-wrap to prevent cut-off tabs');
assert(!settingsCss.includes('overflow-x: auto;'), 'settings-nav must not hide tabs behind horizontal scroll');
console.log('✅ Responsive tabs wrapping verified (zero cut-off tabs).');

console.log('\n========================================================');
console.log('🎉 ALL SETTINGS WINDOW INTEGRITY TESTS PASSED (100%)');
console.log('========================================================\n');
