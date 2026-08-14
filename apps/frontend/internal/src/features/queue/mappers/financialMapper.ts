import { OrderOfPaymentDto, StatementOfAccountDto } from '@edge/api';
import {
  ApplicantItem,
  AuditTrailEntry,
  PaymentDetails,
  SoaItem,
  StatementOfAccountItem,
} from '../../../types/application';

/**
 * Maps single SOA line item DTO.
 */
export function mapSoaLineItem(item: {
  id?: string;
  particular: string;
  itemCode: string;
  description?: string;
  validityYears: number;
  noOfUnits: number;
  feeRate: number;
  amount: number;
}, applicantId?: string, applicantName?: string): SoaItem {
  return {
    id: item.id,
    particular: item.particular,
    validityYears: item.validityYears,
    percentage: 0,
    noOfUnits: item.noOfUnits,
    fees: item.feeRate,
    amount: item.amount,
    code: item.itemCode,
    description: item.description,
    applicantId,
    applicantName,
  };
}

/**
 * Maps list of Statements of Account DTOs to UI models.
 */
export function mapStatementsOfAccount(
  statementsOfAccount: StatementOfAccountDto[] | undefined,
  applicants?: ApplicantItem[]
): StatementOfAccountItem[] {
  if (!statementsOfAccount || statementsOfAccount.length === 0) {
    return [];
  }

  return statementsOfAccount.map((s) => {
    const matchedApplicant = applicants?.find((a) => a.id === s.applicantId);
    const applicantName = matchedApplicant?.name ?? s.issuedToName;

    const lineItems: SoaItem[] = (s.lineItems ?? []).map((li) =>
      mapSoaLineItem(li, s.applicantId, applicantName)
    );

    const histories: AuditTrailEntry[] = (s.histories ?? []).map((h) => ({
      id: h.id,
      action: h.action,
      staff: h.staffName || 'Staff',
      timestamp: h.timestamp ? new Date(h.timestamp).toLocaleString() : '',
    }));

    const status: 'Pending' | 'Approved' | 'Returned' =
      s.status === 'Approved'
        ? 'Approved'
        : s.status === 'Returned'
        ? 'Returned'
        : 'Pending';

    const issuedToType: 'Individual' | 'Company' =
      s.issuedToType === 'Company' ? 'Company' : 'Individual';

    return {
      id: s.id,
      applicationId: s.applicationId,
      applicantId: s.applicantId,
      applicantName,
      soaNumber: s.soaNumber,
      status,
      issuedToType,
      issuedToName: s.issuedToName,
      issuedToAddress: s.issuedToAddress,
      totalAmount: s.totalAmount,
      dueDate: s.dueDate ? s.dueDate.split('T')[0] : '',
      preparedByUserId: s.preparedByUserId,
      approvedByUserId: s.approvedByUserId,
      approvedAt: s.approvedAt,
      remarks: s.remarks,
      lineItems,
      histories,
    };
  });
}

/**
 * Dynamically computes a Consolidated Statement of Account from all applicant SOAs.
 */
export function computeConsolidatedSoa(
  soas: StatementOfAccountItem[],
  applicationNumber: string,
  filingEntityName?: string
): StatementOfAccountItem {
  const allLineItems = soas.flatMap((s) => s.lineItems);
  const totalAmount = soas.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const primaryDueDate = soas.find((s) => Boolean(s.dueDate))?.dueDate ?? '';

  const allApproved = soas.length > 0 && soas.every((s) => s.status === 'Approved');
  const anyReturned = soas.some((s) => s.status === 'Returned');
  const consolidatedStatus: 'Pending' | 'Approved' | 'Returned' = allApproved
    ? 'Approved'
    : anyReturned
    ? 'Returned'
    : 'Pending';

  const combinedHistories = soas.flatMap((s) => s.histories);

  return {
    id: 'consolidated',
    applicationId: soas[0]?.applicationId ?? '',
    soaNumber: `CONSOLIDATED-${applicationNumber || 'SOA'}`,
    status: consolidatedStatus,
    issuedToType: 'Company',
    issuedToName: filingEntityName || soas[0]?.issuedToName || 'Consolidated Account',
    issuedToAddress: soas[0]?.issuedToAddress,
    totalAmount,
    dueDate: primaryDueDate,
    lineItems: allLineItems,
    histories: combinedHistories,
  };
}

/**
 * Maps Statements of Account line items (all line items aggregated across SOAs).
 */
export function mapSoaItems(
  statementsOfAccount: StatementOfAccountDto[] | undefined
): SoaItem[] {
  if (!statementsOfAccount || statementsOfAccount.length === 0) {
    return [];
  }

  return statementsOfAccount.flatMap((s) =>
    (s.lineItems ?? []).map((item) =>
      mapSoaLineItem(item, s.applicantId, s.issuedToName)
    )
  );
}

/**
 * Resolves total amount due across all Statements of Account.
 */
export function mapTotalAmountDue(
  statementsOfAccount: StatementOfAccountDto[] | undefined
): number {
  if (!statementsOfAccount || statementsOfAccount.length === 0) {
    return 0;
  }
  return statementsOfAccount.reduce((acc, curr) => acc + (curr.totalAmount ?? 0), 0);
}

/**
 * Resolves due date from Statements of Account.
 */
export function mapDueDate(
  statementsOfAccount: StatementOfAccountDto[] | undefined
): string {
  const rawDate = statementsOfAccount?.[0]?.dueDate;
  return rawDate ? rawDate.split('T')[0] : '';
}

/**
 * Maps Orders of Payment to frontend payment details.
 */
export function mapPaymentDetails(
  ordersOfPayment: OrderOfPaymentDto[] | undefined
): PaymentDetails {
  const primaryPayment = ordersOfPayment?.[0];
  const method = primaryPayment?.paymentMethod === 'Check' ? 'check' : 'cash';

  return {
    amountReceived: primaryPayment?.amountReceived ?? 0,
    method,
    orNumber: primaryPayment?.officialReceiptNumber ?? '',
    checkNumber: primaryPayment?.checkNumber ?? '',
    checkName: primaryPayment?.checkName ?? '',
  };
}
