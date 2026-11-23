import React, { useState, ComponentProps } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, Icon as Lucide, useTheme, AnimatedCard } from "@edge/ui";
import { useAppNavigation } from "../../../navigation/types";
import { NtcLogo } from "./NtcLogo";
type LucideIconName = ComponentProps<typeof Lucide>["name"];

interface OnboardingStep {
  title: string;
  description: string;
  icon: LucideIconName;
}

const ONBOARDING_STEPS: ReadonlyArray<OnboardingStep> = [
  {
    title: "Regional RBAC & Tenant Access",
    description: "Sign in with your NTC staff credentials; your regional office, field office, and role permissions are resolved automatically.",
    icon: "shield",
  },
  {
    title: "Accountable Evaluation & SOA/OP",
    description: "Claim applications in queue, verify requirements, generate Statements of Account (SOA), and approve Orders of Payment (OP).",
    icon: "layers",
  },
  {
    title: "Cashiering, Issuance & Collaboration",
    description: "Manage Official Receipt (OR) booklets, issue statutory licenses/permits, schedule exams, and collaborate via staff Chat & Meet.",
    icon: "bar-chart-2",
  },
];

export function OnboardingScreen(): React.ReactElement {
  const { colors, isDark } = useTheme();
  const navigation = useAppNavigation();
  const { width } = useWindowDimensions();
  const isTablet = width >= 640;
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      navigation.navigate("InternalLogin");
    }
  };

  const handleSkip = () => {
    navigation.navigate("InternalLogin");
  };

  const step = ONBOARDING_STEPS[currentStep] ?? ONBOARDING_STEPS[0];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.container,
            isTablet && { maxWidth: 480, paddingHorizontal: 32 },
          ]}
        >
          <View style={styles.header}>
            <NtcLogo size="small" variant="auto" showSubtext={false} />
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton} activeOpacity={0.7}>
              <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
            </TouchableOpacity>
          </View>

          <AnimatedCard delay={0} padding={isTablet ? 32 : 24} style={styles.contentCard}>
            <View style={styles.contentInner}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light },
                ]}
              >
                <Lucide
                  name={step.icon}
                  size={48}
                  color={isDark ? colors.brand.primary : colors.brand.secondary}
                />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>{step.title}</Text>
              <Text style={[styles.description, { color: colors.textMuted }]}>{step.description}</Text>
            </View>
          </AnimatedCard>

          <View style={styles.footer}>
            <View style={styles.paginationIndicator}>
              {ONBOARDING_STEPS.map((s, index) => (
                <TouchableOpacity
                  key={s.title}
                  onPress={() => setCurrentStep(index)}
                  style={[
                    styles.dot,
                    { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[300] },
                    currentStep === index && [
                      styles.dotActive,
                      { backgroundColor: isDark ? colors.brand.primary : colors.brand.secondary },
                    ],
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.nextButton,
                { backgroundColor: isDark ? colors.brand.primary : colors.brand.secondary },
              ]}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === ONBOARDING_STEPS.length - 1 ? "Sign In" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: SPACING[20],
    maxWidth: 440,
    width: "100%",
    alignSelf: "center",
    gap: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SPACING[12],
  },
  skipButton: {
    padding: SPACING[8],
  },
  skipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  contentCard: {
    width: "100%",
  },
  contentInner: {
    alignItems: "center",
    paddingVertical: SPACING[16],
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING[24],
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: "center",
    marginBottom: SPACING[12],
  },
  description: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: SPACING[12],
  },
  footer: {
    width: "100%",
    paddingBottom: SPACING[16],
  },
  paginationIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: SPACING[24],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  nextButton: {
    paddingVertical: 14,
    borderRadius: RADIUS.button,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
});
