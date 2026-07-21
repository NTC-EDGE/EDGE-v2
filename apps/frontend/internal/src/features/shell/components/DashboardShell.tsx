import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions, Animated, Easing, Pressable } from 'react-native';
import { COLORS, SPACING } from '@edge/ui';
import { useShellState } from '../hooks/useShellState';
import { ROLE_NAVIGATION_LINKS } from '../context/RoleContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TransitionWrapper } from './TransitionWrapper';

interface DashboardShellProps {
  children: React.ReactNode;
  activeScreen?: string;
  onNavigate?: (screenName: string) => void;
}

export function DashboardShell({
  children,
  activeScreen = 'Dashboard',
  onNavigate,
}: DashboardShellProps) {
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
      }).start(({ finished }: { finished?: boolean }) => {
        if (finished === true) {
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
      {/* Left Sidebar (Desktop Only) */}
      {!isMobile && (
        <Sidebar
          currentRole={currentRole}
          links={links}
          activeScreen={activeScreen}
          onNavigate={handleLinkPress}
        />
      )}

      {/* Mobile Drawer (Backdrop & Sliding Sidebar) */}
      {isMobile && shouldRenderSidebar && (
        <>
          <Animated.View
            style={[
              styles.backdrop,
              { opacity: backdropOpacity },
            ]}
          >
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

      {/* Right Content Area */}
      <View style={styles.mainWrapper}>
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
          onMenuPress={toggleSidebar}
        />

        {/* Main Scrolling Body */}
        <ScrollView
          style={styles.contentScrollView}
          contentContainerStyle={[
            styles.contentContainer,
            isMobile && styles.mobileContentContainer,
          ]}
        >
          <View style={styles.maxContainer}>
            <TransitionWrapper trigger={activeScreen}>
              {children}
            </TransitionWrapper>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
  },
  mainWrapper: {
    flex: 1,
    flexDirection: 'column',
    height: '100%',
  },
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
    paddingVertical: SPACING[16],
  },
  maxContainer: {
    width: '100%',
    maxWidth: 1600,
    alignSelf: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
    zIndex: 90,
  },
  backdropPressable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mobileSidebarContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    height: '100%',
    zIndex: 95,
  },
});

