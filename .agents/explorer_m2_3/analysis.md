# Shell & App Chrome Type Compliance Analysis (Milestone 2 - R5)

**Target Location**: `apps/frontend/internal/src/features/shell/components/`  
**Explorer Agent**: Explorer 3  
**Date**: 2026-07-29  
**Build Status**: Verified PASS (`node node_modules/typescript/bin/tsc --noEmit` exits 0)

---

## 1. Executive Summary & Audit Overview

A comprehensive audit was performed across all 11 shell components and context/hook files in `apps/frontend/internal/src/features/shell/`. The primary objective is to guarantee **100% strict type compliance** with zero type assertions (`as`, `!`), zero `any` usage, and complete runtime null/undefined guard coverage during the Milestone 2 Shell & App Chrome Redesign.

### Summary of Audit Results
- **Total Files Audited**: 11 TypeScript/React Native files
- **`any` Type Violations Found**: 1 file (`MobileBottomTabBar.tsx`, line 8: `icon: any;`)
- **Non-Null Assertion (`!`) Violations**: 0
- **Type Assertion (`as`) Violations**: 0 (All `as` occurrences are ES module import aliases e.g., `import { Icon as Lucide }` or TypeScript const assertions e.g., `as const`)
- **Untyped Asset Requires**: 1 file (`Header.tsx`, line 19: `require("../../../../assets/footer-logo.png")`)
- **TypeScript Build State**: **CLEAN / 0 ERRORS** (`tsconfig.json` enforces `"strict": true`)

---

## 2. Complete Type Violation Audit Matrix

| File Path | Line # | Violation Category | Code Snippet / Context | Impact / Risk | Concrete Type-Safe Remediation |
|---|---|---|---|---|---|
| `components/MobileBottomTabBar.tsx` | 8 | `any` Type Violation | `icon: any; // Lucide icon name` | Loose typing bypasses compiler checks for Feather icon name validity | Replace with `ComponentProps<typeof Icon>['name']` imported from `@edge/ui` |
| `components/Header.tsx` | 19 | Untyped Asset Require | `const footerLogoAsset = require("../...");` | Inferred as `any` or untyped require module | Annotate asset as `ImageSourcePropType` from `react-native` |
| `components/Sidebar.tsx` | 88, 102 | Implicit Optional Call | `onRoleSelect?.(role);` | Implicit handling without explicit check | Use explicit runtime guard: `if (onRoleSelect !== undefined) { onRoleSelect(role); }` |
| `components/AppLayout.desktop.tsx` | 91 | Potential Undefined Field Access | `user?.tenantName ?? "NCR Head Office"` | Nullable access relying solely on optional chaining | Use explicit runtime guard: `const tenantName = user !== null && user.tenantName !== undefined ? user.tenantName : "NCR Head Office";` |
| `components/AppLayout.native.tsx` | 63-67 | Callback Event Object Invalidation | `Animated.timing(...).start(({ finished }) => ...)` | `finished` parameter destructured without guard | Guard callback value: `if (result !== undefined && typeof result.finished === 'boolean' && result.finished)` |

---

## 3. TypeScript Build State Verification

