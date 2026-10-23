import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, ActivityIndicator, Alert, Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Icon } from "@edge/ui";
import { useToast } from "../../../../shared/components/Toast";
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS } from "../../../../shared/theme/tokens";
import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";
import { getSpreadsheetTemplateForService, generateCsvContent } from "./spreadsheetTemplates";
import { downloadCsvFile } from "./fileDownloadHelper";
import { parseSpreadsheetContent, CsvParseResult } from "./csvParser";

interface BulkSpreadsheetImportSectionProps {
  service: NTCService;
  appMode: "SINGLE" | "BULK" | "";
  setAppMode: (mode: "SINGLE" | "BULK") => void;
  bulkMethod: "MANUAL" | "EXCEL";
  setBulkMethod: (method: "MANUAL" | "EXCEL") => void;
  isFileUploaded: boolean;
  setIsFileUploaded: (val: boolean) => void;
  uploadedFileName: string;
  setUploadedFileName: (name: string) => void;
  onApplicantsImported: (applicants: GeneralApplicantData[]) => void;
}

export function BulkSpreadsheetImportSection({
  service,
  appMode,
  setAppMode,
  bulkMethod,
  setBulkMethod,
  isFileUploaded,
  setIsFileUploaded,
  uploadedFileName,
  setUploadedFileName,
  onApplicantsImported,
}: BulkSpreadsheetImportSectionProps) {
  const [loading, setLoading] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);

  const templateConfig = getSpreadsheetTemplateForService(service);
  const toast = useToast();

  // ── Download Template Handler ───────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const csvData = generateCsvContent(templateConfig);
    downloadCsvFile(templateConfig.filename, csvData);
    toast.success("Template Downloaded", `Downloaded ${templateConfig.filename}.`);
  };

  // ── File Pick & Parse Handler ───────────────────────────────────────────────
  const handlePickSpreadsheet = async () => {
    try {
      setLoading(true);
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

      if (res.canceled || !res.assets || res.assets.length === 0) {
        setLoading(false);
        return;
      }

      const asset = res.assets[0];
      if (!asset) {
        setLoading(false);
        return;
      }

      setUploadedFileName(asset?.name || "uploaded_spreadsheet.csv");

      let fileText = "";
      if (Platform.OS === "web" && asset?.file && typeof asset.file.text === "function") {
        fileText = await asset.file.text();
      } else if (asset?.uri) {
        const response = await fetch(asset.uri);
        fileText = await response.text();
      }

      if (!fileText || fileText.trim().length === 0) {
        toast.error("Empty File", "The selected file is empty. Please upload a valid CSV file with applicant data.");
        setLoading(false);
        return;
      }

      const result = parseSpreadsheetContent(fileText, service);
      if (result.totalRows === 0) {
        toast.error("No Records Found", "Could not parse applicant rows. Make sure the header columns match the official template.");
        setLoading(false);
        return;
      }

      setParseResult(result);
      setIsFileUploaded(true);
      setPreviewModalOpen(true);

      if (result.invalidCount > 0 && result.validCount === 0) {
        toast.error("Invalid Spreadsheet Data", `All ${result.totalRows} detected row(s) failed validation. Review the errors below.`);
      } else if (result.invalidCount > 0) {
        toast.warning("Partial Validation Notice", `Found ${result.validCount} valid row(s) and ${result.invalidCount} invalid row(s). Only valid rows will be imported.`);
      } else {
        toast.success("Spreadsheet Parsed", `All ${result.validCount} applicant row(s) are valid and ready to import.`);
      }
    } catch (err) {
      console.error("Failed to parse spreadsheet:", err);
      toast.error("Import Error", "Failed to parse the uploaded file. Please verify CSV formatting and encoding.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyApplicants = () => {
    if (!parseResult || parseResult.applicants.length === 0) {
      toast.error("Cannot Import", "There are no valid applicant entries to import into the filing cohort.");
      return;
    }

    onApplicantsImported(parseResult.applicants);
    setPreviewModalOpen(false);

    if (parseResult.invalidCount > 0) {
      toast.warning(
        "Partial Import Completed",
        `Successfully populated ${parseResult.validCount} valid applicant(s). ${parseResult.invalidCount} row(s) had errors and were skipped.`
      );
    } else {
      toast.success(
        "Import Successful",
        `Successfully populated all ${parseResult.validCount} applicant entries into the filing cohort.`
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionSubtitle}>SELECT YOUR BULK DATA ENTRY METHOD</Text>
      <Text style={styles.infoDesc}>
        Choose between manually entering applicant profiles or importing an Excel / CSV spreadsheet template.
      </Text>

      {/* Mode Selection Cards */}
      <View style={styles.cardsRow}>
        {/* Option A: Manual Encoding */}
        <TouchableOpacity
          onPress={() => {
            setAppMode("BULK");
            setBulkMethod("MANUAL");
          }}
          style={[
            styles.configCard,
            appMode === "BULK" && bulkMethod === "MANUAL" && styles.configCardActive,
          ]}
        >
          <View
            style={[
              styles.badgeCircle,
              appMode === "BULK" && bulkMethod === "MANUAL" && styles.badgeCircleActive,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                appMode === "BULK" && bulkMethod === "MANUAL" && styles.badgeTextActive,
              ]}
            >
              A
            </Text>
          </View>
          <Text style={styles.cardTitle}>MANUAL ENCODING BOARD</Text>
          <Text style={styles.cardDesc}>
            Directly input each applicant's personal details, documents, and service options within the portal interface.
          </Text>
          <View
            style={[
              styles.cardBtn,
              appMode === "BULK" && bulkMethod === "MANUAL" && styles.cardBtnActive,
            ]}
          >
            <Text
              style={[
                styles.cardBtnText,
                appMode === "BULK" && bulkMethod === "MANUAL" && styles.cardBtnTextActive,
              ]}
            >
              {appMode === "BULK" && bulkMethod === "MANUAL" ? "ACTIVE" : "SELECT MANUAL"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Option B: Excel/CSV Import */}
        <TouchableOpacity
          onPress={() => {
            setAppMode("BULK");
            setBulkMethod("EXCEL");
          }}
          style={[
            styles.configCard,
            appMode === "BULK" && bulkMethod === "EXCEL" && styles.configCardActive,
          ]}
        >
          <View
            style={[
              styles.badgeCircle,
              appMode === "BULK" && bulkMethod === "EXCEL" && styles.badgeCircleActive,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                appMode === "BULK" && bulkMethod === "EXCEL" && styles.badgeTextActive,
              ]}
            >
              B
            </Text>
          </View>
          <Text style={styles.cardTitle}>EXCEL / CSV IMPORT</Text>
          <Text style={styles.cardDesc}>
            Download our official pre-formatted spreadsheet template, fill it out in Excel/Sheets, and upload to auto-populate all entries.
          </Text>
          <View
            style={[
              styles.cardBtn,
              appMode === "BULK" && bulkMethod === "EXCEL" && styles.cardBtnActive,
            ]}
          >
            <Text
              style={[
                styles.cardBtnText,
                appMode === "BULK" && bulkMethod === "EXCEL" && styles.cardBtnTextActive,
              ]}
            >
              {appMode === "BULK" && bulkMethod === "EXCEL" ? "ACTIVE" : "SELECT SPREADSHEET IMPORT"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Spreadsheet Actions & Schema Spec (Visible when Option B is selected) */}
      {appMode === "BULK" && bulkMethod === "EXCEL" && (
        <View style={{ marginTop: 16 }}>
          {/* Action Buttons Toolbar */}
          <View style={styles.bulkActionRow}>
            <TouchableOpacity onPress={handleDownloadTemplate} style={styles.downloadBtn}>
              <Icon name="download" size={16} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.downloadBtnText}>Download Template Spreadsheet (.csv)</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePickSpreadsheet} disabled={loading} style={styles.uploadBtn}>
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.brand[800]} style={{ marginRight: 8 }} />
              ) : (
                <Icon name="upload" size={16} color={COLORS.neutral[800]} style={{ marginRight: 8 }} />
              )}
              <Text style={styles.uploadBtnText}>
                {isFileUploaded ? `Re-upload (${uploadedFileName})` : "Upload Filled Excel/CSV"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* If file uploaded, show preview button */}
          {parseResult && (
            <TouchableOpacity onPress={() => setPreviewModalOpen(true)} style={styles.previewBtn}>
              <Icon name="eye" size={16} color={COLORS.brand[800]} style={{ marginRight: 6 }} />
              <Text style={styles.previewBtnText}>
                View Parsed Results ({parseResult.validCount} Valid, {parseResult.invalidCount} Invalid)
              </Text>
            </TouchableOpacity>
          )}

          {/* Required Schema Card */}
          <View style={styles.specCard}>
            <View style={styles.specTitleWrapper}>
              <Icon name="file-text" size={18} color={COLORS.brand[800]} />
              <Text style={styles.specTitle}>SPREADSHEET SCHEMA SPECIFICATION</Text>
            </View>
            <Text style={styles.specDesc}>
              {templateConfig.description} Column names in row 1 must match the expected headers below:
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ marginTop: 10 }}>
              <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                  {templateConfig.headers.slice(0, 8).map((h, i) => (
                    <Text key={i} style={styles.tableCellHeader}>
                      {h}
                    </Text>
                  ))}
                  {templateConfig.headers.length > 8 && (
                    <Text style={styles.tableCellHeader}>
                      ... {templateConfig.headers.length - 8} more columns
                    </Text>
                  )}
                </View>
                {templateConfig.sampleRows.slice(0, 2).map((row, rIdx) => (
                  <View key={rIdx} style={styles.tableRow}>
                    {row.slice(0, 8).map((cell, cIdx) => (
                      <Text key={cIdx} style={styles.tableCell} numberOfLines={1}>
                        {cell || "—"}
                      </Text>
                    ))}
                    {row.length > 8 && <Text style={styles.tableCell}>...</Text>}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Real-time Import Preview Modal */}
      <Modal visible={previewModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Spreadsheet Ingestion Preview</Text>
                <Text style={styles.modalSub}>
                  {uploadedFileName} • {parseResult?.totalRows || 0} Total Rows Detected
                </Text>
              </View>
              <TouchableOpacity onPress={() => setPreviewModalOpen(false)} style={styles.closeBtn}>
                <Icon name="x" size={20} color={COLORS.neutral[600]} />
              </TouchableOpacity>
            </View>

            {/* Metrics Chips */}
            <View style={styles.metricsRow}>
              <View style={[styles.metricBadge, { backgroundColor: "#dcfce7", borderColor: "#bbf7d0" }]}>
                <Text style={[styles.metricText, { color: "#166534" }]}>
                  ✔ {parseResult?.validCount || 0} Valid Rows
                </Text>
              </View>
              <View style={[styles.metricBadge, { backgroundColor: "#fee2e2", borderColor: "#fecaca" }]}>
                <Text style={[styles.metricText, { color: "#991b1b" }]}>
                  ⚠ {parseResult?.invalidCount || 0} Invalid Rows
                </Text>
              </View>
            </View>

            {/* Rows Table */}
            <ScrollView style={{ maxHeight: 380, marginVertical: 12 }}>
              {parseResult?.results.map((r) => (
                <View key={r.rowNumber} style={styles.previewRowCard}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={styles.rowName}>
                      #{r.rowNumber} - {r.name}
                    </Text>
                    <View
                      style={[
                        styles.statusTag,
                        r.status === "Valid" ? styles.statusValid : styles.statusInvalid,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusTagText,
                          r.status === "Valid" ? { color: "#15803d" } : { color: "#b91c1c" },
                        ]}
                      >
                        {r.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.rowEmail}>{r.email}</Text>
                  {r.remarks.length > 0 && (
                    <View style={{ marginTop: 6 }}>
                      {r.remarks.map((rem, remIdx) => (
                        <Text key={remIdx} style={styles.errorRemark}>
                          • {rem}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setPreviewModalOpen(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleApplyApplicants} style={styles.modalApplyBtn}>
                <Icon name="check" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.modalApplyText}>
                  Populate {parseResult?.applicants.length || 0} Entries to Filing Cohort
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
    width: "100%",
  },
  sectionSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[500],
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[700],
    marginBottom: 16,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  configCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 2,
    borderColor: COLORS.neutral[200],
    padding: 20,
    ...SHADOWS.card,
  },
  configCardActive: {
    borderColor: COLORS.brand[800],
    backgroundColor: "#f0f7ff",
  },
  badgeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.neutral[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  badgeCircleActive: {
    backgroundColor: COLORS.brand[800],
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[700],
  },
  badgeTextActive: {
    color: "#ffffff",
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: 6,
  },
  cardDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
    lineHeight: 18,
    marginBottom: 16,
    minHeight: 54,
  },
  cardBtn: {
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.button,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: COLORS.neutral.white,
  },
  cardBtnActive: {
    backgroundColor: COLORS.brand[800],
    borderColor: COLORS.brand[800],
  },
  cardBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[700],
  },
  cardBtnTextActive: {
    color: "#ffffff",
  },
  bulkActionRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.brand[800],
    borderRadius: RADIUS.button,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    minWidth: 240,
  },
  downloadBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#ffffff",
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.button,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    minWidth: 240,
  },
  uploadBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
  },
  previewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: RADIUS.button,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  previewBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[800],
  },
  specCard: {
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.card,
    padding: 16,
    ...SHADOWS.card,
  },
  specTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  specTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[800],
    letterSpacing: 0.5,
  },
  specDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
    lineHeight: 18,
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.input,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  tableCellHeader: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[700],
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: 140,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: COLORS.neutral[100],
  },
  tableCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[600],
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: 140,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    width: "100%",
    maxWidth: 700,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    padding: 24,
    ...SHADOWS.modal,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingBottom: 12,
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  modalSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  metricBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
  },
  metricText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  previewRowCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.input,
    padding: 12,
    marginBottom: 8,
  },
  rowName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
  },
  rowEmail: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusValid: {
    backgroundColor: "#dcfce7",
  },
  statusInvalid: {
    backgroundColor: "#fee2e2",
  },
  statusTagText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  errorRemark: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.semantic.error,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    borderTopWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingTop: 16,
    marginTop: 8,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
  },
  modalCancelText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[700],
  },
  modalApplyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.brand[800],
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: RADIUS.button,
  },
  modalApplyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#ffffff",
  },
});
