import React from 'react';
import { View, Text } from 'react-native';
import { TYPOGRAPHY } from '@edge/ui';
import { AmateurRadioStationLicenseData } from '../../../licenses';
import { SectionCard, SummaryRow } from '../../../../../shared/formPreview';

interface AmateurStationLicenseReviewCardProps {
  isLicenseService: boolean;
  amateur?: AmateurRadioStationLicenseData | null;
}

export function AmateurStationLicenseReviewCard({
  isLicenseService,
  amateur,
}: AmateurStationLicenseReviewCardProps) {
  const hasAmateurLicenseData =
    isLicenseService &&
    Boolean(
      amateur &&
        (amateur.classOfStation ||
          amateur.callSign ||
          amateur.licenseNo ||
          amateur.location ||
          (amateur.particularsEquipment &&
            amateur.particularsEquipment.some((g) => g.makeTypeModel || (g.equipments && g.equipments.length > 0))))
    );

  if (!hasAmateurLicenseData || !amateur) return null;

  return (
    <SectionCard icon="radio" title="Amateur Radio Station Particulars" accentColor="#7C3AED">
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {amateur.classOfStation ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Station Class" value={amateur.classOfStation} />
            </View>
          ) : null}
          {amateur.callSign ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Call Sign" value={amateur.callSign} />
            </View>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {amateur.noOfYears ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="License Validity / Years" value={`${amateur.noOfYears} Year(s)`} />
            </View>
          ) : null}
          {amateur.licenseNo ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Existing License No." value={amateur.licenseNo} />
            </View>
          ) : null}
        </View>
        {amateur.dateOfExpiry ? <SummaryRow label="License Expiry Date" value={amateur.dateOfExpiry} /> : null}
        {amateur.modificationDueTo ? <SummaryRow label="Reason for Modification" value={amateur.modificationDueTo} /> : null}
        {amateur.location ? <SummaryRow label="Station Location / Address" value={amateur.location} /> : null}
        {amateur.placeOfExamSeminar || amateur.dateOfExamSeminar || amateur.ratings ? (
          <View style={{ backgroundColor: '#F1F5F9', padding: 10, borderRadius: 8, marginTop: 4 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 4 }}>
              EXAMINATION / SEMINAR RECORD
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: '#1E293B' }}>
              {[amateur.placeOfExamSeminar, amateur.dateOfExamSeminar, amateur.ratings ? `Rating: ${amateur.ratings}` : null]
                .filter(Boolean)
                .join(' • ')}
            </Text>
          </View>
        ) : null}
      </View>
    </SectionCard>
  );
}
