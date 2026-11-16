import { IssuedToTypeDto, FeeCalculationResultDto } from '@edge/api';
import { ApplicationData, SoaItem } from '../../../types/application';

export interface EditableLineItem {
  id: string;
  particular: string;
  itemCode: string;
  description?: string;
  validityYears: number;
  noOfUnits: number;
  feeRate: number;
  amount: number;
  isTax?: boolean;
  isSurcharge?: boolean;
}

export const normalizeYmd = (dateStr?: string | null): string => {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const trimmed = dateStr.trim();
  if (!trimmed) return '';
  if (trimmed.includes('T')) return trimmed.split('T')[0] ?? '';
  if (trimmed.includes(' ')) return trimmed.split(' ')[0] ?? '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    try {
      return d.toISOString().split('T')[0] ?? '';
    } catch {
      return trimmed.substring(0, 10);
    }
  }
  return trimmed.substring(0, 10);
};

export const resolveInitialAddress = (app?: Partial<ApplicationData> | null): string => {
  if (!app) return '';
  if (app.soaIssuedToAddress && app.soaIssuedToAddress.trim().length > 0) {
    return app.soaIssuedToAddress.trim();
  }
  const parts = [
    app.address?.streetAddress || app.address?.address,
    app.address?.barangay,
    app.address?.city,
    app.address?.province,
    app.address?.region,
    app.address?.zipCode,
  ].filter((p): p is string => typeof p === 'string' && p.trim().length > 0);

  if (parts.length > 0) {
    return parts.join(', ');
  }
  return app.filingUser?.company?.address || '';
};

export const resolveInitialName = (app?: Partial<ApplicationData> | null): string => {
  if (!app) return '';
  if (app.soaIssuedToName && app.soaIssuedToName.trim().length > 0) {
    return app.soaIssuedToName.trim();
  }
  return app.applicant || app.companyDetails?.name || app.filingUser?.name || '';
};

export const resolveInitialType = (app?: ApplicationData | null): IssuedToTypeDto => {
  if (!app) return 'Individual';
  if (app.soaIssuedToType === 'Company') return 'Company';
  if (app.soaIssuedToType === 'Individual') return 'Individual';
  return app.applicantType === 'Company' ? 'Company' : 'Individual';
};

const NON_YEAR_CANONICAL_CODES = new Set([
  'DST',
  'SUR',
  'FF',
  'AF',
  'SEM',
]);

export const doesFeeCodeUseYears = (
  itemCode?: string | null,
  particular?: string | null,
  formula?: string | null,
  formExplicitlyAsksForYears: boolean = false
): boolean => {
  const canonical = normalizeCanonicalFeeCode(itemCode, particular);
  if (NON_YEAR_CANONICAL_CODES.has(canonical)) {
    return false;
  }
  if (formula && formula.trim().length > 0) {
    const upperFormula = formula.toUpperCase();
    if (!upperFormula.includes('YR') && !upperFormula.includes('YEARS') && !formExplicitlyAsksForYears) {
      return false;
    }
  }
  return true;
};

export const doesApplicationAskForYears = (
  app?: ApplicationData | null,
  calculatedFees?: FeeCalculationResultDto | null
): boolean => {
  if (!app) return false;

  const isYearsFieldLabel = (label?: string | null, fieldId?: string | null): boolean => {
    if (fieldId === 'fd000000-0000-0000-0000-000000000201') return true;
    if (!label) return false;
    const lower = label.trim().toLowerCase();
    if (
      lower.includes('graduat') ||
      lower.includes('birth') ||
      lower.includes('experience') ||
      lower.includes('age') ||
      lower.includes('school')
    ) {
      return false;
    }
    return (
      lower === 'no. of years' ||
      lower === 'no of years' ||
      lower === 'no.of years' ||
      lower === 'number of years' ||
      lower === 'no. of yrs' ||
      lower === 'no of yrs' ||
      lower === 'no. of yr' ||
      lower === 'no of yr' ||
      lower === 'validity years' ||
      lower === 'validity (years)' ||
      lower === 'years of validity' ||
      lower === 'years applied' ||
      lower === 'applied years' ||
      lower === 'years' ||
      lower.includes('number of years') ||
      lower.includes('no. of years') ||
      lower.includes('no of years') ||
      lower.includes('no.of years') ||
      lower.includes('no. of yrs') ||
      lower.includes('no of yrs') ||
      lower.includes('validity years') ||
      lower.includes('years applied')
    );
  };

  const hasYearsInAppFields = Boolean(
    app.formFieldValues?.some((fv) => isYearsFieldLabel(fv.fieldLabel, fv.fieldId)) ||
    app.applicantsList?.some((a) =>
      a.formFieldValues?.some((fv) => isYearsFieldLabel(fv.fieldLabel, fv.fieldId))
    )
  );

  if (hasYearsInAppFields) {
    return true;
  }

  if (calculatedFees?.lineItems && calculatedFees.lineItems.length > 0) {
    return calculatedFees.lineItems.some((li) => (li.validityYears ?? 0) > 0);
  }

  return false;
};

