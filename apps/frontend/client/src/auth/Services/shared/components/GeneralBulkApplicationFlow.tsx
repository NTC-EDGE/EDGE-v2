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
} from "../hooks/useGeneralServiceWizard";
import { GeneralFilingDetailsStep } from "./GeneralFilingDetailsStep";
import { GeneralDocumentUploadStep } from "./GeneralDocumentUploadStep";
import { isGeneralApplicantComplete } from "../GeneralBulkApplicantsPanel";
import { validateContactNumber, validateEmailAddress } from "../../../../shared/helpers/fieldValidators";
import { FIELD_ID_CONTACT_NO, FIELD_ID_EMAIL } from "../../../../shared/constants/fieldIds";

// ─── Types ─────────────────────────────────────────────────────────────────
type BulkSubView = "FILING_DETAILS" | "DOCUMENT_UPLOAD";

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
}: GeneralBulkApplicationFlowProps) {
  const [subView, setSubView] = useState<BulkSubView>("FILING_DETAILS");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const prevTrigger = React.useRef(triggerOpenApplicant);

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
  };

  const completeCount = applicants.filter((app) =>
    isGeneralApplicantComplete(app, service, variantRequirements)
  ).length;
  const allComplete = completeCount === applicants.length && applicants.length > 0;

  // ── Validation ─────────────────────────────────────────────────────────────
  const handleFilingDetailsNext = () => {
    const errors: Record<string, string> = {};

    if (dynamicRequiredFieldIds && dynamicRequiredFieldIds.length > 0) {
      const fieldValues = activeApplicant?.formFieldValues || [];
      const filledMap = new Map(fieldValues.map((fv) => [fv.fieldId, fv.value]));

      // 1. Missing required fields check
      dynamicRequiredFieldIds.forEach((id) => {
        const val = filledMap.get(id);
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
    } else {
      if (!activeApplicant?.firstName || activeApplicant.firstName.trim() === "") errors.firstName = "First Name is required.";
      if (!activeApplicant?.lastName || activeApplicant.lastName.trim() === "") errors.lastName = "Last Name is required.";

      const emailErr = validateEmailAddress(activeApplicant?.email);
      if (emailErr) errors.email = emailErr;

      const contactErr = validateContactNumber(activeApplicant?.contactNo);
      if (contactErr) errors.contactNo = contactErr;
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
    onSaveDraft?.();
    if (currentApplicantIndex < applicants.length - 1) {
      setCurrentApplicantIndex(currentApplicantIndex + 1);
      setSubView("FILING_DETAILS");
    } else {
      onSubmitAll();
    }
  };

  const handleBottomBack = () => {
    if (subView === "DOCUMENT_UPLOAD") {
      setSubView("FILING_DETAILS");
    } else if (currentApplicantIndex > 0) {
      setCurrentApplicantIndex(currentApplicantIndex - 1);
      setSubView("FILING_DETAILS");
    } else {
      onBack?.();
    }
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
              Bulk / Corporate Filing — {subView === "FILING_DETAILS" ? "Applicant Information & Parameters" : "Mandatory Document Attachments"}
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
        ) : (
          <GeneralDocumentUploadStep
            service={service}
            activeApplicant={activeApplicant}
            variantRequirements={variantRequirements}
            isWeb={isWeb}
            onUploadPress={(req, file) => {
              const cur = { ...activeApplicant.uploads };
              cur[req] = file;
              updateActiveApplicant({ uploads: cur });
            }}
            onRemoveUpload={(req) => {
              const cur = { ...activeApplicant.uploads };
              delete cur[req];
              updateActiveApplicant({ uploads: cur });
            }}
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
                APPLICANT {currentApplicantIndex + 1}/{applicants.length} · {subView === "FILING_DETAILS" ? "DETAILS" : "DOCS"}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {(subView === "DOCUMENT_UPLOAD" || currentApplicantIndex > 0) && (
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
                  {subView === "DOCUMENT_UPLOAD" ? "Back to Details" : "Prev Applicant"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={subView === "FILING_DETAILS" ? handleFilingDetailsNext : handleDocumentUploadNext}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: subView === "DOCUMENT_UPLOAD" && currentApplicantIndex === applicants.length - 1 ? "#16A34A" : "#0F2C59",
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 24,
                minWidth: 140,
                shadowColor: "#0F2C59",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13.5, fontWeight: "700", color: "#FFFFFF" }}>
                {subView === "FILING_DETAILS"
                  ? "Proceed to Documents"
                  : currentApplicantIndex < applicants.length - 1
                  ? "Next Applicant"
                  : "Review & Submit Bulk Cohort"}
              </Text>
              <Icon
                name={subView === "DOCUMENT_UPLOAD" && currentApplicantIndex === applicants.length - 1 ? "check-circle" : "arrow-right"}
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
