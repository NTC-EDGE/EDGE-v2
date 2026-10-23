import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";
import { DynamicFormRenderer, FormDto } from "../../../../shared/components/DynamicFormRenderer";
import { ApplicantInformationFormSection } from "./applicant-info/ApplicantInformationFormSection";
import { FormSignatureInput } from "../../../../shared/components/FormSignatureInput";
import { useServiceForm } from "../hooks/useServiceForm";
import { getApplicantDisplayName } from "../helpers/applicantDisplayHelper";
import { evaluateVisibilityCondition, FormEvaluationContext } from "../../../../shared/components/dynamic-form/dynamicFormUtils";
import { initialCopyOfPermitData } from "../../permits";
import { PERMIT_DETAILS_SERVICE_OPTIONS } from "../../../../shared/components/dynamic-form/dynamicFormConstants";

interface GeneralFilingDetailsStepProps {
  service: NTCService;
  activeApplicant: GeneralApplicantData;
  updateActiveApplicant: (
    fields: Partial<GeneralApplicantData> | ((prevApp: GeneralApplicantData) => Partial<GeneralApplicantData>)
  ) => void;
  appMode?: "SINGLE" | "BULK";
  applicants?: GeneralApplicantData[];
  currentApplicantIndex?: number;
  setCurrentApplicantIndex?: (idx: number) => void;
  onRequiredFieldsChange?: (fieldIds: string[]) => void;
  errors?: Record<string, string>;
  variants?: Array<{ id: string; type?: string; name?: string; description?: string; isIndividual?: boolean; [key: string]: unknown }>;
  variantElements?: Array<{ id: string; code?: string; description?: string; [key: string]: unknown }>;
}

