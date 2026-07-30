# Exploration Analysis: Milestone 2 — Shell & App Chrome Redesign (R5)

## 1. Executive Summary

This report delivers a complete analysis of the existing shell components in `apps/frontend/internal/src/features/shell/components/` and the theme system exported by `packages/ui/`. It identifies the exact surface tokens required to transition `Sidebar`, `MobileBottomTabBar`, `StandardPageWrapper`, and the platform layout variants (`AppLayout.desktop.tsx`, `AppLayout.web.tsx`, `AppLayout.native.tsx`) into theme-aware dark/light components using `useTheme()`, and details the integration of `ThemeToggle` from `@edge/ui`.

---

## 2. Directory Structure & File Map

Note on path location: The shell components are located under `apps/frontend/internal/src/features/shell/components/` (aliased or re-exported as needed).

| Component File | Role / Responsibility | Key Imports & Dependencies |
| --- | --- | --- |
| `AppLayout.tsx` | Master selector component using `Platform.OS` routing | `Platform`, `./AppLayout.web`, `./AppLayout.native`, `./AppLayout.desktop` |
| `AppLayout.desktop.tsx` | Desktop wide workstation view (title bar, header, sidebar, status bar) | `@edge/ui` (`COLORS`, `TYPOGRAPHY`, `Icon`), `useShellState`, `Sidebar`, `Header` |
| `AppLayout.web.tsx` | Standard web browser layout (header, sidebar, main content) | `@edge/ui` (`COLORS`), `useWindowDimensions`, `Sidebar`, `Header` |
| `AppLayout.native.tsx` | Mobile viewports (header, animated drawer sidebar, bottom tab bar) | `@edge/ui` (`COLORS`), `Animated`, `Sidebar`, `Header`, `MobileBottomTabBar` |
| `Sidebar.tsx` | Left menu container with nav links & footer controls | `@edge/ui` (`COLORS`, `SPACING`, `RADIUS`, `TYPOGRAPHY`, `Icon`), `SidebarNavItem`, `RoleSwitcher` |
| `SidebarNavItem.tsx` | Individual nav link item with hover & active states | `@edge/ui` (`COLORS`, `SPACING`, `TYPOGRAPHY`, `Icon`) |
| `MobileBottomTabBar.tsx` | Mobile bottom navigation bar for primary tabs | `@edge/ui` (`COLORS`, `TYPOGRAPHY`, `Icon`) |
| `StandardPageWrapper.tsx` | Standard page container with scroll & mount transition | `@edge/ui` (`SPACING`), `TransitionWrapper` |
| `TransitionWrapper.tsx` | Mount/screen change fade-in animation wrapper | `Animated`, `Easing`, `Platform` |
| `Header.tsx` | Top header bar with branding, bell, profile dropdown | `@edge/ui` (`COLORS`, `SPACING`, `RADIUS`, `TYPOGRAPHY`, `Icon`, `SHADOWS`), `RoleSwitcher`, `EditAccountModal` |
| `RoleSwitcher.tsx` | Dropdown control for switching active user role | `@edge/ui` (`COLORS`, `SPACING`, `RADIUS`, `SHADOWS`, `TYPOGRAPHY`, `Icon`), `ROLES` |

---

## 3. UI Theme System Infrastructure (`packages/ui`)

### 3.1 `useTheme()` Hook & Context Structure
Exported directly from `packages/ui` (`packages/ui/index.ts` line 9):
```typescript
import { useTheme } from '@edge/ui';
```
Contract (`packages/ui/theme/types.ts` lines 69-74):
```typescript
export interface ThemeContextValue {
  mode: ThemeMode; // 'light' | 'dark' | 'system'
  setMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
  isDark: boolean;
}
```

