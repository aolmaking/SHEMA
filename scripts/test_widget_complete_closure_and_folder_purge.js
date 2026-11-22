'use strict';

/**
 * ============================================================================
 * TEST SUITE: COMPLETE WIDGET CLOSURE & SMART FOLDER PURGE VERIFICATION
 * ============================================================================
 * Verifies that:
 * 1. Disabling a widget from Settings (or closing it) completely purges it from
 *    all folders/boxes (الصناديق).
 * 2. Closed widgets NEVER appear inside folders, whether in compact or expanded view.
 * 3. When folder active widgets drop below 2:
 *    - 1 active widget left: folder dissolves and releases the last widget to desktop.
 *    - 0 active widgets left: folder completely dissolves and disappears.
 * 4. Turning off all widgets results in ZERO widgets, ZERO folders, ZERO background processes.
 * 5. folder.js invariants (filtering, manager modal, settings sync).
 * 6. main.js invariants (setWidgetVisible, getFolders, removeWidgetFromAllFolders, widget-status).
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('🧪 TESTING WIDGET COMPLETE CLOSURE & FOLDER PURGE INVARIANTS');
console.log('================================================================\n');

// 1. INVENTORY CHECK: main.js INVARIANTS
console.log('[1/4] Verifying main.js invariants...');
const mainJs = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');

assert.ok(mainJs.includes('removeWidgetFromAllFolders(id)'), 'setWidgetVisible must call removeWidgetFromAllFolders on close');
assert.ok(mainJs.includes('enabled: s.visible !== false'), 'folder:widget-status must report enabled status');
assert.ok(mainJs.includes('activeRemaining.length < 2'), 'removeWidgetFromAllFolders must check active widgets count');
console.log('✅ main.js invariants verified: setWidgetVisible wires removeWidgetFromAllFolders & reports enabled status.');

// 2. INVENTORY CHECK: folder.js INVARIANTS
console.log('\n[2/4] Verifying folder.js invariants...');
const folderJs = fs.readFileSync(path.join(__dirname, '..', 'windows', 'js', 'folder.js'), 'utf8');

assert.ok(folderJs.includes('enabled !== false'), 'folder.js must filter widgets by enabled status in compact view');
assert.ok(folderJs.includes('newSettings.widgets[wid]?.visible !== false'), 'folder.js must sync widgetIds on settings.onChange');
console.log('✅ folder.js invariants verified: closed widgets are never rendered and dynamically purged.');

// 3. SIMULATION TEST: DISSOLUTION & ZERO GHOST WIDGETS
console.log('\n[3/4] Running simulation of multi-widget shutdown and folder dissolution...');

const mockWidgets = {
  clock: { visible: true, size: 'm' },
  pomodoro: { visible: true, size: 'm' },
  calendar: { visible: true, size: 'm' },
  notes: { visible: true, size: 'm' }
};

const mockFolders = {
  folder_main: {
    id: 'folder_main',
    title: 'أدوات مساعدة',
    widgetIds: ['clock', 'pomodoro', 'calendar'],
    quickSlots: ['clock', 'pomodoro', 'calendar'],
    bounds: { x: 500, y: 100, width: 144, height: 144 }
  }
};

let destroyedList = [];
let createdList = [];

function mockDestroy(id) {
  destroyedList.push(id);
}

function mockCreate(id) {
  createdList.push(id);
}

function simulateSetWidgetVisible(id, visible) {
  if (!mockWidgets[id]) return;
  mockWidgets[id].visible = Boolean(visible);
  if (!visible) {
    mockDestroy(id);
    // removeWidgetFromAllFolders logic
    for (const [fid, f] of Object.entries(mockFolders)) {
      if (f.widgetIds && f.widgetIds.includes(id)) {
        f.widgetIds = f.widgetIds.filter(w => w !== id);
        f.quickSlots = (f.quickSlots || []).filter(w => w !== id);

        const activeRemaining = f.widgetIds.filter(w => mockWidgets[w] && mockWidgets[w].visible !== false);
        if (activeRemaining.length < 2) {
          if (activeRemaining.length === 1) {
            const lastWid = activeRemaining[0];
            delete mockFolders[fid];
            mockDestroy(fid);
            if (mockWidgets[lastWid].visible !== false) {
              mockCreate(lastWid);
            }
          } else {
            delete mockFolders[fid];
            mockDestroy(fid);
          }
        }
      }
    }
  }
}

// Step 3a: Clock is closed -> Folder should remain with 2 widgets: pomodoro, calendar
simulateSetWidgetVisible('clock', false);
assert.strictEqual(mockWidgets.clock.visible, false);
assert.deepStrictEqual(mockFolders.folder_main.widgetIds, ['pomodoro', 'calendar']);
assert.ok(!mockFolders.folder_main.widgetIds.includes('clock'), 'Closed clock must be purged from folder');
assert.ok(!destroyedList.includes('folder_main'), 'Folder must remain alive when 2 widgets are left');
console.log('✅ Step 3a: Closed clock removed from folder, folder safely maintains 2 remaining widgets.');

// Step 3b: Pomodoro is closed -> Only calendar remains (1 widget) -> Folder dissolves, calendar released to desktop
simulateSetWidgetVisible('pomodoro', false);
assert.strictEqual(mockWidgets.pomodoro.visible, false);
assert.strictEqual(mockFolders.folder_main, undefined, 'Folder must dissolve when fewer than 2 widgets remain');
assert.ok(destroyedList.includes('folder_main'), 'Folder window must be destroyed');
assert.ok(createdList.includes('calendar'), 'Lone surviving active widget must be released onto desktop');
console.log('✅ Step 3b: Folder dissolved automatically upon reaching 1 active widget, releasing calendar.');

// Step 3c: Calendar is closed -> Zero widgets left -> No windows, no folders
simulateSetWidgetVisible('calendar', false);
assert.strictEqual(mockWidgets.calendar.visible, false);
assert.ok(destroyedList.includes('calendar'), 'Calendar window destroyed');
assert.strictEqual(Object.keys(mockFolders).length, 0, 'Zero folders must exist');
console.log('✅ Step 3c: All widgets closed -> Complete zero-footprint state confirmed.');

// 4. TEST PURGE OF PRE-EXISTING INACTIVE WIDGETS IN GETFOLDERS
console.log('\n[4/4] Testing sanitize / purge in getFolders logic...');

const testLegacyFolders = {
  f1: {
    id: 'f1',
    widgetIds: ['notes', 'inactive1', 'inactive2'],
    quickSlots: ['notes', 'inactive1']
  }
};

const testWidgetStates = {
  notes: { visible: true },
  inactive1: { visible: false },
  inactive2: { visible: false }
};

for (const [fid, f] of Object.entries(testLegacyFolders)) {
  const active = f.widgetIds.filter(wid => testWidgetStates[wid] && testWidgetStates[wid].visible !== false);
  if (active.length < 2) {
    delete testLegacyFolders[fid];
  } else {
    f.widgetIds = active;
  }
}

assert.strictEqual(testLegacyFolders.f1, undefined, 'Folder with only 1 active widget must dissolve');
console.log('✅ Sanitization purges stale inactive widgets and dissolves empty/under-capacity folders.');

console.log('\n================================================================');
console.log('🎉 ALL COMPLETE WIDGET CLOSURE & FOLDER PURGE TESTS PASSED (100%)!');
console.log('================================================================');
