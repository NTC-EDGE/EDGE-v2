# Milestone 1: Theme Infrastructure & Tokens — Blueprint & Analysis Report

**Target Workspace**: `packages/ui`  
**Author**: Explorer Subagent (`teamwork_preview_explorer`)  
**Date**: July 29, 2026  
**Status**: Read-Only Analysis & Design Complete  

---

## 1. Executive Summary

This document provides the complete architecture and design blueprint for **Milestone 1 (Theme Infrastructure & Tokens)** in `@edge/ui`.

The theme system introduces:
- A strongly-typed runtime **`ThemeProvider`** and **`useTheme()`** hook supporting `'light' | 'dark' | 'system'` modes.
- **Cross-platform persistence** using `@react-native-async-storage/async-storage` on native platforms (iOS/Android) and `localStorage` on Web, with full SSR/web safety checks.
- **Automatic OS scheme synchronization** via React Native's `useColorScheme()`.
- Refined **Light & Dark mode color token palettes** utilizing Slate 800 (`#1E293B`) / 900 (`#0F172A`) backgrounds, Slate 50 (`#F8FAFC`) / 100 (`#F1F5F9`) typography, adjusted Focus Blue (`#60A5FA`) brand accent, and high-contrast semantic dark tokens.
- **Strict monorepo compliance**: zero `any`, zero type assertions (`as`), zero non-null assertions (`!`), and explicit custom type guards (`isThemeMode`).

---

## 2. Current State Analysis of `packages/ui`

### 2.1 File Structure & Export Map
The `@edge/ui` package is structured as a shared component library supporting Expo / React Native and React Native Web.

```
packages/ui/
├── index.ts                     # Main entry exports
├── package.json                 # Monorepo dependencies & script targets
├── tsconfig.json                # TypeScript config
├── theme/
│   └── tokens.ts                # Static color, spacing, typography, shadow tokens
├── components/
│   ├── AlertToast.tsx           # Toast feedback notifications
│   ├── Avatar.tsx              # User avatar component
│   ├── Button.tsx               # Enterprise button with variant/size props
│   └── FormFieldInput.tsx       # Text input form field wrapper
├── tables/
│   ├── DataTable.tsx            # TanStack table wrapper with tabs & search
│   └── StatusBadge.tsx          # Status indicator pill
├── client/
│   └── ServiceFormModal.tsx     # Client service modal wrapper
└── navigation/
    └── linking.ts               # Deep linking helper
```

### 2.2 Existing `tokens.ts` Inspection
Currently, `packages/ui/theme/tokens.ts` exports static constants:
- `COLORS`: Brand palette (`#0B1953` to `#60A5FA`), Slate neutral scale (white to `#0F172A`), semantic colors (`#10B981`, `#F59E0B`, `#EF4444`, `#06B6D4`), and static canvas background `#F8FAFC`.
- `SPACING`: Scale from 4 to 64.
- `RADIUS`: Standardized radii for inputs (`8`), buttons (`8`), cards (`12`), modals (`16`), circles (`9999`).
- `SHADOWS`: Soft web and native elevation constants (`card`, `modal`).
- `TYPOGRAPHY`: Font families, font sizes, font weights (`regular: '400'`, `bold: '700'`).

### 2.3 Component Theme Usage Analysis
Inspection of existing components (`Button.tsx`, `FormFieldInput.tsx`, `AlertToast.tsx`, `DataTable.tsx`, `StatusBadge.tsx`) reveals:
1. **Hardcoded Light Mode Hex Colors**: Components directly reference static `COLORS.neutral` or hardcoded hex strings (e.g. `backgroundColor: '#1E3A8A'`, `color: '#FFFFFF'`).
2. **Lack of Dynamic Dark Mode Support**: Components do not currently consume a dynamic theme context.
3. **Opportunity**: Introducing `useTheme()` in `packages/ui` will allow all present and future UI components to seamlessly switch colors based on `isDark` or `colors`.

---

## 3. Theme Infrastructure Contract & Types Blueprint

### 3.1 Interface Specifications

In alignment with `PROJECT.md` contracts and monorepo standards, the theme system exports the following core types in `packages/ui/theme/types.ts` (or `tokens.ts`):

```ts
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeBackgroundColors {
  primary: string;
  secondary: string;
  tertiary: string;
  card: string;
  modal: string;
  input: string;
}

export interface ThemeTextColors {
  primary: string;
  secondary: string;
  muted: string;
  inverse: string;
}

export interface ThemeBorderColors {
  default: string;
  subtle: string;
  strong: string;
  focus: string;
}

export interface ThemeBrandColors {
  primary: string;
  secondary: string;
  accent: string;
  focus: string;
  dark: string;
  light: string;
}

export interface ThemeSemanticGroup {
  main: string;
  bg: string;
  border: string;
  text: string;
}

export interface ThemeSemanticColors {
  success: ThemeSemanticGroup;
  warning: ThemeSemanticGroup;
  error: ThemeSemanticGroup;
  info: ThemeSemanticGroup;
}

export interface ThemeColors {
  bg: ThemeBackgroundColors;
  text: ThemeTextColors;
  border: ThemeBorderColors;
  brand: ThemeBrandColors;
  semantic: ThemeSemanticColors;
}

export interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
  isDark: boolean;
}
```

