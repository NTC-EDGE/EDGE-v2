import React from 'react';
import { View, Text } from 'react-native';
import { TYPOGRAPHY } from '@edge/ui';
import { TVRORegistrationData } from '../../../certificates';
import { SectionCard, SummaryRow } from '../../../../../shared/formPreview';

interface TvroRegReviewCardProps {
  isCertificateService: boolean;
  serviceTitle: string;
  tvroReg?: TVRORegistrationData | null;
}

export function TvroRegReviewCard({
  isCertificateService,
  serviceTitle,
  tvroReg,
}: TvroRegReviewCardProps) {
  const serviceTitleLower = serviceTitle.toLowerCase();
  const hasTvroData =
    isCertificateService &&
    serviceTitleLower.includes('tvro') &&
    Boolean(
      tvroReg &&
        (tvroReg.bsdNumber ||
          tvroReg.businessName ||
          (tvroReg.particularsEquipment &&
            tvroReg.particularsEquipment.some((e: { makeTypeModel?: string; serialNo?: string }) => e.makeTypeModel || e.serialNo)) ||
          (tvroReg.particularsOfAntennaSystem &&
            tvroReg.particularsOfAntennaSystem.some((a: { makeTypeModel?: string; dishDiameter?: string }) => a.makeTypeModel || a.dishDiameter)))
    );

  if (!hasTvroData || !tvroReg) return null;

  return (
    <SectionCard icon="tv" title="TVRO Station Particulars & Specifications" accentColor="#0284C7">
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {tvroReg.classification ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Classification" value={tvroReg.classification} />
            </View>
          ) : null}
          {tvroReg.years ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Validity Years" value={`${tvroReg.years} Year(s)`} />
            </View>
          ) : null}
        </View>
        {tvroReg.businessName ? <SummaryRow label="Business Name" value={tvroReg.businessName} /> : null}

        {/* Station Location */}
        {tvroReg.exactLocation || tvroReg.serviceArea || tvroReg.city || tvroReg.province ? (
          <View style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
              Station Location & Geographic Coordinates
            </Text>
            <View style={{ gap: 4 }}>
              {[tvroReg.exactLocation, tvroReg.barangay, tvroReg.city, tvroReg.province]
                .filter(Boolean)
                .join(', ') ? (
                <SummaryRow
                  label="Location Address"
                  value={[tvroReg.exactLocation, tvroReg.barangay, tvroReg.city, tvroReg.province]
                    .filter(Boolean)
                    .join(', ')}
                />
              ) : null}
              {tvroReg.latitude || tvroReg.longitude ? (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {tvroReg.latitude ? (
                    <View style={{ flex: 1 }}>
                      <SummaryRow label="Latitude" value={tvroReg.latitude} />
                    </View>
                  ) : null}
                  {tvroReg.longitude ? (
                    <View style={{ flex: 1 }}>
                      <SummaryRow label="Longitude" value={tvroReg.longitude} />
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Equipment Specs */}
        {tvroReg.particularsEquipment && tvroReg.particularsEquipment.some((e: { makeTypeModel?: string }) => e.makeTypeModel) ? (
          <View style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
              Receiver & Equipment Details
            </Text>
            {tvroReg.particularsEquipment.map((eq: { makeTypeModel?: string; serialNo?: string }, idx: number) => (
              <View key={idx} style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
                {eq.makeTypeModel ? (
                  <View style={{ flex: 1 }}>
                    <SummaryRow label={`Make / Model #${idx + 1}`} value={eq.makeTypeModel} />
                  </View>
                ) : null}
                {eq.serialNo ? (
                  <View style={{ flex: 1 }}>
                    <SummaryRow label="Serial Number" value={eq.serialNo} />
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Antenna Specs */}
        {tvroReg.particularsOfAntennaSystem && tvroReg.particularsOfAntennaSystem.some((a: { makeTypeModel?: string }) => a.makeTypeModel) ? (
          <View style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 6, textTransform: 'uppercase' }}>
              Antenna System Details
            </Text>
            {tvroReg.particularsOfAntennaSystem.map((ant: { makeTypeModel?: string; dishDiameter?: string }, idx: number) => (
              <View key={idx} style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
                {ant.makeTypeModel ? (
                  <View style={{ flex: 1 }}>
                    <SummaryRow label={`Antenna Make #${idx + 1}`} value={ant.makeTypeModel} />
                  </View>
                ) : null}
                {ant.dishDiameter ? (
                  <View style={{ flex: 1 }}>
                    <SummaryRow label="Dish Diameter" value={ant.dishDiameter} />
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </SectionCard>
  );
}
