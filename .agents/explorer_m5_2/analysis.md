# Screen Feature Audit Report — Internal App (`apps/frontend/internal/src/`)

**Auditor:** Explorer 2 (Milestone 5 E2E Verification & Hardening)  
**Date:** 2026-07-29  
**Scope:** All 16 Screen Features in `apps/frontend/internal/src/`

---

## Executive Summary

An audit of all 16 screen feature modules in the internal Expo/TypeScript app (`apps/frontend/internal/src/`) was conducted. All 16 feature modules strictly comply with:
1. **4 Platform Files Requirement**: All 4 platform variants (`.native.tsx`, `.web.tsx`, `.desktop.tsx`, `.tsx`) exist for every screen feature (64 files total across 16 screens).
2. **Master Selector Pattern**: Every master selector `.tsx` strictly adheres to the standard `Platform.OS` conditional render pattern.
3. **Desktop Web Overstretch Protection**: `maxWidth` constraints (440px for auth/onboarding/modal screens, 1200px for dashboard/lists/tables/settings screens) along with `alignSelf: 'center'` (or container centering) are properly applied across all `.web.tsx` views.
4. **Business Logic & API Preservation**: All existing state hooks (`react-hook-form`, custom hooks, Clerk auth, MediatR/REST API hooks via `@edge/api`), context bindings, and user interactions are 100% intact.

---

## Audit Matrix (16 Screen Features)

| # | Screen Feature | Master Selector Path | 4 Variant Files Exist? | Platform.OS Standard? | Desktop `maxWidth` Applied? | Business Logic Preserved? |
|---|---|---|---|---|---|---|
| 1 | **Dashboard** | `features/dashboard/screens/DashboardScreen.tsx` | YES (4/4) | YES | YES (`maxWidth: 1200`, `alignSelf: 'center'`) | YES |
| 2 | **Employees** | `features/employees/screens/EmployeesScreen.tsx` | YES (4/4) | YES | YES (`maxWidth: 1200`, `alignSelf: 'center'`) | YES |
| 3 | **InternalLogin** | `features/login/components/InternalLoginScreen.tsx` | YES (4/4) | YES | YES (`maxWidth: 440`, `alignSelf: 'center'`) | YES |
| 4 | **Landing** | `features/login/components/LandingScreen.tsx` | YES (4/4) | YES | YES (`maxWidth: 440`, `alignSelf: 'center'`) | YES |
| 5 | **ForgotPassword** | `features/login/components/ForgotPasswordScreen.tsx` | YES (4/4) | YES | YES (`maxWidth: 440`, `alignSelf: 'center'`) | YES |
| 6 | **Onboarding** | `features/login/components/OnboardingScreen.tsx` | YES (4/4) | YES | YES (`maxWidth: 440`, `alignSelf: 'center'`) | YES |
| 7 | **Users** | `features/users/screens/UsersScreen.tsx` | YES (4/4) | YES | YES (`maxWidth: 1200`, `alignSelf: 'center'`) | YES |
| 8 | **Announcements** | `features/announcements/screens/AnnouncementsScreen.tsx` | YES (4/4) | YES | YES (`maxWidth: 1200`, `alignSelf: 'center'`) | YES |
| 9 | **AuditLogs** | `features/audit-logs/screens/AuditLogsScreen.tsx` | YES (4/4) | YES | YES (`maxWidth: 1200`, `alignSelf: 'center'`) | YES |
| 10 | **Feedback** | `features/feedback/screens/FeedbackScreen.tsx` | YES (4/4) | YES | YES (`maxWidth: 1200`, `alignSelf: 'center'`) | YES |
| 11 | **FormBuilder** | `features/form-builder/screens/FormBuilderScreen.tsx` | YES (4/4) | YES | YES (`maxWidth: 1200`, `alignSelf: 'center'`) | YES |
| 12 | **Activities** | `features/queue/screens/ActivitiesScreen.tsx` | YES (4/4) | YES | YES (`maxWidth: 1200`, `alignSelf: 'center'`) | YES |
| 13 | **ApplicationReview** | `features/queue/screens/ApplicationReviewScreen.tsx` | YES (4/4) | YES | YES (`maxWidth: 1200`, `alignSelf: 'center'`) | YES |
| 14 | **RolesPermission** | `features/roles-permission/screens/RolesPermissionScreen.tsx` | YES (4/4) | YES | YES (`maxWidth: 1200`, `alignSelf: 'center'`) | YES |
| 15 | **Settings** | `features/settings/screens/SettingsScreen.tsx` | YES (4/4) | YES | YES (`maxWidth: 1200`, `alignSelf: 'center'`) | YES |
| 16 | **AdminSettings** | `features/settings/screens/AdminSettingsScreen.tsx` | YES (4/4) | YES | YES (`maxWidth: 1200`, `alignSelf: 'center'`) | YES |

