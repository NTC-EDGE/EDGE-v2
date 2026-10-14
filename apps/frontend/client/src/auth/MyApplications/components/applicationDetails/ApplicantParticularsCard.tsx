import React from 'react';
import { ApplicantDetailsReviewCard, formatCompositeAddress } from '../../../../shared/formPreview';

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
    schoolAttended?: string | null;
    courseTaken?: string | null;
    yearGraduated?: string | null;
  } | null;
  isDesktop?: boolean;
}

export function ApplicantParticularsCard({ singleApplicant }: ApplicantParticularsCardProps) {
  if (!singleApplicant) return null;

  const fullAddress = formatCompositeAddress({
    streetAddress: singleApplicant.streetAddress,
    barangay: singleApplicant.barangay,
    cityMunicipality: singleApplicant.cityMunicipality,
    province: singleApplicant.province,
    region: singleApplicant.region,
    zipCode: singleApplicant.zipCode,
  });

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
        schoolAttended: singleApplicant.schoolAttended,
        courseTaken: singleApplicant.courseTaken,
        yearGraduated: singleApplicant.yearGraduated,
      }}
      resolvedFullName={singleApplicant.applicantName || null}
      resolvedEmail={singleApplicant.email && singleApplicant.email !== 'N/A' ? singleApplicant.email : ''}
      resolvedContactNo={singleApplicant.mobileNumber && singleApplicant.mobileNumber !== 'N/A' ? singleApplicant.mobileNumber : ''}
      resolvedAddress={fullAddress}
      resolvedBirthDate={singleApplicant.birthDate && singleApplicant.birthDate !== 'N/A' ? singleApplicant.birthDate : null}
      resolvedSex={singleApplicant.sex && singleApplicant.sex !== 'N/A' ? singleApplicant.sex : null}
      resolvedCivilStatus={singleApplicant.civilStatus && singleApplicant.civilStatus !== 'N/A' ? singleApplicant.civilStatus : null}
      resolvedNationality={singleApplicant.nationality && singleApplicant.nationality !== 'N/A' ? singleApplicant.nationality : null}
      schoolAttended={singleApplicant.schoolAttended}
      courseTaken={singleApplicant.courseTaken}
      yearGraduated={singleApplicant.yearGraduated}
    />
  );
}
