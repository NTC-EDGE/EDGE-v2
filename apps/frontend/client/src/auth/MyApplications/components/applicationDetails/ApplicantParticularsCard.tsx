import React from 'react';
import { View } from 'react-native';
import { SectionCard } from './SectionCard';
import { SummaryRow } from './SummaryRow';

interface ApplicantParticularsCardProps {
  singleApplicant: {
    applicantName: string;
    sex: string;
    nationality: string;
    streetAddress: string;
    barangay: string;
    cityMunicipality: string;
    province: string;
    region: string;
    zipCode: string;
    mobileNumber: string;
    email: string;
    birthDate: string | null;
    civilStatus: string | null;
    companyName: string | null;
    representativeName: string | null;
    notes: string | null;
  } | null;
  isDesktop: boolean;
}

export function ApplicantParticularsCard({ singleApplicant, isDesktop }: ApplicantParticularsCardProps) {
  if (!singleApplicant) return null;

  const hasBirthOrCivil = Boolean(singleApplicant.birthDate || singleApplicant.civilStatus);
  const hasSexOrNationality = Boolean(singleApplicant.sex || singleApplicant.nationality);

  const addressComponents = [
    singleApplicant.streetAddress,
    singleApplicant.barangay ? `Brgy. ${singleApplicant.barangay}` : '',
    singleApplicant.cityMunicipality,
    singleApplicant.province,
    singleApplicant.region && singleApplicant.region !== 'N/A' ? `(${singleApplicant.region})` : '',
    singleApplicant.zipCode,
  ].filter(Boolean);
  const fullAddress = addressComponents.join(', ');

  return (
    <SectionCard
      icon="user"
      title="Applicant Details"
      accentColor="#1D4ED8"
    >
      <View style={{ gap: 4 }}>
        {singleApplicant.applicantName ? (
          <SummaryRow
            label={singleApplicant.companyName ? 'Applicant' : 'Full Legal Name'}
            value={singleApplicant.applicantName}
          />
        ) : null}

        {singleApplicant.companyName ? (
          <SummaryRow label="Registered Business / Corporate Name" value={singleApplicant.companyName} />
        ) : null}

        {singleApplicant.representativeName ? (
          <SummaryRow label="Authorized Representative" value={singleApplicant.representativeName} />
        ) : null}

        <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 8 }}>
          {singleApplicant.email ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Email Address" value={singleApplicant.email} />
            </View>
          ) : null}
          {singleApplicant.mobileNumber ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Contact / Mobile Number" value={singleApplicant.mobileNumber} />
            </View>
          ) : null}
        </View>

        {fullAddress.length > 0 ? (
          <SummaryRow
            label="Complete Residential / Office Address"
            value={fullAddress}
          />
        ) : null}

        {hasBirthOrCivil ? (
          <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 8 }}>
            {singleApplicant.birthDate ? (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Date of Birth" value={singleApplicant.birthDate} />
              </View>
            ) : null}
            {singleApplicant.civilStatus ? (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Civil Status" value={singleApplicant.civilStatus} />
              </View>
            ) : null}
          </View>
        ) : null}

        {hasSexOrNationality ? (
          <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 8 }}>
            {singleApplicant.sex ? (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Sex / Gender" value={singleApplicant.sex} />
              </View>
            ) : null}
            {singleApplicant.nationality ? (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Nationality / Citizenship" value={singleApplicant.nationality} />
              </View>
            ) : null}
          </View>
        ) : null}

        {singleApplicant.notes ? (
          <SummaryRow label="Special Notes / Remarks" value={singleApplicant.notes} />
        ) : null}
      </View>
    </SectionCard>
  );
}
