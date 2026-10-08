import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  Platform,
  Linking,
} from 'react-native';
import {
  COLORS,
  useTheme,
  Icon as Lucide,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from '@edge/ui';
import { applicationService } from '@edge/api';
import { ApplicationData } from '../../../../types/application';
import {
  generateSoaPrintableHtml,
  generateOpPrintableHtml,
  generateFullApplicationSummaryHtml,
  openPrintableDocumentWindow,
  getPopulatedSoaRows,
  OfficialSoaFormRow,
} from '../../utils/soaReportGenerator';

export type ReportDocumentType = 'soa' | 'op' | 'summary';

interface SoaReportPreviewModalProps {
  visible: boolean;
  app: ApplicationData;
  initialDocType?: ReportDocumentType;
  onClose: () => void;
  onOpenGenerateSoa?: () => void;
}

export function SoaReportPreviewModal({
  visible,
  app,
  initialDocType = 'soa',
  onClose,
  onOpenGenerateSoa,
}: SoaReportPreviewModalProps) {
  const { colors, isDark } = useTheme();
  const [docType, setDocType] = useState<ReportDocumentType>(initialDocType);
  const [soaOutputMode, setSoaOutputMode] = useState<'plain_paper' | 'accountable_form'>('plain_paper');

  const { rows: populatedSoaRows, totalAmount: computedSoaTotal } = useMemo(
    () => getPopulatedSoaRows(app),
    [app]
  );

  const dateObj = app.createdAt ? new Date(app.createdAt) : new Date();
  const currentMonthYear = dateObj
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    .toUpperCase();

  const handlePrint = () => {
    let html = '';
    if (docType === 'soa') {
      html = generateSoaPrintableHtml(app, { outputMode: soaOutputMode });
    } else if (docType === 'op') {
      html = generateOpPrintableHtml(app);
    } else {
      html = generateFullApplicationSummaryHtml(app);
    }
    openPrintableDocumentWindow(html);
  };

  const handleDownloadPdf = () => {
    if (docType === 'soa') {
      const url = applicationService.getSoaPrintUrl(app.id);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(url, '_blank');
      } else {
        void Linking.openURL(url);
      }
    } else if (docType === 'op') {
      const url = applicationService.getOpPrintUrl(app.id);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(url, '_blank');
      } else {
        void Linking.openURL(url);
      }
    }
  };

  const soaNumber = `SOA-${app.referenceNumber ?? app.id.slice(0, 8).toUpperCase()}`;
  const opNumber = `OP-${app.referenceNumber ?? app.id.slice(0, 8).toUpperCase()}`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200] },
            ]}
          >
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: isDark ? colors.brand[900] : colors.brand[50] },
                ]}
              >
                <Lucide
                  name="printer"
                  size={20}
                  color={isDark ? colors.brand[400] : colors.brand[600]}
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                  ]}
                >
                  Official Document Preview &amp; Printing
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                  ]}
                >
                  Ref #{app.referenceNumber} • {app.applicant}
                </Text>
              </View>
            </View>

            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <Lucide
                name="x"
                size={20}
                color={isDark ? colors.neutral[400] : colors.neutral[500]}
              />
            </Pressable>
          </View>

          {/* Document Tab Selector */}
          <View
            style={[
              styles.tabBar,
              {
                backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200],
              },
            ]}
          >
            <Pressable
              style={[
                styles.tabItem,
                docType === 'soa' && {
                  backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                  borderColor: isDark ? colors.brand[500] : colors.brand[600],
                },
              ]}
              onPress={() => setDocType('soa')}
            >
              <Lucide
                name="file-text"
                size={14}
                color={
                  docType === 'soa'
                    ? isDark
                      ? colors.brand[400]
                      : colors.brand[700]
                    : isDark
                    ? colors.neutral[400]
                    : colors.neutral[500]
                }
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      docType === 'soa'
                        ? isDark
                          ? colors.brand[400]
                          : colors.brand[700]
                        : isDark
                        ? colors.neutral[400]
                        : colors.neutral[600],
                    fontWeight: docType === 'soa' ? '700' : '500',
                  },
                ]}
              >
                Statement of Account (SOA)
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.tabItem,
                docType === 'op' && {
                  backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                  borderColor: isDark ? colors.brand[500] : colors.brand[600],
                },
              ]}
              onPress={() => setDocType('op')}
            >
              <Lucide
                name="credit-card"
                size={14}
                color={
                  docType === 'op'
                    ? isDark
                      ? colors.brand[400]
                      : colors.brand[700]
                    : isDark
                    ? colors.neutral[400]
                    : colors.neutral[500]
                }
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      docType === 'op'
                        ? isDark
                          ? colors.brand[400]
                          : colors.brand[700]
                        : isDark
                        ? colors.neutral[400]
                        : colors.neutral[600],
                    fontWeight: docType === 'op' ? '700' : '500',
                  },
                ]}
              >
                Order of Payment (OP)
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.tabItem,
                docType === 'summary' && {
                  backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                  borderColor: isDark ? colors.brand[500] : colors.brand[600],
                },
              ]}
              onPress={() => setDocType('summary')}
            >
              <Lucide
                name="layout"
                size={14}
                color={
                  docType === 'summary'
                    ? isDark
                      ? colors.brand[400]
                      : colors.brand[700]
                    : isDark
                    ? colors.neutral[400]
                    : colors.neutral[500]
                }
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      docType === 'summary'
                        ? isDark
                          ? colors.brand[400]
                          : colors.brand[700]
                        : isDark
                        ? colors.neutral[400]
                        : colors.neutral[600],
                    fontWeight: docType === 'summary' ? '700' : '500',
                  },
                ]}
              >
                Application Dossier
              </Text>
            </Pressable>
          </View>

          {/* Document Preview Area */}
          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {docType === 'soa' && (
              <View style={{ gap: 14 }}>
                {/* Mode Selector */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: SPACING[10],
                    borderRadius: RADIUS.sm,
                    backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                    borderWidth: 1,
                    borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Lucide name="printer" size={16} color={isDark ? colors.brand[400] : colors.brand[600]} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? colors.neutral[200] : colors.neutral[800] }}>
                      Print Target Mode:
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Pressable
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: RADIUS.xs,
                        backgroundColor:
                          soaOutputMode === 'plain_paper'
                            ? isDark
                              ? colors.brand[900]
                              : colors.brand[100]
                            : 'transparent',
                        borderWidth: 1,
                        borderColor:
                          soaOutputMode === 'plain_paper'
                            ? isDark
                              ? colors.brand[500]
                              : colors.brand[600]
                            : isDark
                            ? colors.neutral[700]
                            : colors.neutral[300],
                      }}
                      onPress={() => setSoaOutputMode('plain_paper')}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: soaOutputMode === 'plain_paper' ? '700' : '500',
                          color:
                            soaOutputMode === 'plain_paper'
                              ? isDark
                                ? colors.brand[300]
                                : colors.brand[700]
                              : isDark
                              ? colors.neutral[400]
                              : colors.neutral[600],
                        }}
                      >
                        📄 Plain Paper (Full Electronic)
                      </Text>
                    </Pressable>

                    <Pressable
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: RADIUS.xs,
                        backgroundColor:
                          soaOutputMode === 'accountable_form'
                            ? isDark
                              ? '#451a03'
                              : '#fef3c7'
                            : 'transparent',
                        borderWidth: 1,
                        borderColor:
                          soaOutputMode === 'accountable_form'
                            ? '#d97706'
                            : isDark
                            ? colors.neutral[700]
                            : colors.neutral[300],
                      }}
                      onPress={() => setSoaOutputMode('accountable_form')}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: soaOutputMode === 'accountable_form' ? '700' : '500',
                          color:
                            soaOutputMode === 'accountable_form'
                              ? '#d97706'
                              : isDark
                              ? colors.neutral[400]
                              : colors.neutral[600],
                        }}
                      >
                        📑 Pre-Printed Physical Form Overlay
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Official Assesment-SOA.pdf Document Canvas */}
                <View
                  style={[
                    styles.docPaper,
                    {
                      backgroundColor: isDark ? colors.neutral[900] : '#ffffff',
                      borderColor: soaOutputMode === 'accountable_form' ? '#d97706' : (isDark ? colors.neutral[600] : '#000000'),
                      borderWidth: 2,
                      padding: SPACING[16],
                    },
                  ]}
                >
                  {/* Watermark notice in Overlay mode */}
                  {soaOutputMode === 'accountable_form' && (
                    <View
                      style={{
                        padding: 6,
                        backgroundColor: isDark ? '#271b07' : '#fffbeb',
                        borderWidth: 1,
                        borderColor: '#f59e0b',
                        borderRadius: RADIUS.xs,
                        marginBottom: 10,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 11, color: '#d97706', fontWeight: '700' }}>
                        Physical Stationery Mode: Borders and static labels are suppressed during printing.
                      </Text>
                    </View>
                  )}

                  {/* Assessment Grid Header */}
                  <View
                    style={{
                      flexDirection: 'row',
                      borderWidth: 1,
                      borderColor: isDark ? colors.neutral[600] : '#000000',
                      backgroundColor: isDark ? colors.neutral[800] : '#f8fafc',
                    }}
                  >
                    <View
                      style={{
                        width: 90,
                        padding: 6,
                        borderRightWidth: 1,
                        borderRightColor: isDark ? colors.neutral[600] : '#000000',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: '700',
                          fontSize: 12,
                          color: soaOutputMode === 'accountable_form' ? (isDark ? colors.neutral[600] : '#94a3b8') : (isDark ? colors.neutral[100] : '#000000'),
                        }}
                      >
                        Code
                      </Text>
                    </View>

                    <View
                      style={{
                        flex: 1,
                        padding: 6,
                        borderRightWidth: 1,
                        borderRightColor: isDark ? colors.neutral[600] : '#000000',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: '700',
                          fontSize: 12,
                          color: soaOutputMode === 'accountable_form' ? (isDark ? colors.neutral[600] : '#94a3b8') : (isDark ? colors.neutral[100] : '#000000'),
                        }}
                      >
                        Description
                      </Text>
                    </View>

                    <View
                      style={{
                        width: 170,
                        padding: 4,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: '700',
                          fontSize: 10.5,
                          color: soaOutputMode === 'accountable_form' ? (isDark ? colors.neutral[600] : '#94a3b8') : (isDark ? colors.neutral[100] : '#000000'),
                          letterSpacing: 0.5,
                        }}
                      >
                        CASHIER'S REPORT
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '600',
                          color: isDark ? colors.neutral[300] : '#000000',
                          marginTop: 2,
                        }}
                      >
                        MONTH OF{' '}
                        <Text style={{ fontWeight: '700', textDecorationLine: 'underline', color: isDark ? colors.brand[400] : '#000000' }}>
                          {currentMonthYear}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {/* Assessment Sections & Rows */}
                  {(['FOR LICENSES', 'FOR PERMITS', 'FOR AMATUER AND ROC', 'OTHER APPLICATION'] as const).map((cat) => {
                    const catRows = populatedSoaRows.filter((r) => r.category === cat);
                    return (
                      <View key={cat}>
                        {/* Section Header Row */}
                        <View
                          style={{
                            borderWidth: 1,
                            borderTopWidth: 0,
                            borderColor: isDark ? colors.neutral[600] : '#000000',
                            backgroundColor: isDark ? colors.neutral[800] : '#f1f5f9',
                            paddingVertical: 3,
                            alignItems: 'center',
                          }}
                        >
                          <Text
                            style={{
                              fontWeight: '700',
                              fontSize: 11,
                              color: soaOutputMode === 'accountable_form' ? (isDark ? colors.neutral[600] : '#94a3b8') : (isDark ? colors.neutral[100] : '#000000'),
                              letterSpacing: 0.5,
                            }}
                          >
                            {cat}
                          </Text>
                        </View>

                        {/* Section Data Rows */}
                        {catRows.map((r, idx) => {
                          const hasAmount = r.calculatedAmount > 0;
                          return (
                            <View
                              key={idx}
                              style={{
                                flexDirection: 'row',
                                borderLeftWidth: 1,
                                borderRightWidth: 1,
                                borderBottomWidth: 1,
                                borderColor: isDark ? colors.neutral[600] : '#000000',
                                backgroundColor: hasAmount
                                  ? (isDark ? '#064e3b15' : '#ecfdf5')
                                  : 'transparent',
                                minHeight: 22,
                                alignItems: 'center',
                              }}
                            >
                              <View
                                style={{
                                  width: 90,
                                  paddingHorizontal: 4,
                                  borderRightWidth: 1,
                                  borderRightColor: isDark ? colors.neutral[600] : '#000000',
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 10,
                                    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
                                    color: soaOutputMode === 'accountable_form' ? (isDark ? colors.neutral[700] : '#cbd5e1') : (isDark ? colors.neutral[300] : '#1e293b'),
                                  }}
                                >
                                  {r.code}
                                </Text>
                              </View>

                              <View
                                style={{
                                  flex: 1,
                                  paddingHorizontal: 6,
                                  paddingVertical: 2,
                                  borderRightWidth: 1,
                                  borderRightColor: isDark ? colors.neutral[600] : '#000000',
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 10.5,
                                    color: soaOutputMode === 'accountable_form' ? (isDark ? colors.neutral[700] : '#cbd5e1') : (isDark ? colors.neutral[200] : '#000000'),
                                    lineHeight: 14,
                                  }}
                                  numberOfLines={2}
                                >
                                  {r.description.replace(/<[^>]*>/g, ' ')}
                                </Text>
                              </View>

                              <View
                                style={{
                                  width: 170,
                                  paddingHorizontal: 8,
                                  alignItems: 'flex-end',
                                  justifyContent: 'center',
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 11,
                                    fontWeight: hasAmount ? '700' : '400',
                                    color: hasAmount
                                      ? (isDark ? '#34d399' : '#047857')
                                      : (isDark ? colors.neutral[600] : '#94a3b8'),
                                    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
                                  }}
                                >
                                  {hasAmount ? `₱ ${r.calculatedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : ''}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    );
                  })}

                  {/* Grand TOTAL Row */}
                  <View
                    style={{
                      flexDirection: 'row',
                      borderLeftWidth: 1,
                      borderRightWidth: 1,
                      borderBottomWidth: 1,
                      borderColor: isDark ? colors.neutral[600] : '#000000',
                      backgroundColor: isDark ? colors.neutral[800] : '#f8fafc',
                      minHeight: 28,
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        paddingHorizontal: 12,
                        alignItems: 'flex-end',
                        borderRightWidth: 1,
                        borderRightColor: isDark ? colors.neutral[600] : '#000000',
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: '800',
                          fontSize: 12,
                          color: soaOutputMode === 'accountable_form' ? (isDark ? colors.neutral[600] : '#94a3b8') : (isDark ? colors.neutral[100] : '#000000'),
                          letterSpacing: 0.5,
                        }}
                      >
                        TOTAL
                      </Text>
                    </View>

                    <View
                      style={{
                        width: 170,
                        paddingHorizontal: 8,
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '800',
                          color: isDark ? colors.brand[400] : '#0284c7',
                          fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
                        }}
                      >
                        ₱ {computedSoaTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {docType === 'op' && (
              <View
                style={[
                  styles.docPaper,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                    borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                  },
                ]}
              >
                <View style={styles.paperHeader}>
                  <Text style={[styles.phRep, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                    Republic of the Philippines
                  </Text>
                  <Text style={[styles.phAgency, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                    NATIONAL TELECOMMUNICATIONS COMMISSION
                  </Text>
                  <Text style={[styles.phOffice, { color: isDark ? colors.brand[400] : colors.brand[700] }]}>
                    {app.assignedTo || app.office || 'Collecting Division'}
                  </Text>
                </View>

                <View style={[styles.soaBanner, { backgroundColor: '#065f46' }]}>
                  <View>
                    <Text style={styles.soaBannerTitle}>ORDER OF PAYMENT</Text>
                    <Text style={styles.soaBannerSub}>Treasury &amp; Cashier Authority</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.soaBannerRef, { color: '#a7f3d0' }]}>{opNumber}</Text>
                    <Text style={styles.soaBannerDate}>Status: {app.payment.orNumber ? 'PAID' : 'PENDING PAYMENT'}</Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.payorCard,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                    },
                  ]}
                >
                  <View style={styles.payorRow}>
                    <Text style={[styles.payorLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                      Payor Name:
                    </Text>
                    <Text style={[styles.payorVal, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                      {app.applicant}
                    </Text>
                  </View>
                  <View style={styles.payorRow}>
                    <Text style={[styles.payorLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                      Collection Purpose:
                    </Text>
                    <Text style={[styles.payorVal, { color: isDark ? colors.neutral[200] : colors.neutral[800] }]}>
                      {app.serviceName} Fees
                    </Text>
                  </View>
                  {app.payment.orNumber ? (
                    <View style={styles.payorRow}>
                      <Text style={[styles.payorLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                        OR Number:
                      </Text>
                      <Text style={[styles.payorVal, { color: COLORS.semantic.success, fontWeight: '700' }]}>
                        {app.payment.orNumber}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View
                  style={[
                    styles.totalBox,
                    {
                      backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                    },
                  ]}
                >
                  <Text style={[styles.totalLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                    TOTAL PAYABLE AMOUNT
                  </Text>
                  <Text style={[styles.totalAmount, { color: '#059669' }]}>
                    PHP {app.totalAmountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>
            )}

            {docType === 'summary' && (
              <View
                style={[
                  styles.docPaper,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                    borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                  },
                ]}
              >
                <View style={styles.paperHeader}>
                  <Text style={[styles.phRep, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                    Republic of the Philippines
                  </Text>
                  <Text style={[styles.phAgency, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                    NATIONAL TELECOMMUNICATIONS COMMISSION
                  </Text>
                  <Text style={[styles.phOffice, { color: isDark ? colors.brand[400] : colors.brand[700] }]}>
                    Application Dossier &amp; Audit Trail
                  </Text>
                </View>

                <View
                  style={[
                    styles.payorCard,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                    },
                  ]}
                >
                  <Text style={[styles.sectionTitleSm, { color: isDark ? colors.brand[400] : colors.brand[700] }]}>
                    APPLICATION DETAILS
                  </Text>
                  <View style={styles.payorRow}>
                    <Text style={[styles.payorLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                      Reference / App Number:
                    </Text>
                    <Text style={[styles.payorVal, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                      {app.referenceNumber} {app.applicationNumber ? `• ${app.applicationNumber}` : ''}
                    </Text>
                  </View>
                  <View style={styles.payorRow}>
                    <Text style={[styles.payorLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                      Applicant &amp; Type:
                    </Text>
                    <Text style={[styles.payorVal, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                      {app.applicant} ({app.applicantType})
                    </Text>
                  </View>
                  <View style={styles.payorRow}>
                    <Text style={[styles.payorLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                      Service &amp; Mode:
                    </Text>
                    <Text style={[styles.payorVal, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                      {app.serviceName} • {app.mode} Mode
                    </Text>
                  </View>
                  <View style={styles.payorRow}>
                    <Text style={[styles.payorLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                      Current Status:
                    </Text>
                    <Text style={[styles.payorVal, { color: isDark ? colors.brand[400] : colors.brand[700], fontWeight: '700' }]}>
                      {app.status}
                    </Text>
                  </View>
                </View>

                {/* Audit History Timeline List */}
                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.sectionTitleSm, { color: isDark ? colors.brand[400] : colors.brand[700], marginBottom: 8 }]}>
                    PROCESS &amp; AUDIT TRAIL ({app.history?.length || 0})
                  </Text>
                  {app.history && app.history.length > 0 ? (
                    app.history.map((h, i) => (
                      <View
                        key={h.id || i}
                        style={[
                          styles.historyEntry,
                          { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[200] },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.historyAction, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                            {h.action}
                          </Text>
                          <Text style={[styles.historyMeta, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                            by <Text style={{ fontWeight: '600' }}>{h.staff}</Text> • {h.timestamp}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={{ fontStyle: 'italic', color: isDark ? colors.neutral[400] : colors.neutral[500], fontSize: 12 }}>
                      No history events recorded.
                    </Text>
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View
            style={[
              styles.modalFooter,
              { borderTopColor: isDark ? colors.neutral[800] : colors.neutral[200] },
            ]}
          >
            {onOpenGenerateSoa !== undefined && docType === 'soa' && app.status !== 'ForAccountant' && app.status !== 'PendingPayment' && app.status !== 'Completed' && (
              <Pressable
                style={[
                  styles.secondaryBtn,
                  {
                    borderColor: isDark ? colors.brand[500] : colors.brand[600],
                    backgroundColor: isDark ? colors.neutral[800] : colors.brand[50],
                  },
                ]}
                onPress={() => {
                  onClose();
                  onOpenGenerateSoa();
                }}
              >
                <Lucide
                  name="file-plus"
                  size={14}
                  color={isDark ? colors.brand[400] : colors.brand[700]}
                />
                <Text
                  style={[
                    styles.secondaryBtnText,
                    { color: isDark ? colors.brand[400] : colors.brand[700] },
                  ]}
                >
                  Generate / Edit SOA
                </Text>
              </Pressable>
            )}

            <View style={{ flex: 1 }} />

            {(docType === 'soa' || docType === 'op') && (
              <Pressable
                style={[
                  styles.secondaryBtn,
                  {
                    borderColor: isDark ? colors.brand[500] : colors.brand[600],
                    backgroundColor: isDark ? colors.neutral[800] : colors.brand[50],
                  },
                ]}
                onPress={handleDownloadPdf}
              >
                <Lucide
                  name="download"
                  size={14}
                  color={isDark ? colors.brand[400] : colors.brand[700]}
                />
                <Text
                  style={[
                    styles.secondaryBtnText,
                    { color: isDark ? colors.brand[400] : colors.brand[700] },
                  ]}
                >
                  Official Vector PDF
                </Text>
              </Pressable>
            )}

            <Pressable
              style={[
                styles.cancelBtn,
                {
                  borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                  backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                },
              ]}
              onPress={onClose}
            >
              <Text
                style={[
                  styles.cancelBtnText,
                  { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                ]}
              >
                Close
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.printBtn,
                { backgroundColor: isDark ? colors.brand[500] : colors.brand[700] },
              ]}
              onPress={handlePrint}
            >
              <Lucide name="printer" size={16} color={COLORS.neutral.white} />
              <Text style={styles.printBtnText}>
                Print {docType === 'soa' ? 'SOA' : docType === 'op' ? 'Order of Payment' : 'Dossier'}
              </Text>
            </Pressable>
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
    width: '100%',
    maxWidth: 820,
    maxHeight: '92%',
    borderRadius: RADIUS.dialog,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.modal,
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
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
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
  closeBtn: {
    padding: SPACING[6],
    borderRadius: RADIUS.sm,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    gap: SPACING[8],
    borderBottomWidth: 1,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[6],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  modalBody: {
    flex: 1,
  },
  bodyContent: {
    padding: SPACING[20],
  },
  docPaper: {
    padding: SPACING[20],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[12],
  },
  paperHeader: {
    alignItems: 'center',
    gap: 2,
    marginBottom: SPACING[4],
  },
  phRep: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  phAgency: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  phOffice: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  soaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[10],
    borderRadius: RADIUS.sm,
  },
  soaBannerTitle: {
    color: '#ffffff',
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  soaBannerSub: {
    color: '#94a3b8',
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    marginTop: 1,
  },
  soaBannerRef: {
    color: '#38bdf8',
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
    fontWeight: '700',
  },
  soaBannerDate: {
    color: '#cbd5e1',
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    marginTop: 1,
  },
  payorCard: {
    padding: SPACING[12],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: 6,
  },
  payorRow: {
    flexDirection: 'row',
    gap: SPACING[8],
  },
  payorLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    width: 130,
  },
  payorVal: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  sectionTitleSm: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.6,
  },
  previewTable: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[10],
    paddingVertical: SPACING[8],
  },
  thCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[10],
    paddingVertical: SPACING[10],
    borderTopWidth: 1,
  },
  tdMain: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  tdSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    marginTop: 1,
  },
  tdCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
  },
  totalBox: {
    padding: SPACING[12],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  historyEntry: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  historyAction: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  historyMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[12],
    borderTopWidth: 1,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[10],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  cancelBtn: {
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[10],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[10],
    borderRadius: RADIUS.sm,
  },
  printBtnText: {
    color: COLORS.neutral.white,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
