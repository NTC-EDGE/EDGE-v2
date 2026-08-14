import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
import { ExamApplicantData } from "../index";
import { styles } from "./ExamBulkApplicantsPanel.styles";
import { ExamDeleteApplicantModal } from "./ExamDeleteApplicantModal";
import { ExamBulkApplicantCard } from "./ExamBulkApplicantCard";
import { isExamApplicantComplete } from "../helpers/validation";

interface ExamBulkApplicantsPanelProps {
  applicants: ExamApplicantData[];
  currentApplicantIndex: number;
  onSelectApplicant: (idx: number) => void;
  setStep: (step: number) => void;
  resetWizardState: () => void;
  onCancel: () => void;
  onRemoveApplicant: (idx: number) => void;
  bulkMethod?: "MANUAL" | "EXCEL";
  onAddApplicant?: () => void;
  onSubmitAll?: () => void;
}

export function ExamBulkApplicantsPanel({
  applicants,
  currentApplicantIndex,
  onSelectApplicant,
  setStep,
  onCancel,
  onRemoveApplicant,
  bulkMethod,
  onAddApplicant,
  onSubmitAll,
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

      {/* Add Applicant Action Button */}
      <View style={{ paddingHorizontal: 12, paddingTop: 4, paddingBottom: 8 }}>
        <TouchableOpacity
          onPress={onAddApplicant}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: COLORS.brand[600],
            paddingVertical: 9,
            paddingHorizontal: 14,
            borderRadius: 8,
            gap: 6,
          }}
        >
          <Icon name="plus" size={15} color="#ffffff" />
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: "#ffffff" }}>
            Add Applicant
          </Text>
        </TouchableOpacity>
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
          filteredApplicants.map(({ app, originalIdx }) => (
            <ExamBulkApplicantCard
              key={app.id}
              app={app}
              isSelected={currentApplicantIndex === originalIdx}
              originalIdx={originalIdx}
              bulkMethod={bulkMethod}
              onSelectApplicant={onSelectApplicant}
              setStep={setStep}
              onDeletePress={(idx, name) => {
                setApplicantToDelete({ idx, name });
              }}
            />
          ))
        )}
      </ScrollView>

      {/* Bottom Actions Footer */}
      <View style={{ padding: 16, borderTopWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#FFFFFF", gap: 10 }}>
        {onSubmitAll !== undefined && (
          <TouchableOpacity
            disabled={completeCount !== applicants.length || applicants.length === 0}
            onPress={onSubmitAll}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: completeCount === applicants.length && applicants.length > 0 ? "#16A34A" : "#94A3B8",
              borderRadius: 10,
              paddingVertical: 12,
              paddingHorizontal: 16,
              gap: 8,
              opacity: completeCount === applicants.length && applicants.length > 0 ? 1 : 0.7,
            }}
            activeOpacity={0.8}
          >
            <Icon name={completeCount === applicants.length && applicants.length > 0 ? "check-circle" : "lock"} size={16} color="#ffffff" />
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#ffffff" }}>
              {completeCount === applicants.length && applicants.length > 0
                ? `Submit All ${applicants.length} Applications`
                : `Complete All Applications to Submit (${completeCount}/${applicants.length})`}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            onPress={() => setStep(2)}
            style={[styles.backBtn, { flex: 1 }]}
            activeOpacity={0.8}
          >
            <Icon name="arrow-left" size={15} color="#0F2C59" style={{ marginRight: 6 }} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>

          {onAddApplicant && (
            <TouchableOpacity
              onPress={onAddApplicant}
              style={[styles.addBtn, { flex: 1 }]}
              activeOpacity={0.8}
            >
              <Icon name="plus" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.addBtnText}>Add Applicant</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ExamDeleteApplicantModal
        visible={applicantToDelete !== null}
        name={applicantToDelete?.name ?? ""}
        onCancel={() => setApplicantToDelete(null)}
        onConfirm={() => {
          if (applicantToDelete) {
            onRemoveApplicant(applicantToDelete.idx);
            setApplicantToDelete(null);
          }
        }}
      />
    </View>
  );
}
