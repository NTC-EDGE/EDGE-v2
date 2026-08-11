import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ValidatedInput } from "./ValidatedInput";
import { DatePickerInput } from "./DatePickerInput";
import { Select } from "./Select";
import { FormGrid, FormCol } from "./FormGrid";
import { TYPOGRAPHY, COLORS } from "../theme/tokens";

export interface FieldDto {
  id: string;
  fieldType: string; // text | number | date | dropdown | checkbox | signature | file
  label: string;
  isRequired?: boolean;
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
  isCompact?: boolean;
  validationRules?: string;
}

export interface FormSectionDto {
  id: string;
  title: string;
  fields: FieldDto[];
}

export interface FormDto {
  id: string;
  version: string;
  sections: FormSectionDto[];
}

interface DynamicFormRendererProps {
  form: FormDto;
  values: Record<string, string>; // fieldId -> value
  onChange: (fieldId: string, label: string, value: string) => void;
  errors?: Record<string, string>;
}

export function DynamicFormRenderer({
  form,
  values,
  onChange,
  errors = {},
}: DynamicFormRendererProps) {
  return (
    <View style={styles.container}>
      {form.sections.map((section, idx) => (
        <View key={section.id} style={styles.sectionCard}>
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
            {section.fields.map((field) => {
              const val = values[field.id] || "";
              const err = errors[field.id];
              const span = field.fieldType === "file" || field.fieldType === "signature" ? 12 : 6;

              return (
                <FormCol key={field.id} span={span} compact={field.isCompact}>
                  {field.fieldType === "dropdown" ? (
                    <Select
                      label={`${field.label}${field.isRequired ? " *" : ""}`}
                      value={val}
                      onValueChange={(v) => onChange(field.id, field.label, v)}
                      options={field.options || []}
                    />
                  ) : field.fieldType === "date" ? (
                    <DatePickerInput
                      label={`${field.label}${field.isRequired ? " *" : ""}`}
                      value={val}
                      onChangeText={(v: string) => onChange(field.id, field.label, v)}
                      error={err}
                    />
                  ) : (
                    <ValidatedInput
                      label={`${field.label}${field.isRequired ? " *" : ""}`}
                      value={val}
                      onChangeText={(v) => onChange(field.id, field.label, v)}
                      placeholder={field.placeholder || `Enter ${field.label}...`}
                      keyboardType={field.fieldType === "number" ? "numeric" : "default"}
                      error={err}
                    />
                  )}
                </FormCol>
              );
            })}
          </FormGrid>
        </View>
      ))}
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
