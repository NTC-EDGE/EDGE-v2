export interface RegionalConfigCard {
  id: string;
  category: string;
  subtitle: string;
  name: string;
  subLabel: string;
  badge?: {
    text: string;
    type: 'primary' | 'active' | 'commissioner';
  };
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface ApplicationRequirementItem {
  id: string;
  title: string;
  statusText: string;
  mappedCount: number;
  requiredCount: number;
  optionalCount: number;
  mappedDocuments: {
    id: string;
    name: string;
    isRequired: boolean;
  }[];
}

export interface FeePaymentItem {
  id: string;
  title: string;
  statusText: string;
  configuredCount: number;
  totalAmount: number;
  feeBreakdown: {
    id: string;
    name: string;
    amount: number;
  }[];
}

export interface NoteItem {
  id: string;
  title: string;
  statusText: string;
  typeText: string;
  targetView: string;
  instructions: string;
}

export interface BranchOfficeStats {
  total: number;
  mainOffice: number;
  fieldOffice: number;
}

export interface BranchOffice {
  id: string;
  name: string;
  code: string;
  type: 'Main Office' | 'Field Office';
  address: string;
  contactNumber: string;
}

export interface FormBuilderItem {
  id: string;
  title: string;
  code: string;
  version: string;
  status: 'Published' | 'Draft';
  fieldsCount: number;
}

export interface FeedbackItem {
  id: string;
  sender: string;
  email: string;
  subject: string;
  date: string;
  rating: number;
  status: 'Reviewed' | 'Pending';
  message: string;
}

export const INITIAL_REGIONAL_CONFIGS: RegionalConfigCard[] = [
  {
    id: 'commissioner',
    category: 'Commissioner',
    subtitle: 'Public-facing name & identification',
    name: 'Atty. Ella Blanca B. Lopez',
    subLabel: 'Regional Commissioner',
    badge: { text: 'Active Commissioner', type: 'commissioner' },
    icon: 'user-check',
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
  },
  {
    id: 'support-contact',
    category: 'Support Contact',
    subtitle: 'Regional support helpdesks',
    name: 'Main Helpdesk',
    subLabel: 'ntc10@gov.ph · (02) 8-123-4567',
    icon: 'headphones',
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
  },
  {
    id: 'office-details',
    category: 'Office Details',
    subtitle: 'Identifiers & system routing keys',
    name: 'NTC Region X',
    subLabel: 'B5099 · 43A',
    badge: { text: 'Primary', type: 'primary' },
    icon: 'building-2',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    id: 'region-summary',
    category: 'Region Summary',
    subtitle: 'Overview & global configurations',
    name: 'Region XIV',
    subLabel: 'XIV · Alerts: off',
    badge: { text: 'Active', type: 'active' },
    icon: 'info',
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
  },
];

export const INITIAL_APP_REQUIREMENTS: ApplicationRequirementItem[] = [
  {
    id: 'req-1',
    title: 'Amateur Radio Operator Certificate (NEW)',
    statusText: 'Active Requirements',
    mappedCount: 2,
    requiredCount: 1,
    optionalCount: 1,
    mappedDocuments: [
      { id: 'doc-1', name: 'Valid Government Issued ID with Photo & Signature', isRequired: true },
      { id: 'doc-2', name: 'NTC Examination Result Certificate (Original / Verified Copy)', isRequired: false },
    ],
  },
  {
    id: 'req-2',
    title: 'Amateur Radio Operator Certificate (RENEWAL)',
    statusText: 'Active Requirements',
    mappedCount: 3,
    requiredCount: 3,
    optionalCount: 0,
    mappedDocuments: [
      { id: 'doc-3', name: 'Expired Amateur Radio Operator Certificate', isRequired: true },
      { id: 'doc-4', name: 'Proof of Active Station Operations / Logbook Entry', isRequired: true },
      { id: 'doc-5', name: 'Government Issued Identification Card', isRequired: true },
    ],
  },
  {
    id: 'req-3',
    title: 'Radiotelegraphy(NEW)',
    statusText: 'Active Requirements',
    mappedCount: 3,
    requiredCount: 3,
    optionalCount: 0,
    mappedDocuments: [
      { id: 'doc-6', name: 'Radiotelegraphy Training & Course Completion Certificate', isRequired: true },
      { id: 'doc-7', name: 'Medical & Hearing Certificate (Valid within 6 months)', isRequired: true },
      { id: 'doc-8', name: 'Government Issued Identification Document', isRequired: true },
    ],
  },
  {
    id: 'req-4',
    title: 'Radiotelegraphy(RENEWAL)',
    statusText: 'Active Requirements',
    mappedCount: 2,
    requiredCount: 2,
    optionalCount: 0,
    mappedDocuments: [
      { id: 'doc-9', name: 'Previous Radiotelegraphy License Copy', isRequired: true },
      { id: 'doc-10', name: 'Updated Medical Fitness Certificate', isRequired: true },
    ],
  },
];

export const INITIAL_FEES_PAYMENTS: FeePaymentItem[] = [
  {
    id: 'fee-1',
    title: 'Aeronautical Station Permit to POSSESS',
    statusText: 'Active Fees',
    configuredCount: 1,
    totalAmount: 160.0,
    feeBreakdown: [
      { id: 'fb-1', name: 'Permit to Possess Fee', amount: 160.0 },
    ],
  },
  {
    id: 'fee-2',
    title: 'Aircraft Station License (MODIFICATION)',
    statusText: 'Active Fees',
    configuredCount: 3,
    totalAmount: 330.0,
    feeBreakdown: [
      { id: 'fb-2', name: 'Filing Fee', amount: 80.0 },
      { id: 'fb-3', name: 'Modification License Fee', amount: 200.0 },
      { id: 'fb-4', name: 'Documentary Stamp Tax', amount: 50.0 },
    ],
  },
  {
    id: 'fee-3',
    title: 'Amateur Club Radio Station License (MODIFICATION)',
    statusText: 'Active Fees',
    configuredCount: 2,
    totalAmount: 80.0,
    feeBreakdown: [
      { id: 'fb-5', name: 'Filing Fee', amount: 50.0 },
      { id: 'fb-6', name: 'Processing Fee', amount: 30.0 },
    ],
  },
  {
    id: 'fee-4',
    title: 'Amateur Radio Station License',
    statusText: 'Active Fees',
    configuredCount: 2,
    totalAmount: 830.0,
    feeBreakdown: [
      { id: 'fb-7', name: 'License Fee (3 Years)', amount: 750.0 },
      { id: 'fb-8', name: 'Filing Fee', amount: 80.0 },
    ],
  },
  {
    id: 'fee-5',
    title: 'Amateur Radio Station Permit to PURCHASE/POSSESS',
    statusText: 'Active Fees',
    configuredCount: 4,
    totalAmount: 180.0,
    feeBreakdown: [
      { id: 'fb-9', name: 'Permit to Purchase', amount: 60.0 },
      { id: 'fb-10', name: 'Permit to Possess', amount: 60.0 },
      { id: 'fb-11', name: 'Inspection Fee', amount: 40.0 },
      { id: 'fb-12', name: 'Documentary Stamp Tax', amount: 20.0 },
    ],
  },
  {
    id: 'fee-6',
    title: 'Radiotelegraphy(NEW)',
    statusText: 'Active Fees',
    configuredCount: 3,
    totalAmount: 250.0,
    feeBreakdown: [
      { id: 'fb-13', name: 'Examination & Filing Fee', amount: 100.0 },
      { id: 'fb-14', name: 'Initial License Issuance', amount: 120.0 },
      { id: 'fb-15', name: 'Documentary Stamp Tax', amount: 30.0 },
    ],
  },
  {
    id: 'fee-7',
    title: 'Radiotelegraphy(RENEWAL)',
    statusText: 'Active Fees',
    configuredCount: 2,
    totalAmount: 200.0,
    feeBreakdown: [
      { id: 'fb-16', name: 'Renewal Fee', amount: 150.0 },
      { id: 'fb-17', name: 'Filing Fee', amount: 50.0 },
    ],
  },
  {
    id: 'fee-8',
    title: 'Ship Station License (NEW)',
    statusText: 'Active Fees',
    configuredCount: 5,
    totalAmount: 1200.0,
    feeBreakdown: [
      { id: 'fb-18', name: 'Safety Certificate Fee', amount: 400.0 },
      { id: 'fb-19', name: 'Radio Station License Fee', amount: 500.0 },
      { id: 'fb-20', name: 'Inspection Fee', amount: 200.0 },
      { id: 'fb-21', name: 'Filing Fee', amount: 70.0 },
      { id: 'fb-22', name: 'Documentary Stamp', amount: 30.0 },
    ],
  },
];

export const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Amateur Radio Operator Certificate (NEW)',
    statusText: 'Active Notes',
    typeText: 'Single Instructions Block',
    targetView: 'Client View',
    instructions: 'Ensure all supporting documents are clearly scanned in PDF or High-Resolution JPEG format. Physical examination results must be authenticated by the regional testing officer prior to uploading.',
  },
  {
    id: 'note-2',
    title: 'Amateur Radio Station License',
    statusText: 'Active Notes',
    typeText: 'Single Instructions Block',
    targetView: 'Client View',
    instructions: 'Station logs must be maintained for at least 2 years. Transceiver equipment specifications must match approved NTC type-acceptance list.',
  },
  {
    id: 'note-3',
    title: 'Amateur(NEW)',
    statusText: 'Active Notes',
    typeText: 'Single Instructions Block',
    targetView: 'Client View',
    instructions: 'Applicants must be at least 12 years of age or possess an accredited radio club endorsement.',
  },
];

