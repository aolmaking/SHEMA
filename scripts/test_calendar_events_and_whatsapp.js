'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('========================================================');
console.log('TESTING CALENDAR EVENTS & WHATSAPP INTEGRATION');
console.log('========================================================\n');

// 1. Verify files exist and export expected components
console.log('--- 1. Testing Core Modules Integrity ---');
const { CalendarEventsManager, CATEGORIES, buildEventWhatsAppMessage } = require('../src/core/calendar-events');
const { SuperUrgentMonitor, getTaskDeadline } = require('../src/core/super-urgent');
const { WhatsAppDispatcher } = require('../src/core/whatsapp');

assert(CalendarEventsManager, 'CalendarEventsManager must be exported');
assert(CATEGORIES.birthday, 'CATEGORIES.birthday must exist');
assert(CATEGORIES.conference, 'CATEGORIES.conference must exist');
assert(CATEGORIES.meeting, 'CATEGORIES.meeting must exist');
assert(CATEGORIES.anniversary, 'CATEGORIES.anniversary must exist');
assert(CATEGORIES.exam, 'CATEGORIES.exam must exist');
assert(CATEGORIES.appointment, 'CATEGORIES.appointment must exist');
assert(CATEGORIES.deadline, 'CATEGORIES.deadline must exist');
console.log('✅ Core modules and categories verified.');

// 2. Testing Robust Deadline Calculation in SuperUrgentMonitor
console.log('\n--- 2. Testing Robust Deadline Calculation ---');
// ISO string with time
const taskIso = { text: 'Task 1', due: '2026-10-20T14:30:00.000Z' };
const dIso = getTaskDeadline(taskIso);
assert(!isNaN(dIso) && dIso > 0, 'getTaskDeadline must parse ISO string with time');

// Date only YYYY-MM-DD
const taskYmd = { text: 'Task 2', due: '2026-10-25' };
const dYmd = getTaskDeadline(taskYmd);
assert(!isNaN(dYmd) && dYmd > 0, 'getTaskDeadline must parse YYYY-MM-DD');

// Classroom task
const taskCr = { text: 'Task 3', classroom: { deadlineTimestamp: 1792097940000 } };
const dCr = getTaskDeadline(taskCr);
assert.strictEqual(dCr, 1792097940000, 'getTaskDeadline must return classroom deadlineTimestamp');
console.log('✅ getTaskDeadline accurately parses all date and time formats without NaN.');

// 3. Testing CalendarEventsManager CRUD and Recurrence
console.log('\n--- 3. Testing CalendarEventsManager CRUD & Recurrence ---');
let storedEvents = [];
const mockStore = {
  get: () => storedEvents,
  set: (k, v) => { storedEvents = v; return v; },
};
const mockSettings = {
  language: 'ar',
  whatsapp: {
    enabled: true,
    provider: 'openwa',
    sendToGroup: true,
    groupId: '120363412525293706@g.us',
  },
};

const mgr = new CalendarEventsManager(mockStore, () => mockSettings, new WhatsAppDispatcher());

// Add events
const ev1 = mgr.addOrUpdate({
  title: 'مؤتمر هندسة البرمجيات والذكاء الاصطناعي',
  date: '2026-10-25',
  time: '10:00',
  category: 'conference',
  recurring: 'none',
  notes: 'قاعة المؤتمرات الرئيسية',
  whatsapp: {
    enabled: true,
    sendTiming: 'morning_of',
  },
});
assert(ev1.id, 'Event must receive generated ID');
assert.strictEqual(mgr.all().length, 1, 'Event store must have 1 event');

// Add Birthday with yearly recurrence
const ev2 = mgr.addOrUpdate({
  title: 'عيد ميلاد أحمد',
  date: '2026-10-16', // Today!
  time: '12:00',
  category: 'birthday',
  recurring: 'yearly',
  notes: 'احتفال عائلي',
  whatsapp: {
    enabled: true,
    sendTiming: 'morning_of',
  },
});
assert.strictEqual(mgr.all().length, 2, 'Event store must have 2 events');

// Test recurrence matching
assert(mgr.matchesDate(ev2, new Date('2026-10-16')), 'ev2 matches today');
assert(mgr.matchesDate(ev2, new Date('2027-10-16')), 'ev2 matches next year on same date due to yearly recurrence');
assert(!mgr.matchesDate(ev2, new Date('2026-10-17')), 'ev2 does not match other dates');
console.log('✅ CalendarEventsManager CRUD & recurrence verified.');

// 4. Testing Event WhatsApp Message Builder
console.log('\n--- 4. Testing WhatsApp Message Generation ---');
const msg = buildEventWhatsAppMessage(ev1, mockSettings, 'ar');
assert(msg.includes('مؤتمر هندسة البرمجيات'), 'Message must contain event title');
assert(msg.includes('قاعة المؤتمرات الرئيسية'), 'Message must contain notes');
assert(msg.includes('🎙️'), 'Message must include conference icon');
console.log('✅ buildEventWhatsAppMessage generated rich formatted text with placeholders.');

// 5. Testing Evaluation & Trigger
console.log('\n--- 5. Testing Event Evaluation Trigger ---');
let alertTriggered = false;
mgr.on('alert', ({ event }) => {
  if (event.id === ev2.id) alertTriggered = true;
});

// Simulate evaluate at 11:00 AM today (after 09:00 AM notification time)
const testTime = new Date('2026-10-16T08:00:00Z').getTime(); // 11:00 AM local
mgr.evaluate(testTime);
assert.strictEqual(alertTriggered, true, 'Event notification alert must trigger');
console.log('✅ Event alert correctly triggered during evaluation cycle.');

console.log('\n========================================================');
console.log('🎉 ALL CALENDAR EVENTS & WHATSAPP TESTS PASSED (100%)');
console.log('========================================================\n');
