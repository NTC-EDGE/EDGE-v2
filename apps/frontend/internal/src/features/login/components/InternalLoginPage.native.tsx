import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  COLORS,
  TYPOGRAPHY,
  Button,
  FormFieldInput,
  AlertToast,
  Icon as LucideIcon,
} from "@edge/ui";
import { NtcLogo } from "./NtcLogo";
import { useLoginForm } from "../hooks/useLoginForm";
import { ForgotPasswordPage } from "./ForgotPasswordPage";

const DEMO_PRESETS = [
  { label: "Evaluator", email: "evaluator@ntc.gov.ph" },
  { label: "NCR Staff", email: "staff.ncr@ntc.gov.ph" },
];

export function InternalLoginPageNative() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const {
    form,
    onSubmit,
    handleGoogleSignIn,
    handleApplyPreset,
    isSubmitting,
    isGoogleSubmitting,
    toastMessage,
    dismissToast,
  } = useLoginForm();

  if (showForgotPassword) {
    return <ForgotPasswordPage onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  return (
    <SafeAreaView style={styles.nativeSafeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {toastMessage !== null ? (
          <View style={styles.toastWrapper}>
            <AlertToast message={toastMessage} onDismiss={dismissToast} variant="error" />
          </View>
        ) : null}

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Header Logo */}
            <View style={styles.logoHeader}>
              <NtcLogo size="medium" variant="light" showSubtext={false} />
              <View style={styles.badgePill}>
                <View style={styles.pulseDot} />
                <Text style={styles.badgeText}>Internal Mobile Access</Text>
              </View>
            </View>

            {/* Main Form Card */}
            <View style={styles.loginCard}>
              <Text style={styles.cardHeading}>Staff Sign In</Text>
              <Text style={styles.cardSubHeading}>
                Sign in with official credentials or Google SSO.
              </Text>

              {/* Demo Account Pills */}
              <View style={styles.demoPresetsBox}>
                <Text style={styles.demoPresetsTitle}>DEMO ACCOUNT QUICK FILL</Text>
                <View style={styles.presetRow}>
                  {DEMO_PRESETS.map((p) => (
                    <TouchableOpacity
                      key={p.email}
                      style={styles.presetPill}
                      onPress={() => handleApplyPreset(p.email)}
                    >
                      <Text style={styles.presetPillText}>{p.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Form Inputs */}
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
                style={styles.forgotPassLink}
                onPress={() => setShowForgotPassword(true)}
              >
                <Text style={styles.forgotPassText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                onPress={onSubmit}
                isLoading={isSubmitting}
                isDisabled={isSubmitting || isGoogleSubmitting}
                variant="primary"
                size="md"
                leftIcon={<LucideIcon name="log-in" size={18} color="#FFFFFF" />}
              >
                Sign In
              </Button>

              <View style={styles.orRow}>
                <View style={styles.divider} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.divider} />
              </View>

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

            <Text style={styles.copyrightText}>
              © {new Date().getFullYear()} National Telecommunications Commission
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nativeSafeArea: {
    flex: 1,
    backgroundColor: "#0B132B",
  },
  keyboardAvoid: {
    flex: 1,
  },
  toastWrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 999,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxWidth: 440,
    width: "100%",
    alignSelf: "center",
  },
  logoHeader: {
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#93C5FD",
  },
  loginCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
    marginBottom: 4,
  },
  cardSubHeading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#64748B",
    marginBottom: 16,
  },
  demoPresetsBox: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  demoPresetsTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#475569",
    marginBottom: 6,
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
  },
  presetPill: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  presetPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#1E3A8A",
  },
  forgotPassLink: {
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  forgotPassText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#2563EB",
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  orText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#94A3B8",
  },
  copyrightText: {
    marginTop: 32,
    textAlign: "center",
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
  },
});
