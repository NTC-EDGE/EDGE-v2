import { styles } from "./SignUpScreen.styles";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Icon as Lucide } from '@edge/ui';
import { COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY } from '../../shared/theme/tokens';
import { Input } from '../../shared/components/Input';
import { Button } from '../../shared/components/Button';
import { Logo } from '../../shared/components/Logo';
import { useAppNavigation } from '../../navigation';
import { isClerkAPIResponseError } from '@clerk/expo';
import { useSignUp } from '@clerk/expo/legacy';
import { generateSafeUsername } from '@edge/api';

export function SignUpScreen() {
  const navigation = useAppNavigation();
  const { signUp, setActive, isLoaded } = useSignUp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Field validation errors
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Verification states
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

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

    if (!signUp || !setActive) {
      setGeneralError('Sign up service is not loaded yet. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const parts = name.trim().split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";
      const safeUsername = generateSafeUsername(firstName, lastName, email.trim());

      let created = false;
      try {
        // Attempt signup with safe username (satisfies instances requiring username)
        await signUp.create({
          emailAddress: email.trim(),
          password,
          firstName,
          lastName,
          username: safeUsername,
        });
        created = true;
      } catch (firstErr: unknown) {
        // Fallback: If Clerk instance does not allow/recognize username, retry without username
        if (isClerkAPIResponseError(firstErr)) {
          const firstErrCode = firstErr.errors[0]?.code || "";
          const firstErrMsg = (firstErr.errors[0]?.message || "").toLowerCase();
          if (
            firstErrCode === "form_param_unknown" ||
            firstErrMsg.includes("unrecognized") ||
            firstErrMsg.includes("not allowed") ||
            firstErrMsg.includes("unknown parameter") ||
            firstErrMsg.includes("unexpected parameter")
          ) {
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
        } else {
          throw firstErr;
        }
      }

      if (created) {
        if (signUp.status === 'complete') {
          await setActive({ session: signUp.createdSessionId });
          setSuccess(true);
        } else {
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
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
          errMsg = "An account with this email address already exists. One email address must be associated with only one account.";
          setEmailError("This email address is already in use by an existing account.");
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
    setGeneralError('');
    setCodeError('');

    if (!signUp || !setActive) {
      setGeneralError('Sign up service is not loaded yet. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        setSuccess(true);
      } else {
        setGeneralError('Verification failed. Verification status is: ' + completeSignUp.status);
      }
    } catch (err: unknown) {
      let errMsg = 'Verification failed. Please check the code.';
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

            <View style={styles.securityBadge}>
              <View style={styles.securityDot} />
              <Text style={styles.securityText}>Secure NTC Node: Active</Text>
            </View>

            <Text style={styles.title}>
              {pendingVerification ? "Verify Email" : "Create Account"}
            </Text>
            <Text style={styles.subtitle}>
              {pendingVerification
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
                  Account created successfully! Redirecting...
                </Text>
              </View>
            ) : pendingVerification ? (
              <View style={styles.form}>
                <Text style={[styles.subtitle, { marginBottom: 16 }]}>
                  We sent a 6-digit verification code to{" "}
                  <Text style={{ fontWeight: "600", color: COLORS.brand[700] }}>
                    {email}
                  </Text>
                  . Please enter it below.
                </Text>

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

                <Button
                  title={loading ? "Verifying..." : "Verify Email"}
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

                <View style={styles.footerContainer}>
                  <Button
                    title="Back to Sign Up"
                    variant="text"
                    size="sm"
                    onPress={() => setPendingVerification(false)}
                    textStyle={styles.footerLink}
                  />
                </View>
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
                  isPassword={true}
                  autoCapitalize="none"
                  iconName="lock"
                />

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

                <Button
                  title={loading ? "Creating Account..." : "Register"}
                  onPress={handleSignUp}
                  loading={loading}
                  disabled={loading}
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
