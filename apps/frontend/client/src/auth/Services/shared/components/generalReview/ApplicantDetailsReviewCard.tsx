import React from 'react';
import { View } from 'react-native';
import { GeneralApplicantData } from '../../hooks/useGeneralServiceWizard';
import { SectionCard } from './SectionCard';
import { SummaryRow } from './SummaryRow';

interface ApplicantDetailsReviewCardProps {
  activeApplicant: GeneralApplicantData;
  resolvedFullName: string | null;
  resolvedEmail: string;
  resolvedContactNo: string;
  resolvedAddress: string | null;
  resolvedBirthDate: string | null;
  resolvedSex: string | null;
  resolvedCivilStatus: string | null;
  resolvedNationality: string | null;
}

export function ApplicantDetailsReviewCard({
  activeApplicant,
  resolvedFullName,
  resolvedEmail,
  resolvedContactNo,
  resolvedAddress,
  resolvedBirthDate,
  resolvedSex,
  resolvedCivilStatus,
  resolvedNationality,
}: ApplicantDetailsReviewCardProps) {
  const hasApplicantData =
    resolvedFullName !== null ||
    Boolean(activeApplicant.companyName) ||
    Boolean(activeApplicant.representativeName) ||
    resolvedEmail.length > 0 ||
    resolvedContactNo.length > 0 ||
    resolvedAddress !== null ||
    resolvedSex !== null ||
    resolvedCivilStatus !== null ||
    resolvedNationality !== null ||
    resolvedBirthDate !== null ||
    Boolean(activeApplicant.notes);

  if (!hasApplicantData) {
    return null;
  }

  return (
    <SectionCard icon="user" title="Applicant Details" accentColor="#1D4ED8">
      {resolvedFullName !== null && <SummaryRow label="Full Legal Name" value={resolvedFullName} />}
      {activeApplicant.applicantType === 'company' && activeApplicant.companyName ? (
        <SummaryRow label="Registered Business / Corporate Name" value={activeApplicant.companyName} />
      ) : null}
      {activeApplicant.representativeName ? (
        <SummaryRow label="Authorized Representative" value={activeApplicant.representativeName} />
      ) : null}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {resolvedEmail.length > 0 ? (
          <View style={{ flex: 1 }}>
            <SummaryRow label="Email Address" value={resolvedEmail} />
          </View>
        ) : null}
        {resolvedContactNo.length > 0 ? (
          <View style={{ flex: 1 }}>
            <SummaryRow label="Contact / Mobile Number" value={resolvedContactNo} />
          </View>
        ) : null}
      </View>
      {resolvedAddress !== null && (
        <SummaryRow label="Complete Residential / Office Address" value={resolvedAddress} />
      )}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {resolvedBirthDate !== null ? (
          <View style={{ flex: 1 }}>
            <SummaryRow label="Date of Birth" value={resolvedBirthDate} />
          </View>
        ) : null}
        {resolvedSex !== null ? (
          <View style={{ flex: 1 }}>
            <SummaryRow label="Sex / Gender" value={resolvedSex} />
          </View>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {resolvedCivilStatus !== null ? (
          <View style={{ flex: 1 }}>
            <SummaryRow label="Civil Status" value={resolvedCivilStatus} />
          </View>
        ) : null}
        {resolvedNationality !== null ? (
          <View style={{ flex: 1 }}>
            <SummaryRow label="Nationality / Citizenship" value={resolvedNationality} />
          </View>
        ) : null}
      </View>
      {activeApplicant.notes ? <SummaryRow label="Special Notes / Remarks" value={activeApplicant.notes} /> : null}
    </SectionCard>
  );
}
