import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";
import { ValidatedInput } from "./ValidatedInput";
import { Select } from "./Select";
import { FormGrid, FormCol } from "./FormGrid";

export interface StructuredNameData {
  applicantType?: "individual" | "company";
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  companyName?: string;
  representativeName?: string;
}

interface ApplicantNameFieldProps {
  label?: string;
  isRequired?: boolean;
  value?: string;
  structuredValue?: Partial<StructuredNameData>;
  allowCompany?: boolean;
  unifiedInput?: boolean;
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
  label = "Full Legal Name",
  isRequired = true,
  value = "",
  structuredValue,
  allowCompany = false,
  unifiedInput = false,
  onChange,
  onStructuredChange,
  error,
}: ApplicantNameFieldProps) {
  if (unifiedInput) {
    return (
      <View style={styles.container}>
        <View style={styles.fieldsWrapper}>
          <ValidatedInput
            label={label || "Applicant / Company Name"}
            required={isRequired}
            placeholder="e.g. Globe Telecom Inc. / Converge ICT Solutions / Juan Dela Cruz"
            value={value}
            error={error && !value.trim() ? `${label || "Applicant Name"} is required.` : undefined}
            onChangeText={(val) => {
              onChange(val);
              onStructuredChange?.({
                applicantType: "company",
                firstName: "",
                middleName: "",
                lastName: "",
                suffix: "",
                companyName: val,
                representativeName: structuredValue?.representativeName,
              });
            }}
          />
        </View>
        {error !== undefined && error.length > 0 && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    );
  }
  const initialType: "individual" | "company" =
    structuredValue?.applicantType !== undefined
      ? structuredValue.applicantType
      : (structuredValue?.companyName && structuredValue.companyName.trim().length > 0)
      ? "company"
      : "individual";

  const [activeType, setActiveType] = useState<"individual" | "company">(initialType);

  useEffect(() => {
    if (structuredValue?.applicantType && structuredValue.applicantType !== activeType) {
      setActiveType(structuredValue.applicantType);
    }
  }, [structuredValue?.applicantType]);

  const firstName = structuredValue?.firstName !== undefined
    ? structuredValue.firstName
    : value.trim().split(/\s+/)[0] || "";

  const lastName = structuredValue?.lastName !== undefined
    ? structuredValue.lastName
    : value.trim().split(/\s+/).length > 1
    ? value.trim().split(/\s+/).slice(1).join(" ")
    : "";

  const middleName = structuredValue?.middleName ?? "";
  const suffix = structuredValue?.suffix ?? "";
  const companyName = structuredValue?.companyName ?? (activeType === "company" ? value : "");
  const representativeName = structuredValue?.representativeName ?? "";

  const isCompanyMode = allowCompany && activeType === "company";

  const handleIndividualChange = (
    newFn: string,
    newMn: string,
    newLn: string,
    newSfx: string
  ) => {
    const computedFullName = [newFn.trim(), newMn.trim(), newLn.trim(), newSfx.trim()]
      .filter(Boolean)
      .join(" ");

    onChange(computedFullName);
    onStructuredChange?.({
      applicantType: structuredValue?.applicantType || (activeType === "company" ? "company" : "individual"),
      firstName: newFn,
      middleName: newMn,
      lastName: newLn,
      suffix: newSfx,
      companyName: structuredValue?.companyName || "",
      representativeName: structuredValue?.representativeName || representativeName,
    });
  };

  const handleCompanyChange = (newCompany: string, newRep: string) => {
    onChange(newCompany.trim() || newRep.trim());
    onStructuredChange?.({
      applicantType: "company",
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      suffix: suffix,
      companyName: newCompany,
      representativeName: newRep,
    });
  };

  const handleTypeSelect = (type: "individual" | "company") => {
    setActiveType(type);
    if (type === "company") {
      onChange(companyName.trim() || representativeName.trim());
      onStructuredChange?.({
        applicantType: "company",
        firstName,
        middleName,
        lastName,
        suffix,
        companyName,
        representativeName,
      });
    } else {
      const computedFullName = [firstName.trim(), middleName.trim(), lastName.trim(), suffix.trim()]
        .filter(Boolean)
        .join(" ");
      onChange(computedFullName);
      onStructuredChange?.({
        applicantType: "individual",
        firstName,
        middleName,
        lastName,
        suffix,
        companyName: "",
        representativeName,
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Field Label with Red Asterisk */}
      <View style={styles.labelRow}>
        <Text style={styles.mainLabel}>
          {isCompanyMode ? "Company / Corporation Details" : label}
        </Text>
        {isRequired && <Text style={styles.requiredAsterisk}>*</Text>}
      </View>
      <Text style={styles.subLabel}>
        {isCompanyMode
          ? "Enter the registered corporate / company name and authorized representative."
          : "Enter the full legal name of the applicant/licensee as it will appear on the certificate or license."}
      </Text>

      {/* Optional Company vs Individual Selection Tabs */}
      {allowCompany && (
        <View style={styles.typeSelectorRow}>
          <TouchableOpacity
            onPress={() => handleTypeSelect("individual")}
            activeOpacity={0.8}
            style={[
              styles.typeTab,
              activeType === "individual" && styles.typeTabActive,
            ]}
          >
            <Icon
              name="user"
              size={13}
              color={activeType === "individual" ? "#0F2C59" : "#64748B"}
            />
            <Text
              style={[
                styles.typeTabText,
                activeType === "individual" && styles.typeTabTextActive,
              ]}
            >
              Individual Applicant
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTypeSelect("company")}
            activeOpacity={0.8}
            style={[
              styles.typeTab,
              activeType === "company" && styles.typeTabActive,
            ]}
          >
            <Icon
              name="briefcase"
              size={13}
              color={activeType === "company" ? "#0F2C59" : "#64748B"}
            />
            <Text
              style={[
                styles.typeTabText,
                activeType === "company" && styles.typeTabTextActive,
              ]}
            >
              Company / Corporation
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Fields Layout */}
      {isCompanyMode ? (
        <View style={styles.fieldsWrapper}>
          <FormGrid>
            <FormCol span={6}>
              <ValidatedInput
                label="Company / Corporation Name"
                required={isRequired}
                placeholder="e.g. Apex Telecom Philippines, Inc."
                value={companyName}
                error={error && !companyName.trim() ? "Company Name is required." : undefined}
                onChangeText={(val) => {
                  handleCompanyChange(val, representativeName);
                }}
              />
            </FormCol>

            <FormCol span={6}>
              <ValidatedInput
                label="Authorized Representative Name"
                placeholder="e.g. Engr. Juan Dela Cruz"
                value={representativeName}
                onChangeText={(val) => {
                  handleCompanyChange(companyName, val);
                }}
              />
            </FormCol>
          </FormGrid>
        </View>
      ) : (
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
                  handleIndividualChange(val, middleName, lastName, suffix);
                }}
              />
            </FormCol>

            <FormCol span={6}>
              <ValidatedInput
                label="Middle Name (Optional)"
                placeholder="e.g. Mercado"
                value={middleName}
                onChangeText={(val) => {
                  handleIndividualChange(firstName, val, lastName, suffix);
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
                  handleIndividualChange(firstName, middleName, val, suffix);
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
                  handleIndividualChange(firstName, middleName, lastName, val);
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
    marginBottom: 2,
  },
  mainLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F2C59",
  },
  subLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
    marginBottom: 12,
  },
  requiredAsterisk: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "700",
    color: "#DC2626",
    marginLeft: 4,
  },
  typeSelectorRow: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    padding: 3,
    marginBottom: 14,
    gap: 4,
  },
  typeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  typeTabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  typeTabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  typeTabTextActive: {
    color: "#0F2C59",
    fontWeight: "700",
  },
  fieldsWrapper: {
    width: "100%",
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#DC2626",
    marginTop: 6,
  },
});

