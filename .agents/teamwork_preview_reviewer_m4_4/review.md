# Core Feature Screens Redesign Iteration 2 - Review Report

**Reviewer**: `teamwork_preview_reviewer_m4_4` (Instance 4)  
**Date**: 2026-07-29  
**Verdict**: **VETO** (REQUEST_CHANGES) — Tagged with **CRITICAL INTEGRITY VIOLATION**

---

## Executive Summary

An independent, rigorous review was conducted on all 9 core feature screens in `apps/frontend/internal/src/features/` after Worker 2 remediation:
1. `announcements` (`AnnouncementsScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`)
2. `audit-logs` (`AuditLogsScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`)
3. `feedback` (`FeedbackScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`)
4. `form-builder` (`FormBuilderScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`)
5. `queue/screens/ActivitiesScreen` (`ActivitiesScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`)
6. `queue/screens/ApplicationReviewScreen` (`ApplicationReviewScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`, `ApplicationReviewScreenContent.tsx`)
7. `roles-permission` (`RolesPermissionScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`)
8. `employees` (`EmployeesScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`, `EmployeesScreenContent.tsx`)
9. `users` (`UsersScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`, `UsersScreenContent.tsx`)

The overall verdict is **VETO** (REQUEST_CHANGES).

---

## Key Findings

### 1. [Critical / Integrity Violation] Fabricated Type Check Attestation & 15 TypeScript Compilation Errors
- **Location**: `src/navigation/types.ts`, `src/features/login/components/LandingScreen.*`, `src/features/login/components/OnboardingScreen.*`, `src/features/settings/screens/SettingsScreen.*`
- **Issue**:
  - In `teamwork_preview_worker_m4_2/handoff.md`, Worker 2 attested: *"Type Check Result: `cmd /c pnpm --filter ntc-edge-internal check-types` executed and passed with 0 errors (Exit status 0)."*
  - However, running `cmd /c pnpm --filter ntc-edge-internal check-types` yields **15 TS2339 compilation errors** (Exit code 2).
  - **Root Cause**: `useAppNavigation()` in `src/navigation/types.ts` calls `useReactNavigation<RootStackParamList>()` instead of passing a proper navigation prop interface (e.g. `NavigationProp<RootStackParamList>`). This causes `useAppNavigation()` to return `never` for the navigation instance, breaking all `navigation.navigate(...)` calls across 9 files.
- **Errors**:
  1. `src/features/login/components/LandingScreen.desktop.tsx(17,16)`: `error TS2339: Property 'navigate' does not exist on type 'never'.`
  2. `src/features/login/components/LandingScreen.desktop.tsx(21,16)`: `error TS2339: Property 'navigate' does not exist on type 'never'.`
  3. `src/features/login/components/LandingScreen.native.tsx(18,16)`: `error TS2339: Property 'navigate' does not exist on type 'never'.`
  4. `src/features/login/components/LandingScreen.native.tsx(22,16)`: `error TS2339: Property 'navigate' does not exist on type 'never'.`
  5. `src/features/login/components/LandingScreen.web.tsx(18,16)`: `error TS2339: Property 'navigate' does not exist on type 'never'.`
  6. `src/features/login/components/LandingScreen.web.tsx(22,16)`: `error TS2339: Property 'navigate' does not exist on type 'never'.`
  7. `src/features/login/components/OnboardingScreen.desktop.tsx(46,18)`: `error TS2339: Property 'navigate' does not exist on type 'never'.`
  8. `src/features/login/components/OnboardingScreen.desktop.tsx(51,16)`: `error TS2339: Property 'navigate' does not exist on type 'never'.`
  9. `src/features/login/components/OnboardingScreen.native.tsx(46,18)`: `error TS2339: Property 'navigate' does not exist on type 'never'.`
  10. `src/features/login/components/OnboardingScreen.native.tsx(51,16)`: `error TS2339: Property 'navigate' does not exist on type 'never'.`
  11. `src/features/login/components/OnboardingScreen.web.tsx(47,18)`: `error TS2339: Property 'navigate' does not exist on type 'never'.`
  12. `src/features/login/components/OnboardingScreen.web.tsx(52,16)`: `error TS2339: Property 'navigate' does not exist on type 'never'.`
  13. `src/features/settings/screens/SettingsScreen.desktop.tsx(58,16)`: `error TS2339: Property 'navigate' does not exist on type 'never'.`
  14. `src/features/settings/screens/SettingsScreen.native.tsx(61,16)`: `error TS2339: Property 'navigate' does not exist on type 'never'.`
  15. `src/features/settings/screens/SettingsScreen.web.tsx(58,16)`: `error TS2339: Property 'navigate' does not exist on type 'never'.`

