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
} from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { receiptService, NextAvailableOrDto, PendingPaymentDto, PaymentMethod, IssueReceiptLineItemInput } from '@edge/api';

interface IssueReceiptModalProps {
  visible: boolean;
  tenantId: string;
  nextOr?: NextAvailableOrDto;
  pendingPayment?: PendingPaymentDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function IssueReceiptModal({
  visible,
  tenantId,
  nextOr,
  pendingPayment,
  onClose,
  onSuccess,
}: IssueReceiptModalProps) {
  const { colors } = useTheme();
  const [payorName, setPayorName] = useState('');
  const [payorAddress, setPayorAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [checkNumber, setCheckNumber] = useState('');
  const [checkBank, setCheckBank] = useState('');
  const [checkDate, setCheckDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [manualOrNumber, setManualOrNumber] = useState('');
  const [useManualOr, setUseManualOr] = useState(false);

  const [lineItems, setLineItems] = useState<IssueReceiptLineItemInput[]>([
    { feeCode: 'REG-FEE', description: 'Radio Station License / Permit Fee', amount: 0 },
  ]);

  useEffect(() => {
    if (visible && pendingPayment !== undefined && pendingPayment !== null) {
      setPayorName(pendingPayment.applicantName);
      setRemarks(`Payment for OP #${pendingPayment.opNumber} (App #${pendingPayment.applicationNumber || pendingPayment.referenceNumber})`);
      if (pendingPayment.lineItems.length > 0) {
        setLineItems(
          pendingPayment.lineItems.map((li) => ({
            feeCode: li.feeCode,
            description: li.description,
            amount: li.amount,
          }))
        );
      } else {
        setLineItems([
          {
            feeCode: 'PAYMENT',
            description: `Payment for ${pendingPayment.serviceName}`,
            amount: pendingPayment.amountDue,
          },
        ]);
      }
    } else if (visible && (pendingPayment === undefined || pendingPayment === null)) {
      setPayorName('');
      setPayorAddress('');
      setRemarks('');
      setCheckNumber('');
      setCheckBank('');
      setCheckDate('');
      setLineItems([{ feeCode: 'REG-FEE', description: 'Radio Station License / Permit Fee', amount: 0 }]);
    }
  }, [visible, pendingPayment]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalAmount = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { feeCode: '', description: '', amount: 0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleUpdateLineItem = (index: number, field: keyof IssueReceiptLineItemInput, value: string | number) => {
    const updated = [...lineItems];
    if (field === 'amount') {
      updated[index] = { ...updated[index], amount: Number(value) || 0 };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setLineItems(updated);
  };

  const handleSubmit = async () => {
    if (!payorName.trim()) {
      setErrorMsg('Payor name is required.');
      return;
    }
    if (totalAmount <= 0) {
      setErrorMsg('Receipt total amount must be greater than 0.');
      return;
    }
    if (paymentMethod === 'Check' && (!checkNumber.trim() || !checkBank.trim())) {
      setErrorMsg('Check number and Bank name are required for Check payments.');
      return;
    }
    if (!useManualOr && (!nextOr || !nextOr.hasActiveBooklet)) {
      setErrorMsg('No active OR booklet series found. Please register an OR booklet first or use manual override.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const [res, err] = await receiptService.issueOfficialReceipt({
      tenantId,
      orderOfPaymentId: pendingPayment?.orderOfPaymentId ?? null,
      bookletId: useManualOr ? null : (nextOr?.bookletId ?? null),
      manualOrNumber: useManualOr && manualOrNumber.trim().length > 0 ? manualOrNumber.trim() : null,
      payorName: payorName.trim(),
      payorAddress: payorAddress.trim().length > 0 ? payorAddress.trim() : null,
      amount: totalAmount,
      paymentMethod,
      checkNumber: paymentMethod === 'Check' && checkNumber.trim().length > 0 ? checkNumber.trim() : null,
      checkBank: paymentMethod === 'Check' && checkBank.trim().length > 0 ? checkBank.trim() : null,
      checkDate: paymentMethod === 'Check' && checkDate.trim().length > 0 ? checkDate.trim() : null,
      remarks: remarks.trim().length > 0 ? remarks.trim() : null,
      lineItems: lineItems.filter((l) => l.feeCode.trim().length > 0 && l.amount > 0),
    });

    setIsSubmitting(false);

    if (err !== null) {
      setErrorMsg(err);
    } else {
      setPayorName('');
      setPayorAddress('');
      setCheckNumber('');
      setCheckBank('');
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
                <Lucide name="printer" size={20} color={colors.brand.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Issue Official Receipt (Form 51)</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  {useManualOr
                    ? 'Manual OR Number Override'
                    : nextOr?.hasActiveBooklet
                    ? `Active Series: ${nextOr.formattedOrNumber ?? ''} (${nextOr.remainingCount} left in ${nextOr.bookletNumber ?? ''})`
                    : 'No active OR booklet bundle active'}
                </Text>
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

            {/* Serial Number & Series Card */}
            <View style={[styles.seriesCard, { borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.seriesLabel, { color: colors.textMuted }]}>RECEIPT SERIAL NUMBER</Text>
                <Text style={[styles.seriesValue, { color: colors.brand.primary }]}>
                  {useManualOr ? (manualOrNumber || 'Enter number') : (nextOr?.formattedOrNumber ?? 'NO ACTIVE BOOKLET')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setUseManualOr(!useManualOr)}
                style={[styles.overrideBtn, { backgroundColor: colors.neutral[200] }]}
              >
                <Text style={[styles.overrideBtnText, { color: colors.neutral[700] }]}>
                  {useManualOr ? 'Use Booklet' : 'Manual Override'}
                </Text>
              </TouchableOpacity>
            </View>

            {useManualOr && (
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.neutral[700] }]}>Custom OR Number *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                  placeholder="e.g. NTC-1002049"
                  placeholderTextColor={colors.neutral[400]}
                  value={manualOrNumber}
                  onChangeText={setManualOrNumber}
                />
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.neutral[700] }]}>Payor Name / Company *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                placeholder="e.g. Juan Dela Cruz / Globe Telecom Inc."
                placeholderTextColor={colors.neutral[400]}
                value={payorName}
                onChangeText={setPayorName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.neutral[700] }]}>Payor Address</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                placeholder="City / Municipality, Province"
                placeholderTextColor={colors.neutral[400]}
                value={payorAddress}
                onChangeText={setPayorAddress}
              />
            </View>

            {/* Payment Method Selector */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.neutral[700] }]}>Payment Method *</Text>
              <View style={styles.methodRow}>
                {(['Cash', 'Check', 'Online'] as PaymentMethod[]).map((method) => {
                  const isSelected = paymentMethod === method;
                  return (
                    <TouchableOpacity
                      key={method}
                      onPress={() => setPaymentMethod(method)}
                      style={[
                        styles.methodBtn,
                        { backgroundColor: colors.neutral[100], borderColor: colors.neutral[300] },
                        isSelected && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary },
                      ]}
                    >
                      <Lucide
                        name={method === 'Cash' ? 'dollar-sign' : method === 'Check' ? 'credit-card' : 'globe'}
                        size={16}
                        color={isSelected ? '#fff' : colors.neutral[700]}
                      />
                      <Text
                        style={[
                          styles.methodBtnText,
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

            {/* Check Details if Check selected */}
            {paymentMethod === 'Check' && (
              <View style={[styles.checkCard, { borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Check Details</Text>
                <View style={styles.row}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={[styles.label, { color: colors.neutral[700] }]}>Check Number *</Text>
                    <TextInput
                      style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                      placeholder="e.g. 00012389"
                      placeholderTextColor={colors.neutral[400]}
                      value={checkNumber}
                      onChangeText={setCheckNumber}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={[styles.label, { color: colors.neutral[700] }]}>Drawee Bank *</Text>
                    <TextInput
                      style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                      placeholder="e.g. Land Bank / BDO"
                      placeholderTextColor={colors.neutral[400]}
                      value={checkBank}
                      onChangeText={setCheckBank}
                    />
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.neutral[700] }]}>Check Date</Text>
                  <TextInput
                    style={[styles.input, { borderColor: colors.neutral[300], color: colors.text }]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.neutral[400]}
                    value={checkDate}
                    onChangeText={setCheckDate}
                  />
                </View>
              </View>
            )}

            {/* Line Items Breakdown */}
            <View style={[styles.itemsSection, { borderTopColor: colors.border }]}>
              <View style={styles.itemsHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Particulars & Fee Breakdown</Text>
                <TouchableOpacity onPress={handleAddLineItem} style={[styles.addItemBtn, { backgroundColor: colors.brand.indigoLight }]}>
                  <Lucide name="plus" size={14} color={colors.brand.primary} />
                  <Text style={[styles.addItemBtnText, { color: colors.brand.primary }]}>Add Item</Text>
                </TouchableOpacity>
              </View>

              {lineItems.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginRight: 6, borderColor: colors.neutral[300], color: colors.text }]}
                    placeholder="Fee Code"
                    placeholderTextColor={colors.neutral[400]}
                    value={item.feeCode}
                    onChangeText={(val) => handleUpdateLineItem(idx, 'feeCode', val)}
                  />
                  <TextInput
                    style={[styles.input, { flex: 2, marginRight: 6, borderColor: colors.neutral[300], color: colors.text }]}
                    placeholder="Description"
                    placeholderTextColor={colors.neutral[400]}
                    value={item.description}
                    onChangeText={(val) => handleUpdateLineItem(idx, 'description', val)}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1, marginRight: 6, borderColor: colors.neutral[300], color: colors.text }]}
                    keyboardType="numeric"
                    placeholder="Amount (₱)"
                    placeholderTextColor={colors.neutral[400]}
                    value={item.amount > 0 ? item.amount.toString() : ''}
                    onChangeText={(val) => handleUpdateLineItem(idx, 'amount', val)}
                  />
                  {lineItems.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveLineItem(idx)}
                      style={styles.removeItemBtn}
                    >
                      <Lucide name="trash-2" size={16} color={colors.semantic.error} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <View style={[styles.totalRow, { backgroundColor: colors.neutral[100] }]}>
                <Text style={[styles.totalLabel, { color: colors.neutral[700] }]}>TOTAL AMOUNT DUE / RECEIVED:</Text>
                <Text style={[styles.totalValue, { color: colors.semantic.successText }]}>
                  ₱{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.neutral[700] }]}>Remarks / Order of Payment Reference</Text>
              <TextInput
                style={[styles.input, { height: 60, textAlignVertical: 'top', borderColor: colors.neutral[300], color: colors.text }]}
                multiline
                placeholder="Optional notes or reference numbers"
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
                  <Lucide name="check-circle" size={16} color="#fff" />
                  <Text style={styles.submitBtnText}>Issue Official Receipt</Text>
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
  seriesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  seriesLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  seriesValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  overrideBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  overrideBtnText: {
    fontSize: 11,
    fontWeight: '600',
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
  methodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  methodBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  checkCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  itemsSection: {
    marginBottom: 16,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  addItemBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeItemBtn: {
    padding: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 16,
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
