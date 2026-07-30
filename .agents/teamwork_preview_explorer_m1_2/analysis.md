# `@edge/ui` Component Theme Audit & Refactoring Blueprint (Milestone 1)

## Executive Summary
This document provides a read-only architectural audit and refactoring blueprint for all 7 existing shared UI components in `packages/ui/`:
1. `Button` (`packages/ui/components/Button.tsx`)
2. `FormFieldInput` (`packages/ui/components/FormFieldInput.tsx`)
3. `AlertToast` (`packages/ui/components/AlertToast.tsx`)
4. `Avatar` (`packages/ui/components/Avatar.tsx`)
5. `DataTable` (`packages/ui/tables/DataTable.tsx`)
6. `StatusBadge` (`packages/ui/tables/StatusBadge.tsx`)
7. `ServiceFormModal` (`packages/ui/client/ServiceFormModal.tsx`)

Currently, these components rely on static imports from `packages/ui/theme/tokens.ts` (e.g. `import { COLORS } from '../theme/tokens'`) or inline hardcoded hex colors (e.g. `#1E3A8A`, `#EF4444`, `#F8FAFC`). This prevents components from dynamically adapting when the application switches between Light Mode and Dark Mode.

Our goal is to refactor each component to consume the runtime `useTheme()` hook context (`const { colors, isDark } = useTheme()`), ensuring:
- **100% Dynamic Dark/Light Mode Support**: Color palettes adapt dynamically based on active theme context.
- **Strict Type Safety**: **ZERO** `as` type assertions, **ZERO** `!` non-null assertions, and **ZERO** `any` types.
- **100% Backward Compatibility**: All component props interfaces, default values, accessibility features, and layout dimensions remain completely unchanged.

---

## Detailed Component Audit & Refactoring Blueprints

### 1. `Button` (`packages/ui/components/Button.tsx`)

#### A. Component Overview & Line Count
- **File**: `packages/ui/components/Button.tsx` (188 lines)
- **Props Interface**: `ButtonProps` (`children`, `onPress`, `variant?`, `size?`, `isLoading?`, `isDisabled?`, `leftIcon?`, `rightIcon?`, `fullWidth?`, `style?`, `textStyle?`)
- **Variants Supported**: `"primary" | "secondary" | "outline" | "ghost" | "danger"`

#### B. Audit of Hardcoded Values & Static Imports
- **Line 12**: `import { COLORS, TYPOGRAPHY, RADIUS } from "../theme/tokens";` (Static import of `COLORS`)
- **Line 109**: `<ActivityIndicator color={variant === "outline" || variant === "ghost" ? COLORS.brand[800] : "#FFFFFF"} />` (Static token & hardcoded hex `#FFFFFF`)
- **Line 153**: `primaryBtn`: `backgroundColor: "#1E3A8A"` (Hardcoded Executive Navy hex)
- **Line 156**: `primaryText`: `color: "#FFFFFF"` (Hardcoded white hex)
- **Line 159**: `secondaryBtn`: `backgroundColor: "#F1F5F9"` (Hardcoded slate 100 hex)
- **Line 162**: `secondaryText`: `color: "#1E293B"` (Hardcoded slate 800 hex)
- **Line 165**: `outlineBtn`: `backgroundColor: "#FFFFFF"` (Hardcoded white hex)
- **Line 167**: `outlineBtn`: `borderColor: "#CBD5E1"` (Hardcoded slate 300 hex)
- **Line 170**: `outlineText`: `color: "#334155"` (Hardcoded slate 700 hex)
- **Line 176**: `ghostText`: `color: "#2563EB"` (Hardcoded blue 600 hex)
- **Line 179**: `dangerBtn`: `backgroundColor: "#DC2626"` (Hardcoded red 600 hex)

#### C. Type Safety Audit
- `as` assertions: **0** found.
- `!` non-null assertions: **0** found.
- `any` types: **0** found.
- Safe null checks: Explicit checks present for `leftIcon !== undefined && leftIcon !== null`.

