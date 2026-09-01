import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "@edge/ui";
import { ValidatedInput } from "./ValidatedInput";
import { DatePickerInput } from "./DatePickerInput";
import { Select } from "./Select";
import { FormGrid, FormCol } from "./FormGrid";
import { ApplicantNameField, StructuredNameData } from "./ApplicantNameField";
import { FormSignatureInput } from "./FormSignatureInput";
import { DeclarationCheckbox } from "./DeclarationCheckbox";
import { FormRepeaterTable } from "./FormRepeaterTable";
import { VasServicesCheckboxGroup } from "./VasServicesCheckboxGroup";
import { IntendedUseCheckboxGroup } from "./IntendedUseCheckboxGroup";
import { useGeographicLocations } from "../hooks/useGeographicLocations";
import { TYPOGRAPHY, COLORS } from "../theme/tokens";
import {
  FIELD_ID_FULL_NAME,
  FIELD_ID_BIRTH_DATE,
  FIELD_ID_NO_OF_YEARS,
  FIELD_ID_CONTACT_NO,
  FIELD_ID_EMAIL,
  FIELD_ID_ELEMENTS,
  FIELD_ID_EMPLOYMENT_STATUS,
  FIELD_ID_EMPLOYMENT_TYPE,
  FIELD_ID_REGION,
  FIELD_ID_PROVINCE,
  FIELD_ID_CITY,
  FIELD_ID_BARANGAY,
  FIELD_ID_SIGNATURE,
  FIELD_ID_INVOICE_NUMBER,
  FIELD_ID_LICENSE_NO,
  FIELD_ID_DATE_OF_EXPIRY,
  FIELD_ID_ENTITY_TYPE,
  FIELD_ID_CPCN_NO,
  FIELD_ID_CPCN_EXPIRY,
  FIELD_ID_COR_VAS_NO,
  FIELD_ID_KNOWN_OTHER_NAME,
  FIELD_ID_OTHER_TRADE_NAME,
  FIELD_ID_VAS_REG_NO,
  FIELD_ID_SVC_CLASSIFICATION,
  FIELD_ID_COR_VAS_EXPIRY,
  FIELD_ID_DEVICES,
  FIELD_ID_EQUIPMENT,
  FIELD_ID_ANTENNA,
  FIELD_ID_RADIO_OFFICERS,
  FIELD_ID_TVRO,
  FIELD_ID_TARGET_SERVICE,
  FIELD_ID_TARGET_CERT_TYPE,
  FIELD_ID_TARGET_CERT_NUMBER,
  FIELD_ID_NO_OF_COPIES,
  FIELD_ID_CALL_SIGN,
  FIELD_ID_SERVICE_AREA,
  FIELD_ID_FREQUENCY,
  FIELD_ID_BANDWIDTH,
  FIELD_ID_BANDWIDTH_UNIT,
  FIELD_ID_EMISSION,
  FIELD_ID_POWER_OUTPUT,
  FIELD_ID_HOURS_OP,
  FIELD_ID_STATION_CLASS,
  FIELD_ID_CLASS_OF_STATION,
  FIELD_ID_CONFIGURATION,
  FIELD_ID_DATA_RATE,
  FIELD_ID_REMARKS,
  FIELD_ID_NO_OF_UNITS,
  FIELD_ID_DEALER_NAME,
  FIELD_ID_AUTH_SELLER,
  FIELD_ID_OR_INVOICE,
  FIELD_ID_AMATEUR_LIC,
  FIELD_ID_AMATEUR_LIC_PERMIT,
  FIELD_ID_PERMIT_RSL,
  FIELD_ID_SELLER_ADDR,
  FIELD_ID_INTENDED_USE,
  FIELD_ID_PROPOSED_EQUIPMENT,
  FIELD_ID_PREFERRED_CALL_SIGN,
} from "../constants/fieldIds";
import {
  CERTIFICATE_SERVICES_OPTIONS,
  CERTIFICATE_TYPES_BY_SERVICE,
  resolveCertificateTypes,
} from "../../auth/Services/certificates/forms/CopyOfCertificateForm";
import { useCertificateServicesQuery } from "../../auth/Services/certificates/hooks/useCertificateServicesQuery";

export interface FieldDto {
  id?: string;
  fieldId?: string;
  fieldType?: string; // text | number | date | dropdown | checkbox | signature | file
  type?: string;
  label: string;
  isRequired?: boolean;
  options?: Array<{ label: string; value: string }> | string[];
  placeholder?: string;
  isCompact?: boolean;
  validationRules?: string;
}

export interface FormSectionDto {
  id?: string;
  key?: string;
  title: string;
  fields: FieldDto[];
}

export interface FormDto {
  id?: string;
  formId?: string;
  version: string;
  sections: FormSectionDto[];
}

interface DynamicFormRendererProps {
  form: FormDto;
  values: Record<string, string>; // fieldId -> value
  onChange: (fieldId: string, label: string, value: string) => void;
  onStructuredNameChange?: (data: StructuredNameData) => void;
  structuredNameData?: Partial<StructuredNameData>;
  applicantName?: string;
  allowCompany?: boolean;
  applicantType?: "individual" | "company";
  serviceCategory?: string;
  serviceTitle?: string;
  selectedVariantId?: string;
  onVariantChange?: (variantId: string, variantName: string) => void;
  selectedElementId?: string;
  onElementChange?: (elementId: string, elementTitle: string) => void;
  noOfYears?: string;
  onNoOfYearsChange?: (years: string) => void;
  showApplicationTypeSection?: boolean;
  variants?: Array<{ id: string; name?: string; type?: string; description?: string; [key: string]: unknown }>;
  variantElements?: Array<{ id: string; code?: string; description?: string; [key: string]: unknown }>;
  errors?: Record<string, string>;
  hideSections?: string[];
  isBulk?: boolean;
  appMode?: "SINGLE" | "BULK" | "";
}

function getElementFieldLabel(category?: string, title?: string): string {
  const cat = (category || "").toLowerCase();
  const tit = (title || "").toLowerCase();

  if (cat.includes("certificate") || tit.includes("certificate") || tit.includes("cert")) {
    return "Type of Certificate";
  }
  if (cat.includes("license") || cat.includes("licence") || tit.includes("license") || tit.includes("licence")) {
    if (tit.includes("amateur") || tit.includes("station") || tit.includes("radio")) {
      return "Class of Station";
    }
    return "Type of License";
  }
  if (cat.includes("permit") || tit.includes("permit")) {
    return "Type of Permit";
  }
  if (cat.includes("exam") || tit.includes("exam") || tit.includes("admission") || tit.includes("operator examination")) {
    return "Exam Element / Station Class";
  }
  if (cat.includes("accreditation") || tit.includes("accreditation")) {
    return "Accreditation Category";
  }
  return "Classification / Element";
}

