import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import {
  COLORS,
  useTheme,
  PageHeader,
  AnimatedCard,
  SearchBar,
  Button,
  Icon as Lucide,
  SkeletonLoader,
  EmptyState,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  SHADOWS,
} from '@edge/ui';
import {
  useReportsState,
  ReportType,
  PeriodMode,
  TimeRangeFilter,
  CategoryFilter,
  StatutoryPeriod,
  PeriodicStatBucket,
} from '../hooks/useReportsState';
import { ApplicationSummaryDto, TenantTransactionDto, FeedbackDto } from '@edge/api';
import { StatutoryReportPreviewModal } from '../components/StatutoryReportPreviewModal';
import { StatutoryReportSummary } from '../types/statutoryReports';

type FeatherIconName = React.ComponentProps<typeof Lucide>['name'];

const REPORT_TABS: Array<{ id: ReportType; label: string; icon: FeatherIconName }> = [
  { id: 'applications', label: 'Applications Throughput', icon: 'file-text' },
  { id: 'financial', label: 'Financial Collections', icon: 'dollar-sign' },
  { id: 'compliance', label: 'Compliance & SLA', icon: 'shield' },
  { id: 'satisfaction', label: 'Client Feedback (CSAT)', icon: 'star' },
  { id: 'statutory', label: 'National Govt Submissions', icon: 'book' },
];

const PERIOD_MODES: Array<{ id: PeriodMode; label: string; icon: FeatherIconName }> = [
  { id: 'monthly', label: 'Monthly Report', icon: 'calendar' },
  { id: 'quarterly', label: 'Quarterly Report', icon: 'pie-chart' },
  { id: 'yearly', label: 'Yearly Report', icon: 'bar-chart-2' },
  { id: 'rolling', label: 'Rolling Range', icon: 'clock' },
];

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const QUARTERS = [
  { q: 1, label: 'Q1 (Jan - Mar)' },
  { q: 2, label: 'Q2 (Apr - Jun)' },
  { q: 3, label: 'Q3 (Jul - Sep)' },
  { q: 4, label: 'Q4 (Oct - Dec)' },
];

const YEARS = [2026, 2025, 2024, 2023];

const STATUTORY_PERIODS: Array<{ id: StatutoryPeriod; label: string }> = [
  { id: 'Q1 2026', label: '1st Quarter 2026' },
  { id: 'Q2 2026', label: '2nd Quarter 2026' },
  { id: 'Q3 2026', label: '3rd Quarter 2026' },
  { id: 'Q4 2026', label: '4th Quarter 2026' },
  { id: 'Annual 2026', label: 'Annual 2026' },
];

const TIME_RANGES: Array<{ id: TimeRangeFilter; label: string }> = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: 'ytd', label: 'Year-to-Date' },
  { id: 'all', label: 'All Time' },
];

const CATEGORIES: Array<{ id: CategoryFilter; label: string }> = [
  { id: 'all', label: 'All Categories' },
  { id: 'Permits', label: 'Permits' },
  { id: 'Licenses', label: 'Licenses' },
  { id: 'Accreditations', label: 'Accreditations' },
  { id: 'Certificates', label: 'Certificates' },
  { id: 'Exams', label: 'Exams' },
];

