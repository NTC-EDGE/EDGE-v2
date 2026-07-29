import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import {
  TYPOGRAPHY,
  AlertToast,
  Icon as LucideIcon,
} from "@edge/ui";
import { NtcLogo } from "./NtcLogo";
import { useLoginForm } from "../hooks/useLoginForm";
import { LoginForm } from "../forms/LoginForm";
import { ForgotPasswordScreen } from "./ForgotPasswordScreen";

export function InternalLoginScreenDesktop() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const loginState = useLoginForm();
  const { toastMessage, dismissToast } = loginState;

  if (showForgotPassword) {
    return <ForgotPasswordScreen onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  return (
    <View style={styles.desktopShell}>
      {toastMessage !== null ? (
        <View style={styles.toastWrapper}>
          <AlertToast message={toastMessage} onDismiss={dismissToast} variant="error" />
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.mainLayout}>
          <View style={styles.contentRow}>
            <View style={styles.heroLeftCol}>
              <View style={styles.portalBadge}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeText}>NTC Desktop Application Shell</Text>
              </View>

              <Text style={styles.heroTitle}>
                National Telecommunications Commission
              </Text>

              <Text style={styles.heroSubtitle}>
                Desktop Workstation Client for Multi-Tenant Regional Queue Management, Frequency Spectrum Auditing, and Operations.
              </Text>

              <View style={styles.desktopInfoCard}>
                <LucideIcon name="monitor" size={24} color="#60A5FA" />
                <View style={styles.desktopInfoText}>
                  <Text style={styles.desktopInfoTitle}>Native Desktop Performance</Text>
                  <Text style={styles.desktopInfoDesc}>Optimized for dual-monitor evaluation workflows and keyboard navigation.</Text>
                </View>
              </View>
            </View>

            <View style={styles.heroRightCol}>
              <View style={styles.ntcLogoWrapper}>
                <NtcLogo size="large" variant="light" showSubtext={false} />
              </View>

              <View style={styles.loginCard}>
                <View style={styles.cardHeaderBar}>
                  <Text style={styles.cardHeaderTitle}>Desktop Staff Authentication</Text>
                  <Text style={styles.systemStatusText}>System Status: Online</Text>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.formTitle}>Sign In</Text>
                  <Text style={styles.formSubtitle}>
                    Enter your staff credentials to open your workstation session.
                  </Text>

                  {/* Isolated Form Component */}
                  <LoginForm
                    loginState={loginState}
                    onForgotPasswordClick={() => setShowForgotPassword(true)}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.copyrightText}>
          © {new Date().getFullYear()} National Telecommunications Commission • Workstation Version 2.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopShell: {
    flex: 1,
    backgroundColor: "#0B132B",
  },
  toastWrapper: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    maxWidth: 520,
    alignSelf: "center",
    zIndex: 999,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  mainLayout: {
    paddingHorizontal: 40,
    paddingTop: 40,
    alignItems: "center",
  },
  contentRow: {
    width: "100%",
    maxWidth: 1200,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 48,
  },
  heroLeftCol: {
    flex: 1,
    maxWidth: 560,
  },
  portalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#93C5FD",
  },
  heroTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 36,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#FFFFFF",
    lineHeight: 44,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    color: "#94A3B8",
    lineHeight: 24,
    marginBottom: 28,
  },
  desktopInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  desktopInfoText: {
    flex: 1,
  },
  desktopInfoTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#F8FAFC",
  },
  desktopInfoDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
  },
  heroRightCol: {
    width: "100%",
    maxWidth: 460,
    alignItems: "center",
  },
  ntcLogoWrapper: {
    marginBottom: 20,
  },
  loginCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeaderBar: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeaderTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#64748B",
  },
  systemStatusText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "#10B981",
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  cardBody: {
    padding: 28,
  },
  formTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
    marginBottom: 4,
  },
  formSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#64748B",
    marginBottom: 20,
  },
  copyrightText: {
    marginTop: 40,
    textAlign: "center",
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
  },
});
