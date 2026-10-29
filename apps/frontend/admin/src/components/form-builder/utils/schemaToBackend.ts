import { FormField } from "../types";
import { generateId } from "./fieldDefaults";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function convertSchemaToBackendSections(fields: FormField[]) {
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

  for (const field of fields) {
    if (field.type === "section-header") {
      if (hasEncounteredExplicitSection || currentSection.fields.length > 0) {
        sections.push(currentSection);
        sectionIndex++;
      }
      hasEncounteredExplicitSection = true;
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

    const resolvedFieldVisibility = field.condition
      ? JSON.stringify(field.condition)
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
        options: field.options,
        cols: field.cols,
        repeaterColumns: field.repeaterColumns,
        minRows: field.minRows,
        maxRows: field.maxRows,
        addButtonLabel: field.addButtonLabel,
        condition: field.condition,
        sectionVisibilityCondition: currentSection.visibilityCondition,
      }),
    };

    currentSection.fields.push(fieldDto);
  }

  if (hasEncounteredExplicitSection || currentSection.fields.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}
