import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { DynamicFormField } from "./dynamic-form/DynamicFormField";
import { DynamicFormRendererProps, FormSectionDto, FieldDto } from "./dynamic-form/dynamicFormTypes";
import { parseOptions, evaluateVisibilityCondition, FormEvaluationContext } from "./dynamic-form/dynamicFormUtils";
import { useLocationData } from "./dynamic-form/useLocationData";
import { dynamicFormStyles as styles } from "./dynamic-form/DynamicFormRenderer.styles";
import { FormGrid } from "./FormGrid";

export type { DynamicFormRendererProps, FormDto, FormSectionDto, FieldDto } from "./dynamic-form/dynamicFormTypes";

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  form,
  values = {},
  onChange,
  onStructuredNameChange,
  structuredNameData,
  applicantName,
  applicantType = "individual",
  serviceCategory,
  serviceTitle,
  selectedVariantId,
  variants = [],
  variantElements = [],
  selectedElementId,
  errors = {},
  hideSections = [],
  isBulk = false,
  appMode = "SINGLE",
}) => {
  const [selectedRegionId, setSelectedRegionId] = useState<string | undefined>();
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | undefined>();
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string | undefined>();
  const { regions, provinces, municipalities, barangays } = useLocationData(selectedRegionId, selectedProvinceId, selectedMunicipalityId);

  // Auto-sync location IDs from existing values on load
  useEffect(() => {
    const rVal = (values?.["region"] || values?.["Region"] || "") as string;
    if (rVal && regions.length > 0 && !selectedRegionId) {
      const match = regions.find((r) => r.name.toLowerCase() === rVal.toLowerCase() || r.id === rVal);
      if (match) setSelectedRegionId(match.id);
    }
  }, [values, regions, selectedRegionId]);

  useEffect(() => {
    const pVal = (values?.["province"] || values?.["Province"] || "") as string;
    if (pVal && provinces.length > 0 && !selectedProvinceId) {
      const match = provinces.find((p) => p.name.toLowerCase() === pVal.toLowerCase() || p.id === pVal);
      if (match) setSelectedProvinceId(match.id);
    }
  }, [values, provinces, selectedProvinceId]);

  useEffect(() => {
    const cVal = (values?.["city"] || values?.["City"] || values?.["cityMunicipality"] || values?.["city_municipality"] || "") as string;
    if (cVal && municipalities.length > 0 && !selectedMunicipalityId) {
      const match = municipalities.find((m) => m.name.toLowerCase() === cVal.toLowerCase() || m.id === cVal);
      if (match) setSelectedMunicipalityId(match.id);
    }
  }, [values, municipalities, selectedMunicipalityId]);

  const matchedVariant = variants.find((v) => String(v.id) === String(selectedVariantId));
  const matchedElement = variantElements.find((e) => String(e.id) === String(selectedElementId));

  const evaluationContext: FormEvaluationContext = {
    variantType: matchedVariant?.type ? String(matchedVariant.type) : undefined,
    variantId: selectedVariantId,
    variantDescription: matchedVariant?.description || matchedVariant?.name,
    elementCodes: matchedElement?.code ? [matchedElement.code] : variantElements.map((e) => e.code).filter((c): c is string => Boolean(c)),
    applicantType,
    formValues: values,
  };

  const sections = form?.sections || [];

  const renderFieldInstance = (
    field: FieldDto,
    fIdx: number,
    section: FormSectionDto
  ) => {
    const rawTargetId = field.fieldId || field.id || `field-${fIdx}`;
    const fIdLower = rawTargetId.toLowerCase();
    const labelLower = (field.label || "").toLowerCase().trim();
    const rawType = (field.fieldType || field.type || "").toLowerCase();

    const isRepeaterField = rawType === "repeater" || rawType === "table" || fIdLower.includes("equipmentdetails") || fIdLower.includes("devicesdetails");
    const isBsdField = fIdLower.includes("bsd") || labelLower.includes("bsd no");
    const isVasRegField = fIdLower.includes("vasregistration") || fIdLower.includes("vasregno");
    const isIntendedUseField = fIdLower.includes("intendeduse") || labelLower.includes("intended use");
    const isVasServicesField = fIdLower.includes("valueaddedservices") || labelLower.includes("value added service");
    const isSignature = rawType === "signature" || labelLower.includes("signature");
    const isCheckbox = rawType === "checkbox" || labelLower.includes("declare");
    const isDropdown = rawType === "dropdown" || rawType === "select" || fIdLower === "bandwidthunit" || fIdLower === "frequencyunit" || fIdLower === "sex" || fIdLower === "stationclass";
    const isDate = rawType === "date" || labelLower.includes("date");
    const isNumber = rawType === "number" || labelLower.includes("power") || labelLower.includes("watts") || labelLower.includes("height") || labelLower.includes("weight") || labelLower.includes("gain") || labelLower.includes("diameter");
    const isContactField = labelLower.includes("contact") || labelLower.includes("mobile") || rawType === "tel";
    const isEmailField = labelLower.includes("email") || rawType === "email";

    let span: 12 | 8 | 6 | 4 | 3 = 6;
    if (
      isRepeaterField ||
      isSignature ||
      isCheckbox ||
      isBsdField ||
      isVasRegField ||
      isIntendedUseField ||
      isVasServicesField ||
      labelLower.includes("remarks") ||
      labelLower.includes("circumstances") ||
      labelLower.includes("service area") ||
      labelLower.includes("points of comm") ||
      labelLower.includes("exact location") ||
      labelLower.includes("network diagram") ||
      labelLower.includes("details and supporting")
    ) {
      span = 12;
    } else if (isDropdown || isDate || isNumber) {
      span = 6;
    }

    const val = (values && values[rawTargetId]) || (values && field.label && values[field.label]) || "";

    let dropdownOptions: Array<{ label: string; value: string }> = [];
    if (fIdLower === "frequencyunit" || labelLower.includes("frequency unit")) dropdownOptions = [{ label: "KHz", value: "KHz" }, { label: "MHz", value: "MHz" }, { label: "GHz", value: "GHz" }];
    else if (fIdLower === "bandwidthunit" || labelLower === "unit") dropdownOptions = [{ label: "KHz", value: "KHz" }, { label: "MHz", value: "MHz" }, { label: "GHz", value: "GHz" }];
    else if (fIdLower === "stationclass" || labelLower.includes("station class") || labelLower.includes("class of station")) {
      dropdownOptions = [{ label: "RT", value: "RT" }, { label: "FX", value: "FX" }, { label: "FB", value: "FB" }, { label: "FX/FB", value: "FX/FB" }, { label: "ML", value: "ML" }, { label: "P", value: "P" }, { label: "FA", value: "FA" }, { label: "MA", value: "MA" }, { label: "Others", value: "Others" }];
    }
    else if (labelLower === "region" || fIdLower === "region" || fIdLower.includes("region")) dropdownOptions = regions.map((r: { id: string; name: string }) => ({ label: r.name, value: r.name }));
    else if (labelLower === "province" || fIdLower === "province" || fIdLower.includes("province")) dropdownOptions = provinces.map((p: { id: string; name: string }) => ({ label: p.name, value: p.name }));
    else if (labelLower.includes("city") || labelLower.includes("municipality") || fIdLower === "city" || fIdLower.includes("city") || fIdLower.includes("municipality")) dropdownOptions = municipalities.map((m: { id: string; name: string }) => ({ label: m.name, value: m.name }));
    else if (labelLower === "barangay" || fIdLower === "barangay" || fIdLower.includes("barangay")) dropdownOptions = barangays.map((b: { id: string; name: string }) => ({ label: b.name, value: b.name }));
    else dropdownOptions = parseOptions(field);

    const isFieldRequired = field.isRequired ?? false;

    return (
      <DynamicFormField
        key={rawTargetId}
        field={field}
        targetId={rawTargetId}
        val={val}
        err={errors?.[rawTargetId]}
        displayLabel={field.label}
        isRequired={isFieldRequired}
        span={span}
        dropdownOptions={dropdownOptions}
        placeholder={field.placeholder || `Enter ${field.label}...`}
        isNameField={false}
        isRepeaterField={isRepeaterField}
        isBsdField={isBsdField}
        isVasRegField={isVasRegField}
        isIntendedUseField={isIntendedUseField}
        isVasServicesField={isVasServicesField}
        isSignature={isSignature}
        isCheckbox={isCheckbox}
        isDropdown={isDropdown}
        isDate={isDate}
        isNumber={isNumber}
        isContactField={isContactField}
        isEmailField={isEmailField}
        isNonIndividualEntity={applicantType === "company"}
        isAmateurPermitService={false}
        isIndividualVar={applicantType === "individual"}
        showCallSign={true}
        structuredNameData={structuredNameData}
        applicantName={applicantName}
        isBulk={isBulk}
        appMode={appMode}
        onChange={onChange}
        onStructuredNameChange={onStructuredNameChange}
        onDropdownChange={(v) => {
          onChange(rawTargetId, field.label, v);
          if (labelLower === "region" || fIdLower === "region" || fIdLower.includes("region")) {
            const found = regions.find((r: { id: string; name: string }) => r.name.toLowerCase() === v.toLowerCase() || r.id === v);
            setSelectedRegionId(found?.id);
            setSelectedProvinceId(undefined);
            setSelectedMunicipalityId(undefined);
          } else if (labelLower === "province" || fIdLower === "province" || fIdLower.includes("province")) {
            const found = provinces.find((p: { id: string; name: string }) => p.name.toLowerCase() === v.toLowerCase() || p.id === v);
            setSelectedProvinceId(found?.id);
            setSelectedMunicipalityId(undefined);
          } else if (labelLower.includes("city") || labelLower.includes("municipality") || fIdLower === "city" || fIdLower.includes("city") || fIdLower.includes("municipality")) {
            const found = municipalities.find((m: { id: string; name: string }) => m.name.toLowerCase() === v.toLowerCase() || m.id === v);
            setSelectedMunicipalityId(found?.id);
          }
        }}
      />
    );
  };

  const visibleSections = sections.filter((sec) => {
    if (!sec) return false;
    const k = (sec.key || sec.id || "").trim().toLowerCase();
    const t = (sec.title || "").trim().toLowerCase();
    if (hideSections.includes(k) || hideSections.includes(t)) return false;

    // Step 3 is strictly for service/technical specifications.
    // Applicant details are in ApplicantInformationFormSection,
    // Declaration is signed upon submission (Step 5),
    // and Payment is handled during/after assessment (Billing).
    if (
      k === "declaration" ||
      t.includes("declaration") ||
      k === "payment" ||
      t.includes("payment") ||
      k === "applicant" ||
      k === "applicantperson" ||
      k === "applicantparticulars" ||
      k === "applicantaddress" ||
      k === "applicantcontact"
    ) {
      return false;
    }

    return evaluateVisibilityCondition(sec.visibilityCondition, evaluationContext);
  });

  return (
    <View style={styles.container}>
      {visibleSections.map((section, sIdx) => {
        const rawFields = section.fields || [];
        const visibleFields = rawFields
          .filter((f) => {
            const rawTargetId = (f.fieldId || f.id || "").toLowerCase();
            const labelLower = (f.label || "").toLowerCase();
            if (
              rawTargetId.includes("declaration") ||
              labelLower.includes("declaration") ||
              labelLower.includes("i hereby declare") ||
              rawTargetId.includes("payment") ||
              labelLower.includes("official receipt") ||
              labelLower.includes("amount paid")
            ) {
              return false;
            }
            return true;
          })
          .filter((f) => evaluateVisibilityCondition(f.visibilityCondition, evaluationContext));

        if (visibleFields.length === 0) return null;

        const sectionDisplayNum = sIdx + 1;

        return (
          <View key={section.id || section.key || `section-${sIdx}`} style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconCircleText}>{sectionDisplayNum}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.description ? (
                    <Text style={styles.sectionBadgeText}>{section.description}</Text>
                  ) : null}
                </View>
              </View>
            </View>

            <FormGrid>
              {visibleFields.map((field, fIdx) => renderFieldInstance(field, fIdx, section))}
            </FormGrid>
          </View>
        );
      })}
    </View>
  );
};
