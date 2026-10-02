import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { COLORS, useTheme, TYPOGRAPHY, Icon as LucideIcon } from "@edge/ui";
import { useShellState } from "../hooks/useShellState";
import { ROLE_NAVIGATION_LINKS } from "../context/RoleContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { StandardScreenWrapper } from "./StandardScreenWrapper";
import { SignOutConfirmModal } from "../../auth/components/SignOutConfirmModal";
import { IncomingCallModal } from "../../meet/components/IncomingCallModal";

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
    showRoleDropdown,
    toggleRoleDropdown,
    closeRoleDropdown,
    handleRoleSelect,
    isSwitcherHovered,
    setIsSwitcherHovered,
    isLogoutHovered,
    setIsLogoutHovered,
    isSignOutConfirmVisible,
    isSigningOut,
    promptSignOut,
    closeSignOutModal,
    confirmSignOut,
  } = useShellState();

  const links = ROLE_NAVIGATION_LINKS[currentRole];

  const handleLinkPress = (screenName: string) => {
    if (onNavigate !== undefined) {
      onNavigate(screenName);
    }
  };

  const bgCanvas = isDark ? colors.neutral[900] : colors.bg;

  return (
    <View style={[styles.desktopShell, { backgroundColor: bgCanvas }]}>
      {/* Desktop Window Title Bar */}
      <View style={styles.desktopTitleBar}>
        <View style={styles.windowDots}>
          <View style={[styles.dot, { backgroundColor: COLORS.semantic.error }]} />
          <View style={[styles.dot, { backgroundColor: COLORS.semantic.warning }]} />
          <View style={[styles.dot, { backgroundColor: COLORS.semantic.success }]} />
        </View>
        <Text style={styles.windowTitleText}>NTC EDGE Workstation Client • Internal Operations</Text>
      </View>

      {/* Header */}
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
        onLogout={promptSignOut}
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
            onLogout={promptSignOut}
          />
        )}

        <View style={styles.mainContentArea}>
          <StandardScreenWrapper activeScreen={activeScreen}>
            {children}
          </StandardScreenWrapper>
        </View>
      </View>

      {/* Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        visible={isSignOutConfirmVisible}
        loading={isSigningOut}
        onClose={closeSignOutModal}
        onConfirm={confirmSignOut}
      />

      {/* Incoming Call Ringing Modal */}
      <IncomingCallModal
        onAccept={(code) => {
          if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            try {
              if ('sessionStorage' in window && window.sessionStorage !== null && window.sessionStorage !== undefined) {
                window.sessionStorage.setItem('edge_active_meeting_code', code);
              }
              if (window.location !== undefined && typeof window.location.href === 'string') {
                const url = new URL(window.location.href);
                url.searchParams.set('code', code);
                window.history.replaceState(null, '', url.toString());
              }
              window.dispatchEvent(new CustomEvent('edge_join_meeting', { detail: { code } }));
            } catch {
              // ignore
            }
          }
          handleLinkPress('Meet');
        }}
      />

      {/* Desktop Workstation Status Bar */}
      <View style={[styles.desktopStatusBar, { borderTopColor: isDark ? colors.border : COLORS.neutral[800] }]}>
        <View style={styles.statusLeft}>
          <View style={styles.statusOnlineDot} />
          <Text style={styles.statusText}>Server Status: Operational</Text>
          <Text style={styles.statusDivider}>|</Text>
          <Text style={styles.statusText}>
            Regional Office: {user?.tenantName ?? "NCR Head Office"}
          </Text>
        </View>

        <View style={styles.statusRight}>
          <LucideIcon name="activity" size={12} color={COLORS.semantic.success} />
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
    backgroundColor: COLORS.brand.navyDark,
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
    color: COLORS.neutral[400],
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
    backgroundColor: COLORS.neutral[900],
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
    backgroundColor: COLORS.semantic.success,
  },
  statusText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[400],
  },
  statusDivider: {
    color: COLORS.neutral[700],
    fontSize: 11,
  },
  statusRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});

