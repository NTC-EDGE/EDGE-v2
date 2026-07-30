# NTC-EDGE Design System Documentation

Welcome to the **NTC-EDGE Shared Design System** documentation. This design system powers all mobile, web, and desktop frontend surfaces in the monorepo via `@edge/ui`.

---

## 1. Core Principles & Philosophy

1. **Monorepo Cohesion**: All shared UI components, design tokens, icons, and theme providers reside strictly inside `packages/ui/`.
2. **Runtime Dynamic Theme Switchability**: Seamless support for `'light'`, `'dark'`, and `'system'` modes with zero visual artifacts or layout shifts.
3. **Strict Type Safety**: Monorepo-wide enforcement of **0 type assertions (`as`)**, **0 non-null assertions (`!`)**, and **0 `any` types**. All components use explicit type guards and runtime checks.
4. **Mobile-First & Responsive Layouts**: Every UI component is built mobile-first and adapts cleanly up to wide desktop viewports using dynamic `maxWidth` constraints (e.g. 440px for auth/modals, 1200px for main container viewports).
5. **Platform Variant Conventions**: Platform-specific screen variations use explicit `.native.tsx`, `.web.tsx`, and `.desktop.tsx` suffixes, routed via master selector components.

---

## 2. Design Token Reference

### 2.1 Color Tokens (`packages/ui/theme/tokens.ts`)

#### Brand Palette
- `brand[900]` (`#0B1953` Light / `#1E3A8A` Dark): Deep Executive Navy.
- `brand[800]` (`#1E3A8A` Light / `#2563EB` Dark): Enterprise Blue.
- `brand[700]` (`#2563EB` Light / `#3B82F6` Dark): Hover Accent Blue.
- `brand[600]` (`#3B82F6` Light / `#60A5FA` Dark): Active Highlight Blue.
- `brand[500]` / `brand.focus` (`#60A5FA` Light / `#93C5FD` Dark): Focus Blue brand accent.

#### Neutral Scale (Slate Primitives)
- `neutral.white`: `#FFFFFF`
- `neutral[50]`: `#F8FAFC` (Canvas background)
- `neutral[100]`: `#F1F5F9` (Muted surface / hover)
- `neutral[200]`: `#E2E8F0` (Default borders)
- `neutral[300]`: `#CBD5E1` (Input borders / disabled)
- `neutral[400]`: `#94A3B8` (Placeholders / muted icons)
- `neutral[500]`: `#64748B` (Secondary text)
- `neutral[600]`: `#475569` (Sub-headers / strong text)
- `neutral[700]`: `#334155` (Slate text dark)
- `neutral[800]`: `#1E293B` (Dark card background surface)
- `neutral[900]`: `#0F172A` (Dark canvas background)

#### Contextual Surface Tokens
| Token | Light Mode | Dark Mode | Description |
|---|---|---|---|
| `colors.bg` | `#F8FAFC` | `#0F172A` | Page canvas background |
| `colors.cardBg` | `#FFFFFF` | `#1E293B` | Card & surface background |
| `colors.text` | `#0F172A` | `#F8FAFC` | Primary typography |
| `colors.textMuted` | `#64748B` | `#94A3B8` | Secondary & caption typography |
| `colors.border` | `#E2E8F0` | `#334155` | Dividers & surface borders |

#### Semantic Palette
- **Success**: Emerald scale (`#10B981` main, `#ECFDF5` bg, `#A7F3D0` border, `#065F46` text light / `#A7F3D0` text dark).
- **Warning**: Amber scale (`#F59E0B` main, `#FEF3C7` bg, `#FDE68A` border, `#92400E` text light / `#FDE68A` text dark).
- **Error**: Red scale (`#EF4444` main, `#FEF2F2` bg, `#FCA5A5` border, `#991B1B` text light / `#FCA5A5` text dark).
- **Info**: Cyan/Sky scale (`#06B6D4` main, `#ECFEFF` bg, `#A5F3FC` border, `#155E75` text light / `#BAE6FD` text dark).

### 2.2 Spacing & Radius
- **Spacing Scale (`SPACING`)**: `4`, `8`, `12`, `16`, `20`, `24`, `32`, `40`, `48`, `64`.
- **Border Radius (`RADIUS`)**: `input: 8`, `button: 8`, `card: 12`, `dialog: 16`, `circle: 9999`.

