import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Icon, TYPOGRAPHY, SPACING } from "@edge/ui";
import { useAdminAnnouncements, SystemAnnouncementDto } from "@edge/api";
import { ClientAnnouncementModal } from "./ClientAnnouncementModal";

const CLIENT_DISMISSED_ANNOUNCEMENTS_KEY = "edge_client_dismissed_announcements";

function getDismissedAnnouncementIds(userId?: string): Set<string> {
  if (Platform.OS !== "web" || typeof window === "undefined" || window.localStorage === undefined || window.localStorage === null) {
    return new Set<string>();
  }
  try {
    const key = userId !== undefined && userId !== ""
      ? `${CLIENT_DISMISSED_ANNOUNCEMENTS_KEY}_${userId}`
      : CLIENT_DISMISSED_ANNOUNCEMENTS_KEY;
    const raw = window.localStorage.getItem(key);
    if (raw !== null && raw !== "") {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const validIds = parsed.filter((item): item is string => typeof item === "string");
        return new Set(validIds);
      }
    }
  } catch {
    // Graceful fallback on storage access or JSON parsing errors
  }
  return new Set<string>();
}

function saveDismissedAnnouncementIds(set: Set<string>, userId?: string): void {
  if (Platform.OS !== "web" || typeof window === "undefined" || window.localStorage === undefined || window.localStorage === null) {
    return;
  }
  try {
    const key = userId !== undefined && userId !== ""
      ? `${CLIENT_DISMISSED_ANNOUNCEMENTS_KEY}_${userId}`
      : CLIENT_DISMISSED_ANNOUNCEMENTS_KEY;
    window.localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {
    // Graceful fallback on storage quota or access errors
  }
}

interface ClientAnnouncementBannerProps {
  userId?: string;
  isMobile?: boolean;
}

const TYPE_STYLES: Record<
  string,
  {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    icon: "info" | "alert-triangle" | "alert-circle" | "tool";
    iconColor: string;
  }
> = {
  Emergency: {
    bg: "#FEF2F2",
    border: "#FCA5A5",
    text: "#991B1B",
    badgeBg: "#FEE2E2",
    badgeText: "#991B1B",
    icon: "alert-circle",
    iconColor: "#DC2626",
  },
  Critical: {
    bg: "#FEF2F2",
    border: "#FCA5A5",
    text: "#991B1B",
    badgeBg: "#FEE2E2",
    badgeText: "#991B1B",
    icon: "alert-circle",
    iconColor: "#DC2626",
  },
  Warning: {
    bg: "#FFFBEB",
    border: "#FCD34D",
    text: "#92400E",
    badgeBg: "#FEF3C7",
    badgeText: "#92400E",
    icon: "alert-triangle",
    iconColor: "#D97706",
  },
  Maintenance: {
    bg: "#F5F3FF",
    border: "#C4B5FD",
    text: "#5B21B6",
    badgeBg: "#EDE9FE",
    badgeText: "#5B21B6",
    icon: "tool",
    iconColor: "#7C3AED",
  },
  Info: {
    bg: "#EFF6FF",
    border: "#BFDBFE",
    text: "#1E40AF",
    badgeBg: "#DBEAFE",
    badgeText: "#1E40AF",
    icon: "info",
    iconColor: "#2563EB",
  },
};

export function ClientAnnouncementBanner({ userId, isMobile = false }: ClientAnnouncementBannerProps) {
  const { announcements } = useAdminAnnouncements({
    isActive: true,
    revalidateOnFocus: true,
    refreshInterval: 60000,
  });

  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => getDismissedAnnouncementIds(userId));
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [selectedModalAnnouncement, setSelectedModalAnnouncement] = useState<SystemAnnouncementDto | null>(null);

  useEffect(() => {
    setDismissedIds(getDismissedAnnouncementIds(userId));
  }, [userId]);

  // Filter announcements for active client audience and valid time range
  const activeAnnouncements = useMemo(() => {
    const list = Array.isArray(announcements) ? announcements : [];
    const now = new Date();
    return list.filter((a) => {
      if (a === null || a === undefined) return false;
      if (!a.isActive) return false;
      if (dismissedIds.has(a.id)) return false;

      // Target audience filter
      const aud = (a.targetAudience ?? "").toLowerCase();
      const isForClients =
        aud.length === 0 ||
        aud.includes("all") ||
        aud.includes("client") ||
        aud.includes("applicant") ||
        aud.includes("public");

      if (!isForClients) return false;

      // Date range validation
      if (a.startDate !== null && a.startDate !== undefined && a.startDate.length > 0) {
        const start = new Date(a.startDate);
        if (!isNaN(start.getTime()) && now < start) return false;
      }
      if (a.endDate !== null && a.endDate !== undefined && a.endDate.length > 0) {
        const end = new Date(a.endDate);
        if (!isNaN(end.getTime()) && now > end) return false;
      }

      return true;
    });
  }, [announcements, dismissedIds]);

  const count = activeAnnouncements.length;
  const currentAnnouncement = count > 0 ? activeAnnouncements[Math.max(0, Math.min(activeIdx, count - 1))] : null;

  const handleDismiss = (id: string) => {
    const next = new Set(dismissedIds);
    next.add(id);
    setDismissedIds(next);
    saveDismissedAnnouncementIds(next, userId);
  };

  if (currentAnnouncement === null || currentAnnouncement === undefined) {
    return null;
  }

  const styleCfg = TYPE_STYLES[currentAnnouncement.type] ?? TYPE_STYLES.Info;

  return (
    <>
      <View
        accessibilityRole="alert"
        accessible={true}
        accessibilityLabel={`System Announcement: ${currentAnnouncement.title ?? ""}`}
        style={[
          styles.bannerContainer,
          { backgroundColor: styleCfg.bg, borderColor: styleCfg.border },
          isMobile && { paddingHorizontal: 12, paddingVertical: 10 },
        ]}
      >
        <View style={styles.bannerInner}>
          {/* Left Icon & Content Preview */}
          <View style={styles.contentRow}>
            <Icon name={styleCfg.icon} size={18} color={styleCfg.iconColor} style={{ marginTop: 2, marginRight: 10 }} />

            <View style={styles.textColumn}>
              <View style={styles.titleRow}>
                <View style={[styles.badge, { backgroundColor: styleCfg.badgeBg, borderColor: styleCfg.border }]}>
                  <Text style={[styles.badgeText, { color: styleCfg.badgeText }]}>
                    {currentAnnouncement.type.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.title, { color: styleCfg.text }]} numberOfLines={1}>
                  {currentAnnouncement.title}
                </Text>
              </View>

              <Text style={[styles.message, { color: styleCfg.text }]} numberOfLines={2}>
                {currentAnnouncement.message}
              </Text>
            </View>
          </View>

          {/* Right Actions: Paging, View Details, Dismiss */}
          <View style={styles.actionsRow}>
            {count > 1 && (
              <View style={styles.pagingContainer}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Previous announcement"
                  onPress={() => setActiveIdx((prev) => (prev > 0 ? prev - 1 : count - 1))}
                  style={styles.pagingBtn}
                  activeOpacity={0.7}
                >
                  <Icon name="chevron-left" size={14} color={styleCfg.text} />
                </TouchableOpacity>
                <Text style={[styles.pagingText, { color: styleCfg.text }]}>
                  {activeIdx + 1}/{count}
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Next announcement"
                  onPress={() => setActiveIdx((prev) => (prev < count - 1 ? prev + 1 : 0))}
                  style={styles.pagingBtn}
                  activeOpacity={0.7}
                >
                  <Icon name="chevron-right" size={14} color={styleCfg.text} />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="View announcement details"
              style={[styles.detailsBtn, { borderColor: styleCfg.border, backgroundColor: styleCfg.badgeBg }]}
              onPress={() => setSelectedModalAnnouncement(currentAnnouncement)}
              activeOpacity={0.8}
            >
              <Text style={[styles.detailsBtnText, { color: styleCfg.text }]}>View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Dismiss announcement"
              style={styles.dismissBtn}
              onPress={() => handleDismiss(currentAnnouncement.id)}
              activeOpacity={0.7}
            >
              <Icon name="x" size={16} color={styleCfg.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Details Modal */}
      <ClientAnnouncementModal
        visible={selectedModalAnnouncement !== null}
        announcement={selectedModalAnnouncement}
        onClose={() => setSelectedModalAnnouncement(null)}
        onAcknowledge={(id) => handleDismiss(id)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    width: "100%",
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[10],
    borderBottomWidth: 1,
    borderTopWidth: 1,
  },
  bannerInner: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING[12],
    flexWrap: "wrap",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    minWidth: 260,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  message: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: TYPOGRAPHY.fonts.primary,
    opacity: 0.9,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pagingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  pagingBtn: {
    padding: 2,
  },
  pagingText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  detailsBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  detailsBtnText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  dismissBtn: {
    padding: 4,
    borderRadius: 4,
  },
});
