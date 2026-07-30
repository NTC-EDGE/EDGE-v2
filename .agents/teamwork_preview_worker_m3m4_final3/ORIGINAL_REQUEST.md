## 2026-07-29T07:00:22Z
Perform final completion, theme token compliance, naming convention compliance, and zero-error typecheck hardening for Milestones 3 & 4 in `apps/frontend/internal/`:

1. **Navigation Types (`src/navigation/types.ts`)**:
   - Fix `useAppNavigation()` in `apps/frontend/internal/src/navigation/types.ts` so that it returns cleanly typed navigation without `never` type errors during `npx tsc --noEmit`.

2. **Strict Code Rules & Naming Standards Compliance**:
   - Rename any component files named `*Page.tsx` to `*Screen.tsx` (e.g. `EmployeeDetailsPage.tsx` -> `EmployeeDetailsScreen.tsx`, `UserDetailsPage.tsx` -> `UserDetailsScreen.tsx`) and update all import statements.
   - Audit and remove any `as` value type assertions, `!` non-null assertions, or `any` types in `apps/frontend/internal/src/` (e.g., in `EditAccountModal.tsx`, `AuthContext.tsx`, or any screen files).

3. **Platform Variants & Theme Token Integration**:
   - Ensure every screen in `apps/frontend/internal/src/features/` has 3 platform variants (.native.tsx, .web.tsx, .desktop.tsx) plus master selector (.tsx) and consumes `useTheme()` dynamic tokens from `@edge/ui` for dark/light mode awareness:
     - Auth: LandingScreen, InternalLoginScreen, ForgotPasswordScreen, OnboardingScreen
     - Settings: SettingsScreen, AdminSettingsScreen
     - Dashboard: DashboardScreen
     - Features: AnnouncementsScreen, AuditLogsScreen, FeedbackScreen, FormBuilderScreen, ActivitiesScreen, ApplicationReviewScreen, RolesPermissionScreen, EmployeesScreen, UsersScreen
   - Ensure mobile-first `maxWidth` constraints (440px for auth/forms/modals, 1200px for dashboards/grids).
   - Preserve 100% existing functionality, form logic, API calls, hooks, schemas, and navigation.

4. **Type Check Hardening**:
   - Run `node node_modules/typescript/lib/tsc.js --noEmit` in `apps/frontend/internal` AND in `packages/ui`.
   - BOTH MUST PASS with Exit Code 0 and 0 errors.

Write your handoff report to `c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_worker_m3m4_final3\handoff.md` and send a message when complete.
