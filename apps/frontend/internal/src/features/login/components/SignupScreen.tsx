import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, SafeAreaView, TextInput } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, Icon as Lucide } from '@edge/ui';
import { useNavigation } from '@react-navigation/native';

export function SignupScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }: any) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          >
            <Lucide name="arrow-left" size={24} color={COLORS.neutral[900]} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Register for an internal staff account.</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Lucide name="user" size={18} color={COLORS.neutral[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={COLORS.neutral[400]}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Lucide name="mail" size={18} color={COLORS.neutral[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="john.doe@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={COLORS.neutral[400]}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Department ID / Role Code</Text>
              <View style={styles.inputWrapper}>
                <Lucide name="key" size={18} color={COLORS.neutral[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. EVAL-01"
                  autoCapitalize="characters"
                  placeholderTextColor={COLORS.neutral[400]}
                />
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed, hovered }: any) => [
              styles.submitBtn,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              hovered && { backgroundColor: COLORS.brand[900] }
            ]}
            onPress={() => navigation.navigate('InternalLogin')}
          >
            <Text style={styles.submitBtnText}>Request Access</Text>
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => navigation.navigate('InternalLogin')}>
              <Text style={styles.loginLink}>Log in</Text>
            </Pressable>
          </View>
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
    padding: SPACING[24],
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? SPACING[16] : SPACING[32],
    marginBottom: SPACING[24],
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  content: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: SPACING[32],
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: SPACING[8],
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    color: COLORS.neutral[600],
  },
  formContainer: {
    gap: SPACING[20],
    marginBottom: SPACING[32],
  },
  inputGroup: {
    gap: SPACING[8],
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.neutral.white,
    paddingHorizontal: SPACING[16],
    height: 48,
  },
  inputIcon: {
    marginRight: SPACING[12],
  },
  input: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    color: COLORS.neutral[900],
    height: '100%',
    ...Platform.select({ web: { outlineWidth: 0 } }),
  },
  submitBtn: {
    backgroundColor: COLORS.brand[800],
    paddingVertical: SPACING[16],
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[24],
    ...Platform.select({ web: { cursor: 'pointer', transition: 'all 0.2s ease' } }),
  },
  submitBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  loginLink: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
});
