# Explorer 2 Handoff Report: `AppLayout` Platform Variant Architecture

## 1. Observation

### File Structure & Directory Locations
1. Shell components directory: `apps/frontend/internal/src/features/shell/components/`
   - `AppLayout.tsx` (lines 1-24)
   - `AppLayout.web.tsx` (lines 1-99)
   - `AppLayout.native.tsx` (lines 1-189)
   - `AppLayout.desktop.tsx` (lines 1-180)
   - `Header.tsx` (lines 1-405)
   - `Sidebar.tsx` (lines 1-242)
   - `MobileBottomTabBar.tsx` (lines 1-101)
   - `StandardPageWrapper.tsx` (lines 1-55)

2. Screen Platform Variants Reference Implementations:
   - `DashboardScreen.tsx` (lines 1-18):
     ```typescript
     export function DashboardScreen() {
       if (Platform.OS === "web") return <WebScreen />;
       if (Platform.OS === "macos" || Platform.OS === "windows") return <DesktopScreen />;
       return <NativeScreen />;
     }
     ```
   - `EmployeesScreen.tsx` (lines 1-18)

3. Theme Toggle Component Export:
   - Path: `packages/ui/components/ThemeToggle.tsx` (lines 11-15, 17-96)
   - Exported in `@edge/ui`: `export { ThemeToggle } from './components/ThemeToggle';`
   - Props interface:
     ```typescript
     export interface ThemeToggleProps {
       variant?: 'segmented' | 'icon';
       size?: 'sm' | 'md';
       style?: ViewStyle;
     }
     ```

4. Root Navigation Integration:
   - Path: `apps/frontend/internal/src/navigation/RootNavigator.tsx` (lines 53-64)
     ```typescript
     return (
       <AppLayout
         activeScreen={activeScreen}
         onNavigate={(screen) => {
           if (navigationRef.isReady()) {
             navigationRef.navigate(screen);
           }
         }}
       >
         <AuthNavigation ref={navigationRef} linking={authLinking} />
       </AppLayout>
     );
     ```

---

## 2. Logic Chain

1. **Platform Selection Routing**:
   - `Platform.OS` reliably identifies whether the current runtime environment is `'web'`, `'windows'`/`'macos'`, or native mobile (`'ios'`/`'android'`).
   - `AppLayout.tsx` mirrors the established pattern in `DashboardScreen.tsx` and `EmployeesScreen.tsx`, providing standard interface props (`children`, `activeScreen`, `onNavigate`) and routing to `.web.tsx`, `.desktop.tsx`, or `.native.tsx`.

2. **Mobile Layout Variant Requirements (`AppLayout.native.tsx`)**:
   - Native mobile devices require notch and status-bar safe areas via `SafeAreaView`.
   - Top header requires `isMobile={true}` with hamburger pressable (`menu` icon) to toggle an off-canvas drawer sidebar.
   - An off-canvas animated sidebar drawer with backdrop overlay is necessary on mobile screens because horizontal space cannot accommodate a persistent 260px sidebar.
   - Bottom tab bar (`MobileBottomTabBar`) provides native navigation paradigms with primary screen icons (`Dashboard`, `Employees`, `Users`) and safe inset padding for iOS home indicators.

3. **Standard Web Layout Variant Requirements (`AppLayout.web.tsx`)**:
   - Web applications require a fixed top navigation header containing logo, notification bell, user profile card, role switcher dropdown, account settings link, and logout button.
   - Body flex row pairs a collapsible/responsive left sidebar (`260px` width, hidden when viewport width `< 768px`) with `mainContentArea`.
   - Responsive container wrapper `StandardPageWrapper` enforces `maxWidth: 1600` / `1200` combined with `alignSelf: 'center'` to satisfy monorepo web responsive rules in `AGENTS.md`.

