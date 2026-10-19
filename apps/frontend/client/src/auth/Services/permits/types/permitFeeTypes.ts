export interface PermitFeeLineItem {
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

export interface PermitFeeComputationResult {
  formulaApplied: string;
  subTotal: number;
  surchargeAmount: number;
  taxAmount: number;
  totalAmount: number;
  lineItems: PermitFeeLineItem[];
}

export interface PermitFeeComputationParams {
  activity?: string;
  applicationType?: string;
  element?: string;
  validityYears?: number;
  noOfUnits?: number;
  noOfCopies?: number;
  additionalServicesCount?: number;
  expirationDate?: string | Date | null;
  asOfDate?: string | Date | null;
}
