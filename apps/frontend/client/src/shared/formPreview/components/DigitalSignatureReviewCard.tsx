import React from 'react';
import { FormFieldValue } from '../core/formPreviewTypes';
import { SectionCard } from './SectionCard';
import { SummaryRow } from './SummaryRow';

export interface DigitalSignatureReviewCardProps {
  signatureEntry?: FormFieldValue | null;
}

export function DigitalSignatureReviewCard({
  signatureEntry,
}: DigitalSignatureReviewCardProps) {
  if (!signatureEntry || !signatureEntry.value) {
    return null;
  }

  return (
    <SectionCard icon="edit-2" title="Acknowledgement & Digital Signature" accentColor="#0F2C59">
      <SummaryRow
        label={signatureEntry.fieldLabel || "Recorded Applicant Signature"}
        value={signatureEntry.value}
      />
    </SectionCard>
  );
}
