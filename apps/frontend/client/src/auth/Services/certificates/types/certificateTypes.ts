// Certificate Application Types for NTC-EDGE Client

export type ApplicationVariantType = "NEW" | "RENEWAL" | "MODIFICATION" | "DUPLICATE" | "CERTIFIED_TRUE_COPY";

// ── 1. Radio Operator Certificates (NTC 1-02 & NTC 1-03) ──────────────────────
export interface RadioOperatorCertData {
  id: number;
  appType: ApplicationVariantType;
  years: string;
  typeOfCertificate: string; // e.g. 1RTG, 2RTG, 1PHN, GROC, Class A, Class B, etc.
  certificateNo: string;     // Required for Renewal & Modification
  dateOfExpiry: string;      // Required for Renewal & Modification
  modificationDueTo: string; // Required for Modification
  
  // Basic Applicant Info
  applicantName: string;
  businessName: string;
  isBusiness: boolean;
  address: string;
  province: string;
  city: string;
  barangay: string;
  street: string;
  contactNo: string;
  email: string;
  
  // Employment & Qualifications
  employmentStatus: string;
  employmentType: string;
  employmentLocation: string;
  weightKg: string;
  heightCm: string;
  
  // Exam / Seminar Details
  placeOfExamSeminar: string;
  examDate: string;
  ratings: string;
  examSeminarDetails: string;
  
  // Amateur Specific (NTC 1-03)
  classOfStation: string;
  clubName: string;
  clubCallSign: string;
  
  // Uploads
  uploads: Record<string, { name: string; uri: string } | string>;
}

// ── 2. RFID, SRD, WDN Devices - Indoor (NTC 1-19) ─────────────────────────────
export interface DeviceSerialItem {
  id: string;
  serialNumber: string;
}

export interface EquipmentParticularItem {
  id: string;
  typeOfEquipmentDevice: string; // e.g. WDN Devices - Indoor, RFID, SRD
  nameTypeModel: string;
  equipmentSerials: DeviceSerialItem[];
}

export interface DeviceRegistrationData {
  id: number;
  appType: ApplicationVariantType;
  registrationType: "Dealers" | "Non-Dealers";
  invoiceNo: string; // Required for Non-dealers
  
  // Basic Applicant Info
  isBusiness: boolean;
  applicantName: string;
  businessName: string;
  entityType: string;
  dtiSecNo: string;
  address: string;
  province: string;
  city: string;
  barangay: string;
  street: string;
  zipCode: string;
  contactNo: string;
  email: string;
  
  // Particulars (Repeating List)
  particulars: EquipmentParticularItem[];
  
  // Uploads
  uploads: Record<string, { name: string; uri: string } | string>;
}

// ── 3. TVRO Registration Certificate (NTC 1-22) ───────────────────────────────
export type TVROEquipmentType = "LNA/LNB" | "Receivers" | "Combiner/s" | "Modulators";

export interface TVROEquipmentItem {
  id: string;
  type: TVROEquipmentType | string;
  makeTypeModel: string;
  serialNo: string;
  frequencyRange: string;
}

export interface TVROAntennaItem {
  id: string;
  makeTypeModel: string;
  dishDiameter: string;
  polarization: string;
  azimuth: string;
}

export interface TVROSignalItem {
  id: string;
  satellite: string;
  receivedFrequency: string;
  polarization: string;
  nameOfPrograms: string;
}

export interface TVRORegistrationData {
  id: number;
  appType: ApplicationVariantType;
  classification: "Commercial" | "Non-Commercial";
  years: string;
  bsdNumber: string; // Assigned by NTC: TO BE ASSIGNED BY NTC
  
  // Basic Info
  isBusiness: boolean;
  applicantName: string;
  businessName: string;
  address: string;
  province: string;
  city: string;
  barangay: string;
  street: string;
  zipCode: string;
  contactNo: string;
  email: string;
  
  // Section 4: Location
  serviceArea: string;
  exactLocation: string;
  longitude: string;
  latitude: string;

  // Repeating Engineering Tables
  particularsEquipment: TVROEquipmentItem[];
  particularsOfAntennaSystem: TVROAntennaItem[];
  particularsOfSignalToBeReceived: TVROSignalItem[];
  
  // Uploads
  uploads: Record<string, { name: string; uri: string } | string>;
}

// ── 4. Value-Added Service (VAS) Provider (NTC 1-20) ──────────────────────────
export interface VASProviderData {
  id: number;
  appType: ApplicationVariantType;
  years: string;
  certificateNumber: string; // Required for Renewal & Modification
  expiryDate: string;        // Required for Renewal & Modification
  modificationDueTo: string;
  
  // Basic Info
  isBusiness: boolean;
  applicantName: string;
  businessName: string;
  serviceType: "Single Proprietorship" | "Corporation" | "Partnership" | "Others";
  address: string;
  province: string;
  city: string;
  barangay: string;
  street: string;
  zipCode: string;
  contactNo: string;
  email: string;
  
  // Regulatory Authority Details
  serviceNo: string; // CPCN / PA / CA No
  cpcnPaCaDateOfExpiry: string;
  corVasDateOfExpiry: string;
  isKnownByOtherName: boolean;
  otherTradeName: string;
  
  // Selected Services
  valueAddedServices: string[];
  vasRegistrationNo: string; // Assigned by NTC
  
  // Uploads
  uploads: Record<string, { name: string; uri: string } | string>;
}

// ── 5. Copy of Certificates (NTC 1-21) ────────────────────────────────────────
export interface CopyOfCertificateData {
  id: number;
  copyType: "CERTIFIED_TRUE_COPY" | "DUPLICATE";
  targetService: string; // e.g. "Radio Operator Certificate", "Amateur License", etc.
  targetCertificateType?: string; // e.g. "1RTG", "Class A", etc.
  certificateNo: string;
  
  // Certified True Copy Specific
  numberOfCopies: string;
  
  // Duplicate Specific
  isBusiness: boolean;
  applicantName: string;
  businessName: string;
  address: string;
  province: string;
  city: string;
  barangay: string;
  street: string;
  zipCode: string;
  contactNo: string;
  email: string;
  circumstancesOfLoss: string;
  
  // Uploads
  uploads: Record<string, { name: string; uri: string } | string>;
}
