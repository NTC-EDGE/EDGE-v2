import {
  FieldCondition,
  FieldVariantOverride,
  FormField,
  FormSchema,
  ServiceVariantToolbarItem,
  SharedChangesImpact,
} from "../types";
import { parseFieldCondition } from "./fieldParsers";

export function deleteFieldWithSection(fields: FormField[], id: string): FormField[] {
  if (id === "default-section") {
    let firstSectionIndex = 0;
    while (firstSectionIndex < fields.length && fields[firstSectionIndex]?.type !== "section-header") {
      firstSectionIndex++;
    }
    return fields.slice(firstSectionIndex);
  }

  const fromIndex = fields.findIndex((f) => f.id === id);
  if (fromIndex < 0) return fields;

  const targetField = fields[fromIndex];
  if (targetField?.type === "section-header") {
    const blockStart = fromIndex;
    let blockEnd = fromIndex + 1;
    while (blockEnd < fields.length && fields[blockEnd]?.type !== "section-header") {
      blockEnd++;
    }
    return [...fields.slice(0, blockStart), ...fields.slice(blockEnd)];
  }

  return fields.filter((f) => f.id !== id);
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function formatApplicationTypeLabel(rawType?: string): string {
  if (!rawType) return "";
  const trimmed = rawType.trim();
  if (!trimmed || trimmed.toUpperCase() === "NA") return "";
  if (trimmed === "FirstTaker" || trimmed.toLowerCase() === "firsttaker") return "First Taker";
  if (trimmed === "CivicActionGroup" || trimmed.toLowerCase() === "civicactiongroup") return "Civic Action Group";
  return trimmed;
}

export function formatServiceVariantDisplayName(description?: string, type?: string): string {
  const desc = (description ?? "").trim();
  const typeLabel = formatApplicationTypeLabel(type);
  const rawType = type && type.trim().toUpperCase() !== "NA" ? type.trim() : "";

  if (!desc) {
    return typeLabel || "Variant";
  }
  if (!typeLabel) {
    return desc;
  }

  const lowerDesc = desc.toLowerCase();
  if (
    lowerDesc.endsWith(`(${typeLabel.toLowerCase()})`) ||
    (rawType.length > 0 && lowerDesc.endsWith(`(${rawType.toLowerCase()})`)) ||
    lowerDesc.endsWith(`- ${typeLabel.toLowerCase()}`)
  ) {
    return desc;
  }

  return `${desc} (${typeLabel})`;
}

export function inferApplicationTypeFromVariantName(
  variantName: string,
  explicitType?: string
): string | undefined {
  const formattedExplicit = formatApplicationTypeLabel(explicitType);
  if (formattedExplicit) return formattedExplicit;

  const lower = variantName.toLowerCase();
  if (lower.includes("first taker") || lower.includes("firsttaker")) return "First Taker";
  if (lower.includes("retaker")) return "Retaker";
  if (lower.includes("upgrade")) return "Upgrade";
  if (lower.includes("modification")) return "Modification";
  if (lower.includes("renewal")) return "Renewal";
  if (lower.includes("(new)") || lower.endsWith("- new")) return "New";
  if (lower.includes("duplicate copy")) return "Duplicate Copy";
  if (lower.includes("certified true copy")) return "Certified True Copy";
  return undefined;
}

export function findMatchingVariant(
  variants: ServiceVariantToolbarItem[] | undefined,
  targetVariant: string | undefined
): ServiceVariantToolbarItem | undefined {
  if (!variants || variants.length === 0 || !targetVariant || targetVariant === "ALL") {
    return undefined;
  }
  const trimmed = targetVariant.trim();
  const trimmedLower = trimmed.toLowerCase();

  // 1. Direct match by id
  const byId = variants.find((v) => v.id && v.id.toLowerCase() === trimmedLower);
  if (byId) return byId;

  // 2. Exact match by name
  const byName = variants.find((v) => v.name.toLowerCase().trim() === trimmedLower);
  if (byName) return byName;

  // 3. Match using variantNamesMatch
  const byVariantNamesMatch = variants.find((v) => variantNamesMatch(v.name, trimmed));
  if (byVariantNamesMatch) return byVariantNamesMatch;

  // 4. Normalized alphanumeric match
  const normTarget = normalize(trimmed);
  const byNorm = variants.find((v) => normalize(v.name) === normTarget);
  if (byNorm) return byNorm;

  // 5. Substring / containment match
  const byContainment = variants.find((v) => {
    const normV = normalize(v.name);
    return (
      (normV.length >= 3 && normTarget.includes(normV)) ||
      (normTarget.length >= 3 && normV.includes(normTarget))
    );
  });
  if (byContainment) return byContainment;

  return undefined;
}

export function variantNamesMatch(item: string, targetVariant: string): boolean {
  const normItem = normalize(item);
  const normTarget = normalize(targetVariant);
  if (!normItem || !normTarget || normItem === "none" || normItem === "all") return false;
  if (normItem === normTarget) return true;
  const parenMatch = targetVariant.match(/\(([^()]+)\)\s*$/) ?? targetVariant.match(/\(([^)]+)\)/);
  if (parenMatch && normalize(parenMatch[1]) === normItem) return true;
  const itemParenMatch = item.match(/\(([^()]+)\)\s*$/) ?? item.match(/\(([^)]+)\)/);
  if (itemParenMatch && normalize(itemParenMatch[1]) === normTarget) return true;
  const baseTarget = normalize(targetVariant.replace(/\([^()]*\)\s*$/, ""));
  if (baseTarget && baseTarget === normItem) return true;
  const baseItem = normalize(item.replace(/\([^()]*\)\s*$/, ""));
  if (baseItem && baseItem === normTarget) return true;
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

