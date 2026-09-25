import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Animated,
  Easing,
  Pressable,
} from "react-native";
import { COLORS, useTheme } from "@edge/ui";
import { useShellState } from "../hooks/useShellState";
import { ROLE_NAVIGATION_LINKS } from "../context/RoleContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileBottomTabBar } from "./MobileBottomTabBar";
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
    isSidebarOpen,
    closeSidebar,
    toggleSidebar,
    isSignOutConfirmVisible,
    isSigningOut,
    promptSignOut,
    closeSignOutModal,
    confirmSignOut,
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
      }).start(({ finished }) => {
        if (finished) {
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

  const bgCanvas = isDark ? colors.neutral[900] : colors.bg;

  return (
    <SafeAreaView style={[styles.nativeSafeArea, { backgroundColor: bgCanvas }]}>
      <View style={[styles.shell, { backgroundColor: bgCanvas }]}>
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
          isMobile={true}
          onMenuPress={toggleSidebar}
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
                  onLogout={promptSignOut}
                  onRoleSelect={handleRoleSelect}
                />
              </Animated.View>
            </>
          )}

          <View style={styles.mainContentArea}>{children}</View>
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
          onAccept={(_code) => {
            handleLinkPress('Meet');
          }}
        />

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
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.neutral.black,
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

