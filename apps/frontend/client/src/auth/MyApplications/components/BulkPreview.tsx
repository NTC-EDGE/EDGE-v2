import React, { useState, useMemo, ComponentProps } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { Icon } from '@edge/ui';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/theme/tokens';
import {
  BulkApplication,
  BulkApplicant,
  ApplicationStatus,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
  formatRelativeTime,
} from '../data/applicationsData';

interface BulkPreviewProps {
  app: BulkApplication;
  onBack: () => void;
}

const TABLE_PAGE_SIZE = 10;

function StatusChip({ status }: { status: ApplicationStatus }) {
  return (
    <View
      style={[
        styles.statusChip,
        { backgroundColor: getStatusBgColor(status) },
      ]}
    >
      <Text
        style={[
          styles.statusChipText,
          { color: getStatusColor(status) },
        ]}
      >
        {getStatusLabel(status)}
      </Text>
    </View>
  );
}

interface MetricCardProps {
  label: string;
  value: number;
  unit: string;
  iconName: ComponentProps<typeof Icon>['name'];
  iconColor: string;
  iconBg: string;
  rightSlot?: React.ReactNode;
}

function MetricCard({
  label,
  value,
  unit,
  iconName,
  iconColor,
  iconBg,
  rightSlot,
}: MetricCardProps) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricTop}>
        <Text style={styles.metricLabel}>{label.toUpperCase()}</Text>
        <View style={[styles.metricIconWrap, { backgroundColor: iconBg }]}>
          <Icon name={iconName} size={16} color={iconColor} />
        </View>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricUnit}>{unit}</Text>
      {rightSlot !== undefined && rightSlot !== null && (
        <View style={styles.metricRightSlot}>{rightSlot}</View>
      )}
    </View>
  );
}

