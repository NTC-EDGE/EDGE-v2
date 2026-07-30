## 2026-07-29T13:44:31Z
<USER_REQUEST>
You are a Worker subagent (teamwork_preview_worker).
Your working directory is: c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_worker_m1
Project Scope Document: c:\Users\User\projects\ustp\NTC-EDGE\.agents\orchestrator\PROJECT.md
Original Request: c:\Users\User\projects\ustp\NTC-EDGE\.agents\ORIGINAL_REQUEST.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASK: Implement Milestone 1 (Theme Infrastructure, UI Component Expansion, and Design System Documentation in `packages/ui/`).

Read the analysis and handoff blueprints prepared by Explorers:
- Theme Infrastructure: `c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_explorer_m1_1\analysis.md`
- Existing Components Refactoring: `c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_explorer_m1_2\analysis.md`
- New Components & Docs: `c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_explorer_m1_3\analysis.md`

INSTRUCTIONS:
1. **Theme Tokens & Types (`packages/ui/theme/`)**:
   - Update `packages/ui/theme/tokens.ts` with `LIGHT_COLORS` and `DARK_COLORS` (Slate 800/900 dark surfaces `#1E293B` / `#0F172A`, Slate 50/100 text, Focus Blue `#60A5FA` brand accent, semantic colors for both light and dark).
   - Create `packages/ui/theme/types.ts` defining `ThemeMode` (`'light' | 'dark' | 'system'`), `ThemeContextValue`, `ThemeColors`.
   - Create `packages/ui/theme/themeStorage.ts` for storage persistence using `@react-native-async-storage/async-storage` on native and `localStorage` on web with `typeof window !== 'undefined'` guard and strict type guard `isThemeMode(value)`.
   - Create `packages/ui/theme/ThemeProvider.tsx` and `useTheme()` hook in `packages/ui/theme/useTheme.ts` (or `ThemeProvider.tsx`). Handle system mode via React Native's `useColorScheme()`.

2. **Refactor Existing @edge/ui Components for Dark/Light Mode**:
   - Refactor `Button.tsx`, `FormFieldInput.tsx`, `AlertToast.tsx`, `Avatar.tsx`, `DataTable.tsx`, `StatusBadge.tsx`, `ServiceFormModal.tsx` to consume `useTheme()` dynamic `colors` palette.
   - Maintain 100% backward compatibility for component props and layout.

3. **Create 6 New Shared Components** in `packages/ui/components/`:
   - `SkeletonLoader.tsx`: Animated shimmer loading placeholder.
   - `AnimatedCard.tsx`: Card container with fade-in mount animation, elevation shadow, theme background.
   - `ThemeToggle.tsx`: Switcher control supporting segmented / icon views for 'light' | 'dark' | 'system'.
   - `PageHeader.tsx`: Title, subtitle, optional status badge, action buttons.
   - `EmptyState.tsx`: Illustrated placeholder for empty lists/tables with action button.
   - `SearchBar.tsx`: Search input with search icon, clear button, and debounced `onDebouncedChange`.

4. **Package Re-exports (`packages/ui/index.ts`)**:
   - Export ThemeProvider, useTheme, ThemeMode, ThemeContextValue, ThemeColors, themeStorage.
   - Export all 6 new components and existing updated components.

5. **Design System Documentation (`packages/ui/DESIGN_SYSTEM.md`)**:
   - Write comprehensive documentation covering tokens (light/dark), component APIs, ThemeProvider guide, platform variant conventions, screen creation guide, and visual consistency rules.

6. **Build & Verify**:
   - Run type checking / build commands for `packages/ui` and `apps/frontend/internal` (e.g. `npx tsc --noEmit` in `apps/frontend/internal` and `packages/ui`).
   - Document build/test commands and results in your handoff report.

STRICT CODE RULES:
- NO `as` type assertions! Use explicit type guards.
- NO `!` non-null assertions! Use explicit null checks.
- NO `any` types! Use explicit types or `unknown`.

Write your handoff report to `c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_worker_m1\handoff.md` and send a message when complete.
</USER_REQUEST>