/**
 * Master Superset Rule:
 * - When `selectedVariant === "ALL"` ("All Sections & Fields" / Base Form view), EVERY field & section
 *   in the form schema is displayed (even fields added exclusively inside customized Service Variants
 *   orfields temporarily unused across variants).
 * - When a specific `selectedVariant` is active, evaluates variant inclusions, exclusions, and applicationTypes.
 */
export function isFieldApplicableForVariant(field: FormField, selectedVariant: string): boolean {
  if (field.type === "divider") return true;

  if (!selectedVariant || selectedVariant === "ALL") {
    return true;
  }

  const cond =
    field.condition ??
    (field.visibilityCondition ? parseFieldCondition(field.visibilityCondition) : undefined);

  if (!cond) return true;

  if (cond.excludedVariants && cond.excludedVariants.length > 0) {
    if (
      cond.excludedVariants.some(
        (v) => v.toUpperCase().trim() === "ALL" || variantNamesMatch(v, selectedVariant)
      )
    ) {
      return false;
    }
  }

  const hasVariants = Boolean(cond.variants && cond.variants.length > 0);
  const hasAppTypes = Boolean(cond.applicationTypes && cond.applicationTypes.length > 0);
  if (!hasVariants && !hasAppTypes) return true;

  if (
    hasVariants &&
    cond.variants &&
    cond.variants.every((v) => v.trim().toUpperCase() === "__NONE__")
  ) {
    return false;
  }

  const matchesVariants = hasVariants
    ? Boolean(cond.variants && cond.variants.some((v) => variantNamesMatch(v, selectedVariant)))
    : true;
  const matchesAppTypes = hasAppTypes
    ? Boolean(cond.applicationTypes && cond.applicationTypes.some((a) => variantNamesMatch(a, selectedVariant)))
    : true;

  return hasVariants && hasAppTypes ? matchesVariants || matchesAppTypes : hasVariants ? matchesVariants : matchesAppTypes;
}

export function isFieldUnusedByAllVariants(
  field: FormField,
  allVariants: ServiceVariantToolbarItem[]
): boolean {
  if (field.type === "divider") return true;
  const cond =
    field.condition ??
    (field.visibilityCondition ? parseFieldCondition(field.visibilityCondition) : undefined);

  if (cond?.variants && cond.variants.length > 0 && cond.variants.every((v) => v.trim().toUpperCase() === "__NONE__")) {
    return true;
  }
  if (cond?.excludedVariants && cond.excludedVariants.some((v) => v.trim().toUpperCase() === "ALL")) {
    return true;
  }
  if (allVariants.length === 0) {
    return true;
  }
  return getVariantsUsingField(field, allVariants).length === 0;
}

export function getVariantsUsingField(
  field: FormField,
  allVariants: ServiceVariantToolbarItem[]
): ServiceVariantToolbarItem[] {
  if (field.type === "divider" || allVariants.length === 0) return [];
  return allVariants.filter((v) => isFieldApplicableForVariant(field, v.name));
}

export function getVariantsUsingSection(
  headerField: FormField | null,
  childFields: FormField[],
  allVariants: ServiceVariantToolbarItem[]
): ServiceVariantToolbarItem[] {
  if (allVariants.length === 0) return [];
  return allVariants.filter((v) => {
    if (headerField && !isFieldApplicableForVariant(headerField, v.name)) {
      return false;
    }
    const realChildren = childFields.filter((cf) => cf.type !== "divider");
    if (realChildren.length === 0) {
      return headerField ? isFieldApplicableForVariant(headerField, v.name) : false;
    }
    return realChildren.some((cf) => isFieldApplicableForVariant(cf, v.name));
  });
}

