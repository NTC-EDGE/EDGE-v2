const fs = require('fs');
const path = require('path');

const HEX_MAP = {
  '#FFFFFF': 'COLORS.neutral.white',
  '#000000': 'COLORS.neutral.black',
  '#000': 'COLORS.neutral.black',
  '#F8FAFC': 'COLORS.neutral[50]',
  '#F1F5F9': 'COLORS.neutral[100]',
  '#E2E8F0': 'COLORS.neutral[200]',
  '#CBD5E1': 'COLORS.neutral[300]',
  '#94A3B8': 'COLORS.neutral[400]',
  '#64748B': 'COLORS.neutral[500]',
  '#475569': 'COLORS.neutral[600]',
  '#334155': 'COLORS.neutral[700]',
  '#1E293B': 'COLORS.neutral[800]',
  '#0F172A': 'COLORS.neutral[900]',
  '#0B132B': 'COLORS.brand.navyDark',
  '#0B1953': 'COLORS.brand.dark',
  '#1E3A8A': 'COLORS.brand.primary',
  '#2563EB': 'COLORS.brand.secondary',
  '#3B82F6': 'COLORS.brand.accent',
  '#60A5FA': 'COLORS.brand.focus',
  '#EFF6FF': 'COLORS.brand.light',
  '#93C5FD': 'COLORS.brand.blueSoft',
  '#BFDBFE': 'COLORS.brand.blueSoft',
  '#DBEAFE': 'COLORS.brand.blueLight',
  '#1D4ED8': 'COLORS.brand.royalBlue',
  '#1E40AF': 'COLORS.brand.deepBlue',
  '#2B56F0': 'COLORS.brand.brightBlue',
  '#1839B3': 'COLORS.brand.secondary',
  '#0E1B61': 'COLORS.brand.navyGradient',
  '#4F46E5': 'COLORS.brand.indigo',
  '#6366F1': 'COLORS.brand.indigoHover',
  '#818CF8': 'COLORS.brand.indigo400',
  '#EEF2FF': 'COLORS.brand.indigoLight',
  '#E0E7FF': 'COLORS.brand.indigoBorder',
  '#4338CA': 'COLORS.brand.indigo',
  '#7C3AED': 'COLORS.brand.purple',
  '#9333EA': 'COLORS.brand.purpleDark',
  '#F3E8FF': 'COLORS.brand.purpleLight',
  '#8B5CF6': 'COLORS.brand.purple',
  '#0284C7': 'COLORS.brand.sky',
  '#0369A1': 'COLORS.brand.sky',
  '#E0F2FE': 'COLORS.brand.skyLight',
  '#DB2777': 'COLORS.brand.pink',
  '#BE185D': 'COLORS.brand.roseDark',
  '#10B981': 'COLORS.semantic.success',
  '#ECFDF5': 'COLORS.semantic.successBg',
  '#A7F3D0': 'COLORS.semantic.successBorder',
  '#065F46': 'COLORS.semantic.successText',
  '#059669': 'COLORS.semantic.success',
  '#16A34A': 'COLORS.semantic.success',
  '#F0FDF4': 'COLORS.semantic.successBg',
  '#DCFCE7': 'COLORS.semantic.successBg',
  '#00E676': 'COLORS.brand.greenBright',
  '#F59E0B': 'COLORS.semantic.warning',
  '#FEF3C7': 'COLORS.semantic.warningBg',
  '#FDE68A': 'COLORS.semantic.warningBorder',
  '#92400E': 'COLORS.semantic.warningText',
  '#D97706': 'COLORS.semantic.warningText',
  '#FEF9C3': 'COLORS.brand.yellowLight',
  '#EF4444': 'COLORS.semantic.error',
  '#FEF2F2': 'COLORS.semantic.errorBg',
  '#FCA5A5': 'COLORS.semantic.errorBorder',
  '#991B1B': 'COLORS.semantic.errorText',
  '#DC2626': 'COLORS.brand.redDark',
  '#FEE2E2': 'COLORS.brand.redLight',
  '#E11D48': 'COLORS.brand.rose',
  '#EA4335': 'COLORS.semantic.error',
  '#06B6D4': 'COLORS.semantic.info',
  '#ECFEFF': 'COLORS.semantic.infoBg',
  '#A5F3FC': 'COLORS.semantic.infoBorder',
  '#155E75': 'COLORS.semantic.infoText',
  '#0D9488': 'COLORS.brand.teal',
  '#0F2042': 'COLORS.brand.navy',
};

const UPPER_MAP = {};
for (const [k, v] of Object.entries(HEX_MAP)) {
  UPPER_MAP[k.toUpperCase()] = v;
}

function getReplacement(hex) {
  const upper = hex.toUpperCase();
  return UPPER_MAP[upper] || null;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1. Special case for linear-gradient in Header.tsx
  content = content.replace(
    /"linear-gradient\(to right, #0E1B61 0%, #1839B3 50%, #2B56F0 100%\)"/g,
    '`linear-gradient(to right, ${COLORS.brand.navyGradient} 0%, ${COLORS.brand.secondary} 50%, ${COLORS.brand.brightBlue} 100%)`'
  );

  // 2. JSX attribute replacement: attr="#HEX" or attr='#HEX' -> attr={MAP[HEX]}
  content = content.replace(/([a-zA-Z0-9_]+)=["'](#[0-9a-fA-F]{3,8})\b["']/g, (match, attrName, hex) => {
    const repl = getReplacement(hex);
    if (repl) {
      return `${attrName}={${repl}}`;
    }
    return match;
  });

  // 3. String literal replacement: '#HEX' or "#HEX" -> MAP[HEX]
  content = content.replace(/["'](#[0-9a-fA-F]{3,8})\b["']/g, (match, hex) => {
    const repl = getReplacement(hex);
    if (repl) {
      return repl;
    }
    return match;
  });

  if (content !== original) {
    // Check if COLORS is referenced and update/add imports
    if (content.includes('COLORS')) {
      if (content.includes("from '@edge/ui'")) {
        content = content.replace(/import\s*\{([^}]+)\}\s*from\s*['"]@edge\/ui['"];/, (m, p1) => {
          if (p1.includes('COLORS')) return m;
          const tokens = p1.split(',').map(s => s.trim()).filter(Boolean);
          tokens.unshift('COLORS');
          return `import { ${tokens.join(', ')} } from '@edge/ui';`;
        });
      } else {
        content = `import { COLORS } from '@edge/ui';\n` + content;
      }
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Processed:', path.relative(process.cwd(), filePath));
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walkDir(full);
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      const text = fs.readFileSync(full, 'utf8');
      if (/#([0-9a-fA-F]{3,8})\b/.test(text)) {
        processFile(full);
      }
    }
  }
}

const targetDir = path.resolve('apps/frontend/internal/src');
console.log('Scanning and refactoring directory:', targetDir);
walkDir(targetDir);
console.log('Refactoring complete.');
