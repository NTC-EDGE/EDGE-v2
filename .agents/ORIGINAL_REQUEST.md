# Original User Request

## Initial Request — 2026-07-29T13:42:51Z

Redesign all screens of the NTC-EDGE Internal Expo app with platform-specific variants (.native.tsx, .web.tsx, .desktop.tsx), implement a runtime ThemeProvider with dark/light/system mode, update all shared @edge/ui components for dark mode awareness, add new shared components, and create comprehensive design system documentation. Preserve all existing functionality — this is a visual-only redesign.

Working directory: c:\Users\User\projects\ustp\NTC-EDGE
Integrity mode: development

## Context

This is an Expo/React Native monorepo with 3 frontend apps (internal, client, admin) and shared packages (@edge/ui, @edge/api). The redesign targets **only the internal app** (`apps/frontend/internal/`). The shared design tokens and components live in `packages/ui/`.

### Current State
- **13 feature modules** in the internal app, but only 4 have platform-specific screen variants (Dashboard, Employees, Login, Users) plus Shell
- **No ThemeProvider** — theme tokens are static exports with no dark mode support
- **Static color usage** — many screens use hardcoded hex values instead of design tokens
- The app uses React Navigation 8 with static navigation, Clerk for auth, and a role-based permission system

### Existing Platform Variant Pattern
Every screen with platform variants follows this convention:
- `[Screen].tsx` — Master selector using `Platform.OS` to route to the correct variant
- `[Screen].native.tsx` — iOS/Android native optimized layout
- `[Screen].web.tsx` — Standard browser viewport layout
- `[Screen].desktop.tsx` — Wide desktop/Electron layout

Master selector example (from `DashboardScreen.tsx`):
```tsx
import { Platform } from "react-native";
import { DashboardScreen as WebScreen } from "./DashboardScreen.web";
import { DashboardScreen as NativeScreen } from "./DashboardScreen.native";
import { DashboardScreen as DesktopScreen } from "./DashboardScreen.desktop";

export function DashboardScreen() {
  if (Platform.OS === "web") return <WebScreen />;
  if (Platform.OS === "macos" || Platform.OS === "windows") return <DesktopScreen />;
  return <NativeScreen />;
}
```

### Design Tokens (already in `packages/ui/theme/tokens.ts`)
```ts
COLORS.brand: Navy 900 (#0B1953) → Light Focus Blue 500 (#60A5FA)
COLORS.neutral: Slate 50 (#F8FAFC) → Slate 900 (#0F172A)
COLORS.semantic: Success (Emerald), Warning (Amber), Error (Red), Info (Cyan) with bg/border variants
COLORS.bg: #F8FAFC
SPACING: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
RADIUS: input(8), button(8), card(12), dialog(16), circle(9999)
SHADOWS: none, card (soft), modal (medium)
TYPOGRAPHY: Inter font, sizes heading(32) → caption(12), weights 400-700
```

### Codebase Rules (from .agents/AGENTS.md)
- **No type assertions** (`as`, `!`) — use runtime guards
- **No `any` type** — use `unknown` with type guards
- **Mobile-first** with `maxWidth` constraints (440px auth, 1200px dashboards)
- **Feature architecture**: Screen files use `*Screen` naming (not `*Page`)
- **Safe async**: Use `safeAsync` wrapper from `@edge/api` for API calls
- **Preserve existing comments and docstrings** unrelated to changes

---

## Requirements

### R1. ThemeProvider & Dark/Light/System Mode Infrastructure
Create a runtime theme system in `packages/ui/` that provides dark, light, and system color modes across the internal app. The system must persist the user's preference (AsyncStorage on native, localStorage on web), auto-detect system preference via React Native's `useColorScheme()`, and expose themed color values to all components via a `useTheme()` hook. Define complete dark-mode color tokens alongside the existing light tokens — dark surfaces should use the Slate 800/900 neutrals with appropriately adjusted brand and semantic colors for dark backgrounds.

### R2. Update All @edge/ui Shared Components for Dark Mode
Every existing shared component in `packages/ui/` — Button, FormFieldInput, AlertToast, Avatar, DataTable, StatusBadge, and ServiceFormModal — must consume the theme context and render correctly in both light and dark modes. Components should use the themed color palette from `useTheme()` instead of hardcoded hex values or static token imports.