4. **Desktop Wide Layout Variant Requirements (`AppLayout.desktop.tsx`)**:
   - Desktop workstation applications require window title bar (`32px` height with window control dots `#EF4444`, `#F59E0B`, `#10B981` and title string).
   - Top header integrates `ThemeToggle` from `@edge/ui` (`variant="segmented"` or `variant="icon"`).
   - Persistent left sidebar (`260px` width) maintains constant visibility.
   - Desktop status bar (`28px` height) displays live server operational status, regional office tenant info, and API latency stream.

5. **Auth & Theme Integration**:
   - `useShellState()` hook connects `AppLayout` to `AuthContext`, supplying `user`, `currentRole`, and `logout` handler (`clerkAuth.signOut()`).
   - `useTheme()` hook supplies `colors` tokens (`colors.bg`, `colors.cardBg`, `colors.border`, `isDark`) so surface backgrounds adjust dynamically between dark and light modes across all 3 platform layouts.

---

## 3. Caveats

1. **Directory Naming Alignment**:
   - Prompt instructions referenced `apps/frontend/internal/src/components/shell/`. The codebase uses `apps/frontend/internal/src/features/shell/components/`. Implementers must edit files under `apps/frontend/internal/src/features/shell/components/`.

2. **Window Dimension Hooks on Web**:
   - On web SSR or initial mount, `useWindowDimensions()` initially returns default values. Layouts must handle dynamic viewport resizing smoothly without hydration mismatch issues.

3. **Platform-Specific Animations**:
   - Native drawer uses `Animated.timing` with `useNativeDriver: true`. Web layout must rely on standard flex/CSS transitions to prevent native driver warnings on Web browsers.

---

## 4. Conclusion

The architectural blueprint for `AppLayout` is fully specified across 4 file targets:
1. `AppLayout.tsx`: Master selector utilizing `Platform.OS` (`web` -> `WebLayout`, `windows`/`macos` -> `DesktopLayout`, default -> `NativeLayout`).
2. `AppLayout.native.tsx`: Touch-first mobile shell with `SafeAreaView`, top header + hamburger button, off-canvas animated drawer sidebar with backdrop overlay, content area, and fixed `MobileBottomTabBar`.
3. `AppLayout.web.tsx`: Standard web browser shell with top header (logo, profile dropdown, role switcher, logout), responsive left sidebar (`< 768px` auto-hide), and `StandardPageWrapper` content container (`maxWidth: 1600`/`1200`, `alignSelf: 'center'`).
4. `AppLayout.desktop.tsx`: Desktop wide workstation shell with custom title bar (`#0B132B`, control dots), top header with integrated `@edge/ui` `ThemeToggle`, persistent left sidebar, main content area, and bottom workstation status bar (`#0F172A`).

---

## 5. Verification Method

To verify the architecture implementation during subsequent development iterations:

1. **TypeScript Type Checking**:
   Execute from workspace root:
   ```bash
   cd apps/frontend/internal && npx tsc --noEmit
   ```
   Ensure zero compilation errors.

2. **File & Component Inspection**:
   - Inspect `apps/frontend/internal/src/features/shell/components/AppLayout.tsx` for `Platform.OS` routing.
   - Inspect `apps/frontend/internal/src/features/shell/components/AppLayout.native.tsx` for `SafeAreaView`, `Header`, `Sidebar` drawer, and `MobileBottomTabBar`.
   - Inspect `apps/frontend/internal/src/features/shell/components/AppLayout.web.tsx` for `Header`, `Sidebar`, and `StandardPageWrapper`.
   - Inspect `apps/frontend/internal/src/features/shell/components/AppLayout.desktop.tsx` for `desktopTitleBar`, `ThemeToggle`, `Sidebar`, and `desktopStatusBar`.

3. **Code Quality & Constraint Invalidation Checks**:
   - Verify zero type assertions (`as`, `!`) or `any` in shell component files.
   - Verify layout container wrappers enforce `maxWidth: 1200` / `1600` combined with `alignSelf: 'center'`.
