import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, TYPOGRAPHY } from "@edge/ui";
import { FormGrid, FormCol } from "../FormGrid";
import { Select } from "../Select";
import { ValidatedInput } from "../ValidatedInput";
import { DatePickerInput } from "../DatePickerInput";
import { getElementFieldLabel } from "./dynamicFormUtils";
import {
  FIELD_ID_LICENSE_NO,
  FIELD_ID_DATE_OF_EXPIRY,
  FIELD_ID_PREFERRED_CALL_SIGN,
  FIELD_ID_COR_VAS_NO,
  FIELD_ID_COR_VAS_EXPIRY,
} from "../../constants/fieldIds";

export interface DynamicFormSection1Props {
  serviceCategory?: string;
  serviceTitle?: string;
  selectedVariantId?: string;
  variants: Array<{ id: string; name?: string; type?: string; description?: string; isIndividual?: boolean; [key: string]: unknown }>;
  variantElements: Array<{ id: string; code?: string; description?: string; [key: string]: unknown }>;
  selectedElementId?: string;
  noOfYears?: string;
  showElements: boolean;
  showNumberOfYears: boolean;
  isVas: boolean;
  isAmateurCert: boolean;
  isModification: boolean;
  isLifetimeSupplementary: boolean;
  isRenewalOrMod: boolean;
  isRenewal: boolean;
  isVanityNew: boolean;
  isVanityRen: boolean;
  isSpecialEvent: boolean;
  values: Record<string, string>;
  onVariantChange?: (variantId: string, variantName: string) => void;
  onElementChange?: (elementId: string, elementTitle: string) => void;
  onNoOfYearsChange?: (years: string) => void;
  onChange: (fieldId: string, label: string, value: string) => void;
}

