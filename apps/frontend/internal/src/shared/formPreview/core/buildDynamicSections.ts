/**
 * buildDynamicSections.ts
 *
 * Shared section-building engine used by both:
 *  - Wizard Step 5 Review & Submit
 *  - My Application Details preview
 *  - Internal Queue Evaluator record review
 *
 * Evaluates per-service-variant conditional visibility so each application
 * preview cleanly renders the view type of its equivalent application form.
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
import { getSectionIcon, getSectionAccentColor, isRecord } from './formPreviewHelpers';

type RawSection = {
  id?: string;
  key?: string;
  title?: string;
  visibilityCondition?: string | null;
  fields?: Array<{
    id?: string;
    fieldId?: string;
    label?: string;
    validationRules?: string | null;
    visibilityCondition?: string | null;
  }>;
};

type ServiceFormSchema = {
  sections?: RawSection[];
};

function toStringArray(val: unknown): string[] {
  if (typeof val === 'string' && val.trim().length > 0) {
    return [val.trim()];
  }
  if (Array.isArray(val)) {
    return val
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .map((item) => item.trim());
  }
  return [];
}

function matchesPreviewVariant(ruleItem: string, variantName: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const rTrim = ruleItem.trim();
  if (!rTrim || rTrim.toUpperCase() === '__NONE__') return false;
  const rNorm = norm(rTrim);
  const vNorm = norm(variantName);
  if (!rNorm || !vNorm) return false;
  if (rNorm === vNorm) return true;

  const rParen = rTrim.match(/\(([^()]+)\)\s*$/);
  const vParen = variantName.match(/\(([^()]+)\)\s*$/);
  if (rParen && vParen && norm(rParen[1] ?? '') !== norm(vParen[1] ?? '')) {
    return false;
  }

  if (rNorm.length >= 3 && vNorm.length >= 3 && (rNorm.includes(vNorm) || vNorm.includes(rNorm))) {
    return true;
  }
  return false;
}

function resolvePreviewFieldLabel(
  field: { label?: string; validationRules?: string | null },
  variantName: string
): string {
  const baseLabel = field.label || '';
  if (!variantName || !field.validationRules) return baseLabel;
  try {
    const parsed: unknown = JSON.parse(field.validationRules);
    if (isRecord(parsed) && isRecord(parsed['variantOverrides'])) {
      for (const [key, entry] of Object.entries(parsed['variantOverrides'])) {
        if (matchesPreviewVariant(key, variantName) && isRecord(entry) && typeof entry['label'] === 'string' && entry['label'].trim()) {
          return entry['label'].trim();
        }
      }
    }
  } catch {
    // ignore
  }
  return baseLabel;
}

function resolvePreviewSectionTitle(section: RawSection, sIdx: number, variantName: string): string {
  const baseTitle = section.title || `Section ${sIdx + 1}`;
  const firstRules = section.fields?.[0]?.validationRules;
  if (!variantName || !firstRules) return baseTitle;
  try {
    const parsed: unknown = JSON.parse(firstRules);
    if (isRecord(parsed) && isRecord(parsed['sectionVariantTitles'])) {
      for (const [key, titleVal] of Object.entries(parsed['sectionVariantTitles'])) {
        if (matchesPreviewVariant(key, variantName) && typeof titleVal === 'string' && titleVal.trim()) {
          return titleVal.trim();
        }
      }
    }
  } catch {
    // ignore
  }
  return baseTitle;
}

/**
 * Evaluates whether a section or field with a visibilityCondition JSON rule
 * is applicable to the currently viewed service variant and application context.
 */
