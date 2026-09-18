import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { OrBookletDto } from '@edge/api';

interface OrBookletsTabProps {
  booklets: OrBookletDto[];
  isLoading: boolean;
  onOpenBundleModal: () => void;
}

export function OrBookletsTab({
  booklets,
  isLoading,
  onOpenBundleModal,
}: OrBookletsTabProps) {
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading OR Booklets...</Text>
      </View>
    );
  }

  const activeCount = booklets.filter((b) => b.status === 'Active').length;
  const exhaustedCount = booklets.filter((b) => b.status === 'Exhausted').length;
  const totalRemaining = booklets
    .filter((b) => b.status === 'Active')
    .reduce((sum, b) => sum + b.remainingCount, 0);

  return (
    <View style={styles.container}>
      {/* Top Banner Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Lucide name="book-open" size={20} color={colors.brand.primary} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{activeCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Active Booklets</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Lucide name="layers" size={20} color={colors.semantic.success} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{totalRemaining}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Available Receipts (Pieces)</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Lucide name="archive" size={20} color={colors.neutral[600]} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{exhaustedCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Exhausted / Completed</Text>
        </View>
        <TouchableOpacity
          onPress={onOpenBundleModal}
          style={[styles.addBundleBtn, { backgroundColor: colors.brand.primary }]}
        >
          <Lucide name="plus" size={18} color="#fff" />
          <Text style={styles.addBundleBtnText}>Register Booklet Bundle</Text>
        </TouchableOpacity>
      </View>

      {/* Booklets Feed */}
      {booklets.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Lucide name="book" size={48} color={colors.neutral[400]} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No OR Booklets Registered</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Register accountable form 51 bundles (50 pcs per booklet) to start issuing sequential official receipts.
          </Text>
          <TouchableOpacity
            onPress={onOpenBundleModal}
            style={[styles.emptyActionBtn, { backgroundColor: colors.brand.primary }]}
          >
            <Text style={styles.emptyActionBtnText}>Register First Booklet</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.bookletGrid} showsVerticalScrollIndicator={false}>
          {booklets.map((b) => {
            const percentUsed = b.totalCount > 0 ? Math.round((b.issuedCount / b.totalCount) * 100) : 0;
            const isActive = b.status === 'Active';

            return (
              <View
                key={b.id}
                style={[
                  styles.bookletCard,
                  { backgroundColor: colors.cardBg, borderColor: colors.border },
                  !isActive && styles.bookletCardInactive,
                ]}
              >
                <View style={styles.bookletHeader}>
                  <View>
                    <Text style={[styles.bookletNum, { color: colors.text }]}>{b.bookletNumber}</Text>
                    <Text style={[styles.seriesRange, { color: colors.neutral[600] }]}>
                      {b.formattedStartNumber} → {b.formattedEndNumber}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusExhausted]}>
                    <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextExhausted]}>
                      {b.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={[styles.progressTrack, { backgroundColor: colors.neutral[200] }]}>
                    <View style={[styles.progressFill, { width: `${Math.min(100, percentUsed)}%`, backgroundColor: colors.brand.primary }]} />
                  </View>
                  <View style={styles.progressMeta}>
                    <Text style={[styles.progressText, { color: colors.textMuted }]}>
                      Next Serial: <Text style={{ fontWeight: '700', color: colors.text }}>{b.formattedCurrentNumber}</Text>
                    </Text>
                    <Text style={[styles.progressText, { color: colors.textMuted }]}>
                      {b.issuedCount}/{b.totalCount} ({percentUsed}%)
                    </Text>
                  </View>
                </View>

                {/* Metadata */}
                <View style={[styles.bookletFooter, { borderTopColor: colors.border }]}>
                  <View style={styles.metaItem}>
                    <Lucide name="user" size={14} color={colors.neutral[500]} />
                    <Text style={[styles.metaText, { color: colors.neutral[600] }]}>
                      {b.assignedUserName ?? 'All Cashiers (Unassigned)'}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Lucide name="calendar" size={14} color={colors.neutral[500]} />
                    <Text style={[styles.metaText, { color: colors.neutral[600] }]}>
                      {new Date(b.receivedDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerBox: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 13,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 160,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  addBundleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 200,
  },
  addBundleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 400,
    marginTop: 6,
    marginBottom: 16,
  },
  emptyActionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyActionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  bookletGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 24,
  },
  bookletCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bookletCardInactive: {
    backgroundColor: '#F8FAFC',
    opacity: 0.8,
  },
  bookletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookletNum: {
    fontSize: 13,
    fontWeight: '800',
  },
  seriesRange: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusExhausted: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextActive: {
    color: '#15803D',
  },
  statusTextExhausted: {
    color: '#64748B',
  },
  progressContainer: {
    marginVertical: 10,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressText: {
    fontSize: 11,
  },
  bookletFooter: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
  },
});
