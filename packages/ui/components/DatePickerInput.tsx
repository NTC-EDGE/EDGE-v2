import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  StyleProp,
  ViewStyle,
} from "react-native";
import { TYPOGRAPHY, RADIUS, SPACING } from "../theme/tokens";
import { useTheme } from "../theme/useTheme";
import { Feather as Icon } from "@expo/vector-icons";

export interface DatePickerInputProps {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  error?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export function DatePickerInput({
  label,
  value,
  onChangeText,
  required = false,
  placeholder = "YYYY-MM-DD",
  helperText,
  error,
  minDate,
  maxDate,
  disabled = false,
  containerStyle,
  style,
}: DatePickerInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { colors, isDark } = useTheme();

  const hasError = error !== undefined && error !== null && error.length > 0;
  const stringValue = typeof value === "string" ? value : "";

  const normalizedDateValue = (() => {
    if (!stringValue || stringValue.trim().length === 0) return "";
    const trimmed = stringValue.trim();
    if (trimmed.includes("T")) {
      return trimmed.split("T")[0] ?? "";
    }
    if (trimmed.includes(" ")) {
      return trimmed.split(" ")[0] ?? "";
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      try {
        return d.toISOString().split("T")[0] ?? "";
      } catch {
        return trimmed.substring(0, 10);
      }
    }
    return trimmed.substring(0, 10);
  })();

  const dynamicWrapperStyle = {
    borderColor: hasError
      ? colors.semantic.error
      : isFocused
      ? colors.brand[500]
      : isDark
      ? colors.neutral[700]
      : colors.neutral[300],
    backgroundColor: disabled
      ? isDark
        ? colors.neutral[900]
        : colors.neutral[100]
      : hasError
      ? isDark
        ? "#451a1a"
        : "#FEF2F2"
      : isFocused
      ? isDark
        ? colors.neutral[800]
        : colors.neutral[50]
      : isDark
      ? colors.neutral[800]
      : colors.neutral[50],
  };

  const iconColor = hasError
    ? colors.semantic.error
    : isFocused
    ? colors.brand[500]
    : isDark
    ? colors.neutral[400]
    : colors.neutral[500];

  return (
    <View style={[styles.container, containerStyle]}>
      {label !== undefined && label.length > 0 && (
        <Text style={[styles.label, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
          {label} {required && <Text style={{ color: colors.semantic.error }}>*</Text>}
        </Text>
      )}

      {Platform.OS === "web" ? (
        <div
          onClick={(e) => {
            if (disabled) return;
            const input = e.currentTarget.querySelector('input[type="date"]');
            if (input instanceof HTMLInputElement) {
              try {
                if (typeof input.showPicker === 'function') {
                  input.showPicker();
                } else {
                  input.focus();
                }
              } catch {
                input.focus();
              }
            }
          }}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            height: "44px",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: dynamicWrapperStyle.borderColor,
            backgroundColor: dynamicWrapperStyle.backgroundColor,
            borderRadius: "10px",
            paddingLeft: "12px",
            paddingRight: "12px",
            transition: "border-color 0.15s ease, background-color 0.15s ease",
            boxSizing: "border-box",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
            width: "100%",
          }}
        >
          <Icon
            name="calendar"
            size={16}
            color={iconColor}
            style={styles.iconLeft}
          />
          <input
            type="date"
            value={normalizedDateValue}
            min={minDate}
            max={maxDate}
            disabled={disabled}
            placeholder={placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => {
              const target = e.currentTarget;
              if (target !== null && typeof target.value === "string") {
                onChangeText(target.value);
              }
            }}
            style={{
              flex: 1,
              height: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: "14px",
              color: isDark ? colors.neutral[100] : colors.neutral[900],
              cursor: disabled ? "not-allowed" : "pointer",
              colorScheme: isDark ? "dark" : "light",
            }}
          />
        </div>
      ) : (
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={disabled}
          style={[styles.inputWrapper, dynamicWrapperStyle, style, disabled && styles.disabledInput]}
          onPress={() => {
            // For native touch interaction
          }}
        >
          <Icon
            name="calendar"
            size={16}
            color={iconColor}
            style={styles.iconLeft}
          />
          <Text
            style={[
              styles.textValue,
              { color: normalizedDateValue ? (isDark ? colors.neutral[100] : colors.neutral[900]) : colors.neutral[400] },
            ]}
          >
            {normalizedDateValue || placeholder}
          </Text>
        </TouchableOpacity>
      )}

      {hasError ? (
        <Text style={[styles.errorText, { color: colors.semantic.error }]}>
          {error}
        </Text>
      ) : helperText !== undefined && helperText.length > 0 ? (
        <Text style={[styles.helperText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 4,
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  disabledInput: {
    opacity: 0.6,
  },
  iconLeft: {
    marginRight: 10,
  },
  textValue: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginTop: 2,
  },
  helperText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    marginTop: 2,
  },
});
