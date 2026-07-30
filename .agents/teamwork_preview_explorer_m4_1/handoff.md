# Handoff Report — Core Feature Screens Redesign Plan (Milestone 4)

**Agent Role**: `teamwork_preview_explorer` (Instance 1)  
**Working Directory**: `c:\Users\User\projects\ustp\NTC-EDGE\.agents\teamwork_preview_explorer_m4_1`  
**Date**: 2026-07-29  

---

## 1. Observation

Direct observations from the codebase investigation of `apps/frontend/internal/src/features/` and `@edge/ui`:

1. **Target Single-File Screens**:
   - `announcements/screens/AnnouncementsScreen.tsx` (101 lines): ScrollView wrapper rendering `AnnouncementsTab` and `DeleteAdminItemModal`. Hardcoded background `#F8FAFC`, manual header text, no theme hooks.
   - `audit-logs/screens/AuditLogsScreen.tsx` (70 lines): ScrollView wrapper rendering `AuditLogsTab`. Hardcoded background `#F8FAFC`, manual header text, raw inline search text input in `AuditLogsTab`, no `DataTable` integration.
   - `feedback/screens/FeedbackScreen.tsx` (793 lines): Monolithic file with 5 state hooks (`searchQuery`, `ratingFilter`, `expandedId`, `currentPage`, `deleteModal`), derived memoized stats (`total`, `anonCount`, `avgRating`, `pendingCount`), inline rating stars, over 40 hardcoded color values (`#EEF2FF`, `#FEF3C7`, `#F1F5F9`, `#FEF2F2`, `#4F46E5`, `#D97706`, `#475569`, `#DC2626`, etc.).
   - `form-builder/screens/FormBuilderScreen.tsx` (226 lines): Single-file state manager rendering `FormBuilderTab`, `VisualFormBuilderModal`, `AdminSettingsModal`, and `DeleteAdminItemModal`. Hardcoded background `#F8FAFC`, manual header text.

2. **Existing Platform Variant Reference Pattern**:
   - `apps/frontend/internal/src/features/dashboard/screens/DashboardScreen.tsx` and `employees/screens/EmployeesScreen.tsx` establish the master selector pattern using `Platform.OS` (`web`, `macos`/`windows`, default native).
   - `UsersScreen.web.tsx`, `UsersScreen.desktop.tsx`, `UsersScreen.native.tsx` establish the platform variant container structure.

3. **`@edge/ui` Available UI Components**:
   - `useTheme()` (`packages/ui/index.ts:9`): Provides dynamic dark/light `colors` object (`bg`, `cardBg`, `text`, `textMuted`, `border`, `brand`, etc.).
   - `PageHeader` (`packages/ui/components/PageHeader.tsx`): Supports `title`, `subtitle`, `badge`, `onBackPress`, `action`.
   - `AnimatedCard` (`packages/ui/components/AnimatedCard.tsx`): Supports mount fade-in/slide-up, hover effect, delay stagger, and built-in `reduceMotion` check via `AccessibilityInfo`.
   - `SkeletonLoader` (`packages/ui/components/SkeletonLoader.tsx`): Supports `width`, `height`, `borderRadius`, `variant` (`text`, `rectangular`, `circular`), `reduceMotion`.
   - `EmptyState` (`packages/ui/components/EmptyState.tsx`): Supports `icon`, `title`, `description`, `actionLabel`, `onActionPress`.
   - `SearchBar` (`packages/ui/components/SearchBar.tsx`): Supports `value`, `onChangeText`, `onDebouncedChange`, `debounceMs`, `placeholder`.
   - `DataTable` (`packages/ui/tables/DataTable.tsx`): TanStack Table wrapper supporting search filtering, status tab filtering, column flex definitions, and pagination.

---

## 2. Logic Chain

