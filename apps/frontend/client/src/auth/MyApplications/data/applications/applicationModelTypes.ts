import {
  ApplicationHistoryEntry,
  ApplicationStatus,
  ExamineeType,
  FilingUserSummary,
  FormFieldValueEntry,
  IssuedDocumentSummary,
  OpData,
  RawRequirement,
  Schedule,
  SoaData,
  SoaLineItem,
} from './applicationBaseTypes';
import { BulkApplicant } from './applicationApplicantTypes';

interface SharedApplicationFields {
  id: string;
  referenceNumber: string;
  serviceName: string;
  serviceCategory: string;
  element: ExamineeType | string;
  status: ApplicationStatus;
  submittedAt: string;
  soa?: SoaData;
  op?: OpData;
  soaItems?: SoaLineItem[];
  totalAmountDue?: number;
  dueDate?: string;
  opNumber?: string | null;
  officialReceiptNumber?: string;
  amountPaid?: number;
  paidAt?: string;
  evaluatingOfficer?: string;
  issuingOfficer?: string;
  submissionMode?: string;
  Applicants?: BulkApplicant[];
  applicationApplicants?: BulkApplicant[];
  ApplicationApplicants?: BulkApplicant[];
  companyDetail?: { name?: string };
  company?: { name?: string };
  Company?: { Name?: string };
  rawStatus?: string;
  representativeName?: string;
  requirements?: RawRequirement[];
  Requirements?: RawRequirement[];
  applicationRequirements?: RawRequirement[];
  ApplicationRequirements?: RawRequirement[];
  documents?: RawRequirement[];
  Documents?: RawRequirement[];
  formFieldValues?: FormFieldValueEntry[];
  office?: string;
  remarks?: string;
  serviceVariantName?: string;
  variant?: string;
  serviceVariantType?: string;
  tenantName?: string;
  tenantId?: string;
  serviceId?: string;
  serviceVariantId?: string;
  intent?: 'Regular' | 'AssessmentOnly';
  isAssessmentOnly?: boolean;
  assessedAt?: string;
  convertedToRegularAt?: string;
  assessmentVersion?: number;
  assessmentRemarks?: string;
  histories?: ApplicationHistoryEntry[];
  history?: ApplicationHistoryEntry[];
  filingUser?: FilingUserSummary | null;
  issuedDocumentDetails?: IssuedDocumentSummary[];
  renewedFromApplicationId?: string;
  hasActiveRenewal?: boolean;
  activeRenewalApplicationId?: string;
  activeRenewalReferenceNumber?: string;
}

export interface SingleApplication extends SharedApplicationFields {
  mode: 'SINGLE';
  applicantName: string;
  sex: 'Male' | 'Female';
  nationality: string;
  streetAddress: string;
  barangay?: string;
  cityMunicipality: string;
  province: string;
  region: string;
  zipCode?: string;
  mobileNumber: string;
  email: string;
  examineeType: ExamineeType;
  schedule: Schedule;
  birthDate?: string;
  civilStatus?: string;
  applicants?: BulkApplicant[];
  companyName?: string;
  soaNumber?: string | null;
  applicantType?: string;
}

export interface BulkApplication extends SharedApplicationFields {
  mode: 'BULK';
  companyName: string;
  applicants: BulkApplicant[];
  soaNumber: string | null;
  applicantName?: string;
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
  examineeType?: ExamineeType;
  schedule?: Schedule;
}

export type Application = SingleApplication | BulkApplication;
