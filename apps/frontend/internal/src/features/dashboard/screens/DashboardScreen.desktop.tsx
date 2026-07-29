import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { COLORS, TYPOGRAPHY, Icon as Lucide } from "@edge/ui";
import { useRole } from "../../shell/context/RoleContext";

export function DashboardScreen() {
  const { currentRole } = useRole();

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Desktop Header */}
        <View style={styles.desktopHeader}>
          <View>
            <Text style={styles.badgeLabel}>DESKTOP WORKSTATION COCKPIT</Text>
            <Text style={styles.desktopTitle}>{currentRole} Operations Control</Text>
            <Text style={styles.desktopSubtitle}>
              Dual-screen evaluation console with keyboard shortcut support.
            </Text>
          </View>

          <View style={styles.shortcutRow}>
            <View style={styles.shortcutBadge}>
              <Text style={styles.shortcutKey}>Ctrl + N</Text>
              <Text style={styles.shortcutDesc}>Next Queue</Text>
            </View>
            <View style={styles.shortcutBadge}>
              <Text style={styles.shortcutKey}>Ctrl + F</Text>
              <Text style={styles.shortcutDesc}>Quick Search</Text>
            </View>
            <View style={styles.shortcutBadge}>
              <Text style={styles.shortcutKey}>Ctrl + E</Text>
              <Text style={styles.shortcutDesc}>Export Log</Text>
            </View>
          </View>
        </View>

        {/* Dual-Column Workstation Grid */}
        <View style={styles.gridRow}>
          <View style={styles.leftCol}>
            <Text style={styles.colTitle}>ACTIVE EVALUATION QUEUES</Text>

            <View style={styles.queueCard}>
              <View style={styles.queueHeader}>
                <Text style={styles.queueId}>#APP-2026-0521</Text>
                <View style={[styles.statusTag, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
                  <Text style={[styles.statusTagText, { color: "#D97706" }]}>Pending Review</Text>
                </View>
              </View>
              <Text style={styles.queueSubject}>International Telecom Relay Carrier License</Text>
              <Text style={styles.queueMeta}>Submitted by Globe Telecom Inc. • Regional NCR</Text>

              <View style={styles.queueFooter}>
                <TouchableOpacity style={styles.primaryActionBtn} activeOpacity={0.7}>
                  <Lucide name="eye" size={14} color="#FFFFFF" />
                  <Text style={styles.primaryActionBtnText}>Inspect Application</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.queueCard}>
              <View style={styles.queueHeader}>
                <Text style={styles.queueId}>#ACR-2026-0042</Text>
                <View style={[styles.statusTag, { backgroundColor: "rgba(37, 99, 235, 0.15)" }]}>
                  <Text style={[styles.statusTagText, { color: "#2563EB" }]}>In Progress</Text>
                </View>
              </View>
              <Text style={styles.queueSubject}>Rural Satellite Broadband Spectrum License</Text>
              <Text style={styles.queueMeta}>Submitted by RuralNet ISP • Regional III</Text>

              <View style={styles.queueFooter}>
                <TouchableOpacity style={styles.primaryActionBtn} activeOpacity={0.7}>
                  <Lucide name="eye" size={14} color="#FFFFFF" />
                  <Text style={styles.primaryActionBtnText}>Inspect Application</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.rightCol}>
            <Text style={styles.colTitle}>TELEMETRY & SPECTRUM STATUS</Text>
            <View style={styles.telemetryCard}>
              <View style={styles.telemetryRow}>
                <Lucide name="wifi" size={18} color="#10B981" />
                <View style={styles.telemetryText}>
                  <Text style={styles.telemetryTitle}>Regional Frequency Band 3.5 GHz</Text>
                  <Text style={styles.telemetrySub}>Spectrum Load: 42% Capacity</Text>
                </View>
              </View>
              <View style={styles.telemetryRow}>
                <Lucide name="shield" size={18} color="#2563EB" />
                <View style={styles.telemetryText}>
                  <Text style={styles.telemetryTitle}>RBAC Tenant Compliance Policy</Text>
                  <Text style={styles.telemetrySub}>All Regional Offices Synced (100%)</Text>
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
    color: "#2563EB",
    letterSpacing: 0.5,
  },
  desktopTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
  },
  desktopSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: "#64748B",
  },
  shortcutRow: {
    flexDirection: "row",
    gap: 10,
  },
  shortcutBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
  },
  shortcutKey: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#1E3A8A",
  },
  shortcutDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: "#64748B",
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
    color: "#475569",
    letterSpacing: 0.5,
  },
  queueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  queueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  queueId: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#64748B",
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
    color: "#0F172A",
  },
  queueMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
  },
  queueFooter: {
    marginTop: 6,
    alignItems: "flex-start",
  },
  primaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primaryActionBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#FFFFFF",
  },
  telemetryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 16,
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
    color: "#0F172A",
  },
  telemetrySub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "#64748B",
  },
});
