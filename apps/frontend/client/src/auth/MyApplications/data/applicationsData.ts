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

// ─────────────────────────────────────────────────────────────────────────────
// Mock data – 8 Single + 7 Bulk = 15 records (V1 NTC service names)
// ─────────────────────────────────────────────────────────────────────────────

export const mockApplications: Application[] = [
  // ── SINGLE APPLICATIONS ──────────────────────────────────────────────────

  {
    id: 'app-001',
    referenceNumber: '61-7-2026-0101-101',
    mode: 'SINGLE',
    serviceName: 'Admission Slip for Radio Operator Examination',
    serviceCategory: 'Exams',
    element: 'New',
    status: 'FOR_APPROVAL',
    submittedAt: '2026-07-21T09:30:00.000Z',
    applicantName: 'Juan dela Cruz',
    sex: 'Male',
    nationality: 'Filipino',
    streetAddress: '123 Rizal Avenue, Sampaloc',
    barangay: 'Barangay 395',
    cityMunicipality: 'Manila',
    province: 'Metro Manila',
    region: 'NCR – National Capital Region',
    zipCode: '1008',
    mobileNumber: '+63 917 123 4567',
    email: 'juan.delacruz@email.com',
    examineeType: 'New',
    schedule: {
      date: 'August 15, 2026',
      time: '8:00 AM',
      venue: 'NTC Main Office, Commonwealth Avenue, Quezon City',
    },
  },

  {
    id: 'app-002',
    referenceNumber: '61-7-2026-0102-102',
    mode: 'SINGLE',
    serviceName: 'Radio Operator Certificates (ROC) excluding Amateur ROC',
    serviceCategory: 'Certificates',
    element: 'New',
    status: 'APPROVED',
    submittedAt: '2026-07-20T14:00:00.000Z',
    applicantName: 'Maria Santos',
    sex: 'Female',
    nationality: 'Filipino',
    streetAddress: '456 Osmeña Blvd, Lahug',
    barangay: 'Lahug',
    cityMunicipality: 'Cebu City',
    province: 'Cebu',
    region: 'Region VII – Central Visayas',
    zipCode: '6000',
    mobileNumber: '+63 918 234 5678',
    email: 'maria.santos@email.com',
    examineeType: 'New',
    schedule: {
      date: 'July 20, 2026',
      time: '9:00 AM',
      venue: 'NTC Region VII Office, Cebu City',
    },
  },

  {
    id: 'app-003',
    referenceNumber: '61-7-2026-0103-103',
    mode: 'SINGLE',
    serviceName: 'Certificates in the Amateur Service',
    serviceCategory: 'Certificates',
    element: 'Renewal',
    status: 'FOR_EVALUATION',
    submittedAt: '2026-07-18T10:00:00.000Z',
    applicantName: 'Roberto Reyes',
    sex: 'Male',
    nationality: 'Filipino',
    streetAddress: '789 MacArthur Highway, Sindalan',
    barangay: 'Sindalan',
    cityMunicipality: 'San Fernando',
    province: 'Pampanga',
    region: 'Region III – Central Luzon',
    zipCode: '2000',
    mobileNumber: '+63 919 345 6789',
    email: 'roberto.reyes@email.com',
    examineeType: 'Renewal',
    schedule: {
      date: 'August 1, 2026',
      time: '10:00 AM',
      venue: 'NTC Region III Office, San Fernando, Pampanga',
    },
  },

  {
    id: 'app-004',
    referenceNumber: '61-7-2026-0104-104',
    mode: 'SINGLE',
    serviceName: 'TVRO Registration Certificate',
    serviceCategory: 'Certificates',
    element: 'Renewal',
    status: 'EXPIRING_SOON',
    submittedAt: '2026-07-15T09:00:00.000Z',
    applicantName: 'Ana Gonzalez',
    sex: 'Female',
    nationality: 'Filipino',
    streetAddress: '321 JP Rizal Street, Sta. Rosa',
    barangay: 'Market Area',
    cityMunicipality: 'Santa Rosa',
    province: 'Laguna',
    region: 'Region IV-A – CALABARZON',
    zipCode: '4026',
    mobileNumber: '+63 920 456 7890',
    email: 'ana.gonzalez@email.com',
    examineeType: 'Renewal',
    schedule: {
      date: 'N/A',
      time: 'N/A',
      venue: 'N/A',
    },
  },

  {
    id: 'app-005',
    referenceNumber: '61-7-2026-0105-105',
    mode: 'SINGLE',
    serviceName: 'Licenses in the Amateur Service',
    serviceCategory: 'Licenses',
    element: 'New',
    status: 'APPROVED',
    submittedAt: '2026-07-10T11:30:00.000Z',
    applicantName: 'Miguel Torres',
    sex: 'Male',
    nationality: 'Filipino',
    streetAddress: '654 Quezon Avenue, Tamag',
    barangay: 'Tamag',
    cityMunicipality: 'Vigan City',
    province: 'Ilocos Sur',
    region: 'Region I – Ilocos Region',
    zipCode: '2700',
    mobileNumber: '+63 921 567 8901',
    email: 'miguel.torres@email.com',
    examineeType: 'New',
    schedule: {
      date: 'July 10, 2026',
      time: '2:00 PM',
      venue: 'NTC Region I Office, San Fernando, La Union',
    },
  },

  {
    id: 'app-006',
    referenceNumber: '61-7-2026-0106-106',
    mode: 'SINGLE',
    serviceName: 'Permits for Mobile Phone',
    serviceCategory: 'Permits',
    element: 'New',
    status: 'FOR_APPROVAL',
    submittedAt: '2026-07-05T08:00:00.000Z',
    applicantName: 'Carla Ramos',
    sex: 'Female',
    nationality: 'Filipino',
    streetAddress: '987 Taft Avenue, Malate',
    barangay: 'Barangay 690',
    cityMunicipality: 'Manila',
    province: 'Metro Manila',
    region: 'NCR – National Capital Region',
    zipCode: '1004',
    mobileNumber: '+63 922 678 9012',
    email: 'carla.ramos@email.com',
    examineeType: 'New',
    schedule: {
      date: 'N/A',
      time: 'N/A',
      venue: 'N/A',
    },
  },

  {
    id: 'app-007',
    referenceNumber: '61-7-2026-0107-107',
    mode: 'SINGLE',
    serviceName: 'Copy of Licenses',
    serviceCategory: 'Licenses',
    element: 'Additional',
    status: 'APPROVED',
    submittedAt: '2026-06-30T09:00:00.000Z',
    applicantName: 'Jerome Aquino',
    sex: 'Male',
    nationality: 'Filipino',
    streetAddress: '147 Echague Street',
    barangay: 'Centro',
    cityMunicipality: 'Ilagan City',
    province: 'Isabela',
    region: 'Region II – Cagayan Valley',
    zipCode: '3300',
    mobileNumber: '+63 923 789 0123',
    email: 'jerome.aquino@email.com',
    examineeType: 'Additional',
    schedule: {
      date: 'N/A',
      time: 'N/A',
      venue: 'N/A',
    },
  },

  {
    id: 'app-008',
    referenceNumber: '61-7-2026-0108-108',
    mode: 'SINGLE',
    serviceName: 'Certificate of Registration as a Value-Added Service (VAS) Provider',
    serviceCategory: 'Certificates',
    element: 'New',
    status: 'FOR_EVALUATION',
    submittedAt: '2026-06-25T10:00:00.000Z',
    applicantName: 'Patricia Lim',
    sex: 'Female',
    nationality: 'Filipino',
    streetAddress: '258 Ayala Avenue, Makati CBD',
    barangay: 'Bel-Air',
    cityMunicipality: 'Makati City',
    province: 'Metro Manila',
    region: 'NCR – National Capital Region',
    zipCode: '1209',
    mobileNumber: '+63 924 890 1234',
    email: 'patricia.lim@corp.ph',
    examineeType: 'New',
    schedule: {
      date: 'N/A',
      time: 'N/A',
      venue: 'N/A',
    },
  },

  // ── BULK APPLICATIONS ─────────────────────────────────────────────────────

  {
    id: 'app-009',
    referenceNumber: '61-7-2026-1729-921',
    mode: 'BULK',
    companyName: 'Dezza Collection',
    serviceName: 'Customer Premises Equipment (CPE) Supplier Accreditation',
    serviceCategory: 'Accreditations',
    element: 'Modification',
    status: 'FOR_EVALUATION',
    submittedAt: '2026-07-21T09:10:00.000Z',
    soaNumber: null,
    applicants: [
      { id: 'ap-001', name: 'Davis Montgomery',   applicationType: 'Amateur',     status: 'PENDING',         includedInSOA: false },
      { id: 'ap-002', name: 'Maria Santos',        applicationType: 'Commercial',  status: 'FOR_EVALUATION',  includedInSOA: false },
      { id: 'ap-003', name: 'Roberto dela Cruz',   applicationType: 'Maritime',    status: 'PENDING',         includedInSOA: false },
      { id: 'ap-004', name: 'Ana Gonzalez',        applicationType: 'Amateur',     status: 'FOR_EVALUATION',  includedInSOA: false },
      { id: 'ap-005', name: 'Miguel Torres',       applicationType: 'Commercial',  status: 'PENDING',         includedInSOA: false },
    ],
  },

  {
    id: 'app-010',
    referenceNumber: '61-7-2026-1002-B02',
    mode: 'BULK',
    companyName: 'Pacific Telecom Corporation',
    serviceName: 'Radio Operator Certificates (ROC) excluding Amateur ROC',
    serviceCategory: 'Certificates',
    element: 'New',
    status: 'APPROVED',
    submittedAt: '2026-07-18T08:00:00.000Z',
    soaNumber: 'SOA #61-7-2026-2002-S02',
    applicants: [
      { id: 'ap-010', name: 'Eduardo Flores',      applicationType: 'Commercial',   status: 'APPROVED',  includedInSOA: true  },
      { id: 'ap-011', name: 'Carmen Lopez',        applicationType: 'Maritime',     status: 'APPROVED',  includedInSOA: true  },
      { id: 'ap-012', name: 'Andres Mendoza',      applicationType: 'Commercial',   status: 'APPROVED',  includedInSOA: true  },
      { id: 'ap-013', name: 'Rosario Cruz',        applicationType: 'Aeronautical', status: 'APPROVED',  includedInSOA: true  },
      { id: 'ap-014', name: 'Fernando Garcia',     applicationType: 'Commercial',   status: 'APPROVED',  includedInSOA: true  },
      { id: 'ap-015', name: 'Lourdes Castillo',    applicationType: 'Maritime',     status: 'APPROVED',  includedInSOA: true  },
      { id: 'ap-016', name: 'Antonio Batista',     applicationType: 'Commercial',   status: 'DECLINED',  includedInSOA: false },
      { id: 'ap-017', name: 'Grace Villanueva',    applicationType: 'Maritime',     status: 'APPROVED',  includedInSOA: true  },
      { id: 'ap-018', name: 'Manuel Soriano',      applicationType: 'Commercial',   status: 'APPROVED',  includedInSOA: true  },
      { id: 'ap-019', name: 'Elizabeth Fernandez', applicationType: 'Aeronautical', status: 'APPROVED',  includedInSOA: true  },
      { id: 'ap-020', name: 'Ricardo Navarro',     applicationType: 'Commercial',   status: 'APPROVED',  includedInSOA: true  },
      { id: 'ap-021', name: 'Marites Cunanan',     applicationType: 'Maritime',     status: 'DECLINED',  includedInSOA: false },
    ],
  },

  {
    id: 'app-011',
    referenceNumber: '61-7-2026-1003-B03',
    mode: 'BULK',
    companyName: 'Metro Networks Inc.',
    serviceName: 'Licenses for Government and Private Radio Stations in the Fixed and Land Mobile Service',
    serviceCategory: 'Licenses',
    element: 'New',
    status: 'FOR_APPROVAL',
    submittedAt: '2026-07-15T10:00:00.000Z',
    soaNumber: null,
    applicants: [
      { id: 'ap-022', name: 'Benjamin Dela Rosa',  applicationType: 'Land Mobile',  status: 'FOR_APPROVAL', includedInSOA: false },
      { id: 'ap-023', name: 'Cristina Hernandez',  applicationType: 'Fixed',        status: 'FOR_APPROVAL', includedInSOA: false },
      { id: 'ap-024', name: 'Alfredo Magalona',    applicationType: 'Land Mobile',  status: 'FOR_APPROVAL', includedInSOA: false },
      { id: 'ap-025', name: 'Josephine Bautista',  applicationType: 'Fixed',        status: 'FOR_APPROVAL', includedInSOA: false },
      { id: 'ap-026', name: 'Domingo Ramirez',     applicationType: 'Land Mobile',  status: 'FOR_APPROVAL', includedInSOA: false },
      { id: 'ap-027', name: 'Remedios Salvador',   applicationType: 'Fixed',        status: 'FOR_APPROVAL', includedInSOA: false },
      { id: 'ap-028', name: 'Enrique Pascual',     applicationType: 'Land Mobile',  status: 'FOR_APPROVAL', includedInSOA: false },
      { id: 'ap-029', name: 'Sylvia Aguilar',      applicationType: 'Fixed',        status: 'FOR_APPROVAL', includedInSOA: false },
    ],
  },

  {
    id: 'app-012',
    referenceNumber: '61-7-2026-1004-B04',
    mode: 'BULK',
    companyName: 'Philippine Maritime Academy',
    serviceName: 'Admission Slip for Radio Operator Examination',
    serviceCategory: 'Exams',
    element: 'New',
    status: 'FOR_EVALUATION',
    submittedAt: '2026-07-10T09:00:00.000Z',
    soaNumber: null,
    applicants: [
      { id: 'ap-030', name: 'Lorenzo Mercado',    applicationType: 'Maritime', status: 'FOR_EVALUATION', includedInSOA: false },
      { id: 'ap-031', name: 'Natividad Coronado', applicationType: 'Maritime', status: 'APPROVED',       includedInSOA: true  },
      { id: 'ap-032', name: 'Amado Valencia',     applicationType: 'Maritime', status: 'FOR_EVALUATION', includedInSOA: false },
      { id: 'ap-033', name: 'Teresita Espiritu',  applicationType: 'Maritime', status: 'APPROVED',       includedInSOA: true  },
      { id: 'ap-034', name: 'Rodrigo Macapagal',  applicationType: 'Maritime', status: 'FOR_EVALUATION', includedInSOA: false },
      { id: 'ap-035', name: 'Consolacion Borja',  applicationType: 'Maritime', status: 'APPROVED',       includedInSOA: true  },
      { id: 'ap-036', name: 'Arturo Salcedo',     applicationType: 'Maritime', status: 'FOR_EVALUATION', includedInSOA: false },
      { id: 'ap-037', name: 'Florencia Dizon',    applicationType: 'Maritime', status: 'PENDING',        includedInSOA: false },
      { id: 'ap-038', name: 'Marcelo Santos',     applicationType: 'Maritime', status: 'PENDING',        includedInSOA: false },
      { id: 'ap-039', name: 'Lydia Reyes',        applicationType: 'Maritime', status: 'DECLINED',       includedInSOA: false },
      { id: 'ap-040', name: 'Arsenio dela Cruz',  applicationType: 'Maritime', status: 'APPROVED',       includedInSOA: true  },
      { id: 'ap-041', name: 'Gloria Aquino',      applicationType: 'Maritime', status: 'PENDING',        includedInSOA: false },
      { id: 'ap-042', name: 'Patricio Lim',       applicationType: 'Maritime', status: 'FOR_EVALUATION', includedInSOA: false },
      { id: 'ap-043', name: 'Delia Ramos',        applicationType: 'Maritime', status: 'PENDING',        includedInSOA: false },
      { id: 'ap-044', name: 'Cesar Villanueva',   applicationType: 'Maritime', status: 'APPROVED',       includedInSOA: true  },
    ],
  },

  {
    id: 'app-013',
    referenceNumber: '61-7-2026-1005-B05',
    mode: 'BULK',
    companyName: 'TeleStar Philippines Inc.',
    serviceName: 'Permits for Radio Communications Equipment',
    serviceCategory: 'Permits',
    element: 'New',
    status: 'READY_FOR_PAYMENT',
    submittedAt: '2026-07-05T11:00:00.000Z',
    soaNumber: 'SOA #61-7-2026-2005-S05',
    applicants: [
      { id: 'ap-045', name: 'Alfonso Gutierrez', applicationType: 'Radio Equipment', status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-046', name: 'Melissa Torres',    applicationType: 'Radio Equipment', status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-047', name: 'Bernardo Lopez',    applicationType: 'Radio Equipment', status: 'DECLINED', includedInSOA: false },
    ],
  },

  {
    id: 'app-014',
    referenceNumber: '61-7-2026-1006-B06',
    mode: 'BULK',
    companyName: 'Nexus Communications Corp.',
    serviceName: 'Customer Premises Equipment (CPE) Supplier Accreditation',
    serviceCategory: 'Accreditations',
    element: 'New',
    status: 'APPROVED',
    submittedAt: '2026-06-20T09:00:00.000Z',
    soaNumber: 'SOA #61-7-2026-2006-S06',
    applicants: [
      { id: 'ap-048', name: 'Diana Mendez',        applicationType: 'New Applicant', status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-049', name: 'Fernando Cruz',       applicationType: 'New Applicant', status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-050', name: 'Guadalupe Santos',    applicationType: 'Renewal',       status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-051', name: 'Herminio Reyes',      applicationType: 'New Applicant', status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-052', name: 'Imelda Flores',       applicationType: 'Renewal',       status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-053', name: 'Jacinto Garcia',      applicationType: 'New Applicant', status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-054', name: 'Katrina Lopez',       applicationType: 'Renewal',       status: 'DECLINED', includedInSOA: false },
      { id: 'ap-055', name: 'Leonardo Castro',     applicationType: 'New Applicant', status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-056', name: 'Marisol Dela Torre',  applicationType: 'Renewal',       status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-057', name: 'Narciso Bautista',    applicationType: 'New Applicant', status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-058', name: 'Ofelia Navarro',      applicationType: 'Renewal',       status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-059', name: 'Porfirio Macaraeg',   applicationType: 'New Applicant', status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-060', name: 'Queenie Salazar',     applicationType: 'Renewal',       status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-061', name: 'Renato Espino',       applicationType: 'New Applicant', status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-062', name: 'Serafina Alcantara',  applicationType: 'Renewal',       status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-063', name: 'Timoteo Soriano',     applicationType: 'New Applicant', status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-064', name: 'Ursula Catapang',     applicationType: 'Renewal',       status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-065', name: 'Victor Magpantay',    applicationType: 'New Applicant', status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-066', name: 'Wilhelmina Perez',    applicationType: 'Renewal',       status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-067', name: 'Xavier Domingo',      applicationType: 'New Applicant', status: 'APPROVED', includedInSOA: true  },
    ],
  },

  {
    id: 'app-015',
    referenceNumber: '61-7-2026-1007-B07',
    mode: 'BULK',
    companyName: 'Southern Star Shipping Lines',
    serviceName: 'Radio Operator Certificates (ROC) excluding Amateur ROC',
    serviceCategory: 'Certificates',
    element: 'Renewal',
    status: 'EXPIRING_SOON',
    submittedAt: '2026-05-28T09:00:00.000Z',
    soaNumber: 'SOA #61-7-2026-2007-S07',
    applicants: [
      { id: 'ap-068', name: 'Yolanda Castañeda',       applicationType: 'Maritime', status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-069', name: 'Zenaida Buenaventura',    applicationType: 'Maritime', status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-070', name: 'Aloysius Macaraeg',       applicationType: 'Maritime', status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-071', name: 'Beatriz Ocampo',          applicationType: 'Maritime', status: 'APPROVED', includedInSOA: true  },
      { id: 'ap-072', name: 'Calixto Manalang',        applicationType: 'Maritime', status: 'DECLINED', includedInSOA: false },
      { id: 'ap-073', name: 'Dolores Manalo',          applicationType: 'Maritime', status: 'APPROVED', includedInSOA: true  },
    ],
  },
];

// Helper to deterministically generate applicant details for bulk applications
export function getEnrichedApplicant(applicant: BulkApplicant, serviceName: string): Required<BulkApplicant> {
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

  // Use applicant's own details if already provided, otherwise fallback to deterministic mock values
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

