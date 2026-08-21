import { useMemo } from 'react';
import { Icon } from '@edge/ui';
import { Application } from '../../data/applicationsData';
import {
  isUnrelatedSection,
  isRemovedAmateurSection,
  isApplicantParticularField,
  isSignatureOrDeclarationField,
  isJurisdictionOrVariantField,
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

      if (isUnrelatedSection(sectionTitle) || isUnrelatedSection(sectionKey) || (isAmateurCert && (isRemovedAmateurSection(sectionTitle) || isRemovedAmateurSection(sectionKey)))) {
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

        if (matchedFv?.value && matchedFv.value.trim() !== '') {
          const val = matchedFv.value.trim();
          if (val.toUpperCase() !== 'N/A' && val.toUpperCase() !== 'NA' && val !== '-' && val !== '[]' && val !== '{}') {
            sectionFields.push({ fieldId, label: fieldLabel || matchedFv.fieldLabel, value: val });
            renderedFieldIds.add(fieldId);
            renderedFieldIds.add(matchedFv.fieldId);
            renderedFieldIds.add(fieldLabel);
            renderedFieldIds.add(matchedFv.fieldLabel);
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
        if (isAmateurCert) {
          const idLower = field.fieldId.toLowerCase();
          const isRemovedField =
            labelLower.includes('employment') || labelLower.includes('class of station') ||
            labelLower.includes('classofstation') || labelLower.includes('club') ||
            labelLower.includes('equipment') || labelLower.includes('permit') ||
            labelLower.includes('license type') || labelLower.includes('certificate type') ||
            labelLower.includes('nationality') || labelLower.includes('citizenship') ||
            labelLower.includes('civil status') || labelLower.includes('civilstatus') ||
            idLower.includes('employment') || idLower.includes('classofstation') ||
            idLower.includes('club') || idLower.includes('equipment') ||
            idLower.includes('permittype') || idLower.includes('nationality') ||
            idLower.includes('civilstatus');
          if (isRemovedField) continue;
        }
        specs.push(field);
      }
    }

    return { remainingSpecs: specs, declarations: decs, signatures: sigs };
  }, [formFieldValues, renderedFieldIds, isAmateurCert]);

  const examEducationFields = useMemo(() => {
    if (!isExamService) return [];
    return remainingSpecs.filter((f) => {
      const lbl = f.fieldLabel.toLowerCase();
      const id = f.fieldId.toLowerCase();
      return lbl.includes('school') || lbl.includes('course') || lbl.includes('degree') || lbl.includes('educat') ||
        lbl.includes('attain') || lbl.includes('graduat') || lbl.includes('year') || id.includes('school') ||
        id.includes('course') || id.includes('degree') || id.includes('educat') || id.includes('graduat');
    });
  }, [isExamService, remainingSpecs]);

  const examAssistanceFields = useMemo(() => {
    if (!isExamService) return [];
    return remainingSpecs.filter((f) => {
      const lbl = f.fieldLabel.toLowerCase();
      const id = f.fieldId.toLowerCase();
      return lbl.includes('assist') || lbl.includes('special') || lbl.includes('pwd') ||
        lbl.includes('accommodat') || lbl.includes('needs') || id.includes('assist') ||
        id.includes('special') || id.includes('pwd') || id.includes('needs');
    });
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
