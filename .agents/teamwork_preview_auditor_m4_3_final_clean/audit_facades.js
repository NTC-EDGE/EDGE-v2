const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\User\\projects\\ustp\\NTC-EDGE\\apps\\frontend\\internal\\src';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(targetDir);

let suspicious = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  // Look for empty functions or functions returning fixed constants without any statements
  if (/=>\s*\{\s*return\s+(true|false|null|""|0)\s*;\s*\}/.test(content)) {
    suspicious.push({ file: f, reason: 'empty return constant arrow function' });
  }
  if (/function\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{\s*return\s+(true|false|null|""|0)\s*;\s*\}/.test(content)) {
    suspicious.push({ file: f, reason: 'empty return constant standard function' });
  }
  if (/NotImplementedError/.test(content)) {
    suspicious.push({ file: f, reason: 'NotImplementedError found' });
  }
});

console.log('=== FACADE AUDIT ===');
console.log('Suspicious patterns count:', suspicious.length);
suspicious.forEach(s => console.log('  -', s.file, s.reason));
