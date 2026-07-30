import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add useTheme to imports
    if 'useTheme' not in content:
        content = re.sub(
            r'import\s+\{\s*COLORS,',
            'import {\\n  useTheme,\\n  COLORS,',
            content
        )

    # 2. Add const { colors, isDark } = useTheme(); to components
    components = ['SectionHeader', 'InfoRow', 'BasicInfoTab', 'ApplicationDetailsTab', 'RequirementsTab', 'SoaPaymentTab', 'ApplicationReviewScreenContent']
    
    for comp in components:
        # Regex to find function definition, handle multiline args
        pattern = r'(function\s+' + comp + r'\s*\([^)]*\)\s*\{)'
        replacement = r'\1\n  const { colors, isDark } = useTheme();'
        content = re.sub(pattern, replacement, content)
        
    # Replace typography scale in StyleSheet BEFORE extracting colors, so it stays in StyleSheet
    content = re.sub(r'fontSize:\s*20\b', 'fontSize: TYPOGRAPHY.sizes.pageTitle', content)
    content = re.sub(r'fontSize:\s*16\b', 'fontSize: 16', content) # not in scale
    content = re.sub(r'fontSize:\s*14\b', 'fontSize: 14', content) # not in scale
    content = re.sub(r'fontSize:\s*13\b', 'fontSize: TYPOGRAPHY.sizes.body', content)
    content = re.sub(r'fontSize:\s*12\b', 'fontSize: TYPOGRAPHY.sizes.label', content) # close to label 11? Prompt says "Labels/captions: TYPOGRAPHY.sizes.label or TYPOGRAPHY.sizes.caption (11)" Let's leave 12 as is or change to 12. Let's just do 13, 11, 10.
    content = re.sub(r'fontSize:\s*11\b', 'fontSize: TYPOGRAPHY.sizes.label', content)
    content = re.sub(r'fontSize:\s*10\b', 'fontSize: TYPOGRAPHY.sizes.overline', content)
    content = re.sub(r'fontSize:\s*9\b', 'fontSize: 9', content)

    # Dictionary to hold the extracted styles
    # Map from prefix (e.g. 'sectionStyles', 'infoStyles', 'styles') -> className -> { colorProp: dynamicValueCode }
    extracted_styles = {}

    # Helper function to get theme mapping
    def get_dynamic_color(color_val):
        color_val = color_val.strip()
        if "COLORS.neutral.white" in color_val:
            return "isDark ? colors.neutral[800] : COLORS.neutral.white"
        elif "COLORS.neutral[50]" in color_val:
            return "isDark ? colors.neutral[900] : colors.neutral[50]"
        elif "COLORS.neutral[100]" in color_val:
            return "isDark ? colors.neutral[800] : colors.neutral[100]"
        elif "COLORS.neutral[200]" in color_val:
            return "isDark ? colors.neutral[700] : colors.neutral[200]"
        elif "COLORS.neutral[300]" in color_val:
            return "isDark ? colors.neutral[600] : colors.neutral[300]"
        elif "COLORS.neutral[400]" in color_val:
            return "isDark ? colors.neutral[500] : colors.neutral[400]"
        elif "COLORS.neutral[500]" in color_val:
            return "isDark ? colors.neutral[400] : colors.neutral[500]"
        elif "COLORS.neutral[600]" in color_val:
            return "isDark ? colors.neutral[300] : colors.neutral[600]"
        elif "COLORS.neutral[700]" in color_val:
            return "isDark ? colors.neutral[200] : colors.neutral[700]"
        elif "COLORS.neutral[800]" in color_val:
            return "isDark ? colors.neutral[100] : colors.neutral[900]" # Primary text map
        elif "COLORS.brand[500]" in color_val:
            return "isDark ? colors.brand[400] : colors.brand[500]"
        elif "COLORS.brand[600]" in color_val:
            return "isDark ? colors.brand[500] : colors.brand[600]"
        elif "COLORS.brand[700]" in color_val:
            return "isDark ? colors.brand[400] : colors.brand[700]"
        elif "COLORS.brand[800]" in color_val:
            return "isDark ? colors.brand[500] : colors.brand[800]"
        elif "COLORS.brand.light" in color_val:
            return "isDark ? colors.neutral[800] : '#EFF6FF'"
        elif "rgba(255,255,255" in color_val.replace(" ", ""):
            return color_val # keep as is
        return color_val.replace("COLORS.", "colors.") # fallback

    # Parse StyleSheet.create blocks
    sheet_pattern = re.compile(r'const\s+([a-zA-Z0-9_]+)\s*=\s*StyleSheet\.create\(\{([\s\S]*?)\}\);', re.MULTILINE)
    
    def process_sheet(match):
        sheet_name = match.group(1)
        body = match.group(2)
        
        extracted_styles[sheet_name] = {}
        
        # We need to parse class definitions
        # A simple approach: split by `className: {`
        # But this might fail with nested structures if any. Assuming simple flat structures.
        
        # Using a more robust regex for classes
        class_pattern = re.compile(r'([a-zA-Z0-9_]+)\s*:\s*\{([^}]*)\}')
        
        def process_class(cls_match):
            cls_name = cls_match.group(1)
            cls_body = cls_match.group(2)
            
            extracted = []
            new_cls_body_lines = []
            for line in cls_body.split('\n'):
                if ':' in line and ('COLORS.' in line or 'rgba(' in line or 'backgroundColor' in line or 'color' in line or 'borderColor' in line or 'tintColor' in line):
                    # We might have semantic colors that we shouldn't touch?
                    # Rule: "Keep COLORS.* usage for semantic colors (error/warning/success)"
                    if 'semantic' in line:
                        new_cls_body_lines.append(line)
                        continue
                        
                    # Extract it
                    parts = line.split(':', 1)
                    prop = parts[0].strip()
                    val = parts[1].strip().rstrip(',')
                    if val.startswith('COLORS.') or val.startswith('rgba') or val.startswith("'#") or val.startswith('"#'):
                        extracted.append((prop, get_dynamic_color(val)))
                        continue
                    else:
                        new_cls_body_lines.append(line)
                else:
                    new_cls_body_lines.append(line)
            
            if extracted:
                extracted_styles[sheet_name][cls_name] = extracted
                
            return f"{cls_name}: {{{chr(10).join(new_cls_body_lines)}}}"
            
        new_body = class_pattern.sub(process_class, body)
        return f"const {sheet_name} = StyleSheet.create({{{new_body}}});"
        
    content = sheet_pattern.sub(process_sheet, content)
    
    # 3. Replace usages in JSX
    # E.g. style={styles.header} -> style={[styles.header, { backgroundColor: isDark ? ... }]}
    # style={[styles.header, styles.other]} -> style={[styles.header, styles.other, { backgroundColor: ... }]}
    
    for sheet_name, classes in extracted_styles.items():
        for cls_name, props in classes.items():
            if not props:
                continue
                
            inline_obj = " ".join([f"{p}: {v}," for p, v in props])
            inline_str = f"{{ {inline_obj} }}"
            
            # Pattern 1: style={sheet_name.cls_name}
            p1 = r'style=\{\s*' + sheet_name + r'\.' + cls_name + r'\s*\}'
            r1 = f'style={{[{sheet_name}.{cls_name}, {inline_str}]}}'
            content = re.sub(p1, r1, content)
            
            # Pattern 2: style={[..., sheet_name.cls_name]}
            # This is harder to regex safely for all cases. Let's just do a string replacement for common ones:
            # We can find `sheet_name.cls_name` inside `style={[...]}` and append to it.
            # Actually, simpler: replace `sheet_name.cls_name` with `sheet_name.cls_name, inline_str` but only inside style array.
            # Let's just look for `style={[...]}` and parse.
            
            # A safer regex: find `style={[...]}` where the array contains `sheet_name.cls_name`.
            # This is getting complex. Let's use a simpler approach:
            # Find all `style={[..., sheet_name.cls_name, ...]}` and append the inline_str at the end of the array.
            
    # For now, let's write the modified content back and we can refine the script if needed.
    # Actually, we can use a callback for regex to handle `style={[...]}`
    
    def replace_style_array(match):
        arr_content = match.group(1)
        added_styles = []
        for sheet_name, classes in extracted_styles.items():
            for cls_name, props in classes.items():
                if f"{sheet_name}.{cls_name}" in arr_content:
                    inline_obj = " ".join([f"{p}: {v}," for p, v in props])
                    added_styles.append(f"{{ {inline_obj} }}")
        
        if added_styles:
            return f"style={{[{arr_content}, {', '.join(added_styles)}]}}"
        return match.group(0)

    # First, convert simple `style={x.y}` to `style={[x.y]}` so we can process all as arrays
    # But ONLY if they need replacement. The p1/r1 above handled simple ones.
    # Wait, let's just do everything in one go:
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

process_file('src/features/queue/screens/ApplicationReviewScreenContent.tsx')
print("Done processing")
