import { FieldDto, FormSectionDto } from "../../../../shared/components/dynamic-form/dynamicFormTypes";
import {
  parseOptions,
  FormEvaluationContext,
  buildFormVariantFlags,
} from "../../../../shared/components/dynamic-form/dynamicFormUtils";
import {
  PERMIT_DETAILS_SERVICE_OPTIONS,
  AMATEUR_PERMIT_TYPES,
  AERONAUTICAL_PERMIT_TYPES,
  MARITIME_PERMIT_TYPES,
  FLM_PERMIT_TYPES,
  ROC_TYPE_OPTIONS,
  AMATEUR_CERT_TYPE_OPTIONS,
  DEVICE_REG_TYPE_OPTIONS,
  VAS_TYPE_OPTIONS,
  TVRO_TYPE_OPTIONS,
  resolvePermitTypes,
  resolveCertificateTypes,
} from "../../../../shared/components/dynamic-form/dynamicFormConstants";
import {
  FormRepeaterColumn,
} from "../../../../shared/components/form-repeater/formRepeaterTypes";
import {
  DEFAULT_AMATEUR_PURCHASE_PARTICULARS_COLUMNS,
  DEFAULT_AMATEUR_SELL_TRANSFER_PARTICULARS_COLUMNS,
  DEFAULT_AMATEUR_EQUIPMENT_REPEATER_COLUMNS,
  resolveRepeaterColumns,
} from "../../../../shared/components/form-repeater/formRepeaterColumns";
import { SPAM_COMPLAINT_NATURES, TELCO_COMPLAINT_NATURES } from "../../../../shared/components/NatureOfComplaintCheckboxGroup";
import { AVAILABLE_INTENDED_USES } from "../../../../shared/components/IntendedUseCheckboxGroup";
import { AVAILABLE_VAS_SERVICES } from "../../../../shared/components/VasServicesCheckboxGroup";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const STANDARD_APPLICANT_SYNC_FIELD_IDS = new Set([
  "fd000000-0000-0000-0000-000000000001", // fullName
  "fd000000-0000-0000-0000-000000000002", // birthDate
  "fd000000-0000-0000-0000-000000000003", // address
  "fd000000-0000-0000-0000-000000000004", // contactNo
  "fd000000-0000-0000-0000-000000000005", // email
  "fd000000-0000-0000-0000-000000000041", // sex
  "fd000000-0000-0000-0000-000000000042", // civilStatus
  "fd000000-0000-0000-0000-000000000043", // nationality
  "fd000000-0000-0000-0000-000000000051", // region
  "fd000000-0000-0000-0000-000000000052", // province
  "fd000000-0000-0000-0000-000000000053", // city
  "fd000000-0000-0000-0000-000000000054", // barangay
  "fd000000-0000-0000-0000-000000000055", // street
  "fd000000-0000-0000-0000-000000000056", // zipCode
  "fd000000-0000-0000-0000-000000000081", // companyName
  "fd000000-0000-0000-0000-000000000082", // representativeName
  "fd000000-0000-0000-0000-000000000083", // representativePosition
  "fd000000-0000-0000-0000-000000000086", // dtiSecRegistration
  "fd000000-0000-0000-0000-000000000088", // applicantName
  "fd000000-0000-0000-0000-000000000210", // middleName
  "fd000000-0000-0000-0000-000000000211", // suffix
]);

export function isPersonalInfoSection(sec: FormSectionDto): boolean {
  const k = (sec.key || sec.id || "").trim().toLowerCase();
  const t = (sec.title || "").trim().toLowerCase();
  return (
    k === "applicant" ||
    k === "applicantperson" ||
    k === "applicantparticulars" ||
    k === "applicantaddress" ||
    k === "applicantcontact" ||
    k === "applicant_information" ||
    k === "applicantinfo" ||
    k === "personalinfo" ||
    k === "personal_information" ||
    t === "applicant particulars" ||
    t === "applicant details" ||
    t === "applicant information"
  );
}

