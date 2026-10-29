import { FieldCondition, FormField } from "../types";
import { parseFieldCondition } from "./fieldParsers";
import { deleteFieldWithSection } from "./fieldOperations";

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function getVariantEquivalentKey(variantName: string): string {
  if (!variantName || variantName === "ALL") return "all";
  return variantName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function isFieldApplicableForVariant(field: FormField, selectedVariant: string): boolean {
  if (!selectedVariant || selectedVariant === "ALL") return true;
  if (field.type === "divider") return true;

  const cond =
    field.condition ??
    (field.visibilityCondition ? parseFieldCondition(field.visibilityCondition) : undefined);
  if (!cond) return true;

  const hasVariants = Boolean(cond.variants && cond.variants.length > 0);
  const hasAppTypes = Boolean(cond.applicationTypes && cond.applicationTypes.length > 0);
  if (!hasVariants && !hasAppTypes) return true;

  const target = normalize(selectedVariant);
  const targetHasParen = selectedVariant.includes("(");

  const matches = (list?: string[]) => {
    if (!list || list.length === 0) return false;
    return list.some((item) => {
      const norm = normalize(item);
      if (!norm) return false;
      if (item.includes("(") && targetHasParen) return norm === target;
      return norm === target || norm.includes(target) || target.includes(norm);
    });
  };

  if (hasVariants && hasAppTypes) return matches(cond.variants) && matches(cond.applicationTypes);
  return hasVariants ? matches(cond.variants) : matches(cond.applicationTypes);
}

export function isExclusiveToVariant(field: FormField, variantName: string): boolean {
  if (!variantName || variantName === "ALL") return false;
  const cond =
    field.condition ??
    (field.visibilityCondition ? parseFieldCondition(field.visibilityCondition) : undefined);
  if (!cond || !cond.variants || cond.variants.length === 0) return false;
  const normTarget = normalize(variantName);
  return cond.variants.every((v) => normalize(v) === normTarget);
}

export function excludeVariantFromField(
  field: FormField,
  variantName: string,
  allVariantNames: string[]
): FormField {
  const normTarget = normalize(variantName);
  const cond =
    field.condition ??
    (field.visibilityCondition ? parseFieldCondition(field.visibilityCondition) : undefined);

  const remainingVariants = allVariantNames.filter(
    (v) => normalize(v) !== normTarget && isFieldApplicableForVariant(field, v)
  );
  const fallbackVariants =
    remainingVariants.length > 0
      ? remainingVariants
      : (cond?.variants ?? []).filter((v) => normalize(v) !== normTarget);

  const updatedCond: FieldCondition = {
    ...cond,
    variants: fallbackVariants.length > 0 ? fallbackVariants : ["__NONE__"],
    applicationTypes: undefined,
  };
  return { ...field, condition: updatedCond, visibilityCondition: JSON.stringify(updatedCond) };
}

export function deleteFieldOrSectionForVariant(
  fields: FormField[],
  id: string,
  selectedVariant: string,
  allVariantNames: string[]
): FormField[] {
  if (!selectedVariant || selectedVariant === "ALL") return deleteFieldWithSection(fields, id);

  const processBlock = (block: FormField[]): FormField[] => {
    const result: FormField[] = [];
    for (const f of block) {
      if (!isFieldApplicableForVariant(f, selectedVariant)) {
        result.push(f);
      } else if (!isExclusiveToVariant(f, selectedVariant)) {
        result.push(excludeVariantFromField(f, selectedVariant, allVariantNames));
      }
    }
    return result;
  };

  if (id === "default-section") {
    let firstIdx = 0;
    while (firstIdx < fields.length && fields[firstIdx].type !== "section-header") firstIdx++;
    return [...processBlock(fields.slice(0, firstIdx)), ...fields.slice(firstIdx)];
  }

  const fromIndex = fields.findIndex((f) => f.id === id);
  if (fromIndex < 0) return fields;

  const targetField = fields[fromIndex];
  if (targetField.type === "section-header") {
    let blockEnd = fromIndex + 1;
    while (blockEnd < fields.length && fields[blockEnd].type !== "section-header") blockEnd++;
    return [
      ...fields.slice(0, fromIndex),
      ...processBlock(fields.slice(fromIndex, blockEnd)),
      ...fields.slice(blockEnd),
    ];
  }

  if (isExclusiveToVariant(targetField, selectedVariant)) {
    return fields.filter((f) => f.id !== id);
  }
  return fields.map((f) =>
    f.id === id ? excludeVariantFromField(f, selectedVariant, allVariantNames) : f
  );
}

export function resetVariantToBaseFields(
  fields: FormField[],
  selectedVariant: string,
  allVariantNames: string[]
): FormField[] {
  if (!selectedVariant || selectedVariant === "ALL") return fields;
  const normTarget = normalize(selectedVariant);

  return fields
    .filter((f) => !isExclusiveToVariant(f, selectedVariant))
    .map((f) => {
      if (isFieldApplicableForVariant(f, selectedVariant)) return f;
      const cond =
        f.condition ??
        (f.visibilityCondition ? parseFieldCondition(fieldVisibility(f)) : undefined);
      if (!cond) return f;

      const hasToolbarRestriction = Boolean(
        cond.variants?.some(
          (v) => v === "__NONE__" || allVariantNames.some((av) => normalize(av) === normalize(v))
        )
      );
      if (!hasToolbarRestriction) return f;

      const activeVariants = (cond.variants ?? []).filter((v) => v !== "__NONE__");
      const nextVariants = activeVariants.some((v) => normalize(v) === normTarget)
        ? activeVariants
        : [...activeVariants, selectedVariant];

      const coversAll =
        allVariantNames.length > 0 &&
        allVariantNames.every((av) => nextVariants.some((nv) => normalize(nv) === normalize(av)));

      const nextCond: FieldCondition = {
        ...cond,
        variants: coversAll ? undefined : nextVariants,
        applicationTypes: coversAll ? undefined : cond.applicationTypes,
      };
      const hasAnyRule = Boolean(
        nextCond.variants?.length ||
          nextCond.applicationTypes?.length ||
          nextCond.serviceCodes?.length ||
          nextCond.services?.length ||
          nextCond.elements?.length ||
          nextCond.applicantTypes?.length ||
          nextCond.fieldDependencies?.length
      );
      return {
        ...f,
        condition: hasAnyRule ? nextCond : undefined,
        visibilityCondition: hasAnyRule ? JSON.stringify(nextCond) : undefined,
      };
    });
}

function fieldVisibility(f: FormField): string | undefined {
  return f.visibilityCondition;
}