### 2.3 Shadows & Typography
- **Shadow Scale (`SHADOWS`)**: `none`, `card` (soft 0.04 opacity elevation), `modal` (0.08 opacity elevated backdrop).
- **Typography Scale (`TYPOGRAPHY`)**: Inter font hierarchy:
  - `heading`: 32px
  - `section`: 22px
  - `cardTitle`: 16px
  - `body`: 14px
  - `smallLabel`: 13px
  - `caption`: 12px

---

## 3. Theme Infrastructure & Guide

### 3.1 Setup Root Provider
Wrap your application's root component (e.g., `apps/frontend/internal/src/app/_layout.tsx`) in `<ThemeProvider>`:

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

### 3.2 Consuming Theme in Components
Access dynamic theme state and tokens using `useTheme()`:

```tsx
import { useTheme } from '@edge/ui';
import { View, Text } from 'react-native';

export function CustomCard() {
  const { colors, isDark, mode, setMode } = useTheme();

  return (
    <View style={{ backgroundColor: colors.cardBg, borderColor: colors.border, borderWidth: 1, padding: 16 }}>
      <Text style={{ color: colors.text }}>Active Theme: {mode}</Text>
    </View>
  );
}
```

### 3.3 Storage Persistence
Theme preferences are automatically persisted cross-platform:
- **Web**: Persisted via `localStorage` with `typeof window !== 'undefined'` SSR guards.
- **Native (iOS/Android)**: Persisted via `@react-native-async-storage/async-storage`.
- **System Sync**: Automatic scheme synchronization using React Native's `useColorScheme()`.

---

## 4. Component API Reference (All 13 Components)

### Existing Refactored Components

1. **`Button`** (`packages/ui/components/Button.tsx`)
   - Props: `children`, `onPress`, `variant?` (`"primary" | "secondary" | "outline" | "ghost" | "danger"`), `size?` (`"sm" | "md" | "lg"`), `isLoading?`, `isDisabled?`, `leftIcon?`, `rightIcon?`, `fullWidth?`, `style?`, `textStyle?`.
   - Behavior: Theme-aware variant styling and activity indicator.

2. **`FormFieldInput`** (`packages/ui/components/FormFieldInput.tsx`)
   - Props: `control`, `name`, `label`, `leftIconName?`, `isPassword?`, `helperText?`, `placeholder?`, `keyboardType?`, `autoCapitalize?`.
   - Behavior: Integrated React Hook Form controller wrapper, password show/hide toggle, focus state, error message feedback.

3. **`AlertToast`** (`packages/ui/components/AlertToast.tsx`)
   - Props: `message: string | null`, `onDismiss: () => void`, `variant?` (`"error" | "success" | "warning" | "info"`), `style?`.
   - Behavior: Toast notification banner with theme-matched semantic backgrounds and dismiss button.

4. **`Avatar`** (`packages/ui/components/Avatar.tsx`)
   - Props: `imageUri?: string | null`, `name: string`, `size?` (`"sm" | "md" | "lg"`), `variant?` (`"circle" | "square"`), `useDeterministicColors?`.
   - Helper: `getAvatarColors(name: string, themeColors?: ThemeColors)`.

5. **`DataTable`** (`packages/ui/tables/DataTable.tsx`)
   - Props: `data: TData[]`, `columns: ColumnDef<TData, TValue>[]`, `searchPlaceholder?`, `searchKey?`, `statusKey?`.
   - Behavior: TanStack table core, status tab filters, horizontal mobile scroll wrapper, pagination controls.

6. **`StatusBadge`** (`packages/ui/tables/StatusBadge.tsx`)
   - Props: `status: string`.
   - Helper: `getStatusColors(status: string, themeColors?: ThemeColors)`.

7. **`ServiceFormModal`** (`packages/ui/client/ServiceFormModal.tsx`)
   - Props: `visible: boolean`, `serviceTitle: string`, `onClose: () => void`, `onSubmit: (data) => Promise<void>`, `isSubmitting: boolean`.
   - Behavior: Accessible application modal dialog with input validation and file attachment toggle.

