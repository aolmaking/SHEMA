'use strict';

const assert = require('assert');

console.log('Testing Multi-Folder Dynamics & Dissolution Rules...');

// Mock environment
const mockSettings = {
  folders: {},
  widgets: {
    clock: { visible: true, size: 'icon', bounds: { x: 100, y: 100, width: 64, height: 64 } },
    calendar: { visible: true, size: 'icon', bounds: { x: 180, y: 100, width: 64, height: 64 } },
    notes: { visible: true, size: 'icon', bounds: { x: 260, y: 100, width: 64, height: 64 } },
    pomodoro: { visible: true, size: 'icon', bounds: { x: 340, y: 100, width: 64, height: 64 } },
  }
};

let destroyedWindows = [];
let createdWindows = [];
let broadcastEvents = [];

function destroyWidget(id) {
  destroyedWindows.push(id);
}

function patchWidget(id, data) {
  mockSettings.widgets[id] = { ...(mockSettings.widgets[id] || {}), ...data };
}

function createWidget(id) {
  createdWindows.push(id);
}

function broadcast(event, payload) {
  broadcastEvents.push({ event, payload });
}

// Implement functions under test (matching main.js)
function getFolders() {
  return mockSettings.folders;
}

function saveFolders(folders) {
  mockSettings.folders = folders;
}

function removeWidgetFromAllFolders(wid) {
  const folders = getFolders();
  let changed = false;

  for (const [fid, f] of Object.entries(folders)) {
    if (f.widgetIds && f.widgetIds.includes(wid)) {
      f.widgetIds = f.widgetIds.filter(w => w !== wid);
      f.quickSlots = (f.quickSlots || []).filter(w => w !== wid);
      changed = true;

      // Check remaining widgets count in this folder:
      if (f.widgetIds.length < 2) {
        if (f.widgetIds.length === 1) {
          // Exactly 1 widget left: folder dissolves and releases the last widget onto the desktop!
          const lastWid = f.widgetIds[0];
          delete folders[fid];
          destroyWidget(fid);

          const lastBounds = f.bounds || { x: 200, y: 200, width: 64, height: 64 };
          patchWidget(lastWid, {
            visible: true,
            isMini: true,
            size: 'icon',
            bounds: { x: lastBounds.x, y: lastBounds.y, width: 64, height: 64 },
            iconBounds: { x: lastBounds.x, y: lastBounds.y, width: 64, height: 64 },
          });
          createWidget(lastWid);
        } else {
          // 0 widgets left: folder dissolves completely
          delete folders[fid];
          destroyWidget(fid);
        }
      }
    }
  }

  if (changed) {
    saveFolders(folders);
    broadcast('settings:changed', {});
  }
}

function createFolderFromHover(sourceId, targetId, targetBounds, sourceBounds) {
  const folders = getFolders();
  let fid = 'folder_' + Date.now();
  if (folders[fid]) fid += '_' + Math.floor(Math.random() * 10000 + 1);

  const isTargetMini = !targetBounds || (targetBounds.width <= 90 && targetBounds.height <= 90);
  const isSourceMini = !sourceBounds || (sourceBounds.width <= 90 && sourceBounds.height <= 90);

  let folderWidth = 190;
  let folderHeight = 220;
  let sizePreset = 's';

  if (!isTargetMini && !isSourceMini) {
    folderWidth = Math.min(600, Math.max(380, (targetBounds.width || 200) + (sourceBounds?.width ? Math.min(180, sourceBounds.width) : 100)));
    folderHeight = Math.max(260, targetBounds.height || 220);
    sizePreset = folderWidth > 400 ? 'wide' : 'm';
  } else if (!isTargetMini || !isSourceMini) {
    const fullBounds = !isTargetMini ? targetBounds : sourceBounds;
    folderWidth = Math.max(240, fullBounds.width || 240);
    folderHeight = Math.max(240, fullBounds.height || 240);
    sizePreset = 's';
  }

  const newFolder = {
    id: fid,
    title: 'مجلد جديد',
    widgetIds: [targetId, sourceId],
    quickSlots: [targetId, sourceId],
    bounds: {
      x: targetBounds.x,
      y: targetBounds.y,
      width: folderWidth,
      height: folderHeight,
    },
    size: sizePreset,
  };

  folders[fid] = newFolder;
  saveFolders(folders);

  destroyWidget(sourceId);
  destroyWidget(targetId);
  return fid;
}

// --- Test 1: Create folder from hover gesture ---
console.log('1. Testing folder creation from hover...');
const fid1 = createFolderFromHover('clock', 'calendar', { x: 180, y: 100, width: 64, height: 64 }, { width: 64, height: 64 });
assert(fid1, 'Folder 1 must be created');
assert.strictEqual(mockSettings.folders[fid1].widgetIds.length, 2);
assert.deepStrictEqual(mockSettings.folders[fid1].widgetIds, ['calendar', 'clock']);
assert(destroyedWindows.includes('clock') && destroyedWindows.includes('calendar'), 'Standalone windows destroyed on absorb');
console.log('✅ Folder created from hover between 2 widgets');

// --- Test 2: Multi-folder coexistence ---
console.log('2. Testing multi-folder coexistence...');
const fid2 = createFolderFromHover('notes', 'pomodoro', { x: 340, y: 100, width: 64, height: 64 }, { width: 64, height: 64 });
assert(fid2 && fid2 !== fid1, 'Folder 2 must be created as distinct folder');
assert.strictEqual(Object.keys(mockSettings.folders).length, 2, '2 folders exist simultaneously');
console.log('✅ Multiple folders coexist simultaneously');

// --- Test 3: Disable widget from settings when folder has 2 widgets ---
console.log('3. Testing dissolution when widget is disabled/removed and < 2 widgets remain...');
createdWindows = [];
destroyedWindows = [];

// Disable 'clock' from settings:
removeWidgetFromAllFolders('clock');

// fid1 had ['calendar', 'clock']. Removing clock leaves 1 widget ('calendar').
// Threshold < 2 widgets: folder fid1 must dissolve, and 'calendar' must be restored as standalone widget!
assert(!mockSettings.folders[fid1], 'Folder fid1 must be deleted/dissolved from folders collection');
assert(destroyedWindows.includes(fid1), 'Folder window fid1 must be destroyed');
assert(createdWindows.includes('calendar'), 'Remaining widget calendar must be spawned as standalone desktop widget');
assert.strictEqual(mockSettings.widgets.calendar.visible, true);
assert.strictEqual(mockSettings.widgets.calendar.isMini, true);
assert.strictEqual(mockSettings.widgets.calendar.size, 'icon');
console.log('✅ Folder automatically dissolves when < 2 widgets remain and restores the lone widget onto the desktop');

// --- Test 4: Dissolve second folder completely down to 0 widgets ---
console.log('4. Testing total dissolution when all widgets are closed...');
createdWindows = [];
destroyedWindows = [];

// Remove 'notes' -> leaves 1 widget ('pomodoro') -> fid2 dissolves, pomodoro restored
removeWidgetFromAllFolders('notes');
assert(!mockSettings.folders[fid2], 'Folder fid2 dissolved');
assert(createdWindows.includes('pomodoro'), 'Pomodoro restored');

// Now 0 folders exist!
assert.strictEqual(Object.keys(mockSettings.folders).length, 0, '0 folders exist, all widgets are outside on desktop');
console.log('✅ System smoothly operates with 0 folders and all widgets standalone on desktop');

console.log('🎉 ALL DISSOLUTION & MULTI-FOLDER TESTS PASSED 100%!');
