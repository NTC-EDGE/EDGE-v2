import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, useTheme, AnimatedCard, Icon as Lucide } from "@edge/ui";
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
    <View style={[styles.webShell, { backgroundColor: colors.bg }]}>
      <View style={styles.glowSpotTop} pointerEvents="none" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <AnimatedCard delay={0} padding={32} style={styles.cardWrapper}>
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
                  WEB WORKSTATION • PORTAL V2
                </Text>
              </View>
            </View>

            <View style={styles.content}>
              <Text style={[styles.title, { color: colors.text }]}>
                NTC-EDGE Internal Portal
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Secure enterprise access to multi-tenant regional queue management, document evaluation, and staff operations.
              </Text>
            </View>

            <View style={styles.featuresRow}>
              <View style={styles.featureItem}>
                <Lucide name="shield" size={16} color={isDark ? colors.brand.primary : colors.brand.secondary} />
                <Text style={[styles.featureText, { color: colors.textMuted }]}>RBAC Security</Text>
              </View>
              <View style={styles.featureItem}>
                <Lucide name="zap" size={16} color={colors.semantic.success} />
                <Text style={[styles.featureText, { color: colors.textMuted }]}>Live Telemetry</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.buttonPrimary,
                  { backgroundColor: isDark ? colors.brand.primary : colors.brand.secondary },
                ]}
                onPress={handleGetStarted}
                activeOpacity={0.85}
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
                activeOpacity={0.85}
              >
                <Text style={[styles.buttonSecondaryText, { color: colors.text }]}>
                  Log in to existing account
                </Text>
              </TouchableOpacity>
            </View>
          </AnimatedCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  webShell: {
    flex: 1,
  },
  glowSpotTop: {
    position: "absolute",
    top: -120,
    alignSelf: "center",
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "rgba(37, 99, 235, 0.12)",
    ...Platform.select({ web: { filter: "blur(100px)" } }),
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
  cardWrapper: {
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING[24],
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING[16],
  },
  logoText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
    letterSpacing: 2,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
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
    marginBottom: SPACING[24],
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: "center",
    marginBottom: SPACING[12],
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  featuresRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 28,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featureText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  footer: {
    width: "100%",
    gap: SPACING[12],
  },
  buttonPrimary: {
    paddingVertical: SPACING[16],
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
    paddingVertical: SPACING[16],
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
