const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\User\\projects\\ustp\\NTC-EDGE\\apps\\frontend\\internal';
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file === 'node_modules' || file === '.next' || file === 'dist' || file === 'build' || file === '.expo') return;
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}
const files = walk(targetDir);

let asAssertions = [];
let nonNullAssertions = [];
let facadeCount = 0;
let tsIgnoreCount = 0;
let anyCount = 0;
let ruleViolations = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;

    // Check @ts-ignore
    if (/@ts-(ignore|expect-error|nocheck)/i.test(line)) {
      tsIgnoreCount++;
      ruleViolations.push({ file: f, line: idx + 1, type: 'ts-ignore', text: trimmed });
    }

    // Check non-null assertions like `foo!`, `arr[0]!`, `ref.current!`, `param!`
    // Avoid matching `!=`, `!==`, `!val`, `!!val`, or string literals / comments
    const nonNullRegex = /([a-zA-Z0-9_\)\]])!\s*([\.\,\;\)\}\:]|\s+[a-zA-Z0-9_\$]|\s*$)/g;
    let match;
    while ((match = nonNullRegex.exec(line)) !== null) {
      // Ignore if inside strings or template literals simple check
      if (!line.includes("'") && !line.includes('"') && !line.includes('`')) {
        nonNullAssertions.push({ file: f, line: idx + 1, text: trimmed, match: match[0] });
      } else {
        // Need to be careful with strings like "Hello!"
        // If match[0] is preceded by quote or inside string, skip
        const charBefore = match.index > 0 ? line[match.index] : '';
        const charAfter = line[match.index + match[0].length - 1];
        // If string context, check simple quotes
        const beforeSub = line.substring(0, match.index);
        const singleQ = (beforeSub.match(/'/g) || []).length % 2 === 1;
        const doubleQ = (beforeSub.match(/"/g) || []).length % 2 === 1;
        const backQ = (beforeSub.match(/`/g) || []).length % 2 === 1;
        if (!singleQ && !doubleQ && !backQ) {
          nonNullAssertions.push({ file: f, line: idx + 1, text: trimmed, match: match[0] });
        }
      }
    }

    // Check `as` assertions: e.g. `val as TargetType`
    // Exclude import/export statements, `as const`, and string text inside JSX <Text>
    if (/\b([a-zA-Z0-9_\)\]])\s+as\s+([A-Z][a-zA-Z0-9_<>]|string|number|boolean|unknown|any|never|object|Record)/.test(line)) {
      if (!line.includes('import ') && !line.includes('export ') && !line.includes('as const')) {
        const beforeSub = line.substring(0, line.indexOf('as'));
        const singleQ = (beforeSub.match(/'/g) || []).length % 2 === 1;
        const doubleQ = (beforeSub.match(/"/g) || []).length % 2 === 1;
        if (!singleQ && !doubleQ) {
          asAssertions.push({ file: f, line: idx + 1, text: trimmed });
        }
      }
    }
  });
});

console.log('=== AUDIT SUMMARY ===');
console.log('Total files checked:', files.length);
console.log('TS Directives (@ts-ignore etc):', tsIgnoreCount);
console.log('Non-Null Assertions (!):', nonNullAssertions.length, JSON.stringify(nonNullAssertions, null, 2));
console.log('Type Assertions (as):', asAssertions.length, JSON.stringify(asAssertions, null, 2));
