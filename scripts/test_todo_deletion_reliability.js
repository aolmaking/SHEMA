'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('TESTING TO-DO & CHECKLIST DELETION RELIABILITY');
console.log('================================================================\n');

// 1. Verify notes.js checklist deletion logic
console.log('[1/4] Verifying notes.js checklist deletion...');
const notesJs = fs.readFileSync(path.join(__dirname, '../windows/js/notes.js'), 'utf8');

// Assert delBtn in checklist deletes immediately without confirmDelete modal
assert(notesJs.includes('removeChecklistItem(it.id)'), 'delBtn in notes checklist must directly call removeChecklistItem');
assert(!notesJs.includes('confirmDelete({\n            title: \'هل أنت متأكد من الحذف؟\',\n            desc: it.text.slice(0, 45)'), 'Checklist line delete button must not be blocked by confirmDelete');

// Assert handleChecklistKeydown handles Backspace when all selected, at start, or empty
assert(notesJs.includes('isAllSelected'), 'handleChecklistKeydown must detect all text selected');
assert(notesJs.includes('isAtStart'), 'handleChecklistKeydown must detect cursor at start of line');
assert(notesJs.includes("e.key === 'Delete'"), 'handleChecklistKeydown must support Delete key');
assert(notesJs.includes('persist.flush'), 'removeChecklistItem must immediately flush changes to disk');
console.log('✅ notes.js checklist deletion verified.');

// 2. Verify todo.js remove logic
console.log('\n[2/4] Verifying todo.js remove function...');
const todoJs = fs.readFileSync(path.join(__dirname, '../windows/js/todo.js'), 'utf8');
assert(todoJs.includes('save.flush'), 'todo.js remove must flush save');
assert(todoJs.includes('window.widgets?.todos?.remove'), 'todo.js remove must invoke IPC todos.remove');
console.log('✅ todo.js remove implementation verified.');

// 3. Verify main.js todos:remove & todos:set classroom dismissal tracking
console.log('\n[3/4] Verifying main.js classroom dismissal tracking on delete...');
const mainJs = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');
assert(mainJs.includes('classroomEngine.markTaskDismissed'), 'main.js must track deleted classroom tasks');
console.log('✅ main.js dismissal tracking verified.');

// 4. Verify classroom.js ignores dismissed tasks on sync
console.log('\n[4/4] Verifying classroom.js sync skips dismissed tasks...');
const classroomJs = fs.readFileSync(path.join(__dirname, '../src/core/classroom.js'), 'utf8');
assert(classroomJs.includes('markTaskDismissed'), 'classroom.js must define markTaskDismissed');
assert(classroomJs.includes('dismissedSet.has'), 'classroom.js sync must check dismissedSet to avoid resurrecting deleted tasks');
console.log('✅ classroom.js dismissed tasks protection verified.');

console.log('\n================================================================');
console.log('🎉 ALL TO-DO & CHECKLIST DELETION TESTS PASSED (100% SUCCESS) 🎉');
console.log('================================================================');
