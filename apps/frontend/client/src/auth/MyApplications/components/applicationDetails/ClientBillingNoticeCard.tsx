import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Icon, SPACING, TYPOGRAPHY } from '@edge/ui';
import { Application } from '../../data/applicationsData';
import {
  formatCurrency,
  getEffectiveLineItems,
  getEffectiveTotalAmount,
} from '../../utils/clientSoaReportGenerator';

interface ClientBillingNoticeCardProps {
  app: Application;
  isDesktop: boolean;
  onProceedToPayment: () => void;
  onViewSoa?: () => void;
  onViewOp?: () => void;
}

export function ClientBillingNoticeCard({
  app,
  isDesktop,
  onProceedToPayment,
  onViewSoa,
  onViewOp,
}: ClientBillingNoticeCardProps) {
  const [showFeeDetails, setShowFeeDetails] = useState(true);

  const isReadyForPayment =
    app.status === 'READY_FOR_PAYMENT' ||
    (typeof app.soaNumber === 'string' && app.soaNumber.length > 0);

  const isPaymentSubmitted =
    (typeof app.remarks === 'string' &&
      (app.remarks.toLowerCase().includes('payment submitted') ||
       app.remarks.toLowerCase().includes('waiting for cashier verification') ||
       app.remarks.toLowerCase().includes('verification in progress'))) ||
    (app.op !== undefined &&
      typeof app.op.status === 'string' &&
      (app.op.status.toLowerCase() === 'processing' || app.op.status.toLowerCase() === 'paid'));

  if (!isReadyForPayment && !app.soaNumber) {
    return null;
  }

  const lineItems = getEffectiveLineItems(app);
  const totalAmount = getEffectiveTotalAmount(app);
  const refNum = app.referenceNumber || (app.id ? app.id.slice(0, 8).toUpperCase() : 'NTC-REF');
  const soaNumber = app.soaNumber || `SOA-${refNum}`;
  const dueDateFormatted = app.dueDate
    ? new Date(app.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '30 days from issuance';

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.headerTitleRow}>
          <View style={styles.iconCircle}>
            <Icon name="credit-card" size={20} color="#0284C7" />
          </View>
          <View style={styles.headerTexts}>
            <Text style={styles.headerTitle}>Order of Payment &amp; Billing Assessment</Text>
            <Text style={styles.headerSubtitle}>
              {isPaymentSubmitted
                ? 'Payment details submitted — pending Cashier verification'
                : 'Statement of Account has been assessed and issued for settlement'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusPill,
            isPaymentSubmitted ? styles.statusPillSubmitted : styles.statusPillActionRequired,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isPaymentSubmitted ? '#0284C7' : '#D97706' },
            ]}
          />
          <Text
            style={[
              styles.statusPillText,
              { color: isPaymentSubmitted ? '#0284C7' : '#B45309' },
            ]}
          >
            {isPaymentSubmitted ? 'Verification in Progress' : 'Action Required: Pay Fees'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Primary Figures Grid */}
      <View style={[styles.bodyGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
        <View style={styles.infoCol}>
          <Text style={styles.fieldLabel}>Statement of Account No.</Text>
          <Text style={styles.fieldValuePrimary}>{soaNumber}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.fieldLabel}>Total Assessment Due</Text>
          <Text style={styles.totalDueHighlight}>{formatCurrency(totalAmount)}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.fieldLabel}>Payment Due Date</Text>
          <View style={styles.dueDateBadge}>
            <Icon name="calendar" size={13} color="#B45309" />
            <Text style={styles.dueDateBadgeText}>{dueDateFormatted}</Text>
          </View>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.fieldLabel}>Application Ref</Text>
          <Text style={styles.fieldValueRef}>#{refNum}</Text>
        </View>
      </View>

      {/* Fee Particulars Table Toggle Header */}
      <TouchableOpacity
        style={styles.tableToggleHeader}
        onPress={() => setShowFeeDetails((prev) => !prev)}
        activeOpacity={0.7}
      >
        <View style={styles.toggleHeaderLeft}>
          <Icon name="file-text" size={14} color="#0369A1" />
          <Text style={styles.tableToggleTitle}>
            ASSESSMENT FEE BREAKDOWN ({lineItems.length} ITEM{lineItems.length === 1 ? '' : 'S'})
          </Text>
        </View>
        <Icon
          name={showFeeDetails ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#0369A1"
        />
      </TouchableOpacity>

      {/* Inline Fee Items Breakdown Table */}
      {showFeeDetails && (
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.thCell, { flex: 3 }]}>Particular / Description</Text>
            <Text style={[styles.thCell, { width: 55, textAlign: 'center' }]}>Units</Text>
            <Text style={[styles.thCell, { width: 90, textAlign: 'right' }]}>Rate</Text>
            <Text style={[styles.thCell, { width: 100, textAlign: 'right' }]}>Amount</Text>
          </View>

          {lineItems.map((item, idx) => {
            const units = typeof item.noOfUnits === 'number' && item.noOfUnits > 0 ? item.noOfUnits : 1;
            const rate = typeof item.feeRate === 'number' && !isNaN(item.feeRate) ? item.feeRate : (item.amount / units);
            const amount = typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : rate * units;

            return (
              <View key={item.id || idx} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowEven]}>
                <View style={{ flex: 3, paddingVertical: 2 }}>
                  <Text style={styles.particularName}>{item.particular}</Text>
                  <Text style={styles.particularSub}>
                    Code: {item.itemCode || 'NTC-FEE'} • Validity: {item.validityYears || 1} yr(s)
                  </Text>
                </View>
                <Text style={[styles.tdCell, { width: 55, textAlign: 'center' }]}>{units}</Text>
                <Text style={[styles.tdCell, { width: 90, textAlign: 'right' }]}>
                  {formatCurrency(rate).replace('PHP ', '')}
                </Text>
                <Text style={[styles.tdCell, { width: 100, textAlign: 'right', fontWeight: '700', color: '#0F172A' }]}>
                  {formatCurrency(amount).replace('PHP ', '')}
                </Text>
              </View>
            );
          })}

          <View style={styles.tableTotalRow}>
            <Text style={styles.tableTotalLabel}>Total Amount Payable:</Text>
            <Text style={styles.tableTotalAmount}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>
      )}

      {/* Action Buttons Toolbar */}
      <View style={[styles.actionRow, { flexDirection: isDesktop ? 'row' : 'column', gap: 10 }]}>
        <View style={styles.docButtonsGroup}>
          {onViewSoa && (
            <TouchableOpacity style={styles.viewDocBtn} onPress={onViewSoa} activeOpacity={0.75}>
              <Icon name="file-text" size={14} color="#0369A1" />
              <Text style={styles.viewDocBtnText}>View SOA Document</Text>
            </TouchableOpacity>
          )}

          {onViewOp && (
            <TouchableOpacity style={styles.viewDocBtnOp} onPress={onViewOp} activeOpacity={0.75}>
              <Icon name="credit-card" size={14} color="#047857" />
              <Text style={styles.viewDocBtnTextOp}>View Order of Payment</Text>
            </TouchableOpacity>
          )}
        </View>

        {isPaymentSubmitted ? (
          <View style={styles.submittedBanner}>
            <Icon name="clock" size={16} color="#0369A1" />
            <Text style={styles.submittedBannerText}>
              Payment submitted — awaiting Cashier verification and official receipt generation.
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.payBtn}
            onPress={onProceedToPayment}
            activeOpacity={0.85}
          >
            <Icon name="dollar-sign" size={16} color="#FFFFFF" />
            <Text style={styles.payBtnText}>Proceed to Payment</Text>
            <Icon name="arrow-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderLeftWidth: 4,
    borderLeftColor: '#0284C7',
    padding: SPACING[20],
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px -1px rgba(2, 132, 199, 0.08)',
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 260,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  headerSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusPillActionRequired: {
    backgroundColor: '#FEF3C7',
  },
  statusPillSubmitted: {
    backgroundColor: '#E0F2FE',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  bodyGrid: {
    gap: 14,
    marginBottom: 14,
  },
  infoCol: {
    flex: 1,
  },
  fieldLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 2,
  },
  fieldValueRef: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#0F172A',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  fieldValuePrimary: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0284C7',
  },
  totalDueHighlight: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  dueDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  dueDateBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#B45309',
  },
  tableToggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  toggleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tableToggleTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0369A1',
    letterSpacing: 0.5,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 14,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  thCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableRowEven: {
    backgroundColor: '#F8FAFC',
  },
  tdCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#1E293B',
  },
  particularName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
  },
  particularSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  tableTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
  },
  tableTotalLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    textTransform: 'uppercase',
  },
  tableTotalAmount: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0284C7',
  },
  actionRow: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docButtonsGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  viewDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewDocBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#0369A1',
  },
  viewDocBtnOp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewDocBtnTextOp: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#047857',
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  payBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#FFFFFF',
  },
  submittedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    flex: 1,
  },
  submittedBannerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#0369A1',
    flex: 1,
  },
});
