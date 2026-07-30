## 2026-07-29T22:32:42Z
You are Worker for Milestone 5 Remediation & Hardening.
Working directory: c:\Users\User\projects\ustp\NTC-EDGE\.agents\worker_m5_remediation

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Tasks:
1. Root ThemeProvider Integration:
   - Modify `apps/frontend/internal/App.tsx` to import `ThemeProvider` from `@edge/ui` and wrap the root application provider hierarchy with `<ThemeProvider>`.
2. Settings Screen ThemeToggle:
   - In `apps/frontend/internal/src/features/settings/screens/` (`SettingsScreen.native.tsx`, `SettingsScreen.web.tsx`, `SettingsScreen.desktop.tsx`), replace the binary `<Switch>` dark mode toggle with `@edge/ui`'s `<ThemeToggle>` component.
3. Mount Animations:
   - In `EmployeesScreen`, `UsersScreen`, and `ApplicationReviewScreen` (.native.tsx, .web.tsx, .desktop.tsx), wrap primary content cards or card lists with `<AnimatedCard>` from `@edge/ui` so entrance fade-in / slide-up mount animations occur smoothly.
4. SkeletonLoader vs ActivityIndicator Spinners:
   - Replace `<ActivityIndicator>` spinners with appropriate `<SkeletonLoader>` shape placeholders from `@edge/ui` during loading states in:
     - `AnnouncementsTab`
     - `AuditLogsTab`
     - `FeedbackTab`
     - `ServiceTreeConfigTab`
     - `RegionSelectionModal`
     - `RootNavigator` (if applicable for fallback view)
5. Zero Hardcoded Hex Colors & Theme Awareness:
   - Refactor hardcoded hex color literals (`#...`) in `packages/ui` (`AnimatedCard.tsx`, `Avatar.tsx`, `ThemeToggle.tsx`, `StatusBadge.tsx`) and across `apps/frontend/internal/src/` screens/components to use `useTheme()` palette colors (or `COLORS` tokens from `@edge/ui`).
6. TypeScript Verification:
   - Run `bun run check-types` in `apps/frontend/internal` and `bunx tsc --noEmit` in `packages/ui` to ensure 0 TypeScript compilation errors.
   - Verify ZERO `any` types and ZERO unsafe type assertions (`as`, `!`).

Write your progress to `c:\Users\User\projects\ustp\NTC-EDGE\.agents\worker_m5_remediation\progress.md` and deliver your handoff report to `c:\Users\User\projects\ustp\NTC-EDGE\.agents\worker_m5_remediation\handoff.md`. Send a message to parent (`018353f0-f2ec-4331-aced-e50cca3066b5`) when done.
