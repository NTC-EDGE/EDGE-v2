import React, { useRef } from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { Icon, COLORS } from "@edge/ui";
import { styles } from "./CPEAccreditationWizard.styles";
import { useCPEAccreditationWizard } from "../hooks/useCPEAccreditationWizard";
import { CPEWizardSteps } from "./wizard/CPEWizardSteps";
import { CPEWizardNavigation } from "./wizard/CPEWizardNavigation";
import { CPEWizardModals } from "./wizard/CPEWizardModals";
import { handleCPENext, handleCPEBack } from "../helpers/cpeWizardNavigation";
import { ApplicantData, initialApplicant, CPEAccreditationWizardProps } from "../types/cpeTypes";

const STEP_TITLES: Record<number, string> = {
  1: "Information",
  2: "Region",
  3: "Application Type & Requirements",
  4: "Filing Data Configuration",
  5: "Application Form",
  6: "Upload Requirements",
  7: "Review & Submit",
};

export function CPEAccreditationWizard({
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
}: CPEAccreditationWizardProps) {
  const scrollViewRef = useRef<ScrollView | null>(null);

  const {
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
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    csvRows,
    tenants,
    officesList,
    activeRegionObj,
    activeApplicant,
    updateActiveApplicant,
    submitApplicationPayload,
    handleMockFileUpload,
    handleConfirmCSVImport,
    handleFieldChange,
    handleDocumentPick,
    validateForm,
    errors,
    touched,
    setTouched,
  } = useCPEAccreditationWizard({
    selectedRegionId,
    setSelectedRegionId,
    setSelectedOfficeId,
    setAppMode,
    setBulkMethod,
    setIsFileUploaded,
    setUploadedFileName,
    applicants,
    setApplicants,
    currentApplicantIndex,
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onToggleExpand}>
            <Icon name={isDetailsExpanded ? "minimize" : "maximize"} size={16} color={COLORS.brand[700]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>[{STEP_TITLES[step] || "Filing Wizard"}]</Text>
        </View>
        {step < 8 && (
          <View style={styles.progressContainer}>
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <View
                key={s}
                style={[
                  styles.progressDash,
                  step === s && styles.progressDashActive,
                  step > s && styles.progressDashCompleted,
                ]}
              />
            ))}
          </View>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CPEWizardSteps
          step={step}
          selectedRegionId={selectedRegionId}
          setSelectedRegionId={setSelectedRegionId}
          selectedOfficeId={selectedOfficeId}
          setSelectedOfficeId={setSelectedOfficeId}
          tenants={tenants}
          officesList={officesList}
          appMode={appMode}
          setAppMode={setAppMode}
          activeApplicant={activeApplicant}
          updateActiveApplicant={updateActiveApplicant}
          setApplicants={setApplicants}
          setCurrentApplicantIndex={setCurrentApplicantIndex}
          initialApplicant={initialApplicant}
          bulkMethod={bulkMethod}
          setBulkMethod={setBulkMethod}
          isFileUploaded={isFileUploaded}
          handleMockFileUpload={handleMockFileUpload}
          handleFieldChange={handleFieldChange}
          errors={errors}
          touched={touched}
          handleScrollToSection={(yOffset) => {
            if (scrollViewRef.current !== null) {
              scrollViewRef.current.scrollTo({ y: yOffset, animated: true });
            }
          }}
          handleDocumentPick={handleDocumentPick}
          activeRegionObj={activeRegionObj}
          styles={styles}
        />
      </ScrollView>

      <CPEWizardNavigation
        step={step}
        onBack={() => {
          handleCPEBack({ step, setStep, appMode, bulkMethod, onClose });
        }}
        onNext={() => {
          handleCPENext({
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
            onClose,
          });
        }}
        isNextDisabled={
          step === 2 ? (!selectedRegionId || !selectedOfficeId) :
          (step === 4 && appMode === "BULK" && bulkMethod === "EXCEL") ? !isFileUploaded :
          false
        }
        styles={styles}
      />

      <CPEWizardModals
        isConfirmModalOpen={isConfirmModalOpen}
        setIsConfirmModalOpen={setIsConfirmModalOpen}
        isAgreedToTerms={isAgreedToTerms}
        setIsAgreedToTerms={setIsAgreedToTerms}
        submitApplicationPayload={submitApplicationPayload}
        setIsSubmitting={setIsSubmitting}
        isFeedbackModalOpen={isFeedbackModalOpen}
        setIsFeedbackModalOpen={setIsFeedbackModalOpen}
        feedbackRating={feedbackRating}
        setFeedbackRating={setFeedbackRating}
        feedbackComment={feedbackComment}
        setFeedbackComment={setFeedbackComment}
        setStep={setStep}
        isPreviewModalOpen={isPreviewModalOpen}
        setIsPreviewModalOpen={setIsPreviewModalOpen}
        csvRows={csvRows}
        handleConfirmCSVImport={handleConfirmCSVImport}
        isSubmitting={isSubmitting}
      />
    </View>
  );
}
