import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY } from "@edge/ui";
import { FormGrid } from "./FormGrid";
import { DynamicFormField } from "./dynamic-form/DynamicFormField";
import { DynamicFormSection1 } from "./dynamic-form/DynamicFormSection1";
import { DynamicFormRendererProps, FormSectionDto } from "./dynamic-form/dynamicFormTypes";
import { getFieldSortPriority, getSectionTitle, parseOptions } from "./dynamic-form/dynamicFormUtils";
import { useCertificateServicesQuery } from "./dynamic-form/useCertificateServicesQuery";
import { useLocationData } from "./dynamic-form/useLocationData";
import {
  FIELD_ID_FULL_NAME,
  FIELD_ID_BIRTH_DATE,
  FIELD_ID_CALL_SIGN,
  FIELD_ID_FREQUENCY,
  FIELD_ID_BANDWIDTH,
  FIELD_ID_BANDWIDTH_UNIT,
  FIELD_ID_VAS_REG_NO,
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
  const [, setSelectedMunicipalityId] = useState<string | undefined>();

  const { regions, provinces, municipalities, barangays } =
    useLocationData(selectedRegionId, selectedProvinceId);

  useCertificateServicesQuery();

  const catLower = (serviceCategory || "").toLowerCase();
  const titLower = (serviceTitle || "").toLowerCase();
  const matchedVariant = variants.find((v) => String(v.id) === String(selectedVariantId));
  const varDesc = (matchedVariant?.description || matchedVariant?.name || matchedVariant?.type || "").toLowerCase();

  const isVas = catLower.includes("certificate") && (titLower.includes("value-added") || titLower.includes("vas") || varDesc.includes("vas") || varDesc.includes("value-added"));
  const isDuplicateCopy = varDesc.includes("duplicate");
  const isCertifiedTrueCopy = varDesc.includes("certified true copy") || varDesc.includes("true copy");
  const isCopyOfCert = (catLower.includes("certificate") || catLower.includes("permit")) && (titLower.includes("copy") || titLower.includes("ntc 1-21") || titLower.includes("ntc_1_21") || isDuplicateCopy || isCertifiedTrueCopy);
  const isAmateurPermitService = catLower.includes("permit") && (titLower.includes("amateur") || titLower.includes("ntc 1-09") || titLower.includes("ntc_1_09") || varDesc.includes("amateur"));
  const isAmateurCert = catLower.includes("certificate") && (titLower.includes("amateur") || titLower.includes("ntc 1-03") || titLower.includes("ntc_1_03"));
  const isCpeAccreditation = catLower.includes("accreditation") && (titLower.includes("customer premises") || titLower.includes("cpe"));
  const isRocService = catLower.includes("certificate") && (titLower.includes("radio operator certificates (roc)") || titLower.includes("ntc 1-02"));
  const isModification = varDesc.includes("modification");
  const isRenewal = varDesc.includes("renewal");
  const isRenewalOrMod = isRenewal || isModification;
  const isLifetimeSupplementary = varDesc.includes("lifetime amateur radio station supplementary");
  const isVanityNew = varDesc.includes("special permit for use of vanity call sign (new)");
  const isVanityRen = varDesc.includes("special permit for use of vanity call sign (renewal)");
  const isSpecialEvent = varDesc.includes("special event call sign");
  const isForeignVisitor = varDesc.includes("foreign visitor");
  const isNonIndividualEntity = applicantType === "company" || (!applicantType && matchedVariant?.isIndividual === false);
  const isIndividualVar = !isNonIndividualEntity;
  const showElements = !isCopyOfCert && variantElements.length > 0 && !isLifetimeSupplementary && !varDesc.includes("special radio operator");
  const showNumberOfYears = !isDuplicateCopy && !isCertifiedTrueCopy && !isVas && (isCpeAccreditation || isRocService || (isAmateurCert && isModification) || (isAmateurPermitService && (isForeignVisitor || isVanityNew || isVanityRen || isSpecialEvent)));

  const sections = form?.sections || [];
  const visibleSections = sections.filter((sec) => {
    if (!sec) return false;
    const k = (sec.key || sec.id || "").toLowerCase();
    const t = (sec.title || "").toLowerCase();
    if (k.includes("type") || t.includes("application type")) return false;
    if (hideSections.includes(k) || hideSections.includes(t)) return false;
    if (isAmateurPermitService) {
      return k === "applicant" || t.includes("applicant") || k === "stationequipment" || k === "proposedstation" || t.includes("station") || k === "particulars" || k === "sourceofequipment" || t.includes("source") || k === "intendeduse" || t.includes("intended");
    }
    return !k.includes("declaration") && !t.includes("declaration") && !k.includes("payment") && !t.includes("payment") && !k.includes("classification") && !t.includes("classification");
  });

  const sortedSections = isAmateurPermitService
    ? [...visibleSections].sort((a, b) => {
        const getPri = (s: FormSectionDto) => {
          const k = (s.key || s.id || "").toLowerCase();
          const t = (s.title || "").toLowerCase();
          if (k === "applicant" || t.includes("applicant")) return 1;
          if (k === "stationequipment" || k === "proposedstation" || t.includes("station")) return 2;
          if (k === "particulars" || t.includes("particulars")) return 3;
          if (k === "sourceofequipment" || t.includes("source")) return 4;
          if (k === "intendeduse" || t.includes("intended")) return 5;
          return 10;
        };
        return getPri(a) - getPri(b);
      })
    : visibleSections;

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

        const renderedFields = sectionFields.map((field, fIdx) => {
          const targetId = field.fieldId || field.id || `field-${fIdx}`;
          const fIdLower = targetId.toLowerCase();
          const labelLower = (field.label || "").toLowerCase().trim();
          const rawType = (field.fieldType || field.type || "").toLowerCase();
          const secKeyLower = (section.key || section.id || "").toLowerCase();

          if (isAmateurPermitService && secKeyLower.includes("applicant") && (targetId === FIELD_ID_CALL_SIGN || fIdLower === "callsign" || labelLower.includes("call sign"))) return null;
          if (isAmateurPermitService && (secKeyLower.includes("particulars") || section.title.toLowerCase().includes("particulars")) && (targetId === FIELD_ID_CALL_SIGN || fIdLower === "callsign" || labelLower === "frequency" || targetId === FIELD_ID_FREQUENCY || fIdLower === "frequency")) return null;
          if (isAmateurPermitService && (targetId === FIELD_ID_BIRTH_DATE || labelLower.includes("birth") || labelLower.includes("sex") || labelLower.includes("nationality"))) return null;

          const isNameField = labelLower.includes("full name") || labelLower.includes("applicant name") || fIdLower === "fullname" || targetId === FIELD_ID_FULL_NAME;
          const isRepeaterField = rawType === "repeater" || rawType === "table" || fIdLower.includes("equipmentdetails");
          const isBsdField = fIdLower.includes("bsd") || labelLower.includes("bsd no");
          const isVasRegField = fIdLower.includes("vasregistration") || targetId === FIELD_ID_VAS_REG_NO.toLowerCase();
          const isIntendedUseField = fIdLower.includes("intendeduse") || labelLower.includes("intended use");
          const isVasServicesField = fIdLower.includes("valueaddedservices") || labelLower.includes("value added service");
          const isSignature = rawType === "signature" || labelLower.includes("signature");
          const isCheckbox = rawType === "checkbox" || labelLower.includes("declare");
          const isDropdown = rawType === "dropdown" || rawType === "select" || fIdLower === "bandwidthunit" || (fIdLower === "stationclass" && isAmateurPermitService);
          const isDate = rawType === "date" || labelLower.includes("date");
          const isNumber = rawType === "number" || labelLower.includes("power") || labelLower.includes("watts");
          const isContactField = labelLower.includes("contact") || labelLower.includes("mobile") || rawType === "tel";
          const isEmailField = labelLower.includes("email") || rawType === "email";

          let span: 12 | 8 | 6 | 4 | 3 = (isNameField || isSignature || isCheckbox || isRepeaterField || isBsdField || isVasRegField || isIntendedUseField || isVasServicesField) ? 12 : 6;
          if (fIdLower === "bandwidth" || fIdLower === "bandwidthunit" || targetId === FIELD_ID_BANDWIDTH || targetId === FIELD_ID_BANDWIDTH_UNIT) span = 3;
          else if (fIdLower === "emission" || fIdLower === "poweroutput" || fIdLower === "hoursofoperation" || fIdLower === "configuration" || fIdLower === "datarate" || fIdLower === "remarks" || (fIdLower === "stationclass" && isAmateurPermitService)) span = 4;
          else if (fIdLower === "exactlocation" || labelLower === "exact location") span = 8;

          let val = (values && values[targetId]) || (values && field.label && values[field.label]) || "";
          if ((labelLower === "frequency" || targetId === FIELD_ID_FREQUENCY) && isAmateurPermitService && !val) val = "Within Authorized Amateur Band";

          let dropdownOptions: Array<{ label: string; value: string }> = [];
          if (fIdLower === "bandwidthunit" || targetId === FIELD_ID_BANDWIDTH_UNIT) dropdownOptions = [{ label: "KHz", value: "KHz" }, { label: "MHz", value: "MHz" }, { label: "GHz", value: "GHz" }];
          else if (fIdLower === "stationclass" && isAmateurPermitService) dropdownOptions = [{ label: "RT", value: "RT" }, { label: "FX", value: "FX" }, { label: "FB", value: "FB" }, { label: "FX/FB", value: "FX/FB" }, { label: "ML", value: "ML" }, { label: "P", value: "P" }, { label: "Others", value: "Others" }];
          else if (labelLower === "region") dropdownOptions = regions.map((r: { id: string; name: string }) => ({ label: r.name, value: r.name }));
          else if (labelLower === "province") dropdownOptions = provinces.map((p: { id: string; name: string }) => ({ label: p.name, value: p.name }));
          else if (labelLower.includes("city") || labelLower.includes("municipality")) dropdownOptions = municipalities.map((m: { id: string; name: string }) => ({ label: m.name, value: m.name }));
          else if (labelLower === "barangay") dropdownOptions = barangays.map((b: { id: string; name: string }) => ({ label: b.name, value: b.name }));
          else dropdownOptions = parseOptions(field);

          return (
            <DynamicFormField
              key={targetId} field={field} targetId={targetId} val={val} err={errors?.[targetId]} displayLabel={field.label}
              isRequired={field.isRequired ?? false} span={span} dropdownOptions={dropdownOptions} placeholder={field.placeholder || `Enter ${field.label}...`}
              isNameField={isNameField} isRepeaterField={isRepeaterField} isBsdField={isBsdField} isVasRegField={isVasRegField}
              isIntendedUseField={isIntendedUseField} isVasServicesField={isVasServicesField} isSignature={isSignature} isCheckbox={isCheckbox}
              isDropdown={isDropdown} isDate={isDate} isNumber={isNumber} isContactField={isContactField} isEmailField={isEmailField}
              isNonIndividualEntity={isNonIndividualEntity} isAmateurPermitService={isAmateurPermitService} isIndividualVar={isIndividualVar}
              structuredNameData={structuredNameData} applicantName={applicantName} isBulk={isBulk} appMode={appMode}
              onChange={onChange} onStructuredNameChange={onStructuredNameChange}
              onDropdownChange={(v) => {
                onChange(targetId, field.label, v);
                if (labelLower === "region") setSelectedRegionId(regions.find((r: { id: string; name: string }) => r.name.toLowerCase() === v.toLowerCase())?.id);
                else if (labelLower === "province") setSelectedProvinceId(provinces.find((p: { id: string; name: string }) => p.name.toLowerCase() === v.toLowerCase())?.id);
                else if (labelLower.includes("city") || labelLower.includes("municipality")) setSelectedMunicipalityId(municipalities.find((m: { id: string; name: string }) => m.name.toLowerCase() === v.toLowerCase())?.id);
              }}
            />
          );
        }).filter(Boolean);

        return (
          <View key={section.id || section.key || `section-${sIdx}`} style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.iconCircle}><Text style={styles.iconCircleText}>{sectionDisplayNum}</Text></View>
                <Text style={styles.sectionTitle}>{getSectionTitle(section, isAmateurPermitService)}</Text>
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

const styles = StyleSheet.create({
  container: { width: "100%", gap: 4 },
  sectionCard: { backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", padding: 24, marginBottom: 20, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  iconCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#1E3A8A", alignItems: "center", justifyContent: "center" },
  iconCircleText: { fontFamily: TYPOGRAPHY.fonts.primary, color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  sectionTitle: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: "700", color: "#0F172A", letterSpacing: -0.2 },
  sectionBadge: { backgroundColor: "#F1F5F9", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  sectionBadgeText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10.5, fontWeight: "700", color: "#475569", letterSpacing: 0.5 },
});
