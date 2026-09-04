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
  const isAmateurPurchaseVariant =
    isAmateurPermitService &&
    !varDesc.includes("storage") &&
    (varDesc.includes("permit to purchase") ||
      varDesc.includes("purchase/possess") ||
      varDesc.includes("purchase to possess") ||
      (varDesc.includes("purchase") && !varDesc.includes("sell")));
  const isAmateurSellTransfer =
    isAmateurPermitService &&
    (varDesc.includes("sell") || varDesc.includes("transfer"));
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
  if (idLower === "callsign" || labelLower.includes("call sign")) return 201;
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
  const flags: FormVariantFlags =
    typeof flagsOrAmateurPermit === "object"
      ? flagsOrAmateurPermit
      : ({
          isAmateurPermitService: flagsOrAmateurPermit,
          isAmateurPurchaseVariant: isAmateurPurchaseVariant ?? false,
          isVanityOrSpecialEvent: isVanityOrSpecialEvent ?? false,
          isForeignVisitor: isForeignVisitor ?? false,
          isAmateurSellTransfer: isAmateurSellTransfer ?? false,
          isAeroStationPurchase: isAeroStationPurchase ?? false,
        } as unknown as FormVariantFlags);

  if (flags.isAmateurPermitService || flags.isAeroStationPurchase) {
    const k = (sec.key || sec.id || "").trim().toLowerCase();
    const t = (sec.title || "").trim().toLowerCase();
    if (k === "applicant" || t.includes("applicant")) return "Applicant Details";
    if (k === "stationequipment" || k === "proposedstation" || t.includes("station/equipment") || t.includes("proposed station") || t.includes("station") || k === "particulars" || t.includes("particulars")) {
      if (flags.isAmateurPurchaseVariant || flags.isVanityOrSpecialEvent) return "Particulars";
      if (flags.isAmateurSellTransfer) return "Particulars of Station, Equipment & Antenna";
      if (flags.isForeignVisitor) return "Particulars of Equipment";
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