export const calculateLineItemAmount = (
  validityYears?: number | string | null,
  noOfUnits?: number | string | null,
  feeRate?: number | string | null,
  itemCode?: string | null,
  particular?: string | null
): number => {
  const rawY = typeof validityYears === 'number' && !isNaN(validityYears) ? validityYears : Number(validityYears) || 0;
  const usesYears = rawY > 0 && doesFeeCodeUseYears(itemCode, particular, null, true);
  const y = usesYears ? rawY : 1;
  const u = typeof noOfUnits === 'number' && !isNaN(noOfUnits) ? noOfUnits : Number(noOfUnits) || 1;
  const r = typeof feeRate === 'number' && !isNaN(feeRate) ? feeRate : Number(feeRate) || 0;
  const isDst = normalizeCanonicalFeeCode(itemCode, particular) === 'DST';
  return isDst ? r : y * u * r;
};

export const normalizeCanonicalFeeCode = (rawCode?: string | null, rawParticular?: string | null): string => {
  const code = (rawCode || '').trim().toUpperCase();
  switch (code) {
    case 'FF':
    case 'FILING_FEE':
    case 'BULK_FILING_FEE':
    case 'FILING':
      return 'FF';
    case 'AF':
    case 'APP_FEE':
    case 'APPLICATION_FEE':
      return 'AF';
    case 'IF':
    case 'INSP_FEE':
    case 'INSPECTION_FEE':
      return 'IF';
    case 'LF':
    case 'LIC':
    case 'LIC_RIGHTS_FEE':
    case 'LICENSE_FEE':
      return 'LF';
    case 'PF':
    case 'PERMIT':
    case 'PERMIT_ISSUE_FEE':
    case 'PERMIT_FEE':
      return 'PF';
    case 'POS':
    case 'POSS_PERMIT':
    case 'POSSESS_PERMIT':
    case 'POSSESS_FEE':
      return 'POS';
    case 'PUR':
    case 'PURCHASE_PERMIT':
    case 'PURCHASE_FEE':
      return 'PUR';
    case 'STF':
    case 'SELL_TRANSFER':
    case 'SELL_TRANSFER_FEE':
      return 'STF';
    case 'EXAM':
    case 'EXAM_REG_FEE':
    case 'EXAM_FEE':
    case 'EXAMFEE':
      return 'EXAM';
    case 'SUR':
    case 'SURCHARGE':
    case 'SURCHARGE_LATE_FEE':
      return 'SUR';
    case 'DST':
    case 'DOC_STAMP_TAX':
    case 'DST_FEE':
      return 'DST';
    case 'MOD':
    case 'MOD_FEE':
    case 'MODIFICATION_FEE':
      return 'MOD';
    case 'ROC':
    case 'ROC_FEE':
      return 'ROC';
    case 'SEM':
    case 'SEMINAR_FEE':
      return 'SEM';
    case 'REG':
    case 'REG_FEE':
    case 'REGISTRATION_FEE':
      return 'REG';
    case 'DUP':
    case 'DUP_FEE':
    case 'DUPLICATE_FEE':
      return 'DUP';
    case 'CPF':
    case 'CONST_PERMIT_FEE':
    case 'CPF_FEE':
      return 'CPF';
    case 'SUF':
    case 'SPECTRUM_FEE':
    case 'SUF_FEE':
      return 'SUF';
    case 'PTR':
    case 'TRANSPORT_FEE':
      return 'PTR';
    case 'DEMO':
    case 'DEMO_FEE':
      return 'DEMO';
    case 'SP':
    case 'SPECIAL_PERMIT':
    case 'SPECIAL_PERMIT_FEE':
      return 'SP';
    case 'ACCRED':
    case 'ACCREDITATION_FEE':
      return 'ACCRED';
    case 'REQ_FEE':
    case 'REQUEST_FEE':
      return 'REQ_FEE';
  }

  const part = (rawParticular || '').trim().toLowerCase();
  if (part.includes('examination fee') || part.includes('exam fee')) return 'EXAM';
  if (part === 'filing fee' || part === 'filling fee' || part.includes('filing & application processing') || part.includes('filing & processing')) return 'FF';
  if (part === 'application fee') return 'AF';
  if (part === 'inspection fee' || part.includes('technical site inspection')) return 'IF';
  if (part === 'license fee' || part === 'radio station license' || part.includes('spectrum & license rights')) return 'LF';
  if (part === 'permit fee' || part.includes('permit & certificate issuance')) return 'PF';
  if (part === 'possess permit fee' || part === 'permit to possess/storage') return 'POS';
  if (part === 'purchase permit fee' || part === 'permit to purchase') return 'PUR';
  if (part === 'sell/transfer permit fee') return 'STF';
  if (part.includes('documentary stamp tax')) return 'DST';
  if (part === 'modification fee') return 'MOD';
  if (part.includes('radio operator certificate') || part.includes('radio operator\'s cert')) return 'ROC';
  if (part === 'seminar fee') return 'SEM';
  if (part === 'registration fee') return 'REG';
  if (part === 'duplicate copy fee') return 'DUP';
  if (part === 'construction permit fee') return 'CPF';
  if (part.includes('spectrum user')) return 'SUF';
  if (part.includes('surcharge') || part.includes('fines/penalties')) return 'SUR';

  return code || 'FEE';
};

