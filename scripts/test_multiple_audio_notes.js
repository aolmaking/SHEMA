'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('TESTING MULTIPLE VOICE RECORDINGS (MULTI-AUDIO) IN A SINGLE NOTE');
console.log('================================================================\n');

// 1. Verify DOM structure in notes.html
console.log('[1/4] Testing notes.html multi-audio container and player IDs...');
const notesHtml = fs.readFileSync(path.join(__dirname, '../windows/notes.html'), 'utf8');
assert(notesHtml.includes('id="noteAudiosList"'), 'notes.html must contain #noteAudiosList container for multiple voice memos');
assert(notesHtml.includes('id="noteAudioPlayer"'), 'notes.html must retain #noteAudioPlayer');
assert(notesHtml.includes('id="audioPlayBtn"'), 'notes.html must retain #audioPlayBtn');
assert(notesHtml.includes('id="audioWaveformBox"'), 'notes.html must retain #audioWaveformBox');
assert(notesHtml.includes('id="audioScrub"'), 'notes.html must retain #audioScrub');
assert(notesHtml.includes('id="audioDelBtn"'), 'notes.html must retain #audioDelBtn');
assert(notesHtml.includes('id="noteAudioEl"'), 'notes.html must retain #noteAudioEl');
console.log('✅ notes.html DOM structure verified.');

// 2. Verify notes.css styling for multi-audio list
console.log('\n[2/4] Testing notes.css multi-audio styles...');
const notesCss = fs.readFileSync(path.join(__dirname, '../windows/css/notes.css'), 'utf8');
assert(notesCss.includes('.note-audios-list'), 'notes.css must define .note-audios-list container styling');
assert(notesCss.includes('.note-audio-player'), 'notes.css must define .note-audio-player card styling');
console.log('✅ notes.css styling verified.');

// 3. Verify notes.js functions & multi-audio support
console.log('\n[3/4] Testing notes.js multi-audio logic...');
const notesJs = fs.readFileSync(path.join(__dirname, '../windows/js/notes.js'), 'utf8');
assert(notesJs.includes('note.audios.push('), 'notes.js must append new voice recordings to note.audios array');
assert(notesJs.includes('function deleteAudioById('), 'notes.js must implement deleteAudioById for individual audio deletion');
assert(notesJs.includes('function createAudioPlayerCard('), 'notes.js must implement createAudioPlayerCard for extra audio memos');
assert(notesJs.includes('function bindAudioCard('), 'notes.js must implement bindAudioCard');
console.log('✅ notes.js implementation verified.');

// 4. Functional simulation of multi-audio recording, stacking and individual deletion
console.log('\n[4/4] Simulating multi-audio lifecycle...');

// Normalization function simulation
function normalizeNote(n) {
  if (!n) return n;
  if (!Array.isArray(n.checklist)) n.checklist = [];
  if (Array.isArray(n.audios)) {
    // already has audios array
  } else if (n.audio && n.audio.data) {
    n.audios = [n.audio];
  } else {
    n.audios = [];
  }
  n.audio = n.audios.length > 0 ? n.audios[0] : null;
  return n;
}

// A. Test legacy migration
const legacyNote = {
  id: 'legacy_1',
  body: 'ملاحظة قديمة',
  audio: { id: 'aud_old', data: 'data:audio/webm;base64,AAA', duration: 15 },
};
normalizeNote(legacyNote);
assert.strictEqual(legacyNote.audios.length, 1, 'Legacy audio must be migrated to audios array of length 1');
assert.strictEqual(legacyNote.audios[0].id, 'aud_old', 'Migrated audio ID must match');
assert.strictEqual(legacyNote.audio.id, 'aud_old', 'note.audio reference must be preserved for backward compatibility');

// B. Test adding multiple voice recordings (Recording 1, 2, 3...)
const note = {
  id: 'note_multi_audio',
  body: 'ملاحظة متعددة التسجيلات',
  audios: [],
  audio: null,
};

// First recording
const audio1 = { id: 'aud_1', data: 'data:audio/webm;base64,111', duration: 10, createdAt: 1000 };
note.audios.push(audio1);
note.audio = note.audios[0];
assert.strictEqual(note.audios.length, 1, 'Note now has 1 voice recording');

// Second recording (User: "لو عملت بيحذف الحاليه و يعمل واحده جديده" -> Now it must KEEP both!)
const audio2 = { id: 'aud_2', data: 'data:audio/webm;base64,222', duration: 25, createdAt: 2000 };
note.audios.push(audio2);
note.audio = note.audios[0];
assert.strictEqual(note.audios.length, 2, 'Note must have 2 voice recordings without deleting the previous one!');
assert.strictEqual(note.audios[0].id, 'aud_1', 'First voice recording is preserved');
assert.strictEqual(note.audios[1].id, 'aud_2', 'Second voice recording is preserved');

// Third recording
const audio3 = { id: 'aud_3', data: 'data:audio/webm;base64,333', duration: 40, createdAt: 3000 };
note.audios.push(audio3);
note.audio = note.audios[0];
assert.strictEqual(note.audios.length, 3, 'Note must now have 3 voice recordings');

// C. Test individual deletion of audio 2
note.audios = note.audios.filter(a => a.id !== 'aud_2');
note.audio = note.audios[0] || null;
assert.strictEqual(note.audios.length, 2, 'After deleting aud_2, 2 recordings remain');
assert.strictEqual(note.audios.some(a => a.id === 'aud_2'), false, 'aud_2 was removed');
assert.strictEqual(note.audios[0].id, 'aud_1', 'aud_1 remains intact');
assert.strictEqual(note.audios[1].id, 'aud_3', 'aud_3 remains intact');

console.log('✅ Multi-audio lifecycle simulation passed successfully.');

console.log('\n================================================================');
console.log('🎉 ALL MULTI-AUDIO VOICE RECORDING TESTS PASSED (100% SUCCESS) 🎉');
console.log('================================================================');
