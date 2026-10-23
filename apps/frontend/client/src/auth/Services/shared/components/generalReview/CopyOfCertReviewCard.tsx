import React from 'react';
import { View } from 'react-native';
import { CopyOfCertificateData } from '../../../certificates';
import { SectionCard, SummaryRow } from '../../../../../shared/formPreview';

interface CopyOfCertReviewCardProps {
  serviceTitle?: string | null;
  copyOfCert?: CopyOfCertificateData | null;
}

export function CopyOfCertReviewCard({
  serviceTitle = '',
  copyOfCert,
}: CopyOfCertReviewCardProps) {
  const sLower = (serviceTitle || '').toLowerCase();
  const isCopyOfCertService =
    (sLower.includes('copy of cert') ||
      sLower.includes('copy of license') ||
      sLower.includes('duplicate cert') ||
      (sLower.includes('copy') && sLower.includes('cert'))) &&
    !sLower.includes('permit');

  if (!isCopyOfCertService || !copyOfCert) return null;

  return (
    <SectionCard icon="copy" title="Copy of Certificate / Lost Details" accentColor="#D97706">
      <View style={{ gap: 4 }}>
        {copyOfCert.copyType ? <SummaryRow label="Copy Type" value={copyOfCert.copyType === "CERTIFIED_TRUE_COPY" ? "Certified True Copy" : "Duplicate Copy"} /> : null}
        {copyOfCert.targetService ? <SummaryRow label="Service" value={copyOfCert.targetService} /> : null}
        {copyOfCert.targetCertificateType ? <SummaryRow label="Type" value={copyOfCert.targetCertificateType} /> : null}
        {copyOfCert.certificateNo ? <SummaryRow label="Certificate Number" value={copyOfCert.certificateNo} /> : null}
        {copyOfCert.numberOfCopies && copyOfCert.copyType !== "DUPLICATE" ? <SummaryRow label="No. of Copies" value={copyOfCert.numberOfCopies} /> : null}
      </View>
    </SectionCard>
  );
}
