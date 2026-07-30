const fs = require('fs');
const path = require('path');
const ts = require('typescript');

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

let asAssertions = [];
let nonNullAssertions = [];
let anyTypes = [];
let pageFiles = [];

files.forEach(filePath => {
  const relPath = path.relative(process.cwd(), filePath);
  const fileContent = fs.readFileSync(filePath, 'utf8');

  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  function visit(node) {
    if (ts.isAsExpression(node)) {
      const lineAndChar = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const text = node.getText(sourceFile);
      asAssertions.push({
        file: relPath,
        line: lineAndChar.line + 1,
        text: text
      });
    }

    if (ts.isNonNullExpression(node)) {
      const lineAndChar = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const text = node.getText(sourceFile);
      nonNullAssertions.push({
        file: relPath,
        line: lineAndChar.line + 1,
        text: text
      });
    }

    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      const lineAndChar = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const text = node.parent ? node.parent.getText(sourceFile) : node.getText(sourceFile);
      anyTypes.push({
        file: relPath,
        line: lineAndChar.line + 1,
        text: text
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  const filename = path.basename(filePath);
  if (filename.includes('Page') && !filename.includes('PageHeader')) {
    pageFiles.push(relPath);
  }
});

console.log('=== TYPE ASSERTIONS (`as`) ===');
console.log(`Found: ${asAssertions.length}`);
asAssertions.forEach(a => console.log(`${a.file}:${a.line}: ${a.text}`));

console.log('\n=== NON-NULL ASSERTIONS (`!`) ===');
console.log(`Found: ${nonNullAssertions.length}`);
nonNullAssertions.forEach(n => console.log(`${n.file}:${n.line}: ${n.text}`));

console.log('\n=== `any` TYPES ===');
console.log(`Found: ${anyTypes.length}`);
anyTypes.forEach(a => console.log(`${a.file}:${a.line}: ${a.text}`));

console.log('\n=== PAGE FILES ===');
console.log(`Found: ${pageFiles.length}`);
pageFiles.forEach(p => console.log(p));
