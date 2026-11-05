import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
  TextInput,
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
  StatutoryPeriod,
} from '../hooks/useReportsState';
import { StatutoryReportPreviewModal } from '../components/StatutoryReportPreviewModal';
import { StatutoryReportSummary, StatutoryReportCode } from '../types/statutoryReports';

type FeatherIconName = React.ComponentProps<typeof Lucide>['name'];
type TenantReportCategory = 'all' | 'finance' | 'applications' | 'operations';

interface CategoryOption {
  id: TenantReportCategory;
  label: string;
  count: number;
  icon: FeatherIconName;
}

const TENANT_CATEGORIES: CategoryOption[] = [
  { id: 'all', label: 'All', count: 10, icon: 'book' },
  { id: 'finance', label: 'Finance', count: 4, icon: 'dollar-sign' },
  { id: 'applications', label: 'Ledgers', count: 4, icon: 'file-text' },
  { id: 'operations', label: 'Operations', count: 2, icon: 'activity' },
];

const STATUTORY_PERIODS: Array<{ id: StatutoryPeriod; label: string }> = [
  { id: 'Q1 2026', label: 'Q1 2026' },
  { id: 'Q2 2026', label: 'Q2 2026' },
  { id: 'Q3 2026', label: 'Q3 2026' },
  { id: 'Q4 2026', label: 'Q4 2026' },
  { id: 'Annual 2026', label: 'Annual' },
];

