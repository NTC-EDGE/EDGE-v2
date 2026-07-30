# Handoff Report: Shell & App Chrome Redesign R5 Exploration

**Explorer**: Explorer 1 (Milestone 2)  
**Target Module**: `apps/frontend/internal/src/features/shell/components/` & `packages/ui/`  
**Parent Agent**: `sub_orch_m2` (`63b9013e-2d7a-4b5f-9fbc-6321bf9a22ce`)  
**Status**: Hard Handoff (Investigation Complete)  

---

## 1. Observation

### 1.1 Source Locations & File Paths
- **Shell Component Directory**: `apps/frontend/internal/src/features/shell/components/`
- **Shell Components Inspected**:
  - `AppLayout.tsx` (Lines 1-24) — Master platform router (`web`, `desktop`, `native`).
  - `AppLayout.desktop.tsx` (Lines 1-180) — Desktop workstation view with custom title bar (`#0B132B`) and status bar (`#0F172A`).
  - `AppLayout.web.tsx` (Lines 1-99) — Standard web container view with responsive `useWindowDimensions()` check (`width < 768`).
  - `AppLayout.native.tsx` (Lines 1-189) — Mobile view with animated slide-in drawer sidebar and fixed bottom tab bar.
  - `Sidebar.tsx` (Lines 1-242) — Left navigation bar with header, navigation scroll view, and footer role controls. Hardcodes static white background (`COLORS.neutral.white` at line 129).
  - `SidebarNavItem.tsx` (Lines 1-117) — Navigation link items. Hardcodes static hover (`COLORS.neutral[100]` at line 80) and active colors (`COLORS.brand[700]` at line 73).
  - `MobileBottomTabBar.tsx` (Lines 1-101) — Bottom navigation tabs. Hardcodes static background (`COLORS.neutral.white` at line 64) and active brand blue (`COLORS.brand[800]` at line 40). Note: Line 8 uses unsafe `icon: any`.
  - `StandardPageWrapper.tsx` (Lines 1-55) — Scrollable content wrapper with `maxWidth: 1600` and mount transition. Missing explicit canvas background paint.
  - `Header.tsx` (Lines 1-405) — Top bar with linear gradient background on web, bell button, profile dropdown menu.
  - `RoleSwitcher.tsx` (Lines 1-249) — Dropdown for switching user roles.

- **Theme Package Exports (`packages/ui/`)**:
  - `packages/ui/index.ts` (Lines 8-9, 23) — Exports `ThemeProvider`, `ThemeContext`, `useTheme`, `ThemeToggle`.
  - `packages/ui/theme/tokens.ts` (Lines 3-107) — Defines `LIGHT_COLORS` (`bg: '#F8FAFC'`, `cardBg: '#FFFFFF'`, `text: '#0F172A'`, `border: '#E2E8F0'`) and `DARK_COLORS` (`bg: '#0F172A'`, `cardBg: '#1E293B'`, `text: '#F8FAFC'`, `border: '#334155'`).
  - `packages/ui/theme/useTheme.ts` (Lines 13-19) — Returns `ThemeContextValue` containing `{ mode, setMode, colors, isDark }`.
  - `packages/ui/components/ThemeToggle.tsx` (Lines 8-151) — Supports `variant="segmented"` (3 options: Light, Dark, System) and `variant="icon"` (cycles mode), in `size="sm"` or `size="md"`.

---

## 2. Logic Chain

1. **Premise**: Shell components in `apps/frontend/internal/src/features/shell/components/` currently import static color tokens `COLORS` from `@edge/ui`.
2. **Analysis**: Static `COLORS` defaults exclusively to `LIGHT_COLORS`. Consequently, when dark mode is toggled via `useTheme()`, shell surfaces (`Sidebar`, `MobileBottomTabBar`, `StandardPageWrapper`) remain white or light slate, breaking visual dark mode continuity.
3. **Deduction for `Sidebar`**: Replacing static `COLORS` with dynamic `colors` from `useTheme()` allows `Sidebar` to adapt its surface background to `isDark ? colors.neutral[900] : colors.cardBg` (or `colors.cardBg` `#1E293B` in dark mode) and borders to `colors.border` (`#334155` in dark mode).
4. **Deduction for `MobileBottomTabBar`**: Using `useTheme()` updates the tab bar background to `isDark ? colors.neutral[900] : colors.cardBg`, borders to `colors.border`, active text/icon to `isDark ? colors.brand[500] : colors.brand[800]`, and active pill background to `isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(37, 99, 235, 0.1)'`.
5. **Deduction for `StandardPageWrapper`**: Adding `backgroundColor: colors.bg` to `contentScrollView` guarantees full canvas paint for all screens (`#F8FAFC` in light mode, `#0F172A` in dark mode).
6. **Deduction for `ThemeToggle` Integration**:
   - `Sidebar.tsx` footer can render `<ThemeToggle variant="segmented" size="sm" style={{ width: '100%' }} />` to give users persistent access to theme mode toggling.
   - `AppLayout.desktop.tsx` (or `Header.tsx`) can embed `<ThemeToggle variant="icon" size="sm" />` in top controls or status bar for immediate desktop workstation mode toggling.
7. **Compliance Deduction**: `MobileBottomTabBar.tsx` line 8 contains `icon: any`. Refactoring `icon` type to `keyof typeof Lucide.glyphMap` fulfills the strict workspace requirement of 0 `any`, 0 `as`, 0 `!`.

---

## 3. Caveats

- **Web Header Gradient**: `Header.tsx` currently applies a static web background linear gradient (`linear-gradient(to right, #0E1B61 0%, #1839B3 50%, #2B56F0 100%)`). Implementers should decide whether to keep the executive navy header uniform across themes or provide a subtle dark mode variant.
- **Desktop Title Bar Theme Sync**: In `AppLayout.desktop.tsx`, the title bar (`#0B132B`) and status bar (`#0F172A`) can either remain dark workstation chrome or adapt dynamically using `isDark ? colors.neutral[900] : '#0B132B'`.
- **Read-Only Scope**: No source files in `apps/` or `packages/` were modified during this exploration step.

---

## 4. Conclusion

The existing shell structure in `apps/frontend/internal/src/features/shell/components/` is fully modular and ready for redesign. By replacing static `COLORS` references with `const { colors, isDark } = useTheme()` across `Sidebar.tsx`, `SidebarNavItem.tsx`, `MobileBottomTabBar.tsx`, `StandardPageWrapper.tsx`, `AppLayout.desktop.tsx`, `AppLayout.web.tsx`, and `AppLayout.native.tsx`, the shell will achieve full dark/light mode surface token compliance. Integrating `ThemeToggle` from `@edge/ui` into `Sidebar.tsx` and `AppLayout.desktop.tsx` / `Header.tsx` completes the Milestone 2 App Chrome requirements.

Detailed analysis and implementation specifications are recorded in `.agents/explorer_m2_1/analysis.md`.

---

## 5. Verification Method

1. **Inspect Analysis File**:
   - Read `c:\Users\User\projects\ustp\NTC-EDGE\.agents\explorer_m2_1\analysis.md`.
2. **Type Check Verification (for Implementer)**:
   - Run command in terminal: `npx tsc --noEmit` from directory `apps/frontend/internal`.
3. **Visual Invalidation Conditions**:
   - Invalidation occurs if `Sidebar`, `MobileBottomTabBar`, or `StandardPageWrapper` retain hardcoded hex colors or if `ThemeToggle` fails to switch context `isDark` state.
