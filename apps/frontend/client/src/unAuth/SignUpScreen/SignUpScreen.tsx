import { styles } from "./SignUpScreen.styles";
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
import { COLORS, SHADOWS } from "../../shared/theme/tokens";
import { Input } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import { Logo } from "../../shared/components/Logo";
import { useNavigation } from "@react-navigation/native";
import { useSignUp, isClerkAPIResponseError } from "@clerk/expo";

export function SignUpScreen() {
  const navigation = useNavigation();
  const { signUp } = useSignUp();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");

  // Step state: 'form' | 'verify'
  const [step, setStep] = useState<"form" | "verify">("form");

  // Field validation errors
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const [loading, setLoading] = useState(false);
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

    if (signUp === null || signUp === undefined) {
      setGeneralError("Sign up service is not loaded yet. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const res = await signUp.password({
        emailAddress: email.trim(),
        password,
      });

      if (res.error !== null && res.error !== undefined) {
        setGeneralError(res.error.message || "Sign up failed.");
        return;
      }

      if (signUp.status === "complete") {
        await signUp.finalize();
        setSuccess(true);
      } else {
        await signUp.verifications.sendEmailCode();
        setStep("verify");
      }
    } catch (err: unknown) {
      let errMsg = "Sign up failed. Please check your inputs.";
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

  const handleVerifyCode = async () => {
    if (code.trim().length === 0) {
      setCodeError("Verification code is required");
      return;
    }

    setCodeError("");
    setLoading(true);
    setGeneralError("");

    if (signUp === null || signUp === undefined) {
      setGeneralError("Sign up service is not loaded yet. Please try again.");
      setLoading(false);
      return;
    }

    try {
      await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });

      if (signUp.status === "complete") {
        await signUp.finalize();
        setSuccess(true);
      } else {
        setGeneralError(`Verification incomplete. Status: ${signUp.status}`);
      }
    } catch (err: unknown) {
      let errMsg = "Invalid verification code.";
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

  const resendCode = async () => {
    if (signUp === null || signUp === undefined) return;
    try {
      await signUp.verifications.sendEmailCode();
      setGeneralError("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setGeneralError(err.message);
      }
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

            <Text style={styles.title}>
              {step === "verify" ? "Verify Email" : "Create Account"}
            </Text>
            <Text style={styles.subtitle}>
              {step === "verify"
                ? `Enter the code sent to ${email}`
                : "Register to start filing your applications"}
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
                  Account created and verified! Redirecting to app...
                </Text>
              </View>
            ) : step === "verify" ? (
              <View style={styles.form}>
                <Input
                  label="Verification Code"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChangeText={setCode}
                  error={codeError}
                  keyboardType="numeric"
                  iconName="shield-check"
                />

                <Button
                  title={loading ? "Verifying Code..." : "Verify & Complete"}
                  onPress={handleVerifyCode}
                  loading={loading}
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

                <Button
                  title="Resend Verification Code"
                  variant="text"
                  size="sm"
                  onPress={resendCode}
                  style={styles.secondaryButton}
                />
              </View>
            ) : (
              <View style={styles.form}>
                <Input
                  label="Full Name / Representative"
                  placeholder="John Doe"
                  value={name}
                  onChangeText={setName}
                  error={nameError}
                  autoCapitalize="words"
                  iconName="user"
                />

                <Input
                  label="Email Address"
                  placeholder="john.doe@example.com"
                  value={email}
                  onChangeText={setEmail}
                  error={emailError}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  iconName="mail"
                />

                <Input
                  label="Password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChangeText={setPassword}
                  error={passwordError}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  iconName="lock"
                />

                <Input
                  label="Confirm Password"
                  placeholder="Re-type password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  error={confirmPasswordError}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  iconName="lock"
                />

                <Button
                  title={loading ? "Creating Account..." : "Register"}
                  onPress={handleSignUp}
                  loading={loading}
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

                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>Already have an account? </Text>
                  <Button
                    title="Sign In"
                    variant="text"
                    size="sm"
                    onPress={() => (navigation as { navigate: (route: string) => void }).navigate("Login")}
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
