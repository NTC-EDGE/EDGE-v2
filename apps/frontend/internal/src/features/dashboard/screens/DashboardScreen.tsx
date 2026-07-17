import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { Feather as Lucide } from '@expo/vector-icons';
import { ColumnDef } from '@tanstack/react-table';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../shared/theme/tokens';
import { MetricCard } from '../components/MetricCard';
import { DataTable, StatusBadge } from '../../shared/components/DataTable';
import { mockApplications, ApplicationData } from '../../queue/data/mockApplications';

// Columns definitions for the applications table
const columns: ColumnDef<ApplicationData, unknown>[] = [
  {
    accessorKey: 'id',
    header: 'Application ID',
    cell: (info) => <Text style={styles.idText}>{String(info.getValue())}</Text>,
    meta: { flex: 1.2 },
  },
  {
    accessorKey: 'applicant',
    header: 'Applicant Name',
    cell: (info) => <Text style={styles.cellText}>{String(info.getValue())}</Text>,
    meta: { flex: 2.2 },
  },
  {
    accessorKey: 'title',
    header: 'License Title',
    cell: (info) => <Text style={styles.cellText}>{String(info.getValue())}</Text>,
    meta: { flex: 2.6 },
  },
  {
    accessorKey: 'date',
    header: 'Date Submitted',
    cell: (info) => <Text style={styles.cellText}>{String(info.getValue())}</Text>,
    meta: { flex: 1.5 },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => <StatusBadge status={String(info.getValue())} />,
    meta: { flex: 1.5 },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => (
      <View style={styles.actionsCell}>
        <Pressable style={styles.actionIconBtn}>
          <Lucide name="eye" size={14} color={COLORS.brand[800]} />
        </Pressable>
        <Pressable style={styles.actionIconBtn}>
          <Lucide name="edit" size={14} color={COLORS.brand[800]} />
        </Pressable>
        <Pressable style={styles.actionIconBtn}>
          <Lucide name="download" size={14} color={COLORS.brand[800]} />
        </Pressable>
      </View>
    ),
    meta: { flex: 1.5 },
  },
];

export function DashboardScreen() {
  return (
    <View style={styles.container}>
      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText}>Dashboard</Text>
        <Lucide name="chevron-right" size={12} color={COLORS.neutral[400]} style={styles.breadcrumbDivider} />
        <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>Overview</Text>
      </View>

      {/* Welcome Header */}
      <View style={styles.welcomeHeader}>
        <Text style={styles.welcomeTitle}>Overview Dashboard</Text>
        <Text style={styles.welcomeSubtitle}>
          Real-time metrics monitoring, task queue summaries, and applicant registration states.
        </Text>
      </View>

      {/* KPI Cards Grid */}
      <View style={styles.kpiGrid}>
        <MetricCard
          title="Active Licenses"
          value="1,245"
          change="+4.8%"
          isPositive={true}
          iconName="shield"
          subtitle="Compared to last week"
        />
        <MetricCard
          title="Pending Queue"
          value="48"
          change="+12.5%"
          isPositive={true}
          iconName="file-text"
          subtitle="Compared to last month"
        />
        <MetricCard
          title="Revocation Audits"
          value="3"
          change="-25.0%"
          isPositive={false}
          iconName="alert-triangle"
          subtitle="Compared to last month"
        />
        <MetricCard
          title="Compliance Rate"
          value="98.6%"
          change="+0.2%"
          isPositive={true}
          iconName="check-circle"
          subtitle="Target threshold is 98.0%"
        />
      </View>

      <View style={styles.sectionSpacer} />

      {/* Recent Activity Table section */}
      <View style={styles.tableSection}>
        <View style={styles.tableHeader}>
          <Text style={styles.sectionTitle}>Recent Application Pipeline</Text>
          <Text style={styles.sectionSubtitle}>
            Full listing of submissions undergoing active review, verification, and audit sign-off.
          </Text>
        </View>
        <DataTable
          data={mockApplications}
          columns={columns}
          searchPlaceholder="Search by ID or applicant..."
          searchKey="applicant"
          statusKey="status"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[12],
  },
  breadcrumbText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
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
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[24],
    width: '100%',
  },
  sectionSpacer: {
    height: SPACING[32],
  },
  tableSection: {
    width: '100%',
  },
  tableHeader: {
    marginBottom: SPACING[16],
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[500],
    fontWeight: TYPOGRAPHY.weights.medium,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
  },
});
