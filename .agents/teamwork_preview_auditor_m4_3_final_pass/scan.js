const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../..');
const targetDirs = [
  path.join(projectRoot, 'apps/frontend/internal/src'),
  path.join(projectRoot, 'packages/ui')
];

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (e) {
    return fileList;
  }
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === '.agents' || file === 'dist' || file === 'build') continue;
    const filePath = path.join(dir, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        getAllFiles(filePath, fileList);
      } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    } catch (e) {
      // ignore broken symlinks
    }
  }
  return fileList;
}

const files = targetDirs.flatMap(dir => getAllFiles(dir));

console.log(`Scanning ${files.length} TypeScript files...`);

const findings = {
  tsDirectives: [],
  typeAssertionsAs: [],
  nonNullAssertions: [],
  anyTypes: [],
  forbiddenNames: [],
  facades: []
};

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const relPath = path.relative(projectRoot, file);

  // 1. @ts- directives
  lines.forEach((line, idx) => {
    if (/@ts-(ignore|expect-error|nocheck|suppress)/i.test(line)) {
      findings.tsDirectives.push({ file: relPath, line: idx + 1, content: line.trim() });
    }
  });

  // 2. Type assertion 'as' (excluding import/export statements and 'as const')
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('import ') || trimmed.startsWith('export {')) return;
    
    // Ignore lines that are comments
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    
    // Check for ' as ' in non-import contexts
    if (/\bas\b/.test(line)) {
      if (/import\s+.*?\bas\b/i.test(line) || /export\s+\{.*?\bas\b/i.test(line)) return;
      if (/\{\s*.*?\bas\b.*?\}/.test(line) && line.includes('from')) return;
      
      findings.typeAssertionsAs.push({ file: relPath, line: idx + 1, content: trimmed });
    }
  });

  // 3. Non-null assertions '!'
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    
    // regex for non-null assertion: identifier! or )! or ]! followed by dot, semicolon, comma, close paren, bracket, operator (excluding != and !==)
    const nonNullRegex = /([a-zA-Z0-9_$\]\)])\s*!(?!=)/g;
    let match;
    while ((match = nonNullRegex.exec(line)) !== null) {
      // exclude boolean operators or string format like !variable if regex misidentified
      // match[1] is the char before !
      // Check if line actually has a non-null assertion
      // Common non-null assertion patterns: `foo!`, `foo!.bar`, `foo![0]`
      // False positives: `!foo` (preceded by spaces/op), `foo != bar` (excluded by ?!=), `if (!foo)`
      // Let's record and inspect
      findings.nonNullAssertions.push({ file: relPath, line: idx + 1, content: trimmed, match: match[0] });
    }
  });

  // 4. any type usage
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    
    if (/:\s*any\b/i.test(line) || /<\s*any\s*>/i.test(line) || /\bany\[\]/i.test(line) || /\bas\s+any\b/i.test(line) || /Array<\s*any\s*>/i.test(line)) {
      findings.anyTypes.push({ file: relPath, line: idx + 1, content: trimmed });
    }
  });

  // 5. Forbidden naming (*Page)
  if (path.basename(file).includes('Page')) {
    findings.forbiddenNames.push({ file: relPath, reason: 'Contains "Page" in filename' });
  }

});

console.log(JSON.stringify(findings, null, 2));
