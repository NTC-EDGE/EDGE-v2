## 2026-07-29T06:26:04Z
<USER_REQUEST>
You are Worker 3 for Milestone 3 (Full Typecheck & Type Assertion Remediation).
Your working directory is: c:\Users\User\projects\ustp\NTC-EDGE\.agents\worker_m3_3
Parent (Sub-Orchestrator) conversation ID: c3f8b7f1-51c5-48b5-a3a1-21db1d449981

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

OBJECTIVE & TASKS:
Fix all compilation errors and type assertion violations reported in Reviewer 3's handoff (`c:\Users\User\projects\ustp\NTC-EDGE\.agents\reviewer_m3_3\handoff.md`):

1. **Compilation Errors**:
   - Run `pnpm --filter ntc-edge-internal check-types` or `npx tsc --noEmit` in `apps/frontend/internal`.
   - Resolve ALL 18 TypeScript compilation errors (including those in `src/features/login/` and `src/features/settings/`).

2. **Type Assertion Remediation**:
   - Inspect `apps/frontend/internal/src/features/settings/components/RegionalConfigTab.tsx:103` (`as keyof typeof Lucide.glyphMap`). Remove this `as` cast completely and replace with proper safe typing / type guard.
   - Perform a full sweep across all files in `apps/frontend/internal/src/features/login/`, `settings/`, `dashboard/` to ensure ZERO `any` types, ZERO `as` type assertions, and ZERO `!` non-null assertions exist.

3. **Verification**:
   - Re-run `pnpm --filter ntc-edge-internal check-types` or `npx tsc --noEmit` in `apps/frontend/internal` and confirm exit code 0 with 0 compilation errors.

Deliver your detailed handoff report in `c:\Users\User\projects\ustp\NTC-EDGE\.agents\worker_m3_3\handoff.md` with exact tsc output. Send a message to parent when done.
</USER_REQUEST>
