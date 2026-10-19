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
          permitData.applicant ||
          permitData.frequency)
    );

  if (!hasPermitData || !permitData) return null;

  const equipmentCount =
    permitData.purchaseEquipments && permitData.purchaseEquipments.length > 0
      ? permitData.purchaseEquipments.length
      : permitData.equipments && permitData.equipments.length > 0
      ? permitData.equipments.length
      : permitData.stationParticulars && permitData.stationParticulars.length > 0
      ? permitData.stationParticulars.length
      : 0;

  const dealerOrSeller =
    permitData.nameOfDealer || permitData.nameOfDealerOrSeller || '';

  const intendedUseParts = [
    permitData.intendedUseStorageAt ? `Storage (${permitData.storageAtSpecify || 'Specified Location'})` : '',
    permitData.intendedUseNewRadioStation ? `New Station (${permitData.newRadioStationSpecify || 'Standard'})` : '',
    permitData.intendedUseAdditionalRadioEquipment ? 'Additional Radio Equipment' : '',
    permitData.intendedUseChangeOfEquipment ? 'Change of Equipment' : '',
    permitData.intendedUseOthers ? `Other (${permitData.othersSpecify || 'N/A'})` : '',
  ].filter(Boolean);

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

        {(permitData.frequency || permitData.powerOutput) ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {permitData.frequency ? (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Frequency Range" value={permitData.frequency} />
              </View>
            ) : null}
            {permitData.powerOutput ? (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Power Output" value={`${permitData.powerOutput} Watts`} />
              </View>
            ) : null}
          </View>
        ) : null}

        {(permitData.bandwidth || permitData.emission) ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {permitData.bandwidth ? (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Bandwidth" value={`${permitData.bandwidth} ${permitData.unit || 'MHz'}`} />
              </View>
            ) : null}
            {permitData.emission ? (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Emission Class" value={permitData.emission} />
              </View>
            ) : null}
          </View>
        ) : null}

        {equipmentCount > 0 ? (
          <SummaryRow label="Declared Equipment / Station Count" value={`${equipmentCount} Unit(s)`} />
        ) : null}

        {dealerOrSeller ? (
          <SummaryRow label="Source of Equipment (Dealer / Seller)" value={dealerOrSeller} />
        ) : null}

        {intendedUseParts.length > 0 ? (
          <SummaryRow label="Intended Purpose / Use" value={intendedUseParts.join(', ')} />
        ) : null}
      </View>
    </SectionCard>
  );
}

