import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { TYPOGRAPHY, RADIUS, SPACING } from "../theme/tokens";
import { useTheme } from "../theme/useTheme";
import { Feather as Icon } from "@expo/vector-icons";

export interface DatePickerFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  minDate?: string;
  maxDate?: string;
}

export function DatePickerField<T extends FieldValues>({
  control,
  name,
  label,
  required = false,
  placeholder = "YYYY-MM-DD",
  helperText,
  minDate,
  maxDate,
}: DatePickerFieldProps<T>) {
  const [isFocused, setIsFocused] = useState(false);
  const { colors, isDark } = useTheme();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
        const hasError = error !== undefined && error !== null;
        const stringValue = typeof value === "string" ? value : "";

        const dynamicWrapperStyle = {
          borderColor: hasError
            ? colors.semantic.error
            : isFocused
            ? colors.brand[800]
            : colors.border,
          backgroundColor: hasError
            ? colors.semantic.errorBg
            : isFocused
            ? colors.cardBg
            : isDark
            ? colors.neutral[800]
            : colors.neutral[50],
        };

        const iconColor = hasError
          ? colors.semantic.error
          : isFocused
          ? colors.brand[800]
          : colors.neutral[400];

        return (
          <View style={styles.container}>
            <Text style={[styles.label, { color: colors.text }]}>
              {label} {required && <Text style={{ color: colors.semantic.error }}>*</Text>}
            </Text>

            {Platform.OS === "web" ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  height: "48px",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: dynamicWrapperStyle.borderColor,
                  backgroundColor: dynamicWrapperStyle.backgroundColor,
                  borderRadius: "10px",
                  paddingLeft: "14px",
                  paddingRight: "14px",
                  transition: "border-color 0.15s ease, background-color 0.15s ease",
                  boxSizing: "border-box",
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
                  value={stringValue}
                  min={minDate}
                  max={maxDate}
                  placeholder={placeholder}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setIsFocused(false);
                    onBlur();
                  }}
                  onChange={(e) => {
                    const target = e.currentTarget;
                    if (target !== null && typeof target.value === "string") {
                      onChange(target.value);
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
                    color: colors.text,
                    cursor: "pointer",
                    colorScheme: isDark ? "dark" : "light",
                  }}
                />
              </div>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.inputWrapper, dynamicWrapperStyle]}
                onPress={() => {
                  // For native, keep editable or focusable
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
                    { color: stringValue ? colors.text : colors.neutral[400] },
                  ]}
                >
                  {stringValue || placeholder}
                </Text>
              </TouchableOpacity>
            )}

            {hasError ? (
              <Text style={[styles.errorText, { color: colors.semantic.error }]}>
                {error?.message}
              </Text>
            ) : helperText !== undefined ? (
              <Text style={[styles.helperText, { color: colors.textMuted }]}>
                {helperText}
              </Text>
            ) : null}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING[16],
    gap: 6,
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
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
  },
  helperText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
});
