import React from "react";
import { View, Text } from "react-native";
import { COLORS, TYPOGRAPHY } from "@edge/ui";
import { Select } from "../../../../../../shared/components/Select";
import { ApplicantData } from "../../types/cpeTypes";

interface TenantInfo {
  id: string;
  name: string;
}

interface OfficeInfo {
  id: string;
  name: string;
}

interface CPESteps1To3Props {
  step: number;
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
  selectedOfficeId: string;
  setSelectedOfficeId: (id: string) => void;
  tenants: TenantInfo[];
  offices: OfficeInfo[];
  appMode: "SINGLE" | "BULK" | "";
  setAppMode: (mode: "SINGLE" | "BULK" | "") => void;
  activeApplicant: ApplicantData;
  updateActiveApplicant: (fields: Partial<ApplicantData>) => void;
  setApplicants: React.Dispatch<React.SetStateAction<ApplicantData[]>>;
  setCurrentApplicantIndex: (idx: number) => void;
  initialApplicant: (id: number) => ApplicantData;
  styles: any;
}

const renderStep3Requirements = (type: "NEW" | "RENEWAL" | "MODIFICATION") => {
  return (
    <View style={{ marginTop: 24, padding: 16, backgroundColor: COLORS.neutral[50], borderRadius: 12, borderColor: COLORS.neutral[200], borderWidth: 1 }}>
      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: "700", color: COLORS.neutral[800], marginBottom: 16 }}>
        Requirements
      </Text>

      {type === "NEW" && (
        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[800], marginBottom: 6 }}>
              1. Copy of ANY of the following:<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 16, marginBottom: 4 }}>
              • SEC Registration
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 16, marginBottom: 4 }}>
              • DTI Registration
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 16, marginBottom: 10 }}>
              • Business/Mayor's Permit
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[500], fontStyle: "italic", marginLeft: 16, lineHeight: 18 }}>
              Note : The purpose of the company as indicated in its registration document must include information related to the accreditation applied for.
            </Text>
          </View>
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[800], marginBottom: 4 }}>
              2. Proof of Paid-Up Capital<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 16, lineHeight: 18 }}>
              Minimum of PHP 250,000.00, duly certified by the Treasurer of the Corporation or by the partners in a partnership or by the owner in a sole proprietorship
            </Text>
          </View>
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[800] }}>
              3. Distributorship OR Representation Agreement on products to be sold<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
          </View>
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[800] }}>
              4. Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
          </View>
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[800], marginBottom: 4 }}>
              5. Copy of the following:<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 16, lineHeight: 18 }}>
              Certificate of Employment AND copy of valid ROC/license of two (2) qualified radio technicians (i.e. Radio Communications Technician OR Electronics Technician) employed on a full-time basis
            </Text>
          </View>
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[800], marginBottom: 4 }}>
              6. Copy of the following:<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 16, lineHeight: 18 }}>
              Certificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) OR Professional Electronics Engineer (PECE)
            </Text>
          </View>
        </View>
      )}

      {type === "RENEWAL" && (
        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[800] }}>
              1. CPE Supplier Accreditation<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
          </View>
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[800] }}>
              2. Business/Mayor's Permit<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
          </View>
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[800] }}>
              3. Distributorship OR Representation Agreement on products to be sold<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
          </View>
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[800], marginBottom: 4 }}>
              4. Copy of the following:<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 16, lineHeight: 18 }}>
              Certificate of Employment AND copy of valid ROC/license of two (2) qualified radio technicians (i.e. Radio Communications Technician OR Electronics Technician) employed on a full-time basis
            </Text>
          </View>
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[800], marginBottom: 4 }}>
              5. Copy of the following:<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 16, lineHeight: 18 }}>
              Certificate of Employment and copy of valid license of supervising Electronics Engineer (ECE) OR Professional Electronics Engineer (PECE)
            </Text>
          </View>
        </View>
      )}

      {type === "MODIFICATION" && (
        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[800] }}>
              1. CPE Supplier Accreditation<Text style={{ color: COLORS.semantic.error }}>*</Text>
            </Text>
          </View>
          <View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[800], marginBottom: 4 }}>
              2. For equipment not previously indicated in the CPE Supplier Accreditation:
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[600], marginLeft: 16, lineHeight: 18 }}>
              Copy of Type Approval Certificate OR Copy of Grant of Equipment Conformity for CPE to be sold
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export function CPESteps1To3({
  step,
  selectedRegionId,
  setSelectedRegionId,
  selectedOfficeId,
  setSelectedOfficeId,
  tenants,
  offices,
  appMode,
  setAppMode,
  activeApplicant,
  updateActiveApplicant,
  setApplicants,
  setCurrentApplicantIndex,
  initialApplicant,
  styles,
}: CPESteps1To3Props) {
  if (step === 1) {
    return (
      <View style={{ gap: 20 }}>
        {/* Card 1: Service Overview Card */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 14,
            padding: 20,
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
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1, minWidth: 200 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" }}>
                <Icon name="info" size={15} color="#0F2C59" />
              </View>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: "700", color: "#0F2C59" }}>
                CPE Supplier Accreditation Specifications
              </Text>
            </View>
            <View style={{ backgroundColor: "#EFF6FF", borderColor: "#3B82F6", borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, alignSelf: "flex-start" }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "800", color: "#1E40AF" }}>
                SECTION 1 • OVERVIEW
              </Text>
            </View>
          </View>

          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, color: "#334155", lineHeight: 22, marginBottom: 16 }}>
            Written authority issued by the NTC authorizing a person, firm, company, or corporation to acquire, service, maintain, purchase, or sell equipment connected to public telecommunications networks.
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <View style={{ backgroundColor: "#EFF6FF", borderColor: "#BFDBFE", borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, flex: 1, minWidth: 140 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "800", color: "#1E40AF", marginBottom: 2 }}>
                WHO MAY AVAIL
              </Text>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#0F2C59" }}>
                Individuals & Private Entities
              </Text>
            </View>

            <View style={{ backgroundColor: "#FEF3C7", borderColor: "#FDE68A", borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, flex: 1, minWidth: 140 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "800", color: "#92400E", marginBottom: 2 }}>
                PROCESSING TIME
              </Text>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#78350F" }}>
                3-5 Business Days
              </Text>
            </View>
          </View>
        </View>

        {/* Card 2: Guidelines & Step-by-Step Instructions Card */}
        <View
          style={{
            backgroundColor: "#FAFAFC",
            borderRadius: 14,
            padding: 20,
            borderWidth: 1,
            borderColor: "#CBD5E1",
            borderLeftWidth: 5,
            borderLeftColor: "#F59E0B",
            shadowColor: "#F59E0B",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1, minWidth: 200 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#FEF3C7", justifyContent: "center", alignItems: "center" }}>
                <Icon name="file-text" size={15} color="#92400E" />
              </View>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 15, fontWeight: "700", color: "#0F2C59" }}>
                Filing Instructions & Step-by-Step Guide
              </Text>
            </View>
            <View style={{ backgroundColor: "#FEF3C7", borderColor: "#F59E0B", borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, alignSelf: "flex-start" }}>
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10, fontWeight: "800", color: "#92400E" }}>
                GUIDELINES
              </Text>
            </View>
          </View>

          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: "#475569", lineHeight: 22 }}>
            1. Click <Text style={{ fontWeight: "700", color: "#0F2C59" }}>Next</Text> to select your NTC Regional & Field Office jurisdiction.{"\n"}
            2. Choose your <Text style={{ fontWeight: "700", color: "#0F2C59" }}>Application Type</Text> (NEW, RENEWAL, MODIFICATION) and view mandatory document requirements.{"\n"}
            3. Configure your filing mode (<Text style={{ fontWeight: "700", color: "#0F2C59" }}>Single</Text> or <Text style={{ fontWeight: "700", color: "#0F2C59" }}>Bulk CSV</Text> import).{"\n"}
            4. Complete the required applicant details form in Step 5 and upload mandatory attachments in Step 6.{"\n"}
            5. Review your summary in Step 7 and submit for official regional review.
          </Text>
        </View>
      </View>
    );
  }

  if (step === 2) {
    return (
      <View>
        <Text style={styles.stepSubtitle}>Select from which region you intend to apply:</Text>
        <Text style={styles.selectLabel}>Region</Text>
        <Select
          placeholder="Region"
          value={selectedRegionId}
          onValueChange={(val) => {
            setSelectedRegionId(val);
            setSelectedOfficeId("");
          }}
          options={tenants.map((t) => ({ label: t.name, value: t.id }))}
        />
        <Text style={styles.selectLabel}>Select Office:</Text>
        <Select
          placeholder="Offices*"
          value={selectedOfficeId}
          onValueChange={setSelectedOfficeId}
          options={offices.map((o) => ({ label: o.name, value: o.id }))}
        />
      </View>
    );
  }

  if (step === 3) {
    return (
      <View>
        <Text style={styles.stepSubtitle}>Specify your application concern and view the required documents:</Text>
        <Text style={styles.selectLabel}>Application Mode</Text>
        <Select
          placeholder="Select Application Mode"
          value={appMode}
          onValueChange={(val) => {
            if (val === "SINGLE" || val === "BULK") {
              setAppMode(val);
              if (val === "SINGLE") {
                setApplicants([initialApplicant(1)]);
                setCurrentApplicantIndex(0);
              }
            }
          }}
          options={[
            { label: "Single Application", value: "SINGLE" },
            { label: "Bulk Application", value: "BULK" },
          ]}
        />
        <Text style={styles.selectLabel}>Application Type</Text>
        <Select
          placeholder="Select Application Type"
          value={activeApplicant.appType}
          onValueChange={(val) => {
            if (val === "NEW" || val === "RENEWAL" || val === "MODIFICATION") {
              updateActiveApplicant({ appType: val });
            }
          }}
          options={[
            { label: "NEW", value: "NEW" },
            { label: "RENEWAL", value: "RENEWAL" },
            { label: "MODIFICATION", value: "MODIFICATION" },
          ]}
        />
        {renderStep3Requirements(activeApplicant.appType)}
      </View>
    );
  }

  return null;
}
