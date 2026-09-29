import React from 'react';
import { View } from 'react-native';
import { SectionCard } from './SectionCard';
import { SummaryRow } from './SummaryRow';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function formatFullDateOfBirth(val: string | null | undefined): string | null {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (!trimmed) return null;

  const shortMonthMatch = trimmed.match(/^([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})$/);
  if (shortMonthMatch) {
    const rawMonth = shortMonthMatch[1].toLowerCase();
    const day = parseInt(shortMonthMatch[2], 10);
    const year = shortMonthMatch[3];
    const foundIndex = MONTH_NAMES.findIndex((m) => m.toLowerCase().startsWith(rawMonth.slice(0, 3)));
    if (foundIndex !== -1) {
      return `${MONTH_NAMES[foundIndex]} ${day}, ${year}`;
    }
  }

  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthNum = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    if (monthNum >= 1 && monthNum <= 12 && day >= 1 && day <= 31) {
      return `${MONTH_NAMES[monthNum - 1]} ${day}, ${year}`;
    }
  }

  const slashMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (slashMatch) {
    const p1 = parseInt(slashMatch[1], 10);
    const p2 = parseInt(slashMatch[2], 10);
    const year = slashMatch[3];
    if (p1 >= 1 && p1 <= 12 && p2 >= 1 && p2 <= 31) {
      return `${MONTH_NAMES[p1 - 1]} ${p2}, ${year}`;
    }
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const m = MONTH_NAMES[parsed.getUTCMonth()];
    const d = parsed.getUTCDate();
    const y = parsed.getUTCFullYear();
    return `${m} ${d}, ${y}`;
  }

  return trimmed;
}

export interface ApplicantDetailsSnapshot {
  applicantType?: string;
  companyName?: string | null;
  registrationNumber?: string | null;
  companyAddress?: string | null;
  companyEmail?: string | null;
  companyContactNumber?: string | null;
  representativeFirstName?: string | null;
  representativeMiddleName?: string | null;
  representativeLastName?: string | null;
  representativeSuffix?: string | null;
  representativePosition?: string | null;
  representativeName?: string | null;
  representativeEmail?: string | null;
  representativeContactNumber?: string | null;
  notes?: string | null;
}

export interface ApplicantDetailsReviewCardProps {
  activeApplicant?: ApplicantDetailsSnapshot;
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
  const applicantType = activeApplicant?.applicantType || 'individual';
  const companyName = activeApplicant?.companyName || null;
  const registrationNumber = activeApplicant?.registrationNumber || null;
  const companyAddress = activeApplicant?.companyAddress || null;
  const companyEmail = activeApplicant?.companyEmail || null;
  const companyContactNumber = activeApplicant?.companyContactNumber || null;
  const repFromParts = [
    activeApplicant?.representativeFirstName,
    activeApplicant?.representativeMiddleName,
    activeApplicant?.representativeLastName,
    activeApplicant?.representativeSuffix,
  ].filter(Boolean).join(' ');

  const representativeName = activeApplicant?.representativeName || (repFromParts.length > 0 ? repFromParts : null);
  const representativePosition = activeApplicant?.representativePosition || null;
  const representativeEmail = activeApplicant?.representativeEmail || null;
  const representativeContactNumber = activeApplicant?.representativeContactNumber || null;
  const notes = activeApplicant?.notes || null;

  const formattedBirthDate = formatFullDateOfBirth(resolvedBirthDate);

  const hasApplicantData =
    resolvedFullName !== null ||
    Boolean(companyName) ||
    Boolean(representativeName) ||
    resolvedEmail.length > 0 ||
    resolvedContactNo.length > 0 ||
    resolvedAddress !== null ||
    resolvedSex !== null ||
    resolvedCivilStatus !== null ||
    resolvedNationality !== null ||
    formattedBirthDate !== null ||
    Boolean(notes);

  if (!hasApplicantData) {
    return null;
  }

  return (
    <SectionCard icon="user" title="Applicant Details" accentColor="#1D4ED8">
      {resolvedFullName !== null && (
        <SummaryRow
          label={applicantType === 'company' ? 'Applicant / Corporate Name' : 'Full Legal Name'}
          value={resolvedFullName}
        />
      )}
      {companyName ? (
        <SummaryRow label="Registered Business / Corporate Name" value={companyName} />
      ) : null}
      {registrationNumber ? (
        <SummaryRow label="SEC / DTI Registration No." value={registrationNumber} />
      ) : null}
      {companyAddress && companyAddress !== resolvedAddress ? (
        <SummaryRow label="Registered Business Address" value={companyAddress} />
      ) : null}
      {(companyEmail || companyContactNumber) ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {companyEmail ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Company Email" value={companyEmail} />
            </View>
          ) : null}
          {companyContactNumber ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Company Contact No." value={companyContactNumber} />
            </View>
          ) : null}
        </View>
      ) : null}
      {representativeName ? (
        <SummaryRow
          label="Authorized Representative / Liaison Officer"
          value={representativePosition ? `${representativeName} (${representativePosition})` : representativeName}
        />
      ) : null}
      {(representativeEmail || representativeContactNumber) ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {representativeEmail ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Representative Email" value={representativeEmail} />
            </View>
          ) : null}
          {representativeContactNumber ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Representative Contact" value={representativeContactNumber} />
            </View>
          ) : null}
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {resolvedEmail.length > 0 ? (
          <View style={{ flex: 1 }}>
            <SummaryRow label="Applicant Email Address" value={resolvedEmail} />
          </View>
        ) : null}
        {resolvedContactNo.length > 0 ? (
          <View style={{ flex: 1 }}>
            <SummaryRow label="Applicant Contact / Mobile" value={resolvedContactNo} />
          </View>
        ) : null}
      </View>
      {resolvedAddress !== null && (
        <SummaryRow label="Complete Residential / Office Address" value={resolvedAddress} />
      )}
      {applicantType !== 'company' && (
        <>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {formattedBirthDate !== null ? (
              <View style={{ flex: 1 }}>
                <SummaryRow label="Date of Birth" value={formattedBirthDate} />
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
        </>
      )}
      {notes ? <SummaryRow label="Special Notes / Remarks" value={notes} /> : null}
    </SectionCard>
  );
}
