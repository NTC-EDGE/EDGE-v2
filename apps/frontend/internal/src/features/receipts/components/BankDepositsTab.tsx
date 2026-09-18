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
import { BankDepositDto, OfficialReceiptDto } from '@edge/api';

interface BankDepositsTabProps {
  deposits: BankDepositDto[];
  isLoading: boolean;
  undepositedReceipts: OfficialReceiptDto[];
  onOpenDepositModal: () => void;
  onViewDeposit?: (d: BankDepositDto) => void;
}

export function BankDepositsTab({
  deposits,
  isLoading,
  undepositedReceipts,
  onOpenDepositModal,
}: BankDepositsTabProps) {
  const { colors } = useTheme();

  const undepositedTotal = undepositedReceipts.reduce((sum, r) => sum + r.amount, 0);
  const totalDeposited = deposits.reduce((sum, d) => sum + d.totalAmount, 0);

  return (
    <View style={styles.container}>
      {/* Top Banner Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>UNDEPOSITED COLLECTIONS ON HAND</Text>
          <Text style={[styles.statNumber, { color: '#D97706' }]}>
            ₱{undepositedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={[styles.statSub, { color: colors.neutral[600] }]}>{undepositedReceipts.length} receipts awaiting deposit</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>TOTAL REMITTED TO AGDB</Text>
          <Text style={[styles.statNumber, { color: '#059669' }]}>
            ₱{totalDeposited.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={[styles.statSub, { color: colors.neutral[600] }]}>{deposits.length} deposit slips recorded</Text>
        </View>

        <TouchableOpacity
          onPress={onOpenDepositModal}
          disabled={undepositedReceipts.length === 0}
          style={[
            styles.createDepositBtn,
            { backgroundColor: colors.brand.primary },
            undepositedReceipts.length === 0 && { opacity: 0.6 },
          ]}
        >
          <Lucide name="dollar-sign" size={20} color="#fff" />
          <View>
            <Text style={styles.depositBtnTitle}>Create Bank Deposit</Text>
            <Text style={styles.depositBtnSub}>Remit pending collections</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Deposits Feed */}
      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.brand.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading Bank Deposits...</Text>
        </View>
      ) : deposits.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Lucide name="credit-card" size={40} color={colors.neutral[400]} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Bank Deposits Recorded</Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>
            Group collections and create validated bank deposit slip entries to reconcile collections.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.tableScroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.table, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={[styles.tableHeaderRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.th, { flex: 1.5, color: colors.neutral[600] }]}>DEPOSIT SLIP #</Text>
              <Text style={[styles.th, { flex: 2, color: colors.neutral[600] }]}>DEPOSITARY BANK & ACCOUNT</Text>
              <Text style={[styles.th, { flex: 1.2, color: colors.neutral[600] }]}>DATE</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center', color: colors.neutral[600] }]}>ITEMS</Text>
              <Text style={[styles.th, { flex: 1.5, textAlign: 'right', color: colors.neutral[600] }]}>TOTAL AMOUNT</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center', color: colors.neutral[600] }]}>STATUS</Text>
            </View>

            {deposits.map((d) => (
              <View key={d.id} style={[styles.tableRow, { borderBottomColor: colors.neutral[100] }]}>
                <View style={{ flex: 1.5 }}>
                  <Text style={[styles.slipNum, { color: colors.text }]}>{d.depositSlipNumber}</Text>
                  {d.depositedByUserName && (
                    <Text style={[styles.depositedBy, { color: colors.textMuted }]}>By: {d.depositedByUserName}</Text>
                  )}
                </View>

                <View style={{ flex: 2 }}>
                  <Text style={[styles.bankName, { color: colors.text }]}>{d.bankName}</Text>
                  <Text style={[styles.bankAcct, { color: colors.textMuted }]}>Acct #{d.accountNumber} ({d.accountName})</Text>
                </View>

                <View style={{ flex: 1.2 }}>
                  <Text style={[styles.depositDate, { color: colors.neutral[700] }]}>{new Date(d.depositDate).toLocaleDateString()}</Text>
                </View>

                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={[styles.itemsCount, { color: colors.neutral[700] }]}>{d.linkedReceiptsCount} ORs</Text>
                </View>

                <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                  <Text style={styles.totalAmount}>
                    ₱{d.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.breakdownText}>
                    Cash: ₱{d.cashAmount.toFixed(2)} | Chk: ₱{d.checkAmount.toFixed(2)}
                  </Text>
                </View>

                <View style={{ flex: 1, alignItems: 'center' }}>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{d.status.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            ))}
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
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 220,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    marginVertical: 4,
  },
  statSub: {
    fontSize: 11,
  },
  createDepositBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 220,
    justifyContent: 'center',
  },
  depositBtnTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  depositBtnSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
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
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  slipNum: {
    fontSize: 13,
    fontWeight: '800',
  },
  depositedBy: {
    fontSize: 11,
  },
  bankName: {
    fontSize: 13,
    fontWeight: '600',
  },
  bankAcct: {
    fontSize: 11,
  },
  depositDate: {
    fontSize: 12,
  },
  itemsCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  breakdownText: {
    fontSize: 10,
    color: '#64748B',
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
});
