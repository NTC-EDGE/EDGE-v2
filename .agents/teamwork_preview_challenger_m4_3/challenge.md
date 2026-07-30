# Empirical Challenge & Stress Test Report — Milestone 4 (Iteration 2)

**Evaluator**: `teamwork_preview_challenger` (Instance 3)  
**Date**: 2026-07-29  
**Target Repository**: `apps/frontend/internal` (`ntc-edge-internal`)  
**Overall Risk Assessment**: **HIGH**

---

## Executive Summary & Verdict

- **Overall Verdict**: **REJECTED (Requires Remediation)**
- **Type Check Execution**: **FAILED** (Exit code 2; 15 TypeScript compilation errors identified)
- **Strict Type Safety (`any`, `as `, `!`)**: **PASSED** (0 `any` types, 0 `as` type assertions, 0 `!` non-null assertions)
- **Design Token Compliance (Hardcoded Colors)**: **FAILED** (Multiple hardcoded hex background colors found in screen/modal components)
- **Container Bounds (`maxWidth: 1200`)**: **PASSED** (100% compliance across all 9 core web/desktop feature screens)

---

## 1. Task 1: Type Check Execution

- **Command Executed**: `pnpm --filter ntc-edge-internal check-types` (invoking `tsc --noEmit` inside `apps/frontend/internal`)
- **Exit Code**: `2` (Failed)
- **Root Cause**: `src/navigation/types.ts` line 38 invokes `useReactNavigation<RootStackParamList>()` passing `RootStackParamList` instead of `NavigationProp<RootStackParamList>` or `NativeStackNavigationProp<RootStackParamList>`. This causes React Navigation's `useNavigation` hook to return a navigation object where `.navigate()` is typed as `never`.

### Verbatim TypeScript Error Log (15 Errors Captured)
```text
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

## 2. Task 2: AST & Code Pattern Search Findings

### A. Forbidden Token: `any` (Type Cast / Signature)
- **Status**: **PASSED (0 Violations)**
- **Audit Details**: Searched for regex `:\s*any\b|as\s+any\b|<any>|any\[\]` across all feature files in `apps/frontend/internal/src/features`. No TypeScript `any` types or type casts were found. Only English word usages in text strings/comments (e.g., `"NOT a member of any region"`, `"stop any running animation"`) were detected.

### B. Forbidden Token: `as ` (Type Assertions)
- **Status**: **PASSED (0 Type Assertion Violations)**
- **Audit Details**: Searched for pattern ` as ` across all screen files. All matches were restricted to valid import aliases (e.g., `import { Icon as Lucide }`, `import { AnnouncementsScreen as WebScreen }`) or const assertions (e.g., `"arrow-up-right" as const`). Zero unsafe type force-casts (`val as SomeType`) exist in target screen components.

### C. Forbidden Token: `!` (Non-Null Assertions)
- **Status**: **PASSED (0 Violations)**
- **Audit Details**: Searched for non-null assertions (`expr!`) across all target screen files. Zero non-null force assertions were detected.

### D. Forbidden Token: Hardcoded Hex Background Colors
- **Status**: **FAILED (Rule Violation)**
- **Audit Details**: Scanned all screen and component files for hardcoded hex colors assigned to `backgroundColor`. Found multiple hardcoded hex colors bypassing theme tokens:
  1. `src/features/feedback/screens/FeedbackScreen.web.tsx:107`: `{ backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }`
  2. `src/features/roles-permission/screens/RolesPermissionScreen.desktop.tsx:429`: `backgroundColor: '#0F172A'`
  3. `src/features/roles-permission/screens/RolesPermissionScreen.desktop.tsx:486`: `backgroundColor: '#FEF3C7'`
  4. `src/features/roles-permission/screens/RolesPermissionScreen.desktop.tsx:495`: `backgroundColor: '#D97706'`
  5. `src/features/roles-permission/screens/RolesPermissionScreen.web.tsx:431`: `backgroundColor: '#0F172A'`
  6. `src/features/roles-permission/screens/RolesPermissionScreen.web.tsx:488`: `backgroundColor: '#FEF3C7'`
  7. `src/features/roles-permission/screens/RolesPermissionScreen.web.tsx:497`: `backgroundColor: '#D97706'`
  8. `src/features/login/components/InternalLoginScreen.web.tsx:188-190`: `backgroundColor: '#EF4444'`, `#F59E0B`, `#10B981`
  9. `src/features/auth/components/EditAccountModal.tsx:510, 529, 590`: `backgroundColor: '#F1F5F9'`, `#EEF2FF`
  10. `src/features/employees/components/EmployeeFormModal.tsx:1299, 1320`: `backgroundColor: '#0F172A'`, `#1E293B`
  11. `src/features/login/components/RegionSelectionModal.tsx:383`: `backgroundColor: '#F8FAFC'`

