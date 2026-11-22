const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('TESTING NOTES LIST SCROLLING & FLEX LAYOUT INTEGRITY');
console.log('================================================================');

const notesCss = fs.readFileSync(path.join(__dirname, '../windows/css/notes.css'), 'utf8');
const notesJs = fs.readFileSync(path.join(__dirname, '../windows/js/notes.js'), 'utf8');
const notesHtml = fs.readFileSync(path.join(__dirname, '../windows/notes.html'), 'utf8');

// 1. Verify CSS flex chain for body, pane, listPane, and notes-scroll-container
console.log('\n[1/5] Verifying CSS flexbox height containment...');
assert(notesCss.includes('.body {\n  display: flex;\n  flex-direction: column;\n  flex: 1;'),
  '.body must have flex: 1 to fill available space below header without pushing past window plate');
assert(notesCss.includes('overflow: hidden;'), '.body must have overflow: hidden');
assert(notesCss.includes('#listPane {\n      flex: 1;\n      min-height: 0;\n      height: 100%;\n      display: flex;\n      flex-direction: column;\n      overflow: hidden;'),
  '#listPane must be constrained with flex: 1, height: 100%, overflow: hidden');

console.log('✅ CSS flex containment for .body and #listPane verified.');

// 2. Verify notes-scroll-container styling
console.log('\n[2/5] Verifying .notes-scroll-container scrollport styling...');
assert(notesCss.includes('.notes-scroll-container {'), 'notes.css must style .notes-scroll-container');
assert(notesCss.includes('overflow-y: auto !important;'), '.notes-scroll-container must have overflow-y: auto !important');
assert(notesCss.includes('-webkit-app-region: no-drag;'), '.notes-scroll-container must have -webkit-app-region: no-drag');
assert(notesCss.includes('.notes-scroll-container::-webkit-scrollbar'), '.notes-scroll-container must have custom webkit-scrollbar');
assert(notesCss.includes('.notes-scroll-container::-webkit-scrollbar-thumb'), '.notes-scroll-container must have custom webkit-scrollbar-thumb');

console.log('✅ .notes-scroll-container scrollport & scrollbar verified.');

// 3. Verify removal of conflicting scroll class from #noteList in notes.js
console.log('\n[3/5] Verifying #noteList does not trap scroll events...');
assert(!notesJs.includes('stagger scroll'), 'notes.js must NOT set "stagger scroll" on noteListEl to prevent overscroll-behavior: contain trapping');
assert(notesJs.includes('noteListEl.className = `notes ${viewMode === \'grid\' ? \'view-grid\' : \'view-list\'} stagger`;'),
  'notes.js should set stagger without scroll on noteListEl');

console.log('✅ #noteList does not trap scroll events.');

// 4. Verify smooth wheel delegation on #listPane
console.log('\n[4/5] Verifying list pane wheel event delegation...');
assert(notesJs.includes("listPaneEl.addEventListener('wheel'"), 'notes.js must attach wheel listener to listPaneEl');
assert(notesJs.includes("notesScrollEl.scrollTop += e.deltaY;"), 'notes.js must forward deltaY to notesScrollEl');

console.log('✅ Wheel event delegation verified.');

// 5. Verify HTML structure has #notesScrollContainer wrapping note lists
console.log('\n[5/5] Verifying HTML notes-scroll-container DOM structure...');
assert(notesHtml.includes('<div class="notes-scroll-container scroll" id="notesScrollContainer">'),
  'notes.html must contain #notesScrollContainer');
assert(notesHtml.includes('<ul class="notes view-grid pinned-notes" id="pinnedNoteList" hidden></ul>'),
  'notes.html must contain #pinnedNoteList inside scroll container');
assert(notesHtml.includes('<ul class="notes view-grid stagger" id="noteList"></ul>'),
  'notes.html must contain #noteList inside scroll container');

console.log('✅ DOM structure verified.');

console.log('\n================================================================');
console.log('🎉 ALL NOTES LIST SCROLL TESTS PASSED (100% SUCCESS) 🎉');
console.log('================================================================');
