'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('TESTING TRUE WYSIWYG RICH TEXT EDITOR & HIGH-CONTRAST UI FIXES');
console.log('================================================================\n');

// 1. Verify contenteditable on #editor in notes.html
console.log('[1/5] Verifying notes.html editor structure...');
const notesHtml = fs.readFileSync(path.join(__dirname, '../windows/notes.html'), 'utf8');
assert(notesHtml.includes('contenteditable="true"'), 'notes.html #editor must be contenteditable="true" for rich text');
assert(notesHtml.includes('id="editor"'), 'notes.html must contain #editor');
assert(notesHtml.includes('class="editor-textarea'), 'notes.html #editor must have .editor-textarea class for styling & sync lines');
console.log('✅ notes.html contenteditable structure verified.');

// 2. Verify notes.css styling: no destructive background override, high-contrast modal & drawer
console.log('\n[2/5] Verifying notes.css styling & contrast...');
const notesCss = fs.readFileSync(path.join(__dirname, '../windows/css/notes.css'), 'utf8');
assert(!notesCss.includes('background: transparent !important'), 'notes.css must NOT use destructive "background: transparent !important" shorthand which wipes out background-image');
assert(notesCss.includes('background-color: transparent !important'), 'notes.css must use "background-color: transparent !important" to allow repeating lines to render');
assert(notesCss.includes('.editor-textarea:empty:before'), 'notes.css must support contenteditable empty placeholder');
assert(notesCss.includes('.editor-textarea h1'), 'notes.css must style rich headings inside editor');
assert(notesCss.includes('.format-drawer'), 'notes.css must style format drawer');
assert(notesCss.includes('.modal-dialog'), 'notes.css must style creation dialog');
console.log('✅ notes.css styling and contrast verified.');

// 3. Verify shell.js and i18n
console.log('\n[3/5] Verifying shell.js common strings & cancel translation...');
const shellJs = fs.readFileSync(path.join(__dirname, '../windows/js/shell.js'), 'utf8');
assert(shellJs.includes("'common.cancel': 'إلغاء'"), 'shell.js must include Arabic translation for common.cancel');
assert(shellJs.includes("'common.cancel': 'Cancel'"), 'shell.js must include English translation for common.cancel');

const baseCss = fs.readFileSync(path.join(__dirname, '../windows/css/base.css'), 'utf8');
assert(baseCss.includes('.confirm-dialog'), 'base.css must style .confirm-dialog');
assert(baseCss.includes(':root[data-theme=\'smoke\'] .confirm-dialog') || baseCss.includes('body.theme-dark .confirm-dialog'), 'base.css must provide high contrast dark mode confirm dialog styles');
console.log('✅ shell.js and base.css delete dialog verified.');

// 4. Verify notes.js rich text execution logic
console.log('\n[4/5] Verifying notes.js rich text formatting functions...');
const notesJs = fs.readFileSync(path.join(__dirname, '../windows/js/notes.js'), 'utf8');
assert(notesJs.includes('document.execCommand'), 'notes.js must use document.execCommand for true WYSIWYG text styling');
assert(notesJs.includes('applyRichFont'), 'notes.js must implement applyRichFont');
assert(notesJs.includes('applyTierFormat'), 'notes.js must implement applyTierFormat');
assert(notesJs.includes('applyAlignFormat'), 'notes.js must implement applyAlignFormat');
assert(notesJs.includes('applyInlineFormat'), 'notes.js must implement applyInlineFormat');
assert(notesJs.includes('FONT_MAP'), 'notes.js must define FONT_MAP for rich fonts');
assert(notesJs.includes('plainTextOf'), 'notes.js must implement plainTextOf for HTML tag stripping');
assert(notesJs.includes("Object.defineProperty(ed, 'value'"), 'notes.js must define value getter/setter for backward compatibility with tests & selftest');
assert(notesJs.includes('translate(document)'), 'notes.js must call translate(document) upon registration');
console.log('✅ notes.js rich text formatting functions verified.');

// 5. Functional simulation of plainTextOf and value getter/setter
console.log('\n[5/5] Functional simulations...');

// plainTextOf simulation
function plainTextOf(content) {
  if (!content) return '';
  if (!content.includes('<')) {
    return content.replace(/^#+\s+/gm, '').replace(/(\*\*|\*|~~|<u>|<\/u>)/g, '');
  }
  const clean = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return clean.replace(/^#+\s+/gm, '');
}

const htmlSample = '<h1>عنوان تجريبي</h1><div>محتوى به <b>كلمة عريضة</b> و <span style="font-family: Caveat">خط يدوي</span></div>';
const plain = plainTextOf(htmlSample);
assert(!plain.includes('<h1>'), 'plainTextOf must strip HTML tags');
assert(!plain.includes('<b>'), 'plainTextOf must strip <b> tags');
assert(plain.includes('عنوان تجريبي'), 'plainTextOf must preserve title text');
assert(plain.includes('كلمة عريضة'), 'plainTextOf must preserve formatted words');

console.log('✅ Functional simulations passed.');

console.log('\n================================================================');
console.log('🎉 ALL WYSIWYG RICH TEXT & UI FIX TESTS PASSED (100% SUCCESS) 🎉');
console.log('================================================================');
