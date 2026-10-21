import { useState, useEffect, useMemo } from 'react';
import {
  receiptService,
  NextAvailableOrDto,
  PendingPaymentDto,
  PaymentMethod,
  IssueReceiptLineItemInput,
  OfficialReceiptDto,
  parsePaymentBreakdown,
  ReceiptFeeItemDto,
} from '@edge/api';

interface UseIssueReceiptFormProps {
  visible: boolean;
  tenantId: string;
  nextOr?: NextAvailableOrDto;
  pendingPayment?: PendingPaymentDto | null;
  onClose: () => void;
  onSuccess: (issuedReceipt?: OfficialReceiptDto) => void;
}

export function useIssueReceiptForm({
  visible,
  tenantId,
  nextOr,
  pendingPayment,
  onClose,
  onSuccess,
}: UseIssueReceiptFormProps) {
  const [payorName, setPayorName] = useState('');
  const [payorAddress, setPayorAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [checkNumber, setCheckNumber] = useState('');
  const [checkBank, setCheckBank] = useState('');
  const [checkDate, setCheckDate] = useState('');
  const [onlineReference, setOnlineReference] = useState('');
  const [clientPaymentDetails, setClientPaymentDetails] = useState<{
    checkNumber: string;
    checkBank: string;
    checkDate: string;
    onlineReference: string;
  }>({ checkNumber: '', checkBank: '', checkDate: '', onlineReference: '' });
  const [remarks, setRemarks] = useState('');
  const [manualOrNumber, setManualOrNumber] = useState('');
  const [useManualOr, setUseManualOr] = useState(false);
  const [issuanceStrategy, setIssuanceStrategy] = useState<'Consolidated' | 'SplitPerMode'>('Consolidated');
  const [selectedSplitIndex, setSelectedSplitIndex] = useState<number>(0);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null);
  const [lineItems, setLineItems] = useState<IssueReceiptLineItemInput[]>([{ feeCode: 'FEE', description: '', amount: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0] ?? '', []);
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0] ?? '');
  const [dateChangeReason, setDateChangeReason] = useState('');

  const isFromPendingPayment = pendingPayment !== undefined && pendingPayment !== null;
  const preferredBreakdown = useMemo(() => parsePaymentBreakdown(pendingPayment?.remarks), [pendingPayment?.remarks]);
  const totalAmount = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  useEffect(() => {
    if (visible && pendingPayment !== undefined && pendingPayment !== null) {
      const parsed = parsePaymentBreakdown(pendingPayment.remarks);
      const resolvedPayorName = parsed?.payorName || pendingPayment.payorName || pendingPayment.applicantName || '';
      setPayorName(resolvedPayorName);
      if (pendingPayment.payorAddress) {
        setPayorAddress(pendingPayment.payorAddress);
      }
      const parsedCheck = parsed?.items.find((i) => i.mode === 'Check');
      const parsedOnline = parsed?.items.find((i) => i.mode === 'Online');

      const resolvedCheckNumber = parsedCheck?.checkNumber ?? pendingPayment.checkNumber ?? '';
      const resolvedCheckBank = parsedCheck?.checkBank ?? pendingPayment.checkBank ?? '';
      const resolvedCheckDate = parsedCheck?.checkDate ?? (pendingPayment.checkDate ? pendingPayment.checkDate.split('T')[0] : '');
      const resolvedOnlineRef = parsedOnline?.referenceNumber ?? pendingPayment.paymentReferenceNumber ?? '';

      setClientPaymentDetails({
        checkNumber: resolvedCheckNumber,
        checkBank: resolvedCheckBank,
        checkDate: resolvedCheckDate,
        onlineReference: resolvedOnlineRef,
      });

      if (parsed !== null && parsed.isCombination) {
        const hasAnyIssued = parsed.items.some((i) => i.isIssued || i.orNumber);
        const firstUnissuedIdx = parsed.items.findIndex((i) => !i.isIssued && !i.orNumber);

        if (hasAnyIssued && firstUnissuedIdx !== -1) {
          const target = parsed.items[firstUnissuedIdx];
          setIssuanceStrategy('SplitPerMode');
          setSelectedSplitIndex(firstUnissuedIdx);
          setPaymentMethod(target.mode);
          setCheckNumber(target.mode === 'Check' ? (target.checkNumber ?? '') : '');
          setCheckBank(target.mode === 'Check' ? (target.checkBank ?? '') : '');
          setCheckDate(target.mode === 'Check' ? (target.checkDate ?? '') : '');
          setOnlineReference(target.mode === 'Online' ? (target.referenceNumber ?? '') : '');
          setLineItems([{
            feeCode: target.mode.toUpperCase(),
            description: `Payment portion (${target.mode}) for ${pendingPayment.serviceName}`,
            amount: target.amount,
          }]);
          const refSuffix = target.mode === 'Online' && target.referenceNumber ? ` [Ref: ${target.referenceNumber}]` : '';
          setRemarks(`Payment portion (${target.mode}): ₱${target.amount.toFixed(2)}${refSuffix} for OP #${pendingPayment.opNumber}`);
          setActiveSuggestionIndex(null);
          return;
        }

        setIssuanceStrategy('Consolidated');
        setSelectedSplitIndex(0);
        if (parsedCheck !== undefined) {
          setPaymentMethod('Check');
          setCheckNumber(resolvedCheckNumber);
          setCheckBank(resolvedCheckBank);
          setCheckDate(resolvedCheckDate);
        } else if (parsedOnline !== undefined) {
          setPaymentMethod('Online');
          setOnlineReference(resolvedOnlineRef);
        } else {
          setPaymentMethod('Cash');
        }
        if (resolvedOnlineRef) {
          setOnlineReference(resolvedOnlineRef);
        }
        setRemarks(`Payment for OP #${pendingPayment.opNumber} (Modes: ${parsed.items.map((i) => `${i.mode}: ₱${i.amount.toFixed(2)}`).join(' + ')})`);
      } else if (parsed !== null && !parsed.isCombination) {
        const firstMode = parsed.items[0];
        if (firstMode !== undefined) {
          setPaymentMethod(firstMode.mode);
        }
        if (parsedCheck !== undefined) {
          setPaymentMethod('Check');
          setCheckNumber(resolvedCheckNumber);
          setCheckBank(resolvedCheckBank);
          setCheckDate(resolvedCheckDate);
        }
        if (resolvedOnlineRef) {
          setOnlineReference(resolvedOnlineRef);
        }
        setRemarks(`Payment for OP #${pendingPayment.opNumber} (App #${pendingPayment.applicationNumber || pendingPayment.referenceNumber})`);
      } else {
        if (pendingPayment.paymentMethod === 'Check' || resolvedCheckBank || resolvedCheckNumber) {
          setPaymentMethod('Check');
          setCheckNumber(resolvedCheckNumber);
          setCheckBank(resolvedCheckBank);
          setCheckDate(resolvedCheckDate);
        } else if (pendingPayment.paymentMethod === 'Online' || resolvedOnlineRef) {
          setPaymentMethod('Online');
          setOnlineReference(resolvedOnlineRef);
        } else {
          setPaymentMethod('Cash');
        }
        setRemarks(`Payment for OP #${pendingPayment.opNumber} (App #${pendingPayment.applicationNumber || pendingPayment.referenceNumber})`);
      }

      if (pendingPayment.lineItems && pendingPayment.lineItems.length > 0) {
        setLineItems(pendingPayment.lineItems.map((li) => ({ feeCode: li.feeCode || 'FEE', description: li.description, amount: li.amount })));
      } else {
        setLineItems([{ feeCode: 'PAYMENT', description: `Payment for ${pendingPayment.serviceName}`, amount: pendingPayment.amountDue }]);
      }
      setActiveSuggestionIndex(null);
    } else if (visible && (pendingPayment === undefined || pendingPayment === null)) {
      setPayorName('');
      setPayorAddress('');
      setRemarks('');
      setCheckNumber('');
      setCheckBank('');
      setCheckDate('');
      setOnlineReference('');
      setClientPaymentDetails({ checkNumber: '', checkBank: '', checkDate: '', onlineReference: '' });
      setIssuanceStrategy('Consolidated');
      setSelectedSplitIndex(0);
      setLineItems([{ feeCode: 'FEE', description: '', amount: 0 }]);
      setActiveSuggestionIndex(null);
    }
  }, [visible, pendingPayment]);

  const handlePaymentMethodChange = (newMethod: PaymentMethod) => {
    setPaymentMethod(newMethod);
    if (newMethod === 'Check') {
      if (clientPaymentDetails.checkNumber) {
        setCheckNumber(clientPaymentDetails.checkNumber);
      }
      if (clientPaymentDetails.checkBank) {
        setCheckBank(clientPaymentDetails.checkBank);
      }
      if (clientPaymentDetails.checkDate) {
        setCheckDate(clientPaymentDetails.checkDate);
      }
    } else if (newMethod === 'Online') {
      if (clientPaymentDetails.onlineReference) {
        setOnlineReference(clientPaymentDetails.onlineReference);
      }
    }
  };

  const handleSelectSplitItem = (idx: number) => {
    if (!preferredBreakdown || !pendingPayment) return;
    const target = preferredBreakdown.items[idx];
    if (target === undefined || target.isIssued || target.orNumber) return;
    setSelectedSplitIndex(idx);
    setPaymentMethod(target.mode);
    setCheckNumber(target.mode === 'Check' ? (target.checkNumber ?? '') : '');
    setCheckBank(target.mode === 'Check' ? (target.checkBank ?? '') : '');
    setCheckDate(target.mode === 'Check' ? (target.checkDate ?? '') : '');
    setOnlineReference(target.mode === 'Online' ? (target.referenceNumber ?? '') : '');
    setLineItems([{ feeCode: target.mode.toUpperCase(), description: `Payment portion (${target.mode}) for ${pendingPayment.serviceName}`, amount: target.amount }]);
    const refSuffix = target.mode === 'Online' && target.referenceNumber ? ` [Ref: ${target.referenceNumber}]` : '';
    setRemarks(`Payment portion (${target.mode}): ₱${target.amount.toFixed(2)}${refSuffix} for OP #${pendingPayment.opNumber}`);
  };

  const handleSelectStrategy = (strat: 'Consolidated' | 'SplitPerMode') => {
    if (!preferredBreakdown || !pendingPayment) return;
    const hasAnyIssued = preferredBreakdown.items.some((i) => i.isIssued || i.orNumber);
    if (hasAnyIssued && strat === 'Consolidated') {
      return; // Cannot consolidate if a split receipt was already issued
    }
    setIssuanceStrategy(strat);
    if (strat === 'Consolidated') {
      if (pendingPayment.lineItems && pendingPayment.lineItems.length > 0) {
        setLineItems(pendingPayment.lineItems.map((li) => ({ feeCode: li.feeCode || 'FEE', description: li.description, amount: li.amount })));
      } else {
        setLineItems([{ feeCode: 'PAYMENT', description: `Payment for ${pendingPayment.serviceName}`, amount: pendingPayment.amountDue }]);
      }
      const checkItem = preferredBreakdown.items.find((i) => i.mode === 'Check');
      const onlineItem = preferredBreakdown.items.find((i) => i.mode === 'Online');
      if (checkItem !== undefined) {
        setPaymentMethod('Check');
        setCheckNumber(checkItem.checkNumber ?? '');
        setCheckBank(checkItem.checkBank ?? '');
        setCheckDate(checkItem.checkDate ?? '');
      } else if (onlineItem !== undefined) {
        setPaymentMethod('Online');
        setOnlineReference(onlineItem.referenceNumber ?? '');
      } else {
        setPaymentMethod('Cash');
      }
      if (onlineItem !== undefined) {
        setOnlineReference(onlineItem.referenceNumber ?? '');
      }
      setRemarks(`Payment for OP #${pendingPayment.opNumber} (Modes: ${preferredBreakdown.items.map((i) => `${i.mode}: ₱${i.amount.toFixed(2)}`).join(' + ')})`);
    } else {
      const firstUnissued = preferredBreakdown.items.findIndex((i) => !i.isIssued && !i.orNumber);
      const targetIdx = firstUnissued !== -1 ? firstUnissued : 0;
      handleSelectSplitItem(targetIdx);
    }
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { feeCode: 'FEE', description: '', amount: 0 }]);
    setActiveSuggestionIndex(lineItems.length);
  };

  const handleRemoveLineItem = (idx: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== idx));
    }
  };

  const handleUpdateLineItem = (idx: number, field: keyof IssueReceiptLineItemInput, val: string | number) => {
    const updated = [...lineItems];
    const target = updated[idx];
    if (target) {
      updated[idx] = { ...target, [field]: field === 'amount' ? Number(val) || 0 : String(val) };
      setLineItems(updated);
    }
  };

  const handleSelectFee = (idx: number, fee: ReceiptFeeItemDto) => {
    const updated = [...lineItems];
    updated[idx] = { feeCode: fee.feeCode, description: fee.description, amount: fee.amount };
    setLineItems(updated);
    setActiveSuggestionIndex(null);
  };

  const handleSubmit = async () => {
    const effectivePayorName = payorName.trim();
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
    if (issueDate !== todayStr && !dateChangeReason.trim()) {
      setErrorMsg('A reason is required when overriding the Official Receipt issue date.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    const validLineItems = lineItems
      .filter((l) => l.description.trim().length > 0 && l.amount > 0)
      .map((l) => ({ feeCode: l.feeCode.trim() || 'FEE', description: l.description.trim(), amount: l.amount }));

    const effectiveTenantId = pendingPayment?.tenantId && pendingPayment.tenantId.length > 0 ? pendingPayment.tenantId : tenantId;
    const finalRemarks = remarks.trim()
      ? (paymentMethod === 'Online' && onlineReference.trim() && !remarks.includes(onlineReference.trim())
          ? `${remarks.trim()} (Online Ref: ${onlineReference.trim()})`
          : remarks.trim())
      : (paymentMethod === 'Online' && onlineReference.trim() ? `Online Ref: ${onlineReference.trim()}` : null);

    const [res, err] = await receiptService.issueOfficialReceipt({
      tenantId: effectiveTenantId,
      orderOfPaymentId: pendingPayment?.orderOfPaymentId ?? null,
      bookletId: useManualOr ? null : (nextOr?.bookletId ?? null),
      manualOrNumber: useManualOr && manualOrNumber.trim().length > 0 ? manualOrNumber.trim() : null,
      payorName: effectivePayorName,
      payorAddress: payorAddress.trim() || null,
      amount: totalAmount,
      paymentMethod,
      checkNumber: paymentMethod === 'Check' && checkNumber.trim() ? checkNumber.trim() : null,
      checkBank: paymentMethod === 'Check' && checkBank.trim() ? checkBank.trim() : null,
      checkDate: paymentMethod === 'Check' && checkDate.trim() ? checkDate.trim() : null,
      remarks: finalRemarks,
      lineItems: validLineItems,
      allowPartialPayment: issuanceStrategy === 'SplitPerMode',
      issueDate: issueDate !== todayStr ? issueDate : undefined,
      dateChangeReason: issueDate !== todayStr ? dateChangeReason.trim() : undefined,
    });

    setIsSubmitting(false);
    if (err !== null) {
      setErrorMsg(err);
    } else {
      setPayorName('');
      setPayorAddress('');
      setCheckNumber('');
      setCheckBank('');
      setCheckDate('');
      setOnlineReference('');
      setRemarks('');
      setIssueDate(todayStr);
      setDateChangeReason('');
      onSuccess(res ?? undefined);
      onClose();
    }
  };

  return {
    payorName,
    setPayorName,
    payorAddress,
    setPayorAddress,
    paymentMethod,
    setPaymentMethod,
    checkNumber,
    setCheckNumber,
    checkBank,
    setCheckBank,
    checkDate,
    setCheckDate,
    onlineReference,
    setOnlineReference,
    remarks,
    setRemarks,
    manualOrNumber,
    setManualOrNumber,
    useManualOr,
    setUseManualOr,
    issuanceStrategy,
    selectedSplitIndex,
    activeSuggestionIndex,
    setActiveSuggestionIndex,
    lineItems,
    isSubmitting,
    errorMsg,
    isFromPendingPayment,
    issueDate,
    setIssueDate,
    dateChangeReason,
    setDateChangeReason,
    todayStr,
    preferredBreakdown,
    totalAmount,
    handleSelectSplitItem,
    handleSelectStrategy,
    handleAddLineItem,
    handleRemoveLineItem,
    handleUpdateLineItem,
    handleSelectFee,
    handlePaymentMethodChange,
    clientPaymentDetails,
    handleSubmit,
  };
}
