import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@edge/ui";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
  },
  infoTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: SPACING[12],
  },
  infoDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600],
    lineHeight: 22,
    marginBottom: SPACING[24],
    textAlign: "justify",
  },
  availCard: {
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    borderRadius: RADIUS.card,
    padding: SPACING[20],
    marginBottom: SPACING[24],
  },
  availHeading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[400],
    letterSpacing: 1,
    marginBottom: SPACING[12],
  },
  availItem: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[700],
    lineHeight: 20,
  },
  stepSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
    marginBottom: SPACING[20],
  },
  selectLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[500],
    marginBottom: SPACING[8],
  },
});
