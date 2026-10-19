import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
import { NTCService } from "../data/servicesData";
import { GeneralWizardNavigation } from "./components/GeneralWizardNavigation";
import { GeneralWizardModals } from "./components/GeneralWizardModals";
import { GeneralWizardSteps } from "./components/GeneralWizardSteps";
import { GeneralBulkApplicationFlow } from "./components/GeneralBulkApplicationFlow";
import {
  useGeneralServiceWizard,
  GeneralApplicantData,
  initialGeneralApplicant,
} from "./hooks/useGeneralServiceWizard";
import { handleWizardNext, handleWizardBack } from "./helpers/wizardNavigation";

export { GeneralApplicantData, initialGeneralApplicant };

interface GeneralServiceWizardProps {
  service: NTCService;
  onClose: () => void;
  onSuccess: () => void;
  onApplyMore?: () => void;
  isDetailsExpanded: boolean;
  onToggleExpand: () => void;
  step: number;
  setStep: (step: number | ((p: number) => number)) => void;
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
  selectedOfficeId: string;
  setSelectedOfficeId: (id: string) => void;
  selectedScheduleId?: string | null;
  setSelectedScheduleId?: (id: string | null) => void;
  appMode: "SINGLE" | "BULK" | "";
  setAppMode: (mode: "SINGLE" | "BULK" | "") => void;
  bulkMethod?: "MANUAL" | "EXCEL";
  setBulkMethod?: (method: "MANUAL" | "EXCEL") => void;
  isFileUploaded?: boolean;
  setIsFileUploaded?: (val: boolean) => void;
  uploadedFileName?: string;
  setUploadedFileName?: (name: string) => void;
  applicants: GeneralApplicantData[];
  setApplicants: React.Dispatch<React.SetStateAction<GeneralApplicantData[]>>;
  currentApplicantIndex: number;
  setCurrentApplicantIndex: (idx: number) => void;
  /** Incremented each time a user selects an applicant from the left panel to open Filing Details */
  triggerOpenApplicant?: number;
  triggerBulkSubmit?: number;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
}

