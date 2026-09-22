export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'Evaluating'
  | 'Returned'
  | 'Approved'
  | 'Completed'
  | 'ForAccountant'
  | 'PendingPayment';

export type QueueTab = 'activity' | 'pending' | 'history';
export type ApplicantType = 'Individual' | 'Company';
export type ApplicationCategory =
  | 'Exams'
  | 'Permits'
  | 'Licenses'
  | 'Accreditations'
  | 'Certificates'
  | 'Complaints and Request';

export interface RequirementDocument {
  label: string;
  note?: string;
  filename: string;
  thumbnailUri?: string;
}

export interface ApplicationFormAttachment {
  name: string;
  section: 'ACCOUNTABLE FORM' | 'DOWNLOAD FORM';
  canView: boolean;
  canPrint: boolean;
  canDownload: boolean;
  canRefresh: boolean;
}

export interface SoaItem {
  id?: string;
  particular: string;
  validityYears: number;
  percentage: number;
  noOfUnits: number;
  fees: number;
  amount: number;
  code: string;
  description?: string;
  applicantId?: string;
  applicantName?: string;
}

export interface StatementOfAccountItem {
  id: string;
  applicationId: string;
  applicantId?: string;
  applicantName?: string;
  soaNumber: string;
  status: 'Pending' | 'Approved' | 'Returned';
  issuedToType: 'Individual' | 'Company';
  issuedToName: string;
  issuedToAddress?: string;
  totalAmount: number;
  dueDate: string;
  preparedByUserId?: string;
  approvedByUserId?: string;
  approvedAt?: string;
  remarks?: string;
  lineItems: SoaItem[];
  histories: AuditTrailEntry[];
}

export interface PaymentDetails {
  amountReceived: number;
  method: 'cash' | 'check';
  orNumber: string;
  checkNumber: string;
  checkName: string;
}

export interface AuditTrailEntry {
  id: string;
  action: string;
  staff: string;
  timestamp: string;
}

export interface FilingUserData {
  id: string;
  name: string;
  email: string;
  accountType: 'Individual' | 'Company';
  company?: {
    name: string;
    registrationNumber: string;
    address: string;
    contactNumber: string;
    email: string;
  };
}

export interface ApplicantItem {
  id: string;
  name: string;
  applicantType: ApplicantType;
  status?: 'Complete' | 'Incomplete' | 'ForEndorsement';
  evaluationRemarks?: string;
  serviceId?: string;
  serviceName?: string;
  serviceCode?: string;
  serviceVariantId?: string;
  serviceVariantName?: string;
  submissionId?: string;
  contactNumber: string;
  email: string;
  address: string;
  streetAddress?: string;
  barangay: string;
  city: string;
  province: string;
  region?: string;
  zipCode: string;
  basicInfo?: {
    lastName: string;
    firstName: string;
    middleName: string;
    extensionName: string;
    dob: string;
    placeOfBirth: string;
    sex: string;
    weight: number;
    height: number;
    nationality: string;
    civilStatus?: string;
    employmentStatus: string;
    occupation: string;
  };
  companyDetails?: {
    name: string;
    registrationNumber?: string;
    address?: string;
    contactNumber?: string;
    email?: string;
  };
  requirements?: RequirementDocument[];
}

export interface FormSubmissionSummaryItem {
  id: string;
  formId: string;
  applicantId: string;
  applicationServiceId?: string;
  createdAt?: string;
}

export interface ApplicationServiceItem {
  id: string;
  applicantId?: string;
  serviceId?: string;
  serviceName?: string;
  serviceCategory?: string;
  serviceVariantId?: string;
  serviceVariantName?: string;
  submissionId?: string;
}

export interface ApplicationData {
  id: string;
  tenantId?: string;
  referenceNumber: string;
  applicationNumber: string;
  applicant: string;
  applicantType: ApplicantType;
  permitTitle: string;
  category: ApplicationCategory;
  status: ApplicationStatus;
  queueTab: QueueTab;
  createdAt: string;
  dateLabel: string;
  assignedTo: string;
  applicationType: 'SINGLE' | 'BULK';
  applicantCount?: number;
  applicantsList?: ApplicantItem[];
  services?: ApplicationServiceItem[];
  isBeingViewed: boolean;
  isUrgent: boolean;
  isPinned: boolean;
  isArchived?: boolean;
  serviceName?: string;
  serviceCategory?: string;
  serviceVariantName?: string;
  office?: string;
  mode?: string;
  filingUser?: FilingUserData;
  address: {
    streetAddress?: string;
    address?: string;
    barangay: string;
    province: string;
    city: string;
    region?: string;
    zipCode: string;
  };
  contactDetails: {
    contactNumber: string;
    email: string;
  };
  basicInfo: {
    lastName: string;
    firstName: string;
    middleName: string;
    extensionName: string;
    dob: string;
    placeOfBirth: string;
    sex: string;
    weight: number;
    height: number;
    nationality: string;
    civilStatus?: string;
    employmentStatus: string;
    occupation: string;
  };
  applicationDetails: {
    noOfYears: number;
    permitCategory: string;
    formType: string;
    submittedAt: string;
  };
  requirements: RequirementDocument[];
  forms: ApplicationFormAttachment[];
  statementsOfAccount?: StatementOfAccountItem[];
  soaItems: SoaItem[];
  totalAmountDue: number;
  dueDate: string;
  payment: PaymentDetails;
  correctionAuditTrail: AuditTrailEntry[];
  history: AuditTrailEntry[];
  companyDetails?: {
    name: string;
    registrationNumber: string;
    address: string;
    contactNumber: string;
    email: string;
  };
  note: string;
}