### 3.2 Theme Color Tokens (`packages/ui/theme/tokens.ts`)
| Token Category | Token Name | Light Mode Value | Dark Mode Value | Recommended Application |
| --- | --- | --- | --- | --- |
| Surface Canvas | `colors.bg` | `#F8FAFC` (Slate 50) | `#0F172A` (Slate 900) | Root app shell, `StandardPageWrapper` background |
| Card / Container Surface | `colors.cardBg` | `#FFFFFF` (Pure white) | `#1E293B` (Slate 800) | Sidebar surface, cards, dropdown menus |
| Primary Text | `colors.text` | `#0F172A` (Slate 900) | `#F8FAFC` (Slate 50) | Titles, active text, headers |
| Muted Text | `colors.textMuted` | `#64748B` (Slate 500) | `#94A3B8` (Slate 400) | Subtitles, labels, inactive item text |
| Border | `colors.border` | `#E2E8F0` (Slate 200) | `#334155` (Slate 700) | Sidebar border, header bottom border, dividers |
| Neutral Slate 800 | `colors.neutral[800]` | `#1E293B` | `#1E293B` | Dark mode footer background, dark toggles |
| Neutral Slate 900 | `colors.neutral[900]` | `#0F172A` | `#0F172A` | Dark sidebar canvas, dark tab bar background |
| Brand Active | `colors.brand[800]` / `[700]` | `#1E3A8A` / `#2563EB` | `#2563EB` / `#3B82F6` | Active state highlights, active tab colors |
| Brand Light Focus | `colors.brand.primary` / `[500]` | `#1E3A8A` | `#60A5FA` | Accent text/icons on dark surfaces |

### 3.3 `ThemeToggle` Component API (`packages/ui/components/ThemeToggle.tsx`)
```typescript
export type ThemeToggleVariant = 'segmented' | 'icon';
export type ThemeToggleSize = 'sm' | 'md';

export interface ThemeToggleProps {
  variant?: ThemeToggleVariant; // 'segmented' (default) | 'icon'
  size?: ThemeToggleSize;       // 'md' (default) | 'sm'
  style?: ViewStyle;
}
```
- `variant="segmented"`: Shows options for `Light`, `Dark`, `System`. Size `sm` renders icons only; size `md` renders icons + text labels.
- `variant="icon"`: Single pressable icon button cycling through `light` -> `dark` -> `system`.

---

## 4. Surface Token Application Recommendations

### 4.1 `Sidebar.tsx` & `SidebarNavItem.tsx`
Currently, `Sidebar.tsx` uses static `COLORS.neutral.white` (line 129) and `COLORS.neutral[200]` (lines 131, 147, 161, 185).

**Proposed Surface Token Mapping**:
1. **Container Background & Border**:
   - `backgroundColor`: `isDark ? colors.neutral[900] : colors.cardBg` (or `colors.cardBg`).
   - `borderRightColor`: `colors.border`.
2. **Mobile Drawer Header**:
   - `borderBottomColor`: `colors.border`.
   - Title (`logoTitle`): `colors.text`. Subtitle (`logoSubtitle`): `colors.textMuted`.
   - Close button (`closeBtn`): `backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50]`, `borderColor: colors.border`.
3. **Navigation Items (`SidebarNavItem.tsx`)**:
   - Active state (`navItemActive`): `backgroundColor: isDark ? colors.brand[800] : colors.brand[700]`, text/icon: `colors.neutral.white`.
   - Inactive state (`navItemInactive`): `backgroundColor: 'transparent'`, text/icon: `colors.textMuted`.
   - Hover state (`navItemHover`): `backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100]`, text/icon: `isDark ? colors.brand[500] : colors.brand[800]`.
4. **Footer Section**:
   - `backgroundColor`: `isDark ? colors.neutral[800] : colors.neutral[50]`.
   - `borderTopColor`: `colors.border`.
   - Labels (`roleLabel`): `colors.textMuted`.
   - Role value (`roleValue`): `isDark ? colors.brand[500] : colors.brand[800]`.

### 4.2 `MobileBottomTabBar.tsx`
Currently, `MobileBottomTabBar.tsx` uses static `COLORS.neutral.white` (line 64), `COLORS.neutral[200]` (line 66), `COLORS.brand[800]` (line 40), and `COLORS.neutral[500]` (line 40).