export function isNonInputSystemSection(sec: FormSectionDto): boolean {
  const k = (sec.key || sec.id || "").trim().toLowerCase();
  const t = (sec.title || "").trim().toLowerCase();
  return (
    k === "declaration" ||
    k === "declarationandundertaking" ||
    k === "declaration_section" ||
    k === "payment" ||
    k === "paymentdetails" ||
    k === "fees" ||
    k === "accounting" ||
    k === "cashier" ||
    k === "bsd" ||
    k === "vasregistration" ||
    t === "declaration" ||
    t === "acknowledgement & applicant signature" ||
    t === "payment details"
  );
}

export function isStandardApplicantSyncField(field: FieldDto, section?: FormSectionDto): boolean {
  if (section && isPersonalInfoSection(section)) return true;
  if ("syncBackOnSubmit" in field && field.syncBackOnSubmit === true) return true;
  const fId = (field.fieldId || field.id || "").trim().toLowerCase();
  if (STANDARD_APPLICANT_SYNC_FIELD_IDS.has(fId)) return true;
  return false;
}

export function isExcludedNonEditableField(field: FieldDto): boolean {
  const excludedTypes = new Set([
    "file",
    "upload",
    "attachment",
    "document",
    "signature",
    "header",
    "divider",
    "button",
    "label_only",
    "static_text",
  ]);
  const fType = typeof (field.type || field.fieldType) === "string"
    ? (field.type || field.fieldType || "").toLowerCase().trim()
    : "";
  if (excludedTypes.has(fType)) return true;

  const fId = (field.fieldId || field.id || "").toLowerCase().trim();
  const fLabel = (field.label || "").toLowerCase().trim();

  // Read-only NTC-assigned fields (BSD No. & VAS Registration No.)
  if (
    fId === "fd000000-0000-0000-0000-000000000226" ||
    fId === "fd000000-0000-0000-0000-000000000236" ||
    fId.includes("bsd") ||
    fId.includes("vasregistration") ||
    fId.includes("vasregno") ||
    fLabel.includes("bsd no") ||
    fLabel.includes("assigned by ntc")
  ) {
    return true;
  }

  // Legal declaration checkbox & signature
  if (
    fId === "fd000000-0000-0000-0000-000000000012" ||
    fId === "fd000000-0000-0000-0000-000000000013" ||
    fLabel.includes("hereby declare") ||
    fLabel.includes("applicant signature")
  ) {
    return true;
  }

  // File-only repeater ("Attached Proof / Supporting Documents")
  if (
    fId === "fd000000-0000-0000-0000-000000000331" ||
    fId.includes("attached_proof_documents") ||
    fLabel.includes("attached proof")
  ) {
    return true;
  }

  return false;
}

export function isObsoleteCopyOfPermitField(
  field: FieldDto,
  context: FormEvaluationContext
): boolean {
  const sTitle = (context.serviceTitle || context.serviceName || "").toLowerCase();
  const sCat = (context.serviceCategory || "").toLowerCase();
  const sCode = (context.serviceCode || "").toLowerCase();
  const isCopyOfPermit =
    (sTitle.includes("copy") && sTitle.includes("permit")) ||
    (sCat.includes("permit") && sTitle.includes("copy")) ||
    sCode.includes("copy_permit") ||
    sCode.includes("copy-permit");
  const isCopyOfCert =
    !isCopyOfPermit &&
    ((sTitle.includes("copy") && sTitle.includes("certificate")) ||
      sCode === "ntc_1_21" ||
      (sCat.includes("certificate") && sTitle.includes("copy")));

  const fId = (field.fieldId || field.id || "").toLowerCase().trim();
  const fLabel = (field.label || "").toLowerCase().trim();

  if (isCopyOfPermit) {
    // In Copy of Permits, skip legacy station/certificate-copy fields that are hidden/unused
    if (
      fId === "callsign" ||
      fId === "fd000000-0000-0000-0000-000000000028" ||
      fId === "permitrslno" ||
      fId === "fd000000-0000-0000-0000-000000000123" ||
      fId === "stationlocation" ||
      fId === "fd000000-0000-0000-0000-000000000032" ||
      fId === "targetservice" ||
      fId === "fd000000-0000-0000-0000-000000000240" ||
      fId === "targetcertificatetype" ||
      fId === "fd000000-0000-0000-0000-000000000241" ||
      fId === "targetcertificatenumber" ||
      fId === "fd000000-0000-0000-0000-000000000242" ||
      fLabel === "call sign" ||
      fLabel === "permit/rsl no." ||
      fLabel === "certificate number"
    ) {
      return true;
    }
  } else if (isCopyOfCert) {
    // In Copy of Certificates, skip permit-copy fields
    if (
      fId === "detailsservice" ||
      fId === "fd000000-0000-0000-0000-000000000244" ||
      fId === "targetpermittype" ||
      fId === "fd000000-0000-0000-0000-000000000245" ||
      fId === "permitno" ||
      fId === "fd000000-0000-0000-0000-000000000246" ||
      fLabel === "detailsservice" ||
      fLabel === "permit no."
    ) {
      return true;
    }
  }

  return false;
}

