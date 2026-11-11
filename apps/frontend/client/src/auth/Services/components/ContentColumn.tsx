import { View } from "react-native";
import { ServicesState } from "../hooks/useServices";
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
    handleRemoveMultipleApplicants,
    examWizardStep,
    examApplicants,
    currentExamApplicantIndex,
    setCurrentExamApplicantIndex,
    setExamWizardStep,
    confirmSwitchService,
    setActiveWizardService,
    setSelectedService,
    handleRemoveExamApplicant,
    handleRemoveMultipleExamApplicants,
    bulkMethod,
    handleAddExamApplicant,
    generalApplicants,
    currentGeneralApplicantIndex,
    setCurrentGeneralApplicantIndex,
    handleRemoveGeneralApplicant,
    handleRemoveMultipleGeneralApplicants,
    handleAddGeneralApplicant,
    selectedService,
    searchQuery,
    setSelectedCategoryId,
    selectedCategoryId,
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
      wizardStep >= 3 ? (
        <BulkApplicantsPanel
          applicants={applicants}
          currentApplicantIndex={currentApplicantIndex}
          onSelectApplicant={setCurrentApplicantIndex}
          setStep={setWizardStep}
          resetWizardState={resetWizardState}
          onRemoveApplicant={handleRemoveApplicant}
          onRemoveApplicants={handleRemoveMultipleApplicants}
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
          onRemoveApplicants={handleRemoveMultipleExamApplicants}
          bulkMethod={bulkMethod}
          onAddApplicant={handleAddExamApplicant}
          onSubmitAll={() => {
            servicesState.setIsBulkSubmitOpen(true);
          }}
        />
      ) : activeWizardService === "general-service" &&
        appMode === "BULK" &&
        wizardStep >= 3 &&
        selectedService !== null ? (
        <GeneralBulkApplicantsPanel
          applicants={generalApplicants}
          currentApplicantIndex={currentGeneralApplicantIndex}
          onSelectApplicant={(idx) => {
            setCurrentGeneralApplicantIndex(idx);
            setWizardStep(3);
            servicesState.setTriggerOpenApplicant((prev: number) => prev + 1);
          }}
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
          onRemoveApplicants={handleRemoveMultipleGeneralApplicants}
          onAddApplicant={handleAddGeneralApplicant}
          onApplicantsImported={(imported) => {
            const baseApp = generalApplicants[0];
            const enriched = imported.map((app) => ({
              ...app,
              selectedVariantId: baseApp?.selectedVariantId || app.selectedVariantId,
              selectedVariantName: baseApp?.selectedVariantName || app.selectedVariantName,
              selectedElementId: baseApp?.selectedElementId || app.selectedElementId,
              selectedElementTitle: baseApp?.selectedElementTitle || app.selectedElementTitle,
              applicantType: baseApp?.applicantType || app.applicantType || "individual",
              ...(baseApp?.applicantType === "company"
                ? {
                    companyName: baseApp.companyName || app.companyName,
                    representativeName: baseApp.representativeName || app.representativeName,
                    representativePosition: baseApp.representativePosition || app.representativePosition,
                    representativeFirstName: baseApp.representativeFirstName || app.representativeFirstName,
                    representativeMiddleName: baseApp.representativeMiddleName || app.representativeMiddleName,
                    representativeLastName: baseApp.representativeLastName || app.representativeLastName,
                    representativeSuffix: baseApp.representativeSuffix || app.representativeSuffix,
                    dtiSecRegistration: baseApp.dtiSecRegistration || app.dtiSecRegistration,
                  }
                : {}),
            }));
            servicesState.setGeneralApplicants(enriched);
            setCurrentGeneralApplicantIndex(0);
          }}
          service={selectedService}
          variantRequirements={servicesState.variantRequirements}
          onSubmitAll={() => {
            servicesState.setTriggerBulkSubmit((prev: number) => prev + 1);
          }}
        />
      ) : (
        <CategoryGrid
          user={userProfile}
          searchQuery={searchQuery}
          onSearchQueryChange={(query) => {
            if (activeWizardService !== null) {
              confirmSwitchService(() => setSearchQuery(query));
            } else {
              setSearchQuery(query);
            }
          }}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={(catId) => {
            confirmSwitchService(() => {
              setSelectedCategoryId(catId);
              setServiceId(catId);
              setSelectedService(null);
            });
          }}
          drafts={drafts}
          onViewDrafts={setViewingDraftsCategory}
          backendCategories={backendCategories}
          allBackendServices={allBackendServices}
          isWizardActive={activeWizardService !== null}
        />
      )}
    </View>
  );
}