### Workspace TypeScript Configuration (`apps/frontend/internal/tsconfig.json`)
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "types": ["jest"]
  }
}
```

### Compiler Environment & Dependencies (`package.json`)
- **TypeScript Version**: `~6.0.3`
- **React Version**: `19.2.3`
- **React Native Version**: `0.86.0`
- **Expo Version**: `~57.0.7`
- **Clerk SDK Version**: `@clerk/expo ^3.2.0`
- **React Navigation Version**: `@react-navigation/* 8.0.0-alpha.35`
- **UI Package**: `@edge/ui (workspace:*)`

### Verification Command & Output
```bash
cmd /c node node_modules/typescript/bin/tsc --noEmit
# Result: Process exited with code 0 (0 compilation errors).
```

---

## 4. Integration Type Analysis

### A. `@edge/ui` Theme Infrastructure Integration
Milestone 2 requires integrating `useTheme()` from `@edge/ui` into shell components.

#### Theme Interface Contract (`packages/ui/theme/types.ts`)
```ts
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  brand: ThemeBrandColors;
  neutral: ThemeNeutralColors;
  semantic: ThemeSemanticColors;
  bg: string;
  cardBg: string;
  text: string;
  textMuted: string;
  border: string;
}

export interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
  isDark: boolean;
}
```

#### Hook Usage Pattern (Zero-Assertion Guarantee)
```ts
import { useTheme } from '@edge/ui';

// Inside component:
const { mode, setMode, colors, isDark } = useTheme();
```
*Note*: `useTheme()` incorporates a fallback default context value when used outside a `ThemeProvider`, ensuring it **never returns `undefined` or `null`**. No non-null assertions (`!`) or type casts (`as ThemeContextValue`) are ever necessary.

---

### B. `@edge/ui` Icon Typing Integration
The shared UI package exports Feather icons as `Icon`:
```ts
// packages/ui/index.ts
export { Feather as Icon } from '@expo/vector-icons';
```
To type any icon prop or configuration struct safely without `any`:
```ts
import { ComponentProps } from 'react';
import { Icon } from '@edge/ui';

export type IconName = ComponentProps<typeof Icon>['name'];
```

---

### C. Clerk Auth & User Profile Typing
`AuthContext.tsx` defines and exports `UserProfile`:
```ts
export interface UserProfile {
  name: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  region?: string;
  tenantId?: string;
  tenantName?: string;
  roles?: string[];
  permissions?: string[];
}
```
All components receiving `user: UserProfile | null` MUST use explicit runtime guards:
```ts
if (user === null) {
  // Unauthenticated or loading fallback
} else {
  // Fully typed access to user.name, user.email, etc.
}
```

---

## 5. Concrete Type-Safe Solutions for M2 Shell Components

Below are the exact, zero-assertion, zero-`any` implementation specs and signatures for all Milestone 2 shell components.

---

### 1. `AppLayout.tsx` (Master Selector)
**Location**: `apps/frontend/internal/src/features/shell/components/AppLayout.tsx`

```tsx
import React from "react";
import { Platform } from "react-native";
import { AppLayout as WebLayout } from "./AppLayout.web";
import { AppLayout as NativeLayout } from "./AppLayout.native";
import { AppLayout as DesktopLayout } from "./AppLayout.desktop";

export interface AppLayoutProps {
  children: React.ReactNode;
  activeScreen?: string;
  onNavigate?: (screenName: string) => void;
}

export function AppLayout(props: AppLayoutProps): React.ReactElement {
  if (Platform.OS === "web") {
    return <WebLayout {...props} />;
  }

  if (Platform.OS === "macos" || Platform.OS === "windows") {
    return <DesktopLayout {...props} />;
  }

  return <NativeLayout {...props} />;
}
```

---

### 2. `AppLayout.native.tsx` (Mobile Viewport)
**Location**: `apps/frontend/internal/src/features/shell/components/AppLayout.native.tsx`

#### Key Type Improvements:
- Replaces static `COLORS.bg` with `useTheme().colors.bg`.
- Strict typing for `Animated.timing` callback (`(result: { finished: boolean }) => ...`).
- Explicit check on `onNavigate`.

```tsx
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Animated,
  Easing,
  Pressable,
} from "react-native";
import { useTheme } from "@edge/ui";
import { useShellState } from "../hooks/useShellState";
import { ROLE_NAVIGATION_LINKS } from "../context/RoleContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileBottomTabBar } from "./MobileBottomTabBar";

export interface AppLayoutProps {
  children: React.ReactNode;
  activeScreen?: string;
  onNavigate?: (screenName: string) => void;
}

export function AppLayout({
  children,
  activeScreen = "Dashboard",
  onNavigate,
}: AppLayoutProps): React.ReactElement {
  const { colors } = useTheme();
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

  const sidebarAnim = useRef(new Animated.Value(0)).current;
  const [shouldRenderSidebar, setShouldRenderSidebar] = useState(false);

  useEffect(() => {
    if (isSidebarOpen) {
      setShouldRenderSidebar(true);
      Animated.timing(sidebarAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }).start((result: { finished: boolean }) => {
        if (result.finished) {
          setShouldRenderSidebar(false);
        }
      });
    }
  }, [isSidebarOpen, sidebarAnim]);

  const links = ROLE_NAVIGATION_LINKS[currentRole];

  const handleLinkPress = (screenName: string) => {
    if (onNavigate !== undefined) {
      onNavigate(screenName);
    }
    closeSidebar();
  };

  const translateX = sidebarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-280, 0],
  });

  const backdropOpacity = sidebarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  return (
    <SafeAreaView style={[styles.nativeSafeArea, { backgroundColor: colors.bg }]}>
      <View style={[styles.shell, { backgroundColor: colors.bg }]}>
        <Header
          currentRole={currentRole}
          onRoleSelect={handleRoleSelect}
          showRoleDropdown={showRoleDropdown}
          toggleRoleDropdown={toggleRoleDropdown}
          closeRoleDropdown={closeRoleDropdown}
          isSwitcherHovered={isSwitcherHovered}
          setIsSwitcherHovered={setIsSwitcherHovered}
          isLogoutHovered={isLogoutHovered}
          setIsLogoutHovered={setIsLogoutHovered}
          user={user}
          onLogout={logout}
          isMobile={true}
          onNavigate={handleLinkPress}
        />

        <View style={styles.bodyWrapper}>
          {shouldRenderSidebar && (
            <>
              <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
                <Pressable style={styles.backdropPressable} onPress={closeSidebar} />
              </Animated.View>
              <Animated.View
                style={[
                  styles.mobileSidebarContainer,
                  { transform: [{ translateX }] },
                ]}
              >
                <Sidebar
                  currentRole={currentRole}
                  links={links}
                  activeScreen={activeScreen}
                  onNavigate={handleLinkPress}
                  isMobile={true}
                  onClose={closeSidebar}
                  onLogout={logout}
                  onRoleSelect={handleRoleSelect}
                />
              </Animated.View>
            </>
          )}

          <View style={styles.mainContentArea}>{children}</View>
        </View>

        {activeScreen !== "AccountSettings" && (
          <MobileBottomTabBar
            activeScreen={activeScreen}
            onNavigate={handleLinkPress}
            onMenuPress={toggleSidebar}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nativeSafeArea: {
    flex: 1,
  },
  shell: {
    flex: 1,
    flexDirection: "column",
  },
  bodyWrapper: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    overflow: "hidden",
  },
  mainContentArea: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    zIndex: 90,
  },
  backdropPressable: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  mobileSidebarContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    height: "100%",
    zIndex: 95,
  },
});
```

---

### 3. `AppLayout.web.tsx` (Web Viewport)
**Location**: `apps/frontend/internal/src/features/shell/components/AppLayout.web.tsx`

```tsx
import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useTheme } from "@edge/ui";
import { useShellState } from "../hooks/useShellState";
import { ROLE_NAVIGATION_LINKS } from "../context/RoleContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export interface AppLayoutProps {
  children: React.ReactNode;
  activeScreen?: string;
  onNavigate?: (screenName: string) => void;
}

export function AppLayout({
  children,
  activeScreen = "Dashboard",
  onNavigate,
}: AppLayoutProps): React.ReactElement {
  const { colors } = useTheme();
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
  } = useShellState();

  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const links = ROLE_NAVIGATION_LINKS[currentRole];

  const handleLinkPress = (screenName: string) => {
    if (onNavigate !== undefined) {
      onNavigate(screenName);
    }
  };

  return (
    <View style={[styles.webShell, { backgroundColor: colors.bg }]}>
      <Header
        currentRole={currentRole}
        onRoleSelect={handleRoleSelect}
        showRoleDropdown={showRoleDropdown}
        toggleRoleDropdown={toggleRoleDropdown}
        closeRoleDropdown={closeRoleDropdown}
        isSwitcherHovered={isSwitcherHovered}
        setIsSwitcherHovered={setIsSwitcherHovered}
        isLogoutHovered={isLogoutHovered}
        setIsLogoutHovered={setIsLogoutHovered}
        user={user}
        onLogout={logout}
        isMobile={isMobile}
        onNavigate={handleLinkPress}
      />

      <View style={styles.bodyWrapper}>
        {!isMobile && activeScreen !== "AccountSettings" && (
          <Sidebar
            currentRole={currentRole}
            links={links}
            activeScreen={activeScreen}
            onNavigate={handleLinkPress}
          />
        )}

        <View style={styles.mainContentArea}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webShell: {
    flex: 1,
    flexDirection: "column",
    height: "100%",
  },
  bodyWrapper: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    overflow: "hidden",
  },
  mainContentArea: {
    flex: 1,
    height: "100%",
  },
});
```

---

### 4. `AppLayout.desktop.tsx` (Desktop Viewport)
**Location**: `apps/frontend/internal/src/features/shell/components/AppLayout.desktop.tsx`

```tsx
import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { TYPOGRAPHY, Icon as LucideIcon, useTheme } from "@edge/ui";
import { useShellState } from "../hooks/useShellState";
import { ROLE_NAVIGATION_LINKS } from "../context/RoleContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export interface AppLayoutProps {
  children: React.ReactNode;
  activeScreen?: string;
  onNavigate?: (screenName: string) => void;
}

export function AppLayout({
  children,
  activeScreen = "Dashboard",
  onNavigate,
}: AppLayoutProps): React.ReactElement {
  const { colors, isDark } = useTheme();
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
  } = useShellState();

  const links = ROLE_NAVIGATION_LINKS[currentRole];

  const handleLinkPress = (screenName: string) => {
    if (onNavigate !== undefined) {
      onNavigate(screenName);
    }
  };

  const regionalOfficeName =
    user !== null && user.tenantName !== undefined && user.tenantName.length > 0
      ? user.tenantName
      : "NCR Head Office";

  return (
    <View style={[styles.desktopShell, { backgroundColor: colors.bg }]}>
      <View style={[styles.desktopTitleBar, { backgroundColor: isDark ? colors.neutral[900] : "#0B132B" }]}>
        <View style={styles.windowDots}>
          <View style={[styles.dot, { backgroundColor: "#EF4444" }]} />
          <View style={[styles.dot, { backgroundColor: "#F59E0B" }]} />
          <View style={[styles.dot, { backgroundColor: "#10B981" }]} />
        </View>
        <Text style={styles.windowTitleText}>NTC EDGE Workstation Client • Internal Operations</Text>
      </View>

      <Header
        currentRole={currentRole}
        onRoleSelect={handleRoleSelect}
        showRoleDropdown={showRoleDropdown}
        toggleRoleDropdown={toggleRoleDropdown}
        closeRoleDropdown={closeRoleDropdown}
        isSwitcherHovered={isSwitcherHovered}
        setIsSwitcherHovered={setIsSwitcherHovered}
        isLogoutHovered={isLogoutHovered}
        setIsLogoutHovered={setIsLogoutHovered}
        user={user}
        onLogout={logout}
        isMobile={false}
        onNavigate={handleLinkPress}
      />

      <View style={styles.bodyWrapper}>
        {activeScreen !== "AccountSettings" && (
          <Sidebar
            currentRole={currentRole}
            links={links}
            activeScreen={activeScreen}
            onNavigate={handleLinkPress}
          />
        )}

        <View style={styles.mainContentArea}>{children}</View>
      </View>

      <View style={[styles.desktopStatusBar, { backgroundColor: isDark ? colors.neutral[900] : "#0F172A", borderTopColor: colors.border }]}>
        <View style={styles.statusLeft}>
          <View style={styles.statusOnlineDot} />
          <Text style={styles.statusText}>Server Status: Operational</Text>
          <Text style={styles.statusDivider}>|</Text>
          <Text style={styles.statusText}>Regional Office: {regionalOfficeName}</Text>
        </View>

        <View style={styles.statusRight}>
          <LucideIcon name="activity" size={12} color="#10B981" />
          <Text style={styles.statusText}>API Latency: 24ms</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopShell: {
    flex: 1,
    flexDirection: "column",
    height: "100%",
  },
  desktopTitleBar: {
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  windowDots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  windowTitleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#94A3B8",
  },
  bodyWrapper: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    overflow: "hidden",
  },
  mainContentArea: {
    flex: 1,
    height: "100%",
  },
  desktopStatusBar: {
    height: 28,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusOnlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  statusText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "#94A3B8",
  },
  statusDivider: {
    color: "#334155",
    fontSize: 11,
  },
  statusRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
```

---

### 5. `Sidebar.tsx` (Sidebar Navigation & ThemeToggle)
**Location**: `apps/frontend/internal/src/features/shell/components/Sidebar.tsx`

#### Key Enhancements:
- Incorporates `useTheme()` for theme-aware tokens (`colors.cardBg`, `colors.border`, `colors.text`).
- Embeds `ThemeToggle` component from `@edge/ui`.
- Explicit null/undefined checks for `onRoleSelect` and `onLogout`.

```tsx
import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { SPACING, RADIUS, TYPOGRAPHY, Icon as Lucide, useTheme, ThemeToggle } from '@edge/ui';
import { UserRole, NavigationLink } from '../context/RoleContext';
import { SidebarNavItem } from './SidebarNavItem';
import { RoleSwitcher } from './RoleSwitcher';

export interface SidebarProps {
  currentRole: UserRole;
  links: readonly NavigationLink[];
  activeScreen: string;
  onNavigate: (screenName: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
  onLogout?: () => void | Promise<void>;
  onRoleSelect?: (role: UserRole) => void;
}

export function Sidebar({
  currentRole,
  links,
  activeScreen,
  onNavigate,
  isMobile = false,
  onClose,
  onLogout,
  onRoleSelect,
}: SidebarProps): React.ReactElement {
  const { colors, isDark } = useTheme();
  const [showMobileRoleDropdown, setShowMobileRoleDropdown] = useState(false);
  const [isSwitcherHovered, setIsSwitcherHovered] = useState(false);

  const toggleMobileRoleDropdown = () => {
    setShowMobileRoleDropdown((prev) => !prev);
  };

  const closeMobileRoleDropdown = () => {
    setShowMobileRoleDropdown(false);
  };

  const sidebarBg = isDark ? colors.neutral[900] : colors.neutral.white;
  const sidebarBorderColor = isDark ? colors.neutral[800] : colors.neutral[200];
  const footerBg = isDark ? colors.neutral[800] : colors.neutral[50];

  return (
    <View style={[styles.sidebar, { backgroundColor: sidebarBg, borderRightColor: sidebarBorderColor }, isMobile && styles.sidebarMobile]}>
      {isMobile && (
        <View style={[styles.sidebarHeader, { borderBottomColor: sidebarBorderColor }]}>
          <View style={styles.logoWrapper}>
            <View style={[styles.logoIcon, { backgroundColor: colors.neutral[50], borderColor: colors.neutral[200] }]}>
              <Lucide name="shield" size={20} color={colors.brand[800]} />
            </View>
            <View>
              <Text style={[styles.logoTitle, { color: colors.text }]}>EDGE</Text>
              <Text style={[styles.logoSubtitle, { color: colors.textMuted }]}>INTERNAL PORTAL</Text>
            </View>
          </View>

          <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.neutral[50], borderColor: colors.neutral[200] }]}>
            <Lucide name="x" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      )}

      <ScrollView
        style={styles.sidebarNav}
        contentContainerStyle={styles.sidebarNavContent}
      >
        {links.map((link) => {
          const isActive = activeScreen === link.screen;
          return (
            <SidebarNavItem
              key={link.name}
              link={link}
              isActive={isActive}
              onPress={onNavigate}
            />
          );
        })}
      </ScrollView>

      {/* Theme Toggle Section */}
      <View style={[styles.themeToggleContainer, { borderTopColor: sidebarBorderColor }]}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Appearance</Text>
        <ThemeToggle variant="segmented" size="sm" />
      </View>

      <View style={[styles.sidebarFooter, { backgroundColor: footerBg, borderTopColor: sidebarBorderColor }]}>
        {isMobile ? (
          <View style={styles.mobileFooterContainer}>
            <Text style={[styles.roleLabel, { color: colors.textMuted }]}>Switch Active Role</Text>
            <View style={styles.roleSwitcherWrapper}>
              <RoleSwitcher
                currentRole={currentRole}
                onRoleSelect={(role: UserRole) => {
                  if (onRoleSelect !== undefined) {
                    onRoleSelect(role);
                  }
                  closeMobileRoleDropdown();
                }}
                showRoleDropdown={showMobileRoleDropdown}
                toggleRoleDropdown={toggleMobileRoleDropdown}
                closeRoleDropdown={closeMobileRoleDropdown}
                isSwitcherHovered={isSwitcherHovered}
                setIsSwitcherHovered={setIsSwitcherHovered}
                variant="sidebar"
              />
            </View>

            <Pressable
              onPress={() => {
                if (onLogout !== undefined) {
                  const result = onLogout();
                  if (result instanceof Promise) {
                    result.catch((error: unknown) => console.error('Logout error:', error));
                  }
                }
              }}
              style={[styles.mobileLogoutBtn, { backgroundColor: colors.semantic.errorBg, borderColor: colors.semantic.errorBorder }]}
            >
              <Lucide name="log-out" size={16} color={colors.semantic.error} />
              <Text style={[styles.mobileLogoutText, { color: colors.semantic.error }]}>Logout</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={[styles.roleLabel, { color: colors.textMuted }]}>Current Role</Text>
            <Text style={[styles.roleValue, { color: colors.brand[800] }]}>{currentRole}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    borderRightWidth: 1,
    flexDirection: 'column',
    height: '100%',
    zIndex: 10,
  },
  sidebarMobile: {
    width: '100%',
  },
  sidebarHeader: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
    borderBottomWidth: 1,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[12],
    borderWidth: 1,
  },
  logoTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  sidebarNav: {
    flex: 1,
  },
  sidebarNavContent: {
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[16],
  },
  themeToggleContainer: {
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[12],
    borderTopWidth: 1,
  },
  sectionLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sidebarFooter: {
    padding: SPACING[20],
    borderTopWidth: 1,
  },
  roleLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  roleValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  mobileFooterContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  roleSwitcherWrapper: {
    width: '100%',
    marginBottom: SPACING[16],
  },
  mobileLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.input,
    borderWidth: 1,
    width: '100%',
  },
  mobileLogoutText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginLeft: 8,
  },
});
```

---

### 6. `MobileBottomTabBar.tsx` (Mobile Navigation Bar)
**Location**: `apps/frontend/internal/src/features/shell/components/MobileBottomTabBar.tsx`

#### Remediation Highlights:
- **ELIMINATES `icon: any;`** violation by typing `icon: ComponentProps<typeof Icon>['name']`.
- Theme integration for active/inactive background and tab text colors.

```tsx
import React, { ComponentProps } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { TYPOGRAPHY, Icon, useTheme } from '@edge/ui';

