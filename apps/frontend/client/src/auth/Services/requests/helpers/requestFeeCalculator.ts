import {
  RequestFeeCalculationInput,
  RequestFeeCalculationResult,
  RequestFeeLineItem,
} from "../types/requestFeeTypes";

/**
 * Calculates statutory fees for Requests and Complaints.
 * Pursuant to NTC Citizen's Charter, all consumer requests & complaints
 * (Blocking, Unblocking, Text Scam/Spam, Telco Complaints, Tape Preservation)
 * are completely free of charge (₱0.00).
 */
export function calculateRequestFee(input: RequestFeeCalculationInput): RequestFeeCalculationResult {
  const activity = (input.serviceName || input.serviceCategory || "Requests and Complaints").trim();
  const appType = (input.applicationType || input.variantName || "Standard").trim();
  const element = input.element ? input.element.trim() : null;

  const lineItems: RequestFeeLineItem[] = [
    {
      particular: "Statutory Fee (Free of Charge)",
      itemCode: "NO_FEE",
      description: "No Fees for Requests and Complaints pursuant to NTC Citizen's Charter",
      feeRate: 0.0,
      amount: 0.0,
      isTax: false,
    },
  ];

  return {
    activity,
    applicationType: appType,
    element,
    formulaApplied: "TOTAL = 0",
    subTotal: 0.0,
    surchargeAmount: 0.0,
    taxAmount: 0.0,
    totalAmount: 0.0,
    lineItems,
    isFree: true,
  };
}
