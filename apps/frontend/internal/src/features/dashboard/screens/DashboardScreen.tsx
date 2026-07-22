import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, useWindowDimensions, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { MetricCard } from '../components/MetricCard';

interface TooltipState {
  x: number;
  y: number;
  value: number;
  label: string;
  series: string;
}

interface ActivityItem {
  id: string;
  type: 'approved' | 'submitted' | 'settings';
  text: string;
  author: string;
  time: string;
  details: string;
}

const PERIODS = {
  '7days': {
    label: 'Last 7 Days',
    kpis: {
      pending: '28',
      rejected: '7',
      employees: '56',
      completed: '12',
    },
    xLabels: ['May 01', 'May 02', 'May 03', 'May 04', 'May 05', 'May 06', 'May 07'],
    series: {
      Completed: [65, 78, 60, 84, 72, 88, 80],
      Approved: [40, 52, 45, 60, 50, 65, 60],
      Rejected: [10, 13, 8, 15, 12, 14, 12],
      Pending: [2, 5, 0, 5, 3, 5, 4],
    }
  },
  '30days': {
    label: 'Last 30 Days',
    kpis: {
      pending: '145',
      rejected: '24',
      employees: '58',
      completed: '92',
    },
    xLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    series: {
      Completed: [50, 70, 65, 92],
      Approved: [30, 48, 55, 70],
      Rejected: [12, 8, 16, 10],
      Pending: [8, 14, 5, 12],
    }
  },
  'year': {
    label: 'Last 12 Months',
    kpis: {
      pending: '1,840',
      rejected: '210',
      employees: '64',
      completed: '1,245',
    },
    xLabels: ['Q1', 'Q2', 'Q3', 'Q4'],
    series: {
      Completed: [240, 310, 280, 415],
      Approved: [180, 240, 210, 320],
      Rejected: [45, 35, 52, 40],
      Pending: [15, 25, 18, 30],
    }
  }
} as const;

