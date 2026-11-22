const fs = require('fs');
const html = fs.readFileSync('windows/settings.html', 'utf8');

const stack = [];
const lines = html.split('\n');

for (let lineNum = 1; lineNum <= lines.length; lineNum++) {
  const line = lines[lineNum - 1];
  const tagRegex = /<\/?([a-zA-Z0-9\-]+)(?:\s+[^>]*)?>/g;
  let match;
  while ((match = tagRegex.exec(line)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    
    // Ignore self-closing or void elements
    if (['input', 'img', 'br', 'hr', 'meta', 'link'].includes(tagName)) continue;
    if (fullTag.endsWith('/>')) continue;
    
    if (fullTag.startsWith('</')) {
      const last = stack.pop();
      if (!last || last.tag !== tagName) {
        console.log(`Mismatch at line ${lineNum}: found </${tagName}>, but expected </${last ? last.tag : 'NONE'}> (opened at line ${last ? last.line : '?'})`);
      }
    } else {
      stack.push({ tag: tagName, line: lineNum, text: line.trim() });
    }
  }
}

if (stack.length > 0) {
  console.log(`Unclosed tags: ${stack.length}`);
  stack.forEach(s => console.log(`Unclosed <${s.tag}> opened at line ${s.line}`));
} else {
  console.log('All tags matched perfectly!');
}