export function isFormFieldRepeater(field: FieldDto): boolean {
  const rawTargetId = field.fieldId || field.id || "";
  const fIdLower = rawTargetId.toLowerCase().trim();
  const labelLower = (field.label || "").toLowerCase().trim();
  const rawType = (field.fieldType || field.type || "").toLowerCase().trim();

  return (
    rawType === "repeater" ||
    rawType === "table" ||
    rawType === "repeatable" ||
    fIdLower.includes("equipmentdetails") ||
    fIdLower.includes("devicesdetails") ||
    fIdLower.includes("device_particulars") ||
    fIdLower.includes("sim_mobile_numbers") ||
    fIdLower.includes("attached_proof_documents") ||
    fIdLower === "fd000000-0000-0000-0000-000000000030" ||
    fIdLower === "fd000000-0000-0000-0000-000000000031" ||
    fIdLower === "fd000000-0000-0000-0000-000000000033" ||
    fIdLower === "fd000000-0000-0000-0000-000000000034" ||
    fIdLower === "fd000000-0000-0000-0000-000000000035" ||
    fIdLower === "fd000000-0000-0000-0000-000000000038" ||
    fIdLower === "fd000000-0000-0000-0000-000000000131" ||
    fIdLower === "fd000000-0000-0000-0000-000000000223" ||
    fIdLower === "fd000000-0000-0000-0000-000000000224" ||
    fIdLower === "fd000000-0000-0000-0000-000000000225" ||
    fIdLower === "fd000000-0000-0000-0000-000000000267" ||
    fIdLower === "fd000000-0000-0000-0000-000000000331" ||
    fIdLower === "fd000000-0000-0000-0000-000000000332" ||
    fIdLower === "fd000000-0000-0000-0000-000000000333" ||
    fIdLower === "fd000000-0000-0000-0000-000000000340" ||
    labelLower.includes("attached proof") ||
    labelLower.includes("device particulars") ||
    labelLower.includes("sim card / mobile numbers") ||
    Boolean(field.repeaterColumns && Array.isArray(field.repeaterColumns) && field.repeaterColumns.length > 0)
  );
}

function normalizeColumnType(
  rawType: unknown
): "text" | "number" | "select" | "date" | "serials" | "equipments" | "file" {
  if (typeof rawType !== "string") return "text";
  const lower = rawType.toLowerCase().trim();
  if (lower === "file" || lower === "attachment" || lower === "upload") return "file";
  if (lower === "number" || lower === "numeric") return "number";
  if (lower === "select" || lower === "dropdown") return "select";
  if (lower === "date") return "date";
  if (lower === "serials") return "serials";
  if (lower === "equipments") return "equipments";
  return "text";
}

