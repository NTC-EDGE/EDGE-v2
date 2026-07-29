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
  Pressable,
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
  "send-feedback": {
    title: "Send Feedback",
    intro:
      "Your feedback is crucial for the continuous improvement of the EDGE Portal. Please use this channel to submit suggestions, bug reports, or compliments.",
    sections: [
      {
        title: "1. Focus on Specifics",
        body: "When reporting issues, include the steps you took, the device you used, and the desired outcome. For suggestions, explain how the change would benefit your experience.",
      },
      {
        title: "2. Response Time",
        body: "While we read all feedback, we cannot promise a personal response to every submission. If your concern is urgent, please refer to the Help Center for official support channels.",
      },
      {
        title: "3. Confidentiality",
        body: "All feedback submitted is considered non-confidential and may be used by the NTC to enhance the system without compensation.",
      },
    ],
  },
  "help-center": {
    title: "Help Center & Support",
    intro:
      "Find comprehensive guides, video tutorials, and technical support for all NTC EDGE Portal services.",
    sections: [
      {
        title: "1. Self-Service Resources",
        body: "Before contacting support, please check our extensive FAQ section and step-by-step guides available within the portal's Help Center link.",
      },
      {
        title: "2. Contact Information",
        body: "For application-specific inquiries or technical issues that cannot be resolved via self-service:",
        highlight: "Email Support: support@ntcedge.gov.ph",
      },
      {
        title: "3. Operating Hours",
        body: "Live support is available Monday to Friday, 8:00 AM to 5:00 PM (Philippine Standard Time).",
      },
    ],
  },
};

