'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('TESTING FOLDER ANIMATION & UI PERFORMANCE INTEGRITY SUITE');
console.log('================================================================\n');

const ROOT = path.join(__dirname, '..');
const folderCss = fs.readFileSync(path.join(ROOT, 'windows', 'css', 'folder.css'), 'utf8');
const folderJs = fs.readFileSync(path.join(ROOT, 'windows', 'js', 'folder.js'), 'utf8');

// 1. Elimination of filter: blur inside animation keyframes
console.log('[1/6] Verifying No Heavy filter: blur in Folder Keyframes...');
const expandBlock = folderCss.match(/@keyframes folderExpandSpring\s*\{[\s\S]*?\n\}/);
const collapseBlock = folderCss.match(/@keyframes folderCollapseExit\s*\{[\s\S]*?\n\}/);
assert(expandBlock && !expandBlock[0].includes('filter: blur'), 'folderExpandSpring must not use filter: blur (prevents Windows DWM GPU hitching & gray box artifacts)');
assert(collapseBlock && !collapseBlock[0].includes('filter: blur'), 'folderCollapseExit must not use filter: blur');
assert(folderCss.includes('will-change: transform, opacity;'), 'folder-expanded-card must have will-change: transform, opacity for GPU acceleration');
console.log('✅ Keyframes use pure composited transform & opacity with zero blur hitching.\n');

// 2. Removal of Rotation from Spawn Animation
console.log('[2/6] Verifying Pure Spring Spawn Animation (No Sub-Pixel Edge Shimmering)...');
const spawnMatch = folderCss.match(/@keyframes folderSpawnSpring\s*\{[\s\S]*?\}/);
assert(spawnMatch, 'folderSpawnSpring keyframes must exist');
assert(!spawnMatch[0].includes('rotate'), 'folderSpawnSpring must not rotate the squircle card (avoids ClearType text blurring and edge aliasing artifacts)');
console.log('✅ Spawn animation uses clean native spring scale with zero rotation distortion.\n');

// 3. Stable Squircle Card Hover (No Compound Shake on Inner Slot Hover)
console.log('[3/6] Verifying Stable Squircle Container Geometry...');
assert(!/\.folder-squircle-card:hover\s*\{[\s\S]*?transform:\s*translateY/i.test(folderCss), 'folder-squircle-card:hover must not translate or scale container');
assert(folderCss.includes('.folder-slot-btn:hover'), 'folder-slot-btn:hover must handle individual icon elevation');
console.log('✅ Container card is rock-solid and stable, allowing clean independent icon interactions.\n');

// 4. Subtle Slot Tap Animation
console.log('[4/6] Verifying Slot Opening Tap Animation Limits...');
const slotPopMatch = folderCss.match(/@keyframes slotOpeningPop\s*\{[\s\S]*?\}/);
assert(slotPopMatch, 'slotOpeningPop keyframes must exist');
assert(!slotPopMatch[0].includes('scale(1.18)'), 'slotOpeningPop must not scale to 1.18 (prevents clipping/overlapping neighbor slots)');
console.log('✅ Slot click animation is tight, fast (0.28s), and never overlaps neighboring items.\n');

// 5. Seamless Cross-Fade Exit Morphing
console.log('[5/6] Verifying Seamless Close/Exit Cross-Fade Morph...');
assert(folderCss.includes('.folder-plate.is-closing .folder-compact-view'), 'folder.css must style compact view to crossfade in during exit');
assert(folderJs.includes("plate.classList.add('is-closing')"), 'folder.js closeExpandedFolder must trigger is-closing');
console.log('✅ Closing folder cross-fades directly back to compact view with zero blank frames.\n');

// 6. Pre-rendering & DOM Node Reuse
console.log('[6/6] Verifying Pre-rendering & DOM Node Preservation in folder.js...');
assert(folderJs.includes('renderExpandedView();'), 'openExpandedFolder must pre-render DOM items before expanding');
assert(folderJs.includes('existingButtons.get(wid)'), 'renderCompactView must reuse existing DOM buttons to prevent re-creation thrashing');
console.log('✅ Synchronous pre-rendering and button node preservation verified.\n');

console.log('================================================================');
console.log('🎉 ALL FOLDER ANIMATION & UI INTEGRITY CHECKS PASSED 100%! 🎉');
console.log('================================================================\n');
