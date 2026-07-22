import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { Icon, COLORS, TYPOGRAPHY, SPACING } from "@edge/ui";
import { ExamApplicantData } from "../index";

interface ExamBulkApplicantsPanelProps {
  applicants: ExamApplicantData[];
  currentApplicantIndex: number;
  onSelectApplicant: (idx: number) => void;
  setStep: (step: number) => void;
  resetWizardState: () => void;
  onSubmitPress: () => void;
  onRemoveApplicant: (idx: number) => void;
}

export const isExamApplicantComplete = (app: ExamApplicantData): boolean => {
  const emailVal = app.email;
  const contactNoVal = app.contactNo;

  // 1. Check Application Type Selection
  if (!app.selectedOption) return false;

  // 2. Check Form Details
  const formComplete = !!(
    app.lastName &&
    app.firstName &&
    app.birthMonth &&
    app.birthDay &&
    app.birthYear &&
    app.sex &&
    app.nationality &&
    app.province &&
    app.city &&
    app.barangay &&
    app.street &&
    app.zipCode &&
    app.schoolName &&
    app.courseDegree &&
    app.yearGraduated &&
    emailVal &&
    emailVal.includes("@") &&
    contactNoVal &&
    /^\d+$/.test(contactNoVal)
  );
  if (!formComplete) return false;

  // 3. Check Uploads Complete
  const totalRequired = app.examineeType === "Upgrader" ? 4 : 3;
  const uploadedCount = Object.keys(app.uploads).length;
  if (uploadedCount < totalRequired) return false;

  return true;
};

export function ExamBulkApplicantsPanel({
  applicants,
  currentApplicantIndex,
  onSelectApplicant,
  setStep,
  onSubmitPress,
  onRemoveApplicant,
}: ExamBulkApplicantsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "COMPLETE" | "DRAFTS">("ALL");
  const [applicantToDelete, setApplicantToDelete] = useState<{ idx: number; name: string } | null>(null);

  const completeCount = applicants.filter(isExamApplicantComplete).length;
  const draftCount = applicants.length - completeCount;

  // Filter items safely
  const filteredApplicants = applicants
    .map((app, originalIdx) => ({ app, originalIdx }))
    .filter(({ app }) => {
      const nameStr = `${app.firstName} ${app.lastName}`.trim();
      const matchesSearch = nameStr
        ? nameStr.toLowerCase().includes(searchQuery.toLowerCase())
        : "draft applicant".includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === "COMPLETE") return isExamApplicantComplete(app);
      if (activeTab === "DRAFTS") return !isExamApplicantComplete(app);
      return true;
    });

  const isAllComplete = applicants.length > 0 && completeCount === applicants.length;

  return (
    <View style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchWrapper}>
        <Icon name="search" size={16} color={COLORS.neutral[400]} style={styles.searchIcon} />
        <TextInput
          placeholder="Search applicant..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.neutral[400]}
          style={styles.searchInput}
        />
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab("ALL")}
          style={[styles.tabBtn, activeTab === "ALL" && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, activeTab === "ALL" && styles.tabBtnTextActive]}>
            All ({applicants.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("COMPLETE")}
          style={[styles.tabBtn, activeTab === "COMPLETE" && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, activeTab === "COMPLETE" && styles.tabBtnTextActive]}>
            Complete ({completeCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("DRAFTS")}
          style={[styles.tabBtn, activeTab === "DRAFTS" && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, activeTab === "DRAFTS" && styles.tabBtnTextActive]}>
            Drafts ({draftCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List / Empty State */}
      <ScrollView contentContainerStyle={styles.listScroll} showsVerticalScrollIndicator={false}>
        {filteredApplicants.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIllustration}>
              <Icon name="file" size={48} color={COLORS.neutral[300]} />
            </View>
            <Text style={styles.emptyTitle}>No applications yet — add one to get started</Text>
          </View>
        ) : (
          filteredApplicants.map(({ app, originalIdx }) => {
            const isSelected = currentApplicantIndex === originalIdx;
            const complete = isExamApplicantComplete(app);
            const fullName = `${app.firstName} ${app.lastName}`.trim();

            const uploadedCount = Object.keys(app.uploads).length;
            const totalRequired = app.examineeType === "Upgrader" ? 4 : 3;

            return (
              <View
                key={app.id}
                style={[
                  styles.itemCard,
                  isSelected && styles.itemCardSelected,
                  { flexDirection: "row", alignItems: "center" }
                ]}
              >
                <TouchableOpacity
                  onPress={() => onSelectApplicant(originalIdx)}
                  style={{ flex: 1, padding: 14 }}
                >
                  <View style={styles.itemHeader}>
                    <Text style={[styles.itemTitle, isSelected && styles.itemTitleSelected]} numberOfLines={1}>
                      {fullName || `Draft Applicant ${app.id}`}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={{ fontSize: 11, color: COLORS.neutral[400], fontWeight: "600" }}>
                        {uploadedCount}/{totalRequired}
                      </Text>
                      <Icon
                        name="check-circle"
                        size={14}
                        color={complete ? "#10b981" : COLORS.neutral[300]}
                      />
                    </View>
                  </View>
                  <Text style={styles.itemSubtitle} numberOfLines={1}>
                    {app.examineeType} • {app.examType}-{app.selectedOption}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setApplicantToDelete({
                      idx: originalIdx,
                      name: fullName || `Draft Applicant ${app.id}`,
                    });
                  }}
                  style={{ padding: 14, justifyContent: "center", alignItems: "center" }}
                >
                  <Icon name="trash" size={16} color={COLORS.semantic.error} />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Bottom Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          disabled={!isAllComplete}
          onPress={onSubmitPress}
          style={[
            styles.submitBtn,
            isAllComplete ? styles.submitBtnActive : styles.submitBtnDisabled,
          ]}
        >
          <Icon
            name={isAllComplete ? "check-circle" : "lock"}
            size={16}
            color={isAllComplete ? COLORS.neutral.white : COLORS.neutral[400]}
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.submitBtnText,
              isAllComplete ? styles.submitBtnTextActive : styles.submitBtnTextDisabled,
            ]}
          >
            SUBMIT ({applicants.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal visible={applicantToDelete !== null} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 }}>
          <View style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 24, width: "100%", maxWidth: 400 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 18, fontWeight: "700", color: COLORS.neutral[900], marginBottom: 8 }}>
              Remove Applicant
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13.5, color: COLORS.neutral[600], marginBottom: 24, lineHeight: 20 }}>
              Are you sure you want to remove <Text style={{ fontWeight: "700" }}>{applicantToDelete?.name}</Text> from the bulk list? This action cannot be undone.
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setApplicantToDelete(null)}
                style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: COLORS.neutral[300] }}
              >
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: COLORS.neutral[700] }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (applicantToDelete) {
                    onRemoveApplicant(applicantToDelete.idx);
                    setApplicantToDelete(null);
                  }
                }}
                style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: COLORS.semantic.error }}
              >
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: "#ffffff" }}>
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
    borderRightWidth: 1,
    borderRightColor: COLORS.neutral[200],
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: COLORS.neutral[50],
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.neutral[800],
    fontFamily: TYPOGRAPHY.fonts.primary,
    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }),
  },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    paddingHorizontal: 16,
  },
  tabBtn: {
    flex: 1,
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
