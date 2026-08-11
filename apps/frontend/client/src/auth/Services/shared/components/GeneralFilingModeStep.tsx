import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
import { Select } from "../../../../shared/components/Select";
import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";
import {
  getSpreadsheetTemplateForService,
  generateCsvContent,
  downloadCsvFile,
  parseSpreadsheetContent,
} from "../spreadsheet";

interface GeneralFilingModeStepProps {
  service: NTCService;
  appMode: "SINGLE" | "BULK" | "";
  onAppModeChange: (mode: "SINGLE" | "BULK") => void;
  bulkMethod?: "MANUAL" | "EXCEL";
  setBulkMethod?: (method: "MANUAL" | "EXCEL") => void;
  isFileUploaded?: boolean;
  setIsFileUploaded?: (val: boolean) => void;
  uploadedFileName?: string;
  setUploadedFileName?: (name: string) => void;
  onApplicantsImported?: (applicants: GeneralApplicantData[]) => void;
}

export function GeneralFilingModeStep({
  service,
  appMode,
  onAppModeChange,
  isFileUploaded,
  setIsFileUploaded,
  uploadedFileName,
  setUploadedFileName,
  onApplicantsImported,
}: GeneralFilingModeStepProps) {
  const [loading, setLoading] = useState(false);

  const templateConfig = getSpreadsheetTemplateForService(service);

  const handleDownloadTemplate = () => {
    const csvContent = generateCsvContent(templateConfig);
    downloadCsvFile(templateConfig.filename, csvContent);
  };

  const handleUploadSpreadsheet = async () => {
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

      if (setUploadedFileName) {
        setUploadedFileName(asset.name || "applicants_template.csv");
      }

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
        if (setIsFileUploaded) {
          setIsFileUploaded(true);
        }
        Alert.alert(
          "Spreadsheet Imported",
          `Populated ${parseResult.totalRows} applicant entries (${parseResult.validCount} valid) into the system.`
        );
      }
    } catch (err) {
      console.error("Failed to upload spreadsheet:", err);
      Alert.alert("Error", "Could not parse the selected file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, color: COLORS.neutral[700], marginBottom: 8 }}>
        Filing Mode
      </Text>
      <Select
        placeholder="Filing Mode"
        value={appMode}
        onValueChange={(val) => {
          if (val === "SINGLE" || val === "BULK") {
            onAppModeChange(val);
          }
        }}
        options={[
          { label: "Single Application", value: "SINGLE" },
          { label: "Bulk Application", value: "BULK" },
        ]}
      />

      {/* Simple Download & Upload Buttons when Bulk Application is selected */}
      {appMode === "BULK" && (
        <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderColor: COLORS.neutral[200] }}>
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "600", color: COLORS.neutral[800], marginBottom: 12 }}>
            Bulk Spreadsheet Import
          </Text>

          <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
            <TouchableOpacity
              onPress={handleDownloadTemplate}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: COLORS.brand[800],
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 16,
              }}
            >
              <Icon name="download" size={16} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: "#ffffff" }}>
                Download Template (.csv)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleUploadSpreadsheet}
              disabled={loading}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: COLORS.neutral.white,
                borderWidth: 1,
                borderColor: COLORS.neutral[300],
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 16,
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.brand[800]} style={{ marginRight: 8 }} />
              ) : (
                <Icon name="upload" size={16} color={COLORS.neutral[800]} style={{ marginRight: 8 }} />
              )}
              <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: COLORS.neutral[800] }}>
                {isFileUploaded ? `Uploaded (${uploadedFileName || "Spreadsheet"}) ✔` : "Upload Spreadsheet (.csv / Excel)"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
