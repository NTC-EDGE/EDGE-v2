import { FieldOption, FormField, FormSchema, FormVersionSummary, LinkedServiceItem, RepeaterColumn } from "../types";
import { generateId, isRecord, normalizeFieldType } from "./fieldDefaults";
import {
  parseFieldCondition,
  parseFieldOptions,
  parseFieldVariantOverrides,
  parseFormMetadata,
  parseRepeaterColumns,
} from "./fieldParsers";
import { resolveDefaultRepeaterColumns } from "./repeaterPresets";

export interface BackendFormDtoLike {
  formId?: string;
  id?: string;
  key?: string;
  serviceId?: string;
  serviceVariantId?: string;
  serviceVariantName?: string;
  baseFormId?: string;
  baseFormKey?: string;
  version?: string;
  serviceName?: string;
  serviceCode?: string;
  name?: string;
  isActive?: boolean;
  isCustomized?: boolean;
  createdAt?: string;
  updatedAt?: string;
  linkedVariantsCount?: number;
  customizedVariantIds?: string[];
  availableVersions?: FormVersionSummary[];
  sections?: Array<{
    key?: string;
    title?: string;
    required?: boolean;
    orderIndex?: number;
    visibilityCondition?: string;
    fields?: Array<{
      fieldId?: string;
      label?: string;
      type?: string;
      isRequired?: boolean;
      orderIndex?: number;
      validationRules?: string;
      visibilityCondition?: string;
      options?: unknown[];
    }>;
  }>;
}

