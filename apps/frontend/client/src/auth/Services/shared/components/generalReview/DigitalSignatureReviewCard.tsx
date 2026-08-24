import React from 'react';
import { DigitalSignatureReviewCard as SharedDigitalSignatureReviewCard } from '../../../../../shared/formPreview';

interface DigitalSignatureReviewCardProps {
  signatureEntry?: { fieldId: string; fieldLabel: string; value: string } | null;
}

export function DigitalSignatureReviewCard({
  signatureEntry,
}: DigitalSignatureReviewCardProps) {
  return <SharedDigitalSignatureReviewCard signatureEntry={signatureEntry} />;
}
