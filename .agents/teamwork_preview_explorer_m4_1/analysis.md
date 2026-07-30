# Comprehensive Analysis & Platform Redesign Strategy for Core Feature Screens (Milestone 4)

**Target Directory**: `apps/frontend/internal/src/features/`  
**Author**: `teamwork_preview_explorer` (Instance 1)  
**Date**: 2026-07-29  

---

## 1. Executive Summary

This report presents a thorough architectural investigation and design specification for splitting and redesigning four single-file screens in the NTC-EDGE internal frontend app:
1. `announcements/screens/AnnouncementsScreen.tsx`
2. `audit-logs/screens/AuditLogsScreen.tsx`
3. `feedback/screens/FeedbackScreen.tsx`
4. `form-builder/screens/FormBuilderScreen.tsx`

Each screen currently exists as a single monolithic file with hardcoded styling (`#F8FAFC`, inline color codes), lack of theme awareness, missing motion micro-interactions, manual page headers, and absence of platform-specific view layout adaptations (.native, .web, .desktop).

Our proposed implementation plan converts each screen into a 4-file platform architecture:
- `[Feature]Screen.tsx` — Master platform selector using `Platform.OS`
- `[Feature]Screen.web.tsx` — Responsive web browser view (`maxWidth: 1200`, `alignSelf: 'center'`, hover effects, theme awareness)
- `[Feature]Screen.desktop.tsx` — Native desktop shell view (macOS/Windows optimized, high information density, keyboard controls)
- `[Feature]Screen.native.tsx` — Mobile native view (iOS/Android `SafeAreaView`, touch-optimized controls, card stacking)

All functional logic, API calls, state handlers, and navigation flows are preserved 100% without regression while incorporating strict TypeScript typing (zero `any`, zero `as`, zero `!`).

---

## 2. `@edge/ui` Component & Infrastructure Audit

The `@edge/ui` package exports all required primitives for theme awareness, data tables, motion cards, headers, search, and loading states:

| Component / Utility | Export Path | Key Features & Implementation Usage |
|---|---|---|
| `useTheme()` | `@edge/ui` (`theme/useTheme`) | Access `colors` (bg, cardBg, text, textMuted, border, brand, etc.) and `isDark` boolean for dynamic light/dark mode styling across all screen variants. |
| `PageHeader` | `@edge/ui` (`components/PageHeader`) | Standardized page title, subtitle, optional back button, badge, and right-side action slot (`action`). Replaces all custom header rows. |
| `AnimatedCard` | `@edge/ui` (`components/AnimatedCard`) | Mount animation (fade-in + slide-up), hover effect with border highlighting, web dark shadow adaptation, press states, and built-in `reduceMotion` accessibility checks. |
| `SkeletonLoader` | `@edge/ui` (`components/SkeletonLoader`) | Pulsing loading placeholders (`text`, `rectangular`, `circular` variants) with `reduceMotion` fallback. Replaces raw `ActivityIndicator`. |
| `EmptyState` | `@edge/ui` (`components/EmptyState`) | Theme-aware empty state graphics, title, description, and action button for zero-data states. |
| `SearchBar` | `@edge/ui` (`components/SearchBar`) | Debounced search input with focus border highlight, clear button, and theme integration. |
| `DataTable` | `@edge/ui` (`tables/DataTable`) | TanStack Table wrapper with search filtering, status tab filtering, column flex definitions, and pagination. |
| `StatusBadge` | `@edge/ui` (`tables/StatusBadge`) | Standard status badges for Active, Pending, Published, Approved, Rejected, Warning, Maintenance. |
| `Button` | `@edge/ui` (`components/Button`) | Standard button supporting `primary`, `secondary`, `outline`, `ghost`, `danger` variants and size options. |
| `FormFieldInput` | `@edge/ui` (`components/FormFieldInput`) | Form inputs with validation error messages, focus animations, and theme awareness. |

---

## 3. Screen-by-Screen Deep Dive & Platform Split Plan

### 3.1 Screen 1: System Announcements (`AnnouncementsScreen.tsx`)

#### Current State Analysis
- **Location**: `apps/frontend/internal/src/features/announcements/screens/AnnouncementsScreen.tsx`
- **Component Imports**: `AnnouncementsTab` (from `../../settings/components/AnnouncementsTab`), `DeleteAdminItemModal` (from `../../settings/components/DeleteAdminItemModal`).
- **State**:
  - `deleteModal`: `{ visible: boolean; itemTitle: string; onConfirm: () => void }`
