const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/User/projects/ustp/NTC-EDGE/apps/frontend/internal/src/features';

const expectedScreenSets = [
  // Auth screens
  { dir: 'login/components', prefix: 'ForgotPasswordScreen' },
  { dir: 'login/components', prefix: 'InternalLoginScreen' },
  { dir: 'login/components', prefix: 'LandingScreen' },
  { dir: 'login/components', prefix: 'OnboardingScreen' },
  // Settings screens
  { dir: 'settings/screens', prefix: 'AdminSettingsScreen' },
  { dir: 'settings/screens', prefix: 'SettingsScreen' }
];

let missing = [];

expectedScreenSets.forEach(set => {
  const suffixes = ['.native.tsx', '.web.tsx', '.desktop.tsx', '.tsx'];
  suffixes.forEach(sfx => {
    const filePath = path.join(baseDir, set.dir, `${set.prefix}${sfx}`);
    if (!fs.existsSync(filePath)) {
      missing.push(filePath);
    }
  });

  // Verify master .tsx imports native, web, desktop
  const masterPath = path.join(baseDir, set.dir, `${set.prefix}.tsx`);
  if (fs.existsSync(masterPath)) {
    const content = fs.readFileSync(masterPath, 'utf-8');
    const hasNative = content.includes(`${set.prefix}.native`);
    const hasDesktop = content.includes(`${set.prefix}.desktop`);
    const hasWeb = content.includes(`${set.prefix}.web`) || content.includes(`WebScreen`);
    if (!hasNative || !hasDesktop || !hasWeb) {
      missing.push(`Master screen ${masterPath} missing delegation imports!`);
    }
  }
});

console.log('Missing 4-file components or imports count:', missing.length);
if (missing.length > 0) {
  console.log('Violations:', JSON.stringify(missing, null, 2));
} else {
  console.log('PASS: All 6 Auth and Settings screens adhere 100% to 4-file platform architecture.');
}
