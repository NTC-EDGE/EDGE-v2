import { useMemo } from 'react';
import { useServiceForm } from '../../hooks/useServiceForm';
import { GeneralReviewSubmitStepProps } from './generalReviewTypes';
import { resolveServiceCategoryFlags, resolveApplicantParticulars } from './generalReviewResolvers';
import { buildDynamicSections } from '../../../../../shared/formPreview/core/buildDynamicSections';
import { isExamEducationField, isExamAssistanceField } from '../../../../../shared/formPreview/core/formPreviewFieldCheckers';
import { getPreviewExtension } from '../../../../../shared/formPreview/extensions';
import { computePermitFees } from '../../../permits';
import { calculateLicenseFee } from '../../../licenses';
import { calculateRequestFee } from '../../../requests';

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

    // For Copy of Permits (Certified True Copy), statutory fees are assessed by the evaluator
    // upon review of records, so no fee computation should appear in the application summary preview.
    const appTypeLower = appType.toLowerCase();
    const copyOfPermit = activeApplicant.copyOfPermitData;
    const copyType = typeof copyOfPermit?.copyType === 'string'
      ? copyOfPermit.copyType.toLowerCase()
      : '';

    const isDuplicate =
      appTypeLower.includes('duplicate') ||
      copyType === 'duplicate' ||
      (typeof activeApplicant.selectedVariantId === 'string' &&
        activeApplicant.selectedVariantId.toLowerCase().includes('151'));

    const isCertifiedTrueCopy =
      categoryFlags.isCopyOfPermitService &&
      (!isDuplicate ||
        copyType === 'certified_true_copy' ||
        appTypeLower.includes('certified true copy') ||
        appTypeLower.includes('true copy') ||
        appTypeLower.includes('ctc') ||
        (typeof activeApplicant.selectedVariantId === 'string' &&
          activeApplicant.selectedVariantId.toLowerCase().includes('150')));

    if (isCertifiedTrueCopy) {
      return null;
    }

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

    const copiesVal =
      activeApplicant.copyOfPermitData?.numberOfCopies ||
      activeApplicant.formFieldValues?.find(
        (f) =>
          f.fieldId === 'no_of_copies' ||
          f.fieldId === 'noOfCopies' ||
          f.fieldLabel?.toLowerCase().includes('copies')
      )?.value ||
      1;
    const copies = parseInt(String(copiesVal), 10) || 1;

    return computePermitFees({
      activity: service.title,
      applicationType: appType,
      element,
      validityYears: 1,
      noOfUnits: unitCount,
      noOfCopies: copies,
      asOfDate: new Date(),
    });
  }, [
    categoryFlags.isPermitService,
    categoryFlags.isCopyOfPermitService,
    service.title,
    variants,
    activeApplicant.selectedVariantId,
    activeApplicant.selectedVariantName,
    activeApplicant.selectedElementTitle,
    activeApplicant.permitData,
    activeApplicant.copyOfPermitData,
    activeApplicant.formFieldValues,
  ]);

  const licenseFeeComputation = useMemo(() => {
    if (!categoryFlags.isLicenseService) return null;

    const matchedVariantObj = variants.find(
      (v) => String(v.id).toLowerCase() === String(activeApplicant.selectedVariantId || '').toLowerCase()
    );

    const appType =
      activeApplicant.amateurLicenseData?.appType ||
      activeApplicant.lifetimeLicenseData?.appType ||
      matchedVariantObj?.description ||
      matchedVariantObj?.name ||
      activeApplicant.selectedVariantName ||
      '';

    // For Copy of Licenses (Certified True Copy), statutory fees are assessed by the evaluator
    // upon review of records, so no fee computation should appear in the application summary preview.
    const sLower = typeof service.title === 'string' ? service.title.toLowerCase() : '';
    const appTypeLower = appType.toLowerCase();
    const copyOfCert = activeApplicant.copyOfCertData;
    const copyType = typeof copyOfCert?.copyType === 'string'
      ? copyOfCert.copyType.toLowerCase()
      : '';

    const isLicenseCtc =
      (sLower.includes('copy') || appTypeLower.includes('copy')) &&
      (copyType === 'certified_true_copy' ||
        appTypeLower.includes('certified true copy') ||
        appTypeLower.includes('true copy') ||
        appTypeLower.includes('ctc'));

    if (isLicenseCtc) {
      return null;
    }

    const element =
      activeApplicant.amateurLicenseData?.classOfStation ||
      activeApplicant.selectedElementTitle ||
      '';

    let unitCount = 1;
    let validityYears = 1;
    let expirationDate: string | Date | null = null;

    if (activeApplicant.amateurLicenseData) {
      const a = activeApplicant.amateurLicenseData;
      if (a.noOfYears) {
        const parsedYrs = parseInt(a.noOfYears, 10);
        if (!isNaN(parsedYrs) && parsedYrs > 0) {
          validityYears = parsedYrs;
        }
      }
      if (a.dateOfExpiry) {
        expirationDate = a.dateOfExpiry;
      }
      if (Array.isArray(a.particularsEquipment) && a.particularsEquipment.length > 0) {
        let totalEquip = 0;
        for (const grp of a.particularsEquipment) {
          if (Array.isArray(grp.equipments)) {
            totalEquip += grp.equipments.length;
          }
        }
        if (totalEquip > 0) {
          unitCount = totalEquip;
        }
      }
    } else if (activeApplicant.lifetimeLicenseData) {
      validityYears = 1;
      if (activeApplicant.lifetimeLicenseData.licenseExpiryDate) {
        expirationDate = activeApplicant.lifetimeLicenseData.licenseExpiryDate;
      }
    }

    return calculateLicenseFee({
      serviceName: service.title,
      serviceCategory: service.category,
      applicationType: appType,
      variantName: matchedVariantObj?.name || activeApplicant.selectedVariantName,
      element,
      validityYears,
      noOfUnits: unitCount,
      expirationDate,
      asOfDate: new Date(),
    });
  }, [
    categoryFlags.isLicenseService,
    service.title,
    service.category,
    variants,
    activeApplicant.selectedVariantId,
    activeApplicant.selectedVariantName,
    activeApplicant.selectedElementTitle,
    activeApplicant.amateurLicenseData,
    activeApplicant.lifetimeLicenseData,
    activeApplicant.copyOfCertData,
    activeApplicant.formFieldValues,
  ]);

  const requestFeeComputation = useMemo(() => {
    if (!categoryFlags.isRequestOrComplaintService) return null;

    const matchedVariantObj = variants.find(
      (v) => String(v.id).toLowerCase() === String(activeApplicant.selectedVariantId || '').toLowerCase()
    );

    const appType =
      matchedVariantObj?.description ||
      matchedVariantObj?.name ||
      activeApplicant.selectedVariantName ||
      service.title;

    return calculateRequestFee({
      serviceName: service.title,
      serviceCategory: service.category,
      applicationType: appType,
      variantName: matchedVariantObj?.name || activeApplicant.selectedVariantName,
      element: activeApplicant.selectedElementTitle,
    });
  }, [
    categoryFlags.isRequestOrComplaintService,
    service.title,
    service.category,
    variants,
    activeApplicant.selectedVariantId,
    activeApplicant.selectedVariantName,
    activeApplicant.selectedElementTitle,
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
    licenseFeeComputation,
    requestFeeComputation,
  };
}

