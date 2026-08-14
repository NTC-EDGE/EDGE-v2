import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";

interface DeclarationCheckboxProps {
  label?: string;
  description?: string;
  isRequired?: boolean;
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export function DeclarationCheckbox({
  label = "I hereby declare that all information provided is true and correct.",
  description = "By checking this box, you certify under penalty of law that the statements made in this application are authentic and verifiable.",
  isRequired = true,
  value = "",
  onChange,
  error,
}: DeclarationCheckboxProps) {
  const isChecked = value === "true" || value === "agreed" || value === "1" || value === "yes";

  const handleToggle = () => {
    onChange(isChecked ? "false" : "true");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.8}
        style={[styles.boxCard, isChecked && styles.boxCardChecked]}
      >
        <View style={[styles.checkboxSquare, isChecked && styles.checkboxSquareChecked]}>
          {isChecked && <Icon name="check" size={14} color="#FFFFFF" />}
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>{label}</Text>
            {isRequired && <Text style={styles.requiredAsterisk}>*</Text>}
          </View>
          {description ? (
            <Text style={styles.descriptionText}>{description}</Text>
          ) : null}
        </View>
      </TouchableOpacity>

      {error !== undefined && error.length > 0 && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  boxCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 14,
    gap: 12,
  },
  boxCardChecked: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#94A3B8",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxSquareChecked: {
    backgroundColor: "#0F2C59",
    borderColor: "#0F2C59",
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 4,
  },
  titleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "700",
    color: "#0F2C59",
    lineHeight: 18,
  },
  requiredAsterisk: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "800",
    color: "#EF4444",
  },
  descriptionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "#EF4444",
    marginTop: 4,
  },
});