function normalizeRepeaterColumn(value: unknown, index: number): FormRepeaterColumn | null {
  if (!isRecord(value)) return null;

  const rawKey =
    typeof value.key === "string" && value.key.trim().length > 0
      ? value.key.trim()
      : typeof value.id === "string" && value.id.trim().length > 0
      ? value.id.trim()
      : typeof value.name === "string" && value.name.trim().length > 0
      ? value.name.trim()
      : typeof value.label === "string" && value.label.trim().length > 0
      ? value.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")
      : `col_${index + 1}`;

  const rawLabel =
    typeof value.label === "string" && value.label.trim().length > 0
      ? value.label.trim()
      : typeof value.name === "string" && value.name.trim().length > 0
      ? value.name.trim()
      : rawKey;

  const type = normalizeColumnType(value.type);
  const placeholder = typeof value.placeholder === "string" ? value.placeholder : undefined;
  const required = typeof value.required === "boolean" ? value.required : undefined;

  let options: Array<{ label: string; value: string }> | undefined;
  if (Array.isArray(value.options)) {
    const parsedOptions: Array<{ label: string; value: string }> = [];
    value.options.forEach((opt) => {
      if (isRecord(opt)) {
        const l = typeof opt.label === "string" ? opt.label : typeof opt.value === "string" ? opt.value : "";
        const v = typeof opt.value === "string" ? opt.value : typeof opt.label === "string" ? opt.label : "";
        if (l.length > 0 || v.length > 0) {
          parsedOptions.push({ label: l || v, value: v || l });
        }
      } else if (typeof opt === "string" && opt.trim().length > 0) {
        parsedOptions.push({ label: opt.trim(), value: opt.trim() });
      }
    });
    if (parsedOptions.length > 0) {
      options = parsedOptions;
    }
  }

  return {
    key: rawKey,
    label: rawLabel,
    type,
    placeholder,
    required,
    options,
  };
}

function parseRepeaterColumnsFromField(field: FieldDto): FormRepeaterColumn[] | undefined {
  let parsed: unknown = null;
  if (isRecord(field.validationRules)) {
    parsed = field.validationRules;
  } else if (typeof field.validationRules === "string" && field.validationRules.trim().length > 0) {
    try {
      parsed = JSON.parse(field.validationRules);
    } catch {
      parsed = null;
    }
  }

  if (isRecord(parsed)) {
    const rawCols = Array.isArray(parsed.repeaterColumns)
      ? parsed.repeaterColumns
      : Array.isArray(parsed.columns)
      ? parsed.columns
      : null;
    if (rawCols !== null) {
      const validCols: FormRepeaterColumn[] = [];
      rawCols.forEach((col, idx) => {
        const norm = normalizeRepeaterColumn(col, idx);
        if (norm !== null) validCols.push(norm);
      });
      if (validCols.length > 0) return validCols;
    }
  }

  if (Array.isArray(field.repeaterColumns)) {
    const validCols: FormRepeaterColumn[] = [];
    field.repeaterColumns.forEach((col, idx) => {
      const norm = normalizeRepeaterColumn(col, idx);
      if (norm !== null) validCols.push(norm);
    });
    if (validCols.length > 0) return validCols;
  }

  return undefined;
}

export interface ExpandedRepeaterSubColumn {
  subKey: string;
  label: string;
  type: "text" | "number" | "select" | "date" | "serials" | "equipments_serial" | "equipments_frequency";
  required: boolean;
  options?: Array<{ label: string; value: string }>;
  sample1: string;
  sample2: string;
}

