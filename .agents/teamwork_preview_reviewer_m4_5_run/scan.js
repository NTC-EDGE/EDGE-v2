const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('apps/frontend/internal/src');

files.forEach(f => {
  const relPath = path.relative(process.cwd(), f);
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;

    // Check for 'as' type assertion
    if (/\bas\b/.test(line)) {
      const isImportExport = /^\s*(import|export)\b.*?\bas\b/.test(line);
      const isStringOrComment = /"(?:[^"\\]|\\.)*as(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*as(?:[^'\\]|\\.)*'/.test(line);
      if (!isImportExport && !isStringOrComment) {
        console.log(`AS ASSERTION: ${relPath}:${idx + 1}: ${trimmed}`);
      }
    }

    // Check for explicit type casting <Type> expr (outside JSX)
    // Check for : any or <any> or as any
    if (/\bany\b/.test(line)) {
      if (/:\s*any\b|as\s+any\b|<any>/.test(line)) {
        console.log(`ANY TYPE: ${relPath}:${idx + 1}: ${trimmed}`);
      }
    }

    // Check for non-null assertion !. or !; or !) or !,
    if (/[a-zA-Z0-9_]\!(?:\.|\;|\)|,|\[)/.test(line)) {
      console.log(`NON-NULL ASSERTION (!): ${relPath}:${idx + 1}: ${trimmed}`);
    }
  });

  const filename = path.basename(f);
  if (filename.endsWith('Page.tsx') || filename.endsWith('Page.ts') || (filename.includes('Page') && !filename.includes('PageHeader') && !filename.includes('StandardPageWrapper'))) {
    console.log(`PAGE FILENAME: ${relPath}`);
  }
});
