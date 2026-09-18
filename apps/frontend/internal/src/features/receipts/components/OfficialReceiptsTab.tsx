import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { OfficialReceiptDto, NextAvailableOrDto } from '@edge/api';

interface OfficialReceiptsTabProps {
  receipts: OfficialReceiptDto[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  paymentMethodFilter: string;
  onPaymentMethodFilterChange: (m: string) => void;
  nextOr?: NextAvailableOrDto;
  onOpenIssueModal: () => void;
  onViewReceipt: (r: OfficialReceiptDto) => void;
  onEditReceipt: (r: OfficialReceiptDto) => void;
  onCancelReceipt: (r: OfficialReceiptDto) => void;
}

export function OfficialReceiptsTab({
  receipts,
  isLoading,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentMethodFilter,
  onPaymentMethodFilterChange,
  nextOr,
  onOpenIssueModal,
  onViewReceipt,
  onEditReceipt,
  onCancelReceipt,
}: OfficialReceiptsTabProps) {
  const { colors } = useTheme();

  const totalCollections = receipts
    .filter((r) => r.status !== 'Cancelled')
    .reduce((sum, r) => sum + r.amount, 0);

  const issuedCount = receipts.filter((r) => r.status === 'Issued').length;
  const depositedCount = receipts.filter((r) => r.status === 'Deposited').length;
  const cancelledCount = receipts.filter((r) => r.status === 'Cancelled').length;

  return (
    <View style={styles.container}>
      {/* Top Banner & Quick Action */}
      <View style={styles.bannerRow}>
        <View style={[styles.statBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>TOTAL REVENUE COLLECTED</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            ₱{totalCollections.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={styles.statBadges}>
            <Text style={[styles.statSubText, { color: colors.neutral[600] }]}>{receipts.length} total receipts</Text>
            <Text style={[styles.statDot, { color: colors.neutral[400] }]}>•</Text>
            <Text style={[styles.statSubText, { color: '#D97706' }]}>{issuedCount} on-hand</Text>
            <Text style={[styles.statDot, { color: colors.neutral[400] }]}>•</Text>
            <Text style={[styles.statSubText, { color: '#059669' }]}>{depositedCount} deposited</Text>
            {cancelledCount > 0 && (
              <>
                <Text style={[styles.statDot, { color: colors.neutral[400] }]}>•</Text>
                <Text style={[styles.statSubText, { color: '#DC2626' }]}>{cancelledCount} void</Text>
              </>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={onOpenIssueModal}
          style={[styles.issueOrBtn, { backgroundColor: colors.brand.primary }]}
        >
          <View style={styles.issueIconCircle}>
            <Lucide name="plus" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.issueBtnTitle}>Issue Official Receipt</Text>
            <Text style={styles.issueBtnSubtitle}>
              {nextOr?.hasActiveBooklet
                ? `Next: ${nextOr.formattedOrNumber ?? ''}`
                : 'Accountable Form 51'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Filter Bar */}
      <View style={[styles.filterBar, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={[styles.searchContainer, { borderColor: colors.border }]}>
          <Lucide name="search" size={16} color={colors.neutral[400]} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by OR number, payor name, check number..."
            placeholderTextColor={colors.neutral[400]}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearSearchBtn}>
              <Lucide name="x" size={14} color={colors.neutral[500]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Chips */}
        <View style={styles.chipsRow}>
          {['all', 'Issued', 'Deposited', 'Cancelled'].map((st) => {
            const isSelected = statusFilter === st;
            return (
              <TouchableOpacity
                key={st}
                onPress={() => onStatusFilterChange(st)}
                style={[styles.filterChip, isSelected && { backgroundColor: colors.brand.primary }]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: colors.neutral[700] },
                    isSelected && { color: '#fff' },
                  ]}
                >
                  {st === 'all' ? 'All Status' : st}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Payment Method Chips */}
        <View style={styles.chipsRow}>
          {['all', 'Cash', 'Check', 'Online'].map((pm) => {
            const isSelected = paymentMethodFilter === pm;
            return (
              <TouchableOpacity
                key={pm}
                onPress={() => onPaymentMethodFilterChange(pm)}
                style={[styles.filterChip, isSelected && { backgroundColor: colors.brand.primary }]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: colors.neutral[700] },
                    isSelected && { color: '#fff' },
                  ]}
                >
                  {pm === 'all' ? 'All Modes' : pm}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Receipt Records Table */}
      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading Official Receipts...</Text>
        </View>
      ) : receipts.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Lucide name="inbox" size={40} color={colors.neutral[400]} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Receipts Found</Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>No official receipt records match the current filter criteria.</Text>
        </View>
      ) : (
        <ScrollView style={styles.tableScroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.table, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            {/* Table Header */}
            <View style={[styles.tableHeaderRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.th, { flex: 1.2, color: colors.neutral[600] }]}>OR NUMBER</Text>
              <Text style={[styles.th, { flex: 1.8, color: colors.neutral[600] }]}>PAYOR</Text>
              <Text style={[styles.th, { flex: 1.2, color: colors.neutral[600] }]}>MODE / REF</Text>
              <Text style={[styles.th, { flex: 1.2, textAlign: 'right', color: colors.neutral[600] }]}>AMOUNT</Text>
              <Text style={[styles.th, { flex: 1.2, textAlign: 'center', color: colors.neutral[600] }]}>STATUS</Text>
              <Text style={[styles.th, { flex: 1.4, textAlign: 'center', color: colors.neutral[600] }]}>ACTIONS</Text>
            </View>

            {/* Rows */}
            {receipts.map((r) => {
              const isIssued = r.status === 'Issued';
              const isDeposited = r.status === 'Deposited';
              const isCancelled = r.status === 'Cancelled';

              return (
                <View
                  key={r.id}
                  style={[
                    styles.tableRow,
                    { borderBottomColor: colors.neutral[100] },
                    isCancelled && styles.tableRowCancelled,
                  ]}
                >
                  <View style={{ flex: 1.2 }}>
                    <Text
                      style={[
                        styles.orNum,
                        { color: colors.text },
                        isCancelled && styles.textCancelled,
                      ]}
                    >
                      {r.officialReceiptNumber}
                    </Text>
                    <Text style={[styles.orDate, { color: colors.textMuted }]}>
                      {new Date(r.issuedAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={{ flex: 1.8 }}>
                    <Text
                      style={[
                        styles.payorName,
                        { color: colors.text },
                        isCancelled && styles.textCancelled,
                      ]}
                      numberOfLines={1}
                    >
                      {r.payorName}
                    </Text>
                    {r.opNumber && (
                      <Text style={[styles.opRef, { color: colors.textMuted }]}>OP: {r.opNumber}</Text>
                    )}
                  </View>

                  <View style={{ flex: 1.2 }}>
                    <Text style={[styles.payMethod, { color: colors.text }]}>{r.paymentMethod}</Text>
                    {r.checkNumber && (
                      <Text style={styles.checkRef} numberOfLines={1}>
                        #{r.checkNumber} ({r.checkBank})
                      </Text>
                    )}
                    {r.depositSlipNumber && (
                      <Text style={styles.depositRef} numberOfLines={1}>
                        DEP: {r.depositSlipNumber}
                      </Text>
                    )}
                  </View>

                  <View style={{ flex: 1.2, alignItems: 'flex-end' }}>
                    <Text
                      style={[
                        styles.amountText,
                        { color: colors.text },
                        isCancelled && styles.textCancelled,
                      ]}
                    >
                      ₱{r.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>

                  <View style={{ flex: 1.2, alignItems: 'center' }}>
                    <View
                      style={[
                        styles.statusBadge,
                        isIssued && styles.statusIssued,
                        isDeposited && styles.statusDeposited,
                        isCancelled && styles.statusCancelled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isIssued && styles.statusTextIssued,
                          isDeposited && styles.statusTextDeposited,
                          isCancelled && styles.statusTextCancelled,
                        ]}
                      >
                        {r.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flex: 1.4, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                    {/* View / Print Button */}
                    <TouchableOpacity
                      onPress={() => onViewReceipt(r)}
                      style={[styles.actionIconBtn, { backgroundColor: colors.neutral[100] }]}
                      accessibilityLabel="Preview Receipt"
                    >
                      <Lucide name="printer" size={15} color={colors.brand.primary} />
                    </TouchableOpacity>

                    {/* Edit Button */}
                    {isIssued && (
                      <TouchableOpacity
                        onPress={() => onEditReceipt(r)}
                        style={[styles.actionIconBtn, { backgroundColor: colors.neutral[100] }]}
                        accessibilityLabel="Edit Receipt"
                      >
                        <Lucide name="edit-2" size={15} color={colors.neutral[700]} />
                      </TouchableOpacity>
                    )}

                    {/* Cancel Button */}
                    {isIssued && (
                      <TouchableOpacity
                        onPress={() => onCancelReceipt(r)}
                        style={[styles.actionIconBtn, { backgroundColor: colors.neutral[100] }]}
                        accessibilityLabel="Cancel Receipt"
                      >
                        <Lucide name="slash" size={15} color={colors.semantic.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bannerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 2,
    minWidth: 260,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    marginVertical: 4,
  },
  statBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  statSubText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statDot: {
    fontSize: 10,
  },
  issueOrBtn: {
    flex: 1,
    minWidth: 240,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  issueIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  issueBtnTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  issueBtnSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  filterBar: {
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontSize: 13,
  },
  clearSearchBtn: {
    padding: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: '#F1F5F9',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  centerBox: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    marginTop: 8,
  },
  emptyBox: {
    padding: 32,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 11,
    marginTop: 4,
  },
  tableScroll: {
    flex: 1,
  },
  table: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  th: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  tableRowCancelled: {
    backgroundColor: '#FFF5F5',
  },
  orNum: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  orDate: {
    fontSize: 11,
  },
  payorName: {
    fontSize: 13,
    fontWeight: '600',
  },
  opRef: {
    fontSize: 11,
  },
  payMethod: {
    fontSize: 11,
    fontWeight: '700',
  },
  checkRef: {
    fontSize: 10,
    color: '#64748B',
  },
  depositRef: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  amountText: {
    fontSize: 13,
    fontWeight: '800',
  },
  textCancelled: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusIssued: {
    backgroundColor: '#FEF3C7',
  },
  statusDeposited: {
    backgroundColor: '#DCFCE7',
  },
  statusCancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextIssued: {
    color: '#B45309',
  },
  statusTextDeposited: {
    color: '#15803D',
  },
  statusTextCancelled: {
    color: '#DC2626',
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
