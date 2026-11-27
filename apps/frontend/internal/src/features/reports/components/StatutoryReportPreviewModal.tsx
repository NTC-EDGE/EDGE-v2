import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  useWindowDimensions,
} from 'react-native';
import {
  COLORS,
  useTheme,
  Button,
  Icon as Lucide,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  DatePickerInput,
  toast,
} from '@edge/ui';
import {
  StatutoryReportFormatId,
  StatutoryReportMetadata,
} from '../types/statutoryReports';
import { FieldOfficeFilterOption } from '../hooks/useReportsState';
import {
  ApplicationSummaryDto,
  TenantTransactionDto,
  FeedbackDto,
  reportService,
  PrintStatutoryReportParams,
} from '@edge/api';
import {
  generateStatutoryCsv,
  downloadCsvFile,
  getPaidTransactions,
  resolveEvaluatorName,
  resolveServiceName,
  resolveEntityName,
  resolveApplicationFilingType,
  filterApplicationsForStatutoryReport,
} from '../utils/statutoryReportGenerator';

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

export interface StatutoryReportPreviewModalProps {
  visible: boolean;
  report: StatutoryReportMetadata | null;
  tenantName: string;
  tenantId?: string | null;
  period: string;
  startDate?: string;
  endDate?: string;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
  fieldOfficeOptions?: FieldOfficeFilterOption[];
  selectedFieldOffices?: string[];
  isAllFieldOfficesSelected?: boolean;
  hasBackendFieldOfficeSupport?: boolean;
  onToggleFieldOffice?: (officeName: string) => void;
  onSelectAllFieldOffices?: () => void;
  fieldOfficesParam?: string;
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
  tenantId,
  period,
  startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
  endDate = new Date().toISOString().slice(0, 10),
  onDateRangeChange,
  fieldOfficeOptions = [],
  selectedFieldOffices = [],
  isAllFieldOfficesSelected = true,
  onToggleFieldOffice,
  onSelectAllFieldOffices,
  fieldOfficesParam,
  applications,
  transactions,
  feedback,
  userName,
  onClose,
}: StatutoryReportPreviewModalProps) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isCompact = width < 640;

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Local date range state for in-modal filtering
  const [localStartDate, setLocalStartDate] = useState<string>(startDate);
  const [localEndDate, setLocalEndDate] = useState<string>(endDate);
  const [activeDateRange, setActiveDateRange] = useState<{ start: string; end: string }>({
    start: startDate,
    end: endDate,
  });

  // Report-specific secondary filter (Evaluator / Service / Entity / Exam Class)
  const [selectedSecondaryFilter, setSelectedSecondaryFilter] = useState<string>('all');
  // Optional Service Type filter (Row 14: Application Summary Report by Service)
  const [selectedServiceTypeFilter, setSelectedServiceTypeFilter] = useState<string>('all');
  // Report Format selector (Existing Standard Statutory vs. NTC Sheet Format)
  const [selectedFormat, setSelectedFormat] = useState<StatutoryReportFormatId>('standard');

  useEffect(() => {
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);
    setActiveDateRange({ start: startDate, end: endDate });
  }, [startDate, endDate, visible]);

  useEffect(() => {
    if (visible) {
      setSelectedSecondaryFilter('all');
      setSelectedServiceTypeFilter('all');
      setSelectedFormat('standard');
      setShowActionMenu(false);
      setShowMobileFilters(false);
      setPdfBlobUrl(null);
      setPdfError(null);
    }
  }, [report?.code, visible]);

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

  const effectivePeriod =
    activeDateRange.start && activeDateRange.end
      ? `${activeDateRange.start} to ${activeDateRange.end}`
      : period;

  const printParams = useMemo<PrintStatutoryReportParams | null>(() => {
    if (report === null) return null;
    const hasFormatOptions = Array.isArray(report.formatOptions) && report.formatOptions.length > 1;
    return {
      code: report.code,
      tenantId: tenantId ?? undefined,
      period: effectivePeriod,
      startDate: activeDateRange.start,
      endDate: activeDateRange.end,
      secondaryFilter: selectedSecondaryFilter,
      fieldOffices: fieldOfficesParam,
      format: hasFormatOptions ? selectedFormat : 'standard',
      serviceType:
        report.code === 'NTC-APP-SUM-SVC' && selectedServiceTypeFilter !== 'all'
          ? selectedServiceTypeFilter
          : undefined,
    };
  }, [
    report,
    tenantId,
    effectivePeriod,
    activeDateRange.start,
    activeDateRange.end,
    selectedSecondaryFilter,
    selectedServiceTypeFilter,
    selectedFormat,
    fieldOfficesParam,
  ]);

  // Always fetch the fixed-layout backend PDF whenever the modal opens or filters change
  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (visible && printParams !== null && Platform.OS === 'web') {
      setIsLoadingPdf(true);
      setPdfError(null);
      setPdfBlobUrl(null);

      const loadBlob = async () => {
        try {
          const [blob, err] = await reportService.previewStatutoryReportPdf(printParams);

          if (!active) return;

          if (err !== null || blob === null) {
            const errDetail =
              typeof err === 'string' && err.trim().length > 0
                ? err
                : `Failed to generate official ${printParams.code} PDF document.`;
            setPdfError(errDetail);
            setIsLoadingPdf(false);
            return;
          }

          if (typeof window !== 'undefined') {
            const pdfBlob =
              blob.type === 'application/pdf'
                ? blob
                : new Blob([blob], { type: 'application/pdf' });
            createdUrl = window.URL.createObjectURL(pdfBlob);
            setPdfBlobUrl(createdUrl);
            setIsLoadingPdf(false);
          }
        } catch (fetchErr: unknown) {
          if (!active) return;
          const errorMessage =
            fetchErr instanceof Error ? fetchErr.message : 'Error generating official PDF report';
          setPdfError(errorMessage);
          setIsLoadingPdf(false);
        }
      };

      void loadBlob();
    } else {
      setIsLoadingPdf(false);
    }

    return () => {
      active = false;
      if (createdUrl !== null && typeof window !== 'undefined') {
        window.URL.revokeObjectURL(createdUrl);
      }
    };
  }, [visible, printParams, reloadKey]);

  // Filter records within active date range (for filter chips, CSV export, and native summary)
  const dateFilteredApps = useMemo(() => {
    if (!activeDateRange.start || !activeDateRange.end) return applications;
    const s = new Date(activeDateRange.start);
    s.setHours(0, 0, 0, 0);
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

  const secondaryFilterOptions = useMemo(() => {
    if (!report) return [];
    const set = new Set<string>();
    if (report.code === 'NTC-APP-SUM-EVAL') {
      for (const app of dateFilteredApps) {
        const val = resolveEvaluatorName(app, userName);
        if (val.trim().length > 0 && val.trim() !== '—') set.add(val.trim());
      }
    } else if (report.code === 'NTC-APP-SUM-SVC') {
      for (const app of dateFilteredApps) {
        const val = resolveServiceName(app);
        if (val.trim().length > 0) set.add(val.trim());
      }
    } else if (report.code === 'NTC-APP-SUM-ENT') {
      for (const app of dateFilteredApps) {
        const val = resolveEntityName(app);
        if (val.trim().length > 0) set.add(val.trim());
      }
    } else if (report.code === 'NTC-EXAM-MST-01') {
      for (const app of dateFilteredApps) {
        const cat = `${app.serviceCategory ?? ''} ${app.serviceName ?? ''} ${app.serviceVariantName ?? ''}`.toLowerCase();
        if (
          cat.includes('exam') ||
          cat.includes('operator') ||
          cat.includes('roce') ||
          cat.includes('amateur') ||
          cat.includes('rroc')
        ) {
          const val = (app.serviceVariantName ?? app.element ?? app.serviceName ?? '').trim();
          if (val.length > 0) set.add(val);
        }
      }
    }
    return Array.from(set).sort();
  }, [report, dateFilteredApps, userName]);

  const serviceTypeOptions = useMemo(() => {
    if (!report || report.code !== 'NTC-APP-SUM-SVC') return [];
    const set = new Set<string>(['NEW', 'RENEWAL', 'DUPLICATE', 'MODIFICATION']);
    for (const app of dateFilteredApps) {
      const fType = resolveApplicationFilingType(app);
      if (fType.length > 0) set.add(fType);
    }
    return Array.from(set).sort();
  }, [report, dateFilteredApps]);

  const generatorOptions = useMemo(() => {
    return {
      startDate: activeDateRange.start,
      endDate: activeDateRange.end,
      evaluatorFilter: report?.code === 'NTC-APP-SUM-EVAL' ? selectedSecondaryFilter : undefined,
      serviceFilter: report?.code === 'NTC-APP-SUM-SVC' ? selectedSecondaryFilter : undefined,
      serviceTypeFilter: report?.code === 'NTC-APP-SUM-SVC' ? selectedServiceTypeFilter : undefined,
      entityFilter: report?.code === 'NTC-APP-SUM-ENT' ? selectedSecondaryFilter : undefined,
      scheduleFilter: report?.code === 'NTC-EXAM-MST-01' ? selectedSecondaryFilter : undefined,
      fieldOfficeFilter: selectedFieldOffices.length > 0 ? selectedFieldOffices.join(', ') : undefined,
      format: selectedFormat,
    };
  }, [
    activeDateRange,
    report?.code,
    selectedSecondaryFilter,
    selectedServiceTypeFilter,
    selectedFieldOffices,
    selectedFormat,
  ]);

  const filteredApps = useMemo(() => {
    if (!report) return dateFilteredApps;
    return filterApplicationsForStatutoryReport(report.code, dateFilteredApps, generatorOptions, userName);
  }, [report, dateFilteredApps, generatorOptions, userName]);

  const filteredTx = useMemo(() => {
    if (!activeDateRange.start || !activeDateRange.end) return transactions;
    const s = new Date(activeDateRange.start);
    s.setHours(0, 0, 0, 0);
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

  const paidTx = useMemo(() => {
    return getPaidTransactions(filteredTx, filteredApps);
  }, [filteredTx, filteredApps]);

  const handleApplyDateRange = useCallback(() => {
    setActiveDateRange({
      start: localStartDate,
      end: localEndDate,
    });
    if (onDateRangeChange !== undefined) {
      onDateRangeChange(localStartDate, localEndDate);
    }
  }, [localStartDate, localEndDate, onDateRangeChange]);

  const handlePrint = useCallback(async () => {
    if (printParams === null) return;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (pdfBlobUrl !== null) {
        const printWindow = window.open(pdfBlobUrl, '_blank');
        if (printWindow !== null) {
          printWindow.focus();
          return;
        }
      }

      const [blob, err] = await reportService.previewStatutoryReportPdf(printParams);
      if (blob !== null && err === null) {
        const pdfBlob =
          blob.type === 'application/pdf'
            ? blob
            : new Blob([blob], { type: 'application/pdf' });
        const blobUrl = window.URL.createObjectURL(pdfBlob);
        const printWindow = window.open(blobUrl, '_blank');
        if (printWindow !== null) {
          printWindow.focus();
          return;
        }
      }

      toast.error(
        typeof err === 'string' && err.trim().length > 0
          ? err
          : `Unable to open official ${printParams.code} PDF for printing.`
      );
      return;
    }

    const url = reportService.getStatutoryReportPrintUrl(printParams);
    void Linking.openURL(url);
  }, [printParams, pdfBlobUrl]);

  const handleDownloadPdf = useCallback(async () => {
    if (printParams === null || isDownloadingPdf) return;

    setIsDownloadingPdf(true);
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
        const [blob, err] = await reportService.downloadStatutoryReportPdf(printParams);

        if (blob !== null && err === null) {
          const pdfBlob =
            blob.type === 'application/pdf'
              ? blob
              : new Blob([blob], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          const formatPart = selectedFormat === 'ntc-sheet' ? '_ntc-sheet' : '';
          link.download = `${printParams.code}${formatPart}_${activeDateRange.start}_to_${activeDateRange.end}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => window.URL.revokeObjectURL(url), 10000);
          toast.success(`${printParams.code} PDF downloaded successfully.`);
          setIsDownloadingPdf(false);
          return;
        }

        toast.error(
          typeof err === 'string' && err.trim().length > 0
            ? err
            : `Unable to download official ${printParams.code} PDF.`
        );
        setIsDownloadingPdf(false);
        return;
      }

      const url = reportService.getStatutoryReportDownloadUrl(printParams);
      void Linking.openURL(url);
    } finally {
      setIsDownloadingPdf(false);
    }
  }, [printParams, isDownloadingPdf, selectedFormat, activeDateRange.start, activeDateRange.end]);

  if (report === null || report === undefined) return null;

  const totalApps = filteredApps.length;
  const totalRevenue = paidTx.reduce((sum, tx) => sum + (tx.amount ?? 0), 0);

  const handleCsvDownload = () => {
    const { content, filename } = generateStatutoryCsv(
      report.code,
      tenantName,
      effectivePeriod,
      filteredApps,
      filteredTx,
      feedback,
      generatorOptions
    );
    downloadCsvFile(content, filename);
  };

  const activeFiltersCount =
    (selectedFieldOffices.length > 0 ? 1 : 0) +
    (selectedSecondaryFilter !== 'all' ? 1 : 0) +
    (selectedServiceTypeFilter !== 'all' ? 1 : 0) +
    (selectedFormat !== 'standard' ? 1 : 0);

  const availableFormats = report.formatOptions ?? [];
  const activeFormatOption = availableFormats.find((opt) => opt.id === selectedFormat);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { padding: isMobile ? SPACING[8] : SPACING[16] }]}>
        <View
          style={[
            styles.modalContent,
            {
              width: isMobile ? '100%' : '96%',
              maxHeight: isMobile ? '96%' : '94%',
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Modal Header — Aligned with SoaReportPreviewModal & ApplicationFormPdfPreviewModal */}
          <View
            style={[
              styles.modalHeader,
              {
                borderBottomColor: colors.border,
                paddingHorizontal: isMobile ? SPACING[12] : SPACING[20],
                paddingVertical: isMobile ? SPACING[10] : SPACING[12],
              },
            ]}
          >
            <View style={styles.headerLeft}>
              {!isCompact && (
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: isDark ? colors.brand[900] : colors.brand[50] },
                  ]}
                >
                  <Lucide
                    name="file-text"
                    size={20}
                    color={isDark ? colors.brand[400] : colors.brand[600]}
                  />
                </View>
              )}
              <View style={styles.headerTitleColumn}>
                <View style={styles.titleBadgeRow}>
                  <View
                    style={[
                      styles.codeBadge,
                      {
                        backgroundColor: `${report.badgeColor}20`,
                        borderColor: report.badgeColor,
                      },
                    ]}
                  >
                    <Text style={[styles.codeBadgeText, { color: report.badgeColor }]}>
                      {report.code}
                    </Text>
                  </View>
                  <Text
                    style={[styles.modalTitle, { color: colors.text, fontSize: isMobile ? 13 : 15 }]}
                    numberOfLines={1}
                  >
                    {report.title}
                  </Text>
                </View>
                <Text
                  style={[styles.modalSubtitle, { color: colors.textMuted, fontSize: isMobile ? 11 : 12 }]}
                  numberOfLines={1}
                >
                  {report.agency} • {report.frequency} • {effectivePeriod}
                </Text>
              </View>
            </View>

            <View style={styles.modalHeaderRightActions}>
              {isMobile && (
                <Pressable
                  style={[
                    styles.menuTriggerBtn,
                    {
                      borderColor:
                        showMobileFilters || activeFiltersCount > 0
                          ? isDark
                            ? colors.brand[500]
                            : colors.brand[600]
                          : isDark
                            ? colors.neutral[700]
                            : colors.neutral[300],
                      backgroundColor:
                        showMobileFilters
                          ? isDark
                            ? colors.brand[900]
                            : colors.brand[50]
                          : isDark
                            ? colors.neutral[900]
                            : COLORS.neutral.white,
                    },
                    Platform.select({ web: { cursor: 'pointer' } }),
                  ]}
                  onPress={() => setShowMobileFilters((prev) => !prev)}
                  accessibilityLabel="Toggle Report Filters"
                >
                  <Lucide
                    name="sliders"
                    size={15}
                    color={
                      showMobileFilters || activeFiltersCount > 0
                        ? isDark
                          ? colors.brand[400]
                          : colors.brand[600]
                        : isDark
                          ? colors.neutral[300]
                          : colors.neutral[700]
                    }
                  />
                </Pressable>
              )}

              {!isMobile && (
                <Pressable
                  style={[
                    styles.downloadHeaderBtn,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                      opacity: isDownloadingPdf ? 0.6 : 1,
                    },
                    Platform.select({ web: { cursor: 'pointer' } }),
                  ]}
                  disabled={isDownloadingPdf}
                  onPress={() => {
                    setShowActionMenu(false);
                    void handleDownloadPdf();
                  }}
                >
                  <Lucide
                    name="download"
                    size={14}
                    color={isDark ? colors.neutral[200] : colors.neutral[800]}
                  />
                  <Text
                    style={[
                      styles.downloadHeaderBtnText,
                      { color: isDark ? colors.neutral[200] : colors.neutral[800] },
                    ]}
                  >
                    {isDownloadingPdf ? 'Downloading...' : 'Download PDF'}
                  </Text>
                </Pressable>
              )}

              <Pressable
                style={[
                  styles.printHeaderBtn,
                  {
                    backgroundColor: isDark ? colors.brand[500] : colors.brand[700],
                    paddingHorizontal: isMobile ? 10 : 14,
                  },
                  Platform.select({ web: { cursor: 'pointer' } }),
                ]}
                onPress={() => {
                  setShowActionMenu(false);
                  void handlePrint();
                }}
              >
                <Lucide name="printer" size={14} color={COLORS.neutral.white} />
                {!isMobile && <Text style={styles.printHeaderBtnText}>Print</Text>}
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
                      ? isDark
                        ? colors.neutral[800]
                        : colors.neutral[100]
                      : isDark
                        ? colors.neutral[900]
                        : COLORS.neutral.white,
                  },
                  Platform.select({ web: { cursor: 'pointer' } }),
                ]}
                accessibilityLabel="More options"
              >
                <Lucide
                  name="more-vertical"
                  size={17}
                  color={isDark ? colors.neutral[300] : colors.neutral[700]}
                />
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.closeIconBtn,
                  pressed && { opacity: 0.7 },
                  Platform.select({ web: { cursor: 'pointer' } }),
                ]}
                onPress={() => {
                  setShowActionMenu(false);
                  onClose();
                }}
              >
                <Lucide name="x" size={20} color={colors.textMuted} />
              </Pressable>
            </View>

            {/* Dropdown Menu from 3-Dots */}
            {showActionMenu && (
              <View
                style={[
                  styles.dropdownMenu,
                  {
                    right: isMobile ? 12 : 20,
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
                  <Text
                    style={[
                      styles.dropdownSectionTitle,
                      { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                    ]}
                  >
                    EXPORT & TEMPLATE OPTIONS
                  </Text>
                </View>

                <Pressable
                  style={styles.dropdownMenuItem}
                  onPress={() => {
                    setShowActionMenu(false);
                    void handleDownloadPdf();
                  }}
                >
                  <Lucide
                    name="file-text"
                    size={15}
                    color={isDark ? colors.brand[400] : colors.brand[600]}
                  />
                  <View style={styles.dropdownMenuTextContainer}>
                    <Text
                      style={[
                        styles.dropdownMenuItemText,
                        { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                      ]}
                    >
                      Download Official PDF
                    </Text>
                    <Text
                      style={[
                        styles.dropdownMenuItemSubtext,
                        { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                      ]}
                    >
                      Backend Vector PDF • {report.code}
                    </Text>
                  </View>
                  <Lucide
                    name="download"
                    size={13}
                    color={isDark ? colors.neutral[500] : colors.neutral[400]}
                  />
                </Pressable>

                <Pressable
                  style={styles.dropdownMenuItem}
                  onPress={() => {
                    setShowActionMenu(false);
                    handleCsvDownload();
                  }}
                >
                  <Lucide name="table" size={15} color={isDark ? '#34d399' : '#059669'} />
                  <View style={styles.dropdownMenuTextContainer}>
                    <Text
                      style={[
                        styles.dropdownMenuItemText,
                        { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                      ]}
                    >
                      Export CSV Spreadsheet
                    </Text>
                    <Text
                      style={[
                        styles.dropdownMenuItemSubtext,
                        { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                      ]}
                    >
                      Comma-Separated Values • {totalApps} records
                    </Text>
                  </View>
                  <Lucide
                    name="download"
                    size={13}
                    color={isDark ? colors.neutral[500] : colors.neutral[400]}
                  />
                </Pressable>

                {Platform.OS === 'web' && (
                  <>
                    <View
                      style={[
                        styles.dropdownDivider,
                        { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[200] },
                      ]}
                    />
                    <Pressable
                      style={styles.dropdownMenuItem}
                      onPress={() => {
                        setShowActionMenu(false);
                        setReloadKey((k) => k + 1);
                      }}
                    >
                      <Lucide
                        name="refresh-cw"
                        size={14}
                        color={isDark ? colors.neutral[400] : colors.neutral[500]}
                      />
                      <View style={styles.dropdownMenuTextContainer}>
                        <Text
                          style={[
                            styles.dropdownMenuItemText,
                            { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                          ]}
                        >
                          Reload Official PDF Template
                        </Text>
                        <Text
                          style={[
                            styles.dropdownMenuItemSubtext,
                            { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                          ]}
                        >
                          Fetch fresh QuestPDF document from backend
                        </Text>
                      </View>
                    </Pressable>
                  </>
                )}
              </View>
            )}
          </View>

          {/* Mobile Quick Action Bar so narrow viewports never break */}
          {isMobile && Platform.OS === 'web' && (
            <View
              style={[
                styles.mobileQuickBar,
                {
                  backgroundColor: isDark ? colors.neutral[800] : '#F8FAFC',
                  borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[200],
                },
              ]}
            >
              <Pressable
                onPress={() => void handlePrint()}
                style={[
                  styles.mobileQuickBtn,
                  { backgroundColor: isDark ? colors.brand[600] : colors.brand[700] },
                ]}
              >
                <Lucide name="external-link" size={13} color="#FFFFFF" />
                <Text style={styles.mobileQuickBtnPrimaryText}>Open PDF in New Tab</Text>
              </Pressable>
              <Pressable
                onPress={() => void handleDownloadPdf()}
                disabled={isDownloadingPdf}
                style={[
                  styles.mobileQuickBtn,
                  {
                    backgroundColor: isDark ? colors.neutral[900] : '#FFFFFF',
                    borderWidth: 1,
                    borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                    opacity: isDownloadingPdf ? 0.6 : 1,
                  },
                ]}
              >
                <Lucide
                  name="download"
                  size={13}
                  color={isDark ? colors.neutral[200] : colors.neutral[800]}
                />
                <Text
                  style={[
                    styles.mobileQuickBtnSecondaryText,
                    { color: isDark ? colors.neutral[200] : colors.neutral[800] },
                  ]}
                >
                  {isDownloadingPdf ? 'Downloading...' : 'Download PDF'}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Filter Bar (Always visible on desktop; collapsible on mobile) */}
          {(!isMobile || showMobileFilters) && (
            <View
              style={[
                styles.filterBar,
                {
                  paddingHorizontal: isMobile ? SPACING[12] : SPACING[20],
                  backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                  borderBottomColor: colors.border,
                },
              ]}
            >
              {/* Regional Tenant Context */}
              <View style={styles.tenantBadge}>
                <Lucide
                  name="map-pin"
                  size={14}
                  color={isDark ? colors.brand[500] : colors.brand.primary}
                />
                <Text style={[styles.tenantBadgeText, { color: colors.text }]}>{tenantName}</Text>
              </View>

              {/* Date Range Selection */}
              <View style={styles.datePickerRow}>
                <View style={styles.dateField}>
                  <Text style={[styles.dateLabel, { color: colors.textMuted }]}>FROM:</Text>
                  <View style={{ minWidth: isCompact ? 130 : 155 }}>
                    <DatePickerInput
                      value={localStartDate}
                      onChangeText={setLocalStartDate}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                </View>

                <View style={styles.dateField}>
                  <Text style={[styles.dateLabel, { color: colors.textMuted }]}>TO:</Text>
                  <View style={{ minWidth: isCompact ? 130 : 155 }}>
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

              {/* Fixed-Layout Backend PDF Badge */}
              <View
                style={[
                  styles.backendPdfPill,
                  {
                    backgroundColor: isDark ? colors.brand[900] : colors.brand[50],
                    borderColor: isDark ? colors.brand[700] : colors.brand[200],
                  },
                ]}
              >
                <Lucide
                  name="shield"
                  size={12}
                  color={isDark ? colors.brand[300] : colors.brand[700]}
                />
                <Text
                  style={[
                    styles.backendPdfPillText,
                    { color: isDark ? colors.brand[300] : colors.brand[700] },
                  ]}
                >
                  {activeFormatOption !== undefined ? activeFormatOption.shortLabel : 'Official Backend PDF Template'}
                </Text>
              </View>

              {/* Report Format Switcher (Keep Existing Standard Format + Offer NTC Sheet Format Option) */}
              {availableFormats.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingTop: 2,
                  }}
                >
                  <Text style={[styles.dateLabel, { color: colors.textMuted, marginRight: 4 }]}>
                    REPORT FORMAT:
                  </Text>
                  {availableFormats.map((fmt) => {
                    const isSelected = selectedFormat === fmt.id;
                    return (
                      <Pressable
                        key={fmt.id}
                        style={[
                          {
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 5,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: isSelected
                              ? isDark
                                ? colors.brand[400]
                                : colors.brand[600]
                              : colors.border,
                            backgroundColor: isSelected
                              ? isDark
                                ? colors.brand[900]
                                : colors.brand[50]
                              : 'transparent',
                          },
                          Platform.select({ web: { cursor: 'pointer' } }),
                        ]}
                        onPress={() => setSelectedFormat(fmt.id)}
                      >
                        <Lucide
                          name={fmt.id === 'ntc-sheet' ? 'grid' : 'file-text'}
                          size={12}
                          color={
                            isSelected
                              ? isDark
                                ? colors.brand[300]
                                : colors.brand[700]
                              : colors.textMuted
                          }
                        />
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: isSelected ? '700' : '500',
                            color: isSelected
                              ? isDark
                                ? colors.brand[300]
                                : colors.brand[700]
                              : colors.text,
                          }}
                        >
                          {fmt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                  {report.code === 'NTC-APP-SUM-ENT' && selectedFormat === 'ntc-sheet' && (
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: isDark ? '#14532d' : '#dcfce7',
                        borderWidth: 1,
                        borderColor: isDark ? '#166534' : '#86efac',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '700',
                          color: isDark ? '#86efac' : '#166534',
                        }}
                      >
                        Completed Applications Only
                      </Text>
                    </View>
                  )}
                </ScrollView>
              )}

              {/* Field Office Checkbox Filter (Monitoring Only) */}
              {fieldOfficeOptions.length > 0 && onToggleFieldOffice && onSelectAllFieldOffices && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingTop: 4,
                  }}
                >
                  <Text style={[styles.dateLabel, { color: colors.textMuted, marginRight: 2 }]}>
                    FIELD OFFICE (MONITORING):
                  </Text>
                  <Pressable
                    style={[
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: isAllFieldOfficesSelected
                          ? isDark
                            ? colors.brand[500]
                            : colors.brand.primary
                          : colors.border,
                        backgroundColor: isAllFieldOfficesSelected
                          ? isDark
                            ? colors.neutral[800]
                            : colors.brand.light
                          : 'transparent',
                      },
                      Platform.select({ web: { cursor: 'pointer' } }),
                    ]}
                    onPress={onSelectAllFieldOffices}
                  >
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 3,
                        borderWidth: 1.5,
                        borderColor: isAllFieldOfficesSelected
                          ? isDark
                            ? colors.brand[400]
                            : colors.brand.primary
                          : colors.textMuted,
                        backgroundColor: isAllFieldOfficesSelected
                          ? isDark
                            ? colors.brand[500]
                            : colors.brand.primary
                          : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isAllFieldOfficesSelected && (
                        <Lucide name="check" size={10} color="#FFFFFF" />
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: isAllFieldOfficesSelected ? '700' : '500',
                        color: isAllFieldOfficesSelected
                          ? isDark
                            ? colors.brand[400]
                            : colors.brand.primary
                          : colors.textMuted,
                      }}
                    >
                      All Field Offices
                    </Text>
                  </Pressable>

                  {fieldOfficeOptions.map((fo) => {
                    const isChecked = selectedFieldOffices.some(
                      (s) => s.toLowerCase() === fo.name.toLowerCase()
                    );
                    return (
                      <Pressable
                        key={fo.id}
                        style={[
                          {
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: isChecked
                              ? isDark
                                ? colors.brand[500]
                                : colors.brand.primary
                              : colors.border,
                            backgroundColor: isChecked
                              ? isDark
                                ? colors.neutral[800]
                                : colors.brand.light
                              : 'transparent',
                          },
                          Platform.select({ web: { cursor: 'pointer' } }),
                        ]}
                        onPress={() => onToggleFieldOffice(fo.name)}
                      >
                        <View
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 3,
                            borderWidth: 1.5,
                            borderColor: isChecked
                              ? isDark
                                ? colors.brand[400]
                                : colors.brand.primary
                              : colors.textMuted,
                            backgroundColor: isChecked
                              ? isDark
                                ? colors.brand[500]
                                : colors.brand.primary
                              : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isChecked && <Lucide name="check" size={10} color="#FFFFFF" />}
                        </View>
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: isChecked ? '700' : '500',
                            color: isChecked
                              ? isDark
                                ? colors.brand[400]
                                : colors.brand.primary
                              : colors.text,
                          }}
                        >
                          {fo.name} ({fo.applicationCount})
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}

              {/* Secondary Report-Specific Filter (Evaluator / Service / Entity / Exam Class) */}
              {secondaryFilterOptions.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingTop: 2,
                  }}
                >
                  <Text style={[styles.dateLabel, { color: colors.textMuted, marginRight: 4 }]}>
                    {report.code === 'NTC-APP-SUM-EVAL'
                      ? 'EVALUATOR:'
                      : report.code === 'NTC-APP-SUM-SVC'
                        ? 'SERVICE:'
                        : report.code === 'NTC-APP-SUM-ENT'
                          ? 'ENTITY:'
                          : 'EXAM CLASS:'}
                  </Text>
                  <Pressable
                    style={[
                      {
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor:
                          selectedSecondaryFilter === 'all'
                            ? isDark
                              ? colors.brand[500]
                              : colors.brand.primary
                            : colors.border,
                        backgroundColor:
                          selectedSecondaryFilter === 'all'
                            ? isDark
                              ? colors.neutral[800]
                              : colors.brand.light
                            : 'transparent',
                      },
                      Platform.select({ web: { cursor: 'pointer' } }),
                    ]}
                    onPress={() => setSelectedSecondaryFilter('all')}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: selectedSecondaryFilter === 'all' ? '700' : '500',
                        color:
                          selectedSecondaryFilter === 'all'
                            ? isDark
                              ? colors.brand[500]
                              : colors.brand.primary
                            : colors.textMuted,
                      }}
                    >
                      All ({dateFilteredApps.length})
                    </Text>
                  </Pressable>
                  {secondaryFilterOptions.map((opt) => {
                    const isActive = selectedSecondaryFilter === opt;
                    return (
                      <Pressable
                        key={opt}
                        style={[
                          {
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: isActive
                              ? isDark
                                ? colors.brand[500]
                                : colors.brand.primary
                              : colors.border,
                            backgroundColor: isActive
                              ? isDark
                                ? colors.neutral[800]
                                : colors.brand.light
                              : 'transparent',
                          },
                          Platform.select({ web: { cursor: 'pointer' } }),
                        ]}
                        onPress={() => setSelectedSecondaryFilter(opt)}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: isActive ? '700' : '500',
                            color: isActive
                              ? isDark
                                ? colors.brand[500]
                                : colors.brand.primary
                              : colors.textMuted,
                          }}
                        >
                          {opt}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}

              {/* Optional Service Type Filter (Row 14: Application Summary Report by Service) */}
              {report.code === 'NTC-APP-SUM-SVC' && serviceTypeOptions.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingTop: 2,
                  }}
                >
                  <Text style={[styles.dateLabel, { color: colors.textMuted, marginRight: 4 }]}>
                    SERVICE TYPE (OPTIONAL):
                  </Text>
                  <Pressable
                    style={[
                      {
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor:
                          selectedServiceTypeFilter === 'all'
                            ? isDark
                              ? colors.brand[500]
                              : colors.brand.primary
                            : colors.border,
                        backgroundColor:
                          selectedServiceTypeFilter === 'all'
                            ? isDark
                              ? colors.neutral[800]
                              : colors.brand.light
                            : 'transparent',
                      },
                      Platform.select({ web: { cursor: 'pointer' } }),
                    ]}
                    onPress={() => setSelectedServiceTypeFilter('all')}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: selectedServiceTypeFilter === 'all' ? '700' : '500',
                        color:
                          selectedServiceTypeFilter === 'all'
                            ? isDark
                              ? colors.brand[500]
                              : colors.brand.primary
                            : colors.textMuted,
                      }}
                    >
                      All Types
                    </Text>
                  </Pressable>
                  {serviceTypeOptions.map((opt) => {
                    const isActive = selectedServiceTypeFilter === opt;
                    return (
                      <Pressable
                        key={opt}
                        style={[
                          {
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: isActive
                              ? isDark
                                ? colors.brand[500]
                                : colors.brand.primary
                              : colors.border,
                            backgroundColor: isActive
                              ? isDark
                                ? colors.neutral[800]
                                : colors.brand.light
                              : 'transparent',
                          },
                          Platform.select({ web: { cursor: 'pointer' } }),
                        ]}
                        onPress={() => setSelectedServiceTypeFilter(opt)}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: isActive ? '700' : '500',
                            color: isActive
                              ? isDark
                                ? colors.brand[500]
                                : colors.brand.primary
                              : colors.textMuted,
                          }}
                        >
                          {opt}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          )}

          {Platform.OS === 'web' && isLoadingPdf && (
            <View style={{ width: '100%', height: 3, overflow: 'hidden' }}>
              <PdfLoadBar height={3} />
            </View>
          )}

          {/* Document Preview Body — Exclusively Fixed-Layout Backend PDF */}
          <View
            style={[
              styles.documentPreviewContainer,
              {
                minHeight: isMobile ? 460 : 660,
                backgroundColor: isDark ? colors.neutral[900] : '#F8FAFC',
              },
            ]}
          >
            {Platform.OS === 'web' ? (
              <View style={{ flex: 1, minHeight: isMobile ? 460 : 660, padding: isMobile ? SPACING[8] : SPACING[12] }}>
                {isLoadingPdf ? (
                  <View
                    style={[
                      styles.stateCard,
                      {
                        minHeight: isMobile ? 420 : 620,
                        backgroundColor: isDark ? colors.neutral[900] : '#ffffff',
                        borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
                      },
                    ]}
                  >
                    <View style={styles.stateInnerContent}>
                      <View
                        style={[
                          styles.stateIconCircle,
                          {
                            backgroundColor: isDark ? colors.brand[900] : colors.brand[50],
                            borderColor: isDark ? colors.brand[700] : colors.brand[200],
                          },
                        ]}
                      >
                        <Lucide
                          name="file-text"
                          size={28}
                          color={isDark ? colors.brand[400] : colors.brand[600]}
                        />
                      </View>

                      <View style={{ alignItems: 'center', gap: 6 }}>
                        <Text
                          style={[
                            styles.stateTitle,
                            { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                          ]}
                        >
                          Generating Official {report.title}...
                        </Text>
                        <Text
                          style={[
                            styles.stateDesc,
                            { color: isDark ? colors.neutral[400] : colors.neutral[600] },
                          ]}
                        >
                          Synthesizing fixed-layout official NTC vector PDF ({report.code}) from backend services.
                        </Text>
                      </View>

                      <View style={{ width: '100%', marginTop: SPACING[8] }}>
                        <PdfLoadBar height={6} />
                      </View>

                      <View
                        style={[
                          styles.contextPill,
                          {
                            backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: isDark ? colors.neutral[300] : colors.neutral[700],
                          }}
                        >
                          {tenantName} • {effectivePeriod}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : pdfError !== null ? (
                  <View
                    style={[
                      styles.stateCard,
                      {
                        minHeight: isMobile ? 420 : 620,
                        backgroundColor: isDark ? colors.neutral[900] : '#fef2f2',
                        borderColor: isDark ? '#7f1d1d' : '#fecaca',
                      },
                    ]}
                  >
                    <View style={styles.stateInnerContent}>
                      <Lucide name="alert-triangle" size={36} color="#DC2626" />
                      <Text
                        style={[
                          styles.stateTitle,
                          { color: isDark ? '#fca5a5' : '#991b1b' },
                        ]}
                      >
                        Unable to Load Official {report.code} PDF
                      </Text>
                      <Text
                        style={[
                          styles.stateDesc,
                          { color: isDark ? colors.neutral[400] : colors.neutral[600] },
                        ]}
                      >
                        {pdfError}
                      </Text>
                      <View style={styles.errorActionsRow}>
                        <Pressable
                          onPress={() => setReloadKey((k) => k + 1)}
                          style={[
                            styles.retryBtn,
                            { backgroundColor: isDark ? colors.brand[600] : colors.brand[700] },
                            Platform.select({ web: { cursor: 'pointer' } }),
                          ]}
                        >
                          <Lucide name="refresh-cw" size={14} color={COLORS.neutral.white} />
                          <Text style={styles.retryBtnText}>Retry Loading</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => void handleDownloadPdf()}
                          style={[
                            styles.retryBtn,
                            {
                              backgroundColor: isDark ? colors.neutral[800] : colors.neutral[200],
                            },
                            Platform.select({ web: { cursor: 'pointer' } }),
                          ]}
                        >
                          <Lucide
                            name="download"
                            size={14}
                            color={isDark ? colors.neutral[100] : colors.neutral[800]}
                          />
                          <Text
                            style={[
                              styles.retryBtnText,
                              { color: isDark ? colors.neutral[100] : colors.neutral[800] },
                            ]}
                          >
                            Download Directly
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ) : pdfBlobUrl !== null ? (
                  React.createElement('iframe', {
                    src: pdfBlobUrl,
                    style: {
                      width: '100%',
                      height: '100%',
                      minHeight: isMobile ? '460px' : '660px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: isDark ? '#1e293b' : '#525659',
                    },
                    title: `${report.title} Official PDF`,
                  })
                ) : null}
              </View>
            ) : (
              /* Native mobile view: clean summary card with direct backend PDF Open & Download */
              <ScrollView
                style={styles.modalBody}
                contentContainerStyle={styles.modalBodyScroll}
                showsVerticalScrollIndicator={false}
              >
                <View
                  style={[
                    styles.govHeaderBanner,
                    {
                      backgroundColor: isDark ? colors.neutral[900] : '#F8FAFC',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.govRepText, { color: colors.textMuted }]}>
                    REPUBLIC OF THE PHILIPPINES • OFFICE OF THE PRESIDENT
                  </Text>
                  <Text style={[styles.govAgencyText, { color: colors.text }]}>
                    NATIONAL TELECOMMUNICATIONS COMMISSION
                  </Text>
                  <Text
                    style={[
                      styles.govTenantText,
                      { color: isDark ? colors.brand[500] : colors.brand.primary },
                    ]}
                  >
                    {tenantName}
                  </Text>
                </View>

                <View
                  style={[
                    styles.infoCard,
                    {
                      backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.infoVal, { color: colors.text, textAlign: 'center' }]}>
                    Official backend PDF ready ({totalApps} applications • ₱
                    {totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })} collections).
                  </Text>
                  <View style={styles.nativeActionRow}>
                    <Pressable
                      onPress={() => void handlePrint()}
                      style={[
                        styles.retryBtn,
                        { backgroundColor: isDark ? colors.brand[600] : colors.brand[700] },
                      ]}
                    >
                      <Lucide name="external-link" size={14} color={COLORS.neutral.white} />
                      <Text style={styles.retryBtnText}>Open Official PDF</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => void handleDownloadPdf()}
                      style={[
                        styles.retryBtn,
                        {
                          backgroundColor: isDark ? colors.neutral[800] : colors.neutral[200],
                        },
                      ]}
                    >
                      <Lucide
                        name="download"
                        size={14}
                        color={isDark ? colors.neutral[100] : colors.neutral[800]}
                      />
                      <Text
                        style={[
                          styles.retryBtnText,
                          { color: isDark ? colors.neutral[100] : colors.neutral[800] },
                        ]}
                      >
                        Download PDF
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </ScrollView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    maxWidth: 1340,
    borderRadius: RADIUS.dialog,
    borderWidth: 1,
    overflow: 'hidden',
    alignSelf: 'center',
    flex: 1,
  },
  modalHeaderRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    flexShrink: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    position: 'relative',
    zIndex: 40,
    gap: SPACING[8],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
    flex: 1,
    minWidth: 0,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    flexWrap: 'nowrap',
  },
  codeBadge: {
    paddingHorizontal: SPACING[8],
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    flexShrink: 0,
  },
  codeBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10.5,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  headerTitleColumn: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    flex: 1,
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  downloadHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  downloadHeaderBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  printHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  printHeaderBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  menuTriggerBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconBtn: {
    padding: SPACING[6],
    borderRadius: RADIUS.circle,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 56,
    width: 280,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    paddingVertical: 6,
    zIndex: 999,
    ...SHADOWS.modal,
  },
  dropdownSectionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dropdownSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.6,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  dropdownMenuTextContainer: {
    flex: 1,
    gap: 1,
  },
  dropdownMenuItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  dropdownMenuItemSubtext: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10.5,
  },
  dropdownDivider: {
    height: 1,
    marginVertical: 4,
  },
  mobileQuickBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
  },
  mobileQuickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
  },
  mobileQuickBtnPrimaryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  mobileQuickBtnSecondaryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  backendPdfPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.circle,
    borderWidth: 1,
  },
  backendPdfPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  documentPreviewContainer: {
    flex: 1,
  },
  stateCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING[24],
  },
  stateInnerContent: {
    width: '100%',
    maxWidth: 460,
    alignItems: 'center',
    gap: SPACING[12],
  },
  stateIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  stateTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  stateDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  contextPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.circle,
    borderWidth: 1,
  },
  errorActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS.sm,
  },
  retryBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: 12,
  },
  infoVal: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    lineHeight: 18,
  },
  nativeActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
});
