import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { COLORS, Button, FormFieldInput, Icon as LucideIcon, TYPOGRAPHY, useTheme } from "@edge/ui";
import { useLoginForm } from "../hooks/useLoginForm";

const DEMO_PRESETS = [
  { label: "Admin Evaluator", email: "evaluator@ntc.gov.ph" },
  { label: "Regional Staff", email: "staff.ncr@ntc.gov.ph" },
  { label: "System Admin", email: "admin@ntc.gov.ph" },
];

export interface LoginFormProps {
  loginState: ReturnType<typeof useLoginForm>;
  onForgotPasswordClick: () => void;
}

export function LoginForm({
  loginState,
  onForgotPasswordClick,
}: LoginFormProps): React.ReactElement {
  const { colors, isDark } = useTheme();
  const {
    form,
    onSubmit,
    handleGoogleSignIn,
    handleApplyPreset,
    isSubmitting,
    isGoogleSubmitting,
  } = loginState;

  return (
    <View style={styles.formContainer}>
      {/* Demo Presets */}
      <View
        style={[
          styles.demoPresetsContainer,
          { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] },
        ]}
      >
        <Text style={[styles.demoPresetsTitle, { color: colors.textMuted }]}>
          QUICK FILL DEMO ACCOUNT
        </Text>
        <View style={styles.presetsPillRow}>
          {DEMO_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.email}
              style={[
                styles.presetPill,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleApplyPreset(preset.email)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.presetPillText,
                  { color: isDark ? colors.brand.primary : colors.brand.secondary },
                ]}
              >
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Atomic Input Fields */}
      <FormFieldInput
        control={form.control}
        name="identifier"
        label="Email Address or Username"
        placeholder="staff@ntc.gov.ph"
        leftIconName="mail"
        keyboardType="email-address"
      />

      <FormFieldInput
        control={form.control}
        name="password"
        label="Password"
        placeholder="••••••••"
        leftIconName="lock"
        isPassword={true}
      />

      <TouchableOpacity
        style={styles.forgotPassButton}
        onPress={onForgotPasswordClick}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.forgotPassText,
            { color: isDark ? colors.brand.primary : colors.brand.secondary },
          ]}
        >
          Forgot Password?
        </Text>
      </TouchableOpacity>

      {/* Atomic Credentials Submit Button */}
      <Button
        onPress={onSubmit}
        isLoading={isSubmitting}
        isDisabled={isSubmitting || isGoogleSubmitting}
        variant="primary"
        size="md"
        leftIcon={<LucideIcon name="log-in" size={18} color={COLORS.neutral.white} />}
      >
        Sign In to Account
      </Button>

      {/* Divider */}
      <View style={styles.orDividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.orDividerText, { color: colors.textMuted }]}>OR</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      {/* Atomic Google SSO Button */}
      <Button
        onPress={handleGoogleSignIn}
        isLoading={isGoogleSubmitting}
        isDisabled={isSubmitting || isGoogleSubmitting}
        variant="outline"
        size="md"
        leftIcon={<LucideIcon name="chrome" size={18} color={COLORS.semantic.error} />}
      >
        Continue with Google
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
  },
  demoPresetsContainer: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  demoPresetsTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  presetsPillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  presetPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  presetPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  forgotPassButton: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPassText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  orDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  orDividerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
