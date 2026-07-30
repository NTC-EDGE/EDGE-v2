const fs = require('fs');
const path = require('path');
const ts = require('typescript');

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
    } catch (e) {}
  }
  return fileList;
}

const files = targetDirs.flatMap(dir => getAllFiles(dir));

console.log(`AST Auditing ${files.length} TypeScript files...`);

const report = {
  asExpressions: [],
  typeAssertionExpressions: [],
  nonNullExpressions: [],
  anyKeywords: [],
  tsDirectives: [],
  pageNamedScreens: []
};

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(projectRoot, file);
  const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);

  // Check file comments for @ts- directives
  const fullText = sourceFile.getFullText();
  const commentRanges = ts.getLeadingCommentRanges(fullText, 0) || [];
  const matches = fullText.match(/@ts-(ignore|expect-error|nocheck|suppress)/g);
  if (matches) {
    report.tsDirectives.push({ file: relPath, matches });
  }

  // Check filename for *Page in features
  if (relPath.includes('features') && path.basename(file).toLowerCase().includes('page')) {
    report.pageNamedScreens.push({ file: relPath });
  }

  function visit(node) {
    // Check 'as' expression
    if (ts.isAsExpression(node)) {
      // Exclude 'as const'
      if (node.type && node.type.kind === ts.SyntaxKind.TypeReference && node.type.typeName && node.type.typeName.text === 'const') {
        // 'as const' is literal const assertion, but let's note it if needed. Rule says: "Never use type assertions (e.g. value as string, <string>value)"
      } else if (node.type && node.type.kind === ts.SyntaxKind.ConstKeyword) {
        // as const
      } else {
        const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        report.asExpressions.push({ file: relPath, line, text: node.getText() });
      }
    }

    // Check angle-bracket type assertion (<Type>value)
    if (ts.isTypeAssertionExpression(node)) {
      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      report.typeAssertionExpressions.push({ file: relPath, line, text: node.getText() });
    }

    // Check non-null expression (value!)
    if (ts.isNonNullExpression(node)) {
      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      report.nonNullExpressions.push({ file: relPath, line, text: node.getText() });
    }

    // Check 'any' keyword
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      report.anyKeywords.push({ file: relPath, line, text: node.parent ? node.parent.getText() : 'any' });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
});

console.log('=== AST AUDIT RESULTS ===');
console.log(JSON.stringify(report, null, 2));