- **Data Hook**: `useAdminAnnouncements()` inside `AnnouncementsTab` returning `announcements`, `isLoading`, `isError`, `refetch`.
- **Deficiencies**: Hardcoded background `#F8FAFC`, manual header text, raw activity indicator, no theme awareness, missing platform variant split.

#### Target 4-File Architecture
1. **`AnnouncementsScreen.tsx` (Master Selector)**:
   ```tsx
   import React from "react";
   import { Platform } from "react-native";
   import { AnnouncementsScreen as WebScreen } from "./AnnouncementsScreen.web";
   import { AnnouncementsScreen as NativeScreen } from "./AnnouncementsScreen.native";
   import { AnnouncementsScreen as DesktopScreen } from "./AnnouncementsScreen.desktop";

   export function AnnouncementsScreen() {
     if (Platform.OS === "web") {
       return <WebScreen />;
     }
     if (Platform.OS === "macos" || Platform.OS === "windows") {
       return <DesktopScreen />;
     }
     return <NativeScreen />;
   }
   ```

2. **`AnnouncementsScreen.web.tsx`**:
   - Uses `useTheme()` for `colors.bg`, `colors.cardBg`, `colors.text`, `colors.border`.
   - Employs `@edge/ui` `PageHeader` with title *"System Announcements"*, subtitle *"Publish system banners, maintenance alerts, and operational updates..."*, and right action button `+ New Announcement`.
   - Layout container: `maxWidth: 1200`, `alignSelf: 'center'`, `width: '100%'`.
   - Uses `SkeletonLoader` stack during `isLoading`.
   - Wraps announcement items in `AnimatedCard` with delay stagger (`index * 50ms`) for smooth fade-in/slide-up.
   - `@edge/ui` `EmptyState` when `announcements.length === 0`.

3. **`AnnouncementsScreen.desktop.tsx`**:
   - Optimized for macOS/Windows desktop shell navigation.
   - High information density, compact toolbars, `maxWidth: 1200`, `alignSelf: 'center'`.
   - Keyboard shortcut hints (e.g. `Press R` to refresh) and compact action buttons.

4. **`AnnouncementsScreen.native.tsx`**:
   - Wrapped in `SafeAreaView` with `colors.bg`.
   - Mobile-first card stacking layout, touchable hit-slops (44pt+), pull-to-refresh capability.

---

### 3.2 Screen 2: System Audit Logs (`AuditLogsScreen.tsx`)

#### Current State Analysis
- **Location**: `apps/frontend/internal/src/features/audit-logs/screens/AuditLogsScreen.tsx`
- **Component Imports**: `AuditLogsTab` (from `../../settings/components/AuditLogsTab`).
- **Data Hook**: `useAdminAuditLogs(page, pageSize, searchTerm)` returning `logs`, `totalCount`, `isLoading`, `isError`, `refetch`.
- **Deficiencies**: Hardcoded background `#F8FAFC`, manual table header/row layout in `AuditLogsTab`, raw text input search, hardcoded color styles, no platform variant split.

#### Target 4-File Architecture
1. **`AuditLogsScreen.tsx` (Master Selector)**:
   - Platform dispatcher selecting `.web`, `.desktop`, or `.native`.

2. **`AuditLogsScreen.web.tsx`**:
   - Layout container: `maxWidth: 1200`, `alignSelf: 'center'`, `width: '100%'`.
   - Header: `@edge/ui` `PageHeader` with title *"System Audit Logs"*, subtitle *"Complete immutable audit trail of administrative activities..."*, and Refresh button.
   - Controls: `@edge/ui` `SearchBar` with debounced search query state (`searchTerm`).
   - Data Presentation: `@edge/ui` `DataTable` (powered by `@tanstack/react-table`) with structured columns:
     - `action` & `entityName` (flex: 2)
     - `userId` (flex: 2)
     - `changes` (flex: 3, line-clamp)
     - `timestamp` (flex: 2, formatted locale date)
   - Loading: 5-row `SkeletonLoader` table placeholder.
   - Theme integration: All headers, borders, rows, and badges consume `colors` from `useTheme()`.

3. **`AuditLogsScreen.desktop.tsx`**:
   - Dense desktop table layout with keyboard navigation support, compact row heights (40px), copyable payload snippets, `maxWidth: 1200`.