**Proposed Surface Token Mapping**:
1. **Tab Bar Container**:
   - `backgroundColor`: `isDark ? colors.neutral[900] : colors.cardBg`.
   - `borderTopColor`: `colors.border`.
2. **Tab Item Icons & Labels**:
   - Active text/icon: `isDark ? colors.brand[500] : colors.brand[800]`.
   - Active icon pill background (`iconContainerActive`): `isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(37, 99, 235, 0.1)'`.
   - Inactive text/icon: `colors.textMuted`.

### 4.3 `StandardPageWrapper.tsx`
Currently, `StandardPageWrapper.tsx` relies on parent layout background colors and does not set a explicit background on `contentScrollView`.

**Proposed Surface Token Mapping**:
1. **ScrollView Container**:
   - Add `backgroundColor: colors.bg` to `styles.contentScrollView`.
   - This ensures canvas background transitions smoothly between `#F8FAFC` (light) and `#0F172A` (dark) for all screen contents wrapped by `StandardPageWrapper`.

### 4.4 Layout Variants (`AppLayout.desktop.tsx`, `AppLayout.web.tsx`, `AppLayout.native.tsx`)
1. Root shell containers (`desktopShell`, `webShell`, `shell`): `backgroundColor: colors.bg`.
2. `AppLayout.desktop.tsx`:
   - `desktopTitleBar`: `backgroundColor: isDark ? colors.neutral[900] : '#0B132B'`.
   - `desktopStatusBar`: `backgroundColor: isDark ? colors.neutral[900] : '#0F172A'`, `borderTopColor: colors.border`, text: `colors.textMuted`.

---

## 5. ThemeToggle Integration Details

### 5.1 Integration in `Sidebar.tsx`
- **Target Section**: `sidebarFooter` (lines 80-121).
- **Component Choice**: `ThemeToggle` with `variant="segmented"` and `size="sm"` (desktop/web) or `size="md"` (mobile drawer).
- **Placement Concept**:
  Add a `Theme Preference` labeled block inside `sidebarFooter`:
  ```tsx
  <View style={styles.themeToggleWrapper}>
    <Text style={[styles.roleLabel, { color: colors.textMuted }]}>Theme</Text>
    <ThemeToggle variant="segmented" size="sm" style={{ width: '100%' }} />
  </View>
  ```

### 5.2 Integration in `AppLayout.desktop.tsx` & `Header.tsx`
- **Target Section**: Desktop Workstation Chrome (or Header top control bar).
- **Component Choice**: `ThemeToggle` with `variant="icon"` or `variant="segmented" size="sm"`.
- **Placement Concepts**:
  1. **Header Control Bar (`Header.tsx` line 90-95)**: Placed next to the Notification Bell button.
     ```tsx
     <ThemeToggle variant="icon" size="sm" />
     ```
  2. **Desktop Workstation Status Bar (`AppLayout.desktop.tsx` lines 95-98)**: Placed on the right side of status bar.
     ```tsx
     <View style={styles.statusRight}>
       <ThemeToggle variant="segmented" size="sm" />
       <LucideIcon name="activity" size={12} color="#10B981" />
       <Text style={styles.statusText}>API Latency: 24ms</Text>
     </View>
     ```

---

## 6. Strict Type Safety & Rule Compliance Summary

- **No Type Assertions (`0 as`)**: All theme dynamic styling will use standard objects or array syntax `[styles.base, { backgroundColor: colors.bg }]`.
- **No Non-Null Assertions (`0 !`)**: Explicit checks (`isDark !== false`, `user !== null`).
- **No `any` Types (`0 any`)**: Update `MobileBottomTabBar.tsx` line 8 `icon: any` to `icon: keyof typeof Lucide.glyphMap` or `string` for safe typing.
- **Web Responsive Constraints**: `StandardPageWrapper.tsx` preserves `maxWidth: 1600` and `alignSelf: 'center'`.
