# Settings Screens Exploration & Architecture Analysis Report

**Milestone**: Milestone 3 — Settings Screens Exploration  
**Agent**: Explorer 2 (`explorer_m3_2`)  
**Target Feature Path**: `apps/frontend/internal/src/features/settings/`  
**Date**: 2026-07-29  

---

## 1. Executive Summary

This report presents a comprehensive investigation and architectural refactoring proposal for the Settings feature screens within `apps/frontend/internal/src/features/settings/`.

The primary objective is to modernize and structure the Settings screens to strictly align with the workspace rules established in `AGENTS.md`, design system guidelines in `@edge/ui`, and platform adaptation protocols across Web, Desktop, and Native platforms.

### Target Screens Analyzed
1. **`SettingsScreen.tsx`** (User Account Settings) — Currently a 1,821-line monolithic screen component.
2. **`AdminSettingsScreen.tsx`** (System / Regional Administration Settings) — Currently a 456-line monolithic screen component.

---

## 2. Inventory of Current Settings Codebase

| Path | Lines | Role & Key Responsibilities |
|---|---|---|
| `screens/SettingsScreen.tsx` | 1,821 | Manages User Account Profile, Clerk Email Verification (OTP), Password Security, Region Selection, Local Theme Customization, and Help & Support. |
| `screens/AdminSettingsScreen.tsx` | 456 | System Administration panel managing Regional Configurations, Branch Offices, Application Requirements, Fees, and 3-Level Service Catalog Tree. |
| `components/RegionalConfigTab.tsx` | 736 | Tab component rendering Regional Email Notification banner, 2x2 regional config card grid, branch stats, and branch offices filter/list. |
| `components/ServiceTreeConfigTab.tsx` | 1,945 | 3-Level Service & Prerequisites Studio handling Service Catalog, Service Variants, Application Requirements, Guidance Notes, and Element Fees. |
| `components/AdminSettingsModal.tsx` | 1,437 | Multi-purpose modal handling Create/Edit for Configs, Branch Offices, Requirements, Fees, Guidance Notes, and Form Templates. |
| `components/DeleteAdminItemModal.tsx` | 156 | Administrative confirmation modal dialog for deleting items. |
| `components/AnnouncementsTab.tsx` | ~200 | Admin tab for managing system announcements. |
| `components/AppRequirementsTab.tsx` | ~300 | Requirements management tab. |
| `components/AuditLogsTab.tsx` | ~150 | Audit log view tab. |
| `components/FeedbackTab.tsx` | ~250 | Feedback overview tab. |
| `components/FeesPaymentsTab.tsx` | ~300 | Fees & payments configuration tab. |
| `components/FormBuilderTab.tsx` | ~400 | Form builder list tab. |
| `components/NotesTab.tsx` | ~200 | Guidance notes list tab. |
| `components/RolePermissionsTab.tsx` | ~250 | Role permissions tab. |
| `components/VisualFormBuilderModal.tsx` | ~500 | Form builder visual modal. |
| `data/mockAdminSettings.ts` | 101 | Data interfaces (`RegionalConfigCard`, `BranchOffice`, `FeePaymentItem`, `NoteItem`, etc.) and initial data arrays. |

---

## 3. Gap Analysis against Architectural & Quality Requirements

### Gap 1: Missing Platform Multi-Screen Split
* **Observation**: Both `SettingsScreen.tsx` and `AdminSettingsScreen.tsx` are monolithic single-file implementations. Neither screen currently possesses the mandatory `.native.tsx`, `.web.tsx`, and `.desktop.tsx` platform files or master selector `.tsx`.
* **Requirement**: Each screen module MUST be split into 4 files:
  1. `[Screen].native.tsx` — Touch-first layout with touchable targets (min 44px), scrollable views, compact headers, touch-friendly tab bar.
  2. `[Screen].web.tsx` — Desktop/browser responsive layout with `maxWidth: 1200`, sidebar / horizontal tabs navigation, hover states, `alignSelf: 'center'`.
  3. `[Screen].desktop.tsx` — Electron/Windows/macOS native-feel view with fixed sidebars, keyboard accessibility, `maxWidth: 1200`, `alignSelf: 'center'`.
  4. `[Screen].tsx` — Clean master selector component routing based on `Platform.OS`.

### Gap 2: Theme Awareness & Dark Mode Palette
* **Observation**:
  - `SettingsScreen.tsx` contains local `[theme, setTheme]` state stored in `localStorage`, but does NOT connect to the global `@edge/ui` `useTheme()` hook or `setMode()` function.
  - Colors are heavily hardcoded across both files (e.g. `#F8FAFC`, `#FFFFFF`, `#0F172A`, `#1E3A8A`, `#E2E8F0`, `#475569`, `#1E293B`).
