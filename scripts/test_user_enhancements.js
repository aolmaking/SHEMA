'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { buildClassroomUrl, SCOPES, parseClassroomDeadline } = require('../src/core/classroom');
const { formatPhoneNumber, parsePhoneNumbers } = require('../src/core/whatsapp');

console.log('--- 1. Testing Google Classroom Account Routing & Scopes ---');
const normalUrl = 'https://classroom.google.com/c/12345/a/67890/details';
const nonClassroomUrl = 'https://example.com/assignment';
const userEmail = 'student@university.edu';

const routedUrl = buildClassroomUrl(normalUrl, userEmail);
assert(routedUrl.startsWith('https://accounts.google.com/AccountChooser?'), 'Must wrap classroom links with Google AccountChooser');
assert(routedUrl.includes(encodeURIComponent(userEmail)), 'Must include encoded user email in AccountChooser');
assert(routedUrl.includes(encodeURIComponent(normalUrl)), 'Must include destination URL in AccountChooser');

const nonRouted = buildClassroomUrl(nonClassroomUrl, userEmail);
assert.strictEqual(nonRouted, nonClassroomUrl, 'Non-classroom URLs must remain unaffected');

const noEmailRouted = buildClassroomUrl(normalUrl, '');
assert.strictEqual(noEmailRouted, normalUrl, 'When no user email is set, URL should remain unchanged');

assert(SCOPES.includes('https://www.googleapis.com/auth/classroom.profile.emails'), 'Scopes must include classroom.profile.emails');
assert(SCOPES.includes('https://www.googleapis.com/auth/userinfo.email'), 'Scopes must include userinfo.email');
console.log('✅ Google Classroom Account Routing & Scopes verified.');

console.log('--- 2. Testing WhatsApp Multi-Number & Group JID Preservation ---');
// Test group JID preservation
const groupJid = '120363024849203810@g.us';
assert.strictEqual(formatPhoneNumber(groupJid), groupJid, 'Group JID must not be mangled');

// Test phone formatting
const egPhone = '01012345678';
assert.strictEqual(formatPhoneNumber(egPhone), '201012345678@c.us', 'Egyptian phone must be formatted with country code 20');

// Test parsePhoneNumbers with array and string
const parsedArr = parsePhoneNumbers(['201012345678', '201198765432', groupJid]);
assert.strictEqual(parsedArr.length, 3, 'Must parse array of numbers and groups');
assert(parsedArr.includes(groupJid), 'Must retain group JID in parsed array');

const parsedStr = parsePhoneNumbers('201012345678, 201198765432;\n120363024849203810@g.us');
assert.strictEqual(parsedStr.length, 3, 'Must parse delimited string of numbers and groups');
console.log('✅ WhatsApp Multi-Number & Group JID verified.');

console.log('--- 3. Testing WhatsApp Interactive Template Builder & Presets in Settings ---');
const settingsHtml = fs.readFileSync(path.join(__dirname, '../windows/settings.html'), 'utf8');
const settingsJs = fs.readFileSync(path.join(__dirname, '../windows/js/settings.js'), 'utf8');
const settingsCss = fs.readFileSync(path.join(__dirname, '../windows/css/settings.css'), 'utf8');

assert(settingsHtml.includes('id="waNumbersList"'), 'settings.html must have #waNumbersList');
assert(settingsHtml.includes('id="waAddPhoneBtn"'), 'settings.html must have #waAddPhoneBtn (+ button)');
assert(settingsHtml.includes('id="waPresetQuick"'), 'settings.html must have quick preset button');
assert(settingsHtml.includes('id="waPresetDetailed"'), 'settings.html must have detailed preset button');
assert(settingsHtml.includes('id="waPresetFormal"'), 'settings.html must have formal preset button');
assert(settingsHtml.includes('id="waTagsList"'), 'settings.html must have #waTagsList chips');
assert(settingsHtml.includes('id="waPreviewBubble"'), 'settings.html must have live preview bubble');

assert(settingsJs.includes('waAddPhoneBtn'), 'settings.js must wire waAddPhoneBtn');
assert(settingsJs.includes('waPresetQuick'), 'settings.js must wire waPresetQuick');
assert(settingsJs.includes('updatePreview()'), 'settings.js must have updatePreview() function');
assert(settingsCss.includes('.wa-tag-chip'), 'settings.css must style .wa-tag-chip');
assert(settingsCss.includes('.wa-chat-bubble'), 'settings.css must style .wa-chat-bubble');
console.log('✅ WhatsApp Template Builder & Dynamic Numbers verified.');

console.log('--- 4. Testing To-Do Sort Options & Composer Drawer Clearance ---');
const todoHtml = fs.readFileSync(path.join(__dirname, '../windows/todo.html'), 'utf8');
const todoCss = fs.readFileSync(path.join(__dirname, '../windows/css/todo.css'), 'utf8');
const todoJs = fs.readFileSync(path.join(__dirname, '../windows/js/todo.js'), 'utf8');

assert(settingsHtml.includes('id="todoSortBy"'), 'settings.html must have #todoSortBy');
assert(settingsHtml.includes('value="free"'), 'settings.html must have free sort option');
assert(settingsHtml.includes('value="deadline"'), 'settings.html must have deadline sort option');
assert(settingsHtml.includes('value="priority"'), 'settings.html must have priority sort option');
assert(settingsHtml.includes('value="title"'), 'settings.html must have title sort option');
assert(settingsHtml.includes('value="created"'), 'settings.html must have created sort option');

