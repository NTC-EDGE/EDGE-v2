import { useMemo } from 'react';
import { useServiceForm } from '../../hooks/useServiceForm';
import { GeneralReviewSubmitStepProps } from './generalReviewTypes';
import { resolveServiceCategoryFlags, resolveApplicantParticulars } from './generalReviewResolvers';
import { buildDynamicSections } from '../../../../../shared/formPreview/core/buildDynamicSections';
import { isExamEducationField, isExamAssistanceField } from '../../../../../shared/formPreview/core/formPreviewFieldCheckers';
import { getPreviewExtension } from '../../../../../shared/formPreview/extensions';

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

  const extension = useMemo(() => getPreviewExtension(service), [service]);

  const { dynamicSectionsToRender, remainingFields } = useMemo(() => {
    return buildDynamicSections(form, particulars.formFieldValues, {
      isAmateurCertService: categoryFlags.isAmateurCertService,
      skipFieldIds: extension?.skipFieldIds,
      skipFieldLabels: extension?.skipFieldLabels,
    });
  }, [form, particulars.formFieldValues, categoryFlags.isAmateurCertService, extension]);

  const examEducationFields = useMemo(() => {
    if (!categoryFlags.isExamService) return [];
    return remainingFields.filter((f) => isExamEducationField(f.fieldLabel, f.fieldId));
  }, [categoryFlags.isExamService, remainingFields]);

  const examAssistanceFields = useMemo(() => {
    if (!categoryFlags.isExamService) return [];
    return remainingFields.filter((f) => isExamAssistanceField(f.fieldLabel, f.fieldId));
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
