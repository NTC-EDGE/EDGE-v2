import { useMemo } from 'react';
import { Application } from '../../data/applicationsData';
import { buildDynamicSections } from '../../../../shared/formPreview/core/buildDynamicSections';
import {
  isExamEducationField,
  isExamAssistanceField,
} from '../../../../shared/formPreview/core/formPreviewFieldCheckers';
import { getPreviewExtension } from '../../../../shared/formPreview/extensions';

export function useDynamicFormSections(
  form: { sections?: Array<{ id?: string; key?: string; title?: string; fields?: Array<{ id?: string; fieldId?: string; label?: string }> }> } | null | undefined,
  formFieldValues: Array<{ fieldId: string; fieldLabel: string; value: string }>,
  app: Application
) {
  const serviceCategoryLower = (app.serviceCategory || '').toLowerCase().trim();
  const serviceTitleLower = (app.serviceName || '').toLowerCase().trim();

  const isExamService =
    serviceCategoryLower.includes('exam') ||
    serviceTitleLower.includes('exam') ||
    serviceTitleLower.includes('admission') ||
    serviceTitleLower.includes('operator examination');

  const isAmateurCert =
    serviceCategoryLower.includes('amateur') ||
    serviceTitleLower.includes('amateur') ||
    serviceTitleLower.includes('ntc 1-03') ||
    serviceTitleLower.includes('ntc_1_03') ||
    (app.serviceId || '').toLowerCase().includes('103');

  const isVasCert =
    serviceCategoryLower.includes('vas') ||
    serviceTitleLower.includes('vas') ||
    serviceTitleLower.includes('value-added') ||
    serviceTitleLower.includes('ntc 1-20') ||
    serviceTitleLower.includes('ntc_1_20') ||
    (app.serviceId || '').toLowerCase().includes('120') ||
    (app.serviceId || '').toLowerCase().includes('f20');

  const extension = useMemo(
    () =>
      getPreviewExtension({
        id: app.serviceId || '',
        title: app.serviceName || '',
        category: app.serviceCategory || '',
      }),
    [app.serviceId, app.serviceName, app.serviceCategory]
  );

  const { dynamicSectionsToRender, remainingFields } = useMemo(() => {
    return buildDynamicSections(form, formFieldValues, {
      isAmateurCertService: isAmateurCert,
      isVasCertService: isVasCert,
      skipFieldIds: extension?.skipFieldIds,
      skipFieldLabels: extension?.skipFieldLabels,
    });
  }, [form, formFieldValues, isAmateurCert, isVasCert, extension]);

  const { declarations, signatures } = useMemo(() => {
    const decs: Array<{ fieldId: string; fieldLabel: string; value: string }> = [];
    const sigs: Array<{ fieldId: string; fieldLabel: string; value: string }> = [];

    for (const field of formFieldValues) {
      if (!field.value || field.value.trim() === '') continue;
      const val = field.value.trim();
      const valLower = val.toLowerCase();
      const labelLower = (field.fieldLabel || field.fieldId).toLowerCase();

      const isSig =
        labelLower.includes('signature') ||
        val.startsWith('data:image') ||
        val.startsWith('typed:cursive:') ||
        val.startsWith('blob:');
      const isDec =
        !isSig &&
        (labelLower.includes('declare') ||
          labelLower.includes('certify') ||
          labelLower.includes('agreement') ||
          labelLower.includes('declaration') ||
          labelLower.includes('affirm') ||
          valLower === 'true' ||
          valLower === 'false' ||
          valLower === 'agreed' ||
          valLower === 'yes' ||
          valLower === 'no');

      if (isSig) {
        sigs.push(field);
      } else if (isDec) {
        decs.push(field);
      }
    }

    return { declarations: decs, signatures: sigs };
  }, [formFieldValues]);

  const examEducationFields = useMemo(() => {
    if (!isExamService) return [];
    return remainingFields.filter((f) => isExamEducationField(f.fieldLabel, f.fieldId));
  }, [isExamService, remainingFields]);

  const examAssistanceFields = useMemo(() => {
    if (!isExamService) return [];
    return remainingFields.filter((f) => isExamAssistanceField(f.fieldLabel, f.fieldId));
  }, [isExamService, remainingFields]);

  const nonExamRemainingFields = useMemo(() => {
    if (isExamService) return [];
    return remainingFields.filter(
      (f) =>
        !examEducationFields.some((ef) => ef.fieldId === f.fieldId) &&
        !examAssistanceFields.some((af) => af.fieldId === f.fieldId)
    );
  }, [isExamService, remainingFields, examEducationFields, examAssistanceFields]);

  return {
    isExamService,
    dynamicSectionsToRender,
    remainingSpecs: remainingFields,
    declarations,
    signatures,
    examEducationFields,
    examAssistanceFields,
    nonExamRemainingFields,
  };
}
