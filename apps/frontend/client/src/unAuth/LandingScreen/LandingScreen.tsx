import { styles } from "./LandingScreen.styles";
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
  Platform,
  Animated,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppNavigation } from "../../navigation";
import { Icon as Lucide } from "@edge/ui";
import { COLORS, SHADOWS, SPACING } from "../../shared/theme/tokens";
import { Button } from "../../shared/components/Button";
import { Logo } from "../../shared/components/Logo";
import { ClientAnnouncementBanner } from "../../shared/components/ClientAnnouncementBanner";

interface PressableState {
  pressed: boolean;
  hovered?: boolean;
}

interface FooterPolicyContent {
  title: string;
  intro: string;
  sections: { title: string; body: string; highlight?: string }[];
}

const FOOTER_POLICIES: { [key: string]: FooterPolicyContent } = {
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
        title: "2. Intellectual Property",
        body: "You must respect intellectual property rights and not distribute materials protected by copyright, trademark, or other proprietary rights without authorization.",
      },
      {
        title: "3. Content Moderation",
        body: "The NTC reserves the right to review, edit, or remove user-generated content that violates these guidelines or is deemed inappropriate.",
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
        body: "Before contacting support, please check our extensive FAQ section and step-by-step guides available within the portal's main Help Center link (this will lead to a dedicated website).",
      },
      {
        title: "2. Contact Information",
        body: "For application-specific inquiries or technical issues that cannot be resolved via self-service:",
        highlight: "Email Support: edge@ntc.gov.ph",
      },
      {
        title: "3. Operating Hours",
        body: "Live support is available Monday to Friday, 8:00 AM to 5:00 PM (Philippine Standard Time).",
      },
    ],
  },
};

