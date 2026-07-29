import { View } from "react-native";
import { ServicesState } from "../hooks/useServices";
import { ServiceList } from "./ServiceList";
import { CategoryGrid } from "./CategoryGrid";
import { BulkApplicantsPanel } from "../accreditation/customer-premises";
import { ExamBulkApplicantsPanel } from "../exams/radio-operator";
import { GeneralBulkApplicantsPanel } from "../shared/GeneralBulkApplicantsPanel";
import { styles } from "../Services.styles";

interface ContentColumnProps {
  servicesState: ServicesState;
}

export function ContentColumn({ servicesState }: ContentColumnProps) {
  const {
    activeWizardService,
    appMode,
    wizardStep,
    applicants,
    currentApplicantIndex,
    setCurrentApplicantIndex,
    setWizardStep,
    resetWizardState,
    handleRemoveApplicant,
    examWizardStep,
    examApplicants,
    currentExamApplicantIndex,
    setCurrentExamApplicantIndex,
    setExamWizardStep,
    confirmSwitchService,
    setActiveWizardService,
    setSelectedService,
    handleRemoveExamApplicant,
    bulkMethod,
    handleAddExamApplicant,
    generalApplicants,
    currentGeneralApplicantIndex,
    setCurrentGeneralApplicantIndex,
    handleRemoveGeneralApplicant,
    handleAddGeneralApplicant,
    selectedService,
    searchQuery,
    searchResults,
    isMobile,
    setSelectedCategoryId,
    selectedCategoryId,
    activeCategory,
    handleClearSearch,
    handleBackToCategories,
    userProfile,
    setSearchQuery,
    drafts,
    setViewingDraftsCategory,
    isLeftColumnHiddenOnMobile,
    backendCategories,
    setServiceId,
    allBackendServices,
  } = servicesState;

  return (
    <View
      style={[
        styles.contentColumn,
        isLeftColumnHiddenOnMobile && styles.hiddenColumn,
      ]}
    >
      {activeWizardService === "cpe-accreditation" &&
      appMode === "BULK" &&
      wizardStep >= 4 ? (
        <BulkApplicantsPanel
          applicants={applicants}
          currentApplicantIndex={currentApplicantIndex}
          onSelectApplicant={setCurrentApplicantIndex}
          setStep={setWizardStep}
          resetWizardState={resetWizardState}
          onRemoveApplicant={handleRemoveApplicant}
        />
      ) : activeWizardService === "radio-operator-exam" &&
        appMode === "BULK" &&
        examWizardStep >= 3 ? (
        <ExamBulkApplicantsPanel
          applicants={examApplicants}
          currentApplicantIndex={currentExamApplicantIndex}
          onSelectApplicant={setCurrentExamApplicantIndex}
          setStep={setExamWizardStep}
          resetWizardState={resetWizardState}
          onCancel={() => {
            confirmSwitchService(() => {
              setActiveWizardService(null);
              setSelectedService(null);
              resetWizardState();
            });
          }}
          onRemoveApplicant={handleRemoveExamApplicant}
          bulkMethod={bulkMethod}
          onAddApplicant={handleAddExamApplicant}
        />
      ) : activeWizardService === "general-service" &&
        appMode === "BULK" &&
        wizardStep >= 4 &&
        selectedService !== null ? (
        <GeneralBulkApplicantsPanel
          applicants={generalApplicants}
          currentApplicantIndex={currentGeneralApplicantIndex}
          onSelectApplicant={setCurrentGeneralApplicantIndex}
          setStep={setWizardStep}
          resetWizardState={resetWizardState}
          onCancel={() => {
            confirmSwitchService(() => {
              setActiveWizardService(null);
              setSelectedService(null);
              resetWizardState();
            });
          }}
          onRemoveApplicant={handleRemoveGeneralApplicant}
          onAddApplicant={handleAddGeneralApplicant}
          service={selectedService}
        />
      ) : searchQuery.trim() !== "" ? (
        <ServiceList
          searchQuery={searchQuery}
          activeCategory={null}
          searchResults={searchResults}
          onServiceSelect={(service) => {
            confirmSwitchService(() => {
              setSelectedService(service);
              if (isMobile) {
                setSelectedCategoryId("search-active");
              }
            });
          }}
          onBack={handleClearSearch}
          isMobile={isMobile}
        />
      ) : selectedCategoryId !== null ? (
        <ServiceList
          searchQuery=""
          activeCategory={activeCategory}
          searchResults={null}
          onServiceSelect={(service) => {
            confirmSwitchService(() => {
              setSelectedService(service);
            });
          }}
          onBack={handleBackToCategories}
          isMobile={isMobile}
        />
      ) : (
        <CategoryGrid
          user={userProfile}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={(catId) => {
            confirmSwitchService(() => {
              setSelectedCategoryId(catId);
              if (backendCategories) {
                const matched = backendCategories.find((c: any) => {
                  const code = c.code?.toUpperCase();
                  if (catId === "exams" && code === "EXAM") return true;
                  if (catId === "certificates" && code === "CERT") return true;
                  if (catId === "licenses" && code === "LIC") return true;
                  if (catId === "permits" && code === "PRM") return true;
                  if (catId === "accreditations" && code === "ACCR") return true;
                  if (catId === "complaints" && (code === "REQ" || c.type === "RequestsAndComplaints")) return true;
                  return false;
                });
                if (matched) {
                  setServiceId(matched.id);
                } else {
                  setServiceId(null);
                }
              } else {
                setServiceId(null);
              }
            });
          }}
          drafts={drafts}
          onViewDrafts={setViewingDraftsCategory}
          backendCategories={backendCategories}
          allBackendServices={allBackendServices}
        />
      )}
    </View>
  );
}
