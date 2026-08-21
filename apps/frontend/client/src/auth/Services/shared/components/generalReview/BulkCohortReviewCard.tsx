import React from 'react';
import { View, Text } from 'react-native';
import { TYPOGRAPHY, Icon } from '@edge/ui';
import { GeneralApplicantData } from '../../hooks/useGeneralServiceWizard';
import { SectionCard } from '../../../../../shared/formPreview';

interface BulkCohortReviewCardProps {
  appMode: 'SINGLE' | 'BULK' | '';
  applicants?: GeneralApplicantData[];
  currentApplicantIndex?: number;
}

export function BulkCohortReviewCard({
  appMode,
  applicants = [],
  currentApplicantIndex = 0,
}: BulkCohortReviewCardProps) {
  if (appMode !== 'BULK' || applicants.length === 0) {
    return null;
  }

  const activeApplicant = applicants[currentApplicantIndex] || applicants[0];

  return (
    <SectionCard icon="users" title="Group Application Cohort" accentColor="#0F2C59">
      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: '#64748B' }}>
          Displaying review data for applicant {currentApplicantIndex + 1} of {applicants.length}:
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="user-check" size={14} color="#16A34A" />
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
            {[activeApplicant?.firstName, activeApplicant?.lastName].filter(Boolean).join(' ') || 'Unnamed Applicant'}
          </Text>
        </View>
      </View>
    </SectionCard>
  );
}
