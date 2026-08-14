import { View, Text, TouchableOpacity } from "react-native";
import { Icon } from "@edge/ui";
import { ServicesState } from "../hooks/useServices";
import { CPEAccreditationWizard } from "../accreditation/customer-premises";
import { ExamFilingWizard } from "../exams/radio-operator";
import { GeneralServiceWizard } from "../shared/GeneralServiceWizard";
import { ServiceDetails } from "./ServiceDetails";
import { ServiceList } from "./ServiceList";
import { styles } from "../Services.styles";

interface DetailsColumnProps {
  servicesState: ServicesState;
}

function EmptyPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.emptyPlaceholder}>
      <View style={[styles.placeholderIllustration, { backgroundColor: "#EFF6FF", borderWidth: 2, borderColor: "rgba(15, 44, 89, 0.1)" }]}>
        <Icon name="globe" size={42} color="#0F2C59" />
        <View style={{ position: "absolute", bottom: -2, right: -2, backgroundColor: "#D97706", borderRadius: 12, padding: 4 }}>
          <Icon
            name="mouse-pointer"
            size={14}
            color="#FFFFFF"
          />
        </View>
      </View>
      <Text style={[styles.placeholderTitleText, { color: "#0F2C59" }]}>{title}</Text>
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
    handleBackToCategories,
    handleClearSearch,
    searchQuery,
    searchResults,
    confirmSwitchService,
  } = servicesState;

  const isWizardActive = activeWizardService !== null;

  const handleClose = () => {
    setActiveWizardService(null);
    setIsDetailsExpanded(false);
    resetWizardState();
  };

  const handleSuccess = () => {
    setActiveWizardService(null);
    setIsDetailsExpanded(false);
    setSelectedService(null);
    resetWizardState();
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
            onClose={handleClose}
            onSuccess={handleSuccess}
            isDetailsExpanded={isDetailsExpanded}
            onToggleExpand={() => setIsDetailsExpanded((prev) => !prev)}
            step={wizardStep}
            setStep={setWizardStep}
            selectedRegionId={selectedRegionId}
            setSelectedRegionId={setSelectedRegionId}
            selectedOfficeId={selectedOfficeId}
            setSelectedOfficeId={setSelectedOfficeId}
            appMode={appMode}
            setAppMode={setAppMode}
            bulkMethod={bulkMethod}
            setBulkMethod={setBulkMethod}
            isFileUploaded={isFileUploaded}
            setIsFileUploaded={setIsFileUploaded}
            uploadedFileName={uploadedFileName}
            setUploadedFileName={setUploadedFileName}
            applicants={applicants}
            setApplicants={setApplicants}
            currentApplicantIndex={currentApplicantIndex}
            setCurrentApplicantIndex={setCurrentApplicantIndex}
            serviceId={selectedService?.id}
          />
        ) : activeWizardService === "radio-operator-exam" ? (
          <ExamFilingWizard
            onClose={handleClose}
            onSuccess={handleSuccess}
            isDetailsExpanded={isDetailsExpanded}
            onToggleExpand={() => setIsDetailsExpanded((prev) => !prev)}
            step={examWizardStep}
            setStep={setExamWizardStep}
            selectedRegionId={selectedRegionId}
            setSelectedRegionId={setSelectedRegionId}
            selectedOfficeId={selectedOfficeId}
            setSelectedOfficeId={setSelectedOfficeId}
            appMode={appMode}
            setAppMode={setAppMode}
            bulkMethod={bulkMethod}
            setBulkMethod={setBulkMethod}
            isFileUploaded={isFileUploaded}
            setIsFileUploaded={setIsFileUploaded}
            uploadedFileName={uploadedFileName}
            setUploadedFileName={setUploadedFileName}
            applicants={examApplicants}
            setApplicants={setExamApplicants}
            currentApplicantIndex={currentExamApplicantIndex}
            setCurrentApplicantIndex={setCurrentExamApplicantIndex}
            isBulkSubmitOpen={isBulkSubmitOpen}
            setIsBulkSubmitOpen={setIsBulkSubmitOpen}
            serviceId={selectedService?.id}
            serviceName={selectedService?.title}
          />
        ) : activeWizardService === "general-service" &&
          selectedService !== null ? (
          <GeneralServiceWizard
            service={selectedService}
            onClose={handleClose}
            onSuccess={handleSuccess}
            isDetailsExpanded={isDetailsExpanded}
            onToggleExpand={() => setIsDetailsExpanded((prev) => !prev)}
            step={wizardStep}
            setStep={setWizardStep}
            selectedRegionId={selectedRegionId}
            setSelectedRegionId={setSelectedRegionId}
            selectedOfficeId={selectedOfficeId}
            setSelectedOfficeId={setSelectedOfficeId}
            appMode={appMode}
            setAppMode={setAppMode}
            applicants={generalApplicants}
            setApplicants={setGeneralApplicants}
            currentApplicantIndex={currentGeneralApplicantIndex}
            setCurrentApplicantIndex={setCurrentGeneralApplicantIndex}
            triggerOpenApplicant={servicesState.triggerOpenApplicant}
            triggerBulkSubmit={servicesState.triggerBulkSubmit}
          />
        ) : selectedService !== null ? (
          <ServiceDetails
            selectedService={selectedService}
            onBackToServices={handleBackToServices}
            onApplyPress={() => {
              setActiveWizardService("general-service");
            }}
            isMobile={isMobile}
          />
        ) : searchQuery.trim() !== "" ? (
          <ServiceList
            searchQuery={searchQuery}
            activeCategory={null}
            searchResults={searchResults}
            onServiceSelect={(service) => {
              confirmSwitchService(() => {
                setSelectedService(service);
              });
            }}
            onBack={() => confirmSwitchService(handleClearSearch)}
            isMobile={isMobile}
            isWizardActive={activeWizardService !== null}
          />
        ) : activeCategory !== null ? (
          <ServiceList
            searchQuery=""
            activeCategory={activeCategory}
            searchResults={null}
            onServiceSelect={(service) => {
              confirmSwitchService(() => {
                setSelectedService(service);
              });
            }}
            onBack={() => confirmSwitchService(handleBackToCategories)}
            isMobile={isMobile}
            isWizardActive={activeWizardService !== null}
          />
        ) : (
          !isMobile && (
            <EmptyPlaceholder
              title="Select a category"
              description="Choose a category from the left navigation panel to view and apply for NTC services."
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
