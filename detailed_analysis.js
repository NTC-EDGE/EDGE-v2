const fs = require('fs');
const path = require('path');

const featuresDir = path.resolve('apps/frontend/internal/src/features');

const coreFeatures = [
  { name: 'Announcements', dir: 'announcements', screen: 'AnnouncementsScreen' },
  { name: 'Audit Logs', dir: 'audit-logs', screen: 'AuditLogsScreen' },
  { name: 'Dashboard', dir: 'dashboard', screen: 'DashboardScreen' },
  { name: 'Employees', dir: 'employees', screen: 'EmployeesScreen', content: 'EmployeesScreenContent' },
  { name: 'Feedback', dir: 'feedback', screen: 'FeedbackScreen' },
  { name: 'Form Builder', dir: 'form-builder', screen: 'FormBuilderScreen' },
  { name: 'Roles & Permission', dir: 'roles-permission', screen: 'RolesPermissionScreen' },
  { name: 'Settings (Admin)', dir: 'settings', screen: 'AdminSettingsScreen' },
  { name: 'Settings (Account)', dir: 'settings', screen: 'SettingsScreen' },
  { name: 'Users', dir: 'users', screen: 'UsersScreen', content: 'UsersScreenContent' },
  { name: 'Queue Activities', dir: 'queue', screen: 'ActivitiesScreen' },
  { name: 'Application Review', dir: 'queue', screen: 'ApplicationReviewScreen', content: 'ApplicationReviewScreenContent' },
  { name: 'Internal Login', dir: 'login', screen: 'InternalLoginScreen', sub: 'components' },
  { name: 'Forgot Password', dir: 'login', screen: 'ForgotPasswordScreen', sub: 'components' },
  { name: 'Landing', dir: 'login', screen: 'LandingScreen', sub: 'components' },
  { name: 'Onboarding', dir: 'login', screen: 'OnboardingScreen', sub: 'components' },
];

const results = [];

coreFeatures.forEach(feat => {
  const folder = feat.sub ? path.join(featuresDir, feat.dir, feat.sub) : path.join(featuresDir, feat.dir, 'screens');
  
  const nativeFile = path.join(folder, `${feat.screen}.native.tsx`);
  const webFile = path.join(folder, `${feat.screen}.web.tsx`);
  const desktopFile = path.join(folder, `${feat.screen}.desktop.tsx`);
  const masterFile = path.join(folder, `${feat.screen}.tsx`);

  const hasNative = fs.existsSync(nativeFile);
  const hasWeb = fs.existsSync(webFile);
  const hasDesktop = fs.existsSync(desktopFile);
  const hasMaster = fs.existsSync(masterFile);

  let contentFileAudit = null;
  if (feat.content) {
    const cFile = path.join(folder, `${feat.content}.tsx`);
    if (fs.existsSync(cFile)) {
      const code = fs.readFileSync(cFile, 'utf-8');
      contentFileAudit = {
        file: `${feat.content}.tsx`,
        usesTheme: /useTheme\s*\(/.test(code),
        fromEdgeUi: /import.*useTheme.*from\s+['"]@edge\/ui['"]/.test(code),
        hexes: [...new Set(code.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/g) || [])]
      };
    }
  }

  function auditFile(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const code = fs.readFileSync(filePath, 'utf-8');
    const importsUseTheme = /import.*useTheme.*from\s+['"]@edge\/ui['"]/.test(code) || /import.*\{[^}]*useTheme[^}]*\}/.test(code);
    const usesTheme = /useTheme\s*\(\s*\)/.test(code);
    const hexes = [...new Set(code.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/g) || [])];
    
    // Check specific theme tokens
    const tokens = {
      bg: /colors\.(background|surface|card)/.test(code),
      card: /colors\.(card|surface)/.test(code),
      text: /colors\.(text|primary|textMuted|subtext|foreground)/.test(code),
      border: /colors\.(border|divider|outline)/.test(code)
    };

    return {
      exists: true,
      importsUseTheme,
      usesTheme,
      tokens,
      hexes
    };
  }

  results.push({
    name: feat.name,
    screen: feat.screen,
    dir: feat.dir,
    completeness: {
      native: hasNative,
      web: hasWeb,
      desktop: hasDesktop,
      master: hasMaster,
      pass: hasNative && hasWeb && hasDesktop && hasMaster
    },
    audits: {
      native: auditFile(nativeFile),
      web: auditFile(webFile),
      desktop: auditFile(desktopFile),
      master: auditFile(masterFile)
    },
    contentFileAudit
  });
});

console.log(JSON.stringify(results, null, 2));
fs.writeFileSync('detailed_results.json', JSON.stringify(results, null, 2));