#### D. Proposed Refactoring Blueprint
```tsx
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
import { useTheme } from "../theme/ThemeProvider";

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
  const { colors } = useTheme();
  const disabled = isDisabled || isLoading;

  const getDynamicVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "primary":
        return { backgroundColor: colors.brand[800] };
      case "secondary":
        return { backgroundColor: colors.neutral[100] };
      case "outline":
        return { backgroundColor: colors.neutral.white, borderWidth: 1, borderColor: colors.neutral[300] };
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
        return { color: colors.neutral[800] };
      case "outline":
        return { color: colors.neutral[700] };
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
  fullWidth: { width: "100%" },
  disabledBtn: { opacity: 0.6 },
  innerContent: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  baseText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 15, fontWeight: TYPOGRAPHY.weights.bold },
  iconLeft: { marginRight: 2 },
  iconRight: { marginLeft: 2 },
});
```

---

### 2. `FormFieldInput` (`packages/ui/components/FormFieldInput.tsx`)

#### A. Component Overview & Line Count
- **File**: `packages/ui/components/FormFieldInput.tsx` (169 lines)
- **Props Interface**: `FormFieldInputProps<T extends FieldValues>` (`control`, `name`, `label`, `leftIconName?`, `isPassword?`, `helperText?`, `placeholder?`, `keyboardType?`, `autoCapitalize?`)

#### B. Audit of Hardcoded Values & Static Imports
- **Line 12**: `import { COLORS, TYPOGRAPHY } from "../theme/tokens";` (Static import of `COLORS`)
- **Line 62**: `color={hasError ? "#EF4444" : isFocused ? "#1E3A8A" : COLORS.neutral[400]}` (Hardcoded hexes `#EF4444`, `#1E3A8A` & static token `COLORS.neutral[400]`)
- **Line 74**: `placeholderTextColor={COLORS.neutral[400]}` (Static token `COLORS.neutral[400]`)
- **Line 97**: `color={COLORS.neutral[400]}` (Static token `COLORS.neutral[400]`)
- **Line 124**: `label`: `color: "#334155"` (Hardcoded slate 700 hex)
- **Line 131**: `inputWrapper`: `borderColor: "#CBD5E1"` (Hardcoded slate 300 hex)
- **Line 133**: `inputWrapper`: `backgroundColor: "#F8FAFC"` (Hardcoded slate 50 hex)
- **Line 137**: `inputWrapperFocused`: `borderColor: "#1E3A8A"` (Hardcoded navy hex)
- **Line 138**: `inputWrapperFocused`: `backgroundColor: "#FFFFFF"` (Hardcoded white hex)
- **Line 141**: `inputWrapperError`: `borderColor: "#EF4444"` (Hardcoded red 500 hex)
- **Line 142**: `inputWrapperError`: `backgroundColor: "#FEF2F2"` (Hardcoded red 50 hex)
- **Line 151**: `textInput`: `color: "#0F172A"` (Hardcoded slate 900 hex)
- **Line 161**: `errorText`: `color: "#EF4444"` (Hardcoded red 500 hex)
- **Line 166**: `helperText`: `color: "#64748B"` (Hardcoded slate 500 hex)

#### C. Type Safety Audit
- `as` assertions: **0** found.
- `!` non-null assertions: **0** found.
- `any` types: **0** found.
- Type guard: `typeof value === "string" ? value : ""` safely handles form field control value.

#### D. Proposed Refactoring Blueprint
```tsx
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
import { useTheme } from "../theme/ThemeProvider";
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
  const { colors } = useTheme();

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
            : colors.neutral[300],
          backgroundColor: hasError
            ? colors.semantic.errorBg
            : isFocused
            ? colors.neutral.white
            : colors.neutral[50],
        };

        const iconColor = hasError
          ? colors.semantic.error
          : isFocused
          ? colors.brand[800]
          : colors.neutral[400];

        return (
          <View style={styles.container}>
            <Text style={[styles.label, { color: colors.neutral[700] }]}>{label}</Text>
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
                style={[styles.textInput, { color: colors.neutral[900] }]}
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
              <Text style={[styles.helperText, { color: colors.neutral[500] }]}>{helperText}</Text>
            ) : null}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16, gap: 6 },
  label: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: TYPOGRAPHY.weights.semibold },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  iconLeft: { marginRight: 10 },
  textInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    height: "100%",
    ...Platform.select({ web: { outlineWidth: 0 } }),
  },
  eyeToggle: { padding: 6 },
  errorText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12 },
  helperText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12 },
});
```

