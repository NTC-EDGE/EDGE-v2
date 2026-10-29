import { FieldCondition, FieldOption, RepeaterColumn } from "../types";
import { generateId, isRecord } from "./fieldDefaults";

export function parseFieldOptions(rawList: unknown): FieldOption[] | undefined {
  if (!Array.isArray(rawList) || rawList.length === 0) return undefined;
  const result: FieldOption[] = [];
  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i];
    if (typeof item === "string") {
      const trimmed = item.trim();
      if (trimmed.length > 0) {
        result.push({ id: `opt-${i + 1}-${generateId().slice(0, 4)}`, label: trimmed, value: trimmed });
      }
    } else if (isRecord(item)) {
      const rawLabel = item["label"];
      const rawVal = item["value"];
      const rawId = item["id"];
      const label = typeof rawLabel === "string" ? rawLabel : typeof rawVal === "string" ? rawVal : `Option ${i + 1}`;
      const val = typeof rawVal === "string" ? rawVal : label;
      const id = typeof rawId === "string" && rawId.length > 0 ? rawId : `opt-${i + 1}-${generateId().slice(0, 4)}`;
      result.push({ id, label, value: val });
    } else if (typeof item === "number" || typeof item === "boolean") {
      const str = String(item);
      result.push({ id: `opt-${i + 1}-${generateId().slice(0, 4)}`, label: str, value: str });
    }
  }
  return result.length > 0 ? result : undefined;
}

export function parseRepeaterColumns(rawColumns: unknown): RepeaterColumn[] | undefined {
  if (!Array.isArray(rawColumns) || rawColumns.length === 0) return undefined;
  const result: RepeaterColumn[] = [];
  for (let i = 0; i < rawColumns.length; i++) {
    const col = rawColumns[i];
    if (isRecord(col)) {
      const key = typeof col["key"] === "string" ? col["key"] : `col_${i + 1}`;
      const label = typeof col["label"] === "string" ? col["label"] : key;
      const rawType = typeof col["type"] === "string" ? col["type"] : "text";
      let type: RepeaterColumn["type"] = "text";
      if (rawType === "number") type = "number";
      else if (rawType === "select" || rawType === "dropdown") type = "select";
      else if (rawType === "date") type = "date";
      else if (rawType === "file") type = "file";
      else if (rawType === "equipments") type = "equipments";
      else if (rawType === "serials") type = "serials";

      const placeholder = typeof col["placeholder"] === "string" ? col["placeholder"] : undefined;
      const required = typeof col["required"] === "boolean" ? col["required"] : false;
      const options = parseFieldOptions(col["options"]);
      const id = typeof col["id"] === "string" && col["id"].length > 0 ? col["id"] : `col-${i + 1}`;
      result.push({ id, key, label, type, placeholder, required, options });
    }
  }
  return result.length > 0 ? result : undefined;
}

function normalizeDependencyOperator(
  rawOp: unknown
): "equals" | "not_equals" | "contains" | "is_empty" | "is_not_empty" {
  if (typeof rawOp !== "string") return "equals";
  const op = rawOp.toLowerCase().trim();
  if (op === "not_equals" || op === "notequals") return "not_equals";
  if (op === "contains") return "contains";
  if (op === "is_empty" || op === "isempty") return "is_empty";
  if (op === "is_not_empty" || op === "notempty") return "is_not_empty";
  return "equals";
}

function mapDependencyRecords(rawList: unknown[]): NonNullable<FieldCondition["fieldDependencies"]> {
  return rawList
    .filter(isRecord)
    .map((dep) => ({
      fieldId:
        typeof dep["fieldId"] === "string"
          ? dep["fieldId"]
          : typeof dep["fieldKey"] === "string"
          ? dep["fieldKey"]
          : typeof dep["field"] === "string"
          ? dep["field"]
          : "",
      operator: normalizeDependencyOperator(dep["operator"]),
      value: typeof dep["value"] === "string" ? dep["value"] : undefined,
    }))
    .filter((d) => d.fieldId.length > 0);
}

function collectDistinctStrings(valRecord: Record<string, unknown>, keys: string[]): string[] {
  const list: string[] = [];
  for (const key of keys) {
    const val = valRecord[key];
    if (typeof val === "string" && val.trim().length > 0) {
      if (!list.includes(val)) list.push(val);
    } else if (Array.isArray(val)) {
      for (const item of val) {
        if (typeof item === "string" && !list.includes(item)) list.push(item);
      }
    }
  }
  return list;
}

export function parseFieldCondition(val: unknown): FieldCondition | undefined {
  let targetVal: unknown = val;
  if (typeof targetVal === "string") {
    const trimmed = targetVal.trim();
    if (!trimmed.startsWith("{")) return undefined;
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (!isRecord(parsed)) return undefined;
      targetVal = parsed;
    } catch {
      return undefined;
    }
  }
  if (!isRecord(targetVal)) return undefined;
  const valRecord = targetVal;

  const serviceCodes = Array.isArray(valRecord["serviceCodes"])
    ? valRecord["serviceCodes"].filter((s): s is string => typeof s === "string")
    : undefined;
  const services = Array.isArray(valRecord["services"])
    ? valRecord["services"].filter((s): s is string => typeof s === "string")
    : undefined;
  const appTypesList = collectDistinctStrings(valRecord, ["applicationTypes", "variantDescription"]);
  const variantsList = collectDistinctStrings(valRecord, ["variants", "variantType"]);
  const excludedVariantsList = collectDistinctStrings(valRecord, ["excludedVariants"]);
  const elements = Array.isArray(valRecord["elements"])
    ? valRecord["elements"].filter((s): s is string => typeof s === "string")
    : undefined;

  let applicantTypes: ("individual" | "company")[] | undefined = undefined;
  if (Array.isArray(valRecord["applicantTypes"])) {
    const filtered = valRecord["applicantTypes"].filter(
      (s): s is "individual" | "company" => s === "individual" || s === "company"
    );
    if (filtered.length > 0) applicantTypes = filtered;
  } else if (valRecord["applicantType"] === "individual" || valRecord["applicantType"] === "company") {
    applicantTypes = [valRecord["applicantType"]];
  }

  let fieldDependencies: FieldCondition["fieldDependencies"] = undefined;
  if (Array.isArray(valRecord["fieldDependencies"])) {
    const mapped = mapDependencyRecords(valRecord["fieldDependencies"]);
    if (mapped.length > 0) fieldDependencies = mapped;
  } else if (valRecord["dependsOn"] !== undefined && valRecord["dependsOn"] !== null) {
    const rawDep = valRecord["dependsOn"];
    const mapped = mapDependencyRecords(Array.isArray(rawDep) ? rawDep : [rawDep]);
    if (mapped.length > 0) fieldDependencies = mapped;
  } else if (typeof valRecord["field"] === "string" && valRecord["field"].trim().length > 0) {
    fieldDependencies = [
      {
        fieldId: valRecord["field"].trim(),
        operator: normalizeDependencyOperator(valRecord["operator"]),
        value: typeof valRecord["value"] === "string" ? valRecord["value"] : undefined,
      },
    ];
  }

  return {
    serviceCodes: serviceCodes && serviceCodes.length > 0 ? serviceCodes : undefined,
    services: services && services.length > 0 ? services : undefined,
    applicationTypes: appTypesList.length > 0 ? appTypesList : undefined,
    variants: variantsList.length > 0 ? variantsList : undefined,
    excludedVariants: excludedVariantsList.length > 0 ? excludedVariantsList : undefined,
    elements: elements && elements.length > 0 ? elements : undefined,
    applicantTypes,
    fieldDependencies,
  };
}
