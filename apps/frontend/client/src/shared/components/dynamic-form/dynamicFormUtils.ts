import { FieldDto, FormSectionDto, FormVariantFlags, DynamicFormRendererProps } from "./dynamicFormTypes";
import {
  FIELD_ID_FULL_NAME,
  FIELD_ID_BIRTH_DATE,
  FIELD_ID_REGION,
  FIELD_ID_PROVINCE,
  FIELD_ID_CITY,
  FIELD_ID_BARANGAY,
  FIELD_ID_ENTITY_TYPE,
  FIELD_ID_COMPANY_NAME,
  FIELD_ID_APPLICANT_NAME,
  FIELD_ID_REP_NAME,
  FIELD_ID_DTI_SEC_REG,
} from "../../constants/fieldIds";

export function buildFormVariantFlags(
  serviceCategory?: string,
  serviceTitle?: string,
  selectedVariantId?: string,
  variants: DynamicFormRendererProps["variants"] = [],
  variantElements: DynamicFormRendererProps["variantElements"] = [],
  applicantType?: "individual" | "company"
): FormVariantFlags {
  const catLower = (serviceCategory || "").trim().toLowerCase();
  const titLower = (serviceTitle || "").trim().toLowerCase();
  const matchedVariant = variants.find((v) => String(v.id) === String(selectedVariantId)) || variants[0];
  const varDesc = (matchedVariant?.description || matchedVariant?.name || "").trim().toLowerCase();
  const varType = (matchedVariant?.type || "").trim().toLowerCase();

  const isVas = catLower.includes("certificate") && (titLower.includes("value-added") || titLower.includes("vas") || varDesc.includes("vas") || varDesc.includes("value-added"));
  const isDuplicateCopy = varDesc.includes("duplicate");
  const isCertifiedTrueCopy = varDesc.includes("certified true copy") || varDesc.includes("true copy");
  const isCopyOfCert = (catLower.includes("certificate") || catLower.includes("permit")) && (titLower.includes("copy") || titLower.includes("ntc 1-21") || titLower.includes("ntc_1_21") || isDuplicateCopy || isCertifiedTrueCopy);
  const isAmateurPermitService = catLower.includes("permit") && (titLower.includes("amateur") || titLower.includes("ntc 1-09") || titLower.includes("ntc_1_09") || varDesc.includes("amateur"));
  const isAeroService =
    catLower.includes("aeronautical") ||
    titLower.includes("aeronautical") ||
    varDesc.includes("aeronautical") ||
    (serviceTitle || "").trim().toLowerCase().includes("aeronautical");
  const isAeroStationPurchase =
    isAeroService &&
    varDesc.includes("permit to purchase") &&
    (varDesc.includes("aeronautical station") || !varDesc.includes("aircraft"));
  const isAeroStationPossess =
    isAeroService &&
    (varDesc.includes("permit to possess") || varDesc.includes("possess")) &&
    !varDesc.includes("purchase") &&
    !varDesc.includes("storage") &&
    (varDesc.includes("aeronautical station") || !varDesc.includes("aircraft"));
  const isAmateurPurchasePossessVariant =
    isAmateurPermitService &&
    !varDesc.includes("storage") &&
    (varDesc.includes("purchase/possess") ||
      varDesc.includes("purchase / possess") ||
      varDesc.includes("purchase to possess") ||
      varDesc.includes("purchase and possess") ||
      titLower.includes("purchase/possess") ||
      titLower.includes("purchase / possess") ||
      titLower.includes("purchase to possess") ||
      titLower.includes("purchase and possess"));
  const isAmateurPurchaseVariant =
    isAmateurPermitService &&
    !varDesc.includes("storage") &&
    (varDesc.includes("permit to purchase") ||
      varDesc.includes("purchase/possess") ||
      varDesc.includes("purchase to possess") ||
      titLower.includes("permit to purchase") ||
      titLower.includes("purchase/possess") ||
      titLower.includes("purchase to possess") ||
      (varDesc.includes("purchase") && !varDesc.includes("sell")));
  const isAmateurSellTransfer =
    isAmateurPermitService &&
    (varDesc.includes("sell") || varDesc.includes("transfer") || titLower.includes("sell") || titLower.includes("transfer"));
  const isAmateurStorageVariant =
    isAmateurPermitService &&
    (varDesc.includes("storage") || titLower.includes("storage"));
  const isAmateurCert = catLower.includes("certificate") && (titLower.includes("amateur") || titLower.includes("ntc 1-03") || titLower.includes("ntc_1_03"));
  const isCpeAccreditation = catLower.includes("accreditation") && (titLower.includes("customer premises") || titLower.includes("cpe"));
  const isRocService = catLower.includes("certificate") && (titLower.includes("radio operator certificates (roc)") || titLower.includes("ntc 1-02"));
  const isModification = varType.includes("modification") || varDesc.includes("modification");
  const isRenewal = varType.includes("renewal") || varDesc.includes("renewal");
  const isRenewalOrMod = isRenewal || isModification;
  const isLifetimeSupplementary = varDesc.includes("lifetime amateur radio station supplementary");
  const isVanity = varDesc.includes("vanity call sign") || varDesc.includes("vanity");
  const isVanityRen = isVanity && (varType.includes("renewal") || varDesc.includes("renewal"));
  const isVanityNew = isVanity && !isVanityRen;
  const isSpecialEvent = varDesc.includes("special event");
  const isForeignVisitor = varDesc.includes("foreign visitor");
  const isVanityOrSpecialEvent = isVanity || isSpecialEvent;
  const isNonIndividualEntity = applicantType === "company" || isAeroStationPurchase || isAeroStationPossess || (!applicantType && matchedVariant?.isIndividual === false && !isVanityOrSpecialEvent);
  const isIndividualVar = !isNonIndividualEntity;
  const showElements = !isCopyOfCert && variantElements.length > 0 && !isLifetimeSupplementary && !varDesc.includes("special radio operator");
  const showNumberOfYears = !isDuplicateCopy && !isCertifiedTrueCopy && !isVas && (isCpeAccreditation || isRocService || (isAmateurCert && isModification) || (isAmateurPermitService && (isForeignVisitor || isVanityNew || isVanityRen || isSpecialEvent)));
  const isPermitService =
    catLower.includes("permit") ||
    titLower.includes("permit") ||
    varDesc.includes("permit") ||
    isAmateurPermitService;

  return {
    catLower,
    titLower,
    varDesc,
    varType,
    isVas,
    isDuplicateCopy,
    isCertifiedTrueCopy,
    isCopyOfCert,
    isAmateurPermitService,
    isAeroService,
    isAeroStationPurchase,
    isAeroStationPossess,
    isAmateurPurchaseVariant,
    isAmateurPurchasePossessVariant,
    isAmateurStorageVariant,
    isAmateurSellTransfer,
    isAmateurCert,
    isCpeAccreditation,
    isRocService,
    isModification,
    isRenewal,
    isRenewalOrMod,
    isLifetimeSupplementary,
    isVanity,
    isVanityRen,
    isVanityNew,
    isSpecialEvent,
    isForeignVisitor,
    isVanityOrSpecialEvent,
    isNonIndividualEntity,
    isIndividualVar,
    showElements,
    showNumberOfYears,
    isPermitService,
  };
}

