const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const featuresDir = path.resolve('apps/frontend/internal/src/features');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = getAllFiles(featuresDir);
const violations = [];

files.forEach((filePath) => {
  const code = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.Latest,
    true
  );

  function visit(node) {
    // 1. Type assertions: 'as T' (ts.SyntaxKind.AsExpression)
    if (ts.isAsExpression(node)) {
      const typeText = node.type.getText(sourceFile);
      // 'as const' is type narrowing literal assertion. Let's check if 'as const' is allowed or flagged.
      if (typeText !== 'const') {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        violations.push({
          file: path.relative(process.cwd(), filePath),
          line: line + 1,
          col: character + 1,
          type: 'Type Assertion (as)',
          code: node.getText(sourceFile)
        });
      }
    }

    // 2. Type assertions: '<T>value' (ts.SyntaxKind.TypeAssertionExpression)
    if (ts.isTypeAssertionExpression(node)) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      violations.push({
        file: path.relative(process.cwd(), filePath),
        line: line + 1,
        col: character + 1,
        type: 'Type Assertion (<Type>)',
        code: node.getText(sourceFile)
      });
    }

    // 3. Non-null assertion: 'expr!' (ts.SyntaxKind.NonNullExpression)
    if (ts.isNonNullExpression(node)) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      violations.push({
        file: path.relative(process.cwd(), filePath),
        line: line + 1,
        col: character + 1,
        type: 'Non-null Assertion (!)',
        code: node.getText(sourceFile)
      });
    }

    // 4. Any keyword: 'any' (ts.SyntaxKind.AnyKeyword)
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      violations.push({
        file: path.relative(process.cwd(), filePath),
        line: line + 1,
        col: character + 1,
        type: 'Any Type (any)',
        code: node.parent ? node.parent.getText(sourceFile) : 'any'
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
});

console.log(`Audited ${files.length} TS/TSX files in apps/frontend/internal/src/features/`);
console.log(`Total violations found: ${violations.length}\n`);

if (violations.length > 0) {
  console.log('VIOLATIONS SUMMARY:');
  violations.forEach((v) => {
    console.log(`[${v.type}] ${v.file}:${v.line}:${v.col} => ${v.code}`);
  });
} else {
  console.log('NO TYPE ASSERTION BYPASSES FOUND (PASS)');
}
