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

  return (
    <SectionCard
      icon="user"
      title="Named Individual / Applicant Particulars"
      accentColor="#1D4ED8"
    >
      <View style={{ gap: 4 }}>
        <SummaryRow label="Full Legal Name" value={singleApplicant.applicantName} />

        <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <SummaryRow label="Birth Date" value={singleApplicant.birthDate} />
          </View>
          <View style={{ flex: 1 }}>
            <SummaryRow label="Civil Status" value={singleApplicant.civilStatus} />
          </View>
        </View>

        <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <SummaryRow label="Sex / Gender" value={singleApplicant.sex} />
          </View>
          <View style={{ flex: 1 }}>
            <SummaryRow label="Citizenship / Nationality" value={singleApplicant.nationality} />
          </View>
        </View>

        <SummaryRow
          label="Residential / Complete Address"
          value={`${singleApplicant.streetAddress}${singleApplicant.barangay ? `, Brgy. ${singleApplicant.barangay}` : ''}, ${singleApplicant.cityMunicipality}, ${singleApplicant.province}${singleApplicant.region !== 'N/A' ? ` (${singleApplicant.region})` : ''}${singleApplicant.zipCode ? ` ${singleApplicant.zipCode}` : ''}`}
        />

        <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <SummaryRow label="Mobile / Contact Number" value={singleApplicant.mobileNumber} />
          </View>
          <View style={{ flex: 1 }}>
            <SummaryRow label="Email Address" value={singleApplicant.email} />
          </View>
        </View>

        {singleApplicant.companyName && (
          <SummaryRow label="Corporate / Employer Name" value={singleApplicant.companyName} />
        )}
        {singleApplicant.representativeName && (
          <SummaryRow label="Authorized Representative" value={singleApplicant.representativeName} />
        )}
        {singleApplicant.notes && (
          <SummaryRow label="Remarks / Special Notes" value={singleApplicant.notes} />
        )}
      </View>
    </SectionCard>
  );
}
