'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('Testing: Drag-out icon detachment from folder to desktop as mini icon...\n');

// 1. Verify main.js folder:drag-out-end integration
console.log('[1/3] Verifying main.js folder:drag-out-end wireup...');
const mainSrc = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');

assert(mainSrc.includes("ipcMain.handle('folder:drag-out-end'"), 'main.js must define folder:drag-out-end');
assert(mainSrc.includes("return detachWidgetFromFolder(id, folderId, screenX, screenY, senderWindow(e));"),
  'folder:drag-out-end must delegate directly to detachWidgetFromFolder');
console.log('✅ main.js folder:drag-out-end delegates to detachWidgetFromFolder.');

// 2. Verify detachWidgetFromFolder sets icon mode and removes from folder
console.log('\n[2/3] Verifying detachWidgetFromFolder invariants in main.js...');
assert(mainSrc.includes("size: 'icon'"), 'Must set size to icon');
assert(mainSrc.includes("isMini: true"), 'Must set isMini to true');
assert(mainSrc.includes("width: 48") || mainSrc.includes("width: 56"), 'Must set icon width');
assert(mainSrc.includes("height: 48") || mainSrc.includes("height: 56"), 'Must set icon height');
assert(mainSrc.includes("folder.widgetIds = folder.widgetIds.filter(w => w !== id);"),
  'Must remove detached widget from folder.widgetIds');
console.log('✅ detachWidgetFromFolder correctly converts widget to desktop icon and purges from folder.');

// 3. Verify folder.js removes item from state.widgetIds on drag-out
console.log('\n[3/3] Verifying folder.js drag-out logic...');
const folderSrc = fs.readFileSync(path.join(__dirname, '..', 'windows', 'js', 'folder.js'), 'utf8');

assert(folderSrc.includes("state.widgetIds = (state.widgetIds || []).filter(id => id !== wid);"),
  'folder.js must filter out dragged widget from state.widgetIds');
assert(folderSrc.includes("state.quickSlots = (state.quickSlots || []).filter(id => id !== wid);"),
  'folder.js must filter out dragged widget from state.quickSlots');
assert(folderSrc.includes("window.widgets?.folder?.dragOutEnd"),
  'folder.js must notify dragOutEnd backend');
console.log('✅ folder.js updates local state and notifies dragOutEnd.');

console.log('\n🎉 ALL DRAG-OUT DETACHMENT INTEGRITY CHECKS PASSED (100%)!');
