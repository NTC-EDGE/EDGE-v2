import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Icon, SPACING, TYPOGRAPHY } from '@edge/ui';
import { Application } from '../../data/applicationsData';

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
  const isReadyForPayment =
    app.status === 'READY_FOR_PAYMENT' ||
    (typeof app.soaNumber === 'string' && app.soaNumber.length > 0);

  const isPaymentSubmitted =
    typeof app.remarks === 'string' &&
    app.remarks.toLowerCase().includes('payment submitted');

  if (!isReadyForPayment && !app.soaNumber) {
    return null;
  }

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.headerTitleRow}>
          <View style={styles.iconCircle}>
            <Icon name="credit-card" size={20} color="#0284C7" />
          </View>
          <View style={styles.headerTexts}>
            <Text style={styles.headerTitle}>Order of Payment & Billing Notice</Text>
            <Text style={styles.headerSubtitle}>
              {isPaymentSubmitted
                ? 'Payment details submitted — pending Cashier verification'
                : 'Statement of Account has been issued by the Regional Accountant'}
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

      <View style={[styles.bodyGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
        <View style={styles.infoCol}>
          <Text style={styles.fieldLabel}>Statement of Account No.</Text>
          <Text style={styles.fieldValuePrimary}>{app.soaNumber || 'SOA Issued'}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.fieldLabel}>Application Ref</Text>
          <Text style={styles.fieldValue}>#{app.referenceNumber}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.fieldLabel}>Status Description</Text>
          <Text style={styles.fieldValue}>
            {typeof app.remarks === 'string' && app.remarks.length > 0
              ? app.remarks
              : 'Statement of Account approved. Please review your billing documents and proceed to payment.'}
          </Text>
        </View>
      </View>

      <View style={[styles.actionRow, { flexDirection: isDesktop ? 'row' : 'column', gap: 10 }]}>
        <View style={styles.docButtonsGroup}>
          {onViewSoa && (
            <TouchableOpacity style={styles.viewDocBtn} onPress={onViewSoa} activeOpacity={0.75}>
              <Icon name="file-text" size={14} color="#0369A1" />
              <Text style={styles.viewDocBtnText}>View SOA Document</Text>
            </TouchableOpacity>
          )}

          {onViewOp && (
            <TouchableOpacity style={styles.viewDocBtn} onPress={onViewOp} activeOpacity={0.75}>
              <Icon name="file" size={14} color="#0369A1" />
              <Text style={styles.viewDocBtnText}>View Order of Payment</Text>
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
  fieldValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#1E293B',
  },
  fieldValuePrimary: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0284C7',
  },
  actionRow: {
    marginTop: 6,
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
