import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { Icon, COLORS, TYPOGRAPHY, SPACING } from "@edge/ui";
import { SystemAnnouncementDto } from "@edge/api";

export interface ClientAnnouncementModalProps {
  visible: boolean;
  announcement: SystemAnnouncementDto | null;
  onClose: () => void;
  onAcknowledge?: (id: string) => void;
}

const TYPE_CONFIG: Record<
  string,
  {
    icon: "info" | "alert-triangle" | "alert-circle" | "tool";
    label: string;
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
  }
> = {
  Emergency: {
    icon: "alert-circle",
    label: "EMERGENCY ADVISORY",
    bg: "#FEF2F2",
    border: "#FCA5A5",
    text: "#991B1B",
    badgeBg: "#FEE2E2",
  },
  Critical: {
    icon: "alert-circle",
    label: "URGENT COMPLIANCE NOTICE",
    bg: "#FEF2F2",
    border: "#FCA5A5",
    text: "#991B1B",
    badgeBg: "#FEE2E2",
  },
  Warning: {
    icon: "alert-triangle",
    label: "REGULATORY ADVISORY",
    bg: "#FFFBEB",
    border: "#FCD34D",
    text: "#92400E",
    badgeBg: "#FEF3C7",
  },
  Maintenance: {
    icon: "tool",
    label: "SYSTEM MAINTENANCE",
    bg: "#F5F3FF",
    border: "#C4B5FD",
    text: "#5B21B6",
    badgeBg: "#EDE9FE",
  },
  Info: {
    icon: "info",
    label: "OFFICIAL PUBLIC NOTICE",
    bg: "#EFF6FF",
    border: "#93C5FD",
    text: "#1E40AF",
    badgeBg: "#DBEAFE",
  },
};

function formatDate(isoStr?: string | null): string {
  if (isoStr === null || isoStr === undefined || isoStr.trim().length === 0) return "—";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoStr;
  }
}

export function ClientAnnouncementModal({
  visible,
  announcement,
  onClose,
  onAcknowledge,
}: ClientAnnouncementModalProps) {
  if (announcement === null) return null;

  const cfg = TYPE_CONFIG[announcement.type] ?? TYPE_CONFIG.Info;

  const hasDateRange =
    (announcement.startDate !== null && announcement.startDate !== undefined && announcement.startDate.length > 0) ||
    (announcement.endDate !== null && announcement.endDate !== undefined && announcement.endDate.length > 0);

  const handleAcknowledge = () => {
    if (onAcknowledge !== undefined) {
      onAcknowledge(announcement.id);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.cardContainer} accessibilityRole="alert" aria-modal={true}>
          {/* Top Header Banner with Type */}
          <View style={[styles.headerBanner, { backgroundColor: cfg.bg, borderBottomColor: cfg.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconCircle, { backgroundColor: cfg.badgeBg }]}>
                <Icon name={cfg.icon} size={20} color={cfg.text} />
              </View>
              <View>
                <View style={[styles.typeBadge, { backgroundColor: cfg.badgeBg, borderColor: cfg.border }]}>
                  <Text style={[styles.typeBadgeText, { color: cfg.text }]}>{cfg.label}</Text>
                </View>
                <Text style={styles.postedDate}>
                  Published: {formatDate(announcement.createdAt)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Close announcement dialog"
            >
              <Icon name="x" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Modal Content Scroll Area */}
          <ScrollView contentContainerStyle={styles.contentBody} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text style={styles.titleText}>{announcement.title}</Text>

            {/* Scope / Metadata Badges */}
            <View style={styles.metaRow}>
              {hasDateRange && (
                <View style={styles.metaChip}>
                  <Icon name="calendar" size={13} color="#64748B" />
                  <Text style={styles.metaChipText}>
                    {announcement.startDate ? formatDate(announcement.startDate) : "Effective immediately"}
                    {announcement.endDate ? ` – ${formatDate(announcement.endDate)}` : ""}
                  </Text>
                </View>
              )}

              {announcement.targetAudience && (
                <View style={styles.metaChip}>
                  <Icon name="users" size={13} color="#64748B" />
                  <Text style={styles.metaChipText}>Audience: {announcement.targetAudience}</Text>
                </View>
              )}
            </View>

            {/* Message Body */}
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{announcement.message}</Text>
            </View>

            {/* Official Authority Footnote */}
            <View style={styles.authorityFootnote}>
              <Icon name="shield" size={14} color="#0284C7" />
              <Text style={styles.authorityFootnoteText}>
                National Telecommunications Commission · Official Citizen & Licensee Advisory
              </Text>
            </View>
          </ScrollView>

          {/* Modal Footer Actions */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.acknowledgeButton}
              onPress={handleAcknowledge}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Acknowledge and close announcement dialog"
            >
              <Text style={styles.acknowledgeButtonText}>Acknowledge & Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING[16],
  },
  cardContainer: {
    width: "100%",
    maxWidth: 580,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  headerBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[12],
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  postedDate: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  contentBody: {
    padding: SPACING[20],
    gap: SPACING[16],
  },
  titleText: {
    fontSize: 18,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
    flexWrap: "wrap",
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaChipText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  messageBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: SPACING[16],
  },
  messageText: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 20,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  authorityFootnote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  authorityFootnoteText: {
    fontSize: 11,
    color: "#0369A1",
    fontWeight: TYPOGRAPHY.weights.medium,
    flex: 1,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  acknowledgeButton: {
    backgroundColor: "#0284C7",
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[10],
    borderRadius: 8,
  },
  acknowledgeButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