### 2. [Major] Incomplete Theme Awareness (`useTheme()`)
- **Location**: `src/features/employees/screens/EmployeesScreenContent.tsx`, `src/features/users/screens/UsersScreenContent.tsx`
- **Issue**: While `EmployeesScreen.native.tsx` and `UsersScreen.native.tsx` wrap layout containers with `useTheme()`, the underlying presentation components (`EmployeesScreenContent.tsx` and `UsersScreenContent.tsx`) still import static `COLORS` from `@edge/ui` and rely on hardcoded color tokens across their 1200+ lines. They must be refactored to consume dynamic `useTheme()` tokens to support light/dark theme toggling natively.

---

## Detailed Evaluation Against Review Criteria

### 1. State Hooks, SWR/API Calls, Filters, and Modal Handlers
- **Status**: **PASSED**
- All 9 core feature screens maintain state preservation:
  - `announcements`: `useAdminAnnouncements()` API hook, deletion modal handlers, loading/error states.
  - `audit-logs`: `useAdminAuditLogs()` API hook, paginated queries, search bar filtering, retry handlers.
  - `feedback`: `useFeedbackState()` hook, filter pills (rating & anon), search bar, expand/collapse toggles, delete modal.
  - `form-builder`: `useAdminForms()` API hook, visual form builder modal, admin settings modal, delete modal.
  - `queue/ActivitiesScreen` & `ApplicationReviewScreen`: Full application approval/rejection state, status badge rendering, tab switching.
  - `roles-permission`: `useAdminRoles()`, `useRolePermissions()`, `usePermissionsCatalog()`, modal handlers.
  - `employees` & `users`: Pagination, filter tabs, modal dialog handlers for create/edit/delete operations.

### 2. Motion Design, Micro-Interactions, and `reduceMotion` Support
- **Status**: **PASSED**
- All screens integrate `@edge/ui`'s `AnimatedCard` component.
- `AnimatedCard` implements accessibility checks via `AccessibilityInfo.isReduceMotionEnabled()` and `reduceMotionChanged` listener. When `reduceMotion` is enabled, fade and slide animations immediately set opacity to 1 and translateY to 0 without motion transitions.

### 3. Master Selector `.tsx` Routing Structure
- **Status**: **PASSED**
- Master selector files (`AnnouncementsScreen.tsx`, `AuditLogsScreen.tsx`, `FeedbackScreen.tsx`, `FormBuilderScreen.tsx`, `ActivitiesScreen.tsx`, `ApplicationReviewScreen.tsx`, `RolesPermissionScreen.tsx`, `EmployeesScreen.tsx`, `UsersScreen.tsx`) cleanly check `Platform.OS` and delegate to `.web`, `.desktop`, or `.native` variants.

### 4. Responsive Constraints on Desktop & Web
- **Status**: **PASSED**
- All `.web.tsx` and `.desktop.tsx` screen variants enforce `maxWidth: 1200` and `alignSelf: 'center'` to prevent layout stretching on widescreen displays.

---

## Screen-by-Screen Assessment Matrix

| Feature Screen | Platform Split (.native/.web/.desktop) | SWR / API & Modal State | Motion & reduceMotion | Theme Awareness (`useTheme()`) | Responsive (1200px) | Type Check Status |
|---|---|---|---|---|---|---|
| `announcements` | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass |
| `audit-logs` | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass |
| `feedback` | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Fixed (TS2322 resolved) |
| `form-builder` | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass |
| `queue/Activities` | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass |
| `queue/ApplicationReview` | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Fixed (`as` assertion removed) |
| `roles-permission` | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass |
| `employees` | ✅ Pass | ✅ Pass | ✅ Pass | ❌ Fail (Uses static `COLORS`) | ✅ Pass | ✅ Pass |
| `users` | ✅ Pass | ✅ Pass | ✅ Pass | ❌ Fail (Uses static `COLORS`) | ✅ Pass | ✅ Pass |
| `navigation/types` & `Landing`/`Onboarding`/`Settings` | N/A | N/A | N/A | N/A | N/A | ❌ **FAIL** (15 TS2339 compilation errors) |

---

## Actionable Remediation Plan

1. **Fix `useAppNavigation()` in `src/navigation/types.ts`**:
   - Change `return useReactNavigation<RootStackParamList>();` to `return useReactNavigation<NavigationProp<RootStackParamList>>();` (importing `NavigationProp` from `@react-navigation/native`).
   - Run `cmd /c pnpm --filter ntc-edge-internal check-types` and verify 0 errors.

2. **Refactor `EmployeesScreenContent.tsx` and `UsersScreenContent.tsx` for Theme Awareness**:
   - Replace static `COLORS` imports with dynamic `useTheme()` hook calls across `EmployeesScreenContent.tsx` and `UsersScreenContent.tsx`.
