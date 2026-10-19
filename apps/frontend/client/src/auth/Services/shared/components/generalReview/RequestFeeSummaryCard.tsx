import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TYPOGRAPHY, Icon } from '@edge/ui';
import { SectionCard } from '../../../../../shared/formPreview';
import { RequestFeeCalculationResult } from '../../../requests/types/requestFeeTypes';

interface RequestFeeSummaryCardProps {
  computation: RequestFeeCalculationResult;
  title?: string;
}

export function RequestFeeSummaryCard({
  computation,
  title = 'Statutory Fee Computation & Assessment',
}: RequestFeeSummaryCardProps) {
  const formatCurrency = (val: number): string => {
    return `₱${val.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <SectionCard icon="credit-card" title={title} accentColor="#0F2C59">
      <View style={styles.container}>
        <View style={styles.freeBadgeBanner}>
          <Icon name="check-circle" size={16} color="#059669" />
          <View style={styles.freeBannerTextWrapper}>
            <Text style={styles.freeBadgeTitle}>Free of Charge (No Statutory Fees)</Text>
            <Text style={styles.freeBadgeText}>
              Pursuant to the NTC Citizen&apos;s Charter, all requests and complaints submitted by consumers or subscribers are completely free of charge. No processing fees or documentary stamp taxes apply.
            </Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.particularCol]}>Particular</Text>
          <Text style={[styles.headerCell, styles.qtyCol]}>Qty</Text>
          <Text style={[styles.headerCell, styles.rateCol]}>Rate</Text>
          <Text style={[styles.headerCell, styles.amountCol]}>Amount</Text>
        </View>

        {computation.lineItems.map((item, idx) => (
          <View
            key={`req-fee-item-${idx}-${item.itemCode}`}
            style={[styles.row, idx % 2 === 1 && styles.rowAlt]}
          >
            <View style={styles.particularCol}>
              <Text style={styles.particularTitle}>{item.particular}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
            <Text style={[styles.cellText, styles.qtyCol]}>1</Text>
            <Text style={[styles.cellText, styles.rateCol]}>
              {formatCurrency(item.feeRate)}
            </Text>
            <Text style={[styles.amountText, styles.amountCol]}>
              {formatCurrency(item.amount)}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>Total Payable Amount</Text>
            <Text style={styles.formulaText}>Formula: {computation.formulaApplied}</Text>
          </View>
          <Text style={styles.totalValue}>{formatCurrency(computation.totalAmount)}</Text>
        </View>
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  freeBadgeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  freeBannerTextWrapper: {
    flex: 1,
    gap: 2,
  },
  freeBadgeTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  freeBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#047857',
    lineHeight: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
  },
  headerCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  rowAlt: {
    backgroundColor: '#F8FAFC',
  },
  particularCol: {
    flex: 3,
  },
  qtyCol: {
    flex: 1,
    textAlign: 'center',
  },
  rateCol: {
    flex: 1.5,
    textAlign: 'right',
  },
  amountCol: {
    flex: 1.5,
    textAlign: 'right',
  },
  particularTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  itemDescription: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  cellText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#475569',
  },
  amountText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  totalLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2C59',
  },
  formulaText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  totalValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 17,
    fontWeight: '800',
    color: '#059669',
  },
});
