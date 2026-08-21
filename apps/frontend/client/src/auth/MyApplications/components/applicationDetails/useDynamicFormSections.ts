import { useMemo } from 'react';
import { Icon } from '@edge/ui';
import { Application } from '../../data/applicationsData';
import {
  isUnrelatedSection,
  isRemovedAmateurSection,
  isApplicantParticularField,
  isSignatureOrDeclarationField,
  isJurisdictionOrVariantField,
  isRemovedAmateurField,
  isRemovedVasField,
  isExamEducationField,
  isExamAssistanceField,
  getSectionIcon,
  getSectionAccentColor,
} from './applicationDetailsHelpers';

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

  const renderedFieldIds = useMemo(() => new Set<string>(), [formFieldValues]);

  // 1. Build Structured Dynamic Form Sections
  const dynamicSectionsToRender = useMemo(() => {
    if (!form?.sections || !Array.isArray(form.sections) || form.sections.length === 0) return [];
    const result: Array<{
      id: string;
      title: string;
      icon: React.ComponentProps<typeof Icon>['name'];
      accentColor: string;
      fields: Array<{ fieldId: string; label: string; value: string }>;
    }> = [];

    form.sections.forEach((section, sIdx) => {
      const sectionKey = section.key || section.id || '';
      const sectionTitle = section.title || `Section ${sIdx + 1}`;

      if (
        isUnrelatedSection(sectionTitle) ||
        isUnrelatedSection(sectionKey) ||
        (isAmateurCert && (isRemovedAmateurSection(sectionTitle) || isRemovedAmateurSection(sectionKey)))
      ) {
        (section.fields || []).forEach((field) => {
          if (field.fieldId) renderedFieldIds.add(field.fieldId);
          if (field.id) renderedFieldIds.add(field.id);
          if (field.label) renderedFieldIds.add(field.label);
        });
        return;
      }

      const sectionFields: Array<{ fieldId: string; label: string; value: string }> = [];

      (section.fields || []).forEach((field) => {
        const fieldId = field.fieldId || field.id || '';
        const fieldLabel = field.label || '';

        if (
          isApplicantParticularField(fieldLabel) || isApplicantParticularField(fieldId) ||
          isSignatureOrDeclarationField(fieldLabel) || isSignatureOrDeclarationField(fieldId) ||
          isJurisdictionOrVariantField(fieldLabel) || isJurisdictionOrVariantField(fieldId)
        ) {
          renderedFieldIds.add(fieldId);
          renderedFieldIds.add(fieldLabel);
          return;
        }

        const matchedFv = formFieldValues.find(
          (fv) => fv.fieldId === fieldId || fv.fieldLabel.toLowerCase().trim() === fieldLabel.toLowerCase().trim()
        );

        let val = matchedFv?.value ? matchedFv.value.trim() : '';

        // Auto-assign NTC official text if blank for official assignment sections
        const fieldIdLower = fieldId.toLowerCase();
        const labelLower = fieldLabel.toLowerCase();
        if (
          !val &&
          (fieldIdLower.includes('vasregistration') ||
            fieldIdLower.includes('vas_reg') ||
            labelLower.includes('vas registration') ||
            fieldIdLower.includes('bsd') ||
            labelLower.includes('bsd no'))
        ) {
          val = 'TO BE ASSIGNED BY NTC';
        }

        if (val && val !== '') {
          if (val.toUpperCase() !== 'N/A' && val.toUpperCase() !== 'NA' && val !== '-' && val !== '[]' && val !== '{}') {
            sectionFields.push({ fieldId, label: fieldLabel || matchedFv?.fieldLabel || fieldLabel, value: val });
            renderedFieldIds.add(fieldId);
            if (matchedFv?.fieldId) renderedFieldIds.add(matchedFv.fieldId);
            renderedFieldIds.add(fieldLabel);
            if (matchedFv?.fieldLabel) renderedFieldIds.add(matchedFv.fieldLabel);
          }
        }
      });

      if (sectionFields.length > 0) {
        result.push({
          id: section.id || sectionKey || `sec-${sIdx}`,
          title: sectionTitle,
          icon: getSectionIcon(sectionTitle) as React.ComponentProps<typeof Icon>['name'],
          accentColor: getSectionAccentColor(result.length),
          fields: sectionFields,
        });
      }
    });

    return result;
  }, [form, formFieldValues, renderedFieldIds, isAmateurCert]);

  // 2. Classify remaining fields & signatures
  const { remainingSpecs, declarations, signatures } = useMemo(() => {
    const specs: Array<{ fieldId: string; fieldLabel: string; value: string }> = [];
    const decs: Array<{ fieldId: string; fieldLabel: string; value: string }> = [];
    const sigs: Array<{ fieldId: string; fieldLabel: string; value: string }> = [];

    for (const field of formFieldValues) {
      if (!field.value || field.value.trim() === '') continue;
      const val = field.value.trim();
      const valLower = val.toLowerCase();
      const labelLower = (field.fieldLabel || field.fieldId).toLowerCase();

      const isSig = labelLower.includes('signature') || val.startsWith('data:image') || val.startsWith('typed:cursive:') || val.startsWith('blob:');
      const isDec = !isSig && (
        labelLower.includes('declare') || labelLower.includes('certify') || labelLower.includes('agreement') ||
        labelLower.includes('declaration') || labelLower.includes('affirm') || valLower === 'true' ||
        valLower === 'false' || valLower === 'agreed' || valLower === 'yes' || valLower === 'no'
      );

      if (isSig) {
        sigs.push(field);
      } else if (isDec) {
        decs.push(field);
      } else if (
        !renderedFieldIds.has(field.fieldId) && !renderedFieldIds.has(field.fieldLabel) &&
        !isApplicantParticularField(field.fieldLabel) && !isApplicantParticularField(field.fieldId) &&
        !isJurisdictionOrVariantField(field.fieldLabel) && !isJurisdictionOrVariantField(field.fieldId)
      ) {
        if (isAmateurCert && isRemovedAmateurField(field.fieldLabel, field.fieldId)) continue;
        if (isVasCert && isRemovedVasField(field.fieldLabel, field.fieldId)) continue;
        specs.push(field);
      }
    }

    return { remainingSpecs: specs, declarations: decs, signatures: sigs };
  }, [formFieldValues, renderedFieldIds, isAmateurCert, isVasCert]);

  const examEducationFields = useMemo(() => {
    if (!isExamService) return [];
    return remainingSpecs.filter((f) => isExamEducationField(f.fieldLabel, f.fieldId));
  }, [isExamService, remainingSpecs]);

  const examAssistanceFields = useMemo(() => {
    if (!isExamService) return [];
    return remainingSpecs.filter((f) => isExamAssistanceField(f.fieldLabel, f.fieldId));
  }, [isExamService, remainingSpecs]);

  const nonExamRemainingFields = useMemo(() => {
    if (isExamService) return [];
    return remainingSpecs.filter(
      (f) => !examEducationFields.some((ef) => ef.fieldId === f.fieldId) && !examAssistanceFields.some((af) => af.fieldId === f.fieldId)
    );
  }, [isExamService, remainingSpecs, examEducationFields, examAssistanceFields]);

  return {
    isExamService,
    dynamicSectionsToRender,
    remainingSpecs,
    declarations,
    signatures,
    examEducationFields,
    examAssistanceFields,
    nonExamRemainingFields,
  };
}
