import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { receiptService, OfficialReceiptDto } from '@edge/api';

interface CancelReceiptModalProps {
  visible: boolean;
  receipt: OfficialReceiptDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CancelReceiptModal({
  visible,
  receipt,
  onClose,
  onSuccess,
}: CancelReceiptModalProps) {
  const { colors } = useTheme();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (receipt === null) return null;

  const handleSubmit = async () => {
    if (reason.trim().length < 5) {
      setErrorMsg('Please state a valid reason for cancellation (at least 5 characters).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const [res, err] = await receiptService.cancelOfficialReceipt(receipt.id, reason.trim());

    setIsSubmitting(false);

    if (err !== null) {
      setErrorMsg(err);
    } else {
      setReason('');
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.cardBg }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.titleRow}>
              <View style={styles.iconBox}>
                <Lucide name="alert-triangle" size={20} color={colors.semantic.error} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Cancel Official Receipt #{receipt.officialReceiptNumber}</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>Void receipt and revert linked transaction</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Lucide name="x" size={20} color={colors.neutral[700]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {errorMsg !== null && (
              <View style={styles.errorBox}>
                <Lucide name="alert-circle" size={16} color={colors.semantic.error} />
                <Text style={[styles.errorText, { color: colors.semantic.error }]}>{errorMsg}</Text>
              </View>
            )}

            <View style={styles.warningCard}>
              <Lucide name="alert-circle" size={20} color="#B45309" />
              <View style={{ flex: 1 }}>
                <Text style={styles.warningTitle}>Government Accountable Form Cancellation</Text>
                <Text style={styles.warningText}>
                  Cancelling an issued OR will mark it as VOID in the official audit registry. If this receipt is tied to an Order of Payment, the payment status will be reverted to unpaid.
                </Text>
              </View>
            </View>

            <View style={[styles.receiptSummary, { borderColor: colors.border }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Payor:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{receipt.payorName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Amount:</Text>
                <Text style={[styles.summaryAmount, { color: colors.semantic.error }]}>
                  ₱{receipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Payment Method:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{receipt.paymentMethod}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Issued At:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{new Date(receipt.issuedAt).toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.neutral[700] }]}>Mandatory Reason for Cancellation *</Text>
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: 'top', borderColor: colors.neutral[300], color: colors.text }]}
                multiline
                placeholder="e.g. Erroneous payor name / check bounced / spoiled accountable form"
                placeholderTextColor={colors.neutral[400]}
                value={reason}
                onChangeText={setReason}
              />
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={[styles.cancelBtn, { backgroundColor: colors.neutral[100] }]}>
              <Text style={[styles.cancelBtnText, { color: colors.neutral[700] }]}>Keep Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={[styles.submitBtn, { backgroundColor: colors.semantic.error }, isSubmitting && { opacity: 0.7 }]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Lucide name="slash" size={16} color="#fff" />
                  <Text style={styles.submitBtnText}>Confirm Void & Cancel</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    borderRadius: 12,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    flex: 1,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 11,
    color: '#B45309',
    lineHeight: 16,
  },
  receiptSummary: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 12,
    fontWeight: '700',
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});
