'use strict';

const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, '../windows/js');
const htmlDir = path.join(__dirname, '../windows');

console.log('========================================================');
console.log('1. SCANNING ALL JS FILES FOR STRINGS({ AR, EN }) PARITY');
console.log('========================================================\n');

const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));

function findStringsBlocks(content) {
  // Find strings({ ... })
  const startIdx = content.indexOf('strings({');
  if (startIdx === -1) return null;
  
  // Find ar: { and en: { inside
  const arIdx = content.indexOf('ar:', startIdx);
  const enIdx = content.indexOf('en:', startIdx);
  if (arIdx === -1 || enIdx === -1) return null;

  // Extract keys with regex
  // Let's do a more robust parse of key-value pairs
  const arBlock = enIdx > arIdx 
    ? content.substring(arIdx, enIdx)
    : content.substring(arIdx, content.indexOf('})', arIdx));
    
  const enBlock = enIdx > arIdx
    ? content.substring(enIdx, content.indexOf('})', enIdx))
    : content.substring(enIdx, arIdx);

  const getKeys = (txt) => {
    const keys = new Set();
    const r = /(?:['"`]([a-zA-Z0-9_.-]+)['"`]|([a-zA-Z0-9_.-]+))\s*:/g;
    let m;
    while ((m = r.exec(txt)) !== null) {
      const k = m[1] || m[2];
      if (k !== 'ar' && k !== 'en') keys.add(k);
    }
    return keys;
  };

  return { ar: getKeys(arBlock), en: getKeys(enBlock) };
}

jsFiles.forEach(file => {
  const content = fs.readFileSync(path.join(jsDir, file), 'utf8');
  const res = findStringsBlocks(content);
  if (!res) {
    console.log(`⚠️  ${file}: NO strings({ ar, en }) found!`);
    return;
  }
  const missingInEn = [...res.ar].filter(k => !res.en.has(k));
  const missingInAr = [...res.en].filter(k => !res.ar.has(k));
  
  if (missingInEn.length > 0 || missingInAr.length > 0) {
    console.log(`❌ ${file}:`);
    if (missingInEn.length > 0) console.log(`   Missing in EN (${missingInEn.length}):`, missingInEn);
    if (missingInAr.length > 0) console.log(`   Missing in AR (${missingInAr.length}):`, missingInAr);
  } else {
    console.log(`✅ ${file}: 100% matched (${res.ar.size} keys)`);
  }
});

console.log('\n========================================================');
console.log('2. SCANNING HTML FILES FOR UNTRANSLATED VISIBLE TEXT');
console.log('========================================================\n');

const htmlFiles = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(htmlDir, file), 'utf8');
  // Simple check for arabic characters in text content outside scripts/styles
  const bodyMatch = content.match(/<body[\s\S]*?<\/body>/);
  if (!bodyMatch) return;
  const bodyText = bodyMatch[0].replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  
  // Look for elements with Arabic text that lack data-i18n
  const lines = bodyText.split('\n');
  const untranslated = [];
  lines.forEach((line, lineNo) => {
    // If line has arabic characters and does not have data-i18n
    if (/[\u0600-\u06FF]/.test(line)) {
      if (!line.includes('data-i18n') && !line.includes('data-i18n-title') && !line.includes('data-i18n-ph')) {
        // Exclude comments
        if (!line.trim().startsWith('<!--') && !line.trim().startsWith('//')) {
          untranslated.push({ line: lineNo + 1, text: line.trim() });
        }
      }
    }
  });

  if (untranslated.length > 0) {
    console.log(`⚠️ ${file}: Found ${untranslated.length} lines with Arabic text lacking data-i18n:`);
    untranslated.slice(0, 10).forEach(u => console.log(`   L${u.line}: ${u.text.substring(0, 80)}`));
    if (untranslated.length > 10) console.log(`   ... and ${untranslated.length - 10} more`);
  } else {
    console.log(`✅ ${file}: All Arabic text properly translated or none found.`);
  }
});
