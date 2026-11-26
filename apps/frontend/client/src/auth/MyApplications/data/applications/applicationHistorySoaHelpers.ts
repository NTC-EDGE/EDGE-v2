import { ApplicationHistoryEntry, ApplicationStatus, OpData, SoaData, SoaLineItem } from './applicationBaseTypes';
import { ApiApplicantDto, ApiOpDto, ApiSoaDto } from './applicationApiItemTypes';
import { ApiApplicationDto } from './applicationApiTypes';

export function mapApplicationHistories(
  dto: ApiApplicationDto,
  firstApplicant?: ApiApplicantDto
): ApplicationHistoryEntry[] {
  const rawHistories = dto.histories || dto.Histories || [];
  const mappedHistories: ApplicationHistoryEntry[] = rawHistories.map((h, hIdx) => ({
    id: h.id || `hist-${hIdx}`,
    action: h.action || (h.toStatus ? `Status: ${h.toStatus}` : 'Application Event'),
    fromStatus: h.fromStatus,
    toStatus: h.toStatus || 'Submitted',
    staffName: h.staffName || 'Authorized Officer',
    staffRole: h.staffRole || 'Processing Officer',
    remarks: h.remarks,
    timestamp: h.timestamp || '',
  }));

  const hasSubmission = mappedHistories.some(
    (h) => h.action.toLowerCase().includes('submitted') || h.action.toLowerCase().includes('application received')
  );
  if (!hasSubmission) {
    const submissionDate =
      dto.submittedAt ||
      dto.createdAt ||
      (mappedHistories.length > 0 ? mappedHistories[0].timestamp : '') ||
      new Date().toISOString();
    const submitterName = dto.filingUser?.name || dto.applicantName || firstApplicant?.name || 'Applicant';

    mappedHistories.unshift({
      id: `init-${dto.id || 'app'}`,
      action: 'Application Submitted',
      fromStatus: undefined,
      toStatus: 'Submitted',
      staffName: submitterName,
      staffRole: 'Applicant',
      remarks: 'Application submitted through the portal.',
      timestamp: submissionDate,
    });
  }

  return mappedHistories;
}

export function buildSoaDataFromDto(
  primarySoaDto: ApiSoaDto | undefined,
  fallbackSoaNo?: string | null
): SoaData | undefined {
  if (!primarySoaDto) return undefined;
  return {
    id: primarySoaDto.id,
    soaNumber: primarySoaDto.soaNumber || (fallbackSoaNo ?? ''),
    status: primarySoaDto.status || 'Active',
    issuedToType: primarySoaDto.issuedToType,
    issuedToName: primarySoaDto.issuedToName,
    issuedToAddress: primarySoaDto.issuedToAddress,
    totalAmount: typeof primarySoaDto.totalAmount === 'number' ? primarySoaDto.totalAmount : 0,
    dueDate: primarySoaDto.dueDate,
    remarks: primarySoaDto.remarks,
    preparedByName: primarySoaDto.preparedByName,
    preparedByTitle: primarySoaDto.preparedByTitle,
    approvedByName: primarySoaDto.approvedByName,
    approvedByTitle: primarySoaDto.approvedByTitle,
    lineItems: (primarySoaDto.lineItems || []).map((li) => ({
      id: li.id,
      particular: li.particular || 'Regulatory Fee Assessment',
      itemCode: li.itemCode || 'NTC-FEE',
      description: li.description,
      validityYears: typeof li.validityYears === 'number' && li.validityYears > 0 ? li.validityYears : 1,
      noOfUnits: typeof li.noOfUnits === 'number' && li.noOfUnits > 0 ? li.noOfUnits : 1,
      feeRate: typeof li.feeRate === 'number' ? li.feeRate : 0,
      amount: typeof li.amount === 'number' ? li.amount : 0,
    })),
  };
}

