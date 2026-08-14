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
export type ModeFilterOption = 'ALL' | 'SINGLE' | 'BULK';
export type StatusFilterOption = 'ALL' | 'FOR_APPROVAL' | 'FOR_EVALUATION' | 'APPROVED' | 'EXPIRING_SOON' | 'PENDING';
export type DensityOption = 'std' | 'cozy' | 'compact';
export type ExamineeType = 'New' | 'Renewal' | 'Modification' | 'Upgrading' | 'Additional';

export interface ApplicationDocument {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'ZIP' | 'IMAGE';
  size: string;
  category: 'ATTACHMENT' | 'ISSUED_PERMIT' | 'RECEIPT' | 'SOA' | 'ADMISSION_SLIP';
  uploadedAt: string;
}

export interface RawRequirement {
  id?: string;
  name?: string;
  fileName?: string;
  url?: string;
  size?: string;
  category?: string;
  uploadedAt?: string;
}

export interface Schedule {
  date: string;
  time: string;
  venue: string;
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
  requirements?: RawRequirement[];
  Requirements?: RawRequirement[];
  documents?: RawRequirement[];
  Documents?: RawRequirement[];
  soaNumber?: string | null;
  formFieldValues?: Array<{ fieldId: string; fieldLabel: string; value: string }>;
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
}

export interface BulkApplication {
  id: string;
  referenceNumber: string;
  mode: 'BULK';
  companyName: string;
  serviceName: string;
  serviceCategory: string;
  element: ExamineeType;
  status: ApplicationStatus;
  submittedAt: string;
  applicants: BulkApplicant[];
  soaNumber: string | null;

  // Backend dynamic fields compatibility
  submissionMode?: string;
  Applicants?: BulkApplicant[];
  companyDetail?: { name?: string };
  requirements?: RawRequirement[];
  Requirements?: RawRequirement[];
  documents?: RawRequirement[];
  Documents?: RawRequirement[];
  formFieldValues?: Array<{ fieldId: string; fieldLabel: string; value: string }>;

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
    case 'FOR_APPROVAL':     return 'For Approval';
    case 'FOR_EVALUATION':   return 'For Evaluation';
    case 'APPROVED':         return 'Approved';
    case 'DECLINED':         return 'Declined';
    case 'EXPIRING_SOON':    return 'Expiring Soon';
    case 'READY_FOR_PAYMENT':return 'Ready For Payment';
    case 'PENDING':          return 'Pending';
  }
}

export function getStatusColor(status: ApplicationStatus): string {
  switch (status) {
    case 'FOR_APPROVAL':     return '#2F56E8';
    case 'FOR_EVALUATION':   return '#D97706';
    case 'APPROVED':         return '#16A34A';
    case 'DECLINED':         return '#DC2626';
    case 'EXPIRING_SOON':    return '#EA580C';
    case 'READY_FOR_PAYMENT':return '#16A34A';
    case 'PENDING':          return '#94A3B8';
  }
}

