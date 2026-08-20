import React, { useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "@clerk/expo";
import { useApi } from "../../../../../shared/hooks/useApi";
import { extractApiErrorMessage } from "../../../../../shared/components/Toast";
import { ExamApplicantData, initialExamApplicant } from "../types/examTypes";
import { useExamFilingQueries } from "./useExamFilingQueries";
import { getFieldValidationError, mapApplicantsPayload } from "../helpers/examMapping";
import { isExamApplicantComplete } from "../helpers/validation";
import { uploadRequirementsAfterSubmit } from "../../../shared/helpers/requirementUploadHelper";

const isGuid = (val?: string | null): boolean => {
  if (!val || typeof val !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());
};

interface UseExamFilingWizardProps {
  serviceId?: string | null;
  serviceName?: string | null;
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
  applicants: ExamApplicantData[];
  setApplicants: React.Dispatch<React.SetStateAction<ExamApplicantData[]>>;
  currentApplicantIndex: number;
  setCurrentApplicantIndex: (idx: number) => void;
  selectedScheduleId: string | null;
  setSelectedScheduleId: (id: string | null) => void;
}

export function useExamFilingWizard({
  serviceId,
  serviceName,
  selectedRegionId,
  setSelectedRegionId,
  selectedOfficeId,
  setSelectedOfficeId,
  appMode,
  setAppMode,
  bulkMethod,
  setBulkMethod,
  isFileUploaded,
  setIsFileUploaded,
  uploadedFileName,
  setUploadedFileName,
  applicants,
  setApplicants,
  currentApplicantIndex,
  setCurrentApplicantIndex,
  selectedScheduleId,
  setSelectedScheduleId,
}: UseExamFilingWizardProps) {
  const api = useApi();
  const { getToken } = useAuth();

  // Local UI States
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<"BASIC" | "ADDRESS" | "EDUCATION" | "CONTACT" | "SIGNATURE">("BASIC");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Bulk manual submission states
  const [bulkCompanyName, setBulkCompanyName] = useState("");
  const [bulkEmail, setBulkEmail] = useState("");
  const [bulkPhone, setBulkPhone] = useState("");
  const [bulkErrors, setBulkErrors] = useState<Record<string, string>>({});
  const [bulkTouched, setBulkTouched] = useState<Record<string, boolean>>({});
  const [showToast, setShowToast] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Queries hook integration
  const queries = useExamFilingQueries({
    serviceId,
    selectedRegionId,
    setSelectedRegionId,
    selectedOfficeId,
    setSelectedOfficeId,
    applicants,
    setApplicants,
    currentApplicantIndex,
  });

  const activeApplicant = applicants[currentApplicantIndex] || initialExamApplicant(1);

  const updateActiveApplicant = (fields: Partial<ExamApplicantData>) => {
    setApplicants((prev) =>
      prev.map((app, idx) => (idx === currentApplicantIndex ? { ...app, ...fields } : app))
    );
  };

  const handleFieldChange = (field: keyof ExamApplicantData, value: string) => {
    updateActiveApplicant({ [field]: value });
    setTouched((prev) => ({ ...prev, [field]: true }));

    const errorMsg = getFieldValidationError(field, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (errorMsg) {
        next[field] = errorMsg;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const handleBulkSubmitChange = (field: "companyName" | "email" | "phone", value: string) => {
    if (field === "companyName") setBulkCompanyName(value);
    if (field === "email") setBulkEmail(value);
    if (field === "phone") setBulkPhone(value);

    setBulkTouched((prev) => ({ ...prev, [field]: true }));

    let errorMsg: string | undefined;
    if (field === "companyName" && !value) errorMsg = "Company Name is required.";
    if (field === "email") {
      if (!value) errorMsg = "Email Address is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errorMsg = "Invalid email format.";
    }
    if (field === "phone") {
      if (!value) errorMsg = "Phone Number is required.";
      else if (!/^(09|\+639)\d{9}$/.test(value) && !/^\d{10,11}$/.test(value)) errorMsg = "Invalid phone format.";
    }

    setBulkErrors((prev) => {
      const next = { ...prev };
      if (errorMsg) {
        next[field] = errorMsg;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const validateBulkSubmit = (): boolean => {
    const errs: Record<string, string> = {};
    if (!bulkCompanyName) errs.companyName = "Company Name is required.";
    if (!bulkEmail) {
      errs.email = "Email Address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bulkEmail)) {
      errs.email = "Invalid email format.";
    }
    if (!bulkPhone) {
      errs.phone = "Phone Number is required.";
    } else if (!/^(09|\+639)\d{9}$/.test(bulkPhone) && !/^\d{10,11}$/.test(bulkPhone)) {
      errs.phone = "Invalid phone format.";
    }
    setBulkErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitApplicationPayload = async (isDraft = false) => {
    if (!serviceId) {
      Alert.alert("Error", "Service identifier is missing.");
      return;
    }
    if (!isDraft) {
      const incompleteCount = applicants.filter((app) => !isExamApplicantComplete(app)).length;
      if (incompleteCount > 0) {
        throw new Error(
          `Cannot submit: ${incompleteCount} of ${applicants.length} applicant(s) are incomplete. Please complete all required personal details and document uploads before submitting.`
        );
      }
    }
    let mapped: ReturnType<typeof mapApplicantsPayload> = [];
    try {
      mapped = mapApplicantsPayload(applicants, queries.formFields, serviceName);
    } catch (serializationErr: unknown) {
      const serializationMsg =
        serializationErr instanceof Error
          ? serializationErr.message
          : "Failed to serialize exam applicant data.";
      throw new Error(`Data Serialization Error: ${serializationMsg}`);
    }

    const effectiveScheduleId =
      selectedScheduleId && isGuid(selectedScheduleId)
        ? selectedScheduleId
        : (queries.schedules && queries.schedules.length > 0 && isGuid(queries.schedules[0].id) ? queries.schedules[0].id : null);

    if (!isDraft && (!effectiveScheduleId || !isGuid(effectiveScheduleId))) {
      throw new Error(
        "Examination Schedule is required. Please select an Examination Schedule & Venue in Step 2 before submitting."
      );
    }

    const payload = {
      tenantId: selectedRegionId,
      submissionMode: (mapped.length > 1 || appMode === "BULK") ? "Bulk" : "Single",
      serviceId: serviceId,
      scheduleId: effectiveScheduleId,
      fieldOfficeId: selectedOfficeId,
      serviceVariantId: activeApplicant?.selectedVariantId || null,
      serviceVariantElementIds: activeApplicant?.selectedElementId ? [activeApplicant.selectedElementId] : [],
      isDraft: isDraft,
      applicants: mapped,
    };
    try {
      const submitRes = await api.post<unknown>(`/api/v2/tenants/${selectedRegionId}/applications`, payload);
      const resObj = typeof submitRes === "object" && submitRes !== null ? (submitRes as Record<string, unknown>) : {};
      const applicationId =
        typeof submitRes === "string" && submitRes.trim() !== ""
          ? submitRes
          : resObj.succeeded === true && typeof resObj.data === "string"
          ? resObj.data
          : typeof resObj.id === "string"
          ? resObj.id
          : null;

      if (applicationId) {
        const allApplicantsForUpload = (mapped.length > 1 || appMode === "BULK") ? applicants : [activeApplicant];
        await uploadRequirementsAfterSubmit({
          api,
          applicationId,
          tenantId: selectedRegionId,
          applicants: allApplicantsForUpload,
          getToken,
        });
      }
    } catch (err: unknown) {
      throw new Error(extractApiErrorMessage(err) || "Network request failed while submitting exam applications.");
    }
  };

  return {
    ...queries,
    activeApplicant,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    isAgreedToTerms,
    setIsAgreedToTerms,
    isSubmitting,
    setIsSubmitting,
    activeFormTab,
    setActiveFormTab,
    errors,
    setErrors,
    touched,
    setTouched,
    bulkCompanyName,
    setBulkCompanyName,
    bulkEmail,
    setBulkEmail,
    bulkPhone,
    setBulkPhone,
    bulkErrors,
    setBulkErrors,
    bulkTouched,
    setBulkTouched,
    showToast,
    setShowToast,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    updateActiveApplicant,
    handleFieldChange,
    handleBulkSubmitChange,
    validateBulkSubmit,
    submitApplicationPayload,
  };
}
