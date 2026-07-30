import { styles } from "./ForgotPasswordScreen.styles";
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
import {
  COLORS,
  SHADOWS,
  SPACING,
} from "../../shared/theme/tokens";
import { Input } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import { Logo } from "../../shared/components/Logo";

import { useAppNavigation } from "../../navigation";
import { isClerkAPIResponseError } from "@clerk/expo";
import { useSignIn } from "@clerk/expo/legacy";

export function ForgotPasswordScreen() {
  const navigation = useAppNavigation();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Verification and new password states
  const [pendingVerification, setPendingVerification] = useState(false);

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
    if (email.trim().length === 0) {
      setEmailError("Email address is required");
      return false;
    }
    if (!email.includes("@")) {
      setEmailError('Please enter a valid email containing "@"');
      return false;
    }
    return true;
  };

  const handlePasswordReset = async () => {
    if (!validate()) return;

    setLoading(true);
    setGeneralError("");

    if (!signIn || !isLoaded) {
      setGeneralError("Authentication service is not loaded yet. Please try again.");
      setLoading(false);
      return;
    }

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      setPendingVerification(true);
    } catch (err: unknown) {
      let errMsg = "Failed to send reset instructions.";
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
  const handleRequestCode = handlePasswordReset;

  const handleVerifyCodeAndResetPassword = async () => {
    let isValid = true;
    setCodeError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    setGeneralError("");

    if (code.trim().length === 0) {
      setCodeError("Verification code is required.");
      isValid = false;
    }
    if (newPassword.length === 0) {
      setNewPasswordError("New password is required.");
      isValid = false;
    } else if (newPassword.length < 8) {
      setNewPasswordError("Password must be at least 8 characters.");
      isValid = false;
    }
    if (confirmPassword.length === 0) {
      setConfirmPasswordError("Please confirm your password.");
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);

    if (!signIn || !setActive) {
      setGeneralError("Authentication service is not loaded yet. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setSuccess(true);
      } else {
        setGeneralError("Failed to complete password reset. Status: " + result.status);
      }
    } catch (err: unknown) {
      let errMsg = "Failed to reset password. Please check the code and try again.";
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
  const handleResetPassword = handleVerifyCodeAndResetPassword;

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
            disabled={loading || success}
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

            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={[styles.subtitle, { marginBottom: 16 }]}>
              {pendingVerification
                ? "Enter the code sent to your email and your new password."
                : "Enter your email and we'll send you instructions to reset your password."}
            </Text>


          {generalError.length > 0 && (
            <Text style={styles.generalError}>{generalError}</Text>
          )}

          {success ? (
            <View style={styles.successWrapper}>
              <View style={styles.successBox}>
                <Lucide name="check-circle" size={24} color={COLORS.semantic.success} style={styles.successIcon} />
                <Text style={styles.successText}>Password reset successfully! Redirecting...</Text>
              </View>
            </View>
          ) : pendingVerification ? (
            <View style={styles.form}>
              <Input
                label="Verification Code"
                placeholder="123456"
                value={code}
                onChangeText={setCode}
                error={codeError}
                keyboardType="numeric"
                autoCapitalize="none"
                iconName="lock"
              />
              <Input
                label="New Password"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChangeText={setNewPassword}
                error={newPasswordError}
                secureTextEntry={true}
                autoCapitalize="none"
                iconName="lock"
              />
              <Input
                label="Confirm New Password"
                placeholder="Re-type new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={confirmPasswordError}
                secureTextEntry={true}
                autoCapitalize="none"
                iconName="lock"
              />
              <Button
                title={loading ? "Resetting Password..." : "Reset Password"}
                onPress={handleVerifyCodeAndResetPassword}
                loading={loading}
                style={styles.submitButton}
                icon={
                  !loading ? (
                    <Lucide name="check-circle" size={16} color={COLORS.neutral.white} />
                  ) : undefined
                }
              />
              <Button
                title="Back to Email Entry"
                variant="text"
                size="sm"
                onPress={() => setPendingVerification(false)}
                style={styles.backToLoginBtn}
                textStyle={styles.backToLoginText}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <Input
                label="Email Address"
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
                error={emailError}
                keyboardType="email-address"
                autoCapitalize="none"
                iconName="mail"
              />
              <Button
                title={loading ? "Sending Code..." : "Send Reset Code"}
                onPress={handlePasswordReset}
                loading={loading}
                style={styles.submitButton}
                icon={
                  !loading ? (
                    <Lucide name="send" size={16} color={COLORS.neutral.white} />
                  ) : undefined
                }
              />
              <Button
                title="Return to Sign In"
                variant="text"
                size="sm"
                onPress={() => (navigation as { navigate: (route: string) => void }).navigate("Login")}
                style={styles.backToLoginBtn}
                textStyle={styles.backToLoginText}
              />
            </View>
          )}
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