---

### 3. `AlertToast` (`packages/ui/components/AlertToast.tsx`)

#### A. Component Overview & Line Count
- **File**: `packages/ui/components/AlertToast.tsx` (122 lines)
- **Props Interface**: `AlertToastProps` (`message`, `onDismiss`, `variant?`, `style?`)
- **Variants Supported**: `"error" | "success" | "warning" | "info"`

#### B. Audit of Hardcoded Values & Static Imports
- **Line 4**: `import { TYPOGRAPHY, COLORS } from "../theme/tokens";` (Static import of `COLORS`)
- **Line 28**: `iconColor: "#EF4444"` (Hardcoded red hex)
- **Line 35**: `iconColor: "#10B981"` (Hardcoded emerald hex)
- **Line 42**: `iconColor: "#F59E0B"` (Hardcoded amber hex)
- **Line 49**: `iconColor: "#3B82F6"` (Hardcoded blue hex)
- **Line 56**: `iconColor: "#EF4444"` (Hardcoded red hex default)
- **Line 68**: `color={COLORS.neutral[500]}` (Static token `COLORS.neutral[500]`)
- **Line 94-98**: `errorContainer` (`bg: #FEF2F2`, `border: #FCA5A5`), `errorText` (`color: #991B1B`)
- **Line 101-105**: `successContainer` (`bg: #ECFDF5`, `border: #6EE7B7`), `successText` (`color: #065F46`)
- **Line 108-112**: `warningContainer` (`bg: #FFFBEB`, `border: #FDE68A`), `warningText` (`color: #92400E`)
- **Line 115-119**: `infoContainer` (`bg: #EFF6FF`, `border: #93C5FD`), `infoText` (`color: #1E40AF`)

#### C. Type Safety Audit
- `as` assertions: **0** type cast assertions (only `as const` string literal type hint).
- `!` non-null assertions: **0** found.
- `any` types: **0** found.
- Safe null checks: `if (message === null || message.length === 0) return null;`.

#### D. Proposed Refactoring Blueprint
```tsx
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ViewStyle } from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import { TYPOGRAPHY } from "../theme/tokens";
import { useTheme } from "../theme/ThemeProvider";

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
  const { colors } = useTheme();

  if (message === null || message.length === 0) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "error":
        return {
          containerStyle: { backgroundColor: colors.semantic.errorBg, borderColor: colors.semantic.errorBorder },
          textStyle: { color: colors.semantic.errorText ?? colors.semantic.error },
          icon: "alert-circle" as const,
          iconColor: colors.semantic.error,
        };
      case "success":
        return {
          containerStyle: { backgroundColor: colors.semantic.successBg, borderColor: colors.semantic.successBorder },
          textStyle: { color: colors.semantic.successText ?? colors.semantic.success },
          icon: "check-circle" as const,
          iconColor: colors.semantic.success,
        };
      case "warning":
        return {
          containerStyle: { backgroundColor: colors.semantic.warningBg, borderColor: colors.semantic.warningBorder },
          textStyle: { color: colors.semantic.warningText ?? colors.semantic.warning },
          icon: "alert-triangle" as const,
          iconColor: colors.semantic.warning,
        };
      case "info":
        return {
          containerStyle: { backgroundColor: colors.semantic.infoBg, borderColor: colors.semantic.infoBorder },
          textStyle: { color: colors.semantic.infoText ?? colors.semantic.info },
          icon: "info" as const,
          iconColor: colors.semantic.info,
        };
      default:
        return {
          containerStyle: { backgroundColor: colors.semantic.errorBg, borderColor: colors.semantic.errorBorder },
          textStyle: { color: colors.semantic.errorText ?? colors.semantic.error },
          icon: "alert-circle" as const,
          iconColor: colors.semantic.error,
        };
    }
  };

  const v = getVariantStyles();

  return (
    <View style={[styles.baseContainer, v.containerStyle, style]}>
      <Icon name={v.icon} size={20} color={v.iconColor} />
      <Text style={[styles.baseText, v.textStyle]}>{message}</Text>
      <TouchableOpacity onPress={onDismiss} style={styles.closeBtn} activeOpacity={0.7}>
        <Icon name="x" size={16} color={colors.neutral[500]} />
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
});
```

