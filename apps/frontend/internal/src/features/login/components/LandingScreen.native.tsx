import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, useTheme, AnimatedCard } from "@edge/ui";
import { useAppNavigation } from "../../../navigation/types";

export function LandingScreen(): React.ReactElement {
  const { colors, isDark } = useTheme();
  const navigation = useAppNavigation();

  const handleGetStarted = () => {
    navigation.navigate("Onboarding");
  };

  const handleLogin = () => {
    navigation.navigate("InternalLogin");
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <AnimatedCard delay={0} padding={24} style={styles.cardWrapper}>
            <View style={styles.header}>
              <View
                style={[
                  styles.logoPlaceholder,
                  { backgroundColor: isDark ? colors.brand.primary : colors.brand.secondary },
                ]}
              >
                <Text style={styles.logoText}>EDGE</Text>
              </View>

              <View
                style={[
                  styles.badgePill,
                  { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light },
                ]}
              >
                <View style={[styles.pulseDot, { backgroundColor: colors.semantic.success }]} />
                <Text
                  style={[
                    styles.badgeText,
                    { color: isDark ? colors.brand.primary : colors.brand.secondary },
                  ]}
                >
                  NTC MOBILE PORTAL
                </Text>
              </View>
            </View>

            <View style={styles.content}>
              <Text style={[styles.title, { color: colors.text }]}>
                NTC-EDGE Internal Portal
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Secure access to multi-tenant regional queue management, document evaluation, and staff operations.
              </Text>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.buttonPrimary,
                  { backgroundColor: isDark ? colors.brand.primary : colors.brand.secondary },
                ]}
                onPress={handleGetStarted}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonPrimaryText}>Get Started</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.buttonSecondary,
                  {
                    borderColor: colors.border,
                    backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
                  },
                ]}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <Text style={[styles.buttonSecondaryText, { color: colors.text }]}>
                  Log in to existing account
                </Text>
              </TouchableOpacity>
            </View>
          </AnimatedCard>
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
    alignItems: "center",
    padding: SPACING[20],
  },
  container: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  cardWrapper: {
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING[24],
  },
  logoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING[16],
  },
  logoText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
    letterSpacing: 2,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  content: {
    alignItems: "center",
    marginBottom: SPACING[32],
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 26,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: "center",
    marginBottom: SPACING[12],
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  footer: {
    width: "100%",
    gap: SPACING[12],
  },
  buttonPrimary: {
    paddingVertical: 14,
    borderRadius: RADIUS.button,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimaryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  buttonSecondary: {
    paddingVertical: 14,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSecondaryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
