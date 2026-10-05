import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../../shared/hooks/useGeneralServiceWizard";
import { synthesizeAllApplicantFieldValues } from "../../shared/helpers/applicantFieldSynthesizer";

/**
 * Static GUID registry — mirrors FastTrackSeederData.cs GetFieldsPool().
 * Keys are lowercase field-label slugs used by addField().
 * Values are the exact database GUIDs seeded at startup.
 *
 * When adding a new form field to the seeder, add a matching entry here
 * so that the serializer can resolve it without a live DB lookup.
 */
const FIELD_GUID_MAP: Record<string, string> = {
  // Core personal / applicant (fd000000-0000-0000-0000-0000000001xx)
  "full name / company name": "fd000000-0000-0000-0000-000000000001",
  "full name":                "fd000000-0000-0000-0000-000000000001",
  "birth date":               "fd000000-0000-0000-0000-000000000002",
  "address":                  "fd000000-0000-0000-0000-000000000003",
  "contact number":           "fd000000-0000-0000-0000-000000000004",
  "email address":            "fd000000-0000-0000-0000-000000000005",
  "education / school attended": "fd000000-0000-0000-0000-000000000006",

  // NTC 1-01 exam
  "exam category":            "fd000000-0000-0000-0000-000000000007",
  "examinee type":            "fd000000-0000-0000-0000-000000000008",
  "selected exam elements":   "fd000000-0000-0000-0000-000000000009",
  "special assistance details": "fd000000-0000-0000-0000-000000000010",
  "admission slip number":    "fd000000-0000-0000-0000-000000000011",

  // Core declarations & payment
  "applicant signature":      "fd000000-0000-0000-0000-000000000012",
  "i hereby declare":         "fd000000-0000-0000-0000-000000000013",
  "official receipt (or) number": "fd000000-0000-0000-0000-000000000021",
  "amount paid":              "fd000000-0000-0000-0000-000000000022",
  "payment date":             "fd000000-0000-0000-0000-000000000023",

  // NTC 1-02 certificate specific
  "type of certificate":      "fd000000-0000-0000-0000-000000000014",
  "weight (kg)":              "fd000000-0000-0000-0000-000000000015",
  "height (cm)":              "fd000000-0000-0000-0000-000000000016",
  "employment status":        "fd000000-0000-0000-0000-000000000017",
  "employment location":      "fd000000-0000-0000-0000-000000000018",
  "exam / seminar details":   "fd000000-0000-0000-0000-000000000019",

  // Permit / license / station
  "permit / license type":    "fd000000-0000-0000-0000-000000000024",
  "class of station":         "fd000000-0000-0000-0000-000000000025",
  "amateur club details":     "fd000000-0000-0000-0000-000000000026",
  "registration type":        "fd000000-0000-0000-0000-000000000045",

  // Technical vessel & station & equipment
  "vessel name":              "fd000000-0000-0000-0000-000000000027",
  "call sign":                "fd000000-0000-0000-0000-000000000028",
  "imo number / gross tonnage": "fd000000-0000-0000-0000-000000000029",
  "equipment technical details": "fd000000-0000-0000-0000-000000000030",
  "radio officers details":   "fd000000-0000-0000-0000-000000000031",
  "station location / coordinates": "fd000000-0000-0000-0000-000000000032",
  "antenna technical details": "fd000000-0000-0000-0000-000000000033",

  // Accreditations & regs
  "ece / technician personnel details": "fd000000-0000-0000-0000-000000000034",
  "registered devices details": "fd000000-0000-0000-0000-000000000035",
  "value-added services / category": "fd000000-0000-0000-0000-000000000036",
  "circumstances / reason for duplicate": "fd000000-0000-0000-0000-000000000037",
  "tvro / catv receiver & satellite details": "fd000000-0000-0000-0000-000000000038",

  // NTC 1-09 permit fields
  "station class":            "fd000000-0000-0000-0000-000000000101",
  "service area":             "fd000000-0000-0000-0000-000000000102",
  "frequency / frequencies":  "fd000000-0000-0000-0000-000000000103",
  "bandwidth":                "fd000000-0000-0000-0000-000000000104",
  "emission":                 "fd000000-0000-0000-0000-000000000105",
  "power output":             "fd000000-0000-0000-0000-000000000106",
  "hours of operation":       "fd000000-0000-0000-0000-000000000107",
  "configuration":            "fd000000-0000-0000-0000-000000000108",
  "data rate":                "fd000000-0000-0000-0000-000000000109",
  "remarks":                  "fd000000-0000-0000-0000-000000000110",
  "serial number":            "fd000000-0000-0000-0000-000000000111",
  "frequency range":          "fd000000-0000-0000-0000-000000000112",
  "antenna type":             "fd000000-0000-0000-0000-000000000113",
  "antenna height":           "fd000000-0000-0000-0000-000000000114",
  "antenna gain":             "fd000000-0000-0000-0000-000000000115",
  "antenna directivity":      "fd000000-0000-0000-0000-000000000116",
  "antenna diameter":         "fd000000-0000-0000-0000-000000000117",
  "antenna polarization":     "fd000000-0000-0000-0000-000000000118",
  "antenna beamwidth":        "fd000000-0000-0000-0000-000000000119",
  "dealer name":              "fd000000-0000-0000-0000-000000000120",
  "authorized seller / buyer": "fd000000-0000-0000-0000-000000000121",
  "or / invoice no":          "fd000000-0000-0000-0000-000000000122",
  "permit / rsl no":          "fd000000-0000-0000-0000-000000000123",
  "seller address":           "fd000000-0000-0000-0000-000000000124",
  "amateur license no":       "fd000000-0000-0000-0000-000000000125",
  "intended use type":        "fd000000-0000-0000-0000-000000000126",
  "specify details":          "fd000000-0000-0000-0000-000000000127",

  // NTC_AMA_LICENSES — Amateur Radio Station License specific
  "application type":         "fd000000-0000-0000-0000-000000000200",
  "number of years":          "fd000000-0000-0000-0000-000000000201",
  "existing license no":      "fd000000-0000-0000-0000-000000000202",
  "license expiry date":      "fd000000-0000-0000-0000-000000000203",
  "modification due to":      "fd000000-0000-0000-0000-000000000204",
  "place of exam / seminar":  "fd000000-0000-0000-0000-000000000205",
  "date of exam / seminar":   "fd000000-0000-0000-0000-000000000206",
  "ratings / exam score details": "fd000000-0000-0000-0000-000000000207",
  "particulars of radio equipment (json)": "fd000000-0000-0000-0000-000000000208",
  "station location / installation address": "fd000000-0000-0000-0000-000000000209",
  "middle name":              "fd000000-0000-0000-0000-000000000210",
  "suffix":                   "fd000000-0000-0000-0000-000000000211",

  // Company & Corporate Applicant Fields (NTC 1-19 and generic company filings)
  "company / business name":  "fd000000-0000-0000-0000-000000000081",
  "company name":             "fd000000-0000-0000-0000-000000000081",
  "company / corporation name": "fd000000-0000-0000-0000-000000000081",
  "authorized representative name": "fd000000-0000-0000-0000-000000000082",
  "representative name":      "fd000000-0000-0000-0000-000000000082",
  "representative":           "fd000000-0000-0000-0000-000000000082",
  "designation / position":   "fd000000-0000-0000-0000-000000000083",
  "representative position":  "fd000000-0000-0000-0000-000000000083",
  "position":                 "fd000000-0000-0000-0000-000000000083",
  "make / type / model":      "fd000000-0000-0000-0000-000000000084",
  "make/type/ model":         "fd000000-0000-0000-0000-000000000084",
  "device / equipment type":  "fd000000-0000-0000-0000-000000000085",
  "device type":              "fd000000-0000-0000-0000-000000000085",
  "sec / dti registration number": "fd000000-0000-0000-0000-000000000086",
  "sec/dti no":               "fd000000-0000-0000-0000-000000000086",
  // VAS Registration (NTC 1-20) specific fields
  "type of entity":                         "fd000000-0000-0000-0000-000000000230",
  "entity type":                             "fd000000-0000-0000-0000-000000000230",
  "cpcn / pa / ca no.":                      "fd000000-0000-0000-0000-000000000231",
  "cpcn / pa / ca no":                       "fd000000-0000-0000-0000-000000000231",
  "cpcn / pa / ca license no":               "fd000000-0000-0000-0000-000000000231",
  "cpcn/pa/ca license no":                   "fd000000-0000-0000-0000-000000000231",
  "cpcn / pa / ca no. date of expiry":       "fd000000-0000-0000-0000-000000000232",
  "cpcn / pa / ca date of expiry":           "fd000000-0000-0000-0000-000000000232",
  "cpcn date of expiry":                     "fd000000-0000-0000-0000-000000000232",
  "cpcn/pa/ca expiration date":              "fd000000-0000-0000-0000-000000000232",
  "cor / vas no.":                           "fd000000-0000-0000-0000-000000000233",
  "cor / vas no":                            "fd000000-0000-0000-0000-000000000233",
  "cor/vas certificate no":                  "fd000000-0000-0000-0000-000000000233",
  "cor / vas no. date of expiry":            "fd000000-0000-0000-0000-000000000238",
  "cor / vas no. expiry date":               "fd000000-0000-0000-0000-000000000238",
  "cor / vas date of expiry":                "fd000000-0000-0000-0000-000000000238",
  "cor/vas expiry date":                     "fd000000-0000-0000-0000-000000000238",
  "known by other name":                     "fd000000-0000-0000-0000-000000000234",
  "known by another name":                   "fd000000-0000-0000-0000-000000000234",
  "please specify":                          "fd000000-0000-0000-0000-000000000235",
  "other trade name":                        "fd000000-0000-0000-0000-000000000235",
  "operating trade name":                    "fd000000-0000-0000-0000-000000000235",
  "vas registration no. (assigned by ntc)":  "fd000000-0000-0000-0000-000000000236",
  "vas registration no":                     "fd000000-0000-0000-0000-000000000236",
  "vas registration":                        "fd000000-0000-0000-0000-000000000236",
};

