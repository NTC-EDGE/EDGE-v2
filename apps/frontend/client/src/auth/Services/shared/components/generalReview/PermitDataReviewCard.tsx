import React from 'react';
import { View } from 'react-native';
import { AmateurPermitData } from '../../../permits';
import { SectionCard, SummaryRow } from '../../../../../shared/formPreview';

interface PermitDataReviewCardProps {
  isPermitService: boolean;
  permitData?: AmateurPermitData | null;
}

export function PermitDataReviewCard({
  isPermitService,
  permitData,
}: PermitDataReviewCardProps) {
  const hasPermitData =
    isPermitService &&
    Boolean(
      permitData &&
        (permitData.applicationType ||
          permitData.callSign ||
          permitData.applicant)
    );

  if (!hasPermitData || !permitData) return null;

  return (
    <SectionCard icon="file-text" title="Permit Application Particulars" accentColor="#4F46E5">
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {permitData.applicationType ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Application Type" value={permitData.applicationType} />
            </View>
          ) : null}
          {permitData.callSign ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Call Sign" value={permitData.callSign} />
            </View>
          ) : null}
        </View>
        {permitData.applicant ? <SummaryRow label="Applicant Name" value={permitData.applicant} /> : null}
      </View>
    </SectionCard>
  );
}
