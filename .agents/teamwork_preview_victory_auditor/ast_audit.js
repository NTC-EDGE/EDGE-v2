const ts = require("typescript");
const fs = require("fs");
const path = require("path");

function getAllFiles(dir, exts = [".ts", ".tsx"]) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.name === "node_modules" || item.name.startsWith(".")) continue;
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, exts));
    } else if (exts.some(ext => item.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

const targetDirs = [
  path.resolve("c:/Users/User/projects/ustp/NTC-EDGE/apps/frontend/internal/src"),
  path.resolve("c:/Users/User/projects/ustp/NTC-EDGE/packages/ui")
];

let totalFiles = 0;
let violations = [];

for (const dir of targetDirs) {
  const files = getAllFiles(dir);
  totalFiles += files.length;
  
  for (const file of files) {
    const code = fs.readFileSync(file, "utf8");
    const sourceFile = ts.createSourceFile(
      file,
      code,
      ts.ScriptTarget.Latest,
      true
    );

    function checkNode(node) {
      // 1. Check for TSAsExpression (expr as Type)
      if (ts.isAsExpression(node)) {
        const typeText = node.type.getText(sourceFile);
        // Note: 'as const' is a const type assertion allowed in TS for literal types,
        // but let's check if even 'as const' or other type assertions exist.
        violations.push({
          file: path.relative("c:/Users/User/projects/ustp/NTC-EDGE", file),
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          type: "AsExpression",
          typeText: typeText,
          code: node.getText(sourceFile)
        });
      }
      
      // 2. Check for TypeAssertion (<Type>expr)
      if (ts.isTypeAssertionExpression && ts.isTypeAssertionExpression(node)) {
        violations.push({
          file: path.relative("c:/Users/User/projects/ustp/NTC-EDGE", file),
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          type: "TypeAssertion",
          code: node.getText(sourceFile)
        });
      }
      
      // 3. Check for NonNullExpression (expr!)
      if (ts.isNonNullExpression(node)) {
        violations.push({
          file: path.relative("c:/Users/User/projects/ustp/NTC-EDGE", file),
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          type: "NonNullExpression",
          code: node.getText(sourceFile)
        });
      }
      
      // 4. Check for AnyKeyword
      if (node.kind === ts.SyntaxKind.AnyKeyword) {
        violations.push({
          file: path.relative("c:/Users/User/projects/ustp/NTC-EDGE", file),
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          type: "AnyKeyword",
          code: node.parent ? node.parent.getText(sourceFile) : "any"
        });
      }

      ts.forEachChild(node, checkNode);
    }

    checkNode(sourceFile);
  }
}

console.log(`Scanned ${totalFiles} source files.`);
console.log(`Total occurrences: ${violations.length}`);

const nonConstAs = violations.filter(v => v.type === "AsExpression" && v.typeText !== "const");
const nonNulls = violations.filter(v => v.type === "NonNullExpression");
const anyKeywords = violations.filter(v => v.type === "AnyKeyword");
const typeAssertions = violations.filter(v => v.type === "TypeAssertion");

console.log(`Non-const AsExpression: ${nonConstAs.length}`);
console.log(`TypeAssertions (<Type>): ${typeAssertions.length}`);
console.log(`NonNullExpressions (!): ${nonNulls.length}`);
console.log(`AnyKeywords: ${anyKeywords.length}`);

if (nonConstAs.length > 0 || typeAssertions.length > 0 || nonNulls.length > 0 || anyKeywords.length > 0) {
  console.log("\n--- VIOLATIONS FOUND ---");
  console.log(JSON.stringify({ nonConstAs, typeAssertions, nonNulls, anyKeywords }, null, 2));
} else {
  console.log("\n--- PERFECT CLEAN TYPE SAFETY ---");
}
