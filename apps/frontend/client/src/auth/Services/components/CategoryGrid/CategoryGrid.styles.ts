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
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F2C59",
    letterSpacing: -0.3,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral.white,
    borderColor: "#CBD5E1",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: SPACING[20],
    ...Platform.select({
      web: {
        boxShadow: "0 2px 8px rgba(15, 44, 89, 0.04)",
        transition: "border-color 200ms ease, box-shadow 200ms ease",
      },
    }),
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
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
    backgroundColor: "#0F2C59",
    borderRadius: 16,
    padding: 20,
    marginBottom: SPACING[24],
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.25)",
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      web: {
        backgroundImage: "linear-gradient(135deg, #0F2C59 0%, #1E3A8A 55%, #1D4ED8 100%)",
        boxShadow: "0 10px 25px -5px rgba(15, 44, 89, 0.25), 0 4px 10px rgba(0,0,0,0.06)",
      },
    }),
  },
  greetingHeaderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  greetingBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: "800",
    color: "#FCD34D",
    letterSpacing: 0.8,
  },
  greetingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    color: "#FFFFFF",
    lineHeight: 24,
  },
  greetingName: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#FDE68A",
  },
  greetingSubtext: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 6,
    lineHeight: 18,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING[16],
  },
  categoryCard: {
    backgroundColor: COLORS.neutral.white,
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderRadius: 16,
    padding: SPACING[20],
    width: "47%",
    minWidth: 140,
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 4px 16px -2px rgba(15, 44, 89, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)",
      },
    }),
  },
  categoryCardActive: {
    borderColor: "#1E40AF",
    borderWidth: 2,
    backgroundColor: "#F0F6FF",
    ...Platform.select({
      web: {
        boxShadow: "0 10px 25px -5px rgba(30, 64, 175, 0.18)",
      },
    }),
  },
  categoryImage: {
    width: 76,
    height: 76,
    marginBottom: SPACING[12],
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING[12],
  },
  categoryCardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
    marginBottom: 6,
    textAlign: "center",
  },
  categoryCardCount: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "#475569",
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: "hidden",
  },
});
