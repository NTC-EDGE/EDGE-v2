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
import { useNavigation } from "@react-navigation/native";
import { useAuthContext } from "../../auth/context/AuthContext";
import { parseApiError } from "@edge/api";
import { NtcLogo } from "./NtcLogo";

export function SignupScreen() {
  const navigation = useNavigation<any>();
  const { signUpWithClerk, verifySignUp } = useAuthContext();

  const [step, setStep] = useState<"form" | "verify">("form");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const [focusedField, setFocusedField] = useState<
    "fullName" | "email" | "departmentCode" | "password" | "verificationCode" | null
  >(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerToastError = (msg: string) => {
    const trimmed = parseApiError(msg);
    setToastMessage(trimmed);
  };

  const dismissToast = () => {
    setToastMessage(null);
  };

  const handleRequestAccess = async () => {
    if (fullName.trim().length === 0) {
      triggerToastError("Full name is required.");
      return;
    }
    if (email.trim().length === 0) {
      triggerToastError("Email address is required.");
      return;
    }
    if (password.length < 8) {
      triggerToastError("Password must be at least 8 characters.");
      return;
    }

    setToastMessage(null);
    setIsSubmitting(true);

    try {
      const isComplete = await signUpWithClerk(email.trim(), password);
      if (isComplete) {
        navigation.navigate("InternalLogin");
      } else {
        setStep("verify");
      }
    } catch (err: unknown) {
      triggerToastError(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySignUp = async () => {
    if (verificationCode.trim().length === 0) {
      triggerToastError("Verification code is required.");
      return;
    }

    setToastMessage(null);
    setIsSubmitting(true);

    try {
      await verifySignUp(verificationCode.trim());
      navigation.navigate("InternalLogin");
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
          <TouchableOpacity
            onPress={() => navigation.navigate("InternalLogin")}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Lucide name="arrow-left" size={18} color="#94A3B8" />
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </TouchableOpacity>

          <View style={styles.logoWrapper}>
            <NtcLogo size="medium" variant="light" showSubtext={false} />
          </View>

          <View style={[styles.card, SHADOWS.modal]}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Lucide name="user-plus" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.cardTitle}>
                {step === "form" ? "Staff Access Request" : "Verify Your Email"}
              </Text>
              <Text style={styles.cardSubtitle}>
                {step === "form"
                  ? "Register for an official NTC internal staff account."
                  : `Enter the 6-digit verification code sent to ${email.trim()}.`}
              </Text>
            </View>

            {step === "form" ? (
              <View style={styles.formBody}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Full Name</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === "fullName" && styles.inputWrapperFocused,
                    ]}
                  >
                    <Lucide
                      name="user"
                      size={18}
                      color={focusedField === "fullName" ? "#1E3A8A" : COLORS.neutral[400]}
                      style={styles.inputIconLeft}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Juan Dela Cruz"
                      placeholderTextColor={COLORS.neutral[400]}
                      value={fullName}
                      onChangeText={setFullName}
                      onFocus={() => setFocusedField("fullName")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Official Email Address</Text>
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
                      placeholder="juan.delacruz@ntc.gov.ph"
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

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Department / Office Code (Optional)</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === "departmentCode" && styles.inputWrapperFocused,
                    ]}
                  >
                    <Lucide
                      name="layers"
                      size={18}
                      color={focusedField === "departmentCode" ? "#1E3A8A" : COLORS.neutral[400]}
                      style={styles.inputIconLeft}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. EVAL-NCR"
                      placeholderTextColor={COLORS.neutral[400]}
                      value={departmentCode}
                      onChangeText={setDepartmentCode}
                      onFocus={() => setFocusedField("departmentCode")}
                      onBlur={() => setFocusedField(null)}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === "password" && styles.inputWrapperFocused,
                    ]}
                  >
                    <Lucide
                      name="lock"
                      size={18}
                      color={focusedField === "password" ? "#1E3A8A" : COLORS.neutral[400]}
                      style={styles.inputIconLeft}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="At least 8 characters"
                      placeholderTextColor={COLORS.neutral[400]}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocusedField("password")}
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

                <TouchableOpacity
                  style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
                  onPress={handleRequestAccess}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Register Staff Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formBody}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Verification Code</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === "verificationCode" && styles.inputWrapperFocused,
                    ]}
                  >
                    <Lucide
                      name="shield"
                      size={18}
                      color={focusedField === "verificationCode" ? "#1E3A8A" : COLORS.neutral[400]}
                      style={styles.inputIconLeft}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="123456"
                      placeholderTextColor={COLORS.neutral[400]}
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      onFocus={() => setFocusedField("verificationCode")}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
                  onPress={handleVerifySignUp}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Confirm & Sign In</Text>
                  )}
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
});
