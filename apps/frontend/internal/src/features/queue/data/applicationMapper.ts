import { ApplicationDto, ApplicationSummaryDto } from '@edge/api';
import {
  ApplicationData,
  ApplicationStatus,
  QueueTab,
} from '../../../types/application';

function mapBEStatusToFE(status: string): ApplicationStatus {
  const map: Record<string, ApplicationStatus> = {
    Draft: 'Draft',
    Submitted: 'Submitted',
    Evaluating: 'Evaluating',
    Returned: 'Returned',
    Approved: 'Approved',
    Completed: 'Completed',
  };
  return map[status] ?? 'Submitted';
}

function formatDateLabel(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function deriveQueueTab(status: ApplicationStatus): QueueTab {
  if (status === 'Submitted' || status === 'Evaluating') {
    return 'pending';
  }
  if (status === 'Approved' || status === 'Returned' || status === 'Completed') {
    return 'history';
  }
  return 'activity';
}

export function mapApplicationDtoToUI(dto: ApplicationDto | ApplicationSummaryDto): ApplicationData {
  const primaryApplicant = dto.applicants[0];
  const primaryDetail = (primaryApplicant as any)?.details;
  const primaryService = dto.services[0];

  const rawFilingUser = dto.filingUser;
  const isCompanySubmission =
    rawFilingUser?.accountType === 'Company' ||
    primaryApplicant?.applicantType === 'Company' ||
    dto.submissionMode === 'Bulk';

  const companyObj = primaryDetail?.company ?? primaryApplicant?.company ?? rawFilingUser?.company;

  const companyDetails = companyObj
    ? {
      name: companyObj.name ?? '',
      registrationNumber: companyObj.registrationNumber ?? '',
      address: companyObj.address ?? '',
      contactNumber: companyObj.contactNumber ?? '',
      email: companyObj.email ?? '',
    }
    : undefined;

  const filingUser = rawFilingUser
    ? {
      id: rawFilingUser.id,
      name: rawFilingUser.name ?? '',
      email: rawFilingUser.email ?? '',
      accountType: (rawFilingUser.accountType as 'Individual' | 'Company') ?? 'Individual',
      company: rawFilingUser.company
        ? {
          name: rawFilingUser.company.name ?? '',
          registrationNumber: rawFilingUser.company.registrationNumber ?? '',
          address: rawFilingUser.company.address ?? '',
          contactNumber: rawFilingUser.company.contactNumber ?? '',
          email: rawFilingUser.company.email ?? '',
        }
        : undefined,
    }
    : undefined;

  // Rule: If submission is individual, filing user IS the applicant. Copy filing user details to applicant.
  const applicantName = primaryDetail
    ? `${primaryDetail.firstName} ${primaryDetail.lastName}`.trim()
    : isCompanySubmission
      ? (companyDetails?.name ?? rawFilingUser?.name ?? '')
      : (rawFilingUser?.name ?? '');

  const contactEmail = primaryDetail?.email ?? rawFilingUser?.email ?? '';
  const contactPhone = primaryDetail?.contactNumber ?? '';

  const applicantsList = (dto.applicants ?? []).map((appItem, idx) => {
    const ad = appItem.details;
    const name = ad
      ? `${ad.firstName} ${ad.lastName}`.trim()
      : (appItem.company?.name || `Applicant ${idx + 1}`);

    const itemComp = appItem.company ?? ad?.company;
    const itemCompanyDetails = itemComp
      ? {
        name: itemComp.name ?? '',
        registrationNumber: itemComp.registrationNumber ?? '',
        address: itemComp.address ?? '',
        contactNumber: itemComp.contactNumber ?? '',
        email: itemComp.email ?? '',
      }
      : undefined;

    return {
      id: appItem.id || `app-${idx}`,
      name,
      applicantType: (appItem.applicantType as any) === 'Company' ? ('Company' as const) : ('Individual' as const),
      status: (appItem.status === 'Incomplete' || appItem.status === 'ForEndorsement')
        ? (appItem.status as 'Incomplete' | 'ForEndorsement')
        : ('Complete' as const),
      evaluationRemarks: appItem.evaluationRemarks ?? '',
      contactNumber: ad?.contactNumber ?? '',
      email: ad?.emailAddress ?? ad?.email ?? '',
      address: ad?.address ?? '',
      barangay: ad?.address ?? '',
      city: '',
      province: '',
      zipCode: ad?.zipCode ?? '',
      companyDetails: itemCompanyDetails,
      basicInfo: ad ? {
        lastName: ad.lastName ?? '',
        firstName: ad.firstName ?? '',
        middleName: ad.middleName ?? '',
        extensionName: ad.suffix ?? '',
        dob: ad.birthDate ?? '',
        placeOfBirth: '',
        sex: ad.sex ?? '',
        weight: ad.weight ?? 0,
        height: ad.height ?? 0,
        nationality: ad.nationality ?? '',
        employmentStatus: '',
        occupation: '',
      } : undefined,
      requirements: [],
    };
  });

  const feStatus = mapBEStatusToFE(dto.status);
  const isBulk = dto.submissionMode === 'Bulk' || applicantsList.length > 1;

  return {
    id: dto.id,
    referenceNumber: dto.referenceNumber ?? dto.id.slice(0, 8),
    applicationNumber: dto.applicationNumber ?? '',
    filingUser,
    applicant: applicantName,
    applicantType: isCompanySubmission ? 'Company' : 'Individual',
    permitTitle: 'Permit Evaluation',
    category: 'Permits',
    status: feStatus,
    queueTab: deriveQueueTab(feStatus),
    applicationType: isBulk ? 'BULK' : 'SINGLE',
    applicantsList,
    createdAt: dto.createdAt,
    dateLabel: formatDateLabel(dto.createdAt),
    assignedTo: dto.office ?? '',
    isBeingViewed: false,
    isUrgent: false,
    isPinned: Boolean(dto.isPinned),
    isArchived: Boolean(dto.isArchived),
    address: {
      barangay: primaryDetail?.address ?? '',
      province: '',
      city: '',
      zipCode: primaryDetail?.zipCode ?? '',
    },
    companyDetails,
    contactDetails: {
      contactNumber: contactPhone,
      email: contactEmail,
    },
    basicInfo: {
      lastName: primaryDetail?.lastName ?? (rawFilingUser?.name?.split(' ')[1] ?? ''),
      firstName: primaryDetail?.firstName ?? (rawFilingUser?.name?.split(' ')[0] ?? ''),
      middleName: primaryDetail?.middleName ?? '',
      extensionName: primaryDetail?.suffix ?? '',
      dob: primaryDetail?.birthDate ?? '',
      placeOfBirth: '',
      sex: primaryDetail?.sex ?? '',
      weight: primaryDetail?.weight ?? 0,
      height: primaryDetail?.height ?? 0,
      nationality: primaryDetail?.nationality ?? '',
      employmentStatus: '',
      occupation: '',
    },
    applicationDetails: {
      noOfYears: 0,
      permitCategory: '',
      formType: '',
      submittedAt: dto.createdAt,
    },
    requirements: [],
    forms: [],
    soaItems: dto.statementsOfAccount?.[0]?.lineItems?.map((item) => ({
      particular: item.particular,
      validityYears: item.validityYears,
      percentage: 0,
      noOfUnits: item.noOfUnits,
      fees: item.feeRate,
      amount: item.amount,
      code: item.itemCode,
    })) ?? [],
    totalAmountDue: dto.statementsOfAccount?.[0]?.totalAmount ?? 0,
    dueDate: dto.statementsOfAccount?.[0]?.dueDate ?? '',
    payment: {
      amountReceived: dto.ordersOfPayment?.[0]?.amountReceived ?? 0,
      method:
        dto.ordersOfPayment?.[0]?.paymentMethod === 'Check' ? 'check' : 'cash',
      orNumber: dto.ordersOfPayment?.[0]?.officialReceiptNumber ?? '',
      checkNumber: dto.ordersOfPayment?.[0]?.checkNumber ?? '',
      checkName: dto.ordersOfPayment?.[0]?.checkName ?? '',
    },
    correctionAuditTrail: dto.correctionAuditTrails?.map((c) => ({
      id: c.id,
      action: `${c.fieldName}: ${c.oldValue} → ${c.newValue}`,
      staff: c.correctedByStaff,
      timestamp: c.correctedAt,
    })) ?? [],
    history: dto.histories?.map((h) => ({
      id: h.id,
      action: h.action || `Status: ${h.toStatus}`,
      staff: h.staffName || 'System',
      timestamp: h.timestamp ? new Date(h.timestamp).toLocaleString() : '',
    })) ?? [],
    note: dto.remarks ?? '',
  };
}