export function getStatusBgColor(status: ApplicationStatus): string {
  switch (status) {
    case 'FOR_APPROVAL':     return '#EEF2FF';
    case 'FOR_EVALUATION':   return '#FEF3C7';
    case 'APPROVED':         return '#DCFCE7';
    case 'DECLINED':         return '#FEE2E2';
    case 'EXPIRING_SOON':    return '#FFF7ED';
    case 'READY_FOR_PAYMENT':return '#DCFCE7';
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
  const ref = app.referenceNumber;

  if (app.mode === 'SINGLE') {
    docs.push({
      id: `${app.id}-doc-1`,
      name: `Admission_Slip_${ref.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      type: 'PDF',
      size: '284 KB',
      category: 'ADMISSION_SLIP',
      uploadedAt: app.submittedAt,
    });
    docs.push({
      id: `${app.id}-doc-2`,
      name: `Submitted_Application_Form.pdf`,
      type: 'PDF',
      size: '1.4 MB',
      category: 'ATTACHMENT',
      uploadedAt: app.submittedAt,
    });
    docs.push({
      id: `${app.id}-doc-3`,
      name: `Government_ID_Verification.pdf`,
      type: 'PDF',
      size: '890 KB',
      category: 'ATTACHMENT',
      uploadedAt: app.submittedAt,
    });

    if (app.status === 'APPROVED' || app.status === 'READY_FOR_PAYMENT') {
      docs.push({
        id: `${app.id}-doc-4`,
        name: `Official_Receipt_OR-2026.pdf`,
        type: 'PDF',
        size: '195 KB',
        category: 'RECEIPT',
        uploadedAt: app.submittedAt,
      });
    }

    if (app.status === 'APPROVED') {
      docs.push({
        id: `${app.id}-doc-5`,
        name: `NTC_Official_License_Certificate.pdf`,
        type: 'PDF',
        size: '560 KB',
        category: 'ISSUED_PERMIT',
        uploadedAt: app.submittedAt,
      });
    }
  } else {
    docs.push({
      id: `${app.id}-doc-1`,
      name: `Statement_of_Account_${app.soaNumber ?? 'BATCH-2026'}.pdf`,
      type: 'PDF',
      size: '410 KB',
      category: 'SOA',
      uploadedAt: app.submittedAt,
    });
    docs.push({
      id: `${app.id}-doc-2`,
      name: `Master_Applicant_Roster_${app.companyName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      type: 'PDF',
      size: '2.4 MB',
      category: 'ATTACHMENT',
      uploadedAt: app.submittedAt,
    });
    docs.push({
      id: `${app.id}-doc-3`,
      name: `Company_SEC_Board_Resolution.pdf`,
      type: 'PDF',
      size: '1.8 MB',
      category: 'ATTACHMENT',
      uploadedAt: app.submittedAt,
    });

    if (app.status === 'APPROVED') {
      docs.push({
        id: `${app.id}-doc-4`,
        name: `Batch_Approved_Certificates.zip`,
        type: 'ZIP',
        size: '8.7 MB',
        category: 'ISSUED_PERMIT',
        uploadedAt: app.submittedAt,
      });
      docs.push({
        id: `${app.id}-doc-5`,
        name: `Batch_Official_Payment_Receipt.pdf`,
        type: 'PDF',
        size: '320 KB',
        category: 'RECEIPT',
        uploadedAt: app.submittedAt,
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
  const s = rawStatus.toUpperCase().replace(/\s+/g, '_');
  if (s.includes('FOR_APP') || s.includes('APPROVAL')) return 'FOR_APPROVAL';
  if (s.includes('EVALUAT') || s.includes('UNDER_EVALUATION')) return 'FOR_EVALUATION';
  if (s.includes('APPROV')) return 'APPROVED';
  if (s.includes('DECLIN') || s.includes('REJECT')) return 'DECLINED';
  if (s.includes('RETURN')) return 'DECLINED';
  if (s.includes('COMPLET')) return 'APPROVED';
  if (s.includes('DRAFT')) return 'PENDING';
  if (s.includes('PAYMENT')) return 'READY_FOR_PAYMENT';
  if (s.includes('EXPIR')) return 'EXPIRING_SOON';
  if (s.includes('SUBMIT')) return 'PENDING';
  return 'PENDING';
}

interface ApiApplicantDto {
  id?: string;
  name?: string;
  applicantType?: string;
  status?: string;
  includedInSOA?: boolean;
  company?: { name?: string; address?: string };
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
}

interface ApiApplicationDto {
  id?: string;
  applicationNumber?: string;
  referenceNumber?: string;
  status?: string;
  submissionMode?: string;
  mode?: string;
  office?: string;
  remarks?: string;
  createdAt?: string;
  submittedAt?: string;
  serviceName?: string;
  serviceCategory?: string;
  soaNumber?: string | null;
  filingUser?: {
    id?: string;
    name?: string;
    email?: string;
    company?: { name?: string; address?: string };
  };
  services?: Array<{ id?: string; name?: string; category?: string }>;
  applicants?: ApiApplicantDto[];
  Applicants?: ApiApplicantDto[];
  requirements?: RawRequirement[];
  Requirements?: RawRequirement[];
  documents?: RawRequirement[];
  Documents?: RawRequirement[];
  companyName?: string;
  applicantName?: string;
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

  const firstApplicant = rawApplicants.length > 0 ? rawApplicants[0] : undefined;
  const firstDetails = firstApplicant?.details || firstApplicant;
  const applicantName =
    dto.applicantName ||
    (firstDetails?.firstName && firstDetails?.lastName
      ? `${firstDetails.firstName} ${firstDetails.lastName}`
      : firstApplicant?.name || filingUser?.name || 'Applicant');

  const refNumber =
    dto.referenceNumber ||
    dto.applicationNumber ||
    (dto.id ? String(dto.id).slice(0, 8).toUpperCase() : 'REF-PENDING');

  const serviceFromList = dto.services && dto.services.length > 0 ? dto.services[0]?.name : undefined;
  const serviceName = dto.serviceName || serviceFromList || dto.remarks || dto.office || 'NTC Service Application';
  const categoryFromList = dto.services && dto.services.length > 0 ? dto.services[0]?.category : undefined;
  const serviceCategory = dto.serviceCategory || categoryFromList || 'General';
  const submittedAt = dto.createdAt || dto.submittedAt || new Date().toISOString();

  const mappedApplicants: BulkApplicant[] = rawApplicants.map((ap, idx) => {
    const apDetails = ap.details || ap;
    const name =
      ap.name ||
      (apDetails.firstName && apDetails.lastName
        ? `${apDetails.firstName} ${apDetails.lastName}`
        : `Applicant #${idx + 1}`);

    const appType = ap.applicantType || 'Individual';
    const appStatus = normalizeApplicationStatus(ap.status || rawStatus);

    return {
      id: ap.id || `app-cand-${idx}`,
      name,
      applicationType: appType,
      status: appStatus,
      includedInSOA: ap.includedInSOA !== undefined ? ap.includedInSOA : true,
      sex: apDetails.sex === 'Female' ? 'Female' : 'Male',
      nationality: apDetails.nationality || 'Filipino',
      streetAddress: apDetails.address || apDetails.streetAddress || 'N/A',
      barangay: apDetails.barangayName || apDetails.barangay || '',
      cityMunicipality: apDetails.cityMunicipality || 'N/A',
      province: apDetails.province || 'N/A',
      region: apDetails.region || 'N/A',
      zipCode: apDetails.zipCode || '',
      mobileNumber: apDetails.contactNumber || apDetails.mobileNumber || 'N/A',
      email: apDetails.emailAddress || apDetails.email || 'N/A',
      examineeType: 'New',
      details: {
        firstName: apDetails.firstName,
        lastName: apDetails.lastName,
        sex: apDetails.sex === 'Female' ? 'Female' : 'Male',
        nationality: apDetails.nationality,
        address: apDetails.address || apDetails.streetAddress,
        barangay: apDetails.barangayName || apDetails.barangay,
        cityMunicipality: apDetails.cityMunicipality,
        province: apDetails.province,
        region: apDetails.region,
        zipCode: apDetails.zipCode,
        contactNumber: apDetails.contactNumber || apDetails.mobileNumber,
        emailAddress: apDetails.emailAddress || apDetails.email,
        examineeType: 'New',
        formFieldValues: ap.formFieldValues || [],
      },
      formFieldValues: ap.formFieldValues || [],
    };
  });

  const reqDocs = dto.requirements || dto.Requirements || dto.documents || dto.Documents || [];
  const primaryFormFieldValues = firstApplicant?.formFieldValues || [];

  if (isBulk) {
    const bulkApp: BulkApplication = {
      id: dto.id || '',
      referenceNumber: refNumber,
      mode: 'BULK',
      companyName,
      serviceName,
      serviceCategory,
      element: 'New',
      status,
      submittedAt,
      applicants: mappedApplicants,
      soaNumber: dto.soaNumber || null,
      submissionMode: 'BULK',
      documents: reqDocs,
      requirements: reqDocs,
      formFieldValues: primaryFormFieldValues,
    };
    return bulkApp;
  }

  const singleApp: SingleApplication = {
    id: dto.id || '',
    referenceNumber: refNumber,
    mode: 'SINGLE',
    serviceName,
    serviceCategory,
    element: 'New',
    status,
    submittedAt,
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
    examineeType: 'New',
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
  };
  return singleApp;
}

export function getApplicantDocuments(applicant: BulkApplicant): ApplicationDocument[] {
  const docs: ApplicationDocument[] = [];
  const refId = applicant.id;
  const safeName = applicant.name.replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = '2026-07-21T09:30:00.000Z';

  docs.push({
    id: `${refId}-doc-1`,
    name: `${safeName}_Application_Form.pdf`,
    type: 'PDF',
    size: '1.2 MB',
    category: 'ATTACHMENT',
    uploadedAt: dateStr,
  });

  docs.push({
    id: `${refId}-doc-2`,
    name: `${safeName}_Government_ID.pdf`,
    type: 'PDF',
    size: '720 KB',
    category: 'ATTACHMENT',
    uploadedAt: dateStr,
  });

  if (applicant.status === 'APPROVED') {
    docs.push({
      id: `${refId}-doc-3`,
      name: `${safeName}_Approved_Permit.pdf`,
      type: 'PDF',
      size: '480 KB',
      category: 'ISSUED_PERMIT',
      uploadedAt: dateStr,
    });
  } else if (applicant.status === 'READY_FOR_PAYMENT') {
    docs.push({
      id: `${refId}-doc-3`,
      name: `${safeName}_Statement_of_Account.pdf`,
      type: 'PDF',
      size: '210 KB',
      category: 'SOA',
      uploadedAt: dateStr,
    });
  }

  return docs;
}

