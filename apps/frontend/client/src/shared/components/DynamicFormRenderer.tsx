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
} from "../constants/fieldIds";

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
  if (cat.includes("exam") || tit.includes("exam") || tit.includes("admission") || tit.includes("operator")) {
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

  // 1. Personal Identity Fields
  if (
    labelLower.includes("full name") ||
    labelLower.includes("legal name") ||
    idLower === "fullname" ||
    idLower === FIELD_ID_FULL_NAME
  ) {
    return 1;
  }
  if (
    labelLower.includes("birth") ||
    idLower === "birthdate" ||
    idLower === FIELD_ID_BIRTH_DATE
  ) {
    return 2;
  }
  if (labelLower.includes("sex") || labelLower.includes("gender")) return 3;
  if (labelLower.includes("civil status")) return 4;
  if (labelLower.includes("nationality") || labelLower.includes("citizenship")) return 5;

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

  return 100 + defaultIndex;
}

export function DynamicFormRenderer({
  form,
  values = {},
  onChange,
  onStructuredNameChange,
  structuredNameData,
  applicantName = "",
  allowCompany = false,
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
      l.includes("city / municipality") ||
      l.includes("municipality") ||
      id === FIELD_ID_CITY
    );
  });
  const barangayField = allFields.find((f) => {
    const l = (f?.label || "").toLowerCase().trim();
    const id = f?.fieldId || f?.id || "";
    return l === "barangay" || id === FIELD_ID_BARANGAY;
  });

  const regionFieldId = regionField?.fieldId || regionField?.id || "";
  const provinceFieldId = provinceField?.fieldId || provinceField?.id || "";
  const cityFieldId = cityField?.fieldId || cityField?.id || "";
  const barangayFieldId = barangayField?.fieldId || barangayField?.id || "";

  const currentRegionVal = (regionFieldId && values?.[regionFieldId]) || values?.["region"] || "";
  const currentProvinceVal = (provinceFieldId && values?.[provinceFieldId]) || values?.["province"] || "";
  const currentCityVal = (cityFieldId && values?.[cityFieldId]) || values?.["city"] || "";

  const [selectedRegionId, setSelectedRegionId] = React.useState<string | undefined>(undefined);
  const [selectedProvinceId, setSelectedProvinceId] = React.useState<string | undefined>(undefined);
  const [selectedMunicipalityId, setSelectedMunicipalityId] = React.useState<string | undefined>(undefined);

  const {
    regions = [],
    provinces = [],
    municipalities = [],
    barangays = [],
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

  const hiddenKeys = hideSections.map((s) => s.toLowerCase());

  const isTypeSection = (section: FormSectionDto): boolean => {
    const key = (section.key || section.id || "").toLowerCase();
    const title = (section.title || "").toLowerCase();
    return (
      key === "typeofcertificate" ||
      key === "permittype" ||
      key === "apptype" ||
      key === "applicationtype" ||
      key === "typeofapplication" ||
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

  const visibleSections = sections.filter((section) => {
    if (!section) return false;
    if (isTypeSection(section)) return false;
    const key = (section.key || section.id || "").toLowerCase();
    const title = (section.title || "").toLowerCase();

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

  const catLower = (serviceCategory || "").toLowerCase();
  const titLower = (serviceTitle || "").toLowerCase();
  const isExam = catLower.includes("exam") || titLower.includes("exam") || titLower.includes("admission") || titLower.includes("operator examination");
  const isPermit = catLower.includes("permit") || titLower.includes("permit");
  const isRequestOrComplaint = catLower.includes("request") || catLower.includes("complaint") || titLower.includes("complaint") || titLower.includes("request");
  const isAccreditation = catLower.includes("accreditation") || titLower.includes("accreditation");

  // Multi-year validity selection (1, 2, 3 years) is only applicable for Licenses and Certificates
  const showNumberOfYears = !isExam && !isPermit && !isRequestOrComplaint && !isAccreditation && (catLower.includes("license") || catLower.includes("certificate") || titLower.includes("license") || titLower.includes("certificate"));

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
            <FormCol span={showNumberOfYears ? (variantElements.length > 0 ? 4 : 6) : (variantElements.length > 0 ? 6 : 12)}>
              <Select
                label="Type of Application"
                required
                value={selectedVariantId || (variants[0] ? String(variants[0].id) : "")}
                options={
                  variants.length > 0
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
            {variantElements.length > 0 && (
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
              <FormCol span={variantElements.length > 0 ? 4 : 6}>
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
          </FormGrid>
        </View>
      )}

      {visibleSections.map((section, idx) => {
        const sectionKey = section.id || section.key || `section-${idx}`;
        const sectionDisplayNum = (showApplicationTypeSection ? 1 : 0) + idx + 1;
        return (
          <View key={sectionKey} style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconCircleText}>{sectionDisplayNum}</Text>
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>SECTION {sectionDisplayNum}</Text>
              </View>
            </View>

            <FormGrid>
              {(() => {
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
                    fId.includes("equipmentdetails") ||
                    fId.includes("antennadetails") ||
                    fId.includes("devicesdetails") ||
                    fId.includes("radioofficers") ||
                    fLbl.includes("particulars of equipment") ||
                    fLbl.includes("registered devices details")
                  );
                });

                return sectionFields.map((field, fIdx) => {
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
                    !fIdLower.includes("equipmentdetails") &&
                    !fIdLower.includes("antennadetails") &&
                    !fIdLower.includes("devicesdetails") &&
                    !fIdLower.includes("radioofficers") &&
                    !fIdLower.includes("tvro") &&
                    rawType !== "repeater" &&
                    rawType !== "table" &&
                    rawType !== "repeater_table" &&
                    (labelLower === "serial number" ||
                     labelLower === "frequency range" ||
                     labelLower === "power output" ||
                     labelLower === "power" ||
                     labelLower === "make" ||
                     labelLower === "type" ||
                     labelLower === "model" ||
                     labelLower === "type/model")
                  ) {
                    return null;
                  }

                  // Skip individual company & representative fields because they are captured generally in Step 2
                  const isCompanyField =
                    targetId === "fd000000-0000-0000-0000-000000000081" ||
                    targetId === "fd000000-0000-0000-0000-000000000082" ||
                    targetId === "fd000000-0000-0000-0000-000000000083" ||
                    targetId === "fd000000-0000-0000-0000-000000000086" ||
                    fIdLower === "companyname" ||
                    fIdLower === "dtisecregistration" ||
                    fIdLower === "dti_sec_registration" ||
                    fIdLower === "representativename" ||
                    fIdLower === "representativeposition" ||
                    labelLower === "company / business name" ||
                    labelLower === "company / corporation name" ||
                    labelLower === "company name" ||
                    labelLower === "sec / dti registration number" ||
                    labelLower === "authorized representative name" ||
                    labelLower === "representative name" ||
                    labelLower === "representative position";

                  if (isCompanyField) {
                    return null;
                  }

                const isEmploymentStatusField =
                  (labelLower === "status" && (section.title.toLowerCase().includes("employment") || section.key?.toLowerCase().includes("employment"))) ||
                  labelLower === "employment status" ||
                  targetId === FIELD_ID_EMPLOYMENT_STATUS;

                const isEmploymentTypeField =
                  (labelLower === "type" && (section.title.toLowerCase().includes("employment") || section.key?.toLowerCase().includes("employment"))) ||
                  labelLower === "employment type" ||
                  targetId === FIELD_ID_EMPLOYMENT_TYPE;

                const isEquipmentOrTechnicalSection =
                  section.title.toLowerCase().includes("equipment") ||
                  section.title.toLowerCase().includes("antenna") ||
                  section.title.toLowerCase().includes("signal") ||
                  section.key?.toLowerCase().includes("equipment") ||
                  section.key?.toLowerCase().includes("antenna") ||
                  section.key?.toLowerCase().includes("signal");

                const isApplicationTypeField =
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
                  (labelLower === "type" && !section.title.toLowerCase().includes("employment") && !section.key?.toLowerCase().includes("employment")) ||
                  fIdLower === "type_of_application" ||
                  fIdLower === "permittype" ||
                  fIdLower === "applicationtype" ||
                  fIdLower === "typeofcertificate");

                // Skip repetitive application/permit/certificate type fields in the form body
                if (isApplicationTypeField) {
                  return null;
                }

                const isNameField =
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

                const isSignature =
                  rawType === "signature" ||
                  labelLower.includes("signature");

                const isCheckbox =
                  rawType === "checkbox" ||
                  labelLower.includes("declare") ||
                  labelLower.includes("certify") ||
                  labelLower.includes("agreement") ||
                  labelLower.includes("declaration");

                const isElementsField =
                  labelLower.includes("element") ||
                  labelLower.includes("class of station") ||
                  targetId === FIELD_ID_ELEMENTS;

                // Skip element field in the form body if already rendered in top Section 1
                if (showApplicationTypeSection && variantElements.length > 0 && isElementsField) {
                  return null;
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

                const isNoOfYearsField =
                  labelLower.includes("number of years") ||
                  labelLower.includes("no of years") ||
                  labelLower === "years" ||
                  targetId === FIELD_ID_NO_OF_YEARS;

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
                  (isElementsField && elementOptions.length > 0);

                let val = rawVal;
                if (isApplicationTypeField && (!val || val === "") && variantOptions.length > 0) {
                  val = variantOptions[0].value;
                }
                if (isNoOfYearsField && (!val || val === "")) {
                  val = noOfYears || "1";
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

                if (isEmploymentStatusField) {
                  dropdownOptions = [
                    { label: "Employed", value: "Employed" },
                    { label: "Unemployed", value: "Unemployed" },
                  ];
                  placeholder = "Select Status...";
                } else if (isEmploymentTypeField) {
                  dropdownOptions = [
                    { label: "Local", value: "Local" },
                    { label: "Foreign", value: "Foreign" },
                  ];
                  placeholder = "Select Type...";
                } else if (isNoOfYearsField) {
                  dropdownOptions = [
                    { label: "1 Year", value: "1" },
                    { label: "2 Years", value: "2" },
                    { label: "3 Years", value: "3" },
                  ];
                  placeholder = "Select Number of Years...";
                } else if (isApplicationTypeField) {
                  dropdownOptions = variantOptions;
                  placeholder = "Select Application Type / Variant...";
                } else if (isElementsField && elementOptions.length > 0) {
                  dropdownOptions = elementOptions;
                  placeholder = "Select Exam Element...";
                } else if (isRegionField) {
                  dropdownOptions = regions.map((r) => ({
                    label: r.code ? `${r.name} (${r.code})` : r.name,
                    value: r.name,
                  }));
                  placeholder = loadingRegions ? "Loading regions..." : "Select Region...";
                } else if (isProvinceField) {
                  dropdownOptions = provinces.map((p) => ({
                    label: p.name,
                    value: p.name,
                  }));
                  placeholder = loadingProvinces
                    ? "Loading provinces..."
                    : !selectedRegionId
                    ? "Select Region first..."
                    : "Select Province...";
                } else if (isCityField) {
                  dropdownOptions = municipalities.map((m) => ({
                    label: m.name,
                    value: m.name,
                  }));
                  placeholder = loadingMunicipalities
                    ? "Loading cities..."
                    : !selectedProvinceId
                    ? "Select Province first..."
                    : "Select City / Municipality...";
                } else if (isBarangayField) {
                  dropdownOptions = barangays.map((b) => ({
                    label: b.name,
                    value: b.name,
                  }));
                  placeholder = loadingBarangays
                    ? "Loading barangays..."
                    : !selectedMunicipalityId
                    ? "Select City first..."
                    : "Select Barangay...";
                } else {
                  dropdownOptions = parseOptions(field);
                }

                const handleDropdownChange = (selectedVal: string) => {
                  onChange(targetId, field.label, selectedVal);

                  // Cascade reset child fields only if value actually changed and was non-empty
                  if (val && selectedVal !== val) {
                    if (isRegionField) {
                      if (provinceFieldId) onChange(provinceFieldId, provinceField?.label || "Province", "");
                      if (cityFieldId) onChange(cityFieldId, cityField?.label || "City / Municipality", "");
                      if (barangayFieldId) onChange(barangayFieldId, barangayField?.label || "Barangay", "");
                    } else if (isProvinceField) {
                      if (cityFieldId) onChange(cityFieldId, cityField?.label || "City / Municipality", "");
                      if (barangayFieldId) onChange(barangayFieldId, barangayField?.label || "Barangay", "");
                    } else if (isCityField) {
                      if (barangayFieldId) onChange(barangayFieldId, barangayField?.label || "Barangay", "");
                    }
                  }
                };

                const isDate =
                  rawType === "date" ||
                  targetId === FIELD_ID_BIRTH_DATE ||
                  labelLower === "date of birth" ||
                  labelLower === "birth date" ||
                  labelLower === "dob" ||
                  (labelLower.includes("date") && !labelLower.includes("candidate") && !labelLower.includes("update") && !labelLower.includes("data"));
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
                const sectionKeyLower = (section.key || section.id || "").toLowerCase();
                const fieldIdLower = (field.fieldId || field.id || "").toLowerCase();
                const isRepeaterField =
                  rawType === "repeater" ||
                  rawType === "table" ||
                  rawType === "repeater_table" ||
                  rawType === "array" ||
                  fieldIdLower.includes("equipmentdetails") ||
                  fieldIdLower.includes("antennadetails") ||
                  fieldIdLower.includes("radioofficers") ||
                  fieldIdLower.includes("devicesdetails") ||
                  fieldIdLower.includes("signaldetails") ||
                  fieldIdLower.includes("signalreception") ||
                  fieldIdLower.includes("tvro") ||
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

                const isBsdField =
                  fieldIdLower.includes("bsd") ||
                  labelLower.includes("bsd no") ||
                  labelLower.includes("bsd number");

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

                const span = isNameField || isSignature || isCheckbox || isFile || isRepeaterField || isBsdField ? 12 : 6;

                return (
                  <FormCol key={targetId} span={span} compact={field.isCompact}>
                    {isNameField ? (
                      <ApplicantNameField
                        key={targetId}
                        label={field.label}
                        isRequired={field.isRequired}
                        value={val}
                        structuredValue={structuredNameData}
                        allowCompany={allowCompany}
                        onChange={(combinedName) => onChange(targetId, field.label, combinedName)}
                        onStructuredChange={onStructuredNameChange}
                        error={err}
                      />
                    ) : isRepeaterField ? (
                      <FormRepeaterTable
                        label={field.label}
                        isRequired={field.isRequired}
                        value={val}
                        fieldKey={targetId}
                        onChange={(repeaterJson) => onChange(targetId, field.label, repeaterJson)}
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
                            {field.label}
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
                    ) : isSignature ? (
                      <FormSignatureInput
                        label={field.label}
                        isRequired={field.isRequired}
                        value={val}
                        onChange={(sigData) => onChange(targetId, field.label, sigData)}
                        applicantName={applicantName || val}
                        isBulk={isBulk}
                        appMode={appMode}
                        error={err}
                      />
                    ) : isCheckbox ? (
                      <DeclarationCheckbox
                        label={field.label}
                        isRequired={field.isRequired}
                        value={val}
                        onChange={(chkVal) => onChange(targetId, field.label, chkVal)}
                        error={err}
                      />
                    ) : isDropdown ? (
                      <Select
                        label={field.label}
                        required={field.isRequired}
                        value={val}
                        onValueChange={handleDropdownChange}
                        options={dropdownOptions}
                        placeholder={placeholder}
                        error={err}
                      />
                    ) : isDate ? (
                      <DatePickerInput
                        label={field.label}
                        required={field.isRequired}
                        value={val}
                        onChangeText={(v: string) => onChange(targetId, field.label, v)}
                        error={err}
                      />
                    ) : (
                      <ValidatedInput
                        label={field.label}
                        required={field.isRequired}
                        value={val}
                        onChangeText={(v) => onChange(targetId, field.label, v)}
                        placeholder={
                          field.placeholder ||
                          (isContactField
                            ? "09XXXXXXXXX or +639XXXXXXXXX"
                            : isEmailField
                            ? "user@example.com"
                            : `Enter ${field.label}...`)
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
              });
            })()}
          </FormGrid>
        </View>
      );
      })}

      {/* ── Guaranteed Signature Section at bottom of every application form ── */}
      {(() => {
        const hasSignatureInSections = visibleSections.some((sec) =>
          (sec.fields || []).some((f) => {
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

        const nextSectionNum = (showApplicationTypeSection ? 1 : 0) + visibleSections.length + 1;
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
