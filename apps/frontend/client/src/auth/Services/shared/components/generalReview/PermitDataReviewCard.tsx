import React from 'react';
import { View } from 'react-native';
import { AmateurPermitData } from '../../../permits';
import { SectionCard } from './SectionCard';
import { SummaryRow } from './SummaryRow';

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
        (permitData.callSign ||
          permitData.exactLocation ||
          permitData.serviceArea ||
          permitData.nameOfDealer ||
          permitData.authorizedSellerBuyer)
    );

  if (!hasPermitData || !permitData) return null;

  const sourceOfEquipment = [
    permitData.nameOfDealer,
    permitData.authorizedSellerBuyer,
    permitData.orInvoiceNo ? `Invoice: ${permitData.orInvoiceNo}` : null,
  ].filter(Boolean).join(' • ');

  return (
    <SectionCard icon="file-text" title="Amateur Permit Particulars" accentColor="#7C3AED">
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
        {permitData.serviceArea ? <SummaryRow label="Service Area" value={permitData.serviceArea} /> : null}
        {permitData.stationClass ? <SummaryRow label="Station Class" value={permitData.stationClass} /> : null}
        {permitData.exactLocation ? <SummaryRow label="Exact Location" value={permitData.exactLocation} /> : null}
        {sourceOfEquipment.length > 0 ? (
          <SummaryRow label="Source of Equipment" value={sourceOfEquipment} />
        ) : null}
      </View>
    </SectionCard>
  );
}
