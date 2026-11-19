import { FormField } from "../types";
import { generateId } from "./fieldDefaults";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function convertSchemaToBackendSections(fields: FormField[], scopedVariantId?: string) {
  type SectionItemOutput = {
    key: string;
    title: string;
    required: boolean;
    orderIndex: number;
    visibilityCondition?: string;
    fields: Array<{
      fieldId: string;
      label: string;
      type: string;
      isRequired: boolean;
      orderIndex: number;
      validationRules?: string;
      visibilityCondition?: string;
    }>;
  };

  const sections: SectionItemOutput[] = [];
  const usedSectionKeys = new Set<string>();
  const getUniqueSectionKey = (baseKey: string): string => {
    let key = baseKey;
    let suffix = 1;
    while (usedSectionKeys.has(key)) {
      suffix++;
      key = `${baseKey}-${suffix}`;
    }
    usedSectionKeys.add(key);
    return key;
  };

  const initialKey = getUniqueSectionKey("general");
  let currentSection: SectionItemOutput = {
    key: initialKey,
    title: "General Information",
    required: true,
    orderIndex: 0,
    visibilityCondition: undefined,
    fields: [],
  };

  let sectionIndex = 0;
  let fieldIndex = 0;
  const seenFieldIds = new Set<string>();
  let hasEncounteredExplicitSection = false;
  let currentSectionVariantTitles: Record<string, string> | undefined = undefined;

  for (const field of fields) {
    if (field.type === "section-header") {
      if (hasEncounteredExplicitSection || currentSection.fields.length > 0) {
        sections.push(currentSection);
        sectionIndex++;
      }
      hasEncounteredExplicitSection = true;
      currentSectionVariantTitles = field.variantTitles;
      const title = field.sectionTitle || field.label || `Section ${sectionIndex + 1}`;
      const baseKey =
        field.sectionKey && field.sectionKey.trim().length > 0
          ? field.sectionKey.trim()
          : title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "") || `section-${sectionIndex}`;
      const key = getUniqueSectionKey(baseKey);

      currentSection = {
        key,
        title,
        required: true,
        orderIndex: sectionIndex,
        visibilityCondition: field.condition
          ? JSON.stringify(field.condition)
          : field.visibilityCondition,
        fields: [],
      };
      fieldIndex = 0;
      continue;
    }

    let fieldId = field.id;
    if (!fieldId || !UUID_REGEX.test(fieldId) || seenFieldIds.has(fieldId)) {
      fieldId = generateId();
    }
    seenFieldIds.add(fieldId);

    let cleanOptions = field.options;
    if (field.type === "select" || field.type === "radio" || field.type === "checkbox") {
      if (Array.isArray(field.options) && field.options.length > 0) {
        cleanOptions = field.options.map((opt, idx) => {
          const rawLbl = (opt.label || "").trim();
          const rawVal = (opt.value || "").trim();
          const isDefaultLbl = /^option\s*\d+$/i.test(rawLbl);
          const isDefaultVal = /^option[_\s]*\d+$/i.test(rawVal);
          const resolvedText =
            isDefaultLbl && rawVal.length > 0 && !isDefaultVal
              ? rawVal
              : isDefaultVal && rawLbl.length > 0 && !isDefaultLbl
              ? rawLbl
              : rawLbl || rawVal || `Option ${idx + 1}`;
          return {
            id: opt.id || generateId(),
            label: resolvedText,
            value: rawVal.length > 0 && !isDefaultVal ? rawVal : resolvedText,
          };
        });
      }
    }

    let resolvedCondition = field.condition;
    if (scopedVariantId && resolvedCondition?.variants && resolvedCondition.variants.length > 0) {
      if (!resolvedCondition.variants.includes(scopedVariantId)) {
        resolvedCondition = {
          ...resolvedCondition,
          variants: [...resolvedCondition.variants, scopedVariantId],
        };
      }
    }

    const resolvedFieldVisibility = resolvedCondition
      ? JSON.stringify(resolvedCondition)
      : field.visibilityCondition || currentSection.visibilityCondition;

    const fieldDto = {
      fieldId,
      label: field.label || (field.type === "divider" ? "Divider" : "Untitled Field"),
      type: field.type,
      isRequired: Boolean(field.required),
      orderIndex: fieldIndex++,
      visibilityCondition: resolvedFieldVisibility,
      validationRules: JSON.stringify({
        placeholder: field.placeholder,
        helpText: field.helpText,
        minLength: field.minLength,
        maxLength: field.maxLength,
        min: field.min,
        max: field.max,
        acceptedFileTypes: field.acceptedFileTypes,
        maxFileSizeMb: field.maxFileSizeMb,
        options: cleanOptions,
        cols: field.cols,
        repeaterColumns: field.repeaterColumns,
        minRows: field.minRows,
        maxRows: field.maxRows,
        addButtonLabel: field.addButtonLabel,
        condition: resolvedCondition,
        sectionVisibilityCondition: currentSection.visibilityCondition,
        sectionVariantTitles: currentSectionVariantTitles,
      }),
    };

    currentSection.fields.push(fieldDto);
  }

  if (hasEncounteredExplicitSection || currentSection.fields.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}
