'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const jsDir = path.join(__dirname, '../windows/js');
const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));

console.log('=== PRECISE I18N DICTIONARY PARITY CHECK ===\n');

files.forEach(file => {
  const content = fs.readFileSync(path.join(jsDir, file), 'utf8');
  const match = content.match(/strings\(\s*(\{[\s\S]*?\n\s*\})\s*\)/);
  if (!match) return;

  try {
    const sandbox = {};
    const script = new vm.Script('obj = ' + match[1]);
    const context = vm.createContext(sandbox);
    script.runInContext(context);
    const dict = sandbox.obj;
    if (!dict.ar || !dict.en) {
      console.log(`⚠️  ${file}: Has strings() but missing ar or en top-level object`);
      return;
    }
    const arKeys = Object.keys(dict.ar);
    const enKeys = Object.keys(dict.en);

    const missingInEn = arKeys.filter(k => !(k in dict.en));
    const missingInAr = enKeys.filter(k => !(k in dict.ar));

    if (missingInEn.length > 0 || missingInAr.length > 0) {
      console.log(`❌ ${file}:`);
      if (missingInEn.length > 0) console.log(`   Missing in EN (${missingInEn.length}):`, missingInEn);
      if (missingInAr.length > 0) console.log(`   Missing in AR (${missingInAr.length}):`, missingInAr);
    } else {
      console.log(`✅ ${file}: 100% parity (${arKeys.length} keys in both ar & en)`);
    }
  } catch (err) {
    console.log(`⚠️  ${file}: Could not parse strings() object: ${err.message}`);
  }
});
