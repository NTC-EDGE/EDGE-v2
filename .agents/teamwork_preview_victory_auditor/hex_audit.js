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

const HEX_REGEX = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;
const RGB_REGEX = /\brgba?\([^)]+\)/g;

let totalFiles = 0;
let hexViolations = [];

for (const dir of targetDirs) {
  const files = getAllFiles(dir);
  
  for (const file of files) {
    const relPath = path.relative("c:/Users/User/projects/ustp/NTC-EDGE", file);
    // Ignore tokens.ts as it is the canonical definition of theme tokens
    if (relPath.replace(/\\/g, "/").endsWith("packages/ui/theme/tokens.ts")) {
      continue;
    }
    
    totalFiles++;
    const code = fs.readFileSync(file, "utf8");
    const lines = code.split("\n");
    
    lines.forEach((line, idx) => {
      // Check for hex matches
      const hexMatches = line.match(HEX_REGEX);
      if (hexMatches) {
        hexViolations.push({
          file: relPath,
          line: idx + 1,
          matches: hexMatches,
          lineContent: line.trim()
        });
      }
      
      // Check for rgb matches
      const rgbMatches = line.match(RGB_REGEX);
      if (rgbMatches) {
        hexViolations.push({
          file: relPath,
          line: idx + 1,
          matches: rgbMatches,
          lineContent: line.trim()
        });
      }
    });
  }
}

console.log(`Scanned ${totalFiles} component/screen files (excluding tokens.ts).`);
console.log(`Hardcoded hex/rgb color violations: ${hexViolations.length}`);

if (hexViolations.length > 0) {
  console.log(JSON.stringify(hexViolations, null, 2));
} else {
  console.log("\n--- ZERO HARDCODED HEX/RGB COLORS FOUND OUTSIDE TOKENS.TS ---");
}
