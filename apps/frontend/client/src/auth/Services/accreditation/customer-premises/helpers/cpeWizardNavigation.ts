import { Alert } from "react-native";
import { ApplicantData } from "../types/cpeTypes";
import { getRequirementsList } from "../components/wizard/CPEStep6DocumentUpload";

interface NavigationContext {
  step: number;
  setStep: (step: number | ((p: number) => number)) => void;
  selectedRegionId: string;
  selectedOfficeId: string;
  appMode: "SINGLE" | "BULK" | "";
  bulkMethod: "MANUAL" | "EXCEL";
  isFileUploaded: boolean;
  activeApplicant: ApplicantData;
  applicants: ApplicantData[];
  currentApplicantIndex: number;
  setCurrentApplicantIndex: (idx: number) => void;
  validateForm: (app: ApplicantData) => boolean;
  setTouched: (touched: Record<string, boolean>) => void;
  setIsConfirmModalOpen: (open: boolean) => void;
  onClose: () => void;
}

export function handleCPENext({
  step,
  setStep,
  selectedRegionId,
  selectedOfficeId,
  appMode,
  bulkMethod,
  isFileUploaded,
  activeApplicant,
  applicants,
  currentApplicantIndex,
  setCurrentApplicantIndex,
  validateForm,
  setTouched,
  setIsConfirmModalOpen,
}: NavigationContext) {
  if (step === 1) {
    setStep(2);
  } else if (step === 2) {
    if (!selectedRegionId || !selectedOfficeId) {
      Alert.alert("Error", "Please select region and office.");
      return;
    }
    setStep(3);
  } else if (step === 3) {
    if (appMode === "SINGLE") {
      setStep(5);
    } else {
      setStep(4);
    }
  } else if (step === 4) {
    if (bulkMethod === "EXCEL") {
      if (!isFileUploaded) {
        Alert.alert("Error", "Please upload the CSV/Excel file to proceed.");
        return;
      }
      setStep(7);
    } else {
      setStep(5);
    }
  } else if (step === 5) {
    const isValid = validateForm(activeApplicant);
    if (!isValid) {
      const fields = [
        "years", "variation", "accreditationNo", "businessName", "entityType", "dtiNo",
        "province", "city", "barangay", "street", "zone", "unitBldgNo", "zipCode",
        "contactNo", "email", "engineerName", "eceNo", "technicianName", "ectNo",
        "expiryMonth", "expiryDate", "expiryYear"
      ];
      const nextTouched: Record<string, boolean> = {};
      fields.forEach((f) => nextTouched[f] = true);
      setTouched(nextTouched);

      Alert.alert("Validation Error", "Please fill in all required fields marked with *.");
      return;
    }
    setStep(6);
  } else if (step === 6) {
    const reqList = getRequirementsList(activeApplicant.appType);
    const allUploaded = reqList.every((_, idx) => activeApplicant.uploads[idx.toString()]);
    if (!allUploaded) {
      Alert.alert("Error", "Please upload all mandatory supporting documents.");
      return;
    }

    if (appMode === "BULK" && bulkMethod === "MANUAL" && currentApplicantIndex < applicants.length - 1) {
      setCurrentApplicantIndex(currentApplicantIndex + 1);
      setStep(5);
    } else {
      setStep(7);
    }
  } else if (step === 7) {
    setIsConfirmModalOpen(true);
  }
}

export function handleCPEBack({
  step,
  setStep,
  appMode,
  bulkMethod,
  onClose,
}: Pick<NavigationContext, "step" | "setStep" | "appMode" | "bulkMethod" | "onClose">) {
  if (step === 1) {
    onClose();
  } else if (step === 2) {
    setStep(1);
  } else if (step === 3) {
    setStep(2);
  } else if (step === 4) {
    setStep(3);
  } else if (step === 5) {
    if (appMode === "SINGLE") {
      setStep(3);
    } else {
      setStep(4);
    }
  } else if (step === 6) {
    setStep(5);
  } else if (step === 7) {
    if (appMode === "BULK" && bulkMethod === "EXCEL") {
      setStep(4);
    } else {
      setStep(6);
    }
  } else {
    setStep(step - 1);
  }
}
