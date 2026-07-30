import React, { useState, ComponentProps } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, Icon as Lucide, useTheme, AnimatedCard } from "@edge/ui";
import { useAppNavigation } from "../../../navigation/types";
type LucideIconName = ComponentProps<typeof Lucide>["name"];

interface OnboardingStep {
  title: string;
  description: string;
  icon: LucideIconName;
}

const ONBOARDING_STEPS: ReadonlyArray<OnboardingStep> = [
  {
    title: "Secure Role Authentication",
    description: "Login securely with Clerk and choose your assigned internal department role.",
    icon: "shield",
  },
  {
    title: "Real-time Queue Management",
    description: "Process applicants and update application statuses directly from the dashboard.",
    icon: "layers",
  },
  {
    title: "Streamlined Analytics",
    description: "Generate reports, manage receipts, and evaluate EOD operations efficiently.",
    icon: "bar-chart-2",
  },
];

export function OnboardingScreen(): React.ReactElement {
  const { colors, isDark } = useTheme();
  const navigation = useAppNavigation();
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
    <View style={[styles.desktopShell, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton} activeOpacity={0.7}>
              <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
            </TouchableOpacity>
          </View>

          <AnimatedCard delay={0} padding={28} style={styles.contentCard}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  desktopShell: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING[24],
  },
  container: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: SPACING[12],
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
    paddingVertical: SPACING[20],
  },
  iconCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING[24],
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 26,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: "center",
    marginBottom: SPACING[12],
  },
  description: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: SPACING[16],
  },
  footer: {
    width: "100%",
    marginTop: SPACING[24],
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
    paddingVertical: SPACING[16],
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
