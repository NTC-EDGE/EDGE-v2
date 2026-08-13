import React from "react";
import { View, Text } from "react-native";
import { TYPOGRAPHY, COLORS, Icon } from "@edge/ui";
import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";
import { SharedDocumentUpload } from "../../../../shared/components/SharedDocumentUpload";

import { TouchableOpacity } from "react-native";

interface GeneralDocumentUploadStepProps {
  service: NTCService;
  activeApplicant: GeneralApplicantData;
  variantRequirements?: string[];
  appMode?: "SINGLE" | "BULK" | "";
  applicants?: GeneralApplicantData[];
  currentApplicantIndex?: number;
  setCurrentApplicantIndex?: (idx: number) => void;
  isWeb: boolean;
  onUploadPress: (req: string, file: { name: string; uri: string }) => void;
  onRemoveUpload: (req: string) => void;
}

export function GeneralDocumentUploadStep({
  service,
  activeApplicant,
  variantRequirements = [],
  appMode,
  applicants = [],
  currentApplicantIndex = 0,
  setCurrentApplicantIndex,
  isWeb,
  onUploadPress,
  onRemoveUpload,
}: GeneralDocumentUploadStepProps) {
  const isLifetime =
    (service.title || "").toUpperCase().includes("LIFETIME AMATEUR") ||
    (activeApplicant.selectedVariantId && activeApplicant.selectedVariantId.includes("life"));

  // Requirements come exclusively from the backend:
  // 1. variantRequirements — fetched from the selected service variant (preferred)
  // 2. service.requirements — fetched from the service itself (fallback)
  // Static hardcoded lists are intentionally removed: they caused different
  // applicants in a bulk cohort to see different requirement sets because the
  // branching depended on per-applicant fields (e.g. amateurLicenseData.appType).
  let reqList: Array<{ key: string; label: string; required: boolean; hint?: string }> = [];

  if (variantRequirements && variantRequirements.length > 0) {
    reqList = variantRequirements.map((reqStr, idx) => ({
      key: `req-${idx}`,
      label: reqStr.replace(/\*$/, ""),
      required: true,
    }));
  } else {
    reqList = (service.requirements || []).map((req, idx) => ({
      key: `req-gen-${idx}`,
      label: req,
      required: true,
    }));
  }

  return (
    <View style={{ gap: 16 }}>
      {appMode === "BULK" && applicants && applicants.length > 0 && (
        <View
          style={{
            backgroundColor: "#EFF6FF",
            borderWidth: 1,
            borderColor: "#93C5FD",
            borderRadius: 12,
            padding: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#1D4ED8",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Icon name="users" size={16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#1E40AF" }}>
                BULK FILING COHORT — Document Uploads for Applicant {currentApplicantIndex + 1} of {applicants.length}
              </Text>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: "#2563EB", marginTop: 1 }} numberOfLines={1}>
                Uploading for: {[activeApplicant.firstName, activeApplicant.lastName].filter(Boolean).join(" ") || `Applicant #${currentApplicantIndex + 1}`}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 6 }}>
            {currentApplicantIndex > 0 && setCurrentApplicantIndex && (
              <TouchableOpacity
                onPress={() => setCurrentApplicantIndex(currentApplicantIndex - 1)}
                style={{ backgroundColor: "#FFFFFF", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: "#93C5FD" }}
              >
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#1D4ED8" }}>← Prev</Text>
              </TouchableOpacity>
            )}
            {currentApplicantIndex < applicants.length - 1 && setCurrentApplicantIndex && (
              <TouchableOpacity
                onPress={() => setCurrentApplicantIndex(currentApplicantIndex + 1)}
                style={{ backgroundColor: "#FFFFFF", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: "#93C5FD" }}
              >
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#1D4ED8" }}>Next →</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      {/* Header Info Card */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 14,
          padding: 18,
          borderWidth: 1,
          borderColor: "#CBD5E1",
          borderLeftWidth: 5,
          borderLeftColor: "#0F2C59",
          shadowColor: "#0F2C59",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" }}>
              <Icon name="upload-cloud" size={15} color="#0F2C59" />
            </View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 15, fontWeight: "700", color: "#0F2C59" }}>
              Document Upload Requirements
            </Text>
          </View>
          <View style={{ backgroundColor: "#EFF6FF", borderColor: "#BFDBFE", borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#1D4ED8" }}>
              {reqList.length} Mandatory Document{reqList.length === 1 ? "" : "s"}
            </Text>
          </View>
        </View>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#64748B", lineHeight: 18 }}>
          Upload clear scanned copies (PDF, JPG, or PNG formats up to 10MB per file) for each requirement below.
        </Text>
      </View>

      {isLifetime && (
        <View style={{ backgroundColor: "#FEF3C7", borderColor: "#F59E0B", borderWidth: 1, borderRadius: 10, padding: 14 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#92400E", marginBottom: 4 }}>
            Mandatory Lifetime Class A Document Requirements
          </Text>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#78350F", lineHeight: 18 }}>
            Applicant showing original ID upon inspection. Applicant must be at least 60 years of age and have rendered 15+ consecutive years of amateur service.
          </Text>
        </View>
      )}

      <SharedDocumentUpload
        requirements={reqList}
        uploads={activeApplicant.uploads}
        onUpload={onUploadPress}
        onRemove={onRemoveUpload}
        isWeb={isWeb}
      />
    </View>
  );
}
