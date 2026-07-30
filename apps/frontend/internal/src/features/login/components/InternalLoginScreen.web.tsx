import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Modal,
  Platform,
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
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [activePolicy, setActivePolicy] = useState<string | null>(null);

  const loginState = useLoginForm();
  const { toastMessage, dismissToast } = loginState;

  if (showForgotPassword) {
    return <ForgotPasswordScreen onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  return (
    <View style={[styles.webShell, { backgroundColor: colors.bg }]}>
      {/* Background Decorative Mesh & Radial Glows */}
      <View style={styles.glowSpotTopLeft} pointerEvents="none" />
      <View style={styles.glowSpotBottomRight} pointerEvents="none" />

      {toastMessage !== null ? (
        <View style={styles.toastWrapper}>
          <AlertToast message={toastMessage} onDismiss={dismissToast} variant="error" />
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainLayout}>
          <View style={[styles.contentRow, isMobile && styles.contentRowMobile]}>
            {/* Left Hero Column */}
            <View style={[styles.heroLeftCol, isMobile && styles.heroLeftColMobile]}>
              <View style={[styles.portalBadge, isMobile && { alignSelf: "center" }]}>
                <View style={[styles.badgePulseDot, { backgroundColor: colors.semantic.success }]} />
                <Text style={[styles.badgeLabel, { color: isDark ? colors.brand.primary : colors.brand.secondary }]}>
                  OFFICIAL GOV PORTAL • EDGE V2
                </Text>
              </View>

              <Text
                style={[
                  styles.heroTitle,
                  { color: colors.text },
                  isMobile
                    ? styles.heroTitleMobile
                    : isTablet
                    ? styles.heroTitleTablet
                    : null,
                ]}
              >
                National Telecommunications Commission
              </Text>

              <Text style={[styles.heroSubtitle, { color: colors.textMuted }, isMobile && styles.heroSubtitleMobile]}>
                Next-Generation Internal Governance Platform for Multi-Tenant Regional Queue Management, Spectrum Auditing, and Operations.
              </Text>

              {/* Feature Highlights Grid */}
              <View style={styles.featureGrid}>
                <View
                  style={[
                    styles.featureCard,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : colors.cardBg,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.featureIconCircle,
                      { backgroundColor: isDark ? colors.neutral[700] : colors.brand.light },
                    ]}
                  >
                    <LucideIcon name="shield" size={20} color={isDark ? colors.brand.primary : colors.brand.secondary} />
                  </View>
                  <View style={styles.featureTextWrapper}>
                    <Text style={[styles.featureCardTitle, { color: colors.text }]}>RBAC & Tenant Isolation</Text>
                    <Text style={[styles.featureCardDesc, { color: colors.textMuted }]}>
                      Strict Regional Office boundary enforcement & encryption.
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.featureCard,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : colors.cardBg,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.featureIconCircle,
                      { backgroundColor: colors.semantic.successBg },
                    ]}
                  >
                    <LucideIcon name="zap" size={20} color={colors.semantic.success} />
                  </View>
                  <View style={styles.featureTextWrapper}>
                    <Text style={[styles.featureCardTitle, { color: colors.text }]}>Automated Audit Workflows</Text>
                    <Text style={[styles.featureCardDesc, { color: colors.textMuted }]}>
                      Real-time licensing evaluation queues & activity feeds.
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.featureCard,
                    {
                      backgroundColor: isDark ? colors.neutral[800] : colors.cardBg,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.featureIconCircle,
                      { backgroundColor: colors.semantic.warningBg },
                    ]}
                  >
                    <LucideIcon name="cpu" size={20} color={colors.semantic.warning} />
                  </View>
                  <View style={styles.featureTextWrapper}>
                    <Text style={[styles.featureCardTitle, { color: colors.text }]}>Spectrum Telemetry Integration</Text>
                    <Text style={[styles.featureCardDesc, { color: colors.textMuted }]}>
                      Direct telemetry monitoring for frequency allocation.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Right Form Glass Card Column (enforced maxWidth: 440) */}
            <View style={styles.heroRightCol}>
              <View style={styles.ntcLogoWrapper}>
                <NtcLogo size={isMobile ? "medium" : "large"} variant={isDark ? "light" : "dark"} showSubtext={false} />
              </View>

              <AnimatedCard
                delay={0}
                padding={0}
                style={{
                  ...styles.loginGlassCard,
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
                  <View style={styles.windowControls}>
                    <View style={[styles.controlDot, { backgroundColor: colors.semantic.error }]} />
                    <View style={[styles.controlDot, { backgroundColor: colors.semantic.warning }]} />
                    <View style={[styles.controlDot, { backgroundColor: colors.semantic.success }]} />
                  </View>
                  <Text style={[styles.cardHeaderBadgeText, { color: colors.textMuted }]}>
                    Staff Login • Web Platform
                  </Text>
                </View>

                <View style={[styles.cardMainBody, isMobile && { padding: 20 }]}>
                  <Text style={[styles.formMainHeading, { color: colors.text }]}>Sign In to Workstation</Text>
                  <Text style={[styles.formSubHeading, { color: colors.textMuted }]}>
                    Enter your staff credentials or continue with Google SSO.
                  </Text>

                  {/* Isolated Form Component */}
                  <LoginForm
                    loginState={loginState}
                    onForgotPasswordClick={() => setShowForgotPassword(true)}
                  />

                  <View
                    style={[
                      styles.securityBox,
                      { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light },
                    ]}
                  >
                    <LucideIcon
                      name="shield"
                      size={14}
                      color={isDark ? colors.brand.primary : colors.brand.secondary}
                    />
                    <Text
                      style={[
                        styles.securityText,
                        { color: isDark ? colors.brand.primary : colors.brand.secondary },
                      ]}
                    >
                      Authorized NTC Staff Portal • TLS 1.3 Encrypted Session
                    </Text>
                  </View>
                </View>
              </AnimatedCard>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerWrap}>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => setActivePolicy("User Agreement")}>
              <Text style={[styles.footerLinkItem, { color: colors.textMuted }]}>User Agreement</Text>
            </TouchableOpacity>
            <Text style={[styles.footerBullet, { color: colors.textMuted }]}>•</Text>
            <TouchableOpacity onPress={() => setActivePolicy("Privacy Policy")}>
              <Text style={[styles.footerLinkItem, { color: colors.textMuted }]}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={[styles.footerBullet, { color: colors.textMuted }]}>•</Text>
            <TouchableOpacity onPress={() => setActivePolicy("Cookie Policy")}>
              <Text style={[styles.footerLinkItem, { color: colors.textMuted }]}>Cookie Policy</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.copyRightNotice, { color: colors.textMuted }]}>
            © {new Date().getFullYear()} National Telecommunications Commission • All Rights Reserved
          </Text>
        </View>
      </ScrollView>

      {/* Policy Modal */}
      {activePolicy !== null ? (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { backgroundColor: colors.cardBg }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{activePolicy}</Text>
                <TouchableOpacity onPress={() => setActivePolicy(null)} style={{ padding: 4 }}>
                  <LucideIcon name="x" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.modalBody, { color: colors.textMuted }]}>
                Official policy guidelines for the National Telecommunications Commission (NTC) EDGE Portal. Access is strictly granted for authorized government personnel and evaluated licensing actions.
              </Text>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  webShell: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
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
  glowSpotTopLeft: {
    position: "absolute",
    top: -150,
    left: -150,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: "rgba(37, 99, 235, 0.15)",
    ...Platform.select({ web: { filter: "blur(110px)" } }),
  },
  glowSpotBottomRight: {
    position: "absolute",
    bottom: -150,
    right: -150,
    width: 550,
    height: 550,
    borderRadius: 275,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    ...Platform.select({ web: { filter: "blur(120px)" } }),
  },
  mainLayout: {
    paddingHorizontal: 24,
    paddingTop: 48,
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
  contentRowMobile: {
    flexDirection: "column",
    gap: 32,
  },
  heroLeftCol: {
    flex: 1,
    maxWidth: 560,
  },
  heroLeftColMobile: {
    maxWidth: "100%",
    alignItems: "center",
  },
  portalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(37, 99, 235, 0.12)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  badgePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 38,
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: 46,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  heroTitleTablet: {
    fontSize: 32,
    lineHeight: 40,
  },
  heroTitleMobile: {
    fontSize: 26,
    lineHeight: 34,
    textAlign: "center",
  },
  heroSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 32,
  },
  heroSubtitleMobile: {
    textAlign: "center",
  },
  featureGrid: {
    gap: 16,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  featureIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  featureTextWrapper: {
    flex: 1,
  },
  featureCardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  featureCardDesc: {
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
  loginGlassCard: {
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
  windowControls: {
    flexDirection: "row",
    gap: 6,
  },
  controlDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardHeaderBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  cardMainBody: {
    padding: 28,
  },
  formMainHeading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 4,
  },
  formSubHeading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    marginBottom: 20,
  },
  securityBox: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  securityText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  footerWrap: {
    marginTop: 60,
    alignItems: "center",
    gap: 12,
  },
  footerLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  footerLinkItem: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  footerBullet: {
    fontSize: 12,
  },
  copyRightNotice: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modalBody: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    lineHeight: 22,
  },
});
