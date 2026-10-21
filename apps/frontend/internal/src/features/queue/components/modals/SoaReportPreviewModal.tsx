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
  Animated,
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
  formatAddress,
  numberToWords,
} from '../../utils/soaReportGenerator';

interface PdfLoadBarProps {
  height?: number;
}

function PdfLoadBar({ height = 5 }: PdfLoadBarProps) {
  const { colors, isDark } = useTheme();
  const anim = React.useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(300);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-containerWidth * 0.4, containerWidth],
  });

  return (
    <View
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0) {
          setContainerWidth(w);
        }
      }}
      style={{
        width: '100%',
        height,
        backgroundColor: isDark ? colors.neutral[800] : colors.neutral[200],
        borderRadius: height / 2,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '35%',
          backgroundColor: isDark ? colors.brand[400] : colors.brand[600],
          borderRadius: height / 2,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
}

export type ReportDocumentType = 'soa' | 'op' | 'or' | 'summary';

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
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [opCopyView, setOpCopyView] = useState<'both' | 'payor' | 'collecting'>('both');
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const [orTemplate, setOrTemplate] = useState<'portrait' | 'landscape'>('landscape');

  const orRaw = app.payment?.orNumber ?? null;
  const orList = orRaw
    ? orRaw
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];
  const [selectedOrNumber, setSelectedOrNumber] = useState<string | null>(null);
  const effectiveSelectedOr = selectedOrNumber && orList.includes(selectedOrNumber)
    ? selectedOrNumber
    : (orList[0] || null);

  useEffect(() => {
    if (visible) {
      setDocType(initialDocType);
      setViewFormat('pdf');
      setOrTemplate('landscape');
      setShowActionMenu(false);
      if (orList.length > 0) {
        setSelectedOrNumber(orList[0]);
      } else {
        setSelectedOrNumber(null);
      }
    }
  }, [visible, initialDocType]);

  useEffect(() => {
    if (!showActionMenu) return;
    const handleOutsideClick = () => {
      setShowActionMenu(false);
    };
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        window.addEventListener('click', handleOutsideClick);
        window.addEventListener('blur', handleOutsideClick);
      }, 50);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('click', handleOutsideClick);
        window.removeEventListener('blur', handleOutsideClick);
      };
    }
  }, [showActionMenu]);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (Platform.OS === 'web' && viewFormat === 'pdf' && (docType === 'soa' || docType === 'op' || docType === 'or')) {
      setIsLoadingPdf(true);
      setPdfError(null);
      setPdfBlobUrl(null);

      const loadBlob = async () => {
        try {
          const [blob, err] = docType === 'soa'
            ? await applicationService.previewSoaPdf(app.id)
            : docType === 'op'
              ? await applicationService.previewOpPdf(app.id)
              : await applicationService.previewOrPdf(app.id, effectiveSelectedOr ?? undefined, orTemplate);

          if (!active) {
            return;
          }

          if (err !== null || blob === null) {
            const errDetail = typeof err === 'string' && err.trim().length > 0
              ? err
              : `Failed to generate official ${docType.toUpperCase()} document.`;
            setPdfError(errDetail);
            setIsLoadingPdf(false);
            return;
          }

          if (typeof window !== 'undefined') {
            createdUrl = window.URL.createObjectURL(blob);
            setPdfBlobUrl(createdUrl);
            setIsLoadingPdf(false);
          }
        } catch (fetchErr: unknown) {
          if (!active) {
            return;
          }
          const errorMessage = fetchErr instanceof Error ? fetchErr.message : 'Error generating official document';
          setPdfError(errorMessage);
          setIsLoadingPdf(false);
        }
      };

      void loadBlob();
    } else {
      setIsLoadingPdf(false);
      setPdfError(null);
    }

    return () => {
      active = false;
      if (createdUrl !== null && typeof window !== 'undefined') {
        window.URL.revokeObjectURL(createdUrl);
      }
    };
  }, [app.id, docType, viewFormat, reloadKey, effectiveSelectedOr, orTemplate]);

  const handleRetryPdf = () => {
    setReloadKey((prev) => prev + 1);
  };

  const dateObj = app.createdAt ? new Date(app.createdAt) : new Date();

  const handlePrint = async () => {
    if (docType === 'soa' || docType === 'op' || docType === 'or') {
      try {
        const [pdfBlob, err] = docType === 'soa'
          ? await applicationService.previewSoaPdf(app.id)
          : docType === 'op'
            ? await applicationService.previewOpPdf(app.id)
            : await applicationService.previewOrPdf(app.id, effectiveSelectedOr ?? undefined, orTemplate);

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
        : docType === 'op'
          ? applicationService.getOpPrintUrl(app.id)
          : applicationService.getOrPrintUrl(app.id, effectiveSelectedOr ?? undefined, orTemplate);

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

  const handleDownloadSpecificPdf = async (
    targetDoc: ReportDocumentType,
    targetOrNumber?: string,
    targetTemplate?: 'portrait' | 'landscape'
  ) => {
    if (targetDoc === 'summary') {
      const html = generateFullApplicationSummaryHtml(app);
      openPrintableDocumentWindow(html);
      return;
    }

    const resolvedOr = targetOrNumber || effectiveSelectedOr || undefined;
    const resolvedTemplate = targetTemplate || orTemplate;

    try {
      const [pdfBlob, err] = targetDoc === 'soa'
        ? await applicationService.downloadSoaPdf(app.id)
        : targetDoc === 'op'
          ? await applicationService.downloadOpPdf(app.id)
          : await applicationService.downloadOrPdf(app.id, resolvedOr, resolvedTemplate);

      if (pdfBlob !== null && err === null && Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
        const blobUrl = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = blobUrl;
        const ref = targetDoc === 'or' && (resolvedOr || app.payment?.orNumber)
          ? (resolvedOr || app.payment?.orNumber)
          : (app.referenceNumber ? app.referenceNumber : (app.id ? app.id.slice(0, 8).toUpperCase() : 'DOC'));
        const suffix = targetDoc === 'or' ? `_${resolvedTemplate.toUpperCase()}` : '';
        link.download = `${targetDoc.toUpperCase()}_${ref}${suffix}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
        return;
      }
    } catch (err) {
      console.warn('Direct blob download failed, falling back to direct URL open:', err);
    }

    const url = targetDoc === 'soa'
      ? applicationService.getSoaDownloadUrl(app.id)
      : targetDoc === 'op'
        ? applicationService.getOpDownloadUrl(app.id)
        : applicationService.getOrDownloadUrl(app.id, resolvedOr, resolvedTemplate);

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      void Linking.openURL(url);
    }
  };

  const handleDownloadPdf = () => {
    void handleDownloadSpecificPdf(docType, effectiveSelectedOr ?? undefined);
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
              in the amount of{' '}
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
              backgroundColor: isDark ? colors.neutral[800] : '#ffffff',
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
              backgroundColor: isDark ? colors.neutral[800] : '#ffffff',
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
                  name={docType === 'or' ? 'check-circle' : docType === 'op' ? 'credit-card' : docType === 'summary' ? 'layout' : 'file-text'}
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
                  Application Reports • {docType === 'soa' ? 'Statement of Account (SOA)' : docType === 'op' ? 'Order of Payment (OP)' : docType === 'or' ? 'Official Receipt (OR)' : 'Application Dossier'}
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                  ]}
                >
                  Ref #{app.referenceNumber ?? app.id.slice(0, 8).toUpperCase()} • {app.applicant}
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <Pressable
                style={[
                  styles.printHeaderBtn,
                  { backgroundColor: isDark ? colors.brand[500] : colors.brand[700] },
                ]}
                onPress={() => {
                  setShowActionMenu(false);
                  handlePrint();
                }}
              >
                <Lucide name="printer" size={14} color={COLORS.neutral.white} />
                <Text style={styles.printHeaderBtnText}>Print</Text>
              </Pressable>

              {/* 3-Dots More Options Menu Button */}
              <Pressable
                onPress={(e) => {
                  if ('stopPropagation' in e && typeof e.stopPropagation === 'function') {
                    e.stopPropagation();
                  }
                  setShowActionMenu((prev) => !prev);
                }}
                style={[
                  styles.menuTriggerBtn,
                  {
                    borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                    backgroundColor: showActionMenu
                      ? (isDark ? colors.neutral[800] : colors.neutral[100])
                      : (isDark ? colors.neutral[900] : COLORS.neutral.white),
                  },
                ]}
                accessibilityLabel="More options"
              >
                <Lucide name="more-vertical" size={17} color={isDark ? colors.neutral[300] : colors.neutral[700]} />
              </Pressable>

              <Pressable
                style={styles.closeBtn}
                onPress={() => {
                  setShowActionMenu(false);
                  onClose();
                }}
                hitSlop={8}
              >
                <Lucide
                  name="x"
                  size={20}
                  color={isDark ? colors.neutral[400] : colors.neutral[500]}
                />
              </Pressable>
            </View>

            {/* Dropdown Menu from 3-Dots */}
            {showActionMenu && (
              <View
                style={[
                  styles.dropdownMenu,
                  {
                    backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
                    borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                  },
                ]}
                onTouchStart={(e) => {
                  if ('stopPropagation' in e && typeof e.stopPropagation === 'function') {
                    e.stopPropagation();
                  }
                }}
              >
                <View style={styles.dropdownSectionHeader}>
                  <Text style={[styles.dropdownSectionTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                    DOWNLOAD OFFICIAL PDF
                  </Text>
                </View>

                <Pressable
                  style={styles.dropdownMenuItem}
                  onPress={() => {
                    setShowActionMenu(false);
                    void handleDownloadSpecificPdf('soa');
                  }}
                >
                  <Lucide name="file-text" size={15} color={isDark ? colors.brand[400] : colors.brand[600]} />
                  <View style={styles.dropdownMenuTextContainer}>
                    <Text style={[styles.dropdownMenuItemText, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                      Statement of Account (SOA)
                    </Text>
                    <Text style={[styles.dropdownMenuItemSubtext, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                      Official Vector PDF • #{soaNumber}
                    </Text>
                  </View>
                  <Lucide name="download" size={13} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
                </Pressable>

                <Pressable
                  style={styles.dropdownMenuItem}
                  onPress={() => {
                    setShowActionMenu(false);
                    void handleDownloadSpecificPdf('op');
                  }}
                >
                  <Lucide name="credit-card" size={15} color={isDark ? '#34d399' : '#059669'} />
                  <View style={styles.dropdownMenuTextContainer}>
                    <Text style={[styles.dropdownMenuItemText, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                      Order of Payment (OP)
                    </Text>
                    <Text style={[styles.dropdownMenuItemSubtext, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                      Official Vector PDF • #{opNumber}
                    </Text>
                  </View>
                  <Lucide name="download" size={13} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
                </Pressable>

                {Boolean((app.payment && app.payment.orNumber && app.payment.orNumber.trim().length > 0) || app.status === 'ForIssuance' || app.status === 'Completed') && (
                  <>
                    {orList.length > 1 ? (
                      orList.map((token, idx) => {
                        const label = token.startsWith('#') ? token : `#${token}`;
                        return (
                          <Pressable
                            key={token}
                            style={styles.dropdownMenuItem}
                            onPress={() => {
                              setShowActionMenu(false);
                              void handleDownloadSpecificPdf('or', token);
                            }}
                          >
                            <Lucide name="check-circle" size={15} color={isDark ? '#34d399' : '#059669'} />
                            <View style={styles.dropdownMenuTextContainer}>
                              <Text style={[styles.dropdownMenuItemText, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                                Official Receipt {label}
                              </Text>
                              <Text style={[styles.dropdownMenuItemSubtext, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                                Accountable Form 51 • Receipt {idx + 1} of {orList.length}
                              </Text>
                            </View>
                            <Lucide name="download" size={13} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
                          </Pressable>
                        );
                      })
                    ) : (
                      <Pressable
                        style={styles.dropdownMenuItem}
                        onPress={() => {
                          setShowActionMenu(false);
                          void handleDownloadSpecificPdf('or');
                        }}
                      >
                        <Lucide name="check-circle" size={15} color={isDark ? '#34d399' : '#059669'} />
                        <View style={styles.dropdownMenuTextContainer}>
                          <Text style={[styles.dropdownMenuItemText, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                            Official Receipt (OR)
                          </Text>
                          <Text style={[styles.dropdownMenuItemSubtext, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                            Accountable Form 51 • #{app.payment?.orNumber || 'Official'}
                          </Text>
                        </View>
                        <Lucide name="download" size={13} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
                      </Pressable>
                    )}
                  </>
                )}

                <Pressable
                  style={styles.dropdownMenuItem}
                  onPress={() => {
                    setShowActionMenu(false);
                    void handleDownloadSpecificPdf('summary');
                  }}
                >
                  <Lucide name="layout" size={15} color={isDark ? colors.neutral[300] : colors.neutral[600]} />
                  <View style={styles.dropdownMenuTextContainer}>
                    <Text style={[styles.dropdownMenuItemText, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                      Application Dossier Summary
                    </Text>
                    <Text style={[styles.dropdownMenuItemSubtext, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                      Complete Application Assessment Dossier
                    </Text>
                  </View>
                  <Lucide name="download" size={13} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
                </Pressable>

                {Platform.OS === 'web' && (
                  <>
                    <View style={[styles.dropdownDivider, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[200] }]} />
                    <Pressable
                      style={styles.dropdownMenuItem}
                      onPress={() => {
                        setShowActionMenu(false);
                        setReloadKey((k) => k + 1);
                      }}
                    >
                      <Lucide name="refresh-cw" size={14} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
                      <View style={styles.dropdownMenuTextContainer}>
                        <Text style={[styles.dropdownMenuItemText, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                          Reload Current Template
                        </Text>
                        <Text style={[styles.dropdownMenuItemSubtext, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                          Fetch fresh template from server
                        </Text>
                      </View>
                    </Pressable>
                  </>
                )}
              </View>
            )}
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
              onPress={() => {
                setDocType('soa');
                setViewFormat('pdf');
              }}
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

            {Boolean((app.payment && app.payment.orNumber && app.payment.orNumber.trim().length > 0) || app.status === 'ForIssuance' || app.status === 'Completed' || initialDocType === 'or') && (
              <Pressable
                style={[
                  styles.tabItem,
                  docType === 'or' && {
                    backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                    borderColor: isDark ? colors.brand[500] : colors.brand[600],
                  },
                ]}
                onPress={() => {
                  setDocType('or');
                  setViewFormat('pdf');
                }}
              >
                <Lucide
                  name="check-circle"
                  size={14}
                  color={
                    docType === 'or'
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
                        docType === 'or'
                          ? isDark
                            ? colors.brand[400]
                            : colors.brand[700]
                          : isDark
                          ? colors.neutral[400]
                          : colors.neutral[600],
                      fontWeight: docType === 'or' ? '700' : '500',
                    },
                  ]}
                >
                  Official Receipt (OR) {orList.length > 1 ? `(${orList.length})` : ''}
                </Text>
              </Pressable>
            )}

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

          {/* Multi-OR Selector Bar for Cashier / Internal Users */}
          {docType === 'or' && orList.length > 1 && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                paddingHorizontal: SPACING[16],
                paddingVertical: 8,
                backgroundColor: isDark ? colors.neutral[800] : '#ECFDF5',
                borderBottomWidth: 1,
                borderBottomColor: isDark ? colors.neutral[700] : '#A7F3D0',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: isDark ? '#34D399' : '#065F46',
                }}
              >
                MULTIPLE RECEIPTS ({orList.length}):
              </Text>
              {orList.map((token, idx) => {
                const isSelected = effectiveSelectedOr === token;
                const label = token.startsWith('#') ? token : `#${token}`;
                return (
                  <Pressable
                    key={token}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 6,
                      backgroundColor: isSelected
                        ? (isDark ? '#065F46' : '#10B981')
                        : (isDark ? colors.neutral[800] : '#FFFFFF'),
                      borderWidth: 1,
                      borderColor: isSelected
                        ? (isDark ? '#34D399' : '#059669')
                        : (isDark ? colors.neutral[700] : '#CBD5E1'),
                    }}
                    onPress={() => setSelectedOrNumber(token)}
                  >
                    <Lucide
                      name="check-circle"
                      size={12}
                      color={isSelected ? '#FFFFFF' : (isDark ? colors.neutral[400] : '#64748B')}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: isSelected ? '700' : '500',
                        color: isSelected ? '#FFFFFF' : (isDark ? colors.neutral[200] : '#334155'),
                      }}
                    >
                      OR {label} {idx === 0 ? '(Part 1)' : `(Part ${idx + 1})`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Format Selector on Web: Official PDF Template vs Data Grid */}
          {Platform.OS === 'web' && docType === 'op' && (
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

          {/* Template Selector on Web for OR: Landscape vs Portrait */}
          {Platform.OS === 'web' && docType === 'or' && (
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Lucide name="printer" size={13} color={isDark ? colors.neutral[400] : colors.neutral[600]} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? colors.neutral[400] : colors.neutral[600] }}>
                  OR TEMPLATE FORMAT:
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Pressable
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: RADIUS.xs,
                    backgroundColor: orTemplate === 'landscape' ? (isDark ? colors.brand[900] : colors.brand[100]) : 'transparent',
                    borderWidth: 1,
                    borderColor: orTemplate === 'landscape' ? (isDark ? colors.brand[500] : colors.brand[600]) : 'transparent',
                  }}
                  onPress={() => setOrTemplate('landscape')}
                >
                  <Lucide
                    name="layout"
                    size={12}
                    color={orTemplate === 'landscape' ? (isDark ? colors.brand[300] : colors.brand[700]) : (isDark ? colors.neutral[400] : colors.neutral[600])}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: orTemplate === 'landscape' ? '700' : '500',
                      color: orTemplate === 'landscape' ? (isDark ? colors.brand[300] : colors.brand[700]) : (isDark ? colors.neutral[400] : colors.neutral[600]),
                    }}
                  >
                    Landscape (AF-51 Template)
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
                    backgroundColor: orTemplate === 'portrait' ? (isDark ? colors.brand[900] : colors.brand[100]) : 'transparent',
                    borderWidth: 1,
                    borderColor: orTemplate === 'portrait' ? (isDark ? colors.brand[500] : colors.brand[600]) : 'transparent',
                  }}
                  onPress={() => setOrTemplate('portrait')}
                >
                  <Lucide
                    name="file-text"
                    size={12}
                    color={orTemplate === 'portrait' ? (isDark ? colors.brand[300] : colors.brand[700]) : (isDark ? colors.neutral[400] : colors.neutral[600])}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: orTemplate === 'portrait' ? '700' : '500',
                      color: orTemplate === 'portrait' ? (isDark ? colors.brand[300] : colors.brand[700]) : (isDark ? colors.neutral[400] : colors.neutral[600]),
                    }}
                  >
                    Portrait (Standard)
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {Platform.OS === 'web' && (docType === 'soa' || docType === 'op' || docType === 'or') && isLoadingPdf && (
            <View style={{ width: '100%', height: 3, overflow: 'hidden' }}>
              <PdfLoadBar height={3} />
            </View>
          )}

          {Platform.OS === 'web' && viewFormat === 'pdf' && (docType === 'soa' || docType === 'op' || docType === 'or') ? (
            <View style={{ flex: 1, minHeight: 700, padding: SPACING[12] }}>
              {isLoadingPdf ? (
                <View
                  style={{
                    flex: 1,
                    minHeight: 650,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: isDark ? colors.neutral[900] : '#ffffff',
                    borderRadius: RADIUS.card,
                    borderWidth: 1,
                    borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
                    padding: SPACING[24],
                  }}
                >
                  <View
                    style={{
                      width: '100%',
                      maxWidth: 460,
                      alignItems: 'center',
                      gap: SPACING[16],
                    }}
                  >
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: isDark ? colors.brand[900] : colors.brand[50],
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: isDark ? colors.brand[700] : colors.brand[200],
                      }}
                    >
                      <Lucide name={docType === 'or' ? 'check-circle' : 'file-text'} size={28} color={isDark ? colors.brand[400] : colors.brand[600]} />
                    </View>

                    <View style={{ alignItems: 'center', gap: 6 }}>
                      <Text
                        style={{
                          fontFamily: TYPOGRAPHY.fonts.primary,
                          fontSize: 16,
                          fontWeight: '700',
                          color: isDark ? colors.neutral[100] : colors.neutral[900],
                          textAlign: 'center',
                        }}
                      >
                        Generating Official {docType === 'soa' ? 'Statement of Account' : docType === 'op' ? 'Order of Payment' : 'Official Receipt'}...
                      </Text>
                      <Text
                        style={{
                          fontFamily: TYPOGRAPHY.fonts.primary,
                          fontSize: 12,
                          color: isDark ? colors.neutral[400] : colors.neutral[600],
                          textAlign: 'center',
                          lineHeight: 18,
                        }}
                      >
                        Synthesizing official NTC vector form using backend AcroForm and QuestPDF services.
                      </Text>
                    </View>

                    {/* Animated Load Bar */}
                    <View style={{ width: '100%', marginTop: SPACING[8] }}>
                      <PdfLoadBar height={6} />
                    </View>

                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: RADIUS.circle,
                        backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                        borderWidth: 1,
                        borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '600',
                          color: isDark ? colors.neutral[300] : colors.neutral[700],
                        }}
                      >
                        {docType === 'soa'
                          ? 'Referencing Order of Payment (OP) for assessment fees'
                          : docType === 'op'
                            ? 'Preparing 2-Up Accountable Form layout'
                            : 'Synthesizing canonical Official Receipt (OR) form'}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : pdfError !== null ? (
                <View
                  style={{
                    flex: 1,
                    minHeight: 650,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: isDark ? colors.neutral[900] : '#fef2f2',
                    borderRadius: RADIUS.card,
                    borderWidth: 1,
                    borderColor: isDark ? '#7f1d1d' : '#fecaca',
                    padding: SPACING[24],
                  }}
                >
                  <View
                    style={{
                      width: '100%',
                      maxWidth: 480,
                      alignItems: 'center',
                      gap: SPACING[16],
                    }}
                  >
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: isDark ? '#450a0a' : '#fee2e2',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Lucide name="alert-triangle" size={28} color="#dc2626" />
                    </View>

                    <View style={{ alignItems: 'center', gap: 6 }}>
                      <Text
                        style={{
                          fontFamily: TYPOGRAPHY.fonts.primary,
                          fontSize: 16,
                          fontWeight: '700',
                          color: isDark ? '#fca5a5' : '#991b1b',
                          textAlign: 'center',
                        }}
                      >
                        Unable to Preview {docType === 'soa' ? 'Statement of Account' : docType === 'op' ? 'Order of Payment' : 'Official Receipt'} PDF
                      </Text>
                      <Text
                        style={{
                          fontFamily: TYPOGRAPHY.fonts.primary,
                          fontSize: 12,
                          color: isDark ? colors.neutral[400] : colors.neutral[600],
                          textAlign: 'center',
                          lineHeight: 18,
                        }}
                      >
                        {pdfError}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                      <Pressable
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: RADIUS.sm,
                          backgroundColor: isDark ? colors.brand[600] : colors.brand[700],
                        }}
                        onPress={handleRetryPdf}
                      >
                        <Lucide name="refresh-cw" size={14} color="#ffffff" />
                        <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>Retry</Text>
                      </Pressable>

                      {docType === 'op' && (
                        <Pressable
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: RADIUS.sm,
                            backgroundColor: isDark ? colors.neutral[800] : colors.neutral[200],
                            borderWidth: 1,
                            borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                          }}
                          onPress={() => setViewFormat('grid')}
                        >
                          <Lucide name="table" size={14} color={isDark ? colors.neutral[200] : colors.neutral[800]} />
                          <Text style={{ color: isDark ? colors.neutral[200] : colors.neutral[800], fontSize: 12, fontWeight: '600' }}>
                            Switch to Data Grid
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              ) : pdfBlobUrl !== null ? (
                React.createElement('iframe', {
                  src: pdfBlobUrl,
                  style: { width: '100%', height: '100%', minHeight: '680px', border: 'none', borderRadius: '8px' },
                  title: docType === 'soa' ? 'Official Statement of Account PDF' : docType === 'op' ? 'Official Order of Payment PDF' : 'Official Receipt PDF',
                })
              ) : null}
            </View>
          ) : (
            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.bodyContent}
              showsVerticalScrollIndicator={false}
            >
{docType === 'soa' && (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: SPACING[24],
                  backgroundColor: isDark ? colors.neutral[900] : '#ffffff',
                  borderRadius: RADIUS.card,
                  borderWidth: 1,
                  borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
                  gap: SPACING[16],
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: isDark ? colors.brand[900] : colors.brand[50],
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Lucide name="file-text" size={28} color={isDark ? colors.brand[400] : colors.brand[600]} />
                </View>

                <View style={{ alignItems: 'center', gap: 4 }}>
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 16,
                      fontWeight: '700',
                      color: isDark ? colors.neutral[100] : colors.neutral[900],
                    }}
                  >
                    Official Statement of Account
                  </Text>
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 12,
                      color: isDark ? colors.neutral[400] : colors.neutral[600],
                      textAlign: 'center',
                    }}
                  >
                    Standard Accountable Template: soa-report-template.pdf
                  </Text>
                </View>

                <View
                  style={{
                    width: '100%',
                    maxWidth: 520,
                    padding: SPACING[16],
                    backgroundColor: isDark ? colors.neutral[800] : '#ffffff',
                    borderRadius: RADIUS.sm,
                    borderWidth: 1,
                    borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                    gap: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, color: isDark ? colors.neutral[400] : colors.neutral[600] }}>Payor:</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? colors.neutral[100] : colors.neutral[900] }}>
                      {app.applicant}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, color: isDark ? colors.neutral[400] : colors.neutral[600] }}>Account / Ref No:</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', fontFamily: 'monospace', color: isDark ? colors.brand[400] : colors.brand[700] }}>
                      {app.referenceNumber || app.id}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, color: isDark ? colors.neutral[400] : colors.neutral[600] }}>Due Date:</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#dc2626' }}>
                      {app.dueDate || '30 days from issuance'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, color: isDark ? colors.neutral[400] : colors.neutral[600] }}>Prepared By (Evaluator):</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? colors.neutral[100] : colors.neutral[900] }}>
                      {app.soaPreparedByName || app.evaluatingOfficer || 'AUTHORIZED EVALUATOR'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, color: isDark ? colors.neutral[400] : colors.neutral[600] }}>Approved By (Chief, EOD):</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? colors.neutral[100] : colors.neutral[900] }}>
                      {app.soaApprovedByName || app.issuingOfficer || app.endorsedTo || 'CHIEF, EOD'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

                        {docType === 'op' && (
              <View style={{ gap: 16 }}>
                {/* 2-up Layout Notice & Copy Selector */}
                <View
                  style={{
                    padding: 8,
                    backgroundColor: isDark ? '#064e3b15' : '#ecfdf5',
                    borderWidth: 1,
                    borderColor: isDark ? '#065f46' : '#a7f3d0',
                    borderRadius: RADIUS.xs,
                    gap: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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

                  {/* Copy View Segmented Controls */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 10.5, fontWeight: '600', color: isDark ? colors.neutral[400] : colors.neutral[600] }}>
                      View Copy:
                    </Text>
                    <Pressable
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: RADIUS.xs,
                        backgroundColor: opCopyView === 'both' ? (isDark ? '#065f46' : '#d1fae5') : 'transparent',
                        borderWidth: 1,
                        borderColor: opCopyView === 'both' ? '#059669' : (isDark ? colors.neutral[700] : colors.neutral[300]),
                      }}
                      onPress={() => setOpCopyView('both')}
                    >
                      <Text style={{ fontSize: 10, fontWeight: opCopyView === 'both' ? '700' : '500', color: opCopyView === 'both' ? (isDark ? '#ecfdf5' : '#065f46') : (isDark ? colors.neutral[300] : colors.neutral[600]) }}>
                        All Copies (2-Up Form)
                      </Text>
                    </Pressable>

                    <Pressable
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: RADIUS.xs,
                        backgroundColor: opCopyView === 'payor' ? (isDark ? '#065f46' : '#d1fae5') : 'transparent',
                        borderWidth: 1,
                        borderColor: opCopyView === 'payor' ? '#059669' : (isDark ? colors.neutral[700] : colors.neutral[300]),
                      }}
                      onPress={() => setOpCopyView('payor')}
                    >
                      <Text style={{ fontSize: 10, fontWeight: opCopyView === 'payor' ? '700' : '500', color: opCopyView === 'payor' ? (isDark ? '#ecfdf5' : '#065f46') : (isDark ? colors.neutral[300] : colors.neutral[600]) }}>
                        Payor's Copy Only
                      </Text>
                    </Pressable>

                    <Pressable
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: RADIUS.xs,
                        backgroundColor: opCopyView === 'collecting' ? (isDark ? '#065f46' : '#d1fae5') : 'transparent',
                        borderWidth: 1,
                        borderColor: opCopyView === 'collecting' ? '#059669' : (isDark ? colors.neutral[700] : colors.neutral[300]),
                      }}
                      onPress={() => setOpCopyView('collecting')}
                    >
                      <Text style={{ fontSize: 10, fontWeight: opCopyView === 'collecting' ? '700' : '500', color: opCopyView === 'collecting' ? (isDark ? '#ecfdf5' : '#065f46') : (isDark ? colors.neutral[300] : colors.neutral[600]) }}>
                        Collecting Officer Copy Only
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Upper Voucher: Payor's Copy */}
                {(opCopyView === 'both' || opCopyView === 'payor') && renderOpVoucher("Payor's Copy")}

                {/* Perforation Cut Line */}
                {opCopyView === 'both' && (
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
                )}

                {/* Lower Voucher: Collecting Officer's Copy */}
                {(opCopyView === 'both' || opCopyView === 'collecting') && renderOpVoucher("Collecting Officer's Copy")}
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
    height: '92%',
    maxHeight: '94%',
    borderRadius: RADIUS.dialog,
    borderWidth: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ...SHADOWS.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
    position: 'relative',
    zIndex: 100,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  printHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: RADIUS.xs,
  },
  printHeaderBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  menuTriggerBtn: {
    padding: 7,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 54,
    right: 16,
    width: 280,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 50,
    zIndex: 1000,
  },
  dropdownSectionHeader: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 4,
  },
  dropdownSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  dropdownMenuTextContainer: {
    flex: 1,
  },
  dropdownMenuItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12.5,
    fontWeight: '600',
  },
  dropdownMenuItemSubtext: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10.5,
    marginTop: 1,
  },
  dropdownDivider: {
    height: 1,
    marginVertical: 4,
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
