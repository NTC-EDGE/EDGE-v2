import React from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { Icon, TYPOGRAPHY } from "@edge/ui";

interface DatePickerInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
}

export function DatePickerInput({
  label,
  placeholder = "MM/DD/YYYY",
  value,
  onChangeText,
  error,
  touched,
  required,
}: DatePickerInputProps) {
  const showError = Boolean(touched && error);

  // Helper to format HTML5 yyyy-mm-dd to MM/DD/YYYY
  const formatIsoToUs = (isoStr: string): string => {
    if (!isoStr) return "";
    const parts = isoStr.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${m}/${d}/${y}`;
    }
    return isoStr;
  };

  // Helper to format MM/DD/YYYY to yyyy-mm-dd for HTML5 input
  const formatUsToIso = (usStr: string): string => {
    if (!usStr) return "";
    const parts = usStr.split("/");
    if (parts.length === 3) {
      const [m, d, y] = parts;
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    return usStr;
  };

  const handleWebDateChange = (e: any) => {
    const val = e.target.value;
    if (val) {
      onChangeText(formatIsoToUs(val));
    } else {
      onChangeText("");
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.requiredStar}>*</Text>}
        </Text>
      )}

      {Platform.OS === "web" ? (
        <View style={styles.inputWrapper}>
          {/* Clean HTML5 Date Input without duplicate overlay icons */}
          <input
            type="date"
            value={formatUsToIso(value)}
            onChange={handleWebDateChange}
            placeholder={placeholder}
            style={{
              width: "100%",
              height: "44px",
              paddingLeft: "14px",
              paddingRight: "14px",
              fontSize: "14px",
              fontFamily: 'System, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: value ? "#0F172A" : "#94A3B8",
              backgroundColor: "#FFFFFF",
              border: showError ? "1.5px solid #EF4444" : "1px solid #CBD5E1",
              borderRadius: "10px",
              outline: "none",
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          />
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.mobileInput, showError && styles.inputError]}
        >
          <Text style={[styles.mobileInputText, !value && styles.placeholderText]}>
            {value || placeholder}
          </Text>
          <Icon name="calendar" size={18} color="#0F2C59" />
        </TouchableOpacity>
      )}

      {showError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    width: "100%",
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  requiredStar: {
    color: "#EF4444",
  },
  inputWrapper: {
    width: "100%",
  },
  mobileInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
  },
  inputError: {
    borderColor: "#EF4444",
    borderWidth: 1.5,
  },
  mobileInputText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: "#0F172A",
  },
  placeholderText: {
    color: "#94A3B8",
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
});
