import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  SHADOWS,
  TYPOGRAPHY,
  Button,
  AlertToast,
  Icon as LucideIcon,
} from "@edge/ui";
import { NtcLogo } from "./NtcLogo";
import { useForgotPasswordForm } from "../hooks/useForgotPasswordForm";
import { ForgotPasswordRequestForm } from "../forms/ForgotPasswordRequestForm";
import { ForgotPasswordResetForm } from "../forms/ForgotPasswordResetForm";

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordScreen({ onBackToLogin }: ForgotPasswordScreenProps) {
  const {
    step,
    requestForm,
    resetForm,
    requestedEmail,
    isSubmitting,
    toastMessage,
    dismissToast,
    onRequestSubmit,
    onResetSubmit,
  } = useForgotPasswordForm();

  return (
    <View style={styles.outerShell}>
      {toastMessage !== null ? (
        <View style={styles.toastContainer}>
          <AlertToast message={toastMessage} onDismiss={dismissToast} variant="error" />
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardContainer}>
          <TouchableOpacity onPress={onBackToLogin} style={styles.backButton} activeOpacity={0.7}>
            <LucideIcon name="arrow-left" size={18} color="#94A3B8" />
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </TouchableOpacity>

          <View style={styles.logoWrapper}>
            <NtcLogo size="medium" variant="light" showSubtext={false} />
          </View>

          <View style={[styles.card, SHADOWS.modal]}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <LucideIcon name="key" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.cardTitle}>
                {step === "request"
                  ? "Reset Your Password"
                  : step === "reset"
                  ? "Enter Verification Code"
                  : "Password Reset Complete"}
              </Text>
              <Text style={styles.cardSubtitle}>
                {step === "request"
                  ? "Enter your official staff email address to receive a password reset verification code."
                  : step === "reset"
                  ? `Enter the 6-digit code sent to ${requestedEmail} along with your new password.`
                  : "Your password has been successfully updated. You can now sign in with your new credentials."}
              </Text>
            </View>

            {step === "request" && (
              <ForgotPasswordRequestForm
                form={requestForm}
                onSubmit={onRequestSubmit}
                isSubmitting={isSubmitting}
              />
            )}

            {step === "reset" && (
              <ForgotPasswordResetForm
                form={resetForm}
                onSubmit={onResetSubmit}
                isSubmitting={isSubmitting}
              />
            )}

            {step === "success" && (
              <View style={styles.formBody}>
                <View style={styles.successBadge}>
                  <LucideIcon name="check-circle" size={48} color="#10B981" />
                </View>
                <Button onPress={onBackToLogin} variant="primary" size="md">
                  Return to Sign In
                </Button>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerShell: {
    flex: 1,
    backgroundColor: "#0B132B",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  toastContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    maxWidth: 480,
    alignSelf: "center",
    zIndex: 999,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  backButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  logoWrapper: {
    marginBottom: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  formBody: {
    gap: 16,
  },
  successBadge: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
});
