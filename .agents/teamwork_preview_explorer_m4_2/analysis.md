# Architectural Analysis & Redesign Strategy: Core Feature Screens (Milestone 4)

**Target Directory:** `apps/frontend/internal/src/features/`  
**Target Screens:**
1. `queue/screens/ActivitiesScreen.tsx`
2. `queue/screens/ApplicationReviewScreen.tsx`
3. `roles-permission/screens/RolesPermissionScreen.tsx`

---

## Executive Summary

This document provides an exhaustive, read-only architectural analysis and redesign specification for splitting three single-file React Native/Expo screens into 4-file modular multi-platform architectures (`.native.tsx`, `.web.tsx`, `.desktop.tsx`, and master selector `.tsx`). 

All recommendations strictly adhere to:
- **Project Monorepo Customization Rules** (`.agents/AGENTS.md`)
- **Strict TypeScript Typing** (ZERO `any`, ZERO `as` type assertions, ZERO `!` non-null assertions)
- **Responsive Layout & Web/Desktop Constraints** (`maxWidth: 1200`, `alignSelf: 'center'`)
- **Design System & Theme Integration** (`@edge/ui` components & `useTheme()` hook)
- **Motion Design & Micro-interactions** (Mount fade-in/slide-up via `AnimatedCard`, press/hover feedback, `SkeletonLoader` states, accessibility `reduceMotion` handling)
- **100% Functional Logic Preservation** (Context providers, SWR/API hooks, role/permission gates, state mutation routines).

---

## 1. Comprehensive Audit of Target Screens

### 1.1 Screen 1: `ActivitiesScreen.tsx`
- **File Location:** `apps/frontend/internal/src/features/queue/screens/ActivitiesScreen.tsx` (78 lines)
- **Current Architecture:**
  - Wraps root view in `<ApplicationProvider>` from `../context/ApplicationContext`.
  - Inner component `ActivitiesContent` inspects viewport width via `useWindowDimensions()` with `DESKTOP_BREAKPOINT = 1024`.
  - Accesses `selectedId` and `setSelectedId` from `useApplications()`.
  - Manages boolean state `isPanelCollapsed`.
  - **Desktop Layout (`width >= 1024`):** Side-by-side split layout (`flexDirection: 'row'`). Left: `ActivitiesFeedPane` (hidden when `isPanelCollapsed` is `true`). Right: `ApplicationReviewScreen` passed with `onClose` and `onCollapse`.
  - **Mobile Layout (`width < 1024`):** Stack layout. Renders `ActivitiesFeedPane` when `selectedId === null`; renders `ApplicationReviewScreen` when an application is selected.
- **Issues & Deficiencies:**
  - Hardcoded background color `COLORS.neutral.white` instead of dynamic theme token `colors.bg`.
  - Lacks `@edge/ui` `PageHeader` for web/desktop views.
  - Lacks motion mount animations for smooth view transitions between feed and detail views.
  - Does not enforce `maxWidth: 1200` layout wrapper on web.

---

### 1.2 Screen 2: `ApplicationReviewScreen.tsx`
- **File Location:** `apps/frontend/internal/src/features/queue/screens/ApplicationReviewScreen.tsx` (2399 lines)
- **Current Architecture:**
  - Large monolithic file containing inline components: `SectionHeader`, `InfoRow`, `BasicInfoTab`, `ApplicationDetailsTab`, `RequirementsTab`, `SoaPaymentTab`, and `ApplicationReviewScreen`.
  - **Props Interface:**
    ```typescript
    interface ApplicationReviewScreenProps {
      onClose: () => void;
      onCollapse?: () => void;
      isCollapsed?: boolean;
    }
    ```
  - **Hooks & Context Consumption:**
    - `useApplications()`: `applications`, `selectedApplication`, `activeQueueTab`, `updateApplication`, `setSelectedId`.
    - `useRole()`: `currentRole`.
    - `usePermissions()`: `canApprove`, `canDecline`, `canEndorse`, `canVerifyCashier`.
  - **State Management:**
    - `innerTab`: `"basic" | "details" | "requirements" | "soa"`.
    - Modal Visibility: `showApprove`, `showDecline`, `showEndorse`, `showCashier`.
    - Inline Edit Drafts: `refDraft`, `permitDraft`, `noteDraft`, `lnDraft`, `fnDraft`, `mnDraft`, `dobDraft`, `orDraft`, `dueDraft`.
    - Collapsible Audit Trail: `auditOpen` (boolean).
  - **Role & Action Logic:**
    - Evaluates `isEditable` status gate: `currentRole !== "Admin" && activeQueueTab === "pending" && (status is "For Approval" | "For Verification" | "Returned")`.
    - Action bar renders `CashierVerificationModal` launcher for cashier roles, or `ApproveModal`, `DeclineModal`, `EndorseModal` launchers based on permissions.
  - **Issues & Violations Identified:**
    - **Strict Typing Violation at Line 1795:** `} as unknown as object,` — violates strict typing rules.
    - **Theme Awareness:** Extensive hardcoded hex colors (`#F59E0B`, `#06B6D4`, `#EF4444`, `#8B5CF6`, `#FEF9C3`, `#FDE68A`, `#92400E`, `#EFF6FF`, `#10B981`, etc.) instead of consuming `useTheme()`.
    - **Empty State:** Custom styled empty panel instead of consuming `@edge/ui` `EmptyState`.
    - **Status Pill:** Hardcoded `getStatusStyle` function instead of `@edge/ui` `StatusBadge`.

