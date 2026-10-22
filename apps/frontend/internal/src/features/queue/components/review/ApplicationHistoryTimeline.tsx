import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, COLORS, SPACING, RADIUS, TYPOGRAPHY, Icon as Lucide } from "@edge/ui";
import { AuditTrailEntry } from "../../../../types/application";
import { SectionHeader } from "./reviewComponents";

interface ApplicationHistoryTimelineProps {
  history?: AuditTrailEntry[];
  title?: string;
}

function getEventTheme(action: string, role?: string, status?: string) {
  const text = `${action} ${role ?? ''} ${status ?? ''}`.toLowerCase();

  if (text.includes("approve") || text.includes("completed") || text.includes("issued")) {
    return {
      nodeBg: "#DCFCE7",
      nodeBorder: "#16A34A",
      iconName: "check-circle" as const,
      iconColor: "#16A34A",
      badgeBg: "#DCFCE7",
      badgeText: "#15803D",
      badgeBorder: "#BBF7D0",
      defaultRole: "Approving Officer",
    };
  }

  if (text.includes("return") || text.includes("decline") || text.includes("discrepancy") || text.includes("reject")) {
    return {
      nodeBg: "#FEE2E2",
      nodeBorder: "#DC2626",
      iconName: "rotate-ccw" as const,
      iconColor: "#DC2626",
      badgeBg: "#FEF2F2",
      badgeText: "#B91C1C",
      badgeBorder: "#FECACA",
      defaultRole: "Return Officer",
    };
  }

  if (text.includes("submit") || text.includes("initial") || text.includes("filed")) {
    return {
      nodeBg: "#EFF6FF",
      nodeBorder: "#2563EB",
      iconName: "file-text" as const,
      iconColor: "#2563EB",
      badgeBg: "#EFF6FF",
      badgeText: "#1D4ED8",
      badgeBorder: "#BFDBFE",
      defaultRole: "Filing Submitter",
    };
  }

  if (
    (text.includes("soa") && (text.includes("generat") || text.includes("creat") || text.includes("prepared"))) ||
    text.includes("statement of account")
  ) {
    return {
      nodeBg: "#EFF6FF",
      nodeBorder: "#2563EB",
      iconName: "file-text" as const,
      iconColor: "#2563EB",
      badgeBg: "#EFF6FF",
      badgeText: "#1D4ED8",
      badgeBorder: "#BFDBFE",
      defaultRole: "Evaluating Officer",
    };
  }

  if (text.includes("accountant") || text.includes("soa") || text.includes("payment") || text.includes("cashier") || text.includes("receipt")) {
    return {
      nodeBg: "#F3E8FF",
      nodeBorder: "#9333EA",
      iconName: "credit-card" as const,
      iconColor: "#9333EA",
      badgeBg: "#FAF5FF",
      badgeText: "#7E22CE",
      badgeBorder: "#E9D5FF",
      defaultRole: "Accountant / Cashier",
    };
  }

  return {
    nodeBg: "#F1F5F9",
    nodeBorder: "#64748B",
    iconName: "clock" as const,
    iconColor: "#475569",
    badgeBg: "#F8FAFC",
    badgeText: "#475569",
    badgeBorder: "#E2E8F0",
    defaultRole: "Processing Officer",
  };
}

