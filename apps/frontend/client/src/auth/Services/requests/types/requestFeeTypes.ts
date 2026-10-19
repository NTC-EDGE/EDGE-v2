/**
 * Strict TypeScript types for Requests and Complaints statutory fee calculations.
 * Pursuant to NTC Citizen's Charter (all consumer requests and complaints are free of charge).
 */

export interface RequestFeeLineItem {
  particular: string;
  itemCode: string;
  description: string;
  feeRate: number;
  amount: number;
  isTax?: boolean;
}

export interface RequestFeeCalculationResult {
  activity: string;
  applicationType: string;
  element?: string | null;
  formulaApplied: string;
  subTotal: number;
  surchargeAmount: number;
  taxAmount: number;
  totalAmount: number;
  lineItems: RequestFeeLineItem[];
  isFree: boolean;
}

export interface RequestFeeCalculationInput {
  serviceName?: string | null;
  serviceCategory?: string | null;
  applicationType?: string | null;
  variantName?: string | null;
  element?: string | null;
}
