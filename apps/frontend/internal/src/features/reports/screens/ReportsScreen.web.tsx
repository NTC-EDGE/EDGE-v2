import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  useWindowDimensions,
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
  DatePickerInput,
} from '@edge/ui';
import {
  useReportsState,
  StatutoryPeriod,
} from '../hooks/useReportsState';
import { StatutoryReportPreviewModal } from '../components/StatutoryReportPreviewModal';
import { StatutoryReportSummary, StatutoryReportCode, StatutoryReportMetadata } from '../types/statutoryReports';

type FeatherIconName = React.ComponentProps<typeof Lucide>['name'];
type TenantReportCategory = 'all' | 'finance' | 'applications' | 'operations';

interface CategoryOption {
  id: TenantReportCategory;
  label: string;
  count: number;
  icon: FeatherIconName;
}

const TENANT_CATEGORIES: CategoryOption[] = [
  { id: 'all', label: 'All Official Reports', count: 10, icon: 'book' },
  { id: 'finance', label: 'Finance & Treasury (COA / BIR / BTr)', count: 4, icon: 'dollar-sign' },
  { id: 'applications', label: 'Application Ledgers (ARTA / NTC)', count: 4, icon: 'file-text' },
  { id: 'operations', label: 'Operations & Exams (MIS)', count: 2, icon: 'activity' },
];

const STATUTORY_PERIODS: Array<{ id: StatutoryPeriod; label: string }> = [
  { id: 'Q1 2026', label: '1st Quarter 2026' },
  { id: 'Q2 2026', label: '2nd Quarter 2026' },
  { id: 'Q3 2026', label: '3rd Quarter 2026' },
  { id: 'Q4 2026', label: '4th Quarter 2026' },
  { id: 'Annual 2026', label: 'Annual 2026' },
];

