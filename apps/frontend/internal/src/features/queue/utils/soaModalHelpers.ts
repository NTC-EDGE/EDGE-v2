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

export const resolveInitialAddress = (app?: ApplicationData | null): string => {
  if (!app) return '';
  if (app.soaIssuedToAddress && app.soaIssuedToAddress.trim().length > 0) {
    return app.soaIssuedToAddress.trim();
  }
  const parts = [
    app.address?.streetAddress || app.address?.address,
    app.address?.barangay,
    app.address?.city,
    app.address?.province,
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(', ');
  }
  return app.filingUser?.company?.address || '';
};

export const resolveInitialName = (app?: ApplicationData | null): string => {
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

    return {
      id: `existing-${idx}-${Date.now()}`,
      particular: safeParticular,
      itemCode: safeItemCode,
      validityYears: safeValidityYears,
      noOfUnits: safeNoOfUnits,
      feeRate: safeFeeRate,
      amount: safeAmount,
      isTax,
      isSurcharge,
    };
  });
};
