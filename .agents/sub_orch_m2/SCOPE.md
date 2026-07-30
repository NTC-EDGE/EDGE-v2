# Scope: Milestone 2 — Shell & App Chrome Redesign (R5)

## Objective
Redesign the app chrome and shell components in `apps/frontend/internal/src/components/shell/` to match the new enterprise aesthetic and support dark/light modes using `useTheme()` from `@edge/ui`.

## Components & Platform Variants
1. **AppLayout**:
   - `AppLayout.tsx` — Master selector using `Platform.OS` routing.
   - `AppLayout.native.tsx` — Mobile viewports (MobileBottomTabBar + top header).
   - `AppLayout.web.tsx` — Standard web browser layout (Sidebar + top nav).
   - `AppLayout.desktop.tsx` — Desktop wide layout (Sidebar + header actions + ThemeToggle).
2. **Sidebar**:
   - Redesign with dark/light mode surface tokens (`colors.neutral.white` / Slate 800/900).
   - Embed `ThemeToggle` component from `@edge/ui`.
   - Maintain existing navigation items and Clerk auth controls.
3. **MobileBottomTabBar**:
   - Redesign with themed background and active/inactive icon colors.
4. **StandardPageWrapper**:
   - Theme-aware page container with `PageHeader` integration and mount fade-in animation.

## Status
- Milestone 2: Shell & App Chrome Redesign (R5) — **DONE** (All checks passed, 0 tsc errors, 0 type assertions/any, Forensic Auditor CLEAN)

## Key Constraints
- Preserve 100% existing navigation structure and Clerk auth functionality.
- Strict code rules: 0 `as`, 0 `!`, 0 `any`.
- Zero TypeScript compilation errors (`npx tsc --noEmit` in `apps/frontend/internal`).
- Must pass Explorer -> Worker -> Reviewer -> Challenger -> Auditor cycle.

