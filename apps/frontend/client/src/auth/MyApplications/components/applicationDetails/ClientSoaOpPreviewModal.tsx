import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  useWindowDimensions,
} from 'react-native';
import {
  Icon,
  SPACING,
  TYPOGRAPHY,
} from '@edge/ui';
import { applicationService } from '@edge/api';
import { Application } from '../../data/applicationsData';
import {
  generateSoaPrintableHtml,
  generateOpPrintableHtml,
  openPrintableDocumentWindow,
  formatAddress,
  formatCurrency,
  numberToWords,
  getEffectiveApplicantName,
  getEffectiveLineItems,
  getEffectiveTotalAmount,
} from '../../utils/clientSoaReportGenerator';

export type ClientReportTab = 'soa' | 'op';

interface ClientSoaOpPreviewModalProps {
  visible: boolean;
  app: Application;
  initialTab?: ClientReportTab;
  onClose: () => void;
  onProceedToPayment?: () => void;
}

export function ClientSoaOpPreviewModal({
  visible,
  app,
  initialTab = 'soa',
  onClose,
  onProceedToPayment,
}: ClientSoaOpPreviewModalProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [activeTab, setActiveTab] = useState<ClientReportTab>(initialTab);

  React.useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);

  if (!visible) return null;

  const refNum = app.referenceNumber || (app.id ? app.id.slice(0, 8).toUpperCase() : 'NTC-REF');
  const soaNum = app.soaNumber || `SOA-${refNum}`;
  const opNum = app.opNumber || `OP-${refNum}`;
  const applicantName = getEffectiveApplicantName(app);
  const applicantType = app.mode === 'BULK' ? 'Corporate / Bulk Entity' : 'Individual';
  const contactNum = app.mobileNumber || 'N/A';
  const emailAddr = app.email || 'N/A';
  const formattedAddr = formatAddress(app);
  const lineItems = getEffectiveLineItems(app);
  const totalAmount = getEffectiveTotalAmount(app);
  const wordsTotal = numberToWords(totalAmount);
  const officeName = app.office || 'National Telecommunications Commission';
  const serviceName = app.serviceName || 'Application Services';
  const categoryName = app.serviceCategory || 'General';
  const filingMode = app.mode === 'BULK' ? 'Bulk Application' : 'Single Application';
  const dueDateFormatted = app.dueDate
    ? new Date(app.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '30 days from issuance';

  const handlePrint = () => {
    if (typeof app.id === 'string' && app.id.trim().length > 0) {
      const url = activeTab === 'soa'
        ? applicationService.getSoaPrintUrl(app.id)
        : applicationService.getOpPrintUrl(app.id);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const printWin = window.open(url, '_blank');
        if (printWin !== null) {
          printWin.focus();
          return;
        }
      }
    }
    if (activeTab === 'soa') {
      const html = generateSoaPrintableHtml(app);
      openPrintableDocumentWindow(html);
    } else {
      const html = generateOpPrintableHtml(app);
      openPrintableDocumentWindow(html);
    }
  };

  const handleDownloadPdf = () => {
    if (typeof app.id !== 'string' || app.id.trim().length === 0) return;
    if (activeTab === 'soa') {
      const url = applicationService.getSoaPrintUrl(app.id);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(url, '_blank');
      } else {
        void Linking.openURL(url);
      }
    } else {
      const url = applicationService.getOpPrintUrl(app.id);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(url, '_blank');
      } else {
        void Linking.openURL(url);
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { maxWidth: 840, width: '100%' }]}>
          {/* Top Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconCircle}>
                <Icon name="file-text" size={20} color="#0284C7" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Official Billing Assessment</Text>
                <Text style={styles.modalSubtitle}>
                  Ref #{refNum} • {applicantName}
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.printBtn, { backgroundColor: '#0369A1' }]}
                onPress={handleDownloadPdf}
                activeOpacity={0.75}
              >
                <Icon name="download" size={15} color="#FFFFFF" />
                <Text style={styles.printBtnText}>Official PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.printBtn, { backgroundColor: '#0284C7' }]}
                onPress={handlePrint}
                activeOpacity={0.75}
              >
                <Icon name="printer" size={15} color="#FFFFFF" />
                <Text style={styles.printBtnText}>
                  {Platform.OS === 'web' ? 'Print / Download' : 'Print Document'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={8} activeOpacity={0.7}>
                <Icon name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Document Tab Switcher */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'soa' && styles.tabItemActiveSoa]}
              onPress={() => setActiveTab('soa')}
              activeOpacity={0.75}
            >
              <Icon
                name="file-text"
                size={15}
                color={activeTab === 'soa' ? '#0369A1' : '#64748B'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'soa' && styles.tabTextActiveSoa,
                ]}
              >
                Statement of Account (SOA)
              </Text>
              <View style={[styles.tabBadge, activeTab === 'soa' ? styles.tabBadgeActiveSoa : styles.tabBadgeInactive]}>
                <Text style={[styles.tabBadgeText, activeTab === 'soa' ? styles.tabBadgeTextActiveSoa : styles.tabBadgeTextInactive]}>
                  {soaNum}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'op' && styles.tabItemActiveOp]}
              onPress={() => setActiveTab('op')}
              activeOpacity={0.75}
            >
              <Icon
                name="credit-card"
                size={15}
                color={activeTab === 'op' ? '#047857' : '#64748B'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'op' && styles.tabTextActiveOp,
                ]}
              >
                Order of Payment (OP)
              </Text>
              <View style={[styles.tabBadge, activeTab === 'op' ? styles.tabBadgeActiveOp : styles.tabBadgeInactive]}>
                <Text style={[styles.tabBadgeText, activeTab === 'op' ? styles.tabBadgeTextActiveOp : styles.tabBadgeTextInactive]}>
                  {opNum}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Document Printable View Container */}
          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.paperContainer}>
              {/* Agency Header */}
              <View style={styles.republicHeader}>
                <Text style={styles.republicTitle}>Republic of the Philippines</Text>
                <Text style={styles.agencyTitle}>NATIONAL TELECOMMUNICATIONS COMMISSION</Text>
                <Text style={[styles.officeTitle, activeTab === 'op' && { color: '#059669' }]}>
                  {officeName}
                </Text>
              </View>

              {activeTab === 'soa' ? (
                /* ─────────────────────────────────────────────────────────────
                   Statement of Account (SOA) Body View
                   ───────────────────────────────────────────────────────────── */
                <View>
                  <View style={styles.soaBanner}>
                    <View>
                      <Text style={styles.bannerTitle}>STATEMENT OF ACCOUNT (SOA)</Text>
                      <Text style={styles.bannerSubtitle}>
                        Official Regulatory Fee Assessment &amp; Schedule
                      </Text>
                    </View>
                    <View style={styles.bannerRight}>
                      <Text style={styles.bannerDocNum}>{soaNum}</Text>
                      <Text style={styles.bannerDate}>
                        Issued: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </View>
                  </View>

                  {/* Info Grid */}
                  <View style={[styles.infoGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
                    <View style={[styles.infoCard, { flex: 1 }]}>
                      <Text style={styles.infoCardTitle}>Billed To (Payor / Applicant)</Text>
                      <Text style={styles.infoCardName}>{applicantName}</Text>
                      <Text style={styles.infoCardDetail}>
                        <Text style={styles.boldText}>Type:</Text> {applicantType} •{' '}
                        <Text style={styles.boldText}>Contact:</Text> {contactNum}
                      </Text>
                      <Text style={styles.infoCardDetail}>
                        <Text style={styles.boldText}>Email:</Text> {emailAddr}
                      </Text>
                      <Text style={styles.infoCardDetail}>
                        <Text style={styles.boldText}>Address:</Text> {formattedAddr}
                      </Text>
                    </View>

                    <View style={[styles.infoCard, { flex: 1 }]}>
                      <Text style={styles.infoCardTitle}>Application Reference</Text>
                      <Text style={[styles.infoCardName, { color: '#0284C7', fontFamily: 'monospace' }]}>
                        Ref #{refNum}
                      </Text>
                      <Text style={styles.infoCardDetail}>
                        <Text style={styles.boldText}>Service:</Text> {serviceName}
                      </Text>
                      <Text style={styles.infoCardDetail}>
                        <Text style={styles.boldText}>Category / Mode:</Text> {categoryName} • {filingMode}
                      </Text>
                      <View style={styles.dueDateBadgeRow}>
                        <Text style={styles.dueDateLabel}>Due Date:</Text>
                        <View style={styles.dueDateBadge}>
                          <Text style={styles.dueDateBadgeText}>{dueDateFormatted}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Assessment Line Items Table */}
                  <View style={styles.tableWrapper}>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.thCell, { width: 32, textAlign: 'center' }]}>#</Text>
                      <Text style={[styles.thCell, { width: 100 }]}>Item Code</Text>
                      <Text style={[styles.thCell, { flex: 3 }]}>Particulars / Description</Text>
                      <Text style={[styles.thCell, { width: 65, textAlign: 'center' }]}>Validity</Text>
                      <Text style={[styles.thCell, { width: 55, textAlign: 'center' }]}>Units</Text>
                      <Text style={[styles.thCell, { width: 85, textAlign: 'right' }]}>Rate (PHP)</Text>
                      <Text style={[styles.thCell, { width: 95, textAlign: 'right' }]}>Amount (PHP)</Text>
                    </View>

                    {lineItems.map((item, idx) => {
                      const validityYears = typeof item.validityYears === 'number' && item.validityYears > 0 ? item.validityYears : 1;
                      const units = typeof item.noOfUnits === 'number' && item.noOfUnits > 0 ? item.noOfUnits : 1;
                      const rate = typeof item.feeRate === 'number' && !isNaN(item.feeRate) ? item.feeRate : (item.amount / units);
                      const amount = typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : rate * units;

                      return (
                        <View key={item.id || idx} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowEven]}>
                          <Text style={[styles.tdCell, { width: 32, textAlign: 'center', color: '#64748B' }]}>
                            {idx + 1}
                          </Text>
                          <Text style={[styles.tdCell, { width: 100, fontFamily: 'monospace', color: '#0284C7', fontWeight: '600' }]}>
                            {item.itemCode || 'NTC-FEE'}
                          </Text>
                          <View style={{ flex: 3, paddingVertical: 2 }}>
                            <Text style={styles.tdParticularName}>{item.particular}</Text>
                            <Text style={styles.tdParticularSub}>Validity: {validityYears} Year(s)</Text>
                          </View>
                          <Text style={[styles.tdCell, { width: 65, textAlign: 'center' }]}>{validityYears} yr</Text>
                          <Text style={[styles.tdCell, { width: 55, textAlign: 'center' }]}>{units}</Text>
                          <Text style={[styles.tdCell, { width: 85, textAlign: 'right' }]}>
                            {formatCurrency(rate).replace('PHP ', '')}
                          </Text>
                          <Text style={[styles.tdCell, { width: 95, textAlign: 'right', fontWeight: '700', color: '#0F172A' }]}>
                            {formatCurrency(amount).replace('PHP ', '')}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Total Assessment Due Card */}
                  <View style={styles.totalCard}>
                    <View style={styles.totalRow}>
                      <View style={{ flex: 1, paddingRight: 12 }}>
                        <Text style={styles.totalHeaderLabel}>TOTAL ASSESSMENT DUE</Text>
                        <Text style={styles.totalInWords}>{wordsTotal}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.totalFigure}>{formatCurrency(totalAmount)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Payment Advisory */}
                  <View style={styles.guidelinesBox}>
                    <View style={styles.guidelinesHeader}>
                      <Icon name="info" size={15} color="#166534" />
                      <Text style={styles.guidelinesTitle}>PAYMENT ADVISORY &amp; GUIDELINES:</Text>
                    </View>
                    <Text style={styles.guidelineItem}>
                      1. Please settle the assessed amount on or before the indicated due date ({dueDateFormatted}) to avoid statutory surcharges.
                    </Text>
                    <Text style={styles.guidelineItem}>
                      2. Official payments may be settled via Land Bank of the Philippines, NTC Regional Cashier, or authorized online portals.
                    </Text>
                    <Text style={styles.guidelineItem}>
                      3. Always present this Statement of Account Reference Number (<Text style={styles.boldText}>{soaNum}</Text>) upon payment.
                    </Text>
                  </View>

                  {/* Signatories */}
                  <View style={[styles.signatoriesRow, { flexDirection: isDesktop ? 'row' : 'column', gap: 20 }]}>
                    <View style={styles.sigBlock}>
                      <Text style={styles.sigName}>REGIONAL ASSESSING OFFICER</Text>
                      <Text style={styles.sigRole}>Assessed &amp; Prepared By</Text>
                    </View>
                    <View style={styles.sigBlock}>
                      <Text style={styles.sigName}>CHIEF, ENFORCEMENT &amp; OPERATIONS</Text>
                      <Text style={styles.sigRole}>Noted &amp; Certified Correct</Text>
                    </View>
                  </View>
                </View>
              ) : (
                /* ─────────────────────────────────────────────────────────────
                   Order of Payment (OP) Body View
                   ───────────────────────────────────────────────────────────── */
                <View>
                  <View style={styles.opBanner}>
                    <View>
                      <Text style={styles.bannerTitle}>ORDER OF PAYMENT (OP)</Text>
                      <Text style={styles.bannerSubtitle}>
                        Official Treasury &amp; Cashier Payment Authorization
                      </Text>
                    </View>
                    <View style={styles.bannerRight}>
                      <Text style={[styles.bannerDocNum, { color: '#6EE7B7' }]}>{opNum}</Text>
                      <Text style={[styles.bannerDate, { color: '#D1FAE5' }]}>
                        Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </View>
                  </View>

                  {/* Payor & Application Profile Card */}
                  <View style={styles.opInfoCard}>
                    <View style={styles.opInfoRow}>
                      <Text style={styles.opInfoLabel}>Payor / Applicant Name:</Text>
                      <Text style={styles.opInfoValue}>{applicantName}</Text>
                    </View>
                    <View style={styles.opInfoRow}>
                      <Text style={styles.opInfoLabel}>Application Reference:</Text>
                      <Text style={[styles.opInfoValue, { color: '#059669', fontFamily: 'monospace' }]}>
                        Ref #{refNum}
                      </Text>
                    </View>
                    <View style={styles.opInfoRow}>
                      <Text style={styles.opInfoLabel}>Service &amp; Category:</Text>
                      <Text style={styles.opInfoValue}>
                        {categoryName && categoryName !== serviceName && categoryName !== 'General'
                          ? `${serviceName} (${categoryName})`
                          : serviceName}
                      </Text>
                    </View>
                    <View style={styles.opInfoRow}>
                      <Text style={styles.opInfoLabel}>Filing Mode:</Text>
                      <Text style={styles.opInfoValue}>{filingMode}</Text>
                    </View>
                  </View>

                  {/* Nature of Collection Table */}
                  <View style={styles.tableWrapper}>
                    <View style={[styles.tableHeader, { backgroundColor: '#F0FDF4' }]}>
                      <Text style={[styles.thCell, { width: 40, textAlign: 'center' }]}>#</Text>
                      <Text style={[styles.thCell, { flex: 1 }]}>Nature of Collection / Particulars</Text>
                      <Text style={[styles.thCell, { width: 140, textAlign: 'right' }]}>Amount (PHP)</Text>
                    </View>

                    {lineItems.map((item, idx) => {
                      const amount = typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : 0;
                      return (
                        <View key={item.id || idx} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowEven]}>
                          <Text style={[styles.tdCell, { width: 40, textAlign: 'center', color: '#64748B' }]}>
                            {idx + 1}
                          </Text>
                          <View style={{ flex: 1, paddingVertical: 2 }}>
                            <Text style={styles.tdParticularName}>{item.particular}</Text>
                            <Text style={styles.tdParticularSub}>Code: {item.itemCode || 'NTC-FEE'}</Text>
                          </View>
                          <Text style={[styles.tdCell, { width: 140, textAlign: 'right', fontWeight: '700', color: '#0F172A' }]}>
                            {formatCurrency(amount)}
                          </Text>
                        </View>
                      );
                    })}

                    <View style={styles.opTotalRow}>
                      <Text style={styles.opTotalLabel}>TOTAL AMOUNT PAYABLE:</Text>
                      <Text style={styles.opTotalAmount}>{formatCurrency(totalAmount)}</Text>
                    </View>
                  </View>

                  {/* Payment Status & Words */}
                  <View style={styles.opStatusCard}>
                    <Text style={styles.opStatusLabel}>AMOUNT IN WORDS:</Text>
                    <Text style={styles.opStatusWords}>{wordsTotal}</Text>
                    <View style={styles.opPaymentStatusBadgeRow}>
                      <Text style={styles.opPaymentStatusText}>
                        <Text style={styles.boldText}>Payment Status:</Text>{' '}
                        {app.op?.officialReceiptNumber
                          ? `Paid via OR #${app.op.officialReceiptNumber}`
                          : 'Pending Cashier Verification / Collection'}
                      </Text>
                    </View>
                  </View>

                  {/* Signatories */}
                  <View style={[styles.signatoriesRow, { flexDirection: isDesktop ? 'row' : 'column', gap: 20 }]}>
                    <View style={styles.sigBlock}>
                      <Text style={styles.sigName}>REGIONAL ASSESSMENT OFFICER</Text>
                      <Text style={styles.sigRole}>Authorized Assessment Officer</Text>
                    </View>
                    <View style={styles.sigBlock}>
                      <Text style={styles.sigName}>SPECIAL COLLECTING OFFICER</Text>
                      <Text style={styles.sigRole}>Collecting Cashier</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Footer Note */}
              <View style={styles.footerNoteContainer}>
                <Text style={styles.footerNoteText}>
                  National Telecommunications Commission • Official Document Generated via NTC-EDGE Digital Portal. Governed by RA 11032.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Modal Bottom Footer Actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} activeOpacity={0.75}>
              <Text style={styles.secondaryBtnText}>Close Preview</Text>
            </TouchableOpacity>

            {onProceedToPayment && (
              <TouchableOpacity
                style={styles.primaryPayBtn}
                onPress={() => {
                  onClose();
                  onProceedToPayment();
                }}
                activeOpacity={0.85}
              >
                <Icon name="dollar-sign" size={16} color="#FFFFFF" />
                <Text style={styles.primaryPayBtnText}>Proceed to Payment</Text>
                <Icon name="arrow-right" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    maxHeight: '92%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  printBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: SPACING[16],
    paddingTop: 8,
    gap: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    borderBottomWidth: 0,
    marginBottom: -1,
  },
  tabItemActiveSoa: {
    backgroundColor: '#FFFFFF',
    borderColor: '#BAE6FD',
    borderBottomColor: '#FFFFFF',
  },
  tabItemActiveOp: {
    backgroundColor: '#FFFFFF',
    borderColor: '#A7F3D0',
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: '#64748B',
  },
  tabTextActiveSoa: {
    color: '#0369A1',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  tabTextActiveOp: {
    color: '#047857',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tabBadgeActiveSoa: {
    backgroundColor: '#E0F2FE',
  },
  tabBadgeActiveOp: {
    backgroundColor: '#D1FAE5',
  },
  tabBadgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  tabBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  tabBadgeTextActiveSoa: {
    color: '#0369A1',
  },
  tabBadgeTextActiveOp: {
    color: '#047857',
  },
  tabBadgeTextInactive: {
    color: '#94A3B8',
  },
  modalBody: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  modalBodyContent: {
    padding: SPACING[16],
  },
  paperContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: SPACING[20],
  },
  republicHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  republicTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  agencyTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  officeTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#0284C7',
    marginTop: 2,
  },
  soaBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 6,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  opBanner: {
    backgroundColor: '#064E3B',
    borderRadius: 6,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bannerSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  bannerRight: {
    alignItems: 'flex-end',
  },
  bannerDocNum: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#38BDF8',
  },
  bannerDate: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  infoGrid: {
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 12,
  },
  infoCardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  infoCardName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    marginBottom: 4,
  },
  infoCardDetail: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#475569',
    marginBottom: 2,
  },
  boldText: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  dueDateBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  dueDateLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#475569',
  },
  dueDateBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dueDateBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#B45309',
  },
  opInfoCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    gap: 6,
  },
  opInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opInfoLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#64748B',
  },
  opInfoValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  tableWrapper: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
  },
  thCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableRowEven: {
    backgroundColor: '#F8FAFC',
  },
  tdCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#1E293B',
  },
  tdParticularName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  tdParticularSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  totalCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalHeaderLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  totalInWords: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#0284C7',
    marginTop: 3,
  },
  totalFigure: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  opTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  opTotalLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  opTotalAmount: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#059669',
  },
  opStatusCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  opStatusLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#065F46',
    textTransform: 'uppercase',
  },
  opStatusWords: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#047857',
    marginTop: 2,
  },
  opPaymentStatusBadgeRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#BBF7D0',
  },
  opPaymentStatusText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#065F46',
  },
  guidelinesBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
    gap: 4,
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  guidelinesTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#166534',
  },
  guidelineItem: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10.5,
    color: '#166534',
    lineHeight: 15,
  },
  signatoriesRow: {
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 16,
  },
  sigBlock: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#94A3B8',
    paddingTop: 6,
    alignItems: 'center',
  },
  sigName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  sigRole: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  footerNoteContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    alignItems: 'center',
  },
  footerNoteText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 10,
  },
  secondaryBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#475569',
  },
  primaryPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  primaryPayBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
});
