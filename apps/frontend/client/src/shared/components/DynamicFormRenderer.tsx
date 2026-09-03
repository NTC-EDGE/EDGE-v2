import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon } from "@edge/ui";
import { FormGrid } from "./FormGrid";
import { DynamicFormField } from "./dynamic-form/DynamicFormField";
import { DynamicFormSection1 } from "./dynamic-form/DynamicFormSection1";
import { DynamicFormRendererProps, FormSectionDto, FieldDto } from "./dynamic-form/dynamicFormTypes";
import { getFieldSortPriority, getSectionTitle, parseOptions } from "./dynamic-form/dynamicFormUtils";
import { useCertificateServicesQuery } from "./dynamic-form/useCertificateServicesQuery";
import { useLocationData } from "./dynamic-form/useLocationData";
import { dynamicFormStyles as styles } from "./dynamic-form/DynamicFormRenderer.styles";
import {
  FIELD_ID_FULL_NAME,
  FIELD_ID_BIRTH_DATE,
  FIELD_ID_CALL_SIGN,
  FIELD_ID_SERVICE_AREA,
  FIELD_ID_FREQUENCY,
  FIELD_ID_BANDWIDTH,
  FIELD_ID_BANDWIDTH_UNIT,
  FIELD_ID_EMISSION,
  FIELD_ID_POWER_OUTPUT,
  FIELD_ID_HOURS_OP,
  FIELD_ID_STATION_CLASS,
  FIELD_ID_REMARKS,
  FIELD_ID_VAS_REG_NO,
  FIELD_ID_MAKE_TYPE_MODEL,
} from "../constants/fieldIds";

