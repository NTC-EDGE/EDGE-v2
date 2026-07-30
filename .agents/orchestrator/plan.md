# Execution Plan: NTC-EDGE Internal Expo App Visual Redesign

## Goal
Execute a complete visual-only redesign of the NTC-EDGE Internal Expo app (`apps/frontend/internal`) and shared UI package (`packages/ui`) with dark/light/system mode runtime theme, 3 platform variants per screen (.native, .web, .desktop, .tsx), redesigned shell components, smooth micro-interactions, comprehensive design system documentation (`DESIGN_SYSTEM.md`), and zero TypeScript compilation errors (`npx tsc --noEmit`).

## Milestones Breakdown

### Milestone 1: Theme System Infrastructure & Shared @edge/ui Components (R1, R2, R3, R7)
- **R1 Theme Infrastructure**:
  - `packages/ui/theme/tokens.ts` — Expand dark tokens (Slate 800/900 surfaces, dark text, adjusted brand/semantic colors).
  - `packages/ui/theme/ThemeProvider.tsx` & `useTheme()` hook — Light/Dark/System modes, AsyncStorage (native) / localStorage (web) persistence, OS `useColorScheme()` auto-detection.
- **R2 Update Existing Shared Components**:
  - Update Button, FormFieldInput, AlertToast, Avatar, DataTable, StatusBadge, ServiceFormModal to consume `useTheme()` palette.
- **R3 New Shared Components**:
  - Implement SkeletonLoader, AnimatedCard, ThemeToggle, PageHeader, EmptyState, SearchBar in `packages/ui/components/`.
  - Re-export everything from `packages/ui/index.ts`.
- **R7 Design System Documentation**:
  - Create `packages/ui/DESIGN_SYSTEM.md` with complete token reference, component APIs, dark mode usage, platform variant conventions, screen creation guide, and visual consistency rules.

### Milestone 2: Shell & App Chrome Redesign (R5)
- Redesign `AppLayout` (.native.tsx, .web.tsx, .desktop.tsx, .tsx), `Sidebar`, `MobileBottomTabBar`, and `StandardPageWrapper` in `apps/frontend/internal/src/components/shell/`.
- Integrate `ThemeToggle` into Sidebar and Header.
- Add theme transition and mount fade-in micro-interactions.

### Milestone 3: Auth, Settings & Dashboard Screens Redesign (R4)
- **Auth Screens**:
  - `login/components/LandingScreen` (.native, .web, .desktop, .tsx)
  - `login/components/InternalLoginScreen` (.native, .web, .desktop, .tsx)
  - `login/components/ForgotPasswordScreen` (.native, .web, .desktop, .tsx)
  - `login/components/OnboardingScreen` (.native, .web, .desktop, .tsx)
- **Settings Screens**:
  - `settings/screens/SettingsScreen` (.native, .web, .desktop, .tsx)
  - `settings/screens/AdminSettingsScreen` (.native, .web, .desktop, .tsx)
- **Dashboard Screen**:
  - `dashboard/screens/DashboardScreen` (.native, .web, .desktop, .tsx)

### Milestone 4: Core Feature Screens Redesign (R4, R6)
- **Screens**:
  - `announcements/screens/AnnouncementsScreen` (.native, .web, .desktop, .tsx)
  - `audit-logs/screens/AuditLogsScreen` (.native, .web, .desktop, .tsx)
  - `feedback/screens/FeedbackScreen` (.native, .web, .desktop, .tsx)
  - `form-builder/screens/FormBuilderScreen` (.native, .web, .desktop, .tsx)
  - `queue/screens/ActivitiesScreen` (.native, .web, .desktop, .tsx)
  - `queue/screens/ApplicationReviewScreen` (.native, .web, .desktop, .tsx)
  - `roles-permission/screens/RolesPermissionScreen` (.native, .web, .desktop, .tsx)
  - `employees/screens/EmployeesScreen` (.native, .web, .desktop, .tsx)
  - `users/screens/UsersScreen` (.native, .web, .desktop, .tsx)
- Add screen mount fade-in/slide-up animations, skeleton loading placeholders, press/hover micro-interactions.

### Milestone 5: E2E Verification & Type Checking Hardening (R8)
- Verify `npx tsc --noEmit` in `apps/frontend/internal`.
- Perform Forensic Integrity Audit to ensure zero cheating, genuine implementation, and zero TypeScript errors.
- Confirm all existing functionality, form logic, API calls, hooks, and navigation are intact.
