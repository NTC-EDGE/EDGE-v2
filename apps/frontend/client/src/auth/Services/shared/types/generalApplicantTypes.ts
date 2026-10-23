import {
  RadioOperatorCertData,
  DeviceRegistrationData,
  TVRORegistrationData,
  VASProviderData,
  CopyOfCertificateData,
} from "../../certificates";
import {
  AmateurRadioStationLicenseData,
  LifetimeAmateurLicenseData,
} from "../../licenses";
import {
  AmateurPermitData,
  CopyOfPermitData,
} from "../../permits";

export interface TenantInfo {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface OfficeInfo {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface ExamScheduleItem {
  id: string;
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  maximumSlots?: number;
  availableSlots?: number;
  description?: string;
  startDate?: string;
  endDate?: string;
  startApplication?: string;
  endApplication?: string;
  applicationDeadline?: string;
  regionName?: string;
  tenantName?: string;
  serviceName?: string;
  remarks?: string;
  title?: string;
  [key: string]: unknown;
}

export interface GeneralApplicantData {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  applicantType?: "individual" | "company";
  companyName?: string;
  representativeFirstName?: string;
  representativeMiddleName?: string;
  representativeLastName?: string;
  representativeSuffix?: string;
  representativeName?: string;
  representativePosition?: string;
  dtiSecRegistration?: string;
  email: string;
  contactNo: string;
  sex?: string;
  civilStatus?: string;
  nationality?: string;
  zipCode?: string;
  address: string;
  region?: string;
  province?: string;
  city?: string;
  barangay?: string;
  street?: string;
  schoolName?: string;
  schoolAttended?: string;
  courseDegree?: string;
  courseTaken?: string;
  yearGraduated?: string;
  specialOrderNo?: string;
  examType?: string;
  examineeType?: string;
  selectedOption?: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  birthDate?: string;
  notes: string;
  selectedVariantId?: string;
  selectedVariantName?: string;
  selectedElementId?: string;
  selectedElementTitle?: string;
  uploads: Record<string, { name: string; uri: string; type?: string; file?: File | Blob } | string>;
  formFieldValues?: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  signatureUrl?: string;
  // Specialized Certificate, License & Permit Models (undefined by default to prevent payload alteration)
  radioCertData?: RadioOperatorCertData;
  deviceRegData?: DeviceRegistrationData;
  tvroRegData?: TVRORegistrationData;
  vasData?: VASProviderData;
  copyOfCertData?: CopyOfCertificateData;
  copyOfPermitData?: CopyOfPermitData;
  amateurLicenseData?: AmateurRadioStationLicenseData;
  lifetimeLicenseData?: LifetimeAmateurLicenseData;
  permitData?: AmateurPermitData;
}

export const initialGeneralApplicant = (id: number): GeneralApplicantData => ({
  id,
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  applicantType: "individual",
  companyName: "",
  representativeFirstName: "",
  representativeMiddleName: "",
  representativeLastName: "",
  representativeSuffix: "",
  representativeName: "",
  representativePosition: "",
  dtiSecRegistration: "",
  email: "",
  contactNo: "",
  address: "",
  birthMonth: "",
  birthDay: "",
  birthYear: "",
  notes: "",
  selectedVariantId: "",
  uploads: {},
  radioCertData: undefined,
  deviceRegData: undefined,
  tvroRegData: undefined,
  vasData: undefined,
  copyOfCertData: undefined,
  copyOfPermitData: undefined,
  amateurLicenseData: undefined,
  lifetimeLicenseData: undefined,
  permitData: undefined,
});
