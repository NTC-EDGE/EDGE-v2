const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('c:/Users/User/projects/ustp/NTC-EDGE');
const internalSrc = path.join(rootDir, 'apps/frontend/internal/src');
const loginDir = path.join(internalSrc, 'features/login');
const settingsDir = path.join(internalSrc, 'features/settings');

console.log("=== EMPIRICAL LAYOUT CAPS VERIFICATION ===");

function checkFile(filePath, expectedMaxWidth, label) {
  const relPath = path.relative(rootDir, filePath);
  const content = fs.readFileSync(filePath, 'utf8');

  const hasMaxWidth = content.includes(`maxWidth: ${expectedMaxWidth}`);
  const hasAlignSelfCenter = content.includes(`alignSelf: "center"`) || content.includes(`alignSelf: 'center'`);

  console.log(`Checking ${relPath} [Expected: maxWidth: ${expectedMaxWidth}, alignSelf: 'center']`);
  console.log(`  - maxWidth: ${expectedMaxWidth} : ${hasMaxWidth ? 'PASS' : 'FAIL'}`);
  console.log(`  - alignSelf: 'center'    : ${hasAlignSelfCenter ? 'PASS' : 'FAIL'}`);

  return { relPath, hasMaxWidth, hasAlignSelfCenter };
}

// 1. Auth Screens & Forms (expected maxWidth: 440)
const authFiles = [
  path.join(loginDir, 'components/LandingScreen.web.tsx'),
  path.join(loginDir, 'components/LandingScreen.desktop.tsx'),
  path.join(loginDir, 'components/LandingScreen.native.tsx'),
  path.join(loginDir, 'components/ForgotPasswordScreen.web.tsx'),
  path.join(loginDir, 'components/ForgotPasswordScreen.desktop.tsx'),
  path.join(loginDir, 'components/ForgotPasswordScreen.native.tsx'),
  path.join(loginDir, 'components/OnboardingScreen.web.tsx'),
  path.join(loginDir, 'components/OnboardingScreen.desktop.tsx'),
  path.join(loginDir, 'components/OnboardingScreen.native.tsx'),
  path.join(loginDir, 'components/InternalLoginScreen.web.tsx'),
  path.join(loginDir, 'components/InternalLoginScreen.desktop.tsx'),
  path.join(loginDir, 'components/InternalLoginScreen.native.tsx'),
  path.join(loginDir, 'forms/LoginForm.tsx'),
  path.join(loginDir, 'forms/ForgotPasswordRequestForm.tsx'),
  path.join(loginDir, 'forms/ForgotPasswordResetForm.tsx'),
  path.join(loginDir, 'components/MfaOtpVerificationModal.tsx'),
  path.join(loginDir, 'components/RegionSelectionModal.tsx'),
];

// 2. Settings Screens (expected maxWidth: 1200)
const settingsFiles = [
  path.join(settingsDir, 'screens/SettingsScreen.web.tsx'),
  path.join(settingsDir, 'screens/SettingsScreen.desktop.tsx'),
  path.join(settingsDir, 'screens/SettingsScreen.native.tsx'),
  path.join(settingsDir, 'screens/AdminSettingsScreen.web.tsx'),
  path.join(settingsDir, 'screens/AdminSettingsScreen.desktop.tsx'),
  path.join(settingsDir, 'screens/AdminSettingsScreen.native.tsx'),
];

console.log("\n--- Checking Auth Files (maxWidth: 440) ---");
let authResults = authFiles.map(f => checkFile(f, 440, "Auth"));

console.log("\n--- Checking Settings Files (maxWidth: 1200) ---");
let settingsResults = settingsFiles.map(f => checkFile(f, 1200, "Settings"));

const failures = [...authResults, ...settingsResults].filter(r => !r.hasMaxWidth || !r.hasAlignSelfCenter);

if (failures.length === 0) {
  console.log("\nALL LAYOUT CAP CHECKS PASSED!");
} else {
  console.log(`\n${failures.length} LAYOUT CHECKS FAILED:`);
  failures.forEach(f => console.log(` - ${f.relPath}: maxWidth ok: ${f.hasMaxWidth}, alignSelf ok: ${f.hasAlignSelfCenter}`));
}
