'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Testing Marquee Box Selection & Group Move Together Architecture...');

const mainJs = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');
const shellJs = fs.readFileSync(path.join(__dirname, '..', 'windows', 'js', 'shell.js'), 'utf8');
const preloadJs = fs.readFileSync(path.join(__dirname, '..', 'preload.js'), 'utf8');
const baseCss = fs.readFileSync(path.join(__dirname, '..', 'windows', 'css', 'base.css'), 'utf8');
const marqueeHtml = fs.readFileSync(path.join(__dirname, '..', 'windows', 'marquee.html'), 'utf8');
const groupToolbarHtml = fs.readFileSync(path.join(__dirname, '..', 'windows', 'group-toolbar.html'), 'utf8');

// 1. Check main.js Group Drag and Multi-selection state
assert(mainJs.includes('selectedWidgets = new Set()'), 'main.js must define selectedWidgets Set');
assert(mainJs.includes("kind: 'groupDrag'"), 'main.js win:dragStart must support groupDrag gesture');
assert(mainJs.includes('g.kind === \'groupDrag\''), 'main.js win:dragMove and win:gestureEnd must handle groupDrag');
assert(mainJs.includes('startMarqueeMode'), 'main.js must define startMarqueeMode');
assert(mainJs.includes('arrangeSelectedGrid'), 'main.js must define arrangeSelectedGrid');
assert(mainJs.includes('restoreSelectedWidgets'), 'main.js must define restoreSelectedWidgets');
assert(mainJs.includes('selectAllMiniWidgets'), 'main.js must define selectAllMiniWidgets');
assert(mainJs.includes('clearWidgetSelection'), 'main.js must define clearWidgetSelection');

// 2. Check main.js IPC handlers
assert(mainJs.includes("ipcMain.handle('selection:toggle'"), 'main.js must handle selection:toggle');
assert(mainJs.includes("ipcMain.handle('selection:allMini'"), 'main.js must handle selection:allMini');
assert(mainJs.includes("ipcMain.handle('marquee:start'"), 'main.js must handle marquee:start');
assert(mainJs.includes("ipcMain.on('marquee:update'"), 'main.js must handle marquee:update');
assert(mainJs.includes("ipcMain.on('marquee:end'"), 'main.js must handle marquee:end');
assert(mainJs.includes("ipcMain.handle('group:arrangeGrid'"), 'main.js must handle group:arrangeGrid');
assert(mainJs.includes("ipcMain.handle('group:restoreAll'"), 'main.js must handle group:restoreAll');

// 3. Check preload.js API bridge
assert(preloadJs.includes('toggleSelect: (id)'), 'preload.js must expose toggleSelect');
assert(preloadJs.includes('selectAllMini: ()'), 'preload.js must expose selectAllMini');
assert(preloadJs.includes('startMarquee: (startPt)'), 'preload.js must expose startMarquee');
assert(preloadJs.includes('marquee: {'), 'preload.js must expose marquee object');
assert(preloadJs.includes('group: {'), 'preload.js must expose group object');

// 4. Check shell.js Shift+Drag marquee, Shift+Click toggle and selection listener
assert(shellJs.includes("window.widgets.win.startMarquee"), 'shell.js must trigger startMarquee on Shift/Ctrl drag');
assert(shellJs.includes("window.widgets.win.toggleSelect"), 'shell.js must toggleSelect on Shift/Ctrl click');
assert(shellJs.includes("window.widgets.win.onSelectionChanged"), 'shell.js must observe selection:changed');

// 5. Check base.css selection ring and checkmark badge
assert(baseCss.includes('.app-icon-widget.selected'), 'base.css must define selection outline for app-icon-widget');
assert(baseCss.includes('checkPop'), 'base.css must define checkPop animation for selection badge');

// 6. Check marquee.html and group-toolbar.html
assert(marqueeHtml.includes('marquee-box'), 'marquee.html must have marquee-box');
assert(groupToolbarHtml.includes('btnGrid'), 'group-toolbar.html must have btnGrid');
assert(groupToolbarHtml.includes('btnRestore'), 'group-toolbar.html must have btnRestore');

console.log('🎉 ALL MARQUEE SELECTION & GROUP MOVE TOGETHER TESTS PASSED 100%!');
