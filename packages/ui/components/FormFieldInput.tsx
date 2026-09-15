import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  TextInputProps,
} from "react-native";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { TYPOGRAPHY } from "../theme/tokens";
import { useTheme } from "../theme/useTheme";
import { Feather as Icon } from "@expo/vector-icons";

// Suppress browser-native password reveal icons (e.g. Edge ::-ms-reveal) on Web to avoid double eye icons
if (Platform.OS === "web" && typeof document !== "undefined") {
  const styleId = "edge-hide-native-password-reveal";
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement("style");
    styleEl.id = styleId;
    styleEl.innerHTML = `
      input::-ms-reveal,
      input::-ms-clear {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      input::-webkit-contacts-auto-fill-button,
      input::-webkit-credentials-auto-fill-button {
        visibility: hidden !important;
        display: none !important;
        pointer-events: none !important;
        height: 0 !important;
        width: 0 !important;
        margin: 0 !important;
      }
    `;
    document.head.appendChild(styleEl);
  }
}

export interface FormFieldInputProps<T extends FieldValues> extends Omit<TextInputProps, "value" | "onChangeText"> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  leftIconName?: keyof typeof Icon.glyphMap;
  isPassword?: boolean;
  helperText?: string;
}

export function FormFieldInput<T extends FieldValues>({
  control,
  name,
  label,
  leftIconName,
  isPassword = false,
  helperText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "none",
  ...rest
}: FormFieldInputProps<T>) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { colors, isDark } = useTheme();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
        const hasError = error !== undefined && error !== null;

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
            : (isDark ? colors.neutral[800] : colors.neutral[50]),
        };

        const iconColor = hasError
          ? colors.semantic.error
          : isFocused
          ? colors.brand[800]
          : colors.neutral[400];

        return (
          <View style={styles.container}>
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            <View style={[styles.inputWrapper, dynamicWrapperStyle]}>
              {leftIconName !== undefined ? (
                <Icon
                  name={leftIconName}
                  size={18}
                  color={iconColor}
                  style={styles.iconLeft}
                />
              ) : null}

              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder={placeholder}
                placeholderTextColor={colors.neutral[400]}
                value={typeof value === "string" ? value : ""}
                onChangeText={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setIsFocused(false);
                  onBlur();
                }}
                secureTextEntry={isPassword && !showPassword}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                {...rest}
              />

              {isPassword ? (
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeToggle}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={showPassword ? "eye-off" : "eye"}
                    size={18}
                    color={colors.neutral[400]}
                  />
                </TouchableOpacity>
              ) : null}
            </View>

            {hasError ? (
              <Text style={[styles.errorText, { color: colors.semantic.error }]}>{error?.message}</Text>
            ) : helperText !== undefined ? (
              <Text style={[styles.helperText, { color: colors.textMuted }]}>{helperText}</Text>
            ) : null}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
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
  textInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    height: "100%",
    ...Platform.select({ web: { outlineWidth: 0 } }),
  },
  eyeToggle: {
    padding: 6,
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
