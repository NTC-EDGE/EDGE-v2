# Empirical Challenge & Audit Report — Milestone 4 Core Feature Screens

**Agent**: `teamwork_preview_challenger_m4_2`  
**Milestone**: Milestone 4 (Core Feature Screens Redesign)  
**Target Package**: `apps/frontend/internal` (`ntc-edge-internal`)  
**Audit Scope**: All core feature screens in `apps/frontend/internal/src/features/`  
**Overall Verdict**: ❌ **FAIL** (Build verification failed with 15 TypeScript errors; Theme token integration incomplete with hardcoded hex bypasses across multiple screens)

---

## Challenge Summary

| Verification Category | Status | Details |
|---|---|---|
| **1. File Existence & Architecture Split** | ✅ **PASS** | All 16 screen families across 9 core feature domains implement 4-file split (`.native.tsx`, `.web.tsx`, `.desktop.tsx`, `.tsx`). |
| **2. Theme Token Integration** | ⚠️ **PARTIAL / FAIL** | `EmployeesScreen.native` and `UsersScreen.native` miss `useTheme()` hook calls. Hardcoded hex colors bypass dynamic theme tokens in 10+ screens (e.g. `UsersScreenContent`, `RolesPermissionScreen`, `FeedbackScreen`, `ApplicationReviewScreenContent`). |
| **3. Type Check Verification** | ❌ **FAIL** | `pnpm --filter ntc-edge-internal check-types` failed with **15 TypeScript compilation errors** in `LandingScreen`, `OnboardingScreen`, and `SettingsScreen`. |

---

## Detailed Audit Results

### 1. Platform Architecture Completeness Audit

Every feature screen component family in `apps/frontend/internal/src/features/` was checked for the mandatory 4-layer file structure:
- `<ScreenName>.native.tsx` (Mobile Native View)
- `<ScreenName>.web.tsx` (Mobile/Tablet Web Responsive View)
- `<ScreenName>.desktop.tsx` (Desktop Web Multi-pane View)
- `<ScreenName>.tsx` (Master Platform Selector Component)

| Domain Feature | Master Screen Component | `.native` | `.web` | `.desktop` | `.tsx` | Selector Status | Overall Split |
|---|---|---|---|---|---|---|---|
| **Announcements** | `AnnouncementsScreen` | ✅ | ✅ | ✅ | ✅ | Platform/Dimension Delegated | **PASS** |
| **Audit Logs** | `AuditLogsScreen` | ✅ | ✅ | ✅ | ✅ | Platform/Dimension Delegated | **PASS** |
| **Dashboard** | `DashboardScreen` | ✅ | ✅ | ✅ | ✅ | Platform/Dimension Delegated | **PASS** |
| **Employees** | `EmployeesScreen` | ✅ | ✅ | ✅ | ✅ | Platform/Dimension Delegated | **PASS** |
| **Feedback** | `FeedbackScreen` | ✅ | ✅ | ✅ | ✅ | Platform/Dimension Delegated | **PASS** |
| **Form Builder** | `FormBuilderScreen` | ✅ | ✅ | ✅ | ✅ | Platform/Dimension Delegated | **PASS** |
| **Roles & Permission** | `RolesPermissionScreen` | ✅ | ✅ | ✅ | ✅ | Platform/Dimension Delegated | **PASS** |
| **Settings (Admin)** | `AdminSettingsScreen` | ✅ | ✅ | ✅ | ✅ | Platform/Dimension Delegated | **PASS** |
| **Settings (Account)** | `SettingsScreen` | ✅ | ✅ | ✅ | ✅ | Platform/Dimension Delegated | **PASS** |
| **Users** | `UsersScreen` | ✅ | ✅ | ✅ | ✅ | Platform/Dimension Delegated | **PASS** |
| **Queue Activities** | `ActivitiesScreen` | ✅ | ✅ | ✅ | ✅ | Platform/Dimension Delegated | **PASS** |
| **Application Review**| `ApplicationReviewScreen` | ✅ | ✅ | ✅ | ✅ | Platform/Dimension Delegated | **PASS** |
| **Internal Login** | `InternalLoginScreen` | ✅ | ✅ | ✅ | ✅ | Platform/Dimension Delegated | **PASS** |
| **Forgot Password** | `ForgotPasswordScreen` | ✅ | ✅ | ✅ | ✅ | Platform/Dimension Delegated | **PASS** |
| **Landing** | `LandingScreen` | ✅ | ✅ | ✅ | ✅ | Platform/Dimension Delegated | **PASS** |
| **Onboarding** | `OnboardingScreen` | ✅ | ✅ | ✅ | ✅ | Platform/Dimension Delegated | **PASS** |

---

### 2. Theme Token Integration & Dynamic Color Audit

The theme token integration audit evaluates whether target screens consume `useTheme()` from `@edge/ui` and apply dynamic theme tokens for backgrounds, cards, text, and borders without bypassing theme state with hardcoded hex colors.

#### Identified Theme Token Violations:

1. **Missing `useTheme()` Hooks**:
   - `EmployeesScreen.native.tsx`: Missing `useTheme()` initialization.
   - `UsersScreen.native.tsx`: Missing `useTheme()` initialization.

