import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { COLORS, Button, FormFieldInput, Icon as LucideIcon, TYPOGRAPHY, useTheme } from "@edge/ui";
import { useLoginForm } from "../hooks/useLoginForm";

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
    isSubmitting,
    isGoogleSubmitting,
    showGoogleSso,
  } = loginState;

  return (
    <View style={styles.formContainer}>
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

      {showGoogleSso ? (
        <>
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
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
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
