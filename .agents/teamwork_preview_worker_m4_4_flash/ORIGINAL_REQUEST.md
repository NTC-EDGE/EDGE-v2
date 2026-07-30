## 2026-07-29T07:00:11Z
<USER_REQUEST>
You are Worker 4 for Milestone 4 Remediation.
Your working directory is: c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_worker_m4_4_flash

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASK OBJECTIVE:
Remediate the remaining code quality and naming items identified by Reviewer 5 in `apps/frontend/internal`.

REMEDIATION STEPS:
1. `apps/frontend/internal/src/features/queue/components/ActivitiesFeedPane.tsx`:
   Remove all 6 `as ApplicationCategory` type assertions (lines 56-81). Define typed category mappings or narrow types explicitly without using `as`.
2. `apps/frontend/internal/src/features/queue/components/modals/EndorseModal.tsx`:
   Remove `as 'briefcase'` type assertion on line 88. Use explicit type check / type guard for icon property.
3. `apps/frontend/internal/src/features/shell/components/StandardPageWrapper.tsx`:
   Rename file to `StandardScreenWrapper.tsx`. Rename component `StandardPageWrapper` -> `StandardScreenWrapper` and props interface `StandardPageWrapperProps` -> `StandardScreenWrapperProps`. Update all imports and usages across `apps/frontend/internal/src/`.
4. Run build/typecheck: Execute `cmd /c pnpm --filter ntc-edge-internal check-types` in `c:\Users\User\projects\ustp\NTC-EDGE` using run_command. Verify exit code 0 and 0 errors.

OUTPUT REQUIREMENTS:
Write `c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_worker_m4_4_flash\handoff.md` with:
- List of modified and renamed files
- Verification command executed and exact terminal output / exit code 0
- Confirmation of zero TS errors and zero rule violations

When complete, call send_message to report your handoff path back to the orchestrator.
</USER_REQUEST>
