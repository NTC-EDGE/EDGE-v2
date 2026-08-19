import { Alert } from "react-native";
import { NTCService } from "../../data/servicesData";
import {
  GeneralApplicantData,
  isGeneralApplicantComplete,
  isRequirementMandatory,
  isRequirementUploaded,
  ServiceRequirementItem,
  ServiceVariantInfo,
  ServiceVariantElementInfo,
} from "../hooks/useGeneralServiceWizard";
import { validateContactNumber, validateEmailAddress } from "../../../../shared/helpers/fieldValidators";
import {
  FIELD_ID_FULL_NAME,
  FIELD_ID_BIRTH_DATE,
  FIELD_ID_ADDRESS,
  FIELD_ID_CONTACT_NO,
  FIELD_ID_EMAIL,
  FIELD_ID_REGION,
  FIELD_ID_PROVINCE,
  FIELD_ID_CITY,
  FIELD_ID_BARANGAY,
  FIELD_ID_STREET,
  FIELD_ID_ZIP_CODE,
  FIELD_ID_SEX,
  FIELD_ID_CIVIL_STATUS,
  FIELD_ID_NATIONALITY,
  FIELD_ID_SIGNATURE,
} from "../../../../shared/constants/fieldIds";

interface NavigationContext {
  step: number;
  setStep: (step: number | ((p: number) => number)) => void;
  selectedRegionId: string;
  selectedOfficeId: string;
  isExamService?: boolean;
  schedules?: Array<{ id: string; scheduledDate: string; [key: string]: unknown }>;
  selectedScheduleId?: string | null;
  appMode: "SINGLE" | "BULK" | "";
  activeApplicant: GeneralApplicantData;
  applicants: GeneralApplicantData[];
  currentApplicantIndex: number;
  setCurrentApplicantIndex: (idx: number) => void;
  service: NTCService;
  variants?: ServiceVariantInfo[];
  variantElements?: ServiceVariantElementInfo[];
  variantRequirements?: Array<ServiceRequirementItem | string>;
  setIsConfirmModalOpen: (open: boolean) => void;
  onClose?: () => void;
  /** IDs of fields marked isRequired in the active dynamic form (empty when no dynamic form). */
  dynamicRequiredFieldIds?: string[];
  setFormErrors?: (errors: Record<string, string>) => void;
}

export function getRequiredDocumentKeys(service: NTCService, variantRequirements?: Array<ServiceRequirementItem | string>): string[] {
  const reqs =
    variantRequirements && variantRequirements.length > 0
      ? variantRequirements
      : service.requirements && service.requirements.length > 0
      ? service.requirements
      : [];

  return reqs
    .map((req, idx) => {
      const isMandatory = isRequirementMandatory(req);
      if (!isMandatory) return null;
      if (typeof req === "object" && req !== null && req.id) {
        return `req-${req.id}`;
      }
      return `req-${idx}`;
    })
    .filter((k): k is string => k !== null);
}

