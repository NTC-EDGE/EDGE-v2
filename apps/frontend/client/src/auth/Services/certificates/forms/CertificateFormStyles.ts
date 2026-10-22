import { StyleSheet, Dimensions } from "react-native";
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS } from "../../../../shared/theme/tokens";

const windowWidth = Dimensions.get("window").width;
const isMobileScreen = windowWidth < 640;

export const certStyles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
  },
  formSection: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.card,
  },
  formSectionHeading: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: 16,
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  formCol12: {
    width: "100%",
    paddingHorizontal: 8,
  },
  formCol6: {
    width: isMobileScreen ? "100%" : "50%",
    paddingHorizontal: 8,
  },
  formCol4: {
    width: isMobileScreen ? "100%" : "33.333%",
    paddingHorizontal: 8,
  },
  formCol3: {
    width: isMobileScreen ? "100%" : "25%",
    paddingHorizontal: 8,
  },
  formColCompact: {
    width: "50%",
    minWidth: 100,
    paddingHorizontal: 8,
  },
  selectLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[700],
    marginBottom: 8,
  },
  infoBanner: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: RADIUS.input,
    padding: 12,
    marginBottom: 16,
  },
  infoBannerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 18,
  },
  cardRepeater: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.input,
    padding: 16,
    marginBottom: 12,
  },
  repeaterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  repeaterTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.brand[800],
    borderRadius: RADIUS.input,
    paddingVertical: 10,
    marginTop: 8,
    gap: 8,
  },
  addButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[800],
  },
  removeButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.semantic.error,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  checkboxGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: "50%",
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.neutral[400],
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxSelected: {
    backgroundColor: COLORS.brand[800],
    borderColor: COLORS.brand[800],
  },
  checkboxLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[700],
    flexShrink: 1,
  },
});
