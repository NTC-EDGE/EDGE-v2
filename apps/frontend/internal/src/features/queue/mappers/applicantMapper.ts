import {
  ApplicantDetailDto,
  ApplicantDto,
  CompanyDetailDto,
  FilingUserDto,
} from '@edge/api';
import {
  ApplicantItem,
  ApplicantType,
  FilingUserData,
} from '../../../types/application';
import { mapCompanyDetails } from './companyMapper';

/**
 * Safely resolves account type without type assertions.
 */
export function resolveAccountType(accountType: string | undefined): 'Individual' | 'Company' {
  return accountType === 'Company' ? 'Company' : 'Individual';
}

/**
 * Safely resolves applicant type without type assertions.
 */
export function resolveApplicantType(applicantType: string | undefined): ApplicantType {
  return applicantType === 'Company' ? 'Company' : 'Individual';
}

/**
 * Safely resolves applicant item review status without type assertions.
 */
export function resolveApplicantItemStatus(
  status: string | undefined
): 'Complete' | 'Incomplete' | 'ForEndorsement' {
  if (status === 'Incomplete') {
    return 'Incomplete';
  }
  if (status === 'ForEndorsement') {
    return 'ForEndorsement';
  }
  return 'Complete';
}

/**
 * Maps filing user DTO to frontend FilingUserData.
 */
export function mapFilingUser(filingUser: FilingUserDto | undefined): FilingUserData | undefined {
  if (!filingUser) {
    return undefined;
  }
  return {
    id: filingUser.id,
    name: filingUser.name ?? '',
    email: filingUser.email ?? '',
    accountType: resolveAccountType(filingUser.accountType),
    company: mapCompanyDetails(filingUser.company),
  };
}

/**
 * Maps single applicant DTO to frontend ApplicantItem.
 */
export function mapApplicantItem(
  appItem: ApplicantDto,
  index: number
): ApplicantItem {
  const detail = appItem.details;
  const rawName = detail
    ? `${detail.firstName ?? ''} ${detail.lastName ?? ''}`.trim()
    : appItem.company?.name || `Applicant ${index + 1}`;

  const companyObj = appItem.company ?? detail?.company;
  const companyDetails = mapCompanyDetails(companyObj);

  return {
    id: appItem.id || `app-${index}`,
    name: rawName || `Applicant ${index + 1}`,
    applicantType: resolveApplicantType(appItem.applicantType),
    status: resolveApplicantItemStatus(appItem.status),
    evaluationRemarks: appItem.evaluationRemarks ?? '',
    serviceId: appItem.serviceId,
    serviceName: appItem.serviceName,
    serviceCode: appItem.serviceCode,
    serviceVariantId: appItem.serviceVariantId,
    serviceVariantName: appItem.serviceVariantName,
    submissionId: appItem.submissionId,
    contactNumber: detail?.contactNumber ?? '',
    email: detail?.emailAddress ?? detail?.email ?? '',
    address: detail?.address ?? '',
    barangay: detail?.address ?? '',
    city: '',
    province: '',
    zipCode: detail?.zipCode ?? '',
    companyDetails,
    basicInfo: detail
      ? {
          lastName: detail.lastName ?? '',
          firstName: detail.firstName ?? '',
          middleName: detail.middleName ?? '',
          extensionName: detail.suffix ?? '',
          dob: detail.birthDate ?? '',
          placeOfBirth: '',
          sex: detail.sex ?? '',
          weight: detail.weight ?? 0,
          height: detail.height ?? 0,
          nationality: detail.nationality ?? '',
          employmentStatus: '',
          occupation: '',
        }
      : undefined,
    requirements: [],
  };
}

/**
 * Resolves the primary applicant display name.
 */
export function resolvePrimaryApplicantName(
  filingUser: FilingUserDto | undefined,
  guestDetail: ApplicantDetailDto | undefined,
  company: CompanyDetailDto | undefined,
  isCompanySubmission: boolean
): string {
  if (filingUser?.name) {
    return filingUser.name;
  }
  if (isCompanySubmission && company?.name) {
    return company.name;
  }
  if (guestDetail) {
    return `${guestDetail.firstName ?? ''} ${guestDetail.lastName ?? ''}`.trim();
  }
  return '';
}

/**
 * Maps address information.
 */
export function mapAddress(
  guestDetail: ApplicantDetailDto | undefined,
  company: CompanyDetailDto | undefined
) {
  return {
    barangay: guestDetail?.address ?? company?.address ?? '',
    province: '',
    city: '',
    zipCode: guestDetail?.zipCode ?? '',
  };
}

/**
 * Maps primary contact details.
 */
export function mapContactDetails(
  filingUser: FilingUserDto | undefined,
  guestDetail: ApplicantDetailDto | undefined,
  company: CompanyDetailDto | undefined
) {
  const contactEmail = filingUser?.email ?? guestDetail?.email ?? '';
  const contactPhone = guestDetail?.contactNumber ?? company?.contactNumber ?? '';
  return {
    contactNumber: contactPhone,
    email: contactEmail,
  };
}

/**
 * Maps basic personal information.
 */
export function mapBasicInfo(
  filingUser: FilingUserDto | undefined,
  guestDetail: ApplicantDetailDto | undefined
) {
  const nameParts = filingUser?.name ? filingUser.name.split(' ') : [];
  const defaultFirstName = nameParts.length > 0 ? (nameParts[0] ?? '') : '';
  const defaultLastName = nameParts.length > 1 ? (nameParts.slice(1).join(' ') ?? '') : '';

  return {
    lastName: guestDetail?.lastName ?? defaultLastName,
    firstName: guestDetail?.firstName ?? defaultFirstName,
    middleName: guestDetail?.middleName ?? '',
    extensionName: guestDetail?.suffix ?? '',
    dob: guestDetail?.birthDate ?? '',
    placeOfBirth: '',
    sex: guestDetail?.sex ?? '',
    weight: guestDetail?.weight ?? 0,
    height: guestDetail?.height ?? 0,
    nationality: guestDetail?.nationality ?? '',
    employmentStatus: '',
    occupation: '',
  };
}
