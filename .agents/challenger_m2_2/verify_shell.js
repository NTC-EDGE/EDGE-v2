const fs = require('fs');
const path = require('path');

const SHELL_DIR = path.join(__dirname, '../../apps/frontend/internal/src/features/shell/components');
const files = fs.readdirSync(SHELL_DIR).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

console.log(`=== SHELL COMPONENTS EMPIRICAL TEST HARNESS (REFINED AST/PATTERN SCAN) ===`);
console.log(`Auditing ${files.length} components in: ${SHELL_DIR}\n`);

let totalViolations = 0;
const results = [];

files.forEach((file) => {
  const filePath = path.join(SHELL_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Strip import statements first to check body for type assertions accurately
  const lines = content.split('\n');

  const fileReport = {
    file,
    anyCount: 0,
    asCount: 0,
    nonNullCount: 0,
    issues: []
  };

  let inImportBlock = false;

  lines.forEach((line, idx) => {
    const lineNo = idx + 1;
    const trimmed = line.trim();

    // Track multi-line import blocks
    if (trimmed.startsWith('import ') || trimmed.startsWith('import{')) {
      if (!trimmed.includes('from ') && !trimmed.endsWith(';')) {
        inImportBlock = true;
      }
    }

    if (inImportBlock) {
      if (trimmed.includes('from ') || trimmed.endsWith(';')) {
        inImportBlock = false;
      }
      return; // Skip lines inside import block
    }

    if (trimmed.startsWith('import ') || trimmed.startsWith('export {')) {
      return; // Skip single-line import/export statements
    }

    // Ignore comments
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;

    // Check 'any' type usage
    if (/:\s*any\b|<any>|as\s+any\b|any\[\]|\bany\s+=\s*/.test(line)) {
      fileReport.anyCount++;
      fileReport.issues.push(`Line ${lineNo}: 'any' type detected -> "${trimmed}"`);
    }

    // Check 'as' type assertion (in code body)
    if (/\bas\b/.test(line)) {
      // Type assertion looks like `val as Type` or `(x) as Type`
      if (/\b\w+\s+as\s+[A-Z\w<>[\]]+/i.test(line) || /\)\s+as\s+/i.test(line) || /}\s+as\s+/i.test(line)) {
        fileReport.asCount++;
        fileReport.issues.push(`Line ${lineNo}: 'as' type assertion detected -> "${trimmed}"`);
      }
    }

    // Check '!' non-null assertion
    // Look for identifier! followed by member access, index, call, comma, semicolon, operator
    // e.g. foo!.bar, foo![0], foo!(), foo!,
    if (/[a-zA-Z0-9_$]+\!(?:\.|\?\.|\)|;|,|\[)/.test(line)) {
      // Exclude logical negation like !isDark, !active, !=, !==
      // Only match variable followed by ! and then a delimiter or property access
      const matches = line.match(/[a-zA-Z0-9_$]+\!(?:\.|\?\.|\)|;|,|\[)/g);
      if (matches) {
        matches.forEach(m => {
          // If it's not a boolean check like if (!isDark), verify it's a non-null operator
          fileReport.nonNullCount++;
          fileReport.issues.push(`Line ${lineNo}: '!' non-null assertion detected -> "${trimmed}"`);
        });
      }
    }
  });

  totalViolations += fileReport.anyCount + fileReport.asCount + fileReport.nonNullCount;
  results.push(fileReport);
});

console.log(`--- 1. STRICT TYPE AUDIT RESULTS ---`);
results.forEach((r) => {
  console.log(`[${r.file}]: any=${r.anyCount}, as=${r.asCount}, nonNull=${r.nonNullCount}`);
  if (r.issues.length > 0) {
    r.issues.forEach(i => console.log(`   ❌ ${i}`));
  }
});
console.log(`\nTotal Type Violations: ${totalViolations}`);

console.log(`\n=== REFINED EMPIRICAL AUDIT COMPLETE ===`);
