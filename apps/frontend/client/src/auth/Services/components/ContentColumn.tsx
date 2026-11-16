import { View } from "react-native";
import { ServicesState } from "../hooks/useServices";
import { CategoryGrid } from "./CategoryGrid";
import { BulkApplicantsPanel } from "../accreditation/customer-premises";
import { ExamBulkApplicantsPanel } from "../exams/radio-operator";
import { GeneralBulkApplicantsPanel } from "../shared/GeneralBulkApplicantsPanel";
import { isServiceVariantIndividual } from "../shared/helpers/applicantDisplayHelper";
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
            const isIndiv = isServiceVariantIndividual(
              selectedService,
              undefined,
              baseApp?.selectedVariantId,
              baseApp?.selectedVariantName
            );
            const enriched = imported.map((app) => ({
              ...app,
              selectedVariantId: baseApp?.selectedVariantId || app.selectedVariantId,
              selectedVariantName: baseApp?.selectedVariantName || app.selectedVariantName,
              selectedElementId: baseApp?.selectedElementId || app.selectedElementId,
              selectedElementTitle: baseApp?.selectedElementTitle || app.selectedElementTitle,
              applicantType: isIndiv ? "individual" : (app.applicantType || "company"),
              representativeName: baseApp?.representativeName || app.representativeName,
              representativePosition: baseApp?.representativePosition || app.representativePosition,
              representativeFirstName: baseApp?.representativeFirstName || app.representativeFirstName,
              representativeMiddleName: baseApp?.representativeMiddleName || app.representativeMiddleName,
              representativeLastName: baseApp?.representativeLastName || app.representativeLastName,
              representativeSuffix: baseApp?.representativeSuffix || app.representativeSuffix,
              representativeEmail: baseApp?.representativeEmail || app.representativeEmail,
              representativeContactNumber: baseApp?.representativeContactNumber || app.representativeContactNumber,
              companyName: isIndiv ? (baseApp?.companyName || "") : (app.companyName || baseApp?.companyName),
              dtiSecRegistration: isIndiv ? (baseApp?.dtiSecRegistration || "") : (app.dtiSecRegistration || baseApp?.dtiSecRegistration),
              companyAddress: baseApp?.companyAddress || app.companyAddress,
              companyRegion: baseApp?.companyRegion || app.companyRegion,
              companyProvince: baseApp?.companyProvince || app.companyProvince,
              companyCity: baseApp?.companyCity || app.companyCity,
              companyBarangay: baseApp?.companyBarangay || app.companyBarangay,
              companyStreet: baseApp?.companyStreet || app.companyStreet,
              companyZipCode: baseApp?.companyZipCode || app.companyZipCode,
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
