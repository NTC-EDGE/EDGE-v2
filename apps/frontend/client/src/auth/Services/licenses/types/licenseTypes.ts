// License Application Types for NTC-EDGE Client

export type LicenseApplicationType = "NEW" | "RENEWAL" | "MODIFICATION";

export interface SerialFrequencyItem {
  id: string;
  serialNo: string;
  frequencyRange: string;
  powerOutput?: string;
}

export interface EquipmentMakeModelGroup {
  id: string;
  makeTypeModel: string;
  equipments: SerialFrequencyItem[];
}

// ── 1. Amateur Radio Station License (NEW / RENEWAL / MODIFICATION) ─────────────
export interface AmateurRadioStationLicenseData {
  id: number;
  appType: LicenseApplicationType;
  modificationDueTo: string; // Required for MODIFICATION
  licenseNo: string;        // Required for RENEWAL & MODIFICATION
  dateOfExpiry: string;     // Required for RENEWAL & MODIFICATION
  noOfYears: string;        // 1 Year, 2 Years, 3 Years, 5 Years
  classOfStation: string;   // Class A, Class B, Class C, Class D

  // Basic Info
  firstName: string;
  lastName: string;
  middleName: string;
  suffix: string;
  dateOfBirth: string;      // YYYY-MM-DD or MM/DD/YYYY
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  address: string;
  contactNo: string;
  email: string;
  location: string;         // Station Location / Site Address

  // Call Sign
  callSign: string;         // "To be assigned by NTC" for new, or current callsign

  // Exam / Seminar Background
  placeOfExamSeminar: string;
  dateOfExamSeminar: string;
  ratings: string;

  // Equipment Particulars (Nested Repeating Groups)
  particularsEquipment: EquipmentMakeModelGroup[];

  // Uploads
  uploads: Record<string, { name: string; uri: string } | string>;
}

export const initialAmateurRadioStationLicenseData = (id: number): AmateurRadioStationLicenseData => ({
  id,
  appType: "NEW",
  modificationDueTo: "",
  licenseNo: "",
  dateOfExpiry: "",
  noOfYears: "3",
  classOfStation: "Class A",
  firstName: "",
  lastName: "",
  middleName: "",
  suffix: "",
  dateOfBirth: "",
  birthMonth: "January",
  birthDay: "1",
  birthYear: "1990",
  address: "",
  contactNo: "",
  email: "",
  location: "",
  callSign: "To be assigned by NTC",
  placeOfExamSeminar: "",
  dateOfExamSeminar: "",
  ratings: "",
  particularsEquipment: [
    {
      id: "eq-group-1",
      makeTypeModel: "",
      equipments: [
        { id: "eq-item-1", serialNo: "", frequencyRange: "", powerOutput: "" },
      ],
    },
  ],
  uploads: {},
});

// ── 2. Lifetime Amateur Radio Station License for Class A ──────────────────
export interface LifetimeAmateurLicenseData {
  id: number;
  appType: "NEW";
  
  // Basic Info
  firstName: string;
  lastName: string;
  middleName: string;
  suffix: string;
  dateOfBirth: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  address: string;
  contactNo: string;
  email: string;
  location: string;
  callSign: string;
  yearsOfAmateurService: string; // Must be at least 15 consecutive years

  // Club Affiliation & License Details
  memberClubName: string;        // Registered amateur club or association with NTC
  certOfGoodStandingNo: string;
  existingClassALicenseNo: string;
  licenseExpiryDate: string;

  // Checklist acknowledgments
  hasLetterRequest: boolean;
  hasCertOfGoodStanding: boolean;
  hasValidGovtId: boolean;
  hasClassALicense: boolean;
  hasProofOf15YearsService: boolean;
  has1x1Photo: boolean;

  // Uploads
  uploads: Record<string, { name: string; uri: string } | string>;
}

export const initialLifetimeAmateurLicenseData = (id: number): LifetimeAmateurLicenseData => ({
  id,
  appType: "NEW",
  firstName: "",
  lastName: "",
  middleName: "",
  suffix: "",
  dateOfBirth: "",
  birthMonth: "January",
  birthDay: "1",
  birthYear: "1960",
  address: "",
  contactNo: "",
  email: "",
  location: "",
  callSign: "",
  yearsOfAmateurService: "15",
  memberClubName: "",
  certOfGoodStandingNo: "",
  existingClassALicenseNo: "",
  licenseExpiryDate: "",
  hasLetterRequest: true,
  hasCertOfGoodStanding: true,
  hasValidGovtId: true,
  hasClassALicense: true,
  hasProofOf15YearsService: true,
  has1x1Photo: true,
  uploads: {},
});
