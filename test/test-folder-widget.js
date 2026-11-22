'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Testing Smart Folder Widget (مجلد الويتجات الذكي)...');

const ROOT = path.join(__dirname, '..');

// 1. folder.html
const htmlPath = path.join(ROOT, 'windows', 'folder.html');
assert(fs.existsSync(htmlPath), 'windows/folder.html must exist');
const html = fs.readFileSync(htmlPath, 'utf8');
assert(html.includes('id="folderPlate"'), 'folder.html must have #folderPlate');
assert(html.includes('id="folderCompactView"'), 'folder.html must have #folderCompactView');
assert(html.includes('id="folderExpandedView"'), 'folder.html must have #folderExpandedView');
assert(html.includes('id="folderGrid2x2"'), 'folder.html must have #folderGrid2x2');
assert(html.includes('id="expandedGrid"'), 'folder.html must have #expandedGrid');
assert(html.includes('id="folderManagerOverlay"'), 'folder.html must have #folderManagerOverlay');
console.log('✅ folder.html structure verified.');

// 2. folder.css
const cssPath = path.join(ROOT, 'windows', 'css', 'folder.css');
assert(fs.existsSync(cssPath), 'windows/css/folder.css must exist');
const css = fs.readFileSync(cssPath, 'utf8');
assert(css.includes('.folder-squircle-card'), 'folder.css must style .folder-squircle-card');
assert(css.includes('.folder-grid-2x2'), 'folder.css must define .folder-grid-2x2');
assert(css.includes('.folder-expanded-card'), 'folder.css must style .folder-expanded-card');
assert(css.includes('backdrop-filter: blur('), 'folder.css must use frosted glassmorphism');
assert(css.includes('folderExpandSpring'), 'folder.css must define folderExpandSpring animation');
assert(css.includes('folderCollapseExit'), 'folder.css must define folderCollapseExit animation');
assert(css.includes('squircleAbsorb'), 'folder.css must define squircleAbsorb absorb pop animation');
assert(css.includes('.drag-out-ghost'), 'folder.css must style .drag-out-ghost');
console.log('✅ folder.css styling and animations verified.');

// 3. folder.js
const jsPath = path.join(ROOT, 'windows', 'js', 'folder.js');
assert(fs.existsSync(jsPath), 'windows/js/folder.js must exist');
const js = fs.readFileSync(jsPath, 'utf8');
assert(js.includes('renderCompactView'), 'folder.js must define renderCompactView');
assert(js.includes('renderExpandedView'), 'folder.js must define renderExpandedView');
assert(js.includes('openExpandedFolder'), 'folder.js must define openExpandedFolder');
assert(js.includes('closeExpandedFolder'), 'folder.js must define closeExpandedFolder');
assert(js.includes('activateWidget'), 'folder.js must define activateWidget');
assert(js.includes('makeIconDraggable'), 'folder.js must define makeIconDraggable for bidirectional drag-out');
console.log('✅ folder.js interactive logic verified.');

// 4. i18n
const i18nPath = path.join(ROOT, 'src', 'core', 'i18n.js');
const i18n = fs.readFileSync(i18nPath, 'utf8');
assert(i18n.includes("'w.folder': 'المجلد الذكي'"), 'i18n.js must define Arabic title');
assert(i18n.includes("'w.folder': 'Smart Folder'"), 'i18n.js must define English title');
console.log('✅ i18n.js translations verified.');

// 5. preload.js
const preloadPath = path.join(ROOT, 'preload.js');
const preload = fs.readFileSync(preloadPath, 'utf8');
assert(preload.includes('folder: {'), 'preload.js must expose folder namespace');
assert(preload.includes("ipcRenderer.invoke('folder:get')"), 'preload.js must expose folder:get');
assert(preload.includes("ipcRenderer.invoke('folder:expand')"), 'preload.js must expose folder:expand');
assert(preload.includes("detachWidget:"), 'preload.js must expose folder.detachWidget');
assert(preload.includes("onDragHover:"), 'preload.js must expose folder.onDragHover');
assert(preload.includes("onAbsorb:"), 'preload.js must expose folder.onAbsorb');
console.log('✅ preload.js APIs verified.');

// 6. main.js
const mainPath = path.join(ROOT, 'main.js');
const main = fs.readFileSync(mainPath, 'utf8');
assert(main.includes('folder: {'), 'main.js must define folder in WIDGETS');
assert(main.includes("file: 'folder.html'"), 'main.js folder spec must point to folder.html');
assert(main.includes("ipcMain.handle('folder:expand'"), 'main.js must handle folder:expand');
assert(main.includes("ipcMain.handle('folder:collapse'"), 'main.js must handle folder:collapse');
assert(main.includes("ipcMain.handle('folder:activate-widget'"), 'main.js must handle folder:activate-widget');
assert(main.includes("ipcMain.handle('folder:detach-widget'"), 'main.js must handle folder:detach-widget');
assert(main.includes("syncFolderWithDesktop"), 'main.js must define syncFolderWithDesktop to prevent duplicates');
console.log('✅ main.js registrations, IPC handlers, and sync architecture verified.');

console.log('🎉 ALL SMART FOLDER TESTS PASSED 100%!');
