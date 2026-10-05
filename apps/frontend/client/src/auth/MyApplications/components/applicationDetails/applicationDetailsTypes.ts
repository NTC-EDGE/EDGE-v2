import { ApplicationDocument, ApplicationStatus, RawRequirement } from '../../data/applicationsData';

export interface ApplicationDetailsPageProps {
  app: import('../../data/applicationsData').Application;
  onBack: () => void;
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

export const normalizeStatus = (status: string): string => {
  if (!status) return 'PENDING';
  const s = status.toUpperCase().replace(/_/g, '');
  if (s === 'DRAFT') return 'PENDING';
  if (s === 'SUBMITTED' || s === 'FORVERIFICATION') return 'FOR_EVALUATION';
  if (s === 'FORAPPROVAL') return 'FOR_APPROVAL';
  if (s === 'APPROVED' || s === 'COMPLETED') return 'APPROVED';
  if (s === 'DECLINED') return 'DECLINED';
  if (s === 'EXPIRINGSOON') return 'EXPIRING_SOON';
  if (s === 'READYFORPAYMENT') return 'READY_FOR_PAYMENT';
  return status;
};

const isValidStatus = (s: string): s is ApplicationStatus =>
  ['FOR_APPROVAL','FOR_EVALUATION','APPROVED','DECLINED','EXPIRING_SOON','READY_FOR_PAYMENT','PENDING'].includes(s);

export const safeGetStatusLabel = (status: string, fn: (s: ApplicationStatus) => string): string =>
  fn(isValidStatus(normalizeStatus(status)) ? (normalizeStatus(status) as ApplicationStatus) : 'PENDING');

export const safeGetStatusColor = (status: string, fn: (s: ApplicationStatus) => string): string =>
  fn(isValidStatus(normalizeStatus(status)) ? (normalizeStatus(status) as ApplicationStatus) : 'PENDING');

export const safeGetStatusBgColor = (status: string, fn: (s: ApplicationStatus) => string): string =>
  fn(isValidStatus(normalizeStatus(status)) ? (normalizeStatus(status) as ApplicationStatus) : 'PENDING');

export const getApplicantStepProgress = (status: string): number => {
  switch (normalizeStatus(status)) {
    case 'PENDING': return 1;
    case 'FOR_EVALUATION': return 2;
    case 'FOR_APPROVAL': return 3;
    case 'APPROVED': case 'READY_FOR_PAYMENT': return 4;
    case 'DECLINED': return 4;
    case 'EXPIRING_SOON': return 2;
    default: return 3;
  }
};

export const isGuid = (val?: string | null): boolean => {
  if (!val || typeof val !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());
};
