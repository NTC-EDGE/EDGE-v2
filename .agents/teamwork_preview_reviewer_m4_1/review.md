# Core Feature Screens Redesign (Milestone 4) - Review Report

**Reviewer**: `teamwork_preview_reviewer_m4_1`  
**Date**: 2026-07-29  
**Verdict**: **VETO** (REQUEST_CHANGES)

---

## Executive Summary

An independent review was performed on all 9 redesigned core feature screens in `apps/frontend/internal/src/features/`:
1. `announcements` (`AnnouncementsScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`)
2. `audit-logs` (`AuditLogsScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`)
3. `feedback` (`FeedbackScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`)
4. `form-builder` (`FormBuilderScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`)
5. `queue/screens/ActivitiesScreen` (`ActivitiesScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`)
6. `queue/screens/ApplicationReviewScreen` (`ApplicationReviewScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`, `ApplicationReviewScreenContent.tsx`)
7. `roles-permission` (`RolesPermissionScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`)
8. `employees` (`EmployeesScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`, `EmployeesScreenContent.tsx`)
9. `users` (`UsersScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`, `UsersScreenContent.tsx`)

The overall verdict is **VETO** due to TypeScript compilation errors in `FeedbackScreen` (.desktop and .native), strict type safety violation (`as` assertion) in `ApplicationReviewScreenContent.tsx`, and lack of `useTheme()` hook usage in `EmployeesScreenContent.tsx` and `UsersScreenContent.tsx`.

---

## Detailed Findings against Review Criteria

### 1. Compilation (`pnpm --filter ntc-edge-internal check-types` / `tsc --noEmit`)
- **Status**: **FAILED** (Exit Code 2)
- **Critical Finding**:
  - `src/features/feedback/screens/FeedbackScreen.desktop.tsx(149,15)`: `error TS2322: Type '({ padding: 16; borderRadius: 12; borderWidth: number; gap: 8; } | { backgroundColor: string; borderColor: string; })[]' is not assignable to type 'ViewStyle'.`
  - `src/features/feedback/screens/FeedbackScreen.native.tsx(122,17)`: `error TS2322: Type '({ padding: 16; borderRadius: 12; borderWidth: number; gap: number; } | { backgroundColor: string; borderColor: string; })[]' is not assignable to type 'ViewStyle'.`
- **Root Cause**: Object spread combined with style array in `AnimatedCard` `style` prop (`style={{ ...styles.feedbackCard, backgroundColor: colors.cardBg, borderColor: colors.border }}`) evaluates to an incompatible style union type in TypeScript strict mode.

### 2. Strict Type Safety (ZERO `any` types, ZERO `as` assertions, ZERO `!` non-null assertions)
- **Status**: **FAILED**
- **Major Finding**:
  - `src/features/queue/screens/ApplicationReviewScreenContent.tsx`:
    - Line 1111: `] as const;`
    - Line 1118: `(EDITABLE_STATUSES as readonly string[]).includes(app.status);` — Explicit type assertion (`as readonly string[]`) violating strict project rules against `as` assertions.
- **Passes**:
  - Zero `any` types found across all 9 screen feature directories.
  - Zero `!` non-null assertions found across all 9 screen feature directories.

### 3. Responsive Layout (`maxWidth: 1200` & `alignSelf: 'center'` on Web/Desktop variants)
- **Status**: **PASSED**
- **Verification Details**:
  - All `.web.tsx` and `.desktop.tsx` variant screens enforce `maxWidth: 1200` and `alignSelf: 'center'`:
    - `AnnouncementsScreen.web.tsx` & `.desktop.tsx` (container line 70-71)
    - `AuditLogsScreen.web.tsx` & `.desktop.tsx` (container line 33-34)
    - `FeedbackScreen.web.tsx` & `.desktop.tsx` (container line 218-219)
    - `FormBuilderScreen.web.tsx` & `.desktop.tsx` (container line 151-152)
    - `ActivitiesScreen.web.tsx` & `.desktop.tsx` (headerWrapper / desktopLayout lines 77-78, 84-85)
    - `ApplicationReviewScreen.web.tsx` & `.desktop.tsx` (hosted within `ActivitiesScreen` 1200px max-width layout)
    - `RolesPermissionScreen.web.tsx` & `.desktop.tsx` (container line 423-424)
    - `EmployeesScreen.web.tsx` & `.desktop.tsx` (container line 24-25)
    - `UsersScreen.web.tsx` & `.desktop.tsx` (container line 24-25)

### 4. Theme Awareness (`useTheme()` hook from `@edge/ui`)
- **Status**: **FAILED**
- **Major Finding**:
  - `EmployeesScreenContent.tsx` (used by `EmployeesScreen` variants) imports static `COLORS` export from `@edge/ui` and uses hardcoded color values (`COLORS.neutral...`) rather than consuming the dynamic `useTheme()` hook.
  - `UsersScreenContent.tsx` (used by `UsersScreen` variants) imports static `COLORS` export from `@edge/ui` and uses hardcoded color values (`COLORS.neutral...`) rather than consuming the dynamic `useTheme()` hook.
- **Passes**:
  - The remaining 7 feature screens correctly call `useTheme()` to retrieve dynamic theme variables (`colors.bg`, `colors.cardBg`, `colors.border`, `colors.text`, etc.).

### 5. `@edge/ui` Component Integration
- **Status**: **PASSED**
- **Verification Details**:
  - High degree of component reuse across all 9 screens (`PageHeader`, `AnimatedCard`, `Button`, `SkeletonLoader`, `EmptyState`, `SearchBar`, `DataTable`, `Icon as Lucide`).

---

## Screen-by-Screen Summary Table

| Screen Feature | 4-Variant Split | Type Safety | Responsive Layout (1200px) | Theme Awareness (`useTheme()`) | `@edge/ui` Reuse | Compilation |
|---|---|---|---|---|---|---|
| `announcements` | ✅ Yes | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass |
| `audit-logs` | ✅ Yes | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass |
| `feedback` | ✅ Yes | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ❌ Fail (TS2322 in .desktop & .native) |
| `form-builder` | ✅ Yes | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass |
| `queue/ActivitiesScreen` | ✅ Yes | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass |
| `queue/ApplicationReviewScreen` | ✅ Yes | ❌ Fail (`as` assertion) | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass |
| `roles-permission` | ✅ Yes | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass |
| `employees` | ✅ Yes | ✅ Pass | ✅ Pass | ❌ Fail (Uses static `COLORS`) | ✅ Pass | ✅ Pass |
| `users` | ✅ Yes | ✅ Pass | ✅ Pass | ❌ Fail (Uses static `COLORS`) | ✅ Pass | ✅ Pass |

---

## Summary of Action Items / Required Changes

1. **Fix `FeedbackScreen` TypeScript Errors**:
   - Update `FeedbackScreen.desktop.tsx` (line 149) and `FeedbackScreen.native.tsx` (line 122) to pass `style={[styles.feedbackCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}` or single object instead of spreading into `AnimatedCard`.
2. **Remove `as` assertion in `ApplicationReviewScreenContent.tsx`**:
   - Refactor `(EDITABLE_STATUSES as readonly string[]).includes(app.status)` at line 1118 to use type guard or includes-compatible type check without `as`.
3. **Refactor `EmployeesScreenContent.tsx` & `UsersScreenContent.tsx` for Theme Awareness**:
   - Replace static `COLORS` imports with `useTheme()` hook in `EmployeesScreenContent.tsx` and `UsersScreenContent.tsx` to ensure dynamic light/dark theme support across all environments.
