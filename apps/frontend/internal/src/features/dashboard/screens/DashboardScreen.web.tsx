import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import {
  COLORS,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
} from "@edge/ui";
import { useRole } from "../../shell/context/RoleContext";

export function DashboardScreen() {
  const { currentRole } = useRole();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "year">("7days");

  const getFormattedDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Web Hero Banner */}
        <View style={styles.welcomeRow}>
          <View>
            <View style={styles.govBadgePill}>
              <View style={styles.pulseDot} />
              <Text style={styles.welcomeLabel}>GOVERNMENT DATA GOVERNANCE • WEB COMMAND CENTER</Text>
            </View>
            <Text style={styles.welcomeTitle}>
              Welcome back, {currentRole} Staff
            </Text>
            <Text style={styles.welcomeSubtitle}>
              NTC EDGE multi-tenant queue management, licensing evaluation, and telemetry dashboard.
            </Text>
          </View>
          <View style={[styles.dateCard, SHADOWS.card]}>
            <Lucide name="calendar" size={16} color="#2563EB" />
            <Text style={styles.dateText}>{getFormattedDate()}</Text>
          </View>
        </View>

        {/* Premium KPI Cards Grid */}
        <View style={styles.kpiGrid}>
          <View style={[styles.metricCard, SHADOWS.card]}>
            <View style={[styles.iconCircle, { backgroundColor: "rgba(245, 158, 11, 0.12)" }]}>
              <Lucide name="file-text" size={22} color="#D97706" />
            </View>
            <View style={styles.metricTextGroup}>
              <Text style={styles.metricTitle}>Pending Evaluation</Text>
              <View style={styles.metricValRow}>
                <Text style={styles.metricValue}>124</Text>
                <View style={styles.trendBadgeWarning}>
                  <Lucide name="arrow-up-right" size={12} color="#D97706" />
                  <Text style={styles.trendTextWarning}>+8%</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.metricCard, SHADOWS.card]}>
            <View style={[styles.iconCircle, { backgroundColor: "rgba(16, 185, 129, 0.12)" }]}>
              <Lucide name="check-circle" size={22} color="#10B981" />
            </View>
            <View style={styles.metricTextGroup}>
              <Text style={styles.metricTitle}>Approved Licenses</Text>
              <View style={styles.metricValRow}>
                <Text style={styles.metricValue}>852</Text>
                <View style={styles.trendBadgeSuccess}>
                  <Lucide name="arrow-up-right" size={12} color="#10B981" />
                  <Text style={styles.trendTextSuccess}>+14%</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.metricCard, SHADOWS.card]}>
            <View style={[styles.iconCircle, { backgroundColor: "rgba(239, 68, 68, 0.12)" }]}>
              <Lucide name="alert-triangle" size={22} color="#EF4444" />
            </View>
            <View style={styles.metricTextGroup}>
              <Text style={styles.metricTitle}>Rejected Compliance</Text>
              <View style={styles.metricValRow}>
                <Text style={styles.metricValue}>42</Text>
                <View style={styles.trendBadgeDanger}>
                  <Lucide name="arrow-down-right" size={12} color="#EF4444" />
                  <Text style={styles.trendTextDanger}>-3%</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.metricCard, SHADOWS.card]}>
            <View style={[styles.iconCircle, { backgroundColor: "rgba(37, 99, 235, 0.12)" }]}>
              <Lucide name="grid" size={22} color="#2563EB" />
            </View>
            <View style={styles.metricTextGroup}>
              <Text style={styles.metricTitle}>Total Completed</Text>
              <View style={styles.metricValRow}>
                <Text style={styles.metricValue}>710</Text>
                <View style={styles.trendBadgePrimary}>
                  <Lucide name="arrow-up-right" size={12} color="#2563EB" />
                  <Text style={styles.trendTextPrimary}>+18%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Analytics & Activity Split */}
        <View style={[styles.splitRow, { flexDirection: isDesktop ? "row" : "column" }]}>
          <View style={[styles.mainSection, SHADOWS.card]}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Evaluation Velocity & Trends</Text>
                <Text style={styles.sectionSubtitle}>Real-time application throughput velocity by regional office</Text>
              </View>
              <View style={styles.filterPills}>
                {(["7days", "30days", "year"] as const).map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setTimeRange(r)}
                    style={[styles.pill, timeRange === r && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, timeRange === r && styles.pillTextActive]}>
                      {r === "7days" ? "7 Days" : r === "30days" ? "30 Days" : "1 Year"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.chartMockArea}>
              <View style={styles.chartBarRow}>
                <View style={[styles.chartBar, { height: 120, backgroundColor: "#3B82F6" }]} />
                <View style={[styles.chartBar, { height: 160, backgroundColor: "#10B981" }]} />
                <View style={[styles.chartBar, { height: 90, backgroundColor: "#F59E0B" }]} />
                <View style={[styles.chartBar, { height: 180, backgroundColor: "#3B82F6" }]} />
                <View style={[styles.chartBar, { height: 140, backgroundColor: "#10B981" }]} />
              </View>
              <Text style={styles.chartCaption}>Web Command Velocity Stream • NCR Head Office</Text>
            </View>
          </View>

          <View style={[styles.sideSection, SHADOWS.card]}>
            <Text style={styles.sectionTitle}>Live Activity Stream</Text>
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <View style={styles.activityDotSuccess} />
                <View style={styles.activityText}>
                  <Text style={styles.activityTitle}>Application #APP-2026-0521 Approved</Text>
                  <Text style={styles.activityTime}>10:24 AM by Juan Dela Cruz</Text>
                </View>
              </View>
              <View style={styles.activityItem}>
                <View style={styles.activityDotWarning} />
                <View style={styles.activityText}>
                  <Text style={styles.activityTitle}>New Accreditation Submitted</Text>
                  <Text style={styles.activityTime}>09:45 AM by RuralNet ISP</Text>
                </View>
              </View>
              <View style={styles.activityItem}>
                <View style={styles.activityDotPrimary} />
                <View style={styles.activityText}>
                  <Text style={styles.activityTitle}>Role Policy Updated</Text>
                  <Text style={styles.activityTime}>08:15 AM by System Admin</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 32,
    paddingVertical: 32,
    maxWidth: 1600,
    width: "100%",
    alignSelf: "center",
  },
  container: {
    gap: 28,
  },
  welcomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  govBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  welcomeLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#2563EB",
    letterSpacing: 0.6,
  },
  welcomeTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
  },
  welcomeSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: "#64748B",
  },
  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dateText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#1E293B",
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  metricTextGroup: {
    flex: 1,
  },
  metricTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: 4,
  },
  metricValRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metricValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 26,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
  },
  trendBadgeWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendTextWarning: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#D97706",
  },
  trendBadgeSuccess: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendTextSuccess: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#10B981",
  },
  trendBadgeDanger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendTextDanger: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#EF4444",
  },
  trendBadgePrimary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(37, 99, 235, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendTextPrimary: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#2563EB",
  },
  splitRow: {
    gap: 24,
  },
  mainSection: {
    flex: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sideSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
  },
  sectionSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
  },
  filterPills: {
    flexDirection: "row",
    gap: 6,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  pillActive: {
    backgroundColor: "#2563EB",
  },
  pillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#64748B",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  chartMockArea: {
    height: 220,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  chartBarRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 20,
    height: 160,
    marginBottom: 12,
  },
  chartBar: {
    width: 36,
    borderRadius: 6,
  },
  chartCaption: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  activityList: {
    gap: 20,
    marginTop: 16,
  },
  activityItem: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  activityDotSuccess: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
    marginTop: 4,
  },
  activityDotWarning: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F59E0B",
    marginTop: 4,
  },
  activityDotPrimary: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
    marginTop: 4,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#1E293B",
  },
  activityTime: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "#64748B",
  },
});
