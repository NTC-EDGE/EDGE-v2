import { styles } from "./LoginScreen.styles";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { Icon as Lucide } from "@edge/ui";
import { COLORS, SHADOWS, SPACING } from "../../shared/theme/tokens";
import { Input } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import { Logo } from "../../shared/components/Logo";
import { useAppNavigation } from "../../navigation";
import { isClerkAPIResponseError, useSSO } from "@clerk/expo";
import { useSignIn } from "@clerk/expo/legacy";

interface FirstFactorItem {
  strategy?: string;
  emailAddressId?: string;
  email_address_id?: string;
  safeIdentifier?: string;
  safe_identifier?: string;
}

function isClerkStrategyInvalidError(err: unknown): boolean {
  if (isClerkAPIResponseError(err)) {
    const firstErr = err.errors[0];
    if (
      firstErr?.code === "strategy_for_user_invalid" ||
      firstErr?.message?.toLowerCase().includes("strategy") ||
      firstErr?.longMessage?.toLowerCase().includes("strategy")
    ) {
      return true;
    }
  }
  if (typeof err === "object" && err !== null) {
    const record = err as Record<string, unknown>;
    if (record.code === "strategy_for_user_invalid") return true;
    if (Array.isArray(record.errors)) {
      return record.errors.some(
        (e: unknown) =>
          typeof e === "object" &&
          e !== null &&
          (e as Record<string, unknown>).code === "strategy_for_user_invalid"
      );
    }
  }
  return false;
}

