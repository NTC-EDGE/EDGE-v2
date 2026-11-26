export type ApplicationStatus =
  | 'FOR_APPROVAL'
  | 'FOR_EVALUATION'
  | 'APPROVED'
  | 'DECLINED'
  | 'EXPIRING_SOON'
  | 'READY_FOR_PAYMENT'
  | 'PAYMENT_SUBMITTED'
  | 'PENDING';

export type ApplicationMode = 'SINGLE' | 'BULK';
export type ModeFilterOption = 'ALL' | 'SINGLE' | 'BULK' | 'ASSESSMENT';
export type StatusFilterOption =
  | 'ALL'
  | 'FOR_APPROVAL'
  | 'FOR_EVALUATION'
  | 'APPROVED'
  | 'EXPIRING_SOON'
  | 'READY_FOR_PAYMENT'
  | 'PAYMENT_SUBMITTED'
  | 'DECLINED'
  | 'PENDING';
export type DensityOption = 'std' | 'cozy' | 'compact';
export type ExamineeType =
  | 'New'
  | 'Renewal'
  | 'Modification'
  | 'Upgrading'
  | 'Additional'
  | 'First Taker'
  | 'Retaker'
  | string;

export interface ApplicationDocument {
  id: string;
  name: string;
  requirementName?: string;
  applicantId?: string;
  requirementId?: string;
  serviceVariantRequirementId?: string;
  type: 'PDF' | 'DOCX' | 'ZIP' | 'IMAGE';
  size: string;
  category: 'ATTACHMENT' | 'ISSUED_PERMIT' | 'RECEIPT' | 'SOA' | 'ADMISSION_SLIP';
  uploadedAt: string;
  url?: string;
  storedFileId?: string;
}

export interface RawRequirement {
  id?: string;
  applicantId?: string;
  requirementId?: string;
  requirementName?: string;
  serviceVariantRequirementId?: string;
  storedFileId?: string;
  fileName?: string;
  name?: string;
  contentType?: string;
  fileSizeBytes?: number;
  url?: string;
  size?: string;
  category?: string;
  uploadedAt?: string;
  isApproved?: boolean;
}

export interface Schedule {
  date: string;
  time: string;
  venue: string;
}

export interface SoaLineItem {
  id?: string;
  particular: string;
  itemCode: string;
  description?: string;
  validityYears: number;
  noOfUnits: number;
  feeRate: number;
  amount: number;
}

export interface SoaData {
  id?: string;
  soaNumber: string;
  status: string;
  issuedToType?: string;
  issuedToName?: string;
  issuedToAddress?: string;
  totalAmount: number;
  dueDate?: string;
  remarks?: string;
  soaNoteId?: string;
  soaNoteText?: string;
  preparedByName?: string;
  preparedByTitle?: string;
  approvedByName?: string;
  approvedByTitle?: string;
  lineItems: SoaLineItem[];
}

export interface OpData {
  id?: string;
  opNumber: string;
  status: string;
  amountDue: number;
  amountReceived: number;
  paymentMethod?: string;
  officialReceiptNumber?: string;
  paidAt?: string;
  remarks?: string;
}

export interface ApplicationHistoryEntry {
  id: string;
  action: string;
  fromStatus?: string;
  toStatus: string;
  staffName: string;
  staffRole: string;
  remarks?: string;
  timestamp: string;
}

export interface IssuedDocumentSummary {
  id: string;
  applicationId: string;
  applicantId?: string;
  documentType: string;
  formNumber: string;
  licenseNumber?: string;
  callSign?: string;
  stationClass?: string;
  frequencyBand?: string;
  issueDate: string;
  expiryDate?: string;
  officialReceiptNumber?: string;
  remarks?: string;
}

export interface FilingUserSummary {
  id?: string;
  name?: string;
  email?: string;
  accountType?: string;
  company?: { name?: string; address?: string };
}

export interface FormFieldValueEntry {
  fieldId: string;
  fieldLabel: string;
  value: string;
}
