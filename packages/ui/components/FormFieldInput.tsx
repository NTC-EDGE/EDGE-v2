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
import { COLORS, TYPOGRAPHY } from "../theme/tokens";
import { Feather as Icon } from "@expo/vector-icons";

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

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
        const hasError = error !== undefined && error !== null;

        return (
          <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View
              style={[
                styles.inputWrapper,
                isFocused && styles.inputWrapperFocused,
                hasError && styles.inputWrapperError,
              ]}
            >
              {leftIconName !== undefined ? (
                <Icon
                  name={leftIconName}
                  size={18}
                  color={
                    hasError
                      ? "#EF4444"
                      : isFocused
                      ? "#1E3A8A"
                      : COLORS.neutral[400]
                  }
                  style={styles.iconLeft}
                />
              ) : null}

              <TextInput
                style={styles.textInput}
                placeholder={placeholder}
                placeholderTextColor={COLORS.neutral[400]}
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
                    color={COLORS.neutral[400]}
                  />
                </TouchableOpacity>
              ) : null}
            </View>

            {hasError ? (
              <Text style={styles.errorText}>{error?.message}</Text>
            ) : helperText !== undefined ? (
              <Text style={styles.helperText}>{helperText}</Text>
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
    color: "#334155",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: "#1E3A8A",
    backgroundColor: "#FFFFFF",
  },
  inputWrapperError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  iconLeft: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: "#0F172A",
    height: "100%",
    ...Platform.select({ web: { outlineWidth: 0 } }),
  },
  eyeToggle: {
    padding: 6,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#EF4444",
  },
  helperText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
  },
});
