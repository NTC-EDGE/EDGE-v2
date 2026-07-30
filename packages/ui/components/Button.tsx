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
import { TYPOGRAPHY, RADIUS } from "../theme/tokens";
import { useTheme } from "../theme/useTheme";

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
  const { colors, isDark } = useTheme();
  const disabled = isDisabled || isLoading;

  const getDynamicVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "primary":
        return { backgroundColor: colors.brand[800] };
      case "secondary":
        return { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] };
      case "outline":
        return { backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border };
      case "ghost":
        return { backgroundColor: "transparent" };
      case "danger":
        return { backgroundColor: colors.semantic.error };
      default:
        return { backgroundColor: colors.brand[800] };
    }
  };

  const getDynamicTextStyle = (): TextStyle => {
    switch (variant) {
      case "primary":
      case "danger":
        return { color: colors.neutral.white };
      case "secondary":
        return { color: colors.text };
      case "outline":
        return { color: colors.text };
      case "ghost":
        return { color: colors.brand[700] };
      default:
        return { color: colors.neutral.white };
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

  const spinnerColor = variant === "outline" || variant === "ghost" ? colors.brand[800] : colors.neutral.white;

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        getDynamicVariantStyle(),
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
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={styles.innerContent}>
          {leftIcon !== undefined && leftIcon !== null ? (
            <View style={styles.iconLeft}>{leftIcon}</View>
          ) : null}
          <Text style={[styles.baseText, getDynamicTextStyle(), textStyle]}>
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
  iconLeft: {
    marginRight: 2,
  },
  iconRight: {
    marginLeft: 2,
  },
});