export function GeneralServiceWizard({
  service,
  onClose,
  onSuccess,
  onApplyMore,
  isDetailsExpanded,
  onToggleExpand,
  step,
  setStep,
  selectedRegionId,
  setSelectedRegionId,
  selectedOfficeId,
  setSelectedOfficeId,
  selectedScheduleId: propSelectedScheduleId,
  setSelectedScheduleId: propSetSelectedScheduleId,
  appMode,
  setAppMode,
  bulkMethod: propBulkMethod,
  setBulkMethod: propSetBulkMethod,
  isFileUploaded: propIsFileUploaded,
  setIsFileUploaded: propSetIsFileUploaded,
  uploadedFileName: propUploadedFileName,
  setUploadedFileName: propSetUploadedFileName,
  applicants,
  setApplicants,
  currentApplicantIndex,
  setCurrentApplicantIndex,
  triggerOpenApplicant = 0,
  triggerBulkSubmit = 0,
  onSaveDraft,
  isSavingDraft = false,
}: GeneralServiceWizardProps) {
  if (!service) return null;

  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  const [localBulkMethod, setLocalBulkMethod] = useState<"MANUAL" | "EXCEL">("MANUAL");
  const [localIsFileUploaded, setLocalIsFileUploaded] = useState(false);
  const [localUploadedFileName, setLocalUploadedFileName] = useState("");
  const [dynamicRequiredFieldIds, setDynamicRequiredFieldIds] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const clearFieldError = React.useCallback((...fieldKeys: string[]) => {
    setFormErrors((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const k of fieldKeys) {
        if (next[k]) {
          delete next[k];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, []);

  const bulkMethod = propBulkMethod !== undefined ? propBulkMethod : localBulkMethod;
  const setBulkMethod = propSetBulkMethod !== undefined ? propSetBulkMethod : setLocalBulkMethod;
  const isFileUploaded = propIsFileUploaded !== undefined ? propIsFileUploaded : localIsFileUploaded;
  const setIsFileUploaded = propSetIsFileUploaded !== undefined ? propSetIsFileUploaded : setLocalIsFileUploaded;
  const uploadedFileName = propUploadedFileName !== undefined ? propUploadedFileName : localUploadedFileName;
  const setUploadedFileName = propSetUploadedFileName !== undefined ? propSetUploadedFileName : setLocalUploadedFileName;


  const {
    activeApplicant,
    updateActiveApplicant,
    tenants,
    loadingTenants,
    offices,
    loadingOffices,
    isExamService,
    schedules,
    loadingSchedules,
    selectedScheduleId,
    setSelectedScheduleId,
    variants,
    loadingVariants,
    variantElements,
    variantRequirements,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    isAgreedToTerms,
    setIsAgreedToTerms,
    isSubmitting,
    setIsSubmitting,
    isFeedbackModalOpen,
    setIsFeedbackModalOpen,
    feedbackRating,
    setFeedbackRating,
    feedbackComment,
    setFeedbackComment,
    filingIntent,
    setFilingIntent,
    submitApplicationPayload,
    submitFeedback,
  } = useGeneralServiceWizard({
    service,
    step,
    selectedRegionId,
    setSelectedRegionId,
    selectedOfficeId,
    setSelectedOfficeId,
    selectedScheduleId: propSelectedScheduleId,
    setSelectedScheduleId: propSetSelectedScheduleId,
    appMode,
    applicants,
    setApplicants,
    currentApplicantIndex,
  });

  const prevBulkSubmitRef = React.useRef(triggerBulkSubmit);
  React.useEffect(() => {
    if (triggerBulkSubmit && triggerBulkSubmit !== prevBulkSubmitRef.current) {
      prevBulkSubmitRef.current = triggerBulkSubmit;
      setIsConfirmModalOpen(true);
    }
  }, [triggerBulkSubmit, setIsConfirmModalOpen]);

  const handleNext = () => {
    handleWizardNext({
      step,
      setStep,
      selectedRegionId,
      selectedOfficeId,
      isExamService,
      schedules,
      selectedScheduleId,
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
    });
  };

  const handleBack = () => {
    setFormErrors({});
    handleWizardBack({
      step,
      setStep,
      appMode,
      currentApplicantIndex,
      setCurrentApplicantIndex,
      onClose,
    });
  };

  const handleSelectRegion = (id: string) => {
    setSelectedRegionId(id);
    clearFieldError("selectedRegionId", "region");
  };

  const handleSelectOffice = (id: string) => {
    setSelectedOfficeId(id);
    clearFieldError("selectedOfficeId", "office");
  };

  const handleSelectSchedule = (id: string | null) => {
    setSelectedScheduleId(id);
    clearFieldError("selectedScheduleId", "schedule");
  };

  const handleUpdateActiveApplicant = (
    fields: Partial<GeneralApplicantData> | ((prev: GeneralApplicantData) => Partial<GeneralApplicantData>)
  ) => {
    updateActiveApplicant(fields);
    if (typeof fields !== "function") {
      const keysToClear: string[] = [];
      for (const [key, val] of Object.entries(fields)) {
        if (val !== undefined && val !== null && val !== "") {
          keysToClear.push(key);
        }
      }
      if (Array.isArray(fields.formFieldValues)) {
        for (const fv of fields.formFieldValues) {
          if (fv.value && fv.value.trim() !== "") {
            keysToClear.push(fv.fieldId);
          }
        }
      }
      if (keysToClear.length > 0) {
        clearFieldError(...keysToClear);
      }
    }
  };

  const handleSelectVariant = (variantId: string, variantName: string) => {
    clearFieldError("selectedVariantId", "variant");
    const isRenewal = variantName.toUpperCase().includes("RENEWAL");
    const isModification = variantName.toUpperCase().includes("MODIFICATION");

    let appType: "NEW" | "RENEWAL" | "MODIFICATION" = "NEW";
    if (isRenewal) appType = "RENEWAL";
    if (isModification) appType = "MODIFICATION";

    const currentAmateur = activeApplicant.amateurLicenseData;
    const currentRadio = activeApplicant.radioCertData;

    const varNameLower = variantName.toLowerCase();
    const varIdLower = variantId.toLowerCase();
    const isUnblocking = varNameLower.includes("unblock") || varIdLower.includes("402");
    const isBlocking = (varNameLower.includes("block") || varIdLower.includes("401")) && !isUnblocking;

    const currentFieldValues = activeApplicant.formFieldValues || [];
    let updatedFieldValues = currentFieldValues;
    if (isBlocking || isUnblocking) {
      const targetVal = isUnblocking ? "UNBLOCK GSM Handset" : "BLOCK GSM Handset";
      const filtered = currentFieldValues.filter(
        (fv) =>
          fv.fieldId !== "fd000000-0000-0000-0000-000000000307" &&
          fv.fieldId !== "action_requested" &&
          (fv.fieldLabel || "").toLowerCase() !== "action requested"
      );
      updatedFieldValues = [
        ...filtered,
        { fieldId: "fd000000-0000-0000-0000-000000000307", fieldLabel: "Action Requested", value: targetVal },
        { fieldId: "action_requested", fieldLabel: "Action Requested", value: targetVal },
      ];
    }

    updateActiveApplicant({
      selectedVariantId: variantId,
      selectedVariantName: variantName,
      selectedElementId: activeApplicant.selectedVariantId === variantId ? activeApplicant.selectedElementId : undefined,
      selectedElementTitle: activeApplicant.selectedVariantId === variantId ? activeApplicant.selectedElementTitle : undefined,
      formFieldValues: updatedFieldValues,
      amateurLicenseData: currentAmateur
        ? { ...currentAmateur, appType }
        : undefined,
      radioCertData: currentRadio
        ? { ...currentRadio, appType }
        : undefined,
    });
  };

  // When BULK mode is confirmed and user has moved past step 2, hand off to the
  // dedicated Bulk Application Flow (cohort list → per-applicant details + upload).
  if (appMode === "BULK" && step >= 3) {
    return (
      <View style={{ flex: 1 }}>
        <GeneralBulkApplicationFlow
          service={service}
          applicants={applicants}
          setApplicants={setApplicants}
          currentApplicantIndex={currentApplicantIndex}
          setCurrentApplicantIndex={setCurrentApplicantIndex}
          triggerOpenApplicant={triggerOpenApplicant}
          variantRequirements={variantRequirements}
          isWeb={isWeb}
          dynamicRequiredFieldIds={dynamicRequiredFieldIds}
          setDynamicRequiredFieldIds={setDynamicRequiredFieldIds}
          variants={variants}
          variantElements={variantElements}
          onBack={() => setStep(2)}
          onSubmitAll={() => setIsConfirmModalOpen(true)}
          onSaveDraft={onSaveDraft}
          isSavingDraft={isSavingDraft}
        />
        <GeneralWizardModals
          serviceTitle={service.title}
          isConfirmModalOpen={isConfirmModalOpen}
          setIsConfirmModalOpen={setIsConfirmModalOpen}
          isAgreedToTerms={isAgreedToTerms}
          setIsAgreedToTerms={setIsAgreedToTerms}
          submitApplicationPayload={submitApplicationPayload}
          isFeedbackModalOpen={isFeedbackModalOpen}
          setIsFeedbackModalOpen={setIsFeedbackModalOpen}
          feedbackRating={feedbackRating}
          setFeedbackRating={setFeedbackRating}
          feedbackComment={feedbackComment}
          setFeedbackComment={setFeedbackComment}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          onSuccess={onSuccess}
          onApplyMore={onApplyMore || onClose}
          onSaveDraft={onSaveDraft}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 20, fontWeight: "700", color: COLORS.neutral[900], marginBottom: 4 }}>
          {service.title}
        </Text>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[500], marginBottom: 24 }}>
          {step === 1 ? "Region & Office Selection" : "Application Variant & Filing Mode"}
        </Text>

        <GeneralWizardSteps
          step={step}
          service={service}
          variants={variants}
          variantElements={variantElements}
          variantRequirements={variantRequirements}
          selectedVariantId={activeApplicant.selectedVariantId}
          onSelectVariant={handleSelectVariant}
          selectedRegionId={selectedRegionId}
          setSelectedRegionId={handleSelectRegion}
          selectedOfficeId={selectedOfficeId}
          setSelectedOfficeId={handleSelectOffice}
          tenants={tenants}
          offices={offices}
          isExamService={isExamService}
          schedules={schedules}
          loadingSchedules={loadingSchedules}
          selectedScheduleId={selectedScheduleId}
          onSelectSchedule={handleSelectSchedule}
          appMode={appMode}
          setAppMode={setAppMode}
          bulkMethod={bulkMethod}
          setBulkMethod={setBulkMethod}
          isFileUploaded={isFileUploaded}
          setIsFileUploaded={setIsFileUploaded}
          uploadedFileName={uploadedFileName}
          setUploadedFileName={setUploadedFileName}
          setApplicants={setApplicants}
          applicants={applicants}
          currentApplicantIndex={currentApplicantIndex}
          setCurrentApplicantIndex={setCurrentApplicantIndex}
          activeApplicant={activeApplicant}
          updateActiveApplicant={handleUpdateActiveApplicant}
          isWeb={isWeb}

          onUploadPress={(req: string, file: { name: string; uri: string; type?: string; file?: File | Blob }) => {
            clearFieldError(req);
            updateActiveApplicant((prev) => ({
              uploads: { ...(prev.uploads || {}), [req]: file },
            }));
          }}
          onRemoveUpload={(req) => {
            updateActiveApplicant((prev) => {
              const cur = { ...(prev.uploads || {}) };
              delete cur[req];
              return { uploads: cur };
            });
          }}
          onRequiredFieldsChange={setDynamicRequiredFieldIds}
          errors={formErrors}
          filingIntent={filingIntent}
          onFilingIntentChange={setFilingIntent}
        />
      </ScrollView>

      {/* ── Fixed Sticky Bottom Action Bar ── */}
      <GeneralWizardNavigation
        step={step}
        totalSteps={5}
        onBack={handleBack}
        onNext={handleNext}
      />

      <GeneralWizardModals
        serviceTitle={service.title}
        isConfirmModalOpen={isConfirmModalOpen}
        setIsConfirmModalOpen={setIsConfirmModalOpen}
        isAgreedToTerms={isAgreedToTerms}
        setIsAgreedToTerms={setIsAgreedToTerms}
        submitApplicationPayload={submitApplicationPayload}
        submitFeedback={submitFeedback}
        isFeedbackModalOpen={isFeedbackModalOpen}
        setIsFeedbackModalOpen={setIsFeedbackModalOpen}
        feedbackRating={feedbackRating}
        setFeedbackRating={setFeedbackRating}
        feedbackComment={feedbackComment}
        setFeedbackComment={setFeedbackComment}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
        onSuccess={onSuccess}
        onApplyMore={onApplyMore || onClose}
        onSaveDraft={onSaveDraft}
      />
    </View>
  );
}
