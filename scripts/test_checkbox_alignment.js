const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('========================================================');
console.log('TESTING CHECKBOX CENTERING & BUTTON RESET INTEGRITY');
console.log('========================================================\n');

// 1. Verify base.css button reset
const baseCss = fs.readFileSync(path.join(__dirname, '../windows/css/base.css'), 'utf8');
assert(baseCss.includes('button { border: 0; background: none; cursor: pointer; padding: 0; margin: 0; }'),
  'button element must reset padding: 0 and margin: 0 in base.css');
console.log('✅ base.css button padding and margin reset verified.');

// 2. Verify todo.css .box and .box svg rules
const todoCss = fs.readFileSync(path.join(__dirname, '../windows/css/todo.css'), 'utf8');
assert(todoCss.includes('padding: 0 !important;'), 'todo.css .box must enforce padding: 0 !important');
assert(todoCss.includes('display: flex;'), 'todo.css .box must use flex layout for perfect centering');
assert(todoCss.includes('align-items: center;'), 'todo.css .box must align items center');
assert(todoCss.includes('justify-content: center;'), 'todo.css .box must justify content center');
assert(todoCss.includes('stroke-dasharray: 24;'), 'todo.css .box svg must have stroke-dasharray: 24');
assert(todoCss.includes('stroke-dashoffset: 24;'), 'todo.css .box svg must have stroke-dashoffset: 24');
assert(todoCss.includes('width: 11px;'), 'todo.css .box svg must have width: 11px');
assert(todoCss.includes('height: 11px;'), 'todo.css .box svg must have height: 11px');
console.log('✅ todo.css .box flex centering, padding reset, and checkmark dimensions verified.');

// 3. Verify task.css .box and .box svg rules
const taskCss = fs.readFileSync(path.join(__dirname, '../windows/css/task.css'), 'utf8');
assert(taskCss.includes('padding: 0 !important;'), 'task.css .box must enforce padding: 0 !important');
assert(taskCss.includes('display: flex;'), 'task.css .box must use flex layout');
assert(taskCss.includes('align-items: center;'), 'task.css .box must align items center');
assert(taskCss.includes('justify-content: center;'), 'task.css .box must justify content center');
console.log('✅ task.css .box flex centering and padding reset verified.');

console.log('\n========================================================');
console.log('🎉 ALL CHECKBOX CENTERING TESTS PASSED (100%)');
console.log('========================================================');
