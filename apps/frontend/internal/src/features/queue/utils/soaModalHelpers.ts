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

export const resolveInitialAddress = (app: ApplicationData): string => {
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

export const resolveInitialName = (app: ApplicationData): string => {
  if (app.soaIssuedToName && app.soaIssuedToName.trim().length > 0) {
    return app.soaIssuedToName.trim();
  }
  return app.applicant || app.companyDetails?.name || app.filingUser?.name || '';
};

export const resolveInitialType = (app: ApplicationData): IssuedToTypeDto => {
  if (app.soaIssuedToType === 'Company') return 'Company';
  if (app.soaIssuedToType === 'Individual') return 'Individual';
  return app.applicantType === 'Company' ? 'Company' : 'Individual';
};

export const mapCalculatedFeesToEditableItems = (
  items: FeeCalculationResultDto['lineItems'],
  prefix: string = 'calc'
): EditableLineItem[] => {
  return items.map((item, idx) => ({
    id: `${prefix}-${idx}-${Date.now()}`,
    particular: item.particular,
    itemCode: item.itemCode,
    description: item.description ?? undefined,
    validityYears: item.validityYears > 0 ? item.validityYears : 1,
    noOfUnits: item.noOfUnits > 0 ? item.noOfUnits : 1,
    feeRate: item.feeRate,
    amount: item.amount,
    isTax: item.isTax,
    isSurcharge: item.isSurcharge,
  }));
};

export const mapExistingSoaItemsToEditableItems = (
  soaItems: SoaItem[]
): EditableLineItem[] => {
  return soaItems.map((item: SoaItem, idx: number) => ({
    id: `existing-${idx}-${Date.now()}`,
    particular: item.particular,
    itemCode: item.code || 'FEE',
    validityYears: item.validityYears > 0 ? item.validityYears : 1,
    noOfUnits: item.noOfUnits > 0 ? item.noOfUnits : 1,
    feeRate: item.fees,
    amount: item.amount,
    isTax: item.code?.toUpperCase() === 'DST',
    isSurcharge: item.particular?.toLowerCase().includes('surcharge') || item.code?.toUpperCase() === 'SUR',
  }));
};

export const calculateLineItemAmount = (
  validityYears: number | string,
  noOfUnits: number | string,
  feeRate: number | string,
  itemCode?: string
): number => {
  const y = typeof validityYears === 'number' ? validityYears : Number(validityYears) || 1;
  const u = typeof noOfUnits === 'number' ? noOfUnits : Number(noOfUnits) || 1;
  const r = typeof feeRate === 'number' ? feeRate : Number(feeRate) || 0;
  const isDst = (itemCode || '').toUpperCase() === 'DST';
  return isDst ? r : y * u * r;
};
