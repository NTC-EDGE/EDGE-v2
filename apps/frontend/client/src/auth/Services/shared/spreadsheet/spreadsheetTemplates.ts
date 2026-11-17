import { NTCService } from "../../data/servicesData";
import { FormDto, FieldDto, FormSectionDto } from "../../../../shared/components/dynamic-form/dynamicFormTypes";
import {
  parseOptions,
  FormEvaluationContext,
  evaluateContextOnlyVisibility,
  isFieldContextVisible,
  isFieldRowVisible,
  extractFieldDependencyRules,
  hasExplicitVariantCondition,
  checkSingleDependency,
} from "../../../../shared/components/dynamic-form/dynamicFormUtils";
import { isServiceVariantIndividual } from "../helpers/applicantDisplayHelper";
import {
  isPersonalInfoSection,
  isNonInputSystemSection,
  isStandardApplicantSyncField,
  isExcludedNonEditableField,
  isObsoleteCopyOfPermitField,
  isFormFieldRepeater,
  resolveRepeaterSubColumnsForField,
  resolveEffectiveFieldOptions,
  cleanSectionPrefix,
} from "./formSpreadsheetHelper";

export interface DropdownFieldValidation {
  fieldId?: string;
  header: string;
  label: string;
  allowedOptions: string[];
}

export interface SpreadsheetTemplateConfig {
  filename: string;
  headers: string[];
  sampleRows: string[][];
  description: string;
  dropdownValidations?: DropdownFieldValidation[];
}

export const SUFFIX_DROPDOWN_OPTIONS = ["Jr.", "Sr.", "II", "III", "IV", "V"];

export const PHILIPPINE_REGION_OPTIONS = [
  "National Capital Region (NCR)",
  "Cordillera Administrative Region (CAR)",
  "Region I (Ilocos Region)",
  "Region II (Cagayan Valley)",
  "Region III (Central Luzon)",
  "Region IV-A (Calabarzon)",
  "Mimaropa Region",
  "Region V (Bicol Region)",
  "Region VI (Western Visayas)",
  "Region VII (Central Visayas)",
  "Region VIII (Eastern Visayas)",
  "Region IX (Zamboanga Peninsula)",
  "Region X (Northern Mindanao)",
  "Region XI (Davao Region)",
  "Region XII (Soccsksargen)",
  "Region XIII (Caraga)",
  "Bangsamoro Autonomous Region In Muslim Mindanao (BARMM)",
];

export function normalizeHeaderSlug(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  return raw
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s*\[[^\]]*\]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function enrichStaticTemplate(config: SpreadsheetTemplateConfig): SpreadsheetTemplateConfig {
  if (config.dropdownValidations && config.dropdownValidations.length > 0) {
    return config;
  }

  const dropdowns: DropdownFieldValidation[] = [];
  const knownDropdowns: Record<string, { label: string; options: string[] }> = {
    suffix: { label: "Suffix", options: SUFFIX_DROPDOWN_OPTIONS },
    representativesuffix: { label: "Representative Suffix", options: SUFFIX_DROPDOWN_OPTIONS },
    sex: { label: "Sex", options: ["Male", "Female"] },
    gender: { label: "Sex", options: ["Male", "Female"] },
    civilstatus: {
      label: "Civil Status",
      options: ["Single", "Married", "Widowed", "Separated"],
    },
    region: {
      label: "Region",
      options: PHILIPPINE_REGION_OPTIONS,
    },
    entitytype: {
      label: "Entity Type",
      options: [
        "Corporation",
        "Single Proprietorship",
        "Partnership",
        "Government",
        "Cooperative",
        "Association",
        "Non-Profit",
        "Others",
      ],
    },
    examineetype: {
      label: "Examinee Type",
      options: ["First Taker", "Retaker", "Upgrade", "Removal"],
    },
    applicationtype: {
      label: "Application Type",
      options: ["NEW", "RENEWAL", "MODIFICATION"],
    },
    variation: {
      label: "Variation",
      options: ["Mobile", "Non-Mobile"],
    },
    registrationtype: {
      label: "Registration Type",
      options: ["Dealers", "Non-Dealers"],
    },
  };

  for (const h of config.headers) {
    const slug = normalizeHeaderSlug(h);
    const match = knownDropdowns[slug];
    if (match) {
      dropdowns.push({
        header: h,
        label: match.label,
        allowedOptions: match.options,
      });
    }
  }

  return {
    ...config,
    dropdownValidations: dropdowns,
  };
}

