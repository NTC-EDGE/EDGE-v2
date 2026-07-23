import React from "react";
import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";
import { SharedDocumentUpload } from "../../../../shared/components/SharedDocumentUpload";

interface GeneralDocumentUploadStepProps {
  service: NTCService;
  activeApplicant: GeneralApplicantData;
  isWeb: boolean;
  onUploadPress: (req: string) => void;
  onRemoveUpload: (req: string) => void;
}

export function GeneralDocumentUploadStep({
  service,
  activeApplicant,
  isWeb,
  onUploadPress,
  onRemoveUpload,
}: GeneralDocumentUploadStepProps) {
  // Map general string requirements list to DocumentRequirement format
  const mappedRequirements = service.requirements.map((req) => ({
    key: req,
    label: req,
    required: true,
  }));

  return (
    <SharedDocumentUpload
      requirements={mappedRequirements}
      uploads={activeApplicant.uploads}
      onUpload={onUploadPress}
      onRemove={onRemoveUpload}
      isWeb={isWeb}
    />
  );
}
