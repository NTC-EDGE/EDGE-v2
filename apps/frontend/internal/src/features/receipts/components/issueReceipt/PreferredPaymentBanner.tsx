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
      <View
        style={[
          styles.preferredCard,
          {
            backgroundColor: '#F8FAFC',
            borderColor: colors.border,
            borderLeftColor: '#6D28D9',
          },
        ]}
      >
        <View style={styles.preferredCardHeader}>
          <View style={styles.preferredTitleRow}>
            <Lucide name={hasCheckDetails ? 'credit-card' : 'globe'} size={16} color="#6D28D9" />
            <Text style={[styles.preferredTitleText, { color: '#4C1D95' }]}>
              CLIENT SUBMITTED PAYMENT
            </Text>
          </View>
          <View style={[styles.preferredBadge, { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' }]}>
            <Text style={[styles.preferredBadgeText, { color: '#475569' }]}>
              {hasCheckDetails ? 'Check Payment' : 'Online Payment'}
            </Text>
          </View>
        </View>

        <View style={styles.preferredItemsRow}>
          {hasCheckDetails && (
            <View style={[styles.preferredItemPill, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}>
              <Lucide name="credit-card" size={14} color={colors.neutral[600]} />
              <Text style={[styles.preferredItemText, { color: colors.text }]}>
                <Text style={{ fontWeight: '700' }}>Drawee Bank:</Text> {pendingPayment.checkBank || 'Not Specified'}
                {pendingPayment.checkNumber ? ` • Check #: ${pendingPayment.checkNumber}` : ''}
                {pendingPayment.checkDate ? ` • Date: ${new Date(pendingPayment.checkDate).toLocaleDateString('en-US')}` : ''}
              </Text>
            </View>
          )}
          {hasOnlineDetails && (
            <View style={[styles.preferredItemPill, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}>
              <Lucide name="globe" size={14} color={colors.neutral[600]} />
              <Text style={[styles.preferredItemText, { color: colors.text }]}>
                <Text style={{ fontWeight: '700' }}>Reference #:</Text> {pendingPayment.paymentReferenceNumber || 'Pending Verification'}
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
    <View
      style={[
        styles.preferredCard,
        {
          backgroundColor: '#F8FAFC',
          borderColor: colors.border,
          borderLeftColor: '#6D28D9',
        },
      ]}
    >
      {/* Header with Title and Mode Badge */}
      <View style={styles.preferredCardHeader}>
        <View style={styles.preferredTitleRow}>
          <Lucide name="layers" size={16} color="#6D28D9" />
          <Text style={[styles.preferredTitleText, { color: '#4C1D95' }]}>
            CLIENT PAYMENT BREAKDOWN
          </Text>
        </View>
        <View style={[styles.preferredBadge, { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' }]}>
          <Text style={[styles.preferredBadgeText, { color: '#475569' }]}>
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
                  backgroundColor: '#FFFFFF',
                  borderColor: colors.border,
                },
              ]}
            >
              <Lucide
                name={isItemIssued ? 'check-circle' : item.mode === 'Cash' ? 'dollar-sign' : item.mode === 'Check' ? 'credit-card' : 'globe'}
                size={14}
                color={isItemIssued ? '#16A34A' : colors.neutral[600]}
              />
              <Text style={[styles.preferredItemText, { color: colors.text }]}>
                <Text style={{ fontWeight: '700' }}>{item.mode}:</Text> ₱
                {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {item.mode === 'Check' && item.checkNumber ? ` (${item.checkBank || 'Bank'} #${item.checkNumber})` : ''}
                {item.mode === 'Online' && item.referenceNumber ? ` (Ref: ${item.referenceNumber})` : ''}
              </Text>
              {Boolean(item.proofFileName || item.proofFileId) && (
                <View style={{ backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Lucide name="paperclip" size={11} color="#475569" />
                  <Text style={{ fontSize: 10.5, fontWeight: '600', color: '#475569' }}>
                    {item.proofFileName ? `Proof: ${item.proofFileName}` : 'Proof Attached'}
                  </Text>
                </View>
              )}
              {isItemIssued && (
                <View style={{ backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#166534' }}>
                    ISSUED (OR #{item.orNumber})
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Strategy Selector for Combination Mode */}
      {preferredBreakdown.isCombination && (() => {
        const hasAnyIssued = preferredBreakdown.items.some((i) => i.isIssued || i.orNumber);

        return (
          <View style={styles.regionalStrategySection}>
            <Text style={[styles.strategySectionHeading, { color: colors.neutral[600] }]}>
              {hasAnyIssued ? 'SPLIT RECEIPT STATUS' : 'ISSUANCE OPTION'}
            </Text>
            <View style={styles.strategyOptionsRow}>
              {!hasAnyIssued && (
                <TouchableOpacity
                  style={[
                    styles.strategyOptionCard,
                    { borderColor: colors.border, backgroundColor: '#FFFFFF' },
                    issuanceStrategy === 'Consolidated' && {
                      borderColor: colors.brand.primary,
                      backgroundColor: '#F8FAFC',
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

              <TouchableOpacity
                style={[
                  styles.strategyOptionCard,
                  { borderColor: colors.border, backgroundColor: '#FFFFFF' },
                  issuanceStrategy === 'SplitPerMode' && {
                    borderColor: colors.brand.primary,
                    backgroundColor: '#F8FAFC',
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

            {issuanceStrategy === 'SplitPerMode' && (
              <View style={styles.splitModesContainer}>
                <Text style={[styles.splitModesLabel, { color: colors.neutral[700] }]}>
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
                          isItemIssued && { borderColor: colors.border, backgroundColor: '#F8FAFC', opacity: 0.7 },
                        ]}
                      >
                        <Lucide
                          name={isItemIssued ? 'check-circle' : item.mode === 'Cash' ? 'dollar-sign' : item.mode === 'Check' ? 'credit-card' : 'globe'}
                          size={14}
                          color={isItemIssued ? '#16A34A' : isSelected ? '#fff' : colors.neutral[700]}
                        />
                        <Text
                          style={[
                            styles.splitModeBtnText,
                            isSelected && { color: '#fff', fontWeight: '700' },
                            isItemIssued && { color: colors.neutral[600] },
                          ]}
                        >
                          {item.mode}: ₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          {isItemIssued ? ` (OR #${item.orNumber})` : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <View
              style={[
                styles.strategyActiveBanner,
                {
                  backgroundColor: '#FFFFFF',
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Lucide
                  name={issuanceStrategy === 'Consolidated' ? 'check-circle' : 'scissors'}
                  size={14}
                  color={colors.neutral[600]}
                />
                <Text
                  style={[
                    styles.strategyActiveBannerText,
                    { color: colors.text },
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
                  { color: colors.text },
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

