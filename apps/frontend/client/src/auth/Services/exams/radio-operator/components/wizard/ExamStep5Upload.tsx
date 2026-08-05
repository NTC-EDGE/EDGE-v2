import React from "react";
import { SharedDocumentUpload } from "../../../../../../shared/components/SharedDocumentUpload";
import { ExamApplicantData } from "../../types/examTypes";

interface ExamStep5UploadProps {
  activeApplicant: ExamApplicantData;
  updateActiveApplicant: (fields: Partial<ExamApplicantData>) => void;
  requirementsList: string[];
  handleDocumentPick: (slotKey: string, file: { name: string; uri: string }) => void;
  isWeb: boolean;
}

export function ExamStep5Upload({
  activeApplicant,
  updateActiveApplicant,
  requirementsList,
  handleDocumentPick,
  isWeb,
}: ExamStep5UploadProps) {
  return (
    <SharedDocumentUpload
      requirements={requirementsList.map((req, idx) => ({
        key: idx.toString(),
        label: req,
        required: true,
      }))}
      uploads={activeApplicant.uploads}
      onUpload={handleDocumentPick}
      onRemove={(key: string) => {
        const nextUploads = { ...activeApplicant.uploads };
        delete nextUploads[key];
        updateActiveApplicant({ uploads: nextUploads });
      }}
      isWeb={isWeb}
    />
  );
}
