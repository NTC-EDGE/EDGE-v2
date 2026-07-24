import { useState } from "react";
import { StyleSheet, View, Text, Pressable, Platform } from "react-native";
import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  Icon as Lucide,
  SHADOWS,
} from "@edge/ui";
import { UserRole } from "../context/RoleContext";
import { UserProfile as UserProfileType } from "../../auth/context/AuthContext";
import { RoleSwitcher } from "./RoleSwitcher";

interface HeaderProps {
  currentRole: UserRole;
  onRoleSelect: (role: UserRole) => void;
  showRoleDropdown: boolean;
  toggleRoleDropdown: () => void;
  closeRoleDropdown: () => void;
  isSwitcherHovered: boolean;
  setIsSwitcherHovered: (hovered: boolean) => void;
  isLogoutHovered: boolean;
  setIsLogoutHovered: (hovered: boolean) => void;
  user: UserProfileType | null;
  onLogout: () => void | Promise<void>;
  isMobile?: boolean;
  onMenuPress?: () => void;
}

export function Header({
  currentRole,
  onRoleSelect,
  showRoleDropdown,
  toggleRoleDropdown,
  closeRoleDropdown,
  isSwitcherHovered,
  setIsSwitcherHovered,
  isLogoutHovered,
  setIsLogoutHovered,
  user,
  onLogout,
  isMobile = false,
  onMenuPress,
}: HeaderProps) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const profileName = user?.name ?? "User";
  const profileEmail = user?.email ?? "";

  const getInitials = (name: string) => {
    if (!name || name === "User") return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const LogoSeal = () => (
    <View style={styles.sealCircle}>
      <View style={styles.sealBlue} />
      <View style={styles.sealRed} />
      <View style={styles.sealTriangle} />
      <View style={styles.sealSun} />
    </View>
  );

  return (
    <View style={[styles.header, isMobile && styles.headerMobile]}>
      {/* Left side: Hamburger (Mobile) and Title */}
      <View style={styles.leftContainer}>
        {isMobile && (
          <Pressable onPress={onMenuPress} style={styles.menuBtn}>
            <Lucide name="menu" size={20} color={COLORS.neutral.white} />
          </Pressable>
        )}
        <LogoSeal />
        <View style={styles.logoTextWrapper}>
          <Text style={styles.logoTitle}>EDGE</Text>
          <Text style={styles.logoSubtitle}>
            NATIONAL TELECOMMUNICATIONS COMMISSION
          </Text>
        </View>
      </View>

      {/* Header Controls */}
      <View style={styles.headerControls}>
        {/* Notification Bell */}
        <Pressable style={styles.bellBtn}>
          <Lucide name="bell" size={20} color={COLORS.neutral.white} />
        </Pressable>

        {!isMobile ? (
          <View style={styles.profileWrapper}>
            {/* User Profile Pressable (opens dropdown) */}
            <Pressable
              onPress={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              style={styles.profileContainer}
            >
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profileName}</Text>
                <Text style={styles.profileRole}>{currentRole}</Text>
              </View>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {getInitials(profileName)}
                </Text>
              </View>
            </Pressable>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <View style={[styles.profileDropdownCard, SHADOWS.modal]}>
                <View style={styles.dropdownHeader}>
                  <Text style={styles.dropdownName}>{profileName}</Text>
                  <Text style={styles.dropdownEmail}>{profileEmail}</Text>
                </View>

                <View style={styles.dropdownDivider} />

                <Text style={styles.dropdownSectionTitle}>
                  Switch Active Role
                </Text>
                <RoleSwitcher
                  currentRole={currentRole}
                  onRoleSelect={(role) => {
                    onRoleSelect(role);
                    setIsProfileDropdownOpen(false);
                  }}
                  showRoleDropdown={showRoleDropdown}
                  toggleRoleDropdown={toggleRoleDropdown}
                  closeRoleDropdown={closeRoleDropdown}
                  isSwitcherHovered={isSwitcherHovered}
                  setIsSwitcherHovered={setIsSwitcherHovered}
                  variant="dropdown"
                />

                <View style={styles.dropdownDivider} />

                <Pressable
                  onPress={() => {
                    setIsProfileDropdownOpen(false);
                    const result = onLogout();
                    if (result instanceof Promise) {
                      result.catch((error: unknown) =>
                        console.error("Logout error:", error),
                      );
                    }
                  }}
                  style={styles.dropdownLogoutBtn}
                >
                  <Lucide
                    name="log-out"
                    size={14}
                    color={COLORS.semantic.error}
                  />
                  <Text style={styles.dropdownLogoutText}>Logout</Text>
                </Pressable>
              </View>
            )}
          </View>
        ) : (
          /* Mobile Simplified Profile (toggles sidebar on press) */
          <Pressable onPress={onMenuPress} style={styles.mobileAvatarPressable}>
            <View
              style={[
                styles.avatarCircle,
                { width: 32, height: 32, borderRadius: 16 },
              ]}
            >
              <Text style={[styles.avatarText, { fontSize: 11 }]}>
                {getInitials(profileName)}
              </Text>
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING[32],
    zIndex: 100,
    backgroundColor: "#0F3C99",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    ...Platform.select({
      web: {
        backgroundImage: "linear-gradient(135deg, #0A42BA 0%, #0F3C99 100%)",
        boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.08)",
      },
    }),
  },
  headerMobile: {
    paddingHorizontal: SPACING[16],
    height: 64,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: SPACING[16],
    gap: SPACING[12],
  },
  menuBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  logoTextWrapper: {
    flexDirection: "column",
    justifyContent: "center",
  },
  logoTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.neutral.white,
    letterSpacing: 0.8,
    lineHeight: 22,
  },
  logoSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 8,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "rgba(255, 255, 255, 0.75)",
    letterSpacing: 0.5,
    marginTop: 1,
  },
  sealCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.9)",
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#FFFFFF",
  },
  sealBlue: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: "#0038A8",
  },
  sealRed: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: "#CE1126",
  },
  sealTriangle: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderTopWidth: 18,
    borderBottomWidth: 18,
    borderLeftWidth: 18,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#FFFFFF",
    borderRightColor: "transparent",
  },
  sealSun: {
    position: "absolute",
    top: 15,
    left: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FCD116",
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[16],
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    ...Platform.select({
      web: {
        transition: "background-color 200ms ease",
        cursor: "pointer",
      },
    }),
  },
  profileWrapper: {
    position: "relative",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[12],
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  profileInfo: {
    alignItems: "flex-end",
  },
  profileName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
  profileRole: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.65)",
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: 2,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#00E676", // Premium bright green-blue border from screenshot 2
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral.white,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 13,
  },
  mobileAvatarPressable: {
    borderRadius: 9999,
    padding: 2,
  },
  profileDropdownCard: {
    position: "absolute",
    top: 52,
    right: 0,
    width: 250,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[16],
    zIndex: 200,
  },
  dropdownHeader: {
    marginBottom: SPACING[8],
  },
  dropdownName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  dropdownEmail: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
    marginVertical: SPACING[12],
  },
  dropdownSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[400],
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING[8],
  },
  dropdownLogoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: SPACING[4],
  },
  dropdownLogoutText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.semantic.error,
  },
});
