import { StyleSheet, Platform } from "react-native";
import { COLORS, TYPOGRAPHY, SPACING } from "@edge/ui";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
    borderRightWidth: 1,
    borderRightColor: COLORS.neutral[200],
    ...Platform.select({
      web: {
        height: "calc(100vh - 64px)",
      },
    }),
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral[50],
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    borderRadius: 8,
    margin: 12,
    paddingHorizontal: 10,
    height: 38,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.neutral[700],
    fontFamily: TYPOGRAPHY.fonts.primary,
    padding: 0,
  },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    paddingHorizontal: 12,
  },
  tabBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: {
    borderBottomColor: COLORS.brand[600],
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[400],
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  tabBtnTextActive: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  listScroll: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyIllustration: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.neutral[50],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 13,
    color: COLORS.neutral[400],
    textAlign: "center",
    fontFamily: TYPOGRAPHY.fonts.primary,
    lineHeight: 18,
  },
  itemCard: {
    borderRadius: 10,
    backgroundColor: COLORS.neutral[50],
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    marginBottom: 12,
  },
  itemCardSelected: {
    borderColor: COLORS.brand[500],
    backgroundColor: "rgba(37, 99, 235, 0.04)",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
    fontFamily: TYPOGRAPHY.fonts.primary,
    flex: 1,
    marginRight: 8,
  },
  itemTitleSelected: {
    color: COLORS.brand[700],
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeComplete: {
    backgroundColor: "#dcfce7",
  },
  badgeDraft: {
    backgroundColor: "#ffedd5",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  badgeTextComplete: {
    color: "#166534",
  },
  badgeTextDraft: {
    color: "#9a3412",
  },
  itemSubtitle: {
    fontSize: 12,
    color: COLORS.neutral[400],
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral.white,
  },
  submitBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 42,
    borderRadius: 8,
  },
  submitBtnActive: {
    backgroundColor: COLORS.brand[600],
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.neutral[100],
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  submitBtnTextActive: {
    color: COLORS.neutral.white,
  },
  submitBtnTextDisabled: {
    color: COLORS.neutral[400],
  },
});
