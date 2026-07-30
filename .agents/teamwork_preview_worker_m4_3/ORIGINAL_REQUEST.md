## 2026-07-29T14:37:28Z
<USER_REQUEST>
You are Worker 3 for Milestone 4 (Core Feature Screens Redesign).
Your working directory is: c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_worker_m4_3

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASK OBJECTIVE:
Implement the exact remediation fixes specified in Explorer 4's analysis report (`c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_explorer_m4_4\analysis.md`) to resolve all 15 TypeScript compilation errors, forbidden type assertions, naming violations, and static theme token gaps in `apps/frontend/internal`.

REMEDIATION ROADMAP (8 STEPS):
1. `apps/frontend/internal/src/navigation/types.ts`: Import `NavigationProp` from `@react-navigation/native`. Update `useAppNavigation()` to return `useReactNavigation<NavigationProp<RootStackParamList>>()`.
2. `apps/frontend/internal/src/features/auth/components/EditAccountModal.tsx`: Define `type EmailAddressResourceType = Awaited<ReturnType<UserResourceType['createEmailAddress']>>`. Remove `as EmailAddressResourceType` on L133. Replace hex backgrounds `#F1F5F9` & `#EEF2FF` with `COLORS.neutral[100]` & `COLORS.brand.light`.
3. `apps/frontend/internal/src/features/auth/context/AuthContext.tsx`: Type `extractStrategy(factor: unknown): MfaStrategy | undefined`. Remove `as MfaStrategy` on L219.
4. Rename `apps/frontend/internal/src/features/employees/components/EmployeeDetailsPage.tsx` -> `EmployeeDetailsScreen.tsx`. Rename component `EmployeeDetailsPage` -> `EmployeeDetailsScreen` and interface `EmployeeDetailsPageProps` -> `EmployeeDetailsScreenProps`. Update consumer import in `EmployeesScreenContent.tsx`.
5. Rename `apps/frontend/internal/src/features/users/components/UserDetailsPage.tsx` -> `UserDetailsScreen.tsx`. Rename component `UserDetailsPage` -> `UserDetailsScreen` and interface `UserDetailsPageProps` -> `UserDetailsScreenProps`. Update consumer import in `UsersScreenContent.tsx`.
6. `EmployeesScreenContent.tsx` & `UsersScreenContent.tsx`: Import `useTheme` from `@edge/ui`. Add `const { colors, isDark } = useTheme();` and bind dynamic palette tokens.
7. `FeedbackScreen.web.tsx`, `RolesPermissionScreen.desktop.tsx`, `RolesPermissionScreen.web.tsx`, `InternalLoginScreen.web.tsx`, `RegionSelectionModal.tsx`: Replace raw inline hex color strings with dynamic `colors` palette tokens (`colors.brand.light`, `colors.semantic.warningBg/warning/warningText`, `colors.semantic.error/warning/success`, `COLORS.neutral[...]`).
8. Run build/typecheck: Execute `cmd /c pnpm --filter ntc-edge-internal check-types` in `c:\Users\User\projects\ustp\NTC-EDGE` using run_command. Verify exit code 0 and 0 errors.

OUTPUT REQUIREMENTS:
Write `c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_worker_m4_3\handoff.md` with:
- Summary of all files modified/renamed
- Verification commands executed and exact terminal output / exit code
- Confirmation of zero TS errors and zero rule violations

When complete, call send_message to report your handoff path back to the orchestrator.
</USER_REQUEST>
