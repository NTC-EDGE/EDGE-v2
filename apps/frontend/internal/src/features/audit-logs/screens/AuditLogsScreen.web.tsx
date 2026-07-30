import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Icon as Lucide, SPACING, useTheme, SkeletonLoader } from '@edge/ui';
import { useAdminAuditLogs, AuditLogDto } from '@edge/api';

// ─── Types ───────────────────────────────────────────────────────────────────

type LogStatus = 'Success' | 'Warning' | 'Error';
type EventType = 'Auth' | 'Data' | 'System' | 'Security' | 'User';

const STATUS_STYLE: Record<LogStatus, { text: string; bg: string; dot: string }> = {
  Success: { text: '#065F46', bg: '#D1FAE5', dot: '#10B981' },
  Warning: { text: '#92400E', bg: '#FEF3C7', dot: '#F59E0B' },
  Error:   { text: '#991B1B', bg: '#FEE2E2', dot: '#EF4444' },
};

const TYPE_STYLE: Record<EventType, { text: string; bg: string }> = {
  Auth:     { text: '#1E40AF', bg: '#DBEAFE' },
  Data:     { text: '#5B21B6', bg: '#EDE9FE' },
  System:   { text: '#065F46', bg: '#D1FAE5' },
  Security: { text: '#991B1B', bg: '#FEE2E2' },
  User:     { text: '#92400E', bg: '#FEF3C7' },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function AuditLogsScreen() {
  const { colors, isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LogStatus | 'All'>('All');

  const { logs, totalCount, isLoading, isError } = useAdminAuditLogs(1, 100, search);

  const canvasBg = isDark ? colors.neutral[900] : colors.neutral[50];
  const cardBg = isDark ? colors.neutral[800] : '#FFFFFF';
  const borderColor = isDark ? colors.neutral[700] : colors.neutral[200];
  const textColor = isDark ? colors.neutral[100] : colors.neutral[900];
  const mutedColor = isDark ? colors.neutral[400] : colors.neutral[500];
  const inputBg = isDark ? colors.neutral[900] : colors.neutral[50];

  const filtered = logs.filter((log) => {
    return statusFilter === 'All' || log.status === statusFilter;
  });

  const formatTimestamp = (tsString: string) => {
    try {
      const d = new Date(tsString);
      if (isNaN(d.getTime())) return tsString;
      return d.toISOString().replace('T', ' ').substring(0, 19);
    } catch {
      return tsString;
    }
  };

  const handleExportCsv = () => {
    if (!filtered || filtered.length === 0) return;
    const headers = ['Timestamp', 'Event', 'Type', 'Actor', 'IP Address', 'Status', 'Resource', 'Changes'];
    const rows = filtered.map((log) => [
      `"${formatTimestamp(log.timestamp)}"`,
      `"${log.event || log.action}"`,
      `"${log.type || 'System'}"`,
      `"${log.actor}"`,
      `"${log.ipAddress}"`,
      `"${log.status || 'Success'}"`,
      `"${log.resource}"`,
      `"${(log.changes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: canvasBg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Page Title ─────────────────────────────────────────────────── */}
      <View style={styles.titleRow}>
        <View>
          <Text style={[styles.pageTitle, { color: textColor }]}>Audit Logs</Text>
          <Text style={[styles.pageSub, { color: mutedColor }]}>
            Immutable audit trail — {totalCount} events recorded today
          </Text>
        </View>
        <Pressable
          style={[styles.exportBtn, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100], borderColor }]}
          onPress={handleExportCsv}
        >
          <Lucide name="download" size={13} color={mutedColor} />
          <Text style={[styles.exportBtnText, { color: mutedColor }]}>Export CSV</Text>
        </Pressable>
      </View>

      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <View style={[styles.tableCard, { backgroundColor: cardBg, borderColor }]}>
        <View style={[styles.toolbar, { borderBottomColor: borderColor }]}>
          {/* Search */}
          <View style={[styles.searchBox, { backgroundColor: inputBg, borderColor }]}>
            <Lucide name="search" size={13} color={mutedColor} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search events, actors, resources…"
              placeholderTextColor={mutedColor}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Status filters */}
          <View style={styles.filters}>
            {(['All', 'Success', 'Warning', 'Error'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setStatusFilter(s)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor:
                      statusFilter === s
                        ? (isDark ? colors.brand[800] : colors.brand[700])
                        : (isDark ? colors.neutral[700] : colors.neutral[100]),
                    borderColor: statusFilter === s ? 'transparent' : borderColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: statusFilter === s ? '#FFFFFF' : mutedColor },
                  ]}
                >
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Table Header ────────────────────────────────────────────── */}
        <View style={[styles.tableHeader, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderBottomColor: borderColor }]}>
          <Text style={[styles.th, styles.colTs, { color: mutedColor }]}>TIMESTAMP</Text>
          <Text style={[styles.th, styles.colEvent, { color: mutedColor }]}>EVENT</Text>
          <Text style={[styles.th, styles.colType, { color: mutedColor }]}>TYPE</Text>
          <Text style={[styles.th, styles.colActor, { color: mutedColor }]}>ACTOR</Text>
          <Text style={[styles.th, styles.colIp, { color: mutedColor }]}>IP ADDRESS</Text>
          <Text style={[styles.th, styles.colStatus, { color: mutedColor }]}>STATUS</Text>
        </View>

        {/* ── Loading Skeleton ───────────────────────────────────────── */}
        {isLoading && (
          <View style={{ padding: SPACING[16], gap: SPACING[8] }}>
            <SkeletonLoader height={32} borderRadius={4} />
            <SkeletonLoader height={32} borderRadius={4} />
            <SkeletonLoader height={32} borderRadius={4} />
          </View>
        )}

        {/* ── Table Rows ─────────────────────────────────────────────── */}
        {!isLoading && filtered.map((log, idx) => {
          const st = STATUS_STYLE[log.status || 'Success'];
          const tp = TYPE_STYLE[log.type || 'System'];
          return (
            <View
              key={log.id}
              style={[
                styles.tableRow,
                { borderBottomColor: borderColor },
                idx === filtered.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={[styles.td, styles.colTs, styles.monoFont, { color: mutedColor }]}>
                {formatTimestamp(log.timestamp)}
              </Text>
              <Text style={[styles.td, styles.colEvent, { color: textColor }]} numberOfLines={1}>
                {log.event || log.action}
              </Text>
              <View style={[styles.colType, styles.tdCenter]}>
                <View style={[styles.badge, { backgroundColor: tp.bg }]}>
                  <Text style={[styles.badgeText, { color: tp.text }]}>{log.type || 'System'}</Text>
                </View>
              </View>
              <Text style={[styles.td, styles.colActor, { color: mutedColor }]} numberOfLines={1}>
                {log.actor}
              </Text>
              <Text style={[styles.td, styles.colIp, styles.monoFont, { color: mutedColor }]}>
                {log.ipAddress}
              </Text>
              <View style={[styles.colStatus, styles.tdCenter]}>
                <View style={[styles.badge, { backgroundColor: st.bg }]}>
                  <View style={[styles.statusDot, { backgroundColor: st.dot }]} />
                  <Text style={[styles.badgeText, { color: st.text }]}>{log.status || 'Success'}</Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Lucide name="inbox" size={28} color={mutedColor} />
            <Text style={[styles.emptyText, { color: mutedColor }]}>No matching log entries found</Text>
          </View>
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
    maxWidth: 1280,
    alignSelf: 'center',
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  pageSub: {
    fontSize: 13,
    marginTop: 2,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING[12],
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tableCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[12],
    borderBottomWidth: 1,
    gap: SPACING[12],
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING[12],
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    maxWidth: 400,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  filters: {
    flexDirection: 'row',
    gap: SPACING[6],
  },
  filterPill: {
    paddingHorizontal: SPACING[12],
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  th: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[16],
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  td: {
    fontSize: 13,
  },
  monoFont: {
    fontFamily: 'monospace',
  },
  colTs: { width: 160 },
  colEvent: { flex: 1 },
  colType: { width: 90 },
  colActor: { width: 180 },
  colIp: { width: 140 },
  colStatus: { width: 100 },
  tdCenter: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    padding: SPACING[40],
    alignItems: 'center',
    gap: SPACING[8],
  },
  emptyText: {
    fontSize: 13,
  },
});
