import { FieldDto, FormSectionDto } from "./dynamicFormTypes";
import {
  FIELD_ID_FULL_NAME,
  FIELD_ID_BIRTH_DATE,
  FIELD_ID_REGION,
  FIELD_ID_PROVINCE,
  FIELD_ID_CITY,
  FIELD_ID_BARANGAY,
  FIELD_ID_ENTITY_TYPE,
} from "../../constants/fieldIds";

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

export function parseOptions(field: FieldDto): Array<{ label: string; value: string }> {
  if (field.options !== null && field.options !== undefined && Array.isArray(field.options) && field.options.length > 0) {
    return field.options.map((opt) => (typeof opt === "string" ? { label: opt, value: opt } : opt));
  }

  if (field.validationRules !== null && field.validationRules !== undefined && typeof field.validationRules === "string") {
    try {
      const parsed: unknown = JSON.parse(field.validationRules);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => {
          const str = typeof item === "string" ? item : String(item);
          return { label: str, value: str };
        });
      }
    } catch {
      // Ignored if not JSON array
    }
  }

  return [];
}

export function getFieldSortPriority(field: FieldDto, defaultIndex: number): number {
  if (!field) return defaultIndex;
  const labelLower = (field.label || "").toLowerCase().trim();
  const idLower = (field.fieldId || field.id || "").toLowerCase().trim();

  // Company / Business Name topmost in Applicant Details
  if (
    idLower === "companyname" ||
    idLower === "businessname" ||
    idLower === "fd000000-0000-0000-0000-000000000081" ||
    labelLower === "company / business name" ||
    labelLower === "company name" ||
    labelLower === "business / registered entity name" ||
    labelLower === "business name"
  ) {
    return 0;
  }

  // Entity Type and SEC/DTI Registration Number in Row 2
  if (idLower === "entitytype" || idLower === FIELD_ID_ENTITY_TYPE || labelLower === "entity type" || labelLower.includes("entity type")) return 1;
  if (idLower === "dtisecregistration" || idLower === "dti_sec_registration" || idLower === "fd000000-0000-0000-0000-000000000086" || labelLower.includes("sec / dti") || labelLower.includes("sec/dti") || labelLower.includes("dti / sec") || labelLower.includes("dti/sec")) return 2;

  // Personal Identity Fields
  if (labelLower.includes("full name") || labelLower.includes("legal name") || idLower === "fullname" || idLower === FIELD_ID_FULL_NAME) return 3;
  if (labelLower.includes("birth") || idLower === "birthdate" || idLower === FIELD_ID_BIRTH_DATE) return 4;
  if (labelLower.includes("sex") || labelLower.includes("gender")) return 5;
  if (labelLower.includes("civil status")) return 6;
  if (labelLower.includes("nationality") || labelLower.includes("citizenship")) return 7;

  // Address Fields
  if (labelLower === "region" || idLower === "region" || idLower === FIELD_ID_REGION) return 10;
  if (labelLower === "province" || idLower === "province" || idLower === FIELD_ID_PROVINCE) return 20;
  if (labelLower === "city" || labelLower.includes("city / municipality") || labelLower.includes("municipality") || idLower === "city" || idLower === FIELD_ID_CITY) return 30;
  if (labelLower === "barangay" || idLower === "barangay" || idLower === FIELD_ID_BARANGAY) return 40;
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

  return 100 + defaultIndex;
}

export function getSectionTitle(sec: FormSectionDto, isAmateurPermitService: boolean): string {
  if (isAmateurPermitService) {
    const k = (sec.key || sec.id || "").toLowerCase();
    const t = (sec.title || "").toLowerCase();
    if (k === "applicant" || t.includes("applicant")) return "Applicant Details";
    if (k === "stationequipment" || k === "proposedstation" || t.includes("station/equipment") || t.includes("proposed station") || t.includes("station")) {
      return "Station/Equipment";
    }
    if (k === "particulars" || t.includes("particulars")) return "Particulars";
    if (k === "sourceofequipment" || t.includes("source")) return "Source of Equipment";
    if (k === "intendeduse" || t.includes("intended")) return "Intended Use of Equipment";
    if (k === "declaration" || t.includes("declaration") || t.includes("acknowledgement")) {
      return "Acknowledgement & Applicant Signature";
    }
  }
  return sec.title;
}
