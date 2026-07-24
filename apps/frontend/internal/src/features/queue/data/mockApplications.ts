export type ApplicationStatus =
  | 'For Approval'
  | 'For Verification'
  | 'Returned'
  | 'Completed'
  | 'In Process'
  | 'Declined'
  | 'Approved';

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
  description: string;
  changedBy: string;
  timestamp: string;
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
  applicationType: 'SINGLE' | 'MULTIPLE';
  isBeingViewed: boolean;
  isUrgent: boolean;
  isPinned: boolean;
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
    dob: string;
    sex: string;
    weight: number;
    height: number;
    nationality: string;
    employmentStatus: string;
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
  note: string;
}

export const mockApplications: ApplicationData[] = [
  {
    id: 'APP-2026-001',
    referenceNumber: '61-7-2026-1739-895',
    permitNumber: '26-1RTG-XIV-14465',
    applicant: 'EDISSA A. AMANTE',
    applicantType: 'Company',
    permitTitle: 'Radio Operator Certificates (ROC) excluding Amateur ROC',
    category: 'Certificates',
    status: 'Completed',
    queueTab: 'activity',
    createdAt: '2026-07-23T14:30:00Z',
    dateLabel: 'Yesterday \u2022 Jul 23, 2026',
    assignedTo: 'CASHIER EDGE',
    applicationType: 'SINGLE',
    isBeingViewed: true,
    isUrgent: false,
    isPinned: false,
    address: {
      barangay: 'Brgy 4',
      province: 'South Cotabato',
      city: 'City Of Koronadal (Capital)',
      zipCode: '9506',
    },
    contactDetails: {
      contactNumber: '09751546857',
      email: 'ejamante0607@gmail.com',
    },
    basicInfo: {
      lastName: 'Amante',
      firstName: 'Edissa',
      middleName: 'Abastas',
      dob: 'May 22, 2001',
      sex: 'Female',
      weight: 55,
      height: 162,
      nationality: 'Filipino',
      employmentStatus: 'Employed',
    },
    applicationDetails: {
      noOfYears: 1,
      permitCategory: 'Commercial Radio Operator Certificate (NEW)',
      formType: '1RTG',
      submittedAt: 'Submitted 12 hours ago',
    },
    requirements: [
      {
        label: 'Original valid Report of Rating',
        note: 'Note 1: Apply for Duplicate Copy if Original is lost/mutilated/destroyed or not available.',
        filename: '20260723155729_649737746-upload.png',
      },
      {
        label: 'Please provide a clear 1x1 ID picture taken within the last six (6) months.',
        filename: '20260723155739_540709480-upload.png',
      },
    ],
    forms: [
      { name: 'Form', section: 'ACCOUNTABLE FORM', canView: true, canPrint: true, canDownload: true, canRefresh: false },
      { name: 'Certificate', section: 'DOWNLOAD FORM', canView: true, canPrint: true, canDownload: true, canRefresh: true },
      { name: 'Official Receipt', section: 'DOWNLOAD FORM', canView: true, canPrint: true, canDownload: true, canRefresh: true },
      { name: 'Official Receipt (portrait)', section: 'DOWNLOAD FORM', canView: true, canPrint: true, canDownload: true, canRefresh: false },
      { name: 'SOA Report', section: 'DOWNLOAD FORM', canView: true, canPrint: true, canDownload: true, canRefresh: true },
      { name: 'Order of Payment', section: 'DOWNLOAD FORM', canView: true, canPrint: true, canDownload: true, canRefresh: true },
    ],
    soaItems: [
      { particular: 'Certificate Fee', validityYears: 1, percentage: 0, noOfUnits: 0, fees: 180, amount: 180, code: '4-02-01-060' },
    ],
    totalAmountDue: 180,
    dueDate: 'Sat Jan 23 2027',
    payment: { amountReceived: 210, method: 'cash', orNumber: 'OR-884920-2026', checkNumber: '', checkName: '' },
    correctionAuditTrail: [],
    note: '1. The registration of the above-stated radio equipment during the said period shall not be construed as an authority to possess, construct and/or operate the same without the corresponding permits/licenses.\n2. All radio equipment registered under this Memorandum Order shall be at the accountability of the registrant.\n3. The subsequent licensing of all radio equipment to be registered under and pursuant to this Memorandum Order shall be in accordance with existing rules and regulations and the usual licensing procedures.',
  },
  {
    id: 'APP-2026-002',
    referenceNumber: '61-7-2026-9920-112',
    permitNumber: '26-2RTG-XIV-88123',
    applicant: 'EDISSA A. AMANTE',
    applicantType: 'Company',
    permitTitle: 'Admission Slip for Radio Operator Exam',
    category: 'Exams',
    status: 'For Approval',
    queueTab: 'pending',
    createdAt: '2026-07-24T09:15:00Z',
    dateLabel: 'Today \u2022 Jul 24, 2026',
    assignedTo: 'EVALUATOR EDGE',
    applicationType: 'SINGLE',
    isBeingViewed: false,
    isUrgent: true,
    isPinned: true,
    address: {
      barangay: 'Brgy 4',
      province: 'South Cotabato',
      city: 'City Of Koronadal (Capital)',
      zipCode: '9506',
    },
    contactDetails: {
      contactNumber: '09751546857',
      email: 'ejamante0607@gmail.com',
    },
    basicInfo: {
      lastName: 'Amante',
      firstName: 'Edissa',
      middleName: 'Abastas',
      dob: 'May 22, 2001',
      sex: 'Female',
      weight: 55,
      height: 162,
      nationality: 'Filipino',
      employmentStatus: 'Employed',
    },
    applicationDetails: {
      noOfYears: 1,
      permitCategory: 'Admission Slip for Radio Operator Examination',
      formType: 'ADMIS-SLIP',
      submittedAt: 'Submitted 3 hours ago',
    },
    requirements: [
      { label: 'Government Issued ID', filename: '20260724091500_id_upload.png' },
    ],
    forms: [
      { name: 'Admission Form', section: 'ACCOUNTABLE FORM', canView: true, canPrint: true, canDownload: true, canRefresh: false },
    ],
    soaItems: [
      { particular: 'Examination Fee', validityYears: 1, percentage: 0, noOfUnits: 0, fees: 250, amount: 250, code: '4-02-01-088' },
    ],
    totalAmountDue: 250,
    dueDate: 'Sun Jan 24 2027',
    payment: { amountReceived: 250, method: 'cash', orNumber: '', checkNumber: '', checkName: '' },
    correctionAuditTrail: [],
    note: 'Applicant requested urgent processing for scheduled exam.',
  },
  {
    id: 'APP-2026-003',
    referenceNumber: '61-7-2026-4431-778',
    permitNumber: '26-3RTG-XIV-99100',
    applicant: 'Apex Telecom Group',
    applicantType: 'Company',
    permitTitle: '5G Spectrum Allocation License',
    category: 'Licenses',
    status: 'For Verification',
    queueTab: 'pending',
    createdAt: '2026-07-24T08:00:00Z',
    dateLabel: 'Today \u2022 Jul 24, 2026',
    assignedTo: 'CASHIER EDGE',
    applicationType: 'MULTIPLE',
    isBeingViewed: false,
    isUrgent: false,
    isPinned: false,
    address: {
      barangay: 'Brgy Central',
      province: 'Metro Manila',
      city: 'Makati City',
      zipCode: '1200',
    },
    contactDetails: {
      contactNumber: '09171234567',
      email: 'licensing@apextelecom.com',
    },
    basicInfo: {
      lastName: 'Santos',
      firstName: 'Marco',
      middleName: 'Reyes',
      dob: 'Jan 15, 1985',
      sex: 'Male',
      weight: 70,
      height: 175,
      nationality: 'Filipino',
      employmentStatus: 'Corporate Executive',
    },
    applicationDetails: {
      noOfYears: 3,
      permitCategory: 'Commercial Spectrum Allocation',
      formType: 'SPEC-5G',
      submittedAt: 'Submitted 4 hours ago',
    },
    requirements: [
      { label: 'Securities & Exchange Commission Registration', filename: '20260724_sec_registration.png' },
      { label: 'Technical Evaluation Report', filename: '20260724_tech_report.pdf' },
    ],
    forms: [
      { name: 'Order of Payment', section: 'DOWNLOAD FORM', canView: true, canPrint: true, canDownload: true, canRefresh: true },
    ],
    soaItems: [
      { particular: 'Spectrum Inspection Fee', validityYears: 3, percentage: 0, noOfUnits: 5, fees: 1500, amount: 4500, code: '4-02-01-100' },
    ],
    totalAmountDue: 4500,
    dueDate: 'Mon Feb 15 2027',
    payment: { amountReceived: 5000, method: 'check', orNumber: 'OR-991204-2026', checkNumber: 'CHK-00912384', checkName: 'BDO Unibank' },
    correctionAuditTrail: [],
    note: 'Check payment pending verification.',
  },
  {
    id: 'APP-2026-004',
    referenceNumber: '61-7-2026-5512-301',
    permitNumber: '26-4RTG-XIV-22190',
    applicant: 'RuralNet ISP',
    applicantType: 'Company',
    permitTitle: 'Broadband Expansion Subsidy Permit',
    category: 'Permits',
    status: 'Returned',
    queueTab: 'pending',
    createdAt: '2026-07-23T11:20:00Z',
    dateLabel: 'Yesterday \u2022 Jul 23, 2026',
    assignedTo: 'EVALUATOR EDGE',
    applicationType: 'SINGLE',
    isBeingViewed: false,
    isUrgent: false,
    isPinned: false,
    address: {
      barangay: 'Poblacion',
      province: 'Davao del Sur',
      city: 'Digos City',
      zipCode: '8000',
    },
    contactDetails: {
      contactNumber: '09887654321',
      email: 'contact@ruralnet.ph',
    },
    basicInfo: {
      lastName: 'Dela Cruz',
      firstName: 'Juan',
      middleName: 'Bautista',
      dob: 'Mar 10, 1990',
      sex: 'Male',
      weight: 68,
      height: 168,
      nationality: 'Filipino',
      employmentStatus: 'Employed',
    },
    applicationDetails: {
      noOfYears: 2,
      permitCategory: 'Regional ISP Infrastructure Permit',
      formType: 'ISP-EXP',
      submittedAt: 'Submitted 1 day ago',
    },
    requirements: [
      { label: "Mayor's Permit", filename: '20260723_mayors_permit.png' },
    ],
    forms: [],
    soaItems: [
      { particular: 'Permit Processing Fee', validityYears: 2, percentage: 0, noOfUnits: 1, fees: 500, amount: 500, code: '4-02-01-012' },
    ],
    totalAmountDue: 500,
    dueDate: 'Sat Feb 28 2027',
    payment: { amountReceived: 500, method: 'cash', orNumber: '', checkNumber: '', checkName: '' },
    correctionAuditTrail: [
      { id: 'AUD-001', description: 'Returned due to missing Barangay Clearance requirement document.', changedBy: 'EVALUATOR EDGE', timestamp: 'Jul 23, 2026 3:45 PM' },
    ],
    note: 'Returned for compliance of missing requirement.',
  },
  {
    id: 'APP-2026-005',
    referenceNumber: '61-7-2026-1109-883',
    permitNumber: '26-5RTG-XIV-33102',
    applicant: 'TowerCo Towers Corp',
    applicantType: 'Company',
    permitTitle: 'Infrastructure Sharing Permit',
    category: 'Permits',
    status: 'Approved',
    queueTab: 'history',
    createdAt: '2026-07-22T16:00:00Z',
    dateLabel: '2 days ago \u2022 Jul 22, 2026',
    assignedTo: 'CHIEF OF EOD',
    applicationType: 'MULTIPLE',
    isBeingViewed: false,
    isUrgent: false,
    isPinned: false,
    address: {
      barangay: 'Brgy Bel-Air',
      province: 'Metro Manila',
      city: 'Makati City',
      zipCode: '1209',
    },
    contactDetails: {
      contactNumber: '09190001122',
      email: 'permits@towerco.ph',
    },
    basicInfo: {
      lastName: 'Tan',
      firstName: 'Arthur',
      middleName: 'Lim',
      dob: 'Nov 05, 1978',
      sex: 'Male',
      weight: 75,
      height: 172,
      nationality: 'Filipino',
      employmentStatus: 'Director',
    },
    applicationDetails: {
      noOfYears: 5,
      permitCategory: 'Shared Telecom Infrastructure License',
      formType: 'TOWER-SHARE',
      submittedAt: 'Submitted 2 days ago',
    },
    requirements: [
      { label: 'Structural Integrity Certificate', filename: '20260722_structural_cert.pdf' },
    ],
    forms: [
      { name: 'Official Permit Document', section: 'DOWNLOAD FORM', canView: true, canPrint: true, canDownload: true, canRefresh: false },
    ],
    soaItems: [
      { particular: 'Shared License Fee', validityYears: 5, percentage: 0, noOfUnits: 10, fees: 1000, amount: 10000, code: '4-02-01-500' },
    ],
    totalAmountDue: 10000,
    dueDate: 'Mon Dec 31 2026',
    payment: { amountReceived: 10000, method: 'check', orNumber: 'OR-772109-2026', checkNumber: 'CHK-99881122', checkName: 'Metrobank' },
    correctionAuditTrail: [],
    note: 'Approved by Chief of EOD.',
  },
  {
    id: 'APP-2026-006',
    referenceNumber: '61-7-2026-7788-990',
    permitNumber: '26-6RTG-XIV-44111',
    applicant: 'OrbitLink Communications',
    applicantType: 'Company',
    permitTitle: 'Satellite Uplink Authorization',
    category: 'Accreditations',
    status: 'Declined',
    queueTab: 'history',
    createdAt: '2026-07-21T10:45:00Z',
    dateLabel: '3 days ago \u2022 Jul 21, 2026',
    assignedTo: 'REGIONAL DIRECTOR',
    applicationType: 'SINGLE',
    isBeingViewed: false,
    isUrgent: false,
    isPinned: false,
    address: {
      barangay: 'Brgy San Lorenzo',
      province: 'Metro Manila',
      city: 'Makati City',
      zipCode: '1223',
    },
    contactDetails: {
      contactNumber: '09175554433',
      email: 'compliance@orbitlink.com',
    },
    basicInfo: {
      lastName: 'Gonzales',
      firstName: 'Maria',
      middleName: 'Clara',
      dob: 'Aug 18, 1982',
      sex: 'Female',
      weight: 58,
      height: 165,
      nationality: 'Filipino',
      employmentStatus: 'Manager',
    },
    applicationDetails: {
      noOfYears: 1,
      permitCategory: 'Satellite Ground Station Accreditation',
      formType: 'SAT-UPLINK',
      submittedAt: 'Submitted 3 days ago',
    },
    requirements: [
      { label: 'Frequency Coordination Clearance', filename: '20260721_freq_clearance.pdf' },
    ],
    forms: [],
    soaItems: [
      { particular: 'Accreditation Fee', validityYears: 1, percentage: 0, noOfUnits: 1, fees: 2000, amount: 2000, code: '4-02-01-300' },
    ],
    totalAmountDue: 2000,
    dueDate: 'Thu Jan 21 2027',
    payment: { amountReceived: 0, method: 'cash', orNumber: '', checkNumber: '', checkName: '' },
    correctionAuditTrail: [
      { id: 'AUD-002', description: 'Notice of Discrepancy issued: Frequency spectrum overlap detected in submitted plan.', changedBy: 'REGIONAL DIRECTOR', timestamp: 'Jul 21, 2026 2:15 PM' },
    ],
    note: 'Declined due to unresolvable frequency allocation conflict.',
  },
];