/**
 * Resolves a field ID by checking:
 * 1. The static GUID registry (exact or partial key match)
 * 2. The live formFields array returned by the API
 * Guarantees a real GUID is always returned when the field is registered in the seeder.
 */
function resolveFieldId(label: string, formFields: Array<{ label?: string; fieldId?: string }>): string {
  const lowerLabel = label.toLowerCase();

  // 1. Exact match in static map
  const exactId = FIELD_GUID_MAP[lowerLabel];
  if (exactId !== undefined) return exactId;

  // 2. Partial match in static map (label contains a known key)
  for (const [key, id] of Object.entries(FIELD_GUID_MAP)) {
    if (lowerLabel.includes(key) || key.includes(lowerLabel)) return id;
  }

  // 3. Fallback to live formFields from API
  const matched = formFields.find(
    (f) => (f.label ?? "").toLowerCase().includes(lowerLabel)
  );
  if (matched !== undefined && matched.fieldId !== undefined) return matched.fieldId;

  // 4. Last resort — generate a deterministic slug (will be rejected by backend if form is DB-backed)
  return `f-${lowerLabel.replace(/\s+/g, "-")}`;
}

export interface FormFieldValuePayload {
  fieldId: string;
  fieldLabel?: string;
  value: string;
}

export interface SerializedApplicantPayload {
  applicantType?: string;
  companyName?: string;
  representativeName?: string;
  dtiSecRegistration?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  email: string;
  contactNumber: string;
  address: string;
  birthDate: string;
  eSignature?: string;
  formFieldValues: FormFieldValuePayload[];
}

