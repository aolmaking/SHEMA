'use strict';

const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, '../windows/js');
const htmlDir = path.join(__dirname, '../windows');

console.log('=== AUDITING I18N DICTIONARIES IN JS FILES ===\n');

const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));

// Function to extract I18N object from file content
function extractI18N(content) {
  // Look for I18N = { ar: { ... }, en: { ... } } or STRINGS = { ... }
  // We can use a regex to find ar: { ... } and en: { ... }
  const match = content.match(/const\s+(?:I18N|STRINGS)\s*=\s*\{([\s\S]*?)\n\s*\};/);
  if (!match) return null;
  
  // Try to extract keys in ar and en
  const i18nText = match[1];
  
  const arMatch = i18nText.match(/ar\s*:\s*\{([\s\S]*?)\n\s*\},?\s*en\s*:/);
  const enMatch = i18nText.match(/en\s*:\s*\{([\s\S]*?)\n\s*\}\s*,?\s*$/);
  
  if (!arMatch || !enMatch) return null;
  
  const extractKeys = (block) => {
    const keys = new Set();
    const keyRegex = /['"]([^'"]+)['"]\s*:/g;
    let m;
    while ((m = keyRegex.exec(block)) !== null) {
      keys.add(m[1]);
    }
    return keys;
  };
  
  return {
    ar: extractKeys(arMatch[1]),
    en: extractKeys(enMatch[1]),
  };
}

let totalMissingEn = 0;
let totalMissingAr = 0;

jsFiles.forEach(file => {
  const content = fs.readFileSync(path.join(jsDir, file), 'utf8');
  const dict = extractI18N(content);
  if (!dict) return;
  
  const missingEn = [];
  const missingAr = [];
  
  dict.ar.forEach(k => {
    if (!dict.en.has(k)) missingEn.push(k);
  });
  
  dict.en.forEach(k => {
    if (!dict.ar.has(k)) missingAr.push(k);
  });
  
  if (missingEn.length > 0 || missingAr.length > 0) {
    console.log(`File: ${file} (AR keys: ${dict.ar.size}, EN keys: ${dict.en.size})`);
    if (missingEn.length > 0) {
      console.log(`  ❌ Missing EN keys (${missingEn.length}):`, missingEn.slice(0, 10), missingEn.length > 10 ? `...and ${missingEn.length - 10} more` : '');
      totalMissingEn += missingEn.length;
    }
    if (missingAr.length > 0) {
      console.log(`  ❌ Missing AR keys (${missingAr.length}):`, missingAr.slice(0, 10), missingAr.length > 10 ? `...and ${missingAr.length - 10} more` : '');
      totalMissingAr += missingAr.length;
    }
  } else {
    console.log(`✅ File: ${file} perfectly balanced (${dict.ar.size} keys in both AR and EN)`);
  }
});

console.log(`\nTotal Missing EN Keys across JS dictionaries: ${totalMissingEn}`);
console.log(`Total Missing AR Keys across JS dictionaries: ${totalMissingAr}`);
