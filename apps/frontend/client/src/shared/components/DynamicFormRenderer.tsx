import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { DynamicFormField } from "./dynamic-form/DynamicFormField";
import { DynamicFormRendererProps, FormSectionDto, FieldDto } from "./dynamic-form/dynamicFormTypes";
import {
  parseOptions,
  parseValidationRulesMetadata,
  evaluateVisibilityCondition,
  FormEvaluationContext,
  buildFormVariantFlags,
} from "./dynamic-form/dynamicFormUtils";
import {
  DEFAULT_AMATEUR_PURCHASE_PARTICULARS_COLUMNS,
  DEFAULT_AMATEUR_SELL_TRANSFER_PARTICULARS_COLUMNS,
  DEFAULT_AMATEUR_EQUIPMENT_REPEATER_COLUMNS,
} from "./form-repeater/formRepeaterColumns";
import { useLocationData } from "./dynamic-form/useLocationData";
import { dynamicFormStyles as styles } from "./dynamic-form/DynamicFormRenderer.styles";
import { FormGrid } from "./FormGrid";
import { SPAM_COMPLAINT_NATURES, TELCO_COMPLAINT_NATURES } from "./NatureOfComplaintCheckboxGroup";
import { PERMIT_DETAILS_SERVICE_OPTIONS, resolvePermitTypes } from "./dynamic-form/dynamicFormConstants";
import { usePermitServicesQuery } from "../../auth/Services/permits/hooks/usePermitServicesQuery";

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

  const sTitle = (serviceTitle || "").toLowerCase();
  const sCat = (serviceCategory || "").toLowerCase();
  const isCopyOfPermit =
    Boolean(
      (sTitle.includes("copy") && sTitle.includes("permit")) ||
      (sCat.includes("permit") && sTitle.includes("copy")) ||
      sTitle.includes("copy of permit")
    );

  const { serviceOptions: dynamicPermitServices, getTypesForService } = usePermitServicesQuery(isCopyOfPermit);

  useEffect(() => {
    if (!isBlockingOrUnblocking) return;
    const targetVal = isUnblocking ? "UNBLOCK GSM Handset" : "BLOCK GSM Handset";
    const currentVal = (values && values["action_requested"]) || (values && values["Action Requested"]) || (values && values["fd000000-0000-0000-0000-000000000307"]) || "";
    if (currentVal !== targetVal) {
      onChange("action_requested", "Action Requested", targetVal);
    }
  }, [isBlockingOrUnblocking, isUnblocking, values, onChange]);

  // Pre-initialize Copy of Permit default values if unselected
  useEffect(() => {
    if (!isCopyOfPermit) return;
    const currentService =
      values?.["detailsService"] ||
      values?.["details_service"] ||
      values?.["DetailsService"] ||
      values?.["fd000000-0000-0000-0000-000000000244"];
    if (!currentService) {
      const defaultSvc = PERMIT_DETAILS_SERVICE_OPTIONS[0]?.value ?? "Permits in AMateur";
      const dynamicTypes = getTypesForService(defaultSvc);
      const availableTypes = dynamicTypes.length > 0 ? dynamicTypes : resolvePermitTypes(defaultSvc);
      const defaultType = availableTypes[0]?.value ?? "";
      onChange("detailsService", "DetailsService", defaultSvc);
      onChange("targetPermitType", "Type", defaultType);
      onChange("noOfCopies", "No. of Copies", "1");
    }
  }, [isCopyOfPermit, values, onChange, getTypesForService]);

  const resolvedElementCodes: string[] = [];
  if (matchedElement?.code) {
    resolvedElementCodes.push(matchedElement.code);
  } else {
    for (const elem of variantElements) {
      if (elem.code) {
        resolvedElementCodes.push(elem.code);
      }
    }
  }

  const resolvedElementNames: string[] = [];
  if (matchedElement?.name) {
    resolvedElementNames.push(matchedElement.name);
  } else if (matchedElement?.description) {
    resolvedElementNames.push(matchedElement.description);
  } else {
    for (const elem of variantElements) {
      if (elem.name) {
        resolvedElementNames.push(elem.name);
      } else if (elem.description) {
        resolvedElementNames.push(elem.description);
      }
    }
  }

  const evaluationContext: FormEvaluationContext = {
    serviceCategory,
    serviceTitle,
    serviceName: form?.serviceName || serviceTitle,
    serviceCode: form?.serviceCode,
    applicationType: matchedVariant?.type || matchedVariant?.name,
    variantType: matchedVariant?.type ? String(matchedVariant.type) : undefined,
    variantId: selectedVariantId,
    variantName: matchedVariant?.name,
    variantDescription: matchedVariant?.description || matchedVariant?.name,
    elementCodes: resolvedElementCodes,
    elementNames: resolvedElementNames,
    applicantType,
    formValues: values,
  };

  const sections = form?.sections || [];

  const hasSeparateOthersSpecField = sections.some((s) =>
    (s.fields || []).some((f) => {
      const id = (f.fieldId || f.id || "").toLowerCase();
      const lbl = (f.label || "").toLowerCase();
      return (
        id === "others_specification" ||
        id === "fd000000-0000-0000-0000-000000000328" ||
        lbl.includes("if others, please specify")
      );
    })
  );

  const renderFieldInstance = (
    field: FieldDto,
    fIdx: number,
    section: FormSectionDto
  ) => {
    const rawTargetId = field.fieldId || field.id || `field-${fIdx}`;
    const fIdLower = rawTargetId.toLowerCase();
    const labelLower = (field.label || "").toLowerCase().trim();
    const rawType = (field.fieldType || field.type || "").toLowerCase();
    const validationMeta = parseValidationRulesMetadata(field);

    const isActionRequestedField =
      fIdLower === "action_requested" ||
      fIdLower === "fd000000-0000-0000-0000-000000000307" ||
      labelLower.includes("action requested");
    const isDetailsServiceField =
      fIdLower === "detailsservice" ||
      fIdLower === "details_service" ||
      fIdLower === "fd000000-0000-0000-0000-000000000244" ||
      labelLower === "detailsservice" ||
      labelLower === "details service";
    const isPermitTypeField =
      isCopyOfPermit &&
      (fIdLower === "targetpermittype" ||
        fIdLower === "target_permit_type" ||
        fIdLower === "fd000000-0000-0000-0000-000000000245" ||
        labelLower === "type" ||
        labelLower.includes("permit type"));
    const isNatureOfComplaintField =
      fIdLower === "complaint_types" ||
      fIdLower === "fd000000-0000-0000-0000-000000000327" ||
      labelLower === "nature of complaint" ||
      labelLower.includes("nature of complaint") ||
      labelLower.includes("complaint category");
    const isOthersSpecificationField =
      fIdLower === "others_specification" ||
      fIdLower === "fd000000-0000-0000-0000-000000000328" ||
      labelLower.includes("if others, please specify");
    const isIncidentOthersField =
      fIdLower === "incident_others_specify" ||
      fIdLower === "fd000000-0000-0000-0000-000000000318" ||
      fIdLower === "fd000000-0000-0000-0000-000000000338" ||
      (labelLower === "please specify" && isBlockingOrUnblocking);
    const isIncidentTypeField =
      fIdLower === "loss_reason" ||
      fIdLower === "fd000000-0000-0000-0000-000000000313" ||
      labelLower === "incident type" ||
      labelLower.includes("incident type");
    const isUnblockingDetailsField =
      fIdLower === "unblocking_details" ||
      fIdLower === "fd000000-0000-0000-0000-000000000321" ||
      (isUnblocking && labelLower === "details");
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

    const isBsdField = fIdLower.includes("bsd") || labelLower.includes("bsd no");
    const isVasRegField = fIdLower.includes("vasregistration") || fIdLower.includes("vasregno");
    const isIntendedUseField = fIdLower.includes("intendeduse") || labelLower.includes("intended use");
    const isVasServicesField = fIdLower.includes("valueaddedservices") || labelLower.includes("value added service");
    const parsedFieldOptions = parseOptions(field);
    const isSignature = rawType === "signature" || labelLower.includes("signature");
    const isCheckbox =
      rawType === "checkbox" ||
      rawType === "checkbox_group" ||
      rawType === "checkboxgroup" ||
      rawType.includes("checkbox") ||
      labelLower.includes("declare");
    const isDropdown =
      rawType === "dropdown" ||
      rawType === "select" ||
      rawType === "radio" ||
      rawType.includes("dropdown") ||
      rawType.includes("select") ||
      rawType.includes("radio") ||
      (parsedFieldOptions.length > 0 && !isCheckbox) ||
      isDetailsServiceField ||
      isPermitTypeField;
    const isDate = rawType === "date" || labelLower.includes("date");
    const isNumber =
      rawType === "number" ||
      labelLower.includes("power") ||
      labelLower.includes("watts") ||
      labelLower.includes("height") ||
      labelLower.includes("weight") ||
      labelLower.includes("gain") ||
      labelLower.includes("diameter");
    const isContactField = labelLower.includes("contact") || labelLower.includes("mobile") || rawType === "tel" || rawType === "phone";
    const isEmailField = labelLower.includes("email") || rawType === "email";

    let defaultSpan: 12 | 8 | 6 | 4 | 3 = 6;
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
      rawType === "textarea" ||
      labelLower.includes("remarks") ||
      labelLower.includes("circumstances") ||
      labelLower.includes("service area") ||
      labelLower.includes("points of comm") ||
      labelLower.includes("exact location") ||
      labelLower.includes("network diagram") ||
      labelLower.includes("details and supporting")
    ) {
      defaultSpan = 12;
    }
    const span: 12 | 8 | 6 | 4 | 3 =
      isRepeaterField || isNatureOfComplaintField || isIntendedUseField || isVasServicesField || isSignature
        ? 12
        : validationMeta.cols === 1
        ? 6
        : validationMeta.cols === 2
        ? 12
        : defaultSpan;

    let val =
      (values && values[rawTargetId]) ||
      (values && field.label && values[field.label]) ||
      (isOthersSpecificationField ? values?.["others_specification"] || "" : "") ||
      (isIncidentOthersField ? values?.["incident_others_specify"] || "" : "") ||
      "";
    if (isActionRequestedField && isBlockingOrUnblocking && !val) {
      val = isUnblocking ? "UNBLOCK GSM Handset" : "BLOCK GSM Handset";
    }

    let dropdownOptions: Array<{ label: string; value: string }> = [];
    if (isDetailsServiceField) {
      dropdownOptions = dynamicPermitServices.length > 0 ? dynamicPermitServices : parsedFieldOptions.length > 0 ? parsedFieldOptions : PERMIT_DETAILS_SERVICE_OPTIONS;
    } else if (isPermitTypeField) {
      const currentDetailsService =
        values?.["detailsService"] ||
        values?.["details_service"] ||
        values?.["DetailsService"] ||
        values?.["fd000000-0000-0000-0000-000000000244"] ||
        (dynamicPermitServices.length > 0 ? dynamicPermitServices[0]?.value : undefined) ||
        PERMIT_DETAILS_SERVICE_OPTIONS[0]?.value ||
        "Permits in AMateur";
      const dynamicTypes = getTypesForService(currentDetailsService);
      dropdownOptions = dynamicTypes.length > 0 ? dynamicTypes : resolvePermitTypes(currentDetailsService);
    } else if (labelLower === "region" || fIdLower === "region" || fIdLower.includes("region")) {
      dropdownOptions = regions.map((r: { id: string; name: string }) => ({ label: r.name, value: r.name }));
    } else if (labelLower === "province" || fIdLower === "province" || fIdLower.includes("province")) {
      dropdownOptions = provinces.map((p: { id: string; name: string }) => ({ label: p.name, value: p.name }));
    } else if (labelLower.includes("city") || labelLower.includes("municipality") || fIdLower === "city" || fIdLower.includes("city") || fIdLower.includes("municipality")) {
      dropdownOptions = municipalities.map((m: { id: string; name: string }) => ({ label: m.name, value: m.name }));
    } else if (labelLower === "barangay" || fIdLower === "barangay" || fIdLower.includes("barangay")) {
      dropdownOptions = barangays.map((b: { id: string; name: string }) => ({ label: b.name, value: b.name }));
    } else if (parsedFieldOptions.length > 0) {
      dropdownOptions = parsedFieldOptions;
    } else if (isNatureOfComplaintField) {
      const fallbackNatures = isSpamComplaint
        ? SPAM_COMPLAINT_NATURES
        : isTelcoComplaint
        ? TELCO_COMPLAINT_NATURES
        : [];
      dropdownOptions = fallbackNatures.map((n) => ({ label: n, value: n }));
    }

    const isFieldRequired = field.isRequired ?? false;

    const isAmateurPurchaseParticulars =
      (flags.isAmateurPurchasePossessVariant || flags.isAmateurPurchaseVariant) &&
      (fIdLower.includes("particular") ||
        labelLower.includes("particular") ||
        rawTargetId === "fd000000-0000-0000-0000-000000000340");

    const isAmateurSellTransferParticulars =
      flags.isAmateurSellTransfer &&
      (fIdLower.includes("particular") ||
        labelLower.includes("particular") ||
        rawTargetId === "fd000000-0000-0000-0000-000000000340");

    const isAmateurVanityParticulars =
      flags.isVanity &&
      (fIdLower.includes("particular") ||
        labelLower.includes("particular") ||
        rawTargetId === "fd000000-0000-0000-0000-000000000340");

    const customRepeaterColumns = isAmateurPurchaseParticulars
      ? DEFAULT_AMATEUR_PURCHASE_PARTICULARS_COLUMNS
      : isAmateurSellTransferParticulars
      ? DEFAULT_AMATEUR_SELL_TRANSFER_PARTICULARS_COLUMNS
      : isAmateurVanityParticulars
      ? DEFAULT_AMATEUR_EQUIPMENT_REPEATER_COLUMNS
      : undefined;

    const customAddButtonLabel =
      isAmateurPurchaseParticulars || isAmateurSellTransferParticulars
        ? "Add Station / Class Particulars"
        : isAmateurVanityParticulars
        ? "Add Equipment"
        : undefined;

    const resolvedPlaceholder =
      validationMeta.placeholder ||
      field.placeholder ||
      (isDropdown ? `Select ${field.label}...` : `Enter ${field.label}...`);

    return (
      <DynamicFormField
        key={rawTargetId}
        field={field}
        targetId={rawTargetId}
        val={val}
        disabled={isActionRequestedField && isBlockingOrUnblocking}
        err={
          errors?.[rawTargetId] ||
          errors?.[field.label] ||
          (field.id !== undefined ? errors?.[field.id] : undefined) ||
          (field.fieldId !== undefined ? errors?.[field.fieldId] : undefined) ||
          (isIncidentOthersField ? errors?.["incident_others_specify"] : undefined) ||
          (isOthersSpecificationField ? errors?.["others_specification"] : undefined)
        }
        displayLabel={field.label}
        isRequired={isFieldRequired}
        span={span}
        dropdownOptions={dropdownOptions}
        placeholder={resolvedPlaceholder}
        helpText={validationMeta.helpText}
        maxLength={validationMeta.maxLength}
        isNameField={false}
        isRepeaterField={isRepeaterField}
        isBsdField={isBsdField}
        isVasRegField={isVasRegField}
        isIntendedUseField={isIntendedUseField}
        isVasServicesField={isVasServicesField}
        isNatureOfComplaintField={isNatureOfComplaintField}
        hideInlineOthersSpecify={hasSeparateOthersSpecField}
        isTimeField={isTimeField}
        othersSpecifyValue={(values && values["others_specification"]) || (values && values["If Others, Please Specify"]) || ""}
        onOthersSpecifyChange={(text) => onChange("others_specification", "If Others, Please Specify", text)}
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
        structuredNameData={structuredNameData}
        applicantName={applicantName}
        isBulk={isBulk}
        appMode={appMode}
        customRepeaterColumns={customRepeaterColumns}
        customAddButtonLabel={customAddButtonLabel}
        onChange={(fId, fLbl, newValue) => {
          onChange(fId, fLbl, newValue);
          if (isOthersSpecificationField && fId !== "others_specification") {
            onChange("others_specification", fLbl, newValue);
          }
          if (isIncidentOthersField && fId !== "incident_others_specify") {
            onChange("incident_others_specify", fLbl, newValue);
          }
        }}
        onStructuredNameChange={onStructuredNameChange}
        onDropdownChange={(v) => {
          if (isDetailsServiceField) {
            onChange(rawTargetId, field.label, v);
            const availableTypes = getTypesForService(v);
            const firstType = availableTypes[0]?.value || "";
            onChange("targetPermitType", "Type", firstType);
            return;
          }
          if (isPermitTypeField) {
            onChange(rawTargetId, field.label, v);
            return;
          }
          onChange(rawTargetId, field.label, v);
          if (isIncidentTypeField && v !== "Others") {
            onChange("incident_others_specify", "Please specify", "");
            onChange("fd000000-0000-0000-0000-000000000338", "Please specify", "");
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

    // Personal Information is kept separately in ApplicantInformationFormSection.
    // All other sections configured in Form Builder remain available on client.
    const isPersonalInfoSec =
      k === "applicant" ||
      k === "applicantperson" ||
      k === "applicantparticulars" ||
      k === "applicantaddress" ||
      k === "applicantcontact" ||
      k === "applicant_information" ||
      t === "applicant particulars" ||
      t === "applicant information";

    if (isPersonalInfoSec) {
      return false;
    }

    return evaluateVisibilityCondition(sec.visibilityCondition, evaluationContext);
  });

  return (
    <View style={styles.container}>
      {visibleSections.map((section, sIdx) => {
        const rawFields = section.fields || [];
        const visibleFields = rawFields.filter((f) => {
          return evaluateVisibilityCondition(f.visibilityCondition, evaluationContext);
        });

        if (visibleFields.length === 0) {
          // If all fields in this section are conditionally hidden for the current variant, hide the section
          if (rawFields.length > 0) {
            return null;
          }

          const sectionDisplayNum = sIdx + 1;
          const displaySectionTitle = section.title || "";
          const displaySectionDesc = section.description;

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

              <View style={styles.emptySectionNotice}>
                <Text style={styles.emptySectionNoticeTitle}>
                  Empty Section (0 Fields Configured)
                </Text>
                <Text style={styles.emptySectionNoticeText}>
                  This section has no fields in the form template. To keep what the form builder sees synchronized, this section is displayed so administrators can either add fields to it or delete it in the Admin Form Builder.
                </Text>
              </View>
            </View>
          );
        }

        const sectionDisplayNum = sIdx + 1;
        const displaySectionTitle = section.title || "";
        const displaySectionDesc = section.description;

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
