import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  Platform,
  TextInput,
} from 'react-native';
import {
  COLORS,
  useTheme,
  Button,
  Icon as Lucide,
  AnimatedCard,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  DatePickerInput,
} from '@edge/ui';
import { StatutoryReportMetadata } from '../types/statutoryReports';
import { ApplicationSummaryDto, TenantTransactionDto, FeedbackDto } from '@edge/api';
import {
  generateStatutoryCsv,
  downloadCsvFile,
  generateStatutoryPrintableHtml,
  openPrintableReportWindow,
} from '../utils/statutoryReportGenerator';

export interface StatutoryReportPreviewModalProps {
  visible: boolean;
  report: StatutoryReportMetadata | null;
  tenantName: string;
  period: string;
  startDate?: string;
  endDate?: string;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
  applications: ApplicationSummaryDto[];
  transactions: TenantTransactionDto[];
  feedback: FeedbackDto[];
  userName?: string | null;
  onClose: () => void;
}

export function StatutoryReportPreviewModal({
  visible,
  report,
  tenantName,
  period,
  startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
  endDate = new Date().toISOString().slice(0, 10),
  onDateRangeChange,
  applications,
  transactions,
  feedback,
  userName,
  onClose,
}: StatutoryReportPreviewModalProps) {
  const { colors, isDark } = useTheme();

  // View mode tab state: official document preview vs quick data summary
  const [viewMode, setViewMode] = useState<'document' | 'summary'>('document');

  // Local date range state for interactive in-modal filtering
  const [localStartDate, setLocalStartDate] = useState<string>(startDate);
  const [localEndDate, setLocalEndDate] = useState<string>(endDate);
  const [activeDateRange, setActiveDateRange] = useState<{ start: string; end: string }>({
    start: startDate,
    end: endDate,
  });

  // Filter records within active date range
  const filteredApps = useMemo(() => {
    if (!activeDateRange.start || !activeDateRange.end) return applications;
    const s = new Date(activeDateRange.start);
    const e = new Date(activeDateRange.end);
    e.setHours(23, 59, 59, 999);

    return applications.filter((app) => {
      if (app.createdAt === null || app.createdAt === undefined || app.createdAt.trim().length === 0) {
        return false;
      }
      const d = new Date(app.createdAt);
      if (isNaN(d.getTime())) return false;
      return d >= s && d <= e;
    });
  }, [applications, activeDateRange]);

  const filteredTx = useMemo(() => {
    if (!activeDateRange.start || !activeDateRange.end) return transactions;
    const s = new Date(activeDateRange.start);
    const e = new Date(activeDateRange.end);
    e.setHours(23, 59, 59, 999);

    return transactions.filter((tx) => {
      if (tx.date === null || tx.date === undefined || tx.date.trim().length === 0) {
        return false;
      }
      const d = new Date(tx.date);
      if (isNaN(d.getTime())) return false;
      return d >= s && d <= e;
    });
  }, [transactions, activeDateRange]);

  if (report === null || report === undefined) return null;

  const totalApps = filteredApps.length;
  const approvedApps = filteredApps.filter((a) => a.status === 'Approved' || a.status === 'Completed').length;
  const evaluatingApps = filteredApps.filter((a) => a.status === 'Evaluating' || a.status === 'Submitted').length;
  const totalRevenue = filteredTx.reduce((sum, tx) => sum + (tx.amount ?? 0), 0);
  const avgCsat = feedback.length > 0 ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1) : '5.0';

  const effectivePeriod = activeDateRange.start && activeDateRange.end
    ? `${activeDateRange.start} to ${activeDateRange.end}`
    : period;

  const handleApplyDateRange = () => {
    setActiveDateRange({
      start: localStartDate,
      end: localEndDate,
    });
    if (onDateRangeChange !== undefined) {
      onDateRangeChange(localStartDate, localEndDate);
    }
  };

  const printableHtml = useMemo(() => {
    return generateStatutoryPrintableHtml(
      report,
      tenantName,
      effectivePeriod,
      filteredApps,
      filteredTx,
      feedback,
      userName,
      { startDate: activeDateRange.start, endDate: activeDateRange.end }
    );
  }, [report, tenantName, effectivePeriod, filteredApps, filteredTx, feedback, userName, activeDateRange]);

  const handlePrint = () => {
    openPrintableReportWindow(printableHtml);
  };

  const handleCsvDownload = () => {
    const { content, filename } = generateStatutoryCsv(
      report.code,
      tenantName,
      effectivePeriod,
      filteredApps,
      filteredTx,
      feedback,
      { startDate: activeDateRange.start, endDate: activeDateRange.end }
    );
    downloadCsvFile(content, filename);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.cardBg, borderColor: colors.border },
          ]}
        >
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.codeBadge, { backgroundColor: `${report.badgeColor}20`, borderColor: report.badgeColor }]}>
                <Text style={[styles.codeBadgeText, { color: report.badgeColor }]}>{report.code}</Text>
              </View>
              <View style={styles.headerTitleColumn}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{report.title}</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  {report.agency} • {report.frequency} Submission • {effectivePeriod}
                </Text>
              </View>
            </View>

            <View style={styles.modalHeaderRightActions}>
              <Button
                variant="outline"
                size="sm"
                fullWidth={false}
                leftIcon={<Lucide name="download" size={13} color={colors.text} />}
                onPress={handleCsvDownload}
              >
                CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                fullWidth={false}
                leftIcon={<Lucide name="printer" size={14} color="#FFFFFF" />}
                onPress={handlePrint}
              >
                Print / PDF Report
              </Button>
              <Pressable
                style={({ pressed }) => [
                  styles.closeIconBtn,
                  pressed && { opacity: 0.7 },
                  Platform.select({ web: { cursor: 'pointer' } }),
                ]}
                onPress={onClose}
              >
                <Lucide name="x" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>

          {/* Interactive Date Range & Tenant Isolation Bar */}
          <View style={[styles.filterBar, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderBottomColor: colors.border }]}>
            {/* Regional Tenant Context */}
            <View style={styles.tenantBadge}>
              <Lucide name="map-pin" size={14} color={isDark ? colors.brand[500] : colors.brand.primary} />
              <Text style={[styles.tenantBadgeText, { color: colors.text }]}>{tenantName}</Text>
            </View>

            {/* Date Range Selection */}
            <View style={styles.datePickerRow}>
              <View style={styles.dateField}>
                <Text style={[styles.dateLabel, { color: colors.textMuted }]}>FROM:</Text>
                <View style={{ minWidth: 160 }}>
                  <DatePickerInput
                    value={localStartDate}
                    onChangeText={setLocalStartDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>

              <View style={styles.dateField}>
                <Text style={[styles.dateLabel, { color: colors.textMuted }]}>TO:</Text>
                <View style={{ minWidth: 160 }}>
                  <DatePickerInput
                    value={localEndDate}
                    onChangeText={setLocalEndDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>

              <Button
                variant="outline"
                size="sm"
                fullWidth={false}
                onPress={handleApplyDateRange}
                leftIcon={<Lucide name="filter" size={12} color={colors.text} />}
              >
                Apply Range
              </Button>
            </View>
          </View>

          {/* View Mode Tabs */}
          <View style={[styles.tabBar, { borderBottomColor: colors.border, backgroundColor: isDark ? colors.neutral[900] : colors.cardBg }]}>
            <Pressable
              style={[
                styles.tabBtn,
                viewMode === 'document' && [styles.tabBtnActive, { borderBottomColor: isDark ? colors.brand[500] : colors.brand.primary }],
                Platform.select({ web: { cursor: 'pointer' } }),
              ]}
              onPress={() => setViewMode('document')}
            >
              <Lucide
                name="file-text"
                size={14}
                color={viewMode === 'document' ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: viewMode === 'document' ? colors.text : colors.textMuted },
                  viewMode === 'document' && { fontWeight: TYPOGRAPHY.weights.bold },
                ]}
              >
                Official Document Preview
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.tabBtn,
                viewMode === 'summary' && [styles.tabBtnActive, { borderBottomColor: isDark ? colors.brand[500] : colors.brand.primary }],
                Platform.select({ web: { cursor: 'pointer' } }),
              ]}
              onPress={() => setViewMode('summary')}
            >
              <Lucide
                name="bar-chart-2"
                size={14}
                color={viewMode === 'summary' ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  { color: viewMode === 'summary' ? colors.text : colors.textMuted },
                  viewMode === 'summary' && { fontWeight: TYPOGRAPHY.weights.bold },
                ]}
              >
                Summary & Analytics
              </Text>
            </Pressable>
          </View>

          {/* Modal Body / Document Preview */}
          {viewMode === 'document' ? (
            <View style={styles.documentPreviewContainer}>
              {Platform.OS === 'web' ? (
                React.createElement('iframe', {
                  srcDoc: printableHtml,
                  title: `${report.title} Live Preview`,
                  style: {
                    width: '100%',
                    height: 660,
                    border: 'none',
                    backgroundColor: '#FFFFFF',
                  },
                })
              ) : (
                <ScrollView
                  style={styles.modalBody}
                  contentContainerStyle={styles.modalBodyScroll}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={[styles.govHeaderBanner, { backgroundColor: isDark ? colors.neutral[900] : '#F8FAFC', borderColor: colors.border }]}>
                    <Text style={[styles.govRepText, { color: colors.textMuted }]}>
                      REPUBLIC OF THE PHILIPPINES • OFFICE OF THE PRESIDENT
                    </Text>
                    <Text style={[styles.govAgencyText, { color: colors.text }]}>
                      NATIONAL TELECOMMUNICATIONS COMMISSION
                    </Text>
                    <Text style={[styles.govTenantText, { color: isDark ? colors.brand[500] : colors.brand.primary }]}>
                      {tenantName}
                    </Text>
                  </View>
                  <View style={[styles.infoCard, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: colors.border }]}>
                    <Text style={[styles.infoVal, { color: colors.text, textAlign: 'center' }]}>
                      High-fidelity government print template ready. Tap &quot;Print / PDF Report&quot; below to generate the official printable document.
                    </Text>
                  </View>
                </ScrollView>
              )}
            </View>
          ) : (
          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Republic Header Banner */}
            <View style={[styles.govHeaderBanner, { backgroundColor: isDark ? colors.neutral[900] : '#F8FAFC', borderColor: colors.border }]}>
              <Text style={[styles.govRepText, { color: colors.textMuted }]}>
                REPUBLIC OF THE PHILIPPINES • OFFICE OF THE PRESIDENT
              </Text>
              <Text style={[styles.govAgencyText, { color: colors.text }]}>
                NATIONAL TELECOMMUNICATIONS COMMISSION
              </Text>
              <Text style={[styles.govTenantText, { color: isDark ? colors.brand[500] : colors.brand.primary }]}>
                {tenantName}
              </Text>
            </View>

            {/* Statutory Overview */}
            <View style={[styles.infoCard, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: colors.border }]}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>LEGAL AUTHORITY:</Text>
                <Text style={[styles.infoVal, { color: colors.text }]}>{report.legalBasis}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>PURPOSE:</Text>
                <Text style={[styles.infoVal, { color: colors.text }]}>{report.description}</Text>
              </View>
            </View>

            {/* Live Metrics Computed */}
            <View style={styles.metricsGrid}>
              <View style={[styles.metricBox, { backgroundColor: isDark ? colors.neutral[900] : colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Applications</Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>{totalApps}</Text>
                <Text style={[styles.metricSub, { color: COLORS.semantic.success }]}>{approvedApps} Approved</Text>
              </View>

              <View style={[styles.metricBox, { backgroundColor: isDark ? colors.neutral[900] : colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>In Progress</Text>
                <Text style={[styles.metricValue, { color: isDark ? colors.brand[500] : colors.brand.primary }]}>{evaluatingApps}</Text>
                <Text style={[styles.metricSub, { color: colors.textMuted }]}>Technical Queue</Text>
              </View>

              <View style={[styles.metricBox, { backgroundColor: isDark ? colors.neutral[900] : colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Collections</Text>
                <Text style={[styles.metricValue, { color: COLORS.semantic.warning }]}>
                  ₱{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Text>
                <Text style={[styles.metricSub, { color: colors.textMuted }]}>Recorded Period</Text>
              </View>

              <View style={[styles.metricBox, { backgroundColor: isDark ? colors.neutral[900] : colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>CSAT</Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>{avgCsat} ★</Text>
                <Text style={[styles.metricSub, { color: colors.textMuted }]}>{feedback.length} Submissions</Text>
              </View>
            </View>

            {/* Sample Table Preview */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Itemized Submission Sample (Top Entries)</Text>
            <View style={[styles.tableCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <View style={[styles.tableHeader, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100], borderBottomColor: colors.border }]}>
                <Text style={[styles.th, { flex: 1.5, color: colors.textMuted }]}>APPLICATION / REF #</Text>
                <Text style={[styles.th, { flex: 2, color: colors.textMuted }]}>APPLICANT</Text>
                <Text style={[styles.th, { flex: 2, color: colors.textMuted }]}>SERVICE CATEGORY</Text>
                <Text style={[styles.th, { flex: 1.2, textAlign: 'right', color: colors.textMuted }]}>STATUS</Text>
              </View>
              {filteredApps.slice(0, 5).map((app, i) => (
                <View
                  key={app.id || i}
                  style={[
                    styles.tableRow,
                    { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] },
                    i === Math.min(filteredApps.length, 5) - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <Text style={[styles.td, { flex: 1.5, color: colors.text, fontWeight: '600' }]}>
                    {app.applicationNumber || app.id}
                  </Text>
                  <Text style={[styles.td, { flex: 2, color: colors.text }]}>
                    {app.filingUser?.name ?? app.filingUser?.company?.name ?? 'Applicant'}
                  </Text>
                  <Text style={[styles.td, { flex: 2, color: colors.textMuted }]}>
                    {app.serviceName || app.serviceCategory || 'Radio Permit'}
                  </Text>
                  <Text style={[styles.td, { flex: 1.2, textAlign: 'right', color: app.status === 'Approved' ? COLORS.semantic.success : (isDark ? colors.brand[500] : colors.brand.primary), fontWeight: '600' }]}>
                    {app.status || 'Submitted'}
                  </Text>
                </View>
              ))}
              {filteredApps.length === 0 && (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>No transactions found for the selected date range.</Text>
                </View>
              )}
            </View>

            {/* Official Signatories Block */}
            <View style={[styles.signatoriesCard, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: colors.border }]}>
              <Text style={[styles.signTitle, { color: colors.textMuted }]}>STATUTORY ATTESTATION & SIGNATORIES</Text>
              <View style={styles.signRow}>
                <View style={styles.signColumn}>
                  <Text style={[styles.signPerson, { color: colors.text }]}>
                    {userName || 'Regional Regulatory Evaluator'}
                  </Text>
                  <Text style={[styles.signRole, { color: colors.textMuted }]}>Prepared by (Evaluator)</Text>
                </View>
                <View style={styles.signColumn}>
                  <Text style={[styles.signPerson, { color: colors.text }]}>
                    Chief, Enforcement & Operations (EOD)
                  </Text>
                  <Text style={[styles.signRole, { color: colors.textMuted }]}>Reviewed & Verified by</Text>
                </View>
                <View style={styles.signColumn}>
                  <Text style={[styles.signPerson, { color: colors.text }]}>Regional Director / OIC</Text>
                  <Text style={[styles.signRole, { color: colors.textMuted }]}>Certified Correct & Submitted</Text>
                </View>
              </View>
            </View>
          </ScrollView>
          )}

          {/* Modal Footer */}
          <View style={[styles.modalFooter, { borderTopColor: colors.border, backgroundColor: isDark ? colors.neutral[900] : colors.cardBg, justifyContent: 'flex-end' }]}>
            <Button
              variant="outline"
              size="sm"
              fullWidth={false}
              onPress={onClose}
            >
              Close Preview
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalContent: {
    width: '96%',
    maxWidth: 1340,
    maxHeight: '92%',
    borderRadius: RADIUS.dialog,
    borderWidth: 1,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  modalHeaderRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flex: 1,
  },
  codeBadge: {
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.xs,
    borderWidth: 1,
  },
  codeBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  headerTitleColumn: {
    flex: 1,
    gap: 2,
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  closeIconBtn: {
    padding: SPACING[6],
    borderRadius: RADIUS.circle,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: SPACING[20],
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
    paddingVertical: SPACING[10],
    paddingHorizontal: SPACING[12],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {},
  tabBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  documentPreviewContainer: {
    flex: 1,
    minHeight: 660,
    backgroundColor: '#FFFFFF',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[10],
    borderBottomWidth: 1,
    flexWrap: 'wrap',
    gap: SPACING[10],
  },
  tenantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
  },
  tenantBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    flexWrap: 'wrap',
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[4],
  },
  dateLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  dateInput: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    minWidth: 100,
  },
  modalBody: {
    flex: 1,
  },
  modalBodyScroll: {
    padding: SPACING[20],
    gap: SPACING[16],
  },
  govHeaderBanner: {
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    alignItems: 'center',
    gap: 3,
  },
  govRepText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.8,
  },
  govAgencyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.3,
  },
  govTenantText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  infoCard: {
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  infoLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    width: 120,
  },
  infoVal: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: SPACING[10],
    flexWrap: 'wrap',
  },
  metricBox: {
    flex: 1,
    minWidth: 140,
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: 2,
  },
  metricLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  metricSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
  },
  tableCard: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
  },
  th: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  td: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
  },
  signatoriesCard: {
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[10],
  },
  signTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  signRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING[12],
  },
  signColumn: {
    flex: 1,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#94A3B8',
    paddingTop: 4,
  },
  signPerson: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  signRole: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderTopWidth: 1,
    flexWrap: 'wrap',
    gap: SPACING[10],
  },
  footerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
});
