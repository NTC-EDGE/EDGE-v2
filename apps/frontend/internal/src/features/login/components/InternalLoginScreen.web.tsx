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
  COLORS,
  TYPOGRAPHY,
  AlertToast,
  Icon as LucideIcon,
} from "@edge/ui";
import { NtcLogo } from "./NtcLogo";
import { useLoginForm } from "../hooks/useLoginForm";
import { LoginForm } from "../forms/LoginForm";
import { ForgotPasswordScreen } from "./ForgotPasswordScreen";

export function InternalLoginScreen() {
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
    <View style={styles.webShell}>
      {toastMessage !== null ? (
        <View style={styles.toastWrapper}>
          <AlertToast message={toastMessage} onDismiss={dismissToast} variant="error" />
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.glowSpotLeft} pointerEvents="none" />
        <View style={styles.glowSpotRight} pointerEvents="none" />

        <View style={styles.mainLayout}>
          <View style={[styles.contentRow, isMobile && styles.contentRowMobile]}>
            <View style={[styles.heroLeftCol, isMobile && styles.heroLeftColMobile]}>
              <View style={[styles.portalBadge, isMobile && { alignSelf: "center" }]}>
                <View style={styles.badgePulseDot} />
                <Text style={styles.badgeLabel}>Official Government Portal</Text>
              </View>

              <Text
                style={[
                  styles.heroTitle,
                  isMobile
                    ? styles.heroTitleMobile
                    : isTablet
                    ? styles.heroTitleTablet
                    : null,
                ]}
              >
                NTC Electronic Data Governance Portal
              </Text>

              <Text style={[styles.heroSubtitle, isMobile && styles.heroSubtitleMobile]}>
                Unified internal platform for National Telecommunications Commission staff authentication, regional licensing evaluation, and multi-tenant administration.
              </Text>

              <View style={styles.featureGrid}>
                <View style={styles.featureCard}>
                  <View style={styles.featureIconCircle}>
                    <LucideIcon name="shield" size={20} color="#60A5FA" />
                  </View>
                  <View style={styles.featureTextWrapper}>
                    <Text style={styles.featureCardTitle}>RBAC & Tenant Isolation</Text>
                    <Text style={styles.featureCardDesc}>Strict Regional Office boundary enforcement.</Text>
                  </View>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureIconCircle}>
                    <LucideIcon name="zap" size={20} color="#34D399" />
                  </View>
                  <View style={styles.featureTextWrapper}>
                    <Text style={styles.featureCardTitle}>Automated Audit Logs</Text>
                    <Text style={styles.featureCardDesc}>Complete compliance tracking & evaluation queues.</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.heroRightCol}>
              <View style={styles.ntcLogoWrapper}>
                <NtcLogo size={isMobile ? "medium" : "large"} variant="light" showSubtext={false} />
              </View>

              <View style={styles.loginGlassCard}>
                <View style={styles.cardHeaderBar}>
                  <View style={styles.windowControls}>
                    <View style={[styles.controlDot, { backgroundColor: "#EF4444" }]} />
                    <View style={[styles.controlDot, { backgroundColor: "#F59E0B" }]} />
                    <View style={[styles.controlDot, { backgroundColor: "#10B981" }]} />
                  </View>
                  <Text style={styles.cardHeaderBadgeText}>Staff Login • Web Platform</Text>
                </View>

                <View style={[styles.cardMainBody, isMobile && { padding: 20 }]}>
                  <Text style={styles.formMainHeading}>Sign In to NTC-EDGE</Text>
                  <Text style={styles.formSubHeading}>
                    Enter your staff credentials or continue with Google SSO.
                  </Text>

                  {/* Isolated Form Component */}
                  <LoginForm
                    loginState={loginState}
                    onForgotPasswordClick={() => setShowForgotPassword(true)}
                  />

                  <View style={styles.securityBox}>
                    <LucideIcon name="shield" size={14} color="#2563EB" />
                    <Text style={styles.securityText}>
                      Authorized NTC Staff Portal • Encrypted TLS 1.3 Session
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footerWrap}>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => setActivePolicy("User Agreement")}>
              <Text style={styles.footerLinkItem}>User Agreement</Text>
            </TouchableOpacity>
            <Text style={styles.footerBullet}>•</Text>
            <TouchableOpacity onPress={() => setActivePolicy("Privacy Policy")}>
              <Text style={styles.footerLinkItem}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.footerBullet}>•</Text>
            <TouchableOpacity onPress={() => setActivePolicy("Cookie Policy")}>
              <Text style={styles.footerLinkItem}>Cookie Policy</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.copyRightNotice}>
            © {new Date().getFullYear()} National Telecommunications Commission • All Rights Reserved
          </Text>
        </View>
      </ScrollView>

      {activePolicy !== null ? (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{activePolicy}</Text>
                <TouchableOpacity onPress={() => setActivePolicy(null)} style={{ padding: 4 }}>
                  <LucideIcon name="x" size={20} color={COLORS.neutral[500]} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalBody}>
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
    backgroundColor: "#0B132B",
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
    maxWidth: 520,
    alignSelf: "center",
    zIndex: 999,
  },
  glowSpotLeft: {
    position: "absolute",
    top: -120,
    left: -120,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: "rgba(37, 99, 235, 0.25)",
    ...Platform.select({ web: { filter: "blur(90px)" } }),
  },
  glowSpotRight: {
    position: "absolute",
    bottom: -120,
    right: -120,
    width: 480,
    height: 480,
    borderRadius: 240,
    backgroundColor: "rgba(59, 130, 246, 0.18)",
    ...Platform.select({ web: { filter: "blur(100px)" } }),
  },
  mainLayout: {
    paddingHorizontal: 24,
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
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  badgePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  badgeLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#93C5FD",
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 36,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#FFFFFF",
    lineHeight: 44,
    marginBottom: 16,
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
    color: "#94A3B8",
    lineHeight: 24,
    marginBottom: 28,
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
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  featureIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(37, 99, 235, 0.15)",
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
    color: "#F8FAFC",
  },
  featureCardDesc: {
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
  loginGlassCard: {
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
    color: "#64748B",
  },
  cardMainBody: {
    padding: 28,
  },
  formMainHeading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
    marginBottom: 4,
  },
  formSubHeading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#64748B",
    marginBottom: 20,
  },
  securityBox: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  securityText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "#1E40AF",
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
    color: "#94A3B8",
  },
  footerBullet: {
    color: "#475569",
    fontSize: 12,
  },
  copyRightNotice: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
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
    maxWidth: 500,
    backgroundColor: "#FFFFFF",
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
    color: "#0F172A",
  },
  modalBody: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
  },
});
