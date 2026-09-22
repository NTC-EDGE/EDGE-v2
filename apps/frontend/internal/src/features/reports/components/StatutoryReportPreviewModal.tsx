import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  Platform,
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
  SHADOWS,
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
  applications,
  transactions,
  feedback,
  userName,
  onClose,
}: StatutoryReportPreviewModalProps) {
  const { colors, isDark } = useTheme();

  if (!report) return null;

  const totalApps = applications.length;
  const approvedApps = applications.filter((a) => a.status === 'Approved').length;
  const evaluatingApps = applications.filter((a) => a.status === 'Evaluating' || a.status === 'Submitted').length;
  const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.amount ?? 0), 0);
  const avgCsat = feedback.length > 0 ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1) : '5.0';

  const handlePrint = () => {
    const html = generateStatutoryPrintableHtml(
      report,
      tenantName,
      period,
      applications,
      transactions,
      feedback,
      userName
    );
    openPrintableReportWindow(html);
  };

  const handleCsvDownload = () => {
    const { content, filename } = generateStatutoryCsv(
      report.code,
      tenantName,
      period,
      applications,
      transactions,
      feedback
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
                  {report.agency} • {report.frequency} Submission • {period}
                </Text>
              </View>
            </View>

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

          {/* Modal Body */}
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
                {tenantName || 'Regional Office No. VII - Central Visayas'}
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
                <Text style={[styles.metricSub, { color: colors.textMuted }]}>Treasury Remitted</Text>
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
                <Text style={[styles.th, { flex: 1.5, color: colors.textMuted }]}>APPLICATION #</Text>
                <Text style={[styles.th, { flex: 2, color: colors.textMuted }]}>APPLICANT</Text>
                <Text style={[styles.th, { flex: 2, color: colors.textMuted }]}>SERVICE CATEGORY</Text>
                <Text style={[styles.th, { flex: 1.2, textAlign: 'right', color: colors.textMuted }]}>STATUS</Text>
              </View>
              {applications.slice(0, 5).map((app, i) => (
                <View
                  key={app.id || i}
                  style={[
                    styles.tableRow,
                    { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] },
                    i === Math.min(applications.length, 5) - 1 && { borderBottomWidth: 0 },
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
            </View>

            {/* Official Signatories Block */}
            <View style={[styles.signatoriesCard, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: colors.border }]}>
              <Text style={[styles.signTitle, { color: colors.textMuted }]}>STATUTORY ATTESTATION & SIGNATORIES</Text>
              <View style={styles.signRow}>
                <View style={styles.signColumn}>
                  <Text style={[styles.signPerson, { color: colors.text }]}>{userName || 'Regulatory Staff'}</Text>
                  <Text style={[styles.signRole, { color: colors.textMuted }]}>Prepared by (Evaluator/Staff)</Text>
                </View>
                <View style={styles.signColumn}>
                  <Text style={[styles.signPerson, { color: colors.text }]}>Chief, EOD</Text>
                  <Text style={[styles.signRole, { color: colors.textMuted }]}>Reviewed & Verified</Text>
                </View>
                <View style={styles.signColumn}>
                  <Text style={[styles.signPerson, { color: colors.text }]}>Regional Director</Text>
                  <Text style={[styles.signRole, { color: colors.textMuted }]}>Certified Correct</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Modal Footer Actions */}
          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <Button
              variant="outline"
              size="sm"
              fullWidth={false}
              onPress={onClose}
            >
              Cancel
            </Button>

            <View style={styles.footerRightActions}>
              <Button
                variant="outline"
                size="sm"
                fullWidth={false}
                leftIcon={<Lucide name="download" size={14} color={colors.text} />}
                onPress={handleCsvDownload}
              >
                Download CSV Dataset
              </Button>
              <Button
                variant="primary"
                size="sm"
                fullWidth={false}
                leftIcon={<Lucide name="printer" size={14} color="#FFFFFF" />}
                onPress={handlePrint}
              >
                Print / Export Official Form
              </Button>
            </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[16],
  },
  modalContent: {
    width: '100%',
    maxWidth: 860,
    maxHeight: '90%',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  codeBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  headerTitleColumn: {
    flex: 1,
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginTop: 2,
  },
  closeIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