export function BulkPreview({ app, onBack }: BulkPreviewProps) {
  const [tableSearch, setTableSearch] = useState('');
  const [tablePage, setTablePage]     = useState(1);

  // ── Derived counts ──────────────────────────────────────────
  const totalSubmitted = app.applicants.length;
  const approvedCount  = app.applicants.filter((a) => a.status === 'APPROVED').length;
  const declinedCount  = app.applicants.filter((a) => a.status === 'DECLINED').length;

  // ── Table filtering + pagination ────────────────────────────
  const filteredApplicants = useMemo<BulkApplicant[]>(() => {
    if (tableSearch.trim() === '') return app.applicants;
    const q = tableSearch.toLowerCase();
    return app.applicants.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.applicationType.toLowerCase().includes(q),
    );
  }, [app.applicants, tableSearch]);

  const totalTablePages = Math.max(
    1,
    Math.ceil(filteredApplicants.length / TABLE_PAGE_SIZE),
  );

  const pagedApplicants = filteredApplicants.slice(
    (tablePage - 1) * TABLE_PAGE_SIZE,
    tablePage * TABLE_PAGE_SIZE,
  );

  const handleTableSearch = (text: string) => {
    setTableSearch(text);
    setTablePage(1);
  };

  const statusColor = getStatusColor(app.status);
  const statusBg    = getStatusBgColor(app.status);

  // ── SOA slot rendered inside metric card ────────────────────
  const soaSlot =
    app.soaNumber !== null ? (
      <TouchableOpacity style={styles.viewSoaBtn} activeOpacity={0.8}>
        <Text style={styles.viewSoaBtnText}>View SOA</Text>
      </TouchableOpacity>
    ) : (
      <Text style={styles.soaPendingText}>Pending</Text>
    );

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Back link ─────────────────────────────────────── */}
      <TouchableOpacity onPress={onBack} style={styles.backLink} activeOpacity={0.7}>
        <Icon name="arrow-left" size={14} color={COLORS.brand[700]} />
        <Text style={styles.backLinkText}>BACK TO MY APPLICATIONS</Text>
      </TouchableOpacity>

      {/* ── Header card ───────────────────────────────────── */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <Text style={styles.refNumber}>
            Bulk Application #{app.referenceNumber}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {getStatusLabel(app.status).toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.headerServiceName}>{app.serviceName}</Text>

        <View style={styles.headerMeta}>
          <Text style={styles.headerCategory}>{app.serviceCategory}</Text>
          <View style={styles.bulkBadge}>
            <View style={styles.bulkDot} />
            <Text style={styles.bulkBadgeText}>BULK</Text>
          </View>
          <Text style={styles.headerTime}>
            Submitted {formatRelativeTime(app.submittedAt)}
          </Text>
        </View>
      </View>

      {/* ── 4 Metric cards ────────────────────────────────── */}
      <View style={styles.metricsRow}>
        <MetricCard
          label="Total Submitted"
          value={totalSubmitted}
          unit="applicants"
          iconName="users"
          iconColor={COLORS.brand[700]}
          iconBg={COLORS.brand[100]}
        />
        <MetricCard
          label="Approved"
          value={approvedCount}
          unit="applicants"
          iconName="check-circle"
          iconColor="#16A34A"
          iconBg="#DCFCE7"
        />
        <MetricCard
          label="Declined"
          value={declinedCount}
          unit="applicants"
          iconName="x-circle"
          iconColor="#DC2626"
          iconBg="#FEE2E2"
        />
        <View style={[styles.metricCard, styles.soaCard]}>
          <Text style={styles.metricLabel}>GENERATED DOCUMENT</Text>
          {app.soaNumber !== null ? (
            <>
              <Text style={styles.soaNumber}>{app.soaNumber}</Text>
              {soaSlot}
            </>
          ) : (
            <>
              <Text style={styles.soaNone}>—</Text>
              {soaSlot}
            </>
          )}
        </View>
      </View>

      {/* ── Info / Warning banner ─────────────────────────── */}
      <View style={styles.infoBanner}>
        <Icon name="alert-circle" size={16} color="#D97706" style={{ marginRight: 10 }} />
        <Text style={styles.infoBannerText}>
          <Text style={styles.infoBannerBold}>{approvedCount}</Text>
          {' applicants were approved and included in the Statement of Account. '}
          <Text style={styles.infoBannerBold}>{declinedCount}</Text>
          {' were declined.'}
        </Text>
      </View>

      {/* ── Applicants table ──────────────────────────────── */}
      <View style={styles.tableSection}>
        {/* Table header: title + search */}
        <View style={styles.tableSectionHeader}>
          <View style={styles.tableTitleRow}>
            <Text style={styles.tableTitle}>Applicants</Text>
            <View style={styles.approvedCountBadge}>
              <Text style={styles.approvedCountText}>{totalSubmitted}</Text>
            </View>
          </View>

          <View style={styles.tableSearchBar}>
            <Icon name="search" size={14} color={COLORS.neutral[400]} style={{ marginRight: 6 }} />
            <TextInput
              placeholder="Search applicants..."
              placeholderTextColor={COLORS.neutral[400]}
              value={tableSearch}
              onChangeText={handleTableSearch}
              style={styles.tableSearchInput}
            />
            {tableSearch.length > 0 && (
              <TouchableOpacity onPress={() => handleTableSearch('')}>
                <Icon name="x" size={14} color={COLORS.neutral[400]} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Table */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            {/* Header row */}
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <Text style={[styles.tableCell, styles.colNum, styles.tableHeaderText]}>#</Text>
              <Text style={[styles.tableCell, styles.colName, styles.tableHeaderText]}>APPLICANT NAME</Text>
              <Text style={[styles.tableCell, styles.colType, styles.tableHeaderText]}>APPLICATION TYPE</Text>
              <Text style={[styles.tableCell, styles.colStatus, styles.tableHeaderText]}>STATUS</Text>
              <Text style={[styles.tableCell, styles.colSOA, styles.tableHeaderText]}>INCLUDED IN SOA</Text>
              <Text style={[styles.tableCell, styles.colAction, styles.tableHeaderText]}>ACTION</Text>
            </View>

            {/* Data rows */}
            {pagedApplicants.length === 0 ? (
              <View style={styles.tableEmptyRow}>
                <Text style={styles.tableEmptyText}>No applicants match your search.</Text>
              </View>
            ) : (
              pagedApplicants.map((applicant, idx) => {
                const globalIdx = (tablePage - 1) * TABLE_PAGE_SIZE + idx + 1;
                return (
                  <View
                    key={applicant.id}
                    style={[
                      styles.tableRow,
                      styles.tableDataRow,
                      idx % 2 === 1 && styles.tableRowAlt,
                    ]}
                  >
                    <Text style={[styles.tableCell, styles.colNum, styles.tableCellText]}>
                      {globalIdx}
                    </Text>
                    <Text style={[styles.tableCell, styles.colName, styles.tableCellText]}>
                      {applicant.name}
                    </Text>
                    <Text style={[styles.tableCell, styles.colType, styles.tableCellText]}>
                      {applicant.applicationType}
                    </Text>
                    <View style={[styles.tableCell, styles.colStatus]}>
                      <StatusChip status={applicant.status} />
                    </View>
                    <Text style={[styles.tableCell, styles.colSOA, styles.tableCellText]}>
                      {applicant.includedInSOA ? 'Yes' : '—'}
                    </Text>
                    <View style={[styles.tableCell, styles.colAction]}>
                      <TouchableOpacity style={styles.viewDetailsBtn} activeOpacity={0.8}>
                        <Text style={styles.viewDetailsBtnText}>View Details</Text>
                        <Icon name="external-link" size={11} color={COLORS.brand[700]} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* Pagination */}
        <View style={styles.tablePagination}>
          <Text style={styles.paginationInfo}>
            Showing {Math.min(
              TABLE_PAGE_SIZE,
              filteredApplicants.length - (tablePage - 1) * TABLE_PAGE_SIZE,
            )}{' '}
            of {filteredApplicants.length} applicants
          </Text>

          <View style={styles.paginationBtns}>
            <TouchableOpacity
              onPress={() => setTablePage((p) => Math.max(1, p - 1))}
              disabled={tablePage === 1}
              style={[styles.pageBtn, tablePage === 1 && styles.pageBtnDisabled]}
            >
              <Icon name="chevron-left" size={14} color={tablePage === 1 ? COLORS.neutral[300] : COLORS.neutral[700]} />
            </TouchableOpacity>

            <Text style={styles.pageLabel}>
              Page {tablePage} of {totalTablePages}
            </Text>

            <TouchableOpacity
              onPress={() => setTablePage((p) => Math.min(totalTablePages, p + 1))}
              disabled={tablePage === totalTablePages}
              style={[styles.pageBtn, tablePage === totalTablePages && styles.pageBtnDisabled]}
            >
              <Icon name="chevron-right" size={14} color={tablePage === totalTablePages ? COLORS.neutral[300] : COLORS.neutral[700]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const COL_NUM    = 44;
const COL_NAME   = 180;
const COL_TYPE   = 150;
const COL_STATUS = 150;
const COL_SOA    = 130;
const COL_ACTION = 110;

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING[24],
    paddingBottom: 40,
  },

  // Back link
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING[20],
    ...Platform.select({ web: { cursor: 'pointer' as unknown as undefined } }),
  },
  backLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
    letterSpacing: 0.5,
  },

  // Header card
  headerCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[24],
    marginBottom: SPACING[16],
    ...Platform.select({
      web: { boxShadow: '0 1px 4px rgba(0,0,0,0.06)' as unknown as undefined },
    }),
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  refNumber: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  headerServiceName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600],
    marginBottom: 12,
    lineHeight: 20,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  headerCategory: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
  },
  bulkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 5,
  },
  bulkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
  },
  bulkBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#D97706',
  },
  headerTime: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[400],
  },

  // Metrics
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: SPACING[16],
  },
  metricCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[16],
  },
  soaCard: {
    minWidth: 160,
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  metricLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[400],
    letterSpacing: 0.6,
    flex: 1,
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    lineHeight: 38,
  },
  metricUnit: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[400],
    marginTop: 2,
  },
  metricRightSlot: {
    marginTop: 8,
  },
  soaNumber: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
    marginTop: 8,
    marginBottom: 10,
  },
  soaNone: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    color: COLORS.neutral[300],
    marginTop: 4,
    marginBottom: 10,
  },
  viewSoaBtn: {
    backgroundColor: COLORS.neutral[100],
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    ...Platform.select({ web: { cursor: 'pointer' as unknown as undefined } }),
  },
  viewSoaBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
  },
  soaPendingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[400],
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Info banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: SPACING[16],
    marginBottom: SPACING[20],
  },
  infoBannerText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  infoBannerBold: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  // Table section
  tableSection: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    overflow: 'hidden',
  },
  tableSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[16],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
    flexWrap: 'wrap',
    gap: 12,
  },
  tableTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tableTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  approvedCountBadge: {
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  approvedCountText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[700],
  },
  tableSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    minWidth: 200,
  },
  tableSearchInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[800],
    ...Platform.select({ web: { outlineWidth: 0 } as unknown as object }),
  },

  // Table
  table: {
    minWidth:
      COL_NUM + COL_NAME + COL_TYPE + COL_STATUS + COL_SOA + COL_ACTION,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableHeaderRow: {
    backgroundColor: COLORS.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  tableDataRow: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  tableRowAlt: {
    backgroundColor: COLORS.neutral[50],
  },
  tableHeaderText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[500],
    letterSpacing: 0.6,
  },
  tableCell: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  colNum:    { width: COL_NUM },
  colName:   { width: COL_NAME },
  colType:   { width: COL_TYPE },
  colStatus: { width: COL_STATUS },
  colSOA:    { width: COL_SOA },
  colAction: { width: COL_ACTION },
  tableCellText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[800],
  },
  tableEmptyRow: {
    padding: SPACING[24],
    alignItems: 'center',
  },
  tableEmptyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[400],
  },

  // Status chip inside table
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusChipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // View Details action
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...Platform.select({ web: { cursor: 'pointer' as unknown as undefined } }),
  },
  viewDetailsBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // Pagination
  tablePagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[16],
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[100],
  },
  paginationInfo: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  paginationBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pageBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' as unknown as undefined } }),
  },
  pageBtnDisabled: {
    borderColor: COLORS.neutral[100],
    backgroundColor: COLORS.neutral[50],
  },
  pageLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[700],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
