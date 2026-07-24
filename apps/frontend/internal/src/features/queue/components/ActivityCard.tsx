import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  StatusBadge,
  Icon as Lucide,
} from "@edge/ui";
import { ApplicationData } from "../data/mockApplications";

interface ActivityCardProps {
  application: ApplicationData;
  isActive: boolean;
  onPress: () => void;
  onMenuAction: (action: "process" | "pin" | "archive", id: string) => void;
}

function getAvatarInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    const first = parts[0];
    const last = parts[parts.length - 1];
    if (first !== undefined && last !== undefined) {
      return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
    }
  }
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

function getStatusStyle(status: string): { bg: string; text: string } {
  const s = status.toLowerCase();
  if (s === "completed" || s === "approved") {
    return { bg: COLORS.brand[800], text: COLORS.neutral.white };
  }
  if (s === "for approval") {
    return { bg: "#F59E0B", text: COLORS.neutral.white };
  }
  if (s === "for verification") {
    return { bg: "#06B6D4", text: COLORS.neutral.white };
  }
  if (s === "returned") {
    return { bg: "#EF4444", text: COLORS.neutral.white };
  }
  if (s === "declined") {
    return { bg: "#EF4444", text: COLORS.neutral.white };
  }
  if (s === "in process") {
    return { bg: "#8B5CF6", text: COLORS.neutral.white };
  }
  return { bg: COLORS.neutral[200], text: COLORS.neutral[700] };
}

function formatTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

export function ActivityCard({
  application,
  isActive,
  onPress,
  onMenuAction,
}: ActivityCardProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const kebabRef = useRef<View>(null);

  const initials = getAvatarInitials(application.applicant);
  const statusStyle = getStatusStyle(application.status);
  const timestamp = formatTimestamp(application.createdAt);

  const handleOpenMenu = () => {
    kebabRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const menuWidth = 180;
      const windowWidth = Dimensions.get("window").width;

      // Calculate left position to align menu's right edge with button's right edge
      let leftPos = pageX + width - menuWidth;

      // Ensure it doesn't go off-screen left
      if (leftPos < 10) leftPos = 10;

      // Ensure it doesn't go off-screen right
      if (leftPos + menuWidth > windowWidth - 10) {
        leftPos = windowWidth - menuWidth - 10;
      }

      setMenuPos({
        top: pageY + height + 5,
        left: leftPos,
      });
      setMenuVisible(true);
    });
  };

  return (
    <Pressable
      style={[
        styles.card,
        isActive && styles.cardActive,
        application.isPinned && styles.cardPinned,
      ]}
      onPress={onPress}
    >
      {/* Active left border indicator */}
      {isActive && <View style={styles.activeBar} />}

      <View style={styles.cardContent}>
        {/* Top row: Avatar + Name + Timestamp */}
        <View style={styles.topRow}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            {(application.status === "Completed" ||
              application.status === "Approved") && (
              <View style={styles.avatarCheckBadge}>
                <Lucide name="check" size={8} color={COLORS.neutral.white} />
              </View>
            )}
          </View>

          <View style={styles.nameBlock}>
            <View style={styles.nameRow}>
              <Text style={styles.applicantName} numberOfLines={1}>
                {application.applicant}
              </Text>
              <Text style={styles.timestamp}>{timestamp}</Text>
            </View>
            <Text style={styles.entityType}>{application.applicantType}</Text>
          </View>
        </View>

        {/* Middle row: Doc icon + Title + Status badge + 3-dot */}
        <View style={styles.middleRow}>
          <View style={styles.titleRow}>
            <Lucide name="file-text" size={13} color={COLORS.neutral[400]} />
            <Text style={styles.permitTitle} numberOfLines={1}>
              {application.permitTitle}
            </Text>
          </View>
          <View style={styles.rightActions}>
            <View
              style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}
            >
              <Text
                style={[styles.statusPillText, { color: statusStyle.text }]}
              >
                {application.status.toUpperCase()}
              </Text>
            </View>
            <View ref={kebabRef}>
              <Pressable
                style={styles.kebabBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  handleOpenMenu();
                }}
              >
                <Lucide
                  name="more-vertical"
                  size={16}
                  color={COLORS.neutral[500]}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Bottom row: Assignment + Type badge + badges */}
        <View style={styles.bottomRow}>
          <View style={styles.assignPill}>
            <Lucide name="user-plus" size={11} color={COLORS.neutral[500]} />
            <Text style={styles.assignText}>
              Assigned to {application.assignedTo}
            </Text>
          </View>
          <View style={styles.badgeRow}>
            {application.isBeingViewed && (
              <View style={styles.viewingBadge}>
                <Text style={styles.viewingBadgeText}>Being viewed</Text>
              </View>
            )}
            {application.isUrgent && (
              <View style={styles.urgentBadge}>
                <Lucide name="alert-circle" size={10} color="#EF4444" />
              </View>
            )}
            <View style={styles.typePill}>
              <Text style={styles.typePillText}>
                {application.applicationType}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3-dot Kebab Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={[
              styles.menuContainer,
              { top: menuPos.top, left: menuPos.left },
            ]}
          >
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onMenuAction("process", application.id);
              }}
            >
              <Lucide name="settings" size={15} color={COLORS.brand[700]} />
              <Text style={styles.menuItemTextPrimary}>Process</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onMenuAction("pin", application.id);
              }}
            >
              <Lucide name="map-pin" size={15} color={COLORS.neutral[600]} />
              <Text style={styles.menuItemText}>Pin to top</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onMenuAction("archive", application.id);
              }}
            >
              <Lucide name="archive" size={15} color={COLORS.neutral[600]} />
              <Text style={styles.menuItemText}>Archive</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    marginBottom: SPACING[8],
    overflow: "hidden",
    flexDirection: "row",
    ...SHADOWS.card,
  },
  cardActive: {
    borderColor: COLORS.brand[600],
    backgroundColor: "#EFF6FF",
  },
  cardPinned: {
    borderColor: "#F59E0B",
    borderTopWidth: 2,
  },
  activeBar: {
    width: 3,
    backgroundColor: COLORS.brand[700],
    borderTopLeftRadius: RADIUS.card,
    borderBottomLeftRadius: RADIUS.card,
  },
  cardContent: {
    flex: 1,
    padding: SPACING[12],
    gap: SPACING[8],
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING[8],
  } as unknown as object,
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.brand[900],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  avatarCheckBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.semantic.success,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.neutral.white,
  },
  nameBlock: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  applicantName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    flex: 1,
  },
  timestamp: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[400],
    marginLeft: SPACING[8],
  },
  entityType: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  middleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
    marginRight: SPACING[8],
  },
  permitTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[600],
    flex: 1,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[4],
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.circle,
  },
  statusPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.4,
  },
  kebabBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  assignPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.circle,
  },
  assignText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[600],
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[4],
  },
  viewingBadge: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.circle,
  },
  viewingBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: "#92400E",
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  urgentBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  typePill: {
    backgroundColor: COLORS.neutral[200],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.circle,
  },
  typePillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[600],
  },
  // Context menu
  menuOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  menuContainer: {
    position: "absolute",
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingVertical: SPACING[4],
    width: 180,
    ...SHADOWS.modal,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
  } as unknown as object,
  menuItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[700],
  },
  menuItemTextPrimary: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
});
