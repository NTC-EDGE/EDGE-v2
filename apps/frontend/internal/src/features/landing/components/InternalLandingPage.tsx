import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  useWindowDimensions,
  Pressable,
  Modal,
} from "react-native";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
} from "@edge/ui";
import { useAuthContext } from "../../auth/context/AuthContext";
import { NtcLogo } from "./NtcLogo";

interface ClerkErrorItem {
  message: string;
}

interface ClerkErrorResponse {
  errors: ClerkErrorItem[];
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

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
        body: "Before contacting support, please check our extensive FAQ section and step-by-step guides available within the portal's main Help Center link (this will lead to a dedicated website).",
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

function isClerkError(err: unknown): err is ClerkErrorResponse {
  if (!isObject(err)) {
    return false;
  }
  const errors = err.errors;
  if (!Array.isArray(errors)) {
    return false;
  }
  return errors.every((item): boolean => {
    if (!isObject(item)) {
      return false;
    }
    return typeof item.message === "string";
  });
}

const REGION_OPTIONS: readonly string[] = [
  "Region X - Northern Mindanao",
  "Central Office - NCR",
  "Region I - Ilocos Region",
  "Region II - Cagayan Valley",
  "Region III - Central Luzon",
  "Region IV-A - CALABARZON",
  "Region IV-B - MIMAROPA",
  "Region V - Bicol Region",
  "Region VI - Western Visayas",
  "Region VII - Central Visayas",
  "Region VIII - Eastern Visayas",
  "Region IX - Zamboanga Peninsula",
  "Region XI - Davao Region",
  "Region XII - SOCCSKSARGEN",
  "Region XIII - Caraga",
  "BARMM - Bangsamoro Region",
  "CAR - Cordillera Administrative Region",
] as const;

export function InternalLandingPage() {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;

  const { loginWithClerk, verifySignUp } = useAuthContext();

  const [mode, setMode] = useState<"signin" | "verify" | "forgot">("signin");
  const [selectedRegion, setSelectedRegion] = useState("Region X - Northern Mindanao");
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeFooterModal, setActiveFooterModal] = useState<FooterPolicyContent | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenForgotPassword = () => {
    setResetIdentifier(identifier);
    setResetError("");
    setResetSuccess("");
    setShowForgotPasswordModal(true);
  };

  const handleSendResetLink = () => {
    if (resetIdentifier.trim() === "") {
      setResetError("Please enter your registered phone number or email address.");
      setResetSuccess("");
      return;
    }
    setResetSuccess("");
    setResetError("Password reset functionality is currently not available. Please contact support or your administrator.");
  };

  const handleAuthError = (err: unknown, defaultMsg: string) => {
    if (err instanceof Error) {
      setError(err.message);
    } else if (isClerkError(err)) {
      if (err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError(defaultMsg);
      }
    } else {
      setError(defaultMsg);
    }
  };

