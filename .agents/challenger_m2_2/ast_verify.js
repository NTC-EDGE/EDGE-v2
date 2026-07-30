const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const SHELL_DIR = path.join(__dirname, '../../apps/frontend/internal/src/features/shell/components');
const files = fs.readdirSync(SHELL_DIR).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

console.log(`=== AST-LEVEL EMPIRICAL AUDIT (TypeScript Compiler API) ===`);
console.log(`Analyzing AST nodes across ${files.length} shell files...\n`);

let totalAstViolations = 0;
const astResults = [];

files.forEach((file) => {
  const filePath = path.join(SHELL_DIR, file);
  const sourceCode = fs.readFileSync(filePath, 'utf8');
  
  const sourceFile = ts.createSourceFile(
    file,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const fileViolations = {
    file,
    anyNodes: [],
    asNodes: [],
    nonNullNodes: []
  };

  function visit(node) {
    // 1. Check for AnyKeyword: `any`
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      fileViolations.anyNodes.push({
        line: line + 1,
        character: character + 1,
        text: node.getText(sourceFile)
      });
    }

    // 2. Check for AsExpression: `expr as Type`
    if (node.kind === ts.SyntaxKind.AsExpression) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      fileViolations.asNodes.push({
        line: line + 1,
        character: character + 1,
        text: node.getText(sourceFile)
      });
    }

    // 3. Check for NonNullExpression: `expr!`
    if (node.kind === ts.SyntaxKind.NonNullExpression) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      fileViolations.nonNullNodes.push({
        line: line + 1,
        character: character + 1,
        text: node.getText(sourceFile)
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  const violationCount = fileViolations.anyNodes.length + fileViolations.asNodes.length + fileViolations.nonNullNodes.length;
  totalAstViolations += violationCount;

  astResults.push(fileViolations);
});

astResults.forEach((res) => {
  const total = res.anyNodes.length + res.asNodes.length + res.nonNullNodes.length;
  console.log(`📄 [${res.file}] AST Audit:`);
  console.log(`   - AnyKeyword AST nodes: ${res.anyNodes.length}`);
  console.log(`   - AsExpression AST nodes: ${res.asNodes.length}`);
  console.log(`   - NonNullExpression AST nodes: ${res.nonNullNodes.length}`);

  if (res.anyNodes.length > 0) {
    res.anyNodes.forEach(n => console.log(`     ❌ AnyKeyword at line ${n.line}:${n.character} -> "${n.text}"`));
  }
  if (res.asNodes.length > 0) {
    res.asNodes.forEach(n => console.log(`     ❌ AsExpression at line ${n.line}:${n.character} -> "${n.text}"`));
  }
  if (res.nonNullNodes.length > 0) {
    res.nonNullNodes.forEach(n => console.log(`     ❌ NonNullExpression at line ${n.line}:${n.character} -> "${n.text}"`));
  }
});

console.log(`\n==================================================`);
console.log(`TOTAL AST STRICT TYPE VIOLATIONS FOUND: ${totalAstViolations}`);
console.log(`==================================================\n`);
