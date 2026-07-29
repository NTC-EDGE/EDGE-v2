import React, { useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { COLORS } from "@edge/ui";
import { useShellState } from "../hooks/useShellState";
import { ROLE_NAVIGATION_LINKS } from "../context/RoleContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export interface AppLayoutProps {
  children: React.ReactNode;
  activeScreen?: string;
  onNavigate?: (screenName: string) => void;
}

export function AppLayoutWeb({
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
    <View style={styles.webShell}>
      {/* Top Header Bar */}
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
        {/* Left Web Sidebar */}
        {!isMobile && activeScreen !== "AccountSettings" && (
          <Sidebar
            currentRole={currentRole}
            links={links}
            activeScreen={activeScreen}
            onNavigate={handleLinkPress}
          />
        )}

        {/* Main Content Area */}
        <View style={styles.mainContentArea}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webShell: {
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
});
