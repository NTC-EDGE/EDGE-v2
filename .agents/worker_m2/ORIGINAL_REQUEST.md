## 2026-07-29T05:56:06Z
<USER_REQUEST>
You are Worker for Milestone 2 (Shell & App Chrome Redesign R5).
Your working directory is: c:\Users\User\projects\ustp\NTC-EDGE\.agents\worker_m2

TASK:
Implement the complete visual redesign and platform variant architecture for Shell & App Chrome components in `apps/frontend/internal/src/features/shell/components/`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

REQUIREMENTS & INSTRUCTIONS:
1. **AppLayout Platform Variants**:
   - `AppLayout.tsx`: Master selector using `Platform.OS` (`web` -> `WebLayout`, `windows`/`macos` -> `DesktopLayout`, default -> `NativeLayout`).
   - `AppLayout.native.tsx`: Mobile view (SafeAreaView, top Header with hamburger button, animated drawer Sidebar with backdrop overlay, main content, MobileBottomTabBar).
   - `AppLayout.web.tsx`: Web view (top Header with logo, notifications, profile, role switcher, settings, logout; responsive left Sidebar; StandardPageWrapper content area with `maxWidth: 1600` / `1200` + `alignSelf: 'center'`).
   - `AppLayout.desktop.tsx`: Desktop wide view (custom window title bar `#0B132B` with control dots + title; top Header with `@edge/ui` `ThemeToggle`; permanent left Sidebar; main content area; bottom workstation status bar `#0F172A`).
2. **Sidebar**:
   - Refactor `Sidebar.tsx` (and related items) to consume `useTheme()` from `@edge/ui`. Apply dynamic dark/light surface tokens (`colors.cardBg`, `colors.bg`, `colors.border`, `colors.text`).
   - Embed `<ThemeToggle variant="segmented" size="sm" />` in the sidebar footer.
   - Maintain 100% existing navigation structure and Clerk auth controls.
3. **MobileBottomTabBar**:
   - Refactor `MobileBottomTabBar.tsx` to consume `useTheme()`.
   - FIX TYPE INVIOLABILITY: Replace `icon: any;` with `ComponentProps<typeof Icon>['name']` (or Feather icon name type).
4. **StandardPageWrapper**:
   - Refactor `StandardPageWrapper.tsx` to consume `useTheme()`, paint canvas `colors.bg`, apply mount fade-in animation, and integrate with `PageHeader` from `@edge/ui`.
5. **Strict Code & Compilation Rules**:
   - 0 `as` type assertions, 0 `!` non-null assertions, 0 `any` types.
   - Run `npx tsc --noEmit` in `apps/frontend/internal` and verify ZERO compilation errors.

INPUT INFORMATION:
- Milestone scope: c:\Users\User\projects\ustp\NTC-EDGE\.agents\sub_orch_m2\SCOPE.md
- Coding rules: c:\Users\User\projects\ustp\NTC-EDGE\.agents\AGENTS.md
- Explorer 1 Handoff: c:\Users\User\projects\ustp\NTC-EDGE\.agents\explorer_m2_1\handoff.md
- Explorer 2 Handoff: c:\Users\User\projects\ustp\NTC-EDGE\.agents\explorer_m2_2\handoff.md
- Explorer 3 Handoff: c:\Users\User\projects\ustp\NTC-EDGE\.agents\explorer_m2_3\handoff.md

OUTPUT REQUIREMENTS:
- Write implementation changes summary to: c:\Users\User\projects\ustp\NTC-EDGE\.agents\worker_m2\changes.md
- Write handoff report to: c:\Users\User\projects\ustp\NTC-EDGE\.agents\worker_m2\handoff.md
- Update progress to: c:\Users\User\projects\ustp\NTC-EDGE\.agents\worker_m2\progress.md

COMPLETION CRITERIA:
- Handoff report contains build and typecheck results (`npx tsc --noEmit` clean exit 0), file diff summary, and verification instructions. Send message to sub_orch_m2 parent when complete.
</USER_REQUEST>
