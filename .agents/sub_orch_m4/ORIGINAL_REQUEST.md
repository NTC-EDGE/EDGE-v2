# Original User Request

## 2026-07-29T14:03:58+08:00

You are the Sub-Orchestrator for Milestone 4 (Core Feature Screens Redesign — R4, R6).
Your working directory is: c:\Users\User\projects\ustp\NTC-EDGE\.agents\sub_orch_m4
Parent conversation ID: c5d64944-aa27-4f70-b7d4-71ffe05df816

MISSION & SCOPE:
Execute Milestone 4 to redesign all core feature screens in `apps/frontend/internal/src/features/` with an enterprise aesthetic, runtime dark/light theme awareness (`useTheme()`), 3 platform variants (.native.tsx, .web.tsx, .desktop.tsx) plus master selector (.tsx), motion design, and micro-interactions.

TARGET SCREENS:
1. Single-file screens requiring 3 platform variants + master selector:
   - `apps/frontend/internal/src/features/announcements/screens/AnnouncementsScreen.tsx`
   - `apps/frontend/internal/src/features/audit-logs/screens/AuditLogsScreen.tsx`
   - `apps/frontend/internal/src/features/feedback/screens/FeedbackScreen.tsx`
   - `apps/frontend/internal/src/features/form-builder/screens/FormBuilderScreen.tsx`
   - `apps/frontend/internal/src/features/queue/screens/ActivitiesScreen.tsx`
   - `apps/frontend/internal/src/features/queue/screens/ApplicationReviewScreen.tsx`
   - `apps/frontend/internal/src/features/roles-permission/screens/RolesPermissionScreen.tsx`
2. Existing variant screens requiring visual redesign:
   - `apps/frontend/internal/src/features/employees/screens/EmployeesScreen.tsx` (.native, .web, .desktop, .tsx)
   - `apps/frontend/internal/src/features/users/screens/UsersScreen.tsx` (.native, .web, .desktop, .tsx)

STRICT QUALITY & LAYOUT CONSTRAINTS:
- ZERO TypeScript errors (`npx tsc --noEmit` in `apps/frontend/internal`).
- ZERO `any` types, ZERO `as` type assertions, ZERO `!` non-null assertions.
- Use shared `@edge/ui` components (`PageHeader`, `DataTable`, `StatusBadge`, `SkeletonLoader`, `AnimatedCard`, `EmptyState`, `SearchBar`, `ThemeToggle`, `Button`, `FormFieldInput`).
- Full theme awareness via `@edge/ui` `useTheme()` hook.
- Layout constraints (`maxWidth: 1200`, `alignSelf: 'center'`).
- Motion design & micro-interactions: Screen mount fade-in/slide-up, press/hover feedback, skeleton loading placeholders, row highlight/badge pulse. Respect `reduceMotion`.
- Preserved functionality: Keep all state management, data tables, search/filter logic, API calls, and navigation intact.

ITERATION LOOP:
Apply Explorer (3) -> Worker (1) -> Reviewer (2) -> Challenger (2) -> Forensic Auditor (1) iteration loop.
When all gate criteria pass (clean tsc exit 0, no reviewer vetoes, challenger pass, auditor CLEAN), send a completion message to your parent (`c5d64944-aa27-4f70-b7d4-71ffe05df816`).

## 2026-07-29T14:37:14+08:00

You are the Sub-Orchestrator Successor (Gen 2) for Milestone 4 (Core Feature Screens Redesign).
Your working directory is: c:\Users\User\projects\ustp\NTC-EDGE\.agents\sub_orch_m4
Parent conversation ID: c5d64944-aa27-4f70-b7d4-71ffe05df816

TASK OBJECTIVE:
Resume work at c:\Users\User\projects\ustp\NTC-EDGE\.agents\sub_orch_m4. Read `handoff.md`, `BRIEFING.md`, `ORIGINAL_REQUEST.md`, `SCOPE.md`, and `progress.md` for current state.
Your parent is `c5d64944-aa27-4f70-b7d4-71ffe05df816` — use this ID for all escalation and status reporting (`send_message`).

NEXT STEPS FOR YOU (ITERATION 3):
1. Start your own 10-minute heartbeat cron (`schedule(CronExpression="*/10 * * * *")`).
2. Read Explorer 4's remediation roadmap in `c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_explorer_m4_4\analysis.md` and `handoff.md`.
3. Dispatch Worker 3 (`teamwork_preview_worker`) to implement the exact fixes (Navigation hook generics fix in `src/navigation/types.ts`, forbidden `as` assertions removal, `*Page` -> `*Screen` renaming, dynamic `useTheme()` palette token integration).
4. Verify Worker 3 completes `pnpm --filter ntc-edge-internal check-types` with exit code 0.
5. Dispatch Reviewers (2), Challengers (2), and Forensic Auditor (1) for Iteration 3 verification.
6. When all gate criteria pass, notify parent (`c5d64944-aa27-4f70-b7d4-71ffe05df816`).
