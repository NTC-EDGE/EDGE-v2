# Scope: Milestone 3 (Auth, Settings & Dashboard Screens Redesign — R4)

## Architecture & Goals
Redesign all Auth, Settings, and Dashboard screens in `apps/frontend/internal/src/features/` with:
1. Enterprise aesthetic and runtime dark/light theme awareness (`useTheme()` hook from `@edge/ui`, Slate 800/900 dark palette, Slate 50 light palette).
2. Platform variants: `.native.tsx`, `.web.tsx`, `.desktop.tsx` plus master selector `.tsx` for every screen component.
3. Motion design: Mount fade-in/slide-up animations, smooth hover/press feedback, skeleton placeholders while keeping `reduceMotion` respected.
4. Strict quality standards: ZERO TypeScript errors (`npx tsc --noEmit` in `apps/frontend/internal`), ZERO `any` types, ZERO `as` type assertions, ZERO `!` non-null assertions.
5. Mobile-first layout constraints: `maxWidth: 440` on auth forms/modals, `maxWidth: 1200` on dashboard/settings, combined with `alignSelf: 'center'`.
6. Preserved functionality: Preserve all form logic, API calls (`safeAsync`), react-hook-form + zodResolver, Clerk auth, and navigation intact.

## Target Screens Detail
1. Auth screens (`apps/frontend/internal/src/features/login/components/`):
   - `LandingScreen.tsx` (master selector + create .native.tsx, .web.tsx, .desktop.tsx)
   - `ForgotPasswordScreen.tsx` (master selector + create .native.tsx, .web.tsx, .desktop.tsx)
   - `OnboardingScreen.tsx` (master selector + create .native.tsx, .web.tsx, .desktop.tsx)
   - `InternalLoginScreen.tsx` (redesign existing variants .native.tsx, .web.tsx, .desktop.tsx & master selector .tsx)
2. Settings screens (`apps/frontend/internal/src/features/settings/screens/`):
   - `SettingsScreen.tsx` (master selector + create .native.tsx, .web.tsx, .desktop.tsx)
   - `AdminSettingsScreen.tsx` (master selector + create .native.tsx, .web.tsx, .desktop.tsx)
3. Dashboard screen (`apps/frontend/internal/src/features/dashboard/screens/`):
   - `DashboardScreen.tsx` (redesign existing variants .native.tsx, .web.tsx, .desktop.tsx & master selector .tsx)

## Milestones & Status
| # | Name | Scope | Status |
|---|------|-------|--------|
| 1 | Auth Screens Redesign | Landing, ForgotPassword, Onboarding, InternalLogin screens | IN_PROGRESS |
| 2 | Settings Screens Redesign | Settings, AdminSettings screens | PLANNED |
| 3 | Dashboard Screen Redesign | DashboardScreen | PLANNED |
| 4 | Verification & Audit | TSC zero errors, Reviewer pass, Challenger pass, Forensic Auditor CLEAN | PLANNED |
