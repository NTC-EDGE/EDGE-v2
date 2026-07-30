## 2026-07-29T13:49:57Z

You are a Worker subagent (teamwork_preview_worker).
Your working directory is: c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_worker_m1_fix1
Project Scope Document: c:\Users\User\projects\ustp\NTC-EDGE\.agents\orchestrator\PROJECT.md
Original Request: c:\Users\User\projects\ustp\NTC-EDGE\.agents\ORIGINAL_REQUEST.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASK:
Implement Milestone 1 Remediation Fixes in `packages/ui/` based on the Remediation Blueprint:
`c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_explorer_m1_fix1\analysis.md`

INSTRUCTIONS:
1. **Fix `packages/ui` TypeScript Compilation Error**:
   - Update `packages/ui/react-native.d.ts` to add `declare const process: { env: Record<string, string | undefined> };` (or ambient declaration) so that TS2591 error `Cannot find name 'process'` in `navigation/linking.ts` is eliminated.
   - Run `npx tsc --noEmit` in `packages/ui` AND `apps/frontend/internal` to verify BOTH pass with Exit Code 0 and 0 errors!

2. **Fix `SearchBar` Clear Button Double Invocation**:
   - In `packages/ui/components/SearchBar.tsx`, prevent double invocation of `onDebouncedChange('')` on clear by clearing any pending debounce timer and using a ref/flag guard during clear.

3. **Fix `SkeletonLoader` & `AnimatedCard` Reduced Motion**:
   - In `SkeletonLoader.tsx` and `AnimatedCard.tsx`, add `AccessibilityInfo.isReduceMotionEnabled()` check (and listener). If reduced motion is enabled, disable looping shimmer / mount slide animations and render clean static placeholders.

4. **Fix `AnimatedCard` Press Feedback & Web Shadow**:
   - In `AnimatedCard.tsx`, add press feedback (`({ pressed }) => [...]` with active opacity / scale drop on press when `onPress` is passed).
   - Ensure web dark mode cards render an explicit web `boxShadow` or border style for dark mode surfaces.

STRICT CODE RULES:
- NO `as` type assertions! Use explicit type guards or ambient declarations.
- NO `!` non-null assertions!
- NO `any` types!

VERIFICATION:
Run `npx tsc --noEmit` in `packages/ui` AND in `apps/frontend/internal`. Both MUST exit 0 with 0 errors.

Write your handoff report to `c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_worker_m1_fix1\handoff.md` and send a message when complete.
