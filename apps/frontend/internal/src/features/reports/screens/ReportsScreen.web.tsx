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
  TimeRangeFilter,
  CategoryFilter,
} from '../hooks/useReportsState';
import { ApplicationSummaryDto, TenantTransactionDto, FeedbackDto } from '@edge/api';

type FeatherIconName = React.ComponentProps<typeof Lucide>['name'];

const REPORT_TABS: Array<{ id: ReportType; label: string; icon: FeatherIconName }> = [
  { id: 'applications', label: 'Applications Throughput', icon: 'file-text' },
  { id: 'financial', label: 'Financial Collections', icon: 'dollar-sign' },
  { id: 'compliance', label: 'Compliance & SLA', icon: 'shield' },
  { id: 'satisfaction', label: 'Client Feedback (CSAT)', icon: 'star' },
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

        {/* ── Report Tab Navigation & Filters Toolbar ── */}
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

          {/* Time Range & Category Pills */}
          <View style={styles.filterControlsRow}>
            <View style={styles.filterPillsGroup}>
              <Text style={[styles.filterGroupLabel, { color: colors.textMuted }]}>Range:</Text>
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
      </ScrollView>

      {/* ── Sticky Floating Glassmorphism Pagination Bar ── */}
      {state.totalPages > 1 && (
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
});