---

### 4. `Avatar` (`packages/ui/components/Avatar.tsx`)

#### A. Component Overview & Line Count
- **File**: `packages/ui/components/Avatar.tsx` (106 lines)
- **Props Interface**: `AvatarProps` (`imageUri?`, `name`, `size?`, `variant?`, `useDeterministicColors?`)
- **Exported Helper**: `getAvatarColors(name: string, colors?: ThemeColors)`

#### B. Audit of Hardcoded Values & Static Imports
- **Line 3**: `import { COLORS, RADIUS, TYPOGRAPHY } from '../theme/tokens';` (Static import of `COLORS`)
- **Lines 16-23**: `fallbackColors` static array referencing `COLORS.brand[...]` and `COLORS.semantic[...]`
- **Line 35**: `return { bg: COLORS.neutral[100], text: COLORS.neutral[900] };`
- **Line 49**: `{ bg: COLORS.neutral.white, text: COLORS.brand[900] }`

#### C. Type Safety Audit
- `as` assertions: **0** type cast assertions (`as const` on static config).
- `!` non-null assertions: **0** found.
- `any` types: **0** found.
- Safe null checks: `if (match !== undefined) return match;` & `if (imageUri !== undefined && imageUri !== null && imageUri.length > 0)`.

#### D. Proposed Refactoring Blueprint
```tsx
import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { RADIUS, TYPOGRAPHY } from '../theme/tokens';
import { useTheme, ThemeColors } from '../theme/ThemeProvider';

type AvatarSize = 'sm' | 'md' | 'lg';
type AvatarVariant = 'circle' | 'square';

interface AvatarProps {
  imageUri?: string | null;
  name: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  useDeterministicColors?: boolean;
}

export function getAvatarColors(name: string, themeColors?: ThemeColors) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  if (themeColors !== undefined) {
    const dynamicFallbackColors = [
      { bg: themeColors.brand[900], text: themeColors.neutral.white },
      { bg: themeColors.brand[700], text: themeColors.neutral.white },
      { bg: themeColors.brand[500], text: themeColors.neutral.white },
      { bg: themeColors.semantic.successBg, text: themeColors.semantic.success },
      { bg: themeColors.semantic.warningBg, text: themeColors.semantic.warning },
      { bg: themeColors.semantic.infoBg, text: themeColors.semantic.info },
    ];
    const index = Math.abs(hash) % dynamicFallbackColors.length;
    const match = dynamicFallbackColors[index];
    if (match !== undefined) {
      return match;
    }
    return { bg: themeColors.neutral[100], text: themeColors.neutral[900] };
  }

  return { bg: '#1E3A8A', text: '#FFFFFF' };
}

export function Avatar({
  imageUri,
  name,
  size = 'md',
  variant = 'circle',
  useDeterministicColors = false,
}: AvatarProps) {
  const { colors } = useTheme();
  const initial = name.length > 0 ? name.charAt(0).toUpperCase() : 'S';

  const avatarColor = useDeterministicColors
    ? getAvatarColors(name, colors)
    : { bg: colors.neutral.white, text: colors.brand[900] };

  const sizeValue = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
  const fontStyle = size === 'sm' ? styles.textSm : size === 'lg' ? styles.textLg : styles.textMd;
  const borderRadius = variant === 'circle' ? sizeValue / 2 : RADIUS.button;

  const containerStyle = [
    styles.avatarContainer,
    {
      width: sizeValue,
      height: sizeValue,
      borderRadius,
      backgroundColor: avatarColor.bg,
    },
  ];

  if (imageUri !== undefined && imageUri !== null && imageUri.length > 0) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={{
          width: sizeValue,
          height: sizeValue,
          borderRadius,
        }}
      />
    );
  }

  return (
    <View style={containerStyle}>
      <Text style={[styles.fallbackText, fontStyle, { color: avatarColor.text }]}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  textSm: { fontSize: 11 },
  textMd: { fontSize: 14 },
  textLg: { fontSize: 18 },
});
```

