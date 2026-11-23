import { styles } from "./SignUpScreen.styles";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Icon as Lucide } from "@edge/ui";
import { COLORS, SHADOWS } from "../../shared/theme/tokens";
import { Input } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import { Logo } from "../../shared/components/Logo";
import { useAppNavigation } from "../../navigation";
import { isClerkAPIResponseError, useSSO } from "@clerk/expo";
import { useSignUp } from "@clerk/expo/legacy";
import {
  generateSafeUsername,
  isClerkUnknownParamError,
  isGoogleSsoEnabled,
} from "@edge/api";

export function SignUpScreen() {
  const navigation = useAppNavigation();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isWideForm = width >= 540;

  const { signUp, setActive } = useSignUp();
  const { startSSOFlow } = useSSO();
  const showGoogleSso = isGoogleSsoEnabled({
    clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    enableGoogleSso: process.env.EXPO_PUBLIC_ENABLE_GOOGLE_SSO,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Field validation errors
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);
  const [success, setSuccess] = useState(false);

  // Verification states
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [verificationInfo, setVerificationInfo] = useState("");

  // Live password indicators
  const hasMinLength = password.length >= 8;
  const hasMixedChars = /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  // Animations
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(24)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.timing(cardSlide, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();
  }, [cardFade, cardSlide, glowAnim]);

  const validateForm = (): boolean => {
    let isValid = true;
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setGeneralError("");

    if (name.trim().length === 0) {
      setNameError("Full name is required");
      isValid = false;
    }

    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0) {
      setEmailError("Email address is required");
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setEmailError("Please enter a valid email address");
        isValid = false;
      }
    }

    if (password.length === 0) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      isValid = false;
    }

    if (confirmPassword.length === 0) {
      setConfirmPasswordError("Please confirm your password");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }

    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setGeneralError("");

    if (!signUp || !setActive) {
      setGeneralError("Sign up service is not loaded yet. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const parts = name.trim().split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";
      const safeUsername = generateSafeUsername(
        firstName,
        lastName,
        email.trim(),
      );

      let created = false;
      try {
        await signUp.create({
          emailAddress: email.trim(),
          password,
          firstName,
          lastName,
          username: safeUsername,
        });
        created = true;
      } catch (firstErr: unknown) {
        if (isClerkUnknownParamError(firstErr)) {
          await signUp.create({
            emailAddress: email.trim(),
            password,
            firstName,
            lastName,
          });
          created = true;
        } else {
          throw firstErr;
        }
      }

      if (created) {
        if (signUp.status === "complete") {
          await setActive({ session: signUp.createdSessionId });
          setSuccess(true);
        } else {
          await signUp.prepareEmailAddressVerification({
            strategy: "email_code",
          });
          setVerificationInfo(
            `We sent a 6-digit verification code to ${email.trim()}.`,
          );
          setPendingVerification(true);
        }
      }
    } catch (err: unknown) {
      let errMsg = "Sign up failed. Please check your inputs.";
      if (isClerkAPIResponseError(err)) {
        const firstErr = err.errors[0];
        const errCode = firstErr?.code || "";
        const rawMsg = firstErr?.message || "";
        if (
          errCode === "form_identifier_exists" ||
          errCode === "form_identifier_not_unique" ||
          rawMsg.toLowerCase().includes("already exists") ||
          rawMsg.toLowerCase().includes("taken") ||
          rawMsg.toLowerCase().includes("in use")
        ) {
          errMsg =
            "An account with this email address already exists. One email address must be associated with only one account.";
          setEmailError(
            "This email address is already in use by an existing account.",
          );
        } else {
          errMsg = rawMsg || errMsg;
        }
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      setGeneralError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.trim().length === 0) {
      setCodeError("Verification code is required");
      return;
    }

    setLoading(true);
    setGeneralError("");
    setCodeError("");

    if (!signUp || !setActive) {
      setGeneralError("Sign up service is not loaded yet. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        setSuccess(true);
      } else {
        setGeneralError(
          "Verification failed. Verification status is: " +
            completeSignUp.status,
        );
      }
    } catch (err: unknown) {
      let errMsg = "Verification failed. Please check the code.";
      if (isClerkAPIResponseError(err)) {
        errMsg = err.errors[0]?.message || errMsg;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      setGeneralError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerificationCode = async () => {
    if (!signUp || resendingCode) return;
    setResendingCode(true);
    setCodeError("");
    setGeneralError("");

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerificationInfo(
        `A new 6-digit verification code was sent to ${email.trim()}.`,
      );
    } catch (err: unknown) {
      let errMsg = "Failed to resend verification code.";
      if (isClerkAPIResponseError(err)) {
        errMsg = err.errors[0]?.message || errMsg;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      setCodeError(errMsg);
    } finally {
      setResendingCode(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!showGoogleSso || loading || googleLoading) return;
    setGoogleLoading(true);
    setGeneralError("");
    try {
      const res = await startSSOFlow({ strategy: "oauth_google" });
      if (
        res !== null &&
        res !== undefined &&
        res.createdSessionId &&
        typeof res.setActive === "function"
      ) {
        await res.setActive({ session: res.createdSessionId });
        setSuccess(true);
      }
    } catch (err: unknown) {
      let errMsg = "Google registration failed. Please try again.";
      if (isClerkAPIResponseError(err)) {
        errMsg = err.errors[0]?.message || errMsg;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      setGeneralError(errMsg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05],
  });

  const webGlowStyle: Record<string, string | number> = {
    filter: "blur(100px)",
    opacity: 0.12,
  };
  const mobileGlowStyle = {
    opacity: 0.12,
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isMobile ? styles.scrollContentMobile : null,
          isTablet ? styles.scrollContentTablet : null,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.bgGlow,
            { transform: [{ scale: glowScale }] },
            Platform.OS === "web" ? webGlowStyle : mobileGlowStyle,
          ]}
          pointerEvents="none"
        />
        <Animated.View
          style={[
            styles.bgGlowSecondary,
            { transform: [{ scale: glowScale }] },
            Platform.OS === "web" ? webGlowStyle : mobileGlowStyle,
          ]}
          pointerEvents="none"
        />

        <View
          style={[
            styles.outerContainer,
            isTablet ? styles.outerContainerTablet : null,
          ]}
        >
          <View style={styles.topBarRow}>
            <Button
              title="Back to Landing"
              variant="text"
              size="sm"
              onPress={() => navigation?.navigate("Landing")}
              style={styles.backButton}
              textStyle={styles.backButtonText}
              icon={
                <Lucide name="arrow-left" size={14} color={COLORS.neutral[600]} />
              }
              disabled={loading || googleLoading || success}
            />

            <View style={styles.securityBadge}>
              <View style={styles.securityDot} />
              <Text style={styles.securityText}>NTC Node: Online</Text>
            </View>
          </View>

          <Animated.View
            style={[
              styles.card,
              SHADOWS.modal,
              { opacity: cardFade, transform: [{ translateY: cardSlide }] },
            ]}
          >
            {/* Top Window Accent Bar */}
            <View style={styles.cardHeaderBar}>
              <View style={styles.windowDotsRow}>
                <View style={[styles.windowDot, { backgroundColor: "#EF4444" }]} />
                <View style={[styles.windowDot, { backgroundColor: "#F59E0B" }]} />
                <View style={[styles.windowDot, { backgroundColor: "#10B981" }]} />
              </View>
              <View style={styles.cardHeaderBadge}>
                <Lucide name="shield" size={11} color={COLORS.neutral[500]} />
                <Text style={styles.cardHeaderBadgeText}>
                  Applicant Registration
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.cardBody,
                isMobile ? styles.cardBodyMobile : null,
                isTablet ? styles.cardBodyTablet : null,
              ]}
            >
              <View style={styles.logoWrapper}>
                <Logo height={isMobile ? 42 : 48} />
              </View>

              {/* Mode Switcher Tabs (Sign In / Create Account) */}
              {!pendingVerification ? (
                <View style={styles.modeTabsContainer}>
                  <TouchableOpacity
                    style={styles.modeTab}
                    activeOpacity={0.75}
                    onPress={() => navigation?.navigate("Login")}
                    disabled={loading || googleLoading || success}
                  >
                    <Lucide name="log-in" size={14} color={COLORS.neutral[500]} />
                    <Text style={styles.modeTabText}>Sign In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modeTab, styles.modeTabActive]}
                    activeOpacity={0.9}
                  >
                    <Lucide name="user-plus" size={14} color={COLORS.brand[800]} />
                    <Text style={[styles.modeTabText, styles.modeTabTextActive]}>
                      Create Account
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <Text style={[styles.title, isMobile ? styles.titleMobile : null]}>
                {pendingVerification ? "Verify Your Email" : "Create Applicant Account"}
              </Text>
              <Text style={styles.subtitle}>
                {pendingVerification
                  ? "Enter the 6-digit verification code sent to your email address"
                  : "Register once to file individual or bulk NTC applications across all regions"}
              </Text>

              {generalError.length > 0 ? (
                <View style={styles.errorBanner}>
                  <Lucide
                    name="alert-circle"
                    size={18}
                    color={COLORS.semantic.error}
                  />
                  <Text style={styles.generalError}>{generalError}</Text>
                </View>
              ) : null}

              {success ? (
                <View style={styles.successBox}>
                  <Lucide
                    name="check-circle"
                    size={28}
                    color={COLORS.semantic.success}
                    style={styles.successIcon}
                  />
                  <Text style={styles.successText}>
                    Account created successfully! Redirecting to your portal...
                  </Text>
                </View>
              ) : pendingVerification ? (
                <View style={styles.form}>
                  <View style={styles.otpTargetCard}>
                    <Lucide name="mail" size={18} color={COLORS.brand[800]} />
                    <Text style={styles.otpTargetText}>
                      {verificationInfo ||
                        `We sent a 6-digit verification code to ${email.trim()}.`}
                    </Text>
                  </View>

                  <Input
                    label="6-Digit Verification Code"
                    placeholder="123456"
                    value={code}
                    onChangeText={setCode}
                    error={codeError}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    iconName="lock"
                  />

                  <Button
                    title={loading ? "Verifying..." : "Verify & Activate Account"}
                    onPress={handleVerifyCode}
                    loading={loading}
                    disabled={loading}
                    style={styles.submitButton}
                    icon={
                      !loading ? (
                        <Lucide
                          name="check-circle"
                          size={16}
                          color={COLORS.neutral.white}
                        />
                      ) : undefined
                    }
                  />

                  <View style={styles.otpActionsRow}>
                    <Button
                      title={resendingCode ? "Resending..." : "Resend Code"}
                      variant="text"
                      size="sm"
                      onPress={handleResendVerificationCode}
                      disabled={resendingCode || loading}
                      textStyle={{ color: COLORS.brand[800], fontSize: 13 }}
                    />

                    <Button
                      title="Edit Registration Details"
                      variant="text"
                      size="sm"
                      onPress={() => {
                        setPendingVerification(false);
                        setCodeError("");
                        setGeneralError("");
                      }}
                      textStyle={{ color: COLORS.neutral[600], fontSize: 13 }}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.form}>
                  <Input
                    label="Full Name or Authorized Representative"
                    placeholder="e.g. Juan Dela Cruz"
                    value={name}
                    onChangeText={setName}
                    error={nameError}
                    autoCapitalize="words"
                    iconName="user"
                  />

                  <Input
                    label="Email Address"
                    placeholder="e.g. juan.delacruz@domain.com"
                    value={email}
                    onChangeText={setEmail}
                    error={emailError}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    iconName="mail"
                  />

                  <View style={isWideForm ? styles.passwordRowTablet : undefined}>
                    <View style={isWideForm ? styles.passwordColHalf : undefined}>
                      <Input
                        label="Password"
                        placeholder="Min. 8 characters"
                        value={password}
                        onChangeText={setPassword}
                        error={passwordError}
                        isPassword={true}
                        autoCapitalize="none"
                        iconName="lock"
                      />
                    </View>

                    <View style={isWideForm ? styles.passwordColHalf : undefined}>
                      <Input
                        label="Confirm Password"
                        placeholder="Re-type password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        error={confirmPasswordError}
                        isPassword={true}
                        autoCapitalize="none"
                        iconName="lock"
                      />
                    </View>
                  </View>

                  {/* Live Password Requirement Indicators */}
                  <View style={styles.passwordChecklistRow}>
                    <View
                      style={[
                        styles.requirementPill,
                        hasMinLength ? styles.requirementPillMet : null,
                      ]}
                    >
                      <Lucide
                        name={hasMinLength ? "check-circle" : "circle"}
                        size={12}
                        color={hasMinLength ? "#059669" : COLORS.neutral[400]}
                      />
                      <Text
                        style={[
                          styles.requirementPillText,
                          hasMinLength ? styles.requirementPillTextMet : null,
                        ]}
                      >
                        8+ characters
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.requirementPill,
                        hasMixedChars ? styles.requirementPillMet : null,
                      ]}
                    >
                      <Lucide
                        name={hasMixedChars ? "check-circle" : "circle"}
                        size={12}
                        color={hasMixedChars ? "#059669" : COLORS.neutral[400]}
                      />
                      <Text
                        style={[
                          styles.requirementPillText,
                          hasMixedChars ? styles.requirementPillTextMet : null,
                        ]}
                      >
                        Letters & numbers
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.requirementPill,
                        passwordsMatch ? styles.requirementPillMet : null,
                      ]}
                    >
                      <Lucide
                        name={passwordsMatch ? "check-circle" : "circle"}
                        size={12}
                        color={passwordsMatch ? "#059669" : COLORS.neutral[400]}
                      />
                      <Text
                        style={[
                          styles.requirementPillText,
                          passwordsMatch ? styles.requirementPillTextMet : null,
                        ]}
                      >
                        Passwords match
                      </Text>
                    </View>
                  </View>

                  <Button
                    title={loading ? "Creating Account..." : "Create Account"}
                    onPress={handleSignUp}
                    loading={loading}
                    disabled={loading || googleLoading}
                    style={styles.submitButton}
                    icon={
                      !loading ? (
                        <Lucide
                          name="user-plus"
                          size={16}
                          color={COLORS.neutral.white}
                        />
                      ) : undefined
                    }
                  />

                  {showGoogleSso ? (
                    <>
                      <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or register with</Text>
                        <View style={styles.dividerLine} />
                      </View>

                      <Button
                        title={
                          googleLoading
                            ? "Connecting to Google..."
                            : "Continue with Google"
                        }
                        variant="outline"
                        onPress={handleGoogleSignUp}
                        loading={googleLoading}
                        disabled={loading || googleLoading || success}
                        style={styles.googleButton}
                        icon={
                          !googleLoading ? (
                            <Lucide
                              name="chrome"
                              size={16}
                              color={COLORS.neutral[700]}
                            />
                          ) : undefined
                        }
                      />
                    </>
                  ) : null}

                  <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>
                      Already have an account?{" "}
                    </Text>
                    <Button
                      title="Sign In"
                      variant="text"
                      size="sm"
                      onPress={() => navigation?.navigate("Login")}
                      textStyle={styles.footerLink}
                    />
                  </View>

                  <View style={styles.trustBanner}>
                    <Lucide name="shield" size={14} color={COLORS.brand[800]} />
                    <Text style={styles.trustBannerText}>
                      One email address per account. Protected under the Philippine Data Privacy Act (RA 10173).
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

