import React from 'react';
import { FormFieldValue } from '../core/formPreviewTypes';
import { SectionCard } from './SectionCard';
import { SummaryRow } from './SummaryRow';

export interface ExamEducationReviewSectionProps {
  isExamService: boolean;
  examEducationFields: FormFieldValue[];
  examAssistanceFields: FormFieldValue[];
  onPreviewFile?: (uri: string, label: string) => void;
}

export function ExamEducationReviewSection({
  isExamService,
  examEducationFields,
  examAssistanceFields,
  onPreviewFile,
}: ExamEducationReviewSectionProps) {
  if (!isExamService) return null;

  return (
    <>
      {examEducationFields.length > 0 ? (
        <SectionCard icon="book-open" title="Educational Background & Qualifications" accentColor="#0284C7">
          {examEducationFields.map((fv) => (
            <SummaryRow
              key={fv.fieldId}
              label={fv.fieldLabel}
              value={fv.value}
              onPreviewFile={onPreviewFile}
            />
          ))}
        </SectionCard>
      ) : null}

      {examAssistanceFields.length > 0 ? (
        <SectionCard icon="info" title="Special Needs & Assistance Request" accentColor="#0D9488">
          {examAssistanceFields.map((fv) => (
            <SummaryRow
              key={fv.fieldId}
              label={fv.fieldLabel}
              value={fv.value}
              onPreviewFile={onPreviewFile}
            />
          ))}
        </SectionCard>
      ) : null}
    </>
  );
}
