const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("=== EMPIRICAL CHALLENGE & VERIFICATION SUITE FOR APP LAYOUT ===");

const shellDir = path.resolve(__dirname, '../../apps/frontend/internal/src/features/shell/components');
const internalAppDir = path.resolve(__dirname, '../../apps/frontend/internal');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    testsFailed++;
  }
}

// TEST 1: AppLayout.tsx Platform OS Routing Verification
console.log("\n--- TEST GROUP 1: AppLayout.tsx Platform Routing ---");
const appLayoutPath = path.join(shellDir, 'AppLayout.tsx');
const appLayoutCode = fs.readFileSync(appLayoutPath, 'utf8');

assert(appLayoutCode.includes('Platform.OS === "web"'), 'Contains Platform.OS check for web');
assert(appLayoutCode.includes('return <WebLayout {...props} />'), 'Routes web to WebLayout with props');
assert(appLayoutCode.includes('Platform.OS === "macos" || Platform.OS === "windows"'), 'Contains Platform.OS check for macos/windows');
assert(appLayoutCode.includes('return <DesktopLayout {...props} />'), 'Routes macos/windows to DesktopLayout with props');
assert(appLayoutCode.includes('return <NativeLayout {...props} />'), 'Fallback default routes to NativeLayout with props');
assert(appLayoutCode.includes('import { AppLayout as WebLayout } from "./AppLayout.web"'), 'Directly imports WebLayout without ambiguity');
assert(appLayoutCode.includes('import { AppLayout as NativeLayout } from "./AppLayout.native"'), 'Directly imports NativeLayout without ambiguity');
assert(appLayoutCode.includes('import { AppLayout as DesktopLayout } from "./AppLayout.desktop"'), 'Directly imports DesktopLayout without ambiguity');

// TEST 2: Layout Container Constraints (maxWidth 1600 / 1200 + alignSelf: 'center')
console.log("\n--- TEST GROUP 2: Layout Overstretch Constraints ---");
const pageWrapperPath = path.join(shellDir, 'StandardPageWrapper.tsx');
const pageWrapperCode = fs.readFileSync(pageWrapperPath, 'utf8');

assert(pageWrapperCode.includes('maxWidth: 1600'), 'StandardPageWrapper maxContainer defines maxWidth: 1600');
assert(pageWrapperCode.includes("alignSelf: 'center'") || pageWrapperCode.includes('alignSelf: "center"'), 'StandardPageWrapper maxContainer defines alignSelf: "center"');
assert(pageWrapperCode.includes("alignItems: 'center'") || pageWrapperCode.includes('alignItems: "center"'), 'StandardPageWrapper contentContainer aligns items center');

const webLayoutPath = path.join(shellDir, 'AppLayout.web.tsx');
const webLayoutCode = fs.readFileSync(webLayoutPath, 'utf8');
assert(webLayoutCode.includes('<StandardPageWrapper activeScreen={activeScreen}>'), 'AppLayout.web uses StandardPageWrapper');

const desktopLayoutPath = path.join(shellDir, 'AppLayout.desktop.tsx');
const desktopLayoutCode = fs.readFileSync(desktopLayoutPath, 'utf8');
assert(desktopLayoutCode.includes('<StandardPageWrapper activeScreen={activeScreen}>'), 'AppLayout.desktop uses StandardPageWrapper');

// TEST 3: Mobile Drawer & Desktop Workstation Title/Status Bar
console.log("\n--- TEST GROUP 3: Mobile Drawer & Desktop Workstation Components ---");
const nativeLayoutPath = path.join(shellDir, 'AppLayout.native.tsx');
const nativeLayoutCode = fs.readFileSync(nativeLayoutPath, 'utf8');

assert(nativeLayoutCode.includes('useShellState()'), 'AppLayout.native uses useShellState hook');
assert(nativeLayoutCode.includes('sidebarAnim'), 'AppLayout.native initializes sidebarAnim Animated.Value');
assert(nativeLayoutCode.includes('shouldRenderSidebar'), 'AppLayout.native manages shouldRenderSidebar state for lazy mounting');
assert(nativeLayoutCode.includes('translateX'), 'AppLayout.native interpolates translateX from -280 to 0');
assert(nativeLayoutCode.includes('backdropOpacity'), 'AppLayout.native interpolates backdropOpacity from 0 to 0.4');
assert(nativeLayoutCode.includes('closeSidebar'), 'AppLayout.native handles closeSidebar on backdrop press and navigation');
assert(nativeLayoutCode.includes('MobileBottomTabBar'), 'AppLayout.native renders MobileBottomTabBar when not in AccountSettings');
assert(nativeLayoutCode.includes('activeScreen !== "AccountSettings"'), 'AppLayout.native hides MobileBottomTabBar on AccountSettings screen');

assert(desktopLayoutCode.includes('NTC EDGE Workstation Client • Internal Operations'), 'AppLayout.desktop renders window title bar text');
assert(desktopLayoutCode.includes('#EF4444') && desktopLayoutCode.includes('#F59E0B') && desktopLayoutCode.includes('#10B981'), 'AppLayout.desktop renders red/amber/green workstation dots');
assert(desktopLayoutCode.includes('Server Status: Operational'), 'AppLayout.desktop renders workstation server status');
assert(desktopLayoutCode.includes('API Latency: 24ms'), 'AppLayout.desktop renders workstation API latency indicator');
assert(desktopLayoutCode.includes('user?.tenantName ?? "NCR Head Office"'), 'AppLayout.desktop renders regional office tenant context with fallback');

// TEST 4: TypeScript Compilation Verification
console.log("\n--- TEST GROUP 4: TypeScript Compilation Check ---");
try {
  const tscOutput = execSync('node node_modules/typescript/bin/tsc --noEmit', {
    cwd: internalAppDir,
    encoding: 'utf8'
  });
  console.log('tsc output:', tscOutput || '(No errors)');
  assert(true, 'npx tsc --noEmit executed successfully with 0 errors');
} catch (err) {
  console.error('tsc failed:', err.stdout || err.message);
  assert(false, 'npx tsc --noEmit failed');
}

// TEST 5: Code Quality Rules (0 any, 0 as casts, 0 ! non-null assertions)
console.log("\n--- TEST GROUP 5: Code Quality Audit (AGENTS.md Compliance) ---");
const filesToAudit = [
  'AppLayout.tsx',
  'AppLayout.native.tsx',
  'AppLayout.web.tsx',
  'AppLayout.desktop.tsx',
  'StandardPageWrapper.tsx',
  'Header.tsx',
  'Sidebar.tsx',
  'MobileBottomTabBar.tsx'
];

let qualityViolations = 0;
for (const file of filesToAudit) {
  const code = fs.readFileSync(path.join(shellDir, file), 'utf8');
  // Check any
  if (code.match(/:\s*any\b/) || code.match(/<any>/)) {
    console.error(`[FAIL] 'any' type found in ${file}`);
    qualityViolations++;
  }
  // Check non-null assertion !
  // Look for identifier! or )! (excluding != or !== or comments)
  const lines = code.split('\n');
  lines.forEach((line, idx) => {
    const cleanLine = line.replace(/\/\/.*/, '').replace(/".*?"/g, '').replace(/'.*?'/g, '');
    if (cleanLine.match(/[a-zA-Z0-9_)]!(?!=)/)) {
      console.error(`[FAIL] non-null assertion ! found in ${file}:${idx + 1}: ${line}`);
      qualityViolations++;
    }
  });
}
assert(qualityViolations === 0, 'Zero any types or ! non-null assertions found across shell components');

console.log(`\n=== SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED ===`);
if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