export function resolveRepeaterSubColumnsForField(
  field: FieldDto,
  context: FormEvaluationContext
): ExpandedRepeaterSubColumn[] {
  const rawTargetId = field.fieldId || field.id || "";
  const fIdLower = rawTargetId.toLowerCase().trim();
  const labelLower = (field.label || "").toLowerCase().trim();

  const flags = buildFormVariantFlags(
    context.serviceCategory,
    context.serviceTitle || context.serviceName,
    context.variantId,
    context.variantId
      ? [
          {
            id: context.variantId,
            name: context.variantName,
            description: context.variantDescription,
            type: context.variantType,
          },
        ]
      : [],
    [],
    context.applicantType
  );

  const isAmateurPurchaseParticulars =
    (flags.isAmateurPurchasePossessVariant || flags.isAmateurPurchaseVariant) &&
    (fIdLower.includes("particular") ||
      labelLower.includes("particular") ||
      rawTargetId === "fd000000-0000-0000-0000-000000000340");

  const isAmateurSellTransferParticulars =
    flags.isAmateurSellTransfer &&
    (fIdLower.includes("particular") ||
      labelLower.includes("particular") ||
      rawTargetId === "fd000000-0000-0000-0000-000000000340");

  const isAmateurVanityParticulars =
    flags.isVanity &&
    (fIdLower.includes("particular") ||
      labelLower.includes("particular") ||
      rawTargetId === "fd000000-0000-0000-0000-000000000340");

  const customRepeaterColumns = isAmateurPurchaseParticulars
    ? DEFAULT_AMATEUR_PURCHASE_PARTICULARS_COLUMNS
    : isAmateurSellTransferParticulars
    ? DEFAULT_AMATEUR_SELL_TRANSFER_PARTICULARS_COLUMNS
    : isAmateurVanityParticulars
    ? DEFAULT_AMATEUR_EQUIPMENT_REPEATER_COLUMNS
    : undefined;

  const parsedCols = parseRepeaterColumnsFromField(field);
  const resolvedCols = resolveRepeaterColumns(
    rawTargetId,
    field.label,
    parsedCols || customRepeaterColumns
  );

  const result: ExpandedRepeaterSubColumn[] = [];

  for (const col of resolvedCols) {
    if (
      col.type === "file" ||
      col.key === "attachment_file" ||
      col.key === "attachment" ||
      col.key === "file_name"
    ) {
      continue;
    }

    if (col.type === "equipments") {
      result.push({
        subKey: "serialNumber",
        label: "Equipment Serial Number",
        type: "equipments_serial",
        required: Boolean(col.required ?? field.isRequired),
        sample1: "SN-9821034",
        sample2: "SN-9821035",
      });
      result.push({
        subKey: "frequency",
        label: "Equipment Frequency / Range",
        type: "equipments_frequency",
        required: Boolean(col.required ?? field.isRequired),
        sample1: "144.000 - 146.000 MHz",
        sample2: "430.000 - 440.000 MHz",
      });
      continue;
    }

    if (col.type === "serials") {
      result.push({
        subKey: col.key,
        label: col.label || "Equipment Serial Numbers",
        type: "serials",
        required: Boolean(col.required ?? field.isRequired),
        sample1: "SN-UBQ-882109; SN-UBQ-882110",
        sample2: "SN-ZBR-440192; SN-ZBR-440193",
      });
      continue;
    }

    const colOptions = col.options && col.options.length > 0 ? col.options : undefined;
    const samplePair = getSamplePairForRepeaterSubCol(col.key, col.label, col.type, colOptions);

    result.push({
      subKey: col.key,
      label: col.label,
      type:
        col.type === "select" || (colOptions && colOptions.length > 0)
          ? "select"
          : col.type === "number"
          ? "number"
          : col.type === "date"
          ? "date"
          : "text",
      required: Boolean(col.required),
      options: colOptions,
      sample1: samplePair[0],
      sample2: samplePair[1],
    });
  }

  return result;
}