### R3. Create New Shared Components
Add these new reusable components to `packages/ui/`:
- **SkeletonLoader** — Animated shimmer loading placeholder for cards, lists, and tables
- **AnimatedCard** — Card wrapper with fade-in mount animation, shadow, and dark mode awareness
- **ThemeToggle** — Light/Dark/System mode switcher control
- **PageHeader** — Consistent page title + subtitle + optional action buttons
- **EmptyState** — Illustrated empty state for lists/tables with no data
- **SearchBar** — Search input with icon, clear button, and debounced onChange

All new components must be theme-aware, exported from `packages/ui/index.ts`, and follow the existing component patterns (React Native StyleSheet, typed props, no `any`).

### R4. Redesign All Internal App Screens with Platform Variants
Redesign every screen in `apps/frontend/internal/src/features/` with an enterprise dashboard aesthetic (clean lines, generous whitespace, card-based layouts, subtle shadows, professional typography — inspired by Linear, Vercel Dashboard, Notion). Every screen must have 3 platform variants plus a master selector (.native.tsx, .web.tsx, .desktop.tsx, .tsx).

**Screens requiring new platform variants** (currently single-file):
- `announcements/screens/AnnouncementsScreen`
- `audit-logs/screens/AuditLogsScreen`
- `feedback/screens/FeedbackScreen`
- `form-builder/screens/FormBuilderScreen`
- `queue/screens/ActivitiesScreen`
- `queue/screens/ApplicationReviewScreen`
- `roles-permission/screens/RolesPermissionScreen`
- `settings/screens/SettingsScreen`
- `settings/screens/AdminSettingsScreen`
- `login/components/LandingScreen`
- `login/components/ForgotPasswordScreen`
- `login/components/OnboardingScreen`

**Screens requiring visual redesign** (already have variants):
- `dashboard/screens/DashboardScreen` (.native, .web, .desktop)
- `employees/screens/EmployeesScreen` (.native, .web, .desktop)
- `login/components/InternalLoginScreen` (.native, .web, .desktop)
- `users/screens/UsersScreen` (.native, .web, .desktop)

All screens must use themed colors from `useTheme()`, apply the design tokens consistently, and work correctly in both light and dark modes.

**Preserve all existing functionality** — form logic, API calls, hooks, schemas, context usage, and navigation must remain intact. This is a visual-only redesign.

### R5. Redesign Shell Components
Redesign the app chrome — AppLayout (.native, .web, .desktop), Sidebar, MobileBottomTabBar, and StandardPageWrapper — to match the new enterprise aesthetic and support dark/light modes. Keep the same navigation structure and menu items.

### R6. Animations & Micro-interactions
Implement the following motion design patterns across all screens:
- Subtle fade-in/slide-up animations on screen mount
- Smooth press/hover feedback on interactive elements (buttons, cards, list items)
- Skeleton loading placeholders instead of ActivityIndicator spinners
- Animated theme transitions (smooth color crossfade when switching light↔dark)
- Micro-interactions on data changes (row highlight on update, badge pulse on new notification)

Use `react-native-reanimated` or React Native's built-in `Animated` API. Respect the `reduceMotion` accessibility preference.

### R7. Design System Documentation
Create a comprehensive `DESIGN_SYSTEM.md` in `packages/ui/` that serves as the single source of truth for the design system. Include:
- Complete token reference (colors, spacing, radius, shadows, typography) for both light and dark modes
- Component API reference (props, variants, usage examples) for every @edge/ui component
- Dark/light mode implementation guide (how to use ThemeProvider and useTheme)
- Platform variant conventions (when to use .native vs .web vs .desktop, master selector pattern)
- Screen creation guide with code examples for adding new features
- Do's and don'ts for visual consistency

---

## Acceptance Criteria

### Theme System
- [ ] `useTheme()` hook returns the active color palette based on user preference (light/dark/system)
- [ ] Theme preference persists across app restarts (AsyncStorage on native, localStorage on web)
- [ ] System mode auto-detects and follows the OS color scheme
- [ ] Theme can be toggled at runtime without app restart
- [ ] Dark mode uses Slate 800/900 backgrounds with adjusted brand and semantic colors

### Component Updates
- [ ] All 7 existing @edge/ui components (Button, FormFieldInput, AlertToast, Avatar, DataTable, StatusBadge, ServiceFormModal) render correctly in both light and dark modes
- [ ] All 6 new components (SkeletonLoader, AnimatedCard, ThemeToggle, PageHeader, EmptyState, SearchBar) are implemented, theme-aware, and exported from packages/ui/index.ts
- [ ] No component uses hardcoded hex color values — all use themed tokens

