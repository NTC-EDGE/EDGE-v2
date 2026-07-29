import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  useWindowDimensions,
  Modal,
  TextInput,
} from "react-native";
import {
  COLORS,
  SPACING,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
} from "@edge/ui";
import { useOAuth } from "@clerk/expo";
import { parseApiError } from "@edge/api";
import { NtcLogo } from "./NtcLogo";
import { useAuthContext } from "../../auth/context/AuthContext";
import { ForgotPasswordPage } from "./ForgotPasswordPage";

interface FooterPolicySection {
  title: string;
  body: string;
  highlight?: string;
}

interface FooterPolicyContent {
  title: string;
  intro: string;
  sections: FooterPolicySection[];
}

const FOOTER_POLICIES: Record<string, FooterPolicyContent> = {
  "user-agreement": {
    title: "User Agreement",
    intro:
      "Welcome to the EDGE Portal. This User Agreement governs your access to and use of all services provided by the National Telecommunications Commission (NTC) via this platform.",
    sections: [
      {
        title: "1. Acceptance of Terms",
        body: "By accessing or using the EDGE Portal, you agree to be bound by these terms and all policies incorporated herein. If you do not agree, you must cease use immediately.",
      },
      {
        title: "2. User Obligations",
        body: "You agree to use the portal only for lawful purposes related to NTC services. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
      },
      {
        title: "3. Termination",
        body: "The NTC reserves the right to suspend or terminate your account and access to the service for any breach of this agreement without prior notice.",
      },
    ],
  },
  "privacy-policy": {
    title: "Privacy Policy",
    intro:
      "Your privacy is important to us. This policy outlines how the NTC collects, uses, and protects the personal and application data you provide through the EDGE Portal.",
    sections: [
      {
        title: "1. Data Collection",
        body: "We collect personal information (e.g., name, address, contact details) and transactional data related to your applications and requests required for NTC services.",
      },
      {
        title: "2. Use of Data",
        body: "The collected data is used exclusively for processing NTC services, verifying identities, internal reporting, and improving the portal's functionality, in accordance with applicable Philippine data privacy laws.",
      },
      {
        title: "3. Data Security",
        body: "We implement technical and organizational measures to safeguard your data against unauthorized access, disclosure, alteration, and destruction.",
      },
    ],
  },
  "community-guidelines": {
    title: "Community Guidelines",
    intro:
      "These guidelines promote a safe and productive environment for all users of the EDGE Portal, especially when utilizing public-facing features like feedback forums or communication channels.",
    sections: [
      {
        title: "1. Respectful Conduct",
        body: "All interactions must be respectful, professional, and courteous. Hate speech, harassment, threats, or discrimination are strictly prohibited.",
      },
      {
        title: "2. Truthfulness",
        body: "Do not submit false, misleading, or fraudulent information in any application or communication within the portal. Accuracy and honesty are mandatory.",
      },
      {
        title: "3. Prohibited Content",
        body: "Do not upload or share content that is illegal, defamatory, obscene, or violates the intellectual property rights of others. Violations may lead to account suspension and legal action.",
      },
    ],
  },
  "cookie-policy": {
    title: "Cookie Policy",
    intro:
      "This portal uses cookies to ensure optimal performance and user experience. By continuing to use the EDGE Portal, you consent to the use of cookies.",
    sections: [
      {
        title: "1. What are Cookies?",
        body: "Cookies are small text files stored on your device that help us remember your preferences and settings, and analyze how you interact with our services.",
      },
      {
        title: "2. Types of Cookies Used",
        body: "• Essential Cookies: Necessary for the website to function securely (e.g., managing your session).\n• Performance Cookies: Used for analytics to improve the portal's speed and reliability.",
      },
      {
        title: "3. Managing Cookies",
        body: "You may control and/or delete cookies as you wish. Please note that disabling essential cookies may affect the functionality of the EDGE Portal.",
      },
    ],
  },
};

const DEMO_PRESETS = [
  { label: "Admin Evaluator", email: "evaluator@ntc.gov.ph" },
  { label: "Regional Staff", email: "staff.ncr@ntc.gov.ph" },
  { label: "System Admin", email: "admin@ntc.gov.ph" },
];

