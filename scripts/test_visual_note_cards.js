'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('TESTING VISUAL NOTE CARDS: LAYOUT, HIERARCHY & ZERO REPETITION');
console.log('================================================================\n');

const cssPath = path.join(__dirname, '../windows/css/notes.css');
const jsPath = path.join(__dirname, '../windows/js/notes.js');

const notesCss = fs.readFileSync(cssPath, 'utf8');
const notesJs = fs.readFileSync(jsPath, 'utf8');

// 1. Verify pill removal & zero repetition
console.log('[1/4] Verifying removal of clutter pills and repetitive badge text...');
assert(!notesJs.includes("class: 'note-style-chip'"), 'noteRowGrid must NOT render .note-style-chip');
assert(!notesJs.includes("class: 'note-bento-cta'"), 'noteRowGrid must NOT render .note-bento-cta');
// previewOf should not blindly push raw badge string representations
assert(!notesJs.includes("parts.push(`☑️ ${digits(doneCount)}/${digits(note.checklist.length)}`);"), 'previewOf must not dump raw checklist count text into preview string');
assert(!notesJs.includes("parts.push(`🎙️ ${formatSecs(audios[0].duration || 0)}`);"), 'previewOf must not dump raw audio duration text into preview string');
console.log('✅ Zero repetition: No badges dumped into preview text.');

// 2. Verify clean corner pin and structured footer
console.log('\n[2/4] Verifying layout hierarchy (corner pin, title, preview, footer chips)...');
assert(notesJs.includes("class: 'note-pin-corner'"), 'Must render .note-pin-corner for pinned notes');
assert(notesJs.includes("class: 'note-meta-chips'"), 'Must render .note-meta-chips container in footer');
assert(notesJs.includes("class: 'note-when'"), 'Must render .note-when timestamp');
assert(notesCss.includes('.note-pin-corner'), 'Must style .note-pin-corner');
assert(notesCss.includes('.note-meta-chip'), 'Must style .note-meta-chip');
assert(notesCss.includes('border-top: 1px solid'), 'Footer must have subtle divider border-top');
console.log('✅ Clean hierarchy and organized footer verified.');

// 3. Verify visual paper styles directly on the note card
console.log('\n[3/4] Verifying visual paper styles directly on card squares (.note[data-style])...');
assert(notesCss.includes('.note[data-style="ruled"]'), 'Must style .note[data-style="ruled"] with notebook lines');
assert(notesCss.includes('.note[data-color="dark"][data-style="ruled"]'), 'Must style dark ruled cards');
assert(notesCss.includes('.note[data-style="grid"]'), 'Must style .note[data-style="grid"] with grid squares');
assert(notesCss.includes('.note[data-color="dark"][data-style="grid"]'), 'Must style dark grid cards');
assert(notesCss.includes('.note[data-style="book"]'), 'Must style .note[data-style="book"] with book spine / margins');
assert(notesCss.includes('.note[data-style="planner"]'), 'Must style .note[data-style="planner"] with top accent & organizational lines');
assert(notesCss.includes('.note[data-style="kraft"]'), 'Must style .note[data-style="kraft"] with parchment texture & dashed border');
console.log('✅ All 5 note styles are visually self-describing on the cards.');

// 4. Verify card background colors do not wipe out pattern images
console.log('\n[4/4] Verifying background-color usage for card swatches...');
assert(notesCss.includes('.note[data-color="white"]  { background-color:'), 'Card color swatches must use background-color so background-image pattern is preserved');
assert(notesCss.includes('.note[data-color="yellow"] { background-color:'), 'Yellow card swatch must use background-color');
assert(notesCss.includes('.note[data-color="green"]'), 'Green card swatch defined');
assert(notesCss.includes('.note[data-color="blue"]'), 'Blue card swatch defined');
assert(notesCss.includes('.note[data-color="purple"]'), 'Purple card swatch defined');
assert(notesCss.includes('.note[data-color="dark"]'), 'Dark card swatch defined');
console.log('✅ Card colors preserve and display paper patterns.');

console.log('\n================================================================');
console.log('🎉 ALL VISUAL NOTE CARD TESTS PASSED (100% SUCCESS) 🎉');
console.log('================================================================');