export function findVariantOverrideEntry(
  overrides: Record<string, FieldVariantOverride> | undefined,
  selectedVariant: string
): FieldVariantOverride | undefined {
  if (!overrides || !selectedVariant || selectedVariant === "ALL") return undefined;
  if (selectedVariant in overrides) return overrides[selectedVariant];
  for (const [key, val] of Object.entries(overrides)) {
    if (variantNamesMatch(key, selectedVariant)) {
      return val;
    }
  }
  return undefined;
}

export function resolveFieldForVariant(field: FormField, selectedVariant: string): FormField {
  if (!selectedVariant || selectedVariant === "ALL") return field;
  if (field.type === "section-header") {
    let customTitle = field.variantTitles?.[selectedVariant];
    if (!customTitle && field.variantTitles) {
      for (const [k, v] of Object.entries(field.variantTitles)) {
        if (variantNamesMatch(k, selectedVariant)) {
          customTitle = v;
          break;
        }
      }
    }
    if (customTitle) {
      return { ...field, label: customTitle, sectionTitle: customTitle };
    }
    return field;
  }

  const ov = findVariantOverrideEntry(field.variantOverrides, selectedVariant);
  if (!ov) return field;

  return {
    ...field,
    label: ov.label !== undefined ? ov.label : field.label,
    required: ov.required !== undefined ? ov.required : field.required,
    placeholder: ov.placeholder !== undefined ? ov.placeholder : field.placeholder,
    helpText: ov.helpText !== undefined ? ov.helpText : field.helpText,
    options: ov.options !== undefined ? ov.options : field.options,
  };
}

export function applyVariantPropertyOverride(
  field: FormField,
  selectedVariant: string,
  updates: Partial<FormField>
): FormField {
  if (!selectedVariant || selectedVariant === "ALL") {
    return { ...field, ...updates };
  }

  // Structural/global constraints (min/max/cols/repeaterColumns) still apply on field if edited,
  // while label/required/placeholder/helpText/options isolate cleanly into variantOverrides[selectedVariant].
  const prevOverrides = field.variantOverrides ?? {};
  let existingKey = selectedVariant;
  for (const k of Object.keys(prevOverrides)) {
    if (variantNamesMatch(k, selectedVariant)) {
      existingKey = k;
      break;
    }
  }

  const currentEntry: FieldVariantOverride = { ...(prevOverrides[existingKey] ?? {}) };
  if ("label" in updates && updates.label !== undefined) {
    if (updates.label === field.label) delete currentEntry.label;
    else currentEntry.label = updates.label;
  }
  if ("required" in updates && updates.required !== undefined) {
    if (updates.required === field.required) delete currentEntry.required;
    else currentEntry.required = updates.required;
  }
  if ("placeholder" in updates) {
    if (updates.placeholder === field.placeholder) delete currentEntry.placeholder;
    else currentEntry.placeholder = updates.placeholder;
  }
  if ("helpText" in updates) {
    if (updates.helpText === field.helpText) delete currentEntry.helpText;
    else currentEntry.helpText = updates.helpText;
  }
  if ("options" in updates && updates.options !== undefined) {
    currentEntry.options = updates.options;
  }

  const nextOverrides: Record<string, FieldVariantOverride> = { ...prevOverrides };
  const hasAnyOverrideProp =
    currentEntry.label !== undefined ||
    currentEntry.required !== undefined ||
    currentEntry.placeholder !== undefined ||
    currentEntry.helpText !== undefined ||
    currentEntry.options !== undefined;

  if (hasAnyOverrideProp) {
    nextOverrides[existingKey] = currentEntry;
  } else {
    delete nextOverrides[existingKey];
  }

  const passthroughUpdates: Partial<FormField> = { ...updates };
  delete passthroughUpdates.label;
  delete passthroughUpdates.required;
  delete passthroughUpdates.placeholder;
  delete passthroughUpdates.helpText;
  delete passthroughUpdates.options;

  return {
    ...field,
    ...passthroughUpdates,
    variantOverrides: Object.keys(nextOverrides).length > 0 ? nextOverrides : undefined,
  };
}

export function isExclusiveToVariant(field: FormField, variantName: string): boolean {
  if (!variantName || variantName === "ALL") return false;
  const cond =
    field.condition ??
    (field.visibilityCondition ? parseFieldCondition(field.visibilityCondition) : undefined);
  if (!cond?.variants || cond.variants.length === 0) return false;
  const nonUuidTokens = cond.variants.filter(
    (v) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.trim())
  );
  const checkList = nonUuidTokens.length > 0 ? nonUuidTokens : cond.variants;
  return checkList.every((v) => variantNamesMatch(v, variantName));
}