### Screen Redesign
- [ ] All 12 screens that currently lack platform variants now have .native.tsx, .web.tsx, .desktop.tsx, and .tsx master selector files
- [ ] All 4 screens with existing variants are visually redesigned to match the new enterprise aesthetic
- [ ] All screens render correctly in both light and dark modes
- [ ] All existing functionality (form logic, API calls, navigation, context usage) is preserved — no regressions
- [ ] Mobile layouts use maxWidth constraints (440px for forms/modals, 1200px for dashboards/grids)

### Shell
- [ ] AppLayout, Sidebar, MobileBottomTabBar, and StandardPageWrapper are redesigned with dark/light mode support
- [ ] Navigation structure and menu items are unchanged
- [ ] Shell components have the 3-variant pattern where applicable

### Animations
- [ ] Screen mount animations (fade-in/slide-up) are present on all screens
- [ ] Interactive elements have press/hover feedback
- [ ] Loading states use skeleton placeholders instead of spinners
- [ ] Theme transitions are smooth (no flash/flicker when switching modes)
- [ ] Animations respect accessibility reduce-motion preference

### Documentation
- [ ] DESIGN_SYSTEM.md exists in packages/ui/ with all sections listed in R7
- [ ] Documentation includes working code examples for both light and dark mode usage

### Code Quality
- [ ] No TypeScript `any` types used
- [ ] No type assertions (`as`, `!`) used
- [ ] All files follow the existing project conventions (StyleSheet.create, typed props, proper imports)
- [ ] The project compiles without TypeScript errors (`npx tsc --noEmit` in the internal app)

## Follow-up — 2026-07-29T22:27:52Z

CONTINUATION: Finish the remaining work on the NTC-EDGE Internal App design system overhaul. The previous run completed most of the implementation before hitting rate limits. Your job is to verify, fix, and harden everything.

Working directory: c:\Users\User\projects\ustp\NTC-EDGE
Integrity mode: development

## What Has Already Been Completed

The previous teamwork run delivered 84 files (51 new, 33 modified). Here's what's on disk:

### R1. ThemeProvider Infrastructure ✅ DONE
- `packages/ui/theme/ThemeProvider.tsx`, `useTheme.ts`, `themeContext.ts`, `themeStorage.ts`, `types.ts` — all created
- `packages/ui/theme/tokens.ts` — updated with `LIGHT_COLORS` and `DARK_COLORS` palettes
- Backward compatible: `export const COLORS = LIGHT_COLORS`

### R2. Updated @edge/ui Components ✅ DONE
- Button, FormFieldInput, AlertToast, Avatar, DataTable, StatusBadge, ServiceFormModal — all modified to use `useTheme()`

### R3. New Shared Components ✅ DONE
- SkeletonLoader, AnimatedCard, ThemeToggle, PageHeader, EmptyState, SearchBar — all created and exported from `packages/ui/index.ts`

### R4. Screen Redesign — MOSTLY DONE, NEEDS VERIFICATION
- All 12 screens that lacked platform variants now have .native.tsx, .web.tsx, .desktop.tsx files
- All 4 existing screen sets (Dashboard, Employees, Login, Users) were redesigned
- Master selectors were updated
- BUT: The final verification and polish pass was interrupted by rate limits

### R5. Shell Redesign ✅ DONE
- AppLayout (.native, .web, .desktop), Sidebar, MobileBottomTabBar, StandardPageWrapper — all redesigned
- New components: Header.tsx, SidebarNavItem.tsx, RoleSwitcher.tsx

### R6. Animations — PARTIALLY DONE
- SkeletonLoader has shimmer animation with reduceMotion support
- AnimatedCard has fade-in mount animation
- Screen-level mount animations and micro-interactions may be incomplete across all screens

### R7. Documentation ✅ DONE
- DESIGN_SYSTEM.md exists in packages/ui/ (216 lines)

### TypeScript Status
- `tsc --noEmit` passed with zero errors on the last check

## What Needs To Be Done (Remaining Work)

