## 2026-07-29T14:04:13Z
<USER_REQUEST>
You are teamwork_preview_explorer instance 2 for Milestone 4 (Core Feature Screens Redesign).
Your working directory is: c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_explorer_m4_2

TASK OBJECTIVE:
Explore and analyze the following single-file screens in `apps/frontend/internal/src/features/`:
1. `apps/frontend/internal/src/features/queue/screens/ActivitiesScreen.tsx`
2. `apps/frontend/internal/src/features/queue/screens/ApplicationReviewScreen.tsx`
3. `apps/frontend/internal/src/features/roles-permission/screens/RolesPermissionScreen.tsx`

REQUIREMENTS & CONSTRAINTS TO INVESTIGATE:
- Examine current codebase, props, state, API calls, hooks, handlers, navigation, and UI structure.
- Determine exact plan to split each single file into 3 platform variants (.native.tsx, .web.tsx, .desktop.tsx) + master selector (.tsx).
- Check `@edge/ui` component availability (PageHeader, DataTable, StatusBadge, SkeletonLoader, AnimatedCard, EmptyState, SearchBar, ThemeToggle, Button, FormFieldInput, etc.).
- Ensure theme awareness via `useTheme()` hook from `@edge/ui`.
- Enforce strict typing (ZERO `any`, ZERO `as`, ZERO `!`).
- Enforce web/desktop layout constraints (`maxWidth: 1200`, `alignSelf: 'center'`).
- Enforce motion design & micro-interactions (screen mount fade-in/slide-up, press/hover feedback, skeleton loading, reduceMotion check).
- Ensure 100% preservation of functional logic.

OUTPUT REQUIREMENT:
Write your full analysis and implementation strategy to `c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_explorer_m4_2\analysis.md` and `handoff.md`.
Send a completion message back to parent with key findings and file path.
</USER_REQUEST>
