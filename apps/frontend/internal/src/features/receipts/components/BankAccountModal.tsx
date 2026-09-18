import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { receiptService, AgencyBankAccountDto } from '@edge/api';

interface BankAccountModalProps {
  visible: boolean;
  tenantId: string;
  account: AgencyBankAccountDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function BankAccountModal({
  visible,
  tenantId,
  account,
  onClose,
  onSuccess,
}: BankAccountModalProps) {
  const { colors } = useTheme();
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [fundCluster, setFundCluster] = useState('01');
  const [isActive, setIsActive] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (account !== null) {
      setBankName(account.bankName);
      setAccountName(account.accountName);
      setAccountNumber(account.accountNumber);
      setBranch(account.branch ?? '');
      setFundCluster(account.fundCluster);
      setIsActive(account.isActive);
      setRemarks(account.remarks ?? '');
    } else {
      setBankName('Land Bank of the Philippines');
      setAccountName('NTC Regular Fund Collection');
      setAccountNumber('');
      setBranch('');
      setFundCluster('01');
      setIsActive(true);
      setRemarks('');
    }
  }, [account]);

  const handleSubmit = async () => {
    if (!bankName.trim() || !accountName.trim() || !accountNumber.trim()) {
      setErrorMsg('Bank Name, Account Name, and Account Number are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    let res;
    let err;
    if (account !== null) {
      [res, err] = await receiptService.updateAgencyBankAccount(account.id, {
        id: account.id,
        bankName: bankName.trim(),
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        branch: branch.trim().length > 0 ? branch.trim() : null,
        fundCluster: fundCluster.trim(),
        isActive,
        remarks: remarks.trim().length > 0 ? remarks.trim() : null,
      });
    } else {
      [res, err] = await receiptService.createAgencyBankAccount({
        tenantId,
        bankName: bankName.trim(),
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        branch: branch.trim().length > 0 ? branch.trim() : null,
        fundCluster: fundCluster.trim(),
        isActive,
        remarks: remarks.trim().length > 0 ? remarks.trim() : null,
      });
    }

    setIsSubmitting(false);

    if (err !== null) {
      setErrorMsg(err);
    } else {
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
                <Lucide name="credit-card" size={20} color={colors.brand.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>
                  {account !== null ? 'Edit Agency Bank Account' : 'Register Agency Bank Account'}
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>Authorized government depositary bank account (AGDB)</Text>
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

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.neutral[700] }]}>Bank Name *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                placeholder="e.g. Land Bank of the Philippines / DBP"
                placeholderTextColor={colors.neutral[400]}
                value={bankName}
                onChangeText={setBankName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.neutral[700] }]}>Account Name *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                placeholder="e.g. NTC RO Collections - Regular Agency Fund"
                placeholderTextColor={colors.neutral[400]}
                value={accountName}
                onChangeText={setAccountName}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.neutral[700] }]}>Account Number *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                  placeholder="e.g. 0123-4567-89"
                  placeholderTextColor={colors.neutral[400]}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.neutral[700] }]}>Fund Cluster *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                  placeholder="01 (Regular Agency Fund)"
                  placeholderTextColor={colors.neutral[400]}
                  value={fundCluster}
                  onChangeText={setFundCluster}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.neutral[700] }]}>Bank Branch</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                placeholder="e.g. Diliman Central Branch"
                placeholderTextColor={colors.neutral[400]}
                value={branch}
                onChangeText={setBranch}
              />
            </View>

            <View style={[styles.switchRow, { borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>Active Account for Remittance</Text>
                <Text style={[styles.switchSub, { color: colors.textMuted }]}>Allow cashiers to remit collections to this account</Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: colors.neutral[300], true: colors.brand.primary }}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.neutral[700] }]}>Remarks</Text>
              <TextInput
                style={[styles.input, { height: 60, textAlignVertical: 'top', borderColor: colors.neutral[300], color: colors.text }]}
                multiline
                placeholder="Optional account notes or treasury reference"
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
              disabled={isSubmitting}
              style={[styles.submitBtn, { backgroundColor: colors.brand.primary }, isSubmitting && { opacity: 0.7 }]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Lucide name="check" size={16} color="#fff" />
                  <Text style={styles.submitBtnText}>
                    {account !== null ? 'Save Account' : 'Register Account'}
                  </Text>
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
    maxWidth: 540,
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  switchSub: {
    fontSize: 11,
    marginTop: 2,
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
