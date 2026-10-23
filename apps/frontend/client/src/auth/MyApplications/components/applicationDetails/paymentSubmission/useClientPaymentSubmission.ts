import { useState, useMemo, useEffect } from 'react';
import { Application } from '../../../data/applicationsData';
import {
  applicationService,
  storageService,
  PaymentMethodDto,
  PaymentBreakdown,
  PaymentBreakdownItem,
  PaymentItemMode,
  serializePaymentBreakdown,
  SubmitPaymentRequest,
} from '@edge/api';
import { useToast } from '../../../../../shared/components/Toast';
import { ModeOfPayment, CombinationRow, CheckProofFile } from './paymentSubmissionTypes';

interface UseClientPaymentSubmissionProps {
  app: Application;
  onClose: () => void;
  onSuccess: () => void;
  visible?: boolean;
}

async function uploadCheckProof(
  proof: CheckProofFile,
  tenantId: string
): Promise<string | null> {
  let fileBlob: Blob | null = null;
  if (proof.file instanceof Blob) {
    fileBlob = proof.file;
  } else if (typeof proof.uri === 'string' && proof.uri.trim() !== '') {
    try {
      const res = await fetch(proof.uri);
      if (res.ok) {
        fileBlob = await res.blob();
      }
    } catch (fetchErr) {
      console.warn('Could not read check proof file:', fetchErr);
    }
  }

  if (fileBlob === null) {
    return null;
  }

  const [storageRes, storageErr] = await storageService.uploadFile(
    fileBlob,
    proof.name || `check_proof_${Date.now()}.jpg`,
    'payments',
    tenantId
  );

  if (storageErr !== null || !storageRes?.data) {
    console.warn('Check proof upload failed:', storageErr);
    return null;
  }

  return storageRes.data.id;
}

