const fs = require("fs");
const path = require("path");

const root = "c:/Users/User/projects/ustp/NTC-EDGE/apps/frontend/internal/src/features";

const screens = [
  "announcements/screens/AnnouncementsScreen",
  "audit-logs/screens/AuditLogsScreen",
  "feedback/screens/FeedbackScreen",
  "form-builder/screens/FormBuilderScreen",
  "queue/screens/ActivitiesScreen",
  "queue/screens/ApplicationReviewScreen",
  "roles-permission/screens/RolesPermissionScreen",
  "settings/screens/SettingsScreen",
  "settings/screens/AdminSettingsScreen",
  "login/components/LandingScreen",
  "login/components/ForgotPasswordScreen",
  "login/components/OnboardingScreen",
  "dashboard/screens/DashboardScreen",
  "employees/screens/EmployeesScreen",
  "login/components/InternalLoginScreen",
  "users/screens/UsersScreen"
];

let missingFiles = [];
let masterSelectorIssues = [];
let themeUsageIssues = [];
let maxWidthChecks = [];

for (const screenPath of screens) {
  const base = path.join(root, screenPath);
  const extensions = [".tsx", ".native.tsx", ".web.tsx", ".desktop.tsx"];
  
  for (const ext of extensions) {
    const fullPath = base + ext;
    if (!fs.existsSync(fullPath)) {
      missingFiles.push(screenPath + ext);
    } else {
      const content = fs.readFileSync(fullPath, "utf8");
      
      // Master selector check (.tsx)
      if (ext === ".tsx") {
        if (!content.includes("Platform.OS") || !content.includes("web")) {
          masterSelectorIssues.push({ file: screenPath + ext, reason: "Missing Platform.OS routing" });
        }
      } else {
        // Variant file check (.native.tsx, .web.tsx, .desktop.tsx)
        if (!content.includes("useTheme")) {
          themeUsageIssues.push({ file: screenPath + ext, reason: "Does not import or call useTheme()" });
        }
        if (ext === ".desktop.tsx" || ext === ".web.tsx") {
          const hasMaxWidth = content.includes("maxWidth") || content.includes("440") || content.includes("1200");
          maxWidthChecks.push({ file: screenPath + ext, hasMaxWidth });
        }
      }
    }
  }
}

console.log(`Verified ${screens.length} screen features (${screens.length * 4} expected variant files).`);
console.log(`Missing files: ${missingFiles.length}`);
if (missingFiles.length > 0) console.log(JSON.stringify(missingFiles, null, 2));

console.log(`Master selector issues: ${masterSelectorIssues.length}`);
if (masterSelectorIssues.length > 0) console.log(JSON.stringify(masterSelectorIssues, null, 2));

console.log(`Variant theme usage issues: ${themeUsageIssues.length}`);
if (themeUsageIssues.length > 0) console.log(JSON.stringify(themeUsageIssues, null, 2));

console.log(`Desktop/Web maxWidth checks: ${maxWidthChecks.filter(m => m.hasMaxWidth).length} / ${maxWidthChecks.length} pass`);
