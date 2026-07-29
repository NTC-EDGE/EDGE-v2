import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Platform,
  ViewStyle,
  TextStyle,
} from "react-native";
import { COLORS, TYPOGRAPHY, RADIUS } from "../theme/tokens";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  style,
  textStyle,
}: ButtonProps) {
  const disabled = isDisabled || isLoading;

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "primary":
        return styles.primaryBtn;
      case "secondary":
        return styles.secondaryBtn;
      case "outline":
        return styles.outlineBtn;
      case "ghost":
        return styles.ghostBtn;
      case "danger":
        return styles.dangerBtn;
      default:
        return styles.primaryBtn;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case "primary":
      case "danger":
        return styles.primaryText;
      case "secondary":
        return styles.secondaryText;
      case "outline":
        return styles.outlineText;
      case "ghost":
        return styles.ghostText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case "sm":
        return { height: 38, paddingHorizontal: 12 };
      case "md":
        return { height: 48, paddingHorizontal: 16 };
      case "lg":
        return { height: 54, paddingHorizontal: 20 };
      default:
        return { height: 48, paddingHorizontal: 16 };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        getVariantStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabledBtn,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" || variant === "ghost" ? COLORS.brand[800] : "#FFFFFF"}
        />
      ) : (
        <View style={styles.innerContent}>
          {leftIcon !== undefined && leftIcon !== null ? (
            <View style={styles.iconLeft}>{leftIcon}</View>
          ) : null}
          <Text style={[styles.baseText, getTextStyle(), textStyle]}>
            {children}
          </Text>
          {rightIcon !== undefined && rightIcon !== null ? (
            <View style={styles.iconRight}>{rightIcon}</View>
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: RADIUS.button ?? 10,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  fullWidth: {
    width: "100%",
  },
  disabledBtn: {
    opacity: 0.6,
  },
  innerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  baseText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  primaryBtn: {
    backgroundColor: "#1E3A8A",
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryBtn: {
    backgroundColor: "#F1F5F9",
  },
  secondaryText: {
    color: "#1E293B",
  },
  outlineBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  outlineText: {
    color: "#334155",
  },
  ghostBtn: {
    backgroundColor: "transparent",
  },
  ghostText: {
    color: "#2563EB",
  },
  dangerBtn: {
    backgroundColor: "#DC2626",
  },
  iconLeft: {
    marginRight: 2,
  },
  iconRight: {
    marginLeft: 2,
  },
});
