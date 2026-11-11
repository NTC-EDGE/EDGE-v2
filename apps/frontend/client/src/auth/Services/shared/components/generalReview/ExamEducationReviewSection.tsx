import React from 'react';
import { ExamEducationReviewSection as SharedExamEducationReviewSection } from '../../../../../shared/formPreview';

interface ExamEducationReviewSectionProps {
  isExamService: boolean;
  examEducationFields: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  examAssistanceFields: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  onPreviewFile: (uri: string, label: string) => void;
  suppressEducationSection?: boolean;
}

export function ExamEducationReviewSection(props: ExamEducationReviewSectionProps) {
  return <SharedExamEducationReviewSection {...props} />;
}