* **Requirement**:
  - Integrate `const { mode, setMode, colors, isDark } = useTheme()` from `@edge/ui`.
  - Wire the appearance theme switch in `SettingsScreen` directly to `setMode('light')` and `setMode('dark')`.
  - Use themed colors:
    - **Dark Theme Surface**: Slate 800 (`#1E293B`) for card containers (`colors.cardBg`).
    - **Dark Theme Canvas**: Slate 900 (`#0F172A`) for outer background (`colors.bg`).
    - **Dark Theme Text**: Slate 50 (`#F8FAFC`) for primary text (`colors.text`), Slate 400 (`#94A3B8`) for muted text (`colors.textMuted`).
    - **Light Theme Canvas**: Slate 50 (`#F8FAFC`) background, White (`#FFFFFF`) card surfaces, Slate 900 (`#0F172A`) text.

### Gap 3: Mobile-First Layout Rules
* **Observation**: `SettingsScreen.tsx` hardcodes `maxWidth: 1000` on `innerContentWrapper`, while `AdminSettingsScreen.tsx` lacks an outer container max width constraint.
* **Requirement**:
  - All web and desktop root container wrappers MUST enforce `maxWidth: 1200` combined with `alignSelf: 'center'`.
  - Mobile layouts (`.native.tsx`) MUST stretch 100% width on small viewports with mobile padding (`paddingHorizontal: 16`).

### Gap 4: Motion Design & Accessibility
* **Observation**: Screen changes and tab transitions occur abruptly with no entrance animations. Skeleton loading states are absent during initial Clerk user load or backend SWR API fetches.
* **Requirement**:
  - Implement mount fade-in and slide-up animations for tab content groups.
  - Add smooth hover (`activeOpacity={0.8}` or CSS transitions on web) and press feedback.
  - Implement skeleton loading placeholders (`SkeletonLoader` from `@edge/ui`) while profile or SWR data is loading.
  - Respect `reduceMotion`: check `window.localStorage.getItem('edge-settings-reduce-motion') === 'true'` or system settings to conditionally disable reanimated/animated transitions.

### Gap 5: Type Safety & Code Quality Violations
* **Observation**:
  1. `SettingsScreen.tsx:135`: `window.localStorage.getItem('edge-settings-theme') as 'light' | 'dark' | null` — Type assertion (`as`).
  2. `SettingsScreen.tsx:219`: `setPendingEmailResource(emailRes as EmailAddressResourceType)` — Type assertion (`as`).
  3. `SettingsScreen.tsx:70-73`: Untyped `Reflect.get()` and `Reflect.apply()` calls for navigation.
  4. Manual state management instead of standard `react-hook-form` + `zodResolver`.
  5. Untyped error handling (`getErrorMessage(error: unknown)` with `Reflect.get`).
* **Requirement**:
  - ZERO TypeScript errors (`tsc --noEmit` must pass cleanly).
  - ZERO `any` types.
  - ZERO `as` type assertions (use type guards, `z.enum()`, or typed helper methods).
  - ZERO `!` non-null assertions.
  - Formal Zod schemas (`profileSchema`, `securitySchema`) paired with `react-hook-form` and `@edge/api` `safeAsync`.

### Gap 6: Preserved Functionality
* **Requirement**:
  - Preserve all Clerk user actions (`clerkUser.update`, `createEmailAddress`, `prepareVerification`, `attemptVerification`, `updatePassword`).
  - Preserve all SWR API hooks in `AdminSettingsScreen` (`useRegions`, `useAdminFieldOffices`, `useAdminRequirements`, `useAdminFees`, `useAdminNotes`, `useAdminServices`).
  - Preserve all navigation routes (`Dashboard`, `AccountSettings`, `Settings`).

---

## 4. Proposed Refactoring Blueprint

### A. Directory Structure Proposal
```
apps/frontend/internal/src/features/settings/
├── components/
│   ├── AdminSettingsModal.tsx
│   ├── DeleteAdminItemModal.tsx
│   ├── RegionalConfigTab.tsx
│   ├── ServiceTreeConfigTab.tsx
│   └── ... (existing subcomponents)
├── data/
│   └── mockAdminSettings.ts
├── hooks/
│   ├── useProfileForm.ts
│   └── useSecurityForm.ts
├── schemas/
│   └── settingsSchemas.ts
└── screens/
    ├── AdminSettingsScreen.desktop.tsx
    ├── AdminSettingsScreen.native.tsx
    ├── AdminSettingsScreen.web.tsx
    ├── AdminSettingsScreen.tsx
    ├── SettingsScreen.desktop.tsx
    ├── SettingsScreen.native.tsx
    ├── SettingsScreen.web.tsx
    └── SettingsScreen.tsx
```

