import { ApplicationDto, ApplicationSummaryDto, SYSTEM_ROLES } from '@edge/api';
import {
  ApplicationData,
  ApplicationStatus,
  ApplicationCategory,
  QueueTab,
  AuditTrailEntry,
} from '../../../types/application';

function parseApplicationCategory(cat?: string, serviceName?: string): ApplicationCategory {
  const valid: ApplicationCategory[] = ['Exams', 'Permits', 'Licenses', 'Accreditations', 'Certificates', 'Complaints and Request'];
  if (cat && typeof cat === 'string') {
    const trimmed = cat.trim();
    const exact = valid.find((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (exact) return exact;

    const lower = trimmed.toLowerCase();
    if (lower.includes('cert') || lower.includes('roc') || lower.includes('goc')) return 'Certificates';
    if (lower.includes('licen') || lower.includes('rsl') || lower.includes('amateur')) return 'Licenses';
    if (lower.includes('exam') || lower.includes('admission') || lower.includes('operator examination')) return 'Exams';
    if (lower.includes('accredit') || lower.includes('dealer') || lower.includes('manufacturer') || lower.includes('service center')) return 'Accreditations';
    if (lower.includes('permit') || lower.includes('purchase') || lower.includes('possess') || lower.includes('import')) return 'Permits';
    if (lower.includes('complaint') || lower.includes('request')) return 'Complaints and Request';
  }

  if (serviceName && typeof serviceName === 'string') {
    const s = serviceName.trim().toLowerCase();
    if (s.includes('cert') || s.includes('roc') || s.includes('goc') || s.includes('radio operator')) return 'Certificates';
    if (s.includes('license') || s.includes('rsl') || s.includes('amateur radio')) return 'Licenses';
    if (s.includes('exam') || s.includes('admission') || s.includes('operator examination')) return 'Exams';
    if (s.includes('accredit') || s.includes('dealer') || s.includes('manufacturer') || s.includes('service center')) return 'Accreditations';
    if (s.includes('permit') || s.includes('purchase') || s.includes('possess') || s.includes('import')) return 'Permits';
    if (s.includes('complaint') || s.includes('request')) return 'Complaints and Request';
  }

  return 'Permits';
}

function mapBEStatusToFE(status: string): ApplicationStatus {
  const map: Record<string, ApplicationStatus> = {
    Draft: 'Draft',
    Submitted: 'Submitted',
    Evaluating: 'Evaluating',
    Returned: 'Returned',
    Approved: 'Approved',
    Completed: 'Completed',
    ForAccountant: 'ForAccountant',
    PendingPayment: 'PendingPayment',
    ForIssuance: 'ForIssuance',
  };
  return map[status] ?? 'Submitted';
}

function isGenericOfficer(name?: string | null, office?: string | null): boolean {
  if (!name) return true;
  const n = name.trim().toLowerCase();
  return (
    n.length === 0 ||
    n === 'unassigned' ||
    n === 'authorized officer' ||
    n === 'officer' ||
    n === 'evaluating officer' ||
    n === 'ntc officer' ||
    n === 'admin' ||
    n === 'system admin' ||
    n === (office ?? '').toLowerCase()
  );
}

function formatDateLabel(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function parseBackendQueueTab(tab?: string): QueueTab | null {
  if (!tab || typeof tab !== 'string') return null;
  const trimmed = tab.trim().toLowerCase();
  if (trimmed === 'pending') return 'pending';
  if (trimmed === 'issuance' || trimmed === 'forissuance') return 'issuance';
  if (trimmed === 'history' || trimmed === 'archived') return 'history';
  if (trimmed === 'activity' || trimmed === 'all') return 'activity';
  return null;
}

export function isAccountantRole(role?: string): boolean {
  if (!role) return false;
  const lower = role.trim().toLowerCase();
  return lower === SYSTEM_ROLES.Accountant.toLowerCase();
}

export function isCashierRole(role?: string): boolean {
  if (!role) return false;
  const lower = role.trim().toLowerCase();
  return lower === SYSTEM_ROLES.Cashier.toLowerCase();
}

export function isEvaluatorOrSupervisorRole(role?: string): boolean {
  if (!role) return false;
  const lower = role.trim().toLowerCase();
  return (
    lower === SYSTEM_ROLES.Evaluator.toLowerCase() ||
    lower === SYSTEM_ROLES.ChiefOfEod.toLowerCase() ||
    lower === SYSTEM_ROLES.RegionalDirector.toLowerCase()
  );
}

export function deriveQueueTab(
  status: ApplicationStatus,
  role?: string,
  context?: {
    hasSoa?: boolean;
    hasOp?: boolean;
    hasAccountantHistory?: boolean;
    hasCashierHistory?: boolean;
    remarks?: string;
  }
): QueueTab {
  if (isAccountantRole(role)) {
    if (status === 'ForAccountant') return 'pending';
    const hasAccountantTouch =
      context?.hasSoa === true ||
      context?.hasAccountantHistory === true ||
      (typeof context?.remarks === 'string' && context.remarks.toLowerCase().includes('accountant')) ||
      status === 'PendingPayment' ||
      status === 'ForIssuance' ||
      status === 'Approved' ||
      status === 'Completed' ||
      status === 'Returned';
    if (hasAccountantTouch) return 'history';
    return 'activity';
  }

  if (isCashierRole(role)) {
    if (status === 'PendingPayment') return 'pending';
    const hasCashierTouch =
      context?.hasOp === true ||
      context?.hasCashierHistory === true ||
      (typeof context?.remarks === 'string' && context.remarks.toLowerCase().includes('cashier')) ||
      status === 'ForIssuance' ||
      status === 'Completed' ||
      status === 'Approved' ||
      status === 'Returned';
    if (hasCashierTouch) return 'history';
    return 'activity';
  }

  if (status === 'ForIssuance') {
    return 'issuance';
  }

  if (isEvaluatorOrSupervisorRole(role)) {
    if (status === 'Submitted' || status === 'Evaluating' || status === 'Returned') return 'pending';
    if (status === 'ForAccountant' || status === 'PendingPayment' || status === 'Approved' || status === 'Completed') return 'history';
    return 'activity';
  }

  if (status === 'Submitted' || status === 'Evaluating' || status === 'Returned' || status === 'ForAccountant' || status === 'PendingPayment') {
    return 'pending';
  }
  if (status === 'Approved' || status === 'Completed') {
    return 'history';
  }
  return 'activity';
}

function parseEndorsementState(dto: ApplicationDto | ApplicationSummaryDto): {
  endorsedTo?: string;
  endorsedBy?: string;
  isActivelyEndorsed: boolean;
} {
  const histories = 'histories' in dto && Array.isArray(dto.histories) ? dto.histories : [];
  if (histories.length > 0) {
    const sorted = [...histories].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const reversed = [...sorted].reverse();
    const latestEndorseIdx = reversed.findIndex(
      (h) => (h.action && h.action.toLowerCase().includes('endorsed to')) || (h.remarks && h.remarks.toLowerCase().includes('endorsed to'))
    );

    if (latestEndorseIdx !== -1) {
      const subsequentEntries = reversed.slice(0, latestEndorseIdx);
      const wasReturnedOrAdvanced = subsequentEntries.some(
        (h) =>
          (h.action && (h.action.toLowerCase().includes('returned') || h.action.toLowerCase().includes('approved') || h.action.toLowerCase().includes('forwarded'))) ||
          (h.remarks && h.remarks.toLowerCase().includes('returned')) ||
          h.toStatus === 'Returned' ||
          h.toStatus === 'ForAccountant' ||
          h.toStatus === 'PendingPayment' ||
          h.toStatus === 'Completed' ||
          h.toStatus === 'Approved'
      );

      if (!wasReturnedOrAdvanced) {
        const endorseEntry = reversed[latestEndorseIdx];
        const endorsedBy = endorseEntry.staffName || undefined;

        let endorsedTo: string | undefined = undefined;
        if (endorseEntry.action && endorseEntry.action.toLowerCase().includes('endorsed to')) {
          const match = endorseEntry.action.match(/endorsed to\s+([^,.(]+)/i);
          if (match && match[1]) {
            endorsedTo = match[1].trim();
          }
        }
        if (!endorsedTo && endorseEntry.remarks && endorseEntry.remarks.toLowerCase().includes('endorsed to')) {
          const match = endorseEntry.remarks.match(/endorsed to\s+([^,(.]+)/i);
          if (match && match[1]) {
            endorsedTo = match[1].trim();
          }
        }

        if (endorsedTo) {
          return { endorsedTo, endorsedBy, isActivelyEndorsed: true };
        }
      }
    }
  }

  // Fallback: Check dto.remarks if histories not populated or in summary DTO
  if (dto.remarks && dto.remarks.toLowerCase().includes('endorsed to') && !dto.remarks.toLowerCase().includes('returned')) {
    const match = dto.remarks.match(/endorsed to\s+([^,(.]+)/i);
    if (match && match[1]) {
      return {
        endorsedTo: match[1].trim(),
        endorsedBy: undefined,
        isActivelyEndorsed: true,
      };
    }
  }

  return { endorsedTo: undefined, endorsedBy: undefined, isActivelyEndorsed: false };
}

export function mapApplicationDtoToUI(
  dto: ApplicationDto | ApplicationSummaryDto,
  role?: string
): ApplicationData {
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
      formFieldValues: formFields.map((f) => ({
        fieldId: f.fieldId || '',
        fieldLabel: f.fieldLabel || '',
        value: f.value || '',
      })),
    };
  });

  const feStatus = mapBEStatusToFE(dto.status);
  const isBulk =
    dto.submissionMode?.toUpperCase() === 'BULK' ||
    (Array.isArray(dto.applicants) && dto.applicants.length > 1) ||
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

  const accountingOfficer = (() => {
    const claim = reversedHistories.find(
      (h) => (h.action && h.action.toLowerCase().includes('financial review')) ||
             (h.remarks && h.remarks.toLowerCase().includes('financial review started'))
    );
    if (claim?.staffName && claim.staffName.trim().length > 0) return claim.staffName.trim();
    return undefined;
  })();

  const cashierOfficer = (() => {
    const claim = reversedHistories.find(
      (h) => (h.action && h.action.toLowerCase().includes('payment verification')) ||
             (h.remarks && h.remarks.toLowerCase().includes('payment verification started'))
    );
    if (claim?.staffName && claim.staffName.trim().length > 0) return claim.staffName.trim();
    return undefined;
  })();

  const issuingOfficer = (() => {
    const claim = reversedHistories.find(
      (h) => (h.action && (h.action.toLowerCase().includes('document issuance started') || h.action.toLowerCase().includes('issuance started'))) ||
             (h.remarks && h.remarks.toLowerCase().includes('document release process started'))
    );
    if (claim?.staffName && claim.staffName.trim().length > 0) return claim.staffName.trim();
    return undefined;
  })();

  const evaluatingOfficer = (() => {
    if (endorsementState.isActivelyEndorsed && endorsementState.endorsedTo) {
      return endorsementState.endorsedTo;
    }

    // Find the latest evaluation entry by an Evaluator (excluding downstream return entries by accountant/cashier)
    const latestEval = reversedHistories.find((h) => {
      const roleLower = (h.staffRole || '').toLowerCase();
      const actionLower = (h.action || '').toLowerCase();
      const remLower = (h.remarks || '').toLowerCase();

      // Exclude return actions performed by accountant/cashier/releasing
      const isReturnByDownstream =
        roleLower.includes('accountant') ||
        roleLower.includes('cashier') ||
        actionLower.includes('soa return') ||
        actionLower.includes('returned by accountant') ||
        actionLower.includes('returned by cashier') ||
        remLower.includes('returned by accountant') ||
        remLower.includes('returned by cashier');

      if (isReturnByDownstream) return false;

      const isEvaluatorRole =
        roleLower.includes('evaluat') ||
        roleLower.includes('engineer') ||
        roleLower.includes('chief') ||
        roleLower.includes('director');

      const isEvaluationAction =
        actionLower.includes('evaluation started') ||
        actionLower.includes('approved & forwarded') ||
        actionLower.includes('forwarded to accountant') ||
        actionLower.includes('evaluated');

      const isForAccountantHandoff = h.toStatus === 'ForAccountant';
      const isEvaluatingState = h.toStatus === 'Evaluating' && !actionLower.includes('return');

      return (
        (isForAccountantHandoff || isEvaluatingState || isEvaluationAction || isEvaluatorRole) &&
        Boolean(h.staffName && h.staffName.trim().length > 0 && !isGenericOfficer(h.staffName, dto.office))
      );
    });

    if (latestEval?.staffName && latestEval.staffName.trim().length > 0) {
      return latestEval.staffName.trim();
    }

    if (dto.remarks && dto.remarks.toLowerCase().includes('evaluation started by')) {
      const match = dto.remarks.match(/evaluation started by\s+([^,.(]+)/i);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Secondary fallback in history: any evaluator entry with a staff name that isn't generic
    const anyEvaluator = reversedHistories.find((h) => {
      const roleLower = (h.staffRole || '').toLowerCase();
      const actionLower = (h.action || '').toLowerCase();
      return (
        (roleLower.includes('evaluat') || actionLower.includes('evaluat')) &&
        !roleLower.includes('accountant') &&
        !roleLower.includes('cashier') &&
        !(actionLower.includes('return') && roleLower.includes('accountant')) &&
        Boolean(h.staffName && h.staffName.trim().length > 0 && !isGenericOfficer(h.staffName, dto.office))
      );
    });

    if (anyEvaluator?.staffName && anyEvaluator.staffName.trim().length > 0) {
      return anyEvaluator.staffName.trim();
    }

    return undefined;
  })();

  const assignedTo = (() => {
    if (endorsementState.isActivelyEndorsed && endorsementState.endorsedTo) {
      return endorsementState.endorsedTo;
    }
    if (feStatus === 'Evaluating' || feStatus === 'Returned') {
      if (evaluatingOfficer && !isGenericOfficer(evaluatingOfficer, dto.office)) {
        return evaluatingOfficer;
      }
      return dto.office ?? '';
    }
    if (feStatus === 'ForAccountant') {
      if (accountingOfficer && !isGenericOfficer(accountingOfficer, dto.office)) {
        return accountingOfficer;
      }
      return dto.office ?? '';
    }
    if (feStatus === 'PendingPayment') {
      if (cashierOfficer && !isGenericOfficer(cashierOfficer, dto.office)) {
        return cashierOfficer;
      }
      return dto.office ?? '';
    }
    if (feStatus === 'ForIssuance') {
      if (issuingOfficer && !isGenericOfficer(issuingOfficer, dto.office)) {
        return issuingOfficer;
      }
      return dto.office ?? '';
    }
    return dto.office ?? '';
  })();

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
    endorsedTo: endorsementState.endorsedTo,
    endorsedBy: endorsementState.endorsedBy,
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
    history: (() => {
      const list: AuditTrailEntry[] = [];
      const hasInitialSubmission = dto.histories?.some(
        (h) => h.toStatus === 'Submitted' || (h.action !== null && h.action !== undefined && h.action.toLowerCase().includes('submit'))
      );

      if (hasInitialSubmission !== true && dto.createdAt) {
        const submitter =
          filingUser?.name ||
          applicantName ||
          'Applicant';
        const modeText = dto.submissionMode ? ` (${dto.submissionMode})` : '';
        list.push({
          id: `init-${dto.id}`,
          action: `Application Submitted${modeText}`,
          staff: submitter,
          role: 'Filing Submitter',
          status: 'Submitted',
          timestamp: new Date(dto.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
        });
      }

      if (dto.histories && dto.histories.length > 0) {
        for (const h of dto.histories) {
          const rawAction = h.action && h.action.trim().length > 0
            ? h.action
            : (h.toStatus ? `Status: ${h.toStatus}` : 'Application Event');

          let derivedRole = h.staffRole || '';
          const actionLower = rawAction.toLowerCase();
          const toStatusLower = (h.toStatus || '').toLowerCase();
          if (!derivedRole) {
            if (actionLower.includes('approve') || toStatusLower.includes('approve')) {
              derivedRole = 'Approving Officer';
            } else if (actionLower.includes('return') || actionLower.includes('decline') || toStatusLower.includes('return') || toStatusLower.includes('decline')) {
              derivedRole = 'Return Officer';
            } else if (actionLower.includes('accountant') || toStatusLower.includes('accountant')) {
              derivedRole = 'Accountant / Assessor';
            } else if (actionLower.includes('cashier') || actionLower.includes('payment') || toStatusLower.includes('payment')) {
              derivedRole = 'Cashiering Officer';
            } else if (actionLower.includes('evaluat') || toStatusLower.includes('evaluat')) {
              derivedRole = 'Evaluating Officer';
            } else if (actionLower.includes('submit')) {
              derivedRole = 'Filing Submitter';
            } else {
              derivedRole = 'Processing Officer';
            }
          }

          list.push({
            id: h.id,
            action: rawAction,
            staff: h.staffName || 'Authorized Officer',
            role: derivedRole,
            remarks: h.remarks || undefined,
            status: h.toStatus || undefined,
            timestamp: h.timestamp
              ? new Date(h.timestamp).toLocaleString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              : '',
          });
        }
      }

      return list;
    })(),
    note: dto.remarks ?? '',
  };
}
