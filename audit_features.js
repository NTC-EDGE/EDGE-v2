const fs = require('fs');
const path = require('path');

const featuresDir = path.resolve('apps/frontend/internal/src/features');

// Find all screen files
function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const allFiles = getFiles(featuresDir);
const screenFiles = allFiles.filter(f => f.match(/Screen(\.(native|web|desktop))?\.tsx$/));

console.log(`Found ${screenFiles.length} total screen files.`);

// Group files by Screen base name
// e.g. AnnouncementsScreen -> [.desktop.tsx, .native.tsx, .tsx, .web.tsx]
const screenGroups = {};

screenFiles.forEach(file => {
  const relPath = path.relative(featuresDir, file);
  const baseNameMatch = path.basename(file).match(/^([A-Za-z0-9]+Screen)/);
  if (baseNameMatch) {
    const baseName = baseNameMatch[1];
    const dir = path.dirname(relPath);
    const key = `${dir}/${baseName}`;
    if (!screenGroups[key]) {
      screenGroups[key] = {
        dir,
        baseName,
        files: {}
      };
    }
    if (file.endsWith('.native.tsx')) screenGroups[key].files['native'] = file;
    else if (file.endsWith('.web.tsx')) screenGroups[key].files['web'] = file;
    else if (file.endsWith('.desktop.tsx')) screenGroups[key].files['desktop'] = file;
    else if (file.endsWith('.tsx') && !file.match(/\.(native|web|desktop)\.tsx$/)) screenGroups[key].files['master'] = file;
  }
});

console.log('\n--- SCREEN FAMILIES AUDIT ---');
const report = [];

for (const [key, group] of Object.entries(screenGroups)) {
  const hasNative = !!group.files['native'];
  const hasWeb = !!group.files['web'];
  const hasDesktop = !!group.files['desktop'];
  const hasMaster = !!group.files['master'];

  const isComplete = hasNative && hasWeb && hasDesktop && hasMaster;
  
  const familyResult = {
    key,
    baseName: group.baseName,
    dir: group.dir,
    completeness: {
      hasNative,
      hasWeb,
      hasDesktop,
      hasMaster,
      isComplete
    },
    filesAudit: {}
  };

  // Inspect each file in group for theme integration
  for (const [variant, filePath] of Object.entries(group.files)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check useTheme import and call
    const importsUseTheme = /import.*useTheme.*from\s+['"]@edge\/ui['"]/.test(content) || /import.*useTheme/.test(content);
    const usesThemeHook = /useTheme\s*\(\s*\)/.test(content);

    // Check dynamic color usage
    const usesThemeColors = /theme\.colors|colors\./.test(content);
    const usesBackgroundToken = /theme\.colors\.(background|surface|card)|colors\.(background|surface|card)/.test(content);
    const usesCardToken = /theme\.colors\.(card|surface)|colors\.(card|surface)/.test(content);
    const usesTextToken = /theme\.colors\.(text|primary|textMuted|subtext|foreground)|colors\.(text|primary|textMuted|subtext|foreground)/.test(content);
    const usesBorderToken = /theme\.colors\.(border|divider|outline)|colors\.(border|divider|outline)/.test(content);

    // Check hardcoded hex colors
    const hexColors = content.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/g) || [];
    // filter common transparent or standard hexes if any, or report all
    const uniqueHexes = [...new Set(hexColors)];

    // Check master selector delegation logic if master file
    let selectorDelegates = null;
    if (variant === 'master') {
      selectorDelegates = /Platform\.OS|useWindowDimensions|Screen\.web|Screen\.native|Screen\.desktop/.test(content);
    }

    familyResult.filesAudit[variant] = {
      filePath: path.relative(featuresDir, filePath),
      importsUseTheme,
      usesThemeHook,
      usesThemeColors,
      tokenCoverage: {
        background: usesBackgroundToken,
        card: usesCardToken,
        text: usesTextToken,
        border: usesBorderToken
      },
      hardcodedHexes: uniqueHexes,
      selectorDelegates
    };
  }

  report.push(familyResult);
}

fs.writeFileSync('audit_results.json', JSON.stringify(report, null, 2));
console.log(`Audit report generated with ${report.length} screen families.`);
