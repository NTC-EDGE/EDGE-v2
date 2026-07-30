import { View, Text, TouchableOpacity } from "react-native";
import { Icon } from "@edge/ui";
import { ServicesState } from "../hooks/useServices";
import { CPEAccreditationWizard } from "../accreditation/customer-premises";
import { RadioOperatorExamWizard } from "../exams/radio-operator";
import { GeneralServiceWizard } from "../shared/GeneralServiceWizard";
import { ServiceDetails } from "./ServiceDetails";
import { styles } from "../Services.styles";

interface DetailsColumnProps {
  servicesState: ServicesState;
}

function EmptyPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.emptyPlaceholder}>
      <View style={styles.placeholderIllustration}>
        <Icon name="file" size={48} color="#d1d5db" />
        <Icon
          name="mouse-pointer"
          size={24}
          color="#1d4ed8"
          style={styles.pointerOverlay}
        />
      </View>
      <Text style={styles.placeholderTitleText}>{title}</Text>
      <Text style={styles.placeholderSubtitleText}>{description}</Text>
    </View>
  );
}

export function DetailsColumn({ servicesState }: DetailsColumnProps) {
  const {
    activeWizardService,
    setActiveWizardService,
    setSelectedService,
    resetWizardState,
    navigation,
    isDetailsExpanded,
    setIsDetailsExpanded,
    wizardStep,
    setWizardStep,
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
    examWizardStep,
    setExamWizardStep,
    examApplicants,
    setExamApplicants,
    currentExamApplicantIndex,
    setCurrentExamApplicantIndex,
    isBulkSubmitOpen,
    setIsBulkSubmitOpen,
    selectedService,
    generalApplicants,
    setGeneralApplicants,
    currentGeneralApplicantIndex,
    setCurrentGeneralApplicantIndex,
    isMobile,
    width,
    activeCategory,
    handleBackToServices,
    serviceId,
  } = servicesState;

  const isWizardActive = activeWizardService !== null;

  const handleClose = () => {
    setActiveWizardService(null);
    setIsDetailsExpanded(false);
    setSelectedService(null);
    resetWizardState();
  };

  const handleSuccess = () => {
    handleClose();
    navigation.navigate("MyApplications");
  };

  return (
    <View
      style={[
        styles.detailsColumn,
        (isMobile || (isWizardActive && width < 1024)) &&
          styles.mobileDetailsColumn,
      ]}
    >
      <View style={{ flex: 1 }}>
        {activeWizardService === "cpe-accreditation" ? (
          <CPEAccreditationWizard
            onClose={handleClose} onSuccess={handleSuccess}
            isDetailsExpanded={isDetailsExpanded} onToggleExpand={() => setIsDetailsExpanded((prev) => !prev)}
            step={wizardStep} setStep={setWizardStep}
            selectedRegionId={selectedRegionId} setSelectedRegionId={setSelectedRegionId}
            selectedOfficeId={selectedOfficeId} setSelectedOfficeId={setSelectedOfficeId}
            appMode={appMode} setAppMode={setAppMode}
            bulkMethod={bulkMethod} setBulkMethod={setBulkMethod}
            isFileUploaded={isFileUploaded} setIsFileUploaded={setIsFileUploaded}
            uploadedFileName={uploadedFileName} setUploadedFileName={setUploadedFileName}
            applicants={applicants} setApplicants={setApplicants}
            currentApplicantIndex={currentApplicantIndex} setCurrentApplicantIndex={setCurrentApplicantIndex}
            serviceId={selectedService?.id}
          />
        ) : activeWizardService === "radio-operator-exam" ? (
          <RadioOperatorExamWizard
            onClose={handleClose} onSuccess={handleSuccess}
            isDetailsExpanded={isDetailsExpanded} onToggleExpand={() => setIsDetailsExpanded((prev) => !prev)}
            step={examWizardStep} setStep={setExamWizardStep}
            selectedRegionId={selectedRegionId} setSelectedRegionId={setSelectedRegionId}
            selectedOfficeId={selectedOfficeId} setSelectedOfficeId={setSelectedOfficeId}
            appMode={appMode} setAppMode={setAppMode}
            bulkMethod={bulkMethod} setBulkMethod={setBulkMethod}
            isFileUploaded={isFileUploaded} setIsFileUploaded={setIsFileUploaded}
            uploadedFileName={uploadedFileName} setUploadedFileName={setUploadedFileName}
            applicants={examApplicants} setApplicants={setExamApplicants}
            currentApplicantIndex={currentExamApplicantIndex} setCurrentApplicantIndex={setCurrentExamApplicantIndex}
            isBulkSubmitOpen={isBulkSubmitOpen} setIsBulkSubmitOpen={setIsBulkSubmitOpen}
            serviceId={selectedService?.id}
          />
        ) : activeWizardService === "general-service" &&
          selectedService !== null ? (
          <GeneralServiceWizard
            service={selectedService}
            onClose={handleClose} onSuccess={handleSuccess}
            isDetailsExpanded={isDetailsExpanded} onToggleExpand={() => setIsDetailsExpanded((prev) => !prev)}
            step={wizardStep} setStep={setWizardStep}
            selectedRegionId={selectedRegionId} setSelectedRegionId={setSelectedRegionId}
            selectedOfficeId={selectedOfficeId} setSelectedOfficeId={setSelectedOfficeId}
            appMode={appMode} setAppMode={setAppMode}
            applicants={generalApplicants} setApplicants={setGeneralApplicants}
            currentApplicantIndex={currentGeneralApplicantIndex} setCurrentApplicantIndex={setCurrentGeneralApplicantIndex}
          />
        ) : selectedService !== null ? (
          <ServiceDetails
            selectedService={selectedService}
            onBackToServices={handleBackToServices}
            onApplyPress={() => {
              if (selectedService.title.includes("Premises")) {
                setActiveWizardService("cpe-accreditation");
              } else if (selectedService.title.includes("Radio Operator")) {
                setActiveWizardService("radio-operator-exam");
              } else {
                setActiveWizardService("general-service");
              }
            }}
            isMobile={isMobile}
          />
        ) : activeCategory !== null ? (
          !isMobile && (
            <EmptyPlaceholder
              title="Select a service"
              description="Please choose a specific service from the list on the left to view the required documents and submit an application."
            />
          )
        ) : (
          !isMobile && (
            <EmptyPlaceholder
              title="No service selected"
              description="Choose a category on the left, then select a service to view its application details and requirements."
            />
          )
        )}
      </View>

      {!isMobile && selectedService === null && activeWizardService === null && (
        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpButtonText}>Help Center</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
