import React from 'react';
import { View, Text } from 'react-native';
import { TYPOGRAPHY } from '@edge/ui';
import { GeneralApplicantData } from '../../hooks/useGeneralServiceWizard';
import { getApplicantDisplayName } from '../../helpers/applicantDisplayHelper';
import { SectionCard } from './SectionCard';

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
  if (appMode !== 'BULK' || !applicants || applicants.length === 0) {
    return null;
  }

  return (
    <SectionCard
      icon="users"
      title={`Bulk Application Group Cohort (${applicants.length} Applicants)`}
      accentColor="#0284C7"
    >
      <View style={{ gap: 8 }}>
        {applicants.map((app, idx) => {
          const appName = getApplicantDisplayName(app, idx + 1);
          const docCount = Object.keys(app.uploads || {}).length;
          const isSelected = idx === currentApplicantIndex;

          return (
            <View
              key={app.id || idx}
              style={{
                backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                borderWidth: 1,
                borderColor: isSelected ? '#93C5FD' : '#E2E8F0',
                borderRadius: 10,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: TYPOGRAPHY.fonts.primary,
                    fontSize: 13,
                    fontWeight: '700',
                    color: '#0F2C59',
                  }}
                >
                  {idx + 1}. {appName} {isSelected ? '(Active Review)' : ''}
                </Text>
                <Text
                  style={{
                    fontFamily: TYPOGRAPHY.fonts.primary,
                    fontSize: 11,
                    color: '#64748B',
                    marginTop: 2,
                  }}
                >
                  {app.email || 'No Email'} • {app.contactNo || 'No Contact'} • {docCount} attached file{docCount !== 1 ? 's' : ''}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: '#DCFCE7',
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: TYPOGRAPHY.fonts.primary,
                    fontSize: 11,
                    fontWeight: '700',
                    color: '#166534',
                  }}
                >
                  Cohort Member
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </SectionCard>
  );
}