function generateSampleValueForField(
  field: FieldDto,
  rowIndex: number,
  effectiveContext: FormEvaluationContext,
  rowSampleValues: Record<string, string>
): string {
  const lbl = typeof field.label === "string" ? field.label.toLowerCase() : "";
  const fId = typeof (field.fieldId || field.id) === "string" ? (field.fieldId || field.id || "").toLowerCase() : "";
  const fType = typeof (field.type || field.fieldType) === "string" ? (field.type || field.fieldType || "").toLowerCase() : "";

  // Special handling for locked Action Requested in NTC 1-24 Blocking / Unblocking
  if (
    fId === "action_requested" ||
    fId === "fd000000-0000-0000-0000-000000000307" ||
    lbl.includes("action requested")
  ) {
    const varDesc = (
      effectiveContext.variantDescription ||
      effectiveContext.variantName ||
      effectiveContext.applicationType ||
      ""
    ).toLowerCase();
    const varId = (effectiveContext.variantId || "").toLowerCase();
    const isUnblocking = varDesc.includes("unblock") || varId.includes("402");
    const isBlocking = (varDesc.includes("block") || varId.includes("401")) && !isUnblocking;
    if (isBlocking || isUnblocking) {
      return isUnblocking ? "UNBLOCK GSM Handset" : "BLOCK GSM Handset";
    }
  }

  const parsed = resolveEffectiveFieldOptions(field, effectiveContext, rowSampleValues);
  if (parsed.length > 0) {
    const opt = parsed[rowIndex % parsed.length];
    if (opt !== undefined && opt !== null) {
      if (typeof opt.label === "string" && opt.label.length > 0) {
        return opt.label;
      }
      if (typeof opt.value === "string" && opt.value.length > 0) {
        return opt.value;
      }
    }
  }

  if (fType === "date" || lbl.includes("date")) {
    return rowIndex === 0 ? "2026-12-31" : "2027-06-30";
  }
  if (fType === "time" || lbl.includes("time of")) {
    return rowIndex === 0 ? "09:30 AM" : "02:15 PM";
  }
  if (fType === "number" || fType === "integer") {
    if (lbl.includes("weight")) return rowIndex === 0 ? "68" : "56";
    if (lbl.includes("height")) return rowIndex === 0 ? "170" : "162";
    return rowIndex === 0 ? "1" : "2";
  }
  if (fType === "email") {
    return rowIndex === 0 ? "engineer1@example.ph" : "technician2@example.ph";
  }
  if (
    fType === "tel" ||
    fType === "phone" ||
    lbl.includes("contact") ||
    lbl.includes("mobile") ||
    lbl.includes("phone")
  ) {
    return rowIndex === 0 ? "09171234567" : "09189876543";
  }
  if (fType === "checkbox" || fType === "boolean") {
    return rowIndex === 0 ? "Yes" : "No";
  }

  // Smart label keyword matching
  if (lbl.includes("engineer") || lbl.includes("supervisor")) {
    return rowIndex === 0 ? "Engr. Roberto Dela Cruz" : "Engr. Maria Santos";
  }
  if (lbl.includes("technician")) {
    return rowIndex === 0 ? "Juan Santos" : "Pedro Reyes";
  }
  if (lbl.includes("ece") || lbl.includes("ect") || (lbl.includes("certificate") && lbl.includes("no"))) {
    return rowIndex === 0 ? "PECE-0012948" : "PECE-0044912";
  }
  if (lbl.includes("permit no") || fId.includes("permitno") || fId.includes("permitrslno")) {
    return rowIndex === 0 ? "RSL-2024-00812" : "RSL-2024-00945";
  }
  if (lbl.includes("license no") || fId.includes("licenseno")) {
    return rowIndex === 0 ? "LIC-2023-00419" : "LIC-2023-00782";
  }
  if (lbl.includes("cpcn")) {
    return rowIndex === 0 ? "CPCN-2022-0019" : "PA-2023-0084";
  }
  if (lbl.includes("cor") && lbl.includes("vas")) {
    return rowIndex === 0 ? "COR-VAS-2023-0045" : "COR-VAS-2023-0112";
  }
  if (lbl.includes("invoice")) {
    return rowIndex === 0 ? "INV-2026-00481" : "INV-2026-00912";
  }
  if (lbl.includes("call sign") || lbl.includes("callsign")) {
    return rowIndex === 0 ? "DU1ABC" : "DW1XYZ";
  }
  if (lbl.includes("power") || lbl.includes("watt")) {
    return rowIndex === 0 ? "50" : "100";
  }
  if (lbl.includes("bandwidth")) {
    return rowIndex === 0 ? "25" : "12.5";
  }
  if (lbl.includes("emission")) {
    return rowIndex === 0 ? "16K0F3E" : "2K70J3E";
  }
  if (lbl.includes("hours of operation")) {
    return rowIndex === 0 ? "24 Hours" : "08:00 AM - 05:00 PM";
  }
  if (lbl.includes("service area") || lbl.includes("points of comm")) {
    return rowIndex === 0 ? "Metro Manila / NCR" : "Nationwide";
  }
  if (lbl.includes("exact location") || lbl.includes("station location")) {
    return rowIndex === 0 ? "123 Agham Road, Diliman, Quezon City" : "Cebu IT Park, Lahug, Cebu City";
  }
  if (lbl.includes("longitude")) {
    return rowIndex === 0 ? "121° 02' 35\" E" : "123° 53' 07\" E";
  }
  if (lbl.includes("latitude")) {
    return rowIndex === 0 ? "14° 38' 20\" N" : "10° 18' 56\" N";
  }
  if (lbl.includes("school") || lbl.includes("university")) {
    return rowIndex === 0 ? "University of the Philippines" : "Polytechnic University of the Philippines";
  }
  if (lbl.includes("course") || lbl.includes("degree")) {
    return rowIndex === 0 ? "BS Electronics Engineering" : "BS Information Technology";
  }
  if (lbl.includes("graduat")) {
    return rowIndex === 0 ? "2022" : "2020";
  }
  if (lbl.includes("special order") || lbl.includes("so no")) {
    return rowIndex === 0 ? "SO-2022-00412" : "SO-2020-00891";
  }
  if (lbl.includes("seminar") || lbl.includes("place of exam")) {
    return rowIndex === 0 ? "NTC Central Office, Quezon City" : "NTC Region VII, Cebu City";
  }
  if (lbl.includes("rating")) {
    return rowIndex === 0 ? "88%" : "85%";
  }
  if (lbl.includes("employment location")) {
    return rowIndex === 0 ? "Manila, Philippines" : "Cebu City, Philippines";
  }
  if (lbl.includes("vessel") || lbl.includes("ship")) {
    return rowIndex === 0 ? "MV Emerald Sea" : "MV Pacific Star";
  }
  if (lbl.includes("imo")) {
    return rowIndex === 0 ? "IMO 9412834 / 4500 GT" : "IMO 9582910 / 3200 GT";
  }
  if (lbl.includes("aircraft reg")) {
    return rowIndex === 0 ? "RP-C8912" : "RP-C4410";
  }
  if (lbl.includes("serial")) {
    return rowIndex === 0 ? "SN-849201" : "SN-849202";
  }
  if (lbl.includes("model")) {
    return rowIndex === 0 ? "TX-5000" : "RX-200";
  }
  if (lbl.includes("brand") || lbl.includes("manufacturer") || lbl.includes("dealer")) {
    return rowIndex === 0 ? "Motorola Solutions Phils." : "Icom Philippines Inc.";
  }
  if (lbl.includes("frequency")) {
    return rowIndex === 0 ? "144.000 MHz" : "430.000 MHz";
  }
  if (lbl.includes("year")) {
    return rowIndex === 0 ? "1" : "3";
  }
  if (lbl.includes("circumstance")) {
    return rowIndex === 0 ? "Original permit was misplaced during office relocation" : "Original document was damaged by water";
  }

  const baseLabel =
    typeof field.label === "string" && field.label.trim().length > 0 ? field.label.trim() : "Field";
  return rowIndex === 0 ? `Sample ${baseLabel}` : `Example ${baseLabel}`;
}

