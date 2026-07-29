import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { COLORS, TYPOGRAPHY, Icon as Lucide } from "@edge/ui";
import { useRole } from "../../shell/context/RoleContext";

export function DashboardScreen() {
  const { currentRole } = useRole();

  return (
    <SafeAreaView style={styles.nativeSafeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mobileHeader}>
          <Text style={styles.badgeLabel}>MOBILE DASHBOARD</Text>
          <Text style={styles.mobileTitle}>{currentRole} Workspace</Text>
          <Text style={styles.mobileSubtitle}>Queue summary & quick actions</Text>
        </View>

        {/* Vertical KPI Cards */}
        <View style={styles.kpiStack}>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(245, 158, 11, 0.1)" }]}>
              <Lucide name="file-text" size={20} color="#F59E0B" />
            </View>
            <View style={styles.kpiText}>
              <Text style={styles.kpiValue}>124</Text>
              <Text style={styles.kpiTitle}>Pending Reviews</Text>
            </View>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(16, 185, 129, 0.1)" }]}>
              <Lucide name="check-circle" size={20} color="#10B981" />
            </View>
            <View style={styles.kpiText}>
              <Text style={styles.kpiValue}>852</Text>
              <Text style={styles.kpiTitle}>Approved Applications</Text>
            </View>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: "rgba(37, 99, 235, 0.1)" }]}>
              <Lucide name="grid" size={20} color="#2563EB" />
            </View>
            <View style={styles.kpiText}>
              <Text style={styles.kpiValue}>710</Text>
              <Text style={styles.kpiTitle}>Completed Audits</Text>
            </View>
          </View>
        </View>

        {/* Mobile Quick Action Buttons */}
        <View style={styles.actionsBox}>
          <Text style={styles.actionsTitle}>QUICK ACTIONS</Text>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <Lucide name="plus-circle" size={18} color="#2563EB" />
            <Text style={styles.actionBtnText}>Review Next Application in Queue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
            <Lucide name="download" size={18} color="#10B981" />
            <Text style={styles.actionBtnText}>Export Daily Evaluation Summary</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nativeSafeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110, // Safe padding for bottom navigation tab bar
  },
  mobileHeader: {
    marginBottom: 20,
  },
  badgeLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#2563EB",
    letterSpacing: 0.5,
  },
  mobileTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
  },
  mobileSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#64748B",
  },
  kpiStack: {
    gap: 12,
    marginBottom: 24,
  },
  kpiCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  kpiText: {
    flex: 1,
  },
  kpiValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
  },
  kpiTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
  },
  actionsBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  actionsTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#475569",
    letterSpacing: 0.5,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  actionBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#1E293B",
  },
});