---

## Detailed Findings per Feature

### 1. Dashboard (`features/dashboard/screens/DashboardScreen`)
- **Variant Files**: `DashboardScreen.tsx`, `DashboardScreen.native.tsx`, `DashboardScreen.web.tsx`, `DashboardScreen.desktop.tsx` (All 4 present).
- **Master Selector**: Matches standard `Platform.OS` pattern:
  ```tsx
  if (Platform.OS === "web") return <WebScreen />;
  if (Platform.OS === "macos" || Platform.OS === "windows") return <DesktopScreen />;
  return <NativeScreen />;
  ```
- **Desktop Web Constraint**: `maxWidth: 1200`, `alignSelf: "center"` applied at `DashboardScreen.web.tsx:341-343`.
- **Business Logic**: Preserved (`useRole`, `useTheme`, metric calculation, time range filters).

### 2. Employees (`features/employees/screens/EmployeesScreen`)
- **Variant Files**: `EmployeesScreen.tsx`, `EmployeesScreen.native.tsx`, `EmployeesScreen.web.tsx`, `EmployeesScreen.desktop.tsx` (All 4 present).
- **Master Selector**: Matches standard `Platform.OS` pattern.
- **Desktop Web Constraint**: `maxWidth: 1200`, `alignSelf: 'center'` applied at `EmployeesScreen.web.tsx:24-25`.
- **Business Logic**: Preserved (`EmployeesScreenContent` delegate intact).

### 3. InternalLogin (`features/login/components/InternalLoginScreen`)
- **Variant Files**: `InternalLoginScreen.tsx`, `InternalLoginScreen.native.tsx`, `InternalLoginScreen.web.tsx`, `InternalLoginScreen.desktop.tsx` (All 4 present).
- **Master Selector**: Matches standard `Platform.OS` pattern.
- **Desktop Web Constraint**: Auth 440px constraint applied at `InternalLoginScreen.web.tsx:422-424` (`heroRightCol`: `maxWidth: 440`, `alignSelf: 'center'`), line 291 (`toastWrapper`: `maxWidth: 440`), line 518 (`modalCard`: `maxWidth: 440`).
- **Business Logic**: Preserved (`useLoginForm`, `LoginForm`, `ForgotPasswordScreen` state toggle, policy modal).

### 4. Landing (`features/login/components/LandingScreen`)
- **Variant Files**: `LandingScreen.tsx`, `LandingScreen.native.tsx`, `LandingScreen.web.tsx`, `LandingScreen.desktop.tsx` (All 4 present).
- **Master Selector**: Matches standard `Platform.OS` pattern.
- **Desktop Web Constraint**: Auth/Landing 440px constraint applied at `LandingScreen.web.tsx:139-140` (`maxWidth: 440`, `alignSelf: "center"`).
- **Business Logic**: Preserved (`useAppNavigation`, Onboarding/Login navigation handlers).

