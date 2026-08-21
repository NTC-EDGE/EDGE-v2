import React from 'react';
import { View } from 'react-native';
import { CopyOfCertificateData } from '../../../certificates';
import { SectionCard } from './SectionCard';
import { SummaryRow } from './SummaryRow';

interface CopyOfCertReviewCardProps {
  serviceTitle: string;
  copyOfCert?: CopyOfCertificateData | null;
}

export function CopyOfCertReviewCard({
  serviceTitle,
  copyOfCert,
}: CopyOfCertReviewCardProps) {
  const serviceTitleLower = serviceTitle.toLowerCase();
  const hasCopyOfCertData =
    (serviceTitleLower.includes('copy') || serviceTitleLower.includes('duplicate') || serviceTitleLower.includes('certified')) &&
    Boolean(
      copyOfCert &&
        (copyOfCert.certificateNo ||
          copyOfCert.targetService ||
          copyOfCert.circumstancesOfLoss)
    );

  if (!hasCopyOfCertData || !copyOfCert) return null;

  return (
    <SectionCard icon="copy" title="Copy / Duplicate Request Details" accentColor="#0284C7">
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <SummaryRow label="Copy Request Type" value={copyOfCert.copyType === 'CERTIFIED_TRUE_COPY' ? 'Certified True Copy' : 'Duplicate Replacement'} />
          </View>
          {copyOfCert.certificateNo ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Certificate No." value={copyOfCert.certificateNo} />
            </View>
          ) : null}
        </View>
        {copyOfCert.targetService ? <SummaryRow label="Target Permit / License" value={copyOfCert.targetService} /> : null}
        {copyOfCert.numberOfCopies ? <SummaryRow label="Number of Copies" value={copyOfCert.numberOfCopies} /> : null}
        {copyOfCert.circumstancesOfLoss ? <SummaryRow label="Circumstances of Loss / Affidavit Details" value={copyOfCert.circumstancesOfLoss} /> : null}
      </View>
    </SectionCard>
  );
}