export const resolveDedupFeeKey = (code: string, particular: string): string => {
  const lowerPart = particular.trim().toLowerCase();
  if (lowerPart.startsWith('others')) {
    return `OTHERS::${lowerPart}`;
  }
  const canonical = normalizeCanonicalFeeCode(code, particular);
  if (canonical !== 'FEE' && !canonical.includes('-')) {
    return canonical;
  }
  return `${canonical}::${lowerPart}`;
};

export const mapCalculatedFeesToEditableItems = (
  items?: FeeCalculationResultDto['lineItems'] | null,
  prefix: string = 'calc'
): EditableLineItem[] => {
  if (!items || !Array.isArray(items)) return [];

  const seenKeys = new Set<string>();
  const result: EditableLineItem[] = [];

  items.forEach((item, idx) => {
    const safeParticular = (item?.particular && typeof item.particular === 'string' && item.particular.trim().length > 0)
      ? item.particular.trim()
      : 'Statutory Fee';

    const rawItemCode = (item?.itemCode && typeof item.itemCode === 'string' && item.itemCode.trim().length > 0)
      ? item.itemCode.trim()
      : 'FEE';
    const canonicalCode = normalizeCanonicalFeeCode(rawItemCode, safeParticular);
    const safeItemCode = !rawItemCode.includes('-') && canonicalCode !== 'FEE' ? canonicalCode : rawItemCode;

    const dedupKey = resolveDedupFeeKey(safeItemCode, safeParticular);
    if (seenKeys.has(dedupKey)) {
      return;
    }
    seenKeys.add(dedupKey);

    const hasBackendYears = typeof item?.validityYears === 'number' && !isNaN(item.validityYears) && item.validityYears > 0;
    const usesYears = doesFeeCodeUseYears(safeItemCode, safeParticular, null, hasBackendYears);
    const safeValidityYears = usesYears && hasBackendYears ? item.validityYears : 0;

    const safeNoOfUnits = (typeof item?.noOfUnits === 'number' && !isNaN(item.noOfUnits) && item.noOfUnits > 0)
      ? item.noOfUnits
      : 1;

    const safeFeeRate = (typeof item?.feeRate === 'number' && !isNaN(item.feeRate) && item.feeRate >= 0)
      ? item.feeRate
      : 0;

    const safeAmount = (typeof item?.amount === 'number' && !isNaN(item.amount) && item.amount >= 0)
      ? item.amount
      : calculateLineItemAmount(safeValidityYears, safeNoOfUnits, safeFeeRate, safeItemCode, safeParticular);

    result.push({
      id: `${prefix}-${idx}-${Date.now()}`,
      particular: safeParticular,
      itemCode: safeItemCode,
      description: item?.description ? String(item.description) : undefined,
      validityYears: safeValidityYears,
      noOfUnits: safeNoOfUnits,
      feeRate: safeFeeRate,
      amount: safeAmount,
      isTax: Boolean(item?.isTax),
      isSurcharge: Boolean(item?.isSurcharge),
    });
  });

  return result;
};