function evaluateConditionForPreview(
  conditionString: string | undefined | null,
  options: BuildDynamicSectionsOptions
): boolean {
  if (!conditionString || !conditionString.trim()) {
    return true;
  }

  const trimmed = conditionString.trim();
  if (!trimmed.startsWith('{')) {
    return true;
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (!isRecord(parsed)) return true;

    const variantName = (options.selectedVariantName || '').toLowerCase().trim();
    const appType = (options.applicationType || '').toLowerCase().trim();
    const sTitle = (options.serviceTitle || '').toLowerCase().trim();
    const sName = (options.serviceName || '').toLowerCase().trim();
    const sCode = (options.serviceCode || '').toLowerCase().trim();
    const applicantType = (options.applicantType || '').toLowerCase().trim();

    // 1. Services constraint
    const services = toStringArray(parsed['services']);
    if (services.length > 0) {
      const matchesService = services.some((s) => {
        const sLower = s.toLowerCase().trim();
        return (
          sLower === sTitle ||
          sLower === sName ||
          sLower === sCode ||
          (sTitle.length > 0 && sTitle.includes(sLower)) ||
          (sLower.length > 0 && sLower.includes(sTitle))
        );
      });
      if (!matchesService) return false;
    }

    // 2. Service Codes constraint
    const serviceCodes = toStringArray(parsed['serviceCodes']);
    if (serviceCodes.length > 0) {
      const matchesCode = serviceCodes.some((c) => c.toLowerCase().trim() === sCode);
      if (!matchesCode) return false;
    }

    // 3. Service Variants constraint (including variantType alias)
    const variantsList = [
      ...toStringArray(parsed['variants']),
      ...toStringArray(parsed['variantType']),
    ];
    if (variantsList.length > 0) {
      if (variantsList.every((v) => v.trim().toUpperCase() === '__NONE__')) {
        return false;
      }
      if (variantName.length === 0) {
        return false;
      }
      const matchesVariant = variantsList.some((v) => matchesPreviewVariant(v, variantName));
      if (!matchesVariant) return false;
    }

    // 3b. Excluded Variants constraint
    const excludedVariantsList = toStringArray(parsed['excludedVariants']);
    if (excludedVariantsList.length > 0) {
      if (excludedVariantsList.some((v) => v.trim().toUpperCase() === 'ALL')) {
        return false;
      }
      if (
        variantName.length > 0 &&
        excludedVariantsList.some((v) => matchesPreviewVariant(v, variantName))
      ) {
        return false;
      }
    }

    // 4. Application Types constraint (including variantDescription alias)
    const appTypesList = [
      ...toStringArray(parsed['applicationTypes']),
      ...toStringArray(parsed['variantDescription']),
    ];
    if (appTypesList.length > 0) {
      const matchesAppType = appTypesList.some((t) => {
        const tLower = t.toLowerCase().trim();
        return (
          tLower === appType ||
          tLower === variantName ||
          (variantName.length > 0 && variantName.includes(tLower)) ||
          (appType.length > 0 && appType.includes(tLower))
        );
      });
      if (!matchesAppType) return false;
    }

    // 5. Elements constraint (e.g. examinee classifications)
    const elements = toStringArray(parsed['elements']);
    if (elements.length > 0) {
      const matchesElement = elements.some((el) => {
        const elLower = el.toLowerCase().trim();
        return (
          elLower === appType ||
          elLower === variantName ||
          (variantName.length > 0 && variantName.includes(elLower)) ||
          (appType.length > 0 && appType.includes(elLower))
        );
      });
      if (!matchesElement) return false;
    }

    // 6. Applicant Types constraint (individual / company)
    const applicantTypesList = [
      ...toStringArray(parsed['applicantTypes']),
      ...toStringArray(parsed['applicantType']),
    ];
    if (applicantTypesList.length > 0 && applicantType.length > 0) {
      const matchesApplicantType = applicantTypesList.some(
        (at) => at.toLowerCase().trim() === applicantType
      );
      if (!matchesApplicantType) return false;
    }

    // 7. Field Dependencies (fieldDependencies and dependsOn)
    const formMap = options.formValuesMap;
    if (formMap) {
      const rawDeps = parsed['fieldDependencies'] || parsed['dependsOn'];
      const depList: unknown[] = Array.isArray(rawDeps)
        ? rawDeps
        : rawDeps && isRecord(rawDeps)
        ? [rawDeps]
        : [];

      for (const item of depList) {
        if (!isRecord(item)) continue;
        const targetField =
          typeof item['fieldId'] === 'string'
            ? item['fieldId']
            : typeof item['fieldKey'] === 'string'
            ? item['fieldKey']
            : typeof item['field'] === 'string'
            ? item['field']
            : undefined;
        const expectedVal =
          typeof item['value'] === 'string' ? item['value'].toLowerCase().trim() : undefined;
        const op =
          typeof item['operator'] === 'string' ? item['operator'].toLowerCase().trim() : 'equals';

        if (targetField) {
          const actualVal = (formMap[targetField] || formMap[targetField.toLowerCase()] || '').toLowerCase().trim();
          if (op === 'equals' && expectedVal !== undefined && actualVal !== expectedVal) return false;
          if ((op === 'notequals' || op === 'not_equals') && expectedVal !== undefined && actualVal === expectedVal) return false;
          if (op === 'contains' && expectedVal !== undefined && !actualVal.includes(expectedVal)) return false;
          if (op === 'is_not_empty' && actualVal.length === 0) return false;
          if (op === 'is_empty' && actualVal.length > 0) return false;
        }
      }
    }

    return true;
  } catch {
    return true;
  }
}

