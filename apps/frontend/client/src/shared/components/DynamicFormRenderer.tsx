import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { DynamicFormField } from "./dynamic-form/DynamicFormField";
import { DynamicFormRendererProps, FormSectionDto, FieldDto } from "./dynamic-form/dynamicFormTypes";
import { parseOptions, evaluateVisibilityCondition, FormEvaluationContext, buildFormVariantFlags } from "./dynamic-form/dynamicFormUtils";
import { DEFAULT_AMATEUR_PURCHASE_PARTICULARS_COLUMNS, DEFAULT_AMATEUR_SELL_TRANSFER_PARTICULARS_COLUMNS } from "./form-repeater/formRepeaterColumns";
import { useLocationData } from "./dynamic-form/useLocationData";
import { dynamicFormStyles as styles } from "./dynamic-form/DynamicFormRenderer.styles";
import { FormGrid } from "./FormGrid";
import { SPAM_COMPLAINT_NATURES, TELCO_COMPLAINT_NATURES } from "./NatureOfComplaintCheckboxGroup";

export type { DynamicFormRendererProps, FormDto, FormSectionDto, FieldDto } from "./dynamic-form/dynamicFormTypes";

const SYNTHETIC_UNBLOCKING_SECTION: FormSectionDto = {
  id: "unblocking_details_section",
  key: "unblocking_details_section",
  title: "Details of Unblocking",
  description: "Provide recovery and legal status details for unblocking",
  fields: [
    {
      id: "fd000000-0000-0000-0000-000000000319",
      fieldId: "date_of_filing",
      label: "Date of Filing",
      fieldType: "date",
      isRequired: true,
      placeholder: "Select Date of Filing",
    },
    {
      id: "fd000000-0000-0000-0000-000000000320",
      fieldId: "date_of_recovery",
      label: "Date of Recovery",
      fieldType: "date",
      isRequired: true,
      placeholder: "Select Date of Recovery",
    },
    {
      id: "fd000000-0000-0000-0000-000000000321",
      fieldId: "unblocking_details",
      label: "Details",
      fieldType: "dropdown",
      isRequired: true,
      placeholder: "Select Details...",
      options: [
        {
          label: "It has already been blocked and thus I am requesting the NTC for unblocking of said unit to activate the usage of the same;",
          value: "It has already been blocked and thus I am requesting the NTC for unblocking of said unit to activate the usage of the same;",
        },
        {
          label: "It has not been blocked yet and thus I am withdrawing the affidavit of ownership and loss with undertaking I filed with the NTC for blocking of said cellphone to exclude said phone from being blocked.",
          value: "It has not been blocked yet and thus I am withdrawing the affidavit of ownership and loss with undertaking I filed with the NTC for blocking of said cellphone to exclude said phone from being blocked.",
        },
      ],
    },
  ],
};

