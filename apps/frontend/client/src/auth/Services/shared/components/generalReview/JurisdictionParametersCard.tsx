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

export function isRedundantApplicationType(
  variantLabel: string | undefined | null,
  appTypeLabel: string | undefined | null
): boolean {
  if (!appTypeLabel || !appTypeLabel.trim()) return true;
  if (!variantLabel || !variantLabel.trim()) return false;
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const vNorm = norm(variantLabel);
  const aNorm = norm(appTypeLabel);
  if (!aNorm) return true;
  if (!vNorm) return false;
  return vNorm === aNorm || vNorm.includes(aNorm);
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

  const rawAppType = applicationTypeLabel && applicationTypeLabel.trim().length > 0
    ? applicationTypeLabel.trim()
    : activeApplicant.examineeType && activeApplicant.examineeType.trim().length > 0
    ? activeApplicant.examineeType.trim()
    : null;

  const effectiveAppType = isRedundantApplicationType(variantLabel, rawAppType) ? null : rawAppType;
  const effectiveExamineeType =
    isExamService &&
    activeApplicant.examineeType &&
    !isRedundantApplicationType(variantLabel, activeApplicant.examineeType)
      ? activeApplicant.examineeType
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
        {effectiveExamineeType ? (
          <SummaryRow label="Examinee Classification" value={effectiveExamineeType} />
        ) : null}
        {effectiveAppType && !effectiveExamineeType ? (
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
