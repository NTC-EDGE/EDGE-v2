import React from 'react';
import { ApplicantDetailsReviewCard } from '../../../shared/formPreview/components/ApplicantDetailsReviewCard';

export interface ApplicantParticularsData {
  applicantName?: string | null;
  name?: string | null;
  sex?: string | null;
  nationality?: string | null;
  streetAddress?: string | null;
  barangay?: string | null;
  cityMunicipality?: string | null;
  city?: string | null;
  province?: string | null;
  region?: string | null;
  zipCode?: string | null;
  mobileNumber?: string | null;
  contactNumber?: string | null;
  email?: string | null;
  birthDate?: string | null;
  civilStatus?: string | null;
  companyName?: string | null;
  representativeName?: string | null;
  notes?: string | null;
}

interface ApplicantParticularsCardProps {
  applicant: ApplicantParticularsData | null;
  isDesktop?: boolean;
}

export function ApplicantParticularsCard({ applicant }: ApplicantParticularsCardProps) {
  if (!applicant) return null;

  const street = applicant.streetAddress || '';
  const brgy = applicant.barangay ? `Brgy. ${applicant.barangay}` : '';
  const city = applicant.cityMunicipality || applicant.city || '';
  const prov = applicant.province || '';
  const reg = applicant.region && applicant.region !== 'N/A' ? `(${applicant.region})` : '';
  const zip = applicant.zipCode || '';

  const addressComponents = [street, brgy, city, prov, reg, zip].filter(Boolean);
  const fullAddress = addressComponents.join(', ');

  const fullName = applicant.applicantName || applicant.name || null;
  const email = applicant.email || '';
  const contactNo = applicant.mobileNumber || applicant.contactNumber || '';

  return (
    <ApplicantDetailsReviewCard
      activeApplicant={{
        applicantType: applicant.companyName ? 'company' : 'individual',
        companyName: applicant.companyName || null,
        representativeName: applicant.representativeName || null,
        notes: applicant.notes || null,
      }}
      resolvedFullName={fullName}
      resolvedEmail={email}
      resolvedContactNo={contactNo}
      resolvedAddress={fullAddress.length > 0 ? fullAddress : null}
      resolvedBirthDate={applicant.birthDate || null}
      resolvedSex={applicant.sex || null}
      resolvedCivilStatus={applicant.civilStatus || null}
      resolvedNationality={applicant.nationality || null}
    />
  );
}
