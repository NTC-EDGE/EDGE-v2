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
import { Icon as Lucide, useTheme, DatePickerInput } from '@edge/ui';
import {
  receiptService,
  useReceiptFeeCatalog,
  NextAvailableOrDto,
  PendingPaymentDto,
  PaymentMethod,
  IssueReceiptLineItemInput,
  ReceiptFeeItemDto,
  OfficialReceiptDto,
} from '@edge/api';
import { FeeSuggestionsDropdown } from './FeeSuggestionsDropdown';

interface IssueReceiptModalProps {
  visible: boolean;
  tenantId: string;
  nextOr?: NextAvailableOrDto;
  pendingPayment?: PendingPaymentDto | null;
  onClose: () => void;
  onSuccess: (issuedReceipt?: OfficialReceiptDto) => void;
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
  const { feeCatalog, isLoading: isLoadingFeeCatalog } = useReceiptFeeCatalog(undefined, visible);

  const [payorName, setPayorName] = useState('');
  const [payorAddress, setPayorAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [checkNumber, setCheckNumber] = useState('');
  const [checkBank, setCheckBank] = useState('');
  const [checkDate, setCheckDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [manualOrNumber, setManualOrNumber] = useState('');
  const [useManualOr, setUseManualOr] = useState(false);

  // Fee Suggestions State
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null);

  // Initial empty fees state for manual issuance
  const [lineItems, setLineItems] = useState<IssueReceiptLineItemInput[]>([
    { feeCode: 'FEE', description: '', amount: 0 },
  ]);

  const isFromPendingPayment = pendingPayment !== undefined && pendingPayment !== null;

  useEffect(() => {
    if (visible && pendingPayment !== undefined && pendingPayment !== null) {
      // Scenario A: Captured automatically from Application / Order of Payment & SOA
      setPayorName(pendingPayment.applicantName);
      setRemarks(`Payment for OP #${pendingPayment.opNumber} (App #${pendingPayment.applicationNumber || pendingPayment.referenceNumber})`);
      if (pendingPayment.lineItems && pendingPayment.lineItems.length > 0) {
        setLineItems(
          pendingPayment.lineItems.map((li) => ({
            feeCode: li.feeCode || 'FEE',
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
      setActiveSuggestionIndex(null);
    } else if (visible && (pendingPayment === undefined || pendingPayment === null)) {
      // Scenario B: Manual Issuance - Cashier writes payee details and starts with empty fees
      setPayorName('');
      setPayorAddress('');
      setRemarks('');
      setCheckNumber('');
      setCheckBank('');
      setCheckDate('');
      setLineItems([{ feeCode: 'FEE', description: '', amount: 0 }]);
      setActiveSuggestionIndex(null);
    }
  }, [visible, pendingPayment]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalAmount = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { feeCode: 'FEE', description: '', amount: 0 }]);
    setActiveSuggestionIndex(lineItems.length);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
      if (activeSuggestionIndex === index) {
        setActiveSuggestionIndex(null);
      }
    }
  };

  const handleUpdateLineItem = (index: number, field: keyof IssueReceiptLineItemInput, value: string | number) => {
    const updated = [...lineItems];
    const target = updated[index];
    if (target !== undefined) {
      if (field === 'amount') {
        updated[index] = { ...target, amount: Number(value) || 0 };
      } else if (field === 'description') {
        updated[index] = { ...target, description: String(value) };
      } else if (field === 'feeCode') {
        updated[index] = { ...target, feeCode: String(value) };
      }
      setLineItems(updated);
    }
  };

  const handleSelectFee = (index: number, fee: ReceiptFeeItemDto) => {
    const updated = [...lineItems];
    updated[index] = {
      feeCode: fee.feeCode,
      description: fee.description,
      amount: fee.amount,
    };
    setLineItems(updated);
    setActiveSuggestionIndex(null);
  };

  const handleSubmit = async () => {
    const effectivePayorName = isFromPendingPayment && pendingPayment !== null && pendingPayment !== undefined
      ? pendingPayment.applicantName
      : payorName.trim();

    if (!effectivePayorName) {
      setErrorMsg('Payee / Payor name is required.');
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

    const validLineItems = lineItems
      .filter((l) => l.description.trim().length > 0 && l.amount > 0)
      .map((l) => ({
        feeCode: l.feeCode.trim().length > 0 ? l.feeCode.trim() : 'FEE',
        description: l.description.trim(),
        amount: l.amount,
      }));

    const effectiveTenantId = (pendingPayment?.tenantId && pendingPayment.tenantId.length > 0)
      ? pendingPayment.tenantId
      : tenantId;

    const [res, err] = await receiptService.issueOfficialReceipt({
      tenantId: effectiveTenantId,
      orderOfPaymentId: pendingPayment?.orderOfPaymentId ?? null,
      bookletId: useManualOr ? null : (nextOr?.bookletId ?? null),
      manualOrNumber: useManualOr && manualOrNumber.trim().length > 0 ? manualOrNumber.trim() : null,
      payorName: effectivePayorName,
      payorAddress: payorAddress.trim().length > 0 ? payorAddress.trim() : null,
      amount: totalAmount,
      paymentMethod,
      checkNumber: paymentMethod === 'Check' && checkNumber.trim().length > 0 ? checkNumber.trim() : null,
      checkBank: paymentMethod === 'Check' && checkBank.trim().length > 0 ? checkBank.trim() : null,
      checkDate: paymentMethod === 'Check' && checkDate.trim().length > 0 ? checkDate.trim() : null,
      remarks: remarks.trim().length > 0 ? remarks.trim() : null,
      lineItems: validLineItems,
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
      onSuccess(res ?? undefined);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.cardBg }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.titleRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.brand.indigoLight }]}>
                <Lucide name="printer" size={18} color={colors.brand.primary} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>
                  {isFromPendingPayment ? 'Issue Official Receipt for Order of Payment' : 'Manual Official Receipt Issuance'}
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  {useManualOr
                    ? 'Manual OR Number Override'
                    : nextOr?.hasActiveBooklet
                    ? `Booklet ${nextOr.bookletNumber ?? ''} (${nextOr.remainingCount} remaining)`
                    : 'No active booklet'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Lucide name="x" size={18} color={colors.neutral[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {errorMsg !== null && (
              <View style={styles.errorBox}>
                <Lucide name="alert-circle" size={15} color={colors.semantic.error} />
                <Text style={[styles.errorText, { color: colors.semantic.error }]}>{errorMsg}</Text>
              </View>
            )}

            {/* UNIFIED RECEIPT CARD */}
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

                {/* Payment Method Selector */}
                <View style={styles.methodSelector}>
                  <Text style={[styles.methodSelectorLabel, { color: colors.textMuted }]}>PAYMENT METHOD</Text>
                  <View style={styles.methodPillGroup}>
                    {(['Cash', 'Check', 'Online'] as PaymentMethod[]).map((method) => {
                      const isSelected = paymentMethod === method;
                      return (
                        <TouchableOpacity
                          key={method}
                          onPress={() => setPaymentMethod(method)}
                          style={[
                            styles.methodPill,
                            { backgroundColor: colors.neutral[100], borderColor: colors.neutral[300] },
                            isSelected && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary },
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

              {/* Payee Details Section */}
              {isFromPendingPayment && pendingPayment !== null && pendingPayment !== undefined ? (
                /* Auto-captured Payee & SOA Information from Order of Payment */
                <View style={[styles.readOnlyPayorCard, { backgroundColor: '#fff', borderColor: colors.border }]}>
                  <View style={styles.readOnlyField}>
                    <Text style={[styles.readOnlyLabel, { color: colors.textMuted }]}>PAYEE / APPLICANT NAME (AUTO-CAPTURED)</Text>
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
              ) : (
                /* Manual Payee Entry for Walk-in Cashier Payments */
                <View style={styles.payorFieldsRow}>
                  <View style={{ flex: 1.5, marginRight: 8 }}>
                    <Text style={[styles.inlineFieldLabel, { color: colors.neutral[700] }]}>Payee Name / Company *</Text>
                    <TextInput
                      style={[styles.input, { borderColor: colors.neutral[300], color: colors.text, backgroundColor: '#fff' }]}
                      placeholder="Write payee / payor name manually"
                      placeholderTextColor={colors.neutral[400]}
                      value={payorName}
                      onChangeText={setPayorName}
                      autoFocus
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inlineFieldLabel, { color: colors.neutral[700] }]}>Payee Address (Optional)</Text>
                    <TextInput
                      style={[styles.input, { borderColor: colors.neutral[300], color: colors.text, backgroundColor: '#fff' }]}
                      placeholder="City / Municipality"
                      placeholderTextColor={colors.neutral[400]}
                      value={payorAddress}
                      onChangeText={setPayorAddress}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* PARTICULARS & AMOUNT BREAKDOWN (Locked for OP payment, editable only for manual issuance) */}
            <View style={styles.breakdownSection}>
              <View style={styles.breakdownHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sectionHeading, { color: colors.text }]}>
                    {isFromPendingPayment ? 'Prescribed Items to be Paid (Assessed Fees)' : 'Particulars & Fee Breakdown'}
                  </Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                    {isFromPendingPayment
                      ? 'Fees and particulars are determined by Evaluator/Accountant and locked for Cashier collection.'
                      : 'Search fee code (e.g. REG-FEE, EXAM) or enter custom particulars'}
                  </Text>
                </View>
                {!isFromPendingPayment && (
                  <View style={styles.breakdownActions}>
                    <TouchableOpacity
                      onPress={handleAddLineItem}
                      style={[styles.addItemBtn, { backgroundColor: colors.brand.primary }]}
                    >
                      <Lucide name="plus" size={13} color="#fff" />
                      <Text style={[styles.addItemBtnText, { color: '#fff' }]}>Add Item</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Line Items List */}
              {isFromPendingPayment ? (
                <View style={{ marginBottom: 4 }}>
                  {lineItems.map((item, idx) => (
                    <View key={idx} style={[styles.readOnlyLineItemCard, { borderColor: colors.border, backgroundColor: colors.cardBg }]}>
                      <View style={styles.readOnlyLineItemLeft}>
                        <View style={[styles.readOnlyFeeCodeBadge, { backgroundColor: colors.neutral[100] }]}>
                          <Text style={[styles.readOnlyFeeCodeText, { color: colors.neutral[700] }]}>
                            {item.feeCode || 'FEE'}
                          </Text>
                        </View>
                        <Text style={[styles.readOnlyDescText, { color: colors.text }]} numberOfLines={2}>
                          {item.description}
                        </Text>
                      </View>
                      <Text style={[styles.readOnlyAmountText, { color: colors.semantic.successText }]}>
                        ₱{(item.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                lineItems.map((item, idx) => (
                  <View key={idx} style={styles.lineItemWrapper}>
                    <View style={styles.lineItemRow}>
                      {/* Description / Particulars Search Input (Searchable by Fee Code or Description) */}
                      <View style={{ flex: 3, marginRight: 8, position: 'relative' }}>
                        <View style={[styles.searchInputWrapper, { borderColor: colors.neutral[300] }]}>
                          <Lucide name="search" size={14} color={colors.neutral[400]} style={{ marginRight: 6 }} />
                          <TextInput
                            style={[styles.descInput, { color: colors.text }]}
                            placeholder="Search fee code (e.g. REG-FEE) or type particulars..."
                            placeholderTextColor={colors.neutral[400]}
                            value={item.description}
                            onFocus={() => setActiveSuggestionIndex(idx)}
                            onChangeText={(val) => {
                              handleUpdateLineItem(idx, 'description', val);
                              setActiveSuggestionIndex(idx);
                            }}
                          />
                        </View>
                      </View>

                      {/* Amount Input */}
                      <View style={{ width: 140, marginRight: 6 }}>
                        <View style={[styles.amountInputWrapper, { borderColor: colors.neutral[300] }]}>
                          <Text style={[styles.currencyPrefix, { color: colors.neutral[500] }]}>₱</Text>
                          <TextInput
                            style={[styles.amountInput, { color: colors.text }]}
                            keyboardType="numeric"
                            placeholder="0.00"
                            placeholderTextColor={colors.neutral[400]}
                            value={item.amount > 0 ? item.amount.toString() : ''}
                            onChangeText={(val) => handleUpdateLineItem(idx, 'amount', val)}
                          />
                        </View>
                      </View>

                      {/* Remove Row Button */}
                      {lineItems.length > 1 && (
                        <TouchableOpacity
                          onPress={() => handleRemoveLineItem(idx)}
                          style={styles.removeItemBtn}
                          accessibilityLabel="Remove Line Item"
                        >
                          <Lucide name="trash-2" size={15} color={colors.semantic.error} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Auto-Complete Fee Suggestions Popover */}
                    {activeSuggestionIndex === idx && (
                      <FeeSuggestionsDropdown
                        feeCatalog={feeCatalog}
                        isLoading={isLoadingFeeCatalog}
                        query={item.description || item.feeCode || ''}
                        onSelect={(fee) => handleSelectFee(idx, fee)}
                        onClose={() => setActiveSuggestionIndex(null)}
                      />
                    )}
                  </View>
                ))
              )}

              {/* Total Amount Summary Banner */}
              <View style={[styles.totalBanner, { backgroundColor: colors.neutral[100], borderColor: colors.border }]}>
                <Text style={[styles.totalBannerLabel, { color: colors.neutral[700] }]}>TOTAL AMOUNT RECEIVED:</Text>
                <Text style={[styles.totalBannerValue, { color: colors.semantic.successText }]}>
                  ₱{(totalAmount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            {/* Remarks Field */}
            <View style={styles.remarksBox}>
              <Text style={[styles.inlineFieldLabel, { color: colors.neutral[700] }]}>Remarks / Reference Notes (Optional)</Text>
              <TextInput
                style={[styles.input, { height: 44, borderColor: colors.neutral[300], color: colors.text, backgroundColor: '#fff' }]}
                placeholder="Optional notes, transaction numbers or references"
                placeholderTextColor={colors.neutral[400]}
                value={remarks}
                onChangeText={setRemarks}
              />
            </View>
          </ScrollView>

          {/* Footer Actions */}
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
                  <Lucide name="check-circle" size={15} color="#fff" />
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
    maxWidth: 640,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
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
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    flex: 1,
  },
  mainCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
  },
  orBadgeContainer: {
    flex: 1,
    minWidth: 160,
  },
  orBadgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  orBadgeValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  overrideLink: {
    marginTop: 6,
  },
  overrideLinkText: {
    fontSize: 11,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  seriesInfoPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  seriesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  seriesPillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  methodSelector: {
    alignItems: 'flex-end',
  },
  methodSelectorLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  methodPillGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  methodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  methodPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inlineManualOrBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopColor: '#E2E8F0',
  },
  checkInlineBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  checkFieldsRow: {
    flexDirection: 'row',
  },
  readOnlyPayorCard: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  readOnlyField: {
    flex: 1,
    minWidth: 140,
  },
  readOnlyLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  readOnlyValue: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  payorFieldsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  inlineFieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  breakdownSection: {
    marginBottom: 16,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  breakdownActions: {
    flexDirection: 'row',
    gap: 6,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addItemBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  lineItemWrapper: {
    marginBottom: 8,
  },
  lineItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    height: 38,
  },
  descInput: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 0,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    height: 38,
  },
  currencyPrefix: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 0,
  },
  removeItemBtn: {
    padding: 6,
  },
  readOnlyLineItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6,
  },
  readOnlyLineItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  readOnlyFeeCodeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  readOnlyFeeCodeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  readOnlyDescText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  readOnlyAmountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  totalBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  totalBannerLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  totalBannerValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  remarksBox: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    backgroundColor: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
