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

export function DashboardScreenWeb() {
  const { currentRole } = useRole();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isMobile = width < 768;

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
        {/* Web Banner */}
        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.welcomeLabel}>OFFICIAL GOV PORTAL • WEB SESSION</Text>
            <Text style={styles.welcomeTitle}>
              Welcome back, {currentRole} Staff
            </Text>
            <Text style={styles.welcomeSubtitle}>
              NTC Data Governance & Regional Queue Management Workspace.
            </Text>
          </View>
          <View style={[styles.dateCard, SHADOWS.card]}>
            <Lucide name="calendar" size={16} color={COLORS.neutral[500]} />
            <Text style={styles.dateText}>{getFormattedDate()}</Text>
          </View>
        </View>

        {/* Web Metric Grid */}
        <View style={styles.kpiGrid}>
          <View style={[styles.metricCard, SHADOWS.card]}>
            <View style={[styles.iconCircle, { backgroundColor: "rgba(245, 158, 11, 0.1)" }]}>
              <Lucide name="file-text" size={20} color="#F59E0B" />
            </View>
            <View>
              <Text style={styles.metricTitle}>Pending Evaluation</Text>
              <Text style={styles.metricValue}>124</Text>
            </View>
          </View>

          <View style={[styles.metricCard, SHADOWS.card]}>
            <View style={[styles.iconCircle, { backgroundColor: "rgba(16, 185, 129, 0.1)" }]}>
              <Lucide name="check-circle" size={20} color="#10B981" />
            </View>
            <View>
              <Text style={styles.metricTitle}>Approved Licenses</Text>
              <Text style={styles.metricValue}>852</Text>
            </View>
          </View>

          <View style={[styles.metricCard, SHADOWS.card]}>
            <View style={[styles.iconCircle, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
              <Lucide name="alert-triangle" size={20} color="#EF4444" />
            </View>
            <View>
              <Text style={styles.metricTitle}>Rejected Audits</Text>
              <Text style={styles.metricValue}>42</Text>
            </View>
          </View>

          <View style={[styles.metricCard, SHADOWS.card]}>
            <View style={[styles.iconCircle, { backgroundColor: "rgba(37, 99, 235, 0.1)" }]}>
              <Lucide name="grid" size={20} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.metricTitle}>Total Completed</Text>
              <Text style={styles.metricValue}>710</Text>
            </View>
          </View>
        </View>

        {/* Web Content Split */}
        <View style={[styles.splitRow, { flexDirection: isDesktop ? "row" : "column" }]}>
          <View style={[styles.mainSection, SHADOWS.card]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Evaluation Velocity</Text>
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
            <View style={styles.chartPlaceholder}>
              <Lucide name="bar-chart-2" size={48} color="#94A3B8" />
              <Text style={styles.placeholderText}>Web Interactive Trend Analytics</Text>
            </View>
          </View>

          <View style={[styles.sideSection, SHADOWS.card]}>
            <Text style={styles.sectionTitle}>System Activity</Text>
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <Lucide name="check-circle" size={16} color="#10B981" />
                <View style={styles.activityText}>
                  <Text style={styles.activityTitle}>Application #APP-2026-0521 Approved</Text>
                  <Text style={styles.activityTime}>10:24 AM by Juan Dela Cruz</Text>
                </View>
              </View>
              <View style={styles.activityItem}>
                <Lucide name="file-text" size={16} color="#F59E0B" />
                <View style={styles.activityText}>
                  <Text style={styles.activityTitle}>New Accreditation Submitted</Text>
                  <Text style={styles.activityTime}>09:45 AM by RuralNet ISP</Text>
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
    paddingHorizontal: 24,
    paddingVertical: 24,
    maxWidth: 1600,
    width: "100%",
    alignSelf: "center",
  },
  container: {
    gap: 24,
  },
  welcomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#2563EB",
    letterSpacing: 0.5,
  },
  welcomeTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 26,
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
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dateText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#475569",
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  metricTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  metricValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
  },
  splitRow: {
    gap: 24,
  },
  mainSection: {
    flex: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sideSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
    marginBottom: 16,
  },
  filterPills: {
    flexDirection: "row",
    gap: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
  },
  pillActive: {
    backgroundColor: "#2563EB",
  },
  pillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#64748B",
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  chartPlaceholder: {
    height: 220,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  placeholderText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#64748B",
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
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
