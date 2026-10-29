import { FieldCondition, FormField } from "../types";
import { parseFieldCondition } from "./fieldParsers";
import { deleteFieldWithSection } from "./fieldOperations";

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function variantNamesMatch(item: string, targetVariant: string): boolean {
  const normItem = normalize(item);
  const normTarget = normalize(targetVariant);
  if (!normItem || !normTarget || normItem === "none" || normItem === "all") return false;
  if (normItem === normTarget) return true;
  const parenMatch = targetVariant.match(/\(([^)]+)\)/);
  if (parenMatch && normalize(parenMatch[1]) === normItem) return true;
  const itemParenMatch = item.match(/\(([^)]+)\)/);
  if (itemParenMatch && normalize(itemParenMatch[1]) === normTarget) return true;
  return false;
}

export function getVariantEquivalentKey(variantName: string): string {
  if (!variantName || variantName === "ALL") return "all";
  return variantName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function isFieldApplicableForVariant(field: FormField, selectedVariant: string): boolean {
  if (field.type === "divider") return true;

  const cond =
    field.condition ??
    (field.visibilityCondition ? parseFieldCondition(field.visibilityCondition) : undefined);

  if (!selectedVariant || selectedVariant === "ALL") {
    if (cond?.variants && cond.variants.length > 0 && !cond.variants.includes("ALL")) {
      return false;
    }
    return true;
  }

  if (!cond) return true;

  if (cond.excludedVariants && cond.excludedVariants.length > 0) {
    if (cond.excludedVariants.some((v) => variantNamesMatch(v, selectedVariant))) {
      return false;
    }
  }

  const hasVariants = Boolean(cond.variants && cond.variants.length > 0);
  const hasAppTypes = Boolean(cond.applicationTypes && cond.applicationTypes.length > 0);
  if (!hasVariants && !hasAppTypes) return true;

  const matchesVariants = hasVariants
    ? Boolean(cond.variants && cond.variants.some((v) => variantNamesMatch(v, selectedVariant)))
    : true;
  const matchesAppTypes = hasAppTypes
    ? Boolean(cond.applicationTypes && cond.applicationTypes.some((a) => variantNamesMatch(a, selectedVariant)))
    : true;

  if (hasVariants && hasAppTypes) return matchesVariants && matchesAppTypes;
  return hasVariants ? matchesVariants : matchesAppTypes;
}

export function isExclusiveToVariant(field: FormField, variantName: string): boolean {
  if (!variantName || variantName === "ALL") return false;
  const cond =
    field.condition ??
    (field.visibilityCondition ? parseFieldCondition(field.visibilityCondition) : undefined);
  if (!cond?.variants || cond.variants.length === 0) return false;
  return cond.variants.every((v) => variantNamesMatch(v, variantName));
}

export function excludeVariantFromField(
  field: FormField,
  variantName: string,
  _allVariantNames: string[]
): FormField {
  const cond =
    field.condition ??
    (field.visibilityCondition ? parseFieldCondition(field.visibilityCondition) : undefined);

  const prevExcluded = cond?.excludedVariants ?? [];
  const nextExcluded = prevExcluded.some((v) => variantNamesMatch(v, variantName))
    ? prevExcluded
    : [...prevExcluded, variantName];

  let nextVariants = cond?.variants;
  if (nextVariants && nextVariants.length > 0) {
    nextVariants = nextVariants.filter((v) => !variantNamesMatch(v, variantName));
    if (nextVariants.length === 0) nextVariants = ["__NONE__"];
  }

  const updatedCond: FieldCondition = {
    ...cond,
    variants: nextVariants,
    excludedVariants: nextExcluded,
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
  _allVariantNames: string[]
): FormField[] {
  if (!selectedVariant || selectedVariant === "ALL") return fields;

  return fields
    .filter((f) => !isExclusiveToVariant(f, selectedVariant))
    .map((f) => {
      const cond =
        f.condition ??
        (f.visibilityCondition ? parseFieldCondition(f.visibilityCondition) : undefined);
      if (!cond) return f;

      const nextExcluded = (cond.excludedVariants ?? []).filter(
        (v) => !variantNamesMatch(v, selectedVariant)
      );
      const activeVariants = (cond.variants ?? []).filter(
        (v) => v !== "__NONE__" && !variantNamesMatch(v, selectedVariant)
      );

      const nextCond: FieldCondition = {
        ...cond,
        variants: activeVariants.length > 0 ? activeVariants : undefined,
        excludedVariants: nextExcluded.length > 0 ? nextExcluded : undefined,
      };

      const hasAnyRule = Boolean(
        nextCond.variants?.length ||
          nextCond.excludedVariants?.length ||
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
