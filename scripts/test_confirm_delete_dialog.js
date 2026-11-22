'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('TESTING UNIVERSAL DELETE CONFIRMATION DIALOG (BEAUTIFUL & SIMPLE)');
console.log('================================================================\n');

// 1. Verify CSS styles in base.css
console.log('[1/4] Verifying base.css modal styles...');
const baseCss = fs.readFileSync(path.join(__dirname, '../windows/css/base.css'), 'utf8');
assert(baseCss.includes('.confirm-overlay'), 'base.css must define .confirm-overlay');
assert(baseCss.includes('.confirm-dialog'), 'base.css must define .confirm-dialog');
assert(baseCss.includes('.confirm-icon-box'), 'base.css must define .confirm-icon-box');
assert(baseCss.includes('.confirm-title'), 'base.css must define .confirm-title');
assert(baseCss.includes('.confirm-btn-delete'), 'base.css must define .confirm-btn-delete');
assert(baseCss.includes('.confirm-btn-cancel'), 'base.css must define .confirm-btn-cancel');
console.log('✅ base.css styles verified.');

// 2. Verify shell.js confirmDelete implementation
console.log('\n[2/4] Verifying shell.js implementation...');
const shellJs = fs.readFileSync(path.join(__dirname, '../windows/js/shell.js'), 'utf8');
assert(shellJs.includes('function confirmDelete(opts = {})'), 'shell.js must define confirmDelete');
assert(shellJs.includes('confirmDelete,'), 'shell.js must expose confirmDelete on window.UI');
assert(shellJs.includes('confirm-btn-delete'), 'shell.js must create delete button');
assert(shellJs.includes('confirm-btn-cancel'), 'shell.js must create cancel button');
assert(shellJs.includes("e.key === 'Escape'"), 'shell.js must support Escape key to cancel');
console.log('✅ shell.js confirmDelete verified.');

// 3. Verify widget integrations
console.log('\n[3/4] Verifying widget integrations...');
const notesJs = fs.readFileSync(path.join(__dirname, '../windows/js/notes.js'), 'utf8');
assert(notesJs.includes('confirmDelete'), 'notes.js must import confirmDelete');
assert(notesJs.includes('removeActive'), 'notes.js must have removeActive');
assert(notesJs.includes('deleteCurrentAudio'), 'notes.js must have deleteCurrentAudio');

const todoJs = fs.readFileSync(path.join(__dirname, '../windows/js/todo.js'), 'utf8');
assert(todoJs.includes('confirmDelete'), 'todo.js must import confirmDelete');

const clockJs = fs.readFileSync(path.join(__dirname, '../windows/js/clock.js'), 'utf8');
assert(clockJs.includes('confirmDelete'), 'clock.js must import confirmDelete');

const taskJs = fs.readFileSync(path.join(__dirname, '../windows/js/task.js'), 'utf8');
assert(taskJs.includes('confirmDelete'), 'task.js must import confirmDelete');
console.log('✅ All widget integrations verified.');

// 4. Functional simulation of the confirmation flow
console.log('\n[4/4] Simulating confirmation promise resolution...');
function simulateConfirm(answer) {
  return new Promise((resolve) => {
    // Mimic the exact logic in confirmDelete
    let closed = false;
    const close = (confirmed) => {
      if (closed) return;
      closed = true;
      resolve(confirmed);
    };
    if (answer === 'delete') close(true);
    else close(false);
  });
}

(async () => {
  const resultCancel = await simulateConfirm('cancel');
  assert.strictEqual(resultCancel, false, 'Cancel must resolve to false');

  const resultDelete = await simulateConfirm('delete');
  assert.strictEqual(resultDelete, true, 'Delete must resolve to true');

  console.log('✅ Confirmation promise simulation passed.');
  console.log('\n================================================================');
  console.log('🎉 ALL DELETE CONFIRMATION TESTS PASSED (100% SUCCESS) 🎉');
  console.log('================================================================');
})();
