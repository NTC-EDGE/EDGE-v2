import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ValidatedInput } from "./ValidatedInput";
import { DatePickerInput } from "./DatePickerInput";
import { Select } from "./Select";
import { FormGrid, FormCol } from "./FormGrid";
import { ApplicantNameField, StructuredNameData } from "./ApplicantNameField";
import { FormSignatureInput } from "./FormSignatureInput";
import { DeclarationCheckbox } from "./DeclarationCheckbox";
import { TYPOGRAPHY, COLORS } from "../theme/tokens";

export interface FieldDto {
  id?: string;
  fieldId?: string;
  fieldType?: string; // text | number | date | dropdown | checkbox | signature | file
  type?: string;
  label: string;
  isRequired?: boolean;
  options?: Array<{ label: string; value: string }> | string[];
  placeholder?: string;
  isCompact?: boolean;
  validationRules?: string;
}

export interface FormSectionDto {
  id?: string;
  key?: string;
  title: string;
  fields: FieldDto[];
}

export interface FormDto {
  id?: string;
  formId?: string;
  version: string;
  sections: FormSectionDto[];
}

interface DynamicFormRendererProps {
  form: FormDto;
  values: Record<string, string>; // fieldId -> value
  onChange: (fieldId: string, label: string, value: string) => void;
  onStructuredNameChange?: (data: StructuredNameData) => void;
  structuredNameData?: Partial<StructuredNameData>;
  applicantName?: string;
  allowCompany?: boolean;
  variantElements?: Array<{ id: string; code?: string; description?: string; [key: string]: unknown }>;
  errors?: Record<string, string>;
  hideSections?: string[];
}

function parseOptions(field: FieldDto): Array<{ label: string; value: string }> {
  if (field.options !== null && field.options !== undefined && Array.isArray(field.options) && field.options.length > 0) {
    return field.options.map((opt) =>
      typeof opt === "string" ? { label: opt, value: opt } : opt
    );
  }

  if (field.validationRules !== null && field.validationRules !== undefined && typeof field.validationRules === "string") {
    try {
      const parsed: unknown = JSON.parse(field.validationRules);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => {
          const str = typeof item === "string" ? item : String(item);
          return { label: str, value: str };
        });
      }
    } catch {
      // Ignored if not JSON array
    }
  }

  return [];
}

export function DynamicFormRenderer({
  form,
  values,
  onChange,
  onStructuredNameChange,
  structuredNameData,
  applicantName = "",
  allowCompany = true,
  variantElements = [],
  errors = {},
  hideSections = ["payment"],
}: DynamicFormRendererProps) {
  const hiddenKeys = hideSections.map((s) => s.toLowerCase());

  const visibleSections = form.sections.filter((section) => {
    const key = (section.key || section.id || "").toLowerCase();
    const title = (section.title || "").toLowerCase();
    return (
      !hiddenKeys.includes(key) &&
      !hiddenKeys.includes(title) &&
      title !== "payment details"
    );
  });

  return (
    <View style={styles.container}>
      {visibleSections.map((section, idx) => {
        const sectionKey = section.id || section.key || `section-${idx}`;
        return (
          <View key={sectionKey} style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconCircleText}>{idx + 1}</Text>
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>DYNAMIC SECTION {idx + 1}</Text>
              </View>
            </View>

            <FormGrid>
              {section.fields.map((field, fIdx) => {
                const targetId = field.fieldId || field.id || `field-${fIdx}`;
                const val = values[targetId] || "";
                const err = errors[targetId];
                const rawType = (field.fieldType || field.type || "").toLowerCase();
                const labelLower = (field.label || "").toLowerCase().trim();

                const isNameField =
                  labelLower.includes("full name") ||
                  labelLower.includes("applicant name") ||
                  labelLower.includes("name of applicant") ||
                  labelLower === "name" ||
                  labelLower === "applicant";

                const isSignature =
                  rawType === "signature" ||
                  labelLower.includes("signature");

                const isCheckbox =
                  rawType === "checkbox" ||
                  labelLower.includes("declare") ||
                  labelLower.includes("certify") ||
                  labelLower.includes("agreement") ||
                  labelLower.includes("declaration");

                const isElementsField =
                  labelLower.includes("element") ||
                  targetId === "fd000000-0000-0000-0000-000000000009";

                const elementOptions: Array<{ label: string; value: string }> =
                  variantElements && variantElements.length > 0
                    ? variantElements.map((e) => {
                        const title = e.code ? `${e.code} — ${e.description}` : String(e.description || e.id);
                        return { label: title, value: title };
                      })
                    : [];

                const isDropdown =
                  rawType === "dropdown" ||
                  rawType === "select" ||
                  (isElementsField && elementOptions.length > 0);

                const dropdownOptions =
                  isElementsField && elementOptions.length > 0
                    ? elementOptions
                    : parseOptions(field);

                const isDate = rawType === "date";
                const isNumber = rawType === "number";
                const isFile = rawType === "file";

                const span = isNameField || isSignature || isCheckbox || isFile ? 12 : 6;

                return (
                  <FormCol key={targetId} span={span} compact={field.isCompact}>
                    {isNameField ? (
                      <ApplicantNameField
                        key={targetId}
                        label={field.label}
                        isRequired={field.isRequired}
                        value={val}
                        structuredValue={structuredNameData}
                        allowCompany={allowCompany}
                        onChange={(combinedName) => onChange(targetId, field.label, combinedName)}
                        onStructuredChange={onStructuredNameChange}
                        error={err}
                      />
                    ) : isSignature ? (
                      <FormSignatureInput
                        label={field.label}
                        isRequired={field.isRequired}
                        value={val}
                        onChange={(sigData) => onChange(targetId, field.label, sigData)}
                        applicantName={applicantName || val}
                        error={err}
                      />
                    ) : isCheckbox ? (
                      <DeclarationCheckbox
                        label={field.label}
                        isRequired={field.isRequired}
                        value={val}
                        onChange={(chkVal) => onChange(targetId, field.label, chkVal)}
                        error={err}
                      />
                    ) : isDropdown ? (
                      <Select
                        label={field.label}
                        required={field.isRequired}
                        value={val}
                        onValueChange={(v) => onChange(targetId, field.label, v)}
                        options={dropdownOptions}
                        placeholder={isElementsField ? "Select Exam Element..." : (field.placeholder || "Select an option...")}
                        error={err}
                      />
                    ) : isDate ? (
                      <DatePickerInput
                        label={field.label}
                        required={field.isRequired}
                        value={val}
                        onChangeText={(v: string) => onChange(targetId, field.label, v)}
                        error={err}
                      />
                    ) : (
                      <ValidatedInput
                        label={field.label}
                        required={field.isRequired}
                        value={val}
                        onChangeText={(v) => onChange(targetId, field.label, v)}
                        placeholder={field.placeholder || `Enter ${field.label}...`}
                        keyboardType={isNumber ? "numeric" : "default"}
                        error={err}
                      />
                    )}
                  </FormCol>
                );
              })}
            </FormGrid>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderLeftWidth: 5,
    borderLeftColor: "#0F2C59",
    padding: 20,
    shadowColor: "#0F2C59",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
    minWidth: 200,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  iconCircleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "800",
    color: "#0F2C59",
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F2C59",
  },
  sectionBadge: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  sectionBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: "800",
    color: "#1E40AF",
  },
});