4. **`AuditLogsScreen.native.tsx`**:
   - Wrapped in `SafeAreaView`.
   - Mobile log list using stacked `AnimatedCard` log entries instead of wide horizontal table scrolling.

---

### 3.3 Screen 3: User Feedbacks & Suggestions (`FeedbackScreen.tsx`)

#### Current State Analysis
- **Location**: `apps/frontend/internal/src/features/feedback/screens/FeedbackScreen.tsx`
- **Complexity**: 793 lines in a single file!
- **State**:
  - `searchQuery` (`string`)
  - `ratingFilter` (`'all' | '5' | '4' | 'anon'`)
  - `expandedId` (`string | null`)
  - `currentPage` (`number`)
  - `deleteModal`: `{ visible: boolean; id: string; sender: string }`
  - Derived memoized stats: `total`, `anonCount`, `avgRating`, `pendingCount`
  - Derived memoized filtering & pagination (`pageSize = 10`)
- **API**: `useAdminFeedback()` from `@edge/api`, `apiClient.delete('/api/v2/feedback/${id}')`.
- **Deficiencies**:
  - Over 40 inline hardcoded color codes (`#EEF2FF`, `#FEF3C7`, `#F1F5F9`, `#FEF2F2`, `#4F46E5`, `#D97706`, `#475569`, `#DC2626`, etc.).
  - Monolithic single-file structure lacking `.native`, `.web`, `.desktop` variants.
  - Manual star rating rendering and raw activity indicators.

#### Target 4-File Architecture & Refactoring Plan
1. **Shared Logic Hook (`useFeedbackState.ts`)**:
   - Extract state management, API calls, deletion handlers, rating star helpers, filtering, and pagination into a custom hook `useFeedbackState()`.
   - Guarantees 100% logic preservation across all 3 platform variants without code duplication.

2. **`FeedbackScreen.tsx` (Master Selector)**:
   - Platform dispatcher for `.web`, `.desktop`, `.native`.

3. **`FeedbackScreen.web.tsx`**:
   - Container constraint: `maxWidth: 1200`, `alignSelf: 'center'`, `width: '100%'`.
   - Header: `@edge/ui` `PageHeader`.
   - KPI Summary: 4 KPI Cards rendered with `AnimatedCard` and `useTheme()` colors.
   - Control Bar: `@edge/ui` `SearchBar` + filter pills for `All`, `Anonymous Only`, `5 Stars ★`, and refresh button.
   - List & Cards: Feedback item cards rendered via `AnimatedCard`, with expandable details box, star icons, masked privacy notice, and delete modal.
   - Loading & Empty: `SkeletonLoader` cards and `@edge/ui` `EmptyState`.

4. **`FeedbackScreen.desktop.tsx`**:
   - Desktop split-pane view option: Left pane for feedback list items, Right pane for expanded feedback details & message reader, `maxWidth: 1200`.

5. **`FeedbackScreen.native.tsx`**:
   - `SafeAreaView` wrapper, single-column vertical card stack, mobile touchable expanded drawer, pull-to-refresh.

---

### 3.4 Screen 4: Form Builder (`FormBuilderScreen.tsx`)

#### Current State Analysis
- **Location**: `apps/frontend/internal/src/features/form-builder/screens/FormBuilderScreen.tsx`
- **State**:
  - `isVisualBuilderVisible` (`boolean`)
  - `visualBuilderFormTitle` (`string`)
  - `modalType` (`ModalType`)
  - `selectedItem` (`ModalInitialData | undefined`)
  - `deleteModal`: `{ visible: boolean; itemTitle: string; onConfirm: () => void }`
- **Data Hook**: `useAdminForms()` from `@edge/api`. Maps `apiForms` -> `FormBuilderItem[]`.
- **Modals**: `FormBuilderTab`, `VisualFormBuilderModal`, `AdminSettingsModal`, `DeleteAdminItemModal`.
- **Deficiencies**: Hardcoded `#F8FAFC`, manual header, raw activity indicator, missing platform variant split, no theme awareness.

#### Target 4-File Architecture
1. **`FormBuilderScreen.tsx` (Master Selector)**:
   - Platform selector dispatching to `.web`, `.desktop`, or `.native`.