1. **Observed Need for Platform Adaptation**:
   - The current single-file implementations use static mobile/web layouts without adaptive constraints (`maxWidth: 1200`, `alignSelf: 'center'`) or platform-specific optimizations (such as macOS/Windows desktop shell densities vs mobile `SafeAreaView` wrappers).
   - *Therefore*, each screen must be split into 4 files (`.tsx` master selector + `.web.tsx` + `.desktop.tsx` + `.native.tsx`).

2. **Observed Need for Design System Alignment**:
   - All 4 target screens currently use hardcoded background colors (`#F8FAFC`) and manual header text groups, ignoring the established `@edge/ui` design system and `useTheme()` hook.
   - *Therefore*, all platform variants must consume `useTheme()` for colors and use `@edge/ui` `PageHeader`, `AnimatedCard`, `SkeletonLoader`, `EmptyState`, and `SearchBar`.

3. **Observed Need for Motion & Accessibility**:
   - Currently, loading states use generic `ActivityIndicator` spinners and screen content mounts abruptly without entrance animations.
   - *Therefore*, cards must be wrapped in `AnimatedCard` with staggered entrance animations, loading states must use `SkeletonLoader`, and `reduceMotion` accessibility settings must be respected.

4. **Observed Need for Strict Type Safety**:
   - Monolithic files contain loose types and potential force-casts.
   - *Therefore*, all data models (`SystemAnnouncementDto`, `AuditLogDto`, `FeedbackDto`, `FormBuilderItem`) must be strictly typed without `any`, `as`, or `!`.

---

## 3. Caveats

1. **Backend Integration**:
   - API hooks (`useAdminAnnouncements`, `useAdminAuditLogs`, `useAdminFeedback`, `useAdminForms`) from `@edge/api` rely on running API backend servers. Mock fallbacks exist in `@edge/api` for offline development.
2. **Third-Party Modal Dependencies**:
   - Modals such as `VisualFormBuilderModal`, `AdminSettingsModal`, and `DeleteAdminItemModal` live in `features/settings/components/`. Their internal code remains in settings, but screen handlers must properly sync open/close states.
3. **No Direct Source Changes Executed**:
   - This task is a read-only investigation and strategic analysis. Implementation will be executed by implementer agents following the plan in `analysis.md`.

---

## 4. Conclusion

The single-file screens (`AnnouncementsScreen.tsx`, `AuditLogsScreen.tsx`, `FeedbackScreen.tsx`, `FormBuilderScreen.tsx`) have been fully analyzed and an actionable split & redesign plan has been formulated:
- Split each screen into 3 platform variants (`.native.tsx`, `.web.tsx`, `.desktop.tsx`) + master selector (`.tsx`).
- Standardize UI using `@edge/ui` components (`PageHeader`, `DataTable`, `AnimatedCard`, `SkeletonLoader`, `EmptyState`, `SearchBar`, `useTheme`).
- Enforce layout constraint `maxWidth: 1200` & `alignSelf: 'center'` on web and desktop variants.
- Enforce strict typing with ZERO `any`, ZERO `as`, ZERO `!`.
- Preserve 100% of existing functional logic, API calls, and state handlers.

---

## 5. Verification Method

To verify the strategy and subsequent implementation:
1. **File Architecture Verification**:
   - Check directory contents of `features/announcements/screens/`, `features/audit-logs/screens/`, `features/feedback/screens/`, `features/form-builder/screens/` to confirm existence of `.tsx`, `.web.tsx`, `.desktop.tsx`, `.native.tsx`.
2. **TypeScript Compilation & Lint Check**:
   - Run `npx tsc --noEmit` from `apps/frontend/internal` to verify zero type errors.
   - Search for prohibited syntax: `grep -rn "as " src/features/` and `grep -rn "any" src/features/`.
3. **Runtime & Layout Verification**:
   - Launch Expo app (`bun start` or `npm start` in `apps/frontend/internal`).
   - Switch themes (light / dark) to verify `useTheme()` color responsiveness across all 4 redesigned screens.
   - Resize browser window below and above 768px/1024px to verify `maxWidth: 1200` centering and responsive layout behavior.
