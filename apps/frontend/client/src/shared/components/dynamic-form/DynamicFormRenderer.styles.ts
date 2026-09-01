import { StyleSheet } from "react-native";
import { TYPOGRAPHY } from "@edge/ui";

export const dynamicFormStyles = StyleSheet.create({
  container: { width: "100%", gap: 4 },
  sectionCard: { backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", padding: 24, marginBottom: 20, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  iconCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#1E3A8A", alignItems: "center", justifyContent: "center" },
  iconCircleText: { fontFamily: TYPOGRAPHY.fonts.primary, color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  sectionTitle: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: "700", color: "#0F172A", letterSpacing: -0.2 },
  sectionBadge: { backgroundColor: "#F1F5F9", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  sectionBadgeText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 10.5, fontWeight: "700", color: "#475569", letterSpacing: 0.5 },
});
