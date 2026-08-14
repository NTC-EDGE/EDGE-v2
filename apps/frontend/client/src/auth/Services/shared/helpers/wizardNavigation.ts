import { Alert } from "react-native";
import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData, isGeneralApplicantComplete } from "../hooks/useGeneralServiceWizard";

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
  variantRequirements?: string[];
  setIsConfirmModalOpen: (open: boolean) => void;
  onClose?: () => void;
  /** IDs of fields marked isRequired in the active dynamic form (empty when no dynamic form). */
  dynamicRequiredFieldIds?: string[];
  setFormErrors?: (errors: Record<string, string>) => void;
}

export function getRequiredDocumentKeys(service: NTCService, variantRequirements?: string[]): string[] {
  if (variantRequirements && variantRequirements.length > 0) {
    return variantRequirements.map((_, idx) => `req-${idx}`);
  }
  return (service.requirements || []).map((_, idx) => `req-gen-${idx}`);
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
  variantRequirements,
  setIsConfirmModalOpen,
  dynamicRequiredFieldIds,
  setFormErrors,
}: NavigationContext) {
  if (step === 1) {
    if (!selectedRegionId || !selectedOfficeId) {
      Alert.alert("Warning", "Please select a region and field office.");
      return;
    }
    setStep(2);
    return;
  }
  if (step === 2) {
    if (!appMode) {
      Alert.alert("Warning", "Please select an application mode.");
      return;
    }
    setStep(3);
    return;
  }
  if (step === 3) {
    const hasDynamicForm =
      dynamicRequiredFieldIds !== undefined && dynamicRequiredFieldIds.length > 0;

    if (hasDynamicForm) {
      const fieldValues = activeApplicant.formFieldValues || [];
      const filledMap = new Map(fieldValues.map((fv) => [fv.fieldId, fv.value]));

      const missingFields = dynamicRequiredFieldIds.filter((id) => {
        const val = filledMap.get(id);
        if (val === undefined || val === null) return true;
        const trimmed = typeof val === "string" ? val.trim() : String(val);
        return trimmed === "" || trimmed === "false";
      });

      if (missingFields.length > 0) {
        const fieldErrors: Record<string, string> = {};
        missingFields.forEach((fieldId) => {
          fieldErrors[fieldId] = "This required field cannot be left blank.";
        });
        setFormErrors?.(fieldErrors);
        Alert.alert("Incomplete", "Please fill in all required fields marked in red before proceeding.");
        return;
      }
      setFormErrors?.({});
    } else {
      const fieldErrors: Record<string, string> = {};
      if (!activeApplicant.firstName) fieldErrors.firstName = "First Name is required.";
      if (!activeApplicant.lastName) fieldErrors.lastName = "Last Name is required.";
      if (!activeApplicant.email) fieldErrors.email = "Email Address is required.";
      if (!activeApplicant.contactNo) fieldErrors.contactNo = "Contact Number is required.";

      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors?.(fieldErrors);
        Alert.alert("Warning", "Please fill in all mandatory applicant details marked in red.");
        return;
      }
      setFormErrors?.({});
    }

    if (appMode === "BULK" && currentApplicantIndex < applicants.length - 1) {
      setCurrentApplicantIndex(currentApplicantIndex + 1);
      return;
    }
    setStep(4);
    return;
  }
  if (step === 4) {
    const requiredKeys = getRequiredDocumentKeys(service, variantRequirements);
    const isComplete = requiredKeys.every((key, idx) => {
      if (activeApplicant.uploads && activeApplicant.uploads[key]) return true;
      const title = service.requirements?.[idx];
      if (title && activeApplicant.uploads && activeApplicant.uploads[title]) return true;
      return false;
    });

    const uploadedCount = Object.keys(activeApplicant.uploads || {}).length;
    if (!isComplete && uploadedCount < requiredKeys.length) {
      Alert.alert("Incomplete", "Please upload all mandatory documents before proceeding.");
      return;
    }
    setStep(5);
    return;
  }
  if (step === 5) {
    const isApplicantComplete = isGeneralApplicantComplete(activeApplicant, service, variantRequirements);
    if (!isApplicantComplete) {
      Alert.alert("Incomplete Application", "Please complete all required fields and document uploads before submitting.");
      return;
    }
    setIsConfirmModalOpen(true);
  }
}

export function handleWizardBack({
  step,
  setStep,
  appMode,
  currentApplicantIndex,
  setCurrentApplicantIndex,
  onClose,
}: Pick<NavigationContext, "step" | "setStep" | "appMode" | "currentApplicantIndex" | "setCurrentApplicantIndex" | "onClose">) {
  if (step === 1) {
    onClose?.();
    return;
  }
  if (step === 3) {
    if (appMode === "BULK" && currentApplicantIndex > 0) {
      setCurrentApplicantIndex(currentApplicantIndex - 1);
      return;
    }
    setStep(2);
    return;
  }
  setStep(step - 1);
}
