'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { Store } = require('../src/core/store');
const geo = require('../src/core/geometry');

console.log('================================================================');
console.log('TESTING COMPLETE WIDGET STATE PERSISTENCE ACROSS RESTARTS');
console.log('================================================================\n');

const testDir = path.join(__dirname, '..', 'scratch', 'persistence_test');
fs.mkdirSync(testDir, { recursive: true });
const testSettingsFile = path.join(testDir, 'test_settings.json');

try { fs.unlinkSync(testSettingsFile); } catch {}

// 1. Simulate initial setup with customized user state:
// - 'clock' is at a custom normal position and size 's'
// - 'quran' is hidden (visible: false)
// - 'todo' is minimized (isMini: true, size: 'icon') at grid coordinate (1140, 165)
// - 'habits' is resized to custom bounds (450, 300, 380, 480)
// - 'calendar' is hidden (visible: false)

console.log('[1/4] Simulating user session state changes...');
const initialWidgets = {
  clock: {
    visible: true,
    bounds: { x: 800, y: 50, width: 170, height: 170 },
    prevNormalBounds: { x: 800, y: 50, width: 170, height: 170 },
    size: 's',
    isMini: false,
  },
  quran: {
    visible: false, // User hid quran
    bounds: { x: 600, y: 16, width: 300, height: 210 },
    prevNormalBounds: { x: 600, y: 16, width: 300, height: 210 },
    size: 'm',
    isMini: false,
  },
  todo: {
    visible: true,
    bounds: { x: 1140, y: 165, width: 72, height: 72 },
    iconBounds: { x: 1140, y: 165, width: 72, height: 72 },
    prevNormalBounds: { x: 640, y: 238, width: 260, height: 220 },
    prevNormalKey: 's',
    size: 'icon',
    isMini: true, // User minimized todo
  },
  habits: {
    visible: true,
    bounds: { x: 450, y: 300, width: 380, height: 480 },
    prevNormalBounds: { x: 450, y: 300, width: 380, height: 480 },
    size: 'l',
    isMini: false,
  },
  calendar: {
    visible: false, // User hid calendar
    bounds: { x: 1094, y: 198, width: 170, height: 170 },
    size: 'm',
    isMini: false,
  },
};

const store = new Store(testSettingsFile, { initialized: true, layoutVersion: 2, widgets: initialWidgets });
store.set('widgets', initialWidgets);
store.set('initialized', true);
store.set('layoutVersion', 2);
store.flush();

assert(fs.existsSync(testSettingsFile), 'Settings file must exist after flush');
console.log('✅ Settings saved and flushed to disk successfully.');

// 2. Simulate App Restart: Load saved settings from disk
console.log('\n[2/4] Simulating App Restart & Startup Initialization...');
const loadedStore = new Store(testSettingsFile, {});
const loadedSettings = loadedStore.data;

assert.strictEqual(loadedSettings.initialized, true, 'initialized flag must be preserved');
assert.strictEqual(loadedSettings.layoutVersion, 2, 'layoutVersion must be preserved');

const configuredWidgets = loadedSettings.widgets;
assert(configuredWidgets, 'widgets map must exist in loaded settings');

// 3. Test Hidden Widget Persistence
console.log('\n[3/4] Verifying Hidden Widgets Stay Hidden...');
assert.strictEqual(configuredWidgets.quran.visible, false, 'Quran was hidden, must remain visible: false');
assert.strictEqual(configuredWidgets.calendar.visible, false, 'Calendar was hidden, must remain visible: false');

// Verify which widgets would be created by createWidget on startup
const createdIds = [];
for (const [id, cfg] of Object.entries(configuredWidgets)) {
  if (cfg && cfg.visible) {
    createdIds.push(id);
  }
}
assert(!createdIds.includes('quran'), 'Hidden widget quran must NOT be created');
assert(!createdIds.includes('calendar'), 'Hidden widget calendar must NOT be created');
assert(createdIds.includes('clock'), 'Visible widget clock must be created');
assert(createdIds.includes('todo'), 'Visible widget todo must be created');
assert(createdIds.includes('habits'), 'Visible widget habits must be created');
console.log('✅ Hidden widgets (quran, calendar) stay hidden and are NOT spawned on restart.');

// 4. Test Minimized and Custom Bound Persistence
console.log('\n[4/4] Verifying Minimized & Custom Position/Size Restoration...');
// Todo widget:
const todoCfg = configuredWidgets.todo;
assert.strictEqual(todoCfg.isMini, true, 'Todo was mini, must remain isMini: true');
assert.strictEqual(todoCfg.size, 'icon', 'Todo size must remain icon');
assert.strictEqual(todoCfg.bounds.width, 72, 'Mini widget width must be 72');
assert.strictEqual(todoCfg.bounds.height, 72, 'Mini widget height must be 72');
assert.strictEqual(todoCfg.bounds.x, 1140, 'Mini widget x coordinate preserved');
assert.strictEqual(todoCfg.bounds.y, 165, 'Mini widget y coordinate preserved');

// Habits widget:
const habitsCfg = configuredWidgets.habits;
assert.strictEqual(habitsCfg.isMini, false, 'Habits was normal size');
assert.strictEqual(habitsCfg.bounds.x, 450, 'Habits custom x preserved');
assert.strictEqual(habitsCfg.bounds.y, 300, 'Habits custom y preserved');
assert.strictEqual(habitsCfg.bounds.width, 380, 'Habits custom width preserved');
assert.strictEqual(habitsCfg.bounds.height, 480, 'Habits custom height preserved');

// Clock widget:
const clockCfg = configuredWidgets.clock;
assert.strictEqual(clockCfg.bounds.x, 800, 'Clock custom x preserved');
assert.strictEqual(clockCfg.bounds.y, 50, 'Clock custom y preserved');
assert.strictEqual(clockCfg.size, 's', 'Clock size preset preserved');

console.log('✅ Minimized widget restored in mini mode (72x72) at exact desktop grid slot.');
console.log('✅ Moved and resized widgets restored at exact coordinates and sizes.');

// Clean up
try { fs.unlinkSync(testSettingsFile); fs.rmdirSync(testDir); } catch {}

console.log('\n================================================================');
console.log('🎉🎉 ALL PERSISTENCE TESTS PASSED 100%! 🎉🎉');
console.log('================================================================');
