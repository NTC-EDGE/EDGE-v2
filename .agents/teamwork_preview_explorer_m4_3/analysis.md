# Analysis & Implementation Strategy: Milestone 4 Core Feature Screens Redesign

**Agent**: `teamwork_preview_explorer_m4_3`  
**Milestone**: Milestone 4 (Core Feature Screens Redesign)  
**Date**: July 29, 2026  
**Target Monorepo**: `apps/frontend/internal` & `packages/ui` (`@edge/ui`)

---

## 1. Executive Summary

This investigation evaluates the current implementation state of the core feature screens (`EmployeesScreen` and `UsersScreen`) and audits shared component adoption from `@edge/ui` across all 9 target features in `apps/frontend/internal/src/features/`.

### Key Discoveries:
1. **TypeScript Build Status**: Workspace type checking (`pnpm --filter ntc-edge-internal check-types` running `tsc --noEmit`) passes with **0 compilation errors**.
2. **Strict Typing Violations Found**:
   - `any` usage in `apps/frontend/internal/src/features/employees/components/EmployeeFormModal.tsx` (line 199: `(e: any) =>`).
   - Unsafe `as` type assertions in `apps/frontend/internal/src/features/employees/screens/EmployeesScreenContent.tsx` (lines 228, 237, 261, 271: `as EmployeeRole`, `as EmployeeStatus`).
3. **Layout & Responsive Deficiencies**:
   - Web & Desktop variants (`.web.tsx`, `.desktop.tsx`, `*ScreenContent.tsx`) currently lack container constraints (`maxWidth: 1200`, `alignSelf: 'center'`), causing card grids and toolbars to stretch edge-to-edge on wide screens (>1400px).
4. **Theme & Dark Mode Gaps**:
   - `EmployeesScreenContent.tsx` and `UsersScreenContent.tsx` rely heavily on static `COLORS` imports (`COLORS.neutral.white`, `COLORS.neutral[900]`, etc.) instead of the dynamic `useTheme()` hook. Switching theme via `ThemeToggle` leaves screens with static light colors.
5. **@edge/ui Catalog Integration Opportunity**:
   - Target screens can replace raw/custom sub-components with `@edge/ui` catalog exports: `PageHeader`, `DataTable`, `StatusBadge`, `SkeletonLoader`, `AnimatedCard`, `EmptyState`, `SearchBar`, `ThemeToggle`, and `Button`.

---

## 2. Existing Variant Screens Analysis

### 2.1 Employees Feature Variants (`src/features/employees/`)
* **Files Examined**:
  - `screens/EmployeesScreen.tsx` (Master platform selector)
  - `screens/EmployeesScreen.native.tsx` (Mobile Native platform shell)
  - `screens/EmployeesScreen.web.tsx` (Web platform shell)
  - `screens/EmployeesScreen.desktop.tsx` (Desktop platform shell)
  - `screens/EmployeesScreenContent.tsx` (Primary stateful content component)
  - `components/EmployeeCard.tsx` (Grid item card component)
  - `components/EmployeeDetailsPage.tsx` (Full-page detail view)
  - `components/EmployeeFormModal.tsx` (Add/Edit modal)
  - `components/DeleteConfirmModal.tsx` (Delete confirmation modal)

* **Redesign & Refinement Strategy**:
  1. **Platform Shells**: Update `.web.tsx` and `.desktop.tsx` to wrap `EmployeesScreenContent` in a constrained container (`maxWidth: 1200`, `width: '100%'`, `alignSelf: 'center'`).
  2. **Page Header Integration**: Replace custom breadcrumbs and text header in `EmployeesScreenContent.tsx` with `@edge/ui` `PageHeader` component, passing title, subtitle, and right actions (`ThemeToggle`, `Button` for Add Employee).
  3. **Theme & Colors**: Replace all static `COLORS` references with `const { colors, isDark } = useTheme();`. Ensure card backgrounds (`colors.cardBg`), text colors (`colors.text`, `colors.textMuted`), and borders (`colors.border`) dynamically update on mode changes.
  4. **Motion & Interactions**: Replace plain `<View>` cards in grid view with `@edge/ui` `AnimatedCard` to gain fade-in, slide-up staggers, hover states, and press elevation feedback.
  5. **Empty State & Search**: Replace custom inline search input with `@edge/ui` `SearchBar` and empty state container with `@edge/ui` `EmptyState`.

### 2.2 Users Feature Variants (`src/features/users/`)
* **Files Examined**:
  - `screens/UsersScreen.tsx` (Master platform selector)
  - `screens/UsersScreen.native.tsx` (Mobile Native platform shell)
  - `screens/UsersScreen.web.tsx` (Web platform shell)
  - `screens/UsersScreen.desktop.tsx` (Desktop platform shell)
  - `screens/UsersScreenContent.tsx` (Primary stateful content component)
  - `components/UserCard.tsx` (Grid item card component)
  - `components/UserDetailsPage.tsx` (Full-page detail view)
  - `components/UserFormModal.tsx` (Add/Edit modal)
  - `components/DeleteUserConfirmModal.tsx` (Delete confirmation modal)

