import React from 'react';
import { ApplicantDetailsReviewCard } from '../../../shared/formPreview/components/ApplicantDetailsReviewCard';

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
}

interface ApplicantParticularsCardProps {
  applicant: ApplicantParticularsData | null;
  isDesktop?: boolean;
}

export function ApplicantParticularsCard({ applicant }: ApplicantParticularsCardProps) {
  if (!applicant) return null;

  const street = (applicant.streetAddress || '').trim();
  const rawBrgy = (applicant.barangay || '').trim();
  const brgy = rawBrgy
    ? (rawBrgy.toLowerCase().startsWith('brgy') || rawBrgy.toLowerCase().startsWith('barangay') ? rawBrgy : `Brgy. ${rawBrgy}`)
    : '';
  const city = (applicant.cityMunicipality || applicant.city || '').trim();
  const prov = (applicant.province || '').trim();
  const reg = applicant.region && applicant.region !== 'N/A' ? `(${applicant.region.trim()})` : '';
  const zip = (applicant.zipCode || '').trim();

  let fullAddress = street;
  if (brgy || city || prov || zip) {
    const parts = [
      street && (!rawBrgy || !street.toLowerCase().includes(rawBrgy.toLowerCase())) ? street : (street || undefined),
      brgy && (!street || !street.toLowerCase().includes(rawBrgy.toLowerCase())) ? brgy : undefined,
      city && (!street || !street.toLowerCase().includes(city.toLowerCase())) ? city : undefined,
      prov && (!street || !street.toLowerCase().includes(prov.toLowerCase())) ? prov : undefined,
      reg && (!street || !street.toLowerCase().includes(reg.toLowerCase())) ? reg : undefined,
      zip && (!street || !street.includes(zip)) ? zip : undefined,
    ].filter((p): p is string => Boolean(p && p.trim()));
    if (parts.length > 0) {
      fullAddress = parts.join(', ');
    }
  }

  const fullName = applicant.applicantName || applicant.name || null;
  const email = applicant.email || '';
  const contactNo = applicant.mobileNumber || applicant.contactNumber || '';

  const isCompany =
    applicant.applicantType === 'company' ||
    applicant.applicantType === 'Company' ||
    Boolean(applicant.companyName);

  return (
    <ApplicantDetailsReviewCard
      activeApplicant={{
        applicantType: isCompany ? 'company' : 'individual',
        companyName: applicant.companyName || null,
        registrationNumber: applicant.registrationNumber || null,
        companyAddress: applicant.companyAddress || null,
        companyEmail: applicant.companyEmail || null,
        companyContactNumber: applicant.companyContactNumber || null,
        representativeName: applicant.representativeName || null,
        representativeEmail: applicant.representativeEmail || null,
        representativeContactNumber: applicant.representativeContactNumber || null,
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