export const mapExistingSoaItemsToEditableItems = (
  soaItems?: SoaItem[] | null
): EditableLineItem[] => {
  if (!soaItems || !Array.isArray(soaItems)) return [];

  const seenKeys = new Set<string>();
  const result: EditableLineItem[] = [];

  soaItems.forEach((item: SoaItem, idx: number) => {
    const safeParticular = (item?.particular && typeof item.particular === 'string' && item.particular.trim().length > 0)
      ? item.particular.trim()
      : 'Statutory Fee';

    const rawItemCode = (item?.code && typeof item.code === 'string' && item.code.trim().length > 0)
      ? item.code.trim()
      : 'FEE';
    const canonicalCode = normalizeCanonicalFeeCode(rawItemCode, safeParticular);
    const safeItemCode = !rawItemCode.includes('-') && canonicalCode !== 'FEE' ? canonicalCode : rawItemCode;

    const dedupKey = resolveDedupFeeKey(safeItemCode, safeParticular);
    if (seenKeys.has(dedupKey)) {
      return;
    }
    seenKeys.add(dedupKey);

    const hasBackendYears = typeof item?.validityYears === 'number' && !isNaN(item.validityYears) && item.validityYears > 0;
    const usesYears = doesFeeCodeUseYears(safeItemCode, safeParticular, null, hasBackendYears);
    const safeValidityYears = usesYears && hasBackendYears ? item.validityYears : 0;

    const safeNoOfUnits = (typeof item?.noOfUnits === 'number' && !isNaN(item.noOfUnits) && item.noOfUnits > 0)
      ? item.noOfUnits
      : 1;

    const safeFeeRate = (typeof item?.fees === 'number' && !isNaN(item.fees) && item.fees >= 0)
      ? item.fees
      : 0;

    const safeAmount = (typeof item?.amount === 'number' && !isNaN(item.amount) && item.amount >= 0)
      ? item.amount
      : calculateLineItemAmount(safeValidityYears, safeNoOfUnits, safeFeeRate, safeItemCode, safeParticular);

    const isTax = safeItemCode.toUpperCase() === 'DST';
    const isSurcharge = safeParticular.toLowerCase().includes('surcharge') || safeItemCode.toUpperCase() === 'SUR';
    const isOthers = safeParticular.toLowerCase().startsWith('others');
    const customDescription = isOthers && safeParticular.includes(':')
      ? safeParticular.split(':').slice(1).join(':').trim()
      : undefined;

    result.push({
      id: `existing-${idx}-${Date.now()}`,
      particular: safeParticular,
      itemCode: safeItemCode,
      description: customDescription,
      validityYears: safeValidityYears,
      noOfUnits: safeNoOfUnits,
      feeRate: safeFeeRate,
      amount: safeAmount,
      isTax,
      isSurcharge,
    });
  });

  return result;
};

export type SoaParticularCategory =
  | 'FOR LICENSES'
  | 'FOR PERMITS'
  | 'FOR AMATEUR AND ROC'
  | 'OTHER APPLICATION';

export interface SoaStandardParticular {
  particular: string;
  category: SoaParticularCategory;
  defaultCode: string;
  displayName?: string;
  isOthers?: boolean;
}

