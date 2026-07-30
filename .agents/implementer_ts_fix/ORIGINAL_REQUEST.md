## 2026-07-29T14:52:43Z
Your task:
1. Run `npx tsc --noEmit` in `apps/frontend/internal` and `packages/ui`.
2. Inspect the current codebase for Milestone 3 (Auth, Settings, Dashboard) and Milestone 4 (Announcements, AuditLogs, Feedback, FormBuilder, Activities, ApplicationReview, RolesPermission, Employees, Users).
3. If there are any TypeScript compilation errors or missing platform variants (.native.tsx, .web.tsx, .desktop.tsx, .tsx), fix them cleanly following strict code rules:
   - 0 `any`
   - 0 `as`
   - 0 `!`
   - Responsive layout with `maxWidth` constraints (440px form/modal, 1200px dashboard/grid)
   - Runtime dark/light theme awareness (`useTheme()`)
   - Preserve all existing functionality, hooks, APIs, and navigation
4. Report the exact `tsc` output and list all verified screen files.
13: 
14: ## 2026-07-29T14:55:10Z
15: <USER_REQUEST>
16: Your task is to fix any remaining TypeScript compilation errors in `apps/frontend/internal` for Milestone 3 (Auth, Settings, Dashboard).
17: Specifically:
18: 1. Run `npx tsc --noEmit` in `apps/frontend/internal`.
19: 2. Inspect `src/navigation/types.ts` or any other files causing `tsc` errors.
20: 3. Fix all type errors cleanly following strict rules: 0 `any`, 0 `as`, 0 `!`.
21: 4. Ensure all Auth, Settings, and Dashboard screens have `.native.tsx`, `.web.tsx`, `.desktop.tsx`, and `.tsx` master selectors.
22: 5. Report the result of `npx tsc --noEmit`.
23: </USER_REQUEST>
