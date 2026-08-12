import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  useWindowDimensions,
  Platform,
  StyleSheet,
} from "react-native";
import { Icon, COLORS, TYPOGRAPHY, SPACING } from "@edge/ui";
import { useUser, useAuth } from "@clerk/expo";
import { useAppNavigation } from "../../navigation";
import { ClientFooter } from "./ClientFooter";
import { ConfirmationDialog } from "./ConfirmationDialog";

const ntcLogo = require("../../../assets/ntc-logo.png");

interface ClientAppLayoutProps {
  activeTab: "services" | "my-applications";
  hideSidebar?: boolean;
  onBeforeNavigate?: (targetTab: "services" | "my-applications", proceed: () => void) => void;
  children: React.ReactNode;
}

export function ClientAppLayout({
  activeTab,
  hideSidebar = false,
  onBeforeNavigate,
  children,
}: ClientAppLayoutProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const showBottomNav = width < 1024;
  const showSidebar = width >= 1024;
  const navigation = useAppNavigation();

  // Clerk Auth
  const { user: clerkUser } = useUser();
  const { signOut } = useAuth();

  // Local UI States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNoticeDismissed, setIsNoticeDismissed] = useState(false);
  const [isLogoutConfirmVisible, setIsLogoutConfirmVisible] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);

  // User Profile
  const userProfile = useMemo(() => {
    if (clerkUser !== null && clerkUser !== undefined) {
      return {
        name:
          clerkUser.fullName ??
          clerkUser.primaryEmailAddress?.emailAddress?.split("@")[0] ??
          "Client User",
        email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
      };
    }
    return null;
  }, [clerkUser]);

  const handleSignOutPress = () => {
    setIsLogoutConfirmVisible(true);
  };

  const handleConfirmSignOut = async () => {
    setIsLogoutConfirmVisible(false);
    await signOut();
  };

  const handleTabClick = (targetTab: "services" | "my-applications") => {
    if (targetTab === activeTab) return;

    const navigate = () => {
      if (targetTab === "services") {
        navigation.navigate("Services");
      } else {
        navigation.navigate("MyApplications");
      }
    };

    if (onBeforeNavigate) {
      onBeforeNavigate(targetTab, navigate);
    } else {
      navigate();
    }
  };

  return (
    <View style={styles.rootContainer}>
      {/* ── 1. Top Header ──────────────────────────────────────────────── */}
      <View style={styles.topHeader}>
        <View style={styles.logoWrapper}>
          <Image
            source={ntcLogo}
            style={{ width: 50, height: 36, marginRight: 6 }}
            resizeMode="contain"
          />
          <View style={{ flexDirection: "column" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={styles.goldBadgePill}>
                <Text style={styles.goldBadgeText}>PORTAL</Text>
              </View>
            </View>
            {!isMobile && (
              <Text style={styles.brandAgencySubtext}>
                National Telecommunications Commission · Republic of the Philippines
              </Text>
            )}
          </View>
        </View>

        {userProfile !== null && (
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => setIsProfileVisible(true)}
              style={styles.profileAvatarBtn}
              activeOpacity={0.7}
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {userProfile.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              {!isMobile && (
                <Text style={{ color: "#ffffff", fontSize: 13, fontWeight: "600" }}>
                  {userProfile.name}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSignOutPress}
              style={styles.topLogoutBtn}
              activeOpacity={0.8}
            >
              <Icon
                name="log-out"
                size={14}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              {!isMobile && <Text style={styles.topLogoutText}>Sign Out</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── 2. Dismissable Processing Hours Notice ────────────────────────── */}
      {!isNoticeDismissed && (
        <View style={styles.noticeAlert}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 12 }}>
            <Icon name="info" size={16} color="#d97706" style={{ marginRight: 10 }} />
            <Text style={styles.noticeText}>
              <Text style={{ fontWeight: "700", color: "#0F2C59" }}>Official NTC Processing Hours: </Text>
              Applications are processed on business weekdays, 8:00 AM–5:00 PM PST.
              Submissions outside operating hours will be queued for the next business day.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsNoticeDismissed(true)}
            style={{ padding: 4 }}
            activeOpacity={0.7}
          >
            <Icon name="x" size={16} color="#92400E" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── 3. Main Body Area (Left Sidebar + Content) ────────────────────── */}
      <View style={styles.mainLayout}>
        {/* Left Sidebar Panel */}
        {showSidebar && !hideSidebar && (
          <View
            style={[
              styles.sidebar,
              isSidebarCollapsed && styles.sidebarCollapsed,
            ]}
          >
            <TouchableOpacity
              onPress={() => setIsSidebarCollapsed((prev) => !prev)}
              style={styles.collapseToggle}
            >
              <Icon
                name={isSidebarCollapsed ? "chevron-right" : "chevron-left"}
                size={16}
                color="#64748B"
              />
            </TouchableOpacity>

            <View style={styles.sidebarItems}>
              <TouchableOpacity
                onPress={() => handleTabClick("services")}
                style={[
                  styles.sidebarItem,
                  activeTab === "services" && styles.sidebarItemActive,
                ]}
                activeOpacity={0.8}
              >
                <Icon
                  name="radio"
                  size={20}
                  color={activeTab === "services" ? "#FFFFFF" : "#64748B"}
                />
                {!isSidebarCollapsed && (
                  <Text
                    style={
                      activeTab === "services"
                        ? styles.sidebarItemTextActive
                        : styles.sidebarItemText
                    }
                  >
                    Services
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleTabClick("my-applications")}
                style={[
                  styles.sidebarItem,
                  activeTab === "my-applications" && styles.sidebarItemActive,
                ]}
                activeOpacity={0.8}
              >
                <Icon
                  name="credit-card"
                  size={20}
                  color={activeTab === "my-applications" ? "#FFFFFF" : "#64748B"}
                />
                {!isSidebarCollapsed && (
                  <Text
                    style={
                      activeTab === "my-applications"
                        ? styles.sidebarItemTextActive
                        : styles.sidebarItemText
                    }
                  >
                    My Applications
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Dynamic Content Body */}
        <View style={{ flex: 1 }}>{children}</View>
      </View>

      {/* ── 4. Bottom Navigation Bar (Mobile & Portrait iPad <1024px) ────────────── */}
      {showBottomNav && (
        <View style={styles.mobileBottomNav}>
          <TouchableOpacity
            onPress={() => handleTabClick("services")}
            style={[
              styles.mobileNavItem,
              activeTab === "services" && styles.mobileNavItemActive,
            ]}
            activeOpacity={0.7}
          >
            <Icon
              name="radio"
              size={20}
              color={activeTab === "services" ? "#0F2C59" : "#64748B"}
            />
            <Text
              style={[
                styles.mobileNavText,
                activeTab === "services" && styles.mobileNavTextActive,
              ]}
            >
              Services
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTabClick("my-applications")}
            style={[
              styles.mobileNavItem,
              activeTab === "my-applications" && styles.mobileNavItemActive,
            ]}
            activeOpacity={0.7}
          >
            <Icon
              name="credit-card"
              size={20}
              color={activeTab === "my-applications" ? "#0F2C59" : "#64748B"}
            />
            <Text
              style={[
                styles.mobileNavText,
                activeTab === "my-applications" && styles.mobileNavTextActive,
              ]}
            >
              My Applications
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── 5. Footer Banner ────────────────────────────────────────────── */}
      <ClientFooter />

      {/* Profile Detail Modal */}
      <Modal
        visible={isProfileVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsProfileVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.profileCard}>
            <View style={styles.profileAccentLine} />
            <View style={styles.profileHeader}>
              <View style={styles.profileIconContainer}>
                <Icon name="user" size={28} color="#2563EB" />
              </View>
              <Text style={styles.profileTitle}>User Profile</Text>
            </View>

            <View style={styles.profileDetails}>
              <View style={styles.profileDetailRow}>
                <Text style={styles.profileDetailLabel}>Full Name</Text>
                <Text style={styles.profileDetailValue}>{userProfile?.name || "N/A"}</Text>
              </View>
              <View style={styles.profileDetailRow}>
                <Text style={styles.profileDetailLabel}>Email Address</Text>
                <Text style={styles.profileDetailValue}>{userProfile?.email || "N/A"}</Text>
              </View>
              <View style={styles.profileDetailRow}>
                <Text style={styles.profileDetailLabel}>Clerk ID</Text>
                <Text style={styles.profileDetailValue} numberOfLines={1} ellipsizeMode="middle">
                  {clerkUser?.id || "N/A"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setIsProfileVisible(false)}
              style={styles.profileCloseButton}
            >
              <Text style={styles.profileCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sign Out Confirmation Dialog */}
      <ConfirmationDialog
        visible={isLogoutConfirmVisible}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        iconName="log-out"
        onClose={() => setIsLogoutConfirmVisible(false)}
        actions={[
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setIsLogoutConfirmVisible(false),
          },
          {
            text: "Yes, Sign Out",
            style: "destructive",
            onPress: handleConfirmSignOut,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    flexDirection: "column",
  },
  topHeader: {
    height: 64,
    backgroundColor: "#0F2C59",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING[20],
    borderBottomWidth: 3,
    borderBottomColor: "#D97706",
    ...Platform.select({
      web: {
        backgroundImage: "linear-gradient(135deg, #0F2C59 0%, #1E3E62 60%, #1E40AF 100%)",
        boxShadow: "0 4px 16px rgba(15, 44, 89, 0.25)",
      },
    }),
  },
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  goldBadgePill: {
    backgroundColor: "rgba(217, 119, 6, 0.25)",
    borderColor: "#F59E0B",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  goldBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: "800",
    color: "#FCD34D",
    letterSpacing: 0.8,
  },
  brandAgencySubtext: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.75)",
    letterSpacing: 0.3,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileAvatarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#0F2C59",
    fontSize: 14,
    fontWeight: "bold",
  },
  topLogoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  topLogoutText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  noticeAlert: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: "#D97706",
    padding: SPACING[16],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  noticeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#0F2C59",
    lineHeight: 19,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  mainLayout: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 210,
    backgroundColor: "#FAFAFC",
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
    paddingTop: SPACING[20],
    position: "relative",
    overflow: "visible",
  },
  sidebarCollapsed: {
    width: 64,
  },
  collapseToggle: {
    position: "absolute",
    right: -14,
    top: 24,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
    elevation: 3,
    ...Platform.select({
      web: {
        cursor: "pointer",
        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
      },
    }),
  },
  sidebarItems: {
    flexDirection: "column",
    paddingHorizontal: 10,
    gap: 8,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
  },
  sidebarItemActive: {
    backgroundColor: "#0F2C59",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    ...Platform.select({
      web: {
        boxShadow: "0 4px 12px rgba(15, 44, 89, 0.18)",
      },
    }),
  },
  sidebarItemTextActive: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#FFFFFF",
    marginLeft: 12,
  },
  sidebarItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: "#475569",
    marginLeft: 12,
  },
  mobileBottomNav: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    shadowColor: "#0F2C59",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  mobileNavItem: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 2,
  },
  mobileNavItemActive: {
    borderTopWidth: 2,
    borderTopColor: "#0F2C59",
  },
  mobileNavText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  mobileNavTextActive: {
    color: "#0F2C59",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(226, 232, 240, 0.8)",
    borderWidth: 1,
    borderRadius: 20,
    width: "100%",
    maxWidth: 420,
    padding: 32,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      web: {
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
    }),
  },
  profileAccentLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#2563eb",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
  },
  profileIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  profileTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0f172a",
    flex: 1,
  },
  profileDetails: {
    flexDirection: "column",
    gap: 16,
    marginBottom: 28,
  },
  profileDetailRow: {
    flexDirection: "column",
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 10,
  },
  profileDetailLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748b",
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  profileDetailValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: "#334155",
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  profileCloseButton: {
    height: 46,
    borderRadius: 8,
    backgroundColor: "#1d4ed8",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
    }),
  },
  profileCloseButtonText: {
    color: "#FFFFFF",
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontSize: 14,
  },
});
