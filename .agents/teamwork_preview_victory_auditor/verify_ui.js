const fs = require("fs");
const path = require("path");

const uiDir = "c:/Users/User/projects/ustp/NTC-EDGE/packages/ui";
const indexPath = path.join(uiDir, "index.ts");
const indexContent = fs.readFileSync(indexPath, "utf8");

const requiredComponents = [
  // Existing 7
  "Button",
  "FormFieldInput",
  "AlertToast",
  "Avatar",
  "DataTable",
  "StatusBadge",
  "ServiceFormModal",
  // New 6
  "SkeletonLoader",
  "AnimatedCard",
  "ThemeToggle",
  "PageHeader",
  "EmptyState",
  "SearchBar"
];

let exportFailures = [];
let themeFailures = [];

for (const comp of requiredComponents) {
  if (!indexContent.includes(comp)) {
    exportFailures.push(comp);
  }
}

// Find component file paths
function findComponentFile(compName) {
  const possiblePaths = [
    path.join(uiDir, "components", `${compName}.tsx`),
    path.join(uiDir, "client", `${compName}.tsx`),
    path.join(uiDir, "theme", `${compName}.tsx`)
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

for (const comp of requiredComponents) {
  const file = findComponentFile(comp);
  if (!file) {
    themeFailures.push({ comp, reason: "File not found on disk" });
  } else {
    const code = fs.readFileSync(file, "utf8");
    if (!code.includes("useTheme")) {
      themeFailures.push({ comp, file: path.relative(uiDir, file), reason: "Does not consume useTheme()" });
    }
  }
}

console.log(`Verified ${requiredComponents.length} shared components.`);
console.log(`Export failures in index.ts: ${exportFailures.length}`);
if (exportFailures.length > 0) console.log(JSON.stringify(exportFailures, null, 2));

console.log(`Theme integration failures: ${themeFailures.length}`);
if (themeFailures.length > 0) console.log(JSON.stringify(themeFailures, null, 2));
