import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
import { ValidatedInput } from "./ValidatedInput";
import { Select } from "./Select";
import { FormGrid, FormCol } from "./FormGrid";

export interface StructuredNameData {
  applicantType: "individual" | "company";
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  companyName: string;
  representativeName: string;
}

interface ApplicantNameFieldProps {
  label?: string;
  isRequired?: boolean;
  value: string;
  allowCompany?: boolean;
  onChange: (fullName: string) => void;
  onStructuredChange?: (data: StructuredNameData) => void;
  error?: string;
}

const SUFFIX_OPTIONS = [
  { label: "None", value: "" },
  { label: "Jr.", value: "Jr." },
  { label: "Sr.", value: "Sr." },
  { label: "II", value: "II" },
  { label: "III", value: "III" },
  { label: "IV", value: "IV" },
  { label: "V", value: "V" },
];

export function ApplicantNameField({
  label = "Applicant Information",
  isRequired = true,
  value = "",
  allowCompany = true,
  onChange,
  onStructuredChange,
  error,
}: ApplicantNameFieldProps) {
  const [applicantType, setApplicantType] = useState<"individual" | "company">("individual");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [representativeName, setRepresentativeName] = useState("");

  // Enforce individual if company is disallowed
  useEffect(() => {
    if (!allowCompany && applicantType !== "individual") {
      setApplicantType("individual");
    }
  }, [allowCompany]);

  // Initialize from existing value if structured fields are empty
  useEffect(() => {
    if (value && !firstName && !lastName && !companyName) {
      if (allowCompany && (value.toLowerCase().includes("corp") || value.toLowerCase().includes("inc") || value.toLowerCase().includes("ltd") || value.toLowerCase().includes("company"))) {
        setApplicantType("company");
        setCompanyName(value);
      } else {
        const parts = value.trim().split(/\s+/);
        if (parts.length === 1) {
          setFirstName(parts[0]);
        } else if (parts.length === 2) {
          setFirstName(parts[0]);
          setLastName(parts[1]);
        } else if (parts.length >= 3) {
          setFirstName(parts[0]);
          setMiddleName(parts[1]);
          setLastName(parts.slice(2).join(" "));
        }
      }
    }
  }, []);

  const notifyChange = (
    type: "individual" | "company",
    fn: string,
    mn: string,
    ln: string,
    sfx: string,
    comp: string,
    rep: string
  ) => {
    let computedFullName = "";
    if (type === "individual" || !allowCompany) {
      computedFullName = [fn.trim(), mn.trim(), ln.trim(), sfx.trim()]
        .filter(Boolean)
        .join(" ");
    } else {
      computedFullName = comp.trim();
    }

    onChange(computedFullName);
    onStructuredChange?.({
      applicantType: allowCompany ? type : "individual",
      firstName: fn,
      middleName: mn,
      lastName: ln,
      suffix: sfx,
      companyName: comp,
      representativeName: rep,
    });
  };

  const handleTypeToggle = (newType: "individual" | "company") => {
    setApplicantType(newType);
    notifyChange(newType, firstName, middleName, lastName, suffix, companyName, representativeName);
  };

  return (
    <View style={styles.container}>
      {/* Field Label with Red Asterisk */}
      <View style={styles.labelRow}>
        <Text style={styles.mainLabel}>
          {!allowCompany ? "Applicant Personal Information" : label}
        </Text>
        {isRequired && <Text style={styles.requiredAsterisk}>*</Text>}
      </View>

      {/* Applicant Type Selection Buttons (Only displayed when company application is allowed) */}
      {allowCompany && (
        <View style={styles.typeSelectorContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleTypeToggle("individual")}
            style={[
              styles.typeOptionButton,
              applicantType === "individual" && styles.typeOptionButtonActive,
            ]}
          >
            <Icon
              name="user"
              size={16}
              color={applicantType === "individual" ? "#FFFFFF" : COLORS.neutral[600]}
            />
            <Text
              style={[
                styles.typeOptionText,
                applicantType === "individual" && styles.typeOptionTextActive,
              ]}
            >
              Individual Applicant
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleTypeToggle("company")}
            style={[
              styles.typeOptionButton,
              applicantType === "company" && styles.typeOptionButtonActive,
            ]}
          >
            <Icon
              name="briefcase"
              size={16}
              color={applicantType === "company" ? "#FFFFFF" : COLORS.neutral[600]}
            />
            <Text
              style={[
                styles.typeOptionText,
                applicantType === "company" && styles.typeOptionTextActive,
              ]}
            >
              Company / Corporation
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Individual Fields Layout */}
      {applicantType === "individual" || !allowCompany ? (
        <View style={styles.fieldsWrapper}>
          <FormGrid>
            <FormCol span={6}>
              <ValidatedInput
                label="First Name"
                required={isRequired}
                placeholder="e.g. Juan"
                value={firstName}
                error={error && !firstName.trim() ? "First Name is required." : undefined}
                onChangeText={(val) => {
                  setFirstName(val);
                  notifyChange("individual", val, middleName, lastName, suffix, companyName, representativeName);
                }}
              />
            </FormCol>

            <FormCol span={6}>
              <ValidatedInput
                label="Middle Name (Optional)"
                placeholder="e.g. Mercado"
                value={middleName}
                onChangeText={(val) => {
                  setMiddleName(val);
                  notifyChange("individual", firstName, val, lastName, suffix, companyName, representativeName);
                }}
              />
            </FormCol>

            <FormCol span={6}>
              <ValidatedInput
                label="Last Name"
                required={isRequired}
                placeholder="e.g. Dela Cruz"
                value={lastName}
                error={error && !lastName.trim() ? "Last Name is required." : undefined}
                onChangeText={(val) => {
                  setLastName(val);
                  notifyChange("individual", firstName, middleName, val, suffix, companyName, representativeName);
                }}
              />
            </FormCol>

            <FormCol span={6}>
              <Select
                label="Suffix"
                placeholder="None"
                value={suffix}
                options={SUFFIX_OPTIONS}
                onValueChange={(val) => {
                  setSuffix(val);
                  notifyChange("individual", firstName, middleName, lastName, val, companyName, representativeName);
                }}
              />
            </FormCol>
          </FormGrid>
        </View>
      ) : (
        /* Company Fields Layout */
        <View style={styles.fieldsWrapper}>
          <FormGrid>
            <FormCol span={12}>
              <ValidatedInput
                label="Company / Corporate Name"
                required={isRequired}
                placeholder="e.g. Globe Telecom, Inc. / Smart Communications"
                value={companyName}
                error={error && !companyName.trim() ? "Company Name is required." : undefined}
                onChangeText={(val) => {
                  setCompanyName(val);
                  notifyChange("company", firstName, middleName, lastName, suffix, val, representativeName);
                }}
              />
            </FormCol>

            <FormCol span={12}>
              <ValidatedInput
                label="Authorized Representative / Signatory (Optional)"
                placeholder="e.g. Maria Santos (General Manager)"
                value={representativeName}
                onChangeText={(val) => {
                  setRepresentativeName(val);
                  notifyChange("company", firstName, middleName, lastName, suffix, companyName, val);
                }}
              />
            </FormCol>
          </FormGrid>
        </View>
      )}

      {error !== undefined && error.length > 0 && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 4,
  },
  mainLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F2C59",
  },
  requiredAsterisk: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "800",
    color: "#EF4444",
  },
  typeSelectorContainer: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 9,
    padding: 3,
    marginBottom: 14,
    gap: 4,
  },
  typeOptionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    borderRadius: 7,
    gap: 6,
  },
  typeOptionButtonActive: {
    backgroundColor: "#0F2C59",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  typeOptionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.neutral[600],
  },
  typeOptionTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  fieldsWrapper: {
    marginTop: 2,
  },
  previewPillContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 4,
    gap: 6,
  },
  previewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3B82F6",
  },
  previewLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "700",
    color: "#1E40AF",
  },
  previewValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    fontWeight: "600",
    color: "#1E3A8A",
    flex: 1,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "#EF4444",
    marginTop: 6,
  },
});
