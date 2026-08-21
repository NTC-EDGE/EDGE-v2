import React from 'react';
import { DynamicFormSectionsReview as SharedDynamicFormSectionsReview, DynamicSectionGroup } from '../../../../../shared/formPreview';

interface DynamicFormSectionsReviewProps {
  dynamicSectionsToRender: DynamicSectionGroup[];
  isExamService: boolean;
  remainingFields: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  onPreviewFile: (uri: string, label: string) => void;
}

export function DynamicFormSectionsReview(props: DynamicFormSectionsReviewProps) {
  return <SharedDynamicFormSectionsReview {...props} />;
}
