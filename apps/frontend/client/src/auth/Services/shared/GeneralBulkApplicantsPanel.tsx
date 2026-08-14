import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
import {
  GeneralApplicantData,
  isGeneralApplicantComplete,
} from "./hooks/useGeneralServiceWizard";
export { isGeneralApplicantComplete };
import { getApplicantDisplayName } from "./helpers/applicantDisplayHelper";
import { NTCService } from "../data/servicesData";
import { styles } from "./GeneralBulkApplicantsPanel.styles";
import { GeneralDeleteApplicantModal } from "./components/GeneralDeleteApplicantModal";
import {
  getSpreadsheetTemplateForService,
  generateCsvContent,
  downloadCsvFile,
  parseSpreadsheetContent,
} from "./spreadsheet";

interface GeneralBulkApplicantsPanelProps {
  applicants: GeneralApplicantData[];
  currentApplicantIndex: number;
  onSelectApplicant: (idx: number) => void;
  setStep: (step: number) => void;
  resetWizardState: () => void;
  onCancel: () => void;
  onRemoveApplicant: (idx: number) => void;
  onAddApplicant: () => void;
  onApplicantsImported?: (applicants: GeneralApplicantData[]) => void;
  onSubmitAll?: () => void;
  service: NTCService;
  variantRequirements?: string[];
}

export function GeneralBulkApplicantsPanel({
  applicants,
  currentApplicantIndex,
  onSelectApplicant,
  setStep,
  onCancel,
  onRemoveApplicant,
  onAddApplicant,
  onApplicantsImported,
  onSubmitAll,
  service,
  variantRequirements = [],
}: GeneralBulkApplicantsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "COMPLETE" | "PENDING">("ALL");
  const [applicantToDelete, setApplicantToDelete] = useState<{ idx: number; name: string } | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  const completeCount = applicants.filter((app) => isGeneralApplicantComplete(app, service, variantRequirements)).length;
  const pendingCount = applicants.length - completeCount;

  const templateConfig = getSpreadsheetTemplateForService(service);

  const handleDownloadTemplate = () => {
    const csvContent = generateCsvContent(templateConfig);
    downloadCsvFile(templateConfig.filename, csvContent);
  };

  const handleUploadSpreadsheet = async () => {
    try {
      setImportLoading(true);
      const DocumentPicker = await import("expo-document-picker");
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          "text/csv",
          "text/comma-separated-values",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/plain",
          "*/*",
        ],
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) return;

      const asset = res.assets[0];
      if (!asset) return;

      let fileText = "";
      if (Platform.OS === "web" && asset.file) {
        fileText = await asset.file.text();
      } else if (asset.uri) {
        const response = await fetch(asset.uri);
        fileText = await response.text();
      }

      if (fileText && fileText.trim().length > 0) {
        const parseResult = parseSpreadsheetContent(fileText, service);
        if (parseResult.applicants.length > 0 && onApplicantsImported) {
          onApplicantsImported(parseResult.applicants);
        }
        Alert.alert(
          "Spreadsheet Imported",
          `Populated ${parseResult.totalRows} applicant entries (${parseResult.validCount} valid) into the cohort.`
        );
      }
    } catch (err) {
      console.error("Failed to upload spreadsheet:", err);
      Alert.alert("Error", "Could not parse the selected file.");
    } finally {
      setImportLoading(false);
    }
  };

  const filteredApplicants = applicants
    .map((app, originalIdx) => ({ app, originalIdx }))
    .filter(({ app }) => {
      const nameStr = `${app.firstName} ${app.lastName}`.trim();
      const matchesSearch = nameStr
        ? nameStr.toLowerCase().includes(searchQuery.toLowerCase())
        : "applicant".includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const complete = isGeneralApplicantComplete(app, service, variantRequirements);
      if (activeTab === "COMPLETE") return complete;
      if (activeTab === "PENDING") return !complete;
      return true;
    });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Applicants List</Text>
        <Text style={styles.headerSub}>Select an applicant to fill their details and upload requirements.</Text>
      </View>

      {/* Bulk Spreadsheet Import */}
      <View
        style={{
          marginHorizontal: 12,
          marginBottom: 10,
          backgroundColor: "#EFF6FF",
          borderRadius: 10,
          padding: 12,
          borderWidth: 1,
          borderColor: "#BFDBFE",
        }}
      >
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: "#1E40AF", marginBottom: 8 }}>
          Bulk Spreadsheet Import
        </Text>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <TouchableOpacity
            onPress={handleDownloadTemplate}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#1D4ED8",
              borderRadius: 7,
              paddingVertical: 7,
              paddingHorizontal: 12,
            }}
          >
            <Icon name="download" size={13} color="#ffffff" style={{ marginRight: 5 }} />
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#ffffff" }}>
              Template
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleUploadSpreadsheet}
            disabled={importLoading}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#93C5FD",
              borderRadius: 7,
              paddingVertical: 7,
              paddingHorizontal: 12,
            }}
          >
            {importLoading ? (
              <ActivityIndicator size="small" color="#1D4ED8" style={{ marginRight: 5 }} />
            ) : (
              <Icon name="upload" size={13} color="#1D4ED8" style={{ marginRight: 5 }} />
            )}
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, fontWeight: "700", color: "#1D4ED8" }}>
              Import CSV
            </Text>
          </TouchableOpacity>
        </View>
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
          onPress={() => setActiveTab("PENDING")}
          style={[styles.tabButton, activeTab === "PENDING" && styles.tabButtonActive]}
        >
          <Text style={[styles.tabText, activeTab === "PENDING" && styles.tabTextActive]}>
            Pending ({pendingCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Filter */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={16} color="#9ca3af" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search applicants..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* List content */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {filteredApplicants.map(({ app, originalIdx }) => {
          const isSelected = originalIdx === currentApplicantIndex;
          const isComplete = isGeneralApplicantComplete(app, service, variantRequirements);
          const fullName = getApplicantDisplayName(app, originalIdx + 1);

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
                    {isComplete ? "Complete" : "Pending"}
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

          <TouchableOpacity
            onPress={onAddApplicant}
            style={[styles.addBtn, { flex: 1 }]}
            activeOpacity={0.8}
          >
            <Icon name="plus" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.addBtnText}>Add Applicant</Text>
          </TouchableOpacity>
        </View>
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
