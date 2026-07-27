export type ApplicationStatus =
  | "For Approval"
  | "For Verification"
  | "Returned"
  | "Completed"
  | "In Process"
  | "Declined"
  | "Approved"
  | "Draft";

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
    dateLabel: "Yesterday â€¢ Jul 23, 2026",
    assignedTo: "CASHIER EDGE",
    applicationType: "SINGLE",
    isBeingViewed: false,
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
    dateLabel: "Today â€¢ Jul 24, 2026",
    assignedTo: "EVALUATOR EDGE",
    applicationType: "SINGLE",
    isBeingViewed: true,
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
    dateLabel: "Today â€¢ Jul 24, 2026",
    assignedTo: "ADMIN EDGE",
    applicationType: "MULTIPLE",
    isBeingViewed: false,
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
    dateLabel: "Today â€¢ Jul 24, 2026",
    assignedTo: "CASHIER EDGE",
    applicationType: "SINGLE",
    isBeingViewed: false,
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
    dateLabel: "2 days ago â€¢ Jul 22, 2026",
    assignedTo: "ADMIN EDGE",
    applicationType: "SINGLE",
    isBeingViewed: false,
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
  {
    id: "APP-2026-006",
    referenceNumber: "61-7-2026-1122-334",
    permitNumber: "26-LIC-XIV-12345",
    applicant: "TECHNO SYSTEMS INC",
    applicantType: "Company",
    permitTitle: "Radio Station License Renewal",
    category: "Licenses",
    status: "Approved",
    queueTab: "history",
    createdAt: "2026-07-20T08:00:00Z",
    dateLabel: "4 days ago â€¢ Jul 20, 2026",
    assignedTo: "ADMIN EDGE",
    applicationType: "MULTIPLE",
    isBeingViewed: false,
    isPinned: false,
    address: {
      barangay: "Fort Bonifacio",
      province: "Metro Manila",
      city: "Taguig City",
      zipCode: "1634",
    },
    contactDetails: {
      contactNumber: "02-888-1234",
      email: "licensing@technosystems.ph",
    },
    basicInfo: {
      lastName: "Dela Cruz",
      firstName: "Juan",
      middleName: "A",
      extensionName: "",
      dob: "Jun 12, 1975",
      placeOfBirth: "Manila",
      sex: "Male",
      weight: 75,
      height: 172,
      nationality: "Filipino",
      employmentStatus: "Employed",
      occupation: "Software Engineer",
    },
    applicationDetails: {
      noOfYears: 3,
      permitCategory: "Fixed/Land Mobile Radio Stations",
      formType: "LIC-REN",
      submittedAt: "Approved 4 days ago",
    },
    requirements: [
      { label: "Original License", filename: "old_license.pdf" },
      { label: "Updated Station Specs", filename: "specs_v2.pdf" },
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
        name: "License",
        section: "DOWNLOAD FORM",
        canView: true,
        canPrint: true,
        canDownload: true,
        canRefresh: true,
      },
    ],
    soaItems: [
      {
        particular: "License Fee (3 years)",
        validityYears: 3,
        percentage: 0,
        noOfUnits: 5,
        fees: 1200,
        amount: 18000,
        code: "4-02-01-110",
      },
    ],
    totalAmountDue: 18000,
    dueDate: "Mon Jul 20 2026",
    payment: {
      amountReceived: 18000,
      method: "check",
      orNumber: "OR-77221-2026",
      checkNumber: "CHK-99001",
      checkName: "TECHNO SYSTEMS INC",
    },
    correctionAuditTrail: [],
    history: [
      {
        id: "H1",
        action: "Application submitted.",
        staff: "System",
        timestamp: "Jul 20, 2026 08:30 AM",
      },
      {
        id: "H2",
        action: "Evaluation completed.",
        staff: "EVALUATOR EDGE",
        timestamp: "Jul 20, 2026 01:00 PM",
      },
      {
        id: "H3",
        action: "Payment verified.",
        staff: "CASHIER EDGE",
        timestamp: "Jul 20, 2026 03:00 PM",
      },
      {
        id: "H4",
        action: "License approved and issued.",
        staff: "ADMIN EDGE",
        timestamp: "Jul 20, 2026 04:45 PM",
      },
    ],
    note: "Routine renewal approved without issues.",
  },
  {
    id: "APP-2026-007",
    referenceNumber: "61-7-2026-5544-221",
    permitNumber: "",
    applicant: "ROBERTO P. GOMEZ",
    applicantType: "Individual",
    permitTitle: "New Amateur Radio License",
    category: "Licenses",
    status: "Declined",
    queueTab: "history",
    createdAt: "2026-07-21T10:15:00Z",
    dateLabel: "3 days ago â€¢ Jul 21, 2026",
    assignedTo: "EVALUATOR EDGE",
    applicationType: "SINGLE",
    isBeingViewed: false,
    isPinned: false,
    address: {
      barangay: "Malabag",
      province: "Cavite",
      city: "Silang",
      zipCode: "4118",
    },
    contactDetails: {
      contactNumber: "0999-555-4321",
      email: "roberto.gomez@example.ph",
    },
    basicInfo: {
      lastName: "Gomez",
      firstName: "Roberto",
      middleName: "Pineda",
      extensionName: "",
      dob: "Sep 20, 1985",
      placeOfBirth: "Manila",
      sex: "Male",
      weight: 68,
      height: 168,
      nationality: "Filipino",
      employmentStatus: "Employed",
      occupation: "Software Engineer",
    },
    applicationDetails: {
      noOfYears: 1,
      permitCategory: "Amateur Class C",
      formType: "LIC-AM",
      submittedAt: "Declined 3 days ago",
    },
    requirements: [
      { label: "Report of Rating", filename: "rating.pdf" },
      { label: "NBI Clearance", filename: "nbi.pdf" },
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
    ],
    soaItems: [],
    totalAmountDue: 0,
    dueDate: "Tue Jul 21 2026",
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
        timestamp: "Jul 21, 2026 10:15 AM",
      },
      {
        id: "H2",
        action: "Declined due to failure to provide actual test results.",
        staff: "EVALUATOR EDGE",
        timestamp: "Jul 21, 2026 02:30 PM",
      },
    ],
    note: "Applicant failed to provide mandatory test score documentation.",
  },
  {
    id: "APP-2026-008",
    referenceNumber: "61-7-2026-7890-123",
    permitNumber: "26-CERT-XIV-09876",
    applicant: "NORTH STAR SHIPPING",
    applicantType: "Company",
    permitTitle: "Ship Radio Station Certificate (NEW)",
    category: "Certificates",
    status: "For Approval",
    queueTab: "pending",
    createdAt: "2026-07-24T13:00:00Z",
    dateLabel: "Today â€¢ Jul 24, 2026",
    assignedTo: "ADMIN EDGE",
    applicationType: "SINGLE",
    isBeingViewed: false,
    isPinned: false,
    address: {
      barangay: "North Harbor",
      province: "Metro Manila",
      city: "Manila",
      zipCode: "1012",
    },
    contactDetails: {
      contactNumber: "02-555-9000",
      email: "vessels@northstar.ph",
    },
    basicInfo: {
      lastName: "Tan",
      firstName: "Wilson",
      middleName: "K",
      extensionName: "",
      dob: "Oct 05, 1970",
      placeOfBirth: "Manila",
      sex: "Male",
      weight: 88,
      height: 175,
      nationality: "Filipino",
      employmentStatus: "Employed",
      occupation: "Software Engineer",
    },
    applicationDetails: {
      noOfYears: 1,
      permitCategory: "Maritime Mobile Station",
      formType: "CERT-MAR",
      submittedAt: "Waiting for Admin Approval",
    },
    requirements: [
      { label: "Vessel Registry", filename: "vessel_reg.pdf" },
      { label: "Radio Operator Certificate", filename: "operator_roc.pdf" },
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
        canDownload: false,
        canRefresh: true,
      },
    ],
    soaItems: [
      {
        particular: "Ship Certificate Fee",
        validityYears: 1,
        percentage: 0,
        noOfUnits: 1,
        fees: 2500,
        amount: 2500,
        code: "4-02-01-120",
      },
    ],
    totalAmountDue: 2500,
    dueDate: "Mon Aug 24 2026",
    payment: {
      amountReceived: 2500,
      method: "cash",
      orNumber: "OR-100223-2026",
      checkNumber: "",
      checkName: "",
    },
    correctionAuditTrail: [],
    history: [
      {
        id: "H1",
        action: "Application submitted.",
        staff: "System",
        timestamp: "Jul 24, 2026 01:00 PM",
      },
      {
        id: "H2",
        action: "Technical evaluation passed.",
        staff: "EVALUATOR EDGE",
        timestamp: "Jul 24, 2026 02:00 PM",
      },
      {
        id: "H3",
        action: "Payment verified.",
        staff: "CASHIER EDGE",
        timestamp: "Jul 24, 2026 03:30 PM",
      },
    ],
    note: "Urgent: Vessel schedule is on Monday. Admin approval prioritized.",
  },
  {
    id: "APP-2026-009",
    referenceNumber: "61-7-2026-3344-556",
    permitNumber: "",
    applicant: "MARIA LOUISA S. SANTOS",
    applicantType: "Individual",
    permitTitle: "Radio Operator Exam Admission",
    category: "Exams",
    status: "For Verification",
    queueTab: "pending",
    createdAt: "2026-07-24T14:30:00Z",
    dateLabel: "Today â€¢ Jul 24, 2026",
    assignedTo: "CASHIER EDGE",
    applicationType: "SINGLE",
    isBeingViewed: false,
    isPinned: false,
    address: {
      barangay: "Bagtas",
      province: "Occidental Mindoro",
      city: "Mamburao",
      zipCode: "5106",
    },
    contactDetails: {
      contactNumber: "0915-111-2222",
      email: "louisa.santos@gmail.com",
    },
    basicInfo: {
      lastName: "Santos",
      firstName: "Maria Louisa",
      middleName: "Sy",
      extensionName: "",
      dob: "Feb 14, 1999",
      placeOfBirth: "Manila",
      sex: "Female",
      weight: 52,
      height: 160,
      nationality: "Filipino",
      employmentStatus: "Unemployed",
      occupation: "Software Engineer",
    },
    applicationDetails: {
      noOfYears: 0,
      permitCategory: "General Radio Operator Certificate",
      formType: "EXAM-GROC",
      submittedAt: "Payment verification in progress",
    },
    requirements: [
      { label: "Transcript of Records", filename: "tor_louisa.pdf" },
      { label: "Training Certificate", filename: "training_cert.pdf" },
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
    ],
    soaItems: [
      {
        particular: "Examination Fee",
        validityYears: 0,
        percentage: 0,
        noOfUnits: 1,
        fees: 50,
        amount: 50,
        code: "4-02-01-070",
      },
    ],
    totalAmountDue: 50,
    dueDate: "Fri Aug 24 2026",
    payment: {
      amountReceived: 50,
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
        timestamp: "Jul 24, 2026 02:30 PM",
      },
      {
        id: "H2",
        action: "Evaluation completed, moved to cashier.",
        staff: "EVALUATOR EDGE",
        timestamp: "Jul 24, 2026 03:45 PM",
      },
    ],
    note: "Applicant paid at the counter, awaiting OR number encoding.",
  },
  {
    id: "APP-2026-010",
    referenceNumber: "61-7-2026-6677-889",
    permitNumber: "",
    applicant: "GLOBAL BROADCAST HUB",
    applicantType: "Company",
    permitTitle: "Radio Station License New",
    category: "Licenses",
    status: "In Process",
    queueTab: "activity",
    createdAt: "2026-07-24T15:00:00Z",
    dateLabel: "Today â€¢ Jul 24, 2026",
    assignedTo: "EVALUATOR EDGE",
    applicationType: "MULTIPLE",
    isBeingViewed: true,
    isPinned: false,
    address: {
      barangay: "Wack-Wack",
      province: "Metro Manila",
      city: "Mandaluyong City",
      zipCode: "1550",
    },
    contactDetails: {
      contactNumber: "02-777-5555",
      email: "regulatory@globalbroadcast.ph",
    },
    basicInfo: {
      lastName: "Reyes",
      firstName: "Christopher",
      middleName: "M",
      extensionName: "",
      dob: "Dec 12, 1982",
      placeOfBirth: "Manila",
      sex: "Male",
      weight: 80,
      height: 180,
      nationality: "Filipino",
      employmentStatus: "Employed",
      occupation: "Software Engineer",
    },
    applicationDetails: {
      noOfYears: 1,
      permitCategory: "Broadcast Station (FM)",
      formType: "LIC-NEW",
      submittedAt: "Currently in evaluation",
    },
    requirements: [
      { label: "CPCN / PA Certificate", filename: "cpcn.pdf" },
      { label: "Technical Plans", filename: "tech_plans.pdf" },
      { label: "Engineering Report", filename: "eng_report.pdf" },
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
    ],
    soaItems: [
      {
        particular: "Filing Fee",
        validityYears: 1,
        percentage: 0,
        noOfUnits: 1,
        fees: 1500,
        amount: 1500,
        code: "4-02-01-130",
      },
    ],
    totalAmountDue: 1500,
    dueDate: "Fri Aug 24 2026",
    payment: {
      amountReceived: 1500,
      method: "check",
      orNumber: "OR-222331-2026",
      checkNumber: "CHK-44552",
      checkName: "GLOBAL BROADCAST HUB",
    },
    correctionAuditTrail: [],
    history: [
      {
        id: "H1",
        action: "Application submitted.",
        staff: "System",
        timestamp: "Jul 24, 2026 03:00 PM",
      },
      {
        id: "H2",
        action: "Assigned to evaluator.",
        staff: "System",
        timestamp: "Jul 24, 2026 03:05 PM",
      },
      {
        id: "H3",
        action: "Initial document verification in progress.",
        staff: "EVALUATOR EDGE",
        timestamp: "Jul 24, 2026 03:30 PM",
      },
    ],
    note: "Complex broadast application. Evaluator reviewing CPCN validity.",
  },
  {
    id: "APP-2026-011",
    referenceNumber: "61-7-2026-0011-222",
    permitNumber: "",
    applicant: "ISABEL B. MERCADO",
    applicantType: "Individual",
    permitTitle: "Radio Operator Certificate Renewal",
    category: "Certificates",
    status: "Returned",
    queueTab: "pending",
    createdAt: "2026-07-24T15:30:00Z",
    dateLabel: "Today â€¢ Jul 24, 2026",
    assignedTo: "EVALUATOR EDGE",
    applicationType: "SINGLE",
    isBeingViewed: false,
    isPinned: false,
    address: {
      barangay: "Bungad",
      province: "Metro Manila",
      city: "Quezon City",
      zipCode: "1105",
    },
    contactDetails: {
      contactNumber: "0918-777-6655",
      email: "isabel.mercado@example.com",
    },
    basicInfo: {
      lastName: "Mercado",
      firstName: "Isabel",
      middleName: "Bautista",
      extensionName: "",
      dob: "Jan 22, 1990",
      placeOfBirth: "Manila",
      sex: "Female",
      weight: 54,
      height: 160,
      nationality: "Filipino",
      employmentStatus: "Employed",
      occupation: "Radio Operator",
    },
    applicationDetails: {
      noOfYears: 1,
      permitCategory: "First Class Radiotelegraph",
      formType: "CERT-REN",
      submittedAt: "Returned for correction",
    },
    requirements: [
      { label: "Old Certificate", filename: "old_cert_isabel.pdf" },
      { label: "Proof of Experience", filename: "exp_letter.pdf" },
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
    ],
    soaItems: [],
    totalAmountDue: 0,
    dueDate: "Sat Aug 24 2026",
    payment: {
      amountReceived: 0,
      method: "cash",
      orNumber: "",
      checkNumber: "",
      checkName: "",
    },
    correctionAuditTrail: [
      {
        id: "C2",
        action: "Requested clearer scan of old certificate.",
        staff: "EVALUATOR EDGE",
        timestamp: "Jul 24, 2026 04:00 PM",
      },
    ],
    history: [
      {
        id: "H1",
        action: "Application submitted.",
        staff: "System",
        timestamp: "Jul 24, 2026 03:30 PM",
      },
      {
        id: "H2",
        action: "Returned to applicant for clearer documents.",
        staff: "EVALUATOR EDGE",
        timestamp: "Jul 24, 2026 04:00 PM",
      },
    ],
    note: "Waiting for applicant to re-upload clear attachment.",
  },
  {
    id: "APP-2026-012",
    referenceNumber: "61-7-2026-1212-343",
    permitNumber: "26-LIC-XIV-55443",
    applicant: "OCEANIC SHIPPING LINE",
    applicantType: "Company",
    permitTitle: "Radio Station License New",
    category: "Licenses",
    status: "Completed",
    queueTab: "history",
    createdAt: "2026-07-15T10:00:00Z",
    dateLabel: "9 days ago â€¢ Jul 15, 2026",
    assignedTo: "CASHIER EDGE",
    applicationType: "MULTIPLE",
    isBeingViewed: false,
    isPinned: false,
    address: {
      barangay: "Port Area",
      province: "Metro Manila",
      city: "Manila",
      zipCode: "1018",
    },
    contactDetails: {
      contactNumber: "02-8527-1234",
      email: "regulatory@oceanicshipping.ph",
    },
    basicInfo: {
      lastName: "Villanueva",
      firstName: "Luis",
      middleName: "G",
      extensionName: "",
      dob: "Nov 05, 1978",
      placeOfBirth: "Cebu",
      sex: "Male",
      weight: 82,
      height: 175,
      nationality: "Filipino",
      employmentStatus: "Employed",
      occupation: "Compliance Officer",
    },
    applicationDetails: {
      noOfYears: 5,
      permitCategory: "Maritime Mobile (Ship)",
      formType: "LIC-NEW-MAR",
      submittedAt: "Completed 9 days ago",
    },
    requirements: [
      { label: "Vessel Registry", filename: "registry_vessel.pdf" },
      { label: "Stability Booklet", filename: "stability.pdf" },
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
        canDownload: true,
        canRefresh: true,
      },
    ],
    soaItems: [
      {
        particular: "License Fee (5 years)",
        validityYears: 5,
        percentage: 0,
        noOfUnits: 1,
        fees: 5000,
        amount: 5000,
        code: "4-02-01-110",
      },
    ],
    totalAmountDue: 5000,
    dueDate: "Wed Jul 15 2026",
    payment: {
      amountReceived: 5000,
      method: "check",
      orNumber: "OR-66554-2026",
      checkNumber: "CHK-77881",
      checkName: "OCEANIC SHIPPING LINE",
    },
    correctionAuditTrail: [],
    history: [
      {
        id: "H1",
        action: "Application submitted.",
        staff: "System",
        timestamp: "Jul 15, 2026 10:00 AM",
      },
      {
        id: "H2",
        action: "Evaluation passed.",
        staff: "EVALUATOR EDGE",
        timestamp: "Jul 15, 2026 02:00 PM",
      },
      {
        id: "H3",
        action: "Payment verified and OR issued.",
        staff: "CASHIER EDGE",
        timestamp: "Jul 15, 2026 04:00 PM",
      },
      {
        id: "H4",
        action: "License issued.",
        staff: "ADMIN EDGE",
        timestamp: "Jul 15, 2026 05:00 PM",
      },
    ],
    note: "All documents in order. Fast-tracked.",
  },
  {
    id: "APP-2026-013",
    referenceNumber: "61-7-2026-9999-000",
    permitNumber: "26-ACCR-XIV-001",
    applicant: "QUANTUM CONNECTIVITY CORP",
    applicantType: "Company",
    permitTitle: "New Dealer Accreditation",
    category: "Accreditations",
    status: "Approved",
    queueTab: "activity",
    createdAt: "2026-07-23T09:00:00Z",
    dateLabel: "Yesterday â€¢ Jul 23, 2026",
    assignedTo: "ADMIN EDGE",
    applicationType: "SINGLE",
    isBeingViewed: false,
    isPinned: false,
    address: {
      barangay: "San Lorenzo",
      province: "Metro Manila",
      city: "Makati City",
      zipCode: "1223",
    },
    contactDetails: {
      contactNumber: "02-8812-4455",
      email: "corp@quantumconnect.ph",
    },
    basicInfo: {
      lastName: "Santos",
      firstName: "Ferdinand",
      middleName: "M",
      extensionName: "",
      dob: "May 12, 1970",
      placeOfBirth: "Manila",
      sex: "Male",
      weight: 78,
      height: 170,
      nationality: "Filipino",
      employmentStatus: "Employed",
      occupation: "Managing Director",
    },
    applicationDetails: {
      noOfYears: 1,
      permitCategory: "Radio Equipment Dealer",
      formType: "ACCR-D-NEW",
      submittedAt: "Approved yesterday",
    },
    requirements: [
      { label: "Articles of Incorporation", filename: "aoi.pdf" },
      { label: "DTI/SEC", filename: "sec_cert.pdf" },
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
    ],
    soaItems: [
      {
        particular: "Accreditation Fee",
        validityYears: 1,
        percentage: 0,
        noOfUnits: 1,
        fees: 3000,
        amount: 3000,
        code: "4-02-01-090",
      },
    ],
    totalAmountDue: 3000,
    dueDate: "Sun Jul 23 2026",
    payment: {
      amountReceived: 3000,
      method: "check",
      orNumber: "OR-112233-2026",
      checkNumber: "CHK-00992",
      checkName: "QUANTUM CONNECTIVITY CORP",
    },
    correctionAuditTrail: [],
    history: [
      {
        id: "H1",
        action: "Application submitted.",
        staff: "System",
        timestamp: "Jul 23, 2026 09:00 AM",
      },
      {
        id: "H2",
        action: "Approved for issuance.",
        staff: "ADMIN EDGE",
        timestamp: "Jul 23, 2026 04:30 PM",
      },
    ],
    note: "High-priority corporate accreditation.",
  },
  {
    id: "APP-2026-014",
    referenceNumber: "61-7-2026-5566-778",
    permitNumber: "",
    applicant: "DR. EMMA L. GARCIA",
    applicantType: "Individual",
    permitTitle: "New Amateur Radio License",
    category: "Licenses",
    status: "For Approval",
    queueTab: "pending",
    createdAt: "2026-07-24T16:00:00Z",
    dateLabel: "Today â€¢ Jul 24, 2026",
    assignedTo: "ADMIN EDGE",
    applicationType: "SINGLE",
    isBeingViewed: false,
    isPinned: true,
    address: {
      barangay: "U.P. Village",
      province: "Metro Manila",
      city: "Quezon City",
      zipCode: "1101",
    },
    contactDetails: {
      contactNumber: "0917-888-1122",
      email: "emma.garcia@gmail.com",
    },
    basicInfo: {
      lastName: "Garcia",
      firstName: "Emma",
      middleName: "Luna",
      extensionName: "",
      dob: "Nov 14, 1985",
      placeOfBirth: "Davao",
      sex: "Female",
      weight: 56,
      height: 162,
      nationality: "Filipino",
      employmentStatus: "Employed",
      occupation: "Medical Doctor",
    },
    applicationDetails: {
      noOfYears: 1,
      permitCategory: "Amateur Class B",
      formType: "LIC-AM-NEW",
      submittedAt: "Awaiting Admin Signature",
    },
    requirements: [
      { label: "Result of Rating", filename: "rating_b.pdf" },
      { label: "Valid ID", filename: "prc_id.jpg" },
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
    ],
    soaItems: [
      {
        particular: "License Fee",
        validityYears: 1,
        percentage: 0,
        noOfUnits: 1,
        fees: 180,
        amount: 180,
        code: "4-02-01-115",
      },
    ],
    totalAmountDue: 180,
    dueDate: "Sat Aug 24 2026",
    payment: {
      amountReceived: 200,
      method: "cash",
      orNumber: "OR-998877-2026",
      checkNumber: "",
      checkName: "",
    },
    correctionAuditTrail: [],
    history: [
      {
        id: "H1",
        action: "Application submitted.",
        staff: "System",
        timestamp: "Jul 24, 2026 04:00 PM",
      },
      {
        id: "H2",
        action: "Evaluated and endorsed.",
        staff: "EVALUATOR EDGE",
        timestamp: "Jul 24, 2026 04:45 PM",
      },
    ],
    note: "Endorsed for Admin approval by Senior Evaluator.",
  },
  {
    id: "APP-2026-015",
    referenceNumber: "61-7-2026-8899-001",
    permitNumber: "",
    applicant: "METRO TOWERS INC",
    applicantType: "Company",
    permitTitle: "Radio Station License Renewal",
    category: "Licenses",
    status: "For Verification",
    queueTab: "pending",
    createdAt: "2026-07-24T16:30:00Z",
    dateLabel: "Today â€¢ Jul 24, 2026",
    assignedTo: "CASHIER EDGE",
    applicationType: "MULTIPLE",
    isBeingViewed: false,
    isPinned: false,
    address: {
      barangay: "Bel-Air",
      province: "Metro Manila",
      city: "Makati City",
      zipCode: "1209",
    },
    contactDetails: {
      contactNumber: "02-7750-9900",
      email: "admin@metrotowers.ph",
    },
    basicInfo: {
      lastName: "Pascual",
      firstName: "Antonio",
      middleName: "S",
      extensionName: "",
      dob: "Aug 20, 1975",
      placeOfBirth: "Manila",
      sex: "Male",
      weight: 85,
      height: 178,
      nationality: "Filipino",
      employmentStatus: "Employed",
      occupation: "Operations Manager",
    },
    applicationDetails: {
      noOfYears: 2,
      permitCategory: "Land Mobile (Base/Mobile)",
      formType: "LIC-REN",
      submittedAt: "Awaiting Cashier Validation",
    },
    requirements: [
      { label: "Current License", filename: "current_lic_metro.pdf" },
      { label: "Updated Station List", filename: "stations_2026.pdf" },
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
    ],
    soaItems: [
      {
        particular: "Renewal Fee (2 years)",
        validityYears: 2,
        percentage: 0,
        noOfUnits: 20,
        fees: 800,
        amount: 16000,
        code: "4-02-01-110",
      },
    ],
    totalAmountDue: 16000,
    dueDate: "Sat Aug 24 2026",
    payment: {
      amountReceived: 16000,
      method: "check",
      orNumber: "",
      checkNumber: "CHK-554432",
      checkName: "METRO TOWERS INC",
    },
    correctionAuditTrail: [],
    history: [
      {
        id: "H1",
        action: "Application submitted.",
        staff: "System",
        timestamp: "Jul 24, 2026 04:30 PM",
      },
      {
        id: "H2",
        action: "Evaluation finished, payment endorsement generated.",
        staff: "EVALUATOR EDGE",
        timestamp: "Jul 24, 2026 05:00 PM",
      },
    ],
    note: "Check payment deposited, awaiting clearing and OR issuance.",
  },
];
