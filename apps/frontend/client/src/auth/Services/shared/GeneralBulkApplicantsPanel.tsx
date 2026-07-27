import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
import { GeneralApplicantData } from "./hooks/useGeneralServiceWizard";
import { NTCService } from "../data/servicesData";
import { styles } from "./GeneralBulkApplicantsPanel.styles";
import { GeneralDeleteApplicantModal } from "./components/GeneralDeleteApplicantModal";

interface GeneralBulkApplicantsPanelProps {
  applicants: GeneralApplicantData[];
  currentApplicantIndex: number;
  onSelectApplicant: (idx: number) => void;
  setStep: (step: number) => void;
  resetWizardState: () => void;
  onCancel: () => void;
  onRemoveApplicant: (idx: number) => void;
  onAddApplicant: () => void;
  service: NTCService;
}

export const isGeneralApplicantComplete = (app: GeneralApplicantData, service: NTCService): boolean => {
  if (!app.firstName || !app.lastName || !app.email || !app.contactNo) return false;
  const allUploaded = service.requirements.every((req) => !!app.uploads[req]);
  return allUploaded;
};

export function GeneralBulkApplicantsPanel({
  applicants,
  currentApplicantIndex,
  onSelectApplicant,
  onCancel,
  onRemoveApplicant,
  onAddApplicant,
  service,
}: GeneralBulkApplicantsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "COMPLETE" | "DRAFTS">("ALL");
  const [applicantToDelete, setApplicantToDelete] = useState<{ idx: number; name: string } | null>(null);

  const completeCount = applicants.filter((app) => isGeneralApplicantComplete(app, service)).length;
  const draftCount = applicants.length - completeCount;

  const filteredApplicants = applicants
    .map((app, originalIdx) => ({ app, originalIdx }))
    .filter(({ app }) => {
      const nameStr = `${app.firstName} ${app.lastName}`.trim();
      const matchesSearch = nameStr
        ? nameStr.toLowerCase().includes(searchQuery.toLowerCase())
        : "draft applicant".includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === "COMPLETE") return isGeneralApplicantComplete(app, service);
      if (activeTab === "DRAFTS") return !isGeneralApplicantComplete(app, service);
      return true;
    });

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Draft Applicants List</Text>
        <Text style={styles.headerSub}>Encode details manually for each applicant in the cohort.</Text>
      </View>

      {/* Tabs / Metrics */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab("ALL")}
          style={[styles.tabButton, activeTab === "ALL" && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, activeTab === "ALL" && styles.tabTextActive]}>
            All ({applicants.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("COMPLETE")}
          style={[styles.tabButton, activeTab === "COMPLETE" && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, activeTab === "COMPLETE" && styles.tabTextActive]}>
            Complete ({completeCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("DRAFTS")}
          style={[styles.tabButton, activeTab === "DRAFTS" && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, activeTab === "DRAFTS" && styles.tabTextActive]}>
            Drafts ({draftCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Filter */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={16} color="#9ca3af" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Filter drafts..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* List content */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {filteredApplicants.map(({ app, originalIdx }) => {
          const isSelected = originalIdx === currentApplicantIndex;
          const isComplete = isGeneralApplicantComplete(app, service);
          const fullName = `${app.firstName} ${app.lastName}`.trim() || `Draft Applicant #${app.id}`;

          return (
            <TouchableOpacity
              key={app.id}
              onPress={() => onSelectApplicant(originalIdx)}
              style={[
                styles.itemCard,
                isSelected && styles.itemCardSelected,
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, isSelected && styles.itemNameSelected]}>
                  {fullName}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 6 }}>
                  <Icon
                    name={isComplete ? "check-circle" : "alert-circle"}
                    size={13}
                    color={isComplete ? COLORS.semantic.success : COLORS.semantic.warning}
                  />
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: isComplete ? COLORS.semantic.success : COLORS.semantic.warning }}>
                    {isComplete ? "Complete" : "Incomplete Info"}
                  </Text>
                </View>
              </View>

              {applicants.length > 1 && (
                <TouchableOpacity
                  onPress={() => setApplicantToDelete({ idx: originalIdx, name: fullName })}
                  style={styles.deleteButton}
                >
                  <Icon name="trash-2" size={16} color={COLORS.semantic.error} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Actions footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={onAddApplicant}
          style={styles.addBtn}
        >
          <Icon name="plus" size={16} color={COLORS.brand[700]} style={{ marginRight: 6 }} />
          <Text style={styles.addBtnText}>Add Draft Applicant</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onCancel}
          style={[styles.submitBtn, { backgroundColor: COLORS.semantic.error }]}
        >
          <Text style={styles.submitBtnText}>Cancel Application</Text>
        </TouchableOpacity>
      </View>

      <GeneralDeleteApplicantModal
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
