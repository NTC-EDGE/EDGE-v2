import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import {
  Button,
  FormFieldInput,
  Icon as LucideIcon,
  TYPOGRAPHY,
} from "@edge/ui";
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
}: LoginFormProps) {
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
      <View style={styles.demoPresetsContainer}>
        <Text style={styles.demoPresetsTitle}>QUICK FILL DEMO ACCOUNT</Text>
        <View style={styles.presetsPillRow}>
          {DEMO_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.email}
              style={styles.presetPill}
              onPress={() => handleApplyPreset(preset.email)}
              activeOpacity={0.7}
            >
              <Text style={styles.presetPillText}>{preset.label}</Text>
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
        <Text style={styles.forgotPassText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Atomic Credentials Submit Button */}
      <Button
        onPress={onSubmit}
        isLoading={isSubmitting}
        isDisabled={isSubmitting || isGoogleSubmitting}
        variant="primary"
        size="md"
        leftIcon={<LucideIcon name="log-in" size={18} color="#FFFFFF" />}
      >
        Sign In to Account
      </Button>

      {/* Divider */}
      <View style={styles.orDividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.orDividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Atomic Google SSO Button */}
      <Button
        onPress={handleGoogleSignIn}
        isLoading={isGoogleSubmitting}
        isDisabled={isSubmitting || isGoogleSubmitting}
        variant="outline"
        size="md"
        leftIcon={<LucideIcon name="chrome" size={18} color="#EA4335" />}
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
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  demoPresetsTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#475569",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  presetsPillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  presetPill: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  presetPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#1E3A8A",
  },
  forgotPassButton: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPassText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#2563EB",
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
    backgroundColor: "#E2E8F0",
  },
  orDividerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#94A3B8",
  },
});
