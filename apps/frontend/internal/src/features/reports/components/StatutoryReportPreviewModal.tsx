import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  Platform,
  Animated,
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
} from '@edge/ui';
import { StatutoryReportMetadata } from '../types/statutoryReports';
import {
  ApplicationSummaryDto,
  TenantTransactionDto,
  FeedbackDto,
  reportService,
} from '@edge/api';
import {
  generateStatutoryCsv,
  downloadCsvFile,
  generateStatutoryPrintableHtml,
  openPrintableReportWindow,
  getPaidTransactions,
  resolveEvaluatorName,
  resolveServiceName,
  resolveEntityName,
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
  applications,
  transactions,
  feedback,
  userName,
  onClose,
}: StatutoryReportPreviewModalProps) {
  const { colors, isDark } = useTheme();

  // View format: 'pdf' (Backend QuestPDF vector stream like SOA/OP/OR) vs 'interactive' (HTML replica)
  const [viewFormat, setViewFormat] = useState<'pdf' | 'interactive'>('pdf');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [showActionMenu, setShowActionMenu] = useState<boolean>(false);

  // Local date range state for interactive in-modal filtering
  const [localStartDate, setLocalStartDate] = useState<string>(startDate);
  const [localEndDate, setLocalEndDate] = useState<string>(endDate);
  const [activeDateRange, setActiveDateRange] = useState<{ start: string; end: string }>({
    start: startDate,
    end: endDate,
  });

  // Report-specific secondary filter (Evaluator / Service / Entity / Exam Class)
  const [selectedSecondaryFilter, setSelectedSecondaryFilter] = useState<string>('all');

  useEffect(() => {
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);
    setActiveDateRange({ start: startDate, end: endDate });
  }, [startDate, endDate, visible]);

  useEffect(() => {
    if (visible) {
      setSelectedSecondaryFilter('all');
      setViewFormat('pdf');
      setShowActionMenu(false);
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

  // Fetch backend QuestPDF blob whenever modal opens or filters change (matching SoaReportPreviewModal)
  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (visible && report !== null && Platform.OS === 'web' && viewFormat === 'pdf') {
      setIsLoadingPdf(true);
      setPdfError(null);
      setPdfBlobUrl(null);

      const loadBlob = async () => {
        try {
          const [blob, err] = await reportService.previewStatutoryReportPdf({
            code: report.code,
            tenantId: tenantId ?? undefined,
            period: effectivePeriod,
            startDate: activeDateRange.start,
            endDate: activeDateRange.end,
            secondaryFilter: selectedSecondaryFilter,
          });

          if (!active) return;

          if (err !== null || blob === null) {
            const errDetail =
              typeof err === 'string' && err.trim().length > 0
                ? err
                : `Failed to generate official ${report.code} PDF document.`;
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
      setPdfError(null);
    }

    return () => {
      active = false;
      if (createdUrl !== null && typeof window !== 'undefined') {
        window.URL.revokeObjectURL(createdUrl);
      }
    };
  }, [
    visible,
    report,
    tenantId,
    effectivePeriod,
    activeDateRange.start,
    activeDateRange.end,
    selectedSecondaryFilter,
    viewFormat,
    reloadKey,
  ]);

  // Filter records within active date range
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
        if (val.trim().length > 0) set.add(val.trim());
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
        if (cat.includes('exam') || cat.includes('operator') || cat.includes('roce') || cat.includes('amateur') || cat.includes('rroc')) {
          const val = (app.serviceVariantName ?? app.element ?? app.serviceName ?? '').trim();
          if (val.length > 0) set.add(val);
        }
      }
    }
    return Array.from(set).sort();
  }, [report, dateFilteredApps, userName]);

  const generatorOptions = useMemo(() => {
    return {
      startDate: activeDateRange.start,
      endDate: activeDateRange.end,
      evaluatorFilter: report?.code === 'NTC-APP-SUM-EVAL' ? selectedSecondaryFilter : undefined,
      serviceFilter: report?.code === 'NTC-APP-SUM-SVC' ? selectedSecondaryFilter : undefined,
      entityFilter: report?.code === 'NTC-APP-SUM-ENT' ? selectedSecondaryFilter : undefined,
      scheduleFilter: report?.code === 'NTC-EXAM-MST-01' ? selectedSecondaryFilter : undefined,
    };
  }, [activeDateRange, report?.code, selectedSecondaryFilter]);

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

  const printableHtml = useMemo(() => {
    if (!report) return '';
    return generateStatutoryPrintableHtml(
      report,
      tenantName,
      effectivePeriod,
      filteredApps,
      filteredTx,
      feedback,
      userName,
      generatorOptions
    );
  }, [report, tenantName, effectivePeriod, filteredApps, filteredTx, feedback, userName, generatorOptions]);

  if (report === null || report === undefined) return null;

  const totalApps = filteredApps.length;
  const totalRevenue = paidTx.reduce((sum, tx) => sum + (tx.amount ?? 0), 0);

  const handleApplyDateRange = () => {
    setActiveDateRange({
      start: localStartDate,
      end: localEndDate,
    });
    if (onDateRangeChange !== undefined) {
      onDateRangeChange(localStartDate, localEndDate);
    }
  };

  const handlePrint = async () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (pdfBlobUrl !== null && viewFormat === 'pdf') {
        const printWindow = window.open(pdfBlobUrl, '_blank');
        if (printWindow !== null) {
          printWindow.focus();
        }
        return;
      }

      const [blob, err] = await reportService.previewStatutoryReportPdf({
        code: report.code,
        tenantId: tenantId ?? undefined,
        period: effectivePeriod,
        startDate: activeDateRange.start,
        endDate: activeDateRange.end,
        secondaryFilter: selectedSecondaryFilter,
      });

      if (blob !== null && err === null) {
        const blobUrl = window.URL.createObjectURL(blob);
        const printWindow = window.open(blobUrl, '_blank');
        if (printWindow !== null) {
          printWindow.focus();
        }
        return;
      }
    }

    openPrintableReportWindow(printableHtml);
  };

  const handleDownloadPdf = async () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const [blob, err] = await reportService.downloadStatutoryReportPdf({
        code: report.code,
        tenantId: tenantId ?? undefined,
        period: effectivePeriod,
        startDate: activeDateRange.start,
        endDate: activeDateRange.end,
        secondaryFilter: selectedSecondaryFilter,
      });

      if (blob !== null && err === null) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report.code}_${activeDateRange.start}_to_${activeDateRange.end}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return;
      }
    }

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
      generatorOptions
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
          {/* Modal Header — Identical Action Pattern to SoaReportPreviewModal */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
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
              <Pressable
                style={[
                  styles.printHeaderBtn,
                  { backgroundColor: isDark ? colors.brand[500] : colors.brand[700] },
                  Platform.select({ web: { cursor: 'pointer' } }),
                ]}
                onPress={() => {
                  setShowActionMenu(false);
                  void handlePrint();
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
                  Platform.select({ web: { cursor: 'pointer' } }),
                ]}
                accessibilityLabel="More options"
              >
                <Lucide name="more-vertical" size={17} color={isDark ? colors.neutral[300] : colors.neutral[700]} />
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
                  <Lucide name="file-text" size={15} color={isDark ? colors.brand[400] : colors.brand[600]} />
                  <View style={styles.dropdownMenuTextContainer}>
                    <Text style={[styles.dropdownMenuItemText, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                      Download Official PDF
                    </Text>
                    <Text style={[styles.dropdownMenuItemSubtext, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                      Official Vector PDF • {report.code}
                    </Text>
                  </View>
                  <Lucide name="download" size={13} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
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
                    <Text style={[styles.dropdownMenuItemText, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                      Export CSV Spreadsheet
                    </Text>
                    <Text style={[styles.dropdownMenuItemSubtext, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                      Comma-Separated Values • {totalApps} records
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
                        setViewFormat('pdf');
                        setReloadKey((k) => k + 1);
                      }}
                    >
                      <Lucide name="refresh-cw" size={14} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
                      <View style={styles.dropdownMenuTextContainer}>
                        <Text style={[styles.dropdownMenuItemText, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                          Reload Current Template
                        </Text>
                        <Text style={[styles.dropdownMenuItemSubtext, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                          Fetch fresh QuestPDF document from server
                        </Text>
                      </View>
                    </Pressable>
                  </>
                )}
              </View>
            )}
          </View>

          {/* Interactive Date Range, Tenant Context & View Format Bar */}
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
                <View style={{ minWidth: 155 }}>
                  <DatePickerInput
                    value={localStartDate}
                    onChangeText={setLocalStartDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>

              <View style={styles.dateField}>
                <Text style={[styles.dateLabel, { color: colors.textMuted }]}>TO:</Text>
                <View style={{ minWidth: 155 }}>
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

            {/* View Format Toggle: Official PDF Template (Direct) vs Interactive Document View */}
            {Platform.OS === 'web' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.dateLabel, { color: colors.textMuted }]}>VIEW FORMAT:</Text>
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
                    borderColor: viewFormat === 'pdf' ? (isDark ? colors.brand[500] : colors.brand[600]) : colors.border,
                  }}
                  onPress={() => setViewFormat('pdf')}
                >
                  <Lucide
                    name="file-text"
                    size={12}
                    color={viewFormat === 'pdf' ? (isDark ? colors.brand[300] : colors.brand[700]) : colors.textMuted}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: viewFormat === 'pdf' ? '700' : '500',
                      color: viewFormat === 'pdf' ? (isDark ? colors.brand[300] : colors.brand[700]) : colors.textMuted,
                    }}
                  >
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
                    backgroundColor: viewFormat === 'interactive' ? (isDark ? colors.brand[900] : colors.brand[100]) : 'transparent',
                    borderWidth: 1,
                    borderColor: viewFormat === 'interactive' ? (isDark ? colors.brand[500] : colors.brand[600]) : colors.border,
                  }}
                  onPress={() => setViewFormat('interactive')}
                >
                  <Lucide
                    name="layout"
                    size={12}
                    color={viewFormat === 'interactive' ? (isDark ? colors.brand[300] : colors.brand[700]) : colors.textMuted}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: viewFormat === 'interactive' ? '700' : '500',
                      color: viewFormat === 'interactive' ? (isDark ? colors.brand[300] : colors.brand[700]) : colors.textMuted,
                    }}
                  >
                    Interactive Form View
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Secondary Report-Specific Filter (Evaluator / Service / Entity / Exam Class) */}
            {secondaryFilterOptions.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 2, width: '100%' }}
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
                          ? (isDark ? colors.brand[500] : colors.brand.primary)
                          : colors.border,
                      backgroundColor:
                        selectedSecondaryFilter === 'all'
                          ? (isDark ? colors.neutral[800] : colors.brand.light)
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
                          ? (isDark ? colors.brand[500] : colors.brand.primary)
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
                            ? (isDark ? colors.brand[500] : colors.brand.primary)
                            : colors.border,
                          backgroundColor: isActive
                            ? (isDark ? colors.neutral[800] : colors.brand.light)
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
                            ? (isDark ? colors.brand[500] : colors.brand.primary)
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

          {Platform.OS === 'web' && isLoadingPdf && (
            <View style={{ width: '100%', height: 3, overflow: 'hidden' }}>
              <PdfLoadBar height={3} />
            </View>
          )}

          {/* Document Preview Body — Matching SoaReportPreviewModal */}
          <View style={[styles.documentPreviewContainer, { backgroundColor: isDark ? colors.neutral[900] : '#F8FAFC' }]}>
            {Platform.OS === 'web' && viewFormat === 'pdf' ? (
              <View style={{ flex: 1, minHeight: 680, padding: SPACING[12] }}>
                {isLoadingPdf ? (
                  <View
                    style={{
                      flex: 1,
                      minHeight: 640,
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
                        <Lucide name="file-text" size={28} color={isDark ? colors.brand[400] : colors.brand[600]} />
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
                          Generating Official {report.title}...
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
                          Synthesizing official NTC vector report form ({report.code}) using backend QuestPDF services.
                        </Text>
                      </View>

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
                          {tenantName} • {effectivePeriod}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : pdfBlobUrl !== null && pdfError === null ? (
                  React.createElement('iframe', {
                    src: pdfBlobUrl,
                    style: {
                      width: '100%',
                      height: '100%',
                      minHeight: '660px',
                      border: 'none',
                      borderRadius: '8px',
                    },
                    title: `${report.title} Official PDF`,
                  })
                ) : (
                  /* Automatic seamless fallback to the official printable form view if backend PDF stream is unavailable */
                  React.createElement('iframe', {
                    srcDoc: printableHtml,
                    title: `${report.title} Official Form Preview`,
                    style: {
                      width: '100%',
                      height: '100%',
                      minHeight: '660px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                    },
                  })
                )}
              </View>
            ) : Platform.OS === 'web' ? (
              <View style={{ flex: 1, minHeight: 680, padding: SPACING[12] }}>
                {React.createElement('iframe', {
                  srcDoc: printableHtml,
                  title: `${report.title} Interactive Preview`,
                  style: {
                    width: '100%',
                    height: '100%',
                    minHeight: '660px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                  },
                })}
              </View>
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
                    Official report ready ({totalApps} applications • ₱{totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })} collections). Tap &quot;Print&quot; or open the 3-dots menu above to export PDF or CSV.
                  </Text>
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
    padding: SPACING[16],
  },
  modalContent: {
    width: '96%',
    maxWidth: 1340,
    maxHeight: '94%',
    borderRadius: RADIUS.dialog,
    borderWidth: 1,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  modalHeaderRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[12],
    borderBottomWidth: 1,
    position: 'relative',
    zIndex: 40,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBadge: {
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.xs,
    borderWidth: 1,
  },
  codeBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  headerTitleColumn: {
    flex: 1,
    gap: 2,
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  printHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
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
    top: 58,
    right: 20,
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
  documentPreviewContainer: {
    flex: 1,
    minHeight: 680,
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
  infoVal: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
});
