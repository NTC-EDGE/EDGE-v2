import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  useWindowDimensions,
  Pressable,
} from "react-native";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
} from "@edge/ui";
import { useAuthContext } from "../../auth/context/AuthContext";
import { NtcLogo } from "./NtcLogo";

interface ClerkErrorItem {
  message: string;
}

interface ClerkErrorResponse {
  errors: ClerkErrorItem[];
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

function isClerkError(err: unknown): err is ClerkErrorResponse {
  if (!isObject(err)) {
    return false;
  }
  const errors = err.errors;
  if (!Array.isArray(errors)) {
    return false;
  }
  return errors.every((item): boolean => {
    if (!isObject(item)) {
      return false;
    }
    return typeof item.message === "string";
  });
}

const REGION_OPTIONS: readonly string[] = [
  "Region X - Northern Mindanao",
  "Central Office - NCR",
  "Region I - Ilocos Region",
  "Region II - Cagayan Valley",
  "Region III - Central Luzon",
  "Region IV-A - CALABARZON",
  "Region IV-B - MIMAROPA",
  "Region V - Bicol Region",
  "Region VI - Western Visayas",
  "Region VII - Central Visayas",
  "Region VIII - Eastern Visayas",
  "Region IX - Zamboanga Peninsula",
  "Region XI - Davao Region",
  "Region XII - SOCCSKSARGEN",
  "Region XIII - Caraga",
  "BARMM - Bangsamoro Region",
  "CAR - Cordillera Administrative Region",
] as const;

export function InternalLandingPage() {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  const { loginWithClerk, signUpWithClerk, verifySignUp } = useAuthContext();

  const [mode, setMode] = useState<"signin" | "signup" | "verify" | "forgot">("signin");
  const [selectedRegion, setSelectedRegion] = useState("Region X - Northern Mindanao");
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuthError = (err: unknown, defaultMsg: string) => {
    if (err instanceof Error) {
      setError(err.message);
    } else if (isClerkError(err)) {
      if (err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError(defaultMsg);
      }
    } else {
      setError(defaultMsg);
    }
  };

  const handleSignIn = async () => {
    if (identifier.trim() === "" || password.trim() === "") {
      setError("Please enter your phone number/email address and password.");
      return;
    }
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);
    try {
      await loginWithClerk(identifier, password);
    } catch (err: unknown) {
      handleAuthError(err, "Invalid credentials or region authorization.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    if (identifier.trim() === "" || password.trim() === "") {
      setError("Please enter your email address and password.");
      return;
    }
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);
    try {
      const isComplete = await signUpWithClerk(identifier, password);
      if (isComplete) {
        // Session created
      } else {
        setMode("verify");
      }
    } catch (err: unknown) {
      handleAuthError(err, "Failed to create account. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (code.trim() === "") {
      setError("Please enter the verification code.");
      return;
    }
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);
    try {
      await verifySignUp(code);
    } catch (err: unknown) {
      handleAuthError(err, "Incorrect verification code. Please check and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    if (identifier.trim() === "") {
      setError("Please enter your phone no. or email address above first.");
      return;
    }
    setError("");
    setSuccessMessage(`Password reset link sent to ${identifier}.`);
  };

  const switchMode = (newMode: "signin" | "signup" | "verify" | "forgot") => {
    setMode(newMode);
    setError("");
    setSuccessMessage("");
    setCode("");
  };

  const isFormFilled = identifier.trim().length > 0 && password.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoid}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content Area with Centered Setup */}
        <View style={styles.mainBody}>
          {/* Top Logo Section */}
          <View style={styles.logoHeaderWrapper}>
            <NtcLogo size="large" showSubtext={true} />
          </View>

          {/* Centered Login Card */}
          <View style={[styles.loginCardContainer, SHADOWS.modal]}>
            <Text style={styles.cardTitle}>
              {mode === "signin"
                ? "Login"
                : mode === "signup"
                ? "Staff Registration"
                : mode === "verify"
                ? "Verify Account"
                : "Reset Password"}
            </Text>

            {mode === "signin" && (
              <>
                {/* Region Selector */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabelSmall}>Region</Text>
                  <TouchableOpacity
                    style={styles.regionSelectorBox}
                    onPress={() => setShowRegionDropdown((prev) => !prev)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.regionSelectorValue} numberOfLines={1}>
                      {selectedRegion}
                    </Text>
                    <Lucide
                      name={showRegionDropdown ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={COLORS.neutral[600]}
                    />
                  </TouchableOpacity>

                  {/* Dropdown Options */}
                  {showRegionDropdown && (
                    <View style={styles.dropdownMenu}>
                      <ScrollView nestedScrollEnabled style={{ maxHeight: 190 }}>
                        {REGION_OPTIONS.map((region) => (
                          <TouchableOpacity
                            key={region}
                            style={[
                              styles.dropdownMenuItem,
                              region === selectedRegion && styles.dropdownMenuItemActive,
                            ]}
                            onPress={() => {
                              setSelectedRegion(region);
                              setShowRegionDropdown(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownMenuItemText,
                                region === selectedRegion && styles.dropdownMenuItemTextActive,
                              ]}
                            >
                              {region}
                            </Text>
                            {region === selectedRegion && (
                              <Lucide name="check" size={14} color={COLORS.brand[700]} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Phone / Email Input */}
                <View style={styles.fieldGroup}>
                  <TextInput
                    autoCapitalize="none"
                    placeholder="Phone no./Email address *"
                    placeholderTextColor={COLORS.neutral[400]}
                    value={identifier}
                    onChangeText={setIdentifier}
                    style={styles.greyInput}
                    editable={!isSubmitting}
                  />
                </View>

                {/* Password Input with Eye Toggle */}
                <View style={styles.fieldGroup}>
                  <View style={styles.inputWithIconWrapper}>
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor={COLORS.neutral[400]}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      style={[styles.greyInput, { paddingRight: 42 }]}
                      editable={!isSubmitting}
                    />
                    <TouchableOpacity
                      style={styles.eyeIconButton}
                      onPress={() => setShowPassword((prev) => !prev)}
                    >
                      <Lucide
                        name={showPassword ? "eye-off" : "eye"}
                        size={18}
                        color={COLORS.neutral[500]}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {error.length > 0 ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}

                {successMessage.length > 0 ? (
                  <Text style={styles.successText}>{successMessage}</Text>
                ) : null}

                {/* Submit Login Button */}
                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    isFormFilled ? styles.loginButtonActive : styles.loginButtonDefault,
                    isSubmitting && styles.buttonDisabled,
                  ]}
                  onPress={handleSignIn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={COLORS.neutral.white} />
                  ) : (
                    <View style={styles.loginButtonInner}>
                      <Lucide
                        name="log-in"
                        size={18}
                        color={isFormFilled ? COLORS.neutral.white : "#475569"}
                      />
                      <Text
                        style={[
                          styles.loginButtonText,
                          isFormFilled ? styles.loginButtonTextActive : styles.loginButtonTextDefault,
                        ]}
                      >
                        Login
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Forgot Password Link */}
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  style={styles.forgotPasswordLinkWrapper}
                  disabled={isSubmitting}
                >
                  <Text style={styles.forgotPasswordLinkText}>Forgot your password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => switchMode("signup")}
                  style={styles.registerToggleWrapper}
                >
                  <Text style={styles.registerToggleText}>
                    Don't have an account? <Text style={styles.registerToggleBold}>Register</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {mode === "signup" && (
              <>
                <View style={styles.fieldGroup}>
                  <TextInput
                    autoCapitalize="none"
                    placeholder="Official Email Address *"
                    placeholderTextColor={COLORS.neutral[400]}
                    value={identifier}
                    onChangeText={setIdentifier}
                    style={styles.greyInput}
                    editable={!isSubmitting}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <View style={styles.inputWithIconWrapper}>
                    <TextInput
                      placeholder="Password *"
                      placeholderTextColor={COLORS.neutral[400]}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      style={[styles.greyInput, { paddingRight: 42 }]}
                      editable={!isSubmitting}
                    />
                    <TouchableOpacity
                      style={styles.eyeIconButton}
                      onPress={() => setShowPassword((prev) => !prev)}
                    >
                      <Lucide
                        name={showPassword ? "eye-off" : "eye"}
                        size={18}
                        color={COLORS.neutral[500]}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {error.length > 0 ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.loginButton, styles.loginButtonActive, isSubmitting && styles.buttonDisabled]}
                  onPress={handleSignUp}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={COLORS.neutral.white} />
                  ) : (
                    <Text style={[styles.loginButtonText, styles.loginButtonTextActive]}>Register</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => switchMode("signin")}
                  style={styles.forgotPasswordLinkWrapper}
                >
                  <Text style={styles.forgotPasswordLinkText}>Already have an account? Login</Text>
                </TouchableOpacity>
              </>
            )}

            {mode === "verify" && (
              <>
                <Text style={styles.verifyDescriptionText}>
                  Enter the verification code sent to {identifier}.
                </Text>

                <View style={styles.fieldGroup}>
                  <TextInput
                    autoCapitalize="none"
                    placeholder="Verification Code *"
                    placeholderTextColor={COLORS.neutral[400]}
                    value={code}
                    onChangeText={setCode}
                    style={styles.greyInput}
                    editable={!isSubmitting}
                  />
                </View>

                {error.length > 0 ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.loginButton, styles.loginButtonActive, isSubmitting && styles.buttonDisabled]}
                  onPress={handleVerify}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={COLORS.neutral.white} />
                  ) : (
                    <Text style={[styles.loginButtonText, styles.loginButtonTextActive]}>Verify & Login</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => switchMode("signin")}
                  style={styles.forgotPasswordLinkWrapper}
                >
                  <Text style={styles.forgotPasswordLinkText}>Back to Login</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Dark Navy Footer (Screenshot 2 Reference) */}
        <View style={styles.footerBar}>
          <View style={[styles.footerContentContainer, { maxWidth: 1280 }]}>
            <View style={styles.footerLeftBrand}>
              <NtcLogo size="small" variant="dark" showSubtext={false} />
              <Text style={styles.footerCopyrightText}>© 2026</Text>
            </View>

            <View style={[styles.footerRightLinks, isMobile && styles.footerRightLinksMobile]}>
              <Pressable style={styles.footerLinkPressable}>
                <Text style={styles.footerLinkText}>User Agreement</Text>
              </Pressable>
              <Pressable style={styles.footerLinkPressable}>
                <Text style={styles.footerLinkText}>Privacy Policy</Text>
              </Pressable>
              <Pressable style={styles.footerLinkPressable}>
                <Text style={styles.footerLinkText}>Community Guidelines</Text>
              </Pressable>
              <Pressable style={styles.footerLinkPressable}>
                <Text style={styles.footerLinkText}>Cookie Policy</Text>
              </Pressable>
              <Pressable style={styles.footerLinkPressable}>
                <Text style={styles.footerLinkText}>Send Feedback</Text>
              </Pressable>
              <Pressable style={styles.footerLinkPressable}>
                <Text style={styles.footerLinkText}>Help Center</Text>
              </Pressable>
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
    backgroundColor: "#EBEFF4",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    backgroundColor: "#EBEFF4",
    ...Platform.select({
      web: {
        backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, #ebeff4 1px)`,
        backgroundSize: '40px 40px',
        backgroundPosition: '0 0, 20px 20px',
      },
    }),
  },
  mainBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING[20],
    paddingTop: SPACING[40],
    paddingBottom: SPACING[40],
    width: "100%",
  },
  logoHeaderWrapper: {
    alignItems: "center",
    marginBottom: 36,
  },
  loginCardContainer: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.8)",
    padding: SPACING[40],
    alignSelf: "center",
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
    marginBottom: SPACING[24],
  },
  fieldGroup: {
    marginBottom: 16,
    position: "relative",
  },
  fieldLabelSmall: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[500],
    marginBottom: 4,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  regionSelectorBox: {
    height: 48,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  regionSelectorValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[900],
    fontWeight: TYPOGRAPHY.weights.medium,
    flex: 1,
  },
  dropdownMenu: {
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: 10,
    marginTop: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 99,
  },
  dropdownMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  dropdownMenuItemActive: {
    backgroundColor: "rgba(37, 99, 235, 0.08)",
  },
  dropdownMenuItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[700],
  },
  dropdownMenuItemTextActive: {
    color: COLORS.brand[800],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  inputWithIconWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  greyInput: {
    height: 48,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.neutral[900],
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  eyeIconButton: {
    position: "absolute",
    right: 14,
    padding: 6,
  },
  loginButton: {
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    ...Platform.select({
      web: {
        transition: "all 200ms ease-out",
        cursor: "pointer",
      },
    }),
  },
  loginButtonDefault: {
    backgroundColor: "#CBD5E1", // Grey matching reference
  },
  loginButtonActive: {
    backgroundColor: COLORS.brand[800], // Branded navy/blue when active
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loginButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  loginButtonTextDefault: {
    color: "#475569",
  },
  loginButtonTextActive: {
    color: COLORS.neutral.white,
  },
  forgotPasswordLinkWrapper: {
    alignSelf: "center",
    marginTop: 20,
    padding: 4,
  },
  forgotPasswordLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#2563EB",
  },
  registerToggleWrapper: {
    alignSelf: "center",
    marginTop: 12,
    padding: 4,
  },
  registerToggleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
  },
  registerToggleBold: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#DC2626",
    marginBottom: 10,
    textAlign: "center",
  },
  successText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#10B981",
    marginBottom: 10,
    textAlign: "center",
  },
  verifyDescriptionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
    marginBottom: 16,
    textAlign: "center",
  },

  /* Dark Navy Footer (Screenshot 2 Reference) */
  footerBar: {
    width: "100%",
    backgroundColor: "#0B1953", // Deep navy blue
    paddingHorizontal: SPACING[32],
    paddingVertical: SPACING[20],
  },
  footerContentContainer: {
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  footerLeftBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  footerCopyrightText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[200],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  footerRightLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    alignItems: "center",
  },
  footerRightLinksMobile: {
    gap: 12,
  },
  footerLinkPressable: {
    paddingVertical: 4,
  },
  footerLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[200],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
