import React from 'react';
import { GeneralApplicantData } from '../../hooks/useGeneralServiceWizard';
import { ApplicantDetailsReviewCard as SharedApplicantDetailsReviewCard } from '../../../../../shared/formPreview';

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

export function ApplicantDetailsReviewCard(props: ApplicantDetailsReviewCardProps) {
  return <SharedApplicantDetailsReviewCard {...props} />;
}
