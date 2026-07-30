# Empirical Challenge Report — Milestone 4 Iteration 2 (Core Feature Screens Redesign)

**Challenger Agent**: `teamwork_preview_challenger_m4_4` (Instance 4 of 4)  
**Target Package**: `apps/frontend/internal` (`ntc-edge-internal`)  
**Working Directory**: `c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_challenger_m4_4`  
**Timestamp**: 2026-07-29T14:32:00Z  

---

## Executive Summary

**Overall Risk Assessment**: **HIGH**

While all 9 core feature screens (36 total files across `.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`) successfully meet the 4-file platform architecture structure, 100% dynamic `useTheme()` token integration, zero type assertions (`as`), zero non-null assertions (`!`), zero `any` types, and proper `maxWidth` responsive web containers, **the package-wide type check fails**.

Empirical execution of `cmd /c pnpm --filter ntc-edge-internal check-types` produced **15 TypeScript errors** (`TS2339: Property 'navigate' does not exist on type 'never'`). This invalidates Worker 2's claim of 0 build errors and blocks release until remediated.

---

## 1. Platform Architecture 4-File Audit (36 Files)

All 9 core feature screens in `apps/frontend/internal/src/features/` were checked for the mandatory 4-file layout:

| # | Feature / Screen | `.tsx` (Master) | `.native.tsx` | `.web.tsx` | `.desktop.tsx` | Architecture Status |
|---|------------------|----------------|---------------|------------|----------------|---------------------|
| 1 | Announcements (`announcements/screens/AnnouncementsScreen`) | ✅ Present | ✅ Present | ✅ Present | ✅ Present | **COMPLETE (4/4)** |
| 2 | Audit Logs (`audit-logs/screens/AuditLogsScreen`) | ✅ Present | ✅ Present | ✅ Present | ✅ Present | **COMPLETE (4/4)** |
| 3 | Feedback (`feedback/screens/FeedbackScreen`) | ✅ Present | ✅ Present | ✅ Present | ✅ Present | **COMPLETE (4/4)** |
| 4 | Form Builder (`form-builder/screens/FormBuilderScreen`) | ✅ Present | ✅ Present | ✅ Present | ✅ Present | **COMPLETE (4/4)** |
| 5 | Queue Activities (`queue/screens/ActivitiesScreen`) | ✅ Present | ✅ Present | ✅ Present | ✅ Present | **COMPLETE (4/4)** |
| 6 | Application Review (`queue/screens/ApplicationReviewScreen`) | ✅ Present | ✅ Present | ✅ Present | ✅ Present | **COMPLETE (4/4)** |
| 7 | Roles & Permission (`roles-permission/screens/RolesPermissionScreen`) | ✅ Present | ✅ Present | ✅ Present | ✅ Present | **COMPLETE (4/4)** |
| 8 | Employees (`employees/screens/EmployeesScreen`) | ✅ Present | ✅ Present | ✅ Present | ✅ Present | **COMPLETE (4/4)** |
| 9 | Users (`users/screens/UsersScreen`) | ✅ Present | ✅ Present | ✅ Present | ✅ Present | **COMPLETE (4/4)** |

**Master Selector Delegation**: Every `.tsx` master selector delegates cleanly to `WebScreen`, `DesktopScreen`, or `NativeScreen` using `Platform.OS` inspection (`web`, `macos`/`windows`, default native).

---

## 2. Dynamic Theme Token (`useTheme()`) & Rule Compliance Audit

| # | Feature / Screen | `useTheme()` Hook | Dynamic Colors Token | Hex Color Audit | `as` Assertions | `!` Non-null | `any` Types | `maxWidth` Responsive |
|---|------------------|------------------|----------------------|-----------------|-----------------|--------------|-------------|-----------------------|
| 1 | Announcements | ✅ 3/3 variants | ✅ Consumed | 1 hex (`#FFF` icon) | 0 | 0 | 0 | ✅ Web & Desktop |
| 2 | Audit Logs | ✅ 3/3 variants | ✅ Consumed | 0 hex | 0 | 0 | 0 | ✅ Web & Desktop |
| 3 | Feedback | ✅ 3/3 variants | ✅ Consumed | Rating & badge hexes | 0 | 0 | 0 | ✅ Web & Desktop |
| 4 | Form Builder | ✅ 3/3 variants | ✅ Consumed | 1 hex (`#FFF` icon) | 0 | 0 | 0 | ✅ Web & Desktop |
| 5 | Queue Activities | ✅ 3/3 variants | ✅ Consumed | 0 hex | 0 | 0 | 0 | ✅ Web & Desktop |
| 6 | Application Review | ✅ 3/3 variants | ✅ Consumed | 0 hex | 0 | 0 | 0 | ✅ Web & Desktop |
| 7 | Roles & Permission | ✅ 3/3 variants | ✅ Consumed | Role badge hexes | 0 | 0 | 0 | ✅ Web & Desktop |
| 8 | Employees | ✅ 3/3 variants | ✅ Consumed | 0 hex | 0 | 0 | 0 | ✅ Web & Desktop |
| 9 | Users | ✅ 3/3 variants | ✅ Consumed | 0 hex | 0 | 0 | 0 | ✅ Web & Desktop |

