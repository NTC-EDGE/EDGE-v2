## 2026-07-29T14:05:57Z
You are teamwork_preview_worker for Milestone 4 (Core Feature Screens Redesign).
Your working directory is: c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_worker_m4_1

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASK OBJECTIVE:
Implement Milestone 4 core feature screens redesign in `apps/frontend/internal/src/features/` according to the Explorer analysis reports:
1. `c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_explorer_m4_1\analysis.md`
2. `c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_explorer_m4_2\analysis.md`
3. `c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_explorer_m4_3\analysis.md`

TARGET SCREENS TO REDESIGN & SPLIT:
1. Single-file screens requiring 3 platform variants (.native.tsx, .web.tsx, .desktop.tsx) + master selector (.tsx):
   - `apps/frontend/internal/src/features/announcements/screens/AnnouncementsScreen.tsx`
   - `apps/frontend/internal/src/features/audit-logs/screens/AuditLogsScreen.tsx`
   - `apps/frontend/internal/src/features/feedback/screens/FeedbackScreen.tsx`
   - `apps/frontend/internal/src/features/form-builder/screens/FormBuilderScreen.tsx`
   - `apps/frontend/internal/src/features/queue/screens/ActivitiesScreen.tsx`
   - `apps/frontend/internal/src/features/queue/screens/ApplicationReviewScreen.tsx`
   - `apps/frontend/internal/src/features/roles-permission/screens/RolesPermissionScreen.tsx`
2. Existing variant screens requiring visual & architectural redesign:
   - `apps/frontend/internal/src/features/employees/screens/EmployeesScreen.tsx` (.native, .web, .desktop, .tsx)
   - `apps/frontend/internal/src/features/users/screens/UsersScreen.tsx` (.native, .web, .desktop, .tsx)

STRICT QUALITY & CONSTRAINTS:
- Run `pnpm --filter ntc-edge-internal check-types` (or `npx tsc --noEmit` in `apps/frontend/internal`) to ensure ZERO TypeScript compilation errors.
- ZERO `any` types, ZERO `as` type assertions, ZERO `!` non-null assertions across all modified/created files and related modals. (Specifically fix `any` in `EmployeeFormModal.tsx:199`, remove `as` assertions in `EmployeesScreenContent.tsx`, and remove `as unknown as object` in `ApplicationReviewScreen.tsx:1795`).
- Use shared `@edge/ui` components (`PageHeader`, `DataTable`, `StatusBadge`, `SkeletonLoader`, `AnimatedCard`, `EmptyState`, `SearchBar`, `ThemeToggle`, `Button`, `FormFieldInput`).
- Full theme awareness via `@edge/ui` `useTheme()` hook.
- Layout constraints (`maxWidth: 1200`, `alignSelf: 'center'`).
- Motion design & micro-interactions: Screen mount fade-in/slide-up, press/hover feedback, skeleton loading placeholders, row highlight/badge pulse. Respect `reduceMotion`.
- Preserved functionality: Keep all state management, data tables, search/filter logic, API calls, and navigation intact.

VERIFICATION:
- Execute `pnpm --filter ntc-edge-internal check-types` command to verify build/type-check passes.
- Document exact execution commands, outputs, and created/modified file list in `c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_worker_m4_1\handoff.md`.
- Send a completion message back to parent when finished.