type IconName = ComponentProps<typeof Icon>['name'];

export interface TabItem {
  name: string;
  screen: string;
  icon: IconName;
}

export interface MobileBottomTabBarProps {
  activeScreen: string;
  onNavigate: (screenName: string) => void;
  onMenuPress: () => void;
}

const PRIMARY_TABS: readonly TabItem[] = [
  { name: 'Dashboard', screen: 'Dashboard', icon: 'grid' },
  { name: 'Employees', screen: 'Employees', icon: 'users' },
  { name: 'Users', screen: 'Users', icon: 'user' },
] as const;

export function MobileBottomTabBar({
  activeScreen,
  onNavigate,
  onMenuPress,
}: MobileBottomTabBarProps): React.ReactElement {
  const { colors, isDark } = useTheme();

  const tabContainerBg = isDark ? colors.neutral[900] : colors.neutral.white;
  const tabBorderColor = isDark ? colors.neutral[800] : colors.neutral[200];
  const activeIconBg = isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)';

  return (
    <View style={[styles.container, { backgroundColor: tabContainerBg, borderTopColor: tabBorderColor }]}>
      {PRIMARY_TABS.map((tab) => {
        const isActive = activeScreen === tab.screen;
        return (
          <Pressable
            key={tab.screen}
            style={styles.tabButton}
            onPress={() => onNavigate(tab.screen)}
          >
            <View style={[styles.iconContainer, isActive && { backgroundColor: activeIconBg }]}>
              <Icon
                name={tab.icon}
                size={22}
                color={isActive ? colors.brand[800] : colors.textMuted}
              />
            </View>
            <Text style={[styles.tabText, { color: isActive ? colors.brand[800] : colors.textMuted }, isActive && styles.tabTextActive]}>
              {tab.name}
            </Text>
          </Pressable>
        );
      })}

      <Pressable style={styles.tabButton} onPress={onMenuPress}>
        <View style={styles.iconContainer}>
          <Icon name="menu" size={22} color={colors.textMuted} />
        </View>
        <Text style={[styles.tabText, { color: colors.textMuted }]}>More</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 100,
    width: '100%',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconContainer: {
    width: 48,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  tabTextActive: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
```

---

### 7. `StandardPageWrapper.tsx` (Page Container & PageHeader Integration)
**Location**: `apps/frontend/internal/src/features/shell/components/StandardPageWrapper.tsx`

#### Enhancements:
- Theme awareness for `ScrollView` container.
- Optional integration of `PageHeader` from `@edge/ui`.
- Preserves mobile responsive constraints (`maxWidth: 1600`, `alignSelf: 'center'`).

```tsx
import React from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { SPACING, useTheme, PageHeader } from '@edge/ui';
import { TransitionWrapper } from './TransitionWrapper';

export interface StandardPageWrapperProps {
  children: React.ReactNode;
  activeScreen?: string;
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
}

export function StandardPageWrapper({
  children,
  activeScreen = 'Dashboard',
  title,
  subtitle,
  headerRight,
}: StandardPageWrapperProps): React.ReactElement {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const showHeader = title !== undefined && title.length > 0;

  return (
    <ScrollView
      style={[styles.contentScrollView, { backgroundColor: colors.bg }]}
      contentContainerStyle={[
        styles.contentContainer,
        isMobile && styles.mobileContentContainer,
      ]}
    >
      <View style={styles.maxContainer}>
        {showHeader && (
          <View style={styles.headerWrapper}>
            <PageHeader title={title} subtitle={subtitle} rightAction={headerRight} />
          </View>
        )}
        <TransitionWrapper trigger={activeScreen}>
          {children}
        </TransitionWrapper>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentScrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING[32],
    paddingVertical: SPACING[32],
    alignItems: 'center',
  },
  mobileContentContainer: {
    paddingHorizontal: SPACING[16],
    paddingTop: SPACING[16],
    paddingBottom: 110,
  },
  maxContainer: {
    width: '100%',
    maxWidth: 1600,
    alignSelf: 'center',
  },
  headerWrapper: {
    marginBottom: SPACING[24],
    width: '100%',
  },
});
```

---

## 6. Runtime Guard Patterns & Anti-Patterns Reference Guide

To enforce zero type assertions (`as`, `!`) and zero `any` across the implementation team, workers must strictly apply the following guard patterns:

### Anti-Pattern 1: Type Assertion (`as`)
```ts
// ❌ WRONG: Forcing a type assertion
const iconName = item.icon as any;
const role = currentRole as UserRole;
```
```ts
// ✅ CORRECT: Type-safe contract & union check
type IconName = ComponentProps<typeof Icon>['name'];
const iconName: IconName = item.icon; // Validated by compiler at definition
```

### Anti-Pattern 2: Non-Null Assertion (`!`)
```ts
// ❌ WRONG: Forcing non-null assertion
const email = user!.email;
onNavigate!(screen);
```
```ts
// ✅ CORRECT: Explicit runtime check
if (user !== null && user.email !== undefined) {
  const email = user.email;
}
if (onNavigate !== undefined) {
  onNavigate(screen);
}
```

### Anti-Pattern 3: Loose Array Search / Record Lookup
```ts
// ❌ WRONG: Insecure lookup that can return undefined
const link = ROLE_NAVIGATION_LINKS[role][0]!;
```
```ts
// ✅ CORRECT: Exhaustive lookup guard
const roleLinks = ROLE_NAVIGATION_LINKS[role];
if (Array.isArray(roleLinks) && roleLinks.length > 0) {
  const firstLink = roleLinks[0];
}
```

---

## 7. Verification Method

To independently verify strict type compliance and functionality:

1. **Compilation Check**:
   ```bash
   cmd /c node node_modules/typescript/bin/tsc --noEmit
   ```
   *Expected Output*: Exit code 0 with 0 errors.

2. **Regex Static Analysis (Audit for Violations)**:
   ```bash
   # Search for 'any' types in shell feature:
   grep -r "icon: any" apps/frontend/internal/src/features/shell

   # Search for non-null assertions:
   grep -rn "!" apps/frontend/internal/src/features/shell/components/
   ```
   *Expected Output*: 0 matches across shell components.

---
