import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { PendingPaymentDto } from '@edge/api';
import { styles } from './issueReceiptStyles';

interface ReceiptPayorSectionProps {
  isFromPendingPayment: boolean;
  pendingPayment?: PendingPaymentDto;
  payorName: string;
  setPayorName: (v: string) => void;
  payorAddress: string;
  setPayorAddress: (v: string) => void;
  activeOpLabel?: string;
  activeSoaLabel?: string;
  activeIssuedOrNumber?: string | null;
}

export function ReceiptPayorSection({
  isFromPendingPayment,
  pendingPayment,
  payorName,
  setPayorName,
  payorAddress,
  setPayorAddress,
  activeOpLabel,
  activeSoaLabel,
  activeIssuedOrNumber,
}: ReceiptPayorSectionProps) {
  const { colors } = useTheme();
  const displayOp = activeOpLabel || pendingPayment?.opNumber || 'N/A';
  const displaySoa = activeSoaLabel || pendingPayment?.soaNumber || 'N/A';
  const displayRef = pendingPayment?.applicationNumber || pendingPayment?.referenceNumber || 'N/A';

  return (
    <View
      style={[
        styles.sectionCard,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
          borderLeftColor: '#0284C7',
        },
      ]}
    >
      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.sectionIconBadge, { backgroundColor: '#E0F2FE' }]}>
            <Lucide name="user" size={14} color="#0284C7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionHeaderTitle, { color: '#0284C7' }]}>
              2. PAYEE / PAYOR &amp; BILLING REFERENCE
            </Text>
            <Text style={styles.sectionHeaderSub}>
              Verify Order of Payment and Statement of Account reference and confirm printed payee details
            </Text>
          </View>
        </View>
      </View>

      {/* Billing Reference Strip (OP No., SOA No., Application Ref, Issued OR No.) */}
      {isFromPendingPayment && pendingPayment !== null && pendingPayment !== undefined && (
        <View
          style={[
            styles.readOnlyPayorCard,
            {
              backgroundColor: '#F8FAFC',
              borderColor: colors.border,
              marginTop: 0,
              marginBottom: 14,
            },
          ]}
        >
          <View style={styles.readOnlyField}>
            <Text style={[styles.readOnlyLabel, { color: colors.neutral[500] }]}>ORDER OF PAYMENT NO.</Text>
            <Text style={[styles.readOnlyValue, { color: colors.text }]}>
              {displayOp}
            </Text>
          </View>

          <View style={styles.readOnlyField}>
            <Text style={[styles.readOnlyLabel, { color: colors.neutral[500] }]}>STATEMENT OF ACCOUNT NO.</Text>
            <Text style={[styles.readOnlyValue, { color: colors.text }]}>
              {displaySoa}
            </Text>
          </View>

          <View style={styles.readOnlyField}>
            <Text style={[styles.readOnlyLabel, { color: colors.neutral[500] }]}>APPLICATION REF</Text>
            <Text style={[styles.readOnlyValue, { color: colors.text }]} numberOfLines={1}>
              {displayRef}
            </Text>
          </View>
        </View>
      )}

      {/* Editable Payee Details for Cashier */}
      <View style={styles.payorFieldsRow}>
        <View style={{ flex: 1.5, minWidth: 240 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={[styles.inlineFieldLabel, { color: colors.neutral[700], marginBottom: 0 }]}>
              Payee Name (Printed on Official Receipt) *
            </Text>
            {isFromPendingPayment && (
              <Text style={{ fontSize: 11, color: colors.neutral[500], fontWeight: '500' }}>
                Editable
              </Text>
            )}
          </View>
          <TextInput
            style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
            placeholder="Write payee / payor name"
            placeholderTextColor={colors.neutral[400]}
            value={payorName}
            onChangeText={setPayorName}
            autoFocus={!isFromPendingPayment}
          />
        </View>

        <View style={{ flex: 1, minWidth: 200 }}>
          <Text style={[styles.inlineFieldLabel, { color: colors.neutral[700] }]}>
            Payee Address (Optional)
          </Text>
          <TextInput
            style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
            placeholder="e.g. Brgy. Central, Quezon City"
            placeholderTextColor={colors.neutral[400]}
            value={payorAddress}
            onChangeText={setPayorAddress}
          />
        </View>
      </View>
    </View>
  );
}

