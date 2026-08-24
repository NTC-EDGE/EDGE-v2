import React from 'react';
import { ApplicantDetailsReviewCard } from '../../../../shared/formPreview/components/ApplicantDetailsReviewCard';

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
  isDesktop?: boolean;
}

export function ApplicantParticularsCard({ singleApplicant }: ApplicantParticularsCardProps) {
  if (!singleApplicant) return null;

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
    <ApplicantDetailsReviewCard
      activeApplicant={{
        applicantType: singleApplicant.companyName ? 'company' : 'individual',
        companyName: singleApplicant.companyName,
        representativeName: singleApplicant.representativeName,
        notes: singleApplicant.notes,
      }}
      resolvedFullName={singleApplicant.applicantName || null}
      resolvedEmail={singleApplicant.email || ''}
      resolvedContactNo={singleApplicant.mobileNumber || ''}
      resolvedAddress={fullAddress.length > 0 ? fullAddress : null}
      resolvedBirthDate={singleApplicant.birthDate || null}
      resolvedSex={singleApplicant.sex || null}
      resolvedCivilStatus={singleApplicant.civilStatus || null}
      resolvedNationality={singleApplicant.nationality || null}
    />
  );
}
