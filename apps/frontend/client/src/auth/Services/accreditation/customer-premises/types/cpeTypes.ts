export interface CPEAccreditationWizardProps {
  onClose: () => void;
  onSuccess: () => void;
  isDetailsExpanded: boolean;
  onToggleExpand: () => void;
  step: number;
  setStep: (step: number | ((p: number) => number)) => void;
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
  selectedOfficeId: string;
  setSelectedOfficeId: (id: string) => void;
  appMode: "SINGLE" | "BULK" | "";
  setAppMode: (mode: "SINGLE" | "BULK" | "") => void;
  bulkMethod: "MANUAL" | "EXCEL";
  setBulkMethod: (method: "MANUAL" | "EXCEL") => void;
  isFileUploaded: boolean;
  setIsFileUploaded: (val: boolean) => void;
  uploadedFileName: string;
  setUploadedFileName: (name: string) => void;
  applicants: ApplicantData[];
  setApplicants: React.Dispatch<React.SetStateAction<ApplicantData[]>>;
  currentApplicantIndex: number;
  setCurrentApplicantIndex: (idx: number) => void;
}

export interface ApplicantData {
  id: number;
  appType: "NEW" | "RENEWAL" | "MODIFICATION";
  years: string;
  variation: string;
  accreditationNo: string;
  businessName: string;
  entityType: string;
  dtiNo: string;
  regionName: string;
  province: string;
  city: string;
  barangay: string;
  street: string;
  zone: string;
  unitBldgNo: string;
  zipCode: string;
  contactNo: string;
  email: string;
  engineerName: string;
  eceNo: string;
  technicianName: string;
  ectNo: string;
  expiryMonth: string;
  expiryDate: string;
  expiryYear: string;
  uploads: Record<string, string | { name: string; uri: string }>;
}

export const initialApplicant = (id: number): ApplicantData => ({
  id,
  appType: "NEW",
  years: "1",
  variation: "Mobile",
  accreditationNo: "",
  businessName: "",
  entityType: "Corporation",
  dtiNo: "",
  regionName: "",
  province: "",
  city: "",
  barangay: "",
  street: "",
  zone: "",
  unitBldgNo: "",
  zipCode: "",
  contactNo: "",
  email: "",
  engineerName: "",
  eceNo: "",
  technicianName: "",
  ectNo: "",
  expiryMonth: "January",
  expiryDate: "1",
  expiryYear: "2026",
  uploads: {},
});
