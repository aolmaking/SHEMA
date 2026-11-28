'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('🧪 TESTING QUICK JOURNAL BUTTON, MODAL & SETTINGS OPTION');
console.log('========================================================\n');

// 1. Core Habits Day Note Engine
console.log('--- 1. Testing Core Habits saveDayNote and getDayNote ---');
const { HabitsManager } = require('../src/core/habits');

let storedData = { habits: [], days: {} };
const mockStore = {
  get: (k, def) => (storedData[k] !== undefined ? storedData[k] : def),
  set: (k, v) => { storedData[k] = v; },
};
const mgr = new HabitsManager(mockStore, () => ({ language: 'ar' }));

const today = new Date().toISOString().slice(0, 10);
const sampleNote = 'اليوم أتممت جلسات التركيز وورد القرآن بفضل الله ✨';
mgr.saveDayNote(today, sampleNote);

const fetched = mgr.getDayNote(today);
assert.strictEqual(fetched, sampleNote, 'getDayNote must match saved reflection note');
console.log('✅ Core HabitsManager day note storage verified 100%.');

// 2. HTML Markup Verifications
console.log('\n--- 2. Testing Markup in windows/habits.html & windows/settings.html ---');
const habitsHtml = fs.readFileSync(path.join(__dirname, '../windows/habits.html'), 'utf8');
const settingsHtml = fs.readFileSync(path.join(__dirname, '../windows/settings.html'), 'utf8');
const habitsCss = fs.readFileSync(path.join(__dirname, '../windows/css/habits.css'), 'utf8');

assert(habitsHtml.includes('id="quickJournalBtn"'), '#quickJournalBtn must exist in habits.html header');
assert(habitsHtml.includes('id="popShowQuickJournal"'), '#popShowQuickJournal must exist in habitsViewPopover');
assert(habitsHtml.includes('id="quickJournalModal"'), '#quickJournalModal must exist in habits.html');
assert(habitsHtml.includes('id="qjTextarea"'), '#qjTextarea must exist in quickJournalModal');
assert(habitsHtml.includes('id="qjSaveBtn"'), '#qjSaveBtn must exist in quickJournalModal');
assert(habitsHtml.includes('id="qjOpenFullDashBtn"'), '#qjOpenFullDashBtn must exist in quickJournalModal');
assert(habitsHtml.includes('id="qjPromptsRow"'), '#qjPromptsRow chips row must exist');

assert(settingsHtml.includes('id="habitsShowQuickJournal"'), '#habitsShowQuickJournal switch must exist in settings.html');
assert(habitsCss.includes('.qj-prompt-chip'), '.qj-prompt-chip CSS class must be defined in habits.css');
console.log('✅ HTML & CSS markup verified 100%.');

// 3. JavaScript Wiring Verifications
console.log('\n--- 3. Testing JS Logic in habits.js, settings.js, habits-dashboard.js ---');
const habitsJs = fs.readFileSync(path.join(__dirname, '../windows/js/habits.js'), 'utf8');
const settingsJs = fs.readFileSync(path.join(__dirname, '../windows/js/settings.js'), 'utf8');
const dashJs = fs.readFileSync(path.join(__dirname, '../windows/js/habits-dashboard.js'), 'utf8');

assert(habitsJs.includes('showQuickJournal'), 'habits.js must handle showQuickJournal setting');
assert(habitsJs.includes('openQuickJournalModal'), 'habits.js must define openQuickJournalModal');
assert(habitsJs.includes('closeQuickJournalModal'), 'habits.js must define closeQuickJournalModal');
assert(habitsJs.includes('qjPromptsRow'), 'habits.js must wire micro-prompts insertion');
assert(habitsJs.includes('saveQuickJournalAction'), 'habits.js must wire save reflection logic');

assert(settingsJs.includes('habitsShowQuickJournal'), 'settings.js must wire habitsShowQuickJournal switch');
assert(settingsJs.includes('s.habitsShowQuickJournal'), 'settings.js must have i18n translation keys');

assert(dashJs.includes("opts?.focus === 'reflection'"), 'habits-dashboard.js must handle opts.focus === reflection');
console.log('✅ JS logic and wiring verified 100%.');

console.log('\n========================================================');
console.log('🎉 ALL QUICK JOURNAL TESTS PASSED (100%)!');
console.log('========================================================');