---

### B. Master Selector Blueprint (`SettingsScreen.tsx` & `AdminSettingsScreen.tsx`)

```tsx
// SettingsScreen.tsx
import React from 'react';
import { Platform } from 'react-native';
import { SettingsScreen as WebScreen } from './SettingsScreen.web';
import { SettingsScreen as NativeScreen } from './SettingsScreen.native';
import { SettingsScreen as DesktopScreen } from './SettingsScreen.desktop';

export function SettingsScreen() {
  if (Platform.OS === 'web') {
    return <WebScreen />;
  }

  if (Platform.OS === 'macos' || Platform.OS === 'windows') {
    return <DesktopScreen />;
  }

  return <NativeScreen />;
}
```

```tsx
// AdminSettingsScreen.tsx
import React from 'react';
import { Platform } from 'react-native';
import { AdminSettingsScreen as WebScreen } from './AdminSettingsScreen.web';
import { AdminSettingsScreen as NativeScreen } from './AdminSettingsScreen.native';
import { AdminSettingsScreen as DesktopScreen } from './AdminSettingsScreen.desktop';

export function AdminSettingsScreen() {
  if (Platform.OS === 'web') {
    return <WebScreen />;
  }

  if (Platform.OS === 'macos' || Platform.OS === 'windows') {
    return <DesktopScreen />;
  }

  return <NativeScreen />;
}
```

---

### C. Zod Schemas & Validation Blueprint (`schemas/settingsSchemas.ts`)

```typescript
import { z } from 'zod';

// 1. Profile Form Schema
export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().optional(),
  email: z.string().email('Invalid official email address'),
  position: z.string().min(1, 'Position is required'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  phone: z.string().min(1, 'Phone number is required'),
  role: z.string().min(1, 'User role is required'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

// 2. Security Form Schema
export const securitySchema = z
  .object({
    region: z.string().min(1, 'Region is required'),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword.length > 0) {
        return data.currentPassword && data.currentPassword.length > 0;
      }
      return true;
    },
    { message: 'Current password is required to set a new password', path: ['currentPassword'] }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword.length > 0) {
        return data.newPassword === data.confirmPassword;
      }
      return true;
    },
    { message: 'New password and confirmation do not match', path: ['confirmPassword'] }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword.length > 0) {
        const hasMinLength = data.newPassword.length >= 8;
        const hasUpperAndLower = /[A-Z]/.test(data.newPassword) && /[a-z]/.test(data.newPassword);
        const hasNumber = /[0-9]/.test(data.newPassword);
        return hasMinLength && hasUpperAndLower && hasNumber;
      }
      return true;
    },
    { message: 'New password does not meet security requirements', path: ['newPassword'] }
  );

export type SecurityFormValues = z.infer<typeof securitySchema>;
```

---

### D. Safe Async Hook & Verification Strategy

Using `@edge/api` `safeAsync`:
```typescript
import { safeAsync } from '@edge/api';

const handleSaveProfile = async (values: ProfileFormValues) => {
  const result = await safeAsync(async () => {
    if (!clerkUser) throw new Error('Authentication session not loaded');
    await clerkUser.update({
      firstName: values.firstName,
      lastName: values.lastName,
      username: values.username || undefined,
    });
    // persist custom fields safely
  });

  if (!result.success) {
    setProfileError(result.error);
  } else {
    setProfileSuccess('Profile updated successfully.');
  }
};
```

---

## 5. Verification & Testing Plan

1. **Type Checking**:
   Execute `cmd /c "pnpm --filter ntc-edge-internal check-types"` to verify zero TypeScript errors across all `.native.tsx`, `.web.tsx`, `.desktop.tsx`, `.tsx`, and schema/hook files.
2. **Quality Rules Verification**:
   Ensure zero occurrences of `any`, `as`, and `!` in all newly split settings files.
3. **Theme & Layout Verification**:
   Verify `useTheme()` hook applies Slate 800/900 dark colors on toggle and Slate 50 light colors on default. Verify `maxWidth: 1200` + `alignSelf: 'center'` constraints on Web and Desktop screens.