export function useClientPaymentSubmission({ app, onClose, onSuccess, visible }: UseClientPaymentSubmissionProps) {
  const toast = useToast();

  const totalAmountDue = useMemo(() => {
    if (typeof app.totalAmountDue === 'number' && app.totalAmountDue > 0) {
      return app.totalAmountDue;
    }
    if (app.soa && typeof app.soa.totalAmount === 'number' && app.soa.totalAmount > 0) {
      return app.soa.totalAmount;
    }
    if (app.op && typeof app.op.amountDue === 'number' && app.op.amountDue > 0) {
      return app.op.amountDue;
    }
    return 0;
  }, [app]);

  const tenantId =
    typeof app.tenantId === 'string' && app.tenantId.trim() !== ''
      ? app.tenantId
      : 'aa0cd342-7265-4d9e-9242-948fc7e3d0a8';

  const [selectedMode, setSelectedMode] = useState<ModeOfPayment>('LandBank');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [payorName, setPayorName] = useState(app.applicantName || app.companyName || '');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Single Check details
  const [checkNumber, setCheckNumber] = useState('');
  const [checkBank, setCheckBank] = useState('');
  const [checkDate, setCheckDate] = useState('');
  const [checkProofFile, setCheckProofFile] = useState<CheckProofFile | null>(null);

  // Preview state
  const [previewDoc, setPreviewDoc] = useState<CheckProofFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleOpenPreview = (file: CheckProofFile) => {
    setPreviewDoc(file);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewDoc(null);
  };

  // Combination items state
  const createDefaultCombinationItems = (): CombinationRow[] => {
    const half = totalAmountDue > 0 ? (totalAmountDue / 2).toFixed(2) : '0';
    const remaining = totalAmountDue > 0 ? (totalAmountDue - Number(half)).toFixed(2) : '0';
    return [
      {
        id: 'item-1',
        mode: 'Check',
        amount: half,
        checkNumber: '',
        checkBank: '',
        checkDate: '',
        referenceNumber: '',
        checkProofFile: null,
      },
      {
        id: 'item-2',
        mode: 'Cash',
        amount: remaining,
        checkNumber: '',
        checkBank: '',
        checkDate: '',
        referenceNumber: '',
        checkProofFile: null,
      },
    ];
  };

  const [combinationRows, setCombinationRows] = useState<CombinationRow[]>(createDefaultCombinationItems);

  // When modal is opened or when application / OP details change (e.g. after new accountant approval),
  // reset payment mode and fields so the client can select and configure their mode of payment afresh.
  useEffect(() => {
    if (visible) {
      setSelectedMode('LandBank');
      setReferenceNumber('');
      setPayorName(app.applicantName || app.companyName || '');
      setRemarks('');
      setCheckNumber('');
      setCheckBank('');
      setCheckDate('');
      setCheckProofFile(null);
      setPreviewDoc(null);
      setIsPreviewOpen(false);
      setErrorMessage(null);
      setCombinationRows(createDefaultCombinationItems());
    }
  }, [visible, app.id, app.op?.id]);

  const combinationTotalAllocated = useMemo(() => {
    return combinationRows.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [combinationRows]);

  const allocationDifference = totalAmountDue - combinationTotalAllocated;
  const isAllocationBalanced = Math.abs(allocationDifference) < 0.01;
  const isExceedingTotal = selectedMode === 'Combination' && totalAmountDue > 0 && combinationTotalAllocated > totalAmountDue;

  const applyPreset = (modeA: PaymentItemMode, modeB: PaymentItemMode) => {
    const half = totalAmountDue > 0 ? (totalAmountDue / 2).toFixed(2) : '0';
    const rem = totalAmountDue > 0 ? (totalAmountDue - Number(half)).toFixed(2) : '0';
    setCombinationRows([
      {
        id: 'item-1',
        mode: modeA,
        amount: half,
        checkNumber: '',
        checkBank: '',
        checkDate: '',
        referenceNumber: '',
        checkProofFile: null,
      },
      {
        id: 'item-2',
        mode: modeB,
        amount: rem,
        checkNumber: '',
        checkBank: '',
        checkDate: '',
        referenceNumber: '',
        checkProofFile: null,
      },
    ]);
    setErrorMessage(null);
  };

  const applyThreePreset = () => {
    const oneThird = totalAmountDue > 0 ? Math.floor((totalAmountDue / 3) * 100) / 100 : 0;
    const remaining = totalAmountDue > 0 ? Number((totalAmountDue - oneThird * 2).toFixed(2)) : 0;
    setCombinationRows([
      {
        id: 'item-1',
        mode: 'Cash',
        amount: oneThird.toFixed(2),
        checkNumber: '',
        checkBank: '',
        checkDate: '',
        referenceNumber: '',
        checkProofFile: null,
      },
      {
        id: 'item-2',
        mode: 'Check',
        amount: oneThird.toFixed(2),
        checkNumber: '',
        checkBank: '',
        checkDate: '',
        referenceNumber: '',
        checkProofFile: null,
      },
      {
        id: 'item-3',
        mode: 'Online',
        amount: remaining.toFixed(2),
        checkNumber: '',
        checkBank: '',
        checkDate: '',
        referenceNumber: '',
        checkProofFile: null,
      },
    ]);
    setErrorMessage(null);
  };

  const handleAddCombinationRow = () => {
    if (totalAmountDue > 0 && combinationTotalAllocated >= totalAmountDue) {
      setErrorMessage(
        `Total amount due (₱${totalAmountDue.toFixed(2)}) is already fully allocated. Reduce an existing amount before adding another mode.`
      );
      return;
    }
    const unallocated = allocationDifference > 0 ? allocationDifference.toFixed(2) : '0';
    setCombinationRows((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        mode: 'Cash',
        amount: unallocated,
        checkNumber: '',
        checkBank: '',
        checkDate: '',
        referenceNumber: '',
        checkProofFile: null,
      },
    ]);
    setErrorMessage(null);
  };

  const handleRemoveCombinationRow = (id: string) => {
    if (combinationRows.length <= 2) {
      return;
    }
    setCombinationRows((prev) => prev.filter((r) => r.id !== id));
    setErrorMessage(null);
  };

  const handleUpdateCombinationRow = (id: string, updates: Partial<CombinationRow>) => {
    if (updates.amount !== undefined) {
      const numericVal = updates.amount.replace(/[^0-9.]/g, '');
      const parsedNew = Number(numericVal);
      const otherTotal = combinationRows
        .filter((r) => r.id !== id)
        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      const potentialTotal = otherTotal + (Number.isFinite(parsedNew) ? parsedNew : 0);

      if (totalAmountDue > 0 && potentialTotal > totalAmountDue) {
        setErrorMessage(
          `Allocated payment amount (₱${potentialTotal.toFixed(2)}) cannot exceed the Total Amount Due (₱${totalAmountDue.toFixed(2)}).`
        );
      } else {
        setErrorMessage(null);
      }
      setCombinationRows((prev) =>
        prev.map((row) => (row.id === id ? { ...row, ...updates, amount: numericVal } : row))
      );
      return;
    }

    setCombinationRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...updates } : row))
    );
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (selectedMode === 'Check') {
      if (!checkNumber.trim()) {
        setErrorMessage('Please enter the Check Number.');
        return;
      }
      if (!checkBank.trim()) {
        setErrorMessage('Please specify the Drawee Bank.');
        return;
      }
    } else if (selectedMode === 'Combination') {
      if (combinationRows.length < 2) {
        setErrorMessage('Combination payments require at least two payment modes.');
        return;
      }

      for (let i = 0; i < combinationRows.length; i++) {
        const row = combinationRows[i];
        if (!row) continue;
        const rowAmt = Number(row.amount);
        if (Number.isNaN(rowAmt) || rowAmt <= 0) {
          setErrorMessage(`Payment mode #${i + 1} (${row.mode}) must have a valid amount greater than 0.`);
          return;
        }
        if (row.mode === 'Check' && (!row.checkNumber.trim() || !row.checkBank.trim())) {
          setErrorMessage(`Check payment #${i + 1} requires both Check Number and Drawee Bank.`);
          return;
        }
        if (row.mode === 'Online' && !row.referenceNumber.trim()) {
          setErrorMessage(`Online payment #${i + 1} requires a Reference / E-Receipt Number.`);
          return;
        }
      }

      if (totalAmountDue > 0 && combinationTotalAllocated > totalAmountDue) {
        setErrorMessage(
          `Allocated payment amount (₱${combinationTotalAllocated.toFixed(
            2
          )}) cannot exceed the Total Amount Due (₱${totalAmountDue.toFixed(2)}). Please reduce the allocated amount by ₱${(combinationTotalAllocated - totalAmountDue).toFixed(2)}.`
        );
        return;
      }

      if (totalAmountDue > 0 && Math.abs(allocationDifference) > 0.01) {
        setErrorMessage(
          `The total allocated amount (₱${combinationTotalAllocated.toFixed(
            2
          )}) must equal the Total Amount Due (₱${totalAmountDue.toFixed(2)}). Remaining to allocate: ₱${allocationDifference.toFixed(2)}.`
        );
        return;
      }
    } else if (selectedMode !== 'CashierOTC') {
      if (!referenceNumber.trim()) {
        setErrorMessage('Please provide the transaction reference or e-receipt number.');
        return;
      }
    }

    setIsSubmitting(true);

    let singleProofFileId: string | null = null;
    if (selectedMode === 'Check' && checkProofFile !== null) {
      singleProofFileId = await uploadCheckProof(checkProofFile, tenantId);
    }

    const combinationProofIdMap = new Map<string, string>();
    if (selectedMode === 'Combination') {
      for (const row of combinationRows) {
        if (row.mode === 'Check' && row.checkProofFile !== null && row.checkProofFile !== undefined) {
          const uploadedId = await uploadCheckProof(row.checkProofFile, tenantId);
          if (uploadedId !== null) {
            combinationProofIdMap.set(row.id, uploadedId);
          }
        }
      }
    }

    let mappedPaymentMethod: PaymentMethodDto;
    let primaryRef = '';
    let breakdown: PaymentBreakdown;

    if (selectedMode === 'CashierOTC') {
      mappedPaymentMethod = 'Cash';
      primaryRef = 'CASHIER-OTC';
      breakdown = {
        isCombination: false,
        totalAmount: totalAmountDue,
        items: [
          {
            id: 'otc-1',
            mode: 'Cash',
            amount: totalAmountDue,
            remarks: 'Walk-in cash payment at NTC Regional Office Cashier',
          },
        ],
        payorName: payorName.trim() || undefined,
        userNotes: remarks.trim() || undefined,
      };
    } else if (selectedMode === 'Check') {
      mappedPaymentMethod = 'Check';
      primaryRef = checkNumber.trim();
      breakdown = {
        isCombination: false,
        totalAmount: totalAmountDue,
        items: [
          {
            id: 'chk-1',
            mode: 'Check',
            amount: totalAmountDue,
            checkNumber: checkNumber.trim(),
            checkBank: checkBank.trim(),
            checkDate: checkDate.trim() || undefined,
            proofFileId: singleProofFileId ?? undefined,
            proofFileName: checkProofFile?.name,
            proofFileUri: checkProofFile?.uri,
          },
        ],
        payorName: payorName.trim() || undefined,
        userNotes: remarks.trim() || undefined,
        proofOfPaymentFileId: singleProofFileId ?? undefined,
        proofFileName: checkProofFile?.name,
        proofFileUri: checkProofFile?.uri,
      };
    } else if (selectedMode === 'Combination') {
      const hasCheck = combinationRows.some((r) => r.mode === 'Check');
      const hasCash = combinationRows.some((r) => r.mode === 'Cash');
      mappedPaymentMethod = hasCheck ? 'Check' : hasCash ? 'Cash' : 'Online';

      const firstCheck = combinationRows.find((r) => r.mode === 'Check' && r.checkNumber.trim());
      const firstOnline = combinationRows.find((r) => r.mode === 'Online' && r.referenceNumber.trim());
      primaryRef = firstCheck?.checkNumber.trim() || firstOnline?.referenceNumber.trim() || 'COMBINATION';

      const firstCheckWithProof = combinationRows.find(
        (r) => r.mode === 'Check' && combinationProofIdMap.has(r.id)
      );
      const firstCombProofId =
        firstCheckWithProof !== undefined ? combinationProofIdMap.get(firstCheckWithProof.id) : undefined;

      const breakdownItems: PaymentBreakdownItem[] = combinationRows.map((r, idx) => {
        const rowProofId = combinationProofIdMap.get(r.id);
        return {
          id: `comb-${idx + 1}`,
          mode: r.mode,
          amount: Number(r.amount) || 0,
          checkNumber: r.mode === 'Check' && r.checkNumber.trim() ? r.checkNumber.trim() : undefined,
          checkBank: r.mode === 'Check' && r.checkBank.trim() ? r.checkBank.trim() : undefined,
          checkDate: r.mode === 'Check' && r.checkDate.trim() ? r.checkDate.trim() : undefined,
          referenceNumber: r.mode === 'Online' && r.referenceNumber.trim() ? r.referenceNumber.trim() : undefined,
          proofFileId: rowProofId,
          proofFileName: r.mode === 'Check' && r.checkProofFile ? r.checkProofFile.name : undefined,
          proofFileUri: r.mode === 'Check' && r.checkProofFile ? r.checkProofFile.uri : undefined,
        };
      });

      breakdown = {
        isCombination: true,
        totalAmount: combinationTotalAllocated,
        items: breakdownItems,
        payorName: payorName.trim() || undefined,
        userNotes: remarks.trim() || undefined,
        proofOfPaymentFileId: firstCombProofId,
      };
    } else {
      mappedPaymentMethod = 'Online';
      breakdown = {
        isCombination: false,
        totalAmount: totalAmountDue,
        items: [
          {
            id: 'online-1',
            mode: 'Online',
            amount: totalAmountDue,
            referenceNumber: referenceNumber.trim(),
            remarks: `Gateway: ${selectedMode}`,
          },
        ],
        payorName: payorName.trim() || undefined,
        userNotes: remarks.trim() || undefined,
      };
    }

    const serializedRemarks = serializePaymentBreakdown(breakdown);
    const checkRow = combinationRows.find((r) => r.mode === 'Check');
    const directCheckNumber = selectedMode === 'Check'
      ? (checkNumber.trim() || undefined)
      : (checkRow?.checkNumber.trim() || undefined);
    const directCheckBank = selectedMode === 'Check'
      ? (checkBank.trim() || undefined)
      : (checkRow?.checkBank.trim() || undefined);
    const directCheckDate = selectedMode === 'Check'
      ? (checkDate.trim() || undefined)
      : (checkRow?.checkDate.trim() || undefined);

    const firstCombinationProofId = Array.from(combinationProofIdMap.values())[0] ?? null;
    const finalProofFileId = selectedMode === 'Check' ? singleProofFileId : firstCombinationProofId;

    const payload: SubmitPaymentRequest = {
      orderOfPaymentId: app.op?.id,
      paymentMethod: mappedPaymentMethod,
      referenceNumber: primaryRef.length > 0 ? primaryRef : undefined,
      payorName: payorName.trim().length > 0 ? payorName.trim() : undefined,
      amountPaid: totalAmountDue > 0 ? totalAmountDue : undefined,
      remarks: serializedRemarks,
      proofOfPaymentFileId: finalProofFileId,
      checkNumber: directCheckNumber,
      checkBank: directCheckBank,
      checkDate: directCheckDate,
    };

    const [, error] = await applicationService.submitPayment(app.id, payload);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error);
      toast.error(error);
      return;
    }

    toast.success('Payment reference and preference submitted successfully!');
    onSuccess();
    onClose();
  };

  return {
    totalAmountDue,
    selectedMode,
    setSelectedMode,
    referenceNumber,
    setReferenceNumber,
    payorName,
    setPayorName,
    remarks,
    setRemarks,
    isSubmitting,
    errorMessage,
    checkNumber,
    setCheckNumber,
    checkBank,
    setCheckBank,
    checkDate,
    setCheckDate,
    checkProofFile,
    setCheckProofFile,
    previewDoc,
    isPreviewOpen,
    handleOpenPreview,
    handleClosePreview,
    combinationRows,
    combinationTotalAllocated,
    allocationDifference,
    isAllocationBalanced,
    isExceedingTotal,
    applyPreset,
    applyThreePreset,
    handleAddCombinationRow,
    handleRemoveCombinationRow,
    handleUpdateCombinationRow,
    handleSubmit,
  };
}
