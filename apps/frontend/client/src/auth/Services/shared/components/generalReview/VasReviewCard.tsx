import React from 'react';
import { View } from 'react-native';
import { VASProviderData } from '../../../certificates';
import { SectionCard } from './SectionCard';
import { SummaryRow } from './SummaryRow';

interface VasReviewCardProps {
  isCertificateService: boolean;
  serviceTitle: string;
  vasData?: VASProviderData | null;
}

export function VasReviewCard({
  isCertificateService,
  serviceTitle,
  vasData,
}: VasReviewCardProps) {
  const serviceTitleLower = serviceTitle.toLowerCase();
  const hasVasData =
    isCertificateService &&
    serviceTitleLower.includes('vas') &&
    Boolean(
      vasData &&
        (vasData.certificateNumber ||
          vasData.serviceNo ||
          vasData.otherTradeName ||
          (vasData.valueAddedServices && vasData.valueAddedServices.length > 0))
    );

  if (!hasVasData || !vasData) return null;

  return (
    <SectionCard icon="globe" title="VAS Provider Registration Particulars" accentColor="#0284C7">
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {vasData.serviceType ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Entity Service Type" value={vasData.serviceType} />
            </View>
          ) : null}
          {vasData.years ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Validity Years" value={`${vasData.years} Year(s)`} />
            </View>
          ) : null}
        </View>
        {vasData.certificateNumber ? <SummaryRow label="VAS Certificate No." value={vasData.certificateNumber} /> : null}
        {vasData.serviceNo ? <SummaryRow label="CPCN / PA / CA Number" value={vasData.serviceNo} /> : null}
        {vasData.otherTradeName ? <SummaryRow label="Other Trade Name" value={vasData.otherTradeName} /> : null}
        {vasData.valueAddedServices && vasData.valueAddedServices.length > 0 ? (
          <SummaryRow label="Registered Value Added Services" value={vasData.valueAddedServices.join(', ')} />
        ) : null}
      </View>
    </SectionCard>
  );
}
