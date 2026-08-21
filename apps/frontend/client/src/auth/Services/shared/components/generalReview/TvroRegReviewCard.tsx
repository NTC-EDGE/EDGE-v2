import React from 'react';
import { View, Text } from 'react-native';
import { TYPOGRAPHY } from '@edge/ui';
import { TVRORegistrationData } from '../../../certificates';
import { SectionCard } from './SectionCard';
import { SummaryRow } from './SummaryRow';

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

        {/* Location Details */}
        {(tvroReg.serviceArea || tvroReg.exactLocation || tvroReg.longitude || tvroReg.latitude) ? (
          <View style={{ marginTop: 4, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', gap: 6 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
              4. Location Details
            </Text>
            {tvroReg.serviceArea ? <SummaryRow label="Service Area" value={tvroReg.serviceArea} /> : null}
            {tvroReg.exactLocation ? <SummaryRow label="Exact Location of TVRO System" value={tvroReg.exactLocation} /> : null}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {tvroReg.longitude ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Longitude (deg-min-sec)" value={tvroReg.longitude} />
                </View>
              ) : null}
              {tvroReg.latitude ? (
                <View style={{ flex: 1 }}>
                  <SummaryRow label="Latitude (deg-min-sec)" value={tvroReg.latitude} />
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Particulars of Equipment */}
        {tvroReg.particularsEquipment && tvroReg.particularsEquipment.length > 0 ? (
          <View style={{ marginTop: 4, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
              5. Particulars of Equipment ({tvroReg.particularsEquipment.length} Unit(s))
            </Text>
            {tvroReg.particularsEquipment.map((eq: { id?: string; type?: string; makeTypeModel?: string; serialNo?: string; frequencyRange?: string }, idx: number) => (
              <View key={eq.id || idx} style={{ padding: 10, backgroundColor: '#FFFFFF', borderRadius: 6, borderWidth: 1, borderColor: '#CBD5E1', gap: 4 }}>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: '700', color: '#1E293B' }}>
                  Unit #{idx + 1}: {eq.type || 'Equipment'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <SummaryRow label="Make / Type / Model" value={eq.makeTypeModel || 'N/A'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <SummaryRow label="Serial Number" value={eq.serialNo || 'N/A'} />
                  </View>
                </View>
                {eq.frequencyRange ? <SummaryRow label="Frequency Range" value={eq.frequencyRange} /> : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Particulars of Antenna System */}
        {tvroReg.particularsOfAntennaSystem && tvroReg.particularsOfAntennaSystem.length > 0 ? (
          <View style={{ marginTop: 4, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', gap: 8, width: '100%' }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
              6. Particulars of Antenna System ({tvroReg.particularsOfAntennaSystem.length} Dish(es))
            </Text>
            {tvroReg.particularsOfAntennaSystem.map((ant: { id?: string; makeTypeModel?: string; dishDiameter?: string; polarization?: string; azimuth?: string }, idx: number) => (
              <View key={ant.id || idx} style={{ padding: 10, backgroundColor: '#FFFFFF', borderRadius: 6, borderWidth: 1, borderColor: '#CBD5E1', gap: 4, width: '100%' }}>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: '700', color: '#1E293B', marginBottom: 4 }}>
                  Antenna #{idx + 1}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, width: '100%' }}>
                  <View style={{ flex: 1.3 }}>
                    <SummaryRow label="Make/Type/Model" value={ant.makeTypeModel || 'N/A'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <SummaryRow label="Dish Diameter" value={ant.dishDiameter || 'N/A'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <SummaryRow label="Polarization" value={ant.polarization || 'N/A'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <SummaryRow label="Azimuth" value={ant.azimuth || 'N/A'} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Particulars of Signal to be Received */}
        {tvroReg.particularsOfSignalToBeReceived && tvroReg.particularsOfSignalToBeReceived.length > 0 ? (
          <View style={{ marginTop: 4, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
              7. Particulars of Signal to be Received ({tvroReg.particularsOfSignalToBeReceived.length} Channel(s))
            </Text>
            {tvroReg.particularsOfSignalToBeReceived.map((sig: { id?: string; satellite?: string; receivedFrequency?: string; polarization?: string; nameOfPrograms?: string }, idx: number) => (
              <View key={sig.id || idx} style={{ padding: 10, backgroundColor: '#FFFFFF', borderRadius: 6, borderWidth: 1, borderColor: '#CBD5E1', gap: 4 }}>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: '700', color: '#1E293B' }}>
                  Signal Channel #{idx + 1}: {sig.satellite || 'Satellite'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <SummaryRow label="Received Frequency" value={sig.receivedFrequency || 'N/A'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <SummaryRow label="Polarization" value={sig.polarization || 'N/A'} />
                  </View>
                </View>
                {sig.nameOfPrograms ? <SummaryRow label="Name of Programs" value={sig.nameOfPrograms} /> : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* BSD */}
        <View style={{ marginTop: 4, padding: 12, backgroundColor: '#F1F5F9', borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
              8. Broadcast Services Division (BSD)
            </Text>
            <View style={{ backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10.5, fontWeight: '700', color: '#1D4ED8' }}>
                NTC ASSIGNMENT
              </Text>
            </View>
          </View>
          <SummaryRow label="BSD No." value={tvroReg.bsdNumber || 'TO BE ASSIGNED BY NTC'} />
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: '#64748B', fontStyle: 'italic' }}>
            * BSD No. is designated and assigned exclusively by the NTC upon application review.
          </Text>
        </View>
      </View>
    </SectionCard>
  );
}
