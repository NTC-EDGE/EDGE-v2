import { StyleSheet, Platform } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY } from "@edge/ui";

export const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING[24],
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING[16],
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  panelTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: SPACING[24],
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[900],
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
    }),
  },
  clearSearch: {
    padding: 4,
  },
  greetingBanner: {
    marginBottom: SPACING[24],
  },
  greetingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    color: COLORS.neutral[600],
  },
  greetingName: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  greetingSubtext: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[400],
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING[16],
  },
  categoryCard: {
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING[20],
    width: "47%",
    minWidth: 130,
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "transform 200ms ease-out, box-shadow 200ms ease-out",
      },
    }),
  },
  categoryCardActive: {
    borderColor: COLORS.brand[700],
    backgroundColor: "rgba(37, 99, 235, 0.02)",
  },
  categoryImage: {
    width: 82,
    height: 82,
    marginBottom: SPACING[12],
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING[12],
  },
  categoryCardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
    marginBottom: 4,
    textAlign: "center",
  },
  categoryCardCount: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[400],
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: "center",
  },
});
