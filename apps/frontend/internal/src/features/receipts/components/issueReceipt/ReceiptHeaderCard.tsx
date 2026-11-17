import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Icon as Lucide, useTheme, DatePickerInput } from '@edge/ui';
import { NextAvailableOrDto, PaymentMethod } from '@edge/api';
import { styles } from './issueReceiptStyles';

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Check', 'Online'];

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
  issueDate?: string;
  setIssueDate?: (v: string) => void;
  dateChangeReason?: string;
  setDateChangeReason?: (v: string) => void;
  todayStr?: string;
  isAlreadyPaid?: boolean;
  issuedOrNumber?: string | null;
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
  issueDate,
  setIssueDate,
  dateChangeReason,
  setDateChangeReason,
  todayStr,
  isAlreadyPaid = false,
  issuedOrNumber = null,
}: ReceiptHeaderCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.mainCard,
        {
          borderColor: colors.border,
          borderLeftColor: colors.brand.primary,
          backgroundColor: colors.cardBg,
        },
      ]}
    >
      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.sectionIconBadge, { backgroundColor: '#EFF6FF' }]}>
            <Lucide name="hash" size={14} color={colors.brand.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionHeaderTitle, { color: colors.brand.primary }]}>
              1. OFFICIAL RECEIPT SERIAL &amp; PAYMENT METHOD
            </Text>
            <Text style={styles.sectionHeaderSub}>
              Verify active booklet serial number, payment mode, and receipt date
            </Text>
          </View>
        </View>
      </View>

      {/* Card Header: OR Serial Badge & Payment Method */}
      <View style={styles.summaryTopRow}>
        <View style={styles.orBadgeContainer}>
          <Text style={[styles.orBadgeLabel, { color: colors.neutral[500] }]}>
            {isAlreadyPaid ? 'ISSUED OFFICIAL RECEIPT NUMBER' : 'OFFICIAL RECEIPT SERIAL NUMBER'}
          </Text>
          <Text style={[styles.orBadgeValue, { color: isAlreadyPaid ? '#059669' : colors.text }]}>
            {isAlreadyPaid
              ? (issuedOrNumber ? `#${issuedOrNumber}` : 'PAID')
              : useManualOr
                ? (manualOrNumber.trim() ? `#${manualOrNumber.trim()}` : 'Enter Custom OR #')
                : (nextOr?.formattedOrNumber ? `#${nextOr.formattedOrNumber}` : 'NO ACTIVE BOOKLET')}
          </Text>

          {isAlreadyPaid ? (
            <View style={styles.seriesInfoPillRow}>
              <View style={[styles.seriesPill, { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' }]}>
                <Lucide name="check-circle" size={12} color="#059669" />
                <Text style={[styles.seriesPillText, { color: '#065F46' }]}>
                  Official Receipt Issued
                </Text>
              </View>
            </View>
          ) : (
            <>
              {!useManualOr && nextOr?.hasActiveBooklet && (
                <View style={styles.seriesInfoPillRow}>
                  <View style={[styles.seriesPill, { backgroundColor: '#F1F5F9' }]}>
                    <Lucide name="layers" size={12} color="#475569" />
                    <Text style={[styles.seriesPillText, { color: '#334155' }]}>
                      Booklet {nextOr.bookletNumber ?? ''} • {nextOr.remainingCount} left
                    </Text>
                  </View>
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
            </>
          )}
        </View>

        {/* Payment Method Selector */}
        <View style={styles.methodSelector}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginBottom: 6 }}>
            <Text style={[styles.methodSelectorLabel, { color: colors.neutral[500], marginBottom: 0 }]}>
              PAYMENT METHOD
            </Text>
            {isFromPendingPayment && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 10.5, color: '#475569', fontWeight: '600' }}>
                  Client Specified
                </Text>
              </View>
            )}
          </View>

          <View style={styles.methodPillGroup}>
            {PAYMENT_METHODS.map((method) => {
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
                    { backgroundColor: '#F8FAFC', borderColor: colors.neutral[300] },
                    isSelected && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary },
                  ]}
                >
                  <Lucide
                    name={method === 'Cash' ? 'dollar-sign' : method === 'Check' ? 'credit-card' : 'globe'}
                    size={14}
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
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Manual OR Input if enabled */}
      {useManualOr && (
        <View style={[styles.inlineManualOrBox, { borderTopColor: colors.neutral[200] }]}>
          <Text style={[styles.inlineFieldLabel, { color: colors.neutral[700] }]}>Custom OR Number *</Text>
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
            <Text style={[styles.inlineFieldLabel, { color: colors.neutral[700], marginBottom: 0 }]}>
              Online Reference / E-Receipt / Transaction No. (Optional)
            </Text>
            {Boolean(clientSubmittedPayment?.onlineReference) && (
              <Text style={{ fontSize: 11, fontWeight: '600', color: colors.neutral[500] }}>
                Auto-filled from client submission
              </Text>
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
            <Text style={[styles.inlineFieldLabel, { color: colors.neutral[700], marginBottom: 0 }]}>
              Check Details
            </Text>
            {Boolean(clientSubmittedPayment?.checkBank || clientSubmittedPayment?.checkNumber) && (
              <Text style={{ fontSize: 11, fontWeight: '600', color: colors.neutral[500] }}>
                Auto-filled from client submission
              </Text>
            )}
          </View>
          <View style={styles.checkFieldsRow}>
            <View style={{ flex: 1, minWidth: 160 }}>
              <Text style={[styles.inlineFieldLabel, { color: colors.neutral[700] }]}>Check # *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                placeholder="e.g. 00012389"
                placeholderTextColor={colors.neutral[400]}
                value={checkNumber}
                onChangeText={setCheckNumber}
              />
            </View>
            <View style={{ flex: 1, minWidth: 160 }}>
              <Text style={[styles.inlineFieldLabel, { color: colors.neutral[700] }]}>Drawee Bank *</Text>
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

      {/* OR Issue Date Row */}
      {issueDate !== undefined && setIssueDate !== undefined && (
        <View style={[styles.onlineInlineBox, { borderTopColor: colors.neutral[200] }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={[styles.inlineFieldLabel, { color: colors.neutral[700], marginBottom: 0 }]}>
              Official Receipt Issue Date
            </Text>
            {Boolean(todayStr && issueDate !== todayStr) && (
              <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#475569' }}>
                  Date Overridden (Default: {todayStr})
                </Text>
              </View>
            )}
          </View>
          <View style={{ maxWidth: 220 }}>
            <DatePickerInput
              label="OR Issue Date"
              placeholder="YYYY-MM-DD"
              value={issueDate}
              onChangeText={setIssueDate}
            />
          </View>

          {Boolean(todayStr && issueDate !== todayStr && setDateChangeReason !== undefined) && (
            <View style={{ marginTop: 8 }}>
              <Text style={[styles.inlineFieldLabel, { color: colors.neutral[700], marginBottom: 4 }]}>
                Reason for Date Override *
              </Text>
              <TextInput
                style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                placeholder="Required: State why OR date differs from today (e.g., offline collection, mobile licensing)"
                placeholderTextColor={colors.neutral[400]}
                value={dateChangeReason ?? ''}
                onChangeText={setDateChangeReason}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

