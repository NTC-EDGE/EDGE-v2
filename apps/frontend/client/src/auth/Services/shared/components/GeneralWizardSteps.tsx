import React from "react";
import { NTCService } from "../../data/servicesData";
import { TenantInfo, OfficeInfo, GeneralApplicantData, initialGeneralApplicant } from "../hooks/useGeneralServiceWizard";
import { GeneralInfoStep } from "./GeneralInfoStep";
import { GeneralRegionOfficeStep } from "./GeneralRegionOfficeStep";
import { GeneralFilingModeStep } from "./GeneralFilingModeStep";
import { GeneralFilingDetailsStep } from "./GeneralFilingDetailsStep";
import { GeneralDocumentUploadStep } from "./GeneralDocumentUploadStep";
import { GeneralReviewSubmitStep } from "./GeneralReviewSubmitStep";

interface GeneralWizardStepsProps {
  step: number;
  service: NTCService;
  variants?: any[];
  selectedVariantId?: string;
  onSelectVariant?: (variantId: string, variantName: string) => void;
  selectedRegionId: string;
  setSelectedRegionId: (val: string) => void;
  selectedOfficeId: string;
  setSelectedOfficeId: (val: string) => void;
  tenants: TenantInfo[];
  offices: OfficeInfo[];
  appMode: "SINGLE" | "BULK" | "";
  setAppMode: (val: "SINGLE" | "BULK" | "") => void;
  bulkMethod: "MANUAL" | "EXCEL";
  setBulkMethod: (method: "MANUAL" | "EXCEL") => void;
  isFileUploaded: boolean;
  setIsFileUploaded: (val: boolean) => void;
  uploadedFileName: string;
  setUploadedFileName: (name: string) => void;
  setApplicants: React.Dispatch<React.SetStateAction<GeneralApplicantData[]>>;
  setCurrentApplicantIndex: (idx: number) => void;
  activeApplicant: GeneralApplicantData;
  updateActiveApplicant: (fields: Partial<GeneralApplicantData>) => void;
  isWeb: boolean;
  onUploadPress: (req: string, file: { name: string; uri: string }) => void;
  onRemoveUpload: (req: string) => void;
}

export function GeneralWizardSteps({
  step,
  service,
  variants = [],
  selectedVariantId,
  onSelectVariant,
  selectedRegionId,
  setSelectedRegionId,
  selectedOfficeId,
  setSelectedOfficeId,
  tenants,
  offices,
  appMode,
  setAppMode,
  bulkMethod,
  setBulkMethod,
  isFileUploaded,
  setIsFileUploaded,
  uploadedFileName,
  setUploadedFileName,
  setApplicants,
  setCurrentApplicantIndex,
  activeApplicant,
  updateActiveApplicant,
  isWeb,
  onUploadPress,
  onRemoveUpload,
}: GeneralWizardStepsProps) {
  switch (step) {
    case 1:
      return <GeneralInfoStep service={service} />;
    case 2:
      return (
        <GeneralRegionOfficeStep
          selectedRegionId={selectedRegionId}
          setSelectedRegionId={setSelectedRegionId}
          selectedOfficeId={selectedOfficeId}
          setSelectedOfficeId={setSelectedOfficeId}
          tenants={tenants}
          offices={offices}
        />
      );
    case 3:
      return (
        <GeneralFilingModeStep
          service={service}
          variants={variants}
          selectedVariantId={selectedVariantId}
          onSelectVariant={onSelectVariant}
          appMode={appMode}
          onAppModeChange={(val) => {
            setAppMode(val);
            if (val === "SINGLE") {
              setApplicants([initialGeneralApplicant(1)]);
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
    case 4:
      return (
        <GeneralFilingDetailsStep
          service={service}
          activeApplicant={activeApplicant}
          updateActiveApplicant={updateActiveApplicant}
        />
      );
    case 5:
      return (
        <GeneralDocumentUploadStep
          service={service}
          activeApplicant={activeApplicant}
          isWeb={isWeb}
          onUploadPress={onUploadPress}
          onRemoveUpload={onRemoveUpload}
        />
      );
    case 6:
      return (
        <GeneralReviewSubmitStep
          service={service}
          tenants={tenants}
          offices={offices}
          selectedRegionId={selectedRegionId}
          selectedOfficeId={selectedOfficeId}
        />
      );
    default:
      return null;
  }
}
