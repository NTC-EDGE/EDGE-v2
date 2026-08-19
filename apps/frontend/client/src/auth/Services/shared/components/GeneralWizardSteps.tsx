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
  onUploadPress: (req: string, file: { name: string; uri: string }) => void;
  onRemoveUpload: (req: string) => void;
  onRequiredFieldsChange?: (requiredFieldIds: string[]) => void;
  errors?: Record<string, string>;
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
            updateActiveApplicant({
              selectedElementId: elemId,
              selectedElementTitle: elemTitle,
            });
          }}
          applicantType={activeApplicant.applicantType || "individual"}
          onApplicantTypeChange={(type) => {
            updateActiveApplicant({ applicantType: type });
            if (type === "individual" && appMode === "BULK") {
              setAppMode("SINGLE");
            }
          }}
          companyName={activeApplicant.companyName || ""}
          onCompanyNameChange={(name) => updateActiveApplicant({ companyName: name })}
          appMode={appMode}
          onAppModeChange={(val) => {
            setAppMode(val);
            if (val === "SINGLE") {
              setApplicants((prev) => [prev[0] || initialGeneralApplicant(1)]);
              setCurrentApplicantIndex(0);
            }
          }}
          bulkMethod={bulkMethod}
          setBulkMethod={setBulkMethod}
          isFileUploaded={isFileUploaded}
          setIsFileUploaded={setIsFileUploaded}
          uploadedFileName={uploadedFileName}
          setUploadedFileName={setUploadedFileName}
          onApplicantsImported={(newApps) => {
            setApplicants(newApps);
            setCurrentApplicantIndex(0);
          }}
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
          appMode={appMode}
          variants={variants}
          schedules={schedules}
          selectedScheduleId={selectedScheduleId}
        />
      );
    default:
      return null;
  }
}
