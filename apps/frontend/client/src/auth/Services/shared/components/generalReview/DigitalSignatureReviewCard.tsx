import React from 'react';
import { SectionCard } from './SectionCard';
import { SummaryRow } from './SummaryRow';

interface DigitalSignatureReviewCardProps {
  signatureEntry?: { fieldId: string; fieldLabel: string; value: string };
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
        label="Recorded Applicant Signature"
        value={signatureEntry.value}
      />
    </SectionCard>
  );
}