export function ReportsScreen() {
  const { colors, isDark } = useTheme();
  const state = useReportsState();

  const [tenantCategory, setTenantCategory] = useState<TenantReportCategory>('all');
  const [selectedReportCode, setSelectedReportCode] = useState<StatutoryReportCode>('NTC-MIS-OPS');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filtered official tenant reports
  const displayedReports = useMemo(() => {
    return state.statutoryReports.filter((rep) => {
      const code = rep.metadata.code;
      const q = state.searchQuery.trim().toLowerCase();

      let matchesCategory = true;
      if (tenantCategory === 'finance') {
        matchesCategory =
          code === 'NTC-COA-APP26-M' ||
          code === 'NTC-COA-APP26-D' ||
          code === 'NTC-BIR-DST-01' ||
          code === 'NTC-BTR-INC-01';
      } else if (tenantCategory === 'applications') {
        matchesCategory =
          code === 'NTC-APP-SUM-EVAL' ||
          code === 'NTC-APP-SUM-SVC' ||
          code === 'NTC-APP-SUM-ENT' ||
          code === 'NTC-APP-VOL-01';
      } else if (tenantCategory === 'operations') {
        matchesCategory =
          code === 'NTC-MIS-OPS' ||
          code === 'NTC-EXAM-MST-01';
      }

      if (!matchesCategory) return false;

      if (q.length > 0) {
        const titleMatch = rep.metadata.title.toLowerCase().includes(q);
        const codeMatch = rep.metadata.code.toLowerCase().includes(q);
        const agencyMatch = rep.metadata.agency.toLowerCase().includes(q);
        return titleMatch || codeMatch || agencyMatch;
      }

      return true;
    });
  }, [state.statutoryReports, tenantCategory, state.searchQuery]);

  const activeReport = useMemo(() => {
    const found = state.statutoryReports.find((r) => r.metadata.code === selectedReportCode);
    if (found !== undefined) return found.metadata;
    const fallback = state.statutoryReports[0];
    return fallback !== undefined ? fallback.metadata : null;
  }, [state.statutoryReports, selectedReportCode]);

  const formatCurrency = (amount?: number | null) => {
    const safeAmt = amount ?? 0;
    return `₱${safeAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const effectivePeriod = state.periodMode === 'custom'
    ? `${state.startDate} to ${state.endDate}`
    : state.selectedPeriod;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <PageHeader
          title="Official Tenant Reports"
          subtitle="Regional compliance, statutory ledgers, and official printouts."
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

        {/* Quick Generation Station */}
        <AnimatedCard
          style={[
            styles.quickStationCard,
            {
              backgroundColor: colors.cardBg,
              borderColor: isDark ? colors.brand[500] : colors.brand.primary,
            },
          ]}
        >
          <View style={styles.quickHeader}>
            <View style={[styles.quickIconBox, { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light }]}>
              <Lucide name="printer" size={16} color={isDark ? colors.brand[500] : colors.brand.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.quickTitle, { color: colors.text }]}>Direct Print Station</Text>
              <Text style={[styles.quickSub, { color: colors.textMuted }]}>
                Select report & period to print directly
              </Text>
            </View>
          </View>

          {/* Report Dropdown Trigger */}
          <Pressable
            style={[
              styles.dropdownBtn,
              {
                backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                borderColor: colors.border,
              },
            ]}
            onPress={() => setIsDropdownOpen((prev) => !prev)}
          >
            <View style={styles.dropdownBtnContent}>
              <Text style={[styles.dropdownCode, { color: isDark ? colors.brand[500] : colors.brand.primary }]}>
                {activeReport !== null ? activeReport.code : 'SELECT'}
              </Text>
              <Text style={[styles.dropdownTitle, { color: colors.text }]} numberOfLines={1}>
                {activeReport !== null ? activeReport.title : 'Select report'}
              </Text>
            </View>
            <Lucide name={isDropdownOpen ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textMuted} />
          </Pressable>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <View style={[styles.dropdownMenu, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <ScrollView style={{ maxHeight: 240 }}>
                {state.statutoryReports.map((item) => (
                  <Pressable
                    key={item.metadata.code}
                    style={[
                      styles.dropdownMenuItem,
                      { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] },
                      item.metadata.code === selectedReportCode && {
                        backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                      },
                    ]}
                    onPress={() => {
                      setSelectedReportCode(item.metadata.code);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownMenuItemCode,
                        { color: isDark ? colors.brand[500] : colors.brand.primary },
                      ]}
                    >
                      {item.metadata.code}
                    </Text>
                    <Text style={[styles.dropdownMenuItemTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.metadata.title}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Period selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodScroll}>
            {STATUTORY_PERIODS.map((p) => {
              const isActive = state.periodMode !== 'custom' && state.selectedPeriod === p.id;
              return (
                <Pressable
                  key={p.id}
                  style={[
                    styles.periodPill,
                    { borderColor: colors.border },
                    isActive && {
                      backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                      borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                    },
                  ]}
                  onPress={() => {
                    state.setPeriodMode('quarterly');
                    state.setSelectedPeriod(p.id);
                  }}
                >
                  <Text
                    style={[
                      styles.periodPillText,
                      { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                    ]}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              style={[
                styles.periodPill,
                { borderColor: colors.border },
                state.periodMode === 'custom' && {
                  backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                  borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                },
              ]}
              onPress={() => state.setPeriodMode('custom')}
            >
              <Text
                style={[
                  styles.periodPillText,
                  { color: state.periodMode === 'custom' ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                ]}
              >
                Custom
              </Text>
            </Pressable>
          </ScrollView>

          {/* Custom Date Inputs */}
          {state.periodMode === 'custom' && (
            <View style={styles.customDateRow}>
              <TextInput
                style={[styles.customInput, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: colors.border, color: colors.text }]}
                value={state.startDate}
                onChangeText={state.setStartDate}
                placeholder="Start Date"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={{ color: colors.textMuted }}>to</Text>
              <TextInput
                style={[styles.customInput, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: colors.border, color: colors.text }]}
                value={state.endDate}
                onChangeText={state.setEndDate}
                placeholder="End Date"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          )}

          {/* Action buttons */}
          {activeReport !== null && (
            <View style={styles.quickActionsRow}>
              <Button
                variant="primary"
                size="sm"
                fullWidth={false}
                leftIcon={<Lucide name="printer" size={14} color="#FFFFFF" />}
                onPress={() => state.handlePrintStatutoryReport(activeReport)}
              >
                Print / PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth={false}
                leftIcon={<Lucide name="eye" size={14} color={colors.text} />}
                onPress={() => state.handleOpenStatutoryModal(activeReport)}
              >
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth={false}
                leftIcon={<Lucide name="download" size={14} color={colors.text} />}
                onPress={() => state.handleDownloadStatutoryCsv(activeReport.code)}
              >
                CSV
              </Button>
            </View>
          )}
        </AnimatedCard>

        {/* Compact Metrics Strip */}
        <View style={[styles.metricsStrip, { backgroundColor: isDark ? colors.neutral[900] : '#F0FDF4', borderColor: isDark ? colors.neutral[800] : '#DCFCE7' }]}>
          <Text style={[styles.metricStripText, { color: colors.text }]}>
            {state.tenantDisplayName} • {state.stats.totalApps} filings • {state.stats.approvalRate}% SLA • {formatCurrency(state.stats.totalCollected)}
          </Text>
        </View>

        {/* Category Pills & Search */}
        <View style={styles.categoryRow}>
          {TENANT_CATEGORIES.map((cat) => {
            const isActive = tenantCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                style={[
                  styles.catBtn,
                  { borderColor: colors.border },
                  isActive && {
                    backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                    borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                  },
                ]}
                onPress={() => setTenantCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.catBtnText,
                    { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                    isActive && { fontWeight: TYPOGRAPHY.weights.bold },
                  ]}
                >
                  {cat.label} ({cat.count})
                </Text>
              </Pressable>
            );
          })}
        </View>

        <SearchBar
          value={state.searchQuery}
          onChangeText={state.setSearchQuery}
          placeholder="Search by code or title..."
        />

        {/* Loading / Empty States */}
        {state.isLoading && (
          <View style={styles.loadingStack}>
            <SkeletonLoader variant="rectangular" width="100%" height={120} borderRadius={8} />
            <SkeletonLoader variant="rectangular" width="100%" height={120} borderRadius={8} />
          </View>
        )}

        {!state.isLoading && displayedReports.length === 0 && (
          <EmptyState
            icon="file-text"
            title="No Reports Found"
            description="No reports match your filters."
            actionLabel="Reset Filters"
            onActionPress={() => {
              state.setSearchQuery('');
              setTenantCategory('all');
            }}
          />
        )}

        {/* Official Reports List */}
        {!state.isLoading &&
          displayedReports.map((rep: StatutoryReportSummary, index: number) => {
            const meta = rep.metadata;
            return (
              <AnimatedCard
                key={meta.code}
                delay={index * 20}
                style={[styles.reportCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.agencyBadge, { backgroundColor: `${meta.badgeColor}15`, borderColor: `${meta.badgeColor}35` }]}>
                    <Text style={[styles.agencyBadgeText, { color: meta.badgeColor }]}>{meta.agency}</Text>
                  </View>
                  <Text style={[styles.freqText, { color: colors.textMuted }]}>{meta.frequency}</Text>
                </View>

                <Text style={[styles.cardCode, { color: isDark ? colors.brand[500] : colors.brand.primary }]}>
                  {meta.code}
                </Text>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{meta.title}</Text>
                <Text style={[styles.cardDesc, { color: colors.textMuted }]} numberOfLines={2}>
                  {meta.description}
                </Text>

                <View style={styles.cardStatsRow}>
                  <Text style={[styles.cardStatText, { color: colors.textMuted }]}>
                    Records: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{rep.recordCount}</Text>
                  </Text>
                  <Text style={[styles.cardStatText, { color: colors.textMuted }]}>
                    Compliance: <Text style={{ color: COLORS.semantic.success, fontWeight: 'bold' }}>{rep.complianceRate}%</Text>
                  </Text>
                  {rep.totalAmount !== undefined && (
                    <Text style={[styles.cardStatText, { color: colors.textMuted }]}>
                      ₱{rep.totalAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </Text>
                  )}
                </View>

                <View style={[styles.cardActions, { borderTopColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth={false}
                    leftIcon={<Lucide name="eye" size={12} color={colors.text} />}
                    onPress={() => state.handleOpenStatutoryModal(meta)}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth={false}
                    leftIcon={<Lucide name="download" size={12} color={colors.text} />}
                    onPress={() => state.handleDownloadStatutoryCsv(meta.code)}
                  >
                    CSV
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth={false}
                    leftIcon={<Lucide name="printer" size={12} color="#FFFFFF" />}
                    onPress={() => state.handlePrintStatutoryReport(meta)}
                  >
                    Print
                  </Button>
                </View>
              </AnimatedCard>
            );
          })}
      </ScrollView>

      <StatutoryReportPreviewModal
        visible={state.statutoryModal.visible}
        report={state.statutoryModal.report}
        tenantName={state.tenantDisplayName}
        period={effectivePeriod}
        startDate={state.startDate}
        endDate={state.endDate}
        onDateRangeChange={(s, e) => {
          state.setStartDate(s);
          state.setEndDate(e);
        }}
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
    paddingBottom: 90,
    gap: SPACING[12],
  },
  quickStationCard: {
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1.5,
    gap: SPACING[10],
  },
  quickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
  },
  quickIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  quickSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[10],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  dropdownBtnContent: {
    flex: 1,
    marginRight: 8,
  },
  dropdownCode: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  dropdownTitle: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  dropdownMenu: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownMenuItem: {
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
  },
  dropdownMenuItemCode: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  dropdownMenuItemTitle: {
    fontSize: 11,
  },
  periodScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  periodPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
  },
  periodPillText: {
    fontSize: 11,
  },
  customDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    fontSize: 11,
  },
  quickActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    paddingTop: 6,
  },
  metricsStrip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  metricStripText: {
    fontSize: 11,
    lineHeight: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 6,
  },
  catBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  catBtnText: {
    fontSize: 11,
  },
  loadingStack: {
    gap: 10,
  },
  reportCard: {
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  agencyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  agencyBadgeText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
  },
  freqText: {
    fontSize: 10,
  },
  cardCode: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: 18,
  },
  cardDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  cardStatsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  cardStatText: {
    fontSize: 10,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
  },
});