2. **Hardcoded Color Hex Bypasses**:
   - **`UsersScreenContent.tsx`** (13 hardcoded hex codes):  
     `#64748B`, `#1D4ED8`, `#EFF6FF`, `#2563EB`, `#F0FDF4`, `#16A34A`, `#FEF3C7`, `#D97706`, `#F3E8FF`, `#9333EA`, `#E2E8F0`, `#FFFFFF`, `#BFDBFE`.  
     *Impact*: Status badges, role tags, action buttons, and card background colors remain static when switching between light and dark themes.
   - **`RolesPermissionScreen`** (`.desktop.tsx`, `.web.tsx`, `.native.tsx`) (10 hardcoded hex codes):  
     `#FEE2E2`, `#E0F2FE`, `#FFFFFF`, `#10B981`, `#0F172A`, `#F8FAFC`, `#3B82F6`, `#FEF3C7`, `#D97706`, `#92400E`.  
     *Impact*: Permission category indicators and role badges do not respond to theme tokens.
   - **`ApplicationReviewScreenContent.tsx`** (8 hardcoded hex codes):  
     `#F59E0B`, `#06B6D4`, `#EF4444`, `#8B5CF6`, `#FEF9C3`, `#FDE68A`, `#92400E`, `#EFF6FF`.
   - **`FeedbackScreen`** (`.desktop.tsx`, `.web.tsx`, `.native.tsx`) (7 hardcoded hex codes):  
     `#F59E0B`, `#CBD5E1`, `#1E293B`, `#EFF6FF`, `#3B82F6`, `#EF4444`, `#10B981`.
   - **`SettingsScreen`** (`.desktop.tsx`, `.web.tsx`, `.native.tsx`) (4 hardcoded hex codes):  
     `#FFFFFF`, `#CBD5E1`, `#3B82F6`, `#000`.
   - **`AdminSettingsScreen`** (`.desktop.tsx`, `.web.tsx`, `.native.tsx`):  
     Contains hardcoded `#000` text/border styling instead of dynamic `colors.text` / `colors.border`.
   - **`AnnouncementsScreen`, `DashboardScreen`, `FormBuilderScreen`, `LandingScreen`, `OnboardingScreen`**:  
     Contain static `#FFFFFF` card/container background properties bypassing `theme.colors.surface` / `theme.colors.card`.

---

### 3. Build & Type Check Verification Results

Command executed:
```bash
cmd /c pnpm --filter ntc-edge-internal check-types
```

**Result**: ❌ **Exit Status 1 (Failed)** with 15 TypeScript compilation errors.

#### Exact Error Breakdown:

```
src/features/login/components/LandingScreen.desktop.tsx(17,16): error TS2339: Property 'navigate' does not exist on type 'string | ...'.
src/features/login/components/LandingScreen.desktop.tsx(21,16): error TS2339: Property 'navigate' does not exist on type 'string | ...'.
src/features/login/components/LandingScreen.native.tsx(18,16): error TS2339: Property 'navigate' does not exist on type 'string | ...'.
src/features/login/components/LandingScreen.native.tsx(22,16): error TS2339: Property 'navigate' does not exist on type 'string | ...'.
src/features/login/components/LandingScreen.web.tsx(18,16): error TS2339: Property 'navigate' does not exist on type 'string | ...'.
src/features/login/components/LandingScreen.web.tsx(22,16): error TS2339: Property 'navigate' does not exist on type 'string | ...'.

src/features/login/components/OnboardingScreen.desktop.tsx(47,18): error TS2339: Property 'navigate' does not exist on type 'string | ...'.
src/features/login/components/OnboardingScreen.desktop.tsx(52,16): error TS2339: Property 'navigate' does not exist on type 'string | ...'.
src/features/login/components/OnboardingScreen.native.tsx(47,18): error TS2339: Property 'navigate' does not exist on type 'string | ...'.
src/features/login/components/OnboardingScreen.native.tsx(52,16): error TS2339: Property 'navigate' does not exist on type 'string | ...'.
src/features/login/components/OnboardingScreen.web.tsx(47,18): error TS2339: Property 'navigate' does not exist on type 'string | ...'.
src/features/login/components/OnboardingScreen.web.tsx(52,16): error TS2339: Property 'navigate' does not exist on type 'string | ...'.

src/features/settings/screens/SettingsScreen.desktop.tsx(55,16): error TS2339: Property 'navigate' does not exist on type 'string | ...'.
src/features/settings/screens/SettingsScreen.native.tsx(61,16): error TS2339: Property 'navigate' does not exist on type 'string | ...'.
src/features/settings/screens/SettingsScreen.web.tsx(55,16): error TS2339: Property 'navigate' does not exist on type 'string | ...'.
```

#### Root Cause Analysis:
In `LandingScreen` (`.desktop`, `.web`, `.native`), `OnboardingScreen` (`.desktop`, `.web`, `.native`), and `SettingsScreen` (`.desktop`, `.web`, `.native`), `useNavigation` is imported directly from `@react-navigation/native` with generic parameter `<NavigationProp<ParamListBase>>`. TypeScript type resolution fails because `useNavigation<NavigationProp<ParamListBase>>()` resolves to a union type including `string`, causing property `navigate` to be inaccessible on `navigation`.

---

## Actionable Recommendations for Implementation Team

1. **Fix Navigation Hook Type Signature**:
   Replace `@react-navigation/native`'s `useNavigation<NavigationProp<ParamListBase>>()` with `@edge/ui`'s typed `useNavigation` hook or proper stack param list typing across `LandingScreen`, `OnboardingScreen`, and `SettingsScreen`.
2. **Refactor Hardcoded Hex Colors to Theme Tokens**:
   Replace static hex codes (`#FFFFFF`, `#2563EB`, `#64748B`, `#10B981`, `#EF4444`, etc.) in `UsersScreenContent`, `RolesPermissionScreen`, `FeedbackScreen`, `ApplicationReviewScreenContent`, and `SettingsScreen` with dynamic tokens from `useTheme().colors` (e.g. `colors.card`, `colors.primary`, `colors.danger`, `colors.success`).
3. **Initialize `useTheme()` in Native Screens**:
   Ensure `EmployeesScreen.native.tsx` and `UsersScreen.native.tsx` explicitly call `useTheme()` and pass theme parameters to content wrappers.