export function ReportsScreen() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const state = useReportsState();

  // Selected Category Filter for the 10 Official Tenant Reports
  const [tenantCategory, setTenantCategory] = useState<TenantReportCategory>('all');

  // Filtered list of the 10 official tenant reports
  const displayedReports = useMemo(() => {
    return state.statutoryReports.filter((rep) => {
      const code = rep.metadata.code;
      const q = state.searchQuery.trim().toLowerCase();

      // Category matching
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

      // Keyword search matching
      if (q.length > 0) {
        const titleMatch = rep.metadata.title.toLowerCase().includes(q);
        const codeMatch = rep.metadata.code.toLowerCase().includes(q);
        const agencyMatch = rep.metadata.agency.toLowerCase().includes(q);
        const descMatch = rep.metadata.description.toLowerCase().includes(q);
        return titleMatch || codeMatch || agencyMatch || descMatch;
      }

      return true;
    });
  }, [state.statutoryReports, tenantCategory, state.searchQuery]);

  const formatCurrency = (amount?: number | null) => {
    const safeAmt = amount ?? 0;
    return `₱${safeAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const effectivePeriod = state.periodMode === 'custom'
    ? `${state.startDate} to ${state.endDate}`
    : state.selectedPeriod;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.container,
          { padding: isMobile ? SPACING[12] : SPACING[20] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Page Header ── */}
        <PageHeader
          title="Regional Compliance & Statutory Reports"
          subtitle="Official regulatory, accounting, tax remittance, and examination reports for regional office filing."
          action={
            <View style={styles.headerActions}>
              <Button
                variant="primary"
                size="sm"
                fullWidth={false}
                leftIcon={<Lucide name="refresh-cw" size={14} color="#FFFFFF" />}
                onPress={() => {
                  void state.handleRefreshAll();
                }}
              >
                Refresh Data
              </Button>
            </View>
          }
        />

        {/* ── Compact Regional Context & Live Metrics Strip ── */}
        <View
          style={[
            styles.metricsStrip,
            {
              backgroundColor: isDark ? colors.neutral[900] : '#F0FDF4',
              borderColor: isDark ? colors.neutral[800] : '#DCFCE7',
            },
          ]}
        >
          <View style={styles.metricItem}>
            <Lucide name="map-pin" size={14} color={isDark ? colors.brand[500] : colors.brand.primary} />
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Regional Tenant:</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>{state.tenantDisplayName}</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Lucide name="clock" size={14} color={colors.textMuted} />
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Active Range:</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>{effectivePeriod}</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Lucide name="file-text" size={14} color={COLORS.semantic.info} />
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Applications:</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>{state.stats.totalApps} records</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Lucide name="check-circle" size={14} color={COLORS.semantic.success} />
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>SLA Compliance:</Text>
            <Text style={[styles.metricValue, { color: COLORS.semantic.success }]}>
              {state.stats.approvalRate}%
            </Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Lucide name="dollar-sign" size={14} color={COLORS.semantic.warning} />
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Total Collections:</Text>
            <Text style={[styles.metricValue, { color: COLORS.semantic.warning }]}>
              {formatCurrency(state.stats.totalCollected)}
            </Text>
          </View>
        </View>

        {/* ── Unified Filing Period, Category Filter Tabs & Search Bar ── */}
        <AnimatedCard
          style={[
            styles.categoryNavCard,
            { backgroundColor: colors.cardBg, borderColor: colors.border },
          ]}
        >
          {/* Row 1: Filing Period / Date Range Selector */}
          <View style={[styles.periodControlsWrapper, { paddingBottom: SPACING[12], marginBottom: SPACING[12], borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: SPACING[8] }}>
              <Text style={[styles.controlSectionLabel, { color: colors.textMuted, marginBottom: 0 }]}>
                FILING PERIOD / DATE RANGE:
              </Text>
              <View style={styles.periodPillsRow}>
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
                        Platform.select({ web: { cursor: 'pointer' } }),
                      ]}
                      onPress={() => {
                        state.setSelectedPeriod(p.id);
                      }}
                    >
                      <Text
                        style={[
                          styles.periodPillText,
                          {
                            color: isActive
                              ? (isDark ? colors.brand[500] : colors.brand.primary)
                              : colors.textMuted,
                            fontWeight: isActive
                              ? TYPOGRAPHY.weights.bold
                              : TYPOGRAPHY.weights.regular,
                          },
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
                    Platform.select({ web: { cursor: 'pointer' } }),
                  ]}
                  onPress={() => {
                    state.setPeriodMode('custom');
                  }}
                >
                  <Lucide
                    name="calendar"
                    size={12}
                    color={
                      state.periodMode === 'custom'
                        ? (isDark ? colors.brand[500] : colors.brand.primary)
                        : colors.textMuted
                    }
                  />
                  <Text
                    style={[
                      styles.periodPillText,
                      {
                        color: state.periodMode === 'custom'
                          ? (isDark ? colors.brand[500] : colors.brand.primary)
                          : colors.textMuted,
                        fontWeight: state.periodMode === 'custom'
                          ? TYPOGRAPHY.weights.bold
                          : TYPOGRAPHY.weights.regular,
                      },
                    ]}
                  >
                    Custom Dates
                  </Text>
                </Pressable>
              </View>
            </View>

            {state.periodMode === 'custom' && (
              <View style={styles.customDateInputsRow}>
                <View style={styles.dateInputGroup}>
                  <Text style={[styles.dateInputLabel, { color: colors.textMuted }]}>Start:</Text>
                  <View style={{ minWidth: 165 }}>
                    <DatePickerInput
                      value={state.startDate}
                      onChangeText={state.setStartDate}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                </View>
                <View style={styles.dateInputGroup}>
                  <Text style={[styles.dateInputLabel, { color: colors.textMuted }]}>End:</Text>
                  <View style={{ minWidth: 165 }}>
                    <DatePickerInput
                      value={state.endDate}
                      onChangeText={state.setEndDate}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Row 2: Field Office Checkbox Filter (For Monitoring Purposes Only) */}
          {state.fieldOfficeOptions.length > 0 && (
            <View
              style={{
                paddingBottom: SPACING[12],
                marginBottom: SPACING[12],
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: SPACING[8],
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING[8] }}>
                <Lucide name="map-pin" size={13} color={isDark ? colors.brand[400] : colors.brand.primary} />
                <Text style={[styles.controlSectionLabel, { color: colors.textMuted, marginBottom: 0 }]}>
                  FIELD OFFICE FILTER (FOR MONITORING ONLY):
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING[8], flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                {/* All Field Offices Checkbox */}
                <Pressable
                  style={[
                    styles.periodPill,
                    { borderColor: colors.border },
                    state.isAllFieldOfficesSelected && {
                      backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                      borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                    },
                    Platform.select({ web: { cursor: 'pointer' } }),
                  ]}
                  onPress={state.selectAllFieldOffices}
                >
                  <View
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: 3,
                      borderWidth: 1.5,
                      borderColor: state.isAllFieldOfficesSelected
                        ? (isDark ? colors.brand[400] : colors.brand.primary)
                        : colors.textMuted,
                      backgroundColor: state.isAllFieldOfficesSelected
                        ? (isDark ? colors.brand[500] : colors.brand.primary)
                        : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {state.isAllFieldOfficesSelected && (
                      <Lucide name="check" size={10} color="#FFFFFF" />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.periodPillText,
                      {
                        color: state.isAllFieldOfficesSelected
                          ? (isDark ? colors.brand[500] : colors.brand.primary)
                          : colors.textMuted,
                        fontWeight: state.isAllFieldOfficesSelected
                          ? TYPOGRAPHY.weights.bold
                          : TYPOGRAPHY.weights.regular,
                      },
                    ]}
                  >
                    All Field Offices
                  </Text>
                </Pressable>

                {/* Individual Field Office Checkboxes */}
                {state.fieldOfficeOptions.map((fo) => {
                  const isChecked = state.selectedFieldOffices.some(
                    (s) => s.toLowerCase() === fo.name.toLowerCase()
                  );

                  return (
                    <Pressable
                      key={fo.id}
                      style={[
                        styles.periodPill,
                        { borderColor: colors.border },
                        isChecked && {
                          backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                          borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                        },
                        Platform.select({ web: { cursor: 'pointer' } }),
                      ]}
                      onPress={() => state.toggleFieldOffice(fo.name)}
                    >
                      <View
                        style={{
                          width: 15,
                          height: 15,
                          borderRadius: 3,
                          borderWidth: 1.5,
                          borderColor: isChecked
                            ? (isDark ? colors.brand[400] : colors.brand.primary)
                            : colors.textMuted,
                          backgroundColor: isChecked
                            ? (isDark ? colors.brand[500] : colors.brand.primary)
                            : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isChecked && <Lucide name="check" size={10} color="#FFFFFF" />}
                      </View>
                      <Text
                        style={[
                          styles.periodPillText,
                          {
                            color: isChecked
                              ? (isDark ? colors.brand[500] : colors.brand.primary)
                              : colors.text,
                            fontWeight: isChecked
                              ? TYPOGRAPHY.weights.bold
                              : TYPOGRAPHY.weights.medium,
                          },
                        ]}
                      >
                        {fo.name}
                      </Text>
                      <View
                        style={[
                          styles.categoryCountBadge,
                          {
                            backgroundColor: isChecked
                              ? (isDark ? colors.brand[500] : colors.brand.primary)
                              : (isDark ? colors.neutral[800] : colors.neutral[200]),
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryCountText,
                            { color: isChecked ? '#FFFFFF' : colors.textMuted },
                          ]}
                        >
                          {fo.applicationCount}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.categoryHeaderRow}>
            {/* Category Filter Pills */}
            <View style={styles.categoryPillsContainer}>
              {TENANT_CATEGORIES.map((cat) => {
                const isActive = tenantCategory === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryTabBtn,
                      { borderColor: colors.border },
                      isActive && {
                        backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                        borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                      },
                      Platform.select({ web: { cursor: 'pointer' } }),
                    ]}
                    onPress={() => {
                      setTenantCategory(cat.id);
                    }}
                  >
                    <Lucide
                      name={cat.icon}
                      size={14}
                      color={
                        isActive
                          ? (isDark ? colors.brand[500] : colors.brand.primary)
                          : colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.categoryTabLabel,
                        {
                          color: isActive
                            ? (isDark ? colors.brand[500] : colors.brand.primary)
                            : colors.textMuted,
                          fontWeight: isActive
                            ? TYPOGRAPHY.weights.bold
                            : TYPOGRAPHY.weights.semibold,
                        },
                      ]}
                    >
                      {cat.label}
                    </Text>
                    <View
                      style={[
                        styles.categoryCountBadge,
                        {
                          backgroundColor: isActive
                            ? (isDark ? colors.brand[500] : colors.brand.primary)
                            : (isDark ? colors.neutral[800] : colors.neutral[200]),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryCountText,
                          { color: isActive ? '#FFFFFF' : colors.textMuted },
                        ]}
                      >
                        {cat.count}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Keyword Search Input */}
            <View style={styles.searchBoxWrapper}>
              <SearchBar
                value={state.searchQuery}
                onChangeText={state.setSearchQuery}
                placeholder="Search report by code (e.g. APP26, DST), title, agency..."
              />
            </View>
          </View>
        </AnimatedCard>

        {/* ── Loading Skeleton ── */}
        {state.isLoading && (
          <View style={styles.loadingGrid}>
            <SkeletonLoader variant="rectangular" width="49%" height={220} borderRadius={8} />
            <SkeletonLoader variant="rectangular" width="49%" height={220} borderRadius={8} />
            <SkeletonLoader variant="rectangular" width="49%" height={220} borderRadius={8} />
            <SkeletonLoader variant="rectangular" width="49%" height={220} borderRadius={8} />
          </View>
        )}

        {/* ── Empty State ── */}
        {!state.isLoading && displayedReports.length === 0 && (
          <EmptyState
            icon="file-text"
            title="No Matching Reports Found"
            description="No statutory reports match your active category filter and search keyword."
            actionLabel="Reset Search & Filters"
            onActionPress={() => {
              state.setSearchQuery('');
              setTenantCategory('all');
            }}
          />
        )}

        {/* ── Official Reports Directory Grid ── */}
        {!state.isLoading && displayedReports.length > 0 && (
          <View style={styles.reportsGrid}>
            {displayedReports.map((rep: StatutoryReportSummary, index: number) => {
              const meta = rep.metadata;

              return (
                <AnimatedCard
                  key={meta.code}
                  delay={index * 25}
                  style={[
                    styles.reportCard,
                    {
                      minWidth: isMobile ? '100%' : 360,
                      backgroundColor: colors.cardBg,
                      borderColor: colors.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  {/* Card Header: Agency Badge + Frequency Pill */}
                  <View style={styles.cardHeaderRow}>
                    <View
                      style={[
                        styles.agencyBadge,
                        {
                          backgroundColor: `${meta.badgeColor}15`,
                          borderColor: `${meta.badgeColor}35`,
                        },
                      ]}
                    >
                      <Text style={[styles.agencyBadgeText, { color: meta.badgeColor }]}>
                        {meta.agency}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.frequencyPill,
                        { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] },
                      ]}
                    >
                      <Text style={[styles.frequencyPillText, { color: colors.textMuted }]}>
                        {meta.frequency}
                      </Text>
                    </View>
                  </View>

                  {/* Card Title & Code */}
                  <View style={styles.cardBody}>
                    <Text
                      style={[
                        styles.cardCode,
                        { color: isDark ? colors.brand[500] : colors.brand.primary },
                      ]}
                    >
                      {meta.code}
                    </Text>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{meta.title}</Text>
                    <Text style={[styles.cardSubTitle, { color: colors.textMuted }]}>
                      {meta.description}
                    </Text>
                  </View>

                  {/* Legal Authority Footnote */}
                  <View
                    style={[
                      styles.legalFootnoteRow,
                      { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] },
                    ]}
                  >
                    <Lucide name="shield" size={12} color={colors.textMuted} />
                    <Text
                      style={[styles.legalFootnoteText, { color: colors.textMuted }]}
                      numberOfLines={1}
                    >
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
                      <Text style={[styles.chipVal, { color: COLORS.semantic.success }]}>
                        {rep.complianceRate}%
                      </Text>
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

                  {/* Single Focused Action Button (No Repetitive Print/CSV/Preview Clutter) */}
                  <View
                    style={[
                      styles.cardActionsRow,
                      { borderTopColor: isDark ? colors.neutral[800] : colors.neutral[100] },
                    ]}
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth={false}
                      leftIcon={<Lucide name="file-text" size={13} color="#FFFFFF" />}
                      onPress={() => state.handleOpenStatutoryModal(meta)}
                    >
                      Open Report
                    </Button>
                  </View>
                </AnimatedCard>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── Statutory Report Full Preview & Official Print Modal ── */}
      <StatutoryReportPreviewModal
        visible={state.statutoryModal.visible}
        report={state.statutoryModal.report}
        tenantName={state.tenantDisplayName}
        tenantId={state.activeTenantId}
        period={effectivePeriod}
        startDate={state.startDate}
        endDate={state.endDate}
        onDateRangeChange={(s, e) => {
          state.setStartDate(s);
          state.setEndDate(e);
        }}
        fieldOfficeOptions={state.fieldOfficeOptions}
        selectedFieldOffices={state.selectedFieldOffices}
        isAllFieldOfficesSelected={state.isAllFieldOfficesSelected}
        hasBackendFieldOfficeSupport={state.hasBackendFieldOfficeSupport}
        onToggleFieldOffice={state.toggleFieldOffice}
        onSelectAllFieldOffices={state.selectAllFieldOffices}
        fieldOfficesParam={state.fieldOfficesQueryParam}
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
    width: '100%',
    maxWidth: 1440,
    alignSelf: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    flexShrink: 0,
  },

  // ── Executive Quick Print Station Styles ──
  quickPrintCard: {
    padding: SPACING[20],
    borderRadius: RADIUS.card,
    borderWidth: 1.5,
    gap: SPACING[16],
    ...SHADOWS.card,
  },
  quickPrintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  quickPrintHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flex: 1,
    minWidth: 280,
  },
  quickPrintIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPrintTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.heading,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  quickPrintSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    marginTop: 2,
  },
  quickPrintTopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    flexWrap: 'wrap',
  },
  quickControlsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[20],
    paddingTop: SPACING[16],
    borderTopWidth: 1,
    flexWrap: 'wrap',
  },
  dropdownWrapper: {
    flex: 1.2,
    minWidth: 320,
    gap: SPACING[6],
    position: 'relative',
    zIndex: 50,
  },
  controlSectionLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.overline,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[10],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    flex: 1,
    marginRight: SPACING[8],
  },
  codeBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  codeBadgeSmallText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  dropdownSelectedText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
  },
  dropdownList: {
    position: 'absolute',
    top: 68,
    left: 0,
    right: 0,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    ...SHADOWS.card,
    zIndex: 100,
    elevation: 10,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[10],
    borderBottomWidth: 1,
    gap: SPACING[8],
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
    flex: 1,
  },
  agencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dropdownItemCode: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  dropdownItemTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    maxWidth: 240,
  },
  dropdownItemBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dropdownItemBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  periodControlsWrapper: {
    flex: 1.5,
    minWidth: 0,
    width: '100%',
    gap: SPACING[6],
  },
  periodPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
    flexWrap: 'wrap',
  },
  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING[10],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  periodPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  customDateInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    marginTop: SPACING[8],
  },
  dateInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateInputLabel: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  dateTextInput: {
    paddingHorizontal: SPACING[8],
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    fontSize: 12,
    width: 110,
  },

  // ── Metrics Strip Styles ──
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[10],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[16],
    flexWrap: 'wrap',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  metricValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  metricDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },

  // ── Category Filter Card ──
  categoryNavCard: {
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    ...SHADOWS.card,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  categoryPillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    flexWrap: 'wrap',
    flex: 1,
    minWidth: 0,
  },
  categoryTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  categoryTabLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  categoryCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryCountText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  searchBoxWrapper: {
    width: 320,
    maxWidth: '100%',
  },

  // ── Reports Directory Grid ──
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[16],
  },
  reportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[16],
  },
  reportCard: {
    flex: 1,
    minWidth: 380,
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    gap: SPACING[12],
    ...SHADOWS.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  agencyBadge: {
    paddingHorizontal: SPACING[8],
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  agencyBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
  },
  frequencyPill: {
    paddingHorizontal: SPACING[8],
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  frequencyPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  cardBody: {
    gap: 4,
  },
  cardCode: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: 20,
  },
  cardSubTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  legalFootnoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING[8],
    paddingVertical: 4,
    borderRadius: 4,
  },
  legalFootnoteText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    flex: 1,
  },
  metricsChipRow: {
    flexDirection: 'row',
    gap: SPACING[12],
    alignItems: 'center',
  },
  chipItem: {
    gap: 1,
  },
  chipLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipVal: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING[8],
    paddingTop: SPACING[12],
    borderTopWidth: 1,
  },
});
