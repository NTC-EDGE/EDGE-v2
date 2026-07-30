const fs = require('fs');
const path = require('path');
const ts = require(path.join(__dirname, '../../apps/frontend/internal/node_modules/typescript'));

const COMPONENTS_DIR = path.join(__dirname, '../../apps/frontend/internal/src/features/shell/components');

const EXPECTED_FILES = [
  'AppLayout.tsx',
  'AppLayout.native.tsx',
  'AppLayout.web.tsx',
  'AppLayout.desktop.tsx',
  'Header.tsx',
  'MobileBottomTabBar.tsx',
  'RoleSwitcher.tsx',
  'Sidebar.tsx',
  'SidebarNavItem.tsx',
  'StandardPageWrapper.tsx',
  'TransitionWrapper.tsx'
];

const results = {
  codeViolations: {
    anyTypes: 0,
    typeAssertions: 0,
    nonNullAssertions: 0,
    details: []
  },
  authenticLogic: {
    platformVariantsPresent: false,
    themeHookUsage: [],
    themeToggleEmbedded: [],
    layoutConstraintsPresent: false,
    facadesOrHardcodes: []
  },
  preservation: {
    navigationPreserved: false,
    clerkAuthPreserved: false,
    roleContextPreserved: false,
    callbacksPreserved: false
  }
};

console.log('=== STARTING FORENSIC INTEGRITY SCAN ===');