### 5. ForgotPassword (`features/login/components/ForgotPasswordScreen`)
- **Variant Files**: `ForgotPasswordScreen.tsx`, `ForgotPasswordScreen.native.tsx`, `ForgotPasswordScreen.web.tsx`, `ForgotPasswordScreen.desktop.tsx` (All 4 present).
- **Master Selector**: Matches standard `Platform.OS` pattern with props passthrough (`props: ForgotPasswordScreenProps`).
- **Desktop Web Constraint**: Auth 440px constraint applied at `ForgotPasswordScreen.web.tsx:156-158` (`maxWidth: 440`, `alignSelf: "center"`).
- **Business Logic**: Preserved (`useForgotPasswordForm`, multi-step request/reset/success forms).

### 6. Onboarding (`features/login/components/OnboardingScreen`)
- **Variant Files**: `OnboardingScreen.tsx`, `OnboardingScreen.native.tsx`, `OnboardingScreen.web.tsx`, `OnboardingScreen.desktop.tsx` (All 4 present).
- **Master Selector**: Matches standard `Platform.OS` pattern.
- **Desktop Web Constraint**: Auth 440px constraint applied at `OnboardingScreen.web.tsx:138-139` (`maxWidth: 440`, `alignSelf: "center"`).
- **Business Logic**: Preserved (`ONBOARDING_STEPS`, pagination indicators, skip & step state).

### 7. Users (`features/users/screens/UsersScreen`)
- **Variant Files**: `UsersScreen.tsx`, `UsersScreen.native.tsx`, `UsersScreen.web.tsx`, `UsersScreen.desktop.tsx` (All 4 present).
- **Master Selector**: Matches standard `Platform.OS` pattern.
- **Desktop Web Constraint**: `maxWidth: 1200`, `alignSelf: 'center'` applied at `UsersScreen.web.tsx:24-25`.
- **Business Logic**: Preserved (`UsersScreenContent` delegate intact).

### 8. Announcements (`features/announcements/screens/AnnouncementsScreen`)
- **Variant Files**: `AnnouncementsScreen.tsx`, `AnnouncementsScreen.native.tsx`, `AnnouncementsScreen.web.tsx`, `AnnouncementsScreen.desktop.tsx` (All 4 present).
- **Master Selector**: Matches standard `Platform.OS` pattern.
- **Desktop Web Constraint**: `maxWidth: 1200`, `alignSelf: 'center'` applied at `AnnouncementsScreen.web.tsx:70-71`.
- **Business Logic**: Preserved (`AnnouncementsTab`, deletion modal state).

### 9. AuditLogs (`features/audit-logs/screens/AuditLogsScreen`)
- **Variant Files**: `AuditLogsScreen.tsx`, `AuditLogsScreen.native.tsx`, `AuditLogsScreen.web.tsx`, `AuditLogsScreen.desktop.tsx` (All 4 present).
- **Master Selector**: Matches standard `Platform.OS` pattern.
- **Desktop Web Constraint**: `maxWidth: 1200`, `alignSelf: 'center'` applied at `AuditLogsScreen.web.tsx:33-34`.
- **Business Logic**: Preserved (`AuditLogsTab` delegate intact).

### 10. Feedback (`features/feedback/screens/FeedbackScreen`)
- **Variant Files**: `FeedbackScreen.tsx`, `FeedbackScreen.native.tsx`, `FeedbackScreen.web.tsx`, `FeedbackScreen.desktop.tsx` (All 4 present).
- **Master Selector**: Matches standard `Platform.OS` pattern.
- **Desktop Web Constraint**: `maxWidth: 1200`, `alignSelf: 'center'` applied at `FeedbackScreen.web.tsx:218-219`.
- **Business Logic**: Preserved (`useFeedbackState`, rating filters, stats calculations, delete modal).

### 11. FormBuilder (`features/form-builder/screens/FormBuilderScreen`)
- **Variant Files**: `FormBuilderScreen.tsx`, `FormBuilderScreen.native.tsx`, `FormBuilderScreen.web.tsx`, `FormBuilderScreen.desktop.tsx` (All 4 present).
- **Master Selector**: Matches standard `Platform.OS` pattern.
- **Desktop Web Constraint**: `maxWidth: 1200`, `alignSelf: 'center'` applied at `FormBuilderScreen.web.tsx:151-152`.
- **Business Logic**: Preserved (`useAdminForms` API integration, `VisualFormBuilderModal`, `AdminSettingsModal`).