export function handleWizardNext({
  step,
  setStep,
  selectedRegionId,
  selectedOfficeId,
  isExamService = false,
  schedules = [],
  selectedScheduleId = null,
  appMode,
  activeApplicant,
  applicants,
  currentApplicantIndex,
  setCurrentApplicantIndex,
  service,
  variants,
  variantElements,
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
    if (isExamService) {
      if (schedules.length === 0) {
        Alert.alert(
          "No Available Schedule",
          "There are currently no active or open examination schedules for the selected Region/Office. Examination filing requires an open schedule date. You may switch to another Regional Office or check back soon."
        );
        return;
      }
      if (!selectedScheduleId) {
        Alert.alert(
          "Exam Schedule Required",
          "Please select an Exam Schedule date before you can proceed with the application."
        );
        return;
      }
    }
    setStep(2);
    return;
  }
  if (step === 2) {
    if (activeApplicant.applicantType === "company" && (!activeApplicant.companyName || activeApplicant.companyName.trim() === "")) {
      Alert.alert("Required Field", "Please enter the Company / Corporation Name before proceeding.");
      return;
    }

    if (variants && variants.length > 0 && (!activeApplicant.selectedVariantId || activeApplicant.selectedVariantId.trim() === "")) {
      Alert.alert("Required Selection", "Please select an Application Variant / Service Type before proceeding.");
      return;
    }

    // Require selection of service variant element if the variant has available elements
    if (variantElements && variantElements.length > 0 && (!activeApplicant.selectedElementId || activeApplicant.selectedElementId.trim() === "")) {
      Alert.alert(
        "Required Selection",
        "Please select a Station Class / Radio Element for the chosen service variant before proceeding."
      );
      return;
    }

    const currentMode = appMode || "SINGLE";
    if (!currentMode) {
      Alert.alert("Warning", "Please select an application mode.");
      return;
    }
    setStep(3);
    return;
  }
  if (step === 3) {
    const hasDynamicForm =
      dynamicRequiredFieldIds !== undefined && dynamicRequiredFieldIds.length > 0;

    const fieldErrors: Record<string, string> = {};

    if (hasDynamicForm) {
      const fieldValues = activeApplicant.formFieldValues || [];
      const filledMap = new Map<string, string>();
      fieldValues.forEach((fv) => {
        if (fv.fieldId) filledMap.set(fv.fieldId.toLowerCase().trim(), fv.value);
        if (fv.fieldLabel) filledMap.set(fv.fieldLabel.toLowerCase().trim(), fv.value);
      });

      // 1. Missing required fields check
      dynamicRequiredFieldIds.forEach((id) => {
        const idLower = (id || "").toLowerCase().trim();
        let val = filledMap.get(idLower);
        if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
          // Resolve fallback from activeApplicant properties
          if (
            (idLower === FIELD_ID_FULL_NAME.toLowerCase() || idLower === "fullname" || idLower === "name" || idLower.includes("full name")) &&
            (activeApplicant.firstName || activeApplicant.lastName)
          ) {
            val = [activeApplicant.firstName, activeApplicant.middleName, activeApplicant.lastName, activeApplicant.suffix].filter(Boolean).join(" ");
          } else if (
            (idLower === FIELD_ID_CONTACT_NO.toLowerCase() || idLower === "contactno" || idLower.includes("contact") || idLower.includes("phone") || idLower.includes("mobile")) &&
            activeApplicant.contactNo
          ) {
            val = activeApplicant.contactNo;
          } else if (
            (idLower === FIELD_ID_EMAIL.toLowerCase() || idLower === "email" || idLower.includes("email")) &&
            activeApplicant.email
          ) {
            val = activeApplicant.email;
          } else if (
            (idLower === FIELD_ID_REGION.toLowerCase() || idLower === "region") &&
            activeApplicant.region
          ) {
            val = activeApplicant.region;
          } else if (
            (idLower === FIELD_ID_PROVINCE.toLowerCase() || idLower === "province") &&
            activeApplicant.province
          ) {
            val = activeApplicant.province;
          } else if (
            (idLower === FIELD_ID_CITY.toLowerCase() || idLower === "city" || idLower.includes("municipality")) &&
            activeApplicant.city
          ) {
            val = activeApplicant.city;
          } else if (
            (idLower === FIELD_ID_BARANGAY.toLowerCase() || idLower === "barangay") &&
            activeApplicant.barangay
          ) {
            val = activeApplicant.barangay;
          } else if (
            (idLower === FIELD_ID_STREET.toLowerCase() || idLower === FIELD_ID_ADDRESS.toLowerCase() || idLower === "street" || idLower === "address" || idLower.includes("address") || idLower.includes("street")) &&
            activeApplicant.address
          ) {
            val = activeApplicant.address;
          } else if (
            (idLower === FIELD_ID_ZIP_CODE.toLowerCase() || idLower === "zipcode" || idLower.includes("zip") || idLower.includes("postal")) &&
            activeApplicant.zipCode
          ) {
            val = activeApplicant.zipCode;
          } else if (
            (idLower === FIELD_ID_BIRTH_DATE.toLowerCase() || idLower === "birthdate" || idLower.includes("birth") || idLower.includes("dob")) &&
            (activeApplicant.birthDate || activeApplicant.birthYear)
          ) {
            val = activeApplicant.birthDate || `${activeApplicant.birthMonth || "01"}/${activeApplicant.birthDay || "01"}/${activeApplicant.birthYear}`;
          } else if (
            (idLower === FIELD_ID_SEX.toLowerCase() || idLower === "sex" || idLower === "gender") &&
            activeApplicant.sex
          ) {
            val = activeApplicant.sex;
          } else if (
            (idLower === FIELD_ID_CIVIL_STATUS.toLowerCase() || idLower === "civilstatus" || idLower.includes("civil status")) &&
            activeApplicant.civilStatus
          ) {
            val = activeApplicant.civilStatus;
          } else if (
            (idLower === FIELD_ID_NATIONALITY.toLowerCase() || idLower === "nationality" || idLower.includes("citizenship")) &&
            activeApplicant.nationality
          ) {
            val = activeApplicant.nationality;
          } else if (
            idLower === FIELD_ID_SIGNATURE.toLowerCase() ||
            idLower === "signature" ||
            idLower.includes("signature")
          ) {
            val = activeApplicant.signatureUrl;
          }
        }
        const trimmed = val !== undefined && val !== null ? (typeof val === "string" ? val.trim() : String(val)) : "";
        if (trimmed === "" || trimmed === "false") {
          fieldErrors[id] = "This required field cannot be left blank.";
        }
      });

      // 2. Specific format validation for Contact Number and Email fields in dynamic form
      fieldValues.forEach((fv) => {
        const fId = (fv.fieldId || "").toLowerCase().trim();
        const fLbl = (fv.fieldLabel || "").toLowerCase().trim();
        const val = typeof fv.value === "string" ? fv.value.trim() : "";

        if (val.length > 0) {
          if (fId === FIELD_ID_CONTACT_NO.toLowerCase() || fLbl === "contact / mobile number" || fLbl === "contact number" || fLbl === "mobile number") {
            const err = validateContactNumber(val);
            if (err) fieldErrors[fv.fieldId] = err;
          } else if (fId === FIELD_ID_EMAIL.toLowerCase() || fLbl === "email address" || fLbl === "email") {
            const err = validateEmailAddress(val);
            if (err) fieldErrors[fv.fieldId] = err;
          }
        }
      });
    } else {
      if (!activeApplicant.firstName || activeApplicant.firstName.trim() === "") fieldErrors.firstName = "First Name is required.";
      if (!activeApplicant.lastName || activeApplicant.lastName.trim() === "") fieldErrors.lastName = "Last Name is required.";
      
      const emailErr = validateEmailAddress(activeApplicant.email);
      if (emailErr) fieldErrors.email = emailErr;

      const contactErr = validateContactNumber(activeApplicant.contactNo);
      if (contactErr) fieldErrors.contactNo = contactErr;
    }

    if (Object.keys(fieldErrors).length > 0) {
      setFormErrors?.(fieldErrors);
      const firstError = Object.values(fieldErrors)[0];
      Alert.alert("Validation Error", firstError || "Please fill in all required fields marked in red correctly.");
      return;
    }
    setFormErrors?.({});

    if (appMode === "BULK" && currentApplicantIndex < applicants.length - 1) {
      setCurrentApplicantIndex(currentApplicantIndex + 1);
      return;
    }
    setStep(4);
    return;
  }
  if (step === 4) {
    const effectiveRequirements: Array<ServiceRequirementItem | string> =
      variantRequirements && variantRequirements.length > 0
        ? variantRequirements
        : service.requirements && service.requirements.length > 0
        ? service.requirements
        : [];

    const mandatoryList = effectiveRequirements
      .map((req, idx) => ({ req, idx }))
      .filter(({ req }) => isRequirementMandatory(req));

    if (mandatoryList.length === 0) {
      // Automatic: No mandatory attachments required for this service/variant!
      setStep(5);
      return;
    }

    const missingMandatory = mandatoryList.filter(
      ({ req, idx }) => !isRequirementUploaded(req, idx, activeApplicant.uploads)
    );

    if (missingMandatory.length > 0) {
      const missingTitles = missingMandatory.map(({ req, idx }) => {
        if (typeof req === "string") return req.replace(/\*$/, "").trim();
        return (req.name || req.label || req.title || `Requirement #${idx + 1}`).replace(/\*$/, "").trim();
      });

      Alert.alert(
        "Mandatory Attachment(s) Required",
        `Please attach the following required document(s) before proceeding:\n\n• ${missingTitles.join("\n• ")}`
      );
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