export function getElementFieldLabel(category?: string, title?: string): string {
  const cat = (category || "").toLowerCase();
  const tit = (title || "").toLowerCase();

  if (cat.includes("certificate") || tit.includes("certificate") || tit.includes("cert")) return "Type of Certificate";
  if (cat.includes("license") || cat.includes("licence") || tit.includes("license") || tit.includes("licence")) {
    if (tit.includes("amateur") || tit.includes("station") || tit.includes("radio")) return "Class of Station";
    return "Type of License";
  }
  if (cat.includes("permit") || tit.includes("permit")) return "Type of Permit";
  if (cat.includes("exam") || tit.includes("exam") || tit.includes("admission") || tit.includes("operator examination")) return "Exam Element / Station Class";
  if (cat.includes("accreditation") || tit.includes("accreditation")) return "Accreditation Category";
  return "Classification / Element";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export interface ValidationRulesMetadata {
  cols?: 1 | 2;
  placeholder?: string;
  helpText?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  acceptedFileTypes?: string;
  maxFileSizeMb?: number;
}

export function parseValidationRulesMetadata(field: FieldDto): ValidationRulesMetadata {
  const meta: ValidationRulesMetadata = {};
  if (typeof field.validationRules === "string" && field.validationRules.trim().startsWith("{")) {
    try {
      const parsed: unknown = JSON.parse(field.validationRules);
      if (isRecord(parsed)) {
        if (parsed.cols === 1 || parsed.cols === 2) {
          meta.cols = parsed.cols;
        }
        if (typeof parsed.placeholder === "string" && parsed.placeholder.trim().length > 0) {
          meta.placeholder = parsed.placeholder.trim();
        }
        if (typeof parsed.helpText === "string" && parsed.helpText.trim().length > 0) {
          meta.helpText = parsed.helpText.trim();
        }
        if (typeof parsed.minLength === "number") meta.minLength = parsed.minLength;
        if (typeof parsed.maxLength === "number") meta.maxLength = parsed.maxLength;
        if (typeof parsed.min === "number") meta.min = parsed.min;
        if (typeof parsed.max === "number") meta.max = parsed.max;
        if (typeof parsed.acceptedFileTypes === "string") meta.acceptedFileTypes = parsed.acceptedFileTypes;
        if (typeof parsed.maxFileSizeMb === "number") meta.maxFileSizeMb = parsed.maxFileSizeMb;
      }
    } catch {
      // Ignore invalid JSON
    }
  }
  return meta;
}

export function parseOptions(field: FieldDto): Array<{ label: string; value: string }> {
  const normalizeItem = (item: unknown): { label: string; value: string } | null => {
    if (item === null || item === undefined) return null;
    if (typeof item === "string") {
      const trimmed = item.trim();
      return trimmed.length > 0 ? { label: trimmed, value: trimmed } : null;
    }
    if (typeof item === "number" || typeof item === "boolean") {
      const str = String(item);
      return { label: str, value: str };
    }
    if (isRecord(item)) {
      const rawLabel = item["label"];
      const rawName = item["name"];
      const rawValue = item["value"];
      const rawId = item["id"];
      const label =
        typeof rawLabel === "string"
          ? rawLabel
          : typeof rawName === "string"
          ? rawName
          : typeof rawValue === "string"
          ? rawValue
          : "";
      const value =
        typeof rawValue === "string"
          ? rawValue
          : typeof rawId === "string"
          ? rawId
          : label;
      if (label.length > 0 || value.length > 0) {
        return {
          label: label.length > 0 ? label : value,
          value: value.length > 0 ? value : label,
        };
      }
    }
    return null;
  };

  // 1. Direct field.options (if provided in DTO)
  if (field.options !== null && field.options !== undefined && Array.isArray(field.options) && field.options.length > 0) {
    const list: Array<{ label: string; value: string }> = [];
    for (let i = 0; i < field.options.length; i++) {
      const norm = normalizeItem(field.options[i]);
      if (norm !== null) {
        list.push(norm);
      }
    }
    if (list.length > 0) {
      return list;
    }
  }

  // 2. Parsed from validationRules (supports raw JSON array string and { options: [...] } envelope)
  if (field.validationRules !== null && field.validationRules !== undefined && typeof field.validationRules === "string") {
    try {
      const parsed: unknown = JSON.parse(field.validationRules);
      let targetArray: unknown[] | null = null;
      if (Array.isArray(parsed)) {
        targetArray = parsed;
      } else if (isRecord(parsed)) {
        const rawOpts = parsed["options"];
        if (Array.isArray(rawOpts)) {
          targetArray = rawOpts;
        }
      }

      if (targetArray !== null) {
        const list: Array<{ label: string; value: string }> = [];
        for (let i = 0; i < targetArray.length; i++) {
          const norm = normalizeItem(targetArray[i]);
          if (norm !== null) {
            list.push(norm);
          }
        }
        return list;
      }
    } catch {
      // Ignored if not JSON
    }
  }

  return [];
}

export function getFieldSortPriority(field: FieldDto, defaultIndex: number): number {
  if (!field) return defaultIndex;
  const labelLower = (field.label || "").toLowerCase().trim();
  const idLower = (field.fieldId || field.id || "").toLowerCase().trim();

  // Company / Applicant Name topmost in Applicant Details
  if (
    idLower === "applicantname" ||
    idLower === "companyname" ||
    idLower === "businessname" ||
    idLower === FIELD_ID_COMPANY_NAME.toLowerCase() ||
    idLower === FIELD_ID_APPLICANT_NAME.toLowerCase() ||
    labelLower === "applicant name" ||
    labelLower === "company / business name" ||
    labelLower === "company name" ||
    labelLower === "business / registered entity name" ||
    labelLower === "business name"
  ) {
    return 0;
  }

  // Representative Name right after Applicant Name
  if (
    idLower === "representativename" ||
    idLower === FIELD_ID_REP_NAME.toLowerCase() ||
    labelLower.includes("representative") ||
    labelLower.includes("authorized representative")
  ) {
    return 1;
  }

  // Entity Type and SEC/DTI Registration Number in Row 2
  if (idLower === "entitytype" || idLower === FIELD_ID_ENTITY_TYPE.toLowerCase() || labelLower === "entity type" || labelLower.includes("entity type")) return 2;
  if (idLower === "dtisecregistration" || idLower === "dti_sec_registration" || idLower === FIELD_ID_DTI_SEC_REG.toLowerCase() || labelLower.includes("sec / dti") || labelLower.includes("sec/dti") || labelLower.includes("dti / sec") || labelLower.includes("dti/sec")) return 3;

  // Personal Identity Fields
  if (labelLower.includes("full name") || labelLower.includes("legal name") || idLower === "fullname" || idLower === FIELD_ID_FULL_NAME.toLowerCase()) return 3;
  if (labelLower.includes("birth") || idLower === "birthdate" || idLower === FIELD_ID_BIRTH_DATE.toLowerCase()) return 4;
  if (labelLower.includes("sex") || labelLower.includes("gender")) return 5;
  if (labelLower.includes("civil status")) return 6;
  if (labelLower.includes("nationality") || labelLower.includes("citizenship")) return 7;

  // Address Fields
  if (labelLower === "region" || idLower === "region" || idLower === FIELD_ID_REGION.toLowerCase()) return 10;
  if (labelLower === "province" || idLower === "province" || idLower === FIELD_ID_PROVINCE.toLowerCase()) return 20;
  if (labelLower === "city" || labelLower.includes("city / municipality") || labelLower.includes("municipality") || idLower === "city" || idLower === FIELD_ID_CITY.toLowerCase()) return 30;
  if (labelLower === "barangay" || idLower === "barangay" || idLower === FIELD_ID_BARANGAY.toLowerCase()) return 40;
  if (labelLower.includes("street") || idLower === "street" || labelLower.includes("unit") || labelLower.includes("building") || idLower === "address" || labelLower === "complete address") return 50;
  if (labelLower.includes("zip") || labelLower.includes("postal") || idLower === "zipcode" || idLower === "postalcode") return 60;

  // Contact Fields
  if (labelLower.includes("contact") || labelLower.includes("mobile") || labelLower.includes("phone") || idLower === "contactno" || idLower === "mobileno") return 70;
  if (labelLower.includes("email") || idLower === "email") return 80;

  // Technical Personnel Fields (Supervising Engineer & Technician)
  if (idLower === "supervisingengineer" || labelLower === "supervising engineer") return 90;
  if (idLower === "supervisingengineercertno" || idLower === "certificateectno" || labelLower === "certificate/ect no." || (labelLower.includes("certificate/ect") && !labelLower.includes("expiry"))) return 91;
  if (idLower === "supervisingengineerexpirydate" || idLower === "certificateectexpirydate" || labelLower.includes("certificate/ect no. date of expiry") || labelLower.includes("certificate/ect date of expiry")) return 92;
  if (idLower === "technicianname" || labelLower === "technician name") return 93;
  if (idLower === "techniciancertno" || labelLower === "certificate/number" || (labelLower.includes("certificate/number") && !labelLower.includes("expiry"))) return 94;
  if (idLower === "technicianexpirydate" || labelLower.includes("certificate/number date of expiry") || (labelLower.includes("expiry") && defaultIndex > 2)) return 95;

  // Station / Equipment fields
  if (idLower === "noofyears" || idLower === "no_of_years" || labelLower.includes("number of years") || labelLower.includes("no. of years")) return 200.5;
  if (idLower === "preferredcallsign" || idLower === "preferred_call_sign" || labelLower.includes("preferred call sign") || labelLower.includes("preferred")) return 201;
  if ((idLower === "callsign" || labelLower.includes("call sign")) && !idLower.includes("preferred") && !labelLower.includes("preferred")) return 201.5;
  if (idLower === "servicearea" || labelLower.includes("points of comm") || labelLower.includes("service area")) return 202;
  if (idLower === "frequency" || labelLower.includes("frequency: within") || labelLower === "frequency") return 203;
  if (idLower === "bandwidth" || labelLower === "bandwidth") return 204;
  if (idLower === "bandwidthunit" || labelLower === "unit") return 205;
  if (idLower === "emission" || labelLower === "emission") return 206;
  if (idLower === "poweroutput" || labelLower.includes("power output")) return 207;
  if (idLower === "hoursofoperation" || labelLower.includes("hours of operation")) return 208;
  if (idLower === "stationclass" || labelLower.includes("station class") || labelLower.includes("class of station")) return 209;
  if (idLower === "exactlocation" || labelLower.includes("exact location")) return 210;
  if (idLower === "longitude" || labelLower.includes("longitude")) return 211;
  if (idLower === "latitude" || labelLower.includes("latitude")) return 212;
  if (idLower === "configuration" || labelLower.includes("configuration")) return 213;
  if (idLower === "datarate" || labelLower.includes("data rate")) return 214;
  if (idLower === "remarks" || labelLower.includes("remarks")) return 215;
  if (idLower === "equipmentdetails" || labelLower.includes("particulars of equipment")) return 216;

  return 300 + defaultIndex;
}

export function getSectionTitle(
  sec: FormSectionDto,
  flagsOrAmateurPermit: FormVariantFlags | boolean,
  isAmateurPurchaseVariant?: boolean,
  isVanityOrSpecialEvent?: boolean,
  isForeignVisitor?: boolean,
  isAmateurSellTransfer?: boolean,
  isAeroStationPurchase?: boolean
): string {
  const isAmateurPermitService =
    typeof flagsOrAmateurPermit === "object"
      ? flagsOrAmateurPermit.isAmateurPermitService
      : flagsOrAmateurPermit;
  const isStorage =
    typeof flagsOrAmateurPermit === "object"
      ? flagsOrAmateurPermit.isAmateurStorageVariant
      : false;
  const isPurchase =
    typeof flagsOrAmateurPermit === "object"
      ? flagsOrAmateurPermit.isAmateurPurchaseVariant
      : Boolean(isAmateurPurchaseVariant);
  const isVanitySpecial =
    typeof flagsOrAmateurPermit === "object"
      ? flagsOrAmateurPermit.isVanityOrSpecialEvent
      : Boolean(isVanityOrSpecialEvent);
  const isForeign =
    typeof flagsOrAmateurPermit === "object"
      ? flagsOrAmateurPermit.isForeignVisitor
      : Boolean(isForeignVisitor);
  const isSellTransfer =
    typeof flagsOrAmateurPermit === "object"
      ? flagsOrAmateurPermit.isAmateurSellTransfer
      : Boolean(isAmateurSellTransfer);
  const isAeroPurchase =
    typeof flagsOrAmateurPermit === "object"
      ? flagsOrAmateurPermit.isAeroStationPurchase
      : Boolean(isAeroStationPurchase);

  if (isAmateurPermitService || isAeroPurchase) {
    const k = (sec.key || sec.id || "").trim().toLowerCase();
    const t = (sec.title || "").trim().toLowerCase();
    if (k === "applicant" || t.includes("applicant")) return "Applicant Details";
    if (k === "stationequipment" || k === "proposedstation" || t.includes("station/equipment") || t.includes("proposed station") || t.includes("station") || k === "particulars" || t.includes("particulars")) {
      if (isStorage) return "Station/Equipment";
      if (isPurchase || isVanitySpecial) return "Particulars";
      if (isSellTransfer) return "Particulars of Station, Equipment & Antenna";
      if (isForeign) return "Particulars of Equipment";
      return "Particulars of Proposed Station / Equipment";
    }
    if (k === "sourceofequipment" || t.includes("source")) return "Source of Equipment";
    if (k === "intendeduse" || t.includes("intended")) return "Intended Use of Equipment";
    if (k === "declaration" || t.includes("declaration") || t.includes("acknowledgement")) {
      return "Acknowledgement & Applicant Signature";
    }
  }
  return sec.title;
}

export interface FormEvaluationContext {
  serviceCategory?: string;
  serviceTitle?: string;
  serviceName?: string;
  serviceCode?: string;
  applicationType?: string;
  variantType?: string;
  variantId?: string;
  variantName?: string;
  variantDescription?: string;
  elementCodes?: string[];
  elementNames?: string[];
  applicantType?: "individual" | "company";
  formValues?: Record<string, string>;
}

export interface SingleDependencyRule {
  fieldId?: string;
  fieldKey?: string;
  fieldLabel?: string;
  operator?: string;
  value?: unknown;
}

const SEMANTIC_FIELD_ALIASES: Record<string, string[]> = {
  loss_reason: ["fd000000-0000-0000-0000-000000000313", "incident type", "loss_reason"],
  "fd000000-0000-0000-0000-000000000313": ["loss_reason", "incident type", "fd000000-0000-0000-0000-000000000313"],
  complaint_types: ["fd000000-0000-0000-0000-000000000327", "nature of complaint", "complaint_types"],
  "fd000000-0000-0000-0000-000000000327": ["complaint_types", "nature of complaint", "fd000000-0000-0000-0000-000000000327"],
  knownbyanothername: ["fd000000-0000-0000-0000-000000000234", "known by other name", "knownbyanothername", "known_by_other_name"],
  "fd000000-0000-0000-0000-000000000234": ["knownbyanothername", "known by other name", "fd000000-0000-0000-0000-000000000234"],
  action_requested: ["fd000000-0000-0000-0000-000000000307", "action requested", "action_requested"],
  "fd000000-0000-0000-0000-000000000307": ["action_requested", "action requested", "fd000000-0000-0000-0000-000000000307"],
};

export function resolveFieldValue(formValues: Record<string, string>, dep: SingleDependencyRule): string | undefined {
  if (dep.fieldId && typeof formValues[dep.fieldId] === "string") {
    return formValues[dep.fieldId];
  }
  if (dep.fieldKey && typeof formValues[dep.fieldKey] === "string") {
    return formValues[dep.fieldKey];
  }
  if (dep.fieldLabel && typeof formValues[dep.fieldLabel] === "string") {
    return formValues[dep.fieldLabel];
  }

  const baseKeys = [dep.fieldId, dep.fieldKey, dep.fieldLabel]
    .filter((k): k is string => typeof k === "string" && k.length > 0)
    .map((k) => k.toLowerCase().trim());

  if (baseKeys.length === 0) return undefined;

  const expandedKeys = new Set<string>(baseKeys);
  for (const k of baseKeys) {
    const aliases = SEMANTIC_FIELD_ALIASES[k];
    if (aliases) {
      for (const a of aliases) {
        expandedKeys.add(a.toLowerCase().trim());
      }
    }
  }

  for (const [key, val] of Object.entries(formValues)) {
    if (expandedKeys.has(key.toLowerCase().trim())) {
      return val;
    }
  }

  return undefined;
}

export function checkSingleDependency(dep: SingleDependencyRule, formValues: Record<string, string>): boolean {
  const rawParentVal = resolveFieldValue(formValues, dep);
  const parentVal = rawParentVal !== undefined ? rawParentVal.trim() : "";
  const op = (dep.operator || "equals").toLowerCase();

  if (op === "notempty" || op === "is_not_empty") {
    return parentVal.length > 0;
  }

  if (op === "isempty" || op === "is_empty") {
    return parentVal.length === 0;
  }

  if (op === "in") {
    if (Array.isArray(dep.value)) {
      return dep.value.some((item) => {
        const itemStr = typeof item === "string" ? item.trim().toLowerCase() : String(item).trim().toLowerCase();
        return itemStr === parentVal.toLowerCase();
      });
    }
    return false;
  }

  const expectedStr =
    typeof dep.value === "string"
      ? dep.value.trim().toLowerCase()
      : dep.value !== null && dep.value !== undefined
      ? String(dep.value).trim().toLowerCase()
      : "";

  if (op === "notequals" || op === "not_equals") {
    return parentVal.toLowerCase() !== expectedStr;
  }

  if (op === "contains") {
    return expectedStr.length > 0 && parentVal.toLowerCase().includes(expectedStr);
  }

  // Default: equals
  return parentVal.toLowerCase() === expectedStr;
}

function toStringArray(val: unknown): string[] {
  if (typeof val === "string" && val.trim().length > 0) {
    return [val.trim()];
  }
  if (Array.isArray(val)) {
    return val
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .map((item) => item.trim());
  }
  return [];
}

export function evaluateVisibilityCondition(
  condition: string | null | undefined,
  context: FormEvaluationContext
): boolean {
  if (!condition || !condition.trim()) return true;

  try {
    const trimmed = condition.trim();

    // 1. JSON Rule Syntax
    if (trimmed.startsWith("{")) {
      const rule: unknown = JSON.parse(trimmed);
      if (!isRecord(rule)) return true;

      // Service Match (For forms shared across multiple services)
      const services = toStringArray(rule.services);
      if (services.length > 0) {
        const sTitle = (context.serviceTitle || "").toLowerCase().trim();
        const sName = (context.serviceName || "").toLowerCase().trim();
        const sCode = (context.serviceCode || "").toLowerCase().trim();
        const matchesService = services.some((s) => {
          const sLower = s.toLowerCase().trim();
          return (
            sLower === sTitle ||
            sLower === sName ||
            sLower === sCode ||
            (sTitle.length > 0 && sTitle.includes(sLower)) ||
            (sLower.length > 0 && sLower.includes(sTitle))
          );
        });
        if (!matchesService) return false;
      }

      // Service Code Match
      const serviceCodes = toStringArray(rule.serviceCodes);
      if (serviceCodes.length > 0) {
        const sCode = (context.serviceCode || "").toLowerCase().trim();
        const matchesCode = serviceCodes.some(
          (c) => c.toLowerCase().trim() === sCode
        );
        if (!matchesCode) return false;
      }

      // Application Type & Variant Description Match
      const appTypes = [
        ...toStringArray(rule.applicationTypes),
        ...toStringArray(rule.variantDescription),
      ];
      if (appTypes.length > 0) {
        const appType = (context.applicationType || "").toLowerCase().trim();
        const vType = (context.variantType || "").toLowerCase().trim();
        const vDesc = (context.variantDescription || "").toLowerCase().trim();
        const vName = (context.variantName || "").toLowerCase().trim();
        const matchesAppType = appTypes.some((t) => {
          const tLower = t.toLowerCase().trim();
          return (
            tLower === appType ||
            tLower === vType ||
            tLower === vDesc ||
            tLower === vName ||
            (vDesc.length > 0 && vDesc.includes(tLower)) ||
            (vName.length > 0 && vName.includes(tLower)) ||
            (appType.length > 0 && appType.includes(tLower))
          );
        });
        if (!matchesAppType) return false;
      }

      // Positive Variant Match (supports both Admin Builder `variants` and Seeder `variantType`)
      const variants = [
        ...toStringArray(rule.variants),
        ...toStringArray(rule.variantType),
      ];
      if (variants.length > 0) {
        const vType = (context.variantType || "").toUpperCase().trim();
        const vId = (context.variantId || "").trim();
        const vDesc = (context.variantDescription || "").toUpperCase().trim();
        const vName = (context.variantName || "").toUpperCase().trim();
        const matches = variants.some((v) => {
          const vUpper = v.toUpperCase().trim();
          return (
            vUpper === vType ||
            v === vId ||
            (vDesc.length > 0 && vDesc.includes(vUpper)) ||
            (vName.length > 0 && vName.includes(vUpper))
          );
        });
        if (!matches) return false;
      }

      // Negative Variant Match (Excluded)
      const excludedVariants = toStringArray(rule.excludedVariants);
      if (excludedVariants.length > 0) {
        const vType = (context.variantType || "").toUpperCase().trim();
        const vId = (context.variantId || "").trim();
        const matches = excludedVariants.some((v) => {
          const vUpper = v.toUpperCase().trim();
          return vUpper === vType || v === vId;
        });
        if (matches) return false;
      }

      // Element Codes & Names Match
      const elements = toStringArray(rule.elements);
      if (elements.length > 0) {
        const elemCodes = (context.elementCodes || []).map((c) => c.toLowerCase());
        const elemNames = (context.elementNames || []).map((n) => n.toLowerCase());
        const matches = elements.some((elem) => {
          const elemLower = elem.toLowerCase();
          return (
            elemCodes.includes(elemLower) ||
            elemCodes.some((c) => c.includes(elemLower) || elemLower.includes(c)) ||
            elemNames.some((n) => n.includes(elemLower) || elemLower.includes(n))
          );
        });
        if (!matches) return false;
      }

      // Applicant Type Match (array or single)
      const applicantTypes = toStringArray(rule.applicantTypes);
      if (applicantTypes.length > 0) {
        if (context.applicantType && !applicantTypes.includes(context.applicantType)) {
          return false;
        }
      } else if (typeof rule.applicantType === "string" && rule.applicantType !== context.applicantType) {
        return false;
      }

      // Dynamic Inter-field Dependencies (`fieldDependencies`, `dependsOn`, or top-level `field`)
      const rawDeps = rule.fieldDependencies ?? rule.dependsOn;
      if (rawDeps && context.formValues) {
        const depList = Array.isArray(rawDeps) ? rawDeps : [rawDeps];
        for (const depItem of depList) {
          if (isRecord(depItem)) {
            const singleDep: SingleDependencyRule = {
              fieldId: typeof depItem.fieldId === "string" ? depItem.fieldId : typeof depItem.field === "string" ? depItem.field : undefined,
              fieldKey: typeof depItem.fieldKey === "string" ? depItem.fieldKey : undefined,
              fieldLabel: typeof depItem.fieldLabel === "string" ? depItem.fieldLabel : undefined,
              operator: typeof depItem.operator === "string" ? depItem.operator : undefined,
              value: depItem.value,
            };
            if (!checkSingleDependency(singleDep, context.formValues)) return false;
          }
        }
      } else if (typeof rule.field === "string" && rule.field.trim().length > 0) {
        if (!context.formValues) return false;
        const singleDep: SingleDependencyRule = {
          fieldId: rule.field.trim(),
          operator: typeof rule.operator === "string" ? rule.operator : "equals",
          value: rule.value,
        };
        if (!checkSingleDependency(singleDep, context.formValues)) return false;
      }

      return true;
    }

    // 2. Simple Semicolon Delimited Rule Syntax (e.g. "variant:NEW,MODIFICATION")
    const parts = trimmed.split(";").map((p) => p.trim());
    for (const part of parts) {
      if (part.startsWith("variant:")) {
        const allowed = part.replace("variant:", "").split(",").map((v) => v.trim().toUpperCase());
        const vType = (context.variantType || "").toUpperCase();
        if (!allowed.includes(vType)) return false;
      }
      if (part.startsWith("applicantType:")) {
        const allowed = part.replace("applicantType:", "").trim().toLowerCase();
        if (allowed !== (context.applicantType || "individual").toLowerCase()) return false;
      }
    }
    return true;
  } catch {
    return true;
  }
}