---

### 1.3 Screen 3: `RolesPermissionScreen.tsx`
- **File Location:** `apps/frontend/internal/src/features/roles-permission/screens/RolesPermissionScreen.tsx` (854 lines)
- **Current Architecture:**
  - Integrates backend SWR API hooks from `@edge/api`:
    - `useAdminRoles()`: `roles`, `isApiLoading`, `refetch`.
    - `usePermissionsCatalog()`: `categories`, `isCatalogLoading`.
    - `useRolePermissions(selectedRole?.id)`: `permissionKeys`, `isPermissionsLoading`, `refetchPermissions`.
    - `apiClient`: POST/DELETE requests for role creation, role deletion, permission assignment (`/api/v2/role-permissions/assign`), and revocation (`/api/v2/role-permissions/revoke`).
  - Components consumed: `RoleCard`, `PermissionCategoryCard`, `AddRoleModal`, `DeleteRoleConfirmModal`.
  - State Management: `localRoles`, `selectedRoleId`, `searchQuery`, `savedRolePermissions`, `draftRolePermissions`, `isSubmitting`, `isAddModalOpen`, `roleToDelete`, `toastMessage`, `mobileView` (`'roles' | 'config'`).
  - Feature Capabilities: Search filtering over system and custom roles, role creation modal, role deletion modal with permission map cleanup, batch permission update handler with diff calculation (`added` vs `removed`), Select All / Deselect All toggle across all categories, unsaved changes detection badge, toast alerts.
- **Issues & Deficiencies:**
  - **Theme Awareness:** Uses dark background `#0B1953` and hardcoded colors (`#93C5FD`, `#2563EB`, `#FEF3C7`, `#FCD34D`, `#D97706`, `#92400E`, `#F8FAFC`, `#DBEAFE`, `#BFDBFE`, `#1E40AF`, `#E2E8F0`, `#1D4ED8`) without dark mode theme adaptation via `useTheme()`.
  - **UI Component Usage:** Uses raw `TextInput` for role search instead of `@edge/ui` `SearchBar`. Uses raw `ActivityIndicator` instead of `@edge/ui` `SkeletonLoader`.
  - **Layout Constraints:** Missing `maxWidth: 1200` and `alignSelf: 'center'` constraints on desktop/web shell.

---

## 2. Shared Logic & Platform-Splitting Plan

For each screen feature, the single file will be split into 4 files adhering to the NTC-EDGE monorepo conventions:

```
[Feature]Screen.tsx          <-- Master Platform Selector
[Feature]Screen.native.tsx   <-- Mobile Platform Variant (iOS/Android)
[Feature]Screen.web.tsx      <-- Responsive Web Variant (Browsers)
[Feature]Screen.desktop.tsx  <-- Desktop Variant (macOS/Windows)
```

---

### 2.1 Refactoring Plan for `ActivitiesScreen`

#### 1. `ActivitiesScreen.tsx` (Master Selector)
```typescript
import React from "react";
import { Platform } from "react-native";
import { ActivitiesScreen as WebScreen } from "./ActivitiesScreen.web";
import { ActivitiesScreen as NativeScreen } from "./ActivitiesScreen.native";
import { ActivitiesScreen as DesktopScreen } from "./ActivitiesScreen.desktop";

export function ActivitiesScreen() {
  if (Platform.OS === "web") {
    return <WebScreen />;
  }
  if (Platform.OS === "macos" || Platform.OS === "windows") {
    return <DesktopScreen />;
  }
  return <NativeScreen />;
}
```

#### 2. `ActivitiesScreen.native.tsx` (Mobile Variant)
- **Layout & Structure:** Single-column touch view.
  - If no application is selected (`selectedId === null`), renders `ActivitiesFeedPane` inside an `AnimatedCard` or screen fade view.
  - If an application is selected, renders `ApplicationReviewScreen` full-screen with mobile navigation header and back button (`setSelectedId(null)`).
