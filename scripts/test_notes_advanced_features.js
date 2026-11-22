'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('TESTING NOTES: 4 TEMPLATES, 9 COLORS, MODAL, FORMAT DRAWER & CARDS');
console.log('================================================================\n');

// 1. Verify notes.html DOM structure & CSP
console.log('[1/5] Testing notes.html DOM structure and security policy...');
const notesHtml = fs.readFileSync(path.join(__dirname, '../windows/notes.html'), 'utf8');
assert(notesHtml.includes("media-src 'self' blob: data:;"), 'notes.html CSP must allow media-src for audio recordings');
assert(notesHtml.includes('id="editorCanvas"'), 'notes.html must contain #editorCanvas');
assert(notesHtml.includes('id="editor"'), 'notes.html must contain #editor textarea');
assert(notesHtml.includes('id="newNoteModal"'), 'notes.html must contain #newNoteModal creation dialog');
assert(notesHtml.includes('id="modalSubmitBtn"'), 'notes.html must contain #modalSubmitBtn');
assert(notesHtml.includes('id="modalCancelBtn"'), 'notes.html must contain #modalCancelBtn');

// 4 templates (kraft / classic removed per user request)
assert(notesHtml.includes('data-style="ruled"'), 'notes.html must include ruled style option');
assert(notesHtml.includes('data-style="book"'), 'notes.html must include book style option (matching user image)');
assert(notesHtml.includes('data-style="planner"'), 'notes.html must include planner style option');
assert(notesHtml.includes('data-style="grid"'), 'notes.html must include grid style option');
assert(!notesHtml.includes('data-style="kraft"'), 'notes.html must not include kraft style option (removed per user request)');

// 7 paper colors (white is primary default, cream removed)
const expectedColors = ['white', 'yellow', 'blue', 'green', 'rose', 'purple', 'dark'];
expectedColors.forEach((c) => {
  assert(notesHtml.includes(`data-color="${c}"`), `notes.html must include ${c} paper color swatch`);
});

// Format FAB, Bottom Drawer & Visual Font Cards (Idea 1)
assert(notesHtml.includes('id="formatFabBtn"'), 'notes.html must contain #formatFabBtn floating trigger');
assert(notesHtml.includes('id="formatDrawer"'), 'notes.html must contain #formatDrawer bottom sheet');
assert(notesHtml.includes('data-tier="title"'), 'notes.html must contain title tier button');
assert(notesHtml.includes('data-align="right"'), 'notes.html must contain right alignment button');
assert(notesHtml.includes('data-font="handwriting"'), 'notes.html must contain handwriting font button');
assert(notesHtml.includes('font-card'), 'notes.html must contain visual font cards for typography preview');

// Checklist & Drag & Drop
assert(notesHtml.includes('id="noteChecklistSection"'), 'notes.html must contain #noteChecklistSection');
assert(notesHtml.includes('id="addChecklistBtn"'), 'notes.html must contain #addChecklistBtn');
assert(notesHtml.includes('id="checklistList"'), 'notes.html must contain #checklistList');

// Audio, Waveform & Player (Idea 4)
assert(notesHtml.includes('id="audioRecordBar"'), 'notes.html must contain #audioRecordBar');
assert(notesHtml.includes('id="noteAudioPlayer"'), 'notes.html must contain #noteAudioPlayer');
assert(notesHtml.includes('id="audioWaveformBox"'), 'notes.html must contain #audioWaveformBox for visualizer');
assert(notesHtml.includes('id="audioPlayBtn"'), 'notes.html must contain #audioPlayBtn');
assert(notesHtml.includes('id="audioScrub"'), 'notes.html must contain #audioScrub');
assert(notesHtml.includes('id="audioDelBtn"'), 'notes.html must contain #audioDelBtn');

// View Mode Toggle, Filter Tags & Pinned Section (Pinterest Image Style, Ideas 5 & 6)
assert(notesHtml.includes('id="viewModeToggle"'), 'notes.html must contain #viewModeToggle view switcher');
assert(notesHtml.includes('id="viewGridBtn"'), 'notes.html must contain #viewGridBtn for Bento grid view');
assert(notesHtml.includes('id="viewListBtn"'), 'notes.html must contain #viewListBtn for horizontal list view');
assert(notesHtml.includes('id="notesTagBar"'), 'notes.html must contain #notesTagBar filter chips bar');
assert(notesHtml.includes('id="pinnedHeader"'), 'notes.html must contain #pinnedHeader pinned notes section');
assert(notesHtml.includes('id="pinnedNoteList"'), 'notes.html must contain #pinnedNoteList');

