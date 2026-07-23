import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { COLORS, TYPOGRAPHY } from "@edge/ui";
import { NTCService } from "../data/servicesData";
import { GeneralWizardNavigation } from "./components/GeneralWizardNavigation";
import { GeneralWizardModals } from "./components/GeneralWizardModals";
import { GeneralWizardSteps } from "./components/GeneralWizardSteps";
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
  applicants: GeneralApplicantData[];
  setApplicants: React.Dispatch<React.SetStateAction<GeneralApplicantData[]>>;
  currentApplicantIndex: number;
  setCurrentApplicantIndex: (idx: number) => void;
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
  applicants,
  setApplicants,
  currentApplicantIndex,
  setCurrentApplicantIndex,
}: GeneralServiceWizardProps) {
  const { width } = useWindowDimensions();
  const isWeb = width > 768;


  const {
    activeApplicant,
    updateActiveApplicant,
    tenants,
    loadingTenants,
    offices,
    loadingOffices,
    isUploadSheetOpen,
    setIsUploadSheetOpen,
    activeUploadSlot,
    setActiveUploadSlot,
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
    handleDocumentPick,
    handleCameraLaunch,
    submitApplicationPayload,
  } = useGeneralServiceWizard({
    service,
    selectedRegionId,
    selectedOfficeId,
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
      setIsConfirmModalOpen,
    });
  };

  const handleBack = () => {
    handleWizardBack({
      step,
      setStep,
      appMode,
      currentApplicantIndex,
      setCurrentApplicantIndex,
    });
  };



  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 20, fontWeight: "700", color: COLORS.neutral[900], marginBottom: 8 }}>
          {service.title}
        </Text>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[500], marginBottom: 24 }}>
          Step {step} of 6 — {step === 1 ? "Information" : step === 2 ? "Region & Office" : step === 3 ? "Application Mode" : step === 4 ? "Filing Details" : step === 5 ? "Upload Documents" : "Review & Submit"}
        </Text>

        <GeneralWizardSteps
          step={step}
          service={service}
          selectedRegionId={selectedRegionId}
          setSelectedRegionId={setSelectedRegionId}
          selectedOfficeId={selectedOfficeId}
          setSelectedOfficeId={setSelectedOfficeId}
          tenants={tenants}
          offices={offices}
          appMode={appMode}
          setAppMode={setAppMode}
          setApplicants={setApplicants}
          setCurrentApplicantIndex={setCurrentApplicantIndex}
          activeApplicant={activeApplicant}
          updateActiveApplicant={updateActiveApplicant}
          isWeb={isWeb}

          onUploadPress={(req) => {
            setActiveUploadSlot(req);
            setIsUploadSheetOpen(true);
          }}
          onRemoveUpload={(req) => {
            const cur = { ...activeApplicant.uploads };
            delete cur[req];
            updateActiveApplicant({ uploads: cur });
          }}
        />

        <GeneralWizardNavigation
          step={step}
          onBack={handleBack}
          onNext={handleNext}
        />
      </ScrollView>

      <GeneralWizardModals
        isUploadSheetOpen={isUploadSheetOpen}
        setIsUploadSheetOpen={setIsUploadSheetOpen}
        handleDocumentPick={handleDocumentPick}
        handleCameraLaunch={handleCameraLaunch}
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