  const handleSignIn = async () => {
    if (identifier.trim() === "" || password.trim() === "") {
      setError("Please enter your phone number/email address and password.");
      return;
    }
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);
    try {
      await loginWithClerk(identifier, password, selectedRegion);
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        (err.message.toLowerCase().includes("verify") ||
          err.message.toLowerCase().includes("verification") ||
          err.message.toLowerCase().includes("status is"))
      ) {
        switchMode("verify");
        setError("Verification code required to complete login.");
      } else {
        handleAuthError(err, "Invalid credentials. Please check your login details and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (code.trim() === "") {
      setError("Please enter the verification code.");
      return;
    }
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);
    try {
      await verifySignUp(code);
    } catch (err: unknown) {
      handleAuthError(err, "Incorrect verification code. Please check and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const switchMode = (newMode: "signin" | "verify" | "forgot") => {
    setMode(newMode);
    setError("");
    setSuccessMessage("");
    setCode("");
  };

  const isFormFilled = identifier.trim().length > 0 && password.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoid}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative Soft Background Blobs */}
        <View style={styles.backgroundBlobLeft} pointerEvents="none" />
        <View style={styles.backgroundBlobRight} pointerEvents="none" />

        {/* Main Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.heroContentWrapper, isMobile && styles.heroContentWrapperMobile]}>
            {/* Left Hero Column */}
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
                Streamline your government services experience. Apply for permits, licenses, and certificates with secure, efficient, and transparent processes powered by EDGE.
              </Text>
            </View>

            {/* Right Hero Column: Browser Mockup Card enclosing the Login Form */}
            <View style={styles.heroRightCol}>
              <View style={styles.loginCardLogoWrapper}>
                <NtcLogo size={isMobile ? "medium" : "large"} variant="light" showSubtext={false} />
              </View>
              <View style={[styles.mockupWindowCard, SHADOWS.modal]}>
                {/* Mockup Window Top Header */}
                <View style={styles.mockupWindowHeader}>
                  <View style={styles.windowDotsRow}>
                    <View style={styles.windowDotRed} />
                    <View style={styles.windowDotYellow} />
                    <View style={styles.windowDotGreen} />
                  </View>
                </View>

                {/* Login Form Body */}
                <View style={[styles.mockupWindowBody, isMobile && { padding: 20 }]}>
                  <Text style={styles.cardTitle}>
                    {mode === "signin"
                      ? "Login"
                      : mode === "verify"
                      ? "Verify Account"
                      : "Reset Password"}
                  </Text>

                  {mode === "signin" && (
                    <>
                      {/* Region Selector */}
                      <View style={[styles.fieldGroup, { zIndex: 100 }]}>
                        <Text style={styles.fieldLabelSmall}>
                          Region <Text style={styles.requiredStar}>*</Text>
                        </Text>
                        <TouchableOpacity
                          style={styles.regionSelectorBox}
                          onPress={() => setShowRegionDropdown((prev) => !prev)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.regionSelectorInner}>
                            <Lucide name="map-pin" size={16} color={COLORS.neutral[500]} />
                            <Text style={styles.regionSelectorValue} numberOfLines={1}>
                              {selectedRegion}
                            </Text>
                          </View>
                          <Lucide
                            name={showRegionDropdown ? "chevron-up" : "chevron-down"}
                            size={18}
                            color={COLORS.neutral[600]}
                          />
                        </TouchableOpacity>

                        {showRegionDropdown && (
                          <>
                            <Pressable
                              style={styles.dropdownBackdrop}
                              onPress={() => setShowRegionDropdown(false)}
                            />
                            <View style={styles.regionPopoverMenu}>
                              <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled={true}>
                                {REGION_OPTIONS.map((region) => {
                                  const isSelected = region === selectedRegion;
                                  return (
                                    <TouchableOpacity
                                      key={region}
                                      style={[
                                        styles.regionOptionItem,
                                        isSelected && styles.regionOptionItemSelected,
                                      ]}
                                      onPress={() => {
                                        setSelectedRegion(region);
                                        setShowRegionDropdown(false);
                                      }}
                                    >
                                      <Text
                                        style={[
                                          styles.regionOptionText,
                                          isSelected && styles.regionOptionTextSelected,
                                        ]}
                                      >
                                        {region}
                                      </Text>
                                      {isSelected && (
                                        <Lucide name="check" size={16} color={COLORS.brand[800]} />
                                      )}
                                    </TouchableOpacity>
                                  );
                                })}
                              </ScrollView>
                            </View>
                          </>
                        )}
                      </View>

                      {/* Phone / Email Input */}
                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabelSmall}>
                          Phone no./Email address <Text style={styles.requiredStar}>*</Text>
                        </Text>
                        <TextInput
                          autoCapitalize="none"
                          placeholder="Phone no./Email address"
                          placeholderTextColor={COLORS.neutral[400]}
                          value={identifier}
                          onChangeText={setIdentifier}
                          style={styles.greyInput}
                          editable={!isSubmitting}
                        />
                      </View>

                      {/* Password Input with Eye Toggle */}
                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabelSmall}>
                          Password <Text style={styles.requiredStar}>*</Text>
                        </Text>
                        <View style={styles.inputWithIconWrapper}>
                          <TextInput
                            placeholder="Password"
                            placeholderTextColor={COLORS.neutral[400]}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                            style={[styles.greyInput, { paddingRight: 42 }]}
                            editable={!isSubmitting}
                          />
                          <TouchableOpacity
                            style={styles.eyeIconButton}
                            onPress={() => setShowPassword((prev) => !prev)}
                          >
                            <Lucide
                              name={showPassword ? "eye-off" : "eye"}
                              size={18}
                              color={COLORS.neutral[500]}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {error.length > 0 ? (
                        <Text style={styles.errorText}>{error}</Text>
                      ) : null}

                      {successMessage.length > 0 ? (
                        <Text style={styles.successText}>{successMessage}</Text>
                      ) : null}

                      {/* Submit Login Button */}
                      <TouchableOpacity
                        style={[
                          styles.loginButton,
                          isFormFilled ? styles.loginButtonActive : styles.loginButtonDefault,
                          isSubmitting && styles.buttonDisabled,
                        ]}
                        onPress={handleSignIn}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator size="small" color={COLORS.neutral.white} />
                        ) : (
                          <View style={styles.loginButtonInner}>
                            <Lucide
                              name="log-in"
                              size={18}
                              color={isFormFilled ? COLORS.neutral.white : "#475569"}
                            />
                            <Text
                              style={[
                                styles.loginButtonText,
                                isFormFilled ? styles.loginButtonTextActive : styles.loginButtonTextDefault,
                              ]}
                            >
                              Login
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>

                      {/* Forgot Password & Verify Links */}
                      <View style={{ gap: 8, marginTop: 12 }}>
                        <TouchableOpacity
                          onPress={handleOpenForgotPassword}
                          style={styles.forgotPasswordLinkWrapper}
                          disabled={isSubmitting}
                        >
                          <Text style={styles.forgotPasswordLinkText}>Forgot your password?</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => switchMode("verify")}
                          style={styles.forgotPasswordLinkWrapper}
                          disabled={isSubmitting}
                        >
                          <Text style={styles.forgotPasswordLinkText}>Have a verification code?</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}

                  {mode === "verify" && (
                    <>
                      <Text style={styles.verifyDescriptionText}>
                        Enter the verification code sent to {identifier}.
                      </Text>

                      <View style={styles.fieldGroup}>
                        <TextInput
                          autoCapitalize="none"
                          placeholder="Verification Code *"
                          placeholderTextColor={COLORS.neutral[400]}
                          value={code}
                          onChangeText={setCode}
                          style={styles.greyInput}
                          editable={!isSubmitting}
                        />
                      </View>

                      {error.length > 0 ? (
                        <Text style={styles.errorText}>{error}</Text>
                      ) : null}

                      <TouchableOpacity
                        style={[styles.loginButton, styles.loginButtonActive, isSubmitting && styles.buttonDisabled]}
                        onPress={handleVerify}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator size="small" color={COLORS.neutral.white} />
                        ) : (
                          <Text style={[styles.loginButtonText, styles.loginButtonTextActive]}>Verify & Login</Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => switchMode("signin")}
                        style={styles.forgotPasswordLinkWrapper}
                      >
                        <Text style={styles.forgotPasswordLinkText}>Back to Login</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Dark Navy Footer (Screenshot Reference) */}
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



      {/* Forgot Password Dialog Modal */}
      <Modal
        visible={showForgotPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowForgotPasswordModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowForgotPasswordModal(false)}
        >
          <TouchableOpacity
            style={[styles.modalCard, SHADOWS.modal, { maxWidth: 460 }]}
            activeOpacity={1}
            onPress={() => {}}
          >
            {/* Close X Button */}
            <Pressable
              style={styles.modalCloseBtn}
              onPress={() => setShowForgotPasswordModal(false)}
            >
              <Lucide name="x" size={20} color={COLORS.neutral[500]} />
            </Pressable>

            <View style={{ padding: 4 }}>
              <View style={styles.policyModalHeader}>
                <View style={styles.policyHeaderIconCircle}>
                  <Lucide name="key" size={20} color="#1E3A8A" />
                </View>
                <Text style={styles.policyModalTitle}>Reset Password</Text>
              </View>

              <Text style={[styles.policyIntroText, { marginBottom: 20 }]}>
                Enter your registered phone number or email address below to receive password reset instructions.
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabelSmall}>Phone no. / Email address</Text>
                <TextInput
                  autoCapitalize="none"
                  placeholder="Enter your phone or email *"
                  placeholderTextColor={COLORS.neutral[400]}
                  value={resetIdentifier}
                  onChangeText={setResetIdentifier}
                  style={styles.greyInput}
                />
              </View>

              {resetError.length > 0 ? (
                <Text style={styles.errorText}>{resetError}</Text>
              ) : null}

              {resetSuccess.length > 0 ? (
                <Text style={styles.successText}>{resetSuccess}</Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  resetIdentifier.trim().length > 0 ? styles.loginButtonActive : styles.loginButtonDefault,
                  { marginTop: 12 }
                ]}
                onPress={handleSendResetLink}
              >
                <Text
                  style={[
                    styles.loginButtonText,
                    resetIdentifier.trim().length > 0 ? styles.loginButtonTextActive : styles.loginButtonTextDefault,
                  ]}
                >
                  Send Reset Instructions
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
            {/* Close X Button */}
            <Pressable
              style={styles.modalCloseBtn}
              onPress={() => setActiveFooterModal(null)}
            >
              <Lucide name="x" size={20} color={COLORS.neutral[500]} />
            </Pressable>

            {activeFooterModal !== null ? (
              <ScrollView style={{ maxHeight: 560 }} showsVerticalScrollIndicator={true}>
                {/* Header */}
                <View style={styles.policyModalHeader}>
                  <View style={styles.policyHeaderIconCircle}>
                    <Lucide name="file-text" size={20} color="#1E3A8A" />
                  </View>
                  <Text style={styles.policyModalTitle}>{activeFooterModal.title}</Text>
                </View>
                <View style={styles.policyTitleDivider} />

                {/* Intro Box */}
                <View style={styles.policyIntroBox}>
                  <Lucide name="info" size={18} color="#1E3A8A" style={styles.policyIntroIcon} />
                  <Text style={styles.policyIntroText}>{activeFooterModal.intro}</Text>
                </View>

                {/* Section Cards */}
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

  scrollContainer: {
    flexGrow: 1,
    minHeight: "100%",
    justifyContent: "space-between",
    backgroundColor: "#FAF9F6",
    position: "relative",
    overflow: "hidden",
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
  heroActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  getStartedBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0E1B61",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
  },
  getStartedBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
  trackAppBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1.5,
    borderColor: "#1E40AF",
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
  },
  trackAppBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#1E40AF",
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
  mockupWindowBody: {
    padding: 28,
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 30,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
    marginBottom: SPACING[24],
    textAlign: "center",
  },
  requiredStar: {
    color: "#EF4444",
  },
  fieldGroup: {
    marginBottom: 20,
    position: "relative",
  },
  fieldLabelSmall: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginBottom: 6,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  regionSelectorBox: {
    height: 56,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  regionSelectorInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  regionSelectorValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    color: COLORS.neutral[900],
    fontWeight: TYPOGRAPHY.weights.medium,
    flex: 1,
  },
  dropdownBackdrop: {
    position: "absolute",
    top: -1000,
    bottom: -1000,
    left: -1000,
    right: -1000,
    zIndex: 99,
  },
  regionPopoverMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 6,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 6,
    paddingHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  regionOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  regionOptionItemSelected: {
    backgroundColor: "rgba(37, 99, 235, 0.08)",
  },
  regionOptionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[700],
    flex: 1,
  },
  regionOptionTextSelected: {
    color: COLORS.brand[800],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  dropdownMenu: {
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: 10,
    marginTop: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 99,
  },
  dropdownMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  dropdownMenuItemActive: {
    backgroundColor: "rgba(37, 99, 235, 0.08)",
  },
  dropdownMenuItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[700],
  },
  dropdownMenuItemTextActive: {
    color: COLORS.brand[800],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  inputWithIconWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  greyInput: {
    height: 56,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 18,
    fontSize: 16,
    color: COLORS.neutral[900],
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  eyeIconButton: {
    position: "absolute",
    right: 16,
    padding: 6,
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    ...Platform.select({
      web: {
        transition: "all 200ms ease-out",
        cursor: "pointer",
      },
    }),
  },
  loginButtonDefault: {
    backgroundColor: "#CBD5E1",
  },
  loginButtonActive: {
    backgroundColor: COLORS.brand[800],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loginButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 17,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  loginButtonTextDefault: {
    color: "#475569",
  },
  loginButtonTextActive: {
    color: COLORS.neutral.white,
  },
  forgotPasswordLinkWrapper: {
    alignSelf: "center",
    marginTop: 20,
    padding: 4,
  },
  forgotPasswordLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#2563EB",
  },
  registerToggleWrapper: {
    alignSelf: "center",
    marginTop: 12,
    padding: 4,
  },
  registerToggleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
  },
  registerToggleBold: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#DC2626",
    marginBottom: 10,
    textAlign: "center",
  },
  successText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#10B981",
    marginBottom: 10,
    textAlign: "center",
  },
  verifyDescriptionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
    marginBottom: 16,
    textAlign: "center",
  },

  footerBar: {
    width: "100%",
    backgroundColor: "#0E1B61",
    paddingHorizontal: SPACING[32],
    paddingVertical: 24,
  },
  footerContentContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 36,
  },
  footerLeftBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  footerCopyrightText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[200],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  footerRightLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  footerRightLinksMobile: {
    gap: 18,
  },
  footerLinkPressable: {
    paddingVertical: 4,
  },
  footerLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[200],
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 840,
    maxHeight: "90%",
    backgroundColor: COLORS.neutral.white,
    borderRadius: 24,
    padding: 24,
    position: "relative",
    alignSelf: "center",
  },
  modalCloseBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  policyModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  policyHeaderIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  policyModalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F2042",
  },
  policyTitleDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
    marginBottom: 20,
    width: "100%",
  },
  policyIntroBox: {
    flexDirection: "row",
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  policyIntroIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  policyIntroText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: "#1E3A8A",
    fontWeight: TYPOGRAPHY.weights.medium,
    lineHeight: 22,
  },
  policySectionCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 20,
    marginBottom: 16,
  },
  policySecTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#1E3A8A",
    marginBottom: 8,
  },
  policySecBody: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[700],
    lineHeight: 22,
  },
  policyHighlightBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral.white,
    borderColor: "#C7D2FE",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  policyMailIcon: {
    marginRight: 8,
  },
  policyHighlightText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#1E3A8A",
  },
});