### 12. Activities (`features/queue/screens/ActivitiesScreen`)
- **Variant Files**: `ActivitiesScreen.tsx`, `ActivitiesScreen.native.tsx`, `ActivitiesScreen.web.tsx`, `ActivitiesScreen.desktop.tsx` (All 4 present).
- **Master Selector**: Matches standard `Platform.OS` pattern.
- **Desktop Web Constraint**: `maxWidth: 1200`, `alignSelf: 'center'` applied at `ActivitiesScreen.web.tsx:77, 84`.
- **Business Logic**: Preserved (`ApplicationProvider`, `useApplications`, split-screen responsiveness, `ApplicationReviewScreen` delegation).

### 13. ApplicationReview (`features/queue/screens/ApplicationReviewScreen`)
- **Variant Files**: `ApplicationReviewScreen.tsx`, `ApplicationReviewScreen.native.tsx`, `ApplicationReviewScreen.web.tsx`, `ApplicationReviewScreen.desktop.tsx` (All 4 present).
- **Master Selector**: Matches standard `Platform.OS` pattern with props passthrough (`props: ApplicationReviewScreenProps`).
- **Desktop Web Constraint**: `maxWidth: 1200`, `alignSelf: 'center'` applied at `ApplicationReviewScreen.web.tsx:23-24`.
- **Business Logic**: Preserved (`ApplicationReviewScreenContent` delegate with collapse and close props).

### 14. RolesPermission (`features/roles-permission/screens/RolesPermissionScreen`)
- **Variant Files**: `RolesPermissionScreen.tsx`, `RolesPermissionScreen.native.tsx`, `RolesPermissionScreen.web.tsx`, `RolesPermissionScreen.desktop.tsx` (All 4 present).
- **Master Selector**: Matches standard `Platform.OS` pattern.
- **Desktop Web Constraint**: `maxWidth: 1200`, `alignSelf: 'center'` applied at `RolesPermissionScreen.web.tsx:423-424`.
- **Business Logic**: Preserved (`useAdminRoles`, `useRolePermissions`, `usePermissionsCatalog`, `apiClient` assign/revoke API calls, role management modals).

### 15. Settings (`features/settings/screens/SettingsScreen`)
- **Variant Files**: `SettingsScreen.tsx`, `SettingsScreen.native.tsx`, `SettingsScreen.web.tsx`, `SettingsScreen.desktop.tsx` (All 4 present).
- **Master Selector**: Matches standard `Platform.OS` pattern.
- **Desktop Web Constraint**: `maxWidth: 1200`, `alignSelf: "center"` applied at `SettingsScreen.web.tsx:520-521`.
- **Business Logic**: Preserved (`useAuthContext`, `useRole`, `useTheme`, Clerk profile & password updates, password strength calculations).

### 16. AdminSettings (`features/settings/screens/AdminSettingsScreen`)
- **Variant Files**: `AdminSettingsScreen.tsx`, `AdminSettingsScreen.native.tsx`, `AdminSettingsScreen.web.tsx`, `AdminSettingsScreen.desktop.tsx` (All 4 present).
- **Master Selector**: Matches standard `Platform.OS` pattern.
- **Desktop Web Constraint**: `maxWidth: 1200`, `alignSelf: "center"` applied at `AdminSettingsScreen.web.tsx:260-261`.
- **Business Logic**: Preserved (`useRegions`, `useAdminFieldOffices`, `useAdminRequirements`, `useAdminFees`, `useAdminNotes`, tab state, branch office management).

---

## Conclusion
All 16 internal application screens fully satisfy the 4-layer architecture, platform variant split, master selector standard, desktop web layout responsiveness constraints, and business logic preservation requirements.
