import React from 'react';
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
import { CashierRcdReportDto, CancelledOrReportDto } from '@edge/api';

interface CashierReportsTabProps {
  reportSubTab: 'rcd' | 'cancelled';
  onReportSubTabChange: (tab: 'rcd' | 'cancelled') => void;
  reportDateRange: 'today' | 'this_week' | 'this_month';
  onReportDateRangeChange: (range: 'today' | 'this_week' | 'this_month') => void;
  rcdReport?: CashierRcdReportDto;
  isLoadingRcd: boolean;
  cancelledReport?: CancelledOrReportDto;
  isLoadingCancelled: boolean;
}

export function CashierReportsTab({
  reportSubTab,
  onReportSubTabChange,
  reportDateRange,
  onReportDateRangeChange,
  rcdReport,
  isLoadingRcd,
  cancelledReport,
  isLoadingCancelled,
}: CashierReportsTabProps) {
  const { colors } = useTheme();

  const handlePrint = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <View style={styles.container}>
      {/* Sub-tab & Date Range Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={styles.subTabRow}>
          <TouchableOpacity
            onPress={() => onReportSubTabChange('rcd')}
            style={[
              styles.subTabBtn,
              { backgroundColor: colors.neutral[100] },
              reportSubTab === 'rcd' && { backgroundColor: colors.brand.primary },
            ]}
          >
            <Lucide
              name="file-text"
              size={16}
              color={reportSubTab === 'rcd' ? '#fff' : colors.neutral[700]}
            />
            <Text
              style={[
                styles.subTabBtnText,
                { color: colors.neutral[700] },
                reportSubTab === 'rcd' && { color: '#fff' },
              ]}
            >
              Report of Collections & Deposits (RCD)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onReportSubTabChange('cancelled')}
            style={[
              styles.subTabBtn,
              { backgroundColor: colors.neutral[100] },
              reportSubTab === 'cancelled' && { backgroundColor: colors.brand.primary },
            ]}
          >
            <Lucide
              name="slash"
              size={16}
              color={reportSubTab === 'cancelled' ? '#fff' : colors.neutral[700]}
            />
            <Text
              style={[
                styles.subTabBtnText,
                { color: colors.neutral[700] },
                reportSubTab === 'cancelled' && { color: '#fff' },
              ]}
            >
              Report of Cancelled ORs
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.rangeAndPrintRow, { borderTopColor: colors.border }]}>
          {/* Date Range Chips */}
          <View style={styles.rangeRow}>
            {(['today', 'this_week', 'this_month'] as const).map((r) => {
              const isSelected = reportDateRange === r;
              const label = r === 'today' ? 'Today' : r === 'this_week' ? 'This Week' : 'This Month';
              return (
                <TouchableOpacity
                  key={r}
                  onPress={() => onReportDateRangeChange(r)}
                  style={[
                    styles.rangeChip,
                    { backgroundColor: colors.neutral[100] },
                    isSelected && { backgroundColor: colors.neutral[800] },
                  ]}
                >
                  <Text
                    style={[
                      styles.rangeChipText,
                      { color: colors.neutral[700] },
                      isSelected && { color: '#fff' },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={handlePrint}
            style={[styles.printBtn, { backgroundColor: colors.brand.primary }]}
          >
            <Lucide name="printer" size={16} color="#fff" />
            <Text style={styles.printBtnText}>Print Official Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* RCD Tab View */}
      {reportSubTab === 'rcd' && (
        <>
          {isLoadingRcd ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={colors.brand.primary} />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>Generating RCD Report...</Text>
            </View>
          ) : rcdReport ? (
            <ScrollView style={styles.reportScroll} showsVerticalScrollIndicator={false}>
              {/* Official Report Header */}
              <View style={[styles.officialHeader, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.agencyTitle, { color: colors.textMuted }]}>REPUBLIC OF THE PHILIPPINES</Text>
                <Text style={[styles.deptTitle, { color: colors.text }]}>NATIONAL TELECOMMUNICATIONS COMMISSION</Text>
                <Text style={[styles.reportTitle, { color: colors.brand.primary }]}>REPORT OF COLLECTIONS AND DEPOSITS (RCD)</Text>
                <Text style={[styles.periodText, { color: colors.neutral[600] }]}>
                  Period Covered: {new Date(rcdReport.fromDate).toLocaleDateString()} to{' '}
                  {new Date(rcdReport.toDate).toLocaleDateString()}
                </Text>
              </View>

              {/* Summary Cards */}
              <View style={styles.summaryGrid}>
                <View style={[styles.sumCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Text style={[styles.sumCardLabel, { color: colors.textMuted }]}>TOTAL COLLECTIONS</Text>
                  <Text style={[styles.sumCardVal, { color: colors.brand.primary }]}>
                    ₱{rcdReport.summary.totalCollections.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text style={[styles.sumCardMeta, { color: colors.textMuted }]}>{rcdReport.summary.totalTransactionsCount} transactions</Text>
                </View>

                <View style={[styles.sumCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Text style={[styles.sumCardLabel, { color: colors.textMuted }]}>CASH COLLECTIONS</Text>
                  <Text style={[styles.sumCardVal, { color: colors.text }]}>
                    ₱{rcdReport.summary.totalCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>

                <View style={[styles.sumCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Text style={[styles.sumCardLabel, { color: colors.textMuted }]}>CHECK COLLECTIONS</Text>
                  <Text style={[styles.sumCardVal, { color: colors.text }]}>
                    ₱{rcdReport.summary.totalCheck.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>

                <View style={[styles.sumCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Text style={[styles.sumCardLabel, { color: colors.textMuted }]}>TOTAL REMITTED / DEPOSITED</Text>
                  <Text style={[styles.sumCardVal, { color: colors.semantic.success }]}>
                    ₱{rcdReport.summary.totalDeposited.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>

                <View style={[styles.sumCard, { borderColor: '#FCD34D', backgroundColor: '#FFFBEB' }]}>
                  <Text style={[styles.sumCardLabel, { color: '#92400E' }]}>UNDEPOSITED CASH ON HAND</Text>
                  <Text style={[styles.sumCardVal, { color: '#B45309' }]}>
                    ₱{rcdReport.summary.netUndepositedCashOnHand.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>

              {/* Collections Details Table */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>A. Breakdown of Official Receipts Issued</Text>
              </View>
              <View style={[styles.table, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={[styles.tableHeaderRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.th, { flex: 1.2, color: colors.neutral[600] }]}>OR NUMBER</Text>
                  <Text style={[styles.th, { flex: 2, color: colors.neutral[600] }]}>PAYOR</Text>
                  <Text style={[styles.th, { flex: 1, color: colors.neutral[600] }]}>METHOD</Text>
                  <Text style={[styles.th, { flex: 1.2, textAlign: 'right', color: colors.neutral[600] }]}>AMOUNT</Text>
                </View>
                {rcdReport.collections.length === 0 ? (
                  <View style={styles.emptyTableRow}>
                    <Text style={[styles.emptyTableText, { color: colors.neutral[400] }]}>No collections issued during this period.</Text>
                  </View>
                ) : (
                  rcdReport.collections.map((c) => (
                    <View key={c.id} style={[styles.tableRow, { borderBottomColor: colors.neutral[100] }]}>
                      <Text style={[styles.td, { flex: 1.2, fontWeight: '700', fontFamily: 'monospace', color: colors.text }]}>
                        {c.officialReceiptNumber}
                      </Text>
                      <Text style={[styles.td, { flex: 2, color: colors.text }]}>{c.payorName}</Text>
                      <Text style={[styles.td, { flex: 1, color: colors.text }]}>{c.paymentMethod}</Text>
                      <Text style={[styles.td, { flex: 1.2, textAlign: 'right', fontWeight: '700', color: colors.text }]}>
                        ₱{c.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  ))
                )}
              </View>

              {/* Deposits Details Table */}
              <View style={[styles.sectionHeader, { marginTop: 16 }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>B. Bank Remittances & Deposit Slips</Text>
              </View>
              <View style={[styles.table, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={[styles.tableHeaderRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.th, { flex: 1.5, color: colors.neutral[600] }]}>DEPOSIT SLIP #</Text>
                  <Text style={[styles.th, { flex: 2, color: colors.neutral[600] }]}>DEPOSITARY BANK</Text>
                  <Text style={[styles.th, { flex: 1.2, color: colors.neutral[600] }]}>DATE</Text>
                  <Text style={[styles.th, { flex: 1.2, textAlign: 'right', color: colors.neutral[600] }]}>AMOUNT</Text>
                </View>
                {rcdReport.deposits.length === 0 ? (
                  <View style={styles.emptyTableRow}>
                    <Text style={[styles.emptyTableText, { color: colors.neutral[400] }]}>No bank deposit slips recorded during this period.</Text>
                  </View>
                ) : (
                  rcdReport.deposits.map((d) => (
                    <View key={d.id} style={[styles.tableRow, { borderBottomColor: colors.neutral[100] }]}>
                      <Text style={[styles.td, { flex: 1.5, fontWeight: '700', color: colors.text }]}>{d.depositSlipNumber}</Text>
                      <Text style={[styles.td, { flex: 2, color: colors.text }]}>{d.bankName} (Acct #{d.accountNumber})</Text>
                      <Text style={[styles.td, { flex: 1.2, color: colors.text }]}>{new Date(d.depositDate).toLocaleDateString()}</Text>
                      <Text style={[styles.td, { flex: 1.2, textAlign: 'right', fontWeight: '700', color: colors.semantic.success }]}>
                        ₱{d.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          ) : null}
        </>
      )}

      {/* Cancelled ORs Tab View */}
      {reportSubTab === 'cancelled' && (
        <>
          {isLoadingCancelled ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={colors.brand.primary} />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading Cancelled ORs...</Text>
            </View>
          ) : cancelledReport ? (
            <ScrollView style={styles.reportScroll} showsVerticalScrollIndicator={false}>
              <View style={[styles.officialHeader, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.agencyTitle, { color: colors.textMuted }]}>REPUBLIC OF THE PHILIPPINES</Text>
                <Text style={[styles.deptTitle, { color: colors.text }]}>NATIONAL TELECOMMUNICATIONS COMMISSION</Text>
                <Text style={[styles.reportTitle, { color: colors.semantic.error }]}>
                  REPORT OF CANCELLED / SPOILED OFFICIAL RECEIPTS
                </Text>
                <Text style={[styles.periodText, { color: colors.neutral[600] }]}>
                  Period Covered: {new Date(cancelledReport.fromDate).toLocaleDateString()} to{' '}
                  {new Date(cancelledReport.toDate).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>TOTAL CANCELLED RECEIPTS</Text>
                  <Text style={[styles.statNumber, { color: colors.semantic.error }]}>
                    {cancelledReport.totalCancelledCount}
                  </Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>TOTAL VOID VALUE</Text>
                  <Text style={[styles.statNumber, { color: colors.semantic.error }]}>
                    ₱{cancelledReport.totalCancelledAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>

              <View style={[styles.table, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={[styles.tableHeaderRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.th, { flex: 1.2, color: colors.neutral[600] }]}>OR NUMBER</Text>
                  <Text style={[styles.th, { flex: 1.5, color: colors.neutral[600] }]}>PAYOR</Text>
                  <Text style={[styles.th, { flex: 1, textAlign: 'right', color: colors.neutral[600] }]}>AMOUNT</Text>
                  <Text style={[styles.th, { flex: 1.2, color: colors.neutral[600] }]}>CANCELLED DATE</Text>
                  <Text style={[styles.th, { flex: 2, color: colors.neutral[600] }]}>CANCELLATION REASON</Text>
                </View>
                {cancelledReport.items.length === 0 ? (
                  <View style={styles.emptyTableRow}>
                    <Text style={[styles.emptyTableText, { color: colors.neutral[400] }]}>No official receipts cancelled during this period.</Text>
                  </View>
                ) : (
                  cancelledReport.items.map((i) => (
                    <View key={i.id} style={[styles.tableRow, { borderBottomColor: colors.neutral[100] }]}>
                      <Text style={[styles.td, { flex: 1.2, fontWeight: '700', color: colors.semantic.error, fontFamily: 'monospace' }]}>
                        {i.officialReceiptNumber}
                      </Text>
                      <Text style={[styles.td, { flex: 1.5, color: colors.text }]}>{i.payorName}</Text>
                      <Text style={[styles.td, { flex: 1, textAlign: 'right', color: colors.text }]}>
                        ₱{i.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                      <Text style={[styles.td, { flex: 1.2, color: colors.text }]}>
                        {i.cancelledAt ? new Date(i.cancelledAt).toLocaleDateString() : '-'}
                      </Text>
                      <Text style={[styles.td, { flex: 2, fontStyle: 'italic', color: colors.neutral[600] }]}>
                        {i.cancellationReason ?? 'Spoiled Form'}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  subTabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  subTabBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  rangeAndPrintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  rangeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  rangeChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  printBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  centerBox: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    marginTop: 8,
  },
  reportScroll: {
    flex: 1,
  },
  officialHeader: {
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  agencyTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  deptTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginVertical: 2,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
  periodText: {
    fontSize: 11,
    marginTop: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  sumCard: {
    flex: 1,
    minWidth: 160,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
  },
  sumCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sumCardVal: {
    fontSize: 18,
    fontWeight: '900',
    marginVertical: 4,
  },
  sumCardMeta: {
    fontSize: 11,
  },
  sectionHeader: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    marginVertical: 4,
  },
  table: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  th: {
    fontSize: 10,
    fontWeight: '800',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  td: {
    fontSize: 13,
  },
  emptyTableRow: {
    padding: 16,
    alignItems: 'center',
  },
  emptyTableText: {
    fontSize: 12,
  },
});
