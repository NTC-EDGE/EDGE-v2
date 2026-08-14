import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
import { ApplicantData } from "../../types/cpeTypes";
import { getRequirementsList } from "./CPEStep6DocumentUpload";
import { DocumentPreviewModal } from "../../../../../../shared/components/DocumentPreviewModal";

interface CPEStep7ReviewProps {
  appMode: "SINGLE" | "BULK" | "";
  applicants: ApplicantData[];
  activeRegionObj: any;
  styles: any;
}

const renderReviewSectionHeader = (title: string) => (
  <View style={{ backgroundColor: "#f1f5f9", paddingVertical: 6, paddingHorizontal: 12, marginVertical: 8 }}>
    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: COLORS.neutral[600], letterSpacing: 0.5 }}>
      {title}
    </Text>
  </View>
);

const renderReviewRow = (label: string, value: string) => (
  <View style={{ flexDirection: "row", paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }}>
    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[500], width: "30%", minWidth: 120 }}>
      {label}
    </Text>
    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[800], fontWeight: "600", flex: 1 }}>
      {value || "—"}
    </Text>
  </View>
);

const renderReviewRequirementText = (idx: number, type: "NEW" | "RENEWAL" | "MODIFICATION") => {
  if (type === "NEW") {
    if (idx === 0) {
      return (
        <View>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800], marginBottom: 4 }}>
            1. Copy of ANY of the following:
          </Text>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 2 }}>• SEC Registration</Text>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 2 }}>• DTI Registration</Text>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[600], marginLeft: 12, marginBottom: 6 }}>• Business/Mayor's Permit</Text>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: COLORS.neutral[400], fontStyle: "italic", marginLeft: 12 }}>
            Note : The purpose of the company as indicated in its registration document must include information related to the accreditation applied for.
          </Text>
        </View>
      );
    } else if (idx === 1) {
      return (
        <View>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800], marginBottom: 4 }}>
            2. Proof of Paid-Up Capital
          </Text>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[600], marginLeft: 12 }}>
            Minimum of PHP 250,000.00, duly certified by the Treasurer of the Corporation or by the partners in a partnership or by the owner in a sole proprietorship
          </Text>
        </View>
      );
    } else if (idx === 2) {
      return (
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800] }}>
          3. Distributorship OR Representation Agreement on products to be sold
        </Text>
      );
    } else if (idx === 3) {
      return (
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800] }}>
          4. Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold
        </Text>
      );
    } else if (idx === 4) {
      return (
        <View>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800], marginBottom: 4 }}>
            5. Copy of the following:
          </Text>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[600], marginLeft: 12 }}>
            Certificate of Employment AND copy of valid ROC/license of two (2) qualified radio technicians (i.e. Radio Communications Technician OR Electronics Technician) employed on a full-time basis
          </Text>
        </View>
      );
    } else if (idx === 5) {
      return (
        <View>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800], marginBottom: 4 }}>
            6. Copy of the following:
          </Text>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[600], marginLeft: 12 }}>
            Certificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) OR Professional Electronics Engineer (PECE)
          </Text>
        </View>
      );
    }
  } else if (type === "RENEWAL") {
    if (idx === 0) {
      return (
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800] }}>
          1. CPE Supplier Accreditation
        </Text>
      );
    } else if (idx === 1) {
      return (
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800] }}>
          2. Business/Mayor's Permit
        </Text>
      );
    } else if (idx === 2) {
      return (
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800] }}>
          3. Distributorship OR Representation Agreement on products to be sold
        </Text>
      );
    } else if (idx === 3) {
      return (
        <View>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800], marginBottom: 4 }}>
            4. Copy of the following:
          </Text>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[600], marginLeft: 12 }}>
            Certificate of Employment AND copy of valid ROC/license of two (2) qualified radio technicians (i.e. Radio Communications Technician OR Electronics Technician) employed on a full-time basis
          </Text>
        </View>
      );
    } else if (idx === 4) {
      return (
        <View>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800], marginBottom: 4 }}>
            5. Copy of the following:
          </Text>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[600], marginLeft: 12 }}>
            Certificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) OR Professional Electronics Engineer (PECE)
          </Text>
        </View>
      );
    }
  } else if (type === "MODIFICATION") {
    if (idx === 0) {
      return (
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800] }}>
          1. CPE Supplier Accreditation
        </Text>
      );
    } else if (idx === 1) {
      return (
        <View>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontWeight: "700", fontSize: 13, color: COLORS.neutral[800], marginBottom: 4 }}>
            2. For equipment not previously indicated in the CPE Supplier Accreditation:
          </Text>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[600], marginLeft: 12 }}>
            Copy of Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold
          </Text>
        </View>
      );
    }
  }
  return null;
};

