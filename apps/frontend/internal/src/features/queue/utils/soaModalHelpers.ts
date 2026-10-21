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

export const calculateLineItemAmount = (
  validityYears?: number | string | null,
  noOfUnits?: number | string | null,
  feeRate?: number | string | null,
  itemCode?: string | null
): number => {
  const y = typeof validityYears === 'number' && !isNaN(validityYears) ? validityYears : Number(validityYears) || 1;
  const u = typeof noOfUnits === 'number' && !isNaN(noOfUnits) ? noOfUnits : Number(noOfUnits) || 1;
  const r = typeof feeRate === 'number' && !isNaN(feeRate) ? feeRate : Number(feeRate) || 0;
  const isDst = (itemCode || '').trim().toUpperCase() === 'DST';
  return isDst ? r : y * u * r;
};

export const mapCalculatedFeesToEditableItems = (
  items?: FeeCalculationResultDto['lineItems'] | null,
  prefix: string = 'calc'
): EditableLineItem[] => {
  if (!items || !Array.isArray(items)) return [];

  return items.map((item, idx) => {
    const safeParticular = (item?.particular && typeof item.particular === 'string' && item.particular.trim().length > 0)
      ? item.particular.trim()
      : 'Statutory Fee';

    const safeItemCode = (item?.itemCode && typeof item.itemCode === 'string' && item.itemCode.trim().length > 0)
      ? item.itemCode.trim()
      : 'FEE';

    const safeValidityYears = (typeof item?.validityYears === 'number' && !isNaN(item.validityYears) && item.validityYears > 0)
      ? item.validityYears
      : 1;

    const safeNoOfUnits = (typeof item?.noOfUnits === 'number' && !isNaN(item.noOfUnits) && item.noOfUnits > 0)
      ? item.noOfUnits
      : 1;

    const safeFeeRate = (typeof item?.feeRate === 'number' && !isNaN(item.feeRate) && item.feeRate >= 0)
      ? item.feeRate
      : 0;

    const safeAmount = (typeof item?.amount === 'number' && !isNaN(item.amount) && item.amount >= 0)
      ? item.amount
      : calculateLineItemAmount(safeValidityYears, safeNoOfUnits, safeFeeRate, safeItemCode);

    return {
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
    };
  });
};

export const mapExistingSoaItemsToEditableItems = (
  soaItems?: SoaItem[] | null
): EditableLineItem[] => {
  if (!soaItems || !Array.isArray(soaItems)) return [];

  return soaItems.map((item: SoaItem, idx: number) => {
    const safeParticular = (item?.particular && typeof item.particular === 'string' && item.particular.trim().length > 0)
      ? item.particular.trim()
      : 'Statutory Fee';

    const safeItemCode = (item?.code && typeof item.code === 'string' && item.code.trim().length > 0)
      ? item.code.trim()
      : 'FEE';

    const safeValidityYears = (typeof item?.validityYears === 'number' && !isNaN(item.validityYears) && item.validityYears > 0)
      ? item.validityYears
      : 1;

    const safeNoOfUnits = (typeof item?.noOfUnits === 'number' && !isNaN(item.noOfUnits) && item.noOfUnits > 0)
      ? item.noOfUnits
      : 1;

    const safeFeeRate = (typeof item?.fees === 'number' && !isNaN(item.fees) && item.fees >= 0)
      ? item.fees
      : 0;

    const safeAmount = (typeof item?.amount === 'number' && !isNaN(item.amount) && item.amount >= 0)
      ? item.amount
      : calculateLineItemAmount(safeValidityYears, safeNoOfUnits, safeFeeRate, safeItemCode);

    const isTax = safeItemCode.toUpperCase() === 'DST';
    const isSurcharge = safeParticular.toLowerCase().includes('surcharge') || safeItemCode.toUpperCase() === 'SUR';
    const isOthers = safeParticular.toLowerCase().startsWith('others');
    const customDescription = isOthers && safeParticular.includes(':')
      ? safeParticular.split(':').slice(1).join(':').trim()
      : undefined;

    return {
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
    };
  });
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
