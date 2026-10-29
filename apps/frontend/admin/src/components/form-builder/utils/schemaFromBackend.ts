import { FieldOption, FormField, FormSchema, FormVersionSummary, RepeaterColumn } from "../types";
import { generateId, isRecord, normalizeFieldType } from "./fieldDefaults";
import { parseFieldCondition, parseFieldOptions, parseRepeaterColumns } from "./fieldParsers";
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
  createdAt?: string;
  updatedAt?: string;
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

  if (Array.isArray(dto.sections)) {
    for (const section of dto.sections) {
      let inferredSecVis: string | undefined = section.visibilityCondition || undefined;
      if (!inferredSecVis && Array.isArray(section.fields) && section.fields.length > 0) {
        const firstRules = section.fields[0]?.validationRules;
        if (typeof firstRules === "string" && firstRules.trim().startsWith("{")) {
          try {
            const parsedFirst: unknown = JSON.parse(firstRules);
            if (isRecord(parsedFirst) && typeof parsedFirst["sectionVisibilityCondition"] === "string") {
              inferredSecVis = parsedFirst["sectionVisibilityCondition"];
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
          required: false,
          cols: 2,
          visibilityCondition: inferredSecVis,
          condition: parseFieldCondition(inferredSecVis),
        });
      }

      if (Array.isArray(section.fields)) {
        for (const f of section.fields) {
          const normType = normalizeFieldType(f.type ?? "text");
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
          const fieldCondition = isRecord(parsedCond)
            ? parseFieldCondition(parsedCond)
            : isInheritedOnly
            ? undefined
            : parseFieldCondition(f.visibilityCondition);

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
            addButtonLabel:
              typeof parsedRules["addButtonLabel"] === "string"
                ? parsedRules["addButtonLabel"]
                : "Add Equipment",
            visibilityCondition: isInheritedOnly ? undefined : f.visibilityCondition || undefined,
            condition: fieldCondition,
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
    description: dto.serviceName
      ? `Form template for ${dto.serviceName} (v${dto.version ?? "1.0"})`
      : `Dynamic form schema version ${dto.version ?? "1.0"}`,
    version: dto.version ?? "1.0",
    fields,
    createdAt: dto.createdAt ?? new Date().toISOString(),
    updatedAt: dto.updatedAt ?? dto.createdAt ?? new Date().toISOString(),
    isPublished: dto.isActive !== false,
    isActive: dto.isActive !== false,
    availableVersions: Array.isArray(dto.availableVersions) ? dto.availableVersions : undefined,
  };
}