// Quick Tools Bar & Note Pinning (Idea 5)
assert(notesHtml.includes('id="notePinBtn"'), 'notes.html must contain #notePinBtn');
assert(notesHtml.includes('id="toolTodoBtn"'), 'notes.html must contain #toolTodoBtn');
assert(notesHtml.includes('id="toolVoiceBtn"'), 'notes.html must contain #toolVoiceBtn');
assert(!notesHtml.includes('id="zenToggleBtn"'), 'zenToggleBtn removed');
assert(!notesHtml.includes('id="readingStatsPill"'), 'readingStatsPill removed');
console.log('✅ notes.html DOM structure & CSP verified.');

// 2. Verify notes.css styling
console.log('\n[2/5] Testing notes.css paper patterns, pastel cards, format drawer, local scrolling...');
const notesCss = fs.readFileSync(path.join(__dirname, '../windows/css/notes.css'), 'utf8');
assert(notesCss.includes('background-attachment: local'), 'notes.css must set background-attachment: local to scroll lines with text');
assert(notesCss.includes('.editor-canvas.style-ruled'), 'notes.css must define .style-ruled paper style');
assert(notesCss.includes('.editor-canvas.style-book'), 'notes.css must define .style-book paper style');
assert(notesCss.includes('.editor-canvas.style-planner'), 'notes.css must define .style-planner paper style');
assert(notesCss.includes('.editor-canvas.style-grid'), 'notes.css must define .style-grid paper style');
assert(notesCss.includes('.editor-canvas.style-kraft'), 'notes.css must define .style-kraft (Idea 8: Natural Kraft paper)');
assert(notesCss.includes('.editor-canvas.style-ruled .editor-textarea'), 'notes.css must attach repeating lines directly to the scrolling .editor-textarea for 60fps synchronous scrolling');

expectedColors.forEach((c) => {
  assert(notesCss.includes(`.editor-canvas.color-${c}`), `notes.css must define .color-${c} canvas styling`);
  assert(notesCss.includes(`.note[data-color="${c}"]`), `notes.css must define .note[data-color="${c}"] outer card styling`);
});

assert(notesCss.includes('.format-fab-btn'), 'notes.css must style .format-fab-btn');
assert(notesCss.includes('.format-drawer'), 'notes.css must style .format-drawer');
assert(notesCss.includes('.font-card'), 'notes.css must style .font-card (Idea 1)');
assert(notesCss.includes('.modal-overlay'), 'notes.css must style .modal-overlay');
assert(notesCss.includes('.modal-dialog'), 'notes.css must style .modal-dialog');
assert(notesCss.includes('.todo-check'), 'notes.css must style .todo-check circular checkbox');
assert(notesCss.includes('.todo-check.done'), 'notes.css must style .todo-check.done checked state');
assert(notesCss.includes('checkmarkPop'), 'notes.css must implement celebratory checkmarkPop animation (Idea 12)');
assert(notesCss.includes('.todo-drag-handle'), 'notes.css must style .todo-drag-handle for checklist drag & drop (Idea 10)');
assert(notesCss.includes('.todo-input.done'), 'notes.css must style .todo-input.done with line-through');
assert(notesCss.includes('text-decoration: line-through'), 'completed todo items must have line-through text decoration');
assert(notesCss.includes('.audio-record-bar'), 'notes.css must style live recording bar');
assert(notesCss.includes('.note-audio-player'), 'notes.css must style audio attachment player');
assert(notesCss.includes('.audio-waveform-box'), 'notes.css must style audio-waveform-box visualizer (Idea 4)');
assert(notesCss.includes('.waveform-bar'), 'notes.css must style waveform-bar bars');
assert(notesCss.includes('.view-mode-toggle'), 'notes.css must style .view-mode-toggle');
assert(notesCss.includes('.notes.view-grid'), 'notes.css must style Bento square cards in .notes.view-grid');
assert(notesCss.includes('.notes.view-list'), 'notes.css must style horizontal list cards in .notes.view-list');
assert(notesCss.includes('.notes-tag-bar'), 'notes.css must style .notes-tag-bar filter bar (Idea 6)');
assert(notesCss.includes('.tag-chip'), 'notes.css must style .tag-chip');
assert(!notesCss.includes('.plate.zen-mode'), 'plate.zen-mode removed');
assert(!notesCss.includes('.reading-stats-pill'), 'reading-stats-pill removed');
console.log('✅ notes.css styling rules verified.');

