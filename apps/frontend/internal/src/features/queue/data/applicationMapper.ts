import { ApplicationDto, ApplicationSummaryDto } from '@edge/api';
import {
  ApplicationData,
  ApplicationStatus,
  ApplicationCategory,
  QueueTab,
} from '../../../types/application';

function parseApplicationCategory(cat?: string): ApplicationCategory {
  if (!cat) return 'Permits';
  const valid: ApplicationCategory[] = ['Exams', 'Permits', 'Licenses', 'Accreditations', 'Certificates', 'Complaints and Request'];
  return valid.find((c) => c.toLowerCase() === cat.toLowerCase()) ?? 'Permits';
}

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
  const rawFilingUser = dto.filingUser;
  const GENERIC_NAMES = new Set([
    'applicant details',
    'applicant detail',
    'applicant',
    'unnamed applicant',
    'unnamed',
    'n/a',
    'na',
    'none',
    'juan dela cruz',
  ]);

  const isValidName = (val?: string | null): val is string => {
    if (!val || typeof val !== 'string') return false;
    const trimmed = val.trim().toLowerCase();
    if (!trimmed) return false;
    if (GENERIC_NAMES.has(trimmed)) return false;
    if (/^applicant(\s*#?\s*\d+)?$/i.test(trimmed)) return false;
    if (/^draft(\s+applicant)?(\s*#?\s*\d+)?$/i.test(trimmed)) return false;
    return true;
  };

  const formatProperName = (name?: string | null): string => {
    if (!name || typeof name !== 'string') return '';
    const trimmed = name.trim();
    if (!trimmed) return '';

    return trimmed
      .split(/\s+/)
      .map((word) => {
        if (!word) return '';
        if (word.includes('-')) {
          return word
            .split('-')
            .map((part) => {
              if (!part) return '';
              if (part === part.toLowerCase()) {
                return part.charAt(0).toUpperCase() + part.slice(1);
              }
              return part;
            })
            .join('-');
        }
        if (word === word.toLowerCase()) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');
  };

  const primaryApplicant = dto.applicants?.[0];
  const primaryDetail = primaryApplicant?.details;
  const primaryFormFields = primaryApplicant?.formFieldValues ?? [];

  const isCompanySubmission =
    rawFilingUser?.accountType === 'Company' ||
    primaryApplicant?.applicantType === 'Company' ||
    dto.submissionMode === 'Bulk';

  const companyObj = rawFilingUser?.company ?? primaryDetail?.company ?? primaryApplicant?.company;

  const companyDetails = companyObj
    ? {
      name: formatProperName(companyObj.name ?? ''),
      registrationNumber: companyObj.registrationNumber ?? '',
      address: companyObj.address ?? '',
      contactNumber: companyObj.contactNumber ?? '',
      email: companyObj.email ?? '',
    }
    : undefined;

  const filingUser = rawFilingUser
    ? {
      id: rawFilingUser.id,
      name: formatProperName(rawFilingUser.name ?? ''),
      email: rawFilingUser.email ?? '',
      accountType: (rawFilingUser.accountType as 'Individual' | 'Company') ?? 'Individual',
      company: rawFilingUser.company
        ? {
          name: formatProperName(rawFilingUser.company.name ?? ''),
          registrationNumber: rawFilingUser.company.registrationNumber ?? '',
          address: rawFilingUser.company.address ?? '',
          contactNumber: rawFilingUser.company.contactNumber ?? '',
          email: rawFilingUser.company.email ?? '',
        }
        : undefined,
    }
    : undefined;

  const primaryApplicantName =
    primaryApplicant && 'name' in primaryApplicant && typeof primaryApplicant.name === 'string'
      ? primaryApplicant.name
      : '';

  const primaryFullName = primaryDetail
    ? [primaryDetail.firstName, primaryDetail.middleName, primaryDetail.lastName, primaryDetail.suffix]
        .filter(Boolean)
        .join(' ')
        .trim()
    : primaryApplicantName;

  const applicantName =
    isValidName(primaryFullName)
      ? formatProperName(primaryFullName)
      : isCompanySubmission && isValidName(companyDetails?.name)
        ? formatProperName(companyDetails.name)
        : isValidName(rawFilingUser?.name)
          ? formatProperName(rawFilingUser.name)
          : isValidName(companyObj?.name)
            ? formatProperName(companyObj.name)
            : formatProperName(companyDetails?.name) || formatProperName(rawFilingUser?.name) || 'Applicant';

  const findPrimaryFv = (predicate: (lbl: string, id: string) => boolean) =>
    primaryFormFields.find((f) => predicate((f.fieldLabel || '').toLowerCase(), f.fieldId || ''))?.value;

  const brgyPrimary = findPrimaryFv((lbl) => lbl.includes('barangay')) ?? '';
  const cityPrimary = findPrimaryFv((lbl) => lbl.includes('city') || lbl.includes('municipality')) ?? '';
  const provPrimary = findPrimaryFv((lbl) => lbl.includes('province')) ?? '';
  const regPrimary = findPrimaryFv((lbl) => lbl.includes('region')) ?? '';
  const zipPrimary = primaryDetail?.zipCode ?? findPrimaryFv((lbl) => lbl.includes('zip')) ?? '';
  const dobPrimary = primaryDetail?.birthDate ?? findPrimaryFv((lbl) => lbl.includes('birth')) ?? '';
  const sexPrimary = primaryDetail?.sex ?? findPrimaryFv((lbl) => lbl.includes('sex') || lbl.includes('gender')) ?? '';
  const natPrimary = primaryDetail?.nationality ?? findPrimaryFv((lbl) => lbl.includes('nationality') || lbl.includes('citizenship')) ?? 'Filipino';
  const civilPrimary = findPrimaryFv((lbl) => lbl.includes('civil') || lbl.includes('marital')) ?? '';

  const primaryStreet = primaryDetail?.address ?? rawFilingUser?.company?.address ?? '';
  const contactEmail = primaryDetail?.emailAddress ?? primaryDetail?.email ?? rawFilingUser?.email ?? '';
  const contactPhone = primaryDetail?.contactNumber ?? rawFilingUser?.company?.contactNumber ?? '';

  const applicantsList = (dto.applicants ?? []).map((appItem, idx) => {
    const ad = appItem.details;
    const formFields = appItem.formFieldValues ?? [];

    const rawAppItemName =
      'name' in appItem && typeof appItem.name === 'string'
        ? appItem.name
        : (appItem.company?.name || '');

    const nameCandidate = ad
      ? [ad.firstName, ad.middleName, ad.lastName, ad.suffix].filter(Boolean).join(' ').trim()
      : rawAppItemName;

    const itemComp = appItem.company ?? ad?.company;
    const itemCompanyDetails = itemComp
      ? {
        name: formatProperName(itemComp.name ?? ''),
        registrationNumber: itemComp.registrationNumber ?? '',
        address: itemComp.address ?? '',
        contactNumber: itemComp.contactNumber ?? '',
        email: itemComp.email ?? '',
      }
      : undefined;

    const findFv = (predicate: (lbl: string, id: string) => boolean) =>
      formFields.find((f) => predicate((f.fieldLabel || '').toLowerCase(), f.fieldId || ''))?.value;

    const fvNameCandidate = findFv((lbl) =>
      lbl.includes('full name') ||
      lbl.includes('applicant name') ||
      lbl.includes('name of applicant') ||
      lbl.includes('business name') ||
      lbl.includes('company name') ||
      lbl.includes('corporate name')
    );

    const resolvedName =
      isValidName(nameCandidate)
        ? formatProperName(nameCandidate)
        : isValidName(fvNameCandidate)
          ? formatProperName(fvNameCandidate)
          : isValidName(itemComp?.name)
            ? formatProperName(itemComp.name)
            : isValidName(rawFilingUser?.name)
              ? formatProperName(rawFilingUser.name)
              : formatProperName(itemComp?.name) || formatProperName(rawFilingUser?.name) || 'Applicant';

    const brgyFromFv = findFv((lbl) => lbl.includes('barangay'));
    const cityFromFv = findFv((lbl) => lbl.includes('city') || lbl.includes('municipality'));
    const provFromFv = findFv((lbl) => lbl.includes('province'));
    const regFromFv = findFv((lbl) => lbl.includes('region'));
    const zipFromFv = findFv((lbl) => lbl.includes('zip'));
    const dobFromFv = findFv((lbl) => lbl.includes('birth'));
    const sexFromFv = findFv((lbl) => lbl.includes('sex') || lbl.includes('gender'));
    const natFromFv = findFv((lbl) => lbl.includes('nationality') || lbl.includes('citizenship'));
    const civilFromFv = findFv((lbl) => lbl.includes('civil') || lbl.includes('marital'));

    return {
      id: appItem.id || `app-${idx}`,
      name: resolvedName,
      applicantType: appItem.applicantType === 'Company' ? ('Company' as const) : ('Individual' as const),
      status: (appItem.status === 'Incomplete' || appItem.status === 'ForEndorsement')
        ? (appItem.status as 'Incomplete' | 'ForEndorsement')
        : ('Complete' as const),
      evaluationRemarks: appItem.evaluationRemarks ?? '',
      serviceId: appItem.serviceId,
      serviceVariantId: appItem.serviceVariantId,
      submissionId: appItem.submissionId,
      contactNumber: ad?.contactNumber ?? '',
      email: ad?.emailAddress ?? ad?.email ?? '',
      address: ad?.address ?? '',
      streetAddress: ad?.address ?? '',
      barangay: brgyFromFv ?? '',
      city: cityFromFv ?? '',
      province: provFromFv ?? '',
      region: regFromFv ?? '',
      zipCode: ad?.zipCode ?? zipFromFv ?? '',
      companyDetails: itemCompanyDetails,
      basicInfo: ad ? {
        lastName: ad.lastName ?? '',
        firstName: ad.firstName ?? '',
        middleName: ad.middleName ?? '',
        extensionName: ad.suffix ?? '',
        dob: ad.birthDate ?? dobFromFv ?? '',
        placeOfBirth: '',
        sex: ad.sex ?? sexFromFv ?? '',
        weight: ad.weight ?? 0,
        height: ad.height ?? 0,
        nationality: ad.nationality ?? natFromFv ?? 'Filipino',
        civilStatus: civilFromFv ?? '',
        employmentStatus: '',
        occupation: '',
      } : (dobFromFv || sexFromFv || natFromFv || civilFromFv ? {
        lastName: '',
        firstName: '',
        middleName: '',
        extensionName: '',
        dob: dobFromFv ?? '',
        placeOfBirth: '',
        sex: sexFromFv ?? '',
        weight: 0,
        height: 0,
        nationality: natFromFv ?? 'Filipino',
        civilStatus: civilFromFv ?? '',
        employmentStatus: '',
        occupation: '',
      } : undefined),
      requirements: [],
    };
  });

  const feStatus = mapBEStatusToFE(dto.status);
  const isBulk =
    dto.submissionMode?.toUpperCase() === 'BULK' ||
    (Array.isArray(dto.applicants) && dto.applicants.length > 1) ||
    applicantsList.length > 1;

  const resolvedServiceName = dto.serviceName || 'Permit Evaluation';
  const resolvedCategory = parseApplicationCategory(dto.serviceCategory);

  return {
    id: dto.id,
    tenantId: dto.tenantId,
    referenceNumber: dto.referenceNumber ?? dto.id.slice(0, 8),
    applicationNumber: dto.applicationNumber ?? '',
    filingUser,
    applicant: applicantName,
    applicantType: isCompanySubmission ? 'Company' : 'Individual',
    permitTitle: resolvedServiceName,
    category: resolvedCategory,
    status: feStatus,
    queueTab: deriveQueueTab(feStatus),
    applicationType: isBulk ? 'BULK' : 'SINGLE',
    mode: isBulk ? 'Bulk' : 'Single',
    serviceName: dto.serviceName ?? '',
    serviceCategory: dto.serviceCategory ?? '',
    serviceVariantName: dto.serviceVariantName ?? '',
    office: dto.office ?? '',
    applicantsList,
    services: dto.services?.length
      ? dto.services.map((s) => ({
          id: s.id,
          applicantId: s.applicantId,
          serviceId: s.serviceId,
          serviceName: s.serviceName ?? dto.serviceName,
          serviceCategory: s.serviceCategory ?? dto.serviceCategory,
          serviceVariantId: s.serviceVariantId,
          serviceVariantName: s.serviceVariantName ?? dto.serviceVariantName,
          submissionId: s.submissionId,
        }))
      : applicantsList.map((a) => ({
          id: a.id,
          applicantId: a.id,
          serviceId: a.serviceId ?? '',
          serviceName: dto.serviceName ?? '',
          serviceCategory: dto.serviceCategory ?? '',
          serviceVariantId: a.serviceVariantId,
          serviceVariantName: dto.serviceVariantName ?? '',
          submissionId: a.submissionId,
        })),
    createdAt: dto.createdAt,
    dateLabel: formatDateLabel(dto.createdAt),
    assignedTo: dto.office ?? '',
    isBeingViewed: false,
    isUrgent: false,
    isPinned: Boolean(dto.isPinned),
    isArchived: Boolean(dto.isArchived),
    address: {
      streetAddress: primaryStreet,
      address: primaryStreet,
      barangay: brgyPrimary,
      province: provPrimary,
      city: cityPrimary,
      region: regPrimary,
      zipCode: zipPrimary,
    },
    companyDetails,
    contactDetails: {
      contactNumber: contactPhone,
      email: contactEmail,
    },
    basicInfo: {
      lastName: primaryDetail?.lastName ?? (rawFilingUser?.name?.split(' ').slice(1).join(' ') ?? ''),
      firstName: primaryDetail?.firstName ?? (rawFilingUser?.name?.split(' ')[0] ?? ''),
      middleName: primaryDetail?.middleName ?? '',
      extensionName: primaryDetail?.suffix ?? '',
      dob: dobPrimary,
      placeOfBirth: '',
      sex: sexPrimary,
      weight: primaryDetail?.weight ?? 0,
      height: primaryDetail?.height ?? 0,
      nationality: natPrimary,
      civilStatus: civilPrimary,
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
