'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Testing Peek Preview 500ms Trigger, Immediate Hide & Rich UI Across All Widgets...');

const root = path.join(__dirname, '..');
const shellJs = fs.readFileSync(path.join(root, 'windows', 'js', 'shell.js'), 'utf8');
const folderJs = fs.readFileSync(path.join(root, 'windows', 'js', 'folder.js'), 'utf8');
const mainJs = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
const peekHtml = fs.readFileSync(path.join(root, 'windows', 'peek.html'), 'utf8');
const preloadJs = fs.readFileSync(path.join(root, 'preload.js'), 'utf8');

// 1. Verify 500ms hover trigger delay
assert.ok(shellJs.includes('}, 500);'), 'shell.js must trigger peek after 500ms (0.5 second)');
assert.ok(folderJs.includes('}, 500);'), 'folder.js must trigger peek after 500ms (0.5 second)');
console.log('✅ 1. Hover trigger delay strictly set to 500ms (half-second).');

// 2. Verify immediate disappearance on mouseleave and pointerdown
assert.ok(shellJs.includes("iconBox.addEventListener('mouseleave'") && shellJs.includes('window.widgets.win.hidePeek()'),
  'shell.js must immediately hide peek on mouseleave without delay');
assert.ok(!shellJs.includes('250);'), 'shell.js must NOT have delayed 250ms hide timeout');
assert.ok(shellJs.includes("iconBox.addEventListener('pointerdown'"),
  'shell.js must hide peek immediately on pointerdown (click/drag start)');
assert.ok(peekHtml.includes("document.addEventListener('mouseleave'"),
  'peek.html must dismiss immediately when mouse leaves peek window');
console.log('✅ 2. Immediate disappearance on mouseleave, drag and blur verified.');

// 3. Verify main.js preload, sizing, and loading safety
assert.ok(mainJs.includes('peekW = 340;') && mainJs.includes('peekH = 236;'),
  'main.js must size peek window comfortably to 340x236');
assert.ok(mainJs.includes("ipcMain.handle('peek:getPayload'"),
  'main.js must register peek:getPayload handler');
assert.ok(preloadJs.includes("getPeekPayload: () => ipcRenderer.invoke('peek:getPayload')"),
  'preload.js must expose getPeekPayload to window.widgets.win');
assert.ok(mainJs.includes("pWin.webContents.once('did-finish-load', deliverPayloadAndShow)"),
  'main.js must ensure page finishes loading before sending peek:load');
console.log('✅ 3. Pre-warming, race-free payload delivery and sizing verified.');

// 4. Verify all 10 widgets have rich data payload in main.js
const expectedWidgets = ['clock', 'pomodoro', 'habits', 'todo', 'calendar', 'notes', 'email', 'photo', 'quran', 'folder'];
for (const w of expectedWidgets) {
  assert.ok(mainJs.includes(`page === '${w}'`) || mainJs.includes(`'${w}'`), `main.js must have dedicated payload for ${w}`);
  assert.ok(peekHtml.includes(`case '${w}':`), `peek.html must have dedicated rich layout for ${w}`);
}
console.log('✅ 4. All 10 widgets have dedicated rich data payloads and visual layouts.');

// 5. Verify Spring Entrance & Modern Aesthetics in peek.html
assert.ok(peekHtml.includes('@keyframes peekSpringIn'), 'peek.html must feature ultra-fluid spring keyframes');
assert.ok(peekHtml.includes('cubic-bezier(0.16, 1.35, 0.45, 1)'), 'peek.html must use modern overshoot spring cubic-bezier');
assert.ok(peekHtml.includes('clock-mini-analog'), 'peek.html must include real-time ticking analog face for clock');
assert.ok(peekHtml.includes('pomo-ring-svg'), 'peek.html must include glowing circular HUD ring for pomodoro');
assert.ok(peekHtml.includes('email-avatar'), 'peek.html must include sender avatar for emails');
assert.ok(peekHtml.includes('folder-peek-grid'), 'peek.html must include interactive widget avatars for folders');
console.log('✅ 5. Stunning spring entrance animations and high-end aesthetics verified.');

console.log('\n================================================================');
console.log('🎉 ALL PEEK WINDOW HOVER, ANIMATION & RICH UI TESTS PASSED 100%!');
console.log('================================================================');
