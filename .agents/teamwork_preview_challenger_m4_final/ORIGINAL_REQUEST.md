## 2026-07-29T14:52:51Z
Empirically test and stress-test all screen variants in `apps/frontend/internal/src/features/` (Milestone 3 & 4: Auth, Settings, Dashboard, Announcements, AuditLogs, Feedback, FormBuilder, Activities, ApplicationReview, RolesPermission, Employees, Users).
Test:
1. Platform selector routing logic on native, web, desktop platforms.
2. State preservation and form submission flow.
3. Theme switching (light <-> dark) without flicker or state loss.
4. TypeScript compilation (`npx tsc --noEmit` in `apps/frontend/internal`).
5. Absence of type assertion bypasses (`as`, `!`, `any`).
Report PASS or FAIL with empirical evidence table.