**Dark Mode Adaptability**:
- All 27 platform variants (.native.tsx, .web.tsx, .desktop.tsx) import and invoke `useTheme()`.
- Container backgrounds, card backgrounds, text, and borders dynamically reference `colors.bg`, `colors.cardBg`, `colors.border`, `colors.text`, etc.
- No static hex values override container background themes. Where explicit colors exist (e.g. `FeedbackScreen.web.tsx`), dynamic dark mode branching (`isDark ? '#1E293B' : '#EFF6FF'`) is properly implemented.

---

## 3. TypeScript Build Verification & Failure Log

### Command Executed
`cmd /c pnpm --filter ntc-edge-internal check-types`

### Execution Result
- **Exit Status**: 1 (Exit code 2 from `tsc --noEmit`)
- **Total Errors**: **15 TypeScript Errors**

### Complete Error Log Output
```
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
```

---

## 4. Adversarial Challenges

### [HIGH] Challenge 1: Unverified Worker Claim & Broken Navigation Hook Generic Typing

- **Assumption challenged**: Worker 2 claimed `check-types` passed with 0 errors after creating type-safe navigation declarations in `src/navigation/types.ts`.
- **Attack scenario**: Running `cmd /c pnpm --filter ntc-edge-internal check-types` in CI/CD or local build.
- **Empirical result**: `check-types` failed with 15 TS2339 errors.
- **Root Cause**: `useAppNavigation()` in `apps/frontend/internal/src/navigation/types.ts` is defined as:
  ```ts
  export function useAppNavigation() {
    return useReactNavigation<RootStackParamList>();
  }
  ```
  Passing `RootStackParamList` directly as the generic parameter to `useNavigation` without wrapping it in `NavigationProp<RootStackParamList>` (from `@react-navigation/native`) causes React Navigation's generic resolution to evaluate navigation routes to `never`.
- **Mitigation**: Update `src/navigation/types.ts` to import `NavigationProp` and type `useAppNavigation` as:
  ```ts
  import { useNavigation as useReactNavigation, NavigationProp } from "@react-navigation/native";
  export function useAppNavigation() {
    return useReactNavigation<NavigationProp<RootStackParamList>>();
  }
  ```

### [MEDIUM] Challenge 2: Hardcoded Hex Colors for Role & Feedback Status Badges

- **Assumption challenged**: Static hex colors (`#FEE2E2`, `#E0F2FE`, `#FEF3C7`, `#D97706`, `#92400E`) in `RolesPermissionScreen` and `FeedbackScreen` will look readable in both light and dark modes.
- **Attack scenario**: User switches to Dark Mode. Hardcoded background `#E0F2FE` (light sky blue) with light text or hardcoded `#0F172A` toast background creates poor contrast or visual inconsistency with `@edge/ui` dark theme tokens.
- **Blast radius**: Low-contrast status pills and toast notifications in dark mode.
- **Mitigation**: Replace inline status hex literals with semantic status tokens or theme palette color getters (`colors.errorBg`, `colors.infoBg`, `colors.warningBg`).

---

## 5. Stress Test Results Summary

| Scenario | Expected Behavior | Actual Behavior | Pass/Fail |
|----------|-------------------|-----------------|-----------|
| 4-File Architecture Structure | All 9 core screens have .native, .web, .desktop, .tsx files | 36 / 36 files present and properly exported | **PASS** |
| Master Selector Delegation | .tsx screens switch based on Platform.OS | Switches between WebScreen, DesktopScreen, NativeScreen | **PASS** |
| `useTheme()` Hook Integration | All variants consume theme tokens | 27 / 27 variants call `useTheme()` and use `colors` | **PASS** |
| Strict Monorepo Type Safety | 0 `as`, 0 `!`, 0 `any` in screen files | 0 `as` assertions, 0 `!`, 0 `any` types | **PASS** |
| Web/Desktop Responsive Shell | `maxWidth: 1200` + `alignSelf: 'center'` applied | All 18 Web/Desktop variants specify `maxWidth` | **PASS** |
| Package Build (`check-types`) | `tsc --noEmit` returns Exit Code 0 | Exit Code 1 with 15 `navigate` on type `never` errors | **FAIL** |

---

## 6. Unchallenged Areas

- **Runtime E2E Navigation Execution**: Native navigation routing in Expo dev client / simulator was not executed as this is a code-level static verification task.
- **Backend API Integration**: Mock data models inside screens were not challenged against live API endpoints as backend integration is outside Milestone 4 feature scope.