### 1. Full E2E Verification & Hardening
- Run `tsc --noEmit` from `apps/frontend/internal/` and fix ANY TypeScript errors
- Verify every screen file actually renders correctly (no missing imports, no broken references)
- Verify the ThemeProvider is properly integrated into the app's root (App.tsx or _layout.tsx)
- Ensure all screens properly consume `useTheme()` and don't use hardcoded hex colors

### 2. Screen Quality Audit
- Check every platform variant for completeness and quality
- Ensure master selectors follow the exact pattern:
```tsx
import { Platform } from "react-native";
export function XScreen() {
  if (Platform.OS === "web") return <WebScreen />;
  if (Platform.OS === "macos" || Platform.OS === "windows") return <DesktopScreen />;
  return <NativeScreen />;
}
```
- Verify maxWidth constraints (440px auth/modals, 1200px dashboards/grids)
- Verify all existing functionality is preserved (form logic, API calls, hooks, schemas, context)

### 3. Animation Completeness (R6)
- Ensure all screens have subtle fade-in/slide-up mount animations
- Ensure interactive elements have press/hover feedback
- Ensure loading states use SkeletonLoader instead of ActivityIndicator
- Ensure theme transitions are smooth (no flash/flicker)
- Ensure all animations respect reduceMotion accessibility preference

### 4. ThemeProvider Integration
- Verify ThemeProvider wraps the app root in `apps/frontend/internal/src/App.tsx`
- Verify the Settings screen's appearance tab uses ThemeToggle component and actually controls the theme

### 5. Code Quality Final Check
- Zero `any` types
- Zero type assertions (`as`, `!`)
- All files use StyleSheet.create, typed props, proper imports
- No hardcoded hex color values in any screen or component

## Codebase Rules (from .agents/AGENTS.md)
- **No type assertions** (`as`, `!`) — use runtime guards
- **No `any` type** — use `unknown` with type guards
- **Mobile-first** with `maxWidth` constraints (440px auth, 1200px dashboards)
- **Feature architecture**: Screen files use `*Screen` naming (not `*Page`)
- **Safe async**: Use `safeAsync` wrapper from `@edge/api` for API calls
- **Preserve existing comments and docstrings** unrelated to changes

## Acceptance Criteria

### Theme System
- [ ] `useTheme()` hook returns the active color palette based on user preference (light/dark/system)
- [ ] Theme preference persists across app restarts (AsyncStorage on native, localStorage on web)
- [ ] System mode auto-detects and follows the OS color scheme
- [ ] Theme can be toggled at runtime without app restart
- [ ] Dark mode uses Slate 800/900 backgrounds with adjusted brand and semantic colors
- [ ] ThemeProvider wraps the app root

### Component Updates
- [ ] All 7 existing @edge/ui components render correctly in both light and dark modes
- [ ] All 6 new components are implemented, theme-aware, and exported from packages/ui/index.ts
- [ ] No component uses hardcoded hex color values — all use themed tokens

### Screen Redesign
- [ ] All 12 screens that previously lacked platform variants now have .native.tsx, .web.tsx, .desktop.tsx, and .tsx master selector files
- [ ] All 4 screens with existing variants are visually redesigned to match the new enterprise aesthetic
- [ ] All screens render correctly in both light and dark modes
- [ ] All existing functionality (form logic, API calls, navigation, context usage) is preserved — no regressions
- [ ] Mobile layouts use maxWidth constraints (440px for forms/modals, 1200px for dashboards/grids)

### Shell
- [ ] AppLayout, Sidebar, MobileBottomTabBar, and StandardPageWrapper are redesigned with dark/light mode support
- [ ] Navigation structure and menu items are unchanged
- [ ] Shell components have the 3-variant pattern where applicable

### Animations
- [ ] Screen mount animations (fade-in/slide-up) are present on all screens
- [ ] Interactive elements have press/hover feedback
- [ ] Loading states use skeleton placeholders instead of spinners
- [ ] Theme transitions are smooth (no flash/flicker when switching modes)
- [ ] Animations respect accessibility reduce-motion preference

### Documentation
- [ ] DESIGN_SYSTEM.md exists in packages/ui/ with complete content
- [ ] Documentation includes working code examples for both light and dark mode usage

### Code Quality
- [ ] No TypeScript `any` types used
- [ ] No type assertions (`as`, `!`) used
- [ ] All files follow the existing project conventions (StyleSheet.create, typed props, proper imports)
- [ ] The project compiles without TypeScript errors (`npx tsc --noEmit` in the internal app)

