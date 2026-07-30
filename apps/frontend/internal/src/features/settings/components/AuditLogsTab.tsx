import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide, SkeletonLoader } from '@edge/ui';
import { useAdminAuditLogs } from '@edge/api';

export function AuditLogsTab() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { logs, totalCount, isLoading, isError, refetch } = useAdminAuditLogs(page, 15, searchTerm);

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Audit Logs & System Activity</Text>
          <Text style={styles.subtitle}>
            Track system operations, staff actions, database changes, and security events.
          </Text>
        </View>

        <Pressable style={styles.refreshButton} onPress={() => refetch()}>
          <Lucide name="refresh-cw" size={16} color={COLORS.neutral[700]} />
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Lucide name="search" size={18} color={COLORS.neutral[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by action, entity, or user ID..."
          placeholderTextColor={COLORS.neutral[400]}
          value={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
            setPage(1);
          }}
        />
        {searchTerm.length > 0 && (
          <Pressable onPress={() => setSearchTerm('')}>
            <Lucide name="x" size={16} color={COLORS.neutral[400]} />
          </Pressable>
        )}
      </View>

      {/* Loading state */}
      {isLoading && (
        <View style={styles.card}>
          <SkeletonLoader height={40} borderRadius={0} style={{ marginBottom: 8 }} />
          <SkeletonLoader height={40} borderRadius={0} style={{ marginBottom: 8 }} />
          <SkeletonLoader height={40} borderRadius={0} />
        </View>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <View style={styles.centeredState}>
          <Lucide name="alert-triangle" size={32} color={COLORS.brand[600]} />
          <Text style={styles.stateText}>Failed to load audit logs from API server.</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {/* Logs Table / List */}
      {!isLoading && !isError && (
        <View style={styles.card}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colHeader, { flex: 2 }]}>Action & Entity</Text>
            <Text style={[styles.colHeader, { flex: 2 }]}>User / Origin</Text>
            <Text style={[styles.colHeader, { flex: 3 }]}>Changes / Payload</Text>
            <Text style={[styles.colHeader, { flex: 2, textAlign: 'right' }]}>Timestamp</Text>
          </View>

          {logs.length === 0 ? (
            <View style={styles.emptyState}>
              <Lucide name="shield" size={32} color={COLORS.neutral[300]} />
              <Text style={styles.emptyText}>No audit log records found.</Text>
            </View>
          ) : (
            logs.map((log) => (
              <View key={log.id} style={styles.tableRow}>
                <View style={{ flex: 2, gap: 2 }}>
                  <Text style={styles.actionBadge}>{log.action}</Text>
                  <Text style={styles.entityName}>{log.entityName} ({log.entityId || 'N/A'})</Text>
                </View>

                <View style={{ flex: 2, gap: 2 }}>
                  <Text style={styles.userId}>{log.userId || 'System Automatic'}</Text>
                </View>

                <View style={{ flex: 3 }}>
                  <Text style={styles.changesText} numberOfLines={2}>
                    {log.changes || 'No property diff data recorded'}
                  </Text>
                </View>

                <View style={{ flex: 2, alignItems: 'flex-end' }}>
                  <Text style={styles.timeText}>
                    {new Date(log.timestamp).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))
          )}

          {/* Pagination */}
          <View style={styles.paginationRow}>
            <Text style={styles.paginationText}>
              Showing {logs.length} of {totalCount} entries
            </Text>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                disabled={page <= 1}
                style={[styles.pageButton, page <= 1 && styles.buttonDisabled]}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
              >
                <Lucide name="chevron-left" size={16} color={COLORS.neutral[700]} />
                <Text style={styles.pageButtonText}>Previous</Text>
              </Pressable>

              <Pressable
                disabled={page * 15 >= totalCount}
                style={[styles.pageButton, page * 15 >= totalCount && styles.buttonDisabled]}
                onPress={() => setPage((p) => p + 1)}
              >
                <Text style={styles.pageButtonText}>Next</Text>
                <Lucide name="chevron-right" size={16} color={COLORS.neutral[700]} />
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING[16],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING[12],
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[900],
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.neutral[500],
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING[12],
    paddingVertical: 8,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  refreshText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.neutral[700],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.input,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.neutral[900],
  },
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    ...SHADOWS.card,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
    backgroundColor: COLORS.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  colHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.neutral[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[16],
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  actionBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.brand[700],
  },
  entityName: {
    fontSize: 13,
    color: COLORS.neutral[800],
  },
  userId: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.neutral[700],
  },
  changesText: {
    fontSize: 12,
    color: COLORS.neutral[600],
  },
  timeText: {
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  centeredState: {
    padding: SPACING[32],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  emptyState: {
    padding: SPACING[32],
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.neutral[500],
  },
  retryButton: {
    paddingHorizontal: SPACING[16],
    paddingVertical: 8,
    backgroundColor: COLORS.brand[600],
    borderRadius: RADIUS.button,
  },
  retryText: {
    color: COLORS.neutral.white,
    fontWeight: '600',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
    backgroundColor: COLORS.neutral[50],
  },
  paginationText: {
    fontSize: 13,
    color: COLORS.neutral[600],
  },
  pageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING[12],
    paddingVertical: 6,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.button,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.neutral[700],
  },
});
