import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  COLORS,
  useTheme,
  Icon as Lucide,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  toast,
  DatePickerInput,
} from '@edge/ui';
import {
  applicationService,
  mutateApplications,
  CreateSoaLineItemRequest,
  IssuedToTypeDto,
  FeeCalculationResultDto,
  useSoaNotes,
  useTenantConfig,
  useAdminFees,
} from '@edge/api';
import { ApplicationData, ApplicantItem, SoaItem, SoaRecordSummary } from '../../../../types/application';
import {
  EditableLineItem,
  normalizeYmd,
  resolveInitialAddress,
  resolveInitialName,
  resolveInitialType,
  resolveIndividualApplicantName,
  resolveIndividualApplicantAddress,
  mapCalculatedFeesToEditableItems,
  mapExistingSoaItemsToEditableItems,
  calculateLineItemAmount,
  doesApplicationAskForYears,
  doesFeeCodeUseYears,
  SOA_STANDARD_PARTICULARS,
  SoaStandardParticular,
  SoaParticularCategory,
  buildLinkedParticularCatalog,
  normalizeParticularKey,
  resolveDedupFeeKey,
  isDuplicateParticular,
  getAvailableStandardParticular,
} from '../../utils/soaModalHelpers';

interface GenerateSoaModalProps {
  visible: boolean;
  app: ApplicationData;
  onClose: () => void;
  onSuccess?: () => void;
}

function resolveApplicantAddress(applicant: ApplicantItem, fallbackAddress: string): string {
  const rawParts = [
    applicant.streetAddress || applicant.address,
    applicant.barangay,
    applicant.city,
    applicant.province,
    applicant.zipCode,
  ]
    .map((p) => (p || '').trim())
    .filter((p) => p.length > 0);

  if (rawParts.length > 0) {
    return Array.from(new Set(rawParts)).join(', ');
  }
  return fallbackAddress;
}

