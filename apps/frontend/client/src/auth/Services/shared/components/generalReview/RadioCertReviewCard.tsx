import React from 'react';
import { View } from 'react-native';
import { RadioOperatorCertData } from '../../../certificates';
import { SectionCard, SummaryRow } from '../../../../../shared/formPreview';

interface RadioCertReviewCardProps {
  isCertificateService: boolean;
  isAmateurCertService: boolean;
  serviceTitle?: string | null;
  radioCert?: RadioOperatorCertData | null;
}

export function RadioCertReviewCard({
  isCertificateService,
  isAmateurCertService,
  serviceTitle = '',
  radioCert,
}: RadioCertReviewCardProps) {
  const titleLower = (serviceTitle || '').toLowerCase();
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
              <SummaryRow label="Type of Certificate" value={radioCert.typeOfCertificate} />
            </View>
          ) : null}
          {radioCert.certificateNo ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Certificate No." value={radioCert.certificateNo} />
            </View>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {radioCert.dateOfExpiry ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Date of Expiry" value={radioCert.dateOfExpiry} />
            </View>
          ) : null}
          {radioCert.employmentStatus ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Employment Status" value={radioCert.employmentStatus} />
            </View>
          ) : null}
        </View>

        {radioCert.nameOfEmployer ? (
          <SummaryRow label="Name of Employer" value={radioCert.nameOfEmployer} />
        ) : null}

        {radioCert.companyAddress ? (
          <SummaryRow label="Company Address" value={radioCert.companyAddress} />
        ) : null}

        {radioCert.modificationDueTo ? (
          <SummaryRow label="Modification Reason" value={radioCert.modificationDueTo} />
        ) : null}

        {radioCert.remarks ? (
          <SummaryRow label="Remarks" value={radioCert.remarks} />
        ) : null}
      </View>
    </SectionCard>
  );
}