export const DynamicFormSection1: React.FC<DynamicFormSection1Props> = ({
  serviceCategory,
  serviceTitle,
  selectedVariantId,
  variants,
  variantElements,
  selectedElementId,
  noOfYears,
  showElements,
  showNumberOfYears,
  isVas,
  isAmateurCert,
  isModification,
  isLifetimeSupplementary,
  isRenewalOrMod,
  isRenewal,
  isVanityNew,
  isVanityRen,
  isSpecialEvent,
  values,
  onVariantChange,
  onElementChange,
  onNoOfYearsChange,
  onChange,
}) => {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.iconCircle}><Text style={styles.iconCircleText}>1</Text></View>
          <Text style={styles.sectionTitle}>Application Type</Text>
        </View>
        <View style={styles.sectionBadge}><Text style={styles.sectionBadgeText}>SECTION 1</Text></View>
      </View>

      <FormGrid>
        <FormCol span={showNumberOfYears ? (showElements ? 4 : 6) : (showElements ? 6 : 12)}>
          <Select
            label="Type of Application"
            required
            value={selectedVariantId || (variants[0] ? String(variants[0].id) : "")}
            options={
              isVas
                ? [{ label: "RENEWAL — Certificate of Registration as a Value-Added Service (VAS) Provider", value: String(variants[0]?.id || "Renewal") }]
                : variants.map((v) => {
                    const vType = v.type && v.type !== "NA" && v.type !== "N/A" ? v.type : "";
                    const vDesc = v.description || v.name || v.id;
                    return { label: vType ? `${vType.toUpperCase()} — ${vDesc}` : `${vDesc}`, value: String(v.id) };
                  })
            }
            placeholder="Select Type of Application..."
            onValueChange={(val: string) => {
              const matched = variants.find((v) => String(v.id) === String(val));
              onVariantChange?.(val, String(matched?.description || matched?.name || matched?.type || val));
            }}
          />
        </FormCol>

        {showElements && (
          <FormCol span={showNumberOfYears ? 4 : 6}>
            <Select
              label={getElementFieldLabel(serviceCategory, serviceTitle)}
              required
              value={selectedElementId || (variantElements[0] ? String(variantElements[0].id) : "")}
              options={variantElements.map((elem) => {
                const code = (elem.code || "").trim();
                const desc = (elem.description || "").trim();
                return { label: !code ? desc : !desc ? code : `${code} — ${desc}`, value: String(elem.id) };
              })}
              placeholder={`Select ${getElementFieldLabel(serviceCategory, serviceTitle)}...`}
              onValueChange={(val: string) => {
                const matched = variantElements.find((e) => String(e.id) === String(val));
                const code = (matched?.code || "").trim();
                const desc = (matched?.description || "").trim();
                onElementChange?.(val, !code ? desc || val : !desc ? code : `${code} — ${desc}`);
              }}
            />
          </FormCol>
        )}

        {showNumberOfYears && (
          <FormCol span={showElements ? 4 : 6}>
            <Select
              label="Number of Years"
              required
              value={noOfYears || "1"}
              options={[{ label: "1 Year", value: "1" }, { label: "2 Years", value: "2" }, { label: "3 Years", value: "3" }]}
              placeholder="Select Duration..."
              onValueChange={(val: string) => onNoOfYearsChange?.(val)}
            />
          </FormCol>
        )}

        {isAmateurCert && isModification && (
          <FormCol span={12}>
            <Select
              label="Modification Due to"
              required
              value={values?.["modificationDueTo"] || values?.["Modification Due To"] || ""}
              options={
                isLifetimeSupplementary
                  ? [{ label: "Additional Equipment", value: "Additional Equipment" }, { label: "Deletion of Equipment", value: "Deletion of Equipment" }, { label: "Others", value: "Others" }]
                  : [{ label: "Upgrade of Class of Station", value: "Upgrade of Class of Station" }, { label: "Change of Personal Info", value: "Change of Personal Info" }, { label: "Others", value: "Others" }]
              }
              placeholder="Select reason for modification..."
              onValueChange={(val: string) => onChange("modificationDueTo", "Modification Due To", val)}
            />
          </FormCol>
        )}

        {((isAmateurCert && isRenewalOrMod) || isVas) && (
          <>
            <FormCol span={6}>
              <ValidatedInput
                label={isVas ? "Certificate no." : (isRenewal ? "Certificate No." : "Certificate Number")}
                required
                placeholder={isVas ? "e.g. COR-VAS-2022-0045" : "e.g. ROC-2022-00123"}
                value={(isVas ? values?.[FIELD_ID_COR_VAS_NO] : values?.[FIELD_ID_LICENSE_NO]) || values?.["licenseNo"] || values?.["certificateNo"] || values?.["certificateNumber"] || ""}
                onChangeText={(val) => {
                  if (isVas) {
                    onChange(FIELD_ID_COR_VAS_NO, "Certificate no.", val);
                    onChange("corVasNo", "Certificate no.", val);
                  } else {
                    onChange(FIELD_ID_LICENSE_NO, "Certificate Number", val);
                    onChange("licenseNo", "Certificate Number", val);
                  }
                }}
              />
            </FormCol>
            <FormCol span={6}>
              <DatePickerInput
                label={isVas ? "Certificate no. Date of Expiry" : "Date of Expiry"}
                required
                placeholder="MM/DD/YYYY"
                value={(isVas ? values?.[FIELD_ID_COR_VAS_EXPIRY] : values?.[FIELD_ID_DATE_OF_EXPIRY]) || values?.["dateOfExpiry"] || values?.["expiryDate"] || ""}
                onChangeText={(val) => {
                  if (isVas) {
                    onChange(FIELD_ID_COR_VAS_EXPIRY, "Certificate no. Date of Expiry", val);
                    onChange("corVasExpiryDate", "Certificate no. Date of Expiry", val);
                  } else {
                    onChange(FIELD_ID_DATE_OF_EXPIRY, "Date of Expiry", val);
                    onChange("dateOfExpiry", "Date of Expiry", val);
                  }
                }}
              />
            </FormCol>
          </>
        )}

        {(isVanityNew || isVanityRen || isSpecialEvent) && (
          <FormCol span={isVanityRen ? 4 : 6}>
            <ValidatedInput
              label="Preferred Call Sign/s"
              placeholder="e.g. 4F1AAA (Optional)"
              value={values?.[FIELD_ID_PREFERRED_CALL_SIGN] || values?.["preferredCallSign"] || ""}
              onChangeText={(val) => {
                onChange(FIELD_ID_PREFERRED_CALL_SIGN, "Preferred Call Sign/s", val);
                onChange("preferredCallSign", "Preferred Call Sign/s", val);
              }}
            />
          </FormCol>
        )}

        {isVanityRen && (
          <>
            <FormCol span={4}>
              <ValidatedInput
                label="Permit Number"
                required
                placeholder="e.g. SP-VAN-2022-00123"
                value={values?.[FIELD_ID_LICENSE_NO] || values?.["permitNo"] || values?.["permitNumber"] || ""}
                onChangeText={(val) => onChange(FIELD_ID_LICENSE_NO, "Permit Number", val)}
              />
            </FormCol>
            <FormCol span={4}>
              <DatePickerInput
                label="Date of Expiry"
                required
                placeholder="MM/DD/YYYY"
                value={values?.[FIELD_ID_DATE_OF_EXPIRY] || values?.["dateOfExpiry"] || values?.["expiryDate"] || ""}
                onChangeText={(val) => onChange(FIELD_ID_DATE_OF_EXPIRY, "Date of Expiry", val)}
              />
            </FormCol>
          </>
        )}
      </FormGrid>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionCard: { backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", padding: 24, marginBottom: 20, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  iconCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#1E3A8A", alignItems: "center", justifyContent: "center" },
  iconCircleText: { fontFamily: TYPOGRAPHY.fonts.primary, color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  sectionTitle: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: "700", color: "#0F172A", letterSpacing: -0.2 },
  sectionBadge: { backgroundColor: "#F1F5F9", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  sectionBadgeText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10.5, fontWeight: "700", color: "#475569", letterSpacing: 0.5 },
});
