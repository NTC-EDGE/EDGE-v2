import { StyleSheet, Platform } from 'react-native';
import { COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY } from '../../shared/theme/tokens';

export const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: SPACING[20],
    position: "relative",
  },
  bgGlow: {
    position: "absolute",
    bottom: "20%",
    left: "20%",
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "#7392FF",
    opacity: 0.12,
    zIndex: -1,
  },
  outerContainer: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    zIndex: 1,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: SPACING[16],
  },
  backButtonText: {
    color: COLORS.neutral[600],
    textDecorationLine: "none",
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.glass.bg,
    borderColor: COLORS.glass.border,
    borderWidth: 1.5,
    borderRadius: RADIUS.dialog,
    padding: SPACING[32],
    width: "100%",
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: SPACING[24],
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[500],
    textAlign: "center",
    marginBottom: SPACING[24],
    lineHeight: 20,
  },
  form: {
    width: "100%",
  },
  submitButton: {
    width: "100%",
    marginTop: SPACING[8],
  },
  backToLoginBtn: {
    alignSelf: "center",
    marginTop: SPACING[20],
  },
  backToLoginText: {
    fontSize: 14,
    color: COLORS.brand[800],
    textDecorationLine: "none",
  },
  successWrapper: {
    width: "100%",
  },
  successBox: {
    backgroundColor: COLORS.semantic.successBg,
    borderColor: COLORS.semantic.successBorder,
    borderWidth: 1,
    borderRadius: RADIUS.input,
    padding: SPACING[20],
    marginVertical: SPACING[12],
    alignItems: "center",
  },
  successIcon: {
    marginBottom: SPACING[8],
  },
  successText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.semantic.success,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: "center",
    lineHeight: 20,
  },
  boldText: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
  },
  returnButton: {
    width: "100%",
    marginTop: SPACING[12],
  },
});