export function LoginScreen() {
  const navigation = useAppNavigation();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Email Code (OTP) verification state
  const [pendingEmailCode, setPendingEmailCode] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeInfo, setEmailCodeInfo] = useState("");

  // Validation errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);
  const [success, setSuccess] = useState(false);

  // Animations
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(cardSlide, {
        toValue: 0,
        duration: 650,
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

  const validate = () => {
    let valid = true;

    if (!email.trim()) {
      setEmailError("Email address is required.");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else {
      setPasswordError("");
    }

    return valid;
  };

  const handleStartEmailCodeFlow = async (targetEmail: string) => {
    if (!signIn || !isLoaded) return;
    setLoading(true);
    setGeneralError("");

    try {
      const si = await signIn.create({
        identifier: targetEmail.trim(),
      });

      const firstFactors = (si.supportedFirstFactors || signIn.supportedFirstFactors || []) as FirstFactorItem[];
      const emailCodeFactor = firstFactors.find((f) => f.strategy === "email_code");

      if (emailCodeFactor && typeof signIn.prepareFirstFactor === "function") {
        const emailAddressId = emailCodeFactor.emailAddressId || emailCodeFactor.email_address_id || "";
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId,
        });

        setEmailCodeInfo(
          `A 6-digit verification code has been sent to ${emailCodeFactor.safeIdentifier || emailCodeFactor.safe_identifier || targetEmail}.`
        );
        setPendingEmailCode(true);
      } else {
        const hasGoogle = firstFactors.some((f) => f.strategy === "oauth_google");
        if (hasGoogle) {
          setGeneralError(
            "This account is linked with Google Sign-In and does not have password login enabled. Please click 'Continue with Google' below."
          );
        } else {
          setGeneralError("This account does not support email code verification.");
        }
      }
    } catch (err: unknown) {
      console.error("Start email code flow error:", err);
      let errMsg = "Failed to send verification code. Please try again.";
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

  const handleSignIn = async () => {
    if (!validate()) return;

    setLoading(true);
    setGeneralError("");

    if (!signIn || !setActive) {
      setGeneralError(
        "Authentication service is not loaded yet. Please try again.",
      );
      setLoading(false);
      return;
    }

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (signIn.status === "complete") {
        await setActive({ session: signIn.createdSessionId });
        setSuccess(true);
      } else if (signIn.status === "needs_first_factor" || signIn.status === "needs_second_factor") {
        const firstFactors = (signIn.supportedFirstFactors || []) as FirstFactorItem[];
        const emailCodeFactor = firstFactors.find((f) => f.strategy === "email_code");

        if (emailCodeFactor && typeof signIn.prepareFirstFactor === "function") {
          const emailAddressId = emailCodeFactor.emailAddressId || emailCodeFactor.email_address_id || "";
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId,
          });
          setEmailCodeInfo(
            `A 6-digit verification code has been sent to ${emailCodeFactor.safeIdentifier || emailCodeFactor.safe_identifier || email}.`
          );
          setPendingEmailCode(true);
        } else {
          setGeneralError(`Sign-in incomplete: status is ${signIn.status}`);
        }
      } else {
        setGeneralError(`Sign-in incomplete: status is ${signIn.status}`);
      }
    } catch (err: unknown) {
      // Check if the error is "Invalid verification strategy" / strategy_for_user_invalid
      // This happens when the user account doesn't have password authentication configured (e.g. email_code or google only)
      if (isClerkStrategyInvalidError(err)) {
        await handleStartEmailCodeFlow(email);
        return;
      }

      let errMsg = "Invalid email or password.";
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

  const handleVerifyEmailCode = async () => {
    if (!emailCode.trim()) {
      setCodeError("Verification code is required.");
      return;
    }

    setLoading(true);
    setCodeError("");
    setGeneralError("");

    if (!signIn || !setActive) {
      setGeneralError("Authentication service is not loaded yet. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: emailCode.trim(),
      });

      if (result.status === "complete" || signIn.status === "complete") {
        await setActive({ session: result.createdSessionId || signIn.createdSessionId });
        setSuccess(true);
      } else {
        setGeneralError(`Sign-in status: ${result.status}`);
      }
    } catch (err: unknown) {
      console.error("Email code verify error:", err);
      let errMsg = "Invalid verification code. Please check and try again.";
      if (isClerkAPIResponseError(err)) {
        errMsg = err.errors[0]?.message || errMsg;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      setCodeError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmailCode = async () => {
    if (!email.trim() || resendingCode) return;
    setResendingCode(true);
    setCodeError("");
    setGeneralError("");

    try {
      const firstFactors = (signIn?.supportedFirstFactors || []) as FirstFactorItem[];
      const emailCodeFactor = firstFactors.find((f) => f.strategy === "email_code");

      if (emailCodeFactor && typeof signIn?.prepareFirstFactor === "function") {
        const emailAddressId = emailCodeFactor.emailAddressId || emailCodeFactor.email_address_id || "";
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId,
        });
        setEmailCodeInfo(
          `New verification code sent to ${emailCodeFactor.safeIdentifier || emailCodeFactor.safe_identifier || email}.`
        );
      } else if (signIn && typeof signIn.create === "function") {
        await signIn.create({ identifier: email.trim() });
        const refreshedFactors = (signIn.supportedFirstFactors || []) as FirstFactorItem[];
        const refreshedEmailFactor = refreshedFactors.find((f) => f.strategy === "email_code");
        if (refreshedEmailFactor && typeof signIn.prepareFirstFactor === "function") {
          const emailAddressId = refreshedEmailFactor.emailAddressId || refreshedEmailFactor.email_address_id || "";
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId,
          });
          setEmailCodeInfo(`New verification code sent to ${email.trim()}.`);
        }
      }
    } catch (err: unknown) {
      let errMsg = "Failed to resend code.";
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

  const handleGoogleSignIn = async () => {
    if (loading || googleLoading) return;
    setGoogleLoading(true);
    setGeneralError("");
    try {
      const res = await startSSOFlow({ strategy: "oauth_google" });
      if (res !== null && res !== undefined && res.createdSessionId && typeof res.setActive === "function") {
        await res.setActive({ session: res.createdSessionId });
        setSuccess(true);
      }
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      let errMsg = "Google sign-in failed. Please try again.";
      if (isClerkAPIResponseError(err)) {
        errMsg = err.errors[0]?.message ?? errMsg;
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
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.bgGlow,
            { transform: [{ scale: glowScale }] },
            Platform.OS === "web" ? webGlowStyle : mobileGlowStyle,
          ]}
        />

        <View style={styles.outerContainer}>
          <Button
            title="Back to Landing Page"
            variant="text"
            size="sm"
            onPress={() => (navigation as { navigate: (route: string) => void }).navigate("Landing")}
            style={styles.backButton}
            textStyle={styles.backButtonText}
            icon={
              <Lucide name="arrow-left" size={14} color={COLORS.neutral[600]} />
            }
            disabled={loading || googleLoading || success}
          />

          <Animated.View
            style={[
              styles.card,
              SHADOWS.modal,
              { opacity: cardFade, transform: [{ translateY: cardSlide }] },
            ]}
          >
            <View style={styles.logoWrapper}>
              <Logo />
            </View>

            <View style={styles.securityBadge}>
              <View style={styles.securityDot} />
              <Text style={styles.securityText}>Secure NTC Node: Active</Text>
            </View>

            <Text style={styles.title}>
              {pendingEmailCode ? "Verify Email Code" : "Welcome Back"}
            </Text>
            <Text style={styles.subtitle}>
              {pendingEmailCode
                ? emailCodeInfo || "Enter the 6-digit verification code sent to your email"
                : "Sign in to access your dashboard"}
            </Text>

            {generalError.length > 0 ? (
              <Text style={styles.generalError}>{generalError}</Text>
            ) : null}

            {success ? (
              <View style={styles.successBox}>
                <Lucide
                  name="check-circle"
                  size={24}
                  color={COLORS.semantic.success}
                  style={styles.successIcon}
                />
                <Text style={styles.successText}>
                  Successfully authenticated! Redirecting...
                </Text>
              </View>
            ) : pendingEmailCode ? (
              /* Email OTP Verification View */
              <View style={styles.form}>
                <Input
                  label="6-Digit Verification Code"
                  placeholder="123456"
                  value={emailCode}
                  onChangeText={setEmailCode}
                  error={codeError}
                  keyboardType="numeric"
                  autoCapitalize="none"
                  iconName="lock"
                />

                <Button
                  title={loading ? "Verifying Code..." : "Verify & Sign In"}
                  onPress={handleVerifyEmailCode}
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

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: SPACING[16],
                  }}
                >
                  <Button
                    title={resendingCode ? "Resending..." : "Resend Code"}
                    variant="text"
                    size="sm"
                    onPress={handleResendEmailCode}
                    disabled={resendingCode || loading}
                    textStyle={{ color: COLORS.brand[800], fontSize: 13 }}
                  />

                  <Button
                    title="Back to Password"
                    variant="text"
                    size="sm"
                    onPress={() => {
                      setPendingEmailCode(false);
                      setCodeError("");
                      setGeneralError("");
                    }}
                    textStyle={{ color: COLORS.neutral[600], fontSize: 13 }}
                  />
                </View>
              </View>
            ) : (
              /* Standard Email + Password View */
              <View style={styles.form}>
                <Input
                  label="Email Address"
                  placeholder="e.g. email@domain.com"
                  value={email}
                  onChangeText={setEmail}
                  error={emailError}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  iconName="mail"
                />

                <Input
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  error={passwordError}
                  isPassword={true}
                  autoCapitalize="none"
                  iconName="lock"
                />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: SPACING[20],
                  }}
                >
                  <Button
                    title="Sign in with Email Code"
                    variant="text"
                    size="sm"
                    onPress={() => {
                      if (!email.trim()) {
                        setEmailError("Please enter your email address first.");
                        return;
                      }
                      handleStartEmailCodeFlow(email);
                    }}
                    textStyle={{ fontSize: 12, color: COLORS.brand[700] }}
                  />

                  <Button
                    title="Forgot Password?"
                    variant="text"
                    size="sm"
                    onPress={() => (navigation as { navigate: (route: string) => void }).navigate("ForgotPassword")}
                    style={styles.forgotButton}
                    textStyle={styles.forgotText}
                  />
                </View>

                <Button
                  title={loading ? "Verifying Credentials..." : "Sign In"}
                  onPress={handleSignIn}
                  loading={loading}
                  disabled={loading || googleLoading}
                  style={styles.submitButton}
                  icon={
                    !loading ? (
                      <Lucide
                        name="log-in"
                        size={16}
                        color={COLORS.neutral.white}
                      />
                    ) : undefined
                  }
                />

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Sign-In */}
                <Button
                  title={googleLoading ? "Connecting to Google..." : "Continue with Google"}
                  variant="outline"
                  onPress={handleGoogleSignIn}
                  loading={googleLoading}
                  disabled={loading || googleLoading || success}
                  style={styles.guestButton}
                  icon={
                    !googleLoading ? (
                      <Lucide name="chrome" size={16} color={COLORS.neutral[700]} />
                    ) : undefined
                  }
                />

                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>New to EDGE? </Text>
                  <Button
                    title="Create an account"
                    variant="text"
                    size="sm"
                    onPress={() => (navigation as { navigate: (route: string) => void }).navigate("SignUp")}
                    textStyle={styles.footerLink}
                  />
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