export const SOA_STANDARD_PARTICULARS: SoaStandardParticular[] = [
  // 1. FOR LICENSES
  { particular: 'Permit to Purchase', category: 'FOR LICENSES', defaultCode: '4-02-01-010' },
  { particular: 'Filling Fee', category: 'FOR LICENSES', defaultCode: '4-02-01-130', displayName: 'Filling Fee (Licenses)' },
  { particular: 'Permit to Possess/Storage', category: 'FOR LICENSES', defaultCode: '4-02-01-010' },
  { particular: 'Construction Permit Fee', category: 'FOR LICENSES', defaultCode: '4-02-01-010' },
  { particular: 'Radio Station License', category: 'FOR LICENSES', defaultCode: '4-02-01-060', displayName: 'Radio Station License (Licenses)' },
  { particular: 'Inspection Fee', category: 'FOR LICENSES', defaultCode: '4-02-01-100', displayName: 'Inspection Fee (Licenses)' },
  { particular: 'Spectrum User\'s Fee (SUF)', category: 'FOR LICENSES', defaultCode: '4-02-01-080' },
  { particular: 'Fines/Penalties/Surcharges (Licenses)', category: 'FOR LICENSES', defaultCode: '4-02-01-140' },

  // 2. FOR PERMITS
  { particular: 'Permit Fees (Dealers/Reseller/Service Center/Sell/ Transfer/REC/Import)', category: 'FOR PERMITS', defaultCode: '4-02-01-010' },
  { particular: 'Inspection Fee (Permits)', category: 'FOR PERMITS', defaultCode: '4-02-01-100' },
  { particular: 'Filling Fee (Permits)', category: 'FOR PERMITS', defaultCode: '4-02-01-130' },
  { particular: 'Fines/Penalties/Surcharges (Permits)', category: 'FOR PERMITS', defaultCode: '4-02-01-140' },

  // 3. FOR AMATEUR AND ROC
  { particular: 'Radio Station License (Amateur/ROC)', category: 'FOR AMATEUR AND ROC', defaultCode: '4-02-01-060' },
  { particular: 'Radio Operator\'s Cert.', category: 'FOR AMATEUR AND ROC', defaultCode: '4-02-01-060' },
  { particular: 'Application Fee/Filing Fee', category: 'FOR AMATEUR AND ROC', defaultCode: '4-02-01-130' },
  { particular: 'Seminar Fee', category: 'FOR AMATEUR AND ROC', defaultCode: '4-02-02-040' },
  { particular: 'Fines/Penalties/Surcharges (Amateur/ROC)', category: 'FOR AMATEUR AND ROC', defaultCode: '4-02-01-140' },

  // 4. OTHER APPLICATION
  { particular: 'Registration Fee', category: 'OTHER APPLICATION', defaultCode: '4-02-01-020' },
  { particular: 'Supervision & Regulation Fee', category: 'OTHER APPLICATION', defaultCode: '4-02-01-070' },
  { particular: 'Verification Fee & Authentication Fees', category: 'OTHER APPLICATION', defaultCode: '4-02-01-040' },
  { particular: 'Examination Fee', category: 'OTHER APPLICATION', defaultCode: '4-02-01-030' },
  { particular: 'Clearance/Certification Fee', category: 'OTHER APPLICATION', defaultCode: '4-02-01-040' },
  { particular: 'Modification Fee', category: 'OTHER APPLICATION', defaultCode: '4-02-01-060' },
  { particular: 'Miscellaneous Income', category: 'OTHER APPLICATION', defaultCode: '4-02-01-990' },
  { particular: 'Documentary Stamp Tax (DST)', category: 'OTHER APPLICATION', defaultCode: '4-01-04-010' },
  { particular: 'Others', category: 'OTHER APPLICATION', defaultCode: '4-02-01-990', isOthers: true },
];

export const normalizeParticularKey = (particular?: string | null): string => {
  if (!particular || typeof particular !== 'string') return '';
  const trimmed = particular.trim().toLowerCase();
  if (trimmed.startsWith('others')) {
    return 'others';
  }
  return trimmed
    .replace(/\s*\(licenses\)/i, '')
    .replace(/\s*\(permits\)/i, '')
    .replace(/\s*\(amateur\/roc\)/i, '')
    .replace(/\s*\(amateur\)/i, '')
    .trim();
};

export const isDuplicateParticular = (
  particularToTest: string,
  existingItems: { particular: string; id?: string }[],
  ignoreId?: string
): boolean => {
  const normTest = normalizeParticularKey(particularToTest);
  if (!normTest) return false;
  return existingItems.some((item) => {
    if (ignoreId && item.id === ignoreId) return false;
    return normalizeParticularKey(item.particular) === normTest;
  });
};

export const getAvailableStandardParticular = (
  existingItems: { particular: string; id?: string }[]
): SoaStandardParticular | null => {
  for (const option of SOA_STANDARD_PARTICULARS) {
    if (!isDuplicateParticular(option.particular, existingItems)) {
      return option;
    }
  }
  return null;
};
