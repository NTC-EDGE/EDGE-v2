import React, { useState, useMemo, useEffect } from 'react';
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
  formatAddress,
  numberToWords,
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
  const [viewFormat, setViewFormat] = useState<'pdf' | 'grid'>('pdf');
  const [soaOutputMode, setSoaOutputMode] = useState<'plain_paper' | 'accountable_form'>('plain_paper');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (Platform.OS === 'web' && viewFormat === 'pdf' && (docType === 'soa' || docType === 'op')) {
      const loadBlob = async () => {
        try {
          const [blob, err] = docType === 'soa'
            ? await applicationService.downloadSoaPdf(app.id)
            : await applicationService.downloadOpPdf(app.id);

          if (active && blob !== null && err === null && typeof window !== 'undefined') {
            createdUrl = window.URL.createObjectURL(blob);
            setPdfBlobUrl(createdUrl);
          }
        } catch {
          // Fall back to direct backend URL if blob conversion fails
        }
      };
      void loadBlob();
    }

    return () => {
      active = false;
      if (createdUrl !== null && typeof window !== 'undefined') {
        window.URL.revokeObjectURL(createdUrl);
      }
    };
  }, [app.id, docType, viewFormat]);

  const { rows: populatedSoaRows, totalAmount: computedSoaTotal } = useMemo(
    () => getPopulatedSoaRows(app),
    [app]
  );

  const dateObj = app.createdAt ? new Date(app.createdAt) : new Date();
  const currentMonthYear = dateObj
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    .toUpperCase();

  const variantLower = (app.serviceVariantName || app.permitTitle || '').toLowerCase();
  const isRen = variantLower.includes('renew');
  const isMod = variantLower.includes('mod');
  const isDup = variantLower.includes('dup');
  const isCv = variantLower.includes('cv') || variantLower.includes('convert');
  const isRoc = variantLower.includes('roc') || variantLower.includes('operator');
  const isCo = variantLower.includes('co') || variantLower.includes('ownership');
  const isMa = variantLower.includes('ma');
  const isMs = variantLower.includes('ms');
  const isNew = !isRen && !isMod && !isDup && !isCv && !isRoc && !isCo && !isMa && !isMs;
  const isForAssessmentOnly = app.intent === 'AssessmentOnly' || app.isAssessmentOnly === true;

  const handlePrint = async () => {
    if (docType === 'soa' || docType === 'op') {
      try {
        const [pdfBlob, err] = docType === 'soa'
          ? await applicationService.downloadSoaPdf(app.id)
          : await applicationService.downloadOpPdf(app.id);

        if (pdfBlob !== null && err === null && Platform.OS === 'web' && typeof window !== 'undefined') {
          const blobUrl = window.URL.createObjectURL(pdfBlob);
          const printWindow = window.open(blobUrl, '_blank');
          if (printWindow !== null) {
            printWindow.focus();
          }
          return;
        }
      } catch (err) {
        console.warn('Direct blob fetch failed, falling back to direct URL open:', err);
      }

      const url = docType === 'soa'
        ? applicationService.getSoaPrintUrl(app.id)
        : applicationService.getOpPrintUrl(app.id);

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const printWindow = window.open(url, '_blank');
        if (printWindow !== null) {
          printWindow.focus();
        }
        return;
      }
    }

    const html = generateFullApplicationSummaryHtml(app);
    openPrintableDocumentWindow(html);
  };

  const handleDownloadPdf = async () => {
    if (docType === 'soa' || docType === 'op') {
      try {
        const [pdfBlob, err] = docType === 'soa'
          ? await applicationService.downloadSoaPdf(app.id)
          : await applicationService.downloadOpPdf(app.id);

        if (pdfBlob !== null && err === null && Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
          const blobUrl = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = blobUrl;
          const ref = app.referenceNumber ? app.referenceNumber : (app.id ? app.id.slice(0, 8).toUpperCase() : 'DOC');
          link.download = `${docType.toUpperCase()}_${ref}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
          return;
        }
      } catch (err) {
        console.warn('Direct blob download failed, falling back to direct URL open:', err);
      }

      const url = docType === 'soa'
        ? applicationService.getSoaPrintUrl(app.id)
        : applicationService.getOpPrintUrl(app.id);

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(url, '_blank');
      } else {
        void Linking.openURL(url);
      }
    }
  };

  const soaNumber = `SOA-${app.referenceNumber ?? app.id.slice(0, 8).toUpperCase()}`;
  const opNumber = `OP-${app.referenceNumber ?? app.id.slice(0, 8).toUpperCase()}`;
  const applicantAddress = formatAddress(app);
  const totalAmountWords = numberToWords(app.totalAmountDue);
  const formattedOpDate = dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const renderOpVoucher = (copyTitle: string) => {
    const isPaid = Boolean(app.payment && app.payment.orNumber && app.payment.orNumber.trim().length > 0);
    const orNumberStr = isPaid && app.payment.orNumber ? app.payment.orNumber : '________________';
    const orAmountStr = isPaid
      ? (app.payment.amountReceived && app.payment.amountReceived > 0
          ? `PHP ${app.payment.amountReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
          : `PHP ${app.totalAmountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
      : '________________';
    const orDateStr = isPaid ? formattedOpDate : '________________';
    const officerName = app.cashierOfficer || 'Special Collecting Officer';

    return (
      <View
        key={copyTitle}
        style={[
          styles.docPaper,
          {
            backgroundColor: isDark ? colors.neutral[900] : '#ffffff',
            borderColor: isDark ? colors.neutral[600] : '#000000',
            borderWidth: 1.8,
            padding: SPACING[16],
          },
        ]}
      >
        {/* Top Header Grid */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Left: Government Title */}
          <View style={{ flex: 1.4, paddingRight: 8 }}>
            <Text style={{ fontSize: 9.5, textTransform: 'uppercase', color: isDark ? colors.neutral[400] : '#334155' }}>
              Republic of the Philippines
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase', color: isDark ? colors.neutral[100] : '#0f172a', marginTop: 1 }}>
              NATIONAL TELECOMMUNICATIONS COMMISSION
            </Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? colors.brand[400] : colors.brand[700], marginTop: 1 }}>
              {app.office || app.assignedTo || 'Regional Office No. VII'}
            </Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? colors.neutral[300] : '#1e293b', marginTop: 1 }}>
              General Fund
            </Text>
          </View>

          {/* Right: Serial No. & Date Box */}
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? colors.neutral[300] : '#0f172a' }}>
                Serial No. :{' '}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '800',
                  fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
                  textDecorationLine: 'underline',
                  color: isDark ? colors.brand[400] : '#0f172a',
                }}
              >
                {opNumber}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? colors.neutral[300] : '#0f172a' }}>
                Date :{' '}
              </Text>
              <Text
                style={{
                  fontSize: 10.5,
                  textDecorationLine: 'underline',
                  color: isDark ? colors.neutral[200] : '#0f172a',
                }}
              >
                {formattedOpDate}
              </Text>
            </View>
          </View>
        </View>

        {/* Voucher Title */}
        <View style={{ alignItems: 'center', marginVertical: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', color: isDark ? colors.neutral[100] : '#0f172a' }}>
            ORDER OF PAYMENT (OP)
          </Text>
          <Text style={{ fontSize: 9.5, fontStyle: 'italic', color: isDark ? colors.neutral[400] : '#64748b' }}>
            ({copyTitle})
          </Text>
        </View>

        {/* Voucher Body Text */}
        <View style={{ gap: 4, marginTop: 4, marginBottom: 10 }}>
          <Text style={{ fontSize: 10.5, fontWeight: '700', color: isDark ? colors.neutral[100] : '#0f172a' }}>
            The Collecting Officer
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', marginTop: 2 }}>
            <Text style={{ fontSize: 10, color: isDark ? colors.neutral[300] : '#1e293b' }}>
              Please issue <Text style={{ fontWeight: '700' }}>Official Receipt</Text> in favor of{' '}
            </Text>
            <Text
              style={{
                fontSize: 10.5,
                fontWeight: '700',
                textDecorationLine: 'underline',
                color: isDark ? colors.brand[400] : '#0f172a',
              }}
            >
              {app.applicant}
            </Text>
          </View>
          <Text style={{ fontSize: 8.5, fontStyle: 'italic', color: isDark ? colors.neutral[400] : '#64748b', marginTop: -2 }}>
            (Name of Payor)
          </Text>

          <View style={{ marginTop: 2 }}>
            <Text
              style={{
                fontSize: 10,
                textDecorationLine: 'underline',
                color: isDark ? colors.neutral[200] : '#1e293b',
              }}
            >
              {applicantAddress}
            </Text>
            <Text style={{ fontSize: 8.5, fontStyle: 'italic', color: isDark ? colors.neutral[400] : '#64748b', marginTop: 1 }}>
              (Address/Office of Payor)
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', marginTop: 2 }}>
            <Text style={{ fontSize: 10, color: isDark ? colors.neutral[300] : '#1e293b' }}>
              in the amount of PHP{' '}
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                textDecorationLine: 'underline',
                color: isDark ? colors.neutral[100] : '#0f172a',
              }}
            >
              {totalAmountWords}
            </Text>
            <Text style={{ fontSize: 10, color: isDark ? colors.neutral[300] : '#1e293b' }}>
              {' '}(
            </Text>
            <Text
              style={{
                fontSize: 10.5,
                fontWeight: '700',
                textDecorationLine: 'underline',
                color: isDark ? '#34d399' : '#047857',
              }}
            >
              PHP {app.totalAmountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={{ fontSize: 10, color: isDark ? colors.neutral[300] : '#1e293b' }}>
              )
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', marginTop: 2 }}>
            <Text style={{ fontSize: 10, color: isDark ? colors.neutral[300] : '#1e293b' }}>
              for the payment of{' '}
            </Text>
            <Text
              style={{
                fontSize: 10,
                textDecorationLine: 'underline',
                color: isDark ? colors.neutral[200] : '#1e293b',
              }}
            >
              {app.serviceName || 'Application Services'} Assessment & Regulatory Fees
            </Text>
          </View>
          <Text style={{ fontSize: 8.5, fontStyle: 'italic', color: isDark ? colors.neutral[400] : '#64748b', marginTop: -2 }}>
            (Purpose)
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', marginTop: 2 }}>
            <Text style={{ fontSize: 10, color: isDark ? colors.neutral[300] : '#1e293b' }}>
              per Statement of Account No.{' '}
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                textDecorationLine: 'underline',
                fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
                color: isDark ? colors.neutral[100] : '#0f172a',
              }}
            >
              {soaNumber}
            </Text>
            <Text style={{ fontSize: 10, color: isDark ? colors.neutral[300] : '#1e293b' }}>
              {' '}dated{' '}
            </Text>
            <Text
              style={{
                fontSize: 10,
                textDecorationLine: 'underline',
                color: isDark ? colors.neutral[200] : '#1e293b',
              }}
            >
              {formattedOpDate}
            </Text>
          </View>
        </View>

        {/* Bank Accounts Deposit Instruction */}
        <Text style={{ fontSize: 9.5, fontWeight: '700', color: isDark ? colors.neutral[300] : '#1e293b', marginTop: 2, marginBottom: 4 }}>
          Please deposit the collections under Bank Account/s:
        </Text>

        {/* Bank Grid */}
        <View
          style={{
            borderWidth: 1,
            borderColor: isDark ? colors.neutral[600] : '#000000',
            borderRadius: RADIUS.xs,
            overflow: 'hidden',
            marginBottom: 10,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: isDark ? colors.neutral[800] : '#f1f5f9',
              borderBottomWidth: 1,
              borderBottomColor: isDark ? colors.neutral[600] : '#000000',
              paddingVertical: 4,
            }}
          >
            <View style={{ width: 40, alignItems: 'center', borderRightWidth: 1, borderRightColor: isDark ? colors.neutral[600] : '#000000' }}>
              <Text style={{ fontSize: 9.5, fontWeight: '700', color: isDark ? colors.neutral[300] : '#334155' }}>No.</Text>
            </View>
            <View style={{ flex: 1, paddingHorizontal: 8, borderRightWidth: 1, borderRightColor: isDark ? colors.neutral[600] : '#000000' }}>
              <Text style={{ fontSize: 9.5, fontWeight: '700', color: isDark ? colors.neutral[300] : '#334155' }}>Name of Bank</Text>
            </View>
            <View style={{ width: 140, paddingHorizontal: 8, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 9.5, fontWeight: '700', color: isDark ? colors.neutral[300] : '#334155' }}>Amount</Text>
            </View>
          </View>

          {/* Row 1 */}
          <View
            style={{
              flexDirection: 'row',
              borderBottomWidth: 1,
              borderBottomColor: isDark ? colors.neutral[600] : '#000000',
              paddingVertical: 5,
              backgroundColor: isDark ? colors.neutral[900] : '#ffffff',
            }}
          >
            <View style={{ width: 40, alignItems: 'center', borderRightWidth: 1, borderRightColor: isDark ? colors.neutral[600] : '#000000' }}>
              <Text style={{ fontSize: 9.5, color: isDark ? colors.neutral[400] : '#475569' }}>1</Text>
            </View>
            <View style={{ flex: 1, paddingHorizontal: 8, borderRightWidth: 1, borderRightColor: isDark ? colors.neutral[600] : '#000000' }}>
              <Text style={{ fontSize: 9.5, fontWeight: '600', color: isDark ? colors.neutral[200] : '#1e293b' }}>Land Bank of the Philippines</Text>
            </View>
            <View style={{ width: 140, paddingHorizontal: 8, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? '#34d399' : '#047857', fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }) }}>
                PHP {app.totalAmountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          {/* Row Total */}
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 5,
              backgroundColor: isDark ? colors.neutral[800] : '#f8fafc',
            }}
          >
            <View style={{ flex: 1, paddingHorizontal: 8, alignItems: 'flex-end', borderRightWidth: 1, borderRightColor: isDark ? colors.neutral[600] : '#000000' }}>
              <Text style={{ fontSize: 9.5, fontWeight: '800', color: isDark ? colors.neutral[100] : '#0f172a' }}>TOTAL PHP</Text>
            </View>
            <View style={{ width: 140, paddingHorizontal: 8, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 10.5, fontWeight: '800', color: isDark ? '#34d399' : '#047857', fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }) }}>
                PHP {app.totalAmountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        {/* Voucher Footer: OR Stamp Box + Collecting Officer Signature */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
          {/* OR Stamp Box */}
          <View
            style={{
              width: 190,
              borderWidth: 1,
              borderColor: isDark ? colors.neutral[600] : '#000000',
              padding: 6,
              backgroundColor: isDark ? colors.neutral[800] : '#fdfdfd',
            }}
          >
            <View style={{ flexDirection: 'row', marginBottom: 2 }}>
              <Text style={{ fontSize: 8.5, fontWeight: '700', width: 55, color: isDark ? colors.neutral[300] : '#1e293b' }}>O.R. No.</Text>
              <Text style={{ fontSize: 9, fontWeight: '700', fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }), color: isPaid ? (isDark ? '#34d399' : '#059669') : (isDark ? colors.neutral[500] : '#94a3b8') }}>
                {orNumberStr}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 2 }}>
              <Text style={{ fontSize: 8.5, fontWeight: '700', width: 55, color: isDark ? colors.neutral[300] : '#1e293b' }}>AMOUNT:</Text>
              <Text style={{ fontSize: 8.5, fontWeight: '600', color: isDark ? colors.neutral[200] : '#1e293b' }}>
                {orAmountStr}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 2 }}>
              <Text style={{ fontSize: 8.5, width: 55, color: isDark ? colors.neutral[400] : '#475569' }}>Date:</Text>
              <Text style={{ fontSize: 8.5, color: isDark ? colors.neutral[200] : '#1e293b' }}>
                {orDateStr}
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ fontSize: 8.5, width: 55, color: isDark ? colors.neutral[400] : '#475569' }}>By:</Text>
              <Text style={{ fontSize: 8.5, color: isDark ? colors.neutral[200] : '#1e293b' }}>
                {officerName}
              </Text>
            </View>
          </View>

          {/* Signature Box */}
          <View style={{ flex: 1, paddingLeft: 24, alignItems: 'center' }}>
            <View style={{ width: 180, borderBottomWidth: 1, borderBottomColor: isDark ? colors.neutral[400] : '#000000', marginBottom: 4 }} />
            <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? colors.neutral[100] : '#0f172a' }}>
              {officerName}
            </Text>
            <Text style={{ fontSize: 8.5, fontStyle: 'italic', color: isDark ? colors.neutral[400] : '#64748b' }}>
              Special Collecting Officer / Cashier
            </Text>
            <View
              style={{
                marginTop: 4,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: RADIUS.xs,
                backgroundColor: isPaid ? (isDark ? '#064e3b' : '#ecfdf5') : (isDark ? '#451a03' : '#fffbeb'),
              }}
            >
              <Text
                style={{
                  fontSize: 8,
                  fontWeight: '700',
                  color: isPaid ? (isDark ? '#34d399' : '#047857') : (isDark ? '#f59e0b' : '#d97706'),
                }}
              >
                {isPaid ? `PAID (OR #${app.payment.orNumber})` : 'PENDING CASHIER COLLECTION'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

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

          {/* Format Selector on Web: Official PDF Template vs Data Grid */}
          {Platform.OS === 'web' && (docType === 'soa' || docType === 'op') && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: SPACING[16],
                paddingVertical: SPACING[6],
                backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                borderBottomWidth: 1,
                borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200],
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? colors.neutral[400] : colors.neutral[600] }}>
                VIEW FORMAT:
              </Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Pressable
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: RADIUS.xs,
                    backgroundColor: viewFormat === 'pdf' ? (isDark ? colors.brand[900] : colors.brand[100]) : 'transparent',
                    borderWidth: 1,
                    borderColor: viewFormat === 'pdf' ? (isDark ? colors.brand[500] : colors.brand[600]) : 'transparent',
                  }}
                  onPress={() => setViewFormat('pdf')}
                >
                  <Lucide name="file-text" size={12} color={viewFormat === 'pdf' ? (isDark ? colors.brand[300] : colors.brand[700]) : (isDark ? colors.neutral[400] : colors.neutral[600])} />
                  <Text style={{ fontSize: 11, fontWeight: viewFormat === 'pdf' ? '700' : '500', color: viewFormat === 'pdf' ? (isDark ? colors.brand[300] : colors.brand[700]) : (isDark ? colors.neutral[400] : colors.neutral[600]) }}>
                    Official PDF Template (Direct)
                  </Text>
                </Pressable>

                <Pressable
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: RADIUS.xs,
                    backgroundColor: viewFormat === 'grid' ? (isDark ? colors.brand[900] : colors.brand[100]) : 'transparent',
                    borderWidth: 1,
                    borderColor: viewFormat === 'grid' ? (isDark ? colors.brand[500] : colors.brand[600]) : 'transparent',
                  }}
                  onPress={() => setViewFormat('grid')}
                >
                  <Lucide name="table" size={12} color={viewFormat === 'grid' ? (isDark ? colors.brand[300] : colors.brand[700]) : (isDark ? colors.neutral[400] : colors.neutral[600])} />
                  <Text style={{ fontSize: 11, fontWeight: viewFormat === 'grid' ? '700' : '500', color: viewFormat === 'grid' ? (isDark ? colors.brand[300] : colors.brand[700]) : (isDark ? colors.neutral[400] : colors.neutral[600]) }}>
                    Data Grid Breakdown
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {Platform.OS === 'web' && viewFormat === 'pdf' && (docType === 'soa' || docType === 'op') ? (
            <View style={{ flex: 1, minHeight: 700, padding: SPACING[12] }}>
              {React.createElement('iframe', {
                src: pdfBlobUrl || (docType === 'soa' ? applicationService.getSoaPrintUrl(app.id) : applicationService.getOpPrintUrl(app.id)),
                style: { width: '100%', height: '100%', minHeight: '680px', border: 'none', borderRadius: '8px' },
                title: docType === 'soa' ? 'Official Statement of Account PDF' : 'Official Order of Payment PDF',
              })}
            </View>
          ) : (
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

                {/* Official soa-report-template.pdf Document Canvas */}
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

                  {/* Official NTC SOA Header */}
                  {soaOutputMode === 'plain_paper' ? (
                    <View style={{ marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 6 }}>
                        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isDark ? '#1e293b' : '#eff6ff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: isDark ? '#1e3a8a' : '#bfdbfe' }}>
                          <Text style={{ fontSize: 8.5, fontWeight: '800', color: isDark ? '#60a5fa' : '#1d4ed8', textAlign: 'center' }}>
                            SEAL
                          </Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
                          <Text style={{ fontSize: 10, textTransform: 'uppercase', color: isDark ? colors.neutral[400] : '#334155' }}>
                            Republic of the Philippines
                          </Text>
                          <Text style={{ fontSize: 9.5, fontWeight: '700', textTransform: 'uppercase', color: isDark ? colors.neutral[300] : '#1e293b', marginTop: 1 }}>
                            Department of Information and Communications Technology
                          </Text>
                          <Text style={{ fontSize: 12.5, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', color: isDark ? colors.neutral[100] : '#0f172a', marginTop: 2 }}>
                            National Telecommunications Commission
                          </Text>
                          <Text style={{ fontSize: 9.5, fontStyle: 'italic', color: isDark ? colors.neutral[400] : '#475569', marginTop: 1 }}>
                            Regional Office No. VII, Mandaue City, Cebu
                          </Text>
                        </View>
                        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isDark ? '#1e293b' : '#eff6ff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: isDark ? '#1e3a8a' : '#bfdbfe' }}>
                          <Text style={{ fontSize: 8.5, fontWeight: '800', color: isDark ? '#38bdf8' : '#0284c7', textAlign: 'center' }}>
                            NTC
                          </Text>
                        </View>
                      </View>

                      <View style={{ alignItems: 'center', marginVertical: 4 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: isDark ? colors.neutral[100] : '#0f172a' }}>
                          Statement of Account
                        </Text>
                        <Text style={{ fontSize: 8.5, fontStyle: 'italic', color: isDark ? colors.neutral[400] : '#64748b' }}>
                          (RC Code-Year of Issue-Mo. Of Issue-Series of the RC)
                        </Text>
                      </View>

                      {/* Payor Info Card */}
                      <View style={{ borderWidth: 1, borderColor: isDark ? colors.neutral[600] : '#000000', padding: 8, backgroundColor: isDark ? colors.neutral[800] : '#ffffff', marginTop: 4 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <View style={{ flex: 1.6, paddingRight: 8 }}>
                            <View style={{ flexDirection: 'row' }}>
                              <Text style={{ fontSize: 10.5, fontWeight: '700', color: isDark ? colors.neutral[200] : '#000000' }}>PAYOR: </Text>
                              <Text style={{ fontSize: 10.5, fontWeight: '700', color: isDark ? colors.brand[400] : '#0f172a' }}>{app.applicant}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 2 }}>
                              <Text style={{ fontSize: 9.5, color: isDark ? colors.neutral[400] : '#475569' }}>ACCOUNT / REF NO.: </Text>
                              <Text style={{ fontSize: 9.5, fontWeight: '600', color: isDark ? colors.neutral[200] : '#1e293b' }}>{app.referenceNumber || soaNumber}</Text>
                            </View>
                          </View>
                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <View style={{ flexDirection: 'row' }}>
                              <Text style={{ fontSize: 9.5, fontWeight: '600', color: isDark ? colors.neutral[400] : '#475569' }}>DATE: </Text>
                              <Text style={{ fontSize: 9.5, fontWeight: '700', color: isDark ? colors.neutral[200] : '#1e293b' }}>{currentMonthYear}</Text>
                            </View>
                            {app.dueDate ? (
                              <View style={{ flexDirection: 'row', marginTop: 2 }}>
                                <Text style={{ fontSize: 9.5, fontWeight: '600', color: isDark ? colors.neutral[400] : '#475569' }}>DUE DATE: </Text>
                                <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#dc2626' }}>{app.dueDate}</Text>
                              </View>
                            ) : null}
                          </View>
                        </View>
                      </View>

                      {/* Transaction Type Checkboxes Bar */}
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', borderWidth: 1, borderTopWidth: 0, borderColor: isDark ? colors.neutral[600] : '#000000', padding: 6, backgroundColor: isDark ? colors.neutral[900] : '#f8fafc', gap: 6 }}>
                        <Text style={{ fontSize: 8.5, fontWeight: '800', color: isDark ? colors.neutral[300] : '#334155' }}>TYPE:</Text>
                        {[
                          { label: 'NEW', checked: isNew },
                          { label: 'MOD', checked: isMod },
                          { label: 'CO', checked: isCo },
                          { label: 'MA', checked: isMa },
                          { label: 'REN', checked: isRen },
                          { label: 'DUP', checked: isDup },
                          { label: 'CV', checked: isCv },
                          { label: 'ROC', checked: isRoc },
                          { label: 'OTHERS', checked: !isNew && !isRen && !isMod && !isDup && !isCv && !isRoc && !isCo && !isMa },
                        ].map((chk) => (
                          <View key={chk.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                            <Text style={{ fontSize: 8.5, fontWeight: '700', color: chk.checked ? (isDark ? colors.brand[400] : '#0284c7') : (isDark ? colors.neutral[500] : '#94a3b8') }}>
                              {chk.checked ? '[✔]' : '[ ]'}
                            </Text>
                            <Text style={{ fontSize: 8.5, color: isDark ? colors.neutral[300] : '#334155', fontWeight: chk.checked ? '700' : '400' }}>
                              {chk.label}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ) : null}

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

                  {/* Notes, OR Stamp Box, and Signatures */}
                  {soaOutputMode === 'plain_paper' ? (
                    <View style={{ marginTop: 12, gap: 10 }}>
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        {/* Left Column: Remarks & OR Stamp Box */}
                        <View style={{ flex: 1.2, gap: 8 }}>
                          <View>
                            <Text style={{ fontSize: 8.5, fontWeight: '700', color: isDark ? colors.neutral[300] : '#334155' }}>
                              NOTES / REMARKS:
                            </Text>
                            <Text style={{ fontSize: 8, color: isDark ? colors.neutral[400] : '#64748b', lineHeight: 12, marginTop: 2 }}>
                              1) Use additional sheets, if necessary to show detailed computation.{'\n'}
                              2) Payment should be in cash or cashier's check payable to National Telecommunications Commission.
                            </Text>
                          </View>

                          {/* Official Receipt Stamp Box */}
                          <View style={{ borderWidth: 1, borderColor: isDark ? colors.neutral[600] : '#000000', padding: 6, backgroundColor: isDark ? colors.neutral[800] : '#f8fafc' }}>
                            <Text style={{ fontSize: 8.5, fontWeight: '800', textAlign: 'center', marginBottom: 4, color: isDark ? colors.neutral[200] : '#0f172a' }}>
                              OFFICIAL RECEIPT STAMP
                            </Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                              <Text style={{ fontSize: 8.5, color: isDark ? colors.neutral[400] : '#475569' }}>O.R. NO.: <Text style={{ fontWeight: '700', color: isDark ? colors.neutral[200] : '#000000' }}>{app.payment.orNumber || '________________'}</Text></Text>
                              <Text style={{ fontSize: 8.5, color: isDark ? colors.neutral[400] : '#475569' }}>AMOUNT: <Text style={{ fontWeight: '700', color: isDark ? colors.neutral[200] : '#000000' }}>{app.payment.amountReceived ? `₱ ${app.payment.amountReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '________________'}</Text></Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                              <Text style={{ fontSize: 8.5, color: isDark ? colors.neutral[400] : '#475569' }}>DATE: <Text style={{ fontWeight: '600', color: isDark ? colors.neutral[200] : '#000000' }}>{app.payment.orNumber ? (app.updatedAt ? new Date(app.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '________________') : '________________'}</Text></Text>
                              <Text style={{ fontSize: 8.5, color: isDark ? colors.neutral[400] : '#475569' }}>BY: <Text style={{ fontWeight: '600', color: isDark ? colors.neutral[200] : '#000000' }}>{app.issuingOfficer || app.evaluatingOfficer || 'Collecting Officer'}</Text></Text>
                            </View>
                          </View>
                        </View>

                        {/* Right Column: Status & Signatures */}
                        <View style={{ flex: 1, paddingLeft: 8, justifyContent: 'space-between' }}>
                          <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
                            <Text style={{ fontSize: 8.5, fontWeight: '700', color: isForAssessmentOnly ? (isDark ? colors.brand[400] : '#0284c7') : (isDark ? colors.neutral[500] : '#94a3b8') }}>
                              {isForAssessmentOnly ? '[✔] FOR ASSESSMENT ONLY' : '[ ] FOR ASSESSMENT ONLY'}
                            </Text>
                            <Text style={{ fontSize: 8.5, fontWeight: '700', color: !isForAssessmentOnly ? (isDark ? colors.brand[400] : '#0284c7') : (isDark ? colors.neutral[500] : '#94a3b8') }}>
                              {!isForAssessmentOnly ? '[✔] ENDORSED FOR PAYMENT' : '[ ] ENDORSED FOR PAYMENT'}
                            </Text>
                          </View>

                          {/* Evaluator Signature */}
                          <View style={{ marginTop: 8 }}>
                            <Text style={{ fontSize: 8, color: isDark ? colors.neutral[400] : '#64748b' }}>PREPARED / EVALUATED BY:</Text>
                            <View style={{ borderBottomWidth: 1, borderBottomColor: isDark ? colors.neutral[600] : '#000000', height: 16, marginBottom: 2 }} />
                            <Text style={{ fontSize: 9, fontWeight: '700', textAlign: 'center', color: isDark ? colors.neutral[200] : '#0f172a' }}>
                              {app.evaluatingOfficer || 'AUTHORIZED EVALUATOR'}
                            </Text>
                            <Text style={{ fontSize: 7.5, fontStyle: 'italic', textAlign: 'center', color: isDark ? colors.neutral[400] : '#64748b' }}>
                              EVALUATOR, NTC XIV
                            </Text>
                          </View>

                          {/* Approved By Signature */}
                          <View style={{ marginTop: 6 }}>
                            <Text style={{ fontSize: 8, color: isDark ? colors.neutral[400] : '#64748b' }}>APPROVED BY:</Text>
                            <View style={{ borderBottomWidth: 1, borderBottomColor: isDark ? colors.neutral[600] : '#000000', height: 16, marginBottom: 2 }} />
                            <Text style={{ fontSize: 9, fontWeight: '700', textAlign: 'center', color: isDark ? colors.neutral[200] : '#0f172a' }}>
                              {app.issuingOfficer || 'CHIEF, OPERATIONS DIVISION'}
                            </Text>
                            <Text style={{ fontSize: 7.5, fontStyle: 'italic', textAlign: 'center', color: isDark ? colors.neutral[400] : '#64748b' }}>
                              CEOD, NTC XIV
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ) : null}
                </View>
              </View>
            )}

            {docType === 'op' && (
              <View style={{ gap: 16 }}>
                {/* 2-up Layout Notice */}
                <View
                  style={{
                    padding: 8,
                    backgroundColor: isDark ? '#064e3b15' : '#ecfdf5',
                    borderWidth: 1,
                    borderColor: isDark ? '#065f46' : '#a7f3d0',
                    borderRadius: RADIUS.xs,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Lucide name="check-circle" size={14} color="#059669" />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#34d399' : '#065f46' }}>
                      Official NTC 2-Up Accountable Form (Payor Copy &amp; Collecting Officer Copy)
                    </Text>
                  </View>
                  <Text style={{ fontSize: 10, color: isDark ? colors.neutral[400] : colors.neutral[600] }}>
                    Ref: order-of-payment-template.pdf
                  </Text>
                </View>

                {/* Upper Voucher: Payor's Copy */}
                {renderOpVoucher("Payor's Copy")}

                {/* Perforation Cut Line */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginVertical: 4,
                  }}
                >
                  <View style={{ flex: 1, height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: isDark ? colors.neutral[600] : colors.neutral[400] }} />
                  <View style={{ paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Lucide name="scissors" size={14} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
                    <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1, color: isDark ? colors.neutral[400] : colors.neutral[500] }}>
                      CUT HERE
                    </Text>
                  </View>
                  <View style={{ flex: 1, height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: isDark ? colors.neutral[600] : colors.neutral[400] }} />
                </View>

                {/* Lower Voucher: Collecting Officer's Copy */}
                {renderOpVoucher("Collecting Officer's Copy")}
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
          )}

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