export function DashboardScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'year'>('7days');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<TooltipState | null>(null);
  const [hoveredLegend, setHoveredLegend] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);

  const currentPeriod = PERIODS[timeRange];

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: '2-digit',
      year: 'numeric',
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  const scaleY = (val: number, maxVal: number) => {
    const chartHeight = 160;
    const scale = maxVal > 0 ? chartHeight / maxVal : 1;
    return 180 - (val * scale);
  };

  const allValues = [
    ...currentPeriod.series.Completed,
    ...currentPeriod.series.Approved,
    ...currentPeriod.series.Rejected,
    ...currentPeriod.series.Pending
  ];
  const maxVal = Math.max(...allValues, 10);

  const getPointsPath = (data: readonly number[]) => {
    const pointsCount = data.length;
    const stepX = pointsCount > 1 ? 420 / (pointsCount - 1) : 420;
    return data.map((val, idx) => {
      const x = 50 + idx * stepX;
      const y = scaleY(val, maxVal);
      return { x, y, val };
    });
  };

  const getPathString = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  };

  const seriesColors = {
    Completed: '#2563EB',
    Approved: '#10B981',
    Rejected: '#EF4444',
    Pending: '#F59E0B',
  } as const;

  const LineChart = () => (
    <View style={styles.chartContainer}>
      {Platform.OS === 'web' ? (
        <View style={{ position: 'relative', width: '100%', height: '100%' }}>
          <svg width="100%" height="220" viewBox="0 0 500 220" style={{ overflow: 'visible' }}>
            <line x1="40" y1="20" x2="480" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="40" y1="60" x2="480" y2="60" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="40" y1="100" x2="480" y2="100" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="40" y1="140" x2="480" y2="140" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="40" y1="180" x2="480" y2="180" stroke="#E2E8F0" strokeWidth="1.5" />
            
            <text x="25" y="24" fill="#94A3B8" fontSize="10" fontWeight="600" textAnchor="end">{Math.round(maxVal)}</text>
            <text x="25" y="64" fill="#94A3B8" fontSize="10" fontWeight="600" textAnchor="end">{Math.round(maxVal * 0.75)}</text>
            <text x="25" y="104" fill="#94A3B8" fontSize="10" fontWeight="600" textAnchor="end">{Math.round(maxVal * 0.5)}</text>
            <text x="25" y="144" fill="#94A3B8" fontSize="10" fontWeight="600" textAnchor="end">{Math.round(maxVal * 0.25)}</text>
            <text x="25" y="184" fill="#94A3B8" fontSize="10" fontWeight="600" textAnchor="end">0</text>

            {(Object.keys(currentPeriod.series) as Array<keyof typeof currentPeriod.series>).map(key => {
              const points = getPointsPath(currentPeriod.series[key]);
              const pathString = getPathString(points);
              const color = seriesColors[key];
              const isDimmed = hoveredLegend !== null && hoveredLegend !== key;
              return (
                <path
                  key={key}
                  d={pathString}
                  fill="none"
                  stroke={color}
                  strokeWidth={hoveredLegend === key ? 4 : 3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isDimmed ? 0.25 : 1}
                  style={{ transition: 'all 200ms ease' }}
                />
              );
            })}

            {(Object.keys(currentPeriod.series) as Array<keyof typeof currentPeriod.series>).map(key => {
              const points = getPointsPath(currentPeriod.series[key]);
              const color = seriesColors[key];
              const isDimmed = hoveredLegend !== null && hoveredLegend !== key;
              return points.map((p, idx) => {
                const xLabel = currentPeriod.xLabels[idx];
                const isSelected = activeTooltip?.x === p.x && activeTooltip?.y === p.y;
                return (
                  <g key={`${key}-${idx}`} opacity={isDimmed ? 0.2 : 1}>
                    <circle
                      cx={p.x} cy={p.y} r={isSelected ? 6.5 : 4.5} fill={isSelected ? color : '#FFFFFF'}
                      stroke={color} strokeWidth={isSelected ? 3 : 2.5}
                      style={{ cursor: 'pointer', transition: 'all 150ms ease' }}
                      onMouseEnter={() => setActiveTooltip({ x: p.x, y: p.y, value: p.val, label: xLabel, series: key })}
                      onMouseLeave={() => setActiveTooltip(null)}
                    />
                  </g>
                );
              });
            })}

            {currentPeriod.xLabels.map((lbl, idx) => {
              const pointsCount = currentPeriod.xLabels.length;
              const stepX = pointsCount > 1 ? 420 / (pointsCount - 1) : 420;
              const x = 50 + idx * stepX;
              return <text key={lbl} x={x} y="202" fill="#94A3B8" fontSize="10" fontWeight="600" textAnchor="middle">{lbl}</text>;
            })}
          </svg>

          {activeTooltip && (
            <View style={[styles.tooltipBox, SHADOWS.modal, { left: activeTooltip.x - 60, top: activeTooltip.y - 65 }]}>
              <View style={styles.tooltipHeader}>
                <View style={[styles.dotIndicator, { backgroundColor: seriesColors[activeTooltip.series as keyof typeof seriesColors], width: 6, height: 6 }]} />
                <Text style={styles.tooltipSeries}>{activeTooltip.series}</Text>
              </View>
              <Text style={styles.tooltipValue}>{activeTooltip.label}: <Text style={styles.boldText}>{activeTooltip.value}</Text></Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.nativeFallbackChart}><Text style={{ color: COLORS.neutral[400] }}>Trend visualization active</Text></View>
      )}
    </View>
  );

  const DonutChart = () => {
    const categories = [
      { name: 'Accreditations', val: 420, percent: 24, color: '#2563EB' },
      { name: 'Permits', val: 240, percent: 14, color: '#10B981' },
      { name: 'Exams', val: 550, percent: 32, color: '#F59E0B' },
      { name: 'Licenses', val: 310, percent: 18, color: '#8B5CF6' },
      { name: 'Certificates', val: 180, percent: 10, color: '#EF4444' },
      { name: 'Req/Complaints', val: 95, percent: 6, color: '#6B7280' },
    ] as const;
    const totalCircumference = 2 * Math.PI * 38;
    const totalVal = 1795;
    let accumulatedOffset = 0;
    const mappedCategories = categories.map(cat => {
      const length = (cat.val / totalVal) * totalCircumference;
      const offset = -accumulatedOffset;
      accumulatedOffset += length;
      return { ...cat, length, offset };
    });
    return (
      <View style={styles.donutWrapper}>
        {Platform.OS === 'web' ? (
          <View style={styles.donutSvgContainer}>
            <svg width="150" height="150" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              {mappedCategories.map(cat => (
                <circle key={cat.name} cx="50" cy="50" r="38" fill="transparent" stroke={cat.color}
                  strokeWidth={hoveredLegend === cat.name ? 17 : 12}
                  strokeDasharray={`${cat.length} ${totalCircumference}`}
                  strokeDashoffset={cat.offset}
                  opacity={hoveredLegend !== null ? (hoveredLegend === cat.name ? 1 : 0.3) : 1}
                  style={{ transition: 'all 200ms ease', cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredLegend(cat.name)}
                  onMouseLeave={() => setHoveredLegend(null)}
                />
              ))}
            </svg>
            <View style={styles.donutCenter}>
              <Text style={styles.donutValue}>{hoveredLegend ? categories.find(c => c.name === hoveredLegend)?.val : '1.7K'}</Text>
              <Text style={styles.donutLabel}>{hoveredLegend ? 'REQUESTS' : 'TOTAL'}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.nativeFallbackDonut}><Text style={styles.donutValue}>1,795</Text><Text style={styles.donutLabel}>TOTAL</Text></View>
        )}
        <View style={styles.donutLegend}>
          {categories.map(cat => (
            <Pressable key={cat.name} onHoverIn={() => setHoveredLegend(cat.name)} onHoverOut={() => setHoveredLegend(null)}
              style={[styles.legendRow, hoveredLegend === cat.name && styles.legendRowHovered]}>
              <View style={styles.legendLeft}>
                <View style={[styles.dotIndicator, { backgroundColor: cat.color }]} />
                <Text style={[styles.legendName, hoveredLegend === cat.name && styles.legendNameHovered]}>{cat.name}</Text>
              </View>
              <Text style={styles.legendVal}>{cat.val} <Text style={styles.legendPerc}>({cat.percent}%)</Text></Text>
            </Pressable>
          ))}
          <Pressable style={styles.viewServicesBtn}><Text style={styles.viewServicesText}>View all services</Text><Lucide name="arrow-right" size={13} color="#2563EB" /></Pressable>
        </View>
      </View>
    );
  };

  const activities: readonly ActivityItem[] = [
    { id: 'APP-2026-0521', type: 'approved', text: 'Application #APP-2026-0521 was approved', author: 'by Juan Dela Cruz', time: '10:24 AM', details: 'Accreditation application for international telecom relay carrier license underwent final compliance check and technical verification. All criteria satisfied.' },
    { id: 'ACR-2026-0042', type: 'submitted', text: 'New accreditation request #ACR-2026-0042 submitted', author: 'by RuralNet ISP', time: '09:45 AM', details: 'Submitted document bundle for rural satellite broadband spectrum allocation license review. Currently queued for technical staff check.' },
    { id: 'USR-SET-9021', type: 'settings', text: 'Staff settings modified for Reviewer Role constraints', author: 'by Jane Faith Labrador', time: '08:15 AM', details: 'Configuration changes to role parameters in the EDGE shell security scope. Added access to support modules for compliance reviewer accounts.' },
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'approved': return <Lucide name="check-circle" size={16} color="#10B981" />;
      case 'submitted': return <Lucide name="file-text" size={16} color="#F59E0B" />;
      case 'settings': return <Lucide name="user" size={16} color="#2563EB" />;
    }
  };

  const getActivityIconColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'approved': return 'rgba(16, 185, 129, 0.1)';
      case 'submitted': return 'rgba(245, 158, 11, 0.1)';
      case 'settings': return 'rgba(37, 99, 235, 0.1)';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.welcomeRow}>
        <View>
          <Text style={styles.welcomeLabel}>WELCOME BACK</Text>
          <Text style={styles.welcomeTitle}>Good morning, ADMIN EDGE 👋</Text>
          <Text style={styles.welcomeSubtitle}>Here's what's happening in your office today.</Text>
        </View>
        <View style={[styles.dateCard, SHADOWS.card]}>
          <Lucide name="calendar" size={16} color={COLORS.neutral[500]} />
          <Text style={styles.dateText}>{getFormattedDate()}</Text>
        </View>
      </View>

      <View style={styles.kpiGrid}>
        <MetricCard title="Pending Applications" value={currentPeriod.kpis.pending} iconName="file-text" iconColor="#F59E0B" iconBgColor="rgba(245, 158, 11, 0.1)" />
        <MetricCard title="Rejected Applications" value={currentPeriod.kpis.rejected} iconName="x-circle" iconColor="#EF4444" iconBgColor="rgba(239, 68, 68, 0.1)" />
        <MetricCard title="Employees Active Today" value={currentPeriod.kpis.employees} iconName="users" iconColor="#10B981" iconBgColor="rgba(16, 185, 129, 0.1)" />
        <MetricCard title="Completed Applications" value={currentPeriod.kpis.completed} iconName="check-circle" iconColor="#2563EB" iconBgColor="rgba(37, 99, 235, 0.1)" />
      </View>

      <View style={styles.sectionSpacer} />

      <View style={[styles.analyticsRow, { flexDirection: isDesktop ? 'row' : 'column' }]}>
        <View style={[styles.cardContainer, styles.chartCard, SHADOWS.card]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Application Processing Trend</Text>
              <View style={styles.indicatorsRow}>
                {Object.entries(seriesColors).map(([key, color]) => (
                  <Pressable key={key} onHoverIn={() => setHoveredLegend(key)} onHoverOut={() => setHoveredLegend(null)} style={styles.indicatorItem}>
                    <View style={[styles.dotIndicator, { backgroundColor: color }]} />
                    <Text style={[styles.indicatorText, hoveredLegend === key && styles.boldText]}>{key}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={{ position: 'relative' }}>
              <Pressable onPress={() => setIsFilterOpen(!isFilterOpen)} style={styles.filterDropdown}>
                <Lucide name="calendar" size={14} color={COLORS.neutral[500]} />
                <Text style={styles.filterText}>{currentPeriod.label}</Text>
                <Lucide name="chevron-down" size={12} color={COLORS.neutral[500]} />
              </Pressable>
              {isFilterOpen && (
                <View style={[styles.filterMenu, SHADOWS.modal]}>
                  {(['7days', '30days', 'year'] as const).map(range => (
                    <Pressable key={range} onPress={() => { setTimeRange(range); setIsFilterOpen(false); }}
                      style={[styles.filterMenuItem, timeRange === range && styles.filterMenuItemActive]}>
                      <Text style={[styles.filterMenuText, timeRange === range && styles.filterMenuTextActive]}>{PERIODS[range].label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
          <LineChart />
        </View>
        <View style={[styles.cardContainer, styles.donutCard, SHADOWS.card]}>
          <View style={styles.cardHeader}><Text style={styles.cardTitle}>Service Requests Breakdown</Text></View>
          <DonutChart />
        </View>
      </View>

      <View style={styles.sectionSpacer} />

      <View style={[styles.recentActivityCard, SHADOWS.card]}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>Recent Activity</Text>
          <Pressable style={styles.viewAllBtn}><Text style={styles.viewAllText}>View all activity</Text><Lucide name="arrow-right" size={14} color="#2563EB" /></Pressable>
        </View>
        <View style={styles.activityList}>
          {activities.map(act => (
            <Pressable
              key={act.id}
              onPress={() => setSelectedActivity(act)}
              onHoverIn={() => setHoveredActivity(act.id)}
              onHoverOut={() => setHoveredActivity(null)}
              style={[
                styles.activityRow,
                hoveredActivity === act.id && styles.activityRowHovered,
              ]}
            >
              <View style={styles.activityLeft}>
                <View style={[styles.activityIconCircle, { backgroundColor: getActivityIconColor(act.type) }]}>{getActivityIcon(act.type)}</View>
                <View style={styles.activityTextContainer}><Text style={styles.activityText}>{act.text}</Text><Text style={styles.activityAuthor}>{act.author}</Text></View>
              </View>
              <Text style={styles.activityTime}>{act.time}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {selectedActivity && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.modal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Activity Detail Log</Text>
              <Pressable onPress={() => setSelectedActivity(null)} style={styles.modalCloseIcon}><Lucide name="x" size={20} color={COLORS.neutral[500]} /></Pressable>
            </View>
            <View style={styles.modalBody}>
              <View style={[styles.activityIconCircle, { backgroundColor: getActivityIconColor(selectedActivity.type), alignSelf: 'center', width: 48, height: 48, borderRadius: 24, marginBottom: 8 }]}>{getActivityIcon(selectedActivity.type)}</View>
              <Text style={styles.modalHeadingText}>{selectedActivity.text}</Text>
              <Text style={styles.modalDetails}>{selectedActivity.details}</Text>
              <View style={styles.metadataGrid}>
                <View style={styles.metaRow}><Text style={styles.metaLabel}>Operator</Text><Text style={styles.metaValue}>{selectedActivity.author.replace('by ', '')}</Text></View>
                <View style={styles.metaRow}><Text style={styles.metaLabel}>Log ID</Text><Text style={styles.metaValue}>{selectedActivity.id}</Text></View>
                <View style={styles.metaRow}><Text style={styles.metaLabel}>Timestamp</Text><Text style={styles.metaValue}>{selectedActivity.time}</Text></View>
                <View style={styles.metaRow}><Text style={styles.metaLabel}>Status</Text><Text style={[styles.metaValue, { color: '#10B981', fontWeight: 'bold' }]}>Verified Success</Text></View>
              </View>
            </View>
            <Pressable onPress={() => setSelectedActivity(null)} style={styles.modalCloseBtn}><Text style={styles.modalCloseText}>Done</Text></Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  welcomeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING[32], flexWrap: 'wrap', gap: SPACING[16] },
  welcomeLabel: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.brand[600], letterSpacing: 1, marginBottom: 4 },
  welcomeTitle: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 32, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.neutral[900], marginBottom: 6 },
  welcomeSubtitle: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 15, color: COLORS.neutral[500], fontWeight: TYPOGRAPHY.weights.regular },
  dateCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.neutral.white, paddingVertical: SPACING[12], paddingHorizontal: SPACING[16], borderRadius: RADIUS.input, borderWidth: 1, borderColor: COLORS.neutral[200] },
  dateText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.neutral[600] },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING[24], width: '100%' },
  sectionSpacer: { height: SPACING[24] },
  analyticsRow: { width: '100%', gap: SPACING[24] },
  cardContainer: { backgroundColor: COLORS.neutral.white, borderRadius: RADIUS.card, borderWidth: 1, borderColor: COLORS.neutral[200], padding: SPACING[24] },
  chartCard: { flex: 1.8 },
  donutCard: { flex: 1.2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING[24], flexWrap: 'wrap', gap: 12, position: 'relative' },
  cardTitle: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 18, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.neutral[900] },
  indicatorsRow: { flexDirection: 'row', gap: SPACING[16], marginTop: 8, flexWrap: 'wrap' },
  indicatorItem: { flexDirection: 'row', alignItems: 'center', gap: 6, ...Platform.select({ web: { cursor: 'pointer' } }) },
  indicatorText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.neutral[500] },
  filterDropdown: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: COLORS.neutral[200], backgroundColor: COLORS.neutral.white, ...Platform.select({ web: { cursor: 'pointer', transition: 'border-color 200ms ease' } }) },
  filterText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.neutral[700] },
  filterMenu: { position: 'absolute', top: 42, right: 0, width: 160, backgroundColor: COLORS.neutral.white, borderRadius: RADIUS.input, borderWidth: 1, borderColor: COLORS.neutral[200], padding: 6, zIndex: 100 },
  filterMenuItem: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6, ...Platform.select({ web: { cursor: 'pointer' } }) },
  filterMenuItemActive: { backgroundColor: 'rgba(37, 99, 235, 0.06)' },
  filterMenuText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], fontWeight: TYPOGRAPHY.weights.medium },
  filterMenuTextActive: { color: '#2563EB', fontWeight: TYPOGRAPHY.weights.bold },
  chartContainer: { width: '100%', height: 220, marginTop: 8 },
  nativeFallbackChart: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.neutral[50], borderRadius: 8 },
  tooltipBox: { position: 'absolute', backgroundColor: COLORS.neutral[900], borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, minWidth: 120, zIndex: 50 },
  tooltipHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  tooltipSeries: { fontSize: 10, color: 'rgba(255, 255, 255, 0.7)', fontWeight: 'bold', textTransform: 'uppercase' },
  tooltipValue: { fontSize: 11, color: '#FFFFFF' },
  donutWrapper: { flexDirection: 'row', alignItems: 'center', gap: SPACING[24], flexWrap: 'wrap' },
  donutSvgContainer: { position: 'relative', width: 150, height: 150, justifyContent: 'center', alignItems: 'center' },
  donutCenter: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  donutValue: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 22, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.neutral[900] },
  donutLabel: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 8, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.neutral[400], letterSpacing: 0.5, marginTop: 2 },
  nativeFallbackDonut: { width: 120, height: 120, borderRadius: 60, borderWidth: 12, borderColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
  donutLegend: { flex: 1, gap: 8, minWidth: 180 },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6, ...Platform.select({ web: { transition: 'background-color 150ms ease', cursor: 'pointer' } }) },
  legendRowHovered: { backgroundColor: COLORS.neutral[50] },
  legendLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dotIndicator: { width: 8, height: 8, borderRadius: 4 },
  legendName: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: TYPOGRAPHY.weights.medium, color: COLORS.neutral[600], ...Platform.select({ web: { transition: 'color 150ms ease' } }) },
  legendNameHovered: { color: COLORS.neutral[900], fontWeight: TYPOGRAPHY.weights.bold },
  legendVal: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.neutral[900] },
  legendPerc: { fontWeight: TYPOGRAPHY.weights.regular, color: COLORS.neutral[400] },
  viewServicesBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingLeft: 8 },
  viewServicesText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: TYPOGRAPHY.weights.bold, color: '#2563EB' },
  recentActivityCard: { width: '100%', backgroundColor: COLORS.neutral.white, borderRadius: RADIUS.card, borderWidth: 1, borderColor: COLORS.neutral[200], padding: SPACING[24] },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING[20] },
  activityTitle: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 18, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.neutral[900] },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewAllText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: TYPOGRAPHY.weights.bold, color: '#2563EB' },
  activityList: { gap: SPACING[12] },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING[12], paddingHorizontal: 12, borderRadius: 8, borderBottomWidth: 1, borderBottomColor: COLORS.neutral[100], ...Platform.select({ web: { transition: 'background-color 150ms ease, transform 150ms ease', cursor: 'pointer' } }) },
  activityRowHovered: { backgroundColor: COLORS.neutral[50], transform: [{ scale: 1.002 }] },
  activityLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING[16], flex: 1, marginRight: 16 },
  activityIconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  activityTextContainer: { flexDirection: 'column', gap: 2, flex: 1 },
  activityText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, color: COLORS.neutral[900] },
  activityAuthor: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[400] },
  activityTime: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[400], fontWeight: TYPOGRAPHY.weights.medium },
  boldText: { fontWeight: TYPOGRAPHY.weights.bold },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 16 },
  modalCard: { width: '100%', maxWidth: 480, backgroundColor: COLORS.neutral.white, borderRadius: RADIUS.card, borderWidth: 1, borderColor: COLORS.neutral[200], padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.neutral[900] },
  modalCloseIcon: { padding: 4 },
  modalBody: { alignItems: 'center' },
  modalHeadingText: { fontSize: 16, fontWeight: 'bold', color: COLORS.neutral[900], textAlign: 'center', marginBottom: 8 },
  modalDetails: { fontSize: 14, lineHeight: 22, color: COLORS.neutral[600], textAlign: 'center', marginBottom: 20 },
  metadataGrid: { backgroundColor: COLORS.neutral[50], borderRadius: 8, padding: 16, gap: 12, width: '100%' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaLabel: { fontSize: 12, fontWeight: 'bold', color: COLORS.neutral[400], textTransform: 'uppercase' },
  metaValue: { fontSize: 13, color: COLORS.neutral[800], fontWeight: '600' },
  modalCloseBtn: { marginTop: 24, backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 8, alignItems: 'center', width: '100%' },
  modalCloseText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
