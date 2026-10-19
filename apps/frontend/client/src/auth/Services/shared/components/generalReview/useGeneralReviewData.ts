import { useMemo } from 'react';
import { useServiceForm } from '../../hooks/useServiceForm';
import { GeneralReviewSubmitStepProps } from './generalReviewTypes';
import { resolveServiceCategoryFlags, resolveApplicantParticulars } from './generalReviewResolvers';
import { buildDynamicSections } from '../../../../../shared/formPreview/core/buildDynamicSections';
import { isExamEducationField, isExamAssistanceField } from '../../../../../shared/formPreview/core/formPreviewFieldCheckers';
import { getPreviewExtension } from '../../../../../shared/formPreview/extensions';
import { computePermitFees } from '../../../permits';

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

  const selectedVariant = variants.find(
    (v) => String(v.id).toLowerCase() === String(activeApplicant.selectedVariantId || '').toLowerCase()
  );
  const variantDesc = selectedVariant?.description?.trim() || selectedVariant?.name?.trim() || '';
  const variantType =
    selectedVariant?.type &&
    typeof selectedVariant.type === 'string' &&
    selectedVariant.type.toUpperCase() !== 'NA' &&
    selectedVariant.type.toUpperCase() !== 'N/A'
      ? selectedVariant.type.toUpperCase()
      : '';

  const isUuid = (val?: string | null) =>
    Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim()));

  const fallbackVariantName =
    activeApplicant.selectedVariantName && !isUuid(activeApplicant.selectedVariantName)
      ? activeApplicant.selectedVariantName.trim()
      : activeApplicant.selectedElementTitle && !isUuid(activeApplicant.selectedElementTitle)
      ? activeApplicant.selectedElementTitle.trim()
      : activeApplicant.selectedVariantId && !isUuid(activeApplicant.selectedVariantId)
      ? activeApplicant.selectedVariantId.trim()
      : 'Standard';

  const variantLabel =
    variantDesc.length > 0 && variantType.length > 0
      ? variantDesc.toUpperCase().includes(`(${variantType})`)
        ? variantDesc
        : `${variantDesc} (${variantType})`
      : variantDesc || fallbackVariantName;

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

  const permitFeeComputation = useMemo(() => {
    if (!categoryFlags.isPermitService) return null;

    const matchedVariantObj = variants.find(
      (v) => String(v.id).toLowerCase() === String(activeApplicant.selectedVariantId || '').toLowerCase()
    );

    const appType =
      activeApplicant.permitData?.applicationType ||
      matchedVariantObj?.description ||
      matchedVariantObj?.name ||
      activeApplicant.selectedVariantName ||
      '';

    const element =
      activeApplicant.permitData?.stationClass ||
      activeApplicant.selectedElementTitle ||
      '';

    let unitCount = 1;
    if (activeApplicant.permitData) {
      const p = activeApplicant.permitData;
      if (Array.isArray(p.purchaseEquipments) && p.purchaseEquipments.length > 0) {
        unitCount = p.purchaseEquipments.length;
      } else if (Array.isArray(p.equipments) && p.equipments.length > 0) {
        unitCount = p.equipments.length;
      } else if (Array.isArray(p.stationParticulars) && p.stationParticulars.length > 0) {
        unitCount = p.stationParticulars.length;
      }
    }

    return computePermitFees({
      activity: service.title,
      applicationType: appType,
      element,
      validityYears: 1,
      noOfUnits: unitCount,
      asOfDate: new Date(),
    });
  }, [
    categoryFlags.isPermitService,
    service.title,
    variants,
    activeApplicant.selectedVariantId,
    activeApplicant.selectedVariantName,
    activeApplicant.selectedElementTitle,
    activeApplicant.permitData,
  ]);

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
    permitFeeComputation,
  };
}

