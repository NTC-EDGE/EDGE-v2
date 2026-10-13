import React, { useState, useRef, useMemo, useCallback } from "react";
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
import { ApplicationData } from "../../../types/application";
import { useAuthContext } from "../../auth/context/AuthContext";
import {
  resolveUserIdentifiers,
  computeOfficerEvaluationState,
  getApprovingEvaluator,
} from "../utils/officerEvaluationHelper";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ActivityCardProps {
  application: ApplicationData;
  isActive: boolean;
  onPress: () => void;
  onMenuAction: (action: "evaluate" | "release_evaluation" | "pin" | "archive", id: string) => void;
  currentUserName?: string;
  isAdmin?: boolean;
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

function isSubjectForPayment(app: ApplicationData): boolean {
  return (
    app.totalAmountDue > 0 &&
    (!app.payment?.orNumber || app.payment.orNumber.trim().length === 0) &&
    app.status !== 'Completed' &&
    app.status !== 'Draft'
  );
}

function formatStatusDisplay(application: ApplicationData): string {
  if (isSubjectForPayment(application)) return "FOR PAYMENT";
  const s = application.status.toLowerCase();
  if (s === "submitted") return "FOR EVALUATION";
  if (s === "evaluating") return "EVALUATING";
  if (s === "foraccountant") return "FOR SOA";
  if (s === "pendingpayment") return "FOR PAYMENT";
  if (s === "forissuance") return "FOR ISSUANCE";
  return application.status.toUpperCase();
}

function getStatusStyle(application: ApplicationData): { bg: string; text: string } {
  if (isSubjectForPayment(application)) return { bg: '#16A34A', text: COLORS.neutral.white };
  const s = application.status.toLowerCase();
  if (s === "completed" || s === "approved") return { bg: COLORS.brand[800],    text: COLORS.neutral.white };
  if (s === "evaluating")                   return { bg: COLORS.semantic.warning, text: COLORS.neutral.white };
  if (s === "submitted")                    return { bg: COLORS.semantic.info,    text: COLORS.neutral.white };
  if (s === "returned")                     return { bg: COLORS.semantic.error,   text: COLORS.neutral.white };
  if (s === "foraccountant")                return { bg: '#0284C7',               text: COLORS.neutral.white };
  if (s === "pendingpayment")               return { bg: '#16A34A',               text: COLORS.neutral.white };
  if (s === "forissuance")                  return { bg: '#059669',               text: COLORS.neutral.white };
  if (s === "draft")                        return { bg: COLORS.neutral[400],     text: COLORS.neutral.white };
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
  currentUserName,
  isAdmin,
}: ActivityCardProps) {
  const { colors, isDark } = useTheme();
  const { user, clerkUser } = useAuthContext();
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

  const brandBg        = isDark ? colors.neutral[700] : '#EFF6FF';

  const currentUserIdentifiers = useMemo(
    () => resolveUserIdentifiers(user, clerkUser, currentUserName),
    [user, clerkUser, currentUserName]
  );

  const {
    isEvaluating,
    evaluatingOfficer,
    isEndorsedAwayFromMe,
    isEvaluatedByMe,
    isEvaluatedByOther,
  } = useMemo(
    () =>
      computeOfficerEvaluationState({
        application,
        identifiers: currentUserIdentifiers,
        isAdmin,
      }),
    [application, currentUserIdentifiers, isAdmin]
  );

  const approvingEvaluator = useMemo(
    () => getApprovingEvaluator(application),
    [application]
  );

  const displayFilingName =
    application.filingUser?.accountType === "Company"
      ? (application.filingUser.company?.name || application.companyDetails?.name || application.filingUser.name || application.applicant)
      : (application.filingUser?.name || application.applicant);

  const displayAccountType =
    application.filingUser?.accountType || application.applicantType;

  const isBulk =
    application.applicationType === "BULK" ||
    (application.applicantsList !== undefined && application.applicantsList.length > 1);

  const totalApplicants = isBulk
    ? (application.applicantsList && application.applicantsList.length > 0 ? application.applicantsList.length : 1)
    : 1;

  const initials    = getAvatarInitials(displayFilingName);
  const statusStyle = getStatusStyle(application);
  const timestamp   = formatTimestamp(application.createdAt);

  const handleOpenMenu = () => {
    kebabRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const menuWidth  = 200;
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
        {/* Top row: Avatar + Name + Application Number Tag + Timestamp */}
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
                {displayFilingName}
              </Text>
              <Text style={[styles.timestamp, { color: textMuted }]}>{timestamp}</Text>
            </View>
            <View style={styles.subHeaderRow}>
              <View
                style={[
                  styles.modePill,
                  isBulk
                    ? {
                        backgroundColor: isDark ? 'rgba(180, 83, 9, 0.2)' : '#FEF3C7',
                        borderColor: isDark ? '#B45309' : '#FDE68A',
                      }
                    : {
                        backgroundColor: isDark ? 'rgba(29, 78, 216, 0.2)' : '#EFF6FF',
                        borderColor: isDark ? '#1D4ED8' : '#DBEAFE',
                      },
                ]}
              >
                <Lucide
                  name={isBulk ? "users" : "user"}
                  size={10}
                  color={isBulk ? (isDark ? '#FBBF24' : '#D97706') : (isDark ? '#60A5FA' : '#1D4ED8')}
                />
                <Text
                  style={[
                    styles.modePillText,
                    {
                      color: isBulk ? (isDark ? '#FBBF24' : '#D97706') : (isDark ? '#60A5FA' : '#1D4ED8'),
                    },
                  ]}
                  numberOfLines={1}
                >
                  {isBulk ? `BULK (${totalApplicants})` : 'SINGLE'}
                </Text>
              </View>

              {(application.isAssessmentOnly || application.intent === 'AssessmentOnly') && (
                <>
                  <Text style={[styles.dotSeparator, { color: textMuted }]}>•</Text>
                  <View
                    style={[
                      styles.modePill,
                      {
                        backgroundColor: isDark ? 'rgba(147, 51, 234, 0.2)' : '#FAF5FF',
                        borderColor: isDark ? '#9333EA' : '#E9D5FF',
                      },
                    ]}
                  >
                    <Lucide
                      name="file-text"
                      size={10}
                      color={isDark ? '#C084FC' : '#7E22CE'}
                    />
                    <Text
                      style={[
                        styles.modePillText,
                        {
                          color: isDark ? '#C084FC' : '#7E22CE',
                        },
                      ]}
                      numberOfLines={1}
                    >
                      ASSESSMENT
                    </Text>
                  </View>
                </>
              )}

              <Text style={[styles.dotSeparator, { color: textMuted }]}>•</Text>
              <Text style={[styles.entityType, { color: textMuted }]} numberOfLines={1}>{displayAccountType}</Text>
              <Text style={[styles.dotSeparator, { color: textMuted }]}>•</Text>
              <View style={[styles.appNumBadge, { backgroundColor: brandBg }]}>
                <Lucide name="hash" size={10} color={brandColor} />
                <Text style={[styles.appNumText, { color: brandColor }]} numberOfLines={1}>
                  {application.referenceNumber}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Middle row: Title + Status + Menu */}
        <View style={styles.middleRow}>
          <View style={styles.titleRow}>
            <Lucide name="file-text" size={12} color={textMuted} />
            <Text style={[styles.permitTitle, { color: textSub }]} numberOfLines={1} ellipsizeMode="tail">
              {application.permitTitle}
            </Text>
          </View>
          <View style={styles.rightActions}>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: statusStyle.bg },
                isEvaluating && isEvaluatedByOther && { backgroundColor: isDark ? '#78350F' : '#D97706' },
              ]}
              accessibilityLabel={`Status: ${formatStatusDisplay(application)}`}
              {...Platform.select({
                web: {
                  title: isEvaluating && evaluatingOfficer
                    ? `Evaluating Officer: ${evaluatingOfficer}${isEvaluatedByOther ? ' (Under evaluation by another officer)' : ''}`
                    : `Status: ${formatStatusDisplay(application)}`,
                } as object,
              })}
            >
              <Text style={[styles.statusPillText, { color: statusStyle.text }]} numberOfLines={1}>
                {formatStatusDisplay(application)}
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

        {/* Bottom row: Assignment + Evaluator Indicator + Type badges */}
        <View style={styles.bottomRow}>
          <View style={[styles.assignPill, { backgroundColor: pillBg }]}>
            <Lucide
              name={application.endorsedTo ? "share-2" : isEvaluating ? (isEvaluatedByOther ? "lock" : "user-check") : "user-plus"}
              size={10}
              color={application.endorsedTo ? (isDark ? '#818CF8' : '#4F46E5') : isEvaluating ? (isDark ? colors.brand[400] : colors.brand[700]) : textMuted}
            />
            <Text
              style={[
                styles.assignText,
                { color: application.endorsedTo ? (isDark ? '#C7D2FE' : '#4338CA') : isEvaluating ? (isDark ? colors.brand[300] : colors.brand[900]) : textSub },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {application.endorsedTo
                ? `Endorsed to: ${application.endorsedTo}`
                : isEvaluating && evaluatingOfficer
                  ? `Evaluating: ${evaluatingOfficer}`
                  : (application.office || application.assignedTo || 'Unassigned')}
            </Text>
          </View>
          {approvingEvaluator && application.status !== 'Evaluating' && application.status !== 'Submitted' && (
            <View
              style={[
                styles.evaluatorBadge,
                {
                  backgroundColor: isDark ? 'rgba(5, 150, 105, 0.15)' : '#ECFDF5',
                  borderColor: isDark ? '#059669' : '#A7F3D0',
                },
              ]}
            >
              <Lucide name="user-check" size={10} color={isDark ? '#34D399' : '#059669'} />
              <Text
                style={[
                  styles.evaluatorBadgeText,
                  { color: isDark ? '#34D399' : '#065F46' },
                ]}
                numberOfLines={1}
              >
                Evaluated by: {approvingEvaluator}
              </Text>
            </View>
          )}
          <View style={styles.badgeRow}>
            {application.isBeingViewed && (
              <View style={[styles.viewingBadge, { backgroundColor: COLORS.semantic.warningBg, borderColor: COLORS.semantic.warningBorder }]}>
                <Text style={[styles.viewingBadgeText, { color: COLORS.semantic.warningText }]} numberOfLines={1}>Viewing</Text>
              </View>
            )}
            {application.isUrgent && (
              <View style={[styles.urgentBadge, { backgroundColor: COLORS.semantic.errorBg }]}>
                <Lucide name="alert-circle" size={10} color={COLORS.semantic.error} />
              </View>
            )}
            {application.isPinned && (
              <View style={[styles.pinnedBadge, { backgroundColor: brandBg }]}>
                <Lucide name="map-pin" size={10} color={brandColor} />
              </View>
            )}
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
            {/* If Endorsed to someone else: show read-only status in history */}
            {isEndorsedAwayFromMe && (
              <View style={[styles.menuItem, { opacity: 0.8 }]}>
                <Lucide name="share-2" size={14} color={brandColor} />
                <Text style={[styles.menuItemText, { color: textMuted, fontStyle: 'italic' }]}>
                  Endorsed to {application.endorsedTo}
                </Text>
              </View>
            )}

            {/* If Submitted (and not endorsed away): Start Evaluation */}
            {!isEndorsedAwayFromMe && application.status.toLowerCase() === "submitted" && (
              <Pressable
                style={styles.menuItem}
                onPress={() => { setMenuVisible(false); onMenuAction("evaluate", application.id); }}
              >
                <Lucide name="play-circle" size={14} color={brandColor} />
                <Text style={[styles.menuItemText, { color: brandColor, fontWeight: TYPOGRAPHY.weights.semibold }]}>
                  Start Evaluation
                </Text>
              </Pressable>
            )}

            {/* If Evaluating by me or Admin: Release back to For Evaluation */}
            {!isEndorsedAwayFromMe && isEvaluating && (isEvaluatedByMe || isAdmin) && (
              <Pressable
                style={styles.menuItem}
                onPress={() => { setMenuVisible(false); onMenuAction("release_evaluation", application.id); }}
              >
                <Lucide name="rotate-ccw" size={14} color={isDark ? colors.semantic.warning : '#D97706'} />
                <Text style={[styles.menuItemText, { color: isDark ? colors.semantic.warning : '#D97706', fontWeight: TYPOGRAPHY.weights.medium }]}>
                  Release (For Evaluation)
                </Text>
              </Pressable>
            )}

            {/* If Evaluating by another officer: show locked indicator */}
            {!isEndorsedAwayFromMe && isEvaluating && isEvaluatedByOther && (
              <View style={[styles.menuItem, { opacity: 0.7 }]}>
                <Lucide name="lock" size={14} color={textMuted} />
                <Text style={[styles.menuItemText, { color: textMuted, fontStyle: 'italic' }]}>
                  Evaluating: {evaluatingOfficer}
                </Text>
              </View>
            )}

            {/* Pin / Unpin */}
            <Pressable
              style={styles.menuItem}
              onPress={() => { setMenuVisible(false); onMenuAction("pin", application.id); }}
            >
              <Lucide name="map-pin" size={14} color={textSub} />
              <Text style={[styles.menuItemText, { color: text }]}>
                {application.isPinned ? "Unpin" : "Pin to top"}
              </Text>
            </Pressable>

            {/* Archive / Unarchive */}
            <Pressable
              style={styles.menuItem}
              onPress={() => { setMenuVisible(false); onMenuAction("archive", application.id); }}
            >
              <Lucide name="archive" size={14} color={textSub} />
              <Text style={[styles.menuItemText, { color: text }]}>
                {application.isArchived ? "Unarchive" : "Archive"}
              </Text>
            </Pressable>
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
    minWidth: 0,
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
    minWidth: 0,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SPACING[6],
  },
  applicantName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
    flex: 1,
    minWidth: 0,
  },
  timestamp: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    flexShrink: 0,
  },
  entityType: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  subHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  dotSeparator: {
    fontSize: 10,
  },
  appNumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
    flexShrink: 0,
  },
  appNumText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  middleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING[6],
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  permitTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    flex: 1,
    minWidth: 0,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[4],
    flexShrink: 0,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    flexShrink: 0,
    ...Platform.select({
      web: {
        whiteSpace: "nowrap",
      } as object,
    }),
  },
  statusPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
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
    gap: SPACING[6],
    flexWrap: "wrap",
  },
  assignPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    flexShrink: 1,
    minWidth: 0,
  },
  assignText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    flexShrink: 1,
  },
  evaluatorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    maxWidth: 220,
    flexShrink: 1,
  },
  evaluatorBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[4],
    flexWrap: "wrap",
    flexShrink: 0,
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
  pinnedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  modePillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.3,
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