export function isApplicantBiographicalOrSubmissionField(_fieldIdOrLabel: string): boolean {
  return false;
}

export function serializeCertificateApplicant(
  app: GeneralApplicantData,
  _service: NTCService,
  formFields: Array<{ label?: string; fieldId?: string; id?: string }> = []
): SerializedApplicantPayload {
  const monthMap: Record<string, string> = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  const birthDate = app.birthYear && app.birthMonth && app.birthDay
    ? `${app.birthYear}-${monthMap[app.birthMonth] || "01"}-${app.birthDay.padStart(2, "0")}`
    : app.birthDate || "2000-01-01";

  // Synthesize ALL applicant inputs: dynamic form fields, standard particulars, and specialized models
  const synthesized = synthesizeAllApplicantFieldValues(app, formFields);

  const validFieldIdSet = new Set<string>();
  formFields.forEach((f) => {
    const id = f.fieldId || f.id;
    if (id && id.trim() !== '') {
      validFieldIdSet.add(id.toLowerCase().trim());
    }
  });

  const finalFieldValues: FormFieldValuePayload[] = [];
  const processedFieldIds = new Set<string>();

  synthesized.forEach((fv) => {
    const cleanId = (fv.fieldId || '').trim();
    const idLower = cleanId.toLowerCase();

    // If a DB form schema with valid field IDs is provided, only include fields present in the schema
    if (validFieldIdSet.size > 0 && !validFieldIdSet.has(idLower)) {
      return;
    }

    if (cleanId && !processedFieldIds.has(idLower)) {
      processedFieldIds.add(idLower);
      finalFieldValues.push({
        fieldId: cleanId,
        fieldLabel: fv.fieldLabel,
        value: fv.value,
      });
    }
  });

  // If validFieldIdSet was empty (e.g. no DB schema provided or draft), preserve all synthesized fields
  if (finalFieldValues.length === 0 && synthesized.length > 0) {
    synthesized.forEach((fv) => {
      const cleanId = (fv.fieldId || '').trim();
      const idLower = cleanId.toLowerCase();
      if (cleanId && !processedFieldIds.has(idLower)) {
        processedFieldIds.add(idLower);
        finalFieldValues.push({
          fieldId: cleanId,
          fieldLabel: fv.fieldLabel,
          value: fv.value,
        });
      }
    });
  }

  const fnFromFields = finalFieldValues.find(fv => {
    const l = (fv.fieldLabel || "").toLowerCase();
    return l.includes("first name") || l === "fname";
  })?.value?.trim();

  const lnFromFields = finalFieldValues.find(fv => {
    const l = (fv.fieldLabel || "").toLowerCase();
    return l.includes("last name") || l.includes("surname") || l === "lname";
  })?.value?.trim();

  const fullNameField = finalFieldValues.find(fv => {
    const l = (fv.fieldLabel || "").toLowerCase();
    return l.includes("full name") || l.includes("applicant name") || l === "name";
  })?.value?.trim() || "";

  let finalFirstName = app.firstName?.trim() || fnFromFields || "";
  let finalLastName = app.lastName?.trim() || lnFromFields || "";

  if (!finalFirstName && fullNameField) {
    const parts = fullNameField.split(/\s+/);
    finalFirstName = parts[0] || "Applicant";
    finalLastName = parts.slice(1).join(" ") || "Detail";
  }

  const isComp = (app.applicantType || "").toLowerCase() === "company";
  const effectiveFirstName = isComp
    ? app.representativeFirstName || finalFirstName || "Representative"
    : finalFirstName || "Applicant";
  const effectiveMiddleName = isComp
    ? app.representativeMiddleName || app.middleName
    : app.middleName;
  const effectiveLastName = isComp
    ? app.representativeLastName || finalLastName || "Officer"
    : finalLastName || "Detail";
  const effectiveSuffix = isComp
    ? app.representativeSuffix || app.suffix
    : app.suffix;

  const emailVal = app.email || finalFieldValues.find(fv => (fv.fieldLabel || '').toLowerCase().includes('email'))?.value || "applicant@example.com";
  const contactVal = app.contactNo || finalFieldValues.find(fv => (fv.fieldLabel || '').toLowerCase().includes('contact') || (fv.fieldLabel || '').toLowerCase().includes('mobile'))?.value || "";
  const addressVal = app.address || finalFieldValues.find(fv => (fv.fieldLabel || '').toLowerCase().includes('address') && !(fv.fieldLabel || '').toLowerCase().includes('email'))?.value || "Philippines";

  return {
    applicantType: app.applicantType || "individual",
    companyName: app.companyName || undefined,
    representativeName: app.representativeName || undefined,
    dtiSecRegistration: app.dtiSecRegistration || undefined,
    firstName: effectiveFirstName,
    middleName: effectiveMiddleName || undefined,
    lastName: effectiveLastName,
    suffix: effectiveSuffix || undefined,
    email: emailVal,
    contactNumber: contactVal,
    address: addressVal,
    birthDate,
    eSignature: app.signatureUrl || undefined,
    formFieldValues: finalFieldValues,
  };
}