---

### New Shared Components (Milestone 1)

8. **`SkeletonLoader`** (`packages/ui/components/SkeletonLoader.tsx`)
   - Props: `width?: number | string`, `height?: number`, `borderRadius?: number`, `variant?` (`"text" | "rectangular" | "circular"`), `style?`.
   - Behavior: Animated shimmer loading placeholder using `Animated.loop`.

9. **`AnimatedCard`** (`packages/ui/components/AnimatedCard.tsx`)
   - Props: `children`, `style?`, `padding?: number`, `onPress?: () => void`, `hoverEffect?: boolean`, `delay?: number`.
   - Behavior: Container card wrapper with fade-in and slide-up mount animation and theme elevation.

10. **`ThemeToggle`** (`packages/ui/components/ThemeToggle.tsx`)
    - Props: `variant?` (`"segmented" | "icon"`), `size?` (`"sm" | "md"`), `style?`.
    - Behavior: Runtime theme mode switcher control supporting segmented tabs or cycle button.

11. **`PageHeader`** (`packages/ui/components/PageHeader.tsx`)
    - Props: `title: string`, `subtitle?: string`, `badge?: React.ReactNode`, `onBackPress?: () => void`, `action?: React.ReactNode`, `style?`.
    - Behavior: Standardized page header with title, subtitle, optional status pill, back arrow button, and action slot.

12. **`EmptyState`** (`packages/ui/components/EmptyState.tsx`)
    - Props: `icon?: keyof typeof Icon.glyphMap | React.ReactNode`, `title: string`, `description?: string`, `actionLabel?: string`, `onActionPress?: () => void`, `style?`.
    - Behavior: Centered placeholder visual component for empty tables or list views.

13. **`SearchBar`** (`packages/ui/components/SearchBar.tsx`)
    - Props: `value: string`, `onChangeText: (text: string) => void`, `onDebouncedChange?: (text: string) => void`, `debounceMs?: number`, `placeholder?: string`, `autoFocus?: boolean`, `style?`.
    - Behavior: Filter search bar with leading search icon, clear button, and debounced change handler.

---

## 5. Platform Variant Conventions & Mobile-First Layouts

### 5.1 The 4-File Platform Pattern
When building feature screens that require platform-specific UI variations, follow the 4-file structure:
- `[Feature]Screen.tsx` — Master Selector
- `[Feature]Screen.native.tsx` — iOS / Android native layout
- `[Feature]Screen.web.tsx` — Web viewport responsive layout
- `[Feature]Screen.desktop.tsx` — Windows / macOS desktop layout

### 5.2 Master Selector Template
```tsx
import React from 'react';
import { Platform } from 'react-native';
import { FeatureScreen as WebScreen } from './FeatureScreen.web';
import { FeatureScreen as NativeScreen } from './FeatureScreen.native';
import { FeatureScreen as DesktopScreen } from './FeatureScreen.desktop';

export function FeatureScreen() {
  if (Platform.OS === 'web') return <WebScreen />;
  if (Platform.OS === 'windows' || Platform.OS === 'macos') return <DesktopScreen />;
  return <NativeScreen />;
}
```

### 5.3 Mobile-First Container Rules
To prevent wide desktop stretching:
- **Auth Screens & Modals**: Limit container width to `maxWidth: 440` and apply `alignSelf: 'center'`.
- **Dashboards & Grids**: Limit main container to `maxWidth: 1200` and apply `alignSelf: 'center'` with dynamic flex direction (column on mobile, row on desktop via `useWindowDimensions()`).

---

## 6. Visual Consistency Do's and Don'ts

- **DO**: Consume `useTheme()` colors dynamically for all background, text, and border styling.
- **DON'T**: Hardcode hex color strings (`#1E3A8A`) or static token imports (`COLORS.neutral[50]`) in components.
- **DO**: Use strict runtime null and undefined checks (`if (value !== undefined && value !== null)`).
- **DON'T**: Use non-null assertions (`!`) or type assertions (`as string`).
- **DO**: Provide `onDebouncedChange` handlers on search bars to optimize data fetching.
- **DON'T**: Scatter scattered `try-catch` blocks; consume `@edge/api`'s `safeAsync` wrapper for API operations.
