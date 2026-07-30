# Platform Variant Architecture Analysis: `AppLayout` Shell Component

## 1. Executive Summary & Architectural Context

### File Location & Directory Mapping
The app chrome and shell components reside in:
`apps/frontend/internal/src/features/shell/components/`

*Note: In project scope references, `apps/frontend/internal/src/components/shell/` maps to `apps/frontend/internal/src/features/shell/components/` in accordance with the layered feature architecture.*

### Platform Variant Architecture Pattern
The NTC-EDGE internal portal utilizes React Native's file-extension platform selection convention combined with explicit `Platform.OS` master dispatchers. This pattern is applied consistently across screens and shell layouts:

- `DashboardScreen.tsx` -> `DashboardScreen.web.tsx` / `DashboardScreen.native.tsx` / `DashboardScreen.desktop.tsx`
- `EmployeesScreen.tsx` -> `EmployeesScreen.web.tsx` / `EmployeesScreen.native.tsx` / `EmployeesScreen.desktop.tsx`
- `InternalLoginScreen.tsx` -> `InternalLoginScreen.web.tsx` / `InternalLoginScreen.native.tsx` / `InternalLoginScreen.desktop.tsx`
- `AppLayout.tsx` -> `AppLayout.web.tsx` / `AppLayout.native.tsx` / `AppLayout.desktop.tsx`

---

## 2. Master Selector Blueprint (`AppLayout.tsx`)

### Purpose
Acts as the static entry point for the shell layout. Detects the execution platform via `Platform.OS` and delegates rendering to the appropriate platform-specific implementation.

### Component Signature & Types
```typescript
import React from 'react';
import { Platform } from 'react-native';
import { AppLayout as WebLayout } from './AppLayout.web';
import { AppLayout as NativeLayout } from './AppLayout.native';
import { AppLayout as DesktopLayout } from './AppLayout.desktop';

export interface AppLayoutProps {
  children: React.ReactNode;
  activeScreen?: string;
  onNavigate?: (screenName: string) => void;
}

export function AppLayout(props: AppLayoutProps): React.ReactElement {
  if (Platform.OS === 'web') {
    return <WebLayout {...props} />;
  }

  if (Platform.OS === 'macos' || Platform.OS === 'windows') {
    return <DesktopLayout {...props} />;
  }

  return <NativeLayout {...props} />;
}
```

---

## 3. Platform Variant Detailed Architectural Blueprints

### A. Mobile Layout (`AppLayout.native.tsx`)

#### Architectural Focus
Touch-first mobile experience with safe area boundaries, top header bar with hamburger menu, off-canvas animated drawer sidebar, and fixed bottom tab bar.

#### Key Structural Elements
1. **SafeAreaView Container**: Ensures content avoids device status bars and notch areas.
2. **Top Header (`Header.tsx`)**:
   - `isMobile={true}` flag enabled.
   - Displays logo (`footer-logo.png`), notification bell, and user avatar pressable.
   - Hamburger icon (`menu`) triggers off-canvas sidebar state (`toggleSidebar`).
3. **Animated Drawer Sidebar (`Sidebar.tsx`)**:
   - Animated translation (`Animated.Value(0)` to `1`, `translateX: -280` to `0`).
   - Backdrop overlay pressable (`#000000` with opacity `0.4`) to dismiss sidebar.
   - Full mobile menu with role switcher dropdown and logout action button in drawer footer.
4. **Main Content Area**: Unconstrained body container rendering `children` with theme-aware background (`colors.bg`).
5. **Fixed Mobile Bottom Tab Bar (`MobileBottomTabBar.tsx`)**:
   - Fixed at bottom with safe inset padding (`paddingBottom: Platform.OS === 'ios' ? 24 : 12`).
   - Primary tabs: `Dashboard` (`grid`), `Employees` (`users`), `Users` (`user`), and `More` (`menu` trigger).
   - Soft blue active icon highlight (`rgba(37, 99, 235, 0.1)`).

#### Detailed Component Structure
```typescript
export function AppLayout({
  children,
  activeScreen = "Dashboard",
  onNavigate,
}: AppLayoutProps) {
  const {
    currentRole,
    user,
    logout,
    showRoleDropdown,
    toggleRoleDropdown,
    closeRoleDropdown,
    handleRoleSelect,
    isSwitcherHovered,
    setIsSwitcherHovered,
    isLogoutHovered,
    setIsLogoutHovered,
    isSidebarOpen,
    closeSidebar,
    toggleSidebar,
  } = useShellState();

  const { isDark, colors } = useTheme();
  // Sidebar animation & backdrop setup
  // Render SafeAreaView -> Header -> Body (Sidebar Drawer + Children) -> MobileBottomTabBar
}
```

---

### B. Standard Web Layout (`AppLayout.web.tsx`)

#### Architectural Focus
Browser-first desktop/tablet web layout with persistent top navigation header, collapsible/responsive left sidebar, and centered max-width content container.

#### Key Structural Elements
1. **Outer Web Shell (`webShell`)**: Full height (`100%`), vertical flex column, theme background.
2. **Top Navigation Bar (`Header.tsx`)**:
   - Brand logo and portal title.
   - Notification bell.
   - User profile dropdown menu (User name, email, account settings modal link, role switcher component, logout button).
