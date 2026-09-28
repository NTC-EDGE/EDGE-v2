import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { usePermissions } from '../../shell/context/PermissionContext';
import { OrBookletDto } from '@edge/api';

interface OrBookletsTabProps {
  booklets: OrBookletDto[];
  isLoading: boolean;
  onOpenBundleModal: () => void;
  onEditBooklet?: (b: OrBookletDto) => void;
  onTransferBooklet?: (b: OrBookletDto) => void;
}

const isBookletActive = (status: unknown): boolean => {
  return status === 'Active' || status === 0;
};

const isBookletExhausted = (status: unknown): boolean => {
  return status === 'Exhausted' || status === 1;
};

const getBookletStatusLabel = (status: unknown): string => {
  if (isBookletActive(status)) return 'ACTIVE';
  if (isBookletExhausted(status)) return 'EXHAUSTED';
  if (status === 'Cancelled' || status === 2) return 'CANCELLED';
  if (status === 'Archived' || status === 3) return 'ARCHIVED';
  return String(status ?? '').toUpperCase();
};

export function OrBookletsTab({
  booklets,
  isLoading,
  onOpenBundleModal,
  onEditBooklet,
  onTransferBooklet,
}: OrBookletsTabProps) {
  const { colors } = useTheme();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const { hasPermission, isSuperAdmin, isAdmin } = usePermissions();

  const canRegisterBundle = isSuperAdmin || isAdmin || hasPermission('receipts.bundle_entry');
  const canEditSeries = isSuperAdmin || isAdmin || hasPermission('receipts.edit') || hasPermission('receipts.bundle_entry');
  const canTransferCustody = isSuperAdmin || isAdmin || hasPermission('receipts.bundle_entry') || hasPermission('receipts.edit');

  if (isLoading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading OR Booklets...</Text>
      </View>
    );
  }

  const activeCount = booklets.filter((b) => isBookletActive(b.status)).length;
  const exhaustedCount = booklets.filter((b) => isBookletExhausted(b.status)).length;
  const totalRemaining = booklets
    .filter((b) => isBookletActive(b.status))
    .reduce((sum, b) => sum + (b.remainingCount || 0), 0);

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
        {canRegisterBundle && (
          <TouchableOpacity
            onPress={onOpenBundleModal}
            style={[styles.addBundleBtn, { backgroundColor: colors.brand.primary }]}
          >
            <Lucide name="plus" size={18} color="#fff" />
            <Text style={styles.addBundleBtnText}>Register Booklet Bundle</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Booklets Feed */}
      {booklets.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Lucide name="book" size={48} color={colors.neutral[400]} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No OR Booklets Registered</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Register accountable form 51 bundles (50 pcs per booklet) to start issuing sequential official receipts.
          </Text>
          {canRegisterBundle && (
            <TouchableOpacity
              onPress={onOpenBundleModal}
              style={[styles.emptyActionBtn, { backgroundColor: colors.brand.primary }]}
            >
              <Text style={styles.emptyActionBtnText}>Register First Booklet</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.bookletGrid} showsVerticalScrollIndicator={false}>
          {booklets.map((b) => {
            const percentUsed = b.totalCount > 0 ? Math.round((b.issuedCount / b.totalCount) * 100) : 0;
            const isActive = isBookletActive(b.status);
            const isEditable = b.issuedCount === 0;
            const isMenuOpen = activeMenuId === b.id;

            return (
              <View
                key={b.id}
                style={[
                  styles.bookletCard,
                  { backgroundColor: colors.cardBg, borderColor: colors.border },
                  !isActive && styles.bookletCardInactive,
                  isMenuOpen && { zIndex: 999, elevation: 30 },
                ]}
              >
                <View style={[styles.bookletHeader, isMenuOpen && { zIndex: 1000 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.bookletNum, { color: colors.text }]}>{b.bookletNumber}</Text>
                    <Text style={[styles.seriesRange, { color: colors.neutral[600] }]}>
                      {b.formattedStartNumber} → {b.formattedEndNumber}
                    </Text>
                  </View>

                  <View style={styles.headerRight}>
                    <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusExhausted]}>
                      <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextExhausted]}>
                        {getBookletStatusLabel(b.status)}
                      </Text>
                    </View>

                    {/* 3-dots Kebab Action Button */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setActiveMenuId((prev) => (prev === b.id ? null : b.id))}
                      style={[
                        styles.kebabBtn,
                        { backgroundColor: isMenuOpen ? colors.brand.indigoLight : colors.neutral[100] },
                      ]}
                    >
                      <Lucide
                        name="more-vertical"
                        size={16}
                        color={isMenuOpen ? colors.brand.primary : colors.neutral[700]}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* 3-dots Popover Menu */}
                  {isMenuOpen && (canEditSeries || canTransferCustody) && (
                    <View
                      style={[
                        styles.popoverMenu,
                        {
                          backgroundColor: '#FFFFFF',
                          borderColor: colors.neutral[300],
                        },
                      ]}
                    >
                      {canEditSeries && (
                        isEditable ? (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => {
                              setActiveMenuId(null);
                              onEditBooklet?.(b);
                            }}
                            style={styles.popoverItem}
                          >
                            <Lucide name="edit-3" size={15} color={colors.neutral[700]} />
                            <Text style={[styles.popoverText, { color: colors.neutral[900] }]}>Edit Series</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={[styles.popoverItem, { opacity: 0.55 }]}>
                            <Lucide name="lock" size={15} color={colors.neutral[400]} />
                            <View>
                              <Text style={[styles.popoverText, { color: colors.neutral[500] }]}>Edit Series</Text>
                              <Text style={{ fontSize: 9, color: colors.neutral[400], fontWeight: '500' }}>
                                Locked ({b.issuedCount} issued)
                              </Text>
                            </View>
                          </View>
                        )
                      )}

                      {canTransferCustody && (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => {
                            setActiveMenuId(null);
                            onTransferBooklet?.(b);
                          }}
                          style={[styles.popoverItem, canEditSeries && { borderTopWidth: 1, borderTopColor: colors.neutral[200] }]}
                        >
                          <Lucide name="repeat" size={15} color={colors.brand.primary} />
                          <Text style={[styles.popoverText, { color: colors.brand.primary, fontWeight: '700' }]}>
                            Transfer Custody
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
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
                    <Lucide name="user" size={14} color={colors.brand.primary} />
                    <Text style={[styles.metaText, { color: colors.text, fontWeight: '600' }]}>
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
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    position: 'relative',
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
    position: 'relative',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  kebabBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  popoverMenu: {
    position: 'absolute',
    top: 36,
    right: 0,
    width: 190,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 99,
    zIndex: 9999,
    paddingVertical: 4,
  },
  popoverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  popoverText: {
    fontSize: 13,
    fontWeight: '600',
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
