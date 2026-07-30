const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Check if first line is import { COLORS } from '@edge/ui';
  if (lines[0].trim() === "import { COLORS } from '@edge/ui';") {
    const rest = lines.slice(1).join('\n');
    if (rest.includes("from '@edge/ui'") || rest.includes('from "@edge/ui"')) {
      fs.writeFileSync(filePath, rest, 'utf8');
      console.log('Fixed duplicate import in:', path.relative(process.cwd(), filePath));
    }
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walkDir(full);
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      fixFile(full);
    }
  }
}

walkDir(path.resolve('apps/frontend/internal/src'));
