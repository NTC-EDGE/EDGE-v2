import { styles } from './ForgotPasswordScreen.styles';
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

interface ForgotPasswordScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
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

    // Breathing background glow
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
    setEmailError("");
    if (email.trim().length === 0) {
      setEmailError("Email address is required");
      return false;
    } else if (!email.includes("@")) {
      setEmailError('Please enter a valid email containing "@"');
      return false;
    }
    return true;
  };

  const handlePasswordReset = () => {
    if (!validate()) return;

    setLoading(true);
    // Simulate recovery request
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
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
            {/* Header Logo */}
            <View style={styles.logoWrapper}>
              <Logo />
            </View>

            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you instructions to reset your
              password.
            </Text>

            {success ? (
              <View style={styles.successWrapper}>
                <View style={styles.successBox}>
                  <Lucide
                    name="mail"
                    size={24}
                    color={COLORS.semantic.success}
                    style={styles.successIcon}
                  />
                  <Text style={styles.successText}>
                    Reset instructions have been sent to: {"\n"}
                    <Text style={styles.boldText}>{email}</Text>
                  </Text>
                </View>
                <Button
                  title="Return to Sign In"
                  onPress={() => navigation.navigate("Login")}
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
                  title={
                    loading
                      ? "Sending Instructions..."
                      : "Send Reset Instructions"
                  }
                  onPress={handlePasswordReset}
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
                  onPress={() => navigation.navigate("Login")}
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
