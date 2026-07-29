import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { COLORS, TYPOGRAPHY, Icon as LucideIcon } from "@edge/ui";
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

  const links = ROLE_NAVIGATION_LINKS[currentRole];

  const handleLinkPress = (screenName: string) => {
    if (onNavigate !== undefined) {
      onNavigate(screenName);
    }
  };

  return (
    <View style={styles.desktopShell}>
      {/* Desktop Window Title Bar */}
      <View style={styles.desktopTitleBar}>
        <View style={styles.windowDots}>
          <View style={[styles.dot, { backgroundColor: "#EF4444" }]} />
          <View style={[styles.dot, { backgroundColor: "#F59E0B" }]} />
          <View style={[styles.dot, { backgroundColor: "#10B981" }]} />
        </View>
        <Text style={styles.windowTitleText}>NTC EDGE Workstation Client • Internal Operations</Text>
      </View>

      {/* Header */}
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

      {/* Desktop Workstation Status Bar */}
      <View style={styles.desktopStatusBar}>
        <View style={styles.statusLeft}>
          <View style={styles.statusOnlineDot} />
          <Text style={styles.statusText}>Server Status: Operational</Text>
          <Text style={styles.statusDivider}>|</Text>
          <Text style={styles.statusText}>
            Regional Office: {user?.tenantName ?? "NCR Head Office"}
          </Text>
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
    backgroundColor: COLORS.bg,
    height: "100%",
  },
  desktopTitleBar: {
    height: 32,
    backgroundColor: "#0B132B",
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
    backgroundColor: "#0F172A",
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
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