export function buildOpDataFromDto(params: {
  dto: ApiApplicationDto;
  primaryOpDto?: ApiOpDto;
  status: ApplicationStatus;
  refNumber: string;
  isPaymentSubmitted: boolean;
  hasAnyUnpaidOp: boolean;
  resolvedOrNumber?: string;
  resolvedAmountPaid?: number;
  resolvedPaidAt?: string;
}): OpData | undefined {
  const {
    dto,
    primaryOpDto,
    status,
    refNumber,
    isPaymentSubmitted,
    hasAnyUnpaidOp,
    resolvedOrNumber,
    resolvedAmountPaid,
    resolvedPaidAt,
  } = params;

  if (primaryOpDto) {
    return {
      id: primaryOpDto.id,
      opNumber: primaryOpDto.opNumber || '',
      status: isPaymentSubmitted && primaryOpDto.status !== 'Returned' ? 'Processing' : primaryOpDto.status || 'Active',
      amountDue: typeof primaryOpDto.amountDue === 'number' ? primaryOpDto.amountDue : 0,
      amountReceived:
        typeof primaryOpDto.amountReceived === 'number' ? primaryOpDto.amountReceived : resolvedAmountPaid ?? 0,
      paymentMethod: primaryOpDto.paymentMethod || dto.paymentMethod || dto.PaymentMethod,
      officialReceiptNumber:
        (primaryOpDto.status || '').toLowerCase() === 'paid' && !hasAnyUnpaidOp
          ? primaryOpDto.officialReceiptNumber || resolvedOrNumber
          : undefined,
      paidAt: primaryOpDto.paidAt || resolvedPaidAt,
      remarks: primaryOpDto.remarks || dto.paymentRemarks || dto.remarks,
    };
  }

  const hasSummaryOp = Boolean(
    dto.opStatus ||
      dto.OpStatus ||
      dto.orderOfPaymentId ||
      dto.OrderOfPaymentId ||
      dto.opNumber ||
      dto.OpNumber ||
      resolvedOrNumber ||
      isPaymentSubmitted
  );

  if (!hasSummaryOp) return undefined;

  return {
    id: dto.orderOfPaymentId || dto.OrderOfPaymentId || (resolvedOrNumber ? 'op-auto-gen' : 'op-summary'),
    opNumber:
      dto.opNumber ||
      dto.OpNumber ||
      (status === 'READY_FOR_PAYMENT' || status === 'PAYMENT_SUBMITTED' ? `OP-${refNumber}` : ''),
    status: isPaymentSubmitted ? 'Processing' : dto.opStatus || dto.OpStatus || (resolvedOrNumber ? 'PAID' : 'Active'),
    amountDue:
      typeof dto.totalAmountDue === 'number'
        ? dto.totalAmountDue
        : typeof dto.TotalAmountDue === 'number'
          ? dto.TotalAmountDue
          : 0,
    amountReceived: resolvedAmountPaid ?? 0,
    paymentMethod: dto.paymentMethod || dto.PaymentMethod,
    officialReceiptNumber: resolvedOrNumber,
    paidAt: resolvedPaidAt,
    remarks: dto.paymentRemarks || dto.remarks,
  };
}

export function buildFallbackSoaItems(
  serviceName: string,
  serviceCategory: string,
  isBulk: boolean,
  applicantCount: number
): SoaLineItem[] {
  const svcLower = (serviceName || '').toLowerCase();
  const catLower = (serviceCategory || '').toLowerCase();
  const isExam = catLower.includes('exam') || svcLower.includes('exam') || svcLower.includes('admission');
  const units = isBulk ? applicantCount || 1 : 1;

  if (isExam) {
    return [
      {
        id: 'fee-exam-1',
        particular: 'Examination Fee',
        itemCode: '4-02-01-030',
        validityYears: 1,
        noOfUnits: units,
        feeRate: 50,
        amount: 50 * units,
      },
    ];
  }

  return [
    {
      id: 'fee-filing-1',
      particular: 'Filing & Processing Fee',
      itemCode: 'NTC-FF-01',
      validityYears: 1,
      noOfUnits: units,
      feeRate: 180,
      amount: 180 * units,
    },
    {
      id: 'fee-lic-1',
      particular: `${serviceName || 'Permit / License'} Regulatory Fee`,
      itemCode: 'NTC-RF-02',
      validityYears: 1,
      noOfUnits: units,
      feeRate: 1200,
      amount: 1200 * units,
    },
  ];
}
