import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  useWindowDimensions,
  Animated,
  Easing,
  Pressable,
} from "react-native";
import { COLORS, SPACING } from "@edge/ui";
import { useShellState } from "../hooks/useShellState";
import { ROLE_NAVIGATION_LINKS } from "../context/RoleContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileBottomTabBar } from "./MobileBottomTabBar";

interface AppLayoutProps {
  children: React.ReactNode;
  activeScreen?: string;
  onNavigate?: (screenName: string) => void;
}

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

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const sidebarAnim = useRef(new Animated.Value(0)).current;
  const [shouldRenderSidebar, setShouldRenderSidebar] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setShouldRenderSidebar(false);
      sidebarAnim.setValue(0);
      return;
    }

    if (isSidebarOpen) {
      setShouldRenderSidebar(true);
      Animated.timing(sidebarAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.bezier(0.16, 1, 0.3, 1), // easeOutExpo
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.bezier(0.16, 1, 0.3, 1), // easeOutExpo
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setShouldRenderSidebar(false);
        }
      });
    }
  }, [isSidebarOpen, isMobile, sidebarAnim]);

  const links = ROLE_NAVIGATION_LINKS[currentRole];

  const handleLinkPress = (screenName: string) => {
    if (onNavigate !== undefined) {
      onNavigate(screenName);
    }
    if (isMobile) {
      closeSidebar();
    }
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
    <View style={styles.shell}>
      {/* Top Navigation Header */}
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
        // Menu button removed from header in mobile (handled by Bottom Tabs)
        onMenuPress={undefined}
        onNavigate={handleLinkPress}
      />

      <View style={styles.bodyWrapper}>
        {/* Left Sidebar (Desktop Only) */}
        {!isMobile && activeScreen !== "AccountSettings" && (
          <Sidebar
            currentRole={currentRole}
            links={links}
            activeScreen={activeScreen}
            onNavigate={handleLinkPress}
          />
        )}

        {/* Mobile Drawer (Backdrop & Sliding Sidebar for secondary links) */}
        {isMobile &&
          activeScreen !== "AccountSettings" &&
          shouldRenderSidebar && (
            <>
              <Animated.View
                style={[styles.backdrop, { opacity: backdropOpacity }]}
              >
                <Pressable
                  style={styles.backdropPressable}
                  onPress={closeSidebar}
                />
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

        {/* Main Body */}
        <View style={styles.mainContentArea}>{children}</View>
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
  shell: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: COLORS.bg,
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
    ...StyleSheet.absoluteFill,
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
