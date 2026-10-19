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
    <View style={{ marginBottom: 18 }}>
      {/* Editable Payee Details for Cashier */}
      <View style={styles.payorFieldsRow}>
        <View style={{ flex: 1.5, minWidth: 240 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={[styles.inlineFieldLabel, { color: colors.neutral[800], marginBottom: 0 }]}>
              Payee Name (Printed on Official Receipt) *
            </Text>
            {isFromPendingPayment && (
              <Text style={{ fontSize: 11, color: colors.neutral[500], fontWeight: '600' }}>
                (Editable by Cashier)
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
          <Text style={[styles.inlineFieldLabel, { color: colors.neutral[800] }]}>
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

      {/* Captured OP & Application reference card */}
      {isFromPendingPayment && pendingPayment !== null && pendingPayment !== undefined && (
        <View style={[styles.readOnlyPayorCard, { backgroundColor: '#F8FAFC', borderColor: colors.border }]}>
          <View style={styles.readOnlyField}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Lucide name="user" size={13} color={colors.neutral[500]} />
              <Text style={[styles.readOnlyLabel, { color: colors.neutral[600] }]}>ORIGINAL APPLICANT</Text>
            </View>
            <Text style={[styles.readOnlyValue, { color: colors.neutral[900] }]}>
              {pendingPayment.applicantName}
            </Text>
          </View>

          <View style={styles.readOnlyField}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Lucide name="file-text" size={13} color={colors.neutral[500]} />
              <Text style={[styles.readOnlyLabel, { color: colors.neutral[600] }]}>ORDER OF PAYMENT (SOA)</Text>
            </View>
            <Text style={[styles.readOnlyValue, { color: colors.neutral[900] }]}>
              OP #{pendingPayment.opNumber} ({pendingPayment.applicationNumber || pendingPayment.referenceNumber || 'N/A'})
            </Text>
          </View>

          <View style={styles.readOnlyField}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Lucide name="tag" size={13} color={colors.neutral[500]} />
              <Text style={[styles.readOnlyLabel, { color: colors.neutral[600] }]}>SERVICE</Text>
            </View>
            <Text style={[styles.readOnlyValue, { color: colors.neutral[900] }]} numberOfLines={1}>
              {pendingPayment.serviceName}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
