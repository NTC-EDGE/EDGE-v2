import React, { useState } from 'react';
import {
  Modal,
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

// Helper to safely parse JSON strings
function safeParseJson(jsonString?: string | null): Record<string, unknown> | null {
  if (!jsonString) return null;
  try {
    const parsed = JSON.parse(jsonString);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AuditLogsScreen() {
  const { colors, isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LogStatus | 'All'>('All');
  const [selectedLog, setSelectedLog] = useState<AuditLogDto | null>(null);

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
    const headers = ['Timestamp', 'Event', 'Action', 'Entity', 'Actor', 'IP Address', 'Status', 'Type', 'Resource', 'Changes'];
    const rows = filtered.map((log) => [
      `"${formatTimestamp(log.timestamp)}"`,
      `"${log.event || log.action}"`,
      `"${log.action}"`,
      `"${log.entityName}"`,
      `"${log.actor}"`,
      `"${log.ipAddress}"`,
      `"${log.status || 'Success'}"`,
      `"${log.type || 'System'}"`,
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
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // Ignore revocation error
      }
    }, 60_000);
  };

  // Prepare diff values for selected log
  const oldObj = safeParseJson(selectedLog?.oldValues);
  const newObj = safeParseJson(selectedLog?.newValues);
  const keyObj = safeParseJson(selectedLog?.keyValues);

  // Combine changed keys from old and new values
  const allDiffKeys = Array.from(
    new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})])
  );

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
            <Pressable
              key={log.id}
              onPress={() => setSelectedLog(log)}
              style={[
                styles.tableRow,
                { borderBottomColor: borderColor },
                idx === filtered.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={[styles.td, styles.colTs, styles.monoFont, { color: mutedColor }]}>
                {formatTimestamp(log.timestamp)}
              </Text>
              <View style={[styles.colEvent, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                <Text style={[styles.td, { color: textColor, fontWeight: '600' }]} numberOfLines={1}>
                  {log.event || log.action}
                </Text>
                <Lucide name="chevron-right" size={13} color={mutedColor} />
              </View>
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
            </Pressable>
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

      {/* ── Log Detail Modal / Slide-over Drawer ─────────────────────── */}
      {selectedLog && (
        <Modal transparent animationType="fade" visible={!!selectedLog} onRequestClose={() => setSelectedLog(null)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: cardBg, borderColor }]}>
              {/* Modal Header */}
              <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.modalTitle, { color: textColor }]}>
                      {selectedLog.event || selectedLog.action}
                    </Text>
                    {selectedLog.type && (
                      <View style={[styles.badge, { backgroundColor: TYPE_STYLE[selectedLog.type]?.bg || '#DBEAFE' }]}>
                        <Text style={[styles.badgeText, { color: TYPE_STYLE[selectedLog.type]?.text || '#1E40AF' }]}>
                          {selectedLog.type}
                        </Text>
                      </View>
                    )}
                    {selectedLog.status && (
                      <View style={[styles.badge, { backgroundColor: STATUS_STYLE[selectedLog.status]?.bg || '#D1FAE5' }]}>
                        <View style={[styles.statusDot, { backgroundColor: STATUS_STYLE[selectedLog.status]?.dot || '#10B981' }]} />
                        <Text style={[styles.badgeText, { color: STATUS_STYLE[selectedLog.status]?.text || '#065F46' }]}>
                          {selectedLog.status}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.modalSub, { color: mutedColor }]}>
                    Event ID: {selectedLog.id}
                  </Text>
                </View>
                <Pressable style={styles.closeBtn} onPress={() => setSelectedLog(null)}>
                  <Lucide name="x" size={18} color={textColor} />
                </Pressable>
              </View>

              <ScrollView style={{ flex: 1, padding: SPACING[20] }} showsVerticalScrollIndicator={false}>
                {/* Section 1: Event Metadata */}
                <Text style={[styles.sectionHeading, { color: textColor }]}>Event Metadata</Text>
                <View style={[styles.metaGrid, { backgroundColor: inputBg, borderColor }]}>
                  <View style={styles.metaCell}>
                    <Text style={[styles.metaLabel, { color: mutedColor }]}>Timestamp</Text>
                    <Text style={[styles.metaVal, styles.monoFont, { color: textColor }]}>
                      {formatTimestamp(selectedLog.timestamp)}
                    </Text>
                  </View>

                  <View style={styles.metaCell}>
                    <Text style={[styles.metaLabel, { color: mutedColor }]}>Actor / User</Text>
                    <Text style={[styles.metaVal, { color: textColor }]}>{selectedLog.actor}</Text>
                  </View>

                  <View style={styles.metaCell}>
                    <Text style={[styles.metaLabel, { color: mutedColor }]}>IP Address</Text>
                    <Text style={[styles.metaVal, styles.monoFont, { color: textColor }]}>{selectedLog.ipAddress}</Text>
                  </View>

                  <View style={styles.metaCell}>
                    <Text style={[styles.metaLabel, { color: mutedColor }]}>Entity Name</Text>
                    <Text style={[styles.metaVal, { color: textColor }]}>{selectedLog.entityName}</Text>
                  </View>

                  <View style={styles.metaCell}>
                    <Text style={[styles.metaLabel, { color: mutedColor }]}>Action</Text>
                    <Text style={[styles.metaVal, { color: colors.brand[600], fontWeight: '700' }]}>{selectedLog.action}</Text>
                  </View>

                  <View style={styles.metaCell}>
                    <Text style={[styles.metaLabel, { color: mutedColor }]}>Resource Path</Text>
                    <Text style={[styles.metaVal, styles.monoFont, { color: textColor }]}>{selectedLog.resource}</Text>
                  </View>
                </View>

                {/* Section 2: Affected Primary Keys */}
                {keyObj && Object.keys(keyObj).length > 0 && (
                  <>
                    <Text style={[styles.sectionHeading, { color: textColor, marginTop: SPACING[16] }]}>Target Identifiers (Primary Keys)</Text>
                    <View style={[styles.codeBox, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderColor }]}>
                      <Text style={[styles.codeText, { color: textColor }]}>
                        {JSON.stringify(keyObj, null, 2)}
                      </Text>
                    </View>
                  </>
                )}

                {/* Section 3: Detailed Property Diff Table */}
                <Text style={[styles.sectionHeading, { color: textColor, marginTop: SPACING[16] }]}>
                  Property Changes & Payload Diff
                </Text>

                {allDiffKeys.length > 0 ? (
                  <View style={[styles.diffTable, { borderColor }]}>
                    <View style={[styles.diffHeader, { backgroundColor: inputBg, borderBottomColor: borderColor }]}>
                      <Text style={[styles.diffTh, { flex: 2, color: mutedColor }]}>PROPERTY FIELD</Text>
                      <Text style={[styles.diffTh, { flex: 3, color: mutedColor }]}>PREVIOUS VALUE</Text>
                      <Text style={[styles.diffTh, { flex: 3, color: mutedColor }]}>UPDATED VALUE</Text>
                    </View>
                    {allDiffKeys.map((key) => {
                      const prevVal = oldObj?.[key] !== undefined ? String(oldObj[key]) : '—';
                      const newVal = newObj?.[key] !== undefined ? String(newObj[key]) : '—';
                      return (
                        <View key={key} style={[styles.diffRow, { borderBottomColor: borderColor }]}>
                          <Text style={[styles.diffCellKey, { flex: 2, color: textColor }]}>{key}</Text>
                          <View style={{ flex: 3 }}>
                            <Text style={[styles.diffCellOld, { color: isDark ? '#FCA5A5' : '#DC2626' }]}>{prevVal}</Text>
                          </View>
                          <View style={{ flex: 3 }}>
                            <Text style={[styles.diffCellNew, { color: isDark ? '#6EE7B7' : '#059669' }]}>{newVal}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={[styles.codeBox, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderColor }]}>
                    <Text style={[styles.codeText, { color: textColor }]}>
                      {selectedLog.changes ? (
                        (() => {
                          try {
                            return JSON.stringify(JSON.parse(selectedLog.changes), null, 2);
                          } catch {
                            return selectedLog.changes;
                          }
                        })()
                      ) : (
                        'No detailed property changes recorded for this event.'
                      )}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalContent: {
    width: '100%',
    maxWidth: 720,
    maxHeight: '85%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSub: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: SPACING[8],
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 10,
    borderWidth: 1,
    padding: SPACING[12],
    gap: SPACING[12],
  },
  metaCell: {
    width: '47%',
    gap: 2,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaVal: {
    fontSize: 13,
  },
  codeBox: {
    padding: SPACING[12],
    borderRadius: 8,
    borderWidth: 1,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  diffTable: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  diffHeader: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[12],
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  diffTh: {
    fontSize: 11,
    fontWeight: '700',
  },
  diffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  diffCellKey: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  diffCellOld: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  diffCellNew: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});
