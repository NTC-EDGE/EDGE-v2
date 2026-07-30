const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('apps/frontend/internal/src');
const featuresDir = path.resolve('apps/frontend/internal/src/features');

function getAllFiles(dir, exts = ['.ts', '.tsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, exts));
    } else {
      if (exts.includes(path.extname(fullPath))) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = getAllFiles(srcDir);

const findings = {
  typeAssertionsAs: [],
  anyType: [],
  tsDirectives: [],
  nonNullAssertions: [],
  pageNaming: []
};

// 1. Check for *Page naming in features
function checkPageNaming() {
  const featureFiles = getAllFiles(featuresDir);
  featureFiles.forEach(file => {
    const filename = path.basename(file);
    if (/Page\.tsx?$/i.test(filename) || /Page[A-Z]/.test(filename)) {
      // Check if file is named *Page.tsx
      if (/Page/i.test(filename) && !filename.includes('PageHeader')) {
        findings.pageNaming.push({ file, type: 'filename', detail: filename });
      }
    }

    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      // Check for component declaration or export with *Page (excluding PageHeader from @edge/ui)
      const pageMatch = line.match(/\b([A-Z][A-Za-z0-9]*Page)\b/g);
      if (pageMatch) {
        pageMatch.forEach(m => {
          if (m !== 'PageHeader' && m !== 'Page') {
            findings.pageNaming.push({ file, line: idx + 1, type: 'identifier', detail: m, code: line.trim() });
          }
        });
      }
    });
  });
}

// 2. Scan code for type safety rules
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // Skip comments if line is pure single-line comment (unless checking ts directives)
    const isCommentLine = trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');

    // Check @ts-ignore / @ts-expect-error
    if (trimmed.includes('@ts-ignore') || trimmed.includes('@ts-expect-error')) {
      findings.tsDirectives.push({ file, line: lineNum, code: trimmed });
    }

    if (isCommentLine) return;

    // Check : any or as any
    if (/\b:\s*any\b/.test(trimmed) || /\bas\s+any\b/.test(trimmed) || /<any>/.test(trimmed)) {
      findings.anyType.push({ file, line: lineNum, code: trimmed });
    }

    // Check type assertions using `as`
    // Ignore `import ... as ...` and `export ... as ...`
    if (/\bas\s+/.test(trimmed) && !/^import\b/.test(trimmed) && !/^export\s*\{.*?\bas\s+/.test(trimmed)) {
      // Check if `as` is used inside import clause e.g. import { Foo as Bar }
      // If line contains `import ` or `from `, filter out import statement aliases
      if (trimmed.includes('import ') && trimmed.includes('from ')) {
        // Import line alias, safe
      } else if (/Icon\s+as\s+Lucide/.test(trimmed) || /Icon\s+as\s+LucideIcon/.test(trimmed)) {
        // Destructured import alias line
      } else {
        findings.typeAssertionsAs.push({ file, line: lineNum, code: trimmed });
      }
    }

    // Check non-null assertion !
    // Look for identifier! or )! or ]! not followed by = or == or in string/comment
    // Also avoid JS logical NOT e.g. !foo, !=, !==, !Boolean
    // Non-null assertion pattern: ([a-zA-Z0-9_$]|\))!(\.|\,|;|\)|\s|$|\[) where next char is not =
    if (/(?:[a-zA-Z0-9_$]|\)|\])!+(?:\.|\,|;|\)|\s|$|\[)/.test(trimmed)) {
      // Check if it's logical NOT e.g. !value or !valid
      // Let's test if it's trailing ! after expression: e.g. value! or ref.current!
      // Exclude strings e.g. "!" or '!' or `!`
      const lineWithoutStrings = trimmed.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '').replace(/`.*?`/g, '');
      const nonNullMatch = lineWithoutStrings.match(/([a-zA-Z0-9_$]|\)|\])!+(?=[^=]|$)/g);
      if (nonNullMatch) {
        // Filter out cases like !isFormValid, !data, !(a && b) which start with !
        // nonNullMatch checks for trailing ! after an identifier/bracket.
        // Let's refine check for true non-null assertions
        nonNullMatch.forEach(m => {
          // If match is like "foo!" or "bar()!" or "arr[0]!"
          // Check if line has postfix bang
          if (/[a-zA-Z0-9_$]+!/.test(m) || /\)!/.test(m) || /\]!/.test(m)) {
            findings.nonNullAssertions.push({ file, line: lineNum, code: trimmed, match: m });
          }
        });
      }
    }
  });
});

checkPageNaming();

console.log(JSON.stringify(findings, null, 2));
