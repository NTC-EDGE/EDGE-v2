import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { TYPOGRAPHY, AlertToast, useTheme, AnimatedCard } from "@edge/ui";
import { NtcLogo } from "./NtcLogo";
import { useLoginForm } from "../hooks/useLoginForm";
import { LoginForm } from "../forms/LoginForm";
import { ForgotPasswordScreen } from "./ForgotPasswordScreen";

export function InternalLoginScreen(): React.ReactElement {
  const { colors, isDark } = useTheme();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const loginState = useLoginForm();
  const { toastMessage, dismissToast } = loginState;

  if (showForgotPassword) {
    return <ForgotPasswordScreen onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  return (
    <SafeAreaView style={[styles.nativeSafeArea, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {toastMessage !== null ? (
          <View style={styles.toastWrapper}>
            <AlertToast message={toastMessage} onDismiss={dismissToast} variant="error" />
          </View>
        ) : null}

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.logoHeader}>
              <NtcLogo size="medium" variant={isDark ? "light" : "dark"} showSubtext={false} />
              <View
                style={[
                  styles.badgePill,
                  { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light },
                ]}
              >
                <View style={[styles.pulseDot, { backgroundColor: colors.semantic.success }]} />
                <Text
                  style={[
                    styles.badgeText,
                    { color: isDark ? colors.brand.primary : colors.brand.secondary },
                  ]}
                >
                  Internal Mobile Access
                </Text>
              </View>
            </View>

            <AnimatedCard
              delay={0}
              padding={24}
              style={{
                ...styles.loginCard,
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
              }}
            >
              <Text style={[styles.cardHeading, { color: colors.text }]}>Staff Sign In</Text>
              <Text style={[styles.cardSubHeading, { color: colors.textMuted }]}>
                Sign in with official credentials or Google SSO.
              </Text>

              <LoginForm
                loginState={loginState}
                onForgotPasswordClick={() => setShowForgotPassword(true)}
              />
            </AnimatedCard>

            <Text style={[styles.copyrightText, { color: colors.textMuted }]}>
              © {new Date().getFullYear()} National Telecommunications Commission
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nativeSafeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  toastWrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 999,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxWidth: 440,
    width: "100%",
    alignSelf: "center",
  },
  logoHeader: {
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  loginCard: {
    borderRadius: 16,
    borderWidth: 1,
  },
  cardHeading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 4,
  },
  cardSubHeading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    marginBottom: 16,
  },
  copyrightText: {
    marginTop: 32,
    textAlign: "center",
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
});
