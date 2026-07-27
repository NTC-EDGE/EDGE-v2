import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  useWindowDimensions,
  TextInput,
  TextStyle,
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

  // Form State: 'request' | 'reset'
  const [step, setStep] = useState<"request" | "reset">("request");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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

  // Step 1: Request Password Reset Code
  const handleRequestCode = async () => {
    if (email.trim().length === 0) {
      triggerToastError("Email address is required to reset password.");
      return;
    }

    setError("");
    setToastMessage(null);
    setIsSubmitting(true);

    if (signIn === null || signIn === undefined) {
      triggerToastError("Authentication service is not loaded yet. Please try again.");
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

      setSuccessMessage(`Verification code sent to ${email.trim()}.`);
      setStep("reset");
    } catch (err: unknown) {
      triggerToastError(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Submit OTP Code & Set New Password
  const handleResetPassword = async () => {
    if (code.trim().length === 0) {
      triggerToastError("6-digit verification code is required.");
      return;
    }
    if (newPassword.length < 8) {
      triggerToastError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToastError("Passwords do not match. Please re-enter password.");
      return;
    }

    setError("");
    setToastMessage(null);
    setIsSubmitting(true);

    if (signIn === null || signIn === undefined) {
      triggerToastError("Authentication service is not loaded yet. Please try again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const signInObj = signIn as unknown as {
        attemptFirstFactor: (opts: { strategy: string; code: string; password: string }) => Promise<{ status: string }>;
        finalize: () => Promise<unknown>;
      };

      if (typeof signInObj.attemptFirstFactor === "function") {
        const result = await signInObj.attemptFirstFactor({
          strategy: "reset_password_email_code",
          code: code.trim(),
          password: newPassword,
        });

        if (result.status === "complete") {
          await signIn.finalize();
          setSuccessMessage("Password reset successful! Redirecting to staff portal...");
          setTimeout(() => {
            onBackToLogin();
          }, 1500);
        } else {
          triggerToastError(`Password reset incomplete: status is ${result.status}`);
        }
      } else {
        await signIn.finalize();
        setSuccessMessage("Password reset submitted!");
      }
    } catch (err: unknown) {
      triggerToastError(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoid}
    >
      {/* Floating Error Toast Notification */}
      {toastMessage !== null && toastMessage.trim().length > 0 ? (
        <View style={[styles.toastContainer, SHADOWS.modal]}>
          <Lucide name="alert-triangle" size={20} color="#DC2626" />
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
        <View style={styles.backgroundBlobLeft} pointerEvents="none" />
        <View style={styles.backgroundBlobRight} pointerEvents="none" />

        <View style={styles.heroSection}>
          <View style={[styles.heroContentWrapper, isMobile && styles.heroContentWrapperMobile]}>
            <View style={styles.heroRightCol}>
              <View style={styles.loginCardLogoWrapper}>
                <NtcLogo size={isMobile ? "medium" : "large"} variant="light" showSubtext={false} />
              </View>

              <View style={[styles.mockupWindowCard, SHADOWS.modal]}>
                <View style={styles.mockupWindowHeader}>
                  <TouchableOpacity onPress={onBackToLogin} style={styles.backRowLink}>
                    <Lucide name="arrow-left" size={16} color={COLORS.neutral[600]} />
                    <Text style={styles.backRowText}>Back to Sign In</Text>
                  </TouchableOpacity>
                  <Text style={styles.windowHeaderText}>Reset Password</Text>
                </View>

                <View style={[styles.mockupWindowBody, isMobile && { padding: 20 }]}>
                  <Text style={styles.cardTitle}>
                    {step === "request" ? "Forgot Password" : "Set New Password"}
                  </Text>
                  <Text style={styles.cardSubtitle}>
                    {step === "request"
                      ? "Enter your registered email address to receive a 6-digit verification code."
                      : "Enter the 6-digit code sent to your email along with your new password."}
                  </Text>

                  {successMessage !== null ? (
                    <View style={styles.successBanner}>
                      <Lucide name="check-circle" size={18} color="#166534" />
                      <Text style={styles.successText}>{successMessage}</Text>
                    </View>
                  ) : null}

                  {step === "request" ? (
                    <View style={styles.formGroup}>
                      <Text style={styles.fieldLabelSmall}>Staff Email Address</Text>
                      <View style={styles.inputWithIconWrapper}>
                        <Lucide name="mail" size={18} color={COLORS.neutral[400]} style={styles.inputIconLeft} />
                        <TextInput
                          style={styles.textInputStyle}
                          placeholder="staff@ntc.gov.ph"
                          placeholderTextColor={COLORS.neutral[400]}
                          value={email}
                          onChangeText={setEmail}
                          autoCapitalize="none"
                          keyboardType="email-address"
                        />
                      </View>

                      <TouchableOpacity
                        style={[styles.actionButton, isSubmitting && styles.buttonDisabled]}
                        onPress={handleRequestCode}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator size="small" color={COLORS.neutral.white} />
                        ) : (
                          <View style={styles.buttonInner}>
                            <Lucide name="send" size={18} color={COLORS.neutral.white} />
                            <Text style={styles.buttonText}>Send Reset Code</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.formGroup}>
                      <Text style={styles.fieldLabelSmall}>6-Digit Verification Code</Text>
                      <View style={styles.inputWithIconWrapper}>
                        <Lucide name="key" size={18} color={COLORS.neutral[400]} style={styles.inputIconLeft} />
                        <TextInput
                          style={styles.textInputStyle}
                          placeholder="123456"
                          placeholderTextColor={COLORS.neutral[400]}
                          value={code}
                          onChangeText={setCode}
                          keyboardType="numeric"
                          maxLength={6}
                        />
                      </View>

                      <Text style={styles.fieldLabelSmall}>New Password</Text>
                      <View style={styles.inputWithIconWrapper}>
                        <Lucide name="lock" size={18} color={COLORS.neutral[400]} style={styles.inputIconLeft} />
                        <TextInput
                          style={styles.textInputStyle}
                          placeholder="Min. 8 characters"
                          placeholderTextColor={COLORS.neutral[400]}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          secureTextEntry={true}
                          autoCapitalize="none"
                        />
                      </View>

                      <Text style={styles.fieldLabelSmall}>Confirm New Password</Text>
                      <View style={styles.inputWithIconWrapper}>
                        <Lucide name="lock" size={18} color={COLORS.neutral[400]} style={styles.inputIconLeft} />
                        <TextInput
                          style={styles.textInputStyle}
                          placeholder="Re-type new password"
                          placeholderTextColor={COLORS.neutral[400]}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          secureTextEntry={true}
                          autoCapitalize="none"
                        />
                      </View>

                      <TouchableOpacity
                        style={[styles.actionButton, isSubmitting && styles.buttonDisabled]}
                        onPress={handleResetPassword}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator size="small" color={COLORS.neutral.white} />
                        ) : (
                          <View style={styles.buttonInner}>
                            <Lucide name="check-circle" size={18} color={COLORS.neutral.white} />
                            <Text style={styles.buttonText}>Reset Password</Text>
                          </View>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.resendLinkBtn}
                        onPress={handleRequestCode}
                        disabled={isSubmitting}
                      >
                        <Text style={styles.resendLinkText}>Resend Code</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  toastContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    maxWidth: 600,
    alignSelf: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 9999,
    elevation: 9999,
  },
  toastText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: "#991B1B",
    lineHeight: 18,
  },
  toastCloseBtn: {
    padding: 4,
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF9F6",
    position: "relative",
  },
  backgroundBlobLeft: {
    position: "absolute",
    top: -80,
    left: -120,
    width: 480,
    height: 480,
    borderRadius: 240,
    backgroundColor: "rgba(219, 234, 254, 0.55)",
  },
  backgroundBlobRight: {
    position: "absolute",
    bottom: 40,
    right: -100,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: "rgba(254, 226, 226, 0.45)",
  },
  heroSection: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    paddingVertical: 32,
    zIndex: 1,
  },
  heroContentWrapper: {
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 16,
  },
  heroContentWrapperMobile: {
    paddingHorizontal: 16,
  },
  heroRightCol: {
    width: "100%",
  },
  loginCardLogoWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  mockupWindowCard: {
    width: "100%",
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  mockupWindowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#FAFAFC",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  backRowLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backRowText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  windowHeaderText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  mockupWindowBody: {
    padding: 28,
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
    marginBottom: 6,
    textAlign: "center",
  },
  cardSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
    marginBottom: SPACING[20],
    textAlign: "center",
    lineHeight: 18,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#86EFAC",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#166534",
    flex: 1,
  },
  formGroup: {
    gap: 12,
  },
  fieldLabelSmall: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[600],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  inputWithIconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIconLeft: {
    marginRight: 8,
  },
  textInputStyle: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[900],
    height: "100%",
    paddingVertical: 0,
    ...(Platform.OS === "web" ? ({ outlineWidth: 0, outlineColor: "transparent" } as unknown as TextStyle) : {}),
  },
  actionButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: "#0E1B61",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
  resendLinkBtn: {
    alignSelf: "center",
    paddingVertical: 8,
    marginTop: 4,
  },
  resendLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.brand[800],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