export function GeneralFilingDetailsStep({
  service,
  activeApplicant,
  updateActiveApplicant,
  appMode = "SINGLE",
  applicants = [],
  currentApplicantIndex = 0,
  setCurrentApplicantIndex,
  onRequiredFieldsChange,
  errors = {},
  variants = [],
  variantElements = [],
}: GeneralFilingDetailsStepProps) {
  const { form, loading } = useServiceForm(service.id);

  const isExamService =
    (service.category || "").toLowerCase().includes("exam") ||
    (service.title || "").toLowerCase().includes("exam") ||
    (service.title || "").toLowerCase().includes("admission") ||
    (service.title || "").toLowerCase().includes("operator examination");

  const sTitle = (service.title || "").toLowerCase();
  const sCat = (service.category || "").toLowerCase();
  const sCode = (service.code || "").toLowerCase();
  const isCopyOfPermit =
    Boolean(
      (sTitle.includes("copy") && sTitle.includes("permit")) ||
      (sCat.includes("permit") && sTitle.includes("copy")) ||
      sCode.includes("copy_permit") ||
      sCode.includes("copy-permit")
    );

  const fallbackCopyOfPermitForm: FormDto = {
    id: "synthetic-copy-of-permits-form",
    formId: "synthetic-copy-of-permits-form",
    version: "1.0",
    sections: [
      {
        id: "permit_copy_particulars",
        key: "permitCopyParticulars",
        title: "Permit Details",
        description: "Particulars of the permit copy request",
        fields: [
          {
            id: "fd000000-0000-0000-0000-000000000244",
            fieldId: "detailsService",
            label: "DetailsService",
            fieldType: "dropdown",
            isRequired: true,
            placeholder: "Select Service...",
            options: PERMIT_DETAILS_SERVICE_OPTIONS,
          },
          {
            id: "fd000000-0000-0000-0000-000000000245",
            fieldId: "targetPermitType",
            label: "Type",
            fieldType: "dropdown",
            isRequired: true,
            placeholder: "Select Permit Type...",
          },
          {
            id: "fd000000-0000-0000-0000-000000000246",
            fieldId: "permitNo",
            label: "Permit no.",
            fieldType: "text",
            isRequired: true,
            placeholder: "Enter Permit no.",
          },
          {
            id: "fd000000-0000-0000-0000-000000000243",
            fieldId: "noOfCopies",
            label: "No. of Copies",
            fieldType: "dropdown",
            isRequired: false,
            placeholder: "Select No. of Copies",
            options: [
              { label: "1 Copy", value: "1" },
              { label: "2 Copies", value: "2" },
              { label: "3 Copies", value: "3" },
              { label: "4 Copies", value: "4" },
              { label: "5 Copies", value: "5" },
              { label: "10 Copies", value: "10" },
            ],
          },
          {
            id: "fd000000-0000-0000-0000-000000000037",
            fieldId: "circumstances",
            label: "Circumstances Relating to Lost/Mutilation of Permit",
            fieldType: "textarea",
            isRequired: false,
            placeholder: "State the circumstances leading to the loss or mutilation...",
          },
        ],
      },
    ],
  };

  let effectiveForm: FormDto | null = null;
  if (isCopyOfPermit) {
    if (form && form.sections && form.sections.length > 0) {
      const sanitizedSections = form.sections.filter(
        (s) =>
          s.key !== "permitLicenseCertificateNo" &&
          s.id !== "permitLicenseCertificateNo" &&
          s.key !== "stationClass" &&
          s.id !== "stationClass" &&
          !(s.title && s.title.toLowerCase().includes("station class")) &&
          !(s.title && s.title.toLowerCase().includes("certificate particulars"))
      );
      if (sanitizedSections.some((s) => s.key === "permitCopyParticulars" || s.id === "permit_copy_particulars" || (s.title && s.title.toLowerCase().includes("permit details")))) {
        effectiveForm = { ...form, sections: sanitizedSections };
      } else {
        effectiveForm = fallbackCopyOfPermitForm;
      }
    } else {
      effectiveForm = fallbackCopyOfPermitForm;
    }
  } else {
    effectiveForm = form && form.sections && form.sections.length > 0 ? form : null;
  }

  const isBulk = appMode === "BULK" && applicants.length > 1;

  // Build key-value map for dynamic service fields from activeApplicant.formFieldValues
  const dynamicValuesRecord: Record<string, string> = {};
  if (activeApplicant.formFieldValues && Array.isArray(activeApplicant.formFieldValues)) {
    activeApplicant.formFieldValues.forEach((fv) => {
      if (fv.fieldId) dynamicValuesRecord[fv.fieldId] = fv.value;
      if (fv.fieldLabel) dynamicValuesRecord[fv.fieldLabel] = fv.value;
    });
  }

  useEffect(() => {
    if (!effectiveForm || !effectiveForm.sections || effectiveForm.sections.length === 0) {
      onRequiredFieldsChange?.([]);
      return;
    }

    const matchedVariantItem = variants.find((v) => String(v.id) === String(activeApplicant.selectedVariantId));
    const matchedElementItem = variantElements.find((e) => String(e.id) === String(activeApplicant.selectedElementId));

    const evaluationContext: FormEvaluationContext = {
      variantType: matchedVariantItem?.type ? String(matchedVariantItem.type) : undefined,
      variantId: activeApplicant.selectedVariantId,
      variantDescription: matchedVariantItem?.description || matchedVariantItem?.name,
      elementCodes: matchedElementItem?.code
        ? [matchedElementItem.code]
        : variantElements
            .map((e) => (typeof e.code === "string" ? e.code : undefined))
            .filter((c): c is string => Boolean(c)),
      applicantType: activeApplicant.applicantType,
      formValues: dynamicValuesRecord,
    };

    const requiredFieldIds: string[] = [];

    effectiveForm.sections.forEach((sec) => {
      if (!sec) return;
      const k = (sec.key || sec.id || "").trim().toLowerCase();
      const t = (sec.title || "").trim().toLowerCase();
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
        return;
      }

      const isBlockingSection =
        k === "request_type_and_device_details" ||
        k === "sim_details" ||
        k === "supporting_documents" ||
        k === "incident_and_demographic_info" ||
        t.includes("device particulars") ||
        t.includes("sim card") ||
        t.includes("proof of ownership") ||
        t.includes("incident details");

      const isComplaintSection =
        k === "particulars_of_service_provider" ||
        k === "nature_of_complaint" ||
        k === "complaint_details" ||
        t.includes("service provider") ||
        t.includes("nature of complaint") ||
        t.includes("details of complaint");

      const vDesc = (matchedVariantItem?.description || matchedVariantItem?.name || matchedVariantItem?.type || "").toLowerCase();
      const vId = String(activeApplicant.selectedVariantId || "").toLowerCase();
      const isUnblock = vDesc.includes("unblock") || vId.includes("402");
      const isBlock = (vDesc.includes("block") || vId.includes("401")) && !isUnblock;
      const isBlockOrUnblock = isBlock || isUnblock;
      const isSpam = (vDesc.includes("spam") || vDesc.includes("scam") || vDesc.includes("threat") || vId.includes("403")) && !vDesc.includes("tape");
      const isTelco = (vDesc.includes("telecommunications") || vDesc.includes("broadcast service") || vDesc.includes("provider") || vId.includes("404")) && !vDesc.includes("tape") && !isSpam;
      const isTape = vDesc.includes("tape") || vDesc.includes("preservation") || vId.includes("405");

      if (isBlockOrUnblock && isComplaintSection) return;
      if (!isBlockOrUnblock && isBlockingSection) return;

      if (isBlock) {
        if (k === "supporting_documents" || t.includes("proof of ownership")) return;
        if (k === "unblocking_details_section" || t.includes("unblocking")) return;
      }

      if (isUnblock) {
        if (k === "supporting_documents" || t.includes("proof of ownership")) return;
        if (k === "incident_and_demographic_info" || t.includes("incident details")) return;
      }

      if (isTape) {
        if (k === "nature_of_complaint" || t.includes("nature of complaint")) return;
        if (k === "particulars_of_service_provider" || t.includes("particulars of service provider")) return;
      } else {
        if (k === "broadcast_details" || t.includes("broadcast")) return;
      }

      if (!evaluateVisibilityCondition(sec.visibilityCondition, evaluationContext)) {
        return;
      }

      (sec.fields || []).forEach((field) => {
        if (!field || !field.isRequired) return;

        const rawTargetId = field.fieldId || field.id;
        const idLower = (rawTargetId || "").toLowerCase();
        const labelLower = (field.label || "").toLowerCase();
        if (
          rawTargetId?.toLowerCase().includes("declaration") ||
          labelLower.includes("declaration") ||
          labelLower.includes("i hereby declare") ||
          rawTargetId?.toLowerCase().includes("payment") ||
          labelLower.includes("official receipt") ||
          labelLower.includes("amount paid")
        ) {
          return;
        }

        if (isBlock || isUnblock) {
          if (idLower === "action_requested" || labelLower.includes("action requested")) return;
          if (idLower === "sex" || labelLower === "sex") return;
          if (idLower === "age_group" || labelLower.includes("age group")) return;
          if (idLower === "identity_proof_type" || idLower === "proof_of_ownership_type" || labelLower.includes("government identification") || labelLower.includes("proof of ownership")) return;
        }

        if (!evaluateVisibilityCondition(field.visibilityCondition, evaluationContext)) {
          return;
        }

        if (rawTargetId) {
          requiredFieldIds.push(rawTargetId);
        }
      });
    });

    const vDescOuter = (matchedVariantItem?.description || matchedVariantItem?.name || matchedVariantItem?.type || "").toLowerCase();
    const vIdOuter = String(activeApplicant.selectedVariantId || "").toLowerCase();
    const isUnblockOuter = vDescOuter.includes("unblock") || vIdOuter.includes("402");
    const isBlockOuter = (vDescOuter.includes("block") || vIdOuter.includes("401")) && !isUnblockOuter;
    const isSpamOuter = (vDescOuter.includes("spam") || vDescOuter.includes("scam") || vDescOuter.includes("threat") || vIdOuter.includes("403")) && !vDescOuter.includes("tape");
    const isTelcoOuter = (vDescOuter.includes("telecommunications") || vDescOuter.includes("broadcast service") || vDescOuter.includes("provider") || vIdOuter.includes("404")) && !vDescOuter.includes("tape") && !isSpamOuter;
    const isTapeOuter = vDescOuter.includes("tape") || vDescOuter.includes("preservation") || vIdOuter.includes("405");

    if (isUnblockOuter) {
      if (!requiredFieldIds.includes("date_of_filing")) requiredFieldIds.push("date_of_filing");
      if (!requiredFieldIds.includes("date_of_recovery")) requiredFieldIds.push("date_of_recovery");
      if (!requiredFieldIds.includes("unblocking_details")) requiredFieldIds.push("unblocking_details");
    }

    if (isBlockOuter) {
      const lossVal = dynamicValuesRecord["loss_reason"] || dynamicValuesRecord["Incident Type"] || "";
      if (lossVal === "Others" && !requiredFieldIds.includes("incident_others_specify")) {
        requiredFieldIds.push("incident_others_specify");
      }
    }

    if (isTapeOuter) {
      if (!requiredFieldIds.includes("broadcast_station")) requiredFieldIds.push("broadcast_station");
      if (!requiredFieldIds.includes("program_name")) requiredFieldIds.push("program_name");
      if (!requiredFieldIds.includes("time_of_airing")) requiredFieldIds.push("time_of_airing");
      if (!requiredFieldIds.includes("anchor_commentator")) requiredFieldIds.push("anchor_commentator");
      if (!requiredFieldIds.includes("date_of_incident")) requiredFieldIds.push("date_of_incident");
      if (!requiredFieldIds.includes("state_briefly_details")) requiredFieldIds.push("state_briefly_details");
    }

    if (isSpamOuter || isTelcoOuter) {
      const complaintVal = dynamicValuesRecord["complaint_types"] || dynamicValuesRecord["Nature of Complaint"] || "";
      if (complaintVal.toLowerCase().includes("others") && !requiredFieldIds.includes("others_specification")) {
        requiredFieldIds.push("others_specification");
      }
    }

    const isCopyOfPermitOuter = isCopyOfPermit;

    if (isCopyOfPermitOuter) {
      // Clear any legacy permit fields that might have leaked into requiredFieldIds
      const legacyPermitKeys = ["stationclass", "callsign", "permitrslno", "frequency", "bandwidth", "poweroutput"];
      for (let i = requiredFieldIds.length - 1; i >= 0; i--) {
        const idLower = (requiredFieldIds[i] || "").toLowerCase();
        if (legacyPermitKeys.some((k) => idLower.includes(k))) {
          requiredFieldIds.splice(i, 1);
        }
      }

      if (!requiredFieldIds.includes("detailsService")) requiredFieldIds.push("detailsService");
      if (!requiredFieldIds.includes("targetPermitType")) requiredFieldIds.push("targetPermitType");
      if (!requiredFieldIds.includes("permitNo")) requiredFieldIds.push("permitNo");
      const isDuplicateOuter = vDescOuter.includes("duplicate") || vIdOuter.includes("151");
      if (isDuplicateOuter) {
        if (!requiredFieldIds.includes("circumstances")) requiredFieldIds.push("circumstances");
        const noOfCopiesIdx = requiredFieldIds.indexOf("noOfCopies");
        if (noOfCopiesIdx !== -1) requiredFieldIds.splice(noOfCopiesIdx, 1);
        const noOfCopiesGuidIdx = requiredFieldIds.indexOf("fd000000-0000-0000-0000-000000000243");
        if (noOfCopiesGuidIdx !== -1) requiredFieldIds.splice(noOfCopiesGuidIdx, 1);
      } else {
        if (!requiredFieldIds.includes("noOfCopies")) requiredFieldIds.push("noOfCopies");
        const circIdx = requiredFieldIds.indexOf("circumstances");
        if (circIdx !== -1) requiredFieldIds.splice(circIdx, 1);
        const circGuidIdx = requiredFieldIds.indexOf("fd000000-0000-0000-0000-000000000037");
        if (circGuidIdx !== -1) requiredFieldIds.splice(circGuidIdx, 1);
      }
    }

    onRequiredFieldsChange?.(requiredFieldIds);
  }, [
    effectiveForm,
    activeApplicant.selectedVariantId,
    activeApplicant.selectedElementId,
    activeApplicant.applicantType,
    onRequiredFieldsChange,
    variants,
    isCopyOfPermit,
  ]);

  const handleDynamicFieldChange = (fieldId: string, fieldLabel: string, value: string) => {
    updateActiveApplicant((prevApp) => {
      const currentArr = prevApp.formFieldValues || [];
      const fIdLower = fieldId.toLowerCase().trim();
      const lblLower = fieldLabel.toLowerCase().trim();

      const isMatchingField = (item: { fieldId: string; fieldLabel: string }) => {
        const itemFId = (item.fieldId || '').toLowerCase().trim();
        const itemLbl = (item.fieldLabel || '').toLowerCase().trim();
        if (itemFId === fIdLower) return true;
        if (lblLower.length > 0 && itemLbl === lblLower) return true;

        const isPermitServiceAlias =
          (fIdLower.includes('detailsservice') || fIdLower.includes('details_service') || fIdLower === 'fd000000-0000-0000-0000-000000000244') &&
          (itemFId.includes('detailsservice') || itemFId.includes('details_service') || itemFId === 'fd000000-0000-0000-0000-000000000244' || itemLbl.includes('detailsservice'));
        if (isPermitServiceAlias) return true;

        const isPermitTypeAlias =
          (fIdLower.includes('targetpermittype') || fIdLower.includes('target_permit_type') || fIdLower === 'fd000000-0000-0000-0000-000000000245') &&
          (itemFId.includes('targetpermittype') || itemFId.includes('target_permit_type') || itemFId === 'fd000000-0000-0000-0000-000000000245' || itemLbl === 'type');
        if (isPermitTypeAlias) return true;

        const isCopiesAlias =
          (fIdLower.includes('copies') || fIdLower === 'fd000000-0000-0000-0000-000000000243') &&
          (itemFId.includes('copies') || itemFId === 'fd000000-0000-0000-0000-000000000243' || itemLbl.includes('copies'));
        if (isCopiesAlias) return true;

        const isPermitNoAlias =
          (fIdLower.includes('permitno') || fIdLower.includes('permit_no') || fIdLower === 'fd000000-0000-0000-0000-000000000246') &&
          (itemFId.includes('permitno') || itemFId.includes('permit_no') || itemFId === 'fd000000-0000-0000-0000-000000000246' || itemLbl.includes('permit no'));
        if (isPermitNoAlias) return true;

        return false;
      };

      const filtered = currentArr.filter((item) => !isMatchingField(item));
      const nextArr = [...filtered, { fieldId, fieldLabel, value }];

      const isCopyOfPermitService = isCopyOfPermit;

      let nextCopyOfPermit = prevApp.copyOfPermitData;
      if (isCopyOfPermitService) {
        nextCopyOfPermit = {
          ...(prevApp.copyOfPermitData || initialCopyOfPermitData(prevApp.id)),
        };
        const fIdLower = fieldId.toLowerCase();
        const lblLower = fieldLabel.toLowerCase();
        if (fIdLower.includes("detailsservice") || fIdLower.includes("details_service") || lblLower.includes("detailsservice")) {
          nextCopyOfPermit.detailsService = value;
        } else if (fIdLower.includes("targetpermittype") || fIdLower.includes("target_permit_type") || lblLower === "type") {
          nextCopyOfPermit.targetPermitType = value;
        } else if (fIdLower.includes("permitno") || fIdLower.includes("permit_no") || lblLower.includes("permit no")) {
          nextCopyOfPermit.permitNo = value;
        } else if (fIdLower.includes("copies") || lblLower.includes("copies")) {
          nextCopyOfPermit.numberOfCopies = value;
        } else if (fIdLower.includes("circumstances") || lblLower.includes("circumstances")) {
          nextCopyOfPermit.circumstances = value;
        }
      }

      return {
        formFieldValues: nextArr,
        ...(nextCopyOfPermit ? { copyOfPermitData: nextCopyOfPermit } : {}),
      };
    });
  };

  // Auto-set and lock "Action Requested" for NTC 1-24 Blocking / Unblocking service requests
  useEffect(() => {
    if (!activeApplicant.selectedVariantId) return;
    const matchedVariantItem = variants.find((v) => String(v.id) === String(activeApplicant.selectedVariantId));
    const desc = (matchedVariantItem?.description || matchedVariantItem?.name || matchedVariantItem?.type || activeApplicant.selectedVariantName || "").toLowerCase();
    const varId = String(activeApplicant.selectedVariantId).toLowerCase();
    const isUnblocking = desc.includes("unblock") || varId.includes("402");
    const isBlocking = (desc.includes("block") || varId.includes("401")) && !isUnblocking;

    if (isBlocking || isUnblocking) {
      const targetVal = isUnblocking ? "UNBLOCK GSM Handset" : "BLOCK GSM Handset";
      let schemaFieldId = "fd000000-0000-0000-0000-000000000307";
      if (form?.sections) {
        for (const s of form.sections) {
          const fld = s.fields?.find((f) => (f.label || "").toLowerCase().includes("action requested") || (f.fieldId || f.id) === "action_requested");
          if (fld) {
            schemaFieldId = fld.fieldId || fld.id || schemaFieldId;
            break;
          }
        }
      }

      const currentValByGuid = dynamicValuesRecord[schemaFieldId];
      const currentValByName = dynamicValuesRecord["action_requested"] || dynamicValuesRecord["Action Requested"];
      if (currentValByGuid !== targetVal || currentValByName !== targetVal) {
        updateActiveApplicant((prevApp) => {
          const currentArr = prevApp.formFieldValues || [];
          const filtered = currentArr.filter(
            (item) => item.fieldId !== schemaFieldId && item.fieldId !== "action_requested" && item.fieldId !== "fd000000-0000-0000-0000-000000000307" && (item.fieldLabel || "").toLowerCase() !== "action requested"
          );
          return {
            formFieldValues: [
              ...filtered,
              { fieldId: schemaFieldId, fieldLabel: "Action Requested", value: targetVal },
              { fieldId: "action_requested", fieldLabel: "Action Requested", value: targetVal },
            ],
          };
        });
      }
    }
  }, [activeApplicant.selectedVariantId, activeApplicant.selectedVariantName, variants, form, dynamicValuesRecord, updateActiveApplicant]);

  const matchedVariant = variants.find((v) => String(v.id) === String(activeApplicant.selectedVariantId));
  const allowCompany = matchedVariant?.isIndividual === false || (!matchedVariant && !isExamService);

  const renderBulkCohortBanner = () => {
    if (!isBulk) return null;

    return (
      <View style={styles.bulkBanner}>
        <View style={styles.bulkHeaderRow}>
          <View style={styles.bulkTitleContainer}>
            <Icon name="users" size={18} color={COLORS.brand[700]} />
            <Text style={styles.bulkBannerTitle}>
              Bulk Roster Applicant {currentApplicantIndex + 1} of {applicants.length}
            </Text>
          </View>
          <Text style={styles.applicantBadge}>
            {getApplicantDisplayName(activeApplicant, currentApplicantIndex + 1)}
          </Text>
        </View>

        {setCurrentApplicantIndex && (
          <View style={styles.carouselRow}>
            {applicants.map((app, idx) => {
              const isSelected = idx === currentApplicantIndex;
              const displayName = getApplicantDisplayName(app, idx + 1);
              return (
                <TouchableOpacity
                  key={`applicant-tab-${app.id || idx}`}
                  style={[styles.carouselTab, isSelected && styles.carouselTabSelected]}
                  onPress={() => setCurrentApplicantIndex(idx)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.carouselTabText, isSelected && styles.carouselTabTextSelected]}>
                    #{idx + 1} {displayName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderBulkCohortBanner()}

      {/* 1. Standardized Applicant Particulars Section */}
      <ApplicantInformationFormSection
        applicant={activeApplicant}
        onChange={(partial) => updateActiveApplicant(partial)}
        allowCompany={allowCompany}
        isExamService={isExamService}
        includeSignature={false}
        errors={errors}
        title={isBulk ? `Applicant #${currentApplicantIndex + 1} Information` : "Applicant Particulars"}
      />

      {/* 2. Dynamic Service Specifications Section (100% Schema-Driven from Form Builder) */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.brand[700]} />
          <Text style={styles.loadingText}>Loading dynamic service specifications...</Text>
        </View>
      ) : effectiveForm && effectiveForm.sections && effectiveForm.sections.length > 0 ? (
        <DynamicFormRenderer
          key={`dynamic-form-${activeApplicant.id || currentApplicantIndex}`}
          form={effectiveForm}
          values={dynamicValuesRecord}
          onChange={handleDynamicFieldChange}
          applicantName={getApplicantDisplayName(activeApplicant)}
          applicantType={activeApplicant.applicantType}
          serviceCategory={service.category}
          serviceTitle={service.title}
          selectedVariantId={activeApplicant.selectedVariantId}
          selectedElementId={activeApplicant.selectedElementId}
          variants={variants}
          variantElements={variantElements}
          errors={errors}
          appMode={appMode}
          isBulk={isBulk}
        />
      ) : null}

      {/* 3. Acknowledgement & Digital Signature (Standardized at the end of the form) */}
      <View style={styles.signatureCard}>
        <View style={styles.signatureHeaderRow}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconCircleText}>✓</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.signatureHeading}>Acknowledgement & Digital Signature</Text>
            <Text style={styles.signatureSubtext}>
              Please affix or upload your digital signature below. By signing, you certify that all information submitted in this application is true, correct, and complete.
            </Text>
          </View>
        </View>
        <FormSignatureInput
          label="Applicant / Authorized Representative Signature"
          isRequired={true}
          value={activeApplicant.signatureUrl || ""}
          onChange={(sigUrl) => updateActiveApplicant({ signatureUrl: sigUrl })}
          applicantName={getApplicantDisplayName(activeApplicant)}
          isBulk={isBulk}
          appMode={appMode}
          error={errors["signatureUrl"] || errors["signature"]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  bulkBanner: {
    backgroundColor: COLORS.brand.light,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  bulkHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  bulkTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bulkBannerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.brand[900],
  },
  applicantBadge: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.brand[900],
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  carouselRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  carouselTab: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  carouselTabSelected: {
    backgroundColor: COLORS.brand[700],
    borderColor: COLORS.brand[800],
  },
  carouselTabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.neutral[700],
  },
  carouselTabTextSelected: {
    fontWeight: "700",
    color: COLORS.neutral.white,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
  },
  signatureCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    marginTop: 8,
    marginBottom: 20,
    shadowColor: COLORS.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 14,
  },
  signatureHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.brand[50],
    borderWidth: 1,
    borderColor: COLORS.brand[200],
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.brand[700],
  },
  signatureHeading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.neutral[900],
  },
  signatureSubtext: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  loadingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
  },
});