export function InternalLoginPage() {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const { loginWithClerk } = useAuthContext();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<"identifier" | "password" | null>(null);
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

  const handleSignIn = async () => {
    if (identifier.trim().length === 0) {
      triggerToastError("Email address or username is required.");
      return;
    }
    if (password.length === 0) {
      triggerToastError("Password is required.");
      return;
    }

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

  return (
    <View style={styles.outerShell}>
      {/* Toast Notification for Error Alerts */}
      {toastMessage !== null ? (
        <View style={styles.toastContainer}>
          <Lucide name="alert-circle" size={20} color="#EF4444" />
          <Text style={styles.toastText}>{toastMessage}</Text>
          <TouchableOpacity onPress={dismissToast} style={styles.toastCloseBtn}>
            <Lucide name="x" size={16} color={COLORS.neutral[500]} />
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Background Ambient Glow Spots */}
        <View style={styles.ambientGlowTopLeft} pointerEvents="none" />
        <View style={styles.ambientGlowBottomRight} pointerEvents="none" />

        <View style={styles.heroSection}>
          <View style={[styles.heroContentWrapper, isMobile && styles.heroContentWrapperMobile]}>
            
            {/* Left Hero Branding Column */}
            <View style={[styles.heroLeftCol, isMobile && styles.heroLeftColMobile]}>
              <View style={[styles.heroPillBadge, isMobile && { alignSelf: "center" }]}>
                <View style={styles.heroBadgeDot} />
                <Text style={styles.heroBadgeText}>Government Electronic Data Governance</Text>
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
                National Telecommunications Commission
              </Text>

              <Text style={[styles.heroSubtitle, isMobile && styles.heroSubtitleMobile]}>
                Unified internal portal for staff authentication, regional licensing workflows, and secure administrative operations.
              </Text>

              {/* Feature Highlights Grid */}
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconBadge}>
                    <Lucide name="shield" size={18} color="#3B82F6" />
                  </View>
                  <View style={styles.featureTextCol}>
                    <Text style={styles.featureTitle}>Multi-Tenant RBAC Security</Text>
                    <Text style={styles.featureDesc}>Granular regional and departmental permissions.</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <View style={styles.featureIconBadge}>
                    <Lucide name="zap" size={18} color="#10B981" />
                  </View>
                  <View style={styles.featureTextCol}>
                    <Text style={styles.featureTitle}>Real-Time Evaluation</Text>
                    <Text style={styles.featureDesc}>Automated queue processing and audit tracking.</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Right Form Card Column */}
            <View style={styles.heroRightCol}>
              <View style={styles.loginCardLogoWrapper}>
                <NtcLogo size={isMobile ? "medium" : "large"} variant="light" showSubtext={false} />
              </View>

              <View style={[styles.mockupWindowCard, SHADOWS.modal]}>
                <View style={styles.mockupWindowHeader}>
                  <View style={styles.windowDotsRow}>
                    <View style={styles.windowDotRed} />
                    <View style={styles.windowDotYellow} />
                    <View style={styles.windowDotGreen} />
                  </View>
                  <Text style={styles.windowHeaderText}>Internal Staff Portal</Text>
                </View>

                <View style={[styles.mockupWindowBody, isMobile && { padding: 20 }]}>
                  <View style={styles.cardHeaderArea}>
                    <Text style={styles.cardTitle}>Staff Sign In</Text>
                    <Text style={styles.cardSubTitle}>
                      Enter your official credentials or continue with Google.
                    </Text>
                  </View>

                  {/* Email / Username Field */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabelSmall}>Email Address or Username</Text>
                    <View
                      style={[
                        styles.inputWithIconWrapper,
                        focusedField === "identifier" && styles.inputWithIconWrapperFocused,
                      ]}
                    >
                      <Lucide
                        name="user"
                        size={18}
                        color={focusedField === "identifier" ? "#1E3A8A" : COLORS.neutral[400]}
                        style={styles.inputIconLeft}
                      />
                      <TextInput
                        style={styles.textInputStyle}
                        placeholder="staff@ntc.gov.ph"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={identifier}
                        onChangeText={setIdentifier}
                        onFocus={() => setFocusedField("identifier")}
                        onBlur={() => setFocusedField(null)}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>
                  </View>

                  {/* Password Field */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabelSmall}>Password</Text>
                    <View
                      style={[
                        styles.inputWithIconWrapper,
                        focusedField === "password" && styles.inputWithIconWrapperFocused,
                      ]}
                    >
                      <Lucide
                        name="lock"
                        size={18}
                        color={focusedField === "password" ? "#1E3A8A" : COLORS.neutral[400]}
                        style={styles.inputIconLeft}
                      />
                      <TextInput
                        style={styles.textInputStyle}
                        placeholder="••••••••"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeToggleBtn}
                      >
                        <Lucide
                          name={showPassword ? "eye-off" : "eye"}
                          size={18}
                          color={COLORS.neutral[400]}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Forgot Password Link */}
                  <TouchableOpacity
                    style={styles.forgotPasswordLink}
                    onPress={() => setShowForgotPassword(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  {/* Submit Button */}
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      isSubmitting && styles.buttonDisabled,
                    ]}
                    onPress={handleSignIn}
                    disabled={isSubmitting || isGoogleSubmitting}
                    activeOpacity={0.85}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color={COLORS.neutral.white} />
                    ) : (
                      <View style={styles.loginButtonInner}>
                        <Lucide name="arrow-right" size={18} color={COLORS.neutral.white} />
                        <Text style={styles.loginButtonText}>Sign In to Dashboard</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Sign In with Google Button */}
                  <TouchableOpacity
                    style={[
                      styles.googleButton,
                      isGoogleSubmitting && styles.buttonDisabled,
                    ]}
                    onPress={handleGoogleSignIn}
                    disabled={isSubmitting || isGoogleSubmitting}
                    activeOpacity={0.85}
                  >
                    {isGoogleSubmitting ? (
                      <ActivityIndicator size="small" color={COLORS.neutral[700]} />
                    ) : (
                      <View style={styles.googleButtonInner}>
                        <View style={styles.googleIconBadge}>
                          <Lucide name="chrome" size={18} color="#EA4335" />
                        </View>
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Security Notice Footer */}
                  <View style={styles.securityNoticeBox}>
                    <Lucide name="shield" size={14} color="#3B82F6" />
                    <Text style={styles.securityNoticeText}>
                      Authorized personnel only. Sessions are logged & monitored.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Footer Policies */}
        <View style={styles.footerContainer}>
          <View style={styles.footerLinksRow}>
            <TouchableOpacity onPress={() => setActiveFooterModal(FOOTER_POLICIES["user-agreement"])}>
              <Text style={styles.footerLinkText}>User Agreement</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity onPress={() => setActiveFooterModal(FOOTER_POLICIES["privacy-policy"])}>
              <Text style={styles.footerLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity onPress={() => setActiveFooterModal(FOOTER_POLICIES["community-guidelines"])}>
              <Text style={styles.footerLinkText}>Community Guidelines</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity onPress={() => setActiveFooterModal(FOOTER_POLICIES["cookie-policy"])}>
              <Text style={styles.footerLinkText}>Cookie Policy</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.copyrightText}>
            © {new Date().getFullYear()} National Telecommunications Commission. All rights reserved.
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
                <TouchableOpacity onPress={() => setActiveFooterModal(null)} style={styles.modalCloseIcon}>
                  <Lucide name="x" size={20} color={COLORS.neutral[500]} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBodyScroll} showsVerticalScrollIndicator={true}>
                <Text style={styles.modalIntroText}>{activeFooterModal.intro}</Text>
                {activeFooterModal.sections.map((sec, idx) => (
                  <View key={idx} style={styles.modalSectionBox}>
                    <Text style={styles.modalSectionTitle}>{sec.title}</Text>
                    <Text style={styles.modalSectionBody}>{sec.body}</Text>
                    {sec.highlight ? (
                      <View style={styles.modalHighlightBox}>
                        <Text style={styles.modalHighlightText}>{sec.highlight}</Text>
                      </View>
                    ) : null}
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
  ambientGlowTopLeft: {
    position: "absolute",
    top: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "rgba(37, 99, 235, 0.25)",
    ...Platform.select({ web: { filter: "blur(80px)" } }),
  },
  ambientGlowBottomRight: {
    position: "absolute",
    bottom: -100,
    right: -100,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: "rgba(59, 130, 246, 0.18)",
    ...Platform.select({ web: { filter: "blur(90px)" } }),
  },
  toastContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    maxWidth: 560,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
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
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: "center",
  },
  heroContentWrapper: {
    width: "100%",
    maxWidth: 1200,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 48,
  },
  heroContentWrapperMobile: {
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
  heroPillBadge: {
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
  heroBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  heroBadgeText: {
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
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  featureIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(37, 99, 235, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#F8FAFC",
  },
  featureDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
  },
  heroRightCol: {
    width: "100%",
    maxWidth: 460,
    alignItems: "center",
  },
  loginCardLogoWrapper: {
    marginBottom: 20,
  },
  mockupWindowCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  mockupWindowHeader: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  windowDotsRow: {
    flexDirection: "row",
    gap: 6,
  },
  windowDotRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
  },
  windowDotYellow: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F59E0B",
  },
  windowDotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
  },
  windowHeaderText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#64748B",
  },
  mockupWindowBody: {
    padding: 28,
  },
  cardHeaderArea: {
    marginBottom: 24,
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
    marginBottom: 4,
  },
  cardSubTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#64748B",
  },
  fieldGroup: {
    marginBottom: 16,
    gap: 6,
  },
  fieldLabelSmall: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#334155",
  },
  inputWithIconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
  },
  inputWithIconWrapperFocused: {
    borderColor: "#1E3A8A",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 0 0 3px rgba(30, 58, 138, 0.12)",
  },
  inputIconLeft: {
    marginRight: 10,
  },
  textInputStyle: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: "#0F172A",
    height: "100%",
    ...Platform.select({ web: { outlineWidth: 0 } }),
  },
  eyeToggleBtn: {
    padding: 6,
  },
  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#2563EB",
  },
  loginButton: {
    backgroundColor: "#1E3A8A",
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loginButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#FFFFFF",
  },
  dividerRow: {
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
  dividerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#94A3B8",
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({ web: { cursor: "pointer" } }),
  },
  googleButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  googleIconBadge: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  googleButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#334155",
  },
  securityNoticeBox: {
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
  securityNoticeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "#1E40AF",
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  footerContainer: {
    marginTop: 60,
    alignItems: "center",
    gap: 12,
  },
  footerLinksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  footerLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#94A3B8",
  },
  footerDot: {
    color: "#475569",
    fontSize: 12,
  },
  copyrightText: {
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
  modalCloseIcon: {
    padding: 4,
  },
  modalBodyScroll: {
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
  modalSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#1E293B",
    marginBottom: 6,
  },
  modalSectionBody: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#64748B",
    lineHeight: 20,
  },
  modalHighlightBox: {
    marginTop: 8,
    backgroundColor: "#F1F5F9",
    padding: 10,
    borderRadius: 6,
  },
  modalHighlightText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#1E3A8A",
  },
});
