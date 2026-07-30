# Original User Request

## Initial Request — 2026-07-29T14:03:58+08:00

You are the Sub-Orchestrator for Milestone 3 (Auth, Settings & Dashboard Screens Redesign — R4).
Your working directory is: c:\Users\User\projects\ustp\NTC-EDGE\.agents\sub_orch_m3
Parent conversation ID: c5d64944-aa27-4f70-b7d4-71ffe05df816

MISSION & SCOPE:
Execute Milestone 3 to redesign all Auth, Settings, and Dashboard screens in `apps/frontend/internal/src/features/` with an enterprise aesthetic, runtime dark/light theme awareness (`useTheme()`), 3 platform variants (.native.tsx, .web.tsx, .desktop.tsx) plus master selector (.tsx), and motion design.

TARGET SCREENS:
1. Auth screens:
   - `apps/frontend/internal/src/features/login/components/LandingScreen.tsx` (create variants)
   - `apps/frontend/internal/src/features/login/components/ForgotPasswordScreen.tsx` (create variants)
   - `apps/frontend/internal/src/features/login/components/OnboardingScreen.tsx` (create variants)
   - `apps/frontend/internal/src/features/login/components/InternalLoginScreen.tsx` (redesign existing variants)
2. Settings screens:
   - `apps/frontend/internal/src/features/settings/screens/SettingsScreen.tsx` (create variants)
   - `apps/frontend/internal/src/features/settings/screens/AdminSettingsScreen.tsx` (create variants)
3. Dashboard screen:
   - `apps/frontend/internal/src/features/dashboard/screens/DashboardScreen.tsx` (redesign existing variants)

STRICT QUALITY & LAYOUT CONSTRAINTS:
- ZERO TypeScript errors (`npx tsc --noEmit` in `apps/frontend/internal`).
- ZERO `any` types, ZERO `as` type assertions, ZERO `!` non-null assertions.
- Theme awareness: Use `@edge/ui` `useTheme()` hook and themed colors (Slate 800/900 dark palette, Slate 50 light palette).
- Mobile-first layout rules: `maxWidth: 440` on auth forms/modals, `maxWidth: 1200` on dashboard/settings, combined with `alignSelf: 'center'`.
- Motion design: Mount fade-in/slide-up animations, smooth hover/press feedback, skeleton placeholders. Respect `reduceMotion`.
- Preserved functionality: Keep all form logic, API calls (`safeAsync`), react-hook-form + zodResolver, Clerk auth, and navigation intact.

ITERATION LOOP:
Apply Explorer (3) -> Worker (1) -> Reviewer (2) -> Challenger (2) -> Forensic Auditor (1) iteration loop.
When all gate criteria pass (clean tsc exit 0, no reviewer vetoes, challenger pass, auditor CLEAN), send a completion message to your parent (`c5d64944-aa27-4f70-b7d4-71ffe05df816`).
