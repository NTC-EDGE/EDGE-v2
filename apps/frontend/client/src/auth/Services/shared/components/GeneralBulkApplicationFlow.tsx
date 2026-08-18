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
import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";
import { GeneralFilingDetailsStep } from "./GeneralFilingDetailsStep";
import { GeneralDocumentUploadStep } from "./GeneralDocumentUploadStep";
import { isGeneralApplicantComplete } from "../GeneralBulkApplicantsPanel";

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
  variantRequirements?: string[];
  onBack?: () => void;
  onSubmitAll: () => void;
  isWeb: boolean;
  dynamicRequiredFieldIds?: string[];
  setDynamicRequiredFieldIds?: (ids: string[]) => void;
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

      dynamicRequiredFieldIds.forEach((id) => {
        const val = filledMap.get(id);
        const trimmed = val !== undefined && val !== null ? (typeof val === "string" ? val.trim() : String(val)) : "";
        if (trimmed === "" || trimmed === "false") {
          errors[id] = "This required field cannot be left blank.";
        }
      });
    } else {
      if (!activeApplicant?.firstName) errors.firstName = "First Name is required.";
      if (!activeApplicant?.lastName) errors.lastName = "Last Name is required.";
      if (!activeApplicant?.email) errors.email = "Email Address is required.";
      if (!activeApplicant?.contactNo) errors.contactNo = "Contact Number is required.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      Alert.alert("Incomplete", "Please fill in all required fields before continuing.");
      return;
    }

    setFormErrors({});
    setSubView("DOCUMENT_UPLOAD");
  };

  // ─── Filing Details ────────────────────────────────────────────────────────
  const renderFilingDetails = () => {
    if (!activeApplicant) return null;
    const name = getApplicantDisplayName(activeApplicant, currentApplicantIndex);
    return (
      <View style={{ flex: 1 }}>
        {/* Sub-header banner */}
        <View
          style={{
            backgroundColor: "#EFF6FF",
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#93C5FD",
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#1D4ED8", justifyContent: "center", alignItems: "center" }}>
            <Icon name="users" size={16} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: "#1E40AF" }}>
              BULK FILING — Applicant {currentApplicantIndex + 1} of {applicants.length}
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: "#2563EB", marginTop: 1 }} numberOfLines={1}>
              {name}
            </Text>
          </View>
          <View style={{ backgroundColor: "#DBEAFE", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "700", color: "#1E40AF" }}>
              Step 1/2 · Details
            </Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <GeneralFilingDetailsStep
            service={service}
            activeApplicant={activeApplicant}
            updateActiveApplicant={updateActiveApplicant}
            onRequiredFieldsChange={setDynamicRequiredFieldIds}
            errors={formErrors}
          />
        </ScrollView>

        {/* Navigation */}
        <View style={{ flexDirection: "row", gap: 10, paddingTop: 12, borderTopWidth: 1, borderColor: "#E2E8F0", marginTop: 8 }}>
          <TouchableOpacity
            onPress={onBack}
            style={{ flex: 1, borderWidth: 1.5, borderColor: "#CBD5E1", backgroundColor: "#F8FAFC", borderRadius: 12, paddingVertical: 12, alignItems: "center" }}
          >
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#0F2C59" }}>← Back to Selection</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleFilingDetailsNext}
            style={{ flex: 1, backgroundColor: "#0F2C59", borderRadius: 12, paddingVertical: 12, alignItems: "center" }}
          >
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>Next →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── Document Upload ───────────────────────────────────────────────────────
  const renderDocumentUpload = () => {
    if (!activeApplicant) return null;
    const name = getApplicantDisplayName(activeApplicant, currentApplicantIndex);
    return (
      <View style={{ flex: 1 }}>
        {/* Sub-header banner */}
        <View
          style={{
            backgroundColor: "#EFF6FF",
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#93C5FD",
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#1D4ED8", justifyContent: "center", alignItems: "center" }}>
            <Icon name="paperclip" size={16} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: "#1E40AF" }}>
              BULK FILING — Applicant {currentApplicantIndex + 1} of {applicants.length}
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: "#2563EB", marginTop: 1 }} numberOfLines={1}>
              {name}
            </Text>
          </View>
          <View style={{ backgroundColor: "#DBEAFE", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "700", color: "#1E40AF" }}>
              Step 2/2 · Docs
            </Text>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
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
        </ScrollView>

        {/* Navigation */}
        <View style={{ flexDirection: "row", gap: 10, paddingTop: 12, borderTopWidth: 1, borderColor: "#E2E8F0", marginTop: 8 }}>
          <TouchableOpacity
            onPress={() => setSubView("FILING_DETAILS")}
            style={{ flex: 1, borderWidth: 1.5, borderColor: "#0F2C59", borderRadius: 12, paddingVertical: 12, alignItems: "center" }}
          >
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#0F2C59" }}>← Filing Details</Text>
          </TouchableOpacity>
          {currentApplicantIndex < applicants.length - 1 ? (
            <TouchableOpacity
              onPress={() => {
                setCurrentApplicantIndex(currentApplicantIndex + 1);
                setSubView("FILING_DETAILS");
              }}
              style={{ flex: 1, backgroundColor: "#0F2C59", borderRadius: 12, paddingVertical: 12, alignItems: "center" }}
            >
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>Next Applicant →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setSubView("FILING_DETAILS")}
              style={{ flex: 1, backgroundColor: "#16A34A", borderRadius: 12, paddingVertical: 12, alignItems: "center" }}
            >
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>✓ Filing Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 }}>
        {/* Page Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 20, fontWeight: "700", color: "#0F172A", marginBottom: 4 }}>
            {service.title}
          </Text>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: "#64748B" }}>
            Bulk / Group Filing —{" "}
            {subView === "FILING_DETAILS"
              ? "Applicant Filing Details"
              : "Document Upload"}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          {subView === "FILING_DETAILS" && renderFilingDetails()}
          {subView === "DOCUMENT_UPLOAD" && renderDocumentUpload()}
        </View>
      </ScrollView>
    </View>
  );
}
