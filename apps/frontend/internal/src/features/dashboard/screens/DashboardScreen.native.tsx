import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { TYPOGRAPHY, useTheme, Icon as Lucide, AnimatedCard, SkeletonLoader } from "@edge/ui";
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

  // Live applications and statistics
  const { applications, statistics, isLoading, isError } = useAdminApplications({
    role: currentRole,
    scope: 'queue',
    pageSize: 10,
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

  const chartBars = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (let i = 0; i < applications.length; i++) {
      const idx = i % 5;
      counts[idx] = counts[idx] + 1;
    }
    const max = Math.max(...counts, 1);
    return counts.map((count, i) => ({
      count,
      h: Math.max(24, Math.min(110, Math.round((count / max) * 90) + 20)),
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
    <SafeAreaView style={[styles.nativeSafeArea, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Mobile Header Banner */}
        <View style={styles.mobileHeader}>
          <Text
            style={[
              styles.badgeLabel,
              { color: isDark ? colors.brand.primary : colors.brand.secondary },
            ]}
          >
            MOBILE DASHBOARD • COCKPIT
          </Text>
          <Text style={[styles.mobileTitle, { color: colors.text }]}>
            {user?.name ?? currentRole} Workspace
          </Text>
          <Text style={[styles.mobileSubtitle, { color: colors.textMuted }]}>
            {user?.tenantName ? `${user.tenantName} Office • ` : ''}Queue summary, analytics velocity & system telemetry
          </Text>
        </View>

        {/* 4 KPI Metric Cards Stack */}
        <View style={styles.kpiGrid}>
          {isLoading && applications.length === 0 ? (
            [0, 1, 2, 3].map((i) => (
              <AnimatedCard key={i} padding={16} style={styles.sectionCard}>
                <SkeletonLoader height={20} width={40} borderRadius={4} />
                <View style={{ height: 6 }} />
                <SkeletonLoader height={24} width={70} borderRadius={4} />
                <View style={{ height: 4 }} />
                <SkeletonLoader height={12} width={110} borderRadius={4} />
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

        {/* Velocity Chart Card */}
        <AnimatedCard delay={320} padding={16} style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Evaluation Velocity & Trends
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                Regional office application throughput
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
                    {r === "7days" ? "7D" : r === "30days" ? "30D" : "1Y"}
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
              {user?.tenantName ?? 'Regional'} Command Velocity Stream
            </Text>
          </View>
        </AnimatedCard>

        {/* Live Activity Stream Card */}
        <AnimatedCard delay={400} padding={16} style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Live Activity Stream</Text>
          <View style={styles.activityList}>
            {applications.length === 0 && !isLoading ? (
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted, marginTop: 4 }]}>
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

        {/* Quick Actions Card */}
        <AnimatedCard delay={480} padding={16} style={styles.sectionCard}>
          <View style={styles.actionsInner}>
            <Text style={[styles.actionsTitle, { color: colors.textMuted }]}>QUICK ACTIONS</Text>
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
                size={18}
                color={isDark ? colors.brand.primary : colors.brand.secondary}
              />
              <Text style={[styles.actionBtnText, { color: colors.text }]}>
                Review Next Application in Queue
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
              <Lucide name="download" size={18} color={colors.semantic.success} />
              <Text style={[styles.actionBtnText, { color: colors.text }]}>
                Open Full Activities Queue
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* Telemetry & Spectrum Status Card */}
        <AnimatedCard delay={560} padding={16} style={styles.sectionCard}>
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
                  RBAC Tenant Compliance Policy
                </Text>
                <Text style={[styles.telemetrySub, { color: colors.textMuted }]}>
                  Role: {currentRole}
                </Text>
              </View>
            </View>
          </View>
        </AnimatedCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nativeSafeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
    gap: 16,
  },
  mobileHeader: {
    marginBottom: 8,
  },
  badgeLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  mobileTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  mobileSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
  },
  kpiGrid: {
    gap: 12,
  },
  sectionCard: {
    width: "100%",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
  },
  filterPills: {
    flexDirection: "row",
    gap: 4,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  chartMockArea: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  chartBarRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 12,
    height: 120,
    width: "100%",
    marginBottom: 10,
  },
  chartBar: {
    width: 24,
    borderRadius: 4,
  },
  chartCaption: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  activityList: {
    gap: 12,
    marginTop: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  activityTime: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    marginTop: 2,
  },
  actionsInner: {
    gap: 10,
  },
  actionsTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  telemetryList: {
    gap: 12,
    marginTop: 12,
  },
  telemetryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  telemetryText: {
    flex: 1,
  },
  telemetryTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  telemetrySub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    marginTop: 2,
  },
});
