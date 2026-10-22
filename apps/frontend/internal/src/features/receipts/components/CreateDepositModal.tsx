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
import { Icon as Lucide, useTheme, DatePickerInput } from '@edge/ui';
import { receiptService, AgencyBankAccountDto, OfficialReceiptDto } from '@edge/api';

interface CreateDepositModalProps {
  visible: boolean;
  tenantId: string;
  bankAccounts: AgencyBankAccountDto[];
  undepositedReceipts: OfficialReceiptDto[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateDepositModal({
  visible,
  tenantId,
  bankAccounts,
  undepositedReceipts,
  onClose,
  onSuccess,
}: CreateDepositModalProps) {
  const { colors } = useTheme();
  const [depositSlipNumber, setDepositSlipNumber] = useState('');
  const [bankAccountId, setBankAccountId] = useState(bankAccounts[0]?.id ?? '');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().substring(0, 10));
  const [selectedReceiptIds, setSelectedReceiptIds] = useState<string[]>(
    undepositedReceipts.map((r) => r.id)
  );
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedReceipts = undepositedReceipts.filter((r) => selectedReceiptIds.includes(r.id));
  const totalCash = selectedReceipts.filter((r) => r.paymentMethod === 'Cash').reduce((s, r) => s + r.amount, 0);
  const totalChecks = selectedReceipts.filter((r) => r.paymentMethod === 'Check').reduce((s, r) => s + r.amount, 0);
  const totalDepositAmount = totalCash + totalChecks;

  const toggleSelectReceipt = (id: string) => {
    if (selectedReceiptIds.includes(id)) {
      setSelectedReceiptIds(selectedReceiptIds.filter((i) => i !== id));
    } else {
      setSelectedReceiptIds([...selectedReceiptIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedReceiptIds.length === undepositedReceipts.length) {
      setSelectedReceiptIds([]);
    } else {
      setSelectedReceiptIds(undepositedReceipts.map((r) => r.id));
    }
  };

  const handleSubmit = async () => {
    if (!depositSlipNumber.trim()) {
      setErrorMsg('Deposit Slip / Machine Validated Reference number is required.');
      return;
    }
    if (!bankAccountId) {
      setErrorMsg('Please select an authorized government depositary bank account.');
      return;
    }
    if (selectedReceiptIds.length === 0) {
      setErrorMsg('Please select at least one official receipt to include in this deposit batch.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const [res, err] = await receiptService.createBankDeposit({
      tenantId,
      depositSlipNumber: depositSlipNumber.trim(),
      bankAccountId,
      depositDate: new Date(depositDate).toISOString(),
      cashAmount: totalCash,
      checkAmount: totalChecks,
      officialReceiptIds: selectedReceiptIds,
      remarks: remarks.trim().length > 0 ? remarks.trim() : null,
    });

    setIsSubmitting(false);

    if (err !== null) {
      setErrorMsg(err);
    } else {
      setDepositSlipNumber('');
      setRemarks('');
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
              <View style={[styles.iconBox, { backgroundColor: colors.brand.indigoLight }]}>
                <Lucide name="dollar-sign" size={20} color={colors.brand.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Create Bank Deposit & Remittance Batch</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>Consolidate collections and record validated bank deposit slip</Text>
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

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.neutral[700] }]}>Deposit Slip Number *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                  placeholder="e.g. LBP-DEP-2026-891"
                  placeholderTextColor={colors.neutral[400]}
                  value={depositSlipNumber}
                  onChangeText={setDepositSlipNumber}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <DatePickerInput
                  label="Deposit Date"
                  required
                  placeholder="YYYY-MM-DD"
                  value={depositDate}
                  onChangeText={setDepositDate}
                />
              </View>
            </View>

            {/* Bank Account Picker */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.neutral[700] }]}>Government Depositary Bank Account *</Text>
              <View style={styles.accountSelector}>
                {bankAccounts.map((acc) => {
                  const isSelected = bankAccountId === acc.id;
                  return (
                    <TouchableOpacity
                      key={acc.id}
                      onPress={() => setBankAccountId(acc.id)}
                      style={[
                        styles.accountCard,
                        { borderColor: colors.neutral[200] },
                        isSelected && { borderColor: colors.brand.primary, backgroundColor: colors.brand.indigoLight },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.accountName, { color: colors.text }, isSelected && { color: colors.brand.primary }]}>
                          {acc.bankName} - {acc.accountName}
                        </Text>
                        <Text style={[styles.accountMeta, { color: colors.textMuted }]}>
                          Acct #{acc.accountNumber} | Fund Cluster: {acc.fundCluster}
                        </Text>
                      </View>
                      {isSelected && <Lucide name="check-circle" size={18} color={colors.brand.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Undeposited OR Selection */}
            <View style={[styles.orSection, { borderTopColor: colors.border }]}>
              <View style={styles.orHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Select Collections to Remit ({selectedReceiptIds.length}/{undepositedReceipts.length})
                </Text>
                <TouchableOpacity onPress={handleSelectAll} style={[styles.selectAllBtn, { backgroundColor: colors.neutral[100] }]}>
                  <Text style={[styles.selectAllBtnText, { color: colors.neutral[700] }]}>
                    {selectedReceiptIds.length === undepositedReceipts.length ? 'Deselect All' : 'Select All'}
                  </Text>
                </TouchableOpacity>
              </View>

              {undepositedReceipts.length === 0 ? (
                <View style={styles.emptyOrBox}>
                  <Text style={[styles.emptyOrText, { color: colors.textMuted }]}>No undeposited official receipts currently pending remittance.</Text>
                </View>
              ) : (
                <View style={[styles.orList, { borderColor: colors.neutral[200] }]}>
                  {undepositedReceipts.map((r) => {
                    const isChecked = selectedReceiptIds.includes(r.id);
                    return (
                      <TouchableOpacity
                        key={r.id}
                        onPress={() => toggleSelectReceipt(r.id)}
                        style={[styles.orItem, isChecked && styles.orItemSelected]}
                      >
                        <View style={[styles.checkbox, { borderColor: colors.neutral[400] }, isChecked && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }]}>
                          {isChecked && <Lucide name="check" size={14} color="#fff" />}
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text style={[styles.orNum, { color: colors.text }]}>OR #{r.officialReceiptNumber}</Text>
                          <Text style={[styles.orPayor, { color: colors.textMuted }]}>
                            {r.payorName} ({r.paymentMethod})
                          </Text>
                        </View>
                        <Text style={[styles.orAmount, { color: colors.text }]}>
                          ₱{(r.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Remittance Totals Summary */}
            <View style={[styles.summaryCard, { borderColor: colors.border }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Cash Collections:</Text>
                <Text style={[styles.summaryVal, { color: colors.text }]}>
                  ₱{(totalCash ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Check Collections:</Text>
                <Text style={[styles.summaryVal, { color: colors.text }]}>
                  ₱{(totalChecks ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalSummaryRow, { borderTopColor: colors.neutral[300] }]}>
                <Text style={[styles.totalSummaryLabel, { color: colors.text }]}>TOTAL DEPOSIT AMOUNT:</Text>
                <Text style={[styles.totalSummaryVal, { color: colors.semantic.successText }]}>
                  ₱{(totalDepositAmount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.neutral[700] }]}>Deposit Slip Remarks / Bank Teller Note</Text>
              <TextInput
                style={[styles.input, { height: 60, textAlignVertical: 'top', borderColor: colors.neutral[300], color: colors.text }]}
                multiline
                placeholder="Optional deposit details or machine validation note"
                placeholderTextColor={colors.neutral[400]}
                value={remarks}
                onChangeText={setRemarks}
              />
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={[styles.cancelBtn, { backgroundColor: colors.neutral[100] }]}>
              <Text style={[styles.cancelBtnText, { color: colors.neutral[700] }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || selectedReceiptIds.length === 0}
              style={[
                styles.submitBtn,
                { backgroundColor: colors.brand.primary },
                (isSubmitting || selectedReceiptIds.length === 0) && { opacity: 0.7 },
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Lucide name="check" size={16} color="#fff" />
                  <Text style={styles.submitBtnText}>Confirm Bank Deposit</Text>
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
    maxWidth: 680,
    maxHeight: '92%',
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
  formGroup: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
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
  accountSelector: {
    gap: 8,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#F8FAFC',
  },
  accountName: {
    fontSize: 13,
    fontWeight: '700',
  },
  accountMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  orSection: {
    marginBottom: 16,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  orHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  selectAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  selectAllBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyOrBox: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyOrText: {
    fontSize: 12,
  },
  orList: {
    maxHeight: 180,
    borderWidth: 1,
    borderRadius: 8,
    padding: 4,
  },
  orItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  orItemSelected: {
    backgroundColor: '#F0FDF4',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orNum: {
    fontSize: 12,
    fontWeight: '700',
  },
  orPayor: {
    fontSize: 11,
  },
  orAmount: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryCard: {
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
  summaryVal: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalSummaryRow: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0,
  },
  totalSummaryLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  totalSummaryVal: {
    fontSize: 15,
    fontWeight: '800',
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