export function ApplicationHistoryTimeline({ history, title }: ApplicationHistoryTimelineProps) {
  const { colors, isDark } = useTheme();

  const historyEntries = Array.isArray(history) ? history : [];
  const headerTitle = title ?? `APPLICATION PROCESSING & AUDIT HISTORY (${historyEntries.length})`;

  return (
    <View style={{ marginTop: SPACING[16], paddingHorizontal: SPACING[16] }}>
      <SectionHeader title={headerTitle} />

      {historyEntries.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
              borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
            },
          ]}
        >
          <Lucide name="clock" size={24} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
          <Text style={[styles.emptyText, { color: isDark ? colors.neutral[400] : colors.neutral[600] }]}>
            No processing history events recorded yet.
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.timelineCard,
            {
              backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
              borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
            },
          ]}
        >
          {historyEntries.map((entry, idx) => {
            const isLast = idx === historyEntries.length - 1;
            const theme = getEventTheme(entry.action, entry.role, entry.status);
            const roleLabel = entry.role ?? theme.defaultRole;

            return (
              <View key={entry.id || `hist-${idx}`} style={styles.timelineRow}>
                {/* Left Indicator Column */}
                <View style={styles.leftCol}>
                  <View
                    style={[
                      styles.nodeCircle,
                      {
                        backgroundColor: theme.nodeBg,
                        borderColor: theme.nodeBorder,
                      },
                    ]}
                  >
                    <Lucide name={theme.iconName} size={14} color={theme.iconColor} />
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.verticalLine,
                        { backgroundColor: isDark ? colors.neutral[800] : "#E2E8F0" },
                      ]}
                    />
                  )}
                </View>

                {/* Right Content Column */}
                <View style={[styles.rightCol, !isLast && styles.rightColSpaced]}>
                  {/* Event Title & Role Badge */}
                  <View style={styles.headerRow}>
                    <Text
                      style={[
                        styles.actionTitle,
                        { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                      ]}
                    >
                      {entry.action}
                    </Text>

                    <View
                      style={[
                        styles.roleBadge,
                        {
                          backgroundColor: theme.badgeBg,
                          borderColor: theme.badgeBorder,
                        },
                      ]}
                    >
                      <Text style={[styles.roleBadgeText, { color: theme.badgeText }]}>
                        {roleLabel}
                      </Text>
                    </View>
                  </View>

                  {/* Officer / Performer & Timestamp */}
                  <View style={styles.metaRow}>
                    <View style={styles.staffWrap}>
                      <Lucide
                        name="user-check"
                        size={12}
                        color={isDark ? colors.neutral[400] : colors.neutral[500]}
                      />
                      <Text
                        style={[
                          styles.staffText,
                          { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                        ]}
                      >
                        {entry.staff || "Authorized Officer"}
                      </Text>
                    </View>

                    {entry.timestamp ? (
                      <View style={styles.timeWrap}>
                        <Lucide
                          name="calendar"
                          size={12}
                          color={isDark ? colors.neutral[400] : colors.neutral[500]}
                        />
                        <Text
                          style={[
                            styles.timeText,
                            { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                          ]}
                        >
                          {entry.timestamp}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Remarks / Discrepancy Callout Note */}
                  {entry.remarks && entry.remarks.trim().length > 0 ? (
                    <View
                      style={[
                        styles.remarksBox,
                        {
                          backgroundColor: isDark ? colors.neutral[800] : "#F8FAFC",
                          borderColor: isDark ? colors.neutral[700] : "#E2E8F0",
                        },
                      ]}
                    >
                      <View style={styles.remarksHeader}>
                        <Lucide
                          name="message-square"
                          size={12}
                          color={isDark ? colors.brand[400] : colors.brand[600]}
                        />
                        <Text
                          style={[
                            styles.remarksLabel,
                            { color: isDark ? colors.brand[300] : colors.brand[700] },
                          ]}
                        >
                          Officer Remarks / Note:
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.remarksContent,
                          { color: isDark ? colors.neutral[200] : colors.neutral[800] },
                        ]}
                      >
                        {entry.remarks}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    padding: SPACING[20],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginVertical: SPACING[8],
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    textAlign: "center",
  },
  timelineCard: {
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    marginVertical: SPACING[8],
  },
  timelineRow: {
    flexDirection: "row",
    gap: SPACING[12],
  },
  leftCol: {
    alignItems: "center",
    width: 28,
  },
  nodeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    marginVertical: 4,
  },
  rightCol: {
    flex: 1,
  },
  rightColSpaced: {
    paddingBottom: SPACING[16],
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 4,
  },
  actionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
    minWidth: 180,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    marginTop: 2,
  },
  staffWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  staffText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    fontWeight: "600",
  },
  timeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  timeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
  },
  remarksBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  remarksHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  remarksLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10.5,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  remarksContent: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    lineHeight: 17,
  },
});
