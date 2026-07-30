import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import {
  SHADOWS,
  TYPOGRAPHY,
  Button,
  AlertToast,
  Icon as LucideIcon,
  useTheme,
  AnimatedCard,
} from "@edge/ui";
import { NtcLogo } from "./NtcLogo";
import { useForgotPasswordForm } from "../hooks/useForgotPasswordForm";
import { ForgotPasswordRequestForm } from "../forms/ForgotPasswordRequestForm";
import { ForgotPasswordResetForm } from "../forms/ForgotPasswordResetForm";

export interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordScreen({ onBackToLogin }: ForgotPasswordScreenProps): React.ReactElement {
  const { colors, isDark } = useTheme();
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
    <SafeAreaView style={[styles.nativeSafeArea, { backgroundColor: colors.bg }]}>
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
            <LucideIcon name="arrow-left" size={18} color={colors.textMuted} />
            <Text style={[styles.backButtonText, { color: colors.textMuted }]}>Back to Sign In</Text>
          </TouchableOpacity>

          <View style={styles.logoWrapper}>
            <NtcLogo size="medium" variant={isDark ? "light" : "dark"} showSubtext={false} />
          </View>

          <AnimatedCard
            delay={0}
            padding={24}
            style={{
              ...styles.card,
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
            }}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light },
                ]}
              >
                <LucideIcon
                  name="key"
                  size={24}
                  color={isDark ? colors.brand.primary : colors.brand.secondary}
                />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {step === "request"
                  ? "Reset Your Password"
                  : step === "reset"
                  ? "Enter Verification Code"
                  : "Password Reset Complete"}
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
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
                  <LucideIcon name="check-circle" size={48} color={colors.semantic.success} />
                </View>
                <Button onPress={onBackToLogin} variant="primary" size="md">
                  Return to Sign In
                </Button>
              </View>
            )}
          </AnimatedCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nativeSafeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  toastContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    maxWidth: 440,
    alignSelf: "center",
    zIndex: 999,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
    alignSelf: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  backButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  logoWrapper: {
    marginBottom: 20,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
  },
  cardHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: "center",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
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
