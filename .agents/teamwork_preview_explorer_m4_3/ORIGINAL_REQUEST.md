## 2026-07-29T06:04:13Z
You are teamwork_preview_explorer instance 3 for Milestone 4 (Core Feature Screens Redesign).
Your working directory is: c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_explorer_m4_3

TASK OBJECTIVE:
Explore and analyze existing variant screens and shared `@edge/ui` integration across all 9 target features in `apps/frontend/internal/src/features/`:
1. Existing variant screens visual redesign:
   - `apps/frontend/internal/src/features/employees/screens/EmployeesScreen.tsx` (.native, .web, .desktop, .tsx)
   - `apps/frontend/internal/src/features/users/screens/UsersScreen.tsx` (.native, .web, .desktop, .tsx)
2. `@edge/ui` component catalog & pattern audit across `packages/ui` / `@edge/ui`:
   - Verify export names and usage patterns of PageHeader, DataTable, StatusBadge, SkeletonLoader, AnimatedCard, EmptyState, SearchBar, ThemeToggle, Button, FormFieldInput, useTheme, etc.
   - Check TypeScript compilation rules and existing linting/type-check setup (`npx tsc --noEmit` in `apps/frontend/internal`).

REQUIREMENTS & CONSTRAINTS TO INVESTIGATE:
- Analyze existing Employees & Users variants (.native, .web, .desktop, .tsx), identify what needs visual redesign, layout refinement, theme awareness (`useTheme()`), motion design, and code cleanup.
- Check `@edge/ui` exports and ensure all target screens import from `@edge/ui` properly without missing props or broken types.
- Check workspace type-check status (`npx tsc --noEmit` in `apps/frontend/internal`) to locate any existing type issues before implementation.
- Enforce strict typing (ZERO `any`, ZERO `as`, ZERO `!`).
- Enforce web/desktop layout constraints (`maxWidth: 1200`, `alignSelf: 'center'`).
- Enforce motion design & micro-interactions.

OUTPUT REQUIREMENT:
Write your full analysis and implementation strategy to `c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_explorer_m4_3\analysis.md` and `handoff.md`.
Send a completion message back to parent with key findings and file path.
