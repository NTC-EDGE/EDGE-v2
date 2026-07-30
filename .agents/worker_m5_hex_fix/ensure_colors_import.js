const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Check if COLORS is referenced as an identifier in the file
  if (/\bCOLORS\b/.test(content)) {
    // Check if COLORS is already imported
    const hasImportedColors = /import\s*\{[^}]*\bCOLORS\b[^}]*\}\s*from\s*['"]@edge\/ui['"]/.test(content);
    if (!hasImportedColors) {
      if (/from\s*['"]@edge\/ui['"]/.test(content)) {
        // Add COLORS to the first @edge/ui import statement
        content = content.replace(/(import\s*\{)([^}]*)(\}\s*from\s*['"]@edge\/ui['"])/, (match, p1, p2, p3) => {
          const imports = p2.split(',').map(s => s.trim()).filter(Boolean);
          if (!imports.includes('COLORS')) {
            imports.unshift('COLORS');
          }
          return `${p1} ${imports.join(', ')} ${p3}`;
        });
      } else {
        content = `import { COLORS } from '@edge/ui';\n` + content;
      }
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated imports in:', path.relative(process.cwd(), filePath));
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walkDir(full);
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      processFile(full);
    }
  }
}

walkDir(path.resolve('apps/frontend/internal/src'));