export function GenerateSoaModal({
  visible,
  app,
  onClose,
  onSuccess,
}: GenerateSoaModalProps) {
  const { colors, isDark } = useTheme();

  const isBulkApp =
    app.applicationType === 'BULK' ||
    (app.mode || '').toUpperCase() === 'BULK' ||
    (app.applicantsList !== undefined && app.applicantsList.length > 1);

  const eligibleApplicants = useMemo<ApplicantItem[]>(() => {
    if (!app.applicantsList || app.applicantsList.length === 0) return [];
    const filtered = app.applicantsList.filter(
      (a) => a.status !== 'Incomplete' && a.status !== 'ForEndorsement'
    );
    return filtered.length > 0 ? filtered : app.applicantsList;
  }, [app.applicantsList]);

  const [billingScopeMode, setBillingScopeMode] = useState<'BULK' | 'INDIVIDUAL'>('BULK');
  const [selectedApplicantId, setSelectedApplicantId] = useState<string>('ALL');

  const selectedSingleApplicant = useMemo<ApplicantItem | undefined>(() => {
    if (!isBulkApp || billingScopeMode !== 'INDIVIDUAL' || selectedApplicantId === 'ALL') {
      return undefined;
    }
    return eligibleApplicants.find((a) => a.id === selectedApplicantId);
  }, [isBulkApp, billingScopeMode, selectedApplicantId, eligibleApplicants]);

  const existingApplicantSoa = useMemo<SoaRecordSummary | undefined>(() => {
    if (!selectedSingleApplicant || !app.soasList) return undefined;
    return app.soasList.find((s) => s.applicantId === selectedSingleApplicant.id);
  }, [selectedSingleApplicant, app.soasList]);

  const isExistingSoa = Boolean(
    (app.soaItems && app.soaItems.length > 0) ||
    app.totalAmountDue > 0 ||
    app.soaNumber ||
    app.soaId
  );

  const [issuedToName, setIssuedToName] = useState('');
  const [issuedToType, setIssuedToType] = useState<IssuedToTypeDto>('Individual');
  const [issuedToAddress, setIssuedToAddress] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedSoaNoteId, setSelectedSoaNoteId] = useState<string | null>(null);
  const [manualSoaNumber, setManualSoaNumber] = useState('');

  const { notes: tenantSoaNotes } = useSoaNotes({ tenantId: app.tenantId, enabled: visible });
  const { config: tenantConfig } = useTenantConfig(app.tenantId);
  const { fees: backendFees, serviceFees: backendServiceFees } = useAdminFees();
  const allowManualSoaNumber = tenantConfig.allowManualSoaNumber === true;

  // Calculation state from backend calculation engine
  const [calculatedFees, setCalculatedFees] = useState<FeeCalculationResultDto | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  const appAsksForYears = useMemo(
    () => doesApplicationAskForYears(app, calculatedFees),
    [app, calculatedFees]
  );

  // Mode: automated statutory calculation vs manual customization
  const [isManualMode, setIsManualMode] = useState(false);
  const [customLineItems, setCustomLineItems] = useState<EditableLineItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [openParticularDropdownId, setOpenParticularDropdownId] = useState<string | null>(null);
  const [particularSearch, setParticularSearch] = useState('');

  const scopedServiceFees = useMemo(() => {
    const targetSvcId = calculatedFees?.serviceId || app.serviceId || app.services?.[0]?.serviceId;
    if (!targetSvcId) return backendServiceFees;
    const filtered = backendServiceFees.filter((sf) => sf.serviceId === targetSvcId);
    return filtered.length > 0 ? filtered : backendServiceFees;
  }, [backendServiceFees, calculatedFees?.serviceId, app.serviceId, app.services]);

  const linkedParticularCatalog = useMemo(
    () =>
      buildLinkedParticularCatalog({
        calculatedFees,
        backendFees,
        backendServiceFees: scopedServiceFees,
        appCategory: calculatedFees?.category || app.serviceCategory || app.category,
      }),
    [calculatedFees, backendFees, scopedServiceFees, app.serviceCategory, app.category]
  );

  const filteredParticulars = useMemo(() => {
    const q = particularSearch.trim().toLowerCase();
    if (!q) return linkedParticularCatalog;
    return linkedParticularCatalog.filter(
      (p) =>
        p.particular.toLowerCase().includes(q) ||
        (p.displayName !== undefined && p.displayName.toLowerCase().includes(q)) ||
        p.defaultCode.toLowerCase().includes(q) ||
        (p.accountCode !== undefined && p.accountCode.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
    );
  }, [particularSearch, linkedParticularCatalog]);

  const categoriesOrder: SoaParticularCategory[] = [
    'FOR LICENSES',
    'FOR PERMITS',
    'FOR AMATEUR AND ROC',
    'OTHER APPLICATION',
  ];

  const groupedCategories: { category: SoaParticularCategory; items: SoaStandardParticular[] }[] = useMemo(() => {
    return categoriesOrder
      .map((cat: SoaParticularCategory) => ({
        category: cat,
        items: filteredParticulars.filter((p: SoaStandardParticular) => p.category === cat),
      }))
      .filter((g: { category: SoaParticularCategory; items: SoaStandardParticular[] }) => g.items.length > 0);
  }, [filteredParticulars]);

  // Fetch backend calculated fees based on statutory formula & service catalog
  const fetchBackendCalculatedFees = useCallback(
    async (overrideScope?: 'BULK' | 'INDIVIDUAL', overrideApplicantId?: string) => {
      if (!app.id) return;
      setIsCalculating(true);
      setCalculationError(null);

      const activeScope = overrideScope ?? billingScopeMode;
      const activeAppId = overrideApplicantId ?? selectedApplicantId;
      const targetApplicantId =
        isBulkApp && activeScope === 'INDIVIDUAL'
          ? (activeAppId !== 'ALL' ? activeAppId : eligibleApplicants[0]?.id)
          : undefined;
      const targetUnits =
        isBulkApp && activeScope === 'INDIVIDUAL'
          ? 1
          : (isBulkApp ? Math.max(eligibleApplicants.length, 1) : 1);

      const [res, err] = await applicationService.calculateApplicationFees(app.id, {
        applicantId: targetApplicantId,
        noOfUnits: targetUnits,
      });
      setIsCalculating(false);

      if (err !== null || !res?.data) {
        const errMsg = typeof err === 'object' && err !== null && Reflect.has(err, 'message')
          ? String(Reflect.get(err, 'message'))
          : 'Failed to calculate statutory fees automatically.';
        setCalculationError(errMsg);
        return;
      }

      const rawCalcData = res.data;
      const seenCalcKeys = new Set<string>();
      const dedupedLineItems = (rawCalcData.lineItems ?? []).filter((li) => {
        const key = resolveDedupFeeKey(li.itemCode || '', li.particular || '');
        if (seenCalcKeys.has(key)) return false;
        seenCalcKeys.add(key);
        return true;
      });
      const dedupedSubTotal = dedupedLineItems
        .filter((li) => !li.isTax && !li.isSurcharge)
        .reduce((sum, li) => sum + (li.amount || 0), 0);
      const dedupedSurcharge = dedupedLineItems
        .filter((li) => Boolean(li.isSurcharge))
        .reduce((sum, li) => sum + (li.amount || 0), 0);
      const dedupedTax = dedupedLineItems
        .filter((li) => Boolean(li.isTax))
        .reduce((sum, li) => sum + (li.amount || 0), 0);
      const calcData: FeeCalculationResultDto = {
        ...rawCalcData,
        lineItems: dedupedLineItems,
        subTotal: dedupedLineItems.length > 0 ? dedupedSubTotal : rawCalcData.subTotal,
        surchargeAmount: dedupedLineItems.length > 0 ? dedupedSurcharge : rawCalcData.surchargeAmount,
        taxAmount: dedupedLineItems.length > 0 ? dedupedTax : rawCalcData.taxAmount,
        totalAmount:
          dedupedLineItems.length > 0
            ? dedupedSubTotal + dedupedSurcharge + dedupedTax
            : rawCalcData.totalAmount,
      };
      setCalculatedFees(calcData);

      const hasTargetExistingItems =
        isBulkApp && activeScope === 'INDIVIDUAL'
          ? (activeAppId !== 'ALL' && Boolean(app.soasList?.some((s) => s.applicantId === activeAppId && s.items.length > 0)))
          : (isExistingSoa && app.soaBillingMode !== 'INDIVIDUAL');

      if (!hasTargetExistingItems) {
        setCustomLineItems(mapCalculatedFeesToEditableItems(calcData.lineItems, 'calc'));
      }
    },
    [app.id, app.soasList, app.soaBillingMode, billingScopeMode, selectedApplicantId, isBulkApp, eligibleApplicants, isExistingSoa]
  );

  const handleSelectBillingScope = (nextScope: 'BULK' | 'INDIVIDUAL') => {
    setBillingScopeMode(nextScope);

    if (nextScope === 'BULK') {
      setSelectedApplicantId('ALL');
      setIssuedToName(resolveInitialName(app, 'BULK'));
      setIssuedToType(resolveInitialType(app, 'BULK'));
      setIssuedToAddress(resolveInitialAddress(app, 'BULK'));
      setIsManualMode(false);
      void fetchBackendCalculatedFees('BULK', 'ALL');
    } else {
      const nextApplicantId = selectedApplicantId !== 'ALL' ? selectedApplicantId : 'ALL';
      const matchedApplicant = eligibleApplicants.find((a) => a.id === nextApplicantId) ?? eligibleApplicants[0];
      const matchedSoa = nextApplicantId !== 'ALL'
        ? app.soasList?.find((s) => s.applicantId === nextApplicantId)
        : undefined;
      const fallbackAddress = resolveInitialAddress(app, 'INDIVIDUAL', matchedApplicant);

      if (nextApplicantId === 'ALL') {
        const indivName = matchedApplicant ? resolveIndividualApplicantName(matchedApplicant, app) : resolveInitialName(app, 'INDIVIDUAL');
        setIssuedToName(
          matchedApplicant
            ? `${indivName} (+${Math.max(eligibleApplicants.length - 1, 0)} Individual SOA)`
            : indivName
        );
        setIssuedToType('Individual');
        setIssuedToAddress(matchedApplicant ? resolveIndividualApplicantAddress(matchedApplicant, fallbackAddress) : fallbackAddress);
        setIsManualMode(false);
      } else if (matchedSoa) {
        const indivName = matchedApplicant ? resolveIndividualApplicantName(matchedApplicant, app) : '';
        const companyName = resolveInitialName(app, 'BULK').toLowerCase();
        const soaName = (matchedSoa.issuedToName || '').trim();
        const effectiveName = (soaName.length > 0 && soaName.toLowerCase() !== companyName)
          ? soaName
          : (indivName || soaName || 'Applicant');
        setIssuedToName(effectiveName);
        setIssuedToType('Individual');
        setIssuedToAddress(matchedSoa.issuedToAddress || (matchedApplicant ? resolveIndividualApplicantAddress(matchedApplicant, fallbackAddress) : fallbackAddress));
        if (matchedSoa.items.length > 0) {
          setCustomLineItems(mapExistingSoaItemsToEditableItems(matchedSoa.items));
          setIsManualMode(true);
        } else {
          setIsManualMode(false);
        }
      } else if (matchedApplicant) {
        setIssuedToName(resolveIndividualApplicantName(matchedApplicant, app));
        setIssuedToType('Individual');
        setIssuedToAddress(resolveIndividualApplicantAddress(matchedApplicant, fallbackAddress));
        setIsManualMode(false);
      }
      void fetchBackendCalculatedFees('INDIVIDUAL', nextApplicantId);
    }
  };

  const handleSelectApplicantTarget = (nextApplicantId: string) => {
    setSelectedApplicantId(nextApplicantId);

    if (nextApplicantId === 'ALL') {
      const firstApplicant = eligibleApplicants[0];
      const fallbackAddress = resolveInitialAddress(app, 'INDIVIDUAL', firstApplicant);
      const indivName = firstApplicant ? resolveIndividualApplicantName(firstApplicant, app) : resolveInitialName(app, 'INDIVIDUAL');
      setIssuedToName(
        firstApplicant
          ? `${indivName} (+${Math.max(eligibleApplicants.length - 1, 0)} Individual SOA)`
          : indivName
      );
      setIssuedToType('Individual');
      setIssuedToAddress(firstApplicant ? resolveIndividualApplicantAddress(firstApplicant, fallbackAddress) : fallbackAddress);
      setIsManualMode(false);
      void fetchBackendCalculatedFees('INDIVIDUAL', 'ALL');
      return;
    }

    const matchedApplicant = eligibleApplicants.find((a) => a.id === nextApplicantId);
    const matchedSoa = app.soasList?.find((s) => s.applicantId === nextApplicantId);
    const fallbackAddress = resolveInitialAddress(app, 'INDIVIDUAL', matchedApplicant);

    if (matchedSoa) {
      const indivName = matchedApplicant ? resolveIndividualApplicantName(matchedApplicant, app) : '';
      const companyName = resolveInitialName(app, 'BULK').toLowerCase();
      const soaName = (matchedSoa.issuedToName || '').trim();
      const effectiveName = (soaName.length > 0 && soaName.toLowerCase() !== companyName)
        ? soaName
        : (indivName || soaName || 'Applicant');
      setIssuedToName(effectiveName);
      setIssuedToType('Individual');
      setIssuedToAddress(matchedSoa.issuedToAddress || (matchedApplicant ? resolveIndividualApplicantAddress(matchedApplicant, fallbackAddress) : fallbackAddress));
      if (matchedSoa.items.length > 0) {
        setCustomLineItems(mapExistingSoaItemsToEditableItems(matchedSoa.items));
        setIsManualMode(true);
      } else {
        setIsManualMode(false);
      }
    } else if (matchedApplicant) {
      setIssuedToName(resolveIndividualApplicantName(matchedApplicant, app));
      setIssuedToType('Individual');
      setIssuedToAddress(resolveIndividualApplicantAddress(matchedApplicant, fallbackAddress));
      setIsManualMode(false);
    }

    void fetchBackendCalculatedFees('INDIVIDUAL', nextApplicantId);
  };

  useEffect(() => {
    if (visible) {
      const initialScope: 'BULK' | 'INDIVIDUAL' =
        isBulkApp && app.soaBillingMode === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'BULK';
      setBillingScopeMode(initialScope);
      setSelectedApplicantId('ALL');

      if (initialScope === 'INDIVIDUAL' && eligibleApplicants.length > 0) {
        const firstApplicant = eligibleApplicants[0];
        const fallbackAddress = resolveInitialAddress(app, 'INDIVIDUAL', firstApplicant);
        const indivName = firstApplicant ? resolveIndividualApplicantName(firstApplicant, app) : resolveInitialName(app, 'INDIVIDUAL');
        setIssuedToName(
          firstApplicant
            ? `${indivName} (+${Math.max(eligibleApplicants.length - 1, 0)} Individual SOA)`
            : indivName
        );
        setIssuedToType('Individual');
        setIssuedToAddress(firstApplicant ? resolveIndividualApplicantAddress(firstApplicant, fallbackAddress) : fallbackAddress);
      } else {
        setIssuedToName(resolveInitialName(app, 'BULK'));
        setIssuedToType(resolveInitialType(app, 'BULK'));
        setIssuedToAddress(resolveInitialAddress(app, 'BULK'));
      }

      const rawDue = normalizeYmd(app.soaDueDate || app.dueDate);
      const computedDue = rawDue || (() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().split('T')[0] ?? '';
      })();
      setDueDate(computedDue);

      if (isExistingSoa && initialScope === 'BULK' && app.soaItems && app.soaItems.length > 0) {
        // Pre-populate existing SOA line items so custom edits & payments are preserved
        setCustomLineItems(mapExistingSoaItemsToEditableItems(app.soaItems));
        setIsManualMode(true);
      } else {
        setIsManualMode(false);
      }

      setRemarks(app.soaRemarks || app.remarks || '');
      setSelectedSoaNoteId(app.soaNoteId ?? null);
      setManualSoaNumber(app.soaNumber || '');
      void fetchBackendCalculatedFees(initialScope, 'ALL');
    }
  }, [visible, app.id]);

  useEffect(() => {
    if (visible && tenantSoaNotes.length > 0) {
      const match =
        tenantSoaNotes.find((n) => n.tenantId === app.tenantId && (n.code === 'DEFAULT' || n.title?.toLowerCase().includes('default'))) ??
        tenantSoaNotes.find((n) => n.tenantId === app.tenantId) ??
        tenantSoaNotes.find((n) => n.code === 'DEFAULT' || n.title?.toLowerCase().includes('default')) ??
        tenantSoaNotes[0];

      if (!isExistingSoa || !remarks.trim()) {
        if (match?.notes) {
          setRemarks(match.notes);
          setSelectedSoaNoteId(match.id);
        }
      }
    }
  }, [visible, tenantSoaNotes, app.tenantId, isExistingSoa]);

  // Apply statutory calculated fees to the editable lines
  const handleApplyStatutoryFees = () => {
    if (!calculatedFees || !calculatedFees.lineItems || calculatedFees.lineItems.length === 0) {
      fetchBackendCalculatedFees();
      return;
    }
    setCustomLineItems(mapCalculatedFeesToEditableItems(calculatedFees.lineItems, 'calc-applied'));
    setIsManualMode(true);
    toast.success('Statutory fee calculation applied to SOA items.');
  };

  // Handle custom line item updates (manual mode)
  const handleUpdateItem = (
    id: string,
    field: keyof EditableLineItem,
    value: string | number
  ) => {
    setCustomLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        const itemUsesYears =
          appAsksForYears &&
          doesFeeCodeUseYears(updated.itemCode, updated.particular, calculatedFees?.formulaApplied, appAsksForYears);
        if (!itemUsesYears) {
          updated.validityYears = 0;
        }
        if (field === 'noOfUnits' || field === 'feeRate' || field === 'validityYears' || field === 'itemCode') {
          updated.amount = calculateLineItemAmount(
            updated.validityYears,
            updated.noOfUnits,
            updated.feeRate,
            updated.itemCode,
            updated.particular
          );
        }
        return updated;
      })
    );
  };

  const handleSelectParticular = (itemId: string, selected: SoaStandardParticular) => {
    if (isDuplicateParticular(selected.particular, customLineItems, itemId)) {
      toast.error('Particular already exist.');
      return;
    }

    setCustomLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const isOthers = Boolean(selected.isOthers);
        const itemUsesYears =
          appAsksForYears &&
          doesFeeCodeUseYears(selected.defaultCode, selected.particular, calculatedFees?.formulaApplied, appAsksForYears);
        const nextYears = itemUsesYears ? (item.validityYears > 0 ? item.validityYears : 1) : 0;
        const nextRate = typeof selected.feeRate === 'number' && selected.feeRate >= 0 ? selected.feeRate : item.feeRate;
        const nextAmount = calculateLineItemAmount(
          nextYears,
          item.noOfUnits,
          nextRate,
          selected.defaultCode,
          selected.particular
        );
        return {
          ...item,
          particular: selected.particular,
          itemCode: selected.defaultCode,
          description: isOthers ? item.description : undefined,
          validityYears: nextYears,
          feeRate: nextRate,
          amount: nextAmount,
        };
      })
    );
    setOpenParticularDropdownId(null);
    setParticularSearch('');
  };

  const handleUpdateOthersDescription = (itemId: string, text: string) => {
    const formattedParticular = text.trim().length > 0 ? `Others: ${text.trim()}` : 'Others';
    if (isDuplicateParticular(formattedParticular, customLineItems, itemId)) {
      toast.error('Particular already exist.');
      return;
    }

    setCustomLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          particular: formattedParticular,
          description: text,
        };
      })
    );
  };

  const handleAddItem = () => {
    const available = getAvailableStandardParticular(customLineItems, linkedParticularCatalog);
    if (available === null) {
      toast.error('Particular already exist.');
      return;
    }

    const usesYears =
      appAsksForYears &&
      doesFeeCodeUseYears(available.defaultCode, available.particular, calculatedFees?.formulaApplied, appAsksForYears);
    const initialRate = typeof available.feeRate === 'number' && available.feeRate >= 0 ? available.feeRate : 100;
    const initialYears = usesYears ? 1 : 0;
    const newItem: EditableLineItem = {
      id: `item-new-${Date.now()}`,
      particular: available.particular,
      itemCode: available.defaultCode,
      validityYears: initialYears,
      noOfUnits: 1,
      feeRate: initialRate,
      amount: calculateLineItemAmount(initialYears, 1, initialRate, available.defaultCode, available.particular),
    };
    setCustomLineItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (customLineItems.length <= 1) {
      toast.error('Statement of Account must have at least one line item.');
      return;
    }
    setCustomLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Compute displayed total
  const singleUnitTotal = isManualMode
    ? customLineItems.reduce((sum, item) => sum + item.amount, 0)
    : (calculatedFees?.totalAmount ?? (app.totalAmountDue > 0 ? app.totalAmountDue : 0));

  const displayedTotal =
    isBulkApp && billingScopeMode === 'INDIVIDUAL' && selectedApplicantId === 'ALL'
      ? singleUnitTotal * Math.max(eligibleApplicants.length, 1)
      : singleUnitTotal;

  const handleGenerate = async () => {
    const isReturned =
      app.status === 'Returned' ||
      app.soaStatus === 'Returned' ||
      (app.note !== undefined && (app.note.includes('SOA returned') || app.note.includes('Returned by Accountant')));

    if (app.status !== 'Evaluating' && !isReturned) {
      toast.warning('You must start evaluation on this application first before generating the Statement of Account.');
      return;
    }

    const isPerApplicantBatch = isBulkApp && billingScopeMode === 'INDIVIDUAL' && selectedApplicantId === 'ALL';

    if (!isPerApplicantBatch && issuedToName.trim().length === 0) {
      toast.error('Please provide the Payor / Issued To Name.');
      return;
    }

    if (isManualMode && customLineItems.length === 0) {
      toast.error('At least one fee line item is required.');
      return;
    }

    if (isManualMode) {
      const seen = new Set<string>();
      for (const item of customLineItems) {
        const norm = normalizeParticularKey(item.particular);
        if (norm.length === 0) {
          toast.error('All fee line items must have a particular description.');
          return;
        }
        if (seen.has(norm)) {
          toast.error('Particular already exist.');
          return;
        }
        seen.add(norm);
      }
    }

    setSubmitting(true);

    let lineItemRequests: CreateSoaLineItemRequest[] | undefined = undefined;

    if (isManualMode) {
      lineItemRequests = customLineItems.map((item) => ({
        particular: item.particular.trim(),
        itemCode: item.itemCode.trim(),
        description: item.description,
        validityYears: item.validityYears,
        noOfUnits: item.noOfUnits,
        feeRate: item.feeRate,
        amount: item.amount,
      }));
    }

    const resolvedDue = dueDate.trim() || normalizeYmd(app.soaDueDate || app.dueDate) || (new Date().toISOString().split('T')[0] ?? '');
    const fallbackAddress = resolveInitialAddress(app);

    if (isBulkApp && billingScopeMode === 'INDIVIDUAL') {
      const targetApplicants =
        selectedApplicantId === 'ALL'
          ? eligibleApplicants
          : eligibleApplicants.filter((a) => a.id === selectedApplicantId);

      if (targetApplicants.length === 0) {
        setSubmitting(false);
        toast.error('No eligible applicant selected for Individual SOA generation.');
        return;
      }

      for (const targetApp of targetApplicants) {
        const defaultIndivName = resolveIndividualApplicantName(targetApp, app);
        const companyNameLower = resolveInitialName(app, 'BULK').toLowerCase();
        const indivName =
          selectedApplicantId !== 'ALL' &&
          issuedToName.trim().length > 0 &&
          issuedToName.trim().toLowerCase() !== companyNameLower
            ? issuedToName.trim()
            : defaultIndivName;
        const indivAddress =
          selectedApplicantId !== 'ALL' && issuedToAddress.trim().length > 0
            ? issuedToAddress.trim()
            : resolveIndividualApplicantAddress(targetApp, fallbackAddress);
        const indivType: IssuedToTypeDto = 'Individual';

        const [, err] = await applicationService.createSoa(app.id, {
          applicantId: targetApp.id,
          noOfUnits: 1,
          issuedToType: indivType,
          issuedToName: indivName,
          issuedToAddress: indivAddress,
          dueDate: resolvedDue,
          lineItems: lineItemRequests,
          remarks: remarks.trim() || undefined,
          soaNoteId: selectedSoaNoteId || undefined,
          soaNumber:
            allowManualSoaNumber && targetApplicants.length === 1 && manualSoaNumber.trim().length > 0
              ? manualSoaNumber.trim()
              : undefined,
        });

        if (err !== null) {
          setSubmitting(false);
          toast.error(`Failed to generate Individual SOA for ${indivName}.`);
          return;
        }
      }

      setSubmitting(false);
      const msg =
        targetApplicants.length > 1
          ? `Generated ${targetApplicants.length} Individual Statement(s) of Account.`
          : `Individual Statement of Account ${existingApplicantSoa ? 'updated' : 'generated'} for ${targetApplicants[0]?.name || 'applicant'}.`;
      toast.success(msg);
      await mutateApplications(app.id);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
      return;
    }

    const bulkOrSingleType: IssuedToTypeDto = isBulkApp ? 'Company' : issuedToType;
    const bulkOrSingleName = isBulkApp
      ? (issuedToName.trim() || resolveInitialName(app, 'BULK'))
      : issuedToName.trim();
    const bulkOrSingleAddr = isBulkApp
      ? (issuedToAddress.trim() || resolveInitialAddress(app, 'BULK'))
      : issuedToAddress.trim();

    const [, err] = await applicationService.createSoa(app.id, {
      applicantId: undefined,
      noOfUnits: isBulkApp ? Math.max(eligibleApplicants.length, 1) : 1,
      issuedToType: bulkOrSingleType,
      issuedToName: bulkOrSingleName,
      issuedToAddress: bulkOrSingleAddr,
      dueDate: resolvedDue,
      lineItems: lineItemRequests,
      remarks: remarks.trim() || undefined,
      soaNoteId: selectedSoaNoteId || undefined,
      soaNumber:
        allowManualSoaNumber && manualSoaNumber.trim().length > 0
          ? manualSoaNumber.trim()
          : undefined,
    });

    setSubmitting(false);

    if (err !== null) {
      toast.error('Failed to generate Statement of Account.');
      return;
    }

    const successMsg = isExistingSoa ? 'Statement of Account updated.' : 'Statement of Account generated.';
    toast.success(successMsg);
    await mutateApplications(app.id);
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            },
          ]}
        >
          {/* ── Modal Header ── */}
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200] },
            ]}
          >
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: isDark ? colors.brand[900] : colors.brand[50] },
                ]}
              >
                <Lucide
                  name={isExistingSoa ? "edit-3" : "file-text"}
                  size={20}
                  color={isDark ? colors.brand[400] : colors.brand[600]}
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                  ]}
                >
                  {isExistingSoa ? 'Edit Statement of Account' : 'Generate Statement of Account'}
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                  ]}
                >
                  Ref #{app.referenceNumber} • {app.serviceName}
                </Text>
              </View>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <Lucide
                name="x"
                size={20}
                color={isDark ? colors.neutral[400] : colors.neutral[500]}
              />
            </Pressable>
          </View>

          {/* ── Modal Scroll Body ── */}
          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Statutory Calculation Banner ── */}
            <View
              style={[
                styles.computationBanner,
                {
                  backgroundColor: isDark ? colors.brand[900] + '33' : colors.brand[50],
                  borderColor: isDark ? colors.brand[800] : colors.brand[200],
                  borderLeftWidth: 4,
                  borderLeftColor: isDark ? colors.brand[400] : colors.brand[600],
                },
              ]}
            >
              <View style={styles.bannerHeaderRow}>
                <View style={styles.bannerIconRow}>
                  <Lucide
                    name="cpu"
                    size={16}
                    color={isDark ? colors.brand[400] : colors.brand[700]}
                  />
                  <Text
                    style={[
                      styles.bannerTitle,
                      { color: isDark ? colors.brand[300] : colors.brand[800] },
                    ]}
                  >
                    Statutory Fee Calculation &amp; Schedule
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {calculatedFees?.formulaApplied && (
                    <View
                      style={[
                        styles.formulaBadge,
                        { backgroundColor: isDark ? colors.brand[900] : colors.brand[100] },
                      ]}
                    >
                      <Lucide
                        name="code"
                        size={11}
                        color={isDark ? colors.brand[300] : colors.brand[800]}
                      />
                      <Text
                        style={[
                          styles.formulaBadgeText,
                          { color: isDark ? colors.brand[300] : colors.brand[800] },
                        ]}
                      >
                        Formula: {calculatedFees.formulaApplied}
                      </Text>
                    </View>
                  )}

                  <Pressable
                    disabled={isCalculating}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: RADIUS.xs,
                      backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                      borderWidth: 1,
                      borderColor: isDark ? colors.brand[500] : colors.brand[600],
                    }}
                    onPress={() => void fetchBackendCalculatedFees()}
                  >
                    <Lucide
                      name="refresh-cw"
                      size={11}
                      color={isDark ? colors.brand[400] : colors.brand[700]}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: TYPOGRAPHY.weights.semibold,
                        color: isDark ? colors.brand[400] : colors.brand[700],
                        fontFamily: TYPOGRAPHY.fonts.primary,
                      }}
                    >
                      {isCalculating ? 'Computing...' : 'Recalculate Schedule'}
                    </Text>
                  </Pressable>

                  {isManualMode && (
                    <Pressable
                      disabled={isCalculating}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: RADIUS.xs,
                        backgroundColor: isDark ? colors.brand[800] : colors.brand[100],
                        borderWidth: 1,
                        borderColor: isDark ? colors.brand[600] : colors.brand[400],
                      }}
                      onPress={handleApplyStatutoryFees}
                    >
                      <Lucide
                        name="check"
                        size={11}
                        color={isDark ? colors.brand[200] : colors.brand[900]}
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: TYPOGRAPHY.weights.bold,
                          color: isDark ? colors.brand[200] : colors.brand[900],
                          fontFamily: TYPOGRAPHY.fonts.primary,
                        }}
                      >
                        Apply Schedule Fees
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>

              <Text
                style={[
                  styles.bannerDesc,
                  { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                ]}
              >
                Statutory regulatory fees, surcharges, and DST are evaluated dynamically. You can review the calculated schedule or customize each line item below.
              </Text>

              {/* Service & Category Metadata Tag */}
              <View style={styles.metaTagsRow}>
                <View
                  style={[
                    styles.tagPill,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                    ]}
                  >
                    Service:{' '}
                    <Text style={{ fontWeight: TYPOGRAPHY.weights.bold }}>
                      {calculatedFees?.serviceName || app.serviceName || app.serviceCategory || 'Statutory Regulatory Service'}
                    </Text>
                    {Boolean(calculatedFees?.serviceCode) && (
                      <Text style={{ fontWeight: TYPOGRAPHY.weights.bold, color: isDark ? colors.brand[300] : colors.brand[700] }}>
                        {' '}({calculatedFees?.serviceCode})
                      </Text>
                    )}
                  </Text>
                </View>

                {calculatedFees?.element && (
                  <View
                    style={[
                      styles.tagPill,
                      {
                        backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                        borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                      ]}
                    >
                      Element / Class:{' '}
                      <Text style={{ fontWeight: TYPOGRAPHY.weights.bold }}>
                        {calculatedFees.element}
                      </Text>
                    </Text>
                  </View>
                )}

                <View
                  style={[
                    styles.tagPill,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                    ]}
                  >
                    Billing Mode:{' '}
                    <Text style={{ fontWeight: TYPOGRAPHY.weights.bold }}>
                      {isBulkApp
                        ? (billingScopeMode === 'INDIVIDUAL'
                            ? (selectedApplicantId === 'ALL'
                                ? `Individual SOA (${eligibleApplicants.length} Applicants)`
                                : 'Individual SOA (Single Applicant)')
                            : `Bulk Consolidated (${eligibleApplicants.length || 1} units)`)
                        : 'Single Application'}
                    </Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Bulk vs Individual SOA Billing Scope Selector (Bulk Applications Only) ── */}
            {isBulkApp && (
              <View
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                    borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                    borderLeftWidth: 4,
                    borderLeftColor: isDark ? '#818cf8' : '#4f46e5',
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View
                      style={[
                        styles.sectionIconBadge,
                        { backgroundColor: isDark ? '#312e81' : '#e0e7ff' },
                      ]}
                    >
                      <Lucide name="layers" size={15} color={isDark ? '#a5b4fc' : '#4338ca'} />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.sectionTitle,
                          { color: isDark ? '#a5b4fc' : '#4338ca', marginBottom: 2 },
                        ]}
                      >
                        BULK SOA &amp; ORDER OF PAYMENT (OP) BILLING MODE
                      </Text>
                      <Text
                        style={[
                          styles.sectionSubtitle,
                          { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                        ]}
                      >
                        Choose whether to issue 1 consolidated Bulk SOA/OP for all applicants or Individual SOA/OP per applicant.
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                  <Pressable
                    onPress={() => handleSelectBillingScope('BULK')}
                    style={[
                      {
                        flex: 1,
                        minWidth: 240,
                        padding: 12,
                        borderRadius: RADIUS.card,
                        borderWidth: 1.5,
                        borderColor:
                          billingScopeMode === 'BULK'
                            ? (isDark ? colors.brand[400] : colors.brand[600])
                            : (isDark ? colors.neutral[700] : colors.neutral[300]),
                        backgroundColor:
                          billingScopeMode === 'BULK'
                            ? (isDark ? colors.brand[900] + '55' : colors.brand[50])
                            : (isDark ? colors.neutral[900] : COLORS.neutral.white),
                        gap: 4,
                      },
                      Platform.select({ web: { cursor: 'pointer' } as object }),
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Lucide
                          name="layers"
                          size={15}
                          color={billingScopeMode === 'BULK' ? (isDark ? colors.brand[300] : colors.brand[700]) : (isDark ? colors.neutral[400] : colors.neutral[500])}
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '700',
                            color: billingScopeMode === 'BULK' ? (isDark ? colors.brand[300] : colors.brand[800]) : (isDark ? colors.neutral[200] : colors.neutral[800]),
                          }}
                        >
                          Bulk SOA &amp; Bulk OP (Consolidated)
                        </Text>
                      </View>
                      {billingScopeMode === 'BULK' && (
                        <Lucide name="check-circle" size={15} color={isDark ? colors.brand[400] : colors.brand[600]} />
                      )}
                    </View>
                    <Text style={{ fontSize: 11, color: isDark ? colors.neutral[400] : colors.neutral[600], lineHeight: 15 }}>
                      Generates 1 consolidated SOA and 1 Bulk OP covering all {eligibleApplicants.length} eligible applicant(s).
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleSelectBillingScope('INDIVIDUAL')}
                    style={[
                      {
                        flex: 1,
                        minWidth: 240,
                        padding: 12,
                        borderRadius: RADIUS.card,
                        borderWidth: 1.5,
                        borderColor:
                          billingScopeMode === 'INDIVIDUAL'
                            ? (isDark ? colors.brand[400] : colors.brand[600])
                            : (isDark ? colors.neutral[700] : colors.neutral[300]),
                        backgroundColor:
                          billingScopeMode === 'INDIVIDUAL'
                            ? (isDark ? colors.brand[900] + '55' : colors.brand[50])
                            : (isDark ? colors.neutral[900] : COLORS.neutral.white),
                        gap: 4,
                      },
                      Platform.select({ web: { cursor: 'pointer' } as object }),
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Lucide
                          name="users"
                          size={15}
                          color={billingScopeMode === 'INDIVIDUAL' ? (isDark ? colors.brand[300] : colors.brand[700]) : (isDark ? colors.neutral[400] : colors.neutral[500])}
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '700',
                            color: billingScopeMode === 'INDIVIDUAL' ? (isDark ? colors.brand[300] : colors.brand[800]) : (isDark ? colors.neutral[200] : colors.neutral[800]),
                          }}
                        >
                          Individual SOA &amp; Individual OP (By Applicant)
                        </Text>
                      </View>
                      {billingScopeMode === 'INDIVIDUAL' && (
                        <Lucide name="check-circle" size={15} color={isDark ? colors.brand[400] : colors.brand[600]} />
                      )}
                    </View>
                    <Text style={{ fontSize: 11, color: isDark ? colors.neutral[400] : colors.neutral[600], lineHeight: 15 }}>
                      Generates distinct per-applicant SOA and Individual OP (either for a single applicant or for all applicants).
                    </Text>
                  </Pressable>
                </View>

                {billingScopeMode === 'INDIVIDUAL' && (
                  <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: isDark ? colors.neutral[700] : colors.neutral[200] }}>
                    <Text
                      style={[
                        styles.fieldLabel,
                        { color: isDark ? colors.neutral[300] : colors.neutral[700], marginBottom: 8 },
                      ]}
                    >
                      Select Target Applicant(s) for Individual SOA:
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      <Pressable
                        onPress={() => handleSelectApplicantTarget('ALL')}
                        style={[
                          {
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: RADIUS.sm,
                            borderWidth: 1,
                            borderColor:
                              selectedApplicantId === 'ALL'
                                ? (isDark ? colors.brand[400] : colors.brand[600])
                                : (isDark ? colors.neutral[700] : colors.neutral[300]),
                            backgroundColor:
                              selectedApplicantId === 'ALL'
                                ? (isDark ? colors.brand[900] : colors.brand[100])
                                : (isDark ? colors.neutral[900] : COLORS.neutral.white),
                          },
                          Platform.select({ web: { cursor: 'pointer' } as object }),
                        ]}
                      >
                        <Lucide
                          name="users"
                          size={13}
                          color={selectedApplicantId === 'ALL' ? (isDark ? colors.brand[300] : colors.brand[800]) : (isDark ? colors.neutral[400] : colors.neutral[600])}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: selectedApplicantId === 'ALL' ? '700' : '600',
                            color: selectedApplicantId === 'ALL' ? (isDark ? colors.brand[200] : colors.brand[900]) : (isDark ? colors.neutral[300] : colors.neutral[700]),
                          }}
                        >
                          All Eligible Applicants ({eligibleApplicants.length} Individual SOAs)
                        </Text>
                      </Pressable>

                      {eligibleApplicants.map((applicant, idx) => {
                        const isSelected = selectedApplicantId === applicant.id;
                        const applicantHasSoa = Boolean(app.soasList?.some((s) => s.applicantId === applicant.id));
                        return (
                          <Pressable
                            key={applicant.id}
                            onPress={() => handleSelectApplicantTarget(applicant.id)}
                            style={[
                              {
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: RADIUS.sm,
                                borderWidth: 1,
                                borderColor: isSelected
                                  ? (isDark ? colors.brand[400] : colors.brand[600])
                                  : (isDark ? colors.neutral[700] : colors.neutral[300]),
                                backgroundColor: isSelected
                                  ? (isDark ? colors.brand[900] : colors.brand[100])
                                  : (isDark ? colors.neutral[900] : COLORS.neutral.white),
                              },
                              Platform.select({ web: { cursor: 'pointer' } as object }),
                            ]}
                          >
                            <Lucide
                              name={applicantHasSoa ? 'check-circle' : 'user'}
                              size={12}
                              color={
                                applicantHasSoa
                                  ? (isDark ? '#34d399' : '#059669')
                                  : isSelected
                                  ? (isDark ? colors.brand[300] : colors.brand[800])
                                  : (isDark ? colors.neutral[400] : colors.neutral[600])
                              }
                            />
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: isSelected ? '700' : '500',
                                color: isSelected ? (isDark ? colors.brand[200] : colors.brand[900]) : (isDark ? colors.neutral[300] : colors.neutral[700]),
                              }}
                            >
                              #{idx + 1} {applicant.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* ── Section 1: Payor Information ── */}
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                  borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                  borderLeftWidth: 4,
                  borderLeftColor: isDark ? '#38bdf8' : '#0284c7',
                },
              ]}
            >
              <View style={styles.sectionHeaderWithIcon}>
                <View
                  style={[
                    styles.sectionIconBadge,
                    { backgroundColor: isDark ? '#0c4a6e' : '#e0f2fe' },
                  ]}
                >
                  <Lucide name="user" size={15} color={isDark ? '#38bdf8' : '#0284c7'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: isDark ? '#38bdf8' : '#0369a1' },
                    ]}
                  >
                    1. BILLING &amp; PAYOR INFORMATION
                  </Text>
                  <Text
                    style={[
                      styles.sectionSubtitle,
                      { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                    ]}
                  >
                    Verify the payor name, billing address, and payment due date for this Statement of Account.
                  </Text>
                </View>
              </View>

              <View style={styles.formRow}>
                {allowManualSoaNumber && (
                  <View style={styles.formField}>
                    <Text
                      style={[
                        styles.fieldLabel,
                        { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                      ]}
                    >
                      SOA Number (Manual Entry / Transition Mode)
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
                          borderColor: isDark ? colors.brand[600] : colors.brand[400],
                          color: isDark ? colors.neutral[100] : colors.neutral[900],
                        },
                      ]}
                      value={manualSoaNumber}
                      onChangeText={setManualSoaNumber}
                      placeholder="Leave blank to auto-generate (e.g. 61-2026-11-0001)"
                      placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                    />
                  </View>
                )}

                <View style={styles.formField}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                    ]}
                  >
                    Billed To / Payor Name <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                        color: isDark ? colors.neutral[100] : colors.neutral[900],
                        borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                      },
                    ]}
                    value={issuedToName}
                    onChangeText={setIssuedToName}
                    placeholder="Enter Payor Name"
                    placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                  />
                </View>

                <View style={[styles.formField, { flex: 0.5 }]}>
                  <DatePickerInput
                    label="Due Date"
                    required
                    value={dueDate}
                    onChangeText={setDueDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>

              <View style={styles.formField}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                  ]}
                >
                  Billing Address
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                      color: isDark ? colors.neutral[100] : colors.neutral[900],
                      borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                    },
                  ]}
                  value={issuedToAddress}
                  onChangeText={setIssuedToAddress}
                  placeholder="Enter billing address"
                  placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                />
              </View>
            </View>

            {/* ── Section 2: Statutory Fee Breakdown Table ── */}
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                  borderColor: isDark ? '#059669' : '#a7f3d0',
                  borderLeftWidth: 4,
                  borderLeftColor: isDark ? '#10b981' : '#059669',
                },
              ]}
            >
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionHeaderWithIcon, { flex: 1, minWidth: 240 }]}>
                  <View
                    style={[
                      styles.sectionIconBadge,
                      { backgroundColor: isDark ? '#064e3b' : '#d1fae5' },
                    ]}
                  >
                    <Lucide name="credit-card" size={15} color={isDark ? '#34d399' : '#059669'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Text
                        style={[
                          styles.sectionTitle,
                          { color: isDark ? '#34d399' : '#047857' },
                        ]}
                      >
                        2. STATUTORY PARTICULARS &amp; FEE BREAKDOWN
                      </Text>
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 10,
                          backgroundColor: isDark ? '#064e3b' : '#ecfdf5',
                          borderWidth: 1,
                          borderColor: isDark ? '#059669' : '#6ee7b7',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: '700',
                            color: isDark ? '#6ee7b7' : '#047857',
                            fontFamily: TYPOGRAPHY.fonts.primary,
                          }}
                        >
                          {isManualMode
                            ? `${customLineItems.length} ITEM(S) • PHP ${singleUnitTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                            : `${calculatedFees?.lineItems.length ?? 0} ITEM(S) • PHP ${singleUnitTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                        </Text>
                      </View>
                      {Boolean(calculatedFees?.formulaApplied) && (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 10,
                            backgroundColor: isDark ? colors.brand[900] : colors.brand[50],
                            borderWidth: 1,
                            borderColor: isDark ? colors.brand[600] : colors.brand[300],
                          }}
                        >
                          <Lucide
                            name="code"
                            size={10}
                            color={isDark ? colors.brand[300] : colors.brand[700]}
                          />
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: '700',
                              color: isDark ? colors.brand[300] : colors.brand[700],
                              fontFamily: TYPOGRAPHY.fonts.primary,
                            }}
                          >
                            {calculatedFees?.formulaApplied}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.sectionSubtitle,
                        { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                      ]}
                    >
                      {isManualMode
                        ? 'Editable line items active. Modify particulars, rates, and units below.'
                        : 'Showing automated statutory fee schedule.'}
                    </Text>
                  </View>
                </View>

                {/* Mode Switcher Button */}
                <Pressable
                  style={[
                    styles.modeToggleBtn,
                    {
                      backgroundColor: isManualMode
                        ? (isDark ? colors.brand[900] : colors.brand[100])
                        : (isDark ? colors.neutral[700] : colors.neutral[200]),
                      borderColor: isDark ? colors.neutral[600] : colors.neutral[300],
                    },
                  ]}
                  onPress={() => setIsManualMode((prev) => !prev)}
                >
                  <Lucide
                    name={isManualMode ? 'check-square' : 'edit-3'}
                    size={13}
                    color={isDark ? colors.neutral[200] : colors.neutral[800]}
                  />
                  <Text
                    style={[
                      styles.modeToggleText,
                      { color: isDark ? colors.neutral[200] : colors.neutral[800] },
                    ]}
                  >
                    {isManualMode ? 'Switch to Schedule View' : 'Edit Items & Particulars'}
                  </Text>
                </Pressable>
              </View>

              {/* Loading State */}
              {isCalculating && (
                <View style={styles.calculatingBox}>
                  <ActivityIndicator size="small" color={colors.brand[500]} />
                  <Text
                    style={[
                      styles.calculatingText,
                      { color: isDark ? colors.neutral[300] : colors.neutral[600] },
                    ]}
                  >
                    Calculating official statutory fees...
                  </Text>
                </View>
              )}

              {/* Calculation Error Banner */}
              {calculationError && (
                <View
                  style={[
                    styles.errorBanner,
                    {
                      backgroundColor: isDark ? colors.semantic.error + '22' : '#FEE2E2',
                      borderColor: COLORS.semantic.error,
                    },
                  ]}
                >
                  <Lucide name="alert-circle" size={16} color={COLORS.semantic.error} />
                  <Text style={[styles.errorBannerText, { color: COLORS.semantic.error }]}>
                    {calculationError}
                  </Text>
                  <Pressable onPress={() => void fetchBackendCalculatedFees()} style={styles.retryBtn}>
                    <Text style={styles.retryBtnText}>Retry</Text>
                  </Pressable>
                </View>
              )}

              {/* ── Mode 1: Automated Statutory Table ── */}
              {!isManualMode && !isCalculating && calculatedFees && (
                <View style={styles.itemsList}>
                  {calculatedFees.lineItems.map((item, idx) => (
                    <View
                      key={`calc-${idx}-${item.itemCode}`}
                      style={[
                        styles.itemRowCard,
                        {
                          backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                          borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                          borderLeftWidth: 4,
                          borderLeftColor: item.isTax
                            ? (isDark ? '#10b981' : '#059669')
                            : item.isSurcharge
                            ? (isDark ? '#f87171' : '#dc2626')
                            : (isDark ? colors.brand[400] : colors.brand[600]),
                        },
                      ]}
                    >
                      <View style={styles.itemHeader}>
                        <View style={styles.itemHeaderLeft}>
                          <Text
                            style={[
                              styles.itemBadge,
                              {
                                backgroundColor: item.isTax
                                  ? (isDark ? '#065F46' : '#D1FAE5')
                                  : item.isSurcharge
                                  ? (isDark ? '#7F1D1D' : '#FEE2E2')
                                  : (isDark ? colors.neutral[700] : colors.neutral[100]),
                                color: item.isTax
                                  ? (isDark ? '#34D399' : '#065F46')
                                  : item.isSurcharge
                                  ? (isDark ? '#F87171' : '#991B1B')
                                  : (isDark ? colors.neutral[200] : colors.neutral[700]),
                              },
                            ]}
                          >
                            {item.isTax ? 'DST TAX' : item.isSurcharge ? 'PENALTY' : item.itemCode}
                          </Text>
                          <Text
                            style={[
                              styles.itemParticularTitle,
                              { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                            ]}
                          >
                            {item.particular}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.itemAmountBadge,
                            { color: isDark ? colors.brand[400] : colors.brand[700] },
                          ]}
                        >
                          PHP {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Text>
                      </View>

                      {item.description && (
                        <Text
                          style={[
                            styles.itemDescText,
                            { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                          ]}
                        >
                          {item.description}
                        </Text>
                      )}

                      <View style={styles.itemMetaRow}>
                        <Text
                          style={[
                            styles.itemMetaText,
                            { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                          ]}
                        >
                          Units: <Text style={{ fontWeight: TYPOGRAPHY.weights.semibold }}>{item.noOfUnits}</Text>
                        </Text>
                        {item.validityYears > 0 && (
                          <Text
                            style={[
                              styles.itemMetaText,
                              { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                            ]}
                          >
                            Validity: <Text style={{ fontWeight: TYPOGRAPHY.weights.semibold }}>{item.validityYears} yr(s)</Text>
                          </Text>
                        )}
                        <Text
                          style={[
                            styles.itemMetaText,
                            { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                          ]}
                        >
                          Rate: <Text style={{ fontWeight: TYPOGRAPHY.weights.semibold }}>PHP {item.feeRate.toFixed(2)}</Text>
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* ── Mode 2: Manual Custom Line Items ── */}
              {isManualMode && (
                <View style={styles.itemsList}>
                  <View style={styles.manualToolbar}>
                    <Text
                      style={[
                        styles.manualToolbarDesc,
                        { color: isDark ? colors.neutral[300] : colors.neutral[600] },
                      ]}
                    >
                      Add or modify individual fee lines:
                    </Text>
                    <Pressable
                      style={[
                        styles.addItemBtn,
                        { backgroundColor: isDark ? colors.brand[900] : colors.brand[100] },
                      ]}
                      onPress={handleAddItem}
                    >
                      <Lucide
                        name="plus"
                        size={14}
                        color={isDark ? colors.brand[300] : colors.brand[700]}
                      />
                      <Text
                        style={[
                          styles.addItemBtnText,
                          { color: isDark ? colors.brand[300] : colors.brand[700] },
                        ]}
                      >
                        Add Item
                      </Text>
                    </Pressable>
                  </View>

                  {customLineItems.map((item, idx) => {
                    const isParticularOpen = openParticularDropdownId === item.id;
                    const isOthers = item.particular.toLowerCase().startsWith('others');

                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.itemRowCard,
                          {
                            backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                            borderLeftWidth: 4,
                            borderLeftColor: item.isTax
                              ? (isDark ? '#10b981' : '#059669')
                              : item.isSurcharge
                              ? (isDark ? '#f87171' : '#dc2626')
                              : (isDark ? colors.brand[400] : colors.brand[600]),
                          },
                        ]}
                      >
                        <View style={styles.itemHeader}>
                          <Text
                            style={[
                              styles.itemBadge,
                              {
                                backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100],
                                color: isDark ? colors.neutral[200] : colors.neutral[700],
                              },
                            ]}
                          >
                            Item #{idx + 1}
                          </Text>
                          {customLineItems.length > 1 && (
                            <Pressable onPress={() => handleRemoveItem(item.id)} hitSlop={6}>
                              <Lucide name="trash-2" size={16} color={COLORS.semantic.error} />
                            </Pressable>
                          )}
                        </View>

                        <View style={styles.itemGrid}>
                          <View style={{ flex: 2 }}>
                            <Text
                              style={[
                                styles.miniLabel,
                                { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                              ]}
                            >
                              Particulars
                            </Text>
                            <Pressable
                              style={[
                                styles.particularDropdownBtn,
                                {
                                  backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                                  borderColor: isParticularOpen
                                    ? (isDark ? colors.brand[500] : colors.brand[600])
                                    : (isDark ? colors.neutral[700] : colors.neutral[200]),
                                },
                              ]}
                              onPress={() => {
                                setOpenParticularDropdownId((prev) => (prev === item.id ? null : item.id));
                                setParticularSearch('');
                              }}
                              accessibilityRole="button"
                              accessibilityLabel="Select particular from SOA"
                            >
                              <Text
                                style={[
                                  styles.particularDropdownBtnText,
                                  { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                                ]}
                                numberOfLines={1}
                              >
                                {item.particular || 'Select Particular...'}
                              </Text>
                              <Lucide
                                name={isParticularOpen ? 'chevron-up' : 'chevron-down'}
                                size={14}
                                color={isDark ? colors.neutral[400] : colors.neutral[500]}
                              />
                            </Pressable>
                          </View>

                          <View style={{ flex: 0.9 }}>
                            <Text
                              style={[
                                styles.miniLabel,
                                { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                              ]}
                            >
                              Code
                            </Text>
                            <TextInput
                              style={[
                                styles.inputSm,
                                {
                                  backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                                  color: isDark ? colors.neutral[100] : colors.neutral[900],
                                  borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                                },
                              ]}
                              value={item.itemCode}
                              onChangeText={(v) => handleUpdateItem(item.id, 'itemCode', v)}
                              placeholder="Code"
                            />
                          </View>

                          {appAsksForYears && (
                            <View style={{ flex: 0.7 }}>
                              <Text
                                style={[
                                  styles.miniLabel,
                                  { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                                ]}
                              >
                                Years
                              </Text>
                              {doesFeeCodeUseYears(item.itemCode, item.particular, calculatedFees?.formulaApplied, appAsksForYears) ? (
                                <TextInput
                                  style={[
                                    styles.inputSm,
                                    {
                                      backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                                      color: isDark ? colors.neutral[100] : colors.neutral[900],
                                      borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                                      textAlign: 'center',
                                    },
                                  ]}
                                  keyboardType="numeric"
                                  value={String(item.validityYears || 1)}
                                  onChangeText={(v) =>
                                    handleUpdateItem(item.id, 'validityYears', Number(v) || 1)
                                  }
                                />
                              ) : (
                                <View
                                  style={[
                                    styles.inputSm,
                                    {
                                      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                                      borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    },
                                  ]}
                                >
                                  <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? colors.neutral[400] : colors.neutral[500] }}>
                                    N/A
                                  </Text>
                                </View>
                              )}
                            </View>
                          )}

                          <View style={{ flex: 0.7 }}>
                            <Text
                              style={[
                                styles.miniLabel,
                                { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                              ]}
                            >
                              Units
                            </Text>
                            <TextInput
                              style={[
                                styles.inputSm,
                                {
                                  backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                                  color: isDark ? colors.neutral[100] : colors.neutral[900],
                                  borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                                  textAlign: 'center',
                                },
                              ]}
                              keyboardType="numeric"
                              value={String(item.noOfUnits)}
                              onChangeText={(v) =>
                                handleUpdateItem(item.id, 'noOfUnits', Number(v) || 1)
                              }
                            />
                          </View>

                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.miniLabel,
                                { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                              ]}
                            >
                              Rate (PHP)
                            </Text>
                            <TextInput
                              style={[
                                styles.inputSm,
                                {
                                  backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                                  color: isDark ? colors.neutral[100] : colors.neutral[900],
                                  borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                                  textAlign: 'right',
                                },
                              ]}
                              keyboardType="numeric"
                              value={String(item.feeRate)}
                              onChangeText={(v) =>
                                handleUpdateItem(item.id, 'feeRate', Number(v) || 0)
                              }
                            />
                          </View>

                          <View style={{ flex: 1.1 }}>
                            <Text
                              style={[
                                styles.miniLabel,
                                { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                              ]}
                            >
                              Amount
                            </Text>
                            <View
                              style={[
                                styles.amountBox,
                                {
                                  backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100],
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.amountText,
                                  { color: isDark ? colors.neutral[100] : colors.neutral[900] },
                                ]}
                              >
                                PHP {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Particulars Dropdown Panel */}
                        {isParticularOpen && (
                          <View
                            style={[
                              styles.particularDropdownPanel,
                              {
                                backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                                borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.particularSearchBox,
                                {
                                  backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                                  borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                                },
                              ]}
                            >
                              <Lucide name="search" size={13} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
                              <TextInput
                                style={[styles.particularSearchInput, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}
                                placeholder="Search SOA particulars or codes..."
                                placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                                value={particularSearch}
                                onChangeText={setParticularSearch}
                              />
                              {particularSearch.length > 0 && (
                                <Pressable onPress={() => setParticularSearch('')} hitSlop={6}>
                                  <Lucide name="x" size={12} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
                                </Pressable>
                              )}
                            </View>

                            <ScrollView style={styles.particularOptionsScroll} nestedScrollEnabled showsVerticalScrollIndicator>
                              {groupedCategories.map((group: { category: SoaParticularCategory; items: SoaStandardParticular[] }) => (
                                <View key={group.category} style={styles.particularCategoryGroup}>
                                  <Text style={[styles.particularCategoryHeader, { color: isDark ? colors.brand[400] : colors.brand[700] }]}>
                                    {group.category}
                                  </Text>
                                  {group.items.map((opt: SoaStandardParticular) => {
                                    const isSelected = item.particular === opt.particular || (Boolean(opt.isOthers) && isOthers);
                                    const isAlreadyUsed = isDuplicateParticular(opt.particular, customLineItems, item.id);

                                    return (
                                      <Pressable
                                        key={`${group.category}-${opt.particular}`}
                                        style={[
                                          styles.particularOptionRow,
                                          isSelected && { backgroundColor: isDark ? colors.brand[900] : colors.brand[100] },
                                          isAlreadyUsed && { opacity: 0.55 },
                                        ]}
                                        onPress={() => {
                                          if (isAlreadyUsed) {
                                            toast.error('Particular already exist.');
                                            return;
                                          }
                                          handleSelectParticular(item.id, opt);
                                        }}
                                      >
                                        <View style={{ flex: 1, marginRight: 8 }}>
                                          <Text
                                            style={[
                                              styles.particularOptionName,
                                              { color: isDark ? colors.neutral[200] : colors.neutral[800] },
                                              isSelected && { fontWeight: TYPOGRAPHY.weights.bold, color: isDark ? colors.brand[300] : colors.brand[800] },
                                            ]}
                                          >
                                            {opt.displayName || opt.particular}
                                          </Text>
                                          <Text style={[styles.particularOptionSub, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                                            Service Fee Code: {opt.defaultCode}{opt.accountCode && opt.accountCode !== opt.defaultCode ? ` • Account Code: ${opt.accountCode}` : ''}
                                          </Text>
                                        </View>
                                        {isAlreadyUsed ? (
                                          <Text style={[styles.alreadyAddedBadge, { color: COLORS.semantic.warning }]}>
                                            Already added
                                          </Text>
                                        ) : isSelected ? (
                                          <Lucide name="check" size={14} color={isDark ? colors.brand[400] : colors.brand[700]} />
                                        ) : null}
                                      </Pressable>
                                    );
                                  })}
                                </View>
                              ))}
                            </ScrollView>
                          </View>
                        )}

                        {/* "Others" Custom Description input for traceability */}
                        {isOthers && (
                          <View
                            style={[
                              styles.othersFieldContainer,
                              { borderTopColor: isDark ? colors.neutral[700] : colors.neutral[200] },
                            ]}
                          >
                            <Text style={[styles.miniLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                              Description / Purpose for Others <Text style={{ color: COLORS.semantic.error }}>*</Text>
                            </Text>
                            <TextInput
                              style={[
                                styles.inputSm,
                                {
                                  backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                                  color: isDark ? colors.neutral[100] : colors.neutral[900],
                                  borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                                },
                              ]}
                              value={
                                item.description !== undefined
                                  ? item.description
                                  : (item.particular.includes(':') ? item.particular.split(':').slice(1).join(':').trim() : '')
                              }
                              onChangeText={(v) => handleUpdateOthersDescription(item.id, v)}
                              placeholder="e.g. Penalty for late delivery, Storage fee"
                              placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                            />
                            <Text style={[styles.fieldHint, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                              Enter custom purpose for traceability in EDGE. Standard SOA format reflects under the existing "Others" section.
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

            </View>

            {/* ── Section 3: Remarks & Notes ── */}
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                  borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                  borderLeftWidth: 4,
                  borderLeftColor: isDark ? '#fbbf24' : '#d97706',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 6 }}>
                <View style={styles.sectionHeaderWithIcon}>
                  <View
                    style={[
                      styles.sectionIconBadge,
                      { backgroundColor: isDark ? '#451a03' : '#fef3c7' },
                    ]}
                  >
                    <Lucide name="file-text" size={15} color={isDark ? '#fbbf24' : '#d97706'} />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.sectionTitle,
                        { color: isDark ? '#fbbf24' : '#b45309', marginBottom: 0 },
                      ]}
                    >
                      3. SOA REMARKS &amp; ASSESSMENT INSTRUCTIONS
                    </Text>
                    <Text
                      style={[
                        styles.sectionSubtitle,
                        { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                      ]}
                    >
                      Select a regional note template or enter custom payment instructions.
                    </Text>
                  </View>
                </View>
                {tenantSoaNotes.length > 0 && (
                  <Text style={{ fontSize: 11, color: isDark ? colors.neutral[400] : colors.neutral[500] }}>
                    Loaded from Regional Templates
                  </Text>
                )}
              </View>

              {tenantSoaNotes.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                  {tenantSoaNotes.map((note) => {
                    const isSelected = selectedSoaNoteId === note.id;
                    const isDefault = note.code === 'DEFAULT' || (note.title && note.title.toLowerCase().includes('default'));
                    return (
                      <Pressable
                        key={note.id}
                        onPress={() => {
                          setRemarks(note.notes);
                          setSelectedSoaNoteId(note.id);
                          toast.success(`Applied ${note.title || note.code || 'regional'} template`);
                        }}
                        style={[
                          {
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: isSelected
                              ? (isDark ? colors.brand[500] : colors.brand[600])
                              : (isDark ? colors.neutral[700] : colors.neutral[300]),
                            backgroundColor: isSelected
                              ? (isDark ? colors.brand[900] : colors.brand[50])
                              : (isDark ? colors.neutral[800] : colors.neutral[100]),
                          },
                          Platform.select({ web: { cursor: 'pointer' } as object }),
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: isSelected ? '700' : '500',
                            color: isSelected
                              ? (isDark ? colors.brand[300] : colors.brand[700])
                              : (isDark ? colors.neutral[300] : colors.neutral[700]),
                          }}
                        >
                          {note.title || note.code || 'Regional Note'}{isDefault ? ' (Default)' : ''}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <TextInput
                style={[
                  styles.input,
                  {
                    minHeight: 64,
                    textAlignVertical: 'top',
                    backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
                    color: isDark ? colors.neutral[100] : colors.neutral[900],
                    borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                  },
                ]}
                multiline
                numberOfLines={3}
                value={remarks}
                onChangeText={setRemarks}
                placeholder="Enter remarks or payment instructions for this Statement of Account..."
              />
            </View>

            {/* ── Total Assessment Summary Card ── */}
            <View
              style={[
                styles.totalSummaryCard,
                {
                  backgroundColor: isDark ? '#064e3b' + '55' : '#ecfdf5',
                  borderColor: isDark ? '#059669' : '#6ee7b7',
                  borderLeftWidth: 5,
                  borderLeftColor: isDark ? '#34d399' : '#059669',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={[
                    styles.sectionIconBadge,
                    { backgroundColor: isDark ? '#065f46' : '#d1fae5' },
                  ]}
                >
                  <Lucide name="check-circle" size={16} color={isDark ? '#34d399' : '#059669'} />
                </View>
                <View>
                  <Text
                    style={[
                      styles.totalLabel,
                      { color: isDark ? '#6ee7b7' : '#047857' },
                    ]}
                  >
                    CALCULATED TOTAL AMOUNT DUE
                  </Text>
                  <Text
                    style={[
                      styles.totalSub,
                      { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                    ]}
                  >
                    {isManualMode
                      ? `${customLineItems.length} custom line item(s)`
                      : `${calculatedFees?.lineItems.length ?? 0} statutory fee item(s) assessed`}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.totalValue,
                  { color: isDark ? '#34d399' : '#047857' },
                ]}
              >
                PHP {displayedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </ScrollView>

          {/* ── Modal Footer Actions ── */}
          <View
            style={[
              styles.modalFooter,
              { borderTopColor: isDark ? colors.neutral[800] : colors.neutral[200] },
            ]}
          >
            <View style={{ flex: 1, minWidth: 200, marginRight: 12 }}>
              <Text style={{ fontSize: 11, color: isDark ? colors.neutral[400] : colors.neutral[500], lineHeight: 15 }}>
                {isExistingSoa
                  ? 'Saves updated fee particulars. Technical evaluation remains active until formally approved.'
                  : 'Prepares billing assessment. Technical evaluation remains active until formally approved.'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING[12] }}>
              <Pressable
                style={[
                  styles.cancelBtn,
                  {
                    borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
                    backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                  },
                ]}
                onPress={onClose}
                disabled={submitting}
              >
                <Text
                  style={[
                    styles.cancelBtnText,
                    { color: isDark ? colors.neutral[300] : colors.neutral[700] },
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.submitBtn,
                  { backgroundColor: isDark ? colors.brand[500] : colors.brand[700] },
                  submitting && styles.btnDisabled,
                ]}
                onPress={handleGenerate}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={COLORS.neutral.white} />
                ) : (
                  <>
                    <Lucide name="check-circle" size={16} color={COLORS.neutral.white} />
                    <Text style={styles.submitBtnText}>
                      {isBulkApp && billingScopeMode === 'INDIVIDUAL'
                        ? (selectedApplicantId === 'ALL'
                            ? `Generate ${eligibleApplicants.length} Individual SOA(s)`
                            : `${existingApplicantSoa ? 'Update' : 'Generate'} Applicant SOA`)
                        : isExistingSoa
                        ? (isManualMode ? 'Save Statement of Account' : 'Update & Recalculate SOA')
                        : (isManualMode ? 'Generate Custom SOA' : 'Generate Statement of Account')}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalContent: {
    width: '100%',
    maxWidth: 820,
    maxHeight: '90%',
    borderRadius: RADIUS.dialog,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: SPACING[6],
    borderRadius: RADIUS.sm,
  },
  modalBody: {
    flex: 1,
  },
  bodyContent: {
    padding: SPACING[20],
    gap: SPACING[16],
  },
  computationBanner: {
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[8],
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  bannerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bannerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  formulaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  formulaBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  bannerDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    lineHeight: 17,
  },
  metaTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
  },
  tagText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
  },
  sectionCard: {
    padding: SPACING[16],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[12],
  },
  sectionHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: 2,
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  modeToggleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  calculatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: SPACING[12],
    justifyContent: 'center',
  },
  calculatingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: SPACING[10],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  errorBannerText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  retryBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.semantic.error,
    borderRadius: RADIUS.xs,
  },
  retryBtnText: {
    color: COLORS.neutral.white,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  formRow: {
    flexDirection: 'row',
    gap: SPACING[12],
  },
  formField: {
    flex: 1,
    gap: 4,
  },
  fieldLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  required: {
    color: COLORS.semantic.error,
  },
  input: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    height: 40,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING[12],
    fontSize: 13,
  },
  itemsList: {
    gap: SPACING[8],
  },
  itemRowCard: {
    padding: SPACING[10],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  itemBadge: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  itemParticularTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
  },
  itemAmountBadge: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  itemDescText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginLeft: SPACING[4],
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    marginTop: 2,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  itemMetaText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
  },
  manualToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  manualToolbarDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  addItemBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  itemGrid: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING[8],
    flexWrap: 'wrap',
  },
  miniLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 2,
  },
  inputSm: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    height: 34,
    borderWidth: 1,
    borderRadius: RADIUS.xs,
    paddingHorizontal: 8,
    fontSize: 12,
  },
  particularDropdownBtn: {
    height: 34,
    borderWidth: 1,
    borderRadius: RADIUS.xs,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  particularDropdownBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
    flex: 1,
    marginRight: 4,
  },
  particularDropdownPanel: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: RADIUS.xs,
    padding: SPACING[8],
  },
  particularSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.xs,
    paddingHorizontal: 8,
    height: 30,
    marginBottom: 6,
  },
  particularSearchInput: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    flex: 1,
    fontSize: 11,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  particularOptionsScroll: {
    maxHeight: 200,
  },
  particularCategoryGroup: {
    marginBottom: 8,
  },
  particularCategoryHeader: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  particularOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: RADIUS.xs,
    marginVertical: 1,
  },
  particularOptionName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
  },
  particularOptionSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    marginTop: 1,
  },
  alreadyAddedBadge: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  othersFieldContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  fieldHint: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    marginTop: 3,
  },
  amountBox: {
    height: 34,
    borderRadius: RADIUS.xs,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  amountText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  totalSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[12],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginTop: SPACING[4],
  },
  totalLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  totalSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: 2,
  },
  totalValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: SPACING[12],
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[12],
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[10],
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[10],
    borderRadius: RADIUS.sm,
  },
  submitBtnText: {
    color: COLORS.neutral.white,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