assert(todoJs.includes("sortBy === 'free'"), 'todo.js must handle free sort');
assert(todoJs.includes("sortBy === 'deadline'"), 'todo.js must handle deadline sort');
assert(todoJs.includes("sortBy === 'priority'"), 'todo.js must handle priority sort');
assert(todoJs.includes("sortBy === 'title'"), 'todo.js must handle title sort');
assert(todoJs.includes("sortBy === 'created'"), 'todo.js must handle created sort');

assert(todoCss.includes('.composer-drawer.open {'), 'todo.css must define .composer-drawer.open');
assert(todoCss.includes('max-height: 100px;'), 'todo.css must have generous max-height (100px) preventing clipping');
assert(todoCss.includes('min-height: 40px;'), 'todo.css must have comfortable field height (40px)');
console.log('✅ To-Do Sort Options & Composer Drawer Clearance verified.');

console.log('--- 5. Testing Classroom Hidden Course Purging & Dynamic Priorities ---');
const classroomJs = fs.readFileSync(path.join(__dirname, '../src/core/classroom.js'), 'utf8');
assert(classroomJs.includes('hiddenCourses.includes'), 'classroom.js must filter hidden courses');
assert(classroomJs.includes('isDueThisWeek ? 2 : 1'), 'classroom.js must assign 2 (Urgent) for <= 7 days and 1 (Important) for later');
console.log('✅ Classroom Hidden Course Purging & Priority assignment verified.');

console.log('--- 6. Testing Window Close Buttons & Desktop Widgets Rules ---');
const baseCss = fs.readFileSync(path.join(__dirname, '../windows/css/base.css'), 'utf8');
assert(baseCss.includes(":root[data-kind='widget'] #closeBtn,"), 'base.css must hide #closeBtn on desktop widgets');
assert(baseCss.includes(":root[data-kind='window'] #closeBtn,"), 'base.css must show close button on secondary windows');
assert(baseCss.includes('.settings-plate #closeBtn,'), 'base.css must keep close button on settings plate');
assert(baseCss.includes('.email-view-plate #closeBtn,'), 'base.css must keep close button on email-view plate');
assert(baseCss.includes('.tafsir-plate #closeBtn,'), 'base.css must keep close button on tafsir plate');
assert(baseCss.includes('.hadith-plate #closeBtn,'), 'base.css must keep close button on hadith plate');
assert(baseCss.includes('.task-plate #closeBtn'), 'base.css must keep close button on task plate');

const settingsHtmlDoc = fs.readFileSync(path.join(__dirname, '../windows/settings.html'), 'utf8');
const emailViewHtml = fs.readFileSync(path.join(__dirname, '../windows/email-view.html'), 'utf8');
const tafsirHtml = fs.readFileSync(path.join(__dirname, '../windows/tafsir.html'), 'utf8');
assert(settingsHtmlDoc.includes('data-kind="window"'), 'settings.html must declare data-kind="window"');
assert(emailViewHtml.includes('data-kind="window"'), 'email-view.html must declare data-kind="window"');
assert(tafsirHtml.includes('data-kind="window"'), 'tafsir.html must declare data-kind="window"');
console.log('✅ Window Close Buttons & Desktop Widget rules verified.');

console.log('--- 7. Testing Evolved Email Window & Widget Routing ---');
const emailJs = fs.readFileSync(path.join(__dirname, '../windows/js/email.js'), 'utf8');
const emailViewJs = fs.readFileSync(path.join(__dirname, '../windows/js/email-view.js'), 'utf8');
const emailViewCss = fs.readFileSync(path.join(__dirname, '../windows/css/email-view.css'), 'utf8');

assert(emailJs.includes("openEmailView({ mode: 'compose' })"), 'email.js #composeBtn must open dedicated email window directly');
assert(emailJs.includes("confirm(t('email.confirmDelete'))"), 'email.js must prompt before deleting email');
assert(emailViewJs.includes("confirm(t('emailView.confirmDelete'))"), 'email-view.js must prompt before deleting email');
assert(emailViewHtml.includes('id="replyBtn"'), 'email-view.html must have #replyBtn');
assert(emailViewHtml.includes('id="forwardBtn"'), 'email-view.html must have #forwardBtn');
assert(emailViewHtml.includes('id="composeView"'), 'email-view.html must have #composeView');
assert(emailViewHtml.includes('id="readingView"'), 'email-view.html must have #readingView');
assert(emailViewHtml.includes('id="composeSendBtn"'), 'email-view.html must have #composeSendBtn');
assert(emailViewHtml.includes('id="composeAttachBtn"'), 'email-view.html must have #composeAttachBtn');
assert(emailViewCss.includes('.compose-card'), 'email-view.css must style .compose-card');
assert(emailViewCss.includes('.sender-hero-card'), 'email-view.css must style .sender-hero-card');
console.log('✅ Evolved Email Window & Direct Window Compose verified.');

console.log('--- 8. Testing Quran Widget Responsiveness & Spacing ---');
const quranCss = fs.readFileSync(path.join(__dirname, '../windows/css/quran.css'), 'utf8');
assert(quranCss.includes('.quran-plate .body {'), 'quran.css must style .quran-plate .body');
assert(quranCss.includes('height: 100%;'), 'quran.css body must have height 100%');
assert(quranCss.includes('padding: 4px 14px 12px;'), 'quran.css must have 1mm extra breathing room');
console.log('✅ Quran Widget Responsiveness & Spacing verified.');

console.log('\n🌟 ALL AUTOMATED ENHANCEMENTS TESTS PASSED (100%) 🌟');