* **Redesign & Refinement Strategy**:
  1. **Platform Shells**: Enforce `maxWidth: 1200` container constraints on `.web.tsx` and `.desktop.tsx`.
  2. **Page Header Integration**: Refactor header banner using `PageHeader` from `@edge/ui`, featuring title `"Users Portal"`, subtitle, and action buttons.
  3. **Table & Status Badges**: Integrate `@edge/ui` `StatusBadge` into `DataTable` columns for active/inactive account statuses.
  4. **Theme Awareness**: Transition from static `COLORS` to dynamic `useTheme()` tokens across `UsersScreenContent.tsx`, `UserCard.tsx`, and `UserDetailsPage.tsx`.

---

## 3. `@edge/ui` Component Catalog & Pattern Audit

All shared components are exported from `@edge/ui` (`packages/ui/index.ts`). Below is the audit matrix for target screen integration:

| Component Name | Export Path | Target Usage Pattern | Key Props |
|---|---|---|---|
| `PageHeader` | `packages/ui/components/PageHeader.tsx` | Top banner for Employees & Users screens | `title`, `subtitle`, `badge`, `onBackPress`, `action`, `style` |
| `DataTable` | `packages/ui/tables/DataTable.tsx` | Main tabular listing for Employees & Users | `data`, `columns`, `searchPlaceholder`, `searchKey`, `statusKey` |
| `StatusBadge` | `packages/ui/tables/StatusBadge.tsx` | Account status column badges | `status` ('Active' \| 'Inactive' \| 'Pending') |
| `SkeletonLoader` | `packages/ui/components/SkeletonLoader.tsx` | Loading placeholders when fetching/rendering | `width`, `height`, `borderRadius`, `variant` |
| `AnimatedCard` | `packages/ui/components/AnimatedCard.tsx` | Wrappers for KPI stats cards & employee/user cards | `padding`, `onPress`, `hoverEffect`, `delay` |
| `EmptyState` | `packages/ui/components/EmptyState.tsx` | No-results view for search/filter results | `icon`, `title`, `description`, `actionLabel`, `onActionPress` |
| `SearchBar` | `packages/ui/components/SearchBar.tsx` | Search input bar in toolbars | `value`, `onChangeText`, `onDebouncedChange`, `placeholder` |
| `ThemeToggle` | `packages/ui/components/ThemeToggle.tsx` | Theme mode selector in PageHeader actions | `variant` ('segmented' \| 'icon'), `size` |
| `Button` | `packages/ui/components/Button.tsx` | Add employee/user buttons, modal triggers | `variant` ('primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'), `size`, `isLoading`, `leftIcon` |
| `FormFieldInput` | `packages/ui/components/FormFieldInput.tsx` | Form modal input fields (react-hook-form) | `control`, `name`, `label`, `leftIconName`, `isPassword` |
| `useTheme` | `packages/ui/theme/useTheme.ts` | Theme awareness hook in all components | Returns `{ mode, setMode, colors, isDark }` |

---

## 4. Strict Typing & Type-Check Audit

### 4.1 Build Status
Command executed: `cmd /c pnpm --filter ntc-edge-internal check-types` (`tsc --noEmit`)
* **Result**: Passed with **0 errors**.

### 4.2 Codebase Typing Violations Identified
1. **`any` Violation**:
   - `apps/frontend/internal/src/features/employees/components/EmployeeFormModal.tsx`:
     Line 199: `input.onchange = (e: any) => {`
     *Fix*: Type event as `Event` or `React.ChangeEvent<HTMLInputElement>`.
2. **Unsafe Type Assertions (`as`)**:
   - `apps/frontend/internal/src/features/employees/screens/EmployeesScreenContent.tsx`:
     Line 228: `role: (data.role as EmployeeRole) ?? item.role`
     Line 237: `status: (data.status as EmployeeStatus) ?? item.status`
     Line 261: `role: (data.role as EmployeeRole) ?? 'Evaluator'`
     Line 271: `status: (data.status as EmployeeStatus) ?? 'Active'`
     *Fix*: Replace `as` casts with runtime guard functions or Zod validation schemas.

---

## 5. Mobile-First & Desktop Layout Constraint Plan

### Rules Alignment:
- **Mobile-First Approach**: Stack layouts vertically on mobile (`flexDirection: 'column'`), scale font sizes, and make action buttons full-width when necessary (`isMobile`).
- **Web/Desktop Container Limit**:
  Add container rule to all Web and Desktop screens:
  ```tsx
  container: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
  }
  ```

---

## 6. Implementation Roadmap for Implementers

1. **Step 1: Clean Up Typing Violations**:
   - Remove `any` in `EmployeeFormModal.tsx`.
   - Remove `as EmployeeRole` / `as EmployeeStatus` assertions in `EmployeesScreenContent.tsx` using explicit type guards.
2. **Step 2: Theme Awareness Migration**:
   - Import `useTheme` in `EmployeesScreenContent.tsx`, `UsersScreenContent.tsx`, `EmployeeCard.tsx`, `UserCard.tsx`.
   - Replace static `COLORS` references with dynamic `colors` tokens.
3. **Step 3: Component Catalog Integration**:
   - Integrate `PageHeader`, `SearchBar`, `EmptyState`, `ThemeToggle`, `Button`, and `AnimatedCard` into `EmployeesScreenContent` and `UsersScreenContent`.
4. **Step 4: Layout & Motion Enhancement**:
   - Apply `maxWidth: 1200` and `alignSelf: 'center'` constraints.
   - Wrap card items in `AnimatedCard` with staggered `delay`.
5. **Step 5: Verification**:
   - Run `pnpm --filter ntc-edge-internal check-types` to verify zero type regressions.
