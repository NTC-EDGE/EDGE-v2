import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
  useTheme,
} from "@edge/ui";
import { ApplicationData } from "../data/mockApplications";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ActivityCardProps {
  application: ApplicationData;
  isActive: boolean;
  onPress: () => void;
  onMenuAction: (action: "process" | "pin" | "archive", id: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  if (s === "completed" || s === "approved")  return { bg: COLORS.brand[800],          text: COLORS.neutral.white };
  if (s === "for approval")                   return { bg: COLORS.semantic.warning,     text: COLORS.neutral.white };
  if (s === "for verification")               return { bg: COLORS.semantic.info,        text: COLORS.neutral.white };
  if (s === "returned" || s === "declined")   return { bg: COLORS.semantic.error,       text: COLORS.neutral.white };
  if (s === "in process")                     return { bg: COLORS.brand.purple,         text: COLORS.neutral.white };
  return { bg: COLORS.neutral[200], text: COLORS.neutral[700] };
}

function formatTimestamp(isoDate: string): string {
  const diffDays = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ActivityCard({
  application,
  isActive,
  onPress,
  onMenuAction,
}: ActivityCardProps) {
  const { colors, isDark } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos,     setMenuPos]     = useState({ top: 0, left: 0 });
  const kebabRef = useRef<View>(null);

  // ── Derived theme colors ─────────────────────────────────────────────────
  const cardBg         = isDark ? colors.neutral[800] : COLORS.neutral.white;
  const cardActiveBg   = isDark ? colors.brand[900] ?? colors.neutral[800] : '#EFF6FF';
  const cardBorder     = isDark ? colors.neutral[700] : colors.neutral[200];
  const cardActiveBorder = isDark ? colors.brand[600] : colors.brand[600];
  const text           = isDark ? colors.neutral[100] : colors.neutral[900];
  const textSub        = isDark ? colors.neutral[400] : colors.neutral[600];
  const textMuted      = isDark ? colors.neutral[500] : colors.neutral[500];
  const brandColor     = isDark ? colors.brand[500]   : colors.brand[700];
  const pillBg         = isDark ? colors.neutral[700] : colors.neutral[100];
  const menuBg         = isDark ? colors.neutral[800] : COLORS.neutral.white;
  const menuBorder     = isDark ? colors.neutral[700] : colors.neutral[200];

  const initials    = getAvatarInitials(application.applicant);
  const statusStyle = getStatusStyle(application.status);
  const timestamp   = formatTimestamp(application.createdAt);

  const handleOpenMenu = () => {
    kebabRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const menuWidth  = 180;
      const windowWidth = Dimensions.get("window").width;
      let leftPos = pageX + width - menuWidth;
      if (leftPos < 10) leftPos = 10;
      if (leftPos + menuWidth > windowWidth - 10) leftPos = windowWidth - menuWidth - 10;
      setMenuPos({ top: pageY + height + 4, left: leftPos });
      setMenuVisible(true);
    });
  };

  return (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: isActive ? cardActiveBg : cardBg, borderColor: isActive ? cardActiveBorder : cardBorder },
        application.isPinned && { borderTopColor: COLORS.semantic.warning, borderTopWidth: 2 },
      ]}
      onPress={onPress}
    >
      {/* Left active indicator bar */}
      {isActive && <View style={[styles.activeBar, { backgroundColor: brandColor }]} />}

      <View style={styles.cardContent}>
        {/* Top row: Avatar + Name + Timestamp */}
        <View style={styles.topRow}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.brand[900] }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            {(application.status === "Completed" || application.status === "Approved") && (
              <View style={[styles.avatarCheckBadge, { backgroundColor: COLORS.semantic.success }]}>
                <Lucide name="check" size={7} color={COLORS.neutral.white} />
              </View>
            )}
          </View>

          <View style={styles.nameBlock}>
            <View style={styles.nameRow}>
              <Text style={[styles.applicantName, { color: text }]} numberOfLines={1}>
                {application.applicant}
              </Text>
              <Text style={[styles.timestamp, { color: textMuted }]}>{timestamp}</Text>
            </View>
            <Text style={[styles.entityType, { color: textMuted }]}>{application.applicantType}</Text>
          </View>
        </View>

        {/* Middle row: Title + Status + Menu */}
        <View style={styles.middleRow}>
          <View style={styles.titleRow}>
            <Lucide name="file-text" size={12} color={textMuted} />
            <Text style={[styles.permitTitle, { color: textSub }]} numberOfLines={1}>
              {application.permitTitle}
            </Text>
          </View>
          <View style={styles.rightActions}>
            <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusPillText, { color: statusStyle.text }]}>
                {application.status.toUpperCase()}
              </Text>
            </View>
            <View ref={kebabRef}>
              <Pressable
                style={styles.kebabBtn}
                onPress={(e) => { e.stopPropagation?.(); handleOpenMenu(); }}
              >
                <Lucide name="more-vertical" size={14} color={textMuted} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Bottom row: Assignment + Type badges */}
        <View style={styles.bottomRow}>
          <View style={[styles.assignPill, { backgroundColor: pillBg }]}>
            <Lucide name="user-plus" size={10} color={textMuted} />
            <Text style={[styles.assignText, { color: textSub }]}>
              {application.assignedTo}
            </Text>
          </View>
          <View style={styles.badgeRow}>
            {application.isBeingViewed && (
              <View style={[styles.viewingBadge, { backgroundColor: COLORS.semantic.warningBg, borderColor: COLORS.semantic.warningBorder }]}>
                <Text style={[styles.viewingBadgeText, { color: COLORS.semantic.warningText }]}>Viewing</Text>
              </View>
            )}
            {application.isUrgent && (
              <View style={[styles.urgentBadge, { backgroundColor: COLORS.semantic.errorBg }]}>
                <Lucide name="alert-circle" size={10} color={COLORS.semantic.error} />
              </View>
            )}
            <View style={[styles.typePill, { backgroundColor: pillBg }]}>
              <Text style={[styles.typePillText, { color: textSub }]}>
                {application.applicationType}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Kebab context menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View
            style={[
              styles.menuContainer,
              { top: menuPos.top, left: menuPos.left, backgroundColor: menuBg, borderColor: menuBorder },
            ]}
          >
            {[
              { action: "process" as const, icon: "settings"  as const, label: "Process",    isPrimary: true  },
              { action: "pin"     as const, icon: "map-pin"   as const, label: "Pin to top", isPrimary: false },
              { action: "archive" as const, icon: "archive"   as const, label: "Archive",    isPrimary: false },
            ].map(({ action, icon, label, isPrimary }) => (
              <Pressable
                key={action}
                style={styles.menuItem}
                onPress={() => { setMenuVisible(false); onMenuAction(action, application.id); }}
              >
                <Lucide name={icon} size={14} color={isPrimary ? brandColor : textSub} />
                <Text style={[styles.menuItemText, { color: isPrimary ? brandColor : text, fontWeight: isPrimary ? TYPOGRAPHY.weights.semibold : TYPOGRAPHY.weights.regular }]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </Pressable>
  );
}

// ─── Static styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    marginBottom: SPACING[6],
    overflow: "hidden",
    flexDirection: "row",
    ...SHADOWS.card,
    ...Platform.select({ web: { cursor: "pointer", transition: "background-color 100ms ease" } }),
  },
  activeBar: {
    width: 3,
    borderTopLeftRadius: RADIUS.card,
    borderBottomLeftRadius: RADIUS.card,
  },
  cardContent: {
    flex: 1,
    padding: SPACING[10],
    gap: SPACING[6],
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING[8],
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  avatarCheckBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 13,
    height: 13,
    borderRadius: 7,
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
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
    flex: 1,
  },
  timestamp: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    marginLeft: SPACING[6],
  },
  entityType: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    marginTop: 1,
  },
  middleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    marginRight: SPACING[6],
  },
  permitTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    flex: 1,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[4],
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  statusPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.4,
  },
  kebabBtn: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  assignPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  assignText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[4],
  },
  viewingBadge: {
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
  },
  viewingBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  urgentBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  typePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  typePillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  menuContainer: {
    position: "absolute",
    borderRadius: RADIUS.card,
    borderWidth: 1,
    paddingVertical: SPACING[4],
    width: 170,
    ...SHADOWS.modal,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  menuItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
  },
});
