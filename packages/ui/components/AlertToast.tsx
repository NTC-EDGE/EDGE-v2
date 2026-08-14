import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import { TYPOGRAPHY } from "../theme/tokens";
import { useTheme } from "../theme/useTheme";

export interface AlertToastProps {
  message: string | null;
  onDismiss?: () => void;
  variant?: "error" | "success" | "warning" | "info";
  style?: ViewStyle;
}

interface VariantStyle {
  containerStyle: ViewStyle;
  textStyle: TextStyle;
  icon: keyof typeof Icon.glyphMap;
  iconColor: string;
}

export function AlertToast({
  message,
  onDismiss,
  variant = "error",
  style,
}: AlertToastProps) {
  const { colors } = useTheme();

  if (message === null || message.length === 0) return null;

  const getVariantStyles = (): VariantStyle => {
    switch (variant) {
      case "success":
        return {
          containerStyle: { backgroundColor: colors.semantic.successBg, borderColor: colors.semantic.successBorder },
          textStyle: { color: colors.semantic.successText },
          icon: "check-circle",
          iconColor: colors.semantic.success,
        };
      case "warning":
        return {
          containerStyle: { backgroundColor: colors.semantic.warningBg, borderColor: colors.semantic.warningBorder },
          textStyle: { color: colors.semantic.warningText },
          icon: "alert-triangle",
          iconColor: colors.semantic.warning,
        };
      case "info":
        return {
          containerStyle: { backgroundColor: colors.semantic.infoBg, borderColor: colors.semantic.infoBorder },
          textStyle: { color: colors.semantic.infoText },
          icon: "info",
          iconColor: colors.semantic.info,
        };
      case "error":
      default:
        return {
          containerStyle: { backgroundColor: colors.semantic.errorBg, borderColor: colors.semantic.errorBorder },
          textStyle: { color: colors.semantic.errorText },
          icon: "alert-circle",
          iconColor: colors.semantic.error,
        };
    }
  };

  const v = getVariantStyles();

  return (
    <View style={[styles.baseContainer, v.containerStyle, style]}>
      <Icon name={v.icon} size={20} color={v.iconColor} />
      <Text style={[styles.baseText, v.textStyle]}>{message}</Text>
      {onDismiss !== undefined && onDismiss !== null && (
        <TouchableOpacity onPress={onDismiss} style={styles.closeBtn} activeOpacity={0.7}>
          <Icon name="x" size={16} color={colors.neutral[500]} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 999,
  },
  baseText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  closeBtn: {
    padding: 4,
  },
});