---

## 4. Light & Dark Color Palette Token Blueprint

### 4.1 `LIGHT_COLORS` Palette Definition

```ts
export const LIGHT_COLORS: ThemeColors = {
  bg: {
    primary: '#F8FAFC',    // Slate 50 (canvas)
    secondary: '#FFFFFF',  // Pure white (card/surface)
    tertiary: '#F1F5F9',   // Slate 100 (muted container)
    card: '#FFFFFF',
    modal: '#FFFFFF',
    input: '#FFFFFF',
  },
  text: {
    primary: '#0F172A',    // Slate 900
    secondary: '#475569',  // Slate 600
    muted: '#94A3B8',      // Slate 400
    inverse: '#FFFFFF',
  },
  border: {
    default: '#E2E8F0',    // Slate 200
    subtle: '#F1F5F9',     // Slate 100
    strong: '#CBD5E1',     // Slate 300
    focus: '#60A5FA',      // Focus Blue
  },
  brand: {
    primary: '#1E3A8A',    // Executive Blue 800
    secondary: '#2563EB',  // Accent Blue 700
    accent: '#3B82F6',     // Highlight Blue 600
    focus: '#60A5FA',      // Focus Blue
    dark: '#0B1953',       // Navy 900
    light: '#EFF6FF',      // Blue 50
  },
  semantic: {
    success: {
      main: '#10B981',     // Emerald 500
      bg: '#ECFDF5',       // Emerald 50
      border: '#A7F3D0',   // Emerald 200
      text: '#065F46',     // Emerald 800
    },
    warning: {
      main: '#F59E0B',     // Amber 500
      bg: '#FEF3C7',       // Amber 50
      border: '#FDE68A',   // Amber 200
      text: '#92400E',     // Amber 800
    },
    error: {
      main: '#EF4444',     // Red 500
      bg: '#FEF2F2',       // Red 50
      border: '#FCA5A5',   // Red 200
      text: '#991B1B',     // Red 800
    },
    info: {
      main: '#06B6D4',     // Cyan 500
      bg: '#ECFEFF',       // Cyan 50
      border: '#A5F3FC',   // Cyan 200
      text: '#155E75',     // Cyan 800
    },
  },
};
```

### 4.2 `DARK_COLORS` Palette Definition

```ts
export const DARK_COLORS: ThemeColors = {
  bg: {
    primary: '#0F172A',    // Slate 900 (dark canvas)
    secondary: '#1E293B',  // Slate 800 (card/surface background)
    tertiary: '#334155',   // Slate 700 (elevated/hover background)
    card: '#1E293B',       // Slate 800
    modal: '#1E293B',      // Slate 800
    input: '#0F172A',      // Slate 900 (deep input canvas)
  },
  text: {
    primary: '#F8FAFC',    // Slate 50
    secondary: '#CBD5E1',  // Slate 300
    muted: '#94A3B8',      // Slate 400
    inverse: '#0F172A',    // Slate 900
  },
  border: {
    default: '#334155',    // Slate 700
    subtle: '#1E293B',     // Slate 800
    strong: '#475569',     // Slate 600
    focus: '#60A5FA',      // Focus Blue
  },
  brand: {
    primary: '#60A5FA',    // Focus Blue (bright on dark canvas)
    secondary: '#3B82F6',  // Brand 600
    accent: '#2563EB',     // Brand 700
    focus: '#93C5FD',      // Blue 300
    dark: '#1E3A8A',       // Brand 800
    light: '#1E293B',      // Dark slate container
  },
  semantic: {
    success: {
      main: '#34D399',     // Emerald 400
      bg: '#022C22',       // Emerald 950 (deep dark green)
      border: '#065F46',   // Emerald 800
      text: '#A7F3D0',     // Emerald 200
    },
    warning: {
      main: '#FBBF24',     // Amber 400
      bg: '#451A03',       // Amber 950 (deep dark amber)
      border: '#78350F',   // Amber 800
      text: '#FDE68A',     // Amber 200
    },
    error: {
      main: '#F87171',     // Red 400
      bg: '#450A0A',       // Red 950 (deep dark red)
      border: '#7F1D1D',   // Red 900
      text: '#FCA5A5',     // Red 200
    },
    info: {
      main: '#38BDF8',     // Sky 400
      bg: '#082F49',       // Sky 950 (deep dark blue/cyan)
      border: '#075985',   // Sky 800
      text: '#BAE6FD',     // Sky 200
    },
  },
};
```

---

## 5. Cross-Platform Persistence & Storage Blueprint