export function excludeVariantFromField(
  field: FormField,
  variantName: string,
  _allVariantNames: string[]
): FormField {
  const cond =
    field.condition ??
    (field.visibilityCondition ? parseFieldCondition(field.visibilityCondition) : undefined);

  // If field was scoped via explicit `variants`, remove `variantName` (setting `__NONE__` when 0 variants remain
  // so it stays visible in "All Sections & Fields" as an unused/deletable field!)
  if (cond?.variants && cond.variants.length > 0) {
    const remaining = cond.variants.filter((v) => !variantNamesMatch(v, variantName));
    const updatedCond: FieldCondition = {
      ...cond,
      variants: remaining.length > 0 ? remaining : ["__NONE__"],
    };
    return { ...field, condition: updatedCond, visibilityCondition: JSON.stringify(updatedCond) };
  }

  const prevExcluded = cond?.excludedVariants ?? [];
  const nextExcluded = prevExcluded.some((v) => variantNamesMatch(v, variantName))
    ? prevExcluded
    : [...prevExcluded, variantName];

  const updatedCond: FieldCondition = {
    ...cond,
    variants: undefined,
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
    return block.map((f) =>
      isFieldApplicableForVariant(f, selectedVariant)
        ? excludeVariantFromField(f, selectedVariant, allVariantNames)
        : f
    );
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
      let cur = f;
      if (f.variantTitles) {
        const restTitles: Record<string, string> = {};
        for (const [k, v] of Object.entries(f.variantTitles)) {
          if (!variantNamesMatch(k, selectedVariant)) restTitles[k] = v;
        }
        cur = { ...cur, variantTitles: Object.keys(restTitles).length > 0 ? restTitles : undefined };
      }
      if (cur.variantOverrides) {
        const restOverrides: Record<string, FieldVariantOverride> = {};
        for (const [k, v] of Object.entries(cur.variantOverrides)) {
          if (!variantNamesMatch(k, selectedVariant)) restOverrides[k] = v;
        }
        cur = { ...cur, variantOverrides: Object.keys(restOverrides).length > 0 ? restOverrides : undefined };
      }
      const cond =
        cur.condition ??
        (cur.visibilityCondition ? parseFieldCondition(cur.visibilityCondition) : undefined);
      if (!cond) return cur;

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
        ...cur,
        condition: hasAnyRule ? nextCond : undefined,
        visibilityCondition: hasAnyRule ? JSON.stringify(nextCond) : undefined,
      };
    });
}

export function detectSharedChangesImpact(
  originalForm: FormSchema | null,
  updatedForm: FormSchema,
  allVariants: ServiceVariantToolbarItem[],
  customizedVariantNames: string[]
): SharedChangesImpact {
  if (!originalForm || allVariants.length === 0) {
    return {
      hasSharedUpdates: false,
      modifiedItems: [],
      affectedVariantNames: [],
      affectedCustomizedVariantNames: [],
    };
  }

  const origById = new Map<string, FormField>();
  for (const f of originalForm.fields) {
    origById.set(f.id, f);
  }

  const modifiedItems: string[] = [];
  const affectedSet = new Set<string>();

  for (const cur of updatedForm.fields) {
    if (cur.type === "divider") continue;
    const prev = origById.get(cur.id);
    const usingVariants = getVariantsUsingField(cur, allVariants);
    if (usingVariants.length === 0) continue;

    if (!prev) {
      modifiedItems.push(`Added ${cur.type === "section-header" ? "section" : "field"} "${cur.sectionTitle || cur.label}"`);
      for (const v of usingVariants) affectedSet.add(v.name);
      continue;
    }

    const labelChanged =
      (cur.label || "").trim() !== (prev.label || "").trim() ||
      (cur.sectionTitle || "").trim() !== (prev.sectionTitle || "").trim();
    const reqChanged = Boolean(cur.required) !== Boolean(prev.required);
    const optsChanged = JSON.stringify(cur.options ?? []) !== JSON.stringify(prev.options ?? []);
    const phOrHelpChanged =
      (cur.placeholder ?? "") !== (prev.placeholder ?? "") ||
      (cur.helpText ?? "") !== (prev.helpText ?? "");

    if (labelChanged || reqChanged || optsChanged || phOrHelpChanged) {
      if (labelChanged) {
        modifiedItems.push(`Renamed "${prev.sectionTitle || prev.label}" → "${cur.sectionTitle || cur.label}"`);
      } else if (optsChanged) {
        modifiedItems.push(`Updated options on "${cur.label}"`);
      } else {
        modifiedItems.push(`Updated properties on "${cur.sectionTitle || cur.label}"`);
      }
      for (const v of usingVariants) affectedSet.add(v.name);
    }
  }

  const affectedVariantNames = Array.from(affectedSet);
  const affectedCustomizedVariantNames = affectedVariantNames.filter((vName) =>
    customizedVariantNames.some((cv) => variantNamesMatch(cv, vName))
  );

  return {
    hasSharedUpdates: modifiedItems.length > 0 && affectedVariantNames.length > 0,
    modifiedItems,
    affectedVariantNames,
    affectedCustomizedVariantNames,
  };
}
