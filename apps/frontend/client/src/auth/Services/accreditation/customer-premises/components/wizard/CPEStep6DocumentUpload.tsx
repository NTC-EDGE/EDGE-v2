import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
import { ApplicantData } from "../../types/cpeTypes";

interface CPEStep6DocumentUploadProps {
  activeApplicant: ApplicantData;
  updateActiveApplicant: (fields: Partial<ApplicantData>) => void;
  handleDocumentPick: (key: string) => void;
  styles: any;
}

export const getRequirementsList = (type: "NEW" | "RENEWAL" | "MODIFICATION"): string[] => {
  if (type === "NEW") {
    return [
      "SEC / DTI Registration or Business/Mayor's Permit (Note: purpose must include CPE supplier accreditation related details)",
      "Proof of Paid-Up Capital (Minimum of PHP 250,000.00 certified by Treasurer/Partners/Owner)",
      "Distributorship or Representation Agreement on products to be sold",
      "Type Approval Certificate or copy of Grant of Equipment Conformity for CPE to be sold",
      "Certificate of Employment & valid ROC/license of two (2) qualified radio technicians (i.e. RCT/ECT) full-time",
      "Certificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) or PECE",
    ];
  } else if (type === "RENEWAL") {
    return [
      "CPE Supplier Accreditation Certificate",
      "Business / Mayor's Permit",
      "Distributorship or Representation Agreement on products to be sold",
      "Certificate of Employment & valid ROC/license of two (2) qualified radio technicians (i.e. RCT/ECT) full-time",
      "Certificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) or PECE",
    ];
  } else {
    return [
      "CPE Supplier Accreditation Certificate",
      "For equipment not previously indicated: Copy of Type Approval Certificate or Copy of Grant of Equipment Conformity",
    ];
  }
};

export function CPEStep6DocumentUpload({
  activeApplicant,
  updateActiveApplicant,
  handleDocumentPick,
  styles,
}: CPEStep6DocumentUploadProps) {
  const renderCPERequirementItem = (idx: number, type: "NEW" | "RENEWAL" | "MODIFICATION") => {
    const fileKey = idx.toString();
    const hasFile = activeApplicant.uploads[fileKey] !== undefined;

    let content: React.ReactNode = null;

    if (type === "NEW") {
      if (idx === 0) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 6 }}>
              1. Copy of ANY of the following:<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 4 }}>• SEC Registration</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 4 }}>• DTI Registration</Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 12 }}>• Business/Mayor's Permit</Text>
            <View style={{ backgroundColor: "#fef8e8", padding: 12, borderRadius: 8, borderColor: "#fdf0cd", borderWidth: 1, marginBottom: 12 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#a16207", fontStyle: "italic", lineHeight: 16 }}>
                Note : The purpose of the company as indicated in its registration document must include information related to the accreditation applied for.
              </Text>
            </View>
          </View>
        );
      } else if (idx === 1) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 6 }}>
              2. Proof of Paid-Up Capital<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 12, lineHeight: 18 }}>
              Minimum of PHP 250,000.00, duly certified by the Treasurer of the Corporation or by the partners in a partnership or by the owner in a sole proprietorship
            </Text>
          </View>
        );
      } else if (idx === 2) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 12 }}>
              3. Distributorship OR Representation Agreement on products to be sold<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
          </View>
        );
      } else if (idx === 3) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 12 }}>
              4. Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
          </View>
        );
      } else if (idx === 4) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 6 }}>
              5. Copy of the following:<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 12, lineHeight: 18 }}>
              Certificate of Employment AND copy of valid ROC/license of two (2) qualified radio technicians (i.e. Radio Communications Technician OR Electronics Technician) employed on a full-time basis
            </Text>
          </View>
        );
      } else if (idx === 5) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 6 }}>
              6. Copy of the following:<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 12, lineHeight: 18 }}>
              Certificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) OR Professional Electronics Engineer (PECE)
            </Text>
          </View>
        );
      }
    } else if (type === "RENEWAL") {
      if (idx === 0) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 12 }}>
              1. CPE Supplier Accreditation<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
          </View>
        );
      } else if (idx === 1) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 12 }}>
              2. Business/Mayor's Permit<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
          </View>
        );
      } else if (idx === 2) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 12 }}>
              3. Distributorship OR Representation Agreement on products to be sold<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
          </View>
        );
      } else if (idx === 3) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 6 }}>
              4. Copy of the following:<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 12, lineHeight: 18 }}>
              Certificate of Employment AND copy of valid ROC/license of two (2) qualified radio technicians (i.e. Radio Communications Technician OR Electronics Technician) employed on a full-time basis
            </Text>
          </View>
        );
      } else if (idx === 4) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 6 }}>
              5. Copy of the following:<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 12, lineHeight: 18 }}>
              Certificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) OR Professional Electronics Engineer (PECE)
            </Text>
          </View>
        );
      }
    } else if (type === "MODIFICATION") {
      if (idx === 0) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 12 }}>
              1. CPE Supplier Accreditation<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
          </View>
        );
      } else if (idx === 1) {
        content = (
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 14, color: COLORS.neutral[800], marginBottom: 6 }}>
              2. For equipment not previously indicated in the CPE Supplier Accreditation:
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 12, lineHeight: 18 }}>
              Copy of Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold
            </Text>
          </View>
        );
      }
    }

    return (
      <View key={idx} style={{ marginBottom: 24 }}>
        {content}
        <View style={{
          backgroundColor: COLORS.neutral.white,
          borderColor: COLORS.neutral[200],
          borderWidth: 1,
          borderRadius: 12,
          padding: 16,
          minHeight: 72,
          justifyContent: "center",
          marginBottom: 16,
        }}>
          {hasFile ? (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.semantic.success, fontWeight: "600" }}>
                {activeApplicant.uploads[fileKey]} ✔
              </Text>
              <TouchableOpacity onPress={() => {
                const nextUploads = { ...activeApplicant.uploads };
                delete nextUploads[fileKey];
                updateActiveApplicant({ uploads: nextUploads });
              }}>
                <Icon name="trash" size={16} color={COLORS.semantic.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                handleDocumentPick(fileKey);
              }}
              style={styles.uploadButton}
            >
              <Icon name="upload" size={14} color={COLORS.neutral[700]} style={{ marginRight: 8 }} />
              <Text style={styles.uploadButtonText}>Upload a file..</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View>
      <Text style={[styles.stepSubtitle, { marginBottom: 20 }]}>Upload Mandatory Supporting Documents:</Text>
      {getRequirementsList(activeApplicant.appType).map((_, idx) =>
        renderCPERequirementItem(idx, activeApplicant.appType)
      )}
    </View>
  );
}
