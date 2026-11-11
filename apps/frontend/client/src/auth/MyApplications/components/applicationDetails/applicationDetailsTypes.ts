import { ApplicationDocument, ApplicationStatus, RawRequirement, normalizeApplicationStatus } from '../../data/applicationsData';

export interface ApplicationDetailsPageProps {
  app: import('../../data/applicationsData').Application;
  onBack: () => void;
  onRenew?: (app: import('../../data/applicationsData').Application) => void;
  onDownloadDoc?: (doc: ApplicationDocument) => void;
}

export interface RawFormFieldItem {
  fieldId?: string;
  fieldLabel?: string;
  label?: string;
  key?: string;
  value?: string;
}

export interface RawApplicantDetails {
  fullName?: string;
  applicantName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  companyName?: string;
  representativeName?: string;
  notes?: string;
  birthDate?: string;
  birthMonth?: string;
  birthDay?: string;
  birthYear?: string;
  civilStatus?: string;
  sex?: 'Male' | 'Female' | string;
  nationality?: string;
  streetAddress?: string;
  address?: string;
  barangay?: string;
  barangayName?: string;
  cityMunicipality?: string;
  city?: string;
  province?: string;
  region?: string;
  zipCode?: string;
  mobileNumber?: string;
  contactNumber?: string;
  email?: string;
  emailAddress?: string;
  examineeType?: string;
  formFieldValues?: RawFormFieldItem[];
}

export interface RawApplicantHolder {
  id?: string;
  name?: string;
  applicantName?: string;
  applicationType?: string;
  applicantType?: string;
  companyName?: string;
  representativeName?: string;
  details?: RawApplicantDetails;
  formFieldValues?: RawFormFieldItem[];
  requirements?: RawRequirement[];
  Requirements?: RawRequirement[];
}

export const normalizeStatus = (status: string | undefined | null): ApplicationStatus => {
  return normalizeApplicationStatus(status);
};

export const safeGetStatusLabel = (status: string | undefined | null, fn: (s: ApplicationStatus) => string): string =>
  fn(normalizeApplicationStatus(status));

export const safeGetStatusColor = (status: string | undefined | null, fn: (s: ApplicationStatus) => string): string =>
  fn(normalizeApplicationStatus(status));

export const safeGetStatusBgColor = (status: string | undefined | null, fn: (s: ApplicationStatus) => string): string =>
  fn(normalizeApplicationStatus(status));

export const getApplicantStepProgress = (status: string | undefined | null): number => {
  switch (normalizeApplicationStatus(status)) {
    case 'PENDING': return 1;
    case 'FOR_EVALUATION': return 2;
    case 'READY_FOR_PAYMENT':
    case 'PAYMENT_SUBMITTED': return 3;
    case 'FOR_APPROVAL': return 4;
    case 'APPROVED': return 5;
    case 'DECLINED': return 4;
    case 'EXPIRING_SOON': return 2;
    default: return 1;
  }
};

export const isGuid = (val?: string | null): boolean => {
  if (!val || typeof val !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());
};