export function CPEStep7Review({
  appMode,
  applicants,
  activeRegionObj,
  styles,
}: CPEStep7ReviewProps) {
  const [previewFile, setPreviewFile] = useState<{ name: string; uri?: string } | string | null>(null);
  const [previewLabel, setPreviewLabel] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <View style={{ backgroundColor: COLORS.neutral.white, borderRadius: 12, padding: 16 }}>
      {/* Header: APPLICATION */}
      <View style={{ backgroundColor: "#e2e8f0", paddingVertical: 8, paddingHorizontal: 12, marginBottom: 8, borderRadius: 4 }}>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: COLORS.neutral[700], letterSpacing: 0.5 }}>
          APPLICATION
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 4 }}>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: "700", color: COLORS.neutral[900] }}>
          Customer Premises Equipment Supplier Accreditation
        </Text>
        <View style={{ backgroundColor: "#dbeafe", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginLeft: 8 }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "700", color: COLORS.brand[700] }}>
            {appMode}
          </Text>
        </View>
      </View>
      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "700", color: COLORS.brand[800], paddingHorizontal: 12, marginBottom: 16 }}>
        {applicants[0]?.appType}
      </Text>

      {applicants.map((app, idx) => (
        <View key={app.id} style={{ marginBottom: 24 }}>
          {appMode === "BULK" && (
            <View style={{ backgroundColor: COLORS.neutral[100], paddingVertical: 6, paddingHorizontal: 12, marginBottom: 8, borderRadius: 4 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: COLORS.neutral[800] }}>
                APPLICANT #{idx + 1}
              </Text>
            </View>
          )}

          {/* Section DETAILS */}
          {renderReviewSectionHeader("DETAILS")}
          {renderReviewRow("No. of years", app.years)}
          {renderReviewRow("Variation", app.variation)}

          {/* Section BASIC INFO */}
          {renderReviewSectionHeader("BASIC INFO")}
          {renderReviewRow("Applicant (Business name)", app.businessName)}

          {/* Section BUSINESS */}
          {renderReviewSectionHeader("BUSINESS")}
          {renderReviewRow("Type of Entity", app.entityType)}
          {renderReviewRow("SEC/DTI Registration No.", app.dtiNo)}

          {/* Section ADDRESS */}
          {renderReviewSectionHeader("ADDRESS")}
          {renderReviewRow("Region", activeRegionObj ? activeRegionObj.name : "N/A")}
          {renderReviewRow("Province", app.province)}
          {renderReviewRow("City", app.city)}
          {renderReviewRow("Barangay", app.barangay)}
          {renderReviewRow("Street/Zone", app.street || app.zone)}
          {renderReviewRow("Unit/Rm/House/Bldg No.", app.unitBldgNo)}
          {renderReviewRow("Zip Code", app.zipCode)}

          {/* Section CONTACT */}
          {renderReviewSectionHeader("CONTACT")}
          {renderReviewRow("Contact Number", app.contactNo)}
          {renderReviewRow("Email Address", app.email)}

          {/* Section SUPERVISING ENGINEER */}
          {renderReviewSectionHeader("SUPERVISING ENGINEER")}
          {renderReviewRow("Name", app.engineerName)}
          {renderReviewRow("PECE/ECE No.", app.eceNo)}
          {renderReviewRow("Date of Expiry", `${app.expiryMonth} ${app.expiryDate}, ${app.expiryYear}`)}

          {/* Section TECHNICIAN */}
          {renderReviewSectionHeader("TECHNICIAN")}
          {renderReviewRow("Name", app.technicianName)}
          {renderReviewRow("Certificate/ECT No.", app.ectNo)}
          {renderReviewRow("Date of Expiry", `${app.expiryMonth} ${app.expiryDate}, ${app.expiryYear}`)}

          {/* Section REGION */}
          {renderReviewSectionHeader("REGION")}
          {renderReviewRow("Region:", activeRegionObj ? activeRegionObj.name : "N/A")}

          {/* Section DOCUMENTS UPLOADED */}
          {renderReviewSectionHeader("DOCUMENTS UPLOADED")}
          {getRequirementsList(app.appType).map((req, reqIdx) => {
            const fileKey = reqIdx.toString();
            const upload = app.uploads[fileKey];
            const filename = typeof upload === "string" ? upload : upload?.name || "";

            return (
              <View key={reqIdx} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 12, paddingHorizontal: 12 }}>
                <View style={{ flex: 1, paddingRight: 24 }}>
                  {renderReviewRequirementText(reqIdx, app.appType)}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: filename ? COLORS.brand[700] : COLORS.neutral[400] }}>
                      {filename || "Not Uploaded"}
                    </Text>
                    {Boolean(upload) && (
                      <TouchableOpacity
                        onPress={() => {
                          setPreviewFile(upload);
                          setPreviewLabel(`Requirement #${reqIdx + 1}`);
                          setIsPreviewOpen(true);
                        }}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#EFF6FF",
                          borderWidth: 1,
                          borderColor: "#BFDBFE",
                          paddingVertical: 3,
                          paddingHorizontal: 8,
                          borderRadius: 6,
                          gap: 4,
                        }}
                      >
                        <Icon name="eye" size={12} color="#1D4ED8" />
                        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#1D4ED8" }}>
                          View
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Slick Document Icon on right */}
                <View style={{ width: 40, height: 50, borderWidth: 2, borderColor: filename ? COLORS.brand[700] : COLORS.neutral[300], borderRadius: 6, justifyContent: "center", alignItems: "center", position: "relative", backgroundColor: COLORS.neutral.white }}>
                  <View style={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: filename ? COLORS.brand[700] : COLORS.neutral[300], backgroundColor: COLORS.neutral.white, transform: [{ rotate: "45deg" }] }} />
                  <Icon name="file-text" size={16} color={filename ? COLORS.brand[700] : COLORS.neutral[300]} />
                </View>
              </View>
            );
          })}
        </View>
      ))}

      <DocumentPreviewModal
        visible={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        file={previewFile}
        label={previewLabel}
      />
    </View>
  );
}
