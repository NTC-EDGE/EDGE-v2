import React from 'react';
import { View } from 'react-native';
import { LifetimeAmateurLicenseData } from '../../../licenses';
import { SectionCard } from './SectionCard';
import { SummaryRow } from './SummaryRow';

interface LifetimeAmateurLicenseReviewCardProps {
  isLicenseService: boolean;
  lifetime?: LifetimeAmateurLicenseData | null;
}

export function LifetimeAmateurLicenseReviewCard({
  isLicenseService,
  lifetime,
}: LifetimeAmateurLicenseReviewCardProps) {
  const hasLifetimeLicenseData =
    isLicenseService &&
    Boolean(
      lifetime &&
        (lifetime.callSign ||
          lifetime.yearsOfAmateurService ||
          lifetime.memberClubName ||
          lifetime.existingClassALicenseNo)
    );

  if (!hasLifetimeLicenseData || !lifetime) return null;

  return (
    <SectionCard icon="award" title="Lifetime Amateur License Particulars" accentColor="#7C3AED">
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {lifetime.callSign ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Call Sign" value={lifetime.callSign} />
            </View>
          ) : null}
          {lifetime.yearsOfAmateurService ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Years of Amateur Service" value={`${lifetime.yearsOfAmateurService} Years`} />
            </View>
          ) : null}
        </View>
        {lifetime.memberClubName ? <SummaryRow label="Affiliated Amateur Club" value={lifetime.memberClubName} /> : null}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {lifetime.certOfGoodStandingNo ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Cert of Good Standing No." value={lifetime.certOfGoodStandingNo} />
            </View>
          ) : null}
          {lifetime.existingClassALicenseNo ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Class A License No." value={lifetime.existingClassALicenseNo} />
            </View>
          ) : null}
        </View>
        {lifetime.licenseExpiryDate ? <SummaryRow label="Class A License Expiry" value={lifetime.licenseExpiryDate} /> : null}
        {lifetime.location ? <SummaryRow label="Station Location" value={lifetime.location} /> : null}
      </View>
    </SectionCard>
  );
}
