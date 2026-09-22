import React, { useState } from "react";
import { View } from "react-native";
import { DynamicFormField } from "./dynamic-form/DynamicFormField";
import { DynamicFormSection1 } from "./dynamic-form/DynamicFormSection1";
import { DynamicFormRendererProps, FormSectionDto, FieldDto } from "./dynamic-form/dynamicFormTypes";
import { getFieldSortPriority, parseOptions, buildFormVariantFlags } from "./dynamic-form/dynamicFormUtils";
import { useCertificateServicesQuery } from "./dynamic-form/useCertificateServicesQuery";
import { useLocationData } from "./dynamic-form/useLocationData";
import { dynamicFormStyles as styles } from "./dynamic-form/DynamicFormRenderer.styles";
import {
  VanitySpecialApplicantSection,
  AeroStationPossessSection,
  AeroStationPurchaseSection,
  AmateurPurchaseSection,
  VanityEquipmentSection,
  ForeignVisitorStationSection,
  PermitStationEquipmentSection,
  DefaultDynamicSection,
} from "./dynamic-form/sections";
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

  const flags = buildFormVariantFlags(
    serviceCategory,
    serviceTitle,
    selectedVariantId,
    variants,
    variantElements,
    applicantType
  );

  const {
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
    isVanityNew,
    isVanityRen,
    isSpecialEvent,
    isForeignVisitor,
    isVanityOrSpecialEvent,
    isNonIndividualEntity,
    isIndividualVar,
    showElements,
    showNumberOfYears,
  } = flags;

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
    const k = (sec.key || sec.id || "").trim().toLowerCase();
    const t = (sec.title || "").trim().toLowerCase();
    if (k.includes("type") || t.includes("application type")) return false;
    if (hideSections.includes(k) || hideSections.includes(t)) return false;
    if (isAmateurPermitService || isAeroStationPurchase || isAeroStationPossess) {
      if ((isAmateurPurchaseVariant || isAeroStationPurchase) && (k === "sourceofequipment" || t.includes("source"))) return false;
      if (isVanityOrSpecialEvent && (k === "sourceofequipment" || t.includes("source") || k === "intendeduse" || t.includes("intended"))) return false;
      return k === "applicant" || t.includes("applicant") || k === "stationequipment" || k === "proposedstation" || k === "particulars" || t.includes("station") || t.includes("particular") || k === "sourceofequipment" || t.includes("source") || k === "intendeduse" || t.includes("intended");
    }
    return !k.includes("declaration") && !t.includes("declaration") && !k.includes("payment") && !t.includes("payment") && !k.includes("classification") && !t.includes("classification");
  });

  const sortedSections = (isAmateurPermitService || isAeroStationPurchase || isAeroStationPossess)
    ? [...visibleSections].sort((a, b) => {
        const getPri = (s: FormSectionDto) => {
          const k = (s.key || s.id || "").trim().toLowerCase();
          const t = (s.title || "").trim().toLowerCase();
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
    const secTitleLower = (section.title || "").toLowerCase();

    if (isAmateurPermitService && secKeyLower.includes("applicant") && (rawTargetId === FIELD_ID_CALL_SIGN || fIdLower === "callsign" || labelLower.includes("call sign"))) return null;
    if ((isAmateurPermitService || isNonIndividualEntity) && secKeyLower.includes("applicant") && (rawTargetId === FIELD_ID_BIRTH_DATE || fIdLower === "birthdate" || labelLower.includes("birth") || rawTargetId === "sex" || fIdLower === "sex" || labelLower === "sex" || rawTargetId === "civilstatus" || fIdLower === "civilstatus" || labelLower.includes("civil status") || rawTargetId === "nationality" || fIdLower === "nationality" || labelLower.includes("nationality") || fIdLower === "representativename")) return null;
    if (isAmateurPermitService && (rawType === "signature" || rawType === "checkbox" || labelLower.includes("signature") || labelLower.includes("declare") || fIdLower.includes("signature") || fIdLower.includes("declaration"))) return null;

    const isNameField = labelLower.includes("full name") || labelLower.includes("applicant name") || fIdLower === "fullname" || rawTargetId === FIELD_ID_FULL_NAME || fIdLower === "companyname" || fIdLower === "applicantname";
    const isRepeaterField = rawType === "repeater" || rawType === "table" || fIdLower.includes("equipmentdetails");
    const isBsdField = fIdLower.includes("bsd") || labelLower.includes("bsd no");
    const isVasRegField = fIdLower.includes("vasregistration") || rawTargetId === FIELD_ID_VAS_REG_NO.toLowerCase();
    const isIntendedUseField = fIdLower.includes("intendeduse") || labelLower.includes("intended use");
    const isVasServicesField = fIdLower.includes("valueaddedservices") || labelLower.includes("value added service");
    const isSignature = rawType === "signature" || labelLower.includes("signature");
    const isCheckbox = rawType === "checkbox" || labelLower.includes("declare");
    const isDropdown = rawType === "dropdown" || rawType === "select" || fIdLower === "bandwidthunit" || fIdLower === "sex" || labelLower === "sex" || (fIdLower === "stationclass" && (isAmateurPermitService || isAeroService));
    const isDate = rawType === "date" || labelLower.includes("date");
    const isNumber = rawType === "number" || labelLower.includes("power") || labelLower.includes("watts");
    const isContactField = labelLower.includes("contact") || labelLower.includes("mobile") || rawType === "tel";
    const isEmailField = labelLower.includes("email") || rawType === "email";

    let span: 12 | 8 | 6 | 4 | 3 = 6;
    if (
      isNameField ||
      isRepeaterField ||
      isSignature ||
      isCheckbox ||
      isBsdField ||
      isVasRegField ||
      isIntendedUseField ||
      isVasServicesField ||
      (isAeroStationPossess && fIdLower === "stationclass") ||
      (isAeroStationPossess && fIdLower === "exactlocation") ||
      fIdLower.includes("beamwidth") ||
      labelLower.includes("beamwidth") ||
      fIdLower.includes("antennaremarks") ||
      fIdLower.includes("servicearea") ||
      labelLower.includes("service area") ||
      labelLower.includes("points of comm") ||
      fIdLower === "remarks" ||
      labelLower === "remarks" ||
      rawTargetId === FIELD_ID_REMARKS
    ) {
      span = 12;
    } else {
      span = 6;
    }

    let val = instanceSuffix.length > 0
      ? (values && values[targetId]) || ""
      : (values && values[targetId]) || (values && values[rawTargetId]) || (values && field.label && values[field.label]) || "";
    if ((fIdLower === "applicantname" || fIdLower === "fullname") && !val) {
      val = (values && (values["companyName"] || values["fullName"] || values["Applicant Name"])) || (structuredNameData && (structuredNameData.companyName || structuredNameData.firstName)) || (applicantName ?? "") || "";
    } else if (fIdLower === "representativename" && !val) {
      val = (values && (values["representativeName"] || values["Authorized Representative Name"])) || (structuredNameData && structuredNameData.representativeName) || "";
    }
    if ((labelLower === "frequency" || rawTargetId === FIELD_ID_FREQUENCY) && isAmateurPermitService && !isAmateurPurchaseVariant && !val) val = "Within Authorized Amateur Band";

    let dropdownOptions: Array<{ label: string; value: string }> = [];
    if (fIdLower === "frequencyunit" || labelLower.includes("frequency unit")) dropdownOptions = [{ label: "KHz", value: "KHz" }, { label: "MHz", value: "MHz" }, { label: "GHz", value: "GHz" }];
    else if (fIdLower === "bandwidthunit" || rawTargetId === FIELD_ID_BANDWIDTH_UNIT || labelLower === "unit") dropdownOptions = [{ label: "KHz", value: "KHz" }, { label: "MHz", value: "MHz" }, { label: "GHz", value: "GHz" }];
    else if (fIdLower === "stationclass" || labelLower.includes("station class") || rawTargetId === FIELD_ID_STATION_CLASS) {
      if (isAeroService) {
        dropdownOptions = [{ label: "FA", value: "FA" }, { label: "MA", value: "MA" }];
      } else {
        dropdownOptions = [{ label: "RT", value: "RT" }, { label: "FX", value: "FX" }, { label: "FB", value: "FB" }, { label: "FX/FB", value: "FX/FB" }, { label: "ML", value: "ML" }, { label: "P", value: "P" }, { label: "Others", value: "Others" }];
      }
    }
    else if (fIdLower === "sex" || labelLower === "sex") dropdownOptions = [{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Other", value: "Other" }];
    else if (labelLower === "region" || fIdLower === "region" || fIdLower.includes("region")) dropdownOptions = regions.map((r: { id: string; name: string }) => ({ label: r.name, value: r.name }));
    else if (labelLower === "province" || fIdLower === "province" || fIdLower.includes("province")) dropdownOptions = provinces.map((p: { id: string; name: string }) => ({ label: p.name, value: p.name }));
    else if (labelLower.includes("city") || labelLower.includes("municipality") || fIdLower === "city" || fIdLower.includes("city") || fIdLower.includes("municipality")) dropdownOptions = municipalities.map((m: { id: string; name: string }) => ({ label: m.name, value: m.name }));
    else if (labelLower === "barangay" || fIdLower === "barangay" || fIdLower.includes("barangay")) dropdownOptions = barangays.map((b: { id: string; name: string }) => ({ label: b.name, value: b.name }));
    else dropdownOptions = parseOptions(field);

    const parentMakeTypeModel = instanceSuffix.length > 0
      ? (values && values[`makeTypeModel_${instanceSuffix}`]) ||
        (values && values[`make_type_model_${instanceSuffix}`]) ||
        ""
      : (values && values["makeTypeModel"]) ||
        (values && values["make_type_model"]) ||
        (values && values[FIELD_ID_MAKE_TYPE_MODEL]) ||
        (values && values["Make / Type / Model"]) ||
        (values && values["Make/Type/Model"]) ||
        "";

    const isSourceOfEquipmentSection = secKeyLower.includes("sourceofequipment") || secKeyLower.includes("source") || secTitleLower.includes("source");
    const isIntendedUseSection = secKeyLower.includes("intendeduse") || secKeyLower.includes("intended") || secTitleLower.includes("intended");
    const isFieldRequired = (isSourceOfEquipmentSection || isIntendedUseSection) ? false : (field.isRequired ?? false);

    return (
      <DynamicFormField
        key={targetId} field={field} targetId={targetId} val={val} err={errors?.[targetId]} displayLabel={field.label}
        isRequired={isFieldRequired} span={span} dropdownOptions={dropdownOptions} placeholder={field.placeholder || `Enter ${field.label}...`}
        isNameField={isNameField} isRepeaterField={isRepeaterField} isBsdField={isBsdField} isVasRegField={isVasRegField}
        isIntendedUseField={isIntendedUseField} isVasServicesField={isVasServicesField} isSignature={isSignature} isCheckbox={isCheckbox}
        isDropdown={isDropdown} isDate={isDate} isNumber={isNumber} isContactField={isContactField} isEmailField={isEmailField}
        isNonIndividualEntity={isNonIndividualEntity} isAmateurPermitService={isAmateurPermitService} isIndividualVar={isIndividualVar}
        isForeignVisitor={isForeignVisitor} isVanityOrSpecialEvent={isVanityOrSpecialEvent}
        showCallSign={isForeignVisitor || (isAeroStationPossess && isRepeaterField)}
        hideAddButton={isAeroStationPossess && isRepeaterField}
        maxRows={isAeroStationPossess && isRepeaterField ? 1 : undefined}
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

  const natureOfServiceField = form?.sections
    ?.flatMap((s) => s.fields || [])
    ?.find((f) => {
      const fid = (f.fieldId || f.id || "").toLowerCase();
      const flbl = (f.label || "").toLowerCase();
      return fid.includes("natureofservice") || flbl.includes("nature of service") || flbl === "type";
    });
  const natureOfServiceOptions = natureOfServiceField ? parseOptions(natureOfServiceField) : undefined;

  return (
    <View style={styles.container}>
      {showApplicationTypeSection && (
        <DynamicFormSection1
          serviceCategory={serviceCategory} serviceTitle={serviceTitle} selectedVariantId={selectedVariantId}
          variants={variants} variantElements={variantElements} selectedElementId={selectedElementId} noOfYears={noOfYears}
          showElements={showElements} showNumberOfYears={showNumberOfYears} isVas={isVas} isAmateurCert={isAmateurCert}
          isModification={isModification} isLifetimeSupplementary={isLifetimeSupplementary} isRenewalOrMod={isRenewalOrMod}
          isRenewal={isRenewal} isVanityNew={isVanityNew} isVanityRen={isVanityRen} isSpecialEvent={isSpecialEvent}
          isAeroStationPurchase={isAeroStationPurchase}
          isAeroStationPossess={isAeroStationPossess}
          natureOfServiceOptions={natureOfServiceOptions && natureOfServiceOptions.length > 0 ? natureOfServiceOptions : undefined}
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
          return (
            <VanitySpecialApplicantSection
              key={section.id || section.key || `section-${sIdx}`}
              section={section}
              sectionDisplayNum={sectionDisplayNum}
              renderFieldInstance={renderFieldInstance}
            />
          );
        }

        const isStationEquipmentSection =
          secKeyLower.includes("stationequipment") ||
          secKeyLower.includes("proposedstation") ||
          secKeyLower.includes("particulars") ||
          (secTitleLower.includes("station") && secTitleLower.includes("equipment")) ||
          secTitleLower.includes("particulars");

        if (isStationEquipmentSection) {
          if (isAeroStationPossess) {
            return (
              <AeroStationPossessSection
                key={section.id || section.key || `section-${sIdx}`}
                section={section}
                sectionDisplayNum={sectionDisplayNum}
                stationParticularsCount={stationParticularsCount}
                onAddStationParticular={handleAddStationParticular}
                onRemoveStationParticular={handleRemoveStationParticular}
                renderFieldInstance={renderFieldInstance}
              />
            );
          }

          if (isAeroStationPurchase) {
            return (
              <AeroStationPurchaseSection
                key={section.id || section.key || `section-${sIdx}`}
                section={section}
                sectionDisplayNum={sectionDisplayNum}
                renderFieldInstance={renderFieldInstance}
              />
            );
          }

          if (isAmateurPurchaseVariant) {
            return (
              <AmateurPurchaseSection
                key={section.id || section.key || `section-${sIdx}`}
                section={section}
                sectionDisplayNum={sectionDisplayNum}
                flags={flags}
                renderFieldInstance={renderFieldInstance}
              />
            );
          }

          if (isVanityOrSpecialEvent) {
            return (
              <VanityEquipmentSection
                key={section.id || section.key || `section-${sIdx}`}
                section={section}
                sectionDisplayNum={sectionDisplayNum}
                renderFieldInstance={renderFieldInstance}
              />
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
            return (
              <ForeignVisitorStationSection
                key={section.id || section.key || `section-${sIdx}`}
                section={section}
                sectionDisplayNum={sectionDisplayNum}
                stationParticularsCount={stationParticularsCount}
                canonicalPermitStationFields={canonicalPermitStationFields}
                onAddStationParticular={handleAddStationParticular}
                onRemoveStationParticular={handleRemoveStationParticular}
                renderFieldInstance={renderFieldInstance}
              />
            );
          }

          return (
            <PermitStationEquipmentSection
              key={section.id || section.key || `section-${sIdx}`}
              section={section}
              sectionDisplayNum={sectionDisplayNum}
              stationParticularsCount={stationParticularsCount}
              sectionFields={sectionFields}
              canonicalPermitStationFields={canonicalPermitStationFields}
              flags={flags}
              onAddStationParticular={handleAddStationParticular}
              onRemoveStationParticular={handleRemoveStationParticular}
              renderFieldInstance={renderFieldInstance}
            />
          );
        }

        return (
          <DefaultDynamicSection
            key={section.id || section.key || `section-${sIdx}`}
            section={section}
            sectionDisplayNum={sectionDisplayNum}
            sectionFields={sectionFields}
            flags={flags}
            renderFieldInstance={renderFieldInstance}
          />
        );
      })}
    </View>
  );
};
