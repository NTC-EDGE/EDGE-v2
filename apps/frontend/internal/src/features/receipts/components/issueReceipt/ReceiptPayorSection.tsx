import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTheme } from '@edge/ui';
import { PendingPaymentDto } from '@edge/api';
import { styles } from './issueReceiptStyles';

interface ReceiptPayorSectionProps {
  isFromPendingPayment: boolean;
  pendingPayment?: PendingPaymentDto;
  payorName: string;
  setPayorName: (v: string) => void;
  payorAddress: string;
  setPayorAddress: (v: string) => void;
}

export function ReceiptPayorSection({
  isFromPendingPayment,
  pendingPayment,
  payorName,
  setPayorName,
  payorAddress,
  setPayorAddress,
}: ReceiptPayorSectionProps) {
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Editable Payor Details for Cashier */}
      <View style={styles.payorFieldsRow}>
        <View style={{ flex: 1.5, marginRight: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={[styles.inlineFieldLabel, { color: colors.neutral[700], marginBottom: 0 }]}>
              Payee Name / Company *
            </Text>
            {isFromPendingPayment && (
              <Text style={{ fontSize: 10, color: colors.textMuted }}>
                (Editable by Cashier)
              </Text>
            )}
          </View>
          <TextInput
            style={[styles.input, { borderColor: colors.neutral[300], color: colors.text, backgroundColor: '#fff' }]}
            placeholder="Write payee / payor name"
            placeholderTextColor={colors.neutral[400]}
            value={payorName}
            onChangeText={setPayorName}
            autoFocus={!isFromPendingPayment}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.inlineFieldLabel, { color: colors.neutral[700] }]}>Payee Address (Optional)</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.neutral[300], color: colors.text, backgroundColor: '#fff' }]}
            placeholder="e.g. Brgy. Central, City"
            placeholderTextColor={colors.neutral[400]}
            value={payorAddress}
            onChangeText={setPayorAddress}
          />
        </View>
      </View>

      {/* When from pending payment, also display the captured OP & Application reference card */}
      {isFromPendingPayment && pendingPayment !== null && pendingPayment !== undefined && (
        <View style={[styles.readOnlyPayorCard, { backgroundColor: '#F8FAFC', borderColor: colors.border, marginTop: 8 }]}>
          <View style={styles.readOnlyField}>
            <Text style={[styles.readOnlyLabel, { color: colors.textMuted }]}>ORIGINAL APPLICANT</Text>
            <Text style={[styles.readOnlyValue, { color: colors.text }]}>{pendingPayment.applicantName}</Text>
          </View>
          <View style={styles.readOnlyField}>
            <Text style={[styles.readOnlyLabel, { color: colors.textMuted }]}>ORDER OF PAYMENT (SOA)</Text>
            <Text style={[styles.readOnlyValue, { color: colors.text }]}>
              OP #{pendingPayment.opNumber} ({pendingPayment.applicationNumber || pendingPayment.referenceNumber || 'N/A'})
            </Text>
          </View>
          <View style={styles.readOnlyField}>
            <Text style={[styles.readOnlyLabel, { color: colors.textMuted }]}>SERVICE</Text>
            <Text style={[styles.readOnlyValue, { color: colors.text }]} numberOfLines={1}>
              {pendingPayment.serviceName}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
