import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Icon as Lucide, SPACING, TYPOGRAPHY, useTheme } from '@edge/ui';

// ─── Types ───────────────────────────────────────────────────────────────────

type LogStatus = 'Success' | 'Warning' | 'Error';
type EventType = 'Auth' | 'Data' | 'System' | 'Security' | 'User';

interface LogEntry {
  id: string;
  timestamp: string;
  event: string;
  actor: string;
  resource: string;
  ip: string;
  status: LogStatus;
  type: EventType;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_LOGS: readonly LogEntry[] = [
  { id: 'LOG-001', timestamp: '2026-07-30 10:24:17', event: 'User Login',            actor: 'admin@ntc.gov.ph',   resource: '/auth/login',               ip: '192.168.1.105', status: 'Success', type: 'Auth' },
  { id: 'LOG-002', timestamp: '2026-07-30 10:22:04', event: 'Role Policy Updated',   actor: 'admin@ntc.gov.ph',   resource: '/roles/Admin',              ip: '192.168.1.105', status: 'Success', type: 'Security' },
  { id: 'LOG-003', timestamp: '2026-07-30 10:18:33', event: 'Employee Record Edit',  actor: 'hr@ntc.gov.ph',      resource: '/employees/EMP-0042',       ip: '10.0.0.88',     status: 'Success', type: 'Data' },
  { id: 'LOG-004', timestamp: '2026-07-30 09:55:11', event: 'Failed Login Attempt',  actor: 'unknown',             resource: '/auth/login',               ip: '203.0.113.42',  status: 'Error',   type: 'Auth' },
  { id: 'LOG-005', timestamp: '2026-07-30 09:44:02', event: 'Announcement Created',  actor: 'admin@ntc.gov.ph',   resource: '/announcements/ANN-019',    ip: '192.168.1.105', status: 'Success', type: 'System' },
  { id: 'LOG-006', timestamp: '2026-07-30 09:30:58', event: 'License Approved',      actor: 'evaluator@ntc.ph',   resource: '/applications/APP-2026-0521', ip: '172.16.0.22', status: 'Success', type: 'Data' },
  { id: 'LOG-007', timestamp: '2026-07-30 09:15:44', event: 'Report Exported',       actor: 'director@ntc.gov.ph',resource: '/reports/export/q2-2026',   ip: '10.0.0.55',     status: 'Success', type: 'System' },
  { id: 'LOG-008', timestamp: '2026-07-30 08:52:17', event: 'Unauthorized Access',   actor: 'cashier@ntc.ph',     resource: '/admin/system-config',      ip: '10.0.0.71',     status: 'Error',   type: 'Security' },
  { id: 'LOG-009', timestamp: '2026-07-30 08:41:36', event: 'Password Changed',      actor: 'user@ntc.gov.ph',    resource: '/account/password',         ip: '192.168.1.88',  status: 'Success', type: 'User' },
  { id: 'LOG-010', timestamp: '2026-07-30 08:33:05', event: 'Session Timeout',       actor: 'legal@ntc.gov.ph',   resource: '/auth/session',             ip: '10.0.0.33',     status: 'Warning', type: 'Auth' },
  { id: 'LOG-011', timestamp: '2026-07-30 08:20:49', event: 'User Account Created',  actor: 'admin@ntc.gov.ph',   resource: '/users/USR-0188',           ip: '192.168.1.105', status: 'Success', type: 'User' },
  { id: 'LOG-012', timestamp: '2026-07-30 07:58:23', event: 'Bulk Data Export',      actor: 'admin@ntc.gov.ph',   resource: '/data/export/employees',    ip: '192.168.1.105', status: 'Warning', type: 'Data' },
];

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

  const canvasBg = isDark ? colors.neutral[900] : colors.neutral[50];
  const cardBg = isDark ? colors.neutral[800] : '#FFFFFF';
  const borderColor = isDark ? colors.neutral[700] : colors.neutral[200];
  const textColor = isDark ? colors.neutral[100] : colors.neutral[900];
  const mutedColor = isDark ? colors.neutral[400] : colors.neutral[500];
  const inputBg = isDark ? colors.neutral[900] : colors.neutral[50];

  const filtered = MOCK_LOGS.filter((log) => {
    const matchSearch =
      search === '' ||
      log.event.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || log.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
            Immutable audit trail — {MOCK_LOGS.length} events recorded today
          </Text>
        </View>
        <Pressable
          style={[styles.exportBtn, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100], borderColor }]}
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

        {/* ── Table Rows ─────────────────────────────────────────────── */}
        {filtered.map((log, idx) => {
          const st = STATUS_STYLE[log.status];
          const tp = TYPE_STYLE[log.type];
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
                {log.timestamp}
              </Text>
              <Text style={[styles.td, styles.colEvent, { color: textColor }]} numberOfLines={1}>
                {log.event}
              </Text>
              <View style={[styles.colType, styles.tdCenter]}>
                <View style={[styles.badge, { backgroundColor: tp.bg }]}>
                  <Text style={[styles.badgeText, { color: tp.text }]}>{log.type}</Text>
                </View>
              </View>
              <Text style={[styles.td, styles.colActor, { color: mutedColor }]} numberOfLines={1}>
                {log.actor}
              </Text>
              <Text style={[styles.td, styles.colIp, styles.monoFont, { color: mutedColor }]}>
                {log.ip}
              </Text>
              <View style={[styles.colStatus, styles.tdCenter]}>
                <View style={[styles.badge, { backgroundColor: st.bg }]}>
                  <View style={[styles.statusDot, { backgroundColor: st.dot }]} />
                  <Text style={[styles.badgeText, { color: st.text }]}>{log.status}</Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Lucide name="inbox" size={28} color={mutedColor} />
            <Text style={[styles.emptyText, { color: mutedColor }]}>No matching log entries</Text>
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
    width: '100%',
    alignSelf: 'center',
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING[12],
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
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  exportBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  tableCard: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    padding: SPACING[12],
    borderBottomWidth: 1,
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 180,
  },
  searchInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    outlineStyle: 'none',
  } as object,
  filters: { flexDirection: 'row', gap: 4 },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  filterPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  th: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    height: 36,
    borderBottomWidth: 1,
    ...Platform.select({ web: { transition: 'background-color 100ms ease' } }),
  },
  td: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
  },
  tdCenter: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  monoFont: {
    fontFamily: TYPOGRAPHY.fonts.mono,
    fontSize: 11,
  },

  // Columns
  colTs:     { width: 148, paddingRight: 8 },
  colEvent:  { flex: 1.5, paddingRight: 8 },
  colType:   { width: 80, paddingRight: 8 },
  colActor:  { flex: 1, paddingRight: 8 },
  colIp:     { width: 120, paddingRight: 8 },
  colStatus: { width: 80 },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[40],
    gap: SPACING[12],
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
  },
});
