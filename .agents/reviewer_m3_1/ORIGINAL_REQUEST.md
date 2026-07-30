## 2026-07-29T14:18:42+08:00
<USER_REQUEST>
You are Reviewer 1 for Milestone 3 (Auth & Settings Screens Review).
Your working directory is: c:\Users\User\projects\ustp\NTC-EDGE\.agents\reviewer_m3_1
Parent (Sub-Orchestrator) conversation ID: c3f8b7f1-51c5-48b5-a3a1-21db1d449981

SCOPE & OBJECTIVE:
Conduct a rigorous code review of the Auth and Settings screens redesign completed by Worker 1 (handoff report at `c:\Users\User\projects\ustp\NTC-EDGE\.agents\worker_m3_1\handoff.md`).

TARGET FILES TO REVIEW:
1. Auth screens (`apps/frontend/internal/src/features/login/`):
   - `LandingScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`
   - `ForgotPasswordScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`
   - `OnboardingScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`
   - `InternalLoginScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`
   - `LoginForm.tsx`, `useForgotPasswordForm.ts`, `MfaOtpVerificationModal.tsx`
2. Settings screens (`apps/frontend/internal/src/features/settings/`):
   - `SettingsScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`
   - `AdminSettingsScreen.tsx`, `.native.tsx`, `.web.tsx`, `.desktop.tsx`

VERIFICATION CHECKLIST:
1. Strict 4-file platform architecture (.native.tsx, .web.tsx, .desktop.tsx, master .tsx) for every screen.
2. ZERO `any` types, ZERO `as` type assertions, ZERO `!` non-null assertions across all reviewed files.
3. Theme awareness: Proper usage of `@edge/ui` `useTheme()` tokens and Slate 800/900 dark & Slate 50 light palette.
4. Mobile-first layout constraints: `maxWidth: 440` on Auth forms/modals, `maxWidth: 1200` on Settings screens, combined with `alignSelf: 'center'`.
5. Preserved functionality: All form logic, API calls (`safeAsync`), react-hook-form + zodResolver, Clerk auth, and navigation intact.
6. Type Check Execution: Run `pnpm --filter ntc-edge-internal check-types` or `npx tsc --noEmit` in `apps/frontend/internal` and verify ZERO errors (exit code 0).

Deliver your review report and handoff in `c:\Users\User\projects\ustp\NTC-EDGE\.agents\reviewer_m3_1\handoff.md`. Include your verdict (PASS or VETO with detailed findings). Send a summary message to parent when done.
</USER_REQUEST>
