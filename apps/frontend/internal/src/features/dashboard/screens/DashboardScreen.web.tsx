import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { AnimatedCard, Icon as Lucide, SPACING, TYPOGRAPHY, useTheme } from '@edge/ui';
import { useRole } from '../../shell/context/RoleContext';

// ─── Types ───────────────────────────────────────────────────────────────────

type TimeRange = '7d' | '30d' | '1y';

interface KpiCard {
  label: string;
  value: string;
  sub: string;
  icon: 'file-text' | 'check-circle' | 'alert-triangle' | 'layers';
  trend: string;
  trendUp: boolean;
  accentColor: string;
}

interface ActivityItem {
  id: string;
  title: string;
  meta: string;
  dot: string;
}

interface QueueRow {
  id: string;
  applicant: string;
  type: string;
  submitted: string;
  status: 'Pending' | 'In Review' | 'Approved' | 'Rejected';
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_KPI: readonly KpiCard[] = [
  {
    label: 'Pending Evaluation',
    value: '124',
    sub: '+8 today',
    icon: 'file-text',
    trend: '+8%',
    trendUp: false,
    accentColor: '#F59E0B',
  },
  {
    label: 'Approved Licenses',
    value: '852',
    sub: '+14 this week',
    icon: 'check-circle',
    trend: '+14%',
    trendUp: true,
    accentColor: '#10B981',
  },
  {
    label: 'Rejected / Non-Compliant',
    value: '42',
    sub: '-3 vs last week',
    icon: 'alert-triangle',
    trend: '-3%',
    trendUp: false,
    accentColor: '#EF4444',
  },
  {
    label: 'Total Completed',
    value: '710',
    sub: '+18 this month',
    icon: 'layers',
    trend: '+18%',
    trendUp: true,
    accentColor: '#3B82F6',
  },
];

const MOCK_CHART_BARS: readonly { h: number; color: string; label: string }[] = [
  { h: 48, color: '#3B82F6', label: 'Mon' },
  { h: 80, color: '#10B981', label: 'Tue' },
  { h: 60, color: '#3B82F6', label: 'Wed' },
  { h: 100, color: '#10B981', label: 'Thu' },
  { h: 72, color: '#3B82F6', label: 'Fri' },
  { h: 44, color: '#F59E0B', label: 'Sat' },
  { h: 90, color: '#10B981', label: 'Sun' },
];

const MOCK_ACTIVITY: readonly ActivityItem[] = [
  { id: '1', title: 'APP-2026-0521 Approved', meta: '10:24 AM · Juan Dela Cruz', dot: '#10B981' },
  { id: '2', title: 'New Accreditation Submitted', meta: '09:45 AM · RuralNet ISP', dot: '#F59E0B' },
  { id: '3', title: 'Compliance Policy Updated', meta: '08:15 AM · System Admin', dot: '#3B82F6' },
  { id: '4', title: 'APP-2026-0519 Rejected — missing docs', meta: '07:52 AM · Maria Santos', dot: '#EF4444' },
  { id: '5', title: '3.5 GHz Spectrum Band Assigned', meta: 'Yesterday · NTC Engineering', dot: '#8B5CF6' },
];

const MOCK_QUEUE: readonly QueueRow[] = [
  { id: 'APP-2026-0528', applicant: 'TelePinas Corp',      type: 'ISP License',     submitted: 'Jul 30, 2026', status: 'Pending' },
  { id: 'APP-2026-0527', applicant: 'BlueSky Broadband',   type: 'Frequency Alloc', submitted: 'Jul 29, 2026', status: 'In Review' },
  { id: 'APP-2026-0526', applicant: 'SouthNet Telecom',    type: 'Accreditation',   submitted: 'Jul 28, 2026', status: 'Pending' },
  { id: 'APP-2026-0525', applicant: 'AsiaCom Networks',    type: 'ISP License',     submitted: 'Jul 27, 2026', status: 'In Review' },
  { id: 'APP-2026-0524', applicant: 'MaxLink Philippines', type: 'VSAT Permit',     submitted: 'Jul 26, 2026', status: 'Approved' },
];

const STATUS_COLORS: Record<QueueRow['status'], { text: string; bg: string }> = {
  Pending:   { text: '#92400E', bg: '#FEF3C7' },
  'In Review': { text: '#1E40AF', bg: '#DBEAFE' },
  Approved:  { text: '#065F46', bg: '#D1FAE5' },
  Rejected:  { text: '#991B1B', bg: '#FEE2E2' },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function DashboardScreen(): React.ReactElement {
  const { currentRole } = useRole();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const canvasBg = isDark ? colors.neutral[900] : colors.neutral[50];
  const cardBg = isDark ? colors.neutral[800] : '#FFFFFF';
  const borderColor = isDark ? colors.neutral[700] : colors.neutral[200];
  const textColor = isDark ? colors.neutral[100] : colors.neutral[900];
  const mutedColor = isDark ? colors.neutral[400] : colors.neutral[500];
  const tableHdrBg = isDark ? colors.neutral[900] : colors.neutral[50];
  const tableRowHover = isDark ? colors.neutral[700] : colors.neutral[50];

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: '2-digit', year: 'numeric',
  });

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: canvasBg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Page Title Row ─────────────────────────────────────────────── */}
      <View style={styles.titleRow}>
        <View>
          <Text style={[styles.pageTitle, { color: textColor }]}>
            Dashboard
          </Text>
          <Text style={[styles.pageSub, { color: mutedColor }]}>
            Welcome back, {currentRole} — {today}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: isDark ? '#1A2E4A' : '#EFF6FF', borderColor: '#BFDBFE' }]}>
          <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.statusText, { color: isDark ? '#60A5FA' : '#1D4ED8' }]}>
            All Systems Operational
          </Text>
        </View>
      </View>

      {/* ── KPI Strip ──────────────────────────────────────────────────── */}
      <View style={[styles.kpiRow, { flexDirection: isDesktop ? 'row' : 'row', flexWrap: 'wrap' }]}>
        {MOCK_KPI.map((kpi) => (
          <View
            key={kpi.label}
            style={[
              styles.kpiCard,
              { backgroundColor: cardBg, borderColor, borderLeftColor: kpi.accentColor },
            ]}
          >
            <View style={styles.kpiTop}>
              <View style={[styles.kpiIconBox, { backgroundColor: `${kpi.accentColor}18` }]}>
                <Lucide name={kpi.icon} size={14} color={kpi.accentColor} />
              </View>
              <Text style={[styles.kpiTrend, { color: kpi.trendUp ? '#10B981' : '#F59E0B' }]}>
                {kpi.trend}
              </Text>
            </View>
            <Text style={[styles.kpiValue, { color: textColor }]}>{kpi.value}</Text>
            <Text style={[styles.kpiLabel, { color: mutedColor }]}>{kpi.label}</Text>
            <Text style={[styles.kpiSub, { color: mutedColor }]}>{kpi.sub}</Text>
          </View>
        ))}
      </View>

      {/* ── Middle Row: Chart + Activity ────────────────────────────────── */}
      <View style={[styles.splitRow, { flexDirection: isDesktop ? 'row' : 'column' }]}>
        {/* Chart Card */}
        <View style={[styles.chartCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: textColor }]}>Evaluation Velocity</Text>
              <Text style={[styles.cardSub, { color: mutedColor }]}>
                Applications processed per day
              </Text>
            </View>
            <View style={styles.pills}>
              {(['7d', '30d', '1y'] as const).map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setTimeRange(r)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: timeRange === r
                        ? (isDark ? colors.brand[800] : colors.brand[700])
                        : (isDark ? colors.neutral[700] : colors.neutral[100]),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pillText,
                      { color: timeRange === r ? '#FFFFFF' : mutedColor },
                    ]}
                  >
                    {r === '7d' ? '7D' : r === '30d' ? '30D' : '1Y'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Bar chart */}
          <View style={[styles.chartArea, { borderColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}>
            <View style={styles.barsRow}>
              {MOCK_CHART_BARS.map((bar, i) => (
                <View key={i} style={styles.barWrap}>
                  <Text style={[styles.barValue, { color: mutedColor }]}>
                    {Math.round(bar.h * 1.2)}
                  </Text>
                  <View
                    style={[
                      styles.bar,
                      { height: bar.h, backgroundColor: bar.color, opacity: isDark ? 0.85 : 1 },
                    ]}
                  />
                  <Text style={[styles.barLabel, { color: mutedColor }]}>{bar.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={[styles.legendText, { color: mutedColor }]}>New</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.legendText, { color: mutedColor }]}>Resolved</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.legendText, { color: mutedColor }]}>Escalated</Text>
            </View>
          </View>
        </View>

        {/* Activity Feed */}
        <View style={[styles.activityCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Live Activity</Text>
            <Text style={[styles.seeAll, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>
              See all →
            </Text>
          </View>
          <View style={styles.activityList}>
            {MOCK_ACTIVITY.map((item, idx) => (
              <View
                key={item.id}
                style={[
                  styles.activityRow,
                  idx < MOCK_ACTIVITY.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor },
                ]}
              >
                <View style={[styles.actDot, { backgroundColor: item.dot }]} />
                <View style={styles.actText}>
                  <Text style={[styles.actTitle, { color: textColor }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.actMeta, { color: mutedColor }]}>{item.meta}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ── Queue Table ─────────────────────────────────────────────────── */}
      <View style={[styles.tableCard, { backgroundColor: cardBg, borderColor }]}>
        <View style={[styles.cardHeader, styles.tableCardHeader]}>
          <View>
            <Text style={[styles.cardTitle, { color: textColor }]}>Application Queue</Text>
            <Text style={[styles.cardSub, { color: mutedColor }]}>
              Active evaluation queue — {MOCK_QUEUE.length} entries
            </Text>
          </View>
          <Pressable
            style={[
              styles.reviewBtn,
              { backgroundColor: isDark ? colors.brand[800] : colors.brand[700] },
            ]}
          >
            <Lucide name="plus" size={13} color="#FFFFFF" />
            <Text style={styles.reviewBtnText}>Review Next</Text>
          </Pressable>
        </View>

        {/* Table header */}
        <View style={[styles.tableHeader, { backgroundColor: tableHdrBg, borderBottomColor: borderColor }]}>
          {(['Application ID', 'Applicant', 'Type', 'Submitted', 'Status'] as const).map((col) => (
            <Text
              key={col}
              style={[
                styles.tableHdrCell,
                { color: mutedColor },
                col === 'Application ID' ? styles.colId : col === 'Status' ? styles.colStatus : styles.colDefault,
              ]}
            >
              {col.toUpperCase()}
            </Text>
          ))}
        </View>

        {/* Table rows */}
        {MOCK_QUEUE.map((row, idx) => {
          const statusStyle = STATUS_COLORS[row.status];
          return (
            <View
              key={row.id}
              style={[
                styles.tableRow,
                { borderBottomColor: borderColor },
                idx === MOCK_QUEUE.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={[styles.tableCell, styles.colId, styles.monoCell, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>
                {row.id}
              </Text>
              <Text style={[styles.tableCell, styles.colDefault, { color: textColor }]} numberOfLines={1}>
                {row.applicant}
              </Text>
              <Text style={[styles.tableCell, styles.colDefault, { color: mutedColor }]} numberOfLines={1}>
                {row.type}
              </Text>
              <Text style={[styles.tableCell, styles.colDefault, { color: mutedColor }]}>
                {row.submitted}
              </Text>
              <View style={[styles.colStatus, styles.tableCellCenter]}>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                    {row.status}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    padding: SPACING[24],
    gap: SPACING[16],
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },

  // Title
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING[16],
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.pageTitle,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  pageSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // KPI
  kpiRow: { gap: SPACING[12] },
  kpiCard: {
    flex: 1,
    minWidth: 160,
    padding: SPACING[12],
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 3,
    gap: 2,
    ...Platform.select({ web: { transition: 'box-shadow 150ms ease' } }),
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  kpiIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiTrend: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  kpiValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: 28,
  },
  kpiLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: 2,
  },
  kpiSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
  },

  // Split row
  splitRow: { gap: SPACING[16] },

  // Chart card
  chartCard: {
    flex: 2,
    borderRadius: 8,
    borderWidth: 1,
    padding: SPACING[16],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[12],
    gap: SPACING[12],
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  cardSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    marginTop: 2,
  },
  pills: { flexDirection: 'row', gap: 4 },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  pillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  chartArea: {
    borderRadius: 6,
    borderWidth: 1,
    padding: SPACING[12],
    marginBottom: SPACING[10],
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
    gap: 8,
  },
  barWrap: { alignItems: 'center', gap: 4, flex: 1 },
  barValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
  },
  bar: {
    width: '80%',
    borderRadius: 3,
    minHeight: 4,
  },
  barLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
  },
  legend: { flexDirection: 'row', gap: SPACING[12] },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10 },

  // Activity card
  activityCard: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    padding: SPACING[16],
    minWidth: 240,
  },
  seeAll: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  activityList: { gap: 0 },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
    paddingVertical: SPACING[8],
  },
  actDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  actText: { flex: 1 },
  actTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  actMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    marginTop: 1,
  },

  // Queue table
  tableCard: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableCardHeader: {
    padding: SPACING[16],
    paddingBottom: SPACING[12],
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING[12],
    paddingVertical: 6,
    borderRadius: 6,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  reviewBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#FFFFFF',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[16],
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  tableHdrCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[16],
    height: 36,
    borderBottomWidth: 1,
    ...Platform.select({ web: { transition: 'background-color 100ms ease' } }),
  },
  tableCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
  },
  tableCellCenter: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  monoCell: {
    fontFamily: TYPOGRAPHY.fonts.mono,
    fontSize: 12,
  },
  colId: { flex: 1.4, paddingRight: 8 },
  colDefault: { flex: 1, paddingRight: 8 },
  colStatus: { width: 90 },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