3. **Body Flex Row (`bodyWrapper`)**:
   - Left Sidebar (`Sidebar.tsx`) rendered on viewports `>= 768px` (`!isMobile`) and when not on `AccountSettings`.
   - Navigation links dynamically derived from `ROLE_NAVIGATION_LINKS[currentRole]`.
4. **Main Content Area (`mainContentArea`)**:
   - Houses `children` wrapped with `StandardPageWrapper` (or `maxWidth: 1600` / `1200` container with `alignSelf: 'center'`).
   - Adapts to dark/light theme mode surface tokens (`colors.bg`, `colors.cardBg`, `colors.border`).

#### Layout Adaptability & Responsiveness Rules
- Uses `useWindowDimensions()` hook to calculate `isMobile = width < 768`.
- Enforces `maxWidth: 1200` (or `1600` for grid/dashboard pages) combined with `alignSelf: 'center'` to prevent overstretching across wide web monitors (per `AGENTS.md` guidelines).

---

### C. Desktop Wide Layout (`AppLayout.desktop.tsx`)

#### Architectural Focus
Workstation application client layout designed for desktop wrappers (Electron/macOS/Windows React Native Desktop), featuring custom window title bar, top header with theme toggle, persistent sidebar, and status bar.

#### Key Structural Elements
1. **Window Title Bar (`desktopTitleBar`)**:
   - Fixed height (`32px`), dark background (`#0B132B`).
   - Window control indicator dots (`#EF4444`, `#F59E0B`, `#10B981`).
   - Window title label: `"NTC EDGE Workstation Client • Internal Operations"`.
2. **Top Header with Controls (`Header.tsx`)**:
   - Standard header actions plus integrated `ThemeToggle` (`variant="segmented"` or `variant="icon"` from `@edge/ui`).
3. **Body Flex Row (`bodyWrapper`)**:
   - Permanent left `Sidebar` (width `260px`).
   - Main content viewport for screen children.
4. **Workstation Status Bar (`desktopStatusBar`)**:
   - Fixed height (`28px`), dark slate background (`#0F172A`).
   - Server operational status indicator (green pulse dot).
   - Regional Office tenant name (`user?.tenantName ?? "NCR Head Office"`).
   - Real-time API Latency stream indicator (`24ms`).

---

## 4. Navigation Structure, Route Children, and Clerk Auth Integration

### A. Navigation Structure & Route Children Propagation
- `RootNavigator.tsx` passes `<AuthNavigation ref={navigationRef} linking={authLinking} />` as the `children` prop into `<AppLayout>`.
- `useRouteTracker` listens to navigation state changes and updates `activeScreen` state (`Dashboard`, `Employees`, `Users`, `Settings`, etc.).
- When navigation triggers occur in `Sidebar`, `Header` profile dropdown, or `MobileBottomTabBar`, `onNavigate(screenName)` invokes `navigationRef.navigate(screenName)`.

### B. Clerk Auth Components & State Integration
- `useShellState()` hook connects the shell directly to `AuthContext.tsx`.
- `user` object provides profile data (`name`, `email`, `tenantName`, `clerkUser`).
- Clerk authentication actions:
  - Sign out is executed via `onLogout` -> `clerkAuth.signOut()`.
  - Account settings modal (`EditAccountModal.tsx`) consumes `clerkUser` directly to modify user details (first name, last name, username, email verification, password update).

### C. Responsive Wrapper & Constraint Rules
Per `AGENTS.md` monorepo rules:
- All screens/layouts must enforce container `maxWidth` constraints (e.g. `maxWidth: 440` for auth/modals, `maxWidth: 1200` / `1600` for grid/dashboards).
- Must combine with `alignSelf: 'center'` (or centered flex layout) to eliminate wide desktop stretch artifacts.

---

## 5. Architectural Blueprint Summary Table

| Platform Variant | Layout Mechanism | Header & Controls | Navigation Controls | Status / Footer Controls | Responsive Constraints |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`AppLayout.native.tsx`** | SafeAreaView + Animated Off-Canvas Drawer | Mobile Header with Hamburger button & Avatar pressable | Animated slide-out Sidebar drawer | `MobileBottomTabBar` (Dashboard, Employees, Users, More) | Full width mobile with `paddingHorizontal: 16` |
| **`AppLayout.web.tsx`** | Flex Column shell + Flex Row body | Web Header with Logo, Notifications, Profile Dropdown, Role Switcher | Left Sidebar (`width: 260px`, hidden on mobile web) | Standard page footer / bottom padding | `maxWidth: 1600`/`1200`, `alignSelf: 'center'` |
| **`AppLayout.desktop.tsx`** | Fixed TitleBar + Flex Body + Status Bar | Web Header + `ThemeToggle` (`@edge/ui`) | Permanent Left Sidebar (`width: 260px`) | Desktop Status Bar (Server Operational, Tenant, Latency) | `maxWidth: 1600`/`1200`, `alignSelf: 'center'` |

---

## 6. Type Safety & Code Compliance Verification
- **Zero Type Assertions**: No `as` castings or `!` non-null assertions anywhere in component logic.
- **Runtime Guards**: Defensive checks (`if (onNavigate !== undefined)`, `if (clerkUser !== null && clerkUser !== undefined)`).
- **No `any` Types**: All prop interfaces, navigation links, and theme objects fully typed.
