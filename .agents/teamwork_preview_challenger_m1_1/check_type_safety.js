const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, '../../packages/ui');

function getFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        getFiles(fullPath, files);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) && !entry.name.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

const tsFiles = getFiles(uiDir);
console.log(`Auditing ${tsFiles.length} TS/TSX files in packages/ui for strict type safety rules...`);

const violations = [];

tsFiles.forEach((file) => {
  const relPath = path.relative(uiDir, file);
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    // Skip comments
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

    // Check for `any` type keyword
    // Match `: any`, `<any>`, `as any`, `Array<any>`, `Record<..., any>`
    if (/\bany\b/.test(line)) {
      // Ignore words like `many`, `company`, `anything` if captured, but \bany\b handles boundaries.
      // Ignore imports or comments if any
      violations.push({ file: relPath, line: lineNum, rule: 'no-any', code: line.trim() });
    }

    // Check for non-null assertion `!` (e.g. `foo!`, `bar.baz!`, `x!`)
    // Exclude `!=`, `!==`, `!foo`, `!isDark`, `!isFocused`, `!Boolean(...)`
    // Non-null assertion is identifier followed immediately by `!` not followed by `=`
    // Regex for non-null assertion: `[a-zA-Z0-9_\)\]]!(?!=)`
    // But watch out for boolean negation before variable if matched weirdly.
    const nonNullMatches = line.match(/([a-zA-Z0-9_\)\]])!(?!=)/g);
    if (nonNullMatches) {
      // Filter out standard JS operators if any false positive, e.g. JSX comments
      nonNullMatches.forEach(m => {
        // e.g. `foo!`
        violations.push({ file: relPath, line: lineNum, rule: 'no-non-null-assertion', code: line.trim(), match: m });
      });
    }

    // Check for `as` type assertions (e.g. `x as SomeType`, `as string`, `as const` - note `as const` is a const assertion, but let's log all `as`)
    // Exclude imports: `import * as React`
    // Exclude export: `export { ... as ... }`
    if (/\bas\b/.test(line)) {
      if (!line.includes('import ') && !line.includes('export {') && !line.includes('export *') && !line.includes('from ')) {
        violations.push({ file: relPath, line: lineNum, rule: 'type-assertion-as', code: line.trim() });
      }
    }
  });
});

console.log(`\nAudit finished. Total candidate violations found: ${violations.length}`);
violations.forEach(v => {
  console.log(`[${v.rule}] ${v.file}:${v.line} -> ${v.code}`);
});
