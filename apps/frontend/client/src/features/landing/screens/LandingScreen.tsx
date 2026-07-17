import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

const PHILIPPINE_REGIONS = [
  'NCR - National Capital Region',
  'CAR - Cordillera Administrative Region',
  'Region I - Ilocos Region',
  'Region II - Cagayan Valley',
  'Region III - Central Luzon',
  'Region IV-A - CALABARZON',
  'MIMAROPA Region',
  'Region V - Bicol Region',
  'Region VI - Western Visayas',
  'Region VII - Central Visayas',
  'Region VIII - Eastern Visayas',
  'Region IX - Zamboanga Peninsula',
  'Region X - Northern Mindanao',
  'Region XI - Davao Region',
  'Region XII - SOCCSKSARGEN',
  'Region XIII - Caraga',
  'BARMM - Bangsamoro Autonomous Region in Muslim Mindanao',
];

interface LandingScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export function LandingScreen({ navigation }: LandingScreenProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { loginAsGuest } = useGuestAuth();

  // Modal visibility states
  const [isGetStartedModalVisible, setIsGetStartedModalVisible] = useState(false);
  const [isTrackModalVisible, setIsTrackModalVisible] = useState(false);

  // Tracking form states
  const [referenceNo, setReferenceNo] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [trackingResult, setTrackingResult] = useState<any | null>(null);

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
  const faqAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

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
    });
  }, [floatAnimBlue, floatAnimPink, floatAnimMockup, fadeAnimHero, slideAnimHero, cardAnims]);

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
      a: 'The Electronic Data Governance and Evaluation (EDGE) application is an online information system built by the National Telecommunications Commission (NTC) for issuing certificates, permits, licenses, and handling complaints or requests.',
    },
    {
      q: 'Who can use this portal?',
      a: 'Individuals, businesses, and network operators who need to interact with the NTC for telecommunication services, permits, licenses, and tracking complaints.',
    },
    {
      q: 'Is my data secure?',
      a: 'Yes, absolutely. We implement industry-standard encryption, strict user authentication protocol through Clerk, and secure role-based access control to safeguard all application data.',
    },
  ];

  type IconName = 'shield' | 'search' | 'file-text';
  const features: { title: string; desc: string; icon: IconName }[] = [
    { title: 'Secure & Trusted', desc: 'Industry-standard security protects your information with encryption and compliance.', icon: 'shield' },
    { title: 'Real-time Tracking', desc: 'Monitor your application status anytime, anywhere. Get instant updates.', icon: 'search' },
    { title: 'Simple Process', desc: 'Streamlined workflows make applying quick and easy.', icon: 'file-text' },
  ];

  return (
    <View style={styles.container}>
      {/* Header/Navbar */}
      <View style={styles.headerOuter}>
        <View style={styles.headerInner}>
          <Logo />
          
          {isDesktop ? (
            <View style={styles.navLinks}>
              <TouchableOpacity onPress={() => scrollToSection('about')} style={styles.navLink}>
                <Text style={styles.navLinkText}>About</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => scrollToSection('howItWorks')} style={styles.navLink}>
                <Text style={styles.navLinkText}>How it works</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => scrollToSection('faqs')} style={styles.navLink}>
                <Text style={styles.navLinkText}>FAQs</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setIsTrackModalVisible(true)} style={[styles.navLink, { marginRight: SPACING[16] }]}>
                <Text style={[styles.navLinkText, { color: '#1236A8', fontWeight: '700' }]}>Track Application</Text>
              </TouchableOpacity>

              <Button
                title="Get Started"
                size="sm"
                onPress={() => setIsGetStartedModalVisible(true)}
                style={styles.headerCtaBtn}
              />
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setIsTrackModalVisible(true)} style={[styles.navLink, { marginRight: SPACING[12] }]}>
                <Text style={[styles.navLinkText, { color: '#1236A8', fontWeight: '700', fontSize: 13 }]}>Track Application</Text>
              </TouchableOpacity>
              <Button
                title="Get Started"
                size="sm"
                onPress={() => setIsGetStartedModalVisible(true)}
                style={styles.headerCtaBtn}
              />
            </View>
          )}
        </View>
      </View>

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
        {/* Glow Spots */}
        <Animated.View
          style={[
            styles.glowSpotBlue,
            { transform: [{ translateY: translateYBlue }, { translateX: translateXBlue }] },
            Platform.OS === 'web' ? { filter: 'blur(100px)' } as any : { opacity: 0.08 },
          ]}
        />
        <Animated.View
          style={[
            styles.glowSpotPink,
            { transform: [{ translateY: translateYPink }, { translateX: translateXPink }] },
            Platform.OS === 'web' ? { filter: 'blur(100px)' } as any : { opacity: 0.06 },
          ]}
        />
        {Platform.OS === 'web' && (
          <View
            style={[
              styles.glowSpotCenter,
              { filter: 'blur(120px)' } as any,
            ]}
          />
        )}

        {/* Hero Section */}
        <Animated.View style={[
          styles.heroSection,
          isDesktop ? styles.heroSectionDesktop : null,
          { opacity: fadeAnimHero, transform: [{ translateY: slideAnimHero }] }
        ]}>
          <View style={isDesktop ? styles.heroLeftCol : styles.heroFullWidth}>
            {/* Lavender/Blue Pill Badge */}
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
                icon={<Lucide name="arrow-right" size={16} color={COLORS.neutral.white} />}
              />
              <Button
                title="Track Application"
                onPress={() => setIsTrackModalVisible(true)}
                variant="outline"
                size="lg"
                style={styles.heroSecondaryBtn}
                textStyle={{ color: '#1236A8' }}
                icon={<Lucide name="search" size={16} color="#1236A8" />}
              />
            </View>
          </View>

          {isDesktop ? (
            <Animated.View style={[styles.heroRightCol, { transform: [{ translateY: floatAnimMockup }] }]}>
              {/* Modern dashboard preview card */}
              <View style={[styles.mockupCard, SHADOWS.modal]}>
                <View style={styles.mockupHeader}>
                  <View style={styles.mockupDots}>
                    <View style={[styles.mockupDot, { backgroundColor: '#EF4444' }]} />
                    <View style={[styles.mockupDot, { backgroundColor: '#F59E0B' }]} />
                    <View style={[styles.mockupDot, { backgroundColor: '#10B981' }]} />
                  </View>
                  <Text style={styles.mockupHeaderText}>ntc-edge.gov.ph</Text>
                </View>
                
                <View style={styles.mockupBody}>
                  {/* Stats Row */}
                  <View style={styles.mockupStatsRow}>
                    <View style={styles.mockupStatCard}>
                      <Text style={styles.mockupStatLabel}>Applications</Text>
                      <Text style={[styles.mockupStatValue, { color: '#1236A8' }]}>12,450</Text>
                    </View>
                    <View style={styles.mockupStatCard}>
                      <Text style={styles.mockupStatLabel}>Pending</Text>
                      <Text style={[styles.mockupStatValue, { color: '#DC2626' }]}>18</Text>
                    </View>
                    <View style={styles.mockupStatCard}>
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

        {/* "Why Choose EDGE?" Section */}
        <View
          style={styles.featuresSection}
          onLayout={(e) => handleSectionLayout('about', e.nativeEvent.layout.y)}
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
                    styles.featCard,
                    SHADOWS.card,
                    isDesktop ? styles.featCardDesktop : null,
                    {
                      opacity: cardAnim,
                      transform: [{ translateY: cardTranslateY }],
                    }
                  ]}
                >
                  <View style={styles.featIconWrapper}>
                    <Lucide name={feat.icon} size={20} color={COLORS.neutral.white} />
                  </View>
                  <Text style={styles.featCardTitle}>{feat.title}</Text>
                  <Text style={styles.featCardDesc}>{feat.desc}</Text>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* How It Works Section */}
        <View
          style={[styles.sectionContainer, styles.greyBg]}
          onLayout={(e) => handleSectionLayout('howItWorks', e.nativeEvent.layout.y)}
        >
          <Text style={[styles.sectionTitle, styles.centerText]}>How It Works</Text>
          <View style={[styles.titleUnderline, styles.centerSelf]} />
          
          <View style={[styles.stepsContainer, isDesktop ? styles.stepsRow : styles.stepsColumn]}>
            <View style={[styles.stepCard, SHADOWS.card, isDesktop ? styles.stepCardDesktop : null]}>
              <View style={styles.stepBadge}>
                <Lucide name="user-plus" size={18} color={COLORS.neutral.white} />
              </View>
              <Text style={styles.stepCardTitle}>Create Account/Apply</Text>
              <Text style={styles.stepCardDesc}>Register an account or tap Start Application to begin.</Text>
            </View>
            
            <View style={[isDesktop ? styles.arrowDesktop : styles.arrowMobile]}>
              <Lucide name={isDesktop ? 'arrow-right' : 'arrow-down'} size={18} color={COLORS.neutral[300]} />
            </View>

            <View style={[styles.stepCard, SHADOWS.card, isDesktop ? styles.stepCardDesktop : null]}>
              <View style={styles.stepBadge}>
                <Lucide name="file-text" size={18} color={COLORS.neutral.white} />
              </View>
              <Text style={styles.stepCardTitle}>Submit Application</Text>
              <Text style={styles.stepCardDesc}>Complete forms and upload necessary requirements.</Text>
            </View>

            <View style={[isDesktop ? styles.arrowDesktop : styles.arrowMobile]}>
              <Lucide name={isDesktop ? 'arrow-right' : 'arrow-down'} size={18} color={COLORS.neutral[300]} />
            </View>

            <View style={[styles.stepCard, SHADOWS.card, isDesktop ? styles.stepCardDesktop : null]}>
              <View style={styles.stepBadge}>
                <Lucide name="activity" size={18} color={COLORS.neutral.white} />
              </View>
              <Text style={styles.stepCardTitle}>Track Application</Text>
              <Text style={styles.stepCardDesc}>Monitor status using your reference number or dashboard.</Text>
            </View>
          </View>
        </View>

        {/* FAQs Accordion */}
        <View
          style={styles.sectionContainer}
          onLayout={(e) => handleSectionLayout('faqs', e.nativeEvent.layout.y)}
        >
          <Text style={[styles.sectionTitle, styles.centerText]}>Frequently Asked Questions</Text>
          <View style={[styles.titleUnderline, styles.centerSelf]} />

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
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleFaqPress(idx)}
                    style={styles.faqHeader}
                  >
                    <Text style={styles.faqQuestion}>{faq.q}</Text>
                    <Lucide
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color="#1236A8"
                    />
                  </TouchableOpacity>
                  
                  <Animated.View style={[styles.faqAnswerContainer, faqAnswerStyle, { overflow: 'hidden' }]}>
                    <Text style={styles.faqAnswer}>{faq.a}</Text>
                  </Animated.View>
                </View>
              );
            })}
          </View>
        </View>

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
              textStyle={{ color: '#1236A8' }}
              icon={<Lucide name="arrow-right" size={16} color="#1236A8" />}
            />
          </View>
        </View>

        {/* Detailed Footer */}
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
                <Text style={styles.footerColHeader}>Quick Links</Text>
                <TouchableOpacity onPress={() => scrollToSection('about')} style={styles.footerLinkItem}>
                  <Text style={styles.footerLinkText}>About</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => scrollToSection('howItWorks')} style={styles.footerLinkItem}>
                  <Text style={styles.footerLinkText}>How It Works</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => scrollToSection('faqs')} style={styles.footerLinkItem}>
                  <Text style={styles.footerLinkText}>FAQs</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footerLinksCol}>
                <Text style={styles.footerColHeader}>Legal</Text>
                <TouchableOpacity style={styles.footerLinkItem}>
                  <Text style={styles.footerLinkText}>User Agreement</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerLinkItem}>
                  <Text style={styles.footerLinkText}>Privacy Policy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerLinkItem}>
                  <Text style={styles.footerLinkText}>Cookie Policy</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footerLinksCol}>
                <Text style={styles.footerColHeader}>Support</Text>
                <TouchableOpacity style={styles.footerLinkItem}>
                  <Text style={styles.footerLinkText}>Community Guidelines</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerLinkItem}>
                  <Text style={styles.footerLinkText}>Send Feedback</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerLinkItem}>
                  <Text style={styles.footerLinkText}>Help Center</Text>
                </TouchableOpacity>
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
            onPress={() => {}} // prevent click propagation
          >
            {/* Close Button */}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setIsGetStartedModalVisible(false)}
            >
              <Lucide name="x" size={20} color={COLORS.neutral[500]} />
            </TouchableOpacity>

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
                  navigation.navigate('Login');
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
              <TouchableOpacity
                onPress={() => {
                  setIsGetStartedModalVisible(false);
                  navigation.navigate('SignUp');
                }}
              >
                <Text style={styles.modalFooterLink}>Sign Up</Text>
              </TouchableOpacity>
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
          // reset state
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
            // reset state
            setReferenceNo('');
            setSelectedRegion('');
            setIsRegionDropdownOpen(false);
            setTrackingError('');
            setTrackingResult(null);
          }}
        >
          <TouchableOpacity
            style={[styles.modalCard, SHADOWS.modal, { maxWidth: 440 }]}
            activeOpacity={1}
            onPress={() => setIsRegionDropdownOpen(false)} // close dropdown if clicked elsewhere in card
          >
            {/* Close Button */}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => {
                setIsTrackModalVisible(false);
                // reset state
                setReferenceNo('');
                setSelectedRegion('');
                setIsRegionDropdownOpen(false);
                setTrackingError('');
                setTrackingResult(null);
              }}
            >
              <Lucide name="x" size={20} color={COLORS.neutral[500]} />
            </TouchableOpacity>

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
                          <TouchableOpacity
                            key={region}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setSelectedRegion(region);
                              setIsRegionDropdownOpen(false);
                              setTrackingError('');
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{region}</Text>
                          </TouchableOpacity>
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
    backgroundColor: COLORS.neutral.white,
  },
  headerOuter: {
    width: '100%',
    backgroundColor: COLORS.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
    height: 70,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: 1200,
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLink: {
    marginRight: SPACING[24],
  },
  navLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral[600],
  },
  headerCtaBtn: {
    height: 38,
    backgroundColor: '#1236A8', // Vibrant dark blue button
    borderRadius: RADIUS.button,
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
    top: -50,
    left: -100,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: '#1236A8',
    opacity: 0.08,
    zIndex: -1,
  },
  glowSpotPink: {
    position: 'absolute',
    top: 100,
    right: -100,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: '#DC2626',
    opacity: 0.06,
    zIndex: -1,
  },
  glowSpotCenter: {
    position: 'absolute',
    bottom: '25%',
    left: '30%',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: '#1236A8',
    opacity: 0.04,
    zIndex: -1,
  },
  heroSection: {
    paddingVertical: SPACING[64] + 30,
    paddingHorizontal: SPACING[20],
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  heroSectionDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeftCol: {
    flex: 1.1,
    paddingRight: SPACING[40],
    alignItems: 'flex-start',
  },
  heroRightCol: {
    flex: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFullWidth: {
    width: '100%',
    alignItems: 'center',
  },
  mockupCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.neutral[100],
    overflow: 'hidden',
  },
  mockupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  mockupDots: {
    flexDirection: 'row',
    marginRight: 16,
  },
  mockupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  mockupHeaderText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[400],
    fontWeight: '500',
  },
  mockupBody: {
    padding: 20,
  },
  mockupStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mockupStatCard: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral[100],
  },
  mockupStatLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: COLORS.neutral[500],
    fontWeight: '600',
    marginBottom: 4,
  },
  mockupStatValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  mockupAppCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    marginBottom: 16,
  },
  mockupAppHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mockupAppTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.neutral[800],
  },
  mockupAppMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: COLORS.neutral[400],
  },
  mockupStatusBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  mockupStatusText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: '700',
    color: '#D97706',
  },
  mockupProgressContainer: {
    width: '100%',
  },
  mockupProgressBar: {
    height: 6,
    backgroundColor: COLORS.neutral[200],
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  mockupProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  mockupProgressFillRed: {
    height: '100%',
    position: 'absolute',
  },
  mockupProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  mockupProgressLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    color: COLORS.neutral[400],
  },
  mockupActivityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  mockupActivityText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[700],
    flex: 1,
  },
  mockupActivityTime: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    color: COLORS.neutral[400],
    marginLeft: 8,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF', // Lavender / light blue background from reference
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.circle,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    marginBottom: SPACING[24],
  },
  pillBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3538CD', // Lavender dot
    marginRight: 8,
  },
  pillBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '600',
    color: '#3538CD', // Lavender text
  },
  heroTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 48,
    marginBottom: SPACING[24],
    letterSpacing: -0.5,
  },
  heroTitleDesktop: {
    fontSize: 54,
    lineHeight: 64,
    textAlign: 'left',
  },
  titleBlue: {
    color: '#1236A8',
  },
  titleRed: {
    color: '#DC2626', // Vibrant red word "NTC's"
  },
  heroSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    color: COLORS.neutral[600],
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: SPACING[32],
    maxWidth: 700,
  },
  heroSubtitleDesktop: {
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  heroButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroPrimaryBtn: {
    backgroundColor: '#1236A8',
    marginRight: SPACING[16],
    paddingHorizontal: SPACING[32],
    height: 48,
  },
  heroSecondaryBtn: {
    borderColor: '#1236A8',
    backgroundColor: COLORS.neutral.white,
    paddingHorizontal: SPACING[32],
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  featuresSection: {
    paddingVertical: SPACING[64],
    paddingHorizontal: SPACING[20],
    width: '100%',
    alignItems: 'center',
  },
  featuresTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 32,
    fontWeight: '800',
    color: '#1236A8',
    textAlign: 'center',
    marginBottom: SPACING[8],
    letterSpacing: -0.5,
  },
  featuresSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginBottom: SPACING[48],
  },
  featuresGrid: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  featCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[100],
    padding: SPACING[32],
    width: '100%',
    marginBottom: SPACING[20],
  },
  featCardDesktop: {
    flex: 1,
    marginHorizontal: SPACING[8],
    marginBottom: 0,
    minHeight: 220,
  },
  featIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.button,
    backgroundColor: '#1236A8', // Solid blue rounded square background for icons from reference
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[20],
    shadowColor: '#1236A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  featCardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: '700',
    color: '#1236A8', // Blue card titles
    marginBottom: SPACING[12],
  },
  featCardDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600],
    lineHeight: 20,
  },
  sectionContainer: {
    paddingVertical: SPACING[64],
    paddingHorizontal: SPACING[20],
    width: '100%',
  },
  greyBg: {
    backgroundColor: COLORS.neutral[50],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.neutral[900],
    marginBottom: SPACING[12],
    letterSpacing: -0.5,
  },
  titleUnderline: {
    width: 50,
    height: 4,
    backgroundColor: '#1236A8',
    borderRadius: 2,
    marginBottom: SPACING[32],
  },
  centerText: {
    textAlign: 'center',
  },
  centerSelf: {
    alignSelf: 'center',
  },
  stepsContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    marginTop: SPACING[16],
  },
  stepsColumn: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[24],
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  stepCardDesktop: {
    flex: 1,
    marginHorizontal: SPACING[8],
    minHeight: 200,
  },
  stepBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1236A8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[16],
  },
  stepCardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.neutral[900],
    marginBottom: SPACING[8],
    textAlign: 'center',
  },
  stepCardDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
    textAlign: 'center',
    lineHeight: 18,
  },
  arrowMobile: {
    marginVertical: SPACING[12],
  },
  arrowDesktop: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  faqList: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    marginTop: SPACING[16],
  },
  faqItem: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.input,
    borderWidth: 1,
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
  faqQuestion: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.neutral[900],
    flex: 1,
    paddingRight: SPACING[12],
  },
  faqAnswerContainer: {
    paddingHorizontal: SPACING[20],
    paddingBottom: SPACING[20],
    borderTopColor: COLORS.neutral[100],
  },
  faqAnswer: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600],
    lineHeight: 22,
    marginTop: SPACING[12],
  },
  ctaBoxContainer: {
    width: '100%',
    paddingHorizontal: SPACING[20],
    paddingBottom: SPACING[64],
  },
  ctaBox: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#1236A8', // Vibrant dark blue box matching CTA from reference
    borderRadius: 24,
    paddingVertical: SPACING[64],
    paddingHorizontal: SPACING[32],
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBoxTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.neutral.white,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: SPACING[12],
    maxWidth: 700,
  },
  ctaBoxSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    color: '#E0E7FF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING[32],
    maxWidth: 680,
  },
  ctaPrimaryBtn: {
    backgroundColor: COLORS.neutral.white,
    height: 48,
    paddingHorizontal: SPACING[32],
    borderRadius: RADIUS.button,
  },
  footerContainer: {
    backgroundColor: '#0A1B66', // Deep dark blue footer from reference
    paddingTop: SPACING[64],
    paddingBottom: SPACING[32],
    paddingHorizontal: SPACING[20],
  },
  footerInnerGrid: {
    maxWidth: 1200,
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
    color: '#8b9bb4', // Muted slate color for bio text
    lineHeight: 22,
    marginTop: SPACING[16],
  },
  footerLinksWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  footerLinksCol: {
    minWidth: 130,
    marginBottom: SPACING[24],
  },
  footerColHeader: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.neutral.white, // White headers from reference
    marginBottom: SPACING[16],
  },
  footerLinkItem: {
    marginBottom: SPACING[12],
  },
  footerLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#8b9bb4', // Slate links matching reference
  },
  footerBottom: {
    maxWidth: 1200,
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
    fontSize: 12,
    color: '#8b9bb4',
  },
  rowLayout: {
    flexDirection: 'row',
  },
  columnLayout: {
    flexDirection: 'column',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[20],
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 16,
    padding: SPACING[24],
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
    padding: 4,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: SPACING[20],
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.neutral[900],
    textAlign: 'center',
    marginBottom: SPACING[12],
    lineHeight: 26,
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
    fontSize: 13,
    color: COLORS.neutral[500],
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING[20],
  },
  modalButtonsContainer: {
    width: '100%',
    marginBottom: SPACING[20],
  },
  modalActionBtn: {
    width: '100%',
    height: 48,
    marginBottom: SPACING[12],
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
    height: 48,
    marginTop: SPACING[8],
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
    height: 48,
    borderColor: '#1236A8',
  },
});
