# Original User Request

## 2026-07-29T13:54:15Z
Orchestrate and execute Milestone 2 (Shell & App Chrome Redesign R5):
- AppLayout (.native.tsx, .web.tsx, .desktop.tsx, .tsx master selector)
- Sidebar (with ThemeToggle integration)
- MobileBottomTabBar
- StandardPageWrapper

Follow the iteration loop: Explorer -> Worker -> Reviewer -> Challenger -> Auditor.
Ensure 0 `as`, 0 `!`, 0 `any`, and 0 TypeScript errors (`npx tsc --noEmit` in apps/frontend/internal).
Send status messages to parent when milestones complete or when help is needed.
