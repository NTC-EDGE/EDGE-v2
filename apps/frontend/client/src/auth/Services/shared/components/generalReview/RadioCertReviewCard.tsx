import React from 'react';
import { View } from 'react-native';
import { RadioOperatorCertData } from '../../../certificates';
import { SectionCard, SummaryRow } from '../../../../../shared/formPreview';

interface RadioCertReviewCardProps {
  isCertificateService: boolean;
  isAmateurCertService: boolean;
  serviceTitle?: string;
  radioCert?: RadioOperatorCertData | null;
}

export function RadioCertReviewCard({
  isCertificateService,
  isAmateurCertService,
  serviceTitle = '',
  radioCert,
}: RadioCertReviewCardProps) {
  const titleLower = serviceTitle.toLowerCase();
  const isOtherCertService =
    titleLower.includes('vas') ||
    titleLower.includes('value-added') ||
    titleLower.includes('tvro') ||
    titleLower.includes('rfid') ||
    titleLower.includes('device') ||
    titleLower.includes('srd') ||
    titleLower.includes('wdn') ||
    titleLower.includes('copy of');

  if (isAmateurCertService || isOtherCertService) {
    return null;
  }

  const hasRadioCertData =
    isCertificateService &&
    Boolean(
      radioCert &&
        (radioCert.typeOfCertificate ||
          radioCert.certificateNo ||
          radioCert.dateOfExpiry ||
          radioCert.modificationDueTo ||
          radioCert.employmentStatus)
    );

  if (!hasRadioCertData || !radioCert) return null;

  return (
    <SectionCard icon="file-text" title="Radio Operator Certificate Particulars" accentColor="#7C3AED">
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {radioCert.typeOfCertificate ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Certificate Type" value={radioCert.typeOfCertificate} />
            </View>
          ) : null}
          {radioCert.years ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Validity Years" value={`${radioCert.years} Year(s)`} />
            </View>
          ) : null}
        </View>
        {radioCert.certificateNo ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <SummaryRow label="Certificate No." value={radioCert.certificateNo} />
            </View>
            {radioCert.dateOfExpiry ? (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Expiry Date" value={radioCert.dateOfExpiry} />
              </View>
            ) : null}
          </View>
        ) : null}
        {radioCert.modificationDueTo ? <SummaryRow label="Reason for Modification" value={radioCert.modificationDueTo} /> : null}
        {radioCert.employmentStatus || radioCert.employmentType || radioCert.employmentLocation ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {radioCert.employmentStatus ? (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Employment Status" value={radioCert.employmentStatus} />
              </View>
            ) : null}
            {radioCert.employmentType || radioCert.employmentLocation ? (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Employment Type / Location" value={[radioCert.employmentType, radioCert.employmentLocation].filter(Boolean).join(' - ')} />
              </View>
            ) : null}
          </View>
        ) : null}
        {radioCert.clubName ? (
          <SummaryRow label="Amateur Club & Call Sign" value={[radioCert.clubName, radioCert.clubCallSign].filter(Boolean).join(' (') + (radioCert.clubCallSign ? ')' : '')} />
        ) : null}
      </View>
    </SectionCard>
  );
}
