# Core Feature Screens Redesign Iteration 2 — Review Report

**Reviewer**: teamwork_preview_reviewer (Instance 3)  
**Milestone**: Milestone 4 (Core Feature Screens Redesign Iteration 2)  
**Date**: 2026-07-29  
**Verdict**: **VETO** (REQUEST_CHANGES)

---

## Executive Summary

Re-review of all 9 redesigned core feature screens in `apps/frontend/internal/src/features/` was conducted following Worker 2 remediation. While 4 out of the 5 code remediation items (ViewStyle fixes, removal of type assertions, theme awareness, and container `maxWidth: 1200` constraints) were verified and implemented correctly, **Item 2 (Type-safe navigation)** introduced a critical TypeScript regression that causes 15 compilation errors during `pnpm --filter ntc-edge-internal check-types`.

---

## Review Matrix (6 Objective Items)

| Item | Requirement | Status | Rationale / Evidence |
| :--- | :--- | :--- | :--- |
| **1** | ViewStyle TS2322 fix in `FeedbackScreen.desktop.tsx` & `FeedbackScreen.native.tsx` | **PASS** | Array-based style objects for `AnimatedCard`, `ScrollView`, and wrapper views conform to React Native `StyleProp<ViewStyle>`. No TS2322 errors. |
| **2** | Type-safe navigation in `LandingScreen`, `OnboardingScreen`, `SettingsScreen` | **FAIL** | `useAppNavigation()` in `src/navigation/types.ts` calls `useReactNavigation<RootStackParamList>()`. Passing raw `RootStackParamList` instead of `NavigationProp<RootStackParamList>` causes React Navigation's generic parameter to evaluate to `never`. Calling `navigation.navigate()` in 9 screen variants throws TS2339. |
| **3** | Removal of `(EDITABLE_STATUSES as readonly string[])` in `ApplicationReviewScreenContent.tsx` | **PASS** | Line 1107 defines `const EDITABLE_STATUSES: ReadonlyArray<string> = [...]`. `EDITABLE_STATUSES.includes(app.status)` works cleanly without forced type casting. |
| **4** | Theme awareness via `useTheme()` in `EmployeesScreen.native.tsx`, `UsersScreen.native.tsx`, `RoleCard.tsx`, `AddRoleModal.tsx`, `RolesPermissionScreen.desktop.tsx`/`web.tsx` | **PASS** | All specified components consume `useTheme()` from `@edge/ui` to apply dynamic `colors` and handle light/dark mode transitions. |
| **5** | `maxWidth: 1200` container bounds in `ApplicationReviewScreen.desktop.tsx` and `web.tsx` | **PASS** | Both desktop and web screen container styles set `maxWidth: 1200` and `alignSelf: 'center'`. |
| **6** | Run `pnpm --filter ntc-edge-internal check-types` and record output | **FAIL** | Command exited with failure status (Exit status 2 / exit code 1) due to 15 TypeScript compilation errors in navigation usage. |

---

## Detailed Findings & Required Remediation

### [Critical] Major Finding 1: `useAppNavigation()` resolves navigation object to `never` type

- **Location**: `apps/frontend/internal/src/navigation/types.ts` (lines 37–39)
- **Problem**: `useAppNavigation` is declared as:
  ```typescript
  export function useAppNavigation() {
    return useReactNavigation<RootStackParamList>();
  }
  ```
  `@react-navigation/native`'s `useNavigation<T>` requires `T` to extend `NavigationProp<ParamListBase>`. `RootStackParamList` is a raw parameter map (`{ Landing: undefined; ... }`) and does not extend `NavigationProp`, causing TypeScript to evaluate `T` as `never`.
- **Affected Files** (15 errors across 9 files):
  1. `src/features/login/components/LandingScreen.desktop.tsx` (lines 17, 21)
  2. `src/features/login/components/LandingScreen.native.tsx` (lines 18, 22)
  3. `src/features/login/components/LandingScreen.web.tsx` (lines 18, 22)
  4. `src/features/login/components/OnboardingScreen.desktop.tsx` (lines 46, 51)
  5. `src/features/login/components/OnboardingScreen.native.tsx` (lines 46, 51)
  6. `src/features/login/components/OnboardingScreen.web.tsx` (lines 47, 52)
  7. `src/features/settings/screens/SettingsScreen.desktop.tsx` (line 58)
  8. `src/features/settings/screens/SettingsScreen.native.tsx` (line 61)
  9. `src/features/settings/screens/SettingsScreen.web.tsx` (line 58)
- **Suggested Fix**:
  In `apps/frontend/internal/src/navigation/types.ts`, import `NavigationProp` from `@react-navigation/native` and update `useAppNavigation()`:
  ```typescript
  import {
    NavigationProp,
    useNavigation as useReactNavigation,
  } from "@react-navigation/native";

  export function useAppNavigation() {
    return useReactNavigation<NavigationProp<RootStackParamList>>();
  }
  ```

---

## Typecheck Command Output (`pnpm --filter ntc-edge-internal check-types`)

```
> ntc-edge-internal@1.0.0 check-types C:\Users\User\projects\ustp\NTC-EDGE\apps\frontend\internal
> tsc --noEmit

src/features/login/components/LandingScreen.desktop.tsx(17,16): error TS2339: Property 'navigate' does not exist on type 'never'.
src/features/login/components/LandingScreen.desktop.tsx(21,16): error TS2339: Property 'navigate' does not exist on type 'never'.
src/features/login/components/LandingScreen.native.tsx(18,16): error TS2339: Property 'navigate' does not exist on type 'never'.
src/features/login/components/LandingScreen.native.tsx(22,16): error TS2339: Property 'navigate' does not exist on type 'never'.
src/features/login/components/LandingScreen.web.tsx(18,16): error TS2339: Property 'navigate' does not exist on type 'never'.
src/features/login/components/LandingScreen.web.tsx(22,16): error TS2339: Property 'navigate' does not exist on type 'never'.
src/features/login/components/OnboardingScreen.desktop.tsx(46,18): error TS2339: Property 'navigate' does not exist on type 'never'.
src/features/login/components/OnboardingScreen.desktop.tsx(51,16): error TS2339: Property 'navigate' does not exist on type 'never'.
src/features/login/components/OnboardingScreen.native.tsx(46,18): error TS2339: Property 'navigate' does not exist on type 'never'.
src/features/login/components/OnboardingScreen.native.tsx(51,16): error TS2339: Property 'navigate' does not exist on type 'never'.
src/features/login/components/OnboardingScreen.web.tsx(47,18): error TS2339: Property 'navigate' does not exist on type 'never'.
src/features/login/components/OnboardingScreen.web.tsx(52,16): error TS2339: Property 'navigate' does not exist on type 'never'.
src/features/settings/screens/SettingsScreen.desktop.tsx(58,16): error TS2339: Property 'navigate' does not exist on type 'never'.
src/features/settings/screens/SettingsScreen.native.tsx(61,16): error TS2339: Property 'navigate' does not exist on type 'never'.
src/features/settings/screens/SettingsScreen.web.tsx(58,16): error TS2339: Property 'navigate' does not exist on type 'never'.
C:\Users\User\projects\ustp\NTC-EDGE\apps\frontend\internal:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  ntc-edge-internal@1.0.0 check-types: `tsc --noEmit`
Exit status 2
```

---

## Verdict Rationale

While 5 of 6 review items pass quality standards, the project build/typecheck fails due to the navigation hook typing issue. As per review guidelines, work products with compilation/type errors cannot be approved. Final verdict is **VETO**.
