// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | 'FOR_APPROVAL'
  | 'FOR_EVALUATION'
  | 'APPROVED'
  | 'DECLINED'
  | 'EXPIRING_SOON'
  | 'READY_FOR_PAYMENT'
  | 'PENDING';

export type ApplicationMode = 'SINGLE' | 'BULK';
export type ModeFilterOption = 'ALL' | 'SINGLE' | 'BULK' | 'ASSESSMENT';
export type StatusFilterOption = 'ALL' | 'FOR_APPROVAL' | 'FOR_EVALUATION' | 'APPROVED' | 'EXPIRING_SOON' | 'READY_FOR_PAYMENT' | 'DECLINED' | 'PENDING';
export type DensityOption = 'std' | 'cozy' | 'compact';
export type ExamineeType = 'New' | 'Renewal' | 'Modification' | 'Upgrading' | 'Additional';

export interface ApplicationDocument {
  id: string;
  name: string;
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

export interface SingleApplication {
  id: string;
  referenceNumber: string;
  mode: 'SINGLE';
  serviceName: string;
  serviceCategory: string;
  element: ExamineeType;
  status: ApplicationStatus;
  submittedAt: string;
  // SOA & Billing
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
  // Basic Info
  applicantName: string;
  sex: 'Male' | 'Female';
  nationality: string;
  // Address
  streetAddress: string;
  barangay?: string;
  cityMunicipality: string;
  province: string;
  region: string;
  zipCode?: string;
  // Contact
  mobileNumber: string;
  email: string;
  // Examinee
  examineeType: ExamineeType;
  schedule: Schedule;

  // Backend dynamic fields compatibility
  submissionMode?: string;
  Applicants?: BulkApplicant[];
  applicants?: BulkApplicant[];
  companyName?: string;
  companyDetail?: { name?: string };
  company?: { name?: string };
  rawStatus?: string;
  Company?: { Name?: string };
  representativeName?: string;
  requirements?: RawRequirement[];
  Requirements?: RawRequirement[];
  applicationRequirements?: RawRequirement[];
  ApplicationRequirements?: RawRequirement[];
  documents?: RawRequirement[];
  Documents?: RawRequirement[];
  applicationApplicants?: BulkApplicant[];
  ApplicationApplicants?: BulkApplicant[];
  soaNumber?: string | null;
  formFieldValues?: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  office?: string;
  remarks?: string;
  serviceVariantName?: string;
  variant?: string;
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
  histories?: Array<{
    id: string;
    action: string;
    fromStatus?: string;
    toStatus: string;
    staffName: string;
    staffRole: string;
    remarks?: string;
    timestamp: string;
  }>;
  history?: Array<{
    id: string;
    action: string;
    fromStatus?: string;
    toStatus: string;
    staffName: string;
    staffRole: string;
    remarks?: string;
    timestamp: string;
  }>;
  applicantType?: string;
  filingUser?: {
    id?: string;
    name?: string;
    email?: string;
    accountType?: string;
    company?: { name?: string; address?: string };
  } | null;
}

export interface BulkApplicant {
  id: string;
  name: string;
  applicationType: string;
  status: ApplicationStatus;
  includedInSOA: boolean;

  // Optional profile details for the applicant details view
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
  formFieldValues?: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  birthDate?: string;
  civilStatus?: string;
  companyName?: string;
  representativeName?: string;
  notes?: string;
  serviceId?: string;
  serviceVariantId?: string;

  // Compatibility fields
  details?: {
    firstName?: string;
    lastName?: string;
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
    birthMonth?: string;
    birthDay?: string;
    birthYear?: string;
    formFieldValues?: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  };
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

export interface BulkApplication {
  id: string;
  referenceNumber: string;
  mode: 'BULK';
  intent?: 'Regular' | 'AssessmentOnly';
  isAssessmentOnly?: boolean;
  assessedAt?: string;
  convertedToRegularAt?: string;
  assessmentVersion?: number;
  assessmentRemarks?: string;
  companyName: string;
  serviceName: string;
  serviceCategory: string;
  element: ExamineeType;
  status: ApplicationStatus;
  submittedAt: string;
  applicants: BulkApplicant[];
  soaNumber: string | null;
  rawStatus?: string;

  // SOA & Billing
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

  // Backend dynamic fields compatibility
  submissionMode?: string;
  Applicants?: BulkApplicant[];
  applicationApplicants?: BulkApplicant[];
  ApplicationApplicants?: BulkApplicant[];
  companyDetail?: { name?: string };
  company?: { name?: string };
  Company?: { Name?: string };
  representativeName?: string;
  requirements?: RawRequirement[];
  Requirements?: RawRequirement[];
  applicationRequirements?: RawRequirement[];
  ApplicationRequirements?: RawRequirement[];
  documents?: RawRequirement[];
  Documents?: RawRequirement[];
  formFieldValues?: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  office?: string;
  remarks?: string;
  serviceVariantName?: string;
  variant?: string;
  tenantName?: string;
  tenantId?: string;
  serviceId?: string;
  serviceVariantId?: string;
  histories?: Array<{
    id: string;
    action: string;
    fromStatus?: string;
    toStatus: string;
    staffName: string;
    staffRole: string;
    remarks?: string;
    timestamp: string;
  }>;
  history?: Array<{
    id: string;
    action: string;
    fromStatus?: string;
    toStatus: string;
    staffName: string;
    staffRole: string;
    remarks?: string;
    timestamp: string;
  }>;
  filingUser?: {
    id?: string;
    name?: string;
    email?: string;
    accountType?: string;
    company?: { name?: string; address?: string };
  } | null;

