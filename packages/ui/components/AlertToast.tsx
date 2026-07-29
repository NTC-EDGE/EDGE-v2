import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ViewStyle } from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import { TYPOGRAPHY, COLORS } from "../theme/tokens";

export interface AlertToastProps {
  message: string | null;
  onDismiss: () => void;
  variant?: "error" | "success" | "warning" | "info";
  style?: ViewStyle;
}

export function AlertToast({
  message,
  onDismiss,
  variant = "error",
  style,
}: AlertToastProps) {
  if (message === null || message.length === 0) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "error":
        return {
          container: styles.errorContainer,
          text: styles.errorText,
          icon: "alert-circle" as const,
          iconColor: "#EF4444",
        };
      case "success":
        return {
          container: styles.successContainer,
          text: styles.successText,
          icon: "check-circle" as const,
          iconColor: "#10B981",
        };
      case "warning":
        return {
          container: styles.warningContainer,
          text: styles.warningText,
          icon: "alert-triangle" as const,
          iconColor: "#F59E0B",
        };
      case "info":
        return {
          container: styles.infoContainer,
          text: styles.infoText,
          icon: "info" as const,
          iconColor: "#3B82F6",
        };
      default:
        return {
          container: styles.errorContainer,
          text: styles.errorText,
          icon: "alert-circle" as const,
          iconColor: "#EF4444",
        };
    }
  };

  const v = getVariantStyles();

  return (
    <View style={[styles.baseContainer, v.container, style]}>
      <Icon name={v.icon} size={20} color={v.iconColor} />
      <Text style={[styles.baseText, v.text]}>{message}</Text>
      <TouchableOpacity onPress={onDismiss} style={styles.closeBtn} activeOpacity={0.7}>
        <Icon name="x" size={16} color={COLORS.neutral[500]} />
      </TouchableOpacity>
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
  errorContainer: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
  },
  errorText: {
    color: "#991B1B",
  },
  successContainer: {
    backgroundColor: "#ECFDF5",
    borderColor: "#6EE7B7",
  },
  successText: {
    color: "#065F46",
  },
  warningContainer: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  warningText: {
    color: "#92400E",
  },
  infoContainer: {
    backgroundColor: "#EFF6FF",
    borderColor: "#93C5FD",
  },
  infoText: {
    color: "#1E40AF",
  },
});
