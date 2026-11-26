import {
  ApplicationStatus,
  ExamineeType,
  FormFieldValueEntry,
  RawRequirement,
  Schedule,
} from './applicationBaseTypes';

export interface ApplicantDetailsRecord {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffix?: string;
  sex?: 'Male' | 'Female';
  nationality?: string;
  address?: string;
  barangay?: string;
  cityMunicipality?: string;
  province?: string;
  region?: string;
  zipCode?: string;
  contactNumber?: string;
  emailAddress?: string;
  examineeType?: ExamineeType;
  streetAddress?: string;
  mobileNumber?: string;
  email?: string;
  birthDate?: string;
  civilStatus?: string;
  companyName?: string;
  representativeName?: string;
  notes?: string;
  schoolAttended?: string;
  schoolName?: string;
  courseTaken?: string;
  courseDegree?: string;
  yearGraduated?: string;
  specialOrderNo?: string;
  serviceVariantName?: string;
  element?: string;
  birthMonth?: string;
  birthDay?: string;
  birthYear?: string;
  eSignature?: string;
  signatureUrl?: string;
  formFieldValues?: FormFieldValueEntry[];
}

export interface BulkApplicant {
  id: string;
  name: string;
  applicationType: string;
  status: ApplicationStatus;
  includedInSOA: boolean;
  sex?: 'Male' | 'Female';
  nationality?: string;
  streetAddress?: string;
  barangay?: string;
  cityMunicipality?: string;
  province?: string;
  region?: string;
  zipCode?: string;
  mobileNumber?: string;
  email?: string;
  schedule?: Schedule;
  formFieldValues?: FormFieldValueEntry[];
  birthDate?: string;
  civilStatus?: string;
  companyName?: string;
  representativeName?: string;
  notes?: string;
  schoolAttended?: string;
  schoolName?: string;
  courseTaken?: string;
  courseDegree?: string;
  yearGraduated?: string;
  specialOrderNo?: string;
  serviceId?: string;
  serviceVariantId?: string;
  serviceVariantName?: string;
  serviceVariantType?: string;
  element?: string;
  eSignature?: string;
  signatureUrl?: string;
  details?: ApplicantDetailsRecord;
  firstName?: string;
  lastName?: string;
  address?: string;
  contactNumber?: string;
  emailAddress?: string;
  applicantType?: string;
  includedInSoa?: boolean;
  examineeType?: ExamineeType;
  requirements?: RawRequirement[];
  Requirements?: RawRequirement[];
  applicationRequirements?: RawRequirement[];
  ApplicationRequirements?: RawRequirement[];
  documents?: RawRequirement[];
  Documents?: RawRequirement[];
}

export interface EnrichedBulkApplicant extends BulkApplicant {
  sex: 'Male' | 'Female';
  nationality: string;
  streetAddress: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  region: string;
  zipCode: string;
  mobileNumber: string;
  email: string;
  schedule: Schedule;
}
