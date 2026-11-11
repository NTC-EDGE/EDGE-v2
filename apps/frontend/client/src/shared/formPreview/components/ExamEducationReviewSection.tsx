import React from 'react';
import { FormFieldValue } from '../core/formPreviewTypes';
import { SectionCard } from './SectionCard';
import { SummaryRow } from './SummaryRow';

export interface ExamEducationReviewSectionProps {
  isExamService: boolean;
  examEducationFields: FormFieldValue[];
  examAssistanceFields: FormFieldValue[];
  onPreviewFile: (uri: string, label: string) => void;
  suppressEducationSection?: boolean;
}

export function ExamEducationReviewSection({
  isExamService,
  examEducationFields,
  examAssistanceFields,
  onPreviewFile,
  suppressEducationSection = false,
}: ExamEducationReviewSectionProps) {
  if (!isExamService) return null;

  return (
    <>
      {/* Educational Background & Qualifications: Only rendered if NOT already present in Primary Applicant Details */}
      {!suppressEducationSection && examEducationFields.length > 0 ? (
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

      {/* Special Accommodations & Assistance: PWD / Special Needs */}
      {examAssistanceFields.length > 0 ? (
        <SectionCard icon="heart" title="Special Accommodations & Assistance" accentColor="#7C3AED">
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
