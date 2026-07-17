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
} from 'react-native';
import { Feather as Lucide } from '@expo/vector-icons';
import { COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY } from '../../shared/theme/tokens';
import { Button } from '../../shared/components/Button';
import { Logo } from '../../shared/components/Logo';

interface LandingScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export function LandingScreen({ navigation }: LandingScreenProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const scrollViewRef = useRef<ScrollView>(null);
  
  // Section Y coordinates for smooth scroll
  const [sectionYCoords, setSectionYCoords] = useState<{ [key: string]: number }>({});
  
  // FAQ state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Animation values
  const floatAnimBlue = useRef(new Animated.Value(0)).current;
  const floatAnimPink = useRef(new Animated.Value(0)).current;
  const fadeAnimHero = useRef(new Animated.Value(0)).current;
  const slideAnimHero = useRef(new Animated.Value(30)).current;
  const fadeAnimCards = useRef(new Animated.Value(0)).current;

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
      Animated.timing(fadeAnimCards, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    });
  }, [floatAnimBlue, floatAnimPink, fadeAnimHero, slideAnimHero, fadeAnimCards]);

  const handleSectionLayout = (name: string, y: number) => {
    setSectionYCoords((prev) => ({ ...prev, [name]: y }));
  };

  const scrollToSection = (name: string) => {
    const y = sectionYCoords[name];
    if (y !== undefined) {
      scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
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
              
              <Button
                title="Get Started"
                size="sm"
                onPress={() => navigation.navigate('Login')}
                style={styles.headerCtaBtn}
              />
            </View>
          ) : (
            <Button
              title="Get Started"
              size="sm"
              onPress={() => navigation.navigate('Login')}
              style={styles.headerCtaBtn}
            />
          )}
        </View>
      </View>

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
        {/* Glow Spots */}
        <Animated.View
          style={[
            styles.glowSpotBlue,
            { transform: [{ translateY: translateYBlue }, { translateX: translateXBlue }] },
            Platform.OS === 'web' ? { filter: 'blur(100px)' } as any : { opacity: 0.12 },
          ]}
        />
        <Animated.View
          style={[
            styles.glowSpotPink,
            { transform: [{ translateY: translateYPink }, { translateX: translateXPink }] },
            Platform.OS === 'web' ? { filter: 'blur(100px)' } as any : { opacity: 0.08 },
          ]}
        />

        {/* Hero Section */}
        <Animated.View style={[styles.heroSection, { opacity: fadeAnimHero, transform: [{ translateY: slideAnimHero }] }]}>
          {/* Lavender/Blue Pill Badge */}
          <View style={styles.pillBadge}>
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
          
          <Text style={styles.heroSubtitle}>
            Streamline your government services experience. Apply for permits, licenses, and certificates with secure, efficient, and transparent processes powered by EDGE.
          </Text>
          
          <View style={styles.heroButtonsRow}>
            <Button
              title="Get Started"
              onPress={() => navigation.navigate('Login')}
              size="lg"
              style={styles.heroPrimaryBtn}
              icon={<Lucide name="arrow-right" size={16} color={COLORS.neutral.white} />}
            />
            <Button
              title="Track Application"
              onPress={() => navigation.navigate('Login')}
              variant="outline"
              size="lg"
              style={styles.heroSecondaryBtn}
              textStyle={{ color: '#1236A8' }}
              icon={<Lucide name="search" size={16} color="#1236A8" />}
            />
          </View>
        </Animated.View>

        {/* "Why Choose EDGE?" Section */}
        <View
          style={styles.featuresSection}
          onLayout={(e) => handleSectionLayout('about', e.nativeEvent.layout.y)}
        >
          <Text style={styles.featuresTitle}>Why Choose EDGE?</Text>
          <Text style={styles.featuresSubtitle}>Everything you need for seamless government services</Text>
          
          <Animated.View style={[styles.featuresGrid, isDesktop ? styles.rowLayout : styles.columnLayout, { opacity: fadeAnimCards }]}>
            {features.map((feat) => (
              <View key={feat.title} style={[styles.featCard, SHADOWS.card, isDesktop ? styles.featCardDesktop : null]}>
                <View style={styles.featIconWrapper}>
                  <Lucide name={feat.icon} size={20} color={COLORS.neutral.white} />
                </View>
                <Text style={styles.featCardTitle}>{feat.title}</Text>
                <Text style={styles.featCardDesc}>{feat.desc}</Text>
              </View>
            ))}
          </Animated.View>
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
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.9}
                  onPress={() => setExpandedFaq(isExpanded ? null : idx)}
                  style={[styles.faqItem, SHADOWS.card, isExpanded ? styles.faqItemExpanded : null]}
                >
                  <View style={styles.faqHeader}>
                    <Text style={styles.faqQuestion}>{faq.q}</Text>
                    <Lucide
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color="#1236A8"
                    />
                  </View>
                  {isExpanded ? (
                    <View style={styles.faqAnswerContainer}>
                      <Text style={styles.faqAnswer}>{faq.a}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
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
              onPress={() => navigation.navigate('Login')}
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
              <Logo />
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
    top: 30,
    left: -80,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#C5D3E8', // Soft lavender blue glow
    opacity: 0.12,
    zIndex: -1,
  },
  glowSpotPink: {
    position: 'absolute',
    top: 130,
    right: -80,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#F5E6E8', // Soft pink glow
    opacity: 0.08,
    zIndex: -1,
  },
  heroSection: {
    paddingVertical: SPACING[64] + 30,
    paddingHorizontal: SPACING[20],
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 880,
    alignSelf: 'center',
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
    fontSize: 58,
    lineHeight: 68,
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
    borderTopWidth: 1,
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
});