### 5.1 Monorepo Type Safety Rule
Per user rules:
- **No Type Assertions**: Avoid `saved as ThemeMode`.
- **Strict Runtime Type Guards**: Implement custom type guard `isThemeMode(value: string | null): value is ThemeMode`.

### 5.2 Storage Utility (`themeStorage.ts`)

```ts
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode } from './types';

const THEME_STORAGE_KEY = '@edge/ui/theme_mode';

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

export const themeStorage = {
  async getMode(): Promise<ThemeMode | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage !== undefined) {
          const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
          if (isThemeMode(raw)) {
            return raw;
          }
        }
        return null;
      } else {
        const raw = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (isThemeMode(raw)) {
          return raw;
        }
        return null;
      }
    } catch {
      return null;
    }
  },

  async setMode(mode: ThemeMode): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage !== undefined) {
          window.localStorage.setItem(THEME_STORAGE_KEY, mode);
        }
      } else {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      }
    } catch {
      // Gracefully capture storage permission error without throwing
    }
  },
};
```

---

## 6. Runtime `ThemeProvider` & `useTheme()` Hook Blueprint

### 6.1 `ThemeProvider` Component (`packages/ui/theme/ThemeProvider.tsx`)

```ts
import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import type { ThemeMode, ThemeContextValue } from './types';
import { LIGHT_COLORS, DARK_COLORS } from './tokens';
import { themeStorage } from './themeStorage';

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}

export function ThemeProvider({ children, initialMode = 'system' }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode);
  const systemScheme = useColorScheme();

  useEffect(() => {
    let isMounted = true;
    async function loadPersistedMode() {
      const savedMode = await themeStorage.getMode();
      if (isMounted && savedMode !== null) {
        setModeState(savedMode);
      }
    }
    loadPersistedMode();
    return () => {
      isMounted = false;
    };
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    themeStorage.setMode(newMode);
  }, []);

  const isDark = useMemo(() => {
    if (mode === 'system') {
      return systemScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemScheme]);

  const colors = useMemo(() => {
    return isDark ? DARK_COLORS : LIGHT_COLORS;
  }, [isDark]);

  const contextValue = useMemo<ThemeContextValue>(() => ({
    mode,
    setMode,
    colors,
    isDark,
  }), [mode, setMode, colors, isDark]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 6.2 `useTheme()` Hook (`packages/ui/theme/useTheme.ts`)

```ts
import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';
import type { ThemeContextValue } from './types';

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null || context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

---

## 7. App Integration & Component Usage Blueprint

### 7.1 Wrapping Applications (`apps/frontend/internal`)
To wrap the Expo app, `ThemeProvider` will be added to `apps/frontend/internal/src/app/_layout.tsx` (or root component):

```tsx
import { ThemeProvider } from '@edge/ui';

export default function RootLayout() {
  return (
    <ThemeProvider initialMode="system">
      <AppContent />
    </ThemeProvider>
  );
}
```

### 7.2 Component Adaptation Example (`Button.tsx`)
Components in `@edge/ui` can consume `useTheme()` for dynamic colors while preserving explicit prop overrides:

```tsx
import { useTheme } from '../theme/useTheme';

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  const { colors, isDark } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.brand.primary };
      case 'secondary':
        return { backgroundColor: colors.bg.tertiary };
      case 'outline':
        return { backgroundColor: colors.bg.secondary, borderColor: colors.border.strong };
      default:
        return { backgroundColor: colors.brand.primary };
    }
  };

  // ...
}
```

---

## 8. Package Export & Dependency Blueprint

### 8.1 Updates to `packages/ui/package.json`
`@react-native-async-storage/async-storage` must be declared under `dependencies` or `peerDependencies`:

```json
  "dependencies": {
    "@react-native-async-storage/async-storage": "^2.1.2",
    "@clerk/expo": "^3.2.0",
    "@expo/vector-icons": "^15.0.2",
    ...
  }
```

### 8.2 Updates to `packages/ui/index.ts`
Export all new theme components, types, and hooks:

```ts
export * from './theme/tokens';
export * from './theme/types';
export * from './theme/themeStorage';
export * from './theme/ThemeProvider';
export * from './theme/useTheme';
```

---

## 9. Verification & Invalidation Conditions

1. **Verification Command**:
   - `bun run --filter @edge/ui build` or `bun --filter ntc-edge-internal check-types` (`npx tsc --noEmit`)
2. **Manual Inspection**:
   - Verify context value contains `mode`, `setMode`, `colors`, `isDark`.
   - Verify storage persists across app restarts (web `localStorage` and native `AsyncStorage`).
   - Verify `useColorScheme()` auto-switches theme when `mode === 'system'`.
3. **Invalidation Conditions**:
   - Adding unsafe type casting (`as ThemeMode`, `context!`).
   - Missing dark mode semantic background contrast.
   - Breaking SSR / Web compatibility with raw `localStorage` calls without `typeof window !== 'undefined'`.
