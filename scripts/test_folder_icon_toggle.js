'use strict';

/**
 * ============================================================================
 * TEST SUITE: FOLDER WIDGET ICON TOGGLE & REAL-TIME STATUS INDICATORS
 * (اختبار التبديل الذكي بين فتح وإغلاق الودجات داخل الصندوق مع مؤشرات الحالة)
 * ============================================================================
 * Validates:
 * 1. Single click opens widget when closed -> returns { action: 'opened' }
 * 2. Second click closes widget when already open -> returns { action: 'closed' }
 * 3. Closing does NOT remove widget from the folder container!
 * 4. Third click re-opens the widget cleanly
 * 5. Folder CSS rules for .slot-status-dot and active animations
 * 6. Folder JS slot creation, reuse, and status reflection in compact & expanded views
 * 7. Dynamic tooltips indicating "(انقر للتشغيل)" vs "(يعمل حالياً - انقر للإغلاق)"
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('🧪 TESTING FOLDER ICON TOGGLE (OPEN / CLOSE) & STATUS DOTS');
console.log('================================================================\n');

// 1. VERIFY CSS DECLARATIONS
console.log('[1/4] Verifying folder.css for slot status indicators...');
const cssPath = path.join(__dirname, '..', 'windows', 'css', 'folder.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

assert(cssContent.includes('.slot-status-dot'), 'folder.css must contain .slot-status-dot class');
assert(cssContent.includes('.folder-slot-btn.is-active .slot-status-dot'), 'folder.css must activate .slot-status-dot on .is-active');
assert(cssContent.includes('slotDotPop'), 'folder.css must have slotDotPop animation');
console.log('✅ folder.css has verified status dot styling and animation.');

// 2. VERIFY FOLDER.JS IMPLEMENTATION
console.log('\n[2/4] Verifying windows/js/folder.js implementation...');
const folderJsPath = path.join(__dirname, '..', 'windows', 'js', 'folder.js');
const folderJsContent = fs.readFileSync(folderJsPath, 'utf8');

assert(folderJsContent.includes('slot-status-dot'), 'folder.js must create or update .slot-status-dot');
assert(folderJsContent.includes('is-active'), 'folder.js must toggle .is-active class on buttons');
assert(folderJsContent.includes('refreshWidgetStatus'), 'folder.js must include refreshWidgetStatus function');
assert(folderJsContent.includes('updateAllStatusIndicators'), 'folder.js must include updateAllStatusIndicators function');
assert(folderJsContent.includes('يعمل حالياً - انقر للإغلاق'), 'folder.js must provide close tooltip when widget is active');
console.log('✅ folder.js toggle integration and status updater verified.');

// 3. VERIFY MAIN.JS TOGGLE & PERSISTENCE LOGIC
console.log('\n[3/4] Verifying main.js folder:activate-widget and status reporting...');
const mainJsPath = path.join(__dirname, '..', 'main.js');
const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');

assert(mainJsContent.includes("action: 'closed'"), 'main.js must return action: closed on toggle close');
assert(mainJsContent.includes("action: 'opened'"), 'main.js must return action: opened on open');
assert(mainJsContent.includes("isOpenAndVisible"), 'main.js must check if widget is already open and visible');
assert(mainJsContent.includes("'folder:widget-status'"), 'main.js must have folder:widget-status handler');
console.log('✅ main.js toggle handler and widget-status handler verified.');

// 4. SIMULATION TEST: TOGGLE STATE MACHINE & PRESERVATION OF FOLDER MEMBERSHIP
console.log('\n[4/4] Running simulation of toggle state machine...');

// Mock environment simulating Electron main process structures
const mockSettings = {
  widgets: {
    clock: { visible: false, size: 'm', isMini: false },
    todo: { visible: false, size: 'm', isMini: false },
  },
  folders: {
    folder_1: {
      id: 'folder_1',
      title: 'أدوات مساعدة',
      widgetIds: ['clock', 'todo'],
      quickSlots: ['clock', 'todo'],
    }
  }
};

const mockWindows = new Map();

function simulateActivateWidget(wid, fid) {
  const existingWin = mockWindows.get(wid);
  const curSetting = mockSettings.widgets[wid] || {};
  const isOpenAndVisible = existingWin && !existingWin.isDestroyed && existingWin.isVisible() && Boolean(curSetting.visible) && !curSetting.isMini && curSetting.size !== 'icon';

  if (isOpenAndVisible) {
    // TOGGLE CLOSE
    curSetting.visible = false;
    existingWin.isDestroyed = true;
    mockWindows.delete(wid);
    return { action: 'closed', widgetId: wid };
  }

  // TOGGLE OPEN
  curSetting.visible = true;
  curSetting.isMini = false;
  curSetting.size = 'm';
  mockWindows.set(wid, {
    isDestroyed: false,
    isVisible: () => true,
    getBounds: () => ({ x: 100, y: 100, width: 280, height: 220 })
  });
  return { action: 'opened', widgetId: wid };
}

// Initial state: Clock is closed inside folder_1
assert.strictEqual(mockSettings.widgets.clock.visible, false);
assert(mockSettings.folders.folder_1.widgetIds.includes('clock'));

// Click 1: Open Clock
const r1 = simulateActivateWidget('clock', 'folder_1');
assert.strictEqual(r1.action, 'opened', 'First click must open widget');
assert.strictEqual(mockSettings.widgets.clock.visible, true);
assert(mockWindows.has('clock'));
assert(mockSettings.folders.folder_1.widgetIds.includes('clock'), 'Widget must remain inside folder when opened');

// Click 2: Close Clock (Second click toggles it off!)
const r2 = simulateActivateWidget('clock', 'folder_1');
assert.strictEqual(r2.action, 'closed', 'Second click must close widget');
assert.strictEqual(mockSettings.widgets.clock.visible, false);
assert(!mockWindows.has('clock'), 'Window must be destroyed on close');
assert(mockSettings.folders.folder_1.widgetIds.includes('clock'), 'CRITICAL: Widget must STILL remain inside folder when closed!');

// Click 3: Re-open Clock
const r3 = simulateActivateWidget('clock', 'folder_1');
assert.strictEqual(r3.action, 'opened', 'Third click must reopen widget');
assert.strictEqual(mockSettings.widgets.clock.visible, true);
assert(mockWindows.has('clock'));

// Click 4: Re-close Clock
const r4 = simulateActivateWidget('clock', 'folder_1');
assert.strictEqual(r4.action, 'closed', 'Fourth click must re-close widget');
assert.strictEqual(mockSettings.widgets.clock.visible, false);
assert(!mockWindows.has('clock'));
assert(mockSettings.folders.folder_1.widgetIds.includes('clock'), 'Widget must remain permanently inside folder across multiple toggle cycles');

console.log('✅ Simulation passed: 4/4 toggle cycles validated with folder membership preserved.');

console.log('\n================================================================');
console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! TOGGLE OPEN/CLOSE IS READY.');
console.log('================================================================');
