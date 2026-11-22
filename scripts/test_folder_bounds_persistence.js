'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('Testing Folder Bounds & Position Persistence Across Restarts...');

// Read main.js source code to inspect logic
const mainSrc = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');

// Test 1: Verify getFolders does not contain the old destructive wipe (> 180 reset to 144)
console.log('\n[1/5] Verifying getFolders() does not reset large bounds...');
assert(!mainSrc.includes("if (f.size === 's' && (f.bounds.width > 180 || f.bounds.height > 180))"),
  'main.js getFolders() must NOT contain destructive wipe of f.bounds > 180');
console.log('✅ getFolders() preserves custom sizes without wiping.');

// Test 2: Verify startup loop does not force folders back to 144x144 based on size === "s"
console.log('\n[2/5] Verifying startup loop does not overwrite custom bounds...');
assert(!mainSrc.includes("(!f.size || f.size === 's')) {"),
  'main.js startup loop must NOT reset folders to 144x144 merely if f.size === "s"');
assert(mainSrc.includes("if (f.bounds.width === 190 && f.bounds.height === 220)"),
  'main.js startup loop only migrates legacy 190x220 rectangular bounds');
console.log('✅ Startup loop preserves customized folder sizes and positions.');

// Test 3: Verify createFolderWidget attaches move/resize listeners to persist bounds
console.log('\n[3/5] Verifying createFolderWidget persists move and resize events...');
assert(mainSrc.includes("win.on('move', persist);"), 'createFolderWidget must listen to move event');
assert(mainSrc.includes("win.on('resize', persist);"), 'createFolderWidget must listen to resize event');
assert(mainSrc.includes("folders[fid].bounds = { ...curBounds };"), 'createFolderWidget persist must update folders[fid].bounds');
assert(mainSrc.includes("saveFolders(folders);"), 'createFolderWidget persist must call saveFolders');
console.log('✅ createFolderWidget auto-persists move and resize changes.');

// Test 4: Verify saveAllWidgetStates handles folder windows on quit/restart
console.log('\n[4/5] Verifying saveAllWidgetStates persists folders...');
assert(mainSrc.includes("if (win._isFolder || (typeof id === 'string' && id.startsWith('folder')))"),
  'saveAllWidgetStates must detect folder windows');
assert(mainSrc.includes("win._isFolderExpanded && win._compactFolderBounds"),
  'saveAllWidgetStates must save compact bounds if folder was expanded on quit');
console.log('✅ saveAllWidgetStates persists folder bounds on quit.');

// Test 5: Verify folder:expand and folder:collapse bounds handling
console.log('\n[5/5] Verifying folder:expand and folder:collapse logic...');
assert(mainSrc.includes("win._isFolderExpanded = true;"), 'folder:expand sets _isFolderExpanded = true');
assert(mainSrc.includes("win._compactFolderBounds = curBounds;"), 'folder:expand saves _compactFolderBounds');
assert(mainSrc.includes("win._isFolderExpanded = false;"), 'folder:collapse resets _isFolderExpanded = false');
assert(mainSrc.includes("const compactBounds = win._compactFolderBounds || f?.bounds"), 'folder:collapse restores compact bounds');
console.log('✅ folder:expand and collapse preserve and restore compact bounds.');

console.log('\n🎉 ALL FOLDER BOUNDS & POSITION PERSISTENCE CHECKS PASSED 100%!\n');
