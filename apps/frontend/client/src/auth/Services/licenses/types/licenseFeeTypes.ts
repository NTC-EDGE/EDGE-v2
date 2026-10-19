/**
 * Strict TypeScript types for statutory License fee calculations.
 * Corresponds to NTC statutory fee schedules and backend LicenseFeeCalculationStrategy.
 */

export interface LicenseFeeLineItem {
  particular: string;
  itemCode: string;
  description: string;
  validityYears: number;
  noOfUnits: number;
  feeRate: number;
  amount: number;
  isSurcharge?: boolean;
  isTax?: boolean;
}

export interface LicenseFeeCalculationResult {
  activity: string;
  applicationType: string;
  element?: string | null;
  formulaApplied: string;
  subTotal: number;
  surchargeAmount: number;
  taxAmount: number;
  totalAmount: number;
  lineItems: LicenseFeeLineItem[];
}

export interface LicenseFeeCalculationInput {
  serviceName?: string | null;
  serviceCategory?: string | null;
  applicationType?: string | null;
  variantName?: string | null;
  element?: string | null;
  validityYears?: number | null;
  noOfUnits?: number | null;
  noOfCopies?: number | null;
  noOfChannels?: number | null;
  expirationDate?: string | Date | null;
  asOfDate?: string | Date | null;
  powerOutput?: string | number | null;
}