### E. Web/Desktop Container Bounds (`maxWidth: 1200`)
- **Status**: **PASSED (100% Compliant across all 9 feature screens)**
- **Verification Summary**:
  1. `AnnouncementsScreen` (`AnnouncementsScreen.web.tsx:70`, `AnnouncementsScreen.desktop.tsx:70`) -> `maxWidth: 1200`
  2. `AuditLogsScreen` (`AuditLogsScreen.web.tsx:33`, `AuditLogsScreen.desktop.tsx:33`) -> `maxWidth: 1200`
  3. `DashboardScreen` (`DashboardScreen.web.tsx:254`, `DashboardScreen.desktop.tsx:236`) -> `maxWidth: 1200`
  4. `EmployeesScreen` (`EmployeesScreen.web.tsx:24`, `EmployeesScreen.desktop.tsx:24`) -> `maxWidth: 1200`
  5. `FeedbackScreen` (`FeedbackScreen.web.tsx:218`, `FeedbackScreen.desktop.tsx:218`) -> `maxWidth: 1200`
  6. `FormBuilderScreen` (`FormBuilderScreen.web.tsx:151`, `FormBuilderScreen.desktop.tsx:151`) -> `maxWidth: 1200`
  7. `RolesPermissionScreen` (`RolesPermissionScreen.web.tsx:422`, `RolesPermissionScreen.desktop.tsx:420`) -> `maxWidth: 1200`
  8. `SettingsScreen` / `AdminSettingsScreen` (`SettingsScreen.web.tsx:520`, `SettingsScreen.desktop.tsx:520`, `AdminSettingsScreen.web.tsx:260`, `AdminSettingsScreen.desktop.tsx:260`) -> `maxWidth: 1200`
  9. `UsersScreen` (`UsersScreen.web.tsx:24`, `UsersScreen.desktop.tsx:24`) -> `maxWidth: 1200`
  - *(Auth modal screens maintain `maxWidth: 440` in full accordance with responsive design guidelines)*

---

## 3. Stress Test Results Table

| Test Item | Target / Criteria | Result | Status |
|---|---|---|---|
| Type Check | `pnpm --filter ntc-edge-internal check-types` | Exit code 2 (15 TS errors in `LandingScreen`, `OnboardingScreen`, `SettingsScreen`) | ❌ FAIL |
| AST: `any` | No `any` type annotations / casts | 0 `any` types found | ✅ PASS |
| AST: `as ` | No `val as Type` assertions | 0 type assertions found | ✅ PASS |
| AST: `!` | No non-null assertions | 0 non-null assertions found | ✅ PASS |
| AST: Hardcoded Colors | No raw hex codes in `backgroundColor` | Hardcoded hex colors found in `FeedbackScreen.web`, `RolesPermissionScreen.desktop/web`, etc. | ❌ FAIL |
| Container Bounds | `maxWidth: 1200` on 9 web/desktop screen variants | Verified in 100% of 9 core screen feature pairs | ✅ PASS |

---

## 4. Required Remediation Steps

1. **Fix Navigation Helper Generic**: Update `apps/frontend/internal/src/navigation/types.ts` so `useAppNavigation` returns `useNavigation<NavigationProp<RootStackParamList>>()` or `useNavigation<NativeStackNavigationProp<RootStackParamList>>()`.
2. **Replace Hardcoded Hex Background Colors**: Replace raw hex strings (`#1E293B`, `#0F172A`, `#FEF3C7`, `#D97706`, `#F8FAFC`, etc.) in `FeedbackScreen.web.tsx`, `RolesPermissionScreen.desktop.tsx`, `RolesPermissionScreen.web.tsx`, and component modals with theme token properties (e.g., `colors.bg`, `colors.cardBg`, `COLORS...`).
