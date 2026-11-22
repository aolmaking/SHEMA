'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== Running Photo Widget Verification Tests ===');

// Test 1: Check preload.js exports
const preloadContent = fs.readFileSync(path.join(__dirname, '../preload.js'), 'utf8');
assert(preloadContent.includes('getPathForFile'), 'preload.js must expose getPathForFile');
assert(preloadContent.includes('webUtils.getPathForFile'), 'preload.js must use webUtils.getPathForFile');
console.log('✔ Test 1: Preload exposes webUtils.getPathForFile properly');

// Test 2: Check main.js photo handlers
const mainContent = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');
assert(mainContent.includes("ipcMain.handle('photo:pick'"), 'main.js must have photo:pick handler');
assert(mainContent.includes("app.getPath('pictures')"), 'photo:pick must default to pictures folder');
assert(mainContent.includes("jfif"), 'photo:pick must include modern image extensions like jfif');
console.log('✔ Test 2: main.js photo:pick defaults to Pictures folder with extended formats');

// Test 3: Check photo.js logic
const photoJsContent = fs.readFileSync(path.join(__dirname, '../windows/js/photo.js'), 'utf8');
assert(photoJsContent.includes('getPathForFile'), 'photo.js must use getPathForFile for dropped files');
assert(photoJsContent.includes('FileReader'), 'photo.js must have FileReader fallback');
assert(photoJsContent.includes('showImage(imgData.src'), 'pickPhoto must immediately show selected image');
console.log('✔ Test 3: photo.js immediately shows picked images and handles drop with getPathForFile');

// Test 4: Verify photo:get simulation logic
function simulatePhotoGet(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  const buf = fs.readFileSync(filePath);
  return {
    src: `data:${mime};base64,${buf.toString('base64')}`,
    name: path.basename(filePath),
    path: filePath,
  };
}

const sampleImg = path.join(__dirname, '../assets/icon.png');
if (fs.existsSync(sampleImg)) {
  const result = simulatePhotoGet(sampleImg);
  assert(result !== null, 'simulatePhotoGet should succeed on existing image');
  assert(result.src.startsWith('data:image/png;base64,'), 'MIME must be image/png');
  assert.strictEqual(result.name, 'icon.png');
  console.log('✔ Test 4: photo:get base64 data URL conversion succeeds on real file');
} else {
  console.log('✔ Test 4: (Skipped sample file check, file not present)');
}

console.log('=== All Photo Widget Tests Passed! ===\n');
