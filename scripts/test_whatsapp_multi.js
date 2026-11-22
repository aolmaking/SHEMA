'use strict';

const assert = require('assert');
const { parsePhoneNumbers, buildSuperUrgentMessage, formatPhoneNumber } = require('../src/core/whatsapp');

console.log('=== Running WhatsApp Multi-Number & Template Tests ===');

// Test 1: parsePhoneNumbers
const raw = '+201011111111, +201022222222;\n01234567890';
const parsed = parsePhoneNumbers(raw);
assert.strictEqual(parsed.length, 3, 'Should parse 3 numbers');
assert.strictEqual(parsed[0], '+201011111111');
assert.strictEqual(parsed[1], '+201022222222');
assert.strictEqual(parsed[2], '01234567890');
console.log('✔ Test 1: parsePhoneNumbers correctly handles commas, semicolons, and newlines');

// Test 2: formatPhoneNumber
const e1 = formatPhoneNumber('+201011111111');
assert.strictEqual(e1, '201011111111@c.us');
const e2 = formatPhoneNumber('01012345678');
assert.strictEqual(e2, '201012345678@c.us');
console.log('✔ Test 2: formatPhoneNumber formats numbers to WhatsApp JID');

// Test 3: buildSuperUrgentMessage with custom sender name
const task = {
  text: 'Project 1 Submission',
  classroom: {
    courseName: 'Operating Systems',
    alternateLink: 'https://classroom.google.com/test'
  }
};
const deadline = Date.now() + 3600000;

const defaultMsgWithSender = buildSuperUrgentMessage(task, deadline, {
  whatsapp: { senderName: 'Assignment Assistant' }
});
assert(defaultMsgWithSender.includes('[الراسل: Assignment Assistant]'), 'Message must include senderName prefix');
assert(defaultMsgWithSender.includes('Project 1 Submission'), 'Message must include task text');
console.log('✔ Test 3: buildSuperUrgentMessage includes designated sender identity');

// Test 4: Custom template formatting
const customTemplate = '🔔 ALERT: {taskTitle} for {courseName} is due in {timeLeft}! Link: {link}';
const templateMsg = buildSuperUrgentMessage(task, deadline, {
  whatsapp: {
    senderName: 'Bot Master',
    template: customTemplate,
  }
});
assert(templateMsg.includes('ALERT: Project 1 Submission for Operating Systems is due in'), 'Template variables must be populated');
assert(templateMsg.includes('Link: https://classroom.google.com/test'), 'Link variable must be populated');
assert(templateMsg.includes('Bot Master'), 'Sender name must be present');
console.log('✔ Test 4: Custom template correctly interpolates variables and sender identity');

console.log('=== All WhatsApp Multi-Number & Template Tests Passed! ===\n');
