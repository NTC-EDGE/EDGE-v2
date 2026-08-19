import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
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
  onChange,
  onStructuredChange,
  error,
}: ApplicantNameFieldProps) {
  // If structuredValue is provided, use it directly; otherwise parse from raw value string
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

  const handleFieldChange = (
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
      firstName: newFn,
      middleName: newMn,
      lastName: newLn,
      suffix: newSfx,
    });
  };

  return (
    <View style={styles.container}>
      {/* Field Label with Red Asterisk */}
      <View style={styles.labelRow}>
        <Text style={styles.mainLabel}>{label}</Text>
        {isRequired && <Text style={styles.requiredAsterisk}>*</Text>}
      </View>
      <Text style={styles.subLabel}>
        Enter the full legal name of the applicant/licensee as it will appear on the certificate or license.
      </Text>

      {/* Individual Fields Layout */}
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
                handleFieldChange(val, middleName, lastName, suffix);
              }}
            />
          </FormCol>

          <FormCol span={6}>
            <ValidatedInput
              label="Middle Name (Optional)"
              placeholder="e.g. Mercado"
              value={middleName}
              onChangeText={(val) => {
                handleFieldChange(firstName, val, lastName, suffix);
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
                handleFieldChange(firstName, middleName, val, suffix);
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
                handleFieldChange(firstName, middleName, lastName, val);
              }}
            />
          </FormCol>
        </FormGrid>
      </View>

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
