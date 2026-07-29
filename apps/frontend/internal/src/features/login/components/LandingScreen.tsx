import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Image, SafeAreaView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@edge/ui';
import { useNavigation } from '@react-navigation/native';

const footerLogoAsset = require("../../../../assets/footer-logo.png"); // Make sure this path exists relative to this file

export function LandingScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          {/* Logo placeholder, using project colors for now if image fails */}
           <View style={styles.logoPlaceholder}>
             <Text style={styles.logoText}>EDGE</Text>
           </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>NTC-EDGE Internal Portal</Text>
          <Text style={styles.subtitle}>
            Secure access to queue management, document evaluation, and staff operations.
          </Text>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed, hovered }: any) => [
              styles.buttonPrimary,
              pressed && styles.buttonPressed,
              hovered && styles.buttonHovered,
            ]}
            onPress={() => navigation.navigate('Onboarding')}
          >
            <Text style={styles.buttonPrimaryText}>Get Started</Text>
          </Pressable>

          <Pressable
            style={({ pressed, hovered }: any) => [
              styles.buttonSecondary,
              pressed && styles.buttonSecondaryPressed,
              hovered && styles.buttonSecondaryHovered,
            ]}
            onPress={() => navigation.navigate('InternalLogin')}
          >
            <Text style={styles.buttonSecondaryText}>Log in to existing account</Text>
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
    marginTop: Platform.OS === 'ios' ? SPACING[32] : SPACING[64],
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.brand[800],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[24],
  },
  logoText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    textAlign: 'center',
    marginBottom: SPACING[16],
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    color: COLORS.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING[16],
  },
  footer: {
    width: '100%',
    gap: SPACING[16],
    paddingBottom: Platform.OS === 'ios' ? SPACING[32] : SPACING[24],
  },
  buttonPrimary: {
    backgroundColor: COLORS.brand[800],
    paddingVertical: SPACING[16],
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'all 0.2s ease-in-out' },
    }),
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonHovered: {
    backgroundColor: COLORS.brand[900],
  },
  buttonPrimaryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING[16],
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'all 0.2s ease-in-out' },
    }),
  },
  buttonSecondaryPressed: {
    backgroundColor: COLORS.neutral[100],
  },
  buttonSecondaryHovered: {
    backgroundColor: COLORS.neutral[50],
  },
  buttonSecondaryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[800],
  },
});