export const INITIAL_BRANCH_OFFICES: BranchOffice[] = [
  {
    id: 'bo-1',
    name: 'Cagayan de Oro Main Office',
    code: 'B5099-CO',
    type: 'Main Office',
    address: 'Kauswagan Highway, Cagayan de Oro City, Misamis Oriental',
    contactNumber: '(088) 856-1234',
  },
  {
    id: 'bo-2',
    name: 'Bukidnon Field Office',
    code: 'B5099-FO1',
    type: 'Field Office',
    address: 'Malaybalay City, Bukidnon',
    contactNumber: '(088) 221-5678',
  },
  {
    id: 'bo-3',
    name: 'Iligan Field Office',
    code: 'B5099-FO2',
    type: 'Field Office',
    address: 'Pala-o, Iligan City, Lanao del Norte',
    contactNumber: '(063) 223-9012',
  },
];

export const INITIAL_FORM_BUILDERS: FormBuilderItem[] = [
  {
    id: 'fb-1',
    title: 'Amateur Application Form v2.1',
    code: 'NTC-FORM-A1',
    version: 'v2.1',
    status: 'Published',
    fieldsCount: 18,
  },
  {
    id: 'fb-2',
    title: 'Radiotelegraphy Inspection Checklist',
    code: 'NTC-FORM-R4',
    version: 'v1.4',
    status: 'Published',
    fieldsCount: 24,
  },
  {
    id: 'fb-3',
    title: 'Maritime Station Permit Draft',
    code: 'NTC-FORM-M2',
    version: 'v0.9',
    status: 'Draft',
    fieldsCount: 12,
  },
];

export const INITIAL_FEEDBACK: FeedbackItem[] = [
  {
    id: 'feed-1',
    sender: 'Engr. Manuel Santos',
    email: 'm.santos@telecom.ph',
    subject: 'Smooth online requirement submission',
    date: '2026-07-20',
    rating: 5,
    status: 'Reviewed',
    message: 'The online document mapping for Amateur Radio license renewal was fast and accurate. Very clear requirements.',
  },
  {
    id: 'feed-2',
    sender: 'Capt. Juan Dela Cruz',
    email: 'j.delacruz@maritime-ph.com',
    subject: 'Clarification on Ship Station Permit fees',
    date: '2026-07-22',
    rating: 4,
    status: 'Pending',
    message: 'Requesting updated guidelines regarding multi-vessel station license fee calculations.',
  },
];