interface ScopedFieldEntry {
  field: FieldDto;
  section: FormSectionDto;
  hasVariantRule: boolean;
}

function matchesDependencyTarget(field: FieldDto, targetKey: string | undefined): boolean {
  if (!targetKey || targetKey.trim().length === 0) return false;
  const normTarget = normalizeHeaderSlug(targetKey);
  const rawTargetLower = targetKey.trim().toLowerCase();
  const fId = (field.fieldId || field.id || "").trim().toLowerCase();
  const fLabel = (field.label || "").trim().toLowerCase();
  const normLabel = normalizeHeaderSlug(field.label || "");

  return (
    (fId.length > 0 && fId === rawTargetLower) ||
    (fLabel.length > 0 && fLabel === rawTargetLower) ||
    (normTarget.length > 0 && normLabel === normTarget)
  );
}

function isFieldDependencyReachable(
  entry: ScopedFieldEntry,
  allFormFields: FieldDto[],
  contextVisibleEntries: ScopedFieldEntry[],
  effectiveContext: FormEvaluationContext
): boolean {
  const deps = extractFieldDependencyRules(entry.field, entry.section);
  if (deps.length === 0) return true;

  for (const dep of deps) {
    const depTargets = [dep.fieldId, dep.fieldKey, dep.fieldLabel].filter(
      (t): t is string => typeof t === "string" && t.trim().length > 0
    );
    if (depTargets.length === 0) continue;

    const matchingInAllForm = allFormFields.filter((f) =>
      depTargets.some((t) => matchesDependencyTarget(f, t))
    );
    const matchingVisible = contextVisibleEntries.filter((e) =>
      depTargets.some((t) => matchesDependencyTarget(e.field, t))
    );

    // If the parent field exists in the form but is completely hidden in the current variant/context,
    // then this dependent field can never be triggered in this variant.
    if (matchingInAllForm.length > 0 && matchingVisible.length === 0) {
      return false;
    }

    // If the parent field is visible and has dropdown options, verify that at least one allowed option
    // can satisfy the dependency rule.
    if (matchingVisible.length > 0) {
      const parentDropdowns = matchingVisible.filter(
        (p) => resolveEffectiveFieldOptions(p.field, effectiveContext).length > 0
      );
      if (parentDropdowns.length === matchingVisible.length) {
        let canSatisfy = false;
        for (const parentEntry of parentDropdowns) {
          const opts = resolveEffectiveFieldOptions(parentEntry.field, effectiveContext);
          for (const opt of opts) {
            const candidateValues = [opt.label, opt.value].filter(
              (v): v is string => typeof v === "string" && v.trim().length > 0
            );
            for (const val of candidateValues) {
              const mockValues: Record<string, string> = {};
              for (const t of depTargets) {
                mockValues[t] = val;
              }
              if (parentEntry.field.fieldId) mockValues[parentEntry.field.fieldId] = val;
              if (parentEntry.field.id) mockValues[parentEntry.field.id] = val;
              if (parentEntry.field.label) mockValues[parentEntry.field.label] = val;

              if (checkSingleDependency(dep, mockValues)) {
                canSatisfy = true;
                break;
              }
            }
            if (canSatisfy) break;
          }
          if (canSatisfy) break;
        }
        if (!canSatisfy) {
          return false;
        }
      }
    }
  }

  return true;
}

function formatHeaderWithOptions(rawLabel: string, optLabels: string[]): string {
  if (optLabels.length === 0) return rawLabel;
  if (optLabels.length <= 5) {
    return `${rawLabel} (${optLabels.join(" | ")})`;
  }
  return `${rawLabel} (Options: ${optLabels.slice(0, 3).join(" | ")} | ...)`;
}

