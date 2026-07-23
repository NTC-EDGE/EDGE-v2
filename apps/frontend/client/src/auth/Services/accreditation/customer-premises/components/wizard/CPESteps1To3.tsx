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
      <View>
        <Text style={styles.infoTitle}>Customer Premises Equipment Supplier Accreditation</Text>
        <Text style={styles.infoDesc}>
          An Accreditation for Customer Premises Equipment Supplier is a written authority issued by the Commission to a person, firm, company, association or corporation authorizing the holder thereof to engage in the acquisition, servicing, maintenance, purchase or sale of equipment located in the premises of a customer which is not part of but connected to the system or network of a public telecommunications entity.
        </Text>
        <View style={styles.availCard}>
          <Text style={styles.availHeading}>WHO MAY AVAIL:</Text>
          <Text style={styles.availItem}>1. Individuals and Private Entities</Text>
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
