'use strict';

const assert = require('assert');
const { ClassroomEngine, parseClassroomDeadline, toLocalDateString, parseIcsFeed } = require('../src/core/classroom');

console.log('Testing Google Classroom Module (Unit Tests)...');

// 1. parseClassroomDeadline tests
const d1 = parseClassroomDeadline({ year: 2026, month: 10, day: 15 }, { hours: 18, minutes: 30 });
assert.strictEqual(d1, Date.UTC(2026, 9, 15, 18, 30, 0), 'Should parse exact UTC hours and minutes');

const d2 = parseClassroomDeadline({ year: 2026, month: 10, day: 15 });
assert.strictEqual(d2, Date.UTC(2026, 9, 15, 23, 59, 0), 'Default time should be 23:59 UTC');

assert.strictEqual(parseClassroomDeadline(null), null, 'Null due date should return null');
assert.strictEqual(parseClassroomDeadline({}), null, 'Empty due date should return null');
console.log('✓ parseClassroomDeadline passed all assertions');

// 2. toLocalDateString tests
const ts = Date.UTC(2026, 9, 15, 12, 0, 0);
const dateStr = toLocalDateString(ts);
assert.match(dateStr, /^\d{4}-\d{2}-\d{2}$/, 'Date string should match YYYY-MM-DD format');
console.log('✓ toLocalDateString passed all assertions');

// 3. Completion Guard tests (canMarkDone)
const engine = new ClassroomEngine();

// Regular non-classroom task
const regularTask = { id: 't1', text: 'مذاكرة عادية', done: false };
assert.deepStrictEqual(engine.canMarkDone(regularTask), { allowed: true });

// Classroom task not turned in yet
const unsubmittedTask = {
  id: 't2',
  text: '[OS] Lab 1',
  done: false,
  classroom: {
    courseName: 'Operating Systems',
    state: 'NEW',
    alternateLink: 'https://classroom.google.com/c/123/a/456',
  },
};
const guardRes = engine.canMarkDone(unsubmittedTask);
assert.strictEqual(guardRes.allowed, false, 'Unsubmitted task must NOT be marked done');
assert.ok(guardRes.reason.includes('لم يتم تسليم التكليف'), 'Should include Arabic warning');
assert.strictEqual(guardRes.alternateLink, 'https://classroom.google.com/c/123/a/456');

// Classroom task that is TURNED_IN
const turnedInTask = {
  id: 't3',
  text: '[OS] Lab 1',
  done: false,
  classroom: {
    courseName: 'Operating Systems',
    state: 'TURNED_IN',
  },
};
assert.deepStrictEqual(engine.canMarkDone(turnedInTask), { allowed: true }, 'TURNED_IN task can be marked done');

// Classroom task that is RETURNED (graded)
const returnedTask = {
  id: 't4',
  text: '[OS] Lab 1',
  done: false,
  classroom: {
    courseName: 'Operating Systems',
    state: 'RETURNED',
  },
};
assert.deepStrictEqual(engine.canMarkDone(returnedTask), { allowed: true }, 'RETURNED task can be marked done');
console.log('✓ canMarkDone completion guard passed all assertions');

// 4. iCal ICS Feed Parser tests
const sampleIcs = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Google Inc//Google Calendar 70.9054//EN
BEGIN:VEVENT
DTSTART:20261012T205900Z
DTEND:20261012T205900Z
UID:assignment123@google.com
SUMMARY:Assignment 2: Network Security
DESCRIPTION:Submit via Classroom\\nGood luck
URL:https://classroom.google.com/c/999/a/888
END:VEVENT
END:VCALENDAR`;

const icsEvents = parseIcsFeed(sampleIcs);
assert.strictEqual(icsEvents.length, 1);
assert.strictEqual(icsEvents[0].summary, 'Assignment 2: Network Security');
assert.strictEqual(icsEvents[0].url, 'https://classroom.google.com/c/999/a/888');
assert.strictEqual(icsEvents[0].dtend, Date.UTC(2026, 9, 12, 20, 59, 0));
assert.ok(icsEvents[0].description.includes('Submit via Classroom\nGood luck'));
console.log('✓ parseIcsFeed passed all assertions');

console.log('ALL GOOGLE CLASSROOM UNIT TESTS PASSED SUCCESSFULLY! 🎉');