export function convertBackendFormToSchema(dto: BackendFormDtoLike): FormSchema {
  const formId = dto.formId ?? dto.id ?? generateId();
  const fields: FormField[] = [];
  const seenIds = new Set<string>();
  let extractedDescription: string | undefined = undefined;
  let extractedLinkedServices: LinkedServiceItem[] | undefined = undefined;
  let extractedLinkedVariants: string[] | undefined = undefined;

  const normalizeAlphaNum = (val?: string) =>
    (val ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  if (Array.isArray(dto.sections)) {
    // Deduplicate sections sharing the same normalized key or normalized title (merging fields if needed)
    const deduplicatedSections: NonNullable<BackendFormDtoLike["sections"]> = [];
    const secByKey = new Map<string, NonNullable<BackendFormDtoLike["sections"]>[number]>();
    const secByTitle = new Map<string, NonNullable<BackendFormDtoLike["sections"]>[number]>();

    for (const rawSec of dto.sections) {
      const k = (rawSec.key ?? "").trim().toLowerCase();
      const normTitle = normalizeAlphaNum(rawSec.title);
      const existing =
        (k.length > 0 ? secByKey.get(k) : undefined) ??
        (normTitle.length > 0 ? secByTitle.get(normTitle) : undefined);

      if (existing) {
        if (Array.isArray(rawSec.fields) && rawSec.fields.length > 0) {
          existing.fields = [...(existing.fields ?? []), ...rawSec.fields];
        }
        continue;
      }

      const clonedSec = {
        ...rawSec,
        fields: Array.isArray(rawSec.fields) ? [...rawSec.fields] : [],
      };
      deduplicatedSections.push(clonedSec);
      if (k.length > 0) secByKey.set(k, clonedSec);
      if (normTitle.length > 0) secByTitle.set(normTitle, clonedSec);
    }

    for (const section of deduplicatedSections) {
      let inferredSecVis: string | undefined = section.visibilityCondition || undefined;
      let inferredVariantTitles: Record<string, string> | undefined = undefined;
      if (Array.isArray(section.fields) && section.fields.length > 0) {
        const firstRules = section.fields[0]?.validationRules;
        if (typeof firstRules === "string" && firstRules.trim().startsWith("{")) {
          try {
            const parsedFirst: unknown = JSON.parse(firstRules);
            if (isRecord(parsedFirst)) {
              if (!extractedDescription && !extractedLinkedServices && !extractedLinkedVariants) {
                const formMeta = parseFormMetadata(parsedFirst["formMetadata"]);
                if (formMeta) {
                  extractedDescription = formMeta.description;
                  extractedLinkedServices = formMeta.linkedServices;
                  extractedLinkedVariants = formMeta.linkedVariants;
                }
              }
              if (typeof parsedFirst["sectionVisibilityCondition"] === "string") {
                inferredSecVis = parsedFirst["sectionVisibilityCondition"];
              }
              const rawTitles = parsedFirst["sectionVariantTitles"];
              if (isRecord(rawTitles)) {
                const map: Record<string, string> = {};
                for (const [k, v] of Object.entries(rawTitles)) {
                  if (typeof v === "string") map[k] = v;
                }
                if (Object.keys(map).length > 0) inferredVariantTitles = map;
              }
            }
          } catch {
            // ignore
          }
        }
      }

      if (section.title) {
        const rawSecKey = section.key || generateId();
        const secId = seenIds.has(`sec-${rawSecKey}`)
          ? `sec-${rawSecKey}-${generateId().slice(0, 6)}`
          : `sec-${rawSecKey}`;
        seenIds.add(secId);

        fields.push({
          id: secId,
          type: "section-header",
          label: section.title,
          sectionTitle: section.title,
          sectionKey: section.key,
          contractRequired: Boolean(section.required),
          required: false,
          cols: 2,
          visibilityCondition: inferredSecVis,
          condition: parseFieldCondition(inferredSecVis),
          variantTitles: inferredVariantTitles,
        });
      }

      if (Array.isArray(section.fields)) {
        const seenSectionFieldIds = new Set<string>();
        const seenSectionLabelTypes = new Set<string>();

        for (const f of section.fields) {
          const normType = normalizeFieldType(f.type ?? "text");
          const rawFieldIdLower = (f.fieldId ?? "").trim().toLowerCase();
          if (rawFieldIdLower.length > 0) {
            if (seenSectionFieldIds.has(rawFieldIdLower)) continue;
            seenSectionFieldIds.add(rawFieldIdLower);
          }

          if (normType !== "divider") {
            const normLbl = normalizeAlphaNum(f.label);
            if (normLbl.length > 0) {
              const labelTypeKey = `${normLbl}::${normType}`;
              if (seenSectionLabelTypes.has(labelTypeKey)) continue;
              seenSectionLabelTypes.add(labelTypeKey);
            }
          }

          let parsedRules: Record<string, unknown> = {};
          let rawArrayPayload: unknown[] | null = null;

          if (typeof f.validationRules === "string") {
            try {
              const parsed: unknown = JSON.parse(f.validationRules);
              if (Array.isArray(parsed)) rawArrayPayload = parsed;
              else if (isRecord(parsed)) {
                parsedRules = parsed;
                if (Array.isArray(parsed["options"])) rawArrayPayload = parsed["options"];
              }
            } catch {
              parsedRules = {};
            }
          }
          if (rawArrayPayload === null && Array.isArray(f.options)) rawArrayPayload = f.options;

          let resolvedOptions: FieldOption[] | undefined;
          let resolvedRepeaterColumns: RepeaterColumn[] | undefined;

          if (normType === "repeater") {
            if (rawArrayPayload && rawArrayPayload.length > 0 && isRecord(rawArrayPayload[0])) {
              resolvedRepeaterColumns = parseRepeaterColumns(rawArrayPayload);
            } else if (Array.isArray(parsedRules["repeaterColumns"])) {
              resolvedRepeaterColumns = parseRepeaterColumns(parsedRules["repeaterColumns"]);
            }
            if (!resolvedRepeaterColumns) {
              resolvedRepeaterColumns = resolveDefaultRepeaterColumns(f.label, f.fieldId);
            }
          } else if (normType === "select" || normType === "radio" || normType === "checkbox") {
            resolvedOptions = parseFieldOptions(rawArrayPayload);
          }

          const rawId = f.fieldId || generateId();
          const uniqueId = seenIds.has(rawId) ? generateId() : rawId;
          seenIds.add(uniqueId);

          const inheritedSecVis =
            typeof parsedRules["sectionVisibilityCondition"] === "string"
              ? parsedRules["sectionVisibilityCondition"]
              : undefined;
          const isInheritedOnly =
            !isRecord(parsedRules["condition"]) &&
            inheritedSecVis !== undefined &&
            f.visibilityCondition === inheritedSecVis;

          const parsedCond = parsedRules["condition"];
          const explicitVisCond = !isInheritedOnly && f.visibilityCondition
            ? parseFieldCondition(f.visibilityCondition)
            : undefined;
          const fieldCondition = explicitVisCond
            ? explicitVisCond
            : isInheritedOnly
            ? undefined
            : isRecord(parsedCond)
            ? parseFieldCondition(parsedCond)
            : undefined;

          const parsedOverrides = parseFieldVariantOverrides(parsedRules["variantOverrides"]);

          fields.push({
            id: uniqueId,
            type: normType,
            label: f.label ?? "Untitled Field",
            required: Boolean(f.isRequired),
            cols: parsedRules["cols"] === 1 ? 1 : 2,
            placeholder: typeof parsedRules["placeholder"] === "string" ? parsedRules["placeholder"] : undefined,
            helpText: typeof parsedRules["helpText"] === "string" ? parsedRules["helpText"] : undefined,
            minLength: typeof parsedRules["minLength"] === "number" ? parsedRules["minLength"] : undefined,
            maxLength: typeof parsedRules["maxLength"] === "number" ? parsedRules["maxLength"] : undefined,
            min: typeof parsedRules["min"] === "number" ? parsedRules["min"] : undefined,
            max: typeof parsedRules["max"] === "number" ? parsedRules["max"] : undefined,
            acceptedFileTypes: typeof parsedRules["acceptedFileTypes"] === "string" ? parsedRules["acceptedFileTypes"] : undefined,
            maxFileSizeMb: typeof parsedRules["maxFileSizeMb"] === "number" ? parsedRules["maxFileSizeMb"] : undefined,
            options: resolvedOptions,
            repeaterColumns: resolvedRepeaterColumns,
            minRows: typeof parsedRules["minRows"] === "number" ? parsedRules["minRows"] : undefined,
            maxRows: typeof parsedRules["maxRows"] === "number" ? parsedRules["maxRows"] : undefined,
            addButtonLabel: typeof parsedRules["addButtonLabel"] === "string" ? parsedRules["addButtonLabel"] : "Add Equipment",
            visibilityCondition: isInheritedOnly ? undefined : f.visibilityCondition || undefined,
            condition: fieldCondition,
            variantOverrides: parsedOverrides,
          });
        }
      }
    }
  }

  return {
    id: formId,
    key: dto.key,
    serviceId: dto.serviceId,
    serviceVariantId: dto.serviceVariantId,
    serviceVariantName: dto.serviceVariantName,
    baseFormId: dto.baseFormId,
    baseFormKey: dto.baseFormKey,
    serviceName: dto.serviceName,
    serviceCode: dto.serviceCode,
    name: dto.name ?? (dto.serviceName ? `${dto.serviceName} Form` : `Service Form (v${dto.version ?? "1.0"})`),
    description:
      extractedDescription ??
      (dto.serviceName
        ? `Form template for ${dto.serviceName} (v${dto.version ?? "1.0"})`
        : `Dynamic form schema version ${dto.version ?? "1.0"}`),
    version: dto.version ?? "1.0",
    fields,
    createdAt: dto.createdAt ?? new Date().toISOString(),
    updatedAt: dto.updatedAt ?? dto.createdAt ?? new Date().toISOString(),
    isPublished: dto.isActive !== false,
    isActive: dto.isActive !== false,
    isCustomized: Boolean(dto.isCustomized),
    availableVersions: Array.isArray(dto.availableVersions) ? dto.availableVersions : undefined,
    linkedServices: extractedLinkedServices,
    linkedVariants: extractedLinkedVariants,
    customizedVariantIds: Array.isArray(dto.customizedVariantIds) ? dto.customizedVariantIds : undefined,
    linkedVariantsCount: typeof dto.linkedVariantsCount === "number" ? dto.linkedVariantsCount : undefined,
  };
}
