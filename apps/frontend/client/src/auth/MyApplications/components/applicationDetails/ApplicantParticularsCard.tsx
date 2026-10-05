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
    registrationNumber?: string | null;
    companyAddress?: string | null;
    companyEmail?: string | null;
    companyContactNumber?: string | null;
    representativeName: string | null;
    representativeEmail?: string | null;
    representativeContactNumber?: string | null;
    notes: string | null;
  } | null;
  isDesktop?: boolean;
}

export function ApplicantParticularsCard({ singleApplicant }: ApplicantParticularsCardProps) {
  if (!singleApplicant) return null;

  const addressComponents = [
    singleApplicant.streetAddress && singleApplicant.streetAddress !== 'N/A' ? singleApplicant.streetAddress : null,
    singleApplicant.barangay && singleApplicant.barangay !== 'N/A' ? `Brgy. ${singleApplicant.barangay}` : null,
    singleApplicant.cityMunicipality && singleApplicant.cityMunicipality !== 'N/A' ? singleApplicant.cityMunicipality : null,
    singleApplicant.province && singleApplicant.province !== 'N/A' ? singleApplicant.province : null,
    singleApplicant.region && singleApplicant.region !== 'N/A' ? `(${singleApplicant.region})` : null,
    singleApplicant.zipCode && singleApplicant.zipCode !== 'N/A' ? `ZIP ${singleApplicant.zipCode}` : null,
  ].filter((p): p is string => Boolean(p && typeof p === 'string' && p.trim() !== ''));
  const fullAddress = addressComponents.join(', ');

  return (
    <ApplicantDetailsReviewCard
      activeApplicant={{
        applicantType: singleApplicant.companyName ? 'company' : 'individual',
        companyName: singleApplicant.companyName,
        registrationNumber: singleApplicant.registrationNumber || null,
        companyAddress: singleApplicant.companyAddress || null,
        companyEmail: singleApplicant.companyEmail || null,
        companyContactNumber: singleApplicant.companyContactNumber || null,
        representativeName: singleApplicant.representativeName,
        representativeEmail: singleApplicant.representativeEmail || null,
        representativeContactNumber: singleApplicant.representativeContactNumber || null,
        notes: singleApplicant.notes,
      }}
      resolvedFullName={singleApplicant.applicantName || null}
      resolvedEmail={singleApplicant.email && singleApplicant.email !== 'N/A' ? singleApplicant.email : ''}
      resolvedContactNo={singleApplicant.mobileNumber && singleApplicant.mobileNumber !== 'N/A' ? singleApplicant.mobileNumber : ''}
      resolvedAddress={fullAddress.length > 0 ? fullAddress : null}
      resolvedBirthDate={singleApplicant.birthDate && singleApplicant.birthDate !== 'N/A' ? singleApplicant.birthDate : null}
      resolvedSex={singleApplicant.sex && singleApplicant.sex !== 'N/A' ? singleApplicant.sex : null}
      resolvedCivilStatus={singleApplicant.civilStatus && singleApplicant.civilStatus !== 'N/A' ? singleApplicant.civilStatus : null}
      resolvedNationality={singleApplicant.nationality && singleApplicant.nationality !== 'N/A' ? singleApplicant.nationality : null}
    />
  );
}
