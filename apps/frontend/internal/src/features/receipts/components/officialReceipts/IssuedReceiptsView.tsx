import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { OfficialReceiptDto } from '@edge/api';
import { styles } from './officialReceiptsStyles';

interface IssuedReceiptsViewProps {
  receipts: OfficialReceiptDto[];
  isLoadingReceipts: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  paymentMethodFilter: string;
  onPaymentMethodFilterChange: (m: string) => void;
  canEditReceiptPerm: boolean;
  canCancelReceiptPerm: boolean;
  onViewReceipt: (r: OfficialReceiptDto) => void;
  onEditReceipt: (r: OfficialReceiptDto) => void;
  onCancelReceipt: (r: OfficialReceiptDto) => void;
}

const isReceiptIssued = (status: unknown): boolean => status === 'Issued' || status === 0;
const isReceiptDeposited = (status: unknown): boolean => status === 'Deposited' || status === 1;
const isReceiptCancelled = (status: unknown): boolean => status === 'Cancelled' || status === 2;

const getReceiptStatusLabel = (status: unknown): string => {
  if (isReceiptIssued(status)) return 'ISSUED';
  if (isReceiptDeposited(status)) return 'DEPOSITED';
  if (isReceiptCancelled(status)) return 'CANCELLED';
  return String(status ?? '').toUpperCase();
};

export function IssuedReceiptsView({
  receipts,
  isLoadingReceipts,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentMethodFilter,
  onPaymentMethodFilterChange,
  canEditReceiptPerm,
  canCancelReceiptPerm,
  onViewReceipt,
  onEditReceipt,
  onCancelReceipt,
}: IssuedReceiptsViewProps) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, gap: 12 }}>
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
                  {pm === 'all' ? 'All Methods' : pm}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Table */}
      {isLoadingReceipts ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading Official Receipts...</Text>
        </View>
      ) : receipts.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Lucide name="printer" size={40} color={colors.neutral[400]} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Official Receipts Found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            {searchQuery || statusFilter !== 'all' || paymentMethodFilter !== 'all'
              ? 'No official receipts matched your search filters.'
              : 'Start by collecting a pending application payment or issuing a walk-in official receipt.'}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.tableScroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.tableCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
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
              const isIssued = isReceiptIssued(r.status);
              const isDeposited = isReceiptDeposited(r.status);
              const isCancelled = isReceiptCancelled(r.status);

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
                    {r.issuedByUserName && (
                      <Text style={[styles.opRef, { color: colors.brand.primary, fontWeight: '600' }]} numberOfLines={1}>
                        Cashier: {r.issuedByUserName}
                      </Text>
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
                      ₱{(r.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                        {getReceiptStatusLabel(r.status)}
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
                    {canEditReceiptPerm && isIssued && (
                      <TouchableOpacity
                        onPress={() => onEditReceipt(r)}
                        style={[styles.actionIconBtn, { backgroundColor: colors.neutral[100] }]}
                        accessibilityLabel="Edit Receipt"
                      >
                        <Lucide name="edit-2" size={15} color={colors.neutral[700]} />
                      </TouchableOpacity>
                    )}

                    {/* Cancel Button */}
                    {canCancelReceiptPerm && isIssued && (
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
