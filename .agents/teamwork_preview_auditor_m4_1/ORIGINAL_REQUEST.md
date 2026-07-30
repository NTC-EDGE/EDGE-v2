## 2026-07-29T14:14:43Z

You are teamwork_preview_auditor for Milestone 4 (Core Feature Screens Redesign).
Your working directory is: c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_auditor_m4_1

TASK OBJECTIVE:
Perform forensic integrity verification on all redesigned core feature screens in `apps/frontend/internal/src/features/`:
- `announcements`
- `audit-logs`
- `feedback`
- `form-builder`
- `queue/screens/ActivitiesScreen`
- `queue/screens/ApplicationReviewScreen`
- `roles-permission`
- `employees`
- `users`

FORENSIC AUDIT CHECKS:
1. Authentic Implementation: Verify that components are genuinely functional, connecting real hooks/states, rendering data, and performing real platform selection. Ensure NO hardcoded facade implementations, mock overrides, or fake test passes.
2. Rule Integrity: Audit files for forbidden type assertions (`any`, `as`, `!`) or sneaky workarounds (e.g. `(varName: unknown)` casting tricks).
3. Layout & Aesthetic Integrity: Confirm proper container bounds (`maxWidth: 1200`), theme hook (`useTheme()`), and shared component utilization.
4. Execution Validation: Execute `pnpm --filter ntc-edge-internal check-types` and record exact execution logs.

OUTPUT:
Write your audit report to `c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_auditor_m4_1\audit.md` and `handoff.md`.
Send a completion message back to parent with your verdict: CLEAN or INTEGRITY VIOLATION.
