import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
  Platform,
  Animated,
  Modal,
} from 'react-native';
import { Feather as Lucide } from '@expo/vector-icons';
import { COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY } from '../../shared/theme/tokens';
import { Button } from '../../shared/components/Button';
import { Logo } from '../../shared/components/Logo';
import { Input } from '../../shared/components/Input';
import { useGuestAuth } from '../../auth/context/GuestAuthContext';
import { PHILIPPINE_REGIONS } from '../../shared/constants/regions';

type UnauthParamList = {
  Landing: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

interface LandingScreenProps {
  navigation?: {
    navigate: (screen: keyof UnauthParamList) => void;
  };
}

interface TrackingResult {
  referenceNo: string;
  region: string;
  type: string;
  applicantName: string;
  status: string;
  updatedAt: string;
  stage: string;
}

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
  'user-agreement': {
    title: 'User Agreement',
    intro: 'Welcome to the EDGE Portal. This User Agreement governs your access to and use of all services provided by the National Telecommunications Commission (NTC) via this platform.',
    sections: [
      {
        title: '1. Acceptance of Terms',
        body: 'By accessing or using the EDGE Portal, you agree to be bound by these terms and all policies incorporated herein. If you do not agree, you must cease use immediately.',
      },
      {
        title: '2. User Obligations',
        body: 'You agree to use the portal only for lawful purposes related to NTC services. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
      },
      {
        title: '3. Termination',
        body: 'The NTC reserves the right to suspend or terminate your account and access to the service for any breach of this agreement without prior notice.',
      },
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    intro: 'Your privacy is important to us. This policy outlines how the NTC collects, uses, and protects the personal and application data you provide through the EDGE Portal.',
    sections: [
      {
        title: '1. Data Collection',
        body: 'We collect personal information (e.g., name, address, contact details) and transactional data related to your applications and requests required for NTC services.',
      },
      {
        title: '2. Use of Data',
        body: 'The collected data is used exclusively for processing NTC services, verifying identities, internal reporting, and improving the portal\'s functionality, in accordance with applicable Philippine data privacy laws.',
      },
      {
        title: '3. Data Security',
        body: 'We implement technical and organizational measures to safeguard your data against unauthorized access, disclosure, alteration, and destruction.',
      },
    ],
  },
  'community-guidelines': {
    title: 'Community Guidelines',
    intro: 'These guidelines promote a safe and productive environment for all users of the EDGE Portal, especially when utilizing public-facing features like feedback forums or communication channels.',
    sections: [
      {
        title: '1. Respectful Conduct',
        body: 'All interactions must be respectful, professional, and courteous. Hate speech, harassment, threats, or discrimination are strictly prohibited.',
      },
      {
        title: '2. Truthfulness',
        body: 'Do not submit false, misleading, or fraudulent information in any application or communication within the portal. Accuracy and honesty are mandatory.',
      },
      {
        title: '3. Prohibited Content',
        body: 'Do not upload or share content that is illegal, defamatory, obscene, or violates the intellectual property rights of others. Violations may lead to account suspension and legal action.',
      },
    ],
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    intro: 'This portal uses cookies to ensure optimal performance and user experience. By continuing to use the EDGE Portal, you consent to the use of cookies.',
    sections: [
      {
        title: '1. What are Cookies?',
        body: 'Cookies are small text files stored on your device that help us remember your preferences and settings, and analyze how you interact with our services.',
      },
      {
        title: '2. Types of Cookies Used',
        body: '• Essential Cookies: Necessary for the website to function securely (e.g., managing your session).\n• Performance Cookies: Used for analytics to improve the portal\'s speed and reliability.',
      },
      {
        title: '3. Managing Cookies',
        body: 'You may control and/or delete cookies as you wish. Please note that disabling essential cookies may affect the functionality of the EDGE Portal.',
      },
    ],
  },
  'send-feedback': {
    title: 'Send Feedback',
    intro: 'Your feedback is crucial for the continuous improvement of the EDGE Portal. Please use this channel to submit suggestions, bug reports, or compliments.',
    sections: [
      {
        title: '1. Focus on Specifics',
        body: 'When reporting issues, include the steps you took, the device you used, and the desired outcome. For suggestions, explain how the change would benefit your experience.',
      },
      {
        title: '2. Response Time',
        body: 'While we read all feedback, we cannot promise a personal response to every submission. If your concern is urgent, please refer to the Help Center for official support channels.',
      },
      {
        title: '3. Confidentiality',
        body: 'All feedback submitted is considered non-confidential and may be used by the NTC to enhance the system without compensation.',
      },
    ],
  },
  'help-center': {
    title: 'Help Center & Support',
    intro: 'Find comprehensive guides, video tutorials, and technical support for all NTC EDGE Portal services.',
    sections: [
      {
        title: '1. Self-Service Resources',
        body: 'Before contacting support, please check our extensive FAQ section and step-by-step guides available within the portal\'s main Help Center link (this will lead to a dedicated website).',
      },
      {
        title: '2. Contact Information',
        body: 'For application-specific inquiries or technical issues that cannot be resolved via self-service:',
        highlight: 'Email Support: support@ntcedge.gov.ph',
      },
      {
        title: '3. Operating Hours',
        body: 'Live support is available Monday to Friday, 8:00 AM to 5:00 PM (Philippine Standard Time).',
      },
    ],
  },
};

export function LandingScreen({ navigation }: LandingScreenProps = {}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { loginAsGuest } = useGuestAuth();

  // Modal visibility states
  const [isGetStartedModalVisible, setIsGetStartedModalVisible] = useState(false);
  const [isTrackModalVisible, setIsTrackModalVisible] = useState(false);
  const [activeFooterModal, setActiveFooterModal] = useState<FooterPolicyContent | null>(null);

  // Tracking form states
  const [referenceNo, setReferenceNo] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  
  // Section Y coordinates for smooth scroll
  const [sectionYCoords, setSectionYCoords] = useState<{ [key: string]: number }>({});
  
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
    extrapolate: 'clamp',
  });

  // Parallax translation for background pink glow: moves in opposite direction
  const backgroundPinkParallax = scrollY.interpolate({
    inputRange: [0, 1000],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  // Hero Section Parallax translation on scroll
  const heroParallaxTranslateY = scrollY.interpolate({
    inputRange: [0, 500],
    outputRange: [0, -40],
    extrapolate: 'clamp',
  });

  // About EDGE reveal animations
  const aboutFade = scrollY.interpolate({
    inputRange: [0, 350],
    outputRange: [0.4, 1],
    extrapolate: 'clamp',
  });
  const aboutTranslateY = scrollY.interpolate({
    inputRange: [0, 350],
    outputRange: [35, 0],
    extrapolate: 'clamp',
  });
  
  // About EDGE Gateway 4-card scroll-down animation
  const aboutGridTranslateY = scrollY.interpolate({
    inputRange: [0, 450],
    outputRange: [-30, 0],
    extrapolate: 'clamp',
  });

  // Features Section reveal animations
  const featuresFade = scrollY.interpolate({
    inputRange: [150, 550],
    outputRange: [0.4, 1],
    extrapolate: 'clamp',
  });
  const featuresTranslateY = scrollY.interpolate({
    inputRange: [150, 550],
    outputRange: [35, 0],
    extrapolate: 'clamp',
  });

  // How It Works Section reveal animations
  const howItWorksFade = scrollY.interpolate({
    inputRange: [450, 850],
    outputRange: [0.4, 1],
    extrapolate: 'clamp',
  });
  const howItWorksTranslateY = scrollY.interpolate({
    inputRange: [450, 850],
    outputRange: [35, 0],
    extrapolate: 'clamp',
  });

  // FAQs Section reveal animations
  const faqsFade = scrollY.interpolate({
    inputRange: [750, 1200],
    outputRange: [0.4, 1],
    extrapolate: 'clamp',
  });
  const faqsTranslateY = scrollY.interpolate({
    inputRange: [750, 1200],
    outputRange: [35, 0],
    extrapolate: 'clamp',
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
        ])
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
        ])
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
      Animated.stagger(150, cardAnims.map(anim => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        })
      )).start();

      // Staggered step entrances
      Animated.stagger(120, stepAnims.map(anim => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      )).start();
    });
  }, [floatAnimBlue, floatAnimPink, floatAnimMockup, fadeAnimHero, slideAnimHero, cardAnims, stepAnims]);

  const handleSectionLayout = (name: string, y: number) => {
    setSectionYCoords((prev) => ({ ...prev, [name]: y }));
  };

  const scrollToSection = (name: string) => {
    const y = sectionYCoords[name];
    if (y !== undefined) {
      scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
    }
  };

  const handleTrackSubmit = () => {
    setTrackingError('');
    setTrackingResult(null);

    if (referenceNo.trim().length === 0) {
      setTrackingError('Reference number is required.');
      return;
    }

    if (selectedRegion.length === 0) {
      setTrackingError('Please select a region.');
      return;
    }

    setTrackingLoading(true);

    setTimeout(() => {
      setTrackingLoading(false);
      const cleanRef = referenceNo.toUpperCase().trim();
      if (cleanRef === 'NTC-2026-9812') {
        setTrackingResult({
          referenceNo: 'NTC-2026-9812',
          region: selectedRegion,
          type: 'Radio Station License',
          applicantName: 'Cignal TV Inc.',
          status: 'IN REVIEW',
          updatedAt: '2 hours ago',
          stage: 'Evaluation (Step 2 of 3)',
        });
      } else if (cleanRef === 'NTC-2026-0001') {
        setTrackingResult({
          referenceNo: 'NTC-2026-0001',
          region: selectedRegion,
          type: 'Permit to Purchase',
          applicantName: 'Globe Telecom',
          status: 'APPROVED',
          updatedAt: '1 day ago',
          stage: 'Issuance (Step 3 of 3)',
        });
      } else if (cleanRef === 'NTC-2026-0002') {
        setTrackingResult({
          referenceNo: 'NTC-2026-0002',
          region: selectedRegion,
          type: 'Certificate of Public Convenience',
          applicantName: 'Smart Communications',
          status: 'PENDING DOCUMENTS',
          updatedAt: '3 days ago',
          stage: 'Submission (Step 1 of 3)',
        });
      } else if (cleanRef.startsWith('NTC-')) {
        setTrackingResult({
          referenceNo: cleanRef,
          region: selectedRegion,
          type: 'General Application',
          applicantName: 'Guest User',
          status: 'DRAFT/IN PROGRESS',
          updatedAt: 'Just now',
          stage: 'Submission (Step 1 of 3)',
        });
      } else {
        setTrackingError("Reference number not found for the selected region. Try 'NTC-2026-9812'.");
      }
    }, 1500);
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
      q: 'What is the EDGE application?',
      a: 'The Electronic Data Governance and Evaluation (EDGE) application is an online information system by the NTC for issuing certificates, permits, licenses, and handling complaints/requests.',
    },
    {
      q: 'Who can use this portal?',
      a: 'Individuals and businesses who need to interact with the NTC for services like permits, licenses, and tracking complaints.',
    },
    {
      q: 'How do I track my application?',
      a: 'Tap “Track Application” and enter your reference number or open “My Applications” in your dashboard.',
    },
    {
      q: 'Is my data secure?',
      a: 'Yes. We use industry-standard security to protect your information and application data.',
    },
  ];

  type IconName = 'shield' | 'search' | 'file-text';
  const features: { tag: string; title: string; desc: string; icon: IconName }[] = [
    { tag: 'SECURITY', title: 'Secure & Trusted', desc: 'Industry-standard security protects your information with encryption and compliance.', icon: 'shield' },
    { tag: 'REAL-TIME', title: 'Real-time Tracking', desc: 'Monitor your application status anytime, anywhere. Get instant updates.', icon: 'search' },
    { tag: 'WORKFLOW', title: 'Simple Process', desc: 'Streamlined workflows make applying quick and easy.', icon: 'file-text' },
  ];

  // Steps matching exact layout from reference screenshot
  const stepsRow1 = [
    {
      number: '1',
      title: 'Create Account/Apply',
      desc: 'Register an account or tap Start Application to begin.',
    },
    {
      number: '2',
      title: 'Submit Application',
      desc: 'Complete forms and upload requirements.',
    },
    {
      number: '3',
      title: 'Track Application',
      desc: 'Use your reference number or My Applications.',
    },
  ];

  const stepsRow2 = [
    {
      number: '4',
      title: 'Process Payment',
      desc: 'Pay fees at the nearest NTC office once approved.',
    },
    {
      number: '5',
      title: 'Get Issuance',
      desc: 'Receive your License, Certificate, Permit, or resolution.',
    },
  ];

  const allStepsMobile = [...stepsRow1, ...stepsRow2];

  return (
    <View style={styles.container}>
      {/* Sticky Glassmorphic Header/Navbar */}
      <View style={styles.headerOuter}>
        <View style={styles.headerInner}>
          <Logo />
          
          {isDesktop ? (
            <View style={styles.navLinks}>
              <Pressable
                onPress={() => scrollToSection('about')}
                style={({ hovered }: PressableState) => [
                  styles.navLink,
                  hovered ? styles.navLinkHovered : null,
                ]}
              >
                <Text style={styles.navLinkText}>About</Text>
              </Pressable>
              <Pressable
                onPress={() => scrollToSection('howItWorks')}
                style={({ hovered }: PressableState) => [
                  styles.navLink,
                  hovered ? styles.navLinkHovered : null,
                ]}
              >
                <Text style={styles.navLinkText}>How it works</Text>
              </Pressable>
              <Pressable
                onPress={() => scrollToSection('faqs')}
                style={({ hovered }: PressableState) => [
                  styles.navLink,
                  hovered ? styles.navLinkHovered : null,
                ]}
              >
                <Text style={styles.navLinkText}>FAQs</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Animated Glow Spots */}
        <Animated.View
          style={[
            styles.glowSpotBlue,
            {
              transform: [
                { translateY: Animated.add(translateYBlue, backgroundBlueParallax) },
                { translateX: translateXBlue }
              ]
            },
          ]}
        />
        <Animated.View
          style={[
            styles.glowSpotPink,
            {
              transform: [
                { translateY: Animated.add(translateYPink, backgroundPinkParallax) },
                { translateX: translateXPink }
              ]
            },
          ]}
        />
        {Platform.OS === 'web' && (
          <View style={styles.glowSpotCenter} />
        )}

        {/* Hero Section */}
        <Animated.View style={[
          styles.heroSection,
          isDesktop ? styles.heroSectionDesktop : null,
          {
            opacity: fadeAnimHero,
            transform: [
              { translateY: Animated.add(slideAnimHero, heroParallaxTranslateY) }
            ]
          }
        ]}>
          <View style={isDesktop ? styles.heroLeftCol : styles.heroFullWidth}>
            {/* Pill Badge with Fill Color */}
            <View style={[styles.pillBadge, isDesktop ? { alignSelf: 'flex-start' } : { alignSelf: 'center' }]}>
              <View style={styles.pillBadgeDot} />
              <Text style={styles.pillBadgeText}>Official NTC-EDGE Portal</Text>
            </View>
            
            {/* Split Color Hero Title */}
            <Text style={[styles.heroTitle, isDesktop ? styles.heroTitleDesktop : null]}>
              <Text style={styles.titleBlue}>Empowering </Text>
              <Text style={styles.titleRed}>NTC's</Text>
              {'\n'}
              <Text style={styles.titleBlue}>Data Governance</Text>
            </Text>
            
            <Text style={[styles.heroSubtitle, isDesktop ? styles.heroSubtitleDesktop : null]}>
              Streamline your government services experience. Apply for permits, licenses, and certificates with secure, efficient, and transparent processes powered by EDGE.
            </Text>
            
            <View style={styles.heroButtonsRow}>
              <Button
                title="Get Started"
                onPress={() => setIsGetStartedModalVisible(true)}
                size="lg"
                style={styles.heroPrimaryBtn}
                icon={<Lucide name="arrow-right" size={18} color={COLORS.neutral.white} />}
              />
              <Button
                title="Track Application"
                onPress={() => setIsTrackModalVisible(true)}
                variant="outline"
                size="lg"
                style={styles.heroSecondaryBtn}
                textStyle={{ color: '#1236A8' }}
                icon={<Lucide name="search" size={18} color="#1236A8" />}
              />
            </View>
          </View>

          {isDesktop ? (
            <Animated.View style={[styles.heroRightCol, { transform: [{ translateY: floatAnimMockup }] }]}>
              {/* Static Dashboard Preview Card */}
              <View style={[styles.mockupCard, SHADOWS.modal]}>
                <View style={styles.mockupHeader}>
                  <View style={styles.mockupDots}>
                    <View style={[styles.mockupDot, { backgroundColor: '#EF4444' }]} />
                    <View style={[styles.mockupDot, { backgroundColor: '#F59E0B' }]} />
                    <View style={[styles.mockupDot, { backgroundColor: '#10B981' }]} />
                  </View>
                  <View style={styles.mockupUrlContainer}>
                    <Lucide name="lock" size={10} color={COLORS.neutral[400]} style={{ marginRight: 4 }} />
                    <Text style={styles.mockupHeaderText}>ntc-edge.gov.ph</Text>
                  </View>
                </View>
                
                <View style={styles.mockupBody}>
                  {/* Stats Row */}
                  <View style={styles.mockupStatsRow}>
                    <View style={styles.mockupStatCard}>
                      <Lucide name="file-text" size={14} color="#1236A8" style={{ marginBottom: 4 }} />
                      <Text style={styles.mockupStatLabel}>Applications</Text>
                      <Text style={[styles.mockupStatValue, { color: '#1236A8' }]}>12,450</Text>
                    </View>
                    <View style={styles.mockupStatCard}>
                      <Lucide name="clock" size={14} color="#DC2626" style={{ marginBottom: 4 }} />
                      <Text style={styles.mockupStatLabel}>Pending</Text>
                      <Text style={[styles.mockupStatValue, { color: '#DC2626' }]}>18</Text>
                    </View>
                    <View style={styles.mockupStatCard}>
                      <Lucide name="check-circle" size={14} color="#10B981" style={{ marginBottom: 4 }} />
                      <Text style={styles.mockupStatLabel}>Approved</Text>
                      <Text style={[styles.mockupStatValue, { color: '#10B981' }]}>99.4%</Text>
                    </View>
                  </View>

                  {/* Active Application Card */}
                  <View style={styles.mockupAppCard}>
                    <View style={styles.mockupAppHeader}>
                      <View>
                        <Text style={styles.mockupAppTitle}>Radio Station License</Text>
                        <Text style={styles.mockupAppMeta}>Ref: NTC-2026-9812</Text>
                      </View>
                      <View style={styles.mockupStatusBadge}>
                        <Text style={styles.mockupStatusText}>IN REVIEW</Text>
                      </View>
                    </View>
                    
                    {/* Progress Bar */}
                    <View style={styles.mockupProgressContainer}>
                      <View style={styles.mockupProgressBar}>
                        <View style={[styles.mockupProgressFill, { backgroundColor: '#1236A8', width: '65%' }]} />
                        <View style={[styles.mockupProgressFillRed, { backgroundColor: '#DC2626', width: '10%', left: '65%' }]} />
                      </View>
                      <View style={styles.mockupProgressLabels}>
                        <Text style={styles.mockupProgressLabel}>Submission</Text>
                        <Text style={styles.mockupProgressLabel}>Evaluation</Text>
                        <Text style={styles.mockupProgressLabel}>Issuance</Text>
                      </View>
                    </View>
                  </View>

                  {/* Realtime Alert Activity */}
                  <View style={styles.mockupActivityCard}>
                    <Lucide name="bell" size={14} color="#1236A8" style={{ marginRight: 8 }} />
                    <Text style={styles.mockupActivityText}>
                      License issued successfully for <Text style={{ fontWeight: '600' }}>CIGNAL TV INC.</Text>
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
              transform: [{ translateY: aboutTranslateY }]
            }
          ]}
          onLayout={(e) => handleSectionLayout('about', e.nativeEvent.layout.y)}
        >
          {isDesktop ? (
            <View style={styles.aboutLeftCol}>
              <View style={[styles.aboutGraphicCard, SHADOWS.card]}>
                <View style={styles.aboutGraphicHeader}>
                  <View style={styles.aboutGraphicBadge}>
                    <Lucide name="shield" size={20} color="#1236A8" />
                  </View>
                  <Text style={styles.aboutGraphicHeaderText}>NTC SECURE GATEWAY</Text>
                </View>

                {/* Animated Scroll-Down Slide transition for the 4 gateway items */}
                <Animated.View style={[styles.aboutGraphicGrid, { transform: [{ translateY: aboutGridTranslateY }] }]}>
                  <View style={styles.aboutGridItem}>
                    <Lucide name="file-text" size={22} color="#1236A8" style={{ marginBottom: 6 }} />
                    <Text style={styles.aboutGridItemText}>Certificates</Text>
                  </View>
                  <View style={styles.aboutGridItem}>
                    <Lucide name="file" size={22} color="#1236A8" style={{ marginBottom: 6 }} />
                    <Text style={styles.aboutGridItemText}>Permits</Text>
                  </View>
                  <View style={styles.aboutGridItem}>
                    <Lucide name="award" size={22} color="#1236A8" style={{ marginBottom: 6 }} />
                    <Text style={styles.aboutGridItemText}>Licenses</Text>
                  </View>
                  <View style={styles.aboutGridItem}>
                    <Lucide name="help-circle" size={22} color="#1236A8" style={{ marginBottom: 6 }} />
                    <Text style={styles.aboutGridItemText}>Requests</Text>
                  </View>
                </Animated.View>
                
                <View style={styles.aboutGraphicFooter}>
                  <View style={styles.dotIndicatorActive} />
                  <Text style={styles.aboutGraphicFooterText}>Data Sync Active • Live Encryption</Text>
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
              Welcome to the Electronic Data Governance and Evaluation (EDGE) application. This system is a flagship initiative by the National Telecommunications Commission (NTC) to modernize and streamline public services.
            </Text>
            
            <Text style={styles.aboutBodyText}>
              Our mission is to provide a transparent, efficient, and accessible online platform for all stakeholders. EDGE is a secure online platform developed to streamline application processing, licensing, and public requests.
            </Text>
            
            <View style={styles.aboutInfoBox}>
              <Lucide name="info" size={20} color="#1236A8" style={{ marginRight: 12, marginTop: 2 }} />
              <Text style={styles.aboutInfoBoxText}>
                This portal issues Certificates, Permits, Licenses, and manages Complaints/Requests efficiently.
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
              transform: [{ translateY: featuresTranslateY }]
            }
          ]}
        >
          <Text style={styles.featuresTitle}>Why Choose EDGE?</Text>
          <Text style={styles.featuresSubtitle}>Everything you need for seamless government services</Text>
          
          <View style={[styles.featuresGrid, isDesktop ? styles.rowLayout : styles.columnLayout]}>
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
                    }
                  ]}
                >
                  <View style={[styles.featCard, SHADOWS.card]}>
                    <View style={styles.featTopAccentBar} />
                    <View style={styles.featCardHeader}>
                      <View style={styles.featIconWrapper}>
                        <Lucide name={feat.icon} size={22} color={COLORS.neutral.white} />
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
              transform: [{ translateY: howItWorksTranslateY }]
            }
          ]}
          onLayout={(e) => handleSectionLayout('howItWorks', e.nativeEvent.layout.y)}
        >
          <Text style={[styles.sectionTitleBlue, styles.centerText]}>How It Works</Text>
          
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
                      <Animated.View style={[
                        styles.stepCardDesktopExact,
                        {
                          opacity: stepAnim,
                          transform: [{ translateY: stepTranslateY }],
                        }
                      ]}>
                        <View style={[styles.stepCardExact, SHADOWS.card]}>
                          <View style={styles.stepCircleBadge}>
                            <Text style={styles.stepCircleBadgeText}>{st.number}</Text>
                          </View>
                          <Text style={styles.stepCardExactTitle}>{st.title}</Text>
                          <Text style={styles.stepCardExactDesc}>{st.desc}</Text>
                        </View>
                      </Animated.View>

                      {index < stepsRow1.length - 1 && (
                        <View style={styles.arrowDesktopExact}>
                          <Lucide name="arrow-right" size={16} color="#334155" />
                        </View>
                      )}
                    </React.Fragment>
                  );
                })}
              </View>

              {/* Row 2: Steps 4, 5 */}
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
                      <Animated.View style={[
                        styles.stepCardDesktopExact,
                        {
                          opacity: stepAnim,
                          transform: [{ translateY: stepTranslateY }],
                        }
                      ]}>
                        <View style={[styles.stepCardExact, SHADOWS.card]}>
                          <View style={styles.stepCircleBadge}>
                            <Text style={styles.stepCircleBadgeText}>{st.number}</Text>
                          </View>
                          <Text style={styles.stepCardExactTitle}>{st.title}</Text>
                          <Text style={styles.stepCardExactDesc}>{st.desc}</Text>
                        </View>
                      </Animated.View>

                      {index < stepsRow2.length - 1 && (
                        <View style={styles.arrowDesktopExact}>
                          <Lucide name="arrow-right" size={16} color="#334155" />
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
                    <Animated.View style={[
                      { width: '100%', alignItems: 'center' },
                      {
                        opacity: stepAnim,
                        transform: [{ translateY: stepTranslateY }],
                      }
                    ]}>
                      <View style={[styles.stepCardExact, SHADOWS.card, { width: '100%', maxWidth: 320 }]}>
                        <View style={styles.stepCircleBadge}>
                          <Text style={styles.stepCircleBadgeText}>{st.number}</Text>
                        </View>
                        <Text style={styles.stepCardExactTitle}>{st.title}</Text>
                        <Text style={styles.stepCardExactDesc}>{st.desc}</Text>
                      </View>
                    </Animated.View>

                    {index < allStepsMobile.length - 1 && (
                      <View style={{ marginVertical: SPACING[12], alignItems: 'center' }}>
                        <Lucide name="arrow-down" size={16} color="#334155" />
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
              transform: [{ translateY: faqsTranslateY }]
            }
          ]}
          onLayout={(e) => handleSectionLayout('faqs', e.nativeEvent.layout.y)}
        >
          <Text style={[styles.sectionTitleBlue, styles.centerText]}>Frequently Asked Questions</Text>

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
                  style={[styles.faqItem, SHADOWS.card, isExpanded ? styles.faqItemExpanded : null]}
                >
                  <Pressable
                    onPress={() => handleFaqPress(idx)}
                    style={({ hovered }: PressableState) => [
                      styles.faqHeader,
                      hovered ? styles.faqHeaderHovered : null,
                    ]}
                  >
                    <Text style={styles.faqQuestion}>{faq.q}</Text>
                    <View style={[styles.faqIconCircle, isExpanded ? styles.faqIconCircleActive : null]}>
                      <Lucide
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={isExpanded ? COLORS.neutral.white : '#1236A8'}
                      />
                    </View>
                  </Pressable>
                  
                  <Animated.View style={[styles.faqAnswerContainer, faqAnswerStyle, { overflow: 'hidden' }]}>
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
              Join thousands of users who have simplified their government service applications with EDGE. Secure, efficient, and transparent.
            </Text>
            <Button
              title="Begin Your Application"
              onPress={() => setIsGetStartedModalVisible(true)}
              style={styles.ctaPrimaryBtn}
              textStyle={{ color: '#1236A8', fontWeight: '700' }}
              icon={<Lucide name="arrow-right" size={18} color="#1236A8" />}
            />
          </View>
        </View>

        {/* Detailed Footer with 6 Important Links */}
        <View style={styles.footerContainer}>
          <View style={[styles.footerInnerGrid, { flexDirection: Platform.OS === 'web' && width >= 800 ? 'row' : 'column' }]}>
            
            {/* Logo, Bio */}
            <View style={isDesktop ? styles.footerBioCol : styles.footerFullWidthCol}>
              <Logo variant="light" />
              <Text style={styles.footerBioText}>
                Electronic Data Governance and Evaluation - Streamlining NTC services since 2024.
              </Text>
            </View>

            {/* Links Columns */}
            <View style={[styles.footerLinksWrapper, { marginTop: Platform.OS !== 'web' || width < 800 ? SPACING[32] : 0 }]}>
              <View style={styles.footerLinksCol}>
                <Text style={styles.footerColHeader}>Legal</Text>
                <Pressable
                  onPress={() => setActiveFooterModal(FOOTER_POLICIES['user-agreement'])}
                  style={({ hovered }: PressableState) => [
                    styles.footerLinkItem,
                    hovered ? styles.footerLinkHovered : null,
                  ]}
                >
                  <Text style={styles.footerLinkText}>User Agreement</Text>
                </Pressable>
                <Pressable
                  onPress={() => setActiveFooterModal(FOOTER_POLICIES['privacy-policy'])}
                  style={({ hovered }: PressableState) => [
                    styles.footerLinkItem,
                    hovered ? styles.footerLinkHovered : null,
                  ]}
                >
                  <Text style={styles.footerLinkText}>Privacy Policy</Text>
                </Pressable>
                <Pressable
                  onPress={() => setActiveFooterModal(FOOTER_POLICIES['cookie-policy'])}
                  style={({ hovered }: PressableState) => [
                    styles.footerLinkItem,
                    hovered ? styles.footerLinkHovered : null,
                  ]}
                >
                  <Text style={styles.footerLinkText}>Cookie Policy</Text>
                </Pressable>
              </View>

              <View style={styles.footerLinksCol}>
                <Text style={styles.footerColHeader}>Support</Text>
                <Pressable
                  onPress={() => setActiveFooterModal(FOOTER_POLICIES['community-guidelines'])}
                  style={({ hovered }: PressableState) => [
                    styles.footerLinkItem,
                    hovered ? styles.footerLinkHovered : null,
                  ]}
                >
                  <Text style={styles.footerLinkText}>Community Guidelines</Text>
                </Pressable>
                <Pressable
                  onPress={() => setActiveFooterModal(FOOTER_POLICIES['send-feedback'])}
                  style={({ hovered }: PressableState) => [
                    styles.footerLinkItem,
                    hovered ? styles.footerLinkHovered : null,
                  ]}
                >
                  <Text style={styles.footerLinkText}>Send Feedback</Text>
                </Pressable>
                <Pressable
                  onPress={() => setActiveFooterModal(FOOTER_POLICIES['help-center'])}
                  style={({ hovered }: PressableState) => [
                    styles.footerLinkItem,
                    hovered ? styles.footerLinkHovered : null,
                  ]}
                >
                  <Text style={styles.footerLinkText}>Help Center</Text>
                </Pressable>
              </View>
            </View>
          </View>
          
          <View style={styles.footerBottom}>
            <Text style={styles.copyrightText}>
              © 2025 EDGE - National Telecommunications Commission. All rights reserved.
            </Text>
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
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActiveFooterModal(null)}
        >
          <TouchableOpacity
            style={[styles.modalCard, SHADOWS.modal, { maxWidth: 840, padding: 36, borderRadius: 24 }]}
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
              <ScrollView style={{ maxHeight: 560 }} showsVerticalScrollIndicator={true}>
                {/* Header */}
                <View style={styles.policyModalHeader}>
                  <View style={styles.policyHeaderIconCircle}>
                    <Lucide name="file-text" size={20} color="#1236A8" />
                  </View>
                  <Text style={styles.policyModalTitle}>{activeFooterModal.title}</Text>
                </View>
                <View style={styles.policyTitleDivider} />
                
                {/* Intro Box */}
                <View style={styles.policyIntroBox}>
                  <Lucide name="info" size={18} color="#1236A8" style={{ marginRight: 10, marginTop: 2 }} />
                  <Text style={styles.policyIntroText}>{activeFooterModal.intro}</Text>
                </View>

                {/* Section Cards */}
                {activeFooterModal.sections.map((sec, i) => (
                  <View key={i} style={[styles.policySectionCard, SHADOWS.card]}>
                    <Text style={styles.policySecTitle}>{sec.title}</Text>
                    <Text style={styles.policySecBody}>{sec.body}</Text>
                    {sec.highlight && (
                      <View style={styles.policyHighlightBadge}>
                        <Lucide name="mail" size={14} color="#1236A8" style={{ marginRight: 8 }} />
                        <Text style={styles.policyHighlightText}>{sec.highlight}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Get Started Modal */}
      <Modal
        visible={isGetStartedModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsGetStartedModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsGetStartedModalVisible(false)}
        >
          <TouchableOpacity
            style={[styles.modalCard, SHADOWS.modal]}
            activeOpacity={1}
            onPress={() => {}}
          >
            {/* Close Button */}
            <Pressable
              style={({ hovered }: PressableState) => [
                styles.modalCloseBtn,
                hovered ? styles.closeBtnHovered : null,
              ]}
              onPress={() => setIsGetStartedModalVisible(false)}
            >
              <Lucide name="x" size={20} color={COLORS.neutral[500]} />
            </Pressable>

            {/* Modal Logo */}
            <View style={styles.modalHeader}>
              <Logo height={32} />
            </View>

            <Text style={styles.modalTitle}>How would you like to proceed?</Text>
            
            <Text style={styles.modalSubtitleText}>
              To save your progress and access application history, we recommend having an account.
            </Text>

            <View style={styles.modalButtonsContainer}>
              <Button
                title="Login"
                onPress={() => {
                  setIsGetStartedModalVisible(false);
                  navigation?.navigate('Login');
                }}
                style={styles.modalActionBtn}
                icon={<Lucide name="log-in" size={16} color={COLORS.neutral.white} />}
              />

              <Button
                title="Continue as Guest"
                variant="outline"
                onPress={() => {
                  setIsGetStartedModalVisible(false);
                  loginAsGuest();
                }}
                style={{ ...styles.modalActionBtn, ...styles.modalGuestBtn }}
                textStyle={{ color: '#1236A8' }}
                icon={<Lucide name="user" size={16} color="#1236A8" />}
              />
            </View>

            {/* Footer Sign Up Link */}
            <View style={styles.modalFooter}>
              <Text style={styles.modalFooterText}>Don't have an account yet? </Text>
              <Pressable
                onPress={() => {
                  setIsGetStartedModalVisible(false);
                  navigation?.navigate('SignUp');
                }}
              >
                <Text style={styles.modalFooterLink}>Sign Up</Text>
              </Pressable>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Track Application Modal */}
      <Modal
        visible={isTrackModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setIsTrackModalVisible(false);
          setReferenceNo('');
          setSelectedRegion('');
          setIsRegionDropdownOpen(false);
          setTrackingError('');
          setTrackingResult(null);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setIsTrackModalVisible(false);
            setReferenceNo('');
            setSelectedRegion('');
            setIsRegionDropdownOpen(false);
            setTrackingError('');
            setTrackingResult(null);
          }}
        >
          <TouchableOpacity
            style={[styles.modalCard, SHADOWS.modal, { maxWidth: 460 }]}
            activeOpacity={1}
            onPress={() => setIsRegionDropdownOpen(false)}
          >
            {/* Close Button */}
            <Pressable
              style={({ hovered }: PressableState) => [
                styles.modalCloseBtn,
                hovered ? styles.closeBtnHovered : null,
              ]}
              onPress={() => {
                setIsTrackModalVisible(false);
                setReferenceNo('');
                setSelectedRegion('');
                setIsRegionDropdownOpen(false);
                setTrackingError('');
                setTrackingResult(null);
              }}
            >
              <Lucide name="x" size={20} color={COLORS.neutral[500]} />
            </Pressable>

            {/* Modal Logo */}
            <View style={styles.modalHeader}>
              <Logo height={32} />
            </View>

            <Text style={styles.modalTitle}>Track Application</Text>

            {trackingResult === null ? (
              <View style={{ width: '100%' }}>
                <Text style={styles.modalInstructionText}>
                  Enter your reference number and select the region to track status.
                </Text>

                {/* Reference No Input */}
                <Input
                  label="Reference No."
                  placeholder="e.g., NTC-2026-9812"
                  value={referenceNo}
                  onChangeText={(text) => {
                    setReferenceNo(text);
                    setTrackingError('');
                  }}
                  iconName="search"
                />

                {/* Region Picker Dropdown */}
                <View style={{ zIndex: 100, marginBottom: SPACING[16], position: 'relative' }}>
                  <Text style={styles.dropdownLabel}>Region</Text>
                  <TouchableOpacity
                    style={styles.dropdownTrigger}
                    activeOpacity={0.9}
                    onPress={(e) => {
                      e.stopPropagation();
                      setIsRegionDropdownOpen(!isRegionDropdownOpen);
                    }}
                  >
                    <Text style={selectedRegion ? styles.dropdownSelectedText : styles.dropdownPlaceholderText}>
                      {selectedRegion || 'Select Region...'}
                    </Text>
                    <Lucide name={isRegionDropdownOpen ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.neutral[500]} />
                  </TouchableOpacity>

                  {isRegionDropdownOpen && (
                    <View style={[styles.dropdownMenu, SHADOWS.modal]}>
                      <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled={true}>
                        {PHILIPPINE_REGIONS.map((region) => (
                          <Pressable
                            key={region}
                            style={({ hovered }: PressableState) => [
                              styles.dropdownItem,
                              hovered ? styles.dropdownItemHovered : null,
                            ]}
                            onPress={() => {
                              setSelectedRegion(region);
                              setIsRegionDropdownOpen(false);
                              setTrackingError('');
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{region}</Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Error Banner */}
                {trackingError.length > 0 && (
                  <View style={styles.errorBanner}>
                    <Lucide name="alert-circle" size={16} color={COLORS.semantic.error} style={{ marginRight: 8 }} />
                    <Text style={styles.errorBannerText}>{trackingError}</Text>
                  </View>
                )}

                {/* Action button */}
                <Button
                  title={trackingLoading ? 'Checking Database...' : 'Track Application'}
                  onPress={handleTrackSubmit}
                  loading={trackingLoading}
                  style={styles.modalSubmitBtn}
                  icon={!trackingLoading ? <Lucide name="activity" size={16} color={COLORS.neutral.white} /> : undefined}
                />
              </View>
            ) : (
              /* Tracking Result display */
              <View style={{ width: '100%', alignItems: 'center' }}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultRef}>{trackingResult.referenceNo}</Text>
                  <View style={[
                    styles.resultBadge,
                    trackingResult.status === 'APPROVED' ? styles.badgeSuccess :
                    trackingResult.status === 'IN REVIEW' ? styles.badgeInfo :
                    trackingResult.status === 'PENDING DOCUMENTS' ? styles.badgeWarning : styles.badgeDefault
                  ]}>
                    <Text style={[
                      styles.resultBadgeText,
                      trackingResult.status === 'APPROVED' ? styles.textSuccess :
                      trackingResult.status === 'IN REVIEW' ? styles.textInfo :
                      trackingResult.status === 'PENDING DOCUMENTS' ? styles.textWarning : styles.textDefault
                    ]}>{trackingResult.status}</Text>
                  </View>
                </View>

                <View style={styles.resultCard}>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Application Type:</Text>
                    <Text style={styles.resultValue}>{trackingResult.type}</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Applicant:</Text>
                    <Text style={styles.resultValue}>{trackingResult.applicantName}</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Region:</Text>
                    <Text style={styles.resultValue}>{trackingResult.region}</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Current Stage:</Text>
                    <Text style={styles.resultValue}>{trackingResult.stage}</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Last Updated:</Text>
                    <Text style={styles.resultValue}>{trackingResult.updatedAt}</Text>
                  </View>
                </View>

                <Button
                  title="Track Another Application"
                  variant="outline"
                  onPress={() => {
                    setReferenceNo('');
                    setSelectedRegion('');
                    setTrackingResult(null);
                  }}
                  style={styles.modalResetBtn}
                  textStyle={{ color: '#1236A8' }}
                  icon={<Lucide name="refresh-cw" size={16} color="#1236A8" />}
                />
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFCFF',
  },
  headerOuter: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.8)',
    height: 72,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: 1400,
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[24],
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLink: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.circle,
    marginRight: SPACING[8],
  },
  navLinkHovered: {
    backgroundColor: '#EEF2FF',
  },
  navLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    position: 'relative',
  },
  glowSpotBlue: {
    position: 'absolute',
    top: -80,
    left: -120,
    width: 550,
    height: 550,
    borderRadius: 275,
    backgroundColor: '#1236A8',
    opacity: 0.07,
    zIndex: -1,
  },
  glowSpotPink: {
    position: 'absolute',
    top: 120,
    right: -120,
    width: 550,
    height: 550,
    borderRadius: 275,
    backgroundColor: '#DC2626',
    opacity: 0.05,
    zIndex: -1,
  },
  glowSpotCenter: {
    position: 'absolute',
    bottom: '25%',
    left: '30%',
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: '#3B82F6',
    opacity: 0.03,
    zIndex: -1,
  },
  heroSection: {
    paddingVertical: SPACING[64] + 40,
    paddingHorizontal: SPACING[24],
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  heroSectionDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeftCol: {
    flex: 1.15,
    paddingRight: SPACING[48],
    alignItems: 'flex-start',
  },
  heroRightCol: {
    flex: 0.85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFullWidth: {
    width: '100%',
    alignItems: 'center',
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.circle,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    marginBottom: SPACING[24],
  },
  pillBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1236A8',
    marginRight: 8,
  },
  pillBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '700',
    color: '#1236A8',
  },
  heroTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 38,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: SPACING[24],
    letterSpacing: -0.8,
  },
  heroTitleDesktop: {
    fontSize: 60,
    lineHeight: 70,
    textAlign: 'left',
  },
  titleBlue: {
    color: '#1236A8',
  },
  titleRed: {
    color: '#DC2626',
  },
  heroSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    color: COLORS.neutral[600],
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 36,
    maxWidth: 720,
  },
  heroSubtitleDesktop: {
    textAlign: 'left',
    alignSelf: 'flex-start',
    fontSize: 18,
    lineHeight: 28,
  },
  heroButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroPrimaryBtn: {
    backgroundColor: '#1236A8',
    marginRight: SPACING[16],
    paddingHorizontal: SPACING[32],
    height: 52,
    borderRadius: RADIUS.button,
    shadowColor: '#1236A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
  heroSecondaryBtn: {
    borderColor: '#1236A8',
    backgroundColor: COLORS.neutral.white,
    paddingHorizontal: SPACING[32],
    height: 52,
    borderRadius: RADIUS.button,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  mockupCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(18, 54, 168, 0.10)',
    overflow: 'hidden',
  },
  mockupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    justifyContent: 'space-between',
  },
  mockupDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mockupDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 6,
  },
  mockupUrlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  mockupHeaderText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[500],
    fontWeight: '600',
  },
  mockupBody: {
    padding: 24,
  },
  mockupStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mockupStatCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  mockupStatLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: COLORS.neutral[500],
    fontWeight: '600',
    marginBottom: 2,
  },
  mockupStatValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 17,
    fontWeight: '800',
  },
  mockupAppCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    marginBottom: 16,
  },
  mockupAppHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  mockupAppTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.neutral[800],
  },
  mockupAppMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[400],
    marginTop: 2,
  },
  mockupStatusBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  mockupStatusText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  mockupProgressContainer: {
    width: '100%',
  },
  mockupProgressBar: {
    height: 7,
    backgroundColor: COLORS.neutral[200],
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  mockupProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  mockupProgressFillRed: {
    height: '100%',
    position: 'absolute',
  },
  mockupProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  mockupProgressLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: COLORS.neutral[500],
    fontWeight: '500',
  },
  mockupActivityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  mockupActivityText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[700],
    flex: 1,
  },
  mockupActivityTime: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: COLORS.neutral[400],
    marginLeft: 8,
  },
  aboutEdgeSection: {
    paddingVertical: SPACING[64],
    paddingHorizontal: SPACING[24],
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutLeftCol: {
    flex: 0.9,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingRight: SPACING[48],
  },
  aboutRightCol: {
    flex: 1.1,
    alignItems: 'flex-start',
  },
  aboutFullCol: {
    width: '100%',
    alignItems: 'flex-start',
  },
  aboutGraphicCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.neutral[200],
    width: '100%',
    maxWidth: 440,
    padding: 28,
  },
  aboutGraphicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[24],
  },
  aboutGraphicBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  aboutGraphicHeaderText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.neutral[800],
    letterSpacing: 1.2,
  },
  aboutGraphicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING[16],
    width: '100%',
  },
  aboutGridItem: {
    width: '48%',
    backgroundColor: COLORS.neutral[50],
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    borderRadius: 14,
    padding: SPACING[16],
    alignItems: 'center',
    marginBottom: SPACING[12],
  },
  aboutGridItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.neutral[700],
  },
  aboutGraphicFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[100],
    paddingTop: 14,
    width: '100%',
  },
  aboutGraphicFooterText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[500],
    fontWeight: '500',
  },
  dotIndicatorActive: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.semantic.success,
    marginRight: 8,
  },
  aboutBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  aboutBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '800',
    color: '#1236A8',
    letterSpacing: 1.2,
  },
  aboutTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.neutral[900],
    marginBottom: SPACING[16],
    letterSpacing: -0.5,
  },
  aboutHighlightText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.neutral[700],
    lineHeight: 26,
    marginBottom: SPACING[16],
  },
  aboutBodyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    color: COLORS.neutral[500],
    lineHeight: 24,
    marginBottom: SPACING[24],
  },
  aboutInfoBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    width: '100%',
  },
  aboutInfoBoxText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: '#1236A8',
    fontWeight: '600',
    lineHeight: 20,
  },
  featuresSection: {
    paddingVertical: SPACING[64],
    paddingHorizontal: SPACING[24],
    width: '100%',
    alignItems: 'center',
  },
  featuresTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 34,
    fontWeight: '800',
    color: '#1236A8',
    textAlign: 'center',
    marginBottom: SPACING[8],
    letterSpacing: -0.5,
  },
  featuresSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 17,
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginBottom: SPACING[48],
  },
  featuresGrid: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  featCardDesktop: {
    flex: 1,
    marginHorizontal: 10,
    marginBottom: 0,
    height: '100%',
  },
  featCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.neutral[200],
    padding: SPACING[32],
    width: '100%',
    height: '100%',
    minHeight: 240,
    marginBottom: SPACING[20],
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-start',
  },
  featTopAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#1236A8',
  },
  featCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[20],
  },
  featTagBadge: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  featTagBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: '800',
    color: '#1236A8',
    letterSpacing: 0.8,
  },
  featIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#1236A8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1236A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  featCardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: '700',
    color: '#1236A8',
    marginBottom: SPACING[12],
  },
  featCardDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    color: COLORS.neutral[600],
    lineHeight: 22,
  },
  sectionContainer: {
    paddingVertical: SPACING[64],
    paddingHorizontal: SPACING[24],
    width: '100%',
  },
  greyBg: {
    backgroundColor: '#FAFCFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.neutral[100],
  },
  sectionTitleBlue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 32,
    fontWeight: '800',
    color: '#1236A8',
    marginBottom: SPACING[32],
    letterSpacing: -0.5,
  },
  centerText: {
    textAlign: 'center',
  },
  centerSelf: {
    alignSelf: 'center',
  },
  stepsTwoRowContainer: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    marginTop: SPACING[16],
  },
  stepsRowTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[24],
  },
  stepsRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepsMobileContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: SPACING[24],
  },
  stepCardDesktopExact: {
    width: 275,
  },
  stepCardExact: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    padding: SPACING[24],
    alignItems: 'center',
    justifyContent: 'center',
    height: 195,
  },
  stepCircleBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1236A8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#1236A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  stepCircleBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.neutral.white,
  },
  stepCardExactTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: '700',
    color: '#1236A8',
    textAlign: 'center',
    marginBottom: SPACING[8],
  },
  stepCardExactDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 18,
  },
  arrowDesktopExact: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 14,
  },
  faqList: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    marginTop: SPACING[8],
  },
  faqItem: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.neutral[200],
    marginBottom: SPACING[16],
    overflow: 'hidden',
  },
  faqItemExpanded: {
    borderColor: '#1236A8',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING[20],
  },
  faqHeaderHovered: {
    backgroundColor: '#F8FAFC',
  },
  faqQuestion: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.neutral[900],
    flex: 1,
    paddingRight: SPACING[12],
  },
  faqIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqIconCircleActive: {
    backgroundColor: '#1236A8',
  },
  faqAnswerContainer: {
    paddingHorizontal: SPACING[20],
    paddingBottom: SPACING[20],
    borderTopColor: COLORS.neutral[100],
  },
  faqAnswer: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    color: COLORS.neutral[600],
    lineHeight: 24,
    marginTop: SPACING[12],
  },
  ctaBoxContainer: {
    width: '100%',
    paddingHorizontal: SPACING[24],
    paddingBottom: SPACING[64],
  },
  ctaBox: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#0F2B88',
    borderRadius: 28,
    paddingVertical: SPACING[64] + 10,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1236A8',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  ctaBoxTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.neutral.white,
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: SPACING[16],
    maxWidth: 780,
    letterSpacing: -0.5,
  },
  ctaBoxSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 36,
    maxWidth: 720,
  },
  ctaPrimaryBtn: {
    backgroundColor: COLORS.neutral.white,
    height: 52,
    paddingHorizontal: 36,
    borderRadius: RADIUS.button,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  footerContainer: {
    backgroundColor: '#081448',
    paddingTop: SPACING[64] + 10,
    paddingBottom: 36,
    paddingHorizontal: SPACING[24],
  },
  footerInnerGrid: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  footerBioCol: {
    width: '35%',
    paddingRight: SPACING[32],
  },
  footerFullWidthCol: {
    width: '100%',
    marginBottom: SPACING[40],
  },
  footerBioText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
    marginTop: SPACING[16],
  },
  footerLinksWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  footerLinksCol: {
    minWidth: 180,
    marginBottom: SPACING[24],
  },
  footerColHeader: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.neutral.white,
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  footerLinkItem: {
    marginBottom: SPACING[12],
    paddingVertical: 2,
  },
  footerLinkHovered: {
    opacity: 0.85,
  },
  footerLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: '#94A3B8',
  },
  footerBottom: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginTop: SPACING[40],
    paddingTop: SPACING[24],
    alignItems: 'center',
  },
  copyrightText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#64748B',
  },
  rowLayout: {
    flexDirection: 'row',
  },
  columnLayout: {
    flexDirection: 'column',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[20],
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    padding: 28,
    position: 'relative',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 6,
    borderRadius: 16,
  },
  closeBtnHovered: {
    backgroundColor: COLORS.neutral[100],
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: SPACING[20],
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.neutral[900],
    textAlign: 'center',
    marginBottom: SPACING[12],
    lineHeight: 28,
  },
  modalSubtitleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[500],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING[24],
  },
  modalInstructionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[500],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING[20],
  },
  modalButtonsContainer: {
    width: '100%',
    marginBottom: SPACING[20],
  },
  modalActionBtn: {
    width: '100%',
    height: 50,
    marginBottom: SPACING[12],
    borderRadius: RADIUS.button,
  },
  modalGuestBtn: {
    borderColor: '#1236A8',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING[8],
  },
  modalFooterText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  modalFooterLink: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: '700',
    color: '#1236A8',
  },
  dropdownLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.smallLabel,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[700],
    marginBottom: SPACING[8],
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 48,
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1.5,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[16],
  },
  dropdownPlaceholderText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.neutral[400],
  },
  dropdownSelectedText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    color: COLORS.neutral[900],
  },
  dropdownMenu: {
    position: 'absolute',
    top: 76,
    left: 0,
    right: 0,
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1.5,
    borderRadius: RADIUS.input,
    zIndex: 1000,
    maxHeight: 180,
    elevation: 5,
  },
  dropdownItem: {
    padding: SPACING[12],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  dropdownItemHovered: {
    backgroundColor: '#EEF2FF',
  },
  dropdownItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[800],
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.semantic.errorBg,
    borderColor: COLORS.semantic.errorBorder,
    borderWidth: 1,
    borderRadius: RADIUS.input,
    padding: SPACING[12],
    marginBottom: SPACING[16],
  },
  errorBannerText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.semantic.error,
  },
  modalSubmitBtn: {
    width: '100%',
    height: 50,
    marginTop: SPACING[8],
    borderRadius: RADIUS.button,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING[16],
    paddingBottom: SPACING[12],
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.neutral[100],
  },
  resultRef: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  badgeSuccess: {
    backgroundColor: COLORS.semantic.successBg,
  },
  textSuccess: {
    color: COLORS.semantic.success,
  },
  badgeInfo: {
    backgroundColor: COLORS.semantic.infoBg,
  },
  textInfo: {
    color: COLORS.semantic.info,
  },
  badgeWarning: {
    backgroundColor: COLORS.semantic.warningBg,
  },
  textWarning: {
    color: COLORS.semantic.warning,
  },
  badgeDefault: {
    backgroundColor: COLORS.neutral[100],
  },
  textDefault: {
    color: COLORS.neutral[600],
  },
  resultCard: {
    width: '100%',
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    padding: SPACING[16],
    marginBottom: SPACING[20],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  resultLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
    fontWeight: '500',
  },
  resultValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[800],
    fontWeight: '600',
    textAlign: 'right',
  },
  modalResetBtn: {
    width: '100%',
    height: 50,
    borderColor: '#1236A8',
    borderRadius: RADIUS.button,
  },
  policyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  policyHeaderIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  policyModalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F2042',
  },
  policyTitleDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
    marginBottom: 20,
    width: '100%',
  },
  policyIntroBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  policyIntroText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: '#1236A8',
    fontWeight: '500',
    lineHeight: 22,
  },
  policySectionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginBottom: 16,
  },
  policySecTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: '700',
    color: '#1236A8',
    marginBottom: 8,
  },
  policySecBody: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[700],
    lineHeight: 22,
  },
  policyHighlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderColor: '#C7D2FE',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  policyHighlightText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '700',
    color: '#1236A8',
  },
});
