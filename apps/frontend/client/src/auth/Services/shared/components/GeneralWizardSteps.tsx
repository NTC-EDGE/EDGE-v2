import React from "react";
import { NTCService } from "../../data/servicesData";
import {
  TenantInfo,
  OfficeInfo,
  GeneralApplicantData,
  ExamScheduleItem,
  initialGeneralApplicant,
  ServiceVariantInfo,
  ServiceVariantElementInfo,
  ServiceRequirementItem,
} from "../hooks/useGeneralServiceWizard";
import { GeneralRegionOfficeStep } from "./GeneralRegionOfficeStep";
import { GeneralFilingModeStep } from "./GeneralFilingModeStep";
import { GeneralFilingDetailsStep } from "./GeneralFilingDetailsStep";
import { GeneralDocumentUploadStep } from "./GeneralDocumentUploadStep";
import { GeneralReviewSubmitStep } from "./GeneralReviewSubmitStep";
import { isServiceVariantIndividual } from "../helpers/applicantDisplayHelper";
import { applyImportedApplicantsToCohort, BulkImportMode } from "../spreadsheet";

interface GeneralWizardStepsProps {
  step: number;
  service: NTCService;
  variants?: ServiceVariantInfo[];
  variantElements?: ServiceVariantElementInfo[];
  variantRequirements?: Array<ServiceRequirementItem | string>;
  selectedVariantId?: string;
  onSelectVariant?: (variantId: string, variantName: string) => void;
  selectedRegionId: string;
  setSelectedRegionId: (val: string) => void;
  selectedOfficeId: string;
  setSelectedOfficeId: (val: string) => void;
  tenants: TenantInfo[];
  offices: OfficeInfo[];
  isExamService?: boolean;
  schedules?: ExamScheduleItem[];
  loadingSchedules?: boolean;
  selectedScheduleId?: string | null;
  onSelectSchedule?: (id: string) => void;
  appMode: "SINGLE" | "BULK" | "";
  setAppMode: (val: "SINGLE" | "BULK" | "") => void;
  bulkMethod: "MANUAL" | "EXCEL";
  setBulkMethod: (method: "MANUAL" | "EXCEL") => void;
  isFileUploaded: boolean;
  setIsFileUploaded: (val: boolean) => void;
  uploadedFileName: string;
  setUploadedFileName: (name: string) => void;
  applicants?: GeneralApplicantData[];
  setApplicants: React.Dispatch<React.SetStateAction<GeneralApplicantData[]>>;
  currentApplicantIndex?: number;
  setCurrentApplicantIndex: (idx: number) => void;
  activeApplicant: GeneralApplicantData;
  updateActiveApplicant: (
    fields: Partial<GeneralApplicantData> | ((prevApp: GeneralApplicantData) => Partial<GeneralApplicantData>)
  ) => void;
  isWeb: boolean;
  onUploadPress: (req: string, file: { name: string; uri: string; type?: string; file?: File | Blob }) => void;
  onRemoveUpload: (req: string) => void;
  onRequiredFieldsChange?: (requiredFieldIds: string[], fieldLabels?: Record<string, string>) => void;
  errors?: Record<string, string>;
  filingIntent?: "Regular" | "AssessmentOnly";
  onFilingIntentChange?: (intent: "Regular" | "AssessmentOnly") => void;
}