export function buildDynamicSpreadsheetTemplate(
  service: NTCService,
  form: FormDto,
  evaluationContext?: FormEvaluationContext
): SpreadsheetTemplateConfig | null {
  if (!Array.isArray(form.sections) || form.sections.length === 0) {
    return null;
  }

  const isIndividualService = isServiceVariantIndividual(
    service,
    undefined,
    evaluationContext?.variantId || form.serviceVariantId,
    evaluationContext?.variantName ||
      evaluationContext?.variantDescription ||
      evaluationContext?.applicationType ||
      form.serviceVariantName
  );
  const isCorporateService = !isIndividualService;

  const effectiveContext: FormEvaluationContext = {
    serviceCategory: evaluationContext?.serviceCategory || service.category,
    serviceTitle: evaluationContext?.serviceTitle || service.title,
    serviceName: evaluationContext?.serviceName || form.serviceName || service.title,
    serviceCode: evaluationContext?.serviceCode || form.serviceCode || service.code,
    applicationType: evaluationContext?.applicationType || form.serviceVariantName,
    variantType: evaluationContext?.variantType,
    variantId: evaluationContext?.variantId || form.serviceVariantId,
    variantName: evaluationContext?.variantName || form.serviceVariantName,
    variantDescription:
      evaluationContext?.variantDescription ||
      evaluationContext?.variantName ||
      form.serviceVariantName,
    elementCodes: evaluationContext?.elementCodes,
    elementNames: evaluationContext?.elementNames,
    applicantType: isIndividualService ? "individual" : "company",
    formValues: evaluationContext?.formValues,
  };

  const sortedSections = [...form.sections].sort(
    (a, b) =>
      (typeof a.orderIndex === "number" ? a.orderIndex : 0) -
      (typeof b.orderIndex === "number" ? b.orderIndex : 0)
  );

  // 1. Extract any custom dropdown options configured by admin for personal info fields (Sex, Civil Status, Suffix, Entity Type)
  const customPersonalDropdowns = new Map<string, { field?: FieldDto; options: string[] }>();
  for (const sec of sortedSections) {
    if (!evaluateContextOnlyVisibility(sec.visibilityCondition, effectiveContext)) continue;
    for (const f of sec.fields || []) {
      if (!isFieldContextVisible(f, sec, effectiveContext)) continue;
      const opts = parseOptions(f);
      if (opts.length === 0) continue;
      const optLabels = opts
        .map((o) => (typeof o.label === "string" && o.label.trim().length > 0 ? o.label.trim() : o.value.trim()))
        .filter((s) => s.length > 0);
      if (optLabels.length === 0) continue;

      const idLower = (f.fieldId || f.id || "").toLowerCase();
      const lblSlug = normalizeHeaderSlug(f.label || "");
      if (idLower.includes("sex") || idLower.includes("gender") || lblSlug === "sex" || lblSlug === "gender") {
        customPersonalDropdowns.set("sex", { field: f, options: optLabels });
      } else if (idLower.includes("civilstatus") || idLower.includes("civil_status") || lblSlug === "civilstatus") {
        customPersonalDropdowns.set("civilstatus", { field: f, options: optLabels });
      } else if (idLower.includes("suffix") || lblSlug === "suffix") {
        customPersonalDropdowns.set("suffix", { field: f, options: optLabels });
      } else if (idLower.includes("entitytype") || lblSlug === "entitytype") {
        customPersonalDropdowns.set("entitytype", { field: f, options: optLabels });
      }
    }
  }

  // 2. Collect visible Form Builder sections & fields (matching DynamicFormRenderer.tsx)
  const allFormFields: FieldDto[] = [];
  const contextVisibleEntries: ScopedFieldEntry[] = [];

  for (const sec of sortedSections) {
    if (isPersonalInfoSection(sec) || isNonInputSystemSection(sec)) {
      continue;
    }

    if (!evaluateContextOnlyVisibility(sec.visibilityCondition, effectiveContext)) {
      continue;
    }

    const fields = Array.isArray(sec.fields) ? sec.fields : [];
    const sortedFields = [...fields].sort(
      (a, b) =>
        (typeof a.orderIndex === "number" ? a.orderIndex : 0) -
        (typeof b.orderIndex === "number" ? b.orderIndex : 0)
    );

    // Check if this section has a repeater field that already includes serialNumber / frequencyRange / makeModel
    const sectionHasEquipmentRepeater = sortedFields.some(
      (f) =>
        isFormFieldRepeater(f) &&
        isFieldContextVisible(f, sec, effectiveContext) &&
        resolveRepeaterSubColumnsForField(f, effectiveContext).some(
          (sc) => sc.type === "equipments_serial" || sc.type === "serials"
        )
    );

    for (const f of sortedFields) {
      if (isExcludedNonEditableField(f)) continue;
      if (isObsoleteCopyOfPermitField(f, effectiveContext)) continue;
      if (isStandardApplicantSyncField(f, sec)) continue;

      const fLabel = typeof f.label === "string" ? f.label.trim() : "";
      if (fLabel.length === 0) continue;

      // Avoid duplicating standalone repeater-shadow fields when the same section already expands an equipment repeater
      const fIdLower = (f.fieldId || f.id || "").toLowerCase().trim();
      if (
        sectionHasEquipmentRepeater &&
        !isFormFieldRepeater(f) &&
        (fIdLower === "fd000000-0000-0000-0000-000000000111" || // serialNumber
          fIdLower === "fd000000-0000-0000-0000-000000000112" || // frequencyRange
          fIdLower === "fd000000-0000-0000-0000-000000000270" || // makeModel
          fIdLower === "fd000000-0000-0000-0000-000000000084" || // makeTypeModel
          fIdLower === "fd000000-0000-0000-0000-000000000087")   // serialNumbers
      ) {
        continue;
      }

      allFormFields.push(f);

      if (!isFieldContextVisible(f, sec, effectiveContext)) {
        continue;
      }

      contextVisibleEntries.push({
        field: f,
        section: sec,
        hasVariantRule: hasExplicitVariantCondition(f, sec),
      });
    }
  }

  const reachableEntries = contextVisibleEntries.filter((entry) =>
    isFieldDependencyReachable(entry, allFormFields, contextVisibleEntries, effectiveContext)
  );

  // 3. Build Standard Applicant Details Columns (100% aligned with ApplicantInformationFormSection.tsx)
  const baseCols: Array<{ header: string; sample1: string; sample2: string }> = isCorporateService
    ? [
        { header: "Business Name", sample1: "Acme Communications Corp.", sample2: "Metro Radio Supplies" },
        { header: "Entity Type", sample1: "Corporation", sample2: "Single Proprietorship" },
        { header: "DTI/SEC No", sample1: "SEC-CS202100982", sample2: "DTI-0981284" },
        { header: "Representative First Name", sample1: "Juan", sample2: "Maria" },
        { header: "Representative Middle Name", sample1: "Reyes", sample2: "Santos" },
        { header: "Representative Last Name", sample1: "Dela Cruz", sample2: "Aquino" },
        { header: "Representative Suffix", sample1: "", sample2: "" },
        { header: "Representative Position", sample1: "Managing Director", sample2: "General Manager" },
        { header: "Contact Number", sample1: "09171234567", sample2: "09189876543" },
        { header: "Email", sample1: "regulatory@acme.ph", sample2: "sales@metroradio.ph" },
        { header: "Region", sample1: "National Capital Region (NCR)", sample2: "Region VII (Central Visayas)" },
        { header: "Province", sample1: "Metro Manila", sample2: "Cebu" },
        { header: "City / Municipality", sample1: "Quezon City", sample2: "Cebu City" },
        { header: "Barangay", sample1: "Diliman", sample2: "Mabolo" },
        { header: "Street Address", sample1: "Unit 402, 123 Commonwealth Ave", sample2: "456 MJ Cuenco Ave" },
        { header: "Zip Code", sample1: "1101", sample2: "6000" },
      ]
    : [
        { header: "First Name", sample1: "Juan", sample2: "Maria" },
        { header: "Middle Name", sample1: "Reyes", sample2: "Santos" },
        { header: "Last Name", sample1: "Dela Cruz", sample2: "Aquino" },
        { header: "Suffix", sample1: "", sample2: "Jr." },
        { header: "Date of Birth", sample1: "1995-05-12", sample2: "1998-11-20" },
        { header: "Sex", sample1: "Male", sample2: "Female" },
        { header: "Civil Status", sample1: "Single", sample2: "Married" },
        { header: "Nationality", sample1: "Filipino", sample2: "Filipino" },
        { header: "Contact Number", sample1: "09171234567", sample2: "09189876543" },
        { header: "Email", sample1: "juan.delacruz@example.ph", sample2: "maria.aquino@example.ph" },
        { header: "Region", sample1: "National Capital Region (NCR)", sample2: "Region VII (Central Visayas)" },
        { header: "Province", sample1: "Metro Manila", sample2: "Cebu" },
        { header: "City / Municipality", sample1: "Quezon City", sample2: "Cebu City" },
        { header: "Barangay", sample1: "Diliman", sample2: "Mabolo" },
        { header: "Street Address", sample1: "Unit 402, 123 Commonwealth Ave", sample2: "456 MJ Cuenco Ave" },
        { header: "Zip Code", sample1: "1101", sample2: "6000" },
      ];

  const headers: string[] = [];
  const sampleRow1: string[] = [];
  const sampleRow2: string[] = [];
  const seenHeaderSlugs = new Set<string>();
  const baseHeaderSlugs = new Set<string>();
  const rowSampleValues: [Record<string, string>, Record<string, string>] = [{}, {}];

  const recordSampleValue = (
    rowIndex: 0 | 1,
    headerLabel: string,
    val: string,
    field?: FieldDto
  ) => {
    const map = rowSampleValues[rowIndex];
    map[headerLabel] = val;
    map[headerLabel.toLowerCase().trim()] = val;
    const slug = normalizeHeaderSlug(headerLabel);
    if (slug) map[slug] = val;
    if (field) {
      if (field.fieldId) map[field.fieldId] = val;
      if (field.id) map[field.id] = val;
      if (field.label) {
        map[field.label] = val;
        map[field.label.toLowerCase().trim()] = val;
      }
    }
  };

  const dropdownValidations: DropdownFieldValidation[] = [];

  for (const base of baseCols) {
    const slug = normalizeHeaderSlug(base.header);
    const customOverride = customPersonalDropdowns.get(slug);

    if (customOverride && customOverride.options.length > 0) {
      const primaryField = customOverride.field;
      dropdownValidations.push({
        fieldId: primaryField
          ? typeof primaryField.fieldId === "string"
            ? primaryField.fieldId
            : primaryField.id
          : undefined,
        header: base.header,
        label: base.header,
        allowedOptions: customOverride.options,
      });
      const s1 = customOverride.options[0] || base.sample1;
      const s2 = customOverride.options[1 % customOverride.options.length] || base.sample2;
      headers.push(base.header);
      sampleRow1.push(s1);
      sampleRow2.push(s2);
      recordSampleValue(0, base.header, s1, primaryField);
      recordSampleValue(1, base.header, s2, primaryField);
    } else {
      headers.push(base.header);
      sampleRow1.push(base.sample1);
      sampleRow2.push(base.sample2);
      recordSampleValue(0, base.header, base.sample1);
      recordSampleValue(1, base.header, base.sample2);

      if (slug === "sex" && !isCorporateService) {
        dropdownValidations.push({
          header: "Sex",
          label: "Sex",
          allowedOptions: ["Male", "Female"],
        });
      } else if (slug === "civilstatus" && !isCorporateService) {
        dropdownValidations.push({
          header: "Civil Status",
          label: "Civil Status",
          allowedOptions: ["Single", "Married", "Widowed", "Separated"],
        });
      } else if (slug === "suffix" && !isCorporateService) {
        dropdownValidations.push({
          header: "Suffix",
          label: "Suffix",
          allowedOptions: SUFFIX_DROPDOWN_OPTIONS,
        });
      } else if (slug === "representativesuffix" && isCorporateService) {
        dropdownValidations.push({
          header: "Representative Suffix",
          label: "Representative Suffix",
          allowedOptions: SUFFIX_DROPDOWN_OPTIONS,
        });
      } else if (slug === "region") {
        dropdownValidations.push({
          header: "Region",
          label: "Region",
          allowedOptions: PHILIPPINE_REGION_OPTIONS,
        });
      } else if (slug === "entitytype" && isCorporateService) {
        dropdownValidations.push({
          header: "Entity Type",
          label: "Entity Type",
          allowedOptions: [
            "Corporation",
            "Single Proprietorship",
            "Partnership",
            "Government",
            "Cooperative",
            "Association",
            "Non-Profit",
            "Others",
          ],
        });
      }
    }

    seenHeaderSlugs.add(slug);
    baseHeaderSlugs.add(slug);
  }

  // Also reserve common aliases for baseCols so non-applicant fields with same names get disambiguated
  for (const alias of ["city", "municipality", "street", "address"]) {
    baseHeaderSlugs.add(alias);
  }

  // 4. Separate Repeater fields vs Standard Dynamic fields while preserving section order
  // Group non-repeater fields by a composite key that disambiguates collisions across sections
  interface ColumnGroup {
    groupKey: string;
    displayHeaderLabel: string;
    entries: ScopedFieldEntry[];
  }

  const orderedItems: Array<
    | { kind: "fieldGroup"; group: ColumnGroup }
    | { kind: "repeater"; entry: ScopedFieldEntry }
  > = [];
  const fieldGroupMap = new Map<string, ColumnGroup>();

  for (const entry of reachableEntries) {
    if (isFormFieldRepeater(entry.field)) {
      orderedItems.push({ kind: "repeater", entry });
      continue;
    }

    const rawLabel = typeof entry.field.label === "string" ? entry.field.label.trim() : "";
    const baseSlug = normalizeHeaderSlug(rawLabel);
    if (!baseSlug) continue;

    // Check if this field's label collides with baseCols (e.g. "Business Name" or "Contact Number" in Service Provider section)
    const collidesWithBase = baseHeaderSlugs.has(baseSlug);
    const secPrefix = cleanSectionPrefix(entry.section.title);

    let effectiveHeaderLabel = rawLabel;
    let groupKey = baseSlug;

    if (collidesWithBase && secPrefix.length > 0) {
      effectiveHeaderLabel = `${secPrefix} - ${rawLabel}`;
      groupKey = normalizeHeaderSlug(effectiveHeaderLabel);
    } else {
      const existingGroup = fieldGroupMap.get(baseSlug);
      if (existingGroup) {
        // Check if existingGroup is in a DIFFERENT section and both have no variant rules (meaning both appear on the form at the same time, e.g. "Remarks" in Station vs Antenna)
        const existingFirst = existingGroup.entries[0];
        const sameFieldId =
          existingFirst &&
          (existingFirst.field.fieldId || existingFirst.field.id) ===
            (entry.field.fieldId || entry.field.id);
        const sameSection =
          existingFirst &&
          (existingFirst.section.key || existingFirst.section.title) ===
            (entry.section.key || entry.section.title);

        if (!sameFieldId && !sameSection && secPrefix.length > 0) {
          effectiveHeaderLabel = `${secPrefix} - ${rawLabel}`;
          groupKey = normalizeHeaderSlug(effectiveHeaderLabel);
        }
      }
    }

    const existing = fieldGroupMap.get(groupKey);
    if (!existing) {
      const newGroup: ColumnGroup = {
        groupKey,
        displayHeaderLabel: effectiveHeaderLabel,
        entries: [entry],
      };
      fieldGroupMap.set(groupKey, newGroup);
      orderedItems.push({ kind: "fieldGroup", group: newGroup });
    } else {
      existing.entries.push(entry);
    }
  }

  // Respect variant-specific overrides within each fieldGroup
  for (const group of fieldGroupMap.values()) {
    if (group.entries.length > 1) {
      const variantSpecific = group.entries.filter((e) => e.hasVariantRule);
      if (variantSpecific.length > 0) {
        group.entries = variantSpecific;
      }
    }
  }

  const collectDistinctOptions = (entries: ScopedFieldEntry[]): string[] => {
    const optLabels: string[] = [];
    for (const entry of entries) {
      const opts = resolveEffectiveFieldOptions(
        entry.field,
        effectiveContext,
        rowSampleValues[0]
      );
      for (const opt of opts) {
        const oLabel =
          typeof opt.label === "string" && opt.label.trim().length > 0
            ? opt.label.trim()
            : typeof opt.value === "string"
            ? opt.value.trim()
            : "";
        if (oLabel.length > 0 && !optLabels.includes(oLabel)) {
          optLabels.push(oLabel);
        }
      }
    }
    return optLabels;
  };

  for (const item of orderedItems) {
    if (item.kind === "repeater") {
      const { entry } = item;
      const subCols = resolveRepeaterSubColumnsForField(entry.field, effectiveContext);
      const repeaterTitlePrefix = cleanSectionPrefix(entry.field.label || entry.section.title);

      for (const subCol of subCols) {
        let subHeaderLabel = subCol.label;
        let subSlug = normalizeHeaderSlug(subHeaderLabel);

        if (seenHeaderSlugs.has(subSlug) && repeaterTitlePrefix.length > 0) {
          subHeaderLabel = `${repeaterTitlePrefix} - ${subCol.label}`;
          subSlug = normalizeHeaderSlug(subHeaderLabel);
        }

        if (seenHeaderSlugs.has(subSlug)) {
          continue;
        }
        seenHeaderSlugs.add(subSlug);

        const optLabels =
          subCol.options && subCol.options.length > 0
            ? subCol.options
                .map((o) => (o.label || o.value || "").trim())
                .filter((s) => s.length > 0)
            : [];

        if (optLabels.length > 0) {
          dropdownValidations.push({
            fieldId: `${entry.field.fieldId || entry.field.id || "repeater"}:${subCol.subKey}`,
            header: subHeaderLabel,
            label: subHeaderLabel,
            allowedOptions: optLabels,
          });
        }

        const headerText = formatHeaderWithOptions(subHeaderLabel, optLabels);
        headers.push(headerText);
        sampleRow1.push(subCol.sample1);
        sampleRow2.push(subCol.sample2);
        recordSampleValue(0, subHeaderLabel, subCol.sample1);
        recordSampleValue(1, subHeaderLabel, subCol.sample2);
      }
      continue;
    }

    const { group } = item;
    if (seenHeaderSlugs.has(group.groupKey)) {
      continue;
    }
    seenHeaderSlugs.add(group.groupKey);

    const entries = group.entries;
    const primaryField = entries[0]?.field;
    if (!primaryField) continue;

    const rawLabel = group.displayHeaderLabel;
    const optLabels = collectDistinctOptions(entries);

    if (optLabels.length > 0) {
      dropdownValidations.push({
        fieldId: typeof primaryField.fieldId === "string" ? primaryField.fieldId : primaryField.id,
        header: rawLabel,
        label: rawLabel,
        allowedOptions: optLabels,
      });
    }

    const headerText = formatHeaderWithOptions(rawLabel, optLabels);
    headers.push(headerText);

    const rowIndices: Array<0 | 1> = [0, 1];
    for (const rowIndex of rowIndices) {
      const rowCtx: FormEvaluationContext = {
        ...effectiveContext,
        formValues: rowSampleValues[rowIndex],
      };
      const visibleEntryForRow = entries.find((e) =>
        isFieldRowVisible(e.field, e.section, rowCtx)
      );

      if (visibleEntryForRow) {
        const sampleVal = generateSampleValueForField(
          visibleEntryForRow.field,
          rowIndex,
          effectiveContext,
          rowSampleValues[rowIndex]
        );
        if (rowIndex === 0) {
          sampleRow1.push(sampleVal);
        } else {
          sampleRow2.push(sampleVal);
        }
        recordSampleValue(rowIndex, rawLabel, sampleVal, visibleEntryForRow.field);
      } else {
        if (rowIndex === 0) {
          sampleRow1.push("");
        } else {
          sampleRow2.push("");
        }
      }
    }
  }

  const code = typeof service.code === "string" ? service.code.toUpperCase() : "";
  const title = typeof service.title === "string" ? service.title.toUpperCase() : "";
  const rawFilename = (code || title || "NTC_Service").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${rawFilename}_Bulk_Template.xlsx`;

  return {
    filename,
    headers,
    sampleRows: [sampleRow1, sampleRow2],
    description: `Official batch filing template for ${service.title || "NTC Service"} generated dynamically from configured Form Builder fields.`,
    dropdownValidations,
  };
}

function getStaticSpreadsheetTemplateForService(service: NTCService): SpreadsheetTemplateConfig {
  const code = (service.code || "").toUpperCase();
  const title = (service.title || "").toUpperCase();

  // 1. CPE Supplier Accreditation (NTC 1-18)
  if (code === "NTC_1_18" || title.includes("CUSTOMER PREMISES") || title.includes("ACCREDITATION")) {
    return {
      filename: "NTC_CPE_Supplier_Accreditation_Template.xlsx",
      headers: [
        "Business Name",
        "Entity Type",
        "DTI/SEC No",
        "Representative First Name",
        "Representative Middle Name",
        "Representative Last Name",
        "Representative Suffix",
        "Representative Position",
        "Contact Number",
        "Email",
        "Region",
        "Province",
        "City / Municipality",
        "Barangay",
        "Street Address",
        "Zip Code",
        "Supervising Engineer",
        "Certificate/ECT No.",
        "Certificate/ECT No. Date of Expiry",
        "Technician Name",
        "Certificate/Number",
        "Certificate/Number Date of Expiry",
      ],
      sampleRows: [
        [
          "Acme Communications Corp.",
          "Corporation",
          "SEC-CS202100982",
          "Juan",
          "Reyes",
          "Dela Cruz",
          "",
          "Managing Director",
          "09171234567",
          "regulatory@acme.ph",
          "National Capital Region (NCR)",
          "Metro Manila",
          "Quezon City",
          "Diliman",
          "Unit 402, Commonwealth Ave",
          "1101",
          "Engr. Roberto Dela Cruz",
          "PECE-0012948",
          "2027-12-31",
          "Juan Santos",
          "ECT-009812",
          "2027-12-31",
        ],
        [
          "Metro Radio Supplies",
          "Single Proprietorship",
          "DTI-0981284",
          "Maria",
          "Santos",
          "Aquino",
          "",
          "General Manager",
          "09189876543",
          "sales@metroradio.ph",
          "Region VII (Central Visayas)",
          "Cebu",
          "Cebu City",
          "Mabolo",
          "Bldg A, MJ Cuenco Ave",
          "6000",
          "Engr. Maria Santos",
          "PECE-0044912",
          "2028-06-30",
          "Pedro Reyes",
          "ECT-003412",
          "2028-06-30",
        ],
      ],
      description: "Use this template for bulk filing of Customer Premises Equipment (CPE) Supplier Accreditation.",
    };
  }

  // 2. Radio Operator Exam (NTC 1-01)
  if (code === "NTC_1_01" || title.includes("RADIO OPERATOR EXAM") || title.includes("EXAMINATION")) {
    return {
      filename: "NTC_Radio_Operator_Exam_Template.xlsx",
      headers: [
        "First Name",
        "Middle Name",
        "Last Name",
        "Suffix",
        "Date of Birth",
        "Sex",
        "Civil Status",
        "Nationality",
        "Contact Number",
        "Email",
        "Region",
        "Province",
        "City / Municipality",
        "Barangay",
        "Street Address",
        "Zip Code",
        "School / University Attended",
        "Course / Degree Program",
        "Year Graduated",
      ],
      sampleRows: [
        [
          "Juan",
          "Manuel",
          "Dela Cruz",
          "Jr.",
          "1995-05-15",
          "Male",
          "Single",
          "Filipino",
          "09171234567",
          "juan.delacruz@email.com",
          "National Capital Region (NCR)",
          "Metro Manila",
          "Quezon City",
          "Diliman",
          "123 Agham Road",
          "1101",
          "Technological University of the Philippines",
          "BS Electronics Engineering",
          "2018",
        ],
        [
          "Maria",
          "Santos",
          "Reyes",
          "",
          "1998-08-22",
          "Female",
          "Married",
          "Filipino",
          "09189876543",
          "maria.reyes@email.com",
          "Region VII (Central Visayas)",
          "Cebu",
          "Cebu City",
          "Mabolo",
          "456 Osmeña Blvd",
          "6000",
          "University of San Carlos",
          "BS Information Technology",
          "2020",
        ],
      ],
      description: "Use this template for batch filing of Radio Operator Examination admission slips.",
    };
  }

  // Default Standard General Template (Aligned with ApplicantInformationFormSection)
  return {
    filename: `${(service.code || "NTC_Service").replace(/\s+/g, "_")}_Bulk_Template.xlsx`,
    headers: [
      "First Name",
      "Middle Name",
      "Last Name",
      "Suffix",
      "Date of Birth",
      "Sex",
      "Civil Status",
      "Nationality",
      "Contact Number",
      "Email",
      "Region",
      "Province",
      "City / Municipality",
      "Barangay",
      "Street Address",
      "Zip Code",
    ],
    sampleRows: [
      [
        "Juan",
        "Reyes",
        "Dela Cruz",
        "",
        "1995-05-12",
        "Male",
        "Single",
        "Filipino",
        "09171234567",
        "juan.delacruz@example.com",
        "National Capital Region (NCR)",
        "Metro Manila",
        "Quezon City",
        "Diliman",
        "Unit 402, 123 Commonwealth Ave",
        "1101",
      ],
      [
        "Maria",
        "Santos",
        "Aquino",
        "",
        "1998-11-20",
        "Female",
        "Married",
        "Filipino",
        "09189876543",
        "maria.aquino@example.com",
        "Region VII (Central Visayas)",
        "Cebu",
        "Cebu City",
        "Mabolo",
        "456 MJ Cuenco Ave",
        "6000",
      ],
    ],
    description: `Batch applicant intake template for ${service.title}.`,
  };
}

export function getSpreadsheetTemplateForService(
  service: NTCService,
  form?: FormDto | null,
  evaluationContext?: FormEvaluationContext
): SpreadsheetTemplateConfig {
  if (form && Array.isArray(form.sections) && form.sections.length > 0) {
    const dynamicTemplate = buildDynamicSpreadsheetTemplate(service, form, evaluationContext);
    if (dynamicTemplate) {
      return dynamicTemplate;
    }
  }

  const staticConfig = getStaticSpreadsheetTemplateForService(service);
  return enrichStaticTemplate(staticConfig);
}

export function generateCsvContent(config: SpreadsheetTemplateConfig): string {
  const escapeCell = (val: string): string => {
    if (val.includes(",") || val.includes("\"") || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const headerLine = config.headers.map(escapeCell).join(",");
  const rowLines = config.sampleRows.map((row) => row.map(escapeCell).join(","));

  return [headerLine, ...rowLines].join("\r\n");
}
