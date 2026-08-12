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
}

export function GeneralServiceWizard({
  service,
  onClose,
  onSuccess,
  isDetailsExpanded,
  onToggleExpand,
  step,
  setStep,
  selectedRegionId,
  setSelectedRegionId,
  selectedOfficeId,
  setSelectedOfficeId,
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
}: GeneralServiceWizardProps) {
  if (!service) return null;

  const { width } = useWindowDimensions();
  const isWeb = width > 768;

  const [localBulkMethod, setLocalBulkMethod] = useState<"MANUAL" | "EXCEL">("MANUAL");
  const [localIsFileUploaded, setLocalIsFileUploaded] = useState(false);
  const [localUploadedFileName, setLocalUploadedFileName] = useState("");
  const [dynamicRequiredFieldIds, setDynamicRequiredFieldIds] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    submitApplicationPayload,
  } = useGeneralServiceWizard({
    service,
    step,
    selectedRegionId,
    setSelectedRegionId,
    selectedOfficeId,
    setSelectedOfficeId,
    applicants,
    setApplicants,
    currentApplicantIndex,
  });

  const handleNext = () => {
    handleWizardNext({
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
    });
  };

  const handleBack = () => {
    handleWizardBack({
      step,
      setStep,
      appMode,
      currentApplicantIndex,
      setCurrentApplicantIndex,
      onClose,
    });
  };

  const handleSelectVariant = (variantId: string, variantName: string) => {
    const isRenewal = variantName.toUpperCase().includes("RENEWAL");
    const isModification = variantName.toUpperCase().includes("MODIFICATION");

    let appType: "NEW" | "RENEWAL" | "MODIFICATION" = "NEW";
    if (isRenewal) appType = "RENEWAL";
    if (isModification) appType = "MODIFICATION";

    const currentAmateur = activeApplicant.amateurLicenseData;

    updateActiveApplicant({
      selectedVariantId: variantId,
      amateurLicenseData: currentAmateur
        ? { ...currentAmateur, appType }
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
          onBack={() => setStep(2)}
          onSubmitAll={() => setIsConfirmModalOpen(true)}
        />
        <GeneralWizardModals
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
          setSelectedRegionId={setSelectedRegionId}
          selectedOfficeId={selectedOfficeId}
          setSelectedOfficeId={setSelectedOfficeId}
          tenants={tenants}
          offices={offices}
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
          updateActiveApplicant={updateActiveApplicant}
          isWeb={isWeb}

          onUploadPress={(req: string, file: { name: string; uri: string }) => {
            const cur = { ...activeApplicant.uploads };
            cur[req] = file;
            updateActiveApplicant({ uploads: cur });
          }}
          onRemoveUpload={(req) => {
            const cur = { ...activeApplicant.uploads };
            delete cur[req];
            updateActiveApplicant({ uploads: cur });
          }}
          onRequiredFieldsChange={setDynamicRequiredFieldIds}
          errors={formErrors}
        />

        <GeneralWizardNavigation
          step={step}
          onBack={handleBack}
          onNext={handleNext}
        />
      </ScrollView>

      <GeneralWizardModals
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
      />
    </View>
  );
}
