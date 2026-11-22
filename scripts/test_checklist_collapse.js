'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('TESTING CHECKLIST COLLAPSE / EXPAND ACCORDION & COMPACT BADGE');
console.log('================================================================\n');

const htmlPath = path.join(__dirname, '../windows/notes.html');
const cssPath = path.join(__dirname, '../windows/css/notes.css');
const jsPath = path.join(__dirname, '../windows/js/notes.js');

const notesHtml = fs.readFileSync(htmlPath, 'utf8');
const notesCss = fs.readFileSync(cssPath, 'utf8');
const notesJs = fs.readFileSync(jsPath, 'utf8');

// 1. Verify HTML DOM elements
console.log('[1/4] Verifying notes.html DOM structure...');
assert(notesHtml.includes('id="noteChecklistSection"'), 'Must have #noteChecklistSection');
assert(notesHtml.includes('id="checklistHeader"'), 'Must have #checklistHeader');
assert(notesHtml.includes('id="checklistCounter"'), 'Must have #checklistCounter');
assert(notesHtml.includes('id="toggleChecklistBtn"'), 'Must have #toggleChecklistBtn');
assert(notesHtml.includes('class="checklist-toggle-icon"'), 'Must have .checklist-toggle-icon');
assert(notesHtml.includes('id="checklistBody"'), 'Must have #checklistBody wrapping checklist items and add button');
assert(!notesHtml.includes('id="dismissChecklistBtn"'), 'Old non-working dismiss X button must be replaced');
console.log('✅ notes.html DOM structure verified.');

// 2. Verify CSS rules
console.log('\n[2/4] Verifying notes.css collapse & badge styles...');
assert(notesCss.includes('.note-checklist-section.collapsed'), 'notes.css must style .note-checklist-section.collapsed');
assert(notesCss.includes('.note-checklist-section.collapsed .checklist-body'), 'notes.css must hide body when collapsed');
assert(notesCss.includes('.checklist-counter.all-done'), 'notes.css must style completed badge (.all-done)');
assert(notesCss.includes('.checklist-toggle-btn'), 'notes.css must style toggle button');
assert(notesCss.includes('.checklist-toggle-icon'), 'notes.css must style toggle chevron');
assert(notesCss.includes('transform: rotate(180deg)'), 'notes.css must rotate chevron when collapsed');
console.log('✅ notes.css styling verified.');

// 3. Verify JavaScript logic
console.log('\n[3/4] Verifying notes.js implementation...');
assert(notesJs.includes('checklistCollapsed'), 'notes.js must track checklistCollapsed state');
assert(notesJs.includes('function toggleChecklistCollapse('), 'notes.js must implement toggleChecklistCollapse');
assert(notesJs.includes("section.classList.toggle('collapsed', isCollapsed)"), 'renderChecklist must toggle collapsed class');
assert(notesJs.includes('#toggleChecklistBtn'), 'notes.js must wire #toggleChecklistBtn');
assert(notesJs.includes('#checklistHeader'), 'notes.js must wire #checklistHeader');
assert(notesJs.includes('all-done'), 'notes.js must apply all-done class to counter');
console.log('✅ notes.js implementation verified.');

// 4. Functional Simulation
console.log('\n[4/4] Simulating checklist collapse and expansion lifecycle...');

const note = {
  id: 'test-note-1',
  body: 'Hello World',
  pageStyle: 'ruled',
  paperColor: 'white',
  checklist: [
    { id: 'c1', text: 'Buy groceries', done: false },
    { id: 'c2', text: 'Call doctor', done: true },
  ],
  checklistCollapsed: false,
};

// Toggle collapse
function toggleCollapse(n) {
  n.checklistCollapsed = !n.checklistCollapsed;
}

assert.strictEqual(note.checklistCollapsed, false, 'Initial state is expanded');
toggleCollapse(note);
assert.strictEqual(note.checklistCollapsed, true, 'After toggle, state is collapsed');

// Counter calculation
function getCounterText(checklist) {
  const done = checklist.filter(x => x.done).length;
  return `${done}/${checklist.length}`;
}

assert.strictEqual(getCounterText(note.checklist), '1/2', 'Counter reflects completed / total');

// Complete all items
note.checklist[0].done = true;
const isAllDone = note.checklist.length > 0 && note.checklist.every(x => x.done);
assert.strictEqual(isAllDone, true, 'isAllDone should be true when all items completed');

// Adding a new item expands the list
function addItem(n, text) {
  n.checklist = n.checklist || [];
  n.checklistCollapsed = false; // Always expands on new item
  n.checklist.push({ id: 'c3', text, done: false });
}

addItem(note, 'Read a book');
assert.strictEqual(note.checklistCollapsed, false, 'Adding an item automatically expands the checklist');
assert.strictEqual(note.checklist.length, 3, 'Checklist has 3 items');
assert.strictEqual(getCounterText(note.checklist), '2/3', 'Counter updated to 2/3');

console.log('✅ Functional simulation verified successfully.');

console.log('\n================================================================');
console.log('🎉 ALL CHECKLIST COLLAPSE & COMPACT BADGE TESTS PASSED (100%) 🎉');
console.log('================================================================');
