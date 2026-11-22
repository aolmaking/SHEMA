'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('Testing Folder Settings Tab, Border Radius Control & Corner Artifact Fix...');

const ROOT = path.join(__dirname, '..');

// 1. Verify folder.html fixes
console.log('\n[1/6] Verifying windows/folder.html structure...');
const folderHtml = fs.readFileSync(path.join(ROOT, 'windows', 'folder.html'), 'utf8');
assert(folderHtml.includes('id="folderPlate"'), 'folder.html must have #folderPlate');
assert(!folderHtml.includes('class="plate tile-plate folder-plate"'), 'folderPlate must not have plate or tile-plate classes which cause corner bleed');
assert(folderHtml.includes('class="folder-plate"'), 'folderPlate must have class="folder-plate"');
console.log('✅ folder.html cleanly isolates folderPlate from outer window plate artifacts.');

// 2. Verify folder.css styling
console.log('\n[2/6] Verifying windows/css/folder.css corner fixes & dynamic variables...');
const folderCss = fs.readFileSync(path.join(ROOT, 'windows', 'css', 'folder.css'), 'utf8');
assert(folderCss.includes('.folder-plate::before'), 'folder.css must disable .folder-plate::before');
assert(folderCss.includes('.folder-plate::after'), 'folder.css must disable .folder-plate::after');
assert(folderCss.includes('display: none !important;'), 'folder-plate pseudo-elements must be hidden');
assert(folderCss.includes('var(--folder-radius, 24px)'), 'squircle card must use --folder-radius');
assert(folderCss.includes('background-clip: padding-box;'), 'squircle card must use background-clip: padding-box');
assert(folderCss.includes('overflow: hidden;'), 'squircle card must use overflow: hidden to clip corner artifacts');
console.log('✅ folder.css corner anti-aliasing and dynamic CSS variables verified.');

// 3. Verify settings.html folder tab and controls
console.log('\n[3/6] Verifying windows/settings.html folder tab & controls...');
const settingsHtml = fs.readFileSync(path.join(ROOT, 'windows', 'settings.html'), 'utf8');
assert(settingsHtml.includes('data-tab="folder"'), 'settings.html nav must have data-tab="folder"');
assert(settingsHtml.includes('data-pane="folder"'), 'settings.html must have data-pane="folder" tab pane');
assert(settingsHtml.includes('id="folderRadiusSlider"'), 'settings.html must have #folderRadiusSlider');
assert(settingsHtml.includes('id="folderRadiusBadge"'), 'settings.html must have #folderRadiusBadge');
assert(settingsHtml.includes('id="folderPreviewSquircle"'), 'settings.html must have #folderPreviewSquircle live preview');
assert(settingsHtml.includes('class="folder-presets-row"'), 'settings.html must have folder presets row');
assert(settingsHtml.includes('id="btnResetFolderSettings"'), 'settings.html must have reset button');
assert(settingsHtml.includes('<option value="folder" data-i18n="s.wFolder">'), 'appearanceScopeSelect must include folder');
console.log('✅ settings.html folder navigation, preview and controls verified.');

// 4. Verify settings.css folder styling
console.log('\n[4/6] Verifying windows/css/settings.css preview & control styling...');
const settingsCss = fs.readFileSync(path.join(ROOT, 'windows', 'css', 'settings.css'), 'utf8');
assert(settingsCss.includes('.folder-preview-squircle'), 'settings.css must style .folder-preview-squircle');
assert(settingsCss.includes('.folder-presets-row'), 'settings.css must style .folder-presets-row');
assert(settingsCss.includes('.slider-val-badge'), 'settings.css must style .slider-val-badge');
console.log('✅ settings.css preview styling verified.');

// 5. Verify settings.js logic & translations
console.log('\n[5/6] Verifying windows/js/settings.js logic & translations...');
const settingsJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'settings.js'), 'utf8');
assert(settingsJs.includes("'s.tabFolder': 'المجلدات والصناديق'"), 'settings.js must have Arabic tabFolder');
assert(settingsJs.includes("'s.tabFolder': 'Folders & Boxes'"), 'settings.js must have English tabFolder');
assert(settingsJs.includes("folder: 'folder'"), 'settings.js SECTION_TAB_MAP must include folder');
assert(settingsJs.includes("function buildFolderSettings()"), 'settings.js must define buildFolderSettings');
assert(settingsJs.includes("buildFolderSettings();"), 'settings.js wire() must call buildFolderSettings');
console.log('✅ settings.js folder settings handler & translations verified.');

// 6. Verify folder.js & main.js synchronization
console.log('\n[6/6] Verifying windows/js/folder.js and main.js settings integration...');
const folderJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'folder.js'), 'utf8');
assert(folderJs.includes("function applyFolderAppearance"), 'folder.js must define applyFolderAppearance');
assert(folderJs.includes("--folder-radius"), 'folder.js must set --folder-radius');
assert(folderJs.includes("window.widgets.settings.onChange"), 'folder.js must listen to settings changes');

const mainJs = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf8');
assert(mainJs.includes("folderSettings: {"), 'main.js DEFAULTS must include folderSettings');
assert(mainJs.includes("'folderSettings'"), 'main.js fillDefaults must merge folderSettings');
console.log('✅ folder.js and main.js settings integration verified.');

console.log('\n🎉 ALL FOLDER SETTINGS & CORNER FIX CHECKS PASSED 100%!');
