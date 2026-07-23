import { Alert } from "react-native";
import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";

interface NavigationContext {
  step: number;
  setStep: (step: number | ((p: number) => number)) => void;
  selectedRegionId: string;
  selectedOfficeId: string;
  appMode: "SINGLE" | "BULK" | "";
  activeApplicant: GeneralApplicantData;
  applicants: GeneralApplicantData[];
  currentApplicantIndex: number;
  setCurrentApplicantIndex: (idx: number) => void;
  service: NTCService;
  setIsConfirmModalOpen: (open: boolean) => void;
}

export function handleWizardNext({
  step,
  setStep,
  selectedRegionId,
  selectedOfficeId,
  appMode,
  activeApplicant,
  applicants,
  currentApplicantIndex,
  setCurrentApplicantIndex,
  service,
  setIsConfirmModalOpen,
}: NavigationContext) {
  if (step === 1 && !selectedRegionId) {
    setStep(2);
    return;
  }
  if (step === 2) {
    if (!selectedRegionId || !selectedOfficeId) {
      Alert.alert("Warning", "Please select a region and field office.");
      return;
    }
    setStep(3);
    return;
  }
  if (step === 3) {
    if (!appMode) {
      Alert.alert("Warning", "Please select an application mode.");
      return;
    }
    setStep(4);
    return;
  }
  if (step === 4) {
    if (!activeApplicant.firstName || !activeApplicant.lastName || !activeApplicant.email || !activeApplicant.contactNo) {
      Alert.alert("Warning", "Please fill in all mandatory applicant details.");
      return;
    }
    if (appMode === "BULK" && currentApplicantIndex < applicants.length - 1) {
      setCurrentApplicantIndex(currentApplicantIndex + 1);
      return;
    }
    setStep(5);
    return;
  }
  if (step === 5) {
    const missingDocs = service.requirements.filter((req) => !activeApplicant.uploads[req]);
    if (missingDocs.length > 0) {
      Alert.alert("Incomplete", "Please upload all mandatory documents before proceeding.");
      return;
    }
    setStep(6);
    return;
  }
  if (step === 6) {
    setIsConfirmModalOpen(true);
  }
}

export function handleWizardBack({
  step,
  setStep,
  appMode,
  currentApplicantIndex,
  setCurrentApplicantIndex,
}: Pick<NavigationContext, "step" | "setStep" | "appMode" | "currentApplicantIndex" | "setCurrentApplicantIndex">) {
  if (step === 4) {
    if (appMode === "BULK" && currentApplicantIndex > 0) {
      setCurrentApplicantIndex(currentApplicantIndex - 1);
      return;
    }
    setStep(3);
    return;
  }
  setStep(step - 1);
}
