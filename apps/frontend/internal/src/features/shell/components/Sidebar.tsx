import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { UserRole, NavigationLink } from '../context/RoleContext';
import { SidebarNavItem } from './SidebarNavItem';
import { RoleSwitcher } from './RoleSwitcher';

interface SidebarProps {
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
}: SidebarProps) {
  const [showMobileRoleDropdown, setShowMobileRoleDropdown] = useState(false);
  const [isSwitcherHovered, setIsSwitcherHovered] = useState(false);

  const toggleMobileRoleDropdown = () => {
    setShowMobileRoleDropdown((prev) => !prev);
  };

  const closeMobileRoleDropdown = () => {
    setShowMobileRoleDropdown(false);
  };

  return (
    <View style={[styles.sidebar, isMobile && styles.sidebarMobile]}>
      {/* Sidebar Header (Mobile drawer only) */}
      {isMobile && (
        <View style={styles.sidebarHeader}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoIcon}>
              <Lucide name="shield" size={20} color={COLORS.brand[800]} />
            </View>
            <View>
              <Text style={styles.logoTitle}>EDGE</Text>
              <Text style={styles.logoSubtitle}>INTERNAL PORTAL</Text>
            </View>
          </View>

          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Lucide name="x" size={18} color={COLORS.neutral[500]} />
          </Pressable>
        </View>
      )}

      {/* Sidebar Navigation Links */}
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

      {/* Sidebar Footer */}
      <View style={styles.sidebarFooter}>
        {isMobile ? (
          <View style={styles.mobileFooterContainer}>
            <Text style={styles.roleLabel}>Switch Active Role</Text>
            <View style={styles.roleSwitcherWrapper}>
              <RoleSwitcher
                currentRole={currentRole}
                onRoleSelect={(role) => {
                  onRoleSelect?.(role);
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
              style={styles.mobileLogoutBtn}
            >
              <Lucide name="log-out" size={16} color={COLORS.semantic.error} />
              <Text style={styles.mobileLogoutText}>Logout</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.roleLabel}>Current Role</Text>
            <Text style={styles.roleValue}>{currentRole}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 260, // Refined sidebar width
    backgroundColor: COLORS.neutral.white,
    borderRightWidth: 1,
    borderRightColor: COLORS.neutral[200],
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
    borderBottomColor: COLORS.neutral[200],
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[12],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  logoTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[400],
    letterSpacing: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  sidebarNav: {
    flex: 1,
  },
  sidebarNavContent: {
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[16],
  },
  sidebarFooter: {
    padding: SPACING[20],
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[100],
    backgroundColor: COLORS.neutral[50],
  },
  roleLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[400],
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  roleValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.brand[800],
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
    borderColor: COLORS.semantic.errorBorder,
    backgroundColor: COLORS.semantic.errorBg,
    width: '100%',
  },
  mobileLogoutText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.semantic.error,
    marginLeft: 8,
  },
});
