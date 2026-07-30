const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/User/projects/ustp/NTC-EDGE/apps/frontend/internal/src/features';

const authScreens = [
  'login/components/ForgotPasswordScreen.web.tsx',
  'login/components/ForgotPasswordScreen.desktop.tsx',
  'login/components/InternalLoginScreen.web.tsx',
  'login/components/InternalLoginScreen.desktop.tsx',
  'login/components/LandingScreen.web.tsx',
  'login/components/LandingScreen.desktop.tsx',
  'login/components/OnboardingScreen.web.tsx',
  'login/components/OnboardingScreen.desktop.tsx',
];

const settingsScreens = [
  'settings/screens/AdminSettingsScreen.web.tsx',
  'settings/screens/AdminSettingsScreen.desktop.tsx',
  'settings/screens/SettingsScreen.web.tsx',
  'settings/screens/SettingsScreen.desktop.tsx',
];

let issues = [];

authScreens.forEach(rel => {
  const fullPath = path.join(baseDir, rel);
  if (!fs.existsSync(fullPath)) {
    issues.push(`File missing: ${rel}`);
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf-8');
  const hasMaxWidth440 = content.includes('maxWidth: 440');
  const hasAlignSelfCenter = content.includes('alignSelf: "center"') || content.includes("alignSelf: 'center'");
  
  if (!hasMaxWidth440 || !hasAlignSelfCenter) {
    issues.push(`Auth screen ${rel} missing maxWidth: 440 or alignSelf: 'center'. hasMaxWidth440=${hasMaxWidth440}, hasAlignSelfCenter=${hasAlignSelfCenter}`);
  }
});

settingsScreens.forEach(rel => {
  const fullPath = path.join(baseDir, rel);
  if (!fs.existsSync(fullPath)) {
    issues.push(`File missing: ${rel}`);
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf-8');
  const hasMaxWidth1200 = content.includes('maxWidth: 1200');
  const hasAlignSelfCenter = content.includes('alignSelf: "center"') || content.includes("alignSelf: 'center'");
  
  if (!hasMaxWidth1200 || !hasAlignSelfCenter) {
    issues.push(`Settings screen ${rel} missing maxWidth: 1200 or alignSelf: 'center'. hasMaxWidth1200=${hasMaxWidth1200}, hasAlignSelfCenter=${hasAlignSelfCenter}`);
  }
});

console.log('Layout Caps Check Issues Count:', issues.length);
if (issues.length > 0) {
  console.log('Issues:', JSON.stringify(issues, null, 2));
} else {
  console.log('PASS: All Auth (maxWidth: 440) & Settings (maxWidth: 1200) web & desktop screens contain proper layout caps with alignSelf: center.');
}
