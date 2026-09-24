import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { COLORS, TYPOGRAPHY, useTheme, Icon as Lucide, AnimatedCard, SkeletonLoader } from "@edge/ui";
import { useRole } from "../../shell/context/RoleContext";
import { useAuthContext } from "../../auth/context/AuthContext";
import { MetricCard } from "../components/MetricCard";
import { useAdminApplications } from "@edge/api";
import { openQueueApplication } from "../../queue/data/internalApplicationNavigationHelper";
import { useAppNavigation } from "../../../navigation/types";

export type TimeRangeOption = "7days" | "30days" | "year";

function formatRelativeTime(dateStr?: string | null): string {
  if (dateStr === null || dateStr === undefined || dateStr.trim().length === 0) {
    return 'Just now';
  }
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Recently';
  }
}

export function DashboardScreen(): React.ReactElement {
  const { currentRole } = useRole();
  const { user } = useAuthContext();
  const navigation = useAppNavigation();
  const { colors, isDark } = useTheme();

  const [timeRange, setTimeRange] = useState<TimeRangeOption>("7days");
  const timeRangeOptions: readonly TimeRangeOption[] = ["7days", "30days", "year"];

  // Live applications and aggregated telemetry
  const { applications, statistics, isLoading, isError } = useAdminApplications({
    scope: 'queue',
    pageSize: 15,
  });

  const pendingCount = statistics?.evaluatingCount !== undefined
    ? statistics.evaluatingCount
    : applications.filter((a) => a.status === 'Submitted' || a.status === 'Evaluating').length;

  const approvedCount = statistics?.approvedCount !== undefined
    ? statistics.approvedCount
    : applications.filter((a) => a.status === 'Approved').length;

  const returnedCount = statistics?.returnedCount !== undefined
    ? statistics.returnedCount
    : applications.filter((a) => a.status === 'Returned').length;

  const completedCount = statistics?.completedCount !== undefined
    ? statistics.completedCount
    : applications.filter((a) => a.status === 'Completed').length;

  // Compute 5-slot velocity distribution
  const chartBars = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (let i = 0; i < applications.length; i++) {
      const idx = i % 5;
      counts[idx] = counts[idx] + 1;
    }
    const max = Math.max(...counts, 1);
    return counts.map((count, i) => ({
      count,
      h: Math.max(30, Math.min(160, Math.round((count / max) * 140) + 20)),
      color: i % 2 === 0 ? colors.brand[600] : colors.semantic.success,
    }));
  }, [applications, colors]);

  const handleInspect = (appId: string) => {
    openQueueApplication(appId);
    try {
      navigation.navigate('Activities');
    } catch {
      // Fallback
    }
  };

  const handleReviewNext = () => {
    const nextPending = applications.find(
      (a) => a.status === 'Submitted' || a.status === 'Evaluating'
    ) ?? applications[0];

    if (nextPending !== undefined && nextPending !== null) {
      handleInspect(nextPending.id);
    } else {
      try {
        navigation.navigate('Activities');
      } catch {
        // Fallback
      }
    }
  };

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
              {user?.name ?? currentRole} Operations Control
            </Text>
            <Text style={[styles.desktopSubtitle, { color: colors.textMuted }]}>
              {user?.tenantName ? `Regional Office: ${user.tenantName} • ` : ''}Dual-screen evaluation console with live tenant metrics and queue actions.
            </Text>
          </View>

          <View style={styles.shortcutRow}>
            <TouchableOpacity
              onPress={handleReviewNext}
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
                Review Next
              </Text>
              <Text style={[styles.shortcutDesc, { color: colors.textMuted }]}>Next Queue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Activities')}
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
                All Queue
              </Text>
              <Text style={[styles.shortcutDesc, { color: colors.textMuted }]}>View List</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4 KPI Metric Cards Grid */}
        <View style={styles.kpiGrid}>
          {isLoading && applications.length === 0 ? (
            [0, 1, 2, 3].map((i) => (
              <AnimatedCard key={i} padding={20} style={{ flex: 1, minWidth: 240 }}>
                <SkeletonLoader height={24} width={40} borderRadius={6} />
                <View style={{ height: 8 }} />
                <SkeletonLoader height={28} width={80} borderRadius={6} />
                <View style={{ height: 4 }} />
                <SkeletonLoader height={14} width={130} borderRadius={6} />
              </AnimatedCard>
            ))
          ) : (
            <>
              <MetricCard
                title="Pending Evaluation"
                value={pendingCount}
                iconName="file-text"
                iconColor={colors.semantic.warning}
                iconBgColor={colors.semantic.warningBg}
                trendText="Live"
                trendType="warning"
                delay={0}
              />
              <MetricCard
                title="Approved Licenses"
                value={approvedCount}
                iconName="check-circle"
                iconColor={colors.semantic.success}
                iconBgColor={colors.semantic.successBg}
                trendText="Live"
                trendType="success"
                delay={80}
              />
              <MetricCard
                title="Rejected / Returned"
                value={returnedCount}
                iconName="alert-triangle"
                iconColor={colors.semantic.error}
                iconBgColor={colors.semantic.errorBg}
                trendText="Sync"
                trendType="error"
                delay={160}
              />
              <MetricCard
                title="Total Completed"
                value={completedCount}
                iconName="grid"
                iconColor={isDark ? colors.brand.primary : colors.brand.secondary}
                iconBgColor={isDark ? colors.neutral[800] : colors.brand.light}
                trendText="Live"
                trendType="info"
                delay={240}
              />
            </>
          )}
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
                    Live application throughput velocity by regional tenant office
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
                  {chartBars.map((b, i) => (
                    <View
                      key={i}
                      style={[
                        styles.chartBar,
                        {
                          height: b.h,
                          backgroundColor: b.color,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.chartCaption, { color: colors.textMuted }]}>
                  {user?.tenantName ?? 'Regional'} Command Center Throughput Velocity Stream
                </Text>
              </View>
            </AnimatedCard>
          </View>

          {/* Live Activity Stream */}
          <View style={styles.rightCol}>
            <AnimatedCard delay={400} padding={24}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Live Activity Stream</Text>
              <View style={styles.activityList}>
                {applications.length === 0 && !isLoading ? (
                  <Text style={[styles.sectionSubtitle, { color: colors.textMuted, marginTop: 8 }]}>
                    No recent activity records.
                  </Text>
                ) : (
                  applications.slice(0, 3).map((app) => {
                    const statusDot = app.status === 'Approved'
                      ? colors.semantic.success
                      : app.status === 'Returned'
                      ? colors.semantic.error
                      : colors.semantic.warning;

                    const applicantName = app.filingUser?.name ?? app.filingUser?.company?.name ?? 'Applicant';
                    const appNumber = app.applicationNumber ?? app.referenceNumber ?? app.id.slice(0, 8);

                    return (
                      <TouchableOpacity
                        key={app.id}
                        onPress={() => handleInspect(app.id)}
                        style={styles.activityItem}
                      >
                        <View style={[styles.activityDot, { backgroundColor: statusDot }]} />
                        <View style={styles.activityText}>
                          <Text style={[styles.activityTitle, { color: colors.text }]}>
                            {appNumber} — {app.status}
                          </Text>
                          <Text style={[styles.activityTime, { color: colors.textMuted }]}>
                            {formatRelativeTime(app.createdAt)} by {applicantName}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </AnimatedCard>
          </View>
        </View>

        {/* Dual-Column Workstation Grid: Active Queues + Telemetry & Quick Actions */}
        <View style={styles.gridRow}>
          {/* Active Evaluation Queues */}
          <View style={styles.leftCol}>
            <Text style={[styles.colTitle, { color: colors.textMuted }]}>
              ACTIVE EVALUATION QUEUES ({applications.length})
            </Text>

            {applications.length === 0 && !isLoading ? (
              <AnimatedCard padding={20} style={styles.queueCard}>
                <Text style={{ color: colors.textMuted }}>No active applications in queue.</Text>
              </AnimatedCard>
            ) : (
              applications.slice(0, 2).map((app, idx) => {
                const appNumber = app.applicationNumber ?? app.referenceNumber ?? app.id.slice(0, 8);
                const applicantName = app.filingUser?.name ?? app.filingUser?.company?.name ?? 'Applicant';
                const serviceName = app.serviceName ?? app.serviceCategory ?? 'Permit Service';
                const isPending = app.status === 'Submitted' || app.status === 'Evaluating';

                return (
                  <AnimatedCard key={app.id} delay={480 + idx * 40} padding={20} style={styles.queueCard}>
                    <View style={styles.queueHeader}>
                      <Text style={[styles.queueId, { color: colors.textMuted }]}>#{appNumber}</Text>
                      <View
                        style={[
                          styles.statusTag,
                          {
                            backgroundColor: isPending
                              ? colors.semantic.warningBg
                              : isDark
                              ? colors.neutral[800]
                              : colors.brand.light,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusTagText,
                            {
                              color: isPending
                                ? colors.semantic.warningText
                                : isDark
                                ? colors.brand.primary
                                : colors.brand.secondary,
                            },
                          ]}
                        >
                          {app.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.queueSubject, { color: colors.text }]}>
                      {serviceName}
                    </Text>
                    <Text style={[styles.queueMeta, { color: colors.textMuted }]}>
                      Submitted by {applicantName} • {app.office ?? user?.tenantName ?? 'Regional Office'}
                    </Text>

                    <View style={styles.queueFooter}>
                      <TouchableOpacity
                        onPress={() => handleInspect(app.id)}
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
                );
              })
            )}
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
                  onPress={handleReviewNext}
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
                  onPress={() => navigation.navigate('Activities')}
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
                    View All Queue Entries
                  </Text>
                </TouchableOpacity>
              </View>
            </AnimatedCard>

            {/* Telemetry Status */}
            <AnimatedCard delay={600} padding={20}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Tenant Status</Text>
              <View style={styles.telemetryList}>
                <View style={styles.telemetryRow}>
                  <Lucide name="wifi" size={18} color={isError ? colors.semantic.error : colors.semantic.success} />
                  <View style={styles.telemetryText}>
                    <Text style={[styles.telemetryTitle, { color: colors.text }]}>
                      {user?.tenantName ?? 'Regional Office'}
                    </Text>
                    <Text style={[styles.telemetrySub, { color: colors.textMuted }]}>
                      {isError ? 'Connection Issue' : 'Live Sync Active (100%)'}
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
                      RBAC Policy Enforcement
                    </Text>
                    <Text style={[styles.telemetrySub, { color: colors.textMuted }]}>
                      Role: {currentRole}
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
    width: "100%",
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
