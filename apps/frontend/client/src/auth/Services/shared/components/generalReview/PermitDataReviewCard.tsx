import React from 'react';
import { View } from 'react-native';
import { AmateurPermitData } from '../../../permits';
import { SectionCard, SummaryRow } from '../../../../../shared/formPreview';

interface PermitDataReviewCardProps {
  isPermitService: boolean;
  serviceTitle?: string | null;
  permitData?: AmateurPermitData | null;
  hasDynamicForm?: boolean;
}

export function PermitDataReviewCard({
  isPermitService,
  serviceTitle = '',
  permitData,
  hasDynamicForm = false,
}: PermitDataReviewCardProps) {
  if (hasDynamicForm) return null;

  const sLower = (serviceTitle || '').toLowerCase();
  const isCopyOfPermit =
    sLower.includes('copy of permit') ||
    sLower.includes('copy') ||
    sLower.includes('duplicate');
  if (isCopyOfPermit) return null;

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

  return (
    <SectionCard icon="file-text" title="Amateur Radio Permit Particulars" accentColor="#0284C7">
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

        {permitData.applicant ? (
          <SummaryRow label="Applicant Name" value={permitData.applicant} />
        ) : null}

        {permitData.frequency ? (
          <SummaryRow label="Operating Frequency / Band" value={permitData.frequency} />
        ) : null}

        {dealerOrSeller ? (
          <SummaryRow label="Dealer / Seller" value={dealerOrSeller} />
        ) : null}

        {permitData.sourceOfEquipment ? (
          <SummaryRow label="Source of Equipment" value={permitData.sourceOfEquipment} />
        ) : null}

        {permitData.sellerAddress ? (
          <SummaryRow label="Seller Address" value={permitData.sellerAddress} />
        ) : null}

        {equipmentCount > 0 ? (
          <SummaryRow label="Equipment / Units Listed" value={`${equipmentCount} Unit(s)`} />
        ) : null}

        {permitData.particulars && (permitData.particulars.make || permitData.particulars.type || permitData.particulars.model) ? (
          <SummaryRow
            label="Make / Type / Model"
            value={[permitData.particulars.make, permitData.particulars.type, permitData.particulars.model]
              .filter(Boolean)
              .join(' ')}
          />
        ) : null}

        {permitData.particulars && permitData.particulars.serialNumber ? (
          <SummaryRow label="Serial Number" value={permitData.particulars.serialNumber} />
        ) : null}

        {permitData.particulars && permitData.particulars.powerOutput ? (
          <SummaryRow label="Power Output" value={permitData.particulars.powerOutput} />
        ) : null}

        {permitData.particulars && permitData.particulars.frequencyRange ? (
          <SummaryRow label="Frequency Range" value={permitData.particulars.frequencyRange} />
        ) : null}

        {permitData.storageAddress ? (
          <SummaryRow label="Storage Address" value={permitData.storageAddress} />
        ) : null}

        {permitData.remarks ? (
          <SummaryRow label="Remarks" value={permitData.remarks} />
        ) : null}
      </View>
    </SectionCard>
  );
}
