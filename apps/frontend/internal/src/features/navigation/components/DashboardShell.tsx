import React, { useState, ComponentProps } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { Feather as Lucide } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "../../shared/theme/tokens";
import {
  useRole,
  ROLES,
  ROLE_NAVIGATION_LINKS,
  UserRole,
  NavigationLink,
} from "../context/RoleContext";
import { useAuthContext } from "../../auth/context/AuthContext";

type LucideIconName = ComponentProps<typeof Lucide>["name"];

interface SidebarNavItemProps {
  link: NavigationLink;
  isActive: boolean;
  onPress: (screen: string) => void;
}

function SidebarNavItem({ link, isActive, onPress }: SidebarNavItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      onPress={() => onPress(link.screen)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        styles.navItem,
        isActive ? styles.navItemActive : styles.navItemInactive,
        !isActive && isHovered && styles.navItemHover,
      ]}
    >
      <View style={styles.navIconWrapper}>
        <Lucide
          name={link.icon}
          size={20}
          color={
            isActive
              ? COLORS.neutral.white
              : isHovered
                ? COLORS.brand[800]
                : COLORS.neutral[500]
          }
        />
      </View>
      <Text
        style={[
          styles.navText,
          isActive ? styles.navTextActive : styles.navTextInactive,
          !isActive && isHovered && styles.navTextHover,
        ]}
      >
        {link.name}
      </Text>
    </Pressable>
  );
}

interface RoleDropdownItemProps {
  role: UserRole;
  isSelected: boolean;
  onSelect: (role: UserRole) => void;
}

function RoleDropdownItem({
  role,
  isSelected,
  onSelect,
}: RoleDropdownItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      onPress={() => onSelect(role)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        styles.dropdownItem,
        isSelected && styles.dropdownItemActive,
        !isSelected && isHovered && styles.dropdownItemHover,
      ]}
    >
      <Text
        style={[
          styles.dropdownItemText,
          isSelected && styles.dropdownItemTextActive,
        ]}
      >
        {role}
      </Text>
      {isSelected ? (
        <Lucide name="check" size={14} color={COLORS.brand[700]} />
      ) : null}
    </Pressable>
  );
}

interface DashboardShellProps {
  children: React.ReactNode;
  activeScreen?: string;
  onNavigate?: (screenName: string) => void;
}

export function DashboardShell({
  children,
  activeScreen = "Dashboard",
  onNavigate,
}: DashboardShellProps) {
  const { currentRole, setCurrentRole } = useRole();
  const { user, logout } = useAuthContext();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isSwitcherHovered, setIsSwitcherHovered] = useState(false);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

  const links = ROLE_NAVIGATION_LINKS[currentRole] ?? [];

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
    setShowRoleDropdown(false);
  };

  const handleLinkPress = (screenName: string) => {
    if (onNavigate !== undefined) {
      onNavigate(screenName);
    }
  };

  const userInitial =
    user !== null && user.name.length > 0
      ? user.name.charAt(0).toUpperCase()
      : "S";

  return (
    <View style={styles.shell}>
      {/* Left Sidebar */}
      <View style={styles.sidebar}>
        {/* Sidebar Header */}
        <View style={styles.sidebarHeader}>
          <View style={styles.logoIcon}>
            <Lucide name="shield" size={24} color={COLORS.brand[800]} />
          </View>
          <View>
            <Text style={styles.logoTitle}>EDGE</Text>
            <Text style={styles.logoSubtitle}>INTERNAL PORTAL</Text>
          </View>
        </View>

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
                onPress={handleLinkPress}
              />
            );
          })}
        </ScrollView>

        {/* Sidebar Footer */}
        <View style={styles.sidebarFooter}>
          <Text style={styles.roleLabel}>Current Role</Text>
          <Text style={styles.roleValue}>{currentRole}</Text>
        </View>
      </View>

      {/* Right Content Area */}
      <View style={styles.mainWrapper}>
        {/* Top Navigation Header */}
        <View style={[styles.header, styles.headerGradient]}>
          <Text style={styles.headerTitle}>
            National Telecomminications Commission
          </Text>

          {/* Header Controls */}
          <View style={styles.headerControls}>
            {/* Simulated Role Switcher Dropdown */}
            <View style={styles.switcherContainer}>
              <Pressable
                onPress={() => setShowRoleDropdown(!showRoleDropdown)}
                onHoverIn={() => setIsSwitcherHovered(true)}
                onHoverOut={() => setIsSwitcherHovered(false)}
                style={[
                  styles.switcherBtn,
                  isSwitcherHovered && styles.switcherBtnHover,
                ]}
              >
                <Lucide
                  name="user-check"
                  size={16}
                  color={COLORS.neutral.white}
                  style={styles.switcherIcon}
                />
                <Text style={styles.switcherText}>Role: {currentRole}</Text>
                <Lucide
                  name="chevron-down"
                  size={14}
                  color={COLORS.neutral.white}
                />
              </Pressable>

              {/* Custom Dropdown Popover */}
              {showRoleDropdown ? (
                <>
                  <Pressable
                    style={styles.dropdownOverlay}
                    onPress={() => setShowRoleDropdown(false)}
                  />
                  <View style={[styles.dropdownPopover, SHADOWS.modal]}>
                    <Text style={styles.dropdownHeader}>
                      Switch Active Role
                    </Text>
                    {ROLES.map((role) => {
                      const isSelected = currentRole === role;
                      return (
                        <RoleDropdownItem
                          key={role}
                          role={role}
                          isSelected={isSelected}
                          onSelect={handleRoleSelect}
                        />
                      );
                    })}
                  </View>
                </>
              ) : null}
            </View>

            {/* Vertical Divider */}
            <View style={styles.divider} />

            {/* User Profile */}
            <View style={styles.profileContainer}>
              {user?.avatarUrl !== undefined && user.avatarUrl.length > 0 ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={styles.profileAvatar}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>{userInitial}</Text>
                </View>
              )}
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user?.name ?? "Staff User"}
                </Text>
                <Text style={styles.profileEmail}>
                  {user?.email ?? "staff@edge.gov"}
                </Text>
              </View>
            </View>

            {/* Logout Button */}
            <Pressable
              onPress={logout}
              onHoverIn={() => setIsLogoutHovered(true)}
              onHoverOut={() => setIsLogoutHovered(false)}
              style={[
                styles.logoutBtn,
                isLogoutHovered && styles.logoutBtnHover,
              ]}
            >
              <Lucide name="log-out" size={16} color={COLORS.neutral.white} />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        </View>

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

