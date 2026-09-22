import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
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
} from '@edge/ui';
import {
  useReportsState,
  ReportType,
  PeriodMode,
  TimeRangeFilter,
} from '../hooks/useReportsState';
import { ApplicationSummaryDto, TenantTransactionDto, FeedbackDto } from '@edge/api';
import { StatutoryReportPreviewModal } from '../components/StatutoryReportPreviewModal';
import { StatutoryReportSummary } from '../types/statutoryReports';

type FeatherIconName = React.ComponentProps<typeof Lucide>['name'];

const REPORT_TABS: Array<{ id: ReportType; label: string; icon: FeatherIconName }> = [
  { id: 'applications', label: 'Apps', icon: 'file-text' },
  { id: 'financial', label: 'Finance', icon: 'dollar-sign' },
  { id: 'compliance', label: 'SLA', icon: 'shield' },
  { id: 'satisfaction', label: 'CSAT', icon: 'star' },
  { id: 'statutory', label: 'Govt Forms', icon: 'book' },
];

const PERIOD_MODES: Array<{ id: PeriodMode; label: string; icon: FeatherIconName }> = [
  { id: 'monthly', label: 'Monthly', icon: 'calendar' },
  { id: 'quarterly', label: 'Quarterly', icon: 'pie-chart' },
  { id: 'yearly', label: 'Yearly', icon: 'bar-chart-2' },
  { id: 'rolling', label: 'Rolling', icon: 'clock' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const QUARTERS = [
  { q: 1, label: 'Q1' },
  { q: 2, label: 'Q2' },
  { q: 3, label: 'Q3' },
  { q: 4, label: 'Q4' },
];
const YEARS = [2024, 2025, 2026];

const TIME_RANGES: Array<{ id: TimeRangeFilter; label: string }> = [
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
  { id: 'ytd', label: 'YTD' },
  { id: 'all', label: 'All' },
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
          size={11}
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
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <PageHeader
          title="Reports & Analytics"
          subtitle="Mobile Admin • Regional Metrics"
          action={
            <Button
              variant="outline"
              size="sm"
              fullWidth={false}
              leftIcon={<Lucide name="refresh-cw" size={12} color={colors.text} />}
              onPress={() => {
                void state.handleRefreshAll();
              }}
            >
              Refresh
            </Button>
          }
        />

        {/* Controls Card */}
        <AnimatedCard style={[styles.controlsCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          {/* Main Tab Switcher */}
          <View style={styles.tabBar}>
            {REPORT_TABS.map((tab) => {
              const isActive = state.reportType === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  style={[
                    styles.tabItem,
                    { borderColor: colors.border },
                    isActive && {
                      backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                      borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                    },
                  ]}
                  onPress={() => {
                    state.setReportType(tab.id);
                    state.setCurrentPage(1);
                  }}
                >
                  <Lucide
                    name={tab.icon}
                    size={12}
                    color={isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Period Mode Switcher (When not in statutory tab) */}
          {state.reportType !== 'statutory' && (
            <View style={styles.rangeRow}>
              {PERIOD_MODES.map((pm) => {
                const isActive = state.periodMode === pm.id;
                return (
                  <Pressable
                    key={pm.id}
                    style={[
                      styles.pill,
                      { borderColor: colors.border },
                      isActive && {
                        backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                        borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                      },
                    ]}
                    onPress={() => {
                      state.setPeriodMode(pm.id);
                      state.setCurrentPage(1);
                    }}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                      ]}
                    >
                      {pm.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Granular Sub-Filters */}
          {state.reportType !== 'statutory' && state.periodMode === 'monthly' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subFilterScroll}>
              {MONTHS.map((m, idx) => {
                const isActive = state.selectedMonth === idx;
                return (
                  <Pressable
                    key={m}
                    style={[
                      styles.miniPill,
                      { borderColor: colors.border },
                      isActive && {
                        backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                        borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                      },
                    ]}
                    onPress={() => {
                      state.setSelectedMonth(idx);
                      state.setCurrentPage(1);
                    }}
                  >
                    <Text
                      style={[
                        styles.miniPillText,
                        { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                      ]}
                    >
                      {m}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {state.reportType !== 'statutory' && state.periodMode === 'quarterly' && (
            <View style={styles.rangeRow}>
              {QUARTERS.map((qObj) => {
                const isActive = state.selectedQuarter === qObj.q;
                return (
                  <Pressable
                    key={qObj.q}
                    style={[
                      styles.pill,
                      { borderColor: colors.border },
                      isActive && {
                        backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                        borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                      },
                    ]}
                    onPress={() => {
                      state.setSelectedQuarter(qObj.q);
                      state.setCurrentPage(1);
                    }}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                      ]}
                    >
                      {qObj.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {state.reportType !== 'statutory' && state.periodMode === 'yearly' && (
            <View style={styles.rangeRow}>
              {YEARS.map((yr) => {
                const isActive = state.selectedYear === yr;
                return (
                  <Pressable
                    key={yr}
                    style={[
                      styles.pill,
                      { borderColor: colors.border },
                      isActive && {
                        backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                        borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                      },
                    ]}
                    onPress={() => {
                      state.setSelectedYear(yr);
                      state.setCurrentPage(1);
                    }}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                      ]}
                    >
                      {yr}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {state.reportType !== 'statutory' && state.periodMode === 'rolling' && (
            <View style={styles.rangeRow}>
              {TIME_RANGES.map((t) => {
                const isActive = state.timeRange === t.id;
                return (
                  <Pressable
                    key={t.id}
                    style={[
                      styles.pill,
                      { borderColor: colors.border },
                      isActive && {
                        backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                        borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                      },
                    ]}
                    onPress={() => {
                      state.setTimeRange(t.id);
                      state.setCurrentPage(1);
                    }}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                      ]}
                    >
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Search Bar */}
          <SearchBar
            value={state.searchQuery}
            onChangeText={(text) => {
              state.setSearchQuery(text);
              state.setCurrentPage(1);
            }}
            placeholder="Search records..."
          />
        </AnimatedCard>

        {/* KPI Mini Grid */}
        <View style={styles.statsGrid}>
          <AnimatedCard style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.statTag, { color: colors.textMuted }]}>Volume</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{state.stats.totalApps}</Text>
            <Text style={[styles.statSub, { color: COLORS.semantic.success }]}>
              {state.stats.approvedCount} Approved
            </Text>
          </AnimatedCard>

          <AnimatedCard style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.statTag, { color: COLORS.semantic.success }]}>Compliance</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{state.stats.approvalRate}%</Text>
            <Text style={[styles.statSub, { color: colors.textMuted }]}>SLA Rate</Text>
          </AnimatedCard>

          <AnimatedCard style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.statTag, { color: COLORS.semantic.warningText }]}>Revenue</Text>
            <Text style={[styles.statValue, { color: colors.text, fontSize: 16 }]}>
              {formatCurrency(state.stats.totalCollected)}
            </Text>
            <Text style={[styles.statSub, { color: colors.textMuted }]}>Collected</Text>
          </AnimatedCard>

          <AnimatedCard style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.statTag, { color: colors.textMuted }]}>CSAT</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{state.stats.avgCsat} ★</Text>
            <Text style={[styles.statSub, { color: colors.textMuted }]}>
              {state.stats.csatTotal} Feedbacks
            </Text>
          </AnimatedCard>
        </View>

        {/* Content Area */}
        {state.isLoading && (
          <View style={styles.loadingStack}>
            <SkeletonLoader variant="rectangular" width="100%" height={70} borderRadius={8} />
            <SkeletonLoader variant="rectangular" width="100%" height={70} borderRadius={8} />
            <SkeletonLoader variant="rectangular" width="100%" height={70} borderRadius={8} />
          </View>
        )}

        {!state.isLoading && state.activeItemCount === 0 && (
          <EmptyState
            icon="file-text"
            title="No Records"
            description="No items found matching your filters."
            actionLabel="Reset"
            onActionPress={() => {
              state.setSearchQuery('');
              state.setTimeRange('30d');
            }}
          />
        )}

        {/* Applications List */}
        {!state.isLoading && (state.reportType === 'applications' || state.reportType === 'compliance') &&
          state.paginatedApplications.map((app: ApplicationSummaryDto, index: number) => {
            const statusStyle = getStatusBadgeStyle(app.status);
            const applicant = app.filingUser?.name ?? app.filingUser?.company?.name ?? 'Applicant';
            return (
              <AnimatedCard
                key={app.id || index}
                delay={index * 25}
                style={[styles.itemCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
              >
                <View style={styles.cardTopRow}>
                  <Text style={[styles.itemRef, { color: colors.text }]}>
                    {app.applicationNumber || 'APP-2026-001'}
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: statusStyle.bg, borderColor: statusStyle.border },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                      {app.status || 'Submitted'}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.itemTitle, { color: colors.text }]}>{applicant}</Text>
                <Text style={[styles.itemSub, { color: colors.textMuted }]}>
                  {app.serviceName || 'Radio Service'} • {formatDate(app.createdAt)}
                </Text>
              </AnimatedCard>
            );
          })}

        {/* Financial List */}
        {!state.isLoading && state.reportType === 'financial' &&
          state.paginatedTransactions.map((tx: TenantTransactionDto, index: number) => {
            const statusStyle = getStatusBadgeStyle(tx.paymentStatus);
            return (
              <AnimatedCard
                key={tx.id || index}
                delay={index * 25}
                style={[styles.itemCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
              >
                <View style={styles.cardTopRow}>
                  <Text style={[styles.itemRef, { color: colors.text }]}>{tx.refNo}</Text>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: statusStyle.bg, borderColor: statusStyle.border },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                      {tx.paymentStatus || 'Pending'}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {tx.applicantName || 'Applicant'}
                </Text>
                <View style={styles.cardBottomRow}>
                  <Text style={[styles.itemSub, { color: colors.textMuted }]}>
                    {tx.serviceType || 'Permit Fee'} • {formatDate(tx.date)}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.text }]}>
                    {formatCurrency(tx.amount)}
                  </Text>
                </View>
              </AnimatedCard>
            );
          })}

        {/* CSAT List */}
        {!state.isLoading && state.reportType === 'satisfaction' &&
          state.paginatedFeedback.map((fb: FeedbackDto, index: number) => {
            const displayName = fb.isAnonymous ? 'Anonymous Client' : (fb.senderName || 'Client');
            return (
              <AnimatedCard
                key={fb.id || index}
                delay={index * 25}
                style={[styles.itemCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
              >
                <View style={styles.cardTopRow}>
                  <Text style={[styles.itemRef, { color: colors.text }]}>{displayName}</Text>
                  {renderRatingStars(fb.rating)}
                </View>

                <Text style={[styles.itemTitle, { color: colors.text }]}>{fb.subject}</Text>
                <Text style={[styles.itemSub, { color: colors.textMuted }]} numberOfLines={2}>
                  {fb.message}
                </Text>
                <Text style={[styles.itemSub, { color: colors.textMuted, marginTop: 4 }]}>
                  Submitted: {formatDate(fb.createdAt)}
                </Text>
              </AnimatedCard>
            );
          })}

        {/* Statutory Government Submissions List */}
        {!state.isLoading && state.reportType === 'statutory' &&
          state.statutoryReports.map((rep: StatutoryReportSummary, index: number) => {
            const meta = rep.metadata;
            return (
              <AnimatedCard
                key={meta.code}
                delay={index * 25}
                style={[styles.itemCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
              >
                <View style={styles.cardTopRow}>
                  <Text style={[styles.itemRef, { color: isDark ? colors.brand[500] : colors.brand.primary }]}>
                    {meta.code}
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: `${meta.badgeColor}18`, borderColor: `${meta.badgeColor}40` },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: meta.badgeColor }]}>
                      {meta.frequency}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.itemTitle, { color: colors.text }]}>{meta.title}</Text>
                <Text style={[styles.itemSub, { color: colors.textMuted }]}>{meta.agency}</Text>
                <Text style={[styles.itemSub, { color: COLORS.semantic.success, marginTop: 2 }]}>
                  {rep.recordCount} Records • {rep.complianceRate}% Compliance
                </Text>

                <View style={styles.cardBottomRow}>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth={false}
                    leftIcon={<Lucide name="eye" size={11} color={colors.text} />}
                    onPress={() => state.handleOpenStatutoryModal(meta)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth={false}
                    leftIcon={<Lucide name="download" size={11} color={colors.text} />}
                    onPress={() => state.handleDownloadStatutoryCsv(meta.code)}
                  >
                    CSV
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth={false}
                    leftIcon={<Lucide name="printer" size={11} color="#FFFFFF" />}
                    onPress={() => state.handlePrintStatutoryReport(meta)}
                  >
                    Print
                  </Button>
                </View>
              </AnimatedCard>
            );
          })}

        {/* Native Pagination Controls */}
        {state.reportType !== 'statutory' && state.totalPages > 1 && (
          <View style={styles.paginationRow}>
            <Button
              variant="outline"
              size="sm"
              isDisabled={state.currentPage === 1}
              onPress={() => state.setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Text style={[styles.pageInfoText, { color: colors.text }]}>
              {state.currentPage} / {state.totalPages}
            </Text>
            <Button
              variant="outline"
              size="sm"
              isDisabled={state.currentPage === state.totalPages}
              onPress={() => state.setCurrentPage((p) => Math.min(state.totalPages, p + 1))}
            >
              Next
            </Button>
          </View>
        )}
      </ScrollView>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: SPACING[16],
    gap: SPACING[12],
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[8],
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    padding: SPACING[10],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: 2,
  },
  statTag: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statSub: {
    fontSize: 11,
  },
  controlsCard: {
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[10],
  },
  tabBar: {
    flexDirection: 'row',
    gap: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '500',
  },
  subFilterScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  miniPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  miniPillText: {
    fontSize: 10,
    fontWeight: '500',
  },
  loadingStack: {
    gap: SPACING[8],
  },
  itemCard: {
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  itemRef: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 11,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  starsRow: {
    flexDirection: 'row',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING[16],
    marginTop: SPACING[8],
  },
  pageInfoText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
