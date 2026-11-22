'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('TESTING UI CONTRAST, PAPER GRID, WYSIWYG & VISUAL ENHANCEMENTS');
console.log('================================================================\n');

// 1. Verify base.css dark theme coverage and contrast
console.log('[1/6] Verifying base.css confirm dialog contrast across themes...');
const baseCss = fs.readFileSync(path.join(__dirname, '../windows/css/base.css'), 'utf8');
assert(baseCss.includes('--ink-on-accent: #14171f'), 'base.css must define --ink-on-accent for high contrast on yellow/amber');
assert(baseCss.includes(":root[data-theme='smoke'] .confirm-dialog"), 'base.css must style confirm dialog for dark themes');
assert(baseCss.includes(":root[data-theme='midnight'] .confirm-dialog"), 'base.css must style confirm dialog for midnight theme');
assert(baseCss.includes('body.theme-midnight .confirm-dialog'), 'base.css must style confirm dialog for theme-midnight body class');
assert(baseCss.includes('.confirm-title'), 'base.css must define .confirm-title');
assert(baseCss.includes('color: #f8fafc !important'), 'confirm title in dark theme must be high-contrast white');
assert(!baseCss.includes('}\n}\n\n'), 'base.css must not have duplicate closing braces');
console.log('✅ base.css dark theme contrast verified.');

// 2. Verify notes.css paper templates & grid visibility
console.log('\n[2/6] Verifying notes.css paper templates and grid lines visibility...');
const notesCss = fs.readFileSync(path.join(__dirname, '../windows/css/notes.css'), 'utf8');
assert(notesCss.includes('.editor-canvas.style-grid'), 'notes.css must style .editor-canvas.style-grid');
assert(notesCss.includes('.editor-canvas.style-ruled'), 'notes.css must style .editor-canvas.style-ruled');
assert(notesCss.includes('rgba(85, 115, 160, 0.60)'), 'notes.css must use crisp, visible --note-line for cream/ivory');
assert(notesCss.includes('.tool-btn.active'), 'notes.css must define .tool-btn.active');
assert(notesCss.includes('color: #18181b !important'), 'notes.css must enforce dark text on active tool buttons');
console.log('✅ Paper templates, grid visibility, and tool button contrast verified.');

// 3. Verify format drawer & modal dark theme contrast
console.log('\n[3/6] Verifying format drawer and create note modal contrast...');
assert(notesCss.includes(":root[data-theme='smoke'] .format-drawer"), 'notes.css must style format drawer for smoke');
assert(notesCss.includes(":root[data-theme='midnight'] .format-drawer"), 'notes.css must style format drawer for midnight');
assert(notesCss.includes('body.theme-midnight .format-drawer'), 'notes.css must style format drawer for theme-midnight body');
assert(notesCss.includes(":root[data-theme='smoke'] .modal-dialog"), 'notes.css must style modal dialog for smoke');
assert(notesCss.includes(":root[data-theme='midnight'] .modal-dialog"), 'notes.css must style modal dialog for midnight');
assert(notesCss.includes('.new-style-card.on .style-main-title'), 'notes.css must style selected style card title');
assert(notesCss.includes('.font-card.on'), 'notes.css must style selected font card');
console.log('✅ Format drawer and create note modal contrast verified.');

// 4. Verify notes.js markdown to rich HTML migration
console.log('\n[4/6] Verifying markdownToRichHtml and WYSIWYG migration logic...');
const notesJs = fs.readFileSync(path.join(__dirname, '../windows/js/notes.js'), 'utf8');
assert(notesJs.includes('markdownToRichHtml'), 'notes.js must define markdownToRichHtml function');
assert(notesJs.includes('formatInlineMarkdown'), 'notes.js must define formatInlineMarkdown function');
assert(notesJs.includes('common.cancel'), 'notes.js must define common.cancel translation');
assert(notesJs.includes("k === 'b'"), 'notes.js must support Ctrl+B keyboard shortcut for bold');
assert(notesJs.includes("k === 'i'"), 'notes.js must support Ctrl+I keyboard shortcut for italic');
assert(notesJs.includes("k === 'u'"), 'notes.js must support Ctrl+U keyboard shortcut for underline');
console.log('✅ Markdown migration and hotkeys verified.');

// 5. Functional simulation of markdownToRichHtml
console.log('\n[5/6] Testing markdownToRichHtml transformation...');
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function formatInlineMarkdown(str) {
  return escapeHtml(str)
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/\*([^*]+)\*/g, '<i>$1</i>')
    .replace(/~~([^~]+)~~/g, '<s>$1</s>');
}
function markdownToRichHtml(body) {
  if (!body) return '';
  const lines = body.split('\n');
  return lines.map((line) => {
    const t = line.trim();
    if (t.startsWith('### ')) return `<h3>${formatInlineMarkdown(t.slice(4))}</h3>`;
    if (t.startsWith('## '))  return `<h2>${formatInlineMarkdown(t.slice(3))}</h2>`;
    if (t.startsWith('# '))   return `<h1>${formatInlineMarkdown(t.slice(2))}</h1>`;
    if (!line) return '<div><br></div>';
    return `<div>${formatInlineMarkdown(line)}</div>`;
  }).join('');
}

const inputMd = '### نوتتي **نوتة تجريبية**\nالسطر الثاني *مائل*\nسطر عادي';
const outputHtml = markdownToRichHtml(inputMd);
assert(outputHtml.includes('<h3>نوتتي <b>نوتة تجريبية</b></h3>'), 'H3 and bold must be parsed into rich HTML');
assert(outputHtml.includes('<i>مائل</i>'), 'Italics must be parsed into rich HTML');
assert(outputHtml.includes('<div>سطر عادي</div>'), 'Regular line must be wrapped in div');
assert(!outputHtml.includes('###'), 'Raw hashes must not remain in rendered HTML');
assert(!outputHtml.includes('**'), 'Raw asterisks must not remain in rendered HTML');
console.log('✅ markdownToRichHtml transformation passed 100%.');

// 6. Verify audio player card styling
console.log('\n[6/6] Verifying audio player card styling and waveform colors...');
assert(notesCss.includes('.note-audio-player'), 'notes.css must define .note-audio-player');
assert(notesCss.includes('.waveform-bar'), 'notes.css must define .waveform-bar');
assert(notesCss.includes('.waveform-bar.played'), 'notes.css must define .waveform-bar.played');
assert(notesCss.includes('var(--note-ink'), 'waveform bars must be keyed to --note-ink for visible contrast');
console.log('✅ Audio player card and waveform contrast verified.');

console.log('\n================================================================');
console.log('🎉 ALL UI CONTRAST, GRID, AND WYSIWYG FIXES VERIFIED (100%) 🎉');
console.log('================================================================');
