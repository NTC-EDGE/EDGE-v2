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
import { COLORS, SHADOWS } from "../../shared/theme/tokens";
import { Input } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import { Logo } from "../../shared/components/Logo";
import { useNavigation } from "@react-navigation/native";
import { useSignIn, isClerkAPIResponseError } from "@clerk/expo";
import { parseApiError } from "@edge/api";

export function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { signIn } = useSignIn();

  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [passwordError, setPasswordError] = useState("");
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

  const handleRequestCode = async () => {
    setEmailError("");
    setGeneralError("");

    if (email.trim().length === 0) {
      setEmailError("Email address is required");
      return;
    }

    setLoading(true);

    if (signIn === null || signIn === undefined) {
      setGeneralError("Authentication service is not loaded yet. Please try again.");
      setLoading(false);
      return;
    }

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });

      setStep("reset");
    } catch (err: unknown) {
      setGeneralError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setCodeError("");
    setPasswordError("");
    setGeneralError("");

    if (code.trim().length === 0) {
      setCodeError("Verification code is required");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setLoading(true);

    if (signIn === null || signIn === undefined) {
      setGeneralError("Authentication service is not loaded yet. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const res = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
        password: newPassword,
      });

      if (res.status === "complete") {
        await signIn.finalize();
        setSuccess(true);
      } else {
        setGeneralError(`Reset incomplete. Status: ${res.status}`);
      }
    } catch (err: unknown) {
      setGeneralError(parseApiError(err));
    } finally {
      setLoading(false);
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
              {step === "request" ? "Forgot Password?" : "Set New Password"}
            </Text>
            <Text style={styles.subtitle}>
              {step === "request"
                ? "Enter your registered email address to receive a 6-digit verification code."
                : `Enter the code sent to ${email} and your new password.`}
            </Text>

            {generalError.length > 0 ? (
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: "#DC2626", marginBottom: 12, textAlign: "center" }}>
                {generalError}
              </Text>
            ) : null}

            {success ? (
              <View style={styles.successWrapper}>
                <View style={styles.successBox}>
                  <Lucide
                    name="check-circle"
                    size={24}
                    color={COLORS.semantic.success}
                    style={styles.successIcon}
                  />
                  <Text style={styles.successText}>
                    Password successfully reset! You can now sign in.
                  </Text>
                </View>
                <Button
                  title="Return to Sign In"
                  onPress={() => (navigation as { navigate: (route: string) => void }).navigate("Login")}
                  style={styles.returnButton}
                  icon={
                    <Lucide
                      name="arrow-left"
                      size={16}
                      color={COLORS.neutral.white}
                    />
                  }
                />
              </View>
            ) : step === "request" ? (
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
                  onPress={handleRequestCode}
                  loading={loading}
                  style={styles.submitButton}
                  icon={
                    !loading ? (
                      <Lucide
                        name="send"
                        size={16}
                        color={COLORS.neutral.white}
                      />
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
            ) : (
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

                <Input
                  label="New Password"
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  error={passwordError}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  iconName="lock"
                />

                <Input
                  label="Confirm New Password"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  iconName="lock"
                />

                <Button
                  title={loading ? "Resetting Password..." : "Reset Password"}
                  onPress={handleResetPassword}
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
