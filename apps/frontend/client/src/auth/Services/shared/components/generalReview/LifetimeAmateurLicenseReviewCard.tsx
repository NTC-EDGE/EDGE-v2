import React from 'react';
import { View } from 'react-native';
import { LifetimeAmateurLicenseData } from '../../../licenses';
import { SectionCard, SummaryRow } from '../../../../../shared/formPreview';

interface LifetimeAmateurLicenseReviewCardProps {
  isLicenseService: boolean;
  lifetime?: LifetimeAmateurLicenseData | null;
}

export function LifetimeAmateurLicenseReviewCard({
  isLicenseService,
  lifetime,
}: LifetimeAmateurLicenseReviewCardProps) {
  const hasLifetimeData =
    isLicenseService &&
    Boolean(
      lifetime &&
        (lifetime.callSign ||
          lifetime.existingClassALicenseNo ||
          lifetime.memberClubName ||
          lifetime.yearsOfAmateurService ||
          lifetime.hasProofOf15YearsService)
    );

  if (!hasLifetimeData || !lifetime) return null;

  return (
    <SectionCard icon="award" title="Lifetime Amateur License Particulars" accentColor="#0D9488">
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {lifetime.callSign ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Amateur Call Sign" value={lifetime.callSign} />
            </View>
          ) : null}
          {lifetime.existingClassALicenseNo ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Class A License No." value={lifetime.existingClassALicenseNo} />
            </View>
          ) : null}
        </View>
        {lifetime.memberClubName ? (
          <SummaryRow label="Affiliated Amateur Club" value={lifetime.memberClubName} />
        ) : null}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {lifetime.yearsOfAmateurService ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Years of Service" value={`${lifetime.yearsOfAmateurService} Years`} />
            </View>
          ) : null}
          {lifetime.hasProofOf15YearsService ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="15+ Years Continuous Holder" value="Confirmed & Verified" />
            </View>
          ) : null}
        </View>
      </View>
    </SectionCard>
  );
}
