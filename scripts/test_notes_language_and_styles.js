'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== TEST: Notes Language, Styles & Swatch Palette Overhaul ===\n');

const notesJsPath = path.join(__dirname, '../windows/js/notes.js');
const notesHtmlPath = path.join(__dirname, '../windows/notes.html');
const notesCssPath = path.join(__dirname, '../windows/css/notes.css');
const shellJsPath = path.join(__dirname, '../windows/js/shell.js');

const notesJs = fs.readFileSync(notesJsPath, 'utf8');
const notesHtml = fs.readFileSync(notesHtmlPath, 'utf8');
const notesCss = fs.readFileSync(notesCssPath, 'utf8');
const shellJs = fs.readFileSync(shellJsPath, 'utf8');

// Test 1: Complete removal of "cream" / "عاجي" from PAPER_COLORS
console.log('1. Verifying "cream" / "عاجي" is completely removed from PAPER_COLORS...');
assert(!notesJs.includes("cream:  { icon: '📜', labelKey: 'notes.colorCream'"), 'PAPER_COLORS should not define cream');
assert(!notesJs.includes("'notes.colorCream'"), 'strings should not have notes.colorCream');
assert(!notesHtml.includes('data-color="cream"'), 'notes.html should not have cream swatch');
assert(!notesHtml.includes('عاجي كلاسيكي'), 'notes.html should not mention عاجي كلاسيكي');
console.log('✓ PASS: "cream" / "عاجي" completely eliminated from UI & swatches.');

// Test 2: "white" is the primary default paper color
console.log('2. Verifying "white" is the primary default...');
assert(notesJs.includes("let selectedModalColor = 'white';"), 'selectedModalColor must default to white');
assert(notesJs.includes("function createNote(style = 'ruled', color = 'white')"), 'createNote must default to white');
assert(notesJs.includes("paperColor: 'white'"), 'ensureOne must default to white');
assert(notesHtml.includes('<button type="button" class="new-color-swatch on" data-color="white"'), 'notes.html must have white swatch with "on"');
console.log('✓ PASS: "white" is now the primary default paper color.');

// Test 3: Clean Arabic & English names for Templates and Colors
console.log('3. Verifying natural, non-weird names and clean icons...');
const forbiddenEmojis = ['🍑', '🪻', '🍃', '🌊'];
for (const emoji of forbiddenEmojis) {
  assert(!notesJs.includes(`icon: '${emoji}'`), `Forbidden emoji ${emoji} should not be used as icon`);
}
assert(notesJs.includes("ruled:   { icon: '📝', labelKey: 'notes.styleRuled',   name: 'مسطّر' }"), 'Ruled style must have clean name');
assert(notesJs.includes("grid:    { icon: '▦',  labelKey: 'notes.styleGrid',    name: 'مربعات' }"), 'Grid style must have clean name');
assert(notesJs.includes("book:    { icon: '📖', labelKey: 'notes.styleBook',    name: 'صفحة كتاب' }"), 'Book style must have clean name');
assert(notesJs.includes("planner: { icon: '📑', labelKey: 'notes.stylePlanner', name: 'مفكرة مهام' }"), 'Planner style must have clean name');
assert(!notesJs.includes("kraft:   { icon: '📜'"), 'Kraft / classic style must be removed');

assert(notesJs.includes("white:  { icon: '⚪', labelKey: 'notes.colorWhite',  name: 'أبيض' }"), 'White color swatch');
assert(notesJs.includes("yellow: { icon: '🟡', labelKey: 'notes.colorYellow', name: 'أصفر' }"), 'Yellow color swatch');
assert(notesJs.includes("blue:   { icon: '🔵', labelKey: 'notes.colorBlue',   name: 'أزرق' }"), 'Blue color swatch');
assert(notesJs.includes("green:  { icon: '🟢', labelKey: 'notes.colorGreen',  name: 'أخضر' }"), 'Green color swatch');
assert(notesJs.includes("rose:   { icon: '🌸', labelKey: 'notes.colorRose',   name: 'وردي' }"), 'Rose color swatch');
assert(notesJs.includes("purple: { icon: '🟣', labelKey: 'notes.colorPurple', name: 'بنفسجي' }"), 'Purple color swatch');
assert(notesJs.includes("dark:   { icon: '⚫', labelKey: 'notes.colorDark',   name: 'داكن' }"), 'Dark color swatch');
console.log('✓ PASS: All template and color names are natural, elegant, and clean.');

// Test 4: Dynamic Localization Tracking & Clutter Removal
console.log('4. Verifying drawer follows app language and top clutter pills (reading stats, type badge, zen) are removed...');
assert(!notesHtml.includes('id="readingStatsPill"'), 'readingStatsPill must be removed from notes.html');
assert(!notesHtml.includes('id="noteTypeIndicator"'), 'noteTypeIndicator must be removed from notes.html');
assert(!notesHtml.includes('id="zenToggleBtn"'), 'zenToggleBtn must be removed from notes.html');
assert(!notesHtml.includes('id="zenExitBtn"'), 'zenExitBtn must be removed from notes.html');
assert(notesHtml.includes('data-i18n="notes.tierTitle"'), 'format drawer must have data-i18n for tierTitle');
assert(notesHtml.includes('data-i18n="notes.tierHeading"'), 'format drawer must have data-i18n for tierHeading');
assert(notesHtml.includes('data-i18n="notes.fontModern"'), 'format drawer must have data-i18n for fontModern');
assert(notesHtml.includes('data-i18n="notes.fontHand"'), 'format drawer must have data-i18n for fontHand');
assert(shellJs.includes("n.setAttribute('data-placeholder', phVal)"), 'shell translate() must set data-placeholder');
assert(notesHtml.includes('data-i18n-ph="notes.ph"'), '#editor must have data-i18n-ph="notes.ph"');
console.log('✓ PASS: Complete localization attributes in place, and top pill clutter & zen mode removed.');

// Test 5: Backward Compatibility Migration in normalizeNote
console.log('5. Verifying backward compatibility migration...');
assert(notesJs.includes("if (n.paperColor === 'cream') n.paperColor = 'white';"), 'cream mapped to white');
assert(notesJs.includes("if (n.paperColor === 'sage') n.paperColor = 'green';"), 'sage mapped to green');
assert(notesJs.includes("if (n.paperColor === 'lilac') n.paperColor = 'purple';"), 'lilac mapped to purple');
assert(notesJs.includes("if (n.paperColor === 'peach') n.paperColor = 'yellow';"), 'peach mapped to yellow');
assert(notesCss.includes('.editor-canvas.color-white,\n.editor-canvas.color-cream'), 'CSS aliases color-cream to color-white');
console.log('✓ PASS: Legacy notes with cream or old pastel keys gracefully migrate to white/new palette.');

// Test 6: Confirm Delete Dialog Localization
console.log('6. Verifying confirmDelete localization...');
assert(notesJs.includes("title: t('notes.confirmDelAudio')"), 'confirmDelete audio uses translated title');
assert(notesJs.includes("title: t('notes.confirmDeleteNote')"), 'confirmDelete note uses translated title');
assert(notesJs.includes("confirmText: t('notes.delete')"), 'confirmDelete uses translated delete button');
assert(notesJs.includes("cancelText: t('common.cancel')"), 'confirmDelete uses translated cancel button');
console.log('✓ PASS: confirmDelete popup strictly adheres to application language.');

console.log('\n=== ALL NOTES LANGUAGE & STYLES TESTS PASSED (100%) ===');
