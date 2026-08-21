import React from 'react';
import { View } from 'react-native';
import { DeviceRegistrationData } from '../../../certificates';
import { SectionCard } from './SectionCard';
import { SummaryRow } from './SummaryRow';

interface DeviceRegReviewCardProps {
  isCertificateService: boolean;
  deviceReg?: DeviceRegistrationData | null;
}

export function DeviceRegReviewCard({
  isCertificateService,
  deviceReg,
}: DeviceRegReviewCardProps) {
  const hasDeviceRegData =
    isCertificateService &&
    Boolean(
      deviceReg &&
        (deviceReg.registrationType ||
          deviceReg.invoiceNo ||
          deviceReg.businessName ||
          (deviceReg.particulars && deviceReg.particulars.length > 0))
    );

  if (!hasDeviceRegData || !deviceReg) return null;

  return (
    <SectionCard icon="cpu" title="Registered Device Particulars" accentColor="#0284C7">
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {deviceReg.registrationType ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Registration Type" value={deviceReg.registrationType} />
            </View>
          ) : null}
          {deviceReg.registrationType === 'Non-Dealers' && deviceReg.invoiceNo ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Invoice Number" value={deviceReg.invoiceNo} />
            </View>
          ) : null}
        </View>
        {deviceReg.businessName ? <SummaryRow label="Business Name" value={deviceReg.businessName} /> : null}
        {deviceReg.dtiSecNo ? <SummaryRow label="DTI / SEC Reg No." value={deviceReg.dtiSecNo} /> : null}
      </View>
    </SectionCard>
  );
}
