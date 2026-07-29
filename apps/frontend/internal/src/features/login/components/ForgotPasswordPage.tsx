import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  useWindowDimensions,
  TextInput,
} from "react-native";
import {
  COLORS,
  SPACING,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
} from "@edge/ui";
import { useSignIn } from "@clerk/expo";
import { parseApiError } from "@edge/api";
import { NtcLogo } from "./NtcLogo";

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordPage({ onBackToLogin }: ForgotPasswordPageProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const { signIn } = useSignIn();

  // Step state: 'request' | 'reset' | 'success'
  const [step, setStep] = useState<"request" | "reset" | "success">("request");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [focusedField, setFocusedField] = useState<"email" | "code" | "newPassword" | "confirmPassword" | null>(null);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerToastError = (msg: string) => {
    const trimmed = parseApiError(msg);
    setError(trimmed);
    setToastMessage(trimmed);
  };

  const dismissToast = () => {
    setToastMessage(null);
    setError("");
  };

  // Step 1: Request Reset Code via Email
  const handleRequestCode = async () => {
    if (email.trim().length === 0) {
      triggerToastError("Email address is required.");
      return;
    }

    setError("");
    setToastMessage(null);
    setIsSubmitting(true);

    if (signIn === null || signIn === undefined) {
      triggerToastError("Authentication service is not loaded yet.");
      setIsSubmitting(false);
      return;
    }

    try {
      const signInObj = signIn as unknown as {
        create: (opts: { strategy: string; identifier: string }) => Promise<unknown>;
      };

      if (typeof signInObj.create === "function") {
        await signInObj.create({
          strategy: "reset_password_email_code",
          identifier: email.trim(),
        });
      }

      setStep("reset");
    } catch (err: unknown) {
      triggerToastError(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP Code & Set New Password
  const handleResetPassword = async () => {
    if (code.trim().length === 0) {
      triggerToastError("Verification code is required.");
      return;
    }
    if (newPassword.length < 8) {
      triggerToastError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToastError("Passwords do not match.");
      return;
    }

    setError("");
    setToastMessage(null);
    setIsSubmitting(true);

    if (signIn === null || signIn === undefined) {
      triggerToastError("Authentication service is not loaded yet.");
      setIsSubmitting(false);
      return;
    }

    try {
      const signInObj = signIn as unknown as {
        resetPassword: (opts: { code: string; password: string }) => Promise<unknown>;
      };

      if (typeof signInObj.resetPassword === "function") {
        await signInObj.resetPassword({
          code: code.trim(),
          password: newPassword,
        });
      }

      setStep("success");
    } catch (err: unknown) {
      triggerToastError(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.outerShell}>
      {toastMessage !== null ? (
        <View style={styles.toastContainer}>
          <Lucide name="alert-circle" size={20} color="#EF4444" />
          <Text style={styles.toastText}>{toastMessage}</Text>
          <TouchableOpacity onPress={dismissToast} style={styles.toastCloseBtn}>
            <Lucide name="x" size={16} color={COLORS.neutral[500]} />
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardContainer}>
          <TouchableOpacity onPress={onBackToLogin} style={styles.backButton} activeOpacity={0.7}>
            <Lucide name="arrow-left" size={18} color="#94A3B8" />
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </TouchableOpacity>

          <View style={styles.logoWrapper}>
            <NtcLogo size="medium" variant="light" showSubtext={false} />
          </View>

          <View style={[styles.card, SHADOWS.modal]}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Lucide name="key" size={24} color="#3B82F6" />
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
                  ? `Enter the 6-digit code sent to ${email.trim()} along with your new password.`
                  : "Your password has been successfully updated. You can now sign in with your new credentials."}
              </Text>
            </View>

            {step === "request" && (
              <View style={styles.formBody}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Staff Email Address</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === "email" && styles.inputWrapperFocused,
                    ]}
                  >
                    <Lucide
                      name="mail"
                      size={18}
                      color={focusedField === "email" ? "#1E3A8A" : COLORS.neutral[400]}
                      style={styles.inputIconLeft}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="staff@ntc.gov.ph"
                      placeholderTextColor={COLORS.neutral[400]}
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
                  onPress={handleRequestCode}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Send Reset Code</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {step === "reset" && (
              <View style={styles.formBody}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>6-Digit Verification Code</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === "code" && styles.inputWrapperFocused,
                    ]}
                  >
                    <Lucide
                      name="shield"
                      size={18}
                      color={focusedField === "code" ? "#1E3A8A" : COLORS.neutral[400]}
                      style={styles.inputIconLeft}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="123456"
                      placeholderTextColor={COLORS.neutral[400]}
                      value={code}
                      onChangeText={setCode}
                      onFocus={() => setFocusedField("code")}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>New Password</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === "newPassword" && styles.inputWrapperFocused,
                    ]}
                  >
                    <Lucide
                      name="lock"
                      size={18}
                      color={focusedField === "newPassword" ? "#1E3A8A" : COLORS.neutral[400]}
                      style={styles.inputIconLeft}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="At least 8 characters"
                      placeholderTextColor={COLORS.neutral[400]}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      onFocus={() => setFocusedField("newPassword")}
                      onBlur={() => setFocusedField(null)}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeToggleBtn}
                    >
                      <Lucide
                        name={showPassword ? "eye-off" : "eye"}
                        size={18}
                        color={COLORS.neutral[400]}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Confirm New Password</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === "confirmPassword" && styles.inputWrapperFocused,
                    ]}
                  >
                    <Lucide
                      name="lock"
                      size={18}
                      color={focusedField === "confirmPassword" ? "#1E3A8A" : COLORS.neutral[400]}
                      style={styles.inputIconLeft}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Re-enter password"
                      placeholderTextColor={COLORS.neutral[400]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      onFocus={() => setFocusedField("confirmPassword")}
                      onBlur={() => setFocusedField(null)}
                      secureTextEntry={!showPassword}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Update Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {step === "success" && (
              <View style={styles.formBody}>
                <View style={styles.successBadge}>
                  <Lucide name="check-circle" size={48} color="#10B981" />
                </View>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={onBackToLogin}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryButtonText}>Return to Sign In</Text>
                </TouchableOpacity>
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
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 999,
  },
  toastText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#991B1B",
  },
  toastCloseBtn: {
    padding: 4,
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
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#334155",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: "#1E3A8A",
    backgroundColor: "#FFFFFF",
  },
  inputIconLeft: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: "#0F172A",
    height: "100%",
    ...Platform.select({ web: { outlineWidth: 0 } }),
  },
  eyeToggleBtn: {
    padding: 6,
  },
  primaryButton: {
    backgroundColor: "#1E3A8A",
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#FFFFFF",
  },
  successBadge: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
});
