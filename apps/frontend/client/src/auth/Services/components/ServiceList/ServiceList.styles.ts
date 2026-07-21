import { StyleSheet, Platform } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY } from "@edge/ui";

export const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING[24],
  },
  mobileNavbar: {
    height: 50,
    backgroundColor: COLORS.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    justifyContent: "center",
    paddingHorizontal: SPACING[16],
  },
  mobileBackBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  mobileBackBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[800],
  },
  subItemsWrapper: {
    flexDirection: "column",
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING[16],
  },
  backLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
    marginLeft: 4,
  },
  subItemsTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: SPACING[16],
  },
  serviceCardItem: {
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    borderRadius: 10,
    padding: SPACING[16],
    marginBottom: SPACING[12],
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "box-shadow 150ms ease-out",
      },
    }),
  },
  serviceCardItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  serviceCardItemTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
    flex: 1,
    marginRight: 10,
  },
  serviceCardItemDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[400],
    lineHeight: 18,
    marginTop: 6,
  },
  serviceCardItemCategory: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[400],
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: 4,
  },
  searchResultsWrapper: {
    flexDirection: "column",
  },
  sectionLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[500],
    textTransform: "uppercase",
    marginBottom: SPACING[12],
    letterSpacing: 0.5,
  },
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: SPACING[40],
  },
  emptyStateText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[400],
  },
});