export function GeneralWizardSteps({
  step,
  service,
  variants = [],
  variantElements = [],
  variantRequirements = [],
  selectedVariantId,
  onSelectVariant,
  selectedRegionId,
  setSelectedRegionId,
  selectedOfficeId,
  setSelectedOfficeId,
  tenants,
  offices,
  isExamService = false,
  schedules = [],
  loadingSchedules = false,
  selectedScheduleId = null,
  onSelectSchedule,
  appMode,
  setAppMode,
  bulkMethod,
  setBulkMethod,
  isFileUploaded,
  setIsFileUploaded,
  uploadedFileName,
  setUploadedFileName,
  applicants = [],
  setApplicants,
  currentApplicantIndex = 0,
  setCurrentApplicantIndex,
  activeApplicant,
  updateActiveApplicant,
  isWeb,
  onUploadPress,
  onRemoveUpload,
  onRequiredFieldsChange,
  errors = {},
  filingIntent = "Regular",
  onFilingIntentChange,
}: GeneralWizardStepsProps) {
  switch (step) {
    case 1:
      return (
        <GeneralRegionOfficeStep
          selectedRegionId={selectedRegionId}
          setSelectedRegionId={setSelectedRegionId}
          selectedOfficeId={selectedOfficeId}
          setSelectedOfficeId={setSelectedOfficeId}
          tenants={tenants}
          offices={offices}
          isExamService={isExamService}
          schedules={schedules}
          loadingSchedules={loadingSchedules}
          selectedScheduleId={selectedScheduleId}
          onSelectSchedule={onSelectSchedule}
          errors={errors}
          filingIntent={filingIntent}
          onFilingIntentChange={onFilingIntentChange}
          service={service}
        />
      );
    case 2:
      return (
        <GeneralFilingModeStep
          service={service}
          variants={variants}
          variantElements={variantElements}
          variantRequirements={variantRequirements}
          selectedVariantId={selectedVariantId}
          onSelectVariant={onSelectVariant}
          selectedElementId={activeApplicant.selectedElementId}
          onSelectElement={(elemId, elemTitle) => {
            setApplicants((prev) =>
              prev.map((app) => ({
                ...app,
                selectedElementId: elemId,
                selectedElementTitle: elemTitle,
                element: elemTitle,
                elements: elemTitle,
                selectedOption: elemTitle,
              }))
            );
          }}
          applicantType={appMode === "BULK" ? "company" : (activeApplicant.applicantType || "individual")}
          onApplicantTypeChange={(type) => {
            setApplicants((prev) =>
              prev.map((app) => {
                if (type === "company") {
                  const repFirst = app.representativeFirstName || app.firstName || "";
                  const repMiddle = app.representativeMiddleName || app.middleName || "";
                  const repLast = app.representativeLastName || app.lastName || "";
                  const repSuffix = app.representativeSuffix || app.suffix || "";
                  const rep = app.representativeName || [repFirst, repMiddle, repLast, repSuffix].filter(Boolean).join(" ");
                  return {
                    ...app,
                    applicantType: type,
                    representativeFirstName: repFirst,
                    representativeMiddleName: repMiddle,
                    representativeLastName: repLast,
                    representativeSuffix: repSuffix,
                    representativeName: rep,
                    firstName: "",
                    middleName: "",
                    lastName: "",
                    suffix: "",
                  };
                } else {
                  const nameParts = (app.representativeName || "").trim().split(/\s+/);
                  return {
                    ...app,
                    applicantType: type,
                    firstName: app.firstName || app.representativeFirstName || nameParts[0] || "",
                    middleName: app.middleName || app.representativeMiddleName || "",
                    lastName: app.lastName || app.representativeLastName || nameParts.slice(1).join(" ") || "",
                    suffix: app.suffix || app.representativeSuffix || "",
                  };
                }
              })
            );
          }}
          companyName={activeApplicant.companyName || ""}
          onCompanyNameChange={(name: string) => {
            updateActiveApplicant({ companyName: name });
          }}
          dtiSecRegistration={activeApplicant.dtiSecRegistration || ""}
          onDtiSecRegistrationChange={(val: string) => {
            updateActiveApplicant({ dtiSecRegistration: val });
          }}
          representativeName={activeApplicant.representativeName || ""}
          onRepresentativeNameChange={(val: string) => {
            updateActiveApplicant({ representativeName: val });
          }}
          representativePosition={activeApplicant.representativePosition || ""}
          onRepresentativePositionChange={(val: string) => {
            updateActiveApplicant({ representativePosition: val });
          }}
          companyContactNo={activeApplicant.contactNo || ""}
          onCompanyContactNoChange={(val: string) => {
            updateActiveApplicant({ contactNo: val });
          }}
          activeApplicant={activeApplicant}
          updateActiveApplicant={(fields) => {
            if (typeof fields === "function") {
              updateActiveApplicant(fields);
            } else {
              setApplicants((prev) =>
                prev.map((app) => ({
                  ...app,
                  ...fields,
                }))
              );
            }
          }}
          appMode={appMode}
          onAppModeChange={(val: "SINGLE" | "BULK") => {
            setAppMode(val);
            if (val === "SINGLE") {
              setApplicants((prev) => [prev[0] || initialGeneralApplicant(1)]);
              setCurrentApplicantIndex(0);
            } else if (val === "BULK") {
              const isIndiv = isServiceVariantIndividual(
                service,
                variants,
                activeApplicant.selectedVariantId,
                activeApplicant.selectedVariantName
              );
              setApplicants((prev) => {
                const base = prev[0] || initialGeneralApplicant(1);
                return [
                  {
                    ...initialGeneralApplicant(1),
                    selectedVariantId: base.selectedVariantId,
                    selectedVariantName: base.selectedVariantName,
                    selectedElementId: base.selectedElementId,
                    selectedElementTitle: base.selectedElementTitle,
                    element: base.element,
                    elements: base.elements,
                    selectedOption: base.selectedOption,
                    applicantType: isIndiv ? "individual" : "company",
                    representativeFirstName: base.representativeFirstName,
                    representativeMiddleName: base.representativeMiddleName,
                    representativeLastName: base.representativeLastName,
                    representativeSuffix: base.representativeSuffix,
                    representativeName: base.representativeName,
                    representativePosition: base.representativePosition,
                    representativeEmail: base.representativeEmail,
                    representativeContactNumber: base.representativeContactNumber,
                    companyName: isIndiv ? (base.companyName || "") : "",
                    dtiSecRegistration: isIndiv ? (base.dtiSecRegistration || "") : "",
                    companyAddress: isIndiv ? (base.companyAddress || "") : "",
                    companyRegion: isIndiv ? (base.companyRegion || "") : "",
                    companyProvince: isIndiv ? (base.companyProvince || "") : "",
                    companyCity: isIndiv ? (base.companyCity || "") : "",
                    companyBarangay: isIndiv ? (base.companyBarangay || "") : "",
                    companyStreet: isIndiv ? (base.companyStreet || "") : "",
                    companyZipCode: isIndiv ? (base.companyZipCode || "") : "",
                  },
                ];
              });
              setCurrentApplicantIndex(0);
            }
          }}
          bulkMethod={bulkMethod}
          setBulkMethod={setBulkMethod}
          isFileUploaded={isFileUploaded}
          setIsFileUploaded={setIsFileUploaded}
          uploadedFileName={uploadedFileName}
          setUploadedFileName={setUploadedFileName}
          applicants={applicants}
          onApplicantsImported={(newApps, mode: BulkImportMode = "REPLACE") => {
            const isIndiv = isServiceVariantIndividual(
              service,
              variants,
              activeApplicant.selectedVariantId,
              activeApplicant.selectedVariantName
            );
            const enriched = newApps.map((app) => ({
              ...app,
              selectedVariantId: activeApplicant.selectedVariantId || app.selectedVariantId,
              selectedVariantName: activeApplicant.selectedVariantName || app.selectedVariantName,
              selectedElementId: activeApplicant.selectedElementId || app.selectedElementId,
              selectedElementTitle: activeApplicant.selectedElementTitle || app.selectedElementTitle,
              applicantType: isIndiv ? ("individual" as const) : (app.applicantType || ("company" as const)),
              representativeName: activeApplicant.representativeName || app.representativeName,
              representativePosition: activeApplicant.representativePosition || app.representativePosition,
              representativeFirstName: activeApplicant.representativeFirstName || app.representativeFirstName,
              representativeMiddleName: activeApplicant.representativeMiddleName || app.representativeMiddleName,
              representativeLastName: activeApplicant.representativeLastName || app.representativeLastName,
              representativeSuffix: activeApplicant.representativeSuffix || app.representativeSuffix,
              representativeEmail: activeApplicant.representativeEmail || app.representativeEmail,
              representativeContactNumber: activeApplicant.representativeContactNumber || app.representativeContactNumber,
              companyName: isIndiv ? (activeApplicant.companyName || "") : (app.companyName || activeApplicant.companyName),
              dtiSecRegistration: isIndiv ? (activeApplicant.dtiSecRegistration || "") : (app.dtiSecRegistration || activeApplicant.dtiSecRegistration),
              companyAddress: activeApplicant.companyAddress || app.companyAddress,
              companyRegion: activeApplicant.companyRegion || app.companyRegion,
              companyProvince: activeApplicant.companyProvince || app.companyProvince,
              companyCity: activeApplicant.companyCity || app.companyCity,
              companyBarangay: activeApplicant.companyBarangay || app.companyBarangay,
              companyStreet: activeApplicant.companyStreet || app.companyStreet,
              companyZipCode: activeApplicant.companyZipCode || app.companyZipCode,
            }));
            setApplicants((prev) =>
              applyImportedApplicantsToCohort(prev, enriched, mode, isIndiv)
            );
            setCurrentApplicantIndex(0);
          }}
          errors={errors}
        />
      );
    case 3:
      return (
        <GeneralFilingDetailsStep
          service={service}
          activeApplicant={activeApplicant}
          updateActiveApplicant={updateActiveApplicant}
          appMode={appMode || "SINGLE"}
          applicants={applicants}
          currentApplicantIndex={currentApplicantIndex}
          setCurrentApplicantIndex={setCurrentApplicantIndex}
          onRequiredFieldsChange={onRequiredFieldsChange}
          errors={errors}
          variants={variants}
          variantElements={variantElements}
        />
      );
    case 4:
      return (
        <GeneralDocumentUploadStep
          service={service}
          activeApplicant={activeApplicant}
          variantRequirements={variantRequirements}
          appMode={appMode}
          applicants={applicants}
          currentApplicantIndex={currentApplicantIndex}
          setCurrentApplicantIndex={setCurrentApplicantIndex}
          isWeb={isWeb}
          onUploadPress={onUploadPress}
          onRemoveUpload={onRemoveUpload}
          errors={errors}
        />
      );
    case 5:
      return (
        <GeneralReviewSubmitStep
          service={service}
          tenants={tenants}
          offices={offices}
          selectedRegionId={selectedRegionId}
          selectedOfficeId={selectedOfficeId}
          activeApplicant={activeApplicant}
          applicants={applicants}
          currentApplicantIndex={currentApplicantIndex}
          onSelectApplicant={setCurrentApplicantIndex}
          appMode={appMode}
          variants={variants}
          variantRequirements={variantRequirements}
          schedules={schedules}
          selectedScheduleId={selectedScheduleId}
          filingIntent={filingIntent}
          onFilingIntentChange={onFilingIntentChange}
        />
      );
    default:
      return null;
  }
}
