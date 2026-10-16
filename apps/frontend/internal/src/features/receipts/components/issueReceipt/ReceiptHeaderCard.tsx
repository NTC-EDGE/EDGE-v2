import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Icon as Lucide, useTheme, DatePickerInput } from '@edge/ui';
import { NextAvailableOrDto, PaymentMethod } from '@edge/api';
import { styles } from './issueReceiptStyles';

interface ReceiptHeaderCardProps {
  useManualOr: boolean;
  manualOrNumber: string;
  setUseManualOr: (v: boolean) => void;
  setManualOrNumber: (v: string) => void;
  nextOr?: NextAvailableOrDto;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
  isFromPendingPayment: boolean;
  checkNumber: string;
  setCheckNumber: (v: string) => void;
  checkBank: string;
  setCheckBank: (v: string) => void;
  checkDate: string;
  setCheckDate: (v: string) => void;
}

export function ReceiptHeaderCard({
  useManualOr,
  manualOrNumber,
  setUseManualOr,
  setManualOrNumber,
  nextOr,
  paymentMethod,
  setPaymentMethod,
  isFromPendingPayment,
  checkNumber,
  setCheckNumber,
  checkBank,
  setCheckBank,
  checkDate,
  setCheckDate,
}: ReceiptHeaderCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.mainCard, { borderColor: colors.border, backgroundColor: colors.neutral[50] }]}>
      {/* Card Header: OR Serial Badge & Payment Method */}
      <View style={styles.summaryTopRow}>
        <View style={styles.orBadgeContainer}>
          <Text style={[styles.orBadgeLabel, { color: colors.textMuted }]}>OFFICIAL RECEIPT SERIAL NUMBER</Text>
          <Text style={[styles.orBadgeValue, { color: colors.brand.primary }]}>
            {useManualOr
              ? (manualOrNumber.trim() ? `#${manualOrNumber.trim()}` : 'Enter Custom OR #')
              : (nextOr?.formattedOrNumber ? `#${nextOr.formattedOrNumber}` : 'NO ACTIVE BOOKLET')}
          </Text>

          {!useManualOr && nextOr?.hasActiveBooklet && (
            <View style={styles.seriesInfoPillRow}>
              <View style={[styles.seriesPill, { backgroundColor: colors.brand.indigoLight }]}>
                <Lucide name="layers" size={11} color={colors.brand.primary} />
                <Text style={[styles.seriesPillText, { color: colors.brand.primary }]}>
                  Booklet {nextOr.bookletNumber ?? ''}
                </Text>
              </View>
              {nextOr.formattedStartNumber && nextOr.formattedEndNumber && (
                <View style={[styles.seriesPill, { backgroundColor: colors.neutral[200] }]}>
                  <Text style={[styles.seriesPillText, { color: colors.neutral[700] }]}>
                    Series: {nextOr.formattedStartNumber} – {nextOr.formattedEndNumber}
                  </Text>
                </View>
              )}
              <View style={[styles.seriesPill, { backgroundColor: colors.neutral[200] }]}>
                <Text style={[styles.seriesPillText, { color: colors.neutral[700] }]}>
                  {nextOr.remainingCount} remaining
                </Text>
              </View>
              {nextOr.isShared && (
                <View style={[styles.seriesPill, { backgroundColor: '#E0E7FF' }]}>
                  <Lucide name="users" size={11} color={colors.brand.primary} />
                  <Text style={[styles.seriesPillText, { color: colors.brand.primary }]}>
                    Shared ({nextOr.assignedUserNames?.length ?? 2} Cashiers)
                  </Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            onPress={() => setUseManualOr(!useManualOr)}
            style={styles.overrideLink}
          >
            <Text style={[styles.overrideLinkText, { color: colors.brand.primary }]}>
              {useManualOr ? '← Use Active Booklet Series' : 'Switch to Manual OR Override'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Payment Method Selector - Locked if from pending payment */}
        <View style={styles.methodSelector}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginBottom: 4 }}>
            <Text style={[styles.methodSelectorLabel, { color: colors.textMuted, marginBottom: 0 }]}>
              PAYMENT METHOD
            </Text>
            {isFromPendingPayment && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 4 }}>
                <Lucide name="lock" size={10} color={colors.textMuted} />
                <Text style={{ fontSize: 9, color: colors.textMuted, fontWeight: '700' }}>
                  (Client Selected)
                </Text>
              </View>
            )}
          </View>

          <View style={styles.methodPillGroup}>
            {(['Cash', 'Check', 'Online'] as PaymentMethod[]).map((method) => {
              const isSelected = paymentMethod === method;
              const isDisabled = isFromPendingPayment;

              return (
                <TouchableOpacity
                  key={method}
                  onPress={() => !isDisabled && setPaymentMethod(method)}
                  disabled={isDisabled}
                  style={[
                    styles.methodPill,
                    { backgroundColor: colors.neutral[100], borderColor: colors.neutral[300] },
                    isSelected && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary },
                    isDisabled && !isSelected && { opacity: 0.4 },
                    isDisabled && isSelected && { opacity: 0.95 },
                  ]}
                >
                  <Lucide
                    name={method === 'Cash' ? 'dollar-sign' : method === 'Check' ? 'credit-card' : 'globe'}
                    size={13}
                    color={isSelected ? '#fff' : colors.neutral[700]}
                  />
                  <Text
                    style={[
                      styles.methodPillText,
                      { color: colors.neutral[700] },
                      isSelected && { color: '#fff' },
                    ]}
                  >
                    {method}
                  </Text>
                  {isDisabled && isSelected && (
                    <Lucide name="lock" size={10} color="#fff" style={{ marginLeft: 2 }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Manual OR Input if enabled */}
      {useManualOr && (
        <View style={styles.inlineManualOrBox}>
          <Text style={[styles.inlineFieldLabel, { color: colors.neutral[700] }]}>Custom OR Number *</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.neutral[300], color: colors.text, backgroundColor: '#fff' }]}
            placeholder="e.g. 1002049"
            placeholderTextColor={colors.neutral[400]}
            value={manualOrNumber}
            onChangeText={setManualOrNumber}
          />
        </View>
      )}

      {/* Check Details Row (Only when Check is selected) */}
      {paymentMethod === 'Check' && (
        <View style={[styles.checkInlineBox, { borderTopColor: colors.neutral[200] }]}>
          <View style={styles.checkFieldsRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.inlineFieldLabel, { color: colors.neutral[700] }]}>Check # *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.neutral[300], color: colors.text, backgroundColor: '#fff' }]}
                placeholder="e.g. 00012389"
                placeholderTextColor={colors.neutral[400]}
                value={checkNumber}
                onChangeText={setCheckNumber}
              />
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.inlineFieldLabel, { color: colors.neutral[700] }]}>Drawee Bank *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.neutral[300], color: colors.text, backgroundColor: '#fff' }]}
                placeholder="e.g. Land Bank / BDO"
                placeholderTextColor={colors.neutral[400]}
                value={checkBank}
                onChangeText={setCheckBank}
              />
            </View>
            <View style={{ flex: 1 }}>
              <DatePickerInput
                label="Check Date"
                placeholder="YYYY-MM-DD"
                value={checkDate}
                onChangeText={setCheckDate}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
