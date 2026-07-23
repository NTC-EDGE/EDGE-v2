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
  selectedRegionId: string;
  setSelectedRegionId: (val: string) => void;
  selectedOfficeId: string;
  setSelectedOfficeId: (val: string) => void;
  tenants: TenantInfo[];
  offices: OfficeInfo[];
  appMode: "SINGLE" | "BULK" | "";
  setAppMode: (val: "SINGLE" | "BULK" | "") => void;
  setApplicants: React.Dispatch<React.SetStateAction<GeneralApplicantData[]>>;
  setCurrentApplicantIndex: (idx: number) => void;
  activeApplicant: GeneralApplicantData;
  updateActiveApplicant: (fields: Partial<GeneralApplicantData>) => void;
  isWeb: boolean;
  onUploadPress: (req: string) => void;
  onRemoveUpload: (req: string) => void;
}

export function GeneralWizardSteps({
  step,
  service,
  selectedRegionId,
  setSelectedRegionId,
  selectedOfficeId,
  setSelectedOfficeId,
  tenants,
  offices,
  appMode,
  setAppMode,
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
          appMode={appMode}
          onAppModeChange={(val) => {
            setAppMode(val);
            setApplicants([initialGeneralApplicant(1)]);
            setCurrentApplicantIndex(0);
          }}
        />
      );
    case 4:
      return (
        <GeneralFilingDetailsStep
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