2. **`FormBuilderScreen.web.tsx`**:
   - Layout container: `maxWidth: 1200`, `alignSelf: 'center'`, `width: '100%'`.
   - Header: `@edge/ui` `PageHeader` with title *"Form Builder"*, subtitle *"Configure drag-and-drop form schemas..."*, and primary action button `+ Create Form Template`.
   - Content: `FormBuilderTab` wrapped with `AnimatedCard` entrance animation.
   - Loading & Error: `@edge/ui` `SkeletonLoader` and error retry state.
   - Modals: `VisualFormBuilderModal`, `AdminSettingsModal`, `DeleteAdminItemModal` with theme styling.

3. **`FormBuilderScreen.desktop.tsx`**:
   - High-density desktop workspace layout: Schema template grid with section/field metrics, versioning badge, drag-and-drop launcher button, `maxWidth: 1200`.

4. **`FormBuilderScreen.native.tsx`**:
   - `SafeAreaView` shell, mobile template summary list with mobile-adapted modal drawers.

---

## 4. Strict Type Safety (ZERO Rules Enforcement)

The redesign strictly enforces all TypeScript workspace rules:
- **ZERO `any`**: All variables, state, API DTOs, and handler parameters must use explicit interface types (e.g. `SystemAnnouncementDto`, `AuditLogDto`, `FeedbackDto`, `FormBuilderItem`, `ColumnDef<T, unknown>`).
- **ZERO `as`**: Type assertions are strictly prohibited. Safe type guards (`typeof`, `instanceof`, custom boolean predicate functions) or optional chaining (`?.`) / nullish coalescing (`??`) will be used.
- **ZERO `!`**: Non-null assertions are strictly prohibited. Explicit conditional guards (`if (item !== null && item !== undefined)`) ensure runtime safety.

---

## 5. Motion Design & Micro-Interactions Specification

Each platform variant will integrate standard motion design patterns:
1. **Screen Mount Animation**:
   - Cards and containers animate using `Animated.parallel([fadeAnim, slideAnim])`.
   - Delay stagger (`delay = index * 50ms`) for list items.
   - Built-in `AccessibilityInfo.isReduceMotionEnabled()` check inside `@edge/ui` `AnimatedCard` and `SkeletonLoader` sets opacity immediately to 1.0 without motion if reduceMotion is enabled.
2. **Press & Hover Feedback**:
   - Interactive cards highlight border color (`colors.brand[500]`) on hover (`onHoverIn` / `onHoverOut`).
   - Active press scale effect (`transform: [{ scale: 0.985 }]`) for buttons and touchable rows.
3. **Skeleton Loading**:
   - Replaces generic spinners with layout-matched `SkeletonLoader` cards during API fetch.

---

## 6. Implementation Verification Matrix

| Screen | Target Files | Verification Method | Invalidation Conditions |
|---|---|---|---|
| Announcements | `.tsx`, `.web.tsx`, `.desktop.tsx`, `.native.tsx` | Run Expo bundler (`bun start`), verify web rendering with `maxWidth: 1200`, theme toggle, and delete modal trigger. | Functional logic change, layout breaking on web/mobile. |
| Audit Logs | `.tsx`, `.web.tsx`, `.desktop.tsx`, `.native.tsx` | Verify `DataTable` render, debounced search filtering, pagination, and skeleton loading state. | Search query breaking pagination, type assertions present. |
| Feedback | `.tsx`, `.web.tsx`, `.desktop.tsx`, `.native.tsx` | Verify KPI stats calculations, rating filter chips, expand/collapse feedback details, delete API call via `apiClient`. | Mismatch in total/anon/avg stats calculations, type assertions present. |
| Form Builder | `.tsx`, `.web.tsx`, `.desktop.tsx`, `.native.tsx` | Verify template mapping, Create Form modal trigger, Visual Drag-and-Drop modal trigger. | Modal state sync failure, missing `useTheme()` colors. |

---

## 7. Summary & Recommendations for Implementer Agent

1. **Create shared state hooks** where complex state exists (e.g. `useFeedbackState.ts` for FeedbackScreen) before building UI variants.
2. **Import components from `@edge/ui`** (`PageHeader`, `AnimatedCard`, `SkeletonLoader`, `EmptyState`, `SearchBar`, `DataTable`, `useTheme`).
3. **Apply web/desktop constraints**: `maxWidth: 1200`, `alignSelf: 'center'`, `width: '100%'`.
4. **Ensure 100% type safety**: No `any`, no `as`, no `!`.
