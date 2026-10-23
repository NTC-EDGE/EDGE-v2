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
import { useToast } from "../../../shared/components/Toast";
import {
  GeneralApplicantData,
  isGeneralApplicantComplete,
  ServiceRequirementItem,
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
  onRemoveApplicants?: (indices: number[]) => void;
  onAddApplicant: () => void;
  onApplicantsImported?: (applicants: GeneralApplicantData[]) => void;
  onSubmitAll?: () => void;
  service: NTCService;
  variantRequirements?: Array<ServiceRequirementItem | string>;
}

export function GeneralBulkApplicantsPanel({
  applicants,
  currentApplicantIndex,
  onSelectApplicant,
  setStep,
  onCancel,
  onRemoveApplicant,
  onRemoveApplicants,
  onAddApplicant,
  onApplicantsImported,
  onSubmitAll,
  service,
  variantRequirements = [],
}: GeneralBulkApplicantsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "COMPLETE" | "PENDING">("ALL");
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{
    visible: boolean;
    name?: string;
    count: number;
    isAll: boolean;
    indicesToDelete: number[];
  }>({
    visible: false,
    count: 0,
    isAll: false,
    indicesToDelete: [],
  });
  const [importLoading, setImportLoading] = useState(false);
  const toast = useToast();

  const completeCount = applicants.filter((app) => isGeneralApplicantComplete(app, service, variantRequirements)).length;
  const pendingCount = applicants.length - completeCount;

  const templateConfig = getSpreadsheetTemplateForService(service);

  const handleDownloadTemplate = () => {
    const csvContent = generateCsvContent(templateConfig);
    downloadCsvFile(templateConfig.filename, csvContent);
    toast.success("Template Downloaded", `Downloaded ${templateConfig.filename}.`);
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
      if (Platform.OS === "web" && asset?.file && typeof asset.file.text === "function") {
        fileText = await asset.file.text();
      } else if (asset?.uri) {
        const response = await fetch(asset.uri);
        fileText = await response.text();
      }

      if (fileText && fileText.trim().length > 0) {
        const parseResult = parseSpreadsheetContent(fileText, service);
        if (parseResult.totalRows === 0) {
          toast.error("No Records Found", "Could not parse applicant rows. Make sure the header columns match the template.");
          return;
        }

        if (parseResult.applicants.length > 0 && onApplicantsImported) {
          onApplicantsImported(parseResult.applicants);
        }

        if (parseResult.invalidCount > 0 && parseResult.validCount === 0) {
          toast.error("Import Failed", `All ${parseResult.totalRows} row(s) had formatting or validation errors.`);
        } else if (parseResult.invalidCount > 0) {
          toast.warning(
            "Partial Import Completed",
            `Populated ${parseResult.validCount} valid applicant(s). ${parseResult.invalidCount} invalid row(s) were excluded.`
          );
        } else {
          toast.success(
            "Spreadsheet Imported",
            `Successfully populated all ${parseResult.validCount} applicant entries into the filing cohort.`
          );
        }
      }
    } catch (err) {
      console.error("Failed to upload spreadsheet:", err);
      toast.error("Import Error", "Failed to parse the selected spreadsheet file.");
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

  const isAllFilteredSelected =
    filteredApplicants.length > 0 &&
    filteredApplicants.every(({ originalIdx }) => selectedIndices.has(originalIdx));

  const toggleSelectApplicant = (idx: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedIndices(new Set());
    } else {
      const allFiltered = new Set(filteredApplicants.map((item) => item.originalIdx));
      setSelectedIndices(allFiltered);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIndices.size === 0) return;
    const indices = Array.from(selectedIndices);
    setDeleteDialog({
      visible: true,
      count: indices.length,
      isAll: indices.length === applicants.length,
      indicesToDelete: indices,
    });
  };

  const handleConfirmDelete = () => {
    const indices = deleteDialog.indicesToDelete;
    const count = indices.length;
    try {
      if (onRemoveApplicants) {
        onRemoveApplicants(indices);
      } else {
        const sorted = [...indices].sort((a, b) => b - a);
        sorted.forEach((idx) => onRemoveApplicant(idx));
      }
      toast.success(
        "Applicants Removed",
        count === 1
          ? "Successfully removed 1 applicant from the cohort."
          : `Successfully removed ${count} applicants from the cohort.`
      );
    } catch (err) {
      console.error("Failed to delete applicants:", err);
      toast.error("Deletion Error", "An error occurred while removing selected applicants.");
    } finally {
      setSelectedIndices(new Set());
      setDeleteDialog({ visible: false, count: 0, isAll: false, indicesToDelete: [] });
    }
  };

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

      {/* Multi-Select & Batch Actions Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: "#F8FAFC",
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: "#E2E8F0",
        }}
      >
        <TouchableOpacity
          onPress={handleToggleSelectAll}
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          activeOpacity={0.7}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              borderWidth: 1.5,
              borderColor: isAllFilteredSelected ? "#2563EB" : "#94A3B8",
              backgroundColor: isAllFilteredSelected ? "#2563EB" : "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isAllFilteredSelected && <Icon name="check" size={12} color="#FFFFFF" />}
          </View>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "600", color: "#334155" }}>
            Select All ({filteredApplicants.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={selectedIndices.size === 0}
          onPress={handleDeleteSelected}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            backgroundColor: selectedIndices.size > 0 ? "#FEE2E2" : "#F1F5F9",
            borderWidth: 1,
            borderColor: selectedIndices.size > 0 ? "#FCA5A5" : "#E2E8F0",
            paddingVertical: 4,
            paddingHorizontal: 10,
            borderRadius: 6,
            opacity: selectedIndices.size > 0 ? 1 : 0.5,
          }}
          activeOpacity={0.7}
        >
          <Icon name="trash-2" size={13} color={selectedIndices.size > 0 ? "#DC2626" : "#94A3B8"} />
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 11,
              fontWeight: "700",
              color: selectedIndices.size > 0 ? "#DC2626" : "#94A3B8",
            }}
          >
            Delete Selected {selectedIndices.size > 0 ? `(${selectedIndices.size})` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {/* List content */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {filteredApplicants.length === 0 ? (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40, paddingHorizontal: 16 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Icon name="users" size={24} color="#94A3B8" />
            </View>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "700", color: "#334155", marginBottom: 4, textAlign: "center" }}>
              No applicants in cohort
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: "#64748B", textAlign: "center", marginBottom: 16 }}>
              Add an applicant or import from a spreadsheet to proceed.
            </Text>
            <TouchableOpacity
              onPress={onAddApplicant}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: "#1D4ED8",
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
              }}
              activeOpacity={0.8}
            >
              <Icon name="plus" size={14} color="#FFFFFF" />
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "600", color: "#FFFFFF" }}>
                Add Applicant
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredApplicants.map(({ app, originalIdx }) => {
            const isSelected = originalIdx === currentApplicantIndex;
            const isChecked = selectedIndices.has(originalIdx);
            const isComplete = isGeneralApplicantComplete(app, service, variantRequirements);
            const fullName = getApplicantDisplayName(app, originalIdx + 1);

            return (
              <TouchableOpacity
                key={app.id}
                onPress={() => onSelectApplicant(originalIdx)}
                style={[
                  styles.itemCard,
                  isSelected && styles.itemCardSelected,
                  { flexDirection: "row", alignItems: "center", gap: 10 },
                ]}
                activeOpacity={0.8}
              >
                {/* Row Selection Checkbox */}
                <TouchableOpacity
                  onPress={() => toggleSelectApplicant(originalIdx)}
                  style={{ padding: 4 }}
                  activeOpacity={0.7}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      borderWidth: 1.5,
                      borderColor: isChecked ? "#2563EB" : "#CBD5E1",
                      backgroundColor: isChecked ? "#2563EB" : "#FFFFFF",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isChecked && <Icon name="check" size={12} color="#FFFFFF" />}
                  </View>
                </TouchableOpacity>

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

                <TouchableOpacity
                  onPress={() => setDeleteDialog({
                    visible: true,
                    name: fullName,
                    count: 1,
                    isAll: false,
                    indicesToDelete: [originalIdx],
                  })}
                  style={styles.deleteButton}
                >
                  <Icon name="trash-2" size={16} color={COLORS.semantic.error} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
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
              opacity: completeCount === applicants.length && applicants.length > 0 ? 1 : 0.6,
            }}
            activeOpacity={0.8}
          >
            <Icon name={completeCount === applicants.length && applicants.length > 0 ? "check-circle" : "lock"} size={16} color="#ffffff" />
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#ffffff" }}>
              {applicants.length === 0
                ? "Add Applicants to Submit (0)"
                : completeCount === applicants.length
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
        visible={deleteDialog.visible}
        name={deleteDialog.name}
        count={deleteDialog.count}
        isAll={deleteDialog.isAll}
        onCancel={() => setDeleteDialog({ visible: false, count: 0, isAll: false, indicesToDelete: [] })}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
}
