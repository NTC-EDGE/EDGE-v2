import React, { useState, useMemo } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { AnimatedCard, Icon as Lucide, SPACING, TYPOGRAPHY, useTheme, SkeletonLoader } from '@edge/ui';
import { useRole } from '../../shell/context/RoleContext';
import { useAuthContext } from '../../auth/context/AuthContext';
import { useAdminApplications, ApplicationSummaryDto } from '@edge/api';
import { openQueueApplication } from '../../queue/data/internalApplicationNavigationHelper';
import { useAppNavigation } from '../../../navigation/types';

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

const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  Submitted:   { text: '#92400E', bg: '#FEF3C7' },
  Evaluating:  { text: '#1E40AF', bg: '#DBEAFE' },
  Pending:     { text: '#92400E', bg: '#FEF3C7' },
  'In Review': { text: '#1E40AF', bg: '#DBEAFE' },
  Approved:    { text: '#065F46', bg: '#D1FAE5' },
  Returned:    { text: '#991B1B', bg: '#FEE2E2' },
  Completed:   { text: '#1E3A8A', bg: '#E0E7FF' },
};

function formatDisplayDate(dateStr?: string | null): string {
  if (dateStr === null || dateStr === undefined || dateStr.trim().length === 0) {
    return 'Recent';
  }
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatRelativeTime(dateStr?: string | null): string {
  if (dateStr === null || dateStr === undefined || dateStr.trim().length === 0) {
    return 'Just now';
  }
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Recently';
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DashboardScreen(): React.ReactElement {
  const { currentRole } = useRole();
  const { user } = useAuthContext();
  const navigation = useAppNavigation();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  // Fetch live applications & metrics scoped to the active tenant / queue
  const { applications, statistics, isLoading, isError, refetch } = useAdminApplications({
    role: currentRole,
    scope: 'queue',
    pageSize: 15,
  });

  const canvasBg = isDark ? colors.neutral[900] : colors.neutral[50];
  const cardBg = isDark ? colors.neutral[800] : '#FFFFFF';
  const borderColor = isDark ? colors.neutral[700] : colors.neutral[200];
  const textColor = isDark ? colors.neutral[100] : colors.neutral[900];
  const mutedColor = isDark ? colors.neutral[400] : colors.neutral[500];
  const tableHdrBg = isDark ? colors.neutral[900] : colors.neutral[50];

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: '2-digit', year: 'numeric',
  });

  // Calculate live KPI metrics
  const kpiData: readonly KpiCard[] = useMemo(() => {
    const pendingCount = statistics?.evaluatingCount !== undefined
      ? statistics.evaluatingCount
      : applications.filter((a) => a.status === 'Submitted' || a.status === 'Evaluating').length;

    const approvedCount = statistics?.approvedCount !== undefined
      ? statistics.approvedCount
      : applications.filter((a) => a.status === 'Approved').length;

    const returnedCount = statistics?.returnedCount !== undefined
      ? statistics.returnedCount
      : applications.filter((a) => a.status === 'Returned').length;

    const completedCount = statistics?.completedCount !== undefined
      ? statistics.completedCount
      : applications.filter((a) => a.status === 'Completed').length;

    return [
      {
        label: 'Pending Evaluation',
        value: String(pendingCount),
        sub: 'Awaiting review in queue',
        icon: 'file-text',
        trend: '+Live',
        trendUp: false,
        accentColor: '#F59E0B',
      },
      {
        label: 'Approved Licenses',
        value: String(approvedCount),
        sub: 'Compliant & issued',
        icon: 'check-circle',
        trend: '+Live',
        trendUp: true,
        accentColor: '#10B981',
      },
      {
        label: 'Rejected / Returned',
        value: String(returnedCount),
        sub: 'Pending client correction',
        icon: 'alert-triangle',
        trend: 'Sync',
        trendUp: false,
        accentColor: '#EF4444',
      },
      {
        label: 'Total Completed',
        value: String(completedCount),
        sub: 'Finalized lifecycle',
        icon: 'layers',
        trend: '+Live',
        trendUp: true,
        accentColor: '#3B82F6',
      },
    ];
  }, [statistics, applications]);

  // Compute 7-day velocity breakdown from live applications
  const chartBars = useMemo(() => {
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    for (const app of applications) {
      if (app.createdAt !== null && app.createdAt !== undefined) {
        const d = new Date(app.createdAt);
        const dayIdx = (d.getDay() + 6) % 7; // Map 0 (Sun) to 6, 1 (Mon) to 0
        counts[dayIdx] = counts[dayIdx] + 1;
      }
    }

    const maxCount = Math.max(...counts, 1);

    return dayLabels.map((label, idx) => {
      const count = counts[idx];
      const normalizedHeight = Math.max(16, Math.min(100, Math.round((count / maxCount) * 90) + 10));
      const color = count > 0 ? (idx % 2 === 0 ? '#3B82F6' : '#10B981') : (isDark ? colors.neutral[700] : colors.neutral[300]);
      return {
        label,
        count,
        h: normalizedHeight,
        color,
      };
    });
  }, [applications, isDark, colors]);

  const handleReviewApp = (appId: string) => {
    openQueueApplication(appId);
    try {
      navigation.navigate('Activities');
    } catch {
      // Navigation handled by layout listener
    }
  };

  const handleReviewNext = () => {
    const nextPending = applications.find(
      (a) => a.status === 'Submitted' || a.status === 'Evaluating'
    ) ?? applications[0];

    if (nextPending !== undefined && nextPending !== null) {
      handleReviewApp(nextPending.id);
    } else {
      try {
        navigation.navigate('Activities');
      } catch {
        // Fallback
      }
    }
  };

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
            Welcome back, {user?.name ?? currentRole} — {today}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: isDark ? '#1A2E4A' : '#EFF6FF', borderColor: '#BFDBFE' }]}>
          <View style={[styles.statusDot, { backgroundColor: isError ? '#EF4444' : '#10B981' }]} />
          <Text style={[styles.statusText, { color: isDark ? '#60A5FA' : '#1D4ED8' }]}>
            {user?.tenantName ? `${user.tenantName} Office` : 'Regional Operations Live'}
          </Text>
        </View>
      </View>

      {/* ── KPI Strip ──────────────────────────────────────────────────── */}
      <View style={[styles.kpiRow, { flexDirection: isDesktop ? 'row' : 'row', flexWrap: 'wrap' }]}>
        {isLoading && applications.length === 0 ? (
          [0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.kpiCard, { backgroundColor: cardBg, borderColor }]}>
              <SkeletonLoader height={24} width={32} borderRadius={4} />
              <View style={{ height: 6 }} />
              <SkeletonLoader height={28} width={64} borderRadius={4} />
              <View style={{ height: 4 }} />
              <SkeletonLoader height={14} width={120} borderRadius={4} />
            </View>
          ))
        ) : (
          kpiData.map((kpi) => (
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
          ))
        )}
      </View>

      {/* ── Middle Row: Chart + Activity ────────────────────────────────── */}
      <View style={[styles.splitRow, { flexDirection: isDesktop ? 'row' : 'column' }]}>
        {/* Chart Card */}
        <View style={[styles.chartCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: textColor }]}>Evaluation Velocity</Text>
              <Text style={[styles.cardSub, { color: mutedColor }]}>
                Applications received and processed by day
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
              {chartBars.map((bar, i) => (
                <View key={i} style={styles.barWrap}>
                  <Text style={[styles.barValue, { color: mutedColor }]}>
                    {bar.count}
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
              <Text style={[styles.legendText, { color: mutedColor }]}>Even Days</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.legendText, { color: mutedColor }]}>Odd Days</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.legendText, { color: mutedColor }]}>Active Queue</Text>
            </View>
          </View>
        </View>

        {/* Activity Feed */}
        <View style={[styles.activityCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Live Activity Feed</Text>
            <Pressable onPress={() => navigation.navigate('Activities')}>
              <Text style={[styles.seeAll, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>
                See all →
              </Text>
            </Pressable>
          </View>
          <View style={styles.activityList}>
            {isLoading && applications.length === 0 ? (
              [0, 1, 2, 3].map((idx) => (
                <View key={idx} style={styles.activityRow}>
                  <SkeletonLoader height={8} width={8} borderRadius={4} />
                  <View style={styles.actText}>
                    <SkeletonLoader height={14} width={140} borderRadius={4} />
                    <View style={{ height: 4 }} />
                    <SkeletonLoader height={10} width={90} borderRadius={4} />
                  </View>
                </View>
              ))
            ) : applications.length === 0 ? (
              <View style={styles.emptyFeed}>
                <Lucide name="activity" size={24} color={mutedColor} />
                <Text style={[styles.emptyFeedText, { color: mutedColor }]}>
                  No recent activities recorded for this regional office.
                </Text>
              </View>
            ) : (
              applications.slice(0, 5).map((app, idx) => {
                const statusDot = app.status === 'Approved' ? '#10B981' :
                  app.status === 'Returned' ? '#EF4444' :
                  app.status === 'Evaluating' ? '#3B82F6' : '#F59E0B';

                const applicantName = app.filingUser?.name ?? app.filingUser?.company?.name ?? 'Applicant';
                const appIdentifier = app.applicationNumber ?? app.referenceNumber ?? app.id.slice(0, 8);

                return (
                  <Pressable
                    key={app.id}
                    onPress={() => handleReviewApp(app.id)}
                    style={[
                      styles.activityRow,
                      idx < Math.min(applications.length, 5) - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor },
                    ]}
                  >
                    <View style={[styles.actDot, { backgroundColor: statusDot }]} />
                    <View style={styles.actText}>
                      <Text style={[styles.actTitle, { color: textColor }]} numberOfLines={1}>
                        {appIdentifier} — {app.status}
                      </Text>
                      <Text style={[styles.actMeta, { color: mutedColor }]}>
                        {formatRelativeTime(app.createdAt)} · {applicantName}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        </View>
      </View>

      {/* ── Queue Table ─────────────────────────────────────────────────── */}
      <View style={[styles.tableCard, { backgroundColor: cardBg, borderColor }]}>
        <View style={[styles.cardHeader, styles.tableCardHeader]}>
          <View>
            <Text style={[styles.cardTitle, { color: textColor }]}>Application Queue</Text>
            <Text style={[styles.cardSub, { color: mutedColor }]}>
              Active evaluation queue — {applications.length} active submissions
            </Text>
          </View>
          <Pressable
            onPress={handleReviewNext}
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
        {isLoading && applications.length === 0 ? (
          [0, 1, 2, 3].map((idx) => (
            <View key={idx} style={[styles.tableRow, { borderBottomColor: borderColor }]}>
              <View style={styles.colId}><SkeletonLoader height={14} width={100} borderRadius={4} /></View>
              <View style={styles.colDefault}><SkeletonLoader height={14} width={120} borderRadius={4} /></View>
              <View style={styles.colDefault}><SkeletonLoader height={14} width={110} borderRadius={4} /></View>
              <View style={styles.colDefault}><SkeletonLoader height={14} width={80} borderRadius={4} /></View>
              <View style={styles.colStatus}><SkeletonLoader height={18} width={70} borderRadius={4} /></View>
            </View>
          ))
        ) : applications.length === 0 ? (
          <View style={styles.emptyTable}>
            <Text style={[styles.emptyTableText, { color: mutedColor }]}>
              No applications pending in evaluation queue.
            </Text>
          </View>
        ) : (
          applications.slice(0, 6).map((row, idx) => {
            const rawStatus = row.status ?? 'Submitted';
            const statusConfig = STATUS_COLORS[rawStatus] ?? { text: '#4B5563', bg: '#F3F4F6' };
            const applicantName = row.filingUser?.name ?? row.filingUser?.company?.name ?? 'Applicant';
            const serviceName = row.serviceName ?? row.serviceCategory ?? 'Permit Service';
            const appNumber = row.applicationNumber ?? row.referenceNumber ?? row.id.slice(0, 8);

            return (
              <Pressable
                key={row.id}
                onPress={() => handleReviewApp(row.id)}
                style={({ pressed }) => [
                  styles.tableRow,
                  { borderBottomColor: borderColor },
                  idx === Math.min(applications.length, 6) - 1 && { borderBottomWidth: 0 },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[styles.tableCell, styles.colId, styles.monoCell, { color: isDark ? colors.brand[400] : colors.brand[700] }]}>
                  {appNumber}
                </Text>
                <Text style={[styles.tableCell, styles.colDefault, { color: textColor }]} numberOfLines={1}>
                  {applicantName}
                </Text>
                <Text style={[styles.tableCell, styles.colDefault, { color: mutedColor }]} numberOfLines={1}>
                  {serviceName}
                </Text>
                <Text style={[styles.tableCell, styles.colDefault, { color: mutedColor }]}>
                  {formatDisplayDate(row.createdAt)}
                </Text>
                <View style={[styles.colStatus, styles.tableCellCenter]}>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusConfig.text }]}>
                      {rawStatus}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
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
    width: '100%',
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
    ...Platform.select({ web: { cursor: 'pointer' } }),
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
  emptyFeed: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[24],
    gap: 8,
  },
  emptyFeedText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    textAlign: 'center',
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
    height: 38,
    borderBottomWidth: 1,
    ...Platform.select({ web: { transition: 'background-color 100ms ease', cursor: 'pointer' } }),
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
  emptyTable: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[24],
  },
  emptyTableText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
});
