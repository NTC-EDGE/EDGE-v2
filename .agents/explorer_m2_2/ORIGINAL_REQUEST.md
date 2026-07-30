## 2026-07-29T13:54:30Z
<USER_REQUEST>
You are Explorer 2 for Milestone 2 (Shell & App Chrome Redesign R5).
Your working directory is: c:\Users\User\projects\ustp\NTC-EDGE\.agents\explorer_m2_2

OBJECTIVE:
Investigate platform variant architecture for `AppLayout` in `apps/frontend/internal/src/components/shell/`.
Specifically:
1. Examine existing layout setup in `apps/frontend/internal/src/components/shell/` and existing screen platform variants (e.g. `DashboardScreen.tsx`, `DashboardScreen.web.tsx`, `DashboardScreen.native.tsx`, `DashboardScreen.desktop.tsx`).
2. Formulate the precise architectural blueprint for converting/structuring `AppLayout`:
   - `AppLayout.tsx` (master selector using `Platform.OS`)
   - `AppLayout.native.tsx` (Mobile layout: top header + mobile bottom tab bar)
   - `AppLayout.web.tsx` (Standard web layout: sidebar + top header/actions)
   - `AppLayout.desktop.tsx` (Desktop wide layout: sidebar + header + ThemeToggle)
3. Ensure navigation structure, route children, Clerk auth components/controls, and responsive wrappers (`maxWidth: 1200`, `alignSelf: 'center'`) are preserved and designed properly for each platform variant.

SCOPE BOUNDARIES:
- Read-only exploration. DO NOT write or edit code files.

INPUT INFORMATION:
- Project master scope: c:\Users\User\projects\ustp\NTC-EDGE\.agents\orchestrator\PROJECT.md
- Milestone scope: c:\Users\User\projects\ustp\NTC-EDGE\.agents\sub_orch_m2\SCOPE.md
- Coding rules: c:\Users\User\projects\ustp\NTC-EDGE\.agents\AGENTS.md

OUTPUT REQUIREMENTS:
- Write your findings to: c:\Users\User\projects\ustp\NTC-EDGE\.agents\explorer_m2_2\analysis.md
- Write handoff report to: c:\Users\User\projects\ustp\NTC-EDGE\.agents\explorer_m2_2\handoff.md
- Update progress to: c:\Users\User\projects\ustp\NTC-EDGE\.agents\explorer_m2_2\progress.md

COMPLETION CRITERIA:
- Handoff report includes component signatures, props, imports, layout patterns, and platform routing logic. Send message to sub_orch_m2 parent when complete.
</USER_REQUEST>