---

### 5. `DataTable` (`packages/ui/tables/DataTable.tsx`)

#### A. Component Overview & Line Count
- **File**: `packages/ui/tables/DataTable.tsx` (524 lines)
- **Props Interface**: `DataTableProps<TData, TValue>` (`data`, `columns`, `searchPlaceholder?`, `searchKey?`, `statusKey?`)
- **Subcomponents**: `TabButton`, `DataTableRow`, `PaginationButton`

#### B. Audit of Hardcoded Values & Static Imports
- **Line 13**: Static `COLORS` import from `theme/tokens`.
- **20+ direct references to `COLORS`**:
  - `Line 109`: `color={!disabled ? COLORS.neutral[700] : COLORS.neutral[300]}`
  - `Line 214, 217, 269`: `COLORS.neutral[400]`, `COLORS.neutral[300]`
  - `Line 314, 317, 334, 338, 352, 355`: `COLORS.neutral.white`, `COLORS.neutral[200]`, `COLORS.neutral[50]`, `COLORS.neutral[100]`
  - `Line 366, 369`: `COLORS.neutral[500]`, `COLORS.brand[800]`
  - `Line 375, 390, 401, 414, 416, 430, 437, 449, 458, 467, 471, 482, 493, 506, 510`: `COLORS.neutral[...]` across styles.

#### C. Type Safety Audit
- `as` assertions: **0** found.
- `!` non-null assertions: **0** found.
- `any` types: **0** found.
- Type Guard: `isRecord(value: unknown): value is Record<string, unknown>` is cleanest type guard pattern.

#### D. Proposed Refactoring Blueprint
- Subcomponents `TabButton`, `DataTableRow`, and `PaginationButton` will consume `useTheme()` hook to receive dynamic theme `colors`.
- Dynamic color map:
  - Table Card Container: `backgroundColor: colors.neutral.white` (dark: `#1E293B`), `borderColor: colors.neutral[200]` (dark: `#334155`).
  - Toolbar & Tabs: Tabs container `backgroundColor: colors.neutral[50]`, Active tab `backgroundColor: colors.neutral.white`, Active text `color: colors.brand[800]`.
  - Search Box: bg `colors.neutral.white`, border `colors.neutral[200]`, icon & placeholder `colors.neutral[400]`, input text `colors.neutral[900]`.
  - Table Header: bg `colors.neutral[50]`, borderBottom `colors.neutral[200]`, text `colors.neutral[500]`.
  - Rows: bg `colors.neutral.white`, hover bg `colors.neutral[50]`, borderBottom `colors.neutral[200]`.
  - Empty State: icon `colors.neutral[300]`, text `colors.neutral[400]`.
  - Pagination: text `colors.neutral[500]`, buttons bg `colors.neutral.white` (hover `colors.neutral[50]`, disabled `colors.neutral[50]`), border `colors.neutral[200]`.

---

### 6. `StatusBadge` (`packages/ui/tables/StatusBadge.tsx`)

#### A. Component Overview & Line Count
- **File**: `packages/ui/tables/StatusBadge.tsx` (62 lines)
- **Props Interface**: `StatusBadgeProps` (`status: string`)
- **Exported Helper**: `getStatusColors(status: string, colors?: ThemeColors)`

