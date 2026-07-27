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
import { COLORS, SHADOWS } from "../../shared/theme/tokens";
import { Input } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import { Logo } from "../../shared/components/Logo";
import { useAppNavigation } from "../../navigation";
import { isClerkAPIResponseError, useSSO } from "@clerk/expo";
import { useSignIn } from "@clerk/expo/legacy";

export function LoginScreen() {
  const navigation = useAppNavigation();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Validation errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

    if (!email) {
      setEmailError("Email address is required.");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
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
        identifier: email,
        password,
      });

      if (signIn.status === "complete") {
        await setActive({ session: signIn.createdSessionId });
        setSuccess(true);
      } else {
        setGeneralError(`Sign-in incomplete: status is ${signIn.status}`);
      }
    } catch (err: unknown) {
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

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    setGeneralError("");
    try {
      const { createdSessionId, setActive: ssoSetActive } = await startSSOFlow({
        strategy: "oauth_google",
      });
      if (createdSessionId !== null && ssoSetActive !== undefined) {
        await ssoSetActive({ session: createdSessionId });
        setSuccess(true);
      } else {
        setGeneralError("Google sign-in did not complete. Please try again.");
      }
    } catch (err: unknown) {
      let errMsg = "Google sign-in failed. Please try again.";
      if (isClerkAPIResponseError(err)) {
        errMsg = err.errors[0]?.message ?? errMsg;
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

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to access your dashboard
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
            ) : (
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
                  secureTextEntry={true}
                  autoCapitalize="none"
                  iconName="lock"
                />

                <Button
                  title="Forgot Password?"
                  variant="text"
                  size="sm"
                  onPress={() => (navigation as { navigate: (route: string) => void }).navigate("ForgotPassword")}
                  style={styles.forgotButton}
                  textStyle={styles.forgotText}
                />

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
                  title="Continue with Google"
                  variant="outline"
                  onPress={handleGoogleSignIn}
                  loading={loading}
                  disabled={loading || success}
                  style={styles.guestButton}
                  icon={
                    !loading ? (
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
