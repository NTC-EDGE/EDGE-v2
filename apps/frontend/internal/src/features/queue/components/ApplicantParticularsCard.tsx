import React from 'react';
import { ApplicantDetailsReviewCard, formatCompositeAddress } from '../../../shared/formPreview';

export interface ApplicantParticularsData {
  applicantName?: string | null;
  name?: string | null;
  applicantType?: string | null;
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
  registrationNumber?: string | null;
  companyAddress?: string | null;
  companyEmail?: string | null;
  companyContactNumber?: string | null;
  representativeName?: string | null;
  representativeEmail?: string | null;
  representativeContactNumber?: string | null;
  notes?: string | null;
  schoolAttended?: string | null;
  courseTaken?: string | null;
  yearGraduated?: string | null;
}

interface ApplicantParticularsCardProps {
  applicant: ApplicantParticularsData | null;
  isDesktop?: boolean;
}

export function ApplicantParticularsCard({ applicant }: ApplicantParticularsCardProps) {
  if (!applicant) return null;

  const fullAddress = formatCompositeAddress({
    streetAddress: applicant.streetAddress,
    barangay: applicant.barangay,
    cityMunicipality: applicant.cityMunicipality || applicant.city,
    province: applicant.province,
    region: applicant.region,
    zipCode: applicant.zipCode,
  });

  const fullName = applicant.applicantName || applicant.name || null;
  const email = applicant.email || '';
  const contactNo = applicant.mobileNumber || applicant.contactNumber || '';

  const isIndividual = (applicant.applicantType || '').toLowerCase() === 'individual';
  const isCompany =
    !isIndividual &&
    (
      (applicant.applicantType || '').toLowerCase() === 'company' ||
      Boolean(applicant.companyName)
    );

  return (
    <ApplicantDetailsReviewCard
      activeApplicant={{
        applicantType: isCompany ? 'company' : 'individual',
        companyName: isCompany ? (applicant.companyName || null) : null,
        registrationNumber: isCompany ? (applicant.registrationNumber || null) : null,
        companyAddress: isCompany ? (applicant.companyAddress || null) : null,
        companyEmail: isCompany ? (applicant.companyEmail || null) : null,
        companyContactNumber: isCompany ? (applicant.companyContactNumber || null) : null,
        representativeName: isCompany ? (applicant.representativeName || null) : null,
        representativeEmail: isCompany ? (applicant.representativeEmail || null) : null,
        representativeContactNumber: isCompany ? (applicant.representativeContactNumber || null) : null,
        notes: applicant.notes || null,
      }}
      resolvedFullName={fullName}
      resolvedEmail={email}
      resolvedContactNo={contactNo}
      resolvedAddress={fullAddress}
      resolvedBirthDate={applicant.birthDate || null}
      resolvedSex={applicant.sex || null}
      resolvedCivilStatus={applicant.civilStatus || null}
      resolvedNationality={applicant.nationality || null}
      schoolAttended={applicant.schoolAttended || null}
      courseTaken={applicant.courseTaken || null}
      yearGraduated={applicant.yearGraduated || null}
    />
  );
}