- **Theme & Motion:** Uses `useTheme()` for background (`colors.bg`), mount slide animation for opening application review details.

#### 3. `ActivitiesScreen.web.tsx` (Web Variant)
- **Layout & Structure:** Web container constrained with `maxWidth: 1200`, `alignSelf: 'center'`.
  - Incorporates `@edge/ui` `PageHeader` ("Queue Command Center", subtitle "Review and process incoming telemetry applications").
  - Dynamically evaluates viewport width via `useWindowDimensions()`. Responsive 2-column flex row on desktop web widths (`width >= 1024`), or stack view on mobile browser widths.
- **Theme & Components:** Full theme awareness via `useTheme()`, `PageHeader`, `ThemeToggle` integration.

#### 4. `ActivitiesScreen.desktop.tsx` (Desktop Variant)
- **Layout & Structure:** Dedicated desktop workspace layout.
  - Side-by-side workspace with collapsible left pane toggle (`isPanelCollapsed`).
  - High density headers, keyboard shortcut awareness.

---

### 2.2 Refactoring Plan for `ApplicationReviewScreen`

#### 1. `ApplicationReviewScreen.tsx` (Master Selector)
```typescript
import React from "react";
import { Platform } from "react-native";
import { ApplicationReviewScreen as WebScreen } from "./ApplicationReviewScreen.web";
import { ApplicationReviewScreen as NativeScreen } from "./ApplicationReviewScreen.native";
import { ApplicationReviewScreen as DesktopScreen } from "./ApplicationReviewScreen.desktop";

interface ApplicationReviewScreenProps {
  onClose: () => void;
  onCollapse?: () => void;
  isCollapsed?: boolean;
}

export function ApplicationReviewScreen(props: ApplicationReviewScreenProps) {
  if (Platform.OS === "web") {
    return <WebScreen {...props} />;
  }
  if (Platform.OS === "macos" || Platform.OS === "windows") {
    return <DesktopScreen {...props} />;
  }
  return <NativeScreen {...props} />;
}
```

#### 2. Sub-component Extraction & Strict Typing Fixes
- Fix line 1795 type assertion:
  - **Before:** `} as unknown as object,`
  - **After:** Remove cast completely and define `formCardLeft` with clean `ViewStyle` typing:
    ```typescript
    formCardLeft: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SPACING[8],
      flex: 1,
    },
    ```
- Replace hardcoded status styling with `@edge/ui` `StatusBadge` component.
- Replace custom empty panel with `@edge/ui` `EmptyState` component.

#### 3. `ApplicationReviewScreen.native.tsx` (Mobile Variant)
- Mobile-optimized tab bar using horizontal scrollable tab chips (`Basic Info`, `Details`, `Requirements`, `SOA & Payment`).
- Action bar fixed to bottom screen edge with large touch targets.
- Modal dialogs (`ApproveModal`, `DeclineModal`, `EndorseModal`, `CashierVerificationModal`) natively presented.

#### 4. `ApplicationReviewScreen.web.tsx` (Web Variant)
- Web layout container with `maxWidth: 1200`, `alignSelf: 'center'`.
- Top header with `PageHeader` and view/print quick actions.
- Content sections wrapped in `@edge/ui` `AnimatedCard` with subtle shadow and border theme variables.
- Full dark mode support using `useTheme()`.

#### 5. `ApplicationReviewScreen.desktop.tsx` (Desktop Variant)
- Compact desktop layout supporting split-pane view inside `ActivitiesScreen.desktop`.
- Collapsible section headers, keyboard navigation for modal forms.

---

### 2.3 Refactoring Plan for `RolesPermissionScreen`

#### 1. `RolesPermissionScreen.tsx` (Master Selector)
```typescript
import React from "react";
import { Platform } from "react-native";
import { RolesPermissionScreen as WebScreen } from "./RolesPermissionScreen.web";
import { RolesPermissionScreen as NativeScreen } from "./RolesPermissionScreen.native";
import { RolesPermissionScreen as DesktopScreen } from "./RolesPermissionScreen.desktop";

export function RolesPermissionScreen() {
  if (Platform.OS === "web") {
    return <WebScreen />;
  }
  if (Platform.OS === "macos" || Platform.OS === "windows") {
    return <DesktopScreen />;
  }
  return <NativeScreen />;
}
```

#### 2. Component Enhancements & Design System Upgrades
- Replace raw `TextInput` search box with `@edge/ui` `SearchBar` (supports debounced search callback and clear button).
- Replace raw `ActivityIndicator` loading views with `@edge/ui` `SkeletonLoader` (variant rectangular/text for role cards and permission category cards).
- Wrap role items and category blocks in `@edge/ui` `AnimatedCard`.

