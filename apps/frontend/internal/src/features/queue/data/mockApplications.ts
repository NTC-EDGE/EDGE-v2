export type ApplicationStatus =
  | "For Approval"
  | "For Verification"
  | "Returned"
  | "Completed"
  | "In Process"
  | "Declined"
  | "Approved";

export type QueueTab = "activity" | "pending" | "history";
export type ApplicantType = "Individual" | "Company";
export type ApplicationCategory =
  | "Exams"
  | "Permits"
  | "Licenses"
  | "Accreditations"
  | "Certificates"
  | "Complaints and Request";

export interface RequirementDocument {
  label: string;
  note?: string;
  filename: string;
  thumbnailUri?: string;
}

export interface ApplicationFormAttachment {
  name: string;
  section: "ACCOUNTABLE FORM" | "DOWNLOAD FORM";
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
  method: "cash" | "check";
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
  applicationType: "SINGLE" | "MULTIPLE";
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
  note: string;
}

export const mockApplications: ApplicationData[] = [
  {
    id: "APP-2026-001",
    referenceNumber: "61-7-2026-1739-895",
    permitNumber: "26-1RTG-XIV-14465",
    applicant: "EDISSA A. AMANTE",
    applicantType: "Company",
    permitTitle: "Radio Operator Certificates (ROC) excluding Amateur ROC",
    category: "Certificates",
    status: "Completed",
    queueTab: "activity",
    createdAt: "2026-07-23T14:30:00Z",
    dateLabel: "Yesterday • Jul 23, 2026",
    assignedTo: "CASHIER EDGE",
    applicationType: "SINGLE",
    isBeingViewed: false,
    isUrgent: false,
    isPinned: false,
    address: {
      barangay: "Brgy 4",
      province: "South Cotabato",
      city: "City Of Koronadal (Capital)",
      zipCode: "9506",
    },
    contactDetails: {
      contactNumber: "09751546857",
      email: "ejamante0607@gmail.com",
    },
    basicInfo: {
      lastName: "Amante",
      firstName: "Edissa",
      middleName: "Abastas",
      extensionName: "",
      dob: "May 22, 2001",
      placeOfBirth: "Manila",
      sex: "Female",
      weight: 55,
      height: 162,
      nationality: "Filipino",
      employmentStatus: "Employed",
      occupation: "Software Engineer",
    },
    applicationDetails: {
      noOfYears: 1,
      permitCategory: "Commercial Radio Operator Certificate (NEW)",
      formType: "1RTG",
      submittedAt: "Submitted 1 day ago",
    },
    requirements: [
      {
        label: "Original valid Report of Rating",
        filename: "rating_report.png",
      },
      { label: "Clear 1x1 ID picture", filename: "id_picture.png" },
    ],
    forms: [
      {
        name: "Form",
        section: "ACCOUNTABLE FORM",
        canView: true,
        canPrint: true,
        canDownload: true,
        canRefresh: false,
      },
      {
        name: "Certificate",
        section: "DOWNLOAD FORM",
        canView: true,
        canPrint: true,
        canDownload: true,
        canRefresh: true,
      },
      {
        name: "Official Receipt",
        section: "DOWNLOAD FORM",
        canView: true,
        canPrint: true,
        canDownload: true,
        canRefresh: true,
      },
      {
        name: "SOA Report",
        section: "DOWNLOAD FORM",
        canView: true,
        canPrint: true,
        canDownload: true,
        canRefresh: true,
      },
    ],
    soaItems: [
      {
        particular: "Certificate Fee",
        validityYears: 1,
        percentage: 0,
        noOfUnits: 0,
        fees: 180,
        amount: 180,
        code: "4-02-01-060",
      },
    ],
    totalAmountDue: 180,
    dueDate: "Sat Jan 23 2027",
    payment: {
      amountReceived: 210,
      method: "cash",
      orNumber: "OR-884920-2026",
      checkNumber: "",
      checkName: "",
    },
    correctionAuditTrail: [],
    history: [
      {
        id: "H1",
        action: "Application submitted by applicant.",
        staff: "System",
        timestamp: "Jul 23, 2026 09:00 AM",
      },
      {
        id: "H2",
        action: "Requirements verified.",
        staff: "EVALUATOR EDGE",
        timestamp: "Jul 23, 2026 11:30 AM",
      },
      {
        id: "H3",
        action: "Payment verified and official receipt generated.",
        staff: "CASHIER EDGE",
        timestamp: "Jul 23, 2026 02:45 PM",
      },
      {
        id: "H4",
        action: "Final certificate approved and issued.",
        staff: "ADMIN EDGE",
        timestamp: "Jul 23, 2026 04:30 PM",
      },
    ],
    note: "Standard certificate issuance completed.",
  },
  {
    id: "APP-2026-002",
    referenceNumber: "61-7-2026-9920-112",
    permitNumber: "",
    applicant: "MARK T. REYNOLDS",
    applicantType: "Individual",
    permitTitle: "Admission Slip for Radio Operator Exam",
    category: "Exams",
    status: "For Approval",
    queueTab: "pending",
    createdAt: "2026-07-24T09:15:00Z",
    dateLabel: "Today • Jul 24, 2026",
    assignedTo: "EVALUATOR EDGE",
    applicationType: "SINGLE",
    isBeingViewed: true,
    isUrgent: true,
    isPinned: false,
    address: {
      barangay: "San Roque",
      province: "Davao del Sur",
      city: "Davao City",
      zipCode: "8000",
    },
    contactDetails: {
      contactNumber: "09171234567",
      email: "mark.reynolds@example.com",
    },
    basicInfo: {
      lastName: "Reynolds",
      firstName: "Mark",
      middleName: "Thompson",
      extensionName: "",
      dob: "Nov 14, 1995",
      placeOfBirth: "Manila",
      sex: "Male",
      weight: 70,
      height: 175,
      nationality: "Filipino",
      employmentStatus: "Self-Employed",
      occupation: "Software Engineer",
    },
    applicationDetails: {
      noOfYears: 0,
      permitCategory: "Restricted Radiotelephone Operator Certificate (RROC)",
      formType: "EXAM-RL",
      submittedAt: "Submitted 4 hours ago",
    },
    requirements: [
      {
        label: "Proof of Completion of Training",
        filename: "training_cert.pdf",
      },
      { label: "Transcript of Records", filename: "tor.pdf" },
    ],
    forms: [
      {
        name: "Form",
        section: "ACCOUNTABLE FORM",
        canView: true,
        canPrint: true,
        canDownload: true,
        canRefresh: false,
      },
      {
        name: "Order of Payment",
        section: "DOWNLOAD FORM",
        canView: true,
        canPrint: true,
        canDownload: true,
        canRefresh: true,
      },
    ],
    soaItems: [
      {
        particular: "Examination Fee",
        validityYears: 0,
        percentage: 0,
        noOfUnits: 0,
        fees: 50,
        amount: 50,
        code: "4-02-01-070",
      },
    ],
    totalAmountDue: 50,
    dueDate: "Thu Jan 21 2027",
    payment: {
      amountReceived: 50,
      method: "cash",
      orNumber: "",
      checkNumber: "",
      checkName: "",
    },
    correctionAuditTrail: [
      {
        id: "C1",
        action: "Updated height from 174 to 175.",
        staff: "EVALUATOR EDGE",
        timestamp: "Jul 24, 2026 10:30 AM",
      },
    ],
    history: [
      {
        id: "H1",
        action: "Application submitted.",
        staff: "System",
        timestamp: "Jul 24, 2026 09:15 AM",
      },
      {
        id: "H2",
        action: "Assigned to evaluation queue.",
        staff: "System",
        timestamp: "Jul 24, 2026 09:20 AM",
      },
    ],
    note: "Applicant requested urgent processing for upcoming exam date.",
  },
  {
    id: "APP-2026-003",
    referenceNumber: "61-7-2026-4456-778",
    permitNumber: "26-MOD-XIV-00123",
    applicant: "SKYBOUND LOGISTICS CORP",
    applicantType: "Company",
    permitTitle: "Modification of Radio Station License",
    category: "Licenses",
    status: "Returned",
    queueTab: "pending",
    createdAt: "2026-07-24T10:30:00Z",
    dateLabel: "Today • Jul 24, 2026",
    assignedTo: "ADMIN EDGE",
    applicationType: "MULTIPLE",
    isBeingViewed: false,
    isUrgent: false,
    isPinned: true,
    address: {
      barangay: "Brgy 12",
      province: "Cebu",
      city: "Cebu City",
      zipCode: "6000",
    },
    contactDetails: {
      contactNumber: "032-412-8888",
      email: "ops@skybound.ph",
    },
    basicInfo: {
      lastName: "Santos (Representative)",
      firstName: "Ricardo",
      middleName: "Go",
      extensionName: "",
      dob: "Jan 15, 1980",
      placeOfBirth: "Manila",
      sex: "Male",
      weight: 82,
      height: 170,
      nationality: "Filipino",
      employmentStatus: "Employed",
      occupation: "Software Engineer",
    },
    applicationDetails: {
      noOfYears: 2,
      permitCategory: "Land Mobile Radio",
      formType: "LIC-MOD",
      submittedAt: "Returned 2 hours ago",
    },
    requirements: [
      {
        label: "Current Radio Station License",
        filename: "current_license.pdf",
      },
      {
        label: "Technical Specifications of New Equipment",
        filename: "specs.pdf",
      },
    ],
    forms: [
      {
        name: "Form",
        section: "ACCOUNTABLE FORM",
        canView: true,
        canPrint: true,
        canDownload: true,
        canRefresh: false,
      },
      {
        name: "SOA Report",
        section: "DOWNLOAD FORM",
        canView: true,
        canPrint: true,
        canDownload: true,
        canRefresh: true,
      },
    ],
    soaItems: [
      {
        particular: "Modification Fee",
        validityYears: 1,
        percentage: 0,
        noOfUnits: 10,
        fees: 500,
        amount: 5000,
        code: "4-02-01-080",
      },
    ],
    totalAmountDue: 5000,
    dueDate: "Fri Jul 31 2026",
    payment: {
      amountReceived: 0,
      method: "cash",
      orNumber: "",
      checkNumber: "",
      checkName: "",
    },
    correctionAuditTrail: [],
    history: [
      {
        id: "H1",
        action: "Application submitted.",
        staff: "System",
        timestamp: "Jul 24, 2026 10:30 AM",
      },
      {
        id: "H2",
        action: "Initial review started.",
        staff: "EVALUATOR EDGE",
        timestamp: "Jul 24, 2026 11:00 AM",
      },
      {
        id: "H3",
        action: "Application returned due to incomplete technical specs.",
        staff: "ADMIN EDGE",
        timestamp: "Jul 24, 2026 01:00 PM",
      },
    ],
    note: "Waiting for applicant to upload the correct technical specifications document.",
  },
  {
    id: "APP-2026-004",
    referenceNumber: "61-7-2026-2211-334",
    permitNumber: "",
    applicant: "ALPHA TELECOM",
    applicantType: "Company",
    permitTitle: "New Dealer Accreditation",
    category: "Accreditations",
    status: "For Verification",
    queueTab: "pending",
    createdAt: "2026-07-24T11:45:00Z",
    dateLabel: "Today • Jul 24, 2026",
    assignedTo: "CASHIER EDGE",
    applicationType: "SINGLE",
    isBeingViewed: false,
    isUrgent: false,
    isPinned: false,
    address: {
      barangay: "Poblacion",
      province: "Benguet",
      city: "Baguio City",
      zipCode: "2600",
    },
    contactDetails: {
      contactNumber: "074-442-1234",
      email: "admin@alphatelecom.com",
    },
    basicInfo: {
      lastName: "Baguio",
      firstName: "Elena",
      middleName: "Cruz",
      extensionName: "",
      dob: "Mar 30, 1988",
      placeOfBirth: "Manila",
      sex: "Female",
      weight: 60,
      height: 158,
      nationality: "Filipino",
      employmentStatus: "Employed",
      occupation: "Software Engineer",
    },
    applicationDetails: {
      noOfYears: 1,
      permitCategory: "Radio Equipment Dealer (NEW)",
      formType: "ACCR-D",
      submittedAt: "Payment pending verification",
    },
    requirements: [
      { label: "SEC Registration", filename: "sec_reg.pdf" },
      { label: "Business Permit", filename: "mayor_permit.pdf" },
      {
        label: "List of Service Test Equipment",
        filename: "equipment_list.pdf",
      },
    ],
    forms: [
      {
        name: "Form",
        section: "ACCOUNTABLE FORM",
        canView: true,
        canPrint: true,
        canDownload: true,
        canRefresh: false,
      },
      {
        name: "Official Receipt",
        section: "DOWNLOAD FORM",
        canView: true,
        canPrint: true,
        canDownload: false,
        canRefresh: true,
      },
      {
        name: "SOA Report",
        section: "DOWNLOAD FORM",
        canView: true,
        canPrint: true,
        canDownload: true,
        canRefresh: true,
      },
    ],
    soaItems: [
      {
        particular: "Application Fee",
        validityYears: 1,
        percentage: 0,
        noOfUnits: 1,
        fees: 1500,
        amount: 1500,
        code: "4-02-01-090",
      },
      {
        particular: "Inspection Fee",
        validityYears: 0,
        percentage: 0,
        noOfUnits: 1,
        fees: 500,
        amount: 500,
        code: "4-02-01-100",
      },
    ],
    totalAmountDue: 2000,
    dueDate: "Sat Aug 24 2026",
    payment: {
      amountReceived: 2000,
      method: "check",
      orNumber: "",
      checkNumber: "CHK-12345",
      checkName: "ALPHA TELECOM CORP",
    },
    correctionAuditTrail: [],
    history: [
      {
        id: "H1",
        action: "Application submitted.",
        staff: "System",
        timestamp: "Jul 24, 2026 11:45 AM",
      },
      {
        id: "H2",
        action: "Requirements approved.",
        staff: "EVALUATOR EDGE",
        timestamp: "Jul 24, 2026 01:15 PM",
      },
      {
        id: "H3",
        action: "Payment submitted via check.",
        staff: "Applicant",
        timestamp: "Jul 24, 2026 02:00 PM",
      },
    ],
    note: "Check payment received, awaiting cashier verification.",
  },
  {
    id: "APP-2026-005",
    referenceNumber: "61-7-2026-8855-992",
    permitNumber: "26-TEMP-XIV-99881",
    applicant: "GENEVA M. VILLANUEVA",
    applicantType: "Individual",
    permitTitle: "Temporary Permit to Operate Radio Station",
    category: "Permits",
    status: "Declined",
    queueTab: "activity",
    createdAt: "2026-07-22T14:30:00Z",
    dateLabel: "2 days ago • Jul 22, 2026",
    assignedTo: "ADMIN EDGE",
    applicationType: "SINGLE",
    isBeingViewed: false,
    isUrgent: false,
    isPinned: false,
    address: {
      barangay: "Brgy 7",
      province: "Zamboanga del Sur",
      city: "Pagadian City",
      zipCode: "7016",
    },
    contactDetails: {
      contactNumber: "09223334445",
      email: "geneva.v@gmail.com",
    },
    basicInfo: {
      lastName: "Villanueva",
      firstName: "Geneva",
      middleName: "Mercado",
      extensionName: "",
      dob: "Aug 05, 1992",
      placeOfBirth: "Manila",
      sex: "Female",
      weight: 58,
      height: 165,
      nationality: "Filipino",
      employmentStatus: "Employed",
      occupation: "Software Engineer",
    },
    applicationDetails: {
      noOfYears: 0,
      permitCategory: "Amateur Radio",
      formType: "TP-AR",
      submittedAt: "Declined 2 days ago",
    },
    requirements: [{ label: "Valid Amateur ID", filename: "ham_id.jpg" }],
    forms: [
      {
        name: "Form",
        section: "ACCOUNTABLE FORM",
        canView: true,
        canPrint: true,
        canDownload: true,
        canRefresh: false,
      },
    ],
    soaItems: [],
    totalAmountDue: 0,
    dueDate: "Wed Jul 22 2026",
    payment: {
      amountReceived: 0,
      method: "cash",
      orNumber: "",
      checkNumber: "",
      checkName: "",
    },
    correctionAuditTrail: [],
    history: [
      {
        id: "H1",
        action: "Application submitted.",
        staff: "System",
        timestamp: "Jul 22, 2026 10:00 AM",
      },
      {
        id: "H2",
        action:
          "Declined: Applicant ID is expired and not eligible for temporary permit.",
        staff: "ADMIN EDGE",
        timestamp: "Jul 22, 2026 03:00 PM",
      },
    ],
    note: "Rejected due to expired documentation.",
  },
];