#### B. Audit of Hardcoded Values & Static Imports
- **Line 3**: `import { COLORS, TYPOGRAPHY } from '../theme/tokens';` (Static `COLORS` import)
- **Lines 9-11**: `COLORS.semantic.successBg`, `COLORS.semantic.successBorder`, `COLORS.semantic.success`
- **Lines 16-18**: `COLORS.semantic.warningBg`, `COLORS.semantic.warningBorder`, `COLORS.semantic.warning`
- **Lines 23-25**: `COLORS.semantic.errorBg`, `COLORS.semantic.errorBorder`, `COLORS.semantic.error`
- **Lines 29-31**: `COLORS.neutral[100]`, `COLORS.neutral[200]`, `COLORS.neutral[600]`

#### C. Type Safety Audit
- `as` assertions: **0** found.
- `!` non-null assertions: **0** found.
- `any` types: **0** found.

#### D. Proposed Refactoring Blueprint
```tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { TYPOGRAPHY } from '../theme/tokens';
import { useTheme, ThemeColors } from '../theme/ThemeProvider';

export const getStatusColors = (status: string, themeColors?: ThemeColors) => {
  const normalized = status.toLowerCase();
  const c = themeColors;

  if (normalized === 'approved' || normalized === 'active' || normalized === 'complete') {
    return {
      bg: c !== undefined ? c.semantic.successBg : '#ECFDF5',
      border: c !== undefined ? c.semantic.successBorder : '#A7F3D0',
      text: c !== undefined ? c.semantic.success : '#10B981',
    };
  }
  if (normalized === 'pending' || normalized === 'reviewing' || normalized === 'warning') {
    return {
      bg: c !== undefined ? c.semantic.warningBg : '#FEF3C7',
      border: c !== undefined ? c.semantic.warningBorder : '#FDE68A',
      text: c !== undefined ? c.semantic.warning : '#F59E0B',
    };
  }
  if (normalized === 'rejected' || normalized === 'failed' || normalized === 'error') {
    return {
      bg: c !== undefined ? c.semantic.errorBg : '#FEF2F2',
      border: c !== undefined ? c.semantic.errorBorder : '#FCA5A5',
      text: c !== undefined ? c.semantic.error : '#EF4444',
    };
  }
  return {
    bg: c !== undefined ? c.neutral[100] : '#F1F5F9',
    border: c !== undefined ? c.neutral[200] : '#E2E8F0',
    text: c !== undefined ? c.neutral[600] : '#475569',
  };
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { colors } = useTheme();
  const badgeColors = getStatusColors(status, colors);
  return (
    <View style={[styles.badge, { backgroundColor: badgeColors.bg, borderColor: badgeColors.border }]}>
      <Text style={[styles.badgeText, { color: badgeColors.text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
```

---

### 7. `ServiceFormModal` (`packages/ui/client/ServiceFormModal.tsx`)

#### A. Component Overview & Line Count
- **File**: `packages/ui/client/ServiceFormModal.tsx` (386 lines)
- **Props Interface**: `ServiceFormModalProps` (`visible`, `serviceTitle`, `onClose`, `onSubmit`, `isSubmitting`)

#### B. Audit of Hardcoded Values & Static Imports
- **Line 13**: `import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from "../theme/tokens";` (Static `COLORS` import)
- **Line 199**: `backgroundColor: "rgba(3, 26, 110, 0.4)"` (Hardcoded overlay RGBA)
- **Line 216**: `header`: `backgroundColor: COLORS.brand[900]` (Static token)
- **Line 80, 86, 182, 186, 206, 232**: `COLORS.neutral.white` (Static token)
- **Line 250, 251, 261, 315, 316, 326**: `COLORS.semantic.error`, `COLORS.semantic.errorBg`, `COLORS.semantic.errorBorder`, `COLORS.semantic.successBg`, `COLORS.semantic.successBorder`
- **Line 104, 115, 126, 277, 278, 284, 301, 302, 321, 331, 348, 360, 369, 377**: `COLORS.neutral[...]` static tokens across styles.

