import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { TYPOGRAPHY, Icon } from '@edge/ui';
import { GeneralApplicantData } from '../../hooks/useGeneralServiceWizard';
import { SectionCard } from '../../../../../shared/formPreview';
import { getApplicantDisplayName } from '../../helpers/applicantDisplayHelper';

interface BulkCohortReviewCardProps {
  appMode: 'SINGLE' | 'BULK' | '';
  applicants?: GeneralApplicantData[];
  currentApplicantIndex?: number;
  onSelectApplicant?: (idx: number) => void;
}

export function BulkCohortReviewCard({
  appMode,
  applicants = [],
  currentApplicantIndex = 0,
  onSelectApplicant,
}: BulkCohortReviewCardProps) {
  if (appMode !== 'BULK' || applicants.length === 0) {
    return null;
  }

  const activeApplicant = applicants[currentApplicantIndex] || applicants[0];
  const displayName = getApplicantDisplayName(activeApplicant, currentApplicantIndex + 1);

  return (
    <SectionCard icon="users" title="Group Application Cohort" accentColor="#0F2C59">
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: '#64748B' }}>
            Cohort Size: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{applicants.length} applicants</Text>
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="user-check" size={14} color="#16A34A" />
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
              Applicant {currentApplicantIndex + 1}: {displayName}
            </Text>
          </View>
        </View>

        {applicants.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
            {applicants.map((app, idx) => {
              const isSelected = idx === currentApplicantIndex;
              const name = getApplicantDisplayName(app, idx + 1);
              return (
                <TouchableOpacity
                  key={`cohort-app-${app.id || idx}`}
                  onPress={() => onSelectApplicant?.(idx)}
                  disabled={!onSelectApplicant}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                    borderWidth: 1,
                    borderColor: isSelected ? '#3B82F6' : '#E2E8F0',
                  }}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={isSelected ? 'user-check' : 'user'}
                    size={12}
                    color={isSelected ? '#1D4ED8' : '#64748B'}
                  />
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.fonts.primary,
                      fontSize: 12,
                      fontWeight: isSelected ? '700' : '500',
                      color: isSelected ? '#1D4ED8' : '#334155',
                    }}
                  >
                    #{idx + 1} {name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SectionCard>
  );
}
