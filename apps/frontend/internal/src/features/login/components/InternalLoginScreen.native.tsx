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
import { TYPOGRAPHY, AlertToast } from "@edge/ui";
import { NtcLogo } from "./NtcLogo";
import { useLoginForm } from "../hooks/useLoginForm";
import { LoginForm } from "../forms/LoginForm";
import { ForgotPasswordScreen } from "./ForgotPasswordScreen";

export function InternalLoginScreenNative() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const loginState = useLoginForm();
  const { toastMessage, dismissToast } = loginState;

  if (showForgotPassword) {
    return <ForgotPasswordScreen onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  return (
    <SafeAreaView style={styles.nativeSafeArea}>
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
              <NtcLogo size="medium" variant="light" showSubtext={false} />
              <View style={styles.badgePill}>
                <View style={styles.pulseDot} />
                <Text style={styles.badgeText}>Internal Mobile Access</Text>
              </View>
            </View>

            <View style={styles.loginCard}>
              <Text style={styles.cardHeading}>Staff Sign In</Text>
              <Text style={styles.cardSubHeading}>
                Sign in with official credentials or Google SSO.
              </Text>

              <LoginForm
                loginState={loginState}
                onForgotPasswordClick={() => setShowForgotPassword(true)}
              />
            </View>

            <Text style={styles.copyrightText}>
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
    backgroundColor: "#0B132B",
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#93C5FD",
  },
  loginCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
    marginBottom: 4,
  },
  cardSubHeading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#64748B",
    marginBottom: 16,
  },
  copyrightText: {
    marginTop: 32,
    textAlign: "center",
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
  },
});
