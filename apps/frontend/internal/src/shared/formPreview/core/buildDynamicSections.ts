/**
 * buildDynamicSections.ts
 *
 * Shared section-building engine used by both:
 *  - Wizard Step 5 Review & Submit
 *  - My Application Details preview
 *
 * Source of truth: generalReview/dynamicSectionsBuilder.ts (wizard)
 */

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

/**
 * Builds structured dynamic section groups from the service form schema
 * and a flat list of submitted field values.
 *
 * All field/section filtering logic is centralised here — extensions can
 * pass `skipFieldIds` and `skipFieldLabels` to suppress additional fields.
 */
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

      // Mark all fields in suppressed sections as rendered (so they don't leak into remaining)
      const markSectionRendered = () => {
        (section.fields || []).forEach((field) => {
          if (field.fieldId) {
            renderedIds.add(field.fieldId);
            renderedIds.add(field.fieldId.toLowerCase().trim());
          }
          if (field.id) {
            renderedIds.add(field.id);
            renderedIds.add(field.id.toLowerCase().trim());
          }
          if (field.label) {
            renderedIds.add(field.label);
            renderedIds.add(field.label.toLowerCase().trim());
          }
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

        // Extension-provided skips
        if (
          skipFieldIds.some((s) => idLower === s.toLowerCase()) ||
          skipFieldLabels.some((s) => labelLower === s.toLowerCase())
        ) {
          renderedIds.add(fieldId);
          renderedIds.add(idLower);
          renderedIds.add(fieldLabel);
          renderedIds.add(labelLower);
          return;
        }

        if (
          (showApplicantCard && (isApplicantParticularField(fieldLabel) || isApplicantParticularField(fieldId))) ||
          isSignatureOrDeclarationField(fieldLabel) || isSignatureOrDeclarationField(fieldId) ||
          isJurisdictionOrVariantField(fieldLabel) || isJurisdictionOrVariantField(fieldId) ||
          isRepeaterSubField(fieldLabel, fieldId)
        ) {
          renderedIds.add(fieldId);
          renderedIds.add(idLower);
          renderedIds.add(fieldLabel);
          renderedIds.add(labelLower);
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
          renderedIds.add(idLower);
          renderedIds.add(matchedFv.fieldId);
          renderedIds.add((matchedFv.fieldId || '').toLowerCase().trim());
          renderedIds.add(fieldLabel);
          renderedIds.add(labelLower);
          renderedIds.add(matchedFv.fieldLabel);
          renderedIds.add((matchedFv.fieldLabel || '').toLowerCase().trim());
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

  // Deduplicate remaining fields by label/fieldId to ensure no duplicate display
  const seenLabels = new Set<string>();
  const deduplicatedRemainingFields: FormFieldValue[] = [];
  for (let i = remainingFields.length - 1; i >= 0; i--) {
    const fv = remainingFields[i];
    const normalizedKey = (fv.fieldLabel || fv.fieldId || '').toLowerCase().trim();
    if (!seenLabels.has(normalizedKey)) {
      seenLabels.add(normalizedKey);
      deduplicatedRemainingFields.unshift(fv);
    }
  }

  return { dynamicSectionsToRender, remainingFields: deduplicatedRemainingFields };
}
