import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Feather as Lucide } from "@expo/vector-icons";
import { ColumnDef } from "@tanstack/react-table";
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, DataTable, StatusBadge } from "@edge/ui";
import { mockApplications, ApplicationData } from "../data/mockApplications";

const columns: ColumnDef<ApplicationData, unknown>[] = [
  {
    accessorKey: "id",
    header: "Application ID",
    cell: (info) => (
      <Text style={styles.idText}>{String(info.getValue())}</Text>
    ),
    meta: { flex: 1.2 },
  },
  {
    accessorKey: "applicant",
    header: "Applicant Name",
    cell: (info) => (
      <Text style={styles.cellText}>{String(info.getValue())}</Text>
    ),
    meta: { flex: 2.2 },
  },
  {
    accessorKey: "title",
    header: "License Title",
    cell: (info) => (
      <Text style={styles.cellText}>{String(info.getValue())}</Text>
    ),
    meta: { flex: 2.6 },
  },
  {
    accessorKey: "date",
    header: "Date Submitted",
    cell: (info) => (
      <Text style={styles.cellText}>{String(info.getValue())}</Text>
    ),
    meta: { flex: 1.5 },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => <StatusBadge status={String(info.getValue())} />,
    meta: { flex: 1.5 },
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => (
      <View style={styles.actionsCell}>
        <Pressable style={styles.actionIconBtn}>
          <Lucide name="eye" size={14} color={COLORS.brand[800]} />
        </Pressable>
        <Pressable style={styles.actionIconBtn}>
          <Lucide name="edit" size={14} color={COLORS.brand[800]} />
        </Pressable>
        <Pressable style={styles.actionIconBtn}>
          <Lucide name="check-square" size={14} color={COLORS.brand[800]} />
        </Pressable>
      </View>
    ),
    meta: { flex: 1.5 },
  },
];

export function QueueScreen() {
  return (
    <View style={styles.container}>
      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText}>Dashboard</Text>
        <Lucide
          name="chevron-right"
          size={12}
          color={COLORS.neutral[400]}
          style={styles.breadcrumbDivider}
        />
        <Text style={styles.breadcrumbText}>Queue</Text>
        <Lucide
          name="chevron-right"
          size={12}
          color={COLORS.neutral[400]}
          style={styles.breadcrumbDivider}
        />
        <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>
          Submissions
        </Text>
      </View>

      {/* Welcome Header */}
      <View style={styles.welcomeHeader}>
        <Text style={styles.welcomeTitle}>Application Queue</Text>
        <Text style={styles.welcomeSubtitle}>
          Evaluation and verification processing area
        </Text>
      </View>

      {/* Main Table section */}
      <View style={styles.tableSection}>
        <DataTable
          data={mockApplications}
          columns={columns}
          searchPlaceholder="Search by title or ID..."
          searchKey="title"
          statusKey="status"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING[12],
  },
  breadcrumbText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  breadcrumbDivider: {
    marginHorizontal: 8,
  },
  breadcrumbActive: {
    color: COLORS.brand[700],
  },
  welcomeHeader: {
    marginBottom: SPACING[32],
  },
  welcomeTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 36,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    color: COLORS.neutral[500],
    fontWeight: TYPOGRAPHY.weights.regular,
  },
  tableSection: {
    width: "100%",
  },
  idText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  cellText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[700],
  },
  actionsCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.neutral.white,
  },
});
