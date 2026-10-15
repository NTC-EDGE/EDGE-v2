import { ApplicationDto, ApplicationSummaryDto } from '@edge/api';
import {
  ApplicationData,
  ApplicationCategory,
} from '../../../types/application';
import {
  parseApplicationCategory,
  mapBEStatusToFE,
  isGenericOfficer,
  formatDateLabel,
  parseBackendQueueTab,
  isAccountantRole,
  isCashierRole,
  isEvaluatorOrSupervisorRole,
  deriveQueueTab,
  parseEndorsementState,
  resolveEvaluatingOfficer,
  resolveAccountingOfficer,
  resolveCashierOfficer,
  resolveIssuingOfficer,
  resolveAssignedTo,
} from './officerResolutionHelpers';
import { buildAuditTrailList } from './auditTrailHelpers';

// Re-export utility functions to maintain backwards compatibility
export {
  parseApplicationCategory,
  mapBEStatusToFE,
  isGenericOfficer,
  formatDateLabel,
  parseBackendQueueTab,
  isAccountantRole,
  isCashierRole,
  isEvaluatorOrSupervisorRole,
  deriveQueueTab,
};

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

function isValidName(val?: string | null): val is string {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim().toLowerCase();
  if (!trimmed) return false;
  if (GENERIC_NAMES.has(trimmed)) return false;
  if (/^applicant(\s*#?\s*\d+)?$/i.test(trimmed)) return false;
  if (/^draft(\s+applicant)?(\s*#?\s*\d+)?$/i.test(trimmed)) return false;
  return true;
}

function formatProperName(name?: string | null): string {
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
}

function parseAddressSegments(rawAddress?: string | null): {
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  region?: string;
  zipCode?: string;
} {
  if (!rawAddress || typeof rawAddress !== 'string') return {};
  const parts = rawAddress.split(',').map((p) => p.trim()).filter((p) => p.length > 0);
  if (parts.length >= 5) {
    return {
      street: parts[0],
      barangay: parts[1],
      city: parts[2],
      province: parts[3],
      region: parts.length >= 6 ? parts[4] : undefined,
      zipCode: parts[parts.length - 1],
    };
  } else if (parts.length === 4) {
    return {
      street: parts[0],
      barangay: parts[1],
      city: parts[2],
      province: parts[3],
    };
  } else if (parts.length === 3) {
    return {
      street: parts[0],
      barangay: parts[1],
      city: parts[2],
    };
  }
  return { street: rawAddress };
}

export function mapApplicationDtoToUI(
  dto: ApplicationDto | ApplicationSummaryDto,
  role?: string
): ApplicationData {
  const rawFilingUser = dto.filingUser;

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

  const filingAccountType: 'Individual' | 'Company' =
    rawFilingUser?.accountType === 'Company' ? 'Company' : 'Individual';

  const filingUser = rawFilingUser
    ? {
      id: rawFilingUser.id,
      name: formatProperName(rawFilingUser.name ?? ''),
      email: rawFilingUser.email ?? '',
      accountType: filingAccountType,
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

  const rawPrimaryAddress = primaryDetail?.address ?? rawFilingUser?.company?.address ?? '';
  const parsedPrimaryAddr = parseAddressSegments(rawPrimaryAddress);

  const brgyPrimary =
    primaryDetail?.barangayName ||
    primaryDetail?.barangay ||
    findPrimaryFv((lbl) => lbl.includes('barangay')) ||
    parsedPrimaryAddr.barangay ||
    '';
  const cityPrimary =
    primaryDetail?.cityMunicipalityName ||
    primaryDetail?.city ||
    findPrimaryFv((lbl) => lbl.includes('city') || lbl.includes('municipality')) ||
    parsedPrimaryAddr.city ||
    '';
  const provPrimary =
    primaryDetail?.provinceName ||
    primaryDetail?.province ||
    findPrimaryFv((lbl) => lbl.includes('province')) ||
    parsedPrimaryAddr.province ||
    '';
  const regPrimary =
    primaryDetail?.regionName ||
    primaryDetail?.region ||
    findPrimaryFv((lbl) => lbl.includes('region')) ||
    parsedPrimaryAddr.region ||
    '';
  const zipPrimary =
    primaryDetail?.zipCode ||
    findPrimaryFv((lbl) => lbl.includes('zip') || lbl.includes('postal')) ||
    parsedPrimaryAddr.zipCode ||
    '';
  const dobPrimary = primaryDetail?.birthDate ?? findPrimaryFv((lbl) => lbl.includes('birth')) ?? '';
  const sexPrimary = primaryDetail?.sex ?? findPrimaryFv((lbl) => lbl.includes('sex') || lbl.includes('gender')) ?? '';
  const natPrimary = primaryDetail?.nationality ?? findPrimaryFv((lbl) => lbl.includes('nationality') || lbl.includes('citizenship')) ?? 'Filipino';
  const civilPrimary = findPrimaryFv((lbl) => lbl.includes('civil') || lbl.includes('marital')) ?? '';

  const primaryStreet =
    (parsedPrimaryAddr.street && parsedPrimaryAddr.street !== rawPrimaryAddress)
      ? parsedPrimaryAddr.street
      : rawPrimaryAddress;
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
    const zipFromFv = findFv((lbl) => lbl.includes('zip') || lbl.includes('postal'));
    const dobFromFv = findFv((lbl) => lbl.includes('birth'));
    const sexFromFv = findFv((lbl) => lbl.includes('sex') || lbl.includes('gender'));
    const natFromFv = findFv((lbl) => lbl.includes('nationality') || lbl.includes('citizenship'));
    const civilFromFv = findFv((lbl) => lbl.includes('civil') || lbl.includes('marital'));

    const rawItemAddress = ad?.address ?? '';
    const parsedItemAddr = parseAddressSegments(rawItemAddress);
    const itemStreet = (parsedItemAddr.street && parsedItemAddr.street !== rawItemAddress)
      ? parsedItemAddr.street
      : rawItemAddress;
    const itemBarangay = ad?.barangayName || ad?.barangay || brgyFromFv || parsedItemAddr.barangay || '';
    const itemCity = ad?.cityMunicipalityName || ad?.city || cityFromFv || parsedItemAddr.city || '';
    const itemProvince = ad?.provinceName || ad?.province || provFromFv || parsedItemAddr.province || '';
    const itemRegion = ad?.regionName || ad?.region || regFromFv || parsedItemAddr.region || '';
    const itemZip = ad?.zipCode || zipFromFv || parsedItemAddr.zipCode || '';

    const itemApplicantType: 'Individual' | 'Company' =
      appItem.applicantType === 'Company' ? 'Company' : 'Individual';

    let itemStatus: 'Complete' | 'Incomplete' | 'ForEndorsement' = 'Complete';
    if (appItem.status === 'Incomplete' || appItem.status === 'ForEndorsement') {
      itemStatus = appItem.status;
    }

    return {
      id: appItem.id || `app-${idx}`,
      name: resolvedName,
      applicantType: itemApplicantType,
      status: itemStatus,
      evaluationRemarks: appItem.evaluationRemarks ?? '',
      serviceId: appItem.serviceId,
      serviceVariantId: appItem.serviceVariantId,
      submissionId: appItem.submissionId,
      contactNumber: ad?.contactNumber ?? '',
      email: ad?.emailAddress ?? ad?.email ?? '',
      address: itemStreet || rawItemAddress,
      streetAddress: itemStreet || rawItemAddress,
      company: itemCompanyDetails,
      formFieldValues: formFields.map((f) => ({
        fieldId: f.fieldId || '',
        fieldLabel: f.fieldLabel || '',
        value: f.value || '',
      })),
      barangay: itemBarangay,
      city: itemCity,
      province: itemProvince,
      region: itemRegion,
      zipCode: itemZip,
      dob: dobFromFv ?? ad?.birthDate ?? '',
      sex: sexFromFv ?? ad?.sex ?? '',
      nationality: natFromFv ?? ad?.nationality ?? 'Filipino',
      civilStatus: civilFromFv ?? '',
      documents: appItem.documents ?? [],
      schoolAttended: ad?.schoolAttended ?? findFv((lbl) => lbl.includes('school') || lbl.includes('university')),
      courseTaken: ad?.courseTaken ?? findFv((lbl) => lbl.includes('course') || lbl.includes('degree') || lbl.includes('program')),
      yearGraduated: ad?.yearGraduated ?? findFv((lbl) => lbl.includes('graduat')),
      eSignature: ad?.eSignature,
    };
  });

  const feStatus = mapBEStatusToFE(dto.status);

  const isBulk =
    dto.submissionMode === 'Bulk' ||
    (dto.applicationNumber?.startsWith('BULK-') ?? false) ||
    applicantsList.length > 1;

  let applicantServiceName: string | undefined;
  if (dto.applicants) {
    for (const applicant of dto.applicants) {
      if (typeof applicant === 'object' && applicant !== null && 'serviceName' in applicant) {
        const candidate = Reflect.get(applicant, 'serviceName');
        if (typeof candidate === 'string' && candidate.length > 0) {
          applicantServiceName = candidate;
          break;
        }
      }
    }
  }

  let dtoServiceCategoryName: string | undefined;
  if (typeof dto === 'object' && dto !== null && 'serviceCategoryName' in dto) {
    const candidate = Reflect.get(dto, 'serviceCategoryName');
    if (typeof candidate === 'string' && candidate.length > 0) {
      dtoServiceCategoryName = candidate;
    }
  }

  const rawServiceName =
    dto.serviceName ||
    dto.services?.find((s) => s.serviceName)?.serviceName ||
    applicantServiceName;

  const rawCategoryCandidate =
    dto.serviceCategory ||
    dtoServiceCategoryName ||
    dto.services?.find((s) => s.serviceCategory)?.serviceCategory;

  const resolvedCategory = parseApplicationCategory(rawCategoryCandidate, rawServiceName);
  const resolvedServiceName = rawServiceName || `${resolvedCategory} Application`;

  const endorsementState = parseEndorsementState(dto);

  const histories = 'histories' in dto && Array.isArray(dto.histories) ? dto.histories : [];
  const sortedHistories = [...histories].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const reversedHistories = [...sortedHistories].reverse();

  const activeSoa = dto.statementsOfAccount && dto.statementsOfAccount.length > 0
    ? [...dto.statementsOfAccount].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;
        const histA = a.histories && a.histories.length > 0 ? a.histories[a.histories.length - 1] : undefined;
        const histB = b.histories && b.histories.length > 0 ? b.histories[b.histories.length - 1] : undefined;
        const hTimeA = histA?.timestamp ? new Date(histA.timestamp).getTime() : 0;
        const hTimeB = histB?.timestamp ? new Date(histB.timestamp).getTime() : 0;
        return hTimeB - hTimeA;
      })[0]
    : undefined;

  const accountingOfficer = resolveAccountingOfficer(reversedHistories);
  const cashierOfficer = resolveCashierOfficer(reversedHistories);
  const issuingOfficer = resolveIssuingOfficer(reversedHistories);
  const evaluatingOfficer = resolveEvaluatingOfficer(dto, reversedHistories, endorsementState);
  const assignedTo = resolveAssignedTo(
    feStatus,
    evaluatingOfficer,
    accountingOfficer,
    cashierOfficer,
    issuingOfficer,
    endorsementState,
    dto.office
  );

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
    queueTab: parseBackendQueueTab(dto.queueTab) ?? deriveQueueTab(feStatus, role, {
      hasSoa: Boolean(activeSoa || (dto.statementsOfAccount && dto.statementsOfAccount.length > 0)),
      hasOp: Boolean(dto.ordersOfPayment && dto.ordersOfPayment.length > 0),
      hasAccountantHistory: histories.some((h) => (h.staffRole || '').toLowerCase().includes('accountant') || (h.action || '').toLowerCase().includes('accountant') || (h.remarks || '').toLowerCase().includes('accountant')),
      hasCashierHistory: histories.some((h) => (h.staffRole || '').toLowerCase().includes('cashier') || (h.action || '').toLowerCase().includes('cashier') || (h.remarks || '').toLowerCase().includes('cashier')),
      remarks: dto.remarks ?? undefined,
    }),
    applicationType: isBulk ? 'BULK' : 'SINGLE',
    mode: isBulk ? 'Bulk' : 'Single',
    serviceId: dto.serviceId ?? dto.services?.[0]?.serviceId ?? '',
    serviceName: resolvedServiceName,
    serviceCategory: resolvedCategory,
    serviceVariantName: dto.serviceVariantName ?? '',
    office: dto.office ?? '',
    applicantsList,
    formFieldValues: (dto.applicants?.[0]?.formFieldValues ?? applicantsList[0]?.formFieldValues ?? []).map((f) => ({
      fieldId: f.fieldId || '',
      fieldLabel: f.fieldLabel || '',
      value: f.value || '',
    })),
    services: dto.services?.length
      ? dto.services.map((s) => ({
          id: s.id,
          applicantId: s.applicantId,
          serviceId: s.serviceId,
          serviceName: s.serviceName ?? resolvedServiceName,
          serviceCategory: s.serviceCategory ?? resolvedCategory,
          serviceVariantId: s.serviceVariantId,
          serviceVariantName: s.serviceVariantName ?? dto.serviceVariantName,
          submissionId: s.submissionId,
        }))
      : applicantsList.map((a) => ({
          id: a.id,
          applicantId: a.id,
          serviceId: a.serviceId ?? '',
          serviceName: resolvedServiceName,
          serviceCategory: resolvedCategory,
          serviceVariantId: a.serviceVariantId,
          serviceVariantName: dto.serviceVariantName ?? '',
          submissionId: a.submissionId,
        })),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt || dto.lastModifiedAt || dto.createdAt,
    lastModifiedAt: dto.lastModifiedAt,
    dateLabel: formatDateLabel(dto.updatedAt || dto.lastModifiedAt || dto.createdAt),
    assignedTo,
    evaluatingOfficer,
    accountingOfficer,
    cashierOfficer,
    issuingOfficer,
    soaId: activeSoa?.id,
    statementOfAccountId: activeSoa?.id,
    soaNumber: activeSoa?.soaNumber,
    soaStatus: activeSoa?.status,
    soaIssuedToName: activeSoa?.issuedToName,
    soaIssuedToAddress: activeSoa?.issuedToAddress ?? undefined,
    soaIssuedToType: activeSoa?.issuedToType === 'Company' ? 'Company' : 'Individual',
    soaDueDate: activeSoa?.dueDate,
    soaCreatedAt: activeSoa?.createdAt,
    endorsedTo: endorsementState.endorsedTo,
    endorsedBy: endorsementState.endorsedBy,
    isBeingViewed: false,
    isUrgent: false,
    isPinned: Boolean(dto.isPinned),
    isArchived: Boolean(dto.isArchived),
    intent: (dto.intent === 'AssessmentOnly' || (dto.intent as unknown) === 1) ? 'AssessmentOnly' : 'Regular',
    isAssessmentOnly: dto.intent === 'AssessmentOnly' || (dto.intent as unknown) === 1,
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
    soaItems: activeSoa?.lineItems?.map((item) => ({
      particular: item.particular,
      validityYears: item.validityYears || 1,
      percentage: 0,
      noOfUnits: item.noOfUnits || 1,
      fees: item.feeRate,
      amount: item.amount,
      code: item.itemCode,
    })) ?? [],
    totalAmountDue: activeSoa?.totalAmount ?? 0,
    dueDate: activeSoa?.dueDate
      ? (activeSoa.dueDate.includes('T') ? (activeSoa.dueDate.split('T')[0] ?? '') : activeSoa.dueDate)
      : '',
    payment: (() => {
      const activeOp = dto.ordersOfPayment && dto.ordersOfPayment.length > 0
        ? [...dto.ordersOfPayment].sort((a, b) => {
            const histA = a.histories && a.histories.length > 0 ? a.histories[a.histories.length - 1] : undefined;
            const histB = b.histories && b.histories.length > 0 ? b.histories[b.histories.length - 1] : undefined;
            const timeA = histA?.timestamp ? new Date(histA.timestamp).getTime() : (a.paidAt ? new Date(a.paidAt).getTime() : 0);
            const timeB = histB?.timestamp ? new Date(histB.timestamp).getTime() : (b.paidAt ? new Date(b.paidAt).getTime() : 0);
            return timeB - timeA;
          })[0]
        : undefined;

      return {
        orderOfPaymentId: activeOp?.id,
        opNumber: activeOp?.opNumber,
        amountReceived: activeOp?.amountReceived ?? 0,
        method: activeOp?.paymentMethod === 'Check' ? 'check' : 'cash',
        orNumber: activeOp?.officialReceiptNumber ?? '',
        checkNumber: activeOp?.checkNumber ?? '',
        checkName: activeOp?.checkName ?? '',
      };
    })(),
    correctionAuditTrail: dto.correctionAuditTrails?.map((c) => ({
      id: c.id,
      action: `${c.fieldName}: ${c.oldValue} → ${c.newValue}`,
      staff: c.correctedByStaff,
      timestamp: c.correctedAt,
    })) ?? [],
    history: buildAuditTrailList(dto, filingUser?.name || applicantName || 'Applicant'),
    note: dto.remarks ?? '',
  };
}