function parseOptions(field: FieldDto): Array<{ label: string; value: string }> {
  if (field.options !== null && field.options !== undefined && Array.isArray(field.options) && field.options.length > 0) {
    return field.options.map((opt) =>
      typeof opt === "string" ? { label: opt, value: opt } : opt
    );
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

function getFieldSortPriority(field: FieldDto, defaultIndex: number): number {
  if (!field) return defaultIndex;
  const labelLower = (field.label || "").toLowerCase().trim();
  const idLower = (field.fieldId || field.id || "").toLowerCase().trim();

  // 0. Company / Business Name topmost in Applicant Details
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

  // 0.1. Entity Type and SEC/DTI Registration Number in Row 2
  if (idLower === "entitytype" || idLower === FIELD_ID_ENTITY_TYPE || labelLower === "entity type" || labelLower.includes("entity type")) return 1;
  if (idLower === "dtisecregistration" || idLower === "dti_sec_registration" || idLower === "fd000000-0000-0000-0000-000000000086" || labelLower.includes("sec / dti") || labelLower.includes("sec/dti") || labelLower.includes("dti / sec") || labelLower.includes("dti/sec")) return 2;

  // 1. Personal Identity Fields
  if (
    labelLower.includes("full name") ||
    labelLower.includes("legal name") ||
    idLower === "fullname" ||
    idLower === FIELD_ID_FULL_NAME
  ) {
    return 3;
  }
  if (
    labelLower.includes("birth") ||
    idLower === "birthdate" ||
    idLower === FIELD_ID_BIRTH_DATE
  ) {
    return 4;
  }
  if (labelLower.includes("sex") || labelLower.includes("gender")) return 5;
  if (labelLower.includes("civil status")) return 6;
  if (labelLower.includes("nationality") || labelLower.includes("citizenship")) return 7;

  // 2. Address Fields in strict requested order:
  // First is Region, Province, Municipality/City, Barangay, then Street, then Zip Code
  if (labelLower === "region" || idLower === "region" || idLower === FIELD_ID_REGION) return 10;
  if (labelLower === "province" || idLower === "province" || idLower === FIELD_ID_PROVINCE) return 20;
  if (
    labelLower === "city" ||
    labelLower.includes("city / municipality") ||
    labelLower.includes("municipality") ||
    idLower === "city" ||
    idLower === FIELD_ID_CITY
  ) {
    return 30;
  }
  if (labelLower === "barangay" || idLower === "barangay" || idLower === FIELD_ID_BARANGAY) return 40;
  if (
    labelLower.includes("street") ||
    idLower === "street" ||
    labelLower.includes("unit") ||
    labelLower.includes("building") ||
    idLower === "address" ||
    labelLower === "complete address"
  ) {
    return 50;
  }
  if (labelLower.includes("zip") || labelLower.includes("postal") || idLower === "zipcode") return 60;

  // 3. Contact Details after Address
  if (
    labelLower.includes("contact") ||
    labelLower.includes("mobile") ||
    idLower === "contactno" ||
    idLower === FIELD_ID_CONTACT_NO
  ) {
    return 70;
  }
  if (labelLower.includes("email") || idLower === "email" || idLower === FIELD_ID_EMAIL) return 80;

  // 4. VAS Specific Fields Order
  if (idLower === "cpcnpacano" || idLower === FIELD_ID_CPCN_NO || labelLower.includes("cpcn / pa / ca no") || labelLower.includes("cpcn")) return 85;
  if (idLower === "cpcndateofexpiry" || idLower === FIELD_ID_CPCN_EXPIRY || labelLower.includes("cpcn / pa / ca date") || labelLower.includes("cpcn date of expiry") || labelLower.includes("cpcn / pa / ca no. date of expiry")) return 86;
  if (idLower === "corvasno" || idLower === "certificateno" || idLower === FIELD_ID_COR_VAS_NO || labelLower.includes("cor / vas no") || labelLower.includes("cor/vas no") || labelLower.includes("certificate no")) return 87;
  if (idLower === "corvasexpirydate" || idLower === "corvasnoexpirydate" || idLower === FIELD_ID_COR_VAS_EXPIRY || idLower === "dateofexpiry" || idLower === FIELD_ID_DATE_OF_EXPIRY || labelLower.includes("cor / vas no. expiry date") || labelLower.includes("cor / vas expiry date") || labelLower.includes("license expiry date")) return 88;
  if (idLower === "knownbyanothername" || idLower === FIELD_ID_KNOWN_OTHER_NAME || labelLower.includes("known by other name") || labelLower.includes("known by another name")) return 89;
  if (idLower === "othertradename" || idLower === FIELD_ID_OTHER_TRADE_NAME || labelLower.includes("please specify")) return 90;
  if (idLower === "valueaddedservices" || labelLower.includes("value added service")) return 91;
  if (idLower === "vasregistrationno" || idLower === FIELD_ID_VAS_REG_NO || labelLower.includes("vas registration")) return 92;

  // 5. Technical Personnel section fields order
  if (idLower === "supervisingengineer" || idLower === "fd000000-0000-0000-0000-000000000252" || labelLower === "supervising engineer" || labelLower.includes("supervising engineer")) return 110;
  if (idLower === "supervisingengineercertno" || idLower === "certificateectno" || idLower === "fd000000-0000-0000-0000-000000000250" || labelLower === "certificate/ect no." || (labelLower.includes("certificate/ect") && !labelLower.includes("expiry"))) return 120;
  if (idLower === "supervisingengineerexpirydate" || idLower === "certificateectexpirydate" || idLower === "fd000000-0000-0000-0000-000000000255" || labelLower.includes("certificate/ect no. date of expiry") || labelLower.includes("certificate/ect date of expiry")) return 125;
  if (idLower === "technicianname" || idLower === "fd000000-0000-0000-0000-000000000253" || labelLower === "technician name" || labelLower.includes("technician name")) return 130;
  if (idLower === "techniciancertno" || idLower === "fd000000-0000-0000-0000-000000000254" || labelLower === "certificate/number" || (labelLower.includes("certificate/number") && !labelLower.includes("expiry"))) return 140;
  if (idLower === "technicianexpirydate" || idLower === "fd000000-0000-0000-0000-000000000251" || labelLower.includes("certificate/number date of expiry") || labelLower === "date of expiry" || labelLower.includes("date of expiry")) return 150;

  // 6. Station / Equipment section fields order
  if (idLower === "callsign" || idLower === FIELD_ID_CALL_SIGN || labelLower === "call sign") return 160;
  if (idLower === "servicearea" || idLower === FIELD_ID_SERVICE_AREA || labelLower.includes("service area") || labelLower.includes("points of comm")) return 165;
  if (idLower === "frequency" || idLower === FIELD_ID_FREQUENCY || labelLower === "frequency" || labelLower.includes("frequency (ies)")) return 170;
  if (idLower === "bandwidth" || idLower === FIELD_ID_BANDWIDTH || labelLower === "bandwidth") return 175;
  if (idLower === "bandwidthunit" || idLower === FIELD_ID_BANDWIDTH_UNIT || labelLower === "unit") return 176;
  if (idLower === "emission" || idLower === FIELD_ID_EMISSION || labelLower === "emission") return 180;
  if (idLower === "poweroutput" || idLower === FIELD_ID_POWER_OUTPUT || labelLower.includes("power output")) return 185;
  if (idLower === "hoursofoperation" || idLower === FIELD_ID_HOURS_OP || labelLower.includes("hours of operation")) return 190;

  // 7. Particulars section fields order
  if (idLower === "stationclass" || idLower === "classofstation" || idLower === FIELD_ID_STATION_CLASS || idLower === FIELD_ID_CLASS_OF_STATION || labelLower === "station class" || labelLower === "class of station") return 200;
  if (idLower === "exactlocation" || labelLower === "exact location") return 205;
  if (idLower === "longitude" || labelLower.includes("longitude")) return 210;
  if (idLower === "latitude" || labelLower.includes("latitude")) return 215;
  if (idLower === "configuration" || idLower === FIELD_ID_CONFIGURATION || labelLower === "configuration") return 220;
  if (idLower === "datarate" || idLower === FIELD_ID_DATA_RATE || labelLower === "data rate") return 225;
  if (idLower === "remarks" || idLower === FIELD_ID_REMARKS || labelLower === "remarks") return 230;
  if (idLower === "noofunits" || idLower === FIELD_ID_NO_OF_UNITS || labelLower.includes("number of units") || labelLower.includes("no. of units")) return 235;

  // 8. Source of Equipment section fields order
  if (idLower === "dealername" || idLower === FIELD_ID_DEALER_NAME || labelLower.includes("dealer")) return 250;
  if (idLower === "authorizedsellerbuyer" || idLower === FIELD_ID_AUTH_SELLER || labelLower.includes("authorized seller")) return 255;
  if (idLower === "orvoiceno" || idLower === "orvoicenum" || idLower === FIELD_ID_OR_INVOICE || labelLower.includes("or / invoice") || labelLower.includes("or/invoice")) return 260;
  if (idLower === "amateurlicenseno" || idLower === "amateurlicensenopermitno" || idLower === FIELD_ID_AMATEUR_LIC || idLower === FIELD_ID_AMATEUR_LIC_PERMIT || labelLower.includes("amateur license no") || labelLower.includes("permit to possess no")) return 265;
  if (idLower === "permitrslno" || idLower === FIELD_ID_PERMIT_RSL || labelLower.includes("permit / rsl") || labelLower.includes("permit/rsl")) return 270;
  if (idLower === "selleraddress" || idLower === FIELD_ID_SELLER_ADDR || labelLower.includes("seller address")) return 275;

  return 300 + defaultIndex;
}

export function DynamicFormRenderer({
  form,
  values = {},
  onChange,
  onStructuredNameChange,
  structuredNameData,
  applicantName = "",
  allowCompany = false,
  applicantType,
  serviceCategory,
  serviceTitle,
  selectedVariantId,
  onVariantChange,
  selectedElementId,
  onElementChange,
  noOfYears,
  onNoOfYearsChange,
  showApplicationTypeSection = true,
  variants = [],
  variantElements = [],
  errors = {},
  hideSections = [],
  isBulk = false,
  appMode,
}: DynamicFormRendererProps) {
  // Safe guard: form and sections might be undefined when loading
  const sections = form?.sections ?? [];
  const allFields = sections.flatMap((s) => s?.fields ?? []);
  const regionField = allFields.find((f) => {
    const l = (f?.label || "").toLowerCase().trim();
    const id = f?.fieldId || f?.id || "";
    return l === "region" || id === FIELD_ID_REGION;
  });
  const provinceField = allFields.find((f) => {
    const l = (f?.label || "").toLowerCase().trim();
    const id = f?.fieldId || f?.id || "";
    return l === "province" || id === FIELD_ID_PROVINCE;
  });
  const cityField = allFields.find((f) => {
    const l = (f?.label || "").toLowerCase().trim();
    const id = f?.fieldId || f?.id || "";
    return (
      l === "city" ||
      l === "city / municipality" ||
      l === "municipality" ||
      id === FIELD_ID_CITY
    );
  });
  const barangayField = allFields.find((f) => {
    const l = (f?.label || "").toLowerCase().trim();
    const id = f?.fieldId || f?.id || "";
    return l === "barangay" || id === FIELD_ID_BARANGAY;
  });

  const regionFieldId = regionField?.fieldId || regionField?.id;
  const provinceFieldId = provinceField?.fieldId || provinceField?.id;
  const cityFieldId = cityField?.fieldId || cityField?.id;
  const barangayFieldId = barangayField?.fieldId || barangayField?.id;

  const currentRegionVal = (regionFieldId && values?.[regionFieldId]) || values?.["region"] || "";
  const currentProvinceVal = (provinceFieldId && values?.[provinceFieldId]) || values?.["province"] || "";
  const currentCityVal = (cityFieldId && values?.[cityFieldId]) || values?.["city"] || "";

  const [selectedRegionId, setSelectedRegionId] = React.useState<string | undefined>(undefined);
  const [selectedProvinceId, setSelectedProvinceId] = React.useState<string | undefined>(undefined);
  const [selectedMunicipalityId, setSelectedMunicipalityId] = React.useState<string | undefined>(undefined);

  const {
    regions,
    provinces,
    municipalities,
    barangays,
    loadingRegions,
    loadingProvinces,
    loadingMunicipalities,
    loadingBarangays,
  } = useGeographicLocations(selectedRegionId, selectedProvinceId, selectedMunicipalityId);

  // Sync selected IDs when form values change
  React.useEffect(() => {
    if (!currentRegionVal) {
      setSelectedRegionId(undefined);
      return;
    }
    const matchedRegion = regions.find(
      (r) =>
        r.name.toLowerCase() === currentRegionVal.toLowerCase() ||
        r.id === currentRegionVal ||
        (r.code && currentRegionVal.toLowerCase().includes(r.code.toLowerCase()))
    );
    setSelectedRegionId(matchedRegion?.id);
  }, [currentRegionVal, regions]);

  React.useEffect(() => {
    if (!currentProvinceVal) {
      setSelectedProvinceId(undefined);
      return;
    }
    const matchedProvince = provinces.find(
      (p) =>
        p.name.toLowerCase() === currentProvinceVal.toLowerCase() ||
        p.id === currentProvinceVal
    );
    setSelectedProvinceId(matchedProvince?.id);
  }, [currentProvinceVal, provinces]);

  React.useEffect(() => {
    if (!currentCityVal) {
      setSelectedMunicipalityId(undefined);
      return;
    }
    const matchedMunicipality = municipalities.find(
      (m) =>
        m.name.toLowerCase() === currentCityVal.toLowerCase() ||
        m.id === currentCityVal
    );
    setSelectedMunicipalityId(matchedMunicipality?.id);
  }, [currentCityVal, municipalities]);

  const hiddenKeys = hideSections.map((k) => k.toLowerCase());

  const isTypeSection = (section: FormSectionDto): boolean => {
    const key = (section.key || section.id || "").toLowerCase();
    const title = (section.title || "").toLowerCase();
    return (
      key === "typeofcertificate" ||
      key === "permittype" ||
      key === "apptype" ||
      key === "applicationtype" ||
      key === "typeofapplication" ||
      key === "applicationspecifications" ||
      key === "application_specifications" ||
      title === "application specifications" ||
      title === "application specification" ||
      title === "type of certificate / application" ||
      title === "type of application & permit category" ||
      title === "type of application & category" ||
      title === "type of certificate" ||
      title === "type of application" ||
      title === "application type" ||
      title === "permit type / application type" ||
      title === "permit type" ||
      title === "permit category"
    );
  };

  const catLower = (serviceCategory || "").toLowerCase();
  const titLower = (serviceTitle || "").toLowerCase();
  const isExam = catLower.includes("exam") || titLower.includes("exam") || titLower.includes("admission") || titLower.includes("operator examination");
  const isPermit = catLower.includes("permit") || titLower.includes("permit");
  const isRequestOrComplaint = catLower.includes("request") || catLower.includes("complaint") || titLower.includes("complaint") || titLower.includes("request");
  const isAccreditation = catLower.includes("accreditation") || titLower.includes("accreditation");

  const matchedVariant = variants.find((v) => String(v.id) === String(selectedVariantId));
  const varDesc = (matchedVariant?.description || matchedVariant?.name || "").toLowerCase();

  const isCopyOfCert =
    (catLower.includes("certificate") || titLower.includes("certificate") || titLower.includes("copy")) &&
    (titLower.includes("copy of certificate") ||
      titLower.includes("copy of certificates") ||
      titLower.includes("ntc 1-21") ||
      titLower.includes("ntc_1_21") ||
      titLower.includes("certified true copy") ||
      titLower.includes("duplicate copy") ||
      varDesc.includes("copy") ||
      varDesc.includes("certified true") ||
      varDesc.includes("duplicate"));

  const isDuplicateCopy =
    isCopyOfCert &&
    (varDesc.includes("duplicate") || String(selectedVariantId).endsWith("50"));

  const isCertifiedTrueCopy = isCopyOfCert && !isDuplicateCopy;

  const isLifetimeSupplementary = varDesc.includes("lifetime") || String(selectedVariantId).endsWith("35");
  const isAmateurCert = catLower.includes("certificate") && (titLower.includes("amateur") || titLower.includes("ntc 1-03") || titLower.includes("ntc_1_03") || varDesc.includes("amateur"));
  const isVas = (catLower.includes("certificate") || titLower.includes("vas")) && (titLower.includes("vas") || titLower.includes("value-added") || titLower.includes("ntc 1-20") || titLower.includes("ntc_1_20") || varDesc.includes("vas"));
  const isDeviceRegistration =
    titLower.includes("rfid") ||
    titLower.includes("srd") ||
    titLower.includes("wdn") ||
    titLower.includes("device") ||
    titLower.includes("ntc 1-19") ||
    titLower.includes("ntc_1_19") ||
    varDesc.includes("rfid") ||
    varDesc.includes("srd") ||
    varDesc.includes("wdn") ||
    varDesc.includes("device");

  const isRenewal = (matchedVariant?.type || "").toUpperCase() === "RENEWAL" || varDesc.includes("renewal");
  const isModification = (matchedVariant?.type || "").toUpperCase() === "MODIFICATION" || varDesc.includes("modification") || isLifetimeSupplementary;
  const isRenewalOrMod = isRenewal || isModification;

  const isRocService =
    titLower.includes("radio operator") ||
    titLower.includes("roc") ||
    titLower.includes("operator certificate") ||
    titLower.includes("ntc 1-02") ||
    titLower.includes("ntc_1_02") ||
    catLower.includes("radio operator") ||
    catLower.includes("roc") ||
    catLower.includes("certificate") ||
    varDesc.includes("radio operator") ||
    varDesc.includes("roc") ||
    varDesc.includes("radiotelephone") ||
    varDesc.includes("commercial radio") ||
    varDesc.includes("aircraft") ||
    varDesc.includes("foreign pilot") ||
    varDesc.includes("pilot") ||
    varDesc.includes("government") ||
    varDesc.includes("land mobile") ||
    varDesc.includes("special radio");

  const isExcludedFromYears = isLifetimeSupplementary;

  const isCpeAccreditation =
    catLower.includes("accreditation") ||
    titLower.includes("customer premises") ||
    titLower.includes("cpe") ||
    varDesc.includes("customer premises") ||
    varDesc.includes("cpe");

  const isAmateurPermitService =
    (titLower.includes("amateur") || varDesc.includes("amateur")) &&
    (isPermit || titLower.includes("permit") || varDesc.includes("permit") || titLower.includes("ntc 1-09") || titLower.includes("ntc_1_09"));

  const isVanityNew =
    isAmateurPermitService &&
    varDesc.includes("vanity") &&
    !varDesc.includes("renewal") &&
    ((matchedVariant?.type || "").toUpperCase() === "NEW" || varDesc.includes("new") || String(selectedVariantId) === "60000000-0000-0000-0000-000000000067");

  const isVanityRen =
    isAmateurPermitService &&
    varDesc.includes("vanity") &&
    ((matchedVariant?.type || "").toUpperCase() === "RENEWAL" || varDesc.includes("renewal") || String(selectedVariantId) === "60000000-0000-0000-0000-000000000065");

  const isSpecialEvent =
    isAmateurPermitService &&
    (varDesc.includes("special event") || String(selectedVariantId) === "60000000-0000-0000-0000-000000000066");

  const isForeignVisitor =
    isAmateurPermitService &&
    (varDesc.includes("foreign") || String(selectedVariantId) === "60000000-0000-0000-0000-000000000064");

  const isPurchaseOrPurchasePossess =
    isAmateurPermitService &&
    !isForeignVisitor &&
    !isVanityNew &&
    !isVanityRen &&
    !isSpecialEvent &&
    !varDesc.includes("storage") &&
    !varDesc.includes("sell") &&
    !varDesc.includes("transfer") &&
    (varDesc.includes("purchase") || varDesc.includes("possess"));

  const isStorageOrSell =
    isAmateurPermitService &&
    (varDesc.includes("storage") || varDesc.includes("sell") || varDesc.includes("transfer"));

  const isAmateurPermitWithYears = isForeignVisitor || isVanityNew || isVanityRen || isSpecialEvent;

  // Multi-year validity selection (1, 2, 3 years) is applicable for Licenses, all Radio Operator Certificates, CPE Supplier Accreditation, Amateur Certificate Modification, and specified Amateur Permits (Foreign Visitor, Vanity New/Ren, Special Event)
  const showNumberOfYears =
    !isCopyOfCert &&
    !isExam &&
    !isRequestOrComplaint &&
    !isDeviceRegistration &&
    !isVas &&
    !isExcludedFromYears &&
    (isCpeAccreditation ||
     isRocService ||
     (isAmateurCert && isModification) ||
     isAmateurPermitWithYears ||
     (!isPermit && (catLower.includes("license") || titLower.includes("license"))));

  // Dynamic Certificate Services & Types Query
  const { serviceOptions: dynamicCertServiceOptions, getTypesForService } = useCertificateServicesQuery();

  // Check the applicant classification selected in Step 2:
  // If applicantType is explicitly 'individual', handle applicant details as individual person.
  // If applicantType is explicitly 'company', handle applicant details as company/corporate entity.
  const isExplicitIndividual = applicantType === "individual" || (values?.["applicantType"] || "").toLowerCase() === "individual";
  const isExplicitCompany = applicantType === "company" || (values?.["applicantType"] || "").toLowerCase() === "company";

  const isCompanyCertService =
    titLower.includes("tvro") ||
    titLower.includes("catv") ||
    titLower.includes("value-added") ||
    titLower.includes("vas") ||
    titLower.includes("rfid") ||
    titLower.includes("srd") ||
    titLower.includes("wdn") ||
    titLower.includes("cpe") ||
    titLower.includes("accreditation") ||
    titLower.includes("commercial") ||
    varDesc.includes("tvro") ||
    varDesc.includes("catv") ||
    varDesc.includes("vas") ||
    varDesc.includes("rfid") ||
    varDesc.includes("srd") ||
    varDesc.includes("wdn") ||
    varDesc.includes("cpe") ||
    matchedVariant?.isIndividual === false;

  const isNonIndividualEntity = isExplicitIndividual
    ? false
    : isExplicitCompany
    ? true
    : isCompanyCertService;

  const isIndividualVar = !isNonIndividualEntity;

  const isExcludedFromElements =
    isLifetimeSupplementary ||
    varDesc.includes("special radio operator") ||
    varDesc.includes("special") ||
    ((varDesc.includes("land mobile") || varDesc.includes("rroc-land")) && isModification);

  const showElements = !isCopyOfCert && variantElements.length > 0 && !isExcludedFromElements;

  const visibleSections = sections.filter((section) => {
    if (!section) return false;
    if (isTypeSection(section)) return false;
    const key = (section.key || section.id || "").toLowerCase();
    const title = (section.title || "").toLowerCase();

    // For Copy of Certificates (NTC 1-21):
    // Remove "Particulars of Permit/License/Certificate" and "Circumstances of Loss/Damage"
    if (isCopyOfCert) {
      const isRemovedCopySection =
        key === "permitlicensecertificateno" ||
        key === "permit_license_certificate_no" ||
        key === "circumstances" ||
        key === "circumstancesofloss" ||
        key === "circumstances_of_loss" ||
        title.includes("particulars of permit") ||
        title.includes("particulars of license") ||
        title.includes("particulars of certificate") ||
        title.includes("circumstances");

      if (isRemovedCopySection) {
        return false;
      }

      // For Certified True Copy: only the 4 CTC fields are requested
      if (isCertifiedTrueCopy) {
        const isApplicantOrAddressSection =
          key === "applicant" ||
          key === "applicantaddress" ||
          key === "applicant_address" ||
          key === "address" ||
          title.includes("applicant's details") ||
          title.includes("applicant details") ||
          title.includes("applicant / company") ||
          title.includes("address");

        if (isApplicantOrAddressSection) {
          return false;
        }
      }
    }

    // Exclude Corporate Representative and Company Details sections from Step 3 (these are the corporate filing executor details from Step 2).
    // The named individual applicant/licensee details to be named on the certificate/permit MUST remain visible in Step 3.
    const isCompanyOrRepSection =
      key === "companydetails" ||
      key === "company_details" ||
      key === "company" ||
      key === "representative" ||
      key === "authorizedrepresentative" ||
      title === "company details" ||
      title === "company / corporation details" ||
      title === "representative" ||
      title === "authorized representative";

    if (isCompanyOrRepSection) {
      return false;
    }

    // Invoice section appears for Non-Dealers only
    const isInvoiceSection =
      key === "invoicedetails" ||
      key === "invoice_details" ||
      key === "invoice" ||
      title.includes("invoice");

    if (isInvoiceSection) {
      const isNonDealerVariant = varDesc.includes("non-dealer") || varDesc.includes("non dealer") || String(selectedVariantId).endsWith("23");
      const registrationTypeVal = (values?.["registrationType"] || values?.["Registration Type"] || values?.["registration_type"] || "").toLowerCase();
      const isNonDealerRegType = registrationTypeVal.includes("non");
      const isDealer = varDesc.includes("dealer") && !isNonDealerVariant;

      if (isDealer || (!isNonDealerVariant && !isNonDealerRegType)) {
        return false;
      }
    }

    const isAmateurCertSection = catLower.includes("certificate") && (titLower.includes("amateur") || titLower.includes("ntc 1-03") || titLower.includes("ntc_1_03"));
    if (isAmateurCertSection) {
      const isAmateurRemovedSection =
        key === "employmentstatus" ||
        key === "employment_status" ||
        key === "employment" ||
        key === "classofstation" ||
        key === "class_of_station" ||
        key === "classofstations" ||
        key === "club" ||
        key === "clubdetails" ||
        key === "club_details" ||
        key === "equipment" ||
        key === "equipmentdetails" ||
        key === "equipment_details" ||
        key === "certificateparticulars" ||
        title.includes("employment") ||
        title.includes("class of station") ||
        title.includes("club") ||
        title.includes("equipment") ||
        title.includes("certificate particulars");

      if (isAmateurRemovedSection) {
        return false;
      }
    }

    const isClubSection =
      key === "club" ||
      key === "clubdetails" ||
      key === "club_details" ||
      title.includes("club details") ||
      title.includes("if club station");

    if (isClubSection) {
      return false;
    }

    // Remove legacy classification section (Classification)
    const isClassificationSection =
      key === "classification" ||
      title === "classification" ||
      title.includes("classification");

    if (isClassificationSection) {
      return false;
    }

    if (isAmateurPermitService) {
      const isAllowedAmateurSection =
        key === "applicant" ||
        title.includes("applicant") ||
        key === "stationequipment" ||
        key === "proposedstation" ||
        title.includes("station/equipment") ||
        title.includes("proposed station") ||
        title.includes("station") ||
        key === "particulars" ||
        (title.includes("particulars") && !title.includes("equipment") && !title.includes("antenna") && !title.includes("signal")) ||
        key === "sourceofequipment" ||
        title.includes("source of equipment") ||
        key === "intendeduse" ||
        title.includes("intended use of equipment") ||
        title.includes("intended use");

      if (!isAllowedAmateurSection) {
        return false;
      }
    }

    return (
      !hiddenKeys.includes(key) &&
      !hiddenKeys.includes(title) &&
      key !== "declaration" &&
      !key.includes("declaration") &&
      title !== "declaration" &&
      !title.includes("declaration") &&
      title !== "payment details" &&
      !title.includes("payment") &&
      key !== "payment" &&
      !key.includes("payment")
    );
  });

  return (
    <View style={styles.container}>
      {/* Section 1: Application Type, Category/Element, & Duration from serviceVariant endpoint */}
      {showApplicationTypeSection && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconCircleText}>1</Text>
              </View>
              <Text style={styles.sectionTitle}>Application Type</Text>
            </View>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>SECTION 1</Text>
            </View>
          </View>

          <FormGrid>
            {/* 1. Type of Application (Service Variant Dropdown) */}
            <FormCol span={showNumberOfYears ? (showElements ? 4 : 6) : (showElements ? 6 : 12)}>
              <Select
                label="Type of Application"
                required
                value={selectedVariantId || (variants[0] ? String(variants[0].id) : "")}
                options={
                  isVas
                    ? variants.length > 0
                      ? variants.map((v) => ({
                          label: "RENEWAL — Certificate of Registration as a Value-Added Service (VAS) Provider",
                          value: String(v.id),
                        }))
                      : [{ label: "RENEWAL — Certificate of Registration as a Value-Added Service (VAS) Provider", value: "Renewal" }]
                    : variants.length > 0
                    ? variants.map((v) => {
                        const vType = v.type && v.type !== "NA" && v.type !== "N/A" ? v.type : "";
                        const vDesc = v.description || v.name || v.id;
                        const displayLabel = vType ? `${vType.toUpperCase()} — ${vDesc}` : `${vDesc}`;
                        return {
                          label: displayLabel,
                          value: String(v.id),
                        };
                      })
                    : [
                        { label: "NEW — First-time application / issuance", value: "New" },
                        { label: "RENEWAL — Renewal of existing permit, license, or certificate", value: "Renewal" },
                        { label: "MODIFICATION — Amendment or change of registered particulars", value: "Modification" },
                      ]
                }
                placeholder="Select Type of Application..."
                onValueChange={(val: string) => {
                  const matched = variants.find((v) => String(v.id) === String(val));
                  const vDesc = matched ? (matched.description || matched.name || matched.type || val) : val;
                  onVariantChange?.(val, String(vDesc));
                }}
              />
            </FormCol>

            {/* 2. Type of Certificate / License / Station Class / Permit Type (Filtered by Service Variant) */}
            {showElements && (
              <FormCol span={showNumberOfYears ? 4 : 6}>
                <Select
                  label={getElementFieldLabel(serviceCategory, serviceTitle)}
                  required
                  value={selectedElementId || (variantElements[0] ? String(variantElements[0].id) : "")}
                  options={variantElements.map((elem) => {
                    const code = (elem.code || "").trim();
                    const desc = (elem.description || "").trim();
                    const title = !code
                      ? desc || String(elem.id)
                      : !desc
                      ? code
                      : desc.toLowerCase().startsWith(code.toLowerCase())
                      ? desc
                      : `${code} — ${desc}`;
                    return {
                      label: title,
                      value: String(elem.id),
                    };
                  })}
                  placeholder={`Select ${getElementFieldLabel(serviceCategory, serviceTitle)}...`}
                  onValueChange={(val: string) => {
                    const matched = variantElements.find((e) => String(e.id) === String(val));
                    const code = (matched?.code || "").trim();
                    const desc = (matched?.description || "").trim();
                    const eTitle = !code
                      ? desc || val
                      : !desc
                      ? code
                      : desc.toLowerCase().startsWith(code.toLowerCase())
                      ? desc
                      : `${code} — ${desc}`;
                    onElementChange?.(val, eTitle);
                  }}
                />
              </FormCol>
            )}

            {/* 3. Number of Years (only for applicable categories) */}
            {showNumberOfYears && (
              <FormCol span={showElements ? 4 : 6}>
                <Select
                  label="Number of Years"
                  required
                  value={noOfYears || "1"}
                  options={[
                    { label: "1 Year", value: "1" },
                    { label: "2 Years", value: "2" },
                    { label: "3 Years", value: "3" },
                  ]}
                  placeholder="Select Duration..."
                  onValueChange={(val: string) => onNoOfYearsChange?.(val)}
                />
              </FormCol>
            )}

            {/* Modification Due To (for Modification / Lifetime Supplementary) */}
            {isAmateurCert && isModification && (
              <FormCol span={12}>
                <Select
                  label="Modification Due to"
                  required
                  value={values?.["modificationDueTo"] || values?.["Modification Due To"] || ""}
                  options={
                    isLifetimeSupplementary
                      ? [
                          { label: "Additional Equipment", value: "Additional Equipment" },
                          { label: "Deletion of Equipment", value: "Deletion of Equipment" },
                          { label: "Others", value: "Others" },
                        ]
                      : [
                          { label: "Upgrade of Class of Station", value: "Upgrade of Class of Station" },
                          { label: "Change of Personal Info", value: "Change of Personal Info" },
                          { label: "Others", value: "Others" },
                        ]
                  }
                  placeholder="Select reason for modification..."
                  onValueChange={(val: string) => onChange("modificationDueTo", "Modification Due To", val)}
                />
              </FormCol>
            )}

            {/* Certificate Number & Date of Expiry (for Renewal & Modification & VAS) */}
            {((isAmateurCert && isRenewalOrMod) || isVas) && (
              <>
                <FormCol span={6}>
                  <ValidatedInput
                    label={isVas ? "Certificate no." : (isRenewal ? "Certificate No." : "Certificate Number")}
                    required
                    placeholder={isVas ? "e.g. COR-VAS-2022-0045" : "e.g. ROC-2022-00123"}
                    value={
                      (isVas ? values?.[FIELD_ID_COR_VAS_NO] : values?.[FIELD_ID_LICENSE_NO]) ||
                      values?.["licenseNo"] ||
                      values?.["certificateNo"] ||
                      values?.["certificateNumber"] ||
                      values?.["Certificate no."] ||
                      values?.["Certificate no"] ||
                      values?.["Certificate Number"] ||
                      values?.["Certificate No."] ||
                      values?.["corVasNo"] ||
                      ""
                    }
                    onChangeText={(val) => {
                      if (isVas) {
                        onChange(FIELD_ID_COR_VAS_NO, "Certificate no.", val);
                        onChange("certificateNumber", "Certificate no.", val);
                        onChange("certificateNo", "Certificate no.", val);
                        onChange("corVasNo", "Certificate no.", val);
                      } else {
                        onChange(FIELD_ID_LICENSE_NO, "Certificate Number", val);
                        onChange("licenseNo", "Certificate Number", val);
                        onChange("certificateNumber", "Certificate Number", val);
                      }
                    }}
                  />
                </FormCol>

                <FormCol span={6}>
                  <DatePickerInput
                    label={isVas ? "Certificate no. Date of Expiry" : "Date of Expiry"}
                    required
                    placeholder="MM/DD/YYYY"
                    value={
                      (isVas ? values?.[FIELD_ID_COR_VAS_EXPIRY] : values?.[FIELD_ID_DATE_OF_EXPIRY]) ||
                      values?.["dateOfExpiry"] ||
                      values?.["expiryDate"] ||
                      values?.["Certificate no. Date of Expiry"] ||
                      values?.["corVasExpiryDate"] ||
                      values?.["Date of Expiry"] ||
                      ""
                    }
                    onChangeText={(val) => {
                      if (isVas) {
                        onChange(FIELD_ID_COR_VAS_EXPIRY, "Certificate no. Date of Expiry", val);
                        onChange("expiryDate", "Certificate no. Date of Expiry", val);
                        onChange("corVasExpiryDate", "Certificate no. Date of Expiry", val);
                        onChange("dateOfExpiry", "Certificate no. Date of Expiry", val);
                      } else {
                        onChange(FIELD_ID_DATE_OF_EXPIRY, "Date of Expiry", val);
                        onChange("dateOfExpiry", "Date of Expiry", val);
                      }
                    }}
                  />
                </FormCol>
              </>
            )}

            {/* Preferred Call Sign/s (for Vanity New/Ren and Special Event) */}
            {(isVanityNew || isVanityRen || isSpecialEvent) && (
              <FormCol span={isVanityRen ? 4 : 6}>
                <ValidatedInput
                  label="Preferred Call Sign/s"
                  placeholder="e.g. 4F1AAA (Optional)"
                  value={
                    values?.[FIELD_ID_PREFERRED_CALL_SIGN] ||
                    values?.["preferredCallSign"] ||
                    values?.["preferredCallSigns"] ||
                    values?.["Preferred Call Sign/s"] ||
                    values?.["Preferred Call Sign"] ||
                    ""
                  }
                  onChangeText={(val) => {
                    onChange(FIELD_ID_PREFERRED_CALL_SIGN, "Preferred Call Sign/s", val);
                    onChange("preferredCallSign", "Preferred Call Sign/s", val);
                  }}
                />
              </FormCol>
            )}

            {/* Permit Number & Date of Expiry for Vanity Renewal */}
            {isVanityRen && (
              <>
                <FormCol span={4}>
                  <ValidatedInput
                    label="Permit Number"
                    required
                    placeholder="e.g. SP-VAN-2022-00123"
                    value={
                      values?.[FIELD_ID_LICENSE_NO] ||
                      values?.["permitNo"] ||
                      values?.["permitNumber"] ||
                      values?.["licenseNo"] ||
                      values?.["Permit Number"] ||
                      ""
                    }
                    onChangeText={(val) => {
                      onChange(FIELD_ID_LICENSE_NO, "Permit Number", val);
                      onChange("permitNo", "Permit Number", val);
                      onChange("permitNumber", "Permit Number", val);
                    }}
                  />
                </FormCol>
                <FormCol span={4}>
                  <DatePickerInput
                    label="Date of Expiry"
                    required
                    placeholder="MM/DD/YYYY"
                    value={
                      values?.[FIELD_ID_DATE_OF_EXPIRY] ||
                      values?.["dateOfExpiry"] ||
                      values?.["expiryDate"] ||
                      values?.["Date of Expiry"] ||
                      ""
                    }
                    onChangeText={(val) => {
                      onChange(FIELD_ID_DATE_OF_EXPIRY, "Date of Expiry", val);
                      onChange("dateOfExpiry", "Date of Expiry", val);
                    }}
                  />
                </FormCol>
              </>
            )}
          </FormGrid>
        </View>
      )}

      {(() => {
        const copyParticularsSection: FormSectionDto = {
          id: "copyParticulars",
          key: "copyParticulars",
          title: isDuplicateCopy ? "Duplicate Copy Details" : "Certified True Copy Details",
          fields: [
            {
              id: FIELD_ID_TARGET_SERVICE,
              fieldId: FIELD_ID_TARGET_SERVICE,
              label: "Service",
              fieldType: "dropdown",
              isRequired: true,
              placeholder: "Select Certificate Service...",
              options: dynamicCertServiceOptions,
            },
            {
              id: FIELD_ID_TARGET_CERT_TYPE,
              fieldId: FIELD_ID_TARGET_CERT_TYPE,
              label: "Type",
              fieldType: "dropdown",
              isRequired: true,
              placeholder: "Select Certificate Type...",
            },
            {
              id: FIELD_ID_TARGET_CERT_NUMBER,
              fieldId: FIELD_ID_TARGET_CERT_NUMBER,
              label: "Certificate Number",
              fieldType: "text",
              isRequired: true,
              placeholder: "e.g. ROC-2023-01928",
            },
            ...(isCertifiedTrueCopy
              ? [
                  {
                    id: FIELD_ID_NO_OF_COPIES,
                    fieldId: FIELD_ID_NO_OF_COPIES,
                    label: "No. of Copies",
                    fieldType: "dropdown",
                    isRequired: true,
                    placeholder: "Select No. of Copies...",
                    options: ["1", "2", "3", "4", "5", "10"],
                  },
                ]
              : []),
          ],
        };

        const sortedVisibleSections = isVas
          ? [...visibleSections].sort((a, b) => {
              const getVasSectionPriority = (sec: FormSectionDto): number => {
                const k = (sec.key || sec.id || "").toLowerCase();
                const t = (sec.title || "").toLowerCase();
                if (k === "applicant" || t.includes("applicant")) return 1;
                if (k === "vasparticulars" || t.includes("vas registration particulars") || t.includes("particulars")) return 2;
                if (k === "knownbyanothername" || t.includes("known by")) return 3;
                if (k === "valueaddedservices" || t.includes("value added")) return 4;
                if (k === "vasregistration" || t.includes("vas registration")) return 5;
                return 10;
              };
              return getVasSectionPriority(a) - getVasSectionPriority(b);
            })
          : isAmateurPermitService
          ? visibleSections
              .filter((sec) => {
                const k = (sec.key || sec.id || "").toLowerCase();
                const t = (sec.title || "").toLowerCase();
                return (
                  k === "applicant" ||
                  t.includes("applicant") ||
                  k === "stationequipment" ||
                  k === "proposedstation" ||
                  t.includes("station/equipment") ||
                  t.includes("proposed station") ||
                  k === "particulars" ||
                  (t.includes("particulars") && !t.includes("equipment") && !t.includes("antenna") && !t.includes("signal")) ||
                  k === "sourceofequipment" ||
                  t.includes("source of equipment") ||
                  k === "intendeduse" ||
                  t.includes("intended use") ||
                  k === "declaration" ||
                  t.includes("acknowledgement") ||
                  t.includes("declaration")
                );
              })
              .sort((a, b) => {
                const getAmateurSectionPriority = (sec: FormSectionDto): number => {
                  const k = (sec.key || sec.id || "").toLowerCase();
                  const t = (sec.title || "").toLowerCase();
                  if (k === "applicant" || t.includes("applicant")) return 1;
                  if (k === "stationequipment" || k === "proposedstation" || t.includes("station/equipment") || t.includes("proposed station") || t.includes("station")) return 2;
                  if (k === "particulars" || t.includes("particulars")) return 3;
                  if (k === "sourceofequipment" || t.includes("source")) return 4;
                  if (k === "intendeduse" || t.includes("intended")) return 5;
                  if (k === "declaration" || t.includes("declaration") || t.includes("acknowledgement")) return 6;
                  return 10;
                };
                return getAmateurSectionPriority(a) - getAmateurSectionPriority(b);
              })
          : isCopyOfCert
          ? (() => {
              const hasCopyParticulars = visibleSections.some(
                (s) =>
                  (s.key || s.id || "").toLowerCase() === "copyparticulars" ||
                  (s.title || "").toLowerCase().includes("certificate details")
              );
              if (!hasCopyParticulars) {
                return [copyParticularsSection, ...visibleSections];
              }
              return visibleSections;
            })()
          : visibleSections;

        const renderedSections = sortedVisibleSections
          .map((section, sIdx) => {
            const rawFields = section.fields || [];
            const sectionFields = [...rawFields].sort((a, b) => {
              const idxA = rawFields.indexOf(a);
              const idxB = rawFields.indexOf(b);
              return getFieldSortPriority(a, idxA) - getFieldSortPriority(b, idxB);
            });
            const hasRepeater = sectionFields.some((f) => {
              const fType = (f.fieldType || f.type || "").toLowerCase();
              const fId = (f.fieldId || f.id || "").toLowerCase();
              const fLbl = (f.label || "").toLowerCase();
              return (
                fType === "repeater" ||
                fType === "table" ||
                fType === "repeater_table" ||
                fId === FIELD_ID_DEVICES.toLowerCase() ||
                fId === FIELD_ID_EQUIPMENT.toLowerCase() ||
                fId === FIELD_ID_ANTENNA.toLowerCase() ||
                fId === FIELD_ID_RADIO_OFFICERS.toLowerCase() ||
                fId === FIELD_ID_TVRO.toLowerCase() ||
                fId.includes("equipmentdetails") ||
                fId.includes("antennadetails") ||
                fId.includes("devicesdetails") ||
                fId.includes("radioofficers") ||
                fLbl.includes("particulars of equipment") ||
                fLbl.includes("registered devices details")
              );
            });

            const renderedFields = sectionFields.map((field, fIdx) => {
                  if (!field) return null;
                  const targetId = field.fieldId || field.id || `field-${fIdx}`;
                  const fIdLower = targetId.toLowerCase();
                  const rawVal = (values && values[targetId]) || (values && field.label && values[field.label]) || "";
                  const err = (errors && errors[targetId]) || undefined;
                  const rawType = (field.fieldType || field.type || "").toLowerCase();
                  const labelLower = (field.label || "").toLowerCase().trim();

                  // Skip redundant single fields if full repeater already encompasses them in this section
                  if (
                    hasRepeater &&
                    fIdLower !== FIELD_ID_DEVICES.toLowerCase() &&
                    fIdLower !== FIELD_ID_EQUIPMENT.toLowerCase() &&
                    fIdLower !== FIELD_ID_ANTENNA.toLowerCase() &&
                    fIdLower !== FIELD_ID_RADIO_OFFICERS.toLowerCase() &&
                    fIdLower !== FIELD_ID_TVRO.toLowerCase() &&
                    !fIdLower.includes("equipmentdetails") &&
                    !fIdLower.includes("antennadetails") &&
                    !fIdLower.includes("devicesdetails") &&
                    !fIdLower.includes("radioofficers") &&
                    !fIdLower.includes("tvro") &&
                    rawType !== "repeater" &&
                    rawType !== "table" &&
                    rawType !== "repeater_table" &&
                    (labelLower === "serial number" ||
                     labelLower === "serial numbers" ||
                     labelLower === "serial number(s)" ||
                     labelLower === "frequency range" ||
                     labelLower === "power output" ||
                     labelLower === "power" ||
                     labelLower === "make" ||
                     labelLower === "type" ||
                     labelLower === "model" ||
                     labelLower === "type/model" ||
                     labelLower === "make / type / model" ||
                     labelLower === "device / equipment type" ||
                     labelLower === "device type" ||
                     fIdLower === "fd000000-0000-0000-0000-000000000084" ||
                     fIdLower === "fd000000-0000-0000-0000-000000000085" ||
                     fIdLower === "fd000000-0000-0000-0000-000000000087")
                  ) {
                    return null;
                  }

                  // Remove SEC / DTI Registration Number from the form EXCEPT for CPE Supplier Accreditation
                  const isDtiSecField =
                    targetId === "fd000000-0000-0000-0000-000000000086" ||
                    fIdLower === "dtisecregistration" ||
                    fIdLower === "dti_sec_registration" ||
                    fIdLower.includes("dtisec") ||
                    labelLower === "sec / dti registration number" ||
                    labelLower === "sec/dti registration number" ||
                    labelLower === "sec / dti registration no." ||
                    labelLower === "sec/dti registration no." ||
                    labelLower.includes("sec / dti") ||
                    labelLower.includes("sec/dti") ||
                    labelLower.includes("dti / sec") ||
                    labelLower.includes("dti/sec");

                  if (isDtiSecField && !isCpeAccreditation) {
                    return null;
                  }

                  // Skip Number of Years if not applicable for this service or handled by Section 1
                  const isNoOfYearsField =
                    targetId === FIELD_ID_NO_OF_YEARS ||
                    fIdLower === "noofyears" ||
                    fIdLower === "numberofyears" ||
                    labelLower === "number of years" ||
                    labelLower === "no of years" ||
                    labelLower === "years" ||
                    labelLower.includes("number of years") ||
                    labelLower.includes("no of years");

                  if (isNoOfYearsField && (!showNumberOfYears || showApplicationTypeSection)) {
                    return null;
                  }

                  const selectedVarObj = variants?.find((v) => String(v.id) === String(selectedVariantId));
                  const isIndividualVar = selectedVarObj?.isIndividual !== undefined ? selectedVarObj.isIndividual : !isCompanyCertService;
                  const isNonIndividualEntity = !isIndividualVar;

                  // For company certificate services, only skip representative fields (captured in Step 2), but keep company & branch details
                  const isRepresentativeField =
                    targetId === "fd000000-0000-0000-0000-000000000082" ||
                    targetId === "fd000000-0000-0000-0000-000000000083" ||
                    fIdLower === "representativename" ||
                    fIdLower === "representativeposition" ||
                    labelLower === "authorized representative name" ||
                    labelLower === "representative name" ||
                    labelLower === "representative position";

                  if (isRepresentativeField) {
                    return null;
                  }

                  // If individual service is filed in BULK mode (company-sponsored individuals), skip corporate fields on individual forms in Step 3 (already captured in Step 2).
                  // For non-individual services (isIndividual === false), corporate/entity fields remain on the form so applicant entity particulars can be provided.
                  if (isIndividualVar && appMode === "BULK") {
                    const isLegacyCompanyField =
                      targetId === "fd000000-0000-0000-0000-000000000081" ||
                      fIdLower === "companyname" ||
                      labelLower === "company / business name" ||
                      labelLower === "company / corporation name" ||
                      labelLower === "company name" ||
                      labelLower === "sec / dti registration number";

                    if (isLegacyCompanyField) {
                      return null;
                    }
                  }

                const isEmploymentStatusField =
                  fIdLower === "employmentstatus" ||
                  fIdLower === "employment_status" ||
                  labelLower === "employment status" ||
                  (labelLower === "status" && (section.title.toLowerCase().includes("employment") || section.key?.toLowerCase().includes("employment") || section.title.toLowerCase().includes("personal") || section.key?.toLowerCase().includes("personal") || section.title.toLowerCase().includes("applicant") || section.key?.toLowerCase().includes("applicant"))) ||
                  targetId === FIELD_ID_EMPLOYMENT_STATUS;

                const isEmploymentTypeField =
                  fIdLower === "employmenttype" ||
                  fIdLower === "employment_type" ||
                  labelLower === "employment type" ||
                  (labelLower === "type" && (section.title.toLowerCase().includes("employment") || section.key?.toLowerCase().includes("employment") || section.title.toLowerCase().includes("personal") || section.key?.toLowerCase().includes("personal") || section.title.toLowerCase().includes("applicant") || section.key?.toLowerCase().includes("applicant"))) ||
                  targetId === FIELD_ID_EMPLOYMENT_TYPE;

                const isEquipmentOrTechnicalSection =
                  section.title.toLowerCase().includes("equipment") ||
                  section.title.toLowerCase().includes("antenna") ||
                  section.title.toLowerCase().includes("signal") ||
                  section.key?.toLowerCase().includes("equipment") ||
                  section.key?.toLowerCase().includes("antenna") ||
                  section.key?.toLowerCase().includes("signal");

                const isTargetServiceField =
                  targetId === FIELD_ID_TARGET_SERVICE ||
                  fIdLower === "targetservice" ||
                  (isCopyOfCert && (labelLower === "service" || labelLower === "target service" || labelLower.includes("service (dropdown)")));

                const isTargetCertTypeField =
                  targetId === FIELD_ID_TARGET_CERT_TYPE ||
                  fIdLower === "targetcertificatetype" ||
                  fIdLower === "targettype" ||
                  (isCopyOfCert && (labelLower === "type" || labelLower === "certificate type" || labelLower.includes("type: based from")));

                const isTargetCertNumberField =
                  targetId === FIELD_ID_TARGET_CERT_NUMBER ||
                  fIdLower === "targetcertificatenumber" ||
                  fIdLower === "certificatenumber" ||
                  fIdLower === "certificateno" ||
                  (isCopyOfCert && (labelLower === "certificate number." || labelLower === "certificate number" || labelLower.includes("certificate no")));

                const isNoOfCopiesField =
                  targetId === FIELD_ID_NO_OF_COPIES ||
                  fIdLower === "noofcopies" ||
                  fIdLower === "numberofcopies" ||
                  labelLower.includes("no. of copies") ||
                  labelLower.includes("number of copies") ||
                  labelLower === "copies";

                if (isDuplicateCopy && isNoOfCopiesField) {
                  return null;
                }

                const isApplicationTypeField =
                  !isTargetCertTypeField &&
                  !isTargetServiceField &&
                  !isEmploymentStatusField &&
                  !isEmploymentTypeField &&
                  !isEquipmentOrTechnicalSection &&
                  (labelLower.includes("type of application") ||
                  labelLower.includes("application type") ||
                  labelLower.includes("permit type") ||
                  labelLower.includes("license type") ||
                  labelLower.includes("certificate type") ||
                  labelLower.includes("type of certificate") ||
                  labelLower === "application" ||
                  (labelLower === "type" && !isCopyOfCert && !section.title.toLowerCase().includes("employment") && !section.key?.toLowerCase().includes("employment")) ||
                  fIdLower === "type_of_application" ||
                  fIdLower === "permittype" ||
                  fIdLower === "applicationtype" ||
                  fIdLower === "typeofcertificate");

                // Skip repetitive application/permit/certificate type fields in the form body
                if (isApplicationTypeField) {
                  return null;
                }

                const isBioPersonalField =
                  targetId === FIELD_ID_BIRTH_DATE ||
                  fIdLower === "birthdate" ||
                  fIdLower === "dateofbirth" ||
                  labelLower === "date of birth" ||
                  labelLower === "birth date" ||
                  labelLower === "dob" ||
                  labelLower === "sex" ||
                  labelLower === "gender" ||
                  labelLower === "sex / gender" ||
                  labelLower === "civil status" ||
                  labelLower === "marital status" ||
                  labelLower === "nationality" ||
                  labelLower === "citizenship" ||
                  labelLower === "nationality / citizenship" ||
                  labelLower === "height" ||
                  labelLower === "height (cm)" ||
                  labelLower === "weight" ||
                  labelLower === "weight (kg)";

                const isVanityOrSpecialEvent = isVanityNew || isVanityRen || isSpecialEvent;
                const isVanityBioField =
                  targetId === FIELD_ID_BIRTH_DATE ||
                  fIdLower === "birthdate" ||
                  fIdLower === "dateofbirth" ||
                  labelLower === "date of birth" ||
                  labelLower === "birth date" ||
                  labelLower === "dob" ||
                  labelLower === "sex" ||
                  labelLower === "gender" ||
                  labelLower === "nationality" ||
                  labelLower === "citizenship";

                if (isNonIndividualEntity && isBioPersonalField && !(isVanityOrSpecialEvent && isVanityBioField)) {
                  return null;
                }

                if (isAmateurPermitService && !isVanityOrSpecialEvent && isBioPersonalField) {
                  return null;
                }

                const isSupervisingEngineerField =
                  fIdLower === "supervisingengineer" ||
                  fIdLower === "fd000000-0000-0000-0000-000000000252" ||
                  labelLower === "supervising engineer" ||
                  labelLower.includes("supervising engineer");

                const isCertificateEctNoField =
                  fIdLower === "supervisingengineercertno" ||
                  fIdLower === "certificateectno" ||
                  fIdLower === "fd000000-0000-0000-0000-000000000250" ||
                  labelLower === "certificate/ect no." ||
                  labelLower === "certificate / ect no." ||
                  (labelLower.includes("certificate/ect") && !labelLower.includes("expiry"));

                const isCertificateEctExpiryDateField =
                  fIdLower === "supervisingengineerexpirydate" ||
                  fIdLower === "certificateectexpirydate" ||
                  fIdLower === "fd000000-0000-0000-0000-000000000255" ||
                  labelLower.includes("certificate/ect no. date of expiry") ||
                  labelLower.includes("certificate/ect date of expiry");

                const isTechnicianNameField =
                  fIdLower === "technicianname" ||
                  fIdLower === "fd000000-0000-0000-0000-000000000253" ||
                  labelLower === "technician name" ||
                  labelLower.includes("technician name");

                const isTechnicianCertNoField =
                  fIdLower === "techniciancertno" ||
                  fIdLower === "fd000000-0000-0000-0000-000000000254" ||
                  labelLower === "certificate/number" ||
                  labelLower === "certificate / number" ||
                  (labelLower.includes("certificate/number") && !labelLower.includes("expiry"));

                const isTechnicianExpiryDateField =
                  fIdLower === "technicianexpirydate" ||
                  fIdLower === "fd000000-0000-0000-0000-000000000251" ||
                  labelLower.includes("certificate/number date of expiry") ||
                  labelLower === "date of expiry" ||
                  labelLower.includes("date of expiry");

                const isTechnicalPersonnelSection =
                  section.title.toLowerCase().includes("technical personnel") ||
                  section.title.toLowerCase().includes("personnel") ||
                  section.key?.toLowerCase().includes("personnel");

                const isNameField =
                  !isSupervisingEngineerField &&
                  !isTechnicianNameField &&
                  !isRepresentativeField &&
                  !isTechnicalPersonnelSection &&
                  !isApplicationTypeField &&
                  !isEmploymentStatusField &&
                  !isEmploymentTypeField &&
                  (labelLower.includes("full name") ||
                   labelLower.includes("full legal name") ||
                   labelLower.includes("applicant name") ||
                   labelLower.includes("name of applicant") ||
                   labelLower === "name" ||
                   fIdLower === "fullname" ||
                   fIdLower === "applicant_name" ||
                   targetId === FIELD_ID_FULL_NAME);

                const sectionKeyLower = (section.key || section.id || "").toLowerCase();
                const fieldIdLower = (field.fieldId || field.id || "").toLowerCase();

                const isCallSignField =
                  targetId === FIELD_ID_CALL_SIGN ||
                  fIdLower === "callsign" ||
                  fIdLower === "call_sign" ||
                  labelLower === "call sign" ||
                  labelLower.includes("call sign");

                const isApplicantSection =
                  sectionKeyLower.includes("applicant") ||
                  section.title.toLowerCase().includes("applicant");

                // Remove Call Sign from Applicant Details in Amateur Permits
                if (isAmateurPermitService && isApplicantSection && isCallSignField) {
                  return null;
                }

                const isParticularsSection =
                  sectionKeyLower.includes("particulars") ||
                  section.title.toLowerCase().includes("particulars");

                // In Amateur Permits, Call Sign and Frequency belong strictly to Section 3 (Station/Equipment), never duplicate in Section 4 (Particulars)
                if (isAmateurPermitService && isParticularsSection && (isCallSignField || labelLower === "frequency" || targetId === FIELD_ID_FREQUENCY || fIdLower === "frequency" || labelLower.includes("antenna") || fIdLower.includes("antenna") || fIdLower.includes("noofunits"))) {
                  return null;
                }

                const isIntendedUseField =
                  fieldIdLower === "intendeduse" ||
                  fieldIdLower === "intendedusetype" ||
                  fieldIdLower === "intended_use_type" ||
                  fieldIdLower === FIELD_ID_INTENDED_USE.toLowerCase() ||
                  labelLower.includes("intended use of equipment") ||
                  labelLower.includes("intended use");

                const isVasServicesField =
                  fieldIdLower === "valueaddedservices" ||
                  fieldIdLower === "value_added_services" ||
                  fieldIdLower === "fd000000-0000-0000-0000-000000000036" ||
                  labelLower.includes("value added service") ||
                  labelLower.includes("list of value added");

                const isVasRegField =
                  fieldIdLower.includes("vasregistration") ||
                  fieldIdLower.includes("vas_reg") ||
                  fieldIdLower === FIELD_ID_VAS_REG_NO.toLowerCase() ||
                  labelLower.includes("vas registration");

                const isBsdField =
                  fieldIdLower.includes("bsd") ||
                  labelLower.includes("bsd no") ||
                  labelLower.includes("bsd number");

                const isEntityTypeField =
                  fieldIdLower === "entitytype" ||
                  fieldIdLower === "entity_type" ||
                  fieldIdLower === FIELD_ID_ENTITY_TYPE.toLowerCase() ||
                  labelLower.includes("type of entity") ||
                  labelLower.includes("entity type");

                const isKnownByAnotherNameField =
                  fieldIdLower === "knownbyanothername" ||
                  fieldIdLower === "known_by_other_name" ||
                  fieldIdLower === FIELD_ID_KNOWN_OTHER_NAME.toLowerCase() ||
                  labelLower.includes("known by other name") ||
                  labelLower.includes("known by another name");

                const isOtherTradeNameField =
                  fieldIdLower === "othertradename" ||
                  fieldIdLower === "other_trade_name" ||
                  fieldIdLower === FIELD_ID_OTHER_TRADE_NAME.toLowerCase() ||
                  labelLower.includes("please specify");

                const isServiceClassificationField =
                  fieldIdLower === "serviceclassification" ||
                  fieldIdLower === "service_classification" ||
                  fieldIdLower === FIELD_ID_SVC_CLASSIFICATION.toLowerCase() ||
                  (isVas && (labelLower === "service" || labelLower.includes("service classification")));

                // Service field removed from VAS Registration Particulars
                if (isServiceClassificationField) {
                  return null;
                }

                const isSignature =
                  rawType === "signature" ||
                  labelLower.includes("signature");

                const isCheckbox =
                  (rawType === "checkbox" ||
                   labelLower.includes("declare") ||
                   labelLower.includes("certify") ||
                   labelLower.includes("agreement") ||
                   labelLower.includes("declaration")) &&
                  !isVasServicesField;

                const isElementsField =
                  labelLower.includes("element") ||
                  labelLower.includes("class of station") ||
                  targetId === FIELD_ID_ELEMENTS;

                // Skip element field in the form body if already rendered in top Section 1
                if (showApplicationTypeSection && variantElements.length > 0 && isElementsField) {
                  return null;
                }

                // Invoice fields appear for Non-Dealers only
                const isInvoiceField =
                  labelLower.includes("invoice") ||
                  targetId === FIELD_ID_INVOICE_NUMBER ||
                  fIdLower === "invoicenumber" ||
                  fIdLower === "invoiceno";

                if (isInvoiceField) {
                  const matchedVar = variants.find((v) => String(v.id) === String(selectedVariantId));
                  const varDesc = (matchedVar?.description || matchedVar?.name || "").toLowerCase();
                  const isNonDealerVariant = varDesc.includes("non-dealer") || varDesc.includes("non dealer") || String(selectedVariantId).endsWith("23");
                  const registrationTypeVal = (values?.["registrationType"] || values?.["Registration Type"] || values?.["registration_type"] || "").toLowerCase();
                  const isNonDealerRegType = registrationTypeVal.includes("non");
                  const isDealer = varDesc.includes("dealer") && !isNonDealerVariant;

                  if (isDealer || (!isNonDealerVariant && !isNonDealerRegType)) {
                    return null;
                  }
                }

                const isRegionField =
                  labelLower === "region" ||
                  targetId === FIELD_ID_REGION;

                const isProvinceField =
                  labelLower === "province" ||
                  targetId === FIELD_ID_PROVINCE;

                const isCityField =
                  labelLower === "city" ||
                  labelLower.includes("city / municipality") ||
                  labelLower.includes("municipality") ||
                  targetId === FIELD_ID_CITY;

                const isBarangayField =
                  labelLower === "barangay" ||
                  targetId === FIELD_ID_BARANGAY;

                const elementOptions: Array<{ label: string; value: string }> =
                  variantElements && variantElements.length > 0
                    ? variantElements.map((e) => {
                        const title = e.code ? `${e.code} — ${e.description}` : String(e.description || e.id);
                        return { label: title, value: title };
                      })
                    : [];

                const variantOptions: Array<{ label: string; value: string }> =
                  variants && variants.length > 0
                    ? variants.map((v) => {
                        const vType = v.type && v.type !== "NA" && v.type !== "N/A" ? v.type : "";
                        const vDesc = v.description || v.name || v.id;
                        const displayLabel = vType ? `${vType.toUpperCase()} — ${vDesc}` : `${vDesc}`;
                        return {
                          label: displayLabel,
                          value: vDesc || vType || v.id,
                        };
                      })
                    : [
                        { label: "NEW — First-time application / issuance", value: "New" },
                        { label: "RENEWAL — Renewal of existing permit, license, or certificate", value: "Renewal" },
                        { label: "MODIFICATION — Amendment or change of registered particulars", value: "Modification" },
                      ];

                const isBandwidthUnitField =
                  fIdLower === "bandwidthunit" ||
                  fIdLower === "unit" ||
                  targetId === FIELD_ID_BANDWIDTH_UNIT ||
                  labelLower === "unit" ||
                  labelLower === "bandwidth unit";

                const isStationClassField =
                  fIdLower === "stationclass" ||
                  fIdLower === "classofstation" ||
                  targetId === FIELD_ID_STATION_CLASS ||
                  targetId === FIELD_ID_CLASS_OF_STATION ||
                  labelLower === "station class" ||
                  labelLower === "class of station";

                const isDropdown =
                  rawType === "dropdown" ||
                  rawType === "select" ||
                  (rawType === "radio" && isApplicationTypeField) ||
                  isApplicationTypeField ||
                  isNoOfYearsField ||
                  isRegionField ||
                  isProvinceField ||
                  isCityField ||
                  isBarangayField ||
                  isEmploymentStatusField ||
                  isEmploymentTypeField ||
                  isEntityTypeField ||
                  isKnownByAnotherNameField ||
                  isTargetServiceField ||
                  isTargetCertTypeField ||
                  isNoOfCopiesField ||
                  isBandwidthUnitField ||
                  (isStationClassField && isAmateurPermitService) ||
                  (isElementsField && elementOptions.length > 0);

                let val = rawVal;
                if (isApplicationTypeField && (!val || val === "") && variantOptions.length > 0) {
                  val = variantOptions[0].value;
                }
                if (isNoOfYearsField && (!val || val === "")) {
                  val = noOfYears || "1";
                }
                if (isKnownByAnotherNameField && (!val || val === "")) {
                  val = "No";
                }
                if (isTargetServiceField && (!val || val === "")) {
                  val = CERTIFICATE_SERVICES_OPTIONS[0]?.value || "";
                }
                if (isNoOfCopiesField && (!val || val === "")) {
                  val = "1";
                }
                if (isVasRegField) {
                  val = "TO BE ASSIGNED BY NTC";
                }
                if (isBsdField) {
                  val = "TO BE ASSIGNED BY NTC";
                }
                if ((labelLower === "frequency" || targetId === FIELD_ID_FREQUENCY) && isAmateurPermitService && (!val || val === "")) {
                  val = "Within Authorized Amateur Band";
                }
                if (!val && values) {
                  if (isRegionField) {
                    val = values["region"] || values["Region"] || "";
                  } else if (isProvinceField) {
                    val = values["province"] || values["Province"] || "";
                  } else if (isCityField) {
                    val = values["city"] || values["City"] || values["municipality"] || values["City / Municipality"] || "";
                  } else if (isBarangayField) {
                    val = values["barangay"] || values["Barangay"] || "";
                  }
                }

                let dropdownOptions: Array<{ label: string; value: string }> = [];
                let placeholder = field.placeholder || "Select an option...";

                if (isApplicationTypeField) {
                  dropdownOptions = variantOptions;
                  placeholder = "Select Application Type...";
                } else if (isNoOfYearsField) {
                  dropdownOptions = [
                    { label: "1 Year", value: "1" },
                    { label: "2 Years", value: "2" },
                    { label: "3 Years", value: "3" },
                  ];
                  placeholder = "Select duration...";
                } else if (isBandwidthUnitField) {
                  dropdownOptions = [
                    { label: "KHz", value: "KHz" },
                    { label: "MHz", value: "MHz" },
                    { label: "GHz", value: "GHz" },
                  ];
                  placeholder = "Select Unit...";
                } else if (isStationClassField && isAmateurPermitService) {
                  dropdownOptions = [
                    { label: "RT", value: "RT" },
                    { label: "FX", value: "FX" },
                    { label: "FB", value: "FB" },
                    { label: "FX/FB", value: "FX/FB" },
                    { label: "ML", value: "ML" },
                    { label: "P", value: "P" },
                    { label: "Others", value: "Others" },
                  ];
                  placeholder = "Select Station Class...";
                } else if (isTargetServiceField) {
                  dropdownOptions = dynamicCertServiceOptions;
                  placeholder = "Select Certificate Service...";
                } else if (isTargetCertTypeField) {
                  const currentServiceVal =
                    values?.[FIELD_ID_TARGET_SERVICE] ||
                    values?.["targetService"] ||
                    values?.["service"] ||
                    values?.["Service"] ||
                    dynamicCertServiceOptions[0]?.value ||
                    "";
                  dropdownOptions = getTypesForService(currentServiceVal);
                  placeholder = !currentServiceVal ? "Select Service first..." : "Select Certificate Type...";
                } else if (isNoOfCopiesField) {
                  dropdownOptions = [
                    { label: "1 Copy", value: "1" },
                    { label: "2 Copies", value: "2" },
                    { label: "3 Copies", value: "3" },
                    { label: "4 Copies", value: "4" },
                    { label: "5 Copies", value: "5" },
                    { label: "10 Copies", value: "10" },
                  ];
                  placeholder = "Select No. of Copies...";
                } else if (isRegionField) {
                  dropdownOptions = regions.map((r) => ({ label: r.name, value: r.name }));
                  placeholder = loadingRegions ? "Loading regions..." : "Select Region...";
                } else if (isProvinceField) {
                  dropdownOptions = provinces.map((p) => ({ label: p.name, value: p.name }));
                  placeholder = !selectedRegionId ? "Select Region first..." : loadingProvinces ? "Loading provinces..." : "Select Province...";
                } else if (isCityField) {
                  dropdownOptions = municipalities.map((m) => ({ label: m.name, value: m.name }));
                  placeholder = !selectedProvinceId ? "Select Province first..." : loadingMunicipalities ? "Loading cities/municipalities..." : "Select City / Municipality...";
                } else if (isBarangayField) {
                  dropdownOptions = barangays.map((b) => ({ label: b.name, value: b.name }));
                  placeholder = !selectedMunicipalityId ? "Select City/Municipality first..." : loadingBarangays ? "Loading barangays..." : "Select Barangay...";
                } else if (isEmploymentStatusField) {
                  dropdownOptions = [
                    { label: "Employed", value: "Employed" },
                    { label: "Unemployed", value: "Unemployed" },
                  ];
                  placeholder = "Select Employment Status...";
                } else if (isEmploymentTypeField) {
                  dropdownOptions = [
                    { label: "Local", value: "Local" },
                    { label: "Foreign", value: "Foreign" },
                  ];
                  placeholder = "Select Type...";
                } else if (isEntityTypeField) {
                  dropdownOptions = [
                    { label: "Corporation", value: "Corporation" },
                    { label: "Single Proprietorship", value: "Single Proprietorship" },
                    { label: "Partnership", value: "Partnership" },
                    { label: "Others", value: "Others" },
                  ];
                  placeholder = "Select Type of Entity...";
                } else if (isKnownByAnotherNameField) {
                  dropdownOptions = [
                    { label: "Yes", value: "Yes" },
                    { label: "No", value: "No" },
                  ];
                  placeholder = "Select Yes or No...";
                } else if (isElementsField && elementOptions.length > 0) {
                  dropdownOptions = elementOptions;
                  placeholder = "Select Element / Station Class...";
                } else {
                  dropdownOptions = parseOptions(field);
                }

                const handleDropdownChange = (v: string) => {
                  onChange(targetId, field.label, v);
                  if (isTargetServiceField) {
                    const newTypes = getTypesForService(v);
                    const defaultType = newTypes[0]?.value || "";
                    onChange(FIELD_ID_TARGET_CERT_TYPE, "Type", defaultType);
                    onChange("targetCertificateType", "Type", defaultType);
                  }
                  if (isRegionField) {
                    const matched = regions.find((r) => r.name.toLowerCase() === v.toLowerCase());
                    setSelectedRegionId(matched?.id);
                  } else if (isProvinceField) {
                    const matched = provinces.find((p) => p.name.toLowerCase() === v.toLowerCase());
                    setSelectedProvinceId(matched?.id);
                  } else if (isCityField) {
                    const matched = municipalities.find((m) => m.name.toLowerCase() === v.toLowerCase());
                    setSelectedMunicipalityId(matched?.id);
                  }
                };

                const isDate =
                  rawType === "date" ||
                  targetId === FIELD_ID_BIRTH_DATE ||
                  targetId === FIELD_ID_CPCN_EXPIRY ||
                  targetId === FIELD_ID_COR_VAS_EXPIRY ||
                  labelLower === "date of birth" ||
                  labelLower === "birth date" ||
                  labelLower === "date of expiry" ||
                  labelLower === "expiry date" ||
                  labelLower === "dob" ||
                  (rawType !== "text" && rawType !== "textarea" && rawType !== "tel" && labelLower.includes("date") && !labelLower.includes("candidate") && !labelLower.includes("update") && !labelLower.includes("data"));
                const isNumber =
                  rawType === "number" ||
                  rawType === "numeric" ||
                  rawType === "integer" ||
                  rawType === "decimal" ||
                  labelLower.includes("quantity") ||
                  labelLower.includes("gross tonnage") ||
                  labelLower.includes("net tonnage") ||
                  labelLower.includes("output power") ||
                  labelLower.includes("power (watts)") ||
                  labelLower.includes("frequency (mhz)") ||
                  labelLower.includes("zip code") ||
                  labelLower.includes("postal code") ||
                  labelLower === "age" ||
                  labelLower === "qty" ||
                  labelLower === "quantity" ||
                  labelLower === "watts" ||
                  labelLower === "power";
                const isFile = rawType === "file";

                if (isOtherTradeNameField) {
                  const isKnownByOtherNameVal =
                    (values?.["knownByAnotherName"] ||
                     values?.["known_by_other_name"] ||
                     values?.["Known by other Name"] ||
                     values?.[FIELD_ID_KNOWN_OTHER_NAME] ||
                     "").toLowerCase() === "yes";

                  if (!isKnownByOtherNameVal) {
                    return null;
                  }
                }

                const isRepeaterField =
                  rawType === "repeater" ||
                  rawType === "table" ||
                  rawType === "repeater_table" ||
                  rawType === "array" ||
                  targetId === FIELD_ID_EQUIPMENT ||
                  targetId === FIELD_ID_ANTENNA ||
                  targetId === FIELD_ID_DEVICES ||
                  targetId === FIELD_ID_TVRO ||
                  targetId === FIELD_ID_PROPOSED_EQUIPMENT ||
                  fieldIdLower === FIELD_ID_DEVICES.toLowerCase() ||
                  fieldIdLower === FIELD_ID_EQUIPMENT.toLowerCase() ||
                  fieldIdLower === FIELD_ID_ANTENNA.toLowerCase() ||
                  fieldIdLower === FIELD_ID_RADIO_OFFICERS.toLowerCase() ||
                  fieldIdLower === FIELD_ID_TVRO.toLowerCase() ||
                  fieldIdLower === FIELD_ID_PROPOSED_EQUIPMENT.toLowerCase() ||
                  fieldIdLower.includes("equipmentdetails") ||
                  fieldIdLower.includes("antennadetails") ||
                  fieldIdLower.includes("radioofficers") ||
                  fieldIdLower.includes("devicesdetails") ||
                  fieldIdLower.includes("signaldetails") ||
                  fieldIdLower.includes("signalreception") ||
                  fieldIdLower.includes("tvro") ||
                  fieldIdLower.includes("proposedequipments") ||
                  sectionKeyLower.includes("equipment") ||
                  sectionKeyLower.includes("antenna") ||
                  sectionKeyLower.includes("device") ||
                  sectionKeyLower.includes("signal") ||
                  labelLower.includes("particulars of equipment") ||
                  labelLower.includes("registered devices details") ||
                  labelLower.includes("equipment technical details") ||
                  labelLower.includes("antenna technical details") ||
                  labelLower.includes("particulars of antenna system") ||
                  labelLower.includes("particulars of signal to be received") ||
                  labelLower.includes("radio officers details");

                const isContactField =
                  fieldIdLower === "fd000000-0000-0000-0000-000000000004" ||
                  labelLower.includes("contact") ||
                  labelLower.includes("mobile") ||
                  labelLower.includes("phone") ||
                  rawType === "tel" ||
                  rawType === "phone";

                const isEmailField =
                  fieldIdLower === "fd000000-0000-0000-0000-000000000005" ||
                  labelLower.includes("email") ||
                  rawType === "email";

                const isExamSeminarField =
                  sectionKeyLower.includes("exam") ||
                  sectionKeyLower.includes("seminar") ||
                  labelLower.includes("exam") ||
                  labelLower.includes("seminar") ||
                  labelLower.includes("rating");

                let displayFieldLabel = field.label;
                if (isTargetServiceField) {
                  displayFieldLabel = "Service";
                } else if (isTargetCertTypeField) {
                  displayFieldLabel = "Type";
                } else if (isTargetCertNumberField) {
                  displayFieldLabel = "Certificate Number";
                } else if (isNoOfCopiesField) {
                  displayFieldLabel = "No. of Copies";
                } else if (isEmploymentStatusField) {
                  displayFieldLabel = "Employment Status";
                } else if (isEmploymentTypeField) {
                  displayFieldLabel = "Type";
                } else if (isVas) {
                  if (
                    fieldIdLower === FIELD_ID_CPCN_NO.toLowerCase() ||
                    fieldIdLower === "cpcnpacano" ||
                    (labelLower.includes("cpcn") && !labelLower.includes("date") && !labelLower.includes("expiry"))
                  ) {
                    displayFieldLabel = "CPCN / PA / CA No.";
                  } else if (
                    fieldIdLower === FIELD_ID_CPCN_EXPIRY.toLowerCase() ||
                    fieldIdLower === "cpcndateofexpiry" ||
                    labelLower.includes("cpcn / pa / ca date") ||
                    labelLower.includes("cpcn date of expiry") ||
                    labelLower.includes("cpcn / pa / ca no. date of expiry")
                  ) {
                    displayFieldLabel = "CPCN / PA / CA No. Date of Expiry";
                  } else if (
                    fieldIdLower === FIELD_ID_COR_VAS_NO.toLowerCase() ||
                    fieldIdLower === "corvasno" ||
                    (labelLower.includes("cor / vas") && !labelLower.includes("date") && !labelLower.includes("expiry")) ||
                    (labelLower.includes("cor/vas") && !labelLower.includes("date") && !labelLower.includes("expiry"))
                  ) {
                    displayFieldLabel = "COR / VAS No.";
                  } else if (
                    fieldIdLower === FIELD_ID_COR_VAS_EXPIRY.toLowerCase() ||
                    fieldIdLower === "corvasexpirydate" ||
                    fieldIdLower === "corvasnoexpirydate" ||
                    fieldIdLower === FIELD_ID_DATE_OF_EXPIRY.toLowerCase() ||
                    fieldIdLower === "dateofexpiry" ||
                    labelLower.includes("cor / vas no. expiry date") ||
                    labelLower.includes("cor / vas no. date of expiry") ||
                    labelLower.includes("cor / vas date of expiry") ||
                    labelLower.includes("cor/vas expiry date") ||
                    labelLower.includes("expiry") ||
                    labelLower.includes("date of expiry")
                  ) {
                    displayFieldLabel = "COR / VAS No. Date of Expiry";
                  }
                }

                const isVasRequiredField =
                  isVas &&
                  (isEntityTypeField ||
                   targetId === FIELD_ID_CPCN_NO ||
                   targetId === "cpcnPaCaNo" ||
                   labelLower.includes("cpcn / pa / ca no") ||
                   labelLower.includes("cpcn") ||
                   targetId === FIELD_ID_CPCN_EXPIRY ||
                   targetId === "cpcnDateOfExpiry" ||
                   labelLower.includes("cpcn / pa / ca date") ||
                   labelLower.includes("cpcn / pa / ca no. date of expiry") ||
                   labelLower.includes("cpcn date of expiry") ||
                   targetId === FIELD_ID_COR_VAS_NO ||
                   targetId === "corVasNo" ||
                   labelLower.includes("cor / vas no") ||
                   labelLower.includes("cor/vas no") ||
                   targetId === FIELD_ID_COR_VAS_EXPIRY ||
                   targetId === "corVasExpiryDate" ||
                   targetId === FIELD_ID_DATE_OF_EXPIRY ||
                   targetId === "dateOfExpiry" ||
                   labelLower.includes("cor / vas no. expiry date") ||
                   labelLower.includes("cor / vas no. date of expiry") ||
                   labelLower.includes("cor / vas date of expiry") ||
                   labelLower.includes("cor/vas expiry date") ||
                   labelLower.includes("expiry"));

                const isCopyRequiredField =
                  isCopyOfCert &&
                  (isTargetServiceField ||
                   isTargetCertTypeField ||
                   isTargetCertNumberField ||
                   (isNoOfCopiesField && isCertifiedTrueCopy));

                const isFieldRequired = isVas
                  ? (isVasRequiredField || (field.isRequired ?? false))
                  : isCopyOfCert
                  ? (isCopyRequiredField || (field.isRequired ?? false))
                  : isEmploymentTypeField
                  ? false
                  : isEmploymentStatusField || isEntityTypeField
                  ? true
                  : (isAmateurCert && isExamSeminarField ? false : (field.isRequired ?? false));

                const isBandwidthField =
                  fieldIdLower === "bandwidth" ||
                  targetId === FIELD_ID_BANDWIDTH ||
                  labelLower === "bandwidth";

                const isEmissionField =
                  fieldIdLower === "emission" ||
                  targetId === FIELD_ID_EMISSION ||
                  labelLower === "emission";

                const isPowerOutputField =
                  fieldIdLower === "poweroutput" ||
                  targetId === FIELD_ID_POWER_OUTPUT ||
                  labelLower.includes("power output");

                const isHoursOpField =
                  fieldIdLower === "hoursofoperation" ||
                  targetId === FIELD_ID_HOURS_OP ||
                  labelLower.includes("hours of operation");

                const isExactLocationField =
                  fieldIdLower === "exactlocation" ||
                  labelLower === "exact location";

                const isConfigurationField =
                  fieldIdLower === "configuration" ||
                  targetId === FIELD_ID_CONFIGURATION ||
                  labelLower === "configuration";

                const isDataRateField =
                  fieldIdLower === "datarate" ||
                  targetId === FIELD_ID_DATA_RATE ||
                  labelLower === "data rate";

                const isRemarksField =
                  fieldIdLower === "remarks" ||
                  targetId === FIELD_ID_REMARKS ||
                  labelLower === "remarks";

                const isFullWidthField =
                  isNameField ||
                  isSignature ||
                  isCheckbox ||
                  isFile ||
                  isRepeaterField ||
                  isBsdField ||
                  isVasRegField ||
                  isVasServicesField ||
                  isIntendedUseField ||
                  isSupervisingEngineerField ||
                  isTechnicianNameField ||
                  (isEntityTypeField && !isCpeAccreditation);

                let span: 12 | 8 | 6 | 4 | 3 = isFullWidthField ? 12 : 6;
                if (isBandwidthField || isBandwidthUnitField) {
                  span = 3;
                } else if (isEmissionField || isPowerOutputField || isHoursOpField || isConfigurationField || isDataRateField || isRemarksField) {
                  span = 4;
                } else if (isExactLocationField) {
                  span = 8;
                } else if (isStationClassField && isAmateurPermitService && (isStorageOrSell || isForeignVisitor)) {
                  span = 4;
                }

                return (
                  <FormCol key={targetId} span={span} compact={field.isCompact}>
                    {isNameField ? (
                      <ApplicantNameField
                        key={targetId}
                        label={isNonIndividualEntity ? "Applicant / Company Name" : isAmateurPermitService ? "Applicant Name" : displayFieldLabel}
                        isRequired={isFieldRequired}
                        value={val}
                        structuredValue={
                          isIndividualVar
                            ? (structuredNameData ? { ...structuredNameData, applicantType: "individual" } : undefined)
                            : (structuredNameData ? { ...structuredNameData, applicantType: "company" } : undefined)
                        }
                        allowCompany={isNonIndividualEntity || isAmateurPermitService}
                        unifiedInput={isNonIndividualEntity || isAmateurPermitService}
                        onChange={(combinedName) => onChange(targetId, displayFieldLabel, combinedName)}
                        onStructuredChange={onStructuredNameChange}
                        error={err}
                      />
                    ) : isRepeaterField ? (
                      <FormRepeaterTable
                        label={displayFieldLabel}
                        isRequired={isFieldRequired}
                        value={val}
                        fieldKey={targetId}
                        onChange={(repeaterJson) => onChange(targetId, displayFieldLabel, repeaterJson)}
                        error={err}
                      />
                    ) : isBsdField ? (
                      <View
                        style={{
                          backgroundColor: "#F8FAFC",
                          borderWidth: 1,
                          borderColor: "#CBD5E1",
                          borderRadius: 10,
                          padding: 14,
                          gap: 6,
                        }}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#334155" }}>
                            {displayFieldLabel}
                          </Text>
                          <View
                            style={{
                              backgroundColor: "#EFF6FF",
                              borderWidth: 1,
                              borderColor: "#BFDBFE",
                              borderRadius: 6,
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                            }}
                          >
                            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10.5, fontWeight: "700", color: "#1D4ED8" }}>
                              OFFICIAL NTC ASSIGNMENT
                            </Text>
                          </View>
                        </View>
                        <ValidatedInput
                          value="TO BE ASSIGNED BY NTC"
                          editable={false}
                          onChangeText={() => {}}
                        />
                        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: "#64748B", fontStyle: "italic" }}>
                          * Note: BSD No. is designated and assigned exclusively by the National Telecommunications Commission (NTC) upon evaluation and approval.
                        </Text>
                      </View>
                    ) : isVasRegField ? (
                      <View
                        style={{
                          backgroundColor: "#F8FAFC",
                          borderWidth: 1,
                          borderColor: "#CBD5E1",
                          borderRadius: 10,
                          padding: 14,
                          gap: 6,
                        }}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#334155" }}>
                            VAS REGISTRATION : TO BE ASSIGNED BY NTC
                          </Text>
                          <View
                            style={{
                              backgroundColor: "#EFF6FF",
                              borderWidth: 1,
                              borderColor: "#BFDBFE",
                              borderRadius: 6,
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                            }}
                          >
                            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10.5, fontWeight: "700", color: "#1D4ED8" }}>
                              OFFICIAL NTC ASSIGNMENT
                            </Text>
                          </View>
                        </View>
                        <ValidatedInput
                          value="TO BE ASSIGNED BY NTC"
                          editable={false}
                          onChangeText={() => {}}
                        />
                        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: "#64748B", fontStyle: "italic" }}>
                          * Note: VAS Registration Number is designated and assigned exclusively by the National Telecommunications Commission (NTC) upon evaluation and approval.
                        </Text>
                      </View>
                    ) : isIntendedUseField ? (
                      <IntendedUseCheckboxGroup
                        label={displayFieldLabel}
                        required={isFieldRequired}
                        value={val}
                        onChange={(newVal) => onChange(targetId, displayFieldLabel, newVal)}
                        error={err}
                      />
                    ) : isVasServicesField ? (
                      <VasServicesCheckboxGroup
                        label={displayFieldLabel}
                        required={isFieldRequired}
                        value={val}
                        onChange={(newVal) => onChange(targetId, displayFieldLabel, newVal)}
                        error={err}
                      />
                    ) : isSignature ? (
                      <FormSignatureInput
                        label={displayFieldLabel}
                        isRequired={isFieldRequired}
                        value={val}
                        onChange={(sigData) => onChange(targetId, displayFieldLabel, sigData)}
                        applicantName={applicantName || val}
                        isBulk={isBulk}
                        appMode={appMode}
                        error={err}
                      />
                    ) : isCheckbox ? (
                      <DeclarationCheckbox
                        label={displayFieldLabel}
                        isRequired={isFieldRequired}
                        value={val}
                        onChange={(chkVal) => onChange(targetId, displayFieldLabel, chkVal)}
                        error={err}
                      />
                    ) : isDropdown ? (
                      <Select
                        label={displayFieldLabel}
                        required={isFieldRequired}
                        value={val}
                        onValueChange={handleDropdownChange}
                        options={dropdownOptions}
                        placeholder={placeholder}
                        error={err}
                      />
                    ) : isDate ? (
                      <DatePickerInput
                        label={displayFieldLabel}
                        required={isFieldRequired}
                        value={val}
                        onChangeText={(v: string) => onChange(targetId, displayFieldLabel, v)}
                        error={err}
                      />
                    ) : (
                      <ValidatedInput
                        label={displayFieldLabel}
                        required={isFieldRequired}
                        value={val}
                        onChangeText={(v) => onChange(targetId, displayFieldLabel, v)}
                        placeholder={
                          field.placeholder ||
                          (isContactField
                            ? "09XXXXXXXXX or +639XXXXXXXXX"
                            : isEmailField
                            ? "user@example.com"
                            : `Enter ${displayFieldLabel}...`)
                        }
                        keyboardType={
                          isContactField
                            ? "phone-pad"
                            : isEmailField
                            ? "email-address"
                            : isNumber
                            ? "numeric"
                            : "default"
                        }
                        autoCapitalize={isEmailField ? "none" : undefined}
                        maxLength={isContactField ? 13 : undefined}
                        error={err}
                      />
                    )}
                  </FormCol>
                );
              }).filter(Boolean);

              return {
                section,
                sIdx,
                renderedFields,
              };
            })
            .filter(({ renderedFields }) => renderedFields.length > 0);

        const getSectionTitle = (sec: FormSectionDto): string => {
          if (isAmateurPermitService) {
            const k = (sec.key || sec.id || "").toLowerCase();
            const t = (sec.title || "").toLowerCase();
            if (k === "applicant" || t.includes("applicant")) return "Applicant Details";
            if (k === "stationequipment" || k === "proposedstation" || t.includes("station/equipment") || t.includes("proposed station") || t.includes("station")) {
              return "Station/Equipment";
            }
            if (k === "particulars" || t.includes("particulars")) {
              return "Particulars";
            }
            if (k === "sourceofequipment" || t.includes("source")) {
              return "Source of Equipment";
            }
            if (k === "intendeduse" || t.includes("intended")) {
              return "Intended Use of Equipment";
            }
            if (k === "declaration" || t.includes("declaration") || t.includes("acknowledgement")) {
              return "Acknowledgement & Applicant Signature";
            }
          }
          return sec.title;
        };

        return (
          <>
            {renderedSections.map(({ section, renderedFields, sIdx }, idx) => {
              const sectionKey = section.id || section.key || `section-${sIdx}`;
              const sectionDisplayNum = (showApplicationTypeSection ? 1 : 0) + idx + 1;
              return (
                <View key={sectionKey} style={styles.sectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionTitleRow}>
                      <View style={styles.iconCircle}>
                        <Text style={styles.iconCircleText}>{sectionDisplayNum}</Text>
                      </View>
                      <Text style={styles.sectionTitle}>{getSectionTitle(section)}</Text>
                    </View>
                    <View style={styles.sectionBadge}>
                      <Text style={styles.sectionBadgeText}>SECTION {sectionDisplayNum}</Text>
                    </View>
                  </View>

                  <FormGrid>{renderedFields}</FormGrid>
                </View>
              );
            })}

            {/* ── Guaranteed Signature Section at bottom of every application form ── */}
            {(() => {
              const hasSignatureInSections = renderedSections.some(({ section }) =>
                (section.fields || []).some((f) => {
                  const rawType = (f.fieldType || f.type || "").toLowerCase();
                  const labelLower = (f.label || "").toLowerCase();
                  return (
                    rawType === "signature" ||
                    labelLower.includes("signature") ||
                    f.fieldId === FIELD_ID_SIGNATURE
                  );
                })
              );

              if (hasSignatureInSections) return null;

              const nextSectionNum = (showApplicationTypeSection ? 1 : 0) + renderedSections.length + 1;
              return (
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionTitleRow}>
                      <View style={styles.iconCircle}>
                        <Text style={styles.iconCircleText}>{nextSectionNum}</Text>
                      </View>
                      <Text style={styles.sectionTitle}>Acknowledgement &amp; Applicant Signature</Text>
                    </View>
                    <View style={styles.sectionBadge}>
                      <Text style={styles.sectionBadgeText}>SECTION {nextSectionNum}</Text>
                    </View>
                  </View>

                  <FormSignatureInput
                    label="Applicant Signature / Declaration"
                    isRequired={true}
                    value={values[FIELD_ID_SIGNATURE] !== undefined ? values[FIELD_ID_SIGNATURE] : (values["signature"] ?? values["applicantSignature"] ?? "")}
                    onChange={(sigData) => onChange(FIELD_ID_SIGNATURE, "Applicant Signature", sigData)}
                    applicantName={applicantName}
                    isBulk={isBulk}
                    appMode={appMode}
                    error={errors?.[FIELD_ID_SIGNATURE] || errors?.["signature"]}
                  />
                </View>
              );
            })()}
          </>
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderLeftWidth: 5,
    borderLeftColor: "#0F2C59",
    padding: 20,
    shadowColor: "#0F2C59",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
    minWidth: 200,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  iconCircleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "800",
    color: "#0F2C59",
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F2C59",
  },
  sectionBadge: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  sectionBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: "800",
    color: "#1E40AF",
  },
});
