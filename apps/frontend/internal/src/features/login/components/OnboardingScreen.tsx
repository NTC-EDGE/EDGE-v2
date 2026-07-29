import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, SafeAreaView, useWindowDimensions } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, Icon as Lucide } from '@edge/ui';
import { useNavigation } from '@react-navigation/native';

const ONBOARDING_STEPS = [
  {
    title: 'Secure Role Authentication',
    description: 'Login securely with Clerk and choose your assigned internal department role.',
    icon: 'shield',
  },
  {
    title: 'Real-time Queue Management',
    description: 'Process applicants and update application statuses directly from the dashboard.',
    icon: 'layers',
  },
  {
    title: 'Streamlined Analytics',
    description: 'Generate reports, manage receipts, and evaluate EOD operations efficiently.',
    icon: 'bar-chart-2',
  },
];

export function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const [currentStep, setCurrentStep] = useState(0);
  const { width } = useWindowDimensions();

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      navigation.navigate('Signup');
    }
  };

  const handleSkip = () => {
    navigation.navigate('InternalLogin');
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={handleSkip} style={({ pressed, hovered }: any) => [styles.skipButton, pressed && { opacity: 0.7 }]}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
             {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Lucide name={step.icon as any} size={48} color={COLORS.brand[800]} />
          </View>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.paginationIndicator}>
            {ONBOARDING_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentStep === index && styles.dotActive
                ]}
              />
            ))}
          </View>

          <Pressable
            style={({ pressed, hovered }: any) => [
              styles.nextButton,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              hovered && { backgroundColor: COLORS.brand[900] }
            ]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === ONBOARDING_STEPS.length - 1 ? "Create Account" : "Next"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING[24],
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? SPACING[16] : SPACING[32],
  },
  skipButton: {
    padding: SPACING[8],
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  skipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[500],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[32],
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    textAlign: 'center',
    marginBottom: SPACING[16],
  },
  description: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    color: COLORS.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING[24],
  },
  footer: {
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? SPACING[32] : SPACING[24],
  },
  paginationIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING[32],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.neutral[300],
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.brand[800],
  },
  nextButton: {
    backgroundColor: COLORS.brand[800],
    paddingVertical: SPACING[16],
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'all 0.2s ease' },
    }),
  },
  nextButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
});
