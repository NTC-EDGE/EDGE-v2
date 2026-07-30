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
  useTheme,
  AnimatedCard,
} from "@edge/ui";
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
    <View style={[styles.desktopShell, { backgroundColor: colors.bg }]}>
      {toastMessage !== null ? (
        <View style={styles.toastWrapper}>
          <AlertToast message={toastMessage} onDismiss={dismissToast} variant="error" />
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.mainLayout}>
          <View style={styles.contentRow}>
            <View style={styles.heroLeftCol}>
              <View
                style={[
                  styles.portalBadge,
                  { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light },
                ]}
              >
                <View style={[styles.badgeDot, { backgroundColor: colors.semantic.success }]} />
                <Text
                  style={[
                    styles.badgeText,
                    { color: isDark ? colors.brand.primary : colors.brand.secondary },
                  ]}
                >
                  NTC Desktop Application Shell
                </Text>
              </View>

              <Text style={[styles.heroTitle, { color: colors.text }]}>
                National Telecommunications Commission
              </Text>

              <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
                Desktop Workstation Client for Multi-Tenant Regional Queue Management, Frequency Spectrum Auditing, and Operations.
              </Text>

              <View
                style={[
                  styles.desktopInfoCard,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : colors.cardBg,
                    borderColor: colors.border,
                  },
                ]}
              >
                <LucideIcon
                  name="monitor"
                  size={24}
                  color={isDark ? colors.brand.primary : colors.brand.secondary}
                />
                <View style={styles.desktopInfoText}>
                  <Text style={[styles.desktopInfoTitle, { color: colors.text }]}>Native Desktop Performance</Text>
                  <Text style={[styles.desktopInfoDesc, { color: colors.textMuted }]}>
                    Optimized for dual-monitor evaluation workflows and keyboard navigation.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.heroRightCol}>
              <View style={styles.ntcLogoWrapper}>
                <NtcLogo size="large" variant={isDark ? "light" : "dark"} showSubtext={false} />
              </View>

              <AnimatedCard
                delay={0}
                padding={0}
                style={{
                  ...styles.loginCard,
                  backgroundColor: colors.cardBg,
                  borderColor: colors.border,
                }}
              >
                <View
                  style={[
                    styles.cardHeaderBar,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.cardHeaderTitle, { color: colors.textMuted }]}>
                    Desktop Staff Authentication
                  </Text>
                  <Text style={[styles.systemStatusText, { color: colors.semantic.success }]}>
                    System Status: Online
                  </Text>
                </View>

                <View style={styles.cardBody}>
                  <Text style={[styles.formTitle, { color: colors.text }]}>Sign In</Text>
                  <Text style={[styles.formSubtitle, { color: colors.textMuted }]}>
                    Enter your staff credentials to open your workstation session.
                  </Text>

                  {/* Isolated Form Component */}
                  <LoginForm
                    loginState={loginState}
                    onForgotPasswordClick={() => setShowForgotPassword(true)}
                  />
                </View>
              </AnimatedCard>
            </View>
          </View>
        </View>

        <Text style={[styles.copyrightText, { color: colors.textMuted }]}>
          © {new Date().getFullYear()} National Telecommunications Commission • Workstation Version 2.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopShell: {
    flex: 1,
  },
  toastWrapper: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    maxWidth: 440,
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
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  heroTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 36,
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: 44,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 28,
  },
  desktopInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  desktopInfoText: {
    flex: 1,
  },
  desktopInfoTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  desktopInfoDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  heroRightCol: {
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
    alignSelf: "center",
  },
  ntcLogoWrapper: {
    marginBottom: 20,
  },
  loginCard: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
  },
  cardHeaderBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeaderTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  systemStatusText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  cardBody: {
    padding: 28,
  },
  formTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 4,
  },
  formSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    marginBottom: 20,
  },
  copyrightText: {
    marginTop: 40,
    textAlign: "center",
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
});
