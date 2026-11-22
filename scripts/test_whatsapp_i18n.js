'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const whatsapp = require('../src/core/whatsapp');

console.log('--- Testing WhatsApp Bilingual Localization (ar / en) ---');

// 1. Verify buildSuperUrgentMessage in Arabic
const sampleTask = {
  id: 'task-101',
  text: 'مشروع تخرج 2',
  classroom: {
    courseName: 'نظم المعلومات',
    alternateLink: 'https://classroom.google.com/c/12345',
  },
};
const deadline = Date.now() + 3600000 * 2; // 2 hours from now

const msgAr = whatsapp.buildSuperUrgentMessage(sampleTask, deadline, {
  language: 'ar',
  whatsapp: { senderName: 'بوت الواجبات' }
});
console.log('Arabic Message Output:\n' + msgAr);
assert(msgAr.includes('تنبيه تسليم عاجل جداً'), 'Should contain Arabic alert title');
assert(msgAr.includes('مشروع تخرج 2'), 'Should contain task title');
assert(msgAr.includes('نظم المعلومات'), 'Should contain course name');
assert(msgAr.includes('ساعة'), 'Should contain Arabic time format');
assert(msgAr.includes('بوت الواجبات'), 'Should contain sender name');

// 2. Verify buildSuperUrgentMessage in English
const msgEn = whatsapp.buildSuperUrgentMessage(sampleTask, deadline, {
  language: 'en',
  whatsapp: { senderName: 'Assignment Bot' }
});
console.log('\nEnglish Message Output:\n' + msgEn);
assert(msgEn.includes('Super Urgent Assignment Alert'), 'Should contain English alert title');
assert(msgEn.includes('Task:'), 'Should contain English task prefix');
assert(msgEn.includes('Course:'), 'Should contain English course prefix');
assert(msgEn.includes('hr'), 'Should contain English hours format');
assert(msgEn.includes('From: Assignment Bot'), 'Should contain English sender prefix');

// 3. Verify Custom Template with {priority} in both languages
const customTemplate = 'Notice: {taskTitle} for {courseName} | Priority: {priority} | Time: {timeLeft} | Link: {link}';
const customMsgEn = whatsapp.buildSuperUrgentMessage(sampleTask, deadline, {
  language: 'en',
  whatsapp: { template: customTemplate, senderName: 'Bot' }
});
assert(customMsgEn.includes('Urgent 🚨'), 'Should replace {priority} with English priority');
assert(customMsgEn.includes('Notice: مشروع تخرج 2'), 'Should replace {taskTitle}');

const customMsgAr = whatsapp.buildSuperUrgentMessage(sampleTask, deadline, {
  language: 'ar',
  whatsapp: { template: customTemplate, senderName: 'Bot' }
});
assert(customMsgAr.includes('عاجلة جداً 🚨'), 'Should replace {priority} with Arabic priority');

// 4. Verify settings.js dictionaries include all wa keys
const settingsJsContent = fs.readFileSync(path.join(__dirname, '../windows/js/settings.js'), 'utf8');
const requiredKeys = [
  's.waPresetQuick',
  's.waPresetDetailed',
  's.waPresetFormal',
  's.waTagTaskTitle',
  's.waTagCourseName',
  's.waTagDeadline',
  's.waTagTimeLeft',
  's.waTagPriority',
  's.waTagLink',
  's.waTagSenderName',
  's.waTagTaskTitleTitle',
  's.waTagCourseNameTitle',
  's.waTagDeadlineTitle',
  's.waTagTimeLeftTitle',
  's.waTagPriorityTitle',
  's.waTagLinkTitle',
  's.waTagSenderNameTitle',
  's.waTemplate',
  's.waTemplatePlaceholder',
  's.waPreviewBadge',
  's.waBrowseGroupsTitle',
  's.waRefreshGroups',
  's.waGroupsPrompt',
  's.waGroupsLoading',
  's.waGroupsEmpty',
  's.waAddGroupBtn',
  's.waAddGroupTitle',
  's.waDelPhoneTitle',
  's.waSenderNamePh'
];

for (const k of requiredKeys) {
  const matches = (settingsJsContent.match(new RegExp(`'${k}'`, 'g')) || []).length;
  assert(matches >= 2, `Key ${k} should be defined in both ar and en (found ${matches})`);
}

console.log('\n✅ All WhatsApp Bilingual / i18n tests passed successfully!');
