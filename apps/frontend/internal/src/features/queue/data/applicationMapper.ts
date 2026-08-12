import { ApplicationDto } from '@edge/api';
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

export function mapApplicationDtoToUI(dto: ApplicationDto): ApplicationData {
  const primaryApplicant = dto.applicants[0];
  const primaryDetail = primaryApplicant?.details;
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

  const filingAccountType: 'Individual' | 'Company' = isCompanySubmission
    ? 'Company'
    : 'Individual';

  const filingUser = rawFilingUser
    ? {
        id: rawFilingUser.id,
        name: rawFilingUser.name ?? '',
        email: rawFilingUser.email ?? '',
        accountType: filingAccountType,
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

  const feStatus = mapBEStatusToFE(dto.status);

  return {
    id: dto.id,
    referenceNumber: dto.referenceNumber ?? dto.id.slice(0, 8),
    permitNumber: dto.applicationNumber ?? '',
    filingUser,
    applicant: applicantName,
    applicantType: isCompanySubmission ? 'Company' : 'Individual',
    permitTitle: primaryService?.applicationTypeKey ?? 'Permit Evaluation',
    category: 'Permits',
    status: feStatus,
    queueTab: deriveQueueTab(feStatus),
    applicationType: dto.submissionMode === 'Bulk' ? 'BULK' : 'SINGLE',
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
      permitCategory: primaryService?.applicationTypeKey ?? '',
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
      action: h.action,
      staff: h.staffName,
      timestamp: h.timestamp,
    })) ?? [],
    note: dto.remarks ?? '',
  };
}
