import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
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
  RADIUS,
  TYPOGRAPHY,
} from "../../shared/theme/tokens";
import { Input } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import { Logo } from "../../shared/components/Logo";
import { useGuestAuth } from "../context/GuestAuthContext";
import { Select } from "../../shared/components/Select";
import { PHILIPPINE_REGIONS } from "../../shared/constants/regions";

interface LoginScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export function LoginScreen({ navigation }: LoginScreenProps) {
  const { loginAsGuest } = useGuestAuth();
  const [region, setRegion] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");

  // Validation errors
  const [regionError, setRegionError] = useState("");
  const [phoneOrEmailError, setPhoneOrEmailError] = useState("");
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
    ]).start();

    // Subtle background glow breathing effect
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
    ).start();
  }, [cardFade, cardSlide, glowAnim]);

  const validate = (): boolean => {
    let isValid = true;
    setRegionError("");
    setPhoneOrEmailError("");
    setPasswordError("");
    setGeneralError("");

    if (region.length === 0) {
      setRegionError("Philippine region is required");
      isValid = false;
    }

    const trimmedIdentifier = phoneOrEmail.trim();
    if (trimmedIdentifier.length === 0) {
      setPhoneOrEmailError("Phone number or email address is required");
      isValid = false;
    } else if (trimmedIdentifier.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedIdentifier)) {
        setPhoneOrEmailError("Please enter a valid email address");
        isValid = false;
      }
    } else {
      const sanitizedPhone = trimmedIdentifier.replace(/\s+/g, "");
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(sanitizedPhone)) {
        setPhoneOrEmailError(
          "Please enter a valid phone number or email address",
        );
        isValid = false;
      }
    }

    if (password.length === 0) {
      setPasswordError("Password is required");
      isValid = false;
    }

    return isValid;
  };

  const handleSignIn = () => {
    if (!validate()) return;

    setLoading(true);
    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      // Simulate redirection
      setTimeout(() => {
        loginAsGuest();
      }, 1000);
    }, 1500);
  };

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05],
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Animated background glows */}
        <Animated.View
          style={[
            styles.bgGlow,
            { transform: [{ scale: glowScale }] },
            Platform.OS === "web"
              ? ({ filter: "blur(100px)" } as any)
              : { opacity: 0.12 },
          ]}
        />

        <View style={styles.outerContainer}>
          {/* Back to landing */}
          <Button
            title="Back to Landing Page"
            variant="text"
            size="sm"
            onPress={() => navigation.navigate("Landing")}
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
            {/* Header and Brand */}
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
                <Select
                  label="Philippine Region"
                  placeholder="Select administrative region..."
                  value={region}
                  onValueChange={setRegion}
                  options={PHILIPPINE_REGIONS.map((reg) => ({
                    label: reg,
                    value: reg,
                  }))}
                  error={regionError}
                  iconName="map-pin"
                />

                <Input
                  label="Phone No. / Email Address"
                  placeholder="e.g. 09171234567 or email@domain.com"
                  value={phoneOrEmail}
                  onChangeText={setPhoneOrEmail}
                  error={phoneOrEmailError}
                  keyboardType="default"
                  autoCapitalize="none"
                  iconName="user"
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
                  onPress={() => navigation.navigate("ForgotPassword")}
                  style={styles.forgotButton}
                  textStyle={styles.forgotText}
                />

                <Button
                  title={loading ? "Verifying Credentials..." : "Sign In"}
                  onPress={handleSignIn}
                  loading={loading}
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

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  title="Continue as Guest"
                  variant="outline"
                  onPress={loginAsGuest}
                  style={styles.guestButton}
                  icon={
                    <Lucide name="user" size={16} color={COLORS.brand[800]} />
                  }
                />

                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>New to EDGE? </Text>
                  <Button
                    title="Create an account"
                    variant="text"
                    size="sm"
                    onPress={() => navigation.navigate("SignUp")}
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

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: SPACING[20],
    position: "relative",
  },
  bgGlow: {
    position: "absolute",
    top: "30%",
    left: "25%",
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "#7392FF",
    opacity: 0.15,
    zIndex: -1,
  },
  outerContainer: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    zIndex: 1,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: SPACING[16],
  },
  backButtonText: {
    color: COLORS.neutral[600],
    textDecorationLine: "none",
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.glass.bg,
    borderColor: COLORS.glass.border,
    borderWidth: 1.5,
    borderRadius: RADIUS.dialog,
    padding: SPACING[32],
    width: "100%",
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: SPACING[24],
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[500],
    textAlign: "center",
    marginBottom: SPACING[24],
  },
  form: {
    width: "100%",
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: SPACING[20],
  },
  forgotText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    color: COLORS.brand[800],
    textDecorationLine: "none",
  },
  submitButton: {
    width: "100%",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING[20],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.neutral[200],
  },
  dividerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[400],
    paddingHorizontal: SPACING[12],
    textTransform: "uppercase",
  },
  guestButton: {
    width: "100%",
    borderColor: COLORS.neutral[300],
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING[24],
  },
  footerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  footerLink: {
    fontSize: 14,
    color: COLORS.brand[800],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  generalError: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.semantic.error,
    backgroundColor: COLORS.semantic.errorBg,
    borderColor: COLORS.semantic.errorBorder,
    borderWidth: 1,
    borderRadius: RADIUS.input,
    padding: SPACING[12],
    textAlign: "center",
    marginBottom: SPACING[16],
  },
  successBox: {
    backgroundColor: COLORS.semantic.successBg,
    borderColor: COLORS.semantic.successBorder,
    borderWidth: 1,
    borderRadius: RADIUS.input,
    padding: SPACING[20],
    marginVertical: SPACING[20],
    alignItems: "center",
  },
  successIcon: {
    marginBottom: SPACING[8],
  },
  successText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.semantic.success,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: "center",
  },
});
