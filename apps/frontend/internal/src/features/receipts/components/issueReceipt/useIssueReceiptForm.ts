import { useState, useEffect, useMemo } from 'react';
import {
  receiptService,
  NextAvailableOrDto,
  PendingPaymentDto,
  BulkPaymentOpItemDto,
  PaymentMethod,
  IssueReceiptLineItemInput,
  OfficialReceiptDto,
  parsePaymentBreakdown,
  ReceiptFeeItemDto,
} from '@edge/api';

export type BulkOrScope = 'per_op' | 'bulk';

interface UseIssueReceiptFormProps {
  visible: boolean;
  tenantId: string;
  nextOr?: NextAvailableOrDto;
  pendingPayment?: PendingPaymentDto | null;
  onClose: () => void;
  onSuccess: (issuedReceipt?: OfficialReceiptDto) => void;
}

function buildConsolidatedBulkLineItems(
  unpaidOps: BulkPaymentOpItemDto[],
  fallbackServiceName: string
): IssueReceiptLineItemInput[] {
  const map = new Map<string, IssueReceiptLineItemInput>();
  for (const opItem of unpaidOps) {
    if (opItem.lineItems && opItem.lineItems.length > 0) {
      for (const li of opItem.lineItems) {
        const code = (li.feeCode || 'FEE').trim().toUpperCase();
        const baseDesc = li.description.replace(/\s*\([^)]+\)\s*$/, '').trim() || `Payment for ${fallbackServiceName}`;
        const key = `${code}::${baseDesc.toLowerCase()}`;
        const existing = map.get(key);
        if (existing) {
          existing.amount = Math.round((existing.amount + li.amount) * 100) / 100;
        } else {
          map.set(key, {
            feeCode: code,
            description: baseDesc,
            amount: Math.round(li.amount * 100) / 100,
          });
        }
      }
    } else {
      const rem = opItem.remainingBalance !== undefined && opItem.remainingBalance > 0
        ? opItem.remainingBalance
        : opItem.amountDue;
      map.set(`OP::${opItem.opNumber}`, {
        feeCode: 'PAYMENT',
        description: `Payment for OP #${opItem.opNumber} (${opItem.applicantName})`,
        amount: rem,
      });
    }
  }
  return Array.from(map.values());
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
  const [bulkOrScope, setBulkOrScope] = useState<BulkOrScope>('per_op');
  const [selectedBulkOpIndex, setSelectedBulkOpIndex] = useState<number>(0);
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

  const bulkOpItems = useMemo<BulkPaymentOpItemDto[]>(() => {
    if (!pendingPayment?.bulkOpItems || pendingPayment.bulkOpItems.length <= 1) {
      return [];
    }
    return pendingPayment.bulkOpItems;
  }, [pendingPayment?.bulkOpItems]);

  const hasBulkOpOptions = bulkOpItems.length > 1;
  const unpaidBulkOpItems = useMemo(
    () => bulkOpItems.filter((item) => item.status !== 'Paid'),
    [bulkOpItems]
  );
  const isMultiOpBulk = useMemo(() => {
    if (bulkOpItems.length <= 1) return false;
    const distinctOpIds = new Set(bulkOpItems.map((i) => i.orderOfPaymentId));
    return distinctOpIds.size > 1;
  }, [bulkOpItems]);

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

      const items = pendingPayment.bulkOpItems ?? [];
      if (items.length > 1) {
        const distinctIds = new Set(items.map((i) => i.orderOfPaymentId));
        const matchedIdx = items.findIndex((i) => i.orderOfPaymentId === pendingPayment.orderOfPaymentId && i.status !== 'Paid');
        const firstUnpaidIdx = items.findIndex((i) => i.status !== 'Paid');
        const initIdx = matchedIdx !== -1 ? matchedIdx : (firstUnpaidIdx !== -1 ? firstUnpaidIdx : 0);
        setSelectedBulkOpIndex(initIdx);

        if (distinctIds.size > 1 || items.some((i) => i.status === 'Paid')) {
          setBulkOrScope('per_op');
          const targetOp = items[initIdx];
          if (targetOp) {
            const effectiveDue =
              typeof targetOp.remainingBalance === 'number' && targetOp.remainingBalance > 0
                ? targetOp.remainingBalance
                : targetOp.amountDue;
            setPayorName(targetOp.applicantName || resolvedPayorName);
            setLineItems(
              targetOp.lineItems && targetOp.lineItems.length > 0
                ? targetOp.lineItems.map((li) => ({ feeCode: li.feeCode || 'FEE', description: li.description, amount: li.amount }))
                : [{ feeCode: 'PAYMENT', description: `Payment for OP #${targetOp.opNumber} (${targetOp.applicantName})`, amount: effectiveDue }]
            );
            setRemarks(`Payment for OP #${targetOp.opNumber} (${targetOp.applicantName}) - App #${pendingPayment.applicationNumber || pendingPayment.referenceNumber}`);
          }
        } else {
          setBulkOrScope('bulk');
        }
      } else {
        setBulkOrScope('per_op');
        setSelectedBulkOpIndex(0);
      }

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
        if (items.length <= 1 || new Set(items.map((i) => i.orderOfPaymentId)).size <= 1) {
          setRemarks(`Payment for OP #${pendingPayment.opNumber} (App #${pendingPayment.applicationNumber || pendingPayment.referenceNumber})`);
        }
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
        if (items.length <= 1 || new Set(items.map((i) => i.orderOfPaymentId)).size <= 1) {
          setRemarks(`Payment for OP #${pendingPayment.opNumber} (App #${pendingPayment.applicationNumber || pendingPayment.referenceNumber})`);
        }
      }

      if (items.length <= 1 || new Set(items.map((i) => i.orderOfPaymentId)).size <= 1) {
        if (pendingPayment.lineItems && pendingPayment.lineItems.length > 0) {
          setLineItems(pendingPayment.lineItems.map((li) => ({ feeCode: li.feeCode || 'FEE', description: li.description, amount: li.amount })));
        } else {
          setLineItems([{ feeCode: 'PAYMENT', description: `Payment for ${pendingPayment.serviceName}`, amount: pendingPayment.amountDue }]);
        }
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
      setBulkOrScope('per_op');
      setSelectedBulkOpIndex(0);
      setLineItems([{ feeCode: 'FEE', description: '', amount: 0 }]);
      setActiveSuggestionIndex(null);
    }
  }, [visible, pendingPayment]);

  const handleSelectBulkOpItem = (idx: number) => {
    if (!pendingPayment || bulkOpItems.length === 0) return;
    const target = bulkOpItems[idx];
    if (!target || target.status === 'Paid') return;
    setSelectedBulkOpIndex(idx);
    setBulkOrScope('per_op');
    setPayorName(target.applicantName || pendingPayment.payorName || pendingPayment.applicantName || '');
    const effectiveDue =
      typeof target.remainingBalance === 'number' && target.remainingBalance > 0
        ? target.remainingBalance
        : target.amountDue;
    if (target.lineItems && target.lineItems.length > 0) {
      setLineItems(
        target.lineItems.map((li) => ({
          feeCode: li.feeCode || 'FEE',
          description: li.description,
          amount: li.amount,
        }))
      );
    } else {
      setLineItems([
        {
          feeCode: 'PAYMENT',
          description: `Payment for OP #${target.opNumber} (${target.applicantName})`,
          amount: effectiveDue,
        },
      ]);
    }
    setRemarks(
      `Payment for OP #${target.opNumber} (${target.applicantName}) - App #${pendingPayment.applicationNumber || pendingPayment.referenceNumber}`
    );
  };

  const handleSelectBulkOrScope = (scope: BulkOrScope) => {
    if (!pendingPayment || bulkOpItems.length <= 1) return;
    setBulkOrScope(scope);
    if (scope === 'bulk') {
      const targetOps = unpaidBulkOpItems.length > 0 ? unpaidBulkOpItems : bulkOpItems;
      const parsed = parsePaymentBreakdown(pendingPayment.remarks);
      const resolvedPayor = parsed?.payorName || pendingPayment.payorName || pendingPayment.applicantName || targetOps[0]?.applicantName || '';
      setPayorName(resolvedPayor);

      if (!isMultiOpBulk && targetOps.length === bulkOpItems.length && pendingPayment.lineItems && pendingPayment.lineItems.length > 0) {
        setLineItems(
          pendingPayment.lineItems.map((li) => ({
            feeCode: li.feeCode || 'FEE',
            description: li.description,
            amount: li.amount,
          }))
        );
      } else {
        setLineItems(buildConsolidatedBulkLineItems(targetOps, pendingPayment.serviceName));
      }

      const opLabels = Array.from(new Set(targetOps.map((o) => o.opNumber.replace(/\s*\(#\d+\)\s*$/, '')))).join(', ');
      setRemarks(
        `Bulk payment for Order(s) of Payment: ${opLabels} (${targetOps.length} applicants • App #${pendingPayment.applicationNumber || pendingPayment.referenceNumber})`
      );
    } else {
      const firstUnpaid = bulkOpItems.findIndex((i) => i.status !== 'Paid');
      const targetIdx =
        bulkOpItems[selectedBulkOpIndex] &&
        bulkOpItems[selectedBulkOpIndex]?.status !== 'Paid'
          ? selectedBulkOpIndex
          : (firstUnpaid !== -1 ? firstUnpaid : 0);
      handleSelectBulkOpItem(targetIdx);
    }
  };

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

    let targetOrderOfPaymentId = pendingPayment?.orderOfPaymentId ?? null;
    let targetOrderOfPaymentIds: string[] | null = null;
    let allowPartial = issuanceStrategy === 'SplitPerMode';

    if (hasBulkOpOptions) {
      if (bulkOrScope === 'bulk') {
        const targetOps = unpaidBulkOpItems.length > 0 ? unpaidBulkOpItems : bulkOpItems;
        const distinctOpIds = Array.from(new Set(targetOps.map((o) => o.orderOfPaymentId)));
        targetOrderOfPaymentId = distinctOpIds[0] ?? targetOrderOfPaymentId;
        if (distinctOpIds.length > 1) {
          targetOrderOfPaymentIds = distinctOpIds;
        }
      } else {
        const selectedItem = bulkOpItems[selectedBulkOpIndex];
        if (selectedItem) {
          targetOrderOfPaymentId = selectedItem.orderOfPaymentId;
        }
        if (!isMultiOpBulk) {
          // Single consolidated OP split per applicant
          allowPartial = true;
        }
      }
    }

    const [res, err] = await receiptService.issueOfficialReceipt({
      tenantId: effectiveTenantId,
      orderOfPaymentId: targetOrderOfPaymentId,
      orderOfPaymentIds: targetOrderOfPaymentIds,
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
      allowPartialPayment: allowPartial,
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
    bulkOrScope,
    selectedBulkOpIndex,
    bulkOpItems,
    unpaidBulkOpItems,
    hasBulkOpOptions,
    isMultiOpBulk,
    handleSelectBulkOrScope,
    handleSelectBulkOpItem,
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