#### 3. `RolesPermissionScreen.native.tsx` (Mobile Variant)
- Two-stage master-detail mobile view controlled by `mobileView` (`'roles' | 'config'`).
- In `'roles'` view: Displays header, role search (`SearchBar`), `SkeletonLoader` during API loading, and scrollable `RoleCard` list.
- In `'config'` view: Displays header back button (`setMobileView('roles')`), role name, select all button, permission category matrix, and sticky update button.

#### 4. `RolesPermissionScreen.web.tsx` (Web Variant)
- Multi-column web dashboard with container constraint `maxWidth: 1200`, `alignSelf: 'center'`.
- Top header featuring `@edge/ui` `PageHeader` ("Roles & Permission Governance", subtitle "Manage RBAC access policies and granular tenant permissions").
- Left column (380px fixed width): Hero card, `SearchBar`, role list in `AnimatedCard` wrappers.
- Right column (flexible width): Category matrix, select all quick action, sticky footer with unsaved changes indicator.
- Full dark mode compatibility using dynamic `useTheme()` tokens (`colors.cardBg`, `colors.border`, `colors.text`).

#### 5. `RolesPermissionScreen.desktop.tsx` (Desktop Variant)
- Desktop administration view with side-by-side Master-Detail panel layout.
- High data density layout, immediate keyboard accessibility for search and toggle selection.

---

## 3. `@edge/ui` Component Availability & Integration Matrix

| Component | `@edge/ui` Export | Used In Screen | Usage Strategy |
| :--- | :--- | :--- | :--- |
| `PageHeader` | `export * from './components/PageHeader';` | Web & Desktop variants of all 3 screens | Standardized header with title, subtitle, back button, and action slot |
| `SearchBar` | `export * from './components/SearchBar';` | `RolesPermissionScreen` (All variants) | Filter system and custom roles with debouncing and clear action |
| `SkeletonLoader` | `export * from './components/SkeletonLoader';` | `RolesPermissionScreen` & `ApplicationReviewScreen` | Animated pulse placeholder while fetching API roles & catalog |
| `AnimatedCard` | `export * from './components/AnimatedCard';` | All 3 screen variants | Card container with mount fade/slide animation, hover effects, theme awareness |
| `EmptyState` | `export * from './components/EmptyState';` | `ApplicationReviewScreen` & `RolesPermissionScreen` | Display when no application/role is selected or search query yields zero results |
| `StatusBadge` | `export * from './tables/StatusBadge';` | `ApplicationReviewScreen` | Display application status ("Approved", "For Approval", "For Verification", etc.) |
| `Button` | `export * from './components/Button';` | All 3 screens | Action buttons (Approve, Decline, Endorse, Save Note, Update Permissions) |
| `ThemeToggle` | `export * from './components/ThemeToggle';` | Web & Desktop headers | Quick dark/light mode toggle control |
| `useTheme` | `export { useTheme } from './theme/useTheme';` | All variants across all 3 screens | Dynamic theme color retrieval (`colors.bg`, `colors.cardBg`, `colors.text`, etc.) |

---

## 4. Strict Typing & Quality Assurance Audit

1. **Zero `any` Type:**
   - Explicitly type all callback parameters, API responses, event handlers, and data structures.
   - Example: Ensure `ApplicationData`, `Role`, `PermissionCategory`, and event handlers are fully typed.

2. **Zero `as` Type Assertions:**
   - Audit and eliminate `as` casts (e.g., line 1795 in `ApplicationReviewScreen.tsx`).
   - Use standard object style declarations or custom type guards (`isRecord`, `isIconName`) for dynamic checks.

3. **Zero `!` Non-null Assertions:**
   - Guard optional props and state variables with explicit check logic (e.g., `if (selectedRole !== null && selectedRole !== undefined)`).

---

## 5. Logic Preservation & Verification Plan

### Preserved Core Functionality
1. **Queue Context State:** Application selection, queue tab filtering ("pending" vs "history"), approval updates, inline edits, modal interactions.
2. **Roles & Permissions API Integration:** SWR hooks (`useAdminRoles`, `useRolePermissions`, `usePermissionsCatalog`), API mutations via `apiClient` POST/DELETE, diffing algorithm for permission updates.
3. **Role-Based Access Controls:** Action availability gated by `currentRole`, `activeQueueTab`, `canApprove`, `canDecline`, `canEndorse`, and `canVerifyCashier`.

### Verification Steps for Implementation
1. **Compilation Check:** Run Expo/TypeScript check: `npx tsc --noEmit` within `apps/frontend/internal`.
2. **Functional Test:** Verify screen rendering on Web, Mobile (Android/iOS emulator), and Desktop targets.
3. **Theme & Motion Audit:** Test dark/light theme switching and verify accessibility `reduceMotion` toggle behavior.
