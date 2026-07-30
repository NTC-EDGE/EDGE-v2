import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { COLORS, TYPOGRAPHY, useTheme, Icon as Lucide, AnimatedCard } from "@edge/ui";
import { useRole } from "../../shell/context/RoleContext";
import { MetricCard } from "../components/MetricCard";

export type TimeRangeOption = "7days" | "30days" | "year";

export function DashboardScreen(): React.ReactElement {
  const { currentRole } = useRole();
  const { colors, isDark } = useTheme();

  const [timeRange, setTimeRange] = useState<TimeRangeOption>("7days");
  const timeRangeOptions: readonly TimeRangeOption[] = ["7days", "30days", "year"];

  return (
    <ScrollView
      style={[styles.desktopShell, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Desktop Header */}
        <View style={styles.desktopHeader}>
          <View>
            <Text
              style={[
                styles.badgeLabel,
                { color: isDark ? colors.brand.primary : colors.brand.secondary },
              ]}
            >
              DESKTOP WORKSTATION COCKPIT
            </Text>
            <Text style={[styles.desktopTitle, { color: colors.text }]}>
              {currentRole} Operations Control
            </Text>
            <Text style={[styles.desktopSubtitle, { color: colors.textMuted }]}>
              Dual-screen evaluation console with multi-tenant metrics, velocity charts, and keyboard shortcuts.
            </Text>
          </View>

          <View style={styles.shortcutRow}>
            <View
              style={[
                styles.shortcutBadge,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.shortcutKey,
                  { color: isDark ? colors.brand.primary : colors.brand.secondary },
                ]}
              >
                Ctrl + N
              </Text>
              <Text style={[styles.shortcutDesc, { color: colors.textMuted }]}>Next Queue</Text>
            </View>
            <View
              style={[
                styles.shortcutBadge,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.shortcutKey,
                  { color: isDark ? colors.brand.primary : colors.brand.secondary },
                ]}
              >
                Ctrl + F
              </Text>
              <Text style={[styles.shortcutDesc, { color: colors.textMuted }]}>Quick Search</Text>
            </View>
            <View
              style={[
                styles.shortcutBadge,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.shortcutKey,
                  { color: isDark ? colors.brand.primary : colors.brand.secondary },
                ]}
              >
                Ctrl + E
              </Text>
              <Text style={[styles.shortcutDesc, { color: colors.textMuted }]}>Export Log</Text>
            </View>
          </View>
        </View>

        {/* 4 KPI Metric Cards Grid */}
        <View style={styles.kpiGrid}>
          <MetricCard
            title="Pending Evaluation"
            value={124}
            iconName="file-text"
            iconColor={colors.semantic.warning}
            iconBgColor={colors.semantic.warningBg}
            trendText="+8%"
            trendType="warning"
            delay={0}
          />
          <MetricCard
            title="Approved Licenses"
            value={852}
            iconName="check-circle"
            iconColor={colors.semantic.success}
            iconBgColor={colors.semantic.successBg}
            trendText="+14%"
            trendType="success"
            delay={80}
          />
          <MetricCard
            title="Rejected Compliance"
            value={42}
            iconName="alert-triangle"
            iconColor={colors.semantic.error}
            iconBgColor={colors.semantic.errorBg}
            trendText="-3%"
            trendType="error"
            delay={160}
          />
          <MetricCard
            title="Total Completed"
            value={710}
            iconName="grid"
            iconColor={isDark ? colors.brand.primary : colors.brand.secondary}
            iconBgColor={isDark ? colors.neutral[800] : colors.brand.light}
            trendText="+18%"
            trendType="info"
            delay={240}
          />
        </View>

        {/* Evaluation Velocity & Trends + Live Activity Stream Split */}
        <View style={styles.gridRow}>
          {/* Main Velocity Chart */}
          <View style={styles.leftCol}>
            <AnimatedCard delay={320} padding={24}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Evaluation Velocity & Trends
                  </Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                    Real-time desktop evaluation throughput velocity by regional office
                  </Text>
                </View>
                <View style={styles.filterPills}>
                  {timeRangeOptions.map((r) => (
                    <Pressable
                      key={r}
                      onPress={() => setTimeRange(r)}
                      style={[
                        styles.pill,
                        {
                          backgroundColor:
                            timeRange === r
                              ? isDark
                                ? colors.brand[600]
                                : colors.brand[700]
                              : isDark
                              ? colors.neutral[800]
                              : colors.neutral[100],
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          {
                            color:
                              timeRange === r
                                ? colors.neutral.white
                                : colors.textMuted,
                          },
                        ]}
                      >
                        {r === "7days" ? "7 Days" : r === "30days" ? "30 Days" : "1 Year"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View
                style={[
                  styles.chartMockArea,
                  {
                    backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.chartBarRow}>
                  <View style={[styles.chartBar, { height: 110, backgroundColor: colors.brand[600] }]} />
                  <View style={[styles.chartBar, { height: 150, backgroundColor: colors.semantic.success }]} />
                  <View style={[styles.chartBar, { height: 80, backgroundColor: colors.semantic.warning }]} />
                  <View style={[styles.chartBar, { height: 170, backgroundColor: colors.brand[600] }]} />
                  <View style={[styles.chartBar, { height: 130, backgroundColor: colors.semantic.success }]} />
                </View>
                <Text style={[styles.chartCaption, { color: colors.textMuted }]}>
                  Desktop Workstation Velocity Stream • NCR Head Office
                </Text>
              </View>
            </AnimatedCard>
          </View>

          {/* Live Activity Stream */}
          <View style={styles.rightCol}>
            <AnimatedCard delay={400} padding={24}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Live Activity Stream</Text>
              <View style={styles.activityList}>
                <View style={styles.activityItem}>
                  <View style={[styles.activityDot, { backgroundColor: colors.semantic.success }]} />
                  <View style={styles.activityText}>
                    <Text style={[styles.activityTitle, { color: colors.text }]}>
                      Application #APP-2026-0521 Approved
                    </Text>
                    <Text style={[styles.activityTime, { color: colors.textMuted }]}>
                      10:24 AM by Juan Dela Cruz
                    </Text>
                  </View>
                </View>

                <View style={styles.activityItem}>
                  <View style={[styles.activityDot, { backgroundColor: colors.semantic.warning }]} />
                  <View style={styles.activityText}>
                    <Text style={[styles.activityTitle, { color: colors.text }]}>
                      New Accreditation Submitted
                    </Text>
                    <Text style={[styles.activityTime, { color: colors.textMuted }]}>
                      09:45 AM by RuralNet ISP
                    </Text>
                  </View>
                </View>

                <View style={styles.activityItem}>
                  <View
                    style={[
                      styles.activityDot,
                      { backgroundColor: isDark ? colors.brand.primary : colors.brand.secondary },
                    ]}
                  />
                  <View style={styles.activityText}>
                    <Text style={[styles.activityTitle, { color: colors.text }]}>
                      Role Policy Updated
                    </Text>
                    <Text style={[styles.activityTime, { color: colors.textMuted }]}>
                      08:15 AM by System Admin
                    </Text>
                  </View>
                </View>
              </View>
            </AnimatedCard>
          </View>
        </View>

        {/* Dual-Column Workstation Grid: Active Queues + Telemetry & Quick Actions */}
        <View style={styles.gridRow}>
          {/* Active Evaluation Queues */}
          <View style={styles.leftCol}>
            <Text style={[styles.colTitle, { color: colors.textMuted }]}>
              ACTIVE EVALUATION QUEUES
            </Text>

            <AnimatedCard delay={480} padding={20} style={styles.queueCard}>
              <View style={styles.queueHeader}>
                <Text style={[styles.queueId, { color: colors.textMuted }]}>#APP-2026-0521</Text>
                <View
                  style={[
                    styles.statusTag,
                    { backgroundColor: colors.semantic.warningBg },
                  ]}
                >
                  <Text style={[styles.statusTagText, { color: colors.semantic.warningText }]}>
                    Pending Review
                  </Text>
                </View>
              </View>
              <Text style={[styles.queueSubject, { color: colors.text }]}>
                International Telecom Relay Carrier License
              </Text>
              <Text style={[styles.queueMeta, { color: colors.textMuted }]}>
                Submitted by Globe Telecom Inc. • Regional NCR
              </Text>

              <View style={styles.queueFooter}>
                <TouchableOpacity
                  style={[
                    styles.primaryActionBtn,
                    { backgroundColor: isDark ? colors.brand.primary : colors.brand.secondary },
                  ]}
                  activeOpacity={0.8}
                >
                  <Lucide name="eye" size={14} color={COLORS.neutral.white} />
                  <Text style={styles.primaryActionBtnText}>Inspect Application</Text>
                </TouchableOpacity>
              </View>
            </AnimatedCard>

            <AnimatedCard delay={520} padding={20} style={styles.queueCard}>
              <View style={styles.queueHeader}>
                <Text style={[styles.queueId, { color: colors.textMuted }]}>#ACR-2026-0042</Text>
                <View
                  style={[
                    styles.statusTag,
                    { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusTagText,
                      { color: isDark ? colors.brand.primary : colors.brand.secondary },
                    ]}
                  >
                    In Progress
                  </Text>
                </View>
              </View>
              <Text style={[styles.queueSubject, { color: colors.text }]}>
                Rural Satellite Broadband Spectrum License
              </Text>
              <Text style={[styles.queueMeta, { color: colors.textMuted }]}>
                Submitted by RuralNet ISP • Regional III
              </Text>

              <View style={styles.queueFooter}>
                <TouchableOpacity
                  style={[
                    styles.primaryActionBtn,
                    { backgroundColor: isDark ? colors.brand.primary : colors.brand.secondary },
                  ]}
                  activeOpacity={0.8}
                >
                  <Lucide name="eye" size={14} color={COLORS.neutral.white} />
                  <Text style={styles.primaryActionBtnText}>Inspect Application</Text>
                </TouchableOpacity>
              </View>
            </AnimatedCard>
          </View>

          {/* Telemetry & Quick Actions */}
          <View style={styles.rightCol}>
            <Text style={[styles.colTitle, { color: colors.textMuted }]}>
              QUICK ACTIONS & TELEMETRY
            </Text>

            {/* Quick Actions */}
            <AnimatedCard delay={560} padding={20}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
              <View style={styles.quickActionsCol}>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                      borderColor: colors.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Lucide
                    name="plus-circle"
                    size={16}
                    color={isDark ? colors.brand.primary : colors.brand.secondary}
                  />
                  <Text style={[styles.actionBtnText, { color: colors.text }]}>
                    Review Next Application
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                      borderColor: colors.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Lucide name="download" size={16} color={colors.semantic.success} />
                  <Text style={[styles.actionBtnText, { color: colors.text }]}>
                    Export Daily Summary
                  </Text>
                </TouchableOpacity>
              </View>
            </AnimatedCard>

            {/* Telemetry Status */}
            <AnimatedCard delay={600} padding={20}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Telemetry & Spectrum Status</Text>
              <View style={styles.telemetryList}>
                <View style={styles.telemetryRow}>
                  <Lucide name="wifi" size={18} color={colors.semantic.success} />
                  <View style={styles.telemetryText}>
                    <Text style={[styles.telemetryTitle, { color: colors.text }]}>
                      Regional Frequency Band 3.5 GHz
                    </Text>
                    <Text style={[styles.telemetrySub, { color: colors.textMuted }]}>
                      Spectrum Load: 42% Capacity
                    </Text>
                  </View>
                </View>

                <View style={styles.telemetryRow}>
                  <Lucide
                    name="shield"
                    size={18}
                    color={isDark ? colors.brand.primary : colors.brand.secondary}
                  />
                  <View style={styles.telemetryText}>
                    <Text style={[styles.telemetryTitle, { color: colors.text }]}>
                      RBAC Tenant Compliance Policy
                    </Text>
                    <Text style={[styles.telemetrySub, { color: colors.textMuted }]}>
                      All Regional Offices Synced (100%)
                    </Text>
                  </View>
                </View>
              </View>
            </AnimatedCard>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  desktopShell: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
  },
  container: {
    gap: 24,
  },
  desktopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  desktopTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  desktopSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
  },
  shortcutRow: {
    flexDirection: "row",
    gap: 10,
  },
  shortcutBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  shortcutKey: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  shortcutDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  gridRow: {
    flexDirection: "row",
    gap: 24,
  },
  leftCol: {
    flex: 2,
    gap: 16,
  },
  rightCol: {
    flex: 1,
    gap: 16,
  },
  colTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  filterPills: {
    flexDirection: "row",
    gap: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  chartMockArea: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
  },
  chartBarRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 16,
    height: 160,
    width: "100%",
    marginBottom: 12,
  },
  chartBar: {
    width: 32,
    borderRadius: 6,
  },
  chartCaption: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  activityList: {
    gap: 16,
    marginTop: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  activityTime: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: 2,
  },
  queueCard: {
    width: "100%",
  },
  queueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  queueId: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusTagText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  queueSubject: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 4,
  },
  queueMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginBottom: 12,
  },
  queueFooter: {
    alignItems: "flex-start",
  },
  primaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primaryActionBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
  quickActionsCol: {
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  telemetryList: {
    gap: 16,
    marginTop: 12,
  },
  telemetryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  telemetryText: {
    flex: 1,
  },
  telemetryTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  telemetrySub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: 2,
  },
});
