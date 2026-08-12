export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'Evaluating'
  | 'Returned'
  | 'Approved'
  | 'Completed';

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
  particular: string;
  validityYears: number;
  percentage: number;
  noOfUnits: number;
  fees: number;
  amount: number;
  code: string;
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

export interface ApplicationData {
  id: string;
  referenceNumber: string;
  permitNumber: string;
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
  isBeingViewed: boolean;
  isUrgent: boolean;
  isPinned: boolean;
  isArchived?: boolean;
  filingUser?: FilingUserData;
  address: {
    barangay: string;
    province: string;
    city: string;
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
  note: string;
}