/**
 * Builds structured dynamic section groups from the service form schema
 * and a flat list of submitted field values.
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

  // Prepare a lookup map of submitted values for fast dependency and match resolution
  const formFieldMap: Record<string, string> = {};
  for (const fv of formFieldValues) {
    if (fv.fieldId) {
      formFieldMap[fv.fieldId] = fv.value;
      formFieldMap[fv.fieldId.toLowerCase().trim()] = fv.value;
    }
    if (fv.fieldLabel) {
      formFieldMap[fv.fieldLabel] = fv.value;
      formFieldMap[fv.fieldLabel.toLowerCase().trim()] = fv.value;
    }
  }

  const effectiveOptions: BuildDynamicSectionsOptions = {
    ...options,
    formValuesMap: options.formValuesMap || formFieldMap,
  };

  // ── 1. Build structured sections from schema ──────────────────────────────

  const dynamicSectionsToRender: DynamicSectionGroup[] = [];

  if (form?.sections && Array.isArray(form.sections) && form.sections.length > 0) {
    const previewVarName = (options.selectedVariantName || '').trim();
    form.sections.forEach((section, sIdx) => {
      const sectionKey = section.key || section.id || '';
      const sectionTitle = resolvePreviewSectionTitle(section, sIdx, previewVarName);

      // Mark all fields in a suppressed/skipped section as rendered so they don't leak into remaining fields
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

      if (
        isUnrelatedSection(sectionTitle) ||
        isUnrelatedSection(sectionKey) ||
        sectionKey.toLowerCase().trim() === 'additionalspecifications' ||
        sectionTitle.toLowerCase().trim() === 'additional technical specifications'
      ) {
        markSectionRendered();
        return;
      }

      if (isAmateurCertService && (isRemovedAmateurSection(sectionTitle) || isRemovedAmateurSection(sectionKey))) {
        markSectionRendered();
        return;
      }

      // Check section-level conditional visibility for the selected variant
      if (!evaluateConditionForPreview(section.visibilityCondition, effectiveOptions)) {
        markSectionRendered();
        return;
      }

      const sectionFields: DynamicSectionGroup['fields'] = [];

      (section.fields || []).forEach((field) => {
        const fieldId = field.fieldId || field.id || '';
        const fieldLabel = field.label || '';
        const idLower = fieldId.toLowerCase().trim();
        const labelLower = fieldLabel.toLowerCase().trim();

        // Check field-level conditional visibility for the selected variant
        if (!evaluateConditionForPreview(field.visibilityCondition, effectiveOptions)) {
          renderedIds.add(fieldId);
          renderedIds.add(idLower);
          renderedIds.add(fieldLabel);
          renderedIds.add(labelLower);
          return;
        }

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
          isApplicantParticularField(fieldLabel) || isApplicantParticularField(fieldId) ||
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
          const resolvedLabel = resolvePreviewFieldLabel(field, previewVarName) || matchedFv.fieldLabel;
          sectionFields.push({ fieldId, label: resolvedLabel, value: val });
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
