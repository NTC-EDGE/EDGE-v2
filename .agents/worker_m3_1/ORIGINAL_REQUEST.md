## 2026-07-29T14:07:11Z

<USER_REQUEST>
You are Worker 1 for Milestone 3 (Auth, Settings & Dashboard Screens Redesign — R4).
Your working directory is: c:\Users\User\projects\ustp\NTC-EDGE\.agents\worker_m3_1
Parent (Sub-Orchestrator) conversation ID: c3f8b7f1-51c5-48b5-a3a1-21db1d449981

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

OBJECTIVE & SCOPE:
Execute the full redesign of all Auth, Settings, and Dashboard screens in `apps/frontend/internal/src/features/` according to the blueprints prepared by the 3 Explorers:
- Auth Explorer analysis: `c:\Users\User\projects\ustp\NTC-EDGE\.agents\explorer_m3_1\analysis.md`
- Settings Explorer analysis: `c:\Users\User\projects\ustp\NTC-EDGE\.agents\explorer_m3_2\analysis.md`
- Dashboard Explorer analysis: `c:\Users\User\projects\ustp\NTC-EDGE\.agents\explorer_m3_3\analysis.md`

DETAILED TARGET SCREENS & WORK ITEMS:
1. **Auth Screens** (`apps/frontend/internal/src/features/login/`):
   - `LandingScreen`: Create `LandingScreen.native.tsx`, `LandingScreen.web.tsx`, `LandingScreen.desktop.tsx`, update master selector `LandingScreen.tsx`.
   - `ForgotPasswordScreen`: Create `ForgotPasswordScreen.native.tsx`, `ForgotPasswordScreen.web.tsx`, `ForgotPasswordScreen.desktop.tsx`, update master selector `ForgotPasswordScreen.tsx`.
   - `OnboardingScreen`: Create `OnboardingScreen.native.tsx`, `OnboardingScreen.web.tsx`, `OnboardingScreen.desktop.tsx`, update master selector `OnboardingScreen.tsx`.
   - `InternalLoginScreen`: Redesign `InternalLoginScreen.native.tsx`, `InternalLoginScreen.web.tsx`, `InternalLoginScreen.desktop.tsx`, master selector `InternalLoginScreen.tsx`, and `LoginForm.tsx`.
   - Fix type safety in `useForgotPasswordForm.ts`, `MfaOtpVerificationModal.tsx`, `LandingScreen.tsx`, `OnboardingScreen.tsx`.
   - Use `@edge/ui` `useTheme()` hook and themed colors (Slate 800/900 dark palette, Slate 50 light palette).
   - Enforce `maxWidth: 440` and `alignSelf: 'center'` across auth forms/modals.
   - Integrate `AnimatedCard` motion design for mount fade-in / slide-up animations.

2. **Settings Screens** (`apps/frontend/internal/src/features/settings/`):
   - `SettingsScreen`: Create `SettingsScreen.native.tsx`, `SettingsScreen.web.tsx`, `SettingsScreen.desktop.tsx`, update master selector `SettingsScreen.tsx`.
   - `AdminSettingsScreen`: Create `AdminSettingsScreen.native.tsx`, `AdminSettingsScreen.web.tsx`, `AdminSettingsScreen.desktop.tsx`, update master selector `AdminSettingsScreen.tsx`.
   - Wire appearance theme toggle directly to `setMode('dark')` / `setMode('light')`.
   - Apply `@edge/ui` `useTheme()` tokens, `maxWidth: 1200` container width with `alignSelf: 'center'`.
   - Integrate `SkeletonLoader` for loading states.
   - Eliminate all `as` type assertions (`as 'light'|'dark'`, `as EmailAddressResourceType`, etc.) and `any` types.

3. **Dashboard Screen** (`apps/frontend/internal/src/features/dashboard/`):
   - Redesign `DashboardScreen.native.tsx`, `DashboardScreen.web.tsx`, `DashboardScreen.desktop.tsx`, master selector `DashboardScreen.tsx`, and `MetricCard.tsx`.
   - Fix `maxWidth: 1600` cap in web and desktop variants to `maxWidth: 1200` with `alignSelf: 'center'`.
   - Apply `@edge/ui` `useTheme()` tokens, `AnimatedCard` mount/hover animations, `SkeletonLoader` placeholders.
   - Zero `any` types, zero `as` assertions, zero `!` assertions.
   - Preserve all metrics (124 pending, 852 approved, 42 rejected, 710 completed), data hooks (`useRole`), quick actions, velocity charts, activity streams, and telemetry status.

STRICT CONSTRAINTS & VERIFICATION:
- ZERO TypeScript errors: Run `npx tsc --noEmit` or `pnpm --filter ntc-edge-internal check-types` in `apps/frontend/internal` and ensure exit 0.
- ZERO `any` types, ZERO `as` assertions, ZERO `!` non-null assertions.
- Preserve all form logic (`react-hook-form` + `zodResolver`), API calls (`safeAsync`), Clerk auth, and navigation intact.

Deliver a detailed handoff report in `c:\Users\User\projects\ustp\NTC-EDGE\.agents\worker_m3_1\handoff.md` including build/tsc verification results. When finished, send a message to parent with summary and file path.
</USER_REQUEST>