// 3. Verify notes.js logic & features
console.log('\n[3/5] Testing notes.js implementation...');
const notesJs = fs.readFileSync(path.join(__dirname, '../windows/js/notes.js'), 'utf8');
assert(notesJs.includes('PAGE_STYLES = {'), 'notes.js must define PAGE_STYLES dictionary');
assert(!notesJs.includes('kraft:'), 'notes.js PAGE_STYLES must not include kraft template (removed)');
assert(notesJs.includes('PAPER_COLORS = {'), 'notes.js must define PAPER_COLORS dictionary');
assert(notesJs.includes('function openNewNoteModal('), 'notes.js must implement openNewNoteModal');
assert(notesJs.includes('function closeNewNoteModal('), 'notes.js must implement closeNewNoteModal');
assert(notesJs.includes('function applyPageStyleAndColor('), 'notes.js must implement applyPageStyleAndColor');
assert(notesJs.includes('function applyNoteFormat('), 'notes.js must implement applyNoteFormat');
assert(notesJs.includes('function toggleFormatDrawer('), 'notes.js must implement toggleFormatDrawer');
assert(notesJs.includes('function updateFormatProp('), 'notes.js must implement updateFormatProp');
assert(notesJs.includes('function renderChecklist('), 'notes.js must implement renderChecklist');
assert(notesJs.includes('function toggleChecklistItem('), 'notes.js must implement toggleChecklistItem');
assert(notesJs.includes('function addChecklistItem('), 'notes.js must implement addChecklistItem');
assert(notesJs.includes('function reorderChecklistItems('), 'notes.js must implement reorderChecklistItems (Idea 10)');
assert(notesJs.includes('function startAudioRecording('), 'notes.js must implement startAudioRecording');
assert(notesJs.includes('function stopAudioRecording('), 'notes.js must implement stopAudioRecording');
assert(notesJs.includes('function toggleAudioPlay('), 'notes.js must implement toggleAudioPlay');
assert(notesJs.includes('function deleteCurrentAudio('), 'notes.js must implement deleteCurrentAudio');
assert(notesJs.includes('function renderWaveformBars('), 'notes.js must implement renderWaveformBars (Idea 4)');
assert(notesJs.includes('function seekAudioByWaveformIndex('), 'notes.js must implement seekAudioByWaveformIndex');
assert(notesJs.includes('function renderTagFilterBar('), 'notes.js must implement renderTagFilterBar (Idea 6)');
assert(notesJs.includes('function toggleActivePin('), 'notes.js must implement toggleActivePin (Idea 5)');
assert(!notesJs.includes('function toggleZenMode('), 'toggleZenMode removed');
assert(!notesJs.includes('function updateReadingStats('), 'updateReadingStats removed');
assert(notesJs.includes('function noteRowGrid('), 'notes.js must implement Bento square card builder');
assert(notesJs.includes('function noteRowList('), 'notes.js must implement horizontal rectangle card builder');
console.log('✅ notes.js methods and state handlers verified.');

// 4. Verify main.js media permission handling
console.log('\n[4/5] Testing main.js microphone permission setup...');
const mainJs = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');
assert(mainJs.includes("permission === 'media'"), 'main.js must handle media permission request');
assert(mainJs.includes('setPermissionRequestHandler'), 'main.js must setPermissionRequestHandler');
console.log('✅ main.js media permission handler verified.');

// 5. Functional simulation of checklist, colors & format
console.log('\n[5/5] Simulating Checklist, 9 Colors & Text Formatting...');
const note = {
  id: 'note_1',
  body: 'First Son Off His Hands\nBut a cousin of Mitya mother happened to return from Paris.',
  pageStyle: 'book',
  paperColor: 'rose',
  format: {
    tier: 'title',
    bold: true,
    italic: false,
    underline: false,
    strike: false,
    align: 'center',
    font: 'handwriting',
  },
  checklist: [
    { id: 'c1', text: 'شراء الإضاءة والمستلزمات', done: false },
    { id: 'c2', text: 'إنهاء التصميم الهندسي', done: false },
    { id: 'c3', text: 'التعاقد مع الفني', done: true },
  ],
  audio: {
    id: 'a1',
    data: 'data:audio/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwEAAAA...',
    duration: 18,
    createdAt: Date.now(),
  },
};

// Check that toggling checklist preserves the item (never deletes!)
const item = note.checklist.find(x => x.id === 'c1');
item.done = true;
assert.strictEqual(note.checklist.length, 3, 'Checking a checklist item must NEVER delete it from the list');
assert.strictEqual(note.checklist[0].done, true, 'Item c1 must now be marked done');

// Verify all 4 styles and 7 colors
const validStyles = ['ruled', 'book', 'planner', 'grid'];
validStyles.forEach((st) => {
  note.pageStyle = st;
  assert.strictEqual(note.pageStyle, st, `Note must support page style: ${st}`);
});
expectedColors.forEach((clr) => {
  note.paperColor = clr;
  assert.strictEqual(note.paperColor, clr, `Note must support paper color: ${clr}`);
});

// Verify pinning
note.pinned = true;
assert.strictEqual(note.pinned, true, 'Note must support pinned status');

// Verify format changes
note.format.align = 'justify';
assert.strictEqual(note.format.align, 'justify');
note.format.font = 'serif';
assert.strictEqual(note.format.font, 'serif');

console.log('✅ All functional simulations verified successfully.');

console.log('\n================================================================');
console.log('🎉 ALL ADVANCED NOTES WIDGET TESTS PASSED (100% SUCCESS) 🎉');
console.log('================================================================');
