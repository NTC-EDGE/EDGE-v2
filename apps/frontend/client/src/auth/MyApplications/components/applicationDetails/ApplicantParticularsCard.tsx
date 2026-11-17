import React from 'react';
import { ApplicantDetailsReviewCard, formatCompositeAddress } from '../../../../shared/formPreview';

interface ApplicantParticularsCardProps {
  singleApplicant: {
    applicantName: string;
    applicantType?: string | null;
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
    schoolName?: string | null;
    courseTaken?: string | null;
    courseDegree?: string | null;
    yearGraduated?: string | null;
    specialOrderNo?: string | null;
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

  const isIndividual = (singleApplicant.applicantType || '').toLowerCase() === 'individual';
  const isCompany = !isIndividual && ((singleApplicant.applicantType || '').toLowerCase() === 'company' || Boolean(singleApplicant.companyName));
  const hasSponsoringCompany = isCompany || Boolean(singleApplicant.companyName && singleApplicant.companyName.trim().length > 0 && singleApplicant.companyName.trim() !== 'Company Applicant');

  const resolvedSchool = singleApplicant.schoolAttended || singleApplicant.schoolName || null;
  const resolvedCourse = singleApplicant.courseTaken || singleApplicant.courseDegree || null;
  const resolvedYear = singleApplicant.yearGraduated || null;
  const resolvedSpecialOrderNo = singleApplicant.specialOrderNo || null;

  return (
    <ApplicantDetailsReviewCard
      activeApplicant={{
        applicantType: isCompany ? 'company' : 'individual',
        companyName: hasSponsoringCompany ? (singleApplicant.companyName || null) : null,
        registrationNumber: hasSponsoringCompany ? (singleApplicant.registrationNumber || null) : null,
        companyAddress: hasSponsoringCompany ? (singleApplicant.companyAddress || null) : null,
        companyEmail: hasSponsoringCompany ? (singleApplicant.companyEmail || null) : null,
        companyContactNumber: hasSponsoringCompany ? (singleApplicant.companyContactNumber || null) : null,
        representativeName: hasSponsoringCompany ? (singleApplicant.representativeName || null) : null,
        representativeEmail: hasSponsoringCompany ? (singleApplicant.representativeEmail || null) : null,
        representativeContactNumber: hasSponsoringCompany ? (singleApplicant.representativeContactNumber || null) : null,
        notes: singleApplicant.notes,
        schoolAttended: resolvedSchool,
        schoolName: resolvedSchool,
        courseTaken: resolvedCourse,
        courseDegree: resolvedCourse,
        yearGraduated: resolvedYear,
        specialOrderNo: resolvedSpecialOrderNo,
      }}
      resolvedFullName={singleApplicant.applicantName || null}
      resolvedEmail={singleApplicant.email && singleApplicant.email !== 'N/A' ? singleApplicant.email : ''}
      resolvedContactNo={singleApplicant.mobileNumber && singleApplicant.mobileNumber !== 'N/A' ? singleApplicant.mobileNumber : ''}
      resolvedAddress={fullAddress}
      resolvedBirthDate={singleApplicant.birthDate && singleApplicant.birthDate !== 'N/A' ? singleApplicant.birthDate : null}
      resolvedSex={singleApplicant.sex && singleApplicant.sex !== 'N/A' ? singleApplicant.sex : null}
      resolvedCivilStatus={singleApplicant.civilStatus && singleApplicant.civilStatus !== 'N/A' ? singleApplicant.civilStatus : null}
      resolvedNationality={singleApplicant.nationality && singleApplicant.nationality !== 'N/A' ? singleApplicant.nationality : null}
      schoolAttended={resolvedSchool}
      courseTaken={resolvedCourse}
      yearGraduated={resolvedYear}
      specialOrderNo={resolvedSpecialOrderNo}
    />
  );
}