const SYNTHETIC_BROADCAST_SECTION: FormSectionDto = {
  id: "broadcast_details",
  key: "broadcast_details",
  title: "Broadcast Details",
  description: "Broadcast details for mandatory tape preservation",
  fields: [
    {
      id: "fd000000-0000-0000-0000-000000000334",
      fieldId: "broadcast_station",
      label: "Broadcast Station",
      fieldType: "text",
      isRequired: true,
      placeholder: "e.g. DZBB 594 / GMA Network / ABS-CBN",
    },
    {
      id: "fd000000-0000-0000-0000-000000000322",
      fieldId: "program_name",
      label: "Program Name",
      fieldType: "text",
      isRequired: true,
      placeholder: "e.g. 24 Oras / TV Patrol / Super Balita",
    },
    {
      id: "fd000000-0000-0000-0000-000000000335",
      fieldId: "time_of_airing",
      label: "Time of Airing",
      fieldType: "time",
      isRequired: true,
      placeholder: "Select Time of Airing",
    },
    {
      id: "fd000000-0000-0000-0000-000000000316",
      fieldId: "date_of_incident",
      label: "Date of Airing",
      fieldType: "date",
      isRequired: true,
      placeholder: "Select Date of Airing",
    },
    {
      id: "fd000000-0000-0000-0000-000000000323",
      fieldId: "anchor_commentator",
      label: "Anchor/Commentator",
      fieldType: "text",
      isRequired: true,
      placeholder: "e.g. Mike Enriquez / Ted Failon",
    },
  ],
};

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
    const rawRVal = values?.["region"] ?? values?.["Region"] ?? "";
    const rVal = typeof rawRVal === "string" ? rawRVal : "";
    if (rVal && regions.length > 0 && !selectedRegionId) {
      const match = regions.find((r) => r.name.toLowerCase() === rVal.toLowerCase() || r.id === rVal);
      if (match) setSelectedRegionId(match.id);
    }
  }, [values, regions, selectedRegionId]);

  useEffect(() => {
    const rawPVal = values?.["province"] ?? values?.["Province"] ?? "";
    const pVal = typeof rawPVal === "string" ? rawPVal : "";
    if (pVal && provinces.length > 0 && !selectedProvinceId) {
      const match = provinces.find((p) => p.name.toLowerCase() === pVal.toLowerCase() || p.id === pVal);
      if (match) setSelectedProvinceId(match.id);
    }
  }, [values, provinces, selectedProvinceId]);

  useEffect(() => {
    const rawCVal = values?.["city"] ?? values?.["City"] ?? values?.["cityMunicipality"] ?? values?.["city_municipality"] ?? "";
    const cVal = typeof rawCVal === "string" ? rawCVal : "";
    if (cVal && municipalities.length > 0 && !selectedMunicipalityId) {
      const match = municipalities.find((m) => m.name.toLowerCase() === cVal.toLowerCase() || m.id === cVal);
      if (match) setSelectedMunicipalityId(match.id);
    }
  }, [values, municipalities, selectedMunicipalityId]);

  const matchedVariant = variants.find((v) => String(v.id) === String(selectedVariantId));
  const matchedElement = variantElements.find((e) => String(e.id) === String(selectedElementId));

  const varDesc = (matchedVariant?.description || matchedVariant?.name || matchedVariant?.type || "").toLowerCase();
  const varId = String(selectedVariantId || "").toLowerCase();
  const isUnblocking = varDesc.includes("unblock") || varId.includes("402");
  const isBlocking = (varDesc.includes("block") || varId.includes("401")) && !isUnblocking;
  const isBlockingOrUnblocking = isBlocking || isUnblocking;
  const isSpamComplaint = (varDesc.includes("spam") || varDesc.includes("scam") || varDesc.includes("threat") || varId.includes("403")) && !varDesc.includes("tape");
  const isTelcoComplaint = (varDesc.includes("telecommunications") || varDesc.includes("broadcast service") || varDesc.includes("provider") || varId.includes("404")) && !varDesc.includes("tape") && !isSpamComplaint;
  const isTapePreservation = varDesc.includes("tape") || varDesc.includes("preservation") || varId.includes("405");

  const flags = buildFormVariantFlags(
    serviceCategory,
    serviceTitle,
    selectedVariantId,
    variants,
    variantElements,
    applicantType
  );

  const isPermitService =
    flags.isPermitService ||
    Boolean(serviceCategory && serviceCategory.toLowerCase().includes("permit")) ||
    Boolean(serviceTitle && serviceTitle.toLowerCase().includes("permit"));

  useEffect(() => {
    if (!isBlockingOrUnblocking) return;
    const targetVal = isUnblocking ? "UNBLOCK GSM Handset" : "BLOCK GSM Handset";
    const currentVal = (values && values["action_requested"]) || (values && values["Action Requested"]) || (values && values["fd000000-0000-0000-0000-000000000307"]) || "";
    if (currentVal !== targetVal) {
      onChange("action_requested", "Action Requested", targetVal);
      onChange("fd000000-0000-0000-0000-000000000307", "Action Requested", targetVal);
    }
  }, [isBlockingOrUnblocking, isUnblocking, values, onChange]);

  const evaluationContext: FormEvaluationContext = {
    variantType: matchedVariant?.type ? String(matchedVariant.type) : undefined,
    variantId: selectedVariantId,
    variantDescription: matchedVariant?.description || matchedVariant?.name,
    elementCodes: matchedElement?.code ? [matchedElement.code] : variantElements.map((e) => e.code).filter((c): c is string => Boolean(c)),
    applicantType,
    formValues: values,
  };

  let rawSections = form?.sections || [];
  if (isUnblocking && !rawSections.some((s) => s.key === "unblocking_details_section" || s.id === "unblocking_details_section" || (s.title && s.title.toLowerCase().includes("unblocking")))) {
    rawSections = [...rawSections, SYNTHETIC_UNBLOCKING_SECTION];
  }
  if (isTapePreservation && !rawSections.some((s) => s.key === "broadcast_details" || s.id === "broadcast_details" || (s.title && s.title.toLowerCase().includes("broadcast")))) {
    rawSections = [SYNTHETIC_BROADCAST_SECTION, ...rawSections];
  }
  const sections = rawSections;

  const renderFieldInstance = (
    field: FieldDto,
    fIdx: number,
    section: FormSectionDto
  ) => {
    const rawTargetId = field.fieldId || field.id || `field-${fIdx}`;
    const fIdLower = rawTargetId.toLowerCase();
    const labelLower = (field.label || "").toLowerCase().trim();
    const rawType = (field.fieldType || field.type || "").toLowerCase();

    const isActionRequestedField = fIdLower === "action_requested" || labelLower.includes("action requested");
    const isNatureOfComplaintField = fIdLower === "complaint_types" || fIdLower === "fd000000-0000-0000-0000-000000000327" || labelLower === "nature of complaint" || labelLower.includes("nature of complaint") || labelLower.includes("complaint category");
    const isOthersSpecificationField = fIdLower === "others_specification" || fIdLower === "fd000000-0000-0000-0000-000000000328" || labelLower.includes("if others, please specify");
    const isIncidentTypeField = fIdLower === "loss_reason" || fIdLower === "fd000000-0000-0000-0000-000000000313" || labelLower === "incident type" || labelLower.includes("incident type");
    const isUnblockingDetailsField = fIdLower === "unblocking_details" || fIdLower === "fd000000-0000-0000-0000-000000000321" || (isUnblocking && labelLower === "details");
    const isTimeField =
      rawType === "time" ||
      fIdLower === "time_of_incident" ||
      fIdLower === "time_of_airing" ||
      fIdLower === "fd000000-0000-0000-0000-000000000329" ||
      fIdLower === "fd000000-0000-0000-0000-000000000335" ||
      labelLower.includes("time of incident") ||
      labelLower.includes("time of transaction") ||
      labelLower.includes("time of airing");
    const isRepeaterField =
      rawType === "repeater" ||
      rawType === "table" ||
      rawType === "repeatable" ||
      fIdLower.includes("equipmentdetails") ||
      fIdLower.includes("devicesdetails") ||
      fIdLower.includes("device_particulars") ||
      fIdLower.includes("sim_mobile_numbers") ||
      fIdLower.includes("attached_proof_documents") ||
      fIdLower === "fd000000-0000-0000-0000-000000000331" ||
      fIdLower === "fd000000-0000-0000-0000-000000000332" ||
      fIdLower === "fd000000-0000-0000-0000-000000000333" ||
      labelLower.includes("attached proof") ||
      labelLower.includes("device particulars") ||
      labelLower.includes("sim card / mobile numbers") ||
      Boolean(field.repeaterColumns && Array.isArray(field.repeaterColumns) && field.repeaterColumns.length > 0);

    if (isActionRequestedField && isBlockingOrUnblocking) {
      return null;
    }
    if (isOthersSpecificationField || fIdLower === "incident_others_specify" || (labelLower === "please specify" && isBlocking)) {
      return null;
    }
    const isBsdField = fIdLower.includes("bsd") || labelLower.includes("bsd no");
    const isVasRegField = fIdLower.includes("vasregistration") || fIdLower.includes("vasregno");
    const isIntendedUseField = fIdLower.includes("intendeduse") || labelLower.includes("intended use");
    const isVasServicesField = fIdLower.includes("valueaddedservices") || labelLower.includes("value added service");
    const isSignature = rawType === "signature" || labelLower.includes("signature");
    const isCheckbox = rawType === "checkbox" || labelLower.includes("declare");
    const isDropdown = rawType === "dropdown" || rawType === "select" || rawType === "radio" || fIdLower === "bandwidthunit" || fIdLower === "frequencyunit" || fIdLower === "sex" || fIdLower === "stationclass" || isActionRequestedField || isIncidentTypeField || isUnblockingDetailsField;
    const isDate = rawType === "date" || labelLower.includes("date");
    const isNumber = rawType === "number" || labelLower.includes("power") || labelLower.includes("watts") || labelLower.includes("height") || labelLower.includes("weight") || labelLower.includes("gain") || labelLower.includes("diameter");
    const isContactField = labelLower.includes("contact") || labelLower.includes("mobile") || rawType === "tel";
    const isEmailField = labelLower.includes("email") || rawType === "email";

    let span: 12 | 8 | 6 | 4 | 3 = 6;
    if (
      isActionRequestedField ||
      isNatureOfComplaintField ||
      isRepeaterField ||
      isSignature ||
      isCheckbox ||
      isBsdField ||
      isVasRegField ||
      isIntendedUseField ||
      isVasServicesField ||
      isUnblockingDetailsField ||
      labelLower.includes("remarks") ||
      labelLower.includes("circumstances") ||
      labelLower.includes("service area") ||
      labelLower.includes("points of comm") ||
      labelLower.includes("exact location") ||
      labelLower.includes("network diagram") ||
      labelLower.includes("details and supporting")
    ) {
      span = 12;
    } else if (isDropdown || isDate || isNumber || isTimeField) {
      span = 6;
    }

    let val = (values && values[rawTargetId]) || (values && field.label && values[field.label]) || "";
    if (isActionRequestedField && isBlockingOrUnblocking) {
      val = isUnblocking ? "UNBLOCK GSM Handset" : "BLOCK GSM Handset";
    }

    let dropdownOptions: Array<{ label: string; value: string }> = [];
    if (isIncidentTypeField) {
      dropdownOptions = [
        { label: "Lost / Misplaced", value: "Lost / Misplaced" },
        { label: "Stolen (Theft / Robbery / Hold-up)", value: "Stolen (Theft / Robbery / Hold-up)" },
        { label: "Others", value: "Others" },
      ];
    } else if (isUnblockingDetailsField) {
      dropdownOptions = [
        {
          label: "It has already been blocked and thus I am requesting the NTC for unblocking of said unit to activate the usage of the same;",
          value: "It has already been blocked and thus I am requesting the NTC for unblocking of said unit to activate the usage of the same;",
        },
        {
          label: "It has not been blocked yet and thus I am withdrawing the affidavit of ownership and loss with undertaking I filed with the NTC for blocking of said cellphone to exclude said phone from being blocked.",
          value: "It has not been blocked yet and thus I am withdrawing the affidavit of ownership and loss with undertaking I filed with the NTC for blocking of said cellphone to exclude said phone from being blocked.",
        },
      ];
    } else if (fIdLower === "frequencyunit" || labelLower.includes("frequency unit")) dropdownOptions = [{ label: "KHz", value: "KHz" }, { label: "MHz", value: "MHz" }, { label: "GHz", value: "GHz" }];
    else if (fIdLower === "bandwidthunit" || labelLower === "unit") dropdownOptions = [{ label: "KHz", value: "KHz" }, { label: "MHz", value: "MHz" }, { label: "GHz", value: "GHz" }];
    else if (fIdLower === "stationclass" || labelLower.includes("station class") || labelLower.includes("class of station")) {
      dropdownOptions = [{ label: "RT", value: "RT" }, { label: "FX", value: "FX" }, { label: "FB", value: "FB" }, { label: "FX/FB", value: "FX/FB" }, { label: "ML", value: "ML" }, { label: "P", value: "P" }, { label: "FA", value: "FA" }, { label: "MA", value: "MA" }, { label: "Others", value: "Others" }];
    }
    else if (labelLower === "region" || fIdLower === "region" || fIdLower.includes("region")) dropdownOptions = regions.map((r: { id: string; name: string }) => ({ label: r.name, value: r.name }));
    else if (labelLower === "province" || fIdLower === "province" || fIdLower.includes("province")) dropdownOptions = provinces.map((p: { id: string; name: string }) => ({ label: p.name, value: p.name }));
    else if (labelLower.includes("city") || labelLower.includes("municipality") || fIdLower === "city" || fIdLower.includes("city") || fIdLower.includes("municipality")) dropdownOptions = municipalities.map((m: { id: string; name: string }) => ({ label: m.name, value: m.name }));
    else if (labelLower === "barangay" || fIdLower === "barangay" || fIdLower.includes("barangay")) dropdownOptions = barangays.map((b: { id: string; name: string }) => ({ label: b.name, value: b.name }));
    else if (isActionRequestedField) {
      dropdownOptions = [
        { label: "BLOCK GSM Handset", value: "BLOCK GSM Handset" },
        { label: "UNBLOCK GSM Handset", value: "UNBLOCK GSM Handset" },
      ];
    }
    else dropdownOptions = parseOptions(field) ?? [];

    let fieldToRender = field;
    if (isNatureOfComplaintField) {
      if (isSpamComplaint) {
        fieldToRender = { ...field, options: SPAM_COMPLAINT_NATURES };
      } else if (isTelcoComplaint) {
        fieldToRender = { ...field, options: TELCO_COMPLAINT_NATURES };
      }
    }
    if (isTapePreservation && (fIdLower === "state_briefly_details" || labelLower.includes("details of complaint"))) {
      fieldToRender = {
        ...fieldToRender,
        label: "Reason / Details for Mandatory Tape Preservation",
        placeholder: "State briefly the reason and details for mandatory tape preservation...",
      };
    }

    const isFieldRequired = fieldToRender.isRequired ?? false;

    const isAmateurPurchaseParticulars =
      flags.isAmateurPurchasePossessVariant &&
      (fIdLower.includes("particular") ||
        labelLower.includes("particular") ||
        rawTargetId === "fd000000-0000-0000-0000-000000000340");

    const isAmateurSellTransferParticulars =
      flags.isAmateurSellTransfer &&
      (fIdLower.includes("particular") ||
        labelLower.includes("particular") ||
        rawTargetId === "fd000000-0000-0000-0000-000000000340");

    const customRepeaterColumns = isAmateurPurchaseParticulars
      ? DEFAULT_AMATEUR_PURCHASE_PARTICULARS_COLUMNS
      : isAmateurSellTransferParticulars
      ? DEFAULT_AMATEUR_SELL_TRANSFER_PARTICULARS_COLUMNS
      : undefined;

    const customAddButtonLabel =
      isAmateurPurchaseParticulars || isAmateurSellTransferParticulars
        ? "Add Station / Class Particulars"
        : undefined;

    return (
      <DynamicFormField
        key={rawTargetId}
        field={fieldToRender}
        targetId={rawTargetId}
        val={val}
        disabled={isActionRequestedField && isBlockingOrUnblocking}
        err={
          errors?.[rawTargetId] ||
          errors?.[fieldToRender.label] ||
          (fieldToRender.id !== undefined ? errors?.[fieldToRender.id] : undefined) ||
          (fieldToRender.fieldId !== undefined ? errors?.[fieldToRender.fieldId] : undefined)
        }
        displayLabel={fieldToRender.label}
        isRequired={isFieldRequired}
        span={span}
        dropdownOptions={dropdownOptions}
        placeholder={fieldToRender.placeholder || `Enter ${fieldToRender.label}...`}
        isNameField={false}
        isRepeaterField={isRepeaterField}
        isBsdField={isBsdField}
        isVasRegField={isVasRegField}
        isIntendedUseField={isIntendedUseField}
        isVasServicesField={isVasServicesField}
        isNatureOfComplaintField={isNatureOfComplaintField}
        isTimeField={isTimeField}
        othersSpecifyValue={(values && values["others_specification"]) || (values && values["If Others, Please Specify"]) || ""}
        onOthersSpecifyChange={(text) => onChange("others_specification", "If Others, Please Specify", text)}
        incidentOthersSpecifyValue={
          (values && values["incident_others_specify"]) ||
          (values && values["Please specify"]) ||
          (values && values["others_specification"]) ||
          ""
        }
        onIncidentOthersSpecifyChange={(text) => {
          onChange("incident_others_specify", "Please specify", text);
          onChange("others_specification", "If Others, Please Specify", text);
        }}
        incidentOthersError={
          errors?.["incident_others_specify"] ||
          errors?.["Please specify"] ||
          errors?.["others_specification"]
        }
        isSignature={isSignature}
        isCheckbox={isCheckbox}
        isDropdown={isDropdown}
        isDate={isDate}
        isNumber={isNumber}
        isContactField={isContactField}
        isEmailField={isEmailField}
        isNonIndividualEntity={applicantType === "company"}
        isAmateurPermitService={isPermitService}
        isIndividualVar={applicantType === "individual"}
        showCallSign={!isPermitService}
        hideAddButton={
          isPermitService &&
          !fIdLower.includes("particular") &&
          !labelLower.includes("particular") &&
          rawTargetId !== "fd000000-0000-0000-0000-000000000340"
        }
        structuredNameData={structuredNameData}
        applicantName={applicantName}
        isBulk={isBulk}
        appMode={appMode}
        customRepeaterColumns={customRepeaterColumns}
        customAddButtonLabel={customAddButtonLabel}
        onChange={onChange}
        onStructuredNameChange={onStructuredNameChange}
        onDropdownChange={(v) => {
          onChange(rawTargetId, fieldToRender.label, v);
          if (isIncidentTypeField && v !== "Others") {
            onChange("incident_others_specify", "Please specify", "");
            onChange("others_specification", "If Others, Please Specify", "");
          }
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
      k === "applicantcontact" ||
      k === "assistancerequest" ||
      t.includes("special needs")
    ) {
      return false;
    }

    const isBlockingSection =
      k === "request_type_and_device_details" ||
      k === "sim_details" ||
      k === "supporting_documents" ||
      k === "incident_and_demographic_info" ||
      k === "unblocking_details_section" ||
      t.includes("device particulars") ||
      t.includes("sim card") ||
      t.includes("proof of ownership") ||
      t.includes("incident details") ||
      t.includes("unblocking");

    const isComplaintSection =
      k === "particulars_of_service_provider" ||
      k === "nature_of_complaint" ||
      k === "complaint_details" ||
      k === "broadcast_details" ||
      t.includes("service provider") ||
      t.includes("nature of complaint") ||
      t.includes("details of complaint") ||
      t.includes("broadcast");

    if (isBlockingOrUnblocking && isComplaintSection) {
      return false;
    }
    if (!isBlockingOrUnblocking && isBlockingSection) {
      return false;
    }

    if (isBlocking) {
      if (k === "supporting_documents" || t.includes("proof of ownership")) return false;
      if (k === "unblocking_details_section" || t.includes("unblocking")) return false;
    }

    if (isUnblocking) {
      if (k === "supporting_documents" || t.includes("proof of ownership")) return false;
      if (k === "incident_and_demographic_info" || t.includes("incident details")) return false;
    }

    if (isTapePreservation) {
      if (k === "nature_of_complaint" || t.includes("nature of complaint")) return false;
      if (k === "particulars_of_service_provider" || t.includes("particulars of service provider")) return false;
    } else {
      if (k === "broadcast_details" || t.includes("broadcast")) return false;
    }

    if (flags.isAmateurPurchasePossessVariant) {
      const isStationEquipmentSec =
        k === "stationequipment" ||
        k.includes("station") ||
        t.includes("station") ||
        k.includes("particular") ||
        t.includes("particular");
      const isIntendedUseSec =
        k === "intendeduse" ||
        k.includes("intended") ||
        t.includes("intended");

      if (!isStationEquipmentSec && !isIntendedUseSec) {
        return false;
      }
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
              labelLower.includes("amount paid") ||
              rawTargetId === "fd000000-0000-0000-0000-000000000010" ||
              rawTargetId === "specialneeds" ||
              labelLower.includes("special assistance") ||
              labelLower.includes("special needs")
            ) {
              return false;
            }

            // Client 4: Remove redundant fields for Blocking
            if (isBlocking) {
              if (rawTargetId === "action_requested" || labelLower.includes("action requested")) return false;
              if (rawTargetId === "sex" || labelLower === "sex") return false;
              if (rawTargetId === "age_group" || labelLower.includes("age group")) return false;
              if (rawTargetId === "identity_proof_type" || rawTargetId === "proof_of_ownership_type" || labelLower.includes("government identification") || labelLower.includes("proof of ownership")) return false;
            }

            // Client 5: Remove redundant fields for Unblocking
            if (isUnblocking) {
              if (rawTargetId === "action_requested" || labelLower.includes("action requested")) return false;
              if (rawTargetId === "sex" || labelLower === "sex") return false;
              if (rawTargetId === "age_group" || labelLower.includes("age group")) return false;
              if (rawTargetId === "identity_proof_type" || rawTargetId === "proof_of_ownership_type" || labelLower.includes("government identification") || labelLower.includes("proof of ownership")) return false;
            }

            if (flags.isAmateurPurchasePossessVariant) {
              const secKey = (section.key || section.id || "").toLowerCase();
              const secTitle = (section.title || "").toLowerCase();
              const isStationSec =
                secKey.includes("station") ||
                secTitle.includes("station") ||
                secKey.includes("particular") ||
                secTitle.includes("particular");
              if (isStationSec) {
                const isParticulars =
                  rawTargetId.includes("particular") ||
                  labelLower.includes("particular") ||
                  rawTargetId === "fd000000-0000-0000-0000-000000000340";
                if (!isParticulars) {
                  return false;
                }
              }
            }

            return true;
          })
          .filter((f) => evaluateVisibilityCondition(f.visibilityCondition, evaluationContext));

        if (visibleFields.length === 0) return null;

        const sectionDisplayNum = sIdx + 1;

        let displaySectionTitle = section.title || "";
        let displaySectionDesc = section.description;
        if (isTapePreservation && (section.key === "complaint_details" || (section.title && section.title.toLowerCase().includes("details of complaint")))) {
          displaySectionTitle = "Request Details";
          displaySectionDesc = "State briefly the details and reason for mandatory tape preservation";
        }

        return (
          <View key={section.id || section.key || `section-${sIdx}`} style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconCircleText}>{sectionDisplayNum}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>{displaySectionTitle}</Text>
                  {displaySectionDesc ? (
                    <Text style={styles.sectionBadgeText}>{displaySectionDesc}</Text>
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
