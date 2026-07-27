import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
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
    intro: "Welcome to the EDGE Portal. This User Agreement governs your access to and use of all services provided by the National Telecommunications Commission (NTC) via this platform.",
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
    intro: "Your privacy is important to us. This policy outlines how the NTC collects, uses, and protects the personal and application data you provide through the EDGE Portal.",
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
    intro: "These guidelines promote a safe and productive environment for all users of the EDGE Portal, especially when utilizing public-facing features like feedback forums or communication channels.",
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
    intro: "This portal uses cookies to ensure optimal performance and user experience. By continuing to use the EDGE Portal, you consent to the use of cookies.",
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
    intro: "Your feedback is crucial for the continuous improvement of the EDGE Portal. Please use this channel to submit suggestions, bug reports, or compliments.",
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
    intro: "Find comprehensive guides, video tutorials, and technical support for all NTC EDGE Portal services.",
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
      if (res.createdSessionId && res.setActive) {
        await res.setActive({ session: res.createdSessionId });
      }
    } catch (err: unknown) {
      triggerToastError(parseApiError(err));
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoid}
    >
      {/* Floating Error Toast Notification */}
      {toastMessage !== null && toastMessage.trim().length > 0 ? (
        <View style={[styles.toastContainer, SHADOWS.modal]}>
          <Lucide name="alert-triangle" size={20} color="#DC2626" />
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
        <View style={styles.backgroundBlobLeft} pointerEvents="none" />
        <View style={styles.backgroundBlobRight} pointerEvents="none" />

        <View style={styles.heroSection}>
          <View style={[styles.heroContentWrapper, isMobile && styles.heroContentWrapperMobile]}>
            <View style={[styles.heroLeftCol, isMobile && styles.heroLeftColMobile]}>
              <View style={[styles.heroPillBadge, isMobile && { alignSelf: "center" }]}>
                <View style={styles.heroBadgeDot} />
                <Text style={styles.heroBadgeText}>Official NTC-EDGE Portal</Text>
              </View>

              <Text style={[styles.heroTitle, isMobile ? styles.heroTitleMobile : isTablet ? styles.heroTitleTablet : null]}>
                Empowering <Text style={styles.heroTitleHighlight}>NTC's</Text>
                {isMobile ? " " : "\n"}Data Governance
              </Text>

              <Text style={[styles.heroSubtitle, isMobile && styles.heroSubtitleMobile]}>
                Streamline your government services experience. Access internal queues, directories, and management tools with secure Clerk authentication.
              </Text>
            </View>

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
                  <Text style={styles.windowHeaderText}>Internal Staff Sign-In</Text>
                </View>

                <View style={[styles.mockupWindowBody, isMobile && { padding: 20 }]}>
                  <Text style={styles.cardTitle}>Staff Login</Text>

                  {/* Email / Username Field */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabelSmall}>Email Address or Username</Text>
                    <View style={[styles.inputWithIconWrapper, focusedField === "identifier" && styles.inputWithIconWrapperFocused]}>
                      <Lucide name="user" size={18} color={focusedField === "identifier" ? "#0E1B61" : COLORS.neutral[400]} style={styles.inputIconLeft} />
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
                    <View style={[styles.inputWithIconWrapper, focusedField === "password" && styles.inputWithIconWrapperFocused]}>
                      <Lucide name="lock" size={18} color={focusedField === "password" ? "#0E1B61" : COLORS.neutral[400]} style={styles.inputIconLeft} />
                      <TextInput
                        style={styles.textInputStyle}
                        placeholder="••••••••"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        secureTextEntry={true}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  {/* Forgot Password Link */}
                  <TouchableOpacity
                    style={{ alignSelf: "flex-end", marginBottom: 16 }}
                    onPress={() => setShowForgotPassword(true)}
                  >
                    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.brand[800], fontWeight: TYPOGRAPHY.weights.medium }}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>

                  {/* Submit Button */}
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      styles.loginButtonActive,
                      isSubmitting && styles.buttonDisabled,
                    ]}
                    onPress={handleSignIn}
                    disabled={isSubmitting || isGoogleSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color={COLORS.neutral.white} />
                    ) : (
                      <View style={styles.loginButtonInner}>
                        <Lucide
                          name="log-in"
                          size={18}
                          color={COLORS.neutral.white}
                        />
                        <Text
                          style={[
                            styles.loginButtonText,
                            styles.loginButtonTextActive,
                          ]}
                        >
                          Sign In
                        </Text>
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
                  >
                    {isGoogleSubmitting ? (
                      <ActivityIndicator size="small" color={COLORS.neutral[700]} />
                    ) : (
                      <View style={styles.googleButtonInner}>
                        <Lucide name="globe" size={18} color="#4285F4" />
                        <Text style={styles.googleButtonText}>Sign in with Google</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footerBar}>
          <View style={styles.footerContentContainer}>
            <View style={styles.footerLeftBrand}>
              <NtcLogo size="small" variant="dark" showSubtext={false} />
              <Text style={styles.footerCopyrightText}>© 2026</Text>
            </View>

            <View style={[styles.footerRightLinks, isMobile && styles.footerRightLinksMobile]}>
              <Pressable
                style={styles.footerLinkPressable}
                onPress={() => setActiveFooterModal(FOOTER_POLICIES["user-agreement"])}
              >
                <Text style={styles.footerLinkText}>User Agreement</Text>
              </Pressable>
              <Pressable
                style={styles.footerLinkPressable}
                onPress={() => setActiveFooterModal(FOOTER_POLICIES["privacy-policy"])}
              >
                <Text style={styles.footerLinkText}>Privacy Policy</Text>
              </Pressable>
              <Pressable
                style={styles.footerLinkPressable}
                onPress={() => setActiveFooterModal(FOOTER_POLICIES["community-guidelines"])}
              >
                <Text style={styles.footerLinkText}>Community Guidelines</Text>
              </Pressable>
              <Pressable
                style={styles.footerLinkPressable}
                onPress={() => setActiveFooterModal(FOOTER_POLICIES["cookie-policy"])}
              >
                <Text style={styles.footerLinkText}>Cookie Policy</Text>
              </Pressable>
              <Pressable
                style={styles.footerLinkPressable}
                onPress={() => setActiveFooterModal(FOOTER_POLICIES["send-feedback"])}
              >
                <Text style={styles.footerLinkText}>Send Feedback</Text>
              </Pressable>
              <Pressable
                style={styles.footerLinkPressable}
                onPress={() => setActiveFooterModal(FOOTER_POLICIES["help-center"])}
              >
                <Text style={styles.footerLinkText}>Help Center</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Policy & Support Dialog Modal */}
      <Modal
        visible={activeFooterModal !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveFooterModal(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActiveFooterModal(null)}
        >
          <TouchableOpacity
            style={[styles.modalCard, SHADOWS.modal]}
            activeOpacity={1}
            onPress={() => {}}
          >
            <Pressable
              style={styles.modalCloseBtn}
              onPress={() => setActiveFooterModal(null)}
            >
              <Lucide name="x" size={20} color={COLORS.neutral[500]} />
            </Pressable>

            {activeFooterModal !== null ? (
              <ScrollView style={{ maxHeight: 560 }} showsVerticalScrollIndicator={true}>
                <View style={styles.policyModalHeader}>
                  <View style={styles.policyHeaderIconCircle}>
                    <Lucide name="file-text" size={20} color="#1E3A8A" />
                  </View>
                  <Text style={styles.policyModalTitle}>{activeFooterModal.title}</Text>
                </View>
                <View style={styles.policyTitleDivider} />

                <View style={styles.policyIntroBox}>
                  <Lucide name="info" size={18} color="#1E3A8A" style={styles.policyIntroIcon} />
                  <Text style={styles.policyIntroText}>{activeFooterModal.intro}</Text>
                </View>

                {activeFooterModal.sections.map((sec, i) => (
                  <View key={i} style={[styles.policySectionCard, SHADOWS.card]}>
                    <Text style={styles.policySecTitle}>{sec.title}</Text>
                    <Text style={styles.policySecBody}>{sec.body}</Text>
                    {sec.highlight !== undefined ? (
                      <View style={styles.policyHighlightBadge}>
                        <Lucide name="mail" size={14} color="#1E3A8A" style={styles.policyMailIcon} />
                        <Text style={styles.policyHighlightText}>{sec.highlight}</Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  toastContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    maxWidth: 600,
    alignSelf: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 9999,
    elevation: 9999,
  },
  toastText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: "#991B1B",
    lineHeight: 18,
  },
  toastCloseBtn: {
    padding: 4,
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: "100%",
    justifyContent: "space-between",
    backgroundColor: "#FAF9F6",
    position: "relative",
  },
  backgroundBlobLeft: {
    position: "absolute",
    top: -80,
    left: -120,
    width: 480,
    height: 480,
    borderRadius: 240,
    backgroundColor: "rgba(219, 234, 254, 0.55)",
  },
  backgroundBlobRight: {
    position: "absolute",
    bottom: 40,
    right: -100,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: "rgba(254, 226, 226, 0.45)",
  },
  heroSection: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    paddingVertical: 24,
    position: "relative",
    zIndex: 1,
  },
  heroContentWrapper: {
    maxWidth: 1400,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 16,
    paddingRight: 28,
    gap: 32,
  },
  heroContentWrapperMobile: {
    paddingHorizontal: 16,
    gap: 24,
    justifyContent: "center",
  },
  heroLeftCol: {
    flex: 1.4,
    minWidth: 300,
    maxWidth: 720,
  },
  heroLeftColMobile: {
    maxWidth: "100%",
    alignItems: "center",
  },
  heroPillBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(37, 99, 235, 0.08)",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.15)",
  },
  heroBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1D4ED8",
    marginRight: 9,
  },
  heroBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#1E40AF",
  },
  heroTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 68,
    lineHeight: 78,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0E1B61",
    marginBottom: 24,
  },
  heroTitleTablet: {
    fontSize: 50,
    lineHeight: 60,
  },
  heroTitleMobile: {
    fontSize: 36,
    lineHeight: 44,
    textAlign: "center",
  },
  heroTitleHighlight: {
    color: "#CE1127",
  },
  heroSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 21,
    lineHeight: 32,
    color: COLORS.neutral[600],
    marginBottom: 36,
  },
  heroSubtitleMobile: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  loginCardLogoWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  heroRightCol: {
    flex: 1,
    minWidth: 280,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
    zIndex: 10,
  },
  mockupWindowCard: {
    width: "100%",
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  mockupWindowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#FAFAFC",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  windowDotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  windowDotRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF5F56",
  },
  windowDotYellow: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFBD2E",
  },
  windowDotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#27C93F",
  },
  windowHeaderText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  mockupWindowBody: {
    padding: 28,
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 26,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
    marginBottom: SPACING[20],
    textAlign: "center",
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabelSmall: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[600],
    marginBottom: 6,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  inputWithIconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  inputWithIconWrapperFocused: {
    borderColor: "#0E1B61",
    borderWidth: 1.5,
    backgroundColor: "#FFFFFF",
  },
  inputIconLeft: {
    marginRight: 8,
  },
  textInputStyle: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[900],
    height: "100%",
    paddingVertical: 0,
    ...(Platform.OS === "web" ? { outlineStyle: "none", outlineWidth: 0 } : {}),
  },
  loginButton: {
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonActive: {
    backgroundColor: "#0E1B61",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loginButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  loginButtonTextActive: {
    color: COLORS.neutral.white,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
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
    color: COLORS.neutral[400],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  googleButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },
  googleButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  googleButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
  },
  footerBar: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: COLORS.neutral.white,
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  footerContentContainer: {
    maxWidth: 1400,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  footerLeftBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footerCopyrightText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
  },
  footerRightLinks: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 20,
  },
  footerRightLinksMobile: {
    gap: 12,
  },
  footerLinkPressable: {
    paddingVertical: 4,
  },
  footerLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 640,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 16,
    padding: 28,
    position: "relative",
  },
  modalCloseBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 4,
  },
  policyModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  policyHeaderIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(30, 58, 138, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  policyModalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  policyTitleDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 16,
  },
  policyIntroBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  policyIntroIcon: {
    marginTop: 2,
  },
  policyIntroText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    lineHeight: 20,
    color: "#0369A1",
  },
  policySectionCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 12,
  },
  policySecTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[900],
    marginBottom: 6,
  },
  policySecBody: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.neutral[600],
  },
  policyHighlightBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  policyMailIcon: {
    marginTop: 1,
  },
  policyHighlightText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: "#1E3A8A",
  },
});