// Check 1: Code Violations Scan (AST-based)
EXPECTED_FILES.forEach(filename => {
  const filePath = path.join(COMPONENTS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    results.codeViolations.details.push(`MISSING FILE: ${filename}`);
    return;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filename,
    fileContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  function visit(node) {
    // 1. AnyKeyword check
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      results.codeViolations.anyTypes++;
      const pos = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      results.codeViolations.details.push(`ANY_TYPE in ${filename}:${pos.line + 1}:${pos.character + 1}`);
    }

    // 2. AsExpression check (Type assertion 'as Type')
    if (node.kind === ts.SyntaxKind.AsExpression) {
      results.codeViolations.typeAssertions++;
      const pos = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      results.codeViolations.details.push(`TYPE_ASSERTION (as) in ${filename}:${pos.line + 1}:${pos.character + 1}`);
    }

    // 3. NonNullExpression check ('foo!')
    if (node.kind === ts.SyntaxKind.NonNullExpression) {
      results.codeViolations.nonNullAssertions++;
      const pos = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      results.codeViolations.details.push(`NON_NULL_ASSERTION (!) in ${filename}:${pos.line + 1}:${pos.character + 1}`);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  // Check Theme Hook Usage
  if (fileContent.includes('useTheme()') || fileContent.includes('useTheme(')) {
    results.authenticLogic.themeHookUsage.push(filename);
  }

  // Check ThemeToggle Embedding
  if (fileContent.includes('<ThemeToggle') || fileContent.includes('ThemeToggle')) {
    results.authenticLogic.themeToggleEmbedded.push(filename);
  }

  // Check for suspicious hardcoded outputs or facade patterns
  if (fileContent.includes('return "PASS"') || fileContent.includes('return true /* mock */')) {
    results.authenticLogic.facadesOrHardcodes.push(`Hardcoded pass in ${filename}`);
  }
  if (fileContent.includes('NotImplementedError')) {
    results.authenticLogic.facadesOrHardcodes.push(`Unimplemented facade in ${filename}`);
  }
});

// Check Platform Variants
const platformFiles = ['AppLayout.tsx', 'AppLayout.native.tsx', 'AppLayout.web.tsx', 'AppLayout.desktop.tsx'];
results.authenticLogic.platformVariantsPresent = platformFiles.every(f => fs.existsSync(path.join(COMPONENTS_DIR, f)));

// Check StandardPageWrapper Layout Constraints
const pageWrapperContent = fs.readFileSync(path.join(COMPONENTS_DIR, 'StandardPageWrapper.tsx'), 'utf8');
if (pageWrapperContent.includes('maxWidth: 1600') && pageWrapperContent.includes("alignSelf: 'center'")) {
  results.authenticLogic.layoutConstraintsPresent = true;
}

// Check Preservation
const appLayoutNativeContent = fs.readFileSync(path.join(COMPONENTS_DIR, 'AppLayout.native.tsx'), 'utf8');
const appLayoutWebContent = fs.readFileSync(path.join(COMPONENTS_DIR, 'AppLayout.web.tsx'), 'utf8');
const appLayoutDesktopContent = fs.readFileSync(path.join(COMPONENTS_DIR, 'AppLayout.desktop.tsx'), 'utf8');
const headerContent = fs.readFileSync(path.join(COMPONENTS_DIR, 'Header.tsx'), 'utf8');
const sidebarContent = fs.readFileSync(path.join(COMPONENTS_DIR, 'Sidebar.tsx'), 'utf8');
const roleSwitcherContent = fs.readFileSync(path.join(COMPONENTS_DIR, 'RoleSwitcher.tsx'), 'utf8');
const bottomTabContent = fs.readFileSync(path.join(COMPONENTS_DIR, 'MobileBottomTabBar.tsx'), 'utf8');

// Navigation check: ROLE_NAVIGATION_LINKS & PRIMARY_TABS used
if (sidebarContent.includes('links.map') && bottomTabContent.includes('PRIMARY_TABS.map')) {
  results.preservation.navigationPreserved = true;
}

// Clerk auth check: user, onLogout, EditAccountModal
if (headerContent.includes('user') && headerContent.includes('onLogout') && headerContent.includes('EditAccountModal')) {
  results.preservation.clerkAuthPreserved = true;
}

// Role context check: currentRole, onRoleSelect, ROLES
if (roleSwitcherContent.includes('ROLES.map') && sidebarContent.includes('currentRole') && headerContent.includes('currentRole')) {
  results.preservation.roleContextPreserved = true;
}

// Callback handlers check
if (
  sidebarContent.includes('onNavigate') &&
  sidebarContent.includes('onLogout') &&
  sidebarContent.includes('onRoleSelect') &&
  headerContent.includes('onNavigate') &&
  headerContent.includes('onLogout') &&
  headerContent.includes('onRoleSelect')
) {
  results.preservation.callbacksPreserved = true;
}

console.log('=== FORENSIC INTEGRITY RESULTS ===');
console.log(JSON.stringify(results, null, 2));

const totalViolations = results.codeViolations.anyTypes + results.codeViolations.typeAssertions + results.codeViolations.nonNullAssertions;
console.log(`TOTAL CODE VIOLATIONS: ${totalViolations}`);
console.log(`PLATFORM VARIANTS PRESENT: ${results.authenticLogic.platformVariantsPresent}`);
console.log(`LAYOUT CONSTRAINTS (maxWidth: 1600, alignSelf: center): ${results.authenticLogic.layoutConstraintsPresent}`);
console.log(`NAVIGATION PRESERVED: ${results.preservation.navigationPreserved}`);
console.log(`CLERK AUTH PRESERVED: ${results.preservation.clerkAuthPreserved}`);
console.log(`ROLE CONTEXT PRESERVED: ${results.preservation.roleContextPreserved}`);
console.log(`CALLBACKS PRESERVED: ${results.preservation.callbacksPreserved}`);
console.log(`THEME HOOK USAGE IN ${results.authenticLogic.themeHookUsage.length} COMPONENTS: ${results.authenticLogic.themeHookUsage.join(', ')}`);
console.log(`THEME TOGGLE EMBEDDED IN ${results.authenticLogic.themeToggleEmbedded.length} COMPONENTS: ${results.authenticLogic.themeToggleEmbedded.join(', ')}`);

if (totalViolations === 0 && results.authenticLogic.platformVariantsPresent && results.authenticLogic.layoutConstraintsPresent && results.preservation.navigationPreserved && results.preservation.clerkAuthPreserved && results.preservation.roleContextPreserved && results.preservation.callbacksPreserved) {
  console.log('\nFINAL FORENSIC VERDICT: CLEAN');
} else {
  console.log('\nFINAL FORENSIC VERDICT: INTEGRITY VIOLATION');
}
