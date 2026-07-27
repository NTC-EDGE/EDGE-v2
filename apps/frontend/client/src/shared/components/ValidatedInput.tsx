import React from "react";
import { View, Text, TextInput, TextInputProps, StyleSheet } from "react-native";
import { COLORS, TYPOGRAPHY } from "@edge/ui";

interface ValidatedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
}

export function ValidatedInput({
  label,
  error,
  touched,
  required,
  style,
  ...props
}: ValidatedInputProps) {
  const hasError = touched && error !== undefined && error !== "";

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.requiredMark}>*</Text>}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          hasError ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor={COLORS.neutral[400]}
        {...props}
      />
      {hasError ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[700],
    marginBottom: 8,
  },
  requiredMark: {
    color: COLORS.semantic.error,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[800],
    backgroundColor: COLORS.neutral.white,
  },
  inputError: {
    borderColor: COLORS.semantic.error,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.semantic.error,
    marginTop: 4,
    fontWeight: "600",
  },
});
