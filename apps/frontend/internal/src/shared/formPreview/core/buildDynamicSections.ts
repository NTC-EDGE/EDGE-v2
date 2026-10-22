import {
  DynamicSectionGroup,
  FormFieldValue,
  BuildDynamicSectionsOptions,
  BuildDynamicSectionsResult,
} from './formPreviewTypes';
import {
  isUnrelatedSection,
  isRemovedAmateurSection,
  isApplicantParticularField,
  isSignatureOrDeclarationField,
  isJurisdictionOrVariantField,
  isRemovedAmateurField,
  isRemovedVasField,
  isRepeaterSubField,
  isSuppressedValue,
} from './formPreviewFieldCheckers';
import { getSectionIcon, getSectionAccentColor } from './formPreviewHelpers';

type RawSection = {
  id?: string;
  key?: string;
  title?: string;
  fields?: Array<{ id?: string; fieldId?: string; label?: string }>;
};

type ServiceFormSchema = {
  sections?: RawSection[];
};

export function buildDynamicSections(
  form: ServiceFormSchema | null | undefined,
  formFieldValues: FormFieldValue[],
  options: BuildDynamicSectionsOptions = {}
): BuildDynamicSectionsResult {
  const {
    isAmateurCertService = false,
    isVasCertService = false,
    skipFieldIds = [],
    skipFieldLabels = [],
    showApplicantCard = true,
  } = options;

  const renderedIds = new Set<string>();

  // ── 1. Build structured sections from schema ──────────────────────────────

  const dynamicSectionsToRender: DynamicSectionGroup[] = [];

  if (form?.sections && Array.isArray(form.sections) && form.sections.length > 0) {
    form.sections.forEach((section, sIdx) => {
      const sectionKey = section.key || section.id || '';
      const sectionTitle = section.title || `Section ${sIdx + 1}`;

      const markSectionRendered = () => {
        (section.fields || []).forEach((field) => {
          if (field.fieldId) renderedIds.add(field.fieldId);
          if (field.id) renderedIds.add(field.id);
          if (field.label) renderedIds.add(field.label);
        });
      };

      if (isUnrelatedSection(sectionTitle) || isUnrelatedSection(sectionKey)) {
        markSectionRendered();
        return;
      }

      if (isAmateurCertService && (isRemovedAmateurSection(sectionTitle) || isRemovedAmateurSection(sectionKey))) {
        markSectionRendered();
        return;
      }

      const sectionFields: DynamicSectionGroup['fields'] = [];

      (section.fields || []).forEach((field) => {
        const fieldId = field.fieldId || field.id || '';
        const fieldLabel = field.label || '';
        const idLower = fieldId.toLowerCase().trim();
        const labelLower = fieldLabel.toLowerCase().trim();

        if (
          skipFieldIds.some((s) => idLower === s.toLowerCase()) ||
          skipFieldLabels.some((s) => labelLower === s.toLowerCase())
        ) {
          renderedIds.add(fieldId);
          renderedIds.add(fieldLabel);
          return;
        }

        if (
          (showApplicantCard && (isApplicantParticularField(fieldLabel) || isApplicantParticularField(fieldId))) ||
          isSignatureOrDeclarationField(fieldLabel) || isSignatureOrDeclarationField(fieldId) ||
          isJurisdictionOrVariantField(fieldLabel) || isJurisdictionOrVariantField(fieldId) ||
          isRepeaterSubField(fieldLabel, fieldId)
        ) {
          renderedIds.add(fieldId);
          renderedIds.add(fieldLabel);
          return;
        }

        const matchedFv = formFieldValues.find(
          (fv) =>
            fv.fieldId === fieldId ||
            fv.fieldLabel.toLowerCase().trim() === fieldLabel.toLowerCase().trim()
        );

        if (matchedFv?.value && !isSuppressedValue(matchedFv.value)) {
          const val = matchedFv.value.trim();
          sectionFields.push({ fieldId, label: fieldLabel || matchedFv.fieldLabel, value: val });
          renderedIds.add(fieldId);
          renderedIds.add(matchedFv.fieldId);
          renderedIds.add(fieldLabel);
          renderedIds.add(matchedFv.fieldLabel);
        }
      });

      if (sectionFields.length > 0) {
        dynamicSectionsToRender.push({
          id: section.id || sectionKey || `sec-${sIdx}`,
          title: sectionTitle,
          icon: getSectionIcon(sectionTitle),
          accentColor: getSectionAccentColor(dynamicSectionsToRender.length),
          fields: sectionFields,
        });
      }
    });
  }

  // ── 2. Collect remaining fields not yet rendered ───────────────────────────

  const remainingFields = formFieldValues.filter((fv) => {
    const fieldId = fv.fieldId || '';
    const label = fv.fieldLabel || '';
    const idLower = fieldId.toLowerCase().trim();
    const labelLower = label.toLowerCase().trim();

    if (
      renderedIds.has(fieldId) ||
      renderedIds.has(label) ||
      renderedIds.has(idLower) ||
      renderedIds.has(labelLower)
    ) {
      return false;
    }

    if (
      skipFieldIds.some((s) => idLower === s.toLowerCase()) ||
      skipFieldLabels.some((s) => labelLower === s.toLowerCase())
    ) {
      return false;
    }

    if (isApplicantParticularField(label) || isApplicantParticularField(fieldId)) return false;
    if (isSignatureOrDeclarationField(label) || isSignatureOrDeclarationField(fieldId)) return false;
    if (isJurisdictionOrVariantField(label) || isJurisdictionOrVariantField(fieldId)) return false;
    if (isRepeaterSubField(label, fieldId)) return false;

    if (isAmateurCertService && isRemovedAmateurField(label, fieldId)) return false;
    if (isVasCertService && isRemovedVasField(label, fieldId)) return false;

    if (isSuppressedValue(fv.value)) return false;

    return true;
  });

  return { dynamicSectionsToRender, remainingFields };
}