const styles = {
  shell: {
    flex: 1,
    flexDirection: "row" as const,
    backgroundColor: COLORS.bg,
  },
  dropdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  sidebar: {
    width: 280,
    backgroundColor: COLORS.neutral.white,
    borderRightWidth: 1,
    borderRightColor: COLORS.neutral[200],
    flexDirection: "column" as const,
    height: "100%",
    zIndex: 10,
  },
  sidebarHeader: {
    height: 72,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: SPACING[20],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.neutral[100],
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: SPACING[12],
  },
  logoTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[500],
    letterSpacing: 1,
  },
  sidebarNav: {
    flex: 1,
  },
  sidebarNavContent: {
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[16],
  },
  navItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderRadius: 14,
    marginBottom: SPACING[8],
  },
  navItemActive: {
    backgroundColor: COLORS.brand[700],
  },
  navItemInactive: {
    backgroundColor: "transparent",
  },
  navItemHover: {
    backgroundColor: COLORS.neutral[100],
  },
  navIconWrapper: {
    marginRight: SPACING[16],
    width: 24,
    alignItems: "center" as const,
  },
  navText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    // color: COLORS.neutral[500],
  },
  navTextActive: {
    color: COLORS.neutral.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  navTextInactive: {
    color: COLORS.neutral[50],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  navTextHover: {
    color: COLORS.brand[800],
  },
  sidebarFooter: {
    padding: SPACING[20],
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral[50],
  },
  roleLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    fontWeight: TYPOGRAPHY.weights.medium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  roleValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    color: COLORS.brand[800],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  mainWrapper: {
    flex: 1,
    flexDirection: "column" as const,
    height: "100%",
  },
  header: {
    height: 72,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: SPACING[32],
    zIndex: 5,
  },
  headerGradient: {
    backgroundColor: COLORS.brand[900],
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
    letterSpacing: 0.5,
  },
  headerControls: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  switcherContainer: {
    position: "relative",
    zIndex: 100,
  },
  switcherBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.input,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  switcherBtnHover: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  switcherIcon: {
    marginRight: 8,
  },
  switcherText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral.white,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginRight: 8,
  },
  dropdownPopover: {
    position: "absolute",
    top: 48,
    right: 0,
    width: 200,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[8],
    zIndex: 101,
  },
  dropdownHeader: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[400],
    fontWeight: TYPOGRAPHY.weights.semibold,
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
    marginBottom: 4,
  },
  dropdownItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
  },
  dropdownItemHover: {
    backgroundColor: COLORS.neutral[50],
  },
  dropdownItemActive: {
    backgroundColor: COLORS.neutral[50],
  },
  dropdownItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[700],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  dropdownItemTextActive: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: SPACING[20],
  },
  profileContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.circle,
    marginRight: SPACING[12],
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.circle,
    backgroundColor: COLORS.neutral.white,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: SPACING[12],
  },
  avatarFallbackText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.brand[900],
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 14,
  },
  profileInfo: {
    marginRight: SPACING[20],
  },
  profileName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
  profileEmail: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[300],
  },
  logoutBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.input,
  },
  logoutBtnHover: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  logoutText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral.white,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginLeft: 8,
  },
  contentScrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING[32],
    paddingVertical: SPACING[32],
    alignItems: "center" as const,
  },
  maxContainer: {
    width: "100%",
    maxWidth: 1600,
    alignSelf: "center" as const,
  },
} as const;
