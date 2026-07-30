# Handoff Report — Explorer 3: ThemeProvider & Animation Completeness Audit

## 1. Observation

- **Root Integration (`App.tsx`)**: `apps/frontend/internal/App.tsx` (Lines 28–41) wraps `ClerkProvider -> AuthProvider -> RoleProvider -> PermissionProvider -> RootNavigator`. `ThemeProvider` from `@edge/ui` is **omitted** from `App.tsx`.
- **ThemeToggle in Settings**: `SettingsScreen` (.native, .desktop, .web) uses a standard React Native `<Switch>` (Lines 458–462 in `.native.tsx`) for dark mode toggling instead of `@edge/ui`'s `<ThemeToggle>` component. `AdminSettingsScreen` does not contain an appearance settings section. `ThemeToggle` is currently rendered only in `Header.tsx` and `Sidebar.tsx`.
- **Theme Token & Hook Parity**: `packages/ui/theme/tokens.ts` (Lines 1–107) defines complete `LIGHT_COLORS` and `DARK_COLORS` palettes using Slate 900 (`#0F172A`), Slate 800 (`#1E293B`), Slate 700 (`#334155`), Slate 50 (`#F8FAFC`). `packages/ui/theme/useTheme.ts` provides `DEFAULT_THEME_CONTEXT` fallbacks when context is missing.
- **Mount Animations (Requirement R6)**: `@edge/ui` provides `<AnimatedCard>` with a 350ms fade-in and 12px slide-up entrance. 13 screen features (`LandingScreen`, `InternalLoginScreen`, `ForgotPasswordScreen`, `OnboardingScreen`, `DashboardScreen`, `ActivitiesScreen`, `FormBuilderScreen`, `AnnouncementsScreen`, `AuditLogsScreen`, `FeedbackScreen`, `SettingsScreen`, `AdminSettingsScreen`, `RolesPermissionScreen` (partially)) use `<AnimatedCard>`. However, **3 features/screens** (`EmployeesScreen`, `UsersScreen`, `ApplicationReviewScreen`) and **Shell components** (`Header`, `Sidebar`, `MobileNavigation`) lack mount entrance animations.
- **SkeletonLoader vs ActivityIndicator**: `<SkeletonLoader>` is used in `FeedbackScreen`, `FormBuilderScreen`, and `RolesPermissionScreen`. However, `AnnouncementsTab`, `AuditLogsTab`, `FeedbackTab`, `ServiceTreeConfigTab`, `RegionSelectionModal`, and `RootNavigator` fall back to `<ActivityIndicator>` spinners during loading states.
- **Theme Mode Switching**: Mode changes execute synchronously via state context, swapping inline colors without a crossfade animation. Because `ThemeProvider` is missing from `App.tsx`, runtime theme updates fail to propagate across the root tree.
- **Accessibility (`reduceMotion`)**: Both `<AnimatedCard>` and `<SkeletonLoader>` query `AccessibilityInfo.isReduceMotionEnabled()` and subscribe to `reduceMotionChanged` events, disabling animations when OS reduced motion is active. The "Reduce Motion" UI switch in `SettingsScreen` exists only as a local state variable and is not connected to a global accessibility provider.

---

## 2. Logic Chain

1. **Root Integration Gap**: Because `App.tsx` lacks `<ThemeProvider>`, `useTheme()` across the app returns `DEFAULT_THEME_CONTEXT` (light colors), preventing dynamic theme changes from propagating globally when calling `setMode`.
2. **Settings Component Mismatch**: Using a binary `<Switch>` in `SettingsScreen` restricts users to Light/Dark mode toggling and omits the OS `system` mode supported by `<ThemeToggle>`.
3. **Mount Animation Inconsistency**: While 13 feature screens use `<AnimatedCard>` for 350ms fade-in/slide-up mount animations, `EmployeesScreen`, `UsersScreen`, and `ApplicationReviewScreen` mount statically without animations, creating visual inconsistency.
4. **Spinner vs Skeleton Inconsistency**: Data loading in `AnnouncementsTab`, `AuditLogsTab`, `FeedbackTab`, and `ServiceTreeConfigTab` renders `<ActivityIndicator>` spinners instead of skeleton shape placeholders (`<SkeletonLoader>`).
5. **Accessibility Compliance**: `@edge/ui` motion components (`AnimatedCard`, `SkeletonLoader`) authentically handle system-level reduced motion via `AccessibilityInfo`.

---

## 3. Caveats

- Investigation was performed in read-only mode across `apps/frontend/internal/src/` and `packages/ui/`. No application source files were modified during this audit.
- Screen mount animations were verified via static analysis of AST JSX component trees (`<AnimatedCard>` presence and delay properties).
- Theme toggling runtime performance and layout stability were verified by inspecting `ThemeProvider.tsx`, `useTheme.ts`, and context re-render behavior.

---

## 4. Conclusion

The theme infrastructure in `packages/ui` is robust, with complete token parity and authentic `reduceMotion` accessibility handling. However, **two key integration gaps** and **two motion consistency issues** exist:
1. `ThemeProvider` is missing from `apps/frontend/internal/App.tsx`.
2. `SettingsScreen` uses `<Switch>` instead of `<ThemeToggle>`.
3. 3 screens (`EmployeesScreen`, `UsersScreen`, `ApplicationReviewScreen`) lack `<AnimatedCard>` mount animations.
4. Several feature tabs still use `<ActivityIndicator>` spinners instead of `<SkeletonLoader>` placeholders.

---

## 5. Verification Method

1. **Verify Root Integration**: Inspect `apps/frontend/internal/App.tsx` and confirm `<ThemeProvider>` wraps `AuthProvider` and `RootNavigator`.
2. **Verify ThemeToggling**: Test `ThemeToggle` in `SettingsScreen` to ensure switching between `Light`, `Dark`, and `System` updates canvas (`colors.bg`), cards (`colors.cardBg`), and text (`colors.text`).
3. **Verify Mount Animations**: Check that screens render cards within `<AnimatedCard>` for 350ms entrance fade/slide animations.
4. **Verify Skeleton Loaders**: Confirm loading states render `<SkeletonLoader>` placeholders instead of `<ActivityIndicator>` spinners.
5. **Verify Reduce Motion**: Enable OS Reduce Motion and verify animations are bypassed.
