import React from 'react';
import { View } from 'react-native';
import { NTCService } from '../../../data/servicesData';
import { GeneralApplicantData } from '../../hooks/useGeneralServiceWizard';
import { SectionCard, SummaryRow } from '../../../../../shared/formPreview';

interface JurisdictionParametersCardProps {
  service: NTCService;
  isExamService: boolean;
  regionName: string;
  officeName: string;
  activeApplicant: GeneralApplicantData;
  appModeLabel: string;
  variantLabel: string;
  scheduleSummaryText: string | null;
  applicationTypeLabel?: string | null;
  elementsLabel?: string | null;
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
  applicationTypeLabel,
  elementsLabel,
}: JurisdictionParametersCardProps) {
  const effectiveElements = elementsLabel && elementsLabel.trim().length > 0
    ? elementsLabel.trim()
    : activeApplicant.selectedElementTitle && activeApplicant.selectedElementTitle.trim().length > 0
    ? activeApplicant.selectedElementTitle.trim()
    : null;

  const effectiveAppType = applicationTypeLabel && applicationTypeLabel.trim().length > 0
    ? applicationTypeLabel.trim()
    : activeApplicant.examineeType && activeApplicant.examineeType.trim().length > 0
    ? activeApplicant.examineeType.trim()
    : null;

  return (
    <SectionCard icon="sliders" title="Application & Service Parameters" accentColor="#0F2C59">
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <SummaryRow label="Selected Service" value={service.title} />
          </View>
          <View style={{ flex: 1 }}>
            <SummaryRow label="Service Category" value={service.category || 'Standard Licensing'} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <SummaryRow label="Regional Office Jurisdiction" value={regionName} />
          </View>
          <View style={{ flex: 1 }}>
            <SummaryRow label="Processing Office / Branch" value={officeName} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <SummaryRow label="Variant" value={variantLabel} />
          </View>
          <View style={{ flex: 1 }}>
            <SummaryRow label="Filing Mode" value={appModeLabel} />
          </View>
        </View>
        {isExamService && activeApplicant.examineeType ? (
          <SummaryRow label="Examinee Classification" value={activeApplicant.examineeType} />
        ) : null}
        {effectiveAppType && (!isExamService || !activeApplicant.examineeType) ? (
          <SummaryRow label="Application Type" value={effectiveAppType} />
        ) : null}
        {effectiveElements ? (
          <SummaryRow
            label={isExamService ? 'Selected Examination Element(s)' : 'Selected Element(s)'}
            value={effectiveElements}
          />
        ) : null}
        {scheduleSummaryText ? (
          <SummaryRow
            label={isExamService ? 'Assigned Examination Schedule & Venue' : 'Assigned Schedule'}
            value={scheduleSummaryText}
          />
        ) : null}
      </View>
    </SectionCard>
  );
}
