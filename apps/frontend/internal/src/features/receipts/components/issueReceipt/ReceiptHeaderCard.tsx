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
  onPaymentMethodChange?: (m: PaymentMethod) => void;
  clientSubmittedPayment?: {
    checkNumber: string;
    checkBank: string;
    checkDate: string;
    onlineReference: string;
  };
  isFromPendingPayment: boolean;
  checkNumber: string;
  setCheckNumber: (v: string) => void;
  checkBank: string;
  setCheckBank: (v: string) => void;
  checkDate: string;
  setCheckDate: (v: string) => void;
  onlineReference?: string;
  setOnlineReference?: (v: string) => void;
}

export function ReceiptHeaderCard({
  useManualOr,
  manualOrNumber,
  setUseManualOr,
  setManualOrNumber,
  nextOr,
  paymentMethod,
  setPaymentMethod,
  onPaymentMethodChange,
  clientSubmittedPayment,
  isFromPendingPayment,
  checkNumber,
  setCheckNumber,
  checkBank,
  setCheckBank,
  checkDate,
  setCheckDate,
  onlineReference = '',
  setOnlineReference,
}: ReceiptHeaderCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.mainCard, { borderColor: colors.border, backgroundColor: '#FAFAFA' }]}>
      {/* Card Header: OR Serial Badge & Payment Method */}
      <View style={styles.summaryTopRow}>
        <View style={styles.orBadgeContainer}>
          <Text style={[styles.orBadgeLabel, { color: colors.neutral[600] }]}>
            OFFICIAL RECEIPT SERIAL NUMBER
          </Text>
          <Text style={[styles.orBadgeValue, { color: colors.brand.primary }]}>
            {useManualOr
              ? (manualOrNumber.trim() ? `#${manualOrNumber.trim()}` : 'Enter Custom OR #')
              : (nextOr?.formattedOrNumber ? `#${nextOr.formattedOrNumber}` : 'NO ACTIVE BOOKLET')}
          </Text>

          {!useManualOr && nextOr?.hasActiveBooklet && (
            <View style={styles.seriesInfoPillRow}>
              <View style={[styles.seriesPill, { backgroundColor: colors.brand.indigoLight }]}>
                <Lucide name="layers" size={13} color={colors.brand.primary} />
                <Text style={[styles.seriesPillText, { color: colors.brand.primary }]}>
                  Booklet {nextOr.bookletNumber ?? ''}
                </Text>
              </View>
              {nextOr.formattedStartNumber && nextOr.formattedEndNumber && (
                <View style={[styles.seriesPill, { backgroundColor: colors.neutral[200] }]}>
                  <Text style={[styles.seriesPillText, { color: colors.neutral[800] }]}>
                    Series: {nextOr.formattedStartNumber} – {nextOr.formattedEndNumber}
                  </Text>
                </View>
              )}
              <View style={[styles.seriesPill, { backgroundColor: colors.neutral[200] }]}>
                <Text style={[styles.seriesPillText, { color: colors.neutral[800] }]}>
                  {nextOr.remainingCount} remaining
                </Text>
              </View>
              {nextOr.isShared && (
                <View style={[styles.seriesPill, { backgroundColor: '#E0E7FF' }]}>
                  <Lucide name="users" size={13} color={colors.brand.primary} />
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

        {/* Payment Method Selector */}
        <View style={styles.methodSelector}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginBottom: 6 }}>
            <Text style={[styles.methodSelectorLabel, { color: colors.neutral[600], marginBottom: 0 }]}>
              PAYMENT METHOD
            </Text>
            {isFromPendingPayment && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EDE9FE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Lucide name="check-circle" size={12} color="#6D28D9" />
                <Text style={{ fontSize: 11, color: '#6D28D9', fontWeight: '800' }}>
                  Client Specified
                </Text>
              </View>
            )}
          </View>

          <View style={styles.methodPillGroup}>
            {(['Cash', 'Check', 'Online'] as PaymentMethod[]).map((method) => {
              const isSelected = paymentMethod === method;

              return (
                <TouchableOpacity
                  key={method}
                  onPress={() => {
                    if (onPaymentMethodChange) {
                      onPaymentMethodChange(method);
                    } else {
                      setPaymentMethod(method);
                    }
                  }}
                  style={[
                    styles.methodPill,
                    { backgroundColor: colors.neutral[100], borderColor: colors.neutral[300] },
                    isSelected && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary },
                  ]}
                >
                  <Lucide
                    name={method === 'Cash' ? 'dollar-sign' : method === 'Check' ? 'credit-card' : 'globe'}
                    size={16}
                    color={isSelected ? '#fff' : colors.neutral[800]}
                  />
                  <Text
                    style={[
                      styles.methodPillText,
                      { color: colors.neutral[800] },
                      isSelected && { color: '#fff' },
                    ]}
                  >
                    {method}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Manual OR Input if enabled */}
      {useManualOr && (
        <View style={[styles.inlineManualOrBox, { borderTopColor: colors.neutral[200] }]}>
          <Text style={[styles.inlineFieldLabel, { color: colors.neutral[800] }]}>Custom OR Number *</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
            placeholder="e.g. 0010010"
            placeholderTextColor={colors.neutral[400]}
            value={manualOrNumber}
            onChangeText={setManualOrNumber}
          />
        </View>
      )}

      {/* Online Reference Row (Only when Online is selected) */}
      {paymentMethod === 'Online' && (
        <View style={[styles.onlineInlineBox, { borderTopColor: colors.neutral[200] }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={[styles.inlineFieldLabel, { color: colors.neutral[800], marginBottom: 0 }]}>
              Online Reference / E-Receipt / Transaction No. (Optional)
            </Text>
            {Boolean(clientSubmittedPayment?.onlineReference) && (
              <View style={{ backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#6D28D9' }}>
                  Auto-filled from Client Submission
                </Text>
              </View>
            )}
          </View>
          <TextInput
            style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
            placeholder="e.g. LBP-TXN-12345678, GCASH-REF-89012"
            placeholderTextColor={colors.neutral[400]}
            value={onlineReference}
            onChangeText={setOnlineReference}
          />
        </View>
      )}

      {/* Check Details Row (Only when Check is selected) */}
      {paymentMethod === 'Check' && (
        <View style={[styles.checkInlineBox, { borderTopColor: colors.neutral[200] }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={[styles.inlineFieldLabel, { color: colors.neutral[800], marginBottom: 0 }]}>
              Check Details
            </Text>
            {Boolean(clientSubmittedPayment?.checkBank || clientSubmittedPayment?.checkNumber) && (
              <View style={{ backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#6D28D9' }}>
                  Auto-filled from Client Submission
                </Text>
              </View>
            )}
          </View>
          <View style={styles.checkFieldsRow}>
            <View style={{ flex: 1, minWidth: 160 }}>
              <Text style={[styles.inlineFieldLabel, { color: colors.neutral[800] }]}>Check # *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                placeholder="e.g. 00012389"
                placeholderTextColor={colors.neutral[400]}
                value={checkNumber}
                onChangeText={setCheckNumber}
              />
            </View>
            <View style={{ flex: 1, minWidth: 160 }}>
              <Text style={[styles.inlineFieldLabel, { color: colors.neutral[800] }]}>Drawee Bank *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                placeholder="e.g. Land Bank / BDO"
                placeholderTextColor={colors.neutral[400]}
                value={checkBank}
                onChangeText={setCheckBank}
              />
            </View>
            <View style={{ flex: 1, minWidth: 160 }}>
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
