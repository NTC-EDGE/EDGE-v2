import React from 'react';
import { View } from 'react-native';
import { NTCService } from '../../../data/servicesData';
import { GeneralApplicantData } from '../../hooks/useGeneralServiceWizard';
import { SectionCard } from './SectionCard';
import { SummaryRow } from './SummaryRow';

interface JurisdictionParametersCardProps {
  service: NTCService;
  isExamService: boolean;
  regionName: string;
  officeName: string;
  activeApplicant: GeneralApplicantData;
  appModeLabel: string;
  variantLabel: string;
  scheduleSummaryText?: string | null;
}

export function JurisdictionParametersCard({
  service,
  isExamService,
  regionName,
  officeName,
  activeApplicant,
  appModeLabel,
  variantLabel,
  scheduleSummaryText,
}: JurisdictionParametersCardProps) {
  const applicantClassification =
    activeApplicant.applicantType === 'company'
      ? activeApplicant.companyName
        ? `Company / Corporation (${activeApplicant.companyName})`
        : 'Company / Corporation'
      : 'Individual Applicant';

  return (
    <SectionCard
      icon={isExamService ? 'file-text' : 'layers'}
      title={isExamService ? 'Examination Details' : 'Service & Jurisdiction Parameters'}
      accentColor="#0F2C59"
    >
      <SummaryRow label="Service Name" value={service.title} />
      {service.category ? <SummaryRow label="Service Category" value={service.category} /> : null}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <SummaryRow label="Target Region" value={regionName} />
        </View>
        <View style={{ flex: 1 }}>
          <SummaryRow label="Field Office" value={officeName} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <SummaryRow label="Applicant Classification" value={applicantClassification} />
        </View>
        <View style={{ flex: 1 }}>
          <SummaryRow label="Filing Mode" value={appModeLabel} />
        </View>
      </View>
      <SummaryRow label="Application Variant / Type" value={variantLabel} />
      {activeApplicant.selectedElementTitle ? (
        <SummaryRow label="Selected Element / Category" value={activeApplicant.selectedElementTitle} />
      ) : null}
      {scheduleSummaryText ? (
        <SummaryRow label="Exam Schedule & Venue" value={scheduleSummaryText} />
      ) : null}
    </SectionCard>
  );
}
