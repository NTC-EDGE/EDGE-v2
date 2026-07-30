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

let screenFiles = files.filter(f => f.includes('screens') || f.includes('Screen'));

console.log('Total screen-related files:', screenFiles.length);

let masterSelectors = screenFiles.filter(f => 
  f.endsWith('Screen.tsx') && 
  !f.endsWith('.web.tsx') && 
  !f.endsWith('.native.tsx') && 
  !f.endsWith('.desktop.tsx')
);

console.log('\nMaster Screen Selectors:');
masterSelectors.forEach(ms => {
  const content = fs.readFileSync(ms, 'utf8');
  console.log('---', path.basename(ms));
  console.log(content.trim());
});