#### C. Type Safety Audit
- `as` assertions: **0** found.
- `!` non-null assertions: **0** found.
- `any` types: **0** found.
- Safe Error Guard: `catch (err: unknown) { if (err instanceof Error) { setError(err.message); } else { setError("An error occurred..."); } }`.

#### D. Proposed Refactoring Blueprint
- Consume `const { colors, isDark } = useTheme();`.
- Modal Overlay: `backgroundColor: isDark ? "rgba(15, 23, 42, 0.75)" : "rgba(3, 26, 110, 0.4)"`.
- Modal Content: bg `colors.neutral.white` (dark: `#1E293B`).
- Modal Header: bg `colors.brand[900]` (dark: `#0F172A`), title & icons `colors.neutral.white`.
- Modal Subtitle & Labels: subtitle `colors.neutral[900]` (dark: `colors.neutral[50]`), labels `colors.neutral[600]` (dark: `colors.neutral[300]`).
- Form Inputs & Textarea: bg `colors.neutral[50]`, border `colors.neutral[200]`, text `colors.neutral[900]`, placeholders `colors.neutral[400]`.
- Upload Area: bg `colors.neutral[50]`, border `colors.neutral[300]`, text `colors.neutral[600]`. Attached state: bg `colors.semantic.successBg`, border `colors.semantic.successBorder`, text `colors.semantic.success`.
- Footer: borderTop `colors.neutral[200]`. Cancel btn border `colors.neutral[200]`, text `colors.neutral[600]`. Submit btn bg `colors.brand[700]`, disabled bg `colors.neutral[300]`, text `colors.neutral.white`.

---

## Component Audit Summary Matrix

| # | Component Name | Path | Total Lines | Static `COLORS` References | Hardcoded Hex Colors | Strict Rule Compliance (`as`, `!`, `any`) | Dynamic `useTheme()` Strategy |
|---|----------------|------|-------------|----------------------------|----------------------|------------------------------------------|--------------------------------|
| 1 | `Button` | `packages/ui/components/Button.tsx` | 188 | 2 | 9 | 100% PASS (0 violations) | Dynamic variant & text color getters |
| 2 | `FormFieldInput` | `packages/ui/components/FormFieldInput.tsx` | 169 | 3 | 11 | 100% PASS (0 violations) | Dynamic inputWrapper & status icon colors |
| 3 | `AlertToast` | `packages/ui/components/AlertToast.tsx` | 122 | 2 | 16 | 100% PASS (0 violations) | Dynamic semantic palette mapping |
| 4 | `Avatar` | `packages/ui/components/Avatar.tsx` | 106 | 9 | 0 | 100% PASS (0 violations) | Theme-aware `getAvatarColors` helper |
| 5 | `DataTable` | `packages/ui/tables/DataTable.tsx` | 524 | 26 | 0 | 100% PASS (0 violations) | Subcomponent context consumption |
| 6 | `StatusBadge` | `packages/ui/tables/StatusBadge.tsx` | 62 | 12 | 0 | 100% PASS (0 violations) | Palette-injected `getStatusColors` |
| 7 | `ServiceFormModal` | `packages/ui/client/ServiceFormModal.tsx` | 386 | 28 | 1 | 100% PASS (0 violations) | Dynamic overlay & form modal styling |

---

## Verification & Implementation Guidelines for Implementer
When Implementer agents apply these refactorings in Milestone 1:
1. Ensure `packages/ui/theme/ThemeProvider.tsx` and `useTheme()` are exported from `packages/ui/index.ts`.
2. Do **NOT** remove structural token exports (`SPACING`, `RADIUS`, `SHADOWS`, `TYPOGRAPHY`) from `theme/tokens.ts`.
3. In each component, replace `import { COLORS } from '../theme/tokens'` with `import { useTheme } from '../theme/ThemeProvider'`.
4. Run `npx tsc --noEmit` from root or `packages/ui` to verify zero TypeScript compilation errors.
5. All component props interfaces remain unchanged to ensure existing usage across internal apps remains 100% compatible.
