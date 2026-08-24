import React from "react";
import { SharedDocumentUpload } from "../../../../../../shared/components/SharedDocumentUpload";
import { ExamApplicantData } from "../../types/examTypes";
import { ExamRequirementItem } from "../../helpers/examMapping";

interface ExamStep5UploadProps {
  activeApplicant: ExamApplicantData;
  updateActiveApplicant: (fields: Partial<ExamApplicantData>) => void;
  requirementsList: Array<ExamRequirementItem | string>;
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
  const reqItems = requirementsList.map((req, idx) => {
    if (typeof req === "string") {
      return {
        key: `req-${idx}`,
        label: req,
        required: true,
      };
    }
    return {
      key: req.id ? `req-${req.id}` : `req-${idx}`,
      label: req.name,
      required: req.isRequired !== undefined ? req.isRequired : true,
      description: req.description,
      hint: req.hint || req.description,
    };
  });

  return (
    <SharedDocumentUpload
      requirements={reqItems}
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
