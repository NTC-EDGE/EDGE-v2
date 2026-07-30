import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { TYPOGRAPHY, useTheme, Icon as Lucide, AnimatedCard } from "@edge/ui";
import { useRole } from "../../shell/context/RoleContext";
import { MetricCard } from "../components/MetricCard";

export type TimeRangeOption = "7days" | "30days" | "year";

export function DashboardScreen(): React.ReactElement {
  const { currentRole } = useRole();
  const { colors, isDark } = useTheme();

  const [timeRange, setTimeRange] = useState<TimeRangeOption>("7days");
  const timeRangeOptions: readonly TimeRangeOption[] = ["7days", "30days", "year"];

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
            {currentRole} Workspace
          </Text>
          <Text style={[styles.mobileSubtitle, { color: colors.textMuted }]}>
            Queue summary, analytics velocity & system telemetry
          </Text>
        </View>

        {/* 4 KPI Metric Cards Stack */}
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
              <View style={[styles.chartBar, { height: 70, backgroundColor: colors.brand[600] }]} />
              <View style={[styles.chartBar, { height: 100, backgroundColor: colors.semantic.success }]} />
              <View style={[styles.chartBar, { height: 50, backgroundColor: colors.semantic.warning }]} />
              <View style={[styles.chartBar, { height: 110, backgroundColor: colors.brand[600] }]} />
              <View style={[styles.chartBar, { height: 85, backgroundColor: colors.semantic.success }]} />
            </View>
            <Text style={[styles.chartCaption, { color: colors.textMuted }]}>
              Mobile Command Velocity Stream • NCR Head Office
            </Text>
          </View>
        </AnimatedCard>

        {/* Live Activity Stream Card */}
        <AnimatedCard delay={400} padding={16} style={styles.sectionCard}>
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

        {/* Quick Actions Card */}
        <AnimatedCard delay={480} padding={16} style={styles.sectionCard}>
          <View style={styles.actionsInner}>
            <Text style={[styles.actionsTitle, { color: colors.textMuted }]}>QUICK ACTIONS</Text>
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
                size={18}
                color={isDark ? colors.brand.primary : colors.brand.secondary}
              />
              <Text style={[styles.actionBtnText, { color: colors.text }]}>
                Review Next Application in Queue
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
              <Lucide name="download" size={18} color={colors.semantic.success} />
              <Text style={[styles.actionBtnText, { color: colors.text }]}>
                Export Daily Evaluation Summary
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* Telemetry & Spectrum Status Card */}
        <AnimatedCard delay={560} padding={16} style={styles.sectionCard}>
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
