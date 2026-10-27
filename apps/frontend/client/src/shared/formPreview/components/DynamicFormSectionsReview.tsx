import React from 'react';
import { DynamicSectionGroup, FormFieldValue } from '../core/formPreviewTypes';
import { SectionCard } from './SectionCard';
import { SummaryRow } from './SummaryRow';

export interface DynamicFormSectionsReviewProps {
  dynamicSectionsToRender: DynamicSectionGroup[];
  isExamService: boolean;
  remainingFields: FormFieldValue[];
  onPreviewFile: (uri: string, label: string) => void;
}

export function DynamicFormSectionsReview({
  dynamicSectionsToRender,
  onPreviewFile,
}: DynamicFormSectionsReviewProps) {
  return (
    <>
      {dynamicSectionsToRender.map((sec) => (
        <SectionCard key={sec.id} icon={sec.icon} title={sec.title} accentColor={sec.accentColor}>
          {sec.fields.map((field) => (
            <SummaryRow
              key={field.fieldId || field.label}
              label={field.label}
              value={field.value}
              onPreviewFile={onPreviewFile}
            />
          ))}
        </SectionCard>
      ))}
    </>
  );
}
