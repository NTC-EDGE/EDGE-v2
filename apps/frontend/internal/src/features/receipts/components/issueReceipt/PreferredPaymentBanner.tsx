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
      <View style={[styles.preferredCard, { backgroundColor: '#F0F9FF', borderColor: '#7DD3FC' }]}>
        <View style={styles.preferredCardHeader}>
          <View style={styles.preferredTitleRow}>
            <Lucide name={hasCheckDetails ? 'credit-card' : 'globe'} size={18} color="#0284C7" />
            <Text style={[styles.preferredTitleText, { color: '#0369A1' }]}>
              CLIENT SUBMITTED PAYMENT
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
              <Lucide name="credit-card" size={16} color="#0284C7" />
              <Text style={[styles.preferredItemText, { color: '#0369A1' }]}>
                <Text style={{ fontWeight: '800' }}>Drawee Bank:</Text> {pendingPayment.checkBank || 'Not Specified'}
                {pendingPayment.checkNumber ? ` • Check #: ${pendingPayment.checkNumber}` : ''}
                {pendingPayment.checkDate ? ` • Date: ${new Date(pendingPayment.checkDate).toLocaleDateString('en-US')}` : ''}
              </Text>
            </View>
          )}
          {hasOnlineDetails && (
            <View style={[styles.preferredItemPill, { backgroundColor: '#FFFFFF', borderColor: '#BBF7D0' }]}>
              <Lucide name="globe" size={16} color="#16A34A" />
              <Text style={[styles.preferredItemText, { color: '#15803D' }]}>
                <Text style={{ fontWeight: '800' }}>Reference #:</Text> {pendingPayment.paymentReferenceNumber || 'Pending Gateway Verification'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  const effectiveTotal = preferredBreakdown.totalAmount > 0 
    ? preferredBreakdown.totalAmount 
    : (pendingPayment?.amountDue ?? 0);

  return (
    <View style={[styles.preferredCard, { backgroundColor: '#F5F3FF', borderColor: '#C4B5FD' }]}>
      {/* Header with Title and Mode Badge */}
      <View style={styles.preferredCardHeader}>
        <View style={styles.preferredTitleRow}>
          <Lucide name="layers" size={20} color="#6D28D9" />
          <Text style={[styles.preferredTitleText, { color: '#4C1D95' }]}>
            CLIENT PAYMENT BREAKDOWN
          </Text>
        </View>
        <View style={[styles.preferredBadge, { backgroundColor: '#EDE9FE' }]}>
          <Text style={[styles.preferredBadgeText, { color: '#6D28D9' }]}>
            {preferredBreakdown.isCombination ? 'Combination / Split Payment' : `${preferredBreakdown.items[0]?.mode ?? 'Single'} Mode`}
          </Text>
        </View>
      </View>

      {/* Modes Breakdown Chips */}
      <View style={styles.preferredItemsRow}>
        {preferredBreakdown.items.map((item, idx) => {
          const isItemIssued = Boolean(item.isIssued || item.orNumber);
          return (
            <View
              key={idx}
              style={[
                styles.preferredItemPill,
                {
                  backgroundColor: isItemIssued ? '#F0FDF4' : '#FFFFFF',
                  borderColor: isItemIssued ? '#86EFAC' : '#DDD6FE',
                },
              ]}
            >
              <Lucide
                name={isItemIssued ? 'check-circle' : item.mode === 'Cash' ? 'dollar-sign' : item.mode === 'Check' ? 'credit-card' : 'globe'}
                size={16}
                color={isItemIssued ? '#16A34A' : '#6D28D9'}
              />
              <Text style={[styles.preferredItemText, { color: isItemIssued ? '#166534' : '#3B0764' }]}>
                <Text style={{ fontWeight: '800' }}>{item.mode}:</Text> ₱
                {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {item.mode === 'Check' && item.checkNumber ? ` (${item.checkBank || 'Bank'} #${item.checkNumber})` : ''}
                {item.mode === 'Online' && item.referenceNumber ? ` (Ref: ${item.referenceNumber})` : ''}
              </Text>
              {item.mode === 'Check' && Boolean(item.proofFileName || item.proofFileId) && (
                <View style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Lucide name="paperclip" size={11} color="#1D4ED8" />
                  <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#1D4ED8' }}>
                    {item.proofFileName ? `Proof: ${item.proofFileName}` : 'Proof Attached'}
                  </Text>
                </View>
              )}
              {isItemIssued && (
                <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#166534' }}>
                    ISSUED (OR #{item.orNumber})
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Senior-Friendly Strategy Selector for Combination Mode */}
      {preferredBreakdown.isCombination && (() => {
        const hasAnyIssued = preferredBreakdown.items.some((i) => i.isIssued || i.orNumber);

        return (
          <View style={styles.regionalStrategySection}>
            <Text style={[styles.strategySectionHeading, { color: '#5B21B6' }]}>
              {hasAnyIssued ? 'SPLIT RECEIPT STATUS' : 'HOW DO YOU WANT TO ISSUE THIS RECEIPT?'}
            </Text>
            <View style={styles.strategyOptionsRow}>
              {/* Option 1: 1 Combined Receipt (Only available when NO portions have been issued yet) */}
              {!hasAnyIssued && (
                <TouchableOpacity
                  style={[
                    styles.strategyOptionCard,
                    { borderColor: '#DDD6FE', backgroundColor: '#FFFFFF' },
                    issuanceStrategy === 'Consolidated' && {
                      borderColor: colors.brand.primary,
                      backgroundColor: '#EFF6FF',
                    },
                  ]}
                  onPress={() => onSelectStrategy('Consolidated')}
                >
                  <View
                    style={[
                      styles.strategyRadio,
                      issuanceStrategy === 'Consolidated' && { borderColor: colors.brand.primary },
                    ]}
                  >
                    {issuanceStrategy === 'Consolidated' && (
                      <View style={[styles.strategyRadioInner, { backgroundColor: colors.brand.primary }]} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.strategyTitle,
                        issuanceStrategy === 'Consolidated' && { color: colors.brand.primary },
                      ]}
                    >
                      1 Combined Receipt (₱{effectiveTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                    </Text>
                    <Text style={styles.strategySub}>
                      Issues one Official Receipt covering all modes in full
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Option 2: Split into Separate Receipts */}
              <TouchableOpacity
                style={[
                  styles.strategyOptionCard,
                  { borderColor: '#DDD6FE', backgroundColor: '#FFFFFF' },
                  issuanceStrategy === 'SplitPerMode' && {
                    borderColor: colors.brand.primary,
                    backgroundColor: '#EFF6FF',
                  },
                ]}
                onPress={() => onSelectStrategy('SplitPerMode')}
              >
                <View
                  style={[
                    styles.strategyRadio,
                    issuanceStrategy === 'SplitPerMode' && { borderColor: colors.brand.primary },
                  ]}
                >
                  {issuanceStrategy === 'SplitPerMode' && (
                    <View style={[styles.strategyRadioInner, { backgroundColor: colors.brand.primary }]} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.strategyTitle,
                      issuanceStrategy === 'SplitPerMode' && { color: colors.brand.primary },
                    ]}
                  >
                    Separate Receipts per Mode
                  </Text>
                  <Text style={styles.strategySub}>
                    {hasAnyIssued
                      ? 'Issue individual receipts for remaining payment modes'
                      : 'Issue individual receipts (e.g. 1 for Cash, 1 for Check)'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* When SplitPerMode is active, select which mode portion to issue */}
            {issuanceStrategy === 'SplitPerMode' && (
              <View style={styles.splitModesContainer}>
                <Text style={[styles.splitModesLabel, { color: colors.neutral[800] }]}>
                  {hasAnyIssued
                    ? 'Select remaining payment portion to issue now:'
                    : 'Select which payment portion to issue now:'}
                </Text>
                <View style={styles.splitModesChipsRow}>
                  {preferredBreakdown.items.map((item, idx) => {
                    const isItemIssued = Boolean(item.isIssued || item.orNumber);
                    const isSelected = selectedSplitIndex === idx;
                    return (
                      <TouchableOpacity
                        key={idx}
                        disabled={isItemIssued}
                        onPress={() => onSelectSplitItem(idx)}
                        style={[
                          styles.splitModeBtn,
                          { borderColor: colors.neutral[300], backgroundColor: '#FFFFFF' },
                          isSelected && { borderColor: colors.brand.primary, backgroundColor: colors.brand.primary },
                          isItemIssued && { borderColor: '#86EFAC', backgroundColor: '#F0FDF4', opacity: 0.85 },
                        ]}
                      >
                        <Lucide
                          name={isItemIssued ? 'check-circle' : item.mode === 'Cash' ? 'dollar-sign' : item.mode === 'Check' ? 'credit-card' : 'globe'}
                          size={15}
                          color={isItemIssued ? '#16A34A' : isSelected ? '#fff' : colors.brand.primary}
                        />
                        <Text
                          style={[
                            styles.splitModeBtnText,
                            isSelected && { color: '#fff', fontWeight: '800' },
                            isItemIssued && { color: '#166534', fontWeight: '700' },
                          ]}
                        >
                          {item.mode}: ₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          {isItemIssued ? ` (Issued: OR #${item.orNumber})` : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

          {/* Senior Feedback Bar */}
          <View
            style={[
              styles.strategyActiveBanner,
              {
                backgroundColor: issuanceStrategy === 'Consolidated' ? '#EFF6FF' : '#F0FDF4',
                borderColor: issuanceStrategy === 'Consolidated' ? '#93C5FD' : '#86EFAC',
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Lucide
                name={issuanceStrategy === 'Consolidated' ? 'check-circle' : 'scissors'}
                size={16}
                color={issuanceStrategy === 'Consolidated' ? '#1D4ED8' : '#15803D'}
              />
              <Text
                style={[
                  styles.strategyActiveBannerText,
                  { color: issuanceStrategy === 'Consolidated' ? '#1E40AF' : '#166534' },
                ]}
              >
                {issuanceStrategy === 'Consolidated'
                  ? 'Issuing 1 Combined Receipt for all modes'
                  : `Issuing Receipt for ${preferredBreakdown.items[selectedSplitIndex]?.mode ?? 'Selected'} portion`}
              </Text>
            </View>
            <Text
              style={[
                styles.strategyActiveBannerSub,
                { color: issuanceStrategy === 'Consolidated' ? '#1E40AF' : '#166534' },
              ]}
            >
              Amount: ₱
              {(issuanceStrategy === 'Consolidated'
                ? effectiveTotal
                : (preferredBreakdown.items[selectedSplitIndex]?.amount ?? 0)
              ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      );
    })()}
  </View>
);
}
