import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { PaymentBreakdown, PendingPaymentDto } from '@edge/api';
import { styles } from './issueReceiptStyles';

interface PreferredPaymentBannerProps {
  preferredBreakdown: PaymentBreakdown | null;
  pendingPayment?: PendingPaymentDto | null;
  issuanceStrategy: 'Consolidated' | 'SplitPerMode';
  selectedSplitIndex: number;
  onSelectStrategy: (strat: 'Consolidated' | 'SplitPerMode') => void;
  onSelectSplitItem: (idx: number) => void;
}

export function PreferredPaymentBanner({
  preferredBreakdown,
  pendingPayment,
  issuanceStrategy,
  selectedSplitIndex,
  onSelectStrategy,
  onSelectSplitItem,
}: PreferredPaymentBannerProps) {
  const { colors } = useTheme();

  if (!preferredBreakdown) {
    if (!pendingPayment) return null;
    const hasCheckDetails = Boolean(pendingPayment.checkBank || pendingPayment.checkNumber || pendingPayment.paymentMethod === 'Check');
    const hasOnlineDetails = Boolean(pendingPayment.paymentReferenceNumber || pendingPayment.paymentMethod === 'Online');

    if (!hasCheckDetails && !hasOnlineDetails) return null;

    return (
      <View style={[styles.preferredCard, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
        <View style={styles.preferredCardHeader}>
          <View style={styles.preferredTitleRow}>
            <Lucide name={hasCheckDetails ? 'credit-card' : 'globe'} size={15} color="#0284C7" />
            <Text style={[styles.preferredTitleText, { color: '#0369A1' }]}>
              CLIENT SUBMITTED PAYMENT DETAILS
            </Text>
          </View>
          <View style={[styles.preferredBadge, { backgroundColor: '#E0F2FE' }]}>
            <Text style={[styles.preferredBadgeText, { color: '#0284C7' }]}>
              {hasCheckDetails ? 'Check Payment' : 'Online Payment'}
            </Text>
          </View>
        </View>
        <View style={styles.preferredItemsRow}>
          {hasCheckDetails && (
            <View style={[styles.preferredItemPill, { backgroundColor: '#FFFFFF', borderColor: '#BAE6FD' }]}>
              <Lucide name="credit-card" size={13} color="#0284C7" />
              <Text style={[styles.preferredItemText, { color: '#0369A1' }]}>
                <Text style={{ fontWeight: '700' }}>Drawee Bank:</Text> {pendingPayment.checkBank || 'Not Specified'}
                {pendingPayment.checkNumber ? ` • Check #: ${pendingPayment.checkNumber}` : ''}
                {pendingPayment.checkDate ? ` • Date: ${new Date(pendingPayment.checkDate).toLocaleDateString('en-US')}` : ''}
              </Text>
            </View>
          )}
          {hasOnlineDetails && (
            <View style={[styles.preferredItemPill, { backgroundColor: '#FFFFFF', borderColor: '#BBF7D0' }]}>
              <Lucide name="globe" size={13} color="#16A34A" />
              <Text style={[styles.preferredItemText, { color: '#15803D' }]}>
                <Text style={{ fontWeight: '700' }}>Reference #:</Text> {pendingPayment.paymentReferenceNumber || 'Pending Gateway Verification'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.preferredCard, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
      <View style={styles.preferredCardHeader}>
        <View style={styles.preferredTitleRow}>
          <Lucide name="layers" size={15} color="#6D28D9" />
          <Text style={[styles.preferredTitleText, { color: '#4C1D95' }]}>
            CLIENT PREFERRED PAYMENT MODE
          </Text>
        </View>
        <View style={[styles.preferredBadge, { backgroundColor: '#EDE9FE' }]}>
          <Text style={[styles.preferredBadgeText, { color: '#6D28D9' }]}>
            {preferredBreakdown.isCombination ? 'Combination / Split Mode' : preferredBreakdown.items[0]?.mode}
          </Text>
        </View>
      </View>

      <View style={styles.preferredItemsRow}>
        {preferredBreakdown.items.map((item, idx) => (
          <View
            key={idx}
            style={[
              styles.preferredItemPill,
              { backgroundColor: '#FFFFFF', borderColor: '#C4B5FD' },
            ]}
          >
            <Lucide
              name={item.mode === 'Cash' ? 'dollar-sign' : item.mode === 'Check' ? 'credit-card' : 'globe'}
              size={13}
              color="#6D28D9"
            />
            <Text style={[styles.preferredItemText, { color: '#3B0764' }]}>
              <Text style={{ fontWeight: '700' }}>{item.mode}:</Text> ₱
              {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {item.mode === 'Check' && item.checkNumber ? ` (${item.checkBank || 'Bank'} #${item.checkNumber})` : ''}
              {item.mode === 'Online' && item.referenceNumber ? ` (Ref: ${item.referenceNumber})` : ''}
            </Text>
          </View>
        ))}
      </View>

      {/* Flexible Regional Approach: Combination Strategy Selector */}
      {preferredBreakdown.isCombination && (
        <View style={styles.regionalStrategySection}>
          <Text style={[styles.strategySectionHeading, { color: '#6D28D9' }]}>
            REGIONAL OR ISSUANCE STRATEGY
          </Text>
          <View style={styles.strategyOptionsRow}>
            {/* Option A: Single Consolidated OR */}
            <TouchableOpacity
              style={[
                styles.strategyOptionCard,
                { borderColor: '#DDD6FE', backgroundColor: '#FFFFFF' },
                issuanceStrategy === 'Consolidated' && { borderColor: colors.brand.primary, backgroundColor: '#EFF6FF' },
              ]}
              onPress={() => onSelectStrategy('Consolidated')}
            >
              <View style={[styles.strategyRadio, issuanceStrategy === 'Consolidated' && { borderColor: colors.brand.primary }]}>
                {issuanceStrategy === 'Consolidated' && <View style={[styles.strategyRadioInner, { backgroundColor: colors.brand.primary }]} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.strategyTitle, issuanceStrategy === 'Consolidated' && { color: colors.brand.primary }]}>
                  Single Consolidated OR
                </Text>
                <Text style={styles.strategySub}>
                  Issues 1 official receipt for total ₱
                  {preferredBreakdown.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} covering all modes
                </Text>
              </View>
            </TouchableOpacity>

            {/* Option B: Split OR per Mode */}
            <TouchableOpacity
              style={[
                styles.strategyOptionCard,
                { borderColor: '#DDD6FE', backgroundColor: '#FFFFFF' },
                issuanceStrategy === 'SplitPerMode' && { borderColor: colors.brand.primary, backgroundColor: '#EFF6FF' },
              ]}
              onPress={() => onSelectStrategy('SplitPerMode')}
            >
              <View style={[styles.strategyRadio, issuanceStrategy === 'SplitPerMode' && { borderColor: colors.brand.primary }]}>
                {issuanceStrategy === 'SplitPerMode' && <View style={[styles.strategyRadioInner, { backgroundColor: colors.brand.primary }]} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.strategyTitle, issuanceStrategy === 'SplitPerMode' && { color: colors.brand.primary }]}>
                  Split OR (1 OR per Mode)
                </Text>
                <Text style={styles.strategySub}>
                  Issues separate receipts for each mode (e.g. 1 OR for Check, 1 OR for Cash)
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* When SplitPerMode is active, allow Cashier to select which mode portion to issue */}
          {issuanceStrategy === 'SplitPerMode' && (
            <View style={styles.splitModesContainer}>
              <Text style={[styles.splitModesLabel, { color: colors.neutral[700] }]}>
                Select Mode Portion to Issue Now:
              </Text>
              <View style={styles.splitModesChipsRow}>
                {preferredBreakdown.items.map((item, idx) => {
                  const isSelected = selectedSplitIndex === idx;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => onSelectSplitItem(idx)}
                      style={[
                        styles.splitModeBtn,
                        { borderColor: colors.neutral[300], backgroundColor: '#FFFFFF' },
                        isSelected && { borderColor: colors.brand.primary, backgroundColor: colors.brand.primary },
                      ]}
                    >
                      <Lucide
                        name={item.mode === 'Cash' ? 'dollar-sign' : item.mode === 'Check' ? 'credit-card' : 'globe'}
                        size={13}
                        color={isSelected ? '#fff' : colors.brand.primary}
                      />
                      <Text style={[styles.splitModeBtnText, isSelected && { color: '#fff', fontWeight: '700' }]}>
                        OR for {item.mode}: ₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Active Strategy & Amount Summary Pill for Cashier */}
          <View
            style={[
              styles.strategyActiveBanner,
              {
                backgroundColor: issuanceStrategy === 'Consolidated' ? '#EFF6FF' : '#F0FDF4',
                borderColor: issuanceStrategy === 'Consolidated' ? '#BFDBFE' : '#BBF7D0',
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Lucide
                name={issuanceStrategy === 'Consolidated' ? 'layers' : 'scissors'}
                size={13}
                color={issuanceStrategy === 'Consolidated' ? '#1D4ED8' : '#15803D'}
              />
              <Text
                style={[
                  styles.strategyActiveBannerText,
                  { color: issuanceStrategy === 'Consolidated' ? '#1E40AF' : '#166534' },
                ]}
              >
                {issuanceStrategy === 'Consolidated'
                  ? 'Active Strategy: Single Consolidated OR (All Payment Modes)'
                  : `Active Strategy: Split OR — ${preferredBreakdown.items[selectedSplitIndex]?.mode ?? 'Selected'} Portion`}
              </Text>
            </View>
            <Text
              style={[
                styles.strategyActiveBannerSub,
                { color: issuanceStrategy === 'Consolidated' ? '#1E40AF' : '#166534' },
              ]}
            >
              Amount for this OR: ₱
              {(issuanceStrategy === 'Consolidated'
                ? preferredBreakdown.totalAmount
                : (preferredBreakdown.items[selectedSplitIndex]?.amount ?? 0)
              ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
