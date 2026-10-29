import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
import { NTCService } from "../../data/servicesData";
import {
  GeneralApplicantData,
  ServiceRequirementItem,
  ServiceVariantInfo,
  ServiceVariantElementInfo,
  initialGeneralApplicant,
  isRequirementMandatory,
  isRequirementUploaded,
} from "../hooks/useGeneralServiceWizard";
import { GeneralFilingDetailsStep } from "./GeneralFilingDetailsStep";
import { GeneralDocumentUploadStep } from "./GeneralDocumentUploadStep";
import { GeneralReviewSubmitStep } from "./GeneralReviewSubmitStep";
import { TenantInfo, OfficeInfo, ExamScheduleItem } from "../types/generalApplicantTypes";
import { isGeneralApplicantComplete } from "../GeneralBulkApplicantsPanel";
import { validateContactNumber, validateEmailAddress } from "../../../../shared/helpers/fieldValidators";
import {
  FIELD_ID_FULL_NAME,
  FIELD_ID_CONTACT_NO,
  FIELD_ID_EMAIL,
  FIELD_ID_REGION,
  FIELD_ID_PROVINCE,
  FIELD_ID_CITY,
  FIELD_ID_BARANGAY,
  FIELD_ID_STREET,
  FIELD_ID_ADDRESS,
  FIELD_ID_ZIP_CODE,
  FIELD_ID_INVOICE_NUMBER,
} from "../../../../shared/constants/fieldIds";

// ─── Types ─────────────────────────────────────────────────────────────────
type BulkSubView = "FILING_DETAILS" | "DOCUMENT_UPLOAD" | "REVIEW";

interface GeneralBulkApplicationFlowProps {
  service: NTCService;
  applicants: GeneralApplicantData[];
  setApplicants: React.Dispatch<React.SetStateAction<GeneralApplicantData[]>>;
  currentApplicantIndex: number;
  setCurrentApplicantIndex: (idx: number) => void;
  /** Increment to trigger opening Filing Details for currentApplicantIndex from the left panel */
  triggerOpenApplicant?: number;
  variantRequirements?: Array<ServiceRequirementItem | string>;
  onBack?: () => void;
  onSubmitAll: () => void;
  isWeb: boolean;
  dynamicRequiredFieldIds?: string[];
  setDynamicRequiredFieldIds?: (ids: string[]) => void;
  variants?: ServiceVariantInfo[];
  variantElements?: ServiceVariantElementInfo[];
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
  tenants?: TenantInfo[];
  offices?: OfficeInfo[];
  selectedRegionId?: string;
  selectedOfficeId?: string;
  schedules?: ExamScheduleItem[];
  selectedScheduleId?: string | null;
  filingIntent?: "Regular" | "AssessmentOnly";
  onFilingIntentChange?: (intent: "Regular" | "AssessmentOnly") => void;
  triggerBulkSubmit?: number;
}

import { getApplicantDisplayName } from "../helpers/applicantDisplayHelper";

