'use strict';

const assert = require('assert');
const { formatPhoneNumber, formatCallMeBotPhone, formatTimeLeft, buildSuperUrgentMessage, WhatsAppDispatcher } = require('../src/core/whatsapp');

console.log('Testing WhatsApp Module (Unit Tests)...');

// 1. Phone number formatting tests
assert.strictEqual(formatPhoneNumber('01012345678'), '201012345678@c.us', 'Local 010 should prepend 2');
assert.strictEqual(formatPhoneNumber('01198765432'), '201198765432@c.us', 'Local 011 should prepend 2');
assert.strictEqual(formatPhoneNumber('+201012345678'), '201012345678@c.us', 'Leading + should be stripped');
assert.strictEqual(formatPhoneNumber('00201012345678'), '201012345678@c.us', 'Leading 00 should be stripped');
assert.strictEqual(formatPhoneNumber('201012345678@c.us'), '201012345678@c.us', 'Already formatted should stay same');
assert.strictEqual(formatPhoneNumber(''), '', 'Empty string should return empty');
console.log('✓ formatPhoneNumber passed all assertions');

// 1.b formatCallMeBotPhone tests
assert.strictEqual(formatCallMeBotPhone('01012345678'), '+201012345678', 'CallMeBot local 010 should become +2010...');
assert.strictEqual(formatCallMeBotPhone('+201012345678'), '+201012345678', 'CallMeBot already +20 should stay +20');
assert.strictEqual(formatCallMeBotPhone('00201012345678'), '+201012345678', 'CallMeBot 00 should become +');
assert.strictEqual(formatCallMeBotPhone('34644910779'), '+34644910779', 'CallMeBot international without + should prepend +');
console.log('✓ formatCallMeBotPhone passed all assertions');

// 2. formatTimeLeft tests
assert.strictEqual(formatTimeLeft(0), 'انتهى الموعد الآن!');
assert.strictEqual(formatTimeLeft(-5000), 'انتهى الموعد الآن!');
assert.strictEqual(formatTimeLeft(3600000 * 2 + 60000 * 15), '2 ساعة و 15 دقيقة');
assert.strictEqual(formatTimeLeft(3600000 * 3), '3 ساعة');
assert.strictEqual(formatTimeLeft(60000 * 45), '45 دقيقة');
console.log('✓ formatTimeLeft passed all assertions');

// 3. buildSuperUrgentMessage tests
const mockTask = {
  id: 't-123',
  text: 'حل واجب التشفير الأول',
  classroom: {
    courseName: 'Cryptography',
    alternateLink: 'https://classroom.google.com/c/123/a/456',
  },
};
const deadline = Date.now() + 3600000 * 2;
const msg = buildSuperUrgentMessage(mockTask, deadline);
assert.ok(msg.includes('🚨 *تنبيه تسليم عاجل جداً (Google Classroom)* 🚨'));
assert.ok(msg.includes('حل واجب التشفير الأول'));
assert.ok(msg.includes('Cryptography'));
assert.ok(msg.includes('https://classroom.google.com/c/123/a/456'));
console.log('✓ buildSuperUrgentMessage passed all assertions');

// 4. WhatsAppDispatcher throttling tests
const dispatcher = new WhatsAppDispatcher();
assert.strictEqual(dispatcher.shouldSend('task-1', 15), true, 'First send should be allowed');
dispatcher.recordSent('task-1');
assert.strictEqual(dispatcher.shouldSend('task-1', 15), false, 'Immediate second send should be throttled');

// Once only frequency test
assert.strictEqual(dispatcher.shouldSend('task-1', 0), false, 'Frequency 0 means once only');

// Clear task test
dispatcher.clear('task-1');
assert.strictEqual(dispatcher.shouldSend('task-1', 15), true, 'After clearing, should be allowed again');
console.log('✓ WhatsAppDispatcher throttling passed all assertions');

// 5. sendCallMeBotMessage validation tests
(async () => {
  const { sendCallMeBotMessage } = require('../src/core/whatsapp');
  const res1 = await sendCallMeBotMessage({ phone: '01012345678', apiKey: '', text: 'hi' });
  assert.strictEqual(res1.ok, false);
  assert.ok(res1.error.includes('مفتاح API'));

  const res2 = await sendCallMeBotMessage({ phone: '123', apiKey: 'abc', text: 'hi' });
  assert.strictEqual(res2.ok, false);
  assert.ok(res2.error.includes('رقم الهاتف غير صالح'));

  console.log('✓ sendCallMeBotMessage parameter validation passed');
  console.log('ALL WHATSAPP UNIT TESTS PASSED SUCCESSFULLY! 🎉');
})();
