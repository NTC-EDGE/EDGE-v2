import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TYPOGRAPHY, Icon } from '@edge/ui';
import { SectionCard } from '../../../../../shared/formPreview';
import { LicenseFeeCalculationResult } from '../../../licenses/types/licenseFeeTypes';

interface LicenseFeeSummaryCardProps {
  computation: LicenseFeeCalculationResult;
  title?: string;
  isAssessmentOnly?: boolean;
}

export function LicenseFeeSummaryCard({
  computation,
  title = 'Statutory Fee Computation & Breakdown',
  isAssessmentOnly = false,
}: LicenseFeeSummaryCardProps) {
  const formatCurrency = (val: number): string => {
    return `₱${val.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <SectionCard icon="credit-card" title={title} accentColor="#0F2C59">
      <View style={styles.container}>
        {isAssessmentOnly && (
          <View style={styles.badgeBanner}>
            <Icon name="info" size={14} color="#0369A1" />
            <Text style={styles.badgeText}>
              Assessment Preview: Official statutory rates based on NTC Schedule of Fees for Licenses.
            </Text>
          </View>
        )}

        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.particularCol]}>Particular</Text>
          <Text style={[styles.headerCell, styles.qtyCol]}>Qty/Yr</Text>
          <Text style={[styles.headerCell, styles.rateCol]}>Rate</Text>
          <Text style={[styles.headerCell, styles.amountCol]}>Amount</Text>
        </View>

        {computation.lineItems.map((item, idx) => {
          const qtyText = item.isTax
            ? '1'
            : item.validityYears > 1
            ? `${item.validityYears} yrs`
            : item.noOfUnits > 1
            ? `${item.noOfUnits} units`
            : '1';

          return (
            <View
              key={`lic-fee-item-${idx}-${item.itemCode}`}
              style={[styles.row, idx % 2 === 1 && styles.rowAlt]}
            >
              <View style={styles.particularCol}>
                <Text style={styles.particularTitle}>{item.particular}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
              <Text style={[styles.cellText, styles.qtyCol]}>{qtyText}</Text>
              <Text style={[styles.cellText, styles.rateCol]}>
                {formatCurrency(item.feeRate)}
              </Text>
              <Text style={[styles.amountText, styles.amountCol]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          );
        })}

        <View style={styles.divider} />

        {/* Subtotal & DST */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sub-Total (Statutory Fees)</Text>
          <Text style={styles.summaryValue}>{formatCurrency(computation.subTotal)}</Text>
        </View>

        {computation.surchargeAmount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, styles.surchargeLabel]}>
              Late Renewal Surcharge Penalty
            </Text>
            <Text style={[styles.summaryValue, styles.surchargeLabel]}>
              {formatCurrency(computation.surchargeAmount)}
            </Text>
          </View>
        )}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Documentary Stamp Tax (DST)</Text>
          <Text style={styles.summaryValue}>{formatCurrency(computation.taxAmount)}</Text>
        </View>

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
  badgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#0369A1',
    flex: 1,
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
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  summaryLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
  },
  summaryValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  surchargeLabel: {
    color: '#DC2626',
    fontWeight: '600',
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
    color: '#0F2C59',
  },
});