function getSamplePairForRepeaterSubCol(
  key: string,
  label: string,
  type?: string,
  options?: Array<{ label: string; value: string }>
): [string, string] {
  if (options && options.length > 0) {
    const first = options[0]?.label || options[0]?.value || "";
    const second = options[1 % options.length]?.label || options[1 % options.length]?.value || first;
    return [first, second];
  }

  const kLower = key.toLowerCase();
  const lLower = label.toLowerCase();

  if (type === "date" || kLower.includes("date") || lLower.includes("date")) {
    return ["2027-12-31", "2028-06-30"];
  }
  if (kLower.includes("imei") || lLower.includes("imei")) {
    return ["356789012345678", "359876543210987"];
  }
  if (kLower.includes("mobile") || lLower.includes("mobile")) {
    return ["09171234567", "09189876543"];
  }
  if (kLower.includes("maketypemodel") || kLower.includes("make_model") || lLower.includes("make")) {
    return ["ICOM IC-7300", "Motorola XiR P8668i"];
  }
  if (kLower === "exactlocation" || lLower.includes("exact location")) {
    return ["Transmitter Site Bldg B, Quezon City", "Tower 2, IT Park, Cebu City"];
  }
  if (kLower === "longitude" || lLower.includes("longitude")) {
    return ["121° 02' 35\" E", "123° 53' 07\" E"];
  }
  if (kLower === "latitude" || lLower.includes("latitude")) {
    return ["14° 38' 20\" N", "10° 18' 56\" N"];
  }
  if (kLower === "configuration" || lLower.includes("configuration")) {
    return ["Simplex", "Duplex"];
  }
  if (kLower === "datarate" || lLower.includes("data rate")) {
    return ["9600 bps", "1200 bps"];
  }
  if (kLower.includes("serial") || lLower.includes("serial")) {
    return ["SN-849201", "SN-849202"];
  }
  if (kLower.includes("frequency") || lLower.includes("frequency")) {
    return ["144.000 - 146.000 MHz", "430.000 - 440.000 MHz"];
  }
  if (kLower.includes("satellite") || lLower.includes("satellite")) {
    return ["Asiasat 7 (105.5°E)", "Measat 3a (91.5°E)"];
  }
  if (kLower.includes("dish") || kLower.includes("diameter") || lLower.includes("diameter")) {
    return ["3.8m", "2.4m"];
  }
  if (kLower.includes("polarization") || lLower.includes("polarization")) {
    return ["Horizontal", "Vertical"];
  }
  if (kLower.includes("azimuth") || lLower.includes("azimuth")) {
    return ["142.5°", "180.0°"];
  }
  if (kLower.includes("height") || lLower.includes("height")) {
    return ["1500", "1200"];
  }
  if (kLower.includes("gain") || lLower.includes("gain")) {
    return ["9 dB", "6 dB"];
  }
  if (kLower.includes("directivity") || lLower.includes("directivity")) {
    return ["Directional", "Omnidirectional"];
  }
  if (kLower.includes("beamwidth") || lLower.includes("beamwidth")) {
    return ["60°", "45°"];
  }
  if (kLower.includes("antennatype") || (kLower === "type" && lLower.includes("type"))) {
    return ["Yagi-Uda", "Dipole"];
  }
  if (kLower.includes("program") || lLower.includes("program")) {
    return ["News, Educational Feeds", "Sports, Documentary Channels"];
  }
  if (kLower === "name" || lLower.includes("officer")) {
    return ["Capt. Roberto Dela Cruz", "Engr. Maria Santos"];
  }
  if (kLower.includes("license") || lLower.includes("license")) {
    return ["1RTG-10293", "1PHN-44821"];
  }
  if (kLower.includes("rating") || lLower.includes("rating")) {
    return ["First Class Commercial", "Second Class Commercial"];
  }
  if (kLower.includes("remark") || lLower.includes("remark")) {
    return ["Standard configuration", "Primary unit"];
  }

  return [`Sample ${label}`, `Example ${label}`];
}

export function isMultiSelectCheckboxField(field: FieldDto): boolean {
  const rawTargetId = (field.fieldId || field.id || "").toLowerCase().trim();
  const labelLower = (field.label || "").toLowerCase().trim();
  const rawType = (field.fieldType || field.type || "").toLowerCase().trim();

  return (
    rawType === "checkbox_group" ||
    rawType === "checkboxgroup" ||
    rawTargetId.includes("intendeduse") ||
    labelLower.includes("intended use") ||
    rawTargetId.includes("valueaddedservices") ||
    labelLower.includes("value added service") ||
    labelLower.includes("value-added service") ||
    rawTargetId === "complaint_types" ||
    rawTargetId === "fd000000-0000-0000-0000-000000000327" ||
    labelLower.includes("nature of complaint")
  );
}

