const fs = require('fs');
const path = require('path');
const ts = require('typescript');

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
    } else if (exts.includes(path.extname(fullPath))) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = getAllFiles(srcDir);

const findings = {
  tsAsExpressions: [],
  tsTypeAssertions: [],
  tsNonNullExpressions: [],
  tsAnyKeyword: [],
  tsDirectives: [],
  pageNaming: []
};

files.forEach(filePath => {
  const code = fs.readFileSync(filePath, 'utf-8');
  const scriptKind = filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true, scriptKind);

  // Check comment directives
  const commentRanges = ts.getLeadingCommentRanges(code, 0) || [];
  // Also check all comment tokens in full source
  const fullCommentMatches = code.matchAll(/\/\/.*|\/\*[\s\S]*?\*\//g);
  for (const match of fullCommentMatches) {
    const commentText = match[0];
    if (commentText.includes('@ts-ignore') || commentText.includes('@ts-expect-error')) {
      const line = sourceFile.getLineAndCharacterOfPosition(match.index).line + 1;
      findings.tsDirectives.push({
        file: filePath,
        line,
        text: commentText.trim()
      });
    }
  }

  // Check filename for features (*Page.tsx)
  if (filePath.startsWith(featuresDir)) {
    const baseName = path.basename(filePath);
    if (baseName.toLowerCase().endsWith('page.tsx') || baseName.toLowerCase().endsWith('page.ts')) {
      findings.pageNaming.push({
        file: filePath,
        kind: 'filename',
        detail: baseName
      });
    }
  }

  function visit(node) {
    // Check identifiers in component names e.g. export const FooPage or function FooPage
    if (filePath.startsWith(featuresDir)) {
      if (ts.isFunctionDeclaration(node) && node.name) {
        if (/Page$/i.test(node.name.text) && !node.name.text.includes('PageHeader')) {
          const line = sourceFile.getLineAndCharacterOfPosition(node.name.getStart()).line + 1;
          findings.pageNaming.push({
            file: filePath,
            line,
            kind: 'component_name',
            detail: node.name.text
          });
        }
      }
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
        if (/Page$/i.test(node.name.text) && !node.name.text.includes('PageHeader')) {
          const line = sourceFile.getLineAndCharacterOfPosition(node.name.getStart()).line + 1;
          findings.pageNaming.push({
            file: filePath,
            line,
            kind: 'variable_component_name',
            detail: node.name.text
          });
        }
      }
    }

    // 1. Check `x as T` (AsExpression)
    if (ts.isAsExpression(node)) {
      const typeText = node.type.getText(sourceFile);
      const exprText = node.expression.getText(sourceFile);
      const fullText = node.getText(sourceFile);
      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;

      findings.tsAsExpressions.push({
        file: filePath,
        line,
        expr: exprText,
        type: typeText,
        full: fullText,
        isConstAssertion: typeText === 'const'
      });
    }

    // 2. Check `<T>x` (TypeAssertionExpression)
    if (ts.isTypeAssertionExpression(node)) {
      const typeText = node.type.getText(sourceFile);
      const exprText = node.expression.getText(sourceFile);
      const fullText = node.getText(sourceFile);
      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;

      findings.tsTypeAssertions.push({
        file: filePath,
        line,
        expr: exprText,
        type: typeText,
        full: fullText
      });
    }

    // 3. Check `x!` (NonNullExpression)
    if (ts.isNonNullExpression(node)) {
      const exprText = node.expression.getText(sourceFile);
      const fullText = node.getText(sourceFile);
      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;

      findings.tsNonNullExpressions.push({
        file: filePath,
        line,
        expr: exprText,
        full: fullText
      });
    }

    // 4. Check `any` keyword in types
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      findings.tsAnyKeyword.push({
        file: filePath,
        line,
        parentKind: ts.SyntaxKind[node.parent.kind]
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
});

console.log("=== SUMMARY ===");
console.log("tsAsExpressions count:", findings.tsAsExpressions.length);
console.log("  - Non-const as assertions:", findings.tsAsExpressions.filter(e => !e.isConstAssertion).length);
console.log("  - Const assertions (as const):", findings.tsAsExpressions.filter(e => e.isConstAssertion).length);
console.log("tsTypeAssertions (<T>x) count:", findings.tsTypeAssertions.length);
console.log("tsNonNullExpressions (x!) count:", findings.tsNonNullExpressions.length);
console.log("tsAnyKeyword count:", findings.tsAnyKeyword.length);
console.log("tsDirectives (@ts-ignore/@ts-expect-error) count:", findings.tsDirectives.length);
console.log("pageNaming violations count:", findings.pageNaming.length);

console.log("\n=== NON-CONST TYPE ASSERTIONS ('as T') ===");
findings.tsAsExpressions.filter(e => !e.isConstAssertion).forEach(e => {
  console.log(`${e.file}:${e.line} -> ${e.full}`);
});

console.log("\n=== CONST ASSERTIONS ('as const') ===");
findings.tsAsExpressions.filter(e => e.isConstAssertion).forEach(e => {
  console.log(`${e.file}:${e.line} -> ${e.full}`);
});

console.log("\n=== TYPE ASSERTIONS ('<T>x') ===");
findings.tsTypeAssertions.forEach(e => {
  console.log(`${e.file}:${e.line} -> ${e.full}`);
});

console.log("\n=== NON-NULL ASSERTIONS ('x!') ===");
findings.tsNonNullExpressions.forEach(e => {
  console.log(`${e.file}:${e.line} -> ${e.full}`);
});

console.log("\n=== ANY KEYWORD ===");
findings.tsAnyKeyword.forEach(e => {
  console.log(`${e.file}:${e.line}`);
});

console.log("\n=== TS DIRECTIVES (@ts-ignore / @ts-expect-error) ===");
findings.tsDirectives.forEach(e => {
  console.log(`${e.file}:${e.line} -> ${e.text}`);
});

console.log("\n=== PAGE NAMING VIOLATIONS (*Page in features) ===");
findings.pageNaming.forEach(e => {
  console.log(`${e.file}${e.line ? ':' + e.line : ''} [${e.kind}] -> ${e.detail}`);
});
