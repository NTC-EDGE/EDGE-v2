import React from 'react';
import { View } from 'react-native';
import { CopyOfPermitData } from '../../../permits';
import { SectionCard, SummaryRow } from '../../../../../shared/formPreview';

interface CopyOfPermitReviewCardProps {
  isPermitService: boolean;
  serviceTitle: string;
  copyOfPermit?: CopyOfPermitData | null;
  formFieldValues?: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  selectedVariantName?: string;
}

export function CopyOfPermitReviewCard({
  isPermitService,
  serviceTitle,
  copyOfPermit,
  formFieldValues = [],
  selectedVariantName,
}: CopyOfPermitReviewCardProps) {
  const isCopyOfPermitService =
    isPermitService && serviceTitle.toLowerCase().includes('copy');
  if (!isCopyOfPermitService) return null;

  const getFv = (fieldKey: string) => {
    const k = fieldKey.toLowerCase();
    const found = formFieldValues.find(
      (f) => f.fieldId.toLowerCase() === k || f.fieldLabel.toLowerCase() === k
    );
    return found?.value;
  };

  const copyType =
    copyOfPermit?.copyType === "DUPLICATE"
      ? "Duplicate Copy"
      : copyOfPermit?.copyType === "CERTIFIED_TRUE_COPY"
      ? "Certified True Copy"
      : getFv('copyType') || getFv('Copy Type') || selectedVariantName;

  const detailsService =
    copyOfPermit?.detailsService ||
    getFv('detailsService') ||
    getFv('DetailsService') ||
    getFv('details_service');

  const type =
    copyOfPermit?.targetPermitType ||
    getFv('targetPermitType') ||
    getFv('Type') ||
    getFv('target_permit_type');

  const permitNo =
    copyOfPermit?.permitNo ||
    getFv('permitNo') ||
    getFv('Permit no.') ||
    getFv('permit_no');

  const numberOfCopies =
    copyOfPermit?.numberOfCopies ||
    getFv('noOfCopies') ||
    getFv('No. of Copies') ||
    getFv('no_of_copies');

  const circumstances =
    copyOfPermit?.circumstances ||
    getFv('circumstances') ||
    getFv('Circumstances Relating to Lost/Mutilation of Permit/License/Certificate') ||
    getFv('Circumstances of Loss/Damage');

  return (
    <SectionCard icon="copy" title="Copy of Permit Details" accentColor="#D97706">
      <View style={{ gap: 4 }}>
        {copyType ? <SummaryRow label="Copy Type" value={copyType} /> : null}
        {detailsService ? <SummaryRow label="DetailsService" value={detailsService} /> : null}
        {type ? <SummaryRow label="Type" value={type} /> : null}
        {permitNo ? <SummaryRow label="Permit no." value={permitNo} /> : null}
        {numberOfCopies && copyType !== "Duplicate Copy" ? (
          <SummaryRow label="No. of Copies" value={numberOfCopies} />
        ) : null}
        {circumstances ? (
          <SummaryRow label="Circumstances of Loss/Damage" value={circumstances} />
        ) : null}
      </View>
    </SectionCard>
  );
}
