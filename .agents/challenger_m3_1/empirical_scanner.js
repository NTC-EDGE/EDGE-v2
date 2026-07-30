const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const rootDir = path.resolve('c:/Users/User/projects/ustp/NTC-EDGE');
const internalSrc = path.join(rootDir, 'apps/frontend/internal/src');
const loginDir = path.join(internalSrc, 'features/login');
const settingsDir = path.join(internalSrc, 'features/settings');

console.log("=== EMPIRICAL AST & LAYOUT SCANNER ===");

let totalFilesScanned = 0;
let errorsFound = [];

// 1. Target Screens 4-File Architecture Check
const targetScreens = [
  { name: 'LandingScreen', dir: path.join(loginDir, 'components') },
  { name: 'ForgotPasswordScreen', dir: path.join(loginDir, 'components') },
  { name: 'OnboardingScreen', dir: path.join(loginDir, 'components') },
  { name: 'InternalLoginScreen', dir: path.join(loginDir, 'components') },
  { name: 'SettingsScreen', dir: path.join(settingsDir, 'screens') },
  { name: 'AdminSettingsScreen', dir: path.join(settingsDir, 'screens') },
];

console.log("\n--- Checking 4-File Architecture Selector Pattern ---");
targetScreens.forEach(screen => {
  const suffixes = ['.native.tsx', '.web.tsx', '.desktop.tsx', '.tsx'];
  suffixes.forEach(suffix => {
    const filePath = path.join(screen.dir, `${screen.name}${suffix}`);
    if (fs.existsSync(filePath)) {
      console.log(`[PASS] ${screen.name}${suffix} exists.`);
    } else {
      console.log(`[FAIL] ${screen.name}${suffix} MISSING!`);
      errorsFound.push(`Missing 4-file architecture file: ${screen.name}${suffix}`);
    }
  });
});

// Helper to get all TS/TSX files recursively
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const loginFiles = getAllFiles(loginDir);
const settingsFiles = getAllFiles(settingsDir);
const allFilesToScan = [...loginFiles, ...settingsFiles];

console.log(`\n--- AST Scanning ${allFilesToScan.length} files in features/login & features/settings ---`);

allFilesToScan.forEach(filePath => {
  totalFilesScanned++;
  const relativePath = path.relative(rootDir, filePath);
  const code = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  function checkNode(node) {
    // Check for `any` keyword
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const err = `[FAIL] 'any' type used in ${relativePath}:${line + 1}:${character + 1}`;
      console.log(err);
      errorsFound.push(err);
    }

    // Check for `as` type assertion
    if (node.kind === ts.SyntaxKind.AsExpression) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const text = node.getText(sourceFile);
      const err = `[FAIL] 'as' assertion used in ${relativePath}:${line + 1}:${character + 1} ("${text}")`;
      console.log(err);
      errorsFound.push(err);
    }

    // Check for non-null assertion (`!`)
    if (node.kind === ts.SyntaxKind.NonNullExpression) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const text = node.getText(sourceFile);
      const err = `[FAIL] Non-null assertion (!) used in ${relativePath}:${line + 1}:${character + 1} ("${text}")`;
      console.log(err);
      errorsFound.push(err);
    }

    // Type assertion (<Type>expr)
    if (node.kind === ts.SyntaxKind.TypeAssertionExpression) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      const text = node.getText(sourceFile);
      const err = `[FAIL] Angle-bracket type assertion used in ${relativePath}:${line + 1}:${character + 1} ("${text}")`;
      console.log(err);
      errorsFound.push(err);
    }

    ts.forEachChild(node, checkNode);
  }

  checkNode(sourceFile);
});

console.log(`\nScan finished. Total files scanned: ${totalFilesScanned}`);
if (errorsFound.length === 0) {
  console.log("SUCCESS: ZERO 'any', ZERO 'as', ZERO '!' assertions found!");
} else {
  console.log(`FAILURE: ${errorsFound.length} violation(s) found!`);
}
