import { ApplicationDto, ApplicationSummaryDto, ApplicationActivityDto, extractOrNumbers, formatOrDisplay } from '@edge/api';
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
  hasExplicitAccountantClaim,
  hasExplicitCashierClaim,
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
  hasExplicitAccountantClaim,
  hasExplicitCashierClaim,
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

function normalizeBirthDate(val?: string | null): string {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed || trimmed.startsWith('0001-01-01') || trimmed.startsWith('1900-01-01')) return '';
  if (trimmed.includes('T')) {
    return trimmed.split('T')[0] ?? '';
  }
  return trimmed;
}

const SUFFIX_SET = new Set(['jr', 'jr.', 'sr', 'sr.', 'ii', 'iii', 'iv', 'v']);
const SURNAME_PREFIX_SET = new Set(['de', 'del', 'dela', 'delos', 'la', 'los', 'las', 'san', 'sta', 'sta.', 'st', 'st.', 'van', 'von']);

export function splitFullName(fullName?: string | null): {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
} {
  if (!fullName || typeof fullName !== 'string' || !isValidName(fullName)) {
    return { firstName: '', middleName: '', lastName: '', suffix: '' };
  }
  const tokens = fullName.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return { firstName: '', middleName: '', lastName: '', suffix: '' };
  }

  let suffix = '';
  const lastToken = tokens[tokens.length - 1];
  if (tokens.length > 1 && lastToken && SUFFIX_SET.has(lastToken.toLowerCase())) {
    suffix = tokens.pop() ?? '';
  }

  if (tokens.length === 1) {
    return { firstName: tokens[0] ?? '', middleName: '', lastName: '', suffix };
  }
  if (tokens.length === 2) {
    return { firstName: tokens[0] ?? '', middleName: '', lastName: tokens[1] ?? '', suffix };
  }

  // Check for compound surname like "Dela Cruz" or "De Los Santos"
  let surnameStartIdx = tokens.length - 1;
  while (
    surnameStartIdx > 1 &&
    tokens[surnameStartIdx - 1] &&
    SURNAME_PREFIX_SET.has((tokens[surnameStartIdx - 1] ?? '').toLowerCase())
  ) {
    surnameStartIdx--;
  }

  const lastName = tokens.slice(surnameStartIdx).join(' ');
  const remaining = tokens.slice(0, surnameStartIdx);
  if (remaining.length === 1) {
    return { firstName: remaining[0] ?? '', middleName: '', lastName, suffix };
  }
  const middleName = remaining[remaining.length - 1] ?? '';
  const firstName = remaining.slice(0, -1).join(' ');
  return { firstName, middleName, lastName, suffix };
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
  if (parts.length >= 6) {
    return {
      street: parts[0],
      barangay: parts[1],
      city: parts[2],
      province: parts[3],
      region: parts[4],
      zipCode: parts[parts.length - 1],
    };
  } else if (parts.length === 5) {
    const lastPart = parts[4] ?? '';
    const isZip = /^\d{4,6}$/.test(lastPart);
    return {
      street: parts[0],
      barangay: parts[1],
      city: parts[2],
      province: parts[3],
      region: isZip ? undefined : lastPart,
      zipCode: isZip ? lastPart : undefined,
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

  const orderedTrails = 'correctionAuditTrails' in dto && Array.isArray(dto.correctionAuditTrails)
    ? [...dto.correctionAuditTrails].sort((a, b) => new Date(b.correctedAt || 0).getTime() - new Date(a.correctedAt || 0).getTime())
    : [];
  const findLatestTrail = (fieldName: string): string | undefined => {
    const match = orderedTrails.find((t) => (t.fieldName || '').toLowerCase() === fieldName.toLowerCase());
    return match && typeof match.newValue === 'string' && match.newValue.trim().length > 0
      ? match.newValue.trim()
      : undefined;
  };

  const brgyPrimary =
    findLatestTrail('Barangay') ||
    primaryDetail?.barangayName ||
    primaryDetail?.barangay ||
    findPrimaryFv((lbl) => lbl.includes('barangay')) ||
    parsedPrimaryAddr.barangay ||
    '';
  const cityPrimary =
    findLatestTrail('City') ||
    primaryDetail?.cityMunicipalityName ||
    primaryDetail?.city ||
    findPrimaryFv((lbl) => lbl.includes('city') || lbl.includes('municipality')) ||
    parsedPrimaryAddr.city ||
    '';
  const provPrimary =
    findLatestTrail('Province') ||
    primaryDetail?.provinceName ||
    primaryDetail?.province ||
    findPrimaryFv((lbl) => lbl.includes('province')) ||
    parsedPrimaryAddr.province ||
    '';
  const regPrimary =
    findLatestTrail('Region') ||
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
  const dobPrimary = normalizeBirthDate(primaryDetail?.birthDate) || normalizeBirthDate(findPrimaryFv((lbl) => lbl.includes('birth'))) || '';
  const sexPrimary = (primaryDetail?.sex && primaryDetail.sex.trim().length > 0 ? primaryDetail.sex.trim() : '') || findPrimaryFv((lbl) => lbl.includes('sex') || lbl.includes('gender')) || '';
  const natPrimary = (primaryDetail?.nationality && primaryDetail.nationality.trim().length > 0 ? primaryDetail.nationality.trim() : '') || findPrimaryFv((lbl) => lbl.includes('nationality') || lbl.includes('citizenship')) || 'Filipino';
  const civilPrimary =
    findLatestTrail('CivilStatus') ||
    (primaryDetail?.civilStatus && primaryDetail.civilStatus.trim().length > 0 ? primaryDetail.civilStatus.trim() : '') ||
    findPrimaryFv((lbl) => lbl.includes('civil') || lbl.includes('marital')) ||
    '';

  const primaryStreet =
    (parsedPrimaryAddr.street && parsedPrimaryAddr.street !== rawPrimaryAddress)
      ? parsedPrimaryAddr.street
      : rawPrimaryAddress;
  const contactEmail =
    primaryDetail?.emailAddress ||
    primaryDetail?.email ||
    findPrimaryFv((lbl) => (lbl.includes('email') || lbl.includes('e-mail')) && !lbl.includes('company')) ||
    rawFilingUser?.email ||
    '';
  const contactPhone =
    primaryDetail?.contactNumber ||
    findPrimaryFv((lbl) => (lbl.includes('contact') || lbl.includes('mobile') || lbl.includes('phone') || lbl.includes('telephone')) && !lbl.includes('company')) ||
    rawFilingUser?.company?.contactNumber ||
    '';

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

    const itemComp = appItem.company ?? ad?.company ?? (idx === 0 ? rawFilingUser?.company : undefined);
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

    const firstNameFromFv = findFv((lbl) => lbl === 'first name' || lbl === 'given name' || lbl.includes('first name'));
    const middleNameFromFv = findFv((lbl) => lbl === 'middle name' || lbl === 'middle initial' || lbl.includes('middle name'));
    const lastNameFromFv = findFv((lbl) => lbl === 'last name' || lbl === 'surname' || lbl === 'family name' || lbl.includes('last name'));
    const suffixFromFv = findFv((lbl) => lbl === 'suffix' || lbl.includes('suffix') || lbl.includes('extension'));

    const rawAdFirst = isValidName(ad?.firstName) ? ad.firstName.trim() : '';
    const rawAdMiddle = ad?.middleName ? ad.middleName.trim() : '';
    const rawAdLast = isValidName(ad?.lastName) ? ad.lastName.trim() : '';
    const rawAdSuffix = ad?.suffix ? ad.suffix.trim() : '';

    const parsedFallbackName = splitFullName(
      (!rawAdLast && rawAdFirst.includes(' ')) ? rawAdFirst : resolvedName
    );

    const itemFirstName =
      (rawAdLast ? rawAdFirst : (rawAdFirst && !rawAdFirst.includes(' ') ? rawAdFirst : '')) ||
      (firstNameFromFv ? firstNameFromFv.trim() : '') ||
      parsedFallbackName.firstName ||
      rawAdFirst;
    const itemMiddleName =
      rawAdMiddle ||
      (middleNameFromFv ? middleNameFromFv.trim() : '') ||
      parsedFallbackName.middleName ||
      '';
    const itemLastName =
      rawAdLast ||
      (lastNameFromFv ? lastNameFromFv.trim() : '') ||
      parsedFallbackName.lastName ||
      '';
    const itemSuffix =
      rawAdSuffix ||
      (suffixFromFv ? suffixFromFv.trim() : '') ||
      parsedFallbackName.suffix ||
      '';

    const emailFromFv = findFv((lbl) => (lbl.includes('email') || lbl.includes('e-mail')) && !lbl.includes('company'));
    const contactFromFv = findFv((lbl) => (lbl.includes('contact') || lbl.includes('mobile') || lbl.includes('phone') || lbl.includes('telephone')) && !lbl.includes('company'));
    const addrFromFv = findFv((lbl) => lbl === 'address' || lbl.includes('street') || lbl.includes('house') || lbl.includes('unit no'));
    const brgyFromFv = findFv((lbl) => lbl.includes('barangay'));
    const cityFromFv = findFv((lbl) => lbl.includes('city') || lbl.includes('municipality'));
    const provFromFv = findFv((lbl) => lbl.includes('province'));
    const regFromFv = findFv((lbl) => lbl.includes('region'));
    const zipFromFv = findFv((lbl) => lbl.includes('zip') || lbl.includes('postal'));
    const dobFromFv = findFv((lbl) => lbl.includes('birth') || lbl === 'dob');
    const sexFromFv = findFv((lbl) => lbl.includes('sex') || lbl.includes('gender'));
    const natFromFv = findFv((lbl) => lbl.includes('nationality') || lbl.includes('citizenship'));
    const civilFromFv = findFv((lbl) => lbl.includes('civil') || lbl.includes('marital'));
    const pobFromFv = findFv((lbl) => lbl.includes('place of birth') || lbl.includes('birthplace'));

    const rawItemAddress = ad?.address || addrFromFv || (idx === 0 ? rawPrimaryAddress : '') || '';
    const parsedItemAddr = parseAddressSegments(rawItemAddress);
    const itemStreet = (parsedItemAddr.street && parsedItemAddr.street !== rawItemAddress)
      ? parsedItemAddr.street
      : rawItemAddress;
    const itemBarangay = (idx === 0 ? findLatestTrail('Barangay') : undefined) || ad?.barangayName || ad?.barangay || brgyFromFv || parsedItemAddr.barangay || (idx === 0 ? brgyPrimary : '') || '';
    const itemCity = (idx === 0 ? findLatestTrail('City') : undefined) || ad?.cityMunicipalityName || ad?.city || cityFromFv || parsedItemAddr.city || (idx === 0 ? cityPrimary : '') || '';
    const itemProvince = (idx === 0 ? findLatestTrail('Province') : undefined) || ad?.provinceName || ad?.province || provFromFv || parsedItemAddr.province || (idx === 0 ? provPrimary : '') || '';
    const itemRegion = (idx === 0 ? findLatestTrail('Region') : undefined) || ad?.regionName || ad?.region || regFromFv || parsedItemAddr.region || (idx === 0 ? regPrimary : '') || '';
    const itemZip = ad?.zipCode || zipFromFv || parsedItemAddr.zipCode || (idx === 0 ? zipPrimary : '') || '';
    const itemEmail = ad?.emailAddress || ad?.email || emailFromFv || (idx === 0 ? contactEmail : '') || '';
    const itemContact = ad?.contactNumber || contactFromFv || (idx === 0 ? contactPhone : '') || '';
    const itemDob = normalizeBirthDate(ad?.birthDate) || normalizeBirthDate(dobFromFv) || (idx === 0 ? dobPrimary : '') || '';
    const itemSex = (ad?.sex && ad.sex.trim().length > 0 ? ad.sex.trim() : '') || (sexFromFv ? sexFromFv.trim() : '') || (idx === 0 ? sexPrimary : '') || '';
    const itemNat = (ad?.nationality && ad.nationality.trim().length > 0 ? ad.nationality.trim() : '') || (natFromFv ? natFromFv.trim() : '') || (idx === 0 ? natPrimary : '') || 'Filipino';
    const itemCivil = (idx === 0 ? findLatestTrail('CivilStatus') : undefined) || (ad?.civilStatus && ad.civilStatus.trim().length > 0 ? ad.civilStatus.trim() : '') || (civilFromFv ? civilFromFv.trim() : '') || (idx === 0 ? civilPrimary : '') || '';

    const itemApplicantType: 'Individual' | 'Company' =
      appItem.applicantType === 'Company' ? 'Company' : 'Individual';

    let itemStatus: 'Complete' | 'Incomplete' | 'ForEndorsement' = 'Complete';
    if (appItem.status === 'Incomplete' || appItem.status === 'ForEndorsement') {
      itemStatus = appItem.status;
    }

    const elementFromFv = findFv((lbl) => lbl.includes('element') || lbl.includes('station class'));
    const resolvedElement =
      (typeof appItem.element === 'string' && appItem.element.trim().length > 0 ? appItem.element.trim() : undefined) ??
      (typeof appItem.elements === 'string' && appItem.elements.trim().length > 0 ? appItem.elements.trim() : undefined) ??
      (typeof dto.element === 'string' && dto.element.trim().length > 0 ? dto.element.trim() : undefined) ??
      (typeof dto.elements === 'string' && dto.elements.trim().length > 0 ? dto.elements.trim() : undefined) ??
      elementFromFv ??
      undefined;

    const appTypeFromFv = findFv((lbl, id) =>
      id === 'fd000000-0000-0000-0000-000000000007' ||
      id === 'fd000000-0000-0000-0000-000000000008' ||
      lbl === 'type of application' ||
      lbl === 'application type' ||
      lbl === 'examinee type' ||
      lbl === 'type of examinee' ||
      lbl.includes('type of application') ||
      lbl.includes('application type') ||
      lbl.includes('examinee type')
    );

    const variantFromFv = findFv((lbl, id) =>
      id === 'fd000000-0000-0000-0000-000000000014' ||
      id === 'fd000000-0000-0000-0000-000000000024' ||
      lbl === 'service variant' ||
      lbl === 'variant' ||
      lbl.includes('variant name') ||
      lbl.includes('permit / license type') ||
      lbl.includes('type of certificate') ||
      lbl.includes('application variant')
    );

    const matchedDtoService = dto.services?.find((s) => s.applicantId === appItem.id) ?? dto.services?.[idx] ?? dto.services?.[0];

    const resolvedItemVariantName =
      (typeof appItem.serviceVariantName === 'string' && appItem.serviceVariantName.trim().length > 0 ? appItem.serviceVariantName.trim() : undefined) ??
      (typeof matchedDtoService?.serviceVariantName === 'string' && matchedDtoService.serviceVariantName.trim().length > 0 ? matchedDtoService.serviceVariantName.trim() : undefined) ??
      (typeof dto.serviceVariantName === 'string' && dto.serviceVariantName.trim().length > 0 ? dto.serviceVariantName.trim() : undefined) ??
      variantFromFv ??
      undefined;

    const resolvedItemAppType =
      (typeof appItem.applicationType === 'string' && appItem.applicationType.trim().length > 0 ? appItem.applicationType.trim() : undefined) ??
      (typeof matchedDtoService?.applicationType === 'string' && matchedDtoService.applicationType.trim().length > 0 ? matchedDtoService.applicationType.trim() : undefined) ??
      (typeof dto.serviceVariantType === 'string' && dto.serviceVariantType.trim().length > 0 ? dto.serviceVariantType.trim() : undefined) ??
      appTypeFromFv ??
      undefined;

    return {
      id: appItem.id || `app-${idx}`,
      name: resolvedName,
      applicantType: itemApplicantType,
      status: itemStatus,
      evaluationRemarks: appItem.evaluationRemarks ?? '',
      serviceId: appItem.serviceId,
      serviceVariantId: appItem.serviceVariantId,
      serviceVariantName: resolvedItemVariantName,
      element: resolvedElement,
      elements: resolvedElement,
      applicationType: resolvedItemAppType,
      submissionId: appItem.submissionId,
      contactNumber: itemContact,
      email: itemEmail,
      address: itemStreet || rawItemAddress,
      streetAddress: itemStreet || rawItemAddress,
      company: itemCompanyDetails,
      companyDetails: itemCompanyDetails,
      basicInfo: {
        firstName: itemFirstName,
        middleName: itemMiddleName,
        lastName: itemLastName,
        extensionName: itemSuffix,
        dob: itemDob,
        placeOfBirth: pobFromFv ?? '',
        sex: itemSex,
        weight: ad?.weight ?? 0,
        height: ad?.height ?? 0,
        nationality: itemNat,
        civilStatus: itemCivil,
        employmentStatus: '',
        occupation: '',
      },
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
      dob: itemDob,
      sex: itemSex,
      nationality: itemNat,
      civilStatus: itemCivil,
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

  const hasAccountantClaim = hasExplicitAccountantClaim(histories);
  const hasCashierClaim = hasExplicitCashierClaim(histories);

  const evaluatingOfficer =
    ('evaluatingOfficer' in dto && typeof dto.evaluatingOfficer === 'string' && dto.evaluatingOfficer.trim().length > 0)
      ? dto.evaluatingOfficer.trim()
      : resolveEvaluatingOfficer(dto, reversedHistories, endorsementState);

  const rawAccountingOfficer =
    ('accountingOfficer' in dto && typeof dto.accountingOfficer === 'string' && dto.accountingOfficer.trim().length > 0)
      ? dto.accountingOfficer.trim()
      : resolveAccountingOfficer(reversedHistories);

  const accountingOfficer =
    !hasAccountantClaim && feStatus === 'ForAccountant'
      ? undefined
      : (!hasAccountantClaim &&
         rawAccountingOfficer &&
         evaluatingOfficer &&
         rawAccountingOfficer.trim().toLowerCase() === evaluatingOfficer.trim().toLowerCase()
          ? undefined
          : rawAccountingOfficer);

  const rawCashierOfficer =
    ('cashierOfficer' in dto && typeof dto.cashierOfficer === 'string' && dto.cashierOfficer.trim().length > 0)
      ? dto.cashierOfficer.trim()
      : resolveCashierOfficer(reversedHistories);

  const cashierOfficer =
    !hasCashierClaim && feStatus === 'PendingPayment'
      ? undefined
      : rawCashierOfficer;

  const issuingOfficer =
    ('issuingOfficer' in dto && typeof dto.issuingOfficer === 'string' && dto.issuingOfficer.trim().length > 0)
      ? dto.issuingOfficer.trim()
      : resolveIssuingOfficer(reversedHistories);

  const assignedTo = resolveAssignedTo(
    feStatus,
    evaluatingOfficer,
    accountingOfficer,
    cashierOfficer,
    issuingOfficer,
    endorsementState,
    dto.office,
    hasAccountantClaim,
    hasCashierClaim
  );

  const activeOp = dto.ordersOfPayment && dto.ordersOfPayment.length > 0
    ? [...dto.ordersOfPayment].sort((a, b) => {
        const hasOrA = Boolean(a.officialReceiptNumber && a.officialReceiptNumber.trim().length > 0) || a.status === 'Paid';
        const hasOrB = Boolean(b.officialReceiptNumber && b.officialReceiptNumber.trim().length > 0) || b.status === 'Paid';
        if (hasOrA && !hasOrB) return -1;
        if (!hasOrA && hasOrB) return 1;

        const histA = a.histories && a.histories.length > 0 ? a.histories[a.histories.length - 1] : undefined;
        const histB = b.histories && b.histories.length > 0 ? b.histories[b.histories.length - 1] : undefined;
        const timeA = histA?.timestamp ? new Date(histA.timestamp).getTime() : (a.paidAt ? new Date(a.paidAt).getTime() : 0);
        const timeB = histB?.timestamp ? new Date(histB.timestamp).getTime() : (b.paidAt ? new Date(b.paidAt).getTime() : 0);
        return timeB - timeA;
      })[0]
    : undefined;

  const directOrNumber = 'officialReceiptNumber' in dto && typeof dto.officialReceiptNumber === 'string'
    ? dto.officialReceiptNumber
    : '';

  const rawOpOrNumber = (activeOp?.officialReceiptNumber && typeof activeOp.officialReceiptNumber === 'string')
    ? activeOp.officialReceiptNumber.trim()
    : '';

  const resolvedOrNumbers: string[] = extractOrNumbers(
    'orNumbers' in dto && Array.isArray(dto.orNumbers) ? dto.orNumbers : undefined,
    directOrNumber,
    rawOpOrNumber
  );

  const resolvedOrNumber = formatOrDisplay(resolvedOrNumbers);

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
      hasAccountantHistory: histories.some((h) => {
        const role = (h.staffRole || '').toLowerCase();
        const act = (h.action || '').toLowerCase();
        const rem = (h.remarks || '').toLowerCase();
        if (
          act.includes('forwarded to accountant') ||
          act.includes('forward to accountant') ||
          act.includes('status updated to foraccountant') ||
          act.includes('approved & forwarded') ||
          act.includes('order of payment initialized') ||
          act.includes('assessment approved by evaluator') ||
          rem.includes('forwarded to accountant') ||
          rem.includes('endorsed for order of payment review') ||
          role.includes('evaluat') ||
          role.includes('engineer')
        ) {
          return false;
        }
        return role.includes('accountant') || act.includes('accountant') || rem.includes('accountant') || act.includes('financial review');
      }),
      hasCashierHistory: histories.some((h) => (h.staffRole || '').toLowerCase().includes('cashier') || (h.action || '').toLowerCase().includes('cashier') || (h.remarks || '').toLowerCase().includes('cashier')),
      remarks: dto.remarks ?? undefined,
      category: resolvedCategory,
    }),
    applicationType: isBulk ? 'BULK' : 'SINGLE',
    mode: isBulk ? 'Bulk' : 'Single',
    serviceId: dto.serviceId ?? dto.services?.[0]?.serviceId ?? '',
    serviceName: resolvedServiceName,
    serviceCategory: resolvedCategory,
    serviceVariantName: dto.serviceVariantName ?? dto.services?.[0]?.serviceVariantName ?? applicantsList[0]?.serviceVariantName ?? '',
    serviceVariantType: dto.serviceVariantType ?? dto.services?.[0]?.applicationType ?? applicantsList[0]?.applicationType ?? undefined,
    element: dto.element ?? dto.elements ?? applicantsList[0]?.element ?? applicantsList[0]?.elements ?? dto.services?.[0]?.element ?? undefined,
    elements: dto.elements ?? dto.element ?? applicantsList[0]?.elements ?? applicantsList[0]?.element ?? dto.services?.[0]?.elements ?? undefined,
    office: dto.office ?? '',
    applicantsList,
    formFieldValues: (dto.applicants?.[0]?.formFieldValues ?? applicantsList[0]?.formFieldValues ?? []).map((f) => ({
      fieldId: f.fieldId || '',
      fieldLabel: f.fieldLabel || '',
      value: f.value || '',
    })),
    services: dto.services?.length
      ? dto.services.map((s) => {
          const matchedApp = applicantsList.find((a) => a.id === s.applicantId) || applicantsList[0];
          const svcElement = s.element ?? s.elements ?? matchedApp?.element ?? matchedApp?.elements ?? dto.element ?? dto.elements ?? undefined;
          const svcAppType = s.applicationType ?? matchedApp?.applicationType ?? dto.serviceVariantType ?? undefined;
          return {
            id: s.id,
            applicantId: s.applicantId,
            serviceId: s.serviceId,
            serviceName: s.serviceName ?? resolvedServiceName,
            serviceCategory: s.serviceCategory ?? resolvedCategory,
            serviceVariantId: s.serviceVariantId,
            serviceVariantName: s.serviceVariantName ?? matchedApp?.serviceVariantName ?? dto.serviceVariantName,
            applicationType: svcAppType,
            element: svcElement,
            elements: svcElement,
            submissionId: s.submissionId,
          };
        })
      : applicantsList.map((a) => ({
          id: a.id,
          applicantId: a.id,
          serviceId: a.serviceId ?? '',
          serviceName: resolvedServiceName,
          serviceCategory: resolvedCategory,
          serviceVariantId: a.serviceVariantId,
          serviceVariantName: a.serviceVariantName ?? dto.serviceVariantName ?? '',
          applicationType: a.applicationType ?? dto.serviceVariantType ?? undefined,
          element: a.element ?? a.elements ?? dto.element ?? dto.elements ?? undefined,
          elements: a.elements ?? a.element ?? dto.elements ?? dto.element ?? undefined,
          submissionId: a.submissionId,
        })),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt || dto.lastModifiedAt || dto.createdAt,
    lastModifiedAt: dto.lastModifiedAt,
    dateLabel: formatDateLabel(dto.updatedAt || dto.lastModifiedAt || dto.createdAt),
    assignedTo,
    evaluatingOfficer: evaluatingOfficer || dto.evaluatingOfficer,
    accountingOfficer,
    cashierOfficer,
    issuingOfficer: issuingOfficer || dto.issuingOfficer,
    soaId: activeSoa?.id,
    statementOfAccountId: activeSoa?.id,
    soaNumber: activeSoa?.soaNumber ?? ('soaNumber' in dto && typeof dto.soaNumber === 'string' ? dto.soaNumber : undefined),
    officialReceiptNumber: resolvedOrNumber.length > 0 ? resolvedOrNumber : undefined,
    soaStatus: activeSoa?.status,
    soaIssuedToName: activeSoa?.issuedToName,
    soaIssuedToAddress: activeSoa?.issuedToAddress ?? undefined,
    soaIssuedToType: activeSoa?.issuedToType === 'Company' ? 'Company' : 'Individual',
    soaDueDate: activeSoa?.dueDate,
    soaCreatedAt: activeSoa?.createdAt,
    soaPreparedByName: activeSoa?.preparedByName,
    soaPreparedByTitle: activeSoa?.preparedByTitle,
    soaApprovedByName: activeSoa?.approvedByName,
    soaApprovedByTitle: activeSoa?.approvedByTitle,
    soaRemarks: (activeSoa?.remarks && activeSoa.remarks.trim().length > 0)
      ? activeSoa.remarks
      : (activeSoa?.soaNoteText ?? undefined),
    soaNoteId: activeSoa?.soaNoteId ?? undefined,
    soaNoteText: activeSoa?.soaNoteText ?? undefined,
    endorsedTo: endorsementState.endorsedTo,
    endorsedBy: endorsementState.endorsedBy,
    isBeingViewed: false,
    isUrgent: false,
    isPinned: Boolean(dto.isPinned),
    isArchived: Boolean(dto.isArchived),
    intent: (dto.intent === 'AssessmentOnly' || (typeof dto.intent === 'number' && dto.intent === 1)) ? 'AssessmentOnly' : 'Regular',
    isAssessmentOnly: dto.intent === 'AssessmentOnly' || (typeof dto.intent === 'number' && dto.intent === 1),
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
    basicInfo: (() => {
      const primaryBasic = applicantsList[0]?.basicInfo;
      const fallbackSplit = splitFullName(applicantName);
      return {
        lastName: primaryBasic?.lastName || primaryDetail?.lastName || fallbackSplit.lastName || (rawFilingUser?.name?.split(' ').slice(1).join(' ') ?? ''),
        firstName: primaryBasic?.firstName || primaryDetail?.firstName || fallbackSplit.firstName || (rawFilingUser?.name?.split(' ')[0] ?? ''),
        middleName: primaryBasic?.middleName || primaryDetail?.middleName || fallbackSplit.middleName || '',
        extensionName: primaryBasic?.extensionName || primaryDetail?.suffix || fallbackSplit.suffix || '',
        dob: primaryBasic?.dob || dobPrimary,
        placeOfBirth: primaryBasic?.placeOfBirth || '',
        sex: primaryBasic?.sex || sexPrimary,
        weight: primaryDetail?.weight ?? 0,
        height: primaryDetail?.height ?? 0,
        nationality: primaryBasic?.nationality || natPrimary,
        civilStatus: primaryBasic?.civilStatus || civilPrimary,
        employmentStatus: '',
        occupation: '',
      };
    })(),
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
    totalAmountDue: activeSoa?.totalAmount ?? (('totalAmountDue' in dto && typeof dto.totalAmountDue === 'number') ? dto.totalAmountDue : 0),
    dueDate: activeSoa?.dueDate
      ? (activeSoa.dueDate.includes('T') ? (activeSoa.dueDate.split('T')[0] ?? '') : activeSoa.dueDate)
      : '',
    payment: (() => {
      const directAmountPaid = 'amountPaid' in dto && typeof dto.amountPaid === 'number'
        ? dto.amountPaid
        : 0;
      const directPaidAt = 'paidAt' in dto && typeof dto.paidAt === 'string'
        ? dto.paidAt
        : undefined;

      const directOpId = 'orderOfPaymentId' in dto && typeof dto.orderOfPaymentId === 'string' ? dto.orderOfPaymentId : undefined;
      const directOpNumber = 'opNumber' in dto && typeof dto.opNumber === 'string' ? dto.opNumber : undefined;
      const directPaymentMethod = 'paymentMethod' in dto && typeof dto.paymentMethod === 'string' ? dto.paymentMethod : undefined;
      const directCheckNumber = 'checkNumber' in dto && typeof dto.checkNumber === 'string' ? dto.checkNumber : '';
      const directCheckName = 'checkName' in dto && typeof dto.checkName === 'string' ? dto.checkName : '';
      const directCheckBank = 'checkBank' in dto && typeof dto.checkBank === 'string' ? dto.checkBank : '';
      const directCheckDate = 'checkDate' in dto && typeof dto.checkDate === 'string' ? (dto.checkDate.split('T')[0] ?? '') : '';
      const directPayorName = 'payorName' in dto && typeof dto.payorName === 'string' ? dto.payorName : '';
      const directPaymentRemarks = 'paymentRemarks' in dto && typeof dto.paymentRemarks === 'string' ? dto.paymentRemarks : '';

      const resolvedAmount = (activeOp?.amountReceived && activeOp.amountReceived > 0)
        ? activeOp.amountReceived
        : (directAmountPaid > 0 ? directAmountPaid : 0);

      const resolvedPaidAt = activeOp?.paidAt ?? directPaidAt;

      const effectivePayorName = activeOp?.checkName || directPayorName || directCheckName;
      const effectiveRemarks = activeOp?.remarks || directPaymentRemarks || ('remarks' in dto && typeof dto.remarks === 'string' ? dto.remarks : '');
      const effectivePaymentMethod = activeOp?.paymentMethod || directPaymentMethod;

      return {
        orderOfPaymentId: activeOp?.id ?? directOpId,
        opNumber: activeOp?.opNumber ?? directOpNumber,
        amountReceived: resolvedAmount,
        method: effectivePaymentMethod === 'Check' ? 'check' : 'cash',
        paymentMethod: effectivePaymentMethod,
        orNumber: resolvedOrNumber,
        orNumbers: resolvedOrNumbers,
        checkNumber: activeOp?.checkNumber ?? directCheckNumber,
        checkName: activeOp?.checkName ?? directCheckName,
        checkBank: activeOp?.checkBank ?? directCheckBank,
        checkDate: activeOp?.checkDate ? (activeOp.checkDate.split('T')[0] ?? '') : directCheckDate,
        payorName: effectivePayorName,
        remarks: effectiveRemarks,
        paidAt: resolvedPaidAt,
      };
    })(),
    orNumbers: resolvedOrNumbers,
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

export function mapActivityDtoToUI(
  dto: ApplicationActivityDto,
  role?: string
): ApplicationData {
  const feStatus = mapBEStatusToFE(dto.status);
  const applicantType: 'Individual' | 'Company' = dto.applicantType === 'Company' ? 'Company' : 'Individual';
  const applicationType: 'SINGLE' | 'BULK' = dto.submissionMode === 'Bulk' ? 'BULK' : 'SINGLE';
  const category = parseApplicationCategory(dto.serviceCategory, dto.serviceName);

  const permitTitle = dto.serviceVariantName && dto.serviceVariantName.trim().length > 0
    ? `${dto.serviceName} - ${dto.serviceVariantName}`
    : dto.serviceName;

  const queueTab = parseBackendQueueTab(dto.queueTab) ?? deriveQueueTab(feStatus, role);

  return {
    id: dto.id,
    referenceNumber: dto.referenceNumber || dto.applicationNumber || '',
    applicationNumber: dto.applicationNumber || dto.referenceNumber || '',
    applicant: dto.applicantName || 'Applicant',
    applicantType,
    permitTitle: permitTitle || 'Application',
    category,
    status: feStatus,
    queueTab,
    createdAt: dto.submittedAt,
    updatedAt: dto.updatedAt ?? dto.submittedAt,
    lastModifiedAt: dto.updatedAt,
    dateLabel: formatDateLabel(dto.submittedAt),
    assignedTo: dto.assignedTo || dto.officerInCharge || '',
    evaluatingOfficer: dto.evaluatingOfficer && dto.evaluatingOfficer.trim().length > 0 ? dto.evaluatingOfficer.trim() : undefined,
    accountingOfficer: dto.accountingOfficer && dto.accountingOfficer.trim().length > 0 ? dto.accountingOfficer.trim() : undefined,
    cashierOfficer: dto.cashierOfficer && dto.cashierOfficer.trim().length > 0 ? dto.cashierOfficer.trim() : undefined,
    issuingOfficer: dto.issuingOfficer && dto.issuingOfficer.trim().length > 0 ? dto.issuingOfficer.trim() : undefined,
    endorsedTo: dto.endorsedTo && dto.endorsedTo.trim().length > 0 ? dto.endorsedTo.trim() : undefined,
    applicationType,
    isBeingViewed: false,
    isUrgent: false,
    isPinned: Boolean(dto.isPinned),
    isArchived: Boolean(dto.isArchived),
    serviceName: dto.serviceName,
    serviceCategory: dto.serviceCategory && dto.serviceCategory.trim().length > 0 ? dto.serviceCategory.trim() : undefined,
    serviceVariantName: dto.serviceVariantName && dto.serviceVariantName.trim().length > 0 ? dto.serviceVariantName.trim() : undefined,
    element: dto.element && dto.element.trim().length > 0 ? dto.element.trim() : undefined,
    elements: dto.element && dto.element.trim().length > 0 ? dto.element.trim() : undefined,
    office: dto.fieldOffice || '',
    mode: dto.submissionMode,
    officialReceiptNumber: dto.officialReceiptNumber && dto.officialReceiptNumber.trim().length > 0 ? dto.officialReceiptNumber.trim() : undefined,
    orNumbers: dto.officialReceiptNumber && dto.officialReceiptNumber.trim().length > 0 ? [dto.officialReceiptNumber.trim()] : [],
    payment: {
      orderOfPaymentId: undefined,
      opNumber: undefined,
      amountReceived: 0,
      method: 'cash',
      paymentMethod: undefined,
      orNumber: dto.officialReceiptNumber ?? '',
      orNumbers: dto.officialReceiptNumber ? [dto.officialReceiptNumber] : [],
      checkNumber: '',
      checkName: '',
      checkBank: '',
      checkDate: '',
      payorName: '',
      remarks: '',
      paidAt: undefined,
    },
    address: {
      barangay: '',
      province: '',
      city: '',
      zipCode: '',
    },
    contactDetails: {
      contactNumber: '',
      email: '',
    },
    basicInfo: {
      lastName: '',
      firstName: '',
      middleName: '',
      extensionName: '',
      dob: '',
      placeOfBirth: '',
      sex: '',
      weight: 0,
      height: 0,
      nationality: 'Filipino',
      civilStatus: '',
      employmentStatus: '',
      occupation: '',
    },
    applicationDetails: {
      noOfYears: 0,
      permitCategory: '',
      formType: '',
      submittedAt: dto.submittedAt,
    },
    requirements: [],
    forms: [],
    soaItems: [],
    totalAmountDue: 0,
    dueDate: '',
    correctionAuditTrail: [],
    history: [],
    note: '',
  };
}
