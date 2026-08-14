import { CompanyDetailDto } from '@edge/api';

export interface MappedCompanyDetails {
  name: string;
  registrationNumber: string;
  address: string;
  contactNumber: string;
  email: string;
}

/**
 * Normalizes company details into a structured, sanitized object.
 */
export function mapCompanyDetails(
  company: CompanyDetailDto | undefined
): MappedCompanyDetails | undefined {
  if (!company) {
    return undefined;
  }
  return {
    name: company.name ?? '',
    registrationNumber: company.registrationNumber ?? '',
    address: company.address ?? '',
    contactNumber: company.contactNumber ?? '',
    email: company.email ?? '',
  };
}