export function InternalLoginPage() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const { loginWithClerk } = useAuthContext();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<"identifier" | "password" | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeFooterModal, setActiveFooterModal] = useState<FooterPolicyContent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  if (showForgotPassword) {
    return <ForgotPasswordPage onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  const triggerToastError = (msg: string) => {
    const trimmed = parseApiError(msg);
    setToastMessage(trimmed);
  };

  const dismissToast = () => {
    setToastMessage(null);
  };

  const validateForm = (): boolean => {
    const errors: { identifier?: string; password?: string } = {};
    if (identifier.trim().length === 0) {
      errors.identifier = "Email address or username is required.";
    }
    if (password.length === 0) {
      errors.password = "Password is required.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setToastMessage(null);
    setIsSubmitting(true);

    try {
      await loginWithClerk(identifier.trim(), password);
    } catch (err: unknown) {
      triggerToastError(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setToastMessage(null);
    setIsGoogleSubmitting(true);
    try {
      const res = await startOAuthFlow();
      if (res !== null && res !== undefined && res.createdSessionId && typeof res.setActive === "function") {
        await res.setActive({ session: res.createdSessionId });
      }
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      triggerToastError(parseApiError(err));
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleApplyPreset = (email: string) => {
    setIdentifier(email);
    setPassword("NtcStaff123!");
    setFieldErrors({});
    setToastMessage(null);
  };

  return (
    <View style={styles.outerShell}>
      {/* Toast Error Alert */}
      {toastMessage !== null ? (
        <View style={styles.toastContainer}>
          <View style={styles.toastIconWrapper}>
            <Lucide name="alert-circle" size={20} color="#EF4444" />
          </View>
          <Text style={styles.toastText}>{toastMessage}</Text>
          <TouchableOpacity onPress={dismissToast} style={styles.toastCloseBtn} activeOpacity={0.7}>
            <Lucide name="x" size={16} color={COLORS.neutral[500]} />
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Decorative Ambient Radial Glow */}
        <View style={styles.glowSpotLeft} pointerEvents="none" />
        <View style={styles.glowSpotRight} pointerEvents="none" />

        <View style={styles.mainLayout}>
          <View style={[styles.contentRow, isMobile && styles.contentRowMobile]}>
            
            {/* Left Hero Column */}
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

              {/* Feature Showcase */}
              <View style={styles.featureGrid}>
                <View style={styles.featureCard}>
                  <View style={styles.featureIconCircle}>
                    <Lucide name="shield" size={20} color="#60A5FA" />
                  </View>
                  <View style={styles.featureTextWrapper}>
                    <Text style={styles.featureCardTitle}>RBAC & Tenant Isolation</Text>
                    <Text style={styles.featureCardDesc}>Strict Regional Office boundary enforcement.</Text>
                  </View>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureIconCircle}>
                    <Lucide name="zap" size={20} color="#34D399" />
                  </View>
                  <View style={styles.featureTextWrapper}>
                    <Text style={styles.featureCardTitle}>Automated Audit Logs</Text>
                    <Text style={styles.featureCardDesc}>Complete compliance tracking & evaluation queues.</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Right Login Glass Form Card */}
            <View style={styles.heroRightCol}>
              <View style={styles.ntcLogoWrapper}>
                <NtcLogo size={isMobile ? "medium" : "large"} variant="light" showSubtext={false} />
              </View>

              <View style={[styles.loginGlassCard, SHADOWS.modal]}>
                <View style={styles.cardHeaderBar}>
                  <View style={styles.windowControls}>
                    <View style={[styles.controlDot, { backgroundColor: "#EF4444" }]} />
                    <View style={[styles.controlDot, { backgroundColor: "#F59E0B" }]} />
                    <View style={[styles.controlDot, { backgroundColor: "#10B981" }]} />
                  </View>
                  <Text style={styles.cardHeaderBadgeText}>Staff Login</Text>
                </View>

                <View style={[styles.cardMainBody, isMobile && { padding: 20 }]}>
                  <Text style={styles.formMainHeading}>Sign In to NTC-EDGE</Text>
                  <Text style={styles.formSubHeading}>
                    Enter your staff credentials or continue with Google SSO.
                  </Text>

                  {/* Demo Account Quick Presets */}
                  <View style={styles.demoPresetsContainer}>
                    <Text style={styles.demoPresetsTitle}>QUICK FILL DEMO ACCOUNT</Text>
                    <View style={styles.presetsPillRow}>
                      {DEMO_PRESETS.map((preset) => (
                        <TouchableOpacity
                          key={preset.email}
                          style={styles.presetPill}
                          onPress={() => handleApplyPreset(preset.email)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.presetPillText}>{preset.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Identifier Input */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Email Address or Username</Text>
                    <View
                      style={[
                        styles.inputBox,
                        focusedField === "identifier" && styles.inputBoxFocused,
                        fieldErrors.identifier !== undefined && styles.inputBoxError,
                      ]}
                    >
                      <Lucide
                        name="user"
                        size={18}
                        color={
                          fieldErrors.identifier !== undefined
                            ? "#EF4444"
                            : focusedField === "identifier"
                            ? "#1E3A8A"
                            : COLORS.neutral[400]
                        }
                        style={styles.fieldIconLeft}
                      />
                      <TextInput
                        style={styles.inputFieldText}
                        placeholder="staff@ntc.gov.ph"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={identifier}
                        onChangeText={(val) => {
                          setIdentifier(val);
                          if (fieldErrors.identifier) setFieldErrors({ ...fieldErrors, identifier: undefined });
                        }}
                        onFocus={() => setFocusedField("identifier")}
                        onBlur={() => setFocusedField(null)}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>
                    {fieldErrors.identifier !== undefined ? (
                      <Text style={styles.fieldErrorText}>{fieldErrors.identifier}</Text>
                    ) : null}
                  </View>

                  {/* Password Input */}
                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Password</Text>
                    <View
                      style={[
                        styles.inputBox,
                        focusedField === "password" && styles.inputBoxFocused,
                        fieldErrors.password !== undefined && styles.inputBoxError,
                      ]}
                    >
                      <Lucide
                        name="lock"
                        size={18}
                        color={
                          fieldErrors.password !== undefined
                            ? "#EF4444"
                            : focusedField === "password"
                            ? "#1E3A8A"
                            : COLORS.neutral[400]
                        }
                        style={styles.fieldIconLeft}
                      />
                      <TextInput
                        style={styles.inputFieldText}
                        placeholder="••••••••"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={password}
                        onChangeText={(val) => {
                          setPassword(val);
                          if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
                        }}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeToggleTouch}
                        activeOpacity={0.7}
                      >
                        <Lucide
                          name={showPassword ? "eye-off" : "eye"}
                          size={18}
                          color={COLORS.neutral[400]}
                        />
                      </TouchableOpacity>
                    </View>
                    {fieldErrors.password !== undefined ? (
                      <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
                    ) : null}
                  </View>

                  {/* Forgot Password Trigger */}
                  <TouchableOpacity
                    style={styles.forgotPassButton}
                    onPress={() => setShowForgotPassword(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.forgotPassText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  {/* Credentials Login Button */}
                  <TouchableOpacity
                    style={[
                      styles.submitBtn,
                      isSubmitting && styles.submitBtnDisabled,
                    ]}
                    onPress={handleSignIn}
                    disabled={isSubmitting || isGoogleSubmitting}
                    activeOpacity={0.85}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <View style={styles.submitBtnInner}>
                        <Lucide name="log-in" size={18} color="#FFFFFF" />
                        <Text style={styles.submitBtnText}>Sign In to Account</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={styles.orDividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.orDividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Sign In with Google Button */}
                  <TouchableOpacity
                    style={[
                      styles.googleSSOBtn,
                      isGoogleSubmitting && styles.submitBtnDisabled,
                    ]}
                    onPress={handleGoogleSignIn}
                    disabled={isSubmitting || isGoogleSubmitting}
                    activeOpacity={0.85}
                  >
                    {isGoogleSubmitting ? (
                      <ActivityIndicator size="small" color="#334155" />
                    ) : (
                      <View style={styles.googleSSOInner}>
                        <Lucide name="chrome" size={18} color="#EA4335" />
                        <Text style={styles.googleSSOText}>Continue with Google</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Security Notice Footer */}
                  <View style={styles.securityBox}>
                    <Lucide name="shield" size={14} color="#2563EB" />
                    <Text style={styles.securityText}>
                      Authorized NTC Staff Portal • Encrypted TLS 1.3 Session
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Footer Policy Links */}
        <View style={styles.footerWrap}>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => setActiveFooterModal(FOOTER_POLICIES["user-agreement"])}>
              <Text style={styles.footerLinkItem}>User Agreement</Text>
            </TouchableOpacity>
            <Text style={styles.footerBullet}>•</Text>
            <TouchableOpacity onPress={() => setActiveFooterModal(FOOTER_POLICIES["privacy-policy"])}>
              <Text style={styles.footerLinkItem}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.footerBullet}>•</Text>
            <TouchableOpacity onPress={() => setActiveFooterModal(FOOTER_POLICIES["community-guidelines"])}>
              <Text style={styles.footerLinkItem}>Community Guidelines</Text>
            </TouchableOpacity>
            <Text style={styles.footerBullet}>•</Text>
            <TouchableOpacity onPress={() => setActiveFooterModal(FOOTER_POLICIES["cookie-policy"])}>
              <Text style={styles.footerLinkItem}>Cookie Policy</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.copyRightNotice}>
            © {new Date().getFullYear()} National Telecommunications Commission • All Rights Reserved
          </Text>
        </View>
      </ScrollView>

      {/* Policy Modal Sheet */}
      {activeFooterModal !== null ? (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCardWrapper}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitleText}>{activeFooterModal.title}</Text>
                <TouchableOpacity onPress={() => setActiveFooterModal(null)} style={styles.modalCloseBtn}>
                  <Lucide name="x" size={20} color={COLORS.neutral[500]} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={true}>
                <Text style={styles.modalIntroText}>{activeFooterModal.intro}</Text>
                {activeFooterModal.sections.map((sec, idx) => (
                  <View key={idx} style={styles.modalSectionBox}>
                    <Text style={styles.modalSectionHeading}>{sec.title}</Text>
                    <Text style={styles.modalSectionText}>{sec.body}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  outerShell: {
    flex: 1,
    backgroundColor: "#0B132B",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
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
  toastContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    maxWidth: 520,
    alignSelf: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 999,
  },
  toastIconWrapper: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  toastText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#991B1B",
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  toastCloseBtn: {
    padding: 4,
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
  demoPresetsContainer: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  demoPresetsTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#475569",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  presetsPillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  presetPill: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  presetPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#1E3A8A",
  },
  fieldBlock: {
    marginBottom: 16,
    gap: 6,
  },
  fieldLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#334155",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
  },
  inputBoxFocused: {
    borderColor: "#1E3A8A",
    backgroundColor: "#FFFFFF",
  },
  inputBoxError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  fieldIconLeft: {
    marginRight: 10,
  },
  inputFieldText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: "#0F172A",
    height: "100%",
    ...Platform.select({ web: { outlineWidth: 0 } }),
  },
  eyeToggleTouch: {
    padding: 6,
  },
  fieldErrorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#EF4444",
    marginTop: 2,
  },
  forgotPassButton: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPassText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#2563EB",
  },
  submitBtn: {
    backgroundColor: "#1E3A8A",
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#FFFFFF",
  },
  orDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  orDividerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#94A3B8",
  },
  googleSSOBtn: {
    backgroundColor: "#FFFFFF",
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  googleSSOInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  googleSSOText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#334155",
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
  modalCardWrapper: {
    width: "100%",
    maxWidth: 640,
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScrollBody: {
    flex: 1,
  },
  modalIntroText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 20,
  },
  modalSectionBox: {
    marginBottom: 16,
  },
  modalSectionHeading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#1E293B",
    marginBottom: 6,
  },
  modalSectionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#64748B",
    lineHeight: 20,
  },
});
