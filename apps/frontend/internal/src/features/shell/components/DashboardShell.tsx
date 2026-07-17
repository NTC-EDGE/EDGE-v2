import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { COLORS, SPACING } from '../../shared/theme/tokens';
import { useShellState } from '../hooks/useShellState';
import { ROLE_NAVIGATION_LINKS } from '../context/RoleContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

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
  } = useShellState();

  const links = ROLE_NAVIGATION_LINKS[currentRole];

  const handleLinkPress = (screenName: string) => {
    if (onNavigate !== undefined) {
      onNavigate(screenName);
    }
  };

  return (
    <View style={styles.shell}>
      {/* Left Sidebar */}
      <Sidebar
        currentRole={currentRole}
        links={links}
        activeScreen={activeScreen}
        onNavigate={handleLinkPress}
      />

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
        />

        {/* Main Scrolling Body */}
        <ScrollView
          style={styles.contentScrollView}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.maxContainer}>{children}</View>
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
  maxContainer: {
    width: '100%',
    maxWidth: 1600,
    alignSelf: 'center',
  },
});