export function LandingScreen() {
  const navigation = useAppNavigation();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;
  const isTabletOrDesktop = width >= 768;

  // Modal visibility states
  const [isTrackModalVisible, setIsTrackModalVisible] = useState(false);
  const [activeFooterModal, setActiveFooterModal] =
    useState<FooterPolicyContent | null>(null);

  const openGetStartedModal = () => {
    navigation?.navigate("Login");
  };

  const scrollViewRef = useRef<ScrollView>(null);

  // Section Y coordinates for smooth scroll
  const [sectionYCoords, setSectionYCoords] = useState<{
    [key: string]: number;
  }>({});

  // FAQ state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Animation values
  const floatAnimBlue = useRef(new Animated.Value(0)).current;
  const floatAnimPink = useRef(new Animated.Value(0)).current;
  const floatAnimMockup = useRef(new Animated.Value(0)).current;
  const fadeAnimHero = useRef(new Animated.Value(0)).current;
  const slideAnimHero = useRef(new Animated.Value(30)).current;

  const cardAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const stepAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const faqAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Scroll Tracking & Animations
  const scrollY = useRef(new Animated.Value(0)).current;

  // Parallax translation for background blue glow: moves slower
  const backgroundBlueParallax = scrollY.interpolate({
    inputRange: [0, 1000],
    outputRange: [0, 150],
    extrapolate: "clamp",
  });

  // Parallax translation for background pink glow: moves in opposite direction
  const backgroundPinkParallax = scrollY.interpolate({
    inputRange: [0, 1000],
    outputRange: [0, -100],
    extrapolate: "clamp",
  });

  // Hero Section Parallax translation on scroll
  const heroParallaxTranslateY = scrollY.interpolate({
    inputRange: [0, 500],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

  // About EDGE reveal animations
  const aboutFade = scrollY.interpolate({
    inputRange: [0, 350],
    outputRange: [0.4, 1],
    extrapolate: "clamp",
  });
  const aboutTranslateY = scrollY.interpolate({
    inputRange: [0, 350],
    outputRange: [35, 0],
    extrapolate: "clamp",
  });

  // About EDGE Gateway 4-card scroll-down animation
  const aboutGridTranslateY = scrollY.interpolate({
    inputRange: [0, 450],
    outputRange: [-30, 0],
    extrapolate: "clamp",
  });

  // Features Section reveal animations
  const featuresFade = scrollY.interpolate({
    inputRange: [150, 550],
    outputRange: [0.4, 1],
    extrapolate: "clamp",
  });
  const featuresTranslateY = scrollY.interpolate({
    inputRange: [150, 550],
    outputRange: [35, 0],
    extrapolate: "clamp",
  });

  // How It Works Section reveal animations
  const howItWorksFade = scrollY.interpolate({
    inputRange: [450, 850],
    outputRange: [0.4, 1],
    extrapolate: "clamp",
  });
  const howItWorksTranslateY = scrollY.interpolate({
    inputRange: [450, 850],
    outputRange: [35, 0],
    extrapolate: "clamp",
  });

  // FAQs Section reveal animations
  const faqsFade = scrollY.interpolate({
    inputRange: [750, 1200],
    outputRange: [0.4, 1],
    extrapolate: "clamp",
  });
  const faqsTranslateY = scrollY.interpolate({
    inputRange: [750, 1200],
    outputRange: [35, 0],
    extrapolate: "clamp",
  });

  useEffect(() => {
    // Floating background animations loop
    const createFloatAnim = (animValue: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    createFloatAnim(floatAnimBlue, 10000).start();
    createFloatAnim(floatAnimPink, 12000).start();

    // Floating hero mockup animation
    const createMockupFloat = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnimMockup, {
            toValue: -12,
            duration: 3500,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnimMockup, {
            toValue: 0,
            duration: 3500,
            useNativeDriver: true,
          }),
        ]),
      );
    };
    createMockupFloat().start();

    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnimHero, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimHero, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Staggered feature card entrances
      Animated.stagger(
        150,
        cardAnims.map((anim) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ),
      ).start();

      // Staggered step entrances
      Animated.stagger(
        120,
        stepAnims.map((anim) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ),
      ).start();
    });
  }, [
    floatAnimBlue,
    floatAnimPink,
    floatAnimMockup,
    fadeAnimHero,
    slideAnimHero,
    cardAnims,
    stepAnims,
  ]);

  const handleSectionLayout = (name: string, y: number) => {
    setSectionYCoords((prev) => ({ ...prev, [name]: y }));
  };

  const scrollToSection = (name: string) => {
    const y = sectionYCoords[name];
    if (y !== undefined) {
      scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
    }
  };

  const handleFaqPress = (idx: number) => {
    const isExpanded = expandedFaq === idx;

    if (isExpanded) {
      Animated.timing(faqAnims[idx], {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        setExpandedFaq(null);
      });
    } else {
      if (expandedFaq !== null) {
        Animated.timing(faqAnims[expandedFaq], {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }

      setExpandedFaq(idx);
      Animated.timing(faqAnims[idx], {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  };

  const translateYBlue = floatAnimBlue.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 30],
  });
  const translateXBlue = floatAnimBlue.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 20],
  });

  const translateYPink = floatAnimPink.interpolate({
    inputRange: [0, 1],
    outputRange: [30, -30],
  });
  const translateXPink = floatAnimPink.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -20],
  });

  const faqs = [
    {
      q: "What is the EDGE application?",
      a: "The Electronic Data Governance and Evaluation (EDGE) portal is the official online platform of the National Telecommunications Commission (NTC) for Radio Operator Examinations, Certificates, Radio Station Licenses, Permits, CPE Supplier Accreditations, and Consumer Requests & Complaints.",
    },
    {
      q: "Who can use this portal?",
      a: "Individual applicants, licensed radio operators, maritime and aviation entities, telecommunications providers, accredited equipment dealers, and authorized company/liaison representatives filing single or bulk applications.",
    },
    {
      q: "How do I track my application and pay fees?",
      a: "Sign in and open “My Applications” to monitor real-time evaluation progress, respond to compliance remarks, view your Statement of Account (SOA) and Order of Payment (OP), submit payment details, and download official receipts and issued documents.",
    },
    {
      q: "Is my data secure?",
      a: "Yes. EDGE enforces strict role-based access control, regional office tenant isolation, and encrypted document storage in compliance with the Data Privacy Act of 2012 (RA 10173).",
    },
  ];

  type IconName = "shield" | "search" | "file-text";
  const features: {
    tag: string;
    title: string;
    desc: string;
    icon: IconName;
  }[] = [
    {
      tag: "SECURITY",
      title: "Secure & Trusted",
      desc: "Encrypted document storage, regional jurisdiction routing, and Data Privacy Act compliance protect every filing.",
      icon: "shield",
    },
    {
      tag: "REAL-TIME",
      title: "Live SOA, OP & Tracking",
      desc: "Track evaluation stages, receive instant compliance alerts, and view your Statement of Account and Order of Payment online.",
      icon: "search",
    },
    {
      tag: "WORKFLOW",
      title: "Individual & Bulk Filing",
      desc: "Guided step-by-step wizards and spreadsheet/CSV bulk filing streamline applications across all 6 NTC service categories.",
      icon: "file-text",
    },
  ];

  // Steps matching the actual 5-stage application lifecycle
  const stepsRow1 = [
    {
      number: "1",
      title: "Sign In & Choose Service",
      desc: "Select your regional office and service across Exams, Certificates, Licenses, Permits, Accreditations, or Requests.",
    },
    {
      number: "2",
      title: "Complete Form & Uploads",
      desc: "Fill out guided dynamic forms (or bulk import) and attach required documentary proofs.",
    },
    {
      number: "3",
      title: "Evaluation & SOA/OP",
      desc: "NTC evaluators review your submission, issue the Statement of Account (SOA), and approve the Order of Payment (OP).",
    },
  ];

  const stepsRow2 = [
    {
      number: "4",
      title: "Submit Payment & Verify",
      desc: "Pay via authorized channels, submit your payment proof online or at the cashier, and receive your Official Receipt (OR).",
    },
    {
      number: "5",
      title: "Official Issuance",
      desc: "Download your official NTC Admission Slip, Certificate, Permit, License, Accreditation, or resolution.",
    },
  ];

  const allStepsMobile = [...stepsRow1, ...stepsRow2];

  return (
    <View style={styles.container}>
      {/* Sticky Glassmorphic Header/Navbar - Responsive height and Logo */}
      <View
        style={[
          styles.headerOuter,
          { height: isDesktop ? 100 : isTablet ? 80 : 64 },
        ]}
      >
        <View
          style={[
            styles.headerInner,
            !isDesktop && { paddingHorizontal: isTablet ? 24 : 16 },
          ]}
        >
          <Logo height={isDesktop ? 72 : isTablet ? 50 : 36} />

          {isTabletOrDesktop ? (
            <View style={styles.navLinks}>
              <Pressable
                onPress={() => scrollToSection("about")}
                style={({ hovered }: PressableState) => [
                  styles.navLink,
                  hovered ? styles.navLinkHovered : null,
                ]}
              >
                {({ hovered }: PressableState) => (
                  <Text
                    style={[
                      styles.navLinkText,
                      hovered ? styles.navLinkTextHovered : null,
                    ]}
                  >
                    About
                  </Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => scrollToSection("howItWorks")}
                style={({ hovered }: PressableState) => [
                  styles.navLink,
                  hovered ? styles.navLinkHovered : null,
                ]}
              >
                {({ hovered }: PressableState) => (
                  <Text
                    style={[
                      styles.navLinkText,
                      hovered ? styles.navLinkTextHovered : null,
                    ]}
                  >
                    How it works
                  </Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => scrollToSection("faqs")}
                style={({ hovered }: PressableState) => [
                  styles.navLink,
                  hovered ? styles.navLinkHovered : null,
                ]}
              >
                {({ hovered }: PressableState) => (
                  <Text
                    style={[
                      styles.navLinkText,
                      hovered ? styles.navLinkTextHovered : null,
                    ]}
                  >
                    FAQs
                  </Text>
                )}
              </Pressable>
              <Button
                title="Log In"
                variant="outline"
                onPress={() => navigation?.navigate("Login")}
                style={styles.headerLoginBtn}
                hoverStyle={styles.headerLoginBtnHovered}
                textStyle={{ color: COLORS.brand[800], fontWeight: "700", fontSize: 14 }}
                icon={<Lucide name="log-in" size={14} color={COLORS.brand[800]} />}
              />
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => navigation?.navigate("Login")}
              style={styles.mobileHeaderLoginBtn}
              activeOpacity={0.8}
            >
              <Lucide name="log-in" size={14} color="#FFFFFF" />
              <Text style={styles.mobileHeaderLoginText}>Log In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Dynamic System Announcements Broadcast Banner */}
      <ClientAnnouncementBanner isMobile={isMobile} />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
      >
        {/* Animated Glow Spots */}
        <Animated.View
          style={[
            styles.glowSpotBlue,
            {
              transform: [
                {
                  translateY: Animated.add(
                    translateYBlue,
                    backgroundBlueParallax,
                  ),
                },
                { translateX: translateXBlue },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.glowSpotPink,
            {
              transform: [
                {
                  translateY: Animated.add(
                    translateYPink,
                    backgroundPinkParallax,
                  ),
                },
                { translateX: translateXPink },
              ],
            },
          ]}
        />
        {Platform.OS === "web" && <View style={styles.glowSpotCenter} />}

        {/* Hero Section */}
        <Animated.View
          style={[
            styles.heroSection,
            isDesktop ? styles.heroSectionDesktop : null,
            {
              paddingVertical: isDesktop ? 104 : isTablet ? 64 : 36,
              paddingHorizontal: isDesktop ? 24 : isTablet ? 24 : 16,
              opacity: fadeAnimHero,
              transform: [
                {
                  translateY: Animated.add(
                    slideAnimHero,
                    heroParallaxTranslateY,
                  ),
                },
              ],
            },
          ]}
        >
          <View style={isDesktop ? styles.heroLeftCol : styles.heroFullWidth}>
            {/* Pill Badge with Fill Color */}
            <View
              style={[
                styles.pillBadge,
                isDesktop
                  ? { alignSelf: "flex-start" }
                  : { alignSelf: "center" },
              ]}
            >
              <View style={styles.pillBadgeDot} />
              <Text style={styles.pillBadgeText}>Official NTC-EDGE Portal</Text>
            </View>

            {/* Split Color Hero Title */}
            <Text
              style={[
                styles.heroTitle,
                isTablet
                  ? { fontSize: 46, lineHeight: 56 }
                  : isDesktop
                  ? styles.heroTitleDesktop
                  : null,
              ]}
            >
              <Text style={styles.titleBlue}>Empowering </Text>
              <Text style={styles.titleRed}>NTC's</Text>
              {"\n"}
              <Text style={styles.titleBlue}>Data Governance</Text>
            </Text>

            <Text
              style={[
                styles.heroSubtitle,
                isDesktop ? styles.heroSubtitleDesktop : null,
              ]}
            >
              Streamline your government services experience. Apply for radio
              operator examinations, certificates, permits, station licenses,
              CPE supplier accreditations, and consumer requests with secure,
              transparent processing powered by EDGE.
            </Text>

            <View
              style={[
                styles.heroButtonsRow,
                isMobile && {
                  flexDirection: "column",
                  width: "100%",
                  gap: 12,
                  alignItems: "stretch",
                },
                isTablet && {
                  justifyContent: "center",
                },
              ]}
            >
              <Button
                title="Get Started"
                onPress={() => openGetStartedModal()}
                size="lg"
                style={
                  isMobile ? styles.heroPrimaryBtnMobile : styles.heroPrimaryBtn
                }
                hoverStyle={styles.heroPrimaryBtnHovered}
                icon={
                  <Lucide
                    name="arrow-right"
                    size={18}
                    color={COLORS.neutral.white}
                  />
                }
              />
              <Button
                title="Track Application"
                onPress={() => setIsTrackModalVisible(true)}
                variant="outline"
                size="lg"
                style={
                  isMobile
                    ? styles.heroSecondaryBtnMobile
                    : styles.heroSecondaryBtn
                }
                hoverStyle={styles.heroSecondaryBtnHovered}
                textStyle={{ color: "#2563EB" }}
                hoverTextStyle={{ color: "#1D4ED8" }}
                icon={<Lucide name="search" size={18} color="#2563EB" />}
              />
            </View>
          </View>

          {isTabletOrDesktop ? (
            <Animated.View
              style={[
                isDesktop
                  ? styles.heroRightCol
                  : { width: "100%", alignItems: "center", marginTop: 40 },
                { transform: [{ translateY: floatAnimMockup }] },
              ]}
            >
              {/* Static Dashboard Preview Card */}
              <View style={[styles.mockupCard, SHADOWS.modal]}>
                <View style={styles.mockupHeader}>
                  <View style={styles.mockupDots}>
                    <View
                      style={[styles.mockupDot, { backgroundColor: "#EF4444" }]}
                    />
                    <View
                      style={[styles.mockupDot, { backgroundColor: "#F59E0B" }]}
                    />
                    <View
                      style={[styles.mockupDot, { backgroundColor: "#10B981" }]}
                    />
                  </View>
                  <View style={styles.mockupUrlContainer}>
                    <Lucide
                      name="lock"
                      size={10}
                      color={COLORS.neutral[400]}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.mockupHeaderText}>ntc-edge.gov.ph</Text>
                  </View>
                </View>

                <View style={styles.mockupBody}>
                  {/* Stats Row */}
                  <View style={styles.mockupStatsRow}>
                    <View style={styles.mockupStatCard}>
                      <Lucide
                        name="file-text"
                        size={14}
                        color="#2563EB"
                        style={{ marginBottom: 4 }}
                      />
                      <Text style={styles.mockupStatLabel}>Applications</Text>
                      <Text
                        style={[styles.mockupStatValue, { color: "#2563EB" }]}
                      >
                        12,450
                      </Text>
                    </View>
                    <View style={styles.mockupStatCard}>
                      <Lucide
                        name="clock"
                        size={14}
                        color="#DC2626"
                        style={{ marginBottom: 4 }}
                      />
                      <Text style={styles.mockupStatLabel}>Pending</Text>
                      <Text
                        style={[styles.mockupStatValue, { color: "#DC2626" }]}
                      >
                        18
                      </Text>
                    </View>
                    <View style={styles.mockupStatCard}>
                      <Lucide
                        name="check-circle"
                        size={14}
                        color="#10B981"
                        style={{ marginBottom: 4 }}
                      />
                      <Text style={styles.mockupStatLabel}>Approved</Text>
                      <Text
                        style={[styles.mockupStatValue, { color: "#10B981" }]}
                      >
                        99.4%
                      </Text>
                    </View>
                  </View>

                  {/* Active Application Card */}
                  <View style={styles.mockupAppCard}>
                    <View style={styles.mockupAppHeader}>
                      <View>
                        <Text style={styles.mockupAppTitle}>
                          Radio Station License
                        </Text>
                        <Text style={styles.mockupAppMeta}>
                          Ref: NTC-2026-9812
                        </Text>
                      </View>
                      <View style={styles.mockupStatusBadge}>
                        <Text style={styles.mockupStatusText}>IN REVIEW</Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.mockupProgressContainer}>
                      <View style={styles.mockupProgressBar}>
                        <View
                          style={[
                            styles.mockupProgressFill,
                            { backgroundColor: "#2563EB", width: "65%" },
                          ]}
                        />
                        <View
                          style={[
                            styles.mockupProgressFillRed,
                            {
                              backgroundColor: "#DC2626",
                              width: "10%",
                              left: "65%",
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.mockupProgressLabels}>
                        <Text style={styles.mockupProgressLabel}>
                          Submission
                        </Text>
                        <Text style={styles.mockupProgressLabel}>
                          Evaluation
                        </Text>
                        <Text style={styles.mockupProgressLabel}>Issuance</Text>
                      </View>
                    </View>
                  </View>

                  {/* Realtime Alert Activity */}
                  <View style={styles.mockupActivityCard}>
                    <Lucide
                      name="bell"
                      size={14}
                      color="#2563EB"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.mockupActivityText}>
                      License issued successfully for{" "}
                      <Text style={{ fontWeight: "600" }}>CIGNAL TV INC.</Text>
                    </Text>
                    <Text style={styles.mockupActivityTime}>2m ago</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          ) : null}
        </Animated.View>

        {/* "About EDGE" Section */}
        <Animated.View
          style={[
            styles.aboutEdgeSection,
            isDesktop ? styles.rowLayout : styles.columnLayout,
            {
              opacity: aboutFade,
              transform: [{ translateY: aboutTranslateY }],
            },
          ]}
          onLayout={(e) => handleSectionLayout("about", e.nativeEvent.layout.y)}
        >
          {isTabletOrDesktop ? (
            <View
              style={
                isDesktop
                  ? styles.aboutLeftCol
                  : {
                      width: "100%",
                      alignItems: "center",
                      marginBottom: SPACING[32],
                    }
              }
            >
              <View
                style={[
                  styles.aboutGraphicCard,
                  SHADOWS.card,
                  isTablet && { maxWidth: 560 },
                ]}
              >
                <View style={styles.aboutGraphicHeader}>
                  <View style={styles.aboutGraphicBadge}>
                    <Lucide name="shield" size={20} color="#2563EB" />
                  </View>
                  <Text style={styles.aboutGraphicHeaderText}>
                    NTC SECURE GATEWAY
                  </Text>
                </View>

                {/* Animated Scroll-Down Slide transition for the 6 canonical service categories */}
                <Animated.View
                  style={[
                    styles.aboutGraphicGrid,
                    { transform: [{ translateY: aboutGridTranslateY }] },
                  ]}
                >
                  <View style={styles.aboutGridItem}>
                    <Lucide
                      name="award"
                      size={20}
                      color="#2563EB"
                      style={{ marginBottom: 6 }}
                    />
                    <Text style={styles.aboutGridItemText}>Examinations</Text>
                  </View>
                  <View style={styles.aboutGridItem}>
                    <Lucide
                      name="file-text"
                      size={20}
                      color="#2563EB"
                      style={{ marginBottom: 6 }}
                    />
                    <Text style={styles.aboutGridItemText}>Certificates</Text>
                  </View>
                  <View style={styles.aboutGridItem}>
                    <Lucide
                      name="shield"
                      size={20}
                      color="#2563EB"
                      style={{ marginBottom: 6 }}
                    />
                    <Text style={styles.aboutGridItemText}>Licenses</Text>
                  </View>
                  <View style={styles.aboutGridItem}>
                    <Lucide
                      name="key"
                      size={20}
                      color="#2563EB"
                      style={{ marginBottom: 6 }}
                    />
                    <Text style={styles.aboutGridItemText}>Permits</Text>
                  </View>
                  <View style={styles.aboutGridItem}>
                    <Lucide
                      name="activity"
                      size={20}
                      color="#2563EB"
                      style={{ marginBottom: 6 }}
                    />
                    <Text style={styles.aboutGridItemText}>Accreditations</Text>
                  </View>
                  <View style={styles.aboutGridItem}>
                    <Lucide
                      name="help-circle"
                      size={20}
                      color="#2563EB"
                      style={{ marginBottom: 6 }}
                    />
                    <Text style={styles.aboutGridItemText}>Requests & Complaints</Text>
                  </View>
                </Animated.View>

                <View style={styles.aboutGraphicFooter}>
                  <View style={styles.dotIndicatorActive} />
                  <Text style={styles.aboutGraphicFooterText}>
                    Data Sync Active • Live Encryption
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          <View style={isDesktop ? styles.aboutRightCol : styles.aboutFullCol}>
            <View style={styles.aboutBadge}>
              <Text style={styles.aboutBadgeText}>PLATFORM OVERVIEW</Text>
            </View>
            <Text style={styles.aboutTitle}>About EDGE</Text>

            <Text style={styles.aboutHighlightText}>
              Welcome to the Electronic Data Governance and Evaluation (EDGE)
              application. This system is a flagship initiative by the National
              Telecommunications Commission (NTC) to modernize and streamline
              public services.
            </Text>

            <Text style={styles.aboutBodyText}>
              Our mission is to provide a transparent, efficient, and accessible
              online platform for all stakeholders. EDGE is a secure online
              platform developed to streamline application processing,
              licensing, and public requests.
            </Text>

            <View style={styles.aboutInfoBox}>
              <Lucide
                name="info"
                size={20}
                color="#2563EB"
                style={{ marginRight: 12, marginTop: 2 }}
              />
              <Text style={styles.aboutInfoBoxText}>
                This portal processes Radio Operator Examinations, Certificates,
                Radio Station Licenses, Permits, CPE Supplier Accreditations,
                and Consumer Requests & Complaints across all NTC Regional Offices.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* "Why Choose EDGE?" Section */}
        <Animated.View
          style={[
            styles.featuresSection,
            {
              opacity: featuresFade,
              transform: [{ translateY: featuresTranslateY }],
            },
          ]}
        >
          <Text style={styles.featuresTitle}>Why Choose EDGE?</Text>
          <Text style={styles.featuresSubtitle}>
            Everything you need for seamless government services
          </Text>

          <View
            style={[
              styles.featuresGrid,
              isDesktop ? styles.rowLayout : styles.columnLayout,
            ]}
          >
            {features.map((feat, index) => {
              const cardAnim = cardAnims[index];
              const cardTranslateY = cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              });
              return (
                <Animated.View
                  key={feat.title}
                  style={[
                    isDesktop ? styles.featCardDesktop : null,
                    {
                      opacity: cardAnim,
                      transform: [{ translateY: cardTranslateY }],
                    },
                  ]}
                >
                  <View style={[styles.featCard, SHADOWS.card]}>
                    <View style={styles.featTopAccentBar} />
                    <View style={styles.featCardHeader}>
                      <View style={styles.featIconWrapper}>
                        <Lucide
                          name={feat.icon}
                          size={22}
                          color={COLORS.neutral.white}
                        />
                      </View>
                      <View style={styles.featTagBadge}>
                        <Text style={styles.featTagBadgeText}>{feat.tag}</Text>
                      </View>
                    </View>
                    <Text style={styles.featCardTitle}>{feat.title}</Text>
                    <Text style={styles.featCardDesc}>{feat.desc}</Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* How It Works Section */}
        <Animated.View
          style={[
            styles.sectionContainer,
            styles.greyBg,
            {
              opacity: howItWorksFade,
              transform: [{ translateY: howItWorksTranslateY }],
            },
          ]}
          onLayout={(e) =>
            handleSectionLayout("howItWorks", e.nativeEvent.layout.y)
          }
        >
          <Text style={[styles.sectionTitleBlue, styles.centerText]}>
            How It Works
          </Text>

          {isDesktop ? (
            <View style={styles.stepsTwoRowContainer}>
              {/* Row 1: Steps 1, 2, 3 */}
              <View style={styles.stepsRowTop}>
                {stepsRow1.map((st, index) => {
                  const globalIndex = index;
                  const stepAnim = stepAnims[globalIndex];
                  const stepTranslateY = stepAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [25, 0],
                  });

                  return (
                    <React.Fragment key={st.number}>
                      <Animated.View
                        style={[
                          styles.stepCardDesktopExact,
                          {
                            opacity: stepAnim,
                            transform: [{ translateY: stepTranslateY }],
                          },
                        ]}
                      >
                        <View style={[styles.stepCardExact, SHADOWS.card]}>
                          <View style={styles.stepCircleBadge}>
                            <Text style={styles.stepCircleBadgeText}>
                              {st.number}
                            </Text>
                          </View>
                          <Text style={styles.stepCardExactTitle}>
                            {st.title}
                          </Text>
                          <Text style={styles.stepCardExactDesc}>
                            {st.desc}
                          </Text>
                        </View>
                      </Animated.View>

                      {index < stepsRow1.length - 1 && (
                        <View style={styles.arrowDesktopExact}>
                          <Lucide
                            name="arrow-right"
                            size={16}
                            color="#2563EB"
                          />
                        </View>
                      )}
                    </React.Fragment>
                  );
                })}
              </View>

              {/* Row 2: Steps 4, 5 centered */}
              <View style={styles.stepsRowBottom}>
                {stepsRow2.map((st, index) => {
                  const globalIndex = index + 3;
                  const stepAnim = stepAnims[globalIndex];
                  const stepTranslateY = stepAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [25, 0],
                  });

                  return (
                    <React.Fragment key={st.number}>
                      <Animated.View
                        style={[
                          styles.stepCardDesktopExact,
                          {
                            opacity: stepAnim,
                            transform: [{ translateY: stepTranslateY }],
                          },
                        ]}
                      >
                        <View style={[styles.stepCardExact, SHADOWS.card]}>
                          <View style={styles.stepCircleBadge}>
                            <Text style={styles.stepCircleBadgeText}>
                              {st.number}
                            </Text>
                          </View>
                          <Text style={styles.stepCardExactTitle}>
                            {st.title}
                          </Text>
                          <Text style={styles.stepCardExactDesc}>
                            {st.desc}
                          </Text>
                        </View>
                      </Animated.View>

                      {index < stepsRow2.length - 1 && (
                        <View style={styles.arrowDesktopExact}>
                          <Lucide
                            name="arrow-right"
                            size={16}
                            color="#2563EB"
                          />
                        </View>
                      )}
                    </React.Fragment>
                  );
                })}
              </View>
            </View>
          ) : (
            /* Mobile vertical layout */
            <View style={styles.stepsMobileContainer}>
              {allStepsMobile.map((st, index) => {
                const stepAnim = stepAnims[index];
                const stepTranslateY = stepAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [25, 0],
                });

                return (
                  <React.Fragment key={st.number}>
                    <Animated.View
                      style={[
                        { width: "100%", alignItems: "center" },
                        {
                          opacity: stepAnim,
                          transform: [{ translateY: stepTranslateY }],
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.stepCardExact,
                          SHADOWS.card,
                          { width: "100%", maxWidth: isTablet ? 480 : 340 },
                        ]}
                      >
                        <View style={styles.stepCircleBadge}>
                          <Text style={styles.stepCircleBadgeText}>
                            {st.number}
                          </Text>
                        </View>
                        <Text style={styles.stepCardExactTitle}>
                          {st.title}
                        </Text>
                        <Text style={styles.stepCardExactDesc}>{st.desc}</Text>
                      </View>
                    </Animated.View>

                    {index < allStepsMobile.length - 1 && (
                      <View
                        style={{
                          marginVertical: SPACING[12],
                          alignItems: "center",
                        }}
                      >
                        <Lucide name="arrow-down" size={16} color="#2563EB" />
                      </View>
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          )}
        </Animated.View>

        {/* FAQs Accordion */}
        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: faqsFade,
              transform: [{ translateY: faqsTranslateY }],
            },
          ]}
          onLayout={(e) => handleSectionLayout("faqs", e.nativeEvent.layout.y)}
        >
          <Text style={[styles.sectionTitleBlue, styles.centerText]}>
            Frequently Asked Questions
          </Text>

          <View style={styles.faqList}>
            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              const faqAnim = faqAnims[idx];
              const faqAnswerStyle = {
                maxHeight: faqAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 150],
                }),
                opacity: faqAnim,
                borderTopWidth: faqAnim.interpolate({
                  inputRange: [0, 0.1, 1],
                  outputRange: [0, 1, 1],
                }),
              };

              return (
                <View
                  key={idx}
                  style={[
                    styles.faqItem,
                    SHADOWS.card,
                    isExpanded ? styles.faqItemExpanded : null,
                  ]}
                >
                  <Pressable
                    onPress={() => handleFaqPress(idx)}
                    style={({ hovered }: PressableState) => [
                      styles.faqHeader,
                      hovered ? styles.faqHeaderHovered : null,
                    ]}
                  >
                    <Text style={styles.faqQuestion}>{faq.q}</Text>
                    <View
                      style={[
                        styles.faqIconCircle,
                        isExpanded ? styles.faqIconCircleActive : null,
                      ]}
                    >
                      <Lucide
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={isExpanded ? COLORS.neutral.white : "#2563EB"}
                      />
                    </View>
                  </Pressable>

                  <Animated.View
                    style={[
                      styles.faqAnswerContainer,
                      faqAnswerStyle,
                      { overflow: "hidden" },
                    ]}
                  >
                    <Text style={styles.faqAnswer}>{faq.a}</Text>
                  </Animated.View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Dynamic Blue Gradient CTA Section */}
        <View style={styles.ctaBoxContainer}>
          <View style={styles.ctaBox}>
            <Text style={styles.ctaBoxTitle}>
              Ready to Transform Your Experience?
            </Text>
            <Text style={styles.ctaBoxSubtitle}>
              Join thousands of users who have simplified their government
              service applications with EDGE. Secure, efficient, and
              transparent.
            </Text>
            <Button
              title="Begin Your Application"
              onPress={() => openGetStartedModal()}
              style={styles.ctaPrimaryBtn}
              hoverStyle={styles.ctaPrimaryBtnHovered}
              textStyle={{ color: "#2563EB", fontWeight: "700" }}
              hoverTextStyle={{ color: "#1D4ED8", fontWeight: "700" }}
              icon={<Lucide name="arrow-right" size={18} color="#2563EB" />}
            />
          </View>
        </View>

        {/* Sleek Minimal Footer */}
        <View style={styles.footerContainer}>
          <View style={styles.footerInner}>
            <View
              style={[
                styles.footerMainContent,
                isDesktop ? styles.rowLayout : styles.columnLayout,
              ]}
            >
              {/* Branding Column */}
              <View style={styles.footerBrandCol}>
                <View style={{ alignSelf: "flex-start", marginBottom: 12 }}>
                  <Logo height={44} variant="footer" />
                </View>
                <Text style={styles.footerTaglineTitle}>
                  National Telecommunications Commission
                </Text>
                <Text style={styles.footerTaglineDesc}>
                  Electronic Data Governance and Evaluation System
                </Text>
                <View style={styles.footerLiveSyncBadge}>
                  <View style={styles.dotIndicatorActive} />
                  <Text style={styles.footerLiveSyncText}>
                    NTC EDGE PLATFORM ONLINE
                  </Text>
                </View>
              </View>

              {/* Links Columns */}
              <View style={styles.footerNavColumns}>
                {/* Legal Column */}
                <View style={styles.footerNavCol}>
                  <View style={styles.footerColHeader}>
                    <Lucide
                      name="shield"
                      size={15}
                      color="#93C5FD"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.footerColTitle}>
                      Legal & Transparency
                    </Text>
                  </View>
                  <Pressable
                    onPress={() =>
                      setActiveFooterModal(FOOTER_POLICIES["user-agreement"])
                    }
                    style={({ hovered }: PressableState) => [
                      styles.footerLinkItem,
                      hovered ? styles.footerLinkItemHovered : null,
                    ]}
                  >
                    {({ hovered }: PressableState) => (
                      <View style={styles.footerLinkRow}>
                        <Lucide
                          name="file-text"
                          size={13}
                          color={hovered ? "#60A5FA" : "#64748B"}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.footerLinkText,
                            hovered ? styles.footerLinkTextHovered : null,
                          ]}
                        >
                          User Agreement
                        </Text>
                      </View>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      setActiveFooterModal(FOOTER_POLICIES["privacy-policy"])
                    }
                    style={({ hovered }: PressableState) => [
                      styles.footerLinkItem,
                      hovered ? styles.footerLinkItemHovered : null,
                    ]}
                  >
                    {({ hovered }: PressableState) => (
                      <View style={styles.footerLinkRow}>
                        <Lucide
                          name="lock"
                          size={13}
                          color={hovered ? "#60A5FA" : "#64748B"}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.footerLinkText,
                            hovered ? styles.footerLinkTextHovered : null,
                          ]}
                        >
                          Privacy Policy
                        </Text>
                      </View>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      setActiveFooterModal(FOOTER_POLICIES["cookie-policy"])
                    }
                    style={({ hovered }: PressableState) => [
                      styles.footerLinkItem,
                      hovered ? styles.footerLinkItemHovered : null,
                    ]}
                  >
                    {({ hovered }: PressableState) => (
                      <View style={styles.footerLinkRow}>
                        <Lucide
                          name="database"
                          size={13}
                          color={hovered ? "#60A5FA" : "#64748B"}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.footerLinkText,
                            hovered ? styles.footerLinkTextHovered : null,
                          ]}
                        >
                          Cookie Policy
                        </Text>
                      </View>
                    )}
                  </Pressable>
                </View>

                {/* Support Column */}
                <View style={styles.footerNavCol}>
                  <View style={styles.footerColHeader}>
                    <Lucide
                      name="headphones"
                      size={15}
                      color="#93C5FD"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.footerColTitle}>
                      Support & Community
                    </Text>
                  </View>
                  <Pressable
                    onPress={() =>
                      setActiveFooterModal(
                        FOOTER_POLICIES["community-guidelines"],
                      )
                    }
                    style={({ hovered }: PressableState) => [
                      styles.footerLinkItem,
                      hovered ? styles.footerLinkItemHovered : null,
                    ]}
                  >
                    {({ hovered }: PressableState) => (
                      <View style={styles.footerLinkRow}>
                        <Lucide
                          name="users"
                          size={13}
                          color={hovered ? "#60A5FA" : "#64748B"}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.footerLinkText,
                            hovered ? styles.footerLinkTextHovered : null,
                          ]}
                        >
                          Community Guidelines
                        </Text>
                      </View>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      setActiveFooterModal(FOOTER_POLICIES["send-feedback"])
                    }
                    style={({ hovered }: PressableState) => [
                      styles.footerLinkItem,
                      hovered ? styles.footerLinkItemHovered : null,
                    ]}
                  >
                    {({ hovered }: PressableState) => (
                      <View style={styles.footerLinkRow}>
                        <Lucide
                          name="message-square"
                          size={13}
                          color={hovered ? "#60A5FA" : "#64748B"}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.footerLinkText,
                            hovered ? styles.footerLinkTextHovered : null,
                          ]}
                        >
                          Send Feedback
                        </Text>
                      </View>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      setActiveFooterModal(FOOTER_POLICIES["help-center"])
                    }
                    style={({ hovered }: PressableState) => [
                      styles.footerLinkItem,
                      hovered ? styles.footerLinkItemHovered : null,
                    ]}
                  >
                    {({ hovered }: PressableState) => (
                      <View style={styles.footerLinkRow}>
                        <Lucide
                          name="help-circle"
                          size={13}
                          color={hovered ? "#60A5FA" : "#64748B"}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.footerLinkText,
                            hovered ? styles.footerLinkTextHovered : null,
                          ]}
                        >
                          Help Center
                        </Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Bottom Copyright */}
            <View style={styles.footerBottomRow}>
              <Text style={styles.copyrightText}>
                © {new Date().getFullYear()} EDGE Portal • National Telecommunications Commission •
                Republic of the Philippines. All rights reserved.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Wider, Ultra-Premium Interactive Policy & Help Dialog */}
      <Modal
        visible={activeFooterModal !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveFooterModal(null)}
      >
        <TouchableOpacity
          style={[
            styles.modalOverlay,
            isMobile && { padding: SPACING[12] },
          ]}
          activeOpacity={1}
          onPress={() => setActiveFooterModal(null)}
        >
          <TouchableOpacity
            style={[
              styles.modalCard,
              SHADOWS.modal,
              {
                maxWidth: isDesktop ? 840 : isTablet ? 640 : 440,
                padding: isMobile ? 20 : isTablet ? 28 : 36,
                borderRadius: isMobile ? 20 : 24,
              },
            ]}
            activeOpacity={1}
            onPress={() => {}}
          >
            {/* Close X Button */}
            <Pressable
              style={({ hovered }: PressableState) => [
                styles.modalCloseBtn,
                hovered ? styles.closeBtnHovered : null,
              ]}
              onPress={() => setActiveFooterModal(null)}
            >
              <Lucide name="x" size={20} color={COLORS.neutral[500]} />
            </Pressable>

            {activeFooterModal && (
              <ScrollView
                style={{ maxHeight: isMobile ? 460 : 560 }}
                showsVerticalScrollIndicator={true}
              >
                {/* Header */}
                <View style={styles.policyModalHeader}>
                  <View style={styles.policyHeaderIconCircle}>
                    <Lucide name="file-text" size={20} color="#2563EB" />
                  </View>
                  <Text
                    style={[
                      styles.policyModalTitle,
                      isMobile && { fontSize: 19 },
                    ]}
                  >
                    {activeFooterModal.title}
                  </Text>
                </View>
                <View style={styles.policyTitleDivider} />

                {/* Intro Box */}
                <View style={styles.policyIntroBox}>
                  <Lucide
                    name="info"
                    size={18}
                    color="#2563EB"
                    style={{ marginRight: 10, marginTop: 2 }}
                  />
                  <Text style={styles.policyIntroText}>
                    {activeFooterModal.intro}
                  </Text>
                </View>

                {/* Section Cards */}
                {activeFooterModal.sections.map((sec, i) => (
                  <View
                    key={i}
                    style={[styles.policySectionCard, SHADOWS.card]}
                  >
                    <Text style={styles.policySecTitle}>{sec.title}</Text>
                    <Text style={styles.policySecBody}>{sec.body}</Text>
                    {sec.highlight && (
                      <View style={styles.policyHighlightBadge}>
                        <Lucide
                          name="mail"
                          size={14}
                          color="#2563EB"
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.policyHighlightText}>
                          {sec.highlight}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Track Application Modal (Authenticated Portal Gateway) */}
      <Modal
        visible={isTrackModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsTrackModalVisible(false)}
      >
        <TouchableOpacity
          style={[
            styles.modalOverlay,
            isMobile && { padding: SPACING[12] },
          ]}
          activeOpacity={1}
          onPress={() => setIsTrackModalVisible(false)}
        >
          <TouchableOpacity
            style={[
              styles.modalCard,
              SHADOWS.modal,
              {
                maxWidth: isTablet ? 480 : 460,
                padding: 0,
                borderRadius: 24,
                overflow: "hidden",
              },
            ]}
            activeOpacity={1}
            onPress={() => {}}
          >
            {/* Window Header Bar */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#F8FAFC",
                paddingHorizontal: 18,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.neutral[200],
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 5,
                    backgroundColor: "#EF4444",
                  }}
                />
                <View
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 5,
                    backgroundColor: "#F59E0B",
                  }}
                />
                <View
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 5,
                    backgroundColor: "#10B981",
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: COLORS.neutral[500],
                }}
              >
                Application Status Gateway
              </Text>
              <Pressable
                style={({ hovered }: PressableState) => [
                  { padding: 4, borderRadius: 12 },
                  hovered ? styles.closeBtnHovered : null,
                ]}
                onPress={() => setIsTrackModalVisible(false)}
              >
                <Lucide name="x" size={18} color={COLORS.neutral[500]} />
              </Pressable>
            </View>

            <View style={{ padding: isMobile ? 20 : 28 }}>
              {/* Modal Logo */}
              <View style={styles.modalHeader}>
                <Logo height={isMobile ? 38 : 44} />
              </View>

              <Text style={[styles.modalTitle, isMobile && { fontSize: 20 }]}>
                Track Your Application
              </Text>

              <Text style={styles.modalInstructionText}>
                For your data privacy and security, live application status,
                evaluator compliance remarks, Statement of Account (SOA), Order of
                Payment (OP), and Official Receipts are protected inside your
                authenticated account.
              </Text>

              <View style={[styles.resultCard, { marginBottom: SPACING[20] }]}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Lucide
                    name="check-circle"
                    size={16}
                    color="#2563EB"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[styles.resultValue, { textAlign: "left", flex: 1 }]}
                  >
                    Real-time Evaluation & Approval Timeline
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Lucide
                    name="file-text"
                    size={16}
                    color="#2563EB"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[styles.resultValue, { textAlign: "left", flex: 1 }]}
                  >
                    View & Print Statement of Account (SOA) & Order of Payment
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Lucide
                    name="download"
                    size={16}
                    color="#2563EB"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[styles.resultValue, { textAlign: "left", flex: 1 }]}
                  >
                    Submit Compliance, Payment Proof & Download Issuances
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.modalButtonsContainer,
                  { marginBottom: 0 },
                ]}
              >
                <Button
                  title="Sign In to My Applications"
                  onPress={() => {
                    setIsTrackModalVisible(false);
                    navigation?.navigate("Login");
                  }}
                  style={styles.modalActionBtn}
                  hoverStyle={styles.heroPrimaryBtnHovered}
                  icon={
                    <Lucide
                      name="log-in"
                      size={16}
                      color={COLORS.neutral.white}
                    />
                  }
                />

                <Button
                  title="Create New Account"
                  variant="outline"
                  onPress={() => {
                    setIsTrackModalVisible(false);
                    navigation?.navigate("SignUp");
                  }}
                  style={{
                    ...styles.modalActionBtn,
                    ...styles.modalGuestBtn,
                    marginBottom: 0,
                  }}
                  hoverStyle={styles.heroSecondaryBtnHovered}
                  textStyle={{ color: "#2563EB" }}
                  hoverTextStyle={{ color: "#1D4ED8" }}
                  icon={<Lucide name="user-plus" size={16} color="#2563EB" />}
                />
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
