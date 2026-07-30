import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Animated, Easing, Pressable, useWindowDimensions } from "react-native";
import { useTheme } from "@edge/ui";
import { useShellState } from "../hooks/useShellState";
import { ROLE_NAVIGATION_LINKS } from "../context/RoleContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileBottomTabBar } from "./MobileBottomTabBar";
import { StandardScreenWrapper } from "./StandardScreenWrapper";

export interface AppLayoutProps {
  children: React.ReactNode;
  activeScreen?: string;
  onNavigate?: (screenName: string) => void;
}

export function AppLayout({
  children,
  activeScreen = "Dashboard",
  onNavigate,
}: AppLayoutProps) {
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
    isSidebarOpen,
    closeSidebar,
    toggleSidebar,
  } = useShellState();

  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const links = ROLE_NAVIGATION_LINKS[currentRole];

  // Sidebar drawer animation for mobile web
  const sidebarAnim = useRef(new Animated.Value(0)).current;
  const [shouldRenderSidebar, setShouldRenderSidebar] = useState(false);

  useEffect(() => {
    if (isSidebarOpen && isMobile) {
      setShouldRenderSidebar(true);
      Animated.timing(sidebarAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          setShouldRenderSidebar(false);
        }
      });
    }
  }, [isSidebarOpen, isMobile, sidebarAnim]);

  const handleLinkPress = (screenName: string) => {
    if (onNavigate !== undefined) {
      onNavigate(screenName);
    }
    if (isMobile) {
      closeSidebar();
    }
  };

  const bgCanvas = isDark ? colors.neutral[900] : colors.bg;

  const sidebarTranslateX = sidebarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-280, 0],
  });

  const backdropOpacity = sidebarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  return (
    <View style={[styles.webShell, { backgroundColor: bgCanvas }]}>
      {/* Top Header Bar */}
      <Header
        currentRole={currentRole}
        activeScreen={activeScreen}
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
        onMenuPress={toggleSidebar}
        onNavigate={handleLinkPress}
      />

      <View style={styles.bodyWrapper}>
        {/* Desktop Sidebar (persistent, collapsible) */}
        {!isMobile && activeScreen !== "AccountSettings" && (
          <Sidebar
            currentRole={currentRole}
            links={links}
            activeScreen={activeScreen}
            onNavigate={handleLinkPress}
            onLogout={logout}
          />
        )}

        {/* Mobile Sidebar Drawer (animated slide-in) */}
        {isMobile && shouldRenderSidebar && (
          <>
            <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
              <Pressable style={styles.backdropPressable} onPress={closeSidebar} />
            </Animated.View>
            <Animated.View
              style={[
                styles.mobileSidebarContainer,
                { transform: [{ translateX: sidebarTranslateX }] },
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

        {/* Main Content Area */}
        <View style={styles.mainContentArea}>
          <StandardScreenWrapper activeScreen={activeScreen}>
            {children}
          </StandardScreenWrapper>
        </View>
      </View>

      {/* Mobile Bottom Tab Bar */}
      {isMobile && activeScreen !== "AccountSettings" && (
        <MobileBottomTabBar
          activeScreen={activeScreen}
          onNavigate={handleLinkPress}
          onMenuPress={toggleSidebar}
        />
      )}
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
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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

