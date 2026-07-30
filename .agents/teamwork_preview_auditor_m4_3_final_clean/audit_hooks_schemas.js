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

let safeAsyncUsage = [];
let zodSchemas = [];
let reactHookForms = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('safeAsync')) {
    safeAsyncUsage.push(f);
  }
  if (content.includes('z.object') || content.includes('z.string')) {
    zodSchemas.push(f);
  }
  if (content.includes('useForm')) {
    reactHookForms.push(f);
  }
});

console.log('=== HOOKS & SCHEMAS METRICS ===');
console.log('safeAsync usages:', safeAsyncUsage.length);
safeAsyncUsage.forEach(f => console.log('  -', path.relative(targetDir, f)));

console.log('\nZod schemas:', zodSchemas.length);
zodSchemas.forEach(f => console.log('  -', path.relative(targetDir, f)));

console.log('\nuseForm usages:', reactHookForms.length);
reactHookForms.forEach(f => console.log('  -', path.relative(targetDir, f)));
