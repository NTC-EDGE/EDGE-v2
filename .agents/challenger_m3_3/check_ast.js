const ts = require('typescript');
const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/User/projects/ustp/NTC-EDGE';
const dirs = [
  path.join(baseDir, 'apps/frontend/internal/src/features/login'),
  path.join(baseDir, 'apps/frontend/internal/src/features/auth'),
  path.join(baseDir, 'apps/frontend/internal/src/features/settings')
];

let files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.ts') || p.endsWith('.tsx')) files.push(p);
  }
}
dirs.forEach(walk);

console.log('Total files checked:', files.length);

let violations = [];

files.forEach(filePath => {
  const code = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true);

  function checkNode(node) {
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      violations.push({ filePath, line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1, type: 'any keyword' });
    }
    if (node.kind === ts.SyntaxKind.AsExpression) {
      violations.push({ filePath, line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1, type: 'as assertion' });
    }
    if (node.kind === ts.SyntaxKind.NonNullExpression) {
      violations.push({ filePath, line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1, type: '! non-null assertion' });
    }
    if (node.kind === ts.SyntaxKind.TypeAssertionExpression) {
      violations.push({ filePath, line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1, type: '<Type> assertion' });
    }
    ts.forEachChild(node, checkNode);
  }

  ts.forEachChild(sourceFile, checkNode);
});

console.log('AST Violations Count:', violations.length);
if (violations.length > 0) {
  console.log('Violations:', JSON.stringify(violations, null, 2));
} else {
  console.log('PASS: ZERO any, ZERO as, ZERO ! non-null assertions across all Auth and Settings files.');
}