export function resolveEffectiveFieldOptions(
  field: FieldDto,
  context: FormEvaluationContext,
  rowFormValues?: Record<string, string>
): Array<{ label: string; value: string }> {
  const parsed = parseOptions(field);
  if (parsed.length > 0) {
    return parsed;
  }

  const fIdLower = (field.fieldId || field.id || "").toLowerCase().trim();
  const labelLower = (field.label || "").toLowerCase().trim();
  const sTitle = (context.serviceTitle || context.serviceName || "").toLowerCase();
  const sCat = (context.serviceCategory || "").toLowerCase();
  const sCode = (context.serviceCode || "").toLowerCase();

  const isCopyOfPermit =
    (sTitle.includes("copy") && sTitle.includes("permit")) ||
    (sCat.includes("permit") && sTitle.includes("copy")) ||
    sCode.includes("copy_permit") ||
    sCode.includes("copy-permit");

  const isCopyOfCert =
    !isCopyOfPermit &&
    ((sTitle.includes("copy") && sTitle.includes("certificate")) ||
      sCode === "ntc_1_21" ||
      (sCat.includes("certificate") && sTitle.includes("copy")));

  const isDetailsServiceField =
    fIdLower === "detailsservice" ||
    fIdLower === "details_service" ||
    fIdLower === "fd000000-0000-0000-0000-000000000244" ||
    labelLower === "detailsservice" ||
    labelLower === "details service";

  if (isDetailsServiceField) {
    return PERMIT_DETAILS_SERVICE_OPTIONS;
  }

  const isPermitTypeField =
    isCopyOfPermit &&
    (fIdLower === "targetpermittype" ||
      fIdLower === "target_permit_type" ||
      fIdLower === "fd000000-0000-0000-0000-000000000245" ||
      labelLower === "type" ||
      labelLower.includes("permit type"));

  if (isPermitTypeField) {
    const selectedSvc =
      rowFormValues?.["detailsService"] ||
      rowFormValues?.["details_service"] ||
      rowFormValues?.["DetailsService"] ||
      rowFormValues?.["fd000000-0000-0000-0000-000000000244"];
    if (selectedSvc) {
      return resolvePermitTypes(selectedSvc);
    }
    const allPermitOpts: Array<{ label: string; value: string }> = [];
    for (const list of [
      AMATEUR_PERMIT_TYPES,
      AERONAUTICAL_PERMIT_TYPES,
      MARITIME_PERMIT_TYPES,
      FLM_PERMIT_TYPES,
    ]) {
      for (const item of list) {
        if (!allPermitOpts.some((x) => x.label === item.label)) {
          allPermitOpts.push(item);
        }
      }
    }
    return allPermitOpts;
  }

  const isTargetCertificateTypeField =
    isCopyOfCert &&
    (fIdLower === "targetcertificatetype" ||
      fIdLower === "target_certificate_type" ||
      fIdLower === "fd000000-0000-0000-0000-000000000241" ||
      labelLower === "type" ||
      labelLower.includes("certificate type"));

  if (isTargetCertificateTypeField) {
    const selectedCertSvc =
      rowFormValues?.["targetService"] ||
      rowFormValues?.["target_service"] ||
      rowFormValues?.["Service"] ||
      rowFormValues?.["service"] ||
      rowFormValues?.["fd000000-0000-0000-0000-000000000240"];
    if (selectedCertSvc) {
      return resolveCertificateTypes(selectedCertSvc);
    }
    const allCertOpts: Array<{ label: string; value: string }> = [];
    for (const list of [
      ROC_TYPE_OPTIONS,
      AMATEUR_CERT_TYPE_OPTIONS,
      DEVICE_REG_TYPE_OPTIONS,
      VAS_TYPE_OPTIONS,
      TVRO_TYPE_OPTIONS,
    ]) {
      for (const item of list) {
        if (!allCertOpts.some((x) => x.label === item.label)) {
          allCertOpts.push(item);
        }
      }
    }
    return allCertOpts;
  }

  const isNatureOfComplaintField =
    fIdLower === "complaint_types" ||
    fIdLower === "fd000000-0000-0000-0000-000000000327" ||
    labelLower === "nature of complaint" ||
    labelLower.includes("nature of complaint");

  if (isNatureOfComplaintField) {
    const varDesc = (
      context.variantDescription ||
      context.variantName ||
      context.applicationType ||
      ""
    ).toLowerCase();
    const varId = (context.variantId || "").toLowerCase();
    const isSpam =
      (varDesc.includes("spam") ||
        varDesc.includes("scam") ||
        varDesc.includes("threat") ||
        varId.includes("403")) &&
      !varDesc.includes("tape");
    const natures = isSpam ? SPAM_COMPLAINT_NATURES : TELCO_COMPLAINT_NATURES;
    return natures.map((n) => ({ label: n, value: n }));
  }

  if (fIdLower.includes("intendeduse") || labelLower.includes("intended use")) {
    return AVAILABLE_INTENDED_USES.map((u) => ({ label: u, value: u }));
  }

  if (
    fIdLower.includes("valueaddedservices") ||
    labelLower.includes("value added service") ||
    labelLower.includes("value-added service")
  ) {
    return AVAILABLE_VAS_SERVICES.map((s) => ({ label: s, value: s }));
  }

  return [];
}

export function cleanSectionPrefix(sectionTitle?: string): string {
  if (!sectionTitle) return "";
  return sectionTitle
    .replace(/^\d+[\.\)]\s*/, "")
    .replace(/^particulars of\s+/i, "")
    .trim();
}
