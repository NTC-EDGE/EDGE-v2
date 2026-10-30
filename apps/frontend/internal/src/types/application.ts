export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'Evaluating'
  | 'Returned'
  | 'Approved'
  | 'Completed'
  | 'ForAccountant'
  | 'PendingPayment'
  | 'ForIssuance';

export type QueueTab = 'activity' | 'pending' | 'issuance' | 'history';
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
  url?: string;
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
  particular: string;
  validityYears: number;
  percentage: number;
  noOfUnits: number;
  fees: number;
  amount: number;
  code: string;
}

export interface PaymentDetails {
  orderOfPaymentId?: string;
  opNumber?: string;
  amountReceived: number;
  method: 'cash' | 'check';
  paymentMethod?: string;
  orNumber: string;
  checkNumber: string;
  checkName: string;
  checkBank?: string;
  checkDate?: string;
  payorName?: string;
  remarks?: string;
  paidAt?: string;
}

export interface AuditTrailEntry {
  id: string;
  action: string;
  staff: string;
  role?: string;
  remarks?: string;
  status?: string;
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
  serviceVariantId?: string;
  serviceVariantName?: string;
  applicationType?: string;
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
  schoolAttended?: string;
  courseTaken?: string;
  yearGraduated?: string;
  eSignature?: string;
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
  history?: AuditTrailEntry[];
  formFieldValues?: Array<{ fieldId: string; fieldLabel: string; value: string }>;
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
  applicationType?: string;
  submissionId?: string;
}

export interface ApplicationData {
  id: string;
  tenantId?: string;
  region?: string;
  referenceNumber: string;
  applicationNumber: string;
  applicant: string;
  applicantType: ApplicantType;
  permitTitle: string;
  category: ApplicationCategory;
  status: ApplicationStatus;
  queueTab: QueueTab;
  createdAt: string;
  updatedAt?: string;
  lastModifiedAt?: string;
  dateLabel: string;
  assignedTo: string;
  evaluatingOfficer?: string;
  accountingOfficer?: string;
  cashierOfficer?: string;
  issuingOfficer?: string;
  soaId?: string;
  statementOfAccountId?: string;
  soaNumber?: string;
  officialReceiptNumber?: string;
  soaStatus?: string;
  soaIssuedToName?: string;
  soaIssuedToAddress?: string;
  soaIssuedToType?: ApplicantType;
  soaDueDate?: string;
  soaCreatedAt?: string;
  soaPreparedByName?: string;
  soaPreparedByTitle?: string;
  soaApprovedByName?: string;
  soaApprovedByTitle?: string;
  soaNoteId?: string;
  endorsedTo?: string;
  endorsedBy?: string;
  applicationType: 'SINGLE' | 'BULK';
  applicantsList?: ApplicantItem[];
  services?: ApplicationServiceItem[];
  isBeingViewed: boolean;
  isUrgent: boolean;
  isPinned: boolean;
  isArchived?: boolean;
  intent?: 'Regular' | 'AssessmentOnly';
  isAssessmentOnly?: boolean;
  serviceId?: string;
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
  formFieldValues?: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  note: string;
  remarks?: string;
  soaRemarks?: string;
}
