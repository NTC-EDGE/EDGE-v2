import React from 'react';
import { View } from 'react-native';
import { VASProviderData } from '../../../certificates';
import { SectionCard } from './SectionCard';
import { SummaryRow } from './SummaryRow';

interface VasReviewCardProps {
  isCertificateService: boolean;
  serviceTitle: string;
  vasData?: VASProviderData | null;
  formFieldValues?: Array<{ fieldId: string; fieldLabel: string; value: string }>;
}

export function VasReviewCard({
  isCertificateService,
  serviceTitle,
  vasData,
  formFieldValues = [],
}: VasReviewCardProps) {
  const serviceTitleLower = serviceTitle.toLowerCase();
  const isVasService = isCertificateService && (serviceTitleLower.includes('vas') || serviceTitleLower.includes('value-added'));

  const findFieldValue = (keys: string[]): string => {
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      const match = formFieldValues.find(
        (fv) =>
          fv.fieldId.toLowerCase() === lowerKey ||
          fv.fieldLabel.toLowerCase().trim() === lowerKey ||
          fv.fieldLabel.toLowerCase().includes(lowerKey)
      );
      if (match?.value && match.value.trim()) {
        return match.value.trim();
      }
    }
    return '';
  };

  const corVasNo = vasData?.certificateNumber || findFieldValue(['corvasno', 'cor / vas no', 'certificate no']);
  const dateOfExpiry = findFieldValue(['dateofexpiry', 'date of expiry']);
  const serviceClass = vasData?.serviceType || findFieldValue(['serviceclassification', 'service']);
  const entityType = findFieldValue(['entitytype', 'type of entity', 'entity type']);
  const cpcnNo = vasData?.serviceNo || findFieldValue(['cpcnpacano', 'cpcn / pa / ca no', 'cpcn']);
  const cpcnExpiry = findFieldValue(['cpcndateofexpiry', 'cpcn / pa / ca date of expiry', 'cpcn date of expiry']);
  const knownOther = findFieldValue(['knownbyanothername', 'known by other name']);
  const otherName = vasData?.otherTradeName || findFieldValue(['othertradename', 'please specify']);
  const vasServices = vasData?.valueAddedServices && vasData.valueAddedServices.length > 0
    ? vasData.valueAddedServices.join(', ')
    : findFieldValue(['valueaddedservices', 'value added service']);
  const vasRegNo = findFieldValue(['vasregistrationno', 'vas registration']) || 'TO BE ASSIGNED BY NTC';

  const hasData =
    isVasService &&
    Boolean(
      corVasNo ||
      dateOfExpiry ||
      serviceClass ||
      entityType ||
      cpcnNo ||
      cpcnExpiry ||
      knownOther ||
      otherName ||
      vasServices ||
      vasData
    );

  if (!hasData) return null;

  return (
    <SectionCard icon="globe" title="VAS Provider Registration Particulars" accentColor="#0284C7">
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {entityType ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Type of Entity" value={entityType} />
            </View>
          ) : null}
          {serviceClass ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Service" value={serviceClass} />
            </View>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {corVasNo ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="COR / VAS No." value={corVasNo} />
            </View>
          ) : null}
          {dateOfExpiry ? (
            <View style={{ flex: 1 }}>
              <SummaryRow label="Date of Expiry" value={dateOfExpiry} />
            </View>
          ) : null}
        </View>

        {(cpcnNo || cpcnExpiry) ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {cpcnNo ? (
              <View style={{ flex: 1 }}>
                <SummaryRow label="CPCN / PA / CA No." value={cpcnNo} />
              </View>
            ) : null}
            {cpcnExpiry ? (
              <View style={{ flex: 1 }}>
                <SummaryRow label="CPCN Date of Expiry" value={cpcnExpiry} />
              </View>
            ) : null}
          </View>
        ) : null}

        {knownOther ? (
          <SummaryRow
            label="Known by other Name"
            value={knownOther === 'Yes' && otherName ? `Yes — ${otherName}` : knownOther}
          />
        ) : otherName ? (
          <SummaryRow label="Other Name / Trade Name" value={otherName} />
        ) : null}

        {vasServices ? (
          <SummaryRow label="Value Added Service(s)" value={vasServices} />
        ) : null}

        <SummaryRow
          label="VAS Registration"
          value="TO BE ASSIGNED BY NTC (Official NTC Assignment)"
        />
      </View>
    </SectionCard>
  );
}