  // Single Application fields (optional here for API compatibility)
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

// ─────────────────────────────────────────────────────────────────────────────
// Status helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getStatusLabel(status: ApplicationStatus): string {
  switch (status) {
    case 'FOR_APPROVAL':     return 'For Issuance';
    case 'FOR_EVALUATION':   return 'For Evaluation';
    case 'APPROVED':         return 'Issued';
    case 'DECLINED':         return 'Returned';
    case 'EXPIRING_SOON':    return 'Expiring Soon';
    case 'READY_FOR_PAYMENT':return 'Ready For Payment';
    case 'PENDING':          return 'Submitted';
  }
}

export function getStatusColor(status: ApplicationStatus): string {
  switch (status) {
    case 'FOR_APPROVAL':     return '#2563EB';
    case 'FOR_EVALUATION':   return '#D97706';
    case 'APPROVED':         return '#16A34A';
    case 'DECLINED':         return '#DC2626';
    case 'EXPIRING_SOON':    return '#EA580C';
    case 'READY_FOR_PAYMENT':return '#059669';
    case 'PENDING':          return '#64748B';
  }
}

export function getStatusBgColor(status: ApplicationStatus): string {
  switch (status) {
    case 'FOR_APPROVAL':     return '#EFF6FF';
    case 'FOR_EVALUATION':   return '#FEF3C7';
    case 'APPROVED':         return '#DCFCE7';
    case 'DECLINED':         return '#FEE2E2';
    case 'EXPIRING_SOON':    return '#FFF7ED';
    case 'READY_FOR_PAYMENT':return '#D1FAE5';
    case 'PENDING':          return '#F1F5F9';
  }
}

export function formatRelativeTime(isoDate: string): string {
  const now = new Date();
  const then = new Date(isoDate);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60)  return 'just now';
  if (diffMin < 60)  return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHr  < 24)  return `about ${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  if (diffDay < 30)  return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Document Helper
// ─────────────────────────────────────────────────────────────────────────────

export function getAppDocuments(app: Application): ApplicationDocument[] {
  const docs: ApplicationDocument[] = [];
  const rawList: RawRequirement[] = (
    app.requirements ||
    app.Requirements ||
    (app as { applicationRequirements?: RawRequirement[] }).applicationRequirements ||
    (app as { ApplicationRequirements?: RawRequirement[] }).ApplicationRequirements ||
    app.documents ||
    app.Documents ||
    []
  );

  // If there are actual attachments mapped on the application
  if (rawList.length > 0) {
    return rawList.map((req, idx) => {
      const urlStr = req.url || '';
      const hasFile = Boolean(
        (urlStr && urlStr.trim() !== '' && urlStr.trim().toLowerCase() !== 'none' && urlStr.trim().toLowerCase() !== 'null') ||
        (req.storedFileId && req.storedFileId.trim() !== '' && req.storedFileId.trim().toLowerCase() !== 'none' && req.storedFileId.trim().toLowerCase() !== 'null')
      );

      const rawName = req.fileName || req.name || (urlStr ? urlStr.split('/').pop() : undefined) || (hasFile ? `Attachment_${idx + 1}.pdf` : req.name || `Requirement_${idx + 1}`);
      const ext = rawName.toLowerCase().split('.').pop() || '';
      
      let typ: 'PDF' | 'IMAGE' | 'DOCX' | 'ZIP' = 'PDF';
      if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(ext)) {
        typ = 'IMAGE';
      } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
        typ = 'ZIP';
      } else if (['doc', 'docx'].includes(ext)) {
        typ = 'DOCX';
      }

      let sizeFormatted = req.size;
      if (!sizeFormatted && req.fileSizeBytes) {
        if (req.fileSizeBytes >= 1024 * 1024) {
          sizeFormatted = `${(req.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`;
        } else {
          sizeFormatted = `${Math.round(req.fileSizeBytes / 1024)} KB`;
        }
      }

      let category: ApplicationDocument['category'] = 'ATTACHMENT';
      const catLower = (req.category || '').toLowerCase();
      const nameLower = rawName.toLowerCase();
      if (catLower.includes('admission') || nameLower.includes('admission')) {
        category = 'ADMISSION_SLIP';
      } else if (catLower.includes('receipt') || nameLower.includes('receipt') || nameLower.includes('official_receipt')) {
        category = 'RECEIPT';
      } else if (catLower.includes('soa') || nameLower.includes('soa') || nameLower.includes('statement_of_account')) {
        category = 'SOA';
      } else if (catLower.includes('permit') || catLower.includes('license') || nameLower.includes('license') || nameLower.includes('certificate')) {
        category = 'ISSUED_PERMIT';
      }

      return {
        id: req.id || req.storedFileId || `req-doc-${idx + 1}`,
        name: rawName,
        type: typ,
        size: sizeFormatted || (hasFile ? '350 KB' : ''),
        category,
        uploadedAt: req.uploadedAt || app.submittedAt,
        url: hasFile ? req.url : undefined,
        storedFileId: hasFile ? req.storedFileId : undefined,
      };
    });
  }

  // Also check if any applicant has actual attached requirements
  const rawApplicants = (app.applicants || app.Applicants || []);
  for (let aIdx = 0; aIdx < rawApplicants.length; aIdx++) {
    const ap = rawApplicants[aIdx];
    const apReqs: RawRequirement[] = (
      (ap as { requirements?: RawRequirement[]; Requirements?: RawRequirement[] }).requirements ||
      (ap as { requirements?: RawRequirement[]; Requirements?: RawRequirement[] }).Requirements ||
      []
    );
    for (let rIdx = 0; rIdx < apReqs.length; rIdx++) {
      const req = apReqs[rIdx];
      const urlStr = req.url || '';
      const hasFile = Boolean(
        (urlStr && urlStr.trim() !== '' && urlStr.trim().toLowerCase() !== 'none' && urlStr.trim().toLowerCase() !== 'null') ||
        (req.storedFileId && req.storedFileId.trim() !== '' && req.storedFileId.trim().toLowerCase() !== 'none' && req.storedFileId.trim().toLowerCase() !== 'null')
      );

      const rawName = req.fileName || req.name || (urlStr ? urlStr.split('/').pop() : undefined) || (hasFile ? `${ap.name || 'Applicant'}_Attachment_${rIdx + 1}.pdf` : req.name || `Requirement_${rIdx + 1}`);
      const ext = rawName.toLowerCase().split('.').pop() || '';
      
      let typ: 'PDF' | 'IMAGE' | 'DOCX' | 'ZIP' = 'PDF';
      if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(ext)) {
        typ = 'IMAGE';
      } else if (['zip', 'rar', '7z'].includes(ext)) {
        typ = 'ZIP';
      } else if (['doc', 'docx'].includes(ext)) {
        typ = 'DOCX';
      }

      let sizeFormatted = req.size;
      if (!sizeFormatted && req.fileSizeBytes) {
        if (req.fileSizeBytes >= 1024 * 1024) {
          sizeFormatted = `${(req.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`;
        } else {
          sizeFormatted = `${Math.round(req.fileSizeBytes / 1024)} KB`;
        }
      }

      docs.push({
        id: req.id || req.storedFileId || `ap-${aIdx}-req-${rIdx + 1}`,
        name: rawName,
        type: typ,
        size: sizeFormatted || (hasFile ? '350 KB' : ''),
        category: 'ATTACHMENT',
        uploadedAt: req.uploadedAt || app.submittedAt,
        url: hasFile ? req.url : undefined,
        storedFileId: hasFile ? req.storedFileId : undefined,
      });
    }
  }

  return docs;
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

// Helper to provide enriched applicant details for bulk applications
export function getEnrichedApplicant(applicant: BulkApplicant, serviceName: string): EnrichedBulkApplicant {
  const hash = (applicant.id + applicant.name).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isFemale = hash % 2 === 0;
  const sex = isFemale ? 'Female' : 'Male';
  const nationality = 'Filipino';

  const cities = ['Manila', 'Quezon City', 'Cebu City', 'Davao City', 'San Fernando'];
  const provinces = ['Metro Manila', 'Metro Manila', 'Cebu', 'Davao del Sur', 'Pampanga'];
  const regions = [
    'NCR – National Capital Region',
    'NCR – National Capital Region',
    'Region VII – Central Visayas',
    'Region XI – Davao Region',
    'Region III – Central Luzon'
  ];
  const index = hash % cities.length;

  return {
    id: applicant.id,
    name: applicant.name,
    applicationType: applicant.applicationType,
    status: applicant.status,
    includedInSOA: applicant.includedInSOA,
    sex: applicant.sex ?? sex,
    nationality: applicant.nationality ?? nationality,
    streetAddress: applicant.streetAddress ?? `${100 + (hash % 900)} Rizal Avenue`,
    barangay: applicant.barangay ?? `Barangay ${100 + (hash % 800)}`,
    cityMunicipality: applicant.cityMunicipality ?? cities[index],
    province: applicant.province ?? provinces[index],
    region: applicant.region ?? regions[index],
    zipCode: applicant.zipCode ?? `${1000 + (hash % 8999)}`,
    mobileNumber: applicant.mobileNumber ?? `+63 917 ${100 + (hash % 900)} ${1000 + (hash % 8999)}`,
    email: applicant.email ?? `${applicant.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@email.com`,
    schedule: applicant.schedule ?? {
      date: 'August 28, 2026',
      time: '09:00 AM',
      venue: `NTC Region ${index + 1} Office, ${cities[index]}`,
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalization & API Data Mappers
// ─────────────────────────────────────────────────────────────────────────────

export function normalizeApplicationStatus(rawStatus: string | undefined | null): ApplicationStatus {
  if (!rawStatus) return 'PENDING';
  const s = rawStatus.toUpperCase().replace(/\s+/g, '_').replace(/_/g, '');
  if (s.includes('FORISSUANCE') || s.includes('ISSUANCE') || s.includes('FORAPPROVAL') || s.includes('APPROVAL')) return 'FOR_APPROVAL';
  if (s.includes('FORORDEROFPAYMENT') || s.includes('FORACCOUNTANT') || s.includes('EVALUAT') || s.includes('UNDEREVALUATION')) return 'FOR_EVALUATION';
  if (s.includes('APPROV') || s.includes('COMPLET') || s.includes('ISSUED')) return 'APPROVED';
  if (s.includes('DECLIN') || s.includes('REJECT') || s.includes('RETURN')) return 'DECLINED';
  if (s.includes('PENDINGPAYMENT') || s.includes('READYFORPAYMENT') || s.includes('FORPAYMENT') || s === 'PAYMENT' || s === 'FOR_PAYMENT') return 'READY_FOR_PAYMENT';
  if (s.includes('EXPIR')) return 'EXPIRING_SOON';
  if (s.includes('DRAFT') || s.includes('SUBMIT')) return 'PENDING';
  return 'PENDING';
}

interface ApiApplicantDto {
  id?: string;
  name?: string;
  applicantType?: string;
  status?: string;
  includedInSOA?: boolean;
  companyName?: string;
  company?: { name?: string; address?: string };
  representativeName?: string;
  notes?: string;
  evaluationRemarks?: string;
  birthDate?: string;
  birthMonth?: string;
  birthDay?: string;
  birthYear?: string;
  civilStatus?: string;
  examineeType?: string;
  details?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    sex?: string;
    nationality?: string;
    address?: string;
    streetAddress?: string;
    barangay?: string;
    barangayName?: string;
    cityMunicipality?: string;
    province?: string;
    region?: string;
    zipCode?: string;
    contactNumber?: string;
    mobileNumber?: string;
    emailAddress?: string;
    email?: string;
    birthDate?: string;
    birthMonth?: string;
    birthDay?: string;
    birthYear?: string;
    civilStatus?: string;
    companyName?: string;
    representativeName?: string;
    notes?: string;
    examineeType?: string;
    formFieldValues?: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  };
  formFieldValues?: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  sex?: string;
  nationality?: string;
  address?: string;
  streetAddress?: string;
  barangay?: string;
  barangayName?: string;
  cityMunicipality?: string;
  province?: string;
  region?: string;
  zipCode?: string;
  contactNumber?: string;
  mobileNumber?: string;
  emailAddress?: string;
  email?: string;
  serviceId?: string;
  serviceVariantId?: string;
  requirements?: RawRequirement[];
  Requirements?: RawRequirement[];
  applicationRequirements?: RawRequirement[];
  ApplicationRequirements?: RawRequirement[];
  documents?: RawRequirement[];
  Documents?: RawRequirement[];
}

export interface ApiApplicationDto {
  id?: string;
  tenantId?: string;
  applicationNumber?: string;
  referenceNumber?: string;
  status?: string;
  submissionMode?: string;
  mode?: string;
  office?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
  lastModifiedAt?: string;
  submittedAt?: string;
  serviceName?: string;
  serviceCategory?: string;
  serviceId?: string;
  serviceVariantId?: string;
  serviceVariantName?: string;
  soaNumber?: string | null;
  officialReceiptNumber?: string;
  OfficialReceiptNumber?: string;
  amountPaid?: number;
  AmountPaid?: number;
  paidAt?: string;
  PaidAt?: string;
  intent?: string;
  Intent?: string;
  assessedAt?: string;
  AssessedAt?: string;
  convertedToRegularAt?: string;
  ConvertedToRegularAt?: string;
  assessmentVersion?: number;
  AssessmentVersion?: number;
  assessmentRemarks?: string;
  AssessmentRemarks?: string;
  evaluatingOfficer?: string;
  issuingOfficer?: string;
  filingUser?: {
    id?: string;
    name?: string;
    email?: string;
    company?: { name?: string; address?: string };
  };
  services?: Array<{ id?: string; name?: string; category?: string }>;
  applicants?: ApiApplicantDto[];
  Applicants?: ApiApplicantDto[];
  applicationApplicants?: ApiApplicantDto[];
  ApplicationApplicants?: ApiApplicantDto[];
  requirements?: RawRequirement[];
  Requirements?: RawRequirement[];
  applicationRequirements?: RawRequirement[];
  ApplicationRequirements?: RawRequirement[];
  documents?: RawRequirement[];
  Documents?: RawRequirement[];
  companyName?: string;
  applicantName?: string;
  histories?: Array<{
    id?: string;
    action?: string;
    fromStatus?: string;
    toStatus?: string;
    staffName?: string;
    staffRole?: string;
    remarks?: string;
    timestamp?: string;
  }>;
  Histories?: Array<{
    id?: string;
    action?: string;
    fromStatus?: string;
    toStatus?: string;
    staffName?: string;
    staffRole?: string;
    remarks?: string;
    timestamp?: string;
  }>;
  statementsOfAccount?: Array<{
    id?: string;
    soaNumber?: string;
    status?: string;
    issuedToType?: string;
    issuedToName?: string;
    issuedToAddress?: string;
    totalAmount?: number;
    dueDate?: string;
    remarks?: string;
    lineItems?: Array<{
      id?: string;
      particular?: string;
      itemCode?: string;
      description?: string;
      validityYears?: number;
      noOfUnits?: number;
      feeRate?: number;
      amount?: number;
    }>;
  }>;
  StatementsOfAccount?: Array<{
    id?: string;
    soaNumber?: string;
    status?: string;
    issuedToType?: string;
    issuedToName?: string;
    issuedToAddress?: string;
    totalAmount?: number;
    dueDate?: string;
    remarks?: string;
    lineItems?: Array<{
      id?: string;
      particular?: string;
      itemCode?: string;
      description?: string;
      validityYears?: number;
      noOfUnits?: number;
      feeRate?: number;
      amount?: number;
    }>;
  }>;
  ordersOfPayment?: Array<{
    id?: string;
    opNumber?: string;
    status?: string;
    amountDue?: number;
    amountReceived?: number;
    paymentMethod?: string;
    officialReceiptNumber?: string;
    paidAt?: string;
    remarks?: string;
  }>;
  OrdersOfPayment?: Array<{
    id?: string;
    opNumber?: string;
    status?: string;
    amountDue?: number;
    amountReceived?: number;
    paymentMethod?: string;
    officialReceiptNumber?: string;
    paidAt?: string;
    remarks?: string;
  }>;
}

export function mapApiApplicationToApplication(dto: ApiApplicationDto): Application {
  const modeStr = (dto.submissionMode || dto.mode || '').toString().toUpperCase();
  const isBulk = modeStr === 'BULK';
  const rawStatus = dto.status || 'PENDING';
  const status = normalizeApplicationStatus(rawStatus);

  const rawApplicants = dto.applicants || dto.Applicants || [];
  const filingUser = dto.filingUser;
  const companyName =
    dto.companyName ||
    filingUser?.company?.name ||
    (rawApplicants.length > 0 ? rawApplicants[0]?.company?.name : undefined) ||
    filingUser?.name ||
    'Company Applicant';

  const isGenericCandidate = (val?: string | null): boolean => {
    if (!val || typeof val !== 'string') return true;
    const lower = val.trim().toLowerCase();
    if (['applicant details', 'applicant detail', 'applicant', 'unnamed applicant', 'unnamed', 'n/a', 'na', 'none', 'juan dela cruz'].includes(lower)) return true;
    if (/^applicant(\s*#?\s*\d+)?$/i.test(lower)) return true;
    if (/^draft(\s+applicant)?(\s*#?\s*\d+)?$/i.test(lower)) return true;
    return false;
  };

  const isValidCandidate = (val?: string | null): val is string => {
    return typeof val === 'string' && val.trim().length > 0 && !isGenericCandidate(val);
  };

  const formatProperName = (name?: string | null): string => {
    if (!name || typeof name !== 'string') return '';
    const trimmed = name.trim();
    if (!trimmed) return '';

    return trimmed
      .split(/\s+/)
      .map((word) => {
        if (!word) return '';
        if (word.includes('-')) {
          return word
            .split('-')
            .map((part) => {
              if (!part) return '';
              if (part === part.toLowerCase()) {
                return part.charAt(0).toUpperCase() + part.slice(1);
              }
              return part;
            })
            .join('-');
        }
        if (word === word.toLowerCase()) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');
  };

  const firstApplicant = rawApplicants.length > 0 ? rawApplicants[0] : undefined;
  const firstDetails = firstApplicant?.details || firstApplicant;
  const rawFirstAppCandidate =
    firstDetails?.firstName && firstDetails?.lastName
      ? [firstDetails.firstName, firstDetails.middleName, firstDetails.lastName].filter(Boolean).join(' ')
      : firstApplicant?.name;

  const firstDetailsComp = firstDetails?.companyName;
  const firstAppComp = firstApplicant?.companyName;
  const firstAppNestedComp = firstApplicant?.company?.name;

  const applicantName =
    isValidCandidate(dto.applicantName)
      ? formatProperName(dto.applicantName)
      : isValidCandidate(rawFirstAppCandidate)
        ? formatProperName(rawFirstAppCandidate)
        : isValidCandidate(firstDetailsComp)
          ? formatProperName(firstDetailsComp)
          : isValidCandidate(firstAppComp)
            ? formatProperName(firstAppComp)
            : isValidCandidate(firstAppNestedComp)
              ? formatProperName(firstAppNestedComp)
              : isValidCandidate(companyName)
                ? formatProperName(companyName)
                : formatProperName(filingUser?.name) || 'Applicant';

  const refNumber =
    dto.referenceNumber ||
    dto.applicationNumber ||
    (dto.id ? String(dto.id).slice(0, 8).toUpperCase() : 'REF-PENDING');

  const serviceFromList = dto.services && dto.services.length > 0 ? dto.services[0]?.name : undefined;
  const serviceName = dto.serviceName || serviceFromList || dto.remarks || dto.office || 'NTC Service Application';
  const categoryFromList = dto.services && dto.services.length > 0 ? dto.services[0]?.category : undefined;
  const serviceCategory = dto.serviceCategory || categoryFromList || 'General';
  const submittedAt = dto.updatedAt || dto.lastModifiedAt || dto.createdAt || dto.submittedAt || new Date().toISOString();

  const mappedApplicants: BulkApplicant[] = rawApplicants.map((ap, idx) => {
    const apDetails = ap.details || ap;
    const apFormFields = ap.formFieldValues || apDetails.formFieldValues || [];
    const findApFv = (predicate: (lbl: string, id: string) => boolean) =>
      apFormFields.find((f: { fieldLabel?: string; label?: string; key?: string; fieldId?: string; value?: string }) =>
        predicate((f.fieldLabel || f.label || f.key || '').toLowerCase(), f.fieldId || '')
      )?.value;

    const rawCandidate =
      apDetails.firstName && apDetails.lastName
        ? [apDetails.firstName, apDetails.middleName, apDetails.lastName].filter(Boolean).join(' ')
        : ap.name;

    const fvNameCandidate = findApFv((lbl) =>
      lbl.includes('full name') ||
      lbl.includes('applicant name') ||
      lbl.includes('name of applicant') ||
      lbl.includes('business name') ||
      lbl.includes('company name') ||
      lbl.includes('corporate name')
    );

    const appType = ap.applicantType || 'Individual';
    const appStatus = normalizeApplicationStatus(ap.status || rawStatus);

    const compName =
      apDetails.companyName ||
      ap.companyName ||
      ap.company?.name ||
      (appType === 'Company' ? companyName : undefined);

    const repName =
      apDetails.representativeName ||
      ap.representativeName ||
      (appType === 'Company' ? (filingUser?.name || undefined) : undefined);

    const name =
      isValidCandidate(rawCandidate)
        ? formatProperName(rawCandidate)
        : isValidCandidate(fvNameCandidate)
          ? formatProperName(fvNameCandidate)
          : isValidCandidate(compName)
            ? formatProperName(compName)
            : isValidCandidate(repName)
              ? formatProperName(repName)
              : formatProperName(filingUser?.name) || formatProperName(compName) || formatProperName(repName) || 'Applicant';

    const birthDate =
      apDetails.birthDate ||
      (apDetails.birthMonth && apDetails.birthDay && apDetails.birthYear
        ? `${apDetails.birthMonth} ${apDetails.birthDay}, ${apDetails.birthYear}`
        : findApFv((lbl) => lbl.includes('birth')));

    const civilStatus = apDetails.civilStatus || findApFv((lbl) => lbl.includes('civil') || lbl.includes('marital'));
    const barangay = apDetails.barangayName || apDetails.barangay || findApFv((lbl) => lbl.includes('barangay')) || '';
    const cityMunicipality = apDetails.cityMunicipality || findApFv((lbl) => lbl.includes('city') || lbl.includes('municipality')) || 'N/A';
    const province = apDetails.province || findApFv((lbl) => lbl.includes('province')) || 'N/A';
    const region = apDetails.region || findApFv((lbl) => lbl.includes('region')) || 'N/A';
    const zipCode = apDetails.zipCode || findApFv((lbl) => lbl.includes('zip')) || '';

    const notes = apDetails.notes || ap.notes || ap.evaluationRemarks;

    return {
      id: ap.id || `app-cand-${idx}`,
      name,
      applicationType: appType,
      status: appStatus,
      includedInSOA: ap.includedInSOA !== undefined ? ap.includedInSOA : true,
      sex: apDetails.sex === 'Female' ? 'Female' : 'Male',
      nationality: apDetails.nationality || 'Filipino',
      streetAddress: apDetails.address || apDetails.streetAddress || 'N/A',
      barangay,
      cityMunicipality,
      province,
      region,
      zipCode,
      mobileNumber: apDetails.contactNumber || apDetails.mobileNumber || 'N/A',
      email: apDetails.emailAddress || apDetails.email || 'N/A',
      examineeType: (apDetails.examineeType || ap.examineeType || 'New') as ExamineeType,
      birthDate,
      civilStatus,
      companyName: compName,
      representativeName: repName,
      notes,
      details: {
        firstName: apDetails.firstName,
        lastName: apDetails.lastName,
        sex: apDetails.sex === 'Female' ? 'Female' : 'Male',
        nationality: apDetails.nationality,
        address: apDetails.address || apDetails.streetAddress,
        barangay,
        cityMunicipality,
        province,
        region,
        zipCode,
        contactNumber: apDetails.contactNumber || apDetails.mobileNumber,
        emailAddress: apDetails.emailAddress || apDetails.email,
        examineeType: (apDetails.examineeType || ap.examineeType || 'New') as ExamineeType,
        birthDate,
        civilStatus,
        companyName: compName,
        representativeName: repName,
        notes,
        formFieldValues: apFormFields,
      },
      formFieldValues: apFormFields,
      serviceId: ap.serviceId || dto.serviceId,
      serviceVariantId: ap.serviceVariantId || dto.serviceVariantId,
    };
  });

  const reqDocs =
    dto.requirements ||
    dto.Requirements ||
    (dto as { applicationRequirements?: RawRequirement[] }).applicationRequirements ||
    (dto as { ApplicationRequirements?: RawRequirement[] }).ApplicationRequirements ||
    dto.documents ||
    dto.Documents ||
    [];
  const rawVariantName =
    dto.serviceVariantName ||
    (rawApplicants.length > 0 ? (rawApplicants[0] as { serviceVariantName?: string })?.serviceVariantName : undefined);

  const primaryFormFieldValues = firstApplicant?.formFieldValues || [];

  const variantFromFields = primaryFormFieldValues.find(
    (fv) =>
      fv.fieldLabel?.toLowerCase().includes('permit / license type') ||
      fv.fieldLabel?.toLowerCase().includes('type of certificate') ||
      fv.fieldLabel?.toLowerCase().includes('application variant') ||
      fv.fieldLabel?.toLowerCase().includes('application type') ||
      fv.fieldId === 'fd000000-0000-0000-0000-000000000024' ||
      fv.fieldId === 'fd000000-0000-0000-0000-000000000014'
  )?.value;

  const resolvedVariantName = rawVariantName || variantFromFields || '';

  const rawHistories = dto.histories || dto.Histories || [];
  const mappedHistories = rawHistories.map((h, hIdx) => ({
    id: h.id || `hist-${hIdx}`,
    action: h.action || (h.toStatus ? `Status: ${h.toStatus}` : 'Application Event'),
    fromStatus: h.fromStatus,
    toStatus: h.toStatus || 'Submitted',
    staffName: h.staffName || 'Authorized Officer',
    staffRole: h.staffRole || 'Processing Officer',
    remarks: h.remarks,
    timestamp: h.timestamp || '',
  }));

  const hasSubmission = mappedHistories.some(
    (h) => h.action.toLowerCase().includes('submitted') || h.action.toLowerCase().includes('application received')
  );
  if (!hasSubmission) {
    const submissionDate =
      dto.submittedAt ||
      dto.createdAt ||
      (mappedHistories.length > 0 ? mappedHistories[0].timestamp : '') ||
      new Date().toISOString();
    const submitterName =
      dto.filingUser?.name ||
      dto.applicantName ||
      (firstApplicant?.name) ||
      'Applicant';

    mappedHistories.unshift({
      id: `init-${dto.id || 'app'}`,
      action: 'Application Submitted',
      fromStatus: undefined,
      toStatus: 'Submitted',
      staffName: submitterName,
      staffRole: 'Applicant',
      remarks: 'Application submitted through the portal.',
      timestamp: submissionDate,
    });
  }

  const rawSoas = (dto.statementsOfAccount || dto.StatementsOfAccount || []);
  const rawOps = (dto.ordersOfPayment || dto.OrdersOfPayment || []);
  const primarySoaDto = rawSoas.length > 0 ? rawSoas[0] : undefined;
  const primaryOpDto = rawOps.length > 0 ? rawOps[0] : undefined;

  const resolvedOrNumber =
    dto.officialReceiptNumber ||
    dto.OfficialReceiptNumber ||
    primaryOpDto?.officialReceiptNumber ||
    undefined;

  const resolvedAmountPaid =
    typeof dto.amountPaid === 'number'
      ? dto.amountPaid
      : typeof dto.AmountPaid === 'number'
        ? dto.AmountPaid
        : typeof primaryOpDto?.amountReceived === 'number'
          ? primaryOpDto.amountReceived
          : undefined;

  const resolvedPaidAt =
    dto.paidAt ||
    dto.PaidAt ||
    primaryOpDto?.paidAt ||
    undefined;

  const mappedSoa: SoaData | undefined = primarySoaDto
    ? {
        id: primarySoaDto.id,
        soaNumber: primarySoaDto.soaNumber || (dto.soaNumber ?? ''),
        status: primarySoaDto.status || 'Active',
        issuedToType: primarySoaDto.issuedToType,
        issuedToName: primarySoaDto.issuedToName,
        issuedToAddress: primarySoaDto.issuedToAddress,
        totalAmount: typeof primarySoaDto.totalAmount === 'number' ? primarySoaDto.totalAmount : 0,
        dueDate: primarySoaDto.dueDate,
        remarks: primarySoaDto.remarks,
        preparedByName: (primarySoaDto as { preparedByName?: string }).preparedByName,
        preparedByTitle: (primarySoaDto as { preparedByTitle?: string }).preparedByTitle,
        approvedByName: (primarySoaDto as { approvedByName?: string }).approvedByName,
        approvedByTitle: (primarySoaDto as { approvedByTitle?: string }).approvedByTitle,
        lineItems: (primarySoaDto.lineItems || []).map((li) => ({
          id: li.id,
          particular: li.particular || 'Regulatory Fee Assessment',
          itemCode: li.itemCode || 'NTC-FEE',
          description: li.description,
          validityYears: typeof li.validityYears === 'number' && li.validityYears > 0 ? li.validityYears : 1,
          noOfUnits: typeof li.noOfUnits === 'number' && li.noOfUnits > 0 ? li.noOfUnits : 1,
          feeRate: typeof li.feeRate === 'number' ? li.feeRate : 0,
          amount: typeof li.amount === 'number' ? li.amount : 0,
        })),
      }
    : undefined;

  const mappedOp: OpData | undefined = primaryOpDto
    ? {
        id: primaryOpDto.id,
        opNumber: primaryOpDto.opNumber || '',
        status: primaryOpDto.status || 'Active',
        amountDue: typeof primaryOpDto.amountDue === 'number' ? primaryOpDto.amountDue : 0,
        amountReceived: typeof primaryOpDto.amountReceived === 'number' ? primaryOpDto.amountReceived : (resolvedAmountPaid ?? 0),
        paymentMethod: primaryOpDto.paymentMethod,
        officialReceiptNumber: primaryOpDto.officialReceiptNumber || resolvedOrNumber,
        paidAt: primaryOpDto.paidAt || resolvedPaidAt,
        remarks: primaryOpDto.remarks,
      }
    : (resolvedOrNumber ? {
        id: 'op-auto-gen',
        opNumber: '',
        status: 'PAID',
        amountDue: 0,
        amountReceived: resolvedAmountPaid ?? 0,
        officialReceiptNumber: resolvedOrNumber,
        paidAt: resolvedPaidAt,
      } : undefined);

  let mappedSoaItems: SoaLineItem[] = mappedSoa?.lineItems || [];
  const svcLower = (serviceName || '').toLowerCase();
  const catLower = (serviceCategory || '').toLowerCase();
  const isExam = catLower.includes('exam') || svcLower.includes('exam') || svcLower.includes('admission');

  if (mappedSoaItems.length === 0 && (status === 'READY_FOR_PAYMENT' || dto.soaNumber)) {
    const units = isBulk ? (mappedApplicants.length || 1) : 1;
    if (isExam) {
      mappedSoaItems = [
        {
          id: 'fee-exam-1',
          particular: 'Examination Fee',
          itemCode: '4-02-01-030',
          validityYears: 1,
          noOfUnits: units,
          feeRate: 50,
          amount: 50 * units,
        },
      ];
    } else {
      const filingFee = 180;
      const permitFee = 1200;
      mappedSoaItems = [
        {
          id: 'fee-filing-1',
          particular: 'Filing & Processing Fee',
          itemCode: 'NTC-FF-01',
          validityYears: 1,
          noOfUnits: units,
          feeRate: filingFee,
          amount: filingFee * units,
        },
        {
          id: 'fee-lic-1',
          particular: `${serviceName || 'Permit / License'} Regulatory Fee`,
          itemCode: 'NTC-RF-02',
          validityYears: 1,
          noOfUnits: units,
          feeRate: permitFee,
          amount: permitFee * units,
        },
      ];
    }
  }

  const calculatedTotalDue =
    mappedSoa && typeof mappedSoa.totalAmount === 'number' && mappedSoa.totalAmount > 0
      ? mappedSoa.totalAmount
      : mappedOp && typeof mappedOp.amountDue === 'number' && mappedOp.amountDue > 0
      ? mappedOp.amountDue
      : mappedSoaItems.length > 0
      ? mappedSoaItems.reduce((acc, item) => acc + (typeof item.amount === 'number' ? item.amount : 0), 0)
      : (status === 'READY_FOR_PAYMENT' || dto.soaNumber ? (isExam ? 50 : 1380) : undefined);

  const resolvedDueDate = mappedSoa?.dueDate;
  const resolvedSoaNumber = mappedSoa?.soaNumber || dto.soaNumber || (status === 'READY_FOR_PAYMENT' ? `SOA-${refNumber}` : null);
  const resolvedOpNumber = mappedOp?.opNumber || (status === 'READY_FOR_PAYMENT' ? `OP-${refNumber}` : null);

  const rawIntentStr = (dto.intent || dto.Intent || '').toString().toLowerCase();
  const isAssessmentOnly = rawIntentStr === 'assessmentonly' || rawIntentStr === 'assessment_only' || rawIntentStr === 'assessment';
  const intent: 'Regular' | 'AssessmentOnly' = isAssessmentOnly ? 'AssessmentOnly' : 'Regular';

  if (isBulk) {
    const bulkApp: BulkApplication = {
      id: dto.id || '',
      referenceNumber: refNumber,
      mode: 'BULK',
      intent,
      isAssessmentOnly,
      assessedAt: dto.assessedAt || dto.AssessedAt,
      convertedToRegularAt: dto.convertedToRegularAt || dto.ConvertedToRegularAt,
      assessmentVersion: dto.assessmentVersion || dto.AssessmentVersion || 1,
      assessmentRemarks: dto.assessmentRemarks || dto.AssessmentRemarks,
      companyName,
      serviceName,
      serviceCategory,
      element: (resolvedVariantName || 'New') as ExamineeType,
      status,
      submittedAt,
      applicants: mappedApplicants,
      soaNumber: resolvedSoaNumber,
      soa: mappedSoa,
      op: mappedOp,
      soaItems: mappedSoaItems,
      totalAmountDue: calculatedTotalDue,
      dueDate: resolvedDueDate,
      opNumber: resolvedOpNumber,
      officialReceiptNumber: resolvedOrNumber,
      amountPaid: resolvedAmountPaid,
      paidAt: resolvedPaidAt,
      submissionMode: 'BULK',
      documents: reqDocs,
      requirements: reqDocs,
      formFieldValues: primaryFormFieldValues,
      office: dto.office,
      remarks: dto.remarks,
      serviceVariantName: resolvedVariantName,
      tenantId: dto.tenantId,
      serviceId: dto.serviceId,
      serviceVariantId: dto.serviceVariantId,
      histories: mappedHistories,
      history: mappedHistories,
      evaluatingOfficer: (primarySoaDto as { preparedByName?: string })?.preparedByName || dto.evaluatingOfficer,
      issuingOfficer: (primarySoaDto as { approvedByName?: string })?.approvedByName || dto.issuingOfficer,
      filingUser: dto.filingUser,
      rawStatus,
    };
    return bulkApp;
  }

  const singleApp: SingleApplication = {
    id: dto.id || '',
    referenceNumber: refNumber,
    mode: 'SINGLE',
    applicantType: firstApplicant?.applicantType || (dto as { applicantType?: string }).applicantType || 'Individual',
    intent,
    isAssessmentOnly,
    assessedAt: dto.assessedAt || dto.AssessedAt,
    convertedToRegularAt: dto.convertedToRegularAt || dto.ConvertedToRegularAt,
    assessmentVersion: dto.assessmentVersion || dto.AssessmentVersion || 1,
    assessmentRemarks: dto.assessmentRemarks || dto.AssessmentRemarks,
    serviceName,
    serviceCategory,
    element: (resolvedVariantName || 'New') as ExamineeType,
    status,
    submittedAt,
    serviceId: dto.serviceId,
    serviceVariantId: dto.serviceVariantId,
    filingUser: dto.filingUser,
    applicantName,
    sex: firstDetails?.sex === 'Female' ? 'Female' : 'Male',
    nationality: firstDetails?.nationality || 'Filipino',
    streetAddress: firstDetails?.address || firstDetails?.streetAddress || 'N/A',
    barangay: firstDetails?.barangayName || firstDetails?.barangay || '',
    cityMunicipality: firstDetails?.cityMunicipality || 'N/A',
    province: firstDetails?.province || 'N/A',
    region: firstDetails?.region || 'N/A',
    zipCode: firstDetails?.zipCode || '',
    mobileNumber: firstDetails?.contactNumber || firstDetails?.mobileNumber || 'N/A',
    email: firstDetails?.emailAddress || firstDetails?.email || 'N/A',
    examineeType: (resolvedVariantName || 'New') as ExamineeType,
    schedule: {
      date: 'TBD',
      time: 'TBD',
      venue: dto.office || 'NTC Regional Office',
    },
    submissionMode: 'SINGLE',
    applicants: mappedApplicants,
    documents: reqDocs,
    requirements: reqDocs,
    formFieldValues: primaryFormFieldValues,
    office: dto.office,
    remarks: dto.remarks,
    serviceVariantName: resolvedVariantName,
    tenantId: dto.tenantId,
    soaNumber: resolvedSoaNumber,
    soa: mappedSoa,
    op: mappedOp,
    soaItems: mappedSoaItems,
    totalAmountDue: calculatedTotalDue,
    dueDate: resolvedDueDate,
    opNumber: resolvedOpNumber,
    officialReceiptNumber: resolvedOrNumber,
    amountPaid: resolvedAmountPaid,
    paidAt: resolvedPaidAt,
    histories: mappedHistories,
    history: mappedHistories,
    evaluatingOfficer: (primarySoaDto as { preparedByName?: string })?.preparedByName || dto.evaluatingOfficer,
    issuingOfficer: (primarySoaDto as { approvedByName?: string })?.approvedByName || dto.issuingOfficer,
    rawStatus,
  };
  return singleApp;
}

export function getApplicantDocuments(applicant: BulkApplicant): ApplicationDocument[] {
  const docs: ApplicationDocument[] = [];
  const rawReqs: RawRequirement[] =
    (applicant as { requirements?: RawRequirement[]; Requirements?: RawRequirement[] }).requirements ||
    (applicant as { requirements?: RawRequirement[]; Requirements?: RawRequirement[] }).Requirements ||
    [];

  if (rawReqs.length > 0) {
    return rawReqs.map((req, idx) => {
      const urlStr = req.url || '';
      const rawName = req.fileName || req.name || (urlStr ? urlStr.split('/').pop() : undefined) || `${applicant.name || 'Applicant'}_Attachment_${idx + 1}.pdf`;
      const ext = rawName.toLowerCase().split('.').pop() || '';
      
      let typ: 'PDF' | 'IMAGE' | 'DOCX' | 'ZIP' = 'PDF';
      if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(ext)) {
        typ = 'IMAGE';
      } else if (['zip', 'rar', '7z'].includes(ext)) {
        typ = 'ZIP';
      } else if (['doc', 'docx'].includes(ext)) {
        typ = 'DOCX';
      }

      let sizeFormatted = req.size;
      if (!sizeFormatted && req.fileSizeBytes) {
        if (req.fileSizeBytes >= 1024 * 1024) {
          sizeFormatted = `${(req.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`;
        } else {
          sizeFormatted = `${Math.round(req.fileSizeBytes / 1024)} KB`;
        }
      }

      return {
        id: req.id || req.storedFileId || `${applicant.id}-req-${idx + 1}`,
        name: rawName,
        type: typ,
        size: sizeFormatted || '350 KB',
        category: 'ATTACHMENT',
        uploadedAt: req.uploadedAt || new Date().toISOString(),
        url: req.url,
        storedFileId: req.storedFileId,
      };
    });
  }

  return docs;
}