// ─── Main Component ────────────────────────────────────────────────────────
export function GeneralBulkApplicationFlow({
  service,
  applicants,
  setApplicants,
  currentApplicantIndex,
  setCurrentApplicantIndex,
  triggerOpenApplicant = 0,
  variantRequirements = [],
  onBack,
  onSubmitAll,
  isWeb,
  dynamicRequiredFieldIds = [],
  setDynamicRequiredFieldIds,
  variants = [],
  variantElements = [],
  onSaveDraft,
  isSavingDraft = false,
  tenants = [],
  offices = [],
  selectedRegionId = "",
  selectedOfficeId = "",
  schedules = [],
  selectedScheduleId = null,
  filingIntent = "Regular",
  onFilingIntentChange,
  triggerBulkSubmit = 0,
}: GeneralBulkApplicationFlowProps) {
  const [subView, setSubView] = useState<BulkSubView>("FILING_DETAILS");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const prevTrigger = React.useRef(triggerOpenApplicant);

  const clearFieldError = React.useCallback((...fieldKeys: string[]) => {
    setFormErrors((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const k of fieldKeys) {
        if (next[k]) {
          delete next[k];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, []);

  // React to left-panel applicant selection
  React.useEffect(() => {
    if (triggerOpenApplicant !== prevTrigger.current) {
      prevTrigger.current = triggerOpenApplicant;
      setFormErrors({});
      setSubView("FILING_DETAILS");
    }
  }, [triggerOpenApplicant]);

  const activeApplicant = applicants[currentApplicantIndex] || applicants[0];

  if (applicants.length === 0 || !activeApplicant) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center", padding: 32 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
          <Icon name="users" size={32} color="#1D4ED8" />
        </View>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 18, fontWeight: "700", color: "#0F172A", marginBottom: 8, textAlign: "center" }}>
          No Applicants in Cohort
        </Text>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: "#64748B", marginBottom: 24, textAlign: "center", maxWidth: 400, lineHeight: 20 }}>
          All applicant entries have been removed. Add an applicant to proceed with the bulk filing.
        </Text>
        <TouchableOpacity
          onPress={() => {
            const newApp = initialGeneralApplicant(1);
            setApplicants([newApp]);
            setCurrentApplicantIndex(0);
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: "#1D4ED8",
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 10,
          }}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={16} color="#FFFFFF" />
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: "#FFFFFF" }}>
            Add Applicant
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const updateActiveApplicant = (
    fields: Partial<GeneralApplicantData> | ((prevApp: GeneralApplicantData) => Partial<GeneralApplicantData>)
  ) => {
    setApplicants((prev) => {
      const updated = [...prev];
      const current = updated[currentApplicantIndex];
      if (current) {
        const resolved = typeof fields === "function" ? fields(current) : fields;
        updated[currentApplicantIndex] = { ...current, ...resolved };
      }
      return updated;
    });
    if (typeof fields !== "function") {
      const keysToClear: string[] = [];
      for (const [key, val] of Object.entries(fields)) {
        if (val !== undefined && val !== null && val !== "") {
          keysToClear.push(key);
        }
      }
      if (Array.isArray(fields.formFieldValues)) {
        for (const fv of fields.formFieldValues) {
          if (fv.value && fv.value.trim() !== "") {
            keysToClear.push(fv.fieldId);
          }
        }
      }
      if (keysToClear.length > 0) {
        clearFieldError(...keysToClear);
      }
    }
  };

  const completeCount = applicants.filter((app) =>
    isGeneralApplicantComplete(app, service, variantRequirements)
  ).length;
  const allComplete = completeCount === applicants.length && applicants.length > 0;

  // ── Validation ─────────────────────────────────────────────────────────────
  const handleFilingDetailsNext = () => {
    const errors: Record<string, string> = {};

    // 1. Validate Standard Applicant Details (ApplicantInformationFormSection)
    const isCompany = activeApplicant?.applicantType === "company";

    if (isCompany) {
      if (!activeApplicant?.companyName || activeApplicant.companyName.trim() === "") {
        errors.companyName = "Registered Business / Company Name is required.";
      }
      if (!activeApplicant?.representativeFirstName || activeApplicant.representativeFirstName.trim() === "") {
        errors.representativeFirstName = "Representative First Name is required.";
      }
      if (!activeApplicant?.representativeLastName || activeApplicant.representativeLastName.trim() === "") {
        errors.representativeLastName = "Representative Last Name is required.";
      }
      if (!activeApplicant?.representativePosition || activeApplicant.representativePosition.trim() === "") {
        errors.representativePosition = "Representative Position is required.";
      }
    } else {
      if (!activeApplicant?.firstName || activeApplicant.firstName.trim() === "") {
        errors.firstName = "First Name is required.";
      }
      if (!activeApplicant?.lastName || activeApplicant.lastName.trim() === "") {
        errors.lastName = "Last Name is required.";
      }
      if (!activeApplicant?.birthMonth || activeApplicant.birthMonth.trim() === "") {
        errors.birthMonth = "Birth Month is required.";
      }
      if (!activeApplicant?.birthDay || activeApplicant.birthDay.trim() === "") {
        errors.birthDay = "Birth Day is required.";
      }
      if (!activeApplicant?.birthYear || activeApplicant.birthYear.trim() === "") {
        errors.birthYear = "Birth Year is required.";
      }
      if (!activeApplicant?.sex || activeApplicant.sex.trim() === "") {
        errors.sex = "Sex is required.";
      }
      if (!activeApplicant?.civilStatus || activeApplicant.civilStatus.trim() === "") {
        errors.civilStatus = "Civil Status is required.";
      }
    }

    const emailErr = validateEmailAddress(activeApplicant?.email);
    if (emailErr) {
      errors.email = emailErr;
    }

    const contactErr = validateContactNumber(activeApplicant?.contactNo);
    if (contactErr) {
      errors.contactNo = contactErr;
    }

    if (!activeApplicant?.region || activeApplicant.region.trim() === "") {
      errors.region = "Region is required.";
    }
    if (!activeApplicant?.province || activeApplicant.province.trim() === "") {
      errors.province = "Province is required.";
    }
    if (!activeApplicant?.city || activeApplicant.city.trim() === "") {
      errors.city = "City / Municipality is required.";
    }
    if (!activeApplicant?.barangay || activeApplicant.barangay.trim() === "") {
      errors.barangay = "Barangay is required.";
    }
    const streetAddr = (activeApplicant?.street || activeApplicant?.address || "").trim();
    if (streetAddr === "") {
      errors.street = "Street Address / Unit No. is required.";
      errors.address = "Street Address / Unit No. is required.";
    }

    if (!activeApplicant?.signatureUrl || activeApplicant.signatureUrl.trim() === "") {
      errors.signatureUrl = "Digital Signature is required.";
      errors.signature = "Digital Signature is required.";
    }

    if (dynamicRequiredFieldIds && dynamicRequiredFieldIds.length > 0) {
      const fieldValues = activeApplicant?.formFieldValues || [];
      const filledMap = new Map<string, string>();
      fieldValues.forEach((fv) => {
        if (fv.fieldId) filledMap.set(fv.fieldId.toLowerCase().trim(), fv.value);
        if (fv.fieldLabel) filledMap.set(fv.fieldLabel.toLowerCase().trim(), fv.value);
      });

      // 1. Missing required fields check
      dynamicRequiredFieldIds.forEach((id) => {
        const idLower = (id || "").toLowerCase().trim();

        // Skip declaration or payment fields in Step 3
        if (
          idLower.includes("declaration") ||
          idLower.includes("signature") ||
          idLower.includes("payment") ||
          idLower.includes("receipt") ||
          idLower === "fd000000-0000-0000-0000-000000000006" ||
          idLower === "fd000000-0000-0000-0000-000000000007" ||
          idLower === "fd000000-0000-0000-0000-000000000008" ||
          idLower === "fd000000-0000-0000-0000-000000000009"
        ) {
          return;
        }

        // Skip exam details validation for Amateur Certificates
        const isAmateurCertService = (service.category || "").toLowerCase().includes("certificate") && ((service.title || "").toLowerCase().includes("amateur") || (service.id || "").toLowerCase().includes("103") || (service.id || "").toLowerCase().includes("ntc_1_03"));
        const isExamField = idLower.includes("exam") || idLower.includes("seminar") || idLower.includes("rating");
        if (isAmateurCertService && isExamField) {
          return;
        }

        // Skip DTI / SEC registration validation if empty (optional field on registration forms)
        const isDtiSecField =
          idLower === "fd000000-0000-0000-0000-000000000086" ||
          idLower === "dtisecregistration" ||
          idLower === "dti_sec_registration" ||
          idLower.includes("sec") ||
          idLower.includes("dti");
        if (isDtiSecField) {
          return;
        }

        // Skip repeater individual subfields
        const isRepeaterSubField =
          idLower === "serialnumber" ||
          idLower === "serial_number" ||
          idLower === "serial number" ||
          idLower === "serialnumbers" ||
          idLower === "serial number(s)" ||
          idLower === "frequencyrange" ||
          idLower === "frequency_range" ||
          idLower === "frequency range" ||
          idLower === "poweroutput" ||
          idLower === "power_output" ||
          idLower === "power output" ||
          idLower === "make" ||
          idLower === "model" ||
          idLower === "type/model" ||
          idLower === "maketypeModel" ||
          idLower === "make / type / model" ||
          idLower === "deviceType" ||
          idLower === "device / equipment type" ||
          idLower === "fd000000-0000-0000-0000-000000000084" ||
          idLower === "fd000000-0000-0000-0000-000000000085" ||
          idLower === "fd000000-0000-0000-0000-000000000087";
        if (isRepeaterSubField) {
          return;
        }

        // Skip invoice validation for Dealers
        const isInvoiceId =
          idLower === FIELD_ID_INVOICE_NUMBER.toLowerCase() ||
          idLower === "invoicenumber" ||
          idLower === "invoiceno" ||
          idLower.includes("invoice");

        if (isInvoiceId) {
          const matchedVar = variants?.find((v) => String(v.id) === String(activeApplicant?.selectedVariantId));
          const varDesc = (matchedVar?.description || matchedVar?.name || "").toLowerCase();
          const isNonDealerVariant = varDesc.includes("non-dealer") || varDesc.includes("non dealer") || String(activeApplicant?.selectedVariantId).endsWith("23");
          const registrationTypeVal = (activeApplicant?.formFieldValues?.find(fv => (fv.fieldLabel || "").toLowerCase().includes("registration type"))?.value || activeApplicant?.deviceRegData?.registrationType || "").toLowerCase();
          const isNonDealerRegType = registrationTypeVal.includes("non");
          const isDealer = varDesc.includes("dealer") && !isNonDealerVariant;

          if (isDealer || (!isNonDealerVariant && !isNonDealerRegType)) {
            return;
          }
        }

        // Skip Source of Equipment fields (optional section)
        const isSourceOfEquipmentField =
          idLower === "dealername" ||
          idLower === "name of dealer" ||
          idLower === "authorizedsellerbuyer" ||
          idLower === "authorized seller/buyer" ||
          idLower === "authorized seller / buyer" ||
          idLower === "orinvoiceno" ||
          idLower === "or/invoice no," ||
          idLower === "or/invoice no." ||
          idLower === "or/invoice no" ||
          idLower === "permitrslno" ||
          idLower === "permit/rsl no." ||
          idLower === "permit/rsl no" ||
          idLower === "selleraddress" ||
          idLower === "seller address" ||
          idLower === "fd000000-0000-0000-0000-000000000120" ||
          idLower === "fd000000-0000-0000-0000-000000000121" ||
          idLower === "fd000000-0000-0000-0000-000000000122" ||
          idLower === "fd000000-0000-0000-0000-000000000123" ||
          idLower === "fd000000-0000-0000-0000-000000000124";
        if (isSourceOfEquipmentField) {
          return;
        }

        // Skip Intended Use fields (optional section)
        const isIntendedUseField =
          idLower === "intendeduse" ||
          idLower === "intendedusetype" ||
          idLower === "intended_use" ||
          idLower === "intended use" ||
          idLower === "intended use of equipment" ||
          idLower.includes("intended use") ||
          idLower === "fd000000-0000-0000-0000-000000000126" ||
          idLower === "fd000000-0000-0000-0000-000000000127";
        if (isIntendedUseField) {
          return;
        }

        let val = filledMap.get(idLower);
        if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
          if (
            (idLower === FIELD_ID_FULL_NAME.toLowerCase() || idLower === "fullname" || idLower === "name" || idLower.includes("full name")) &&
            (activeApplicant?.firstName || activeApplicant?.lastName)
          ) {
            val = [activeApplicant?.firstName, activeApplicant?.middleName, activeApplicant?.lastName, activeApplicant?.suffix].filter(Boolean).join(" ");
          } else if (
            (idLower === FIELD_ID_CONTACT_NO.toLowerCase() || idLower === "contactno" || idLower.includes("contact") || idLower.includes("phone") || idLower.includes("mobile")) &&
            activeApplicant?.contactNo
          ) {
            val = activeApplicant.contactNo;
          } else if (
            (idLower === FIELD_ID_EMAIL.toLowerCase() || idLower === "email" || idLower.includes("email")) &&
            activeApplicant?.email
          ) {
            val = activeApplicant.email;
          } else if (
            (idLower === FIELD_ID_REGION.toLowerCase() || idLower === "region") &&
            activeApplicant?.region
          ) {
            val = activeApplicant.region;
          } else if (
            (idLower === FIELD_ID_PROVINCE.toLowerCase() || idLower === "province") &&
            activeApplicant?.province
          ) {
            val = activeApplicant.province;
          } else if (
            (idLower === FIELD_ID_CITY.toLowerCase() || idLower === "city" || idLower.includes("municipality")) &&
            activeApplicant?.city
          ) {
            val = activeApplicant.city;
          } else if (
            (idLower === FIELD_ID_BARANGAY.toLowerCase() || idLower === "barangay") &&
            activeApplicant?.barangay
          ) {
            val = activeApplicant.barangay;
          } else if (
            (idLower === FIELD_ID_STREET.toLowerCase() ||
              idLower === FIELD_ID_ADDRESS.toLowerCase() ||
              idLower === "street" ||
              idLower === "address" ||
              ((idLower.includes("address") || idLower.includes("street")) &&
                !idLower.includes("email") &&
                !idLower.includes("exam") &&
                !idLower.includes("seminar") &&
                !idLower.includes("station") &&
                !idLower.includes("seller") &&
                !idLower.includes("dealer"))) &&
            activeApplicant?.address
          ) {
            val = activeApplicant.address;
          } else if (
            (idLower === FIELD_ID_ZIP_CODE.toLowerCase() || idLower === "zipcode" || idLower.includes("zip") || idLower.includes("postal")) &&
            activeApplicant?.zipCode
          ) {
            val = activeApplicant.zipCode;
          } else if (
            (idLower === "fd000000-0000-0000-0000-000000000081" || idLower === "companyname" || idLower.includes("company")) &&
            activeApplicant?.companyName
          ) {
            val = activeApplicant.companyName;
          } else if (
            (idLower === "fd000000-0000-0000-0000-000000000082" || idLower === "representativename" || idLower.includes("representative")) &&
            activeApplicant?.representativeName
          ) {
            val = activeApplicant.representativeName;
          } else if (
            (idLower === "fd000000-0000-0000-0000-000000000083" || idLower === "representativeposition" || idLower.includes("position") || idLower.includes("designation")) &&
            activeApplicant?.representativePosition
          ) {
            val = activeApplicant.representativePosition;
          } else if (
            (idLower === "fd000000-0000-0000-0000-000000000086" || idLower === "dtisecregistration" || idLower.includes("sec") || idLower.includes("dti")) &&
            activeApplicant?.dtiSecRegistration
          ) {
            val = activeApplicant.dtiSecRegistration;
          }
        }
        const trimmed = val !== undefined && val !== null ? (typeof val === "string" ? val.trim() : String(val)) : "";
        if (trimmed === "" || trimmed === "false") {
          errors[id] = "This required field cannot be left blank.";
        }
      });

      // 2. Specific format validation for Contact Number and Email
      fieldValues.forEach((fv) => {
        const fId = (fv.fieldId || "").toLowerCase();
        const fLbl = (fv.fieldLabel || "").toLowerCase();
        const val = typeof fv.value === "string" ? fv.value.trim() : "";

        if (val.length > 0) {
          if (fId === FIELD_ID_CONTACT_NO || fLbl.includes("contact") || fLbl.includes("phone") || fLbl.includes("mobile")) {
            const err = validateContactNumber(val);
            if (err) errors[fv.fieldId] = err;
          } else if (fId === FIELD_ID_EMAIL || fLbl.includes("email")) {
            const err = validateEmailAddress(val);
            if (err) errors[fv.fieldId] = err;
          }
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstError = Object.values(errors)[0];
      Alert.alert("Validation Error", firstError || "Please fill in all required fields marked in red correctly.");
      return;
    }

    setFormErrors({});
    onSaveDraft?.();
    setSubView("DOCUMENT_UPLOAD");
  };

  const handleDocumentUploadNext = () => {
    const effectiveRequirements: Array<ServiceRequirementItem | string> =
      variantRequirements && variantRequirements.length > 0
        ? variantRequirements
        : service.requirements && service.requirements.length > 0
        ? service.requirements
        : [];

    const mandatoryList = effectiveRequirements
      .map((req, idx) => ({ req, idx }))
      .filter(({ req }) => isRequirementMandatory(req));

    if (mandatoryList.length > 0) {
      const missingMandatory = mandatoryList.filter(
        ({ req, idx }) => !isRequirementUploaded(req, idx, activeApplicant.uploads)
      );

      if (missingMandatory.length > 0) {
        const step4Errors: Record<string, string> = {};
        const missingTitles = missingMandatory.map(({ req, idx }) => {
          const title = typeof req === "string" ? req.replace(/\*$/, "").trim() : (req.name || req.label || req.title || `Requirement #${idx + 1}`).replace(/\*$/, "").trim();
          const reqId = typeof req === "object" && req !== null && req.id ? String(req.id).trim() : "";
          const primaryKey = reqId ? `req-${reqId}` : `req-${idx}`;
          step4Errors[primaryKey] = `${title} is required.`;
          if (reqId) step4Errors[reqId] = `${title} is required.`;
          step4Errors[`req-${idx}`] = `${title} is required.`;
          step4Errors[title] = `${title} is required.`;
          return title;
        });

        setFormErrors(step4Errors);
        Alert.alert(
          "Mandatory Attachment(s) Required",
          `Please attach the following required document(s) before proceeding:\n\n• ${missingTitles.join("\n• ")}`
        );
        return;
      }
    }

    setFormErrors({});
    onSaveDraft?.();
    if (currentApplicantIndex < applicants.length - 1) {
      setCurrentApplicantIndex(currentApplicantIndex + 1);
      setSubView("FILING_DETAILS");
    } else {
      setSubView("REVIEW");
    }
  };

  const handleBottomBack = () => {
    if (subView === "REVIEW") {
      setSubView("DOCUMENT_UPLOAD");
    } else if (subView === "DOCUMENT_UPLOAD") {
      setSubView("FILING_DETAILS");
    } else if (currentApplicantIndex > 0) {
      setCurrentApplicantIndex(currentApplicantIndex - 1);
      setSubView("DOCUMENT_UPLOAD");
    } else {
      onBack?.();
    }
  };

  const handleCohortReviewSubmit = () => {
    const incompleteCount = applicants.filter(
      (app) => !isGeneralApplicantComplete(app, service, variantRequirements)
    ).length;
    if (incompleteCount > 0) {
      Alert.alert(
        "Incomplete Applicants",
        `Cannot submit: ${incompleteCount} of ${applicants.length} applicant(s) are incomplete. Please complete all required personal details and document uploads before submitting.`
      );
      return;
    }
    onSubmitAll();
  };

  const name = getApplicantDisplayName(activeApplicant, currentApplicantIndex);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Page Header */}
        <View style={{ marginBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 20, fontWeight: "700", color: "#0F172A", marginBottom: 4 }}>
              {service.title}
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: "#64748B" }}>
              Bulk / Corporate Filing — {subView === "FILING_DETAILS" ? "Applicant Information & Parameters" : subView === "DOCUMENT_UPLOAD" ? "Mandatory Document Attachments" : "Cohort Summary Review & Statutory Fees"}
            </Text>
          </View>
          {onSaveDraft && (
            <TouchableOpacity
              onPress={onSaveDraft}
              disabled={isSavingDraft}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#CBD5E1",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Icon name="save" size={14} color="#0F2C59" />
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: "#0F2C59" }}>
                {isSavingDraft ? "Saving Draft..." : "Save Draft"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sub-header Banner */}
        <View
          style={{
            backgroundColor: "#EFF6FF",
            borderRadius: 12,
            padding: 14,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: "#93C5FD",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#1D4ED8", justifyContent: "center", alignItems: "center" }}>
              <Icon name={subView === "FILING_DETAILS" ? "users" : "paperclip"} size={16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: "#1E40AF" }}>
                BULK APPLICANT {currentApplicantIndex + 1} OF {applicants.length}
              </Text>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: "#2563EB", marginTop: 1 }} numberOfLines={1}>
                {name}
              </Text>
            </View>
          </View>
          <View style={{ backgroundColor: "#DBEAFE", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#1E40AF" }}>
              {subView === "FILING_DETAILS" ? "Step 1/2 · Details" : "Step 2/2 · Documents"}
            </Text>
          </View>
        </View>

        {/* Active Sub-step Body */}
        {subView === "FILING_DETAILS" ? (
          <GeneralFilingDetailsStep
            service={service}
            activeApplicant={activeApplicant}
            updateActiveApplicant={updateActiveApplicant}
            onRequiredFieldsChange={setDynamicRequiredFieldIds}
            errors={formErrors}
            variants={variants}
            variantElements={variantElements}
          />
        ) : subView === "DOCUMENT_UPLOAD" ? (
          <GeneralDocumentUploadStep
            service={service}
            activeApplicant={activeApplicant}
            variantRequirements={variantRequirements}
            isWeb={isWeb}
            onUploadPress={(req, file) => {
              clearFieldError(req);
              updateActiveApplicant((prev) => ({
                uploads: { ...(prev.uploads || {}), [req]: file },
              }));
            }}
            onRemoveUpload={(req) => {
              updateActiveApplicant((prev) => {
                const cur = { ...(prev.uploads || {}) };
                delete cur[req];
                return { uploads: cur };
              });
            }}
            errors={formErrors}
          />
        ) : (
          <GeneralReviewSubmitStep
            service={service}
            tenants={tenants}
            offices={offices}
            selectedRegionId={selectedRegionId || null}
            selectedOfficeId={selectedOfficeId || null}
            activeApplicant={activeApplicant}
            applicants={applicants}
            currentApplicantIndex={currentApplicantIndex}
            appMode="BULK"
            variants={variants}
            variantRequirements={variantRequirements}
            schedules={schedules}
            selectedScheduleId={selectedScheduleId}
            filingIntent={filingIntent}
            onFilingIntentChange={onFilingIntentChange}
            onSelectApplicant={setCurrentApplicantIndex}
          />
        )}
      </ScrollView>

      {/* ── Fixed Sticky Bottom Action Bar ── */}
      <View
        style={{
          width: "100%",
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E2E8F0",
          paddingVertical: 12,
          paddingHorizontal: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 8,
          zIndex: 50,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 1200,
            alignSelf: "center",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Progress / Cohort Counter Pill */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                backgroundColor: "#F1F5F9",
                borderRadius: 8,
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#475569" }}>
                APPLICANT {currentApplicantIndex + 1}/{applicants.length} · {subView === "FILING_DETAILS" ? "DETAILS" : subView === "DOCUMENT_UPLOAD" ? "DOCS" : "REVIEW"}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {(subView === "REVIEW" || subView === "DOCUMENT_UPLOAD" || currentApplicantIndex > 0) && (
              <TouchableOpacity
                onPress={handleBottomBack}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  borderWidth: 1.5,
                  borderColor: "#CBD5E1",
                  backgroundColor: "#FFFFFF",
                  borderRadius: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  minWidth: 110,
                }}
              >
                <Icon name="arrow-left" size={15} color={COLORS.neutral[700]} />
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: COLORS.neutral[700] }}>
                  {subView === "REVIEW" ? "Back to Documents" : subView === "DOCUMENT_UPLOAD" ? "Back to Details" : "Prev Applicant"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={
                subView === "FILING_DETAILS"
                  ? handleFilingDetailsNext
                  : subView === "DOCUMENT_UPLOAD"
                  ? handleDocumentUploadNext
                  : handleCohortReviewSubmit
              }
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: subView === "REVIEW" ? "#16A34A" : "#0F2C59",
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 24,
                minWidth: 140,
                shadowColor: subView === "REVIEW" ? "#16A34A" : "#0F2C59",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13.5, fontWeight: "700", color: "#FFFFFF" }}>
                {subView === "FILING_DETAILS"
                  ? "Proceed to Documents"
                  : subView === "DOCUMENT_UPLOAD"
                  ? (currentApplicantIndex < applicants.length - 1 ? "Next Applicant" : "Proceed to Cohort Review")
                  : `Confirm & Submit Cohort (${applicants.length})`}
              </Text>
              <Icon
                name={subView === "REVIEW" ? "check-circle" : "arrow-right"}
                size={15}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