export type { DynamicFormRendererProps, FormDto, FormSectionDto, FieldDto } from "./dynamic-form/dynamicFormTypes";

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  form,
  values,
  onChange,
  onStructuredNameChange,
  structuredNameData,
  applicantName,
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
  errors,
  hideSections = [],
  isBulk,
  appMode,
}) => {
  const [selectedRegionId, setSelectedRegionId] = useState<string | undefined>();
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | undefined>();
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string | undefined>();
  const [stationParticularsCount, setStationParticularsCount] = useState<number>(1);
  const { regions, provinces, municipalities, barangays } = useLocationData(selectedRegionId, selectedProvinceId, selectedMunicipalityId);
  useCertificateServicesQuery();

  const catLower = (serviceCategory || "").toLowerCase();
  const titLower = (serviceTitle || "").toLowerCase();
  const matchedVariant = variants.find((v) => String(v.id) === String(selectedVariantId)) || variants[0];
  const varDesc = (matchedVariant?.description || matchedVariant?.name || "").toLowerCase();
  const varType = (matchedVariant?.type || "").toLowerCase();

  const isVas = catLower.includes("certificate") && (titLower.includes("value-added") || titLower.includes("vas") || varDesc.includes("vas") || varDesc.includes("value-added"));
  const isDuplicateCopy = varDesc.includes("duplicate"), isCertifiedTrueCopy = varDesc.includes("certified true copy") || varDesc.includes("true copy");
  const isCopyOfCert = (catLower.includes("certificate") || catLower.includes("permit")) && (titLower.includes("copy") || titLower.includes("ntc 1-21") || titLower.includes("ntc_1_21") || isDuplicateCopy || isCertifiedTrueCopy);
  const isAmateurPermitService = catLower.includes("permit") && (titLower.includes("amateur") || titLower.includes("ntc 1-09") || titLower.includes("ntc_1_09") || varDesc.includes("amateur"));
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
  const isAmateurCert = catLower.includes("certificate") && (titLower.includes("amateur") || titLower.includes("ntc 1-03") || titLower.includes("ntc_1_03")), isCpeAccreditation = catLower.includes("accreditation") && (titLower.includes("customer premises") || titLower.includes("cpe"));
  const isRocService = catLower.includes("certificate") && (titLower.includes("radio operator certificates (roc)") || titLower.includes("ntc 1-02"));
  const isModification = varType.includes("modification") || varDesc.includes("modification"), isRenewal = varType.includes("renewal") || varDesc.includes("renewal"), isRenewalOrMod = isRenewal || isModification;
  const isLifetimeSupplementary = varDesc.includes("lifetime amateur radio station supplementary");
  const isVanity = varDesc.includes("vanity call sign") || varDesc.includes("vanity");
  const isVanityRen = isVanity && (varType.includes("renewal") || varDesc.includes("renewal"));
  const isVanityNew = isVanity && !isVanityRen;
  const isSpecialEvent = varDesc.includes("special event");
  const isForeignVisitor = varDesc.includes("foreign visitor");
  const isVanityOrSpecialEvent = isVanity || isSpecialEvent;
  const isNonIndividualEntity = applicantType === "company" || (!applicantType && matchedVariant?.isIndividual === false && !isVanityOrSpecialEvent), isIndividualVar = !isNonIndividualEntity;
  const showElements = !isCopyOfCert && variantElements.length > 0 && !isLifetimeSupplementary && !varDesc.includes("special radio operator");
  const showNumberOfYears = !isDuplicateCopy && !isCertifiedTrueCopy && !isVas && (isCpeAccreditation || isRocService || (isAmateurCert && isModification) || (isAmateurPermitService && (isForeignVisitor || isVanityNew || isVanityRen || isSpecialEvent)));

  // Auto-sync location IDs from existing values on load
  React.useEffect(() => {
    const rVal = (values?.["region"] || values?.["Region"] || "") as string;
    if (rVal && regions.length > 0 && !selectedRegionId) {
      const match = regions.find((r) => r.name.toLowerCase() === rVal.toLowerCase() || r.id === rVal);
      if (match) setSelectedRegionId(match.id);
    }
  }, [values, regions, selectedRegionId]);

  React.useEffect(() => {
    const pVal = (values?.["province"] || values?.["Province"] || "") as string;
    if (pVal && provinces.length > 0 && !selectedProvinceId) {
      const match = provinces.find((p) => p.name.toLowerCase() === pVal.toLowerCase() || p.id === pVal);
      if (match) setSelectedProvinceId(match.id);
    }
  }, [values, provinces, selectedProvinceId]);

  React.useEffect(() => {
    const cVal = (values?.["city"] || values?.["City"] || values?.["cityMunicipality"] || values?.["city_municipality"] || "") as string;
    if (cVal && municipalities.length > 0 && !selectedMunicipalityId) {
      const match = municipalities.find((m) => m.name.toLowerCase() === cVal.toLowerCase() || m.id === cVal);
      if (match) setSelectedMunicipalityId(match.id);
    }
  }, [values, municipalities, selectedMunicipalityId]);

  const sections = form?.sections || [];
  const visibleSections = sections.filter((sec) => {
    if (!sec) return false;
    const k = (sec.key || sec.id || "").toLowerCase();
    const t = (sec.title || "").toLowerCase();
    if (k.includes("type") || t.includes("application type")) return false;
    if (hideSections.includes(k) || hideSections.includes(t)) return false;
    if (isAmateurPermitService) {
      if (isAmateurPurchaseVariant && (k === "sourceofequipment" || t.includes("source"))) return false;
      if (isVanityOrSpecialEvent && (k === "sourceofequipment" || t.includes("source") || k === "intendeduse" || t.includes("intended"))) return false;
      return k === "applicant" || t.includes("applicant") || k === "stationequipment" || k === "proposedstation" || k === "particulars" || t.includes("station") || t.includes("particular") || k === "sourceofequipment" || t.includes("source") || k === "intendeduse" || t.includes("intended");
    }
    return !k.includes("declaration") && !t.includes("declaration") && !k.includes("payment") && !t.includes("payment") && !k.includes("classification") && !t.includes("classification");
  });

  const sortedSections = isAmateurPermitService
    ? [...visibleSections].sort((a, b) => {
        const getPri = (s: FormSectionDto) => {
          const k = (s.key || s.id || "").toLowerCase();
          const t = (s.title || "").toLowerCase();
          if (k === "applicant" || t.includes("applicant")) return 1;
          if (k === "stationequipment" || k === "proposedstation" || k === "particulars" || t.includes("station") || t.includes("particular")) return 2;
          if (k === "sourceofequipment" || t.includes("source")) return 3;
          if (k === "intendeduse" || t.includes("intended")) return 4;
          return 10;
        };
        return getPri(a) - getPri(b);
      })
    : visibleSections;

  const renderFieldInstance = (
    field: FieldDto,
    fIdx: number,
    section: FormSectionDto,
    instanceSuffix: string = ""
  ) => {
    const rawTargetId = field.fieldId || field.id || `field-${fIdx}`;
    const targetId = instanceSuffix.length > 0 ? `${rawTargetId}_${instanceSuffix}` : rawTargetId;
    const fIdLower = rawTargetId.toLowerCase();
    const labelLower = (field.label || "").toLowerCase().trim();
    const rawType = (field.fieldType || field.type || "").toLowerCase();
    const secKeyLower = (section.key || section.id || "").toLowerCase();

    if (isAmateurPermitService && secKeyLower.includes("applicant") && (rawTargetId === FIELD_ID_CALL_SIGN || fIdLower === "callsign" || labelLower.includes("call sign"))) return null;
    if (isAmateurPermitService && !isVanityOrSpecialEvent && (rawTargetId === FIELD_ID_BIRTH_DATE || labelLower.includes("birth") || labelLower.includes("sex") || labelLower.includes("nationality"))) return null;
    if (isAmateurPermitService && (rawType === "signature" || rawType === "checkbox" || labelLower.includes("signature") || labelLower.includes("declare") || fIdLower.includes("signature") || fIdLower.includes("declaration"))) return null;

    const isNameField = labelLower.includes("full name") || labelLower.includes("applicant name") || fIdLower === "fullname" || rawTargetId === FIELD_ID_FULL_NAME;
    const isRepeaterField = rawType === "repeater" || rawType === "table" || fIdLower.includes("equipmentdetails");
    const isBsdField = fIdLower.includes("bsd") || labelLower.includes("bsd no");
    const isVasRegField = fIdLower.includes("vasregistration") || rawTargetId === FIELD_ID_VAS_REG_NO.toLowerCase();
    const isIntendedUseField = fIdLower.includes("intendeduse") || labelLower.includes("intended use");
    const isVasServicesField = fIdLower.includes("valueaddedservices") || labelLower.includes("value added service");
    const isSignature = rawType === "signature" || labelLower.includes("signature");
    const isCheckbox = rawType === "checkbox" || labelLower.includes("declare");
    const isDropdown = rawType === "dropdown" || rawType === "select" || fIdLower === "bandwidthunit" || fIdLower === "sex" || labelLower === "sex" || (fIdLower === "stationclass" && isAmateurPermitService);
    const isDate = rawType === "date" || labelLower.includes("date");
    const isNumber = rawType === "number" || labelLower.includes("power") || labelLower.includes("watts");
    const isContactField = labelLower.includes("contact") || labelLower.includes("mobile") || rawType === "tel";
    const isEmailField = labelLower.includes("email") || rawType === "email";

    let span: 12 | 8 | 6 | 4 | 3 = 6;
    if (
      isNameField ||
      isSignature ||
      isCheckbox ||
      isRepeaterField ||
      isBsdField ||
      isVasRegField ||
      isIntendedUseField ||
      isVasServicesField ||
      fIdLower.includes("beamwidth") ||
      labelLower.includes("beamwidth") ||
      fIdLower.includes("antennaremarks") ||
      fIdLower === "remarks" ||
      labelLower === "remarks" ||
      rawTargetId === FIELD_ID_REMARKS
    ) {
      span = 12;
    } else {
      span = 6;
    }

    let val = (values && values[targetId]) || (values && field.label && values[field.label]) || "";
    if ((labelLower === "frequency" || rawTargetId === FIELD_ID_FREQUENCY) && isAmateurPermitService && !isAmateurPurchaseVariant && !val) val = "Within Authorized Amateur Band";

    let dropdownOptions: Array<{ label: string; value: string }> = [];
    if (fIdLower === "bandwidthunit" || rawTargetId === FIELD_ID_BANDWIDTH_UNIT || labelLower === "unit") dropdownOptions = [{ label: "KHz", value: "KHz" }, { label: "MHz", value: "MHz" }, { label: "GHz", value: "GHz" }];
    else if (fIdLower === "stationclass" || labelLower.includes("station class") || rawTargetId === FIELD_ID_STATION_CLASS) dropdownOptions = [{ label: "RT", value: "RT" }, { label: "FX", value: "FX" }, { label: "FB", value: "FB" }, { label: "FX/FB", value: "FX/FB" }, { label: "ML", value: "ML" }, { label: "P", value: "P" }, { label: "Others", value: "Others" }];
    else if (fIdLower === "sex" || labelLower === "sex") dropdownOptions = [{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Other", value: "Other" }];
    else if (labelLower === "region" || fIdLower === "region" || fIdLower.includes("region")) dropdownOptions = regions.map((r: { id: string; name: string }) => ({ label: r.name, value: r.name }));
    else if (labelLower === "province" || fIdLower === "province" || fIdLower.includes("province")) dropdownOptions = provinces.map((p: { id: string; name: string }) => ({ label: p.name, value: p.name }));
    else if (labelLower.includes("city") || labelLower.includes("municipality") || fIdLower === "city" || fIdLower.includes("city") || fIdLower.includes("municipality")) dropdownOptions = municipalities.map((m: { id: string; name: string }) => ({ label: m.name, value: m.name }));
    else if (labelLower === "barangay" || fIdLower === "barangay" || fIdLower.includes("barangay")) dropdownOptions = barangays.map((b: { id: string; name: string }) => ({ label: b.name, value: b.name }));
    else dropdownOptions = parseOptions(field);

    const parentMakeTypeModel =
      (values && values["makeTypeModel"]) ||
      (values && values["make_type_model"]) ||
      (values && values[FIELD_ID_MAKE_TYPE_MODEL]) ||
      (values && values["Make / Type / Model"]) ||
      (values && values["Make/Type/Model"]) ||
      "";

    return (
      <DynamicFormField
        key={targetId} field={field} targetId={targetId} val={val} err={errors?.[targetId]} displayLabel={field.label}
        isRequired={field.isRequired ?? false} span={span} dropdownOptions={dropdownOptions} placeholder={field.placeholder || `Enter ${field.label}...`}
        isNameField={isNameField} isRepeaterField={isRepeaterField} isBsdField={isBsdField} isVasRegField={isVasRegField}
        isIntendedUseField={isIntendedUseField} isVasServicesField={isVasServicesField} isSignature={isSignature} isCheckbox={isCheckbox}
        isDropdown={isDropdown} isDate={isDate} isNumber={isNumber} isContactField={isContactField} isEmailField={isEmailField}
        isNonIndividualEntity={isNonIndividualEntity} isAmateurPermitService={isAmateurPermitService} isIndividualVar={isIndividualVar}
        isForeignVisitor={isForeignVisitor} isVanityOrSpecialEvent={isVanityOrSpecialEvent}
        structuredNameData={structuredNameData} applicantName={applicantName} isBulk={isBulk} appMode={appMode}
        parentMakeTypeModel={parentMakeTypeModel}
        onChange={onChange} onStructuredNameChange={onStructuredNameChange}
        onDropdownChange={(v) => {
          onChange(targetId, field.label, v);
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

  const handleAddStationParticular = () => {
    setStationParticularsCount((prev) => Math.min(prev + 1, 10));
  };

  const handleRemoveStationParticular = (removeIdx: number) => {
    if (stationParticularsCount <= 1) return;
    setStationParticularsCount((prev) => prev - 1);
  };

  return (
    <View style={styles.container}>
      {showApplicationTypeSection && (
        <DynamicFormSection1
          serviceCategory={serviceCategory} serviceTitle={serviceTitle} selectedVariantId={selectedVariantId}
          variants={variants} variantElements={variantElements} selectedElementId={selectedElementId} noOfYears={noOfYears}
          showElements={showElements} showNumberOfYears={showNumberOfYears} isVas={isVas} isAmateurCert={isAmateurCert}
          isModification={isModification} isLifetimeSupplementary={isLifetimeSupplementary} isRenewalOrMod={isRenewalOrMod}
          isRenewal={isRenewal} isVanityNew={isVanityNew} isVanityRen={isVanityRen} isSpecialEvent={isSpecialEvent}
          values={values} onVariantChange={onVariantChange} onElementChange={onElementChange} onNoOfYearsChange={onNoOfYearsChange} onChange={onChange}
        />
      )}

      {sortedSections.map((section, sIdx) => {
        const sectionDisplayNum = (showApplicationTypeSection ? 1 : 0) + sIdx + 1;
        const rawFields = section.fields || [];
        const sectionFields = [...rawFields].sort((a, b) => getFieldSortPriority(a, rawFields.indexOf(a)) - getFieldSortPriority(b, rawFields.indexOf(b)));
        const secKeyLower = (section.key || section.id || "").toLowerCase();
        const secTitleLower = (section.title || "").toLowerCase();

        if (isVanityOrSpecialEvent && secKeyLower.includes("applicant")) {
          const vanityApplicantFields: FieldDto[] = [
            { fieldId: "fullName", id: "fullName", label: "Full Name", fieldType: "text", isRequired: true },
            { fieldId: "dateOfBirth", id: "dateOfBirth", label: "Date of Birth", fieldType: "date", isRequired: true },
            { fieldId: "sex", id: "sex", label: "Sex", fieldType: "dropdown", isRequired: true, options: ["Male", "Female", "Other"] },
            { fieldId: "nationality", id: "nationality", label: "Nationality", fieldType: "text", isRequired: true, placeholder: "e.g. Filipino" },
            { fieldId: "region", id: "region", label: "Region", fieldType: "dropdown", isRequired: true },
            { fieldId: "province", id: "province", label: "Province", fieldType: "dropdown", isRequired: true },
            { fieldId: "city", id: "city", label: "City / Municipality", fieldType: "dropdown", isRequired: true },
            { fieldId: "barangay", id: "barangay", label: "Barangay", fieldType: "dropdown", isRequired: true },
            { fieldId: "street", id: "street", label: "Street / Building Address", fieldType: "text", isRequired: true },
            { fieldId: "zipCode", id: "zipCode", label: "Zip Code", fieldType: "text", isRequired: true },
            { fieldId: "contactNo", id: "contactNo", label: "Contact Number", fieldType: "tel", isRequired: true },
            { fieldId: "email", id: "email", label: "Email Address", fieldType: "email", isRequired: true },
          ];
          const renderedVanityApplicant = vanityApplicantFields.map((f, idx) => renderFieldInstance(f, idx, section)).filter(Boolean);
          return (
            <View key={section.id || section.key || `section-${sIdx}`} style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.iconCircle}><Text style={styles.iconCircleText}>{sectionDisplayNum}</Text></View>
                  <Text style={styles.sectionTitle}>Applicant Details</Text>
                </View>
                <View style={styles.sectionBadge}><Text style={styles.sectionBadgeText}>SECTION {sectionDisplayNum}</Text></View>
              </View>
              <FormGrid>{renderedVanityApplicant}</FormGrid>
            </View>
          );
        }

        const isStationEquipmentSection =
          secKeyLower.includes("stationequipment") ||
          secKeyLower.includes("proposedstation") ||
          secKeyLower.includes("particulars") ||
          (secTitleLower.includes("station") && secTitleLower.includes("equipment")) ||
          secTitleLower.includes("particulars");

        if (isStationEquipmentSection) {
          if (isAmateurPurchaseVariant) {
            const purchaseCallSignField: FieldDto = {
              fieldId: FIELD_ID_CALL_SIGN,
              id: "callSign",
              label: "Call Sign",
              fieldType: "text",
              isRequired: false,
              placeholder: "Enter Call Sign...",
            };

            const purchaseFrequenciesField: FieldDto = {
              fieldId: FIELD_ID_FREQUENCY,
              id: "frequency",
              label: "Frequency(ies)",
              fieldType: "text",
              isRequired: true,
              placeholder: "e.g. 144.0-146.0 MHz, 430.0-440.0 MHz",
            };

            const purchaseParticularsField: FieldDto = {
              fieldId: "particulars",
              id: "particulars",
              label: "Particulars",
              fieldType: "repeater",
              isRequired: true,
            };

            const renderedCallSign = renderFieldInstance(purchaseCallSignField, 0, section);
            const renderedFrequencies = renderFieldInstance(purchaseFrequenciesField, 1, section);
            const renderedParticulars = renderFieldInstance(purchaseParticularsField, 2, section);

            return (
              <View key={section.id || section.key || `section-${sIdx}`} style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.iconCircle}><Text style={styles.iconCircleText}>{sectionDisplayNum}</Text></View>
                    <Text style={styles.sectionTitle}>{getSectionTitle(section, isAmateurPermitService, isAmateurPurchaseVariant, isVanityOrSpecialEvent, isForeignVisitor)}</Text>
                  </View>
                  <View style={styles.sectionBadge}><Text style={styles.sectionBadgeText}>SECTION {sectionDisplayNum}</Text></View>
                </View>

                <FormGrid>
                  {renderedCallSign}
                  {renderedFrequencies}
                  {renderedParticulars}
                </FormGrid>
              </View>
            );
          }

          if (isVanityOrSpecialEvent) {
            const vanityEquipmentField: FieldDto = {
              fieldId: "equipmentDetails",
              id: "equipmentDetails",
              label: "Particulars of Proposed Equipment",
              fieldType: "repeater",
              isRequired: true,
            };
            const renderedVanityEq = renderFieldInstance(vanityEquipmentField, 0, section);
            return (
              <View key={section.id || section.key || `section-${sIdx}`} style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.iconCircle}><Text style={styles.iconCircleText}>{sectionDisplayNum}</Text></View>
                    <Text style={styles.sectionTitle}>Particulars</Text>
                  </View>
                  <View style={styles.sectionBadge}><Text style={styles.sectionBadgeText}>SECTION {sectionDisplayNum}</Text></View>
                </View>
                <FormGrid>{renderedVanityEq}</FormGrid>
              </View>
            );
          }

          const canonicalPermitStationFields: FieldDto[] = [
            {
              fieldId: FIELD_ID_CALL_SIGN,
              id: "callSign",
              label: "Call Sign",
              fieldType: "text",
              isRequired: false,
              placeholder: "Enter Call Sign...",
            },
            {
              fieldId: FIELD_ID_SERVICE_AREA,
              id: "serviceArea",
              label: "Points of Comm/Service Area (optional)",
              fieldType: "text",
              isRequired: false,
              placeholder: "Enter Points of Comm / Service Area...",
            },
            {
              fieldId: FIELD_ID_FREQUENCY,
              id: "frequency",
              label: "Frequency: Within Authorized Amateur Band",
              fieldType: "text",
              isRequired: true,
              placeholder: "Within Authorized Amateur Band",
            },
            {
              fieldId: FIELD_ID_BANDWIDTH,
              id: "bandwidth",
              label: "Bandwidth",
              fieldType: "text",
              isRequired: true,
              placeholder: "e.g. 25",
            },
            {
              fieldId: FIELD_ID_BANDWIDTH_UNIT,
              id: "bandwidthUnit",
              label: "Unit",
              fieldType: "dropdown",
              isRequired: true,
              options: ["KHz", "MHz", "GHz"],
            },
            {
              fieldId: FIELD_ID_EMISSION,
              id: "emission",
              label: "Emission",
              fieldType: "text",
              isRequired: true,
              placeholder: "e.g. 16K0F3E",
            },
            {
              fieldId: FIELD_ID_POWER_OUTPUT,
              id: "powerOutput",
              label: "Power Output (watts)",
              fieldType: "text",
              isRequired: true,
              placeholder: "e.g. 25",
            },
            {
              fieldId: FIELD_ID_HOURS_OP,
              id: "hoursOfOperation",
              label: "Hours of Operation",
              fieldType: "text",
              isRequired: false,
              placeholder: "e.g. 24/7 or 0800-1700",
            },
            {
              fieldId: FIELD_ID_STATION_CLASS,
              id: "stationClass",
              label: "Class of Station",
              fieldType: "dropdown",
              isRequired: true,
              options: ["RT", "FX", "FB", "FX/FB", "ML", "P", "Others"],
            },
            {
              fieldId: "exactLocation",
              id: "exactLocation",
              label: "Exact Location",
              fieldType: "text",
              isRequired: true,
              placeholder: "Enter Exact Station Location...",
            },
            {
              fieldId: "longitude",
              id: "longitude",
              label: "Longitude (deg-min-sec)",
              fieldType: "text",
              isRequired: false,
              placeholder: `e.g. 121°03'22"E`,
            },
            {
              fieldId: "latitude",
              id: "latitude",
              label: "Latitude (deg-min-sec)",
              fieldType: "text",
              isRequired: false,
              placeholder: `e.g. 14°38'31"N`,
            },
            {
              fieldId: "configuration",
              id: "configuration",
              label: "Configuration",
              fieldType: "text",
              isRequired: false,
              placeholder: "Enter Configuration...",
            },
            {
              fieldId: "dataRate",
              id: "dataRate",
              label: "Data Rate",
              fieldType: "text",
              isRequired: false,
              placeholder: "e.g. 9600 bps",
            },
            {
              fieldId: FIELD_ID_REMARKS,
              id: "remarks",
              label: "Remarks",
              fieldType: "text",
              isRequired: false,
              placeholder: "Enter Remarks...",
            },
            {
              fieldId: "equipmentDetails",
              id: "equipmentDetails",
              label: "Particulars of Proposed Equipment",
              fieldType: "repeater",
              isRequired: true,
            },
          ];

          if (isForeignVisitor) {
            const foreignTopLevelFields: FieldDto[] = [
              canonicalPermitStationFields[1], // Points of Comm / Service Area
              canonicalPermitStationFields[2], // Frequency
              canonicalPermitStationFields[3], // Bandwidth
              canonicalPermitStationFields[4], // Unit
              canonicalPermitStationFields[5], // Emission
              canonicalPermitStationFields[6], // Power Output
              canonicalPermitStationFields[7], // Hours of Operation
            ];

            const foreignStationFields: FieldDto[] = [
              canonicalPermitStationFields[8],  // Class of Station
              canonicalPermitStationFields[9],  // Exact Location
              canonicalPermitStationFields[10], // Longitude
              canonicalPermitStationFields[11], // Latitude
              canonicalPermitStationFields[12], // Configuration
              canonicalPermitStationFields[13], // Data Rate
              canonicalPermitStationFields[14], // Remarks
              canonicalPermitStationFields[15], // Particulars of Proposed Equipment
            ];

            const renderedForeignTop = foreignTopLevelFields
              .map((field, fIdx) => renderFieldInstance(field, fIdx, section))
              .filter(Boolean);

            return (
              <View key={section.id || section.key || `section-${sIdx}`} style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.iconCircle}><Text style={styles.iconCircleText}>{sectionDisplayNum}</Text></View>
                    <Text style={styles.sectionTitle}>Particulars of Equipment</Text>
                  </View>
                  <View style={styles.sectionBadge}><Text style={styles.sectionBadgeText}>SECTION {sectionDisplayNum}</Text></View>
                </View>

                {/* 1. Top-Level General Operating Fields */}
                {renderedForeignTop.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <FormGrid>{renderedForeignTop}</FormGrid>
                  </View>
                )}

                {/* 2. Station Particulars Repeater */}
                {Array.from({ length: stationParticularsCount }).map((_, stationIdx) => {
                  const instanceSuffix = stationIdx === 0 ? "" : `station_${stationIdx}`;
                  const renderedStationFields = foreignStationFields.map((field, fIdx) =>
                    renderFieldInstance(field, fIdx, section, instanceSuffix)
                  ).filter(Boolean);

                  return (
                    <View
                      key={`station-particular-${stationIdx}`}
                      style={styles.stationParticularCard}
                    >
                      <View style={styles.stationParticularHeader}>
                        <View style={styles.stationParticularPill}>
                          <Text style={styles.stationParticularPillText}>
                            Station Particular #{stationIdx + 1}
                          </Text>
                        </View>
                        {stationIdx > 0 && (
                          <TouchableOpacity
                            onPress={() => handleRemoveStationParticular(stationIdx)}
                            style={styles.removeStationBtn}
                            activeOpacity={0.7}
                          >
                            <Icon name="trash-2" size={13} color="#DC2626" />
                            <Text style={styles.removeStationBtnText}>Remove Station</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <FormGrid>{renderedStationFields}</FormGrid>
                    </View>
                  );
                })}

                <TouchableOpacity
                  onPress={handleAddStationParticular}
                  style={styles.addStationBtn}
                  activeOpacity={0.8}
                >
                  <Icon name="plus" size={15} color="#1D4ED8" />
                  <Text style={styles.addStationBtnText}>Add Another Station Particular</Text>
                </TouchableOpacity>
              </View>
            );
          }

          const isPermitService =
            catLower.includes("permit") ||
            titLower.includes("permit") ||
            varDesc.includes("permit") ||
            isAmateurPermitService;

          const topLevelFields: FieldDto[] = isPermitService
            ? [
                canonicalPermitStationFields[0], // Call Sign
                canonicalPermitStationFields[1], // Points of Comm / Service Area
                canonicalPermitStationFields[2], // Frequency
                canonicalPermitStationFields[3], // Bandwidth
                canonicalPermitStationFields[4], // Unit
                canonicalPermitStationFields[5], // Emission
                canonicalPermitStationFields[6], // Power Output
                canonicalPermitStationFields[7], // Hours of Operation
              ]
            : sectionFields.filter((f) => {
                const rawId = (f.fieldId || f.id || "").toLowerCase();
                const lbl = (f.label || "").toLowerCase();
                return (
                  rawId.includes("callsign") ||
                  lbl.includes("call sign") ||
                  rawId.includes("servicearea") ||
                  lbl.includes("service area") ||
                  lbl.includes("points of comm") ||
                  rawId.includes("frequency") ||
                  lbl.includes("frequency") ||
                  rawId.includes("bandwidth") ||
                  lbl.includes("bandwidth") ||
                  rawId.includes("emission") ||
                  lbl.includes("emission") ||
                  rawId.includes("poweroutput") ||
                  lbl.includes("power output") ||
                  rawId.includes("hoursofoperation") ||
                  lbl.includes("hours of operation")
                );
              });

          const stationParticularFields: FieldDto[] = isPermitService
            ? [
                canonicalPermitStationFields[8],  // Class of Station
                canonicalPermitStationFields[9],  // Exact Location
                canonicalPermitStationFields[10], // Longitude
                canonicalPermitStationFields[11], // Latitude
                canonicalPermitStationFields[12], // Configuration
                canonicalPermitStationFields[13], // Data Rate
                canonicalPermitStationFields[14], // Remarks
                canonicalPermitStationFields[15], // Particulars of Proposed Equipment
              ]
            : sectionFields.filter((f) => !topLevelFields.some((tl) => (tl.fieldId || tl.id) === (f.fieldId || f.id)));

          const findSeededField = (idMatch: string, fallback: FieldDto): FieldDto => {
            const match = sectionFields.find((f) => {
              const fId = (f.fieldId || f.id || "").toLowerCase();
              return fId === idMatch.toLowerCase() || (f.label || "").toLowerCase().includes(idMatch.toLowerCase());
            });
            return match
              ? {
                  ...fallback,
                  fieldId: match.fieldId || match.id || fallback.fieldId,
                  id: match.id || match.fieldId || fallback.id,
                  isRequired: match.isRequired ?? fallback.isRequired,
                }
              : fallback;
          };

          const antennaParticularFields: FieldDto[] = [
            findSeededField("antennaType", {
              fieldId: "antennaType",
              id: "antennaType",
              label: "Type",
              fieldType: "text",
              isRequired: false,
              placeholder: "e.g. Yagi, Omni, Dipole",
            }),
            findSeededField("height", {
              fieldId: "height",
              id: "height",
              label: "Height",
              fieldType: "text",
              isRequired: false,
              placeholder: "e.g. 1500 cm / 15m",
            }),
            findSeededField("gain", {
              fieldId: "gain",
              id: "gain",
              label: "Gain",
              fieldType: "text",
              isRequired: false,
              placeholder: "e.g. 12 dB / 9 dBi",
            }),
            findSeededField("directivity", {
              fieldId: "directivity",
              id: "directivity",
              label: "Directivity",
              fieldType: "text",
              isRequired: false,
              placeholder: "e.g. Directional, Omni",
            }),
            findSeededField("diameter", {
              fieldId: "diameter",
              id: "diameter",
              label: "Diameter",
              fieldType: "text",
              isRequired: false,
              placeholder: "e.g. 1.2m, N/A",
            }),
            findSeededField("polarization", {
              fieldId: "polarization",
              id: "polarization",
              label: "Polarization",
              fieldType: "text",
              isRequired: false,
              placeholder: "e.g. Vertical, Horizontal",
            }),
            findSeededField("beamwidth", {
              fieldId: "beamwidth",
              id: "beamwidth",
              label: "Beamwidth",
              fieldType: "text",
              isRequired: false,
              placeholder: "e.g. 60 deg",
            }),
            findSeededField("antennaRemarks", {
              fieldId: "antennaRemarks",
              id: "antennaRemarks",
              label: "Remarks",
              fieldType: "text",
              isRequired: false,
              placeholder: "e.g. Mast mounted",
            }),
          ];

          const renderedTopLevel = topLevelFields
            .map((field, fIdx) => renderFieldInstance(field, fIdx, section))
            .filter(Boolean);

          return (
            <View key={section.id || section.key || `section-${sIdx}`} style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.iconCircle}><Text style={styles.iconCircleText}>{sectionDisplayNum}</Text></View>
                  <Text style={styles.sectionTitle}>{getSectionTitle(section, isAmateurPermitService, isAmateurPurchaseVariant, isVanityOrSpecialEvent, isForeignVisitor, isAmateurSellTransfer)}</Text>
                </View>
                <View style={styles.sectionBadge}><Text style={styles.sectionBadgeText}>SECTION {sectionDisplayNum}</Text></View>
              </View>

              {/* 1. Top-Level General Operating Fields (Entered Once) */}
              {renderedTopLevel.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <FormGrid>{renderedTopLevel}</FormGrid>
                </View>
              )}

              {/* 2. Station Particulars Repeater */}
              {Array.from({ length: stationParticularsCount }).map((_, stationIdx) => {
                const instanceSuffix = stationIdx === 0 ? "" : `station_${stationIdx}`;
                const renderedStationFields = stationParticularFields.map((field, fIdx) =>
                  renderFieldInstance(field, fIdx, section, instanceSuffix)
                ).filter(Boolean);

                const renderedAntennaFields = antennaParticularFields.map((field, fIdx) =>
                  renderFieldInstance(field, fIdx, section, instanceSuffix)
                ).filter(Boolean);

                return (
                  <View
                    key={`station-particular-${stationIdx}`}
                    style={styles.stationParticularCard}
                  >
                    <View style={styles.stationParticularHeader}>
                      <View style={styles.stationParticularPill}>
                        <Text style={styles.stationParticularPillText}>
                          Station Particular #{stationIdx + 1}
                        </Text>
                      </View>
                      {stationIdx > 0 && (
                        <TouchableOpacity
                          onPress={() => handleRemoveStationParticular(stationIdx)}
                          style={styles.removeStationBtn}
                          activeOpacity={0.7}
                        >
                          <Icon name="trash-2" size={13} color="#DC2626" />
                          <Text style={styles.removeStationBtnText}>Remove Station</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <FormGrid>{renderedStationFields}</FormGrid>
                    {isAmateurSellTransfer && (
                      <View style={styles.subSectionBox}>
                        <Text style={styles.subSectionTitle}>Particulars of Antenna</Text>
                        <FormGrid>{renderedAntennaFields}</FormGrid>
                      </View>
                    )}
                  </View>
                );
              })}

              <TouchableOpacity
                onPress={handleAddStationParticular}
                style={styles.addStationBtn}
                activeOpacity={0.8}
              >
                <Icon name="plus" size={15} color="#1D4ED8" />
                <Text style={styles.addStationBtnText}>Add Another Station Particular</Text>
              </TouchableOpacity>
            </View>
          );
        }

        const renderedFields = sectionFields.map((field, fIdx) =>
          renderFieldInstance(field, fIdx, section)
        ).filter(Boolean);

        return (
          <View key={section.id || section.key || `section-${sIdx}`} style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.iconCircle}><Text style={styles.iconCircleText}>{sectionDisplayNum}</Text></View>
                <Text style={styles.sectionTitle}>{getSectionTitle(section, isAmateurPermitService, isAmateurPurchaseVariant, isVanityOrSpecialEvent, isForeignVisitor, isAmateurSellTransfer)}</Text>
              </View>
              <View style={styles.sectionBadge}><Text style={styles.sectionBadgeText}>SECTION {sectionDisplayNum}</Text></View>
            </View>
            <FormGrid>{renderedFields}</FormGrid>
          </View>
        );
      })}
    </View>
  );
};
