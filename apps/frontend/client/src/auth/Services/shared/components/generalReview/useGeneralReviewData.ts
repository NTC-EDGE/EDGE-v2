import { useMemo } from 'react';
import { useServiceForm } from '../../hooks/useServiceForm';
import { GeneralReviewSubmitStepProps, DynamicSectionGroup } from './generalReviewTypes';
import { resolveServiceCategoryFlags, resolveApplicantParticulars } from './generalReviewResolvers';
import { buildDynamicSectionsToRender, filterRemainingReviewFields } from './dynamicSectionsBuilder';

export function useGeneralReviewData(props: GeneralReviewSubmitStepProps) {
  const {
    service,
    tenants,
    offices,
    selectedRegionId,
    selectedOfficeId,
    activeApplicant,
    appMode,
    variants = [],
    schedules = [],
    selectedScheduleId = null,
  } = props;

  const { form } = useServiceForm(service.id, activeApplicant.selectedVariantId);
  const categoryFlags = useMemo(() => resolveServiceCategoryFlags(service), [service]);
  const particulars = useMemo(() => resolveApplicantParticulars(activeApplicant), [activeApplicant]);

  const regionName =
    tenants.find((t) => t.id === selectedRegionId)?.name ||
    selectedRegionId ||
    'NTC Central / Regional Jurisdiction';

  const officeName =
    offices.find((o) => o.id === selectedOfficeId)?.name ||
    selectedOfficeId ||
    'Main Processing Office';

  const matchedSchedule = schedules.find((s) => s.id === selectedScheduleId);
  const scheduleSummaryText = matchedSchedule
    ? [
        matchedSchedule.scheduledDate,
        [matchedSchedule.startTime, matchedSchedule.endTime].filter(Boolean).join(' - '),
        matchedSchedule.venue,
      ]
        .filter(Boolean)
        .join(' • ')
    : null;

  const selectedVariant = variants.find((v) => v.id === activeApplicant.selectedVariantId);
  const variantDesc = selectedVariant?.description?.trim() || selectedVariant?.name?.trim() || '';
  const variantType =
    selectedVariant?.type &&
    typeof selectedVariant.type === 'string' &&
    selectedVariant.type.toUpperCase() !== 'NA' &&
    selectedVariant.type.toUpperCase() !== 'N/A'
      ? selectedVariant.type.toUpperCase()
      : '';

  const variantLabel =
    variantDesc.length > 0 && variantType.length > 0
      ? variantDesc.toUpperCase().includes(`(${variantType})`)
        ? variantDesc
        : `${variantDesc} (${variantType})`
      : variantDesc || activeApplicant.selectedVariantId || 'Standard';

  const appModeLabel =
    appMode === 'SINGLE' ? 'Single Applicant' : appMode === 'BULK' ? 'Bulk / Group Filing' : '—';

  const renderedFieldIds = useMemo(() => new Set<string>(), [particulars.formFieldValues]);

  const dynamicSectionsToRender: DynamicSectionGroup[] = useMemo(() => {
    return buildDynamicSectionsToRender(form, particulars.formFieldValues, renderedFieldIds, categoryFlags.isAmateurCertService);
  }, [form, particulars.formFieldValues, renderedFieldIds, categoryFlags.isAmateurCertService]);

  const remainingFields = useMemo(() => {
    return filterRemainingReviewFields(particulars.formFieldValues, renderedFieldIds, categoryFlags.isAmateurCertService);
  }, [particulars.formFieldValues, renderedFieldIds, categoryFlags.isAmateurCertService]);

  const examEducationFields = useMemo(() => {
    if (!categoryFlags.isExamService) return [];
    return remainingFields.filter(
      (f) =>
        f.fieldLabel.toLowerCase().includes('school') ||
        f.fieldLabel.toLowerCase().includes('course') ||
        f.fieldLabel.toLowerCase().includes('degree') ||
        f.fieldLabel.toLowerCase().includes('education') ||
        f.fieldLabel.toLowerCase().includes('attainment') ||
        f.fieldLabel.toLowerCase().includes('graduated') ||
        f.fieldLabel.toLowerCase().includes('year')
    );
  }, [categoryFlags.isExamService, remainingFields]);

  const examAssistanceFields = useMemo(() => {
    if (!categoryFlags.isExamService) return [];
    return remainingFields.filter(
      (f) =>
        f.fieldLabel.toLowerCase().includes('assist') ||
        f.fieldLabel.toLowerCase().includes('special') ||
        f.fieldLabel.toLowerCase().includes('pwd') ||
        f.fieldLabel.toLowerCase().includes('accommodat') ||
        f.fieldLabel.toLowerCase().includes('needs')
    );
  }, [categoryFlags.isExamService, remainingFields]);

  return {
    ...categoryFlags,
    ...particulars,
    regionName,
    officeName,
    scheduleSummaryText,
    variantLabel,
    appModeLabel,
    dynamicSectionsToRender,
    remainingFields,
    examEducationFields,
    examAssistanceFields,
  };
}
