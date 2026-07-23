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
        height: "100vh",
      },
    }),
  },
  header: {
    padding: SPACING[16],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  headerSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[500],
    marginTop: 4,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.neutral[50],
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  tabButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      },
    }),
  },
  tabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[500],
  },
  tabTextActive: {
    color: COLORS.brand[700],
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral[50],
    margin: 12,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  searchInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[900],
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1.5,
    borderColor: "transparent",
    marginBottom: 8,
  },
  itemCardSelected: {
    backgroundColor: COLORS.brand[100] + "22",
    borderColor: COLORS.brand[700],
  },
  itemName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[800],
  },
  itemNameSelected: {
    color: COLORS.brand[900],
  },
  deleteButton: {
    padding: 6,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
    gap: 8,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORS.brand[500],
    paddingVertical: 10,
    borderRadius: 24,
  },
  addBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.brand[700],
  },
  submitBtn: {
    backgroundColor: COLORS.brand[900],
    paddingVertical: 11,
    borderRadius: 24,
    alignItems: "center",
  },
  submitBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.neutral.white,
  },
});
