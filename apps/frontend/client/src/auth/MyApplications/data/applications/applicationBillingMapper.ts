import {
  ApplicationHistoryEntry,
  ApplicationStatus,
  OpData,
  SoaData,
  SoaLineItem,
} from './applicationBaseTypes';
import { ApiSoaDto } from './applicationApiItemTypes';
import { ApiApplicationDto } from './applicationApiTypes';
import {
  buildFallbackSoaItems,
  buildOpDataFromDto,
  buildSoaDataFromDto,
} from './applicationHistorySoaHelpers';

export interface MappedApplicationBilling {
  status: ApplicationStatus;
  primarySoaDto?: ApiSoaDto;
  mappedSoa?: SoaData;
  mappedOp?: OpData;
  mappedSoaItems: SoaLineItem[];
  calculatedTotalDue?: number;
  resolvedDueDate?: string;
  resolvedSoaNumber: string | null;
  resolvedOpNumber: string | null;
  resolvedOrNumber?: string;
  resolvedAmountPaid?: number;
  resolvedPaidAt?: string;
}

export function mapApplicationBilling(
  dto: ApiApplicationDto,
  initialStatus: ApplicationStatus,
  refNumber: string,
  serviceName: string,
  serviceCategory: string,
  isBulk: boolean,
  applicantCount: number,
  mappedHistories: ApplicationHistoryEntry[]
): MappedApplicationBilling {
  let status = initialStatus;
  const rawSoas = dto.statementsOfAccount || dto.StatementsOfAccount || [];
  const rawOps = (dto.ordersOfPayment || dto.OrdersOfPayment || []).filter(
    (o) => (o.status || '').toLowerCase() !== 'returned'
  );

  const sortedSoas = [...rawSoas].sort((a, b) => {
    const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0;
    const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  const getOpPriority = (st?: string): number => {
    const lower = (st || '').toLowerCase();
    if (lower === 'billed' || lower === 'active') return 0;
    if (lower === 'processing') return 1;
    if (lower === 'paid') return 2;
    return 3;
  };

  const sortedOps = [...rawOps].sort((a, b) => {
    const prioDiff = getOpPriority(a.status) - getOpPriority(b.status);
    if (prioDiff !== 0) return prioDiff;
    const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0;
    const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0;
    return timeA - timeB;
  });

  const primaryOpDto = sortedOps.length > 0 ? sortedOps[0] : undefined;
  const primarySoaDto =
    (primaryOpDto?.statementOfAccountId
      ? sortedSoas.find((s) => s.id === primaryOpDto.statementOfAccountId)
      : undefined) ?? (sortedSoas.length > 0 ? sortedSoas[0] : undefined);

  const hasUnpaidOpsInList = sortedOps.some((o) => {
    const st = (o.status || '').toLowerCase();
    return st === 'billed' || st === 'active' || st === 'processing';
  });
  const rawOpStatusLower = (dto.opStatus || dto.OpStatus || '').toLowerCase();
  const hasUnpaidSummaryOp =
    rawOpStatusLower === 'billed' || rawOpStatusLower === 'active' || rawOpStatusLower === 'processing';
  const hasAnyUnpaidOp = sortedOps.length > 0 ? hasUnpaidOpsInList : hasUnpaidSummaryOp;

  if (hasAnyUnpaidOp && status === 'FOR_APPROVAL') {
    status = 'READY_FOR_PAYMENT';
  }

  const resolvedOrNumber = hasAnyUnpaidOp
    ? undefined
    : dto.officialReceiptNumber || dto.OfficialReceiptNumber || primaryOpDto?.officialReceiptNumber || undefined;
  const hasOr = Boolean(resolvedOrNumber && resolvedOrNumber.trim().length > 0);

  const opStatusLower = (primaryOpDto?.status || dto.opStatus || dto.OpStatus || '').toLowerCase();
  const isOpBilled = opStatusLower === 'billed' || opStatusLower === 'active';
  const isOpReturned = opStatusLower === 'returned';
  const dtoRemarks = typeof dto.remarks === 'string' ? dto.remarks.toLowerCase() : '';
  const dtoPaymentRemarks = typeof dto.paymentRemarks === 'string' ? dto.paymentRemarks.toLowerCase() : '';

  const hasPaymentMsg = (txt: string): boolean =>
    txt.includes('payment submitted') ||
    txt.includes('waiting for cashier verification') ||
    txt.includes('awaiting cashier verification') ||
    txt.includes('verification in progress');

  const isPaymentSubmitted =
    !hasOr &&
    !isOpBilled &&
    !isOpReturned &&
    (opStatusLower === 'processing' ||
      opStatusLower === 'paid' ||
      hasPaymentMsg(dtoRemarks) ||
      hasPaymentMsg(dtoPaymentRemarks) ||
      mappedHistories.some((h) => {
        const act = (h.action || '').toLowerCase();
        const rem = (h.remarks || '').toLowerCase();
        return (
          act.includes('awaiting cashier verification') ||
          act.includes('submitted payment') ||
          act.includes('payment submitted') ||
          rem.includes('awaiting cashier verification') ||
          rem.includes('payment submitted')
        );
      }));

  if (isPaymentSubmitted) {
    status = 'PAYMENT_SUBMITTED';
  }

  const resolvedAmountPaid =
    typeof dto.amountPaid === 'number'
      ? dto.amountPaid
      : typeof dto.AmountPaid === 'number'
        ? dto.AmountPaid
        : typeof primaryOpDto?.amountReceived === 'number'
          ? primaryOpDto.amountReceived
          : undefined;
  const resolvedPaidAt = dto.paidAt || dto.PaidAt || primaryOpDto?.paidAt || undefined;

  const mappedSoa = buildSoaDataFromDto(primarySoaDto, dto.soaNumber);
  const mappedOp = buildOpDataFromDto({
    dto,
    primaryOpDto,
    status,
    refNumber,
    isPaymentSubmitted,
    hasAnyUnpaidOp,
    resolvedOrNumber,
    resolvedAmountPaid,
    resolvedPaidAt,
  });

  let mappedSoaItems: SoaLineItem[] = mappedSoa?.lineItems || [];
  if (mappedSoaItems.length === 0 && (status === 'READY_FOR_PAYMENT' || status === 'PAYMENT_SUBMITTED' || dto.soaNumber)) {
    mappedSoaItems = buildFallbackSoaItems(serviceName, serviceCategory, isBulk, applicantCount);
  }

  const svcLower = (serviceName || '').toLowerCase();
  const catLower = (serviceCategory || '').toLowerCase();
  const isExam = catLower.includes('exam') || svcLower.includes('exam') || svcLower.includes('admission');

  const calculatedTotalDue =
    mappedSoa && typeof mappedSoa.totalAmount === 'number' && mappedSoa.totalAmount > 0
      ? mappedSoa.totalAmount
      : mappedOp && typeof mappedOp.amountDue === 'number' && mappedOp.amountDue > 0
        ? mappedOp.amountDue
        : mappedSoaItems.length > 0
          ? mappedSoaItems.reduce((acc, item) => acc + (typeof item.amount === 'number' ? item.amount : 0), 0)
          : status === 'READY_FOR_PAYMENT' || status === 'PAYMENT_SUBMITTED' || dto.soaNumber
            ? isExam
              ? 50
              : 1380
            : undefined;

  return {
    status,
    primarySoaDto,
    mappedSoa,
    mappedOp,
    mappedSoaItems,
    calculatedTotalDue,
    resolvedDueDate: mappedSoa?.dueDate,
    resolvedSoaNumber:
      mappedSoa?.soaNumber ||
      dto.soaNumber ||
      (status === 'READY_FOR_PAYMENT' || status === 'PAYMENT_SUBMITTED' ? `SOA-${refNumber}` : null),
    resolvedOpNumber:
      mappedOp?.opNumber || (status === 'READY_FOR_PAYMENT' || status === 'PAYMENT_SUBMITTED' ? `OP-${refNumber}` : null),
    resolvedOrNumber,
    resolvedAmountPaid,
    resolvedPaidAt,
  };
}
