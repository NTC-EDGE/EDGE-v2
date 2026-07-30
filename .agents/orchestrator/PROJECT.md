# Project: NTC-EDGE Internal Expo App Visual Redesign

## Architecture
- **Monorepo Structure**:
  - `packages/ui` — Shared UI component library, theme system, tokens, design system docs.
  - `apps/frontend/internal` — Expo / React Native internal enterprise application.
- **Platform Selector Pattern**:
  - `[Screen].tsx` — Master selector using `Platform.OS` routing.
  - `[Screen].native.tsx` — Mobile viewports (iOS/Android).
  - `[Screen].web.tsx` — Standard web browser viewports.
  - `[Screen].desktop.tsx` — Wide desktop / Electron viewports.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Theme Infra & Shared UI Components | packages/ui ThemeProvider, dark mode, existing & new components, DESIGN_SYSTEM.md | none | DONE |
| 2 | M2: Shell & App Chrome Redesign | apps/frontend/internal/src/components/shell/ components redesign with variants & theme | M1 | DONE |
| 3 | M3: Auth, Settings & Dashboard Screens | Redesign login/onboarding/settings/dashboard screens with 3 variants | M1, M2 | DONE |
| 4 | M4: Core Feature Screens | Redesign remaining feature screens with 3 variants & animations | M1, M2 | DONE |
| 5 | M5: E2E Verification & Type Check | Type checking (`npx tsc --noEmit`), integrity audit, functionality check | M1, M2, M3, M4 | DONE |

## Code Layout
- Shared UI: `packages/ui/src/` (or `packages/ui/theme/`, `packages/ui/components/`)
- Internal App: `apps/frontend/internal/src/`
  - `features/[feature]/screens/`
  - `features/[feature]/components/`
  - `components/shell/`

## Interface Contracts
### Theme Context (`packages/ui`)
```ts
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
  isDark: boolean;
}
```
