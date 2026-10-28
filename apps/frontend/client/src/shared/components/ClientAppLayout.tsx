import React, { useState, useMemo, useCallback, useEffect } from "react";
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
import {
  ApiResponse,
  PagedApplicationListDto,
  ApplicationSummaryDto,
  StatementOfAccountDto,
} from "@edge/api";
import { useUser, useAuth } from "@clerk/expo";
import { useApi } from "../hooks/useApi";
import { useAppNavigation } from "../../navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { openApplicationDetail } from "../helpers/applicationNavigationHelper";
import { ClientFooter } from "./ClientFooter";
import { ConfirmationDialog } from "./ConfirmationDialog";

const ntcLogo = require("../../../assets/ntc-logo.png");

const CLIENT_NOTIF_STORAGE_PREFIX = "edge_client_read_notifications";

function getStoredClientReadNotifs(userId?: string): Set<string> {
  if (Platform.OS !== "web") return new Set();
  try {
    const key = userId !== undefined && userId !== "" ? `${CLIENT_NOTIF_STORAGE_PREFIX}_${userId}` : CLIENT_NOTIF_STORAGE_PREFIX;
    const raw = window.localStorage.getItem(key);
    if (raw !== null && raw !== "") {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch {
    // ignore
  }
  return new Set();
}

function saveStoredClientReadNotifs(set: Set<string>, userId?: string): void {
  if (Platform.OS !== "web") return;
  try {
    const key = userId !== undefined && userId !== "" ? `${CLIENT_NOTIF_STORAGE_PREFIX}_${userId}` : CLIENT_NOTIF_STORAGE_PREFIX;
    window.localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

function formatClientTimeAgo(dateString?: string): string {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

interface ClientAppLayoutProps {
  activeTab: "services" | "my-applications" | "settings";
  hideSidebar?: boolean;
  onBeforeNavigate?: (targetTab: "services" | "my-applications" | "settings", proceed: () => void) => void;
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
  const insets = useSafeAreaInsets();
  const notifDropdownWidth = Math.min(330, width - 24);
  const navigation = useAppNavigation();

  // Clerk Auth
  const { user: clerkUser } = useUser();
  const { signOut } = useAuth();

  const api = useApi();

  // Real-time user application notifications & action counts
  const { data: myAppsData } = api.useQuery<ApiResponse<PagedApplicationListDto>>(
    clerkUser !== null && clerkUser !== undefined ? "/api/v2/applications/me" : null,
    { revalidateOnFocus: true, refreshInterval: 30000 }
  );

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(() => getStoredClientReadNotifs(clerkUser?.id));

  useEffect(() => {
    if (clerkUser?.id !== undefined) {
      setReadNotifIds(getStoredClientReadNotifs(clerkUser.id));
    }
  }, [clerkUser?.id]);

  const clientNotifications = useMemo(() => {
    const list: Array<{
      id: string;
      appId?: string;
      title: string;
      description: string;
      timestamp?: string;
      type: "returned" | "payment" | "status" | "renewal";
      targetTab: "services" | "my-applications" | "settings";
      isRead: boolean;
    }> = [];

    const payload = myAppsData?.data;
    const items: ApplicationSummaryDto[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.items)
      ? payload.items
      : [];

    for (const app of items) {
      const hasApprovedSoa =
        Array.isArray(app.statementsOfAccount) &&
        app.statementsOfAccount.some((s: StatementOfAccountDto) => s.status === "Approved");

      if (app.status === "Returned") {
        list.push({
          id: `client_ret_${app.id}`,
          appId: app.id,
          title: "Application Returned for Correction",
          description: `Ref #${app.referenceNumber ?? app.applicationNumber ?? "N/A"}: Remarks - ${app.remarks ?? "Please check required corrections."}`,
          timestamp: app.createdAt,
          type: "returned",
          targetTab: "my-applications",
          isRead: readNotifIds.has(`client_ret_${app.id}`),
        });
      } else if (hasApprovedSoa) {
        list.push({
          id: `client_pay_${app.id}`,
          appId: app.id,
          title: "Payment Required – SOA Issued",
          description: `Ref #${app.referenceNumber ?? app.applicationNumber ?? "N/A"}: Statement of Account approved. Order of Payment is ready.`,
          timestamp: app.createdAt,
          type: "payment",
          targetTab: "my-applications",
          isRead: readNotifIds.has(`client_pay_${app.id}`),
        });
      } else if (app.status === "Approved" || app.status === "Completed") {
        list.push({
          id: `client_app_${app.id}`,
          appId: app.id,
          title: `Application ${app.status}`,
          description: `Ref #${app.referenceNumber ?? app.applicationNumber ?? "N/A"}: ${app.serviceName ?? "Application"} has been ${app.status.toLowerCase()}.`,
          timestamp: app.createdAt,
          type: "status",
          targetTab: "my-applications",
          isRead: readNotifIds.has(`client_app_${app.id}`),
        });

        const doc = Array.isArray(app.issuedDocumentDetails) && app.issuedDocumentDetails.length > 0
          ? app.issuedDocumentDetails.find((d) => d.expiryDate) ?? app.issuedDocumentDetails[0]
          : undefined;

        if (doc?.expiryDate && !app.hasActiveRenewal) {
          const expiry = new Date(doc.expiryDate);
          const now = new Date();
          const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysRemaining <= 60) {
            const isExpired = daysRemaining <= 0;
            const isOnDay = daysRemaining === 0;
            const expiryFormatted = expiry.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            list.push({
              id: `client_renew_${app.id}`,
              appId: app.id,
              title: isExpired
                ? (isOnDay ? "Notice: Application Expired Today" : "Notice: Application Expired")
                : `Permit/License Expiring Soon (${daysRemaining}d remaining)`,
              description: isExpired
                ? `Ref #${app.referenceNumber ?? app.applicationNumber ?? "N/A"}: Your application has been expired on ${expiryFormatted}. Please submit your renewal application.`
                : `Ref #${app.referenceNumber ?? app.applicationNumber ?? "N/A"}: Your issued ${doc.documentType || "license"} (${doc.licenseNumber || doc.formNumber || "Document"}) expires in ${daysRemaining} day(s) (on ${expiryFormatted}). Click to file a renewal application.`,
              timestamp: doc.issueDate ?? app.createdAt,
              type: "renewal",
              targetTab: "my-applications",
              isRead: readNotifIds.has(`client_renew_${app.id}`),
            });
          }
        }
      } else if (app.status === "Evaluating") {
        list.push({
          id: `client_eval_${app.id}`,
          appId: app.id,
          title: "Application Under Evaluation",
          description: `Ref #${app.referenceNumber ?? app.applicationNumber ?? "N/A"}: Being reviewed by NTC evaluators.`,
          timestamp: app.createdAt,
          type: "status",
          targetTab: "my-applications",
          isRead: readNotifIds.has(`client_eval_${app.id}`),
        });
      } else if (app.status === "Submitted") {
        list.push({
          id: `client_sub_${app.id}`,
          appId: app.id,
          title: "Application Submitted Successfully",
          description: `Ref #${app.referenceNumber ?? app.applicationNumber ?? "N/A"}: Queued for evaluation.`,
          timestamp: app.createdAt,
          type: "status",
          targetTab: "my-applications",
          isRead: readNotifIds.has(`client_sub_${app.id}`),
        });
      }
    }

    return list;
  }, [myAppsData, readNotifIds]);

  const unreadCount = useMemo(() => {
    return clientNotifications.filter((n) => !n.isRead).length;
  }, [clientNotifications]);

  const markAllAsRead = useCallback(() => {
    const nextSet = new Set(readNotifIds);
    for (const n of clientNotifications) {
      nextSet.add(n.id);
    }
    setReadNotifIds(nextSet);
    saveStoredClientReadNotifs(nextSet, clerkUser?.id);
  }, [clientNotifications, readNotifIds, clerkUser?.id]);

  const markAsRead = useCallback((id: string) => {
    const nextSet = new Set(readNotifIds);
    nextSet.add(id);
    setReadNotifIds(nextSet);
    saveStoredClientReadNotifs(nextSet, clerkUser?.id);
  }, [readNotifIds, clerkUser?.id]);

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

  const handleTabClick = (targetTab: "services" | "my-applications" | "settings") => {
    if (targetTab === activeTab) return;

    const navigate = () => {
      if (targetTab === "services") {
        navigation.navigate("Services");
      } else if (targetTab === "my-applications") {
        navigation.navigate("MyApplications");
      } else {
        navigation.navigate("Settings");
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
      <View style={[styles.topHeader, isMobile && { paddingHorizontal: 12 }]}>
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
            {/* Notification Bell */}
            <View style={{ position: "relative" }}>
              <TouchableOpacity
                onPress={() => setIsNotifOpen((prev) => !prev)}
                style={styles.bellBtn}
                activeOpacity={0.7}
              >
                <Icon name="bell" size={16} color="#FFFFFF" />
                {unreadCount > 0 && (
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeText}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Client Notifications Dropdown */}
              {isNotifOpen && (
                <>
                  <TouchableOpacity
                    style={styles.dropdownBackdrop}
                    onPress={() => setIsNotifOpen(false)}
                    activeOpacity={1}
                  />
                  <View style={[styles.clientNotifDropdown, { width: notifDropdownWidth, right: isMobile ? -8 : 0, maxWidth: width - 24 }]}>
                    <View style={styles.clientNotifHeader}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={styles.clientNotifTitle}>Notifications</Text>
                        {unreadCount > 0 && (
                          <View style={styles.clientUnreadBadge}>
                            <Text style={styles.clientUnreadBadgeText}>{unreadCount} new</Text>
                          </View>
                        )}
                      </View>
                      {unreadCount > 0 && (
                        <TouchableOpacity onPress={markAllAsRead}>
                          <Text style={styles.clientMarkAllText}>Mark all as read</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={{ maxHeight: 320 }}>
                      {clientNotifications.length === 0 ? (
                        <View style={styles.clientNotifEmpty}>
                          <Icon name="bell-off" size={24} color="#94A3B8" />
                          <Text style={styles.clientNotifEmptyText}>
                            No notifications right now
                          </Text>
                        </View>
                      ) : (
                        clientNotifications.map((item) => (
                          <TouchableOpacity
                            key={item.id}
                            onPress={() => {
                              markAsRead(item.id);
                              setIsNotifOpen(false);
                              if (item.appId !== undefined && item.appId !== null) {
                                openApplicationDetail(item.appId);
                              }
                              handleTabClick(item.targetTab);
                            }}
                            style={[
                              styles.clientNotifItem,
                              !item.isRead && styles.clientNotifItemUnread,
                            ]}
                            activeOpacity={0.7}
                          >
                            <View style={styles.clientNotifIconWrap}>
                              <Icon
                                name={item.type === "returned" ? "alert-circle" : item.type === "renewal" ? "refresh-cw" : item.type === "payment" ? "credit-card" : "file-text"}
                                size={14}
                                color={item.isRead ? "#94A3B8" : item.type === "renewal" ? "#D97706" : item.type === "returned" ? "#EF4444" : "#2563EB"}
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text
                                  style={[
                                    styles.clientNotifItemTitle,
                                    { fontWeight: item.isRead ? "500" : "700" },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {item.title}
                                </Text>
                                {!item.isRead && <View style={styles.clientUnreadDot} />}
                              </View>
                              <Text style={styles.clientNotifItemDesc} numberOfLines={2}>
                                {item.description}
                              </Text>
                              {item.timestamp !== undefined && (
                                <Text style={styles.clientNotifItemTime}>
                                  {formatClientTimeAgo(item.timestamp)}
                                </Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  </View>
                </>
              )}
            </View>

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
        <View style={[styles.noticeAlert, isMobile && { padding: 12, paddingRight: 10 }]}>
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
        <View style={[
          styles.mobileBottomNav,
          {
            height: 56 + (insets.bottom > 0 ? insets.bottom : 0),
            paddingBottom: insets.bottom > 0 ? insets.bottom : 0,
          },
        ]}>
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

          <TouchableOpacity
            onPress={() => handleTabClick("settings")}
            style={[
              styles.mobileNavItem,
              activeTab === "settings" && styles.mobileNavItemActive,
            ]}
            activeOpacity={0.7}
          >
            <Icon
              name="settings"
              size={20}
              color={activeTab === "settings" ? "#0F2C59" : "#64748B"}
            />
            <Text
              style={[
                styles.mobileNavText,
                activeTab === "settings" && styles.mobileNavTextActive,
              ]}
            >
              Settings
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
          <View style={[styles.profileCard, isMobile && { padding: 20 }]}>
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
              onPress={() => {
                setIsProfileVisible(false);
                handleTabClick("settings");
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "#F1F5F9",
                paddingVertical: 10,
                borderRadius: 8,
                marginBottom: 10,
              }}
              activeOpacity={0.7}
            >
              <Icon name="settings" size={16} color="#0F2C59" />
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: "#0F2C59" }}>
                Manage Account & Settings
              </Text>
            </TouchableOpacity>

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
    zIndex: 1000,
    elevation: 10,
    position: "relative",
    overflow: "visible",
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
    zIndex: 1001,
    position: "relative",
    overflow: "visible",
  },
  dropdownBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
    backgroundColor: "transparent",
  },
  bellBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  bellBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#0F2C59",
  },
  bellBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
  },
  clientNotifDropdown: {
    position: "absolute",
    top: 44,
    right: 0,
    width: 330,
    maxHeight: 390,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    zIndex: 99999,
    elevation: 25,
    overflow: "hidden",
    ...Platform.select({
      web: {
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  clientNotifHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#FAFAFC",
  },
  clientNotifTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "700",
    color: "#0F2C59",
  },
  clientUnreadBadge: {
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  clientUnreadBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: "700",
    color: "#2563EB",
  },
  clientMarkAllText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "600",
    color: "#2563EB",
  },
  clientNotifEmpty: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  clientNotifEmptyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#94A3B8",
  },
  clientNotifItem: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
  },
  clientNotifItemUnread: {
    backgroundColor: "#F8FAFC",
  },
  clientNotifIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  clientNotifItemTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#1E293B",
    flex: 1,
  },
  clientUnreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563EB",
  },
  clientNotifItemDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 15,
  },
  clientNotifItemTime: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    color: "#94A3B8",
    marginTop: 4,
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
