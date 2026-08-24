import React from 'react';
import { View } from 'react-native';
import { CopyOfCertificateData } from '../../../certificates';
import { SectionCard, SummaryRow } from '../../../../../shared/formPreview';

interface CopyOfCertReviewCardProps {
  serviceTitle: string;
  copyOfCert?: CopyOfCertificateData | null;
}

export function CopyOfCertReviewCard({
  serviceTitle,
  copyOfCert,
}: CopyOfCertReviewCardProps) {
  const isCopyOfCertService = serviceTitle.toLowerCase().includes('copy of');
  if (!isCopyOfCertService || !copyOfCert) return null;

  return (
    <SectionCard icon="copy" title="Copy of Certificate / Lost Details" accentColor="#D97706">
      <View style={{ gap: 4 }}>
        {copyOfCert.copyType ? <SummaryRow label="Copy Type" value={copyOfCert.copyType} /> : null}
        {copyOfCert.targetService ? <SummaryRow label="Target Certificate / License" value={copyOfCert.targetService} /> : null}
        {copyOfCert.certificateNo ? <SummaryRow label="Certificate Number" value={copyOfCert.certificateNo} /> : null}
        {copyOfCert.numberOfCopies ? <SummaryRow label="Number of Copies" value={copyOfCert.numberOfCopies} /> : null}
      </View>
    </SectionCard>
  );
}
