import { FieldCondition, FormField } from "../types";
import { generateId } from "./fieldDefaults";
import { parseFieldCondition } from "./fieldParsers";
import { isFieldApplicableForVariant } from "./variantConditionUtils";

export function remapFieldDependenciesWithIdMap(
  field: FormField,
  idMap: Map<string, string>
): FormField {
  const existingCond =
    field.condition ??
    (field.visibilityCondition && field.visibilityCondition.trim().startsWith("{")
      ? parseFieldCondition(field.visibilityCondition)
      : undefined);

  if (!existingCond?.fieldDependencies || existingCond.fieldDependencies.length === 0) {
    return field;
  }

  let didRemap = false;
  const updatedDeps = existingCond.fieldDependencies.map((dep) => {
    const mappedId = idMap.get(dep.fieldId);
    if (mappedId && mappedId !== dep.fieldId) {
      didRemap = true;
      return { ...dep, fieldId: mappedId };
    }
    return dep;
  });

  if (!didRemap) return field;

  const updatedCondition: FieldCondition = {
    ...existingCond,
    fieldDependencies: updatedDeps,
  };

  return {
    ...field,
    condition: updatedCondition,
    visibilityCondition: JSON.stringify(updatedCondition),
  };
}

export function cloneFormFieldsWithFreshIds(fields: FormField[]): FormField[] {
  const idMap = new Map<string, string>();
  for (const f of fields) {
    idMap.set(f.id, generateId());
  }
  return fields.map((f) => {
    const freshId = idMap.get(f.id) ?? generateId();
    return remapFieldDependenciesWithIdMap({ ...f, id: freshId }, idMap);
  });
}

export function reorderFieldsWithSections(
  fields: FormField[],
  fromIndex: number,
  toIndex: number
): FormField[] {
  if (fromIndex < 0 || fromIndex >= fields.length || toIndex < 0 || toIndex > fields.length) {
    return fields;
  }
  if (fromIndex === toIndex) return fields;

  const targetField = fields[fromIndex];
  const newFields = [...fields];

  if (targetField.type === "section-header") {
    const blockStart = fromIndex;
    let blockEnd = fromIndex + 1;
    while (blockEnd < fields.length && fields[blockEnd].type !== "section-header") {
      blockEnd++;
    }
    if (toIndex >= blockStart && toIndex <= blockEnd) return fields;

    const blockSize = blockEnd - blockStart;
    const sectionBlock = newFields.splice(blockStart, blockSize);
    let insertIndex = toIndex > blockStart ? toIndex - blockSize : toIndex;
    insertIndex = Math.max(0, Math.min(insertIndex, newFields.length));
    newFields.splice(insertIndex, 0, ...sectionBlock);
    return newFields;
  }

  const [removed] = newFields.splice(fromIndex, 1);
  if (!removed) return fields;
  const adjustedTo = toIndex > fromIndex ? toIndex - 1 : toIndex;
  const insertIndex = Math.max(0, Math.min(adjustedTo, newFields.length));
  newFields.splice(insertIndex, 0, removed);
  return newFields;
}

export function duplicateFieldWithSection(
  fields: FormField[],
  id: string,
  selectedVariant?: string
): FormField[] {
  const fromIndex = fields.findIndex((f) => f.id === id);
  if (fromIndex < 0) return fields;

  const targetField = fields[fromIndex];
  const newFields = [...fields];
  const isVariantScoped = Boolean(selectedVariant && selectedVariant !== "ALL");

  const applyVariantScope = (f: FormField): FormField => {
    if (!isVariantScoped || !selectedVariant) return f;
    const cond: FieldCondition = {
      ...f.condition,
      variants: [selectedVariant],
      applicationTypes: undefined,
    };
    return { ...f, condition: cond, visibilityCondition: JSON.stringify(cond) };
  };

  if (targetField.type === "section-header") {
    const blockStart = fromIndex;
    let blockEnd = fromIndex + 1;
    while (blockEnd < fields.length && fields[blockEnd].type !== "section-header") {
      blockEnd++;
    }

    const rawSlice = fields.slice(blockStart, blockEnd);
    const sliceToDuplicate =
      isVariantScoped && selectedVariant
        ? rawSlice.filter((f, idx) => idx === 0 || isFieldApplicableForVariant(f, selectedVariant))
        : rawSlice;

    const idMap = new Map<string, string>();
    for (const f of sliceToDuplicate) {
      idMap.set(f.id, generateId());
    }

    const duplicatedBlock: FormField[] = sliceToDuplicate.map((field, idx) => {
      const freshId = idMap.get(field.id) ?? generateId();
      const base =
        idx === 0
          ? {
              ...field,
              id: freshId,
              sectionTitle: `${field.sectionTitle || field.label} (Copy)`,
              label: `${field.label} (Copy)`,
              sectionKey: field.sectionKey ? `${field.sectionKey}-copy` : undefined,
            }
          : { ...field, id: freshId };
      return applyVariantScope(remapFieldDependenciesWithIdMap(base, idMap));
    });

    newFields.splice(blockEnd, 0, ...duplicatedBlock);
    return newFields;
  }

  const duplicate: FormField = applyVariantScope({
    ...targetField,
    id: generateId(),
    label: `${targetField.label} (Copy)`,
  });
  newFields.splice(fromIndex + 1, 0, duplicate);
  return newFields;
}

export function deleteFieldWithSection(fields: FormField[], id: string): FormField[] {
  if (id === "default-section") {
    let firstSectionIndex = 0;
    while (firstSectionIndex < fields.length && fields[firstSectionIndex].type !== "section-header") {
      firstSectionIndex++;
    }
    return fields.slice(firstSectionIndex);
  }

  const fromIndex = fields.findIndex((f) => f.id === id);
  if (fromIndex < 0) return fields;

  const targetField = fields[fromIndex];
  if (targetField.type === "section-header") {
    const blockStart = fromIndex;
    let blockEnd = fromIndex + 1;
    while (blockEnd < fields.length && fields[blockEnd].type !== "section-header") {
      blockEnd++;
    }
    return [...fields.slice(0, blockStart), ...fields.slice(blockEnd)];
  }

  return fields.filter((f) => f.id !== id);
}