export function ReportsScreen() {
  const { colors, isDark } = useTheme();
  const state = useReportsState();

  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= rating;
      stars.push(
        <Lucide
          key={i}
          name="star"
          size={12}
          color={isFilled ? COLORS.semantic.warning : (isDark ? colors.neutral[700] : colors.neutral[300])}
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={styles.starsRow}>{stars}</View>;
  };

  const formatDate = (isoStr?: string | null) => {
    if (isoStr === null || isoStr === undefined || isoStr.trim().length === 0) return '—';
    try {
      const date = new Date(isoStr);
      if (isNaN(date.getTime())) return isoStr;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const formatCurrency = (amount?: number | null) => {
    const safeAmt = amount ?? 0;
    return `₱${safeAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadgeStyle = (status?: string | null) => {
    const clean = (status ?? '').toLowerCase();
    if (clean === 'approved' || clean === 'completed' || clean === 'paid') {
      return {
        bg: isDark ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7',
        text: COLORS.semantic.success,
        border: isDark ? 'rgba(34, 197, 94, 0.3)' : '#86EFAC',
      };
    }
    if (clean === 'evaluating' || clean === 'submitted' || clean === 'pending') {
      return {
        bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#DBEAFE',
        text: isDark ? colors.brand[500] : colors.brand.primary,
        border: isDark ? 'rgba(59, 130, 246, 0.3)' : '#93C5FD',
      };
    }
    if (clean === 'returned' || clean === 'overdue' || clean === 'failed' || clean === 'rejected') {
      return {
        bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
        text: COLORS.semantic.error,
        border: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FCA5A5',
      };
    }
    return {
      bg: isDark ? colors.neutral[800] : colors.neutral[100],
      text: colors.textMuted,
      border: colors.border,
    };
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Page Header ── */}
        <PageHeader
          title="Operational Reports & Regional Analytics"
          subtitle="Live operational throughput, category distribution, financial collections, and service compliance."
          action={
            <View style={styles.headerActions}>
              <Button
                variant="outline"
                size="sm"
                fullWidth={false}
                leftIcon={<Lucide name="download" size={14} color={colors.text} />}
                onPress={state.exportCsv}
              >
                Export CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                fullWidth={false}
                leftIcon={<Lucide name="refresh-cw" size={14} color="#FFFFFF" />}
                onPress={() => {
                  void state.handleRefreshAll();
                }}
              >
                Refresh
              </Button>
            </View>
          }
        />

        {/* ── Report Tab Navigation & Filters Toolbar (Positioned at top for stable UX) ── */}
        <AnimatedCard style={[styles.toolbarCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          {/* Main Report Tabs */}
          <View style={styles.reportTabsRow}>
            {REPORT_TABS.map((tab) => {
              const isActive = state.reportType === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  style={[
                    styles.reportTabBtn,
                    { borderColor: colors.border },
                    isActive && {
                      backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                      borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                    },
                    Platform.select({ web: { cursor: 'pointer' } }),
                  ]}
                  onPress={() => {
                    state.setReportType(tab.id);
                    state.setCurrentPage(1);
                  }}
                >
                  <Lucide
                    name={tab.icon}
                    size={14}
                    color={isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.reportTabText,
                      { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                      isActive && { fontWeight: TYPOGRAPHY.weights.bold },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Period Granularity Switcher (Monthly, Quarterly, Yearly, Rolling) */}
          {state.reportType !== 'statutory' && (
            <View style={styles.periodGranularityRow}>
              <Text style={[styles.filterGroupLabel, { color: colors.textMuted }]}>Report Frequency:</Text>
              <View style={styles.periodModeBtnGroup}>
                {PERIOD_MODES.map((pm) => {
                  const isActive = state.periodMode === pm.id;
                  return (
                    <Pressable
                      key={pm.id}
                      style={[
                        styles.periodModeBtn,
                        { borderColor: colors.border },
                        isActive && {
                          backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                          borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                        },
                        Platform.select({ web: { cursor: 'pointer' } }),
                      ]}
                      onPress={() => {
                        state.setPeriodMode(pm.id);
                        state.setCurrentPage(1);
                      }}
                    >
                      <Lucide
                        name={pm.icon}
                        size={12}
                        color={isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.periodModeBtnText,
                          { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                          isActive && { fontWeight: TYPOGRAPHY.weights.bold },
                        ]}
                      >
                        {pm.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Granular Sub-Filters (Month / Quarter / Year / Rolling / Category) */}
          <View style={styles.filterControlsRow}>
            {state.reportType === 'statutory' ? (
              <View style={styles.filterPillsGroup}>
                <Text style={[styles.filterGroupLabel, { color: colors.textMuted }]}>Filing Term:</Text>
                {STATUTORY_PERIODS.map((p) => {
                  const isActive = state.selectedPeriod === p.id;
                  return (
                    <Pressable
                      key={p.id}
                      style={[
                        styles.smallPill,
                        { borderColor: colors.border },
                        isActive && {
                          backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                          borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                        },
                        Platform.select({ web: { cursor: 'pointer' } }),
                      ]}
                      onPress={() => {
                        state.setSelectedPeriod(p.id);
                      }}
                    >
                      <Text
                        style={[
                          styles.smallPillText,
                          { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                          isActive && { fontWeight: TYPOGRAPHY.weights.semibold },
                        ]}
                      >
                        {p.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <>
                {/* Monthly Sub-Selector */}
                {state.periodMode === 'monthly' && (
                  <View style={styles.granularSubGroup}>
                    {/* Year Selector */}
                    <View style={styles.filterPillsGroup}>
                      <Text style={[styles.filterGroupLabel, { color: colors.textMuted }]}>Year:</Text>
                      {YEARS.map((yr) => {
                        const isActive = state.selectedYear === yr;
                        return (
                          <Pressable
                            key={yr}
                            style={[
                              styles.smallPill,
                              { borderColor: colors.border },
                              isActive && {
                                backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                                borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                              },
                              Platform.select({ web: { cursor: 'pointer' } }),
                            ]}
                            onPress={() => {
                              state.setSelectedYear(yr);
                              state.setCurrentPage(1);
                            }}
                          >
                            <Text
                              style={[
                                styles.smallPillText,
                                { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                                isActive && { fontWeight: TYPOGRAPHY.weights.semibold },
                              ]}
                            >
                              {yr}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    {/* Month Selector */}
                    <View style={styles.filterPillsGroup}>
                      <Text style={[styles.filterGroupLabel, { color: colors.textMuted }]}>Month:</Text>
                      {MONTHS.map((m, idx) => {
                        const isActive = state.selectedMonth === idx;
                        return (
                          <Pressable
                            key={m}
                            style={[
                              styles.smallPill,
                              { borderColor: colors.border },
                              isActive && {
                                backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                                borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                              },
                              Platform.select({ web: { cursor: 'pointer' } }),
                            ]}
                            onPress={() => {
                              state.setSelectedMonth(idx);
                              state.setCurrentPage(1);
                            }}
                          >
                            <Text
                              style={[
                                styles.smallPillText,
                                { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                                isActive && { fontWeight: TYPOGRAPHY.weights.semibold },
                              ]}
                            >
                              {m}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Quarterly Sub-Selector */}
                {state.periodMode === 'quarterly' && (
                  <View style={styles.granularSubGroup}>
                    {/* Year Selector */}
                    <View style={styles.filterPillsGroup}>
                      <Text style={[styles.filterGroupLabel, { color: colors.textMuted }]}>Year:</Text>
                      {YEARS.map((yr) => {
                        const isActive = state.selectedYear === yr;
                        return (
                          <Pressable
                            key={yr}
                            style={[
                              styles.smallPill,
                              { borderColor: colors.border },
                              isActive && {
                                backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                                borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                              },
                              Platform.select({ web: { cursor: 'pointer' } }),
                            ]}
                            onPress={() => {
                              state.setSelectedYear(yr);
                              state.setCurrentPage(1);
                            }}
                          >
                            <Text
                              style={[
                                styles.smallPillText,
                                { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                                isActive && { fontWeight: TYPOGRAPHY.weights.semibold },
                              ]}
                            >
                              {yr}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    {/* Quarter Selector */}
                    <View style={styles.filterPillsGroup}>
                      <Text style={[styles.filterGroupLabel, { color: colors.textMuted }]}>Quarter:</Text>
                      {QUARTERS.map((qObj) => {
                        const isActive = state.selectedQuarter === qObj.q;
                        return (
                          <Pressable
                            key={qObj.q}
                            style={[
                              styles.smallPill,
                              { borderColor: colors.border },
                              isActive && {
                                backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                                borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                              },
                              Platform.select({ web: { cursor: 'pointer' } }),
                            ]}
                            onPress={() => {
                              state.setSelectedQuarter(qObj.q);
                              state.setCurrentPage(1);
                            }}
                          >
                            <Text
                              style={[
                                styles.smallPillText,
                                { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                                isActive && { fontWeight: TYPOGRAPHY.weights.semibold },
                              ]}
                            >
                              {qObj.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Yearly Sub-Selector */}
                {state.periodMode === 'yearly' && (
                  <View style={styles.filterPillsGroup}>
                    <Text style={[styles.filterGroupLabel, { color: colors.textMuted }]}>Year:</Text>
                    {YEARS.map((yr) => {
                      const isActive = state.selectedYear === yr;
                      return (
                        <Pressable
                          key={yr}
                          style={[
                            styles.smallPill,
                            { borderColor: colors.border },
                            isActive && {
                              backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                              borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                            },
                            Platform.select({ web: { cursor: 'pointer' } }),
                          ]}
                          onPress={() => {
                            state.setSelectedYear(yr);
                            state.setCurrentPage(1);
                          }}
                        >
                          <Text
                            style={[
                              styles.smallPillText,
                              { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                              isActive && { fontWeight: TYPOGRAPHY.weights.semibold },
                            ]}
                          >
                            {yr}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}

                {/* Rolling Sub-Selector */}
                {state.periodMode === 'rolling' && (
                  <View style={styles.filterPillsGroup}>
                    <Text style={[styles.filterGroupLabel, { color: colors.textMuted }]}>Rolling Range:</Text>
                    {TIME_RANGES.map((t) => {
                      const isActive = state.timeRange === t.id;
                      return (
                        <Pressable
                          key={t.id}
                          style={[
                            styles.smallPill,
                            { borderColor: colors.border },
                            isActive && {
                              backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                              borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                            },
                            Platform.select({ web: { cursor: 'pointer' } }),
                          ]}
                          onPress={() => {
                            state.setTimeRange(t.id);
                            state.setCurrentPage(1);
                          }}
                        >
                          <Text
                            style={[
                              styles.smallPillText,
                              { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                              isActive && { fontWeight: TYPOGRAPHY.weights.semibold },
                            ]}
                          >
                            {t.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}

                {/* Category Filter */}
                {(state.reportType === 'applications' || state.reportType === 'compliance') && (
                  <View style={styles.filterPillsGroup}>
                    <Text style={[styles.filterGroupLabel, { color: colors.textMuted }]}>Category:</Text>
                    {CATEGORIES.map((c) => {
                      const isActive = state.categoryFilter === c.id;
                      return (
                        <Pressable
                          key={c.id}
                          style={[
                            styles.smallPill,
                            { borderColor: colors.border },
                            isActive && {
                              backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                              borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                            },
                            Platform.select({ web: { cursor: 'pointer' } }),
                          ]}
                          onPress={() => {
                            state.setCategoryFilter(c.id);
                            state.setCurrentPage(1);
                          }}
                        >
                          <Text
                            style={[
                              styles.smallPillText,
                              { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                              isActive && { fontWeight: TYPOGRAPHY.weights.semibold },
                            ]}
                          >
                            {c.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </>
            )}
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchBar
              value={state.searchQuery}
              onChangeText={(text) => {
                state.setSearchQuery(text);
                state.setCurrentPage(1);
              }}
              placeholder="Search by Reference #, Applicant Name, Service Category, or Keyword..."
            />
          </View>
        </AnimatedCard>

        {/* ── KPI Summary Cards ── */}
        <View style={styles.statsGrid}>
          {/* Applications Throughput */}
          <AnimatedCard style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconBox, { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light }]}>
                <Lucide name="file-text" size={18} color={isDark ? colors.brand[500] : colors.brand.primary} />
              </View>
              <Text style={[styles.statTag, { color: colors.textMuted }]}>Volume</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{state.stats.totalApps}</Text>
            <View style={styles.statMetaRow}>
              <Text style={[styles.statSubText, { color: COLORS.semantic.success }]}>
                {state.stats.approvedCount} Approved
              </Text>
              <Text style={[styles.statSubText, { color: colors.textMuted }]}>•</Text>
              <Text style={[styles.statSubText, { color: isDark ? colors.brand[500] : colors.brand.primary }]}>
                {state.stats.evaluatingCount} In Review
              </Text>
            </View>
          </AnimatedCard>

          {/* Approval & Compliance Rate */}
          <AnimatedCard style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconBox, { backgroundColor: isDark ? colors.neutral[800] : '#DCFCE7' }]}>
                <Lucide name="check-circle" size={18} color={COLORS.semantic.success} />
              </View>
              <Text style={[styles.statTag, { color: COLORS.semantic.success }]}>Compliance</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{state.stats.approvalRate}%</Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, Math.max(0, state.stats.approvalRate))}%`, backgroundColor: COLORS.semantic.success },
                ]}
              />
            </View>
          </AnimatedCard>

          {/* Financial Collections */}
          <AnimatedCard style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconBox, { backgroundColor: isDark ? colors.neutral[800] : '#FEF3C7' }]}>
                <Lucide name="dollar-sign" size={18} color={COLORS.semantic.warning} />
              </View>
              <Text style={[styles.statTag, { color: COLORS.semantic.warningText }]}>Revenue</Text>
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatCurrency(state.stats.totalCollected)}
            </Text>
            <Text style={[styles.statSubText, { color: colors.textMuted }]}>
              Total Invoiced: {formatCurrency(state.stats.totalInvoiced)}
            </Text>
          </AnimatedCard>

          {/* Customer Satisfaction */}
          <AnimatedCard style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconBox, { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light }]}>
                <Lucide name="star" size={18} color={COLORS.semantic.warning} />
              </View>
              <Text style={[styles.statTag, { color: colors.textMuted }]}>CSAT</Text>
            </View>
            <View style={styles.ratingValueRow}>
              <Text style={[styles.statValue, { color: colors.text }]}>{state.stats.avgCsat}</Text>
              <Text style={styles.ratingStarSuffix}>★</Text>
            </View>
            <Text style={[styles.statSubText, { color: colors.textMuted }]}>
              {state.stats.csatTotal} total client evaluations
            </Text>
          </AnimatedCard>
        </View>

        {/* ── Category Breakdown Distribution Card ── */}
        <AnimatedCard style={[styles.breakdownCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.breakdownHeader}>
            <View>
              <Text style={[styles.breakdownTitle, { color: colors.text }]}>Service Category Distribution</Text>
              <Text style={[styles.breakdownSubtitle, { color: colors.textMuted }]}>
                Proportion of applications across regulatory streams in the active timeframe
              </Text>
            </View>
          </View>

          {/* Distribution Bar */}
          <View style={[styles.distributionBarContainer, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
            {state.categoryBreakdown.map((item, idx) => {
              const palette = [
                colors.brand.primary,
                '#3B82F6',
                '#10B981',
                '#F59E0B',
                '#8B5CF6',
              ];
              const segmentColor = palette[idx % palette.length] ?? colors.brand.primary;
              if (item.percentage <= 0) return null;
              return (
                <View
                  key={item.category}
                  style={[
                    styles.distributionSegment,
                    {
                      flex: Math.max(item.percentage, 1),
                      backgroundColor: segmentColor,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Legend Items */}
          <View style={styles.legendGrid}>
            {state.categoryBreakdown.map((item, idx) => {
              const palette = [
                colors.brand.primary,
                '#3B82F6',
                '#10B981',
                '#F59E0B',
                '#8B5CF6',
              ];
              const dotColor = palette[idx % palette.length] ?? colors.brand.primary;
              return (
                <View key={item.category} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: dotColor }]} />
                  <Text style={[styles.legendLabel, { color: colors.text }]}>{item.category}</Text>
                  <Text style={[styles.legendCount, { color: colors.textMuted }]}>
                    {item.count} ({item.percentage}%)
                  </Text>
                </View>
              );
            })}
          </View>
        </AnimatedCard>

        {/* ── Periodic Performance & Trend Statistics Matrix Card ── */}
        {state.reportType !== 'statutory' && (
          <AnimatedCard style={[styles.breakdownCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.breakdownHeader}>
              <View>
                <Text style={[styles.breakdownTitle, { color: colors.text }]}>
                  Periodic Statistics & Trend Analysis ({state.periodMode.toUpperCase()})
                </Text>
                <Text style={[styles.breakdownSubtitle, { color: colors.textMuted }]}>
                  Comparative volume, approval rates, revenue collections, and CSAT scores across intervals
                </Text>
              </View>
              <Button
                variant="outline"
                size="sm"
                fullWidth={false}
                leftIcon={<Lucide name="bar-chart-2" size={13} color={colors.text} />}
                onPress={state.exportPeriodicStatsCsv}
              >
                Export Matrix CSV
              </Button>
            </View>

            {/* Visual Distribution Column Chart */}
            <View style={[styles.periodicChartContainer, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: colors.border }]}>
              {state.periodicStatistics.map((bucket) => {
                const maxVol = Math.max(...state.periodicStatistics.map((b) => b.totalApplications), 1);
                const heightPct = Math.round((bucket.totalApplications / maxVol) * 100);
                return (
                  <View key={bucket.id} style={styles.periodicBarCol}>
                    <Text style={[styles.periodicBarVal, { color: colors.textMuted }]}>
                      {bucket.totalApplications > 0 ? bucket.totalApplications : ''}
                    </Text>
                    <View style={[styles.periodicBarTrack, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[200] }]}>
                      <View
                        style={[
                          styles.periodicBarFill,
                          {
                            height: `${Math.max(6, heightPct)}%`,
                            backgroundColor: bucket.totalApplications > 0 ? (isDark ? colors.brand[500] : colors.brand.primary) : 'transparent',
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.periodicBarLabel, { color: colors.text }]} numberOfLines={1}>
                      {bucket.shortLabel}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Periodic Matrix Table */}
            <View style={[styles.periodicTableContainer, { borderColor: colors.border }]}>
              <View style={[styles.periodicTableHeader, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100], borderBottomColor: colors.border }]}>
                <Text style={[styles.periodicThCell, { flex: 1.5, color: colors.textMuted }]}>INTERVAL / PERIOD</Text>
                <Text style={[styles.periodicThCell, { flex: 1, textAlign: 'center', color: colors.textMuted }]}>APPLICATIONS</Text>
                <Text style={[styles.periodicThCell, { flex: 1, textAlign: 'center', color: colors.textMuted }]}>APPROVED</Text>
                <Text style={[styles.periodicThCell, { flex: 1, textAlign: 'center', color: colors.textMuted }]}>IN REVIEW</Text>
                <Text style={[styles.periodicThCell, { flex: 1, textAlign: 'center', color: colors.textMuted }]}>RETURNED</Text>
                <Text style={[styles.periodicThCell, { flex: 1.2, textAlign: 'center', color: colors.textMuted }]}>SLA COMPLIANCE</Text>
                <Text style={[styles.periodicThCell, { flex: 1.5, textAlign: 'right', color: colors.textMuted }]}>REVENUE (₱)</Text>
                <Text style={[styles.periodicThCell, { flex: 1, textAlign: 'right', color: colors.textMuted }]}>CSAT</Text>
              </View>

              {state.periodicStatistics.map((b, idx) => (
                <View
                  key={b.id}
                  style={[
                    styles.periodicTableRow,
                    { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] },
                    idx === state.periodicStatistics.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <Text style={[styles.periodicTdCell, { flex: 1.5, color: colors.text, fontWeight: TYPOGRAPHY.weights.semibold }]}>
                    {b.label}
                  </Text>
                  <Text style={[styles.periodicTdCell, { flex: 1, textAlign: 'center', color: colors.text }]}>
                    {b.totalApplications}
                  </Text>
                  <Text style={[styles.periodicTdCell, { flex: 1, textAlign: 'center', color: COLORS.semantic.success }]}>
                    {b.approvedCount}
                  </Text>
                  <Text style={[styles.periodicTdCell, { flex: 1, textAlign: 'center', color: isDark ? colors.brand[500] : colors.brand.primary }]}>
                    {b.evaluatingCount}
                  </Text>
                  <Text style={[styles.periodicTdCell, { flex: 1, textAlign: 'center', color: b.returnedCount > 0 ? COLORS.semantic.error : colors.textMuted }]}>
                    {b.returnedCount}
                  </Text>
                  <Text style={[styles.periodicTdCell, { flex: 1.2, textAlign: 'center', color: COLORS.semantic.success, fontWeight: TYPOGRAPHY.weights.bold }]}>
                    {b.approvalRate}%
                  </Text>
                  <Text style={[styles.periodicTdCell, { flex: 1.5, textAlign: 'right', color: colors.text, fontWeight: TYPOGRAPHY.weights.bold }]}>
                    {formatCurrency(b.totalRevenue)}
                  </Text>
                  <Text style={[styles.periodicTdCell, { flex: 1, textAlign: 'right', color: COLORS.semantic.warning }]}>
                    {b.avgCsat} ★
                  </Text>
                </View>
              ))}
            </View>
          </AnimatedCard>
        )}

        {/* ── Content Table Area ── */}
        {state.isLoading && (
          <View style={styles.loadingStack}>
            <SkeletonLoader variant="rectangular" width="100%" height={60} borderRadius={8} />
            <SkeletonLoader variant="rectangular" width="100%" height={60} borderRadius={8} />
            <SkeletonLoader variant="rectangular" width="100%" height={60} borderRadius={8} />
            <SkeletonLoader variant="rectangular" width="100%" height={60} borderRadius={8} />
          </View>
        )}

        {/* Empty State */}
        {!state.isLoading && state.activeItemCount === 0 && (
          <EmptyState
            icon="file-text"
            title="No Records Found"
            description="No items match your active report type, timeframe, category, and search query."
            actionLabel="Reset Filters"
            onActionPress={() => {
              state.setSearchQuery('');
              state.setTimeRange('30d');
              state.setCategoryFilter('all');
            }}
          />
        )}

        {/* Tab 1 & 3: Applications & Compliance Table */}
        {!state.isLoading && (state.reportType === 'applications' || state.reportType === 'compliance') && state.paginatedApplications.length > 0 && (
          <AnimatedCard style={[styles.tableCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            {/* Table Headings */}
            <View style={[styles.tableHeaderRow, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderBottomColor: colors.border }]}>
              <Text style={[styles.thCell, { flex: 1.5, color: colors.textMuted }]}>APPLICATION # / REF</Text>
              <Text style={[styles.thCell, { flex: 2, color: colors.textMuted }]}>APPLICANT</Text>
              <Text style={[styles.thCell, { flex: 2.2, color: colors.textMuted }]}>SERVICE DETAILS</Text>
              <Text style={[styles.thCell, { flex: 1.2, color: colors.textMuted }]}>SUBMITTED</Text>
              <Text style={[styles.thCell, { flex: 1.2, textAlign: 'right', color: colors.textMuted }]}>STATUS</Text>
            </View>

            {/* Table Rows */}
            {state.paginatedApplications.map((app: ApplicationSummaryDto, index: number) => {
              const statusStyle = getStatusBadgeStyle(app.status);
              const applicant = app.filingUser?.name ?? app.filingUser?.company?.name ?? 'Individual Applicant';
              return (
                <View
                  key={app.id || index}
                  style={[
                    styles.tableRow,
                    { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] },
                    index === state.paginatedApplications.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={[styles.tdCell, { flex: 1.5 }]}>
                    <Text style={[styles.primaryCellText, { color: colors.text }]}>
                      {app.applicationNumber || 'APP-2026-001'}
                    </Text>
                    {app.referenceNumber ? (
                      <Text style={[styles.subCellText, { color: colors.textMuted }]}>
                        Ref: {app.referenceNumber}
                      </Text>
                    ) : null}
                  </View>

                  <View style={[styles.tdCell, { flex: 2 }]}>
                    <Text style={[styles.primaryCellText, { color: colors.text }]}>{applicant}</Text>
                    <Text style={[styles.subCellText, { color: colors.textMuted }]}>
                      {app.filingUser?.email || 'verified@user'}
                    </Text>
                  </View>

                  <View style={[styles.tdCell, { flex: 2.2 }]}>
                    <Text style={[styles.primaryCellText, { color: colors.text }]}>
                      {app.serviceName || 'Radio Station Permit'}
                    </Text>
                    <Text style={[styles.subCellText, { color: colors.textMuted }]}>
                      {app.serviceCategory || 'Permits'}
                    </Text>
                  </View>

                  <View style={[styles.tdCell, { flex: 1.2 }]}>
                    <Text style={[styles.primaryCellText, { color: colors.text }]}>
                      {formatDate(app.createdAt)}
                    </Text>
                  </View>

                  <View style={[styles.tdCell, { flex: 1.2, alignItems: 'flex-end' }]}>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: statusStyle.bg,
                          borderColor: statusStyle.border,
                        },
                      ]}
                    >
                      <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                        {app.status || 'Submitted'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </AnimatedCard>
        )}

        {/* Tab 2: Financial Collections Table */}
        {!state.isLoading && state.reportType === 'financial' && state.paginatedTransactions.length > 0 && (
          <AnimatedCard style={[styles.tableCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            {/* Table Headings */}
            <View style={[styles.tableHeaderRow, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderBottomColor: colors.border }]}>
              <Text style={[styles.thCell, { flex: 1.5, color: colors.textMuted }]}>REFERENCE NO</Text>
              <Text style={[styles.thCell, { flex: 2, color: colors.textMuted }]}>PAYOR / APPLICANT</Text>
              <Text style={[styles.thCell, { flex: 2.2, color: colors.textMuted }]}>SERVICE / TYPE</Text>
              <Text style={[styles.thCell, { flex: 1.2, color: colors.textMuted }]}>AMOUNT</Text>
              <Text style={[styles.thCell, { flex: 1.2, color: colors.textMuted }]}>DATE</Text>
              <Text style={[styles.thCell, { flex: 1.2, textAlign: 'right', color: colors.textMuted }]}>PAYMENT STATUS</Text>
            </View>

            {/* Table Rows */}
            {state.paginatedTransactions.map((tx: TenantTransactionDto, index: number) => {
              const statusStyle = getStatusBadgeStyle(tx.paymentStatus);
              return (
                <View
                  key={tx.id || index}
                  style={[
                    styles.tableRow,
                    { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] },
                    index === state.paginatedTransactions.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={[styles.tdCell, { flex: 1.5 }]}>
                    <Text style={[styles.primaryCellText, { color: colors.text }]}>{tx.refNo}</Text>
                  </View>

                  <View style={[styles.tdCell, { flex: 2 }]}>
                    <Text style={[styles.primaryCellText, { color: colors.text }]}>
                      {tx.applicantName || 'Applicant'}
                    </Text>
                  </View>

                  <View style={[styles.tdCell, { flex: 2.2 }]}>
                    <Text style={[styles.primaryCellText, { color: colors.text }]}>
                      {tx.serviceType || 'Permit Regulatory Fee'}
                    </Text>
                  </View>

                  <View style={[styles.tdCell, { flex: 1.2 }]}>
                    <Text style={[styles.primaryCellText, { color: colors.text, fontWeight: TYPOGRAPHY.weights.bold }]}>
                      {formatCurrency(tx.amount)}
                    </Text>
                  </View>

                  <View style={[styles.tdCell, { flex: 1.2 }]}>
                    <Text style={[styles.primaryCellText, { color: colors.text }]}>
                      {formatDate(tx.date)}
                    </Text>
                  </View>

                  <View style={[styles.tdCell, { flex: 1.2, alignItems: 'flex-end' }]}>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: statusStyle.bg,
                          borderColor: statusStyle.border,
                        },
                      ]}
                    >
                      <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                        {tx.paymentStatus || 'Pending'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </AnimatedCard>
        )}

        {/* Tab 4: Client CSAT Feedback Table */}
        {!state.isLoading && state.reportType === 'satisfaction' && state.paginatedFeedback.length > 0 && (
          <AnimatedCard style={[styles.tableCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            {/* Table Headings */}
            <View style={[styles.tableHeaderRow, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderBottomColor: colors.border }]}>
              <Text style={[styles.thCell, { flex: 1.8, color: colors.textMuted }]}>CLIENT / SENDER</Text>
              <Text style={[styles.thCell, { flex: 1.2, color: colors.textMuted }]}>RATING</Text>
              <Text style={[styles.thCell, { flex: 2, color: colors.textMuted }]}>SUBJECT</Text>
              <Text style={[styles.thCell, { flex: 2.5, color: colors.textMuted }]}>FEEDBACK COMMENT</Text>
              <Text style={[styles.thCell, { flex: 1.2, textAlign: 'right', color: colors.textMuted }]}>DATE</Text>
            </View>

            {/* Table Rows */}
            {state.paginatedFeedback.map((fb: FeedbackDto, index: number) => {
              const displayName = fb.isAnonymous ? 'Anonymous Client' : (fb.senderName || 'Client');
              return (
                <View
                  key={fb.id || index}
                  style={[
                    styles.tableRow,
                    { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] },
                    index === state.paginatedFeedback.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={[styles.tdCell, { flex: 1.8 }]}>
                    <Text style={[styles.primaryCellText, { color: colors.text }]}>{displayName}</Text>
                    {!fb.isAnonymous && fb.senderEmail ? (
                      <Text style={[styles.subCellText, { color: colors.textMuted }]}>{fb.senderEmail}</Text>
                    ) : null}
                  </View>

                  <View style={[styles.tdCell, { flex: 1.2 }]}>
                    {renderRatingStars(fb.rating)}
                    <Text style={[styles.subCellText, { color: colors.textMuted, marginTop: 2 }]}>
                      {fb.rating}.0 / 5.0
                    </Text>
                  </View>

                  <View style={[styles.tdCell, { flex: 2 }]}>
                    <Text style={[styles.primaryCellText, { color: colors.text }]} numberOfLines={1}>
                      {fb.subject}
                    </Text>
                  </View>

                  <View style={[styles.tdCell, { flex: 2.5 }]}>
                    <Text style={[styles.subCellText, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]} numberOfLines={2}>
                      {fb.message}
                    </Text>
                  </View>

                  <View style={[styles.tdCell, { flex: 1.2, alignItems: 'flex-end' }]}>
                    <Text style={[styles.primaryCellText, { color: colors.text }]}>
                      {formatDate(fb.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </AnimatedCard>
        )}

        {/* Tab 5: National Government Statutory Submissions */}
        {!state.isLoading && state.reportType === 'statutory' && (
          <View style={styles.statutoryContainer}>
            {/* Regional Tenant Context Banner */}
            <AnimatedCard style={[styles.tenantBannerCard, { backgroundColor: isDark ? colors.neutral[900] : '#F0FDF4', borderColor: isDark ? colors.neutral[700] : '#BBF7D0' }]}>
              <View style={styles.tenantBannerHeader}>
                <View style={[styles.tenantFlagBox, { backgroundColor: isDark ? colors.brand[500] : colors.brand.primary }]}>
                  <Lucide name="award" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.tenantBannerTextColumn}>
                  <Text style={[styles.tenantBannerTitle, { color: colors.text }]}>
                    {state.tenantDisplayName} • Statutory Submissions
                  </Text>
                  <Text style={[styles.tenantBannerSubtitle, { color: colors.textMuted }]}>
                    Official regulatory forms and physical/financial accomplishment filings submitted to DBM, COA, BTr, ARTA, and Central Office.
                  </Text>
                </View>
              </View>
            </AnimatedCard>

            {/* Grid of 6 Statutory Reports */}
            <View style={styles.statutoryGrid}>
              {state.statutoryReports.map((rep: StatutoryReportSummary, index: number) => {
                const meta = rep.metadata;
                return (
                  <AnimatedCard
                    key={meta.code}
                    delay={index * 30}
                    style={[styles.statutoryCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                  >
                    {/* Top Agency & Code Row */}
                    <View style={styles.statutoryTopRow}>
                      <View style={[styles.agencyBadge, { backgroundColor: `${meta.badgeColor}18`, borderColor: `${meta.badgeColor}40` }]}>
                        <Text style={[styles.agencyBadgeText, { color: meta.badgeColor }]}>{meta.agency}</Text>
                      </View>
                      <View style={[styles.frequencyPill, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                        <Text style={[styles.frequencyPillText, { color: colors.textMuted }]}>{meta.frequency}</Text>
                      </View>
                    </View>

                    {/* Code & Title */}
                    <Text style={[styles.statutoryCodeText, { color: isDark ? colors.brand[500] : colors.brand.primary }]}>
                      {meta.code}
                    </Text>
                    <Text style={[styles.statutoryCardTitle, { color: colors.text }]}>{meta.title}</Text>
                    <Text style={[styles.statutoryCardSub, { color: colors.textMuted }]}>{meta.description}</Text>

                    {/* Legal Authority Footnote */}
                    <View style={[styles.legalFootnoteRow, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                      <Lucide name="shield" size={12} color={colors.textMuted} />
                      <Text style={[styles.legalFootnoteText, { color: colors.textMuted }]} numberOfLines={1}>
                        {meta.legalBasis}
                      </Text>
                    </View>

                    {/* Live Metrics Chips */}
                    <View style={styles.metricsChipRow}>
                      <View style={styles.chipItem}>
                        <Text style={[styles.chipLabel, { color: colors.textMuted }]}>Records</Text>
                        <Text style={[styles.chipVal, { color: colors.text }]}>{rep.recordCount}</Text>
                      </View>
                      <View style={styles.chipItem}>
                        <Text style={[styles.chipLabel, { color: colors.textMuted }]}>Compliance</Text>
                        <Text style={[styles.chipVal, { color: COLORS.semantic.success }]}>{rep.complianceRate}%</Text>
                      </View>
                      {rep.totalAmount !== undefined && (
                        <View style={styles.chipItem}>
                          <Text style={[styles.chipLabel, { color: colors.textMuted }]}>Collections</Text>
                          <Text style={[styles.chipVal, { color: COLORS.semantic.warning }]}>
                            ₱{rep.totalAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Card Actions */}
                    <View style={[styles.statutoryActionsRow, { borderTopColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth={false}
                        leftIcon={<Lucide name="eye" size={13} color={colors.text} />}
                        onPress={() => state.handleOpenStatutoryModal(meta)}
                      >
                        Preview Form
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth={false}
                        leftIcon={<Lucide name="download" size={13} color={colors.text} />}
                        onPress={() => state.handleDownloadStatutoryCsv(meta.code)}
                      >
                        CSV
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth={false}
                        leftIcon={<Lucide name="printer" size={13} color="#FFFFFF" />}
                        onPress={() => state.handlePrintStatutoryReport(meta)}
                      >
                        Print Form
                      </Button>
                    </View>
                  </AnimatedCard>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Sticky Floating Glassmorphism Pagination Bar (when in standard tabular modes) ── */}
      {state.reportType !== 'statutory' && state.totalPages > 1 && (
        <View style={styles.floatingPaginationOverlay} pointerEvents="box-none">
          <View
            style={[
              styles.paginationGlassPill,
              {
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              },
            ]}
          >
            <Pressable
              style={[
                styles.pageBtn,
                { borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : colors.border, backgroundColor: isDark ? colors.neutral[800] : colors.cardBg },
                state.currentPage === 1 && styles.pageBtnDisabled,
                Platform.select({ web: { cursor: state.currentPage === 1 ? 'not-allowed' : 'pointer' } as object }),
              ]}
              disabled={state.currentPage === 1}
              onPress={() => state.setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <Lucide name="chevron-left" size={14} color={state.currentPage === 1 ? colors.textMuted : colors.text} />
              <Text style={[styles.pageBtnText, { color: state.currentPage === 1 ? colors.textMuted : colors.text }]}>
                Previous
              </Text>
            </Pressable>

            <View style={[styles.pageInfoBadge, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
              <Text style={[styles.paginationInfo, { color: colors.text }]}>
                Page <Text style={{ fontWeight: TYPOGRAPHY.weights.bold }}>{state.currentPage}</Text> of {state.totalPages}
                {'  '}({state.activeItemCount} records)
              </Text>
            </View>

            <Pressable
              style={[
                styles.pageBtn,
                { borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : colors.border, backgroundColor: isDark ? colors.neutral[800] : colors.cardBg },
                state.currentPage === state.totalPages && styles.pageBtnDisabled,
                Platform.select({ web: { cursor: state.currentPage === state.totalPages ? 'not-allowed' : 'pointer' } as object }),
              ]}
              disabled={state.currentPage === state.totalPages}
              onPress={() => state.setCurrentPage((p) => Math.min(state.totalPages, p + 1))}
            >
              <Text style={[styles.pageBtnText, { color: state.currentPage === state.totalPages ? colors.textMuted : colors.text }]}>
                Next
              </Text>
              <Lucide name="chevron-right" size={14} color={state.currentPage === state.totalPages ? colors.textMuted : colors.text} />
            </Pressable>
          </View>
        </View>
      )}

      {/* Statutory Report In-App Preview & Export Modal */}
      <StatutoryReportPreviewModal
        visible={state.statutoryModal.visible}
        report={state.statutoryModal.report}
        tenantName={state.tenantDisplayName}
        period={state.selectedPeriod}
        applications={state.filteredApplications}
        transactions={state.filteredTransactions}
        feedback={state.filteredFeedback}
        onClose={state.handleCloseStatutoryModal}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: SPACING[20],
    paddingBottom: 90,
    gap: SPACING[16],
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    flexShrink: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 220,
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[6],
    ...SHADOWS.card,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTag: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.overline,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 22,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statSubText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  ratingValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  ratingStarSuffix: {
    fontSize: 16,
    color: COLORS.semantic.warning,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  breakdownCard: {
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[12],
    ...SHADOWS.card,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  breakdownSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    marginTop: 2,
  },
  distributionBarContainer: {
    height: 10,
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 2,
  },
  distributionSegment: {
    height: '100%',
    borderRadius: 2,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[16],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  legendCount: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  periodicChartContainer: {
    height: 120,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[12],
    paddingBottom: SPACING[8],
    paddingTop: SPACING[16],
    gap: SPACING[8],
  },
  periodicBarCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 4,
  },
  periodicBarVal: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  periodicBarTrack: {
    width: '100%',
    maxWidth: 28,
    flex: 1,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  periodicBarFill: {
    width: '100%',
    borderRadius: 4,
  },
  periodicBarLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  periodicTableContainer: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: SPACING[4],
  },
  periodicTableHeader: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
  },
  periodicThCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  periodicTableRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  periodicTdCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  toolbarCard: {
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[12],
  },
  reportTabsRow: {
    flexDirection: 'row',
    gap: SPACING[8],
    flexWrap: 'wrap',
  },
  reportTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  reportTabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  periodGranularityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    flexWrap: 'wrap',
  },
  periodModeBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
    flexWrap: 'wrap',
  },
  periodModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING[10],
    paddingVertical: SPACING[6],
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  periodModeBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  granularSubGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  filterControlsRow: {
    gap: SPACING[10],
  },
  filterPillsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
    flexWrap: 'wrap',
  },
  filterGroupLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginRight: 4,
  },
  smallPill: {
    paddingHorizontal: SPACING[10],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  smallPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  searchContainer: {
    marginTop: 2,
  },
  loadingStack: {
    gap: SPACING[8],
  },
  tableCard: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[10],
    borderBottomWidth: 1,
  },
  thCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  tdCell: {
    justifyContent: 'center',
  },
  primaryCellText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  subCellText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingPaginationOverlay: {
    position: 'absolute',
    bottom: SPACING[16],
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationGlassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING[10],
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.circle,
    borderWidth: 1,
    ...SHADOWS.modal,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      },
    }),
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  pageInfoBadge: {
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[6],
    borderRadius: RADIUS.sm,
  },
  paginationInfo: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  statutoryContainer: {
    gap: SPACING[16],
  },
  tenantBannerCard: {
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    ...SHADOWS.card,
  },
  tenantBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  tenantFlagBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenantBannerTextColumn: {
    flex: 1,
  },
  tenantBannerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  tenantBannerSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginTop: 2,
  },
  statutoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[16],
  },
  statutoryCard: {
    flex: 1,
    minWidth: 380,
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[10],
    ...SHADOWS.card,
  },
  statutoryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  agencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  agencyBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  frequencyPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  frequencyPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  statutoryCodeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statutoryCardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: -4,
  },
  statutoryCardSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    lineHeight: 17,
  },
  legalFootnoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: SPACING[8],
    borderRadius: RADIUS.sm,
  },
  legalFootnoteText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    flex: 1,
  },
  metricsChipRow: {
    flexDirection: 'row',
    gap: SPACING[12],
    marginVertical: 2,
  },
  chipItem: {
    gap: 1,
  },
  chipLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
  },
  chipVal: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statutoryActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING[8],
    paddingTop: SPACING[12],
    borderTopWidth: 1,
  },
});
